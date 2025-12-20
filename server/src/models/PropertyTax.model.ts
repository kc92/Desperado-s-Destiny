/**
 * Property Tax Model
 *
 * Mongoose schema for property tax records in Desperados Destiny
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  PropertySize,
  TaxType,
  SpecialTaxType,
  TaxPaymentStatus,
  TaxCalculation,
  TAX_CONSTANTS,
  PROPERTY_SIZE_TAX_CONFIG,
} from '@desperados/shared';

/**
 * Property Tax document interface
 */
export interface IPropertyTax extends Document {
  propertyId: mongoose.Types.ObjectId;
  propertyType: 'gang_base' | 'business' | 'ranch' | 'mine' | 'other';
  ownerId: mongoose.Types.ObjectId;
  ownerType: 'gang' | 'character';
  ownerName: string;
  propertySize: PropertySize;
  propertyValue: number;
  propertyTier: number;
  weeklyIncome: number;
  condition: number; // 0-100, affects upkeep
  workerCount: number;
  workerLevel: number; // Average worker level
  taxCalculation: TaxCalculation;
  paymentStatus: TaxPaymentStatus;
  dueDate: Date;
  paidDate?: Date;
  amountPaid?: number;
  autoPayEnabled: boolean;
  specialTaxType: SpecialTaxType;
  location: string;
  insuranceEnabled: boolean;
  lastCalculated: Date;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  calculatePropertyTax(): number;
  calculateIncomeTax(): number;
  calculateUpkeepCosts(): number;
  calculateSpecialTax(): number;
  calculateTotalTax(): TaxCalculation;
  applyTierMultiplier(baseTax: number): number;
  processPayment(amount: number, paymentMethod: 'manual' | 'auto'): void;
  isDueForCollection(): boolean;
  isOverdue(): boolean;
  getDaysOverdue(): number;
  canAutoPayFrom(balance: number): boolean;
  toSafeObject(): Record<string, unknown>;
}

/**
 * Options for model methods that support transactions
 */
export interface PropertyTaxTransactionOptions {
  session?: mongoose.ClientSession;
}

/**
 * Property Tax model interface
 */
export interface IPropertyTaxModel extends Model<IPropertyTax> {
  findByPropertyId(propertyId: string | mongoose.Types.ObjectId): Promise<IPropertyTax | null>;
  findByOwnerId(ownerId: string | mongoose.Types.ObjectId): Promise<IPropertyTax[]>;
  findDueForCollection(): Promise<IPropertyTax[]>;
  findOverdueTaxes(): Promise<IPropertyTax[]>;
  findByStatus(status: TaxPaymentStatus): Promise<IPropertyTax[]>;
  createTaxRecord(
    propertyId: mongoose.Types.ObjectId,
    propertyType: string,
    ownerId: mongoose.Types.ObjectId,
    ownerType: 'gang' | 'character',
    ownerName: string,
    propertyData: any,
    options?: PropertyTaxTransactionOptions
  ): Promise<IPropertyTax>;
}

/**
 * Tax calculation subdocument schema
 */
const TaxCalculationSchema = new Schema<TaxCalculation>(
  {
    propertyTax: { type: Number, required: true, min: 0 },
    incomeTax: { type: Number, required: true, min: 0 },
    upkeepCosts: { type: Number, required: true, min: 0 },
    specialTax: { type: Number, required: true, min: 0 },
    totalTax: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
  },
  { _id: false }
);

/**
 * Property Tax schema definition
 */
