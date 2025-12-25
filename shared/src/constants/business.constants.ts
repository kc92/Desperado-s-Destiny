/**
 * Business Ownership System Constants
 *
 * Phase 12: Business Ownership
 * Balance constants, service definitions, and economy settings
 */

import {
  PlayerBusinessType,
  BusinessServiceCategory,
  IBusinessServiceDefinition,
  IBusinessProductDefinition,
} from '../types/business.types';
import { WorkerSpecialization } from '../types/production.types';

// =============================================================================
// Economy Balance Constants
// =============================================================================

export const BUSINESS_ECONOMY_CONSTANTS = {
  // Revenue caps (anti-exploit)
  HOURLY_REVENUE_CAP: 500000,          // $500k/hour max
  DAILY_REVENUE_CAP: 3000000,          // $3M/day max

  // Visit-to-collect settings
  MIN_COLLECTION_AMOUNT: 10,            // Minimum $10 to collect
  COLLECTION_COOLDOWN_MS: 60000,        // 1 minute between collections

  // Traffic simulation
  TRAFFIC_SIMULATION_INTERVAL_MS: 300000, // Every 5 minutes
  NPC_SPAWN_VARIANCE: 0.3,              // ±30% randomness in NPC traffic

  // Reputation effects
  REPUTATION_TRAFFIC_MIN: 0.25,         // 25% traffic at 0 reputation
  REPUTATION_TRAFFIC_MAX: 1.5,          // 150% traffic at 100 reputation
  REPUTATION_DECAY_INACTIVE_DAYS: 1,    // Days before decay starts

  // Price elasticity
  PRICE_LOW_TRAFFIC_BONUS: 1.5,         // +50% traffic at -30% prices
  PRICE_HIGH_TRAFFIC_PENALTY: 0.5,      // -50% traffic at +30% prices
  PRICE_DEVIATION_THRESHOLD: 0.3,       // 30% deviation triggers modifier

  // Worker effects
  WORKER_EFFICIENCY_MIN: 0.5,           // Worst worker = 50% output
  WORKER_EFFICIENCY_MAX: 2.0,           // Best worker = 200% output
  UNSTAFFED_SERVICE_PENALTY: 0.25,      // 25% effectiveness without worker

  // P2P transaction fees
  P2P_PLATFORM_FEE: 0.05,               // 5% fee on P2P transactions
  P2P_MIN_TRANSACTION: 10,              // Minimum $10 for P2P

  // Establishment costs
  BASE_ESTABLISHMENT_COST: 500,         // Base cost before multipliers

  // Operating costs
  DAILY_OPERATING_COST_MULTIPLIER: 0.01, // 1% of property value per day
  STAFF_MANAGEMENT_OVERHEAD: 0.1,        // 10% overhead per staff member
} as const;

// =============================================================================
// Traffic Rate Modifiers
// =============================================================================

export const TRAFFIC_MODIFIERS = {
  // Location type modifiers
  LOCATION_MODIFIERS: {
    town_center: 1.5,                   // High traffic in town centers
    main_street: 1.3,
    residential: 0.8,
    outskirts: 0.6,
    frontier: 0.4,
    wilderness: 0.2,
  },

  // Time of day modifiers
  TIME_MODIFIERS: {
    dawn: 0.3,      // 5-7am
    morning: 0.8,   // 7-11am
    midday: 1.0,    // 11am-2pm
    afternoon: 1.2, // 2-6pm
    evening: 1.5,   // 6-10pm (peak)
    night: 0.6,     // 10pm-1am
    late_night: 0.2, // 1-5am
  },

  // Day of week modifiers (game calendar)
  DAY_MODIFIERS: {
    monday: 0.8,
    tuesday: 0.9,
    wednesday: 1.0,
    thursday: 1.0,
    friday: 1.2,
    saturday: 1.5,
    sunday: 1.3,
  },

  // Weather modifiers
  WEATHER_MODIFIERS: {
    clear: 1.0,
    cloudy: 0.95,
    rain: 0.7,
    storm: 0.4,
    snow: 0.5,
    heat_wave: 0.8,
    dust_storm: 0.3,
  },

  // Event modifiers
  EVENT_MODIFIERS: {
    festival: 2.0,
    market_day: 1.5,
    town_meeting: 1.3,
    shootout: 0.5,
    robbery: 0.3,
    gang_war: 0.2,
  },

  // Competition modifier (per competing business of same type)
  COMPETITION_PENALTY_PER_BUSINESS: 0.15, // -15% per competitor
  COMPETITION_MIN_TRAFFIC: 0.4,           // Minimum 40% even with competition
} as const;

