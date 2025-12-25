/**
 * Protection Contract Model
 *
 * Phase 15: Gang Businesses
 *
 * Tracks protection agreements between gangs and individual player businesses.
 * Gangs offer protection to businesses in their territory, providing benefits
 * in exchange for a cut of revenue.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  ProtectionStatus,
  ProtectionTier,
  IProtectionContract as IProtectionContractBase,
} from '@desperados/shared';

/**
 * Protection Contract Document Interface
 */
export interface IProtectionContract extends Document {
  _id: mongoose.Types.ObjectId;

  // Parties
  businessId: mongoose.Types.ObjectId;
  businessName: string;
  businessOwnerId: mongoose.Types.ObjectId;
  businessOwnerName: string;
  gangId: mongoose.Types.ObjectId;
  gangName: string;

  // Terms
  tier: ProtectionTier;
  protectionFeePercent: number;
  weeklyMinimum: number;
  status: ProtectionStatus;

  // Benefits
  incidentReduction: number;
  raidProtection: boolean;
  reputationBoost: number;

  // Timing
  startedAt: Date;
  renewsAt: Date;
  terminatedAt?: Date;
  terminatedBy?: 'business' | 'gang' | 'war_loss';

  // Tracking
  totalPaid: number;
  weeksActive: number;
  lastPaymentAt?: Date;
  missedPayments: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Protection Contract Model Interface
 */
export interface IProtectionContractModel extends Model<IProtectionContract> {
  findActiveByBusiness(businessId: mongoose.Types.ObjectId): Promise<IProtectionContract | null>;
  findActiveByGang(gangId: mongoose.Types.ObjectId): Promise<IProtectionContract[]>;
  findPendingOffers(businessOwnerId: mongoose.Types.ObjectId): Promise<IProtectionContract[]>;
  findDueForPayment(date: Date): Promise<IProtectionContract[]>;
}

/**
 * Protection Contract Schema
 */
const ProtectionContractSchema = new Schema<IProtectionContract>(
  {
    // Parties
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    businessOwnerId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true,
    },
    businessOwnerName: {
      type: String,
      required: true,
    },
    gangId: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
      required: true,
      index: true,
    },
    gangName: {
      type: String,
      required: true,
    },

    // Terms
    tier: {
      type: String,
      enum: Object.values(ProtectionTier),
      required: true,
    },
    protectionFeePercent: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },
    weeklyMinimum: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(ProtectionStatus),
      default: ProtectionStatus.OFFERED,
      index: true,
    },

    // Benefits
    incidentReduction: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    raidProtection: {
      type: Boolean,
      default: false,
    },
    reputationBoost: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    // Timing
    startedAt: {
      type: Date,
      default: Date.now,
    },
    renewsAt: {
      type: Date,
      required: true,
      index: true,
    },
    terminatedAt: {
      type: Date,
    },
    terminatedBy: {
      type: String,
      enum: ['business', 'gang', 'war_loss'],
    },

    // Tracking
    totalPaid: {
      type: Number,
      default: 0,
    },
    weeksActive: {
      type: Number,
      default: 0,
    },
    lastPaymentAt: {
      type: Date,
    },
    missedPayments: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
// Find active contract for a business (should be unique per active status)
ProtectionContractSchema.index(
  { businessId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['offered', 'active'] } } }
);

// Find all active contracts for a gang
ProtectionContractSchema.index({ gangId: 1, status: 1 });

// Find contracts due for renewal
ProtectionContractSchema.index({ status: 1, renewsAt: 1 });

// Find pending offers for business owner
ProtectionContractSchema.index({ businessOwnerId: 1, status: 1 });

/**
 * Static: Find active protection contract for a business
 */
ProtectionContractSchema.statics.findActiveByBusiness = async function (
  businessId: mongoose.Types.ObjectId
): Promise<IProtectionContract | null> {
  return this.findOne({
    businessId,
    status: { $in: [ProtectionStatus.ACTIVE, ProtectionStatus.OFFERED] },
  });
};

/**
 * Static: Find all active contracts for a gang
 */
ProtectionContractSchema.statics.findActiveByGang = async function (
  gangId: mongoose.Types.ObjectId
): Promise<IProtectionContract[]> {
  return this.find({
    gangId,
    status: ProtectionStatus.ACTIVE,
  }).sort({ createdAt: -1 });
};

/**
 * Static: Find pending offers for a business owner
 */
ProtectionContractSchema.statics.findPendingOffers = async function (
  businessOwnerId: mongoose.Types.ObjectId
): Promise<IProtectionContract[]> {
  return this.find({
    businessOwnerId,
    status: ProtectionStatus.OFFERED,
  }).sort({ createdAt: -1 });
};

/**
 * Static: Find contracts due for payment
 */
ProtectionContractSchema.statics.findDueForPayment = async function (
  date: Date
): Promise<IProtectionContract[]> {
  return this.find({
    status: ProtectionStatus.ACTIVE,
    renewsAt: { $lte: date },
  });
};

/**
 * Export the model
 */
export const ProtectionContract = mongoose.model<IProtectionContract, IProtectionContractModel>(
  'ProtectionContract',
  ProtectionContractSchema
);
