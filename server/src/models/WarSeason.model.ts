/**
 * War Season Model
 *
 * Phase 2.1: Weekly War Schedule
 *
 * Tracks seasonal war competitions with:
 * - Season lifecycle (active, calculating, concluded)
 * - Tier standings per league
 * - Reward distribution
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  WarSeasonPhase,
  WarLeagueTier,
  WarSeasonReward,
  SeasonTierStanding,
  TierStandings,
  SEASON_CONFIG,
  DEFAULT_SEASON_REWARDS,
} from '@desperados/shared';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Season tier standing subdocument interface
 */
export interface ISeasonTierStanding {
  gangId: mongoose.Types.ObjectId;
  gangName: string;
  gangTag: string;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  territoriesGained: number;
  territoriesLost: number;
  totalScore: number;
}

/**
 * Tier standings collection interface
 */
export interface ITierStandings {
  tier: WarLeagueTier;
  rankings: ISeasonTierStanding[];
}

/**
 * Season reward subdocument interface
 */
export interface IWarSeasonReward {
  tier: WarLeagueTier;
  placement: number;
  goldReward: number;
  reputationReward: number;
  titleReward?: string;
  territoryBonuses?: number;
}

/**
 * War Season document interface
 */
export interface IWarSeason extends Document {
  _id: mongoose.Types.ObjectId;
  seasonNumber: number;
  name: string;
  phase: WarSeasonPhase;
  startDate: Date;
  endDate: Date;
  weeksTotal: number;
  currentWeek: number;
  tierStandings: ITierStandings[];
  rewards: IWarSeasonReward[];
  rewardsDistributed: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  updateGangStanding(
    gangId: mongoose.Types.ObjectId,
    gangName: string,
    gangTag: string,
    tier: WarLeagueTier,
    warResult: 'win' | 'loss' | 'draw',
    score: number,
    territoriesGained?: number,
    territoriesLost?: number
  ): Promise<void>;
  getGangRank(gangId: mongoose.Types.ObjectId, tier: WarLeagueTier): number;
  advanceWeek(): Promise<boolean>;
  shouldConclude(): boolean;
}

/**
 * War Season model statics
 */
export interface IWarSeasonModel extends Model<IWarSeason> {
  findActiveSeason(): Promise<IWarSeason | null>;
  createNewSeason(name?: string, weeksTotal?: number): Promise<IWarSeason>;
  concludeSeason(seasonId: mongoose.Types.ObjectId): Promise<IWarSeason>;
}

// =============================================================================
// SUBDOCUMENT SCHEMAS
// =============================================================================

/**
 * Season tier standing subdocument schema
 */