// =============================================================================
// Service Definitions
// =============================================================================

export const SERVICE_DEFINITIONS: IBusinessServiceDefinition[] = [
  // ==========================================================================
  // SALOON Services
  // ==========================================================================
  {
    serviceId: 'saloon_drinks_basic',
    name: 'Basic Drinks',
    description: 'Beer, whiskey, and simple cocktails',
    category: BusinessServiceCategory.DRINKS,
    businessTypes: [PlayerBusinessType.SALOON],
    basePrice: 5,
    baseDuration: 5,
    customerSatisfactionBase: 60,
  },
  {
    serviceId: 'saloon_drinks_premium',
    name: 'Premium Spirits',
    description: 'Fine imported liquors and aged whiskey',
    category: BusinessServiceCategory.DRINKS,
    businessTypes: [PlayerBusinessType.SALOON],
    basePrice: 25,
    baseDuration: 10,
    requiredWorkerSpecialization: WorkerSpecialization.BARTENDER,
    requiredTier: 2,
    customerSatisfactionBase: 80,
  },
  {
    serviceId: 'saloon_meal_basic',
    name: 'Hot Meal',
    description: 'Simple but hearty frontier cooking',
    category: BusinessServiceCategory.FOOD,
    businessTypes: [PlayerBusinessType.SALOON],
    basePrice: 15,
    baseDuration: 20,
    requiredWorkerSpecialization: WorkerSpecialization.COOK,
    customerSatisfactionBase: 70,
  },
  {
    serviceId: 'saloon_meal_feast',
    name: 'Feast',
    description: 'Multi-course meal with all the fixings',
    category: BusinessServiceCategory.FOOD,
    businessTypes: [PlayerBusinessType.SALOON],
    basePrice: 50,
    baseDuration: 45,
    requiredWorkerSpecialization: WorkerSpecialization.COOK,
    requiredTier: 3,
    customerSatisfactionBase: 90,
  },
  {
    serviceId: 'saloon_gambling_poker',
    name: 'Poker Table',
    description: 'Join a poker game',
    category: BusinessServiceCategory.GAMBLING,
    businessTypes: [PlayerBusinessType.SALOON],
    basePrice: 25,
    baseDuration: 60,
    requiredWorkerSpecialization: WorkerSpecialization.DEALER,
    customerSatisfactionBase: 75,
  },
  {
    serviceId: 'saloon_gambling_faro',
    name: 'Faro Table',
    description: 'Play faro with the house',
    category: BusinessServiceCategory.GAMBLING,
    businessTypes: [PlayerBusinessType.SALOON],
    basePrice: 50,
    baseDuration: 30,
    requiredWorkerSpecialization: WorkerSpecialization.DEALER,
    requiredTier: 2,
    customerSatisfactionBase: 70,
  },
  {
    serviceId: 'saloon_entertainment_music',
    name: 'Live Music',
    description: 'Enjoy piano and singing entertainment',
    category: BusinessServiceCategory.ENTERTAINMENT,
    businessTypes: [PlayerBusinessType.SALOON],
    basePrice: 10,
    baseDuration: 30,
    requiredWorkerSpecialization: WorkerSpecialization.ENTERTAINER,
    customerSatisfactionBase: 80,
  },
  {
    serviceId: 'saloon_entertainment_show',
    name: 'Stage Show',
    description: 'Full theatrical performance',
    category: BusinessServiceCategory.ENTERTAINMENT,
    businessTypes: [PlayerBusinessType.SALOON],
    basePrice: 30,
    baseDuration: 60,
    requiredWorkerSpecialization: WorkerSpecialization.ENTERTAINER,
    requiredTier: 3,
    customerSatisfactionBase: 90,
  },
  {
    serviceId: 'saloon_room_basic',
    name: 'Room for Night',
    description: 'Basic lodging with bed and wash basin',
    category: BusinessServiceCategory.LODGING,
    businessTypes: [PlayerBusinessType.SALOON],
    basePrice: 30,
    baseDuration: 480, // 8 hours
    customerSatisfactionBase: 65,
    cooldownMinutes: 1440, // Once per day
  },
  {
    serviceId: 'saloon_room_suite',
    name: 'Private Suite',
    description: 'Luxury accommodations with all amenities',
    category: BusinessServiceCategory.LODGING,
    businessTypes: [PlayerBusinessType.SALOON],
    basePrice: 100,
    baseDuration: 480,
    requiredTier: 4,
    customerSatisfactionBase: 95,
    cooldownMinutes: 1440,
  },

  // ==========================================================================
  // GENERAL STORE Services
  // ==========================================================================
  {
    serviceId: 'store_buy_general',
    name: 'General Goods',
    description: 'Browse and purchase everyday items',
    category: BusinessServiceCategory.RETAIL,
    businessTypes: [PlayerBusinessType.GENERAL_STORE],
    basePrice: 0, // Price determined by items
    baseDuration: 10,
    requiredWorkerSpecialization: WorkerSpecialization.CLERK,
    customerSatisfactionBase: 70,
  },
  {
    serviceId: 'store_sell_items',
    name: 'Sell Items',
    description: 'Sell your goods to the store',
    category: BusinessServiceCategory.BROKERAGE,
    businessTypes: [PlayerBusinessType.GENERAL_STORE],
    basePrice: 0, // Price determined by items
    baseDuration: 5,
    requiredWorkerSpecialization: WorkerSpecialization.APPRAISER,
    customerSatisfactionBase: 65,
  },
  {
    serviceId: 'store_special_order',
    name: 'Special Order',
    description: 'Request hard-to-find items',
    category: BusinessServiceCategory.RETAIL,
    businessTypes: [PlayerBusinessType.GENERAL_STORE],
    basePrice: 50,
    baseDuration: 15,
    requiredWorkerSpecialization: WorkerSpecialization.MERCHANT,
    requiredTier: 2,
    customerSatisfactionBase: 80,
  },

  // ==========================================================================
  // BLACKSMITH Services
  // ==========================================================================
  {
    serviceId: 'smith_repair_basic',
    name: 'Equipment Repair',
    description: 'Repair damaged weapons and armor',
    category: BusinessServiceCategory.REPAIR,
    businessTypes: [PlayerBusinessType.BLACKSMITH],
    basePrice: 50,
    baseDuration: 30,
    requiredWorkerSpecialization: WorkerSpecialization.BLACKSMITH,
    customerSatisfactionBase: 75,
  },
  {
    serviceId: 'smith_repair_emergency',
    name: 'Emergency Repair',
    description: 'Rush repair job - double speed',
    category: BusinessServiceCategory.REPAIR,
    businessTypes: [PlayerBusinessType.BLACKSMITH],
    basePrice: 150,
    baseDuration: 15,
    requiredWorkerSpecialization: WorkerSpecialization.BLACKSMITH,
    requiredTier: 2,
    customerSatisfactionBase: 70,
  },
  {
    serviceId: 'smith_upgrade_weapon',
    name: 'Weapon Upgrade',
    description: 'Improve weapon damage and durability',
    category: BusinessServiceCategory.UPGRADE,
    businessTypes: [PlayerBusinessType.BLACKSMITH],
    basePrice: 200,
    baseDuration: 120,
    requiredWorkerSpecialization: WorkerSpecialization.BLACKSMITH,
    requiredTier: 2,
    customerSatisfactionBase: 85,
  },
  {
    serviceId: 'smith_custom_order',
    name: 'Custom Order',
    description: 'Commission a custom-made item',
    category: BusinessServiceCategory.CUSTOM_CRAFTING,
    businessTypes: [PlayerBusinessType.BLACKSMITH],
    basePrice: 500,
    baseDuration: 480,
    requiredWorkerSpecialization: WorkerSpecialization.BLACKSMITH,
    requiredTier: 3,
    customerSatisfactionBase: 90,
  },

  // ==========================================================================
  // STABLE Services
  // ==========================================================================
  {
    serviceId: 'stable_boarding_basic',
    name: 'Horse Boarding',
    description: 'Daily care and shelter for your horse',
    category: BusinessServiceCategory.BOARDING,
    businessTypes: [PlayerBusinessType.STABLE],
    basePrice: 20,
    baseDuration: 1440, // 24 hours
    requiredWorkerSpecialization: WorkerSpecialization.STABLE_HAND,
    customerSatisfactionBase: 70,
  },
  {
    serviceId: 'stable_boarding_premium',
    name: 'Premium Boarding',
    description: 'Extra care, grooming, and premium feed',
    category: BusinessServiceCategory.BOARDING,
    businessTypes: [PlayerBusinessType.STABLE],
    basePrice: 50,
    baseDuration: 1440,
    requiredWorkerSpecialization: WorkerSpecialization.STABLE_HAND,
    requiredTier: 2,
    customerSatisfactionBase: 90,
  },
  {
    serviceId: 'stable_training_basic',
    name: 'Basic Training',
    description: 'Improve horse obedience and stamina',
    category: BusinessServiceCategory.TRAINING,
    businessTypes: [PlayerBusinessType.STABLE],
    basePrice: 100,
    baseDuration: 480,
    requiredWorkerSpecialization: WorkerSpecialization.HORSE_TRAINER,
    requiredTier: 2,
    customerSatisfactionBase: 75,
  },
  {
    serviceId: 'stable_training_advanced',
    name: 'Advanced Training',
    description: 'Teach special skills and racing techniques',
    category: BusinessServiceCategory.TRAINING,
    businessTypes: [PlayerBusinessType.STABLE],
    basePrice: 300,
    baseDuration: 960,
    requiredWorkerSpecialization: WorkerSpecialization.HORSE_TRAINER,
    requiredTier: 3,
    customerSatisfactionBase: 85,
  },
  {
    serviceId: 'stable_breeding',
    name: 'Breeding Service',
    description: 'Breed horses for quality offspring',
    category: BusinessServiceCategory.BREEDING,
    businessTypes: [PlayerBusinessType.STABLE],
    basePrice: 500,
    baseDuration: 10080, // 7 days
    requiredWorkerSpecialization: WorkerSpecialization.BREEDER,
    requiredTier: 4,
    customerSatisfactionBase: 80,
  },

  // ==========================================================================
  // DOCTOR OFFICE Services
  // ==========================================================================
  {
    serviceId: 'doctor_heal_wounds',
    name: 'Treat Wounds',
    description: 'Bandage and treat combat injuries',
    category: BusinessServiceCategory.HEALING,
    businessTypes: [PlayerBusinessType.DOCTOR_OFFICE],
    basePrice: 30,
    baseDuration: 15,
    energyCost: 0,
    customerSatisfactionBase: 80,
  },
  {
    serviceId: 'doctor_heal_full',
    name: 'Full Recovery',
    description: 'Complete medical treatment and rest',
    category: BusinessServiceCategory.HEALING,
    businessTypes: [PlayerBusinessType.DOCTOR_OFFICE],
    basePrice: 100,
    baseDuration: 60,
    requiredTier: 2,
    customerSatisfactionBase: 90,
  },
  {
    serviceId: 'doctor_medicine_basic',
    name: 'Basic Medicine',
    description: 'Purchase healing tonics and bandages',
    category: BusinessServiceCategory.MEDICINE,
    businessTypes: [PlayerBusinessType.DOCTOR_OFFICE],
    basePrice: 25,
    baseDuration: 5,
    customerSatisfactionBase: 70,
  },
  {
    serviceId: 'doctor_surgery',
    name: 'Surgery',
    description: 'Complex medical procedure for serious conditions',
    category: BusinessServiceCategory.SURGERY,
    businessTypes: [PlayerBusinessType.DOCTOR_OFFICE],
    basePrice: 500,
    baseDuration: 180,
    requiredTier: 3,
    customerSatisfactionBase: 85,
  },

  // ==========================================================================
  // BANK BRANCH Services
  // ==========================================================================
  {
    serviceId: 'bank_deposit',
    name: 'Secure Deposit',
    description: 'Store money safely with interest',
    category: BusinessServiceCategory.DEPOSITS,
    businessTypes: [PlayerBusinessType.BANK_BRANCH],
    basePrice: 0, // Fee based on amount
    baseDuration: 10,
    customerSatisfactionBase: 75,
  },
  {
    serviceId: 'bank_loan_small',
    name: 'Small Loan',
    description: 'Borrow up to $500',
    category: BusinessServiceCategory.LOANS,
    businessTypes: [PlayerBusinessType.BANK_BRANCH],
    basePrice: 25, // Processing fee
    baseDuration: 15,
    customerSatisfactionBase: 65,
  },
  {
    serviceId: 'bank_loan_large',
    name: 'Large Loan',
    description: 'Borrow up to $5000',
    category: BusinessServiceCategory.LOANS,
    businessTypes: [PlayerBusinessType.BANK_BRANCH],
    basePrice: 100,
    baseDuration: 30,
    requiredTier: 3,
    customerSatisfactionBase: 70,
  },
  {
    serviceId: 'bank_exchange',
    name: 'Currency Exchange',
    description: 'Exchange gold/silver resources for dollars',
    category: BusinessServiceCategory.EXCHANGE,
    businessTypes: [PlayerBusinessType.BANK_BRANCH],
    basePrice: 10,
    baseDuration: 10,
    requiredTier: 2,
    customerSatisfactionBase: 75,
  },

  // ==========================================================================
  // GUNSMITH Services
  // ==========================================================================
  {
    serviceId: 'gunsmith_repair',
    name: 'Gun Repair',
    description: 'Repair damaged firearms',
    category: BusinessServiceCategory.REPAIR,
    businessTypes: [PlayerBusinessType.GUNSMITH],
    basePrice: 75,
    baseDuration: 45,
    requiredWorkerSpecialization: WorkerSpecialization.GUNSMITH,
    customerSatisfactionBase: 80,
  },
  {
    serviceId: 'gunsmith_upgrade',
    name: 'Gun Modification',
    description: 'Upgrade weapon accuracy and damage',
    category: BusinessServiceCategory.UPGRADE,
    businessTypes: [PlayerBusinessType.GUNSMITH],
    basePrice: 250,
    baseDuration: 120,
    requiredWorkerSpecialization: WorkerSpecialization.GUNSMITH,
    requiredTier: 2,
    customerSatisfactionBase: 85,
  },
  {
    serviceId: 'gunsmith_custom',
    name: 'Custom Firearm',
    description: 'Commission a custom-built weapon',
    category: BusinessServiceCategory.CUSTOM_CRAFTING,
    businessTypes: [PlayerBusinessType.GUNSMITH],
    basePrice: 1000,
    baseDuration: 720,
    requiredWorkerSpecialization: WorkerSpecialization.GUNSMITH,
    requiredTier: 4,
    customerSatisfactionBase: 95,
  },
];

