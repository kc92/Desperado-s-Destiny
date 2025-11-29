/**
 * Homestead Property Definitions
 *
 * Wilderness homesteads in remote areas
 * Phase 8, Wave 8.2 - Wilderness Properties (Homesteads & Mines)
 */

import type { PropertySize } from '@desperados/shared';

/**
 * Terrain types for homesteads
 */
export enum TerrainType {
  PLAINS = 'plains',
  MOUNTAIN = 'mountain',
  VALLEY = 'valley',
  FOREST = 'forest',
  DESERT = 'desert',
  CANYON = 'canyon',
}

/**
 * Building types on homesteads
 */
export enum HomesteadBuilding {
  CABIN = 'cabin',
  HOUSE = 'house',
  MANOR = 'manor',
  CELLAR = 'cellar',
  WELL = 'well',
  SMOKEHOUSE = 'smokehouse',
  WORKSHOP = 'workshop',
  WATCHTOWER = 'watchtower',
  HIDDEN_CACHE = 'hidden_cache',
  BARN = 'barn',
  STABLE = 'stable',
}

/**
 * Homestead property definition
 */
export interface HomesteadProperty {
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

  // Physical
  acres: number;
  buildings: HomesteadBuilding[];
  terrain: TerrainType;
  waterAccess: boolean;
  defensibility: number; // 1-10

  // Living
  bedrooms: number;
  storage: number;
  energyRegenBonus: number; // +X energy per rest

  // Production
  gardenPlots: number;
  animalPens: number;
  huntingGround: boolean;
  fishingAccess: boolean;

  // Security
  fortificationLevel: number; // 0-10
  hiddenRooms: boolean;
  escapeRoute: boolean;

  // Requirements
  levelRequirement: number;
  factionRequirement?: string;

  // Special
  specialFeatures: string[];
  dangers: string[];
}

/**
 * All homestead properties
 */
