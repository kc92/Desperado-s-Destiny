/**
 * useDuels Hook
 * Manages PvP duel system: challenges, gameplay, and history
 */

import { useState, useCallback } from 'react';
import { api } from '@/services/api';
import { useCharacterStore } from '@/store/useCharacterStore';
import { logger } from '@/services/logger.service';

// Duel status types
export type DuelStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED';

// Duel types
export type DuelType = 'STANDARD' | 'RANKED' | 'FRIENDLY' | 'WAGER';

// Card suits and values for deck games
export type CardSuit = 'SPADES' | 'HEARTS' | 'DIAMONDS' | 'CLUBS';
export type CardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface DuelCard {
  suit: CardSuit;
  value: CardValue;
  isHidden?: boolean;
}

export interface DuelParticipant {
  characterId: string;
  characterName: string;
  level: number;
  hand: DuelCard[];
  score: number;
  isReady: boolean;
  hasFolded: boolean;
  currentBet: number;
}

export interface DuelChallenge {
  _id: string;
  challengerId: string;
  challengerName: string;
  targetId: string;
  targetName: string;
  type: DuelType;
  wagerAmount?: number;
  status: DuelStatus;
  createdAt: string;
  expiresAt: string;
}

export interface DuelGameState {
  deck: DuelCard[];
  communityCards: DuelCard[];
  pot: number;
  currentTurn: string; // characterId
  round: number;
  maxRounds: number;
  minBet: number;
  lastAction?: {
    characterId: string;
    action: string;
    amount?: number;
  };
}

export interface Duel {
  _id: string;
  participants: DuelParticipant[];
  type: DuelType;
  status: DuelStatus;
  gameState: DuelGameState;
  wagerAmount?: number;
  winnerId?: string;
  winnerName?: string;
  startedAt: string;
  endedAt?: string;
  history: {
    action: string;
    characterId: string;
    characterName: string;
    amount?: number;
    timestamp: string;
  }[];
}

export interface DuelHistoryEntry {
  _id: string;
  opponentId: string;
  opponentName: string;
  type: DuelType;
  result: 'WIN' | 'LOSS' | 'DRAW';
  wagerAmount?: number;
  goldWon?: number;
  goldLost?: number;
  endedAt: string;
}

export interface DuelStats {
  totalDuels: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  currentStreak: number;
  longestWinStreak: number;
  totalGoldWon: number;
  totalGoldLost: number;
  rankedRating?: number;
  rankedRank?: number;
}

export interface DuelAction {
  type: 'BET' | 'RAISE' | 'CALL' | 'CHECK' | 'FOLD' | 'ALL_IN';
  cardIndices?: number[];
  amount?: number;
}

interface UseDuelsReturn {
  pendingChallenges: DuelChallenge[];
  activeDuels: Duel[];
  currentDuel: Duel | null;
  duelHistory: DuelHistoryEntry[];
  duelStats: DuelStats | null;
  isLoading: boolean;
  error: string | null;
  fetchPendingChallenges: () => Promise<void>;
  fetchActiveDuels: () => Promise<void>;
  fetchDuelHistory: (limit?: number) => Promise<void>;
  fetchDuelStats: () => Promise<void>;
  getDuelGame: (duelId: string) => Promise<Duel | null>;
  challengePlayer: (targetId: string, type?: DuelType, wagerAmount?: number) => Promise<{ success: boolean; message: string; challenge?: DuelChallenge }>;
  acceptDuel: (duelId: string) => Promise<{ success: boolean; message: string; duel?: Duel }>;
  declineDuel: (duelId: string) => Promise<{ success: boolean; message: string }>;
  cancelDuel: (duelId: string) => Promise<{ success: boolean; message: string }>;
  playAction: (duelId: string, action: DuelAction) => Promise<{ success: boolean; message: string; duel?: Duel }>;
  clearError: () => void;
}

