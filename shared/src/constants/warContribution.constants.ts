/**
 * War Contribution Constants
 *
 * Phase 2.4: Point values, category weights, bonuses, and reward tiers
 * for the war contribution tracking system.
 */

import { WarContributionType, WarContributionCategory } from '../types/warContribution.types';

/**
 * Point values for each contribution type
 * Some types use multipliers (per unit) rather than flat values
 */
export const WAR_CONTRIBUTION_POINT_VALUES: Record<WarContributionType, number> = {
  // Combat contributions
  [WarContributionType.DECK_GAME_WIN]: 10,
  [WarContributionType.DECK_GAME_LOSS]: 2,           // Effort points for participating
  [WarContributionType.CHAMPION_DUEL_WIN]: 25,
  [WarContributionType.LEADER_SHOWDOWN_WIN]: 50,
  [WarContributionType.DAMAGE_DEALT]: 0.01,          // Per 1 damage dealt

  // Raid contributions
  [WarContributionType.RAID_PARTICIPATED]: 5,
  [WarContributionType.RAID_LED]: 15,
  [WarContributionType.RAID_DEFENDED]: 10,
  [WarContributionType.PROPERTY_DAMAGED]: 0.3,       // Per 1% damage caused

  // Territory contributions
  [WarContributionType.ZONE_CAPTURE]: 30,
  [WarContributionType.ZONE_DEFENSE]: 20,
  [WarContributionType.INFLUENCE_GAINED]: 0.2,       // Per 1 influence point

  // Resource contributions
  [WarContributionType.GOLD_CONTRIBUTED]: 0.02,      // Per 1 gold
  [WarContributionType.SUPPLIES_DELIVERED]: 10,

  // Support contributions
  [WarContributionType.BUFF_PROVIDED]: 3,
  [WarContributionType.RALLY_ATTENDANCE]: 5,

  // Leadership contributions
  [WarContributionType.WAR_DECLARATION]: 100,
  [WarContributionType.STRATEGY_CALL]: 15,
};

/**
 * Category weights for MVP calculation
 * Higher weights mean more impact on final MVP score
 */
export const WAR_CATEGORY_WEIGHTS: Record<WarContributionCategory, number> = {
  [WarContributionCategory.COMBAT]: 1.0,
  [WarContributionCategory.RAIDS]: 0.8,
  [WarContributionCategory.TERRITORY]: 1.2,
  [WarContributionCategory.RESOURCES]: 0.7,
  [WarContributionCategory.SUPPORT]: 0.9,
  [WarContributionCategory.LEADERSHIP]: 1.5,
};

/**
 * Diversity bonus configuration
 * Players who contribute across multiple categories get bonus multiplier
 */
export const DIVERSITY_BONUS = {
  /** Bonus per active category (e.g., +5% per category) */
  PER_CATEGORY: 0.05,
  /** Maximum diversity bonus (e.g., +30% max = all 6 categories) */
  MAX_BONUS: 0.30,
};

/**
 * Efficiency scaling for win rate
 * Players with higher win rates get slight bonuses
 */
export const WIN_RATE_EFFICIENCY = {
  /** Minimum multiplier for poor win rate */
  MIN_MULTIPLIER: 0.9,
  /** Maximum multiplier for excellent win rate */
  MAX_MULTIPLIER: 1.2,
  /** Win rate at which multiplier is 1.0 */
  BASELINE_WIN_RATE: 0.5,
};

/**
 * Reward multipliers for different finish positions
 */
export const REWARD_TIERS = {
  MVP: {
    goldMultiplier: 3.0,
    xpMultiplier: 2.5,
    bonusItems: true,
    earnTitle: true,
  },
  TOP_3: {
    goldMultiplier: 2.0,
    xpMultiplier: 2.0,
    bonusItems: true,
    earnTitle: false,
  },
  TOP_10: {
    goldMultiplier: 1.5,
    xpMultiplier: 1.5,
    bonusItems: false,
    earnTitle: false,
  },
  PARTICIPANT: {
    goldMultiplier: 1.0,
    xpMultiplier: 1.0,
    bonusItems: false,
    earnTitle: false,
  },
};

/**
 * Title rewards for category MVPs
 */
export const WAR_CATEGORY_TITLES: Record<WarContributionCategory, string> = {
  [WarContributionCategory.COMBAT]: 'War Champion',
  [WarContributionCategory.RAIDS]: 'Raid Master',
  [WarContributionCategory.TERRITORY]: 'Territory Conqueror',
  [WarContributionCategory.RESOURCES]: 'War Banker',
  [WarContributionCategory.SUPPORT]: 'Gang Hero',
  [WarContributionCategory.LEADERSHIP]: 'War General',
};

/**
 * Thresholds for title progression
 */
export const TITLE_THRESHOLDS = {
  /** Number of category MVP wins to earn permanent title */
  CATEGORY_MVP_WINS_FOR_TITLE: 3,
  /** Number of overall MVP wins for "War Legend" title */
  MVP_WINS_FOR_LEGEND: 5,
  /** Streak length for "Undefeated" title */
  MVP_STREAK_FOR_UNDEFEATED: 3,
};

/**
 * Leaderboard configuration
 */
export const LEADERBOARD_CONFIG = {
  /** How many entries to show in top leaderboard */
  TOP_ENTRIES: 10,
  /** How often to recalculate ranks (in ms) */
  RANK_RECALC_INTERVAL_MS: 60000, // 1 minute
  /** Minimum points to appear on leaderboard */
  MIN_POINTS_FOR_LEADERBOARD: 1,
};

/**
 * Socket.IO room naming
 */
export const WAR_CONTRIBUTION_ROOMS = {
  /** Room for all participants in a war */
  WAR_ROOM: (warId: string) => `war:${warId}`,
  /** Room for gang-specific updates */
  GANG_ROOM: (warId: string, gangId: string) => `war:${warId}:gang:${gangId}`,
};
