/**
 * Livestock Definitions
 *
 * Livestock types for ranch production including cattle, horses, sheep, pigs, chickens, and goats
 * Phase 8, Wave 8.2 - Ranch Properties
 */

import { ProductCategory } from '@desperados/shared';

/**
 * Livestock type
 */
export enum LivestockType {
  CATTLE = 'cattle',
  HORSE = 'horse',
  SHEEP = 'sheep',
  PIG = 'pig',
  CHICKEN = 'chicken',
  GOAT = 'goat',
}

/**
 * Livestock breed quality
 */
export enum LivestockBreed {
  COMMON = 'common',
  QUALITY = 'quality',
  PUREBRED = 'purebred',
  CHAMPION = 'champion',
}

/**
 * Livestock definition
 */
export interface LivestockDefinition {
  livestockId: string;
  name: string;
  type: LivestockType;
  breed: LivestockBreed;
  description: string;

  // Purchase cost
  purchasePrice: number;
  sellPrice: number;

  // Requirements
  minLevel: number;
  requiredUpgrades?: string[];
  spaceRequired: number; // Pasture space units

  // Growth
  maturityDays: number; // Days until productive
  lifespan: number; // Days before natural death

  // Production
  productionCycle: number; // Hours between productions
  products: LivestockProduct[];

  // Breeding
  canBreed: boolean;
  breedingCooldown: number; // Days
  gestationPeriod: number; // Days
  offspringMin: number;
  offspringMax: number;
  breedingSuccessRate: number; // Base percentage

  // Care
  dailyFeedCost: number;
  waterRequired: boolean;
  shelterRequired: boolean;

  // Stats
  healthBase: number;
  moraleBase: number;

  // Experience
  xpOnPurchase: number;
  xpOnSale: number;
  xpOnProduction: number;
}

/**
 * Livestock product output
 */
export interface LivestockProduct {
  itemId: string;
  itemName: string;
  baseQuantity: number;
  category: ProductCategory;
  qualityMultiplier: number; // How much breed affects output
  sellValue: number;
}

/**
 * Cattle definitions
 */
export const CATTLE_LIVESTOCK: LivestockDefinition[] = [
  {
    livestockId: 'cattle_longhorn_common',
    name: 'Texas Longhorn',
    type: LivestockType.CATTLE,
    breed: LivestockBreed.COMMON,
    description: 'Hardy Texas Longhorn cattle. Tough and resilient, perfect for beginners.',
    purchasePrice: 150,
    sellPrice: 120,
    minLevel: 1,
    spaceRequired: 2,
    maturityDays: 14,
    lifespan: 180,
    productionCycle: 168, // Weekly
    products: [
      {
        itemId: 'beef',
        itemName: 'Beef',
        baseQuantity: 3,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 1.2,
        sellValue: 15,
      },
      {
        itemId: 'leather',
        itemName: 'Leather',
        baseQuantity: 1,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 1.0,
        sellValue: 8,
      },
    ],
    canBreed: true,
    breedingCooldown: 90,
    gestationPeriod: 21,
    offspringMin: 1,
    offspringMax: 1,
    breedingSuccessRate: 60,
    dailyFeedCost: 2,
    waterRequired: true,
    shelterRequired: false,
    healthBase: 100,
    moraleBase: 80,
    xpOnPurchase: 10,
    xpOnSale: 15,
    xpOnProduction: 5,
  },
  {
    livestockId: 'cattle_angus_quality',
    name: 'Black Angus',
    type: LivestockType.CATTLE,
    breed: LivestockBreed.QUALITY,
    description: 'Quality Black Angus cattle. Excellent meat production with good marbling.',
    purchasePrice: 300,
    sellPrice: 250,
    minLevel: 5,
    requiredUpgrades: ['barn'],
    spaceRequired: 2,
    maturityDays: 21,
    lifespan: 240,
    productionCycle: 168,
    products: [
      {
        itemId: 'beef_quality',
        itemName: 'Quality Beef',
        baseQuantity: 5,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 1.5,
        sellValue: 25,
      },
      {
        itemId: 'leather_quality',
        itemName: 'Quality Leather',
        baseQuantity: 2,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 1.3,
        sellValue: 15,
      },
    ],
    canBreed: true,
    breedingCooldown: 90,
    gestationPeriod: 21,
    offspringMin: 1,
    offspringMax: 1,
    breedingSuccessRate: 70,
    dailyFeedCost: 3,
    waterRequired: true,
    shelterRequired: true,
    healthBase: 120,
    moraleBase: 90,
    xpOnPurchase: 20,
    xpOnSale: 30,
    xpOnProduction: 10,
  },
  {
    livestockId: 'cattle_hereford_purebred',
    name: 'Hereford Purebred',
    type: LivestockType.CATTLE,
    breed: LivestockBreed.PUREBRED,
    description: 'Purebred Hereford cattle. Premium bloodline for serious ranchers.',
    purchasePrice: 600,
    sellPrice: 500,
    minLevel: 10,
    requiredUpgrades: ['barn', 'feed_storage'],
    spaceRequired: 3,
    maturityDays: 28,
    lifespan: 300,
    productionCycle: 168,
    products: [
      {
        itemId: 'beef_prime',
        itemName: 'Prime Beef',
        baseQuantity: 8,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 2.0,
        sellValue: 40,
      },
      {
        itemId: 'leather_premium',
        itemName: 'Premium Leather',
        baseQuantity: 3,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 1.8,
        sellValue: 25,
      },
    ],
    canBreed: true,
    breedingCooldown: 90,
    gestationPeriod: 21,
    offspringMin: 1,
    offspringMax: 2,
    breedingSuccessRate: 80,
    dailyFeedCost: 5,
    waterRequired: true,
    shelterRequired: true,
    healthBase: 150,
    moraleBase: 100,
    xpOnPurchase: 40,
    xpOnSale: 60,
    xpOnProduction: 20,
  },
];

