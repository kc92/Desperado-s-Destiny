/**
 * Mine Property Definitions
 *
 * Wilderness mines for ore extraction
 * Phase 8, Wave 8.2 - Wilderness Properties (Homesteads & Mines)
 */

import type { PropertySize } from '@desperados/shared';
import type { RareOreSpawn } from './oreTypes';

/**
 * Primary ore types (most common in mine)
 */
export type PrimaryOreType =
  | 'iron'
  | 'copper'
  | 'coal'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'turquoise'
  | 'salt';

/**
 * Secondary ore types (less common)
 */
export type SecondaryOreType =
  | 'iron'
  | 'copper'
  | 'limestone'
  | 'salt'
  | 'turquoise'
  | 'silver'
  | 'obsidian';

/**
 * Mine property definition
 */
export interface MineProperty {
  id: string;
  name: string;
  description: string;
  locationId: string;
  locationName: string;
  size: PropertySize;

  // Pricing
  basePrice: number;
  weeklyTax: number;
  weeklyUpkeep: number;

  // Mining
  primaryOre: PrimaryOreType;
  secondaryOre?: SecondaryOreType;
  rareSpawns: RareOreSpawn[];
  oreQuality: number; // 1-10
  estimatedDeposits: number; // Tons remaining
  depletionRate: number; // Tons per week with full operation

  // Operations
  shafts: number;
  depth: number; // Maximum depth in feet
  mineCarCapacity: number; // Ore units per load
  processingFacility: boolean;

  // Workers
  maxMiners: number;
  dangerLevel: number; // 1-10, affects wages and accidents

  // Special
  cursed?: boolean;
  haunted?: boolean;
  caveInRisk: number; // 1-10
  floodRisk: number; // 1-10
  gasRisk?: number; // 1-10 for coal mines

  // Requirements
  levelRequirement: number;
  factionRequirement?: string;

  specialFeatures: string[];
}

/**
 * All mine properties
 */
