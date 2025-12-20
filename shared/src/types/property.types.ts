/**
 * Property Ownership System Types
 *
 * Shared types for property ownership, purchase, and management
 * Phase 8, Wave 8.1 - Property Models & Purchase System
 */

// Import and re-export types from production.types to avoid duplication
import type { PropertyWorker, ProductionSlot } from './production.types';
import { PropertyType } from './production.types';
export { PropertyType };
export type { PropertyWorker, ProductionSlot };

/**
 * Property size categories
 */
export enum PropertySize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  HUGE = 'huge',
}

/**
 * Property status
 */
export enum PropertyStatus {
  ACTIVE = 'active',
  ABANDONED = 'abandoned',
  FORECLOSED = 'foreclosed',
  UNDER_CONSTRUCTION = 'under_construction',
}

/**
 * Property tier levels (1-5)
 */
export type PropertyTier = 1 | 2 | 3 | 4 | 5;

/**
 * Purchase source types
 */
export enum PurchaseSource {
  NPC_DIRECT = 'npc_direct',
  AUCTION = 'auction',
  FORECLOSURE = 'foreclosure',
  QUEST_REWARD = 'quest_reward',
  TRANSFER = 'transfer',
}

/**
 * Property upgrade categories
 */
export enum UpgradeCategory {
  CAPACITY = 'capacity',
  EFFICIENCY = 'efficiency',
  DEFENSE = 'defense',
  COMFORT = 'comfort',
  SPECIALTY = 'specialty',
}

/**
 * Upgrade types by property type
 */
export enum RanchUpgrade {
  LIVESTOCK_PEN = 'livestock_pen',
  CROP_FIELD = 'crop_field',
  WELL = 'well',
  BARN = 'barn',
  WINDMILL = 'windmill',
}

export enum ShopUpgrade {
  DISPLAY_CASES = 'display_cases',
  BACK_ROOM = 'back_room',
  SIGN = 'sign',
  SECURITY = 'security',
  EXPANDED_INVENTORY = 'expanded_inventory',
}

export enum WorkshopUpgrade {
  FORGE = 'forge',
  WORKBENCH = 'workbench',
  TOOL_RACK = 'tool_rack',
  QUALITY_TOOLS = 'quality_tools',
  VENTILATION = 'ventilation',
}

export enum HomesteadUpgrade {
  BEDROOM = 'bedroom',
  KITCHEN = 'kitchen',
  CELLAR = 'cellar',
  GARDEN = 'garden',
  SECURITY_SYSTEM = 'security_system',
}

export enum MineUpgrade {
  SUPPORT_BEAMS = 'support_beams',
  RAIL_SYSTEM = 'rail_system',
  VENTILATION_SHAFT = 'ventilation_shaft',
  EXPLOSIVES_STORAGE = 'explosives_storage',
  WATER_PUMP = 'water_pump',
}

export enum SaloonUpgrade {
  BAR_EXPANSION = 'bar_expansion',
  STAGE = 'stage',
  ROOMS = 'rooms',
  GAMING_TABLES = 'gaming_tables',
  BOUNCER = 'bouncer',
}

export enum StableUpgrade {
  HORSE_STALLS = 'horse_stalls',
  TRAINING_RING = 'training_ring',
  TACK_ROOM = 'tack_room',
  FEED_STORAGE = 'feed_storage',
  BREEDING_PEN = 'breeding_pen',
}

/**
 * Property upgrade definition
 */
export interface PropertyUpgrade {
  upgradeId: string;
  upgradeType: RanchUpgrade | ShopUpgrade | WorkshopUpgrade | HomesteadUpgrade | MineUpgrade | SaloonUpgrade | StableUpgrade;
  category: UpgradeCategory;
  installedAt: Date;
  level: number;
  maxLevel: number;
}

/**
 * Worker types for property management
 * Note: PropertyWorker interface is imported from production.types
 */
export enum WorkerType {
  FARMHAND = 'farmhand',
  SHOPKEEPER = 'shopkeeper',
  CRAFTSMAN = 'craftsman',
  MINER = 'miner',
  BARTENDER = 'bartender',
  STABLE_HAND = 'stable_hand',
  SECURITY = 'security',
  MANAGER = 'manager',
}

/**
 * Storage item entry
 */
export interface PropertyStorageItem {
  itemId: string;
  itemName: string;
  quantity: number;
  addedAt: Date;
}

/**
 * Property storage
 */
export interface PropertyStorage {
  capacity: number;
  currentUsage: number;
  items: PropertyStorageItem[];
}

/**
 * Note: ProductionSlot interface is imported from production.types
 */

/**
 * Property loan details
 */
export interface PropertyLoan {
  _id: string;
  propertyId: string;
  characterId: string;
  originalAmount: number;
  remainingBalance: number;
  interestRate: number; // Percentage (5-15%)
  monthlyPayment: number;
  nextPaymentDue: Date;
  missedPayments: number;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Main Property interface
 */
export interface Property {
  _id: string;
  propertyType: PropertyType;
  name: string;
  locationId: string;
  ownerId?: string; // null if unclaimed

