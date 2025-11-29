/**
 * Tax Delinquency Model
 *
 * Mongoose schema for tracking overdue property taxes and consequences
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  DelinquencyStage,
  BankruptcyStatus,
  DELINQUENCY_CONFIG,
  TAX_CONSTANTS,
} from '@desperados/shared';

/**
 * Tax Delinquency document interface
 */
export interface ITaxDelinquency extends Document {
  propertyId: mongoose.Types.ObjectId;
  taxRecordId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  ownerType: 'gang' | 'character';
  ownerName: string;
  propertyType: string;
  location: string;
  originalDebtAmount: number;
  currentDebtAmount: number;
  penaltyAmount: number;
  daysOverdue: number;
  delinquencyStage: DelinquencyStage;
  firstMissedPayment: Date;
  lastWarningDate?: Date;
  warningsSent: number;
  productionReduced: boolean;
  workersLeft: boolean;
  propertyLocked: boolean;
  auctionScheduled: boolean;
  auctionId?: mongoose.Types.ObjectId;
  bankruptcyStatus: BankruptcyStatus;
  bankruptcyFiledDate?: Date;
  bankruptcyEndsDate?: Date;
  bankruptcyUsedInLast30Days: boolean;
  reputationPenalty: number;
  isResolved: boolean;
  resolvedDate?: Date;
  resolutionMethod?: 'payment' | 'bankruptcy' | 'foreclosure' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  updateDelinquencyStage(): DelinquencyStage;
  calculatePenalty(): number;
  applyPenalty(): void;
  applyStageConsequences(): void;
  updateDaysOverdue(): number;
  sendWarning(): void;
  applyProductionReduction(): void;
  removeWorkers(): void;
  lockProperty(): void;
  scheduleAuction(): void;
  declareBankruptcy(): void;
  resolveBankruptcy(success: boolean): void;
  processPayment(amount: number): boolean;
  markForeclosed(): void;
  calculateReputationImpact(): number;
  canDeclareBankruptcy(): boolean;
  toSafeObject(): Record<string, unknown>;
}

/**
 * Tax Delinquency model interface
 */
export interface ITaxDelinquencyModel extends Model<ITaxDelinquency> {
  findByPropertyId(propertyId: string | mongoose.Types.ObjectId): Promise<ITaxDelinquency | null>;
  findByOwnerId(ownerId: string | mongoose.Types.ObjectId): Promise<ITaxDelinquency[]>;
  findByStage(stage: DelinquencyStage): Promise<ITaxDelinquency[]>;
  findActiveDelinquencies(): Promise<ITaxDelinquency[]>;
  findReadyForAuction(): Promise<ITaxDelinquency[]>;
  createDelinquency(
    taxRecordId: mongoose.Types.ObjectId,
    propertyId: mongoose.Types.ObjectId,
    ownerId: mongoose.Types.ObjectId,
    ownerType: 'gang' | 'character',
    ownerName: string,
    propertyType: string,
    location: string,
    debtAmount: number
  ): Promise<ITaxDelinquency>;
}

/**
 * Tax Delinquency schema definition
 */
