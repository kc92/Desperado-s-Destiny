/**
 * Influence History Model
 *
 * Mongoose schema for tracking historical influence changes
 * Phase 11, Wave 11.1 - Territory Influence System
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  InfluenceChange as IInfluenceChange,
  TerritoryFactionId,
  InfluenceSource,
} from '@desperados/shared';

/**
 * Influence History document interface
 */
export interface IInfluenceHistoryDocument extends Document, Omit<IInfluenceChange, '_id'> {}

/**
 * Influence History model interface
 */
export interface IInfluenceHistoryModel extends Model<IInfluenceHistoryDocument> {
  findByTerritory(
    territoryId: string,
    limit?: number
  ): Promise<IInfluenceHistoryDocument[]>;
  findByFaction(
    factionId: TerritoryFactionId,
    limit?: number
  ): Promise<IInfluenceHistoryDocument[]>;
  findByCharacter(
    characterId: string,
    limit?: number
  ): Promise<IInfluenceHistoryDocument[]>;
  findBySource(
    source: InfluenceSource,
    limit?: number
  ): Promise<IInfluenceHistoryDocument[]>;
  getRecentChanges(
    territoryId: string,
    factionId: TerritoryFactionId,
    hours?: number
  ): Promise<number>;
}

/**
 * Influence History schema
 */
const InfluenceHistorySchema = new Schema<IInfluenceHistoryDocument>(
  {
    territoryId: {
      type: String,
      required: true,
      index: true,
    },
    territoryName: {
      type: String,
      required: true,
    },
    factionId: {
      type: String,
      required: true,
      enum: Object.values(TerritoryFactionId),
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      required: true,
      enum: Object.values(InfluenceSource),
      index: true,
    },
    characterId: {
      type: String,
      index: true,
    },
    characterName: {
      type: String,
    },
    gangId: {
      type: String,
      index: true,
    },
    gangName: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // Using custom timestamp field
  }
);

/**
 * Indexes for efficient querying
 */
InfluenceHistorySchema.index({ territoryId: 1, timestamp: -1 });
InfluenceHistorySchema.index({ factionId: 1, timestamp: -1 });
InfluenceHistorySchema.index({ characterId: 1, timestamp: -1 });
InfluenceHistorySchema.index({ gangId: 1, timestamp: -1 });
InfluenceHistorySchema.index({ source: 1, timestamp: -1 });

/**
 * Static method: Find changes by territory
 */
InfluenceHistorySchema.statics.findByTerritory = async function(
  territoryId: string,
  limit: number = 50
): Promise<IInfluenceHistoryDocument[]> {
  return this.find({ territoryId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

/**
 * Static method: Find changes by faction
 */
InfluenceHistorySchema.statics.findByFaction = async function(
  factionId: TerritoryFactionId,
  limit: number = 50
): Promise<IInfluenceHistoryDocument[]> {
  return this.find({ factionId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

/**
 * Static method: Find changes by character
 */
InfluenceHistorySchema.statics.findByCharacter = async function(
  characterId: string,
  limit: number = 50
): Promise<IInfluenceHistoryDocument[]> {
  return this.find({ characterId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

/**
 * Static method: Find changes by source
 */
InfluenceHistorySchema.statics.findBySource = async function(
  source: InfluenceSource,
  limit: number = 50
): Promise<IInfluenceHistoryDocument[]> {
  return this.find({ source })
    .sort({ timestamp: -1 })
    .limit(limit);
};

/**
 * Static method: Get recent changes sum
 */
InfluenceHistorySchema.statics.getRecentChanges = async function(
  territoryId: string,
  factionId: TerritoryFactionId,
  hours: number = 24
): Promise<number> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const result = await this.aggregate([
    {
      $match: {
        territoryId,
        factionId,
        timestamp: { $gte: since },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);

  return result[0]?.total || 0;
};

/**
 * TTL index - automatically delete records older than 90 days
 */
InfluenceHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

/**
 * Influence History model
 */
export const InfluenceHistory = mongoose.model<
  IInfluenceHistoryDocument,
  IInfluenceHistoryModel
>('InfluenceHistory', InfluenceHistorySchema);
