/**
 * Tutorial Progress Model
 *
 * Tracks player tutorial progress through Hawk's mentorship (L1-10)
 * Supports 10 phases with skip/resume handling and milestone tracking
 */

import mongoose, { Schema, Document, Model, ClientSession } from 'mongoose';

/**
 * Tutorial phases - 10 phases from awakening to graduation
 */
export enum TutorialPhase {
  NOT_STARTED = 'not_started',
  AWAKENING = 'awakening',           // Phase 0: Character awakens, meets Hawk
  FIRST_COMBAT = 'first_combat',     // Phase 1: First combat encounter
  SURVIVAL = 'survival',             // Phase 2: Energy, rest, basic needs
  SKILL_TRAINING = 'skill_training', // Phase 3: Train first skill
  CONTRACTS = 'contracts',           // Phase 4: Daily contracts intro
  SOCIAL = 'social',                 // Phase 5: NPCs, factions, reputation
  FACTION_INTRO = 'faction_intro',   // Phase 6: Choose faction path
  GANG_BASICS = 'gang_basics',       // Phase 7: Gang introduction
  GRADUATION = 'graduation',         // Phase 8: Hawk's farewell, L10 ceremony
  COMPLETED = 'completed',           // Terminal: Tutorial done
  SKIPPED = 'skipped',               // Terminal: Player skipped tutorial
}

/**
 * Phase display names for UI
 */
export const PHASE_DISPLAY_NAMES: Record<TutorialPhase, string> = {
  [TutorialPhase.NOT_STARTED]: 'Not Started',
  [TutorialPhase.AWAKENING]: 'The Awakening',
  [TutorialPhase.FIRST_COMBAT]: 'First Blood',
  [TutorialPhase.SURVIVAL]: 'Desert Survival',
  [TutorialPhase.SKILL_TRAINING]: 'Learning the Ropes',
  [TutorialPhase.CONTRACTS]: 'Making a Living',
  [TutorialPhase.SOCIAL]: 'Friends & Foes',
  [TutorialPhase.FACTION_INTRO]: 'The Three Powers',
  [TutorialPhase.GANG_BASICS]: 'Strength in Numbers',
  [TutorialPhase.GRADUATION]: 'Hawk\'s Farewell',
  [TutorialPhase.COMPLETED]: 'Tutorial Complete',
  [TutorialPhase.SKIPPED]: 'Tutorial Skipped',
};

/**
 * Phase requirements and metadata
 */
export interface PhaseRequirement {
  minLevel: number;
  steps?: number;
  estimatedMinutes?: number;
  triggerCondition?: string;
  terminal?: boolean;
}

export const PHASE_REQUIREMENTS: Record<TutorialPhase, PhaseRequirement> = {
  [TutorialPhase.NOT_STARTED]: { minLevel: 1, triggerCondition: 'character_created' },
  [TutorialPhase.AWAKENING]: { minLevel: 1, steps: 5, estimatedMinutes: 5 },
  [TutorialPhase.FIRST_COMBAT]: { minLevel: 1, steps: 8, estimatedMinutes: 10 },
  [TutorialPhase.SURVIVAL]: { minLevel: 2, steps: 6, estimatedMinutes: 8 },
  [TutorialPhase.SKILL_TRAINING]: { minLevel: 3, steps: 7, estimatedMinutes: 10 },
  [TutorialPhase.CONTRACTS]: { minLevel: 4, steps: 6, estimatedMinutes: 8 },
  [TutorialPhase.SOCIAL]: { minLevel: 5, steps: 5, estimatedMinutes: 7 },
  [TutorialPhase.FACTION_INTRO]: { minLevel: 6, steps: 8, estimatedMinutes: 12 },
  [TutorialPhase.GANG_BASICS]: { minLevel: 8, steps: 7, estimatedMinutes: 10 },
  [TutorialPhase.GRADUATION]: { minLevel: 10, steps: 4, estimatedMinutes: 5 },
  [TutorialPhase.COMPLETED]: { minLevel: 10, terminal: true },
  [TutorialPhase.SKIPPED]: { minLevel: 1, terminal: true },
};

/**
 * Valid phase transitions
 */
