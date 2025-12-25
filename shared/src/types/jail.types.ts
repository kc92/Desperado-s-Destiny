/**
 * Jail Types
 *
 * Shared type definitions for the jail and death penalty system
 */

/**
 * Death types that can occur in the game
 */
export enum DeathType {
  COMBAT = 'combat',
  ENVIRONMENTAL = 'environmental',
  EXECUTION = 'execution',
  DUEL = 'duel',
  PVP = 'pvp'
}

/**
 * Jail activity types that players can perform while imprisoned
 */
export enum JailActivity {
  WAIT = 'wait',
  PRISON_LABOR = 'prison_labor',
  SOCIALIZE = 'socialize',
  ESCAPE_ATTEMPT = 'escape_attempt',
  BRIBE_GUARD = 'bribe_guard'
}

/**
 * Reasons for being jailed
 */
export enum JailReason {
  BOUNTY_COLLECTION = 'bounty_collection',
  CAUGHT_STEALING = 'caught_stealing',
  CAUGHT_CRIME = 'caught_crime',
  TURNED_IN = 'turned_in',
  SURRENDER = 'surrender',
  FAILED_ESCAPE = 'failed_escape',
  LAWFUL_EXECUTION = 'lawful_execution'
}

/**
 * Jail location IDs
 */
export enum JailLocation {
  PERDITION_JAIL = 'perdition_jail',
  SANGRE_JAIL = 'sangre_jail',
  REDSTONE_JAIL = 'redstone_jail',
  IRONWOOD_JAIL = 'ironwood_jail'
}

/**
 * Death penalty result
 */
export interface DeathPenalty {
  goldLost: number;
  itemsDropped: string[];
  xpLost: number;
  respawnLocation: string;
  respawnDelay: number;
  deathType: DeathType;
  respawned: boolean;
}

/**
 * Jail state information
 */
export interface JailState {
  characterId: string;
  isJailed: boolean;
  jailLocation: JailLocation | null;
  jailedAt: Date | null;
  releaseAt: Date | null;
  sentence: number; // Minutes
  reason: JailReason | null;
  bailAmount: number;
  canBail: boolean;
  remainingTime: number; // Minutes remaining
}

/**
 * Jail activity result
 */
export interface JailActivityResult {
  success: boolean;
  activity: JailActivity;
  message: string;
  goldEarned?: number;
  xpEarned?: number;
  sentenceReduced?: number; // Minutes
  sentenceIncreased?: number; // Minutes
  escaped?: boolean;
  bailCost?: number;
}

/**
 * Turn-in bounty result
 */
export interface TurnInResult {
  success: boolean;
  bountyReward: number;
  targetJailed: boolean;
  jailSentence: number;
  message: string;
}

/**
 * Escape attempt result
 */
export interface EscapeAttemptResult {
  success: boolean;
  escaped: boolean;
  caught: boolean;
  sentenceAdded?: number;
  damageReceived?: number;
  message: string;
}

/**
 * Bribe attempt result
 */
export interface BribeAttemptResult {
  success: boolean;
  accepted: boolean;
  goldSpent?: number;
  sentenceReduced?: number;
  released?: boolean;
  message: string;
}

/**
 * Bail payment result
 */
export interface BailPaymentResult {
  success: boolean;
  goldSpent: number;
  released: boolean;
  paidBy: string; // Character ID of who paid bail
  message: string;
}

/**
 * Death statistics
 */
export interface DeathStats {
  totalDeaths: number;
  deathsByCombat: number;
  deathsByEnvironmental: number;
  deathsByExecution: number;
  deathsByDuel: number;
  deathsByPVP: number;
  totalGoldLost: number;
  totalXPLost: number;
  totalItemsLost: number;
}

/**
 * Jail statistics
 */
export interface JailStats {
  totalArrests: number;
  totalJailTime: number; // Total minutes served
  successfulEscapes: number;
  failedEscapes: number;
  timesBailed: number;
  totalBailPaid: number;
  totalBribes: number;
  totalBribesPaid: number;
  prisonLaborGold: number;
  prisonLaborXP: number;
}

