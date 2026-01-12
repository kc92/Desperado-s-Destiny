/**
 * Gambling Store
 * Shared state management for gambling games
 */

import { create } from 'zustand';
import gamblingService, {
  type GameType,
  type GamblingLocation,
  type GameSession,
  type BlackjackState,
  type RouletteState,
  type CrapsState,
  type FaroState,
  type ThreeCardMonteState,
  type WheelOfFortuneState,
  type SessionHistory,
  type LeaderboardEntry,
} from '@/services/gambling.service';
import { logger } from '@/services/logger.service';

// Discriminated union for type-safe game state
export type ActiveGameState =
  | { type: null }
  | { type: 'blackjack'; state: BlackjackState }
  | { type: 'roulette'; state: RouletteState }
  | { type: 'craps'; state: CrapsState }
  | { type: 'faro'; state: FaroState }
  | { type: 'three_card_monte'; state: ThreeCardMonteState }
  | { type: 'wheel_of_fortune'; state: WheelOfFortuneState };

interface GamblingStore {
  // Session state
  activeSession: GameSession | null;
  selectedLocation: GamblingLocation | null;
  locations: GamblingLocation[];

  // Game state
  activeGame: ActiveGameState;
  betAmount: number;
  isPlaying: boolean;

  // UI state
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  // History & Leaderboard
  sessionHistory: SessionHistory[];
  leaderboard: LeaderboardEntry[];

  // Actions
  loadLocations: () => Promise<void>;
  loadHistory: () => Promise<void>;
  loadLeaderboard: () => Promise<void>;

  startSession: (location: GamblingLocation, game: GameType) => Promise<void>;
  endSession: () => Promise<void>;

  setBetAmount: (amount: number) => void;
  setActiveGame: (game: ActiveGameState) => void;
  setIsPlaying: (playing: boolean) => void;
  setSelectedLocation: (location: GamblingLocation | null) => void;

  updateLocalSession: (payout: number, wagered: number, isComplete?: boolean) => void;

  clearError: () => void;
  reset: () => void;
}

export const useGamblingStore = create<GamblingStore>((set, get) => ({
  // Initial state
  activeSession: null,
  selectedLocation: null,
  locations: [],
  activeGame: { type: null },
  betAmount: 100,
  isPlaying: false,
  isLoading: false,
  isSubmitting: false,
  error: null,
  sessionHistory: [],
  leaderboard: [],

  loadLocations: async () => {
    set({ isLoading: true, error: null });
    try {
      const locations = await gamblingService.getLocations();
      set({ locations, isLoading: false });
    } catch (err) {
      logger.error('Failed to load gambling locations', err as Error, { context: 'useGamblingStore' });
      set({ locations: [], isLoading: false, error: 'Failed to load locations' });
    }
  },

  loadHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const sessionHistory = await gamblingService.getHistory();
      set({ sessionHistory, isLoading: false });
    } catch (err) {
      logger.error('Failed to load gambling history', err as Error, { context: 'useGamblingStore' });
      set({ sessionHistory: [], isLoading: false });
    }
  },

  loadLeaderboard: async () => {
    set({ isLoading: true, error: null });
    try {
      const leaderboard = await gamblingService.getLeaderboard();
      set({ leaderboard, isLoading: false });
    } catch (err) {
      logger.error('Failed to load leaderboard', err as Error, { context: 'useGamblingStore' });
      set({ leaderboard: [], isLoading: false });
    }
  },

  startSession: async (location, game) => {
    set({ isSubmitting: true, error: null });
    try {
      const result = await gamblingService.startSession({
        locationId: location._id,
        gameType: game,
      });

      const session = result.session || {
        _id: 'local-session',
        gameType: game,
        locationId: location._id,
        status: 'active' as const,
        currentBet: 0,
        totalWagered: 0,
        totalWon: 0,
        netResult: 0,
        handsPlayed: 0,
        startedAt: new Date().toISOString(),
      };

      set({
        activeSession: session,
        selectedLocation: location,
        isSubmitting: false,
      });
    } catch (err: any) {
      set({ isSubmitting: false, error: err.message || 'Failed to start session' });
      throw err;
    }
  },

  endSession: async () => {
    const { activeSession } = get();
    if (!activeSession) return;

    set({ isSubmitting: true });
    try {
      await gamblingService.endSession(activeSession._id);
      set({
        activeSession: null,
        activeGame: { type: null },
        selectedLocation: null,
        isSubmitting: false,
      });
    } catch (err: any) {
      // Still clear local state even if API fails
      set({
        activeSession: null,
        activeGame: { type: null },
        selectedLocation: null,
        isSubmitting: false,
      });
    }
  },

  setBetAmount: (amount) => set({ betAmount: amount }),

  setActiveGame: (game) => set({ activeGame: game }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  setSelectedLocation: (location) => set({ selectedLocation: location }),

  updateLocalSession: (payout, wagered, isComplete = true) => {
    set((state) => {
      if (!state.activeSession) return state;
      return {
        activeSession: {
          ...state.activeSession,
          totalWagered: state.activeSession.totalWagered + wagered,
          totalWon: state.activeSession.totalWon + payout,
          netResult: state.activeSession.netResult + (payout - wagered),
          handsPlayed: isComplete
            ? state.activeSession.handsPlayed + 1
            : state.activeSession.handsPlayed,
        },
      };
    });
  },

  clearError: () => set({ error: null }),

  reset: () => set({
    activeSession: null,
    selectedLocation: null,
    activeGame: { type: null },
    betAmount: 100,
    isPlaying: false,
    error: null,
  }),
}));

export default useGamblingStore;
