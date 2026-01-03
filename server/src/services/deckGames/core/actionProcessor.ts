/**
 * Action Processor
 * Process player actions in deck games
 */

import { GameState, PlayerAction } from '../types';
import {
  processPokerAction,
  processPressYourLuckAction,
  processBlackjackAction,
  processDeckbuilderAction,
  processCombatDuelAction
} from '../actions';

/**
 * Process a player action
 */
export function processAction(state: GameState, action: PlayerAction): GameState {
  const newState = { ...state };

  switch (state.gameType) {
    case 'pokerHoldDraw':
      return processPokerAction(newState, action);
    case 'pressYourLuck':
      return processPressYourLuckAction(newState, action);
    case 'blackjack':
      return processBlackjackAction(newState, action);
    case 'deckbuilder':
      return processDeckbuilderAction(newState, action);
    case 'combatDuel':
      return processCombatDuelAction(newState, action);
    default:
      return newState;
  }
}
