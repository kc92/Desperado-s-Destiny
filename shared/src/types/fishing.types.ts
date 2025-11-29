/**
 * Fishing System Types
 *
 * Complete type definitions for the fishing system in Desperados Destiny
 */

/**
 * Fish rarity tiers
 */
export enum FishRarity {
  COMMON = 'COMMON',
  QUALITY = 'QUALITY',
  RARE = 'RARE',
  LEGENDARY = 'LEGENDARY'
}

/**
 * Fish species categories
 */
export enum FishCategory {
  CATFISH = 'CATFISH',
  BASS = 'BASS',
  TROUT = 'TROUT',
  PANFISH = 'PANFISH',
  PIKE = 'PIKE',
  STURGEON = 'STURGEON',
  EXOTIC = 'EXOTIC'
}

/**
 * Water types for fishing locations
 */
export enum WaterType {
  RIVER = 'RIVER',
  LAKE = 'LAKE',
  STREAM = 'STREAM',
  POND = 'POND',
  UNDERGROUND = 'UNDERGROUND',
  SACRED = 'SACRED'
}

/**
 * Time of day affects fish activity
 */
export enum FishingTimeOfDay {
  DAWN = 'DAWN',       // 5am-7am: +20% activity
  MORNING = 'MORNING', // 7am-11am: Normal
  MIDDAY = 'MIDDAY',   // 11am-3pm: -10% activity
  AFTERNOON = 'AFTERNOON', // 3pm-6pm: Normal
  DUSK = 'DUSK',       // 6pm-8pm: +20% activity
  NIGHT = 'NIGHT'      // 8pm-5am: Special fish
}

/**
 * Weather conditions affect fishing
 */
export enum FishingWeather {
  CLEAR = 'CLEAR',     // Normal
  CLOUDY = 'CLOUDY',   // +10% bite rate
  RAIN = 'RAIN',       // +15% bite rate, different fish
  STORM = 'STORM',     // -50% bite rate, dangerous
  FOG = 'FOG'          // Mystery fish bonus
}

/**
 * Fishing spot types within a location
 */
export enum SpotType {
  SHALLOW = 'SHALLOW',     // Near shore
  DEEP = 'DEEP',           // Deep water
  STRUCTURE = 'STRUCTURE', // Near rocks/logs
  SURFACE = 'SURFACE',     // Top water
  BOTTOM = 'BOTTOM'        // Bottom feeding
}

/**
 * Fight phases
 */
export enum FightPhase {
  HOOKING = 'HOOKING',     // Initial hook set
  FIGHTING = 'FIGHTING',   // Active fight
  LANDING = 'LANDING'      // Final moments
}

/**
 * Fish size categories
 */
export enum FishSize {
  TINY = 'TINY',         // Under minimum
  SMALL = 'SMALL',       // Small but keepable
  AVERAGE = 'AVERAGE',   // Normal size
  LARGE = 'LARGE',       // Above average
  TROPHY = 'TROPHY',     // Wall hanger
  LEGENDARY = 'LEGENDARY' // Massive specimen
}

/**
 * Rod types
 */
export enum RodType {
  CANE_POLE = 'CANE_POLE',
  BAMBOO_ROD = 'BAMBOO_ROD',
  STEEL_ROD = 'STEEL_ROD',
  CUSTOM_ROD = 'CUSTOM_ROD'
}

/**
 * Reel types
 */
export enum ReelType {
  SIMPLE_REEL = 'SIMPLE_REEL',
  MULTIPLIER_REEL = 'MULTIPLIER_REEL',
  DRAG_REEL = 'DRAG_REEL'
}

/**
 * Line types
 */
export enum LineType {
  COTTON_LINE = 'COTTON_LINE',
  SILK_LINE = 'SILK_LINE',
  HORSEHAIR_LINE = 'HORSEHAIR_LINE',
  WIRE_LEADER = 'WIRE_LEADER'
}

/**
 * Bait types
 */
export enum BaitType {
  WORMS = 'WORMS',
  MINNOWS = 'MINNOWS',
  CRAWFISH = 'CRAWFISH',
  INSECTS = 'INSECTS',
  CUT_BAIT = 'CUT_BAIT',
  SPECIAL_BAIT = 'SPECIAL_BAIT',
  GOLDEN_GRUB = 'GOLDEN_GRUB',      // Rare bait
  SPIRIT_WORM = 'SPIRIT_WORM',      // Legendary bait
  BLOOD_LURE = 'BLOOD_LURE'         // Cursed bait
}

/**
 * Lure types
 */
export enum LureType {
  SPOON_LURE = 'SPOON_LURE',
  FLY_LURE = 'FLY_LURE',
  JIG = 'JIG',
  PLUG = 'PLUG'
}

/**
 * Fish species definition
 */
export interface FishSpecies {
  id: string;
  name: string;
  scientificName: string;
  rarity: FishRarity;
  category: FishCategory;

  // Description
  description: string;
  lore?: string;

  // Habitat
  waterTypes: WaterType[];
  locations: string[]; // Location IDs where this fish can be found

