/**
 * Boss Encounter Service - Phase 14, Wave 14.2
 *
 * Handles boss fight logic, session management, and rewards
 */

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import {
  BossEncounter as BossEncounterDoc,
  IBossEncounter,
  BossDiscovery,
  IBossDiscovery,
} from '../models/BossEncounter.model';
import { Character, ICharacter } from '../models/Character.model';
import { EnergyService } from './energy.service';
import { DollarService } from './dollar.service';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import {
  BossEncounter,
  BossSession,
  BossAvailability,
  BossEncounterResult,
  BossCombatRound,
  BossAttackRequest,
  BossAttackResponse,
  BOSS_CONSTANTS,
  calculateBossHealth,
  calculateBossDamage,
  getCurrentPhase,
  checkSpawnConditions,
  ItemDrop,
  SkillCategory,
  SKILLS,
} from '@desperados/shared';
import { getBossById } from '../data/bosses';
import { BossPhaseService } from './bossPhase.service';
import { SecureRNG } from './base/SecureRNG';
import logger from '../utils/logger';
import { withLock } from '../utils/distributedLock';

export class BossEncounterService {
  /**
   * Check if a boss is available for a character
   */
  static async checkAvailability(
    characterId: string,
    bossId: string
  ): Promise<BossAvailability> {
    const boss = getBossById(bossId);
    if (!boss) {
      return {
        bossId,
        available: false,
        reason: 'Boss not found',
        requirements: { met: false, missing: ['Boss does not exist'] },
      };
    }

    const character = await Character.findById(characterId);
    if (!character) {
      return {
        bossId,
        available: false,
        reason: 'Character not found',
        requirements: { met: false },
      };
    }

    // Check spawn conditions (use Combat Level for boss fights)
    const conditionCheck = checkSpawnConditions(
      boss.spawnConditions,
      character.combatLevel || 1,
      character
    );

    if (!conditionCheck.met) {
      return {
        bossId,
        available: false,
        reason: 'Requirements not met',
        requirements: conditionCheck,
      };
    }

    // Check cooldown
    const discovery = await BossDiscovery.findOrCreate(characterId, bossId);
    if (discovery.lastVictoryAt) {
      const cooldownEnd = new Date(
        discovery.lastVictoryAt.getTime() + boss.respawnCooldown * 60 * 60 * 1000
      );
      const now = new Date();

      if (now < cooldownEnd) {
        const remainingHours = (cooldownEnd.getTime() - now.getTime()) / (60 * 60 * 1000);
        return {
          bossId,
          available: false,
          reason: 'Boss on cooldown',
          requirements: { met: false },
          cooldown: {
            active: true,
            remainingHours: Math.ceil(remainingHours),
            availableAt: cooldownEnd,
          },
        };
      }
    }

    return {
      bossId,
      available: true,
      requirements: { met: true },
    };
  }

  /**
   * Initiate a boss encounter
   */
  static async initiateBossEncounter(
    characterId: string,
    bossId: string,
    location: string,
    partyMemberIds?: string[]
  ): Promise<{ session: BossSession; boss: BossEncounter }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get boss data
      const boss = getBossById(bossId);
      if (!boss) {
        throw new Error('Boss not found');
      }

      // Check availability
      const availability = await this.checkAvailability(characterId, bossId);
      if (!availability.available) {
        throw new Error(availability.reason || 'Boss not available');
      }

      // Get character
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      // Check for active encounter
      const existingEncounter = await BossEncounterDoc.findActiveByCharacter(characterId);
      if (existingEncounter) {
        throw new Error('Already in a boss encounter');
      }

      // Deduct energy
      const energyCost = boss.playerLimit.max > 1
        ? BOSS_CONSTANTS.RAID_BOSS_INITIATE_COST
        : BOSS_CONSTANTS.BOSS_INITIATE_COST;

      const hasEnergy = await EnergyService.spendEnergy(characterId, energyCost);
      if (!hasEnergy) {
        throw new Error('Insufficient energy');
      }

      // Build party
      const allCharacterIds = [characterId, ...(partyMemberIds || [])];
      const playerCount = allCharacterIds.length;

      // Validate party size
      if (playerCount < boss.playerLimit.min || playerCount > boss.playerLimit.max) {
        throw new Error(
          `This boss requires ${boss.playerLimit.min}-${boss.playerLimit.max} players`
        );
      }

      // Calculate scaled boss stats
      const scaledHealth = calculateBossHealth(boss.health, playerCount, boss.scaling);
      const scaledDamage = calculateBossDamage(boss.damage, playerCount, boss.scaling);

