/**
 * Masterwork Item System Types
 * Quality tiers, special effects, and crafting quality determination
 */

import { Types } from 'mongoose';

/**
 * Quality tier enum for crafted items
 */
export enum ItemQuality {
  SHODDY = 'shoddy',
  COMMON = 'common',
  FINE = 'fine',
  SUPERIOR = 'superior',
  EXCEPTIONAL = 'exceptional',
  MASTERWORK = 'masterwork'
}

/**
 * Special effect category for masterwork items
 */
export enum SpecialEffectCategory {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  TOOL = 'tool'
}

/**
 * Quality tier configuration
 */
export interface QualityTier {
  quality: ItemQuality;
  statMultiplier: number;
  durabilityMultiplier: number;
  color: string; // Display color code
  displayName: string;
  minEffects: number; // Minimum special effects
  maxEffects: number; // Maximum special effects
  canBreak: boolean; // Can break during use
  canRename: boolean; // Can be renamed by crafter
}

/**
 * Special effect for masterwork/exceptional items
 */
export interface SpecialEffect {
  effectId: string;
  name: string;
  description: string;
  category: SpecialEffectCategory;

  // Effect modifiers
  statBonus?: {
    stat: string; // e.g., 'combat_power', 'cunning_power', 'craft_power'
    value: number; // Percentage or flat bonus
    type: 'percentage' | 'flat';
  };

  // Special properties
  criticalChanceBonus?: number; // +% critical chance
  damageBonus?: number; // +% damage
  damageReduction?: number; // +% damage reduction
  dodgeBonus?: number; // +% dodge chance
  attackSpeedBonus?: number; // +% attack speed
  healingOnHit?: number; // % of damage dealt returned as healing
  stunChance?: number; // % chance to stun on hit
  durabilityBonus?: number; // +% durability
  materialCostReduction?: number; // -% material cost
  qualityChanceBonus?: number; // +% quality chance when crafting
  durabilityLossReduction?: number; // -% durability loss
  craftingSpeedBonus?: number; // +% crafting speed
  gatheringYieldBonus?: number; // +% gathering yield
  regeneration?: number; // HP per minute
  resistanceType?: string; // Damage type to resist
  resistanceBonus?: number; // +% resistance to type
}

/**
 * Quality roll breakdown for transparency
 */
export interface QualityRoll {
  baseChance: number; // From skill vs recipe level
  materialBonus: number; // From material quality
  toolBonus: number; // From tool quality
  facilityBonus: number; // From workshop/facility
  specializationBonus: number; // From skill specialization
  luckRoll: number; // Random factor
  totalScore: number; // Sum of all bonuses
  finalQuality: ItemQuality; // Determined quality
  breakdown: string[]; // Human-readable breakdown
}

/**
 * Material quality modifier
 */
export interface MaterialQuality {
  itemId: string;
  qualityBonus: number; // +5% to +20%
  isRare: boolean;
  isPerfect: boolean;
}

/**
 * Tool quality modifier
 */
export interface ToolQuality {
  toolId: string;
  qualityBonus: number; // +5% to +15%
  isMasterwork: boolean;
}

/**
 * Facility bonus for crafting
 */
export interface FacilityBonus {
  facilityType: 'basic_workshop' | 'advanced_workshop' | 'master_forge' | 'guild_hall';
  qualityBonus: number; // +5% to +10%
  specialization?: string; // e.g., 'weaponsmithing', 'leatherworking'
}

/**
 * Crafted item instance data
 */
export interface CraftedItemData {
  // Base item reference
  baseItemId: string;

  // Quality
  quality: ItemQuality;
  statMultiplier: number;

  // Crafter information
  crafterId: Types.ObjectId | string;
  crafterName: string;
  customName?: string; // Only for masterwork

  // Special effects
  specialEffects: SpecialEffect[];

  // Durability tracking
  durability: {
    current: number;
    max: number;
  };

  // Timestamps
  createdAt: Date;
  lastRepairedAt?: Date;

  // Quality roll details (for transparency)
  qualityRoll?: QualityRoll;
}

/**
 * Crafting context for quality determination
 */
export interface CraftingContext {
  characterId: string;
  characterName: string;
  skillLevel: number;
  recipeLevel: number;
  isSpecialized: boolean;
  materials: MaterialQuality[];
  tool?: ToolQuality;
  facility?: FacilityBonus;
}

/**
 * Quality thresholds for tier determination
 */
export interface QualityThresholds {
  [ItemQuality.SHODDY]: number; // < 0
  [ItemQuality.COMMON]: number; // 0-29
  [ItemQuality.FINE]: number; // 30-59
  [ItemQuality.SUPERIOR]: number; // 60-84
  [ItemQuality.EXCEPTIONAL]: number; // 85-94
  [ItemQuality.MASTERWORK]: number; // 95+
}

/**
 * Item breakage result
 */
export interface BreakageResult {
  broken: boolean;
  reason?: string;
  damageDealt?: number;
}

/**
 * Durability damage context
 */
export interface DurabilityDamageContext {
  itemId: string;
  action: 'combat' | 'crafting' | 'gathering' | 'use';
  baseDamage: number;
  modifiers: {
    quality: number; // Quality-based reduction
    specialEffects: number; // Special effect reduction
  };
}

/**
 * Repair context
 */
export interface RepairContext {
  itemId: string;
  crafterId: string;
  skillLevel: number;
  materials: Array<{ itemId: string; quantity: number }>;
  repairPercentage: number; // How much durability to restore
}

/**
 * Rename context (masterwork only)
 */
export interface RenameContext {
  itemId: string;
  crafterId: string;
  newName: string;
}
