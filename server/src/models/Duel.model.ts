/**
 * Duel Model
 * Represents PvP deck game challenges between players
 */

import mongoose, { Schema, Document } from 'mongoose';

export enum DuelStatus {
  PENDING = 'pending',      // Challenge sent, awaiting response
  ACCEPTED = 'accepted',    // Both players ready, game starting
  IN_PROGRESS = 'in_progress', // Game active
  COMPLETED = 'completed',  // Game finished
  DECLINED = 'declined',    // Challenge rejected
  EXPIRED = 'expired',      // Challenge timed out
  CANCELLED = 'cancelled'   // Challenger withdrew
}

export enum DuelType {
  CASUAL = 'casual',        // No stakes
  RANKED = 'ranked',        // Affects ranking
  WAGER = 'wager'          // Gold on the line
}

export interface IDuel extends Document {
  challengerId: mongoose.Types.ObjectId;
  challengedId: mongoose.Types.ObjectId;
  challengerName: string;
  challengedName: string;
  status: DuelStatus;
  type: DuelType;
  wagerAmount: number;
  gameId?: string;
  gameType: string;
  challengerReady: boolean;
  challengedReady: boolean;
  winnerId?: mongoose.Types.ObjectId;
  winnerName?: string;
  challengerScore?: number;
  challengedScore?: number;
  challengerHandName?: string;
  challengedHandName?: string;
  expiresAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DuelSchema = new Schema<IDuel>(
  {
    challengerId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    challengedId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    challengerName: {
      type: String,
      required: true
    },
    challengedName: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(DuelStatus),
      default: DuelStatus.PENDING,
      index: true
    },
    type: {
      type: String,
      enum: Object.values(DuelType),
      default: DuelType.CASUAL
    },
    wagerAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    gameId: {
      type: String
    },
    gameType: {
      type: String,
      default: 'pokerHoldDraw'
    },
    challengerReady: {
      type: Boolean,
      default: false
    },
    challengedReady: {
      type: Boolean,
      default: false
    },
    winnerId: {
      type: Schema.Types.ObjectId,
      ref: 'Character'
    },
    winnerName: {
      type: String
    },
    challengerScore: {
      type: Number
    },
    challengedScore: {
      type: Number
    },
    challengerHandName: {
      type: String
    },
    challengedHandName: {
      type: String
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes for common queries
DuelSchema.index({ challengerId: 1, status: 1 });
DuelSchema.index({ challengedId: 1, status: 1 });
DuelSchema.index({ status: 1, expiresAt: 1 });

/**
 * TTL Index for automatic cleanup
 * Expired duels are automatically deleted 24 hours after their expiresAt date.
 * This provides a grace period for reviewing expired duels before permanent removal.
 *
 * SECURITY: Prevents database bloat from accumulating expired duels.
 */
DuelSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 }); // 24 hours grace period

export const Duel = mongoose.model<IDuel>('Duel', DuelSchema);
