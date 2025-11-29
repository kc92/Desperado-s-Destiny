/**
 * Ranch Building Definitions
 *
 * Building upgrades and structures for ranch properties
 * Phase 8, Wave 8.2 - Ranch Properties
 */

import { UpgradeCategory, PropertyType } from '@desperados/shared';

/**
 * Ranch building types
 */
export enum RanchBuildingType {
  // Livestock buildings
  BARN = 'barn',
  STABLE = 'stable',
  CHICKEN_COOP = 'chicken_coop',
  PIG_PEN = 'pig_pen',
  SHEEP_PEN = 'sheep_pen',

  // Storage buildings
  SILO = 'silo',
  FEED_STORAGE = 'feed_storage',
  SMOKEHOUSE = 'smokehouse',
  ROOT_CELLAR = 'root_cellar',

  // Production buildings
  DAIRY_SHED = 'dairy_shed',
  TANNERY = 'tannery',
  DRYING_SHED = 'drying_shed',

  // Infrastructure
  WELL = 'well',
  WATER_TOWER = 'water_tower',
  WINDMILL = 'windmill',
  FENCING = 'fencing',
  IRRIGATION = 'irrigation',

  // Crop buildings
  GREENHOUSE = 'greenhouse',
  TOOL_SHED = 'tool_shed',

  // Worker buildings
  FARMHOUSE = 'farmhouse',
  BUNKHOUSE = 'bunkhouse',

  // Special
  BREEDING_PEN = 'breeding_pen',
  TRAINING_RING = 'training_ring',
}

/**
 * Ranch building definition
 */
export interface RanchBuildingDefinition {
  buildingId: string;
  name: string;
  type: RanchBuildingType;
  category: UpgradeCategory;
  description: string;

  // Costs
  baseCost: number;
  upgradeCost: number; // Cost to upgrade to next level
  maintenanceCost: number; // Weekly

  // Requirements
  minLevel: number;
  requiredBuildings?: RanchBuildingType[];
  minPropertySize: 'small' | 'medium' | 'large' | 'huge';

  // Upgrades
  maxLevel: number;
  canUpgrade: boolean;

  // Benefits per level
  benefits: BuildingBenefit[];

  // Capacity
  capacityIncrease?: number;
  storageIncrease?: number;
  workerSlots?: number;

  // Build time
  buildTime: number; // Hours

  // Special features
  specialFeatures: string[];

  // Property types
  propertyTypes: PropertyType[];
}

/**
 * Building benefit per level
 */
export interface BuildingBenefit {
  level: number;
  description: string;
  effect: BuildingEffect;
}

/**
 * Building effect
 */
export interface BuildingEffect {
  type:
    | 'livestock_capacity'
    | 'crop_capacity'
    | 'storage'
    | 'production_speed'
    | 'production_quality'
    | 'breeding_success'
    | 'feed_efficiency'
    | 'water_cost_reduction'
    | 'disease_resistance'
    | 'worker_capacity'
    | 'special';
  value: number;
  unit: 'flat' | 'percentage' | 'multiplier';
}

/**
 * Livestock building definitions
 */