export const useDuels = (): UseDuelsReturn => {
  const [pendingChallenges, setPendingChallenges] = useState<DuelChallenge[]>([]);
  const [activeDuels, setActiveDuels] = useState<Duel[]>([]);
  const [currentDuel, setCurrentDuel] = useState<Duel | null>(null);
  const [duelHistory, setDuelHistory] = useState<DuelHistoryEntry[]>([]);
  const [duelStats, setDuelStats] = useState<DuelStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { refreshCharacter } = useCharacterStore();

  // Fetch pending challenges
  const fetchPendingChallenges = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { challenges: DuelChallenge[] } }>('/duels/pending');
      setPendingChallenges(response.data.data.challenges || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch pending challenges';
      setError(errorMessage);
      logger.error('Fetch pending challenges error', err as Error, { context: 'useDuels' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch active duels
  const fetchActiveDuels = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { duels: Duel[] } }>('/duels/active');
      setActiveDuels(response.data.data.duels || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch active duels';
      setError(errorMessage);
      logger.error('Fetch active duels error', err as Error, { context: 'useDuels' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch duel history
  const fetchDuelHistory = useCallback(async (limit: number = 20) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: { history: DuelHistoryEntry[] } }>(
        `/duels/history?limit=${limit}`
      );
      setDuelHistory(response.data.data.history || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch duel history';
      setError(errorMessage);
      logger.error('Fetch duel history error', err as Error, { context: 'useDuels' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch duel stats
  const fetchDuelStats = useCallback(async () => {
    try {
      const response = await api.get<{ data: { stats: DuelStats } }>('/duels/stats');
      setDuelStats(response.data.data.stats);
    } catch (err: any) {
      logger.error('Fetch duel stats error', err as Error, { context: 'useDuels' });
    }
  }, []);

  // Get current game state for a duel
  const getDuelGame = useCallback(async (duelId: string): Promise<Duel | null> => {
    try {
      const response = await api.get<{ data: { duel: Duel } }>(`/duels/${duelId}/game`);
      const duel = response.data.data.duel;
      setCurrentDuel(duel);
      return duel;
    } catch (err: any) {
      logger.error('Get duel game error', err as Error, { context: 'useDuels' });
      return null;
    }
  }, []);

  // Challenge a player
  const challengePlayer = useCallback(async (
    targetId: string,
    type: DuelType = 'STANDARD',
    wagerAmount?: number
  ): Promise<{ success: boolean; message: string; challenge?: DuelChallenge }> => {
    try {
      const response = await api.post<{ data: { challenge: DuelChallenge; message: string } }>(
        '/duels/challenge',
        { targetId, type, wagerAmount }
      );
      const { challenge, message } = response.data.data;

      return { success: true, message, challenge };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to challenge player';
      setError(errorMessage);
      logger.error('Challenge player error', err as Error, { context: 'useDuels' });
      return { success: false, message: errorMessage };
    }
  }, []);

  // Accept a duel challenge
  const acceptDuel = useCallback(async (duelId: string): Promise<{ success: boolean; message: string; duel?: Duel }> => {
    try {
      const response = await api.post<{ data: { duel: Duel; message: string } }>(
        `/duels/${duelId}/accept`
      );
      const { duel, message } = response.data.data;

      // Update local state
      setPendingChallenges(prev => prev.filter(c => c._id !== duelId));
      setActiveDuels(prev => [...prev, duel]);
      setCurrentDuel(duel);

      return { success: true, message, duel };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to accept duel';
      setError(errorMessage);
      logger.error('Accept duel error', err as Error, { context: 'useDuels' });
      return { success: false, message: errorMessage };
    }
  }, []);

  // Decline a duel challenge
  const declineDuel = useCallback(async (duelId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ data: { message: string } }>(
        `/duels/${duelId}/decline`
      );

      // Update local state
      setPendingChallenges(prev => prev.filter(c => c._id !== duelId));

      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to decline duel';
      setError(errorMessage);
      logger.error('Decline duel error', err as Error, { context: 'useDuels' });
      return { success: false, message: errorMessage };
    }
  }, []);

  // Cancel a duel (by challenger)
  const cancelDuel = useCallback(async (duelId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ data: { message: string } }>(
        `/duels/${duelId}/cancel`
      );

      // Update local state
      setPendingChallenges(prev => prev.filter(c => c._id !== duelId));

      return { success: true, message: response.data.data.message };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to cancel duel';
      setError(errorMessage);
      logger.error('Cancel duel error', err as Error, { context: 'useDuels' });
      return { success: false, message: errorMessage };
    }
  }, []);

  // Play an action in the duel
  const playAction = useCallback(async (
    duelId: string,
    action: DuelAction
  ): Promise<{ success: boolean; message: string; duel?: Duel }> => {
    try {
      const response = await api.post<{ data: { duel: Duel; message: string } }>(
        `/duels/${duelId}/play`,
        { action }
      );
      const { duel, message } = response.data.data;

      // Update local state
      setCurrentDuel(duel);
      setActiveDuels(prev => prev.map(d => d._id === duelId ? duel : d));

      // If duel is completed, move to history and refresh character
      if (duel.status === 'COMPLETED') {
        setActiveDuels(prev => prev.filter(d => d._id !== duelId));
        await refreshCharacter();
        await fetchDuelHistory();
      }

      return { success: true, message, duel };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to play action';
      setError(errorMessage);
      logger.error('Play action error', err as Error, { context: 'useDuels' });
      return { success: false, message: errorMessage };
    }
  }, [refreshCharacter, fetchDuelHistory]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    pendingChallenges,
    activeDuels,
    currentDuel,
    duelHistory,
    duelStats,
    isLoading,
    error,
    fetchPendingChallenges,
    fetchActiveDuels,
    fetchDuelHistory,
    fetchDuelStats,
    getDuelGame,
    challengePlayer,
    acceptDuel,
    declineDuel,
    cancelDuel,
    playAction,
    clearError,
  };
};

export default useDuels;
