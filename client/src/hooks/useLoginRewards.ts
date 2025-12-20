/**
 * useLoginRewards Hook
 * Phase B - Competitor Parity Plan
 *
 * Handles login reward operations and state management
 */

import { useState, useCallback } from 'react';
import { loginRewardService } from '@/services/loginReward.service';
import { useCharacterStore } from '@/store/useCharacterStore';

// ============================================================================
// GLOBAL FETCH DEDUPLICATION
// ============================================================================

// Prevent duplicate status fetches across hook instances
let statusFetchInProgress = false;
let lastStatusFetchTime = 0;
const STATUS_FETCH_DEBOUNCE_MS = 5000; // Minimum 5 seconds between fetches

/**
 * Reward types
 */
export type RewardType = 'dollars' | 'gold' | 'item' | 'energy' | 'material' | 'premium' | 'experience' | 'skill_points' | 'bundle';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/**
 * Reward item
 */
export interface RewardItem {
  type: RewardType;
  amount?: number;
  itemId?: string;
  itemName?: string;
  rarity?: ItemRarity;
  description?: string;
}

/**
 * Day reward definition
 */
export interface DayRewardDefinition {
  day: number;
  type: RewardType;
  baseAmount?: number;
  description: string;
  icon: string;
}

/**
 * Calendar day info
 */
export interface CalendarDay {
  absoluteDay: number;
  dayOfWeek: number;
  week: number;
  baseReward: DayRewardDefinition;
  multiplier: number;
  description: string;
  claimed: boolean;
  claimedAt?: string;
  claimedReward?: RewardItem;
}

/**
 * Monthly bonus info
 */
export interface MonthlyBonus {
  gold: number;
  premiumTokens: number;
  specialItem: {
    itemId: string;
    itemName: string;
    rarity: ItemRarity;
    description: string;
  };
}

/**
 * Login reward status
 */
export interface LoginRewardStatus {
  canClaim: boolean;
  currentDay: number;
  currentWeek: number;
  totalDaysClaimed: number;
  lastClaimDate: string | null;
  todayReward: RewardItem | null;
  todayRewardPreview: CalendarDay | null;
  nextClaimAvailable: string | null;
  monthlyBonusAvailable: boolean;
  streak: number;
  serverTime: string;
}

/**
 * Calendar response
 */
