/**
 * Permadeath System Types
 *
 * High-stakes death system with divine intervention, fate marks,
 * and gravestone inheritance mechanics.
 */

import { DeathType } from './jail.types';

// =============================================================================
// DEATH RISK CALCULATION
// =============================================================================

/**
 * Factors that determine death risk during dangerous actions
 */
export interface DeathRiskFactors {
  /** Your skill / required skill ratio (0.0 - 2.0, effectiveness capped at 1.5) */
  skillRatio: number;
  /** Current HP / Max HP (0.0 - 1.0) */
  healthRatio: number;
  /** Current wanted level (0-5) */
  wantedLevel: number;
  /** Inherent danger of the action (0.0 - 1.0) */
  actionDanger: number;
  /** Average tier of equipped gear (0-5) */
  equipmentTier: number;
  /** Accumulated bad luck marks (0-5) */
  fateMarks: number;
}

/**
 * Result of a death risk calculation
 */
export interface DeathRiskResult {
  /** Final calculated death risk (0.0 - 0.95) */
  risk: number;
  /** Human-readable danger level */
  dangerLevel: DangerLevel;
  /** Breakdown of contributing factors */
  factors: {
    skillSurvival: number;
    healthVulnerability: number;
    wantedMultiplier: number;
    equipmentProtection: number;
    fateMultiplier: number;
  };
}

/**
 * Danger levels for UI display (mysterious, not exact percentages)
 */
export enum DangerLevel {
  SAFE = 'safe',                   // 0-10% risk
  UNEASY = 'uneasy',               // 11-25% risk
  DANGEROUS = 'dangerous',         // 26-50% risk
  PERILOUS = 'perilous',           // 51-75% risk
  DEADLY = 'deadly',               // 76-90% risk
  CERTAIN_DOOM = 'certain_doom'    // 91%+ risk
}

/**
 * Danger level display configuration
 */
export const DANGER_LEVEL_CONFIG: Record<DangerLevel, {
  minRisk: number;
  maxRisk: number;
  tooltip: string;
  uiClass: string;
}> = {
  [DangerLevel.SAFE]: {
    minRisk: 0,
    maxRisk: 0.10,
    tooltip: '',
    uiClass: 'danger-safe'
  },
  [DangerLevel.UNEASY]: {
    minRisk: 0.11,
    maxRisk: 0.25,
    tooltip: 'The spirits stir...',
    uiClass: 'danger-uneasy'
  },
  [DangerLevel.DANGEROUS]: {
    minRisk: 0.26,
    maxRisk: 0.50,
    tooltip: 'Something watches from beyond...',
    uiClass: 'danger-dangerous'
  },
  [DangerLevel.PERILOUS]: {
    minRisk: 0.51,
    maxRisk: 0.75,
    tooltip: "Death's shadow falls upon you...",
    uiClass: 'danger-perilous'
  },
  [DangerLevel.DEADLY]: {
    minRisk: 0.76,
    maxRisk: 0.90,
    tooltip: 'The reaper draws near...',
    uiClass: 'danger-deadly'
  },
  [DangerLevel.CERTAIN_DOOM]: {
    minRisk: 0.91,
    maxRisk: 1.0,
    tooltip: 'This path leads to the grave...',
    uiClass: 'danger-doom'
  }
};

/**
 * Action danger ratings by category
 */
export enum ActionDangerRating {
  SAFE = 0,           // Socializing, shopping, resting
  LOW = 0.15,         // Pickpocketing, minor cons, saloon work
  MEDIUM = 0.35,      // Bar fights, cattle rustling, stagecoach robbery
  HIGH = 0.60,        // Bank robbery, train heist, bounty hunting
  EXTREME = 0.85      // Legendary outlaws, assassinations
}

// =============================================================================
// FATE MARKS SYSTEM
// =============================================================================

/**
 * Fate mark - accumulated bad luck that increases death risk
 */
export interface FateMark {
  /** When the mark was acquired */
  acquiredAt: Date;
  /** Source of the mark */
  source: FateMarkSource;
  /** Optional description */
  description?: string;
}

/**
 * Sources that can grant fate marks
 */
