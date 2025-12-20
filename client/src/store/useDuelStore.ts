/**
 * Duel Store
 * Manages real-time PvP duel state with Socket.io integration
 */

import { create } from 'zustand';
import type {
  Card,
  DuelClientState,
  RoundResult,
  DuelRewards,
  BettingAction,
  PerceptionHint,
  ChallengeNotification,
} from '@desperados/shared';

// =============================================================================
// TYPES
// =============================================================================

interface DuelOpponent {
  characterId: string;
  name: string;
  level: number;
  faction?: string;
  wins: number;
  losses: number;
}

interface PendingChallenge extends ChallengeNotification {
  expiresIn: number;
}

interface DuelStoreState {
  // === CONNECTION ===
  isConnected: boolean;
  connectionError: string | null;

  // === LOBBY STATE ===
  availableOpponents: DuelOpponent[];
  pendingChallenges: PendingChallenge[];
  sentChallenges: string[]; // duelIds of challenges we sent

  // === ACTIVE DUEL STATE ===
  activeDuel: DuelClientState | null;
  isInDuel: boolean;

  // === UI STATE ===
  selectedCardIndices: number[];
  isProcessingAction: boolean;
  lastError: string | null;

  // === ANIMATIONS ===
  showDealAnimation: boolean;
  showRevealAnimation: boolean;
  showVictoryAnimation: boolean;
  animationData: {
    winnerName?: string;
    rewards?: DuelRewards;
    roundResult?: RoundResult;
  } | null;

  // === PERCEPTION/INTEL ===
  perceptionHints: PerceptionHint[];
  availableAbilities: string[];
  abilityCooldowns: Record<string, number>;
  abilityEnergy: number;
  maxAbilityEnergy: number;
  pokerFaceActive: boolean;
  pokerFaceRoundsLeft: number;

  // === LOADING STATES ===
  isLoadingOpponents: boolean;
  isLoadingChallenges: boolean;
}

interface DuelStoreActions {
  // === CONNECTION ===
  setConnected: (connected: boolean) => void;
  setConnectionError: (error: string | null) => void;

  // === LOBBY ACTIONS ===
  setAvailableOpponents: (opponents: DuelOpponent[]) => void;
  addPendingChallenge: (challenge: ChallengeNotification) => void;
  removePendingChallenge: (duelId: string) => void;
  addSentChallenge: (duelId: string) => void;
  removeSentChallenge: (duelId: string) => void;
  setLoadingOpponents: (loading: boolean) => void;
  setLoadingChallenges: (loading: boolean) => void;

  // === DUEL STATE ===
  setActiveDuel: (duel: DuelClientState | null) => void;
  updateDuelState: (partialState: Partial<DuelClientState>) => void;
  joinDuel: (duelId: string) => void;
  leaveDuel: () => void;

  // === PLAYER ACTIONS ===
  selectCard: (index: number) => void;
  deselectCard: (index: number) => void;
  clearSelectedCards: () => void;
  setSelectedCards: (indices: number[]) => void;
  setProcessingAction: (processing: boolean) => void;

  // === ROUND UPDATES ===
  updatePlayerHand: (cards: Card[]) => void;
  updateOpponentAction: (actionType: string) => void;
  setRoundResult: (result: RoundResult) => void;
  addRoundResult: (result: RoundResult) => void;

  // === ANIMATIONS ===
  triggerDealAnimation: () => void;
  triggerRevealAnimation: () => void;
  triggerVictoryAnimation: (winnerName: string, rewards: DuelRewards) => void;
  clearAnimations: () => void;

  // === PERCEPTION ===
  setPerceptionHints: (hints: PerceptionHint[]) => void;
  addPerceptionHint: (hint: PerceptionHint) => void;
  clearPerceptionHints: () => void;
  setAvailableAbilities: (abilities: string[]) => void;
  setAbilityCooldown: (ability: string, cooldown: number) => void;
  setAbilityEnergy: (energy: number) => void;
  deductAbilityEnergy: (amount: number) => void;
  setPokerFaceActive: (active: boolean, roundsLeft?: number) => void;
  updateAbilityState: (state: {
    available?: string[];
    cooldowns?: Record<string, number>;
    energy?: number;
    maxEnergy?: number;
    pokerFaceActive?: boolean;
    pokerFaceRoundsLeft?: number;
  }) => void;

  // === ERROR HANDLING ===
  setError: (error: string | null) => void;

  // === RESET ===
  resetDuelState: () => void;
  resetAll: () => void;
}