export const PHASE_TRANSITIONS: Record<TutorialPhase, TutorialPhase[]> = {
  [TutorialPhase.NOT_STARTED]: [TutorialPhase.AWAKENING, TutorialPhase.SKIPPED],
  [TutorialPhase.AWAKENING]: [TutorialPhase.FIRST_COMBAT, TutorialPhase.SKIPPED],
  [TutorialPhase.FIRST_COMBAT]: [TutorialPhase.SURVIVAL, TutorialPhase.SKIPPED],
  [TutorialPhase.SURVIVAL]: [TutorialPhase.SKILL_TRAINING, TutorialPhase.SKIPPED],
  [TutorialPhase.SKILL_TRAINING]: [TutorialPhase.CONTRACTS, TutorialPhase.SKIPPED],
  [TutorialPhase.CONTRACTS]: [TutorialPhase.SOCIAL, TutorialPhase.SKIPPED],
  [TutorialPhase.SOCIAL]: [TutorialPhase.FACTION_INTRO, TutorialPhase.SKIPPED],
  [TutorialPhase.FACTION_INTRO]: [TutorialPhase.GANG_BASICS, TutorialPhase.SKIPPED],
  [TutorialPhase.GANG_BASICS]: [TutorialPhase.GRADUATION, TutorialPhase.SKIPPED],
  [TutorialPhase.GRADUATION]: [TutorialPhase.COMPLETED],
  [TutorialPhase.COMPLETED]: [],
  [TutorialPhase.SKIPPED]: [],
};

/**
 * Get the next phase in sequence
 */
export function getNextPhase(currentPhase: TutorialPhase): TutorialPhase | null {
  const transitions = PHASE_TRANSITIONS[currentPhase];
  if (!transitions || transitions.length === 0) return null;
  // Return the first non-skip transition (the natural progression)
  return transitions.find(p => p !== TutorialPhase.SKIPPED) || null;
}

/**
 * Get phase index for progress calculation
 */
export function getPhaseIndex(phase: TutorialPhase): number {
  const phases = [
    TutorialPhase.NOT_STARTED,
    TutorialPhase.AWAKENING,
    TutorialPhase.FIRST_COMBAT,
    TutorialPhase.SURVIVAL,
    TutorialPhase.SKILL_TRAINING,
    TutorialPhase.CONTRACTS,
    TutorialPhase.SOCIAL,
    TutorialPhase.FACTION_INTRO,
    TutorialPhase.GANG_BASICS,
    TutorialPhase.GRADUATION,
    TutorialPhase.COMPLETED,
  ];
  return phases.indexOf(phase);
}

/**
 * Per-phase progress tracking
 */
export interface PhaseProgressData {
  startedAt: Date;
  completedAt?: Date;
  stepsCompleted: number;
  objectivesCompleted: string[];
}

/**
 * Skip reason types
 */
export type SkipReason = 'user_request' | 'overlevel' | 'returning_player';

/**
 * Tutorial Progress document interface
 */
export interface ITutorialProgress extends Document {
  characterId: mongoose.Types.ObjectId;

  // Current state
  currentPhase: TutorialPhase;
  currentStep: number;
  totalStepsCompleted: number;

  // Phase tracking
  phasesCompleted: TutorialPhase[];
  phaseStartedAt: Date;
  phaseCompletedAt?: Date;

  // Per-phase progress (for resume functionality)
  phaseProgress: Map<string, PhaseProgressData>;

  // Mechanics learned (for conditional tips)
  mechanicsLearned: string[];

  // Milestones
  milestonesEarned: string[];

  // Skip handling
  wasSkipped: boolean;
  skippedAt?: Date;
  skippedAtPhase?: TutorialPhase;
  skippedAtLevel?: number;
  skipReason?: SkipReason;

  // Completion
  completedAt?: Date;
  graduationRewardsClaimed: boolean;

  // Statistics
  totalTimeInTutorial: number;
  combatWinsInTutorial: number;
  skillsTrainedInTutorial: number;
  contractsCompletedInTutorial: number;

