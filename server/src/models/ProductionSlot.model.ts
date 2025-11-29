/**
 * Production Slot Model
 *
 * Tracks production slots for properties and their active orders
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  PropertyType,
  ProductionStatus,
  ProductQuality,
  ProductCategory,
  ProductionOrder,
} from '@desperados/shared';

/**
 * Production Slot document interface
 */
export interface IProductionSlot extends Document {
  // Ownership
  propertyId: mongoose.Types.ObjectId;
  characterId: mongoose.Types.ObjectId;

  // Slot Identity
  slotId: string;
  slotNumber: number;
  propertyType: PropertyType;

  // Status
  status: ProductionStatus;
  currentOrder?: ProductionOrder;

  // Capacity
  baseCapacity: number;
  currentCapacity: number;

  // Bonuses from upgrades
  speedBonus: number; // Percentage (0.0 - 1.0 = 0% - 100%)
  yieldBonus: number; // Percentage
  qualityBonus: number; // Percentage

  // Specialization
  specialization?: ProductCategory;
  specializationBonus: number;

  // Locks
  isLocked: boolean;
  unlockCost?: number;
  unlockLevel?: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Methods
  canStartProduction(): boolean;
  isProducing(): boolean;
  isReady(): boolean;
  getProgress(): number;
  getRemainingTime(): number;
  calculateCompletionTime(baseTime: number): number;
  applyBonuses(baseValue: number, bonusType: 'speed' | 'yield' | 'quality'): number;
}

/**
 * Production Slot static methods interface
 */
export interface IProductionSlotModel extends Model<IProductionSlot> {
  findByProperty(propertyId: string): Promise<IProductionSlot[]>;
  findByCharacter(characterId: string): Promise<IProductionSlot[]>;
  getActiveProductions(characterId: string): Promise<IProductionSlot[]>;
  getCompletedProductions(characterId: string): Promise<IProductionSlot[]>;
}

/**
 * Production Order sub-schema
 */
const ProductionOrderSchema = new Schema({
  orderId: { type: String, required: true },
  productId: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  targetQuality: {
    type: String,
    enum: Object.values(ProductQuality),
    default: ProductQuality.STANDARD,
  },

  // Materials
  materialsUsed: [
    {
      itemId: { type: String, required: true },
      quantity: { type: Number, required: true },
    },
  ],

  // Workers
  workersAssigned: { type: Number, required: true, default: 1 },
  workerIds: [{ type: String }],

  // Time
  startTime: { type: Date, required: true },
  estimatedCompletion: { type: Date, required: true },
  actualCompletion: { type: Date },

  // Rush
  isRushed: { type: Boolean, default: false },
  rushCost: { type: Number, min: 0 },

  // Results
  completedQuantity: { type: Number, default: 0 },
  actualQuality: {
    type: String,
    enum: Object.values(ProductQuality),
  },
  bonusYield: { type: Number, default: 0 },

  // Metadata
  createdAt: { type: Date, default: Date.now },
});

/**
 * Production Slot schema definition
 */
