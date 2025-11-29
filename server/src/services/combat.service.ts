/**
 * Combat Service
 *
 * Handles turn-based HP combat logic, damage calculation, and loot distribution
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { NPC, INPC } from '../models/NPC.model';
import { CombatEncounter, ICombatEncounter, ICombatRound, ILootAwarded } from '../models/CombatEncounter.model';
import { EnergyService } from './energy.service';
import { GoldService } from './gold.service';
import { TransactionSource } from '../models/GoldTransaction.model';
import { CombatStatus, HandRank, CombatTurnResult, DeathType } from '@desperados/shared';
import { shuffleDeck, drawCards, evaluateHand, Card } from '@desperados/shared';
import logger from '../utils/logger';
import { QuestService } from './quest.service';
import { DeathService } from './death.service';
import { JailService } from './jail.service';

/**
 * Legendary drop rates for bosses
 * Maps boss name to item drops with their chances
 */
const LEGENDARY_DROP_RATES: Record<string, Record<string, number>> = {
  'The Warden of Perdition': { 'wardens-lantern': 0.15 },
  'El Carnicero': { 'carniceros-cleaver': 0.12 },
  'The Pale Rider': { 'pale-riders-pistol': 0.10, 'el-muerto': 0.05 },
  'The Wendigo': { 'wendigo-fang': 0.12 },
  'General Sangre': { 'widowmaker': 0.08, 'generals-saber': 0.15 }
};

export class CombatService {
  /**
   * Energy cost to start combat
   */
  static readonly COMBAT_ENERGY_COST = 10;

  /**
   * Maximum flee rounds
   */
  static readonly MAX_FLEE_ROUNDS = 3;

  /**
   * Death penalty: 10% of character's gold
   */
  static readonly DEATH_PENALTY_PERCENT = 0.1;

  /**
   * Calculate character's maximum HP
   * Formula: Base 100 + (level * 5) + (combat skills * 2) + (premium 20%)
   */
  static getCharacterMaxHP(character: ICharacter, isPremium: boolean = false): number {
    const baseHP = 100;
    const levelBonus = character.level * 5;

    // Get Combat skill levels (skills that boost combat)
    let combatSkillBonus = 0;
    for (const skill of character.skills) {
      // Assuming Combat-category skills boost HP
      // This would need to be refined based on actual skill definitions
      if (skill.skillId.toLowerCase().includes('combat') ||
          skill.skillId.toLowerCase().includes('fight') ||
          skill.skillId.toLowerCase().includes('defense')) {
        combatSkillBonus += skill.level * 2;
      }
    }

    let totalHP = baseHP + levelBonus + combatSkillBonus;

    if (isPremium) {
      totalHP = Math.floor(totalHP * 1.2); // +20% for premium
    }

    return totalHP;
  }

  /**
   * Calculate combat skill damage bonuses
   * Each combat skill level = +1 damage
   */
  static getCombatSkillBonus(character: ICharacter): number {
    let bonus = 0;

    for (const skill of character.skills) {
      // Combat-related skills boost damage
      if (skill.skillId.toLowerCase().includes('combat') ||
          skill.skillId.toLowerCase().includes('fight') ||
          skill.skillId.toLowerCase().includes('attack') ||
          skill.skillId.toLowerCase().includes('shoot')) {
        bonus += skill.level;
      }
    }

    return bonus;
  }

  /**
   * Calculate damage from a hand rank
   * Returns base damage + skill bonuses + random variance
   */
  static calculateDamage(
    handRank: HandRank,
    skillBonuses: number,
    difficultyModifier: number = 0
  ): number {
    // Base damage by hand rank
    const baseDamage: Record<HandRank, number> = {
      [HandRank.ROYAL_FLUSH]: 50,
      [HandRank.STRAIGHT_FLUSH]: 40,
      [HandRank.FOUR_OF_A_KIND]: 35,
      [HandRank.FULL_HOUSE]: 30,
      [HandRank.FLUSH]: 25,
      [HandRank.STRAIGHT]: 20,
      [HandRank.THREE_OF_A_KIND]: 15,
      [HandRank.TWO_PAIR]: 10,
      [HandRank.PAIR]: 8,
      [HandRank.HIGH_CARD]: 5
    };

    const base = baseDamage[handRank] || 5;
    const variance = Math.floor(Math.random() * 6); // 0-5 random damage

    return base + skillBonuses + difficultyModifier + variance;
  }

