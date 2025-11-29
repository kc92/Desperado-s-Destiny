/**
 * Hunting System Types - Phase 10, Wave 10.1
 *
 * Type definitions for the Hunting System in Desperados Destiny
 */

/**
 * Animal size categories
 */
export enum AnimalSize {
  SMALL = 'SMALL',           // Rabbit, squirrel, etc.
  MEDIUM = 'MEDIUM',         // Turkey, fox, coyote
  LARGE = 'LARGE',           // Deer, elk, boar
  DANGEROUS = 'DANGEROUS'    // Bear, wolf, mountain lion
}

/**
 * Animal rarity
 */
export enum AnimalRarity {
  COMMON = 'COMMON',         // Easy to find
  UNCOMMON = 'UNCOMMON',     // Somewhat rare
  RARE = 'RARE',             // Hard to find
  EPIC = 'EPIC',             // Very rare
  LEGENDARY = 'LEGENDARY'    // Extremely rare
}

/**
 * Animal behavior patterns
 */
export enum AnimalBehavior {
  DOCILE = 'DOCILE',         // Flees when approached
  SKITTISH = 'SKITTISH',     // Very alert, hard to approach
  NEUTRAL = 'NEUTRAL',       // May flee or stay
  AGGRESSIVE = 'AGGRESSIVE', // Will attack if threatened
  PREDATOR = 'PREDATOR'      // Actively dangerous
}

/**
 * Tracking result quality
 */
export enum TrackFreshness {
  FRESH = 'FRESH',           // Within minutes
  RECENT = 'RECENT',         // Within hour
  OLD = 'OLD',               // Several hours
  COLD = 'COLD'              // Day+ old
}

/**
 * Track direction
 */
export enum TrackDirection {
  NORTH = 'NORTH',
  NORTHEAST = 'NORTHEAST',
  EAST = 'EAST',
  SOUTHEAST = 'SOUTHEAST',
  SOUTH = 'SOUTH',
  SOUTHWEST = 'SOUTHWEST',
  WEST = 'WEST',
  NORTHWEST = 'NORTHWEST'
}

/**
 * Track distance
 */
export enum TrackDistance {
  NEAR = 'NEAR',             // < 50 yards
  MEDIUM = 'MEDIUM',         // 50-150 yards
  FAR = 'FAR'                // > 150 yards
}

/**
 * Hunting weapon types
 */
export enum HuntingWeapon {
  HUNTING_RIFLE = 'HUNTING_RIFLE',
  VARMINT_RIFLE = 'VARMINT_RIFLE',
  BOW = 'BOW',
  SHOTGUN = 'SHOTGUN',
  PISTOL = 'PISTOL'
}

/**
 * Shot placement
 */
export enum ShotPlacement {
  HEAD = 'HEAD',             // Instant kill, best quality
  HEART = 'HEART',           // Quick kill, good quality
  LUNGS = 'LUNGS',           // Decent kill, normal quality
  BODY = 'BODY',             // Poor placement, reduced quality
  MISS = 'MISS'              // Complete miss
}

/**
 * Kill quality
 */
export enum KillQuality {
  PERFECT = 'PERFECT',       // 200% value
  EXCELLENT = 'EXCELLENT',   // 150% value
  GOOD = 'GOOD',             // 125% value
  COMMON = 'COMMON',         // 100% value
  POOR = 'POOR'              // 50% value
}

/**
 * Harvest resource type
 */
export enum HarvestResourceType {
  MEAT = 'MEAT',
  HIDE = 'HIDE',
  FUR = 'FUR',
  PELT = 'PELT',
  BONE = 'BONE',
  ANTLER = 'ANTLER',
  HORN = 'HORN',
  FEATHER = 'FEATHER',
  CLAW = 'CLAW',
  TOOTH = 'TOOTH',
  TROPHY = 'TROPHY'
}

/**
 * Huntable animal species
 */
export enum AnimalSpecies {
  // Small Game
  RABBIT = 'RABBIT',
  PRAIRIE_DOG = 'PRAIRIE_DOG',
  SQUIRREL = 'SQUIRREL',
  RACCOON = 'RACCOON',
  SKUNK = 'SKUNK',
  OPOSSUM = 'OPOSSUM',

