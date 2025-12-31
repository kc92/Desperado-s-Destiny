/**
 * Achievement Service
 * Handles all achievement business logic with proper transaction support
 *
 * Phase 1.3: Consolidates logic from achievement.controller.ts and achievementUtils.ts
 * into a proper service layer following the BaseService pattern.
 *
 * Trigger Methods (fire-and-forget, called by other services):
 * - onCombatVictory(characterId, enemyType, damageTaken)
 * - onCrimeCompleted(characterId, crimeType)
 * - onQuestCompleted(characterId, questId)
 * - onLevelUp(characterId, newLevel)
 * - onDollarsEarned(characterId, amount, totalWealth)
 * - onItemCrafted(characterId, item, quality)
 * - onGamblingWin(characterId, winnings)
 * - onLocationVisited(characterId, locationId)
 * - onBossDefeated(characterId, bossId)
 * - onGangJoined(characterId)
 * - onGangCreated(characterId)
 * - onPrestige(characterId, prestigeRank)
 */

import mongoose, { ClientSession } from 'mongoose';
import { Achievement, IAchievement, ACHIEVEMENT_DEFINITIONS } from '../models/Achievement.model';
import { Character } from '../models/Character.model';
import { DollarService } from './dollar.service';
import { CharacterProgressionService } from './characterProgression.service';
import { InventoryService } from './inventory.service';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import logger from '../utils/logger';

// =============================================================================
// TYPES
// =============================================================================

export type AchievementCategory =
  | 'combat'
  | 'crime'
  | 'social'
  | 'economy'
  | 'exploration'
  | 'special'
  | 'crafting'
  | 'gambling'
  | 'progression';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'legendary';

export interface AchievementProgressResult {
  updated: boolean;
  completed: boolean;
  achievement?: IAchievement;
}

export interface AchievementSummary {
  byCategory: Record<AchievementCategory, { completed: number; total: number }>;
  byTier: Record<AchievementTier, { completed: number; total: number }>;
  total: number;
  completed: number;
}

export interface ClaimResult {
  success: boolean;
  dollarsAwarded: number;
  experienceAwarded: number;
  itemsAwarded: string[];
}

// =============================================================================
// SERVICE
// =============================================================================

export class AchievementService {
  // =========================================================================
  // TRIGGER METHODS
  // Called by other services to track achievement progress
  // These are fire-and-forget - errors are logged but don't fail the caller
  // =========================================================================

