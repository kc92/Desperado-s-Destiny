/**
 * Territory Zone Model
 *
 * Detailed zone-level territory control system for gang warfare
 * Supports influence mechanics, contestation, and zone benefits
 *
 * Phase 2.2: Added ZoneSpecialization and extended ZoneBenefitType support
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  ZoneType,
  ZoneBenefitType,
  ZoneSpecialization,
} from '@desperados/shared';

// Re-export for backwards compatibility
export { ZoneType, ZoneBenefitType, ZoneSpecialization };

/**
 * Zone benefit interface
 */
export interface IZoneBenefit {
  type: ZoneBenefitType;
  description: string;
  value: number;
  /** How the bonus is applied: 'multiply' (default) or 'add' */
  modifier?: 'multiply' | 'add';
}

/**
 * Gang influence in zone
 */
export interface IGangInfluence {
  gangId: mongoose.Types.ObjectId;
  gangName: string;
  influence: number;
  isNpcGang: boolean;
  lastActivity: Date;
}

/**
 * Territory Zone document interface
 */
export interface ITerritoryZone extends Document {
  id: string;
  name: string;
  type: ZoneType;
  parentLocation: string;
  /** Zone specialization for bonus scaling (Phase 2.2) */
  specialization: ZoneSpecialization;

  controlledBy: mongoose.Types.ObjectId | null;
  controllingGangName: string | null;
  influence: IGangInfluence[];
  contestedBy: mongoose.Types.ObjectId[];

  benefits: IZoneBenefit[];
  defenseRating: number;
  dailyIncome: number;

  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  isControlled(): boolean;
  isContested(): boolean;
  getControllingGang(): IGangInfluence | null;
  getGangInfluence(gangId: mongoose.Types.ObjectId): number;
  addInfluence(gangId: mongoose.Types.ObjectId, gangName: string, amount: number, isNpcGang?: boolean): void;
  removeInfluence(gangId: mongoose.Types.ObjectId, amount: number): void;
  updateControl(): void;
  decayInfluence(decayAmount: number): void;
  calculateDailyIncome(): number;
}

/**
 * Territory Zone model interface
 */
export interface ITerritoryZoneModel extends Model<ITerritoryZone> {
  findBySlug(slug: string): Promise<ITerritoryZone | null>;
  findControlledByGang(gangId: mongoose.Types.ObjectId): Promise<ITerritoryZone[]>;
  findContestedZones(): Promise<ITerritoryZone[]>;
  findByLocation(location: string): Promise<ITerritoryZone[]>;
}

/**
 * Zone benefit schema
 */
const ZoneBenefitSchema = new Schema<IZoneBenefit>(
  {
    type: {
      type: String,
      enum: Object.values(ZoneBenefitType),
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    modifier: {
      type: String,
      enum: ['multiply', 'add'],
      default: 'multiply',
    },
  },
  { _id: false }
);

/**
 * Gang influence schema
 */
const GangInfluenceSchema = new Schema<IGangInfluence>(
  {
    gangId: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
      required: true,
    },
    gangName: {
      type: String,
      required: true,
    },
    influence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    isNpcGang: {
      type: Boolean,
      default: false,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/**
 * Territory Zone schema definition
 */
const TerritoryZoneSchema = new Schema<ITerritoryZone>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(ZoneType),
    },
    parentLocation: {
      type: String,
      required: true,
      index: true,
    },
    specialization: {
      type: String,
      enum: Object.values(ZoneSpecialization),
      default: ZoneSpecialization.MIXED,
      index: true,
    },

    controlledBy: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
      default: null,
      index: true,
    },
    controllingGangName: {
      type: String,
      default: null,
    },
    influence: {
      type: [GangInfluenceSchema],
      default: [],
    },
    contestedBy: {
      type: [Schema.Types.ObjectId],
      ref: 'Gang',
      default: [],
    },

    benefits: {
      type: [ZoneBenefitSchema],
      default: [],
    },
    defenseRating: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      default: 50,
    },
    dailyIncome: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
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
 * Indexes for efficient querying
 */
TerritoryZoneSchema.index({ id: 1 }, { unique: true });
TerritoryZoneSchema.index({ controlledBy: 1 });
TerritoryZoneSchema.index({ parentLocation: 1 });
TerritoryZoneSchema.index({ type: 1 });
TerritoryZoneSchema.index({ 'influence.gangId': 1 });

/**
 * Instance method: Check if zone is controlled
 */
TerritoryZoneSchema.methods.isControlled = function(this: ITerritoryZone): boolean {
  return this.controlledBy !== null;
};

/**
 * Instance method: Check if zone is contested
 */
TerritoryZoneSchema.methods.isContested = function(this: ITerritoryZone): boolean {
  return this.contestedBy.length > 0;
};

/**
 * Instance method: Get controlling gang influence object
 */
TerritoryZoneSchema.methods.getControllingGang = function(this: ITerritoryZone): IGangInfluence | null {
  if (!this.controlledBy) {
    return null;
  }

  return this.influence.find(inf => inf.gangId.equals(this.controlledBy as mongoose.Types.ObjectId)) || null;
};

/**
 * Instance method: Get specific gang's influence in zone
 */
