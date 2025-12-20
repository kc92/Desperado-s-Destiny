/**
 * Duel Service
 * API client for PvP deck game duel operations
 */

import api from './api';
import { DuelType } from '@shared/types/duel.types';
import type {
  DuelStatus,
  DuelPlayer,
  DuelClientState,
  BettingAction,
  RoundResult,
  DuelRewards,
} from '@shared/types/duel.types';

// ===== Types =====

export interface DuelChallenge {
  _id: string;
  challengerId: string;
  challengedId: string;
  type: DuelType;
  status: DuelStatus;
  wagerAmount: number;
  challenger: DuelPlayer;
  challenged: DuelPlayer;
  createdAt: string;
  expiresAt: string;
}

export interface DuelSession {
  _id: string;
  challengerId: string;
  challengedId: string;
  type: DuelType;
  status: DuelStatus;
  wagerAmount: number;
  roundsPlayed: number;
  totalRounds: number;
  winnerId?: string;
  rewards?: DuelRewards;
  startedAt: string;
  completedAt?: string;
}

export interface DuelHistoryEntry {
  _id: string;
  opponentId: string;
  opponentName: string;
  type: DuelType;
  result: 'won' | 'lost' | 'draw' | 'forfeited';
  wagerAmount: number;
  roundsWon: number;
  roundsLost: number;
  rewards: DuelRewards;
  completedAt: string;
}

export interface DuelStats {
  totalDuels: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  totalWagered: number;
  totalWon: number;
  netGold: number;
  favoriteOpponent?: string;
  longestWinStreak: number;
  currentStreak: number;
  averageRoundsPerDuel: number;
  casualDuels: number;
  rankedDuels: number;
  wagerDuels: number;
}

// ===== Request/Response Types =====

export interface ChallengeDuelRequest {
  targetId: string;
  type?: DuelType;
  wagerAmount?: number;
}

export interface ChallengeDuelResponse {
  duel: DuelChallenge;
  message: string;
}

export interface AcceptDuelResponse {
  duel: DuelSession;
  message: string;
}

export interface DeclineDuelResponse {
  message: string;
}

export interface CancelDuelResponse {
  message: string;
}

export interface GetDuelGameResponse {
  state: DuelClientState;
}

export interface PlayDuelActionRequest {
  action: {
    type: 'hold_cards' | 'draw' | 'bet' | 'fold';
    cardIndices?: number[];
    betAction?: BettingAction;
    betAmount?: number;
  };
}

export interface PlayDuelActionResponse {
  state: DuelClientState;
  result?: RoundResult;
  message: string;
}

export interface GetPendingChallengesResponse {
  received: DuelChallenge[];
  sent: DuelChallenge[];
}

export interface GetActiveDuelsResponse {
  duels: DuelSession[];
}

export interface GetDuelHistoryResponse {
  history: DuelHistoryEntry[];
  total: number;
}

export interface GetDuelStatsResponse {
  stats: DuelStats;
}

// ===== Duel Service =====

