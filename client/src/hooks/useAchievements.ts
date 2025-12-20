/**
 * useAchievements Hook
 * Manages achievement tracking, viewing, and reward claiming
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';
import { logger } from '@/services/logger.service';

// Achievement categories
export type AchievementCategory =
  | 'COMBAT'
  | 'EXPLORATION'
  | 'SOCIAL'
  | 'WEALTH'
  | 'REPUTATION'
  | 'GANG'
  | 'STORY'
  | 'COLLECTION'
  | 'SKILL'
  | 'SPECIAL';

// Achievement tiers
export type AchievementTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'LEGENDARY';

export interface AchievementReward {
  type: 'gold' | 'experience' | 'item' | 'title' | 'badge' | 'skill_point';
  amount?: number;
  itemId?: string;
  itemName?: string;
  title?: string;
  badgeId?: string;
}

export interface AchievementRequirement {
  type: string;
  description: string;
  target: number;
  current: number;
}

export interface Achievement {
  _id: string;
  achievementId: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string;
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  isSecret: boolean;
  isUnlocked: boolean;
  isClaimed: boolean;
  unlockedAt?: string;
  claimedAt?: string;
  progress: number; // 0-100
  points: number; // Achievement points value
}

export interface AchievementSummary {
  totalAchievements: number;
  unlockedCount: number;
  claimedCount: number;
  totalPoints: number;
  earnedPoints: number;
  categoryProgress: {
    category: AchievementCategory;
    total: number;
    unlocked: number;
  }[];
  recentUnlocks: Achievement[];
  unclaimedRewards: number;
}

export interface AchievementProgress {
  achievementId: string;
  requirementIndex: number;
  current: number;
  target: number;
  percentage: number;
}

interface UseAchievementsReturn {
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  summary: AchievementSummary | null;
  isLoading: boolean;
  error: string | null;
  fetchAchievements: (category?: AchievementCategory) => Promise<void>;
  fetchUnlockedAchievements: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  getAchievementProgress: (achievementId: string) => Promise<AchievementProgress | null>;
  claimReward: (achievementId: string) => Promise<{ success: boolean; message: string; rewards?: AchievementReward[] }>;
  clearError: () => void;
}

export const useAchievements = (): UseAchievementsReturn => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [summary, setSummary] = useState<AchievementSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  // Fetch all achievements
  const fetchAchievements = useCallback(async (category?: AchievementCategory) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = category ? `/achievements?category=${category}` : '/achievements';
      const response = await api.get<{ data: { achievements: Achievement[] } }>(url);
      setAchievements(response.data.data.achievements || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch achievements';
      setError(errorMessage);
      logger.error('[useAchievements] Fetch achievements error:', err as Error, { context: { errorMessage } });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch unlocked achievements only
  const fetchUnlockedAchievements = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { achievements: Achievement[] } }>('/achievements?unlocked=true');
      setUnlockedAchievements(response.data.data.achievements || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch unlocked achievements';
      setError(errorMessage);
      logger.error('[useAchievements] Fetch unlocked achievements error:', err as Error, { context: { errorMessage } });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch achievement summary
  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { summary: AchievementSummary } }>('/achievements/summary');
      setSummary(response.data.data.summary);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch achievement summary';
      setError(errorMessage);
      logger.error('[useAchievements] Fetch summary error:', err as Error, { context: { errorMessage } });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get progress for a specific achievement
  const getAchievementProgress = useCallback(async (achievementId: string): Promise<AchievementProgress | null> => {
    try {
      const response = await api.get<{ data: { progress: AchievementProgress } }>(
        `/achievements/${achievementId}/progress`
      );
      return response.data.data.progress;
    } catch (err: any) {
      logger.error('[useAchievements] Get progress error:', err as Error, { context: { achievementId } });
      return null;
    }
  }, []);

  // Claim achievement reward
  const claimReward = useCallback(async (achievementId: string): Promise<{ success: boolean; message: string; rewards?: AchievementReward[] }> => {
    try {
      const response = await api.post<{ data: { message: string; rewards: AchievementReward[]; achievement: Achievement } }>(
        `/achievements/${achievementId}/claim`
      );
      const { rewards, achievement, message } = response.data.data;

      // Update local state
      setAchievements(prev => prev.map(a =>
        (a._id === achievementId || a.achievementId === achievementId) ? achievement : a
      ));
      setUnlockedAchievements(prev => prev.map(a =>
        (a._id === achievementId || a.achievementId === achievementId) ? achievement : a
      ));

      // Update summary if exists
      if (summary) {
        setSummary({
          ...summary,
          claimedCount: summary.claimedCount + 1,
          unclaimedRewards: Math.max(0, summary.unclaimedRewards - 1)
        });
      }

      // Refresh character to update rewards
      await refreshCharacter();

      return { success: true, message, rewards };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to claim achievement reward';
      setError(errorMessage);
      logger.error('[useAchievements] Claim reward error:', err as Error, { context: { achievementId, errorMessage } });
      return { success: false, message: errorMessage };
    }
  }, [summary, refreshCharacter]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    achievements,
    unlockedAchievements,
    summary,
    isLoading,
    error,
    fetchAchievements,
    fetchUnlockedAchievements,
    fetchSummary,
    getAchievementProgress,
    claimReward,
    clearError,
  };
};

export default useAchievements;
