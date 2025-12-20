/**
 * useDuelSocket Hook
 * Handles real-time Socket.io connection for PvP duels
 * Integrates with useDuelStore for state management
 */

import { useEffect, useCallback, useRef } from 'react';
import { socketService } from '@/services/socket.service';
import { useDuelStore } from '@/store/useDuelStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { logger } from '@/services/logger.service';
import type {
  DuelClientState,
  BettingAction,
  RoundResult,
  ChallengeNotification,
  PerceptionCheckResult,
  AbilityResultEvent,
  CheatDetectedEvent,
  Card
} from '@desperados/shared';

// =============================================================================
// TYPES
// =============================================================================

interface UseDuelSocketReturn {
  // Connection
  isConnected: boolean;
  connectionError: string | null;

  // Actions
  joinDuelRoom: (duelId: string) => void;
  leaveDuelRoom: (duelId: string) => void;
  sendReady: (duelId: string) => void;
  sendHoldCards: (duelId: string, cardIndices: number[]) => void;
  sendDraw: (duelId: string) => void;
  sendBet: (duelId: string, action: BettingAction, amount?: number) => void;
  sendUseAbility: (duelId: string, ability: string, targetIndex?: number) => void;
  sendForfeit: (duelId: string) => void;
  sendEmote: (duelId: string, emote: string) => void;
}

// =============================================================================
// HOOK
// =============================================================================

