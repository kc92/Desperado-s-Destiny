/**
 * Masterwork Service
 * Handles quality determination, special effects, and masterwork item creation
 */

import {
  ItemQuality,
  QualityTier,
  QualityRoll,
  CraftingContext,
  SpecialEffect,
  SpecialEffectCategory,
  QualityThresholds
} from '@desperados/shared';
import { CraftedItem, ICraftedItem } from '../models/CraftedItem.model';
import { Character } from '../models/Character.model';
import { Item } from '../models/Item.model';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { getRandomEffects } from '../data/specialEffects';
import { SecureRNG } from './base/SecureRNG';

/**
 * Quality tier definitions
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
 * Quality score thresholds
 */
const QUALITY_THRESHOLDS: QualityThresholds = {
  [ItemQuality.SHODDY]: -Infinity,
  [ItemQuality.COMMON]: 0,
  [ItemQuality.FINE]: 30,
  [ItemQuality.SUPERIOR]: 60,
  [ItemQuality.EXCEPTIONAL]: 85,
  [ItemQuality.MASTERWORK]: 95
};

export class MasterworkService {
  /**
   * Determine quality based on crafting context
   */
  static determineQuality(context: CraftingContext): QualityRoll {
    // 1. BASE CHANCE: (Skill Level - Recipe Level) * 2%
    const skillDifference = context.skillLevel - context.recipeLevel;
    const baseChance = skillDifference * 2;

    // 2. MATERIAL QUALITY BONUS: +5% to +20%
    const materialBonus = context.materials.reduce(
      (sum, material) => sum + material.qualityBonus,
      0
    );

    // 3. TOOL QUALITY BONUS: +5% to +15%
    const toolBonus = context.tool?.qualityBonus || 0;

    // 4. FACILITY BONUS: +5% to +10%
    const facilityBonus = context.facility?.qualityBonus || 0;

    // 5. SPECIALIZATION BONUS: +10% if specialized
    const specializationBonus = context.isSpecialized ? 10 : 0;

    // 6. LUCK ROLL: Random factor ±10%
    const luckRoll = (SecureRNG.float(0, 1) * 20) - 10;

    // Calculate total score
    const totalScore = Math.max(
      0,
      baseChance + materialBonus + toolBonus + facilityBonus + specializationBonus + luckRoll
    );

    // Determine quality tier
    const finalQuality = this.scoreToQuality(totalScore);

    // Create breakdown for transparency
    const breakdown: string[] = [
      `Base (Skill ${context.skillLevel} - Recipe ${context.recipeLevel}): ${baseChance.toFixed(1)}%`,
      `Materials: +${materialBonus.toFixed(1)}%`,
      `Tool: +${toolBonus.toFixed(1)}%`,
      `Facility: +${facilityBonus.toFixed(1)}%`,
      `Specialization: +${specializationBonus.toFixed(1)}%`,
      `Luck Roll: ${luckRoll > 0 ? '+' : ''}${luckRoll.toFixed(1)}%`,
      `Total Score: ${totalScore.toFixed(1)}`,
      `Result: ${QUALITY_TIERS[finalQuality].displayName}`
    ];

    logger.info(`Quality determination for ${context.characterName}:`, {
      totalScore,
      finalQuality,
      breakdown
    });

    return {
      baseChance,
      materialBonus,
      toolBonus,
      facilityBonus,
      specializationBonus,
      luckRoll,
      totalScore,
      finalQuality,
      breakdown
    };
  }