/**
 * Horse definitions
 */
export const HORSE_LIVESTOCK: LivestockDefinition[] = [
  {
    livestockId: 'horse_mustang_common',
    name: 'Wild Mustang',
    type: LivestockType.HORSE,
    breed: LivestockBreed.COMMON,
    description: 'Broken wild mustang. Spirited and tough, makes a decent mount.',
    purchasePrice: 200,
    sellPrice: 180,
    minLevel: 1,
    spaceRequired: 1,
    maturityDays: 21,
    lifespan: 300,
    productionCycle: 0, // Horses are sold, not produced
    products: [],
    canBreed: true,
    breedingCooldown: 120,
    gestationPeriod: 30,
    offspringMin: 1,
    offspringMax: 1,
    breedingSuccessRate: 50,
    dailyFeedCost: 3,
    waterRequired: true,
    shelterRequired: true,
    healthBase: 100,
    moraleBase: 70,
    xpOnPurchase: 15,
    xpOnSale: 25,
    xpOnProduction: 0,
  },
  {
    livestockId: 'horse_quarter_quality',
    name: 'Quarter Horse',
    type: LivestockType.HORSE,
    breed: LivestockBreed.QUALITY,
    description: 'American Quarter Horse. Fast, agile, and popular for ranch work.',
    purchasePrice: 500,
    sellPrice: 450,
    minLevel: 5,
    requiredUpgrades: ['stable'],
    spaceRequired: 1,
    maturityDays: 28,
    lifespan: 360,
    productionCycle: 0,
    products: [],
    canBreed: true,
    breedingCooldown: 120,
    gestationPeriod: 30,
    offspringMin: 1,
    offspringMax: 1,
    breedingSuccessRate: 65,
    dailyFeedCost: 4,
    waterRequired: true,
    shelterRequired: true,
    healthBase: 120,
    moraleBase: 85,
    xpOnPurchase: 30,
    xpOnSale: 50,
    xpOnProduction: 0,
  },
  {
    livestockId: 'horse_arabian_purebred',
    name: 'Arabian Purebred',
    type: LivestockType.HORSE,
    breed: LivestockBreed.PUREBRED,
    description: 'Purebred Arabian horse. Elegant, intelligent, and highly valuable.',
    purchasePrice: 1200,
    sellPrice: 1100,
    minLevel: 10,
    requiredUpgrades: ['stable', 'training_ring'],
    spaceRequired: 2,
    maturityDays: 35,
    lifespan: 420,
    productionCycle: 0,
    products: [],
    canBreed: true,
    breedingCooldown: 120,
    gestationPeriod: 30,
    offspringMin: 1,
    offspringMax: 1,
    breedingSuccessRate: 75,
    dailyFeedCost: 6,
    waterRequired: true,
    shelterRequired: true,
    healthBase: 140,
    moraleBase: 95,
    xpOnPurchase: 60,
    xpOnSale: 100,
    xpOnProduction: 0,
  },
  {
    livestockId: 'horse_thoroughbred_champion',
    name: 'Thoroughbred Champion',
    type: LivestockType.HORSE,
    breed: LivestockBreed.CHAMPION,
    description: 'Champion racing thoroughbred. The pinnacle of horse breeding.',
    purchasePrice: 3000,
    sellPrice: 2800,
    minLevel: 15,
    requiredUpgrades: ['stable', 'training_ring', 'breeding_pen'],
    spaceRequired: 3,
    maturityDays: 42,
    lifespan: 480,
    productionCycle: 0,
    products: [],
    canBreed: true,
    breedingCooldown: 120,
    gestationPeriod: 30,
    offspringMin: 1,
    offspringMax: 1,
    breedingSuccessRate: 85,
    dailyFeedCost: 10,
    waterRequired: true,
    shelterRequired: true,
    healthBase: 160,
    moraleBase: 100,
    xpOnPurchase: 120,
    xpOnSale: 200,
    xpOnProduction: 0,
  },
];

