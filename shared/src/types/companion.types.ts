/**
 * Animal Companion Types - Phase 9, Wave 9.2
 *
 * Type definitions for the Animal Companion System in Desperados Destiny
 */

/**
 * Companion species categories
 */
export enum CompanionCategory {
  DOG = 'DOG',
  BIRD = 'BIRD',
  EXOTIC = 'EXOTIC',
  SUPERNATURAL = 'SUPERNATURAL'
}

/**
 * Companion species
 */
export enum CompanionSpecies {
  // Dogs
  AUSTRALIAN_SHEPHERD = 'AUSTRALIAN_SHEPHERD',
  CATAHOULA_LEOPARD_DOG = 'CATAHOULA_LEOPARD_DOG',
  BLOODHOUND = 'BLOODHOUND',
  GERMAN_SHEPHERD = 'GERMAN_SHEPHERD',
  COLLIE = 'COLLIE',
  PITBULL = 'PITBULL',
  COYDOG = 'COYDOG',
  WOLF_HYBRID = 'WOLF_HYBRID',

  // Birds
  RED_TAILED_HAWK = 'RED_TAILED_HAWK',
  GOLDEN_EAGLE = 'GOLDEN_EAGLE',
  RAVEN = 'RAVEN',

  // Exotic
  RACCOON = 'RACCOON',
  FERRET = 'FERRET',
  MOUNTAIN_LION = 'MOUNTAIN_LION',
  WOLF = 'WOLF',
  BEAR_CUB = 'BEAR_CUB',
  COYOTE = 'COYOTE',

  // Supernatural
  GHOST_HOUND = 'GHOST_HOUND',
  SKINWALKER_GIFT = 'SKINWALKER_GIFT',
  THUNDERBIRD_FLEDGLING = 'THUNDERBIRD_FLEDGLING',
  CHUPACABRA = 'CHUPACABRA'
}

/**
 * Trust levels
 */
export enum TrustLevel {
  WILD = 'WILD',              // 0-20: Newly tamed, unpredictable
  WARY = 'WARY',              // 21-40: Still uncertain
  FAMILIAR = 'FAMILIAR',      // 41-60: Comfortable
  TRUSTED = 'TRUSTED',        // 61-80: Reliable
  DEVOTED = 'DEVOTED'         // 81-100: Unbreakable bond
}

/**
 * Companion condition
 */
export enum CompanionCondition {
  EXCELLENT = 'EXCELLENT',    // 90-100 health
  GOOD = 'GOOD',              // 70-89 health
  FAIR = 'FAIR',              // 50-69 health
  POOR = 'POOR',              // 30-49 health
  CRITICAL = 'CRITICAL'       // 1-29 health
}

/**
 * Combat role
 */
export enum CombatRole {
  ATTACKER = 'ATTACKER',      // High damage, aggressive
  DEFENDER = 'DEFENDER',      // Protects player, tanks damage
  SUPPORT = 'SUPPORT',        // Buffs, debuffs, utility
  SCOUT = 'SCOUT'             // Reveals info, avoidance
}

/**
 * Companion ability IDs
 */
export enum CompanionAbilityId {
  // Dog Abilities
  TRACK = 'TRACK',
  GUARD = 'GUARD',
  HERD = 'HERD',
  ATTACK = 'ATTACK',
  FETCH = 'FETCH',
  INTIMIDATE = 'INTIMIDATE',
  SENSE_DANGER = 'SENSE_DANGER',
  LOYAL_DEFENSE = 'LOYAL_DEFENSE',

  // Bird Abilities
  SCOUT = 'SCOUT',
  HUNT = 'HUNT',
  MESSAGE = 'MESSAGE',
  DISTRACT = 'DISTRACT',
  OMEN = 'OMEN',
  AERIAL_ASSAULT = 'AERIAL_ASSAULT',
  KEEN_SIGHT = 'KEEN_SIGHT',

