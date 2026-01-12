/**
 * Expedition Model
 *
 * Tracks expedition trips and their progress for offline progression
 */

import mongoose, { Schema, Document } from 'mongoose';
import type {
  ExpeditionType,
  ExpeditionStatus,
  ExpeditionDurationTier,
  ExpeditionOutcome,
  ExpeditionEventType,
  ExpeditionResourceType,
  IExpeditionResource,
  IExpeditionEvent,
  IExpeditionResult,
} from '@desperados/shared';

/**
 * Expedition resource subdocument
 */
interface IExpeditionResourceDoc {
  type: ExpeditionResourceType;
  itemId?: string;
  itemName?: string;
  quantity: number;
  value?: number;
}

/**
 * Expedition event subdocument
 */
interface IExpeditionEventDoc {
  eventId: string;
  type: ExpeditionEventType;
  title: string;
  description: string;
  occurredAt: Date;
  outcome: 'positive' | 'neutral' | 'negative';
  rewards?: IExpeditionResourceDoc[];
  losses?: IExpeditionResourceDoc[];
  xpGained?: number;
  goldGained?: number;
  goldLost?: number;
  healthLost?: number;
}

/**
 * Expedition result subdocument
 */
interface IExpeditionResultDoc {
  outcome: ExpeditionOutcome;
  totalGold: number;
  totalXp: number;
  resources: IExpeditionResourceDoc[];
  events: IExpeditionEventDoc[];
  skillXp?: Array<{ skillId: string; amount: number }>;
  locationDiscovered?: string;
  tradeRouteUnlocked?: string;
  claimDiscovered?: string;
  healthLost?: number;
  energyLost?: number;
  itemsLost?: IExpeditionResourceDoc[];
}

/**
 * Expedition document interface
 */
export interface IExpedition extends Document {
  /** Character ID */
  characterId: mongoose.Types.ObjectId;

  /** Expedition configuration */
  type: ExpeditionType;
  status: ExpeditionStatus;
  durationTier: ExpeditionDurationTier;

  /** Location info */
  startLocationId: string;
  startLocationName?: string;
  destinationInfo?: string;

  /** Timing */
  startedAt: Date;
  estimatedCompletionAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;

  /** Duration in milliseconds */
  durationMs: number;

  /** Resources committed */
  mountId?: mongoose.Types.ObjectId;
  suppliesUsed?: string[];
  gangMemberIds?: mongoose.Types.ObjectId[];

  /** Energy and gold spent */
  energySpent: number;
  goldSpent: number;

  /** Progress tracking */
  eventsEncountered: IExpeditionEventDoc[];
  currentEventIndex: number;

  /** Results (populated after completion) */
  result?: IExpeditionResultDoc;

  /** Bull job ID for tracking */
  jobId?: string;

  /** Timestamps */
  createdAt: Date;
  updatedAt: Date;

  /** Computed progress percent */
  progressPercent: number;
}

/**
 * Resource subdocument schema
 */
const ExpeditionResourceSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        'pelt', 'meat', 'hide', 'rare_hide', 'trophy',
        'ore', 'gem', 'gold_nugget', 'rare_mineral',
        'gold', 'trade_goods', 'rare_item', 'reputation',
        'intel', 'map_fragment', 'shortcut', 'location_discovery'
      ],
      required: true
    },
    itemId: { type: String },
    itemName: { type: String },
    quantity: { type: Number, required: true, min: 0 },
    value: { type: Number, min: 0 }
  },
  { _id: false }
);

/**
 * Event subdocument schema
 */
const ExpeditionEventSchema = new Schema(
  {
    eventId: { type: String, required: true },
    type: {
      type: String,
      enum: ['combat', 'discovery', 'npc_encounter', 'skill_check', 'weather', 'ambush'],
      required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    occurredAt: { type: Date, required: true, default: Date.now },
    outcome: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      required: true
    },
    rewards: [ExpeditionResourceSchema],
    losses: [ExpeditionResourceSchema],
    xpGained: { type: Number, min: 0 },
    goldGained: { type: Number, min: 0 },
    goldLost: { type: Number, min: 0 },
    healthLost: { type: Number, min: 0 }
  },
  { _id: false }
);

/**
 * Result subdocument schema
 */
