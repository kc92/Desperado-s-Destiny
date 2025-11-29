/**
 * Shooting Record Model
 * Tracks player shooting contest records and statistics
 */

import mongoose, { Schema, Document } from 'mongoose';
import type { ContestType } from '@desperados/shared';

/**
 * CONTEST TYPE RECORD SCHEMA
 */
const ContestTypeRecordSchema = new Schema({
  contestType: {
    type: String,
    enum: [
      'target_shooting',
      'quick_draw',
      'trick_shooting',
      'skeet_shooting',
      'long_range',
      'dueling'
    ],
    required: true
  },
  bestScore: { type: Number, required: true, default: 0 },
  bestAccuracy: { type: Number, required: true, default: 0 }, // Percentage
  fastestTime: { type: Number, required: true, default: Infinity },
  contestId: { type: Schema.Types.ObjectId, ref: 'ShootingContest' },
  achievedAt: { type: Date, required: true }
}, { _id: false });

/**
 * TITLE EARNED SCHEMA
 */
const TitleEarnedSchema = new Schema({
  title: { type: String, required: true },
  contestType: {
    type: String,
    enum: [
      'target_shooting',
      'quick_draw',
      'trick_shooting',
      'skeet_shooting',
      'long_range',
      'dueling'
    ],
    required: true
  },
  earnedAt: { type: Date, required: true },
  contestId: { type: Schema.Types.ObjectId, ref: 'ShootingContest', required: true }
}, { _id: false });

/**
 * SHOOTING RECORD INTERFACE
 */
export interface IShootingRecord extends Document {
  characterId: mongoose.Types.ObjectId;
  characterName: string;

  // Records by contest type
  records: Array<{
    contestType: ContestType;
    bestScore: number;
    bestAccuracy: number;
    fastestTime: number;
    contestId?: mongoose.Types.ObjectId;
    achievedAt: Date;
  }>;

  // Overall statistics
  contestsEntered: number;
  contestsWon: number;
  totalPrizeMoney: number;

  // Titles earned
  titles: Array<{
    title: string;
    contestType: ContestType;
    earnedAt: Date;
    contestId: mongoose.Types.ObjectId;
  }>;

  // Consecutive wins (for streaks)
  currentWinStreak: number;
  bestWinStreak: number;

  // Last contest
  lastContestDate?: Date;

  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  updateRecord(contestType: ContestType, score: number, accuracy: number, time: number, contestId: string): void;
  addTitle(title: string, contestType: ContestType, contestId: string): void;
  recordEntry(): void;
  recordWin(prizeMoney: number): void;
  recordLoss(prizeMoney?: number): void;
  getWinRate(): number;
  getRecordForType(contestType: ContestType): any;
  getTitlesForType(contestType: ContestType): any[];
}

/**
 * SHOOTING RECORD MODEL INTERFACE
 */
export interface IShootingRecordModel extends mongoose.Model<IShootingRecord> {
  findOrCreate(characterId: string, characterName: string): Promise<IShootingRecord>;
  getLeaderboardByWins(limit?: number): Promise<IShootingRecord[]>;
  getLeaderboardByPrizeMoney(limit?: number): Promise<IShootingRecord[]>;
  getLeaderboardByType(contestType: ContestType, limit?: number): Promise<IShootingRecord[]>;
}

/**
 * SHOOTING RECORD SCHEMA
 */
const ShootingRecordSchema = new Schema<IShootingRecord>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      unique: true
    },
    characterName: { type: String, required: true },

    // Records by contest type
    records: [ContestTypeRecordSchema],

    // Overall statistics
    contestsEntered: { type: Number, required: true, default: 0 },
    contestsWon: { type: Number, required: true, default: 0 },
    totalPrizeMoney: { type: Number, required: true, default: 0 },

    // Titles earned
    titles: [TitleEarnedSchema],

    // Consecutive wins
    currentWinStreak: { type: Number, required: true, default: 0 },
    bestWinStreak: { type: Number, required: true, default: 0 },

    // Last contest
    lastContestDate: { type: Date }
  },
  {
    timestamps: true
  }
);

/**
 * INDEXES
 */
ShootingRecordSchema.index({ characterId: 1 }, { unique: true });
ShootingRecordSchema.index({ contestsWon: -1 });
ShootingRecordSchema.index({ totalPrizeMoney: -1 });
ShootingRecordSchema.index({ 'records.contestType': 1, 'records.bestScore': -1 });

