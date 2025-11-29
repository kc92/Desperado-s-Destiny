import { ObjectId } from 'mongodb';

// ============================================================================
// ENUMS
// ============================================================================

export enum HorseBreed {
  // Common Breeds
  QUARTER_HORSE = 'QUARTER_HORSE',
  MUSTANG = 'MUSTANG',
  PAINT_HORSE = 'PAINT_HORSE',
  MORGAN = 'MORGAN',
  APPALOOSA = 'APPALOOSA',

  // Quality Breeds
  TENNESSEE_WALKER = 'TENNESSEE_WALKER',
  AMERICAN_STANDARDBRED = 'AMERICAN_STANDARDBRED',
  MISSOURI_FOX_TROTTER = 'MISSOURI_FOX_TROTTER',
  THOROUGHBRED = 'THOROUGHBRED',
  ARABIAN = 'ARABIAN',

  // Rare Breeds
  ANDALUSIAN = 'ANDALUSIAN',
  FRIESIAN = 'FRIESIAN',
  AKHAL_TEKE = 'AKHAL_TEKE',
  PERCHERON = 'PERCHERON',
  LEGENDARY_WILD_STALLION = 'LEGENDARY_WILD_STALLION'
}

export enum HorseGender {
  STALLION = 'stallion',
  MARE = 'mare',
  GELDING = 'gelding'
}

export enum HorseColor {
  // Solid Colors
  BAY = 'BAY',
  BLACK = 'BLACK',
  CHESTNUT = 'CHESTNUT',
  BROWN = 'BROWN',
  WHITE = 'WHITE',
  GRAY = 'GRAY',

  // Patterns
  PALOMINO = 'PALOMINO',
  BUCKSKIN = 'BUCKSKIN',
  DAPPLE_GRAY = 'DAPPLE_GRAY',
  ROAN = 'ROAN',
  PINTO = 'PINTO',
  APPALOOSA_SPOTTED = 'APPALOOSA_SPOTTED',
  PAINT = 'PAINT',

  // Rare Colors
  CREMELLO = 'CREMELLO',
  GOLDEN = 'GOLDEN', // Akhal-Teke
  SILVER_DAPPLE = 'SILVER_DAPPLE'
}

export enum HorseCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  INJURED = 'injured'
}

export enum HorseSkill {
  SPEED_BURST = 'SPEED_BURST',
  SURE_FOOTED = 'SURE_FOOTED',
  WAR_HORSE = 'WAR_HORSE',
  TRICK_HORSE = 'TRICK_HORSE',
  DRAFT_TRAINING = 'DRAFT_TRAINING',
  RACING_FORM = 'RACING_FORM',
  STEALTH = 'STEALTH',
  ENDURANCE = 'ENDURANCE'
}

export enum BondLevel {
  STRANGER = 'STRANGER',          // 0-20
  ACQUAINTANCE = 'ACQUAINTANCE',  // 21-40
  PARTNER = 'PARTNER',            // 41-60
  COMPANION = 'COMPANION',        // 61-80
  BONDED = 'BONDED'               // 81-100
}

export enum HorseEquipmentSlot {
  SADDLE = 'SADDLE',
  SADDLEBAGS = 'SADDLEBAGS',
  HORSESHOES = 'HORSESHOES',
  BARDING = 'BARDING'
}

export enum HorseRarity {
  COMMON = 'COMMON',
  QUALITY = 'QUALITY',
  RARE = 'RARE',
  LEGENDARY = 'LEGENDARY'
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface Horse {
  _id: ObjectId;
  ownerId: ObjectId;
  name: string;
  breed: HorseBreed;
  gender: HorseGender;
  age: number; // Years (2-25)
  color: HorseColor;

  // Core Stats (1-100)
  stats: {
    speed: number;
    stamina: number;
    health: number;
    bravery: number;
    temperament: number;
  };

  // Derived Stats
  derivedStats: {
    carryCapacity: number;
    travelSpeedBonus: number;
    combatBonus: number;
  };

  // Bond System
  bond: {
    level: number; // 0-100
    trust: number; // 0-100
    loyalty: boolean;
    lastInteraction: Date;
  };

  // Training
  training: {
    trainedSkills: HorseSkill[];
    maxSkills: number;
    trainingProgress: Map<HorseSkill, number>; // 0-100 for skills in training
  };

  // Equipment
  equipment: {
    saddle?: ObjectId;
    saddlebags?: ObjectId;
    horseshoes?: ObjectId;
    barding?: ObjectId;
  };

  // Condition
  condition: {
    currentHealth: number;
    currentStamina: number;
    hunger: number; // 0-100 (0 = starving, 100 = well-fed)
    cleanliness: number; // 0-100 (affects bond)
    mood: HorseCondition;
  };

  // Breeding
  breeding?: {
    birthDate?: Date;
    sire?: ObjectId;
    dam?: ObjectId;
    foals: ObjectId[];
    isPregnant?: boolean;
    pregnantBy?: ObjectId;
    dueDate?: Date;
    breedingCooldown?: Date;
  };

  // History
  history: {
    purchasePrice: number;
    purchaseDate: Date;
    acquisitionMethod: 'purchase' | 'tame' | 'breed' | 'gift' | 'steal';
    racesWon: number;
    racesEntered: number;
    combatVictories: number;
    combatsEntered: number;
    distanceTraveled: number; // miles
  };

  // Location
  currentLocation: ObjectId; // Stable, ranch, or with owner
  isActive: boolean; // Currently being ridden

  createdAt: Date;
  updatedAt: Date;
}

export interface HorseBreedDefinition {
  breed: HorseBreed;
  name: string;
  description: string;
  rarity: HorseRarity;
  basePrice: number;

