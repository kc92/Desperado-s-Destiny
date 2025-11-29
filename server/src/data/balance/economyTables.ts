/**
 * Economy Balance Tables
 *
 * Comprehensive data tables for economic balancing.
 * These tables provide quick reference for all economic values in the game.
 */

import { ItemRarity, LevelTier } from '../../config/economy.config';

/**
 * Item pricing by tier and rarity
 * Format: [minPrice, maxPrice, recommendedPrice]
 */
export const ITEM_PRICES = {
  weapons: {
    [ItemRarity.COMMON]: {
      [LevelTier.NOVICE]: [50, 200, 100],
      [LevelTier.JOURNEYMAN]: [200, 800, 400],
      [LevelTier.VETERAN]: [800, 3000, 1500],
      [LevelTier.EXPERT]: [3000, 12000, 6000],
      [LevelTier.MASTER]: [12000, 50000, 25000]
    },
    [ItemRarity.UNCOMMON]: {
      [LevelTier.NOVICE]: [200, 500, 350],
      [LevelTier.JOURNEYMAN]: [500, 2000, 1000],
      [LevelTier.VETERAN]: [2000, 8000, 4000],
      [LevelTier.EXPERT]: [8000, 30000, 15000],
      [LevelTier.MASTER]: [30000, 120000, 60000]
    },
    [ItemRarity.RARE]: {
      [LevelTier.NOVICE]: [500, 1500, 1000],
      [LevelTier.JOURNEYMAN]: [1500, 6000, 3000],
      [LevelTier.VETERAN]: [6000, 25000, 12000],
      [LevelTier.EXPERT]: [25000, 100000, 50000],
      [LevelTier.MASTER]: [100000, 400000, 200000]
    },
    [ItemRarity.EPIC]: {
      [LevelTier.NOVICE]: [1500, 5000, 3000],
      [LevelTier.JOURNEYMAN]: [5000, 20000, 10000],
      [LevelTier.VETERAN]: [20000, 75000, 40000],
      [LevelTier.EXPERT]: [75000, 300000, 150000],
      [LevelTier.MASTER]: [300000, 1000000, 500000]
    },
    [ItemRarity.LEGENDARY]: {
      [LevelTier.NOVICE]: [5000, 15000, 10000],
      [LevelTier.JOURNEYMAN]: [15000, 60000, 30000],
      [LevelTier.VETERAN]: [60000, 250000, 125000],
      [LevelTier.EXPERT]: [250000, 1000000, 500000],
      [LevelTier.MASTER]: [1000000, 5000000, 2500000]
    }
  },
  armor: {
    [ItemRarity.COMMON]: {
      [LevelTier.NOVICE]: [40, 150, 80],
      [LevelTier.JOURNEYMAN]: [150, 600, 300],
      [LevelTier.VETERAN]: [600, 2500, 1200],
      [LevelTier.EXPERT]: [2500, 10000, 5000],
      [LevelTier.MASTER]: [10000, 40000, 20000]
    },
    [ItemRarity.UNCOMMON]: {
      [LevelTier.NOVICE]: [150, 400, 250],
      [LevelTier.JOURNEYMAN]: [400, 1600, 800],
      [LevelTier.VETERAN]: [1600, 6500, 3200],
      [LevelTier.EXPERT]: [6500, 25000, 12500],
      [LevelTier.MASTER]: [25000, 100000, 50000]
    },
    [ItemRarity.RARE]: {
      [LevelTier.NOVICE]: [400, 1200, 800],
      [LevelTier.JOURNEYMAN]: [1200, 5000, 2500],
      [LevelTier.VETERAN]: [5000, 20000, 10000],
      [LevelTier.EXPERT]: [20000, 80000, 40000],
      [LevelTier.MASTER]: [80000, 320000, 160000]
    },
    [ItemRarity.EPIC]: {
      [LevelTier.NOVICE]: [1200, 4000, 2500],
      [LevelTier.JOURNEYMAN]: [4000, 16000, 8000],
      [LevelTier.VETERAN]: [16000, 60000, 32000],
      [LevelTier.EXPERT]: [60000, 240000, 120000],
      [LevelTier.MASTER]: [240000, 800000, 400000]
    },
    [ItemRarity.LEGENDARY]: {
      [LevelTier.NOVICE]: [4000, 12000, 8000],
      [LevelTier.JOURNEYMAN]: [12000, 50000, 25000],
      [LevelTier.VETERAN]: [50000, 200000, 100000],
      [LevelTier.EXPERT]: [200000, 800000, 400000],
      [LevelTier.MASTER]: [800000, 4000000, 2000000]
    }
  },
  consumables: {
    [ItemRarity.COMMON]: {
      [LevelTier.NOVICE]: [10, 50, 25],
      [LevelTier.JOURNEYMAN]: [50, 150, 100],
      [LevelTier.VETERAN]: [150, 500, 250],
      [LevelTier.EXPERT]: [500, 2000, 1000],
      [LevelTier.MASTER]: [2000, 8000, 4000]
    },
    [ItemRarity.UNCOMMON]: {
      [LevelTier.NOVICE]: [50, 150, 100],
      [LevelTier.JOURNEYMAN]: [150, 500, 250],
      [LevelTier.VETERAN]: [500, 2000, 1000],
      [LevelTier.EXPERT]: [2000, 8000, 4000],
      [LevelTier.MASTER]: [8000, 30000, 15000]
    },
    [ItemRarity.RARE]: {
      [LevelTier.NOVICE]: [150, 500, 300],
      [LevelTier.JOURNEYMAN]: [500, 2000, 1000],
      [LevelTier.VETERAN]: [2000, 8000, 4000],
      [LevelTier.EXPERT]: [8000, 30000, 15000],
      [LevelTier.MASTER]: [30000, 100000, 50000]
    },
    [ItemRarity.EPIC]: {
      [LevelTier.NOVICE]: [500, 1500, 1000],
      [LevelTier.JOURNEYMAN]: [1500, 6000, 3000],
      [LevelTier.VETERAN]: [6000, 25000, 12000],
      [LevelTier.EXPERT]: [25000, 100000, 50000],
      [LevelTier.MASTER]: [100000, 400000, 200000]
    },
    [ItemRarity.LEGENDARY]: {
      [LevelTier.NOVICE]: [1500, 5000, 3000],
      [LevelTier.JOURNEYMAN]: [5000, 20000, 10000],
      [LevelTier.VETERAN]: [20000, 80000, 40000],
      [LevelTier.EXPERT]: [80000, 320000, 160000],
      [LevelTier.MASTER]: [320000, 1500000, 750000]
    }
  },
  mounts: {
    [ItemRarity.COMMON]: [500, 500, 500],
    [ItemRarity.UNCOMMON]: [2000, 2000, 2000],
    [ItemRarity.RARE]: [10000, 10000, 10000],
    [ItemRarity.EPIC]: [50000, 50000, 50000],
    [ItemRarity.LEGENDARY]: [250000, 250000, 250000]
  },
  materials: {
    [ItemRarity.COMMON]: [5, 25, 15],
    [ItemRarity.UNCOMMON]: [25, 100, 60],
    [ItemRarity.RARE]: [100, 500, 250],
    [ItemRarity.EPIC]: [500, 2500, 1200],
    [ItemRarity.LEGENDARY]: [2500, 15000, 7500]
  }
} as const;