  /**
   * Simulate NPC card draw based on difficulty
   * Higher difficulty = chance to redraw for better hand
   */
  static drawNPCCards(difficulty: number): Card[] {
    const deck = shuffleDeck();
    const { drawn } = drawCards(deck, 5);

    // Difficulty-based redraw chance
    let redrawChance = 0;
    if (difficulty >= 1 && difficulty <= 3) {
      redrawChance = 0;
    } else if (difficulty >= 4 && difficulty <= 6) {
      redrawChance = 0.3;
    } else if (difficulty >= 7 && difficulty <= 9) {
      redrawChance = 0.5;
    } else {
      redrawChance = 0.7; // Difficulty 10+
    }

    // Check if NPC gets a redraw
    if (Math.random() < redrawChance) {
      const deck2 = shuffleDeck();
      const { drawn: redrawn } = drawCards(deck2, 5);

      // Compare hands and keep the better one
      const eval1 = evaluateHand(drawn);
      const eval2 = evaluateHand(redrawn);

      return eval2.score > eval1.score ? redrawn : drawn;
    }

    return drawn;
  }

  /**
   * Initiate combat with an NPC
   */
  static async initiateCombat(
    character: ICharacter,
    npcId: string
  ): Promise<ICombatEncounter> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if character already in active combat
      const characterId = typeof character._id === 'string' ? character._id : character._id.toString();
      const existingCombat = await CombatEncounter.findActiveByCharacter(characterId);

