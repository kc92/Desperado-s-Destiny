/**
 * Tutorial Milestone Service
 *
 * Handles awarding milestone rewards for tutorial phase completion
 * Integrates with achievement, progression, and inventory systems
 */

import mongoose, { ClientSession } from 'mongoose';
import { TutorialProgress, TutorialPhase } from '../models/TutorialProgress.model';
import { Character } from '../models/Character.model';
import { DollarService, TransactionSource } from './dollar.service';
import { CharacterProgressionService } from './characterProgression.service';
import { InventoryService } from './inventory.service';
import {
  ITutorialMilestone,
  TUTORIAL_MILESTONES,
  getMilestoneForPhase,
  getMilestoneById,
  calculateTotalMilestoneRewards,
  GRADUATION_REWARDS,
  HAWKS_FEATHER_ITEM
} from '../data/tutorialMilestones';
import { safeAchievementUpdate } from '../utils/achievementUtils';
import logger from '../utils/logger';
import { broadcastToUser } from '../config/socket';

/**
 * Milestone award result
 */
export interface IMilestoneAwardResult {
  milestoneId: string;
  milestoneName: string;
  xpAwarded: number;
  dollarsAwarded: number;
  itemsAwarded: Array<{ itemId: string; quantity: number }>;
  leveledUp: boolean;
  newLevel?: number;
  achievementUnlocked?: string;
}

/**
 * Graduation reward summary
 */
export interface IGraduationRewards {
  totalXp: number;
  totalDollars: number;
  specialItem: {
    itemId: string;
    name: string;
    description: string;
  };
  milestonesEarned: string[];
}

/**
 * Tutorial Milestone Service
 */
export class TutorialMilestoneService {
  /**
   * Award milestone for phase completion
   */
  static async awardMilestone(
    characterId: string | mongoose.Types.ObjectId,
    milestone: ITutorialMilestone,
    session?: ClientSession
  ): Promise<IMilestoneAwardResult> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const charIdStr = charId.toString();

