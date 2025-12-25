/**
 * Resource Vein Model
 *
 * Phase 14.3: Risk Simulation - Competition System
 *
 * Represents resource veins that mining claims can extract from.
 * Tracks depletion, competition between claims, and regeneration.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  IResourceVein,
  ResourceVeinStatus,
  ScarcityResourceType,
} from '@desperados/shared';
import {
  getVeinStatus,
  getCompetitionYieldPenalty,
  VEIN_STATUS_MULTIPLIERS,
  REGENERATION_RATES,
} from '@desperados/shared';

/**
 * Mongoose document interface extending IResourceVein
 */
export interface IResourceVeinDocument extends Omit<IResourceVein, '_id'>, Document {
  // Instance methods
  updateStatus(): ResourceVeinStatus;
  recordExtraction(amount: number): void;
  addClaim(claimId: string): void;
  removeClaim(claimId: string): void;
  regenerate(): number;
  calculateYieldMultiplier(): number;
  isExhausted(): boolean;
}

/**
 * Static methods interface
 */
export interface IResourceVeinModel extends Model<IResourceVeinDocument> {
  findByZone(zoneId: string): Promise<IResourceVeinDocument[]>;
  findByResourceType(resourceType: ScarcityResourceType): Promise<IResourceVeinDocument[]>;
  findActiveByZone(zoneId: string): Promise<IResourceVeinDocument[]>;
  findForClaim(claimId: string): Promise<IResourceVeinDocument | null>;
  findRenewable(): Promise<IResourceVeinDocument[]>;
  countClaimsOnVein(veinId: string): Promise<number>;
}

/**
 * Resource Vein Schema
 */