const ProductionSlotSchema = new Schema<IProductionSlot>(
  {
    // Ownership
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
      index: true,
    },
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true,
    },

    // Slot Identity
    slotId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    slotNumber: {
      type: Number,
      required: true,
      min: 0,
    },
    propertyType: {
      type: String,
      required: true,
      enum: Object.values(PropertyType),
    },

    // Status
    status: {
      type: String,
      required: true,
      enum: ['idle', 'producing', 'ready', 'blocked'],
      default: 'idle',
      index: true,
    },
    currentOrder: {
      type: ProductionOrderSchema,
      default: undefined,
    },

    // Capacity
    baseCapacity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    currentCapacity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    // Bonuses from upgrades
    speedBonus: {
      type: Number,
      default: 0,
      min: 0,
      max: 2.0, // Max 200% bonus
    },
    yieldBonus: {
      type: Number,
      default: 0,
      min: 0,
      max: 2.0,
    },
    qualityBonus: {
      type: Number,
      default: 0,
      min: 0,
      max: 1.0,
    },

    // Specialization
    specialization: {
      type: String,
      enum: Object.values(ProductCategory),
    },
    specializationBonus: {
      type: Number,
      default: 0,
      min: 0,
      max: 0.5, // Max 50% bonus for specialization
    },

    // Locks
    isLocked: {
      type: Boolean,
      default: false,
    },
    unlockCost: {
      type: Number,
      min: 0,
    },
    unlockLevel: {
      type: Number,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
ProductionSlotSchema.index({ propertyId: 1, slotNumber: 1 });
ProductionSlotSchema.index({ characterId: 1, status: 1 });
ProductionSlotSchema.index({ 'currentOrder.estimatedCompletion': 1 });

/**
 * Instance method: Check if slot can start production
 */
ProductionSlotSchema.methods.canStartProduction = function (
  this: IProductionSlot
): boolean {
  return (
    !this.isLocked &&
    (this.status === 'idle' || this.status === 'ready') &&
    !this.currentOrder
  );
};

/**
 * Instance method: Check if slot is currently producing
 */
ProductionSlotSchema.methods.isProducing = function (this: IProductionSlot): boolean {
  return this.status === 'producing' && !!this.currentOrder;
};

/**
 * Instance method: Check if production is ready to collect
 */
ProductionSlotSchema.methods.isReady = function (this: IProductionSlot): boolean {
  if (!this.currentOrder) return false;
  return (
    this.status === 'ready' ||
    (this.currentOrder.estimatedCompletion &&
      new Date() >= this.currentOrder.estimatedCompletion)
  );
};

/**
 * Instance method: Get production progress percentage (0-100)
 */
ProductionSlotSchema.methods.getProgress = function (this: IProductionSlot): number {
  if (!this.currentOrder || !this.currentOrder.startTime) return 0;

  const now = Date.now();
  const start = this.currentOrder.startTime.getTime();
  const end = this.currentOrder.estimatedCompletion.getTime();

  if (now >= end) return 100;

  const elapsed = now - start;
  const total = end - start;

  return Math.min(100, Math.max(0, (elapsed / total) * 100));
};

/**
 * Instance method: Get remaining time in minutes
 */
ProductionSlotSchema.methods.getRemainingTime = function (this: IProductionSlot): number {
  if (!this.currentOrder || !this.currentOrder.estimatedCompletion) return 0;

  const now = Date.now();
  const end = this.currentOrder.estimatedCompletion.getTime();

  if (now >= end) return 0;

  const remaining = end - now;
  return Math.ceil(remaining / (60 * 1000)); // Convert to minutes
};

/**
 * Instance method: Calculate actual completion time with bonuses
 */
ProductionSlotSchema.methods.calculateCompletionTime = function (
  this: IProductionSlot,
  baseTimeMinutes: number
): number {
  return this.applyBonuses(baseTimeMinutes, 'speed');
};

/**
 * Instance method: Apply bonuses to a base value
 */
ProductionSlotSchema.methods.applyBonuses = function (
  this: IProductionSlot,
  baseValue: number,
  bonusType: 'speed' | 'yield' | 'quality'
): number {
  let bonus = 0;

  switch (bonusType) {
    case 'speed':
      // Speed bonus reduces time
      bonus = this.speedBonus;
      return Math.max(1, Math.floor(baseValue * (1 - bonus)));
    case 'yield':
      // Yield bonus increases output
      bonus = this.yieldBonus;
      return Math.floor(baseValue * (1 + bonus));
    case 'quality':
      // Quality bonus increases quality chance
      bonus = this.qualityBonus;
      return Math.min(1, baseValue + bonus);
  }

  return baseValue;
};

/**
 * Static method: Find all slots for a property
 */
ProductionSlotSchema.statics.findByProperty = async function (
  propertyId: string
): Promise<IProductionSlot[]> {
  return this.find({
    propertyId: new mongoose.Types.ObjectId(propertyId),
  }).sort({ slotNumber: 1 });
};

/**
 * Static method: Find all slots for a character
 */
ProductionSlotSchema.statics.findByCharacter = async function (
  characterId: string
): Promise<IProductionSlot[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId),
  }).sort({ propertyType: 1, slotNumber: 1 });
};

/**
 * Static method: Get all active productions for a character
 */
ProductionSlotSchema.statics.getActiveProductions = async function (
  characterId: string
): Promise<IProductionSlot[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId),
    status: 'producing',
  }).sort({ 'currentOrder.estimatedCompletion': 1 });
};

/**
 * Static method: Get all completed productions for a character
 */
ProductionSlotSchema.statics.getCompletedProductions = async function (
  characterId: string
): Promise<IProductionSlot[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId),
    status: 'ready',
  });
};

/**
 * Production Slot model
 */
export const ProductionSlot = mongoose.model<IProductionSlot, IProductionSlotModel>(
  'ProductionSlot',
  ProductionSlotSchema
);
