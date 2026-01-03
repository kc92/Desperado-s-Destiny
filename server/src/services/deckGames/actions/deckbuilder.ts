/**
 * Deckbuilder Actions
 * Process deckbuilder game actions
 */

import { GameState, PlayerAction } from '../types';
import { drawCards } from '../deck';

/**
 * Process deckbuilder action
 * Simple draw or stop mechanics
 */
export function processDeckbuilderAction(state: GameState, action: PlayerAction): GameState {
  if (action.type === 'stop') {
    state.status = 'resolved';
    return state;
  }

  if (action.type === 'draw') {
    const card = drawCards(state, 1)[0];
    if (!card) {
      state.status = 'resolved';
      return state;
    }

    state.hand.push(card);

    if (state.hand.length >= state.maxTurns) {
      state.status = 'resolved';
    }
  }

  return state;
}
