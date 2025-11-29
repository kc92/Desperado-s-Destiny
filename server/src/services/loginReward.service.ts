/**
 * Login Reward Service
 * Phase B - Competitor Parity Plan
 *
 * Handles all login reward operations including claim validation,
 * reward generation, and calendar management.
 */

import mongoose from 'mongoose';
import { LoginReward, ILoginReward, RewardItem, ClaimedReward } from '../models/LoginReward.model';
import { Character } from '../models/Character.model';
import { TransactionSource } from '../models/GoldTransaction.model';
import { GoldService } from './gold.service';
import {
  generateRewardItem,
  getRewardForDay,
  REWARD_CALENDAR,
  MONTHLY_BONUS,
  WEEK_MULTIPLIERS,
  CalendarDay,
  getPremiumRewardProbabilities
} from '../data/loginRewards';
import logger from '../utils/logger';

/**
 * Status response for login reward check
 */
export interface LoginRewardStatus {
  canClaim: boolean;
  currentDay: number;
  currentWeek: number;
  totalDaysClaimed: number;
  lastClaimDate: Date | null;
  todayReward: RewardItem | null;
  todayRewardPreview: CalendarDay | null;
  nextClaimAvailable: Date | null;
  monthlyBonusAvailable: boolean;
  streak: number;
}

/**
 * Calendar response with claimed status
 */
export interface CalendarResponse {
  days: (CalendarDay & {
    claimed: boolean;
    claimedAt?: Date;
    claimedReward?: RewardItem;
  })[];
  currentDay: number;
  currentWeek: number;
  monthlyBonus: {
    available: boolean;
    claimed: boolean;
    reward: typeof MONTHLY_BONUS;
  };
}

/**
 * Claim response
 */
export interface ClaimResponse {
  success: boolean;
  reward: RewardItem;
  newDay: number;
  newWeek: number;
  totalDaysClaimed: number;
  isMonthlyBonusAvailable: boolean;
  message: string;
}

/**
 * Monthly bonus claim response
 */
export interface MonthlyBonusResponse {
  success: boolean;
  reward: typeof MONTHLY_BONUS;
  message: string;
}

export class LoginRewardService {
  /**
   * Get or create login reward record for a character
   */
  static async getOrCreateRecord(characterId: string | mongoose.Types.ObjectId): Promise<ILoginReward> {
    let record = await LoginReward.findByCharacterId(characterId);

    if (!record) {
      record = await LoginReward.createForCharacter(characterId);
      logger.info(`Created new login reward record for character ${characterId}`);
    }

    return record;
  }

