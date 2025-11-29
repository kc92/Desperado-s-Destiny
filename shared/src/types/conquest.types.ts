/**
 * Conquest Mechanics Types
 *
 * Shared types for faction territory conquest system
 * Phase 11, Wave 11.2 - Conquest Mechanics
 */

import { TerritoryFactionId } from './territoryWar.types';

/**
 * Conquest stages
 */
export enum ConquestStage {
  CONTESTED = 'contested',         // Territory influence gap < 20%
  SIEGE_DECLARED = 'siege_declared', // Faction declared intent to siege
  ASSAULT = 'assault',             // Active war event
  CONTROL_CHANGE = 'control_change', // Control has transferred
  CONSOLIDATION = 'consolidation', // New controller establishing order
  STABLE = 'stable',               // Normal state, no conquest activity
}

/**
 * Conquest attempt status
 */
export enum ConquestAttemptStatus {
  PENDING = 'pending',             // Siege declared, waiting for war
  ACTIVE = 'active',               // War event in progress
  SUCCEEDED = 'succeeded',         // Attacker won
  FAILED = 'failed',               // Defender won
  CANCELLED = 'cancelled',         // Cancelled before completion
}

/**
 * Fortification types
 */
export enum FortificationType {
  WALLS = 'walls',                 // General defense
  WATCHTOWERS = 'watchtowers',     // Early warning
  BARRACKS = 'barracks',           // Troop capacity
  SUPPLY_DEPOT = 'supply_depot',   // Siege duration
  ARTILLERY = 'artillery',         // Siege weapon defense
}

/**
 * Occupation status
 */
export enum OccupationStatus {
  NONE = 'none',                   // Not occupied
  FRESH = 'fresh',                 // Just conquered (0-3 days)
  STABILIZING = 'stabilizing',     // 3-7 days
  STABLE = 'stable',               // 7+ days
}

/**
 * Resistance activity type
 */
export enum ResistanceActivityType {
  SABOTAGE = 'sabotage',           // Damage efficiency
  GUERRILLA = 'guerrilla',         // Small attacks
  PROPAGANDA = 'propaganda',       // Influence gain
  SMUGGLING = 'smuggling',         // Resource theft
  RECRUITMENT = 'recruitment',     // Build support
}

/**
 * Defense bonus
 */
export interface DefenseBonus {
  source: string;
  description: string;
  bonus: number;                   // Percentage bonus
  expiresAt?: Date;
}

/**
 * Control change record
 */
export interface ControlChange {
  previousController: TerritoryFactionId;
  newController: TerritoryFactionId;
  changedAt: Date;
  influenceChange: number;
  warEventId?: string;
  method: 'conquest' | 'liberation' | 'diplomatic' | 'abandonment';
}

/**
 * Siege requirement
 */
export interface SiegeRequirement {
  type: 'influence' | 'resources' | 'cooldown' | 'participants';
  met: boolean;
  current: number;
  required: number;
  description: string;
}

/**
 * Conquest objective
 */
export interface ConquestObjective {
  id: string;
  type: 'hold_position' | 'destroy_fortification' | 'capture_flag' | 'eliminate_defenders';
  description: string;
  points: number;
  completed: boolean;
  completedBy?: TerritoryFactionId;
  completedAt?: Date;
}

/**
 * Conquest resources
 */
export interface ConquestResources {
  gold: number;
  supplies: number;
  troops: number;
}

/**
 * Conquest attempt document
 */
export interface ConquestAttempt {
  _id: string;
  territoryId: string;
  territoryName: string;
  attackingFaction: TerritoryFactionId;
  defendingFaction: TerritoryFactionId;

  // Status
  stage: ConquestStage;
  status: ConquestAttemptStatus;
  declaredAt: Date;
  warEventId?: string;

  // Requirements met
  requirementsMet: SiegeRequirement[];
  allRequirementsMet: boolean;

