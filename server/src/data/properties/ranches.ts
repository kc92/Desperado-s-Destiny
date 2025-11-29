/**
 * Ranch Property Definitions
 *
 * Detailed ranch properties for purchase and ownership
 * Phase 8, Wave 8.2 - Ranch Properties
 */

import { PropertyType, PropertySize, PropertyTier, PurchaseSource } from '@desperados/shared';
import { RanchBuildingType } from './ranchBuildings';

/**
 * Water source type
 */
export enum WaterSourceType {
  NONE = 'none',
  CREEK = 'creek',
  SPRING = 'spring',
  WELL = 'well',
  RIVER = 'river',
  LAKE = 'lake',
}

/**
 * Water source definition
 */
export interface WaterSource {
  type: WaterSourceType;
  reliability: 'poor' | 'average' | 'good' | 'excellent';
  costReduction: number; // Percentage reduction in water costs
}

/**
 * Pasture definition
 */
export interface Pasture {
  id: string;
  name: string;
  acres: number;
  quality: 'poor' | 'average' | 'good' | 'excellent';
  capacity: number; // Livestock capacity
  grazingBonus: number; // Percentage
}

/**
 * Crop field definition
 */
export interface CropField {
  id: string;
  name: string;
  acres: number;
  soilQuality: 'poor' | 'average' | 'good' | 'rich';
  cropCapacity: number; // Number of crop plots
  yieldBonus: number; // Percentage
}

/**
 * Ranch property definition
 */
export interface RanchProperty {
  id: string;
  name: string;
  description: string;
  locationId: string;
  locationName: string;

  // Property classification
  propertyType: PropertyType;
  size: PropertySize;
  tier: PropertyTier;

  // Pricing
  basePrice: number;
  weeklyTax: number;
  weeklyUpkeep: number;

  // Physical attributes
  acres: number;
  buildings: RanchBuildingType[];
  pastures: Pasture[];
  cropFields: CropField[];
  waterSource: WaterSource;

  // Capacity
  maxLivestock: number;
  maxCrops: number;
  maxWorkers: number;
  storageCapacity: number;

  // Production bonuses
  livestockYieldBonus: number; // Percentage
  cropYieldBonus: number; // Percentage
  breedingSuccessBonus: number; // Percentage

  // Requirements
  levelRequirement: number;
  reputationRequirement?: {
    faction: string;
    amount: number;
  };

  // Special features
  specialFeatures: string[];
  availableUpgrades: RanchBuildingType[];
  uniqueProducts?: string[]; // Special products only this ranch can make

  // Meta
  purchaseSource: PurchaseSource;
  condition: number; // Starting condition 0-100
}

/**
 * SMALL RANCHES - Starter properties in Red Gulch area
 */