export const MINES: Record<string, MineProperty> = {
  // ======================
  // PROSPECTOR CLAIMS (Small mines)
  // ======================

  lucky_strike_claim: {
    id: 'lucky_strike_claim',
    name: 'Lucky Strike Claim',
    description:
      'Small gold panning claim along a creek near Goldfinger\'s operation. Perfect for beginners. Just pan the creek bed and sift for nuggets. Previous owner made a modest living.',
    locationId: 'goldfingers_creek',
    locationName: "Goldfinger's Creek",
    size: 'small' as PropertySize,

    basePrice: 800,
    weeklyTax: 10,
    weeklyUpkeep: 5,

    primaryOre: 'gold',
    secondaryOre: 'copper',
    rareSpawns: [
      {
        oreId: 'silver',
        spawnChance: 15,
        minQuantity: 1,
        maxQuantity: 3,
      },
    ],
    oreQuality: 5,
    estimatedDeposits: 50,
    depletionRate: 2,

    shafts: 1,
    depth: 20,
    mineCarCapacity: 10,
    processingFacility: false,

    maxMiners: 2,
    dangerLevel: 2,

    caveInRisk: 1,
    floodRisk: 4,

    levelRequirement: 8,

    specialFeatures: [
      'Creek panning',
      'Easy gold access',
      'Low danger',
      'Near Goldfinger for advice',
    ],
  },

  copper_creek_dig: {
    id: 'copper_creek_dig',
    name: 'Copper Creek Dig',
    description:
      'Small copper mine with consistent deposits. Copper is always in demand for bullets and wire. Steady income if you work it.',
    locationId: 'western_hills',
    locationName: 'Western Hills',
    size: 'small' as PropertySize,

    basePrice: 700,
    weeklyTax: 8,
    weeklyUpkeep: 6,

    primaryOre: 'copper',
    secondaryOre: 'iron',
    rareSpawns: [
      {
        oreId: 'turquoise',
        spawnChance: 10,
        minQuantity: 1,
        maxQuantity: 2,
      },
    ],
    oreQuality: 6,
    estimatedDeposits: 100,
    depletionRate: 3,

    shafts: 2,
    depth: 40,
    mineCarCapacity: 15,
    processingFacility: false,

    maxMiners: 3,
    dangerLevel: 3,

    caveInRisk: 3,
    floodRisk: 2,

    levelRequirement: 6,

    specialFeatures: ['High market demand', 'Multiple veins', 'Near ammunition factories'],
  },

  silver_gulch: {
    id: 'silver_gulch',
    name: 'Silver Gulch',
    description:
      'Silver vein discovered in a narrow gulch. The Coalition considers silver sacred for its power against evil spirits. This claim grants permission to mine in their territory.',
    locationId: 'coalition_foothills',
    locationName: 'Coalition Foothills',
    size: 'small' as PropertySize,

    basePrice: 1200,
    weeklyTax: 12,
    weeklyUpkeep: 8,

    primaryOre: 'silver',
    secondaryOre: 'turquoise',
    rareSpawns: [
      {
        oreId: 'obsidian',
        spawnChance: 8,
        minQuantity: 1,
        maxQuantity: 2,
      },
      {
        oreId: 'gold',
        spawnChance: 5,
        minQuantity: 1,
        maxQuantity: 1,
      },
    ],
    oreQuality: 7,
    estimatedDeposits: 75,
    depletionRate: 2,

    shafts: 1,
    depth: 50,
    mineCarCapacity: 12,
    processingFacility: false,

    maxMiners: 3,
    dangerLevel: 4,

    haunted: true,
    caveInRisk: 4,
    floodRisk: 3,

    levelRequirement: 10,
    factionRequirement: 'Nahi Coalition (Friendly+)',

    specialFeatures: [
      'Sacred silver',
      'Coalition blessing',
      'Silver bullet crafting',
      'Spirit protection',
    ],
  },

  coal_hollow: {
    id: 'coal_hollow',
    name: 'Coal Hollow',
    description:
      'Coal mining claim in the northern hills. Dangerous work with gas risks, but coal is desperately needed for locomotives and forges. High demand, high danger.',
    locationId: 'northern_coal_region',
    locationName: 'Northern Coal Fields',
    size: 'small' as PropertySize,

    basePrice: 600,
    weeklyTax: 7,
    weeklyUpkeep: 10,

    primaryOre: 'coal',
    secondaryOre: 'iron',
    rareSpawns: [
      {
        oreId: 'diamond',
        spawnChance: 1,
        minQuantity: 1,
        maxQuantity: 1,
        requiresDepth: 100,
      },
    ],
    oreQuality: 5,
    estimatedDeposits: 200,
    depletionRate: 5,

    shafts: 2,
    depth: 80,
    mineCarCapacity: 25,
    processingFacility: false,

    maxMiners: 4,
    dangerLevel: 7,

    caveInRisk: 5,
    floodRisk: 3,
    gasRisk: 8,

    levelRequirement: 8,

    specialFeatures: [
      'High volume',
      'Railroad contracts available',
      'Explosive powder component',
      'Consistent demand',
    ],
  },

  // ======================
  // ESTABLISHED MINES (Medium mines)
  // ======================

  the_bonanza_mine: {
    id: 'the_bonanza_mine',
    name: 'The Bonanza Mine',
    description:
      'Medium-sized gold mine that lived up to its name in the past. The easy gold is gone, but experienced miners know there\'s still plenty down deeper. Includes a small processing mill.',
    locationId: 'goldfinger_district',
    locationName: 'Goldfinger Mining District',
    size: 'medium' as PropertySize,

    basePrice: 3000,
    weeklyTax: 25,
    weeklyUpkeep: 20,

    primaryOre: 'gold',
    secondaryOre: 'silver',
    rareSpawns: [
      {
        oreId: 'platinum',
        spawnChance: 8,
        minQuantity: 1,
        maxQuantity: 2,
        requiresDepth: 150,
      },
      {
        oreId: 'ruby',
        spawnChance: 3,
        minQuantity: 1,
        maxQuantity: 1,
        requiresDepth: 200,
      },
    ],
    oreQuality: 8,
    estimatedDeposits: 300,
    depletionRate: 5,

    shafts: 4,
    depth: 200,
    mineCarCapacity: 30,
    processingFacility: true,

    maxMiners: 8,
    dangerLevel: 5,

    caveInRisk: 5,
    floodRisk: 4,

    levelRequirement: 15,

    specialFeatures: [
      'Processing mill included',
      'Multiple shafts',
      'Deep veins',
      'Historic gold rush site',
      'Experienced miners available',
    ],
  },

  iron_mountain: {
    id: 'iron_mountain',
    name: 'Iron Mountain',
    description:
      'Massive iron ore deposit inside a mountain. Low value per unit but enormous quantities. Perfect for those who prefer volume over rarity. Railroad companies pay top dollar.',
    locationId: 'iron_range',
    locationName: 'Iron Mountain Range',
    size: 'medium' as PropertySize,

    basePrice: 2500,
    weeklyTax: 20,
    weeklyUpkeep: 18,

    primaryOre: 'iron',
    secondaryOre: 'limestone',
    rareSpawns: [
      {
        oreId: 'meteorite',
        spawnChance: 2,
        minQuantity: 1,
        maxQuantity: 1,
        requiresDepth: 250,
      },
    ],
    oreQuality: 7,
    estimatedDeposits: 1000,
    depletionRate: 10,

    shafts: 5,
    depth: 300,
    mineCarCapacity: 50,
    processingFacility: true,

    maxMiners: 10,
    dangerLevel: 4,

    caveInRisk: 4,
    floodRisk: 2,

    levelRequirement: 12,

    specialFeatures: [
      'Huge deposits',
      'Railroad contracts',
      'High volume potential',
      'On-site smelter',
      'Direct shipping access',
    ],
  },

  the_silver_lady: {
    id: 'the_silver_lady',
    name: 'The Silver Lady',
    description:
      'Quality silver mine named for a mysterious woman who appears in the deepest shafts. Miners report she points to rich veins, but some who follow her never return.',
    locationId: 'silver_peaks',
    locationName: 'Silver Peaks',
    size: 'medium' as PropertySize,

    basePrice: 3500,
    weeklyTax: 28,
    weeklyUpkeep: 22,

    primaryOre: 'silver',
    secondaryOre: 'turquoise',
    rareSpawns: [
      {
        oreId: 'sapphire',
        spawnChance: 6,
        minQuantity: 1,
        maxQuantity: 2,
        requiresDepth: 180,
      },
      {
        oreId: 'obsidian',
        spawnChance: 15,
        minQuantity: 2,
        maxQuantity: 5,
      },
      {
        oreId: 'soulstone',
        spawnChance: 1,
        minQuantity: 1,
        maxQuantity: 1,
        requiresDepth: 300,
      },
    ],
    oreQuality: 9,
    estimatedDeposits: 250,
    depletionRate: 4,

    shafts: 4,
    depth: 350,
    mineCarCapacity: 25,
    processingFacility: true,

    maxMiners: 8,
    dangerLevel: 7,

    haunted: true,
    caveInRisk: 6,
    floodRisk: 3,

    levelRequirement: 18,

    specialFeatures: [
      'The Silver Lady ghost',
      'High quality silver',
      'Supernatural guidance',
      'Deep gemstone deposits',
      'Cursed tools work better',
    ],
  },

  gemstone_caverns: {
    id: 'gemstone_caverns',
    name: 'Gemstone Caverns',
    description:
      'Natural cave system filled with crystalline formations. Not traditional mining - you carefully extract gems from living rock. Requires delicate work but the rewards are precious.',
    locationId: 'crystal_canyons',
    locationName: 'Crystal Canyons',
    size: 'medium' as PropertySize,

    basePrice: 4000,
    weeklyTax: 30,
    weeklyUpkeep: 25,

    primaryOre: 'turquoise',
    secondaryOre: 'obsidian',
    rareSpawns: [
      {
        oreId: 'ruby',
        spawnChance: 12,
        minQuantity: 1,
        maxQuantity: 3,
      },
      {
        oreId: 'emerald',
        spawnChance: 12,
        minQuantity: 1,
        maxQuantity: 3,
      },
      {
        oreId: 'sapphire',
        spawnChance: 12,
        minQuantity: 1,
        maxQuantity: 3,
      },
      {
        oreId: 'diamond',
        spawnChance: 4,
        minQuantity: 1,
        maxQuantity: 1,
        requiresDepth: 200,
      },
    ],
    oreQuality: 9,
    estimatedDeposits: 150,
    depletionRate: 2,

    shafts: 3,
    depth: 250,
    mineCarCapacity: 15,
    processingFacility: true,

    maxMiners: 6,
    dangerLevel: 6,

    caveInRisk: 7,
    floodRisk: 2,

    levelRequirement: 20,
    factionRequirement: 'Nahi Coalition (Honored+)',

    specialFeatures: [
      'Living crystal formations',
      'Multiple gem types',
      'Beautiful caverns',
      'Sacred to Coalition',
      'Meditation chambers',
      'Resonating crystals',
    ],
  },

  // ======================
  // INDUSTRIAL MINES (Large mines)
  // ======================

  the_mother_lode: {
    id: 'the_mother_lode',
    name: 'The Mother Lode',
    description:
      'Legendary gold mine that sparked the original gold rush. Massive operation with rail systems, processing facilities, and hundreds of feet of tunnels. Previous company bankrupted by labor disputes. Now available for a fraction of its value.',
    locationId: 'central_mining_district',
    locationName: 'Central Mining District',
    size: 'large' as PropertySize,

    basePrice: 10000,
    weeklyTax: 60,
    weeklyUpkeep: 50,

    primaryOre: 'gold',
    secondaryOre: 'silver',
    rareSpawns: [
      {
        oreId: 'platinum',
        spawnChance: 15,
        minQuantity: 2,
        maxQuantity: 5,
        requiresDepth: 200,
      },
      {
        oreId: 'ruby',
        spawnChance: 8,
        minQuantity: 1,
        maxQuantity: 3,
        requiresDepth: 300,
      },
      {
        oreId: 'diamond',
        spawnChance: 5,
        minQuantity: 1,
        maxQuantity: 2,
        requiresDepth: 400,
      },
    ],
    oreQuality: 10,
    estimatedDeposits: 800,
    depletionRate: 10,

    shafts: 10,
    depth: 500,
    mineCarCapacity: 100,
    processingFacility: true,

    maxMiners: 20,
    dangerLevel: 6,

    caveInRisk: 5,
    floodRisk: 6,

    levelRequirement: 30,

    specialFeatures: [
      'Industrial scale operation',
      'Rail system installed',
      'Full processing plant',
      'Worker barracks',
      'Proven massive deposits',
      'Company store',
      'Direct bank access',
      'Historic landmark',
    ],
  },

  titans_quarry: {
    id: 'titans_quarry',
    name: "Titan's Quarry",
    description:
      'Massive open-pit mine near The Wastes. Extracts everything - iron, copper, coal, and occasionally something that shouldn\'t exist. The cursed earth here yields dark ores alongside normal ones. Extremely dangerous but incredibly profitable.',
    locationId: 'wastes_edge',
    locationName: 'Edge of The Wastes',
    size: 'large' as PropertySize,

    basePrice: 8000,
    weeklyTax: 40,
    weeklyUpkeep: 60,

    primaryOre: 'iron',
    secondaryOre: 'copper',
    rareSpawns: [
      {
        oreId: 'coal',
        spawnChance: 40,
        minQuantity: 10,
        maxQuantity: 20,
      },
      {
        oreId: 'meteorite',
        spawnChance: 10,
        minQuantity: 1,
        maxQuantity: 3,
        requiresDepth: 100,
      },
      {
        oreId: 'bloodstone',
        spawnChance: 15,
        minQuantity: 1,
        maxQuantity: 3,
        requiresDepth: 200,
      },
      {
        oreId: 'soulstone',
        spawnChance: 5,
        minQuantity: 1,
        maxQuantity: 2,
        requiresDepth: 300,
      },
      {
        oreId: 'obsidian',
        spawnChance: 25,
        minQuantity: 5,
        maxQuantity: 10,
      },
    ],
    oreQuality: 6,
    estimatedDeposits: 2000,
    depletionRate: 20,

    shafts: 8,
    depth: 400,
    mineCarCapacity: 150,
    processingFacility: true,

    maxMiners: 25,
    dangerLevel: 10,

    cursed: true,
    haunted: true,
    caveInRisk: 8,
    floodRisk: 4,

    levelRequirement: 35,
    factionRequirement: 'Blood Pact (Neutral+) or Reputation: Fearless',

    specialFeatures: [
      'Open-pit mining',
      'Supernatural ore deposits',
      'Cursed ground bonus',
      'Dark magic reagents',
      'Massive scale',
      'Explosives depot',
      'Night work required',
      'Spirit encounters common',
      'Previous owners all died mysteriously',
      'Whispers in the deep',
    ],
  },
};

