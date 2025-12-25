/**
 * IllegalClaim Model
 *
 * Phase 13: Deep Mining System
 *
 * Mongoose schema for illegal/unregistered mining claims with suspicion tracking,
 * gang protection, and inspector history.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  ClaimLegalStatus,
  SuspicionLevel,
  SuspicionEventType,
  ISuspicionChange,
} from '@desperados/shared';

/**
 * Suspicion change subdocument interface
 */
export interface ISuspicionChangeDoc {
  eventType: SuspicionEventType;
  change: number;
  previousLevel: number;
  newLevel: number;
  timestamp: Date;
  context?: Record<string, unknown>;
}

/**
 * Inspection history subdocument interface
 */
export interface IInspectionHistoryEntry {
  inspectorType: 'inspector' | 'marshal';
  result: 'passed' | 'bribed' | 'caught';
  timestamp: Date;
  bribeAmount?: number;
  fineAmount?: number;
}

/**
 * IllegalClaim document interface
 */
export interface IIllegalClaimDoc extends Document {
  _id: mongoose.Types.ObjectId;
  characterId: mongoose.Types.ObjectId;
  locationId: string;
  zoneName: string;

  // Legal status
  legalStatus: ClaimLegalStatus;
  suspicionLevel: number;
  currentAlertLevel: SuspicionLevel;

  // Yield tracking
  totalOreCollected: number;
  totalValueCollected: number;
  lastCollectionAt?: Date;

  // Gang protection
  gangId?: mongoose.Types.ObjectId;
  protectionStartedAt?: Date;
  protectionFeesPaid: number;

  // History
  suspicionHistory: ISuspicionChangeDoc[];
  inspectionHistory: IInspectionHistoryEntry[];

  // Status
  isActive: boolean;
  condemnedAt?: Date;
  condemnedReason?: string;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  getSuspicionLevel(): SuspicionLevel;
  addSuspicion(eventType: SuspicionEventType, amount: number, context?: Record<string, unknown>): void;
  reduceSuspicion(eventType: SuspicionEventType, amount: number, context?: Record<string, unknown>): void;
  hasGangProtection(): boolean;
  canBeInspected(): boolean;
  condemn(reason: string): void;
}

/**
 * Suspicion change subdocument schema
 */
