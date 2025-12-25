/**
 * Game Constants - Core Game Configuration Values
 *
 * Central configuration for game mechanics in Desperados Destiny
 */

import { Faction } from '../types/character.types';

/**
 * Energy system constants
 * BALANCE FIX: Added level-scaled energy costs to prevent premium advantage compounding
 *
 * Premium users get 1.5x faster regeneration via energyRegenBonus in premium.utils.ts
 * This means:
 * - Free: 150 energy / 5 hours = 30 energy/hour
 * - Premium: 250 energy / 3.33 hours = 75 energy/hour (2.5x faster rate!)
 */
export const ENERGY = {
  /** Maximum energy for free players */
  FREE_MAX: 150,
  /** Time in hours for free energy to fully regenerate */
  FREE_REGEN_TIME_HOURS: 5,
  /** Energy regenerated per hour for free players */
  FREE_REGEN_PER_HOUR: 30, // 150 / 5

  /** Maximum energy for premium players */
  PREMIUM_MAX: 250,
  /**
   * Effective time in hours for premium energy to fully regenerate
   * Calculation: FREE_REGEN_TIME_HOURS / energyRegenBonus = 5 / 1.5 = 3.33 hours
   * Premium fills FASTER than free despite having more capacity!
   */
  PREMIUM_REGEN_TIME_HOURS: 5 / 1.5, // ~3.33 hours (faster than free!)
  /**
   * Energy regenerated per hour for premium players
   * Calculation: PREMIUM_MAX / PREMIUM_REGEN_TIME_HOURS = 250 / 3.33 = 75/hour
   * This is 2.5x faster than free users!
   */
  PREMIUM_REGEN_PER_HOUR: 75, // 2.5x faster than free (30/hour)

  /** Energy cost for basic actions */
  BASIC_ACTION_COST: 5,
  /** Energy cost for challenge actions */
  CHALLENGE_ACTION_COST: 10,
  /** Energy cost for travel */
  TRAVEL_COST: 15,

  /**
   * Level-scaled energy cost multipliers
   * BALANCE FIX: Higher level actions cost more energy to prevent premium advantage compounding
   * This ensures high-level players can't grind infinitely faster than low-level players
   */
  LEVEL_SCALING: {
    /** Levels 1-10: base cost (×1.0) */
    TIER1_END: 10,
    TIER1_MULTIPLIER: 1.0,
    /** Levels 11-25: base × 1.25 */
    TIER2_END: 25,
    TIER2_MULTIPLIER: 1.25,
    /** Levels 26-40: base × 1.5 */
    TIER3_END: 40,
    TIER3_MULTIPLIER: 1.5,
    /** Levels 41-50: base × 2.0 */
    TIER4_MULTIPLIER: 2.0
  }
} as const;

/**
 * Character progression constants
 *
 * BALANCE FIX: XP multiplier reduced from 1.5 to 1.15
 * Old formula: XP = 100 × 1.5^(level-1) → Level 50 = ~10 trillion XP (impossible)
 * New formula: XP = 100 × 1.15^(level-1) → Level 50 = ~57,575 XP (achievable)
 *
 * Level XP requirements (cumulative):
 * Level 10: ~2,261 XP
 * Level 20: ~14,232 XP
 * Level 30: ~89,653 XP
 * Level 40: ~564,808 XP
 * Level 50: ~3.56 million XP
 */
export const PROGRESSION = {
  /** Minimum character level */
  MIN_LEVEL: 1,
  /** Maximum character level */
  MAX_LEVEL: 50,
  /** Base experience needed for level 2 */
  BASE_EXPERIENCE: 100,
  /**
   * Experience multiplier per level
   * BALANCE FIX: Reduced from 1.5 to 1.15 to make max level achievable
   * At 1.5x, level 50 required ~10 trillion XP (impossible)
   * At 1.15x, level 50 requires ~3.5 million XP (achievable in 2-3 months active play)
   */
  EXPERIENCE_MULTIPLIER: 1.15,
  /** Maximum characters per account */
  MAX_CHARACTERS_PER_ACCOUNT: 3,
  /**
   * Milestone levels that grant special bonuses
   * Reached at levels 10, 20, 30, 40, 50
   */
  MILESTONE_LEVELS: [10, 20, 30, 40, 50] as readonly number[],
  /**
   * Prestige threshold - levels above this are "prestige" ranks
   * Currently disabled (set to MAX_LEVEL)
   */
  PRESTIGE_THRESHOLD: 50
} as const;

