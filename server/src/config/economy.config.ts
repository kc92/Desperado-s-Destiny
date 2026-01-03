/**
 * Economy Configuration
 *
 * Central configuration for all economic values in Desperados Destiny.
 * This file defines the complete economic balance across all systems.
 *
 * Design Philosophy (Updated for Total Level System - Phase D):
 * - Time to max skill: ~8,700 hours (10+ years at casual play)
 * - Time to first prestige: ~1-2 years of active play
 * - Gold value: Meaningful choices at all Total Level tiers
 * - Progressive scaling: Each tier feels rewarding
 * - Sink balance: Gold earned should match gold spent over time
 *
 * LEVELING SYSTEM REFACTOR:
 * - Character level is DEPRECATED, replaced by Total Level (30-2970)
 * - Tiers now based on Total Level milestones, not character level
 */

/**
 * Level tier definitions (based on Total Level, not character level)
 * Total Level = sum of all skill levels (30 skills × 99 max = 2,970 max)
 */
export enum LevelTier {
  NOVICE = 'NOVICE',           // Total Level 30-99 (Greenhorn)
  JOURNEYMAN = 'JOURNEYMAN',   // Total Level 100-249 (Tenderfoot)
  VETERAN = 'VETERAN',         // Total Level 250-499 (Frontier Hand)
  EXPERT = 'EXPERT',           // Total Level 500-999 (Trailblazer)
  MASTER = 'MASTER'            // Total Level 1000+ (Legend and beyond)
}

/**
 * Item rarity tiers
 */
export enum ItemRarity {
  COMMON = 'COMMON',
  UNCOMMON = 'UNCOMMON',
  RARE = 'RARE',
  EPIC = 'EPIC',
  LEGENDARY = 'LEGENDARY'
}

/**
 * Gold earning rates per hour (optimal play)
 * These values represent what a skilled player can earn per hour
 */
export const GOLD_EARNING_RATES = {
  [LevelTier.NOVICE]: {
    jobs: { min: 50, max: 200 },      // Simple jobs: mining, courier work
    crimes: { min: 100, max: 500 },   // Petty crimes: pickpocket, theft
    quests: { min: 200, max: 1000 },  // Early story quests
    combat: { min: 75, max: 300 },    // Hunting, bounties
    crafting: { min: 100, max: 400 }, // Basic crafting sales
    gambling: { min: 0, max: 150 }    // High risk/reward
  },
  [LevelTier.JOURNEYMAN]: {
    jobs: { min: 200, max: 500 },
    crimes: { min: 500, max: 2000 },
    quests: { min: 1000, max: 5000 },
    combat: { min: 300, max: 1500 },
    crafting: { min: 400, max: 2000 },
    gambling: { min: 0, max: 800 }
  },
  [LevelTier.VETERAN]: {
    jobs: { min: 500, max: 2000 },
    crimes: { min: 2000, max: 10000 },
    quests: { min: 5000, max: 25000 },
    combat: { min: 1500, max: 8000 },
    crafting: { min: 2000, max: 12000 },
    gambling: { min: 0, max: 5000 }
  },
  [LevelTier.EXPERT]: {
    jobs: { min: 2000, max: 10000 },
    crimes: { min: 10000, max: 50000 },
    quests: { min: 25000, max: 100000 },
    combat: { min: 8000, max: 40000 },
    crafting: { min: 12000, max: 60000 },
    gambling: { min: 0, max: 30000 }
  },
  [LevelTier.MASTER]: {
    jobs: { min: 10000, max: 50000 },
    crimes: { min: 50000, max: 200000 },
    quests: { min: 100000, max: 500000 },
    combat: { min: 40000, max: 150000 },
    crafting: { min: 60000, max: 250000 },
    gambling: { min: 0, max: 100000 }
  }
} as const;

/**
 * Gold sinks - where gold leaves the economy
 */
