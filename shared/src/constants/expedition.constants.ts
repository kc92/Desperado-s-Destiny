/**
 * Expedition System Constants
 *
 * Configuration values for the expedition system
 */

import {
  ExpeditionType,
  ExpeditionDurationTier,
  ExpeditionOutcome,
  ExpeditionResourceType,
  IExpeditionTypeConfig,
} from '../types/expedition.types';

/**
 * Time constants (in milliseconds)
 */
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

/**
 * Duration configurations by tier
 */
export const EXPEDITION_DURATIONS: Record<ExpeditionDurationTier, { min: number; max: number; default: number }> = {
  [ExpeditionDurationTier.QUICK]: {
    min: 1 * HOUR,
    max: 2 * HOUR,
    default: 1.5 * HOUR,
  },
  [ExpeditionDurationTier.STANDARD]: {
    min: 4 * HOUR,
    max: 8 * HOUR,
    default: 6 * HOUR,
  },
  [ExpeditionDurationTier.EXTENDED]: {
    min: 12 * HOUR,
    max: 24 * HOUR,
    default: 18 * HOUR,
  },
} as const;

/**
 * Success rates by tier (0-1)
 */
export const EXPEDITION_SUCCESS_RATES: Record<ExpeditionDurationTier, number> = {
  [ExpeditionDurationTier.QUICK]: 0.95,      // 95% success
  [ExpeditionDurationTier.STANDARD]: 0.85,   // 85% success
  [ExpeditionDurationTier.EXTENDED]: 0.70,   // 70% success
} as const;

/**
 * Reward multipliers by tier
 */
export const EXPEDITION_REWARD_MULTIPLIERS: Record<ExpeditionDurationTier, number> = {
  [ExpeditionDurationTier.QUICK]: 1.0,
  [ExpeditionDurationTier.STANDARD]: 2.0,
  [ExpeditionDurationTier.EXTENDED]: 4.0,
} as const;

/**
 * Event chance by tier (0-1)
 */
export const EXPEDITION_EVENT_CHANCES: Record<ExpeditionDurationTier, number> = {
  [ExpeditionDurationTier.QUICK]: 0.10,      // 10% chance per hour
  [ExpeditionDurationTier.STANDARD]: 0.25,   // 25% chance per hour
  [ExpeditionDurationTier.EXTENDED]: 0.50,   // 50% chance per hour
} as const;

/**
 * Outcome thresholds (roll must be >= threshold for that outcome)
 */
export const EXPEDITION_OUTCOME_THRESHOLDS = {
  CRITICAL_SUCCESS: 95,    // Roll >= 95
  SUCCESS: 50,             // Roll >= 50 (adjusted by tier success rate)
  PARTIAL_SUCCESS: 25,     // Roll >= 25
  FAILURE: 10,             // Roll >= 10
  CRITICAL_FAILURE: 0,     // Roll < 10
} as const;

/**
 * Outcome reward multipliers
 */
export const EXPEDITION_OUTCOME_MULTIPLIERS: Record<ExpeditionOutcome, number> = {
  [ExpeditionOutcome.CRITICAL_SUCCESS]: 1.50,
  [ExpeditionOutcome.SUCCESS]: 1.00,
  [ExpeditionOutcome.PARTIAL_SUCCESS]: 0.50,
  [ExpeditionOutcome.FAILURE]: 0.10,
  [ExpeditionOutcome.CRITICAL_FAILURE]: 0,
} as const;

/**
 * Base energy costs by expedition type
 */
export const EXPEDITION_ENERGY_COSTS: Record<ExpeditionType, number> = {
  [ExpeditionType.HUNTING_TRIP]: 25,
  [ExpeditionType.PROSPECTING_RUN]: 30,
  [ExpeditionType.TRADE_CARAVAN]: 40,
  [ExpeditionType.SCOUTING_MISSION]: 15,
} as const;

/**
 * Base gold costs by expedition type
 */
export const EXPEDITION_GOLD_COSTS: Record<ExpeditionType, number> = {
  [ExpeditionType.HUNTING_TRIP]: 50,
  [ExpeditionType.PROSPECTING_RUN]: 100,
  [ExpeditionType.TRADE_CARAVAN]: 500,
  [ExpeditionType.SCOUTING_MISSION]: 25,
} as const;

/**
 * Primary skill for XP by expedition type
 */
