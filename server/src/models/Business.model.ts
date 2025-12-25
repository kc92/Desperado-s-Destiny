/**
 * Business Model
 *
 * Mongoose schema for player-owned businesses
 * Phase 12: Business Ownership System
 *
 * Transforms properties into operational businesses with:
 * - NPC customer traffic simulation
 * - Service and product pricing control
 * - Player-to-player service transactions
 * - Revenue accumulation (visit-to-collect pattern)
 */

import mongoose, { Schema, Document, Model, ClientSession } from 'mongoose';
import {
  PlayerBusinessType,
  PlayerBusinessCategory,
  BusinessServiceCategory,
  PlayerBusinessStatus,
  OperatingHoursMode,
  IBusinessService,
  IBusinessProduct,
  IStaffAssignment,
  IBusinessReputation,
  IOperatingHours,
  ITrafficStats,
  BusinessTier,
  BUSINESS_TIER_INFO,
  BUSINESS_TYPE_INFO,
  BUSINESS_REVENUE_TARGETS,
  BusinessOwnerType,
  GangBusinessRole,
  ProtectionTier,
  IBusinessOwnershipInfo,
  IGangRevenueShare,
  IBusinessProtectionStatus,
  GANG_BUSINESS_CONSTANTS,
} from '@desperados/shared';
import { WorkerSpecialization } from '@desperados/shared';

/**
 * Business document interface
 */
export interface IBusiness extends Document {
  _id: mongoose.Types.ObjectId;

  // Links
  propertyId: mongoose.Types.ObjectId;
  characterId: mongoose.Types.ObjectId;
  locationId: string;

  // Phase 15: Gang Ownership
  ownerType: BusinessOwnerType;
  gangId?: mongoose.Types.ObjectId;
  gangRole?: GangBusinessRole;
  managerId?: mongoose.Types.ObjectId;
  transferredAt?: Date;
  transferredFrom?: mongoose.Types.ObjectId;
  revenueSharePercent?: number;

  // Phase 15: Protection Status
  protection?: {
    isProtected: boolean;
    gangId?: mongoose.Types.ObjectId;
    tier?: ProtectionTier;
    incidentReduction: number;
    reputationBoost: number;
  };

  // Identity
  businessType: PlayerBusinessType;
  businessName: string;
  description?: string;
  tier: BusinessTier;

  // Status
  status: PlayerBusinessStatus;
  establishedAt: Date;
  lastActiveAt: Date;

  // Services (for service businesses)
  services: IBusinessService[];

  // Products (for production businesses)
  products: IBusinessProduct[];

  // Staff
  staffAssignments: IStaffAssignment[];
  maxStaff: number;

  // Reputation
  reputation: IBusinessReputation;

  // Operating Hours
  operatingHours: IOperatingHours;

  // Traffic & Revenue
  baseTrafficRate: number;
  currentTrafficRate: number;
  pendingRevenue: number;
  lastRevenueCollection: Date;
  maxPendingRevenue: number;

  // Statistics
  totalCustomersServed: number;
  totalRevenue: number;
  totalExpenses: number;
  trafficStats: ITrafficStats;

  // P2P Transaction Settings
  allowPlayerCustomers: boolean;
  playerServicePremium: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  isOpen(): boolean;
  getCategory(): PlayerBusinessCategory;
  calculateTrafficRate(): number;
  updateReputation(serviceQuality: number, priceValue: number, availability: number): void;
  addRevenue(amount: number): void;
  collectRevenue(): number;
  assignStaff(assignment: IStaffAssignment): void;
  removeStaff(workerId: string): void;
  setServicePrice(serviceId: string, price: number): void;
  toggleService(serviceId: string, isActive: boolean): void;
  setProductPrice(productId: string, price: number): void;
  updateStock(productId: string, quantity: number): void;
  recordCustomer(isNPC: boolean, revenue: number, satisfaction: number): void;
  applyReputationDecay(): void;
  syncWithPropertyTier(tier: BusinessTier): void;

