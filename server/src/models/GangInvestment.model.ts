/**
 * Gang Investment Model
 *
 * Mongoose schema for gang investments
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  InvestmentType,
  InvestmentStatus,
  RiskLevel,
} from '@desperados/shared';

/**
 * Gang Investment document interface
 */
export interface IGangInvestment extends Document {
  gangId: mongoose.Types.ObjectId;
  type: InvestmentType;
  name: string;
  description: string;
  investmentAmount: number;
  expectedReturn: number;
  actualReturn?: number;
  status: InvestmentStatus;
  purchasedAt: Date;
  maturityDate: Date;
  completedAt?: Date;
  riskLevel: RiskLevel;

  // Methods
  isMatured(): boolean;
  canCashOut(): boolean;
  calculateActualReturn(): number;
  getDaysUntilMaturity(): number;
  getExpectedROI(): number;
  getActualROI(): number | null;
}

/**
 * Gang Investment schema definition
 */
const GangInvestmentSchema = new Schema<IGangInvestment>(
  {
    gangId: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(InvestmentType),
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    investmentAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    expectedReturn: {
      type: Number,
      required: true,
      min: 0,
    },
    actualReturn: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(InvestmentStatus),
      default: InvestmentStatus.ACTIVE,
      index: true,
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
    maturityDate: {
      type: Date,
      required: true,
      index: true,
    },
    completedAt: {
      type: Date,
    },
    riskLevel: {
      type: String,
      enum: Object.values(RiskLevel),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
GangInvestmentSchema.index({ gangId: 1, status: 1 });
GangInvestmentSchema.index({ maturityDate: 1, status: 1 });
GangInvestmentSchema.index({ type: 1 });

/**
 * Instance method: Check if investment has matured
 */
GangInvestmentSchema.methods.isMatured = function (this: IGangInvestment): boolean {
  return new Date() >= this.maturityDate;
};

/**
 * Instance method: Check if investment can be cashed out
 */
GangInvestmentSchema.methods.canCashOut = function (this: IGangInvestment): boolean {
  return this.status === InvestmentStatus.ACTIVE && this.isMatured();
};

/**
 * Instance method: Calculate actual return based on risk and random factors
 */
GangInvestmentSchema.methods.calculateActualReturn = function (this: IGangInvestment): number {
  if (this.actualReturn !== undefined) {
    return this.actualReturn;
  }

  // Base return is expected return
  let returnAmount = this.expectedReturn;

  // Risk affects variance
  const riskVariance: Record<RiskLevel, { min: number; max: number }> = {
    [RiskLevel.SAFE]: { min: 0.9, max: 1.1 }, // 90-110% of expected
    [RiskLevel.RISKY]: { min: 0.7, max: 1.3 }, // 70-130% of expected
    [RiskLevel.VERY_RISKY]: { min: 0.4, max: 1.6 }, // 40-160% of expected
    [RiskLevel.EXTREMELY_RISKY]: { min: 0, max: 2.0 }, // 0-200% of expected
  };

  const variance = riskVariance[this.riskLevel] || riskVariance[RiskLevel.SAFE];
  const multiplier = variance.min + Math.random() * (variance.max - variance.min);
  returnAmount = Math.floor(returnAmount * multiplier);

  // Chance of complete failure for risky investments
  const failureChances: Record<RiskLevel, number> = {
    [RiskLevel.SAFE]: 0,
    [RiskLevel.RISKY]: 0.05,
    [RiskLevel.VERY_RISKY]: 0.15,
    [RiskLevel.EXTREMELY_RISKY]: 0.30,
  };

  const failureChance = failureChances[this.riskLevel] || 0;
  if (Math.random() < failureChance) {
    this.status = InvestmentStatus.FAILED;
    return 0;
  }

  this.actualReturn = returnAmount;
  return returnAmount;
};

/**
 * Instance method: Get days until maturity
 */
GangInvestmentSchema.methods.getDaysUntilMaturity = function (this: IGangInvestment): number {
  const now = new Date();
  const maturity = new Date(this.maturityDate);
  const diffTime = maturity.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

/**
 * Instance method: Get expected ROI percentage
 */
GangInvestmentSchema.methods.getExpectedROI = function (this: IGangInvestment): number {
  if (this.investmentAmount === 0) return 0;
  return Math.floor(((this.expectedReturn - this.investmentAmount) / this.investmentAmount) * 100);
};

/**
 * Instance method: Get actual ROI percentage (null if not completed)
 */
GangInvestmentSchema.methods.getActualROI = function (this: IGangInvestment): number | null {
  if (this.actualReturn === undefined) return null;
  if (this.investmentAmount === 0) return 0;
  return Math.floor(((this.actualReturn - this.investmentAmount) / this.investmentAmount) * 100);
};

/**
 * Static method: Find matured investments needing processing
 */
GangInvestmentSchema.statics.findMaturedInvestments = async function (): Promise<IGangInvestment[]> {
  const now = new Date();
  return this.find({
    status: InvestmentStatus.ACTIVE,
    maturityDate: { $lte: now },
  });
};

/**
 * Static method: Get gang's active investments
 */
GangInvestmentSchema.statics.findGangInvestments = async function (
  gangId: string,
  status?: InvestmentStatus
): Promise<IGangInvestment[]> {
  const query: any = { gangId: new mongoose.Types.ObjectId(gangId) };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ purchasedAt: -1 });
};

/**
 * Gang Investment model
 */
export const GangInvestment: Model<IGangInvestment> & {
  findMaturedInvestments: () => Promise<IGangInvestment[]>;
  findGangInvestments: (gangId: string, status?: InvestmentStatus) => Promise<IGangInvestment[]>;
} = mongoose.model<IGangInvestment>('GangInvestment', GangInvestmentSchema) as any;
