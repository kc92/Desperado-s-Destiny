/**
 * Combat Contract Tracker Service
 *
 * Phase 3: Contract Expansion
 * Tracks combat outcomes and updates contract progress for combat-integrated contracts
 */

import mongoose from 'mongoose';
import { DailyContract, IContract, IDailyContract } from '../models/DailyContract.model';
import { CombatTargetType } from '@desperados/shared';
import logger from '../utils/logger';

/**
 * NPC type mapping for combat tracking
 */
export enum NPCCombatType {
  OUTLAW = 'outlaw',
  WILDLIFE = 'wildlife',
  LAWMAN = 'lawman',
  BOSS = 'boss',
  ANY = 'any',
}

/**
 * Combat victory data passed from combat service
 */
export interface ICombatVictoryData {
  characterId: mongoose.Types.ObjectId;
  npcId: string;
  npcType: NPCCombatType;
  npcName: string;
  totalDamageDealt: number;
  totalDamageTaken: number;
  roundsPlayed: number;
  winningHandRank?: string;
  isBossKill: boolean;
  bossId?: string;
  isFirstBossKill?: boolean;
}

/**
 * Contract progress update result
 */
export interface IContractProgressResult {
  contractId: string;
  previousProgress: number;
  newProgress: number;
  progressMax: number;
  completed: boolean;
  contractTitle: string;
}

/**
 * Combat Contract Tracker Service
 */
export class CombatContractTrackerService {
  /**
   * Process a combat victory and update relevant contracts
   * Called from combat.service.ts after a player wins
   */
  static async onCombatVictory(data: ICombatVictoryData): Promise<IContractProgressResult[]> {
    const results: IContractProgressResult[] = [];

    try {
      // Get today's daily contract record
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const dailyRecord = await DailyContract.findOne({
        characterId: data.characterId,
        date: today,
      });

      if (!dailyRecord) {
        return results;
      }

      // Check each active contract
      for (const contract of dailyRecord.contracts) {
        if (contract.status !== 'in_progress') continue;

        const progressResult = await this.checkContractProgress(contract, data, dailyRecord);
        if (progressResult) {
          results.push(progressResult);
        }
      }

      // Save if any updates were made
      if (results.length > 0) {
        await dailyRecord.save();
        logger.debug(`Combat contract tracker updated ${results.length} contracts for character ${data.characterId}`);
      }

      return results;
    } catch (error) {
      logger.error('Error in combat contract tracker:', error);
      return results;
    }
  }

  /**
   * Check and update progress for a single contract
   */
  private static async checkContractProgress(
    contract: IContract,
    data: ICombatVictoryData,
    dailyRecord: IDailyContract
  ): Promise<IContractProgressResult | null> {
    const requirements = contract.requirements;
    let shouldProgress = false;
    let progressAmount = 1;

    // Check combat target type kills
    if (requirements.combatTargetType && requirements.combatKillCount) {
      if (this.matchesCombatTargetType(requirements.combatTargetType, data.npcType)) {
        shouldProgress = true;
      }
    }

    // Check boss contracts
    if (contract.type === 'boss' && data.isBossKill) {
      if (!requirements.bossId || requirements.bossId === data.bossId) {
        shouldProgress = true;
      }
    }

    // Check damage threshold
    if (requirements.damageThreshold) {
      if (data.totalDamageDealt >= requirements.damageThreshold) {
        shouldProgress = true;
      }
    }

    // Check flawless victory
    if (requirements.flawlessVictory) {
      if (data.totalDamageTaken === 0) {
        shouldProgress = true;
      }
    }

    // Check hand rank requirements
    if (requirements.handRank && data.winningHandRank) {
      if (data.winningHandRank === requirements.handRank) {
        shouldProgress = true;
      }
    }

    // If no combat-specific requirements, check generic combat contract
    if (contract.type === 'combat' && !requirements.combatTargetType &&
        !requirements.damageThreshold && !requirements.flawlessVictory && !requirements.handRank) {
      // Generic combat win counts for basic combat contracts
      if (contract.target?.type === 'enemy' || contract.target?.type === 'count' || contract.target?.type === 'none') {
        shouldProgress = true;
      }
    }

    if (!shouldProgress) {
      return null;
    }

    // Update progress
    const previousProgress = contract.progress;
    contract.progress = Math.min(contract.progress + progressAmount, contract.progressMax);

    // Check if completed
    const completed = contract.progress >= contract.progressMax;
    if (completed) {
      contract.status = 'completed';
      contract.completedAt = new Date();
    }

    return {
      contractId: contract.id,
      previousProgress,
      newProgress: contract.progress,
      progressMax: contract.progressMax,
      completed,
      contractTitle: contract.title,
    };
  }