// =============================================================================
// Product Definitions (for Production Businesses)
// =============================================================================

export const PRODUCT_DEFINITIONS: IBusinessProductDefinition[] = [
  // BREWERY Products
  {
    productId: 'brewery_beer',
    name: 'Beer Barrel',
    description: 'Standard frontier beer',
    businessTypes: [PlayerBusinessType.BREWERY],
    basePrice: 50,
    productionTimeMinutes: 120,
    requiredMaterials: [{ itemId: 'grain', quantity: 10 }, { itemId: 'water', quantity: 5 }],
    outputQuantity: 10,
  },
  {
    productId: 'brewery_whiskey',
    name: 'Whiskey Bottle',
    description: 'Aged corn whiskey',
    businessTypes: [PlayerBusinessType.BREWERY],
    basePrice: 100,
    productionTimeMinutes: 480,
    requiredMaterials: [{ itemId: 'corn', quantity: 20 }, { itemId: 'oak_barrel', quantity: 1 }],
    requiredTier: 2,
    outputQuantity: 5,
  },

  // TANNERY Products
  {
    productId: 'tannery_leather',
    name: 'Leather',
    description: 'Processed leather for crafting',
    businessTypes: [PlayerBusinessType.TANNERY],
    basePrice: 30,
    productionTimeMinutes: 60,
    requiredMaterials: [{ itemId: 'hide', quantity: 2 }],
    requiredWorkerSpecialization: WorkerSpecialization.LEATHERWORKER,
    outputQuantity: 2,
  },
  {
    productId: 'tannery_saddle',
    name: 'Saddle',
    description: 'Quality horse saddle',
    businessTypes: [PlayerBusinessType.TANNERY],
    basePrice: 150,
    productionTimeMinutes: 240,
    requiredMaterials: [{ itemId: 'leather', quantity: 5 }, { itemId: 'metal_fittings', quantity: 2 }],
    requiredWorkerSpecialization: WorkerSpecialization.LEATHERWORKER,
    requiredTier: 2,
    outputQuantity: 1,
  },

  // GUNSMITH Products
  {
    productId: 'gunsmith_ammo_pistol',
    name: 'Pistol Ammunition',
    description: 'Box of pistol rounds',
    businessTypes: [PlayerBusinessType.GUNSMITH],
    basePrice: 25,
    productionTimeMinutes: 30,
    requiredMaterials: [{ itemId: 'lead', quantity: 5 }, { itemId: 'gunpowder', quantity: 2 }],
    requiredWorkerSpecialization: WorkerSpecialization.GUNSMITH,
    outputQuantity: 20,
  },
  {
    productId: 'gunsmith_ammo_rifle',
    name: 'Rifle Ammunition',
    description: 'Box of rifle rounds',
    businessTypes: [PlayerBusinessType.GUNSMITH],
    basePrice: 40,
    productionTimeMinutes: 45,
    requiredMaterials: [{ itemId: 'lead', quantity: 8 }, { itemId: 'gunpowder', quantity: 4 }],
    requiredWorkerSpecialization: WorkerSpecialization.GUNSMITH,
    outputQuantity: 15,
  },

  // RANCH Products
  {
    productId: 'ranch_beef',
    name: 'Beef',
    description: 'Fresh beef from cattle',
    businessTypes: [PlayerBusinessType.RANCH],
    basePrice: 20,
    productionTimeMinutes: 1440, // 1 day
    requiredMaterials: [{ itemId: 'cattle_feed', quantity: 5 }],
    requiredWorkerSpecialization: WorkerSpecialization.RANCHER,
    outputQuantity: 5,
  },
  {
    productId: 'ranch_wool',
    name: 'Wool',
    description: 'Raw sheep wool',
    businessTypes: [PlayerBusinessType.RANCH],
    basePrice: 15,
    productionTimeMinutes: 720,
    requiredMaterials: [],
    requiredWorkerSpecialization: WorkerSpecialization.SHEPHERD,
    outputQuantity: 3,
  },

  // MINING OPERATION Products
  {
    productId: 'mining_iron_ore',
    name: 'Iron Ore',
    description: 'Raw iron ore for smelting',
    businessTypes: [PlayerBusinessType.MINING_OPERATION],
    basePrice: 10,
    productionTimeMinutes: 60,
    requiredMaterials: [{ itemId: 'pickaxe_use', quantity: 1 }],
    requiredWorkerSpecialization: WorkerSpecialization.MINER,
    outputQuantity: 5,
  },
  {
    productId: 'mining_gold_ore',
    name: 'Gold Ore',
    description: 'Raw gold ore - valuable!',
    businessTypes: [PlayerBusinessType.MINING_OPERATION],
    basePrice: 100,
    productionTimeMinutes: 240,
    requiredMaterials: [{ itemId: 'pickaxe_use', quantity: 3 }],
    requiredWorkerSpecialization: WorkerSpecialization.PROSPECTOR,
    requiredTier: 3,
    outputQuantity: 1,
  },
  {
    productId: 'mining_iron_ingot',
    name: 'Iron Ingot',
    description: 'Smelted iron bar',
    businessTypes: [PlayerBusinessType.MINING_OPERATION],
    basePrice: 30,
    productionTimeMinutes: 120,
    requiredMaterials: [{ itemId: 'iron_ore', quantity: 5 }, { itemId: 'coal', quantity: 2 }],
    requiredWorkerSpecialization: WorkerSpecialization.SMELTER,
    requiredTier: 2,
    outputQuantity: 2,
  },
];

