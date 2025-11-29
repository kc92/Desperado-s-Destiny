/**
 * NPC Gang Relationship Model
 *
 * Tracks relationships between player gangs and NPC gangs
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  NPCGangId,
  RelationshipAttitude,
  RELATIONSHIP_THRESHOLDS,
} from '@desperados/shared';

/**
 * Challenge progress subdocument
 */
export interface IChallengeProgress {
  targetZone: string;
  missionsCompleted: number;
  missionsRequired: number;
  completedMissionTypes: string[];
  startedAt: Date;
  expiresAt: Date;
}

/**
 * NPC Gang Relationship document interface
 */
export interface INPCGangRelationship extends Document {
  playerGangId: mongoose.Types.ObjectId;
  npcGangId: NPCGangId;
  relationshipScore: number;
  attitude: RelationshipAttitude;
  tributePaid: boolean;
  lastTributeDate?: Date;
  tributeStreak: number;
  completedMissions: string[];
  activeConflict: boolean;
  conflictReason?: string;
  challengeProgress?: IChallengeProgress;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  updateAttitude(): void;
  changeRelationship(amount: number, reason: string): void;
  payTribute(): void;
  startChallenge(zoneId: string, missionsRequired: number): void;
  completeChallengeMission(missionType: string): boolean;
  isChallengeComplete(): boolean;
  canAcceptMissions(): boolean;
}

/**
 * NPC Gang Relationship model interface
 */
export interface INPCGangRelationshipModel extends Model<INPCGangRelationship> {
  findByPlayerGang(playerGangId: mongoose.Types.ObjectId): Promise<INPCGangRelationship[]>;
  findRelationship(
    playerGangId: mongoose.Types.ObjectId,
    npcGangId: NPCGangId
  ): Promise<INPCGangRelationship | null>;
  initializeRelationship(
    playerGangId: mongoose.Types.ObjectId,
    npcGangId: NPCGangId
  ): Promise<INPCGangRelationship>;
}

/**
 * Challenge progress schema
 */