export const LIVESTOCK_BUILDINGS: RanchBuildingDefinition[] = [
  {
    buildingId: 'barn',
    name: 'Barn',
    type: RanchBuildingType.BARN,
    category: UpgradeCategory.CAPACITY,
    description: 'Large barn for housing cattle and large livestock. Protects animals from weather.',
    baseCost: 500,
    upgradeCost: 300,
    maintenanceCost: 10,
    minLevel: 3,
    minPropertySize: 'medium',
    maxLevel: 5,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: 'Houses up to 10 large livestock',
        effect: { type: 'livestock_capacity', value: 10, unit: 'flat' },
      },
      {
        level: 2,
        description: 'Houses up to 20 large livestock, +10% health',
        effect: { type: 'livestock_capacity', value: 20, unit: 'flat' },
      },
      {
        level: 3,
        description: 'Houses up to 35 large livestock, +15% health, +5% production',
        effect: { type: 'livestock_capacity', value: 35, unit: 'flat' },
      },
      {
        level: 4,
        description: 'Houses up to 50 large livestock, +20% health, +10% production',
        effect: { type: 'livestock_capacity', value: 50, unit: 'flat' },
      },
      {
        level: 5,
        description: 'Houses up to 75 large livestock, +25% health, +15% production, disease resistance',
        effect: { type: 'livestock_capacity', value: 75, unit: 'flat' },
      },
    ],
    capacityIncrease: 10,
    buildTime: 48,
    specialFeatures: ['weather_protection', 'disease_resistance', 'production_bonus'],
    propertyTypes: [PropertyType.RANCH],
  },
  {
    buildingId: 'stable',
    name: 'Stable',
    type: RanchBuildingType.STABLE,
    category: UpgradeCategory.CAPACITY,
    description: 'Professional horse stable. Essential for horse breeding and training.',
    baseCost: 600,
    upgradeCost: 400,
    maintenanceCost: 15,
    minLevel: 5,
    minPropertySize: 'medium',
    maxLevel: 5,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: 'Houses up to 5 horses',
        effect: { type: 'livestock_capacity', value: 5, unit: 'flat' },
      },
      {
        level: 2,
        description: 'Houses up to 10 horses, +10% horse health',
        effect: { type: 'livestock_capacity', value: 10, unit: 'flat' },
      },
      {
        level: 3,
        description: 'Houses up to 15 horses, +15% health, +5% breeding success',
        effect: { type: 'livestock_capacity', value: 15, unit: 'flat' },
      },
      {
        level: 4,
        description: 'Houses up to 25 horses, +20% health, +10% breeding success',
        effect: { type: 'livestock_capacity', value: 25, unit: 'flat' },
      },
      {
        level: 5,
        description: 'Houses up to 40 horses, +25% health, +15% breeding success, training bonus',
        effect: { type: 'livestock_capacity', value: 40, unit: 'flat' },
      },
    ],
    capacityIncrease: 5,
    buildTime: 60,
    specialFeatures: ['horse_training', 'breeding_bonus', 'grooming_station'],
    propertyTypes: [PropertyType.RANCH, PropertyType.STABLE],
  },
  {
    buildingId: 'chicken_coop',
    name: 'Chicken Coop',
    type: RanchBuildingType.CHICKEN_COOP,
    category: UpgradeCategory.CAPACITY,
    description: 'Secure chicken coop for egg and poultry production.',
    baseCost: 200,
    upgradeCost: 100,
    maintenanceCost: 5,
    minLevel: 1,
    minPropertySize: 'small',
    maxLevel: 4,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: 'Houses up to 20 chickens',
        effect: { type: 'livestock_capacity', value: 20, unit: 'flat' },
      },
      {
        level: 2,
        description: 'Houses up to 40 chickens, +10% egg production',
        effect: { type: 'livestock_capacity', value: 40, unit: 'flat' },
      },
      {
        level: 3,
        description: 'Houses up to 75 chickens, +15% egg production',
        effect: { type: 'livestock_capacity', value: 75, unit: 'flat' },
      },
      {
        level: 4,
        description: 'Houses up to 125 chickens, +20% egg production, predator protection',
        effect: { type: 'livestock_capacity', value: 125, unit: 'flat' },
      },
    ],
    capacityIncrease: 20,
    buildTime: 24,
    specialFeatures: ['predator_protection', 'nesting_boxes', 'egg_collection'],
    propertyTypes: [PropertyType.RANCH],
  },
  {
    buildingId: 'pig_pen',
    name: 'Pig Pen',
    type: RanchBuildingType.PIG_PEN,
    category: UpgradeCategory.CAPACITY,
    description: 'Enclosed pig pen with wallows and feeding areas.',
    baseCost: 300,
    upgradeCost: 150,
    maintenanceCost: 8,
    minLevel: 3,
    minPropertySize: 'small',
    maxLevel: 4,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: 'Houses up to 10 pigs',
        effect: { type: 'livestock_capacity', value: 10, unit: 'flat' },
      },
      {
        level: 2,
        description: 'Houses up to 20 pigs, +10% growth rate',
        effect: { type: 'livestock_capacity', value: 20, unit: 'flat' },
      },
      {
        level: 3,
        description: 'Houses up to 35 pigs, +15% growth rate, +5% breeding success',
        effect: { type: 'livestock_capacity', value: 35, unit: 'flat' },
      },
      {
        level: 4,
        description: 'Houses up to 60 pigs, +20% growth rate, +10% breeding success',
        effect: { type: 'livestock_capacity', value: 60, unit: 'flat' },
      },
    ],
    capacityIncrease: 10,
    buildTime: 36,
    specialFeatures: ['wallow_area', 'feeding_troughs', 'waste_management'],
    propertyTypes: [PropertyType.RANCH],
  },
  {
    buildingId: 'sheep_pen',
    name: 'Sheep Pen',
    type: RanchBuildingType.SHEEP_PEN,
    category: UpgradeCategory.CAPACITY,
    description: 'Secure grazing pen for sheep with shearing facilities.',
    baseCost: 250,
    upgradeCost: 125,
    maintenanceCost: 6,
    minLevel: 2,
    minPropertySize: 'small',
    maxLevel: 4,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: 'Houses up to 15 sheep',
        effect: { type: 'livestock_capacity', value: 15, unit: 'flat' },
      },
      {
        level: 2,
        description: 'Houses up to 30 sheep, +10% wool production',
        effect: { type: 'livestock_capacity', value: 30, unit: 'flat' },
      },
      {
        level: 3,
        description: 'Houses up to 50 sheep, +15% wool production, +5% wool quality',
        effect: { type: 'livestock_capacity', value: 50, unit: 'flat' },
      },
      {
        level: 4,
        description: 'Houses up to 80 sheep, +20% wool production, +10% wool quality',
        effect: { type: 'livestock_capacity', value: 80, unit: 'flat' },
      },
    ],
    capacityIncrease: 15,
    buildTime: 30,
    specialFeatures: ['shearing_station', 'predator_fence', 'grazing_rotation'],
    propertyTypes: [PropertyType.RANCH],
  },
];

