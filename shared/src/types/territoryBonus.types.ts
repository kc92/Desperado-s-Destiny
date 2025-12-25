/**
 * Territory Bonus Types
 *
 * Phase 2.2: Territory Bonuses (Full Activity Coverage)
 *
 * Interfaces and types for the territory bonus calculation system.
 * Used by TerritoryBonusService to provide activity-specific bonuses
 * based on gang territory control.
 */

import {
  ZoneBenefitType,
  ZoneSpecialization,
} from './territoryControl.types';

// =============================================================================
// ACTIVITY TYPES
// =============================================================================

/**
 * Activity types that can receive territory bonuses
 */
export type TerritoryActivityType =
  | 'combat'
  | 'mining'
  | 'crime'
  | 'trade'
  | 'contract'
  | 'bounty'
  | 'cattle'
  | 'property';

// =============================================================================
// BONUS INTERFACES
// =============================================================================

/**
 * Raw bonus value from a zone before any scaling
 */
export interface RawZoneBonus {
  type: ZoneBenefitType;
  value: number;
  description: string;
  modifier: 'multiply' | 'add';
}

/**
 * Calculated bonus with all modifiers applied
 */
export interface CalculatedBonus {
  type: ZoneBenefitType;
  /** Raw bonus value from zone definition */
  rawValue: number;
  /** Influence multiplier applied (0/0.25/0.5/1.0/1.25) */
  influenceMultiplier: number;
  /** Specialization multiplier applied (0.25/0.5/1.0) */
  specializationMultiplier: number;
  /** Final value after all modifiers and caps */
  finalValue: number;
  /** Whether the cap was applied */
  wasCapped: boolean;
  /** The cap value if applied */
  capValue?: number;
}

/**
 * Zone bonus information for a character
 */
export interface ZoneBonusInfo {
  /** Zone ID */
  zoneId: string;
  /** Zone name */
  zoneName: string;
  /** Zone specialization */
  specialization: ZoneSpecialization;
  /** Gang's influence in this zone (0-100) */
  influence: number;
  /** Whether the zone is contested */
  isContested: boolean;
  /** Whether gang controls the zone (influence >= 50 with lead) */
  hasControl: boolean;
  /** All bonuses available in this zone */
  bonuses: CalculatedBonus[];
}

/**
 * Character's zone influence lookup result
 */
export interface CharacterZoneInfluence {
  /** Zone ID the character is in */
  zoneId: string;
  /** Zone name */
  zoneName: string;
  /** Gang ID (null if not in a gang) */
  gangId: string | null;
  /** Gang's influence in this zone (0 if not in gang) */
  influence: number;
  /** Whether zone is contested */
  isContested: boolean;
  /** Zone specialization */
  specialization: ZoneSpecialization;
}

// =============================================================================
// ACTIVITY BONUS RESULT INTERFACES
// =============================================================================

/**
 * Combat activity bonuses
 */
export interface CombatBonuses {
  /** Damage multiplier (1.0 = no bonus) */
  damage: number;
  /** Defense multiplier (1.0 = no bonus, 0.8 = 20% less damage taken) */
  defense: number;
  /** XP multiplier */
  xp: number;
  /** Gold/loot multiplier */
  gold: number;
}

/**
 * Mining activity bonuses
 */
export interface MiningBonuses {
  /** Yield multiplier (resource quantity) */
  yield: number;
  /** Rare resource chance multiplier */
  rareChance: number;
  /** Speed multiplier (< 1 = faster cooldown) */
  speed: number;
  /** Value multiplier (gold value of resources) */
  value: number;
}

/**
 * Crime activity bonuses
 */
export interface CrimeBonuses {
  /** Success chance bonus (additive to roll) */
  success: number;
  /** Detection reduction (< 1 = less witness chance) */
  detection: number;
  /** Jail time reduction (< 1 = shorter jail) */
  jail: number;
  /** Fence price multiplier */
  fence: number;
}

/**
 * Trading activity bonuses
 */
export interface TradeBonuses {
  /** Buy price reduction (< 1 = cheaper purchases) */
  buy: number;
  /** Sell price multiplier */
  sell: number;
  /** General discount multiplier */
  discount: number;
}

/**
 * Contract activity bonuses
 */
export interface ContractBonuses {
  /** Gold reward multiplier */
  gold: number;
  /** XP reward multiplier */
  xp: number;
  /** Streak bonus multiplier */
  streak: number;
}

/**
 * Property activity bonuses
 */
export interface PropertyBonuses {
  /** Income multiplier */
  income: number;
  /** Production speed multiplier (< 1 = faster) */
  speed: number;
  /** Worker efficiency multiplier */
  workerEfficiency: number;
}