export const HOMESTEADS: Record<string, HomesteadProperty> = {
  // ======================
  // SMALL HOMESTEADS
  // ======================

  pioneers_dream: {
    id: 'pioneers_dream',
    name: "Pioneer's Dream",
    description:
      "Basic log cabin with a small plot of land. The first step to claiming your piece of the frontier. Sits in a peaceful valley with clean water nearby.",
    locationId: 'frontier_wilderness_east',
    locationName: 'Eastern Frontier',
    size: 'small' as PropertySize,

    basePrice: 500,
    weeklyTax: 5,
    weeklyUpkeep: 3,

    acres: 10,
    buildings: [HomesteadBuilding.CABIN, HomesteadBuilding.WELL],
    terrain: TerrainType.VALLEY,
    waterAccess: true,
    defensibility: 3,

    bedrooms: 1,
    storage: 100,
    energyRegenBonus: 5,

    gardenPlots: 2,
    animalPens: 1,
    huntingGround: true,
    fishingAccess: false,

    fortificationLevel: 1,
    hiddenRooms: false,
    escapeRoute: false,

    levelRequirement: 5,

    specialFeatures: ['Fresh water spring', 'Fertile soil', 'Sunrise view'],
    dangers: ['Occasional bandits', 'Coyotes'],
  },

  frontier_refuge: {
    id: 'frontier_refuge',
    name: 'Frontier Refuge',
    description:
      'Starter homestead near Spirit Springs. The Nahi Coalition keeps this area relatively safe, making it ideal for new settlers looking to establish themselves.',
    locationId: 'spirit_springs_outskirts',
    locationName: 'Spirit Springs Territory',
    size: 'small' as PropertySize,

    basePrice: 650,
    weeklyTax: 6,
    weeklyUpkeep: 4,

    acres: 15,
    buildings: [HomesteadBuilding.CABIN, HomesteadBuilding.WELL, HomesteadBuilding.CELLAR],
    terrain: TerrainType.PLAINS,
    waterAccess: true,
    defensibility: 4,

    bedrooms: 2,
    storage: 120,
    energyRegenBonus: 6,

    gardenPlots: 3,
    animalPens: 1,
    huntingGround: true,
    fishingAccess: false,

    fortificationLevel: 2,
    hiddenRooms: false,
    escapeRoute: true,

    levelRequirement: 5,
    factionRequirement: 'Nahi Coalition (Neutral+)',

    specialFeatures: ['Coalition protection', 'Trade route access', 'Medicinal herbs'],
    dangers: ['Dust devils', 'Rival settlers'],
  },

  settlers_rest: {
    id: 'settlers_rest',
    name: "Settler's Rest",
    description:
      'Small farmstead in the grasslands between Salvation and Redemption. Good soil and moderate climate make this perfect for growing crops and raising chickens.',
    locationId: 'central_plains',
    locationName: 'Central Plains',
    size: 'small' as PropertySize,

    basePrice: 700,
    weeklyTax: 7,
    weeklyUpkeep: 5,

    acres: 20,
    buildings: [
      HomesteadBuilding.HOUSE,
      HomesteadBuilding.WELL,
      HomesteadBuilding.SMOKEHOUSE,
      HomesteadBuilding.BARN,
    ],
    terrain: TerrainType.PLAINS,
    waterAccess: true,
    defensibility: 3,

    bedrooms: 2,
    storage: 150,
    energyRegenBonus: 7,

    gardenPlots: 5,
    animalPens: 2,
    huntingGround: true,
    fishingAccess: false,

    fortificationLevel: 2,
    hiddenRooms: false,
    escapeRoute: false,

    levelRequirement: 6,

    specialFeatures: ['Excellent farmland', 'Nearby town access', 'Peaceful location'],
    dangers: ['Thunderstorms', 'Prairie fires'],
  },

  wolf_creek_cabin: {
    id: 'wolf_creek_cabin',
    name: 'Wolf Creek Cabin',
    description:
      'Remote hideout deep in the forest. Perfect for those seeking privacy or running from the law. The creek provides fish and the woods provide game, but isolation is complete.',
    locationId: 'northern_woods',
    locationName: 'Northern Wilderness',
    size: 'small' as PropertySize,

    basePrice: 550,
    weeklyTax: 4,
    weeklyUpkeep: 3,

    acres: 12,
    buildings: [HomesteadBuilding.CABIN, HomesteadBuilding.HIDDEN_CACHE],
    terrain: TerrainType.FOREST,
    waterAccess: true,
    defensibility: 6,

    bedrooms: 1,
    storage: 80,
    energyRegenBonus: 8,

    gardenPlots: 1,
    animalPens: 0,
    huntingGround: true,
    fishingAccess: true,

    fortificationLevel: 3,
    hiddenRooms: true,
    escapeRoute: true,

    levelRequirement: 8,

    specialFeatures: ['Complete isolation', 'Natural camouflage', 'Secret entrance', 'Excellent hunting'],
    dangers: ['Wolves', 'Bears', 'Bounty hunters can still find you', 'Harsh winters'],
  },

  // ======================
  // MEDIUM HOMESTEADS
  // ======================

  prosperity_homestead: {
    id: 'prosperity_homestead',
    name: 'Prosperity Homestead',
    description:
      'Well-established homestead with productive land. Previous owner built it up nicely before moving to the city. Includes a sturdy house, workshop, and multiple outbuildings.',
    locationId: 'fertile_valley',
    locationName: 'Fertile Valley',
    size: 'medium' as PropertySize,

    basePrice: 1500,
    weeklyTax: 15,
    weeklyUpkeep: 10,

    acres: 40,
    buildings: [
      HomesteadBuilding.HOUSE,
      HomesteadBuilding.WELL,
      HomesteadBuilding.CELLAR,
      HomesteadBuilding.WORKSHOP,
      HomesteadBuilding.BARN,
      HomesteadBuilding.SMOKEHOUSE,
    ],
    terrain: TerrainType.VALLEY,
    waterAccess: true,
    defensibility: 5,

    bedrooms: 3,
    storage: 300,
    energyRegenBonus: 10,

    gardenPlots: 8,
    animalPens: 4,
    huntingGround: true,
    fishingAccess: true,

    fortificationLevel: 4,
    hiddenRooms: false,
    escapeRoute: false,

    levelRequirement: 12,

    specialFeatures: [
      'Excellent water rights',
      'Established orchards',
      'Workshop for crafting',
      'Near trading post',
    ],
    dangers: ['Land disputes', 'Occasional raiders'],
  },

  thunder_ridge_estate: {
    id: 'thunder_ridge_estate',
    name: 'Thunder Ridge Estate',
    description:
      'Mountain homestead with commanding views of the territory. Built into the cliffside near Kaiowa Mesa. The elevation provides natural defense but the ascent is challenging.',
    locationId: 'kaiowa_highlands',
    locationName: 'Kaiowa Highlands',
    size: 'medium' as PropertySize,

    basePrice: 1800,
    weeklyTax: 12,
    weeklyUpkeep: 15,

    acres: 50,
    buildings: [
      HomesteadBuilding.HOUSE,
      HomesteadBuilding.WELL,
      HomesteadBuilding.CELLAR,
      HomesteadBuilding.WATCHTOWER,
      HomesteadBuilding.STABLE,
    ],
    terrain: TerrainType.MOUNTAIN,
    waterAccess: true,
    defensibility: 8,

    bedrooms: 3,
    storage: 250,
    energyRegenBonus: 12,

    gardenPlots: 4,
    animalPens: 3,
    huntingGround: true,
    fishingAccess: false,

    fortificationLevel: 6,
    hiddenRooms: true,
    escapeRoute: true,

    levelRequirement: 15,
    factionRequirement: 'Nahi Coalition (Friendly+)',

    specialFeatures: [
      'Panoramic views',
      'Natural fortress',
      'Sacred ground proximity',
      'Storm watching',
      'Hidden lightning rod (supernatural)',
    ],
    dangers: ['Mountain lions', 'Lightning storms', 'Treacherous path', 'Spirit activity'],
  },

  coyote_springs_ranch: {
    id: 'coyote_springs_ranch',
    name: 'Coyote Springs Ranch',
    description:
      'Water-rich property with natural springs that never run dry. Perfect for ranching or farming. Multiple water sources make this extremely valuable in the desert climate.',
    locationId: 'western_grasslands',
    locationName: 'Western Grasslands',
    size: 'medium' as PropertySize,

    basePrice: 2000,
    weeklyTax: 18,
    weeklyUpkeep: 12,

    acres: 45,
    buildings: [
      HomesteadBuilding.HOUSE,
      HomesteadBuilding.WELL,
      HomesteadBuilding.CELLAR,
      HomesteadBuilding.BARN,
      HomesteadBuilding.STABLE,
      HomesteadBuilding.SMOKEHOUSE,
    ],
    terrain: TerrainType.PLAINS,
    waterAccess: true,
    defensibility: 4,

    bedrooms: 4,
    storage: 350,
    energyRegenBonus: 9,

    gardenPlots: 10,
    animalPens: 6,
    huntingGround: true,
    fishingAccess: false,

    fortificationLevel: 3,
    hiddenRooms: false,
    escapeRoute: false,

    levelRequirement: 12,

    specialFeatures: [
      'Multiple natural springs',
      'Never runs dry',
      'Excellent grazing',
      'Water rights included',
    ],
    dangers: ['Water claim disputes', 'Drought refugees', 'Cattle rustlers'],
  },

  the_hermitage: {
    id: 'the_hermitage',
    name: 'The Hermitage',
    description:
      'Secluded retreat built by a reclusive prospector. Hidden canyon location with a single guarded entrance. Perfect for those who value privacy above all else.',
    locationId: 'hidden_canyon',
    locationName: 'Hidden Canyon',
    size: 'medium' as PropertySize,

    basePrice: 1600,
    weeklyTax: 10,
    weeklyUpkeep: 8,

    acres: 35,
    buildings: [
      HomesteadBuilding.HOUSE,
      HomesteadBuilding.WELL,
      HomesteadBuilding.CELLAR,
      HomesteadBuilding.HIDDEN_CACHE,
      HomesteadBuilding.WATCHTOWER,
    ],
    terrain: TerrainType.CANYON,
    waterAccess: true,
    defensibility: 9,

    bedrooms: 2,
    storage: 200,
    energyRegenBonus: 15,

    gardenPlots: 3,
    animalPens: 2,
    huntingGround: true,
    fishingAccess: false,

    fortificationLevel: 7,
    hiddenRooms: true,
    escapeRoute: true,

    levelRequirement: 18,

    specialFeatures: [
      'Natural fortress',
      'Single entrance',
      'Echo warning system',
      'Hard to find',
      'Previous owner disappeared mysteriously',
    ],
    dangers: [
      'Flash floods',
      'Complete isolation',
      'Strange echoes at night',
      'Rumors of hidden treasure',
    ],
  },

  // ======================
  // LARGE HOMESTEADS
  // ======================

  frontier_manor: {
    id: 'frontier_manor',
    name: 'Frontier Manor',
    description:
      'Luxury wilderness estate built by a railroad baron before the company went bankrupt. Two-story manor house with extensive grounds, multiple buildings, and all the amenities of civilization in the heart of the frontier.',
    locationId: 'northern_plains',
    locationName: 'Northern Plains',
    size: 'large' as PropertySize,

    basePrice: 5000,
    weeklyTax: 40,
    weeklyUpkeep: 30,

    acres: 100,
    buildings: [
      HomesteadBuilding.MANOR,
      HomesteadBuilding.WELL,
      HomesteadBuilding.CELLAR,
      HomesteadBuilding.WORKSHOP,
      HomesteadBuilding.BARN,
      HomesteadBuilding.STABLE,
      HomesteadBuilding.SMOKEHOUSE,
      HomesteadBuilding.WATCHTOWER,
    ],
    terrain: TerrainType.PLAINS,
    waterAccess: true,
    defensibility: 6,

    bedrooms: 8,
    storage: 600,
    energyRegenBonus: 20,

    gardenPlots: 15,
    animalPens: 10,
    huntingGround: true,
    fishingAccess: true,

    fortificationLevel: 5,
    hiddenRooms: true,
    escapeRoute: true,

    levelRequirement: 25,

    specialFeatures: [
      'Grand ballroom',
      'Library',
      'Wine cellar',
      'Servants quarters',
      'Ornate gardens',
      'Prestige location',
      'Previous luxury furnishings',
    ],
    dangers: [
      'High maintenance costs',
      'Attracts thieves',
      'Former creditors',
      'Gang hideout potential',
    ],
  },

  eagles_nest: {
    id: 'eagles_nest',
    name: "Eagle's Nest",
    description:
      'Mountain fortress homestead carved into the peak near The Wastes. Originally a Coalition war chief\'s retreat, it commands the entire valley. Nearly impregnable but harsh living conditions.',
    locationId: 'wastes_border_peaks',
    locationName: 'Waste Border Mountains',
    size: 'large' as PropertySize,

    basePrice: 4500,
    weeklyTax: 25,
    weeklyUpkeep: 35,

    acres: 80,
    buildings: [
      HomesteadBuilding.HOUSE,
      HomesteadBuilding.WELL,
      HomesteadBuilding.CELLAR,
      HomesteadBuilding.WATCHTOWER,
      HomesteadBuilding.HIDDEN_CACHE,
      HomesteadBuilding.STABLE,
    ],
    terrain: TerrainType.MOUNTAIN,
    waterAccess: true,
    defensibility: 10,

    bedrooms: 5,
    storage: 400,
    energyRegenBonus: 18,

    gardenPlots: 5,
    animalPens: 4,
    huntingGround: true,
    fishingAccess: false,

    fortificationLevel: 10,
    hiddenRooms: true,
    escapeRoute: true,

    levelRequirement: 30,
    factionRequirement: 'Nahi Coalition (Honored+)',

    specialFeatures: [
      'Unassailable position',
      '360-degree views',
      'Natural fortifications',
      'Secret tunnels',
      'Ancient Coalition war totems',
      'Eagle nesting grounds',
      'Supernatural protection',
    ],
    dangers: [
      'Extreme weather',
      'Supply line difficulties',
      'Proximity to The Wastes',
      'Cursed ground nearby',
      'Spirit guardians test worthiness',
      'Avalanche risk',
    ],
  },
};

