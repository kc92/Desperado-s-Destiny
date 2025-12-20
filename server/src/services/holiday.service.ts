/**
 * Holiday Service
 * Manages holiday event mechanics and interactions
 */

import {
  HolidayEvent,
  HolidayQuest,
  HolidayActivity,
  ActiveHoliday,
  QuestObjective,
  HolidayType,
  HolidayShop,
  HolidayShopItem,
  ContestEntry,
} from '@desperados/shared';
import * as HolidayData from '../data/holidays/index';
import { HolidayProgress } from '../models/HolidayProgress.model';
import { Character } from '../models/Character.model';
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import { DollarService } from './dollar.service';
import logger from '../utils/logger';

export class HolidayService {
  /**
   * Get all currently active holiday events
   */
  static async getActiveEvents(date: Date = new Date()): Promise<ActiveHoliday[]> {
    const activeEvents = HolidayData.getActiveHolidayEvents(date);

    const activeHolidays: ActiveHoliday[] = [];

    for (const event of activeEvents) {
      const startedAt = this.getEventStartDate(event, date);
      const endsAt = this.getEventEndDate(event, date);
      const daysRemaining = Math.ceil(
        (endsAt.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Count participants
      const participantCount = await HolidayProgress.countDocuments({
        holidayId: event.id,
        participated: true,
      });

      activeHolidays.push({
        event,
        isActive: true,
        daysRemaining,
        participants: participantCount,
        startedAt,
        endsAt,
      });
    }

    return activeHolidays;
  }

  /**
   * Get a specific holiday event by ID
   */
  static getHolidayEvent(holidayId: string): HolidayEvent | undefined {
    return HolidayData.getHolidayEventById(holidayId);
  }

  /**
   * Check if a holiday is currently active
   */
  static isEventActive(holidayId: string, date: Date = new Date()): boolean {
    const holiday = HolidayData.getHolidayEventById(holidayId);
    if (!holiday) return false;
    return HolidayData.isHolidayEventActive(holiday, date);
  }

  /**
   * Get player's progress for a holiday
   */
  static async getPlayerProgress(
    characterId: string,
    holidayId: string
  ): Promise<any> {
    const progress = await HolidayProgress.findOne({
      characterId,
      holidayId,
    }).populate('characterId', 'name level');

    if (!progress) return null;

    const holiday = HolidayData.getHolidayEventById(holidayId);
    if (!holiday) return progress;

    // Calculate completion percentage
    const totalQuests = holiday.specialQuests.length;
    const completionRate = progress.getCompletionPercentage(totalQuests);

    return {
      ...progress.toObject(),
      completionRate,
      totalQuests,
      availableQuests: totalQuests - progress.completedQuests.length,
    };
  }

  /**
   * Initialize or get player's holiday progress
   */
  static async initializePlayerProgress(
    playerId: string,
    characterId: string,
    holidayId: string
  ): Promise<any> {
    const holiday = HolidayData.getHolidayEventById(holidayId);
    if (!holiday) {
      throw new Error('Holiday event not found');
    }

    if (!this.isEventActive(holidayId)) {
      throw new Error('Holiday event is not currently active');
    }

    const progress = await HolidayProgress.findByCharacterAndHoliday(
      characterId,
      holidayId
    );

    if (progress) {
      return progress;
    }

    // Create new progress
    const newProgress = await HolidayProgress.initializeProgress(
      playerId,
      characterId,
      holidayId,
      holiday.type
    );

    // Award participation rewards
    await this.awardParticipationRewards(newProgress, holiday);

    return newProgress;
  }

  /**
   * Award participation rewards when player first joins event
   */
  private static async awardParticipationRewards(
    progress: any,
    holiday: HolidayEvent
  ): Promise<void> {
    for (const reward of holiday.participationRewards) {
      switch (reward.type) {
        case 'CURRENCY':
          progress.addCurrency(reward.amount);
          break;
        case 'ITEM':
          progress.collectItem(reward.id);
          break;
        case 'COSMETIC':
          progress.unlockCosmetic(reward.id);
          break;
        case 'TITLE':
          progress.earnTitle(reward.id);
          break;
        case 'ACHIEVEMENT':
          progress.unlockAchievement(reward.id);
          break;
      }
    }

    await progress.save();
  }

  /**
   * Get available quests for a player
   */
  static async getAvailableQuests(
    characterId: string,
    holidayId: string
  ): Promise<HolidayQuest[]> {
    const holiday = HolidayData.getHolidayEventById(holidayId);
    if (!holiday) return [];

    const progress = await HolidayProgress.findByCharacterAndHoliday(
      characterId,
      holidayId
    );

    const character = await Character.findById(characterId);
    if (!character) return [];

    return holiday.specialQuests.filter((quest) => {
      // Check if already completed (for non-repeatable)
      if (
        !quest.repeatable &&
        progress &&
        progress.hasCompletedQuest(quest.id)
      ) {
        return false;
      }

      // Check daily limit
      if (
        quest.dailyLimit &&
        progress &&
        progress.getDailyChallengeCount(quest.id) >= quest.dailyLimit
      ) {
        return false;
      }

      // Check requirements
      return this.meetsQuestRequirements(character, quest, progress);
    });
  }

  /**
   * Check if character meets quest requirements
   */
  private static meetsQuestRequirements(
    character: any,
    quest: HolidayQuest,
    progress: any
  ): boolean {
    for (const req of quest.requirements) {
      switch (req.type) {
        case 'LEVEL':
          if (character.level < req.value) return false;
          break;
        case 'QUEST_COMPLETED':
          if (!progress || !progress.hasCompletedQuest(req.value as string)) {
            return false;
          }
          break;
        case 'ITEM':
          // Would need to check inventory
          break;
        case 'GANG':
          if (req.value !== 'ANY' && character.gang !== req.value) {
            return false;
          }
          break;
      }
    }
    return true;
  }

  /**
   * Complete a quest objective
   */
  static async completeQuestObjective(
    characterId: string,
    holidayId: string,
    questId: string,
    objectiveId: string,
    progress: number = 1
  ): Promise<any> {
    const holidayProgress = await HolidayProgress.findByCharacterAndHoliday(
      characterId,
      holidayId
    );

    if (!holidayProgress) {
      throw new Error('Holiday progress not found');
    }

    const holiday = HolidayData.getHolidayEventById(holidayId);
    if (!holiday) {
      throw new Error('Holiday not found');
    }

    const quest = holiday.specialQuests.find((q) => q.id === questId);
    if (!quest) {
      throw new Error('Quest not found');
    }

    // Update quest progress (would need separate tracking model)
    // For now, we'll just mark it complete if all objectives done

    return holidayProgress;
  }

  /**
   * Complete a holiday quest
   */
  static async completeQuest(
    characterId: string,
    holidayId: string,
    questId: string
  ): Promise<any> {
    const progress = await HolidayProgress.findByCharacterAndHoliday(
      characterId,
      holidayId
    );

    if (!progress) {
      throw new Error('Holiday progress not found');
    }

    const holiday = HolidayData.getHolidayEventById(holidayId);
    if (!holiday) {
      throw new Error('Holiday not found');
    }

    const quest = holiday.specialQuests.find((q) => q.id === questId);
    if (!quest) {
      throw new Error('Quest not found');
    }

    // Check if already completed today (for daily limits)
    if (quest.dailyLimit) {
      const count = progress.getDailyChallengeCount(questId);
      if (count >= quest.dailyLimit) {
        throw new Error('Daily quest limit reached');
      }
      progress.incrementDailyChallenge(questId);
    } else {
      progress.addCompletedQuest(questId);
    }

    // Award rewards
    const rewards = await this.awardQuestRewards(progress, quest);

    await progress.save();

    return {
      progress,
      rewards,
      questCompleted: true,
    };
  }

  /**
   * Award quest rewards to player
   */
  private static async awardQuestRewards(
    progress: any,
    quest: HolidayQuest
  ): Promise<any[]> {
    const rewards: any[] = [];

    for (const reward of quest.rewards) {
      switch (reward.type) {
        case 'CURRENCY':
          progress.addCurrency(reward.amount);
          rewards.push({
            type: 'CURRENCY',
            id: reward.id,
            amount: reward.amount,
          });
          break;
        case 'GOLD':
          // Actually apply the dollar reward to character
          try {
            await DollarService.addDollars(
              progress.characterId.toString(),
              reward.amount,
              TransactionSource.HOLIDAY_REWARD,
              { questId: quest.id, holidayId: progress.holidayId }
            );
            rewards.push({ type: 'GOLD', amount: reward.amount });
          } catch (error) {
            logger.error('Failed to award holiday dollars', { error, characterId: progress.characterId, amount: reward.amount });
          }
          break;
        case 'XP':
          // Actually apply the XP reward to character
          try {
            await Character.findByIdAndUpdate(
              progress.characterId,
              { $inc: { experience: reward.amount } }
            );
            rewards.push({ type: 'XP', amount: reward.amount });
          } catch (error) {
            logger.error('Failed to award holiday XP', { error, characterId: progress.characterId, amount: reward.amount });
          }
          break;
        case 'ITEM':
          progress.collectItem(reward.id);
          rewards.push({
            type: 'ITEM',
            id: reward.id,
            amount: reward.amount,
          });
          break;
        case 'COSMETIC':
          progress.unlockCosmetic(reward.id);
          rewards.push({ type: 'COSMETIC', id: reward.id });
          break;
        case 'TITLE':
          progress.earnTitle(reward.id);
          rewards.push({ type: 'TITLE', id: reward.id });
          break;
        case 'ACHIEVEMENT':
          progress.unlockAchievement(reward.id);
          rewards.push({ type: 'ACHIEVEMENT', id: reward.id });
          break;
      }
    }

    return rewards;
  }

  /**
   * Get holiday shop items
   */
  static getShopItems(holidayId: string): HolidayShop | undefined {
    const holiday = HolidayData.getHolidayEventById(holidayId);
    if (!holiday || holiday.limitedShops.length === 0) return undefined;

    return holiday.limitedShops[0];
  }

  /**
   * Purchase item from holiday shop
   */
  static async purchaseShopItem(
    characterId: string,
    holidayId: string,
    itemId: string
  ): Promise<any> {
    const progress = await HolidayProgress.findByCharacterAndHoliday(
      characterId,
      holidayId
    );

    if (!progress) {
      throw new Error('Holiday progress not found');
    }

    const shop = this.getShopItems(holidayId);
    if (!shop) {
      throw new Error('Holiday shop not found');
    }

    const item = shop.items.find((i) => i.itemId === itemId);
    if (!item) {
      throw new Error('Item not found in shop');
    }

    // Check if player has enough currency
    if (progress.currencyBalance < item.cost) {
      throw new Error('Insufficient holiday currency');
    }

    // Check purchase limit
    if (item.purchaseLimit) {
      const purchased = progress.itemsCollected.filter(
        (i) => i === itemId
      ).length;
      if (purchased >= item.purchaseLimit) {
        throw new Error('Purchase limit reached for this item');
      }
    }

    // Check level requirement
    const character = await Character.findById(characterId);
    if (item.requiredLevel && character && character.level < item.requiredLevel) {
      throw new Error('Level requirement not met');
    }

    // Process purchase
    const success = progress.spendCurrency(item.cost);
    if (!success) {
      throw new Error('Failed to spend currency');
    }

    progress.collectItem(itemId);
    await progress.save();

    return {
      purchased: true,
      item,
      remainingCurrency: progress.currencyBalance,
    };
  }

  /**
   * Join a holiday activity
   */
  static async joinActivity(
    characterId: string,
    holidayId: string,
    activityId: string
  ): Promise<any> {
    const progress = await HolidayProgress.findByCharacterAndHoliday(
      characterId,
      holidayId
    );

    if (!progress) {
      throw new Error('Holiday progress not found');
    }

    const holiday = HolidayData.getHolidayEventById(holidayId);
    if (!holiday) {
      throw new Error('Holiday not found');
    }

    const activity = holiday.activities.find((a) => a.id === activityId);
    if (!activity) {
      throw new Error('Activity not found');
    }

    progress.addActivity(activityId);
    await progress.save();

    return {
      joined: true,
      activity,
    };
  }

  /**
   * Submit contest entry
   */
  static async submitContestEntry(
    characterId: string,
    holidayId: string,
    contestId: string,
    entryData: any
  ): Promise<any> {
    const progress = await HolidayProgress.findByCharacterAndHoliday(
      characterId,
      holidayId
    );

    if (!progress) {
      throw new Error('Holiday progress not found');
    }

    // Check if already submitted
    if (progress.getContestEntry(contestId)) {
      throw new Error('Already submitted entry for this contest');
    }

    const entry: ContestEntry = {
      contestId,
      contestType: entryData.type || 'GENERIC',
      entry: entryData,
      submittedAt: new Date(),
    };

    progress.submitContest(entry);
    await progress.save();

    return {
      submitted: true,
      entry,
    };
  }

  /**
   * Get holiday leaderboard
   */
  static async getLeaderboard(
    holidayId: string,
    metric: 'currencyEarned' | 'questsCompleted' | 'timeSpent' = 'currencyEarned',
    limit: number = 100
  ): Promise<any[]> {
    return HolidayProgress.getLeaderboard(holidayId, metric, limit);
  }

  /**
   * Get upcoming holidays
   */
  static getUpcomingEvents(daysAhead: number = 30): HolidayEvent[] {
    return HolidayData.getUpcomingHolidayEvents(daysAhead);
  }

  /**
   * Calculate event start date for current year
   */
  private static getEventStartDate(
    event: HolidayEvent,
    currentDate: Date
  ): Date {
    const year = currentDate.getFullYear();
    const startDate = new Date(
      year,
      event.startDate.month - 1,
      event.startDate.day
    );

    // If start date passed, use next year
    if (startDate < currentDate) {
      startDate.setFullYear(year + 1);
    }

    return startDate;
  }

  /**
   * Calculate event end date for current year
   */
  private static getEventEndDate(event: HolidayEvent, currentDate: Date): Date {
    const year = currentDate.getFullYear();
    const endDate = new Date(
      year,
      event.endDate.month - 1,
      event.endDate.day
    );

    // Handle year-crossing events
    if (event.startDate.month > event.endDate.month) {
      endDate.setFullYear(year + 1);
    }

    return endDate;
  }

  /**
   * Get all holidays (for admin/info purposes)
   */
  static getAllHolidays(): HolidayEvent[] {
    return HolidayData.allHolidayEvents;
  }

  /**
   * Convert expired holiday currency to gold
   */
  static async convertExpiredCurrency(
    characterId: string,
    holidayId: string
  ): Promise<any> {
    const progress = await HolidayProgress.findByCharacterAndHoliday(
      characterId,
      holidayId
    );

    if (!progress || progress.currencyBalance === 0) {
      return { converted: false, goldEarned: 0 };
    }

    const holiday = HolidayData.getHolidayEventById(holidayId);
    if (!holiday || !holiday.currencyConversionRate) {
      return { converted: false, goldEarned: 0 };
    }

    const dollarsEarned = Math.floor(
      progress.currencyBalance * holiday.currencyConversionRate
    );

    // Actually add dollars to character
    if (dollarsEarned > 0) {
      try {
        await DollarService.addDollars(
          characterId,
          dollarsEarned,
          TransactionSource.HOLIDAY_CURRENCY_CONVERSION,
          {
            holidayId,
            currencyAmount: progress.currencyBalance,
            conversionRate: holiday.currencyConversionRate
          }
        );
      } catch (error) {
        logger.error('Failed to convert holiday currency to dollars', {
          error,
          characterId,
          dollarsEarned,
          holidayId
        });
        return { converted: false, dollarsEarned: 0, error: 'Dollar conversion failed' };
      }
    }

    progress.currencyBalance = 0;
    await progress.save();

    return {
      converted: true,
      dollarsEarned,
    };
  }
}
