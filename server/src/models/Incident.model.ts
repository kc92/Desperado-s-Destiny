/**
 * Incident Model
 *
 * Phase 14.2: Risk Simulation - Incident System
 *
 * Tracks random negative events affecting player assets with
 * prevention mechanics, response windows, and insurance recovery.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  IncidentCategory,
  IncidentType,
  IncidentSeverity,
  IncidentStatus,
  IncidentTargetType,
  IncidentResponseType,
  IncidentEffectType,
  InsuranceLevel,
  IIncidentEffect,
  IPreventionFactor,
  IIncidentResponse,
} from '@desperados/shared';

/**
 * Incident document interface
 */
export interface IIncident extends Document {
  _id: mongoose.Types.ObjectId;

  // Target information
  targetType: IncidentTargetType;
  targetId: mongoose.Types.ObjectId;
  targetName: string;
  characterId: mongoose.Types.ObjectId;

  // Incident details
  category: IncidentCategory;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;

  // Location context
  zoneId: string;
  locationId: string;

  // Timing
  occurredAt: Date;
  expiresAt: Date;
  resolvedAt?: Date;

  // Effects
  effects: IIncidentEffect[];
  totalDamageEstimate: number;

  // Prevention tracking
  preventionFactors: IPreventionFactor[];
  totalPreventionReduction: number;
  wasPartiallyPrevented: boolean;

  // Response tracking
  availableResponses: IIncidentResponse[];
  selectedResponse?: IncidentResponseType;
  responseStartedAt?: Date;
  responseCompletedAt?: Date;
  responseSuccess?: boolean;

  // Insurance
  insuranceLevel: InsuranceLevel;
  insuranceRecovery?: number;
  insuranceClaimed: boolean;

  // Final outcome
  actualDamage?: number;
  recoveredAmount?: number;

  // Notification tracking
  notificationSent: boolean;
  reminderSent: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  isExpired(): boolean;
  canRespond(): boolean;
  getTimeRemaining(): number;
  markResolved(status: IncidentStatus, actualDamage: number, recovered: number): Promise<void>;
}

/**
 * Incident model static methods
 */
export interface IIncidentModel extends Model<IIncident> {
  findActiveByCharacter(characterId: string | mongoose.Types.ObjectId): Promise<IIncident[]>;
  findActiveByTarget(targetId: string | mongoose.Types.ObjectId): Promise<IIncident | null>;
  findRecentByTarget(targetId: string | mongoose.Types.ObjectId, hoursBack: number): Promise<IIncident[]>;
  getLastIncidentOnTarget(targetId: string | mongoose.Types.ObjectId, type?: IncidentType): Promise<IIncident | null>;
  countActiveByCharacter(characterId: string | mongoose.Types.ObjectId): Promise<number>;
  findExpired(): Promise<IIncident[]>;
  findNeedingReminder(minutesBefore: number): Promise<IIncident[]>;
}

/**
 * Incident effect subdocument schema
 */
const IncidentEffectSchema = new Schema<IIncidentEffect>({
  type: {
    type: String,
    enum: Object.values(IncidentEffectType),
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
  },
  description: {
    type: String,
    required: true,
  },
}, { _id: false });

/**
 * Prevention factor subdocument schema
 */
const PreventionFactorSchema = new Schema<IPreventionFactor>({
  type: {
    type: String,
    enum: ['condition', 'guards', 'territory', 'upgrade', 'insurance', 'gang_protection'],
    required: true,
  },
  reductionPercent: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
}, { _id: false });

/**
 * Response option subdocument schema
 */
const IncidentResponseSchema = new Schema<IIncidentResponse>({
  type: {
    type: String,
    enum: Object.values(IncidentResponseType),
    required: true,
  },
  cost: {
    type: Number,
    required: true,
    default: 0,
  },
  successChance: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  damageReduction: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  timeRequired: {
    type: Number,
    required: true,
    default: 0,
  },
  requirements: {
    minLevel: Number,
    requiredItems: [{
      itemId: String,
      quantity: Number,
    }],
    requiredGangRank: String,
    requiredSkill: {
      skillId: String,
      minLevel: Number,
    },
  },
  description: {
    type: String,
    required: true,
  },
}, { _id: false });

/**
 * Main Incident schema
 */