TerritoryZoneSchema.methods.getGangInfluence = function(
  this: ITerritoryZone,
  gangId: mongoose.Types.ObjectId
): number {
  const gangInfluence = this.influence.find(inf => inf.gangId.equals(gangId));
  return gangInfluence ? gangInfluence.influence : 0;
};

/**
 * Instance method: Add influence for a gang
 */
TerritoryZoneSchema.methods.addInfluence = function(
  this: ITerritoryZone,
  gangId: mongoose.Types.ObjectId,
  gangName: string,
  amount: number,
  isNpcGang: boolean = false
): void {
  const existingInfluence = this.influence.find(inf => inf.gangId.equals(gangId));

  if (existingInfluence) {
    existingInfluence.influence = Math.min(100, existingInfluence.influence + amount);
    existingInfluence.lastActivity = new Date();
  } else {
    this.influence.push({
      gangId,
      gangName,
      influence: Math.min(100, amount),
      isNpcGang,
      lastActivity: new Date(),
    });
  }

  this.lastUpdated = new Date();
  this.updateControl();
};

/**
 * Instance method: Remove influence from a gang
 */
TerritoryZoneSchema.methods.removeInfluence = function(
  this: ITerritoryZone,
  gangId: mongoose.Types.ObjectId,
  amount: number
): void {
  const gangInfluence = this.influence.find(inf => inf.gangId.equals(gangId));

  if (gangInfluence) {
    gangInfluence.influence = Math.max(0, gangInfluence.influence - amount);

    // Remove if influence drops to 0
    if (gangInfluence.influence === 0) {
      this.influence = this.influence.filter(inf => !inf.gangId.equals(gangId));
    }
  }

  this.lastUpdated = new Date();
  this.updateControl();
};

/**
 * Instance method: Update control based on influence
 */
TerritoryZoneSchema.methods.updateControl = function(this: ITerritoryZone): void {
  if (this.influence.length === 0) {
    this.controlledBy = null;
    this.controllingGangName = null;
    this.contestedBy = [];
    return;
  }

  // Sort by influence descending
  const sorted = [...this.influence].sort((a, b) => b.influence - a.influence);

  const topGang = sorted[0];
  const secondGang = sorted.length > 1 ? sorted[1] : null;

  // Control requires > 50 influence OR at least 20 point lead over second place
  const hasControl = topGang.influence > 50 ||
                     (secondGang && topGang.influence - secondGang.influence >= 20);

  if (hasControl) {
    this.controlledBy = topGang.gangId;
    this.controllingGangName = topGang.gangName;

    // Zone is contested if second place has >= 30 influence
    if (secondGang && secondGang.influence >= 30) {
      this.contestedBy = [secondGang.gangId];
    } else {
      this.contestedBy = [];
    }
  } else {
    // No clear control - zone is contested
    this.controlledBy = null;
    this.controllingGangName = null;
    this.contestedBy = sorted.slice(0, 2).map(inf => inf.gangId);
  }
};

/**
 * Instance method: Apply influence decay
 */
TerritoryZoneSchema.methods.decayInfluence = function(
  this: ITerritoryZone,
  decayAmount: number = 5
): void {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  for (const gangInfluence of this.influence) {
    // Apply decay if no activity in last 24 hours
    if (gangInfluence.lastActivity < oneDayAgo) {
      gangInfluence.influence = Math.max(0, gangInfluence.influence - decayAmount);
    }
  }

  // Remove gangs with 0 influence
  this.influence = this.influence.filter(inf => inf.influence > 0);

  this.lastUpdated = new Date();
  this.updateControl();
};

/**
 * Instance method: Calculate daily income from zone
 */
TerritoryZoneSchema.methods.calculateDailyIncome = function(this: ITerritoryZone): number {
  if (!this.isControlled()) {
    return 0;
  }

  let income = this.dailyIncome;

  // Apply benefit multipliers
  for (const benefit of this.benefits) {
    if (benefit.type === ZoneBenefitType.INCOME) {
      income += benefit.value;
    }
  }

  // Reduce income if contested
  if (this.isContested()) {
    income = Math.floor(income * 0.5);
  }

  return income;
};

/**
 * Static method: Find zone by slug
 */
TerritoryZoneSchema.statics.findBySlug = async function(
  slug: string
): Promise<ITerritoryZone | null> {
  return this.findOne({ id: slug.toLowerCase() })
    .populate('controlledBy', 'name tag')
    .populate('contestedBy', 'name tag');
};

/**
 * Static method: Find all zones controlled by a gang
 */
TerritoryZoneSchema.statics.findControlledByGang = async function(
  gangId: mongoose.Types.ObjectId
): Promise<ITerritoryZone[]> {
  return this.find({ controlledBy: gangId }).sort({ name: 1 });
};

/**
 * Static method: Find all contested zones
 */
TerritoryZoneSchema.statics.findContestedZones = async function(): Promise<ITerritoryZone[]> {
  return this.find({ contestedBy: { $ne: [] } }).sort({ name: 1 });
};

/**
 * Static method: Find zones by parent location
 */
TerritoryZoneSchema.statics.findByLocation = async function(
  location: string
): Promise<ITerritoryZone[]> {
  return this.find({ parentLocation: location }).sort({ name: 1 });
};

/**
 * Territory Zone model
 */
export const TerritoryZone = mongoose.model<ITerritoryZone, ITerritoryZoneModel>(
  'TerritoryZone',
  TerritoryZoneSchema
);