const PropertyTaxSchema = new Schema<IPropertyTax>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    propertyType: {
      type: String,
      enum: ['gang_base', 'business', 'ranch', 'mine', 'other'],
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
    propertySize: {
      type: String,
      enum: Object.values(PropertySize),
      required: true,
    },
    propertyValue: {
      type: Number,
      required: true,
      min: 0,
    },
    propertyTier: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    weeklyIncome: {
      type: Number,
      default: 0,
      min: 0,
    },
    condition: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    workerCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    workerLevel: {
      type: Number,
      default: 1,
      min: 1,
    },
    taxCalculation: {
      type: TaxCalculationSchema,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(TaxPaymentStatus),
      default: TaxPaymentStatus.PENDING,
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    paidDate: {
      type: Date,
    },
    amountPaid: {
      type: Number,
      min: 0,
    },
    autoPayEnabled: {
      type: Boolean,
      default: false,
    },
    specialTaxType: {
      type: String,
      enum: Object.values(SpecialTaxType),
      default: SpecialTaxType.NONE,
    },
    location: {
      type: String,
      required: true,
    },
    insuranceEnabled: {
      type: Boolean,
      default: false,
    },
    lastCalculated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
PropertyTaxSchema.index({ propertyId: 1, dueDate: -1 });
PropertyTaxSchema.index({ ownerId: 1, paymentStatus: 1 });
PropertyTaxSchema.index({ dueDate: 1, paymentStatus: 1 });
PropertyTaxSchema.index({ paymentStatus: 1, dueDate: 1 });

/**
 * Instance method: Calculate property tax based on value and tier
 */
PropertyTaxSchema.methods.calculatePropertyTax = function (this: IPropertyTax): number {
  const sizeConfig = PROPERTY_SIZE_TAX_CONFIG[this.propertySize];
  const baseTax = sizeConfig.baseWeeklyTax;

  // Apply tier multiplier
  return this.applyTierMultiplier(baseTax);
};

/**
 * Instance method: Calculate income tax (10% of weekly income, min 25 gold)
 */
PropertyTaxSchema.methods.calculateIncomeTax = function (this: IPropertyTax): number {
  if (this.weeklyIncome <= 0) {
    return TAX_CONSTANTS.MINIMUM_INCOME_TAX;
  }

  const incomeTax = Math.floor(this.weeklyIncome * TAX_CONSTANTS.INCOME_TAX_RATE);
  return Math.max(incomeTax, TAX_CONSTANTS.MINIMUM_INCOME_TAX);
};

/**
 * Instance method: Calculate upkeep costs
 */
PropertyTaxSchema.methods.calculateUpkeepCosts = function (this: IPropertyTax): number {
  // Worker wages
  const workerWages = this.workerCount * this.workerLevel * TAX_CONSTANTS.WORKER_WAGE_PER_LEVEL;

  // Material costs (base + tier scaling)
  const materialCosts =
    TAX_CONSTANTS.MATERIAL_COST_BASE +
    (this.propertyTier - 1) * TAX_CONSTANTS.MATERIAL_COST_PER_TIER;

  // Repair costs (more expensive if condition is poor)
  const conditionFactor = (100 - this.condition) / 100;
  const repairCosts = Math.floor(
    materialCosts * conditionFactor * TAX_CONSTANTS.REPAIR_COST_CONDITION_MULTIPLIER
  );

  // Insurance (optional)
  const insuranceCost = this.insuranceEnabled
    ? Math.floor(this.propertyValue * TAX_CONSTANTS.INSURANCE_COST_PERCENT)
    : 0;

  return workerWages + materialCosts + repairCosts + insuranceCost;
};

/**
 * Instance method: Calculate special taxes based on location
 */
PropertyTaxSchema.methods.calculateSpecialTax = function (this: IPropertyTax): number {
  switch (this.specialTaxType) {
    case SpecialTaxType.FRONTIER:
      // Protection money - 15% of property value per week
      return Math.floor(this.propertyValue * TAX_CONSTANTS.FRONTIER_TAX_RATE);

    case SpecialTaxType.COALITION:
      // Coalition tribute - 20% more than normal property tax
      const baseTax = this.calculatePropertyTax();
      return Math.floor(baseTax * TAX_CONSTANTS.COALITION_TRIBUTE_MULTIPLIER) - baseTax;

    case SpecialTaxType.MILITARY:
      // Military levy - 25% of total other taxes
      const otherTaxes =
        this.calculatePropertyTax() + this.calculateIncomeTax() + this.calculateUpkeepCosts();
      return Math.floor(otherTaxes * TAX_CONSTANTS.MILITARY_LEVY_RATE);

    default:
      return 0;
  }
};

/**
 * Instance method: Calculate total tax and return full breakdown
 */
PropertyTaxSchema.methods.calculateTotalTax = function (this: IPropertyTax): TaxCalculation {
  const propertyTax = this.calculatePropertyTax();
  const incomeTax = this.calculateIncomeTax();
  const upkeepCosts = this.calculateUpkeepCosts();
  const specialTax = this.calculateSpecialTax();
  const totalTax = propertyTax + incomeTax + upkeepCosts + specialTax;

  // Calculate next due date (next Sunday)
  const nextDueDate = new Date();
  const daysUntilSunday = (7 - nextDueDate.getDay()) % 7 || 7;
  nextDueDate.setDate(nextDueDate.getDate() + daysUntilSunday);
  nextDueDate.setHours(0, 0, 0, 0);

  return {
    propertyTax,
    incomeTax,
    upkeepCosts,
    specialTax,
    totalTax,
    dueDate: nextDueDate,
  };
};

/**
 * Instance method: Apply tier multiplier to base tax
 */
PropertyTaxSchema.methods.applyTierMultiplier = function (
  this: IPropertyTax,
  baseTax: number
): number {
  const multiplier = Math.min(
    TAX_CONSTANTS.TIER_MULTIPLIER_MIN +
      (this.propertyTier - 1) * TAX_CONSTANTS.TIER_MULTIPLIER_INCREMENT,
    TAX_CONSTANTS.TIER_MULTIPLIER_MAX
  );

  return Math.floor(baseTax * multiplier);
};

/**
 * Instance method: Process payment
 */
PropertyTaxSchema.methods.processPayment = function (
  this: IPropertyTax,
  amount: number,
  paymentMethod: 'manual' | 'auto'
): void {
  this.amountPaid = amount;
  this.paidDate = new Date();

  if (amount >= this.taxCalculation.totalTax) {
    this.paymentStatus = TaxPaymentStatus.PAID;
  } else {
    // Partial payment still counts as late
    this.paymentStatus = TaxPaymentStatus.LATE;
  }
};

/**
 * Instance method: Check if due for collection
 */
PropertyTaxSchema.methods.isDueForCollection = function (this: IPropertyTax): boolean {
  return new Date() >= this.dueDate && this.paymentStatus !== TaxPaymentStatus.PAID;
};

/**
 * Instance method: Check if overdue
 */
PropertyTaxSchema.methods.isOverdue = function (this: IPropertyTax): boolean {
  if (this.paymentStatus === TaxPaymentStatus.PAID) {
    return false;
  }

  const now = new Date();
  return now > this.dueDate;
};

/**
 * Instance method: Get days overdue
 */
PropertyTaxSchema.methods.getDaysOverdue = function (this: IPropertyTax): number {
  if (!this.isOverdue()) {
    return 0;
  }

  const now = new Date();
  const diffMs = now.getTime() - this.dueDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Instance method: Check if can auto-pay from balance
 */
PropertyTaxSchema.methods.canAutoPayFrom = function (this: IPropertyTax, balance: number): boolean {
  return this.autoPayEnabled && balance >= this.taxCalculation.totalTax;
};

/**
 * Instance method: Convert to safe object
 */
PropertyTaxSchema.methods.toSafeObject = function (this: IPropertyTax): Record<string, unknown> {
  return {
    id: this._id.toString(),
    propertyId: this.propertyId.toString(),
    propertyType: this.propertyType,
    ownerId: this.ownerId.toString(),
    ownerType: this.ownerType,
    ownerName: this.ownerName,
    propertySize: this.propertySize,
    propertyValue: this.propertyValue,
    propertyTier: this.propertyTier,
    weeklyIncome: this.weeklyIncome,
    taxCalculation: this.taxCalculation,
    paymentStatus: this.paymentStatus,
    dueDate: this.dueDate,
    paidDate: this.paidDate,
    amountPaid: this.amountPaid,
    autoPayEnabled: this.autoPayEnabled,
    specialTaxType: this.specialTaxType,
    location: this.location,
    daysOverdue: this.getDaysOverdue(),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

/**
 * Static method: Find tax record by property ID
 */
PropertyTaxSchema.statics.findByPropertyId = async function (
  propertyId: string | mongoose.Types.ObjectId
): Promise<IPropertyTax | null> {
  const id = typeof propertyId === 'string' ? new mongoose.Types.ObjectId(propertyId) : propertyId;
  return this.findOne({ propertyId: id }).sort({ dueDate: -1 });
};

/**
 * Static method: Find all tax records for an owner
 */
PropertyTaxSchema.statics.findByOwnerId = async function (
  ownerId: string | mongoose.Types.ObjectId
): Promise<IPropertyTax[]> {
  const id = typeof ownerId === 'string' ? new mongoose.Types.ObjectId(ownerId) : ownerId;
  return this.find({ ownerId: id }).sort({ dueDate: -1 });
};

/**
 * Static method: Find taxes due for collection
 */
PropertyTaxSchema.statics.findDueForCollection = async function (): Promise<IPropertyTax[]> {
  const now = new Date();
  return this.find({
    dueDate: { $lte: now },
    paymentStatus: { $in: [TaxPaymentStatus.PENDING, TaxPaymentStatus.LATE] },
  }).sort({ dueDate: 1 });
};

/**
 * Static method: Find overdue taxes
 */
PropertyTaxSchema.statics.findOverdueTaxes = async function (): Promise<IPropertyTax[]> {
  const now = new Date();
  return this.find({
    dueDate: { $lt: now },
    paymentStatus: { $nin: [TaxPaymentStatus.PAID, TaxPaymentStatus.FORECLOSED] },
  }).sort({ dueDate: 1 });
};

/**
 * Static method: Find taxes by status
 */
PropertyTaxSchema.statics.findByStatus = async function (
  status: TaxPaymentStatus
): Promise<IPropertyTax[]> {
  return this.find({ paymentStatus: status }).sort({ dueDate: 1 });
};

/**
 * Static method: Create a new tax record
 * @param options - Optional transaction options (pass session for outer transaction support)
 */
PropertyTaxSchema.statics.createTaxRecord = async function (
  propertyId: mongoose.Types.ObjectId,
  propertyType: string,
  ownerId: mongoose.Types.ObjectId,
  ownerType: 'gang' | 'character',
  ownerName: string,
  propertyData: any,
  options: PropertyTaxTransactionOptions = {}
): Promise<IPropertyTax> {
  const { session } = options;
  const taxRecord = new this({
    propertyId,
    propertyType,
    ownerId,
    ownerType,
    ownerName,
    propertySize: propertyData.size || PropertySize.SMALL,
    propertyValue: propertyData.value || 1000,
    propertyTier: propertyData.tier || 1,
    weeklyIncome: propertyData.weeklyIncome || 0,
    condition: propertyData.condition || 100,
    workerCount: propertyData.workerCount || 0,
    workerLevel: propertyData.workerLevel || 1,
    specialTaxType: propertyData.specialTaxType || SpecialTaxType.NONE,
    location: propertyData.location || 'Unknown',
    autoPayEnabled: false,
    insuranceEnabled: propertyData.insuranceEnabled || false,
    paymentStatus: TaxPaymentStatus.PENDING,
  });

  // Calculate taxes
  const calculation = taxRecord.calculateTotalTax();
  taxRecord.taxCalculation = calculation;
  taxRecord.dueDate = calculation.dueDate;

  // Save with session if provided (for transaction support)
  await taxRecord.save({ session });
  return taxRecord;
};

/**
 * Pre-save hook: Recalculate taxes if relevant fields changed
 */
PropertyTaxSchema.pre('save', function (next) {
  if (
    this.isModified('propertyValue') ||
    this.isModified('propertyTier') ||
    this.isModified('weeklyIncome') ||
    this.isModified('workerCount') ||
    this.isModified('condition')
  ) {
    const calculation = this.calculateTotalTax();
    this.taxCalculation = calculation;
    this.lastCalculated = new Date();
  }
  next();
});

/**
 * Property Tax model
 */
export const PropertyTax = mongoose.model<IPropertyTax, IPropertyTaxModel>(
  'PropertyTax',
  PropertyTaxSchema
);