export const GOLD_SINKS = {
  // Shop items by rarity
  shopItems: {
    [ItemRarity.COMMON]: { min: 50, max: 500 },
    [ItemRarity.UNCOMMON]: { min: 500, max: 2500 },
    [ItemRarity.RARE]: { min: 2500, max: 15000 },
    [ItemRarity.EPIC]: { min: 15000, max: 75000 },
    [ItemRarity.LEGENDARY]: { min: 75000, max: 500000 }
  },

  // Property costs by tier
  property: {
    [LevelTier.NOVICE]: {
      purchase: { min: 1000, max: 5000 },
      dailyTax: { min: 10, max: 50 },
      upgradeCost: { min: 500, max: 2000 }
    },
    [LevelTier.JOURNEYMAN]: {
      purchase: { min: 5000, max: 25000 },
      dailyTax: { min: 50, max: 250 },
      upgradeCost: { min: 2000, max: 10000 }
    },
    [LevelTier.VETERAN]: {
      purchase: { min: 25000, max: 100000 },
      dailyTax: { min: 250, max: 1000 },
      upgradeCost: { min: 10000, max: 50000 }
    },
    [LevelTier.EXPERT]: {
      purchase: { min: 100000, max: 500000 },
      dailyTax: { min: 1000, max: 5000 },
      upgradeCost: { min: 50000, max: 250000 }
    },
    [LevelTier.MASTER]: {
      purchase: { min: 500000, max: 2000000 },
      dailyTax: { min: 5000, max: 20000 },
      upgradeCost: { min: 250000, max: 1000000 }
    }
  },

  // Crafting material costs
  crafting: {
    commonMaterial: { min: 10, max: 50 },
    uncommonMaterial: { min: 50, max: 250 },
    rareMaterial: { min: 250, max: 1500 },
    epicMaterial: { min: 1500, max: 10000 },
    legendaryMaterial: { min: 10000, max: 50000 },
    workstationUse: { min: 25, max: 500 }
  },

  // Travel costs
  travel: {
    shortDistance: 25,    // Same region
    mediumDistance: 100,  // Adjacent region
    longDistance: 500,    // Cross-territory
    stagecoach: 50,       // Per segment
    trainTicket: 200,     // Premium fast travel
    horseUpkeep: 10       // Daily
  },

  // Jail and crime costs
  jail: {
    bailBase: 100,
    bailPerWantedLevel: 200,
    layLowCost: 500,
    bribeBase: 250,
    bribePerWantedLevel: 500
  },

  // Gang costs
  gang: {
    creation: 5000,
    dailyUpkeep: 100,
    bankContribution: { min: 100, max: 100000 },
    upgradeBase: 10000,
    upgradeTier2: 50000,
    upgradeTier3: 250000,
    warDeclaration: 25000
  },

  // Duel and tournament
  duel: {
    wager: { min: 100, max: 50000 },
    tournamentEntry: { min: 500, max: 25000 }
  },

  // Gambling losses (expected loss over time)
  gambling: {
    expectedHourlyLoss: 200 // -200 gold/hour on average
  },

  // Bank vault upgrades
  bankVault: {
    bronzeTier: 1000,
    silverTier: 5000,
    goldTier: 25000
  }
} as const;

/**
 * XP Curves - Experience required per level
 * Formula: BASE_XP * (MULTIPLIER ^ (level - 1))
 */
export const XP_PROGRESSION = {
  baseXP: 100,
  multiplier: 1.15,

  // Stat points awarded per level
  statPointsPerLevel: 2,

  // Milestone bonuses (every 5 levels)
  milestoneBonus: 500,
  milestoneLevels: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],

  // XP sources by activity
  sources: {
    crimeSuccess: { min: 20, max: 300 },
    combatVictory: { min: 40, max: 250 },
    questCompletion: { min: 100, max: 1000 },
    craftingItem: { min: 35, max: 150 },
    socialSuccess: { min: 30, max: 100 },
    exploration: { min: 50, max: 200 },

    // Boss encounters give massive XP
    bossDefeat: { min: 350, max: 1000 }
  }
} as const;

