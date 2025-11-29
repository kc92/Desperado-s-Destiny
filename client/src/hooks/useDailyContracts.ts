/**
 * useDailyContracts Hook
 *
 * Handles daily contract operations and state management
 * Part of the Competitor Parity Plan - Phase B
 */

import { useState, useCallback, useEffect } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';

/**
 * Contract types
 */
export type ContractType = 'combat' | 'crime' | 'social' | 'delivery' | 'investigation' | 'crafting';
export type ContractDifficulty = 'easy' | 'medium' | 'hard';
export type ContractStatus = 'available' | 'in_progress' | 'completed' | 'expired';

/**
 * Contract target
 */
export interface ContractTarget {
  type: string;
  id?: string;
  name: string;
  location?: string;
}

/**
 * Contract requirements
 */
export interface ContractRequirements {
  amount?: number;
  item?: string;
  npc?: string;
  skillLevel?: number;
  location?: string;
}

/**
 * Contract rewards
 */
export interface ContractRewards {
  gold: number;
  xp: number;
  items?: string[];
  reputation?: Record<string, number>;
}

/**
 * Individual contract
 */
export interface Contract {
  id: string;
  templateId: string;
  type: ContractType;
  title: string;
  description: string;
  target: ContractTarget;
  requirements: ContractRequirements;
  rewards: ContractRewards;
  difficulty: ContractDifficulty;
  status: ContractStatus;
  progress: number;
  progressMax: number;
  acceptedAt?: string;
  completedAt?: string;
  expiresAt: string;
}

/**
 * Time until reset
 */
export interface TimeUntilReset {
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Streak info
 */
export interface StreakInfo {
  currentStreak: number;
  todayCompleted: number;
  totalContractsToday: number;
  nextBonusDay: number;
  nextBonus: {
    gold: number;
    xp: number;
    item?: string;
    premiumCurrency?: number;
    description: string;
  } | null;
  canClaimStreakBonus: boolean;
  streakHistory: Array<{ day: number; completed: boolean }>;
}

/**
 * Daily contracts state
 */
export interface DailyContractsData {
  date: string;
  contracts: Contract[];
  completedCount: number;
  streak: number;
  streakBonusClaimed: boolean;
  timeUntilReset: TimeUntilReset;
}

/**
 * Contract completion result
 */
export interface CompletionResult {
  contract: Contract;
  rewards: ContractRewards;
  streakUpdate: {
    newStreak: number;
    bonusClaimed: boolean;
    bonusRewards?: {
      gold: number;
      xp: number;
      item?: string;
      premiumCurrency?: number;
    };
  };
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  characterId: string;
  streak: number;
  name: string;
}

/**
 * Hook return type
 */
interface UseDailyContractsReturn {
  // State
  contracts: Contract[];
  streakInfo: StreakInfo | null;
  leaderboard: LeaderboardEntry[];
  timeUntilReset: TimeUntilReset | null;
  isLoading: boolean;
  error: string | null;
  message: { text: string; success: boolean } | null;