// =============================================================================
// NPC Customer Behavior Constants
// =============================================================================

export const NPC_CUSTOMER_CONSTANTS = {
  // Service selection weights
  SERVICE_SELECTION: {
    PRICE_WEIGHT: 0.3,                  // 30% based on price
    REPUTATION_WEIGHT: 0.4,             // 40% based on reputation
    AVAILABILITY_WEIGHT: 0.3,           // 30% based on service availability
  },

  // Satisfaction modifiers
  SATISFACTION_MODIFIERS: {
    WORKER_SKILL_BONUS: 0.3,            // Up to +30% from skilled workers
    PRICE_FAIR_BONUS: 0.1,              // +10% if price is fair
    PRICE_EXPENSIVE_PENALTY: -0.2,      // -20% if overpriced
    WAIT_TIME_PENALTY: -0.05,           // -5% per service in queue
    PREVIOUS_SATISFACTION_WEIGHT: 0.2,  // 20% influenced by past visits
  },

  // Tip behavior
  TIPPING: {
    BASE_TIP_CHANCE: 0.3,               // 30% base tip chance
    TIP_SATISFACTION_THRESHOLD: 80,     // Only tip if 80%+ satisfied
    TIP_MIN_PERCENTAGE: 0.05,           // 5% minimum tip
    TIP_MAX_PERCENTAGE: 0.25,           // 25% maximum tip
  },

  // Return customer behavior
  RETURN_CUSTOMER: {
    HIGH_SATISFACTION_RETURN_BONUS: 0.3, // +30% return chance if satisfied
    LOW_SATISFACTION_RETURN_PENALTY: -0.5, // -50% return chance if unsatisfied
    REPUTATION_MEMORY_DAYS: 30,         // How long NPCs remember reputation
  },
} as const;