  // Behavior
  activeTimeOfDay: FishingTimeOfDay[];
  preferredWeather: FishingWeather[];
  depthPreference: SpotType[];

  // Size range (in pounds)
  minWeight: number;
  maxWeight: number;
  averageWeight: number;
  recordWeight: number;

  // Bite mechanics
  baseChance: number;    // Base % chance per minute (0-100)
  biteSpeed: number;     // How fast to react (ms)
  hookDifficulty: number; // Difficulty to set hook (1-100)

  // Fight mechanics
  baseFightTime: number; // Seconds
  fightDifficulty: number; // 1-100
  stamina: number;       // Fish stamina pool
  aggression: number;    // How hard fish fights (0-100)

  // Best bait/lures
  preferredBait: BaitType[];
  preferredLures: LureType[];

  // Rewards
  baseValue: number;     // Gold value
  experience: number;    // XP for catching

  // Special properties
  isLegendary?: boolean;
  onePerLocation?: boolean; // Only one exists per location
  requiresSpecialBait?: boolean;

  // Alchemy/crafting drops
  drops?: {
    itemId: string;
    chance: number; // 0-1
    quantity: [number, number]; // min, max
  }[];
}

/**
 * Fishing location definition
 */
export interface FishingLocation {
  id: string;
  name: string;
  description: string;
  locationId: string; // Parent game location

  // Type and characteristics
  waterType: WaterType;
  difficulty: number; // 1-100

  // Access
  discoveredByDefault: boolean;
  requiredLevel?: number;
  requiredReputation?: {
    faction: string;
    amount: number;
  };

  // Fish available
  commonFish: string[];   // Fish species IDs
  qualityFish: string[];
  rareFish: string[];
  legendaryFish?: string; // One legendary per location

  // Environmental factors
  scenicValue: number; // For ambiance (1-100)
  danger: number;      // 0-100, affects random events

  // Spots within location
  availableSpots: SpotType[];

  // Special properties
  isSecretLocation?: boolean;
  requiresQuest?: string; // Quest ID to unlock

  // Lore
  folklore?: string;
}

/**
 * Fishing gear - Rod
 */
export interface FishingRod {
  id: string;
  name: string;
  description: string;
  type: RodType;

  // Stats
  castDistance: number;  // 1-100
  flexibility: number;   // 1-100 (affects fight)
  strength: number;      // Max fish size (1-100)
  durability: number;    // Max uses

  // Requirements
  requiredLevel?: number;
  requiredSkill?: number;

  // Cost
  price: number;

  // Special bonuses
  bonuses?: {
    catchChance?: number;  // % bonus
    fightBonus?: number;   // % easier
    experienceBonus?: number; // % more XP
  };
}

/**
 * Fishing gear - Reel
 */
export interface FishingReel {
  id: string;
  name: string;
  description: string;
  type: ReelType;

  // Stats
  retrieveSpeed: number; // 1-100
  dragStrength: number;  // 1-100
  lineCapacity: number;  // How much line

  // Requirements
  requiredLevel?: number;

  // Cost
  price: number;

  // Special bonuses
  bonuses?: {
    fightTime?: number;    // % faster
    tensionControl?: number; // % better
  };
}

/**
 * Fishing gear - Line
 */
export interface FishingLine {
  id: string;
  name: string;
  description: string;
  type: LineType;

  // Stats
  strength: number;      // 1-100 (max fish weight)
  visibility: number;    // 1-100 (lower = better)
  flexibility: number;   // 1-100

  // Cost
  price: number;

  // Special properties
  forPike?: boolean;     // Wire leader for toothy fish
}

/**
 * Bait item
 */
export interface Bait {
  id: string;
  name: string;
  description: string;
  type: BaitType;

  // Effectiveness
  attractiveness: number; // 1-100
  targetFish?: FishCategory[]; // Works best on these

  // Availability
  price: number;
  consumable: boolean;

  // Special properties
  bonusBiteChance?: number; // % bonus
  attractsRare?: boolean;
}

/**
 * Lure item
 */
export interface Lure {
  id: string;
  name: string;
  description: string;
  type: LureType;

  // Effectiveness
  attractiveness: number;
  targetFish?: FishCategory[];
  depth: SpotType[];

  // Durability
  durability: number; // Uses before breaking

  // Cost
  price: number;

  // Special properties
  bonusHook?: number; // % easier to hook
  realistic?: boolean; // Works better on wary fish
}

/**
 * Character's fishing setup
 */
export interface FishingSetup {
  rodId: string;
  reelId: string;
  lineId: string;
  baitId?: string;
  lureId?: string;
}

/**
 * Active fishing session
 */
export interface FishingSession {
  characterId: string;
  locationId: string;
  spotType: SpotType;
  setup: FishingSetup;

  // Timing
  startedAt: Date;
  lastBiteCheck: Date;

  // State
  isWaiting: boolean;
  hasBite: boolean;
  currentFish?: {
    speciesId: string;
    weight: number;
    size: FishSize;
    fightState: FishFightState;
  };

  // Environment
  timeOfDay: FishingTimeOfDay;
  weather: FishingWeather;

  // Catches
  catchCount: number;
  totalValue: number;
}

