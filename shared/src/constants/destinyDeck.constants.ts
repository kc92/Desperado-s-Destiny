/**
 * Destiny Deck Effectiveness System Constants
 *
 * New unified effectiveness formula:
 * Final Effectiveness = baseHandValue * suitMultiplier * (1 + skillBoostPercent/100)
 *
 * This replaces the old score-based system with a more intuitive
 * damage/effectiveness model where suits directly impact power.
 */

import { HandRank } from '../types/destinyDeck.types';

/**
 * Base effectiveness values for each poker hand rank
 * These are the foundation of the damage/effectiveness calculation
 *
 * Linear scale from 50 (High Card) to 500 (Royal Flush)
 */
export const HAND_BASE_VALUES: Record<HandRank, number> = {
  [HandRank.HIGH_CARD]: 50,
  [HandRank.PAIR]: 75,
  [HandRank.TWO_PAIR]: 100,
  [HandRank.THREE_OF_A_KIND]: 125,
  [HandRank.STRAIGHT]: 150,
  [HandRank.FLUSH]: 175,
  [HandRank.FULL_HOUSE]: 200,
  [HandRank.FOUR_OF_A_KIND]: 250,
  [HandRank.STRAIGHT_FLUSH]: 300,
  [HandRank.ROYAL_FLUSH]: 500
} as const;

/**
 * Suit multiplier configuration
 * Each matching suit card adds +10% to effectiveness
 */
export const SUIT_MULTIPLIER = {
  /** Bonus per matching suit card (10% = 0.10) */
  PER_CARD: 0.10,

  /** Maximum multiplier (5 cards = 1.5x) */
  MAX: 1.5,

  /** Minimum multiplier (0 cards = 1.0x) */
  MIN: 1.0
} as const;

/**
 * Skill boost configuration
 * Character skill levels provide percentage boost to effectiveness
 */
export const SKILL_BOOST = {
  /** Maximum skill boost percentage (50% cap) */
  MAX_PERCENT: 50,

  /** Skill boost applies to average of matching suit skills */
  USE_AVERAGE: true
} as const;

/**
 * Effectiveness caps to prevent balance issues
 */
export const EFFECTIVENESS_CAPS = {
  /** Maximum damage per combat turn */
  COMBAT_DAMAGE: 300,

  /** Maximum gold reward multiplier for jobs */
  JOB_GOLD_MULTIPLIER: 2.0,

  /** Baseline effectiveness for reward scaling (100% = 200 effectiveness) */
  REWARD_BASELINE: 200
} as const;

/**
 * Action type to reward calculation mapping
 */
export const EFFECTIVENESS_TO_REWARDS = {
  /** Combat: effectiveness = raw damage dealt */
  COMBAT: {
    type: 'damage',
    formula: 'effectiveness'
  },

  /** Jobs: gold = baseGold * (effectiveness / baseline) */
  JOB: {
    type: 'gold_multiplier',
    formula: 'effectiveness / REWARD_BASELINE'
  },

  /** Crimes: effectiveness determines success threshold and loot */
  CRIME: {
    type: 'threshold_and_loot',
    formula: 'effectiveness >= threshold ? success : fail'
  },

  /** Social: effectiveness = influence/persuasion power */
  SOCIAL: {
    type: 'influence',
    formula: 'effectiveness / 5'
  }
} as const;

/**
 * Helper function to calculate suit multiplier from matching cards
 * @param matchingCards Number of cards matching the relevant suit (0-5)
 * @returns Multiplier value (1.0 to 1.5)
 */
export function getSuitMultiplier(matchingCards: number): number {
  const clamped = Math.max(0, Math.min(5, matchingCards));
  return SUIT_MULTIPLIER.MIN + (clamped * SUIT_MULTIPLIER.PER_CARD);
}

/**
 * Helper function to get base value for a hand rank
 * @param handRank The poker hand rank
 * @returns Base effectiveness value
 */
export function getHandBaseValue(handRank: HandRank): number {
  return HAND_BASE_VALUES[handRank] ?? HAND_BASE_VALUES[HandRank.HIGH_CARD];
}

/**
 * Helper function to calculate skill boost multiplier
 * @param skillLevel The average level of matching suit skills
 * @returns Multiplier value (1.0 to 1.5)
 */
export function getSkillBoostMultiplier(skillLevel: number): number {
  const cappedLevel = Math.min(skillLevel, SKILL_BOOST.MAX_PERCENT);
  return 1 + (cappedLevel / 100);
}

/**
 * Calculate final effectiveness using the new formula
 * @param handRank The poker hand rank
 * @param matchingCards Number of matching suit cards (0-5)
 * @param skillLevel Average skill level for the relevant suit
 * @returns Final effectiveness value
 */
export function calculateEffectiveness(
  handRank: HandRank,
  matchingCards: number,
  skillLevel: number
): number {
  const baseValue = getHandBaseValue(handRank);
  const suitMultiplier = getSuitMultiplier(matchingCards);
  const skillMultiplier = getSkillBoostMultiplier(skillLevel);

  return Math.round(baseValue * suitMultiplier * skillMultiplier);
}