export interface CalendarResponse {
  days: CalendarDay[];
  currentDay: number;
  currentWeek: number;
  monthlyBonus: {
    available: boolean;
    claimed: boolean;
    reward: MonthlyBonus;
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
 * Statistics response
 */
export interface LoginStatistics {
  totalDaysClaimed: number;
  currentStreak: number;
  longestStreak: number;
  goldEarned: number;
  itemsReceived: number;
  premiumRewardsReceived: number;
  monthlyBonusesClaimed: number;
}

/**
 * Hook return type
 */
interface UseLoginRewardsReturn {
  // State
  status: LoginRewardStatus | null;
  calendar: CalendarResponse | null;
  statistics: LoginStatistics | null;
  isLoading: boolean;
  error: string | null;
  lastClaimedReward: RewardItem | null;
  showClaimModal: boolean;

  // Actions
  fetchStatus: () => Promise<void>;
  fetchCalendar: () => Promise<void>;
  fetchStatistics: () => Promise<void>;
  claimReward: () => Promise<ClaimResponse | null>;
  claimMonthlyBonus: () => Promise<{ success: boolean; reward: MonthlyBonus; message: string } | null>;
  setShowClaimModal: (show: boolean) => void;
  clearLastClaimedReward: () => void;
}

export const useLoginRewards = (): UseLoginRewardsReturn => {
  const [status, setStatus] = useState<LoginRewardStatus | null>(null);
  const [calendar, setCalendar] = useState<CalendarResponse | null>(null);
  const [statistics, setStatistics] = useState<LoginStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastClaimedReward, setLastClaimedReward] = useState<RewardItem | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const { refreshCharacter } = useCharacterStore();

  /**
   * Fetch current status (with deduplication)
   */
  const fetchStatus = useCallback(async () => {
    // Debounce: Skip if fetched recently
    const now = Date.now();
    if (now - lastStatusFetchTime < STATUS_FETCH_DEBOUNCE_MS) {
      return;
    }

    // Skip if fetch already in progress
    if (statusFetchInProgress) {
      return;
    }

    statusFetchInProgress = true;
    lastStatusFetchTime = now;
    setIsLoading(true);
    setError(null);

    try {
      const data = await loginRewardService.getStatus();
      // Map service response to hook state format
      setStatus({
        canClaim: data.canClaim,
        currentDay: data.currentDay,
        currentWeek: data.currentWeek,
        totalDaysClaimed: 0, // Will be set from calendar or statistics
        lastClaimDate: null, // Will be set from calendar
        todayReward: data.todayReward ? {
          type: data.todayReward.rewards[0]?.type || 'gold',
          amount: data.todayReward.rewards[0]?.amount,
          itemId: data.todayReward.rewards[0]?.itemId,
          itemName: data.todayReward.rewards[0]?.itemName,
          rarity: data.todayReward.rewards[0]?.itemRarity as any,
          description: data.todayReward.description
        } : null,
        todayRewardPreview: null, // Will be enhanced from calendar
        nextClaimAvailable: data.nextClaimAvailable || null,
        monthlyBonusAvailable: false, // Will be set from calendar
        streak: 0, // Will be set from statistics
        serverTime: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch login reward status');
    } finally {
      setIsLoading(false);
      statusFetchInProgress = false;
    }
  }, []);

  /**
   * Fetch full calendar
   */
  const fetchCalendar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loginRewardService.getCalendar();

      // Map service response to hook state format
      const calendarDays: CalendarDay[] = data.calendar.map((dayReward, _index) => ({
        absoluteDay: dayReward.day,
        dayOfWeek: ((dayReward.day - 1) % 7) + 1,
        week: dayReward.week,
        baseReward: {
          day: dayReward.day,
          type: dayReward.rewards[0]?.type || 'gold',
          baseAmount: dayReward.rewards[0]?.amount,
          description: dayReward.description,
          icon: loginRewardService.getRewardTypeDisplay(dayReward.rewards[0]?.type || 'gold').icon
        },
        multiplier: dayReward.isBonus ? 2 : 1,
        description: dayReward.description,
        claimed: data.claimedDays.includes(dayReward.day),
        claimedAt: undefined,
        claimedReward: undefined
      }));

      setCalendar({
        days: calendarDays,
        currentDay: data.currentDay,
        currentWeek: data.currentWeek,
        monthlyBonus: {
          available: data.monthlyBonusAvailable,
          claimed: !data.monthlyBonusAvailable && data.claimedDays.length >= 28,
          reward: {
            gold: 5000,
            premiumTokens: 10,
            specialItem: {
              itemId: 'monthly_special',
              itemName: 'Monthly Special Item',
              rarity: 'epic',
              description: 'Complete all 28 days to unlock'
            }
          }
        }
      });

      // Update status with calendar info
      setStatus(prev => prev ? {
        ...prev,
        totalDaysClaimed: data.claimedDays.length,
        monthlyBonusAvailable: data.monthlyBonusAvailable,
        lastClaimDate: data.progress.lastClaimDate || null,
        todayRewardPreview: calendarDays.find(d => d.absoluteDay === data.currentDay) || null
      } : null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch calendar');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch statistics
   */
  const fetchStatistics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loginRewardService.getStatistics();

      // Map service response to hook state format
      setStatistics({
        totalDaysClaimed: data.statistics.totalDaysClaimed,
        currentStreak: data.statistics.currentStreak,
        longestStreak: data.statistics.longestStreak,
        goldEarned: data.statistics.totalGoldEarned,
        itemsReceived: data.statistics.totalItemsEarned,
        premiumRewardsReceived: 0, // Not provided by service statistics
        monthlyBonusesClaimed: data.statistics.monthlyBonusesEarned
      });

      // Update status with streak info
      setStatus(prev => prev ? {
        ...prev,
        streak: data.statistics.currentStreak
      } : null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch statistics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Claim today's reward
   */
  const claimReward = useCallback(async (): Promise<ClaimResponse | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loginRewardService.claimReward();

      // Map service response to hook state format
      const mappedReward: RewardItem = {
        type: data.rewards[0]?.type || 'gold',
        amount: data.rewards[0]?.amount,
        itemId: data.rewards[0]?.itemId,
        itemName: data.rewards[0]?.itemName,
        rarity: data.rewards[0]?.itemRarity as any,
        description: loginRewardService.formatRewardDescription(data.rewards[0])
      };

      const result: ClaimResponse = {
        success: data.success,
        reward: mappedReward,
        newDay: data.newDay,
        newWeek: data.newWeek,
        totalDaysClaimed: 0, // Will be updated from calendar
        isMonthlyBonusAvailable: false, // Will be updated from calendar
        message: data.message
      };

      // Update status
      setStatus(prev => prev ? {
        ...prev,
        canClaim: false,
        currentDay: result.newDay,
        currentWeek: result.newWeek,
        lastClaimDate: new Date().toISOString()
      } : null);

      // Set last claimed reward for modal
      setLastClaimedReward(mappedReward);
      setShowClaimModal(true);

      // Refresh character data
      await refreshCharacter();

      // Refresh calendar to get updated claimed days and monthly bonus status
      await fetchCalendar();

      return result;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to claim reward');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [refreshCharacter, fetchCalendar]);

  /**
   * Claim monthly bonus
   */
  const claimMonthlyBonus = useCallback(async (): Promise<{ success: boolean; reward: MonthlyBonus; message: string } | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loginRewardService.claimMonthlyBonus();

      // Create monthly bonus reward structure
      const monthlyReward: MonthlyBonus = {
        gold: data.goldAdded || 0,
        premiumTokens: 10, // Default value, adjust if service provides it
        specialItem: {
          itemId: data.itemsAdded?.[0]?.itemId || 'monthly_special',
          itemName: data.itemsAdded?.[0]?.name || 'Monthly Special Item',
          rarity: 'epic',
          description: 'Monthly bonus reward for completing all 28 days'
        }
      };

      const result = {
        success: data.success,
        reward: monthlyReward,
        message: data.message
      };

      // Update status
      setStatus(prev => prev ? {
        ...prev,
        monthlyBonusAvailable: false
      } : null);

      // Update calendar
      setCalendar(prev => prev ? {
        ...prev,
        monthlyBonus: {
          ...prev.monthlyBonus,
          available: false,
          claimed: true
        }
      } : null);

      // Refresh character data
      await refreshCharacter();

      return result;
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to claim monthly bonus');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [refreshCharacter]);

  /**
   * Clear last claimed reward
   */
  const clearLastClaimedReward = useCallback(() => {
    setLastClaimedReward(null);
    setShowClaimModal(false);
  }, []);

  return {
    status,
    calendar,
    statistics,
    isLoading,
    error,
    lastClaimedReward,
    showClaimModal,
    fetchStatus,
    fetchCalendar,
    fetchStatistics,
    claimReward,
    claimMonthlyBonus,
    setShowClaimModal,
    clearLastClaimedReward
  };
};