/**
 * Storage building definitions
 */
export const STORAGE_BUILDINGS: RanchBuildingDefinition[] = [
  {
    buildingId: 'silo',
    name: 'Grain Silo',
    type: RanchBuildingType.SILO,
    category: UpgradeCategory.CAPACITY,
    description: 'Tall silo for storing grain and feed crops.',
    baseCost: 400,
    upgradeCost: 200,
    maintenanceCost: 5,
    minLevel: 5,
    minPropertySize: 'medium',
    maxLevel: 3,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: '+100 crop storage capacity',
        effect: { type: 'storage', value: 100, unit: 'flat' },
      },
      {
        level: 2,
        description: '+250 crop storage capacity, prevents spoilage',
        effect: { type: 'storage', value: 250, unit: 'flat' },
      },
      {
        level: 3,
        description: '+500 crop storage capacity, prevents spoilage, automated loading',
        effect: { type: 'storage', value: 500, unit: 'flat' },
      },
    ],
    storageIncrease: 100,
    buildTime: 48,
    specialFeatures: ['spoilage_prevention', 'automated_loading', 'pest_control'],
    propertyTypes: [PropertyType.RANCH],
  },
  {
    buildingId: 'feed_storage',
    name: 'Feed Storage',
    type: RanchBuildingType.FEED_STORAGE,
    category: UpgradeCategory.CAPACITY,
    description: 'Dedicated storage for animal feed. Keeps feed dry and pest-free.',
    baseCost: 300,
    upgradeCost: 150,
    maintenanceCost: 4,
    minLevel: 3,
    requiredBuildings: [RanchBuildingType.BARN],
    minPropertySize: 'medium',
    maxLevel: 3,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: '+75 feed storage, -5% feed costs',
        effect: { type: 'storage', value: 75, unit: 'flat' },
      },
      {
        level: 2,
        description: '+150 feed storage, -10% feed costs',
        effect: { type: 'storage', value: 150, unit: 'flat' },
      },
      {
        level: 3,
        description: '+300 feed storage, -15% feed costs, bulk discount',
        effect: { type: 'storage', value: 300, unit: 'flat' },
      },
    ],
    storageIncrease: 75,
    buildTime: 36,
    specialFeatures: ['feed_efficiency', 'pest_resistance', 'climate_control'],
    propertyTypes: [PropertyType.RANCH],
  },
  {
    buildingId: 'smokehouse',
    name: 'Smokehouse',
    type: RanchBuildingType.SMOKEHOUSE,
    category: UpgradeCategory.SPECIALTY,
    description: 'Smokehouse for preserving and processing meat products.',
    baseCost: 350,
    upgradeCost: 175,
    maintenanceCost: 8,
    minLevel: 5,
    minPropertySize: 'medium',
    maxLevel: 3,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: 'Enables meat processing, +10% meat value',
        effect: { type: 'production_quality', value: 10, unit: 'percentage' },
      },
      {
        level: 2,
        description: '+20% meat value, unlocks smoked products',
        effect: { type: 'production_quality', value: 20, unit: 'percentage' },
      },
      {
        level: 3,
        description: '+30% meat value, premium smoked products, +50 storage',
        effect: { type: 'production_quality', value: 30, unit: 'percentage' },
      },
    ],
    storageIncrease: 25,
    buildTime: 40,
    specialFeatures: ['meat_processing', 'preservation', 'premium_products'],
    propertyTypes: [PropertyType.RANCH],
  },
  {
    buildingId: 'root_cellar',
    name: 'Root Cellar',
    type: RanchBuildingType.ROOT_CELLAR,
    category: UpgradeCategory.CAPACITY,
    description: 'Underground storage for vegetables and perishables.',
    baseCost: 200,
    upgradeCost: 100,
    maintenanceCost: 3,
    minLevel: 2,
    minPropertySize: 'small',
    maxLevel: 3,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: '+50 vegetable storage, prevents spoilage',
        effect: { type: 'storage', value: 50, unit: 'flat' },
      },
      {
        level: 2,
        description: '+100 vegetable storage, extends shelf life',
        effect: { type: 'storage', value: 100, unit: 'flat' },
      },
      {
        level: 3,
        description: '+200 vegetable storage, perfect preservation',
        effect: { type: 'storage', value: 200, unit: 'flat' },
      },
    ],
    storageIncrease: 50,
    buildTime: 24,
    specialFeatures: ['cool_storage', 'humidity_control', 'long_term_storage'],
    propertyTypes: [PropertyType.RANCH],
  },
];

