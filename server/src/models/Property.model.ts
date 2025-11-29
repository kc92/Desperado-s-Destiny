/**
 * Property Model
 *
 * Mongoose schema for player-owned properties
 * Phase 8, Wave 8.1 - Property Ownership System
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  PropertyType,
  PropertySize,
  PropertyStatus,
  PropertyTier,
  PurchaseSource,
  PropertyUpgrade,
  PropertyStorage,
  UpgradeCategory,
  WorkerType,
} from '@desperados/shared';

/**
 * Local PropertyWorker interface for the model
 * (Different from shared production.types PropertyWorker)
 */
export interface PropertyWorker {
  workerId: string;
  workerType: WorkerType;
  name: string;
  skill: number;
  dailyWage: number;
  hiredAt: Date;
  isActive: boolean;
}

/**
 * Local ProductionSlot interface for the model
 * (Simplified from shared production.types ProductionSlot)
 */
export interface ProductionSlot {
  slotId: string;
  recipeId?: string;
  startedAt?: Date;
  completesAt?: Date;
  outputItemId?: string;
  outputQuantity?: number;
  isActive: boolean;
}

/**
 * Property document interface
 */
export interface IProperty extends Document {
  _id: mongoose.Types.ObjectId;
  propertyType: PropertyType;
  name: string;
  locationId: string;
  ownerId?: mongoose.Types.ObjectId;

  // Purchase details
  purchasePrice: number;
  purchaseDate?: Date;
  purchasedFrom?: string;
  purchaseSource: PurchaseSource;

  // Physical attributes
  size: PropertySize;
  condition: number;

  // Upgrades and tier
  tier: PropertyTier;
  upgrades: PropertyUpgrade[];
  maxUpgrades: number;

  // Workers
  workers: PropertyWorker[];
  maxWorkers: number;

  // Storage
  storage: PropertyStorage;

  // Financials
  weeklyTaxes: number;
  weeklyUpkeep: number;
  lastTaxPayment?: Date;
  taxDebt: number;

  // Production
  productionSlots: ProductionSlot[];

  // Status
  status: PropertyStatus;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  calculateTotalUpkeep(): number;
  canAffordUpkeep(): boolean;
  applyConditionDecay(): void;
  getAvailableUpgradeSlots(): number;
  getAvailableWorkerSlots(): number;
  getTotalStorageCapacity(): number;
  addUpgrade(upgrade: PropertyUpgrade): void;
  hireWorker(worker: PropertyWorker): void;
  fireWorker(workerId: string): void;
  depositItem(itemId: string, itemName: string, quantity: number): void;
  withdrawItem(itemId: string, quantity: number): boolean;
  calculateWeeklyIncome(): number;
  payTaxes(): boolean;
  foreclose(): void;
}

/**
 * Property static methods interface
 */
export interface IPropertyModel extends Model<IProperty> {
  findByOwner(ownerId: string): Promise<IProperty[]>;
  findByLocation(locationId: string): Promise<IProperty[]>;
  findAvailableProperties(): Promise<IProperty[]>;
  findForeclosedProperties(): Promise<IProperty[]>;
}

/**
 * Property upgrade schema
 */
const PropertyUpgradeSchema = new Schema<PropertyUpgrade>(
  {
    upgradeId: { type: String, required: true },
    upgradeType: { type: String, required: true },
    category: {
      type: String,
      enum: ['capacity', 'efficiency', 'defense', 'comfort', 'specialty'] as UpgradeCategory[],
      required: true,
    },
    installedAt: { type: Date, required: true },
    level: { type: Number, default: 1, min: 1, max: 5 },
    maxLevel: { type: Number, default: 5, min: 1, max: 5 },
  },
  { _id: false }
);

/**
 * Property worker schema
 */