/**
 * Faction definitions with lore, starting locations, and gameplay information
 */
export const FACTIONS = {
  [Faction.SETTLER_ALLIANCE]: {
    name: 'Settler Alliance',
    description: 'American settlers, prospectors, and corporate interests seeking fortune and expansion in the Sangre Territory. Values individualism, commerce, and manifest destiny.',
    startingLocation: 'Red Gulch',
    startingLocationId: '6501a0000000000000000001',
    culturalBonus: 'Craft',
    philosophy: 'Progress through industry and innovation',
    // Extended information for character creation
    extendedLore: 'From the gold-hungry prospectors to the railroad barons, the Settler Alliance represents the unstoppable wave of progress sweeping across the frontier. Their towns rise from nothing, their industry reshapes the land, and their ambition knows no bounds.',
    playstyle: 'Focus on crafting, trading, and building. Excel at creating items and earning gold through industry. Best choice for players who enjoy economic gameplay.',
    recommendedForNewPlayers: true,
    startingStats: { cunning: 10, spirit: 10, combat: 10, craft: 15 },
    strengths: ['Crafting & Manufacturing', 'Gold Accumulation', 'Item Quality'],
    weaknesses: ['Spiritual Resistance', 'Stealth Operations']
  },
  [Faction.NAHI_COALITION]: {
    name: 'Nahi Coalition',
    description: 'Indigenous Nahi peoples united to defend their ancestral lands and way of life. Masters of the land and spiritual traditions.',
    startingLocation: 'Kaiowa Mesa',
    startingLocationId: '6501a0000000000000000004',
    culturalBonus: 'Spirit',
    philosophy: 'Harmony with the land and ancestors',
    // Extended information for character creation
    extendedLore: 'The Nahi have called these lands home since time immemorial. Their shamans commune with the spirits, their warriors defend sacred grounds, and their wisdom guides those who seek balance in a world of chaos.',
    playstyle: 'Focus on spiritual abilities and connection with the land. Excel at mystical actions and destiny manipulation. Best for players who enjoy supernatural elements.',
    recommendedForNewPlayers: false,
    startingStats: { cunning: 10, spirit: 15, combat: 10, craft: 10 },
    strengths: ['Destiny Deck Manipulation', 'Spiritual Powers', 'Land Navigation'],
    weaknesses: ['Urban Commerce', 'Industrial Crafting']
  },
  [Faction.FRONTERA]: {
    name: 'Frontera',
    description: 'Mexican frontera communities blending old world traditions with new world opportunities. Masters of survival and adaptation.',
    startingLocation: 'The Frontera',
    startingLocationId: '6501a0000000000000000002',
    culturalBonus: 'Cunning',
    philosophy: 'Survival through adaptability and cunning',
    // Extended information for character creation
    extendedLore: 'Born at the crossroads of empires, the Frontera people have survived by wit and will. From the vaqueros to the banditos, they know that in the borderlands, the clever survive while the strong merely endure.',
    playstyle: 'Focus on stealth, crime, and clever tactics. Excel at smuggling, heists, and social manipulation. Best for players who enjoy outlaw gameplay.',
    recommendedForNewPlayers: false,
    startingStats: { cunning: 15, spirit: 10, combat: 10, craft: 10 },
    strengths: ['Crime Success Rate', 'Stealth Operations', 'Social Manipulation'],
    weaknesses: ['Spiritual Resistance', 'Heavy Combat']
  }
} as const;

/**
 * Destiny Deck constants
 */
