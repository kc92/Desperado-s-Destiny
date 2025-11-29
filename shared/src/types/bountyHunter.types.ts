/**
 * Bounty Hunter System Types
 *
 * Types for the 10 unique bounty hunter NPCs who hunt wanted criminals
 */

import type { BountyFaction } from './bounty.types';

/**
 * Bounty hunter hunting methods
 */
export enum HuntingMethod {
  TRACKING = 'tracking',              // Follows tracks, patient pursuit
  AMBUSH = 'ambush',                  // Sets traps and ambushes
  SNIPER = 'sniper',                  // Long-range elimination
  INFILTRATION = 'infiltration',      // Social manipulation, disguise
  OVERWHELMING_FORCE = 'force',       // Direct assault with superior numbers
  SUPERNATURAL = 'supernatural',      // Uses supernatural abilities
  LEGAL_PRESSURE = 'legal',          // Uses law and social pressure
  RECKLESS = 'reckless',             // Charges in without planning
}

/**
 * Hunting behavior preferences
 */
export enum HuntingPreference {
  LETHAL = 'lethal',                 // Prefers to kill targets (dead or alive)
  NON_LETHAL = 'non_lethal',         // Always brings them in alive
  EITHER = 'either',                 // Doesn't care either way
  DEPENDS = 'depends',               // Depends on bounty or situation
}

/**
 * Hunter availability for hire
 */
export enum HireableBy {
  LAWFUL = 'lawful',                 // Only lawful players can hire
  CRIMINAL = 'criminal',             // Only criminals can hire
  ANYONE = 'anyone',                 // Anyone can hire
  FACTION_ONLY = 'faction_only',     // Only specific faction
  NOT_HIREABLE = 'not_hireable',     // Cannot be hired
}

/**
 * Hunter patrol behavior
 */
export interface HunterPatrol {
  /** Territories this hunter patrols */
  territories: string[];
  /** Movement speed (locations per hour) */
  movementSpeed: number;
  /** Whether hunter actively pursues or waits */
  pursueBehavior: 'active' | 'passive' | 'territorial';
  /** Patrol route (if fixed) */
  route?: string[];
}

/**
 * Hunting behavior configuration
 */
export interface HuntingBehavior {
  /** Minimum bounty to trigger hunt */
  minBountyToHunt: number;
  /** Preferred hunting method */
  preferredMethod: HuntingMethod;
  /** Lethal vs non-lethal preference */
  lethality: HuntingPreference;
  /** Tracking ability (1-10 scale) */
  trackingAbility: number;
  /** Patrol configuration */
  patrol: HunterPatrol;
  /** When hunter spawns to hunt */
  spawnTrigger: 'always' | 'high_bounty' | 'specific_crimes' | 'territory_only' | 'supernatural';
  /** How quickly hunter finds target (hours) */
  escalationRate: number;
  /** Special conditions or triggers */
  specialConditions?: string[];
}

/**
 * Combat statistics for hunter
 */
export interface HunterCombatStats {
  /** Health points */
  health: number;
  /** Base damage */
  damage: number;
  /** Hit accuracy percentage */
  accuracy: number;
  /** Defense/armor rating */
  defense: number;
  /** Special combat abilities */
  specialAbilities: string[];
  /** Critical hit chance */
  critChance?: number;
  /** Dodge/evasion chance */
  dodgeChance?: number;
}

/**
 * Hunter dialogue lines
 */
export interface HunterDialogue {
  /** When encountering target */
  encounterLines: string[];
  /** When target tries to negotiate */
  negotiationLines: string[];
  /** When accepting payment */
  payoffLines?: string[];
  /** When refusing payment */
  refusalLines?: string[];
  /** When hunter wins combat */
  victoryLines: string[];
  /** When hunter is defeated */
  defeatLines: string[];
  /** When hired by player */
  hireLines?: string[];
}

/**
 * Rewards for defeating the hunter
 */
export interface HunterRewards {
  /** Base gold reward */
  goldMin: number;
  goldMax: number;
  /** Experience reward */
  xpReward: number;
  /** Reputation gain */
  reputationGain: number;
  /** Possible loot items */
  possibleLoot: Array<{
    name: string;
    chance: number;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  }>;
  /** Special rewards for first defeat */
  firstDefeatReward?: {
    item: string;
    rarity: 'epic' | 'legendary';
  };
}

/**
 * Hire system configuration
 */
