/**
 * Press Your Luck Resolver
 * Resolve press your luck games
 */

import { Rank } from '@desperados/shared';
import { GameState, GameResult } from '../types';
import { calculateSkillModifiers } from '../skills';

/**
 * Resolve Press Your Luck game with Phase 3 enhancements
 * - Streak multiplier bonus
 * - Double down 2x multiplier
 * - Safe draw tracking
 * - Enhanced feedback
 */
export function resolvePressYourLuckGame(
  state: GameState,
  suitMatches: number,
  suitBonus: { multiplier: number; specialEffect?: string }
): GameResult {
  const dangerCount = state.dangerCount || 0;
  const modifiers = calculateSkillModifiers(state.characterSuitBonus || 0, state.difficulty);

  // === BUSTED ===
  if (state.status === 'busted') {
    const baseMitigation = Math.min(0.3, suitMatches * 0.1);
    const skillMitigation = modifiers.dangerAvoidChance * 0.3;

    // If double-downed, lose everything
    const wasDDing = state.isDoubleDownPYL;

    return {
      success: false,
      score: 0,
      handName: wasDDing
        ? `DOUBLE DOWN BUST! Lost ${state.accumulatedScore || 0} points!`
        : `BUSTED! ${state.hand.length} Cards (${dangerCount} Danger)`,
      suitMatches,
      suitBonus: { ...suitBonus, specialEffect: wasDDing ? 'Risk Failed!' : 'Caught!' },
      mitigation: { damageReduction: Math.min(0.5, baseMitigation + skillMitigation) }
    };
  }

  // === SUCCESS ===
  const safeCards = state.hand.filter(c =>
    ![Rank.JACK, Rank.QUEEN, Rank.KING].includes(c.rank)
  ).length;

  // Base score + skill bonus
  const baseScore = safeCards * 50;
  const skillBonusScore = modifiers.cardBonus * 5;
  let score = baseScore + skillBonusScore;

  // Calculate tier multiplier
  // PRODUCTION FIX: Round to avoid floating point precision issues
  const skillBonus = Math.round((state.characterSuitBonus || 0) * 0.02 * 100) / 100;
  const effectiveCards = Math.round((state.hand.length + (suitMatches * 0.5) + skillBonus) * 100) / 100;
  let tierMultiplier = 0.5;
  let tierName = 'Cautious';

  if (effectiveCards >= 7) {
    tierMultiplier = 2.0;
    tierName = 'Daring Heist';
  } else if (effectiveCards >= 5) {
    tierMultiplier = 1.5;
    tierName = 'Bold Move';
  } else if (effectiveCards >= 3) {
    tierMultiplier = 1.0;
    tierName = 'Balanced';
  }

  // Apply streak multiplier
  const streakMult = state.streakMultiplier || 1.0;
  if (streakMult > 1.0) {
    tierName += ` + ${Math.round((streakMult - 1) * 100)}% Streak`;
  }

  // Apply double-down multiplier (if active and successful)
  const ddMultiplier = state.isDoubleDownPYL ? 2.0 : 1.0;
  if (state.isDoubleDownPYL) {
    tierName = 'DOUBLE DOWN WIN! ' + tierName;
  }

  // Final score calculation
  const finalScore = Math.round(score * tierMultiplier * streakMult * ddMultiplier * suitBonus.multiplier);

  // Build feedback
  const feedbackParts: string[] = [];
  if (state.safeDrawsUsed && state.safeDrawsUsed > 0) {
    feedbackParts.push(`${state.safeDrawsUsed} safe draw${state.safeDrawsUsed > 1 ? 's' : ''}`);
  }
  if (state.consecutiveSafeDraws && state.consecutiveSafeDraws >= 3) {
    feedbackParts.push(`${state.consecutiveSafeDraws} streak`);
  }
  if (state.dangerMeter) {
    feedbackParts.push(`${state.dangerMeter}% risk`);
  }

  const feedbackStr = feedbackParts.length > 0 ? ` | ${feedbackParts.join(', ')}` : '';

  return {
    success: true,
    score: finalScore,
    handName: `${state.hand.length} Cards (${dangerCount} Danger)${feedbackStr}`,
    suitMatches,
    suitBonus: { ...suitBonus, specialEffect: tierName },
    mitigation: undefined
  };
}
