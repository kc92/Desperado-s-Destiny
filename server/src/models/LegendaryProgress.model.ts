/**
 * Legendary Quest Progress Model
 * Tracks player progress through legendary quest chains
 */

import mongoose, { Schema, Document } from 'mongoose';
import type {
  ChainProgress,
  QuestProgress,
  LegendaryQuestPlayerData,
} from '@desperados/shared';

// Quest Progress Sub-Schema
const QuestProgressSchema = new Schema<QuestProgress>(
  {
    questId: { type: String, required: true },
    status: {
      type: String,
      enum: ['locked', 'available', 'in_progress', 'completed', 'failed'],
      default: 'locked',
    },
    startedAt: { type: Date },
    completedAt: { type: Date },

    // Objective tracking
    completedObjectives: [{ type: String }],
    currentObjective: { type: String },

    // Choice tracking
    choicesMade: {
      type: Map,
      of: String,
      default: {},
    },

    // Puzzle progress
    puzzleProgress: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },

    // Combat tracking
    encountersCompleted: [{ type: String }],
  },
  { _id: false }
);

// Chain Progress Sub-Schema
const ChainProgressSchema = new Schema<ChainProgress>(
  {
    chainId: { type: String, required: true },
    status: {
      type: String,
      enum: ['locked', 'available', 'in_progress', 'completed'],
      default: 'locked',
    },
    startedAt: { type: Date },
    completedAt: { type: Date },

    // Quest tracking
    currentQuestNumber: { type: Number, default: 0 },
    questProgresses: [QuestProgressSchema],

    // Milestones
    milestonesReached: [{ type: Number }],

    // Statistics
    totalPlayTime: { type: Number, default: 0 }, // seconds
    deathCount: { type: Number, default: 0 },
    choicesMade: {
      type: Map,
      of: String,
      default: {},
    },

    // Rewards claimed
    rewardsClaimed: [{ type: String }],
  },
  { _id: false }
);

// Main Player Data Interface
export interface ILegendaryProgress extends Document {
  characterId: mongoose.Types.ObjectId;

  // All chain progress
  chainProgresses: ChainProgress[];

  // Unlocks
  unlockedChains: string[];
  completedChains: string[];

  // Collections
  uniqueItemsObtained: string[];
  titlesUnlocked: string[];
  loreEntriesUnlocked: string[];

  // Statistics
  totalQuestsCompleted: number;
  totalPlayTime: number;
  legendaryAchievements: string[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Methods
  getChainProgress(chainId: string): ChainProgress | undefined;
  getQuestProgress(chainId: string, questId: string): QuestProgress | undefined;
  startChain(chainId: string): void;
  startQuest(chainId: string, questId: string): void;
  completeQuest(chainId: string, questId: string): void;
  completeChain(chainId: string): void;
  unlockChain(chainId: string): void;
  isChainUnlocked(chainId: string): boolean;
  isChainCompleted(chainId: string): boolean;
  getCurrentQuest(chainId: string): QuestProgress | undefined;
  getCompletionPercentage(chainId: string): number;
  getTotalCompletionPercentage(): number;
}

// Main Schema
const LegendaryProgressSchema = new Schema<ILegendaryProgress>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      unique: true,
      index: true,
    },

    // All chain progress
    chainProgresses: {
      type: [ChainProgressSchema],
      default: [],
    },

    // Unlocks
    unlockedChains: {
      type: [String],
      default: [],
    },
    completedChains: {
      type: [String],
      default: [],
    },

    // Collections
    uniqueItemsObtained: {
      type: [String],
      default: [],
    },
    titlesUnlocked: {
      type: [String],
      default: [],
    },
    loreEntriesUnlocked: {
      type: [String],
      default: [],
    },

    // Statistics
    totalQuestsCompleted: {
      type: Number,
      default: 0,
    },
    totalPlayTime: {
      type: Number,
      default: 0,
    },
    legendaryAchievements: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
LegendaryProgressSchema.index({ characterId: 1 });
LegendaryProgressSchema.index({ unlockedChains: 1 });
LegendaryProgressSchema.index({ completedChains: 1 });

// Instance Methods

LegendaryProgressSchema.methods.getChainProgress = function (
  chainId: string
): ChainProgress | undefined {
  return this.chainProgresses.find((cp: ChainProgress) => cp.chainId === chainId);
};

LegendaryProgressSchema.methods.getQuestProgress = function (
  chainId: string,
  questId: string
): QuestProgress | undefined {
  const chainProgress = this.getChainProgress(chainId);
  if (!chainProgress) return undefined;
  return chainProgress.questProgresses.find(
    (qp: QuestProgress) => qp.questId === questId
  );
};

