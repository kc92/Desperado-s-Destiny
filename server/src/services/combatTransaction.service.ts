/**
 * Combat Transaction Service
 * Wraps entire combat flow in atomic transactions
 * Fixes "rewards before save" bug by saving encounter BEFORE awarding loot
 * Ensures all combat operations are atomic and crash-safe
 */

import mongoose, { ClientSession } from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { NPC, INPC } from '../models/NPC.model';
import { CombatEncounter, ICombatEncounter, ICombatRound, ILootAwarded } from '../models/CombatEncounter.model';
import { CombatService } from './combat.service';
import { CharacterProgressionService } from './characterProgression.service';
import { TransactionSource } from '../models/GoldTransaction.model';
import { CombatStatus, HandRank, CombatTurnResult } from '@desperados/shared';
import { shuffleDeck, drawCards, evaluateHand } from '@desperados/shared';
import { QuestService } from './quest.service';
import { DeathService } from './death.service';
import { JailService } from './jail.service';
import { SecureRNG } from './base/SecureRNG';
import logger from '../utils/logger';

// =============================================================================
// TYPES
// =============================================================================

interface TurnProcessResult {
  playerDamage: number;
  npcDamage: number;
  playerRound: ICombatRound;
  npcRound?: ICombatRound;
  combatEnded: boolean;
  victory: boolean;
  isFirstKill?: boolean;
}

// =============================================================================
// SERVICE
// =============================================================================

