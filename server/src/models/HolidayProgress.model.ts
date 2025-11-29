/**
 * Holiday Progress Model
 * Tracks player progress during holiday events
 */

import mongoose, { Schema, Document } from 'mongoose';
import {
  HolidayProgress as IHolidayProgress,
  HolidayType,
  ContestEntry,
} from '@desperados/shared';

// Instance methods interface
interface HolidayProgressMethods {
  addCompletedQuest(questId: string): void;
  hasCompletedQuest(questId: string): boolean;
  incrementDailyChallenge(challengeId: string): number;
  getDailyChallengeCount(challengeId: string): number;
  addActivity(activityId: string): void;
  addCurrency(amount: number): void;
  spendCurrency(amount: number): boolean;
  unlockAchievement(achievementId: string): void;
  earnTitle(titleId: string): void;
  collectItem(itemId: string): void;
  unlockCosmetic(cosmeticId: string): void;
  submitContest(entry: ContestEntry): void;
  getContestEntry(contestId: string): ContestEntry | undefined;
  updateTimeSpent(minutes: number): void;
  getCompletionPercentage(totalQuests: number): number;
}

// Static methods interface
interface HolidayProgressModel extends mongoose.Model<HolidayProgressDocument, {}, HolidayProgressMethods> {
  findByCharacterAndHoliday(characterId: string, holidayId: string): Promise<HolidayProgressDocument | null>;
  findActiveByHoliday(holidayId: string): Promise<HolidayProgressDocument[]>;
  getTopParticipants(holidayId: string, limit?: number): Promise<any[]>;
  getLeaderboard(holidayId: string, metric?: 'currencyEarned' | 'questsCompleted' | 'timeSpent', limit?: number): Promise<any[]>;
  initializeProgress(playerId: string, characterId: string, holidayId: string, holidayType: HolidayType): Promise<HolidayProgressDocument>;
  getPlayerStatistics(playerId: string): Promise<any[]>;
}

export interface HolidayProgressDocument
  extends Omit<IHolidayProgress, 'startedAt' | 'lastActivityAt'>,
    Document,
    HolidayProgressMethods {
  startedAt: Date;
  lastActivityAt: Date;
}