const SeasonTierStandingSchema = new Schema<ISeasonTierStanding>(
  {
    gangId: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
      required: true,
    },
    gangName: { type: String, required: true },
    gangTag: { type: String, required: true },
    wins: { type: Number, default: 0, min: 0 },
    losses: { type: Number, default: 0, min: 0 },
    draws: { type: Number, default: 0, min: 0 },
    points: { type: Number, default: 0, min: 0 },
    territoriesGained: { type: Number, default: 0, min: 0 },
    territoriesLost: { type: Number, default: 0, min: 0 },
    totalScore: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

/**
 * Tier standings collection subdocument schema
 */
const TierStandingsSchema = new Schema<ITierStandings>(
  {
    tier: {
      type: String,
      enum: Object.values(WarLeagueTier),
      required: true,
    },
    rankings: [SeasonTierStandingSchema],
  },
  { _id: false }
);

/**
 * Season reward subdocument schema
 */
const WarSeasonRewardSchema = new Schema<IWarSeasonReward>(
  {
    tier: {
      type: String,
      enum: Object.values(WarLeagueTier),
      required: true,
    },
    placement: { type: Number, required: true, min: 1 },
    goldReward: { type: Number, required: true, min: 0 },
    reputationReward: { type: Number, required: true, min: 0 },
    titleReward: { type: String },
    territoryBonuses: { type: Number, min: 0 },
  },
  { _id: false }
);

// =============================================================================
// MAIN SCHEMA
// =============================================================================

/**
 * War Season schema
 */
const WarSeasonSchema = new Schema<IWarSeason, IWarSeasonModel>(
  {
    seasonNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phase: {
      type: String,
      enum: Object.values(WarSeasonPhase),
      required: true,
      default: WarSeasonPhase.ACTIVE,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    weeksTotal: {
      type: Number,
      required: true,
      min: SEASON_CONFIG.MIN_WEEKS,
      max: SEASON_CONFIG.MAX_WEEKS,
      default: SEASON_CONFIG.DEFAULT_WEEKS,
    },
    currentWeek: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    tierStandings: {
      type: [TierStandingsSchema],
      default: () => initializeTierStandings(),
    },
    rewards: {
      type: [WarSeasonRewardSchema],
      default: () => DEFAULT_SEASON_REWARDS,
    },
    rewardsDistributed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// =============================================================================
// INDEXES
// =============================================================================

WarSeasonSchema.index({ seasonNumber: 1 }, { unique: true });
WarSeasonSchema.index({ phase: 1 });
WarSeasonSchema.index({ startDate: 1, endDate: 1 });
WarSeasonSchema.index({ 'tierStandings.rankings.gangId': 1 });

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Initialize empty tier standings for all tiers
 */
function initializeTierStandings(): ITierStandings[] {
  return Object.values(WarLeagueTier).map((tier) => ({
    tier,
    rankings: [],
  }));
}

/**
 * Generate season name based on number
 */
function generateSeasonName(seasonNumber: number): string {
  const themes = [
    'The Frontier Wars',
    'Blood on the Range',
    'The Desperado Uprising',
    'Dust and Gold',
    'The Outlaw Era',
    'Wild West Reckoning',
    'The Territory Clash',
    'Showdown Season',
    'The Gang Vendetta',
    'Prairie Fire',
  ];
  const theme = themes[(seasonNumber - 1) % themes.length];
  return `Season ${seasonNumber}: ${theme}`;
}

// =============================================================================
// STATIC METHODS
// =============================================================================

/**
 * Find the currently active season
 */
WarSeasonSchema.statics.findActiveSeason = async function (): Promise<IWarSeason | null> {
  return this.findOne({ phase: WarSeasonPhase.ACTIVE }).sort({ seasonNumber: -1 });
};

/**
 * Create a new season
 */
WarSeasonSchema.statics.createNewSeason = async function (
  name?: string,
  weeksTotal: number = SEASON_CONFIG.DEFAULT_WEEKS
): Promise<IWarSeason> {
  // Get the latest season number
  const latestSeason = await this.findOne().sort({ seasonNumber: -1 });
  const newSeasonNumber = latestSeason ? latestSeason.seasonNumber + 1 : 1;

  // Calculate dates
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + weeksTotal * 7);

  const seasonName = name || generateSeasonName(newSeasonNumber);

  const season = new this({
    seasonNumber: newSeasonNumber,
    name: seasonName,
    phase: WarSeasonPhase.ACTIVE,
    startDate,
    endDate,
    weeksTotal,
    currentWeek: 1,
  });

  return season.save();
};

/**
 * Conclude a season and transition to calculating phase
 */
WarSeasonSchema.statics.concludeSeason = async function (
  seasonId: mongoose.Types.ObjectId
): Promise<IWarSeason> {
  const season = await this.findById(seasonId);
  if (!season) {
    throw new Error('Season not found');
  }

  if (season.phase !== WarSeasonPhase.ACTIVE) {
    throw new Error('Season is not active');
  }

  season.phase = WarSeasonPhase.CALCULATING;
  await season.save();

  // Sort all tier rankings by points (descending)
  for (const tierStanding of season.tierStandings) {
    tierStanding.rankings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return b.territoriesGained - a.territoriesGained;
    });
  }

  season.phase = WarSeasonPhase.CONCLUDED;
  return season.save();
};

// =============================================================================
// INSTANCE METHODS
// =============================================================================

/**
 * Add or update a gang's standing in the season
 */
WarSeasonSchema.methods.updateGangStanding = async function (
  gangId: mongoose.Types.ObjectId,
  gangName: string,
  gangTag: string,
  tier: WarLeagueTier,
  warResult: 'win' | 'loss' | 'draw',
  score: number,
  territoriesGained: number = 0,
  territoriesLost: number = 0
): Promise<void> {
  // Find the tier standings
  const tierStanding = this.tierStandings.find(
    (ts: ITierStandings) => ts.tier === tier
  );
  if (!tierStanding) return;

  // Find existing gang entry or create new
  let gangStanding = tierStanding.rankings.find(
    (r: ISeasonTierStanding) => r.gangId.toString() === gangId.toString()
  );

  if (!gangStanding) {
    gangStanding = {
      gangId,
      gangName,
      gangTag,
      wins: 0,
      losses: 0,
      draws: 0,
      points: 0,
      territoriesGained: 0,
      territoriesLost: 0,
      totalScore: 0,
    };
    tierStanding.rankings.push(gangStanding);
  }

  // Update stats
  switch (warResult) {
    case 'win':
      gangStanding.wins += 1;
      gangStanding.points += SEASON_CONFIG.WIN_POINTS;
      break;
    case 'loss':
      gangStanding.losses += 1;
      gangStanding.points += SEASON_CONFIG.LOSS_POINTS;
      break;
    case 'draw':
      gangStanding.draws += 1;
      gangStanding.points += SEASON_CONFIG.DRAW_POINTS;
      break;
  }

  gangStanding.totalScore += score;
  gangStanding.territoriesGained += territoriesGained;
  gangStanding.territoriesLost += territoriesLost;

  await this.save();
};

/**
 * Get gang's current rank in their tier
 */
WarSeasonSchema.methods.getGangRank = function (
  gangId: mongoose.Types.ObjectId,
  tier: WarLeagueTier
): number {
  const tierStanding = this.tierStandings.find(
    (ts: ITierStandings) => ts.tier === tier
  );
  if (!tierStanding) return -1;

  // Sort by points (descending)
  const sorted = [...tierStanding.rankings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.totalScore - a.totalScore;
  });

  const index = sorted.findIndex(
    (r) => r.gangId.toString() === gangId.toString()
  );
  return index === -1 ? -1 : index + 1;
};

/**
 * Advance to next week
 */
WarSeasonSchema.methods.advanceWeek = async function (): Promise<boolean> {
  if (this.currentWeek >= this.weeksTotal) {
    return false; // Season should conclude
  }

  this.currentWeek += 1;
  await this.save();
  return true;
};

/**
 * Check if season should conclude
 */
WarSeasonSchema.methods.shouldConclude = function (): boolean {
  return (
    this.currentWeek >= this.weeksTotal ||
    new Date() >= this.endDate
  );
};

// =============================================================================
// MODEL EXPORT
// =============================================================================

export const WarSeason = mongoose.model<IWarSeason, IWarSeasonModel>(
  'WarSeason',
  WarSeasonSchema
);

export default WarSeason;
