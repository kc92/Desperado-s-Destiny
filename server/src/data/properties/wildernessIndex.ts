/**
 * Wilderness Properties Index
 *
 * Central export for all wilderness property definitions
 * Phase 8, Wave 8.2 - Wilderness Properties (Homesteads & Mines)
 */

// Ore Types
export {
  OreRarity,
  ORE_TYPES,
  getOreType,
  getOresByRarity,
  getCraftingOres,
  getSupernaturalOres,
  getProcessingCost,
  getMarketPrice,
} from './oreTypes';

export type { OreType, RareOreSpawn } from './oreTypes';

// Homesteads
export {
  TerrainType,
  HomesteadBuilding,
  HOMESTEADS,
  getHomestead,
  getHomesteadsBySize,
  getHomesteadsByLocation,
  getAvailableHomesteads,
  getHomesteadsWithFeature,
  calculateHomesteadValue,
} from './homesteads';

export type { HomesteadProperty } from './homesteads';

// Mines
export {
  MINES,
  getMine,
  getMinesBySize,
  getMinesByOre,
  getAvailableMines,
  getSupernaturalMines,
  calculateTotalDanger,
  estimateWeeklyProduction,
  calculateMineValue,
  getRecommendedMinerWage,
} from './mines';

export type { MineProperty, PrimaryOreType, SecondaryOreType } from './mines';

// Combined exports for convenience
import { HOMESTEADS } from './homesteads';
import { MINES } from './mines';
import { ORE_TYPES } from './oreTypes';

export const WILDERNESS_PROPERTIES = {
  homesteads: {
    all: Object.values(HOMESTEADS),
    count: Object.keys(HOMESTEADS).length,
  },
  mines: {
    all: Object.values(MINES),
    count: Object.keys(MINES).length,
  },
  ores: {
    all: Object.values(ORE_TYPES),
    count: Object.keys(ORE_TYPES).length,
  },
};

/**
 * Get all wilderness properties summary
 */
export function getWildernessSummary() {
  return {
    totalHomesteads: Object.keys(HOMESTEADS).length,
    totalMines: Object.keys(MINES).length,
    totalOreTypes: Object.keys(ORE_TYPES).length,
    homesteadsBySize: {
      small: Object.values(HOMESTEADS).filter((h: any) => h.size === 'small').length,
      medium: Object.values(HOMESTEADS).filter((h: any) => h.size === 'medium').length,
      large: Object.values(HOMESTEADS).filter((h: any) => h.size === 'large').length,
    },
    minesBySize: {
      small: Object.values(MINES).filter((m: any) => m.size === 'small').length,
      medium: Object.values(MINES).filter((m: any) => m.size === 'medium').length,
      large: Object.values(MINES).filter((m: any) => m.size === 'large').length,
    },
    oresByRarity: {
      common: Object.values(ORE_TYPES).filter((o: any) => o.rarity === 'common').length,
      uncommon: Object.values(ORE_TYPES).filter((o: any) => o.rarity === 'uncommon').length,
      rare: Object.values(ORE_TYPES).filter((o: any) => o.rarity === 'rare').length,
      very_rare: Object.values(ORE_TYPES).filter((o: any) => o.rarity === 'very_rare').length,
      legendary: Object.values(ORE_TYPES).filter((o: any) => o.rarity === 'legendary').length,
    },
  };
}

/**
 * Validate all property definitions
 */
export function validateWildernessProperties(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate homesteads
  Object.entries(HOMESTEADS).forEach(([id, homestead]: [string, any]) => {
    if (homestead.id !== id) {
      errors.push(`Homestead ${id}: ID mismatch`);
    }
    if (homestead.basePrice <= 0) {
      errors.push(`Homestead ${id}: Invalid base price`);
    }
    if (homestead.acres <= 0) {
      errors.push(`Homestead ${id}: Invalid acreage`);
    }
    if (homestead.defensibility < 1 || homestead.defensibility > 10) {
      errors.push(`Homestead ${id}: Defensibility must be 1-10`);
    }
  });

  // Validate mines
  Object.entries(MINES).forEach(([id, mine]: [string, any]) => {
    if (mine.id !== id) {
      errors.push(`Mine ${id}: ID mismatch`);
    }
    if (mine.basePrice <= 0) {
      errors.push(`Mine ${id}: Invalid base price`);
    }
    if (!ORE_TYPES[mine.primaryOre]) {
      errors.push(`Mine ${id}: Invalid primary ore type ${mine.primaryOre}`);
    }
    if (mine.secondaryOre && !ORE_TYPES[mine.secondaryOre]) {
      errors.push(`Mine ${id}: Invalid secondary ore type ${mine.secondaryOre}`);
    }
    if (mine.oreQuality < 1 || mine.oreQuality > 10) {
      errors.push(`Mine ${id}: Ore quality must be 1-10`);
    }
    if (mine.dangerLevel < 1 || mine.dangerLevel > 10) {
      errors.push(`Mine ${id}: Danger level must be 1-10`);
    }

    // Validate rare spawns
    mine.rareSpawns.forEach((spawn: any, index: number) => {
      if (!ORE_TYPES[spawn.oreId]) {
        errors.push(`Mine ${id}: Invalid rare spawn ore ${spawn.oreId} at index ${index}`);
      }
      if (spawn.spawnChance < 0 || spawn.spawnChance > 100) {
        errors.push(`Mine ${id}: Spawn chance must be 0-100 at index ${index}`);
      }
    });
  });

  // Validate ore types
  Object.entries(ORE_TYPES).forEach(([id, ore]: [string, any]) => {
    if (ore.id !== id) {
      errors.push(`Ore ${id}: ID mismatch`);
    }
    if (ore.baseValue <= 0) {
      errors.push(`Ore ${id}: Invalid base value`);
    }
    if (ore.extractionDifficulty < 1 || ore.extractionDifficulty > 10) {
      errors.push(`Ore ${id}: Extraction difficulty must be 1-10`);
    }
  });

  // Warnings
  const homesteadCount = Object.keys(HOMESTEADS).length;
  const mineCount = Object.keys(MINES).length;
  const oreCount = Object.keys(ORE_TYPES).length;

  if (homesteadCount < 10) {
    warnings.push(`Only ${homesteadCount} homesteads defined (target: 10+)`);
  }
  if (mineCount < 10) {
    warnings.push(`Only ${mineCount} mines defined (target: 10+)`);
  }
  if (oreCount < 8) {
    warnings.push(`Only ${oreCount} ore types defined (target: 8+)`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
