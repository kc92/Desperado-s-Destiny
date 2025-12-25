/**
 * Cattle Drive Model
 * Tracks player cattle drives and their progress
 *
 * Sprint 7: Mid-Game Content - Cattle Drives (L30 unlock)
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type DriveStatus = 'preparing' | 'in_progress' | 'event' | 'completed' | 'failed' | 'abandoned' | 'awaiting_decision';

export type DailyDecisionType = 'push_hard' | 'steady_pace' | 'rest_day' | 'take_shortcut' | 'avoid_danger';

export type CompanionRole = 'scout' | 'wrangler' | 'cook' | 'guard';

export interface IDriveEventLog {
  phaseNumber: number;
  eventId: string;
  choiceId: string;
  outcome: 'success' | 'failure';
  cattleLost: number;
  bonusGold: number;
  timestamp: Date;
}

export interface IPendingEvent {
  eventId: string;
  occurredAt: Date;
  expiresAt: Date; // Event expires after 2 hours
  timedOut?: boolean;
}

export interface IDailyDecision {
  day: number;
  deadline: Date; // Decision must be made within 4 hours
  decision?: DailyDecisionType;
  madeAt?: Date;
  timedOut?: boolean;
}

export interface IHerdStatus {
  health: number;      // 0-100, affects survival rate
  morale: number;      // 0-100, affects movement speed
  fatigue: number;     // 0-100, increases daily, rest reduces
  headCount: number;   // Current cattle count (mirrors currentCattle)
  losses: number;      // Cattle lost this drive
  lastUpdated: Date;
}

export interface IDriveCompanion {
  characterId: mongoose.Types.ObjectId;
  role: CompanionRole;
  contribution: number; // 0-100, increases as drive progresses
  joinedAt: Date;
}

export interface ICattleDrive extends Document {
  // Core identification
  characterId: mongoose.Types.ObjectId;
  driveId: string;              // Unique drive instance ID
  routeId: string;              // Reference to cattleDrives.ts route

  // Drive status
  status: DriveStatus;
  currentPhase: number;
  totalPhases: number;

  // Cattle tracking
  startingCattle: number;
  currentCattle: number;

  // Multiplayer
  participants: mongoose.Types.ObjectId[];

  // Phase 5.3: Active Gameplay Enhancement
  companions: IDriveCompanion[];        // Companion roles
  herdStatus: IHerdStatus;             // Herd health/morale tracking
  dailyDecision?: IDailyDecision;      // Current daily decision awaiting response
  decisionHistory: IDailyDecision[];   // Past decisions

  // Event history
  events: IDriveEventLog[];
  pendingEvent?: IPendingEvent;

  // Rewards tracking
  totalGoldEarned: number;
  totalXpEarned: number;

  // Timestamps
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICattleDriveModel extends Model<ICattleDrive> {
  findActiveByCharacter(characterId: string): Promise<ICattleDrive | null>;
  findActiveByParticipant(characterId: string): Promise<ICattleDrive | null>;
  findCompletedByCharacter(characterId: string, limit?: number): Promise<ICattleDrive[]>;
  findByCharacter(characterId: string): Promise<ICattleDrive[]>;
}

const DriveEventLogSchema = new Schema<IDriveEventLog>({
  phaseNumber: {
    type: Number,
    required: true
  },
  eventId: {
    type: String,
    required: true
  },
  choiceId: {
    type: String,
    required: true
  },
  outcome: {
    type: String,
    enum: ['success', 'failure'],
    required: true
  },
  cattleLost: {
    type: Number,
    default: 0
  },
  bonusGold: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const PendingEventSchema = new Schema<IPendingEvent>({
  eventId: {
    type: String,
    required: true
  },
  occurredAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  timedOut: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const DailyDecisionSchema = new Schema<IDailyDecision>({
  day: {
    type: Number,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  decision: {
    type: String,
    enum: ['push_hard', 'steady_pace', 'rest_day', 'take_shortcut', 'avoid_danger']
  },
  madeAt: {
    type: Date
  },
  timedOut: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const HerdStatusSchema = new Schema<IHerdStatus>({
  health: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 100
  },
  morale: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 100
  },
  fatigue: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  headCount: {
    type: Number,
    required: true
  },
  losses: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const DriveCompanionSchema = new Schema<IDriveCompanion>({
  characterId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true
  },
  role: {
    type: String,
    enum: ['scout', 'wrangler', 'cook', 'guard'],
    required: true
  },
  contribution: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const CattleDriveSchema = new Schema<ICattleDrive>({
  characterId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    index: true
  },
  driveId: {
    type: String,
    required: true,
    unique: true,
    default: () => uuidv4()
  },
  routeId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['preparing', 'in_progress', 'event', 'completed', 'failed', 'abandoned', 'awaiting_decision'],
    default: 'preparing'
  },
  currentPhase: {
    type: Number,
    default: 0
  },
  totalPhases: {
    type: Number,
    required: true
  },
  startingCattle: {
    type: Number,
    required: true
  },
  currentCattle: {
    type: Number,
    required: true
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'Character'
  }],
  companions: {
    type: [DriveCompanionSchema],
    default: []
  },
  herdStatus: {
    type: HerdStatusSchema,
    required: true
  },
  dailyDecision: {
    type: DailyDecisionSchema,
    default: undefined
  },
  decisionHistory: {
    type: [DailyDecisionSchema],
    default: []
  },
  events: {
    type: [DriveEventLogSchema],
    default: []
  },
  pendingEvent: {
    type: PendingEventSchema,
    default: undefined
  },
  totalGoldEarned: {
    type: Number,
    default: 0
  },
  totalXpEarned: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
CattleDriveSchema.index({ characterId: 1, status: 1 });
CattleDriveSchema.index({ status: 1, startedAt: -1 });
CattleDriveSchema.index({ participants: 1, status: 1 });

// Static methods
CattleDriveSchema.statics.findActiveByCharacter = async function(
  characterId: string
): Promise<ICattleDrive | null> {
  return this.findOne({
    characterId: new mongoose.Types.ObjectId(characterId),
    status: { $in: ['preparing', 'in_progress', 'event', 'awaiting_decision'] }
  });
};

CattleDriveSchema.statics.findActiveByParticipant = async function(
  characterId: string
): Promise<ICattleDrive | null> {
  return this.findOne({
    participants: new mongoose.Types.ObjectId(characterId),
    status: { $in: ['preparing', 'in_progress', 'event', 'awaiting_decision'] }
  });
};

CattleDriveSchema.statics.findCompletedByCharacter = async function(
  characterId: string,
  limit: number = 10
): Promise<ICattleDrive[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId),
    status: 'completed'
  })
    .sort({ completedAt: -1 })
    .limit(limit);
};

CattleDriveSchema.statics.findByCharacter = async function(
  characterId: string
): Promise<ICattleDrive[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId)
  }).sort({ startedAt: -1 });
};

export const CattleDrive = mongoose.model<ICattleDrive, ICattleDriveModel>('CattleDrive', CattleDriveSchema);