export enum FateMarkSource {
  DESTINY_DECK_CRITICAL_FAILURE = 'destiny_deck_critical_failure',
  FAILED_ESCAPE = 'failed_escape',
  NEAR_DEATH_EXPERIENCE = 'near_death_experience',
  CURSED_ITEM = 'cursed_item',
  DEITY_DISPLEASURE = 'deity_displeasure',
  BROKEN_DEAL = 'broken_deal'
}

/**
 * Fate mark system configuration
 */
export const FATE_MARK_CONFIG = {
  /** Maximum fate marks before guaranteed death check */
  maxMarks: 5,
  /** Hours of playtime for 1 mark to decay */
  decayHours: 24,
  /** Marks cleansed by church visit */
  churchCleanse: { min: 1, max: 2 },
  /** Gold cost per mark to cleanse at church */
  cleanseCostPerMark: 100,
  /** Critical failure threshold in Destiny Deck (worst X% of hands) */
  destinyDeckCriticalThreshold: 0.10
};

// =============================================================================
// MORTAL DANGER & DEATH FLOW
// =============================================================================

/**
 * Result when a character faces mortal danger
 */
export interface MortalDangerResult {
  /** Whether the character survived */
  survived: boolean;
  /** If survived, how they survived */
  survivalType?: SurvivalType;
  /** If died, the death outcome */
  deathOutcome?: PermadeathOutcome;
  /** Divine intervention details if applicable */
  divineIntervention?: DivineSalvation;
  /** Devil deal consumed if applicable */
  dealConsumed?: DevilDealType;
  /** Message to display */
  message: string;
  /** Whether Last Stand was triggered */
  lastStandTriggered: boolean;
}

/**
 * How a character survived mortal danger
 */
export enum SurvivalType {
  LUCKY_ROLL = 'lucky_roll',           // Beat the death risk roll
  DIVINE_GRACE = 'divine_grace',       // Saved by The Gambler
  OUTLAW_DEBT = 'outlaw_debt',         // Saved by The Outlaw King
  DEVIL_DEAL = 'devil_deal',           // Pre-purchased protection
  BORROWED_TIME = 'borrowed_time'      // Consumed borrowed time deal
}

/**
 * Outcome when permadeath occurs
 */
export interface PermadeathOutcome {
  /** Character ID that died */
  characterId: string;
  /** Character name */
  characterName: string;
  /** How they died */
  deathType: DeathType;
  /** Where they died */
  deathLocation: string;
  /** Who/what killed them */
  killerName?: string;
  /** Auto-generated epitaph */
  epitaph: string;
  /** When death occurred */
  diedAt: Date;
  /** Gravestone created */
  gravestoneId: string;
}

// =============================================================================
// KARMA JUDGEMENT / LAST STAND
// =============================================================================

/**
 * Karma state for Last Stand judgement
 */
export interface KarmaJudgement {
  /** Affinity with The Gambler (0-100) */
  gamblerScore: number;
  /** Affinity with The Outlaw King (0-100) */
  outlawScore: number;
  /** Current faith level (0-100) */
  faithLevel: number;
  /** Current sin level (0-100) */
  sinLevel: number;
  /** Individual karma dimensions */
  dimensions: {
    mercy: number;
    cruelty: number;
    greed: number;
    charity: number;
    justice: number;
    chaos: number;
    honor: number;
    deception: number;
    survival: number;
    loyalty: number;
  };
}

/**
 * Divine salvation when a deity saves the character
 */
export interface DivineSalvation {
  /** Which deity intervened */
  deity: DeityType;
  /** Type of salvation */
  type: SalvationType;
  /** Dramatic message to display */
  message: string;
  /** Blessing/curse applied */
  effect?: DivineSalvationEffect;
  /** Faith change from intervention */
  faithChange: number;
  /** Sin change from intervention */
  sinChange: number;
}

/**
 * Deities that can intervene
 */
export enum DeityType {
  THE_GAMBLER = 'the_gambler',
  THE_OUTLAW_KING = 'the_outlaw_king'
}

/**
 * Types of divine salvation
 */
export enum SalvationType {
  GRACE = 'grace',       // Pure mercy from The Gambler
  DEAL = 'deal',         // Bargain with The Outlaw King
  DESTINY = 'destiny'    // Fate itself intervenes
}

/**
 * Effects applied after divine salvation
 */
