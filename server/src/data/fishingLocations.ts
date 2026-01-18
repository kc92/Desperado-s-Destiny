/**
 * Fishing Locations Data
 *
 * All fishing spots in Desperados Destiny
 */

import {
  FishingLocation,
  WaterType,
  SpotType
} from '@desperados/shared';

/**
 * All fishing locations in the game
 */
export const FISHING_LOCATIONS: Record<string, FishingLocation> = {
  // ==================== RIVERS ====================

  RED_GULCH_CREEK: {
    id: 'red_gulch_creek',
    name: 'Red Gulch Creek',
    description: 'A winding creek popular with local anglers. Clear water, easy access, and plenty of fish. Good for beginners.',
    locationId: 'red_gulch',
    waterType: WaterType.RIVER,
    difficulty: 20,
    discoveredByDefault: true,
    commonFish: ['CATFISH', 'BLUEGILL', 'LARGEMOUTH_BASS', 'SUNFISH'],
    qualityFish: [],
    rareFish: [],
    legendaryFish: 'RIVER_KING',
    scenicValue: 60,
    danger: 10,
    availableSpots: [SpotType.SHALLOW, SpotType.STRUCTURE, SpotType.DEEP],
    folklore: 'Old-timers say the River King has lived in this creek since before the town was founded.'
  },

  COYOTE_RIVER: {
    id: 'coyote_river',
    name: 'Coyote River',
    description: 'Larger river with varied fishing. Flows from mountains to border. Mix of cold and warm water species.',
    locationId: 'coyote_crossing',
    waterType: WaterType.RIVER,
    difficulty: 40,
    discoveredByDefault: true,
    requiredLevel: 5,
    commonFish: ['CATFISH', 'SMALLMOUTH_BASS', 'LARGEMOUTH_BASS', 'PERCH'],
    qualityFish: ['RAINBOW_TROUT', 'BROWN_TROUT', 'WALLEYE', 'PIKE', 'CHANNEL_CATFISH'],
    rareFish: ['STURGEON'],
    scenicValue: 70,
    danger: 25,
    availableSpots: [SpotType.SHALLOW, SpotType.DEEP, SpotType.STRUCTURE, SpotType.BOTTOM],
    folklore: 'Coyotes howl at night along these banks. Some say they\'re calling to something in the water.'
  },

  RIO_FRONTERA: {
    id: 'rio_frontera',
    name: 'Rio Frontera',
    description: 'Border river between territories. Deep, dangerous, and full of exotic fish. Smugglers use these waters.',
    locationId: 'border_crossing',
    waterType: WaterType.RIVER,
    difficulty: 60,
    discoveredByDefault: false,
    requiredLevel: 15,
    commonFish: ['CATFISH'],
    qualityFish: ['CHANNEL_CATFISH'],
    rareFish: ['STURGEON', 'PADDLEFISH', 'GAR'],
    scenicValue: 80,
    danger: 60,
    availableSpots: [SpotType.DEEP, SpotType.BOTTOM, SpotType.STRUCTURE],
    folklore: 'They say more than fish hide in these muddy waters. Bodies, gold, and secrets all sink to the bottom.'
  },

  // ==================== LAKES ====================

  SPIRIT_SPRINGS_LAKE: {
    id: 'spirit_springs_lake',
    name: 'Spirit Springs Lake',
    description: 'Fed by natural springs with healing properties. Crystal clear water. Sacred to the Nahi.',
    locationId: 'spirit_springs',
    waterType: WaterType.LAKE,
    difficulty: 35,
    discoveredByDefault: true,
    requiredLevel: 3,
    commonFish: ['BLUEGILL', 'LARGEMOUTH_BASS', 'CRAPPIE', 'SUNFISH'],
    qualityFish: [],
    rareFish: [],
    legendaryFish: 'OLD_WHISKERS',
    scenicValue: 95,
    danger: 5,
    availableSpots: [SpotType.SHALLOW, SpotType.DEEP, SpotType.STRUCTURE],
    folklore: 'The springs never freeze, never go dry. Old Whiskers has lived here longer than anyone can remember.'
  },

  LONGHORN_RESERVOIR: {
    id: 'longhorn_reservoir',
    name: 'Longhorn Reservoir',
    description: 'Man-made reservoir for ranch water. Stocked with bass and pike. Trophy fish waters.',
    locationId: 'longhorn_ranch',
    waterType: WaterType.LAKE,
    difficulty: 50,
    discoveredByDefault: false,
    requiredLevel: 10,
    requiredReputation: {
      faction: 'settlerAlliance',
      amount: 25
    },
    commonFish: ['BLUEGILL', 'LARGEMOUTH_BASS', 'CRAPPIE', 'PERCH'],
    qualityFish: ['WALLEYE', 'PIKE', 'MUSKIE'],
    rareFish: ['PADDLEFISH'],
    scenicValue: 70,
    danger: 15,
    availableSpots: [SpotType.SHALLOW, SpotType.DEEP, SpotType.STRUCTURE, SpotType.BOTTOM],
    folklore: 'Ranchers stocked this with bass fingerlings 20 years ago. Some have grown to legendary size.'
  },

  MOUNTAIN_LAKE: {
    id: 'mountain_lake',
    name: 'Mountain Lake',
    description: 'High altitude alpine lake. Cold, clear, pristine. Home to rare trout species.',
    locationId: 'mountain_pass',
    waterType: WaterType.LAKE,
    difficulty: 70,
    discoveredByDefault: false,
    requiredLevel: 20,
    commonFish: ['SMALLMOUTH_BASS'],
    qualityFish: ['RAINBOW_TROUT', 'BROWN_TROUT', 'BROOK_TROUT'],
    rareFish: ['GOLDEN_TROUT'],
    legendaryFish: 'THE_GHOST',
    scenicValue: 100,
    danger: 40,
    availableSpots: [SpotType.DEEP, SpotType.STRUCTURE, SpotType.SURFACE],
    folklore: 'Nahi call this place "Where Spirits Sleep." The white trout only appears under moonlight.'
  },

  // ==================== SPECIAL WATERS ====================

  THE_SCAR_POOL: {
    id: 'the_scar_pool',
    name: 'The Scar Pool',
    description: 'Crater lake formed by meteor impact. Water glows faintly at night. Nothing natural lives here.',
    locationId: 'the_scar',
    waterType: WaterType.SACRED,
    difficulty: 95,
    discoveredByDefault: false,
    requiredLevel: 30,
    isSecretLocation: true,
    requiresQuest: 'discover_the_scar',
    commonFish: [],
    qualityFish: [],
    rareFish: [],
    legendaryFish: 'EL_DIABLO',
    scenicValue: 50,
    danger: 95,
    availableSpots: [SpotType.DEEP, SpotType.BOTTOM],
    folklore: 'The meteor fell here in 1847. Spanish missionaries said it was God\'s wrath. The Nahi said it was something older waking up. One thing\'s certain - the fish that lives in this water ain\'t from around here.'
  },

  SACRED_WATERS: {
    id: 'sacred_waters',
    name: 'Sacred Waters',
    description: 'Hidden Nahi Coalition fishing grounds. Requires permission and respect to access.',
    locationId: 'coalition_territory',
    waterType: WaterType.STREAM,
    difficulty: 55,
    discoveredByDefault: false,
    requiredLevel: 15,
    requiredReputation: {
      faction: 'nahiCoalition',
      amount: 50
    },
    commonFish: [],
    qualityFish: ['RAINBOW_TROUT', 'BROOK_TROUT'],
    rareFish: ['GOLDEN_TROUT', 'APACHE_TROUT'],
    scenicValue: 90,
    danger: 20,
    availableSpots: [SpotType.SHALLOW, SpotType.STRUCTURE, SpotType.SURFACE],
    folklore: 'The Coalition protects these waters as they have for generations. Fish here with respect, or not at all.'
  },

  UNDERGROUND_RIVER: {
    id: 'underground_river',
    name: 'Underground River',
    description: 'Subterranean water discovered when miners broke through. Pitch black. Unique ecosystem.',
    locationId: 'abandoned_mine',
    waterType: WaterType.UNDERGROUND,
    difficulty: 65,
    discoveredByDefault: false,
    requiredLevel: 18,
    isSecretLocation: true,
    requiresQuest: 'explore_deep_mines',
    commonFish: [],
    qualityFish: [],
    rareFish: ['CAVE_BLINDFISH'],
    scenicValue: 30,
    danger: 70,
    availableSpots: [SpotType.DEEP, SpotType.BOTTOM],
    folklore: 'Miners who found this river swore they heard voices in the darkness. None went back.'
  },

  // ==================== SEASONAL LOCATIONS ====================

  SPRING_POOLS: {
    id: 'spring_pools',
    name: 'Seasonal Spring Pools',
    description: 'Small pools that form during spring melt. Teeming with life but only accessible part of the year.',
    locationId: 'canyon_floor',
    waterType: WaterType.POND,
    difficulty: 30,
    discoveredByDefault: false,
    requiredLevel: 8,
    commonFish: ['BLUEGILL', 'SUNFISH', 'CRAPPIE'],
    qualityFish: [],
    rareFish: [],
    scenicValue: 65,
    danger: 25,
    availableSpots: [SpotType.SHALLOW],
    folklore: 'Only accessible in spring when snowmelt fills the canyon. Come summer, they dry up completely.'
  }
};

