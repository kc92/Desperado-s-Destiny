/**
 * Poker Resolver
 * Resolve poker hold/draw games
 */

import { GameState, GameResult } from '../types';
import { POKER_THRESHOLDS } from '../constants';
import { evaluatePokerHand } from '../deck';
import { calculateSkillModifiers } from '../skills';

/**
 * Resolve poker game with Phase 3 enhancements
 * - Early finish speed bonus
 * - Ability usage tracking
 * - Enhanced feedback
 */
export function resolvePokerGame(
  state: GameState,
  suitMatches: number,
  suitBonus: { multiplier: number; specialEffect?: string }
): GameResult {
  const { handName, score } = evaluatePokerHand(state.hand);
  const baseThreshold = POKER_THRESHOLDS[state.difficulty] || 200;

  // SKILL MODIFIERS
  const modifiers = calculateSkillModifiers(state.characterSuitBonus || 0, state.difficulty);

  // Lower threshold = easier to succeed
  const adjustedThreshold = Math.max(50, baseThreshold - modifiers.thresholdReduction);

  // Add skill bonus to score + early finish bonus
  const earlyBonus = state.earlyFinishBonus || 0;
  const adjustedScore = score + modifiers.cardBonus + earlyBonus;

  const success = adjustedScore >= adjustedThreshold;

  // Build detailed feedback
  const feedbackParts: string[] = [];

  if (modifiers.cardBonus > 0) {
    feedbackParts.push(`Skill +${modifiers.cardBonus}`);
  }

  if (earlyBonus > 0) {
    feedbackParts.push(`Speed +${earlyBonus}`);
  }

  if (state.rerollsUsed && state.rerollsUsed > 0) {
    feedbackParts.push(`${state.rerollsUsed} reroll${state.rerollsUsed > 1 ? 's' : ''}`);
  }

  if (state.peeksUsed && state.peeksUsed > 0) {
    feedbackParts.push(`${state.peeksUsed} peek${state.peeksUsed > 1 ? 's' : ''}`);
  }

  const feedbackStr = feedbackParts.length > 0 ? ` (${feedbackParts.join(', ')})` : '';

  // Special effect for early finish
  const specialEffect = earlyBonus > 0
    ? `Speed Bonus! +${earlyBonus}`
    : suitBonus.specialEffect;

  return {
    success,
    score: adjustedScore,
    handName: handName + feedbackStr,
    suitMatches,
    suitBonus: { ...suitBonus, specialEffect },
    mitigation: success ? undefined : { damageReduction: Math.min(0.5, suitMatches * 0.1) }
  };
}
