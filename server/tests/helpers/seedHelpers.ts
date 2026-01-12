/**
 * Test Seed Helpers
 *
 * Lightweight seeding functions for tests that need game data.
 * Uses the same data as production seeds but optimized for test isolation.
 *
 * IMPORTANT: These functions are for use in beforeAll/beforeEach hooks.
 * The global setup.ts clears collections after each test, so seed data
 * must be re-inserted for tests that need it.
 */

import mongoose from 'mongoose';

/**
 * Seed minimal location data for tests
 * Creates just a few essential locations to reduce test overhead
 */
export async function seedMinimalLocations(): Promise<void> {
  const { Location } = await import('../../src/models/Location.model');

  const minimalLocations = [
    {
      _id: new mongoose.Types.ObjectId('6501a0000000000000000001'),
      name: 'Red Gulch',
      description: 'A bustling frontier town',
      shortDescription: 'Frontier town',
      type: 'town',
      region: 'settler_territory',
      zone: 'SETTLER_HEARTLAND',
      isZoneHub: true,
      icon: '🏘️',
      atmosphere: 'The smell of dust and opportunity',
      availableActions: [],
      availableCrimes: [],
      jobs: [],
      shops: [],
      npcs: [],
      connections: [],
      dangerLevel: 1,
      factionInfluence: { settlerAlliance: 80, nahiCoalition: 10, frontera: 10 },
      isUnlocked: true,
      isHidden: false
    },
    {
      _id: new mongoose.Types.ObjectId('6501a0000000000000000002'),
      name: 'The Frontera',
      description: 'A lawless border town',
      shortDescription: 'Border town',
      type: 'town',
      region: 'outlaw_territory',
      zone: 'FRONTERA_BORDERLANDS',
      isZoneHub: true,
      icon: '🌵',
      atmosphere: 'Dangerous but free',
      availableActions: [],
      availableCrimes: [],
      jobs: [],
      shops: [],
      npcs: [],
      connections: [],
      dangerLevel: 3,
      factionInfluence: { settlerAlliance: 10, nahiCoalition: 20, frontera: 70 },
      isUnlocked: true,
      isHidden: false
    },
    {
      _id: new mongoose.Types.ObjectId('6501a0000000000000000004'),
      name: 'Kaiowa Mesa',
      description: 'Sacred lands of the Nahi Coalition',
      shortDescription: 'Coalition lands',
      type: 'settlement',
      region: 'coalition_lands',
      zone: 'COALITION_HEARTLAND',
      isZoneHub: true,
      icon: '🏔️',
      atmosphere: 'Ancient and spiritual',
      availableActions: [],
      availableCrimes: [],
      jobs: [],
      shops: [],
      npcs: [],
      connections: [],
      dangerLevel: 2,
      factionInfluence: { settlerAlliance: 5, nahiCoalition: 85, frontera: 10 },
      isUnlocked: true,
      isHidden: false
    }
  ];

  // Use insertMany with ordered: false to handle duplicates gracefully
  try {
    await Location.insertMany(minimalLocations, { ordered: false });
  } catch (err: any) {
    // Ignore duplicate key errors (E11000) - data already exists
    if (err.code !== 11000 && !err.message?.includes('E11000')) {
      throw err;
    }
  }
}

/**
 * Seed full location data from production seeds
 * Use this for comprehensive location tests
 */
export async function seedAllLocations(): Promise<void> {
  const { seedLocations } = await import('../../src/seeds/locations.seed');
  await seedLocations();
}

/**
 * Seed minimal item data for tests
 */
export async function seedMinimalItems(): Promise<void> {
  const { Item } = await import('../../src/models/Item.model');

  const minimalItems = [
    {
      _id: new mongoose.Types.ObjectId('650100000000000000000001'),
      itemId: 'iron-ore',
      name: 'Iron Ore',
      description: 'Raw iron ore for smelting',
      category: 'material',
      subcategory: 'ore',
      rarity: 'common',
      baseValue: 5,
      stackable: true,
      maxStack: 100
    },
    {
      _id: new mongoose.Types.ObjectId('650100000000000000000002'),
      itemId: 'gold-nugget',
      name: 'Gold Nugget',
      description: 'A small nugget of gold',
      category: 'material',
      subcategory: 'ore',
      rarity: 'rare',
      baseValue: 50,
      stackable: true,
      maxStack: 100
    },
    {
      _id: new mongoose.Types.ObjectId('650100000000000000000003'),
      itemId: 'basic-pistol',
      name: 'Basic Pistol',
      description: 'A simple six-shooter',
      category: 'weapon',
      subcategory: 'pistol',
      rarity: 'common',
      baseValue: 100,
      stackable: false,
      maxStack: 1
    }
  ];

  try {
    await Item.insertMany(minimalItems, { ordered: false });
  } catch (err: any) {
    if (err.code !== 11000 && !err.message?.includes('E11000')) {
      throw err;
    }
  }
}

/**
 * Seed full item data from production seeds
 */
export async function seedAllItems(): Promise<void> {
  const { seedItems } = await import('../../src/seeds/items.seed');
  await seedItems();
}

