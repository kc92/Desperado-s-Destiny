/**
 * Train Routes Data
 *
 * Defines all railroad routes in Desperados Destiny
 */

import { TrainRoute } from '@desperados/shared';

/**
 * Main Transcontinental Line
 * 4-hour journey across the frontier
 */
export const TRANSCONTINENTAL_LINE: TrainRoute = {
  routeId: 'TRANSCONTINENTAL',
  name: 'Transcontinental Express',
  description: 'Main line connecting the frontier towns from east to west',
  stops: [
    {
      locationId: 'WHISKEY_BEND',
      locationName: 'Whiskey Bend',
      arrivalOffset: 0,
      departureOffset: 0,
      isTerminal: true,
      canBoard: true,
      canDisembark: false,
    },
    {
      locationId: 'FORT_ASHFORD',
      locationName: 'Fort Ashford',
      arrivalOffset: 60,
      departureOffset: 75,
      isTerminal: false,
      canBoard: true,
      canDisembark: true,
    },
    {
      locationId: 'RED_GULCH',
      locationName: 'Red Gulch',
      arrivalOffset: 150,
      departureOffset: 165,
      isTerminal: false,
      canBoard: true,
      canDisembark: true,
    },
    {
      locationId: 'THE_FRONTERA',
      locationName: 'The Frontera',
      arrivalOffset: 240,
      departureOffset: 240,
      isTerminal: true,
      canBoard: false,
      canDisembark: true,
    },
  ],
  totalDuration: 240, // 4 hours
  isActive: true,
};

/**
 * Mining Spur
 * Connects Red Gulch to the mining operations
 */
export const MINING_SPUR: TrainRoute = {
  routeId: 'MINING_SPUR',
  name: 'Mining Spur Line',
  description: 'Freight line hauling ore from the mountains',
  stops: [
    {
      locationId: 'RED_GULCH',
      locationName: 'Red Gulch',
      arrivalOffset: 0,
      departureOffset: 0,
      isTerminal: true,
      canBoard: true,
      canDisembark: false,
    },
    {
      locationId: 'GOLDFINGERS_MINE',
      locationName: "Goldfinger's Mine",
      arrivalOffset: 45,
      departureOffset: 45,
      isTerminal: true,
      canBoard: false,
      canDisembark: true,
    },
  ],
  totalDuration: 45,
  isActive: true,
};

/**
 * Military Line (One-Way Cargo)
 * Supply route to military depot
 */
export const MILITARY_LINE: TrainRoute = {
  routeId: 'MILITARY_SUPPLY',
  name: 'Fort Ashford Supply Line',
  description: 'Military cargo route - restricted access',
  stops: [
    {
      locationId: 'FORT_ASHFORD',
      locationName: 'Fort Ashford',
      arrivalOffset: 0,
      departureOffset: 0,
      isTerminal: true,
      canBoard: false, // No civilian passengers
      canDisembark: false,
    },
    {
      locationId: 'SUPPLY_DEPOT',
      locationName: 'Military Supply Depot',
      arrivalOffset: 90,
      departureOffset: 90,
      isTerminal: true,
      canBoard: false,
      canDisembark: false,
    },
  ],
  totalDuration: 90,
  isActive: true,
};

/**
 * Border Express
 * International route requiring special permits
 */
export const BORDER_EXPRESS: TrainRoute = {
  routeId: 'BORDER_EXPRESS',
  name: 'Border Express',
  description: 'Cross-border service to Mexico - special permit required',
  stops: [
    {
      locationId: 'THE_FRONTERA',
      locationName: 'The Frontera',
      arrivalOffset: 0,
      departureOffset: 0,
      isTerminal: true,
      canBoard: true,
      canDisembark: false,
    },
    {
      locationId: 'BORDER_CHECKPOINT',
      locationName: 'Border Checkpoint',
      arrivalOffset: 30,
      departureOffset: 45,
      isTerminal: false,
      canBoard: false,
      canDisembark: false,
    },
    {
      locationId: 'CIUDAD_DESTINO',
      locationName: 'Ciudad Destino',
      arrivalOffset: 120,
      departureOffset: 120,
      isTerminal: true,
      canBoard: false,
      canDisembark: true,
    },
  ],
  totalDuration: 120,
  isActive: true,
};

/**
 * Canyon Route
 * Dangerous scenic route through Devil's Canyon
 */