const ResourceVeinSchema = new Schema<IResourceVeinDocument>(
  {
    // Identity
    name: {
      type: String,
      required: true,
      trim: true,
    },
    resourceType: {
      type: String,
      enum: Object.values(ScarcityResourceType),
      required: true,
      index: true,
    },

    // Location
    zoneId: {
      type: String,
      required: true,
      index: true,
    },
    coordinates: {
      x: { type: Number },
      y: { type: Number },
    },

    // Yield tracking
    status: {
      type: String,
      enum: Object.values(ResourceVeinStatus),
      default: ResourceVeinStatus.ABUNDANT,
      index: true,
    },
    baseYield: {
      type: Number,
      required: true,
      min: 1,
    },
    currentYieldMultiplier: {
      type: Number,
      min: 0,
      max: 1,
      default: 1.0,
    },

    // Depletion tracking
    totalCapacity: {
      type: Number,
      required: true,
      min: 1,
    },
    extractedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingPercent: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },

    // Competition
    claimCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    claimIds: [{
      type: Schema.Types.ObjectId,
      ref: 'MiningClaim',
    }],
    competitionPenalty: {
      type: Number,
      default: 0,
      min: 0,
      max: 0.6,
    },

    // Regeneration
    isRenewable: {
      type: Boolean,
      default: false,
    },
    regenerationRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastRegenerationAt: Date,

    // Timing
    discoveredAt: {
      type: Date,
      default: Date.now,
    },
    exhaustedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
ResourceVeinSchema.index({ zoneId: 1, resourceType: 1 });
ResourceVeinSchema.index({ status: 1 });
ResourceVeinSchema.index({ isRenewable: 1, lastRegenerationAt: 1 });
ResourceVeinSchema.index({ claimIds: 1 });

/**
 * Pre-save middleware to update calculated fields
 */
ResourceVeinSchema.pre('save', function (next) {
  // Calculate remaining percent
  const remaining = this.totalCapacity - this.extractedAmount;
  this.remainingPercent = Math.max(0, Math.min(100, (remaining / this.totalCapacity) * 100));

  // Update status based on remaining
  this.updateStatus();

  // Calculate competition penalty
  this.competitionPenalty = 1 - getCompetitionYieldPenalty(this.claimCount);

  // Update yield multiplier
  this.currentYieldMultiplier = this.calculateYieldMultiplier();

  next();
});

/**
 * Update vein status based on remaining percentage
 */
ResourceVeinSchema.methods.updateStatus = function (): ResourceVeinStatus {
  const previousStatus = this.status;
  this.status = getVeinStatus(this.remainingPercent);

  // Mark exhausted timestamp
  if (this.status === ResourceVeinStatus.EXHAUSTED && previousStatus !== ResourceVeinStatus.EXHAUSTED) {
    this.exhaustedAt = new Date();
  }

  return this.status;
};

/**
 * Record an extraction from this vein
 */
ResourceVeinSchema.methods.recordExtraction = function (amount: number): void {
  this.extractedAmount = Math.min(this.totalCapacity, this.extractedAmount + amount);
};

/**
 * Add a claim to this vein
 */
ResourceVeinSchema.methods.addClaim = function (claimId: string): void {
  const objectId = new mongoose.Types.ObjectId(claimId);
  if (!this.claimIds.some((id: mongoose.Types.ObjectId) => id.equals(objectId))) {
    this.claimIds.push(objectId);
    this.claimCount = this.claimIds.length;
  }
};

/**
 * Remove a claim from this vein
 */
ResourceVeinSchema.methods.removeClaim = function (claimId: string): void {
  const objectId = new mongoose.Types.ObjectId(claimId);
  this.claimIds = this.claimIds.filter((id: mongoose.Types.ObjectId) => !id.equals(objectId));
  this.claimCount = this.claimIds.length;
};

/**
 * Regenerate resources (for renewable veins)
 * Returns amount regenerated
 */
ResourceVeinSchema.methods.regenerate = function (): number {
  if (!this.isRenewable || this.regenerationRate <= 0) {
    return 0;
  }

  // Calculate time since last regeneration
  const now = new Date();
  const lastRegen = this.lastRegenerationAt || this.discoveredAt;
  const hoursSinceRegen = (now.getTime() - lastRegen.getTime()) / (1000 * 60 * 60);

  // Calculate regeneration (rate is per day, so divide by 24)
  const regenAmount = Math.floor((this.regenerationRate / 24) * hoursSinceRegen);

  if (regenAmount > 0) {
    // Reduce extracted amount (effectively regenerating)
    this.extractedAmount = Math.max(0, this.extractedAmount - regenAmount);
    this.lastRegenerationAt = now;
  }

  return regenAmount;
};

/**
 * Calculate the current yield multiplier
 */
ResourceVeinSchema.methods.calculateYieldMultiplier = function (): number {
  const statusMultiplier = VEIN_STATUS_MULTIPLIERS[this.status] ?? 1.0;
  const competitionMultiplier = getCompetitionYieldPenalty(this.claimCount);

  return statusMultiplier * competitionMultiplier;
};

/**
 * Check if vein is exhausted
 */
ResourceVeinSchema.methods.isExhausted = function (): boolean {
  return this.status === ResourceVeinStatus.EXHAUSTED;
};

/**
 * Find all veins in a zone
 */
ResourceVeinSchema.statics.findByZone = function (
  zoneId: string
): Promise<IResourceVeinDocument[]> {
  return this.find({ zoneId }).exec();
};

/**
 * Find veins by resource type
 */
ResourceVeinSchema.statics.findByResourceType = function (
  resourceType: ScarcityResourceType
): Promise<IResourceVeinDocument[]> {
  return this.find({ resourceType }).exec();
};

/**
 * Find active (non-exhausted) veins in a zone
 */
ResourceVeinSchema.statics.findActiveByZone = function (
  zoneId: string
): Promise<IResourceVeinDocument[]> {
  return this.find({
    zoneId,
    status: { $ne: ResourceVeinStatus.EXHAUSTED },
  }).exec();
};

/**
 * Find the vein a specific claim is on
 */
ResourceVeinSchema.statics.findForClaim = function (
  claimId: string
): Promise<IResourceVeinDocument | null> {
  return this.findOne({
    claimIds: new mongoose.Types.ObjectId(claimId),
  }).exec();
};

/**
 * Find all renewable veins (for regeneration job)
 */
ResourceVeinSchema.statics.findRenewable = function (): Promise<IResourceVeinDocument[]> {
  return this.find({
    isRenewable: true,
    regenerationRate: { $gt: 0 },
  }).exec();
};

/**
 * Count claims on a specific vein
 */
ResourceVeinSchema.statics.countClaimsOnVein = async function (
  veinId: string
): Promise<number> {
  const vein = await this.findById(veinId);
  return vein?.claimCount ?? 0;
};

export const ResourceVein = mongoose.model<IResourceVeinDocument, IResourceVeinModel>(
  'ResourceVein',
  ResourceVeinSchema
);