/**
 * Sheep definitions
 */
export const SHEEP_LIVESTOCK: LivestockDefinition[] = [
  {
    livestockId: 'sheep_common',
    name: 'Common Sheep',
    type: LivestockType.SHEEP,
    breed: LivestockBreed.COMMON,
    description: 'Basic wool sheep. Low maintenance and steady wool production.',
    purchasePrice: 50,
    sellPrice: 40,
    minLevel: 1,
    spaceRequired: 1,
    maturityDays: 7,
    lifespan: 150,
    productionCycle: 336, // Bi-weekly
    products: [
      {
        itemId: 'wool',
        itemName: 'Wool',
        baseQuantity: 2,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 1.2,
        sellValue: 6,
      },
      {
        itemId: 'mutton',
        itemName: 'Mutton',
        baseQuantity: 1,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 1.0,
        sellValue: 8,
      },
    ],
    canBreed: true,
    breedingCooldown: 60,
    gestationPeriod: 14,
    offspringMin: 1,
    offspringMax: 2,
    breedingSuccessRate: 70,
    dailyFeedCost: 1,
    waterRequired: true,
    shelterRequired: false,
    healthBase: 80,
    moraleBase: 70,
    xpOnPurchase: 5,
    xpOnSale: 8,
    xpOnProduction: 3,
  },
  {
    livestockId: 'sheep_merino_quality',
    name: 'Merino Sheep',
    type: LivestockType.SHEEP,
    breed: LivestockBreed.QUALITY,
    description: 'Merino sheep with superior wool quality. Prized by textile merchants.',
    purchasePrice: 150,
    sellPrice: 130,
    minLevel: 5,
    spaceRequired: 1,
    maturityDays: 14,
    lifespan: 180,
    productionCycle: 336,
    products: [
      {
        itemId: 'wool_fine',
        itemName: 'Fine Wool',
        baseQuantity: 4,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 1.5,
        sellValue: 12,
      },
      {
        itemId: 'mutton_quality',
        itemName: 'Quality Mutton',
        baseQuantity: 2,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 1.2,
        sellValue: 14,
      },
    ],
    canBreed: true,
    breedingCooldown: 60,
    gestationPeriod: 14,
    offspringMin: 1,
    offspringMax: 3,
    breedingSuccessRate: 80,
    dailyFeedCost: 2,
    waterRequired: true,
    shelterRequired: true,
    healthBase: 100,
    moraleBase: 85,
    xpOnPurchase: 15,
    xpOnSale: 20,
    xpOnProduction: 8,
  },
];

/**
 * Pig definitions
 */