  // Phase 15: Gang ownership methods
  isGangOwned(): boolean;
  getOwnershipInfo(): IBusinessOwnershipInfo;
  canBeTransferredToGang(): boolean;
  calculateGangRevenueShare(totalRevenue: number): IGangRevenueShare;
  getProtectionStatus(): IBusinessProtectionStatus;
}

/**
 * Business static methods interface
 */
export interface IBusinessModel extends Model<IBusiness> {
  findByOwner(characterId: string): Promise<IBusiness[]>;
  findByProperty(propertyId: string): Promise<IBusiness | null>;
  findByLocation(locationId: string): Promise<IBusiness[]>;
  findActiveBusinesses(): Promise<IBusiness[]>;
  findByType(businessType: PlayerBusinessType): Promise<IBusiness[]>;

  // Phase 15: Gang ownership statics
  findByGang(gangId: mongoose.Types.ObjectId): Promise<IBusiness[]>;
  findGangBusinessesByZone(gangId: mongoose.Types.ObjectId, zoneId: string): Promise<IBusiness[]>;
  countGangBusinesses(gangId: mongoose.Types.ObjectId): Promise<number>;
  findProtectedBusinesses(gangId: mongoose.Types.ObjectId): Promise<IBusiness[]>;
}

/**
 * Business service schema
 */
const BusinessServiceSchema = new Schema<IBusinessService>(
  {
    serviceId: { type: String, required: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: Object.values(BusinessServiceCategory),
      required: true,
    },
    basePrice: { type: Number, required: true, min: 0 },
    currentPrice: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 1 },
    isActive: { type: Boolean, default: true },
    requiredWorkerSpecialization: {
      type: String,
      enum: Object.values(WorkerSpecialization),
    },
    assignedWorkerId: { type: String },
    totalServiced: { type: Number, default: 0 },
    lastServicedAt: { type: Date },
  },
  { _id: false }
);

/**
 * Business product schema
 */
const BusinessProductSchema = new Schema<IBusinessProduct>(
  {
    productId: { type: String, required: true },
    itemId: { type: String, required: true },
    name: { type: String, required: true },
    currentPrice: { type: Number, required: true, min: 0 },
    stockLevel: { type: Number, default: 0, min: 0 },
    maxStock: { type: Number, default: 100, min: 1 },
    autoSellEnabled: { type: Boolean, default: false },
    autoRestockEnabled: { type: Boolean, default: false },
    restockThreshold: { type: Number, default: 10, min: 0 },
    totalSold: { type: Number, default: 0 },
  },
  { _id: false }
);

/**
 * Staff assignment schema
 */