export const DESTINY_DECK = {
  /** Cards in a standard deck */
  DECK_SIZE: 52,
  /** Cards in a player's Destiny Deck */
  HAND_SIZE: 5,
  /** Cards drawn for a challenge */
  CHALLENGE_DRAW: 5,
  /** Maximum cards a player can hold */
  MAX_HAND_SIZE: 7
} as const;

/**
 * Challenge difficulty levels
 */
export const CHALLENGE_DIFFICULTY = {
  TRIVIAL: 1,
  EASY: 2,
  MODERATE: 3,
  CHALLENGING: 4,
  HARD: 5,
  VERY_HARD: 6,
  EXTREME: 7,
  LEGENDARY: 8,
  MYTHIC: 9,
  IMPOSSIBLE: 10
} as const;

/**
 * Location types
 */
export const LOCATION_TYPES = {
  SETTLEMENT: 'SETTLEMENT',
  WILDERNESS: 'WILDERNESS',
  DUNGEON: 'DUNGEON',
  LANDMARK: 'LANDMARK',
  TRANSIT: 'TRANSIT'
} as const;

/**
 * Action costs in energy
 */
export const ACTION_COSTS = {
  REST: 0,
  SOCIAL: 5,
  EXPLORE: 10,
  CHALLENGE: 10,
  COMBAT: 15,
  CRAFT: 10,
  TRAVEL: 15,
  QUEST: 20
} as const;

/**
 * Time constants (in milliseconds)
 */
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000
} as const;

/**
 * Character limits and defaults
 */
export const CHARACTER_LIMITS = {
  /** Maximum dollars a character can hold (safe 32-bit integer) */
  MAX_DOLLARS: 2_147_483_647,
  /** @deprecated Use MAX_DOLLARS - kept for backward compatibility */
  MAX_GOLD: 2_147_483_647,
  /** Maximum inventory slots */
  MAX_INVENTORY_SIZE: 100,
  /** Maximum bank storage slots */
  MAX_BANK_SLOTS: 200,
  /** Maximum skill level */
  MAX_SKILL_LEVEL: 100,
  /** Default spawn location ID */
  DEFAULT_SPAWN_LOCATION: 'dusty-springs',
  /** Minimum name length */
  MIN_NAME_LENGTH: 3,
  /** Maximum name length */
  MAX_NAME_LENGTH: 20,
  /** Name regex pattern */
  NAME_PATTERN: /^[a-zA-Z0-9_-]+$/
} as const;

/**
 * Gang system constants
 */
export const GANG_CONSTANTS = {
  /** Minimum gang name length */
  MIN_NAME_LENGTH: 3,
  /** Maximum gang name length */
  MAX_NAME_LENGTH: 50,
  /** Minimum gang tag length */
  MIN_TAG_LENGTH: 2,
  /** Maximum gang tag length */
  MAX_TAG_LENGTH: 4,
  /** Maximum gang members */
  MAX_MEMBERS: 50,
  /** Gold required to create a gang */
  CREATION_COST: 5000,
  /** Maximum gold in gang bank */
  MAX_BANK_CAPACITY: 10_000_000,
  /** Cost to declare war on another gang */
  WAR_DECLARATION_COST: 1000,
  /** Energy cost for raids */
  RAID_ENERGY_COST: 10,
  /** Cooldown between raids (minutes) */
  RAID_COOLDOWN_MINUTES: 5,
  /** Maximum concurrent wars */
  MAX_CONCURRENT_WARS: 3,
  /** War duration (hours) */
  WAR_DURATION_HOURS: 48
} as const;

/**
 * Marketplace constants
 */
export const MARKETPLACE_CONSTANTS = {
  /** Transaction tax rate (5%) */
  TAX_RATE: 0.05,
  /** Minimum listing duration (hours) */
  MIN_LISTING_HOURS: 1,
  /** Maximum listing duration (hours) */
  MAX_LISTING_HOURS: 168, // 7 days
  /** Minimum bid increment */
  MIN_BID_INCREMENT: 1,
  /** Maximum active listings per character */
  MAX_ACTIVE_LISTINGS_PER_CHARACTER: 20,
  /** Cost for featured listing */
  FEATURED_LISTING_COST: 100,
  /** Auction extension time (seconds) when bid in last minutes */
  AUCTION_EXTENSION_SECONDS: 300,
  /** Price history retention (days) */
  PRICE_HISTORY_DAYS: 30
} as const;

