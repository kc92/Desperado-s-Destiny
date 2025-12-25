/**
 * Bounty Hunt Model
 * Tracks active bounty hunting sessions
 *
 * Sprint 7: Mid-Game Content - Bounty Hunting (L20 unlock)
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export type BountyHuntStatus = 'tracking' | 'confronted' | 'captured' | 'killed' | 'escaped' | 'expired' | 'abandoned';

export interface BountyEncounter {
  type: 'clue' | 'ambush' | 'witness' | 'trap' | 'gang_encounter';
  location: string;
  outcome: 'success' | 'partial' | 'failure';
  description: string;
  timestamp: Date;
}

export interface IBountyHunt extends Document {
  // Core identification
  characterId: mongoose.Types.ObjectId;
  targetId: string;                     // Reference to bountyTargets.ts

  // Hunt details
  tier: 'petty' | 'wanted' | 'notorious' | 'legendary';
  status: BountyHuntStatus;

  // Timing
  startedAt: Date;
  expiresAt: Date;
  completedAt?: Date;

  // Progress
  trackingProgress: number;             // 0-100%
  currentLocation?: string;             // Last known location
  cluesFound: number;
  energySpent: number;

  // Encounters during the hunt
  encounters: BountyEncounter[];

  // Result
  captureMethod?: 'dead' | 'alive';
  goldAwarded?: number;
  xpAwarded?: number;
  reputationChange?: { faction: string; amount: number };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface IBountyHuntModel extends Model<IBountyHunt> {
  findActiveHunt(characterId: string): Promise<IBountyHunt | null>;
  getHuntHistory(characterId: string, limit?: number): Promise<IBountyHunt[]>;
  countCompletedHunts(characterId: string): Promise<number>;
}

const BountyEncounterSchema = new Schema({
  type: {
    type: String,
    enum: ['clue', 'ambush', 'witness', 'trap', 'gang_encounter'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  outcome: {
    type: String,
    enum: ['success', 'partial', 'failure'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const BountyHuntSchema = new Schema<IBountyHunt>({
  characterId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    index: true
  },
  targetId: {
    type: String,
    required: true
  },
  tier: {
    type: String,
    enum: ['petty', 'wanted', 'notorious', 'legendary'],
    required: true
  },
  status: {
    type: String,
    enum: ['tracking', 'confronted', 'captured', 'killed', 'escaped', 'expired', 'abandoned'],
    default: 'tracking'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date
  },
  trackingProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  currentLocation: {
    type: String
  },
  cluesFound: {
    type: Number,
    default: 0
  },
  energySpent: {
    type: Number,
    default: 0
  },
  encounters: {
    type: [BountyEncounterSchema],
    default: []
  },
  captureMethod: {
    type: String,
    enum: ['dead', 'alive']
  },
  goldAwarded: {
    type: Number
  },
  xpAwarded: {
    type: Number
  },
  reputationChange: {
    type: {
      faction: { type: String },
      amount: { type: Number }
    }
  }
}, {
  timestamps: true
});

// Indexes
BountyHuntSchema.index({ characterId: 1, status: 1 });
BountyHuntSchema.index({ characterId: 1, completedAt: -1 });
BountyHuntSchema.index({ expiresAt: 1 }); // For cleanup jobs

// Static methods
BountyHuntSchema.statics.findActiveHunt = async function(
  characterId: string
): Promise<IBountyHunt | null> {
  return this.findOne({
    characterId: new mongoose.Types.ObjectId(characterId),
    status: { $in: ['tracking', 'confronted'] }
  });
};

BountyHuntSchema.statics.getHuntHistory = async function(
  characterId: string,
  limit: number = 20
): Promise<IBountyHunt[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId),
    status: { $in: ['captured', 'killed', 'escaped', 'expired', 'abandoned'] }
  })
    .sort({ completedAt: -1 })
    .limit(limit);
};

BountyHuntSchema.statics.countCompletedHunts = async function(
  characterId: string
): Promise<number> {
  return this.countDocuments({
    characterId: new mongoose.Types.ObjectId(characterId),
    status: { $in: ['captured', 'killed'] }
  });
};

export const BountyHunt = mongoose.model<IBountyHunt, IBountyHuntModel>('BountyHunt', BountyHuntSchema);
