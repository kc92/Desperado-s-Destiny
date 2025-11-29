/**
 * Stagecoach Routes Data
 *
 * Defines all stagecoach routes across the Sangre Territory
 */

import { StagecoachRoute, StagecoachRouteStop } from '@desperados/shared';

/**
 * Main stagecoach routes
 */
export const STAGECOACH_ROUTES: StagecoachRoute[] = [
  // ========================================
  // MAIN ROUTE 1: RED GULCH ↔ LONGHORN RANCH ↔ KAIOWA MESA
  // ========================================
  {
    id: 'route_red_gulch_longhorn',
    name: 'Red Gulch - Longhorn Ranch Line',
    description: 'Major route connecting Red Gulch mining town to the sprawling Longhorn Ranch, through settled territories.',
    stops: [
      {
        locationId: 'red_gulch_station',
        locationName: 'Red Gulch Station',
        stopOrder: 1,
        stopDuration: 15,
        canBoard: true,
        canDisembark: true,
      },
      {
        locationId: 'copper_trail_waystation',
        locationName: 'Copper Trail Way Station',
        stopOrder: 2,
        stopDuration: 20,
        canBoard: true,
        canDisembark: true,
      },
      {
        locationId: 'longhorn_ranch_depot',
        locationName: 'Longhorn Ranch Depot',
        stopOrder: 3,
        stopDuration: 15,
        canBoard: true,
        canDisembark: true,
      },
    ],
    totalDistance: 45,
    baseDuration: 6,
    dangerLevel: 4,
    terrain: ['plains', 'desert'],
    weatherAffected: true,
    fare: {
      base: 25,
      perMile: 0.75,
    },
    frequency: 'Every 6 hours',
    schedule: [6, 12, 18, 0],
    isActive: true,
  },

  {
    id: 'route_longhorn_kaiowa',
    name: 'Longhorn Ranch - Kaiowa Mesa Line',
    description: 'Connects settler ranching territory to Nahi Coalition lands. Cultural crossroads.',
    stops: [
      {
        locationId: 'longhorn_ranch_depot',
        locationName: 'Longhorn Ranch Depot',
        stopOrder: 1,
        stopDuration: 15,
        canBoard: true,
        canDisembark: true,
      },
      {
        locationId: 'grassland_crossing',
        locationName: 'Grassland Crossing',
        stopOrder: 2,
        stopDuration: 10,
        canBoard: true,
        canDisembark: false,
      },
      {
        locationId: 'kaiowa_mesa_station',
        locationName: 'Kaiowa Mesa Station',
        stopOrder: 3,
        stopDuration: 15,
        canBoard: true,
        canDisembark: true,
      },
    ],
    totalDistance: 32,
    baseDuration: 4,
    dangerLevel: 5,
    terrain: ['plains', 'canyon'],
    weatherAffected: true,
    fare: {
      base: 30,
      perMile: 0.85,
    },
    frequency: 'Every 8 hours',
    schedule: [8, 16, 0],
    isActive: true,
  },

  // ========================================
  // MAIN ROUTE 2: WHISKEY BEND ↔ SPIRIT SPRINGS
  // ========================================
  {
    id: 'route_whiskey_spirit',
    name: 'Whiskey Bend - Spirit Springs Express',
    description: 'Fast route between the rowdy outpost town and the sacred healing springs.',
    stops: [
      {
        locationId: 'whiskey_bend_station',
        locationName: 'Whiskey Bend Station',
        stopOrder: 1,
        stopDuration: 20,
        canBoard: true,
        canDisembark: true,
      },
      {
        locationId: 'canyon_rest',
        locationName: 'Canyon Rest Stop',
        stopOrder: 2,
        stopDuration: 15,
        canBoard: true,
        canDisembark: false,
      },
      {
        locationId: 'spirit_springs_depot',
        locationName: 'Spirit Springs Depot',
        stopOrder: 3,
        stopDuration: 20,
        canBoard: true,
        canDisembark: true,
      },
    ],
    totalDistance: 28,
    baseDuration: 3.5,
    dangerLevel: 6,
    terrain: ['canyon', 'desert'],
    weatherAffected: true,
    fare: {
      base: 40,
      perMile: 1.0,
    },
    frequency: 'Every 12 hours',
    schedule: [8, 20],
    isActive: true,
  },

  // ========================================
  // DANGEROUS ROUTE: THE FRONTERA ↔ THE WASTES
  // ========================================
  {
    id: 'route_frontera_wastes',
    name: 'Frontera - Wastes Line (Dangerous)',
    description: 'Extremely dangerous route through outlaw territory. Armed guards required. Not for the faint of heart.',
    stops: [
      {
        locationId: 'frontera_depot',
        locationName: 'The Frontera Depot',
        stopOrder: 1,
        stopDuration: 30,
        canBoard: true,
        canDisembark: true,
      },
      {
        locationId: 'dead_mans_gulch',
        locationName: 'Dead Man\'s Gulch',
        stopOrder: 2,
        stopDuration: 10,
        canBoard: false,
        canDisembark: false,
      },
      {
        locationId: 'wastes_outpost',
        locationName: 'The Wastes Outpost',
        stopOrder: 3,
        stopDuration: 15,
        canBoard: true,
        canDisembark: true,
      },
    ],
    totalDistance: 52,
    baseDuration: 8,
    dangerLevel: 9,
    terrain: ['badlands', 'desert', 'canyon'],
    weatherAffected: true,
    fare: {
      base: 75,
      perMile: 1.5,
    },
    frequency: 'Every 24 hours',
    schedule: [10],
    isActive: true,
  },

  // ========================================
  // MILITARY ROUTE: FORT ASHFORD ↔ REMOTE OUTPOSTS
  // ========================================
  {
    id: 'route_fort_ashford_circuit',
    name: 'Fort Ashford Military Circuit',
    description: 'Military supply route connecting Fort Ashford to frontier outposts. Heavy guard presence.',
    stops: [
      {
        locationId: 'fort_ashford_gate',
        locationName: 'Fort Ashford Gate',
        stopOrder: 1,
        stopDuration: 25,
        canBoard: true,
        canDisembark: true,
      },
      {
        locationId: 'settlers_rest_post',
        locationName: 'Settler\'s Rest Post',
        stopOrder: 2,
        stopDuration: 15,
        canBoard: true,
        canDisembark: true,
      },
      {
        locationId: 'north_outpost',
        locationName: 'North Outpost',
        stopOrder: 3,
        stopDuration: 20,
        canBoard: true,
        canDisembark: true,
      },
      {
        locationId: 'iron_springs_fort',
        locationName: 'Iron Springs Fort',
        stopOrder: 4,
        stopDuration: 15,
        canBoard: true,
        canDisembark: true,
      },
    ],
    totalDistance: 65,
    baseDuration: 9,
    dangerLevel: 5,
    terrain: ['plains', 'forest'],
    weatherAffected: true,
    fare: {
      base: 35,
      perMile: 0.65,
    },
    frequency: 'Every 8 hours',
    schedule: [6, 14, 22],
    isActive: true,
  },

  // ========================================
  // WILDERNESS ROUTE: SPIRIT SPRINGS ↔ THUNDERBIRD'S PERCH (COALITION ONLY)
  // ========================================
  {
    id: 'route_spirit_thunderbird',
    name: 'Sacred Path to Thunderbird\'s Perch',
    description: 'Nahi Coalition exclusive route to the sacred Thunderbird\'s Perch. Non-Coalition travelers not welcome.',
    stops: [
      {
        locationId: 'spirit_springs_depot',
        locationName: 'Spirit Springs Depot',
        stopOrder: 1,
        stopDuration: 20,
        canBoard: true,
        canDisembark: true,
      },
      {
        locationId: 'ancient_oak_grove',
        locationName: 'Ancient Oak Grove',
        stopOrder: 2,
        stopDuration: 15,
        canBoard: false,
        canDisembark: false,
      },
      {
        locationId: 'thunderbird_base',
        locationName: 'Thunderbird\'s Perch Base',
        stopOrder: 3,
        stopDuration: 30,
        canBoard: true,
        canDisembark: true,
      },
    ],
    totalDistance: 38,
    baseDuration: 5,
    dangerLevel: 7,
    terrain: ['mountains', 'forest'],
    weatherAffected: true,
    fare: {
      base: 50,
      perMile: 1.25,
    },
    frequency: 'Every 12 hours',
    schedule: [9, 21],
    isActive: true,
  },

  // ========================================
  // MINING ROUTE: GOLDFINGER'S MINE ↔ REMOTE CLAIMS
  // ========================================
  {
    id: 'route_goldfingers_circuit',
    name: 'Goldfinger\'s Mining Circuit',
    description: 'Route servicing remote mining claims. Often carries gold shipments - high ambush risk.',
    stops: [
      {
        locationId: 'red_gulch_station',
        locationName: 'Red Gulch Station',
        stopOrder: 1,
        stopDuration: 15,
        canBoard: true,
        canDisembark: true,
      },
      {
        locationId: 'goldfingers_mine',
        locationName: 'Goldfinger\'s Mine',
        stopOrder: 2,
        stopDuration: 30,
        canBoard: true,
        canDisembark: true,
      },
      {
        locationId: 'silver_creek_claim',
        locationName: 'Silver Creek Claim',
        stopOrder: 3,
        stopDuration: 20,
        canBoard: true,
        canDisembark: true,
      },
      {
        locationId: 'dusty_diggings',
        locationName: 'Dusty Diggings',
        stopOrder: 4,
        stopDuration: 15,
        canBoard: true,
        canDisembark: true,
      },
    ],
    totalDistance: 48,
    baseDuration: 7,
    dangerLevel: 8,
    terrain: ['mountains', 'canyon', 'forest'],
    weatherAffected: true,
    fare: {
      base: 45,
      perMile: 1.1,
    },
    frequency: 'Every 24 hours',
    schedule: [7],
    isActive: true,
  },

  // ========================================
  // CURSED ROUTE: THE WASTES ↔ THE SCAR (EXTREMELY DANGEROUS)
  // ========================================
  {
    id: 'route_wastes_scar',
    name: 'The Death Route (Wastes to Scar)',
    description: 'Few survive this journey. Only the desperate or insane travel to The Scar. Company accepts no liability.',
    stops: [
      {
        locationId: 'wastes_outpost',
        locationName: 'The Wastes Outpost',
        stopOrder: 1,
        stopDuration: 45,
        canBoard: true,
        canDisembark: true,
      },
      {
        locationId: 'bone_valley',
        locationName: 'Bone Valley (No Stop)',
        stopOrder: 2,
        stopDuration: 0,
        canBoard: false,
        canDisembark: false,
      },
      {
        locationId: 'scar_edge_camp',
        locationName: 'Scar Edge Camp',
        stopOrder: 3,
        stopDuration: 30,
        canBoard: true,
        canDisembark: true,
      },
    ],
    totalDistance: 35,
    baseDuration: 6,
    dangerLevel: 10,
    terrain: ['badlands', 'desert'],
    weatherAffected: true,
    fare: {
      base: 100,
      perMile: 2.0,
    },
    frequency: 'Weekly (Sundays)',
    schedule: [12],
    isActive: false, // Only active for special events/quests
  },

  // ========================================
  // LUXURY ROUTE: RED GULCH ↔ SILVER CITY EXPRESS
  // ========================================
  {
    id: 'route_silver_express',
    name: 'Silver City Express (Luxury)',
    description: 'Premium service for wealthy travelers. Comfortable seats, meals included, minimal stops.',
    stops: [
      {
        locationId: 'red_gulch_station',
        locationName: 'Red Gulch Station',
        stopOrder: 1,
        stopDuration: 20,
        canBoard: true,
        canDisembark: true,
      },
      {
        locationId: 'silver_city_depot',
        locationName: 'Silver City Grand Depot',
        stopOrder: 2,
        stopDuration: 30,
        canBoard: true,
        canDisembark: true,
      },
    ],
    totalDistance: 72,
    baseDuration: 8,
    dangerLevel: 3,
    terrain: ['plains'],
    weatherAffected: false, // Luxury coaches weather-resistant
    fare: {
      base: 150,
      perMile: 2.5,
    },
    frequency: 'Every 12 hours',
    schedule: [9, 21],
    isActive: true,
  },
];