/**
 * Combat system constants
 * IMPORTANT: DIFFICULTY_MULTIPLIER must be 100, NOT 100,000
 */
export const COMBAT_CONSTANTS = {
  /** Base energy cost for combat */
  BASE_ENERGY_COST: 5,
  /** Energy cost to flee */
  FLEE_ENERGY_COST: 3,
  /** Maximum encounter duration (minutes) */
  MAX_ENCOUNTER_DURATION_MINUTES: 30,
  /** Turn timeout (seconds) */
  TURN_TIMEOUT_SECONDS: 60,
  /**
   * Difficulty multiplier for challenge calculations
   * CRITICAL: This must be 100, not 100,000!
   * Used in action.controller.ts for deck challenges
   */
  DIFFICULTY_MULTIPLIER: 100,
  /** Maximum damage per hit */
  MAX_DAMAGE_PER_HIT: 999,
  /** Critical hit multiplier */
  CRITICAL_MULTIPLIER: 2.0,
  /** Flee success base chance (percentage) */
  FLEE_BASE_CHANCE: 30,

  /**
   * Skill damage bonus with diminishing returns
   * BALANCE FIX: Prevents +250 damage from 5 max-level combat skills
   * Formula creates +24 max per skill (not +50), +120 max total (not +250)
   */
  SKILL_BONUS: {
    /** Levels 1-10: +1.0 per level = +10 total */
    TIER1_END: 10,
    TIER1_RATE: 1.0,
    /** Levels 11-25: +0.5 per level = +7.5 total */
    TIER2_END: 25,
    TIER2_RATE: 0.5,
    /** Levels 26-50: +0.25 per level = +6.25 total */
    TIER3_RATE: 0.25,
    /** Maximum bonus per individual skill (prevents exploit stacking) */
    MAX_PER_SKILL: 24,
    /** Maximum total bonus across all combat skills */
    MAX_TOTAL: 120
  }
} as const;

/**
 * Gambling constants
 *
 * BALANCE FIX (Phase 4.3): Increased house edge and added daily limits
 * to prevent gambling from being an infinite gold faucet
 */
export const GAMBLING_CONSTANTS = {
  /** Minimum bet amount */
  MIN_BET: 1,
  /** Maximum bet amount */
  MAX_BET: 100_000,
  /**
   * Maximum games per day (soft limit)
   * BALANCE FIX (Phase 4.3): Reduced from 100 to 10
   */
  MAX_BETS_PER_DAY: 10,
  /**
   * Maximum total gold wagered per day
   * BALANCE FIX (Phase 4.3): New limit - 50,000 gold per day
   * This prevents wealthy players from grinding gambling indefinitely
   */
  MAX_DAILY_GOLD_WAGER: 50_000,
  /**
   * House edge (5%)
   * BALANCE FIX (Phase 4.3): Increased from 2% to 5%
   * Ensures gambling is a gold sink, not a gold source
   */
  HOUSE_EDGE: 0.05,
  /** Session timeout (minutes) */
  SESSION_TIMEOUT_MINUTES: 30,
  /** Cooldown between games (seconds) */
  GAME_COOLDOWN_SECONDS: 5,
  /** Maximum payout multiplier */
  MAX_PAYOUT_MULTIPLIER: 10
} as const;

/**
 * Hunting system constants
 */