/**
 * Job rewards by level and danger rating
 * Format: [baseGold, dangerMultiplier, xpReward, energyCost]
 */
export const JOB_REWARDS = {
  // Mining jobs
  mining: {
    [LevelTier.NOVICE]: [20, 1.0, 15, 10],
    [LevelTier.JOURNEYMAN]: [75, 1.2, 50, 12],
    [LevelTier.VETERAN]: [300, 1.5, 150, 15],
    [LevelTier.EXPERT]: [1200, 1.8, 400, 18],
    [LevelTier.MASTER]: [5000, 2.0, 1000, 20]
  },
  // Courier/delivery jobs
  courier: {
    [LevelTier.NOVICE]: [30, 1.1, 20, 8],
    [LevelTier.JOURNEYMAN]: [100, 1.3, 60, 10],
    [LevelTier.VETERAN]: [400, 1.6, 200, 12],
    [LevelTier.EXPERT]: [1600, 1.9, 500, 15],
    [LevelTier.MASTER]: [6500, 2.2, 1200, 18]
  },
  // Guard duty
  guard: {
    [LevelTier.NOVICE]: [40, 1.2, 25, 12],
    [LevelTier.JOURNEYMAN]: [150, 1.4, 75, 15],
    [LevelTier.VETERAN]: [600, 1.7, 250, 18],
    [LevelTier.EXPERT]: [2400, 2.0, 600, 20],
    [LevelTier.MASTER]: [10000, 2.5, 1500, 25]
  },
  // Hunting/gathering
  hunting: {
    [LevelTier.NOVICE]: [25, 1.0, 20, 15],
    [LevelTier.JOURNEYMAN]: [100, 1.2, 65, 18],
    [LevelTier.VETERAN]: [400, 1.5, 220, 20],
    [LevelTier.EXPERT]: [1600, 1.8, 550, 25],
    [LevelTier.MASTER]: [6500, 2.0, 1300, 30]
  }
} as const;