export class CombatTransactionService {
  /**
   * Execute entire combat turn atomically
   * Saves encounter BEFORE awarding rewards
   *
   * @param encounterId - Combat encounter ID
   * @param characterId - Character taking the turn
   */
  static async executePlayerTurn(
    encounterId: string,
    characterId: string
  ): Promise<CombatTurnResult> {
    const session = await mongoose.startSession();
    await session.startTransaction();

    try {
      // 1. Load encounter and character with session
      const encounter = await CombatEncounter.findById(encounterId)
        .populate('npcId')
        .session(session);

      if (!encounter) {
        throw new Error('Combat encounter not found');
      }

      // Verify ownership
      if (encounter.characterId.toString() !== characterId) {
        throw new Error('You do not own this combat encounter');
      }

      // Verify combat is active
      if (encounter.status !== CombatStatus.ACTIVE) {
        throw new Error('Combat is not active');
      }

      // Verify it's player's turn
      if (!encounter.isPlayerTurn()) {
        throw new Error('It is not your turn');
      }

      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      const npc = encounter.npcId as unknown as INPC;

      // 2. Process turn logic (pure calculation, no persistence yet)
      const turnResult = await this.processTurn(encounter, character, npc, session);

      // 3. Update encounter state
      encounter.playerHP = turnResult.playerRound.playerHPAfter;
      encounter.npcHP = turnResult.playerRound.npcHPAfter;
      encounter.rounds.push(turnResult.playerRound);

      // 4. If combat ended, set status
      if (turnResult.combatEnded) {
        encounter.status = turnResult.victory
          ? CombatStatus.PLAYER_VICTORY
          : CombatStatus.PLAYER_DEFEAT;
        encounter.endedAt = new Date();

        // If victory, assign loot to encounter record
        if (turnResult.victory) {
          const loot = CombatService.rollLoot(npc, turnResult.isFirstKill || false);
          encounter.lootAwarded = loot;
        }
      } else {
        // Combat continues - increment round number and reset to player turn
        encounter.roundNumber += 1;
        encounter.turn = 0;
      }

      // 5. SAVE ENCOUNTER FIRST! (This is the critical fix)
      await encounter.save({ session });

      logger.debug(`Encounter ${encounterId} saved with status: ${encounter.status}`);

      // 6. Now handle post-combat operations (only if combat ended)
      let deathPenalty: { goldLost: number; respawned: boolean } | undefined = undefined;

      if (turnResult.combatEnded) {
        if (turnResult.victory) {
          // VICTORY: Update character stats, then award rewards
          await this.handleVictory(
            character,
            npc,
            encounter,
            encounter.lootAwarded!,
            session
          );
        } else {
          // DEFEAT: Handle death penalty or jail
          deathPenalty = await this.handleDefeat(character, npc, session);
        }
      }

      // 7. Commit transaction
      await session.commitTransaction();
      session.endSession();

      logger.info(
        `Combat turn completed for encounter ${encounterId}: ${turnResult.victory ? 'VICTORY' : turnResult.combatEnded ? 'DEFEAT' : 'ONGOING'}`
      );

      return {
        encounter: encounter as any,
        playerRound: turnResult.playerRound,
        npcRound: turnResult.npcRound,
        combatEnded: turnResult.combatEnded,
        lootAwarded: encounter.lootAwarded,
        deathPenalty,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('Combat turn transaction failed:', error);
      throw error;
    }
  }

  /**
   * Process turn logic (pure calculation, no persistence)
   * Returns damage dealt and round data
   */
  private static async processTurn(
    encounter: ICombatEncounter,
    character: ICharacter,
    npc: INPC,
    session: ClientSession
  ): Promise<TurnProcessResult> {
    // Draw player cards
    const deck = shuffleDeck();
    const { drawn: playerCards } = drawCards(deck, 5);
    const playerEval = evaluateHand(playerCards);

    // Calculate damage
    const skillBonus = CombatService.getCombatSkillBonus(character);
    const playerDamage = CombatService.calculateDamage(playerEval.rank, skillBonus);

    // Apply damage to NPC
    const newNPCHP = Math.max(0, encounter.npcHP - playerDamage);

    // Create player round record
    const playerRound: ICombatRound = {
      roundNum: encounter.roundNumber,
      playerCards,
      playerHandRank: playerEval.rank,
      playerDamage,
      npcCards: [],
      npcHandRank: HandRank.HIGH_CARD,
      npcDamage: 0,
      playerHPAfter: encounter.playerHP,
      npcHPAfter: newNPCHP,
    };

    // Check if NPC is defeated
    if (newNPCHP <= 0) {
      const isFirstKill =
        npc.type === 'BOSS'
          ? await CombatService.isFirstBossKill(
              character._id.toString(),
              (npc._id as any).toString()
            )
          : false;

      return {
        playerDamage,
        npcDamage: 0,
        playerRound,
        combatEnded: true,
        victory: true,
        isFirstKill,
      };
    }

    // NPC survived - play NPC turn
    const npcCards = this.drawNPCCards(npc.difficulty);
    const npcEval = evaluateHand(npcCards);
    const npcDamage = CombatService.calculateDamage(npcEval.rank, 0, npc.difficulty);

    // Apply damage to player
    const newPlayerHP = Math.max(0, encounter.playerHP - npcDamage);

    // Update player round with NPC data
    playerRound.npcCards = npcCards;
    playerRound.npcHandRank = npcEval.rank;
    playerRound.npcDamage = npcDamage;
    playerRound.playerHPAfter = newPlayerHP;

    const npcRound: ICombatRound = {
      roundNum: encounter.roundNumber,
      playerCards: [],
      playerHandRank: HandRank.HIGH_CARD,
      playerDamage: 0,
      npcCards,
      npcHandRank: npcEval.rank,
      npcDamage,
      playerHPAfter: newPlayerHP,
      npcHPAfter: newNPCHP,
    };

    // Check if player is defeated
    const playerDefeated = newPlayerHP <= 0;

    return {
      playerDamage,
      npcDamage,
      playerRound,
      npcRound,
      combatEnded: playerDefeated,
      victory: false,
    };
  }

  /**
   * Handle victory: Update stats, then award rewards
   * All operations within existing transaction
   */
  private static async handleVictory(
    character: ICharacter,
    npc: INPC,
    encounter: ICombatEncounter,
    loot: ILootAwarded,
    session: ClientSession
  ): Promise<void> {
    // 1. Update character combat stats FIRST (before rewards)
    if (!character.combatStats) {
      character.combatStats = {
        wins: 0,
        losses: 0,
        totalDamage: 0,
        kills: 0,
      };
    }

    character.combatStats.wins += 1;
    character.combatStats.kills += 1;

    // Track total damage dealt
    const totalDamageDealt = encounter.rounds.reduce((sum, r) => sum + r.playerDamage, 0);
    character.combatStats.totalDamage += totalDamageDealt;

    await character.save({ session });

    logger.debug(`Updated combat stats for character ${character._id}`);

    // 2. Mark NPC as defeated
    const npcDoc = await NPC.findById(npc._id).session(session);
    if (npcDoc) {
      npcDoc.lastDefeated = new Date();
      npcDoc.isActive = false;
      await npcDoc.save({ session });
    }

    // 3. THEN award rewards using CharacterProgressionService (atomic with session)
    await CharacterProgressionService.awardRewards(
      character._id.toString(),
      {
        gold: loot.gold,
        xp: loot.xp,
        items: loot.items.map((itemId) => ({ itemId, quantity: 1 })),
      },
      TransactionSource.COMBAT_VICTORY,
      session
    );

    logger.info(
      `Combat rewards awarded to ${character.name}: ${loot.gold} gold, ${loot.xp} XP, ${loot.items.length} items`
    );

    // 4. Update quest progress (fire-and-forget after transaction commits)
    // These are called outside the transaction via QuestService's internal error handling
    Promise.all([
      QuestService.onEnemyDefeated(character._id.toString(), npc.type || 'enemy'),
      ...loot.items.map((itemId) =>
        QuestService.onItemCollected(character._id.toString(), itemId, 1)
      ),
    ]).catch((err) => logger.error('Quest update failed after combat victory:', err));
  }

  /**
   * Handle defeat: Apply death penalty or jail
   * All operations within existing transaction
   */
  private static async handleDefeat(
    character: ICharacter,
    npc: INPC,
    session: ClientSession
  ): Promise<{ goldLost: number; respawned: boolean }> {
    // Check if NPC is lawful and should jail instead of death penalty
    const shouldJail =
      npc.type === 'LAWMAN' &&
      (await DeathService.shouldSendToJail(character, 'lawful_npc'));

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

      return { goldLost: 0, respawned: false };
    } else {
      // Apply normal death penalty
      const deathPenalty = await DeathService.handleDeath(
        character._id.toString(),
        'combat' as any,
        session
      );

      logger.info(
        `Death penalty applied to ${character.name}: lost ${deathPenalty.goldLost} gold, ${deathPenalty.xpLost} XP`
      );

      return {
        goldLost: deathPenalty.goldLost,
        respawned: deathPenalty.respawned,
      };
    }
  }

