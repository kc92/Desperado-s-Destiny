/**
 * Territory Control Types
 *
 * Shared types for gang territory control system
 */

/**
 * Zone type enum
 */
export enum ZoneType {
  TOWN_DISTRICT = 'town_district',
  WILDERNESS = 'wilderness',
  STRATEGIC_POINT = 'strategic_point',
}

/**
 * Zone benefit type enum
 *
 * Extended in Phase 2.2 with 25+ activity-specific bonus types
 */
export enum ZoneBenefitType {
  // Legacy (keep for compatibility)
  INCOME = 'income',
  COMBAT = 'combat',
  TACTICAL = 'tactical',
  ECONOMIC = 'economic',

  // Combat (4)
  COMBAT_DAMAGE = 'combat_damage', // +% damage dealt
  COMBAT_DEFENSE = 'combat_defense', // -% damage received
  COMBAT_XP = 'combat_xp', // +% XP from combat
  COMBAT_GOLD = 'combat_gold', // +% gold from combat loot

  // Mining (4)
  MINING_YIELD = 'mining_yield', // +% resource quantity
  MINING_RARE = 'mining_rare', // +% rare resource chance
  MINING_SPEED = 'mining_speed', // -% collection cooldown
  MINING_VALUE = 'mining_value', // +% gold value of resources

  // Crime (4)
  CRIME_SUCCESS = 'crime_success', // +% to success roll
  CRIME_DETECTION = 'crime_detection', // -% witness chance
  CRIME_JAIL = 'crime_jail', // -% jail time
  CRIME_FENCE = 'crime_fence', // +% fence prices

  // Trading (3)
  TRADE_BUY = 'trade_buy', // -% buy prices
  TRADE_SELL = 'trade_sell', // +% sell prices
  TRADE_DISCOUNT = 'trade_discount', // -% all transaction costs

  // Contracts (3)
  CONTRACT_GOLD = 'contract_gold', // +% contract gold rewards
  CONTRACT_XP = 'contract_xp', // +% contract XP rewards
  CONTRACT_BONUS = 'contract_bonus', // +% streak bonus rewards

  // Property/Production (3)
  PROPERTY_INCOME = 'property_income', // +% property income
  PROPERTY_SPEED = 'property_speed', // -% production time
  WORKER_EFFICIENCY = 'worker_efficiency', // +% worker output

  // Bounty Hunting (3)
  BOUNTY_VALUE = 'bounty_value', // +% bounty gold
  BOUNTY_TRACKING = 'bounty_tracking', // +% tracking progress per action
  BOUNTY_XP = 'bounty_xp', // +% bounty XP

  // Cattle (2)
  CATTLE_REWARD = 'cattle_reward', // +% cattle drive rewards
  CATTLE_SURVIVAL = 'cattle_survival', // +% cattle survival rate

  // Illegal Mining (4) - Phase 13: Deep Mining
  ILLEGAL_MINING_DETECTION = 'illegal_mining_detection', // -% suspicion gain
  ILLEGAL_MINING_YIELD = 'illegal_mining_yield', // +% illegal ore yield
  SMUGGLING_CAPACITY = 'smuggling_capacity', // +% smuggling channel capacity
  FENCE_RATE = 'fence_rate', // +% fence sale prices
}

/**
 * Zone specialization enum
 *
 * Determines primary/secondary/tertiary bonus effectiveness
 */
export enum ZoneSpecialization {
  MINING = 'mining', // Mining bonuses primary
  RANCHING = 'ranching', // Cattle bonuses primary
  TRADING = 'trading', // Trade bonuses primary
  CRIMINAL = 'criminal', // Crime bonuses primary
  MILITARY = 'military', // Combat bonuses primary
  INDUSTRIAL = 'industrial', // Production bonuses primary
  FRONTIER = 'frontier', // Bounty/exploration bonuses primary
  MIXED = 'mixed', // No primary, reduced all bonuses
}

/**
 * Zone benefit
 */
export interface ZoneBenefit {
  type: ZoneBenefitType;
  description: string;
  value: number;
  /** How the bonus is applied: 'multiply' (default) or 'add' */
  modifier?: 'multiply' | 'add';
}

/**
 * Gang influence in zone
 */
export interface GangInfluence {
  gangId: string;
  gangName: string;
  influence: number;
  isNpcGang: boolean;
  lastActivity: string;
}

/**
 * Territory Zone
 */
export interface TerritoryZone {
  _id: string;
  id: string;
  name: string;
  type: ZoneType;
  parentLocation: string;

  controlledBy: string | null;
  controllingGangName: string | null;
  influence: GangInfluence[];
  contestedBy: string[];