const ExpeditionResultSchema = new Schema(
  {
    outcome: {
      type: String,
      enum: ['critical_success', 'success', 'partial_success', 'failure', 'critical_failure'],
      required: true
    },
    totalGold: { type: Number, required: true, min: 0 },
    totalXp: { type: Number, required: true, min: 0 },
    resources: [ExpeditionResourceSchema],
    events: [ExpeditionEventSchema],
    skillXp: [{
      skillId: { type: String, required: true },
      amount: { type: Number, required: true, min: 0 }
    }],
    locationDiscovered: { type: String },
    tradeRouteUnlocked: { type: String },
    claimDiscovered: { type: String },
    healthLost: { type: Number, min: 0 },
    energyLost: { type: Number, min: 0 },
    itemsLost: [ExpeditionResourceSchema]
  },
  { _id: false }
);

/**
 * Expedition schema
 */
const ExpeditionSchema = new Schema<IExpedition>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },

    type: {
      type: String,
      enum: ['hunting_trip', 'prospecting_run', 'trade_caravan', 'scouting_mission'],
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: ['preparing', 'in_progress', 'completed', 'failed', 'cancelled'] as ExpeditionStatus[],
      default: 'preparing' as ExpeditionStatus,
      required: true,
      index: true
    },

    durationTier: {
      type: String,
      enum: ['quick', 'standard', 'extended'],
      required: true
    },

    startLocationId: {
      type: String,
      required: true,
      index: true
    },
    startLocationName: { type: String },
    destinationInfo: { type: String },

    startedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    estimatedCompletionAt: {
      type: Date,
      required: true,
      index: true
    },
    completedAt: { type: Date },
    cancelledAt: { type: Date },

    durationMs: {
      type: Number,
      required: true,
      min: 0
    },

    mountId: {
      type: Schema.Types.ObjectId,
      ref: 'Horse'
    },
    suppliesUsed: [{ type: String }],
    gangMemberIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Character'
    }],

    energySpent: {
      type: Number,
      default: 0,
      min: 0
    },
    goldSpent: {
      type: Number,
      default: 0,
      min: 0
    },

    eventsEncountered: [ExpeditionEventSchema],
    currentEventIndex: {
      type: Number,
      default: 0,
      min: 0
    },

    result: ExpeditionResultSchema,

    jobId: { type: String }
  },
  {
    timestamps: true
  }
);

// Compound indexes for efficient querying
ExpeditionSchema.index({ characterId: 1, status: 1 });
ExpeditionSchema.index({ characterId: 1, type: 1, status: 1 });
ExpeditionSchema.index({ characterId: 1, createdAt: -1 });
ExpeditionSchema.index({ status: 1, estimatedCompletionAt: 1 });
ExpeditionSchema.index({ jobId: 1 }, { sparse: true });

// Virtual for id
ExpeditionSchema.virtual('id').get(function () {
  return this._id?.toString();
});

// Virtual for progress percent
ExpeditionSchema.virtual('progressPercent').get(function (this: IExpedition) {
  if (this.status === 'completed' || this.status === 'failed') {
    return 100;
  }
  if (this.status === 'cancelled' || this.status === 'preparing') {
    return 0;
  }

  const now = new Date().getTime();
  const start = this.startedAt.getTime();
  const end = this.estimatedCompletionAt.getTime();
  const elapsed = now - start;
  const total = end - start;

  if (total <= 0) return 100;
  const percent = Math.min(100, Math.max(0, (elapsed / total) * 100));
  return Math.round(percent);
});

// Ensure virtuals are included in JSON
ExpeditionSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret.__v;
    return ret;
  }
});

// Static method to find active expedition for character
ExpeditionSchema.statics.findActiveForCharacter = function (characterId: string) {
  return this.findOne({
    characterId: new mongoose.Types.ObjectId(characterId),
    status: 'in_progress'
  });
};

// Static method to find expeditions due for completion
ExpeditionSchema.statics.findDueForCompletion = function () {
  return this.find({
    status: 'in_progress',
    estimatedCompletionAt: { $lte: new Date() }
  });
};

export const Expedition = mongoose.model<IExpedition>('Expedition', ExpeditionSchema);
export default Expedition;
