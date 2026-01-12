/**
 * Ground Item Model
 * Handles items dropped on the ground when inventory is full
 * Items auto-delete after 1 hour via TTL index
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IGroundItem extends Document {
  itemId: string;
  quantity: number;
  locationId: string;
  droppedBy: mongoose.Types.ObjectId;
  droppedAt: Date;
  expiresAt: Date;
}

const GroundItemSchema = new Schema<IGroundItem>({
  itemId: {
    type: String,
    required: true,
    comment: 'Reference to item in shared item database',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  locationId: {
    type: String,
    required: true,
    index: true,
    comment: 'Location where item was dropped',
  },
  droppedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    index: true,
  },
  droppedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    // Note: TTL index defined below
    comment: 'Items automatically deleted after this time',
  },
});

// TTL index - MongoDB will automatically delete documents after expiry
GroundItemSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for efficient location queries
GroundItemSchema.index({ locationId: 1, expiresAt: 1 });

// Virtual for time remaining
GroundItemSchema.virtual('timeRemainingMs').get(function () {
  return Math.max(0, this.expiresAt.getTime() - Date.now());
});

// Ensure virtuals are included in JSON output
GroundItemSchema.set('toJSON', { virtuals: true });
GroundItemSchema.set('toObject', { virtuals: true });

export const GroundItem = mongoose.model<IGroundItem>('GroundItem', GroundItemSchema);
