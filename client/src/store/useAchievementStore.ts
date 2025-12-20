/**
 * Achievement Store
 * Manages achievements, progress tracking, and rewards
 */

import { create } from 'zustand';
import {
  achievementService,
  type Achievement,
  type AchievementsByCategory,
  type AchievementStats,
  type AchievementProgress,
  type GetAchievementSummaryResponse,
  type ClaimAchievementRewardResponse,
} from '@/services/achievement.service';
import { logger } from '@/services/logger.service';

interface AchievementStore {
  // State
  achievements: Achievement[];
  achievementsByCategory: AchievementsByCategory | null;
  unlockedAchievements: Achievement[];
  recentlyCompleted: Achievement[];
  nearCompletion: AchievementProgress[];
  unclaimedRewards: Achievement[];
  stats: AchievementStats | null;
  summary: GetAchievementSummaryResponse | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAchievements: () => Promise<void>;
  fetchAchievementSummary: () => Promise<void>;
  claimReward: (achievementId: string) => Promise<ClaimAchievementRewardResponse | null>;
  checkProgress: (achievementId: string) => number;
  clearAchievementState: () => void;
}

export const useAchievementStore = create<AchievementStore>((set, get) => ({
  // Initial state
  achievements: [],
  achievementsByCategory: null,
  unlockedAchievements: [],
  recentlyCompleted: [],
  nearCompletion: [],
  unclaimedRewards: [],
  stats: null,
  summary: null,
  isLoading: false,
  error: null,

  fetchAchievements: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await achievementService.getAchievements();

      // Flatten all achievements from categories
      const allAchievements = Object.values(response.achievements).flat();

      set({
        achievements: allAchievements,
        achievementsByCategory: response.achievements,
        stats: response.stats,
        recentlyCompleted: response.recentlyCompleted,
        unlockedAchievements: achievementService.getCompleted(allAchievements),
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      logger.error('Failed to fetch achievements', error as Error, {
        context: 'useAchievementStore.fetchAchievements',
      });
      set({
        isLoading: false,
        error: error.message || 'Failed to load achievements',
      });
    }
  },

  fetchAchievementSummary: async () => {
    set({ isLoading: true, error: null });

    try {
      const summary = await achievementService.getAchievementSummary();

      set({
        summary,
        nearCompletion: summary.nearCompletion,
        unclaimedRewards: summary.unclaimedRewards,
        recentlyCompleted: summary.recentlyCompleted,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      logger.error('Failed to fetch achievement summary', error as Error, {
        context: 'useAchievementStore.fetchAchievementSummary',
      });
      set({
        isLoading: false,
        error: error.message || 'Failed to load achievement summary',
      });
    }
  },

  claimReward: async (achievementId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await achievementService.claimAchievementReward(achievementId);

      // Update the achievement in state to mark it as claimed
      set((state) => ({
        achievements: state.achievements.map((achievement) =>
          achievement._id === achievementId
            ? { ...achievement, claimedAt: response.achievement.claimedAt }
            : achievement
        ),
        // Update achievements by category
        achievementsByCategory: state.achievementsByCategory
          ? Object.entries(state.achievementsByCategory).reduce(
              (acc, [category, achievements]) => ({
                ...acc,
                [category]: achievements.map((achievement: Achievement) =>
                  achievement._id === achievementId
                    ? { ...achievement, claimedAt: response.achievement.claimedAt }
                    : achievement
                ),
              }),
              {} as AchievementsByCategory
            )
          : null,
        // Remove from unclaimed rewards
        unclaimedRewards: state.unclaimedRewards.filter(
          (achievement) => achievement._id !== achievementId
        ),
        isLoading: false,
        error: null,
      }));

      logger.info('Achievement reward claimed', {
        achievementId,
        rewards: response.rewards,
      });

      return response;
    } catch (error: any) {
      logger.error('Failed to claim achievement reward', error as Error, {
        context: 'useAchievementStore.claimReward',
        achievementId,
      });
      set({
        isLoading: false,
        error: error.message || 'Failed to claim reward',
      });
      throw error;
    }
  },

  checkProgress: (achievementId: string) => {
    const { achievements } = get();
    const achievement = achievements.find((a) => a._id === achievementId);

    if (!achievement) {
      logger.warn('Achievement not found for progress check', { achievementId });
      return 0;
    }

    return achievementService.calculateProgress(achievement);
  },

  clearAchievementState: () => {
    set({
      achievements: [],
      achievementsByCategory: null,
      unlockedAchievements: [],
      recentlyCompleted: [],
      nearCompletion: [],
      unclaimedRewards: [],
      stats: null,
      summary: null,
      isLoading: false,
      error: null,
    });
  },
}));

export default useAchievementStore;