/**
 * Crime rewards vs risk calculations
 * Format: [baseReward, successRate, jailTime, bailCost, wantedIncrease]
 */
export const CRIME_BALANCE = {
  // Petty crimes (high success, low reward)
  petty: {
    [LevelTier.NOVICE]: [15, 0.70, 5, 100, 1],
    [LevelTier.JOURNEYMAN]: [60, 0.65, 8, 200, 1],
    [LevelTier.VETERAN]: [250, 0.60, 12, 400, 1],
    [LevelTier.EXPERT]: [1000, 0.55, 15, 800, 1],
    [LevelTier.MASTER]: [4000, 0.50, 20, 1500, 1]
  },
  // Medium crimes (moderate success, moderate reward)
  medium: {
    [LevelTier.NOVICE]: [50, 0.50, 15, 250, 2],
    [LevelTier.JOURNEYMAN]: [200, 0.45, 25, 500, 2],
    [LevelTier.VETERAN]: [800, 0.40, 40, 1000, 2],
    [LevelTier.EXPERT]: [3200, 0.35, 60, 2000, 2],
    [LevelTier.MASTER]: [12500, 0.30, 90, 4000, 2]
  },
  // Major crimes (low success, high reward)
  major: {
    [LevelTier.NOVICE]: [150, 0.30, 45, 600, 3],
    [LevelTier.JOURNEYMAN]: [600, 0.28, 75, 1200, 3],
    [LevelTier.VETERAN]: [2500, 0.25, 120, 2500, 3],
    [LevelTier.EXPERT]: [10000, 0.22, 180, 5000, 3],
    [LevelTier.MASTER]: [40000, 0.20, 240, 10000, 3]
  },
  // Epic crimes (very low success, massive reward)
  epic: {
    [LevelTier.NOVICE]: [500, 0.15, 120, 2000, 4],
    [LevelTier.JOURNEYMAN]: [2000, 0.13, 180, 4000, 4],
    [LevelTier.VETERAN]: [8000, 0.12, 240, 8000, 4],
    [LevelTier.EXPERT]: [32000, 0.10, 360, 15000, 4],
    [LevelTier.MASTER]: [125000, 0.08, 480, 30000, 4]
  }
} as const;

/**
 * Property income calculations
 * Format: [purchasePrice, dailyIncome, dailyTax, dailyProfit, daysToROI]
 */
export const PROPERTY_INCOME = {
  // Shack/small property
  shack: {
    [LevelTier.NOVICE]: [1000, 50, 10, 40, 25],
    [LevelTier.JOURNEYMAN]: [5000, 250, 50, 200, 25],
    [LevelTier.VETERAN]: [25000, 1250, 250, 1000, 25],
    [LevelTier.EXPERT]: [100000, 5000, 1000, 4000, 25],
    [LevelTier.MASTER]: [500000, 25000, 5000, 20000, 25]
  },
  // House/medium property
  house: {
    [LevelTier.NOVICE]: [2500, 100, 20, 80, 31],
    [LevelTier.JOURNEYMAN]: [12500, 500, 100, 400, 31],
    [LevelTier.VETERAN]: [60000, 2500, 500, 2000, 30],
    [LevelTier.EXPERT]: [250000, 10000, 2000, 8000, 31],
    [LevelTier.MASTER]: [1250000, 50000, 10000, 40000, 31]
  },
  // Mansion/large property
  mansion: {
    [LevelTier.NOVICE]: [5000, 150, 30, 120, 42],
    [LevelTier.JOURNEYMAN]: [25000, 750, 150, 600, 42],
    [LevelTier.VETERAN]: [100000, 3000, 600, 2400, 42],
    [LevelTier.EXPERT]: [500000, 15000, 3000, 12000, 42],
    [LevelTier.MASTER]: [2000000, 60000, 12000, 48000, 42]
  },
  // Business/commercial property
  business: {
    [LevelTier.NOVICE]: [3000, 120, 25, 95, 32],
    [LevelTier.JOURNEYMAN]: [15000, 600, 125, 475, 32],
    [LevelTier.VETERAN]: [75000, 3000, 625, 2375, 32],
    [LevelTier.EXPERT]: [375000, 15000, 3125, 11875, 32],
    [LevelTier.MASTER]: [1500000, 60000, 12500, 47500, 32]
  }
} as const;