const TaxDelinquencySchema = new Schema<ITaxDelinquency>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    taxRecordId: {
      type: Schema.Types.ObjectId,
      ref: 'PropertyTax',
      required: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    ownerType: {
      type: String,
      enum: ['gang', 'character'],
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
    },
    propertyType: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    originalDebtAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentDebtAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    penaltyAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    daysOverdue: {
      type: Number,
      default: 0,
      min: 0,
    },
    delinquencyStage: {
      type: String,
      enum: Object.values(DelinquencyStage),
      default: DelinquencyStage.GRACE_PERIOD,
      index: true,
    },
    firstMissedPayment: {
      type: Date,
      required: true,
      default: Date.now,
    },
    lastWarningDate: {
      type: Date,
    },
    warningsSent: {
      type: Number,
      default: 0,
      min: 0,
    },
    productionReduced: {
      type: Boolean,
      default: false,
    },
    workersLeft: {
      type: Boolean,
      default: false,
    },
    propertyLocked: {
      type: Boolean,
      default: false,
    },
    auctionScheduled: {
      type: Boolean,
      default: false,
    },
    auctionId: {
      type: Schema.Types.ObjectId,
      ref: 'PropertyAuction',
    },
    bankruptcyStatus: {
      type: String,
      enum: Object.values(BankruptcyStatus),
      default: BankruptcyStatus.NONE,
    },
    bankruptcyFiledDate: {
      type: Date,
    },
    bankruptcyEndsDate: {
      type: Date,
    },
    bankruptcyUsedInLast30Days: {
      type: Boolean,
      default: false,
    },
    reputationPenalty: {
      type: Number,
      default: 0,
      max: 0, // Always negative or zero
    },
    isResolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    resolvedDate: {
      type: Date,
    },
    resolutionMethod: {
      type: String,
      enum: ['payment', 'bankruptcy', 'foreclosure', 'cancelled'],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
TaxDelinquencySchema.index({ propertyId: 1, isResolved: 1 });
TaxDelinquencySchema.index({ ownerId: 1, isResolved: 1 });
TaxDelinquencySchema.index({ delinquencyStage: 1, isResolved: 1 });
TaxDelinquencySchema.index({ daysOverdue: -1 });
TaxDelinquencySchema.index({ bankruptcyStatus: 1 });

/**
 * Instance method: Update delinquency stage based on days overdue
 */
TaxDelinquencySchema.methods.updateDelinquencyStage = function (
  this: ITaxDelinquency
): DelinquencyStage {
  const days = this.updateDaysOverdue();

  let newStage = DelinquencyStage.GRACE_PERIOD;

  if (days >= TAX_CONSTANTS.FORECLOSURE_DAYS) {
    newStage = DelinquencyStage.FORECLOSURE;
  } else if (days >= TAX_CONSTANTS.DELINQUENT_DAYS) {
    newStage = DelinquencyStage.DELINQUENT;
  } else if (days >= TAX_CONSTANTS.LATE_PAYMENT_DAYS) {
    newStage = DelinquencyStage.LATE_PAYMENT;
  } else {
    newStage = DelinquencyStage.GRACE_PERIOD;
  }

  // Don't downgrade if already foreclosed
  if (this.delinquencyStage === DelinquencyStage.FORECLOSURE) {
    return this.delinquencyStage;
  }

  const oldStage = this.delinquencyStage;
  this.delinquencyStage = newStage;

  // Apply consequences when stage changes
  if (oldStage !== newStage) {
    this.applyStageConsequences();
  }

  return newStage;
};

/**
 * Helper: Apply consequences based on stage
 */
TaxDelinquencySchema.methods.applyStageConsequences = function (
  this: ITaxDelinquency,
  stage: DelinquencyStage
): void {
  const config = DELINQUENCY_CONFIG[stage];

  switch (stage) {
    case DelinquencyStage.GRACE_PERIOD:
      // Send warning
      this.sendWarning();
      break;

    case DelinquencyStage.LATE_PAYMENT:
      // Reduce production, workers may leave
      this.applyProductionReduction();
      this.removeWorkers();
      this.sendWarning();
      break;

    case DelinquencyStage.DELINQUENT:
      // Halt production, lock property, schedule auction
      this.applyProductionReduction();
      this.removeWorkers();
      this.lockProperty();
      this.scheduleAuction();
      this.sendWarning();
      break;

    case DelinquencyStage.FORECLOSURE:
      // Property seized
      this.markForeclosed();
      break;
  }

  // Apply weekly reputation penalty
  const weeksOverdue = Math.floor(this.daysOverdue / 7);
  this.reputationPenalty = Math.min(
    0,
    weeksOverdue * TAX_CONSTANTS.REPUTATION_PENALTY_PER_WEEK
  );
};

/**
 * Instance method: Calculate penalty based on stage
 */
TaxDelinquencySchema.methods.calculatePenalty = function (this: ITaxDelinquency): number {
  const config = DELINQUENCY_CONFIG[this.delinquencyStage];
  const penalty = Math.floor(this.originalDebtAmount * (config.penaltyPercent / 100));
  return penalty;
};

/**
 * Instance method: Apply penalty to current debt
 */
TaxDelinquencySchema.methods.applyPenalty = function (this: ITaxDelinquency): void {
  const penalty = this.calculatePenalty();
  this.penaltyAmount = penalty;
  this.currentDebtAmount = this.originalDebtAmount + penalty;
};

/**
 * Instance method: Update days overdue
 */
TaxDelinquencySchema.methods.updateDaysOverdue = function (this: ITaxDelinquency): number {
  const now = new Date();
  const diffMs = now.getTime() - this.firstMissedPayment.getTime();
  this.daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return this.daysOverdue;
};

/**
 * Instance method: Send warning notification
 */
TaxDelinquencySchema.methods.sendWarning = function (this: ITaxDelinquency): void {
  this.warningsSent += 1;
  this.lastWarningDate = new Date();
  // TODO: Create notification via NotificationService
};

/**
 * Instance method: Apply production reduction
 */
TaxDelinquencySchema.methods.applyProductionReduction = function (this: ITaxDelinquency): void {
  this.productionReduced = true;
  // TODO: Update property production multiplier
};

/**
 * Instance method: Remove workers
 */
TaxDelinquencySchema.methods.removeWorkers = function (this: ITaxDelinquency): void {
  this.workersLeft = true;
  // TODO: Update property worker count
};

/**
 * Instance method: Lock property
 */
TaxDelinquencySchema.methods.lockProperty = function (this: ITaxDelinquency): void {
  this.propertyLocked = true;
  // TODO: Set property access restrictions
};

/**
 * Instance method: Schedule auction
 */
TaxDelinquencySchema.methods.scheduleAuction = function (this: ITaxDelinquency): void {
  if (!this.auctionScheduled) {
    this.auctionScheduled = true;
    // Auction will be created by foreclosure service
  }
};

/**
 * Instance method: Declare bankruptcy
 */
TaxDelinquencySchema.methods.declareBankruptcy = function (this: ITaxDelinquency): void {
  if (!this.canDeclareBankruptcy()) {
    throw new Error('Cannot declare bankruptcy at this time');
  }

  this.bankruptcyStatus = BankruptcyStatus.ACTIVE;
  this.bankruptcyFiledDate = new Date();

  // Set bankruptcy end date (14 days)
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + TAX_CONSTANTS.BANKRUPTCY_FREEZE_DAYS);
  this.bankruptcyEndsDate = endDate;

  this.bankruptcyUsedInLast30Days = true;

  // Apply reputation penalty
  this.reputationPenalty += TAX_CONSTANTS.BANKRUPTCY_REPUTATION_PENALTY;

  // Freeze collection actions
  this.propertyLocked = true;
  this.productionReduced = true;
};

/**
 * Instance method: Resolve bankruptcy
 */
TaxDelinquencySchema.methods.resolveBankruptcy = function (
  this: ITaxDelinquency,
  success: boolean
): void {
  if (success) {
    this.bankruptcyStatus = BankruptcyStatus.RESOLVED;
    this.isResolved = true;
    this.resolvedDate = new Date();
    this.resolutionMethod = 'bankruptcy';
  } else {
    this.bankruptcyStatus = BankruptcyStatus.FAILED;
    // Proceed to forced sale
    this.delinquencyStage = DelinquencyStage.FORECLOSURE;
    this.scheduleAuction();
  }
};

/**
 * Instance method: Process payment towards debt
 */
TaxDelinquencySchema.methods.processPayment = function (
  this: ITaxDelinquency,
  amount: number
): boolean {
  if (amount <= 0) {
    return false;
  }

  this.currentDebtAmount = Math.max(0, this.currentDebtAmount - amount);

  // If fully paid, resolve delinquency
  if (this.currentDebtAmount === 0) {
    this.isResolved = true;
    this.resolvedDate = new Date();
    this.resolutionMethod = 'payment';

    // Unlock property
    this.propertyLocked = false;
    this.productionReduced = false;

    return true;
  }

  return false;
};

/**
 * Instance method: Mark as foreclosed
 */
TaxDelinquencySchema.methods.markForeclosed = function (this: ITaxDelinquency): void {
  this.delinquencyStage = DelinquencyStage.FORECLOSURE;
  this.propertyLocked = true;
  this.productionReduced = true;
  this.workersLeft = true;

  // Apply severe reputation penalty
  this.reputationPenalty += TAX_CONSTANTS.FORECLOSURE_REPUTATION_PENALTY;

  // Schedule auction if not already done
  if (!this.auctionScheduled) {
    this.scheduleAuction();
  }
};

/**
 * Instance method: Calculate reputation impact
 */
TaxDelinquencySchema.methods.calculateReputationImpact = function (this: ITaxDelinquency): number {
  return this.reputationPenalty;
};

/**
 * Instance method: Check if can declare bankruptcy
 */
TaxDelinquencySchema.methods.canDeclareBankruptcy = function (this: ITaxDelinquency): boolean {
  // Already in bankruptcy
  if (this.bankruptcyStatus === BankruptcyStatus.ACTIVE) {
    return false;
  }

  // Already foreclosed
  if (this.delinquencyStage === DelinquencyStage.FORECLOSURE) {
    return false;
  }

  // Used bankruptcy in last 30 days
  if (this.bankruptcyUsedInLast30Days) {
    return false;
  }

  // Must be at least in late payment stage
  if (this.delinquencyStage === DelinquencyStage.GRACE_PERIOD) {
    return false;
  }

  return true;
};

/**
 * Instance method: Convert to safe object
 */
TaxDelinquencySchema.methods.toSafeObject = function (
  this: ITaxDelinquency
): Record<string, unknown> {
  return {
    id: this._id.toString(),
    propertyId: this.propertyId.toString(),
    taxRecordId: this.taxRecordId.toString(),
    ownerId: this.ownerId.toString(),
    ownerType: this.ownerType,
    ownerName: this.ownerName,
    propertyType: this.propertyType,
    location: this.location,
    originalDebtAmount: this.originalDebtAmount,
    currentDebtAmount: this.currentDebtAmount,
    penaltyAmount: this.penaltyAmount,
    daysOverdue: this.daysOverdue,
    delinquencyStage: this.delinquencyStage,
    firstMissedPayment: this.firstMissedPayment,
    warningsSent: this.warningsSent,
    productionReduced: this.productionReduced,
    workersLeft: this.workersLeft,
    propertyLocked: this.propertyLocked,
    auctionScheduled: this.auctionScheduled,
    auctionId: this.auctionId?.toString(),
    bankruptcyStatus: this.bankruptcyStatus,
    bankruptcyEndsDate: this.bankruptcyEndsDate,
    reputationPenalty: this.reputationPenalty,
    isResolved: this.isResolved,
    resolutionMethod: this.resolutionMethod,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

/**
 * Static method: Find delinquency by property ID
 */
TaxDelinquencySchema.statics.findByPropertyId = async function (
  propertyId: string | mongoose.Types.ObjectId
): Promise<ITaxDelinquency | null> {
  const id = typeof propertyId === 'string' ? new mongoose.Types.ObjectId(propertyId) : propertyId;
  return this.findOne({ propertyId: id, isResolved: false }).sort({ createdAt: -1 });
};

/**
 * Static method: Find all delinquencies for an owner
 */
TaxDelinquencySchema.statics.findByOwnerId = async function (
  ownerId: string | mongoose.Types.ObjectId
): Promise<ITaxDelinquency[]> {
  const id = typeof ownerId === 'string' ? new mongoose.Types.ObjectId(ownerId) : ownerId;
  return this.find({ ownerId: id, isResolved: false }).sort({ daysOverdue: -1 });
};

/**
 * Static method: Find delinquencies by stage
 */
TaxDelinquencySchema.statics.findByStage = async function (
  stage: DelinquencyStage
): Promise<ITaxDelinquency[]> {
  return this.find({ delinquencyStage: stage, isResolved: false }).sort({ daysOverdue: -1 });
};

/**
 * Static method: Find all active delinquencies
 */
TaxDelinquencySchema.statics.findActiveDelinquencies = async function (): Promise<
  ITaxDelinquency[]
> {
  return this.find({ isResolved: false }).sort({ daysOverdue: -1 });
};

/**
 * Static method: Find delinquencies ready for auction
 */
TaxDelinquencySchema.statics.findReadyForAuction = async function (): Promise<ITaxDelinquency[]> {
  return this.find({
    delinquencyStage: DelinquencyStage.DELINQUENT,
    auctionScheduled: false,
    isResolved: false,
  });
};

/**
 * Static method: Create delinquency record
 */
TaxDelinquencySchema.statics.createDelinquency = async function (
  taxRecordId: mongoose.Types.ObjectId,
  propertyId: mongoose.Types.ObjectId,
  ownerId: mongoose.Types.ObjectId,
  ownerType: 'gang' | 'character',
  ownerName: string,
  propertyType: string,
  location: string,
  debtAmount: number
): Promise<ITaxDelinquency> {
  const delinquency = new this({
    taxRecordId,
    propertyId,
    ownerId,
    ownerType,
    ownerName,
    propertyType,
    location,
    originalDebtAmount: debtAmount,
    currentDebtAmount: debtAmount,
    penaltyAmount: 0,
    daysOverdue: 0,
    delinquencyStage: DelinquencyStage.GRACE_PERIOD,
    firstMissedPayment: new Date(),
    warningsSent: 0,
    isResolved: false,
  });

  await delinquency.save();
  return delinquency;
};

/**
 * Pre-save hook: Update penalties and stage
 */
TaxDelinquencySchema.pre('save', function (next) {
  // Recalculate penalty if stage changed
  if (this.isModified('delinquencyStage') || this.isModified('daysOverdue')) {
    this.applyPenalty();
  }

  next();
});

/**
 * Tax Delinquency model
 */
export const TaxDelinquency = mongoose.model<ITaxDelinquency, ITaxDelinquencyModel>(
  'TaxDelinquency',
  TaxDelinquencySchema
);
