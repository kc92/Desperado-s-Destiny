/**
 * Production System Types
 *
 * Types for property production mechanics including slots, workers, and products
 */

/**
 * Property type that can produce goods
 */
export enum PropertyType {
  RANCH = 'ranch',
  SHOP = 'shop',
  WORKSHOP = 'workshop',
  HOMESTEAD = 'homestead',
  MINE = 'mine',
  SALOON = 'saloon',
  STABLE = 'stable',
}

/**
 * Production slot status
 */
export type ProductionStatus = 'idle' | 'producing' | 'ready' | 'blocked';

/**
 * Product quality tiers
 */
export enum ProductQuality {
  POOR = 'poor',
  STANDARD = 'standard',
  GOOD = 'good',
  EXCELLENT = 'excellent',
  MASTERWORK = 'masterwork',
}

/**
 * Worker specialization types
 */
export enum WorkerSpecialization {
  // Ranch
  RANCHER = 'rancher',
  HORSE_TRAINER = 'horse_trainer',
  FARMER = 'farmer',
  SHEPHERD = 'shepherd',

  // Shop
  MERCHANT = 'merchant',
  CLERK = 'clerk',
  APPRAISER = 'appraiser',

  // Workshop
  BLACKSMITH = 'blacksmith',
  CARPENTER = 'carpenter',
  LEATHERWORKER = 'leatherworker',
  GUNSMITH = 'gunsmith',

  // Mine
  MINER = 'miner',
  PROSPECTOR = 'prospector',
  GEOLOGIST = 'geologist',
  SMELTER = 'smelter',

  // Saloon
  BARTENDER = 'bartender',
  COOK = 'cook',
  ENTERTAINER = 'entertainer',
  DEALER = 'dealer',

  // Stable
  STABLE_HAND = 'stable_hand',
  VETERINARIAN = 'veterinarian',
  BREEDER = 'breeder',

  // General
  LABORER = 'laborer',
  FOREMAN = 'foreman',
}

/**
 * Product categories
 */
export enum ProductCategory {
  // Ranch
  LIVESTOCK = 'livestock',
  CROPS = 'crops',
  ANIMAL_PRODUCTS = 'animal_products',

  // Mine
  ORE = 'ore',
  GEMS = 'gems',
  COAL = 'coal',

  // Saloon
  DRINKS = 'drinks',
  FOOD = 'food',
  GAMBLING_REVENUE = 'gambling_revenue',
  ENTERTAINMENT = 'entertainment',
  LODGING = 'lodging',

  // Stable
  HORSES = 'horses',
  TRAINING = 'training',
  BOARDING = 'boarding',

  // Workshop
  CRAFTED_GOODS = 'crafted_goods',
  REPAIRS = 'repairs',

  // Shop
  RETAIL = 'retail',
  SERVICES = 'services',
}

/**
 * Material required for production
 */
export interface ProductionMaterial {
  itemId: string;
  quantity: number;
  consumed: boolean; // If false, item is returned after use (like tools)
}

/**
 * Production output item
 */
export interface ProductionOutput {
  itemId: string;
  baseQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  qualityAffectsQuantity: boolean;
  sellPrice: number; // Auto-sell price (90% of shop value)
}

/**
 * Production recipe/definition
 */
export interface ProductDefinition {
  productId: string;
  name: string;
  description: string;
  category: ProductCategory;
  propertyTypes: PropertyType[];

  // Requirements
  requiredLevel: number;
  requiredUpgrades?: string[];
  requiredWorkerType?: WorkerSpecialization;

  // Resources
  materials: ProductionMaterial[];
  energyCost: number;
  goldCost: number;

  // Time
  baseProductionTime: number; // In minutes

  // Workers
  minWorkers: number;
  maxWorkers: number;
  workerEfficiencyBonus: number; // Per worker after first

  // Output
  outputs: ProductionOutput[];

  // Bonuses
  qualityBonusChance: number; // Base chance for quality upgrade

  // Flags
  canRush: boolean;
  rushCostMultiplier: number; // Gold cost multiplier for rushing
  isUnique: boolean; // Can only be produced once
  isRepeatable: boolean;

  // Metadata
  icon: string;
  tags: string[];
}

/**
 * Active production order in a slot
 */
export interface ProductionOrder {
  orderId: string;
  productId: string;
  quantity: number;
  targetQuality: ProductQuality;

  // Materials
  materialsUsed: Array<{ itemId: string; quantity: number }>;

  // Workers
  workersAssigned: number;
  workerIds: string[];