  // Base Stat Ranges (min-max)
  statRanges: {
    speed: [number, number];
    stamina: [number, number];
    health: [number, number];
    bravery: [number, number];
    temperament: [number, number];
  };

  // Capabilities
  specialties: string[];
  maxSkills: number;
  preferredColors: HorseColor[];

  // Availability
  wildEncounter: boolean;
  shopAvailable: boolean;
  requiresReputation?: number;

  // Unique Traits
  uniqueAbility?: string;
}

export interface HorseEquipment {
  _id: ObjectId;
  type: HorseEquipmentSlot;
  name: string;
  description: string;
  rarity: HorseRarity;
  price: number;

  // Stat Bonuses
  bonuses: {
    speed?: number;
    stamina?: number;
    health?: number;
    bravery?: number;
    carryCapacity?: number;
    combatBonus?: number;
  };

  // Requirements
  requirements?: {
    minHorseLevel?: number;
    breeds?: HorseBreed[];
  };

  // Durability
  durability: {
    current: number;
    max: number;
  };
}

export interface HorseSkillDefinition {
  skill: HorseSkill;
  name: string;
  description: string;
  trainingTime: number; // hours
  trainingCost: number;

  requirements?: {
    minBondLevel?: number;
    minStat?: {
      stat: keyof Horse['stats'];
      value: number;
    };
    prerequisiteSkills?: HorseSkill[];
  };

  effects: {
    description: string;
    bonus: Record<string, number>;
  };
}

export interface BondActivity {
  activity: 'feed' | 'groom' | 'ride' | 'train' | 'combat' | 'rescue' | 'neglect' | 'abuse';
  bondChange: number;
  trustChange?: number;
  description: string;
}

export interface HorseBreedingResult {
  success: boolean;
  message: string;
  foal?: {
    breed: HorseBreed;
    gender: HorseGender;
    color: HorseColor;
    predictedStats: Horse['stats'];
    isExceptional: boolean;
    specialTrait?: string;
  };
  dueDate?: Date;
}

// Note: HorseRace and HorseShow interfaces are defined in horseRacing.types.ts

export interface Stable {
  _id: ObjectId;
  ownerId: ObjectId;
  location: ObjectId;
  name: string;

  capacity: number;
  currentHorses: ObjectId[];

  facilities: {
    hasTrainingGrounds: boolean;
    hasBreedingPen: boolean;
    hasVeterinarian: boolean;
    quality: 'basic' | 'standard' | 'premium';
  };

  services: {
    autoFeed: boolean;
    autoGroom: boolean;
    training: boolean;
  };

  upkeepCost: number; // Per day
  lastUpkeepPaid: Date;

  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface PurchaseHorseRequest {
  breed: HorseBreed;
  gender?: HorseGender;
  name: string;
}

export interface TameWildHorseRequest {
  encounterHorseId: ObjectId;
  name: string;
}

export interface RenameHorseRequest {
  horseId: ObjectId;
  newName: string;
}

export interface FeedHorseRequest {
  horseId: ObjectId;
  foodQuality: 'basic' | 'quality' | 'premium';
}

export interface GroomHorseRequest {
  horseId: ObjectId;
}

export interface TrainHorseRequest {
  horseId: ObjectId;
  skill: HorseSkill;
}

export interface EquipHorseRequest {
  horseId: ObjectId;
  equipmentId: ObjectId;
  slot: HorseEquipmentSlot;
}

export interface BreedHorsesRequest {
  stallionId: ObjectId;
  mareId: ObjectId;
}

// Note: EnterRaceRequest and EnterShowRequest are defined in horseRacing.types.ts

export interface HorseResponse {
  horse: Horse;
  bondLevelName: BondLevel;
  canBreed: boolean;
  canTrain: boolean;
  needsCare: string[];
}

export interface HorseListResponse {
  horses: HorseResponse[];
  totalCount: number;
  activeHorse?: ObjectId;
}

export interface BreedingResponse {
  result: HorseBreedingResult;
  mare: Horse;
}

// Note: RaceResultResponse and ShowResultResponse are defined in horseRacing.types.ts

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface HorseStatsCalculation {
  baseStats: Horse['stats'];
  equipmentBonuses: Partial<Horse['stats']>;
  bondBonuses: Partial<Horse['stats']>;
  skillBonuses: Partial<Horse['stats']>;
  finalStats: Horse['stats'];
}

export interface BreedingGenetics {
  sireStats: Horse['stats'];
  damStats: Horse['stats'];
  inheritanceRolls: number[]; // Random factors
  foalStats: Horse['stats'];
  isExceptional: boolean;
  mutations: string[];
}

export interface HorseCareNeeds {
  needsFeeding: boolean;
  needsGrooming: boolean;
  needsVet: boolean;
  needsRest: boolean;
  urgencyLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  warnings: string[];
}

export interface MountedCombatBonus {
  attackBonus: number;
  defenseBonus: number;
  initiativeBonus: number;
  intimidationBonus: number;
  fleeChance: number; // Chance horse flees (modified by bravery and bond)
}