/**
 * METHODS
 */

/**
 * Update record for contest type
 */
ShootingRecordSchema.methods.updateRecord = function(
  contestType: ContestType,
  score: number,
  accuracy: number,
  time: number,
  contestId: string
) {
  let record = this.records.find((r: any) => r.contestType === contestType);

  if (!record) {
    // First record for this type
    this.records.push({
      contestType,
      bestScore: score,
      bestAccuracy: accuracy,
      fastestTime: time,
      contestId,
      achievedAt: new Date()
    });
  } else {
    // Update if better
    let updated = false;

    if (score > record.bestScore) {
      record.bestScore = score;
      updated = true;
    }

    if (accuracy > record.bestAccuracy) {
      record.bestAccuracy = accuracy;
      updated = true;
    }

    if (time < record.fastestTime) {
      record.fastestTime = time;
      updated = true;
    }

    if (updated) {
      record.contestId = contestId;
      record.achievedAt = new Date();
    }
  }
};

/**
 * Add title earned
 */
ShootingRecordSchema.methods.addTitle = function(
  title: string,
  contestType: ContestType,
  contestId: string
) {
  // Check if title already earned
  const hasTitle = this.titles.some((t: any) => t.title === title);

  if (!hasTitle) {
    this.titles.push({
      title,
      contestType,
      earnedAt: new Date(),
      contestId
    });
  }
};

/**
 * Record contest entry
 */
ShootingRecordSchema.methods.recordEntry = function() {
  this.contestsEntered += 1;
  this.lastContestDate = new Date();
};

/**
 * Record contest win
 */
ShootingRecordSchema.methods.recordWin = function(prizeMoney: number) {
  this.contestsWon += 1;
  this.totalPrizeMoney += prizeMoney;
  this.currentWinStreak += 1;

  if (this.currentWinStreak > this.bestWinStreak) {
    this.bestWinStreak = this.currentWinStreak;
  }
};

/**
 * Record contest loss
 */
ShootingRecordSchema.methods.recordLoss = function(prizeMoney: number = 0) {
  this.currentWinStreak = 0;

  if (prizeMoney > 0) {
    this.totalPrizeMoney += prizeMoney;
  }
};

/**
 * Get win rate
 */
ShootingRecordSchema.methods.getWinRate = function(): number {
  if (this.contestsEntered === 0) return 0;
  return (this.contestsWon / this.contestsEntered) * 100;
};

/**
 * Get record for contest type
 */
ShootingRecordSchema.methods.getRecordForType = function(contestType: ContestType) {
  return this.records.find((r: any) => r.contestType === contestType);
};

/**
 * Get all titles for contest type
 */
ShootingRecordSchema.methods.getTitlesForType = function(contestType: ContestType) {
  return this.titles.filter((t: any) => t.contestType === contestType);
};

/**
 * STATICS
 */

/**
 * Find or create record for character
 */
ShootingRecordSchema.statics.findOrCreate = async function(
  characterId: string,
  characterName: string
): Promise<IShootingRecord> {
  let record = await this.findOne({ characterId });

  if (!record) {
    record = await this.create({
      characterId,
      characterName,
      records: [],
      contestsEntered: 0,
      contestsWon: 0,
      totalPrizeMoney: 0,
      titles: [],
      currentWinStreak: 0,
      bestWinStreak: 0
    });
  }

  return record;
};

/**
 * Get leaderboard by wins
 */
ShootingRecordSchema.statics.getLeaderboardByWins = async function(limit: number = 10) {
  return this.find({})
    .sort({ contestsWon: -1, totalPrizeMoney: -1 })
    .limit(limit)
    .lean();
};

/**
 * Get leaderboard by prize money
 */
ShootingRecordSchema.statics.getLeaderboardByPrizeMoney = async function(limit: number = 10) {
  return this.find({})
    .sort({ totalPrizeMoney: -1 })
    .limit(limit)
    .lean();
};

/**
 * Get leaderboard for contest type
 */
ShootingRecordSchema.statics.getLeaderboardByType = async function(
  contestType: ContestType,
  limit: number = 10
) {
  return this.find({ 'records.contestType': contestType })
    .sort({ 'records.bestScore': -1 })
    .limit(limit)
    .lean();
};

/**
 * EXPORT MODEL
 */
export const ShootingRecord = mongoose.model<IShootingRecord, IShootingRecordModel>(
  'ShootingRecord',
  ShootingRecordSchema
);
