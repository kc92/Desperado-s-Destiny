/**
 * Territory War Types
 *
 * Shared types for faction influence and territory control system
 * Phase 11, Wave 11.1 - Territory Influence System
 */

/**
 * Territory Faction IDs
 */
export enum TerritoryFactionId {
  SETTLER_ALLIANCE = 'SETTLER_ALLIANCE',
  NAHI_COALITION = 'NAHI_COALITION',
  FRONTERA_CARTEL = 'FRONTERA_CARTEL',
  US_MILITARY = 'US_MILITARY',
  RAILROAD_BARONS = 'RAILROAD_BARONS',
  INDEPENDENT_OUTLAWS = 'INDEPENDENT_OUTLAWS',
}

/**
 * Territory type classification
 */
export enum TerritoryType {
  TOWN = 'TOWN',
  WILDERNESS = 'WILDERNESS',
}

/**
 * Control level based on faction influence
 */
export enum ControlLevel {
  CONTESTED = 'contested', // No faction above 30%
  DISPUTED = 'disputed', // One faction 30-49%, others close
  CONTROLLED = 'controlled', // One faction 50-69%
  DOMINATED = 'dominated', // One faction 70%+
}

/**
 * Sources of influence change
 */
export enum InfluenceSource {
  // Positive sources
  FACTION_QUEST = 'FACTION_QUEST',
  FACTION_DONATION = 'FACTION_DONATION',
  ENEMY_KILL = 'ENEMY_KILL',
  STRUCTURE_BUILD = 'STRUCTURE_BUILD',
  EVENT_WIN = 'EVENT_WIN',
  GANG_ALIGNMENT = 'GANG_ALIGNMENT',

  // Negative sources
  FACTION_ATTACK = 'FACTION_ATTACK',
  RIVAL_QUEST = 'RIVAL_QUEST',
  CRIMINAL_ACTIVITY = 'CRIMINAL_ACTIVITY',
  EVENT_LOSS = 'EVENT_LOSS',

  // System sources
  DAILY_DECAY = 'DAILY_DECAY',
  SYSTEM_ADJUSTMENT = 'SYSTEM_ADJUSTMENT',
}

/**
 * Territory buff/debuff
 */
export interface TerritoryEffect {
  id: string;
  name: string;
  description: string;
  affectedFactions: TerritoryFactionId[];
  magnitude: number;
  duration?: number; // hours, undefined = permanent
  appliedAt: Date;
  expiresAt?: Date;
}

/**
 * Faction influence in a territory
 */
export interface FactionInfluence {
  factionId: TerritoryFactionId;
  influence: number; // 0-100
  trend: 'rising' | 'falling' | 'stable';
  lastChange: number;
  lastUpdated: Date;
}

/**
 * Territory influence state
 */
export interface TerritoryInfluence {
  _id: string;
  territoryId: string;
  territoryName: string;
  territoryType: TerritoryType;

  // Faction influence (0-100 per faction, total can exceed 100)
  factionInfluence: FactionInfluence[];

  // Control status
  controllingFaction?: TerritoryFactionId;
  controlLevel: ControlLevel;

  // Current state
  stability: number; // 0-100, high = peaceful, low = unrest
  lawLevel: number; // 0-100, affects crime difficulty
  economicHealth: number; // 0-100, affects prices/jobs

  // Historical
  previousController?: TerritoryFactionId;
  controlChangedAt?: Date;
  contestedSince?: Date;

  // Active effects
  activeBuffs: TerritoryEffect[];
  activeDebuffs: TerritoryEffect[];