// =============================================================================
// Establishment Requirements
// =============================================================================

export const ESTABLISHMENT_REQUIREMENTS: Record<PlayerBusinessType, {
  minPropertyTier: number;
  minCharacterLevel: number;
  minReputation?: number;
  requiredSkill?: { skillId: string; level: number };
  goldCost: number;
  itemRequirements?: Array<{ itemId: string; quantity: number }>;
}> = {
  [PlayerBusinessType.SALOON]: {
    minPropertyTier: 1,
    minCharacterLevel: 10,
    goldCost: 1500,
  },
  [PlayerBusinessType.GENERAL_STORE]: {
    minPropertyTier: 1,
    minCharacterLevel: 5,
    goldCost: 1000,
  },
  [PlayerBusinessType.BLACKSMITH]: {
    minPropertyTier: 1,
    minCharacterLevel: 15,
    requiredSkill: { skillId: 'crafting', level: 20 },
    goldCost: 2000,
  },
  [PlayerBusinessType.STABLE]: {
    minPropertyTier: 1,
    minCharacterLevel: 10,
    goldCost: 1500,
  },
  [PlayerBusinessType.DOCTOR_OFFICE]: {
    minPropertyTier: 1,
    minCharacterLevel: 20,
    requiredSkill: { skillId: 'medicine', level: 25 },
    goldCost: 3000,
  },
  [PlayerBusinessType.BANK_BRANCH]: {
    minPropertyTier: 2,
    minCharacterLevel: 25,
    minReputation: 50,
    goldCost: 10000,
  },
  [PlayerBusinessType.BREWERY]: {
    minPropertyTier: 1,
    minCharacterLevel: 15,
    goldCost: 2000,
  },
  [PlayerBusinessType.TANNERY]: {
    minPropertyTier: 1,
    minCharacterLevel: 15,
    requiredSkill: { skillId: 'crafting', level: 15 },
    goldCost: 1500,
  },
  [PlayerBusinessType.GUNSMITH]: {
    minPropertyTier: 2,
    minCharacterLevel: 20,
    requiredSkill: { skillId: 'crafting', level: 30 },
    goldCost: 5000,
  },
  [PlayerBusinessType.RANCH]: {
    minPropertyTier: 1,
    minCharacterLevel: 10,
    goldCost: 1200,
  },
  [PlayerBusinessType.MINING_OPERATION]: {
    minPropertyTier: 1,
    minCharacterLevel: 15,
    goldCost: 2500,
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get all services available for a business type
 */
export function getServicesForBusinessType(businessType: PlayerBusinessType): IBusinessServiceDefinition[] {
  return SERVICE_DEFINITIONS.filter(s => s.businessTypes.includes(businessType));
}

/**
 * Get all products available for a business type
 */
export function getProductsForBusinessType(businessType: PlayerBusinessType): IBusinessProductDefinition[] {
  return PRODUCT_DEFINITIONS.filter(p => p.businessTypes.includes(businessType));
}

/**
 * Calculate establishment cost for a business
 */
export function calculateEstablishmentCost(
  businessType: PlayerBusinessType,
  propertyValue: number,
  establishmentCostMultiplier: number
): number {
  const requirements = ESTABLISHMENT_REQUIREMENTS[businessType];
  return requirements.goldCost + Math.floor(propertyValue * establishmentCostMultiplier);
}