const IncidentSchema = new Schema<IIncident, IIncidentModel>({
  // Target information
  targetType: {
    type: String,
    enum: Object.values(IncidentTargetType),
    required: true,
    index: true,
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  targetName: {
    type: String,
    required: true,
  },
  characterId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    index: true,
  },

  // Incident details
  category: {
    type: String,
    enum: Object.values(IncidentCategory),
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: Object.values(IncidentType),
    required: true,
    index: true,
  },
  severity: {
    type: String,
    enum: Object.values(IncidentSeverity),
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(IncidentStatus),
    default: IncidentStatus.PENDING,
    index: true,
  },

  // Location context
  zoneId: {
    type: String,
    required: true,
    index: true,
  },
  locationId: {
    type: String,
    required: true,
  },

  // Timing
  occurredAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  resolvedAt: {
    type: Date,
  },

  // Effects
  effects: {
    type: [IncidentEffectSchema],
    default: [],
  },
  totalDamageEstimate: {
    type: Number,
    default: 0,
  },

  // Prevention tracking
  preventionFactors: {
    type: [PreventionFactorSchema],
    default: [],
  },
  totalPreventionReduction: {
    type: Number,
    default: 0,
  },
  wasPartiallyPrevented: {
    type: Boolean,
    default: false,
  },

  // Response tracking
  availableResponses: {
    type: [IncidentResponseSchema],
    default: [],
  },
  selectedResponse: {
    type: String,
    enum: Object.values(IncidentResponseType),
  },
  responseStartedAt: {
    type: Date,
  },
  responseCompletedAt: {
    type: Date,
  },
  responseSuccess: {
    type: Boolean,
  },

  // Insurance
  insuranceLevel: {
    type: String,
    enum: Object.values(InsuranceLevel),
    default: InsuranceLevel.NONE,
  },
  insuranceRecovery: {
    type: Number,
  },
  insuranceClaimed: {
    type: Boolean,
    default: false,
  },

  // Final outcome
  actualDamage: {
    type: Number,
  },
  recoveredAmount: {
    type: Number,
  },

  // Notification tracking
  notificationSent: {
    type: Boolean,
    default: false,
  },
  reminderSent: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Compound indexes for efficient queries
IncidentSchema.index({ characterId: 1, status: 1 });
IncidentSchema.index({ targetId: 1, status: 1 });
IncidentSchema.index({ targetId: 1, occurredAt: -1 });
IncidentSchema.index({ status: 1, expiresAt: 1 });
IncidentSchema.index({ characterId: 1, occurredAt: -1 });
IncidentSchema.index({ notificationSent: 1, status: 1 });
IncidentSchema.index({ reminderSent: 1, expiresAt: 1, status: 1 });

// Instance methods
IncidentSchema.methods.isExpired = function(this: IIncident): boolean {
  return new Date() > this.expiresAt;
};

IncidentSchema.methods.canRespond = function(this: IIncident): boolean {
  return this.status === IncidentStatus.PENDING && !this.isExpired();
};

IncidentSchema.methods.getTimeRemaining = function(this: IIncident): number {
  const now = Date.now();
  const expiry = this.expiresAt.getTime();
  return Math.max(0, Math.floor((expiry - now) / 1000));
};

IncidentSchema.methods.markResolved = async function(
  this: IIncident,
  status: IncidentStatus,
  actualDamage: number,
  recovered: number
): Promise<void> {
  this.status = status;
  this.resolvedAt = new Date();
  this.actualDamage = actualDamage;
  this.recoveredAmount = recovered;
  await this.save();
};

// Static methods
IncidentSchema.statics.findActiveByCharacter = async function(
  characterId: string | mongoose.Types.ObjectId
): Promise<IIncident[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId.toString()),
    status: { $in: [IncidentStatus.PENDING, IncidentStatus.IN_PROGRESS] },
  }).sort({ expiresAt: 1 });
};

IncidentSchema.statics.findActiveByTarget = async function(
  targetId: string | mongoose.Types.ObjectId
): Promise<IIncident | null> {
  return this.findOne({
    targetId: new mongoose.Types.ObjectId(targetId.toString()),
    status: { $in: [IncidentStatus.PENDING, IncidentStatus.IN_PROGRESS] },
  });
};

IncidentSchema.statics.findRecentByTarget = async function(
  targetId: string | mongoose.Types.ObjectId,
  hoursBack: number
): Promise<IIncident[]> {
  const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
  return this.find({
    targetId: new mongoose.Types.ObjectId(targetId.toString()),
    occurredAt: { $gte: cutoff },
  }).sort({ occurredAt: -1 });
};

IncidentSchema.statics.getLastIncidentOnTarget = async function(
  targetId: string | mongoose.Types.ObjectId,
  type?: IncidentType
): Promise<IIncident | null> {
  const query: any = {
    targetId: new mongoose.Types.ObjectId(targetId.toString()),
  };
  if (type) {
    query.type = type;
  }
  return this.findOne(query).sort({ occurredAt: -1 });
};

IncidentSchema.statics.countActiveByCharacter = async function(
  characterId: string | mongoose.Types.ObjectId
): Promise<number> {
  return this.countDocuments({
    characterId: new mongoose.Types.ObjectId(characterId.toString()),
    status: { $in: [IncidentStatus.PENDING, IncidentStatus.IN_PROGRESS] },
  });
};

IncidentSchema.statics.findExpired = async function(): Promise<IIncident[]> {
  return this.find({
    status: IncidentStatus.PENDING,
    expiresAt: { $lt: new Date() },
  });
};

IncidentSchema.statics.findNeedingReminder = async function(
  minutesBefore: number
): Promise<IIncident[]> {
  const now = new Date();
  const reminderThreshold = new Date(now.getTime() + minutesBefore * 60 * 1000);

  return this.find({
    status: IncidentStatus.PENDING,
    reminderSent: false,
    expiresAt: { $lte: reminderThreshold, $gt: now },
  });
};

export const Incident = mongoose.model<IIncident, IIncidentModel>('Incident', IncidentSchema);
