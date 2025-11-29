/**
 * Product Definitions
 *
 * Complete catalog of all producible goods across all property types
 */

import {
  ProductDefinition,
  PropertyType,
  ProductCategory,
  ProductQuality,
  WorkerSpecialization,
} from '@desperados/shared';

/**
 * Master product catalog
 */
export const PRODUCT_DEFINITIONS: Record<string, ProductDefinition> = {
  // ===== RANCH PRODUCTS =====

  // Cattle Products
  'ranch_beef': {
    productId: 'ranch_beef',
    name: 'Beef',
    description: 'Quality beef from well-raised cattle',
    category: ProductCategory.ANIMAL_PRODUCTS,
    propertyTypes: [PropertyType.RANCH],
    requiredLevel: 1,
    materials: [
      { itemId: 'cattle_feed', quantity: 5, consumed: true },
    ],
    energyCost: 0,
    goldCost: 10,
    baseProductionTime: 120, // 2 hours
    minWorkers: 1,
    maxWorkers: 3,
    workerEfficiencyBonus: 0.15,
    outputs: [
      {
        itemId: 'beef',
        baseQuantity: 10,
        minQuantity: 8,
        maxQuantity: 15,
        qualityAffectsQuantity: true,
        sellPrice: 5,
      },
    ],
    qualityBonusChance: 0.2,
    canRush: true,
    rushCostMultiplier: 2.0,
    isUnique: false,
    isRepeatable: true,
    icon: '🥩',
    tags: ['ranch', 'livestock', 'food'],
  },

  'ranch_leather': {
    productId: 'ranch_leather',
    name: 'Leather',
    description: 'Tanned leather from cattle hides',
    category: ProductCategory.ANIMAL_PRODUCTS,
    propertyTypes: [PropertyType.RANCH],
    requiredLevel: 3,
    materials: [
      { itemId: 'cattle_hide', quantity: 3, consumed: true },
      { itemId: 'tanning_solution', quantity: 1, consumed: true },
    ],
    energyCost: 0,
    goldCost: 15,
    baseProductionTime: 180, // 3 hours
    minWorkers: 1,
    maxWorkers: 2,
    workerEfficiencyBonus: 0.2,
    outputs: [
      {
        itemId: 'leather',
        baseQuantity: 6,
        minQuantity: 4,
        maxQuantity: 10,
        qualityAffectsQuantity: true,
        sellPrice: 8,
      },
    ],
    qualityBonusChance: 0.25,
    canRush: true,
    rushCostMultiplier: 2.5,
    isUnique: false,
    isRepeatable: true,
    icon: '🧳',
    tags: ['ranch', 'crafting', 'material'],
  },

  'ranch_milk': {
    productId: 'ranch_milk',
    name: 'Milk',
    description: 'Fresh milk from dairy cattle',
    category: ProductCategory.ANIMAL_PRODUCTS,
    propertyTypes: [PropertyType.RANCH],
    requiredLevel: 1,
    materials: [
      { itemId: 'cattle_feed', quantity: 2, consumed: true },
    ],
    energyCost: 0,
    goldCost: 5,
    baseProductionTime: 60, // 1 hour
    minWorkers: 1,
    maxWorkers: 2,
    workerEfficiencyBonus: 0.1,
    outputs: [
      {
        itemId: 'milk',
        baseQuantity: 8,
        minQuantity: 6,
        maxQuantity: 12,
        qualityAffectsQuantity: true,
        sellPrice: 3,
      },
    ],
    qualityBonusChance: 0.15,
    canRush: false,
    rushCostMultiplier: 0,
    isUnique: false,
    isRepeatable: true,
    icon: '🥛',
    tags: ['ranch', 'food', 'consumable'],
  },

  // Horse Products
  'ranch_trained_horse': {
    productId: 'ranch_trained_horse',
    name: 'Trained Horse',
    description: 'A well-trained horse ready for work or riding',
    category: ProductCategory.LIVESTOCK,
    propertyTypes: [PropertyType.RANCH, PropertyType.STABLE],
    requiredLevel: 5,
    requiredWorkerType: WorkerSpecialization.HORSE_TRAINER,
    materials: [
      { itemId: 'horse_feed', quantity: 20, consumed: true },
      { itemId: 'training_equipment', quantity: 1, consumed: false },
    ],
    energyCost: 0,
    goldCost: 50,
    baseProductionTime: 480, // 8 hours
    minWorkers: 1,
    maxWorkers: 2,
    workerEfficiencyBonus: 0.25,
    outputs: [
      {
        itemId: 'trained_horse',
        baseQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        qualityAffectsQuantity: false,
        sellPrice: 200,
      },
    ],
    qualityBonusChance: 0.3,
    canRush: true,
    rushCostMultiplier: 3.0,
    isUnique: false,
    isRepeatable: true,
    icon: '🐴',
    tags: ['ranch', 'stable', 'mount', 'training'],
  },

  'ranch_bred_horse': {
    productId: 'ranch_bred_horse',
    name: 'Bred Horse',
    description: 'Breed quality horses for sale or training',
    category: ProductCategory.LIVESTOCK,
    propertyTypes: [PropertyType.RANCH, PropertyType.STABLE],
    requiredLevel: 8,
    requiredUpgrades: ['breeding_pens'],
    requiredWorkerType: WorkerSpecialization.BREEDER,
    materials: [
      { itemId: 'horse_feed', quantity: 50, consumed: true },
      { itemId: 'breeding_stock', quantity: 2, consumed: false },
    ],
    energyCost: 0,
    goldCost: 100,
    baseProductionTime: 1440, // 24 hours
    minWorkers: 2,
    maxWorkers: 3,
    workerEfficiencyBonus: 0.2,
    outputs: [
      {
        itemId: 'foal',
        baseQuantity: 1,
        minQuantity: 1,
        maxQuantity: 2,
        qualityAffectsQuantity: true,
        sellPrice: 150,
      },
    ],
    qualityBonusChance: 0.2,
    canRush: false,
    rushCostMultiplier: 0,
    isUnique: false,
    isRepeatable: true,
    icon: '🐎',
    tags: ['ranch', 'stable', 'breeding'],
  },

  // Crop Products
  'ranch_corn': {
    productId: 'ranch_corn',
    name: 'Corn',
    description: 'Hearty corn for food and feed',
    category: ProductCategory.CROPS,
    propertyTypes: [PropertyType.RANCH],
    requiredLevel: 1,
    materials: [
      { itemId: 'corn_seeds', quantity: 5, consumed: true },
      { itemId: 'fertilizer', quantity: 2, consumed: true },
    ],
    energyCost: 0,
    goldCost: 8,
    baseProductionTime: 240, // 4 hours
    minWorkers: 1,
    maxWorkers: 4,
    workerEfficiencyBonus: 0.15,
    outputs: [
      {
        itemId: 'corn',
        baseQuantity: 25,
        minQuantity: 20,
        maxQuantity: 35,
        qualityAffectsQuantity: true,
        sellPrice: 2,
      },
    ],
    qualityBonusChance: 0.2,
    canRush: false,
    rushCostMultiplier: 0,
    isUnique: false,
    isRepeatable: true,
    icon: '🌽',
    tags: ['ranch', 'crops', 'farming'],
  },

  'ranch_wheat': {
    productId: 'ranch_wheat',
    name: 'Wheat',
    description: 'Golden wheat for flour and bread',
    category: ProductCategory.CROPS,
    propertyTypes: [PropertyType.RANCH],
    requiredLevel: 2,
    materials: [
      { itemId: 'wheat_seeds', quantity: 5, consumed: true },
      { itemId: 'fertilizer', quantity: 2, consumed: true },
    ],
    energyCost: 0,
    goldCost: 10,
    baseProductionTime: 300, // 5 hours
    minWorkers: 1,
    maxWorkers: 4,
    workerEfficiencyBonus: 0.15,
    outputs: [
      {
        itemId: 'wheat',
        baseQuantity: 30,
        minQuantity: 25,
        maxQuantity: 40,
        qualityAffectsQuantity: true,
        sellPrice: 2,
      },
    ],
    qualityBonusChance: 0.2,
    canRush: false,
    rushCostMultiplier: 0,
    isUnique: false,
    isRepeatable: true,
    icon: '🌾',
    tags: ['ranch', 'crops', 'farming'],
  },

  'ranch_cotton': {
    productId: 'ranch_cotton',
    name: 'Cotton',
    description: 'Soft cotton for textiles',
    category: ProductCategory.CROPS,
    propertyTypes: [PropertyType.RANCH],
    requiredLevel: 4,
    materials: [
      { itemId: 'cotton_seeds', quantity: 8, consumed: true },
      { itemId: 'fertilizer', quantity: 3, consumed: true },
    ],
    energyCost: 0,
    goldCost: 15,
    baseProductionTime: 360, // 6 hours
    minWorkers: 2,
    maxWorkers: 5,
    workerEfficiencyBonus: 0.15,
    outputs: [
      {
        itemId: 'cotton',
        baseQuantity: 20,
        minQuantity: 15,
        maxQuantity: 30,
        qualityAffectsQuantity: true,
        sellPrice: 4,
      },
    ],
    qualityBonusChance: 0.25,
    canRush: false,
    rushCostMultiplier: 0,
    isUnique: false,
    isRepeatable: true,
    icon: '☁️',
    tags: ['ranch', 'crops', 'textile'],
  },

  'ranch_tobacco': {
    productId: 'ranch_tobacco',
    name: 'Tobacco',
    description: 'Premium tobacco leaves',
    category: ProductCategory.CROPS,
    propertyTypes: [PropertyType.RANCH],
    requiredLevel: 6,
    materials: [
      { itemId: 'tobacco_seeds', quantity: 10, consumed: true },
      { itemId: 'fertilizer', quantity: 4, consumed: true },
    ],
    energyCost: 0,
    goldCost: 25,
    baseProductionTime: 420, // 7 hours
    minWorkers: 2,
    maxWorkers: 4,
    workerEfficiencyBonus: 0.2,
    outputs: [
      {
        itemId: 'tobacco_leaves',
        baseQuantity: 15,
        minQuantity: 12,
        maxQuantity: 22,
        qualityAffectsQuantity: true,
        sellPrice: 8,
      },
    ],
    qualityBonusChance: 0.3,
    canRush: false,
    rushCostMultiplier: 0,
    isUnique: false,
    isRepeatable: true,
    icon: '🍃',
    tags: ['ranch', 'crops', 'luxury'],
  },

  // Sheep Products
  'ranch_wool': {
    productId: 'ranch_wool',
    name: 'Wool',
    description: 'Fine wool from sheep',
    category: ProductCategory.ANIMAL_PRODUCTS,
    propertyTypes: [PropertyType.RANCH],
    requiredLevel: 3,
    materials: [
      { itemId: 'sheep_feed', quantity: 3, consumed: true },
    ],
    energyCost: 0,
    goldCost: 8,
    baseProductionTime: 90, // 1.5 hours
    minWorkers: 1,
    maxWorkers: 3,
    workerEfficiencyBonus: 0.2,
    outputs: [
      {
        itemId: 'wool',
        baseQuantity: 12,
        minQuantity: 10,
        maxQuantity: 18,
        qualityAffectsQuantity: true,
        sellPrice: 4,
      },
    ],
    qualityBonusChance: 0.2,
    canRush: false,
    rushCostMultiplier: 0,
    isUnique: false,
    isRepeatable: true,
    icon: '🧶',
    tags: ['ranch', 'animal_products', 'textile'],
  },

  'ranch_mutton': {
    productId: 'ranch_mutton',
    name: 'Mutton',
    description: 'Quality mutton from sheep',
    category: ProductCategory.ANIMAL_PRODUCTS,
    propertyTypes: [PropertyType.RANCH],
    requiredLevel: 2,
    materials: [
      { itemId: 'sheep_feed', quantity: 4, consumed: true },
    ],
    energyCost: 0,
    goldCost: 12,
    baseProductionTime: 150, // 2.5 hours
    minWorkers: 1,
    maxWorkers: 2,
    workerEfficiencyBonus: 0.15,
    outputs: [
      {
        itemId: 'mutton',
        baseQuantity: 8,
        minQuantity: 6,
        maxQuantity: 12,
        qualityAffectsQuantity: true,
        sellPrice: 6,
      },
    ],
    qualityBonusChance: 0.2,
    canRush: true,
    rushCostMultiplier: 2.0,
    isUnique: false,
    isRepeatable: true,
    icon: '🍖',
    tags: ['ranch', 'food'],
  },

  // ===== MINE PRODUCTS =====

  'mine_iron_ore': {
    productId: 'mine_iron_ore',
    name: 'Iron Ore',
    description: 'Raw iron ore for smelting',
    category: ProductCategory.ORE,
    propertyTypes: [PropertyType.MINE],
    requiredLevel: 1,
    materials: [
      { itemId: 'mining_tools', quantity: 1, consumed: false },
    ],
    energyCost: 0,
    goldCost: 5,
    baseProductionTime: 60, // 1 hour
    minWorkers: 1,
    maxWorkers: 5,
    workerEfficiencyBonus: 0.2,
    outputs: [
      {
        itemId: 'iron_ore',
        baseQuantity: 15,
        minQuantity: 10,
        maxQuantity: 25,
        qualityAffectsQuantity: true,
        sellPrice: 3,
      },
    ],
    qualityBonusChance: 0.15,
    canRush: false,
    rushCostMultiplier: 0,
    isUnique: false,
    isRepeatable: true,
    icon: '⛏️',
    tags: ['mine', 'ore', 'mining'],
  },

  'mine_copper_ore': {
    productId: 'mine_copper_ore',
    name: 'Copper Ore',
    description: 'Copper ore for crafting',
    category: ProductCategory.ORE,
    propertyTypes: [PropertyType.MINE],
    requiredLevel: 2,
    materials: [
      { itemId: 'mining_tools', quantity: 1, consumed: false },
    ],
    energyCost: 0,
    goldCost: 8,
    baseProductionTime: 90, // 1.5 hours
    minWorkers: 1,
    maxWorkers: 4,
    workerEfficiencyBonus: 0.2,
    outputs: [
      {
        itemId: 'copper_ore',
        baseQuantity: 12,
        minQuantity: 8,
        maxQuantity: 20,
        qualityAffectsQuantity: true,
        sellPrice: 5,
      },
    ],
    qualityBonusChance: 0.2,
    canRush: false,
    rushCostMultiplier: 0,
    isUnique: false,
    isRepeatable: true,
    icon: '🟫',
    tags: ['mine', 'ore', 'mining'],
  },

  'mine_silver_ore': {
    productId: 'mine_silver_ore',
    name: 'Silver Ore',
    description: 'Valuable silver ore',
    category: ProductCategory.ORE,
    propertyTypes: [PropertyType.MINE],
    requiredLevel: 5,
    materials: [
      { itemId: 'mining_tools', quantity: 1, consumed: false },
      { itemId: 'explosives', quantity: 1, consumed: true },
    ],
    energyCost: 0,
    goldCost: 20,
    baseProductionTime: 180, // 3 hours
    minWorkers: 2,
    maxWorkers: 4,
    workerEfficiencyBonus: 0.25,
    outputs: [
      {
        itemId: 'silver_ore',
        baseQuantity: 8,
        minQuantity: 5,
        maxQuantity: 15,
        qualityAffectsQuantity: true,
        sellPrice: 15,
      },
    ],
    qualityBonusChance: 0.25,
    canRush: true,
    rushCostMultiplier: 2.5,
    isUnique: false,
    isRepeatable: true,
    icon: '⚪',
    tags: ['mine', 'ore', 'precious'],
  },

  'mine_gold_ore': {
    productId: 'mine_gold_ore',
    name: 'Gold Ore',
    description: 'Precious gold ore',
    category: ProductCategory.ORE,
    propertyTypes: [PropertyType.MINE],
    requiredLevel: 8,
    materials: [
      { itemId: 'mining_tools', quantity: 1, consumed: false },
      { itemId: 'explosives', quantity: 2, consumed: true },
    ],
    energyCost: 0,
    goldCost: 50,
    baseProductionTime: 300, // 5 hours
    minWorkers: 3,
    maxWorkers: 5,
    workerEfficiencyBonus: 0.3,
    outputs: [
      {
        itemId: 'gold_ore',
        baseQuantity: 5,
        minQuantity: 3,
        maxQuantity: 10,
        qualityAffectsQuantity: true,
        sellPrice: 40,
      },
    ],
    qualityBonusChance: 0.3,
    canRush: true,
    rushCostMultiplier: 3.0,
    isUnique: false,
    isRepeatable: true,
    icon: '🟡',
    tags: ['mine', 'ore', 'precious', 'luxury'],
  },

  'mine_coal': {
    productId: 'mine_coal',
    name: 'Coal',
    description: 'Coal for fuel and smelting',
    category: ProductCategory.COAL,
    propertyTypes: [PropertyType.MINE],
    requiredLevel: 1,
    materials: [
      { itemId: 'mining_tools', quantity: 1, consumed: false },
    ],
    energyCost: 0,
    goldCost: 3,
    baseProductionTime: 45, // 45 minutes
    minWorkers: 1,
    maxWorkers: 6,
    workerEfficiencyBonus: 0.15,
    outputs: [
      {
        itemId: 'coal',
        baseQuantity: 20,
        minQuantity: 15,
        maxQuantity: 30,
        qualityAffectsQuantity: true,
        sellPrice: 2,
      },
    ],
    qualityBonusChance: 0.1,
    canRush: false,
    rushCostMultiplier: 0,
    isUnique: false,
    isRepeatable: true,
    icon: '⬛',
    tags: ['mine', 'coal', 'fuel'],
  },

  'mine_gems': {
    productId: 'mine_gems',
    name: 'Gemstones',
    description: 'Rare and valuable gemstones',
    category: ProductCategory.GEMS,
    propertyTypes: [PropertyType.MINE],
    requiredLevel: 10,
    requiredUpgrades: ['deep_shaft'],
    requiredWorkerType: WorkerSpecialization.PROSPECTOR,
    materials: [
      { itemId: 'mining_tools', quantity: 1, consumed: false },
      { itemId: 'explosives', quantity: 2, consumed: true },
    ],
    energyCost: 0,
    goldCost: 100,
    baseProductionTime: 480, // 8 hours
    minWorkers: 2,
    maxWorkers: 3,
    workerEfficiencyBonus: 0.2,
    outputs: [
      {
        itemId: 'rough_gems',
        baseQuantity: 3,
        minQuantity: 1,
        maxQuantity: 8,
        qualityAffectsQuantity: true,
        sellPrice: 75,
      },
    ],
    qualityBonusChance: 0.15,
    canRush: false,
    rushCostMultiplier: 0,
    isUnique: false,
    isRepeatable: true,
    icon: '💎',
    tags: ['mine', 'gems', 'luxury', 'rare'],
  },

  // ===== SALOON PRODUCTS =====

  'saloon_beer': {
    productId: 'saloon_beer',
    name: 'Beer',
    description: 'Fresh brewed beer',
    category: ProductCategory.DRINKS,
    propertyTypes: [PropertyType.SALOON],
    requiredLevel: 1,
    materials: [
      { itemId: 'grain', quantity: 5, consumed: true },
      { itemId: 'hops', quantity: 2, consumed: true },
      { itemId: 'water', quantity: 10, consumed: true },
    ],
    energyCost: 0,
    goldCost: 8,
    baseProductionTime: 120, // 2 hours
    minWorkers: 1,
    maxWorkers: 2,
    workerEfficiencyBonus: 0.15,
    outputs: [
      {
        itemId: 'beer',
        baseQuantity: 20,
        minQuantity: 15,
        maxQuantity: 30,
        qualityAffectsQuantity: true,
        sellPrice: 3,
      },
    ],
    qualityBonusChance: 0.2,
    canRush: false,
    rushCostMultiplier: 0,
    isUnique: false,
    isRepeatable: true,
    icon: '🍺',
    tags: ['saloon', 'drinks', 'alcohol'],
  },

  'saloon_whiskey': {
    productId: 'saloon_whiskey',
    name: 'Whiskey',
    description: 'Premium aged whiskey',
    category: ProductCategory.DRINKS,
    propertyTypes: [PropertyType.SALOON],
    requiredLevel: 5,
    materials: [
      { itemId: 'grain', quantity: 10, consumed: true },
      { itemId: 'oak_barrel', quantity: 1, consumed: false },
    ],
    energyCost: 0,
    goldCost: 25,
    baseProductionTime: 360, // 6 hours
    minWorkers: 1,
    maxWorkers: 2,
    workerEfficiencyBonus: 0.2,
    outputs: [
      {
        itemId: 'whiskey',
        baseQuantity: 12,
        minQuantity: 10,
        maxQuantity: 18,
        qualityAffectsQuantity: true,
        sellPrice: 10,
      },
    ],
    qualityBonusChance: 0.3,
    canRush: false,
    rushCostMultiplier: 0,
    isUnique: false,
    isRepeatable: true,
    icon: '🥃',
    tags: ['saloon', 'drinks', 'alcohol', 'premium'],
  },

  'saloon_cocktails': {
    productId: 'saloon_cocktails',
    name: 'Mixed Cocktails',
    description: 'Fancy mixed drinks',
    category: ProductCategory.DRINKS,
    propertyTypes: [PropertyType.SALOON],
    requiredLevel: 7,
    requiredWorkerType: WorkerSpecialization.BARTENDER,
    materials: [
      { itemId: 'spirits', quantity: 5, consumed: true },
      { itemId: 'fruit', quantity: 3, consumed: true },
      { itemId: 'sugar', quantity: 2, consumed: true },
    ],
    energyCost: 0,
    goldCost: 20,
    baseProductionTime: 30, // 30 minutes
    minWorkers: 1,
    maxWorkers: 2,
    workerEfficiencyBonus: 0.25,
    outputs: [
      {
        itemId: 'cocktail',
        baseQuantity: 15,
        minQuantity: 12,
        maxQuantity: 20,
        qualityAffectsQuantity: true,
        sellPrice: 8,
      },
    ],
    qualityBonusChance: 0.25,
    canRush: true,
    rushCostMultiplier: 1.5,
    isUnique: false,
    isRepeatable: true,
    icon: '🍹',
    tags: ['saloon', 'drinks', 'luxury'],
  },

  'saloon_meals': {
    productId: 'saloon_meals',
    name: 'Hot Meals',
    description: 'Hearty meals for patrons',
    category: ProductCategory.FOOD,
    propertyTypes: [PropertyType.SALOON],
    requiredLevel: 2,
    materials: [
      { itemId: 'meat', quantity: 5, consumed: true },
      { itemId: 'vegetables', quantity: 5, consumed: true },
      { itemId: 'spices', quantity: 1, consumed: true },
    ],
    energyCost: 0,
    goldCost: 15,
    baseProductionTime: 90, // 1.5 hours
    minWorkers: 1,
    maxWorkers: 3,
    workerEfficiencyBonus: 0.2,
    outputs: [
      {
        itemId: 'hot_meal',
        baseQuantity: 20,
        minQuantity: 15,
        maxQuantity: 28,
        qualityAffectsQuantity: true,
        sellPrice: 5,
      },
    ],
    qualityBonusChance: 0.2,
    canRush: true,
    rushCostMultiplier: 2.0,
    isUnique: false,
    isRepeatable: true,
    icon: '🍲',
    tags: ['saloon', 'food'],
  },

  'saloon_gambling': {
    productId: 'saloon_gambling',
    name: 'Gambling Tables',
    description: 'Run gambling operations for profit',
    category: ProductCategory.GAMBLING_REVENUE,
    propertyTypes: [PropertyType.SALOON],
    requiredLevel: 4,
    requiredUpgrades: ['gambling_tables'],
    materials: [
      { itemId: 'playing_cards', quantity: 1, consumed: false },
      { itemId: 'poker_chips', quantity: 1, consumed: false },
    ],
    energyCost: 0,
    goldCost: 50,
    baseProductionTime: 240, // 4 hours
    minWorkers: 2,
    maxWorkers: 4,
    workerEfficiencyBonus: 0.15,
    outputs: [
      {
        itemId: 'gold_direct',
        baseQuantity: 80,
        minQuantity: 50,
        maxQuantity: 150,
        qualityAffectsQuantity: true,
        sellPrice: 1,
      },
    ],
    qualityBonusChance: 0.25,
    canRush: false,
    rushCostMultiplier: 0,
    isUnique: false,
    isRepeatable: true,
    icon: '🎰',
    tags: ['saloon', 'gambling', 'income'],
  },

  'saloon_entertainment': {
    productId: 'saloon_entertainment',
    name: 'Entertainment Shows',
    description: 'Host shows and performances',
    category: ProductCategory.ENTERTAINMENT,
    propertyTypes: [PropertyType.SALOON],
    requiredLevel: 6,
    requiredUpgrades: ['stage'],
    requiredWorkerType: WorkerSpecialization.ENTERTAINER,
    materials: [],
    energyCost: 0,
    goldCost: 40,
    baseProductionTime: 180, // 3 hours
    minWorkers: 2,
    maxWorkers: 5,
    workerEfficiencyBonus: 0.2,
    outputs: [
      {
        itemId: 'gold_direct',
        baseQuantity: 100,
        minQuantity: 60,
        maxQuantity: 180,
        qualityAffectsQuantity: true,
        sellPrice: 1,
      },
    ],
    qualityBonusChance: 0.3,
    canRush: false,
    rushCostMultiplier: 0,
    isUnique: false,
    isRepeatable: true,
    icon: '🎭',
    tags: ['saloon', 'entertainment', 'income'],
  },

  'saloon_rooms': {
    productId: 'saloon_rooms',
    name: 'Room Rentals',
    description: 'Rent rooms to travelers',
    category: ProductCategory.LODGING,
    propertyTypes: [PropertyType.SALOON],
    requiredLevel: 3,
    requiredUpgrades: ['rooms'],
    materials: [
      { itemId: 'linens', quantity: 2, consumed: true },
    ],
    energyCost: 0,
    goldCost: 10,
    baseProductionTime: 480, // 8 hours (overnight)
    minWorkers: 1,
    maxWorkers: 2,
    workerEfficiencyBonus: 0.1,
    outputs: [
      {
        itemId: 'gold_direct',
        baseQuantity: 60,
        minQuantity: 40,
        maxQuantity: 90,
        qualityAffectsQuantity: true,
        sellPrice: 1,
      },
    ],
    qualityBonusChance: 0.2,
    canRush: false,
    rushCostMultiplier: 0,
    isUnique: false,
    isRepeatable: true,
    icon: '🛏️',
    tags: ['saloon', 'lodging', 'income'],
  },

  // ===== STABLE PRODUCTS =====

  'stable_training_basic': {
    productId: 'stable_training_basic',
    name: 'Basic Training',
    description: 'Basic horse training service',
    category: ProductCategory.TRAINING,
    propertyTypes: [PropertyType.STABLE],
    requiredLevel: 1,
    materials: [
      { itemId: 'training_equipment', quantity: 1, consumed: false },
      { itemId: 'horse_feed', quantity: 5, consumed: true },
    ],
    energyCost: 0,
    goldCost: 20,
    baseProductionTime: 240, // 4 hours
    minWorkers: 1,
    maxWorkers: 2,
    workerEfficiencyBonus: 0.2,
    outputs: [
      {
        itemId: 'gold_direct',
        baseQuantity: 50,
        minQuantity: 40,
        maxQuantity: 70,
        qualityAffectsQuantity: true,
        sellPrice: 1,
      },
    ],
    qualityBonusChance: 0.2,
    canRush: true,
    rushCostMultiplier: 2.0,
    isUnique: false,
    isRepeatable: true,
    icon: '🐴',
    tags: ['stable', 'training', 'service'],
  },

  'stable_training_advanced': {
    productId: 'stable_training_advanced',
    name: 'Advanced Training',
    description: 'Advanced horse training service',
    category: ProductCategory.TRAINING,
    propertyTypes: [PropertyType.STABLE],
    requiredLevel: 5,
    requiredWorkerType: WorkerSpecialization.HORSE_TRAINER,
    materials: [
      { itemId: 'training_equipment', quantity: 1, consumed: false },
      { itemId: 'horse_feed', quantity: 10, consumed: true },
    ],
    energyCost: 0,
    goldCost: 50,
    baseProductionTime: 480, // 8 hours
    minWorkers: 1,
    maxWorkers: 2,
    workerEfficiencyBonus: 0.25,
    outputs: [
      {
        itemId: 'gold_direct',
        baseQuantity: 150,
        minQuantity: 120,
        maxQuantity: 200,
        qualityAffectsQuantity: true,
        sellPrice: 1,
      },
    ],
    qualityBonusChance: 0.3,
    canRush: true,
    rushCostMultiplier: 3.0,
    isUnique: false,
    isRepeatable: true,
    icon: '🐎',
    tags: ['stable', 'training', 'service', 'premium'],
  },

  'stable_boarding': {
    productId: 'stable_boarding',
    name: 'Horse Boarding',
    description: 'Board horses for other players',
    category: ProductCategory.BOARDING,
    propertyTypes: [PropertyType.STABLE],
    requiredLevel: 2,
    materials: [
      { itemId: 'horse_feed', quantity: 3, consumed: true },
      { itemId: 'hay', quantity: 5, consumed: true },
    ],
    energyCost: 0,
    goldCost: 5,
    baseProductionTime: 1440, // 24 hours
    minWorkers: 1,
    maxWorkers: 3,
    workerEfficiencyBonus: 0.1,
    outputs: [
      {
        itemId: 'gold_direct',
        baseQuantity: 40,
        minQuantity: 30,
        maxQuantity: 60,
        qualityAffectsQuantity: true,
        sellPrice: 1,
      },
    ],
    qualityBonusChance: 0.15,
    canRush: false,
    rushCostMultiplier: 0,
    isUnique: false,
    isRepeatable: true,
    icon: '🏇',
    tags: ['stable', 'boarding', 'service'],
  },

  'stable_breeding': {
    productId: 'stable_breeding',
    name: 'Horse Breeding',
    description: 'Breed premium horses',
    category: ProductCategory.HORSES,
    propertyTypes: [PropertyType.STABLE],
    requiredLevel: 8,
    requiredUpgrades: ['breeding_pens'],
    requiredWorkerType: WorkerSpecialization.BREEDER,
    materials: [
      { itemId: 'horse_feed', quantity: 50, consumed: true },
      { itemId: 'breeding_stock', quantity: 2, consumed: false },
    ],
    energyCost: 0,
    goldCost: 100,
    baseProductionTime: 1440, // 24 hours
    minWorkers: 2,
    maxWorkers: 3,
    workerEfficiencyBonus: 0.2,
    outputs: [
      {
        itemId: 'premium_foal',
        baseQuantity: 1,
        minQuantity: 1,
        maxQuantity: 2,
        qualityAffectsQuantity: true,
        sellPrice: 250,
      },
    ],
    qualityBonusChance: 0.25,
    canRush: false,
    rushCostMultiplier: 0,
    isUnique: false,
    isRepeatable: true,
    icon: '🐴',
    tags: ['stable', 'breeding', 'horses'],
  },

  // ===== WORKSHOP PRODUCTS =====

  'workshop_revolver': {
    productId: 'workshop_revolver',
    name: 'Revolver',
    description: 'Craft a reliable revolver',
    category: ProductCategory.CRAFTED_GOODS,
    propertyTypes: [PropertyType.WORKSHOP],
    requiredLevel: 3,
    requiredWorkerType: WorkerSpecialization.GUNSMITH,
    materials: [
      { itemId: 'iron_ingot', quantity: 5, consumed: true },
      { itemId: 'wood', quantity: 2, consumed: true },
      { itemId: 'gunsmith_tools', quantity: 1, consumed: false },
    ],
    energyCost: 0,
    goldCost: 30,
    baseProductionTime: 240, // 4 hours
    minWorkers: 1,
    maxWorkers: 2,
    workerEfficiencyBonus: 0.25,
    outputs: [
      {
        itemId: 'revolver',
        baseQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        qualityAffectsQuantity: false,
        sellPrice: 100,
      },
    ],
    qualityBonusChance: 0.3,
    canRush: true,
    rushCostMultiplier: 2.5,
    isUnique: false,
    isRepeatable: true,
    icon: '🔫',
    tags: ['workshop', 'weapons', 'gunsmithing'],
  },

  'workshop_rifle': {
    productId: 'workshop_rifle',
    name: 'Rifle',
    description: 'Craft a precision rifle',
    category: ProductCategory.CRAFTED_GOODS,
    propertyTypes: [PropertyType.WORKSHOP],
    requiredLevel: 6,
    requiredWorkerType: WorkerSpecialization.GUNSMITH,
    materials: [
      { itemId: 'iron_ingot', quantity: 8, consumed: true },
      { itemId: 'wood', quantity: 4, consumed: true },
      { itemId: 'gunsmith_tools', quantity: 1, consumed: false },
    ],
    energyCost: 0,
    goldCost: 50,
    baseProductionTime: 360, // 6 hours
    minWorkers: 1,
    maxWorkers: 2,
    workerEfficiencyBonus: 0.3,
    outputs: [
      {
        itemId: 'rifle',
        baseQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        qualityAffectsQuantity: false,
        sellPrice: 180,
      },
    ],
    qualityBonusChance: 0.35,
    canRush: true,
    rushCostMultiplier: 3.0,
    isUnique: false,
    isRepeatable: true,
    icon: '🔫',
    tags: ['workshop', 'weapons', 'gunsmithing'],
  },

  'workshop_saddle': {
    productId: 'workshop_saddle',
    name: 'Saddle',
    description: 'Craft a quality saddle',
    category: ProductCategory.CRAFTED_GOODS,
    propertyTypes: [PropertyType.WORKSHOP],
    requiredLevel: 4,
    requiredWorkerType: WorkerSpecialization.LEATHERWORKER,
    materials: [
      { itemId: 'leather', quantity: 10, consumed: true },
      { itemId: 'iron_fittings', quantity: 3, consumed: true },
      { itemId: 'leatherwork_tools', quantity: 1, consumed: false },
    ],
    energyCost: 0,
    goldCost: 25,
    baseProductionTime: 180, // 3 hours
    minWorkers: 1,
    maxWorkers: 2,
    workerEfficiencyBonus: 0.2,
    outputs: [
      {
        itemId: 'saddle',
        baseQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        qualityAffectsQuantity: false,
        sellPrice: 80,
      },
    ],
    qualityBonusChance: 0.25,
    canRush: true,
    rushCostMultiplier: 2.0,
    isUnique: false,
    isRepeatable: true,
    icon: '🪑',
    tags: ['workshop', 'leather', 'equipment'],
  },

  'workshop_boots': {
    productId: 'workshop_boots',
    name: 'Leather Boots',
    description: 'Craft sturdy leather boots',
    category: ProductCategory.CRAFTED_GOODS,
    propertyTypes: [PropertyType.WORKSHOP],
    requiredLevel: 2,
    requiredWorkerType: WorkerSpecialization.LEATHERWORKER,
    materials: [
      { itemId: 'leather', quantity: 5, consumed: true },
      { itemId: 'thread', quantity: 2, consumed: true },
      { itemId: 'leatherwork_tools', quantity: 1, consumed: false },
    ],
    energyCost: 0,
    goldCost: 15,
    baseProductionTime: 120, // 2 hours
    minWorkers: 1,
    maxWorkers: 2,
    workerEfficiencyBonus: 0.15,
    outputs: [
      {
        itemId: 'leather_boots',
        baseQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        qualityAffectsQuantity: false,
        sellPrice: 45,
      },
    ],
    qualityBonusChance: 0.2,
    canRush: true,
    rushCostMultiplier: 2.0,
    isUnique: false,
    isRepeatable: true,
    icon: '👢',
    tags: ['workshop', 'leather', 'armor'],
  },

  'workshop_furniture': {
    productId: 'workshop_furniture',
    name: 'Furniture',
    description: 'Craft quality furniture',
    category: ProductCategory.CRAFTED_GOODS,
    propertyTypes: [PropertyType.WORKSHOP],
    requiredLevel: 3,
    requiredWorkerType: WorkerSpecialization.CARPENTER,
    materials: [
      { itemId: 'wood', quantity: 15, consumed: true },
      { itemId: 'nails', quantity: 5, consumed: true },
      { itemId: 'carpenter_tools', quantity: 1, consumed: false },
    ],
    energyCost: 0,
    goldCost: 20,
    baseProductionTime: 240, // 4 hours
    minWorkers: 1,
    maxWorkers: 3,
    workerEfficiencyBonus: 0.2,
    outputs: [
      {
        itemId: 'furniture',
        baseQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        qualityAffectsQuantity: false,
        sellPrice: 60,
      },
    ],
    qualityBonusChance: 0.25,
    canRush: true,
    rushCostMultiplier: 2.0,
    isUnique: false,
    isRepeatable: true,
    icon: '🪑',
    tags: ['workshop', 'carpentry', 'furniture'],
  },

  'workshop_tools': {
    productId: 'workshop_tools',
    name: 'Tools',
    description: 'Forge quality tools',
    category: ProductCategory.CRAFTED_GOODS,
    propertyTypes: [PropertyType.WORKSHOP],
    requiredLevel: 2,
    requiredWorkerType: WorkerSpecialization.BLACKSMITH,
    materials: [
      { itemId: 'iron_ingot', quantity: 6, consumed: true },
      { itemId: 'wood', quantity: 3, consumed: true },
      { itemId: 'blacksmith_tools', quantity: 1, consumed: false },
      { itemId: 'coal', quantity: 5, consumed: true },
    ],
    energyCost: 0,
    goldCost: 15,
    baseProductionTime: 180, // 3 hours
    minWorkers: 1,
    maxWorkers: 2,
    workerEfficiencyBonus: 0.2,
    outputs: [
      {
        itemId: 'tools',
        baseQuantity: 3,
        minQuantity: 2,
        maxQuantity: 5,
        qualityAffectsQuantity: true,
        sellPrice: 20,
      },
    ],
    qualityBonusChance: 0.2,
    canRush: true,
    rushCostMultiplier: 2.0,
    isUnique: false,
    isRepeatable: true,
    icon: '🔨',
    tags: ['workshop', 'blacksmithing', 'tools'],
  },

  'workshop_horseshoes': {
    productId: 'workshop_horseshoes',
    name: 'Horseshoes',
    description: 'Forge horseshoes',
    category: ProductCategory.CRAFTED_GOODS,
    propertyTypes: [PropertyType.WORKSHOP],
    requiredLevel: 1,
    requiredWorkerType: WorkerSpecialization.BLACKSMITH,
    materials: [
      { itemId: 'iron_ingot', quantity: 2, consumed: true },
      { itemId: 'coal', quantity: 3, consumed: true },
      { itemId: 'blacksmith_tools', quantity: 1, consumed: false },
    ],
    energyCost: 0,
    goldCost: 8,
    baseProductionTime: 60, // 1 hour
    minWorkers: 1,
    maxWorkers: 2,
    workerEfficiencyBonus: 0.15,
    outputs: [
      {
        itemId: 'horseshoes',
        baseQuantity: 4,
        minQuantity: 4,
        maxQuantity: 6,
        qualityAffectsQuantity: true,
        sellPrice: 8,
      },
    ],
    qualityBonusChance: 0.15,
    canRush: true,
    rushCostMultiplier: 1.5,
    isUnique: false,
    isRepeatable: true,
    icon: '🧲',
    tags: ['workshop', 'blacksmithing'],
  },

  'workshop_wagon_wheel': {
    productId: 'workshop_wagon_wheel',
    name: 'Wagon Wheel',
    description: 'Craft sturdy wagon wheels',
    category: ProductCategory.CRAFTED_GOODS,
    propertyTypes: [PropertyType.WORKSHOP],
    requiredLevel: 5,
    requiredWorkerType: WorkerSpecialization.CARPENTER,
    materials: [
      { itemId: 'wood', quantity: 10, consumed: true },
      { itemId: 'iron_fittings', quantity: 8, consumed: true },
      { itemId: 'carpenter_tools', quantity: 1, consumed: false },
    ],
    energyCost: 0,
    goldCost: 25,
    baseProductionTime: 240, // 4 hours
    minWorkers: 1,
    maxWorkers: 2,
    workerEfficiencyBonus: 0.2,
    outputs: [
      {
        itemId: 'wagon_wheel',
        baseQuantity: 1,
        minQuantity: 1,
        maxQuantity: 1,
        qualityAffectsQuantity: false,
        sellPrice: 70,
      },
    ],
    qualityBonusChance: 0.25,
    canRush: true,
    rushCostMultiplier: 2.5,
    isUnique: false,
    isRepeatable: true,
    icon: '⚙️',
    tags: ['workshop', 'carpentry', 'vehicle'],
  },

  'workshop_repairs': {
    productId: 'workshop_repairs',
    name: 'Repair Services',
    description: 'Offer repair services to the community',
    category: ProductCategory.REPAIRS,
    propertyTypes: [PropertyType.WORKSHOP],
    requiredLevel: 1,
    materials: [
      { itemId: 'repair_materials', quantity: 5, consumed: true },
    ],
    energyCost: 0,
    goldCost: 10,
    baseProductionTime: 120, // 2 hours
    minWorkers: 1,
    maxWorkers: 3,
    workerEfficiencyBonus: 0.15,
    outputs: [
      {
        itemId: 'gold_direct',
        baseQuantity: 40,
        minQuantity: 30,
        maxQuantity: 60,
        qualityAffectsQuantity: true,
        sellPrice: 1,
      },
    ],
    qualityBonusChance: 0.2,
    canRush: true,
    rushCostMultiplier: 2.0,
    isUnique: false,
    isRepeatable: true,
    icon: '🔧',
    tags: ['workshop', 'service', 'repairs'],
  },

  // ===== SHOP PRODUCTS =====

  'shop_retail': {
    productId: 'shop_retail',
    name: 'Retail Sales',
    description: 'Buy low, sell high - basic trading',
    category: ProductCategory.RETAIL,
    propertyTypes: [PropertyType.SHOP],
    requiredLevel: 1,
    materials: [
      { itemId: 'trade_goods', quantity: 10, consumed: true },
    ],
    energyCost: 0,
    goldCost: 50,
    baseProductionTime: 180, // 3 hours
    minWorkers: 1,
    maxWorkers: 3,
    workerEfficiencyBonus: 0.15,
    outputs: [
      {
        itemId: 'gold_direct',
        baseQuantity: 75,
        minQuantity: 60,
        maxQuantity: 100,
        qualityAffectsQuantity: true,
        sellPrice: 1,
      },
    ],
    qualityBonusChance: 0.2,
    canRush: false,
    rushCostMultiplier: 0,
    isUnique: false,
    isRepeatable: true,
    icon: '🏪',
    tags: ['shop', 'retail', 'trading'],
  },

  'shop_specialty': {
    productId: 'shop_specialty',
    name: 'Specialty Goods',
    description: 'Trade in rare and specialty items',
    category: ProductCategory.RETAIL,
    propertyTypes: [PropertyType.SHOP],
    requiredLevel: 5,
    requiredWorkerType: WorkerSpecialization.MERCHANT,
    materials: [
      { itemId: 'specialty_goods', quantity: 5, consumed: true },
    ],
    energyCost: 0,
    goldCost: 100,
    baseProductionTime: 240, // 4 hours
    minWorkers: 1,
    maxWorkers: 2,
    workerEfficiencyBonus: 0.25,
    outputs: [
      {
        itemId: 'gold_direct',
        baseQuantity: 180,
        minQuantity: 140,
        maxQuantity: 250,
        qualityAffectsQuantity: true,
        sellPrice: 1,
      },
    ],
    qualityBonusChance: 0.3,
    canRush: false,
    rushCostMultiplier: 0,
    isUnique: false,
    isRepeatable: true,
    icon: '💰',
    tags: ['shop', 'retail', 'luxury'],
  },

  'shop_appraisal': {
    productId: 'shop_appraisal',
    name: 'Appraisal Services',
    description: 'Offer professional appraisal services',
    category: ProductCategory.SERVICES,
    propertyTypes: [PropertyType.SHOP],
    requiredLevel: 7,
    requiredWorkerType: WorkerSpecialization.APPRAISER,
    materials: [],
    energyCost: 0,
    goldCost: 20,
    baseProductionTime: 120, // 2 hours
    minWorkers: 1,
    maxWorkers: 2,
    workerEfficiencyBonus: 0.2,
    outputs: [
      {
        itemId: 'gold_direct',
        baseQuantity: 60,
        minQuantity: 45,
        maxQuantity: 90,
        qualityAffectsQuantity: true,
        sellPrice: 1,
      },
    ],
    qualityBonusChance: 0.25,
    canRush: false,
    rushCostMultiplier: 0,
    isUnique: false,
    isRepeatable: true,
    icon: '🔍',
    tags: ['shop', 'service', 'appraisal'],
  },

  'shop_custom_orders': {
    productId: 'shop_custom_orders',
    name: 'Custom Orders',
    description: 'Fulfill custom orders for high profit',
    category: ProductCategory.SERVICES,
    propertyTypes: [PropertyType.SHOP],
    requiredLevel: 10,
    materials: [
      { itemId: 'custom_materials', quantity: 8, consumed: true },
    ],
    energyCost: 0,
    goldCost: 80,
    baseProductionTime: 360, // 6 hours
    minWorkers: 2,
    maxWorkers: 3,
    workerEfficiencyBonus: 0.25,
    outputs: [
      {
        itemId: 'gold_direct',
        baseQuantity: 200,
        minQuantity: 150,
        maxQuantity: 300,
        qualityAffectsQuantity: true,
        sellPrice: 1,
      },
    ],
    qualityBonusChance: 0.35,
    canRush: true,
    rushCostMultiplier: 2.5,
    isUnique: false,
    isRepeatable: true,
    icon: '📦',
    tags: ['shop', 'service', 'custom'],
  },
};

/**
 * Get products available for a specific property type
 */
export function getProductsForPropertyType(propertyType: PropertyType): ProductDefinition[] {
  return Object.values(PRODUCT_DEFINITIONS).filter((product) =>
    product.propertyTypes.includes(propertyType)
  );
}

/**
 * Get product by ID
 */
export function getProductById(productId: string): ProductDefinition | undefined {
  return PRODUCT_DEFINITIONS[productId];
}

/**
 * Get products by category
 */
export function getProductsByCategory(category: ProductCategory): ProductDefinition[] {
  return Object.values(PRODUCT_DEFINITIONS).filter(
    (product) => product.category === category
  );
}

/**
 * Get products requiring specific worker type
 */
export function getProductsByWorkerType(
  workerType: WorkerSpecialization
): ProductDefinition[] {
  return Object.values(PRODUCT_DEFINITIONS).filter(
    (product) => product.requiredWorkerType === workerType
  );
}

/**
 * Get rushable products
 */
export function getRushableProducts(): ProductDefinition[] {
  return Object.values(PRODUCT_DEFINITIONS).filter((product) => product.canRush);
}