  // Purchase details
  purchasePrice: number;
  purchaseDate?: Date;
  purchasedFrom?: string; // NPC name or 'auction' or 'foreclosure'
  purchaseSource: PurchaseSource;

  // Physical attributes
  size: PropertySize;
  condition: number; // 0-100%

  // Upgrades and tier
  tier: PropertyTier;
  upgrades: PropertyUpgrade[];
  maxUpgrades: number;

  // Workers
  workers: PropertyWorker[];
  maxWorkers: number;

  // Storage
  storage: PropertyStorage;

  // Financials
  weeklyTaxes: number;
  weeklyUpkeep: number;
  lastTaxPayment?: Date;
  taxDebt: number;

  // Production
  productionSlots: ProductionSlot[];

  // Status
  status: PropertyStatus;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Property listing (available for purchase)
 */
export interface PropertyListing {
  _id: string;
  propertyType: PropertyType;
  name: string;
  description: string;
  locationId: string;
  locationName: string;
  size: PropertySize;
  tier: PropertyTier;
  price: number;
  condition: number;

  // Requirements to purchase
  requirements: PropertyRequirements;

  // Availability
  isAvailable: boolean;
  isAuction: boolean;
  auctionEndTime?: Date;
  currentBid?: number;
  highestBidder?: string;

