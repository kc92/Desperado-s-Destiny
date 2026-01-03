/**
 * Character Progression Service
 * Handles all character progression operations with transaction safety
 * Replaces Character instance methods (addExperience, addGold, etc.)
 * Follows EnergyService pattern (static methods with characterId)
 *
 * LEVELING SYSTEM REFACTOR (Phase C3):
 * - Character level is now DEPRECATED in favor of Total Level
 * - Total Level = sum of all skill levels (30-2970)
 * - Combat Level = derived from combat XP (1-138)
 * - Old character XP system kept for backward compatibility
 */

import mongoose, { ClientSession } from 'mongoose';
import { Character, ICharacter } from '../models/Character.model';
import { GoldService } from './gold.service';
import { InventoryService } from './inventory.service';
import {
  PROGRESSION,
  TOTAL_LEVEL_MILESTONES,
  COMBAT_LEVEL_MILESTONES,
  PRESTIGE_REQUIREMENTS,
  getTotalLevelMilestone,
  getNextTotalLevelMilestone,
  getCombatLevelMilestone,
  getNextCombatLevelMilestone,
  canPrestige,
  TotalLevelMilestone,
  CombatLevelMilestone
} from '@desperados/shared';
import { TransactionSource } from '../models/GoldTransaction.model';
import logger from '../utils/logger';
import { safeAchievementSet } from '../utils/achievementUtils';
import { ProgressionService } from './progression.service';
import { MilestoneRewardService } from './milestoneReward.service';
import * as UnlockTriggerService from './unlockTrigger.service';

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

/**
 * Total Level milestone result
 */
export interface TotalLevelMilestoneResult {
  newMilestonesReached: TotalLevelMilestone[];
  currentTier: string;
  currentTierColor: string;
  totalLevel: number;
  progressToNext: number;
  nextMilestone: TotalLevelMilestone | null;
}

/**
 * Combat Level milestone result
 */
export interface CombatLevelMilestoneResult {
  newMilestonesReached: CombatLevelMilestone[];
  currentTitle: string | null;
  combatLevel: number;
  combatXp: number;
  progressToNext: number;
  nextMilestone: CombatLevelMilestone | null;
}

/**
 * Prestige eligibility check result
 */
export interface PrestigeEligibilityResult {
  canPrestige: boolean;
  totalLevel: number;
  combatLevel: number;
  skillsAt50Plus: number;
  currentPrestige: number;
  reasons: string[];
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

      // Apply prestige XP multiplier if character has prestige bonuses
      let adjustedAmount = amount;
      const prestige = (character as any).prestige;
      if (prestige?.permanentBonuses && prestige.permanentBonuses.length > 0) {
        adjustedAmount = ProgressionService.applyPrestigeBonuses(
          amount,
          'xp_multiplier',
          prestige
        );
        if (adjustedAmount !== amount) {
          logger.debug(
            `Prestige XP bonus applied: ${amount} → ${adjustedAmount} for character ${characterId}`
          );
        }
      }

      const oldLevel = character.level;
      character.experience += adjustedAmount;

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

      // Trigger level-up hooks with timeout to ensure rewards process
      // RELIABILITY FIX: Previously fire-and-forget, now awaited with timeout
      if (levelsGained > 0) {
        try {
          await Promise.race([
            this.triggerLevelUpHooks(characterId.toString(), character.level),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Level-up hooks timeout after 5s')), 5000)
            )
          ]);
        } catch (err) {
          logger.error('Level-up hooks failed or timed out:', err);
        }

        // Achievement tracking: Level progression achievements
        const charIdStr = characterId.toString();
        const newLevel = character.level;