/**
 * Production building definitions
 */
export const PRODUCTION_BUILDINGS: RanchBuildingDefinition[] = [
  {
    buildingId: 'dairy_shed',
    name: 'Dairy Shed',
    type: RanchBuildingType.DAIRY_SHED,
    category: UpgradeCategory.SPECIALTY,
    description: 'Milking facility for dairy production from cattle and goats.',
    baseCost: 450,
    upgradeCost: 225,
    maintenanceCost: 10,
    minLevel: 5,
    requiredBuildings: [RanchBuildingType.BARN],
    minPropertySize: 'medium',
    maxLevel: 3,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: 'Enables dairy production, +15% milk yield',
        effect: { type: 'production_quality', value: 15, unit: 'percentage' },
      },
      {
        level: 2,
        description: '+25% milk yield, unlocks cheese production',
        effect: { type: 'production_quality', value: 25, unit: 'percentage' },
      },
      {
        level: 3,
        description: '+40% milk yield, premium dairy products',
        effect: { type: 'production_quality', value: 40, unit: 'percentage' },
      },
    ],
    buildTime: 48,
    specialFeatures: ['milking_equipment', 'dairy_processing', 'hygiene_facilities'],
    propertyTypes: [PropertyType.RANCH],
  },
  {
    buildingId: 'tannery',
    name: 'Tannery',
    type: RanchBuildingType.TANNERY,
    category: UpgradeCategory.SPECIALTY,
    description: 'Leather processing facility. Converts raw hides to quality leather.',
    baseCost: 500,
    upgradeCost: 250,
    maintenanceCost: 12,
    minLevel: 7,
    minPropertySize: 'medium',
    maxLevel: 3,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: 'Process raw leather, +20% leather value',
        effect: { type: 'production_quality', value: 20, unit: 'percentage' },
      },
      {
        level: 2,
        description: '+35% leather value, quality leather products',
        effect: { type: 'production_quality', value: 35, unit: 'percentage' },
      },
      {
        level: 3,
        description: '+50% leather value, premium leather goods',
        effect: { type: 'production_quality', value: 50, unit: 'percentage' },
      },
    ],
    buildTime: 60,
    specialFeatures: ['leather_processing', 'tanning_racks', 'quality_finishing'],
    propertyTypes: [PropertyType.RANCH],
  },
  {
    buildingId: 'drying_shed',
    name: 'Drying Shed',
    type: RanchBuildingType.DRYING_SHED,
    category: UpgradeCategory.SPECIALTY,
    description: 'Facility for drying tobacco, herbs, and other crops.',
    baseCost: 300,
    upgradeCost: 150,
    maintenanceCost: 6,
    minLevel: 7,
    minPropertySize: 'medium',
    maxLevel: 2,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: 'Enables tobacco processing, +15% value',
        effect: { type: 'production_quality', value: 15, unit: 'percentage' },
      },
      {
        level: 2,
        description: '+30% tobacco value, premium curing',
        effect: { type: 'production_quality', value: 30, unit: 'percentage' },
      },
    ],
    buildTime: 36,
    specialFeatures: ['climate_control', 'curing_racks', 'quality_processing'],
    propertyTypes: [PropertyType.RANCH],
  },
];