export interface DivineSalvationEffect {
  /** Effect name */
  name: string;
  /** Effect description */
  description: string;
  /** Duration in hours */
  durationHours: number;
  /** Mechanical bonuses */
  bonuses: {
    destinyDeckBonus?: number;     // % bonus to deck results
    crimeRewardBonus?: number;     // % bonus to crime rewards
    deathRiskReduction?: number;   // % reduction to death risk
  };
  /** Requirement to maintain the blessing (for Outlaw deals) */
  requirement?: {
    type: 'complete_chaotic_deed' | 'pay_tribute' | 'spread_chaos';
    deadline: Date;
    failurePenalty: string;
  };
}

/**
 * Salvation calculation configuration
 */
export const SALVATION_CONFIG = {
  /** Minimum Gambler score to have a chance */
  gamblerMinScore: 30,
  /** Maximum salvation chance from The Gambler */
  gamblerMaxChance: 0.60,
  /** Sin level that completely blocks The Gambler */
  gamblerSinBlock: 80,

  /** Minimum Outlaw score to have a chance */
  outlawMinScore: 30,
  /** Maximum salvation chance from Outlaw King */
  outlawMaxChance: 0.50,
  /** Sin bonus multiplier for Outlaw salvation */
  outlawSinBonus: 0.3,

  /** Faith multiplier for divine reach */
  faithMultiplier: 1.0,

  /** Gambler's Grace blessing duration (hours) */
  gamblerGraceDuration: 24,
  /** Gambler's Grace Destiny Deck bonus */
  gamblerGraceBonus: 0.10,

  /** Outlaw's Debt duration (hours) */
  outlawDebtDuration: 48,
  /** Outlaw's Debt crime bonus */
  outlawDebtBonus: 0.15,
  /** Days to complete chaotic deed after Outlaw salvation */
  outlawDeedDeadlineDays: 7
};

// =============================================================================
// DEVIL DEALS
// =============================================================================

/**
 * Types of devil deals available
 */
export enum DevilDealType {
  BORROWED_TIME = 'borrowed_time',       // One guaranteed survival
  DEATHS_DELAY = 'deaths_delay',         // Reduced death risk for duration
  SOUL_FRAGMENT = 'soul_fragment',       // Automatic Last Stand success
  ULTIMATE_WAGER = 'ultimate_wager'      // Immunity for one major heist
}

/**
 * Devil deal definition
 */
export interface DevilDealDefinition {
  type: DevilDealType;
  name: string;
  description: string;
  goldCost: number;
  sinCost: number;
  effect: string;
  duration?: string;  // 'until_used', '7_days', etc.
  singleUse: boolean;
}

/**
 * Active devil deal on a character
 */
export interface ActiveDevilDeal {
  /** Deal type */
  type: DevilDealType;
  /** When the deal was made */
  purchasedAt: Date;
  /** When the deal expires (if applicable) */
  expiresAt?: Date;
  /** Whether the deal has been consumed */
  consumed: boolean;
  /** When the deal was consumed */
  consumedAt?: Date;
}

/**
 * Devil deal configurations
 */
export const DEVIL_DEALS: Record<DevilDealType, DevilDealDefinition> = {
  [DevilDealType.BORROWED_TIME]: {
    type: DevilDealType.BORROWED_TIME,
    name: 'Borrowed Time',
    description: 'Cheat death once. When you would face mortal danger, survive instead.',
    goldCost: 500,
    sinCost: 5,
    effect: 'One guaranteed survival from mortal danger',
    duration: 'until_used',
    singleUse: true
  },
  [DevilDealType.DEATHS_DELAY]: {
    type: DevilDealType.DEATHS_DELAY,
    name: "Death's Delay",
    description: 'The reaper agrees to look the other way... for now.',
    goldCost: 1000,
    sinCost: 10,
    effect: '50% reduced death risk for all actions',
    duration: '7_days',
    singleUse: false
  },
  [DevilDealType.SOUL_FRAGMENT]: {
    type: DevilDealType.SOUL_FRAGMENT,
    name: 'Soul Fragment',
    description: 'Sell a piece of your soul. The Outlaw King will save you when it matters.',
    goldCost: 2000,
    sinCost: 20,
    effect: 'Automatic Last Stand success (once)',
    duration: 'until_used',
    singleUse: true
  },
  [DevilDealType.ULTIMATE_WAGER]: {
    type: DevilDealType.ULTIMATE_WAGER,
    name: 'The Ultimate Wager',
    description: 'Risk everything. Win everything. One legendary heist with no fear of death.',
    goldCost: -1, // Special: All gold
    sinCost: 30,
    effect: 'Immunity to permadeath for one major heist',
    duration: 'single_heist',
    singleUse: true
  }
};