  // Exotic Abilities
  STEALTH = 'STEALTH',
  NIGHT_VISION = 'NIGHT_VISION',
  PACK_TACTICS = 'PACK_TACTICS',
  INTIMIDATE_PREY = 'INTIMIDATE_PREY',
  FERAL_RAGE = 'FERAL_RAGE',
  SCAVENGE = 'SCAVENGE',
  BURROW_FLUSH = 'BURROW_FLUSH',
  CLIMB = 'CLIMB',
  POUNCE = 'POUNCE',
  MAUL = 'MAUL',

  // Supernatural Abilities
  GHOST_WALK = 'GHOST_WALK',
  SPIRIT_HOWL = 'SPIRIT_HOWL',
  SHAPE_SHIFT = 'SHAPE_SHIFT',
  THUNDER_STRIKE = 'THUNDER_STRIKE',
  BLOOD_DRAIN = 'BLOOD_DRAIN',
  CURSE_BITE = 'CURSE_BITE',
  PHASE_SHIFT = 'PHASE_SHIFT',
  SOUL_SENSE = 'SOUL_SENSE'
}

/**
 * Ability effect type
 */
export enum AbilityEffectType {
  COMBAT_DAMAGE = 'COMBAT_DAMAGE',
  COMBAT_DEFENSE = 'COMBAT_DEFENSE',
  TRACKING_BONUS = 'TRACKING_BONUS',
  HUNTING_BONUS = 'HUNTING_BONUS',
  STEALTH_BONUS = 'STEALTH_BONUS',
  DETECTION = 'DETECTION',
  INTIMIDATION = 'INTIMIDATION',
  SUPPORT_BUFF = 'SUPPORT_BUFF',
  RESOURCE_GAIN = 'RESOURCE_GAIN',
  INFORMATION = 'INFORMATION',
  UTILITY = 'UTILITY'
}

/**
 * Companion ability definition
 */
export interface CompanionAbility {
  /** Ability unique identifier */
  id: CompanionAbilityId;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Effect type */
  effectType: AbilityEffectType;
  /** Power/magnitude of effect (1-100) */
  power: number;
  /** Energy cost to use (if applicable) */
  energyCost?: number;
  /** Cooldown in minutes (if applicable) */
  cooldown?: number;
  /** Minimum loyalty required */
  minLoyalty?: number;
  /** Minimum bond level required */
  minBond?: number;
  /** Level learned */
  learnLevel: number;
  /** Categories this ability belongs to */
  categories: CompanionCategory[];
}

/**
 * Companion acquisition method
 */
export enum AcquisitionMethod {
  PURCHASE = 'PURCHASE',
  TAMED = 'TAMED',
  GIFT = 'GIFT',
  QUEST = 'QUEST',
  BRED = 'BRED',
  RESCUED = 'RESCUED',
  SUPERNATURAL = 'SUPERNATURAL'
}

/**
 * Companion species definition
 */
export interface CompanionSpeciesDefinition {
  /** Species ID */
  species: CompanionSpecies;
  /** Display name */
  name: string;
  /** Category */
  category: CompanionCategory;
  /** Description */
  description: string;
  /** Flavor text */
  flavorText: string;

  /** Base stats */
  baseStats: {
    loyalty: number;
    intelligence: number;
    aggression: number;
    health: number;
  };

  /** Combat capabilities */
  combatStats: {
    attackPower: number;
    defensePower: number;
    combatRole: CombatRole;
  };

  /** Utility bonuses */
  utilityStats: {
    trackingBonus: number;
    huntingBonus: number;
    guardBonus: number;
    socialBonus: number;
  };

  /** Available abilities */
  availableAbilities: CompanionAbilityId[];
  /** Max abilities this species can learn */
  maxAbilities: number;

  /** Acquisition methods */
  acquisitionMethods: AcquisitionMethod[];
  /** Purchase price (if purchasable) */
  purchasePrice?: number;
  /** Taming difficulty (1-10, if tameable) */
  tamingDifficulty?: number;

