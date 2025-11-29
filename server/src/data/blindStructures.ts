/**
 * Blind Structure Definitions
 * Various blind level schedules for different tournament formats
 */

import type { BlindLevel } from '@desperados/shared';

/**
 * Standard blind structure for regular tournaments
 * 15-minute levels, gradual increase
 */
export const STANDARD_STRUCTURE: BlindLevel[] = [
  { level: 1, smallBlind: 10, bigBlind: 20, duration: 15 },
  { level: 2, smallBlind: 15, bigBlind: 30, duration: 15 },
  { level: 3, smallBlind: 25, bigBlind: 50, duration: 15 },
  { level: 4, smallBlind: 50, bigBlind: 100, duration: 15 },
  { level: 5, smallBlind: 75, bigBlind: 150, duration: 15 },
  { level: 6, smallBlind: 100, bigBlind: 200, ante: 20, duration: 15 },
  { level: 7, smallBlind: 150, bigBlind: 300, ante: 30, duration: 15 },
  { level: 8, smallBlind: 200, bigBlind: 400, ante: 40, duration: 15 },
  { level: 9, smallBlind: 300, bigBlind: 600, ante: 60, duration: 15 },
  { level: 10, smallBlind: 400, bigBlind: 800, ante: 80, duration: 15 },
  { level: 11, smallBlind: 600, bigBlind: 1200, ante: 120, duration: 15 },
  { level: 12, smallBlind: 800, bigBlind: 1600, ante: 160, duration: 15 },
  { level: 13, smallBlind: 1000, bigBlind: 2000, ante: 200, duration: 15 },
  { level: 14, smallBlind: 1500, bigBlind: 3000, ante: 300, duration: 15 },
  { level: 15, smallBlind: 2000, bigBlind: 4000, ante: 400, duration: 15 }
];

/**
 * Turbo blind structure
 * 10-minute levels, faster progression
 */
export const TURBO_STRUCTURE: BlindLevel[] = [
  { level: 1, smallBlind: 10, bigBlind: 20, duration: 10 },
  { level: 2, smallBlind: 20, bigBlind: 40, duration: 10 },
  { level: 3, smallBlind: 30, bigBlind: 60, duration: 10 },
  { level: 4, smallBlind: 50, bigBlind: 100, duration: 10 },
  { level: 5, smallBlind: 75, bigBlind: 150, duration: 10 },
  { level: 6, smallBlind: 125, bigBlind: 250, ante: 25, duration: 10 },
  { level: 7, smallBlind: 200, bigBlind: 400, ante: 40, duration: 10 },
  { level: 8, smallBlind: 300, bigBlind: 600, ante: 60, duration: 10 },
  { level: 9, smallBlind: 500, bigBlind: 1000, ante: 100, duration: 10 },
  { level: 10, smallBlind: 800, bigBlind: 1600, ante: 160, duration: 10 },
  { level: 11, smallBlind: 1200, bigBlind: 2400, ante: 240, duration: 10 },
  { level: 12, smallBlind: 2000, bigBlind: 4000, ante: 400, duration: 10 },
  { level: 13, smallBlind: 3000, bigBlind: 6000, ante: 600, duration: 10 }
];

/**
 * Hyper-Turbo blind structure
 * 5-minute levels, very fast action
 */
export const HYPER_TURBO_STRUCTURE: BlindLevel[] = [
  { level: 1, smallBlind: 10, bigBlind: 20, duration: 5 },
  { level: 2, smallBlind: 25, bigBlind: 50, duration: 5 },
  { level: 3, smallBlind: 50, bigBlind: 100, duration: 5 },
  { level: 4, smallBlind: 100, bigBlind: 200, duration: 5 },
  { level: 5, smallBlind: 150, bigBlind: 300, ante: 30, duration: 5 },
  { level: 6, smallBlind: 250, bigBlind: 500, ante: 50, duration: 5 },
  { level: 7, smallBlind: 400, bigBlind: 800, ante: 80, duration: 5 },
  { level: 8, smallBlind: 600, bigBlind: 1200, ante: 120, duration: 5 },
  { level: 9, smallBlind: 1000, bigBlind: 2000, ante: 200, duration: 5 },
  { level: 10, smallBlind: 1500, bigBlind: 3000, ante: 300, duration: 5 },
  { level: 11, smallBlind: 2500, bigBlind: 5000, ante: 500, duration: 5 },
  { level: 12, smallBlind: 4000, bigBlind: 8000, ante: 800, duration: 5 }
];

/**
 * Deep Stack structure for championships
 * 20-minute levels, slower progression, more play
 */
export const DEEP_STACK_STRUCTURE: BlindLevel[] = [
  { level: 1, smallBlind: 25, bigBlind: 50, duration: 20 },
  { level: 2, smallBlind: 50, bigBlind: 100, duration: 20 },
  { level: 3, smallBlind: 75, bigBlind: 150, duration: 20 },
  { level: 4, smallBlind: 100, bigBlind: 200, duration: 20 },
  { level: 5, smallBlind: 150, bigBlind: 300, duration: 20 },
  { level: 6, smallBlind: 200, bigBlind: 400, ante: 40, duration: 20 },
  { level: 7, smallBlind: 300, bigBlind: 600, ante: 60, duration: 20 },
  { level: 8, smallBlind: 400, bigBlind: 800, ante: 80, duration: 20 },
  { level: 9, smallBlind: 500, bigBlind: 1000, ante: 100, duration: 20 },
  { level: 10, smallBlind: 600, bigBlind: 1200, ante: 120, duration: 20 },
  { level: 11, smallBlind: 800, bigBlind: 1600, ante: 160, duration: 20 },
  { level: 12, smallBlind: 1000, bigBlind: 2000, ante: 200, duration: 20 },
  { level: 13, smallBlind: 1500, bigBlind: 3000, ante: 300, duration: 20 },
  { level: 14, smallBlind: 2000, bigBlind: 4000, ante: 400, duration: 20 },
  { level: 15, smallBlind: 2500, bigBlind: 5000, ante: 500, duration: 20 },
  { level: 16, smallBlind: 3000, bigBlind: 6000, ante: 600, duration: 20 },
  { level: 17, smallBlind: 4000, bigBlind: 8000, ante: 800, duration: 20 },
  { level: 18, smallBlind: 5000, bigBlind: 10000, ante: 1000, duration: 20 }
];

