/**
 * PvP Duel Socket Event Handlers
 *
 * Handle real-time Socket.io events for PvP duels
 * Manages duel rooms, player actions, and state synchronization
 *
 * REFACTORED: Uses Redis-backed state management via DuelStateManager
 * for horizontal scaling and crash recovery.
 */

import { Socket } from 'socket.io';
import { AuthenticatedSocket, requireSocketAuth, verifyCharacterOwnership } from '../middleware/socketAuth';
import { DuelService } from '../services/duel.service';
import { DuelStateManager, ActiveDuelState } from '../services/duelStateManager.service';
import { DuelTimerManager } from '../services/duelTimerManager.service';
import { DisconnectTimerManager } from '../services/disconnectTimerManager.service';
import { emitToRoom, getSocketIO } from '../config/socket';
import { Character } from '../models/Character.model';
import { Duel, DuelStatus, DuelType } from '../models/Duel.model';
import {
  DuelPhase,
  DuelClientState,
  BettingAction,
  RoundResult,
  DuelPlayerState,
  OpponentVisibleState,
  DuelRoundState,
  PerceptionHint,
  PerceptionHintType,
  AbilityState,
  DuelAbility,
  evaluateHand,
  compareHands,
  HandEvaluation
} from '@desperados/shared';
import { perceptionService } from '../services/perception.service';
import logger from '../utils/logger';

// =============================================================================
// TYPES
// =============================================================================

interface JoinDuelRoomPayload {
  duelId: string;
}

interface ReadyPayload {
  duelId: string;
}

interface HoldCardsPayload {
  duelId: string;
  cardIndices: number[];
}

interface DrawPayload {
  duelId: string;
}

interface BetPayload {
  duelId: string;
  action: BettingAction;
  amount?: number;
}

interface UseAbilityPayload {
  duelId: string;
  ability: string;
  targetIndex?: number;
}

interface EmotePayload {
  duelId: string;
  emote: string;
}

// =============================================================================
// STATE MANAGEMENT - REDIS-BACKED
// =============================================================================
// State is now managed via DuelStateManager (Redis) for horizontal scaling.
// ActiveDuelState interface is exported from duelStateManager.service.ts
// characterToDuel mapping is handled by DuelStateManager.setCharacterDuel()
// Turn timers are managed by DuelTimerManager (Redis sorted sets)

// =============================================================================
// H5 SECURITY FIX: Disconnect handling constants
// =============================================================================
const DISCONNECT_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes to reconnect
const EARLY_DISCONNECT_PENALTY_PERCENT = 10; // 10% wager penalty for early disconnect

// H8 FIX: Track animation timers to prevent leaks when duels are cancelled
// NOTE: Disconnect timers are now Redis-backed via DisconnectTimerManager
// Maps duelId to array of active animation timers
const animationTimers = new Map<string, NodeJS.Timeout[]>();

/**
 * Register an animation timer for a duel (for cleanup tracking)
 */
function registerAnimationTimer(duelId: string, timer: NodeJS.Timeout): void {
  const timers = animationTimers.get(duelId) || [];
  timers.push(timer);
  animationTimers.set(duelId, timers);
}

/**
 * Clear all animation timers for a duel
 */
function clearAnimationTimers(duelId: string): void {
  const timers = animationTimers.get(duelId);
  if (timers) {
    for (const timer of timers) {
      clearTimeout(timer);
    }
    animationTimers.delete(duelId);
    logger.debug(`Cleared ${timers.length} animation timer(s) for duel ${duelId}`);
  }
}

// =============================================================================
// MEMORY LEAK PREVENTION: Periodic cleanup and graceful shutdown
// =============================================================================

/**
 * Flag to track if disconnect timer polling is initialized
 */
let disconnectPollingInitialized = false;

/**
 * Graceful shutdown handler - clean up all timers and resources
 */
function handleGracefulShutdown(): void {
  logger.info('Duel handlers: Starting graceful shutdown...');

  // Clear all animation timers (in-memory only)
  let animationCount = 0;
  for (const timers of animationTimers.values()) {
    for (const timer of timers) {
      clearTimeout(timer);
      animationCount++;
    }
  }
  animationTimers.clear();

  // Stop the turn timer manager polling
  if (timerPollingInitialized) {
    DuelTimerManager.stopPolling();
    timerPollingInitialized = false;
  }

  // Stop the disconnect timer manager polling
  if (disconnectPollingInitialized) {
    DisconnectTimerManager.stopPolling();
    disconnectPollingInitialized = false;
  }

  logger.info(`Duel handlers: Cleaned up ${animationCount} animation timer(s) during shutdown. Redis-backed timers persist.`);
}

// Register shutdown handlers
process.on('SIGTERM', handleGracefulShutdown);
process.on('SIGINT', handleGracefulShutdown);

/**
 * Create initial ability state for a player
 */
function createInitialAbilityState(perceptionLevel: number, sleightLevel: number): AbilityState {
  return {
    available: perceptionService.getAvailableAbilities(perceptionLevel, sleightLevel),
    cooldowns: {},
    energy: 50, // Start with 50 energy
    maxEnergy: 100,
    pokerFaceActive: false,
    pokerFaceRoundsLeft: 0
  };
}

/**
 * Flag to track if timer manager polling is initialized
 */
let timerPollingInitialized = false;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get duel room name
 */
function getDuelRoomName(duelId: string): string {
  return `duel:${duelId}`;
}

/**
 * Get socket for a character
 */
async function getSocketForCharacter(characterId: string): Promise<string | null> {
  try {
    const io = getSocketIO();
    const sockets = await io.fetchSockets();

    for (const socket of sockets) {
      const authSocket = socket as unknown as AuthenticatedSocket;
      if (authSocket.data?.characterId === characterId) {
        return socket.id;
      }
    }
    return null;
  } catch (error) {
    logger.error('Error finding socket for character:', error);
    return null;
  }
}

/**
 * Build client state for a specific player
 */
