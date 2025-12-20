/**
 * Cosmic Progress Model
 * Persists cosmic questline progress to survive server restarts
 * Replaces the in-memory cosmicProgressMap in cosmicQuest.service.ts
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { CosmicAct, CorruptionEffect } from '@desperados/shared';

// =============================================================================
// TYPES
// =============================================================================

export interface ICorruptionState {
  level: number;
  threshold: number;
  effects: CorruptionEffect[];
  gainedAt: Date;
  lastUpdate: Date;
}

export interface IMajorChoice {
  questId: string;
  choiceId: string;
  chosenAt: Date;
  consequence?: string;
}

export interface INPCRelationship {
  npcId: string;
  disposition: number;
  interactions: number;
  lastInteraction: Date;
}

export interface IJournalEntry {
  entryId: string;
  title: string;
  content: string;
  unlockedAt: Date;
  category: 'lore' | 'vision' | 'discovery' | 'choice';
}

export interface ICosmicProgress extends Document {
  characterId: mongoose.Types.ObjectId;
  currentQuest: string;
  completedQuests: string[];
  currentAct: CosmicAct;
  corruption: ICorruptionState;
  discoveredLore: string[];
  experiencedVisions: string[];
  journalEntries: IJournalEntry[];
  majorChoices: IMajorChoice[];
  npcRelationships: INPCRelationship[];
  ending?: string;
  /** The ending path the player is pursuing (e.g., 'ascension', 'resistance', 'corruption') */
  endingPath?: string;
  /** When the cosmic questline was completed */
  completedAt?: Date;
  startedAt: Date;
  lastProgressAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICosmicProgressModel extends Model<ICosmicProgress> {
  findByCharacter(characterId: string | mongoose.Types.ObjectId): Promise<ICosmicProgress | null>;
  hasStarted(characterId: string | mongoose.Types.ObjectId): Promise<boolean>;
}

// =============================================================================
// SCHEMA
// =============================================================================

const CorruptionStateSchema = new Schema<ICorruptionState>(
  {
    level: { type: Number, default: 0, min: 0, max: 1000 },
    threshold: { type: Number, default: 100 },
    effects: [{ type: Schema.Types.Mixed }],
    gainedAt: { type: Date, default: Date.now },
    lastUpdate: { type: Date, default: Date.now },
  },
  { _id: false }
);

const MajorChoiceSchema = new Schema<IMajorChoice>(
  {
    questId: { type: String, required: true },
    choiceId: { type: String, required: true },
    chosenAt: { type: Date, default: Date.now },
    consequence: { type: String },
  },
  { _id: false }
);

const NPCRelationshipSchema = new Schema<INPCRelationship>(
  {
    npcId: { type: String, required: true },
    disposition: { type: Number, default: 0 },
    interactions: { type: Number, default: 0 },
    lastInteraction: { type: Date, default: Date.now },
  },
  { _id: false }
);

const JournalEntrySchema = new Schema<IJournalEntry>(
  {
    entryId: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now },
    category: {
      type: String,
      enum: ['lore', 'vision', 'discovery', 'choice'],
      default: 'lore',
    },
  },
  { _id: false }
);

const CosmicProgressSchema = new Schema<ICosmicProgress>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      unique: true,
      index: true,
    },
    currentQuest: {
      type: String,
      default: '',
    },
    completedQuests: [{
      type: String,
    }],
    currentAct: {
      type: Number,
      enum: Object.values(CosmicAct).filter(v => typeof v === 'number'),
      default: CosmicAct.WHISPERS,
    },
    corruption: {
      type: CorruptionStateSchema,
      default: () => ({
        level: 0,
        threshold: 100,
        effects: [],
        gainedAt: new Date(),
        lastUpdate: new Date(),
      }),
    },
    discoveredLore: [{
      type: String,
    }],
    experiencedVisions: [{
      type: String,
    }],
    journalEntries: [JournalEntrySchema],
    majorChoices: [MajorChoiceSchema],
    npcRelationships: [NPCRelationshipSchema],
    ending: {
      type: String,
    },
    endingPath: {
      type: String,
    },
    completedAt: {
      type: Date,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastProgressAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// =============================================================================
// INDEXES
// =============================================================================

// Compound index for character + current quest queries
CosmicProgressSchema.index({ characterId: 1, currentQuest: 1 });

// Index for finding characters by act
CosmicProgressSchema.index({ currentAct: 1 });

// Index for finding characters by corruption level
CosmicProgressSchema.index({ 'corruption.level': 1 });

// =============================================================================
// STATIC METHODS
// =============================================================================

CosmicProgressSchema.statics.findByCharacter = async function (
  characterId: string | mongoose.Types.ObjectId
): Promise<ICosmicProgress | null> {
  const id = typeof characterId === 'string'
    ? new mongoose.Types.ObjectId(characterId)
    : characterId;
  return this.findOne({ characterId: id });
};

CosmicProgressSchema.statics.hasStarted = async function (
  characterId: string | mongoose.Types.ObjectId
): Promise<boolean> {
  const id = typeof characterId === 'string'
    ? new mongoose.Types.ObjectId(characterId)
    : characterId;
  const progress = await this.findOne({ characterId: id }).select('_id').lean();
  return progress !== null;
};

// =============================================================================
// INSTANCE METHODS
// =============================================================================

CosmicProgressSchema.methods.addCorruption = function (
  amount: number,
  source: string
): number {
  this.corruption.level = Math.min(
    this.corruption.level + amount,
    this.corruption.threshold
  );
  this.corruption.lastUpdate = new Date();
  return this.corruption.level;
};

CosmicProgressSchema.methods.completeQuest = function (questId: string): void {
  if (!this.completedQuests.includes(questId)) {
    this.completedQuests.push(questId);
  }
  this.lastProgressAt = new Date();
};

CosmicProgressSchema.methods.addJournalEntry = function (
  entry: Omit<IJournalEntry, 'unlockedAt'>
): void {
  const existing = this.journalEntries.find(
    (e: IJournalEntry) => e.entryId === entry.entryId
  );
  if (!existing) {
    this.journalEntries.push({
      ...entry,
      unlockedAt: new Date(),
    });
  }
};

CosmicProgressSchema.methods.recordChoice = function (
  questId: string,
  choiceId: string,
  consequence?: string
): void {
  this.majorChoices.push({
    questId,
    choiceId,
    chosenAt: new Date(),
    consequence,
  });
  this.lastProgressAt = new Date();
};

// =============================================================================
// MIDDLEWARE
// =============================================================================

CosmicProgressSchema.pre('save', function (next) {
  (this as ICosmicProgress).lastProgressAt = new Date();
  next();
});

// =============================================================================
// EXPORT
// =============================================================================

export const CosmicProgress = mongoose.model<ICosmicProgress, ICosmicProgressModel>(
  'CosmicProgress',
  CosmicProgressSchema
);