export const SMALL_RANCHES: RanchProperty[] = [
  {
    id: 'ranch_dusty_acres',
    name: 'Dusty Acres',
    description:
      'A modest starter ranch on the outskirts of Red Gulch. The land is dry but workable, with a small creek providing limited water. Perfect for learning the ranching trade with a few head of cattle.',
    locationId: 'red_gulch',
    locationName: 'Red Gulch',
    propertyType: PropertyType.RANCH,
    size: PropertySize.SMALL,
    tier: 1,
    basePrice: 800,
    weeklyTax: 15,
    weeklyUpkeep: 8,
    acres: 50,
    buildings: [],
    pastures: [
      {
        id: 'main_pasture',
        name: 'Main Grazing Area',
        acres: 35,
        quality: 'poor',
        capacity: 10,
        grazingBonus: 0,
      },
    ],
    cropFields: [
      {
        id: 'small_field',
        name: 'Small Field',
        acres: 10,
        soilQuality: 'poor',
        cropCapacity: 5,
        yieldBonus: 0,
      },
    ],
    waterSource: {
      type: WaterSourceType.CREEK,
      reliability: 'poor',
      costReduction: 10,
    },
    maxLivestock: 10,
    maxCrops: 5,
    maxWorkers: 1,
    storageCapacity: 50,
    livestockYieldBonus: 0,
    cropYieldBonus: 0,
    breedingSuccessBonus: 0,
    levelRequirement: 1,
    specialFeatures: ['starter_ranch', 'low_maintenance', 'expandable'],
    availableUpgrades: [
      RanchBuildingType.WELL,
      RanchBuildingType.CHICKEN_COOP,
      RanchBuildingType.TOOL_SHED,
      RanchBuildingType.FENCING,
    ],
    purchaseSource: PurchaseSource.NPC_DIRECT,
    condition: 100,
  },
  {
    id: 'ranch_hen_house',
    name: 'The Hen House',
    description:
      "A compact poultry farm with established chicken coops and nesting areas. The previous owner built a solid operation - you're buying an active business with steady egg income from day one.",
    locationId: 'red_gulch',
    locationName: 'Red Gulch',
    propertyType: PropertyType.RANCH,
    size: PropertySize.SMALL,
    tier: 1,
    basePrice: 650,
    weeklyTax: 12,
    weeklyUpkeep: 6,
    acres: 25,
    buildings: [RanchBuildingType.CHICKEN_COOP],
    pastures: [
      {
        id: 'chicken_yard',
        name: 'Chicken Yard',
        acres: 15,
        quality: 'average',
        capacity: 50,
        grazingBonus: 5,
      },
    ],
    cropFields: [
      {
        id: 'feed_plot',
        name: 'Feed Plot',
        acres: 8,
        soilQuality: 'average',
        cropCapacity: 4,
        yieldBonus: 0,
      },
    ],
    waterSource: {
      type: WaterSourceType.WELL,
      reliability: 'average',
      costReduction: 20,
    },
    maxLivestock: 50,
    maxCrops: 4,
    maxWorkers: 1,
    storageCapacity: 40,
    livestockYieldBonus: 10,
    cropYieldBonus: 0,
    breedingSuccessBonus: 5,
    levelRequirement: 1,
    specialFeatures: ['poultry_specialist', 'daily_income', 'existing_coop'],
    availableUpgrades: [
      RanchBuildingType.ROOT_CELLAR,
      RanchBuildingType.FEED_STORAGE,
      RanchBuildingType.TOOL_SHED,
    ],
    uniqueProducts: ['premium_eggs', 'breeding_hens'],
    purchaseSource: PurchaseSource.NPC_DIRECT,
    condition: 85,
  },
  {
    id: 'ranch_coyote_creek',
    name: 'Coyote Creek Farm',
    description:
      'A small mixed-use farm along Coyote Creek. Good soil for vegetables and enough pasture for a few animals. The creek provides reliable water year-round, a valuable asset in this dry territory.',
    locationId: 'red_gulch',
    locationName: 'Red Gulch',
    propertyType: PropertyType.RANCH,
    size: PropertySize.SMALL,
    tier: 1,
    basePrice: 750,
    weeklyTax: 14,
    weeklyUpkeep: 7,
    acres: 40,
    buildings: [RanchBuildingType.TOOL_SHED],
    pastures: [
      {
        id: 'small_pasture',
        name: 'Small Pasture',
        acres: 15,
        quality: 'average',
        capacity: 8,
        grazingBonus: 5,
      },
    ],
    cropFields: [
      {
        id: 'vegetable_garden',
        name: 'Vegetable Garden',
        acres: 12,
        soilQuality: 'average',
        cropCapacity: 8,
        yieldBonus: 10,
      },
      {
        id: 'small_grain_field',
        name: 'Small Grain Field',
        acres: 10,
        soilQuality: 'average',
        cropCapacity: 5,
        yieldBonus: 5,
      },
    ],
    waterSource: {
      type: WaterSourceType.CREEK,
      reliability: 'good',
      costReduction: 30,
    },
    maxLivestock: 8,
    maxCrops: 13,
    maxWorkers: 2,
    storageCapacity: 60,
    livestockYieldBonus: 0,
    cropYieldBonus: 10,
    breedingSuccessBonus: 0,
    levelRequirement: 2,
    specialFeatures: ['mixed_farming', 'reliable_water', 'fertile_soil'],
    availableUpgrades: [
      RanchBuildingType.ROOT_CELLAR,
      RanchBuildingType.SILO,
      RanchBuildingType.FENCING,
      RanchBuildingType.IRRIGATION,
    ],
    purchaseSource: PurchaseSource.NPC_DIRECT,
    condition: 90,
  },
  {
    id: 'ranch_sunset_pastures',
    name: 'Sunset Pastures',
    description:
      'A scenic sheep ranch nestled in rolling hills near Longhorn Ranch. The grasslands are perfect for grazing, and the existing sheep pen is well-maintained. Watch beautiful sunsets while your flock grazes.',
    locationId: 'longhorn_ranch',
    locationName: 'Longhorn Ranch Area',
    propertyType: PropertyType.RANCH,
    size: PropertySize.SMALL,
    tier: 1,
    basePrice: 900,
    weeklyTax: 16,
    weeklyUpkeep: 9,
    acres: 35,
    buildings: [RanchBuildingType.SHEEP_PEN],
    pastures: [
      {
        id: 'hillside_grazing',
        name: 'Hillside Grazing',
        acres: 28,
        quality: 'good',
        capacity: 30,
        grazingBonus: 10,
      },
    ],
    cropFields: [
      {
        id: 'hay_field',
        name: 'Hay Field',
        acres: 5,
        soilQuality: 'average',
        cropCapacity: 3,
        yieldBonus: 0,
      },
    ],
    waterSource: {
      type: WaterSourceType.SPRING,
      reliability: 'good',
      costReduction: 25,
    },
    maxLivestock: 30,
    maxCrops: 3,
    maxWorkers: 2,
    storageCapacity: 55,
    livestockYieldBonus: 15,
    cropYieldBonus: 0,
    breedingSuccessBonus: 10,
    levelRequirement: 3,
    specialFeatures: ['sheep_specialist', 'wool_production', 'scenic_location'],
    availableUpgrades: [
      RanchBuildingType.FEED_STORAGE,
      RanchBuildingType.FENCING,
      RanchBuildingType.WELL,
    ],
    uniqueProducts: ['quality_wool', 'breeding_sheep'],
    purchaseSource: PurchaseSource.NPC_DIRECT,
    condition: 95,
  },
  {
    id: 'ranch_pioneers_claim',
    name: "Pioneer's Claim",
    description:
      'A frontier homestead with a bit of everything - a few animals, small crops, and room to grow. Built by early settlers, it has good bones and potential. Your chance to build your own western legacy.',
    locationId: 'red_gulch',
    locationName: 'Red Gulch',
    propertyType: PropertyType.RANCH,
    size: PropertySize.SMALL,
    tier: 1,
    basePrice: 700,
    weeklyTax: 13,
    weeklyUpkeep: 7,
    acres: 30,
    buildings: [RanchBuildingType.FARMHOUSE],
    pastures: [
      {
        id: 'homestead_pasture',
        name: 'Homestead Pasture',
        acres: 12,
        quality: 'average',
        capacity: 6,
        grazingBonus: 0,
      },
    ],
    cropFields: [
      {
        id: 'homestead_garden',
        name: 'Homestead Garden',
        acres: 8,
        soilQuality: 'average',
        cropCapacity: 6,
        yieldBonus: 5,
      },
    ],
    waterSource: {
      type: WaterSourceType.WELL,
      reliability: 'average',
      costReduction: 15,
    },
    maxLivestock: 6,
    maxCrops: 6,
    maxWorkers: 2,
    storageCapacity: 65,
    livestockYieldBonus: 0,
    cropYieldBonus: 5,
    breedingSuccessBonus: 0,
    levelRequirement: 1,
    specialFeatures: ['starter_homestead', 'expandable', 'worker_housing'],
    availableUpgrades: [
      RanchBuildingType.BARN,
      RanchBuildingType.CHICKEN_COOP,
      RanchBuildingType.ROOT_CELLAR,
      RanchBuildingType.TOOL_SHED,
    ],
    purchaseSource: PurchaseSource.NPC_DIRECT,
    condition: 80,
  },
];

