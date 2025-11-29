/**
 * Gang Base Model
 *
 * Mongoose schema for gang headquarters/bases in Desperados Destiny
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  BaseTier,
  BaseLocationType,
  FacilityType,
  BaseUpgradeType,
  LocationBonus,
  BASE_TIER_INFO,
  BASE_LOCATION_INFO,
  BASE_CONSTRAINTS,
} from '@desperados/shared';

/**
 * Guard subdocument interface
 */
export interface IGuard {
  guardId: string;
  name: string;
  level: number;
  combatSkill: number;
  hireCost: number;
  upkeepCost: number;
  isActive: boolean;
  hiredAt: Date;
}

/**
 * Trap subdocument interface
 */
export interface ITrap {
  trapId: string;
  type: 'alarm' | 'damage' | 'slow' | 'capture';
  name: string;
  effectiveness: number;
  cost: number;
  isActive: boolean;
  installedAt: Date;
}

/**
 * Defense system subdocument interface
 */
export interface IDefenseSystem {
  guards: IGuard[];
  traps: ITrap[];
  alarmLevel: number;
  escapeRoutes: number;
  overallDefense: number;
  lastAttacked?: Date;
  raidHistory: number;
}

/**
 * Storage item subdocument interface
 */
export interface IStorageItem {
  itemId: string;
  itemName: string;
  quantity: number;
  addedBy: mongoose.Types.ObjectId;
  addedAt: Date;
}

/**
 * Gang storage subdocument interface
 */
export interface IGangStorage {
  items: IStorageItem[];
  capacity: number;
  currentUsage: number;
  categories: {
    weapons: IStorageItem[];
    supplies: IStorageItem[];
    valuables: IStorageItem[];
    materials: IStorageItem[];
  };
}

/**
 * Base location subdocument interface
 */
export interface IBaseLocation {
  region: string;
  coordinates?: {
    x: number;
    y: number;
  };
  locationType: BaseLocationType;
  bonuses: LocationBonus[];
}

/**
 * Facility subdocument interface
 */
export interface IFacility {
  facilityType: FacilityType;
  level: number;
  isActive: boolean;
  installedAt: Date;
  lastUpgraded?: Date;
}

/**
 * Base upgrade subdocument interface
 */
export interface IBaseUpgrade {
  upgradeType: BaseUpgradeType;
  isActive: boolean;
  installedAt: Date;
}

/**
 * Gang base document interface
 */
export interface IGangBase extends Document {
  gangId: mongoose.Types.ObjectId;
  tier: BaseTier;
  tierName: string;
  location: IBaseLocation;
  storage: IGangStorage;
  facilities: IFacility[];
  upgrades: IBaseUpgrade[];
  defense: IDefenseSystem;
  capacity: number;
  currentOccupants: number;
  createdAt: Date;
  lastUpgraded?: Date;
  isActive: boolean;

  // Instance methods
  calculateDefenseRating(): number;
  canUpgradeTier(): boolean;
  getUpgradeTierCost(): number;
  hasFacility(facilityType: FacilityType): boolean;
  hasUpgrade(upgradeType: BaseUpgradeType): boolean;
  canAddFacility(facilityType: FacilityType): boolean;
  canAddUpgrade(upgradeType: BaseUpgradeType): boolean;
  addFacility(facilityType: FacilityType): void;
  addUpgrade(upgradeType: BaseUpgradeType): void;
  addStorageItem(itemId: string, itemName: string, quantity: number, addedBy: mongoose.Types.ObjectId): void;
  removeStorageItem(itemId: string, quantity: number): void;
  getStorageItem(itemId: string): IStorageItem | undefined;
  calculateStorageUsage(): number;
  hireGuard(guardName: string, level: number, combatSkill: number): IGuard;
  fireGuard(guardId: string): void;
  installTrap(trapType: 'alarm' | 'damage' | 'slow' | 'capture', effectiveness: number, cost: number): ITrap;
  removeTrap(trapId: string): void;
  upgradeTier(): void;
  getLocationBonuses(): LocationBonus[];
  toSafeObject(): Record<string, unknown>;
}