/**
 * Get route by ID
 */
export function getRouteById(routeId: string): StagecoachRoute | undefined {
  return STAGECOACH_ROUTES.find(r => r.id === routeId);
}

/**
 * Get routes by danger level
 */
export function getRoutesByDangerLevel(maxDanger: number): StagecoachRoute[] {
  return STAGECOACH_ROUTES.filter(r => r.dangerLevel <= maxDanger && r.isActive);
}

/**
 * Get routes connecting two locations
 */
export function getRoutesBetweenLocations(
  locationA: string,
  locationB: string
): StagecoachRoute[] {
  return STAGECOACH_ROUTES.filter(route => {
    const hasLocationA = route.stops.some(s => s.locationId === locationA);
    const hasLocationB = route.stops.some(s => s.locationId === locationB);
    return hasLocationA && hasLocationB && route.isActive;
  });
}

/**
 * Get active routes
 */
export function getActiveRoutes(): StagecoachRoute[] {
  return STAGECOACH_ROUTES.filter(r => r.isActive);
}

/**
 * Calculate fare between two stops
 */
export function calculateFare(route: StagecoachRoute, fromStop: number, toStop: number): number {
  if (fromStop >= toStop) {
    return 0;
  }

  // Calculate distance between stops (simplified)
  const totalStops = route.stops.length;
  const stopDistance = route.totalDistance / (totalStops - 1);
  const travelDistance = (toStop - fromStop) * stopDistance;

  return Math.ceil(route.fare.base + (route.fare.perMile * travelDistance));
}

/**
 * Get next departure time
 */
export function getNextDeparture(route: StagecoachRoute, currentHour: number): number {
  const sortedSchedule = [...route.schedule].sort((a, b) => a - b);

  for (const hour of sortedSchedule) {
    if (hour > currentHour) {
      return hour;
    }
  }

  // Return first departure of next day
  return sortedSchedule[0] + 24;
}

/**
 * Estimate travel time with modifiers
 */
export function estimateTravelTime(
  route: StagecoachRoute,
  weatherModifier: number = 1.0,
  coachCondition: number = 100
): number {
  const baseHours = route.baseDuration;
  const conditionModifier = coachCondition < 50 ? 1.2 : 1.0;

  return baseHours * weatherModifier * conditionModifier;
}