  /** Care requirements */
  careRequirements: {
    foodType: string[];
    dailyFoodCost: number;
    shelterRequired: boolean;
  };

  /** Rarity */
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  /** Level requirement to acquire */
  levelRequired: number;
  /** Reputation requirements (if any) */
  reputationRequired?: {
    faction: string;
    amount: number;
  };
}

/**
 * Animal companion document
 */
export interface AnimalCompanion {
  /** Companion unique identifier */
  _id?: string;
  /** Owner character ID */
  ownerId: string;
  /** Custom name given by player */
  name: string;
  /** Species */
  species: CompanionSpecies;
  /** Breed (optional, for display) */
  breed?: string;
  /** Age in months */
  age: number;
  /** Gender */
  gender: 'male' | 'female';

  /** Core Stats (1-100) */
  loyalty: number;
  intelligence: number;
  aggression: number;
  health: number;

  /** Abilities */
  abilities: CompanionAbilityId[];
  maxAbilities: number;
  /** Ability cooldowns */
  abilityCooldowns: Map<CompanionAbilityId, Date>;

  /** Bond */
  bondLevel: number; // 0-100
  trustLevel: TrustLevel;

  /** Combat */
  attackPower: number;
  defensePower: number;
  combatRole: CombatRole;

  /** Utility */
  trackingBonus: number;
  huntingBonus: number;
  guardBonus: number;
  socialBonus: number;

  /** Condition */
  currentHealth: number;
  maxHealth: number;
  hunger: number; // 0-100 (0 = starving, 100 = full)
  happiness: number; // 0-100
  condition: CompanionCondition;

  /** State */
  isActive: boolean; // Currently following player
  location: string; // Current location (if not active, stored in kennel)

  /** History */
  acquiredDate: Date;
  acquiredMethod: AcquisitionMethod;
  kills: number;
  itemsFound: number;
  encountersHelped: number;

  /** Training */
  trainingProgress?: {
    abilityId: CompanionAbilityId;
    progress: number; // 0-100
    startedAt: Date;
    completesAt: Date;
  };

