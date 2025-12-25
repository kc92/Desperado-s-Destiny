/**
 * NPC Business Model
 *
 * Phase 14.3: Risk Simulation - Competition System
 *
 * Represents NPC-owned businesses that compete with player businesses
 * for customer traffic within zones.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  INPCBusiness,
  NPCBusinessPersonality,
  NPCBusinessStatus,
  BusinessTypeCategory,
} from '@desperados/shared';

/**
 * Mongoose document interface extending INPCBusiness
 */
export interface INPCBusinessDocument extends Omit<INPCBusiness, '_id'>, Document {
  // Instance methods
  updateStatus(): NPCBusinessStatus;
  adjustPrice(newModifier: number): void;
  adjustQuality(newQuality: number): void;
  recordWeeklyRevenue(revenue: number): void;
  close(): void;
}

/**
 * Static methods interface
 */
export interface INPCBusinessModel extends Model<INPCBusinessDocument> {
  findByZone(zoneId: string): Promise<INPCBusinessDocument[]>;
  findByZoneAndType(zoneId: string, businessType: BusinessTypeCategory): Promise<INPCBusinessDocument[]>;
  findActiveByZone(zoneId: string): Promise<INPCBusinessDocument[]>;
  countByZoneAndType(zoneId: string, businessType: BusinessTypeCategory): Promise<number>;
  findCompetitorsForBusiness(businessId: string): Promise<INPCBusinessDocument[]>;
  findProtectedByGang(gangId: string): Promise<INPCBusinessDocument[]>;
}

/**
 * NPC Business Schema
 */
