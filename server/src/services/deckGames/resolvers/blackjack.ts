/**
 * Blackjack Resolver
 * Resolve blackjack games
 */

import { Rank } from '@desperados/shared';
import { GameState, GameResult } from '../types';
import { BLACKJACK_TARGETS } from '../constants';
import { calculateBlackjackValue } from '../combat';
import { calculateSkillModifiers } from '../skills';

/**
 * Resolve blackjack game with Phase 3 Vegas-style options
 * - Double down multiplier
 * - Insurance payout
 * - Card counting feedback
 */
export function resolveBlackjackGame(
  state: GameState,
  suitMatches: number,
  suitBonus: { multiplier: number; specialEffect?: string }
): GameResult {
  const value = calculateBlackjackValue(state.hand);
  const modifiers = calculateSkillModifiers(state.characterSuitBonus || 0, state.difficulty);

  // Double down bet multiplier
  const betMultiplier = state.currentBetMultiplier || 1.0;

  // === BUSTED ===
  if (state.status === 'busted' || value > 21) {
    const baseMitigation = Math.min(0.3, suitMatches * 0.1);
    const skillMitigation = modifiers.thresholdReduction * 0.005;

    // Double down bust = double the pain
    const handName = state.isDoubledDown
      ? `DOUBLE DOWN BUST! (Lost 2x)`
      : 'Bust';

    return {
      success: false,
      score: 0,
      handName,
      suitMatches,
      suitBonus: { ...suitBonus, specialEffect: state.isDoubledDown ? 'Risky Move!' : undefined },
      mitigation: { damageReduction: Math.min(0.5, baseMitigation + skillMitigation) }
    };
  }

  const baseTarget = BLACKJACK_TARGETS[state.difficulty] || 18;
  const adjustedTarget = Math.max(12, baseTarget - Math.floor(modifiers.thresholdReduction * 0.3));
  const success = value >= adjustedTarget;

  // Build feedback
  const feedbackParts: string[] = [];

  if (state.isDoubledDown) {
    feedbackParts.push('2x Bet');
  }

  if (state.hasInsurance) {
    // Check if dealer has blackjack (simulate)
    const dealerValue = state.dealerUpCard ?
      (state.dealerUpCard.rank === Rank.ACE ? 11 :
       [Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING].includes(state.dealerUpCard.rank) ? 10 :
       state.dealerUpCard.rank as number) : 0;

    // Dealer blackjack = insurance pays 2:1
    if (dealerValue >= 10) {
      feedbackParts.push('Insurance Paid');
    }
  }

  if (state.cardCountInfo && state.cardCountInfo.length > 0) {
    feedbackParts.push(`Count: ${state.cardCountInfo}`);
  }

  const feedbackStr = feedbackParts.length > 0 ? ` (${feedbackParts.join(', ')})` : '';

  // Calculate final score with bet multiplier
  const baseScore = value * 10;
  const finalScore = Math.round(baseScore * betMultiplier);

  // Hand name
  let handName = `${value}`;
  if (value === 21 && state.hand.length === 2) {
    handName = 'BLACKJACK!';
    if (state.isDoubledDown) {
      handName += ' (Cannot DD on Blackjack)';
    }
  } else if (state.isDoubledDown && success) {
    handName = `${value} - DOUBLE DOWN WIN!`;
  }

  handName += feedbackStr;

  // Special effect
  let specialEffect = suitBonus.specialEffect;
  if (state.isDoubledDown && success) {
    specialEffect = 'Double Down Success! 2x Rewards!';
  } else if (value === 21 && state.hand.length === 2) {
    specialEffect = 'Natural Blackjack!';
  }

  return {
    success,
    score: finalScore,
    handName,
    suitMatches,
    suitBonus: { ...suitBonus, specialEffect },
    mitigation: success ? undefined : { damageReduction: Math.min(0.4, suitMatches * 0.1) }
  };
}