  // Medium Game
  TURKEY = 'TURKEY',
  PHEASANT = 'PHEASANT',
  DUCK = 'DUCK',
  GOOSE = 'GOOSE',
  COYOTE = 'COYOTE',
  FOX = 'FOX',
  BADGER = 'BADGER',

  // Large Game
  WHITE_TAILED_DEER = 'WHITE_TAILED_DEER',
  MULE_DEER = 'MULE_DEER',
  PRONGHORN = 'PRONGHORN',
  WILD_BOAR = 'WILD_BOAR',
  JAVELINA = 'JAVELINA',
  BIGHORN_SHEEP = 'BIGHORN_SHEEP',
  ELK = 'ELK',

  // Dangerous Game
  BLACK_BEAR = 'BLACK_BEAR',
  GRIZZLY_BEAR = 'GRIZZLY_BEAR',
  MOUNTAIN_LION = 'MOUNTAIN_LION',
  WOLF = 'WOLF',
  BISON = 'BISON',

  // Additional animals
  EAGLE = 'EAGLE',
  RATTLESNAKE = 'RATTLESNAKE',
  ARMADILLO = 'ARMADILLO',
  PORCUPINE = 'PORCUPINE'
}

/**
 * Animal definition
 */
export interface AnimalDefinition {
  /** Species ID */
  species: AnimalSpecies;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Flavor text */
  flavorText: string;

  /** Size category */
  size: AnimalSize;
  /** Rarity */
  rarity: AnimalRarity;
  /** Behavior */
  behavior: AnimalBehavior;

  /** Health points */
  health: number;
  /** Speed (affects stalking difficulty) */
  speed: number;
  /** Alertness (affects detection) */
  alertness: number;
  /** Aggression level (1-10) */
  aggression: number;

  /** Weapon requirements */
  recommendedWeapons: HuntingWeapon[];
  /** Minimum weapon to kill cleanly */
  minimumWeapon: HuntingWeapon;

  /** Tracking difficulty (1-10) */
  trackingDifficulty: number;
  /** Stalking difficulty (1-10) */
  stalkingDifficulty: number;
  /** Kill difficulty (1-10) */
  killDifficulty: number;

  /** Resources this animal provides */
  harvestResources: HarvestResource[];

  /** Locations where this animal can be found */
  locations: string[];
  /** Spawn chance per location (0-1) */
  spawnChance: number;

  /** Level requirement to hunt */
  levelRequired: number;
  /** Skill requirements */
  skillRequirements?: {
    tracking?: number;
    marksmanship?: number;
  };

  /** Experience granted */
  xpReward: number;

  /** Can this animal attack the player? */
  canAttack: boolean;
  /** Attack damage if aggressive */
  attackDamage?: number;
}

/**
 * Harvest resource from animal
 */
export interface HarvestResource {
  /** Resource type */
  type: HarvestResourceType;
  /** Item ID */
  itemId: string;
  /** Display name */
  name: string;
  /** Base quantity */
  baseQuantity: number;
  /** Quantity variation (random +/-) */
  quantityVariation: number;
  /** Base gold value */
  baseValue: number;
  /** Weight per unit */
  weight: number;
  /** Success chance (0-1) */
  successChance: number;
  /** Skinning skill requirement */
  skillRequirement?: number;
}

/**
 * Hunting ground location
 */
export interface HuntingGround {
  /** Location ID */
  locationId: string;
  /** Display name */
  name: string;
  /** Description */
  description: string;
  /** Short description */
  shortDescription: string;

  /** Animals available here */
  availableAnimals: AnimalSpecies[];
  /** Spawn rates by species */
  spawnRates: Record<AnimalSpecies, number>;

  /** Terrain type (affects difficulty) */
  terrain: 'plains' | 'forest' | 'mountains' | 'desert' | 'swamp';
  /** Cover availability (affects stalking) */
  coverLevel: number; // 1-10
  /** Danger level */
  dangerLevel: number; // 1-10

  /** Energy cost to hunt here */
  energyCost: number;
  /** Minimum level to access */
  minLevel: number;
}