/**
 * Fish fight state
 */
export interface FishFightState {
  phase: FightPhase;
  fishStamina: number;
  lineTension: number;  // 0-100, snap at 100
  playerStamina: number; // Player's patience

  // Fight metrics
  roundsElapsed: number;
  lastAction: 'REEL' | 'LET_RUN' | 'WAIT';
  tensionHistory: number[]; // Last 5 rounds

  // Success tracking
  hookStrength: number; // 0-100, lose fish at 0
}

/**
 * Caught fish result
 */
export interface CaughtFish {
  speciesId: string;
  speciesName: string;
  weight: number;
  size: FishSize;
  quality: number; // 0-100, based on fight

  // Rewards
  goldValue: number;
  experience: number;
  drops: {
    itemId: string;
    quantity: number;
  }[];

  // Records
  isNewRecord: boolean;
  isFirstCatch: boolean;

  // Timestamp
  caughtAt: Date;
  location: string;
}

/**
 * Fishing action result
 */
export interface FishingActionResult {
  success: boolean;
  message: string;
  session?: FishingSession;
  catch?: CaughtFish;

  // State changes
  energyUsed?: number;
  goldGained?: number;
  experienceGained?: number;
  itemsGained?: { itemId: string; quantity: number }[];

  // Bite notification
  hasBite?: boolean;
  biteTimeWindow?: number; // MS to react

  // Fight updates
  fightUpdate?: {
    fishStamina: number;
    lineTension: number;
    message: string;
    canContinue: boolean;
  };
}

/**
 * Character fishing statistics
 */
export interface FishingStats {
  // Totals
  totalCatches: number;
  totalValue: number;
  totalExperience: number;

  // Records
  biggestFish: {
    speciesId: string;
    weight: number;
    location: string;
    caughtAt: Date;
  } | null;

  // By rarity
  commonCaught: number;
  qualityCaught: number;
  rareCaught: number;
  legendaryCaught: number;

  // Unique species
  speciesCaught: string[]; // Species IDs

  // Legendary catches
  legendaryCatches: {
    speciesId: string;
    weight: number;
    location: string;
    caughtAt: Date;
  }[];

  // Locations fished
  locationsVisited: string[];
}

/**
 * Fishing skill progression
 */
export interface FishingSkill {
  // Main skill
  level: number;          // 1-50
  experience: number;

  // Sub-skills
  casting: number;        // Distance and accuracy (1-50)
  patience: number;       // Bite chance bonus (1-50)
  fighting: number;       // Fight control (1-50)
  fishKnowledge: number;  // Identify best spots/times (1-50)
  luckyAngler: number;    // Rare fish bonus (1-50)
}

/**
 * Fishing tournament entry
 */
export interface FishingTournament {
  id: string;
  name: string;
  description: string;

  // Rules
  locationId: string;
  startTime: Date;
  endTime: Date;

  // Competition type
  type: 'BIGGEST' | 'MOST' | 'RAREST' | 'TOTAL_VALUE';
  targetSpecies?: string[]; // Optional species restriction

  // Entry
  entryFee: number;
  requiredLevel?: number;

  // Prizes
  prizes: {
    rank: number;
    gold: number;
    items?: string[];
    title?: string;
  }[];

  // Leaderboard
  participants: {
    characterId: string;
    characterName: string;
    score: number; // Depends on type
    bestCatch?: CaughtFish;
  }[];
}

/**
 * Fish trophy for display
 */
export interface FishTrophy {
  characterId: string;
  speciesId: string;
  weight: number;
  size: FishSize;
  quality: number;
  location: string;
  caughtAt: Date;

  // Display
  mounted: boolean;
  displayLocation?: string; // Gang base, property, etc.
}

/**
 * Fishing constants
 */
export const FISHING_CONSTANTS = {
  // Energy costs
  CAST_ENERGY: 5,
  FIGHT_ENERGY: 10,

  // Timing
  BITE_CHECK_INTERVAL: 60, // Seconds between checks
  MIN_BITE_WINDOW: 2000,   // MS to react to bite
  MAX_BITE_WINDOW: 5000,

  // Fight mechanics
  BASE_TENSION_INCREASE: 10, // Per reel action
  BASE_TENSION_DECREASE: 5,  // Per let run
  MAX_LINE_TENSION: 100,
  SNAP_THRESHOLD: 100,

  // Rewards
  SIZE_MULTIPLIER: {
    TINY: 0.5,
    SMALL: 0.8,
    AVERAGE: 1.0,
    LARGE: 1.5,
    TROPHY: 2.5,
    LEGENDARY: 5.0
  },

  // Quality bonus (perfect fight)
  PERFECT_FIGHT_BONUS: 0.25, // +25% value

  // Experience
  BASE_FISHING_XP: 10,
  RARE_CATCH_BONUS: 50,
  LEGENDARY_CATCH_BONUS: 200,

  // Skill gains
  XP_PER_CATCH: 25,
  XP_PER_LEGENDARY: 200,

  // Limits
  MAX_CATCHES_PER_SESSION: 20,
  SESSION_TIMEOUT_MINUTES: 60
};