    try {
      // Award XP
      let leveledUp = false;
      let newLevel: number | undefined;

      if (milestone.xpReward > 0) {
        const xpResult = await CharacterProgressionService.addExperience(
          charId,
          milestone.xpReward,
          `tutorial_milestone:${milestone.id}`,
          session
        );
        leveledUp = xpResult.leveledUp;
        newLevel = xpResult.newLevel;
      }

      // Award dollars
      if (milestone.dollarsReward > 0) {
        await DollarService.addDollars(
          charIdStr,
          milestone.dollarsReward,
          TransactionSource.ACHIEVEMENT,
          { source: 'tutorial_milestone', milestoneId: milestone.id },
          session
        );
      }

      // Award items
      const itemsAwarded: Array<{ itemId: string; quantity: number }> = [];
      if (milestone.itemReward) {
        await InventoryService.addItems(
          charId,
          [{ itemId: milestone.itemReward.itemId, quantity: milestone.itemReward.quantity }],
          { type: 'quest', id: milestone.id, name: 'Tutorial Milestone' },
          session
        );
        itemsAwarded.push(milestone.itemReward);
      }

      // Update achievement progress if type is defined
      if (milestone.achievementType) {
        await safeAchievementUpdate(
          charIdStr,
          milestone.achievementType,
          1,
          'tutorial_milestone'
        );
      }

      // Update tutorial progress with milestone
      const progress = await TutorialProgress.findByCharacterId(charId);
      if (progress && !progress.milestonesEarned.includes(milestone.id)) {
        progress.milestonesEarned.push(milestone.id);
        await progress.save({ session });
      }

      // Emit celebration event
      this.emitMilestoneUnlocked(charIdStr, milestone);

      logger.info('Tutorial milestone awarded', {
        characterId: charIdStr,
        milestoneId: milestone.id,
        xp: milestone.xpReward,
        dollars: milestone.dollarsReward,
        items: itemsAwarded
      });

      return {
        milestoneId: milestone.id,
        milestoneName: milestone.name,
        xpAwarded: milestone.xpReward,
        dollarsAwarded: milestone.dollarsReward,
        itemsAwarded,
        leveledUp,
        newLevel,
        achievementUnlocked: milestone.achievementType
      };
    } catch (error) {
      logger.error('Failed to award tutorial milestone', {
        characterId: charIdStr,
        milestoneId: milestone.id,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  /**
   * Award milestone by phase
   */
  static async awardMilestoneForPhase(
    characterId: string | mongoose.Types.ObjectId,
    phase: TutorialPhase,
    session?: ClientSession
  ): Promise<IMilestoneAwardResult | null> {
    const milestone = getMilestoneForPhase(phase);
    if (!milestone) {
      return null;
    }

    // Check if already awarded
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const progress = await TutorialProgress.findByCharacterId(charId);
    if (progress && progress.milestonesEarned.includes(milestone.id)) {
      logger.debug('Milestone already awarded', {
        characterId: charId.toString(),
        milestoneId: milestone.id
      });
      return null;
    }

    return this.awardMilestone(characterId, milestone, session);
  }

  /**
   * Award graduation rewards (final milestone + special items)
   */
  static async awardGraduationRewards(
    characterId: string | mongoose.Types.ObjectId,
    session?: ClientSession
  ): Promise<IGraduationRewards> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const charIdStr = charId.toString();

    // Award the graduation milestone
    const graduationMilestone = getMilestoneForPhase(TutorialPhase.GRADUATION);
    if (graduationMilestone) {
      await this.awardMilestone(charId, graduationMilestone, session);
    }

    // Mark graduation rewards as claimed
    const progress = await TutorialProgress.findByCharacterId(charId);
    if (progress) {
      progress.graduationRewardsClaimed = true;
      progress.completedAt = new Date();
      await progress.save({ session });
    }

    // Emit graduation event
    this.emitGraduation(charIdStr);

    logger.info('Tutorial graduation completed', {
      characterId: charIdStr,
      milestonesEarned: progress?.milestonesEarned || []
    });

    return {
      totalXp: GRADUATION_REWARDS.totalXp,
      totalDollars: GRADUATION_REWARDS.totalDollars,
      specialItem: GRADUATION_REWARDS.specialItem,
      milestonesEarned: progress?.milestonesEarned || []
    };
  }

  /**
   * Get player's tutorial milestones
   */
  static async getCharacterMilestones(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<{
    earned: ITutorialMilestone[];
    available: ITutorialMilestone[];
    total: number;
    progress: number;
  }> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const progress = await TutorialProgress.findByCharacterId(charId);
    const earnedIds = progress?.milestonesEarned || [];

    const earned = TUTORIAL_MILESTONES.filter(m => earnedIds.includes(m.id));
    const available = TUTORIAL_MILESTONES.filter(m => !earnedIds.includes(m.id));

    return {
      earned,
      available,
      total: TUTORIAL_MILESTONES.length,
      progress: (earned.length / TUTORIAL_MILESTONES.length) * 100
    };
  }

  /**
   * Get milestone by ID
   */
  static getMilestone(milestoneId: string): ITutorialMilestone | undefined {
    return getMilestoneById(milestoneId);
  }

  /**
   * Calculate total rewards summary
   */
  static getTotalRewardsSummary(): ReturnType<typeof calculateTotalMilestoneRewards> {
    return calculateTotalMilestoneRewards();
  }

  /**
   * Emit milestone unlocked event
   */
  private static emitMilestoneUnlocked(
    characterId: string,
    milestone: ITutorialMilestone
  ): void {
    try {
      broadcastToUser(characterId, 'tutorial:milestone_unlocked', {
        milestoneId: milestone.id,
        name: milestone.name,
        description: milestone.description,
        icon: milestone.icon,
        rewards: {
          xp: milestone.xpReward,
          dollars: milestone.dollarsReward,
          items: milestone.itemReward ? [milestone.itemReward] : []
        }
      });
    } catch (error) {
      logger.debug('Failed to emit milestone event', {
        characterId,
        milestoneId: milestone.id
      });
    }
  }

  /**
   * Emit graduation event
   */
  private static emitGraduation(characterId: string): void {
    try {
      broadcastToUser(characterId, 'tutorial:graduation', {
        rewards: GRADUATION_REWARDS,
        message: "Congratulations! You've completed Hawk's mentorship."
      });
    } catch (error) {
      logger.debug('Failed to emit graduation event', { characterId });
    }
  }

  /**
   * Retroactively award missing milestones
   * (For players who completed phases without getting rewards)
   */
  static async awardMissingMilestones(
    characterId: string | mongoose.Types.ObjectId,
    session?: ClientSession
  ): Promise<IMilestoneAwardResult[]> {
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    const progress = await TutorialProgress.findByCharacterId(charId);
    if (!progress) {
      return [];
    }

    const results: IMilestoneAwardResult[] = [];

    // Check each completed phase for missing milestones
    for (const completedPhase of progress.phasesCompleted) {
      const milestone = getMilestoneForPhase(completedPhase);
      if (milestone && !progress.milestonesEarned.includes(milestone.id)) {
        const result = await this.awardMilestone(charId, milestone, session);
        results.push(result);
      }
    }

    return results;
  }
}
