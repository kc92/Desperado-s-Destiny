/**
 * Holiday Rewards Service
 * Manages reward distribution and validation for holiday events
 */

import {
  Reward,
  HolidayEvent,
  HolidayQuest,
  HolidayActivity,
  DailyChallenge,
} from '@desperados/shared';
import { HolidayProgress } from '../models/HolidayProgress.model';
import { Character } from '../models/Character.model';
import * as HolidayData from '../data/holidays/index';

interface RewardResult {
  success: boolean;
  rewards: ProcessedReward[];
  errors: string[];
}

interface ProcessedReward {
  type: string;
  id: string;
  amount: number;
  name?: string;
  rarity?: string;
}

export class HolidayRewardsService {
  /**
   * Process and distribute quest rewards
   */
  static async distributeQuestRewards(
    characterId: string,
    holidayId: string,
    questId: string
  ): Promise<RewardResult> {
    const holiday = HolidayData.getHolidayEventById(holidayId);
    if (!holiday) {
      return {
        success: false,
        rewards: [],
        errors: ['Holiday not found'],
      };
    }

    const quest = holiday.specialQuests.find((q) => q.id === questId);
    if (!quest) {
      return {
        success: false,
        rewards: [],
        errors: ['Quest not found'],
      };
    }

    const progress = await HolidayProgress.findByCharacterAndHoliday(
      characterId,
      holidayId
    );

    if (!progress) {
      return {
        success: false,
        rewards: [],
        errors: ['Holiday progress not found'],
      };
    }

    return this.processRewards(characterId, holidayId, quest.rewards, progress);
  }

  /**
   * Process and distribute activity rewards
   */
  static async distributeActivityRewards(
    characterId: string,
    holidayId: string,
    activityId: string,
    rank?: number
  ): Promise<RewardResult> {
    const holiday = HolidayData.getHolidayEventById(holidayId);
    if (!holiday) {
      return {
        success: false,
        rewards: [],
        errors: ['Holiday not found'],
      };
    }

    const activity = holiday.activities.find((a) => a.id === activityId);
    if (!activity) {
      return {
        success: false,
        rewards: [],
        errors: ['Activity not found'],
      };
    }

    const progress = await HolidayProgress.findByCharacterAndHoliday(
      characterId,
      holidayId
    );

    if (!progress) {
      return {
        success: false,
        rewards: [],
        errors: ['Holiday progress not found'],
      };
    }

    // Could scale rewards based on rank
    const rewards = rank ? this.scaleRewardsByRank(activity.rewards, rank) : activity.rewards;

    return this.processRewards(characterId, holidayId, rewards, progress);
  }

  /**
   * Process and distribute daily challenge rewards
   */
  static async distributeDailyChallengeRewards(
    characterId: string,
    holidayId: string,
    challengeId: string
  ): Promise<RewardResult> {
    const holiday = HolidayData.getHolidayEventById(holidayId);
    if (!holiday) {
      return {
        success: false,
        rewards: [],
        errors: ['Holiday not found'],
      };
    }

    const challenge = holiday.dailyChallenges.find((c) => c.id === challengeId);
    if (!challenge) {
      return {
        success: false,
        rewards: [],
        errors: ['Challenge not found'],
      };
    }

    const progress = await HolidayProgress.findByCharacterAndHoliday(
      characterId,
      holidayId
    );

    if (!progress) {
      return {
        success: false,
        rewards: [],
        errors: ['Holiday progress not found'],
      };
    }

    return this.processRewards(characterId, holidayId, [challenge.reward], progress);
  }

  /**
   * Distribute participation rewards
   */
  static async distributeParticipationRewards(
    characterId: string,
    holidayId: string
  ): Promise<RewardResult> {
    const holiday = HolidayData.getHolidayEventById(holidayId);
    if (!holiday) {
      return {
        success: false,
        rewards: [],
        errors: ['Holiday not found'],
      };
    }

    const progress = await HolidayProgress.findByCharacterAndHoliday(
      characterId,
      holidayId
    );

    if (!progress) {
      return {
        success: false,
        rewards: [],
        errors: ['Holiday progress not found'],
      };
    }

    return this.processRewards(
      characterId,
      holidayId,
      holiday.participationRewards,
      progress
    );
  }