  /**
   * Check if a date is "today" in server time (UTC)
   */
  private static isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getUTCFullYear() === date2.getUTCFullYear() &&
      date1.getUTCMonth() === date2.getUTCMonth() &&
      date1.getUTCDate() === date2.getUTCDate()
    );
  }

  /**
   * Get the next midnight UTC
   */
  private static getNextMidnightUTC(): Date {
    const now = new Date();
    const tomorrow = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0, 0
    ));
    return tomorrow;
  }

  /**
   * Check login reward status for a character
   */
  static async checkLoginStatus(characterId: string | mongoose.Types.ObjectId): Promise<LoginRewardStatus> {
    const record = await this.getOrCreateRecord(characterId);
    const now = new Date();

    // Check if player can claim today
    const alreadyClaimedToday = record.lastClaimDate
      ? this.isSameDay(record.lastClaimDate, now)
      : false;

    const canClaim = !alreadyClaimedToday;

    // Get today's reward preview
    const todayRewardPreview = getRewardForDay(record.currentDay);
    const todayReward = canClaim ? generateRewardItem(record.currentDay) : null;

    // Calculate next claim time
    const nextClaimAvailable = alreadyClaimedToday
      ? this.getNextMidnightUTC()
      : null;

    // Check if monthly bonus is available (completed all 28 days)
    const monthlyBonusAvailable =
      record.totalDaysClaimed >= 28 &&
      !record.monthlyBonusClaimed;

    // Calculate streak (consecutive days including today if claimed)
    const streak = this.calculateStreak(record);

    return {
      canClaim,
      currentDay: record.currentDay,
      currentWeek: record.currentWeek,
      totalDaysClaimed: record.totalDaysClaimed,
      lastClaimDate: record.lastClaimDate,
      todayReward,
      todayRewardPreview,
      nextClaimAvailable,
      monthlyBonusAvailable,
      streak
    };
  }

  /**
   * Calculate login streak
   */
  private static calculateStreak(record: ILoginReward): number {
    if (record.claimedRewards.length === 0) return 0;

    // Sort claimed rewards by date (most recent first)
    const sortedClaims = [...record.claimedRewards].sort(
      (a, b) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime()
    );

    let streak = 0;
    let checkDate = new Date();

    for (const claim of sortedClaims) {
      const claimDate = new Date(claim.claimedAt);

      // Check if claim was on checkDate or day before
      if (this.isSameDay(claimDate, checkDate)) {
        streak++;
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
      } else {
        // Check if it was the previous day
        const prevDay = new Date(checkDate);
        prevDay.setUTCDate(prevDay.getUTCDate() - 1);

        if (this.isSameDay(claimDate, prevDay)) {
          streak++;
          checkDate = new Date(claimDate);
          checkDate.setUTCDate(checkDate.getUTCDate() - 1);
        } else {
          // Streak broken
          break;
        }
      }
    }

    return streak;
  }

  /**
   * Claim today's reward
   */
  static async claimDailyReward(characterId: string | mongoose.Types.ObjectId): Promise<ClaimResponse> {
    const record = await this.getOrCreateRecord(characterId);
    const now = new Date();

    // Check if already claimed today
    if (record.lastClaimDate && this.isSameDay(record.lastClaimDate, now)) {
      throw new Error('Already claimed today\'s reward. Come back tomorrow!');
    }

    // Generate the reward
    const reward = generateRewardItem(record.currentDay);
    if (!reward) {
      throw new Error('Failed to generate reward');
    }

    // Apply the reward
    await this.applyReward(characterId.toString(), reward, record.currentDay, record.currentWeek);

    // Create claimed reward record
    const dayOfWeek = ((record.currentDay - 1) % 7) + 1;
    const claimedReward: ClaimedReward = {
      day: dayOfWeek,
      week: record.currentWeek,
      absoluteDay: record.currentDay,
      reward,
      claimedAt: now
    };

    // Update record
    const newDay = record.currentDay >= 28 ? 1 : record.currentDay + 1;
    const newWeek = Math.ceil(newDay / 7);

    // If cycling back to day 1, reset monthly bonus claim flag
    const shouldResetCycle = record.currentDay >= 28;

    record.currentDay = newDay;
    record.currentWeek = newWeek;
    record.lastClaimDate = now;
    record.totalDaysClaimed += 1;
    record.claimedRewards.push(claimedReward);

    if (shouldResetCycle) {
      record.monthlyBonusClaimed = false;
      record.cycleStartDate = now;
      // Keep only last 28 claimed rewards to prevent unbounded growth
      if (record.claimedRewards.length > 56) {
        record.claimedRewards = record.claimedRewards.slice(-28);
      }
    }

    await record.save();

    logger.info(
      `Character ${characterId} claimed day ${record.currentDay - 1} reward: ` +
      `${reward.type} - ${reward.itemName || reward.amount || 'reward'}`
    );

    return {
      success: true,
      reward,
      newDay,
      newWeek,
      totalDaysClaimed: record.totalDaysClaimed,
      isMonthlyBonusAvailable: record.totalDaysClaimed >= 28 && !record.monthlyBonusClaimed,
      message: `Claimed day ${record.currentDay - 1 || 28} reward!`
    };
  }

  /**
   * Apply a reward to a character
   */
  private static async applyReward(
    characterId: string,
    reward: RewardItem,
    day: number,
    week: number
  ): Promise<void> {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    switch (reward.type) {
      case 'gold':
        if (reward.amount) {
          await GoldService.addGold(
            characterId,
            reward.amount,
            TransactionSource.LOGIN_REWARD,
            { day, week }
          );
        }
        break;

      case 'energy':
        if (reward.amount) {
          character.energy = Math.min(
            character.energy + reward.amount,
            character.maxEnergy
          );
          await character.save();
        }
        break;

      case 'item':
      case 'material':
      case 'premium':
        if (reward.itemId) {
          // Add item to inventory
          const existingItem = character.inventory.find(i => i.itemId === reward.itemId);
          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            character.inventory.push({
              itemId: reward.itemId,
              quantity: 1,
              acquiredAt: new Date()
            });
          }
          await character.save();
        }
        break;
    }
  }

  /**
   * Get the full reward calendar with claimed status
   */
  static async getRewardCalendar(characterId: string | mongoose.Types.ObjectId): Promise<CalendarResponse> {
    const record = await this.getOrCreateRecord(characterId);

    // Create a map of claimed rewards by absolute day
    const claimedMap = new Map<number, ClaimedReward>();
    for (const claimed of record.claimedRewards) {
      // Only include claims from current cycle
      if (new Date(claimed.claimedAt) >= record.cycleStartDate) {
        claimedMap.set(claimed.absoluteDay, claimed);
      }
    }

    // Build calendar with claimed status
    const days = REWARD_CALENDAR.map(day => {
      const claimed = claimedMap.get(day.absoluteDay);
      return {
        ...day,
        claimed: !!claimed,
        claimedAt: claimed?.claimedAt,
        claimedReward: claimed?.reward
      };
    });

    return {
      days,
      currentDay: record.currentDay,
      currentWeek: record.currentWeek,
      monthlyBonus: {
        available: record.totalDaysClaimed >= 28 && !record.monthlyBonusClaimed,
        claimed: record.monthlyBonusClaimed,
        reward: MONTHLY_BONUS
      }
    };
  }

  /**
   * Get current day's reward preview (what player will receive)
   */
  static async getCurrentReward(characterId: string | mongoose.Types.ObjectId): Promise<{
    day: number;
    week: number;
    preview: CalendarDay | null;
    canClaim: boolean;
    premiumProbabilities?: { reward: any; probability: number }[];
  }> {
    const record = await this.getOrCreateRecord(characterId);
    const now = new Date();

    const canClaim = !record.lastClaimDate || !this.isSameDay(record.lastClaimDate, now);
    const preview = getRewardForDay(record.currentDay);

    // If it's a premium day, include probabilities
    let premiumProbabilities;
    if (preview?.baseReward.type === 'premium') {
      premiumProbabilities = getPremiumRewardProbabilities(record.currentWeek);
    }

    return {
      day: record.currentDay,
      week: record.currentWeek,
      preview,
      canClaim,
      premiumProbabilities
    };
  }

  /**
   * Claim monthly bonus (requires all 28 days claimed in current cycle)
   */
  static async claimMonthlyBonus(characterId: string | mongoose.Types.ObjectId): Promise<MonthlyBonusResponse> {
    const record = await this.getOrCreateRecord(characterId);

    // Verify eligibility
    if (record.totalDaysClaimed < 28) {
      throw new Error(`Must claim all 28 days first. Current: ${record.totalDaysClaimed}/28`);
    }

    if (record.monthlyBonusClaimed) {
      throw new Error('Monthly bonus already claimed for this cycle');
    }

    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Apply monthly bonus rewards
    // 1. Gold
    await GoldService.addGold(
      characterId.toString(),
      MONTHLY_BONUS.gold,
      TransactionSource.LOGIN_MONTHLY_BONUS,
      { totalDaysClaimed: record.totalDaysClaimed }
    );

    // 2. Premium tokens (add as item)
    const tokenItem = character.inventory.find(i => i.itemId === 'premium-tokens');
    if (tokenItem) {
      tokenItem.quantity += MONTHLY_BONUS.premiumTokens;
    } else {
      character.inventory.push({
        itemId: 'premium-tokens',
        quantity: MONTHLY_BONUS.premiumTokens,
        acquiredAt: new Date()
      });
    }

    // 3. Special item
    const specialItem = character.inventory.find(i => i.itemId === MONTHLY_BONUS.specialItem.itemId);
    if (specialItem) {
      specialItem.quantity += 1;
    } else {
      character.inventory.push({
        itemId: MONTHLY_BONUS.specialItem.itemId,
        quantity: 1,
        acquiredAt: new Date()
      });
    }

    await character.save();

    // Mark monthly bonus as claimed
    record.monthlyBonusClaimed = true;
    await record.save();

    logger.info(`Character ${characterId} claimed monthly bonus after ${record.totalDaysClaimed} days`);

    return {
      success: true,
      reward: MONTHLY_BONUS,
      message: 'Congratulations! You claimed the monthly bonus reward!'
    };
  }

  /**
   * Get statistics for a character's login rewards
   */
  static async getStatistics(characterId: string | mongoose.Types.ObjectId): Promise<{
    totalDaysClaimed: number;
    currentStreak: number;
    longestStreak: number;
    goldEarned: number;
    itemsReceived: number;
    premiumRewardsReceived: number;
    monthlyBonusesClaimed: number;
  }> {
    const record = await this.getOrCreateRecord(characterId);

    // Calculate statistics from claimed rewards
    let goldEarned = 0;
    let itemsReceived = 0;
    let premiumRewardsReceived = 0;

    for (const claimed of record.claimedRewards) {
      if (claimed.reward.type === 'gold' && claimed.reward.amount) {
        goldEarned += claimed.reward.amount;
      } else if (['item', 'material'].includes(claimed.reward.type)) {
        itemsReceived++;
      } else if (claimed.reward.type === 'premium') {
        premiumRewardsReceived++;
      }
    }

    const currentStreak = this.calculateStreak(record);

    // For longest streak, we would need to track this separately
    // For now, just use current streak as a placeholder
    const longestStreak = currentStreak;

    // Count monthly bonuses from total days (every 28 days = 1 potential bonus)
    const monthlyBonusesClaimed = Math.floor(record.totalDaysClaimed / 28);

    return {
      totalDaysClaimed: record.totalDaysClaimed,
      currentStreak,
      longestStreak,
      goldEarned,
      itemsReceived,
      premiumRewardsReceived,
      monthlyBonusesClaimed
    };
  }

  /**
   * Reset a character's login reward progress (admin only)
   */
  static async resetProgress(characterId: string | mongoose.Types.ObjectId): Promise<void> {
    const record = await this.getOrCreateRecord(characterId);

    record.currentDay = 1;
    record.currentWeek = 1;
    record.lastClaimDate = null;
    record.totalDaysClaimed = 0;
    record.claimedRewards = [];
    record.monthlyBonusClaimed = false;
    record.cycleStartDate = new Date();

    await record.save();

    logger.info(`Reset login reward progress for character ${characterId}`);
  }
}