const NPCBusinessSchema = new Schema<INPCBusinessDocument>(
  {
    // Identity
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    businessType: {
      type: String,
      enum: Object.values(BusinessTypeCategory),
      required: true,
      index: true,
    },

    // Location
    zoneId: {
      type: String,
      required: true,
      index: true,
    },
    locationId: {
      type: String,
      required: true,
    },

    // Status
    status: {
      type: String,
      enum: Object.values(NPCBusinessStatus),
      default: NPCBusinessStatus.STABLE,
      index: true,
    },
    personality: {
      type: String,
      enum: Object.values(NPCBusinessPersonality),
      default: NPCBusinessPersonality.BALANCED,
    },

    // Economic attributes
    baseQuality: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    currentQuality: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    priceModifier: {
      type: Number,
      min: 0.5,
      max: 1.5,
      default: 1.0,
    },
    reputation: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },

    // Financial tracking
    weeklyRevenue: {
      type: Number,
      default: 0,
    },
    averageRevenue: {
      type: Number,
      default: 0,
    },
    consecutiveLossWeeks: {
      type: Number,
      default: 0,
    },
    consecutiveGainWeeks: {
      type: Number,
      default: 0,
    },

    // Competition behavior
    aggressiveness: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    resilience: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    expansionTendency: {
      type: Number,
      min: 0,
      max: 100,
      default: 30,
    },

    // Protection
    gangProtected: {
      type: Boolean,
      default: false,
    },
    protectingGangId: {
      type: String,  // Stored as string ID
    },
    protectionFee: {
      type: Number,
      default: 0,
    },

    // Competition tracking
    lastPriceChangeAt: Date,
    lastQualityChangeAt: Date,
    competingWithPlayerBusinesses: [{
      type: String,  // Business IDs as strings
    }],

    // Timing
    establishedAt: {
      type: Date,
      default: Date.now,
    },
    closedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
NPCBusinessSchema.index({ zoneId: 1, businessType: 1 });
NPCBusinessSchema.index({ zoneId: 1, status: 1 });
NPCBusinessSchema.index({ status: 1, consecutiveLossWeeks: -1 });
NPCBusinessSchema.index({ protectingGangId: 1 });

/**
 * Update business status based on revenue trends
 */
NPCBusinessSchema.methods.updateStatus = function (): NPCBusinessStatus {
  const revenueFactor = this.averageRevenue > 0
    ? this.weeklyRevenue / this.averageRevenue
    : 1;

  if (this.status === NPCBusinessStatus.CLOSED) {
    return NPCBusinessStatus.CLOSED;
  }

  if (revenueFactor >= 1.3 && this.consecutiveGainWeeks >= 3) {
    this.status = NPCBusinessStatus.THRIVING;
  } else if (revenueFactor >= 0.7 && revenueFactor <= 1.3) {
    this.status = NPCBusinessStatus.STABLE;
  } else if (revenueFactor < 0.7 && this.consecutiveLossWeeks >= 2) {
    this.status = NPCBusinessStatus.STRUGGLING;
  }

  if (revenueFactor < 0.3 && this.consecutiveLossWeeks >= 4) {
    this.status = NPCBusinessStatus.CLOSING;
  }

  return this.status;
};

/**
 * Adjust price modifier within bounds
 */
NPCBusinessSchema.methods.adjustPrice = function (newModifier: number): void {
  this.priceModifier = Math.max(0.7, Math.min(1.3, newModifier));
  this.lastPriceChangeAt = new Date();
};

/**
 * Adjust quality within bounds
 */
NPCBusinessSchema.methods.adjustQuality = function (newQuality: number): void {
  this.currentQuality = Math.max(1, Math.min(10, Math.round(newQuality)));
  this.lastQualityChangeAt = new Date();
};

/**
 * Record weekly revenue and update tracking
 */
NPCBusinessSchema.methods.recordWeeklyRevenue = function (revenue: number): void {
  const previousRevenue = this.weeklyRevenue;

  // Update weekly revenue
  this.weeklyRevenue = revenue;

  // Update rolling average (weighted: 70% old, 30% new)
  if (this.averageRevenue === 0) {
    this.averageRevenue = revenue;
  } else {
    this.averageRevenue = (this.averageRevenue * 0.7) + (revenue * 0.3);
  }

  // Update consecutive week counters
  if (revenue > previousRevenue) {
    this.consecutiveGainWeeks++;
    this.consecutiveLossWeeks = 0;
  } else if (revenue < previousRevenue) {
    this.consecutiveLossWeeks++;
    this.consecutiveGainWeeks = 0;
  }

  // Update status
  this.updateStatus();
};

/**
 * Close the business
 */
NPCBusinessSchema.methods.close = function (): void {
  this.status = NPCBusinessStatus.CLOSED;
  this.closedAt = new Date();
};

/**
 * Find all NPC businesses in a zone
 */
NPCBusinessSchema.statics.findByZone = function (
  zoneId: string
): Promise<INPCBusinessDocument[]> {
  return this.find({ zoneId }).exec();
};

/**
 * Find NPC businesses by zone and type
 */
NPCBusinessSchema.statics.findByZoneAndType = function (
  zoneId: string,
  businessType: BusinessTypeCategory
): Promise<INPCBusinessDocument[]> {
  return this.find({ zoneId, businessType }).exec();
};

/**
 * Find active (non-closed) NPC businesses in a zone
 */
NPCBusinessSchema.statics.findActiveByZone = function (
  zoneId: string
): Promise<INPCBusinessDocument[]> {
  return this.find({
    zoneId,
    status: { $ne: NPCBusinessStatus.CLOSED },
  }).exec();
};

/**
 * Count NPC businesses by zone and type
 */
NPCBusinessSchema.statics.countByZoneAndType = function (
  zoneId: string,
  businessType: BusinessTypeCategory
): Promise<number> {
  return this.countDocuments({
    zoneId,
    businessType,
    status: { $ne: NPCBusinessStatus.CLOSED },
  }).exec();
};

/**
 * Find competitors for a specific business (same zone and type)
 */
NPCBusinessSchema.statics.findCompetitorsForBusiness = async function (
  businessId: string
): Promise<INPCBusinessDocument[]> {
  const business = await this.findById(businessId);
  if (!business) return [];

  return this.find({
    _id: { $ne: businessId },
    zoneId: business.zoneId,
    businessType: business.businessType,
    status: { $ne: NPCBusinessStatus.CLOSED },
  }).exec();
};

/**
 * Find all businesses protected by a specific gang
 */
NPCBusinessSchema.statics.findProtectedByGang = function (
  gangId: string
): Promise<INPCBusinessDocument[]> {
  return this.find({
    gangProtected: true,
    protectingGangId: gangId,
    status: { $ne: NPCBusinessStatus.CLOSED },
  }).exec();
};

export const NPCBusiness = mongoose.model<INPCBusinessDocument, INPCBusinessModel>(
  'NPCBusiness',
  NPCBusinessSchema
);