  /**
   * Distribute completion rewards (for finishing all event content)
   */
  static async distributeCompletionRewards(
    characterId: string,
    holidayId: string
  ): Promise<RewardResult> {
    const holiday = HolidayData.getHolidayEventById(holidayId);
    if (!holiday) {
      return {
        success: false,
        rewards: [],
        errors: ['Holiday not found'],
      };
    }

    const progress = await HolidayProgress.findByCharacterAndHoliday(
      characterId,
      holidayId
    );

    if (!progress) {
      return {
        success: false,
        rewards: [],
        errors: ['Holiday progress not found'],
      };
    }

    // Check if player has completed all quests
    const allQuestsCompleted = this.hasCompletedAllQuests(holiday, progress);
    if (!allQuestsCompleted) {
      return {
        success: false,
        rewards: [],
        errors: ['Not all quests completed'],
      };
    }

    return this.processRewards(
      characterId,
      holidayId,
      holiday.completionRewards,
      progress
    );
  }

  /**
   * Process a list of rewards
   */
  private static async processRewards(
    characterId: string,
    holidayId: string,
    rewards: Reward[],
    progress: any
  ): Promise<RewardResult> {
    const processedRewards: ProcessedReward[] = [];
    const errors: string[] = [];

    const character = await Character.findById(characterId);
    if (!character) {
      return {
        success: false,
        rewards: [],
        errors: ['Character not found'],
      };
    }

    for (const reward of rewards) {
      try {
        const processed = await this.processIndividualReward(
          character,
          progress,
          reward
        );
        processedRewards.push(processed);
      } catch (error) {
        errors.push(`Failed to process ${reward.type} reward: ${error}`);
      }
    }

    await progress.save();
    await character.save();

    return {
      success: errors.length === 0,
      rewards: processedRewards,
      errors,
    };
  }

  /**
   * Process a single reward
   */
  private static async processIndividualReward(
    character: any,
    progress: any,
    reward: Reward
  ): Promise<ProcessedReward> {
    const processed: ProcessedReward = {
      type: reward.type,
      id: reward.id,
      amount: reward.amount,
      rarity: reward.rarity,
    };

    switch (reward.type) {
      case 'GOLD':
        character.gold = (character.gold || 0) + reward.amount;
        processed.name = 'Gold';
        break;

      case 'XP':
        character.experience = (character.experience || 0) + reward.amount;
        processed.name = 'Experience';
        // Handle level up if needed
        break;

      case 'CURRENCY':
        progress.addCurrency(reward.amount);
        processed.name = `Holiday Currency (${reward.id})`;
        break;

      case 'ITEM':
        progress.collectItem(reward.id);
        processed.name = reward.id;
        // Would add to character inventory here
        break;

      case 'COSMETIC':
        progress.unlockCosmetic(reward.id);
        processed.name = reward.id;
        break;

      case 'TITLE':
        progress.earnTitle(reward.id);
        processed.name = reward.id;
        // Would add to character titles
        break;

      case 'ACHIEVEMENT':
        progress.unlockAchievement(reward.id);
        processed.name = reward.id;
        break;

      default:
        throw new Error(`Unknown reward type: ${reward.type}`);
    }

    return processed;
  }