function buildClientState(
  duelState: ActiveDuelState,
  forCharacterId: string,
  playerState: any,
  opponentState: any
): DuelClientState {
  const isChallenger = forCharacterId === duelState.challengerId;
  const isMyTurn = duelState.turnPlayerId === forCharacterId;

  // Build player's full state
  const player: DuelPlayerState = {
    characterId: forCharacterId,
    name: playerState?.name || 'You',
    isReady: isChallenger ? duelState.challengerReady : duelState.challengedReady,
    isConnected: true,
    hand: playerState?.hand || [],
    heldIndices: playerState?.heldIndices || [],
    hasSubmittedAction: playerState?.hasSubmittedAction || false,
    currentBet: playerState?.currentBet || 0,
    totalPotContribution: playerState?.totalPotContribution || 0,
    roundsWon: isChallenger
      ? duelState.roundResults.filter(r => r.winnerId === duelState.challengerId).length
      : duelState.roundResults.filter(r => r.winnerId === duelState.challengedId).length,
    hasFolded: playerState?.hasFolded || false,
    lastAction: playerState?.lastAction
  };

  // Build opponent's limited visible state
  const opponent: OpponentVisibleState = {
    characterId: isChallenger ? duelState.challengedId : duelState.challengerId,
    name: opponentState?.name || 'Opponent',
    level: opponentState?.level || 1,
    isReady: isChallenger ? duelState.challengedReady : duelState.challengerReady,
    isConnected: (isChallenger ? duelState.challengedSocketId : duelState.challengerSocketId) !== undefined,
    hasSubmittedAction: opponentState?.hasSubmittedAction || false,
    currentBet: opponentState?.currentBet || 0,
    totalPotContribution: opponentState?.totalPotContribution || 0,
    roundsWon: isChallenger
      ? duelState.roundResults.filter(r => r.winnerId === duelState.challengedId).length
      : duelState.roundResults.filter(r => r.winnerId === duelState.challengerId).length,
    hasFolded: opponentState?.hasFolded || false,
    cardCount: opponentState?.hand?.length || 5,
    lastAction: opponentState?.lastAction,
    perceptionHints: opponentState?.perceptionHints || []
  };

  // Build round state
  const round: DuelRoundState = {
    roundNumber: duelState.roundNumber,
    phase: duelState.phase,
    pot: duelState.pot,
    currentBet: duelState.currentBet,
    turnPlayerId: duelState.turnPlayerId,
    turnTimeLimit: duelState.turnTimeLimit,
    turnStartedAt: duelState.turnStartedAt,
    dealerPosition: duelState.roundNumber % 2 === 1 ? 'challenger' : 'challenged'
  };

  // Determine available actions
  const availableActions = getAvailableActions(duelState, forCharacterId, player);

  return {
    duelId: duelState.duelId,
    status: DuelStatus.IN_PROGRESS as any,
    type: DuelType.CASUAL as any,
    wagerAmount: 0,
    player,
    opponent,
    round,
    roundResults: duelState.roundResults,
    totalRounds: duelState.totalRounds,
    isMyTurn,
    availableActions
  };
}

/**
 * Get available actions for current state
 */
function getAvailableActions(
  duelState: ActiveDuelState,
  characterId: string,
  playerState: DuelPlayerState
): string[] {
  const isMyTurn = duelState.turnPlayerId === characterId;
  const actions: string[] = [];

  switch (duelState.phase) {
    case DuelPhase.WAITING:
    case DuelPhase.READY_CHECK:
      if (!playerState.isReady) {
        actions.push('ready');
      }
      break;

    case DuelPhase.SELECTION:
      if (isMyTurn && !playerState.hasSubmittedAction) {
        actions.push('hold', 'draw');
      }
      break;

    case DuelPhase.BETTING:
      if (isMyTurn && !playerState.hasFolded) {
        if (duelState.currentBet === 0) {
          actions.push('check', 'bet');
        } else {
          actions.push('call', 'raise', 'fold');
        }
        actions.push('all_in');
      }
      break;

    default:
      break;
  }

  actions.push('forfeit', 'emote');
  return actions;
}

/**
 * Start turn timer using Redis-backed DuelTimerManager
 */
async function startTurnTimer(duelId: string, timeLimit: number): Promise<void> {
  // Schedule timeout in Redis
  await DuelTimerManager.rescheduleTimeout(duelId, timeLimit * 1000);

  // Schedule warning timer (10 seconds before timeout)
  if (timeLimit > 10) {
    await DuelTimerManager.scheduleTimeWarning(duelId, 10000, timeLimit * 1000);
  }
}

/**
 * Handle turn timeout - called by DuelTimerManager polling
 */
async function handleTurnTimeout(duelId: string): Promise<void> {
  // Check if this is a warning timer
  if (DuelTimerManager.isWarningTimer(duelId)) {
    const actualDuelId = DuelTimerManager.getDuelIdFromWarning(duelId);
    const roomName = getDuelRoomName(actualDuelId);
    emitToRoom(roomName, 'duel:time_warning', { secondsRemaining: 10 });
    return;
  }

  const state = await DuelStateManager.getState(duelId);
  if (!state) return;

  logger.info(`Turn timeout for duel ${duelId}`);

  const roomName = getDuelRoomName(duelId);

  // Auto-fold or auto-check based on phase
  if (state.phase === DuelPhase.BETTING) {
    // Auto-fold on timeout during betting
    emitToRoom(roomName, 'duel:opponent_action', {
      actionType: 'timeout_fold',
      timestamp: Date.now()
    });

    // Process fold
    const winnerId = state.turnPlayerId === state.challengerId
      ? state.challengedId
      : state.challengerId;

    const roundResult: RoundResult = {
      roundNumber: state.roundNumber,
      winnerId,
      winnerName: 'Opponent',
      winnerHand: [],
      winnerHandRank: 0 as any,
      winnerHandName: 'Timeout',
      loserHand: [],
      loserHandRank: 0 as any,
      loserHandName: 'Timed Out',
      potWon: state.pot,
      isTie: false,
      margin: 0
    };

    await DuelStateManager.addRoundResult(duelId, roundResult);
    emitToRoom(roomName, 'duel:round_result', roundResult);
  } else if (state.phase === DuelPhase.SELECTION) {
    // Auto-draw with no holds
    emitToRoom(roomName, 'duel:opponent_action', {
      actionType: 'timeout_draw',
      timestamp: Date.now()
    });
  }
}

/**
 * Clear turn timer using Redis-backed DuelTimerManager
 */
