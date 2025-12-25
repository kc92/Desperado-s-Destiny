/**
 * Raid System Constants
 *
 * Configuration values for the gang raid system (Phase 2.3)
 */

import {
  RaidTargetType,
  RaidOutcome,
  GuardSkillTier,
  InsuranceLevel,
  IGuardTierConfig,
  IInsuranceTierConfig,
  IRaidDamageConfig,
} from '../types/raid.types';

/**
 * Raid timing constants (in milliseconds)
 */
export const RAID_TIMING = {
  /** Minimum planning time before scheduling (30 minutes) */
  MIN_PLANNING_TIME_MS: 30 * 60 * 1000,

  /** Maximum planning time before auto-cancel (24 hours) */
  MAX_PLANNING_TIME_MS: 24 * 60 * 60 * 1000,

  /** Execution window duration (15 minutes) */
  EXECUTION_WINDOW_MS: 15 * 60 * 1000,

  /** Cooldown per target before re-raiding (48 hours) */
  COOLDOWN_PER_TARGET_MS: 48 * 60 * 60 * 1000,

  /** Immunity after being raided (4 hours) */
  RAID_IMMUNITY_AFTER_RAID_MS: 4 * 60 * 60 * 1000,

  /** How often to process scheduled raids (5 minutes) */
  RAID_EXECUTION_JOB_INTERVAL_MS: 5 * 60 * 1000,
} as const;

/**
 * Raid participant limits
 */
export const RAID_PARTICIPANTS = {
  MIN_PARTICIPANTS: 1,
  MAX_PARTICIPANTS: 5,
  /** Power bonus per additional participant (+10%) */
  PARTICIPANT_POWER_BONUS: 0.1,
} as const;

/**
 * Base success rates per target type (0-1)
 */
export const RAID_BASE_SUCCESS_RATE: Record<RaidTargetType, number> = {
  [RaidTargetType.PROPERTY]: 0.60,
  [RaidTargetType.TREASURY]: 0.45,
  [RaidTargetType.TERRITORY_INFLUENCE]: 0.55,
  [RaidTargetType.PRODUCTION]: 0.50,
};

/**
 * Damage ranges per target type
 */
export const RAID_DAMAGE_RANGES: Record<RaidTargetType, IRaidDamageConfig> = {
  [RaidTargetType.PROPERTY]: {
    storage: [0.10, 0.40],           // 10-40% of storage
    condition: [10, 30],             // -10 to -30 condition
    upgradeSabotageChance: 0.15,     // 15% chance to damage upgrade
  },
  [RaidTargetType.TREASURY]: {
    gold: [0.05, 0.25],              // 5-25% of treasury
  },
  [RaidTargetType.TERRITORY_INFLUENCE]: {
    influence: [15, 35],             // -15 to -35 influence points
  },
  [RaidTargetType.PRODUCTION]: {
    haltHours: [4, 24],              // 4-24 hours halt
    resources: [0.05, 0.20],         // 5-20% of in-progress resources
  },
};

/**
 * War combat bonuses
 */
export const RAID_WAR_BONUSES = {
  /** Attacker damage bonus during active war (+25%) */
  ATTACKER_DAMAGE_BONUS: 0.25,
  /** Defender defense penalty during active war (-10%) */
  DEFENDER_DEFENSE_PENALTY: 0.10,
} as const;

/**
 * Raid planning costs (gold)
 */
export const RAID_PLANNING_COST: Record<RaidTargetType, number> = {
  [RaidTargetType.PROPERTY]: 100,
  [RaidTargetType.TREASURY]: 500,
  [RaidTargetType.TERRITORY_INFLUENCE]: 250,
  [RaidTargetType.PRODUCTION]: 150,
};

/**
 * Guard tier configurations
 */
export const GUARD_TIERS: Record<GuardSkillTier, IGuardTierConfig> = {
  [GuardSkillTier.ROOKIE]: {
    defense: 5,
    dailyWage: 10,
    hireCost: 50,
  },
  [GuardSkillTier.EXPERIENCED]: {
    defense: 10,
    dailyWage: 25,
    hireCost: 150,
  },
  [GuardSkillTier.VETERAN]: {
    defense: 18,
    dailyWage: 50,
    hireCost: 400,
  },
  [GuardSkillTier.ELITE]: {
    defense: 30,
    dailyWage: 100,
    hireCost: 1000,
  },
};

/**
 * Insurance tier configurations
 */
