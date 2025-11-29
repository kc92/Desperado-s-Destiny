/**
 * Way Stations Data
 *
 * Defines all way stations (rest stops) along stagecoach routes
 */

import { WayStation } from '@desperados/shared';

/**
 * All way stations across the territory
 */
export const WAY_STATIONS: WayStation[] = [
  // ========================================
  // COPPER TRAIL WAY STATION
  // ========================================
  {
    id: 'copper_trail_waystation',
    name: 'Copper Trail Way Station',
    description: 'A well-maintained rest stop on the Red Gulch-Longhorn Ranch line. Known for hearty meals and decent beds.',
    locationId: 'copper_trail_waystation',
    region: 'dusty_flats',
    facilities: {
      hasStables: true,
      hasRooms: true,
      hasSaloon: true,
      hasBlacksmith: true,
    },
    services: {
      changeHorses: true,
      repairs: true,
      food: true,
      lodging: true,
    },
    prices: {
      meal: 5,
      room: 15,
      horseChange: 20,
    },
    npcs: [
      'station_master_harriet',
      'blacksmith_old_pete',
      'cook_maria',
      'stable_hand_tommy',
    ],
    dangerLevel: 3,
    reputation: 75,
  },

  // ========================================
  // CANYON REST STOP
  // ========================================
  {
    id: 'canyon_rest',
    name: 'Canyon Rest Stop',
    description: 'Small station carved into canyon wall. Minimal facilities, but safe from weather.',
    locationId: 'canyon_rest',
    region: 'devils_canyon',
    facilities: {
      hasStables: true,
      hasRooms: false,
      hasSaloon: false,
      hasBlacksmith: false,
    },
    services: {
      changeHorses: true,
      repairs: false,
      food: true,
      lodging: false,
    },
    prices: {
      meal: 8,
      room: 0,
      horseChange: 25,
    },
    npcs: [
      'station_keeper_marcus',
      'stable_hand_jose',
    ],
    dangerLevel: 6,
    reputation: 60,
  },

  // ========================================
  // GRASSLAND CROSSING
  // ========================================
  {
    id: 'grassland_crossing',
    name: 'Grassland Crossing',
    description: 'Open-air station at the border of settler and Nahi lands. Tense but neutral.',
    locationId: 'grassland_crossing',
    region: 'frontier',
    facilities: {
      hasStables: true,
      hasRooms: false,
      hasSaloon: false,
      hasBlacksmith: false,
    },
    services: {
      changeHorses: true,
      repairs: false,
      food: true,
      lodging: false,
    },
    prices: {
      meal: 6,
      room: 0,
      horseChange: 18,
    },
    npcs: [
      'station_master_gray_wolf',
      'settler_trader_jenkins',
    ],
    dangerLevel: 5,
    reputation: 65,
  },

  // ========================================
  // DEAD MAN'S GULCH
  // ========================================
  {
    id: 'dead_mans_gulch',
    name: 'Dead Man\'s Gulch',
    description: 'Notorious way station in outlaw territory. Rough clientele, questionable safety. No law for miles.',
    locationId: 'dead_mans_gulch',
    region: 'outlaw_territory',
    facilities: {
      hasStables: true,
      hasRooms: true,
      hasSaloon: true,
      hasBlacksmith: false,
    },
    services: {
      changeHorses: true,
      repairs: false,
      food: true,
      lodging: true,
    },
    prices: {
      meal: 10,
      room: 25,
      horseChange: 30,
    },
    npcs: [
      'barkeep_scarface_sal',
      'gambler_slick_rick',
      'outlaw_three_finger_ted',
      'mysterious_woman_in_black',
    ],
    dangerLevel: 9,
    reputation: 35,
  },

  // ========================================
  // SETTLER'S REST POST
  // ========================================
  {
    id: 'settlers_rest_post',
    name: 'Settler\'s Rest Post',
    description: 'Clean, orderly military-adjacent way station. Safe but strict rules. No troublemakers.',
    locationId: 'settlers_rest_post',
    region: 'frontier',
    facilities: {
      hasStables: true,
      hasRooms: true,
      hasSaloon: false,
      hasBlacksmith: true,
    },
    services: {
      changeHorses: true,
      repairs: true,
      food: true,
      lodging: true,
    },
    prices: {
      meal: 7,
      room: 18,
      horseChange: 22,
    },
    npcs: [
      'station_master_colonel_briggs',
      'blacksmith_honest_abe',
      'cook_mrs_henderson',
    ],
    dangerLevel: 2,
    reputation: 85,
  },

  // ========================================
  // ANCIENT OAK GROVE
  // ========================================
  {
    id: 'ancient_oak_grove',
    name: 'Ancient Oak Grove',
    description: 'Sacred Nahi way station. Only Coalition-friendly travelers welcome. Spiritual atmosphere.',
    locationId: 'ancient_oak_grove',
    region: 'sacred_lands',
    facilities: {
      hasStables: true,
      hasRooms: false,
      hasSaloon: false,
      hasBlacksmith: false,
    },
    services: {
      changeHorses: true,
      repairs: false,
      food: true,
      lodging: false,
    },
    prices: {
      meal: 5,
      room: 0,
      horseChange: 15,
    },
    npcs: [
      'elder_standing_bear',
      'medicine_woman_singing_crow',
      'young_warrior_swift_arrow',
    ],
    dangerLevel: 4,
    reputation: 80,
  },

  // ========================================
  // BONE VALLEY
  // ========================================
  {
    id: 'bone_valley',
    name: 'Bone Valley',
    description: 'Abandoned way station. Littered with bones and wreckage. Stagecoaches don\'t stop here anymore.',
    locationId: 'bone_valley',
    region: 'badlands',
    facilities: {
      hasStables: false,
      hasRooms: false,
      hasSaloon: false,
      hasBlacksmith: false,
    },
    services: {
      changeHorses: false,
      repairs: false,
      food: false,
      lodging: false,
    },
    prices: {
      meal: 0,
      room: 0,
      horseChange: 0,
    },
    npcs: [], // Abandoned
    dangerLevel: 10,
    reputation: 0,
  },

  // ========================================
  // SILVER CREEK STATION
  // ========================================
  {
    id: 'silver_creek_claim',
    name: 'Silver Creek Station',
    description: 'Busy mining way station. Always crowded with miners, prospectors, and claim-jumpers.',
    locationId: 'silver_creek_claim',
    region: 'sangre_mountains',
    facilities: {
      hasStables: true,
      hasRooms: true,
      hasSaloon: true,
      hasBlacksmith: true,
    },
    services: {
      changeHorses: true,
      repairs: true,
      food: true,
      lodging: true,
    },
    prices: {
      meal: 12,
      room: 30,
      horseChange: 28,
    },
    npcs: [
      'station_master_goldfinger_joe',
      'saloon_girl_lucky_lucy',
      'assayer_mr_pembroke',
      'drunk_miner_dusty_dan',
    ],
    dangerLevel: 7,
    reputation: 55,
  },

  // ========================================
  // DUSTY DIGGINGS REST
  // ========================================
  {
    id: 'dusty_diggings',
    name: 'Dusty Diggings Rest',
    description: 'Small mining camp way station. Rough accommodations, but cheap.',
    locationId: 'dusty_diggings',
    region: 'sangre_mountains',
    facilities: {
      hasStables: true,
      hasRooms: true,
      hasSaloon: false,
      hasBlacksmith: false,
    },
    services: {
      changeHorses: true,
      repairs: false,
      food: true,
      lodging: true,
    },
    prices: {
      meal: 4,
      room: 10,
      horseChange: 20,
    },
    npcs: [
      'old_prospector_zeke',
      'station_keeper_widow_mae',
    ],
    dangerLevel: 6,
    reputation: 50,
  },

  // ========================================
  // SCAR EDGE CAMP
  // ========================================
  {
    id: 'scar_edge_camp',
    name: 'Scar Edge Camp',
    description: 'Last outpost before The Scar. Desperate place for desperate people. High prices, low standards.',
    locationId: 'scar_edge_camp',
    region: 'badlands',
    facilities: {
      hasStables: true,
      hasRooms: true,
      hasSaloon: true,
      hasBlacksmith: false,
    },
    services: {
      changeHorses: true,
      repairs: false,
      food: true,
      lodging: true,
    },
    prices: {
      meal: 20,
      room: 50,
      horseChange: 40,
    },
    npcs: [
      'station_master_one_eyed_jack',
      'fortune_teller_madame_esmeralda',
      'scarred_veteran_sergeant_kane',
    ],
    dangerLevel: 10,
    reputation: 25,
  },

  // ========================================
  // PARADISE SPRINGS (Luxury)
  // ========================================
  {
    id: 'paradise_springs_resort',
    name: 'Paradise Springs Resort',
    description: 'Luxury way station for wealthy travelers. Hot springs, fine dining, premium accommodations.',
    locationId: 'paradise_springs_resort',
    region: 'springs',
    facilities: {
      hasStables: true,
      hasRooms: true,
      hasSaloon: true,
      hasBlacksmith: true,
    },
    services: {
      changeHorses: true,
      repairs: true,
      food: true,
      lodging: true,
    },
    prices: {
      meal: 25,
      room: 75,
      horseChange: 35,
    },
    npcs: [
      'resort_manager_archibald_vanderbrook',
      'chef_francois_dubois',
      'concierge_miss_weatherby',
      'spa_attendant_lotus_blossom',
    ],
    dangerLevel: 1,
    reputation: 95,
  },
];