/**
 * Energy economy configuration
 */
export const ENERGY_ECONOMY = {
  // Regeneration rates (per hour)
  freeRegenRate: 30,      // 150 energy over 5 hours
  premiumRegenRate: 31.25, // 250 energy over 8 hours

  // Maximum energy
  freeMaxEnergy: 150,
  premiumMaxEnergy: 250,

  // Action costs
  actionCosts: {
    trivial: 5,      // Tier 1 content
    standard: 10,    // Tier 2 content
    challenging: 15, // Tier 3 content
    difficult: 20,   // Tier 4 content
    epic: 25,        // Boss encounters
    legendary: 30    // Endgame content
  },

  // Recovery items
  recoveryItems: {
    coffeePrice: 50,      // +25 energy
    mealPrice: 150,       // +50 energy
    tonicsPrice: 500,     // +100 energy
    elixirPrice: 2000     // Full restore
  }
} as const;

/**
 * Economic balance targets
 * These ratios help maintain healthy economy
 */
export const BALANCE_TARGETS = {
  // Gold earned to gold spent ratio (ideal: 1.0)
  goldFlowRatio: {
    minimum: 0.8,  // Warning threshold
    target: 1.0,   // Perfect balance
    maximum: 1.2   // Warning threshold
  },

  // Average gold per active hour by tier
  targetGoldPerHour: {
    [LevelTier.NOVICE]: 300,
    [LevelTier.JOURNEYMAN]: 1500,
    [LevelTier.VETERAN]: 8000,
    [LevelTier.EXPERT]: 35000,
    [LevelTier.MASTER]: 120000
  },

  // Wealth inequality (Gini coefficient targets)
  wealthInequality: {
    minimum: 0.3,  // Too equal (no progression)
    target: 0.5,   // Healthy spread
    maximum: 0.8   // Too unequal
  },

  // Gold velocity (transactions per day)
  goldVelocity: {
    minimum: 20,   // Economy too stagnant
    target: 50,    // Healthy trading
    maximum: 200   // Possible exploits
  }
} as const;

/**
 * Crafting profit margins
 * Base margins before skill bonuses
 */
export const CRAFTING_MARGINS = {
  [ItemRarity.COMMON]: {
    materialCost: 50,
    sellPrice: 100,
    profitMargin: 1.0  // 100% profit
  },
  [ItemRarity.UNCOMMON]: {
    materialCost: 250,
    sellPrice: 600,
    profitMargin: 1.4  // 140% profit
  },
  [ItemRarity.RARE]: {
    materialCost: 1500,
    sellPrice: 4000,
    profitMargin: 1.67 // 167% profit
  },
  [ItemRarity.EPIC]: {
    materialCost: 10000,
    sellPrice: 30000,
    profitMargin: 2.0  // 200% profit
  },
  [ItemRarity.LEGENDARY]: {
    materialCost: 50000,
    sellPrice: 175000,
    profitMargin: 2.5  // 250% profit
  }
} as const;

/**
 * Property ROI (Return on Investment)
 * Time to recoup investment through income
 */
export const PROPERTY_ROI = {
  [LevelTier.NOVICE]: {
    dailyIncome: 100,
    breakEvenDays: 30,      // 3000 gold at 100/day
    monthlyProfit: 1000     // After tax
  },
  [LevelTier.JOURNEYMAN]: {
    dailyIncome: 500,
    breakEvenDays: 30,
    monthlyProfit: 7500
  },
  [LevelTier.VETERAN]: {
    dailyIncome: 2500,
    breakEvenDays: 30,
    monthlyProfit: 45000
  },
  [LevelTier.EXPERT]: {
    dailyIncome: 12000,
    breakEvenDays: 30,
    monthlyProfit: 210000
  },
  [LevelTier.MASTER]: {
    dailyIncome: 50000,
    breakEvenDays: 30,
    monthlyProfit: 900000
  }
} as const;

