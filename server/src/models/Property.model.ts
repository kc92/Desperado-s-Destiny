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
  InsuranceLevel,
  GuardSkillTier,
  RaidOutcome,
  IPropertyGuard,
  IRaidHistoryEntry,
  PROPERTY_DEFENSE,
  GUARD_TIERS,
  // Phase 14: Decay System
  ConditionTier,
  CONDITION_TIERS,
  PROPERTY_DECAY,
  getConditionTier,
  getIncomeMultiplier,
  getUpkeepMultiplier,
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

  // Income (Phase 7)
  lastIncomeCollection?: Date;
  incomeModifiers?: Array<{
    source: string; // 'upgrade', 'event', 'territory'
    modifier: number;
    expiresAt?: Date;
  }>;

  // Maintenance (Phase 14: Decay System)
  lastMaintenanceAt?: Date;

  // Production
  productionSlots: ProductionSlot[];

  // Status
  status: PropertyStatus;

  // Defense System (Phase 2.3 - Raid System)
  defenseLevel: number;
  guards: IPropertyGuard[];
  maxGuards: number;
  insuranceLevel: InsuranceLevel;
  insurancePaidUntil?: Date;
  lastRaidAt?: Date;
  raidImmunityUntil?: Date;
  raidHistory: IRaidHistoryEntry[];

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

  // Defense methods (Phase 2.3)
  calculateDefenseLevel(): number;
  isRaidImmune(): boolean;
  hireGuard(guard: IPropertyGuard): void;
  fireGuard(guardId: string): void;
  getAvailableGuardSlots(): number;
  setInsurance(level: InsuranceLevel): void;
  addRaidToHistory(entry: IRaidHistoryEntry): void;

  // Decay methods (Phase 14)
  getConditionTier(): ConditionTier;
  getIncomeMultiplier(): number;
  getUpkeepMultiplier(): number;
  getDaysSinceLastMaintenance(): number;
  getDecayReductions(): number[];
  performMaintenance(): void;
  calculateRepairCost(targetCondition?: number): number;
  repair(targetCondition: number): void;
  shouldWarnAboutCondition(): boolean;
  isConditionCritical(): boolean;
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
 * Property guard schema (Phase 2.3 - Raid System)
 */
const PropertyGuardSchema = new Schema<IPropertyGuard>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    skillTier: {
      type: String,
      enum: Object.values(GuardSkillTier),
      required: true,
    },
    defense: { type: Number, required: true, min: 0 },
    dailyWage: { type: Number, required: true, min: 0 },
    hiredAt: { type: Date, required: true },
    loyalty: { type: Number, default: 100, min: 0, max: 100 },
  },
  { _id: false }
);

/**
 * Raid history entry schema (Phase 2.3 - Raid System)
 */
