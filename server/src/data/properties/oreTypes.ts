/**
 * Ore Type Definitions
 *
 * Defines all ore types that can be extracted from mines
 * Phase 8, Wave 8.2 - Wilderness Properties (Homesteads & Mines)
 */

/**
 * Ore rarity tiers
 */
export enum OreRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  VERY_RARE = 'very_rare',
  LEGENDARY = 'legendary',
}

/**
 * Ore type definition
 */
export interface OreType {
  id: string;
  name: string;
  description: string;
  rarity: OreRarity;

  // Value
  baseValue: number; // Gold per unit
  marketDemand: number; // 0-100, affects price fluctuation

  // Mining
  extractionDifficulty: number; // 1-10
  processingRequired: boolean;
  yieldMultiplier: number; // Ore per extraction

  // Uses
  uses: string[];

  // Special
  supernatural: boolean;
  cursed?: boolean;
}

/**
 * Rare ore spawn definition
 */
export interface RareOreSpawn {
  oreId: string;
  spawnChance: number; // 0-100
  minQuantity: number;
  maxQuantity: number;
  requiresDepth?: number; // Minimum shaft depth in feet
}

/**
 * All ore types in the game
 */
export const ORE_TYPES: Record<string, OreType> = {
  // COMMON ORES
  iron: {
    id: 'iron',
    name: 'Iron Ore',
    description: 'Common metallic ore used for construction and tools',
    rarity: OreRarity.COMMON,
    baseValue: 5,
    marketDemand: 90,
    extractionDifficulty: 2,
    processingRequired: true,
    yieldMultiplier: 3,
    uses: [
      'Building materials',
      'Tool crafting',
      'Weapon components',
      'Railroad construction',
    ],
    supernatural: false,
  },

  copper: {
    id: 'copper',
    name: 'Copper Ore',
    description: 'Reddish-brown ore valuable for ammunition and wiring',
    rarity: OreRarity.COMMON,
    baseValue: 8,
    marketDemand: 85,
    extractionDifficulty: 2,
    processingRequired: true,
    yieldMultiplier: 2.5,
    uses: [
      'Bullet casings',
      'Telegraph wire',
      'Decorative items',
      'Alloy components',
    ],
    supernatural: false,
  },

  coal: {
    id: 'coal',
    name: 'Coal',
    description: 'Black mineral used for fuel and explosives',
    rarity: OreRarity.COMMON,
    baseValue: 3,
    marketDemand: 95,
    extractionDifficulty: 1,
    processingRequired: false,
    yieldMultiplier: 5,
    uses: [
      'Locomotive fuel',
      'Heating fuel',
      'Blacksmith forges',
      'Explosive powder component',
    ],
    supernatural: false,
  },

  limestone: {
    id: 'limestone',
    name: 'Limestone',
    description: 'Sedimentary rock used in construction',
    rarity: OreRarity.COMMON,
    baseValue: 2,
    marketDemand: 70,
    extractionDifficulty: 1,
    processingRequired: false,
    yieldMultiplier: 4,
    uses: [
      'Building stone',
      'Mortar production',
      'Flux for smelting',
    ],
    supernatural: false,
  },

  // UNCOMMON ORES
  silver: {
    id: 'silver',
    name: 'Silver Ore',
    description: 'Precious white metal, the bane of unholy creatures',
    rarity: OreRarity.UNCOMMON,
    baseValue: 25,
    marketDemand: 80,
    extractionDifficulty: 5,
    processingRequired: true,
    yieldMultiplier: 1.5,
    uses: [
      'Currency minting',
      'Silver bullets (supernatural)',
      'Jewelry',
      'Ritual components',
    ],
    supernatural: true,
  },

  turquoise: {
    id: 'turquoise',
    name: 'Turquoise',
    description: 'Blue-green gemstone sacred to the Nahi Coalition',
    rarity: OreRarity.UNCOMMON,
    baseValue: 20,
    marketDemand: 65,
    extractionDifficulty: 4,
    processingRequired: false,
    yieldMultiplier: 1,
    uses: [
      'Jewelry',
      'Ceremonial items',
      'Trade goods',
      'Nahi artifacts',
    ],
    supernatural: true,
  },

  salt: {
    id: 'salt',
    name: 'Rock Salt',
    description: 'Crystalline mineral valuable for preservation and purification',
    rarity: OreRarity.UNCOMMON,
    baseValue: 10,
    marketDemand: 75,
    extractionDifficulty: 3,
    processingRequired: false,
    yieldMultiplier: 3,
    uses: [
      'Food preservation',
      'Meat curing',
      'Supernatural ward (weak)',
      'Medicine ingredient',
    ],
    supernatural: true,
  },

  // RARE ORES
  gold: {
    id: 'gold',
    name: 'Gold Ore',
    description: 'Precious yellow metal that drives men to madness',
    rarity: OreRarity.RARE,
    baseValue: 100,
    marketDemand: 100,
    extractionDifficulty: 7,
    processingRequired: true,
    yieldMultiplier: 0.5,
    uses: [
      'Currency',
      'Jewelry',
      'Wealth storage',
      'Prestige items',
    ],
    supernatural: false,
  },

  platinum: {
    id: 'platinum',
    name: 'Platinum Ore',
    description: 'Rare white metal more valuable than gold',
    rarity: OreRarity.RARE,
    baseValue: 150,
    marketDemand: 60,
    extractionDifficulty: 8,
    processingRequired: true,
    yieldMultiplier: 0.3,
    uses: [
      'Premium jewelry',
      'Scientific instruments',
      'Luxury items',
    ],
    supernatural: false,
  },

  obsidian: {
    id: 'obsidian',
    name: 'Obsidian',
    description: 'Volcanic glass with supernatural properties',
    rarity: OreRarity.RARE,
    baseValue: 40,
    marketDemand: 50,
    extractionDifficulty: 6,
    processingRequired: false,
    yieldMultiplier: 1,
    uses: [
      'Ritual blades',
      'Scrying mirrors',
      'Supernatural focus',
      'Nahi weapons',
    ],
    supernatural: true,
  },

  // VERY RARE ORES
  ruby: {
    id: 'ruby',
    name: 'Ruby',
    description: 'Blood-red gemstone of great value',
    rarity: OreRarity.VERY_RARE,
    baseValue: 200,
    marketDemand: 70,
    extractionDifficulty: 9,
    processingRequired: true,
    yieldMultiplier: 0.2,
    uses: [
      'Fine jewelry',
      'Fire magic focus',
      'Wealth storage',
    ],
    supernatural: true,
  },

  emerald: {
    id: 'emerald',
    name: 'Emerald',
    description: 'Vivid green gemstone prized by the wealthy',
    rarity: OreRarity.VERY_RARE,
    baseValue: 180,
    marketDemand: 65,
    extractionDifficulty: 9,
    processingRequired: true,
    yieldMultiplier: 0.2,
    uses: [
      'Luxury jewelry',
      'Nature magic focus',
      'Status symbols',
    ],
    supernatural: true,
  },

  sapphire: {
    id: 'sapphire',
    name: 'Sapphire',
    description: 'Deep blue gemstone of the highest quality',
    rarity: OreRarity.VERY_RARE,
    baseValue: 190,
    marketDemand: 65,
    extractionDifficulty: 9,
    processingRequired: true,
    yieldMultiplier: 0.2,
    uses: [
      'Royal jewelry',
      'Water magic focus',
      'Investment stones',
    ],
    supernatural: true,
  },

  // LEGENDARY ORES
  diamond: {
    id: 'diamond',
    name: 'Diamond',
    description: 'Hardest natural substance, brilliantly clear',
    rarity: OreRarity.LEGENDARY,
    baseValue: 500,
    marketDemand: 80,
    extractionDifficulty: 10,
    processingRequired: true,
    yieldMultiplier: 0.1,
    uses: [
      'Engagement rings',
      'Industrial cutting',
      'Ultimate wealth',
      'Light magic focus',
    ],
    supernatural: true,
  },

  meteorite: {
    id: 'meteorite',
    name: 'Star Iron',
    description: 'Meteoric iron that fell from the sky, charged with cosmic power',
    rarity: OreRarity.LEGENDARY,
    baseValue: 300,
    marketDemand: 40,
    extractionDifficulty: 10,
    processingRequired: true,
    yieldMultiplier: 0.2,
    uses: [
      'Legendary weapons',
      'Supernatural armor',
      'Cosmic rituals',
      'Destiny Deck enhancement',
    ],
    supernatural: true,
    cursed: false,
  },

  bloodstone: {
    id: 'bloodstone',
    name: 'Bloodstone',
    description: 'Crimson crystal found near The Scar, resonates with dark power',
    rarity: OreRarity.LEGENDARY,
    baseValue: 250,
    marketDemand: 20,
    extractionDifficulty: 10,
    processingRequired: true,
    yieldMultiplier: 0.15,
    uses: [
      'Dark rituals',
      'Cursed weapons',
      'Blood magic',
      'Gang war totems',
    ],
    supernatural: true,
    cursed: true,
  },

  soulstone: {
    id: 'soulstone',
    name: 'Soulstone',
    description: 'Translucent crystal that seems to whisper forgotten names',
    rarity: OreRarity.LEGENDARY,
    baseValue: 400,
    marketDemand: 15,
    extractionDifficulty: 10,
    processingRequired: true,
    yieldMultiplier: 0.1,
    uses: [
      'Spirit binding',
      'Memory preservation',
      'Necromantic focus',
      'Ultimate rituals',
    ],
    supernatural: true,
    cursed: true,
  },
};

