/**
 * Test Data Fixtures
 * Utilities for generating consistent test data across E2E tests
 */

/**
 * Generate unique test user data
 * Creates email, username, and password for test accounts
 * @param {string} [prefix='testuser'] - Prefix for username/email
 * @param {number} [timestamp] - Optional timestamp (default: Date.now())
 * @returns {Object} - User data object {email, username, password}
 */
function generateTestUser(prefix = 'testuser', timestamp = null) {
  const ts = timestamp || Date.now();

  return {
    email: `${prefix}${ts}@e2e.test`,
    username: `${prefix}${ts}`,
    password: 'Test123!@#'
  };
}

/**
 * Generate unique character data
 * Creates character name and faction for character creation
 * @param {string} [prefix='Hero'] - Prefix for character name
 * @param {number} [timestamp] - Optional timestamp (default: Date.now())
 * @param {string} [faction] - Optional faction ID (default: 'frontera')
 * @returns {Object} - Character data object {name, faction}
 */
function generateCharacter(prefix = 'Hero', timestamp = null, faction = null) {
  const ts = timestamp || Date.now();
  const factions = ['frontera', 'settler', 'nahi'];

  return {
    name: `${prefix}${ts}`,
    faction: faction || factions[Math.floor(Math.random() * factions.length)]
  };
}

/**
 * Generate full player data (user + character)
 * Combines generateTestUser and generateCharacter with matching timestamps
 * @param {string} [userPrefix='player'] - Prefix for user credentials
 * @param {string} [characterPrefix='Hero'] - Prefix for character name
 * @param {string} [faction] - Optional faction ID
 * @returns {Object} - Full player data {user, character, timestamp}
 */
function generatePlayer(userPrefix = 'player', characterPrefix = 'Hero', faction = null) {
  const timestamp = Date.now();

  return {
    user: generateTestUser(userPrefix, timestamp),
    character: generateCharacter(characterPrefix, timestamp, faction),
    timestamp
  };
}

/**
 * Predefined test users for reuse across tests
 * These can be created once and reused in multiple test scenarios
 */
const TEST_USERS = {
  // Regular test user
  REGULAR: {
    email: 'testuser@e2e.test',
    username: 'testuser',
    password: 'Test123!@#'
  },

  // Returning player with existing character
  RETURNING: {
    email: 'returning@e2e.test',
    username: 'returningplayer',
    password: 'Test123!@#'
  },

  // Player for combat tests
  FIGHTER: {
    email: 'fighter@e2e.test',
    username: 'fighter',
    password: 'Test123!@#'
  },

  // Player for trading/marketplace tests
  TRADER: {
    email: 'trader@e2e.test',
    username: 'trader',
    password: 'Test123!@#'
  },

  // Player for gang tests
  GANG_LEADER: {
    email: 'gangleader@e2e.test',
    username: 'gangleader',
    password: 'Test123!@#'
  },

  // Second player for multiplayer tests
  PLAYER_TWO: {
    email: 'player2@e2e.test',
    username: 'player2',
    password: 'Test123!@#'
  }
};

/**
 * Predefined characters for test users
 * Character data matching TEST_USERS
 */
const TEST_CHARACTERS = {
  REGULAR: {
    name: 'TestHero',
    faction: 'frontera'
  },

  RETURNING: {
    name: 'Veteran',
    faction: 'settler'
  },

  FIGHTER: {
    name: 'Brawler',
    faction: 'frontera'
  },

  TRADER: {
    name: 'Merchant',
    faction: 'settler'
  },

  GANG_LEADER: {
    name: 'Boss',
    faction: 'frontera'
  },

  PLAYER_TWO: {
    name: 'Sidekick',
    faction: 'nahi'
  }
};

/**
 * Game constants for testing
 */