/**
 * Tracking attempt result
 */
export interface TrackingResult {
  /** Success */
  success: boolean;
  /** Message */
  message: string;

  /** Animal found */
  animalType?: AnimalSpecies;
  /** Track freshness */
  freshness?: TrackFreshness;
  /** Direction */
  direction?: TrackDirection;
  /** Distance */
  distance?: TrackDistance;
  /** Tracking difficulty */
  difficulty?: number;
  /** Skill bonus applied */
  trackingBonus?: number;
  /** Companion bonus */
  companionBonus?: number;

  /** Can proceed to stalking */
  canStalk?: boolean;
}

/**
 * Stalking attempt result
 */
export interface StalkingResult {
  /** Success */
  success: boolean;
  /** Message */
  message: string;

  /** Animal in range */
  animalInRange?: boolean;
  /** Wind direction favorable */
  windFavorable?: boolean;
  /** Noise level */
  noiseLevel?: number;
  /** Detection chance */
  detectionChance?: number;
  /** Stealth bonus applied */
  stealthBonus?: number;

  /** Animal spooked */
  spooked?: boolean;
  /** Can take shot */
  canShoot?: boolean;
  /** Shot distance */
  shotDistance?: number;
}

/**
 * Shot result
 */
export interface ShotResult {
  /** Success */
  success: boolean;
  /** Message */
  message: string;

  /** Hit */
  hit: boolean;
  /** Shot placement */
  placement?: ShotPlacement;
  /** Damage dealt */
  damage?: number;
  /** Animal killed */
  killed?: boolean;
  /** Animal wounded */
  wounded?: boolean;

  /** Marksmanship bonus */
  marksmanshipBonus?: number;
  /** Weapon bonus */
  weaponBonus?: number;

  /** Animal fled */
  fled?: boolean;
  /** Animal attacking */
  attacking?: boolean;
}

/**
 * Harvest attempt result
 */
export interface HarvestResult {
  /** Success */
  success: boolean;
  /** Message */
  message: string;

  /** Kill quality determined */
  quality: KillQuality;
  /** Quality multiplier */
  qualityMultiplier: number;

  /** Resources harvested */
  resources: HarvestedResource[];
  /** Total gold value */
  totalValue: number;

  /** Skinning skill bonus */
  skinningBonus?: number;
  /** Experience gained */
  xpGained: number;
}

/**
 * Harvested resource
 */
export interface HarvestedResource {
  /** Resource type */
  type: HarvestResourceType;
  /** Item ID */
  itemId: string;
  /** Name */
  name: string;
  /** Quantity obtained */
  quantity: number;
  /** Quality */
  quality: KillQuality;
  /** Gold value */
  value: number;
}

/**
 * Complete hunting trip
 */
export interface HuntingTrip {
  /** Trip ID */
  _id?: string;
  /** Character ID */
  characterId: string;
  /** Hunting ground */
  huntingGroundId: string;

  /** Started at */
  startedAt: Date;
  /** Completed at */
  completedAt?: Date;
  /** Status */
  status: 'tracking' | 'stalking' | 'shooting' | 'harvesting' | 'complete' | 'failed';

  /** Target animal */
  targetAnimal?: AnimalSpecies;
  /** Animal definition */
  animalDefinition?: AnimalDefinition;

  /** Tracking result */
  trackingResult?: TrackingResult;
  /** Stalking result */
  stalkingResult?: StalkingResult;
  /** Shot result */
  shotResult?: ShotResult;
  /** Harvest result */
  harvestResult?: HarvestResult;

  /** Energy spent */
  energySpent: number;
  /** Gold earned */
  goldEarned: number;
  /** XP earned */
  xpEarned: number;

  /** Companion assisted */
  companionId?: string;
  /** Weapon used */
  weaponUsed?: HuntingWeapon;
}

/**
 * Hunting statistics
 */