async function clearTurnTimer(duelId: string): Promise<void> {
  await DuelTimerManager.cancelTimeout(duelId);
  // Also cancel warning timer
  await DuelTimerManager.cancelTimeout(`${duelId}:warning`);
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

/**
 * Handle joining a duel room
 */
async function handleJoinDuelRoom(
  socket: AuthenticatedSocket,
  payload: JoinDuelRoomPayload
): Promise<void> {
  try {
    const { characterId, characterName } = socket.data;
    const { duelId } = payload;

    // H10 SECURITY FIX: Verify character ownership before joining duel
    const isOwned = await verifyCharacterOwnership(socket);
    if (!isOwned) {
      socket.emit('duel:error', {
        message: 'Character verification failed. Please reconnect.',
        code: 'CHARACTER_VERIFICATION_FAILED'
      });
      socket.disconnect(true);
      return;
    }

    // Validate duel exists
    const duel = await Duel.findById(duelId);
    if (!duel) {
      socket.emit('duel:error', {
        message: 'Duel not found',
        code: 'DUEL_NOT_FOUND'
      });
      return;
    }

    // Verify player is participant
    const isChallenger = duel.challengerId.toString() === characterId;
    const isChallenged = duel.challengedId.toString() === characterId;

    if (!isChallenger && !isChallenged) {
      socket.emit('duel:error', {
        message: 'You are not a participant in this duel',
        code: 'NOT_PARTICIPANT'
      });
      return;
    }

    // Join the room
    const roomName = getDuelRoomName(duelId);
    await socket.join(roomName);

    // Get or create state in Redis
    let state = await DuelStateManager.getState(duelId);
    if (!state) {
      // Get character skill levels for ability initialization
      const challenger = await Character.findById(duel.challengerId);
      const challenged = await Character.findById(duel.challengedId);

      // Handle skills array format
      const getSkillLevel = (skills: any, skillName: string): number => {
        if (Array.isArray(skills)) {
          const skill = skills.find((s: any) => s.name === skillName);
          return skill?.level ?? 1;
        }
        return skills?.[skillName] ?? 1;
      };

      const challengerPerception = getSkillLevel(challenger?.skills, 'perception');
      const challengerSleight = getSkillLevel(challenger?.skills, 'sleight_of_hand');
      const challengedPerception = getSkillLevel(challenged?.skills, 'perception');
      const challengedSleight = getSkillLevel(challenged?.skills, 'sleight_of_hand');

      // Initialize state
      state = {
        duelId,
        phase: DuelPhase.WAITING,
        challengerId: duel.challengerId.toString(),
        challengedId: duel.challengedId.toString(),
        challengerReady: false,
        challengedReady: false,
        roundNumber: 1,
        pot: 0,
        currentBet: 0,
        turnPlayerId: duel.challengerId.toString(),
        turnStartedAt: Date.now(),
        turnTimeLimit: 60,
        roundResults: [],
        totalRounds: 3,
        // Initialize ability states
        challengerAbilityState: createInitialAbilityState(challengerPerception, challengerSleight),
        challengedAbilityState: createInitialAbilityState(challengedPerception, challengedSleight),
        challengerBettingHistory: [],
        challengedBettingHistory: [],
        createdAt: Date.now(),
        lastActivityAt: Date.now()
      };
      await DuelStateManager.setState(duelId, state);
    }

    // Update socket ID via Redis
    await DuelStateManager.setCharacterSocket(duelId, characterId, socket.id);
    if (isChallenger) {
      state.challengerSocketId = socket.id;
    } else {
      state.challengedSocketId = socket.id;
    }

    // Track character -> duel mapping in Redis
    await DuelStateManager.setCharacterDuel(characterId, duelId);

    // H5 SECURITY FIX: Clear any disconnect timer if player is reconnecting
    await clearDisconnectTimer(duelId, characterId);

    logger.info(`Character ${characterName} joined duel room ${roomName}`);

    // Notify room of join
    socket.to(roomName).emit('duel:opponent_joined', { name: characterName });

    // Send current state to joining player
    const clientState = buildClientState(state, characterId, null, null);
    socket.emit('duel:state_update', clientState);

    // Check if both players are now in the room
    if (state.challengerSocketId && state.challengedSocketId) {
      state.phase = DuelPhase.READY_CHECK;

      // Notify both players to ready up
      emitToRoom(roomName, 'duel:state_update', buildClientState(state, state.challengerId, null, null));
    }

  } catch (error) {
    logger.error(`Error in handleJoinDuelRoom for socket ${socket.id}:`, error);
    socket.emit('duel:error', {
      message: 'Failed to join duel room',
      code: 'JOIN_FAILED'
    });
  }
}

/**
 * Handle player ready
 */
async function handleReady(
  socket: AuthenticatedSocket,
  payload: ReadyPayload
): Promise<void> {
  try {
    const { characterId, characterName } = socket.data;
    const { duelId } = payload;

    // H10 SECURITY FIX: Verify character ownership before critical action
    const isOwned = await verifyCharacterOwnership(socket);
    if (!isOwned) {
      socket.emit('duel:error', {
        message: 'Character verification failed. Please reconnect.',
        code: 'CHARACTER_VERIFICATION_FAILED'
      });
      socket.disconnect(true);
      return;
    }

    // H8 RACE CONDITION FIX: Use atomic setCharacterReady instead of read-modify-write
    // This uses Redis WATCH/MULTI/EXEC for optimistic locking, ensuring only one
    // handler sees bothReady=true even if two ready signals arrive simultaneously
    const { bothReady, state } = await DuelStateManager.setCharacterReady(duelId, characterId);

    if (!state) {
      socket.emit('duel:error', {
        message: 'Duel not found',
        code: 'DUEL_NOT_FOUND'
      });
      return;
    }

    // Verify character is a participant (setCharacterReady returns unchanged state if not)
    const isChallenger = characterId === state.challengerId;
    const isChallenged = characterId === state.challengedId;

    if (!isChallenger && !isChallenged) {
      socket.emit('duel:error', {
        message: 'Not a participant',
        code: 'NOT_PARTICIPANT'
      });
      return;
    }

    const roomName = getDuelRoomName(duelId);

    logger.info(`Character ${characterName} is ready in duel ${duelId}`);

    // Check if both ready - only one handler will see bothReady=true due to atomic updates
    if (bothReady) {
      // Start the game!
      await startDuelGame(duelId, state);
    } else {
      // Update state
      emitToRoom(roomName, 'duel:state_update', buildClientState(state, state.challengerId, null, null));
    }

  } catch (error) {
    logger.error(`Error in handleReady for socket ${socket.id}:`, error);
    socket.emit('duel:error', {
      message: 'Failed to ready up',
      code: 'READY_FAILED'
    });
  }
}

/**
 * Start the actual duel game
 */
async function startDuelGame(duelId: string, state: ActiveDuelState): Promise<void> {
  try {
    // Use duel service to start game
    const gameState = await DuelService.startDuelGame(duelId);

    // Update phase
    state.phase = DuelPhase.DEALING;
    state.turnStartedAt = Date.now();

    const roomName = getDuelRoomName(duelId);

    // Emit game start
    emitToRoom(roomName, 'duel:game_start', {
      duelId,
      totalRounds: state.totalRounds,
      firstPlayer: state.challengerId
    });

    // Brief delay for dealing animation, then move to selection
    // H8 FIX: Track timer to prevent leaks if duel is cancelled during animation
    // FIX: Wrap async callback with try/catch to prevent silent failures
    const dealingTimer = setTimeout(() => {
      (async () => {
        try {
          state.phase = DuelPhase.SELECTION;
          state.turnPlayerId = state.challengerId;
          state.turnStartedAt = Date.now();

          // Deal cards to challenger
          if (state.challengerSocketId) {
            const challengerGameState = await DuelService.getDuelGameState(duelId, state.challengerId);
            const io = getSocketIO();
            io.to(state.challengerSocketId).emit('duel:cards_dealt', {
              cards: challengerGameState?.hand || [],
              roundNumber: state.roundNumber
            });
          }

          // Deal cards to challenged
          if (state.challengedSocketId) {
            const challengedGameState = await DuelService.getDuelGameState(duelId, state.challengedId);
            const io = getSocketIO();
            io.to(state.challengedSocketId).emit('duel:cards_dealt', {
              cards: challengedGameState?.hand || [],
              roundNumber: state.roundNumber
            });
          }

          // Start turn timer
          await startTurnTimer(duelId, state.turnTimeLimit);

          // Emit turn start
          emitToRoom(roomName, 'duel:turn_start', {
            playerId: state.turnPlayerId,
            phase: state.phase,
            timeLimit: state.turnTimeLimit,
            availableActions: ['hold', 'draw']
          });
        } catch (error) {
          logger.error('Error in dealing timer callback', { duelId, error: error instanceof Error ? error.message : error });
          emitToRoom(roomName, 'duel:error', {
            message: 'Failed to deal cards',
            code: 'DEALING_FAILED'
          });
        }
      })();
    }, 2000); // 2 second dealing animation
    registerAnimationTimer(duelId, dealingTimer);

    logger.info(`Duel game started: ${duelId}`);

  } catch (error) {
    logger.error(`Error starting duel game ${duelId}:`, error);
    const roomName = getDuelRoomName(duelId);
    emitToRoom(roomName, 'duel:error', {
      message: 'Failed to start game',
      code: 'START_FAILED'
    });
  }
}

/**
 * Handle card hold selection
 */
async function handleHoldCards(
  socket: AuthenticatedSocket,
  payload: HoldCardsPayload
): Promise<void> {
  try {
    const { characterId } = socket.data;
    const { duelId, cardIndices } = payload;

    // H10 SECURITY FIX: Verify character ownership before critical action
    const isOwned = await verifyCharacterOwnership(socket);
    if (!isOwned) {
      socket.emit('duel:error', {
        message: 'Character verification failed. Please reconnect.',
        code: 'CHARACTER_VERIFICATION_FAILED'
      });
      socket.disconnect(true);
      return;
    }

    const state = await DuelStateManager.getState(duelId);
    if (!state) {
      socket.emit('duel:error', {
        message: 'Duel not found',
        code: 'DUEL_NOT_FOUND'
      });
      return;
    }

    if (state.phase !== DuelPhase.SELECTION) {
      socket.emit('duel:error', {
        message: 'Not in selection phase',
        code: 'WRONG_PHASE'
      });
      return;
    }

    // Process hold action through duel service
    await DuelService.processDuelAction(duelId, characterId, {
      type: 'hold',
      cardIndices
    });

    const roomName = getDuelRoomName(duelId);

    // Notify opponent of action (limited info)
    socket.to(roomName).emit('duel:opponent_action', {
      actionType: 'hold',
      timestamp: Date.now()
    });

    // Confirm to player
    socket.emit('duel:action_confirmed', {
      action: 'hold',
      cardIndices
    });

  } catch (error) {
    logger.error(`Error in handleHoldCards for socket ${socket.id}:`, error);
    socket.emit('duel:error', {
      message: 'Failed to hold cards',
      code: 'HOLD_FAILED'
    });
  }
}

/**
 * Handle draw action
 */
async function handleDraw(
  socket: AuthenticatedSocket,
  payload: DrawPayload
): Promise<void> {
  try {
    const { characterId } = socket.data;
    const { duelId } = payload;

    // H10 SECURITY FIX: Verify character ownership before critical action
    const isOwned = await verifyCharacterOwnership(socket);
    if (!isOwned) {
      socket.emit('duel:error', {
        message: 'Character verification failed. Please reconnect.',
        code: 'CHARACTER_VERIFICATION_FAILED'
      });
      socket.disconnect(true);
      return;
    }

    const state = await DuelStateManager.getState(duelId);
    if (!state) {
      socket.emit('duel:error', {
        message: 'Duel not found',
        code: 'DUEL_NOT_FOUND'
      });
      return;
    }

    if (state.phase !== DuelPhase.SELECTION) {
      socket.emit('duel:error', {
        message: 'Not in selection phase',
        code: 'WRONG_PHASE'
      });
      return;
    }

    // Process draw action
    const result = await DuelService.processDuelAction(duelId, characterId, {
      type: 'draw'
    });

    const roomName = getDuelRoomName(duelId);

    // Notify opponent
    socket.to(roomName).emit('duel:opponent_action', {
      actionType: 'draw',
      timestamp: Date.now()
    });

    // Send new cards to player
    socket.emit('duel:cards_dealt', {
      cards: result.gameState.hand,
      roundNumber: state.roundNumber
    });

    // Check if game is resolved (both players drew)
    if (result.duelComplete) {
      await handleDuelComplete(duelId, state, result.result);
    } else if (result.isResolved) {
      // This player's selection is done, wait for opponent or move to reveal
      // For now, move to reveal phase if both have drawn
      state.phase = DuelPhase.REVEAL;
      await handleRevealPhase(duelId, state);
    }

  } catch (error) {
    logger.error(`Error in handleDraw for socket ${socket.id}:`, error);
    socket.emit('duel:error', {
      message: 'Failed to draw',
      code: 'DRAW_FAILED'
    });
  }
}

/**
 * Handle reveal phase
 */
async function handleRevealPhase(duelId: string, state: ActiveDuelState): Promise<void> {
  const roomName = getDuelRoomName(duelId);

  // Get both hands
  const challengerState = await DuelService.getDuelGameState(duelId, state.challengerId);
  const challengedState = await DuelService.getDuelGameState(duelId, state.challengedId);

  if (!challengerState || !challengedState) {
    logger.error(`Missing game state for reveal in duel ${duelId}`);
    return;
  }

  // Clear turn timer
  await clearTurnTimer(duelId);

  // Calculate hand rankings for both players
  // CRITICAL FIX: Hand rankings were previously a TODO stub - now properly implemented
  let challengerEval: HandEvaluation | null = null;
  let challengedEval: HandEvaluation | null = null;

  try {
    if (challengerState.hand && challengerState.hand.length === 5) {
      challengerEval = evaluateHand(challengerState.hand);
    }
    if (challengedState.hand && challengedState.hand.length === 5) {
      challengedEval = evaluateHand(challengedState.hand);
    }
  } catch (error) {
    logger.error(`Error evaluating hands in duel ${duelId}`, { error });
  }

  // Determine round winner
  let roundWinnerId: string | null = null;
  let roundResult: 'challenger' | 'challenged' | 'tie' = 'tie';

  if (challengerEval && challengedEval) {
    const comparison = compareHands(challengerEval, challengedEval);
    if (comparison > 0) {
      roundWinnerId = state.challengerId;
      roundResult = 'challenger';
    } else if (comparison < 0) {
      roundWinnerId = state.challengedId;
      roundResult = 'challenged';
    }
    // comparison === 0 means tie
  }

  // Emit reveal to both players with hand evaluations
  emitToRoom(roomName, 'duel:reveal_phase', {
    challengerHand: challengerState.hand,
    challengedHand: challengedState.hand,
    challengerHandRank: challengerEval?.rank ?? 0,
    challengerHandName: challengerEval?.description ?? 'Unknown',
    challengerHandScore: challengerEval?.score ?? 0,
    challengedHandRank: challengedEval?.rank ?? 0,
    challengedHandName: challengedEval?.description ?? 'Unknown',
    challengedHandScore: challengedEval?.score ?? 0,
    roundNumber: state.roundNumber,
    roundWinnerId,
    roundResult
  });

  // After reveal animation, determine winner
  // SECURITY FIX: Properly handle async operation in setTimeout using IIFE pattern
  // H8 FIX: Track timer to prevent leaks if duel is cancelled during animation
  const revealTimer = setTimeout(() => {
    (async () => {
      try {
        // Both states should be resolved, get results from service
        await DuelService.processDuelAction(duelId, state.challengerId, { type: 'draw' });
        // The duel service handles winner determination internally
      } catch (error) {
        logger.error('Failed to process duel action in reveal phase', {
          duelId,
          error: error instanceof Error ? error.message : error
        });
      }
    })();
  }, 3500); // 3.5 second reveal animation
  registerAnimationTimer(duelId, revealTimer);
}

/**
 * Handle duel completion
 */
async function handleDuelComplete(
  duelId: string,
  state: ActiveDuelState,
  result: any
): Promise<void> {
  const roomName = getDuelRoomName(duelId);

  // Clear timers
  await clearTurnTimer(duelId);

  // Update state
  state.phase = DuelPhase.DUEL_END;

  // Emit completion event
  emitToRoom(roomName, 'duel:game_complete', {
    winnerId: result.winnerId,
    winnerName: result.winnerName,
    finalScore: {
      challenger: result.challengerScore,
      challenged: result.challengedScore
    },
    rewards: {
      gold: result.goldTransferred || 0,
      experience: 50
    },
    isForfeit: false
  });

  // H8 FIX: Clear animation timers before cleanup to prevent leaks
  clearAnimationTimers(duelId);

  // Clear any pending disconnect timers for this duel
  await DisconnectTimerManager.clearAllTimersForDuel(duelId);

  // Clean up Redis state
  await DuelStateManager.cleanupDuel(duelId, state);

  logger.info(`Duel ${duelId} completed. Winner: ${result.winnerName}`);
}

/**
 * Handle betting action
 */
async function handleBet(
  socket: AuthenticatedSocket,
  payload: BetPayload
): Promise<void> {
  try {
    const { characterId } = socket.data;
    const { duelId, action, amount } = payload;

    // H10 SECURITY FIX: Verify character ownership before betting (involves gold)
    const isOwned = await verifyCharacterOwnership(socket);
    if (!isOwned) {
      socket.emit('duel:error', {
        message: 'Character verification failed. Please reconnect.',
        code: 'CHARACTER_VERIFICATION_FAILED'
      });
      socket.disconnect(true);
      return;
    }

    const state = await DuelStateManager.getState(duelId);
    if (!state) {
      socket.emit('duel:error', {
        message: 'Duel not found',
        code: 'DUEL_NOT_FOUND'
      });
      return;
    }

    if (state.phase !== DuelPhase.BETTING) {
      socket.emit('duel:error', {
        message: 'Not in betting phase',
        code: 'WRONG_PHASE'
      });
      return;
    }

    if (state.turnPlayerId !== characterId) {
      socket.emit('duel:error', {
        message: 'Not your turn',
        code: 'NOT_YOUR_TURN'
      });
      return;
    }

    const roomName = getDuelRoomName(duelId);

    // Track betting history for perception
    const isChallenger = characterId === state.challengerId;
    if (isChallenger) {
      state.challengerBettingHistory.push(action);
    } else {
      state.challengedBettingHistory.push(action);
    }

    // Process betting action
    switch (action) {
      case BettingAction.CHECK:
        // Pass action to next player
        state.turnPlayerId = state.turnPlayerId === state.challengerId
          ? state.challengedId
          : state.challengerId;
        break;

      case BettingAction.BET:
      case BettingAction.RAISE:
        state.currentBet = amount || state.currentBet * 2;
        state.pot += state.currentBet;
        state.turnPlayerId = state.turnPlayerId === state.challengerId
          ? state.challengedId
          : state.challengerId;
        break;

      case BettingAction.CALL:
        state.pot += state.currentBet;
        // Both have matched, proceed to reveal
        state.phase = DuelPhase.REVEAL;
        break;

      case BettingAction.FOLD:
        // Opponent wins this round
        const winnerId = characterId === state.challengerId
          ? state.challengedId
          : state.challengerId;
        const roundResult: RoundResult = {
          roundNumber: state.roundNumber,
          winnerId,
          winnerName: 'Opponent',
          winnerHand: [],
          winnerHandRank: 0 as any,
          winnerHandName: 'Fold',
          loserHand: [],
          loserHandRank: 0 as any,
          loserHandName: 'Folded',
          potWon: state.pot,
          isTie: false,
          margin: 0
        };
        state.roundResults.push(roundResult);
        emitToRoom(roomName, 'duel:round_result', roundResult);
        break;

      case BettingAction.ALL_IN:
        // TODO: Handle all-in logic
        break;
    }

    // Send passive perception hints to opponent after betting action
    const opponentSocketId = isChallenger ? state.challengedSocketId : state.challengerSocketId;
    if (opponentSocketId) {
      const io = getSocketIO();
      const opponentSocket = (await io.fetchSockets()).find(s => s.id === opponentSocketId);
      if (opponentSocket) {
        const opponentId = isChallenger ? state.challengedId : state.challengerId;
        await sendPassivePerceptionHints(
          opponentSocket as unknown as AuthenticatedSocket,
          duelId,
          opponentId
        );
      }
    }

    // Notify opponent
    socket.to(roomName).emit('duel:opponent_action', {
      actionType: action,
      amount,
      timestamp: Date.now()
    });

    // Reset turn timer
    state.turnStartedAt = Date.now();
    startTurnTimer(duelId, state.turnTimeLimit);

    // Send state updates
    emitToRoom(roomName, 'duel:state_update', buildClientState(state, state.challengerId, null, null));

  } catch (error) {
    logger.error(`Error in handleBet for socket ${socket.id}:`, error);
    socket.emit('duel:error', {
      message: 'Failed to process bet',
      code: 'BET_FAILED'
    });
  }
}

/**
 * Handle ability use
 */
async function handleUseAbility(
  socket: AuthenticatedSocket,
  payload: UseAbilityPayload
): Promise<void> {
  try {
    const { characterId, characterName } = socket.data;
    const { duelId, ability, targetIndex } = payload;

    // H10 SECURITY FIX: Per-event character ownership verification
    const isOwned = await verifyCharacterOwnership(socket);
    if (!isOwned) {
      socket.emit('duel:error', {
        message: 'Character verification failed. Please reconnect.',
        code: 'CHARACTER_VERIFICATION_FAILED'
      });
      socket.disconnect(true);
      return;
    }

    const state = await DuelStateManager.getState(duelId);
    if (!state) {
      socket.emit('duel:error', {
        message: 'Duel not found',
        code: 'DUEL_NOT_FOUND'
      });
      return;
    }

    const isChallenger = characterId === state.challengerId;
    const playerAbilityState = isChallenger ? state.challengerAbilityState : state.challengedAbilityState;
    const opponentAbilityState = isChallenger ? state.challengedAbilityState : state.challengerAbilityState;

    // Check if ability is available
    if (!playerAbilityState.available.includes(ability)) {
      socket.emit('duel:error', {
        message: 'Ability not available',
        code: 'ABILITY_NOT_AVAILABLE'
      });
      return;
    }

    // Check cooldown
    if (playerAbilityState.cooldowns[ability] && playerAbilityState.cooldowns[ability] > 0) {
      socket.emit('duel:error', {
        message: `Ability on cooldown for ${playerAbilityState.cooldowns[ability]} more rounds`,
        code: 'ABILITY_ON_COOLDOWN'
      });
      return;
    }

    // Get character skill levels
    const character = await Character.findById(characterId);
    const opponent = await Character.findById(isChallenger ? state.challengedId : state.challengerId);

    const playerPerceptionLevel = character?.getSkillLevel('perception') ?? 1;
    const playerSleightLevel = character?.getSkillLevel('sleight_of_hand') ?? 1;
    const opponentDeceptionLevel = opponent?.getSkillLevel('poker_face') ?? 1;
    const opponentPerceptionLevel = opponent?.getSkillLevel('perception') ?? 1;

    // Get opponent's hand for abilities that need it
    const opponentGameState = await DuelService.getDuelGameState(
      duelId,
      isChallenger ? state.challengedId : state.challengerId
    );
    const opponentHand = opponentGameState?.hand || [];

    logger.info(`Character ${characterName} using ability ${ability} in duel ${duelId}`);

    // Use the perception service to process the ability
    const result = perceptionService.useAbility(
      ability as DuelAbility,
      playerPerceptionLevel,
      opponentDeceptionLevel,
      opponentHand,
      playerAbilityState.energy
    );

    if (!result.success) {
      socket.emit('duel:ability_result', {
        ability,
        success: false,
        message: result.message || 'Ability failed',
        energyCost: 0,
        newCooldown: 0
      });
      return;
    }

    // Deduct energy
    playerAbilityState.energy -= result.energyCost;

    // Apply cooldown
    if (result.cooldownRounds) {
      playerAbilityState.cooldowns[ability] = result.cooldownRounds;
    }

    // Handle special ability effects
    if (ability === DuelAbility.POKER_FACE) {
      playerAbilityState.pokerFaceActive = true;
      playerAbilityState.pokerFaceRoundsLeft = 2;
    }

    // Check if cheat was detected
    if (result.detected) {
      const roomName = getDuelRoomName(duelId);
      emitToRoom(roomName, 'duel:cheat_detected', {
        accuserId: isChallenger ? state.challengedId : state.challengerId,
        accuserCorrect: true,
        penalty: {
          goldLost: Math.floor(state.pot * 0.25),
          reputationLost: 100
        },
        message: `${characterName} was caught cheating!`
      });

      // Cheater loses the duel immediately
      // TODO: Handle duel loss due to cheating
    }

    // Emit ability result to the player
    socket.emit('duel:ability_result', {
      ability,
      success: true,
      message: result.message,
      effect: {
        hints: result.effect?.hints,
        revealedCards: result.effect?.revealedCards,
        blockedRounds: ability === DuelAbility.POKER_FACE ? 2 : undefined
      },
      energyCost: result.energyCost,
      newCooldown: result.cooldownRounds || 0
    });

    // If there are perception hints, also emit them
    const hints = result.effect?.hints;
    if (hints && hints.length > 0) {
      socket.emit('duel:perception_result', {
        success: true,
        hints: hints,
        energyCost: result.energyCost,
        wasBlocked: opponentAbilityState.pokerFaceActive
      });
    }

    logger.info(`Ability ${ability} used by ${characterName}: success=${result.success}, hints=${hints?.length || 0}`);

  } catch (error) {
    logger.error(`Error in handleUseAbility for socket ${socket.id}:`, error);
    socket.emit('duel:error', {
      message: 'Failed to use ability',
      code: 'ABILITY_FAILED'
    });
  }
}

/**
 * Generate passive perception hints and send to player
 */
async function sendPassivePerceptionHints(
  socket: AuthenticatedSocket,
  duelId: string,
  characterId: string
): Promise<void> {
  try {
    const state = await DuelStateManager.getState(duelId);
    if (!state) return;

    const isChallenger = characterId === state.challengerId;
    const opponentId = isChallenger ? state.challengedId : state.challengerId;
    const opponentAbilityState = isChallenger ? state.challengedAbilityState : state.challengerAbilityState;
    const opponentBettingHistory = isChallenger ? state.challengedBettingHistory : state.challengerBettingHistory;

    // Get character skill levels
    const character = await Character.findById(characterId);
    const opponent = await Character.findById(opponentId);

    const playerPerceptionLevel = character?.getSkillLevel('perception') ?? 1;
    const opponentPokerFaceLevel = opponent?.getSkillLevel('poker_face') ?? 1;

    // Get opponent's game state
    const opponentGameState = await DuelService.getDuelGameState(duelId, opponentId);
    if (!opponentGameState) return;

    // Calculate hand strength (simplified - number of cards as proxy)
    const handStrength = opponentGameState.hand?.length ?? 0;

    // Check if opponent has poker face active
    if (opponentAbilityState.pokerFaceActive) {
      // Poker face blocks passive perception
      return;
    }

    // Get passive hints
    const hints = perceptionService.getPassiveHints(
      playerPerceptionLevel,
      opponentPokerFaceLevel,
      opponentGameState.hand || [],
      opponentBettingHistory,
      handStrength
    );

    if (hints.length > 0) {
      socket.emit('duel:perception_result', {
        success: true,
        hints,
        energyCost: 0,
        wasBlocked: false
      });
    }
  } catch (error) {
    logger.error(`Error sending passive perception hints:`, error);
  }
}

/**
 * Handle forfeit
 */
async function handleForfeit(
  socket: AuthenticatedSocket,
  payload: { duelId: string }
): Promise<void> {
  try {
    const { characterId, characterName } = socket.data;
    const { duelId } = payload;

    // H10 SECURITY FIX: Verify character ownership before forfeit
    const isOwned = await verifyCharacterOwnership(socket);
    if (!isOwned) {
      socket.emit('duel:error', {
        message: 'Character verification failed. Please reconnect.',
        code: 'CHARACTER_VERIFICATION_FAILED'
      });
      socket.disconnect(true);
      return;
    }

    const state = await DuelStateManager.getState(duelId);
    if (!state) {
      socket.emit('duel:error', {
        message: 'Duel not found',
        code: 'DUEL_NOT_FOUND'
      });
      return;
    }

    // Determine winner
    const winnerId = characterId === state.challengerId
      ? state.challengedId
      : state.challengerId;

    const roomName = getDuelRoomName(duelId);

    logger.info(`Character ${characterName} forfeited duel ${duelId}`);

    // Clear timers
    await clearTurnTimer(duelId);

    // Emit completion
    emitToRoom(roomName, 'duel:game_complete', {
      winnerId,
      winnerName: 'Opponent',
      finalScore: {
        challenger: characterId === state.challengerId ? 0 : 1,
        challenged: characterId === state.challengedId ? 0 : 1
      },
      rewards: {
        gold: 0,
        experience: 10
      },
      isForfeit: true
    });

    // Update duel status in database
    await Duel.findByIdAndUpdate(duelId, {
      status: DuelStatus.COMPLETED,
      winnerId,
      completedAt: new Date()
    });

    // H8 FIX: Clear animation timers before cleanup to prevent leaks
    clearAnimationTimers(duelId);

    // Clear any pending disconnect timers for this duel
    await DisconnectTimerManager.clearAllTimersForDuel(duelId);

    // Clean up Redis state
    await DuelStateManager.cleanupDuel(duelId, state);

  } catch (error) {
    logger.error(`Error in handleForfeit for socket ${socket.id}:`, error);
    socket.emit('duel:error', {
      message: 'Failed to forfeit',
      code: 'FORFEIT_FAILED'
    });
  }
}

/**
 * Handle emote
 */
async function handleEmote(
  socket: AuthenticatedSocket,
  payload: EmotePayload
): Promise<void> {
  try {
    const { characterId } = socket.data;
    const { duelId, emote } = payload;

    const state = await DuelStateManager.getState(duelId);
    if (!state) return;

    const roomName = getDuelRoomName(duelId);

    // Broadcast emote to room
    emitToRoom(roomName, 'duel:emote', {
      playerId: characterId,
      emote
    });

  } catch (error) {
    logger.error(`Error in handleEmote for socket ${socket.id}:`, error);
  }
}

/**
 * Handle leaving duel room
 */
async function handleLeaveDuelRoom(
  socket: AuthenticatedSocket,
  payload: { duelId: string }
): Promise<void> {
  try {
    const { characterId, characterName } = socket.data;
    const { duelId } = payload;

    const roomName = getDuelRoomName(duelId);
    await socket.leave(roomName);

    // Update state
    const state = await DuelStateManager.getState(duelId);
    if (state) {
      if (characterId === state.challengerId) {
        state.challengerSocketId = undefined;
      } else {
        state.challengedSocketId = undefined;
      }

      // Notify opponent
      socket.to(roomName).emit('duel:opponent_left', { name: characterName });
    }

    // Remove character mapping from Redis
    await DuelStateManager.clearCharacterDuel(characterId);

    logger.info(`Character ${characterName} left duel room ${roomName}`);

  } catch (error) {
    logger.error(`Error in handleLeaveDuelRoom for socket ${socket.id}:`, error);
  }
}

// =============================================================================
// PUBLIC EXPORT
// =============================================================================

/**
 * Register all duel event handlers on a socket
 */
export function registerDuelHandlers(socket: Socket): void {
  const authSocket = socket as AuthenticatedSocket;

  // Verify authentication
  try {
    requireSocketAuth(authSocket);
  } catch (error) {
    logger.error(`Socket ${socket.id} is not authenticated, cannot register duel handlers`);
    return;
  }

  // Initialize turn timer polling if not already started (one-time setup)
  if (!timerPollingInitialized) {
    DuelTimerManager.startPolling(handleTurnTimeout);
    timerPollingInitialized = true;
    logger.info('DuelTimerManager polling initialized');
  }

  // Initialize disconnect timer polling if not already started (one-time setup)
  if (!disconnectPollingInitialized) {
    DisconnectTimerManager.startPolling(handleDisconnectTimeout);
    disconnectPollingInitialized = true;
    logger.info('DisconnectTimerManager polling initialized');
  }

  // Register event handlers
  authSocket.on('duel:join_room', (payload: JoinDuelRoomPayload) => {
    void handleJoinDuelRoom(authSocket, payload);
  });

  authSocket.on('duel:leave_room', (payload: { duelId: string }) => {
    void handleLeaveDuelRoom(authSocket, payload);
  });

  authSocket.on('duel:ready', (payload: ReadyPayload) => {
    void handleReady(authSocket, payload);
  });

  authSocket.on('duel:hold_cards', (payload: HoldCardsPayload) => {
    void handleHoldCards(authSocket, payload);
  });

  authSocket.on('duel:draw', (payload: DrawPayload) => {
    void handleDraw(authSocket, payload);
  });

  authSocket.on('duel:bet', (payload: BetPayload) => {
    void handleBet(authSocket, payload);
  });

  authSocket.on('duel:use_ability', (payload: UseAbilityPayload) => {
    void handleUseAbility(authSocket, payload);
  });

  authSocket.on('duel:forfeit', (payload: { duelId: string }) => {
    void handleForfeit(authSocket, payload);
  });

  authSocket.on('duel:emote', (payload: EmotePayload) => {
    void handleEmote(authSocket, payload);
  });

  // Handle disconnect - clean up duel state
  authSocket.on('disconnect', () => {
    void handleSocketDisconnect(authSocket);
  });

  logger.debug(`Duel handlers registered for socket ${socket.id}`);
}

/**
 * Handle socket disconnect - clean up duel state and timers
 * H5 SECURITY FIX: Implements disconnect timeout with auto-forfeit
 * SESSION FIX: Now uses Redis-backed DisconnectTimerManager for horizontal scaling
 */
async function handleSocketDisconnect(socket: AuthenticatedSocket): Promise<void> {
  try {
    const { characterId, characterName } = socket.data;

    // Check if character was in a duel
    const duelId = await DuelStateManager.getCharacterDuel(characterId);
    if (!duelId) {
      return;
    }

    logger.info(`Character ${characterName} disconnected from duel ${duelId}`);

    // Clear socket reference from state
    await DuelStateManager.clearCharacterSocket(duelId, characterId);

    // Get duel state to check if it's in progress
    const state = await DuelStateManager.getState(duelId);
    if (!state) {
      return;
    }

    // Notify opponent of disconnect
    const roomName = getDuelRoomName(duelId);
    emitToRoom(roomName, 'duel:opponent_disconnected', {
      name: characterName,
      timestamp: Date.now(),
      timeoutSeconds: DISCONNECT_TIMEOUT_MS / 1000
    });

    // H5 SECURITY FIX: Start disconnect timeout timer using Redis-backed manager
    // If player doesn't reconnect within timeout, they forfeit
    // This persists across server restarts and works with horizontal scaling
    await DisconnectTimerManager.setDisconnectTimer(
      duelId,
      characterId,
      characterName,
      DISCONNECT_TIMEOUT_MS
    );

    logger.info(`Started ${DISCONNECT_TIMEOUT_MS / 1000}s disconnect timeout for ${characterName} in duel ${duelId}`);

  } catch (error) {
    logger.error(`Error handling disconnect for socket ${socket.id}:`, error);
  }
}

/**
 * Handle disconnect timer expiration - called by DisconnectTimerManager polling
 * This is the callback that fires when a player's disconnect timer expires
 */
async function handleDisconnectTimeout(
  duelId: string,
  characterId: string,
  characterName: string
): Promise<void> {
  try {
    // Re-check if player reconnected
    const currentState = await DuelStateManager.getState(duelId);
    if (!currentState) {
      logger.debug(`Disconnect timeout fired but duel ${duelId} already ended`);
      return; // Duel already ended
    }

    // Check if player reconnected (has socket ID)
    const isChallenger = characterId === currentState.challengerId;
    const hasReconnected = isChallenger
      ? currentState.challengerSocketId !== undefined
      : currentState.challengedSocketId !== undefined;

    if (hasReconnected) {
      logger.info(`Character ${characterName} reconnected to duel ${duelId} before timeout`);
      return;
    }

    // Player didn't reconnect - auto-forfeit
    logger.warn(`[SECURITY] Character ${characterName} forfeited duel ${duelId} due to disconnect timeout`);

    // Determine winner (the player who stayed connected)
    const winnerId = isChallenger ? currentState.challengedId : currentState.challengerId;
    const roomName = getDuelRoomName(duelId);

    // Clear turn timer
    await clearTurnTimer(duelId);

    // Emit forfeit event
    emitToRoom(roomName, 'duel:game_complete', {
      winnerId,
      winnerName: 'Opponent',
      finalScore: {
        challenger: isChallenger ? 0 : 1,
        challenged: isChallenger ? 1 : 0
      },
      rewards: {
        gold: 0,
        experience: 10
      },
      isForfeit: true,
      disconnectForfeit: true
    });

    // Update duel status in database
    await Duel.findByIdAndUpdate(duelId, {
      status: DuelStatus.COMPLETED,
      winnerId,
      completedAt: new Date()
    });

    // H8 FIX: Clear animation timers before cleanup to prevent leaks
    clearAnimationTimers(duelId);

    // Clean up Redis state (also clears any remaining disconnect timers for this duel)
    await DisconnectTimerManager.clearAllTimersForDuel(duelId);
    await DuelStateManager.cleanupDuel(duelId, currentState);

  } catch (error) {
    logger.error(`Error in disconnect timeout handler for duel ${duelId}:`, error);
  }
}

/**
 * H5 SECURITY FIX: Clear disconnect timer when player reconnects
 * SESSION FIX: Now uses Redis-backed DisconnectTimerManager
 */
async function clearDisconnectTimer(duelId: string, characterId: string): Promise<void> {
  await DisconnectTimerManager.clearDisconnectTimer(duelId, characterId);
}

export default {
  registerDuelHandlers
};