export const PIG_LIVESTOCK: LivestockDefinition[] = [
  {
    livestockId: 'pig_common',
    name: 'Farm Pig',
    type: LivestockType.PIG,
    breed: LivestockBreed.COMMON,
    description: 'Common farm pig. Fast growing and good meat production.',
    purchasePrice: 80,
    sellPrice: 65,
    minLevel: 3,
    spaceRequired: 1,
    maturityDays: 10,
    lifespan: 120,
    productionCycle: 168,
    products: [
      {
        itemId: 'pork',
        itemName: 'Pork',
        baseQuantity: 4,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 1.1,
        sellValue: 10,
      },
      {
        itemId: 'pig_leather',
        itemName: 'Pig Leather',
        baseQuantity: 1,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 1.0,
        sellValue: 5,
      },
    ],
    canBreed: true,
    breedingCooldown: 45,
    gestationPeriod: 10,
    offspringMin: 3,
    offspringMax: 8,
    breedingSuccessRate: 85,
    dailyFeedCost: 2,
    waterRequired: true,
    shelterRequired: true,
    healthBase: 90,
    moraleBase: 75,
    xpOnPurchase: 8,
    xpOnSale: 12,
    xpOnProduction: 5,
  },
  {
    livestockId: 'pig_berkshire_quality',
    name: 'Berkshire Pig',
    type: LivestockType.PIG,
    breed: LivestockBreed.QUALITY,
    description: 'Premium Berkshire pig. Exceptional meat quality and flavor.',
    purchasePrice: 200,
    sellPrice: 180,
    minLevel: 7,
    requiredUpgrades: ['pig_pen'],
    spaceRequired: 1,
    maturityDays: 14,
    lifespan: 150,
    productionCycle: 168,
    products: [
      {
        itemId: 'pork_quality',
        itemName: 'Quality Pork',
        baseQuantity: 6,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 1.4,
        sellValue: 18,
      },
      {
        itemId: 'pig_leather_quality',
        itemName: 'Quality Pig Leather',
        baseQuantity: 2,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 1.2,
        sellValue: 10,
      },
    ],
    canBreed: true,
    breedingCooldown: 45,
    gestationPeriod: 10,
    offspringMin: 4,
    offspringMax: 10,
    breedingSuccessRate: 90,
    dailyFeedCost: 3,
    waterRequired: true,
    shelterRequired: true,
    healthBase: 110,
    moraleBase: 85,
    xpOnPurchase: 20,
    xpOnSale: 30,
    xpOnProduction: 12,
  },
];

/**
 * Chicken definitions
 */
export const CHICKEN_LIVESTOCK: LivestockDefinition[] = [
  {
    livestockId: 'chicken_common',
    name: 'Farm Chicken',
    type: LivestockType.CHICKEN,
    breed: LivestockBreed.COMMON,
    description: 'Standard laying hen. Daily egg production for steady income.',
    purchasePrice: 15,
    sellPrice: 12,
    minLevel: 1,
    spaceRequired: 0.25,
    maturityDays: 3,
    lifespan: 90,
    productionCycle: 24, // Daily
    products: [
      {
        itemId: 'eggs',
        itemName: 'Eggs',
        baseQuantity: 1,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 1.0,
        sellValue: 2,
      },
      {
        itemId: 'chicken_meat',
        itemName: 'Chicken Meat',
        baseQuantity: 1,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 1.0,
        sellValue: 4,
      },
    ],
    canBreed: true,
    breedingCooldown: 21,
    gestationPeriod: 7,
    offspringMin: 6,
    offspringMax: 12,
    breedingSuccessRate: 95,
    dailyFeedCost: 0.5,
    waterRequired: true,
    shelterRequired: true,
    healthBase: 60,
    moraleBase: 70,
    xpOnPurchase: 2,
    xpOnSale: 3,
    xpOnProduction: 1,
  },
  {
    livestockId: 'chicken_leghorn_quality',
    name: 'Leghorn Chicken',
    type: LivestockType.CHICKEN,
    breed: LivestockBreed.QUALITY,
    description: 'White Leghorn chicken. Prolific egg layer with larger eggs.',
    purchasePrice: 40,
    sellPrice: 35,
    minLevel: 3,
    requiredUpgrades: ['chicken_coop'],
    spaceRequired: 0.25,
    maturityDays: 5,
    lifespan: 120,
    productionCycle: 24,
    products: [
      {
        itemId: 'eggs_large',
        itemName: 'Large Eggs',
        baseQuantity: 2,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 1.3,
        sellValue: 3,
      },
      {
        itemId: 'chicken_meat_quality',
        itemName: 'Quality Chicken Meat',
        baseQuantity: 2,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 1.2,
        sellValue: 6,
      },
    ],
    canBreed: true,
    breedingCooldown: 21,
    gestationPeriod: 7,
    offspringMin: 8,
    offspringMax: 15,
    breedingSuccessRate: 98,
    dailyFeedCost: 1,
    waterRequired: true,
    shelterRequired: true,
    healthBase: 70,
    moraleBase: 80,
    xpOnPurchase: 5,
    xpOnSale: 8,
    xpOnProduction: 2,
  },
];