export interface HuntingStatistics {
  /** Total hunts */
  totalHunts: number;
  /** Successful hunts */
  successfulHunts: number;
  /** Animals killed by species */
  killsBySpecies: Record<AnimalSpecies, number>;
  /** Perfect kills */
  perfectKills: number;
  /** Total gold earned */
  totalGoldEarned: number;
  /** Total XP earned */
  totalXpEarned: number;
  /** Favorite hunting ground */
  favoriteHuntingGround?: string;
  /** Largest kill */
  largestKill?: {
    species: AnimalSpecies;
    quality: KillQuality;
    value: number;
    date: Date;
  };
}

/**
 * Hunting equipment
 */
export interface HuntingEquipment {
  /** Weapon */
  weapon: HuntingWeapon;
  /** Has binoculars */
  hasBinoculars: boolean;
  /** Has camouflage */
  hasCamouflage: boolean;
  /** Has animal calls */
  hasAnimalCalls: boolean;
  /** Has scent blocker */
  hasScentBlocker: boolean;
  /** Has hunting knife */
  hasHuntingKnife: boolean;
}

/**
 * Hunt availability
 */
export interface HuntAvailability {
  /** Can hunt */
  canHunt: boolean;
  /** Reason if cannot */
  reason?: string;
  /** Available hunting grounds */
  availableGrounds: HuntingGround[];
  /** Equipment status */
  equipment: HuntingEquipment;
  /** Active companion */
  companion?: {
    id: string;
    name: string;
    trackingBonus: number;
    huntingBonus: number;
  };
}

/**
 * Start hunt request
 */
export interface StartHuntRequest {
  /** Character ID */
  characterId: string;
  /** Hunting ground ID */
  huntingGroundId: string;
  /** Weapon to use */
  weapon: HuntingWeapon;
  /** Companion ID (optional) */
  companionId?: string;
}

/**
 * Hunt action request
 */
export interface HuntActionRequest {
  /** Trip ID */
  tripId: string;
  /** Character ID */
  characterId: string;
  /** Action type */
  action: 'track' | 'stalk' | 'shoot' | 'harvest' | 'abandon';
  /** Shot placement (for shoot action) */
  shotPlacement?: ShotPlacement;
}

/**
 * Hunt response
 */
export interface HuntResponse {
  /** Success */
  success: boolean;
  /** Message */
  message: string;
  /** Current trip */
  trip: HuntingTrip;
  /** Available actions */
  availableActions: string[];
}

/**
 * Hunting constants
 */
export const HUNTING_CONSTANTS = {
  /** Base energy cost for hunting */
  BASE_ENERGY_COST: 10,

  /** Tracking phase energy */
  TRACKING_ENERGY: 3,
  /** Stalking phase energy */
  STALKING_ENERGY: 2,
  /** Shooting phase energy */
  SHOOTING_ENERGY: 2,
  /** Harvesting phase energy */
  HARVESTING_ENERGY: 3,

  /** Wind direction chance to be favorable */
  WIND_FAVORABLE_CHANCE: 0.5,

  /** Base stealth value */
  BASE_STEALTH: 50,
  /** Camouflage bonus */
  CAMOUFLAGE_BONUS: 20,
  /** Scent blocker bonus */
  SCENT_BLOCKER_BONUS: 15,

  /** Shot difficulty by distance */
  SHOT_DIFFICULTY: {
    NEAR: 1,
    MEDIUM: 1.5,
    FAR: 2.5
  },

  /** Quality multipliers */
  QUALITY_MULTIPLIERS: {
    PERFECT: 2.0,
    EXCELLENT: 1.5,
    GOOD: 1.25,
    COMMON: 1.0,
    POOR: 0.5
  },

  /** Weapon damage by type */
  WEAPON_DAMAGE: {
    HUNTING_RIFLE: 100,
    VARMINT_RIFLE: 40,
    BOW: 70,
    SHOTGUN: 80,
    PISTOL: 50
  },

  /** Shot placement damage multipliers */
  PLACEMENT_MULTIPLIERS: {
    HEAD: 2.0,
    HEART: 1.75,
    LUNGS: 1.5,
    BODY: 1.0,
    MISS: 0
  },

  /** Companion tracking bonus */
  COMPANION_TRACKING_BONUS_MAX: 30,
  /** Companion hunting bonus */
  COMPANION_HUNTING_BONUS_MAX: 25
};
