/**
 * Quality Tier Definitions
 * Central configuration for item quality tiers
 */

import { ItemQuality, QualityTier } from '@desperados/shared';

/**
 * Complete quality tier definitions
 */
export const QUALITY_TIERS: Record<ItemQuality, QualityTier> = {
  [ItemQuality.SHODDY]: {
    quality: ItemQuality.SHODDY,
    statMultiplier: 0.75,
    durabilityMultiplier: 0.8,
    color: '#9E9E9E', // Gray
    displayName: 'Shoddy',
    minEffects: 0,
    maxEffects: 0,
    canBreak: true,
    canRename: false
  },
  [ItemQuality.COMMON]: {
    quality: ItemQuality.COMMON,
    statMultiplier: 1.0,
    durabilityMultiplier: 1.0,
    color: '#FFFFFF', // White
    displayName: 'Common',
    minEffects: 0,
    maxEffects: 0,
    canBreak: false,
    canRename: false
  },
  [ItemQuality.FINE]: {
    quality: ItemQuality.FINE,
    statMultiplier: 1.15,
    durabilityMultiplier: 1.2,
    color: '#4CAF50', // Green
    displayName: 'Fine',
    minEffects: 0,
    maxEffects: 0,
    canBreak: false,
    canRename: false
  },
  [ItemQuality.SUPERIOR]: {
    quality: ItemQuality.SUPERIOR,
    statMultiplier: 1.3,
    durabilityMultiplier: 1.4,
    color: '#2196F3', // Blue
    displayName: 'Superior',
    minEffects: 0,
    maxEffects: 0,
    canBreak: false,
    canRename: false
  },
  [ItemQuality.EXCEPTIONAL]: {
    quality: ItemQuality.EXCEPTIONAL,
    statMultiplier: 1.5,
    durabilityMultiplier: 1.6,
    color: '#9C27B0', // Purple
    displayName: 'Exceptional',
    minEffects: 0,
    maxEffects: 1,
    canBreak: false,
    canRename: false
  },
  [ItemQuality.MASTERWORK]: {
    quality: ItemQuality.MASTERWORK,
    statMultiplier: 1.75,
    durabilityMultiplier: 2.0,
    color: '#FFD700', // Gold
    displayName: 'Masterwork',
    minEffects: 1,
    maxEffects: 2,
    canBreak: false,
    canRename: true
  }
};

/**
 * Quality score thresholds for tier determination
 */
export const QUALITY_THRESHOLDS = {
  [ItemQuality.SHODDY]: -Infinity,
  [ItemQuality.COMMON]: 0,
  [ItemQuality.FINE]: 30,
  [ItemQuality.SUPERIOR]: 60,
  [ItemQuality.EXCEPTIONAL]: 85,
  [ItemQuality.MASTERWORK]: 95
} as const;

/**
 * Base durability values by item type
 */
export const BASE_DURABILITY = {
  weapon: 150,
  armor: 200,
  tool: 100,
  consumable: 50,
  material: 50,
  other: 100
} as const;

/**
 * Rarity durability multipliers
 */
export const RARITY_DURABILITY_MULTIPLIER = {
  common: 1.0,
  uncommon: 1.2,
  rare: 1.5,
  epic: 2.0,
  legendary: 3.0
} as const;

/**
 * Quality color codes for UI
 */
export const QUALITY_COLORS = {
  [ItemQuality.SHODDY]: '#9E9E9E',
  [ItemQuality.COMMON]: '#FFFFFF',
  [ItemQuality.FINE]: '#4CAF50',
  [ItemQuality.SUPERIOR]: '#2196F3',
  [ItemQuality.EXCEPTIONAL]: '#9C27B0',
  [ItemQuality.MASTERWORK]: '#FFD700'
} as const;

/**
 * Get quality tier by name
 */
export function getQualityTier(quality: ItemQuality): QualityTier {
  return QUALITY_TIERS[quality];
}

/**
 * Get all quality tiers as array
 */
export function getAllQualityTiers(): QualityTier[] {
  return Object.values(QUALITY_TIERS);
}

/**
 * Get quality tier from score
 */
export function getQualityFromScore(score: number): ItemQuality {
  if (score >= QUALITY_THRESHOLDS[ItemQuality.MASTERWORK]) {
    return ItemQuality.MASTERWORK;
  } else if (score >= QUALITY_THRESHOLDS[ItemQuality.EXCEPTIONAL]) {
    return ItemQuality.EXCEPTIONAL;
  } else if (score >= QUALITY_THRESHOLDS[ItemQuality.SUPERIOR]) {
    return ItemQuality.SUPERIOR;
  } else if (score >= QUALITY_THRESHOLDS[ItemQuality.FINE]) {
    return ItemQuality.FINE;
  } else if (score >= QUALITY_THRESHOLDS[ItemQuality.COMMON]) {
    return ItemQuality.COMMON;
  } else {
    return ItemQuality.SHODDY;
  }
}