  /**
   * Trigger when a combat is won
   */
  static async onCombatVictory(
    characterId: string,
    enemyType: string,
    damageTaken: number = 0
  ): Promise<void> {
    try {
      // Track combat wins
      await this.incrementProgress(characterId, 'first_blood', 1);
      await this.incrementProgress(characterId, 'gunslinger_10', 1);
      await this.incrementProgress(characterId, 'gunslinger_50', 1);
      await this.incrementProgress(characterId, 'gunslinger_100', 1);

      // Flawless victory if no damage taken
      if (damageTaken === 0) {
        await this.incrementProgress(characterId, 'flawless_victory', 1);
      }

      // Boss-specific tracking
      if (enemyType === 'boss') {
        await this.incrementProgress(characterId, 'boss_slayer', 1);
        await this.incrementProgress(characterId, 'boss_hunter_5', 1);
      }

      // Endgame boss tracking (handled separately via onBossDefeated)
    } catch (error) {
      logger.error('Achievement trigger failed: onCombatVictory', {
        characterId,
        enemyType,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Trigger when a boss is defeated
   */
  static async onBossDefeated(
    characterId: string,
    bossId: string,
    bossLevel: number = 0
  ): Promise<void> {
    try {
      await this.incrementProgress(characterId, 'boss_slayer', 1);
      await this.incrementProgress(characterId, 'boss_hunter_5', 1);

      // Endgame bosses (level 45+)
      if (bossLevel >= 45) {
        await this.incrementProgress(characterId, 'endgame_boss_5', 1);
      }

      // Specific boss achievements
      if (bossId === 'cosmic_serpent') {
        await this.incrementProgress(characterId, 'cosmic_serpent_complete', 1);
      }
      if (bossId === 'cosmic_truth') {
        await this.incrementProgress(characterId, 'cosmic_truth_complete', 1);
      }
    } catch (error) {
      logger.error('Achievement trigger failed: onBossDefeated', {
        characterId,
        bossId,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Trigger when a crime is completed
   */
  static async onCrimeCompleted(characterId: string, crimeType: string): Promise<void> {
    try {
      await this.incrementProgress(characterId, 'petty_thief', 1);
      await this.incrementProgress(characterId, 'criminal_10', 1);
      await this.incrementProgress(characterId, 'criminal_50', 1);
      await this.incrementProgress(characterId, 'criminal_100', 1);
    } catch (error) {
      logger.error('Achievement trigger failed: onCrimeCompleted', {
        characterId,
        crimeType,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Trigger when a quest is completed
   */
  static async onQuestCompleted(characterId: string, questId: string): Promise<void> {
    try {
      // Track action completion achievements
      await this.incrementProgress(characterId, 'action_hero', 1);
    } catch (error) {
      logger.error('Achievement trigger failed: onQuestCompleted', {
        characterId,
        questId,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Trigger when character levels up
   */
  static async onLevelUp(characterId: string, newLevel: number): Promise<void> {
    try {
      // Set progress to current level (not increment)
      await this.setProgress(characterId, 'level_10', newLevel);
      await this.setProgress(characterId, 'level_25', newLevel);
      await this.setProgress(characterId, 'level_50', newLevel);
    } catch (error) {
      logger.error('Achievement trigger failed: onLevelUp', {
        characterId,
        newLevel,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Trigger when dollars are earned (tracks total wealth)
   */
  static async onDollarsEarned(
    characterId: string,
    amount: number,
    totalWealth: number
  ): Promise<void> {
    try {
      // Set progress to total wealth (not increment)
      await this.setProgress(characterId, 'first_gold', totalWealth);
      await this.setProgress(characterId, 'wealthy', totalWealth);
      await this.setProgress(characterId, 'rich', totalWealth);
      await this.setProgress(characterId, 'tycoon', totalWealth);
    } catch (error) {
      logger.error('Achievement trigger failed: onDollarsEarned', {
        characterId,
        amount,
        totalWealth,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Trigger when an item is crafted
   */
  static async onItemCrafted(
    characterId: string,
    itemId: string,
    quality: string = 'normal'
  ): Promise<void> {
    try {
      await this.incrementProgress(characterId, 'first_craft', 1);
      await this.incrementProgress(characterId, 'crafter_10', 1);
      await this.incrementProgress(characterId, 'crafter_50', 1);
      await this.incrementProgress(characterId, 'crafter_100', 1);

      // High quality items
      if (quality === 'high' || quality === 'excellent' || quality === 'masterwork') {
        await this.incrementProgress(characterId, 'quality_crafter', 1);
      }
    } catch (error) {
      logger.error('Achievement trigger failed: onItemCrafted', {
        characterId,
        itemId,
        quality,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Trigger when gambling is won
   */
  static async onGamblingWin(characterId: string, winnings: number): Promise<void> {
    try {
      await this.incrementProgress(characterId, 'first_gamble', 1);
      await this.incrementProgress(characterId, 'gambler_25', 1);
      await this.incrementProgress(characterId, 'high_roller', winnings);

      // Jackpot (5000+ in single win)
      if (winnings >= 5000) {
        await this.incrementProgress(characterId, 'jackpot_winner', 1);
      }
    } catch (error) {
      logger.error('Achievement trigger failed: onGamblingWin', {
        characterId,
        winnings,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Trigger when a location is visited
   */
  static async onLocationVisited(characterId: string, locationId: string): Promise<void> {
    try {
      await this.incrementProgress(characterId, 'wanderer', 1);
      await this.incrementProgress(characterId, 'world_traveler', 1);
      // Territory exploration tracked separately
    } catch (error) {
      logger.error('Achievement trigger failed: onLocationVisited', {
        characterId,
        locationId,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Trigger when joining a gang
   */
  static async onGangJoined(characterId: string): Promise<void> {
    try {
      await this.incrementProgress(characterId, 'gang_member', 1);
    } catch (error) {
      logger.error('Achievement trigger failed: onGangJoined', {
        characterId,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Trigger when creating a gang
   */
  static async onGangCreated(characterId: string): Promise<void> {
    try {
      await this.incrementProgress(characterId, 'gang_leader', 1);
    } catch (error) {
      logger.error('Achievement trigger failed: onGangCreated', {
        characterId,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Trigger when adding a friend
   */
  static async onFriendAdded(characterId: string, friendCount: number): Promise<void> {
    try {
      await this.incrementProgress(characterId, 'first_friend', 1);
      await this.setProgress(characterId, 'social_5', friendCount);
    } catch (error) {
      logger.error('Achievement trigger failed: onFriendAdded', {
        characterId,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Trigger when prestiging
   */
  static async onPrestige(characterId: string, prestigeRank: number): Promise<void> {
    try {
      await this.incrementProgress(characterId, 'first_prestige', 1);
      if (prestigeRank >= 2) await this.incrementProgress(characterId, 'prestige_2', 1);
      if (prestigeRank >= 3) await this.incrementProgress(characterId, 'prestige_3', 1);
      if (prestigeRank >= 4) await this.incrementProgress(characterId, 'prestige_4', 1);
      if (prestigeRank >= 5) await this.incrementProgress(characterId, 'prestige_5', 1);
    } catch (error) {
      logger.error('Achievement trigger failed: onPrestige', {
        characterId,
        prestigeRank,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Trigger when escaping jail
   */
  static async onJailEscape(characterId: string): Promise<void> {
    try {
      await this.incrementProgress(characterId, 'jailbreak', 1);
    } catch (error) {
      logger.error('Achievement trigger failed: onJailEscape', {
        characterId,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Trigger when wanted level changes
   */
  static async onWantedLevelChange(characterId: string, wantedLevel: number): Promise<void> {
    try {
      await this.setProgress(characterId, 'bounty_legend', wantedLevel);
    } catch (error) {
      logger.error('Achievement trigger failed: onWantedLevelChange', {
        characterId,
        wantedLevel,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Trigger when participating in world event
   */
  static async onWorldEventParticipation(characterId: string, eventType: string): Promise<void> {
    try {
      await this.incrementProgress(characterId, 'event_veteran', 1);
    } catch (error) {
      logger.error('Achievement trigger failed: onWorldEventParticipation', {
        characterId,
        eventType,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Trigger when surviving bounty hunter encounter
   */
  static async onBountyHunterSurvived(characterId: string): Promise<void> {
    try {
      await this.incrementProgress(characterId, 'bounty_hunter_survivor', 1);
    } catch (error) {
      logger.error('Achievement trigger failed: onBountyHunterSurvived', {
        characterId,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Trigger when drawing a royal flush
   */
  static async onRoyalFlush(characterId: string): Promise<void> {
    try {
      await this.incrementProgress(characterId, 'royal_flush', 1);
    } catch (error) {
      logger.error('Achievement trigger failed: onRoyalFlush', {
        characterId,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Trigger for near-death survival
   */
  static async onNearDeathSurvival(characterId: string): Promise<void> {
    try {
      await this.incrementProgress(characterId, 'survivor', 1);
    } catch (error) {
      logger.error('Achievement trigger failed: onNearDeathSurvival', {
        characterId,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  /**
   * Trigger for skill mastery
   */
  static async onSkillMastery(characterId: string, skillId: string, skillLevel: number): Promise<void> {
    try {
      if (skillLevel >= 100) {
        await this.incrementProgress(characterId, 'skill_master', 1);
      }
      if (skillLevel >= 50) {
        // Count skills at level 50+ for "Jack of All Trades"
        const character = await Character.findById(characterId);
        if (character) {
          const skillsAt50Plus = character.skills.filter(s => s.level >= 50).length;
          await this.setProgress(characterId, 'multi_skilled', skillsAt50Plus);
        }
      }
    } catch (error) {
      logger.error('Achievement trigger failed: onSkillMastery', {
        characterId,
        skillId,
        skillLevel,
        error: error instanceof Error ? error.message : error,
      });
    }
  }

  // =========================================================================
  // QUERY METHODS
  // Used by the controller for API responses
  // =========================================================================

  /**
   * Get all achievements for a character, initializing any missing ones
   */
  static async getAchievements(characterId: string): Promise<{
    achievements: Record<AchievementCategory, IAchievement[]>;
    stats: { completed: number; total: number; percentage: number };
    recentlyCompleted: IAchievement[];
  }> {
    // Get existing achievements
    let achievements = await Achievement.find({ characterId }).lean() as unknown as IAchievement[];

    // Initialize missing achievements
    const existingTypes = achievements.map((a) => a.achievementType);
    const missingAchievements = ACHIEVEMENT_DEFINITIONS.filter(
      (def) => !existingTypes.includes(def.type)
    );

    if (missingAchievements.length > 0) {
      const newAchievements = missingAchievements.map((def) => ({
        characterId,
        achievementType: def.type,
        title: def.title,
        description: def.description,
        category: def.category,
        tier: def.tier,
        target: def.target,
        progress: 0,
        completed: false,
        claimed: false,
        reward: def.reward,
      }));

      await Achievement.insertMany(newAchievements);
      achievements = await Achievement.find({ characterId }).lean() as unknown as IAchievement[];
    }

    // Group by category
    const grouped = {
      combat: achievements.filter((a) => a.category === 'combat'),
      crime: achievements.filter((a) => a.category === 'crime'),
      social: achievements.filter((a) => a.category === 'social'),
      economy: achievements.filter((a) => a.category === 'economy'),
      exploration: achievements.filter((a) => a.category === 'exploration'),
      special: achievements.filter((a) => a.category === 'special'),
      crafting: achievements.filter((a) => a.category === 'crafting'),
      gambling: achievements.filter((a) => a.category === 'gambling'),
      progression: achievements.filter((a) => a.category === 'progression'),
    } as Record<AchievementCategory, IAchievement[]>;

    // Calculate stats
    const completedCount = achievements.filter((a) => a.completed).length;
    const totalCount = achievements.length;
    const recentlyCompleted = achievements
      .filter((a) => a.completed && a.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 5);

    return {
      achievements: grouped,
      stats: {
        completed: completedCount,
        total: totalCount,
        percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      },
      recentlyCompleted,
    };
  }

  /**
   * Get achievement summary by category and tier
   */
  static async getSummary(characterId: string): Promise<AchievementSummary> {
    const achievements = await Achievement.find({ characterId }).lean() as unknown as IAchievement[];

    const byCategory = {
      combat: { completed: 0, total: 0 },
      crime: { completed: 0, total: 0 },
      social: { completed: 0, total: 0 },
      economy: { completed: 0, total: 0 },
      exploration: { completed: 0, total: 0 },
      special: { completed: 0, total: 0 },
      crafting: { completed: 0, total: 0 },
      gambling: { completed: 0, total: 0 },
      progression: { completed: 0, total: 0 },
    } as Record<AchievementCategory, { completed: number; total: number }>;

    const byTier = {
      bronze: { completed: 0, total: 0 },
      silver: { completed: 0, total: 0 },
      gold: { completed: 0, total: 0 },
      legendary: { completed: 0, total: 0 },
    } as Record<AchievementTier, { completed: number; total: number }>;

    achievements.forEach((a) => {
      if (byCategory[a.category as AchievementCategory]) {
        byCategory[a.category as AchievementCategory].total++;
      }
      if (byTier[a.tier as AchievementTier]) {
        byTier[a.tier as AchievementTier].total++;
      }

      if (a.completed) {
        if (byCategory[a.category as AchievementCategory]) {
          byCategory[a.category as AchievementCategory].completed++;
        }
        if (byTier[a.tier as AchievementTier]) {
          byTier[a.tier as AchievementTier].completed++;
        }
      }
    });

    return {
      byCategory,
      byTier,
      total: achievements.length,
      completed: achievements.filter((a) => a.completed).length,
    };
  }

  /**
   * Get unclaimed completed achievements
   */
  static async getUnclaimed(characterId: string): Promise<{
    unclaimed: IAchievement[];
    count: number;
    pendingRewards: { dollars: number; experience: number; items: (string | undefined)[] };
  }> {
    const unclaimed = await Achievement.find({
      characterId,
      completed: true,
      claimed: false,
    }).lean() as unknown as IAchievement[];

    const pendingRewards = {
      dollars: unclaimed.reduce((sum, a) => sum + (a.reward.gold || 0), 0),
      experience: unclaimed.reduce((sum, a) => sum + (a.reward.experience || 0), 0),
      items: unclaimed.filter((a) => a.reward.item).map((a) => a.reward.item),
    };

    return {
      unclaimed,
      count: unclaimed.length,
      pendingRewards,
    };
  }

  /**
   * Claim a single achievement reward
   * PHASE 4 FIX: Use atomic findOneAndUpdate to prevent race condition double-claims
   */
  static async claimReward(
    characterId: string,
    achievementId: string
  ): Promise<{ achievement: IAchievement; rewardsApplied: IAchievement['reward'] }> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // PHASE 4 FIX: Atomically check and mark claimed in single operation
      // This prevents race condition where two parallel requests could both pass the claimed check
      const achievement = await Achievement.findOneAndUpdate(
        {
          _id: achievementId,
          characterId,
          completed: true,
          claimed: false,  // Atomic check - only match if NOT claimed
        },
        {
          $set: {
            claimed: true,
            claimedAt: new Date()
          }
        },
        {
          new: true,
          session
        }
      );

      if (!achievement) {
        // Either not found, not completed, or already claimed - need to determine which
        const existing = await Achievement.findOne({
          _id: achievementId,
          characterId,
        }).session(session);

        if (!existing) {
          throw new Error('Achievement not found');
        }
        if (!existing.completed) {
          throw new Error('Achievement not completed');
        }
        if (existing.claimed) {
          throw new Error('Achievement rewards already claimed');
        }
        throw new Error('Failed to claim achievement');
      }

      // Apply rewards using proper services - achievement is already marked claimed
      if (achievement.reward.gold && achievement.reward.gold > 0) {
        await DollarService.addDollars(
          characterId,
          achievement.reward.gold,
          TransactionSource.ACHIEVEMENT,
          {
            description: `Achievement reward: ${achievement.title}`,
            currencyType: CurrencyType.DOLLAR,
          },
          session
        );
      }

      if (achievement.reward.experience && achievement.reward.experience > 0) {
        await CharacterProgressionService.addExperience(
          characterId,
          achievement.reward.experience,
          'ACHIEVEMENT_REWARD',
          session
        );
      }

      if (achievement.reward.item) {
        await InventoryService.addItems(
          characterId,
          [{ itemId: achievement.reward.item, quantity: 1 }],
          { type: 'other', id: achievementId, name: achievement.title },
          session
        );
      }

      await session.commitTransaction();

      return {
        achievement,
        rewardsApplied: achievement.reward,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Claim all unclaimed achievement rewards
   */
  static async claimAllRewards(characterId: string): Promise<ClaimResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const unclaimed = await Achievement.find({
        characterId,
        completed: true,
        claimed: false,
      }).session(session);

      if (unclaimed.length === 0) {
        await session.commitTransaction();
        return {
          success: true,
          dollarsAwarded: 0,
          experienceAwarded: 0,
          itemsAwarded: [],
        };
      }

      // Calculate total rewards
      let totalDollars = 0;
      let totalExperience = 0;
      const items: string[] = [];

      for (const achievement of unclaimed) {
        if (achievement.reward.gold) {
          totalDollars += achievement.reward.gold;
        }
        if (achievement.reward.experience) {
          totalExperience += achievement.reward.experience;
        }
        if (achievement.reward.item) {
          items.push(achievement.reward.item);
        }

        // Mark as claimed
        achievement.claimed = true;
        achievement.claimedAt = new Date();
        await achievement.save({ session });
      }

      // Apply rewards using proper services
      if (totalDollars > 0) {
        await DollarService.addDollars(
          characterId,
          totalDollars,
          TransactionSource.ACHIEVEMENT,
          {
            description: `Claimed ${unclaimed.length} achievement rewards`,
            currencyType: CurrencyType.DOLLAR,
          },
          session
        );
      }

      if (totalExperience > 0) {
        await CharacterProgressionService.addExperience(
          characterId,
          totalExperience,
          'ACHIEVEMENT_REWARD',
          session
        );
      }

      if (items.length > 0) {
        await InventoryService.addItems(
          characterId,
          items.map((itemId) => ({ itemId, quantity: 1 })),
          { type: 'other', id: 'achievement_claim_all', name: 'Achievement Rewards' },
          session
        );
      }

      await session.commitTransaction();

      return {
        success: true,
        dollarsAwarded: totalDollars,
        experienceAwarded: totalExperience,
        itemsAwarded: items,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Check if a character has completed a specific achievement
   */
  static async hasAchievement(characterId: string, achievementType: string): Promise<boolean> {
    const achievement = await Achievement.findOne({
      characterId,
      achievementType,
      completed: true,
    });
    return !!achievement;
  }

  /**
   * Grant an achievement directly (for special achievements not tracked by progress)
   */
  static async grantAchievement(characterId: string, achievementType: string): Promise<boolean> {
    try {
      const achievement = await Achievement.findOne({
        characterId,
        achievementType,
      });

      if (!achievement) {
        logger.warn(`Achievement ${achievementType} not found for character ${characterId}`);
        return false;
      }

      if (achievement.completed) {
        return true; // Already has it
      }

      achievement.progress = achievement.target;
      achievement.completed = true;
      achievement.completedAt = new Date();
      await achievement.save();

      logger.info('Achievement granted!', {
        characterId,
        achievementType,
        title: achievement.title,
      });

      return true;
    } catch (error) {
      logger.error('Failed to grant achievement', {
        characterId,
        achievementType,
        error: error instanceof Error ? error.message : error,
      });
      return false;
    }
  }

  // =========================================================================
  // INTERNAL METHODS
  // Core progress tracking logic
  // =========================================================================

  /**
   * Increment achievement progress by a given amount
   */
  static async incrementProgress(
    characterId: string,
    achievementType: string,
    amount: number = 1
  ): Promise<AchievementProgressResult> {
    try {
      const achievement = await Achievement.findOne({
        characterId,
        achievementType,
      });

      if (!achievement || achievement.completed) {
        return { updated: false, completed: false };
      }

      achievement.progress += amount;

      if (achievement.progress >= achievement.target) {
        achievement.progress = achievement.target;
        achievement.completed = true;
        achievement.completedAt = new Date();

        logger.info('Achievement completed!', {
          characterId,
          achievementType,
          title: achievement.title,
        });
      }

      await achievement.save();

      return {
        updated: true,
        completed: achievement.completed,
        achievement,
      };
    } catch (error) {
      logger.error('Error incrementing achievement progress:', {
        characterId,
        achievementType,
        amount,
        error: error instanceof Error ? error.message : error,
      });
      return { updated: false, completed: false };
    }
  }

  /**
   * Set achievement progress to a specific value
   * Used for tracking totals (like wealth) rather than increments
   */
  static async setProgress(
    characterId: string,
    achievementType: string,
    progress: number
  ): Promise<AchievementProgressResult> {
    try {
      const achievement = await Achievement.findOne({
        characterId,
        achievementType,
      });

      if (!achievement || achievement.completed) {
        return { updated: false, completed: false };
      }

      achievement.progress = progress;

      if (achievement.progress >= achievement.target) {
        achievement.progress = achievement.target;
        achievement.completed = true;
        achievement.completedAt = new Date();

        logger.info('Achievement completed!', {
          characterId,
          achievementType,
          title: achievement.title,
        });
      }

      await achievement.save();

      return {
        updated: true,
        completed: achievement.completed,
        achievement,
      };
    } catch (error) {
      logger.error('Error setting achievement progress:', {
        characterId,
        achievementType,
        progress,
        error: error instanceof Error ? error.message : error,
      });
      return { updated: false, completed: false };
    }
  }

  /**
   * Get specific achievement progress
   */
  static async getProgress(
    characterId: string,
    achievementType: string
  ): Promise<{ progress: number; target: number; completed: boolean } | null> {
    const achievement = await Achievement.findOne({
      characterId,
      achievementType,
    });

    if (!achievement) {
      return null;
    }

    return {
      progress: achievement.progress,
      target: achievement.target,
      completed: achievement.completed,
    };
  }
}