/**
 * Get mine by ID
 */
export function getMine(mineId: string): MineProperty | undefined {
  return MINES[mineId];
}

/**
 * Get mines by size
 */
export function getMinesBySize(size: PropertySize): MineProperty[] {
  return Object.values(MINES).filter((mine) => mine.size === size);
}

/**
 * Get mines by primary ore type
 */
export function getMinesByOre(oreType: PrimaryOreType): MineProperty[] {
  return Object.values(MINES).filter((mine) => mine.primaryOre === oreType);
}

/**
 * Get mines available for level
 */
export function getAvailableMines(characterLevel: number): MineProperty[] {
  return Object.values(MINES).filter((mine) => mine.levelRequirement <= characterLevel);
}

/**
 * Get haunted or cursed mines
 */
export function getSupernaturalMines(): MineProperty[] {
  return Object.values(MINES).filter((mine) => mine.haunted || mine.cursed);
}

/**
 * Calculate mine danger level (total)
 */
export function calculateTotalDanger(mine: MineProperty): number {
  let danger = mine.dangerLevel;
  danger += Math.floor(mine.caveInRisk / 2);
  danger += Math.floor(mine.floodRisk / 2);
  if (mine.gasRisk) danger += Math.floor(mine.gasRisk / 2);
  if (mine.cursed) danger += 3;
  if (mine.haunted) danger += 2;
  return Math.min(danger, 10);
}