const RaidHistoryEntrySchema = new Schema<IRaidHistoryEntry>(
  {
    raidId: { type: String, required: true },
    attackingGangId: { type: String, required: true },
    attackingGangName: { type: String, required: true },
    outcome: {
      type: String,
      enum: Object.values(RaidOutcome),
      required: true,
    },
    damageReceived: { type: Number, required: true },
    date: { type: Date, required: true },
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

    // Income (Phase 7)
    lastIncomeCollection: {
      type: Date,
    },
    incomeModifiers: {
      type: [
        {
          source: { type: String, required: true },
          modifier: { type: Number, required: true },
          expiresAt: { type: Date },
        },
      ],
      default: [],
    },

    // Maintenance (Phase 14: Decay System)
    lastMaintenanceAt: {
      type: Date,
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

    // Defense System (Phase 2.3 - Raid System)
    defenseLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    guards: {
      type: [PropertyGuardSchema],
      default: [],
    },
    maxGuards: {
      type: Number,
      default: PROPERTY_DEFENSE.MAX_GUARDS_STANDARD,
      min: 0,
    },
    insuranceLevel: {
      type: String,
      enum: Object.values(InsuranceLevel),
      default: InsuranceLevel.NONE,
    },
    insurancePaidUntil: {
      type: Date,
    },
    lastRaidAt: {
      type: Date,
    },
    raidImmunityUntil: {
      type: Date,
      index: true,
    },
    raidHistory: {
      type: [RaidHistoryEntrySchema],
      default: [],
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
PropertySchema.index({ condition: 1, status: 1 }); // For decay processing (Phase 14)
PropertySchema.index({ lastMaintenanceAt: 1, status: 1 }); // For neglected properties (Phase 14)

/**
 * Instance method: Calculate total weekly upkeep including workers
 * Phase 14: Applies upkeep multiplier based on condition tier
 */
PropertySchema.methods.calculateTotalUpkeep = function (this: IProperty): number {
  const workerWages = this.workers
    .filter((w) => w.isActive)
    .reduce((sum, worker) => sum + worker.dailyWage * 7, 0);

  const baseUpkeep = this.weeklyUpkeep + workerWages;

  // Apply condition-based upkeep multiplier (Phase 14: Decay System)
  // Poor condition = higher upkeep costs (repairs, inefficiency)
  // EXCELLENT: -10%, GOOD: no change, FAIR: +10%, POOR: +30%, DEGRADED: +100%
  const upkeepMultiplier = this.getUpkeepMultiplier();

  return Math.ceil(baseUpkeep * upkeepMultiplier);
};

/**
 * Instance method: Check if owner can afford upkeep
 */
PropertySchema.methods.canAffordUpkeep = function (this: IProperty): boolean {
  // This will be called from the service layer which has access to character
  return true; // Placeholder
};

/**
 * Instance method: Apply condition decay (Phase 14 Enhanced)
 *
 * Daily decay rate: 0.5% base, accelerating when neglected
 * - 7+ days without maintenance: decay multiplier compounds
 * - Upgrades can reduce decay rate
 * - Status changes at condition thresholds
 */
PropertySchema.methods.applyConditionDecay = function (this: IProperty): void {
  // Get days since last maintenance
  const daysSinceLastMaintenance = this.getDaysSinceLastMaintenance();

  // Calculate decay rate with modifiers
  let decayRate = PROPERTY_DECAY.BASE_DAILY_DECAY_RATE;

  // Apply neglect multiplier if over threshold
  if (daysSinceLastMaintenance > PROPERTY_DECAY.NEGLECT_THRESHOLD_DAYS) {
    const neglectDays = daysSinceLastMaintenance - PROPERTY_DECAY.NEGLECT_THRESHOLD_DAYS;
    decayRate *= Math.pow(PROPERTY_DECAY.NEGLECT_DECAY_MULTIPLIER, neglectDays);
  }

  // Apply decay reductions from upgrades
  const reductions = this.getDecayReductions();
  const totalReduction = reductions.reduce((sum: number, r: number) => sum + r, 0);
  decayRate *= Math.max(0.1, 1 - totalReduction); // Minimum 10% of base rate

  // Apply decay
  this.condition = Math.max(0, this.condition - decayRate);

  // Update status based on condition thresholds
  if (this.condition <= PROPERTY_DECAY.CONDITION_STATUS_THRESHOLDS.ABANDONED) {
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
 * Phase 14: Uses tier-based condition multipliers for more impactful condition effects
 */
PropertySchema.methods.calculateWeeklyIncome = function (this: IProperty): number {
  // Base income calculation - to be enhanced with property-specific logic
  let baseIncome = 0;

  // Income varies by property type and tier
  const tierMultiplier = this.tier;

  // Base income per property type
  switch (this.propertyType) {
    case 'ranch':
      baseIncome = 50 * tierMultiplier;
      break;
    case 'shop':
      baseIncome = 75 * tierMultiplier;
      break;
    case 'workshop':
      baseIncome = 60 * tierMultiplier;
      break;
    case 'mine':
      baseIncome = 100 * tierMultiplier;
      break;
    case 'saloon':
      baseIncome = 120 * tierMultiplier;
      break;
    case 'stable':
      baseIncome = 70 * tierMultiplier;
      break;
    default:
      baseIncome = 0;
  }

  // Apply condition tier multiplier (Phase 14: Decay System)
  // EXCELLENT: +10% bonus, GOOD: no change, FAIR: -15%, POOR: -40%, DEGRADED: -75%
  const conditionMultiplier = this.getIncomeMultiplier();

  return Math.floor(baseIncome * conditionMultiplier);
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
 * Instance method: Calculate defense level (Phase 2.3)
 */
PropertySchema.methods.calculateDefenseLevel = function (this: IProperty): number {
  let defense = 0;

  // Base defense from property type
  defense += this.propertyType === 'ranch'
    ? PROPERTY_DEFENSE.BASE_DEFENSE + PROPERTY_DEFENSE.RANCH_DEFENSE_BONUS
    : PROPERTY_DEFENSE.BASE_DEFENSE;

  // Guards contribution (with loyalty modifier)
  for (const guard of this.guards) {
    const loyaltyMultiplier = guard.loyalty / 100;
    defense += guard.defense * loyaltyMultiplier;
  }

  // Security upgrades
  const securityUpgrade = this.upgrades.find(
    (u: PropertyUpgrade) => u.upgradeType === 'security_system'
  );
  if (securityUpgrade) {
    defense += securityUpgrade.level * PROPERTY_DEFENSE.SECURITY_UPGRADE_DEFENSE;
  }

  // Bouncer upgrade
  const bouncerUpgrade = this.upgrades.find(
    (u: PropertyUpgrade) => u.upgradeType === 'bouncer'
  );
  if (bouncerUpgrade) {
    defense += bouncerUpgrade.level * PROPERTY_DEFENSE.BOUNCER_UPGRADE_DEFENSE;
  }

  // Update stored defense level
  this.defenseLevel = Math.min(defense, PROPERTY_DEFENSE.MAX_DEFENSE_LEVEL);
  return this.defenseLevel;
};

/**
 * Instance method: Check if property has raid immunity (Phase 2.3)
 */
PropertySchema.methods.isRaidImmune = function (this: IProperty): boolean {
  if (!this.raidImmunityUntil) return false;
  return new Date() < this.raidImmunityUntil;
};

/**
 * Instance method: Hire a guard (Phase 2.3)
 */
PropertySchema.methods.hireGuard = function (this: IProperty, guard: IPropertyGuard): void {
  if (this.guards.length >= this.maxGuards) {
    throw new Error('Maximum guards reached');
  }
  this.guards.push(guard);
  this.calculateDefenseLevel();
};

/**
 * Instance method: Fire a guard (Phase 2.3)
 */
PropertySchema.methods.fireGuard = function (this: IProperty, guardId: string): void {
  const guardIndex = this.guards.findIndex((g: IPropertyGuard) => g.id === guardId);
  if (guardIndex === -1) {
    throw new Error('Guard not found');
  }
  this.guards.splice(guardIndex, 1);
  this.calculateDefenseLevel();
};

/**
 * Instance method: Get available guard slots (Phase 2.3)
 */
PropertySchema.methods.getAvailableGuardSlots = function (this: IProperty): number {
  return Math.max(0, this.maxGuards - this.guards.length);
};

/**
 * Instance method: Set insurance level (Phase 2.3)
 */
PropertySchema.methods.setInsurance = function (this: IProperty, level: InsuranceLevel): void {
  this.insuranceLevel = level;
  if (level !== InsuranceLevel.NONE) {
    // Set insurance paid until one week from now
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    this.insurancePaidUntil = new Date(Date.now() + oneWeek);
  } else {
    this.insurancePaidUntil = undefined;
  }
};

/**
 * Instance method: Add raid to history (Phase 2.3)
 */
PropertySchema.methods.addRaidToHistory = function (this: IProperty, entry: IRaidHistoryEntry): void {
  this.raidHistory.unshift(entry);
  // Keep only the last 20 entries
  if (this.raidHistory.length > 20) {
    this.raidHistory = this.raidHistory.slice(0, 20);
  }
};

// ============================================================================
// PHASE 14: DECAY SYSTEM METHODS
// ============================================================================

/**
 * Instance method: Get condition tier label
 */
PropertySchema.methods.getConditionTier = function (this: IProperty): ConditionTier {
  return getConditionTier(this.condition);
};

/**
 * Instance method: Get income multiplier based on condition tier
 */
PropertySchema.methods.getIncomeMultiplier = function (this: IProperty): number {
  return getIncomeMultiplier(this.condition);
};

/**
 * Instance method: Get upkeep multiplier based on condition tier
 */
PropertySchema.methods.getUpkeepMultiplier = function (this: IProperty): number {
  return getUpkeepMultiplier(this.condition);
};

/**
 * Instance method: Get days since last maintenance
 */
PropertySchema.methods.getDaysSinceLastMaintenance = function (this: IProperty): number {
  if (!this.lastMaintenanceAt) {
    // If never maintained, use purchase date or creation date
    const referenceDate = this.purchaseDate || this.createdAt || new Date();
    const now = new Date();
    return Math.floor((now.getTime() - referenceDate.getTime()) / (24 * 60 * 60 * 1000));
  }

  const now = new Date();
  return Math.floor((now.getTime() - this.lastMaintenanceAt.getTime()) / (24 * 60 * 60 * 1000));
};

/**
 * Instance method: Get decay reduction percentages from upgrades
 */
PropertySchema.methods.getDecayReductions = function (this: IProperty): number[] {
  const reductions: number[] = [];

  for (const upgrade of this.upgrades) {
    const reductionRate = PROPERTY_DECAY.UPGRADE_DECAY_REDUCTION[upgrade.upgradeType];
    if (reductionRate) {
      reductions.push(reductionRate * upgrade.level);
    }
  }

  return reductions;
};

/**
 * Instance method: Perform maintenance action
 * Gains small condition improvement and resets neglect timer
 */
PropertySchema.methods.performMaintenance = function (this: IProperty): void {
  // Cap condition gain based on maintenance (can't exceed MAX_CONDITION_FROM_MAINTENANCE)
  const maxFromMaintenance = PROPERTY_DECAY.MAX_CONDITION_FROM_MAINTENANCE;
  const potentialCondition = this.condition + PROPERTY_DECAY.MAINTENANCE_CONDITION_GAIN;
  this.condition = Math.min(maxFromMaintenance, potentialCondition);

  // Reset maintenance timer
  this.lastMaintenanceAt = new Date();

  // Reactivate if was abandoned but now above threshold
  if (this.status === PropertyStatus.ABANDONED && this.condition > PROPERTY_DECAY.ABANDON_THRESHOLD) {
    this.status = PropertyStatus.ACTIVE;
  }
};

/**
 * Instance method: Calculate cost to repair to target condition
 */
PropertySchema.methods.calculateRepairCost = function (this: IProperty, targetCondition?: number): number {
  const target = targetCondition ?? 100;
  const pointsToRepair = Math.max(0, target - this.condition);

  if (pointsToRepair === 0) return 0;

  const costPerPoint = PROPERTY_DECAY.REPAIR_COST_PER_POINT[this.tier] ||
    PROPERTY_DECAY.REPAIR_COST_PER_POINT[1];

  return Math.ceil(pointsToRepair * costPerPoint);
};

/**
 * Instance method: Repair property to target condition
 * Note: Cost deduction should be handled by the calling service
 */
PropertySchema.methods.repair = function (this: IProperty, targetCondition: number): void {
  this.condition = Math.min(100, Math.max(this.condition, targetCondition));

  // Also update maintenance timestamp
  this.lastMaintenanceAt = new Date();

  // Reactivate if was abandoned/foreclosed
  if (this.status === PropertyStatus.ABANDONED || this.status === PropertyStatus.FORECLOSED) {
    if (this.condition > PROPERTY_DECAY.ABANDON_THRESHOLD) {
      this.status = PropertyStatus.ACTIVE;
    }
  }
};

/**
 * Instance method: Check if condition warrants a warning
 */
PropertySchema.methods.shouldWarnAboutCondition = function (this: IProperty): boolean {
  return this.condition <= PROPERTY_DECAY.CONDITION_STATUS_THRESHOLDS.WARNING;
};

/**
 * Instance method: Check if condition is critical
 */
PropertySchema.methods.isConditionCritical = function (this: IProperty): boolean {
  return this.condition <= PROPERTY_DECAY.CONDITION_STATUS_THRESHOLDS.CRITICAL;
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
