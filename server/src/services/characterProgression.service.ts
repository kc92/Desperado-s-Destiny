/**
 * Character Progression Service
 * Handles all character progression operations with transaction safety
 * Replaces Character instance methods (addExperience, addGold, etc.)
 * Follows EnergyService pattern (static methods with characterId)
 */

import mongoose, { ClientSession } from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { GoldService } from './gold.service';
import { InventoryService } from './inventory.service';
import { PROGRESSION } from '@desperados/shared';
import { TransactionSource } from '../models/GoldTransaction.model';
import logger from '../utils/logger';

// =============================================================================
// TYPES
// =============================================================================

export interface ExperienceResult {
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  newExperience: number;
  levelsGained: number;
}

export interface RewardBundle {
  gold?: number;
  xp?: number;
  items?: Array<{ itemId: string; quantity: number }>;
}

export interface AwardRewardsResult {
  goldAwarded: number;
  xpAwarded: number;
  itemsAwarded: Array<{ itemId: string; quantity: number }>;
  leveledUp: boolean;
  newLevel?: number;
}

// =============================================================================
// SERVICE
// =============================================================================

export class CharacterProgressionService {
  /**
   * Calculate XP required for a specific level
   * Based on PROGRESSION constants from shared
   */
  static calculateXPForLevel(level: number): number {
    if (level >= PROGRESSION.MAX_LEVEL) {
      return Infinity;
    }

    // Formula: 100 * level^2 (exponential curve)
    return 100 * Math.pow(level, 2);
  }

  /**
   * Add experience with transaction safety
   * Automatically handles level-ups and overflow XP
   *
   * @param characterId - Character receiving XP
   * @param amount - Amount of XP to award
   * @param source - Source of XP for logging
   * @param externalSession - Optional external MongoDB session
   */
  static async addExperience(
    characterId: string | mongoose.Types.ObjectId,
    amount: number,
    source: string,
    externalSession?: ClientSession
  ): Promise<ExperienceResult> {
    // Validate input
    if (amount < 0) {
      throw new Error('Experience amount cannot be negative');
    }

    if (amount === 0) {
      const character = await Character.findById(characterId);
      if (!character) throw new Error('Character not found');

      return {
        leveledUp: false,
        oldLevel: character.level,
        newLevel: character.level,
        newExperience: character.experience,
        levelsGained: 0,
      };
    }

    const session = externalSession || (await mongoose.startSession());
    const shouldCommit = !externalSession;

    if (shouldCommit) {
      await session.startTransaction();
    }

    try {
      const character = await Character.findById(characterId).session(session);
      if (!character) throw new Error('Character not found');

      const oldLevel = character.level;
      character.experience += amount;

      // Level up logic
      let levelsGained = 0;
      while (character.level < PROGRESSION.MAX_LEVEL) {
        const xpNeeded = this.calculateXPForLevel(character.level);

        if (character.experience >= xpNeeded) {
          character.experience -= xpNeeded;
          character.level += 1;
          levelsGained += 1;

          logger.info(
            `Character ${characterId} leveled up! ${oldLevel + levelsGained - 1} → ${character.level}`
          );
        } else {
          break;
        }
      }

      // Cap experience at max level
      if (character.level >= PROGRESSION.MAX_LEVEL) {
        character.experience = 0;
      }

      await character.save({ session });

      if (shouldCommit) {
        await session.commitTransaction();
      }

      // Fire-and-forget quest progression (after commit)
      if (levelsGained > 0) {
        this.triggerLevelUpHooks(characterId.toString(), character.level).catch((err) =>
          logger.error('Level-up hooks failed', err)
        );
      }

      const result: ExperienceResult = {
        leveledUp: levelsGained > 0,
        oldLevel,
        newLevel: character.level,
        newExperience: character.experience,
        levelsGained,
      };

      logger.debug(
        `Added ${amount} XP to character ${characterId} from ${source}. Level: ${oldLevel} → ${result.newLevel}`
      );

      return result;
    } catch (error) {
      if (shouldCommit) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      if (shouldCommit) {
        session.endSession();
      }
    }
  }