/**
 * Calculate weekly ore production estimate
 */
export function estimateWeeklyProduction(
  mine: MineProperty,
  minersWorking: number,
  upgrades: number = 0
): { primary: number; secondary: number } {
  const efficiency = Math.min(minersWorking / mine.maxMiners, 1);
  const upgradeBonus = 1 + upgrades * 0.1;

  const primary = Math.floor(mine.depletionRate * efficiency * upgradeBonus * mine.oreQuality * 0.5);

  const secondary = mine.secondaryOre
    ? Math.floor(primary * 0.3)
    : 0;

  return { primary, secondary };
}

/**
 * Calculate mine value (for purchase/sale/foreclosure)
 */
export function calculateMineValue(
  mineId: string,
  remainingDeposits: number,
  condition: number = 100
): number {
  const mine = getMine(mineId);
  if (!mine) return 0;

  const depositRatio = remainingDeposits / mine.estimatedDeposits;
  const conditionMultiplier = condition / 100;

  return Math.floor(mine.basePrice * depositRatio * conditionMultiplier);
}

/**
 * Get recommended miner wage for danger level
 */
export function getRecommendedMinerWage(mine: MineProperty): number {
  const baseDailyWage = 12; // Base from property.types
  const dangerMultiplier = 1 + mine.dangerLevel * 0.1;
  const cursedMultiplier = mine.cursed ? 1.5 : 1;
  const hauntedMultiplier = mine.haunted ? 1.3 : 1;

  return Math.floor(baseDailyWage * dangerMultiplier * cursedMultiplier * hauntedMultiplier);
}