/**
 * Infrastructure building definitions
 */
export const INFRASTRUCTURE_BUILDINGS: RanchBuildingDefinition[] = [
  {
    buildingId: 'well',
    name: 'Well',
    type: RanchBuildingType.WELL,
    category: UpgradeCategory.EFFICIENCY,
    description: 'Deep water well. Essential for any ranch operation.',
    baseCost: 250,
    upgradeCost: 125,
    maintenanceCost: 5,
    minLevel: 1,
    minPropertySize: 'small',
    maxLevel: 3,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: 'Provides water, -20% water costs',
        effect: { type: 'water_cost_reduction', value: 20, unit: 'percentage' },
      },
      {
        level: 2,
        description: '-40% water costs, reliable supply',
        effect: { type: 'water_cost_reduction', value: 40, unit: 'percentage' },
      },
      {
        level: 3,
        description: '-60% water costs, deep aquifer access',
        effect: { type: 'water_cost_reduction', value: 60, unit: 'percentage' },
      },
    ],
    buildTime: 48,
    specialFeatures: ['water_source', 'cost_reduction', 'drought_resistance'],
    propertyTypes: [PropertyType.RANCH],
  },
  {
    buildingId: 'water_tower',
    name: 'Water Tower',
    type: RanchBuildingType.WATER_TOWER,
    category: UpgradeCategory.EFFICIENCY,
    description: 'Elevated water storage for consistent water pressure.',
    baseCost: 600,
    upgradeCost: 300,
    maintenanceCost: 8,
    minLevel: 8,
    requiredBuildings: [RanchBuildingType.WELL],
    minPropertySize: 'large',
    maxLevel: 2,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: '-50% water costs, +10% crop yields',
        effect: { type: 'water_cost_reduction', value: 50, unit: 'percentage' },
      },
      {
        level: 2,
        description: '-75% water costs, +20% crop yields, automated irrigation',
        effect: { type: 'water_cost_reduction', value: 75, unit: 'percentage' },
      },
    ],
    buildTime: 72,
    specialFeatures: ['water_pressure', 'automated_distribution', 'large_capacity'],
    propertyTypes: [PropertyType.RANCH],
  },
  {
    buildingId: 'windmill',
    name: 'Windmill',
    type: RanchBuildingType.WINDMILL,
    category: UpgradeCategory.EFFICIENCY,
    description: 'Wind-powered water pump. Reduces operating costs.',
    baseCost: 800,
    upgradeCost: 400,
    maintenanceCost: 15,
    minLevel: 10,
    requiredBuildings: [RanchBuildingType.WELL],
    minPropertySize: 'large',
    maxLevel: 2,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: '-30% upkeep costs, automated water pumping',
        effect: { type: 'special', value: 30, unit: 'percentage' },
      },
      {
        level: 2,
        description: '-50% upkeep costs, grain grinding capability',
        effect: { type: 'special', value: 50, unit: 'percentage' },
      },
    ],
    buildTime: 96,
    specialFeatures: ['automated_pumping', 'cost_reduction', 'grain_processing'],
    propertyTypes: [PropertyType.RANCH],
  },
  {
    buildingId: 'fencing',
    name: 'Quality Fencing',
    type: RanchBuildingType.FENCING,
    category: UpgradeCategory.DEFENSE,
    description: 'Sturdy fencing to keep livestock safe and contained.',
    baseCost: 400,
    upgradeCost: 200,
    maintenanceCost: 6,
    minLevel: 3,
    minPropertySize: 'medium',
    maxLevel: 3,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: 'Basic protection, prevents escapes',
        effect: { type: 'special', value: 10, unit: 'percentage' },
      },
      {
        level: 2,
        description: 'Strong protection, +10% livestock health',
        effect: { type: 'special', value: 20, unit: 'percentage' },
      },
      {
        level: 3,
        description: 'Maximum protection, +20% livestock health, predator defense',
        effect: { type: 'special', value: 30, unit: 'percentage' },
      },
    ],
    buildTime: 36,
    specialFeatures: ['predator_protection', 'escape_prevention', 'pasture_management'],
    propertyTypes: [PropertyType.RANCH],
  },
  {
    buildingId: 'irrigation',
    name: 'Irrigation System',
    type: RanchBuildingType.IRRIGATION,
    category: UpgradeCategory.EFFICIENCY,
    description: 'Comprehensive irrigation for reliable crop watering.',
    baseCost: 700,
    upgradeCost: 350,
    maintenanceCost: 12,
    minLevel: 7,
    requiredBuildings: [RanchBuildingType.WELL],
    minPropertySize: 'medium',
    maxLevel: 3,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: '+15% crop yields, -25% water usage',
        effect: { type: 'production_speed', value: 15, unit: 'percentage' },
      },
      {
        level: 2,
        description: '+25% crop yields, -40% water usage',
        effect: { type: 'production_speed', value: 25, unit: 'percentage' },
      },
      {
        level: 3,
        description: '+40% crop yields, -60% water usage, automated',
        effect: { type: 'production_speed', value: 40, unit: 'percentage' },
      },
    ],
    buildTime: 60,
    specialFeatures: ['efficient_watering', 'automated_system', 'drought_protection'],
    propertyTypes: [PropertyType.RANCH],
  },
];

