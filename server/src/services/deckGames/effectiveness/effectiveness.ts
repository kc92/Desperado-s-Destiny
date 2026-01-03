/**
 * Effectiveness System V2
 * Unified effectiveness calculation using the formula:
 * Final Effectiveness = baseHandValue * suitMultiplier * (1 + skillBoostPercent/100)
 */

import {
  Card,
  HandRank,
  EffectivenessResult,
  EffectivenessBreakdown,
  Suit as DestinySuit,
  SUIT_MULTIPLIER,
  SKILL_BOOST,
  EFFECTIVENESS_CAPS,
  getSuitMultiplier,
  getHandBaseValue,
  getSkillBoostMultiplier
} from '@desperados/shared';
import { countSuitMatches } from '../deck/pokerHand';

/**
 * Map hand name string to HandRank enum
 */
function handNameToRank(handName: string): HandRank {
  const mapping: Record<string, HandRank> = {
    'Royal Flush': HandRank.ROYAL_FLUSH,
    'Straight Flush': HandRank.STRAIGHT_FLUSH,
    'Four of a Kind': HandRank.FOUR_OF_A_KIND,
    'Full House': HandRank.FULL_HOUSE,
    'Flush': HandRank.FLUSH,
    'Straight': HandRank.STRAIGHT,
    'Three of a Kind': HandRank.THREE_OF_A_KIND,
    'Two Pair': HandRank.TWO_PAIR,
    'One Pair': HandRank.PAIR,
    'Pair': HandRank.PAIR,
    'High Card': HandRank.HIGH_CARD
  };
  return mapping[handName] ?? HandRank.HIGH_CARD;
}

/**
 * Calculate average skill level for a given suit
 * @param characterSuitBonus Total skill bonus
 * @param skillCount Number of skills per category (default 5)
 * @returns Average skill level for matching skills
 */
function getAverageSkillLevelForSuit(
  characterSuitBonus: number,
  skillCount: number = 5
): number {
  if (skillCount <= 0) return 0;
  return characterSuitBonus / skillCount;
}

/**
 * Calculate effectiveness using the new V2 formula
 * This is the main function for the new system
 *
 * @param hand The cards in the player's hand
 * @param handName The evaluated poker hand name
 * @param relevantSuit The suit that matters for this action
 * @param characterSuitBonus Total skill bonus for the relevant suit
 * @returns EffectivenessResult with full breakdown
 */
export function calculateEffectivenessV2(
  hand: Card[],
  handName: string,
  relevantSuit: string | undefined,
  characterSuitBonus: number = 0
): EffectivenessResult {
  // Step 1: Get base value from hand rank
  const handRank = handNameToRank(handName);
  const baseValue = getHandBaseValue(handRank);

  // Step 2: Count suit matches and calculate multiplier
  const suitMatches = countSuitMatches(hand, relevantSuit);
  const suitMultiplier = getSuitMultiplier(suitMatches);

  // Step 3: Calculate skill boost (using average of ~5 skills per category)
  const avgSkillLevel = getAverageSkillLevelForSuit(characterSuitBonus, 5);
  const skillBoostPercent = Math.min(avgSkillLevel, SKILL_BOOST.MAX_PERCENT);
  const skillMultiplier = getSkillBoostMultiplier(skillBoostPercent);

  // Step 4: Calculate final effectiveness
  const rawEffectiveness = baseValue * suitMultiplier * skillMultiplier;
  const effectiveness = Math.round(rawEffectiveness);

  // Build the breakdown for UI display
  const breakdown: EffectivenessBreakdown = {
    handName,
    baseValue,
    suitMatches,
    suitMultiplier,
    skillBoostPercent,
    skillMultiplier,
    relevantSuit: relevantSuit?.toUpperCase() as DestinySuit | undefined
  };

  return {
    effectiveness,
    breakdown
  };
}

/**
 * Convert effectiveness to damage for combat
 * Applies combat damage cap
 */
export function effectivenessToDamage(effectiveness: number): number {
  return Math.min(effectiveness, EFFECTIVENESS_CAPS.COMBAT_DAMAGE);
}

/**
 * Convert effectiveness to gold reward multiplier for jobs
 * Uses the reward baseline for scaling
 */
export function effectivenessToGoldMultiplier(effectiveness: number): number {
  const multiplier = effectiveness / EFFECTIVENESS_CAPS.REWARD_BASELINE;
  return Math.min(multiplier, EFFECTIVENESS_CAPS.JOB_GOLD_MULTIPLIER);
}

/**
 * Calculate hybrid rewards using effectiveness
 * Suits affect BOTH effectiveness (gold) AND XP
 */
export function calculateHybridRewards(
  effectiveness: number,
  suitMatches: number,
  baseGold: number,
  baseXP: number
): { gold: number; xp: number } {
  // Gold scales with effectiveness
  const goldMultiplier = effectivenessToGoldMultiplier(effectiveness);
  const gold = Math.round(baseGold * goldMultiplier);

  // XP scales with suit matches (+10% per match, matching new suit system)
  const xpMultiplier = 1 + (suitMatches * SUIT_MULTIPLIER.PER_CARD);
  const xp = Math.round(baseXP * xpMultiplier);

  return { gold, xp };
}

/**
 * Get special effect message based on effectiveness
 */
export function getEffectivenessSpecialEffect(
  effectiveness: number,
  suitMatches: number
): string | undefined {
  if (effectiveness >= 400 && suitMatches >= 4) {
    return 'Devastating Strike!';
  } else if (effectiveness >= 300) {
    return 'Powerful Hit!';
  } else if (suitMatches >= 5) {
    return 'Perfect Suit Mastery!';
  } else if (suitMatches >= 4) {
    return 'Excellent Suit Alignment';
  } else if (suitMatches >= 3) {
    return 'Strong Suit Bonus';
  }
  return undefined;
}
