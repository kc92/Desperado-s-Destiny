/**
 * useTeamCardGame Hook
 *
 * React hook for managing team card game state with Socket.io integration.
 * Handles real-time game events and provides actions for gameplay.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { socketService } from '@/services/socket.service';
import {
  teamCardGameService,
  type LobbySession,
  type TeamCardGameType,
  type RaidBoss,
} from '@/services/teamCardGame.service';

// =============================================================================
// LOCAL TYPES (to avoid shared package runtime issues)
// =============================================================================

export type TeamCardGamePhase = 'waiting' | 'dealing' | 'bidding' | 'calling_trump' | 'melding' | 'playing' | 'scoring' | 'boss_phase' | 'complete';
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export type NPCDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface TrickCard {
  suit: Suit;
  rank: Rank;
  value: number;
}

export interface PlayedCard {
  card: TrickCard;
  playerIndex: number;
  timestamp: number;
}

export interface TeamCardPlayer {
  seatIndex: 0 | 1 | 2 | 3;
  teamIndex: 0 | 1;
  characterId?: string;
  name: string;
  hand: TrickCard[];
  bid?: number;
  tricksWon: number;
  isNPC: boolean;
  isConnected: boolean;
  isReady: boolean;
}

export interface TrickResult {
  trickNumber: number;
  cards: PlayedCard[];
  winnerIndex: number;
  winnerName: string;
  pointValue: number;
}

export interface GameHint {
  type: 'optimal' | 'warning' | 'info';
  message: string;
  cardIndex?: number;
}

export interface BossMechanic {
  id: string;
  name: string;
  description: string;
  effect: string;
  canCounter: boolean;
  counterSkill?: string;
  counterThreshold?: number;
}

export interface TeamCardGameClientState {
  sessionId: string;
  gameType: TeamCardGameType;
  raidMode: boolean;
  phase: TeamCardGamePhase;
  currentRound: number;
  me: TeamCardPlayer | null;
  players: TeamCardPlayer[];
  isMyTurn: boolean;
  playableCardIndices: number[];
  currentTrick: PlayedCard[];
  trickNumber: number;
  tricksWon: [number, number];
  teamScores: [number, number];
  trump?: Suit;
  bossHealth?: number;
  bossMaxHealth?: number;
  bossPhase?: number;
  turnTimeRemaining: number;
  hints: GameHint[];
}

// =============================================================================
// STATE TYPES
// =============================================================================

export interface TeamCardGameState {
  // Connection state
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;

  // Lobby state
  lobbies: LobbySession[];
  isInLobby: boolean;

  // Session state
  sessionId: string | null;
  gameType: TeamCardGameType | null;
  raidMode: boolean;
  raidBoss: RaidBoss | null;

  // Game phase
  phase: TeamCardGamePhase | null;
  currentRound: number;

  // Players
  me: TeamCardPlayer | null;
  players: TeamCardPlayer[];
  isMyTurn: boolean;
  currentPlayerIndex: number;

  // Cards
  myHand: TrickCard[];
  playableCardIndices: number[];
  currentTrick: PlayedCard[];
  trickNumber: number;
  trickHistory: TrickResult[];

  // Game state
  trump: Suit | null;
  tricksWon: [number, number];
  teamScores: [number, number];

  // Boss state
  bossHealth: number | null;
  bossMaxHealth: number | null;
  bossPhase: number | null;
  activeMechanics: BossMechanic[];

  // UI state
  turnTimeRemaining: number;
  hints: GameHint[];
  announcements: string[];
}

const initialState: TeamCardGameState = {
  isConnected: false,
  isLoading: false,
  error: null,
  lobbies: [],
  isInLobby: false,
  sessionId: null,
  gameType: null,
  raidMode: false,
  raidBoss: null,
  phase: null,
  currentRound: 0,
  me: null,
  players: [],
  isMyTurn: false,
  currentPlayerIndex: 0,
  myHand: [],
  playableCardIndices: [],
  currentTrick: [],
  trickNumber: 0,
  trickHistory: [],
  trump: null,
  tricksWon: [0, 0],
  teamScores: [0, 0],
  bossHealth: null,
  bossMaxHealth: null,
  bossPhase: null,
  activeMechanics: [],
  turnTimeRemaining: 30,
  hints: [],
  announcements: [],
};

// =============================================================================
// HOOK
// =============================================================================

export function useTeamCardGame() {
  const [state, setState] = useState<TeamCardGameState>(initialState);
  const turnTimerRef = useRef<number | null>(null);

  // ==========================================================================
  // SOCKET CONNECTION
  // ==========================================================================

  useEffect(() => {
    const updateConnectionStatus = () => {
      setState((prev) => ({
        ...prev,
        isConnected: socketService.isConnected(),
      }));
    };

    // Subscribe to connection status changes
    const unsubscribe = socketService.onStatusChange((status) => {
      setState((prev) => ({
        ...prev,
        isConnected: status === 'connected',
      }));
    });

    updateConnectionStatus();

    return () => {
      unsubscribe();
      if (turnTimerRef.current) {
        clearInterval(turnTimerRef.current);
      }
    };
  }, []);

  // ==========================================================================
  // SOCKET EVENT HANDLERS
  // ==========================================================================

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    // Session created
    const handleSessionCreated = (data: { sessionId: string; gameType: TeamCardGameType }) => {
      setState((prev) => ({
        ...prev,
        sessionId: data.sessionId,
        gameType: data.gameType,
        isInLobby: true,
        isLoading: false,
      }));
    };

    // Session update (main state sync)
    const handleSessionUpdate = (clientState: TeamCardGameClientState) => {
      setState((prev) => ({
        ...prev,
        sessionId: clientState.sessionId,
        gameType: clientState.gameType,
        raidMode: clientState.raidMode,
        phase: clientState.phase,
        currentRound: clientState.currentRound,
        me: clientState.me,
        isMyTurn: clientState.isMyTurn,
        myHand: clientState.me?.hand || [],
        playableCardIndices: clientState.playableCardIndices,
        currentTrick: clientState.currentTrick,
        trickNumber: clientState.trickNumber,
        tricksWon: clientState.tricksWon,
        teamScores: clientState.teamScores,
        trump: clientState.trump ?? null,
        bossHealth: clientState.bossHealth ?? null,
        bossMaxHealth: clientState.bossMaxHealth ?? null,
        bossPhase: clientState.bossPhase ?? null,
        turnTimeRemaining: clientState.turnTimeRemaining,
        hints: clientState.hints,
        isLoading: false,
      }));
    };

    // Player joined
    const handlePlayerJoined = (data: { playerName: string; seatIndex: number; teamIndex: 0 | 1; isNPC: boolean }) => {
      setState((prev) => ({
        ...prev,
        announcements: [...prev.announcements, `${data.playerName} joined ${data.isNPC ? '(NPC)' : ''}`],
      }));
    };

    // Player left
    const handlePlayerLeft = (data: { playerName: string; seatIndex: number; replacedByNPC: boolean }) => {
      setState((prev) => ({
        ...prev,
        announcements: [
          ...prev.announcements,
          `${data.playerName} left${data.replacedByNPC ? ' (replaced by NPC)' : ''}`,
        ],
      }));
    };

    // Game started
    const handleGameStart = (clientState: TeamCardGameClientState) => {
      handleSessionUpdate(clientState);
      setState((prev) => ({
        ...prev,
        announcements: [...prev.announcements, 'Game started!'],
        isInLobby: false,
      }));
    };

    // Cards dealt
    const handleCardsDealt = (data: { hand: TrickCard[]; dealer: number; dealerName: string }) => {
      setState((prev) => ({
        ...prev,
        myHand: data.hand,
        announcements: [...prev.announcements, `${data.dealerName} dealt the cards`],
      }));
    };

    // Card played
    const handleCardPlayed = (data: { playerIndex: number; playerName: string; card: TrickCard }) => {
      setState((prev) => ({
        ...prev,
        currentTrick: [
          ...prev.currentTrick,
          { card: data.card, playerIndex: data.playerIndex, timestamp: Date.now() },
        ],
        announcements: [...prev.announcements.slice(-4), `${data.playerName} played ${data.card.rank} of ${data.card.suit}`],
      }));
    };

    // Trick complete
    const handleTrickComplete = (data: { trickResult: TrickResult; teamTricks: [number, number]; nextLeaderName: string }) => {
      setState((prev) => ({
        ...prev,
        currentTrick: [],
        trickHistory: [...prev.trickHistory, data.trickResult],
        tricksWon: data.teamTricks,
        announcements: [...prev.announcements.slice(-4), `${data.nextLeaderName} won the trick!`],
      }));
    };

    // Round complete
    const handleRoundComplete = (data: { teamScores: [number, number]; outcome: string; bossDamageDealt?: number }) => {
      setState((prev) => ({
        ...prev,
        teamScores: data.teamScores,
        currentTrick: [],
        trickHistory: [],
        announcements: [
          ...prev.announcements.slice(-4),
          `Round complete! Score: ${data.teamScores[0]} - ${data.teamScores[1]}`,
          data.bossDamageDealt ? `Boss took ${data.bossDamageDealt} damage!` : '',
        ].filter(Boolean),
      }));
    };

    // Boss mechanic activated
    const handleBossMechanic = (data: { mechanic: BossMechanic; announcement: string }) => {
      setState((prev) => ({
        ...prev,
        activeMechanics: [...prev.activeMechanics, data.mechanic],
        announcements: [...prev.announcements.slice(-4), data.announcement],
      }));
    };

    // Game complete
    const handleGameComplete = (data: { winningTeam: 0 | 1; finalScores: [number, number]; raidVictory?: boolean }) => {
      const message = data.raidVictory
        ? 'Victory! The boss has been defeated!'
        : `Game over! Team ${data.winningTeam + 1} wins ${data.finalScores[0]} - ${data.finalScores[1]}`;
      setState((prev) => ({
        ...prev,
        phase: 'complete' as TeamCardGamePhase,
        teamScores: data.finalScores,
        announcements: [...prev.announcements.slice(-4), message],
      }));
    };

    // Turn start with timer
    const handleTurnStart = (data: { playerIndex: number; playerName: string; timeLimit: number; isNPC: boolean }) => {
      setState((prev) => ({
        ...prev,
        currentPlayerIndex: data.playerIndex,
        turnTimeRemaining: data.timeLimit,
        announcements: data.isNPC
          ? prev.announcements
          : [...prev.announcements.slice(-4), `${data.playerName}'s turn`],
      }));

      // Start countdown timer
      if (turnTimerRef.current) clearInterval(turnTimerRef.current);
      turnTimerRef.current = window.setInterval(() => {
        setState((prev) => ({
          ...prev,
          turnTimeRemaining: Math.max(0, prev.turnTimeRemaining - 1),
        }));
      }, 1000);
    };

    // Error
    const handleError = (data: { code: string; message: string }) => {
      setState((prev) => ({
        ...prev,
        error: data.message,
        isLoading: false,
      }));
    };

    // Register handlers
    socket.on('teamCard:session_created' as any, handleSessionCreated);
    socket.on('teamCard:session_update' as any, handleSessionUpdate);
    socket.on('teamCard:player_joined' as any, handlePlayerJoined);
    socket.on('teamCard:player_left' as any, handlePlayerLeft);
    socket.on('teamCard:game_start' as any, handleGameStart);
    socket.on('teamCard:cards_dealt' as any, handleCardsDealt);
    socket.on('teamCard:card_played' as any, handleCardPlayed);
    socket.on('teamCard:trick_complete' as any, handleTrickComplete);
    socket.on('teamCard:round_complete' as any, handleRoundComplete);
    socket.on('teamCard:boss_mechanic' as any, handleBossMechanic);
    socket.on('teamCard:game_complete' as any, handleGameComplete);
    socket.on('teamCard:turn_start' as any, handleTurnStart);
    socket.on('teamCard:error' as any, handleError);

    return () => {
      socket.off('teamCard:session_created' as any, handleSessionCreated);
      socket.off('teamCard:session_update' as any, handleSessionUpdate);
      socket.off('teamCard:player_joined' as any, handlePlayerJoined);
      socket.off('teamCard:player_left' as any, handlePlayerLeft);
      socket.off('teamCard:game_start' as any, handleGameStart);
      socket.off('teamCard:cards_dealt' as any, handleCardsDealt);
      socket.off('teamCard:card_played' as any, handleCardPlayed);
      socket.off('teamCard:trick_complete' as any, handleTrickComplete);
      socket.off('teamCard:round_complete' as any, handleRoundComplete);
      socket.off('teamCard:boss_mechanic' as any, handleBossMechanic);
      socket.off('teamCard:game_complete' as any, handleGameComplete);
      socket.off('teamCard:turn_start' as any, handleTurnStart);
      socket.off('teamCard:error' as any, handleError);
    };
  }, []);

  // ==========================================================================
  // ACTIONS
  // ==========================================================================

  /**
   * Fetch available lobbies
   */
  const fetchLobbies = useCallback(async (gameType?: TeamCardGameType) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const lobbies = await teamCardGameService.getLobbies({ gameType });
      setState((prev) => ({ ...prev, lobbies, isLoading: false }));
    } catch (err: any) {
      setState((prev) => ({ ...prev, error: err.message, isLoading: false }));
    }
  }, []);

  /**
   * Create a new game session
   */
  const createSession = useCallback(
    (gameType: TeamCardGameType, raidBossId?: string, isPrivate?: boolean) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      socketService.emit('teamCard:create_session' as any, {
        gameType,
        raidBossId,
        isPrivate,
      });
    },
    []
  );

  /**
   * Join an existing session
   */
  const joinSession = useCallback((sessionId: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    socketService.emit('teamCard:join_session' as any, { sessionId });
  }, []);

  /**
   * Leave the current session
   */
  const leaveSession = useCallback(() => {
    if (state.sessionId) {
      socketService.emit('teamCard:leave_session' as any, { sessionId: state.sessionId });
      setState(initialState);
    }
  }, [state.sessionId]);

  /**
   * Mark ready to start
   */
  const setReady = useCallback(() => {
    if (state.sessionId) {
      socketService.emit('teamCard:ready' as any, { sessionId: state.sessionId });
    }
  }, [state.sessionId]);

  /**
   * Play a card from hand
   */
  const playCard = useCallback(
    (cardIndex: number) => {
      if (state.sessionId && state.isMyTurn) {
        socketService.emit('teamCard:play_card' as any, {
          sessionId: state.sessionId,
          cardIndex,
        });
      }
    },
    [state.sessionId, state.isMyTurn]
  );

  /**
   * Make a bid (Spades/Bridge)
   */
  const makeBid = useCallback(
    (bid: number, options?: { isNil?: boolean; isBlindNil?: boolean; suit?: Suit }) => {
      if (state.sessionId) {
        socketService.emit('teamCard:bid' as any, {
          sessionId: state.sessionId,
          bid,
          ...options,
        });
      }
    },
    [state.sessionId]
  );

  /**
   * Call trump (Euchre)
   */
  const callTrump = useCallback(
    (action: 'pass' | 'order_up' | 'pick_up' | 'call', suit?: Suit, goingAlone?: boolean) => {
      if (state.sessionId) {
        socketService.emit('teamCard:call_trump' as any, {
          sessionId: state.sessionId,
          action,
          suit,
          goingAlone,
        });
      }
    },
    [state.sessionId]
  );

  /**
   * Request an NPC partner
   */
  const requestNPC = useCallback(
    (seatIndex: 0 | 1 | 2 | 3, difficulty: NPCDifficulty) => {
      if (state.sessionId) {
        socketService.emit('teamCard:request_npc' as any, {
          sessionId: state.sessionId,
          seatIndex,
          difficulty,
        });
      }
    },
    [state.sessionId]
  );

  /**
   * Attempt to counter a boss mechanic
   */
  const counterMechanic = useCallback(
    (mechanicId: string) => {
      if (state.sessionId) {
        socketService.emit('teamCard:counter_mechanic' as any, {
          sessionId: state.sessionId,
          mechanicId,
        });
      }
    },
    [state.sessionId]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    // State
    ...state,

    // Actions
    fetchLobbies,
    createSession,
    joinSession,
    leaveSession,
    setReady,
    playCard,
    makeBid,
    callTrump,
    requestNPC,
    counterMechanic,
    clearError,
  };
}

export default useTeamCardGame;