/**
 * Get homestead by ID
 */
export function getHomestead(homesteadId: string): HomesteadProperty | undefined {
  return HOMESTEADS[homesteadId];
}

/**
 * Get homesteads by size
 */
export function getHomesteadsBySize(size: PropertySize): HomesteadProperty[] {
  return Object.values(HOMESTEADS).filter((homestead) => homestead.size === size);
}

/**
 * Get homesteads by location
 */
export function getHomesteadsByLocation(locationId: string): HomesteadProperty[] {
  return Object.values(HOMESTEADS).filter((homestead) => homestead.locationId === locationId);
}

/**
 * Get homesteads available for level
 */
export function getAvailableHomesteads(characterLevel: number): HomesteadProperty[] {
  return Object.values(HOMESTEADS).filter(
    (homestead) => homestead.levelRequirement <= characterLevel
  );
}

/**
 * Get homesteads with specific features
 */
export function getHomesteadsWithFeature(feature: {
  waterAccess?: boolean;
  huntingGround?: boolean;
  fishingAccess?: boolean;
  hiddenRooms?: boolean;
  escapeRoute?: boolean;
}): HomesteadProperty[] {
  return Object.values(HOMESTEADS).filter((homestead) => {
    if (feature.waterAccess !== undefined && homestead.waterAccess !== feature.waterAccess)
      return false;
    if (feature.huntingGround !== undefined && homestead.huntingGround !== feature.huntingGround)
      return false;
    if (feature.fishingAccess !== undefined && homestead.fishingAccess !== feature.fishingAccess)
      return false;
    if (feature.hiddenRooms !== undefined && homestead.hiddenRooms !== feature.hiddenRooms)
      return false;
    if (feature.escapeRoute !== undefined && homestead.escapeRoute !== feature.escapeRoute)
      return false;
    return true;
  });
}

/**
 * Calculate total homestead value (for insurance/foreclosure)
 */
export function calculateHomesteadValue(homesteadId: string, condition: number = 100): number {
  const homestead = getHomestead(homesteadId);
  if (!homestead) return 0;

  const conditionMultiplier = condition / 100;
  return Math.floor(homestead.basePrice * conditionMultiplier);
}
