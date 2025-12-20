/**
 * Deck Game Service
 * API client for deck mini-game session operations
 */

import api from './api';
import type { Card, HandRank, Suit } from '@shared/types/destinyDeck.types';

// ===== Types =====

export type DeckGameType = 'draw_poker' | 'high_card' | 'suit_match' | 'quick_draw' | 'memory_match';

export type DeckGameDifficulty = 'easy' | 'medium' | 'hard';

export interface DeckGameSession {
  _id: string;
  gameType: DeckGameType;
  status: 'active' | 'completed' | 'forfeited';
  difficulty: DeckGameDifficulty;
  relevantSuit?: Suit;
  timeLimit?: number;
  startedAt: string;
  completedAt?: string;
  characterId: string;
}

export interface DeckGameState {
  sessionId: string;
  gameType: DeckGameType;
  status: 'active' | 'completed' | 'forfeited';
  playerHand: Card[];
  opponentHand?: Card[];
  deck?: number;
  discardPile?: number;
  currentPhase: 'setup' | 'player_turn' | 'opponent_turn' | 'evaluation' | 'completed';
  canDraw: boolean;
  canHold: boolean;
  canSubmit: boolean;
  heldIndices: number[];
  timeRemaining?: number;
  result?: DeckGameResult;
}

export interface DeckGameResult {
  outcome: 'win' | 'lose' | 'draw';
  playerHand: Card[];
  playerHandRank: HandRank;
  playerHandName: string;
  opponentHand?: Card[];
  opponentHandRank?: HandRank;
  opponentHandName?: string;
  score: number;
  rewards: DeckGameRewards;
  message: string;
}

export interface DeckGameRewards {
  experience: number;
  gold?: number;
  items?: Array<{
    itemId: string;
    name: string;
    quantity: number;
  }>;
  bonus?: {
    type: string;
    amount: number;
  };
}

export interface DeckGameAction {
  type: 'hold' | 'draw' | 'submit' | 'discard';
  cardIndices?: number[];
}

// ===== Request/Response Types =====

export interface StartGameRequest {
  gameType: DeckGameType;
  difficulty?: DeckGameDifficulty;
  relevantSuit?: Suit;
  timeLimit?: number;
}

export interface StartGameResponse {
  session: DeckGameSession;
  state: DeckGameState;
  message: string;
}

export interface GameActionRequest {
  gameId: string;
  action: DeckGameAction;
}

export interface GameActionResponse {
  state: DeckGameState;
  message?: string;
}

export interface GetGameStateResponse {
  state: DeckGameState;
}

export interface ForfeitGameResponse {
  message: string;
  penalty?: {
    experience?: number;
    gold?: number;
  };
}

// ===== Deck Game Service =====

