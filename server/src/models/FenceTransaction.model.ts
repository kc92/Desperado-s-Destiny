/**
 * Fence Transaction Model
 *
 * Mongoose schema for tracking all fence operation transactions.
 * Provides audit trail for fence sales, sting operations, and daily capacity tracking.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { FenceLocationId } from '@desperados/shared';

/**
 * Fence Transaction document interface
 */
export interface IFenceTransaction extends Document {
  characterId: mongoose.Types.ObjectId;
  fenceLocationId: string;

  // Items sold
  items: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    marketValue: number;
  }>;

  // Sale details
  totalMarketValue: number;
  salePrice: number;
  fenceRate: number;

  // Transaction status
  wasSuccessful: boolean;
  wasStingOperation: boolean;

  // Trust impact
  trustBefore: number;
  trustAfter: number;

  // Timestamps
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Fence Transaction static methods
 */
export interface IFenceTransactionModel extends Model<IFenceTransaction> {
  getUsedCapacityToday(characterId: string, fenceLocationId: string): Promise<number>;
  getTransactionHistory(characterId: string, limit?: number): Promise<IFenceTransaction[]>;
}

/**
 * Fence Transaction schema definition
 */
const FenceTransactionSchema = new Schema<IFenceTransaction>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true,
    },
    fenceLocationId: {
      type: String,
      required: true,
      index: true,
    },
    items: [{
      itemId: { type: String, required: true },
      itemName: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      marketValue: { type: Number, required: true, min: 0 },
    }],
    totalMarketValue: {
      type: Number,
      required: true,
      min: 0,
    },
    salePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    fenceRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    wasSuccessful: {
      type: Boolean,
      required: true,
      index: true,
    },
    wasStingOperation: {
      type: Boolean,
      required: true,
      default: false,
    },
    trustBefore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    trustAfter: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
FenceTransactionSchema.index({ characterId: 1, timestamp: -1 });
FenceTransactionSchema.index({ characterId: 1, fenceLocationId: 1, timestamp: -1 });
FenceTransactionSchema.index({ characterId: 1, fenceLocationId: 1, wasSuccessful: 1, timestamp: -1 });

/**
 * Static method: Get used capacity for today
 * Returns total items sold successfully today to this fence
 */
FenceTransactionSchema.statics.getUsedCapacityToday = async function(
  characterId: string,
  fenceLocationId: string
): Promise<number> {
  // Get start of today (UTC)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const result = await this.aggregate([
    {
      $match: {
        characterId: new mongoose.Types.ObjectId(characterId),
        fenceLocationId,
        wasSuccessful: true,
        timestamp: { $gte: today },
      },
    },
    {
      $unwind: '$items',
    },
    {
      $group: {
        _id: null,
        totalQuantity: { $sum: '$items.quantity' },
      },
    },
  ]);

  return result.length > 0 ? result[0].totalQuantity : 0;
};

/**
 * Static method: Get transaction history for a character
 */
FenceTransactionSchema.statics.getTransactionHistory = async function(
  characterId: string,
  limit: number = 50
): Promise<IFenceTransaction[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId),
  })
    .sort({ timestamp: -1 })
    .limit(limit);
};

/**
 * Fence Transaction model
 */
export const FenceTransaction = mongoose.model<IFenceTransaction, IFenceTransactionModel>(
  'FenceTransaction',
  FenceTransactionSchema
);