export const CANYON_ROUTE: TrainRoute = {
  routeId: 'CANYON_ROUTE',
  name: "Devil's Canyon Line",
  description: 'Scenic but treacherous route through the canyons',
  stops: [
    {
      locationId: 'WHISKEY_BEND',
      locationName: 'Whiskey Bend',
      arrivalOffset: 0,
      departureOffset: 0,
      isTerminal: true,
      canBoard: true,
      canDisembark: false,
    },
    {
      locationId: 'CANYON_BRIDGE',
      locationName: 'Canyon Bridge',
      arrivalOffset: 60,
      departureOffset: 62,
      isTerminal: false,
      canBoard: false,
      canDisembark: false,
    },
    {
      locationId: 'DEVILS_CANYON',
      locationName: "Devil's Canyon",
      arrivalOffset: 90,
      departureOffset: 105,
      isTerminal: false,
      canBoard: true,
      canDisembark: true,
    },
    {
      locationId: 'RED_GULCH',
      locationName: 'Red Gulch',
      arrivalOffset: 180,
      departureOffset: 180,
      isTerminal: true,
      canBoard: false,
      canDisembark: true,
    },
  ],
  totalDuration: 180,
  isActive: true,
};

/**
 * Northern Loop
 * Circuit through the northern territories
 */
export const NORTHERN_LOOP: TrainRoute = {
  routeId: 'NORTHERN_LOOP',
  name: 'Northern Territories Loop',
  description: 'Circular route through northern settlements',
  stops: [
    {
      locationId: 'FORT_ASHFORD',
      locationName: 'Fort Ashford',
      arrivalOffset: 0,
      departureOffset: 0,
      isTerminal: true,
      canBoard: true,
      canDisembark: false,
    },
    {
      locationId: 'SILVER_CREEK',
      locationName: 'Silver Creek',
      arrivalOffset: 75,
      departureOffset: 85,
      isTerminal: false,
      canBoard: true,
      canDisembark: true,
    },
    {
      locationId: 'NORTH_PASS',
      locationName: 'North Pass',
      arrivalOffset: 150,
      departureOffset: 160,
      isTerminal: false,
      canBoard: true,
      canDisembark: true,
    },
    {
      locationId: 'TIMBER_RIDGE',
      locationName: 'Timber Ridge',
      arrivalOffset: 210,
      departureOffset: 220,
      isTerminal: false,
      canBoard: true,
      canDisembark: true,
    },
    {
      locationId: 'FORT_ASHFORD',
      locationName: 'Fort Ashford',
      arrivalOffset: 300,
      departureOffset: 300,
      isTerminal: true,
      canBoard: false,
      canDisembark: true,
    },
  ],
  totalDuration: 300,
  isActive: true,
};

/**
 * All train routes in the game
 */
export const TRAIN_ROUTES: TrainRoute[] = [
  TRANSCONTINENTAL_LINE,
  MINING_SPUR,
  MILITARY_LINE,
  BORDER_EXPRESS,
  CANYON_ROUTE,
  NORTHERN_LOOP,
];

/**
 * Get a route by ID
 */
export function getTrainRoute(routeId: string): TrainRoute | undefined {
  return TRAIN_ROUTES.find((route) => route.routeId === routeId);
}

/**
 * Get all routes serving a location
 */
export function getRoutesForLocation(locationId: string): TrainRoute[] {
  return TRAIN_ROUTES.filter((route) =>
    route.stops.some((stop) => stop.locationId === locationId)
  );
}

/**
 * Find routes between two locations
 */
export function findRoutesBetween(origin: string, destination: string): TrainRoute[] {
  return TRAIN_ROUTES.filter((route) => {
    const originIndex = route.stops.findIndex((stop) => stop.locationId === origin);
    const destIndex = route.stops.findIndex((stop) => stop.locationId === destination);

    // Both locations must be on the route, and origin must come before destination
    return originIndex !== -1 && destIndex !== -1 && originIndex < destIndex;
  });
}

/**
 * Calculate travel time between two stops on a route
 */
export function calculateTravelTime(
  route: TrainRoute,
  origin: string,
  destination: string
): number | null {
  const originStop = route.stops.find((stop) => stop.locationId === origin);
  const destStop = route.stops.find((stop) => stop.locationId === destination);

  if (!originStop || !destStop) {
    return null;
  }

  return destStop.arrivalOffset - originStop.departureOffset;
}

/**
 * Get all stops on a route that allow boarding
 */
export function getBoardingStops(route: TrainRoute): string[] {
  return route.stops.filter((stop) => stop.canBoard).map((stop) => stop.locationId);
}

/**
 * Get all stops on a route that allow disembarking
 */
export function getDisembarkingStops(route: TrainRoute): string[] {
  return route.stops.filter((stop) => stop.canDisembark).map((stop) => stop.locationId);
}