/**
 * Bounty hunting activity bonuses
 */
export interface BountyBonuses {
  /** Bounty gold value multiplier */
  value: number;
  /** Tracking progress multiplier */
  tracking: number;
  /** XP multiplier */
  xp: number;
}

/**
 * Cattle drive activity bonuses
 */
export interface CattleBonuses {
  /** Reward multiplier */
  reward: number;
  /** Cattle survival rate multiplier */
  survival: number;
}

/**
 * Union type for all activity bonuses
 */
export type ActivityBonuses =
  | CombatBonuses
  | MiningBonuses
  | CrimeBonuses
  | TradeBonuses
  | ContractBonuses
  | PropertyBonuses
  | BountyBonuses
  | CattleBonuses;

/**
 * Map of activity type to its bonus interface
 */
export interface ActivityBonusMap {
  combat: CombatBonuses;
  mining: MiningBonuses;
  crime: CrimeBonuses;
  trade: TradeBonuses;
  contract: ContractBonuses;
  property: PropertyBonuses;
  bounty: BountyBonuses;
  cattle: CattleBonuses;
}

// =============================================================================
// SERVICE RETURN TYPES
// =============================================================================

/**
 * Full bonus result from TerritoryBonusService
 */
export interface TerritoryBonusResult<T extends TerritoryActivityType> {
  /** Activity type requested */
  activityType: T;
  /** Zone information */
  zone: ZoneBonusInfo | null;
  /** Calculated bonuses for the activity */
  bonuses: ActivityBonusMap[T];
  /** Whether any bonuses were applied */
  hasBonuses: boolean;
  /** Debug breakdown of calculations */
  breakdown?: CalculatedBonus[];
}

/**
 * Generic bonus lookup result
 */
export interface GenericBonusResult {
  /** The bonus type */
  type: ZoneBenefitType;
  /** Final multiplier value (1.0 = no bonus) */
  multiplier: number;
  /** Whether bonus was found and applied */
  applied: boolean;
}

// =============================================================================
// CACHING TYPES
// =============================================================================

/**
 * Cached zone bonus data
 */
export interface CachedZoneBonuses {
  zoneId: string;
  gangId: string;
  bonuses: ZoneBonusInfo;
  cachedAt: Date;
  expiresAt: Date;
}

/**
 * Cache configuration
 */
export interface BonusCacheConfig {
  /** Time-to-live in milliseconds (default 5 minutes) */
  ttlMs: number;
  /** Maximum cache entries */
  maxEntries: number;
}

// =============================================================================
// DEFAULT VALUES
// =============================================================================

/**
 * Default bonuses when no territory bonus applies
 */
export const DEFAULT_COMBAT_BONUSES: CombatBonuses = {
  damage: 1.0,
  defense: 1.0,
  xp: 1.0,
  gold: 1.0,
};

export const DEFAULT_MINING_BONUSES: MiningBonuses = {
  yield: 1.0,
  rareChance: 1.0,
  speed: 1.0,
  value: 1.0,
};

export const DEFAULT_CRIME_BONUSES: CrimeBonuses = {
  success: 0,
  detection: 1.0,
  jail: 1.0,
  fence: 1.0,
};

export const DEFAULT_TRADE_BONUSES: TradeBonuses = {
  buy: 1.0,
  sell: 1.0,
  discount: 1.0,
};

export const DEFAULT_CONTRACT_BONUSES: ContractBonuses = {
  gold: 1.0,
  xp: 1.0,
  streak: 1.0,
};

export const DEFAULT_PROPERTY_BONUSES: PropertyBonuses = {
  income: 1.0,
  speed: 1.0,
  workerEfficiency: 1.0,
};

export const DEFAULT_BOUNTY_BONUSES: BountyBonuses = {
  value: 1.0,
  tracking: 1.0,
  xp: 1.0,
};

export const DEFAULT_CATTLE_BONUSES: CattleBonuses = {
  reward: 1.0,
  survival: 1.0,
};

/**
 * Map of default bonuses by activity type
 */
export const DEFAULT_ACTIVITY_BONUSES: ActivityBonusMap = {
  combat: DEFAULT_COMBAT_BONUSES,
  mining: DEFAULT_MINING_BONUSES,
  crime: DEFAULT_CRIME_BONUSES,
  trade: DEFAULT_TRADE_BONUSES,
  contract: DEFAULT_CONTRACT_BONUSES,
  property: DEFAULT_PROPERTY_BONUSES,
  bounty: DEFAULT_BOUNTY_BONUSES,
  cattle: DEFAULT_CATTLE_BONUSES,
};
