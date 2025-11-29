/**
 * Mentorship Model
 *
 * Tracks active mentorship relationships between characters and mentor NPCs
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { MentorTrustLevel } from '@desperados/shared';

/**
 * Mentorship document interface
 */
export interface IMentorship extends Document {
  characterId: mongoose.Types.ObjectId;
  mentorId: string;
  currentTrustLevel: MentorTrustLevel;
  trustProgress: number;          // 0-100, progress to next level
  unlockedAbilities: string[];    // Ability IDs
  activeAbilityCooldowns: Map<string, Date>;
  tasksCompleted: number;
  storylineProgress: string[];    // Quest IDs completed
  startedAt: Date;
  lastInteraction: Date;
  isActive: boolean;
  leftAt?: Date;
  retainedProgress: number;       // Progress retained if they return (0-100)
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mentorship static methods interface
 */
export interface IMentorshipModel extends Model<IMentorship> {
  getActiveMentorship(characterId: string): Promise<IMentorship | null>;
  hasActiveMentor(characterId: string): Promise<boolean>;
  getMentorshipHistory(characterId: string): Promise<IMentorship[]>;
  isAbilityOnCooldown(mentorshipId: string, abilityId: string): Promise<boolean>;
  getCooldownRemaining(mentorshipId: string, abilityId: string): Promise<number>;
}

/**
 * Mentorship schema definition
 */
const MentorshipSchema = new Schema<IMentorship>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    mentorId: {
      type: String,
      required: true,
      index: true
    },
    currentTrustLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 1
    },
    trustProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    unlockedAbilities: [{
      type: String
    }],
    activeAbilityCooldowns: {
      type: Map,
      of: Date,
      default: new Map()
    },
    tasksCompleted: {
      type: Number,
      default: 0,
      min: 0
    },
    storylineProgress: [{
      type: String
    }],
    startedAt: {
      type: Date,
      default: Date.now
    },
    lastInteraction: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    leftAt: {
      type: Date
    },
    retainedProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  {
    timestamps: true
  }
);

/**
 * Indexes for efficient querying
 */
MentorshipSchema.index({ characterId: 1, isActive: 1 });
MentorshipSchema.index({ characterId: 1, mentorId: 1 });
MentorshipSchema.index({ currentTrustLevel: 1 });

/**
 * Static method: Get active mentorship for a character
 */
MentorshipSchema.statics.getActiveMentorship = async function(
  characterId: string
): Promise<IMentorship | null> {
  return this.findOne({
    characterId: new mongoose.Types.ObjectId(characterId),
    isActive: true
  });
};

/**
 * Static method: Check if character has an active mentor
 */
MentorshipSchema.statics.hasActiveMentor = async function(
  characterId: string
): Promise<boolean> {
  const count = await this.countDocuments({
    characterId: new mongoose.Types.ObjectId(characterId),
    isActive: true
  });
  return count > 0;
};

/**
 * Static method: Get mentorship history for a character
 */
MentorshipSchema.statics.getMentorshipHistory = async function(
  characterId: string
): Promise<IMentorship[]> {
  return this.find({
    characterId: new mongoose.Types.ObjectId(characterId)
  }).sort({ startedAt: -1 });
};

/**
 * Static method: Check if ability is on cooldown
 */
MentorshipSchema.statics.isAbilityOnCooldown = async function(
  mentorshipId: string,
  abilityId: string
): Promise<boolean> {
  const mentorship = await this.findById(mentorshipId);
  if (!mentorship) return false;

  const cooldowns = mentorship.activeAbilityCooldowns as Map<string, Date>;
  const cooldownEnd = cooldowns.get(abilityId);

  if (!cooldownEnd) return false;

  return new Date() < cooldownEnd;
};

/**
 * Static method: Get remaining cooldown time in minutes
 */
MentorshipSchema.statics.getCooldownRemaining = async function(
  mentorshipId: string,
  abilityId: string
): Promise<number> {
  const mentorship = await this.findById(mentorshipId);
  if (!mentorship) return 0;

  const cooldowns = mentorship.activeAbilityCooldowns as Map<string, Date>;
  const cooldownEnd = cooldowns.get(abilityId);

  if (!cooldownEnd) return 0;

  const remaining = cooldownEnd.getTime() - Date.now();
  return Math.max(0, Math.ceil(remaining / (60 * 1000)));
};

/**
 * Mentorship model
 */
export const Mentorship = mongoose.model<IMentorship, IMentorshipModel>('Mentorship', MentorshipSchema);
