/**
 * Race Track Data
 * Phase 13, Wave 13.2
 *
 * Definitions for all horse racing tracks in Desperados Destiny
 */

import {
  RaceTrack,
  RaceType,
  RaceTrackTerrainType,
  Obstacle,
  ObstacleType
} from '@desperados/shared';

// ============================================================================
// OBSTACLES
// ============================================================================

export const RACE_OBSTACLES: Record<string, Obstacle> = {
  // Basic jumps
  LOW_FENCE: {
    id: 'LOW_FENCE',
    type: ObstacleType.FENCE,
    name: 'Low Rail Fence',
    difficulty: 3,
    position: 0, // Set per race
    penaltyOnFailure: 2,
    injuryRisk: 5
  },

  HIGH_FENCE: {
    id: 'HIGH_FENCE',
    type: ObstacleType.FENCE,
    name: 'High Split-Rail Fence',
    difficulty: 6,
    position: 0,
    penaltyOnFailure: 3,
    injuryRisk: 15
  },

  // Water obstacles
  SHALLOW_WATER: {
    id: 'SHALLOW_WATER',
    type: ObstacleType.WATER_JUMP,
    name: 'Creek Crossing',
    difficulty: 4,
    position: 0,
    penaltyOnFailure: 2,
    injuryRisk: 8
  },

  DEEP_WATER: {
    id: 'DEEP_WATER',
    type: ObstacleType.WATER_JUMP,
    name: 'Deep Water Jump',
    difficulty: 7,
    position: 0,
    penaltyOnFailure: 4,
    injuryRisk: 20
  },

  // Ditches
  NARROW_DITCH: {
    id: 'NARROW_DITCH',
    type: ObstacleType.DITCH,
    name: 'Irrigation Ditch',
    difficulty: 5,
    position: 0,
    penaltyOnFailure: 3,
    injuryRisk: 12
  },

  WIDE_DITCH: {
    id: 'WIDE_DITCH',
    type: ObstacleType.DITCH,
    name: 'Wide Arroyo',
    difficulty: 8,
    position: 0,
    penaltyOnFailure: 5,
    injuryRisk: 25
  },

  // Walls
  STONE_WALL: {
    id: 'STONE_WALL',
    type: ObstacleType.WALL,
    name: 'Stone Boundary Wall',
    difficulty: 7,
    position: 0,
    penaltyOnFailure: 4,
    injuryRisk: 18
  },

  // Combinations
  FENCE_DITCH_COMBO: {
    id: 'FENCE_DITCH_COMBO',
    type: ObstacleType.COMBINATION,
    name: 'Fence and Ditch Combination',
    difficulty: 9,
    position: 0,
    penaltyOnFailure: 6,
    injuryRisk: 30
  }
};

// ============================================================================
// RACE TRACKS
// ============================================================================

