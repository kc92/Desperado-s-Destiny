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

  // Check if dealer has blackjack (for insurance payout)
  // Dealer blackjack = Ace showing + 10-value hole card (simulated with ~30% chance when Ace shows)
  const dealerShowsAce = state.dealerUpCard?.rank === Rank.ACE;
  const dealerHasBlackjack = dealerShowsAce && Math.random() < 0.31; // ~31% chance (4 tens in 13 cards)

  // Build feedback
  const feedbackParts: string[] = [];

  if (state.isDoubledDown) {
    feedbackParts.push('2x Bet');
  }

  // Handle insurance payout
  let insurancePaid = false;
  if (state.hasInsurance) {
    if (dealerHasBlackjack) {
      feedbackParts.push('Insurance Paid 2:1!');
      insurancePaid = true;
    } else {
      feedbackParts.push('Insurance Lost');
    }
  }

  if (state.cardCountInfo && state.cardCountInfo.length > 0) {
    feedbackParts.push(`Count: ${state.cardCountInfo}`);
  }

  const feedbackStr = feedbackParts.length > 0 ? ` (${feedbackParts.join(', ')})` : '';

  // Calculate final score with bet multiplier
  const baseScore = value * 10;
  let finalScore = Math.round(baseScore * betMultiplier);

  // Insurance payout: if dealer has blackjack, player with insurance breaks even
  // In game terms: restore half the score (insurance covers the loss)
  if (insurancePaid && !success) {
    finalScore = Math.round(baseScore * 0.5); // Break even on insurance
  }

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
  if (insurancePaid) {
    specialEffect = 'Insurance Paid! Dealer had Blackjack.';
  } else if (state.isDoubledDown && success) {
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
