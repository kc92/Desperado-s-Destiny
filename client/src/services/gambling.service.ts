/**
 * Gambling Service
 * API client for gambling operations (Blackjack, Roulette, Craps, Faro, Monte, Wheel)
 */

import api from './api';

// ===== Types =====

export type GameType = 'blackjack' | 'roulette' | 'craps' | 'faro' | 'three_card_monte' | 'wheel_of_fortune';

export interface GamblingGame {
  id: GameType;
  name: string;
  description: string;
  minBet: number;
  maxBet: number;
  houseEdge: number;
  rules: string[];
}

export interface GamblingLocation {
  _id: string;
  name: string;
  description: string;
  availableGames: GameType[];
  minBet: number;
  maxBet: number;
  houseEdge: number;
  atmosphere?: string;
  npcDealers?: string[];
}

export interface GameSession {
  _id: string;
  gameType: GameType;
  locationId: string;
  locationName?: string;
  status: 'active' | 'completed' | 'abandoned';
  currentBet: number;
  totalWagered: number;
  totalWon: number;
  netResult: number;
  handsPlayed: number;
  startTime: string;
  endTime?: string;
}

export interface BlackjackHand {
  cards: { suit: string; value: string; numericValue: number }[];
  total: number;
  isBusted: boolean;
  isBlackjack: boolean;
}

export interface BlackjackState {
  playerHand: BlackjackHand;
  dealerHand: BlackjackHand;
  dealerHidden: boolean;
  currentBet: number;
  canHit: boolean;
  canStand: boolean;
  canDouble: boolean;
  canSplit: boolean;
  result?: 'win' | 'lose' | 'push' | 'blackjack';
  payout?: number;
  session?: GameSession;
}

export interface RouletteBet {
  type: string;
  value: number | string;
  amount: number;
}

export interface RouletteState {
  currentBet: number;
  selectedBets: RouletteBet[];
  result?: number;
  winningBets: string[];
  payout?: number;
  session?: GameSession;
}

export interface CrapsState {
  currentBet: number;
  betType: 'pass' | 'dont_pass' | 'come' | 'dont_come' | 'field' | 'any_seven';
  point: number | null;
  dice: [number, number];
  result?: 'win' | 'lose' | 'point_set';
  payout?: number;
  session?: GameSession;
}

export interface FaroState {
  currentBet: number;
  selectedCard: string;
  losingCard?: string;
  winningCard?: string;
  result?: 'win' | 'lose' | 'push';
  payout?: number;
  session?: GameSession;
}

export interface ThreeCardMonteState {
  currentBet: number;
  selectedPosition: number | null;
  queenPosition?: number;
  revealed: boolean;
  result?: 'win' | 'lose';
  payout?: number;
  session?: GameSession;
}

export interface WheelOfFortuneState {
  currentBet: number;
  selectedSegment: number;
  spinResult?: number;
  isSpinning: boolean;
  result?: 'win' | 'lose';
  payout?: number;
  session?: GameSession;
}

export interface SessionHistory {
  _id: string;
  gameType: GameType;
  locationName: string;
  totalWagered: number;
  netResult: number;
  handsPlayed: number;
  endTime: string;
}

export interface LeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  gameType: GameType;
  biggestWin: number;
  totalWon: number;
  winRate: number;
}

export interface GamblingStats {
  totalSessions: number;
  totalWagered: number;
  totalWon: number;
  netResult: number;
  favoriteGame: GameType | null;
  winRate: number;
  biggestWin: number;
  currentStreak: number;
  longestStreak: number;
}

export interface GamblingItem {
  id: string;
  name: string;
  type: 'lucky_charm' | 'loaded_dice' | 'marked_cards';
  description: string;
  effect: string;
  price: number;
}

// ===== Start Session Request/Response =====

export interface StartSessionRequest {
  gameId: GameType;
  location: string;
  initialBet: number;
}

export interface StartSessionResponse {
  session: GameSession;
  message: string;
}

// ===== Bet Request/Response =====

export interface BlackjackBetRequest {
  action: 'deal' | 'hit' | 'stand' | 'double' | 'split';
  betAmount?: number;
}

export interface RouletteBetRequest {
  bets: RouletteBet[];
}

export interface CrapsBetRequest {
  betType: 'pass' | 'dont_pass' | 'come' | 'dont_come' | 'field' | 'any_seven';
  betAmount: number;
  action: 'bet' | 'roll';
}

export interface FaroBetRequest {
  selectedCard: string;
  betAmount: number;
}

export interface ThreeCardMonteBetRequest {
  selectedPosition: number;
  betAmount: number;
}

export interface WheelOfFortuneBetRequest {
  selectedSegment: number;
  betAmount: number;
}

export type BetRequest =
  | BlackjackBetRequest
  | RouletteBetRequest
  | CrapsBetRequest
  | FaroBetRequest
  | ThreeCardMonteBetRequest
  | WheelOfFortuneBetRequest;

export type GameState =
  | BlackjackState
  | RouletteState
  | CrapsState
  | FaroState
  | ThreeCardMonteState
  | WheelOfFortuneState;

// ===== Gambling Service =====

