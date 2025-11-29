/**
 * Bounty Model
 *
 * Mongoose schemas for bounties and wanted levels
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  BountyType,
  BountyStatus,
  BountyCollectibleBy,
  BountyFaction,
  WantedRank,
} from '@desperados/shared';

/**
 * Bounty document interface
 */
export interface IBounty extends Document {
  targetId: mongoose.Types.ObjectId;
  targetName: string;
  bountyType: BountyType;
  issuerId?: mongoose.Types.ObjectId;
  issuerName?: string;
  issuerFaction?: BountyFaction;
  amount: number;
  reason: string;
  crimes: string[];
  status: BountyStatus;
  createdAt: Date;
  expiresAt?: Date;
  lastSeenLocation?: string;
  collectibleBy: BountyCollectibleBy;
  collectedBy?: mongoose.Types.ObjectId;
  collectedAt?: Date;

  // Instance methods
  isActive(): boolean;
  canBeCollectedBy(characterId: string, characterFaction?: string): boolean;
}

/**
 * Wanted level document interface
 */
export interface IWantedLevel extends Document {
  characterId: mongoose.Types.ObjectId;
  characterName: string;
  settlerAlliance: number;
  nahiCoalition: number;
  frontera: number;
  totalBounty: number;
  wantedRank: WantedRank;
  activeBounties: number;
  lastCrimeDate?: Date;
  lastSeenLocation?: string;
  lastUpdated: Date;

  // Instance methods
  calculateRank(): WantedRank;
  recalculate(): void;
}

/**
 * Bounty schema definition
 */
const BountySchema = new Schema<IBounty>(
  {
    targetId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true,
    },
    targetName: {
      type: String,
      required: true,
      index: true,
    },
    bountyType: {
      type: String,
      enum: Object.values(BountyType),
      required: true,
      index: true,
    },
    issuerId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      default: null,
    },
    issuerName: {
      type: String,
      default: null,
    },
    issuerFaction: {
      type: String,
      enum: [...Object.values(BountyFaction), null],
      default: null,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    reason: {
      type: String,
      required: true,
    },
    crimes: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(BountyStatus),
      required: true,
      default: BountyStatus.ACTIVE,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    lastSeenLocation: {
      type: String,
      default: null,
    },
    collectibleBy: {
      type: String,
      enum: Object.values(BountyCollectibleBy),
      required: true,
      default: BountyCollectibleBy.ANYONE,
    },
    collectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      default: null,
    },
    collectedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: false, // Using custom createdAt
  }
);

/**
 * Wanted level schema definition
 */
const WantedLevelSchema = new Schema<IWantedLevel>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      unique: true,
      index: true,
    },
    characterName: {
      type: String,
      required: true,
      index: true,
    },
    settlerAlliance: {
      type: Number,
      default: 0,
      min: 0,
    },
    nahiCoalition: {
      type: Number,
      default: 0,
      min: 0,
    },
    frontera: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalBounty: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    wantedRank: {
      type: String,
      enum: Object.values(WantedRank),
      default: WantedRank.UNKNOWN,
      index: true,
    },
    activeBounties: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastCrimeDate: {
      type: Date,
      default: null,
    },
    lastSeenLocation: {
      type: String,
      default: null,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // Using custom lastUpdated
  }
);

/**
 * Indexes for efficient querying
 */

// Bounty indexes
BountySchema.index({ targetId: 1, status: 1 });
BountySchema.index({ status: 1, createdAt: -1 });
BountySchema.index({ bountyType: 1, status: 1 });
BountySchema.index({ issuerFaction: 1, status: 1 });
BountySchema.index({ amount: -1, status: 1 }); // For bounty board sorting
BountySchema.index({ expiresAt: 1 }); // For expiration cleanup jobs

// Wanted level indexes
WantedLevelSchema.index({ totalBounty: -1 }); // For leaderboards
WantedLevelSchema.index({ wantedRank: 1, totalBounty: -1 });
WantedLevelSchema.index({ characterName: 1 });

/**
 * Bounty instance methods
 */

// Check if bounty is still active
BountySchema.methods.isActive = function (this: IBounty): boolean {
  if (this.status !== BountyStatus.ACTIVE) {
    return false;
  }
  if (this.expiresAt && new Date() > this.expiresAt) {
    return false;
  }
  return true;
};

// Check if bounty can be collected by a character
BountySchema.methods.canBeCollectedBy = function (
  this: IBounty,
  characterId: string,
  characterFaction?: string
): boolean {
  if (!this.isActive()) {
    return false;
  }

  switch (this.collectibleBy) {
    case BountyCollectibleBy.ANYONE:
      return true;
    case BountyCollectibleBy.ISSUER:
      return this.issuerId?.toString() === characterId;
    case BountyCollectibleBy.FACTION:
      // Check if character's faction matches bounty's issuer faction
      return characterFaction === this.issuerFaction;
    default:
      return false;
  }
};

/**
 * Wanted level instance methods
 */

// Calculate wanted rank from total bounty
WantedLevelSchema.methods.calculateRank = function (this: IWantedLevel): WantedRank {
  const { WANTED_RANK_THRESHOLDS } = require('@desperados/shared');

  for (const [rank, threshold] of Object.entries(WANTED_RANK_THRESHOLDS)) {
    const thresholdTyped = threshold as { min: number; max: number };
    if (this.totalBounty >= thresholdTyped.min && this.totalBounty <= thresholdTyped.max) {
      return rank as WantedRank;
    }
  }

  return WantedRank.UNKNOWN;
};

// Update total bounty and rank
WantedLevelSchema.methods.recalculate = function (this: IWantedLevel): void {
  this.totalBounty = this.settlerAlliance + this.nahiCoalition + this.frontera;
  this.wantedRank = this.calculateRank();
  this.lastUpdated = new Date();
};

/**
 * Static methods
 */

// Get all active bounties for a target
BountySchema.statics.getActiveBountiesForTarget = async function (
  targetId: string
): Promise<IBounty[]> {
  return this.find({
    targetId: new mongoose.Types.ObjectId(targetId),
    status: BountyStatus.ACTIVE,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } },
    ],
  }).sort({ amount: -1 });
};

// Get bounty board (active bounties sorted by amount)
BountySchema.statics.getBountyBoard = async function (
  limit: number = 50,
  minAmount: number = 0
): Promise<IBounty[]> {
  return this.find({
    status: BountyStatus.ACTIVE,
    amount: { $gte: minAmount },
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } },
    ],
  })
    .sort({ amount: -1, createdAt: -1 })
    .limit(limit);
};

// Expire old bounties
BountySchema.statics.expireOldBounties = async function (): Promise<number> {
  const result = await this.updateMany(
    {
      status: BountyStatus.ACTIVE,
      expiresAt: { $lte: new Date() },
    },
    {
      $set: { status: BountyStatus.EXPIRED },
    }
  );
  return result.modifiedCount || 0;
};

/**
 * Export models
 */
export const Bounty: Model<IBounty> = mongoose.model<IBounty>('Bounty', BountySchema);
export const WantedLevel: Model<IWantedLevel> = mongoose.model<IWantedLevel>(
  'WantedLevel',
  WantedLevelSchema
);