  /**
   * Convert quality score to quality tier
   */
  private static scoreToQuality(score: number): ItemQuality {
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

  /**
   * Generate special effects for quality tier
   */
  static generateSpecialEffects(
    quality: ItemQuality,
    itemType: 'weapon' | 'armor' | 'tool'
  ): SpecialEffect[] {
    const tier = QUALITY_TIERS[quality];

    // No effects for lower quality tiers
    if (tier.maxEffects === 0) {
      return [];
    }

    // Determine effect category based on item type
    let category: SpecialEffectCategory;
    switch (itemType) {
      case 'weapon':
        category = SpecialEffectCategory.WEAPON;
        break;
      case 'armor':
        category = SpecialEffectCategory.ARMOR;
        break;
      case 'tool':
        category = SpecialEffectCategory.TOOL;
        break;
      default:
        return [];
    }

    // Determine number of effects
    let numEffects: number;
    if (quality === ItemQuality.EXCEPTIONAL) {
      // 50% chance for 1 effect
      numEffects = SecureRNG.chance(0.5) ? 1 : 0;
    } else if (quality === ItemQuality.MASTERWORK) {
      // Random between 1-2 effects
      numEffects = SecureRNG.chance(0.5) ? 2 : 1;
    } else {
      numEffects = 0;
    }

    if (numEffects === 0) {
      return [];
    }

    return getRandomEffects(category, numEffects);
  }

  /**
   * Create a crafted item with quality
   */
  static async createCraftedItem(
    characterId: string,
    baseItemId: string,
    qualityRoll: QualityRoll,
    context: CraftingContext
  ): Promise<ICraftedItem> {
    // Get base item
    const baseItem = await Item.findByItemId(baseItemId);
    if (!baseItem) {
      throw new AppError(`Base item ${baseItemId} not found`, 404);
    }

    // Get quality tier
    const tier = QUALITY_TIERS[qualityRoll.finalQuality];

    // Determine item type for special effects
    let itemType: 'weapon' | 'armor' | 'tool';
    if (baseItem.type === 'weapon') {
      itemType = 'weapon';
    } else if (baseItem.type === 'armor') {
      itemType = 'armor';
    } else {
      itemType = 'tool';
    }

    // Generate special effects
    const specialEffects = this.generateSpecialEffects(qualityRoll.finalQuality, itemType);

    // Calculate base durability (based on item type and rarity)
    let baseDurability = 100;
    switch (baseItem.type) {
      case 'weapon':
        baseDurability = 150;
        break;
      case 'armor':
        baseDurability = 200;
        break;
      default:
        baseDurability = 100;
    }

    // Apply rarity multiplier
    switch (baseItem.rarity) {
      case 'uncommon':
        baseDurability *= 1.2;
        break;
      case 'rare':
        baseDurability *= 1.5;
        break;
      case 'epic':
        baseDurability *= 2.0;
        break;
      case 'legendary':
        baseDurability *= 3.0;
        break;
    }

    // Apply quality durability multiplier
    const maxDurability = Math.floor(baseDurability * tier.durabilityMultiplier);

    // Apply durability bonuses from special effects
    let durabilityBonus = 1.0;
    for (const effect of specialEffects) {
      if (effect.durabilityBonus) {
        durabilityBonus += effect.durabilityBonus / 100;
      }
    }
    const finalMaxDurability = Math.floor(maxDurability * durabilityBonus);

    // Create crafted item
    const craftedItem = new CraftedItem({
      characterId,
      baseItemId,
      quality: qualityRoll.finalQuality,
      statMultiplier: tier.statMultiplier,
      crafterId: context.characterId,
      crafterName: context.characterName,
      specialEffects,
      durability: {
        current: finalMaxDurability,
        max: finalMaxDurability
      },
      qualityRoll,
      isEquipped: false,
      isBroken: false
    });

    await craftedItem.save();

    logger.info(`Created crafted item:`, {
      characterId,
      baseItemId,
      quality: qualityRoll.finalQuality,
      specialEffects: specialEffects.map(e => e.name)
    });

    return craftedItem;
  }

  /**
   * Rename a masterwork item
   */
  static async renameMasterwork(
    itemId: string,
    crafterId: string,
    newName: string
  ): Promise<ICraftedItem> {
    const item = await CraftedItem.findById(itemId);
    if (!item) {
      throw new AppError('Item not found', 404);
    }

    // Only masterwork items can be renamed
    if (item.quality !== ItemQuality.MASTERWORK) {
      throw new AppError('Only masterwork items can be renamed', 400);
    }

    // Only the crafter can rename
    if (item.crafterId.toString() !== crafterId) {
      throw new AppError('Only the crafter can rename this item', 403);
    }

    // Validate name
    if (!newName || newName.length < 3 || newName.length > 50) {
      throw new AppError('Name must be between 3 and 50 characters', 400);
    }

    item.customName = newName.trim();
    await item.save();

    logger.info(`Renamed masterwork item ${itemId} to "${newName}"`);

    return item;
  }

  /**
   * Get quality tier information
   */
  static getQualityTier(quality: ItemQuality): QualityTier {
    return QUALITY_TIERS[quality];
  }

  /**
   * Get all quality tiers
   */
  static getAllQualityTiers(): Record<ItemQuality, QualityTier> {
    return QUALITY_TIERS;
  }

  /**
   * Calculate effective stats for a crafted item
   */
  static calculateEffectiveStats(
    baseStats: Record<string, number>,
    quality: ItemQuality,
    specialEffects: SpecialEffect[]
  ): Record<string, number> {
    const tier = QUALITY_TIERS[quality];
    const effectiveStats: Record<string, number> = {};

    // Apply quality multiplier to base stats
    for (const [stat, value] of Object.entries(baseStats)) {
      effectiveStats[stat] = value * tier.statMultiplier;
    }

    // Apply special effect stat bonuses
    for (const effect of specialEffects) {
      if (effect.statBonus) {
        const currentValue = effectiveStats[effect.statBonus.stat] || 0;
        if (effect.statBonus.type === 'flat') {
          effectiveStats[effect.statBonus.stat] = currentValue + effect.statBonus.value;
        } else {
          effectiveStats[effect.statBonus.stat] =
            currentValue * (1 + effect.statBonus.value / 100);
        }
      }
    }

    return effectiveStats;
  }

  /**
   * Get repair cost for an item
   */
  static calculateRepairCost(
    item: ICraftedItem,
    targetPercentage: number
  ): { gold: number; materials: Array<{ itemId: string; quantity: number }> } {
    const tier = QUALITY_TIERS[item.quality];

    // Base repair cost increases with quality
    let baseGoldCost = 50;
    switch (item.quality) {
      case ItemQuality.SHODDY:
        baseGoldCost = 25;
        break;
      case ItemQuality.COMMON:
        baseGoldCost = 50;
        break;
      case ItemQuality.FINE:
        baseGoldCost = 100;
        break;
      case ItemQuality.SUPERIOR:
        baseGoldCost = 200;
        break;
      case ItemQuality.EXCEPTIONAL:
        baseGoldCost = 400;
        break;
      case ItemQuality.MASTERWORK:
        baseGoldCost = 800;
        break;
    }

    // Scale by repair percentage
    const goldCost = Math.floor(baseGoldCost * (targetPercentage / 100));

    // Materials required (simplified - could be enhanced)
    const materials: Array<{ itemId: string; quantity: number }> = [
      {
        itemId: 'iron-ingot',
        quantity: Math.max(1, Math.floor(targetPercentage / 25))
      }
    ];

    return { gold: goldCost, materials };
  }

  /**
   * Check if character can repair an item
   */
  static async canRepair(
    characterId: string,
    itemId: string
  ): Promise<{ canRepair: boolean; reason?: string }> {
    const character = await Character.findById(characterId);
    if (!character) {
      return { canRepair: false, reason: 'Character not found' };
    }

    const item = await CraftedItem.findById(itemId);
    if (!item) {
      return { canRepair: false, reason: 'Item not found' };
    }

    if (item.characterId.toString() !== characterId) {
      return { canRepair: false, reason: 'You do not own this item' };
    }

    if (item.durability.current === item.durability.max) {
      return { canRepair: false, reason: 'Item is already at full durability' };
    }

    // Check if character has repair skill (assuming 'craft' skill)
    const craftSkill = character.skills.find(s => s.skillId === 'craft');
    if (!craftSkill || craftSkill.level < 10) {
      return { canRepair: false, reason: 'Requires Craft skill level 10 or higher' };
    }

    return { canRepair: true };
  }
}