const StaffAssignmentSchema = new Schema<IStaffAssignment>(
  {
    workerId: { type: String, required: true },
    workerName: { type: String, required: true },
    specialization: {
      type: String,
      enum: Object.values(WorkerSpecialization),
      required: true,
    },
    role: {
      type: String,
      enum: ['service', 'production', 'sales', 'management'],
      required: true,
    },
    serviceId: { type: String },
    productId: { type: String },
    efficiency: { type: Number, default: 1.0, min: 0.5, max: 2.0 },
    assignedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * Business reputation schema
 */
const BusinessReputationSchema = new Schema<IBusinessReputation>(
  {
    overall: { type: Number, default: 50, min: 0, max: 100 },
    serviceQuality: { type: Number, default: 50, min: 0, max: 100 },
    priceValue: { type: Number, default: 50, min: 0, max: 100 },
    availability: { type: Number, default: 50, min: 0, max: 100 },
    cleanliness: { type: Number, default: 50, min: 0, max: 100 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * Operating hours schema
 */
const OperatingHoursSchema = new Schema<IOperatingHours>(
  {
    mode: {
      type: String,
      enum: Object.values(OperatingHoursMode),
      default: OperatingHoursMode.ALWAYS_OPEN,
    },
    customSchedule: {
      open: { type: Number, min: 0, max: 23 },
      close: { type: Number, min: 0, max: 23 },
      daysOpen: [{ type: Number, min: 0, max: 6 }],
    },
  },
  { _id: false }
);

/**
 * Traffic stats schema
 */
const TrafficStatsSchema = new Schema<ITrafficStats>(
  {
    todayVisitors: { type: Number, default: 0 },
    todayRevenue: { type: Number, default: 0 },
    weeklyVisitors: { type: Number, default: 0 },
    weeklyRevenue: { type: Number, default: 0 },
    monthlyVisitors: { type: Number, default: 0 },
    monthlyRevenue: { type: Number, default: 0 },
    peakHour: { type: Number, default: 18, min: 0, max: 23 },
    averageSatisfaction: { type: Number, default: 50, min: 0, max: 100 },
  },
  { _id: false }
);

/**
 * Business schema definition
 */
const BusinessSchema = new Schema<IBusiness>(
  {
    // Links
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
    locationId: {
      type: String,
      required: true,
      index: true,
    },

    // Phase 15: Gang Ownership
    ownerType: {
      type: String,
      enum: ['individual', 'gang'],
      default: 'individual',
      index: true,
    },
    gangId: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
      index: true,
    },
    gangRole: {
      type: String,
      enum: ['operated', 'subsidiary'],
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
    },
    transferredAt: {
      type: Date,
    },
    transferredFrom: {
      type: Schema.Types.ObjectId,
    },
    revenueSharePercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },

    // Phase 15: Protection Status
    protection: {
      isProtected: { type: Boolean, default: false },
      gangId: { type: Schema.Types.ObjectId, ref: 'Gang' },
      tier: { type: String, enum: Object.values(ProtectionTier) },
      incidentReduction: { type: Number, default: 0, min: 0, max: 1 },
      reputationBoost: { type: Number, default: 0, min: 0, max: 100 },
    },

    // Identity
    businessType: {
      type: String,
      enum: Object.values(PlayerBusinessType),
      required: true,
      index: true,
    },
    businessName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    tier: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      default: 1,
    },

    // Status
    status: {
      type: String,
      enum: Object.values(PlayerBusinessStatus),
      default: PlayerBusinessStatus.ESTABLISHING,
      index: true,
    },
    establishedAt: {
      type: Date,
      default: Date.now,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    // Services
    services: {
      type: [BusinessServiceSchema],
      default: [],
    },

    // Products
    products: {
      type: [BusinessProductSchema],
      default: [],
    },

    // Staff
    staffAssignments: {
      type: [StaffAssignmentSchema],
      default: [],
    },
    maxStaff: {
      type: Number,
      default: 1,
      min: 0,
    },

    // Reputation
    reputation: {
      type: BusinessReputationSchema,
      default: () => ({
        overall: 50,
        serviceQuality: 50,
        priceValue: 50,
        availability: 50,
        cleanliness: 50,
        lastUpdated: new Date(),
      }),
    },

    // Operating Hours
    operatingHours: {
      type: OperatingHoursSchema,
      default: () => ({
        mode: OperatingHoursMode.ALWAYS_OPEN,
      }),
    },

    // Traffic & Revenue
    baseTrafficRate: {
      type: Number,
      required: true,
      min: 0,
    },
    currentTrafficRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    pendingRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastRevenueCollection: {
      type: Date,
      default: Date.now,
    },
    maxPendingRevenue: {
      type: Number,
      required: true,
      min: 0,
    },

    // Statistics
    totalCustomersServed: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    totalExpenses: {
      type: Number,
      default: 0,
    },
    trafficStats: {
      type: TrafficStatsSchema,
      default: () => ({
        todayVisitors: 0,
        todayRevenue: 0,
        weeklyVisitors: 0,
        weeklyRevenue: 0,
        monthlyVisitors: 0,
        monthlyRevenue: 0,
        peakHour: 18,
        averageSatisfaction: 50,
      }),
    },

    // P2P Transaction Settings
    allowPlayerCustomers: {
      type: Boolean,
      default: true,
    },
    playerServicePremium: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
BusinessSchema.index({ characterId: 1, status: 1 });
BusinessSchema.index({ locationId: 1, status: 1, businessType: 1 });
BusinessSchema.index({ propertyId: 1 }, { unique: true });
BusinessSchema.index({ status: 1, lastActiveAt: 1 });
BusinessSchema.index({ 'reputation.overall': -1 }); // For sorting by reputation

// Phase 15: Gang ownership indexes
BusinessSchema.index({ gangId: 1, ownerType: 1, status: 1 }); // Find gang businesses
BusinessSchema.index({ gangId: 1, locationId: 1, status: 1 }); // Gang businesses by zone
BusinessSchema.index({ 'protection.isProtected': 1, 'protection.gangId': 1 }); // Protected businesses

/**
 * Pre-save middleware to calculate current traffic rate
 */
BusinessSchema.pre('save', function (next) {
  if (this.isModified('reputation') || this.isModified('tier') || this.isNew) {
    this.currentTrafficRate = this.calculateTrafficRate();
  }
  next();
});

/**
 * Instance method: Check if business is currently open
 */
BusinessSchema.methods.isOpen = function (this: IBusiness): boolean {
  if (this.status !== PlayerBusinessStatus.ACTIVE) return false;

  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();

  switch (this.operatingHours.mode) {
    case OperatingHoursMode.ALWAYS_OPEN:
      return true;
    case OperatingHoursMode.DAY_ONLY:
      return currentHour >= 6 && currentHour < 22;
    case OperatingHoursMode.NIGHT_ONLY:
      return currentHour >= 20 || currentHour < 6;
    case OperatingHoursMode.CUSTOM:
      if (!this.operatingHours.customSchedule) return true;
      const { open, close, daysOpen } = this.operatingHours.customSchedule;
      if (daysOpen && !daysOpen.includes(currentDay)) return false;
      if (open !== undefined && close !== undefined) {
        if (open <= close) {
          return currentHour >= open && currentHour < close;
        } else {
          // Spans midnight
          return currentHour >= open || currentHour < close;
        }
      }
      return true;
    default:
      return true;
  }
};

/**
 * Instance method: Get business category
 */
BusinessSchema.methods.getCategory = function (this: IBusiness): PlayerBusinessCategory {
  const typeInfo = BUSINESS_TYPE_INFO[this.businessType];
  return typeInfo?.category ?? PlayerBusinessCategory.SERVICE;
};

/**
 * Instance method: Calculate current traffic rate
 */
BusinessSchema.methods.calculateTrafficRate = function (this: IBusiness): number {
  const tierInfo = BUSINESS_TIER_INFO[this.tier as BusinessTier];
  if (!tierInfo) return this.baseTrafficRate;

  // Base traffic × tier multiplier × reputation modifier
  const reputationModifier = 0.25 + (this.reputation.overall / 100) * 1.25; // 0.25 to 1.5

  return Math.floor(
    this.baseTrafficRate * tierInfo.trafficMultiplier * reputationModifier
  );
};

/**
 * Instance method: Update reputation scores
 */
BusinessSchema.methods.updateReputation = function (
  this: IBusiness,
  serviceQuality: number,
  priceValue: number,
  availability: number
): void {
  // Weighted rolling average (80% old, 20% new)
  const DECAY = 0.8;
  const NEW_WEIGHT = 0.2;

  this.reputation.serviceQuality = Math.min(100, Math.max(0,
    this.reputation.serviceQuality * DECAY + serviceQuality * NEW_WEIGHT
  ));
  this.reputation.priceValue = Math.min(100, Math.max(0,
    this.reputation.priceValue * DECAY + priceValue * NEW_WEIGHT
  ));
  this.reputation.availability = Math.min(100, Math.max(0,
    this.reputation.availability * DECAY + availability * NEW_WEIGHT
  ));

  // Calculate overall as weighted average
  this.reputation.overall = Math.round(
    this.reputation.serviceQuality * 0.4 +
    this.reputation.priceValue * 0.3 +
    this.reputation.availability * 0.2 +
    this.reputation.cleanliness * 0.1
  );

  this.reputation.lastUpdated = new Date();
};

/**
 * Instance method: Add revenue to pending balance
 */
BusinessSchema.methods.addRevenue = function (this: IBusiness, amount: number): void {
  this.pendingRevenue = Math.min(
    this.pendingRevenue + amount,
    this.maxPendingRevenue
  );
  this.totalRevenue += amount;
  this.lastActiveAt = new Date();
};

/**
 * Instance method: Collect pending revenue
 */
BusinessSchema.methods.collectRevenue = function (this: IBusiness): number {
  const collected = this.pendingRevenue;
  this.pendingRevenue = 0;
  this.lastRevenueCollection = new Date();
  return collected;
};

/**
 * Instance method: Assign staff to business
 */
BusinessSchema.methods.assignStaff = function (
  this: IBusiness,
  assignment: IStaffAssignment
): void {
  if (this.staffAssignments.length >= this.maxStaff) {
    throw new Error('Maximum staff capacity reached');
  }

  // Check if worker is already assigned
  const existing = this.staffAssignments.find(s => s.workerId === assignment.workerId);
  if (existing) {
    throw new Error('Worker is already assigned to this business');
  }

  this.staffAssignments.push(assignment);
};

/**
 * Instance method: Remove staff from business
 */
BusinessSchema.methods.removeStaff = function (this: IBusiness, workerId: string): void {
  const index = this.staffAssignments.findIndex(s => s.workerId === workerId);
  if (index === -1) {
    throw new Error('Worker not found in business staff');
  }

  // Also unassign from any services
  const worker = this.staffAssignments[index];
  if (worker.serviceId) {
    const service = this.services.find(s => s.serviceId === worker.serviceId);
    if (service) {
      service.assignedWorkerId = undefined;
    }
  }

  this.staffAssignments.splice(index, 1);
};

/**
 * Instance method: Set service price
 */
BusinessSchema.methods.setServicePrice = function (
  this: IBusiness,
  serviceId: string,
  price: number
): void {
  const service = this.services.find(s => s.serviceId === serviceId);
  if (!service) {
    throw new Error('Service not found');
  }
  service.currentPrice = Math.max(0, price);
};

/**
 * Instance method: Toggle service active state
 */
BusinessSchema.methods.toggleService = function (
  this: IBusiness,
  serviceId: string,
  isActive: boolean
): void {
  const service = this.services.find(s => s.serviceId === serviceId);
  if (!service) {
    throw new Error('Service not found');
  }
  service.isActive = isActive;
};

/**
 * Instance method: Set product price
 */
BusinessSchema.methods.setProductPrice = function (
  this: IBusiness,
  productId: string,
  price: number
): void {
  const product = this.products.find(p => p.productId === productId);
  if (!product) {
    throw new Error('Product not found');
  }
  product.currentPrice = Math.max(0, price);
};

/**
 * Instance method: Update product stock level
 */
BusinessSchema.methods.updateStock = function (
  this: IBusiness,
  productId: string,
  quantity: number
): void {
  const product = this.products.find(p => p.productId === productId);
  if (!product) {
    throw new Error('Product not found');
  }
  product.stockLevel = Math.max(0, Math.min(product.stockLevel + quantity, product.maxStock));
};

/**
 * Instance method: Record a customer visit
 */
BusinessSchema.methods.recordCustomer = function (
  this: IBusiness,
  isNPC: boolean,
  revenue: number,
  satisfaction: number
): void {
  this.totalCustomersServed++;
  this.trafficStats.todayVisitors++;
  this.trafficStats.todayRevenue += revenue;
  this.trafficStats.weeklyVisitors++;
  this.trafficStats.weeklyRevenue += revenue;
  this.trafficStats.monthlyVisitors++;
  this.trafficStats.monthlyRevenue += revenue;

  // Update average satisfaction (rolling average)
  const totalSatisfaction = this.trafficStats.averageSatisfaction *
    (this.totalCustomersServed - 1) + satisfaction;
  this.trafficStats.averageSatisfaction = Math.round(
    totalSatisfaction / this.totalCustomersServed
  );

  this.lastActiveAt = new Date();
};

/**
 * Instance method: Apply reputation decay for inactive business
 */
BusinessSchema.methods.applyReputationDecay = function (this: IBusiness): void {
  const tierInfo = BUSINESS_TIER_INFO[this.tier as BusinessTier];
  const decayRate = tierInfo?.reputationDecayRate ?? 1;

  this.reputation.serviceQuality = Math.max(0, this.reputation.serviceQuality - decayRate);
  this.reputation.priceValue = Math.max(0, this.reputation.priceValue - decayRate);
  this.reputation.availability = Math.max(0, this.reputation.availability - decayRate * 2);
  this.reputation.cleanliness = Math.max(0, this.reputation.cleanliness - decayRate);

  // Recalculate overall
  this.reputation.overall = Math.round(
    this.reputation.serviceQuality * 0.4 +
    this.reputation.priceValue * 0.3 +
    this.reputation.availability * 0.2 +
    this.reputation.cleanliness * 0.1
  );

  this.reputation.lastUpdated = new Date();
};

/**
 * Instance method: Sync business tier with property tier
 */
BusinessSchema.methods.syncWithPropertyTier = function (
  this: IBusiness,
  tier: BusinessTier
): void {
  this.tier = tier;

  const tierInfo = BUSINESS_TIER_INFO[tier];
  if (tierInfo) {
    this.maxStaff = tierInfo.maxStaff;
    this.maxPendingRevenue = BUSINESS_REVENUE_TARGETS[tier].maxPending;
  }

  // Recalculate traffic rate
  this.currentTrafficRate = this.calculateTrafficRate();
};

/**
 * Phase 15: Instance method: Check if business is gang-owned
 */
BusinessSchema.methods.isGangOwned = function (this: IBusiness): boolean {
  return this.ownerType === 'gang' && !!this.gangId;
};

/**
 * Phase 15: Instance method: Get ownership information
 */
BusinessSchema.methods.getOwnershipInfo = function (this: IBusiness): IBusinessOwnershipInfo {
  return {
    type: this.ownerType,
    ownerId: this.ownerType === 'gang' && this.gangId
      ? this.gangId.toString()
      : this.characterId.toString(),
    managerId: this.managerId?.toString(),
    gangRole: this.gangRole,
    revenueSharePercent: this.revenueSharePercent,
  };
};

/**
 * Phase 15: Instance method: Check if business can be transferred to a gang
 */
BusinessSchema.methods.canBeTransferredToGang = function (this: IBusiness): boolean {
  // Only individual-owned businesses can be transferred
  if (this.ownerType !== 'individual') {
    return false;
  }

  // Must be in ACTIVE status
  if (this.status !== PlayerBusinessStatus.ACTIVE) {
    return false;
  }

  // Must not have too much pending revenue (prevents exploit)
  if (this.pendingRevenue > GANG_BUSINESS_CONSTANTS.MAX_PENDING_FOR_TRANSFER) {
    return false;
  }

  return true;
};

/**
 * Phase 15: Instance method: Calculate gang revenue share
 */
BusinessSchema.methods.calculateGangRevenueShare = function (
  this: IBusiness,
  totalRevenue: number
): IGangRevenueShare {
  if (this.ownerType !== 'gang') {
    return {
      gangShare: 0,
      managerShare: totalRevenue,
      totalAmount: totalRevenue,
    };
  }

  const sharePercent = this.revenueSharePercent ?? 100;
  const gangShare = Math.floor(totalRevenue * (sharePercent / 100));
  const managerShare = totalRevenue - gangShare;

  return {
    gangShare,
    managerShare,
    totalAmount: totalRevenue,
  };
};

/**
 * Phase 15: Instance method: Get protection status
 */
BusinessSchema.methods.getProtectionStatus = function (this: IBusiness): IBusinessProtectionStatus {
  if (!this.protection?.isProtected) {
    return {
      isProtected: false,
      incidentReduction: 0,
      reputationBoost: 0,
      raidProtection: false,
    };
  }

  return {
    isProtected: true,
    gangId: this.protection.gangId?.toString(),
    tier: this.protection.tier,
    incidentReduction: this.protection.incidentReduction,
    reputationBoost: this.protection.reputationBoost,
    raidProtection: this.protection.tier === ProtectionTier.STANDARD ||
                    this.protection.tier === ProtectionTier.PREMIUM,
  };
};

/**
 * Static method: Find all businesses owned by a character
 */
BusinessSchema.statics.findByOwner = async function (
  characterId: string
): Promise<IBusiness[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId),
    status: { $in: [PlayerBusinessStatus.ACTIVE, PlayerBusinessStatus.ESTABLISHING] },
  }).sort({ establishedAt: -1 });
};

/**
 * Static method: Find business by property ID
 */
BusinessSchema.statics.findByProperty = async function (
  propertyId: string
): Promise<IBusiness | null> {
  return this.findOne({
    propertyId: new mongoose.Types.ObjectId(propertyId),
  });
};

/**
 * Static method: Find all businesses at a location
 */
BusinessSchema.statics.findByLocation = async function (
  locationId: string
): Promise<IBusiness[]> {
  return this.find({
    locationId,
    status: PlayerBusinessStatus.ACTIVE,
  }).sort({ 'reputation.overall': -1 });
};

/**
 * Static method: Find all active businesses
 */
BusinessSchema.statics.findActiveBusinesses = async function (): Promise<IBusiness[]> {
  return this.find({
    status: PlayerBusinessStatus.ACTIVE,
  });
};

/**
 * Static method: Find businesses by type
 */
BusinessSchema.statics.findByType = async function (
  businessType: PlayerBusinessType
): Promise<IBusiness[]> {
  return this.find({
    businessType,
    status: PlayerBusinessStatus.ACTIVE,
  }).sort({ 'reputation.overall': -1 });
};

/**
 * Phase 15: Static method: Find all businesses owned by a gang
 */
BusinessSchema.statics.findByGang = async function (
  gangId: mongoose.Types.ObjectId
): Promise<IBusiness[]> {
  return this.find({
    gangId,
    ownerType: 'gang',
    status: { $in: [PlayerBusinessStatus.ACTIVE, PlayerBusinessStatus.ESTABLISHING] },
  }).sort({ establishedAt: -1 });
};

/**
 * Phase 15: Static method: Find gang businesses in a specific zone
 */
BusinessSchema.statics.findGangBusinessesByZone = async function (
  gangId: mongoose.Types.ObjectId,
  zoneId: string
): Promise<IBusiness[]> {
  return this.find({
    gangId,
    ownerType: 'gang',
    locationId: zoneId,
    status: PlayerBusinessStatus.ACTIVE,
  }).sort({ 'reputation.overall': -1 });
};

/**
 * Phase 15: Static method: Count businesses owned by a gang
 */
BusinessSchema.statics.countGangBusinesses = async function (
  gangId: mongoose.Types.ObjectId
): Promise<number> {
  return this.countDocuments({
    gangId,
    ownerType: 'gang',
    status: { $in: [PlayerBusinessStatus.ACTIVE, PlayerBusinessStatus.ESTABLISHING] },
  });
};

/**
 * Phase 15: Static method: Find businesses protected by a gang
 */
BusinessSchema.statics.findProtectedBusinesses = async function (
  gangId: mongoose.Types.ObjectId
): Promise<IBusiness[]> {
  return this.find({
    'protection.isProtected': true,
    'protection.gangId': gangId,
    status: PlayerBusinessStatus.ACTIVE,
  }).sort({ 'reputation.overall': -1 });
};

/**
 * Business model
 */
export const Business = mongoose.model<IBusiness, IBusinessModel>(
  'Business',
  BusinessSchema
);