const PropertyWorkerSchema = new Schema<PropertyWorker>(
  {
    workerId: { type: String, required: true },
    workerType: {
      type: String,
      enum: [
        'farmhand',
        'shopkeeper',
        'craftsman',
        'miner',
        'bartender',
        'stable_hand',
        'security',
        'manager',
      ] as WorkerType[],
      required: true,
    },
    name: { type: String, required: true },
    skill: { type: Number, required: true, min: 1, max: 100 },
    dailyWage: { type: Number, required: true, min: 0 },
    hiredAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

/**
 * Storage item schema
 */
const StorageItemSchema = new Schema(
  {
    itemId: { type: String, required: true },
    itemName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * Property storage schema
 */
const PropertyStorageSchema = new Schema<PropertyStorage>(
  {
    capacity: { type: Number, required: true, min: 0 },
    currentUsage: { type: Number, default: 0, min: 0 },
    items: [StorageItemSchema],
  },
  { _id: false }
);

/**
 * Production slot schema
 */
const ProductionSlotSchema = new Schema<ProductionSlot>(
  {
    slotId: { type: String, required: true },
    recipeId: { type: String },
    startedAt: { type: Date },
    completesAt: { type: Date },
    outputItemId: { type: String },
    outputQuantity: { type: Number },
    isActive: { type: Boolean, default: false },
  },
  { _id: false }
);

/**
 * Property schema definition
 */
const PropertySchema = new Schema<IProperty>(
  {
    propertyType: {
      type: String,
      required: true,
      enum: ['ranch', 'shop', 'workshop', 'homestead', 'mine', 'saloon', 'stable'] as PropertyType[],
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    locationId: {
      type: String,
      required: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      index: true,
    },

    // Purchase details
    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    purchaseDate: {
      type: Date,
    },
    purchasedFrom: {
      type: String,
    },
    purchaseSource: {
      type: String,
      enum: ['npc_direct', 'auction', 'foreclosure', 'quest_reward', 'transfer'] as PurchaseSource[],
      required: true,
    },

    // Physical attributes
    size: {
      type: String,
      enum: ['small', 'medium', 'large', 'huge'] as PropertySize[],
      required: true,
    },
    condition: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },

    // Upgrades and tier
    tier: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 1,
    },
    upgrades: {
      type: [PropertyUpgradeSchema],
      default: [],
    },
    maxUpgrades: {
      type: Number,
      default: 2,
      min: 0,
    },

    // Workers
    workers: {
      type: [PropertyWorkerSchema],
      default: [],
    },
    maxWorkers: {
      type: Number,
      default: 1,
      min: 0,
    },

    // Storage
    storage: {
      type: PropertyStorageSchema,
      required: true,
    },

    // Financials
    weeklyTaxes: {
      type: Number,
      required: true,
      min: 0,
    },
    weeklyUpkeep: {
      type: Number,
      required: true,
      min: 0,
    },
    lastTaxPayment: {
      type: Date,
    },
    taxDebt: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Production
    productionSlots: {
      type: [ProductionSlotSchema],
      default: [],
    },

    // Status
    status: {
      type: String,
      enum: Object.values(PropertyStatus),
      default: PropertyStatus.ACTIVE,
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
PropertySchema.index({ ownerId: 1, status: 1 });
PropertySchema.index({ locationId: 1, status: 1 });
PropertySchema.index({ propertyType: 1, status: 1 });
PropertySchema.index({ status: 1, lastTaxPayment: 1 }); // For tax collection jobs

/**
 * Instance method: Calculate total weekly upkeep including workers
 */
PropertySchema.methods.calculateTotalUpkeep = function (this: IProperty): number {
  const workerWages = this.workers
    .filter((w) => w.isActive)
    .reduce((sum, worker) => sum + worker.dailyWage * 7, 0);

  return this.weeklyUpkeep + workerWages;
};

/**
 * Instance method: Check if owner can afford upkeep
 */
PropertySchema.methods.canAffordUpkeep = function (this: IProperty): boolean {
  // This will be called from the service layer which has access to character
  return true; // Placeholder
};

/**
 * Instance method: Apply condition decay
 */
PropertySchema.methods.applyConditionDecay = function (this: IProperty): void {
  const DECAY_RATE = 1; // 1% per week
  this.condition = Math.max(0, this.condition - DECAY_RATE);

  // Update status based on condition
  if (this.condition < 20) {
    this.status = PropertyStatus.ABANDONED;
  }
};

/**
 * Instance method: Get available upgrade slots
 */
PropertySchema.methods.getAvailableUpgradeSlots = function (this: IProperty): number {
  return Math.max(0, this.maxUpgrades - this.upgrades.length);
};

/**
 * Instance method: Get available worker slots
 */
PropertySchema.methods.getAvailableWorkerSlots = function (this: IProperty): number {
  const activeWorkers = this.workers.filter((w) => w.isActive).length;
  return Math.max(0, this.maxWorkers - activeWorkers);
};

/**
 * Instance method: Get total storage capacity
 */
PropertySchema.methods.getTotalStorageCapacity = function (this: IProperty): number {
  return this.storage.capacity;
};

/**
 * Instance method: Add upgrade to property
 */
PropertySchema.methods.addUpgrade = function (this: IProperty, upgrade: PropertyUpgrade): void {
  if (this.upgrades.length >= this.maxUpgrades) {
    throw new Error('Maximum upgrades reached');
  }
  this.upgrades.push(upgrade);
};

/**
 * Instance method: Hire worker
 */
PropertySchema.methods.hireWorker = function (this: IProperty, worker: PropertyWorker): void {
  const activeWorkers = this.workers.filter((w) => w.isActive).length;
  if (activeWorkers >= this.maxWorkers) {
    throw new Error('Maximum workers reached');
  }
  this.workers.push(worker);
};

/**
 * Instance method: Fire worker
 */
PropertySchema.methods.fireWorker = function (this: IProperty, workerId: string): void {
  const worker = this.workers.find((w) => w.workerId === workerId);
  if (worker) {
    worker.isActive = false;
  }
};

/**
 * Instance method: Deposit item to storage
 */
PropertySchema.methods.depositItem = function (
  this: IProperty,
  itemId: string,
  itemName: string,
  quantity: number
): void {
  if (this.storage.currentUsage >= this.storage.capacity) {
    throw new Error('Storage is full');
  }

  const existingItem = this.storage.items.find((item) => item.itemId === itemId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.storage.items.push({
      itemId,
      itemName,
      quantity,
      addedAt: new Date(),
    });
  }
  this.storage.currentUsage += quantity;
};

/**
 * Instance method: Withdraw item from storage
 */
PropertySchema.methods.withdrawItem = function (this: IProperty, itemId: string, quantity: number): boolean {
  const item = this.storage.items.find((i) => i.itemId === itemId);
  if (!item || item.quantity < quantity) {
    return false;
  }

  item.quantity -= quantity;
  this.storage.currentUsage -= quantity;

  if (item.quantity === 0) {
    this.storage.items = this.storage.items.filter((i) => i.itemId !== itemId);
  }

  return true;
};

/**
 * Instance method: Calculate weekly income (to be implemented based on property type)
 */
PropertySchema.methods.calculateWeeklyIncome = function (this: IProperty): number {
  // Base income calculation - to be enhanced with property-specific logic
  let income = 0;

  // Income varies by property type and tier
  const tierMultiplier = this.tier;
  const conditionMultiplier = this.condition / 100;

  // Placeholder logic
  switch (this.propertyType) {
    case 'ranch':
      income = 50 * tierMultiplier * conditionMultiplier;
      break;
    case 'shop':
      income = 75 * tierMultiplier * conditionMultiplier;
      break;
    case 'workshop':
      income = 60 * tierMultiplier * conditionMultiplier;
      break;
    case 'mine':
      income = 100 * tierMultiplier * conditionMultiplier;
      break;
    case 'saloon':
      income = 120 * tierMultiplier * conditionMultiplier;
      break;
    case 'stable':
      income = 70 * tierMultiplier * conditionMultiplier;
      break;
    default:
      income = 0;
  }

  return Math.floor(income);
};

/**
 * Instance method: Pay taxes
 */
PropertySchema.methods.payTaxes = function (this: IProperty): boolean {
  this.lastTaxPayment = new Date();
  this.taxDebt = 0;
  return true;
};

/**
 * Instance method: Foreclose property
 */
PropertySchema.methods.foreclose = function (this: IProperty): void {
  this.status = PropertyStatus.FORECLOSED;
  this.ownerId = undefined;
  // Clear workers
  this.workers.forEach((w) => (w.isActive = false));
  // Set condition to deteriorated state
  this.condition = Math.max(30, this.condition - 20);
};

/**
 * Static method: Find all properties owned by a character
 */
PropertySchema.statics.findByOwner = async function (ownerId: string): Promise<IProperty[]> {
  return this.find({
    ownerId: new mongoose.Types.ObjectId(ownerId),
    status: { $in: [PropertyStatus.ACTIVE, PropertyStatus.UNDER_CONSTRUCTION] },
  }).sort({ createdAt: -1 });
};

/**
 * Static method: Find all properties in a location
 */
PropertySchema.statics.findByLocation = async function (locationId: string): Promise<IProperty[]> {
  return this.find({
    locationId,
    status: PropertyStatus.ACTIVE,
  });
};

/**
 * Static method: Find available properties (no owner)
 */
PropertySchema.statics.findAvailableProperties = async function (): Promise<IProperty[]> {
  return this.find({
    ownerId: { $exists: false },
    status: PropertyStatus.ACTIVE,
  });
};

/**
 * Static method: Find foreclosed properties
 */
PropertySchema.statics.findForeclosedProperties = async function (): Promise<IProperty[]> {
  return this.find({
    status: PropertyStatus.FORECLOSED,
  }).sort({ updatedAt: -1 });
};

/**
 * Property model
 */
export const Property = mongoose.model<IProperty, IPropertyModel>('Property', PropertySchema);