export const RACE_TRACKS: Record<string, RaceTrack> = {
  // 1. RED GULCH FAIRGROUNDS
  RED_GULCH_FAIRGROUNDS: {
    id: 'RED_GULCH_FAIRGROUNDS',
    name: 'Red Gulch Fairgrounds',
    location: 'Red Gulch Territory',
    description: 'A basic frontier racing facility hosting weekly races for locals and travelers. The dirt track is well-maintained and offers a fair test of speed.',
    prestige: 3,

    primaryTerrain: RaceTrackTerrainType.DIRT,
    trackLength: 1760, // One mile

    availableRaceTypes: [
      RaceType.SPRINT,
      RaceType.MIDDLE_DISTANCE
    ],

    facilities: {
      stables: 20,
      grandstand: true,
      bettingBooth: true,
      vetServices: true,
      trainingGrounds: false
    },

    raceFrequency: 'WEEKLY',

    speedRecord: undefined,

    minimumLevel: 1,
    reputationRequired: 0,
    factionRestriction: undefined
  },

  // 2. WHISKEY BEND DOWNS
  WHISKEY_BEND_DOWNS: {
    id: 'WHISKEY_BEND_DOWNS',
    name: 'Whiskey Bend Downs',
    location: 'Whiskey Bend',
    description: 'The premier racing facility in the Sangre Territories. This legendary track has hosted champions for decades and offers the largest purses and most prestigious events in the frontier.',
    prestige: 10,

    primaryTerrain: RaceTrackTerrainType.DIRT,
    trackLength: 2640, // 1.5 miles

    availableRaceTypes: [
      RaceType.SPRINT,
      RaceType.MIDDLE_DISTANCE,
      RaceType.LONG_DISTANCE,
      RaceType.STEEPLECHASE
    ],

    facilities: {
      stables: 100,
      grandstand: true,
      bettingBooth: true,
      vetServices: true,
      trainingGrounds: true
    },

    raceFrequency: 'DAILY',

    speedRecord: undefined,

    minimumLevel: 5,
    reputationRequired: 50,
    factionRestriction: undefined
  },

  // 3. LONGHORN RANCH TRACK
  LONGHORN_RANCH_TRACK: {
    id: 'LONGHORN_RANCH_TRACK',
    name: 'Longhorn Ranch Private Track',
    location: 'Longhorn Ranch',
    description: 'A private racing facility owned by wealthy cattle barons. Specializes in endurance races across varied terrain and serves as a showcase for breeding stock.',
    prestige: 7,

    primaryTerrain: RaceTrackTerrainType.MIXED,
    trackLength: 8800, // 5 miles

    availableRaceTypes: [
      RaceType.MIDDLE_DISTANCE,
      RaceType.LONG_DISTANCE,
      RaceType.ENDURANCE
    ],

    facilities: {
      stables: 50,
      grandstand: false,
      bettingBooth: false,
      vetServices: true,
      trainingGrounds: true
    },

    raceFrequency: 'MONTHLY',

    speedRecord: undefined,

    minimumLevel: 10,
    reputationRequired: 100,
    factionRestriction: undefined
  },

  // 4. FORT ASHFORD CAVALRY COURSE
  FORT_ASHFORD_CAVALRY_COURSE: {
    id: 'FORT_ASHFORD_CAVALRY_COURSE',
    name: 'Fort Ashford Cavalry Course',
    location: 'Fort Ashford',
    description: 'A military steeplechase course designed to test cavalry mounts. Features challenging obstacles and technical jumps that separate true champions from pretenders.',
    prestige: 8,

    primaryTerrain: RaceTrackTerrainType.GRASS,
    trackLength: 3520, // 2 miles

    availableRaceTypes: [
      RaceType.STEEPLECHASE,
      RaceType.MIDDLE_DISTANCE
    ],

    facilities: {
      stables: 30,
      grandstand: true,
      bettingBooth: true,
      vetServices: true,
      trainingGrounds: true
    },

    raceFrequency: 'WEEKLY',

    speedRecord: undefined,

    minimumLevel: 8,
    reputationRequired: 75,
    factionRestriction: undefined
  },

  // 5. FRONTERA OUTLAW TRACK
  FRONTERA_OUTLAW_TRACK: {
    id: 'FRONTERA_OUTLAW_TRACK',
    name: 'The Frontera Outlaw Track',
    location: 'Frontera Badlands',
    description: 'An underground racing venue where anything goes. No rules, no regulations, just pure speed and danger. The track changes with each event as outlaws set up temporary courses.',
    prestige: 6,

    primaryTerrain: RaceTrackTerrainType.SAND,
    trackLength: 2200, // Variable

    availableRaceTypes: [
      RaceType.SPRINT,
      RaceType.MIDDLE_DISTANCE,
      RaceType.CHARIOT
    ],

    facilities: {
      stables: 15,
      grandstand: false,
      bettingBooth: true,
      vetServices: false,
      trainingGrounds: false
    },

    raceFrequency: 'WEEKLY',

    speedRecord: undefined,

    minimumLevel: 15,
    reputationRequired: 0, // Outlaws only care about gold
    factionRestriction: undefined
  },

  // Bonus: SPIRIT SPRINGS OASIS TRACK
  SPIRIT_SPRINGS_OASIS: {
    id: 'SPIRIT_SPRINGS_OASIS',
    name: 'Spirit Springs Oasis Track',
    location: 'Spirit Springs',
    description: 'A mystical racing ground where Native tribes have raced horses for generations. The grass track is blessed by spirits and said to favor horses with pure hearts.',
    prestige: 9,

    primaryTerrain: RaceTrackTerrainType.GRASS,
    trackLength: 1760, // One mile

    availableRaceTypes: [
      RaceType.SPRINT,
      RaceType.MIDDLE_DISTANCE,
      RaceType.ENDURANCE
    ],

    facilities: {
      stables: 40,
      grandstand: true,
      bettingBooth: true,
      vetServices: true,
      trainingGrounds: true
    },

    raceFrequency: 'MONTHLY',

    speedRecord: undefined,

    minimumLevel: 12,
    reputationRequired: 150,
    factionRestriction: undefined
  }
};