/**
 * Quest reward scaling
 * Format: [goldReward, xpReward, itemRarity, energyCost]
 */
export const QUEST_REWARDS = {
  story: {
    [LevelTier.NOVICE]: [200, 100, ItemRarity.COMMON, 20],
    [LevelTier.JOURNEYMAN]: [1000, 300, ItemRarity.UNCOMMON, 25],
    [LevelTier.VETERAN]: [5000, 800, ItemRarity.RARE, 30],
    [LevelTier.EXPERT]: [25000, 2000, ItemRarity.EPIC, 35],
    [LevelTier.MASTER]: [100000, 5000, ItemRarity.LEGENDARY, 40]
  },
  side: {
    [LevelTier.NOVICE]: [100, 50, ItemRarity.COMMON, 15],
    [LevelTier.JOURNEYMAN]: [500, 150, ItemRarity.COMMON, 18],
    [LevelTier.VETERAN]: [2500, 400, ItemRarity.UNCOMMON, 20],
    [LevelTier.EXPERT]: [12000, 1000, ItemRarity.RARE, 25],
    [LevelTier.MASTER]: [50000, 2500, ItemRarity.EPIC, 30]
  },
  daily: {
    [LevelTier.NOVICE]: [50, 30, ItemRarity.COMMON, 10],
    [LevelTier.JOURNEYMAN]: [250, 80, ItemRarity.COMMON, 12],
    [LevelTier.VETERAN]: [1200, 200, ItemRarity.UNCOMMON, 15],
    [LevelTier.EXPERT]: [6000, 500, ItemRarity.RARE, 18],
    [LevelTier.MASTER]: [25000, 1200, ItemRarity.RARE, 20]
  },
  repeatable: {
    [LevelTier.NOVICE]: [25, 20, ItemRarity.COMMON, 8],
    [LevelTier.JOURNEYMAN]: [120, 50, ItemRarity.COMMON, 10],
    [LevelTier.VETERAN]: [600, 120, ItemRarity.COMMON, 12],
    [LevelTier.EXPERT]: [3000, 300, ItemRarity.UNCOMMON, 15],
    [LevelTier.MASTER]: [12000, 750, ItemRarity.UNCOMMON, 18]
  }
} as const;

/**
 * Crafting material costs by tier
 * Format: [gatherTime, marketPrice, sellPrice]
 */
export const MATERIAL_COSTS = {
  wood: {
    [LevelTier.NOVICE]: [5, 5, 3],
    [LevelTier.JOURNEYMAN]: [8, 15, 10],
    [LevelTier.VETERAN]: [12, 40, 25],
    [LevelTier.EXPERT]: [15, 100, 65],
    [LevelTier.MASTER]: [20, 250, 150]
  },
  metal: {
    [LevelTier.NOVICE]: [10, 15, 10],
    [LevelTier.JOURNEYMAN]: [15, 50, 30],
    [LevelTier.VETERAN]: [20, 150, 100],
    [LevelTier.EXPERT]: [25, 400, 250],
    [LevelTier.MASTER]: [30, 1000, 650]
  },
  leather: {
    [LevelTier.NOVICE]: [8, 10, 6],
    [LevelTier.JOURNEYMAN]: [12, 30, 20],
    [LevelTier.VETERAN]: [18, 100, 65],
    [LevelTier.EXPERT]: [22, 300, 200],
    [LevelTier.MASTER]: [28, 800, 500]
  },
  herbs: {
    [LevelTier.NOVICE]: [3, 8, 5],
    [LevelTier.JOURNEYMAN]: [5, 25, 15],
    [LevelTier.VETERAN]: [8, 75, 50],
    [LevelTier.EXPERT]: [12, 200, 130],
    [LevelTier.MASTER]: [15, 500, 325]
  },
  gemstones: {
    [LevelTier.NOVICE]: [20, 100, 60],
    [LevelTier.JOURNEYMAN]: [30, 400, 250],
    [LevelTier.VETERAN]: [45, 1500, 1000],
    [LevelTier.EXPERT]: [60, 5000, 3200],
    [LevelTier.MASTER]: [90, 15000, 10000]
  }
} as const;