  /**
   * Award gold, XP, and items atomically
   * Used by combat, crime, quests
   *
   * @param characterId - Character receiving rewards
   * @param rewards - Bundle of rewards to award
   * @param source - Source of rewards for transaction logging
   * @param externalSession - Optional external MongoDB session
   */
  static async awardRewards(
    characterId: string | mongoose.Types.ObjectId,
    rewards: RewardBundle,
    source: TransactionSource,
    externalSession?: ClientSession
  ): Promise<AwardRewardsResult> {
    const session = externalSession || (await mongoose.startSession());
    const shouldCommit = !externalSession;

    if (shouldCommit) {
      await session.startTransaction();
    }

    try {
      const result: AwardRewardsResult = {
        goldAwarded: 0,
        xpAwarded: 0,
        itemsAwarded: [],
        leveledUp: false,
      };

      // Award gold (GoldService already handles transactions, pass session)
      if (rewards.gold && rewards.gold > 0) {
        await GoldService.addGold(
          characterId as mongoose.Types.ObjectId,
          rewards.gold,
          source,
          {},
          session
        );
        result.goldAwarded = rewards.gold;
        logger.debug(`Awarded ${rewards.gold} gold to character ${characterId}`);
      }

      // Award XP (pass session)
      if (rewards.xp && rewards.xp > 0) {
        const xpResult = await this.addExperience(characterId, rewards.xp, source, session);
        result.xpAwarded = rewards.xp;
        result.leveledUp = xpResult.leveledUp;
        result.newLevel = xpResult.newLevel;
        logger.debug(`Awarded ${rewards.xp} XP to character ${characterId}`);
      }

      // Award items (InventoryService handles transactions, pass session)
      if (rewards.items && rewards.items.length > 0) {
        // Determine source type for overflow handling
        const sourceType = this.getInventorySourceType(source);

        const inventoryResult = await InventoryService.addItems(
          characterId,
          rewards.items,
          {
            type: sourceType,
            id: source,
            name: this.getSourceDisplayName(source),
          },
          session
        );

        result.itemsAwarded = inventoryResult.itemsAdded;

        if (inventoryResult.overflow.length > 0) {
          logger.warn(
            `${inventoryResult.overflow.length} items couldn't fit in inventory, handled via overflow system`
          );
        }
      }

      if (shouldCommit) {
        await session.commitTransaction();
      }

      logger.info(
        `Awarded rewards to character ${characterId}: ${result.goldAwarded} gold, ${result.xpAwarded} XP, ${result.itemsAwarded.length} items`
      );

      return result;
    } catch (error) {
      if (shouldCommit) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      if (shouldCommit) {
        session.endSession();
      }
    }
  }

  /**
   * Map TransactionSource to inventory source type
   */
  private static getInventorySourceType(
    source: TransactionSource
  ): 'combat' | 'quest' | 'npc' | 'purchase' | 'other' {
    switch (source) {
      case TransactionSource.COMBAT_VICTORY:
      case TransactionSource.COMBAT_LOOT:
        return 'combat';
      case TransactionSource.QUEST_REWARD:
      case TransactionSource.QUEST_COMPLETION:
        return 'quest';
      case TransactionSource.NPC_INTERACTION:
      case TransactionSource.NPC_TRADE:
        return 'npc';
      case TransactionSource.SHOP_PURCHASE:
      case TransactionSource.PROPERTY_PURCHASE:
        return 'purchase';
      default:
        return 'other';
    }
  }

  /**
   * Get display name for transaction source
   */
  private static getSourceDisplayName(source: TransactionSource): string {
    return source.replace(/_/g, ' ').toLowerCase();
  }

  /**
   * Trigger level-up hooks (quest progression, etc.)
   * Fire-and-forget, errors are logged but don't fail the transaction
   */
  private static async triggerLevelUpHooks(
    characterId: string,
    newLevel: number
  ): Promise<void> {
    try {
      // TODO: Import QuestService when available
      // await QuestService.onLevelUp(characterId, newLevel);
      logger.debug(`Level-up hooks triggered for character ${characterId}, level ${newLevel}`);
    } catch (error) {
      logger.error('Error in level-up hooks:', error);
    }
  }

  /**
   * Check if character can level up with current XP
   */
  static async canLevelUp(characterId: string | mongoose.Types.ObjectId): Promise<boolean> {
    const character = await Character.findById(characterId);
    if (!character) throw new Error('Character not found');

    if (character.level >= PROGRESSION.MAX_LEVEL) {
      return false;
    }

    const xpNeeded = this.calculateXPForLevel(character.level);
    return character.experience >= xpNeeded;
  }

  /**
   * Get XP progress to next level
   */
  static async getXPProgress(characterId: string | mongoose.Types.ObjectId): Promise<{
    currentXP: number;
    xpNeeded: number;
    percentage: number;
    level: number;
  }> {
    const character = await Character.findById(characterId);
    if (!character) throw new Error('Character not found');

    if (character.level >= PROGRESSION.MAX_LEVEL) {
      return {
        currentXP: 0,
        xpNeeded: 0,
        percentage: 100,
        level: character.level,
      };
    }

    const xpNeeded = this.calculateXPForLevel(character.level);
    const percentage = (character.experience / xpNeeded) * 100;

    return {
      currentXP: character.experience,
      xpNeeded,
      percentage: Math.min(100, percentage),
      level: character.level,
    };
  }
}