// ============================================================================
// TRACK-SPECIFIC OBSTACLE COURSES
// ============================================================================

/**
 * Obstacle courses for steeplechase races
 */
export const OBSTACLE_COURSES: Record<string, Obstacle[]> = {
  // Fort Ashford - Military style
  FORT_ASHFORD_BASIC: [
    { ...RACE_OBSTACLES.LOW_FENCE, position: 440 },
    { ...RACE_OBSTACLES.SHALLOW_WATER, position: 880 },
    { ...RACE_OBSTACLES.HIGH_FENCE, position: 1320 },
    { ...RACE_OBSTACLES.NARROW_DITCH, position: 1760 }
  ],

  FORT_ASHFORD_ADVANCED: [
    { ...RACE_OBSTACLES.HIGH_FENCE, position: 352 },
    { ...RACE_OBSTACLES.SHALLOW_WATER, position: 704 },
    { ...RACE_OBSTACLES.STONE_WALL, position: 1056 },
    { ...RACE_OBSTACLES.NARROW_DITCH, position: 1408 },
    { ...RACE_OBSTACLES.FENCE_DITCH_COMBO, position: 1760 },
    { ...RACE_OBSTACLES.DEEP_WATER, position: 2112 }
  ],

  // Whiskey Bend - Championship course
  WHISKEY_BEND_STEEPLECHASE: [
    { ...RACE_OBSTACLES.LOW_FENCE, position: 440 },
    { ...RACE_OBSTACLES.HIGH_FENCE, position: 880 },
    { ...RACE_OBSTACLES.SHALLOW_WATER, position: 1320 },
    { ...RACE_OBSTACLES.STONE_WALL, position: 1760 },
    { ...RACE_OBSTACLES.WIDE_DITCH, position: 2200 },
    { ...RACE_OBSTACLES.FENCE_DITCH_COMBO, position: 2640 }
  ],

  // Longhorn Ranch - Natural obstacles
  LONGHORN_RANCH_ENDURANCE: [
    { ...RACE_OBSTACLES.SHALLOW_WATER, position: 1760 },
    { ...RACE_OBSTACLES.LOW_FENCE, position: 3520 },
    { ...RACE_OBSTACLES.NARROW_DITCH, position: 5280 },
    { ...RACE_OBSTACLES.SHALLOW_WATER, position: 7040 }
  ]
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get track by ID
 */
export function getTrack(trackId: string): RaceTrack | undefined {
  return RACE_TRACKS[trackId];
}

/**
 * Get all tracks available at a level
 */
export function getTracksForLevel(level: number): RaceTrack[] {
  return Object.values(RACE_TRACKS).filter(
    track => !track.minimumLevel || track.minimumLevel <= level
  );
}

/**
 * Get tracks that support a specific race type
 */
export function getTracksForRaceType(raceType: RaceType): RaceTrack[] {
  return Object.values(RACE_TRACKS).filter(
    track => track.availableRaceTypes.includes(raceType)
  );
}

/**
 * Get obstacles for a course
 */
export function getObstacleCourse(courseId: string): Obstacle[] {
  return OBSTACLE_COURSES[courseId] || [];
}

/**
 * Get all available tracks
 */
export function getAllTracks(): RaceTrack[] {
  return Object.values(RACE_TRACKS);
}

/**
 * Get track prestige rating
 */
export function getTrackPrestige(trackId: string): number {
  const track = getTrack(trackId);
  return track?.prestige || 1;
}