export const deckGameService = {
  /**
   * Start a new deck game
   * POST /api/deck/start
   */
  async startGame(request: StartGameRequest): Promise<StartGameResponse> {
    const response = await api.post<{ data: StartGameResponse }>('/deck/start', request);
    return response.data.data;
  },

  /**
   * Process a player action
   * POST /api/deck/action
   */
  async gameAction(gameId: string, action: DeckGameAction): Promise<GameActionResponse> {
    const response = await api.post<{ data: GameActionResponse }>('/deck/action', { gameId, action });
    return response.data.data;
  },

  /**
   * Get current game state
   * GET /api/deck/:gameId
   */
  async getGameState(gameId: string): Promise<DeckGameState> {
    const response = await api.get<{ data: GetGameStateResponse }>(`/deck/${gameId}`);
    return response.data.data.state;
  },

  /**
   * Abandon a game
   * POST /api/deck/:gameId/forfeit
   */
  async forfeitGame(gameId: string): Promise<ForfeitGameResponse> {
    const response = await api.post<{ data: ForfeitGameResponse }>(`/deck/${gameId}/forfeit`);
    return response.data.data;
  },

  // ===== Convenience Methods =====

  /**
   * Start a draw poker game
   */
  async startDrawPoker(difficulty: DeckGameDifficulty = 'medium'): Promise<StartGameResponse> {
    return this.startGame({ gameType: 'draw_poker', difficulty });
  },

  /**
   * Start a high card game
   */
  async startHighCard(difficulty: DeckGameDifficulty = 'easy'): Promise<StartGameResponse> {
    return this.startGame({ gameType: 'high_card', difficulty });
  },

  /**
   * Start a suit match game
   */
  async startSuitMatch(relevantSuit: Suit, difficulty: DeckGameDifficulty = 'medium'): Promise<StartGameResponse> {
    return this.startGame({ gameType: 'suit_match', difficulty, relevantSuit });
  },

  /**
   * Start a quick draw game with time limit
   */
  async startQuickDraw(timeLimit: number = 30, difficulty: DeckGameDifficulty = 'hard'): Promise<StartGameResponse> {
    return this.startGame({ gameType: 'quick_draw', difficulty, timeLimit });
  },

  /**
   * Start a memory match game
   */
  async startMemoryMatch(difficulty: DeckGameDifficulty = 'medium'): Promise<StartGameResponse> {
    return this.startGame({ gameType: 'memory_match', difficulty });
  },

  /**
   * Hold specific cards
   */
  async holdCards(gameId: string, cardIndices: number[]): Promise<GameActionResponse> {
    return this.gameAction(gameId, { type: 'hold', cardIndices });
  },

  /**
   * Draw new cards (replacing unheld cards)
   */
  async drawCards(gameId: string): Promise<GameActionResponse> {
    return this.gameAction(gameId, { type: 'draw' });
  },

  /**
   * Submit current hand for evaluation
   */
  async submitHand(gameId: string): Promise<GameActionResponse> {
    return this.gameAction(gameId, { type: 'submit' });
  },

  /**
   * Discard specific cards
   */
  async discardCards(gameId: string, cardIndices: number[]): Promise<GameActionResponse> {
    return this.gameAction(gameId, { type: 'discard', cardIndices });
  },

  /**
   * Get game type display name
   */
  getGameTypeDisplay(gameType: DeckGameType): string {
    const gameTypeMap: Record<DeckGameType, string> = {
      draw_poker: 'Draw Poker',
      high_card: 'High Card',
      suit_match: 'Suit Match',
      quick_draw: 'Quick Draw',
      memory_match: 'Memory Match',
    };
    return gameTypeMap[gameType] || gameType;
  },

  /**
   * Get difficulty display name
   */
  getDifficultyDisplay(difficulty: DeckGameDifficulty): string {
    const difficultyMap: Record<DeckGameDifficulty, string> = {
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
    };
    return difficultyMap[difficulty] || difficulty;
  },

  /**
   * Get difficulty color
   */
  getDifficultyColor(difficulty: DeckGameDifficulty): 'green' | 'yellow' | 'red' {
    const colorMap: Record<DeckGameDifficulty, 'green' | 'yellow' | 'red'> = {
      easy: 'green',
      medium: 'yellow',
      hard: 'red',
    };
    return colorMap[difficulty] || 'yellow';
  },

  /**
   * Format time remaining
   */
  formatTimeRemaining(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  },

  /**
   * Check if game is in progress
   */
  isGameActive(state: DeckGameState): boolean {
    return state.status === 'active' && state.currentPhase !== 'completed';
  },

  /**
   * Check if player can perform actions
   */
  canPerformAction(state: DeckGameState): boolean {
    return state.status === 'active' && state.currentPhase === 'player_turn';
  },

  /**
   * Get available actions
   */
  getAvailableActions(state: DeckGameState): string[] {
    const actions: string[] = [];
    if (state.canHold) actions.push('hold');
    if (state.canDraw) actions.push('draw');
    if (state.canSubmit) actions.push('submit');
    return actions;
  },

  /**
   * Calculate total rewards value
   */
  calculateRewardsValue(rewards: DeckGameRewards): number {
    let total = rewards.gold || 0;
    if (rewards.bonus) {
      total += rewards.bonus.amount;
    }
    return total;
  },

  /**
   * Format result outcome
   */
  formatOutcome(outcome: 'win' | 'lose' | 'draw'): string {
    const outcomeMap = {
      win: 'Victory!',
      lose: 'Defeat',
      draw: 'Draw',
    };
    return outcomeMap[outcome] || outcome;
  },
};

export default deckGameService;
