/**
 * Crop Definitions
 *
 * Crop types for ranch agriculture including grains, cash crops, vegetables, and feed
 * Phase 8, Wave 8.2 - Ranch Properties
 */

import { ProductCategory } from '@desperados/shared';

/**
 * Crop type categories
 */
export enum CropType {
  GRAIN = 'grain',
  CASH_CROP = 'cash_crop',
  VEGETABLE = 'vegetable',
  FEED = 'feed',
}

/**
 * Crop season preferences
 */
export enum CropSeason {
  SPRING = 'spring',
  SUMMER = 'summer',
  FALL = 'fall',
  WINTER = 'winter',
  ALL_SEASON = 'all_season',
}

/**
 * Crop definition
 */
export interface CropDefinition {
  cropId: string;
  name: string;
  type: CropType;
  description: string;

  // Purchase cost (for seeds)
  seedPrice: number;
  seedsPerPlot: number;

  // Requirements
  minLevel: number;
  requiredUpgrades?: string[];
  landRequired: number; // Acres per plot
  waterRequirement: 'low' | 'medium' | 'high';
  soilQuality: 'poor' | 'average' | 'rich';

  // Growth
  growthTime: number; // Hours
  stageCount: number; // Growth stages
  preferredSeason: CropSeason;
  seasonBonus: number; // Percentage bonus in preferred season

  // Harvest
  harvestYieldMin: number;
  harvestYieldMax: number;
  harvestRepeatable: boolean; // Can harvest multiple times?
  harvestsPerPlanting: number; // If repeatable
  regrowthTime: number; // Hours between harvests if repeatable

  // Products
  products: CropProduct[];

  // Care requirements
  dailyWaterCost: number;
  fertilizeCost: number; // Optional, increases yield
  fertilizerBonus: number; // Percentage

  // Resistance
  diseaseResistance: number; // 0-100
  droughtResistance: number; // 0-100

  // Experience
  xpOnPlant: number;
  xpOnHarvest: number;

  // Special
  isRotationCrop: boolean; // Good for crop rotation
  rotationBonus: string; // What it improves
}

/**
 * Crop product output
 */
export interface CropProduct {
  itemId: string;
  itemName: string;
  baseQuantity: number;
  category: ProductCategory;
  sellValue: number;
  qualityAffected: boolean; // Does crop quality affect quantity?
}

/**
 * Grain crops - Staple food production
 */
