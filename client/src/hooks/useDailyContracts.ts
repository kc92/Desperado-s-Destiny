/**
 * useDailyContracts Hook
 *
 * Handles daily contract operations and state management
 * Part of the Competitor Parity Plan - Phase B
 */

import { useState, useCallback, useEffect } from 'react';
import { dailyContractService } from '@/services/dailyContract.service';
import { useCharacterStore } from '@/store/useCharacterStore';
import { logger } from '@/services/logger.service';

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

/**
 * Helper: Map service ContractType to hook ContractType
 */
function mapServiceTypeToHookType(serviceType: string): ContractType {
  // Service types: 'combat' | 'crafting' | 'gathering' | 'social' | 'exploration' | 'special'
  // Hook types: 'combat' | 'crime' | 'social' | 'delivery' | 'investigation' | 'crafting'
  const typeMap: Record<string, ContractType> = {
    combat: 'combat',
    crafting: 'crafting',
    gathering: 'crime', // Map gathering to crime
    social: 'social',
    exploration: 'investigation', // Map exploration to investigation
    special: 'delivery', // Map special to delivery
  };
  return typeMap[serviceType] || 'social';
}

/**
 * Helper: Map service ContractStatus to hook ContractStatus
 */
function mapServiceStatusToHookStatus(serviceStatus: string): ContractStatus {
  // Service: 'available' | 'active' | 'completed' | 'failed' | 'expired'
  // Hook: 'available' | 'in_progress' | 'completed' | 'expired'
  const statusMap: Record<string, ContractStatus> = {
    available: 'available',
    active: 'in_progress',
    completed: 'completed',
    failed: 'expired',
    expired: 'expired',
  };
  return statusMap[serviceStatus] || 'available';
}

/**
 * Helper: Map service DailyContract to hook Contract
 */