  // Defense response
  defenseRallied: boolean;
  defendingAllies: TerritoryFactionId[];
  attackingAllies: TerritoryFactionId[];

  // Resources committed
  attackerResources: ConquestResources;
  defenderResources: ConquestResources;

  // War event results
  warScore?: {
    attacker: number;
    defender: number;
  };
  objectives?: ConquestObjective[];

  // Outcome
  completedAt?: Date;
  influenceResult?: number;
  controlTransferred: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Territory conquest state document
 */
export interface TerritoryConquestState {
  _id: string;
  territoryId: string;
  territoryName: string;
  currentController: TerritoryFactionId;
  controlEstablishedAt: Date;

  // Stability
  stabilityPeriodEnds?: Date;
  occupationStatus: OccupationStatus;
  occupationEfficiency: number;    // 0-100, how well new controller is managing

  // Siege state
  underSiege: boolean;
  siegeAttemptId?: string;
  contestedBy?: TerritoryFactionId[];

  // History
  previousControllers: ControlChange[];
  totalSiegesDefended: number;
  totalSiegesFallen: number;
  lastSiegeAt?: Date;

  // Conquest immunity
  conquestCooldownUntil?: Date;
  immunityReason?: string;

  // Fortifications
  fortificationLevel: number;      // 0-10
  fortifications: TerritoryFortification[];
  defenseBonuses: DefenseBonus[];
  totalDefenseBonus: number;       // Calculated total percentage