  /**
   * Match NPC type to contract combat target type
   */
  private static matchesCombatTargetType(
    targetType: CombatTargetType,
    npcType: NPCCombatType
  ): boolean {
    if (targetType === 'any') return true;
    return targetType === npcType;
  }

  /**
   * Track combat streak for streak-based contracts
   * Called after every combat (win or loss)
   */
  static async updateCombatStreak(
    characterId: mongoose.Types.ObjectId,
    isVictory: boolean
  ): Promise<{ currentStreak: number; contractsUpdated: IContractProgressResult[] }> {
    const results: IContractProgressResult[] = [];

    try {
      // Get or create combat streak from character stats
      // This would integrate with character stats model
      // For now, we'll check streak contracts directly

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const dailyRecord = await DailyContract.findOne({
        characterId,
        date: today,
      });

      if (!dailyRecord || !isVictory) {
        return { currentStreak: isVictory ? 1 : 0, contractsUpdated: results };
      }

      // Find streak contracts and update
      for (const contract of dailyRecord.contracts) {
        if (contract.status !== 'in_progress') continue;

        // Check if this is a streak contract (id contains 'streak')
        if (contract.templateId?.includes('streak')) {
          const previousProgress = contract.progress;
          contract.progress = Math.min(contract.progress + 1, contract.progressMax);

          const completed = contract.progress >= contract.progressMax;
          if (completed) {
            contract.status = 'completed';
            contract.completedAt = new Date();
          }

          results.push({
            contractId: contract.id,
            previousProgress,
            newProgress: contract.progress,
            progressMax: contract.progressMax,
            completed,
            contractTitle: contract.title,
          });
        }
      }

      if (results.length > 0) {
        await dailyRecord.save();
      }

      return { currentStreak: 1, contractsUpdated: results };
    } catch (error) {
      logger.error('Error updating combat streak:', error);
      return { currentStreak: 0, contractsUpdated: results };
    }
  }

  /**
   * Check for quick victory contracts (rounds-based)
   */
  static async checkQuickVictory(
    characterId: mongoose.Types.ObjectId,
    roundsPlayed: number,
    maxRoundsForQuick: number = 3
  ): Promise<IContractProgressResult[]> {
    const results: IContractProgressResult[] = [];

    if (roundsPlayed > maxRoundsForQuick) {
      return results;
    }

    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const dailyRecord = await DailyContract.findOne({
        characterId,
        date: today,
      });

      if (!dailyRecord) return results;

      for (const contract of dailyRecord.contracts) {
        if (contract.status !== 'in_progress') continue;

        // Check if this is a quick victory contract
        if (contract.templateId?.includes('quick')) {
          const previousProgress = contract.progress;
          contract.progress = Math.min(contract.progress + 1, contract.progressMax);

          const completed = contract.progress >= contract.progressMax;
          if (completed) {
            contract.status = 'completed';
            contract.completedAt = new Date();
          }

          results.push({
            contractId: contract.id,
            previousProgress,
            newProgress: contract.progress,
            progressMax: contract.progressMax,
            completed,
            contractTitle: contract.title,
          });
        }
      }

      if (results.length > 0) {
        await dailyRecord.save();
      }

      return results;
    } catch (error) {
      logger.error('Error checking quick victory:', error);
      return results;
    }
  }

  /**
   * Get NPC combat type from NPC type string
   */
  static getNPCCombatType(npcType: string): NPCCombatType {
    const typeMap: Record<string, NPCCombatType> = {
      'outlaw': NPCCombatType.OUTLAW,
      'bandit': NPCCombatType.OUTLAW,
      'criminal': NPCCombatType.OUTLAW,
      'wildlife': NPCCombatType.WILDLIFE,
      'animal': NPCCombatType.WILDLIFE,
      'predator': NPCCombatType.WILDLIFE,
      'lawman': NPCCombatType.LAWMAN,
      'sheriff': NPCCombatType.LAWMAN,
      'deputy': NPCCombatType.LAWMAN,
      'marshal': NPCCombatType.LAWMAN,
      'boss': NPCCombatType.BOSS,
      'legendary': NPCCombatType.BOSS,
    };

    return typeMap[npcType.toLowerCase()] || NPCCombatType.ANY;
  }
}

export default CombatContractTrackerService;
