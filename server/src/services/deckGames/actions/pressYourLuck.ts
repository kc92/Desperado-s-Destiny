/**
 * Press Your Luck Actions
 * Process press your luck game actions
 */

import { Rank } from '@desperados/shared';
import { SecureRNG } from '../../base/SecureRNG';
import { GameState, PlayerAction } from '../types';
import { drawCards } from '../deck';
import { calculateSkillModifiers } from '../skills';

/**
 * Calculate danger meter for Press Your Luck
 * Shows probability of drawing a danger card (J, Q, K)
 */
function calculateDangerMeter(state: GameState): number {
  const remainingCards = state.deck.length;
  if (remainingCards === 0) return 0;

  // Count danger cards remaining in deck
  const dangerCards = state.deck.filter(c =>
    [Rank.JACK, Rank.QUEEN, Rank.KING].includes(c.rank)
  ).length;

  // Raw probability as percentage
  const rawProbability = (dangerCards / remainingCards) * 100;

  // Account for danger avoidance from skills
  const modifiers = calculateSkillModifiers(state.characterSuitBonus || 0, state.difficulty);
  const adjustedProbability = rawProbability * (1 - modifiers.dangerAvoidChance);

  return Math.round(adjustedProbability);
}

/**
 * Process Press Your Luck action with enhanced mechanics
 *
 * PHASE 3 ENHANCEMENTS:
 * - Safe Draw (skill 10+): pay gold for guaranteed safe card
 * - Double Down (skill 25+): risk current score for 2x multiplier
 * - Streak tracking: consecutive safe draws give bonus
 * - Danger meter: shows bust probability
 */
export function processPressYourLuckAction(state: GameState, action: PlayerAction): GameState {
  // === STOP ===
  if (action.type === 'stop') {
    state.status = 'resolved';
    return state;
  }

  // === REGULAR DRAW ===
  if (action.type === 'draw') {
    const card = drawCards(state, 1)[0];
    if (!card) {
      state.status = 'resolved';
      return state;
    }

    state.hand.push(card);

    // Check for danger cards (J, Q, K)
    if ([Rank.JACK, Rank.QUEEN, Rank.KING].includes(card.rank)) {
      // SKILL MODIFIER: Chance to avoid danger
      const modifiers = calculateSkillModifiers(state.characterSuitBonus || 0, state.difficulty);

      if (SecureRNG.chance(modifiers.dangerAvoidChance)) {
        // Avoided danger - track for streak
        state.consecutiveSafeDraws = (state.consecutiveSafeDraws || 0) + 1;
      } else {
        // Danger counted - reset streak
        state.dangerCount = (state.dangerCount || 0) + 1;
        state.consecutiveSafeDraws = 0;
      }
    } else {
      // Safe card - build streak
      state.consecutiveSafeDraws = (state.consecutiveSafeDraws || 0) + 1;
    }

    // Update streak multiplier (3+ safe draws = bonus)
    const streak = state.consecutiveSafeDraws || 0;
    if (streak >= 5) {
      state.streakMultiplier = 1.5;
    } else if (streak >= 3) {
      state.streakMultiplier = 1.25;
    } else {
      state.streakMultiplier = 1.0;
    }

    // Update danger meter
    state.dangerMeter = calculateDangerMeter(state);

    // Bust on 3 danger cards
    if ((state.dangerCount || 0) >= 3) {
      state.status = 'busted';
    } else if (state.hand.length >= state.maxTurns) {
      state.status = 'resolved';
    }

    return state;
  }

  // === SAFE DRAW (Skill 10+) ===
  if (action.type === 'safe_draw') {
    const abilities = state.abilities;
    if (!abilities?.canSafeDraw || (state.safeDrawsUsed || 0) >= 2) {
      return state; // Can't safe draw
    }

    // Find a safe card (not J, Q, K) in the deck
    const safeCardIndex = state.deck.findIndex(c =>
      ![Rank.JACK, Rank.QUEEN, Rank.KING].includes(c.rank)
    );

    if (safeCardIndex === -1) {
      // No safe cards left - normal draw
      return processPressYourLuckAction(state, { type: 'draw' });
    }

    // Remove the safe card and add to hand
    const [safeCard] = state.deck.splice(safeCardIndex, 1);
    state.hand.push(safeCard);

    // Track safe draw usage
    state.safeDrawsUsed = (state.safeDrawsUsed || 0) + 1;

    // Build streak
    state.consecutiveSafeDraws = (state.consecutiveSafeDraws || 0) + 1;

    // Update streak multiplier
    const streak = state.consecutiveSafeDraws || 0;
    if (streak >= 5) {
      state.streakMultiplier = 1.5;
    } else if (streak >= 3) {
      state.streakMultiplier = 1.25;
    }

    // Update danger meter
    state.dangerMeter = calculateDangerMeter(state);

    if (state.hand.length >= state.maxTurns) {
      state.status = 'resolved';
    }

    return state;
  }

  // === DOUBLE DOWN (Skill 25+) ===
  if (action.type === 'double_down') {
    const abilities = state.abilities;
    if (!abilities?.canDoubleDownPYL || state.isDoubleDownPYL) {
      return state; // Can't double down
    }

    // Store current accumulated score before risk
    const safeCards = state.hand.filter(c =>
      ![Rank.JACK, Rank.QUEEN, Rank.KING].includes(c.rank)
    ).length;
    state.accumulatedScore = safeCards * 50;

    // Activate double down mode
    state.isDoubleDownPYL = true;

    return state;
  }

  return state;
}