/**
 * Crop building definitions
 */
export const CROP_BUILDINGS: RanchBuildingDefinition[] = [
  {
    buildingId: 'greenhouse',
    name: 'Greenhouse',
    type: RanchBuildingType.GREENHOUSE,
    category: UpgradeCategory.SPECIALTY,
    description: 'Climate-controlled greenhouse for year-round crop production.',
    baseCost: 900,
    upgradeCost: 450,
    maintenanceCost: 20,
    minLevel: 10,
    minPropertySize: 'large',
    maxLevel: 3,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: 'Year-round crops, +20% yield, unlocks specialty crops',
        effect: { type: 'production_speed', value: 20, unit: 'percentage' },
      },
      {
        level: 2,
        description: '+35% yield, faster growth, +10% quality',
        effect: { type: 'production_speed', value: 35, unit: 'percentage' },
      },
      {
        level: 3,
        description: '+50% yield, optimal growth, +20% quality',
        effect: { type: 'production_speed', value: 50, unit: 'percentage' },
      },
    ],
    buildTime: 96,
    specialFeatures: ['climate_control', 'year_round_growing', 'specialty_crops'],
    propertyTypes: [PropertyType.RANCH],
  },
  {
    buildingId: 'tool_shed',
    name: 'Tool Shed',
    type: RanchBuildingType.TOOL_SHED,
    category: UpgradeCategory.EFFICIENCY,
    description: 'Storage and maintenance for farming equipment.',
    baseCost: 150,
    upgradeCost: 75,
    maintenanceCost: 3,
    minLevel: 2,
    minPropertySize: 'small',
    maxLevel: 3,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: '+10% worker efficiency',
        effect: { type: 'production_speed', value: 10, unit: 'percentage' },
      },
      {
        level: 2,
        description: '+20% worker efficiency, tool repairs',
        effect: { type: 'production_speed', value: 20, unit: 'percentage' },
      },
      {
        level: 3,
        description: '+30% worker efficiency, quality tools',
        effect: { type: 'production_speed', value: 30, unit: 'percentage' },
      },
    ],
    buildTime: 18,
    specialFeatures: ['tool_storage', 'equipment_maintenance', 'efficiency_boost'],
    propertyTypes: [PropertyType.RANCH],
  },
];

