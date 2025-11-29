/**
 * Legendary Hunt Model
 *
 * Tracks player progress and history for legendary animal hunts
 */

import mongoose, { Schema, Document } from 'mongoose';
import { DiscoveryStatus } from '@desperados/shared';

/**
 * Best attempt record
 */
export interface IBestAttempt {
  date: Date;
  damageDone: number;
  healthRemaining: number;
  turnsSurvived: number;
}

/**
 * Legendary hunt record interface
 */
export interface ILegendaryHunt extends Document {
  characterId: mongoose.Types.ObjectId;
  legendaryId: string;
  discoveryStatus: DiscoveryStatus;

  // Discovery progress
  rumorsHeard: string[];               // NPC IDs who told rumors
  cluesFound: string[];                // Clue location IDs discovered
  discoveredAt?: Date;                 // When fully discovered

  // Encounter history
  encounterCount: number;              // Total encounters
  defeatedCount: number;               // Total defeats
  lastEncounteredAt?: Date;
  lastDefeatedAt?: Date;

  // Best attempt tracking
  bestAttempt?: IBestAttempt;

  // Rewards tracking
  rewardsClaimed: boolean;
  trophyObtained: boolean;
  titleUnlocked: boolean;
  permanentBonusApplied: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

const BestAttemptSchema = new Schema<IBestAttempt>(
  {
    date: { type: Date, required: true },
    damageDone: { type: Number, required: true },
    healthRemaining: { type: Number, required: true },
    turnsSurvived: { type: Number, required: true },
  },
  { _id: false }
);

const LegendaryHuntSchema = new Schema<ILegendaryHunt>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true,
    },
    legendaryId: {
      type: String,
      required: true,
      index: true,
    },
    discoveryStatus: {
      type: String,
      enum: Object.values(DiscoveryStatus),
      default: DiscoveryStatus.UNKNOWN,
      required: true,
    },

    // Discovery tracking
    rumorsHeard: {
      type: [String],
      default: [],
    },
    cluesFound: {
      type: [String],
      default: [],
    },
    discoveredAt: {
      type: Date,
    },

    // Encounter history
    encounterCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    defeatedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastEncounteredAt: {
      type: Date,
    },
    lastDefeatedAt: {
      type: Date,
    },

    // Best attempt
    bestAttempt: {
      type: BestAttemptSchema,
    },

    // Rewards
    rewardsClaimed: {
      type: Boolean,
      default: false,
    },
    trophyObtained: {
      type: Boolean,
      default: false,
    },
    titleUnlocked: {
      type: Boolean,
      default: false,
    },
    permanentBonusApplied: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
LegendaryHuntSchema.index({ characterId: 1, legendaryId: 1 }, { unique: true });
LegendaryHuntSchema.index({ characterId: 1, discoveryStatus: 1 });
LegendaryHuntSchema.index({ characterId: 1, defeatedCount: 1 });
LegendaryHuntSchema.index({ legendaryId: 1, defeatedCount: 1 });

// Index for leaderboard queries
LegendaryHuntSchema.index({ legendaryId: 1, defeatedCount: -1, lastDefeatedAt: 1 });

/**
 * Instance methods
 */

// Add rumor heard
LegendaryHuntSchema.methods.addRumor = function(npcId: string): void {
  if (!this.rumorsHeard.includes(npcId)) {
    this.rumorsHeard.push(npcId);
  }
};

// Add clue found
LegendaryHuntSchema.methods.addClue = function(locationId: string): void {
  if (!this.cluesFound.includes(locationId)) {
    this.cluesFound.push(locationId);
  }
};

// Update discovery status
LegendaryHuntSchema.methods.updateDiscoveryStatus = function(status: DiscoveryStatus): void {
  this.discoveryStatus = status;
  if (status === DiscoveryStatus.LOCATED && !this.discoveredAt) {
    this.discoveredAt = new Date();
  }
};

// Record encounter
LegendaryHuntSchema.methods.recordEncounter = function(): void {
  this.encounterCount += 1;
  this.lastEncounteredAt = new Date();
  if (this.discoveryStatus < DiscoveryStatus.ENCOUNTERED) {
    this.discoveryStatus = DiscoveryStatus.ENCOUNTERED;
  }
};

// Record defeat
LegendaryHuntSchema.methods.recordDefeat = function(): void {
  this.defeatedCount += 1;
  this.lastDefeatedAt = new Date();
  this.discoveryStatus = DiscoveryStatus.DEFEATED;
};

// Update best attempt
LegendaryHuntSchema.methods.updateBestAttempt = function(
  damageDone: number,
  healthRemaining: number,
  turnsSurvived: number
): void {
  // Update if better than previous best (more damage or fewer health remaining)
  if (!this.bestAttempt || damageDone > this.bestAttempt.damageDone) {
    this.bestAttempt = {
      date: new Date(),
      damageDone,
      healthRemaining,
      turnsSurvived,
    };
  }
};

// Check if rewards can be claimed
LegendaryHuntSchema.methods.canClaimRewards = function(): boolean {
  return this.defeatedCount > 0 && !this.rewardsClaimed;
};

/**
 * Static methods
 */

// Get or create hunt record
LegendaryHuntSchema.statics.getOrCreate = async function(
  characterId: mongoose.Types.ObjectId,
  legendaryId: string
): Promise<ILegendaryHunt> {
  let hunt = await this.findOne({ characterId, legendaryId });

  if (!hunt) {
    hunt = await this.create({
      characterId,
      legendaryId,
      discoveryStatus: DiscoveryStatus.UNKNOWN,
    });
  }

  return hunt;
};

// Get all hunts for character
LegendaryHuntSchema.statics.getCharacterHunts = async function(
  characterId: mongoose.Types.ObjectId
): Promise<ILegendaryHunt[]> {
  return this.find({ characterId }).sort({ defeatedCount: -1, lastEncounteredAt: -1 });
};

// Get leaderboard for legendary
LegendaryHuntSchema.statics.getLeaderboard = async function(
  legendaryId: string,
  limit: number = 10
): Promise<ILegendaryHunt[]> {
  return this.find({ legendaryId, defeatedCount: { $gt: 0 } })
    .sort({ defeatedCount: -1, lastDefeatedAt: 1 })
    .limit(limit)
    .populate('characterId', 'name level');
};

// Get global legendary statistics
LegendaryHuntSchema.statics.getGlobalStats = async function(
  legendaryId: string
): Promise<{
  totalEncounters: number;
  totalDefeats: number;
  uniqueHunters: number;
  successRate: number;
}> {
  const hunts = await this.find({ legendaryId });

  const totalEncounters = hunts.reduce((sum, hunt) => sum + hunt.encounterCount, 0);
  const totalDefeats = hunts.reduce((sum, hunt) => sum + hunt.defeatedCount, 0);
  const uniqueHunters = hunts.filter(hunt => hunt.defeatedCount > 0).length;
  const successRate = totalEncounters > 0 ? (totalDefeats / totalEncounters) * 100 : 0;

  return {
    totalEncounters,
    totalDefeats,
    uniqueHunters,
    successRate,
  };
};

// Get discovery progress percentage
LegendaryHuntSchema.methods.getDiscoveryProgress = function(): number {
  const rumorsProgress = this.rumorsHeard.length * 20; // 20% per rumor (max 80% for 4 rumors)
  const cluesProgress = this.cluesFound.length * 15; // 15% per clue (max 60% for 4 clues)
  return Math.min(100, rumorsProgress + cluesProgress);
};

export const LegendaryHunt = mongoose.model<ILegendaryHunt>('LegendaryHunt', LegendaryHuntSchema);

export default LegendaryHunt;