export const INSURANCE_TIERS: Record<InsuranceLevel, IInsuranceTierConfig> = {
  [InsuranceLevel.NONE]: {
    recovery: 0,
    weeklyPremium: 0,
  },
  [InsuranceLevel.BASIC]: {
    recovery: 0.25,
    weeklyPremium: 50,
  },
  [InsuranceLevel.STANDARD]: {
    recovery: 0.50,
    weeklyPremium: 150,
  },
  [InsuranceLevel.PREMIUM]: {
    recovery: 0.75,
    weeklyPremium: 400,
  },
};

/**
 * Base XP for raid participation
 */
export const RAID_XP_BASE = 50;

/**
 * XP rewards per outcome
 */
export const RAID_XP_PER_OUTCOME: Record<RaidOutcome, number> = {
  [RaidOutcome.CRITICAL_SUCCESS]: 150,
  [RaidOutcome.SUCCESS]: 100,
  [RaidOutcome.PARTIAL_SUCCESS]: 50,
  [RaidOutcome.FAILURE]: 25,
  [RaidOutcome.CRITICAL_FAILURE]: 10,
};

/**
 * Outcome damage multipliers
 */
export const RAID_OUTCOME_MULTIPLIERS: Record<RaidOutcome, number> = {
  [RaidOutcome.CRITICAL_SUCCESS]: 1.50,  // 150% damage
  [RaidOutcome.SUCCESS]: 1.00,           // 100% damage
  [RaidOutcome.PARTIAL_SUCCESS]: 0.50,   // 50% damage
  [RaidOutcome.FAILURE]: 0,              // No damage
  [RaidOutcome.CRITICAL_FAILURE]: 0,     // No damage, counter-attack
};

/**
 * Outcome thresholds based on success roll
 * (roll must be >= threshold for that outcome)
 */
export const RAID_OUTCOME_THRESHOLDS = {
  CRITICAL_SUCCESS: 90,    // Roll >= 90
  SUCCESS: 60,             // Roll >= 60
  PARTIAL_SUCCESS: 40,     // Roll >= 40
  FAILURE: 20,             // Roll >= 20
  CRITICAL_FAILURE: 0,     // Roll < 20
} as const;

/**
 * Property defense configuration
 */
export const PROPERTY_DEFENSE = {
  /** Base defense for standard properties */
  BASE_DEFENSE: 10,
  /** Base defense bonus for ranches */
  RANCH_DEFENSE_BONUS: 5,
  /** Defense per security system upgrade level */
  SECURITY_UPGRADE_DEFENSE: 8,
  /** Defense per bouncer upgrade level */
  BOUNCER_UPGRADE_DEFENSE: 5,
  /** Maximum guards per property type */
  MAX_GUARDS_STANDARD: 3,
  MAX_GUARDS_RANCH: 5,
  MAX_GUARDS_BUSINESS: 4,
  /** Guard loyalty decay per day without pay */
  GUARD_LOYALTY_DECAY_PER_DAY: 5,
  /** Minimum loyalty before guard quits */
  GUARD_MIN_LOYALTY: 20,
  /** Maximum defense level cap */
  MAX_DEFENSE_LEVEL: 100,
} as const;

/**
 * Raid history limits
 */
export const RAID_HISTORY = {
  /** Maximum raid history entries to keep per property */
  MAX_PROPERTY_HISTORY: 20,
  /** Maximum raid history entries to keep per gang */
  MAX_GANG_HISTORY: 50,
} as const;

/**
 * Counter-attack configuration (for critical failures)
 */
export const COUNTER_ATTACK = {
  /** Chance of counter-attack on critical failure (50%) */
  CHANCE: 0.50,
  /** Gold loss percentage on counter-attack */
  GOLD_LOSS_RANGE: [0.02, 0.10] as [number, number],
  /** XP loss on counter-attack */
  XP_LOSS_RANGE: [25, 100] as [number, number],
} as const;

/**
 * Participation contribution points
 */
export const RAID_CONTRIBUTION_POINTS = {
  /** Points for leading a successful raid */
  LEADER_SUCCESS: 25,
  /** Points for participating in a successful raid */
  ATTACKER_SUCCESS: 15,
  /** Points for scouting a successful raid */
  SCOUT_SUCCESS: 10,
  /** Points for leading a failed raid */
  LEADER_FAILURE: 5,
  /** Points for participating in a failed raid */
  ATTACKER_FAILURE: 3,
  /** Points for scouting a failed raid */
  SCOUT_FAILURE: 2,
  /** Bonus points for critical success */
  CRITICAL_SUCCESS_BONUS: 10,
  /** Points for successfully defending */
  DEFENSE_SUCCESS: 20,
} as const;