/**
 * Worker building definitions
 */
export const WORKER_BUILDINGS: RanchBuildingDefinition[] = [
  {
    buildingId: 'farmhouse',
    name: 'Farmhouse',
    type: RanchBuildingType.FARMHOUSE,
    category: UpgradeCategory.COMFORT,
    description: 'Main residence for the ranch owner and family.',
    baseCost: 800,
    upgradeCost: 400,
    maintenanceCost: 15,
    minLevel: 5,
    minPropertySize: 'medium',
    maxLevel: 4,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: '+1 worker slot, basic living quarters',
        effect: { type: 'worker_capacity', value: 1, unit: 'flat' },
      },
      {
        level: 2,
        description: '+2 worker slots, comfortable quarters',
        effect: { type: 'worker_capacity', value: 2, unit: 'flat' },
      },
      {
        level: 3,
        description: '+3 worker slots, +10% worker morale',
        effect: { type: 'worker_capacity', value: 3, unit: 'flat' },
      },
      {
        level: 4,
        description: '+4 worker slots, +20% worker morale, +10% efficiency',
        effect: { type: 'worker_capacity', value: 4, unit: 'flat' },
      },
    ],
    workerSlots: 1,
    buildTime: 72,
    specialFeatures: ['worker_housing', 'morale_boost', 'efficiency_bonus'],
    propertyTypes: [PropertyType.RANCH],
  },
  {
    buildingId: 'bunkhouse',
    name: 'Bunkhouse',
    type: RanchBuildingType.BUNKHOUSE,
    category: UpgradeCategory.COMFORT,
    description: 'Additional housing for ranch hands and seasonal workers.',
    baseCost: 500,
    upgradeCost: 250,
    maintenanceCost: 10,
    minLevel: 8,
    requiredBuildings: [RanchBuildingType.FARMHOUSE],
    minPropertySize: 'large',
    maxLevel: 3,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: '+3 worker slots',
        effect: { type: 'worker_capacity', value: 3, unit: 'flat' },
      },
      {
        level: 2,
        description: '+5 worker slots, +5% morale',
        effect: { type: 'worker_capacity', value: 5, unit: 'flat' },
      },
      {
        level: 3,
        description: '+8 worker slots, +10% morale, -10% wages',
        effect: { type: 'worker_capacity', value: 8, unit: 'flat' },
      },
    ],
    workerSlots: 3,
    buildTime: 48,
    specialFeatures: ['mass_housing', 'morale_facilities', 'wage_efficiency'],
    propertyTypes: [PropertyType.RANCH],
  },
];