/**
 * Gang base model static methods
 */
export interface IGangBaseModel extends Model<IGangBase> {
  findByGangId(gangId: string | mongoose.Types.ObjectId): Promise<IGangBase | null>;
  findActiveBases(): Promise<IGangBase[]>;
}

/**
 * Guard schema
 */
const GuardSchema = new Schema<IGuard>(
  {
    guardId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 50,
    },
    combatSkill: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    hireCost: {
      type: Number,
      required: true,
      min: 0,
    },
    upkeepCost: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    hiredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/**
 * Trap schema
 */
const TrapSchema = new Schema<ITrap>(
  {
    trapId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['alarm', 'damage', 'slow', 'capture'],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    effectiveness: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    installedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/**
 * Defense system schema
 */
const DefenseSystemSchema = new Schema<IDefenseSystem>(
  {
    guards: {
      type: [GuardSchema],
      default: [],
    },
    traps: {
      type: [TrapSchema],
      default: [],
    },
    alarmLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    escapeRoutes: {
      type: Number,
      default: 1,
      min: 0,
      max: 5,
    },
    overallDefense: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastAttacked: {
      type: Date,
    },
    raidHistory: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

/**
 * Storage item schema
 */
const StorageItemSchema = new Schema<IStorageItem>(
  {
    itemId: {
      type: String,
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/**
 * Gang storage schema
 */
const GangStorageSchema = new Schema<IGangStorage>(
  {
    items: {
      type: [StorageItemSchema],
      default: [],
    },
    capacity: {
      type: Number,
      required: true,
      min: 0,
    },
    currentUsage: {
      type: Number,
      default: 0,
      min: 0,
    },
    categories: {
      weapons: {
        type: [StorageItemSchema],
        default: [],
      },
      supplies: {
        type: [StorageItemSchema],
        default: [],
      },
      valuables: {
        type: [StorageItemSchema],
        default: [],
      },
      materials: {
        type: [StorageItemSchema],
        default: [],
      },
    },
  },
  { _id: false }
);

/**
 * Base location schema
 */
const BaseLocationSchema = new Schema<IBaseLocation>(
  {
    region: {
      type: String,
      required: true,
    },
    coordinates: {
      x: { type: Number },
      y: { type: Number },
    },
    locationType: {
      type: String,
      enum: Object.values(BaseLocationType),
      required: true,
    },
    bonuses: [
      {
        type: {
          type: String,
          enum: ['crime_success', 'law_detection', 'escape_chance', 'recruitment', 'defense', 'accessibility'],
          required: true,
        },
        value: {
          type: Number,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { _id: false }
);

/**
 * Facility schema
 */
const FacilitySchema = new Schema<IFacility>(
  {
    facilityType: {
      type: String,
      enum: Object.values(FacilityType),
      required: true,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    installedAt: {
      type: Date,
      default: Date.now,
    },
    lastUpgraded: {
      type: Date,
    },
  },
  { _id: false }
);

/**
 * Base upgrade schema
 */
const BaseUpgradeSchema = new Schema<IBaseUpgrade>(
  {
    upgradeType: {
      type: String,
      enum: Object.values(BaseUpgradeType),
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    installedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/**
 * Gang base schema definition
 */
const GangBaseSchema = new Schema<IGangBase>(
  {
    gangId: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
      required: true,
      unique: true,
      index: true,
    },
    tier: {
      type: Number,
      enum: Object.values(BaseTier).filter((v) => typeof v === 'number'),
      required: true,
      default: BaseTier.HIDEOUT,
    },
    tierName: {
      type: String,
      required: true,
    },
    location: {
      type: BaseLocationSchema,
      required: true,
    },
    storage: {
      type: GangStorageSchema,
      required: true,
    },
    facilities: {
      type: [FacilitySchema],
      default: [],
    },
    upgrades: {
      type: [BaseUpgradeSchema],
      default: [],
    },
    defense: {
      type: DefenseSystemSchema,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 0,
    },
    currentOccupants: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastUpgraded: {
      type: Date,
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
 * Indexes
 */
GangBaseSchema.index({ gangId: 1, isActive: 1 });
GangBaseSchema.index({ tier: 1 });
GangBaseSchema.index({ 'location.locationType': 1 });

/**
 * Instance method: Calculate defense rating
 */
GangBaseSchema.methods.calculateDefenseRating = function (this: IGangBase): number {
  const tierInfo = BASE_TIER_INFO[this.tier];
  const baseDefense = tierInfo.defense;

  // Guard contribution (each guard adds to defense)
  const guardDefense = this.defense.guards.reduce((total, guard) => {
    if (guard.isActive) {
      return total + (guard.combatSkill / 10);
    }
    return total;
  }, 0);

  // Trap contribution
  const trapDefense = this.defense.traps.reduce((total, trap) => {
    if (trap.isActive) {
      return total + (trap.effectiveness / 10);
    }
    return total;
  }, 0);

  // Location bonus
  const locationDefenseBonus = this.location.bonuses.find((b) => b.type === 'defense');
  const locationBonus = locationDefenseBonus ? locationDefenseBonus.value : 0;

  // Alarm level bonus
  const alarmBonus = this.defense.alarmLevel / 10;

  // Calculate total
  const totalDefense = baseDefense + guardDefense + trapDefense + locationBonus + alarmBonus;

  return Math.min(100, Math.round(totalDefense));
};

/**
 * Instance method: Check if can upgrade tier
 */
GangBaseSchema.methods.canUpgradeTier = function (this: IGangBase): boolean {
  return this.tier < BaseTier.CRIMINAL_EMPIRE_HQ;
};

/**
 * Instance method: Get upgrade tier cost
 */
GangBaseSchema.methods.getUpgradeTierCost = function (this: IGangBase): number {
  if (!this.canUpgradeTier()) {
    return 0;
  }
  const nextTier = (this.tier + 1) as BaseTier;
  return BASE_TIER_INFO[nextTier].cost;
};

/**
 * Instance method: Check if has facility
 */
GangBaseSchema.methods.hasFacility = function (
  this: IGangBase,
  facilityType: FacilityType
): boolean {
  return this.facilities.some((f) => f.facilityType === facilityType && f.isActive);
};

/**
 * Instance method: Check if has upgrade
 */
GangBaseSchema.methods.hasUpgrade = function (
  this: IGangBase,
  upgradeType: BaseUpgradeType
): boolean {
  return this.upgrades.some((u) => u.upgradeType === upgradeType && u.isActive);
};

/**
 * Instance method: Check if can add facility
 */
GangBaseSchema.methods.canAddFacility = function (
  this: IGangBase,
  facilityType: FacilityType
): boolean {
  // Check if already has facility
  if (this.hasFacility(facilityType)) {
    return false;
  }

  // Check max facilities
  if (this.facilities.length >= BASE_CONSTRAINTS.MAX_FACILITIES) {
    return false;
  }

  // Check tier requirement (would need to import FACILITY_INFO or pass it)
  return true;
};

/**
 * Instance method: Check if can add upgrade
 */
GangBaseSchema.methods.canAddUpgrade = function (
  this: IGangBase,
  upgradeType: BaseUpgradeType
): boolean {
  // Check if already has upgrade
  if (this.hasUpgrade(upgradeType)) {
    return false;
  }

  // Check max upgrades
  if (this.upgrades.length >= BASE_CONSTRAINTS.MAX_UPGRADES) {
    return false;
  }

  return true;
};

/**
 * Instance method: Add facility
 */
GangBaseSchema.methods.addFacility = function (
  this: IGangBase,
  facilityType: FacilityType
): void {
  if (!this.canAddFacility(facilityType)) {
    throw new Error('Cannot add facility');
  }

  this.facilities.push({
    facilityType,
    level: 1,
    isActive: true,
    installedAt: new Date(),
  });
};

/**
 * Instance method: Add upgrade
 */
GangBaseSchema.methods.addUpgrade = function (
  this: IGangBase,
  upgradeType: BaseUpgradeType
): void {
  if (!this.canAddUpgrade(upgradeType)) {
    throw new Error('Cannot add upgrade');
  }

  this.upgrades.push({
    upgradeType,
    isActive: true,
    installedAt: new Date(),
  });
};

/**
 * Instance method: Add storage item
 */
GangBaseSchema.methods.addStorageItem = function (
  this: IGangBase,
  itemId: string,
  itemName: string,
  quantity: number,
  addedBy: mongoose.Types.ObjectId
): void {
  const existingItem = this.storage.items.find((item) => item.itemId === itemId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.storage.items.push({
      itemId,
      itemName,
      quantity,
      addedBy,
      addedAt: new Date(),
    });
  }

  this.storage.currentUsage = this.calculateStorageUsage();
};

/**
 * Instance method: Remove storage item
 */
GangBaseSchema.methods.removeStorageItem = function (
  this: IGangBase,
  itemId: string,
  quantity: number
): void {
  const itemIndex = this.storage.items.findIndex((item) => item.itemId === itemId);

  if (itemIndex === -1) {
    throw new Error('Item not found in storage');
  }

  const item = this.storage.items[itemIndex];

  if (item.quantity < quantity) {
    throw new Error('Insufficient quantity in storage');
  }

  item.quantity -= quantity;

  if (item.quantity === 0) {
    this.storage.items.splice(itemIndex, 1);
  }

  this.storage.currentUsage = this.calculateStorageUsage();
};

/**
 * Instance method: Get storage item
 */
GangBaseSchema.methods.getStorageItem = function (
  this: IGangBase,
  itemId: string
): IStorageItem | undefined {
  return this.storage.items.find((item) => item.itemId === itemId);
};

/**
 * Instance method: Calculate storage usage
 */
GangBaseSchema.methods.calculateStorageUsage = function (this: IGangBase): number {
  return this.storage.items.reduce((total, item) => total + item.quantity, 0);
};

/**
 * Instance method: Hire guard
 */
GangBaseSchema.methods.hireGuard = function (
  this: IGangBase,
  guardName: string,
  level: number,
  combatSkill: number
): IGuard {
  if (this.defense.guards.length >= BASE_CONSTRAINTS.MAX_GUARDS) {
    throw new Error('Maximum guard capacity reached');
  }

  const hireCost = level * 50;
  const upkeepCost = level * 10;

  const guard: IGuard = {
    guardId: new mongoose.Types.ObjectId().toString(),
    name: guardName,
    level,
    combatSkill,
    hireCost,
    upkeepCost,
    isActive: true,
    hiredAt: new Date(),
  };

  this.defense.guards.push(guard);
  this.defense.overallDefense = this.calculateDefenseRating();

  return guard;
};

/**
 * Instance method: Fire guard
 */
GangBaseSchema.methods.fireGuard = function (this: IGangBase, guardId: string): void {
  const guardIndex = this.defense.guards.findIndex((g) => g.guardId === guardId);

  if (guardIndex === -1) {
    throw new Error('Guard not found');
  }

  this.defense.guards.splice(guardIndex, 1);
  this.defense.overallDefense = this.calculateDefenseRating();
};

/**
 * Instance method: Install trap
 */
GangBaseSchema.methods.installTrap = function (
  this: IGangBase,
  trapType: 'alarm' | 'damage' | 'slow' | 'capture',
  effectiveness: number,
  cost: number
): ITrap {
  if (this.defense.traps.length >= BASE_CONSTRAINTS.MAX_TRAPS) {
    throw new Error('Maximum trap capacity reached');
  }

  const trapNames = {
    alarm: 'Alarm Trap',
    damage: 'Spike Trap',
    slow: 'Net Trap',
    capture: 'Cage Trap',
  };

  const trap: ITrap = {
    trapId: new mongoose.Types.ObjectId().toString(),
    type: trapType,
    name: trapNames[trapType],
    effectiveness,
    cost,
    isActive: true,
    installedAt: new Date(),
  };

  this.defense.traps.push(trap);
  this.defense.overallDefense = this.calculateDefenseRating();

  return trap;
};

/**
 * Instance method: Remove trap
 */
GangBaseSchema.methods.removeTrap = function (this: IGangBase, trapId: string): void {
  const trapIndex = this.defense.traps.findIndex((t) => t.trapId === trapId);

  if (trapIndex === -1) {
    throw new Error('Trap not found');
  }

  this.defense.traps.splice(trapIndex, 1);
  this.defense.overallDefense = this.calculateDefenseRating();
};

/**
 * Instance method: Upgrade tier
 */
GangBaseSchema.methods.upgradeTier = function (this: IGangBase): void {
  if (!this.canUpgradeTier()) {
    throw new Error('Cannot upgrade tier');
  }

  this.tier = (this.tier + 1) as BaseTier;
  const tierInfo = BASE_TIER_INFO[this.tier];
  this.tierName = tierInfo.name;
  this.capacity = tierInfo.capacity;
  this.storage.capacity = tierInfo.storageCapacity;
  this.lastUpgraded = new Date();
  this.defense.overallDefense = this.calculateDefenseRating();
};

/**
 * Instance method: Get location bonuses
 */
GangBaseSchema.methods.getLocationBonuses = function (this: IGangBase): LocationBonus[] {
  return this.location.bonuses;
};

/**
 * Instance method: Convert to safe object
 */
GangBaseSchema.methods.toSafeObject = function (this: IGangBase): Record<string, unknown> {
  const id = this._id.toString();
  return {
    id,
    _id: id,
    gangId: this.gangId.toString(),
    tier: this.tier,
    tierName: this.tierName,
    location: this.location,
    storage: {
      items: this.storage.items.map((item) => ({
        ...item,
        addedBy: item.addedBy.toString(),
      })),
      capacity: this.storage.capacity,
      currentUsage: this.storage.currentUsage,
      categories: this.storage.categories,
    },
    facilities: this.facilities,
    upgrades: this.upgrades,
    defense: {
      guards: this.defense.guards,
      traps: this.defense.traps,
      alarmLevel: this.defense.alarmLevel,
      escapeRoutes: this.defense.escapeRoutes,
      overallDefense: this.defense.overallDefense,
      lastAttacked: this.defense.lastAttacked,
      raidHistory: this.defense.raidHistory,
    },
    capacity: this.capacity,
    currentOccupants: this.currentOccupants,
    createdAt: this.createdAt,
    lastUpgraded: this.lastUpgraded,
    isActive: this.isActive,
  };
};

/**
 * Pre-save hook: Update defense rating
 */
GangBaseSchema.pre('save', function (next) {
  if (this.isModified('defense') || this.isModified('tier')) {
    this.defense.overallDefense = this.calculateDefenseRating();
  }
  next();
});

/**
 * Static method: Find base by gang ID
 */
GangBaseSchema.statics.findByGangId = async function (
  gangId: string | mongoose.Types.ObjectId
): Promise<IGangBase | null> {
  const id = typeof gangId === 'string' ? new mongoose.Types.ObjectId(gangId) : gangId;
  return this.findOne({ gangId: id, isActive: true });
};

/**
 * Static method: Find all active bases
 */
GangBaseSchema.statics.findActiveBases = async function (): Promise<IGangBase[]> {
  return this.find({ isActive: true }).sort({ tier: -1, createdAt: -1 });
};

/**
 * Gang base model
 */
export const GangBase = mongoose.model<IGangBase, IGangBaseModel>('GangBase', GangBaseSchema);
