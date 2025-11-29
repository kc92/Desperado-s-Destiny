/**
 * useLoginRewards Hook
 * Phase B - Competitor Parity Plan
 *
 * Handles login reward operations and state management
 */

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

/**
 * Reward types
 */
export type RewardType = 'gold' | 'item' | 'energy' | 'material' | 'premium';
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
   * Fetch current status
   */
  const fetchStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: LoginRewardStatus }>('/login-rewards/status');
      setStatus(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch login reward status');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch full calendar
   */
  const fetchCalendar = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: CalendarResponse }>('/login-rewards/calendar');
      setCalendar(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch calendar');
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
      const response = await api.get<{ data: LoginStatistics }>('/login-rewards/statistics');
      setStatistics(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch statistics');
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
      const response = await api.post<{ data: ClaimResponse }>('/login-rewards/claim');
      const result = response.data.data;

      // Update status
      setStatus(prev => prev ? {
        ...prev,
        canClaim: false,
        currentDay: result.newDay,
        currentWeek: result.newWeek,
        totalDaysClaimed: result.totalDaysClaimed,
        lastClaimDate: new Date().toISOString(),
        monthlyBonusAvailable: result.isMonthlyBonusAvailable
      } : null);

      // Set last claimed reward for modal
      setLastClaimedReward(result.reward);
      setShowClaimModal(true);

      // Refresh character data
      await refreshCharacter();

      // Refresh calendar
      await fetchCalendar();

      return result;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to claim reward');
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
      const response = await api.post<{ data: { success: boolean; reward: MonthlyBonus; message: string } }>('/login-rewards/monthly');
      const result = response.data.data;

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
      setError(err.response?.data?.error || 'Failed to claim monthly bonus');
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