/**
 * MEDIUM RANCHES - Established operations
 */
export const MEDIUM_RANCHES: RanchProperty[] = [
  {
    id: 'ranch_cattlemans_pride',
    name: "Cattleman's Pride",
    description:
      'An established cattle ranch with prime grazing land and solid infrastructure. The barn and fencing are in excellent condition. Known throughout the territory for producing quality beef cattle.',
    locationId: 'longhorn_ranch',
    locationName: 'Longhorn Ranch Area',
    propertyType: PropertyType.RANCH,
    size: PropertySize.MEDIUM,
    tier: 2,
    basePrice: 3500,
    weeklyTax: 45,
    weeklyUpkeep: 25,
    acres: 200,
    buildings: [RanchBuildingType.BARN, RanchBuildingType.WELL, RanchBuildingType.FENCING, RanchBuildingType.FARMHOUSE],
    pastures: [
      {
        id: 'north_range',
        name: 'North Range',
        acres: 80,
        quality: 'good',
        capacity: 40,
        grazingBonus: 15,
      },
      {
        id: 'south_range',
        name: 'South Range',
        acres: 70,
        quality: 'good',
        capacity: 35,
        grazingBonus: 15,
      },
      {
        id: 'holding_pen',
        name: 'Holding Pen',
        acres: 10,
        quality: 'average',
        capacity: 10,
        grazingBonus: 0,
      },
    ],
    cropFields: [
      {
        id: 'feed_field',
        name: 'Feed Field',
        acres: 30,
        soilQuality: 'average',
        cropCapacity: 15,
        yieldBonus: 10,
      },
    ],
    waterSource: {
      type: WaterSourceType.RIVER,
      reliability: 'excellent',
      costReduction: 50,
    },
    maxLivestock: 85,
    maxCrops: 15,
    maxWorkers: 4,
    storageCapacity: 150,
    livestockYieldBonus: 20,
    cropYieldBonus: 10,
    breedingSuccessBonus: 15,
    levelRequirement: 8,
    specialFeatures: ['established_operation', 'cattle_specialist', 'river_access', 'quality_beef'],
    availableUpgrades: [
      RanchBuildingType.FEED_STORAGE,
      RanchBuildingType.SMOKEHOUSE,
      RanchBuildingType.BREEDING_PEN,
      RanchBuildingType.BUNKHOUSE,
      RanchBuildingType.SILO,
    ],
    uniqueProducts: ['prime_beef', 'breeding_cattle', 'aged_beef'],
    purchaseSource: PurchaseSource.NPC_DIRECT,
    condition: 90,
  },
  {
    id: 'ranch_greenfield_plantation',
    name: 'Greenfield Plantation',
    description:
      'A prosperous crop farm specializing in cotton and tobacco. Rich soil and established irrigation make this a profitable venture. The drying sheds and storage facilities are top-notch.',
    locationId: 'whiskey_bend',
    locationName: 'Whiskey Bend',
    propertyType: PropertyType.RANCH,
    size: PropertySize.MEDIUM,
    tier: 2,
    basePrice: 4200,
    weeklyTax: 50,
    weeklyUpkeep: 30,
    acres: 150,
    buildings: [
      RanchBuildingType.DRYING_SHED,
      RanchBuildingType.SILO,
      RanchBuildingType.IRRIGATION,
      RanchBuildingType.WELL,
      RanchBuildingType.TOOL_SHED,
      RanchBuildingType.FARMHOUSE,
    ],
    pastures: [],
    cropFields: [
      {
        id: 'cotton_field_1',
        name: 'East Cotton Field',
        acres: 50,
        soilQuality: 'rich',
        cropCapacity: 25,
        yieldBonus: 20,
      },
      {
        id: 'cotton_field_2',
        name: 'West Cotton Field',
        acres: 50,
        soilQuality: 'rich',
        cropCapacity: 25,
        yieldBonus: 20,
      },
      {
        id: 'tobacco_field',
        name: 'Tobacco Field',
        acres: 40,
        soilQuality: 'rich',
        cropCapacity: 20,
        yieldBonus: 25,
      },
    ],
    waterSource: {
      type: WaterSourceType.WELL,
      reliability: 'excellent',
      costReduction: 40,
    },
    maxLivestock: 0,
    maxCrops: 70,
    maxWorkers: 6,
    storageCapacity: 200,
    livestockYieldBonus: 0,
    cropYieldBonus: 25,
    breedingSuccessBonus: 0,
    levelRequirement: 10,
    reputationRequirement: {
      faction: 'settler',
      amount: 500,
    },
    specialFeatures: ['cash_crop_specialist', 'irrigation_system', 'high_income', 'premium_crops'],
    availableUpgrades: [
      RanchBuildingType.GREENHOUSE,
      RanchBuildingType.BUNKHOUSE,
      RanchBuildingType.WATER_TOWER,
      RanchBuildingType.ROOT_CELLAR,
    ],
    uniqueProducts: ['premium_cotton', 'cured_tobacco', 'export_grade_crops'],
    purchaseSource: PurchaseSource.NPC_DIRECT,
    condition: 95,
  },
  {
    id: 'ranch_thunder_valley',
    name: 'Thunder Valley Ranch',
    description:
      'A renowned horse breeding operation in a spectacular valley setting. Multiple stables, training facilities, and quality pasture. Thunder Valley horses are sought after across the frontier.',
    locationId: 'longhorn_ranch',
    locationName: 'Longhorn Ranch Area',
    propertyType: PropertyType.RANCH,
    size: PropertySize.MEDIUM,
    tier: 3,
    basePrice: 5500,
    weeklyTax: 60,
    weeklyUpkeep: 40,
    acres: 175,
    buildings: [
      RanchBuildingType.STABLE,
      RanchBuildingType.TRAINING_RING,
      RanchBuildingType.BREEDING_PEN,
      RanchBuildingType.FEED_STORAGE,
      RanchBuildingType.WELL,
      RanchBuildingType.FENCING,
      RanchBuildingType.FARMHOUSE,
    ],
    pastures: [
      {
        id: 'training_pasture',
        name: 'Training Pasture',
        acres: 40,
        quality: 'excellent',
        capacity: 25,
        grazingBonus: 20,
      },
      {
        id: 'breeding_pasture',
        name: 'Breeding Pasture',
        acres: 50,
        quality: 'excellent',
        capacity: 30,
        grazingBonus: 25,
      },
      {
        id: 'young_stock',
        name: 'Young Stock Area',
        acres: 35,
        quality: 'good',
        capacity: 20,
        grazingBonus: 15,
      },
    ],
    cropFields: [
      {
        id: 'hay_field_large',
        name: 'Hay Field',
        acres: 40,
        soilQuality: 'average',
        cropCapacity: 20,
        yieldBonus: 10,
      },
    ],
    waterSource: {
      type: WaterSourceType.SPRING,
      reliability: 'excellent',
      costReduction: 45,
    },
    maxLivestock: 75,
    maxCrops: 20,
    maxWorkers: 5,
    storageCapacity: 120,
    livestockYieldBonus: 30,
    cropYieldBonus: 10,
    breedingSuccessBonus: 30,
    levelRequirement: 12,
    reputationRequirement: {
      faction: 'settler',
      amount: 750,
    },
    specialFeatures: ['horse_breeding_specialist', 'training_facilities', 'prestigious_bloodlines', 'valley_setting'],
    availableUpgrades: [
      RanchBuildingType.BUNKHOUSE,
      RanchBuildingType.WATER_TOWER,
      RanchBuildingType.SILO,
    ],
    uniqueProducts: ['champion_horses', 'trained_mounts', 'racing_stock', 'breeding_stallions'],
    purchaseSource: PurchaseSource.NPC_DIRECT,
    condition: 92,
  },
  {
    id: 'ranch_double_bar',
    name: 'Double Bar Ranch',
    description:
      'A versatile ranch running both cattle and horses. The Double Bar brand is well-known in the territory. Diverse operations mean multiple income streams and reduced risk.',
    locationId: 'longhorn_ranch',
    locationName: 'Longhorn Ranch Area',
    propertyType: PropertyType.RANCH,
    size: PropertySize.MEDIUM,
    tier: 2,
    basePrice: 4800,
    weeklyTax: 55,
    weeklyUpkeep: 35,
    acres: 250,
    buildings: [
      RanchBuildingType.BARN,
      RanchBuildingType.STABLE,
      RanchBuildingType.WELL,
      RanchBuildingType.FENCING,
      RanchBuildingType.FEED_STORAGE,
      RanchBuildingType.FARMHOUSE,
    ],
    pastures: [
      {
        id: 'cattle_range',
        name: 'Cattle Range',
        acres: 100,
        quality: 'good',
        capacity: 50,
        grazingBonus: 15,
      },
      {
        id: 'horse_pasture',
        name: 'Horse Pasture',
        acres: 60,
        quality: 'good',
        capacity: 30,
        grazingBonus: 15,
      },
    ],
    cropFields: [
      {
        id: 'feed_production',
        name: 'Feed Production',
        acres: 70,
        soilQuality: 'average',
        cropCapacity: 30,
        yieldBonus: 15,
      },
    ],
    waterSource: {
      type: WaterSourceType.RIVER,
      reliability: 'excellent',
      costReduction: 50,
    },
    maxLivestock: 80,
    maxCrops: 30,
    maxWorkers: 5,
    storageCapacity: 180,
    livestockYieldBonus: 15,
    cropYieldBonus: 15,
    breedingSuccessBonus: 15,
    levelRequirement: 10,
    specialFeatures: ['mixed_livestock', 'diverse_income', 'established_brand', 'river_frontage'],
    availableUpgrades: [
      RanchBuildingType.BREEDING_PEN,
      RanchBuildingType.TRAINING_RING,
      RanchBuildingType.SMOKEHOUSE,
      RanchBuildingType.BUNKHOUSE,
      RanchBuildingType.SILO,
      RanchBuildingType.IRRIGATION,
    ],
    uniqueProducts: ['branded_cattle', 'working_horses'],
    purchaseSource: PurchaseSource.NPC_DIRECT,
    condition: 88,
  },
  {
    id: 'ranch_prosperity_farms',
    name: 'Prosperity Farms',
    description:
      'A diversified agricultural operation with livestock, grains, vegetables, and dairy. Multiple income streams make this one of the most stable properties available. A true farming empire in miniature.',
    locationId: 'whiskey_bend',
    locationName: 'Whiskey Bend',
    propertyType: PropertyType.RANCH,
    size: PropertySize.MEDIUM,
    tier: 2,
    basePrice: 4500,
    weeklyTax: 52,
    weeklyUpkeep: 32,
    acres: 180,
    buildings: [
      RanchBuildingType.BARN,
      RanchBuildingType.DAIRY_SHED,
      RanchBuildingType.CHICKEN_COOP,
      RanchBuildingType.SILO,
      RanchBuildingType.ROOT_CELLAR,
      RanchBuildingType.WELL,
      RanchBuildingType.IRRIGATION,
      RanchBuildingType.FARMHOUSE,
    ],
    pastures: [
      {
        id: 'dairy_pasture',
        name: 'Dairy Pasture',
        acres: 40,
        quality: 'good',
        capacity: 20,
        grazingBonus: 15,
      },
      {
        id: 'mixed_grazing',
        name: 'Mixed Grazing',
        acres: 30,
        quality: 'average',
        capacity: 25,
        grazingBonus: 10,
      },
    ],
    cropFields: [
      {
        id: 'grain_fields',
        name: 'Grain Fields',
        acres: 50,
        soilQuality: 'good',
        cropCapacity: 25,
        yieldBonus: 20,
      },
      {
        id: 'vegetable_plots',
        name: 'Vegetable Plots',
        acres: 35,
        soilQuality: 'rich',
        cropCapacity: 20,
        yieldBonus: 25,
      },
    ],
    waterSource: {
      type: WaterSourceType.WELL,
      reliability: 'excellent',
      costReduction: 40,
    },
    maxLivestock: 65,
    maxCrops: 45,
    maxWorkers: 6,
    storageCapacity: 250,
    livestockYieldBonus: 15,
    cropYieldBonus: 20,
    breedingSuccessBonus: 10,
    levelRequirement: 11,
    specialFeatures: ['diversified_operation', 'multiple_income', 'dairy_production', 'stable_earnings'],
    availableUpgrades: [
      RanchBuildingType.GREENHOUSE,
      RanchBuildingType.SMOKEHOUSE,
      RanchBuildingType.TANNERY,
      RanchBuildingType.BUNKHOUSE,
      RanchBuildingType.WATER_TOWER,
    ],
    uniqueProducts: ['fresh_dairy', 'cheese', 'diverse_produce', 'farm_box'],
    purchaseSource: PurchaseSource.NPC_DIRECT,
    condition: 93,
  },
];

