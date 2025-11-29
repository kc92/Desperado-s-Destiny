/**
 * War Participant Model
 *
 * Tracks individual character participation in faction war events
 * Phase 11, Wave 11.2 - Faction War Events System
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { TerritoryFactionId as FactionId, ContributionType, WarRewardType } from '@desperados/shared';

/**
 * War reward subdocument
 */
export interface IWarReward {
  type: WarRewardType;
  amount?: number;
  itemId?: string;
  itemName?: string;
  title?: string;
  cosmeticId?: string;
  description: string;
}

/**
 * War Participant document interface
 */
export interface IWarParticipant extends Document {
  // Event reference
  warEventId: mongoose.Types.ObjectId;

  // Character info
  characterId: mongoose.Types.ObjectId;
  characterName: string;
  characterLevel: number;
  gangId?: mongoose.Types.ObjectId;
  gangName?: string;

  // Alignment
  side: FactionId;
  joinedAt: Date;

  // Contributions
  objectivesCompleted: string[];
  killCount: number;
  duelWins: number;
  supportActions: number;
  totalScore: number;

  // Performance by category
  contributionBreakdown: {
    combat: number;
    strategic: number;
    support: number;
    leadership: number;
  };

  // Rewards
  rewardsEarned: IWarReward[];
  mvpCandidate: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  addObjective(objectiveId: string, points: number, type: ContributionType): void;
  addKill(points: number): void;
  addDuelWin(points: number): void;
  addSupportAction(points: number): void;
  addContribution(type: ContributionType, points: number): void;
  calculateMVPScore(): number;
  grantReward(reward: IWarReward): void;
}

/**
 * War Participant model interface
 */
export interface IWarParticipantModel extends Model<IWarParticipant> {
  findByWarEvent(warEventId: mongoose.Types.ObjectId): Promise<IWarParticipant[]>;
  findByCharacter(characterId: mongoose.Types.ObjectId): Promise<IWarParticipant[]>;
  findBySide(warEventId: mongoose.Types.ObjectId, side: FactionId): Promise<IWarParticipant[]>;
  getLeaderboard(warEventId: mongoose.Types.ObjectId, limit?: number): Promise<IWarParticipant[]>;
  getMVPCandidates(warEventId: mongoose.Types.ObjectId): Promise<IWarParticipant[]>;
}

/**
 * War reward schema
 */
const WarRewardSchema = new Schema<IWarReward>(
  {
    type: { type: String, required: true, enum: Object.values(WarRewardType) },
    amount: { type: Number, min: 0 },
    itemId: { type: String },
    itemName: { type: String },
    title: { type: String },
    cosmeticId: { type: String },
    description: { type: String, required: true },
  },
  { _id: false }
);

/**
 * War Participant schema
 */