  // Resistance
  hasActiveResistance: boolean;
  resistanceStrength: number;      // 0-100
  resistanceActivities: ResistanceActivity[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Territory fortification
 */
export interface TerritoryFortification {
  id: string;
  type: FortificationType;
  level: number;                   // 0-10
  healthPercentage: number;        // 0-100, damage state
  defenseBonus: number;            // Percentage bonus from this fortification
  constructedAt: Date;
  lastUpgradedAt?: Date;
  damagedAt?: Date;
}

/**
 * Resistance activity
 */
export interface ResistanceActivity {
  id: string;
  type: ResistanceActivityType;
  faction: TerritoryFactionId;              // Faction conducting resistance
  strength: number;                // Impact of this activity
  frequency: number;               // How often it occurs
  lastOccurred: Date;
  effectDescription: string;
  active: boolean;
}

/**
 * Fortification build request
 */
export interface BuildFortificationRequest {
  territoryId: string;
  fortificationType: FortificationType;
  factionId: TerritoryFactionId;
}

/**
 * Fortification upgrade request
 */
export interface UpgradeFortificationRequest {
  territoryId: string;
  fortificationId: string;
  factionId: TerritoryFactionId;
}

/**
 * Fortification repair request
 */
export interface RepairFortificationRequest {
  territoryId: string;
  fortificationId: string;
  factionId: TerritoryFactionId;
}

/**
 * Siege declaration request
 */
export interface DeclareSiegeRequest {
  territoryId: string;
  attackingFaction: TerritoryFactionId;
  resourceCommitment: ConquestResources;
  requestedAllies?: TerritoryFactionId[];
  warDuration?: number;            // Hours, default 48
}

/**
 * Rally defense request
 */
export interface RallyDefenseRequest {
  siegeAttemptId: string;
  defendingFaction: TerritoryFactionId;
  resourceCommitment: ConquestResources;
  requestedAllies?: TerritoryFactionId[];
}

/**
 * Resistance action request
 */
export interface ResistanceActionRequest {
  territoryId: string;
  activityType: ResistanceActivityType;
  faction: TerritoryFactionId;              // Resisting faction
  resourcesCommitted: number;
}

/**
 * Conquest result
 */
export interface ConquestResult {
  success: boolean;
  territoryId: string;
  territoryName: string;
  previousController: TerritoryFactionId;
  newController: TerritoryFactionId;
  influenceChange: number;
  controlChange: ControlChange;
  message: string;
  rewards?: {
    gold: number;
    reputation: number;
    influenceGained: number;
  };
  penalties?: {
    influenceLost: number;
    goldLost: number;
    fortificationsDamaged: number;
  };
}

/**
 * Siege eligibility check
 */
export interface SiegeEligibility {
  canDeclare: boolean;
  territoryId: string;
  attackingFaction: TerritoryFactionId;
  requirements: SiegeRequirement[];
  estimatedCost: ConquestResources;
  estimatedDuration: number;       // Hours
  warnings: string[];
}

/**
 * Conquest statistics
 */
export interface ConquestStatistics {
  factionId: TerritoryFactionId;
  totalTerritoriesControlled: number;
  siegesInitiated: number;
  siegesWon: number;
  siegesLost: number;
  siegesDefended: number;
  totalInfluenceGained: number;
  totalInfluenceLost: number;
  fortificationsBuilt: number;
  resistanceActivitiesCompleted: number;
}

/**
 * Conquest overview
 */
export interface ConquestOverview {
  totalTerritories: number;
  activeConquests: number;
  recentConquests: ControlChange[];
  territoryStability: {
    stable: number;
    stabilizing: number;
    contested: number;
    underSiege: number;
  };
  factionStrength: Array<{
    factionId: TerritoryFactionId;
    territoriesControlled: number;
    totalFortificationLevel: number;
    averageDefenseBonus: number;
    activeResistances: number;
  }>;
}

/**
 * Post-conquest effect
 */
export interface PostConquestEffect {
  type: 'tax_change' | 'price_change' | 'quest_change' | 'npc_change' | 'law_change';
  description: string;
  affectedFactions: TerritoryFactionId[];
  magnitude: number;
  duration?: number;               // Days, undefined = permanent
  appliedAt: Date;
}

/**
 * Liberation campaign
 */
export interface LiberationCampaign {
  _id: string;
  territoryId: string;
  liberatingFaction: TerritoryFactionId;    // Former controller
  occupyingFaction: TerritoryFactionId;     // Current controller
  currentInfluence: number;        // Progress toward 40% siege threshold
  targetInfluence: number;         // Usually 40
  supportersCount: number;
  resourcesGathered: ConquestResources;
  startedAt: Date;
  estimatedCompletionAt?: Date;
  active: boolean;
}

/**
 * Diplomatic solution
 */
export interface DiplomaticSolution {
  territoryId: string;
  proposingFaction: TerritoryFactionId;
  targetFaction: TerritoryFactionId;
  solutionType: 'partial_return' | 'power_sharing' | 'tribute' | 'truce';
  terms: {
    influenceShare?: number;
    goldPayment?: number;
    territoryAccess?: boolean;
    duration?: number;             // Days
  };
  status: 'proposed' | 'accepted' | 'rejected' | 'expired';
  proposedAt: Date;
  expiresAt: Date;
}

/**
 * Conquest constants
 */
export const CONQUEST_CONSTANTS = {
  // Influence thresholds
  CONTESTED_THRESHOLD: 20,         // < 20% gap = contested
  SIEGE_THRESHOLD: 40,             // 40%+ influence can declare siege
  CONTROL_TRANSFER_GAIN: 30,      // Winner gains 25-40%, avg 30
  CONTROL_TRANSFER_FLOOR: 20,     // Loser drops to 20%

  // Timing
  WARNING_PERIOD_MIN: 24,          // Hours
  WARNING_PERIOD_MAX: 48,          // Hours
  ASSAULT_DURATION_MIN: 12,        // Hours
  ASSAULT_DURATION_MAX: 72,        // Hours
  STABILIZATION_PERIOD: 7,         // Days
  CONQUEST_COOLDOWN: 7,            // Days after siege

  // Resources
  MIN_GOLD_COST: 2000,
  MIN_SUPPLIES_COST: 500,
  MIN_TROOPS: 50,

  // Fortifications
  MAX_FORTIFICATION_LEVEL: 10,
  DEFENSE_BONUS_PER_LEVEL: 2.5,    // Percentage

  // Bonuses
  HOME_TERRITORY_BONUS: 15,        // Percentage
  FORTIFICATION_MAX_BONUS: 25,     // Percentage

  // Resistance
  RESISTANCE_BASE_DRAIN: 2,        // Influence per day
  RESISTANCE_MAX_STRENGTH: 100,
  LIBERATION_THRESHOLD: 40,        // Influence needed to counter-siege
} as const;

/**
 * Fortification costs
 */
export const FORTIFICATION_COSTS = {
  WALLS: {
    BASE_GOLD: 5000,
    BASE_SUPPLIES: 1000,
    BASE_TIME: 3,                  // Days
    UPGRADE_MULTIPLIER: 1.5,
    DEFENSE_PER_LEVEL: 2,
  },
  WATCHTOWERS: {
    BASE_GOLD: 3000,
    BASE_SUPPLIES: 500,
    BASE_TIME: 2,
    UPGRADE_MULTIPLIER: 1.4,
    DEFENSE_PER_LEVEL: 1.5,
  },
  BARRACKS: {
    BASE_GOLD: 4000,
    BASE_SUPPLIES: 800,
    BASE_TIME: 3,
    UPGRADE_MULTIPLIER: 1.5,
    DEFENSE_PER_LEVEL: 2,
  },
  SUPPLY_DEPOT: {
    BASE_GOLD: 3500,
    BASE_SUPPLIES: 700,
    BASE_TIME: 2,
    UPGRADE_MULTIPLIER: 1.4,
    DEFENSE_PER_LEVEL: 1.5,
  },
  ARTILLERY: {
    BASE_GOLD: 6000,
    BASE_SUPPLIES: 1200,
    BASE_TIME: 4,
    UPGRADE_MULTIPLIER: 1.6,
    DEFENSE_PER_LEVEL: 3,
  },
} as const;

/**
 * Resistance activity costs
 */
export const RESISTANCE_COSTS = {
  SABOTAGE: {
    GOLD: 500,
    INFLUENCE_DAMAGE: 5,
    SUCCESS_RATE: 0.6,
  },
  GUERRILLA: {
    GOLD: 1000,
    INFLUENCE_DAMAGE: 8,
    SUCCESS_RATE: 0.5,
  },
  PROPAGANDA: {
    GOLD: 800,
    INFLUENCE_GAIN: 3,
    SUCCESS_RATE: 0.7,
  },
  SMUGGLING: {
    GOLD: 600,
    RESOURCE_THEFT: 200,
    SUCCESS_RATE: 0.65,
  },
  RECRUITMENT: {
    GOLD: 1200,
    RESISTANCE_STRENGTH: 10,
    SUCCESS_RATE: 0.75,
  },
} as const;

/**
 * Fortification type names
 */
export const FORTIFICATION_NAMES: Record<FortificationType, string> = {
  [FortificationType.WALLS]: 'Defensive Walls',
  [FortificationType.WATCHTOWERS]: 'Watchtowers',
  [FortificationType.BARRACKS]: 'Barracks',
  [FortificationType.SUPPLY_DEPOT]: 'Supply Depot',
  [FortificationType.ARTILLERY]: 'Artillery Emplacements',
};

/**
 * Fortification descriptions
 */
export const FORTIFICATION_DESCRIPTIONS: Record<FortificationType, string> = {
  [FortificationType.WALLS]: 'Sturdy defensive walls provide general protection against sieges',
  [FortificationType.WATCHTOWERS]: 'Elevated observation posts give early warning of incoming threats',
  [FortificationType.BARRACKS]: 'Housing for troops increases defensive capacity',
  [FortificationType.SUPPLY_DEPOT]: 'Stockpiled resources extend siege endurance',
  [FortificationType.ARTILLERY]: 'Heavy weapons provide powerful defensive firepower',
};