function mapServiceContractToHookContract(serviceContract: import('@/services/dailyContract.service').DailyContract): Contract {
  return {
    id: serviceContract._id,
    templateId: serviceContract.contractId,
    type: mapServiceTypeToHookType(serviceContract.type),
    title: serviceContract.name,
    description: serviceContract.description,
    target: {
      type: serviceContract.type,
      name: serviceContract.name,
    },
    requirements: {
      amount: serviceContract.objectives[0]?.target,
    },
    rewards: {
      gold: serviceContract.rewards.find(r => r.type === 'gold')?.amount || 0,
      xp: serviceContract.rewards.find(r => r.type === 'experience')?.amount || 0,
      items: serviceContract.rewards.filter(r => r.type === 'item').map(r => r.itemName || ''),
    },
    difficulty: serviceContract.difficulty as ContractDifficulty,
    status: mapServiceStatusToHookStatus(serviceContract.status),
    progress: serviceContract.objectives[0]?.current || 0,
    progressMax: serviceContract.objectives[0]?.target || 100,
    acceptedAt: serviceContract.acceptedAt,
    completedAt: serviceContract.completedAt,
    expiresAt: serviceContract.expiresAt,
  };
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
      const response = await dailyContractService.getDailyContracts();
      // Map service types to hook types
      const mappedContracts = response.contracts.map(mapServiceContractToHookContract);

      setContracts(mappedContracts);

      // Calculate time until reset from resetTime
      const resetTime = new Date(response.resetTime);
      const now = new Date();
      const diff = resetTime.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUntilReset({ hours, minutes, seconds });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch contracts');
      logger.error('[useDailyContracts] Failed to fetch contracts:', err as Error, { context: 'fetchContracts' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch streak information
   */
  const fetchStreakInfo = useCallback(async () => {
    try {
      const response = await dailyContractService.getStreak();

      // Map service streak data to hook StreakInfo
      const mappedStreakInfo: StreakInfo = {
        currentStreak: response.streak.currentStreak,
        todayCompleted: 0, // This needs to be calculated separately or added to service
        totalContractsToday: 0, // This needs to be calculated separately or added to service
        nextBonusDay: response.nextMilestone,
        nextBonus: response.availableBonuses.length > 0 ? {
          gold: response.availableBonuses[0].rewards.find(r => r.type === 'gold')?.amount || 0,
          xp: response.availableBonuses[0].rewards.find(r => r.type === 'experience')?.amount || 0,
          item: response.availableBonuses[0].rewards.find(r => r.type === 'item')?.itemName,
          description: response.availableBonuses[0].description,
        } : null,
        canClaimStreakBonus: response.availableBonuses.some(b => !b.claimed),
        streakHistory: [], // Not available from service, would need separate endpoint
      };

      setStreakInfo(mappedStreakInfo);
    } catch (err: any) {
      logger.error('[useDailyContracts] Failed to fetch streak info:', err as Error, { context: 'fetchStreakInfo' });
    }
  }, []);

  /**
   * Fetch streak leaderboard
   */
  const fetchLeaderboard = useCallback(async (limit: number = 10) => {
    try {
      const response = await dailyContractService.getStreakLeaderboard();

      // Map service leaderboard to hook leaderboard
      const mappedLeaderboard = response.leaderboard.slice(0, limit).map(entry => ({
        characterId: entry.characterId,
        streak: entry.currentStreak,
        name: entry.characterName,
      }));

      setLeaderboard(mappedLeaderboard);
    } catch (err: any) {
      logger.error('[useDailyContracts] Failed to fetch leaderboard:', err as Error, { context: 'fetchLeaderboard', limit });
    }
  }, []);

  /**
   * Accept a contract
   */
  const acceptContract = useCallback(async (contractId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await dailyContractService.acceptContract(contractId);
      const mappedContract = mapServiceContractToHookContract(response.contract);

      setContracts(prev =>
        prev.map(c => (c.id === contractId ? mappedContract : c))
      );
      setMessage({ text: response.message, success: true });
      return { success: true, message: response.message };
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
      const response = await dailyContractService.updateProgress(contractId, { amount });
      const mappedContract = mapServiceContractToHookContract(response.contract);

      setContracts(prev =>
        prev.map(c => (c.id === contractId ? mappedContract : c))
      );

      return {
        success: true,
        message: response.message,
        isComplete: response.completed
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
      const response = await dailyContractService.completeContract(contractId);
      const mappedContract = mapServiceContractToHookContract(response.contract);

      const mappedRewards: ContractRewards = {
        gold: response.rewards.find(r => r.type === 'gold')?.amount || 0,
        xp: response.rewards.find(r => r.type === 'experience')?.amount || 0,
        items: response.rewards.filter(r => r.type === 'item').map(r => r.itemName || ''),
      };

      const result: CompletionResult = {
        contract: mappedContract,
        rewards: mappedRewards,
        streakUpdate: {
          newStreak: response.newStreak,
          bonusClaimed: false, // Service doesn't provide this
          bonusRewards: response.bonusRewards ? {
            gold: response.bonusRewards.find(r => r.type === 'gold')?.amount || 0,
            xp: response.bonusRewards.find(r => r.type === 'experience')?.amount || 0,
            item: response.bonusRewards.find(r => r.type === 'item')?.itemName,
          } : undefined,
        }
      };

      setContracts(prev =>
        prev.map(c => (c.id === contractId ? mappedContract : c))
      );

      // Refresh character to update gold/xp
      await refreshCharacter();

      // Refresh streak info
      await fetchStreakInfo();

      setMessage({ text: response.message, success: true });

      return { success: true, result, message: response.message };
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
      // Get the current streak info to determine which bonus to claim
      const streakData = await dailyContractService.getStreak();
      const unclaimedBonus = streakData.availableBonuses.find(b => !b.claimed);

      if (!unclaimedBonus) {
        const msg = 'No streak bonus available to claim';
        setMessage({ text: msg, success: false });
        return { success: false, message: msg };
      }

      const response = await dailyContractService.claimStreakBonus(unclaimedBonus.streakDays);

      // Map rewards to hook format
      const mappedRewards = {
        gold: response.rewards.find(r => r.type === 'gold')?.amount || 0,
        xp: response.rewards.find(r => r.type === 'experience')?.amount || 0,
        items: response.rewards.filter(r => r.type === 'item').map(r => r.itemName || ''),
      };

      // Refresh character and streak info
      await refreshCharacter();
      await fetchStreakInfo();

      setMessage({ text: response.message, success: true });

      return {
        success: true,
        message: response.message,
        rewards: mappedRewards
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