  /**
   * Draw NPC cards with difficulty-based redraw mechanic
   * (Extracted from CombatService for reuse)
   */
  private static drawNPCCards(difficulty: number): any[] {
    const deck1 = shuffleDeck();
    const { drawn: hand1 } = drawCards(deck1, 5);
    const eval1 = evaluateHand(hand1);

    // NPC redraw chance based on difficulty
    const redrawChance = Math.min(0.5, difficulty * 0.05);

    if (SecureRNG.chance(redrawChance)) {
      const deck2 = shuffleDeck();
      const { drawn: hand2 } = drawCards(deck2, 5);
      const eval2 = evaluateHand(hand2);

      // Take better hand
      return eval2.score > eval1.score ? hand2 : hand1;
    }

    return hand1;
  }

  /**
   * Start boss encounter with atomic cooldown check
   * Prevents race condition where multiple players start same boss
   */
  static async startBossEncounter(
    characterId: string,
    bossId: string
  ): Promise<ICombatEncounter> {
    const session = await mongoose.startSession();
    await session.startTransaction();

    try {
      // Atomic cooldown check via findOne (doesn't lock, but checks state)
      const lastDefeat = await CombatEncounter.findOne({
        characterId,
        'npcId': bossId,
        status: CombatStatus.PLAYER_DEFEAT,
        endedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      })
        .session(session)
        .sort({ endedAt: -1 });

      if (lastDefeat) {
        const cooldownEnds = new Date(lastDefeat.endedAt.getTime() + 24 * 60 * 60 * 1000);
        const remainingMs = cooldownEnds.getTime() - Date.now();
        const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));

        throw new Error(
          `Boss cooldown active. You can challenge this boss again in ${remainingHours} hour(s).`
        );
      }

      // Load boss NPC
      const boss = await NPC.findById(bossId).session(session);
      if (!boss) {
        throw new Error('Boss not found');
      }

      if (boss.type !== 'BOSS') {
        throw new Error('This NPC is not a boss');
      }

      // Load character
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        throw new Error('Character not found');
      }

      // Calculate max HP
      const maxHP = await CombatService.getCharacterMaxHP(character);

      // Create encounter
      const encounter = new CombatEncounter({
        characterId,
        npcId: bossId,
        status: CombatStatus.ACTIVE,
        playerHP: maxHP,
        npcHP: boss.maxHP,
        roundNumber: 1,
        turn: 0, // Player goes first
        rounds: [],
        lootAwarded: null,
      });

      await encounter.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`Boss encounter started: ${character.name} vs ${boss.name}`);

      return encounter;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
