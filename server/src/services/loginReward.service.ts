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
import { TransactionSource, CurrencyType } from '../models/GoldTransaction.model';
import { DollarService } from './dollar.service';
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
   * Claim today's reward (transaction-safe to prevent race conditions)
   */
  static async claimDailyReward(characterId: string | mongoose.Types.ObjectId): Promise<ClaimResponse> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Ensure record exists before transaction
      await this.getOrCreateRecord(characterId);

      // Lock the record within transaction for atomic check-and-update
      const record = await LoginReward.findOne({
        character: new mongoose.Types.ObjectId(characterId.toString())
      }).session(session);

      if (!record) {
        await session.abortTransaction();
        throw new Error('Login reward record not found');
      }

      const now = new Date();

      // Check if already claimed today - this check is now atomic within the transaction
      if (record.lastClaimDate && this.isSameDay(record.lastClaimDate, now)) {
        await session.abortTransaction();
        throw new Error('Already claimed today\'s reward. Come back tomorrow!');
      }

      // Generate the reward
      const reward = generateRewardItem(record.currentDay);
      if (!reward) {
        await session.abortTransaction();
        throw new Error('Failed to generate reward');
      }

      // Apply the reward within the transaction
      await this.applyRewardWithSession(
        characterId.toString(),
        reward,
        record.currentDay,
        record.currentWeek,
        session
      );

      // Create claimed reward record
      const dayOfWeek = ((record.currentDay - 1) % 7) + 1;
      const claimedReward: ClaimedReward = {
        day: dayOfWeek,
        week: record.currentWeek,
        absoluteDay: record.currentDay,
        reward,
        claimedAt: now
      };

      // Calculate new values
      const newDay = record.currentDay >= 28 ? 1 : record.currentDay + 1;
      const newWeek = Math.ceil(newDay / 7);
      const shouldResetCycle = record.currentDay >= 28;
      const newTotalDaysClaimed = record.totalDaysClaimed + 1;

      // Atomic update within transaction
      const updateData: Record<string, unknown> = {
        $set: {
          currentDay: newDay,
          currentWeek: newWeek,
          lastClaimDate: now
        },
        $inc: { totalDaysClaimed: 1 },
        $push: { claimedRewards: claimedReward }
      };

      // Handle cycle reset
      if (shouldResetCycle) {
        updateData.$set = {
          ...updateData.$set as Record<string, unknown>,
          monthlyBonusClaimed: false,
          cycleStartDate: now
        };
      }

      await LoginReward.findOneAndUpdate(
        { character: new mongoose.Types.ObjectId(characterId.toString()) },
        updateData,
        { session }
      );

      // Trim old claimed rewards if needed (outside main update to avoid conflicts)
      if (shouldResetCycle && record.claimedRewards.length > 55) {
        await LoginReward.findOneAndUpdate(
          { character: new mongoose.Types.ObjectId(characterId.toString()) },
          { $set: { claimedRewards: record.claimedRewards.slice(-27).concat([claimedReward]) } },
          { session }
        );
      }

      await session.commitTransaction();

      logger.info(
        `Character ${characterId} claimed day ${record.currentDay} reward: ` +
        `${reward.type} - ${reward.itemName || reward.amount || 'reward'}`
      );

      return {
        success: true,
        reward,
        newDay,
        newWeek,
        totalDaysClaimed: newTotalDaysClaimed,
        isMonthlyBonusAvailable: newTotalDaysClaimed >= 28 && !record.monthlyBonusClaimed,
        message: `Claimed day ${record.currentDay} reward!`
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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
      case 'dollars':
        if (reward.amount) {
          await DollarService.addDollars(
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
   * Apply a reward to a character within a transaction session
   * Used by claimDailyReward to ensure atomicity
   */
  private static async applyRewardWithSession(
    characterId: string,
    reward: RewardItem,
    day: number,
    week: number,
    session: mongoose.ClientSession
  ): Promise<void> {
    const character = await Character.findById(characterId).session(session);
    if (!character) {
      throw new Error('Character not found');
    }

    switch (reward.type) {
      case 'dollars':
        if (reward.amount) {
          // Use DollarService.addDollars with session for atomic dollar addition + transaction record
          await DollarService.addDollars(
            characterId,
            reward.amount,
            TransactionSource.LOGIN_REWARD,
            { day, week },
            session
          );
        }
        break;

      case 'energy':
        if (reward.amount) {
          const newEnergy = Math.min(
            character.energy + reward.amount,
            character.maxEnergy
          );
          await Character.findByIdAndUpdate(
            characterId,
            { $set: { energy: newEnergy } },
            { session }
          );
        }
        break;

      case 'item':
      case 'material':
      case 'premium':
        if (reward.itemId) {
          // Check if item exists in inventory
          const existingItemIndex = character.inventory.findIndex(i => i.itemId === reward.itemId);

          if (existingItemIndex >= 0) {
            // Increment existing item quantity using positional operator
            await Character.findOneAndUpdate(
              { _id: characterId, 'inventory.itemId': reward.itemId },
              { $inc: { 'inventory.$.quantity': 1 } },
              { session }
            );
          } else {
            // Add new item to inventory
            await Character.findByIdAndUpdate(
              characterId,
              {
                $push: {
                  inventory: {
                    itemId: reward.itemId,
                    quantity: 1,
                    acquiredAt: new Date()
                  }
                }
              },
              { session }
            );
          }
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
    // 1. Dollars
    await DollarService.addDollars(
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
    dollarsEarned: number;
    itemsReceived: number;
    premiumRewardsReceived: number;
    monthlyBonusesClaimed: number;
  }> {
    const record = await this.getOrCreateRecord(characterId);

    // Calculate statistics from claimed rewards
    let dollarsEarned = 0;
    let itemsReceived = 0;
    let premiumRewardsReceived = 0;

    for (const claimed of record.claimedRewards) {
      if (claimed.reward.type === 'dollars' && claimed.reward.amount) {
        dollarsEarned += claimed.reward.amount;
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
      dollarsEarned,
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