/**
 * LARGE RANCHES - Premium operations
 */
export const LARGE_RANCHES: RanchProperty[] = [
  {
    id: 'ranch_longhorn_legacy',
    name: 'The Longhorn Legacy',
    description:
      'A prestigious cattle empire spanning 500 acres of prime grazing land. The Legacy has supplied beef to the Army and settlements for twenty years. Buying this ranch means joining the ranching elite.',
    locationId: 'longhorn_ranch',
    locationName: 'Longhorn Ranch Area',
    propertyType: PropertyType.RANCH,
    size: PropertySize.LARGE,
    tier: 4,
    basePrice: 15000,
    weeklyTax: 150,
    weeklyUpkeep: 100,
    acres: 500,
    buildings: [
      RanchBuildingType.BARN,
      RanchBuildingType.BREEDING_PEN,
      RanchBuildingType.SMOKEHOUSE,
      RanchBuildingType.FEED_STORAGE,
      RanchBuildingType.SILO,
      RanchBuildingType.WELL,
      RanchBuildingType.WINDMILL,
      RanchBuildingType.FENCING,
      RanchBuildingType.FARMHOUSE,
      RanchBuildingType.BUNKHOUSE,
    ],
    pastures: [
      {
        id: 'east_range',
        name: 'East Range',
        acres: 150,
        quality: 'excellent',
        capacity: 100,
        grazingBonus: 25,
      },
      {
        id: 'west_range',
        name: 'West Range',
        acres: 150,
        quality: 'excellent',
        capacity: 100,
        grazingBonus: 25,
      },
      {
        id: 'breeding_grounds',
        name: 'Breeding Grounds',
        acres: 80,
        quality: 'excellent',
        capacity: 50,
        grazingBonus: 30,
      },
    ],
    cropFields: [
      {
        id: 'hay_production',
        name: 'Hay Production',
        acres: 100,
        soilQuality: 'good',
        cropCapacity: 40,
        yieldBonus: 20,
      },
    ],
    waterSource: {
      type: WaterSourceType.RIVER,
      reliability: 'excellent',
      costReduction: 60,
    },
    maxLivestock: 250,
    maxCrops: 40,
    maxWorkers: 12,
    storageCapacity: 500,
    livestockYieldBonus: 35,
    cropYieldBonus: 20,
    breedingSuccessBonus: 35,
    levelRequirement: 18,
    reputationRequirement: {
      faction: 'settler',
      amount: 1500,
    },
    specialFeatures: [
      'elite_cattle_operation',
      'army_contracts',
      'prestigious_brand',
      'massive_scale',
      'river_frontage',
      'established_reputation',
    ],
    availableUpgrades: [
      RanchBuildingType.TANNERY,
      RanchBuildingType.WATER_TOWER,
      RanchBuildingType.TRAINING_RING,
    ],
    uniqueProducts: ['legacy_beef', 'army_contract_cattle', 'premium_breeding_stock', 'aged_premium_beef'],
    purchaseSource: PurchaseSource.NPC_DIRECT,
    condition: 95,
  },
  {
    id: 'ranch_kings_crown',
    name: "King's Crown Ranch",
    description:
      'The premier horse breeding facility in the territory. Champion bloodlines, world-class training facilities, and 450 acres of pristine pasture. King\'s Crown horses have won races and impressed cavalry officers from Texas to California.',
    locationId: 'fort_ashford',
    locationName: 'Fort Ashford Area',
    propertyType: PropertyType.RANCH,
    size: PropertySize.LARGE,
    tier: 4,
    basePrice: 18000,
    weeklyTax: 175,
    weeklyUpkeep: 120,
    acres: 450,
    buildings: [
      RanchBuildingType.STABLE,
      RanchBuildingType.TRAINING_RING,
      RanchBuildingType.BREEDING_PEN,
      RanchBuildingType.FEED_STORAGE,
      RanchBuildingType.SILO,
      RanchBuildingType.WELL,
      RanchBuildingType.WATER_TOWER,
      RanchBuildingType.FENCING,
      RanchBuildingType.FARMHOUSE,
      RanchBuildingType.BUNKHOUSE,
    ],
    pastures: [
      {
        id: 'champion_pasture',
        name: 'Champion Pasture',
        acres: 100,
        quality: 'excellent',
        capacity: 50,
        grazingBonus: 35,
      },
      {
        id: 'breeding_fields',
        name: 'Breeding Fields',
        acres: 120,
        quality: 'excellent',
        capacity: 60,
        grazingBonus: 30,
      },
      {
        id: 'training_grounds',
        name: 'Training Grounds',
        acres: 80,
        quality: 'excellent',
        capacity: 40,
        grazingBonus: 30,
      },
      {
        id: 'foal_pasture',
        name: 'Foal Pasture',
        acres: 60,
        quality: 'good',
        capacity: 30,
        grazingBonus: 20,
      },
    ],
    cropFields: [
      {
        id: 'premium_feed',
        name: 'Premium Feed Production',
        acres: 80,
        soilQuality: 'rich',
        cropCapacity: 35,
        yieldBonus: 30,
      },
    ],
    waterSource: {
      type: WaterSourceType.LAKE,
      reliability: 'excellent',
      costReduction: 70,
    },
    maxLivestock: 180,
    maxCrops: 35,
    maxWorkers: 10,
    storageCapacity: 400,
    livestockYieldBonus: 45,
    cropYieldBonus: 30,
    breedingSuccessBonus: 45,
    levelRequirement: 20,
    reputationRequirement: {
      faction: 'settler',
      amount: 2000,
    },
    specialFeatures: [
      'elite_horse_breeding',
      'champion_bloodlines',
      'cavalry_contracts',
      'racing_stock',
      'training_excellence',
      'lake_access',
      'prestigious_location',
    ],
    availableUpgrades: [RanchBuildingType.DAIRY_SHED, RanchBuildingType.WINDMILL],
    uniqueProducts: [
      'champion_thoroughbreds',
      'cavalry_mounts',
      'racing_champions',
      'breeding_champions',
      'show_horses',
    ],
    purchaseSource: PurchaseSource.NPC_DIRECT,
    condition: 98,
  },
  {
    id: 'ranch_golden_harvest',
    name: 'Golden Harvest Estate',
    description:
      'An industrial-scale agricultural operation producing crops for export. Advanced irrigation, multiple crop types, and efficient operations. This isn\'t just a farm - it\'s an agribusiness empire.',
    locationId: 'whiskey_bend',
    locationName: 'Whiskey Bend',
    propertyType: PropertyType.RANCH,
    size: PropertySize.LARGE,
    tier: 4,
    basePrice: 16500,
    weeklyTax: 160,
    weeklyUpkeep: 110,
    acres: 600,
    buildings: [
      RanchBuildingType.GREENHOUSE,
      RanchBuildingType.DRYING_SHED,
      RanchBuildingType.SILO,
      RanchBuildingType.ROOT_CELLAR,
      RanchBuildingType.WELL,
      RanchBuildingType.WATER_TOWER,
      RanchBuildingType.IRRIGATION,
      RanchBuildingType.TOOL_SHED,
      RanchBuildingType.FARMHOUSE,
      RanchBuildingType.BUNKHOUSE,
    ],
    pastures: [],
    cropFields: [
      {
        id: 'cotton_plantation',
        name: 'Cotton Plantation',
        acres: 200,
        soilQuality: 'rich',
        cropCapacity: 80,
        yieldBonus: 35,
      },
      {
        id: 'tobacco_fields',
        name: 'Tobacco Fields',
        acres: 150,
        soilQuality: 'rich',
        cropCapacity: 60,
        yieldBonus: 40,
      },
      {
        id: 'grain_section',
        name: 'Grain Section',
        acres: 150,
        soilQuality: 'good',
        cropCapacity: 60,
        yieldBonus: 30,
      },
      {
        id: 'vegetable_production',
        name: 'Vegetable Production',
        acres: 80,
        soilQuality: 'rich',
        cropCapacity: 40,
        yieldBonus: 35,
      },
    ],
    waterSource: {
      type: WaterSourceType.RIVER,
      reliability: 'excellent',
      costReduction: 65,
    },
    maxLivestock: 0,
    maxCrops: 240,
    maxWorkers: 15,
    storageCapacity: 800,
    livestockYieldBonus: 0,
    cropYieldBonus: 40,
    breedingSuccessBonus: 0,
    levelRequirement: 22,
    reputationRequirement: {
      faction: 'settler',
      amount: 2500,
    },
    specialFeatures: [
      'industrial_agriculture',
      'export_operations',
      'advanced_irrigation',
      'massive_production',
      'crop_diversity',
      'year_round_growing',
    ],
    availableUpgrades: [RanchBuildingType.TANNERY, RanchBuildingType.WINDMILL],
    uniqueProducts: ['export_cotton', 'premium_tobacco', 'bulk_grain', 'contract_vegetables'],
    purchaseSource: PurchaseSource.NPC_DIRECT,
    condition: 96,
  },
];