export const useDuelSocket = (): UseDuelSocketReturn => {
  const {
    isConnected,
    connectionError,
    setConnected,
    setConnectionError,
    setActiveDuel,
    updatePlayerHand,
    updateOpponentAction,
    addRoundResult,
    triggerDealAnimation,
    triggerRevealAnimation,
    triggerVictoryAnimation,
    setPerceptionHints,
    addPerceptionHint,
    addPendingChallenge,
    setError,
    leaveDuel,
    setAbilityCooldown,
    deductAbilityEnergy,
    setPokerFaceActive,
  } = useDuelStore();

  const { currentCharacter } = useCharacterStore();

  // Track if listeners are registered
  const listenersRegistered = useRef(false);

  // ==========================================================================
  // SOCKET EVENT HANDLERS
  // ==========================================================================

  const handleStateUpdate = useCallback((state: DuelClientState) => {
    setActiveDuel(state);
  }, [setActiveDuel]);

  const handleChallengeReceived = useCallback((challenge: ChallengeNotification) => {
    addPendingChallenge(challenge);
  }, [addPendingChallenge]);

  const handleOpponentJoined = useCallback((data: { name: string }) => {
    logger.info(`Opponent joined: ${data.name}`, { context: 'useDuelSocket' });
    // Could trigger a notification or update UI
  }, []);

  const handleOpponentLeft = useCallback((data: { name: string }) => {
    logger.info(`Opponent left: ${data.name}`, { context: 'useDuelSocket' });
    // Could trigger a notification
  }, []);

  const handleGameStart = useCallback((state: DuelClientState) => {
    setActiveDuel(state);
    triggerDealAnimation();
  }, [setActiveDuel, triggerDealAnimation]);

  const handleCardsDealt = useCallback((data: { cards: Card[]; roundNumber: number }) => {
    updatePlayerHand(data.cards);
    triggerDealAnimation();
  }, [updatePlayerHand, triggerDealAnimation]);

  const handleOpponentAction = useCallback((data: { actionType: string; timestamp: number }) => {
    updateOpponentAction(data.actionType);
  }, [updateOpponentAction]);

  const handleRevealPhase = useCallback((_data: { hands: unknown }) => {
    triggerRevealAnimation();
    // The reveal data contains both hands
  }, [triggerRevealAnimation]);

  const handleRoundResult = useCallback((result: RoundResult) => {
    addRoundResult(result);
  }, [addRoundResult]);

  const handleGameComplete = useCallback((data: {
    winnerId: string;
    winnerName: string;
    finalScore: { challenger: number; challenged: number };
    rewards: any;
    isForfeit: boolean;
  }) => {
    triggerVictoryAnimation(data.winnerName, data.rewards);
  }, [triggerVictoryAnimation]);

  const handleTimeWarning = useCallback((data: { secondsRemaining: number }) => {
    logger.info(`Time warning: ${data.secondsRemaining}s remaining`, { context: 'useDuelSocket' });
    // Could play a sound or show visual warning
  }, []);

  const handlePerceptionResult = useCallback((result: PerceptionCheckResult) => {
    setPerceptionHints(result.hints);
  }, [setPerceptionHints]);

  const handleAbilityResult = useCallback((result: AbilityResultEvent) => {
    logger.info(`Ability result:`, { context: 'useDuelSocket', result });

    if (result.success) {
      // Deduct energy
      if (result.energyCost > 0) {
        deductAbilityEnergy(result.energyCost);
      }

      // Set cooldown
      if (result.newCooldown > 0) {
        setAbilityCooldown(result.ability, result.newCooldown);
      }

      // Handle poker face activation
      if (result.effect?.blockedRounds) {
        setPokerFaceActive(true, result.effect.blockedRounds);
      }

      // Add perception hints from ability
      if (result.effect?.hints) {
        result.effect.hints.forEach(hint => {
          addPerceptionHint(hint);
        });
      }
    }
  }, [deductAbilityEnergy, setAbilityCooldown, setPokerFaceActive, addPerceptionHint]);

  const handleCheatDetected = useCallback((data: CheatDetectedEvent) => {
    logger.warn(`Cheat detected:`, { context: 'useDuelSocket', data });
    // Show a notification or modal about cheating detection
    setError(data.message);
  }, [setError]);

  const handleEmote = useCallback((data: { playerId: string; emote: string }) => {
    // Handle opponent emote display
    logger.info(`Emote from ${data.playerId}: ${data.emote}`, { context: 'useDuelSocket' });
  }, []);

  const handleError = useCallback((data: { message: string; code: string }) => {
    logger.error(`Error: ${data.message} (${data.code})`, new Error(data.message), { context: 'useDuelSocket', code: data.code });
    setError(data.message);
  }, [setError]);

  // ==========================================================================
  // REGISTER/UNREGISTER LISTENERS
  // ==========================================================================

  useEffect(() => {
    if (!currentCharacter) return;

    // Don't register twice
    if (listenersRegistered.current) return;

    // Connect socket if not connected
    if (!socketService.isConnected()) {
      socketService.connect();
    }

    // Register status callback
    const unsubscribeStatus = socketService.onStatusChange((status) => {
      setConnected(status === 'connected');
      if (status === 'error') {
        setConnectionError('Connection failed');
      } else {
        setConnectionError(null);
      }
    });

    // Set initial status
    setConnected(socketService.isConnected());

    // Register event listeners (types now properly defined in shared/types/chat.types.ts)
    socketService.on('duel:state_update', handleStateUpdate);
    socketService.on('duel:challenge_received', handleChallengeReceived);
    socketService.on('duel:opponent_joined', handleOpponentJoined);
    socketService.on('duel:opponent_left', handleOpponentLeft);
    socketService.on('duel:game_start', handleGameStart);
    socketService.on('duel:cards_dealt', handleCardsDealt);
    socketService.on('duel:opponent_action', handleOpponentAction);
    socketService.on('duel:reveal_phase', handleRevealPhase);
    socketService.on('duel:round_result', handleRoundResult);
    socketService.on('duel:game_complete', handleGameComplete);
    socketService.on('duel:time_warning', handleTimeWarning);
    socketService.on('duel:perception_result', handlePerceptionResult);
    socketService.on('duel:ability_result', handleAbilityResult);
    socketService.on('duel:cheat_detected', handleCheatDetected);
    socketService.on('duel:emote', handleEmote);
    socketService.on('duel:error', handleError);

    listenersRegistered.current = true;

    // Cleanup
    return () => {
      socketService.off('duel:state_update');
      socketService.off('duel:challenge_received');
      socketService.off('duel:opponent_joined');
      socketService.off('duel:opponent_left');
      socketService.off('duel:game_start');
      socketService.off('duel:cards_dealt');
      socketService.off('duel:opponent_action');
      socketService.off('duel:reveal_phase');
      socketService.off('duel:round_result');
      socketService.off('duel:game_complete');
      socketService.off('duel:time_warning');
      socketService.off('duel:perception_result');
      socketService.off('duel:ability_result');
      socketService.off('duel:cheat_detected');
      socketService.off('duel:emote');
      socketService.off('duel:error');

      unsubscribeStatus();
      listenersRegistered.current = false;
    };
  }, [
    currentCharacter,
    setConnected,
    setConnectionError,
    handleStateUpdate,
    handleChallengeReceived,
    handleOpponentJoined,
    handleOpponentLeft,
    handleGameStart,
    handleCardsDealt,
    handleOpponentAction,
    handleRevealPhase,
    handleRoundResult,
    handleGameComplete,
    handleTimeWarning,
    handlePerceptionResult,
    handleAbilityResult,
    handleCheatDetected,
    handleEmote,
    handleError,
  ]);

  // ==========================================================================
  // EMIT ACTIONS
  // ==========================================================================

  const joinDuelRoom = useCallback((duelId: string) => {
    socketService.emit('duel:join_room', { duelId });
    useDuelStore.getState().joinDuel(duelId);
  }, []);

  const leaveDuelRoom = useCallback((duelId: string) => {
    socketService.emit('duel:leave_room', { duelId });
    leaveDuel();
  }, [leaveDuel]);

  const sendReady = useCallback((duelId: string) => {
    socketService.emit('duel:ready', { duelId });
  }, []);

  const sendHoldCards = useCallback((duelId: string, cardIndices: number[]) => {
    useDuelStore.getState().setProcessingAction(true);
    socketService.emit('duel:hold_cards', { duelId, cardIndices });
  }, []);

  const sendDraw = useCallback((duelId: string) => {
    useDuelStore.getState().setProcessingAction(true);
    socketService.emit('duel:draw', { duelId });
    useDuelStore.getState().clearSelectedCards();
  }, []);

  const sendBet = useCallback((duelId: string, action: BettingAction, amount?: number) => {
    useDuelStore.getState().setProcessingAction(true);
    socketService.emit('duel:bet', { duelId, action, amount });
  }, []);

  const sendUseAbility = useCallback((duelId: string, ability: string, targetIndex?: number) => {
    socketService.emit('duel:use_ability', { duelId, ability, targetIndex });
  }, []);

  const sendForfeit = useCallback((duelId: string) => {
    socketService.emit('duel:forfeit', { duelId });
  }, []);

  const sendEmote = useCallback((duelId: string, emote: string) => {
    socketService.emit('duel:emote', { duelId, emote });
  }, []);

  return {
    isConnected,
    connectionError,
    joinDuelRoom,
    leaveDuelRoom,
    sendReady,
    sendHoldCards,
    sendDraw,
    sendBet,
    sendUseAbility,
    sendForfeit,
    sendEmote,
  };
};

export default useDuelSocket;
