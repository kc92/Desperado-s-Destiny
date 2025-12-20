/**
 * Test Data Fixtures for Playwright
 * Utilities for generating consistent test data across E2E tests
 */

export interface TestUser {
  email: string;
  username: string;
  password: string;
}

export interface TestCharacter {
  name: string;
  faction: 'frontera' | 'settler' | 'nahi';
}

export interface PlayerData {
  user: TestUser;
  character: TestCharacter;
  timestamp: number;
}

/**
 * Generate unique test user data
 */
export function generateTestUser(prefix = 'testuser', timestamp?: number): TestUser {
  const ts = timestamp || Date.now();
  return {
    email: `${prefix}${ts}@e2e.test`,
    username: `${prefix}${ts}`,
    password: 'Test123!@#'
  };
}

/**
 * Generate unique character data
 */
export function generateCharacter(
  prefix = 'Hero',
  timestamp?: number,
  faction?: 'frontera' | 'settler' | 'nahi'
): TestCharacter {
  const ts = timestamp || Date.now();
  const factions: Array<'frontera' | 'settler' | 'nahi'> = ['frontera', 'settler', 'nahi'];
  return {
    name: `${prefix}${ts}`,
    faction: faction || factions[Math.floor(Math.random() * factions.length)]
  };
}

/**
 * Generate full player data (user + character)
 */
export function generatePlayer(
  userPrefix = 'player',
  characterPrefix = 'Hero',
  faction?: 'frontera' | 'settler' | 'nahi'
): PlayerData {
  const timestamp = Date.now();
  return {
    user: generateTestUser(userPrefix, timestamp),
    character: generateCharacter(characterPrefix, timestamp, faction),
    timestamp
  };
}

/**
 * Game constants for testing
 */
export const GAME_CONSTANTS = {
  FACTIONS: {
    FRONTERA: 'frontera' as const,
    SETTLER: 'settler' as const,
    NAHI: 'nahi' as const
  },
  STARTING_GOLD: 50,
  STARTING_ENERGY: 10,
  STARTING_LEVEL: 1,
  TIMINGS: {
    SHORT_WAIT: 500,
    MEDIUM_WAIT: 1000,
    LONG_WAIT: 2000,
    NAVIGATION_TIMEOUT: 10000,
    ACTION_TIMEOUT: 15000
  }
};

/**
 * Delay helper (for test timing)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