/**
 * Get way station by ID
 */
export function getWayStationById(stationId: string): WayStation | undefined {
  return WAY_STATIONS.find(s => s.id === stationId);
}

/**
 * Get way stations by region
 */
export function getWayStationsByRegion(region: string): WayStation[] {
  return WAY_STATIONS.filter(s => s.region === region);
}

/**
 * Get way stations by danger level
 */
export function getSafeWayStations(maxDanger: number): WayStation[] {
  return WAY_STATIONS.filter(s => s.dangerLevel <= maxDanger);
}

/**
 * Get way stations with specific services
 */
export function getWayStationsWithService(
  service: 'changeHorses' | 'repairs' | 'food' | 'lodging'
): WayStation[] {
  return WAY_STATIONS.filter(s => s.services[service]);
}

/**
 * Get way stations with specific facilities
 */
export function getWayStationsWithFacility(
  facility: 'hasStables' | 'hasRooms' | 'hasSaloon' | 'hasBlacksmith'
): WayStation[] {
  return WAY_STATIONS.filter(s => s.facilities[facility]);
}

/**
 * Calculate total rest stop cost
 */
export function calculateRestCost(
  station: WayStation,
  needsMeal: boolean,
  needsRoom: boolean,
  needsHorseChange: boolean
): number {
  let total = 0;

  if (needsMeal && station.services.food) {
    total += station.prices.meal;
  }

  if (needsRoom && station.services.lodging) {
    total += station.prices.room;
  }

  if (needsHorseChange && station.services.changeHorses) {
    total += station.prices.horseChange;
  }

  return total;
}

/**
 * Get reputation tier description
 */
export function getReputationTier(reputation: number): string {
  if (reputation >= 90) return 'Excellent';
  if (reputation >= 75) return 'Very Good';
  if (reputation >= 60) return 'Good';
  if (reputation >= 40) return 'Fair';
  if (reputation >= 20) return 'Poor';
  return 'Dangerous';
}

/**
 * Check if station is safe for character
 */
export function isStationSafe(
  station: WayStation,
  characterWantedLevel: number,
  characterCriminalRep: number
): boolean {
  // High wanted level characters avoid low-danger (lawful) stations
  if (characterWantedLevel >= 4 && station.dangerLevel <= 3) {
    return false;
  }

  // High criminal rep characters avoid safe stations
  if (characterCriminalRep >= 75 && station.reputation >= 80) {
    return false;
  }

  return true;
}