  /**
   * Check if player has completed all non-repeatable quests
   */
  private static hasCompletedAllQuests(
    holiday: HolidayEvent,
    progress: any
  ): boolean {
    const nonRepeatableQuests = holiday.specialQuests.filter(
      (q) => !q.repeatable
    );

    for (const quest of nonRepeatableQuests) {
      if (!progress.hasCompletedQuest(quest.id)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Scale rewards based on placement/rank
   */
  private static scaleRewardsByRank(
    rewards: Reward[],
    rank: number
  ): Reward[] {
    const scaleFactor = this.getScaleFactorByRank(rank);

    return rewards.map((reward) => ({
      ...reward,
      amount: Math.floor(reward.amount * scaleFactor),
    }));
  }

  /**
   * Get reward scale factor based on rank
   */
  private static getScaleFactorByRank(rank: number): number {
    if (rank === 1) return 2.0; // First place: 200%
    if (rank === 2) return 1.5; // Second place: 150%
    if (rank === 3) return 1.25; // Third place: 125%
    if (rank <= 10) return 1.1; // Top 10: 110%
    return 1.0; // Everyone else: 100%
  }

  /**
   * Calculate total potential rewards for a holiday
   */
  static calculateTotalRewards(holidayId: string): {
    minGold: number;
    maxGold: number;
    minCurrency: number;
    maxCurrency: number;
    itemCount: number;
    cosmeticCount: number;
    achievementCount: number;
  } {
    const holiday = HolidayData.getHolidayEventById(holidayId);
    if (!holiday) {
      return {
        minGold: 0,
        maxGold: 0,
        minCurrency: 0,
        maxCurrency: 0,
        itemCount: 0,
        cosmeticCount: 0,
        achievementCount: 0,
      };
    }

    let minGold = 0;
    let maxGold = 0;
    let minCurrency = 0;
    let maxCurrency = 0;
    let itemCount = 0;
    let cosmeticCount = 0;
    let achievementCount = 0;

    // Count from quests
    for (const quest of holiday.specialQuests) {
      for (const reward of quest.rewards) {
        if (reward.type === 'GOLD') {
          minGold += reward.amount;
          if (quest.repeatable && quest.dailyLimit) {
            maxGold += reward.amount * quest.dailyLimit * holiday.duration;
          } else {
            maxGold += reward.amount;
          }
        } else if (reward.type === 'CURRENCY') {
          minCurrency += reward.amount;
          if (quest.repeatable && quest.dailyLimit) {
            maxCurrency += reward.amount * quest.dailyLimit * holiday.duration;
          } else {
            maxCurrency += reward.amount;
          }
        } else if (reward.type === 'ITEM') {
          itemCount++;
        } else if (reward.type === 'COSMETIC') {
          cosmeticCount++;
        } else if (reward.type === 'ACHIEVEMENT') {
          achievementCount++;
        }
      }
    }

    // Add participation and completion rewards
    for (const reward of [
      ...holiday.participationRewards,
      ...holiday.completionRewards,
    ]) {
      if (reward.type === 'GOLD') {
        minGold += reward.amount;
        maxGold += reward.amount;
      } else if (reward.type === 'CURRENCY') {
        minCurrency += reward.amount;
        maxCurrency += reward.amount;
      } else if (reward.type === 'ITEM') {
        itemCount++;
      } else if (reward.type === 'COSMETIC') {
        cosmeticCount++;
      } else if (reward.type === 'ACHIEVEMENT') {
        achievementCount++;
      }
    }

    return {
      minGold,
      maxGold,
      minCurrency,
      maxCurrency,
      itemCount,
      cosmeticCount,
      achievementCount,
    };
  }

  /**
   * Award bonus rewards for exceptional performance
   */
  static async awardBonusRewards(
    characterId: string,
    holidayId: string,
    bonusType: 'TOP_PARTICIPANT' | 'PERFECT_COMPLETION' | 'SPEED_BONUS',
    bonusMultiplier: number = 1.5
  ): Promise<RewardResult> {
    const progress = await HolidayProgress.findByCharacterAndHoliday(
      characterId,
      holidayId
    );

    if (!progress) {
      return {
        success: false,
        rewards: [],
        errors: ['Holiday progress not found'],
      };
    }

    const bonusAmount = Math.floor(progress.currencyEarned * bonusMultiplier);
    progress.addCurrency(bonusAmount);

    await progress.save();

    return {
      success: true,
      rewards: [
        {
          type: 'CURRENCY',
          id: 'BONUS',
          amount: bonusAmount,
          name: `${bonusType} Bonus`,
        },
      ],
      errors: [],
    };
  }

  /**
   * Get player's earned rewards summary
   */
  static async getRewardSummary(
    characterId: string,
    holidayId: string
  ): Promise<any> {
    const progress = await HolidayProgress.findByCharacterAndHoliday(
      characterId,
      holidayId
    );

    if (!progress) {
      return null;
    }

    return {
      currencyEarned: progress.currencyEarned,
      currencySpent: progress.currencySpent,
      currencyBalance: progress.currencyBalance,
      itemsCollected: progress.itemsCollected.length,
      cosmeticsUnlocked: progress.cosmeticsUnlocked.length,
      titlesEarned: progress.titlesEarned.length,
      achievementsUnlocked: progress.achievementsUnlocked.length,
      questsCompleted: progress.completedQuests.length,
    };
  }

  /**
   * Validate reward eligibility
   */
  static async validateRewardEligibility(
    characterId: string,
    holidayId: string,
    rewardType: 'PARTICIPATION' | 'COMPLETION'
  ): Promise<{
    eligible: boolean;
    reason?: string;
  }> {
    const progress = await HolidayProgress.findByCharacterAndHoliday(
      characterId,
      holidayId
    );

    if (!progress) {
      return {
        eligible: false,
        reason: 'No holiday progress found',
      };
    }

    if (rewardType === 'PARTICIPATION') {
      return {
        eligible: progress.participated,
        reason: progress.participated
          ? undefined
          : 'Must participate in event first',
      };
    }

    if (rewardType === 'COMPLETION') {
      const holiday = HolidayData.getHolidayEventById(holidayId);
      if (!holiday) {
        return {
          eligible: false,
          reason: 'Holiday not found',
        };
      }

      const allCompleted = this.hasCompletedAllQuests(holiday, progress);
      return {
        eligible: allCompleted,
        reason: allCompleted ? undefined : 'Not all quests completed',
      };
    }

    return {
      eligible: false,
      reason: 'Unknown reward type',
    };
  }
}