      if (existingCombat) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Character is already in combat');
      }

      // Fetch NPC
      const npc = await NPC.findById(npcId).session(session);
      if (!npc || !npc.isActive) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('NPC not found or not available');
      }

      // Check character has enough energy
      const hasEnergy = await EnergyService.spendEnergy(
        characterId,
        this.COMBAT_ENERGY_COST
      );

      if (!hasEnergy) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Insufficient energy to start combat');
      }

      // Calculate HP values
      const isPremium = false; // TODO: Get from user model
      const playerMaxHP = this.getCharacterMaxHP(character, isPremium);

      // Create combat encounter
      const encounter = new CombatEncounter({
        characterId: character._id,
        npcId: npc._id,
        playerHP: playerMaxHP,
        playerMaxHP,
        npcHP: npc.maxHP,
        npcMaxHP: npc.maxHP,
        turn: 0, // Player goes first
        roundNumber: 1,
        rounds: [],
        status: CombatStatus.ACTIVE,
        startedAt: new Date()
      });

      await encounter.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(
        `Combat initiated: Character ${character.name} vs NPC ${npc.name} (Level ${npc.level})`
      );

      return encounter;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Play player's turn
   * Draws cards, calculates damage, updates HP, checks for victory
   * If NPC survives, automatically plays NPC's turn
   */
  static async playPlayerTurn(
    encounterId: string,
    characterId: string
  ): Promise<CombatTurnResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Fetch encounter
      const encounter = await CombatEncounter.findById(encounterId)
        .populate('npcId')
        .session(session);

      if (!encounter) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Combat encounter not found');
      }

      // Verify ownership
      if (encounter.characterId.toString() !== characterId) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('You do not own this combat encounter');
      }

      // Verify combat is active
      if (encounter.status !== CombatStatus.ACTIVE) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Combat is not active');
      }

      // Verify it's player's turn
      if (!encounter.isPlayerTurn()) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('It is not your turn');
      }

      // Fetch character for skill bonuses
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Character not found');
      }

      // Draw player cards
      const deck = shuffleDeck();
      const { drawn: playerCards } = drawCards(deck, 5);
      const playerEval = evaluateHand(playerCards);

      // Calculate damage
      const skillBonus = this.getCombatSkillBonus(character);
      const playerDamage = this.calculateDamage(playerEval.rank, skillBonus);

      // Apply damage to NPC
      encounter.npcHP = Math.max(0, encounter.npcHP - playerDamage);

      // Create player round record
      const playerRound: ICombatRound = {
        roundNum: encounter.roundNumber,
        playerCards,
        playerHandRank: playerEval.rank,
        playerDamage,
        npcCards: [], // Will be filled if NPC gets a turn
        npcHandRank: HandRank.HIGH_CARD,
        npcDamage: 0,
        playerHPAfter: encounter.playerHP,
        npcHPAfter: encounter.npcHP
      };

      // Check if NPC is defeated
      if (encounter.npcHP <= 0) {
        encounter.status = CombatStatus.PLAYER_VICTORY;
        encounter.endedAt = new Date();

        // Roll loot
        const npc = encounter.npcId as unknown as INPC;
        const isFirstKill = npc.type === 'BOSS'
          ? await this.isFirstBossKill(characterId, (npc._id as any).toString())
          : false;
        const loot = this.rollLoot(npc, isFirstKill);
        encounter.lootAwarded = loot;

        // Award loot to character
        await this.awardLoot(character, npc, loot, session, encounter);

        // Update quest progress for kill objective
        const npcType = (npc as INPC).type || 'enemy';
        await QuestService.onEnemyDefeated(character._id.toString(), npcType);

        // Add round to history
        encounter.rounds.push(playerRound);

        await encounter.save({ session });
        await session.commitTransaction();
        session.endSession();

        logger.info(
          `Combat victory: Character ${character.name} defeated ${npc.name}`
        );

        return {
          encounter: encounter as any,
          playerRound,
          combatEnded: true,
          lootAwarded: loot
        };
      }

      // NPC survived - switch turn and play NPC turn
      encounter.turn = 1;
      await encounter.save({ session });

      // Play NPC turn immediately
      const npcRound = await this.playNPCTurnInternal(encounter, character, session);

      // Update player round with NPC's actions
      playerRound.npcCards = npcRound.npcCards;
      playerRound.npcHandRank = npcRound.npcHandRank;
      playerRound.npcDamage = npcRound.npcDamage;
      playerRound.playerHPAfter = encounter.playerHP;
      playerRound.npcHPAfter = encounter.npcHP;

      // Add combined round to history
      encounter.rounds.push(playerRound);

      // Check if combat ended from NPC's turn
      let combatEnded = false;
      let deathPenalty: { goldLost: number; respawned: boolean } | undefined = undefined;

      if (encounter.playerHP <= 0) {
        combatEnded = true;
        encounter.status = CombatStatus.PLAYER_DEFEAT;

        // Check if NPC is lawful and should jail instead of death penalty
        const npc = encounter.npcId as unknown as INPC;
        const shouldJail = npc.type === 'LAWMAN' && await DeathService.shouldSendToJail(character, 'lawful_npc');

        if (shouldJail) {
          // Send to jail instead of applying death penalty
          const jailMinutes = DeathService.calculateJailSentence(character.wantedLevel);
          await JailService.jailPlayer(
            character._id.toString(),
            jailMinutes,
            'bounty_collection' as any,
            undefined,
            true,
            session
          );

          logger.info(
            `Player jailed by lawman: ${character.name} defeated by ${npc.name}, sent to jail for ${jailMinutes} minutes`
          );
        } else {
          // Apply normal death penalty
          deathPenalty = await this.applyDeathPenalty(character, session);
        }
      }

      // Increment round number and reset to player turn
      if (encounter.status === CombatStatus.ACTIVE) {
        encounter.roundNumber += 1;
        encounter.turn = 0;
      }

      await encounter.save({ session });
      await session.commitTransaction();
      session.endSession();

      return {
        encounter: encounter as any,
        playerRound,
        npcRound,
        combatEnded,
        deathPenalty
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Play NPC's turn (internal method used during player turn)
   */
  private static async playNPCTurnInternal(
    encounter: ICombatEncounter,
    _character: ICharacter,
    _session: mongoose.ClientSession
  ): Promise<ICombatRound> {
    const npc = encounter.npcId as unknown as INPC;

    // Draw NPC cards with difficulty modifier
    const npcCards = this.drawNPCCards(npc.difficulty);
    const npcEval = evaluateHand(npcCards);

    // Calculate NPC damage (difficulty = bonus damage)
    const npcDamage = this.calculateDamage(npcEval.rank, 0, npc.difficulty);

    // Apply damage to player
    encounter.playerHP = Math.max(0, encounter.playerHP - npcDamage);

    // Check if player is defeated
    if (encounter.playerHP <= 0) {
      encounter.status = CombatStatus.PLAYER_DEFEAT;
      encounter.endedAt = new Date();
    }

    return {
      roundNum: encounter.roundNumber,
      playerCards: [], // Already recorded in player round
      playerHandRank: HandRank.HIGH_CARD,
      playerDamage: 0,
      npcCards,
      npcHandRank: npcEval.rank,
      npcDamage,
      playerHPAfter: encounter.playerHP,
      npcHPAfter: encounter.npcHP
    };
  }

  /**
   * Roll loot from NPC's loot table
   */
  static rollLoot(npc: INPC, isFirstKill: boolean = false): ILootAwarded {
    const { lootTable } = npc;

    // Roll gold
    const gold = Math.floor(
      Math.random() * (lootTable.goldMax - lootTable.goldMin + 1) + lootTable.goldMin
    );

    // XP is fixed
    const xp = lootTable.xpReward;

    // Roll for items
    const items: string[] = [];
    for (const item of lootTable.items) {
      if (Math.random() <= item.chance) {
        items.push(item.name);
      }
    }

    // Roll for legendary boss drops
    if (npc.type === 'BOSS' && LEGENDARY_DROP_RATES[npc.name]) {
      const legendaryDrops = LEGENDARY_DROP_RATES[npc.name];

      for (const [itemId, dropChance] of Object.entries(legendaryDrops)) {
        // First kill guarantees the primary legendary drop
        if (isFirstKill && Object.keys(legendaryDrops)[0] === itemId) {
          items.push(itemId);
          logger.info(`First kill bonus: Guaranteed ${itemId} drop from ${npc.name}`);
        } else if (Math.random() <= dropChance) {
          items.push(itemId);
          logger.info(`Legendary drop: ${itemId} from ${npc.name} (${(dropChance * 100).toFixed(1)}% chance)`);
        }
      }
    }

    return { gold, xp, items };
  }

  /**
   * Check if this is the character's first kill of a specific boss
   */
  static async isFirstBossKill(characterId: string, bossId: string): Promise<boolean> {
    const previousKill = await CombatEncounter.findOne({
      characterId: new mongoose.Types.ObjectId(characterId),
      npcId: bossId,
      status: CombatStatus.PLAYER_VICTORY
    });

    return !previousKill;
  }

  /**
   * Award loot to character
   */
  private static async awardLoot(
    character: ICharacter,
    npc: INPC,
    loot: ILootAwarded,
    session: mongoose.ClientSession,
    encounter: ICombatEncounter
  ): Promise<void> {
    // Award gold using GoldService (transaction-safe)
    if (loot.gold > 0) {
      await GoldService.addGold(
        character._id as string,
        loot.gold,
        TransactionSource.COMBAT_VICTORY,
        {
          npcId: npc._id,
          npcName: npc.name,
          npcLevel: npc.level,
          description: `Defeated ${npc.name} (Level ${npc.level}) and looted ${loot.gold} gold`,
        },
        session
      );
    }

    // Award XP
    await character.addExperience(loot.xp);

    // Award items
    for (const itemName of loot.items) {
      const existingItem = character.inventory.find(i => i.itemId === itemName);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        character.inventory.push({
          itemId: itemName,
          quantity: 1,
          acquiredAt: new Date()
        });
      }

      // Trigger quest progress for item collected
      try {
        await QuestService.onItemCollected(character._id.toString(), itemName, 1);
      } catch (questError) {
        // Don't fail loot if quest update fails
        logger.error('Failed to update quest progress for combat loot:', questError);
      }
    }

    // Update combat stats
    if (!character.combatStats) {
      character.combatStats = {
        wins: 0,
        losses: 0,
        totalDamage: 0,
        kills: 0
      };
    }

    character.combatStats.wins += 1;
    character.combatStats.kills += 1;

    // Track total damage dealt in this combat
    const totalDamageDealt = encounter.rounds.reduce((sum, r) => sum + r.playerDamage, 0);
    character.combatStats.totalDamage += totalDamageDealt;

    // Mark NPC as defeated
    npc.lastDefeated = new Date();
    npc.isActive = false;

    await character.save({ session });
    await npc.save({ session });

    logger.info(
      `Loot awarded to ${character.name}: ${loot.gold} gold, ${loot.xp} XP, ${loot.items.length} items`
    );
  }

  /**
   * Apply death penalty: lose 10% gold, respawn at full HP
   * Enhanced to use new Death Service
   */
  private static async applyDeathPenalty(
    character: ICharacter,
    session: mongoose.ClientSession
  ): Promise<{ goldLost: number; respawned: boolean }> {
    // Use Death Service for comprehensive death handling
    const deathPenalty = await DeathService.handleDeath(
      character._id.toString(),
      DeathType.COMBAT,
      session
    );

    logger.info(
      `Death penalty applied to ${character.name}: lost ${deathPenalty.goldLost} gold, ` +
      `${deathPenalty.xpLost} XP, ${deathPenalty.itemsDropped.length} items`
    );

    return {
      goldLost: deathPenalty.goldLost,
      respawned: deathPenalty.respawned
    };
  }

  /**
   * Flee from combat (only allowed in first 3 rounds)
   */
  static async fleeCombat(
    encounterId: string,
    characterId: string
  ): Promise<ICombatEncounter> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const encounter = await CombatEncounter.findById(encounterId)
        .populate('npcId')
        .session(session);

      if (!encounter) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Combat encounter not found');
      }

      // Verify ownership
      if (encounter.characterId.toString() !== characterId) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('You do not own this combat encounter');
      }

      // Verify can flee
      if (!encounter.canFlee()) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Cannot flee after round 3');
      }

      // Set status to fled
      encounter.status = CombatStatus.FLED;
      encounter.endedAt = new Date();

      await encounter.save({ session });
      await session.commitTransaction();
      session.endSession();

      logger.info(
        `Character ${characterId} fled from combat encounter ${encounterId}`
      );

      return encounter;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get all active NPCs grouped by type
   */
  static async getActiveNPCs(): Promise<any> {
    const npcs = await NPC.findActiveNPCs();

    const byType: any = {
      OUTLAW: [],
      WILDLIFE: [],
      LAWMAN: [],
      BOSS: []
    };

    for (const npc of npcs) {
      byType[npc.type].push(npc);
    }

    return {
      total: npcs.length,
      byType
    };
  }

  /**
   * Get available bosses for a character based on their combat level
   * Bosses have 24-hour respawn cooldowns per character
   */
  static async getAvailableBosses(characterId: string): Promise<INPC[]> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Get character's combat skill level
    let combatLevel = character.level;
    for (const skill of character.skills) {
      if (skill.skillId.toLowerCase().includes('combat') ||
          skill.skillId.toLowerCase().includes('fight')) {
        combatLevel = Math.max(combatLevel, skill.level);
      }
    }

    // Find all boss NPCs
    const allBosses = await NPC.find({
      type: 'BOSS',
      level: { $lte: combatLevel + 5 } // Can fight bosses up to 5 levels above
    }).sort({ level: 1 });

    // Filter by cooldown - check character's boss defeat history
    const availableBosses: INPC[] = [];
    const now = new Date();
    const cooldownMs = 24 * 60 * 60 * 1000; // 24 hours

    for (const boss of allBosses) {
      // Check if character has defeated this boss recently
      const recentDefeat = await CombatEncounter.findOne({
        characterId: new mongoose.Types.ObjectId(characterId),
        npcId: boss._id,
        status: CombatStatus.PLAYER_VICTORY,
        endedAt: { $gte: new Date(now.getTime() - cooldownMs) }
      });

      if (!recentDefeat) {
        availableBosses.push(boss);
      }
    }

    return availableBosses;
  }

  /**
   * Check if a character can fight a specific boss
   */
  static async canFightBoss(characterId: string, bossId: string): Promise<{
    canFight: boolean;
    reason?: string;
    cooldownRemaining?: number;
  }> {
    const character = await Character.findById(characterId);
    if (!character) {
      return { canFight: false, reason: 'Character not found' };
    }

    const boss = await NPC.findById(bossId);
    if (!boss || boss.type !== 'BOSS') {
      return { canFight: false, reason: 'Boss not found' };
    }

    // Check level requirement
    let combatLevel = character.level;
    for (const skill of character.skills) {
      if (skill.skillId.toLowerCase().includes('combat')) {
        combatLevel = Math.max(combatLevel, skill.level);
      }
    }

    if (boss.level > combatLevel + 5) {
      return {
        canFight: false,
        reason: `Requires combat level ${boss.level - 5}. Current: ${combatLevel}`
      };
    }

    // Check cooldown
    const now = new Date();
    const cooldownMs = 24 * 60 * 60 * 1000;

    const recentDefeat = await CombatEncounter.findOne({
      characterId: new mongoose.Types.ObjectId(characterId),
      npcId: boss._id,
      status: CombatStatus.PLAYER_VICTORY,
      endedAt: { $gte: new Date(now.getTime() - cooldownMs) }
    });

    if (recentDefeat && recentDefeat.endedAt) {
      const cooldownEnd = new Date(recentDefeat.endedAt.getTime() + cooldownMs);
      const remaining = cooldownEnd.getTime() - now.getTime();
      return {
        canFight: false,
        reason: 'Boss on cooldown',
        cooldownRemaining: Math.ceil(remaining / 60000) // minutes
      };
    }

    return { canFight: true };
  }

  /**
   * Get boss defeat statistics for a character
   */
  static async getBossStats(characterId: string): Promise<{
    totalBossKills: number;
    uniqueBossesDefeated: number;
    bossHistory: Array<{
      bossName: string;
      bossLevel: number;
      defeatedAt: Date;
      lootEarned: any;
    }>;
  }> {
    const bossEncounters = await CombatEncounter.find({
      characterId: new mongoose.Types.ObjectId(characterId),
      status: CombatStatus.PLAYER_VICTORY
    }).populate('npcId');

    // Filter to only boss encounters
    const bossKills = bossEncounters.filter(enc => {
      const npc = enc.npcId as unknown as INPC;
      return npc && npc.type === 'BOSS';
    });

    const uniqueBosses = new Set(
      bossKills.map(enc => (enc.npcId as any)._id.toString())
    );

    const bossHistory = bossKills.map(enc => {
      const npc = enc.npcId as unknown as INPC;
      return {
        bossName: npc.name,
        bossLevel: npc.level,
        defeatedAt: enc.endedAt || enc.createdAt,
        lootEarned: enc.lootAwarded
      };
    }).sort((a, b) => b.defeatedAt.getTime() - a.defeatedAt.getTime());

    return {
      totalBossKills: bossKills.length,
      uniqueBossesDefeated: uniqueBosses.size,
      bossHistory
    };
  }

  /**
   * Get combat history for a character
   */
  static async getCombatHistory(
    characterId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<any> {
    const skip = (page - 1) * limit;

    const encounters = await CombatEncounter.find({
      characterId: new mongoose.Types.ObjectId(characterId),
      status: { $ne: CombatStatus.ACTIVE }
    })
      .populate('npcId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CombatEncounter.countDocuments({
      characterId: new mongoose.Types.ObjectId(characterId),
      status: { $ne: CombatStatus.ACTIVE }
    });

    // Calculate stats
    const character = await Character.findById(characterId);
    const stats = character.combatStats || {
      wins: 0,
      losses: 0,
      totalDamage: 0,
      kills: 0
    };

    const history = encounters.map(enc => {
      const npc = enc.npcId as unknown as INPC;
      const damageDealt = enc.rounds.reduce((sum, r) => sum + r.playerDamage, 0);

      return {
        _id: enc._id,
        npcName: npc?.name || 'Unknown',
        npcLevel: npc?.level || 0,
        status: enc.status,
        rounds: enc.rounds.length,
        damageDealt,
        goldEarned: enc.lootAwarded?.gold || 0,
        xpEarned: enc.lootAwarded?.xp || 0,
        date: enc.createdAt
      };
    });

    return {
      total,
      stats,
      encounters: history,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }
}
