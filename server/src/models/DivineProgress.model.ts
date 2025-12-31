/**
 * Divine Progress Model - Divine Struggle System - PRIMARY SOURCE
 *
 * Persists divine path questline progress to survive server restarts.
 * This is the canonical source for all divine questline tracking.
 *
 * For backwards compatibility with old code, see CosmicProgress.model.ts
 * The MongoDB collection remains 'cosmicprogresses' for database preservation.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { DivineAct, SinEffect } from '@desperados/shared';

// =============================================================================
// TYPES
// =============================================================================

export interface ISinState {
  level: number;
  threshold: number;
  effects: SinEffect[];
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

export interface IDivineProgress extends Document {
  characterId: mongoose.Types.ObjectId;
  currentQuest: string;
  completedQuests: string[];
  currentAct: DivineAct;
  sinState: ISinState;
  discoveredLore: string[];
  experiencedVisions: string[];
  journalEntries: IJournalEntry[];
  majorChoices: IMajorChoice[];
  npcRelationships: INPCRelationship[];
  ending?: string;
  /** The ending path the player is pursuing (e.g., 'salvation', 'covenant', 'ascension') */
  endingPath?: string;
  /** When the divine questline was completed */
  completedAt?: Date;
  startedAt: Date;
  lastProgressAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // Backwards compatibility getters (old cosmic horror names)
  /** @deprecated Use sinState */
  readonly corruption: ISinState;

  // Instance methods
  addSin(amount: number, source: string): number;
  completeQuest(questId: string): void;
  addJournalEntry(entry: Omit<IJournalEntry, 'unlockedAt'>): void;
  recordChoice(questId: string, choiceId: string, consequence?: string): void;
}

export interface IDivineProgressModel extends Model<IDivineProgress> {
  findByCharacter(characterId: string | mongoose.Types.ObjectId): Promise<IDivineProgress | null>;
  hasStarted(characterId: string | mongoose.Types.ObjectId): Promise<boolean>;
}

// =============================================================================
// SCHEMA
// =============================================================================

const SinStateSchema = new Schema<ISinState>(
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

const DivineProgressSchema = new Schema<IDivineProgress>(
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
      enum: Object.values(DivineAct).filter(v => typeof v === 'number'),
      default: DivineAct.WHISPERS,
    },
    sinState: {
      type: SinStateSchema,
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
    collection: 'cosmicprogresses', // Keep same MongoDB collection for backwards compatibility
  }
);

// =============================================================================
// INDEXES
// =============================================================================

// Compound index for character + current quest queries
DivineProgressSchema.index({ characterId: 1, currentQuest: 1 });

// Index for finding characters by act
DivineProgressSchema.index({ currentAct: 1 });

// Index for finding characters by sin level
DivineProgressSchema.index({ 'sinState.level': 1 });

// =============================================================================
// STATIC METHODS
// =============================================================================

DivineProgressSchema.statics.findByCharacter = async function (
  characterId: string | mongoose.Types.ObjectId
): Promise<IDivineProgress | null> {
  const id = typeof characterId === 'string'
    ? new mongoose.Types.ObjectId(characterId)
    : characterId;
  return this.findOne({ characterId: id });
};

DivineProgressSchema.statics.hasStarted = async function (
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

DivineProgressSchema.methods.addSin = function (
  amount: number,
  source: string
): number {
  this.sinState.level = Math.min(
    this.sinState.level + amount,
    this.sinState.threshold
  );
  this.sinState.lastUpdate = new Date();
  return this.sinState.level;
};

DivineProgressSchema.methods.completeQuest = function (questId: string): void {
  if (!this.completedQuests.includes(questId)) {
    this.completedQuests.push(questId);
  }
  this.lastProgressAt = new Date();
};

DivineProgressSchema.methods.addJournalEntry = function (
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

DivineProgressSchema.methods.recordChoice = function (
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
// VIRTUAL GETTERS FOR BACKWARDS COMPATIBILITY
// =============================================================================

/**
 * @deprecated Use sinState
 */
DivineProgressSchema.virtual('corruption').get(function(this: IDivineProgress) {
  return this.sinState;
});

// =============================================================================
// MIDDLEWARE
// =============================================================================

DivineProgressSchema.pre('save', function (next) {
  (this as IDivineProgress).lastProgressAt = new Date();
  next();
});

// =============================================================================
// EXPORT
// =============================================================================

/**
 * Divine Progress model - PRIMARY
 * Uses 'cosmicprogresses' collection for backwards compatibility
 */
export const DivineProgress = mongoose.model<IDivineProgress, IDivineProgressModel>(
  'DivineProgress',
  DivineProgressSchema,
  'cosmicprogresses' // Explicit collection name for backwards compatibility
);

// =============================================================================
// BACKWARDS COMPATIBILITY ALIASES
// =============================================================================

/** @deprecated Use IDivineProgress */
export type ICosmicProgress = IDivineProgress;

/** @deprecated Use IDivineProgressModel */
export type ICosmicProgressModel = IDivineProgressModel;

/** @deprecated Use ISinState */
export type ICorruptionState = ISinState;

/** @deprecated Use DivineProgress */
export const CosmicProgress = DivineProgress;

/**
 * Field mapping reference:
 *
 * Old (Cosmic Horror)         →  New (Divine Struggle)
 * ----------------------------------------------------------
 * CosmicProgress              →  DivineProgress
 * ICosmicProgress             →  IDivineProgress
 * CosmicAct                   →  DivineAct
 * corruption                  →  sinState
 * ICorruptionState            →  ISinState
 * addCorruption()             →  addSin()
 */