  // Time
  startTime: Date;
  estimatedCompletion: Date;
  actualCompletion?: Date;

  // Rush
  isRushed: boolean;
  rushCost?: number;

  // Results
  completedQuantity: number;
  actualQuality?: ProductQuality;
  bonusYield: number;

  // Metadata
  createdAt: Date;
}

/**
 * Production slot on a property
 */
export interface ProductionSlot {
  slotId: string;
  slotNumber: number;
  propertyType: PropertyType;

  // Status
  status: ProductionStatus;
  currentOrder?: ProductionOrder;

  // Capacity
  baseCapacity: number;
  currentCapacity: number;

  // Bonuses from upgrades
  speedBonus: number; // Percentage
  yieldBonus: number; // Percentage
  qualityBonus: number; // Percentage

  // Specialization
  specialization?: ProductCategory;
  specializationBonus: number;

  // Locks
  isLocked: boolean;
  unlockCost?: number;
  unlockLevel?: number;
}

/**
 * Worker instance
 */
export interface PropertyWorker {
  workerId: string;
  propertyId: string;

  // Identity
  name: string;
  specialization: WorkerSpecialization;

  // Stats
  skillLevel: number; // 1-100
  loyalty: number; // 0-100
  efficiency: number; // 0.5 - 2.0 multiplier
  morale: number; // 0-100

  // Employment
  weeklyWage: number;
  hiredDate: Date;
  lastPaidDate: Date;

  // Assignment
  isAssigned: boolean;
  assignedSlotId?: string;
  currentOrderId?: string;

  // Experience
  experience: number;
  productionsCompleted: number;

  // Traits
  traits: WorkerTrait[];

  // Status
  isSick: boolean;
  sickUntil?: Date;
  isOnStrike: boolean;
  strikeReason?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Worker personality traits
 */
export interface WorkerTrait {
  traitId: string;
  name: string;
  description: string;
  effects: Array<{
    type: 'speed' | 'quality' | 'yield' | 'loyalty' | 'morale' | 'wage';
    value: number;
  }>;
}

/**
 * Auto-sell configuration
 */
export interface AutoSellConfig {
  enabled: boolean;
  productId: string;
  sellThreshold: number; // Quantity before auto-selling
  reserveAmount: number; // Amount to keep in storage
  priceMultiplier: number; // Percentage of base price (default 0.9)
}

/**
 * Production statistics
 */
export interface ProductionStats {
  propertyId: string;

  // Totals
  totalProductions: number;
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;

  // By product
  productionsByProduct: Record<string, {
    count: number;
    revenue: number;
    averageQuality: number;
  }>;

  // By worker
  topWorkers: Array<{
    workerId: string;
    name: string;
    productions: number;
    efficiency: number;
  }>;

  // Time
  averageProductionTime: number;
  fastestProduction: number;

  // Quality
  qualityDistribution: Record<ProductQuality, number>;

  // Period
  periodStart: Date;
  periodEnd: Date;
}

/**
 * Production event for logging
 */
export interface ProductionEvent {
  eventId: string;
  propertyId: string;
  slotId: string;
  eventType: 'started' | 'completed' | 'failed' | 'cancelled' | 'rushed';

  productId: string;
  quantity: number;
  quality?: ProductQuality;

  workersInvolved: string[];

  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Worker hiring pool entry
 */
export interface WorkerListing {
  listingId: string;
  specialization: WorkerSpecialization;
  skillLevel: number;
  weeklyWage: number;
  traits: WorkerTrait[];

  // Availability
  availableUntil: Date;

  // Generated attributes
  name: string;
  loyalty: number;
  efficiency: number;
}

/**
 * Production bonus source
 */
export interface ProductionBonus {
  source: 'upgrade' | 'worker' | 'character_skill' | 'event' | 'gang_perk';
  sourceId: string;
  bonusType: 'speed' | 'yield' | 'quality' | 'cost_reduction';
  value: number;
  description: string;
  expiresAt?: Date;
}

/**
 * Property production configuration
 */
export interface PropertyProductionConfig {
  propertyId: string;
  propertyType: PropertyType;
  characterId: string;

  // Slots
  slots: ProductionSlot[];
  maxSlots: number;

  // Workers
  workers: PropertyWorker[];
  maxWorkers: number;

  // Auto-sell
  autoSellConfigs: AutoSellConfig[];

  // Active bonuses
  activeBonuses: ProductionBonus[];

  // Statistics
  stats: ProductionStats;

  // Settings
  allowAutoCollect: boolean;
  notifyOnCompletion: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