LegendaryProgressSchema.methods.startChain = function (chainId: string): void {
  // Check if chain already exists
  let chainProgress = this.getChainProgress(chainId);

  if (!chainProgress) {
    // Create new chain progress
    chainProgress = {
      chainId,
      status: 'in_progress',
      startedAt: new Date(),
      currentQuestNumber: 1,
      questProgresses: [],
      milestonesReached: [],
      totalPlayTime: 0,
      deathCount: 0,
      choicesMade: {},
      rewardsClaimed: [],
    };
    this.chainProgresses.push(chainProgress);
  } else {
    // Update existing
    chainProgress.status = 'in_progress';
    chainProgress.startedAt = new Date();
  }

  // Unlock if not already
  if (!this.unlockedChains.includes(chainId)) {
    this.unlockedChains.push(chainId);
  }
};

LegendaryProgressSchema.methods.startQuest = function (
  chainId: string,
  questId: string
): void {
  const chainProgress = this.getChainProgress(chainId);
  if (!chainProgress) {
    throw new Error(`Chain ${chainId} not started`);
  }

  // Check if quest already exists
  let questProgress = chainProgress.questProgresses.find(
    (qp: QuestProgress) => qp.questId === questId
  );

  if (!questProgress) {
    // Create new quest progress
    questProgress = {
      questId,
      status: 'in_progress',
      startedAt: new Date(),
      completedObjectives: [],
      choicesMade: {},
      encountersCompleted: [],
    };
    chainProgress.questProgresses.push(questProgress);
  } else {
    // Update existing
    questProgress.status = 'in_progress';
    questProgress.startedAt = new Date();
  }
};

LegendaryProgressSchema.methods.completeQuest = function (
  chainId: string,
  questId: string
): void {
  const chainProgress = this.getChainProgress(chainId);
  if (!chainProgress) {
    throw new Error(`Chain ${chainId} not started`);
  }

  const questProgress = chainProgress.questProgresses.find(
    (qp: QuestProgress) => qp.questId === questId
  );

  if (!questProgress) {
    throw new Error(`Quest ${questId} not started`);
  }

  questProgress.status = 'completed';
  questProgress.completedAt = new Date();

  // Increment counters
  this.totalQuestsCompleted += 1;
  chainProgress.currentQuestNumber += 1;
};

LegendaryProgressSchema.methods.completeChain = function (chainId: string): void {
  const chainProgress = this.getChainProgress(chainId);
  if (!chainProgress) {
    throw new Error(`Chain ${chainId} not started`);
  }

  chainProgress.status = 'completed';
  chainProgress.completedAt = new Date();

  // Add to completed chains
  if (!this.completedChains.includes(chainId)) {
    this.completedChains.push(chainId);
  }
};

LegendaryProgressSchema.methods.unlockChain = function (chainId: string): void {
  if (!this.unlockedChains.includes(chainId)) {
    this.unlockedChains.push(chainId);
  }
};

LegendaryProgressSchema.methods.isChainUnlocked = function (chainId: string): boolean {
  return this.unlockedChains.includes(chainId);
};

LegendaryProgressSchema.methods.isChainCompleted = function (chainId: string): boolean {
  return this.completedChains.includes(chainId);
};

LegendaryProgressSchema.methods.getCurrentQuest = function (
  chainId: string
): QuestProgress | undefined {
  const chainProgress = this.getChainProgress(chainId);
  if (!chainProgress) return undefined;

  return chainProgress.questProgresses.find(
    (qp: QuestProgress) => qp.status === 'in_progress'
  );
};

LegendaryProgressSchema.methods.getCompletionPercentage = function (
  chainId: string
): number {
  const chainProgress = this.getChainProgress(chainId);
  if (!chainProgress) return 0;

  const completed = chainProgress.questProgresses.filter(
    (qp: QuestProgress) => qp.status === 'completed'
  ).length;

  const total = chainProgress.questProgresses.length;
  if (total === 0) return 0;

  return (completed / total) * 100;
};

LegendaryProgressSchema.methods.getTotalCompletionPercentage = function (): number {
  if (this.chainProgresses.length === 0) return 0;

  const totalCompleted = this.chainProgresses.reduce((sum: number, cp: ChainProgress) => {
    const completed = cp.questProgresses.filter(
      (qp: QuestProgress) => qp.status === 'completed'
    ).length;
    return sum + completed;
  }, 0);

  const totalQuests = this.chainProgresses.reduce(
    (sum: number, cp: ChainProgress) => sum + cp.questProgresses.length,
    0
  );

  if (totalQuests === 0) return 0;
  return (totalCompleted / totalQuests) * 100;
};

// Static Methods

LegendaryProgressSchema.statics.findByCharacterId = function (
  characterId: mongoose.Types.ObjectId
) {
  return this.findOne({ characterId });
};

LegendaryProgressSchema.statics.createForCharacter = async function (
  characterId: mongoose.Types.ObjectId
) {
  return this.create({
    characterId,
    chainProgresses: [],
    unlockedChains: [],
    completedChains: [],
    uniqueItemsObtained: [],
    titlesUnlocked: [],
    loreEntriesUnlocked: [],
    totalQuestsCompleted: 0,
    totalPlayTime: 0,
    legendaryAchievements: [],
  });
};

// Model
export const LegendaryProgress = mongoose.model<ILegendaryProgress>(
  'LegendaryProgress',
  LegendaryProgressSchema
);

export default LegendaryProgress;