/**
 * Get ore type by ID
 */
export function getOreType(oreId: string): OreType | undefined {
  return ORE_TYPES[oreId];
}

/**
 * Get all ores by rarity
 */
export function getOresByRarity(rarity: OreRarity): OreType[] {
  return Object.values(ORE_TYPES).filter((ore) => ore.rarity === rarity);
}

/**
 * Get ores usable in crafting
 */
export function getCraftingOres(): OreType[] {
  return Object.values(ORE_TYPES).filter((ore) => ore.processingRequired);
}

/**
 * Get supernatural ores
 */
export function getSupernaturalOres(): OreType[] {
  return Object.values(ORE_TYPES).filter((ore) => ore.supernatural);
}

/**
 * Calculate ore processing cost
 */
export function getProcessingCost(oreId: string, quantity: number): number {
  const ore = getOreType(oreId);
  if (!ore || !ore.processingRequired) return 0;

  return Math.floor(ore.baseValue * 0.2 * quantity);
}

/**
 * Calculate current market price (with demand fluctuation)
 */
export function getMarketPrice(oreId: string, demandModifier: number = 1): number {
  const ore = getOreType(oreId);
  if (!ore) return 0;

  const demandFactor = (ore.marketDemand / 100) * demandModifier;
  return Math.floor(ore.baseValue * demandFactor);
}