const ChallengeProgressSchema = new Schema<IChallengeProgress>(
  {
    targetZone: {
      type: String,
      required: true,
    },
    missionsCompleted: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    missionsRequired: {
      type: Number,
      required: true,
      default: 3,
      min: 1,
    },
    completedMissionTypes: [{
      type: String,
    }],
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { _id: false }
);

/**
 * NPC Gang Relationship schema
 */
const NPCGangRelationshipSchema = new Schema<INPCGangRelationship>(
  {
    playerGangId: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
      required: true,
      index: true,
    },
    npcGangId: {
      type: String,
      required: true,
      enum: Object.values(NPCGangId),
      index: true,
    },
    relationshipScore: {
      type: Number,
      required: true,
      default: 0,
      min: -100,
      max: 100,
    },
    attitude: {
      type: String,
      required: true,
      enum: Object.values(RelationshipAttitude),
      default: RelationshipAttitude.NEUTRAL,
    },
    tributePaid: {
      type: Boolean,
      default: false,
    },
    lastTributeDate: {
      type: Date,
    },
    tributeStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedMissions: [{
      type: String,
    }],
    activeConflict: {
      type: Boolean,
      default: false,
      index: true,
    },
    conflictReason: {
      type: String,
    },
    challengeProgress: {
      type: ChallengeProgressSchema,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for efficient querying
 */
NPCGangRelationshipSchema.index({ playerGangId: 1, npcGangId: 1 }, { unique: true });
NPCGangRelationshipSchema.index({ playerGangId: 1, attitude: 1 });
NPCGangRelationshipSchema.index({ npcGangId: 1, relationshipScore: -1 });

/**
 * Instance method: Update attitude based on relationship score
 */
NPCGangRelationshipSchema.methods.updateAttitude = function(this: INPCGangRelationship): void {
  const score = this.relationshipScore;

  if (score <= RELATIONSHIP_THRESHOLDS.HOSTILE) {
    this.attitude = RelationshipAttitude.HOSTILE;
  } else if (score <= RELATIONSHIP_THRESHOLDS.UNFRIENDLY) {
    this.attitude = RelationshipAttitude.UNFRIENDLY;
  } else if (score >= RELATIONSHIP_THRESHOLDS.ALLIED) {
    this.attitude = RelationshipAttitude.ALLIED;
  } else if (score >= RELATIONSHIP_THRESHOLDS.FRIENDLY) {
    this.attitude = RelationshipAttitude.FRIENDLY;
  } else {
    this.attitude = RelationshipAttitude.NEUTRAL;
  }
};

/**
 * Instance method: Change relationship score
 */
NPCGangRelationshipSchema.methods.changeRelationship = function(
  this: INPCGangRelationship,
  amount: number,
  reason: string
): void {
  this.relationshipScore = Math.max(-100, Math.min(100, this.relationshipScore + amount));
  this.updateAttitude();

  // Special cases
  if (reason === 'betrayal') {
    this.activeConflict = true;
    this.conflictReason = 'Betrayed trust';
    this.relationshipScore = -100;
    this.attitude = RelationshipAttitude.HOSTILE;
  }
};

/**
 * Instance method: Pay tribute
 */
NPCGangRelationshipSchema.methods.payTribute = function(this: INPCGangRelationship): void {
  this.tributePaid = true;
  this.lastTributeDate = new Date();
  this.tributeStreak += 1;

  // Bonus reputation for streak
  const streakBonus = Math.min(this.tributeStreak, 5);
  this.changeRelationship(5 + streakBonus, 'tribute_paid');
};

/**
 * Instance method: Start territory challenge
 */
NPCGangRelationshipSchema.methods.startChallenge = function(
  this: INPCGangRelationship,
  zoneId: string,
  missionsRequired: number = 3
): void {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days to complete

  this.challengeProgress = {
    targetZone: zoneId,
    missionsCompleted: 0,
    missionsRequired,
    completedMissionTypes: [],
    startedAt: new Date(),
    expiresAt,
  };
};

/**
 * Instance method: Complete a challenge mission
 */
NPCGangRelationshipSchema.methods.completeChallengeMission = function(
  this: INPCGangRelationship,
  missionType: string
): boolean {
  if (!this.challengeProgress) {
    return false;
  }

  // Don't count duplicate mission types
  if (this.challengeProgress.completedMissionTypes.includes(missionType)) {
    return false;
  }

  this.challengeProgress.completedMissionTypes.push(missionType);
  this.challengeProgress.missionsCompleted += 1;

  return this.isChallengeComplete();
};

/**
 * Instance method: Check if challenge is complete
 */
NPCGangRelationshipSchema.methods.isChallengeComplete = function(
  this: INPCGangRelationship
): boolean {
  if (!this.challengeProgress) {
    return false;
  }

  return this.challengeProgress.missionsCompleted >= this.challengeProgress.missionsRequired;
};

/**
 * Instance method: Check if can accept missions
 */
NPCGangRelationshipSchema.methods.canAcceptMissions = function(
  this: INPCGangRelationship
): boolean {
  // Can't accept missions if hostile or in active conflict
  if (this.attitude === RelationshipAttitude.HOSTILE || this.activeConflict) {
    return false;
  }

  return true;
};

/**
 * Pre-save hook: Update attitude before saving
 */
NPCGangRelationshipSchema.pre('save', function(next) {
  if (this.isModified('relationshipScore')) {
    this.updateAttitude();
  }

  // Reset tribute paid status if more than 7 days
  if (this.lastTributeDate) {
    const daysSince = (Date.now() - this.lastTributeDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince > 7) {
      this.tributePaid = false;
      this.tributeStreak = 0;
    }
  }

  next();
});

/**
 * Static method: Find all relationships for a player gang
 */
NPCGangRelationshipSchema.statics.findByPlayerGang = async function(
  playerGangId: mongoose.Types.ObjectId
): Promise<INPCGangRelationship[]> {
  return this.find({ playerGangId }).sort({ relationshipScore: -1 });
};

/**
 * Static method: Find specific relationship
 */
NPCGangRelationshipSchema.statics.findRelationship = async function(
  playerGangId: mongoose.Types.ObjectId,
  npcGangId: NPCGangId
): Promise<INPCGangRelationship | null> {
  return this.findOne({ playerGangId, npcGangId });
};

/**
 * Static method: Initialize relationship for new gang
 */
NPCGangRelationshipSchema.statics.initializeRelationship = async function(
  playerGangId: mongoose.Types.ObjectId,
  npcGangId: NPCGangId
): Promise<INPCGangRelationship> {
  const existing = await this.findOne({ playerGangId, npcGangId });
  if (existing) {
    return existing;
  }

  return this.create({
    playerGangId,
    npcGangId,
    relationshipScore: 0,
    attitude: RelationshipAttitude.NEUTRAL,
    tributePaid: false,
    tributeStreak: 0,
    completedMissions: [],
    activeConflict: false,
  });
};

/**
 * NPC Gang Relationship model
 */
export const NPCGangRelationship = mongoose.model<INPCGangRelationship, INPCGangRelationshipModel>(
  'NPCGangRelationship',
  NPCGangRelationshipSchema
);