export const EXPEDITION_PRIMARY_SKILLS: Record<ExpeditionType, string> = {
  [ExpeditionType.HUNTING_TRIP]: 'animal_handling',
  [ExpeditionType.PROSPECTING_RUN]: 'prospecting',
  [ExpeditionType.TRADE_CARAVAN]: 'persuasion',
  [ExpeditionType.SCOUTING_MISSION]: 'tracking',
} as const;

/**
 * Base XP rewards by expedition type
 */
export const EXPEDITION_BASE_XP: Record<ExpeditionType, number> = {
  [ExpeditionType.HUNTING_TRIP]: 100,
  [ExpeditionType.PROSPECTING_RUN]: 120,
  [ExpeditionType.TRADE_CARAVAN]: 150,
  [ExpeditionType.SCOUTING_MISSION]: 75,
} as const;

/**
 * Base gold rewards by expedition type
 */
export const EXPEDITION_BASE_GOLD: Record<ExpeditionType, number> = {
  [ExpeditionType.HUNTING_TRIP]: 200,
  [ExpeditionType.PROSPECTING_RUN]: 300,
  [ExpeditionType.TRADE_CARAVAN]: 500,
  [ExpeditionType.SCOUTING_MISSION]: 100,
} as const;

/**
 * Valid starting locations by expedition type
 */
export const EXPEDITION_START_LOCATIONS: Record<ExpeditionType, string[]> = {
  [ExpeditionType.HUNTING_TRIP]: [
    'longhorn-ranch',
    'sangre-canyon',
    'snake-creek',
    'dusty-trail',
    'the-badlands',
  ],
  [ExpeditionType.PROSPECTING_RUN]: [
    'goldfingers-mine',
    'abandoned-mine',
    'the-badlands',
    'sangre-canyon',
    'echo-caves',
  ],
  [ExpeditionType.TRADE_CARAVAN]: [
    'red-gulch',
    'the-frontera',
    'fort-ashford',
    'whiskey-bend',
    'kaiowa-mesa',
  ],
  [ExpeditionType.SCOUTING_MISSION]: [
    // Any wilderness location
    'sangre-canyon',
    'dusty-trail',
    'the-badlands',
    'snake-creek',
    'echo-caves',
    'thunderbirds-perch',
    'spirit-springs',
    'bone-garden',
    'the-wastes',
    'sacred-heart-mountains',
  ],
} as const;

/**
 * Resource types by expedition type
 */
export const EXPEDITION_RESOURCE_TYPES: Record<ExpeditionType, ExpeditionResourceType[]> = {
  [ExpeditionType.HUNTING_TRIP]: [
    ExpeditionResourceType.PELT,
    ExpeditionResourceType.MEAT,
    ExpeditionResourceType.HIDE,
    ExpeditionResourceType.RARE_HIDE,
    ExpeditionResourceType.TROPHY,
  ],
  [ExpeditionType.PROSPECTING_RUN]: [
    ExpeditionResourceType.ORE,
    ExpeditionResourceType.GEM,
    ExpeditionResourceType.GOLD_NUGGET,
    ExpeditionResourceType.RARE_MINERAL,
  ],
  [ExpeditionType.TRADE_CARAVAN]: [
    ExpeditionResourceType.GOLD,
    ExpeditionResourceType.TRADE_GOODS,
    ExpeditionResourceType.RARE_ITEM,
    ExpeditionResourceType.REPUTATION,
  ],
  [ExpeditionType.SCOUTING_MISSION]: [
    ExpeditionResourceType.INTEL,
    ExpeditionResourceType.MAP_FRAGMENT,
    ExpeditionResourceType.SHORTCUT,
    ExpeditionResourceType.LOCATION_DISCOVERY,
  ],
} as const;

/**
 * Mount bonuses (applied to success rate and rewards)
 */
export const EXPEDITION_MOUNT_BONUSES = {
  /** Success rate bonus with any mount */
  SUCCESS_BONUS: 0.05,      // +5% success
  /** Speed bonus (reduces duration) */
  SPEED_BONUS: 0.10,        // -10% duration
  /** Carry capacity bonus for trade caravans */
  CARGO_BONUS: 0.25,        // +25% gold for trade caravans
} as const;

/**
 * Supplies bonuses
 */