// =============================================================================
// GRAVESTONE & INHERITANCE
// =============================================================================

/**
 * Gravestone record for a dead character
 */
export interface Gravestone {
  _id: string;
  /** Original character ID */
  characterId: string;
  /** Character name at death */
  characterName: string;
  /** User who owned the character */
  userId: string;

  // Death circumstances
  /** Character level at death */
  level: number;
  /** Location ID where death occurred */
  deathLocation: string;
  /** How they died */
  causeOfDeath: DeathType;
  /** Name of killer (NPC, player, or environmental hazard) */
  killerName?: string;
  /** Auto-generated epitaph */
  epitaph: string;
  /** When death occurred */
  diedAt: Date;

  // Inheritance pool
  /** Gold available for inheritance (% of character's gold) */
  goldPool: number;
  /** Item IDs eligible for inheritance as heirlooms */
  heirloomItemIds: string[];
  /** Skill levels at time of death for memory transfer */
  skillMemory: Record<string, number>;
  /** Prestige tier bonus percentage */
  prestigeBonus: number;

  // State
  /** Whether inheritance has been claimed */
  claimed: boolean;
  /** Character ID that claimed the inheritance */
  claimedBy?: string;
  /** When inheritance was claimed */
  claimedAt?: Date;
  /** Inheritance tier achieved */
  inheritanceTier?: InheritanceTier;
}

/**
 * Inheritance tiers based on Destiny Deck draw at gravestone
 */
export enum InheritanceTier {
  MEAGER = 'meager',           // High Card
  MODEST = 'modest',           // Pair
  FAIR = 'fair',               // Two Pair
  GOOD = 'good',               // Three of a Kind
  GREAT = 'great',             // Straight
  EXCELLENT = 'excellent',     // Flush
  LEGENDARY = 'legendary',     // Full House
  MYTHIC = 'mythic',           // Four of a Kind
  BLESSED = 'blessed'          // Straight Flush / Royal Flush
}

/**
 * Inheritance tier rewards
 */
export interface InheritanceTierReward {
  tier: InheritanceTier;
  /** Percentage of gold pool inherited */
  goldPercent: number;
  /** Number of heirloom items to receive */
  heirloomCount: number;
  /** Percentage of skill memory transferred */
  skillMemoryPercent: number;
  /** Additional gold bonus (for Mythic tier) */
  goldBonus?: number;
  /** Divine blessing (for Blessed tier) */
  divineBlessing?: boolean;
}

/**
 * Inheritance tier configuration
 */
export const INHERITANCE_TIERS: Record<InheritanceTier, InheritanceTierReward> = {
  [InheritanceTier.MEAGER]: {
    tier: InheritanceTier.MEAGER,
    goldPercent: 5,
    heirloomCount: 0,
    skillMemoryPercent: 0
  },
  [InheritanceTier.MODEST]: {
    tier: InheritanceTier.MODEST,
    goldPercent: 10,
    heirloomCount: 1,
    skillMemoryPercent: 5
  },
  [InheritanceTier.FAIR]: {
    tier: InheritanceTier.FAIR,
    goldPercent: 15,
    heirloomCount: 1,
    skillMemoryPercent: 8
  },
  [InheritanceTier.GOOD]: {
    tier: InheritanceTier.GOOD,
    goldPercent: 20,
    heirloomCount: 2,
    skillMemoryPercent: 12
  },
  [InheritanceTier.GREAT]: {
    tier: InheritanceTier.GREAT,
    goldPercent: 25,
    heirloomCount: 2,
    skillMemoryPercent: 15
  },
  [InheritanceTier.EXCELLENT]: {
    tier: InheritanceTier.EXCELLENT,
    goldPercent: 30,
    heirloomCount: 3,
    skillMemoryPercent: 18
  },
  [InheritanceTier.LEGENDARY]: {
    tier: InheritanceTier.LEGENDARY,
    goldPercent: 35,
    heirloomCount: 3,
    skillMemoryPercent: 22
  },
  [InheritanceTier.MYTHIC]: {
    tier: InheritanceTier.MYTHIC,
    goldPercent: 40,
    heirloomCount: 3,
    skillMemoryPercent: 25,
    goldBonus: 500
  },
  [InheritanceTier.BLESSED]: {
    tier: InheritanceTier.BLESSED,
    goldPercent: 50,
    heirloomCount: -1, // All heirlooms
    skillMemoryPercent: 30,
    divineBlessing: true
  }
};