export const HUNTING_CONSTANTS = {
  /** Energy cost for hunting */
  ENERGY_COST: 15,
  /** Maximum hunt duration (minutes) */
  MAX_HUNT_DURATION_MINUTES: 60,
  /** Tracking phase timeout (seconds) */
  TRACKING_TIMEOUT_SECONDS: 300,
  /** Shot placement timeout (seconds) */
  SHOT_PLACEMENT_TIMEOUT_SECONDS: 30,
  /** Maximum tracking distance */
  MAX_TRACKING_DISTANCE: 100,
  /** Minimum tracking distance for hunt to start */
  MIN_TRACKING_DISTANCE: 10,
  /** Energy cost for tracking phase */
  TRACKING_ENERGY: 5,
  /** Energy cost for stalking phase */
  STALKING_ENERGY: 5,
  /** Energy cost for shooting phase */
  SHOOTING_ENERGY: 10,
  /** Energy cost for harvesting */
  HARVESTING_ENERGY: 5,
  /** Base stealth value for stalking */
  BASE_STEALTH: 50,
  /** Bonus for using camouflage */
  CAMOUFLAGE_BONUS: 15,
  /** Bonus for using scent blocker */
  SCENT_BLOCKER_BONUS: 10,
  /** Chance of favorable wind conditions */
  WIND_FAVORABLE_CHANCE: 0.3,
  /** Weapon damage values by type */
  WEAPON_DAMAGE: {
    BOW: 30,
    RIFLE: 50,
    PISTOL: 25,
    KNIFE: 15,
    SHOTGUN: 45
  },
  /** Base shot difficulty by distance/type */
  SHOT_DIFFICULTY: {
    EASY: 50,
    MEDIUM: 70,
    HARD: 90,
    LEGENDARY: 120,
    NEAR: 40,
    FAR: 100
  },
  /** Shot placement damage multipliers */
  PLACEMENT_MULTIPLIERS: {
    HEAD: 2.0,
    HEART: 1.75,
    LUNGS: 1.5,
    BODY: 1.0,
    LIMB: 0.5,
    MISS: 0
  },
  /** Quality multipliers for harvest yields */
  QUALITY_MULTIPLIERS: {
    POOR: 0.5,
    COMMON: 1.0,
    GOOD: 1.25,
    EXCELLENT: 1.5,
    LEGENDARY: 2.0
  }
} as const;

/**
 * Duel system constants
 * BALANCE FIX: Added wager limits to prevent griefing and exploitation
 */
export const DUEL_CONSTANTS = {
  /** Minimum wager amount */
  MIN_WAGER: 0,
  /**
   * Maximum wager amount (absolute cap)
   * BALANCE FIX: Reduced from 1M to 100K to prevent devastating losses
   */
  MAX_WAGER: 100_000,
  /** Turn timeout (seconds) */
  TURN_TIMEOUT_SECONDS: 30,
  /** Grace period for reconnection (seconds) */
  RECONNECT_GRACE_PERIOD_SECONDS: 60,
  /** Maximum rounds per duel */
  MAX_ROUNDS: 5,
  /** Challenge expiration (minutes) */
  CHALLENGE_EXPIRATION_MINUTES: 5,
  /** Ranking points for win */
  RANKED_WIN_POINTS: 25,
  /** Ranking points for loss */
  RANKED_LOSS_POINTS: -15,

  /**
   * Wager limit system - prevents griefing and exploitation
   * BALANCE FIX: Dynamic wager caps based on level and wealth
   */
  WAGER_LIMITS: {
    /** Gold wager per character level (level * this value) */
    PER_LEVEL_MULTIPLIER: 1000,
    /** Maximum percentage of gold that can be wagered (0.1 = 10%) */
    MAX_GOLD_PERCENT: 0.1,
    /** Maximum level difference for wagered duels */
    MAX_LEVEL_DIFFERENCE: 10,
    /** Absolute minimum wager (for any wager duel) */
    ABSOLUTE_MIN: 100
  }
} as const;