export const EXPEDITION_SUPPLY_BONUSES = {
  /** Survival kit - reduces failure penalties */
  SURVIVAL_KIT: {
    itemId: 'survival_kit',
    failurePenaltyReduction: 0.50,  // 50% less penalty on failure
  },
  /** Provisions - increases success rate */
  PROVISIONS: {
    itemId: 'provisions',
    successBonus: 0.05,             // +5% success
  },
  /** Map - reduces scouting duration */
  MAP: {
    itemId: 'trail_map',
    scoutingSpeedBonus: 0.20,       // -20% scouting duration
  },
  /** Trade manifest - increases trade profit */
  MANIFEST: {
    itemId: 'trade_manifest',
    tradeProfitBonus: 0.15,         // +15% trade gold
  },
} as const;

/**
 * Gang member bonuses (when gang leader brings members)
 */
export const EXPEDITION_GANG_BONUSES = {
  /** Bonus per gang member */
  PER_MEMBER_SUCCESS_BONUS: 0.03,   // +3% success per member
  /** Maximum gang members allowed */
  MAX_GANG_MEMBERS: 3,
  /** Gang member XP share */
  MEMBER_XP_SHARE: 0.50,            // 50% of leader XP
} as const;

/**
 * Cooldowns (in milliseconds)
 */
export const EXPEDITION_COOLDOWNS = {
  /** Minimum time between expeditions of same type */
  SAME_TYPE_COOLDOWN_MS: 1 * HOUR,
  /** Maximum concurrent expeditions */
  MAX_CONCURRENT: 1,
} as const;

/**
 * Expedition type configurations
 */
