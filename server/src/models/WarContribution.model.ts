/**
 * War Contribution Model
 *
 * Phase 2.4: Individual contribution records (immutable log)
 * Each entry represents a single contribution action during a gang war.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  WarContributionType,
  WarContributionCategory,
  WAR_CONTRIBUTION_TYPE_TO_CATEGORY,
} from '@desperados/shared';

/**
 * War Contribution document interface
 */
export interface IWarContribution extends Document {
  _id: mongoose.Types.ObjectId;
  warId: mongoose.Types.ObjectId;
  gangId: mongoose.Types.ObjectId;
  characterId: mongoose.Types.ObjectId;
  characterName: string;
  type: WarContributionType;
  category: WarContributionCategory;
  points: number;
  rawValue?: number;  // e.g., gold amount, damage dealt
  context?: Record<string, unknown>;  // e.g., { raidId, zoneId }
  createdAt: Date;
}

/**
 * War Contribution model interface with static methods
 */
export interface IWarContributionModel extends Model<IWarContribution> {
  /**
   * Find all contributions for a character in a specific war
   */
  findByCharacterInWar(
    warId: mongoose.Types.ObjectId,
    characterId: mongoose.Types.ObjectId
  ): Promise<IWarContribution[]>;

  /**
   * Get total points for a character in a war
   */
  getTotalPointsForCharacter(
    warId: mongoose.Types.ObjectId,
    characterId: mongoose.Types.ObjectId
  ): Promise<number>;

  /**
   * Get contribution breakdown by category for a character
   */
  getCategoryBreakdown(
    warId: mongoose.Types.ObjectId,
    characterId: mongoose.Types.ObjectId
  ): Promise<Record<WarContributionCategory, number>>;

  /**
   * Get all contributions for a war
   */
  findByWar(warId: mongoose.Types.ObjectId): Promise<IWarContribution[]>;
}

/**
 * War Contribution schema definition
 */
const WarContributionSchema = new Schema<IWarContribution>(
  {
    warId: {
      type: Schema.Types.ObjectId,
      ref: 'GangWar',
      required: true,
      index: true,
    },
    gangId: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
      required: true,
      index: true,
    },
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true,
    },
    characterName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(WarContributionType),
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(WarContributionCategory),
      required: true,
    },
    points: {
      type: Number,
      required: true,
      min: 0,
    },
    rawValue: {
      type: Number,
    },
    context: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need createdAt
  }
);

// Compound indexes for efficient queries
WarContributionSchema.index({ warId: 1, characterId: 1 });
WarContributionSchema.index({ warId: 1, gangId: 1, characterId: 1 });
WarContributionSchema.index({ characterId: 1, createdAt: -1 });
WarContributionSchema.index({ warId: 1, category: 1 });

/**
 * Pre-save middleware: Auto-populate category from type
 */
WarContributionSchema.pre('save', function (next) {
  if (!this.category && this.type) {
    this.category = WAR_CONTRIBUTION_TYPE_TO_CATEGORY[this.type];
  }
  next();
});

/**
 * Static: Find all contributions for a character in a specific war
 */
WarContributionSchema.statics.findByCharacterInWar = async function (
  warId: mongoose.Types.ObjectId,
  characterId: mongoose.Types.ObjectId
): Promise<IWarContribution[]> {
  return this.find({ warId, characterId }).sort({ createdAt: -1 });
};

/**
 * Static: Get total points for a character in a war
 */
WarContributionSchema.statics.getTotalPointsForCharacter = async function (
  warId: mongoose.Types.ObjectId,
  characterId: mongoose.Types.ObjectId
): Promise<number> {
  const result = await this.aggregate([
    { $match: { warId, characterId } },
    { $group: { _id: null, total: { $sum: '$points' } } },
  ]);
  return result.length > 0 ? result[0].total : 0;
};

/**
 * Static: Get contribution breakdown by category for a character
 */
WarContributionSchema.statics.getCategoryBreakdown = async function (
  warId: mongoose.Types.ObjectId,
  characterId: mongoose.Types.ObjectId
): Promise<Record<WarContributionCategory, number>> {
  const result = await this.aggregate([
    { $match: { warId, characterId } },
    { $group: { _id: '$category', total: { $sum: '$points' } } },
  ]);

  // Initialize all categories with 0
  const breakdown: Record<WarContributionCategory, number> = {
    [WarContributionCategory.COMBAT]: 0,
    [WarContributionCategory.RAIDS]: 0,
    [WarContributionCategory.TERRITORY]: 0,
    [WarContributionCategory.RESOURCES]: 0,
    [WarContributionCategory.SUPPORT]: 0,
    [WarContributionCategory.LEADERSHIP]: 0,
  };

  // Populate with actual values
  for (const item of result) {
    breakdown[item._id as WarContributionCategory] = item.total;
  }

  return breakdown;
};

/**
 * Static: Find all contributions for a war
 */
WarContributionSchema.statics.findByWar = async function (
  warId: mongoose.Types.ObjectId
): Promise<IWarContribution[]> {
  return this.find({ warId }).sort({ createdAt: -1 });
};

export const WarContribution = mongoose.model<IWarContribution, IWarContributionModel>(
  'WarContribution',
  WarContributionSchema
);
