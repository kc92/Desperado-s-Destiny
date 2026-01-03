/**
 * Blackjack Actions
 * Process blackjack game actions
 */

import { Rank } from '@desperados/shared';
import { GameState, PlayerAction } from '../types';
import { drawCards } from '../deck';
import { calculateBlackjackValue } from '../combat';

/**
 * Generate card counting hint for skilled blackjack players
 */
function generateCardCountHint(state: GameState): string {
  const abilities = state.abilities;
  if (!abilities || abilities.cardCountingBonus === 0) {
    return '';
  }

  const remainingCards = state.deck.length;
  const highCards = state.deck.filter(c =>
    [Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE].includes(c.rank)
  ).length;

  const highPercent = Math.round((highCards / remainingCards) * 100);

  // More specific hints at higher skill
  if (abilities.cardCountingBonus >= 20) {
    return `Deck: ${highPercent}% high cards (${highCards}/${remainingCards})`;
  } else if (abilities.cardCountingBonus >= 10) {
    if (highPercent > 45) return 'Deck favors high cards';
    if (highPercent < 35) return 'Deck favors low cards';
    return 'Deck is balanced';
  } else {
    if (highPercent > 50) return 'Many high cards remain';
    if (highPercent < 30) return 'Few high cards remain';
    return '';
  }
}

/**
 * Process blackjack action with Vegas-style options
 *
 * PHASE 3 ENHANCEMENTS:
 * - Double Down (skill 5+): double bet, get exactly one card
 * - Insurance (skill 15+): protect against dealer blackjack
 * - Card counting hints (skill 20+): see deck composition
 */
export function processBlackjackAction(state: GameState, action: PlayerAction): GameState {
  // === STAND ===
  if (action.type === 'stand') {
    state.status = 'resolved';
    return state;
  }

  // === HIT ===
  if (action.type === 'hit') {
    const card = drawCards(state, 1)[0];
    if (!card) {
      state.status = 'resolved';
      return state;
    }

    state.hand.push(card);

    // Update card counting info
    state.cardCountInfo = generateCardCountHint(state);

    const value = calculateBlackjackValue(state.hand);
    if (value > 21) {
      state.status = 'busted';
    } else if (value === 21) {
      state.status = 'resolved';
    }

    return state;
  }

  // === DOUBLE DOWN (Skill 5+) ===
  if (action.type === 'double_down') {
    const abilities = state.abilities;
    if (!abilities?.canDoubleDown || state.isDoubledDown || state.hand.length !== 2) {
      return state; // Can't double down
    }

    // Mark as doubled down
    state.isDoubledDown = true;
    state.currentBetMultiplier = 2.0;

    // Draw exactly one card
    const card = drawCards(state, 1)[0];
    if (card) {
      state.hand.push(card);
    }

    // Update card counting info
    state.cardCountInfo = generateCardCountHint(state);

    // Resolve immediately after double down
    const value = calculateBlackjackValue(state.hand);
    if (value > 21) {
      state.status = 'busted';
    } else {
      state.status = 'resolved';
    }

    return state;
  }

  // === INSURANCE (Skill 15+) ===
  if (action.type === 'insurance') {
    const abilities = state.abilities;
    if (!abilities?.canInsurance || state.hasInsurance) {
      return state; // Can't take insurance
    }

    // Only available when dealer shows Ace
    if (state.dealerUpCard?.rank !== Rank.ACE) {
      return state;
    }

    state.hasInsurance = true;
    // Insurance pays 2:1 if dealer has blackjack
    // This is resolved in the resolution phase

    return state;
  }

  return state;
}

// Export the card count hint generator for use in resolvers
export { generateCardCountHint };