/**
 * Prestige bonus per tier (added to inheritance percentages)
 */
export const PRESTIGE_INHERITANCE_BONUS = 5; // 5% per prestige tier

/**
 * Heirloom item properties
 */
export interface HeirloomItem {
  /** Original item ID */
  originalItemId: string;
  /** Item name */
  name: string;
  /** Degradation percentage (10-20%) */
  degradation: number;
  /** Name of the ancestor it belonged to */
  ancestorName: string;
  /** Story flavor text */
  flavorText: string;
}

/**
 * Result of claiming inheritance at a gravestone
 */
export interface InheritanceClaimResult {
  /** Whether the claim was successful */
  success: boolean;
  /** Inheritance tier achieved */
  tier: InheritanceTier;
  /** Gold received */
  goldReceived: number;
  /** Heirloom items received */
  heirlooms: HeirloomItem[];
  /** Skill boosts applied */
  skillBoosts: Record<string, number>;
  /** Divine blessing received (if Blessed tier) */
  divineBlessing?: DivineSalvationEffect;
  /** The Destiny Deck hand that determined the tier */
  destinyHand: string[];
  /** Message to display */
  message: string;
}

// =============================================================================
// EPITAPH GENERATION
// =============================================================================

/**
 * Epitaph templates based on karma alignment
 */
export const EPITAPH_TEMPLATES = {
  honorable: [
    '{name} died as they lived - with honor.',
    'Here lies {name}, a true soul of the West.',
    '{name} met their end standing tall.',
    'The frontier lost a good one in {name}.'
  ],
  chaotic: [
    '{name} died as they lived - on their own terms.',
    'Here lies {name}, who laughed at the law.',
    '{name} went down shooting.',
    'They said {name} was bad news. They were right.'
  ],
  merciful: [
    '{name} showed mercy until the end.',
    'Here lies {name}, who never forgot kindness.',
    '{name} died with a clean conscience.',
    'The gentle heart of {name} beats no more.'
  ],
  cruel: [
    '{name} died as they lived - without mercy.',
    'Here lies {name}, feared by many.',
    '{name} left a trail of blood.',
    'None mourn {name} but the crows.'
  ],
  greedy: [
    '{name} couldn\'t take it with them after all.',
    'Here lies {name}, whose gold meant nothing in the end.',
    '{name} died rich in gold, poor in friends.',
    'The fortune of {name} now belongs to the dust.'
  ],
  charitable: [
    '{name} gave until they had nothing left.',
    'Here lies {name}, friend to all.',
    '{name} died beloved by many.',
    'The generosity of {name} lives on.'
  ],
  neutral: [
    '{name} walked the line between good and evil.',
    'Here lies {name}, who carved their own path.',
    '{name} lived and died by the cards.',
    'The West claims another in {name}.'
  ]
};

// =============================================================================
// CONFIGURATION CONSTANTS
// =============================================================================

/**
 * Death risk calculation constants
 */
export const DEATH_RISK_CONFIG = {
  /** Maximum death risk (always a sliver of hope) */
  maxRisk: 0.95,
  /** Base survival bonus for over-skilled characters */
  overSkilledCap: 1.5,
  /** Health vulnerability multiplier */
  healthVulnerabilityFactor: 0.5,
  /** Wanted level risk increase per level */
  wantedRiskPerLevel: 0.15,
  /** Equipment protection range */
  equipmentProtection: { min: 0.7, max: 1.0 },
  /** Fate mark risk increase per mark */
  fateMarkRiskPerMark: 0.1
};

/**
 * Gravestone gold pool percentage (of character's gold at death)
 */
export const GRAVESTONE_GOLD_POOL_PERCENT = 0.5; // 50% of gold goes to pool

/**
 * Heirloom degradation range
 */
export const HEIRLOOM_DEGRADATION = {
  min: 0.10, // 10% stat loss
  max: 0.20  // 20% stat loss
};

/**
 * Skill memory transfer minimum (floor of transferred skill levels)
 */
export const SKILL_MEMORY_MINIMUM = 1;
