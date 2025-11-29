/**
 * Reputation History Model
 * Tracks all faction reputation changes for audit and transparency
 */

import mongoose, { Document, Schema } from 'mongoose';

export interface IReputationHistory extends Document {
  characterId: mongoose.Types.ObjectId;
  faction: string;
  change: number;
  reason: string;
  previousValue: number;
  newValue: number;
  timestamp: Date;
}

const ReputationHistorySchema = new Schema<IReputationHistory>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    faction: {
      type: String,
      required: true,
      enum: ['settlerAlliance', 'nahiCoalition', 'frontera'],
      index: true
    },
    change: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    previousValue: {
      type: Number,
      required: true,
      min: -100,
      max: 100
    },
    newValue: {
      type: Number,
      required: true,
      min: -100,
      max: 100
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false // Using custom timestamp field
  }
);

// Compound index for efficient queries
ReputationHistorySchema.index({ characterId: 1, timestamp: -1 });
ReputationHistorySchema.index({ characterId: 1, faction: 1, timestamp: -1 });

// Ensure virtuals are included in JSON
ReputationHistorySchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

export const ReputationHistory = mongoose.model<IReputationHistory>(
  'ReputationHistory',
  ReputationHistorySchema
);