  // Source
  source: PurchaseSource;
  npcSeller?: string;
}

/**
 * Requirements to purchase or access property
 */
export interface PropertyRequirements {
  minLevel?: number;
  minGold?: number;
  minReputation?: number;
  requiredFaction?: string;
  factionStanding?: 'neutral' | 'friendly' | 'honored';
  allowsLoan?: boolean;
  minDownPayment?: number; // Percentage (20-50%)
}

/**
 * Property tier information
 */
export const PROPERTY_TIER_INFO = {
  1: {
    name: 'Basic',
    upgradeSlots: 2,
    workerSlots: 1,
    productionSlots: 1,
    storageMultiplier: 1,
    upgradeCost: 500,
  },
  2: {
    name: 'Improved',
    upgradeSlots: 4,
    workerSlots: 2,
    productionSlots: 2,
    storageMultiplier: 1.5,
    upgradeCost: 1500,
  },
  3: {
    name: 'Advanced',
    upgradeSlots: 6,
    workerSlots: 3,
    productionSlots: 3,
    storageMultiplier: 2,
    upgradeCost: 5000,
  },
  4: {
    name: 'Superior',
    upgradeSlots: 8,
    workerSlots: 5,
    productionSlots: 4,
    storageMultiplier: 3,
    upgradeCost: 15000,
  },
  5: {
    name: 'Legendary',
    upgradeSlots: 10,
    workerSlots: 8,
    productionSlots: 5,
    storageMultiplier: 5,
    upgradeCost: 50000,
  },
} as const;

/**
 * Property size information
 */
export const PROPERTY_SIZE_INFO = {
  [PropertySize.SMALL]: {
    name: 'Small',
    baseStorage: 50,
    baseTaxes: 10,
    baseUpkeep: 5,
    priceMultiplier: 1,
  },
  [PropertySize.MEDIUM]: {
    name: 'Medium',
    baseStorage: 100,
    baseTaxes: 25,
    baseUpkeep: 15,
    priceMultiplier: 2,
  },
  [PropertySize.LARGE]: {
    name: 'Large',
    baseStorage: 200,
    baseTaxes: 50,
    baseUpkeep: 30,
    priceMultiplier: 4,
  },
  [PropertySize.HUGE]: {
    name: 'Huge',
    baseStorage: 500,
    baseTaxes: 100,
    baseUpkeep: 60,
    priceMultiplier: 8,
  },
} as const;

/**
 * Property type base prices and characteristics
 */
export const PROPERTY_TYPE_INFO = {
  [PropertyType.RANCH]: {
    name: 'Ranch',
    description: 'Agricultural property for livestock and crops',
    basePrice: 1000,
    incomeType: 'production',
    specialFeature: 'Livestock and crop production',
  },
  [PropertyType.SHOP]: {
    name: 'Shop',
    description: 'Retail business in town',
    basePrice: 1500,
    incomeType: 'sales',
    specialFeature: 'Customer traffic and trade',
  },
  [PropertyType.WORKSHOP]: {
    name: 'Workshop',
    description: 'Crafting facility for creating items',
    basePrice: 1200,
    incomeType: 'crafting',
    specialFeature: 'Enhanced crafting capabilities',
  },
  [PropertyType.HOMESTEAD]: {
    name: 'Homestead',
    description: 'Personal residence with storage',
    basePrice: 800,
    incomeType: 'none',
    specialFeature: 'Safe storage and respawn point',
  },
  [PropertyType.MINE]: {
    name: 'Mine',
    description: 'Ore extraction operation',
    basePrice: 2000,
    incomeType: 'extraction',
    specialFeature: 'Passive ore generation',
  },
  [PropertyType.SALOON]: {
    name: 'Saloon',
    description: 'Entertainment and gambling venue',
    basePrice: 3000,
    incomeType: 'entertainment',
    specialFeature: 'Games and social hub',
  },
  [PropertyType.STABLE]: {
    name: 'Stable',
    description: 'Horse breeding and boarding facility',
    basePrice: 1800,
    incomeType: 'breeding',
    specialFeature: 'Mount breeding and training',
  },
} as const;

/**
 * Loan configuration
 */
export const LOAN_CONFIG = {
  MIN_DOWN_PAYMENT: 20, // 20% minimum
  MAX_DOWN_PAYMENT: 50, // 50% maximum
  MIN_INTEREST_RATE: 5, // 5% for excellent reputation
  MAX_INTEREST_RATE: 15, // 15% for poor reputation
  MISSED_PAYMENT_PENALTY: 50, // Gold penalty
  FORECLOSURE_THRESHOLD: 3, // Missed payments before foreclosure
  PAYMENT_INTERVAL_DAYS: 7, // Weekly payments
} as const;

/**
 * Property purchase request
 */
export interface PropertyPurchaseRequest {
  characterId: string;
  listingId: string;
  useLoan: boolean;
  downPaymentPercentage?: number;
}

/**
 * Property auction bid request
 */
export interface PropertyBidRequest {
  characterId: string;
  listingId: string;
  bidAmount: number;
}

/**
 * Property upgrade request
 */
export interface PropertyUpgradeRequest {
  characterId: string;
  propertyId: string;
  upgradeType: string;
}

/**
 * Property tier upgrade request
 */
export interface PropertyTierUpgradeRequest {
  characterId: string;
  propertyId: string;
}

/**
 * Worker hire request
 */
export interface WorkerHireRequest {
  characterId: string;
  propertyId: string;
  workerType: WorkerType;
  skill: number;
}

/**
 * Worker fire request
 */
export interface WorkerFireRequest {
  characterId: string;
  propertyId: string;
  workerId: string;
}

/**
 * Storage deposit/withdraw request
 */
export interface PropertyStorageRequest {
  characterId: string;
  propertyId: string;
  itemId: string;
  quantity: number;
  action: 'deposit' | 'withdraw';
}

/**
 * Production start request
 */
export interface ProductionStartRequest {
  characterId: string;
  propertyId: string;
  slotId: string;
  recipeId: string;
}

/**
 * Loan payment request
 */
export interface LoanPaymentRequest {
  characterId: string;
  loanId: string;
  amount?: number; // If not provided, makes minimum payment
}

/**
 * Property transfer request
 */
export interface PropertyTransferRequest {
  characterId: string;
  propertyId: string;
  targetCharacterId: string;
  price?: number; // If selling, 0 for gift
}

/**
 * Property constraints
 */
export const PROPERTY_CONSTRAINTS = {
  MAX_PROPERTIES_PER_CHARACTER: 5,
  MAX_WORKERS_PER_PROPERTY: 10,
  MAX_UPGRADES_PER_PROPERTY: 10,
  MAX_PRODUCTION_SLOTS: 5,
  CONDITION_DECAY_PER_WEEK: 1, // 1% per week if not maintained
  ABANDONMENT_WEEKS: 4, // Weeks without payment before abandonment
  FORECLOSURE_RECOVERY_PERCENTAGE: 60, // % of value recovered in foreclosure
} as const;

/**
 * Worker skill tiers
 */
export const WORKER_SKILL_TIERS = {
  NOVICE: { min: 1, max: 25, wageMultiplier: 1 },
  SKILLED: { min: 26, max: 50, wageMultiplier: 1.5 },
  EXPERT: { min: 51, max: 75, wageMultiplier: 2 },
  MASTER: { min: 76, max: 100, wageMultiplier: 3 },
} as const;

/**
 * Base worker wages by type (daily)
 */
export const BASE_WORKER_WAGES = {
  [WorkerType.FARMHAND]: 5,
  [WorkerType.SHOPKEEPER]: 8,
  [WorkerType.CRAFTSMAN]: 10,
  [WorkerType.MINER]: 12,
  [WorkerType.BARTENDER]: 7,
  [WorkerType.STABLE_HAND]: 6,
  [WorkerType.SECURITY]: 15,
  [WorkerType.MANAGER]: 20,
} as const;

/**
 * Property condition thresholds
 */
export const CONDITION_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 70,
  FAIR: 50,
  POOR: 30,
  DILAPIDATED: 10,
} as const;

/**
 * Upgrade information by property type
 */
export interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  category: UpgradeCategory;
  propertyType: PropertyType;
  cost: number;
  minTier: PropertyTier;
  maxLevel: number;
  benefits: string[];
  requirements?: {
    requiresUpgrade?: string;
    minCondition?: number;
  };
}
