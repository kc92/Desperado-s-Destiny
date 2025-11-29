/**
 * Property Loan Model
 *
 * Mongoose schema for tracking property loans and payments
 * Phase 8, Wave 8.1 - Property Ownership System
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Property loan document interface
 */
export interface IPropertyLoan extends Document {
  _id: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  characterId: mongoose.Types.ObjectId;
  originalAmount: number;
  remainingBalance: number;
  interestRate: number;
  monthlyPayment: number;
  nextPaymentDue: Date;
  missedPayments: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  calculatePayment(amount?: number): number;
  makePayment(amount: number): boolean;
  missPayment(): void;
  payoffLoan(): void;
  isOverdue(): boolean;
  getDaysOverdue(): number;
  calculatePenalty(): number;
}

/**
 * Property loan static methods interface
 */
export interface IPropertyLoanModel extends Model<IPropertyLoan> {
  findByCharacter(characterId: string): Promise<IPropertyLoan[]>;
  findByProperty(propertyId: string): Promise<IPropertyLoan | null>;
  findOverdueLoans(): Promise<IPropertyLoan[]>;
  createLoan(
    propertyId: string,
    characterId: string,
    loanAmount: number,
    interestRate: number
  ): Promise<IPropertyLoan>;
}

/**
 * Property loan schema definition
 */
const PropertyLoanSchema = new Schema<IPropertyLoan>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
      unique: true, // One loan per property
    },
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true,
    },
    originalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    remainingBalance: {
      type: Number,
      required: true,
      min: 0,
    },
    interestRate: {
      type: Number,
      required: true,
      min: 5,
      max: 15,
    },
    monthlyPayment: {
      type: Number,
      required: true,
      min: 0,
    },
    nextPaymentDue: {
      type: Date,
      required: true,
      index: true,
    },
    missedPayments: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
PropertyLoanSchema.index({ characterId: 1, isActive: 1 });
PropertyLoanSchema.index({ nextPaymentDue: 1, isActive: 1 }); // For payment reminder jobs
PropertyLoanSchema.index({ missedPayments: 1, isActive: 1 }); // For foreclosure checks

/**
 * Instance method: Calculate payment amount with interest
 */
PropertyLoanSchema.methods.calculatePayment = function (this: IPropertyLoan, amount?: number): number {
  if (amount) {
    return amount;
  }
  return this.monthlyPayment;
};

/**
 * Instance method: Make a loan payment
 */
PropertyLoanSchema.methods.makePayment = function (this: IPropertyLoan, amount: number): boolean {
  if (amount > this.remainingBalance) {
    // Overpayment - just pay off the loan
    this.remainingBalance = 0;
    this.isActive = false;
    return true;
  }

  this.remainingBalance -= amount;

  if (this.remainingBalance === 0) {
    this.isActive = false;
    return true;
  }

  // Reset missed payments counter on successful payment
  this.missedPayments = 0;

  // Set next payment due date (7 days from now - weekly payments)
  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + 7);
  this.nextPaymentDue = nextDue;

  return true;
};

/**
 * Instance method: Record a missed payment
 */
PropertyLoanSchema.methods.missPayment = function (this: IPropertyLoan): void {
  this.missedPayments += 1;

  // Set next payment due date to next week
  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + 7);
  this.nextPaymentDue = nextDue;
};

/**
 * Instance method: Pay off entire loan
 */
PropertyLoanSchema.methods.payoffLoan = function (this: IPropertyLoan): void {
  this.remainingBalance = 0;
  this.isActive = false;
};

/**
 * Instance method: Check if loan is overdue
 */
PropertyLoanSchema.methods.isOverdue = function (this: IPropertyLoan): boolean {
  if (!this.isActive) {
    return false;
  }
  return new Date() > this.nextPaymentDue;
};

/**
 * Instance method: Get days overdue
 */
PropertyLoanSchema.methods.getDaysOverdue = function (this: IPropertyLoan): number {
  if (!this.isOverdue()) {
    return 0;
  }

  const now = new Date();
  const overdueDays = Math.floor((now.getTime() - this.nextPaymentDue.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, overdueDays);
};

/**
 * Instance method: Calculate penalty for missed payment
 */
PropertyLoanSchema.methods.calculatePenalty = function (this: IPropertyLoan): number {
  const BASE_PENALTY = 50; // 50 gold per missed payment
  return this.missedPayments * BASE_PENALTY;
};

/**
 * Static method: Find all loans for a character
 */
PropertyLoanSchema.statics.findByCharacter = async function (characterId: string): Promise<IPropertyLoan[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId),
    isActive: true,
  }).sort({ nextPaymentDue: 1 });
};

/**
 * Static method: Find loan for a specific property
 */
PropertyLoanSchema.statics.findByProperty = async function (propertyId: string): Promise<IPropertyLoan | null> {
  return this.findOne({
    propertyId: new mongoose.Types.ObjectId(propertyId),
    isActive: true,
  });
};

/**
 * Static method: Find all overdue loans
 */
PropertyLoanSchema.statics.findOverdueLoans = async function (): Promise<IPropertyLoan[]> {
  return this.find({
    isActive: true,
    nextPaymentDue: { $lt: new Date() },
  }).populate('propertyId characterId');
};

/**
 * Static method: Create a new loan
 */
PropertyLoanSchema.statics.createLoan = async function (
  propertyId: string,
  characterId: string,
  loanAmount: number,
  interestRate: number
): Promise<IPropertyLoan> {
  // Calculate monthly payment (simple calculation for weekly payments)
  // Total amount with interest = loanAmount * (1 + interestRate/100)
  const totalAmount = loanAmount * (1 + interestRate / 100);

  // Assuming 52 weeks = 1 year, divide by 52 for weekly payments
  const weeklyPayment = Math.ceil(totalAmount / 52);

  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + 7); // First payment due in 7 days

  const loan = new this({
    propertyId: new mongoose.Types.ObjectId(propertyId),
    characterId: new mongoose.Types.ObjectId(characterId),
    originalAmount: loanAmount,
    remainingBalance: totalAmount,
    interestRate,
    monthlyPayment: weeklyPayment,
    nextPaymentDue: nextDue,
    missedPayments: 0,
    isActive: true,
  });

  return loan.save();
};

/**
 * Property loan model
 */
export const PropertyLoan = mongoose.model<IPropertyLoan, IPropertyLoanModel>(
  'PropertyLoan',
  PropertyLoanSchema
);