const WarParticipantSchema = new Schema<IWarParticipant>(
  {
    // Event reference
    warEventId: {
      type: Schema.Types.ObjectId,
      ref: 'FactionWarEvent',
      required: true,
      index: true,
    },

    // Character info
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true,
    },
    characterName: {
      type: String,
      required: true,
    },
    characterLevel: {
      type: Number,
      required: true,
      min: 1,
    },
    gangId: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
    },
    gangName: {
      type: String,
    },

    // Alignment
    side: {
      type: String,
      required: true,
      enum: Object.values(FactionId),
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },

    // Contributions
    objectivesCompleted: [{ type: String }],
    killCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    duelWins: {
      type: Number,
      default: 0,
      min: 0,
    },
    supportActions: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalScore: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    // Performance by category
    contributionBreakdown: {
      combat: { type: Number, default: 0, min: 0 },
      strategic: { type: Number, default: 0, min: 0 },
      support: { type: Number, default: 0, min: 0 },
      leadership: { type: Number, default: 0, min: 0 },
    },

    // Rewards
    rewardsEarned: [WarRewardSchema],
    mvpCandidate: {
      type: Boolean,
      default: false,
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
WarParticipantSchema.index({ warEventId: 1, characterId: 1 }, { unique: true });
WarParticipantSchema.index({ warEventId: 1, side: 1, totalScore: -1 });
WarParticipantSchema.index({ warEventId: 1, mvpCandidate: 1 });
WarParticipantSchema.index({ characterId: 1, createdAt: -1 });

/**
 * Instance method: Add completed objective
 */
WarParticipantSchema.methods.addObjective = function(
  this: IWarParticipant,
  objectiveId: string,
  points: number,
  type: ContributionType
): void {
  if (!this.objectivesCompleted.includes(objectiveId)) {
    this.objectivesCompleted.push(objectiveId);
  }
  this.addContribution(type, points);
};

/**
 * Instance method: Add kill
 */
WarParticipantSchema.methods.addKill = function(this: IWarParticipant, points: number): void {
  this.killCount += 1;
  this.addContribution(ContributionType.COMBAT, points);
};

/**
 * Instance method: Add duel win
 */
WarParticipantSchema.methods.addDuelWin = function(this: IWarParticipant, points: number): void {
  this.duelWins += 1;
  this.addContribution(ContributionType.COMBAT, points);
};

/**
 * Instance method: Add support action
 */
WarParticipantSchema.methods.addSupportAction = function(
  this: IWarParticipant,
  points: number
): void {
  this.supportActions += 1;
  this.addContribution(ContributionType.SUPPORT, points);
};

/**
 * Instance method: Add contribution to specific category
 */
WarParticipantSchema.methods.addContribution = function(
  this: IWarParticipant,
  type: ContributionType,
  points: number
): void {
  this.contributionBreakdown[type] += points;
  this.totalScore += points;
};

/**
 * Instance method: Calculate MVP score (weighted by contribution diversity)
 */
WarParticipantSchema.methods.calculateMVPScore = function(this: IWarParticipant): number {
  const { combat, strategic, support, leadership } = this.contributionBreakdown;

  // Base score is total score
  let mvpScore = this.totalScore;

  // Bonus for diverse contributions (up to 20% bonus)
  const contributionTypes = [combat, strategic, support, leadership].filter(v => v > 0).length;
  const diversityBonus = contributionTypes * 0.05; // 5% per type
  mvpScore *= 1 + diversityBonus;

  // Bonus for objectives completed
  mvpScore += this.objectivesCompleted.length * 50;

  return Math.floor(mvpScore);
};

/**
 * Instance method: Grant reward
 */
WarParticipantSchema.methods.grantReward = function(
  this: IWarParticipant,
  reward: IWarReward
): void {
  this.rewardsEarned.push(reward);
};

/**
 * Static method: Find all participants in a war event
 */
WarParticipantSchema.statics.findByWarEvent = async function(
  warEventId: mongoose.Types.ObjectId
): Promise<IWarParticipant[]> {
  return this.find({ warEventId })
    .populate('characterId', 'name level faction')
    .populate('gangId', 'name tag')
    .sort({ totalScore: -1 });
};

/**
 * Static method: Find all war participations for a character
 */
WarParticipantSchema.statics.findByCharacter = async function(
  characterId: mongoose.Types.ObjectId
): Promise<IWarParticipant[]> {
  return this.find({ characterId })
    .populate('warEventId', 'name eventType status winner')
    .sort({ createdAt: -1 });
};

/**
 * Static method: Find participants by side
 */
WarParticipantSchema.statics.findBySide = async function(
  warEventId: mongoose.Types.ObjectId,
  side: FactionId
): Promise<IWarParticipant[]> {
  return this.find({ warEventId, side })
    .populate('characterId', 'name level faction')
    .sort({ totalScore: -1 });
};

/**
 * Static method: Get leaderboard for event
 */
WarParticipantSchema.statics.getLeaderboard = async function(
  warEventId: mongoose.Types.ObjectId,
  limit: number = 50
): Promise<IWarParticipant[]> {
  return this.find({ warEventId })
    .populate('characterId', 'name level faction')
    .populate('gangId', 'name tag')
    .sort({ totalScore: -1 })
    .limit(limit);
};

/**
 * Static method: Get MVP candidates
 */
WarParticipantSchema.statics.getMVPCandidates = async function(
  warEventId: mongoose.Types.ObjectId
): Promise<IWarParticipant[]> {
  return this.find({ warEventId, mvpCandidate: true })
    .populate('characterId', 'name level faction')
    .populate('gangId', 'name tag')
    .sort({ totalScore: -1 });
};

/**
 * War Participant model
 */
export const WarParticipant = mongoose.model<IWarParticipant, IWarParticipantModel>(
  'WarParticipant',
  WarParticipantSchema
);