        // Set progress based on current level (not increment)
        safeAchievementSet(charIdStr, 'level_10', newLevel, 'progression:levelUp');
        safeAchievementSet(charIdStr, 'level_25', newLevel, 'progression:levelUp');
        safeAchievementSet(charIdStr, 'level_50', newLevel, 'progression:levelUp');
      }

      const result: ExperienceResult = {
        leveledUp: levelsGained > 0,
        oldLevel,
        newLevel: character.level,
        newExperience: character.experience,
        levelsGained,
      };

      logger.debug(
        `Added ${adjustedAmount} XP to character ${characterId} from ${source}. Level: ${oldLevel} → ${result.newLevel}`
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
   * Trigger level-up hooks (milestone rewards, cosmetic unlocks, etc.)
   * Fire-and-forget, errors are logged but don't fail the transaction
   */
  private static async triggerLevelUpHooks(
    characterId: string,
    newLevel: number
  ): Promise<void> {
    try {
      // Get character to find userId for unlock triggers
      const character = await Character.findById(characterId);
      if (!character) {
        logger.warn('Character not found for level-up hooks', { characterId, newLevel });
        return;
      }

      const userId = character.userId.toString();

      // Award milestone gameplay rewards (items, gold, features, modifiers)
      // Sprint 7: This is the primary hook for milestone rewards
      const milestoneResult = await MilestoneRewardService.checkAndAwardRewards(characterId, newLevel);
      if (milestoneResult && !milestoneResult.alreadyClaimed) {
        logger.info('Milestone rewards granted', {
          characterId,
          characterName: character.name,
          level: newLevel,
          title: milestoneResult.title,
          goldAwarded: milestoneResult.goldAwarded,
          feature: milestoneResult.featureUnlocked,
        });
      }

      // Process cosmetic unlocks (unlockTrigger.service handles cosmetics)
      await UnlockTriggerService.processLevelMilestone(userId, newLevel);

      logger.debug(`Level-up hooks completed for character ${characterId}, level ${newLevel}`);
    } catch (error) {
      logger.error('Error in level-up hooks:', error);
      // Don't throw - level-up hooks should not fail the main transaction
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

  // ===========================================================================
  // TOTAL LEVEL SYSTEM (New - Phase C3)
  // Replaces character-level progression with skill-based Total Level
  // ===========================================================================

  /**
   * Check and process Total Level milestones for a character
   * Called when Total Level changes (from SkillService)
   *
   * @param characterId - Character to check
   * @param newTotalLevel - New total level to check against
   * @param session - Optional MongoDB session
   * @returns Milestone check result
   */
  static async checkTotalLevelMilestones(
    characterId: string,
    newTotalLevel: number,
    session?: ClientSession
  ): Promise<TotalLevelMilestoneResult> {
    const character = await Character.findById(characterId).session(session || null);
    if (!character) {
      throw new Error('Character not found');
    }

    // Get previously claimed milestones
    const claimedMilestones = character.claimedTotalLevelMilestones || [];

    // Find newly reached milestones
    const newMilestones: TotalLevelMilestone[] = [];
    for (const milestone of TOTAL_LEVEL_MILESTONES) {
      const milestoneKey = milestone.totalLevel.toString();
      if (
        newTotalLevel >= milestone.totalLevel &&
        !claimedMilestones.includes(milestoneKey)
      ) {
        newMilestones.push(milestone);

        // Mark as claimed
        if (!character.claimedTotalLevelMilestones) {
          character.claimedTotalLevelMilestones = [];
        }
        character.claimedTotalLevelMilestones.push(milestoneKey);

        logger.info(
          `Character ${character.name} reached Total Level milestone: ${milestone.tier} (${milestone.totalLevel})`
        );
      }
    }

    // Save if there are new milestones
    if (newMilestones.length > 0) {
      await character.save({ session });

      // Process milestone rewards
      for (const milestone of newMilestones) {
        await this.processTotalLevelMilestoneRewards(
          characterId,
          milestone,
          session
        );
      }
    }

    // Get current tier info
    const currentMilestone = getTotalLevelMilestone(newTotalLevel);
    const nextMilestone = getNextTotalLevelMilestone(newTotalLevel);

    // Calculate progress to next milestone
    let progressToNext = 0;
    if (nextMilestone) {
      const currentThreshold = currentMilestone.totalLevel;
      const nextThreshold = nextMilestone.totalLevel;
      progressToNext = Math.floor(
        ((newTotalLevel - currentThreshold) / (nextThreshold - currentThreshold)) * 100
      );
    } else {
      progressToNext = 100; // At max tier
    }

    return {
      newMilestonesReached: newMilestones,
      currentTier: currentMilestone.tier,
      currentTierColor: currentMilestone.color,
      totalLevel: newTotalLevel,
      progressToNext,
      nextMilestone
    };
  }

  /**
   * Process rewards for reaching a Total Level milestone
   */
  private static async processTotalLevelMilestoneRewards(
    characterId: string,
    milestone: TotalLevelMilestone,
    session?: ClientSession
  ): Promise<void> {
    const character = await Character.findById(characterId).session(session || null);
    if (!character) return;

    const userId = character.userId.toString();

    // Award milestone-based rewards based on tier
    // Higher tiers get better rewards
    const rewards: RewardBundle = {};

    switch (milestone.tier) {
      case 'Tenderfoot':
        rewards.gold = 500;
        break;
      case 'Frontier Hand':
        rewards.gold = 2000;
        break;
      case 'Trailblazer':
        rewards.gold = 5000;
        break;
      case 'Veteran':
        rewards.gold = 10000;
        break;
      case 'Legend':
        rewards.gold = 25000;
        break;
      case 'Living Legend':
        rewards.gold = 50000;
        break;
      case 'Mythic':
        rewards.gold = 100000;
        break;
      case 'Immortal':
        rewards.gold = 250000;
        break;
      case 'God of the West':
        rewards.gold = 1000000;
        break;
    }

    if (rewards.gold) {
      await GoldService.addGold(
        character._id as mongoose.Types.ObjectId,
        rewards.gold,
        TransactionSource.QUEST_REWARD,
        { description: `Total Level ${milestone.tier} milestone` },
        session
      );

      logger.info(
        `Awarded ${rewards.gold} gold to ${character.name} for Total Level milestone: ${milestone.tier}`
      );
    }

    // Process cosmetic/feature unlocks
    await UnlockTriggerService.processLevelMilestone(userId, milestone.totalLevel);

    // Track achievements
    const charIdStr = characterId.toString();
    safeAchievementSet(charIdStr, `total_level_${milestone.totalLevel}`, 1, 'progression:totalLevel');
  }

  /**
   * Check and process Combat Level milestones for a character
   * Called when Combat XP changes (from SkillService.awardCombatXP)
   *
   * @param characterId - Character to check
   * @param newCombatLevel - New combat level to check against
   * @param combatXp - Current combat XP
   * @param session - Optional MongoDB session
   * @returns Milestone check result
   */
  static async checkCombatLevelMilestones(
    characterId: string,
    newCombatLevel: number,
    combatXp: number,
    session?: ClientSession
  ): Promise<CombatLevelMilestoneResult> {
    const character = await Character.findById(characterId).session(session || null);
    if (!character) {
      throw new Error('Character not found');
    }

    // Get previously claimed milestones
    const claimedMilestones = character.claimedCombatLevelMilestones || [];

    // Find newly reached milestones
    const newMilestones: CombatLevelMilestone[] = [];
    for (const milestone of COMBAT_LEVEL_MILESTONES) {
      const milestoneKey = milestone.level.toString();
      if (
        newCombatLevel >= milestone.level &&
        !claimedMilestones.includes(milestoneKey)
      ) {
        newMilestones.push(milestone);

        // Mark as claimed
        if (!character.claimedCombatLevelMilestones) {
          character.claimedCombatLevelMilestones = [];
        }
        character.claimedCombatLevelMilestones.push(milestoneKey);

        logger.info(
          `Character ${character.name} reached Combat Level milestone: ${milestone.title} (CL ${milestone.level})`
        );
      }
    }

    // Save if there are new milestones
    if (newMilestones.length > 0) {
      await character.save({ session });

      // Process milestone rewards
      for (const milestone of newMilestones) {
        await this.processCombatLevelMilestoneRewards(
          characterId,
          milestone,
          session
        );
      }
    }

    // Get current title info
    const currentMilestone = getCombatLevelMilestone(newCombatLevel);
    const nextMilestone = getNextCombatLevelMilestone(newCombatLevel);

    // Calculate progress to next milestone
    let progressToNext = 0;
    if (nextMilestone && currentMilestone) {
      const currentThreshold = currentMilestone.level;
      const nextThreshold = nextMilestone.level;
      progressToNext = Math.floor(
        ((newCombatLevel - currentThreshold) / (nextThreshold - currentThreshold)) * 100
      );
    } else if (nextMilestone) {
      // No current milestone (below first threshold)
      progressToNext = Math.floor((newCombatLevel / nextMilestone.level) * 100);
    } else {
      progressToNext = 100; // At max
    }

    return {
      newMilestonesReached: newMilestones,
      currentTitle: currentMilestone?.title || null,
      combatLevel: newCombatLevel,
      combatXp,
      progressToNext,
      nextMilestone
    };
  }

  /**
   * Process rewards for reaching a Combat Level milestone
   */
  private static async processCombatLevelMilestoneRewards(
    characterId: string,
    milestone: CombatLevelMilestone,
    session?: ClientSession
  ): Promise<void> {
    const character = await Character.findById(characterId).session(session || null);
    if (!character) return;

    // Award gold based on milestone
    const goldRewards: Record<number, number> = {
      10: 200,    // Scrapper
      25: 500,    // Brawler
      50: 2000,   // Gunslinger
      75: 5000,   // Desperado
      100: 15000, // Legendary
      126: 50000, // Death Dealer
      138: 200000 // God of Death
    };

    const goldAmount = goldRewards[milestone.level];
    if (goldAmount) {
      await GoldService.addGold(
        character._id as mongoose.Types.ObjectId,
        goldAmount,
        TransactionSource.QUEST_REWARD,
        { description: `Combat Level ${milestone.title} milestone` },
        session
      );

      logger.info(
        `Awarded ${goldAmount} gold to ${character.name} for Combat Level milestone: ${milestone.title}`
      );
    }

    // Track achievements
    const charIdStr = characterId.toString();
    safeAchievementSet(charIdStr, `combat_level_${milestone.level}`, 1, 'progression:combatLevel');
  }

  /**
   * Check prestige eligibility for a character
   */
  static async checkPrestigeEligibility(
    characterId: string
  ): Promise<PrestigeEligibilityResult> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const totalLevel = character.totalLevel || 30;
    const combatLevel = character.combatLevel || 1;
    const currentPrestige = character.prestige?.currentRank || 0;

    // Count skills at level 50+
    const skillsAt50Plus = (character.skills || []).filter(
      s => (s.level || 1) >= 50
    ).length;

    const eligibility = canPrestige(
      totalLevel,
      combatLevel,
      skillsAt50Plus,
      currentPrestige
    );

    return {
      canPrestige: eligibility.canPrestige,
      totalLevel,
      combatLevel,
      skillsAt50Plus,
      currentPrestige,
      reasons: eligibility.reasons
    };
  }

  /**
   * Get Total Level progress info for UI display
   */
  static async getTotalLevelProgress(characterId: string): Promise<{
    totalLevel: number;
    currentTier: string;
    currentTierColor: string;
    nextTier: string | null;
    nextTierLevel: number | null;
    progressToNext: number;
    unlocks: string[];
  }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const totalLevel = character.totalLevel || 30;
    const currentMilestone = getTotalLevelMilestone(totalLevel);
    const nextMilestone = getNextTotalLevelMilestone(totalLevel);

    let progressToNext = 0;
    if (nextMilestone) {
      const currentThreshold = currentMilestone.totalLevel;
      const nextThreshold = nextMilestone.totalLevel;
      progressToNext = Math.floor(
        ((totalLevel - currentThreshold) / (nextThreshold - currentThreshold)) * 100
      );
    } else {
      progressToNext = 100;
    }

    return {
      totalLevel,
      currentTier: currentMilestone.tier,
      currentTierColor: currentMilestone.color,
      nextTier: nextMilestone?.tier || null,
      nextTierLevel: nextMilestone?.totalLevel || null,
      progressToNext,
      unlocks: currentMilestone.unlocks
    };
  }

  /**
   * Get Combat Level progress info for UI display
   */
  static async getCombatLevelProgress(characterId: string): Promise<{
    combatLevel: number;
    combatXp: number;
    currentTitle: string | null;
    nextTitle: string | null;
    nextTitleLevel: number | null;
    progressToNext: number;
    unlocks: string[];
  }> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    const combatLevel = character.combatLevel || 1;
    const combatXp = character.combatXp || 0;
    const currentMilestone = getCombatLevelMilestone(combatLevel);
    const nextMilestone = getNextCombatLevelMilestone(combatLevel);

    let progressToNext = 0;
    if (nextMilestone && currentMilestone) {
      const currentThreshold = currentMilestone.level;
      const nextThreshold = nextMilestone.level;
      progressToNext = Math.floor(
        ((combatLevel - currentThreshold) / (nextThreshold - currentThreshold)) * 100
      );
    } else if (nextMilestone) {
      progressToNext = Math.floor((combatLevel / nextMilestone.level) * 100);
    } else {
      progressToNext = 100;
    }

    return {
      combatLevel,
      combatXp,
      currentTitle: currentMilestone?.title || null,
      nextTitle: nextMilestone?.title || null,
      nextTitleLevel: nextMilestone?.level || null,
      progressToNext,
      unlocks: currentMilestone?.unlocks || []
    };
  }
}
