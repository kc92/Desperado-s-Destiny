/**
 * Gang Economy Model
 *
 * Mongoose schema for gang economy system with bank accounts, payroll, and financial tracking
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  GangBankAccountType,
  GangBankAccounts,
  PayrollEntry,
  GangPayroll,
  FinancialReport,
  PAYROLL_CONSTANTS,
} from '@desperados/shared';

/**
 * Gang Economy document interface
 */
export interface IGangEconomy extends Document {
  gangId: mongoose.Types.ObjectId;
  gangName: string;
  bank: GangBankAccounts;
  payroll: GangPayroll;
  weeklyReport?: FinancialReport;
  totalAssets: number;
  liquidAssets: number;
  debtOwed: number;
  creditRating: number;
  lastUpdated: Date;

  // Methods
  getTotalBalance(): number;
  canAfford(accountType: GangBankAccountType, amount: number): boolean;
  deductFromAccount(accountType: GangBankAccountType, amount: number): void;
  addToAccount(accountType: GangBankAccountType, amount: number): void;
  transferBetweenAccounts(from: GangBankAccountType, to: GangBankAccountType, amount: number): void;
  calculateTotalAssets(): Promise<number>;
  updateTotalBalance(): void;
}

/**
 * Payroll Entry Schema
 */
const PayrollEntrySchema = new Schema<PayrollEntry>(
  {
    memberId: { type: String, required: true },
    memberName: { type: String, required: true },
    role: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    bonuses: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

/**
 * Gang Payroll Schema
 */
const GangPayrollSchema = new Schema<GangPayroll>(
  {
    weeklyWages: {
      type: [PayrollEntrySchema],
      default: [],
    },
    officerBonuses: {
      type: [PayrollEntrySchema],
      default: [],
    },
    totalWeekly: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastPaid: {
      type: Date,
      default: null,
    },
    nextPayday: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

/**
 * Financial Report Schema
 */
const FinancialReportSchema = new Schema<FinancialReport>(
  {
    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },
    income: {
      businessIncome: { type: Number, default: 0 },
      investmentReturns: { type: Number, default: 0 },
      heistPayouts: { type: Number, default: 0 },
      memberDeposits: { type: Number, default: 0 },
      territoryIncome: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    expenses: {
      payroll: { type: Number, default: 0 },
      businessCosts: { type: Number, default: 0 },
      heistCosts: { type: Number, default: 0 },
      tribute: { type: Number, default: 0 },
      protection: { type: Number, default: 0 },
      bribes: { type: Number, default: 0 },
      upgrades: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    netIncome: { type: Number, default: 0 },
    topEarningBusiness: {
      businessId: String,
      businessName: String,
      earnings: Number,
    },
    topContributor: {
      memberId: String,
      memberName: String,
      contribution: Number,
    },
  },
  { _id: false }
);

/**
 * Gang Bank Accounts Schema
 */
const GangBankAccountsSchema = new Schema<GangBankAccounts>(
  {
    operatingFund: {
      type: Number,
      default: 0,
      min: 0,
    },
    warChest: {
      type: Number,
      default: 0,
      min: 0,
    },
    investmentFund: {
      type: Number,
      default: 0,
      min: 0,
    },
    emergencyReserve: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

/**
 * Gang Economy schema definition
 */
const GangEconomySchema = new Schema<IGangEconomy>(
  {
    gangId: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
      required: true,
      unique: true,
      index: true,
    },
    gangName: {
      type: String,
      required: true,
    },
    bank: {
      type: GangBankAccountsSchema,
      required: true,
      default: () => ({
        operatingFund: 0,
        warChest: 0,
        investmentFund: 0,
        emergencyReserve: 0,
        totalBalance: 0,
      }),
    },
    payroll: {
      type: GangPayrollSchema,
      required: true,
      default: () => {
        const nextPayday = new Date();
        nextPayday.setDate(nextPayday.getDate() + ((7 + PAYROLL_CONSTANTS.PAYROLL_DAY - nextPayday.getDay()) % 7 || 7));
        nextPayday.setHours(0, 0, 0, 0);
        return {
          weeklyWages: [],
          officerBonuses: [],
          totalWeekly: 0,
          lastPaid: null,
          nextPayday,
        };
      },
    },
    weeklyReport: {
      type: FinancialReportSchema,
      default: null,
    },
    totalAssets: {
      type: Number,
      default: 0,
      min: 0,
    },
    liquidAssets: {
      type: Number,
      default: 0,
      min: 0,
    },
    debtOwed: {
      type: Number,
      default: 0,
      min: 0,
    },
    creditRating: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes
 */
GangEconomySchema.index({ gangId: 1 }, { unique: true });
GangEconomySchema.index({ creditRating: -1 });
GangEconomySchema.index({ totalAssets: -1 });

/**
 * Instance method: Get total balance across all accounts
 */
GangEconomySchema.methods.getTotalBalance = function (this: IGangEconomy): number {
  return (
    this.bank.operatingFund +
    this.bank.warChest +
    this.bank.investmentFund +
    this.bank.emergencyReserve
  );
};

/**
 * Instance method: Check if account can afford amount
 */
GangEconomySchema.methods.canAfford = function (
  this: IGangEconomy,
  accountType: GangBankAccountType,
  amount: number
): boolean {
  return this.bank[accountType] >= amount;
};

/**
 * Instance method: Deduct from specific account
 */
GangEconomySchema.methods.deductFromAccount = function (
  this: IGangEconomy,
  accountType: GangBankAccountType,
  amount: number
): void {
  if (!this.canAfford(accountType, amount)) {
    throw new Error(`Insufficient funds in ${accountType}. Have ${this.bank[accountType]}, need ${amount}`);
  }
  this.bank[accountType] -= amount;
  this.updateTotalBalance();
};

/**
 * Instance method: Add to specific account
 */
GangEconomySchema.methods.addToAccount = function (
  this: IGangEconomy,
  accountType: GangBankAccountType,
  amount: number
): void {
  this.bank[accountType] += amount;
  this.updateTotalBalance();
};

/**
 * Instance method: Transfer between accounts
 */
GangEconomySchema.methods.transferBetweenAccounts = function (
  this: IGangEconomy,
  from: GangBankAccountType,
  to: GangBankAccountType,
  amount: number
): void {
  if (from === to) {
    throw new Error('Cannot transfer to the same account');
  }

  // Special restriction: Emergency Reserve can only be touched by leader
  if (from === GangBankAccountType.EMERGENCY_RESERVE) {
    throw new Error('Emergency Reserve transfers must be approved by leader separately');
  }

  this.deductFromAccount(from, amount);
  this.addToAccount(to, amount);
};

/**
 * Instance method: Calculate total assets (including businesses and investments)
 */
GangEconomySchema.methods.calculateTotalAssets = async function (this: IGangEconomy): Promise<number> {
  const GangBusiness = mongoose.model('GangBusiness');
  const GangInvestment = mongoose.model('GangInvestment');

  const businesses = await GangBusiness.find({ gangId: this.gangId, status: 'active' });
  const investments = await GangInvestment.find({ gangId: this.gangId, status: 'active' });

  const businessValue = businesses.reduce((sum: number, b: any) => sum + b.startupCost, 0);
  const investmentValue = investments.reduce((sum: number, inv: any) => sum + inv.investmentAmount, 0);

  const totalAssets = this.getTotalBalance() + businessValue + investmentValue;
  this.totalAssets = totalAssets;
  this.liquidAssets = this.getTotalBalance();

  return totalAssets;
};

/**
 * Instance method: Update total balance
 */
GangEconomySchema.methods.updateTotalBalance = function (this: IGangEconomy): void {
  this.bank.totalBalance = this.getTotalBalance();
  this.lastUpdated = new Date();
};

/**
 * Pre-save hook: Update total balance
 */
GangEconomySchema.pre('save', function (next) {
  this.updateTotalBalance();
  next();
});

/**
 * Gang Economy model
 */
export const GangEconomy: Model<IGangEconomy> = mongoose.model<IGangEconomy>(
  'GangEconomy',
  GangEconomySchema
);