export const GRAIN_CROPS: CropDefinition[] = [
  {
    cropId: 'crop_corn',
    name: 'Corn',
    type: CropType.GRAIN,
    description: 'Versatile corn crop. Used for food, feed, and trade.',
    seedPrice: 5,
    seedsPerPlot: 10,
    minLevel: 1,
    landRequired: 1,
    waterRequirement: 'medium',
    soilQuality: 'average',
    growthTime: 72, // 3 days
    stageCount: 4,
    preferredSeason: CropSeason.SUMMER,
    seasonBonus: 25,
    harvestYieldMin: 8,
    harvestYieldMax: 15,
    harvestRepeatable: false,
    harvestsPerPlanting: 1,
    regrowthTime: 0,
    products: [
      {
        itemId: 'corn',
        itemName: 'Corn',
        baseQuantity: 10,
        category: ProductCategory.CROPS,
        sellValue: 3,
        qualityAffected: true,
      },
    ],
    dailyWaterCost: 1,
    fertilizeCost: 10,
    fertilizerBonus: 30,
    diseaseResistance: 60,
    droughtResistance: 50,
    xpOnPlant: 5,
    xpOnHarvest: 8,
    isRotationCrop: true,
    rotationBonus: 'nitrogen',
  },
  {
    cropId: 'crop_wheat',
    name: 'Wheat',
    type: CropType.GRAIN,
    description: 'Golden wheat for flour and bread. Essential frontier crop.',
    seedPrice: 8,
    seedsPerPlot: 15,
    minLevel: 2,
    landRequired: 2,
    waterRequirement: 'medium',
    soilQuality: 'average',
    growthTime: 96, // 4 days
    stageCount: 5,
    preferredSeason: CropSeason.SPRING,
    seasonBonus: 20,
    harvestYieldMin: 12,
    harvestYieldMax: 20,
    harvestRepeatable: false,
    harvestsPerPlanting: 1,
    regrowthTime: 0,
    products: [
      {
        itemId: 'wheat',
        itemName: 'Wheat',
        baseQuantity: 15,
        category: ProductCategory.CROPS,
        sellValue: 4,
        qualityAffected: true,
      },
    ],
    dailyWaterCost: 1.5,
    fertilizeCost: 15,
    fertilizerBonus: 25,
    diseaseResistance: 50,
    droughtResistance: 60,
    xpOnPlant: 8,
    xpOnHarvest: 12,
    isRotationCrop: false,
    rotationBonus: '',
  },
  {
    cropId: 'crop_barley',
    name: 'Barley',
    type: CropType.GRAIN,
    description: 'Hardy barley grain. Used for feed and brewing.',
    seedPrice: 6,
    seedsPerPlot: 12,
    minLevel: 3,
    landRequired: 1.5,
    waterRequirement: 'low',
    soilQuality: 'poor',
    growthTime: 84, // 3.5 days
    stageCount: 4,
    preferredSeason: CropSeason.FALL,
    seasonBonus: 20,
    harvestYieldMin: 10,
    harvestYieldMax: 18,
    harvestRepeatable: false,
    harvestsPerPlanting: 1,
    regrowthTime: 0,
    products: [
      {
        itemId: 'barley',
        itemName: 'Barley',
        baseQuantity: 12,
        category: ProductCategory.CROPS,
        sellValue: 3,
        qualityAffected: true,
      },
    ],
    dailyWaterCost: 0.5,
    fertilizeCost: 8,
    fertilizerBonus: 20,
    diseaseResistance: 70,
    droughtResistance: 80,
    xpOnPlant: 6,
    xpOnHarvest: 10,
    isRotationCrop: true,
    rotationBonus: 'soil_health',
  },
];

/**
 * Cash crops - High value exports
 */
export const CASH_CROPS: CropDefinition[] = [
  {
    cropId: 'crop_cotton',
    name: 'Cotton',
    type: CropType.CASH_CROP,
    description: 'Cotton for textile production. Valuable cash crop.',
    seedPrice: 15,
    seedsPerPlot: 20,
    minLevel: 5,
    requiredUpgrades: ['irrigation'],
    landRequired: 3,
    waterRequirement: 'high',
    soilQuality: 'rich',
    growthTime: 120, // 5 days
    stageCount: 5,
    preferredSeason: CropSeason.SUMMER,
    seasonBonus: 30,
    harvestYieldMin: 15,
    harvestYieldMax: 30,
    harvestRepeatable: false,
    harvestsPerPlanting: 1,
    regrowthTime: 0,
    products: [
      {
        itemId: 'cotton',
        itemName: 'Cotton',
        baseQuantity: 20,
        category: ProductCategory.CROPS,
        sellValue: 8,
        qualityAffected: true,
      },
    ],
    dailyWaterCost: 3,
    fertilizeCost: 30,
    fertilizerBonus: 35,
    diseaseResistance: 40,
    droughtResistance: 30,
    xpOnPlant: 15,
    xpOnHarvest: 25,
    isRotationCrop: false,
    rotationBonus: '',
  },
  {
    cropId: 'crop_tobacco',
    name: 'Tobacco',
    type: CropType.CASH_CROP,
    description: 'Premium tobacco leaves. High value but demanding crop.',
    seedPrice: 20,
    seedsPerPlot: 15,
    minLevel: 7,
    requiredUpgrades: ['irrigation', 'drying_shed'],
    landRequired: 2,
    waterRequirement: 'high',
    soilQuality: 'rich',
    growthTime: 144, // 6 days
    stageCount: 6,
    preferredSeason: CropSeason.SUMMER,
    seasonBonus: 40,
    harvestYieldMin: 10,
    harvestYieldMax: 20,
    harvestRepeatable: false,
    harvestsPerPlanting: 1,
    regrowthTime: 0,
    products: [
      {
        itemId: 'tobacco',
        itemName: 'Tobacco Leaves',
        baseQuantity: 15,
        category: ProductCategory.CROPS,
        sellValue: 15,
        qualityAffected: true,
      },
    ],
    dailyWaterCost: 4,
    fertilizeCost: 50,
    fertilizerBonus: 40,
    diseaseResistance: 30,
    droughtResistance: 20,
    xpOnPlant: 25,
    xpOnHarvest: 40,
    isRotationCrop: false,
    rotationBonus: '',
  },
];