/**
 * Goat definitions
 */
export const GOAT_LIVESTOCK: LivestockDefinition[] = [
  {
    livestockId: 'goat_common',
    name: 'Dairy Goat',
    type: LivestockType.GOAT,
    breed: LivestockBreed.COMMON,
    description: 'Common dairy goat. Hardy animals that produce milk and meat.',
    purchasePrice: 60,
    sellPrice: 50,
    minLevel: 2,
    spaceRequired: 1,
    maturityDays: 7,
    lifespan: 120,
    productionCycle: 24, // Daily
    products: [
      {
        itemId: 'goat_milk',
        itemName: 'Goat Milk',
        baseQuantity: 2,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 1.1,
        sellValue: 4,
      },
      {
        itemId: 'goat_meat',
        itemName: 'Goat Meat',
        baseQuantity: 2,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 1.0,
        sellValue: 8,
      },
    ],
    canBreed: true,
    breedingCooldown: 45,
    gestationPeriod: 14,
    offspringMin: 1,
    offspringMax: 3,
    breedingSuccessRate: 80,
    dailyFeedCost: 1.5,
    waterRequired: true,
    shelterRequired: false,
    healthBase: 85,
    moraleBase: 75,
    xpOnPurchase: 6,
    xpOnSale: 10,
    xpOnProduction: 3,
  },
  {
    livestockId: 'goat_alpine_quality',
    name: 'Alpine Goat',
    type: LivestockType.GOAT,
    breed: LivestockBreed.QUALITY,
    description: 'Premium Alpine dairy goat. Excellent milk production and quality.',
    purchasePrice: 150,
    sellPrice: 130,
    minLevel: 5,
    spaceRequired: 1,
    maturityDays: 10,
    lifespan: 150,
    productionCycle: 24,
    products: [
      {
        itemId: 'goat_milk_quality',
        itemName: 'Quality Goat Milk',
        baseQuantity: 4,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 1.4,
        sellValue: 7,
      },
      {
        itemId: 'goat_meat_quality',
        itemName: 'Quality Goat Meat',
        baseQuantity: 3,
        category: ProductCategory.ANIMAL_PRODUCTS,
        qualityMultiplier: 1.2,
        sellValue: 12,
      },
    ],
    canBreed: true,
    breedingCooldown: 45,
    gestationPeriod: 14,
    offspringMin: 2,
    offspringMax: 4,
    breedingSuccessRate: 85,
    dailyFeedCost: 2,
    waterRequired: true,
    shelterRequired: true,
    healthBase: 100,
    moraleBase: 85,
    xpOnPurchase: 15,
    xpOnSale: 25,
    xpOnProduction: 6,
  },
];

/**
 * All livestock definitions
 */
export const ALL_LIVESTOCK: LivestockDefinition[] = [
  ...CATTLE_LIVESTOCK,
  ...HORSE_LIVESTOCK,
  ...SHEEP_LIVESTOCK,
  ...PIG_LIVESTOCK,
  ...CHICKEN_LIVESTOCK,
  ...GOAT_LIVESTOCK,
];

/**
 * Get livestock by ID
 */
export function getLivestockById(livestockId: string): LivestockDefinition | undefined {
  return ALL_LIVESTOCK.find((l) => l.livestockId === livestockId);
}

/**
 * Get livestock by type
 */
export function getLivestockByType(type: LivestockType): LivestockDefinition[] {
  return ALL_LIVESTOCK.filter((l) => l.type === type);
}

/**
 * Get livestock by breed quality
 */
export function getLivestockByBreed(breed: LivestockBreed): LivestockDefinition[] {
  return ALL_LIVESTOCK.filter((l) => l.breed === breed);
}

/**
 * Get livestock available at level
 */
export function getLivestockByLevel(level: number): LivestockDefinition[] {
  return ALL_LIVESTOCK.filter((l) => l.minLevel <= level);
}