  // Metadata
  lastDecayAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Influence change record
 */
export interface InfluenceChange {
  _id: string;
  territoryId: string;
  territoryName: string;
  factionId: TerritoryFactionId;
  amount: number;
  source: InfluenceSource;
  characterId?: string;
  characterName?: string;
  gangId?: string;
  gangName?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Territory definition
 */
export interface TerritoryDefinition {
  id: string;
  name: string;
  type: TerritoryType;
  description: string;
  baseStability: number;
  baseLawLevel: number;
  baseEconomicHealth: number;
  initialInfluence: Partial<Record<TerritoryFactionId, number>>;
  strategicValue: number; // 1-10, affects rewards
}

/**
 * Player alignment benefits
 */
export interface AlignmentBenefits {
  factionId: TerritoryFactionId;
  territoryId: string;
  shopDiscount: number; // percentage
  reputationBonus: number; // percentage
  hasSafeHouse: boolean;
  jobPriority: boolean;
  crimeHeatReduction: number; // percentage
}

/**
 * Faction control benefits (for faction itself)
 */
export interface FactionControlBenefits {
  factionId: TerritoryFactionId;
  territoryId: string;
  dailyTaxRevenue: number;
  reputationMultiplier: number;
  exclusiveQuestIds: string[];
  serviceDiscount: number;
  safePassage: boolean;
}

/**
 * Faction influence gain result
 */
export interface FactionInfluenceGainResult {
  territoryId: string;
  territoryName: string;
  factionId: TerritoryFactionId;
  influenceGained: number;
  newInfluence: number;
  oldInfluence: number;
  controlChanged: boolean;
  newControlLevel?: ControlLevel;
  nowControlled: boolean;
  controllingFaction?: TerritoryFactionId;
  message: string;
}

/**
 * Territory influence summary
 */
export interface TerritoryInfluenceSummary {
  territoryId: string;
  territoryName: string;
  territoryType: TerritoryType;
  controllingFaction?: TerritoryFactionId;
  controlLevel: ControlLevel;
  topFactions: Array<{
    factionId: TerritoryFactionId;
    influence: number;
    trend: 'rising' | 'falling' | 'stable';
  }>;
  stability: number;
  isContested: boolean;
}

/**
 * Faction overview across all territories
 */
export interface FactionOverview {
  factionId: TerritoryFactionId;
  totalTerritories: number;
  dominatedTerritories: number;
  controlledTerritories: number;
  disputedTerritories: number;
  contestedTerritories: number;
  totalInfluence: number;
  averageInfluence: number;
  strength: 'weak' | 'moderate' | 'strong' | 'dominant';
}

/**
 * Player faction alignment
 */
export interface PlayerFactionAlignment {
  characterId: string;
  gangId?: string;
  primaryFaction?: TerritoryFactionId;
  factionReputations: Partial<Record<TerritoryFactionId, number>>; // -100 to 100
  lastAlignmentChange?: Date;
}

/**
 * Faction control thresholds
 */
export const FACTION_CONTROL_THRESHOLDS = {
  CONTESTED_MAX: 30,
  DISPUTED_MIN: 30,
  DISPUTED_MAX: 49,
  CONTROLLED_MIN: 50,
  CONTROLLED_MAX: 69,
  DOMINATED_MIN: 70,
} as const;

/**
 * Influence gain amounts by source
 */
export const INFLUENCE_GAINS = {
  FACTION_QUEST_MIN: 5,
  FACTION_QUEST_MAX: 20,
  FACTION_DONATION_PER_100_GOLD: 1,
  ENEMY_KILL_MIN: 2,
  ENEMY_KILL_MAX: 10,
  STRUCTURE_BUILD_MIN: 10,
  STRUCTURE_BUILD_MAX: 30,
  EVENT_WIN_MIN: 15,
  EVENT_WIN_MAX: 50,
  GANG_ALIGNMENT_DAILY_MIN: 1,
  GANG_ALIGNMENT_DAILY_MAX: 5,
} as const;

/**
 * Influence loss amounts by source
 */
export const INFLUENCE_LOSSES = {
  FACTION_ATTACK_MIN: 5,
  FACTION_ATTACK_MAX: 20,
  RIVAL_QUEST_MIN: 2,
  RIVAL_QUEST_MAX: 10,
  CRIMINAL_ACTIVITY_MIN: 1,
  CRIMINAL_ACTIVITY_MAX: 5,
  EVENT_LOSS_MIN: 10,
  EVENT_LOSS_MAX: 30,
} as const;

/**
 * Daily decay rate
 */
export const INFLUENCE_DECAY = {
  DAILY_RATE: 1, // percentage per day
  MIN_INFLUENCE: 5, // floor for decay
  EQUILIBRIUM_TARGET: 16.67, // 100/6 factions
} as const;

/**
 * Player alignment benefits by control level
 */
export const ALIGNMENT_BENEFITS = {
  CONTESTED: {
    SHOP_DISCOUNT: 0,
    REPUTATION_BONUS: 0,
    CRIME_HEAT_REDUCTION: 0,
  },
  DISPUTED: {
    SHOP_DISCOUNT: 5,
    REPUTATION_BONUS: 5,
    CRIME_HEAT_REDUCTION: 5,
  },
  CONTROLLED: {
    SHOP_DISCOUNT: 15,
    REPUTATION_BONUS: 10,
    CRIME_HEAT_REDUCTION: 10,
  },
  DOMINATED: {
    SHOP_DISCOUNT: 25,
    REPUTATION_BONUS: 15,
    CRIME_HEAT_REDUCTION: 15,
  },
} as const;

/**
 * Faction names for display
 */
export const FACTION_NAMES: Record<TerritoryFactionId, string> = {
  [TerritoryFactionId.SETTLER_ALLIANCE]: 'Settler Alliance',
  [TerritoryFactionId.NAHI_COALITION]: 'Nahi Coalition',
  [TerritoryFactionId.FRONTERA_CARTEL]: 'Frontera Cartel',
  [TerritoryFactionId.US_MILITARY]: 'U.S. Military',
  [TerritoryFactionId.RAILROAD_BARONS]: 'Railroad Barons',
  [TerritoryFactionId.INDEPENDENT_OUTLAWS]: 'Independent Outlaws',
};

/**
 * Faction descriptions
 */
export const FACTION_DESCRIPTIONS: Record<TerritoryFactionId, string> = {
  [TerritoryFactionId.SETTLER_ALLIANCE]: 'Legitimate business owners and law enforcement seeking order',
  [TerritoryFactionId.NAHI_COALITION]: 'Native American tribes protecting sacred lands and traditions',
  [TerritoryFactionId.FRONTERA_CARTEL]: 'Criminal organization controlling smuggling and vice',
  [TerritoryFactionId.US_MILITARY]: 'Federal forces maintaining order and expanding territory',
  [TerritoryFactionId.RAILROAD_BARONS]: 'Corporate interests driving expansion and industrialization',
  [TerritoryFactionId.INDEPENDENT_OUTLAWS]: 'Player gangs and opportunistic criminals',
};