/**
 * Jail sentence configuration by crime severity
 */
export interface JailSentenceConfig {
  minor: { min: number; max: number }; // 5-15 minutes
  moderate: { min: number; max: number }; // 15-30 minutes
  major: { min: number; max: number }; // 30-60 minutes
  violent: { min: number; max: number }; // 60-120 minutes
}

/**
 * Default jail sentence durations
 */
export const JAIL_SENTENCES: JailSentenceConfig = {
  minor: { min: 5, max: 15 },
  moderate: { min: 15, max: 30 },
  major: { min: 30, max: 60 },
  violent: { min: 60, max: 120 }
};

/**
 * Death penalty percentages by type
 */
export const DEATH_PENALTIES = {
  [DeathType.COMBAT]: {
    goldLoss: 0.25, // 25% - INCREASED from 10% to make death meaningful
    xpLoss: 0.05, // 5% - INCREASED from 2%
    itemDropChance: 0.10 // 10% per item - INCREASED from 5%
  },
  [DeathType.ENVIRONMENTAL]: {
    goldLoss: 0.15, // 15% - INCREASED from 5%
    xpLoss: 0.03, // 3% - INCREASED from 1%
    itemDropChance: 0.05 // 5% per item - INCREASED from 2%
  },
  [DeathType.EXECUTION]: {
    goldLoss: 0.40, // 40% - INCREASED from 25% (execution is severe)
    xpLoss: 0.10, // 10% - INCREASED from 5%
    itemDropChance: 0.20 // 20% per item - INCREASED from 10%
  },
  [DeathType.DUEL]: {
    goldLoss: 0.25, // 25% - INCREASED from 15%
    xpLoss: 0.05, // 5% - INCREASED from 3%
    itemDropChance: 0.12 // 12% per item - INCREASED from 8%
  },
  [DeathType.PVP]: {
    goldLoss: 0.25, // 25% - INCREASED from 12%
    xpLoss: 0.05, // 5% - INCREASED from 3%
    itemDropChance: 0.12 // 12% per item - INCREASED from 7%
  }
};

/**
 * Respawn delay by death type (seconds)
 */
export const RESPAWN_DELAYS = {
  [DeathType.COMBAT]: 5,
  [DeathType.ENVIRONMENTAL]: 3,
  [DeathType.EXECUTION]: 10,
  [DeathType.DUEL]: 5,
  [DeathType.PVP]: 5
};

/**
 * Jail activity configurations
 */
export const JAIL_ACTIVITIES = {
  [JailActivity.PRISON_LABOR]: {
    goldReward: { min: 2, max: 4 },  // NERFED: Was 5-15, jail should be punishment not profitable
    xpReward: { min: 5, max: 10 },   // NERFED: Was 10-25
    cooldown: 30 // Minutes between labor jobs
  },
  [JailActivity.ESCAPE_ATTEMPT]: {
    baseSuccessChance: 0.10, // 10% base chance - REDUCED from 15% to make escape harder
    failurePenalty: 45, // +45 minutes on failure - INCREASED from 30
    cooldown: 120, // Can only try once per 2 hours - INCREASED from 60
    maxChance: 0.50 // Cap at 50% even with skills - REDUCED from 75%
  },
  [JailActivity.BRIBE_GUARD]: {
    baseAcceptChance: 0.30, // 30% base chance guard accepts
    costPerMinute: 10, // 10 gold per minute of sentence
    cooldown: 45 // Minutes between bribe attempts
  }
};

/**
 * Wanted level thresholds for arrest
 */
export const WANTED_ARREST_THRESHOLD = 3; // Wanted level 3+ can be arrested

/**
 * Bounty reward multiplier when turning in criminals
 */
export const BOUNTY_TURN_IN_MULTIPLIER = 1.5; // Get 1.5x the bounty amount
