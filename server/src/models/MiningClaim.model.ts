/**
 * Mining Claim Model
 * Tracks player-owned mining claims and their yield
 *
 * Sprint 7: Mid-Game Content - Mining Claims (L25 unlock)
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export type MiningClaimStatus = 'active' | 'contested' | 'abandoned' | 'exhausted';

export interface IMiningClaim extends Document {
  // Core identification
  characterId: mongoose.Types.ObjectId;
  claimId: string;                      // Reference to miningClaims.ts
  locationId: string;                   // Region/area

  // Claim details
  tier: 1 | 2 | 3 | 4 | 5;
  status: MiningClaimStatus;

  // Timing
  stakedAt: Date;
  lastCollectedAt: Date;
  expiresAt?: Date;                     // If contested and lost

  // Yield tracking
  accumulatedYield: Record<string, number>; // Resources accumulated since last collection
  totalYield: number;                   // Total gold value collected ever
  totalCollections: number;

  // Condition tracking (Phase 14: Decay System)
  condition: number;                    // 0-100, default 100
  lastRehabilitatedAt?: Date;           // Last time condition was restored
  collectionsToday: number;             // Track for overwork penalty
  lastCollectionCountReset: Date;       // When daily collection count was reset
  lastMaintenanceAt?: Date;             // Last maintenance action

  // Upgrades
  upgrades: string[];                   // Applied upgrades
  upgradeLevel: number;                 // 0-5 upgrade progression

  // Contest state
  contested: boolean;
  contestedBy?: mongoose.Types.ObjectId;
  contestStartedAt?: Date;

  // Investment tracking
  totalInvested: number;                // Gold spent on stake + upgrades

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Instance methods (Phase 14)
  applyDecay(amount: number): void;
  rehabilitate(amount: number): void;
  recordCollection(): void;
  shouldResetCollectionCount(): boolean;
  resetCollectionCount(): void;
  isOverworked(): boolean;
  getConditionTier(): string;
  getYieldMultiplier(): number;
}

export interface IMiningClaimModel extends Model<IMiningClaim> {
  findByCharacter(characterId: string): Promise<IMiningClaim[]>;
  findActiveByCharacter(characterId: string): Promise<IMiningClaim[]>;
  countClaimsAtLocation(claimId: string): Promise<number>;
}

const MiningClaimSchema = new Schema<IMiningClaim>({
  characterId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    index: true
  },
  claimId: {
    type: String,
    required: true
  },
  locationId: {
    type: String,
    required: true
  },
  tier: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    required: true,
    default: 1
  },
  status: {
    type: String,
    enum: ['active', 'contested', 'abandoned', 'exhausted'],
    default: 'active'
  },
  stakedAt: {
    type: Date,
    default: Date.now
  },
  lastCollectedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  accumulatedYield: {
    type: Map,
    of: Number,
    default: {}
  },
  totalYield: {
    type: Number,
    default: 0
  },
  totalCollections: {
    type: Number,
    default: 0
  },
  upgrades: {
    type: [String],
    default: []
  },
  upgradeLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  contested: {
    type: Boolean,
    default: false
  },
  contestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Character'
  },
  contestStartedAt: {
    type: Date
  },
  totalInvested: {
    type: Number,
    default: 0
  },

  // Condition tracking (Phase 14: Decay System)
  condition: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  lastRehabilitatedAt: {
    type: Date
  },
  collectionsToday: {
    type: Number,
    default: 0
  },
  lastCollectionCountReset: {
    type: Date,
    default: Date.now
  },
  lastMaintenanceAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
MiningClaimSchema.index({ characterId: 1, status: 1 });
MiningClaimSchema.index({ claimId: 1, status: 1 });
MiningClaimSchema.index({ contested: 1, contestStartedAt: 1 });
MiningClaimSchema.index({ lastCollectedAt: 1 }); // For yield calculation jobs

// Static methods
MiningClaimSchema.statics.findByCharacter = async function(
  characterId: string
): Promise<IMiningClaim[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId)
  }).sort({ stakedAt: -1 });
};

MiningClaimSchema.statics.findActiveByCharacter = async function(
  characterId: string
): Promise<IMiningClaim[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId),
    status: 'active'
  }).sort({ tier: -1 });
};

MiningClaimSchema.statics.countClaimsAtLocation = async function(
  claimId: string
): Promise<number> {
  return this.countDocuments({
    claimId,
    status: { $in: ['active', 'contested'] }
  });
};

// ============================================================================
// INSTANCE METHODS (Phase 14: Decay System)
// ============================================================================

/**
 * Apply decay to claim condition
 */
MiningClaimSchema.methods.applyDecay = function(this: IMiningClaim, amount: number): void {
  this.condition = Math.max(0, this.condition - amount);

  // Update status based on condition
  if (this.condition <= 5) {
    this.status = 'exhausted';
  }
};

/**
 * Rehabilitate claim condition
 */
MiningClaimSchema.methods.rehabilitate = function(this: IMiningClaim, amount: number): void {
  this.condition = Math.min(100, this.condition + amount);
  this.lastRehabilitatedAt = new Date();

  // Restore status if it was exhausted
  if (this.status === 'exhausted' && this.condition > 5) {
    this.status = 'active';
  }
};

/**
 * Record a collection action (for overwork tracking)
 */
MiningClaimSchema.methods.recordCollection = function(this: IMiningClaim): void {
  // Check if we need to reset the daily count
  if (this.shouldResetCollectionCount()) {
    this.resetCollectionCount();
  }

  this.collectionsToday += 1;
  this.lastCollectedAt = new Date();
  this.totalCollections += 1;
};

/**
 * Check if collection count should be reset (new day)
 */
MiningClaimSchema.methods.shouldResetCollectionCount = function(this: IMiningClaim): boolean {
  if (!this.lastCollectionCountReset) return true;

  const now = new Date();
  const lastReset = new Date(this.lastCollectionCountReset);

  // Reset if it's a different day (UTC)
  return now.toDateString() !== lastReset.toDateString();
};

/**
 * Reset the daily collection count
 */
MiningClaimSchema.methods.resetCollectionCount = function(this: IMiningClaim): void {
  this.collectionsToday = 0;
  this.lastCollectionCountReset = new Date();
};

/**
 * Check if claim is being overworked (exceeds daily collection threshold)
 */
MiningClaimSchema.methods.isOverworked = function(this: IMiningClaim): boolean {
  // Import threshold from constants - using inline value for model
  const OVERWORK_THRESHOLD = 5;
  return this.collectionsToday >= OVERWORK_THRESHOLD;
};

/**
 * Get condition tier label
 */
MiningClaimSchema.methods.getConditionTier = function(this: IMiningClaim): string {
  if (this.condition >= 90) return 'excellent';
  if (this.condition >= 70) return 'good';
  if (this.condition >= 50) return 'fair';
  if (this.condition >= 30) return 'poor';
  return 'degraded';
};

/**
 * Get yield multiplier based on condition
 */
MiningClaimSchema.methods.getYieldMultiplier = function(this: IMiningClaim): number {
  const YIELD_REDUCTION_THRESHOLD = 80;

  if (this.condition >= YIELD_REDUCTION_THRESHOLD) {
    return 1.0; // Full yield above threshold
  }

  // Linear reduction below threshold
  return this.condition / YIELD_REDUCTION_THRESHOLD;
};

// Add index for condition-based queries
MiningClaimSchema.index({ condition: 1, status: 1 });

export const MiningClaim = mongoose.model<IMiningClaim, IMiningClaimModel>('MiningClaim', MiningClaimSchema);