/**
 * HUGE RANCHES - Legendary properties
 */
export const HUGE_RANCHES: RanchProperty[] = [
  {
    id: 'ranch_the_empire',
    name: 'The Empire',
    description:
      'A legendary cattle empire spanning 1000 acres. The Empire has been the benchmark for ranching excellence for thirty years. Owning this property puts you among the most powerful ranchers in the West. Complete with private river access, multiple operations, and a workforce of dozens.',
    locationId: 'longhorn_ranch',
    locationName: 'Longhorn Ranch Area',
    propertyType: PropertyType.RANCH,
    size: PropertySize.HUGE,
    tier: 5,
    basePrice: 35000,
    weeklyTax: 350,
    weeklyUpkeep: 250,
    acres: 1000,
    buildings: [
      RanchBuildingType.BARN,
      RanchBuildingType.STABLE,
      RanchBuildingType.BREEDING_PEN,
      RanchBuildingType.TRAINING_RING,
      RanchBuildingType.SMOKEHOUSE,
      RanchBuildingType.TANNERY,
      RanchBuildingType.DAIRY_SHED,
      RanchBuildingType.FEED_STORAGE,
      RanchBuildingType.SILO,
      RanchBuildingType.WELL,
      RanchBuildingType.WATER_TOWER,
      RanchBuildingType.WINDMILL,
      RanchBuildingType.FENCING,
      RanchBuildingType.IRRIGATION,
      RanchBuildingType.FARMHOUSE,
      RanchBuildingType.BUNKHOUSE,
    ],
    pastures: [
      {
        id: 'north_empire_range',
        name: 'North Empire Range',
        acres: 250,
        quality: 'excellent',
        capacity: 150,
        grazingBonus: 35,
      },
      {
        id: 'south_empire_range',
        name: 'South Empire Range',
        acres: 250,
        quality: 'excellent',
        capacity: 150,
        grazingBonus: 35,
      },
      {
        id: 'breeding_valley',
        name: 'Breeding Valley',
        acres: 150,
        quality: 'excellent',
        capacity: 100,
        grazingBonus: 40,
      },
      {
        id: 'horse_pastures',
        name: 'Horse Pastures',
        acres: 100,
        quality: 'excellent',
        capacity: 60,
        grazingBonus: 35,
      },
    ],
    cropFields: [
      {
        id: 'feed_operation',
        name: 'Feed Operation',
        acres: 200,
        soilQuality: 'good',
        cropCapacity: 80,
        yieldBonus: 35,
      },
    ],
    waterSource: {
      type: WaterSourceType.RIVER,
      reliability: 'excellent',
      costReduction: 75,
    },
    maxLivestock: 460,
    maxCrops: 80,
    maxWorkers: 25,
    storageCapacity: 1200,
    livestockYieldBonus: 50,
    cropYieldBonus: 35,
    breedingSuccessBonus: 50,
    levelRequirement: 25,
    reputationRequirement: {
      faction: 'settler',
      amount: 5000,
    },
    specialFeatures: [
      'legendary_operation',
      'cattle_empire',
      'horse_breeding',
      'vertical_integration',
      'processing_facilities',
      'private_river',
      'established_dynasty',
      'territory_influence',
    ],
    availableUpgrades: [RanchBuildingType.GREENHOUSE, RanchBuildingType.ROOT_CELLAR],
    uniqueProducts: [
      'empire_beef',
      'premium_leather_goods',
      'smoked_meats',
      'champion_horses',
      'breeding_empire_stock',
      'dairy_products',
    ],
    purchaseSource: PurchaseSource.AUCTION,
    condition: 98,
  },
  {
    id: 'ranch_frontier_dynasty',
    name: 'Frontier Dynasty',
    description:
      'The ultimate frontier property. 1200 acres of the finest land in the territory, combining cattle, horses, crops, and every conceivable ranch operation. Built by the founding families, this property represents the pinnacle of western ranching. Owning Frontier Dynasty means you\'ve truly conquered the frontier.',
    locationId: 'longhorn_ranch',
    locationName: 'Longhorn Ranch Area',
    propertyType: PropertyType.RANCH,
    size: PropertySize.HUGE,
    tier: 5,
    basePrice: 50000,
    weeklyTax: 450,
    weeklyUpkeep: 300,
    acres: 1200,
    buildings: [
      RanchBuildingType.BARN,
      RanchBuildingType.STABLE,
      RanchBuildingType.BREEDING_PEN,
      RanchBuildingType.TRAINING_RING,
      RanchBuildingType.CHICKEN_COOP,
      RanchBuildingType.PIG_PEN,
      RanchBuildingType.SHEEP_PEN,
      RanchBuildingType.SMOKEHOUSE,
      RanchBuildingType.TANNERY,
      RanchBuildingType.DAIRY_SHED,
      RanchBuildingType.DRYING_SHED,
      RanchBuildingType.GREENHOUSE,
      RanchBuildingType.FEED_STORAGE,
      RanchBuildingType.SILO,
      RanchBuildingType.ROOT_CELLAR,
      RanchBuildingType.WELL,
      RanchBuildingType.WATER_TOWER,
      RanchBuildingType.WINDMILL,
      RanchBuildingType.FENCING,
      RanchBuildingType.IRRIGATION,
      RanchBuildingType.TOOL_SHED,
      RanchBuildingType.FARMHOUSE,
      RanchBuildingType.BUNKHOUSE,
    ],
    pastures: [
      {
        id: 'dynasty_cattle_range',
        name: 'Dynasty Cattle Range',
        acres: 350,
        quality: 'excellent',
        capacity: 200,
        grazingBonus: 40,
      },
      {
        id: 'dynasty_horse_range',
        name: 'Dynasty Horse Range',
        acres: 200,
        quality: 'excellent',
        capacity: 100,
        grazingBonus: 40,
      },
      {
        id: 'breeding_empire',
        name: 'Breeding Empire',
        acres: 150,
        quality: 'excellent',
        capacity: 100,
        grazingBonus: 45,
      },
      {
        id: 'mixed_livestock',
        name: 'Mixed Livestock Area',
        acres: 100,
        quality: 'excellent',
        capacity: 150,
        grazingBonus: 35,
      },
    ],
    cropFields: [
      {
        id: 'dynasty_cotton',
        name: 'Dynasty Cotton Fields',
        acres: 150,
        soilQuality: 'rich',
        cropCapacity: 60,
        yieldBonus: 40,
      },
      {
        id: 'dynasty_grain',
        name: 'Dynasty Grain Fields',
        acres: 150,
        soilQuality: 'good',
        cropCapacity: 60,
        yieldBonus: 35,
      },
      {
        id: 'dynasty_vegetables',
        name: 'Dynasty Gardens',
        acres: 80,
        soilQuality: 'rich',
        cropCapacity: 40,
        yieldBonus: 40,
      },
    ],
    waterSource: {
      type: WaterSourceType.LAKE,
      reliability: 'excellent',
      costReduction: 80,
    },
    maxLivestock: 550,
    maxCrops: 160,
    maxWorkers: 35,
    storageCapacity: 2000,
    livestockYieldBonus: 55,
    cropYieldBonus: 45,
    breedingSuccessBonus: 55,
    levelRequirement: 30,
    reputationRequirement: {
      faction: 'settler',
      amount: 10000,
    },
    specialFeatures: [
      'ultimate_ranch',
      'complete_operations',
      'dynasty_legacy',
      'territory_landmark',
      'founding_family_property',
      'lake_access',
      'self_sufficient',
      'maximum_diversity',
      'legendary_status',
    ],
    availableUpgrades: [],
    uniqueProducts: [
      'dynasty_beef',
      'dynasty_horses',
      'premium_leather',
      'smoked_delicacies',
      'aged_meats',
      'export_crops',
      'artisan_dairy',
      'specialty_wool',
      'heritage_products',
    ],
    purchaseSource: PurchaseSource.QUEST_REWARD,
    condition: 100,
  },
];

