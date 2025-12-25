/**
 * Quest Model
 * Defines quests/missions and tracks character progress
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export type QuestType = 'main' | 'side' | 'daily' | 'weekly' | 'event';
export type QuestStatus = 'available' | 'active' | 'completed' | 'failed';
export type ObjectiveType = 'kill' | 'collect' | 'visit' | 'crime' | 'skill' | 'gold' | 'level' | 'deliver';

/**
 * Quest objective
 */
export interface QuestObjective {
  id: string;
  description: string;
  type: ObjectiveType;
  target: string; // e.g., 'npc:bandit' or 'location:saloon' or 'skill:gunslinging'
  required: number;
  current: number;
  // Phase 19.5: Optional objectives (e.g., gathering faction allies)
  optional?: boolean;              // If true, objective is not required for completion
  optionalBenefit?: string;        // Description of benefit if completed
}

/**
 * Quest reward
 */
export interface QuestReward {
  type: 'dollars' | 'xp' | 'item' | 'reputation';
  amount?: number;
  itemId?: string;
  faction?: string; // For reputation rewards: 'settlerAlliance', 'nahiCoalition', 'frontera'
}

/**
 * Quest definition (template)
 */
export interface IQuestDefinition extends Document {
  questId: string;
  name: string;
  description: string;
  type: QuestType;
  levelRequired: number;
  prerequisites: string[]; // Quest IDs that must be completed first
  objectives: Omit<QuestObjective, 'current'>[];
  rewards: QuestReward[];
  timeLimit?: number; // Minutes, for timed quests
  repeatable: boolean;
  isActive: boolean;
  dialogueIntro?: string;
  dialogueComplete?: string;
  specialFlags?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Quest seed data (for quest definition arrays in seed files)
 * This is the type to use for quest arrays in data files - it doesn't include Mongoose document fields
 */
export type QuestSeedData = Omit<IQuestDefinition, keyof Document | 'createdAt' | 'updatedAt'>;

/**
 * Character quest progress
 */
export interface ICharacterQuest extends Document {
  characterId: mongoose.Types.ObjectId;
  questId: string;
  status: QuestStatus;
  objectives: QuestObjective[];
  startedAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
}

/**
 * Quest Definition Schema
 */
const QuestDefinitionSchema = new Schema<IQuestDefinition>(
  {
    questId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['main', 'side', 'daily', 'weekly', 'event']
    },
    levelRequired: {
      type: Number,
      default: 1
    },
    prerequisites: [{
      type: String
    }],
    objectives: [{
      id: { type: String, required: true },
      description: { type: String, required: true },
      type: {
        type: String,
        required: true,
        enum: ['kill', 'collect', 'visit', 'crime', 'skill', 'gold', 'level', 'deliver']
      },
      target: { type: String, required: true },
      required: { type: Number, required: true },
      optional: { type: Boolean, default: false },
      optionalBenefit: { type: String }
    }],
    rewards: [{
      type: {
        type: String,
        enum: ['dollars', 'xp', 'item', 'reputation'],
        required: true
      },
      amount: Number,
      itemId: String,
      faction: String
    }],
    timeLimit: Number,
    repeatable: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    dialogueIntro: {
      type: String
    },
    dialogueComplete: {
      type: String
    },
    specialFlags: {
      type: Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

/**
 * Character Quest Schema
 */
const CharacterQuestSchema = new Schema<ICharacterQuest>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },
    questId: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['available', 'active', 'completed', 'failed'],
      default: 'active'
    },
    objectives: [{
      id: { type: String, required: true },
      description: { type: String, required: true },
      type: { type: String, required: true },
      target: { type: String, required: true },
      required: { type: Number, required: true },
      current: { type: Number, default: 0 }
    }],
    startedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date,
    expiresAt: Date
  },
  {
    timestamps: true
  }
);

// Indexes
CharacterQuestSchema.index({ characterId: 1, status: 1 });
CharacterQuestSchema.index({ characterId: 1, questId: 1 }, { unique: true });

export const QuestDefinition = mongoose.model<IQuestDefinition>('QuestDefinition', QuestDefinitionSchema);
export const CharacterQuest = mongoose.model<ICharacterQuest>('CharacterQuest', CharacterQuestSchema);