/**
 * Special building definitions
 */
export const SPECIAL_BUILDINGS: RanchBuildingDefinition[] = [
  {
    buildingId: 'breeding_pen',
    name: 'Breeding Pen',
    type: RanchBuildingType.BREEDING_PEN,
    category: UpgradeCategory.SPECIALTY,
    description: 'Specialized facility for livestock breeding programs.',
    baseCost: 1000,
    upgradeCost: 500,
    maintenanceCost: 20,
    minLevel: 10,
    requiredBuildings: [RanchBuildingType.BARN],
    minPropertySize: 'large',
    maxLevel: 3,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: '+15% breeding success, +10% offspring quality',
        effect: { type: 'breeding_success', value: 15, unit: 'percentage' },
      },
      {
        level: 2,
        description: '+25% breeding success, +20% offspring quality, more offspring',
        effect: { type: 'breeding_success', value: 25, unit: 'percentage' },
      },
      {
        level: 3,
        description: '+40% breeding success, +30% offspring quality, rare traits',
        effect: { type: 'breeding_success', value: 40, unit: 'percentage' },
      },
    ],
    buildTime: 96,
    specialFeatures: ['selective_breeding', 'trait_enhancement', 'quality_improvement'],
    propertyTypes: [PropertyType.RANCH, PropertyType.STABLE],
  },
  {
    buildingId: 'training_ring',
    name: 'Training Ring',
    type: RanchBuildingType.TRAINING_RING,
    category: UpgradeCategory.SPECIALTY,
    description: 'Training facility for horses and working animals.',
    baseCost: 700,
    upgradeCost: 350,
    maintenanceCost: 15,
    minLevel: 8,
    requiredBuildings: [RanchBuildingType.STABLE],
    minPropertySize: 'medium',
    maxLevel: 3,
    canUpgrade: true,
    benefits: [
      {
        level: 1,
        description: 'Enables horse training, +20% horse value',
        effect: { type: 'production_quality', value: 20, unit: 'percentage' },
      },
      {
        level: 2,
        description: '+35% horse value, advanced training',
        effect: { type: 'production_quality', value: 35, unit: 'percentage' },
      },
      {
        level: 3,
        description: '+50% horse value, expert training, championship potential',
        effect: { type: 'production_quality', value: 50, unit: 'percentage' },
      },
    ],
    buildTime: 60,
    specialFeatures: ['horse_training', 'value_enhancement', 'skill_development'],
    propertyTypes: [PropertyType.RANCH, PropertyType.STABLE],
  },
];

/**
 * All ranch building definitions
 */
export const ALL_RANCH_BUILDINGS: RanchBuildingDefinition[] = [
  ...LIVESTOCK_BUILDINGS,
  ...STORAGE_BUILDINGS,
  ...PRODUCTION_BUILDINGS,
  ...INFRASTRUCTURE_BUILDINGS,
  ...CROP_BUILDINGS,
  ...WORKER_BUILDINGS,
  ...SPECIAL_BUILDINGS,
];

/**
 * Get building by ID
 */
export function getBuildingById(buildingId: string): RanchBuildingDefinition | undefined {
  return ALL_RANCH_BUILDINGS.find((b) => b.buildingId === buildingId);
}

/**
 * Get buildings by category
 */
export function getBuildingsByCategory(category: UpgradeCategory): RanchBuildingDefinition[] {
  return ALL_RANCH_BUILDINGS.filter((b) => b.category === category);
}

/**
 * Get buildings available at level
 */
export function getBuildingsByLevel(level: number): RanchBuildingDefinition[] {
  return ALL_RANCH_BUILDINGS.filter((b) => b.minLevel <= level);
}

/**
 * Get buildings by type
 */
export function getBuildingsByType(type: RanchBuildingType): RanchBuildingDefinition | undefined {
  return ALL_RANCH_BUILDINGS.find((b) => b.type === type);
}