  // Session tracking
  lastSessionAt: Date;
  sessionCount: number;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Static methods interface
 */
export interface ITutorialProgressModel extends Model<ITutorialProgress> {
  findByCharacterId(characterId: string | mongoose.Types.ObjectId): Promise<ITutorialProgress | null>;
  findOrCreate(characterId: string | mongoose.Types.ObjectId, session?: ClientSession): Promise<ITutorialProgress>;
  getCompletionStats(): Promise<{ total: number; completed: number; skipped: number; inProgress: number }>;
}

/**
 * Tutorial Progress Schema
 */
const TutorialProgressSchema = new Schema<ITutorialProgress>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      index: true
    },

    // Current state
    currentPhase: {
      type: String,
      enum: Object.values(TutorialPhase),
      default: TutorialPhase.NOT_STARTED
    },
    currentStep: {
      type: Number,
      default: 0,
      min: 0
    },
    totalStepsCompleted: {
      type: Number,
      default: 0,
      min: 0
    },

    // Phase tracking
    phasesCompleted: [{
      type: String,
      enum: Object.values(TutorialPhase)
    }],
    phaseStartedAt: {
      type: Date,
      default: Date.now
    },
    phaseCompletedAt: {
      type: Date
    },

    // Per-phase progress
    phaseProgress: {
      type: Map,
      of: {
        startedAt: { type: Date, required: true },
        completedAt: { type: Date },
        stepsCompleted: { type: Number, default: 0 },
        objectivesCompleted: [{ type: String }]
      },
      default: new Map()
    },

    // Mechanics learned
    mechanicsLearned: [{
      type: String
    }],

    // Milestones
    milestonesEarned: [{
      type: String
    }],

    // Skip handling
    wasSkipped: {
      type: Boolean,
      default: false
    },
    skippedAt: {
      type: Date
    },
    skippedAtPhase: {
      type: String,
      enum: Object.values(TutorialPhase)
    },
    skippedAtLevel: {
      type: Number
    },
    skipReason: {
      type: String,
      enum: ['user_request', 'overlevel', 'returning_player']
    },

    // Completion
    completedAt: {
      type: Date
    },
    graduationRewardsClaimed: {
      type: Boolean,
      default: false
    },

    // Statistics
    totalTimeInTutorial: {
      type: Number,
      default: 0,
      min: 0
    },
    combatWinsInTutorial: {
      type: Number,
      default: 0,
      min: 0
    },
    skillsTrainedInTutorial: {
      type: Number,
      default: 0,
      min: 0
    },
    contractsCompletedInTutorial: {
      type: Number,
      default: 0,
      min: 0
    },

    // Session tracking
    lastSessionAt: {
      type: Date,
      default: Date.now
    },
    sessionCount: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  {
    timestamps: true
  }
);

// Indexes
TutorialProgressSchema.index({ characterId: 1 }, { unique: true });
TutorialProgressSchema.index({ currentPhase: 1 });
TutorialProgressSchema.index({ wasSkipped: 1, completedAt: 1 });

/**
 * Static: Find by character ID
 */
TutorialProgressSchema.statics.findByCharacterId = async function(
  characterId: string | mongoose.Types.ObjectId
): Promise<ITutorialProgress | null> {
  const id = typeof characterId === 'string'
    ? new mongoose.Types.ObjectId(characterId)
    : characterId;
  return this.findOne({ characterId: id });
};

/**
 * Static: Find or create tutorial progress for a character
 */
TutorialProgressSchema.statics.findOrCreate = async function(
  characterId: string | mongoose.Types.ObjectId,
  session?: ClientSession
): Promise<ITutorialProgress> {
  const id = typeof characterId === 'string'
    ? new mongoose.Types.ObjectId(characterId)
    : characterId;

  let progress = await this.findOne({ characterId: id }).session(session || null);

  if (!progress) {
    const newProgress = new this({
      characterId: id,
      currentPhase: TutorialPhase.NOT_STARTED,
      currentStep: 0,
      phaseStartedAt: new Date(),
      lastSessionAt: new Date()
    });
    progress = await newProgress.save({ session });
  }

  return progress;
};

/**
 * Static: Get completion statistics
 */
TutorialProgressSchema.statics.getCompletionStats = async function(): Promise<{
  total: number;
  completed: number;
  skipped: number;
  inProgress: number;
}> {
  const [stats] = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$currentPhase', TutorialPhase.COMPLETED] }, 1, 0] }
        },
        skipped: {
          $sum: { $cond: [{ $eq: ['$wasSkipped', true] }, 1, 0] }
        }
      }
    }
  ]);

  if (!stats) {
    return { total: 0, completed: 0, skipped: 0, inProgress: 0 };
  }

  return {
    total: stats.total,
    completed: stats.completed,
    skipped: stats.skipped,
    inProgress: stats.total - stats.completed - stats.skipped
  };
};

export const TutorialProgress = mongoose.model<ITutorialProgress, ITutorialProgressModel>(
  'TutorialProgress',
  TutorialProgressSchema
);
