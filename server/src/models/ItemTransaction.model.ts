/**
 * Item Transaction Model
 *
 * Tracks all buy/sell transactions for supply/demand mechanics
 * Transactions automatically expire after 7 days (TTL index)
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IItemTransaction extends Document {
  itemId: string;
  locationId: string;
  quantity: number;
  type: 'buy' | 'sell';
  price: number;
  timestamp: Date;
}

const ItemTransactionSchema = new Schema<IItemTransaction>({
  itemId: {
    type: String,
    required: true,
    index: true
  },
  locationId: {
    type: String,
    required: true,
    index: true
  },
  quantity: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
});

// TTL index - auto-delete after 7 days (604800 seconds)
ItemTransactionSchema.index({ timestamp: 1 }, { expireAfterSeconds: 604800 });

// Compound index for efficient queries
ItemTransactionSchema.index({ itemId: 1, locationId: 1, timestamp: -1 });
ItemTransactionSchema.index({ itemId: 1, locationId: 1, type: 1, timestamp: -1 });

export const ItemTransaction = mongoose.model<IItemTransaction>('ItemTransaction', ItemTransactionSchema);
