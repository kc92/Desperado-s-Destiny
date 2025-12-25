/**
 * War Contribution Stats Model
 *
 * Phase 2.4: Aggregated stats per character per war (updated in real-time)
 * Provides fast access to leaderboard data without re-aggregating contributions.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { WarContributionCategory } from '@desperados/shared';

/**
 * War Contribution Stats document interface
 */
export interface IWarContributionStats extends Document {
  _id: mongoose.Types.ObjectId;
  warId: mongoose.Types.ObjectId;
  gangId: mongoose.Types.ObjectId;
  characterId: mongoose.Types.ObjectId;
  characterName: string;

  // Per-category point totals
  combatPoints: number;
  raidPoints: number;
  territoryPoints: number;
  resourcePoints: number;
  supportPoints: number;
  leadershipPoints: number;

  // Aggregate totals
  totalPoints: number;
  rank: number;

  // Efficiency metrics
  actionsCount: number;
  winsCount: number;
  lossesCount: number;

  // Active categories (for diversity bonus)
  activeCategories: WarContributionCategory[];

  createdAt: Date;
  updatedAt: Date;

  // Computed properties (virtual or method)
  getWinRate(): number;
  getPointsPerAction(): number;
  getDiversityBonus(): number;
}

/**
 * War Contribution Stats model interface with static methods
 */
export interface IWarContributionStatsModel extends Model<IWarContributionStats> {
  /**
   * Find or create stats record for a character in a war
   */
  findOrCreate(
    warId: mongoose.Types.ObjectId,
    gangId: mongoose.Types.ObjectId,
    characterId: mongoose.Types.ObjectId,
    characterName: string
  ): Promise<IWarContributionStats>;

  /**
   * Get war leaderboard (top N by total points)
   */
  getWarLeaderboard(
    warId: mongoose.Types.ObjectId,
    limit?: number
  ): Promise<IWarContributionStats[]>;

  /**
   * Get gang-specific leaderboard
   */
  getGangLeaderboard(
    warId: mongoose.Types.ObjectId,
    gangId: mongoose.Types.ObjectId
  ): Promise<IWarContributionStats[]>;

  /**
   * Recalculate all ranks for a war
   */
  recalculateRanks(warId: mongoose.Types.ObjectId): Promise<void>;

  /**
   * Get current MVP (highest points) for a war
   */
  getCurrentMVP(warId: mongoose.Types.ObjectId): Promise<IWarContributionStats | null>;
}

/**
 * War Contribution Stats schema definition
 */
const WarContributionStatsSchema = new Schema<IWarContributionStats>(
  {
    warId: {
      type: Schema.Types.ObjectId,
      ref: 'GangWar',
      required: true,
    },
    gangId: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
      required: true,
    },
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
    },
    characterName: {
      type: String,
      required: true,
    },

    // Category points
    combatPoints: { type: Number, default: 0 },
    raidPoints: { type: Number, default: 0 },
    territoryPoints: { type: Number, default: 0 },
    resourcePoints: { type: Number, default: 0 },
    supportPoints: { type: Number, default: 0 },
    leadershipPoints: { type: Number, default: 0 },

    // Totals
    totalPoints: { type: Number, default: 0, index: true },
    rank: { type: Number, default: 0 },

    // Efficiency metrics
    actionsCount: { type: Number, default: 0 },
    winsCount: { type: Number, default: 0 },
    lossesCount: { type: Number, default: 0 },

    // Active categories
    activeCategories: [{
      type: String,
      enum: Object.values(WarContributionCategory),
    }],
  },
  {
    timestamps: true,
  }
);

// Unique constraint: one record per character per war
WarContributionStatsSchema.index({ warId: 1, characterId: 1 }, { unique: true });
WarContributionStatsSchema.index({ warId: 1, gangId: 1, totalPoints: -1 });
WarContributionStatsSchema.index({ warId: 1, rank: 1 });

/**
 * Instance method: Get win rate
 */
WarContributionStatsSchema.methods.getWinRate = function (): number {
  const total = this.winsCount + this.lossesCount;
  return total > 0 ? this.winsCount / total : 0;
};

/**
 * Instance method: Get points per action
 */
WarContributionStatsSchema.methods.getPointsPerAction = function (): number {
  return this.actionsCount > 0 ? this.totalPoints / this.actionsCount : 0;
};

/**
 * Instance method: Get diversity bonus multiplier
 */
WarContributionStatsSchema.methods.getDiversityBonus = function (): number {
  // 5% bonus per active category, max 30%
  const bonusPerCategory = 0.05;
  const maxBonus = 0.30;
  return Math.min(this.activeCategories.length * bonusPerCategory, maxBonus);
};

/**
 * Static: Find or create stats record
 */
WarContributionStatsSchema.statics.findOrCreate = async function (
  warId: mongoose.Types.ObjectId,
  gangId: mongoose.Types.ObjectId,
  characterId: mongoose.Types.ObjectId,
  characterName: string
): Promise<IWarContributionStats> {
  let stats = await this.findOne({ warId, characterId });
  if (!stats) {
    stats = await this.create({
      warId,
      gangId,
      characterId,
      characterName,
    });
  }
  return stats;
};

/**
 * Static: Get war leaderboard
 */
WarContributionStatsSchema.statics.getWarLeaderboard = async function (
  warId: mongoose.Types.ObjectId,
  limit: number = 10
): Promise<IWarContributionStats[]> {
  return this.find({ warId, totalPoints: { $gt: 0 } })
    .sort({ totalPoints: -1 })
    .limit(limit)
    .populate('gangId', 'name tag');
};

/**
 * Static: Get gang-specific leaderboard
 */
WarContributionStatsSchema.statics.getGangLeaderboard = async function (
  warId: mongoose.Types.ObjectId,
  gangId: mongoose.Types.ObjectId
): Promise<IWarContributionStats[]> {
  return this.find({ warId, gangId, totalPoints: { $gt: 0 } })
    .sort({ totalPoints: -1 });
};

/**
 * Static: Recalculate all ranks for a war
 */
WarContributionStatsSchema.statics.recalculateRanks = async function (
  warId: mongoose.Types.ObjectId
): Promise<void> {
  // Get all stats sorted by points descending
  const allStats = await this.find({ warId }).sort({ totalPoints: -1 });

  // Update ranks in bulk
  const bulkOps = allStats.map((stat, index) => ({
    updateOne: {
      filter: { _id: stat._id },
      update: { $set: { rank: index + 1 } },
    },
  }));

  if (bulkOps.length > 0) {
    await this.bulkWrite(bulkOps);
  }
};

/**
 * Static: Get current MVP
 */
WarContributionStatsSchema.statics.getCurrentMVP = async function (
  warId: mongoose.Types.ObjectId
): Promise<IWarContributionStats | null> {
  return this.findOne({ warId })
    .sort({ totalPoints: -1 })
    .limit(1);
};

export const WarContributionStats = mongoose.model<IWarContributionStats, IWarContributionStatsModel>(
  'WarContributionStats',
  WarContributionStatsSchema
);