/**
 * Get all fishing locations as array
 */
export function getAllFishingLocations(): FishingLocation[] {
  return Object.values(FISHING_LOCATIONS);
}

/**
 * Get fishing location by ID
 */
export function getFishingLocation(locationId: string): FishingLocation | undefined {
  // First try direct key lookup (object key like 'RED_GULCH_CREEK')
  if (FISHING_LOCATIONS[locationId]) {
    return FISHING_LOCATIONS[locationId];
  }
  // Then try to find by .id property (lowercase like 'red_gulch_creek')
  return Object.values(FISHING_LOCATIONS).find(
    loc => loc.id === locationId || loc.id.toLowerCase() === locationId.toLowerCase()
  );
}

/**
 * Get locations by difficulty range
 */
export function getLocationsByDifficulty(minDiff: number, maxDiff: number): FishingLocation[] {
  return getAllFishingLocations().filter(
    loc => loc.difficulty >= minDiff && loc.difficulty <= maxDiff
  );
}

/**
 * Get locations by water type
 */
export function getLocationsByWaterType(waterType: WaterType): FishingLocation[] {
  return getAllFishingLocations().filter(loc => loc.waterType === waterType);
}

/**
 * Check if character can access location
 */
export function canAccessLocation(
  location: FishingLocation,
  characterLevel: number,
  reputation?: { faction: string; amount: number }
): { canAccess: boolean; reason?: string } {
  // Level requirement
  if (location.requiredLevel && characterLevel < location.requiredLevel) {
    return {
      canAccess: false,
      reason: `Requires level ${location.requiredLevel}`
    };
  }

  // Reputation requirement
  if (location.requiredReputation) {
    if (!reputation || reputation.faction !== location.requiredReputation.faction) {
      return {
        canAccess: false,
        reason: `Requires ${location.requiredReputation.amount} reputation with ${location.requiredReputation.faction}`
      };
    }
    if (reputation.amount < location.requiredReputation.amount) {
      return {
        canAccess: false,
        reason: `Requires ${location.requiredReputation.amount} reputation with ${location.requiredReputation.faction}`
      };
    }
  }

  // Quest requirement
  if (location.requiresQuest) {
    // This would need to check quest completion
    // For now, just indicate it's required
    return {
      canAccess: false,
      reason: `Requires completing quest: ${location.requiresQuest}`
    };
  }

  return { canAccess: true };
}

/**
 * Get starting/beginner locations
 */
export function getBeginnerLocations(): FishingLocation[] {
  return getAllFishingLocations().filter(
    loc => loc.discoveredByDefault && loc.difficulty <= 30
  );
}

/**
 * Get secret locations
 */
export function getSecretLocations(): FishingLocation[] {
  return getAllFishingLocations().filter(loc => loc.isSecretLocation);
}
