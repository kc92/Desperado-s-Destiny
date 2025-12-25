/**
 * Character War Career Model
 *
 * Phase 2.4: Lifetime career stats for war contributions (one per character)
 * Tracks historical performance across all wars.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Character War Career document interface
 */
export interface ICharacterWarCareer extends Document {
  _id: mongoose.Types.ObjectId;
  characterId: mongoose.Types.ObjectId;
  characterName: string;

  // Lifetime stats
  totalWars: number;
  totalPoints: number;
  totalMVPs: number;
  top3Finishes: number;
  top10Finishes: number;

  // Category breakdowns (lifetime)
  lifetimeCombatPoints: number;
  lifetimeRaidPoints: number;
  lifetimeTerritoryPoints: number;
  lifetimeResourcePoints: number;
  lifetimeSupportPoints: number;
  lifetimeLeadershipPoints: number;

  // Records
  bestSingleWarPoints: number;
  bestSingleWarId?: mongoose.Types.ObjectId;
  longestMVPStreak: number;
  currentMVPStreak: number;

  // Titles earned
  titles: string[];

  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  addWarResult(
    warId: mongoose.Types.ObjectId,
    points: number,
    rank: number,
    totalParticipants: number,
    categoryBreakdown: {
      combat: number;
      raids: number;
      territory: number;
      resources: number;
      support: number;
      leadership: number;
    },
    wasMVP: boolean
  ): void;
}

/**
 * Character War Career model interface with static methods
 */
export interface ICharacterWarCareerModel extends Model<ICharacterWarCareer> {
  /**
   * Find or create career record for a character
   */
  findOrCreate(
    characterId: mongoose.Types.ObjectId,
    characterName: string
  ): Promise<ICharacterWarCareer>;

  /**
   * Get career leaderboard (top N by total points or MVPs)
   */
  getCareerLeaderboard(
    sortBy: 'totalPoints' | 'totalMVPs' | 'totalWars',
    limit?: number
  ): Promise<ICharacterWarCareer[]>;

  /**
   * Get career stats for a specific character
   */
  getByCharacterId(characterId: mongoose.Types.ObjectId): Promise<ICharacterWarCareer | null>;
}

/**
 * Character War Career schema definition
 */
const CharacterWarCareerSchema = new Schema<ICharacterWarCareer>(
  {
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      required: true,
      unique: true,
      index: true,
    },
    characterName: {
      type: String,
      required: true,
    },

    // Lifetime stats
    totalWars: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0, index: true },
    totalMVPs: { type: Number, default: 0, index: true },
    top3Finishes: { type: Number, default: 0 },
    top10Finishes: { type: Number, default: 0 },

    // Category breakdowns
    lifetimeCombatPoints: { type: Number, default: 0 },
    lifetimeRaidPoints: { type: Number, default: 0 },
    lifetimeTerritoryPoints: { type: Number, default: 0 },
    lifetimeResourcePoints: { type: Number, default: 0 },
    lifetimeSupportPoints: { type: Number, default: 0 },
    lifetimeLeadershipPoints: { type: Number, default: 0 },

    // Records
    bestSingleWarPoints: { type: Number, default: 0 },
    bestSingleWarId: { type: Schema.Types.ObjectId, ref: 'GangWar' },
    longestMVPStreak: { type: Number, default: 0 },
    currentMVPStreak: { type: Number, default: 0 },

    // Titles
    titles: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// Indexes for leaderboard queries
CharacterWarCareerSchema.index({ totalMVPs: -1 });
CharacterWarCareerSchema.index({ totalWars: -1 });

/**
 * Instance method: Add war result to career stats
 */
CharacterWarCareerSchema.methods.addWarResult = function (
  warId: mongoose.Types.ObjectId,
  points: number,
  rank: number,
  totalParticipants: number,
  categoryBreakdown: {
    combat: number;
    raids: number;
    territory: number;
    resources: number;
    support: number;
    leadership: number;
  },
  wasMVP: boolean
): void {
  // Update participation count
  this.totalWars += 1;
  this.totalPoints += points;

  // Update category breakdowns
  this.lifetimeCombatPoints += categoryBreakdown.combat;
  this.lifetimeRaidPoints += categoryBreakdown.raids;
  this.lifetimeTerritoryPoints += categoryBreakdown.territory;
  this.lifetimeResourcePoints += categoryBreakdown.resources;
  this.lifetimeSupportPoints += categoryBreakdown.support;
  this.lifetimeLeadershipPoints += categoryBreakdown.leadership;

  // Update placement stats
  if (rank <= 3) {
    this.top3Finishes += 1;
  }
  if (rank <= 10) {
    this.top10Finishes += 1;
  }

  // Update MVP stats
  if (wasMVP) {
    this.totalMVPs += 1;
    this.currentMVPStreak += 1;
    if (this.currentMVPStreak > this.longestMVPStreak) {
      this.longestMVPStreak = this.currentMVPStreak;
    }
  } else {
    this.currentMVPStreak = 0;
  }

  // Update best war record
  if (points > this.bestSingleWarPoints) {
    this.bestSingleWarPoints = points;
    this.bestSingleWarId = warId;
  }
};

/**
 * Static: Find or create career record
 */
CharacterWarCareerSchema.statics.findOrCreate = async function (
  characterId: mongoose.Types.ObjectId,
  characterName: string
): Promise<ICharacterWarCareer> {
  let career = await this.findOne({ characterId });
  if (!career) {
    career = await this.create({
      characterId,
      characterName,
    });
  }
  return career;
};

/**
 * Static: Get career leaderboard
 */
CharacterWarCareerSchema.statics.getCareerLeaderboard = async function (
  sortBy: 'totalPoints' | 'totalMVPs' | 'totalWars' = 'totalPoints',
  limit: number = 10
): Promise<ICharacterWarCareer[]> {
  return this.find({ totalWars: { $gt: 0 } })
    .sort({ [sortBy]: -1 })
    .limit(limit);
};

/**
 * Static: Get career stats for a specific character
 */
CharacterWarCareerSchema.statics.getByCharacterId = async function (
  characterId: mongoose.Types.ObjectId
): Promise<ICharacterWarCareer | null> {
  return this.findOne({ characterId });
};

export const CharacterWarCareer = mongoose.model<ICharacterWarCareer, ICharacterWarCareerModel>(
  'CharacterWarCareer',
  CharacterWarCareerSchema
);