  benefits: ZoneBenefit[];
  defenseRating: number;
  dailyIncome: number;

  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Territory control overview for a gang
 */
export interface TerritoryControl {
  gangId: string;
  gangName: string;
  zones: ControlledZone[];
  totalIncome: number;
  totalInfluence: number;
  contestedZones: number;
  empireRating: EmpireRating;
}

/**
 * Controlled zone summary
 */
export interface ControlledZone {
  zoneId: string;
  zoneName: string;
  zoneType: ZoneType;
  influence: number;
  isContested: boolean;
  dailyIncome: number;
  benefits: ZoneBenefit[];
}

/**
 * Empire rating based on territory control
 */
export enum EmpireRating {
  SMALL = 'small',
  GROWING = 'growing',
  MAJOR = 'major',
  DOMINANT = 'dominant',
}

/**
 * Influence activity type
 */
export enum InfluenceActivityType {
  CRIME = 'crime',
  FIGHT = 'fight',
  BRIBE = 'bribe',
  BUSINESS = 'business',
  PASSIVE = 'passive',
}

/**
 * Influence gain result
 */
export interface InfluenceGainResult {
  zoneId: string;
  zoneName: string;
  gangId: string;
  activityType: InfluenceActivityType;
  influenceGained: number;
  newInfluence: number;
  controlChanged: boolean;
  nowControlled: boolean;
  nowContested: boolean;
}

/**
 * Zone contestation request
 */
export interface ContestZoneRequest {
  zoneId: string;
  gangId: string;
}

/**
 * Zone contestation result
 */
export interface ContestZoneResult {
  success: boolean;
  zoneId: string;
  zoneName: string;
  message: string;
  contestedBy: string[];
}

/**
 * Territory map data
 */
export interface TerritoryMapData {
  zones: TerritoryZoneMapInfo[];
  gangLegend: GangLegendEntry[];
}

/**
 * Territory zone map info
 */
export interface TerritoryZoneMapInfo {
  id: string;
  name: string;
  type: ZoneType;
  parentLocation: string;
  controlledBy: string | null;
  controllingGangName: string | null;
  controllingGangColor: string | null;
  isContested: boolean;
  topInfluences: Array<{
    gangId: string;
    gangName: string;
    influence: number;
  }>;
}

/**
 * Gang legend entry for map
 */
export interface GangLegendEntry {
  gangId: string;
  gangName: string;
  gangTag: string;
  color: string;
  zonesControlled: number;
  totalInfluence: number;
}

/**
 * Negotiation request
 */
export interface NegotiationRequest {
  initiatingGangId: string;
  targetGangId: string;
  zoneId: string;
  offerType: 'share' | 'withdraw' | 'truce';
  offerDetails?: {
    goldOffer?: number;
    influenceShare?: number;
    duration?: number; // days
  };
}

/**
 * Negotiation result
 */
export interface NegotiationResult {
  success: boolean;
  message: string;
  agreement?: {
    zoneId: string;
    type: string;
    terms: Record<string, unknown>;
    expiresAt: string;
  };
}

/**
 * Zone statistics
 */
export interface ZoneStatistics {
  totalZones: number;
  controlledZones: number;
  contestedZones: number;
  uncontrolledZones: number;
  byType: {
    town_district: number;
    wilderness: number;
    strategic_point: number;
  };
  byGang: Array<{
    gangId: string;
    gangName: string;
    zonesControlled: number;
  }>;
}

/**
 * NPC Gang territory
 */
export interface NpcGangTerritory {
  gangId: string;
  gangName: string;
  description: string;
  zones: string[];
  attitude: 'hostile' | 'neutral' | 'friendly';
  canAlly: boolean;
  allianceCost?: number;
  tributeCost?: number;
}

/**
 * Influence gain rates
 */
export const INFLUENCE_GAIN = {
  CRIME_MIN: 5,
  CRIME_MAX: 20,
  FIGHT_MIN: 10,
  FIGHT_MAX: 30,
  BRIBE_MIN: 15,
  BRIBE_MAX: 25,
  BUSINESS_MIN: 20,
  BUSINESS_MAX: 40,
  PASSIVE_PER_HOUR: 1,
} as const;

/**
 * Influence loss rates
 */
export const INFLUENCE_LOSS = {
  RIVAL_ACTIVITY_MIN: 10,
  RIVAL_ACTIVITY_MAX: 30,
  LAW_ENFORCEMENT_MIN: 20,
  LAW_ENFORCEMENT_MAX: 50,
  MEMBER_ARREST: 15,
  INACTIVITY_PER_DAY: 5,
} as const;

/**
 * Control thresholds
 */
export const CONTROL_THRESHOLDS = {
  MIN_CONTROL: 50,
  LEAD_REQUIRED: 20,
  CONTEST_THRESHOLD: 30,
} as const;

/**
 * Empire rating thresholds
 */
export const EMPIRE_RATING_THRESHOLDS = {
  SMALL: 0,
  GROWING: 3,
  MAJOR: 8,
  DOMINANT: 15,
} as const;

/**
 * Territory bonus caps by bonus type
 *
 * Maximum percentage bonus that can be applied (e.g., 0.50 = max +50%)
 */
export const TERRITORY_BONUS_CAPS = {
  // Combat - moderate caps to prevent OP gangs
  [ZoneBenefitType.COMBAT_DAMAGE]: 0.5, // Max +50% damage
  [ZoneBenefitType.COMBAT_DEFENSE]: 0.35, // Max -35% damage received
  [ZoneBenefitType.COMBAT_XP]: 0.5, // Max +50% XP
  [ZoneBenefitType.COMBAT_GOLD]: 0.5, // Max +50% gold

  // Mining - higher caps (encourages territory control)
  [ZoneBenefitType.MINING_YIELD]: 0.75, // Max +75% yield
  [ZoneBenefitType.MINING_RARE]: 0.5, // Max +50% rare chance
  [ZoneBenefitType.MINING_SPEED]: 0.4, // Max -40% cooldown
  [ZoneBenefitType.MINING_VALUE]: 0.5, // Max +50% value

  // Crime - moderate to prevent abuse
  [ZoneBenefitType.CRIME_SUCCESS]: 0.3, // Max +30% success
  [ZoneBenefitType.CRIME_DETECTION]: 0.4, // Max -40% detection
  [ZoneBenefitType.CRIME_JAIL]: 0.5, // Max -50% jail time
  [ZoneBenefitType.CRIME_FENCE]: 0.35, // Max +35% fence prices

  // Trading - lower caps to maintain economy
  [ZoneBenefitType.TRADE_BUY]: 0.25, // Max -25% buy prices
  [ZoneBenefitType.TRADE_SELL]: 0.35, // Max +35% sell prices
  [ZoneBenefitType.TRADE_DISCOUNT]: 0.2, // Max -20% transaction costs

  // Contracts - moderate
  [ZoneBenefitType.CONTRACT_GOLD]: 0.4, // Max +40% gold
  [ZoneBenefitType.CONTRACT_XP]: 0.4, // Max +40% XP
  [ZoneBenefitType.CONTRACT_BONUS]: 0.5, // Max +50% streak bonus

  // Property - moderate
  [ZoneBenefitType.PROPERTY_INCOME]: 0.5, // Max +50% income
  [ZoneBenefitType.PROPERTY_SPEED]: 0.35, // Max -35% production time
  [ZoneBenefitType.WORKER_EFFICIENCY]: 0.4, // Max +40% efficiency

  // Bounty - moderate
  [ZoneBenefitType.BOUNTY_VALUE]: 0.5, // Max +50% bounty gold
  [ZoneBenefitType.BOUNTY_TRACKING]: 0.4, // Max +40% tracking speed
  [ZoneBenefitType.BOUNTY_XP]: 0.5, // Max +50% XP

  // Cattle - moderate
  [ZoneBenefitType.CATTLE_REWARD]: 0.5, // Max +50% rewards
  [ZoneBenefitType.CATTLE_SURVIVAL]: 0.3, // Max +30% survival

  // Legacy types - lower caps
  [ZoneBenefitType.INCOME]: 0.5,
  [ZoneBenefitType.COMBAT]: 0.35,
  [ZoneBenefitType.TACTICAL]: 0.25,
  [ZoneBenefitType.ECONOMIC]: 0.35,

  // Illegal Mining - Phase 13
  [ZoneBenefitType.ILLEGAL_MINING_DETECTION]: 0.5, // Max -50% suspicion gain
  [ZoneBenefitType.ILLEGAL_MINING_YIELD]: 0.4, // Max +40% illegal ore yield
  [ZoneBenefitType.SMUGGLING_CAPACITY]: 0.5, // Max +50% channel capacity
  [ZoneBenefitType.FENCE_RATE]: 0.25, // Max +25% fence prices
} as const;

/**
 * Bonus category for specialization mapping
 */
export type BonusCategory =
  | 'combat'
  | 'mining'
  | 'crime'
  | 'trading'
  | 'contracts'
  | 'property'
  | 'bounty'
  | 'cattle'
  | 'illegal_mining';

/**
 * Map ZoneBenefitType to its category
 */
export const BONUS_TYPE_TO_CATEGORY: Record<ZoneBenefitType, BonusCategory | null> = {
  // Combat
  [ZoneBenefitType.COMBAT_DAMAGE]: 'combat',
  [ZoneBenefitType.COMBAT_DEFENSE]: 'combat',
  [ZoneBenefitType.COMBAT_XP]: 'combat',
  [ZoneBenefitType.COMBAT_GOLD]: 'combat',
  [ZoneBenefitType.COMBAT]: 'combat',

  // Mining
  [ZoneBenefitType.MINING_YIELD]: 'mining',
  [ZoneBenefitType.MINING_RARE]: 'mining',
  [ZoneBenefitType.MINING_SPEED]: 'mining',
  [ZoneBenefitType.MINING_VALUE]: 'mining',

  // Crime
  [ZoneBenefitType.CRIME_SUCCESS]: 'crime',
  [ZoneBenefitType.CRIME_DETECTION]: 'crime',
  [ZoneBenefitType.CRIME_JAIL]: 'crime',
  [ZoneBenefitType.CRIME_FENCE]: 'crime',

  // Trading
  [ZoneBenefitType.TRADE_BUY]: 'trading',
  [ZoneBenefitType.TRADE_SELL]: 'trading',
  [ZoneBenefitType.TRADE_DISCOUNT]: 'trading',
  [ZoneBenefitType.ECONOMIC]: 'trading',

  // Contracts
  [ZoneBenefitType.CONTRACT_GOLD]: 'contracts',
  [ZoneBenefitType.CONTRACT_XP]: 'contracts',
  [ZoneBenefitType.CONTRACT_BONUS]: 'contracts',

  // Property
  [ZoneBenefitType.PROPERTY_INCOME]: 'property',
  [ZoneBenefitType.PROPERTY_SPEED]: 'property',
  [ZoneBenefitType.WORKER_EFFICIENCY]: 'property',
  [ZoneBenefitType.INCOME]: 'property',

  // Bounty
  [ZoneBenefitType.BOUNTY_VALUE]: 'bounty',
  [ZoneBenefitType.BOUNTY_TRACKING]: 'bounty',
  [ZoneBenefitType.BOUNTY_XP]: 'bounty',

  // Cattle
  [ZoneBenefitType.CATTLE_REWARD]: 'cattle',
  [ZoneBenefitType.CATTLE_SURVIVAL]: 'cattle',

  // Legacy with no category
  [ZoneBenefitType.TACTICAL]: null,

  // Illegal Mining - Phase 13
  [ZoneBenefitType.ILLEGAL_MINING_DETECTION]: 'illegal_mining',
  [ZoneBenefitType.ILLEGAL_MINING_YIELD]: 'illegal_mining',
  [ZoneBenefitType.SMUGGLING_CAPACITY]: 'illegal_mining',
  [ZoneBenefitType.FENCE_RATE]: 'illegal_mining',
};

/**
 * Specialization bonus multipliers
 *
 * Primary categories get 100% of bonus, secondary 50%, tertiary 25%
 * MIXED gets 50% of everything
 */
export const SPECIALIZATION_BONUS_MAPPING: Record<
  ZoneSpecialization,
  { primary: BonusCategory[]; secondary: BonusCategory[]; tertiary: BonusCategory[] }
> = {
  [ZoneSpecialization.MINING]: {
    primary: ['mining'],
    secondary: ['property'],
    tertiary: ['trading'],
  },
  [ZoneSpecialization.RANCHING]: {
    primary: ['cattle'],
    secondary: ['trading'],
    tertiary: ['property'],
  },
  [ZoneSpecialization.TRADING]: {
    primary: ['trading'],
    secondary: ['contracts'],
    tertiary: ['crime'],
  },
  [ZoneSpecialization.CRIMINAL]: {
    primary: ['crime', 'illegal_mining'],
    secondary: ['bounty'],
    tertiary: ['combat'],
  },
  [ZoneSpecialization.MILITARY]: {
    primary: ['combat'],
    secondary: ['bounty'],
    tertiary: ['contracts'],
  },
  [ZoneSpecialization.INDUSTRIAL]: {
    primary: ['property'],
    secondary: ['trading'],
    tertiary: ['mining'],
  },
  [ZoneSpecialization.FRONTIER]: {
    primary: ['bounty'],
    secondary: ['combat'],
    tertiary: ['mining'],
  },
  [ZoneSpecialization.MIXED]: {
    primary: [], // No primary - everything at 50%
    secondary: ['combat', 'mining', 'crime', 'trading', 'contracts', 'property', 'bounty', 'cattle'],
    tertiary: [],
  },
};

/**
 * Influence thresholds for bonus scaling
 */
export const INFLUENCE_BONUS_THRESHOLDS = {
  /** No bonus below this influence */
  MINIMUM: 10,
  /** 25% of bonus at this level */
  LOW: 10,
  /** 50% of bonus at this level */
  MEDIUM: 30,
  /** 100% of bonus at this level */
  HIGH: 50,
  /** 125% bonus (domination) at this level */
  DOMINATION: 80,
  /** Penalty multiplier when zone is contested */
  CONTESTED_PENALTY: 0.75,
} as const;