const SuspicionChangeSchema = new Schema<ISuspicionChangeDoc>(
  {
    eventType: {
      type: String,
      enum: Object.values(SuspicionEventType),
      required: true,
    },
    change: {
      type: Number,
      required: true,
    },
    previousLevel: {
      type: Number,
      required: true,
    },
    newLevel: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    context: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

/**
 * Inspection history subdocument schema
 */
const InspectionHistorySchema = new Schema<IInspectionHistoryEntry>(
  {
    inspectorType: {
      type: String,
      enum: ['inspector', 'marshal'],
      required: true,
    },
    result: {
      type: String,
      enum: ['passed', 'bribed', 'caught'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    bribeAmount: {
      type: Number,
      default: null,
    },
    fineAmount: {
      type: Number,
      default: null,
    },
  },
  { _id: false }
);

/**
 * IllegalClaim schema definition
 */
const IllegalClaimSchema = new Schema<IIllegalClaimDoc>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true,
    },
    locationId: {
      type: String,
      required: true,
      index: true,
    },
    zoneName: {
      type: String,
      required: true,
    },

    // Legal status
    legalStatus: {
      type: String,
      enum: Object.values(ClaimLegalStatus),
      default: ClaimLegalStatus.UNREGISTERED,
      index: true,
    },
    suspicionLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      index: true,
    },
    currentAlertLevel: {
      type: String,
      enum: Object.values(SuspicionLevel),
      default: SuspicionLevel.UNKNOWN,
      index: true,
    },

    // Yield tracking
    totalOreCollected: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalValueCollected: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastCollectionAt: {
      type: Date,
      default: null,
    },

    // Gang protection
    gangId: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
      default: null,
      index: true,
    },
    protectionStartedAt: {
      type: Date,
      default: null,
    },
    protectionFeesPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    // History (capped arrays for performance)
    suspicionHistory: {
      type: [SuspicionChangeSchema],
      default: [],
    },
    inspectionHistory: {
      type: [InspectionHistorySchema],
      default: [],
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    condemnedAt: {
      type: Date,
      default: null,
    },
    condemnedReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */

// Compound indexes for common queries
IllegalClaimSchema.index({ characterId: 1, isActive: 1 });
IllegalClaimSchema.index({ characterId: 1, legalStatus: 1 });
IllegalClaimSchema.index({ locationId: 1, isActive: 1 });
IllegalClaimSchema.index({ gangId: 1, isActive: 1 });
IllegalClaimSchema.index({ suspicionLevel: -1, isActive: 1 });
IllegalClaimSchema.index({ currentAlertLevel: 1, isActive: 1 });

// For inspector patrol job
IllegalClaimSchema.index({ isActive: 1, legalStatus: 1, suspicionLevel: 1 });

/**
 * Instance methods
 */

// Calculate current suspicion level enum from numeric value
IllegalClaimSchema.methods.getSuspicionLevel = function (this: IIllegalClaimDoc): SuspicionLevel {
  if (this.suspicionLevel <= 25) return SuspicionLevel.UNKNOWN;
  if (this.suspicionLevel <= 50) return SuspicionLevel.SUSPICIOUS;
  if (this.suspicionLevel <= 75) return SuspicionLevel.ACTIVE_SEARCH;
  return SuspicionLevel.WARRANT_ISSUED;
};

// Add suspicion and record in history
IllegalClaimSchema.methods.addSuspicion = function (
  this: IIllegalClaimDoc,
  eventType: SuspicionEventType,
  amount: number,
  context?: Record<string, unknown>
): void {
  const previousLevel = this.suspicionLevel;

  // Apply gang protection reduction (50%)
  const effectiveAmount = this.hasGangProtection() ? Math.floor(amount * 0.5) : amount;

  this.suspicionLevel = Math.min(100, this.suspicionLevel + effectiveAmount);
  this.currentAlertLevel = this.getSuspicionLevel();

  // Add to history (keep last 50 entries)
  this.suspicionHistory.push({
    eventType,
    change: effectiveAmount,
    previousLevel,
    newLevel: this.suspicionLevel,
    timestamp: new Date(),
    context,
  });

  if (this.suspicionHistory.length > 50) {
    this.suspicionHistory = this.suspicionHistory.slice(-50);
  }

  // Update legal status based on suspicion
  if (this.suspicionLevel > 75 && this.legalStatus !== ClaimLegalStatus.GANG_PROTECTED) {
    this.legalStatus = ClaimLegalStatus.ILLEGAL;
  } else if (this.suspicionLevel > 25 && this.legalStatus === ClaimLegalStatus.UNREGISTERED) {
    // Keep as unregistered but track suspicion
  }
};

// Reduce suspicion and record in history
IllegalClaimSchema.methods.reduceSuspicion = function (
  this: IIllegalClaimDoc,
  eventType: SuspicionEventType,
  amount: number,
  context?: Record<string, unknown>
): void {
  const previousLevel = this.suspicionLevel;
  this.suspicionLevel = Math.max(0, this.suspicionLevel - amount);
  this.currentAlertLevel = this.getSuspicionLevel();

  // Add to history
  this.suspicionHistory.push({
    eventType,
    change: -amount,
    previousLevel,
    newLevel: this.suspicionLevel,
    timestamp: new Date(),
    context,
  });

  if (this.suspicionHistory.length > 50) {
    this.suspicionHistory = this.suspicionHistory.slice(-50);
  }

  // Downgrade legal status if suspicion drops
  if (this.suspicionLevel <= 75 && this.legalStatus === ClaimLegalStatus.ILLEGAL) {
    this.legalStatus = ClaimLegalStatus.UNREGISTERED;
  }
};

// Check if claim has active gang protection
IllegalClaimSchema.methods.hasGangProtection = function (this: IIllegalClaimDoc): boolean {
  return !!(this.gangId && this.legalStatus === ClaimLegalStatus.GANG_PROTECTED);
};

// Check if claim can be inspected (not recently inspected, is active)
IllegalClaimSchema.methods.canBeInspected = function (this: IIllegalClaimDoc): boolean {
  if (!this.isActive) return false;
  if (this.legalStatus === ClaimLegalStatus.CONDEMNED) return false;

  // Check if inspected in last 2 hours
  if (this.inspectionHistory.length > 0) {
    const lastInspection = this.inspectionHistory[this.inspectionHistory.length - 1];
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    if (lastInspection.timestamp > twoHoursAgo) {
      return false;
    }
  }

  return true;
};

// Condemn the claim (seized by authorities)
IllegalClaimSchema.methods.condemn = function (this: IIllegalClaimDoc, reason: string): void {
  this.legalStatus = ClaimLegalStatus.CONDEMNED;
  this.isActive = false;
  this.condemnedAt = new Date();
  this.condemnedReason = reason;
};

/**
 * Static methods interface
 */
interface IIllegalClaimModel extends Model<IIllegalClaimDoc> {
  getActiveClaimsForCharacter(characterId: string): Promise<IIllegalClaimDoc[]>;
  getHighSuspicionClaims(minSuspicion?: number): Promise<IIllegalClaimDoc[]>;
  getClaimsByGang(gangId: string): Promise<IIllegalClaimDoc[]>;
  decayAllSuspicion(amount?: number): Promise<number>;
}

/**
 * Static methods
 */

// Get all active claims for a character
IllegalClaimSchema.statics.getActiveClaimsForCharacter = async function (
  characterId: string
): Promise<IIllegalClaimDoc[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId),
    isActive: true,
  }).sort({ createdAt: -1 });
};

// Get claims with high suspicion (for inspector targeting)
IllegalClaimSchema.statics.getHighSuspicionClaims = async function (
  minSuspicion: number = 26
): Promise<IIllegalClaimDoc[]> {
  return this.find({
    isActive: true,
    legalStatus: { $ne: ClaimLegalStatus.LEGAL },
    suspicionLevel: { $gte: minSuspicion },
  }).sort({ suspicionLevel: -1 });
};

// Get all claims protected by a gang
IllegalClaimSchema.statics.getClaimsByGang = async function (
  gangId: string
): Promise<IIllegalClaimDoc[]> {
  return this.find({
    gangId: new mongoose.Types.ObjectId(gangId),
    isActive: true,
    legalStatus: ClaimLegalStatus.GANG_PROTECTED,
  });
};

// Daily suspicion decay for all inactive claims
IllegalClaimSchema.statics.decayAllSuspicion = async function (
  amount: number = 5
): Promise<number> {
  const claims = await this.find({
    isActive: true,
    suspicionLevel: { $gt: 0 },
    legalStatus: { $ne: ClaimLegalStatus.LEGAL },
  });

  let decayedCount = 0;
  for (const claim of claims) {
    claim.reduceSuspicion(SuspicionEventType.TIME_DECAY, amount, { daily: true });
    await claim.save();
    decayedCount++;
  }

  return decayedCount;
};

/**
 * Export model
 */
export const IllegalClaim: IIllegalClaimModel = mongoose.model<IIllegalClaimDoc, IIllegalClaimModel>(
  'IllegalClaim',
  IllegalClaimSchema
);
