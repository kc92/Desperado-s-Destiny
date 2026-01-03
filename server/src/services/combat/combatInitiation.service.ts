/**
 * Combat Initiation Service
 *
 * Handles combat session creation, boss availability queries, and fleeing.
 * All methods related to starting and ending combat encounters.
 *
 * REFACTOR: Extracted from combat.service.ts to follow single responsibility principle
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../../models/Character.model';
import { NPC, INPC } from '../../models/NPC.model';
import { CombatEncounter, ICombatEncounter } from '../../models/CombatEncounter.model';
import { CombatStatus } from '@desperados/shared';
import { withLock } from '../../utils/distributedLock';
import logger from '../../utils/logger';
import { CombatCalculationService } from './combatCalculation.service';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Energy cost to start combat */
export const COMBAT_ENERGY_COST = 10;

/** Maximum rounds where fleeing is allowed */
export const MAX_FLEE_ROUNDS = 3;

/** Boss cooldown duration in milliseconds (24 hours) */
const BOSS_COOLDOWN_MS = 24 * 60 * 60 * 1000;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CanFightBossResult {
  canFight: boolean;
  reason?: string;
  cooldownRemaining?: number; // minutes
}

export interface BossStatsResult {
  totalBossKills: number;
  uniqueBossesDefeated: number;
  bossHistory: Array<{
    bossName: string;
    bossLevel: number;
    defeatedAt: Date;
    lootEarned: any;
  }>;
}

export interface CombatHistoryResult {
  total: number;
  stats: {
    wins: number;
    losses: number;
    totalDamage: number;
    kills: number;
    totalDeaths: number;
  };
  encounters: Array<{
    _id: mongoose.Types.ObjectId;
    npcName: string;
    npcLevel: number;
    status: CombatStatus;
    rounds: number;
    damageDealt: number;
    dollarsEarned: number;
    xpEarned: number;
    date: Date;
  }>;
  page: number;
  totalPages: number;
}

// ============================================================================
// COMBAT INITIATION SERVICE
// ============================================================================

export class CombatInitiationService {
  /**
   * Initiate combat with an NPC
   * Creates a new combat encounter session with proper locking
   *
   * @param character - Character starting combat
   * @param npcId - NPC to fight
   * @returns New combat encounter
   * @throws Error if character already in combat or insufficient energy
   */
  static async initiateCombat(
    character: ICharacter,
    npcId: string
  ): Promise<ICombatEncounter> {
    // Lazy load to prevent circular dependencies
    const { EnergyService } = await import('../energy.service');

    const characterId = typeof character._id === 'string' ? character._id : character._id.toString();

    // PHASE 3 FIX: Add distributed lock to prevent race conditions
    return withLock(`lock:combat:${characterId}`, async () => {
      // Check if character already in active combat
      const existingCombat = await CombatEncounter.findActiveByCharacter(characterId);

      if (existingCombat) {
        throw new Error('Character is already in combat');
      }

      // Fetch NPC
      const npc = await NPC.findById(npcId);
      if (!npc) {
        throw new Error('NPC not found');
      }

      // Check character has enough energy
      const hasEnergy = await EnergyService.spendEnergy(
        characterId,
        COMBAT_ENERGY_COST
      );

      if (!hasEnergy) {
        throw new Error('Insufficient energy to start combat');
      }

      // Calculate HP values
      const playerMaxHP = await CombatCalculationService.getCharacterMaxHP(character);

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

      await encounter.save();

      logger.info(
        `Combat initiated: Character ${character.name} vs NPC ${npc.name} (Level ${npc.level})`
      );

      return encounter;
    }, { ttl: 30, retries: 10 });
  }

  /**
   * Flee from combat (only allowed in first 3 rounds)
   *
   * @param encounterId - Combat encounter ID
   * @param characterId - Character fleeing
   * @returns Updated encounter with FLED status
   * @throws Error if cannot flee
   */
  static async fleeCombat(
    encounterId: string,
    characterId: string
  ): Promise<ICombatEncounter> {
    // Lazy load karma service
    const karmaService = (await import('../karma.service')).default;

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
        throw new Error('Not your combat encounter');
      }

      // Can only flee in first rounds
      if (encounter.roundNumber > MAX_FLEE_ROUNDS) {
        await session.abortTransaction();
        session.endSession();
        throw new Error(`Cannot flee after round ${MAX_FLEE_ROUNDS}`);
      }

      // Must be in active combat
      if (encounter.status !== CombatStatus.ACTIVE) {
        await session.abortTransaction();
        session.endSession();
        throw new Error('Combat is not active');
      }

      // Update encounter
      encounter.status = CombatStatus.FLED;
      encounter.endedAt = new Date();

      // Get character to save combat stats
      const character = await Character.findById(characterId).session(session);
      if (character) {
        if (!character.combatStats) {
          character.combatStats = {
            wins: 0,
            losses: 0,
            totalDamage: 0,
            kills: 0,
            totalDeaths: 0
          };
        }
        // Fleeing counts as a loss
        character.combatStats.losses += 1;
        await character.save({ session });
      }

