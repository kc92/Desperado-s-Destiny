/**
 * Poker Actions
 * Process poker hold/draw actions
 */

import { SecureRNG } from '../../base/SecureRNG';
import { GameState, PlayerAction } from '../types';
import { drawCards } from '../deck';

/**
 * Process poker action with multi-round support and special abilities
 *
 * PHASE 3 ENHANCEMENTS:
 * - 3 rounds instead of 1
 * - Reroll ability (skill 30+): redraw a single card
 * - Peek ability (skill 50+): see next card before deciding
 * - Early finish: end game early for speed bonus
 */
export function processPokerAction(state: GameState, action: PlayerAction): GameState {
  const maxRounds = state.maxRounds || 3;
  const currentRound = state.currentRound || 1;

  // === HOLD ===
  if (action.type === 'hold') {
    const indices = action.cardIndices || [];

    // Validate indices: must be integers within hand bounds
    const validIndices = indices.filter(i =>
      Number.isInteger(i) && i >= 0 && i < state.hand.length
    );

    // Remove duplicates
    state.heldCards = [...new Set(validIndices)];
    return state;
  }

  // === DRAW ===
  if (action.type === 'draw') {
    // Discard non-held cards and draw new ones
    const heldIndices = state.heldCards || [];
    const keptCards = state.hand.filter((_, i) => heldIndices.includes(i));
    const discardedCards = state.hand.filter((_, i) => !heldIndices.includes(i));

    state.discarded.push(...discardedCards);
    const newCards = drawCards(state, 5 - keptCards.length);
    state.hand = [...keptCards, ...newCards];
    state.heldCards = [];

    // Clear peeked card after draw
    state.peekedCard = null;

    // Advance round
    state.currentRound = currentRound + 1;
    state.turnNumber++;

    // Check if game is complete
    if ((state.currentRound || 1) >= maxRounds) {
      state.status = 'resolved';
    }

    return state;
  }

  // === REROLL (Skill 30+) ===
  if (action.type === 'reroll') {
    const abilities = state.abilities;
    if (!abilities || abilities.rerollsAvailable <= (state.rerollsUsed || 0)) {
      return state; // Can't reroll
    }

    // Reroll specific cards (or random if not specified)
    const indicesToReroll = action.cardIndices || [SecureRNG.range(0, state.hand.length - 1)];

    indicesToReroll.forEach(idx => {
      if (idx >= 0 && idx < state.hand.length && state.deck.length > 0) {
        const oldCard = state.hand[idx];
        state.discarded.push(oldCard);
        state.hand[idx] = drawCards(state, 1)[0];
      }
    });

    state.rerollsUsed = (state.rerollsUsed || 0) + 1;
    return state;
  }

  // === PEEK (Skill 50+) ===
  if (action.type === 'peek') {
    const abilities = state.abilities;
    if (!abilities || abilities.peeksAvailable <= (state.peeksUsed || 0)) {
      return state; // Can't peek
    }

    if (state.deck.length > 0) {
      // Show the next card without removing it from deck
      state.peekedCard = state.deck[state.deck.length - 1];
      state.peeksUsed = (state.peeksUsed || 0) + 1;
    }

    return state;
  }

  // === EARLY FINISH ===
  if (action.type === 'early_finish') {
    // Calculate speed bonus based on rounds saved
    const roundsSaved = maxRounds - currentRound;
    state.earlyFinishBonus = roundsSaved * 25; // 25 points per round saved
    state.status = 'resolved';
    return state;
  }

  return state;
}