type DuelStore = DuelStoreState & DuelStoreActions;

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: DuelStoreState = {
  // Connection
  isConnected: false,
  connectionError: null,

  // Lobby
  availableOpponents: [],
  pendingChallenges: [],
  sentChallenges: [],

  // Active Duel
  activeDuel: null,
  isInDuel: false,

  // UI
  selectedCardIndices: [],
  isProcessingAction: false,
  lastError: null,

  // Animations
  showDealAnimation: false,
  showRevealAnimation: false,
  showVictoryAnimation: false,
  animationData: null,

  // Perception
  perceptionHints: [],
  availableAbilities: [],
  abilityCooldowns: {},
  abilityEnergy: 50,
  maxAbilityEnergy: 100,
  pokerFaceActive: false,
  pokerFaceRoundsLeft: 0,

  // Loading
  isLoadingOpponents: false,
  isLoadingChallenges: false,
};

// =============================================================================
// STORE
// =============================================================================

export const useDuelStore = create<DuelStore>((set, get) => ({
  ...initialState,

  // === CONNECTION ===
  setConnected: (connected) => set({ isConnected: connected }),

  setConnectionError: (error) => set({ connectionError: error }),

  // === LOBBY ACTIONS ===
  setAvailableOpponents: (opponents) => set({ availableOpponents: opponents }),

  addPendingChallenge: (challenge) => {
    const expiresIn = Math.max(0, challenge.expiresAt - Date.now());
    const pendingChallenge: PendingChallenge = { ...challenge, expiresIn };

    set((state) => ({
      pendingChallenges: [...state.pendingChallenges, pendingChallenge],
    }));

    // Auto-remove when expired
    setTimeout(() => {
      get().removePendingChallenge(challenge.duelId);
    }, expiresIn);
  },

  removePendingChallenge: (duelId) => {
    set((state) => ({
      pendingChallenges: state.pendingChallenges.filter((c) => c.duelId !== duelId),
    }));
  },

  addSentChallenge: (duelId) => {
    set((state) => ({
      sentChallenges: [...state.sentChallenges, duelId],
    }));
  },

  removeSentChallenge: (duelId) => {
    set((state) => ({
      sentChallenges: state.sentChallenges.filter((id) => id !== duelId),
    }));
  },

  setLoadingOpponents: (loading) => set({ isLoadingOpponents: loading }),

  setLoadingChallenges: (loading) => set({ isLoadingChallenges: loading }),

  // === DUEL STATE ===
  setActiveDuel: (duel) => {
    set({
      activeDuel: duel,
      isInDuel: duel !== null,
      selectedCardIndices: [],
      perceptionHints: [],
    });
  },

  updateDuelState: (partialState) => {
    const { activeDuel } = get();
    if (!activeDuel) return;

    set({
      activeDuel: { ...activeDuel, ...partialState },
    });
  },

  joinDuel: (_duelId) => {
    set({
      isInDuel: true,
      selectedCardIndices: [],
      perceptionHints: [],
      lastError: null,
    });
  },

  leaveDuel: () => {
    set({
      activeDuel: null,
      isInDuel: false,
      selectedCardIndices: [],
      perceptionHints: [],
      showDealAnimation: false,
      showRevealAnimation: false,
      showVictoryAnimation: false,
      animationData: null,
    });
  },

  // === PLAYER ACTIONS ===
  selectCard: (index) => {
    set((state) => {
      if (state.selectedCardIndices.includes(index)) {
        return state; // Already selected
      }
      return {
        selectedCardIndices: [...state.selectedCardIndices, index],
      };
    });
  },

  deselectCard: (index) => {
    set((state) => ({
      selectedCardIndices: state.selectedCardIndices.filter((i) => i !== index),
    }));
  },

  clearSelectedCards: () => set({ selectedCardIndices: [] }),

  setSelectedCards: (indices) => set({ selectedCardIndices: indices }),

  setProcessingAction: (processing) => set({ isProcessingAction: processing }),

  // === ROUND UPDATES ===
  updatePlayerHand: (cards) => {
    const { activeDuel } = get();
    if (!activeDuel) return;

    set({
      activeDuel: {
        ...activeDuel,
        player: {
          ...activeDuel.player,
          hand: cards,
        },
      },
      selectedCardIndices: [],
    });
  },

  updateOpponentAction: (actionType) => {
    const { activeDuel } = get();
    if (!activeDuel) return;

    set({
      activeDuel: {
        ...activeDuel,
        opponent: {
          ...activeDuel.opponent,
          hasSubmittedAction: true,
          lastAction: actionType as BettingAction,
        },
      },
    });
  },

  setRoundResult: (result) => {
    set({
      animationData: { roundResult: result },
    });
  },

  addRoundResult: (result) => {
    const { activeDuel } = get();
    if (!activeDuel) return;

    set({
      activeDuel: {
        ...activeDuel,
        roundResults: [...activeDuel.roundResults, result],
      },
    });
  },

  // === ANIMATIONS ===
  triggerDealAnimation: () => {
    set({ showDealAnimation: true });

    // Auto-clear after animation
    setTimeout(() => {
      set({ showDealAnimation: false });
    }, 2000);
  },

  triggerRevealAnimation: () => {
    set({ showRevealAnimation: true });

    // Auto-clear after animation
    setTimeout(() => {
      set({ showRevealAnimation: false });
    }, 3500);
  },

  triggerVictoryAnimation: (winnerName, rewards) => {
    set({
      showVictoryAnimation: true,
      animationData: { winnerName, rewards },
    });
  },

  clearAnimations: () => {
    set({
      showDealAnimation: false,
      showRevealAnimation: false,
      showVictoryAnimation: false,
      animationData: null,
    });
  },

  // === PERCEPTION ===
  setPerceptionHints: (hints) => set({ perceptionHints: hints }),

  addPerceptionHint: (hint) => {
    set((state) => ({
      perceptionHints: [...state.perceptionHints, hint],
    }));
  },

  clearPerceptionHints: () => set({ perceptionHints: [] }),

  setAvailableAbilities: (abilities) => set({ availableAbilities: abilities }),

  setAbilityCooldown: (ability, cooldown) => {
    set((state) => ({
      abilityCooldowns: {
        ...state.abilityCooldowns,
        [ability]: cooldown,
      },
    }));

    // Auto-clear cooldown
    if (cooldown > 0) {
      setTimeout(() => {
        set((state) => {
          const { [ability]: _, ...rest } = state.abilityCooldowns;
          return { abilityCooldowns: rest };
        });
      }, cooldown * 1000);
    }
  },

  setAbilityEnergy: (energy) => {
    set((state) => ({
      abilityEnergy: Math.max(0, Math.min(energy, state.maxAbilityEnergy)),
    }));
  },

  deductAbilityEnergy: (amount) => {
    set((state) => ({
      abilityEnergy: Math.max(0, state.abilityEnergy - amount),
    }));
  },

  setPokerFaceActive: (active, roundsLeft = 0) => {
    set({
      pokerFaceActive: active,
      pokerFaceRoundsLeft: roundsLeft,
    });
  },

  updateAbilityState: (abilityState) => {
    set((state) => ({
      availableAbilities: abilityState.available ?? state.availableAbilities,
      abilityCooldowns: abilityState.cooldowns ?? state.abilityCooldowns,
      abilityEnergy: abilityState.energy ?? state.abilityEnergy,
      maxAbilityEnergy: abilityState.maxEnergy ?? state.maxAbilityEnergy,
      pokerFaceActive: abilityState.pokerFaceActive ?? state.pokerFaceActive,
      pokerFaceRoundsLeft: abilityState.pokerFaceRoundsLeft ?? state.pokerFaceRoundsLeft,
    }));
  },

  // === ERROR HANDLING ===
  setError: (error) => set({ lastError: error }),

  // === RESET ===
  resetDuelState: () => {
    set({
      activeDuel: null,
      isInDuel: false,
      selectedCardIndices: [],
      isProcessingAction: false,
      showDealAnimation: false,
      showRevealAnimation: false,
      showVictoryAnimation: false,
      animationData: null,
      perceptionHints: [],
      lastError: null,
    });
  },

  resetAll: () => set(initialState),
}));