export interface HireConfiguration {
  /** Who can hire this hunter */
  hireableBy: HireableBy;
  /** Base cost to hire */
  baseCost: number;
  /** Cost multiplier based on target bounty */
  costMultiplier: number;
  /** Success rate (1-100) */
  successRate: number;
  /** Maximum bounty they'll pursue when hired */
  maxTargetBounty?: number;
  /** Minimum trust required */
  minTrustRequired?: number;
  /** Faction required */
  requiredFaction?: BountyFaction;
  /** Cooldown between hires (hours) */
  hireCooldown: number;
}

/**
 * Complete bounty hunter NPC definition
 */
export interface BountyHunter {
  /** Unique identifier */
  id: string;
  /** Hunter's name */
  name: string;
  /** Title/nickname */
  title: string;
  /** Hunter level (determines combat power) */
  level: number;
  /** Hunter specialty description */
  specialty: string;
  /** Hunting method */
  method: HuntingMethod;
  /** Personality description */
  personality: string;
  /** Primary faction affiliation */
  faction: BountyFaction | 'neutral' | 'supernatural';
  /** Territories where hunter operates */
  territory: string[];
  /** Hunting behavior */
  huntingBehavior: HuntingBehavior;
  /** Combat statistics */
  stats: HunterCombatStats;
  /** Dialogue system */
  dialogue: HunterDialogue;
  /** Rewards for defeating */
  rewards: HunterRewards;
  /** Hire configuration */
  hireConfig?: HireConfiguration;
  /** Backstory/lore */
  backstory: string;
  /** Current activity status */
  isActive?: boolean;
  /** Last spawn time */
  lastSpawn?: Date;
  /** Current target */
  currentTarget?: string;
}

/**
 * Hunter encounter instance
 */
export interface HunterEncounter {
  /** Encounter ID */
  id: string;
  /** Hunter involved */
  hunterId: string;
  hunterName: string;
  hunterLevel: number;
  /** Target being hunted */
  targetId: string;
  targetName: string;
  targetBounty: number;
  /** Encounter type */
  encounterType: 'random' | 'hired' | 'story' | 'patrol';
  /** Location of encounter */
  location: string;
  /** Can target pay off hunter? */
  canPayOff: boolean;
  /** Amount to pay off */
  payOffAmount?: number;
  /** Can target negotiate? */
  canNegotiate: boolean;
  /** Encounter status */
  status: 'active' | 'escaped' | 'captured' | 'hunter_defeated' | 'paid_off';
  /** When encounter started */
  createdAt: Date;
  /** When encounter resolved */
  resolvedAt?: Date;
  /** Who hired (if hired) */
  hiredBy?: string;
}

/**
 * Active hunter tracking
 */
export interface ActiveHunter {
  /** Hunter ID */
  hunterId: string;
  /** Current location */
  currentLocation: string;
  /** Current target (if hunting) */
  targetId?: string;
  /** Time until finds target */
  hoursUntilEncounter?: number;
  /** Last seen timestamp */
  lastUpdate: Date;
  /** Who hired them (if any) */
  hiredBy?: string;
  /** Hire expiration */
  hireExpiresAt?: Date;
}

/**
 * Hire hunter request
 */
export interface HireHunterRequest {
  hunterId: string;
  targetId: string;
  payment: number;
}

/**
 * Hire hunter response
 */
export interface HireHunterResponse {
  success: boolean;
  message: string;
  hunter?: {
    name: string;
    level: number;
    successRate: number;
    estimatedTime: number; // hours
  };
  cost?: number;
}

/**
 * Hunter spawn check result
 */
export interface HunterSpawnCheck {
  shouldSpawn: boolean;
  hunterId?: string;
  hunterName?: string;
  hunterLevel?: number;
  reason?: string;
  estimatedArrival?: number; // hours
}

/**
 * Pay off hunter request
 */
export interface PayOffHunterRequest {
  encounterId: string;
  amount: number;
}

/**
 * Pay off hunter response
 */
export interface PayOffHunterResponse {
  success: boolean;
  message: string;
  accepted: boolean;
}

/**
 * Get available hunters response
 */
export interface GetAvailableHuntersResponse {
  success: boolean;
  hunters: Array<{
    id: string;
    name: string;
    title: string;
    level: number;
    specialty: string;
    hireableBy: HireableBy;
    baseCost: number;
    successRate: number;
    currentlyHired: boolean;
  }>;
}

/**
 * Get active encounters response
 */
export interface GetActiveEncountersResponse {
  success: boolean;
  encounters: HunterEncounter[];
}