      await encounter.save({ session });
      await session.commitTransaction();
      session.endSession();

      // Record karma for fleeing (fire-and-forget)
      try {
        const npc = encounter.npcId as unknown as INPC;
        await karmaService.recordAction(
          characterId,
          'COMBAT_FLED',
          `Fled from combat with ${npc?.name || 'enemy'} after ${encounter.roundNumber} rounds`
        );
        logger.debug('Karma recorded for fleeing: COMBAT_FLED');
      } catch (karmaError) {
        logger.warn('Failed to record karma for fleeing combat:', karmaError);
      }

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
    return npcs;
  }

  /**
   * Get available bosses for a character based on their combat level
   * Bosses have 24-hour respawn cooldowns per character
   *
   * @param characterId - Character to check availability for
   * @returns Array of available boss NPCs
   */
  static async getAvailableBosses(characterId: string): Promise<INPC[]> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Use the character's Combat Level field directly (no longer derived from skills)
    const combatLevel = character.combatLevel || 1;

    // Find all boss NPCs
    const allBosses = await NPC.find({
      type: 'BOSS',
      level: { $lte: combatLevel + 5 } // Can fight bosses up to 5 combat levels above
    }).sort({ level: 1 });

    // H8 FIX: Batch query instead of N+1 individual queries
    // Get all boss IDs and query recent defeats in a single database call
    const now = new Date();
    const cooldownThreshold = new Date(now.getTime() - BOSS_COOLDOWN_MS);
    const bossIds = allBosses.map(boss => boss._id);

    // Single query to get all recent defeats against any of these bosses
    const recentDefeats = await CombatEncounter.find({
      characterId: new mongoose.Types.ObjectId(characterId),
      npcId: { $in: bossIds },
      status: CombatStatus.PLAYER_VICTORY,
      endedAt: { $gte: cooldownThreshold }
    }).select('npcId').lean();

    // Create a Set of defeated boss IDs for O(1) lookup
    const defeatedBossIds = new Set(
      recentDefeats.map(defeat => defeat.npcId.toString())
    );

    // Filter bosses not recently defeated
    const availableBosses = allBosses.filter(
      boss => !defeatedBossIds.has(boss._id.toString())
    );

    return availableBosses;
  }

  /**
   * Check if a character can fight a specific boss
   *
   * @param characterId - Character ID
   * @param bossId - Boss NPC ID
   * @returns Result with canFight flag and reason if not
   */
  static async canFightBoss(characterId: string, bossId: string): Promise<CanFightBossResult> {
    const character = await Character.findById(characterId);
    if (!character) {
      return { canFight: false, reason: 'Character not found' };
    }

    const boss = await NPC.findById(bossId);
    if (!boss || boss.type !== 'BOSS') {
      return { canFight: false, reason: 'Boss not found' };
    }

    // Check level requirement (use Combat Level field directly)
    const combatLevel = character.combatLevel || 1;

    if (boss.level > combatLevel + 5) {
      return {
        canFight: false,
        reason: `Requires Combat Level ${boss.level - 5}. Current: ${combatLevel}`
      };
    }

    // Check cooldown
    const now = new Date();

    const recentDefeat = await CombatEncounter.findOne({
      characterId: new mongoose.Types.ObjectId(characterId),
      npcId: boss._id,
      status: CombatStatus.PLAYER_VICTORY,
      endedAt: { $gte: new Date(now.getTime() - BOSS_COOLDOWN_MS) }
    });

    if (recentDefeat && recentDefeat.endedAt) {
      const cooldownEnd = new Date(recentDefeat.endedAt.getTime() + BOSS_COOLDOWN_MS);
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
   *
   * @param characterId - Character ID
   * @returns Boss stats including total kills, unique defeats, and history
   */
  static async getBossStats(characterId: string): Promise<BossStatsResult> {
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
   *
   * @param characterId - Character ID
   * @param page - Page number (1-indexed)
   * @param limit - Results per page
   * @returns Paginated combat history with stats
   */
  static async getCombatHistory(
    characterId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<CombatHistoryResult> {
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
    const stats = character?.combatStats || {
      wins: 0,
      losses: 0,
      totalDamage: 0,
      kills: 0,
      totalDeaths: 0
    };

    const history = encounters.map(enc => {
      const npc = enc.npcId as unknown as INPC;
      const damageDealt = enc.rounds.reduce((sum, r) => sum + r.playerDamage, 0);

      return {
        _id: enc._id as mongoose.Types.ObjectId,
        npcName: npc?.name || 'Unknown',
        npcLevel: npc?.level || 0,
        status: enc.status,
        rounds: enc.rounds.length,
        damageDealt,
        dollarsEarned: enc.lootAwarded?.gold || 0,
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

export default CombatInitiationService;