// =============================================================================
// SELECTORS
// =============================================================================

export const selectIsMyTurn = (state: DuelStore) =>
  state.activeDuel?.isMyTurn ?? false;

export const selectCurrentPhase = (state: DuelStore) =>
  state.activeDuel?.round.phase;

export const selectPlayerHand = (state: DuelStore) =>
  state.activeDuel?.player.hand ?? [];

export const selectOpponentInfo = (state: DuelStore) =>
  state.activeDuel?.opponent;

export const selectRoundNumber = (state: DuelStore) =>
  state.activeDuel?.round.roundNumber ?? 0;

export const selectPot = (state: DuelStore) =>
  state.activeDuel?.round.pot ?? 0;

export const selectPlayerRoundsWon = (state: DuelStore) =>
  state.activeDuel?.player.roundsWon ?? 0;

export const selectOpponentRoundsWon = (state: DuelStore) =>
  state.activeDuel?.opponent.roundsWon ?? 0;

export const selectTimeRemaining = (state: DuelStore) => {
  const round = state.activeDuel?.round;
  if (!round) return 0;

  const elapsed = (Date.now() - round.turnStartedAt) / 1000;
  return Math.max(0, round.turnTimeLimit - elapsed);
};

export const selectAvailableActions = (state: DuelStore) =>
  state.activeDuel?.availableActions ?? [];

export const selectCanSubmitAction = (state: DuelStore) =>
  state.activeDuel?.isMyTurn &&
  !state.isProcessingAction &&
  state.activeDuel?.availableActions.length > 0;

export default useDuelStore;
