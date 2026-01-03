/**
 * Available Actions
 * Get available actions for current game state
 */

import { Rank } from '@desperados/shared';
import { GameState } from '../types';
import { calculateBlackjackValue } from '../combat';

/**
 * Get available actions for current game state
 * PHASE 3: Now includes skill-unlocked special abilities
 */
export function getAvailableActions(state: GameState): string[] {
  if (state.status === 'resolved' || state.status === 'busted') {
    return [];
  }

  const abilities = state.abilities;

  // Phase 5: Check if bail-out is available for any game type
  const addBailOutIfAvailable = (actions: string[]) => {
    if (state.canBailOut && state.bailOutValue && state.bailOutValue > 0) {
      actions.push('bail_out');
    }
    return actions;
  };

  switch (state.gameType) {
    case 'pokerHoldDraw': {
      const actions: string[] = [];
      const round = state.currentRound || 1;
      const maxRounds = state.maxRounds || 3;

      // Base actions
      if (round === 1 && state.hand.length === 0) {
        return ['draw']; // Initial draw
      }

      // During rounds: hold cards, then draw
      actions.push('hold', 'draw');

      // Early finish - always available after round 1
      if (round > 1 && abilities?.canEarlyFinish) {
        actions.push('early_finish');
      }

      // Reroll - if available and not all used
      if (abilities && abilities.rerollsAvailable > (state.rerollsUsed || 0)) {
        actions.push('reroll');
      }

      // Peek - if available and not all used
      if (abilities && abilities.peeksAvailable > (state.peeksUsed || 0) && !state.peekedCard) {
        actions.push('peek');
      }

      return addBailOutIfAvailable(actions);
    }

    case 'pressYourLuck': {
      const actions: string[] = [];

      if (state.hand.length === 0) {
        return ['draw'];
      }

      if (state.hand.length >= state.maxTurns) {
        return ['stop'];
      }

      // Base actions
      actions.push('draw', 'stop');

      // Safe draw - skill 10+, costs gold
      if (abilities?.canSafeDraw && (state.safeDrawsUsed || 0) < 2) {
        actions.push('safe_draw');
      }

      // Double down - skill 25+, risk all for 2x
      if (abilities?.canDoubleDownPYL && !state.isDoubleDownPYL && state.hand.length >= 2) {
        actions.push('double_down');
      }

      return addBailOutIfAvailable(actions);
    }

    case 'blackjack': {
      const value = calculateBlackjackValue(state.hand);

      if (value >= 21) return [];
      if (state.hand.length < 2) return ['hit'];

      const actions: string[] = ['hit', 'stand'];

      // Double down - skill 5+, only on first decision (2 cards)
      if (abilities?.canDoubleDown && state.hand.length === 2 && !state.isDoubledDown) {
        actions.push('double_down');
      }

      // Insurance - skill 15+, only when dealer shows Ace
      if (abilities?.canInsurance &&
          state.dealerUpCard?.rank === Rank.ACE &&
          !state.hasInsurance &&
          state.hand.length === 2) {
        actions.push('insurance');
      }

      return addBailOutIfAvailable(actions);
    }

    case 'deckbuilder': {
      const actions: string[] = [];
      if (state.hand.length >= state.maxTurns) return ['stop'];
      if (state.hand.length === 0) return ['draw'];
      actions.push('draw', 'stop');
      return addBailOutIfAvailable(actions);
    }

    case 'combatDuel': {
      const actions: string[] = [];

      // Card selection actions (always available during combat)
      actions.push('select_attack', 'select_defense', 'execute_turn');

      // Flee - only in first 3 rounds
      if (state.canFlee && (state.combatRound || 1) <= 3) {
        actions.push('flee');
      }

      return addBailOutIfAvailable(actions);
    }

    default:
      return [];
  }
}