/**
 * All ranch properties
 */
export const ALL_RANCHES: RanchProperty[] = [
  ...SMALL_RANCHES,
  ...MEDIUM_RANCHES,
  ...LARGE_RANCHES,
  ...HUGE_RANCHES,
];

/**
 * Get ranch by ID
 */
export function getRanchById(id: string): RanchProperty | undefined {
  return ALL_RANCHES.find((r) => r.id === id);
}

/**
 * Get ranches by location
 */
export function getRanchesByLocation(locationId: string): RanchProperty[] {
  return ALL_RANCHES.filter((r) => r.locationId === locationId);
}

/**
 * Get ranches by size
 */
export function getRanchesBySize(size: PropertySize): RanchProperty[] {
  return ALL_RANCHES.filter((r) => r.size === size);
}

/**
 * Get ranches by tier
 */
export function getRanchesByTier(tier: PropertyTier): RanchProperty[] {
  return ALL_RANCHES.filter((r) => r.tier === tier);
}

/**
 * Get ranches by price range
 */
export function getRanchesByPriceRange(minPrice: number, maxPrice: number): RanchProperty[] {
  return ALL_RANCHES.filter((r) => r.basePrice >= minPrice && r.basePrice <= maxPrice);
}

/**
 * Get ranches available at level
 */
export function getRanchesByLevel(level: number): RanchProperty[] {
  return ALL_RANCHES.filter((r) => r.levelRequirement <= level);
}

/**
 * Get ranches with specific feature
 */
export function getRanchesWithFeature(feature: string): RanchProperty[] {
  return ALL_RANCHES.filter((r) => r.specialFeatures.includes(feature));
}