/**
 * Seed base game data - locations, items, and essential NPCs
 * Use this for integration tests that need a realistic game environment
 */
export async function seedBaseGameData(): Promise<void> {
  await seedMinimalLocations();
  await seedMinimalItems();
}

/**
 * Seed comprehensive game data for exhaustive tests
 * This seeds all production data - use sparingly as it's slow
 */
export async function seedFullGameData(): Promise<void> {
  const { seedAll } = await import('../../src/seeds');
  // Note: seedAll connects to DB itself, but we're already connected in tests
  // We need to call individual seed functions instead
  await seedAllLocations();
  await seedAllItems();

  // Add more seeds as needed:
  // const { seedEncounters } = await import('../../src/seeds/encounters.seed');
  // await seedEncounters();
}

/**
 * Get a valid test location ID
 * Returns the ObjectId for Red Gulch (starter town)
 */
export function getTestLocationId(): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId('6501a0000000000000000001');
}

/**
 * Get test location IDs for all three faction hubs
 */
export const TEST_LOCATION_IDS = {
  RED_GULCH: new mongoose.Types.ObjectId('6501a0000000000000000001'),
  THE_FRONTERA: new mongoose.Types.ObjectId('6501a0000000000000000002'),
  KAIOWA_MESA: new mongoose.Types.ObjectId('6501a0000000000000000004')
};

/**
 * Create a test character with proper location reference
 * Helper for tests that need a character with valid location
 */
export async function createSeededTestCharacter(
  userId: string | mongoose.Types.ObjectId,
  overrides?: Record<string, any>
): Promise<any> {
  const { Character } = await import('../../src/models/Character.model');

  // Ensure locations are seeded
  await seedMinimalLocations();

  const characterData = {
    userId: new mongoose.Types.ObjectId(userId.toString()),
    name: `TestChar_${Date.now()}`,
    faction: 'SETTLER_ALLIANCE',
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    energy: 100,
    maxEnergy: 100,
    dollars: 100,
    gold: 100, // backward compat
    currentLocation: TEST_LOCATION_IDS.RED_GULCH,
    locationId: TEST_LOCATION_IDS.RED_GULCH.toString(),
    appearance: {
      bodyType: 'male',
      skinTone: 5,
      facePreset: 1,
      hairStyle: 3,
      hairColor: 2
    },
    stats: {
      cunning: 10,
      spirit: 10,
      combat: 10,
      craft: 10
    },
    skills: [],
    inventory: [],
    activeEffects: [],
    combatStats: {
      wins: 0,
      losses: 0,
      totalDamage: 0,
      kills: 0
    },
    isJailed: false,
    wantedLevel: 0,
    bountyAmount: 0,
    ...overrides
  };

  return await Character.create(characterData);
}

/**
 * Create test character with high total level (for gang tests)
 * Sets skills to achieve target total level
 */
export async function createHighLevelTestCharacter(
  userId: string | mongoose.Types.ObjectId,
  targetTotalLevel: number = 100
): Promise<any> {
  const { Character } = await import('../../src/models/Character.model');

  // Ensure locations are seeded
  await seedMinimalLocations();

  // Calculate skill levels to reach target total level
  // Total level = sum of all skill levels
  // Start with 10 skills at level 10 each = 100 total
  const baseSkills = [
    { skillId: 'combat', level: 10, experience: 0 },
    { skillId: 'gunslinging', level: 10, experience: 0 },
    { skillId: 'riding', level: 10, experience: 0 },
    { skillId: 'survival', level: 10, experience: 0 },
    { skillId: 'trading', level: 10, experience: 0 },
    { skillId: 'mining', level: 10, experience: 0 },
    { skillId: 'crafting', level: 10, experience: 0 },
    { skillId: 'lockpicking', level: 10, experience: 0 },
    { skillId: 'stealth', level: 10, experience: 0 },
    { skillId: 'persuasion', level: 10, experience: 0 }
  ];

  const characterData = {
    userId: new mongoose.Types.ObjectId(userId.toString()),
    name: `HighLevel_${Date.now()}`,
    faction: 'SETTLER_ALLIANCE',
    level: Math.floor(targetTotalLevel / 10),
    experience: 0,
    experienceToNextLevel: 100,
    energy: 100,
    maxEnergy: 100,
    dollars: 1000,
    gold: 1000,
    currentLocation: TEST_LOCATION_IDS.RED_GULCH,
    locationId: TEST_LOCATION_IDS.RED_GULCH.toString(),
    appearance: {
      bodyType: 'male',
      skinTone: 5,
      facePreset: 1,
      hairStyle: 3,
      hairColor: 2
    },
    stats: {
      cunning: 20,
      spirit: 20,
      combat: 20,
      craft: 20
    },
    skills: baseSkills,
    inventory: [],
    activeEffects: [],
    combatStats: {
      wins: 10,
      losses: 5,
      totalDamage: 1000,
      kills: 5
    },
    isJailed: false,
    wantedLevel: 0,
    bountyAmount: 0,
    totalLevel: targetTotalLevel
  };

  return await Character.create(characterData);
}