const GAME_CONSTANTS = {
  // Factions
  FACTIONS: {
    FRONTERA: 'frontera',
    SETTLER: 'settler',
    NAHI: 'nahi'
  },

  // Starting resources
  STARTING_GOLD: 50,
  STARTING_ENERGY: 10,
  STARTING_LEVEL: 1,

  // Energy costs
  ENERGY_COSTS: {
    TRAIN_SKILL: 1,
    COMPLETE_ACTION: 1,
    DUEL: 2
  },

  // Time constants (in milliseconds)
  TIMINGS: {
    SHORT_WAIT: 500,
    MEDIUM_WAIT: 1000,
    LONG_WAIT: 2000,
    NAVIGATION_TIMEOUT: 10000,
    ACTION_TIMEOUT: 15000
  }
};

/**
 * Shop item test data
 * Common items for shop and equipment tests
 */
const SHOP_ITEMS = {
  WEAPONS: {
    RUSTY_REVOLVER: {
      name: 'Rusty Revolver',
      category: 'weapon',
      slot: 'primary',
      minCost: 10
    },
    BOWIE_KNIFE: {
      name: 'Bowie Knife',
      category: 'weapon',
      slot: 'secondary',
      minCost: 15
    }
  },

  ARMOR: {
    LEATHER_VEST: {
      name: 'Leather Vest',
      category: 'armor',
      slot: 'chest',
      minCost: 20
    },
    COWBOY_HAT: {
      name: 'Cowboy Hat',
      category: 'armor',
      slot: 'head',
      minCost: 10
    }
  },

  CONSUMABLES: {
    HEALTH_TONIC: {
      name: 'Health Tonic',
      category: 'consumable',
      effect: 'restore_health',
      minCost: 5
    }
  }
};

/**
 * Skill test data
 * Skills available for training
 */
const SKILLS = {
  COMBAT: {
    QUICK_DRAW: {
      name: 'Quick Draw',
      category: 'combat',
      description: 'Draw your weapon faster'
    },
    STEADY_AIM: {
      name: 'Steady Aim',
      category: 'combat',
      description: 'Improve shooting accuracy'
    }
  },

  SOCIAL: {
    PERSUASION: {
      name: 'Persuasion',
      category: 'social',
      description: 'Better at convincing others'
    },
    INTIMIDATION: {
      name: 'Intimidation',
      category: 'social',
      description: 'Strike fear into opponents'
    }
  },

  SURVIVAL: {
    TRACKING: {
      name: 'Tracking',
      category: 'survival',
      description: 'Follow trails and find targets'
    },
    CRAFTING: {
      name: 'Crafting',
      category: 'survival',
      description: 'Create items from materials'
    }
  }
};

/**
 * Location test data
 * Game locations for navigation tests
 */
const LOCATIONS = {
  RED_GULCH: {
    name: 'Red Gulch',
    type: 'town',
    description: 'Settler capital and boomtown'
  },

  FRONTERA_OUTPOST: {
    name: 'Frontera Outpost',
    type: 'settlement',
    description: 'Frontier trading post'
  },

  DEADWOOD: {
    name: 'Deadwood',
    type: 'town',
    description: 'Lawless mining town'
  }
};

/**
 * Gang test data
 */
const GANG_DATA = {
  DEFAULT: {
    name: 'Test Gang',
    description: 'E2E test gang',
    minGold: 100
  },

  RIVAL: {
    name: 'Rival Gang',
    description: 'Competing gang for tests'
  }
};

/**
 * Generate random number between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random integer
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random item from array
 * @param {Array} array - Array to select from
 * @returns {*} - Random item
 */
function randomItem(array) {
  return array[randomInt(0, array.length - 1)];
}

/**
 * Delay helper (for test timing)
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create unique identifier for test runs
 * Useful for isolating test data
 * @param {string} [prefix='test'] - Prefix for ID
 * @returns {string} - Unique identifier
 */
function createTestId(prefix = 'test') {
  return `${prefix}_${Date.now()}_${randomInt(1000, 9999)}`;
}

module.exports = {
  // Generator functions
  generateTestUser,
  generateCharacter,
  generatePlayer,

  // Predefined data
  TEST_USERS,
  TEST_CHARACTERS,
  GAME_CONSTANTS,
  SHOP_ITEMS,
  SKILLS,
  LOCATIONS,
  GANG_DATA,

  // Utility functions
  randomInt,
  randomItem,
  delay,
  createTestId
};