  // Actions
  fetchContracts: () => Promise<void>;
  fetchStreakInfo: () => Promise<void>;
  fetchLeaderboard: (limit?: number) => Promise<void>;
  acceptContract: (contractId: string) => Promise<{ success: boolean; message: string }>;
  updateProgress: (contractId: string, amount?: number) => Promise<{ success: boolean; message: string; isComplete?: boolean }>;
  completeContract: (contractId: string) => Promise<{ success: boolean; result?: CompletionResult; message: string }>;
  claimStreakBonus: () => Promise<{ success: boolean; message: string; rewards?: any }>;
  clearMessage: () => void;
}

export const useDailyContracts = (): UseDailyContractsReturn => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeUntilReset, setTimeUntilReset] = useState<TimeUntilReset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
  const { refreshCharacter } = useCharacterStore();

  /**
   * Fetch today's contracts
   */
  const fetchContracts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: DailyContractsData }>('/contracts/daily');
      const data = response.data.data;
      setContracts(data.contracts);
      setTimeUntilReset(data.timeUntilReset);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch contracts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch streak information
   */
  const fetchStreakInfo = useCallback(async () => {
    try {
      const response = await api.get<{ data: StreakInfo }>('/contracts/streak');
      setStreakInfo(response.data.data);
    } catch (err: any) {
      console.error('Failed to fetch streak info:', err);
    }
  }, []);

  /**
   * Fetch streak leaderboard
   */
  const fetchLeaderboard = useCallback(async (limit: number = 10) => {
    try {
      const response = await api.get<{ data: { leaderboard: LeaderboardEntry[] } }>(
        `/contracts/leaderboard?limit=${limit}`
      );
      setLeaderboard(response.data.data.leaderboard);
    } catch (err: any) {
      console.error('Failed to fetch leaderboard:', err);
    }
  }, []);

  /**
   * Accept a contract
   */
  const acceptContract = useCallback(async (contractId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ data: { message: string; contract: Contract } }>(
        `/contracts/${contractId}/accept`
      );
      setContracts(prev =>
        prev.map(c => (c.id === contractId ? response.data.data.contract : c))
      );
      setMessage({ text: response.data.data.message, success: true });
      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to accept contract';
      setMessage({ text: msg, success: false });
      return { success: false, message: msg };
    }
  }, []);

  /**
   * Update contract progress
   */
  const updateProgress = useCallback(async (
    contractId: string,
    amount: number = 1
  ): Promise<{ success: boolean; message: string; isComplete?: boolean }> => {
    try {
      const response = await api.post<{
        data: { message: string; contract: Contract; isComplete: boolean }
      }>(`/contracts/${contractId}/progress`, { amount });

      setContracts(prev =>
        prev.map(c => (c.id === contractId ? response.data.data.contract : c))
      );

      return {
        success: true,
        message: response.data.data.message,
        isComplete: response.data.data.isComplete
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.error || 'Failed to update progress'
      };
    }
  }, []);

  /**
   * Complete a contract and claim rewards
   */
  const completeContract = useCallback(async (
    contractId: string
  ): Promise<{ success: boolean; result?: CompletionResult; message: string }> => {
    try {
      const response = await api.post<{
        data: {
          message: string;
          contract: Contract;
          rewards: ContractRewards;
          streakUpdate: any;
        }
      }>(`/contracts/${contractId}/complete`);

      const result: CompletionResult = {
        contract: response.data.data.contract,
        rewards: response.data.data.rewards,
        streakUpdate: response.data.data.streakUpdate
      };

      setContracts(prev =>
        prev.map(c => (c.id === contractId ? result.contract : c))
      );

      // Refresh character to update gold/xp
      await refreshCharacter();

      // Refresh streak info
      await fetchStreakInfo();

      setMessage({ text: response.data.data.message, success: true });

      return { success: true, result, message: response.data.data.message };
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to complete contract';
      setMessage({ text: msg, success: false });
      return { success: false, message: msg };
    }
  }, [refreshCharacter, fetchStreakInfo]);

  /**
   * Claim streak bonus
   */
  const claimStreakBonus = useCallback(async (): Promise<{
    success: boolean;
    message: string;
    rewards?: any;
  }> => {
    try {
      const response = await api.post<{
        data: { message: string; rewards: any }
      }>('/contracts/streak/claim');

      // Refresh character and streak info
      await refreshCharacter();
      await fetchStreakInfo();

      setMessage({ text: response.data.data.message, success: true });

      return {
        success: true,
        message: response.data.data.message,
        rewards: response.data.data.rewards
      };
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to claim streak bonus';
      setMessage({ text: msg, success: false });
      return { success: false, message: msg };
    }
  }, [refreshCharacter, fetchStreakInfo]);

  /**
   * Clear message
   */
  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  /**
   * Auto-clear message after 5 seconds
   */
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return {
    contracts,
    streakInfo,
    leaderboard,
    timeUntilReset,
    isLoading,
    error,
    message,
    fetchContracts,
    fetchStreakInfo,
    fetchLeaderboard,
    acceptContract,
    updateProgress,
    completeContract,
    claimStreakBonus,
    clearMessage
  };
};

export default useDailyContracts;