const contestEntrySchema = new Schema(
  {
    contestId: { type: String, required: true },
    contestType: { type: String, required: true },
    entry: { type: Schema.Types.Mixed, required: true },
    score: { type: Number },
    rank: { type: Number },
    submittedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const holidayProgressSchema = new Schema<HolidayProgressDocument>(
  {
    playerId: {
      type: String,
      required: true,
      index: true,
    },
    characterId: {
      type: String,
      required: true,
      index: true,
    },
    holidayId: {
      type: String,
      required: true,
      index: true,
    },
    holidayType: {
      type: String,
      enum: [
        'NEW_YEAR',
        'VALENTINE',
        'EASTER',
        'INDEPENDENCE_DAY',
        'HALLOWEEN',
        'THANKSGIVING',
        'CHRISTMAS',
      ] as HolidayType[],
      required: true,
      index: true,
    },

    // Tracking
    participated: {
      type: Boolean,
      default: false,
    },
    completedQuests: {
      type: [String],
      default: [],
      index: true,
    },
    dailyChallengesCompleted: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    activitiesParticipated: {
      type: [String],
      default: [],
    },

    // Currency
    currencyEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
    currencySpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    currencyBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Achievements
    achievementsUnlocked: {
      type: [String],
      default: [],
    },
    titlesEarned: {
      type: [String],
      default: [],
    },
    itemsCollected: {
      type: [String],
      default: [],
    },
    cosmeticsUnlocked: {
      type: [String],
      default: [],
    },

    // Contest participation
    contestEntries: {
      type: [contestEntrySchema],
      default: [],
    },

    // Statistics
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    totalTimeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: 'holidayProgress',
  }
);

// Compound indexes for efficient queries
holidayProgressSchema.index({ playerId: 1, holidayId: 1 });
holidayProgressSchema.index({ characterId: 1, holidayId: 1 }, { unique: true });
holidayProgressSchema.index({ holidayType: 1, currencyBalance: -1 });
holidayProgressSchema.index({ lastActivityAt: 1 });

// Methods
holidayProgressSchema.methods.addCompletedQuest = function (
  questId: string
): void {
  if (!this.completedQuests.includes(questId)) {
    this.completedQuests.push(questId);
    this.markModified('completedQuests');
  }
};

holidayProgressSchema.methods.hasCompletedQuest = function (
  questId: string
): boolean {
  return this.completedQuests.includes(questId);
};

holidayProgressSchema.methods.incrementDailyChallenge = function (
  challengeId: string
): number {
  const current = this.dailyChallengesCompleted.get(challengeId) || 0;
  this.dailyChallengesCompleted.set(challengeId, current + 1);
  this.markModified('dailyChallengesCompleted');
  return current + 1;
};

holidayProgressSchema.methods.getDailyChallengeCount = function (
  challengeId: string
): number {
  return this.dailyChallengesCompleted.get(challengeId) || 0;
};

holidayProgressSchema.methods.addActivity = function (
  activityId: string
): void {
  if (!this.activitiesParticipated.includes(activityId)) {
    this.activitiesParticipated.push(activityId);
    this.markModified('activitiesParticipated');
  }
};

holidayProgressSchema.methods.addCurrency = function (amount: number): void {
  if (amount <= 0) return;

  this.currencyEarned += amount;
  this.currencyBalance += amount;
  this.lastActivityAt = new Date();
};

holidayProgressSchema.methods.spendCurrency = function (
  amount: number
): boolean {
  if (amount <= 0 || this.currencyBalance < amount) {
    return false;
  }

  this.currencySpent += amount;
  this.currencyBalance -= amount;
  return true;
};

holidayProgressSchema.methods.unlockAchievement = function (
  achievementId: string
): void {
  if (!this.achievementsUnlocked.includes(achievementId)) {
    this.achievementsUnlocked.push(achievementId);
    this.markModified('achievementsUnlocked');
  }
};

holidayProgressSchema.methods.earnTitle = function (titleId: string): void {
  if (!this.titlesEarned.includes(titleId)) {
    this.titlesEarned.push(titleId);
    this.markModified('titlesEarned');
  }
};

holidayProgressSchema.methods.collectItem = function (itemId: string): void {
  if (!this.itemsCollected.includes(itemId)) {
    this.itemsCollected.push(itemId);
    this.markModified('itemsCollected');
  }
};

holidayProgressSchema.methods.unlockCosmetic = function (
  cosmeticId: string
): void {
  if (!this.cosmeticsUnlocked.includes(cosmeticId)) {
    this.cosmeticsUnlocked.push(cosmeticId);
    this.markModified('cosmeticsUnlocked');
  }
};

holidayProgressSchema.methods.submitContest = function (
  entry: ContestEntry
): void {
  this.contestEntries.push(entry);
  this.markModified('contestEntries');
};

holidayProgressSchema.methods.getContestEntry = function (
  contestId: string
): ContestEntry | undefined {
  return this.contestEntries.find((e) => e.contestId === contestId);
};

holidayProgressSchema.methods.updateTimeSpent = function (
  minutes: number
): void {
  this.totalTimeSpent += minutes;
  this.lastActivityAt = new Date();
};

holidayProgressSchema.methods.getCompletionPercentage = function (
  totalQuests: number
): number {
  if (totalQuests === 0) return 0;
  return Math.round((this.completedQuests.length / totalQuests) * 100);
};

// Statics
holidayProgressSchema.statics.findByCharacterAndHoliday = function (
  characterId: string,
  holidayId: string
) {
  return this.findOne({ characterId, holidayId });
};

holidayProgressSchema.statics.findActiveByHoliday = function (holidayId: string) {
  return this.find({ holidayId, participated: true }).sort({
    lastActivityAt: -1,
  });
};

holidayProgressSchema.statics.getTopParticipants = function (
  holidayId: string,
  limit: number = 10
) {
  return this.find({ holidayId })
    .sort({ currencyEarned: -1 })
    .limit(limit)
    .populate('characterId', 'name level');
};

holidayProgressSchema.statics.getLeaderboard = function (
  holidayId: string,
  metric: 'currencyEarned' | 'questsCompleted' | 'timeSpent' = 'currencyEarned',
  limit: number = 100
) {
  const sortField: Record<string, number> = {};

  if (metric === 'questsCompleted') {
    // Sort by array length - requires aggregation
    return this.aggregate([
      { $match: { holidayId } },
      {
        $addFields: {
          questCount: { $size: '$completedQuests' },
        },
      },
      { $sort: { questCount: -1 } },
      { $limit: limit },
    ]);
  }

  sortField[metric] = -1;
  return this.find({ holidayId })
    .sort(sortField)
    .limit(limit)
    .populate('characterId', 'name level');
};

holidayProgressSchema.statics.initializeProgress = async function (
  playerId: string,
  characterId: string,
  holidayId: string,
  holidayType: HolidayType
) {
  const existing = await this.findOne({ characterId, holidayId });
  if (existing) return existing;

  return this.create({
    playerId,
    characterId,
    holidayId,
    holidayType,
    participated: true,
    startedAt: new Date(),
  });
};

holidayProgressSchema.statics.getPlayerStatistics = async function (
  playerId: string
) {
  return this.aggregate([
    { $match: { playerId: new mongoose.Types.ObjectId(playerId) } },
    {
      $group: {
        _id: null,
        totalEventsParticipated: { $sum: 1 },
        totalCurrencyEarned: { $sum: '$currencyEarned' },
        totalQuestsCompleted: {
          $sum: { $size: '$completedQuests' },
        },
        totalAchievements: {
          $sum: { $size: '$achievementsUnlocked' },
        },
        totalTimeSpent: { $sum: '$totalTimeSpent' },
      },
    },
  ]);
};

// Pre-save middleware
holidayProgressSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.lastActivityAt = new Date();
  }
  next();
});

// Virtual for quest completion rate
holidayProgressSchema.virtual('questCompletionRate').get(function () {
  // This would need the total quest count passed in
  return this.completedQuests.length;
});

export const HolidayProgress = mongoose.model<HolidayProgressDocument, HolidayProgressModel>(
  'HolidayProgress',
  holidayProgressSchema
);