/**
 * Sit-n-Go structure
 * Short format for quick games
 */
export const SIT_N_GO_STRUCTURE: BlindLevel[] = [
  { level: 1, smallBlind: 10, bigBlind: 20, duration: 10 },
  { level: 2, smallBlind: 15, bigBlind: 30, duration: 10 },
  { level: 3, smallBlind: 25, bigBlind: 50, duration: 10 },
  { level: 4, smallBlind: 50, bigBlind: 100, duration: 10 },
  { level: 5, smallBlind: 75, bigBlind: 150, duration: 10 },
  { level: 6, smallBlind: 100, bigBlind: 200, ante: 20, duration: 10 },
  { level: 7, smallBlind: 150, bigBlind: 300, ante: 30, duration: 10 },
  { level: 8, smallBlind: 200, bigBlind: 400, ante: 40, duration: 10 },
  { level: 9, smallBlind: 300, bigBlind: 600, ante: 60, duration: 10 },
  { level: 10, smallBlind: 500, bigBlind: 1000, ante: 100, duration: 10 }
];

/**
 * Satellite structure
 * Designed to award specific number of seats
 */
export const SATELLITE_STRUCTURE: BlindLevel[] = [
  { level: 1, smallBlind: 10, bigBlind: 20, duration: 12 },
  { level: 2, smallBlind: 20, bigBlind: 40, duration: 12 },
  { level: 3, smallBlind: 30, bigBlind: 60, duration: 12 },
  { level: 4, smallBlind: 50, bigBlind: 100, duration: 12 },
  { level: 5, smallBlind: 100, bigBlind: 200, ante: 20, duration: 12 },
  { level: 6, smallBlind: 150, bigBlind: 300, ante: 30, duration: 12 },
  { level: 7, smallBlind: 250, bigBlind: 500, ante: 50, duration: 12 },
  { level: 8, smallBlind: 400, bigBlind: 800, ante: 80, duration: 12 },
  { level: 9, smallBlind: 600, bigBlind: 1200, ante: 120, duration: 12 },
  { level: 10, smallBlind: 1000, bigBlind: 2000, ante: 200, duration: 12 }
];

/**
 * Blind structure lookup by ID
 */
export const BLIND_STRUCTURES: Record<string, BlindLevel[]> = {
  standard: STANDARD_STRUCTURE,
  turbo: TURBO_STRUCTURE,
  hyper_turbo: HYPER_TURBO_STRUCTURE,
  deep_stack: DEEP_STACK_STRUCTURE,
  sit_n_go: SIT_N_GO_STRUCTURE,
  satellite: SATELLITE_STRUCTURE
};

/**
 * Get blind structure by ID
 */
export function getBlindStructure(structureId: string): BlindLevel[] {
  const structure = BLIND_STRUCTURES[structureId];
  if (!structure) {
    throw new Error(`Unknown blind structure: ${structureId}`);
  }
  return structure;
}

/**
 * Calculate tournament duration estimate
 */
export function estimateTournamentDuration(
  structureId: string,
  playerCount: number
): number {
  const structure = getBlindStructure(structureId);

  // Estimate based on player count and blind levels
  // Rule of thumb: Each blind level eliminates ~10-15% of remaining players
  const levelsNeeded = Math.ceil(Math.log2(playerCount)) + 3; // +3 for final table play
  const avgDuration = structure.slice(0, levelsNeeded).reduce((sum, level) => sum + level.duration, 0);

  return avgDuration;
}

/**
 * Get current blind level based on elapsed time
 */
export function getCurrentBlindLevel(
  structureId: string,
  startTime: Date
): { level: BlindLevel; levelIndex: number } {
  const structure = getBlindStructure(structureId);
  const elapsed = Date.now() - startTime.getTime();
  const elapsedMinutes = elapsed / (1000 * 60);

  let cumulativeTime = 0;
  for (let i = 0; i < structure.length; i++) {
    cumulativeTime += structure[i].duration;
    if (elapsedMinutes < cumulativeTime) {
      return { level: structure[i], levelIndex: i };
    }
  }

  // Return last level if tournament has gone beyond structure
  return {
    level: structure[structure.length - 1],
    levelIndex: structure.length - 1
  };
}

/**
 * Calculate when next blind increase occurs
 */
export function getNextBlindIncreaseTime(
  structureId: string,
  startTime: Date,
  currentLevelIndex: number
): Date {
  const structure = getBlindStructure(structureId);

  if (currentLevelIndex >= structure.length - 1) {
    // No more blind increases
    return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Far future
  }

  // Calculate cumulative time to next level
  let cumulativeMinutes = 0;
  for (let i = 0; i <= currentLevelIndex; i++) {
    cumulativeMinutes += structure[i].duration;
  }

  return new Date(startTime.getTime() + cumulativeMinutes * 60 * 1000);
}