/**
 * Vegetable crops - Food production
 */
export const VEGETABLE_CROPS: CropDefinition[] = [
  {
    cropId: 'crop_potatoes',
    name: 'Potatoes',
    type: CropType.VEGETABLE,
    description: 'Hearty potatoes. Reliable food source for frontier living.',
    seedPrice: 4,
    seedsPerPlot: 8,
    minLevel: 1,
    landRequired: 1,
    waterRequirement: 'medium',
    soilQuality: 'average',
    growthTime: 60, // 2.5 days
    stageCount: 3,
    preferredSeason: CropSeason.SPRING,
    seasonBonus: 20,
    harvestYieldMin: 10,
    harvestYieldMax: 18,
    harvestRepeatable: false,
    harvestsPerPlanting: 1,
    regrowthTime: 0,
    products: [
      {
        itemId: 'potatoes',
        itemName: 'Potatoes',
        baseQuantity: 12,
        category: ProductCategory.CROPS,
        sellValue: 2,
        qualityAffected: true,
      },
    ],
    dailyWaterCost: 1,
    fertilizeCost: 8,
    fertilizerBonus: 25,
    diseaseResistance: 55,
    droughtResistance: 50,
    xpOnPlant: 4,
    xpOnHarvest: 6,
    isRotationCrop: true,
    rotationBonus: 'soil_structure',
  },
  {
    cropId: 'crop_beans',
    name: 'Beans',
    type: CropType.VEGETABLE,
    description: 'Climbing beans. Protein-rich and nitrogen-fixing.',
    seedPrice: 6,
    seedsPerPlot: 12,
    minLevel: 2,
    landRequired: 1,
    waterRequirement: 'medium',
    soilQuality: 'average',
    growthTime: 48, // 2 days
    stageCount: 3,
    preferredSeason: CropSeason.SUMMER,
    seasonBonus: 25,
    harvestYieldMin: 8,
    harvestYieldMax: 14,
    harvestRepeatable: true,
    harvestsPerPlanting: 3,
    regrowthTime: 48,
    products: [
      {
        itemId: 'beans',
        itemName: 'Beans',
        baseQuantity: 10,
        category: ProductCategory.CROPS,
        sellValue: 4,
        qualityAffected: true,
      },
    ],
    dailyWaterCost: 1.5,
    fertilizeCost: 5,
    fertilizerBonus: 20,
    diseaseResistance: 60,
    droughtResistance: 45,
    xpOnPlant: 5,
    xpOnHarvest: 8,
    isRotationCrop: true,
    rotationBonus: 'nitrogen',
  },
  {
    cropId: 'crop_tomatoes',
    name: 'Tomatoes',
    type: CropType.VEGETABLE,
    description: 'Juicy tomatoes. Popular vegetable for markets and cooking.',
    seedPrice: 8,
    seedsPerPlot: 10,
    minLevel: 3,
    requiredUpgrades: ['greenhouse'],
    landRequired: 1,
    waterRequirement: 'high',
    soilQuality: 'rich',
    growthTime: 72, // 3 days
    stageCount: 4,
    preferredSeason: CropSeason.SUMMER,
    seasonBonus: 30,
    harvestYieldMin: 6,
    harvestYieldMax: 12,
    harvestRepeatable: true,
    harvestsPerPlanting: 4,
    regrowthTime: 36,
    products: [
      {
        itemId: 'tomatoes',
        itemName: 'Tomatoes',
        baseQuantity: 8,
        category: ProductCategory.CROPS,
        sellValue: 5,
        qualityAffected: true,
      },
    ],
    dailyWaterCost: 2,
    fertilizeCost: 12,
    fertilizerBonus: 30,
    diseaseResistance: 40,
    droughtResistance: 35,
    xpOnPlant: 8,
    xpOnHarvest: 12,
    isRotationCrop: false,
    rotationBonus: '',
  },
  {
    cropId: 'crop_carrots',
    name: 'Carrots',
    type: CropType.VEGETABLE,
    description: 'Sweet carrots. Easy to grow and store.',
    seedPrice: 5,
    seedsPerPlot: 15,
    minLevel: 1,
    landRequired: 0.5,
    waterRequirement: 'medium',
    soilQuality: 'average',
    growthTime: 54, // 2.25 days
    stageCount: 3,
    preferredSeason: CropSeason.FALL,
    seasonBonus: 20,
    harvestYieldMin: 12,
    harvestYieldMax: 20,
    harvestRepeatable: false,
    harvestsPerPlanting: 1,
    regrowthTime: 0,
    products: [
      {
        itemId: 'carrots',
        itemName: 'Carrots',
        baseQuantity: 15,
        category: ProductCategory.CROPS,
        sellValue: 2,
        qualityAffected: true,
      },
    ],
    dailyWaterCost: 0.75,
    fertilizeCost: 6,
    fertilizerBonus: 20,
    diseaseResistance: 70,
    droughtResistance: 60,
    xpOnPlant: 3,
    xpOnHarvest: 5,
    isRotationCrop: false,
    rotationBonus: '',
  },
];