      // Create session ID
      const sessionId = uuidv4();

      // Initialize player states
      const playerStates = new Map();
      for (const charId of allCharacterIds) {
        const char = await Character.findById(charId).session(session);
        if (!char) continue;

        const maxHP = this.getCharacterMaxHP(char);
        playerStates.set(charId, {
          characterId: char._id,
          health: maxHP,
          maxHealth: maxHP,
          statusEffects: [],
          damageDealt: 0,
          damageTaken: 0,
          isAlive: true,
        });
      }

      // Create encounter document
      const encounterDoc = new BossEncounterDoc({
        bossId: boss.id,
        sessionId,
        characterIds: allCharacterIds.map(id => new mongoose.Types.ObjectId(id)),
        playerStates,
        currentPhase: 1,
        bossHealth: scaledHealth,
        bossMaxHealth: scaledHealth,
        turnCount: 0,
        roundHistory: [],
        abilityCooldowns: new Map(),
        minions: [],
        location,
        status: 'active',
        startedAt: new Date(),
        enrageAt: boss.enrageTimer
          ? new Date(Date.now() + boss.enrageTimer * 60 * 1000)
          : undefined,
      });

      await encounterDoc.save({ session });

      // Update discovery
      const discovery = await BossDiscovery.findOrCreate(characterId, bossId);
      if (!discovery.discovered) {
        discovery.discovered = true;
        discovery.discoveredAt = new Date();
        discovery.discoveryMethod = 'encounter';
      }
      discovery.encounterCount += 1;
      discovery.lastEncounteredAt = new Date();
      await discovery.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`Boss encounter initiated: ${boss.name} by ${character.name}`);

      // Build session object
      const bossSession: BossSession = {
        sessionId,
        bossId: boss.id,
        characterIds: allCharacterIds,
        currentPhase: 1,
        bossHealth: scaledHealth,
        bossMaxHealth: scaledHealth,
        turnCount: 0,
        playerStates: Object.fromEntries(playerStates),
        abilityCooldowns: new Map(),
        environmentalHazards: [],
        minions: [],
        startedAt: new Date(),
        enrageAt: encounterDoc.enrageAt,
        location,
      };

      return { session: bossSession, boss };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Process boss attack turn
   */
  static async processBossAttack(
    sessionId: string,
    characterId: string,
    action: BossAttackRequest
  ): Promise<BossAttackResponse> {
    // Use distributed lock to prevent concurrent attacks on the same encounter
    return withLock(`lock:encounter:${sessionId}`, async () => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Get encounter
        const encounter = await BossEncounterDoc.findOne({ sessionId }).session(session);
        if (!encounter) {
          throw new Error('Boss encounter not found');
        }

        // Verify character is in encounter
        if (!encounter.characterIds.some(id => id.toString() === characterId)) {
          throw new Error('You are not in this encounter');
        }

        // Get boss data
        const boss = getBossById(encounter.bossId);
        if (!boss) {
          throw new Error('Boss data not found');
        }

        // Check if encounter is still active
        if (encounter.status !== 'active') {
          throw new Error('Encounter is not active');
        }

        // Check enrage timer
        if (encounter.enrageAt && new Date() > encounter.enrageAt) {
          encounter.status = 'timeout';
          encounter.endedAt = new Date();
          await encounter.save({ session });
          await session.commitTransaction();
          session.endSession();

          return {
            success: false,
            combatEnded: true,
            message: 'Boss enraged and wiped the party!',
          };
        }

        // Process player action and boss response
        const round = await BossPhaseService.processCombatRound(
          encounter,
          boss,
          characterId,
          action,
          session
        );

        // Update encounter
        encounter.turnCount += 1;
        encounter.roundHistory.push(round as any);

        // Check for victory/defeat
        let combatEnded = false;
        let result: BossEncounterResult | undefined;

        if (encounter.bossHealth <= 0) {
          // Victory!
          encounter.status = 'victory';
          encounter.endedAt = new Date();
          combatEnded = true;

          result = await this.awardVictoryRewards(encounter, boss, session);
        } else {
          // Check if all players are dead
          const allDead = Array.from(encounter.playerStates.values()).every(
            (state: any) => !state.isAlive
          );

          if (allDead) {
            encounter.status = 'defeat';
            encounter.endedAt = new Date();
            combatEnded = true;

            result = await this.handleDefeat(encounter, boss, session);
          }
        }

        await encounter.save({ session });
        await session.commitTransaction();
        session.endSession();

        // Build response
        const bossSession: BossSession = {
          sessionId: encounter.sessionId,
          bossId: encounter.bossId,
          characterIds: encounter.characterIds.map(id => id.toString()),
          currentPhase: encounter.currentPhase,
          bossHealth: encounter.bossHealth,
          bossMaxHealth: encounter.bossMaxHealth,
          turnCount: encounter.turnCount,
          playerStates: Object.fromEntries(encounter.playerStates) as any,
          abilityCooldowns: encounter.abilityCooldowns,
          environmentalHazards: [],
          minions: encounter.minions,
          startedAt: encounter.startedAt,
          enrageAt: encounter.enrageAt,
          location: encounter.location,
        };

        return {
          success: true,
          session: bossSession,
          round,
          combatEnded,
          result,
        };
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }
    }, { ttl: 30, retries: 3 });
  }

  /**
   * Award victory rewards
   */
  private static async awardVictoryRewards(
    encounter: IBossEncounter,
    boss: BossEncounter,
    session: mongoose.ClientSession
  ): Promise<BossEncounterResult> {
    const duration = (encounter.endedAt!.getTime() - encounter.startedAt.getTime()) / 1000;

    // Calculate participant stats
    const participants = [];
    const characterRewards = new Map();

    for (const [charId, state] of encounter.playerStates.entries()) {
      const character = await Character.findById(charId).session(session);
      if (!character) continue;

      participants.push({
        characterId: charId,
        characterName: character.name,
        damageDealt: (state as any).damageDealt,
        damageTaken: (state as any).damageTaken,
        survived: (state as any).isAlive,
      });

      // Check first kill
      const discovery = await BossDiscovery.findOrCreate(charId, boss.id);
      const isFirstKill = discovery.victoryCount === 0;

      // Update discovery
      discovery.victoryCount += 1;
      discovery.lastVictoryAt = new Date();

      if (
        !discovery.bestAttempt ||
        (state as any).damageDealt > discovery.bestAttempt.damageDealt
      ) {
        discovery.bestAttempt = {
          damageDealt: (state as any).damageDealt,
          healthRemaining: encounter.bossHealth,
          duration: duration,
          date: new Date(),
        };
      }

      await discovery.save({ session });

      // Award rewards
      const dollarsReward = Math.floor(
        SecureRNG.range(boss.goldReward.min, boss.goldReward.max) /
          encounter.characterIds.length
      );
      const xpReward = Math.floor(boss.experienceReward / encounter.characterIds.length);

      await DollarService.addDollars(
        charId,
        dollarsReward,
        TransactionSource.BOSS_VICTORY,
        { bossId: boss.id, bossName: boss.name, currencyType: CurrencyType.DOLLAR },
        session
      );

      await character.addExperience(xpReward);
      await character.save({ session });

      // First kill bonus
      if (isFirstKill && boss.firstKillBonus) {
        await DollarService.addDollars(
          charId,
          boss.firstKillBonus.gold || 0,
          TransactionSource.BOSS_VICTORY,
          { bossId: boss.id, bossName: boss.name, firstKill: true, currencyType: CurrencyType.DOLLAR },
          session
        );

        if (!discovery.firstKillRewardClaimed) {
          discovery.firstKillRewardClaimed = true;
          await discovery.save({ session });
        }
      }

      // Roll loot table for this participant
      const items: ItemDrop[] = [];

      // Add guaranteed drops
      if (boss.guaranteedDrops && boss.guaranteedDrops.length > 0) {
        for (const drop of boss.guaranteedDrops) {
          // Check if this drop requires first kill
          if (drop.guaranteedFirstKill && !isFirstKill) {
            continue;
          }
          items.push({
            itemId: drop.itemId,
            name: drop.name,
            rarity: drop.rarity,
            quantity: drop.quantity,
          });
        }
      }

      // Roll loot table for random drops
      if (boss.lootTable && boss.lootTable.length > 0) {
        for (const lootEntry of boss.lootTable) {
          // Skip first-kill-only items if not first kill
          if (lootEntry.requiresFirstKill && !isFirstKill) {
            continue;
          }

          // Check drop chance
          if (SecureRNG.chance(lootEntry.dropChance)) {
            // Determine quantity
            const quantity = SecureRNG.range(lootEntry.minQuantity, lootEntry.maxQuantity);

            items.push({
              itemId: lootEntry.itemId,
              name: lootEntry.name,
              rarity: lootEntry.rarity,
              quantity,
            });
          }
        }
      }

      // Optional: Add damage-based bonus loot
      const damagePercent = ((state as any).damageDealt / encounter.bossMaxHealth) * 100;
      if (damagePercent >= BOSS_CONSTANTS.MIN_DAMAGE_FOR_LOOT) {
        // High damage dealers get bonus chance at extra loot
        if (damagePercent >= 30 && SecureRNG.chance(0.15)) {
          // 15% chance for bonus loot if dealt 30%+ damage
          const bonusDollars = SecureRNG.range(100, 500);
          await DollarService.addDollars(
            charId,
            bonusDollars,
            TransactionSource.BOSS_VICTORY,
            { bossId: boss.id, bossName: boss.name, bonus: 'high_damage', currencyType: CurrencyType.DOLLAR },
            session
          );
        }
      }

      characterRewards.set(charId, {
        gold: dollarsReward + (isFirstKill && boss.firstKillBonus ? boss.firstKillBonus.gold || 0 : 0),
        experience: xpReward,
        items,
        firstKill: isFirstKill,
      });
    }

    // Track highest single hit from round history
    let highestSingleHit = 0;
    for (const round of encounter.roundHistory as any[]) {
      if (round.playerActions) {
        for (const action of round.playerActions) {
          if (action.damage && action.damage > highestSingleHit) {
            highestSingleHit = action.damage;
          }
        }
      }
    }

    const result: BossEncounterResult = {
      sessionId: encounter.sessionId,
      bossId: boss.id,
      bossName: boss.name,
      outcome: 'victory',
      duration,
      totalRounds: encounter.turnCount,
      totalDamageDealt: participants.reduce((sum, p) => sum + p.damageDealt, 0),
      highestSingleHit,
      participants,
      rewards: {
        gold: boss.goldReward.min,
        experience: boss.experienceReward,
        items: [],
      },
      characterRewards,
      completedAt: encounter.endedAt!,
      wasFirstKill: participants.some(p => {
        const rewards = characterRewards.get(p.characterId);
        return rewards && rewards.firstKill;
      }),
    };

    encounter.outcome = JSON.stringify(result);

    logger.info(`Boss defeated: ${boss.name} by ${participants.length} players`);

    return result;
  }

  /**
   * Handle defeat
   */
  private static async handleDefeat(
    encounter: IBossEncounter,
    boss: BossEncounter,
    session: mongoose.ClientSession
  ): Promise<BossEncounterResult> {
    const duration = (encounter.endedAt!.getTime() - encounter.startedAt.getTime()) / 1000;

    for (const charId of encounter.characterIds) {
      const discovery = await BossDiscovery.findOrCreate(charId.toString(), boss.id);
      discovery.defeatCount += 1;
      await discovery.save({ session });
    }

    const participants = await Promise.all(
      Array.from(encounter.playerStates.entries()).map(async ([charId, state]) => {
        const character = await Character.findById(charId).select('name').session(session);
        return {
          characterId: charId,
          characterName: character?.name ?? 'Unknown',
          damageDealt: (state as any).damageDealt,
          damageTaken: (state as any).damageTaken,
          survived: false,
        };
      })
    );

    const result: BossEncounterResult = {
      sessionId: encounter.sessionId,
      bossId: boss.id,
      bossName: boss.name,
      outcome: 'defeat',
      duration,
      totalRounds: encounter.turnCount,
      totalDamageDealt: participants.reduce((sum, p) => sum + p.damageDealt, 0),
      highestSingleHit: 0,
      participants,
      completedAt: encounter.endedAt!,
      wasFirstKill: false,
    };

    encounter.outcome = JSON.stringify(result);

    logger.info(`Boss victory: ${boss.name} defeated ${participants.length} players`);

    return result;
  }

  /**
   * Calculate character max HP
   */
  private static getCharacterMaxHP(character: ICharacter): number {
    const baseHP = 100;
    // Use Combat Level for HP bonus (replaces old character.level)
    const combatLevel = character.combatLevel || 1;
    const levelBonus = combatLevel * 5;
    const combatSkillBonus = character.skills
      .filter(s => {
        const skillDef = SKILLS[s.skillId.toUpperCase()];
        return skillDef && skillDef.category === SkillCategory.COMBAT;
      })
      .reduce((sum, s) => sum + s.level * 2, 0);

    return baseHP + levelBonus + combatSkillBonus;
  }
}
