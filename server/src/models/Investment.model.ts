import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export enum InvestmentType {
  TREASURY_BOND = 'treasury_bond',     // 2-4% guaranteed return
  RAILROAD_SHARE = 'railroad_share',   // 5-10% variable return
  MINING_SHARE = 'mining_share',       // 0-20% high risk/reward
}

export enum InvestmentStatus {
  ACTIVE = 'active',
  MATURED = 'matured',
  CASHED_OUT = 'cashed_out',
  DEFAULTED = 'defaulted', // Mining shares can default
}

export interface IInvestment extends Document {
  characterId: ObjectId;
  type: InvestmentType;
  status: InvestmentStatus;

  // Investment details
  principalAmount: number;       // Initial investment
  currentValue: number;          // Current calculated value
  returnRate: number;            // Actual return rate (calculated at maturity)

  // Timing
  investedAt: Date;
  maturityDate: Date;            // When investment matures
  cashedOutAt?: Date;

  // Risk factors (for variable investments)
  riskLevel: 'low' | 'medium' | 'high';
  linkedEntityId?: string;       // Railroad/Mine this is linked to
  linkedEntityName?: string;

  // Early withdrawal penalty
  earlyWithdrawalPenalty: number; // Percentage penalty for early cashout
}

const InvestmentSchema = new Schema<IInvestment>({
  characterId: { type: Schema.Types.ObjectId, ref: 'Character', required: true, index: true },
  type: { type: String, enum: Object.values(InvestmentType), required: true },
  status: { type: String, enum: Object.values(InvestmentStatus), default: InvestmentStatus.ACTIVE },

  principalAmount: { type: Number, required: true },
  currentValue: { type: Number, required: true },
  returnRate: { type: Number, default: 0 },

  investedAt: { type: Date, default: Date.now },
  maturityDate: { type: Date, required: true },
  cashedOutAt: Date,

  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  linkedEntityId: String,
  linkedEntityName: String,

  earlyWithdrawalPenalty: { type: Number, default: 0.1 }, // 10% default
}, { timestamps: true });

InvestmentSchema.index({ characterId: 1, status: 1 });
InvestmentSchema.index({ maturityDate: 1, status: 1 });

export const Investment = mongoose.model<IInvestment>('Investment', InvestmentSchema);
