/**
 * Gang Business Model
 *
 * Mongoose schema for gang-owned businesses
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  BusinessCategory,
  BusinessType,
  RiskLevel,
  BusinessStatus,
} from '@desperados/shared';
import { SecureRNG } from '../services/base/SecureRNG';

/**
 * Gang Business document interface
 */
export interface IGangBusiness extends Document {
  gangId: mongoose.Types.ObjectId;
  gangName: string;
  name: string;
  category: BusinessCategory;
  businessType: BusinessType;
  location: string;
  startupCost: number;
  dailyIncome: {
    min: number;
    max: number;
  };
  riskLevel: RiskLevel;
  operatingCost: number;
  status: BusinessStatus;
  purchasedAt: Date;
  lastIncomeDate: Date;
  totalEarnings: number;
  raidCount: number;
  nextRaidCheck?: Date;

  // Methods
  calculateDailyIncome(): number;
  shouldCheckForRaid(): boolean;
  performRaid(): { raided: boolean; fine?: number };
  canGenerateIncome(): boolean;
  getDaysOwned(): number;
  getROI(): number;
}

/**
 * Gang Business schema definition
 */
const GangBusinessSchema = new Schema<IGangBusiness>(
  {
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
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    category: {
      type: String,
      enum: Object.values(BusinessCategory),
      required: true,
    },
    businessType: {
      type: String,
      enum: Object.values(BusinessType),
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    startupCost: {
      type: Number,
      required: true,
      min: 0,
    },
    dailyIncome: {
      min: {
        type: Number,
        required: true,
        min: 0,
      },
      max: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    riskLevel: {
      type: String,
      enum: Object.values(RiskLevel),
      required: true,
    },
    operatingCost: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(BusinessStatus),
      default: BusinessStatus.ACTIVE,
      index: true,
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
    lastIncomeDate: {
      type: Date,
      default: Date.now,
    },
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    raidCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    nextRaidCheck: {
      type: Date,
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
GangBusinessSchema.index({ gangId: 1, status: 1 });
GangBusinessSchema.index({ businessType: 1 });
GangBusinessSchema.index({ category: 1 });
GangBusinessSchema.index({ nextRaidCheck: 1 });
GangBusinessSchema.index({ lastIncomeDate: 1 });

/**
 * Instance method: Calculate daily income (random within range)
 */
GangBusinessSchema.methods.calculateDailyIncome = function (this: IGangBusiness): number {
  const { min, max } = this.dailyIncome;
  const income = SecureRNG.range(min, max);
  return income - this.operatingCost;
};

/**
 * Instance method: Check if raid check should occur
 */
GangBusinessSchema.methods.shouldCheckForRaid = function (this: IGangBusiness): boolean {
  // Only criminal businesses get raided
  if (this.category !== BusinessCategory.CRIMINAL) {
    return false;
  }

  // Not active businesses don't get raided
  if (this.status !== BusinessStatus.ACTIVE) {
    return false;
  }

  // Check if it's time for next raid check
  if (this.nextRaidCheck && new Date() < this.nextRaidCheck) {
    return false;
  }

  return true;
};

/**
 * Instance method: Perform raid check and resolution
 * Returns whether business was raided and any fines
 */
GangBusinessSchema.methods.performRaid = function (this: IGangBusiness): { raided: boolean; fine?: number } {
  if (!this.shouldCheckForRaid()) {
    return { raided: false };
  }

  // Calculate raid probability based on risk level
  const raidChances: Record<RiskLevel, number> = {
    [RiskLevel.SAFE]: 0,
    [RiskLevel.RISKY]: 0.05,
    [RiskLevel.VERY_RISKY]: 0.15,
    [RiskLevel.EXTREMELY_RISKY]: 0.25,
  };

  const raidChance = raidChances[this.riskLevel] || 0;

  if (SecureRNG.chance(raidChance)) {
    // Business was raided
    this.status = BusinessStatus.RAIDED;
    this.raidCount += 1;

    // Calculate fine (1-3x startup cost)
    const fineMultiplier = 1 + SecureRNG.float(0, 1) * 2;
    const fine = Math.floor(this.startupCost * fineMultiplier);

    // Business will be closed for 3-7 days
    const closedDays = SecureRNG.range(3, 7);
    const nextRaidCheck = new Date();
    nextRaidCheck.setDate(nextRaidCheck.getDate() + closedDays);
    this.nextRaidCheck = nextRaidCheck;

    return { raided: true, fine };
  }

  // Not raided, set next check for tomorrow
  const nextCheck = new Date();
  nextCheck.setDate(nextCheck.getDate() + 1);
  this.nextRaidCheck = nextCheck;

  return { raided: false };
};

/**
 * Instance method: Check if business can generate income
 */
GangBusinessSchema.methods.canGenerateIncome = function (this: IGangBusiness): boolean {
  // Only active businesses generate income
  if (this.status !== BusinessStatus.ACTIVE) {
    return false;
  }

  // Check if income was already generated today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastIncome = new Date(this.lastIncomeDate);
  lastIncome.setHours(0, 0, 0, 0);

  return today > lastIncome;
};

/**
 * Instance method: Get days owned
 */
GangBusinessSchema.methods.getDaysOwned = function (this: IGangBusiness): number {
  const now = new Date();
  const purchased = new Date(this.purchasedAt);
  const diffTime = Math.abs(now.getTime() - purchased.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Instance method: Get ROI (Return on Investment) percentage
 */
GangBusinessSchema.methods.getROI = function (this: IGangBusiness): number {
  if (this.startupCost === 0) return 0;
  return Math.floor((this.totalEarnings / this.startupCost) * 100);
};

/**
 * Static method: Find businesses needing income generation
 */
GangBusinessSchema.statics.findBusinessesNeedingIncome = async function (): Promise<IGangBusiness[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return this.find({
    status: BusinessStatus.ACTIVE,
    lastIncomeDate: { $lt: today },
  });
};

/**
 * Static method: Find businesses needing raid checks
 */
GangBusinessSchema.statics.findBusinessesNeedingRaidCheck = async function (): Promise<IGangBusiness[]> {
  const now = new Date();

  return this.find({
    category: BusinessCategory.CRIMINAL,
    status: BusinessStatus.ACTIVE,
    $or: [
      { nextRaidCheck: { $lte: now } },
      { nextRaidCheck: null },
    ],
  });
};

/**
 * Static method: Reopen raided businesses that served their closure time
 */
GangBusinessSchema.statics.reopenRaidedBusinesses = async function (): Promise<number> {
  const now = new Date();

  const result = await this.updateMany(
    {
      status: BusinessStatus.RAIDED,
      nextRaidCheck: { $lte: now },
    },
    {
      $set: { status: BusinessStatus.ACTIVE },
    }
  );

  return result.modifiedCount;
};

/**
 * Gang Business model
 */
export const GangBusiness: Model<IGangBusiness> & {
  findBusinessesNeedingIncome: () => Promise<IGangBusiness[]>;
  findBusinessesNeedingRaidCheck: () => Promise<IGangBusiness[]>;
  reopenRaidedBusinesses: () => Promise<number>;
} = mongoose.model<IGangBusiness>('GangBusiness', GangBusinessSchema) as any;