/**
 * Feed crops - Animal feed production
 */
export const FEED_CROPS: CropDefinition[] = [
  {
    cropId: 'crop_hay',
    name: 'Hay',
    type: CropType.FEED,
    description: 'Dried grass hay. Essential feed for livestock.',
    seedPrice: 3,
    seedsPerPlot: 20,
    minLevel: 1,
    landRequired: 2,
    waterRequirement: 'low',
    soilQuality: 'poor',
    growthTime: 36, // 1.5 days
    stageCount: 2,
    preferredSeason: CropSeason.SUMMER,
    seasonBonus: 15,
    harvestYieldMin: 20,
    harvestYieldMax: 35,
    harvestRepeatable: true,
    harvestsPerPlanting: 3,
    regrowthTime: 24,
    products: [
      {
        itemId: 'hay',
        itemName: 'Hay Bales',
        baseQuantity: 25,
        category: ProductCategory.CROPS,
        sellValue: 1,
        qualityAffected: false,
      },
    ],
    dailyWaterCost: 0.5,
    fertilizeCost: 5,
    fertilizerBonus: 15,
    diseaseResistance: 80,
    droughtResistance: 90,
    xpOnPlant: 2,
    xpOnHarvest: 4,
    isRotationCrop: false,
    rotationBonus: '',
  },
  {
    cropId: 'crop_alfalfa',
    name: 'Alfalfa',
    type: CropType.FEED,
    description: 'Premium alfalfa hay. Nutrient-rich livestock feed.',
    seedPrice: 8,
    seedsPerPlot: 15,
    minLevel: 3,
    landRequired: 2,
    waterRequirement: 'medium',
    soilQuality: 'rich',
    growthTime: 48, // 2 days
    stageCount: 3,
    preferredSeason: CropSeason.SPRING,
    seasonBonus: 25,
    harvestYieldMin: 15,
    harvestYieldMax: 28,
    harvestRepeatable: true,
    harvestsPerPlanting: 4,
    regrowthTime: 30,
    products: [
      {
        itemId: 'alfalfa',
        itemName: 'Alfalfa',
        baseQuantity: 20,
        category: ProductCategory.CROPS,
        sellValue: 3,
        qualityAffected: true,
      },
    ],
    dailyWaterCost: 1.5,
    fertilizeCost: 10,
    fertilizerBonus: 25,
    diseaseResistance: 60,
    droughtResistance: 70,
    xpOnPlant: 6,
    xpOnHarvest: 10,
    isRotationCrop: true,
    rotationBonus: 'nitrogen',
  },
  {
    cropId: 'crop_oats',
    name: 'Oats',
    type: CropType.FEED,
    description: 'Oat grain for horses and livestock. Nutritious feed crop.',
    seedPrice: 6,
    seedsPerPlot: 12,
    minLevel: 2,
    landRequired: 1.5,
    waterRequirement: 'medium',
    soilQuality: 'average',
    growthTime: 72, // 3 days
    stageCount: 4,
    preferredSeason: CropSeason.FALL,
    seasonBonus: 20,
    harvestYieldMin: 10,
    harvestYieldMax: 18,
    harvestRepeatable: false,
    harvestsPerPlanting: 1,
    regrowthTime: 0,
    products: [
      {
        itemId: 'oats',
        itemName: 'Oats',
        baseQuantity: 14,
        category: ProductCategory.CROPS,
        sellValue: 2,
        qualityAffected: true,
      },
    ],
    dailyWaterCost: 1,
    fertilizeCost: 8,
    fertilizerBonus: 20,
    diseaseResistance: 65,
    droughtResistance: 55,
    xpOnPlant: 5,
    xpOnHarvest: 8,
    isRotationCrop: true,
    rotationBonus: 'soil_health',
  },
  {
    cropId: 'crop_sorghum',
    name: 'Sorghum',
    type: CropType.FEED,
    description: 'Drought-resistant sorghum. Reliable feed crop for dry conditions.',
    seedPrice: 7,
    seedsPerPlot: 10,
    minLevel: 4,
    landRequired: 2,
    waterRequirement: 'low',
    soilQuality: 'poor',
    growthTime: 84, // 3.5 days
    stageCount: 4,
    preferredSeason: CropSeason.SUMMER,
    seasonBonus: 20,
    harvestYieldMin: 12,
    harvestYieldMax: 22,
    harvestRepeatable: false,
    harvestsPerPlanting: 1,
    regrowthTime: 0,
    products: [
      {
        itemId: 'sorghum',
        itemName: 'Sorghum',
        baseQuantity: 16,
        category: ProductCategory.CROPS,
        sellValue: 2,
        qualityAffected: true,
      },
    ],
    dailyWaterCost: 0.5,
    fertilizeCost: 6,
    fertilizerBonus: 15,
    diseaseResistance: 75,
    droughtResistance: 95,
    xpOnPlant: 7,
    xpOnHarvest: 12,
    isRotationCrop: true,
    rotationBonus: 'drought_tolerance',
  },
];

/**
 * All crop definitions
 */
export const ALL_CROPS: CropDefinition[] = [
  ...GRAIN_CROPS,
  ...CASH_CROPS,
  ...VEGETABLE_CROPS,
  ...FEED_CROPS,
];

/**
 * Get crop by ID
 */
export function getCropById(cropId: string): CropDefinition | undefined {
  return ALL_CROPS.find((c) => c.cropId === cropId);
}

/**
 * Get crops by type
 */
export function getCropsByType(type: CropType): CropDefinition[] {
  return ALL_CROPS.filter((c) => c.type === type);
}

/**
 * Get crops by season
 */
export function getCropsBySeason(season: CropSeason): CropDefinition[] {
  return ALL_CROPS.filter((c) => c.preferredSeason === season || c.preferredSeason === CropSeason.ALL_SEASON);
}

/**
 * Get crops available at level
 */
export function getCropsByLevel(level: number): CropDefinition[] {
  return ALL_CROPS.filter((c) => c.minLevel <= level);
}

/**
 * Get rotation crops
 */
export function getRotationCrops(): CropDefinition[] {
  return ALL_CROPS.filter((c) => c.isRotationCrop);
}
