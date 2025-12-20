/**
 * Pending Reward Model
 * Handles quest and NPC rewards held when character inventory is full
 * Items persist indefinitely until claimed
 */

import mongoose, { Schema, Document } from 'mongoose';

export type RewardSource = 'quest' | 'npc';

export interface IPendingReward extends Document {
  characterId: mongoose.Types.ObjectId;
  source: RewardSource;
  sourceId: string;
  sourceName: string;
  items: Array<{
    itemId: string;
    quantity: number;
  }>;
  createdAt: Date;
}

const PendingRewardSchema = new Schema<IPendingReward>({
  characterId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    index: true,
  },
  source: {
    type: String,
    enum: ['quest', 'npc'],
    required: true,
  },
  sourceId: {
    type: String,
    required: true,
    comment: 'Quest ID or NPC ID',
  },
  sourceName: {
    type: String,
    required: true,
    comment: 'Quest name or NPC name for display',
  },
  items: [
    {
      itemId: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

// Compound index for efficient character queries
PendingRewardSchema.index({ characterId: 1, createdAt: -1 });

// Index for source lookups
PendingRewardSchema.index({ source: 1, sourceId: 1 });

// Virtual for total item count
PendingRewardSchema.virtual('totalItems').get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Ensure virtuals are included in JSON output
PendingRewardSchema.set('toJSON', { virtuals: true });
PendingRewardSchema.set('toObject', { virtuals: true });

export const PendingReward = mongoose.model<IPendingReward>('PendingReward', PendingRewardSchema);