  /** Timestamps */
  lastFed?: Date;
  lastActive?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Taming attempt
 */
export interface TamingAttempt {
  /** Character ID */
  characterId: string;
  /** Target species */
  targetSpecies: CompanionSpecies;
  /** Location */
  location: string;
  /** Attempt number */
  attemptNumber: number;
  /** Started at */
  startedAt: Date;
  /** Current progress */
  progress: number; // 0-100
  /** Status */
  status: 'in_progress' | 'success' | 'failed' | 'fled';
}

/**
 * Taming result
 */
export interface TamingResult {
  success: boolean;
  message: string;
  companion?: AnimalCompanion;
  progress?: number;
  canRetry?: boolean;
  energyCost: number;
}

/**
 * Companion feed result
 */
export interface FeedResult {
  success: boolean;
  message: string;
  hungerBefore: number;
  hungerAfter: number;
  happinessChange: number;
  bondChange: number;
  costGold: number;
}

/**
 * Companion training result
 */
export interface TrainingResult {
  success: boolean;
  message: string;
  ability?: CompanionAbilityId;
  progress: number;
  completesAt?: Date;
  costGold: number;
}

/**
 * Companion activity result
 */
export interface CompanionActivityResult {
  success: boolean;
  message: string;
  rewards?: {
    gold?: number;
    items?: string[];
    xp?: number;
  };
  companionState?: {
    hunger: number;
    happiness: number;
    health: number;
  };
}

/**
 * Breeding pair
 */
export interface BreedingPair {
  /** Parent 1 ID */
  parent1Id: string;
  /** Parent 2 ID */
  parent2Id: string;
  /** Started at */
  startedAt: Date;
  /** Completes at */
  completesAt: Date;
  /** Status */
  status: 'breeding' | 'complete' | 'failed';
  /** Offspring (if complete) */
  offspringId?: string;
}

/**
 * Kennel stats
 */
export interface KennelStats {
  /** Total companions owned */
  totalCompanions: number;
  /** Active companion */
  activeCompanion?: AnimalCompanion;
  /** Companions in kennel */
  kennelCompanions: AnimalCompanion[];
  /** Kennel capacity */
  capacity: number;
  /** Daily upkeep cost */
  dailyUpkeep: number;
}

/**
 * Companion combat contribution
 */
export interface CompanionCombatContribution {
  /** Companion ID */
  companionId: string;
  /** Companion name */
  companionName: string;
  /** Species */
  species: CompanionSpecies;
  /** Damage dealt */
  damageDealt: number;
  /** Damage prevented */
  damagePrevented: number;
  /** Abilities used */
  abilitiesUsed: CompanionAbilityId[];
  /** Health remaining */
  healthRemaining: number;
  /** Bond gained */
  bondGained: number;
}

/**
 * Wild encounter
 */
export interface WildEncounter {
  /** Species encountered */
  species: CompanionSpecies;
  /** Location */
  location: string;
  /** Tameable */
  tameable: boolean;
  /** Hostility level */
  hostility: number; // 0-100
  /** Taming difficulty */
  difficulty: number;
  /** Description */
  description: string;
}

/**
 * Companion stats summary
 */
export interface CompanionStatsSummary {
  /** Total companions owned (all time) */
  totalOwnedAllTime: number;
  /** Current companions */
  currentCompanions: number;
  /** Total kills by companions */
  totalKills: number;
  /** Total items found */
  totalItemsFound: number;
  /** Total encounters helped */
  totalEncountersHelped: number;
  /** Favorite species */
  favoriteSpecies?: CompanionSpecies;
  /** Highest bond level */
  highestBond: number;
}

/**
 * Companion care task
 */
export interface CompanionCareTask {
  /** Companion ID */
  companionId: string;
  /** Task type */
  taskType: 'feed' | 'heal' | 'groom' | 'play' | 'train';
  /** Description */
  description: string;
  /** Urgency */
  urgency: 'low' | 'medium' | 'high' | 'critical';
  /** Gold cost */
  costGold?: number;
  /** Time required (minutes) */
  timeRequired?: number;
}

/**
 * Companion list response
 */
export interface CompanionListResponse {
  companions: AnimalCompanion[];
  activeCompanion?: AnimalCompanion;
  capacity: number;
  dailyUpkeep: number;
  stats: CompanionStatsSummary;
}

/**
 * Available companions for purchase
 */
export interface CompanionShopListing {
  species: CompanionSpecies;
  definition: CompanionSpeciesDefinition;
  available: boolean;
  reason?: string;
  price: number;
}

/**
 * Companion constants
 */
export const COMPANION_CONSTANTS = {
  /** Base kennel capacity */
  BASE_KENNEL_CAPACITY: 3,

  /** Max kennel capacity */
  MAX_KENNEL_CAPACITY: 10,

  /** Energy cost to tame */
  TAMING_ENERGY_COST: 15,

  /** Energy cost for companion activities */
  ACTIVITY_ENERGY_COST: 5,

  /** Hunger decay per hour */
  HUNGER_DECAY_PER_HOUR: 5,

  /** Happiness decay per hour when not active */
  HAPPINESS_DECAY_PER_HOUR: 2,

  /** Bond gain per activity */
  BOND_GAIN_PER_ACTIVITY: 2,

  /** Bond loss when neglected */
  BOND_LOSS_NEGLECT: 5,

  /** Days before companion may leave */
  NEGLECT_LEAVE_DAYS: 7,

  /** Training time base (hours) */
  TRAINING_TIME_HOURS: 24,

  /** Breeding time (days) */
  BREEDING_TIME_DAYS: 14,

  /** Veterinary heal cost per HP */
  HEAL_COST_PER_HP: 2
};
