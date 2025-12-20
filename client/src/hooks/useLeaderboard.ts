/**
 * useLeaderboard Hook
 * Manages leaderboard data retrieval across multiple categories
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { logger } from '@/services/logger.service';

// Leaderboard categories
export type LeaderboardCategory =
  | 'level'
  | 'gold'
  | 'reputation'
  | 'combat'
  | 'bounties'
  | 'gangs';

// Time range options
export type LeaderboardRange = 'all' | 'monthly' | 'weekly' | 'daily';

export interface LeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  userId?: string;
  value: number;
  avatarUrl?: string;
  level?: number;
  faction?: string;
  gangId?: string;
  gangName?: string;
  isCurrentPlayer?: boolean;
}

export interface GangLeaderboardEntry {
  rank: number;
  gangId: string;
  gangName: string;
  leaderId: string;
  leaderName: string;
  memberCount: number;
  value: number;
  emblem?: string;
  territoriesControlled?: number;
}

export interface PlayerRank {
  characterId: string;
  characterName: string;
  rank: number;
  value: number;
  totalPlayers: number;
  percentile: number;
  nearbyPlayers: LeaderboardEntry[];
}

export interface LeaderboardData {
  category: LeaderboardCategory;
  range: LeaderboardRange;
  entries: LeaderboardEntry[];
  totalEntries: number;
  lastUpdated: string;
}

export interface GangLeaderboardData {
  range: LeaderboardRange;
  entries: GangLeaderboardEntry[];
  totalEntries: number;
  lastUpdated: string;
}

interface UseLeaderboardReturn {
  leaderboardData: LeaderboardData | null;
  gangLeaderboard: GangLeaderboardData | null;
  playerRank: PlayerRank | null;
  isLoading: boolean;
  error: string | null;
  fetchLeaderboard: (category: LeaderboardCategory, range?: LeaderboardRange, limit?: number) => Promise<void>;
  fetchGangLeaderboard: (range?: LeaderboardRange, limit?: number) => Promise<void>;
  fetchPlayerRank: (category: LeaderboardCategory, playerId?: string) => Promise<PlayerRank | null>;
  clearError: () => void;
}

export const useLeaderboard = (): UseLeaderboardReturn => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [gangLeaderboard, setGangLeaderboard] = useState<GangLeaderboardData | null>(null);
  const [playerRank, setPlayerRank] = useState<PlayerRank | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard by category
  const fetchLeaderboard = useCallback(async (
    category: LeaderboardCategory,
    range: LeaderboardRange = 'all',
    limit: number = 100
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Gang leaderboard uses a different endpoint
      if (category === 'gangs') {
        await fetchGangLeaderboard(range, limit);
        return;
      }

      const response = await api.get<{ data: { leaderboard: LeaderboardEntry[]; total: number } }>(
        `/leaderboard/${category}?range=${range}&limit=${limit}`
      );

      setLeaderboardData({
        category,
        range,
        entries: response.data.data.leaderboard || [],
        totalEntries: response.data.data.total || 0,
        lastUpdated: new Date().toISOString()
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch leaderboard';
      setError(errorMessage);
      logger.error('Fetch leaderboard error', err as Error, { context: 'useLeaderboard' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch gang leaderboard specifically
  const fetchGangLeaderboard = useCallback(async (
    range: LeaderboardRange = 'all',
    limit: number = 50
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { leaderboard: GangLeaderboardEntry[]; total: number } }>(
        `/leaderboard/gangs?range=${range}&limit=${limit}`
      );

      setGangLeaderboard({
        range,
        entries: response.data.data.leaderboard || [],
        totalEntries: response.data.data.total || 0,
        lastUpdated: new Date().toISOString()
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch gang leaderboard';
      setError(errorMessage);
      logger.error('Fetch gang leaderboard error', err as Error, { context: 'useLeaderboard' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch player's rank in a specific category
  const fetchPlayerRank = useCallback(async (
    category: LeaderboardCategory,
    playerId?: string
  ): Promise<PlayerRank | null> => {
    try {
      const url = playerId
        ? `/leaderboard/${category}/player/${playerId}`
        : `/leaderboard/${category}/me`;

      const response = await api.get<{ data: { rank: PlayerRank } }>(url);
      const rank = response.data.data.rank;
      setPlayerRank(rank);
      return rank;
    } catch (err: any) {
      logger.error('Fetch player rank error', err as Error, { context: 'useLeaderboard' });
      return null;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    leaderboardData,
    gangLeaderboard,
    playerRank,
    isLoading,
    error,
    fetchLeaderboard,
    fetchGangLeaderboard,
    fetchPlayerRank,
    clearError,
  };
};

export default useLeaderboard;
