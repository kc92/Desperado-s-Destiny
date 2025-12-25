import mongoose, { Schema, Document } from 'mongoose';
import {
  RaidTargetType,
  RaidStatus,
  RaidOutcome,
  RaidParticipantRole,
  IRaidResult,
  IRaidParticipant,
  IStolenItem,
  NPCGangId,
  AttackType,
} from '@desperados/shared';

/**
 * Raid document interface
 */
export interface IRaid extends Document {
  _id: mongoose.Types.ObjectId;

  // Gang references
  attackingGangId: mongoose.Types.ObjectId;
  attackingGangName: string;
  defendingGangId?: mongoose.Types.ObjectId;
  defendingGangName?: string;

  // Target information
  targetType: RaidTargetType;
  targetId: mongoose.Types.ObjectId;
  targetName: string;
  zoneId: string;

  // Status
  status: RaidStatus;

  // Timing
  plannedAt: Date;
  scheduledFor?: Date;
  startedAt?: Date;
  completedAt?: Date;

  // Leadership and participants
  leaderId: mongoose.Types.ObjectId;
  leaderName: string;
  participants: IRaidParticipant[];

  // Combat calculations
  attackPower: number;
  defensePower: number;
  successRoll: number;

  // Result
  result?: IRaidResult;

  // War context
  warId?: mongoose.Types.ObjectId;
  isWarRaid: boolean;

  // NPC Gang Attack fields (for tracking NPC-initiated raids)
  isNPCRaid: boolean;
  npcGangId?: NPCGangId;
  npcAttackType?: AttackType;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  canCancel(): boolean;
  canJoin(): boolean;
  getParticipantCount(): number;
  isParticipant(characterId: string): boolean;
}

/**
 * Raid model interface with static methods
 */
export interface IRaidModel extends mongoose.Model<IRaid> {
  findActiveRaidsForGang(gangId: mongoose.Types.ObjectId): mongoose.Query<IRaid[], IRaid>;
  findReadyForExecution(): mongoose.Query<IRaid[], IRaid>;
  findRecentRaidsOnTarget(
    attackingGangId: mongoose.Types.ObjectId,
    targetId: mongoose.Types.ObjectId,
    cooldownMs: number
  ): mongoose.Query<IRaid | null, IRaid>;
  findNPCRaidsAgainstGang(
    defendingGangId: mongoose.Types.ObjectId,
    limit?: number
  ): mongoose.Query<IRaid[], IRaid>;
}

/**
 * Raid participant subdocument schema
 */
const RaidParticipantSchema = new Schema<IRaidParticipant>({
  characterId: { type: String, required: true },
  characterName: { type: String },
  role: {
    type: String,
    enum: Object.values(RaidParticipantRole),
    required: true
  },
  contribution: { type: Number, default: 0 },
  joinedAt: { type: Date, default: Date.now },
}, { _id: false });

/**
 * Stolen item subdocument schema
 */
const StolenItemSchema = new Schema<IStolenItem>({
  itemId: { type: String, required: true },
  itemName: { type: String },
  quantity: { type: Number, required: true },
}, { _id: false });

/**
 * Raid result subdocument schema
 */
const RaidResultSchema = new Schema<IRaidResult>({
  outcome: {
    type: String,
    enum: Object.values(RaidOutcome),
    required: true
  },
  damageDealt: { type: Number, required: true },
  goldStolen: { type: Number },
  influenceLost: { type: Number },
  productionHaltHours: { type: Number },
  conditionDamage: { type: Number },
  storageLostPercent: { type: Number },
  itemsStolen: [StolenItemSchema],
  defenderCasualties: { type: Number },
  attackerCasualties: { type: Number },
  xpAwarded: { type: Number, required: true },
  goldAwarded: { type: Number, required: true },
  insuranceRecovery: { type: Number },
}, { _id: false });

/**
 * Main Raid Schema
 */