export const duelService = {
  /**
   * Challenge another player to a duel
   * POST /api/duels/challenge
   */
  async challengePlayer(request: ChallengeDuelRequest): Promise<ChallengeDuelResponse> {
    const response = await api.post<{ data: ChallengeDuelResponse }>('/duels/challenge', request);
    return response.data.data;
  },

  /**
   * Accept a duel challenge
   * POST /api/duels/:duelId/accept
   */
  async acceptDuel(duelId: string): Promise<AcceptDuelResponse> {
    const response = await api.post<{ data: AcceptDuelResponse }>(`/duels/${duelId}/accept`);
    return response.data.data;
  },

  /**
   * Decline a duel challenge
   * POST /api/duels/:duelId/decline
   */
  async declineDuel(duelId: string): Promise<DeclineDuelResponse> {
    const response = await api.post<{ data: DeclineDuelResponse }>(`/duels/${duelId}/decline`);
    return response.data.data;
  },

  /**
   * Cancel a duel challenge (by challenger)
   * POST /api/duels/:duelId/cancel
   */
  async cancelDuel(duelId: string): Promise<CancelDuelResponse> {
    const response = await api.post<{ data: CancelDuelResponse }>(`/duels/${duelId}/cancel`);
    return response.data.data;
  },

  /**
   * Get current game state for an active duel
   * GET /api/duels/:duelId/game
   */
  async getDuelGame(duelId: string): Promise<DuelClientState> {
    const response = await api.get<{ data: GetDuelGameResponse }>(`/duels/${duelId}/game`);
    return response.data.data.state;
  },

  /**
   * Play an action in the duel
   * POST /api/duels/:duelId/play
   */
  async playAction(duelId: string, action: PlayDuelActionRequest['action']): Promise<PlayDuelActionResponse> {
    const response = await api.post<{ data: PlayDuelActionResponse }>(`/duels/${duelId}/play`, { action });
    return response.data.data;
  },

  /**
   * Get pending challenges for the character
   * GET /api/duels/pending
   */
  async getPendingChallenges(): Promise<GetPendingChallengesResponse> {
    const response = await api.get<{ data: GetPendingChallengesResponse }>('/duels/pending');
    return response.data.data;
  },

  /**
   * Get active duels for the character
   * GET /api/duels/active
   */
  async getActiveDuels(): Promise<DuelSession[]> {
    const response = await api.get<{ data: GetActiveDuelsResponse }>('/duels/active');
    return response.data.data.duels;
  },

  /**
   * Get duel history for the character
   * GET /api/duels/history
   */
  async getDuelHistory(limit?: number): Promise<DuelHistoryEntry[]> {
    const params = limit ? { limit } : {};
    const response = await api.get<{ data: GetDuelHistoryResponse }>('/duels/history', { params });
    return response.data.data.history;
  },

  /**
   * Get duel statistics for the character
   * GET /api/duels/stats
   */
  async getDuelStats(): Promise<DuelStats> {
    const response = await api.get<{ data: GetDuelStatsResponse }>('/duels/stats');
    return response.data.data.stats;
  },

  // ===== Convenience Methods =====

  /**
   * Challenge player to casual duel
   */
  async challengeCasual(targetId: string): Promise<ChallengeDuelResponse> {
    return this.challengePlayer({ targetId, type: DuelType.CASUAL });
  },

  /**
   * Challenge player to ranked duel
   */
  async challengeRanked(targetId: string): Promise<ChallengeDuelResponse> {
    return this.challengePlayer({ targetId, type: DuelType.RANKED });
  },

  /**
   * Challenge player to wager duel
   */
  async challengeWager(targetId: string, wagerAmount: number): Promise<ChallengeDuelResponse> {
    return this.challengePlayer({ targetId, type: DuelType.WAGER, wagerAmount });
  },

  /**
   * Hold specific cards during draw phase
   */
  async holdCards(duelId: string, cardIndices: number[]): Promise<PlayDuelActionResponse> {
    return this.playAction(duelId, { type: 'hold_cards', cardIndices });
  },

  /**
   * Draw new cards (replacing unheld cards)
   */
  async draw(duelId: string): Promise<PlayDuelActionResponse> {
    return this.playAction(duelId, { type: 'draw' });
  },

  /**
   * Place a bet
   */
  async placeBet(duelId: string, betAction: BettingAction, amount?: number): Promise<PlayDuelActionResponse> {
    return this.playAction(duelId, { type: 'bet', betAction, betAmount: amount });
  },

  /**
   * Fold the current round
   */
  async fold(duelId: string): Promise<PlayDuelActionResponse> {
    return this.playAction(duelId, { type: 'fold' });
  },

  /**
   * Check if character has pending challenges
   */
  async hasPendingChallenges(): Promise<boolean> {
    const challenges = await this.getPendingChallenges();
    return challenges.received.length > 0 || challenges.sent.length > 0;
  },

  /**
   * Get total pending challenge count
   */
  async getPendingCount(): Promise<number> {
    const challenges = await this.getPendingChallenges();
    return challenges.received.length + challenges.sent.length;
  },

  /**
   * Check if character has active duels
   */
  async hasActiveDuels(): Promise<boolean> {
    const duels = await this.getActiveDuels();
    return duels.length > 0;
  },

  /**
   * Format duel result display
   */
  formatResult(result: 'won' | 'lost' | 'draw' | 'forfeited'): string {
    const resultMap = {
      won: 'Victory',
      lost: 'Defeat',
      draw: 'Draw',
      forfeited: 'Forfeited',
    };
    return resultMap[result] || result;
  },

  /**
   * Calculate win rate percentage
   */
  calculateWinRate(stats: DuelStats): number {
    if (stats.totalDuels === 0) return 0;
    return Math.round((stats.wins / stats.totalDuels) * 100);
  },

  /**
   * Get duel type display name
   */
  getDuelTypeDisplay(type: DuelType): string {
    const typeMap: Record<DuelType, string> = {
      [DuelType.CASUAL]: 'Casual',
      [DuelType.RANKED]: 'Ranked',
      [DuelType.WAGER]: 'Wager',
    };
    return typeMap[type] || type;
  },
};

export default duelService;