/**
 * Combat encounter rewards
 * Format: [goldReward, xpReward, lootChance]
 */
export const COMBAT_REWARDS = {
  bandit: {
    [LevelTier.NOVICE]: [15, 30, 0.20],
    [LevelTier.JOURNEYMAN]: [60, 80, 0.25],
    [LevelTier.VETERAN]: [250, 200, 0.30],
    [LevelTier.EXPERT]: [1000, 500, 0.35],
    [LevelTier.MASTER]: [4000, 1200, 0.40]
  },
  outlaw: {
    [LevelTier.NOVICE]: [30, 50, 0.25],
    [LevelTier.JOURNEYMAN]: [120, 120, 0.30],
    [LevelTier.VETERAN]: [500, 300, 0.35],
    [LevelTier.EXPERT]: [2000, 750, 0.40],
    [LevelTier.MASTER]: [8000, 1800, 0.45]
  },
  wildlife: {
    [LevelTier.NOVICE]: [10, 25, 0.50],
    [LevelTier.JOURNEYMAN]: [40, 60, 0.55],
    [LevelTier.VETERAN]: [160, 150, 0.60],
    [LevelTier.EXPERT]: [640, 400, 0.65],
    [LevelTier.MASTER]: [2500, 1000, 0.70]
  },
  boss: {
    [LevelTier.NOVICE]: [200, 350, 0.80],
    [LevelTier.JOURNEYMAN]: [800, 800, 0.85],
    [LevelTier.VETERAN]: [3200, 2000, 0.90],
    [LevelTier.EXPERT]: [12800, 5000, 0.95],
    [LevelTier.MASTER]: [50000, 12000, 1.00]
  }
} as const;

/**
 * Helper function to get recommended item price
 */
export function getRecommendedPrice(
  itemType: keyof typeof ITEM_PRICES,
  rarity: ItemRarity,
  tier: LevelTier
): number {
  const priceData = ITEM_PRICES[itemType];
  if (!priceData) return 100;

  if (itemType === 'mounts' || itemType === 'materials') {
    const mountData = priceData[rarity];
    return Array.isArray(mountData) ? mountData[2] : 100;
  }

  const rarityData = priceData[rarity];
  if (!rarityData) return 100;

  const tierData = rarityData[tier];
  return Array.isArray(tierData) ? tierData[2] : 100;
}

/**
 * Helper function to calculate expected hourly gold from jobs
 */
export function calculateJobGoldPerHour(
  jobType: keyof typeof JOB_REWARDS,
  tier: LevelTier,
  dangerLevel: number = 1
): number {
  const jobData = JOB_REWARDS[jobType][tier];
  const [baseGold, dangerMultiplier, xpReward, energyCost] = jobData;

  // Jobs per hour based on energy cost (assume 30 energy/hour regen)
  const jobsPerHour = 30 / energyCost;

  // Apply danger multiplier
  const goldPerJob = baseGold * (1 + (dangerLevel * dangerMultiplier));

  return Math.floor(goldPerJob * jobsPerHour);
}

/**
 * Helper function to calculate expected crime profit (accounting for risk)
 */
export function calculateCrimeExpectedValue(
  crimeType: keyof typeof CRIME_BALANCE,
  tier: LevelTier
): number {
  const crimeData = CRIME_BALANCE[crimeType][tier];
  const [reward, successRate, jailTime, bailCost, wantedIncrease] = crimeData;

  // Expected reward accounting for success rate
  const expectedReward = reward * successRate;

  // Expected cost (bail on failure)
  const expectedCost = bailCost * (1 - successRate);

  // Net expected value
  return expectedReward - expectedCost;
}

/**
 * Export all tables
 */
export const EconomyTables = {
  ITEM_PRICES,
  JOB_REWARDS,
  CRIME_BALANCE,
  PROPERTY_INCOME,
  QUEST_REWARDS,
  MATERIAL_COSTS,
  COMBAT_REWARDS,

  // Helper functions
  getRecommendedPrice,
  calculateJobGoldPerHour,
  calculateCrimeExpectedValue
} as const;

export default EconomyTables;