/**
 * Anti-exploit thresholds
 * Values that trigger investigation
 */
export const EXPLOIT_THRESHOLDS = {
  // Gold transactions
  maxGoldPerTransaction: 1000000,
  maxGoldPerHour: 500000,
  maxGoldPerDay: 3000000,

  // XP gains
  maxXPPerAction: 1000,
  maxXPPerHour: 10000,
  maxXPPerDay: 50000,

  // Trading
  maxTradesPerHour: 50,
  maxTradesPerDay: 200,

  // Item duplication detection
  maxSameItemCrafted: 100,  // Per hour
  maxSameItemSold: 200      // Per hour
} as const;

/**
 * Helper function to get level tier from Total Level
 * @param totalLevel - Character's Total Level (sum of all skill levels)
 * @returns The appropriate tier for that Total Level
 */
export function getLevelTier(totalLevel: number): LevelTier {
  if (totalLevel < 100) return LevelTier.NOVICE;
  if (totalLevel < 250) return LevelTier.JOURNEYMAN;
  if (totalLevel < 500) return LevelTier.VETERAN;
  if (totalLevel < 1000) return LevelTier.EXPERT;
  return LevelTier.MASTER;
}

/**
 * Helper function to get level tier from old character level (DEPRECATED)
 * Kept for backward compatibility during transition
 * @deprecated Use getLevelTier(totalLevel) instead
 */
export function getLevelTierFromCharacterLevel(level: number): LevelTier {
  if (level <= 10) return LevelTier.NOVICE;
  if (level <= 20) return LevelTier.JOURNEYMAN;
  if (level <= 30) return LevelTier.VETERAN;
  if (level <= 40) return LevelTier.EXPERT;
  return LevelTier.MASTER;
}

/**
 * Helper function to calculate XP required for a level
 */
export function calculateXPForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(XP_PROGRESSION.baseXP * Math.pow(XP_PROGRESSION.multiplier, level - 1));
}

/**
 * Helper function to calculate total XP needed to reach a level
 */
export function calculateTotalXPToLevel(targetLevel: number): number {
  let total = 0;
  for (let level = 2; level <= targetLevel; level++) {
    total += calculateXPForLevel(level);
  }
  return total;
}

/**
 * Helper function to get expected gold per hour for a level
 */
export function getExpectedGoldPerHour(level: number): number {
  const tier = getLevelTier(level);
  return BALANCE_TARGETS.targetGoldPerHour[tier];
}

/**
 * Helper function to calculate bail cost
 */
export function calculateBailCost(wantedLevel: number): number {
  return GOLD_SINKS.jail.bailBase + (wantedLevel * GOLD_SINKS.jail.bailPerWantedLevel);
}

/**
 * Helper function to calculate bribe cost
 */
export function calculateBribeCost(wantedLevel: number): number {
  return GOLD_SINKS.jail.bribeBase + (wantedLevel * GOLD_SINKS.jail.bribePerWantedLevel);
}

/**
 * Export all configurations
 */
export const EconomyConfig = {
  LevelTier,
  ItemRarity,
  GOLD_EARNING_RATES,
  GOLD_SINKS,
  XP_PROGRESSION,
  ENERGY_ECONOMY,
  BALANCE_TARGETS,
  CRAFTING_MARGINS,
  PROPERTY_ROI,
  EXPLOIT_THRESHOLDS,

  // Helper functions
  getLevelTier,
  getLevelTierFromCharacterLevel, // Deprecated - kept for backward compatibility
  calculateXPForLevel,
  calculateTotalXPToLevel,
  getExpectedGoldPerHour,
  calculateBailCost,
  calculateBribeCost
} as const;

export default EconomyConfig;
