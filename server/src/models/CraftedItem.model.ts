/**
 * CraftedItem Model
 * Tracks individual crafted items with quality, durability, and special effects
 */

import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import {
  ItemQuality,
  SpecialEffect,
  QualityRoll,
  CraftedItemData
} from '@desperados/shared';
import { SecureRNG } from '../services/base/SecureRNG';

/**
 * CraftedItem document interface
 */
export interface ICraftedItem extends Document {
  // Owner
  characterId: Types.ObjectId;

  // Base item reference
  baseItemId: string;

  // Quality
  quality: ItemQuality;
  statMultiplier: number;

  // Crafter information
  crafterId: Types.ObjectId;
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
  updatedAt: Date;
  lastRepairedAt?: Date;

  // Quality roll details (for transparency)
  qualityRoll?: QualityRoll;

  // Status
  isEquipped: boolean;
  isBroken: boolean;

  // Methods
  applyDurabilityDamage(damage: number): Promise<void>;
  repair(percentage: number): Promise<void>;
  checkBreakage(): boolean;
  toItemData(): CraftedItemData;
}

/**
 * CraftedItem model static methods
 */
export interface ICraftedItemModel extends Model<ICraftedItem> {
  findByCharacter(characterId: string): Promise<ICraftedItem[]>;
  findMasterworks(): Promise<ICraftedItem[]>;
  findByCrafter(crafterId: string): Promise<ICraftedItem[]>;
}

/**
 * CraftedItem schema definition
 */
const CraftedItemSchema = new Schema<ICraftedItem>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    baseItemId: {
      type: String,
      required: true,
      index: true
    },
    quality: {
      type: String,
      required: true,
      enum: Object.values(ItemQuality),
      default: ItemQuality.COMMON,
      index: true
    },
    statMultiplier: {
      type: Number,
      required: true,
      default: 1.0,
      min: 0.5,
      max: 2.0
    },
    crafterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    crafterName: {
      type: String,
      required: true
    },
    customName: {
      type: String,
      maxlength: 50,
      trim: true
    },
    specialEffects: [
      {
        effectId: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String, required: true },
        category: {
          type: String,
          required: true,
          enum: ['weapon', 'armor', 'tool']
        },
        statBonus: {
          stat: String,
          value: Number,
          type: { type: String, enum: ['percentage', 'flat'] }
        },
        criticalChanceBonus: Number,
        damageBonus: Number,
        damageReduction: Number,
        dodgeBonus: Number,
        attackSpeedBonus: Number,
        healingOnHit: Number,
        stunChance: Number,
        durabilityBonus: Number,
        materialCostReduction: Number,
        qualityChanceBonus: Number,
        durabilityLossReduction: Number,
        craftingSpeedBonus: Number,
        gatheringYieldBonus: Number,
        regeneration: Number,
        resistanceType: String,
        resistanceBonus: Number
      }
    ],
    durability: {
      current: {
        type: Number,
        required: true,
        min: 0
      },
      max: {
        type: Number,
        required: true,
        min: 1
      }
    },
    lastRepairedAt: {
      type: Date
    },
    qualityRoll: {
      baseChance: Number,
      materialBonus: Number,
      toolBonus: Number,
      facilityBonus: Number,
      specializationBonus: Number,
      luckRoll: Number,
      totalScore: Number,
      finalQuality: String,
      breakdown: [String]
    },
    isEquipped: {
      type: Boolean,
      default: false
    },
    isBroken: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes
CraftedItemSchema.index({ characterId: 1, quality: 1 });
CraftedItemSchema.index({ crafterId: 1, createdAt: -1 });
CraftedItemSchema.index({ quality: 1, createdAt: -1 });

/**
 * Instance method: Apply durability damage
 */
CraftedItemSchema.methods.applyDurabilityDamage = async function (
  damage: number
): Promise<void> {
  // Apply durability loss reduction from special effects
  let actualDamage = damage;

  for (const effect of this.specialEffects) {
    if (effect.durabilityLossReduction) {
      actualDamage *= 1 - effect.durabilityLossReduction / 100;
    }
  }

  this.durability.current = Math.max(0, this.durability.current - actualDamage);

  // Check if item is broken
  if (this.durability.current === 0) {
    this.isBroken = true;
  }

  await this.save();
};

/**
 * Instance method: Repair item
 */
CraftedItemSchema.methods.repair = async function (percentage: number): Promise<void> {
  const repairAmount = Math.floor(this.durability.max * (percentage / 100));
  this.durability.current = Math.min(
    this.durability.max,
    this.durability.current + repairAmount
  );

  if (this.durability.current > 0) {
    this.isBroken = false;
  }

  this.lastRepairedAt = new Date();
  await this.save();
};

/**
 * Instance method: Check if item should break (for Shoddy quality)
 */
CraftedItemSchema.methods.checkBreakage = function (): boolean {
  if (this.quality !== ItemQuality.SHODDY) {
    return false;
  }

  // Shoddy items have a chance to break on use
  // 5% base chance, increases as durability decreases
  const durabilityPercentage = (this.durability.current / this.durability.max) * 100;
  const breakageChance = 5 + (100 - durabilityPercentage) / 10;

  return SecureRNG.d100() < breakageChance;
};

/**
 * Instance method: Convert to CraftedItemData
 */
CraftedItemSchema.methods.toItemData = function (): CraftedItemData {
  return {
    baseItemId: this.baseItemId,
    quality: this.quality,
    statMultiplier: this.statMultiplier,
    crafterId: this.crafterId,
    crafterName: this.crafterName,
    customName: this.customName,
    specialEffects: this.specialEffects,
    durability: this.durability,
    createdAt: this.createdAt,
    lastRepairedAt: this.lastRepairedAt,
    qualityRoll: this.qualityRoll
  };
};

/**
 * Static method: Find all items owned by a character
 */
CraftedItemSchema.statics.findByCharacter = async function (
  characterId: string
): Promise<ICraftedItem[]> {
  return this.find({ characterId }).sort({ createdAt: -1 });
};

/**
 * Static method: Find all masterwork items
 */
CraftedItemSchema.statics.findMasterworks = async function (): Promise<ICraftedItem[]> {
  return this.find({ quality: ItemQuality.MASTERWORK }).sort({ createdAt: -1 });
};

/**
 * Static method: Find all items crafted by a specific character
 */
CraftedItemSchema.statics.findByCrafter = async function (
  crafterId: string
): Promise<ICraftedItem[]> {
  return this.find({ crafterId }).sort({ createdAt: -1 });
};

export const CraftedItem = mongoose.model<ICraftedItem, ICraftedItemModel>(
  'CraftedItem',
  CraftedItemSchema
);