export const gamblingService = {
  // ===== Public Routes =====

  /**
   * Get all available gambling games
   */
  async getGames(): Promise<GamblingGame[]> {
    const response = await api.get<{ data: { games: GamblingGame[] } }>('/gambling/games');
    return response.data.data?.games || [];
  },

  /**
   * Get details for a specific game
   */
  async getGameDetails(gameId: GameType): Promise<GamblingGame> {
    const response = await api.get<{ data: GamblingGame }>(`/gambling/games/${gameId}`);
    return response.data.data;
  },

  /**
   * Get all gambling locations
   */
  async getLocations(): Promise<GamblingLocation[]> {
    const response = await api.get<{ data: { locations: GamblingLocation[] } }>('/gambling/locations');
    return response.data.data?.locations || [];
  },

  /**
   * Get details for a specific location
   */
  async getLocationDetails(locationId: string): Promise<GamblingLocation> {
    const response = await api.get<{ data: GamblingLocation }>(`/gambling/locations/${locationId}`);
    return response.data.data;
  },

  /**
   * Get available gambling items (lucky charms, etc.)
   */
  async getItems(): Promise<GamblingItem[]> {
    const response = await api.get<{ data: { items: GamblingItem[] } }>('/gambling/items');
    return response.data.data?.items || [];
  },

  /**
   * Get the gambling leaderboard
   */
  async getLeaderboard(gameType?: GameType): Promise<LeaderboardEntry[]> {
    const params = gameType ? { gameType } : {};
    const response = await api.get<{ data: { leaderboard: LeaderboardEntry[] } }>(
      '/gambling/leaderboard',
      { params }
    );
    return response.data.data?.leaderboard || [];
  },

  // ===== Authenticated Routes =====

  /**
   * Get character's gambling statistics
   */
  async getMyStats(): Promise<GamblingStats> {
    const response = await api.get<{ data: GamblingStats }>('/gambling/my-stats');
    return response.data.data;
  },

  /**
   * Get gambling session history
   */
  async getHistory(limit?: number): Promise<SessionHistory[]> {
    const params = limit ? { limit } : {};
    const response = await api.get<{ data: { sessions: SessionHistory[] } }>(
      '/gambling/history',
      { params }
    );
    return response.data.data?.sessions || [];
  },

  /**
   * Get current active session (if any)
   */
  async getCurrentSession(): Promise<GameSession | null> {
    try {
      const response = await api.get<{ data: { session: GameSession | null } }>(
        '/gambling/sessions/current'
      );
      return response.data.data?.session || null;
    } catch {
      return null;
    }
  },

  /**
   * Start a new gambling session
   */
  async startSession(request: StartSessionRequest): Promise<StartSessionResponse> {
    const response = await api.post<{ data: StartSessionResponse }>(
      '/gambling/sessions',
      request
    );
    return response.data.data;
  },

  /**
   * Place a bet in the current session
   */
  async placeBet(sessionId: string, bet: BetRequest): Promise<GameState> {
    const response = await api.post<{ data: GameState }>(
      `/gambling/sessions/${sessionId}/bet`,
      bet
    );
    return response.data.data;
  },

  /**
   * End the current session and cash out
   */
  async endSession(sessionId: string): Promise<{
    session: GameSession;
    message: string;
  }> {
    const response = await api.post<{
      data: { session: GameSession; message: string };
    }>(`/gambling/sessions/${sessionId}/end`);
    return response.data.data;
  },

  // ===== Convenience Methods for Specific Games =====

  /**
   * Play a blackjack action
   */
  async playBlackjack(
    sessionId: string,
    action: 'deal' | 'hit' | 'stand' | 'double' | 'split',
    betAmount?: number
  ): Promise<BlackjackState> {
    return this.placeBet(sessionId, { action, betAmount }) as Promise<BlackjackState>;
  },

  /**
   * Play roulette - spin with selected bets
   */
  async playRoulette(sessionId: string, bets: RouletteBet[]): Promise<RouletteState> {
    return this.placeBet(sessionId, { bets }) as Promise<RouletteState>;
  },

  /**
   * Play craps - place bet or roll
   */
  async playCraps(
    sessionId: string,
    betType: CrapsState['betType'],
    betAmount: number,
    action: 'bet' | 'roll'
  ): Promise<CrapsState> {
    return this.placeBet(sessionId, { betType, betAmount, action }) as Promise<CrapsState>;
  },

  /**
   * Play faro - select card and bet
   */
  async playFaro(
    sessionId: string,
    selectedCard: string,
    betAmount: number
  ): Promise<FaroState> {
    return this.placeBet(sessionId, { selectedCard, betAmount }) as Promise<FaroState>;
  },

  /**
   * Play three card monte - select position and bet
   */
  async playThreeCardMonte(
    sessionId: string,
    selectedPosition: number,
    betAmount: number
  ): Promise<ThreeCardMonteState> {
    return this.placeBet(sessionId, { selectedPosition, betAmount }) as Promise<ThreeCardMonteState>;
  },

  /**
   * Play wheel of fortune - select segment and bet
   */
  async playWheelOfFortune(
    sessionId: string,
    selectedSegment: number,
    betAmount: number
  ): Promise<WheelOfFortuneState> {
    return this.placeBet(sessionId, { selectedSegment, betAmount }) as Promise<WheelOfFortuneState>;
  },
};

export default gamblingService;