export const EXPEDITION_CONFIGS: Record<ExpeditionType, IExpeditionTypeConfig> = {
  [ExpeditionType.HUNTING_TRIP]: {
    type: ExpeditionType.HUNTING_TRIP,
    name: 'Hunting Trip',
    description: 'Venture into the wilderness to hunt game and gather pelts, meat, and other animal resources.',
    flavorText: 'The wilderness calls to those with patience and a steady aim.',
    durations: {
      [ExpeditionDurationTier.QUICK]: { minMs: 2 * HOUR, maxMs: 3 * HOUR, defaultMs: 2.5 * HOUR },
      [ExpeditionDurationTier.STANDARD]: { minMs: 4 * HOUR, maxMs: 6 * HOUR, defaultMs: 5 * HOUR },
      [ExpeditionDurationTier.EXTENDED]: { minMs: 6 * HOUR, maxMs: 8 * HOUR, defaultMs: 7 * HOUR },
    },
    validStartLocations: EXPEDITION_START_LOCATIONS[ExpeditionType.HUNTING_TRIP],
    minLevel: 5,
    skillRequirements: { tracking: 5 },
    energyCost: EXPEDITION_ENERGY_COSTS[ExpeditionType.HUNTING_TRIP],
    goldCost: EXPEDITION_GOLD_COSTS[ExpeditionType.HUNTING_TRIP],
    primarySkill: EXPEDITION_PRIMARY_SKILLS[ExpeditionType.HUNTING_TRIP],
    baseXpReward: EXPEDITION_BASE_XP[ExpeditionType.HUNTING_TRIP],
    baseGoldReward: EXPEDITION_BASE_GOLD[ExpeditionType.HUNTING_TRIP],
    resourceTypes: EXPEDITION_RESOURCE_TYPES[ExpeditionType.HUNTING_TRIP],
    eventChanceByTier: EXPEDITION_EVENT_CHANCES,
  },
  [ExpeditionType.PROSPECTING_RUN]: {
    type: ExpeditionType.PROSPECTING_RUN,
    name: 'Prospecting Run',
    description: 'Search for valuable ore deposits, gems, and gold in the mountains and canyons.',
    flavorText: 'There\'s gold in them thar hills, if you know where to look.',
    durations: {
      [ExpeditionDurationTier.QUICK]: { minMs: 4 * HOUR, maxMs: 6 * HOUR, defaultMs: 5 * HOUR },
      [ExpeditionDurationTier.STANDARD]: { minMs: 8 * HOUR, maxMs: 10 * HOUR, defaultMs: 9 * HOUR },
      [ExpeditionDurationTier.EXTENDED]: { minMs: 10 * HOUR, maxMs: 12 * HOUR, defaultMs: 11 * HOUR },
    },
    validStartLocations: EXPEDITION_START_LOCATIONS[ExpeditionType.PROSPECTING_RUN],
    minLevel: 10,
    skillRequirements: { prospecting: 10 },
    energyCost: EXPEDITION_ENERGY_COSTS[ExpeditionType.PROSPECTING_RUN],
    goldCost: EXPEDITION_GOLD_COSTS[ExpeditionType.PROSPECTING_RUN],
    primarySkill: EXPEDITION_PRIMARY_SKILLS[ExpeditionType.PROSPECTING_RUN],
    baseXpReward: EXPEDITION_BASE_XP[ExpeditionType.PROSPECTING_RUN],
    baseGoldReward: EXPEDITION_BASE_GOLD[ExpeditionType.PROSPECTING_RUN],
    resourceTypes: EXPEDITION_RESOURCE_TYPES[ExpeditionType.PROSPECTING_RUN],
    eventChanceByTier: EXPEDITION_EVENT_CHANCES,
  },
  [ExpeditionType.TRADE_CARAVAN]: {
    type: ExpeditionType.TRADE_CARAVAN,
    name: 'Trade Caravan',
    description: 'Lead a trading expedition between settlements to earn gold and unlock trade routes.',
    flavorText: 'A successful trader knows when to haggle and when to run.',
    durations: {
      [ExpeditionDurationTier.QUICK]: { minMs: 8 * HOUR, maxMs: 10 * HOUR, defaultMs: 9 * HOUR },
      [ExpeditionDurationTier.STANDARD]: { minMs: 16 * HOUR, maxMs: 20 * HOUR, defaultMs: 18 * HOUR },
      [ExpeditionDurationTier.EXTENDED]: { minMs: 20 * HOUR, maxMs: 24 * HOUR, defaultMs: 22 * HOUR },
    },
    validStartLocations: EXPEDITION_START_LOCATIONS[ExpeditionType.TRADE_CARAVAN],
    minLevel: 15,
    skillRequirements: { persuasion: 15 },
    energyCost: EXPEDITION_ENERGY_COSTS[ExpeditionType.TRADE_CARAVAN],
    goldCost: EXPEDITION_GOLD_COSTS[ExpeditionType.TRADE_CARAVAN],
    primarySkill: EXPEDITION_PRIMARY_SKILLS[ExpeditionType.TRADE_CARAVAN],
    baseXpReward: EXPEDITION_BASE_XP[ExpeditionType.TRADE_CARAVAN],
    baseGoldReward: EXPEDITION_BASE_GOLD[ExpeditionType.TRADE_CARAVAN],
    resourceTypes: EXPEDITION_RESOURCE_TYPES[ExpeditionType.TRADE_CARAVAN],
    eventChanceByTier: EXPEDITION_EVENT_CHANCES,
  },
  [ExpeditionType.SCOUTING_MISSION]: {
    type: ExpeditionType.SCOUTING_MISSION,
    name: 'Scouting Mission',
    description: 'Scout unexplored areas to gather intel, discover new locations, and find shortcuts.',
    flavorText: 'The best scout is the one nobody ever sees.',
    durations: {
      [ExpeditionDurationTier.QUICK]: { minMs: 1 * HOUR, maxMs: 2 * HOUR, defaultMs: 1.5 * HOUR },
      [ExpeditionDurationTier.STANDARD]: { minMs: 2 * HOUR, maxMs: 3 * HOUR, defaultMs: 2.5 * HOUR },
      [ExpeditionDurationTier.EXTENDED]: { minMs: 3 * HOUR, maxMs: 4 * HOUR, defaultMs: 3.5 * HOUR },
    },
    validStartLocations: EXPEDITION_START_LOCATIONS[ExpeditionType.SCOUTING_MISSION],
    minLevel: 3,
    skillRequirements: { tracking: 3 },
    energyCost: EXPEDITION_ENERGY_COSTS[ExpeditionType.SCOUTING_MISSION],
    goldCost: EXPEDITION_GOLD_COSTS[ExpeditionType.SCOUTING_MISSION],
    primarySkill: EXPEDITION_PRIMARY_SKILLS[ExpeditionType.SCOUTING_MISSION],
    baseXpReward: EXPEDITION_BASE_XP[ExpeditionType.SCOUTING_MISSION],
    baseGoldReward: EXPEDITION_BASE_GOLD[ExpeditionType.SCOUTING_MISSION],
    resourceTypes: EXPEDITION_RESOURCE_TYPES[ExpeditionType.SCOUTING_MISSION],
    eventChanceByTier: EXPEDITION_EVENT_CHANCES,
  },
} as const;

/**
 * Maximum offline duration bonus cap
 * Prevents exploitation of very long absences
 */
export const EXPEDITION_MAX_OFFLINE_BONUS_HOURS = 72; // 72 hours max