const RaidSchema = new Schema<IRaid>({
  // Gang references
  attackingGangId: {
    type: Schema.Types.ObjectId,
    ref: 'Gang',
    required: true,
    index: true
  },
  attackingGangName: { type: String, required: true },
  defendingGangId: {
    type: Schema.Types.ObjectId,
    ref: 'Gang',
    index: true
  },
  defendingGangName: { type: String },

  // Target information
  targetType: {
    type: String,
    enum: Object.values(RaidTargetType),
    required: true
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  targetName: { type: String, required: true },
  zoneId: { type: String, required: true, index: true },

  // Status
  status: {
    type: String,
    enum: Object.values(RaidStatus),
    default: RaidStatus.PLANNING,
    index: true
  },

  // Timing
  plannedAt: { type: Date, default: Date.now },
  scheduledFor: { type: Date, index: true },
  startedAt: { type: Date },
  completedAt: { type: Date },

  // Leadership and participants
  leaderId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true
  },
  leaderName: { type: String, required: true },
  participants: [RaidParticipantSchema],

  // Combat calculations
  attackPower: { type: Number, default: 0 },
  defensePower: { type: Number, default: 0 },
  successRoll: { type: Number, default: 0 },

  // Result (populated after completion)
  result: RaidResultSchema,

  // War context
  warId: { type: Schema.Types.ObjectId, ref: 'GangWar' },
  isWarRaid: { type: Boolean, default: false },

  // NPC Gang Attack fields
  isNPCRaid: { type: Boolean, default: false },
  npcGangId: { type: String, enum: Object.values(NPCGangId) },
  npcAttackType: { type: String, enum: Object.values(AttackType) },
}, {
  timestamps: true,
  collection: 'raids'
});

// Compound indexes for efficient queries
RaidSchema.index({ status: 1, scheduledFor: 1 });
RaidSchema.index({ attackingGangId: 1, status: 1 });
RaidSchema.index({ defendingGangId: 1, status: 1 });
RaidSchema.index({ targetId: 1, completedAt: -1 });
RaidSchema.index({ warId: 1, status: 1 });
RaidSchema.index({ leaderId: 1, status: 1 });
RaidSchema.index({ isNPCRaid: 1, npcGangId: 1, defendingGangId: 1 });

// Text index for searching
RaidSchema.index({ targetName: 'text', attackingGangName: 'text', defendingGangName: 'text' });

/**
 * Static method: Find active raids for a gang (attacking or defending)
 */
RaidSchema.statics.findActiveRaidsForGang = function(gangId: mongoose.Types.ObjectId) {
  return this.find({
    $or: [
      { attackingGangId: gangId },
      { defendingGangId: gangId }
    ],
    status: { $in: [RaidStatus.PLANNING, RaidStatus.SCHEDULED, RaidStatus.IN_PROGRESS] }
  }).sort({ scheduledFor: 1 });
};

/**
 * Static method: Find scheduled raids ready for execution
 */
RaidSchema.statics.findReadyForExecution = function() {
  return this.find({
    status: RaidStatus.SCHEDULED,
    scheduledFor: { $lte: new Date() }
  });
};

/**
 * Static method: Find raids on cooldown for a specific target
 */
RaidSchema.statics.findRecentRaidsOnTarget = function(
  attackingGangId: mongoose.Types.ObjectId,
  targetId: mongoose.Types.ObjectId,
  cooldownMs: number
) {
  const cooldownStart = new Date(Date.now() - cooldownMs);
  return this.findOne({
    attackingGangId,
    targetId,
    completedAt: { $gte: cooldownStart },
    status: { $in: [RaidStatus.COMPLETED, RaidStatus.DEFENDED] }
  });
};

/**
 * Static method: Find NPC raids against a player gang
 */
RaidSchema.statics.findNPCRaidsAgainstGang = function(
  defendingGangId: mongoose.Types.ObjectId,
  limit: number = 20
) {
  return this.find({
    defendingGangId,
    isNPCRaid: true
  })
    .sort({ completedAt: -1 })
    .limit(limit);
};

/**
 * Instance method: Check if raid can be cancelled
 */
RaidSchema.methods.canCancel = function(): boolean {
  return this.status === RaidStatus.PLANNING || this.status === RaidStatus.SCHEDULED;
};

/**
 * Instance method: Check if raid can be joined
 */
RaidSchema.methods.canJoin = function(): boolean {
  return this.status === RaidStatus.PLANNING;
};

/**
 * Instance method: Get participant count
 */
RaidSchema.methods.getParticipantCount = function(): number {
  return this.participants.length;
};

/**
 * Instance method: Check if character is participant
 */
RaidSchema.methods.isParticipant = function(characterId: string): boolean {
  return this.participants.some((p: IRaidParticipant) => p.characterId === characterId);
};

export const Raid = mongoose.model<IRaid, IRaidModel>('Raid', RaidSchema);
