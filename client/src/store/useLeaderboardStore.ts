/**
 * Leaderboard Store
 * Manages leaderboard state and operations
 */

import { create } from 'zustand';
import {
  leaderboardService,
  type LeaderboardType,
  type LeaderboardRange,
  type LeaderboardEntry,
  type GangLeaderboardEntry,
  type GetLevelLeaderboardResponse,
  type GetGoldLeaderboardResponse,
  type GetReputationLeaderboardResponse,
  type GetCombatLeaderboardResponse,
  type GetBountiesLeaderboardResponse,
  type GetGangsLeaderboardResponse,
} from '@/services/leaderboard.service';
import { logger } from '@/services/logger.service';

type LeaderboardResponse =
  | GetLevelLeaderboardResponse
  | GetGoldLeaderboardResponse
  | GetReputationLeaderboardResponse
  | GetCombatLeaderboardResponse
  | GetBountiesLeaderboardResponse
  | GetGangsLeaderboardResponse;

interface LeaderboardStore {
  // State
  leaderboards: Record<LeaderboardType, LeaderboardResponse | null>;
  currentCategory: LeaderboardType;
  timeRange: LeaderboardRange;
  playerRank: number | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchLeaderboard: (category: LeaderboardType, range?: LeaderboardRange, limit?: number) => Promise<void>;
  fetchAllLeaderboards: (range?: LeaderboardRange, limit?: number) => Promise<void>;
  fetchPlayerRank: (characterId: string, category: LeaderboardType) => void;
  setCategory: (category: LeaderboardType) => void;
  setTimeRange: (range: LeaderboardRange) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearLeaderboardState: () => void;

  // Computed
  getCurrentLeaderboard: () => LeaderboardResponse | null;
  getLeaderboardEntries: () => (LeaderboardEntry | GangLeaderboardEntry)[];
  hasLeaderboard: (category: LeaderboardType) => boolean;
}

export const useLeaderboardStore = create<LeaderboardStore>((set, get) => ({
  // Initial state
  leaderboards: {
    level: null,
    gold: null,
    reputation: null,
    combat: null,
    bounties: null,
    gangs: null,
  },
  currentCategory: 'level',
  timeRange: 'all',
  playerRank: null,
  isLoading: false,
  error: null,

  fetchLeaderboard: async (category: LeaderboardType, range?: LeaderboardRange, limit = 100) => {
    set({ isLoading: true, error: null });

    const effectiveRange = range || get().timeRange;

    try {
      let response: LeaderboardResponse;

      switch (category) {
        case 'level':
          response = await leaderboardService.getLevelLeaderboard(effectiveRange, limit);
          break;
        case 'gold':
          response = await leaderboardService.getGoldLeaderboard(effectiveRange, limit);
          break;
        case 'reputation':
          response = await leaderboardService.getReputationLeaderboard(effectiveRange, limit);
          break;
        case 'combat':
          response = await leaderboardService.getCombatLeaderboard(effectiveRange, limit);
          break;
        case 'bounties':
          response = await leaderboardService.getBountiesLeaderboard(effectiveRange, limit);
          break;
        case 'gangs':
          response = await leaderboardService.getGangsLeaderboard(effectiveRange, limit);
          break;
        default:
          throw new Error(`Unknown leaderboard category: ${category}`);
      }

      set((state) => ({
        leaderboards: {
          ...state.leaderboards,
          [category]: response,
        },
        timeRange: effectiveRange,
        isLoading: false,
        error: null,
      }));
    } catch (error: any) {
      logger.error('Failed to fetch leaderboard', error as Error, {
        context: 'useLeaderboardStore.fetchLeaderboard',
        category,
        range: effectiveRange,
      });
      set({
        isLoading: false,
        error: error.message || `Failed to load ${category} leaderboard`,
      });
    }
  },

  fetchAllLeaderboards: async (range?: LeaderboardRange, limit = 100) => {
    set({ isLoading: true, error: null });

    const effectiveRange = range || get().timeRange;

    try {
      const allLeaderboards = await leaderboardService.getAllLeaderboards(effectiveRange, limit);

      set({
        leaderboards: {
          level: allLeaderboards.level,
          gold: allLeaderboards.gold,
          reputation: allLeaderboards.reputation,
          combat: allLeaderboards.combat,
          bounties: allLeaderboards.bounties,
          gangs: allLeaderboards.gangs,
        },
        timeRange: effectiveRange,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      logger.error('Failed to fetch all leaderboards', error as Error, {
        context: 'useLeaderboardStore.fetchAllLeaderboards',
        range: effectiveRange,
      });
      set({
        isLoading: false,
        error: error.message || 'Failed to load leaderboards',
      });
    }
  },

  fetchPlayerRank: (characterId: string, category: LeaderboardType) => {
    const { leaderboards } = get();
    const leaderboard = leaderboards[category];

    if (!leaderboard) {
      set({ playerRank: null });
      return;
    }

    try {
      let rank: number | null = null;

      if (category === 'gangs') {
        // For gang leaderboards, we'd need the gang ID
        // This would require additional logic or parameters
        rank = null;
      } else {
        const entries = leaderboard.leaderboard as LeaderboardEntry[];
        rank = leaderboardService.findCharacterRank(entries, characterId);
      }

      set({ playerRank: rank });
    } catch (error: any) {
      logger.error('Failed to fetch player rank', error as Error, {
        context: 'useLeaderboardStore.fetchPlayerRank',
        characterId,
        category,
      });
      set({ playerRank: null });
    }
  },

  setCategory: (category: LeaderboardType) => {
    set({ currentCategory: category });
  },

  setTimeRange: (range: LeaderboardRange) => {
    set({ timeRange: range });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  clearLeaderboardState: () => {
    set({
      leaderboards: {
        level: null,
        gold: null,
        reputation: null,
        combat: null,
        bounties: null,
        gangs: null,
      },
      currentCategory: 'level',
      timeRange: 'all',
      playerRank: null,
      isLoading: false,
      error: null,
    });
  },

  getCurrentLeaderboard: () => {
    const { leaderboards, currentCategory } = get();
    return leaderboards[currentCategory];
  },

  getLeaderboardEntries: () => {
    const leaderboard = get().getCurrentLeaderboard();
    return leaderboard?.leaderboard || [];
  },

  hasLeaderboard: (category: LeaderboardType) => {
    const { leaderboards } = get();
    return leaderboards[category] !== null;
  },
}));

export default useLeaderboardStore;