/**
 * Rate limiting constants
 */
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: { max: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 min
  REGISTRATION: { max: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  PASSWORD_RESET: { max: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  MARKETPLACE: { max: 60, windowMs: 60 * 60 * 1000 }, // 60 per hour
  SHOP: { max: 100, windowMs: 60 * 60 * 1000 }, // 100 per hour
  GOLD_TRANSFER: { max: 20, windowMs: 60 * 60 * 1000 }, // 20 per hour
  CHAT: { max: 30, windowMs: 60 * 1000 }, // 30 per minute
  ADMIN: { max: 100, windowMs: 60 * 1000 }, // 100 per minute
  FRIEND_REQUEST: { max: 20, windowMs: 60 * 60 * 1000 }, // 20 per hour
  MAIL: { max: 30, windowMs: 60 * 60 * 1000 } // 30 per hour
} as const;

/**
 * Sanity system constants
 */
export const SANITY_CONSTANTS = {
  /** Maximum sanity points */
  MAX_SANITY: 100,
  /** Sanity regeneration per hour in safe areas */
  REGEN_RATE_PER_HOUR: 5,
  /** Towns where sanity regenerates */
  SAFE_TOWNS: ['dusty-springs', 'frontier-falls', 'red-rock'],
  /** Sanity state thresholds */
  STATES: {
    STABLE: { min: 80, max: 100, debuff: 0 },
    RATTLED: { min: 60, max: 79, debuff: 0.05 },
    SHAKEN: { min: 40, max: 59, debuff: 0.10 },
    BREAKING: { min: 20, max: 39, debuff: 0.20 },
    SHATTERED: { min: 0, max: 19, debuff: 0.35 }
  }
} as const;

/**
 * Level tier definitions
 */
export const LEVEL_TIERS = {
  /** Number of levels per tier */
  TIER_SIZE: 5,
  /** Tier definitions */
  TIERS: [
    { min: 1, max: 5, name: 'Greenhorn', color: '#808080' },
    { min: 6, max: 10, name: 'Tenderfoot', color: '#228B22' },
    { min: 11, max: 20, name: 'Frontier Hand', color: '#4169E1' },
    { min: 21, max: 30, name: 'Trailblazer', color: '#9932CC' },
    { min: 31, max: 40, name: 'Frontier Veteran', color: '#FFD700' },
    { min: 41, max: 50, name: 'Legend of the West', color: '#FF4500' }
  ]
} as const;

/**
 * Quest system constants
 */
export const QUEST_CONSTANTS = {
  /** Maximum active quests */
  MAX_ACTIVE_QUESTS: 10,
  /** Maximum daily quests */
  MAX_DAILY_QUESTS: 3,
  /** Quest expiration for timed quests (hours) */
  TIMED_QUEST_HOURS: 24,
  /** Cooldown for repeatable quests (hours) */
  REPEATABLE_COOLDOWN_HOURS: 24
} as const;

/**
 * Cosmic Horror (Eldritch) system constants
 */
export const COSMIC_CONSTANTS = {
  /** Maximum corruption level */
  MAX_CORRUPTION: 100,
  /** Corruption decay per hour */
  CORRUPTION_DECAY_PER_HOUR: 1,
  /** Corruption threshold for hallucinations */
  HALLUCINATION_THRESHOLD: 50,
  /** Maximum eldritch encounters per day */
  MAX_ENCOUNTERS_PER_DAY: 5,
  /** Session timeout (minutes) */
  SESSION_TIMEOUT_MINUTES: 30
} as const;

/**
 * Wealth Tax constants
 * BALANCE FIX: Progressive daily tax on hoarded gold to prevent extreme wealth inequality
 *
 * Prevents runaway inflation by taxing accumulated wealth:
 * - Encourages spending/investing rather than hoarding
 * - Creates a gold sink that scales with wealth
 * - Keeps economy healthier for new players
 *
 * PHASE 19: Added Tycoon Tax Tiers ($50M+, $100M+)
 * Master tier players can earn $2-3M/day, causing inflation
 * Higher tiers discourage extreme hoarding without punishing active play
 */
export const WEALTH_TAX = {
  /** Gold amounts below this are not taxed (protects new players) */
  EXEMPT_THRESHOLD: 100_000,

  /**
   * Tax tiers - applied progressively like real income tax brackets
   *
   * PHASE 19: Added tycoon tiers for $50M+ and $100M+ wealth
   * Philosophy: We want wealthy players to SPEND, not HOARD
   */
  TIERS: [
    /** 0-100K: No tax (exempt) - protects newcomers */
    { min: 0, max: 100_000, rate: 0 },
    /** 100K-1M: 0.1% daily ($1K taxed/day at $1M) */
    { min: 100_000, max: 1_000_000, rate: 0.001 },
    /** 1M-10M: 0.25% daily ($25K taxed/day at $10M) */
    { min: 1_000_000, max: 10_000_000, rate: 0.0025 },
    /** 10M-50M: 0.5% daily ($250K taxed/day at $50M) */
    { min: 10_000_000, max: 50_000_000, rate: 0.005 },
    /** PHASE 19: 50M-100M: 0.8% daily - TYCOON TIER 1 */
    { min: 50_000_000, max: 100_000_000, rate: 0.008 },
    /** PHASE 19: 100M+: 1.2% daily - TYCOON TIER 2 (encourages luxury spending) */
    { min: 100_000_000, max: Infinity, rate: 0.012 }
  ] as const,

  /** Minimum tax amount to collect (don't bother with < 1 gold) */
  MIN_COLLECTION_AMOUNT: 1,

  /**
   * Maximum tax per collection (absolute cap to prevent catastrophic loss)
   * PHASE 19: Increased from 500K to 1.2M to accommodate tycoon tiers
   */
  MAX_DAILY_TAX: 1_200_000,

  /** Grace period after character creation (days) - don't tax new players */
  NEW_PLAYER_GRACE_DAYS: 7,

  /**
   * PHASE 19: Luxury Sinks - expensive items that provide prestige/convenience
   * These give tycoons something to spend on instead of hoarding
   */
  LUXURY_SINK_IDS: [
    'golden_revolver',      // $500K - cosmetic weapon skin
    'private_railcar',      // $2M - instant fast travel
    'ranch_estate',         // $10M - 10 extra worker slots
    'bank_ownership_stake'  // $50M - +1% interest on deposits
  ] as const
} as const;

/**
 * Property system constants
 * BALANCE FIX: Added income caps to prevent exponential wealth accumulation
 */
export const PROPERTY_CONSTANTS = {
  /** Maximum properties per character */
  MAX_PROPERTIES_PER_CHARACTER: 5,
  /** Tax collection interval (days) */
  TAX_INTERVAL_DAYS: 7,
  /** Grace period for unpaid taxes (days) */
  TAX_GRACE_PERIOD_DAYS: 3,
  /** Property abandonment after unpaid taxes (days) */
  ABANDONMENT_DAYS: 14,

  /**
   * Income cap system - prevents exponential wealth from properties
   * BALANCE FIX: Previously uncapped, allowing 7.5M+ gold/month passive income
   */
  INCOME_CAP: {
    /** Base daily dollar cap (applies to all characters) */
    BASE_DAILY_CAP: 5000,
    /** Additional cap per character level */
    PER_LEVEL_BONUS: 100,
    /** Diminishing returns multiplier per additional property (0.8 = 80% of previous) */
    MULTI_PROPERTY_DIMINISHING: 0.8,
    /** Maximum daily income regardless of level/properties */
    ABSOLUTE_MAX_DAILY: 25000
  }
} as const;

/**
 * PHASE 19: Newcomer Stake System
 *
 * Gives new players a +50% gold bonus during their first few hours of play.
 * This helps newcomers get established without making the early game feel punishing.
 *
 * Philosophy: "Everyone deserves a fair stake to start their journey in the West"
 */
export const NEWCOMER_STAKE = {
  /** Duration of the newcomer bonus (milliseconds) - 2 hours */
  DURATION_MS: 2 * 60 * 60 * 1000,

  /** Gold multiplier during newcomer period (1.5 = +50%) */
  GOLD_MULTIPLIER: 1.5,

  /** XP multiplier during newcomer period (no bonus, just gold) */
  XP_MULTIPLIER: 1.0,

  /** Message shown to newcomers */
  ACTIVE_MESSAGE: "Newcomer's Luck! +50% gold for your first 2 hours.",

  /** Message when stake expires */
  EXPIRED_MESSAGE: "Your newcomer's luck has run out. Time to earn your fortune the hard way!",

  /** Whether to show a notification when stake expires */
  NOTIFY_ON_EXPIRE: true,

  /** Minimum play time to be considered for stake (prevents abuse via new accounts) */
  MIN_PLAYTIME_FOR_STAKE_MS: 0, // Start immediately

  /** Whether premium players also get the stake (yes - it stacks) */
  APPLIES_TO_PREMIUM: true
} as const;

/**
 * Currency System Constants
 *
 * Defines the three-currency economy:
 * - Dollars ($) - Primary currency for all transactions
 * - Gold Resource - Valuable material (~$100 base, dynamic pricing)
 * - Silver Resource - Common material (~$10 base, dynamic pricing)
 *
 * Gold and Silver are resources that can be mined, found, crafted,
 * and sold/bought at fluctuating market rates.
 */
export const CURRENCY_CONSTANTS = {
  // ===========================================
  // PRIMARY CURRENCY (DOLLARS)
  // ===========================================
  /** Maximum dollars a character can hold (safe 32-bit integer) */
  MAX_DOLLARS: 2_147_483_647,
  /** Starting dollars for new characters */
  STARTING_DOLLARS: 100,

  // ===========================================
  // GOLD RESOURCE
  // ===========================================
  /** Maximum gold resource a character can hold */
  MAX_GOLD_RESOURCE: 100_000,
  /** Base exchange rate: 1 Gold = $100 */
  GOLD_BASE_RATE: 100,
  /** Minimum exchange rate (floor) */
  GOLD_MIN_RATE: 50,
  /** Maximum exchange rate (ceiling) */
  GOLD_MAX_RATE: 200,
  /** Price volatility: +/- 20% from world events */
  GOLD_VOLATILITY: 0.20,

  // ===========================================
  // SILVER RESOURCE
  // ===========================================
  /** Maximum silver resource a character can hold */
  MAX_SILVER_RESOURCE: 1_000_000,
  /** Base exchange rate: 1 Silver = $10 */
  SILVER_BASE_RATE: 10,
  /** Minimum exchange rate (floor) */
  SILVER_MIN_RATE: 5,
  /** Maximum exchange rate (ceiling) */
  SILVER_MAX_RATE: 25,
  /** Price volatility: +/- 15% from world events */
  SILVER_VOLATILITY: 0.15,

  // ===========================================
  // EXCHANGE SYSTEM
  // ===========================================
  /** Transaction fee for exchanging resources (5%) */
  EXCHANGE_FEE_RATE: 0.05,
  /** Minimum resource amount for exchange */
  MIN_EXCHANGE_AMOUNT: 1,
  /** Maximum resource amount per exchange transaction */
  MAX_EXCHANGE_AMOUNT: 10_000,
  /** Cooldown between exchange transactions (seconds) */
  EXCHANGE_COOLDOWN_SECONDS: 5,

  // ===========================================
  // PRICE UPDATE SCHEDULE
  // ===========================================
  /** How often prices auto-fluctuate (milliseconds) - every 4 hours */
  PRICE_UPDATE_INTERVAL_MS: 4 * 60 * 60 * 1000,
  /** Random fluctuation per update (+/- percentage) */
  PRICE_FLUCTUATION_RANGE: 0.05,
  /** Days of price history to retain */
  PRICE_HISTORY_RETENTION_DAYS: 90,

  // ===========================================
  // DISPLAY FORMATTING
  // ===========================================
  /** Currency symbols/prefixes */
  SYMBOLS: {
    DOLLARS: '$',
    GOLD: 'g',      // e.g., "15g" for 15 gold
    SILVER: 's'     // e.g., "250s" for 250 silver
  },
  /** Verbose names for UI */
  NAMES: {
    DOLLARS: 'Dollars',
    GOLD: 'Gold',
    SILVER: 'Silver'
  }
} as const;
