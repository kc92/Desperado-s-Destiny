/**
 * Gang Power Rating Model
 *
 * Phase 2.1: Weekly War Schedule
 *
 * Caches gang power ratings for matchmaking:
 * - Power components (members, level, territories, wealth, etc.)
 * - Calculated power rating and tier
 * - Historical performance (wins/losses affecting rating)
 * - TTL-based cache invalidation
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  WarLeagueTier,
  PowerRatingComponents,
  GangPowerRating as GangPowerRatingType,
  POWER_RATING_WEIGHTS,
  TIER_THRESHOLDS,
  WIN_RATE_BONUS_THRESHOLDS,
} from '@desperados/shared';

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Power rating components subdocument interface
 */
export interface IPowerRatingComponents {
  memberScore: number;
  levelScore: number;
  avgMemberLevelScore: number;
  territoryScore: number;
  wealthScore: number;
  upgradeScore: number;
  winRateBonus: number;
}

/**
 * Gang Power Rating document interface
 */
export interface IGangPowerRating extends Document {
  _id: mongoose.Types.ObjectId;
  gangId: mongoose.Types.ObjectId;
  gangName: string;

  // Power components
  memberCount: number;
  averageMemberLevel: number;
  gangLevel: number;
  territoriesControlled: number;
  bankBalance: number;
  upgradeCount: number;

  // Calculated
  components: IPowerRatingComponents;
  powerRating: number;
  tier: WarLeagueTier;

  // Historical performance
  seasonWins: number;
  seasonLosses: number;
  winStreak: number;

  // Cache management
  calculatedAt: Date;
  validUntil: Date;

  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  recordWin(): Promise<void>;
  recordLoss(): Promise<void>;
  resetSeasonStats(): Promise<void>;
  isStale(): boolean;
  refresh(): Promise<IGangPowerRating>;
}

/**
 * Gang Power Rating model statics
 */
export interface IGangPowerRatingModel extends Model<IGangPowerRating> {
  findByGang(gangId: mongoose.Types.ObjectId): Promise<IGangPowerRating | null>;
  calculateAndCache(gangId: mongoose.Types.ObjectId): Promise<IGangPowerRating>;
  refreshStaleRatings(): Promise<number>;
  getGangsInTier(tier: WarLeagueTier): Promise<IGangPowerRating[]>;
  getMatchableGangs(gangId: mongoose.Types.ObjectId): Promise<IGangPowerRating[]>;
}

// =============================================================================
// SUBDOCUMENT SCHEMAS
// =============================================================================

/**
 * Power rating components subdocument schema
 */
const PowerRatingComponentsSchema = new Schema<IPowerRatingComponents>(
  {
    memberScore: { type: Number, default: 0 },
    levelScore: { type: Number, default: 0 },
    avgMemberLevelScore: { type: Number, default: 0 },
    territoryScore: { type: Number, default: 0 },
    wealthScore: { type: Number, default: 0 },
    upgradeScore: { type: Number, default: 0 },
    winRateBonus: { type: Number, default: 0 },
  },
  { _id: false }
);

// =============================================================================
// MAIN SCHEMA
// =============================================================================

/**
 * Gang Power Rating schema
 */
const GangPowerRatingSchema = new Schema<IGangPowerRating, IGangPowerRatingModel>(
  {
    gangId: {
      type: Schema.Types.ObjectId,
      ref: 'Gang',
      required: true,
      unique: true,
      index: true,
    },
    gangName: {
      type: String,
      required: true,
    },

    // Power components
    memberCount: { type: Number, default: 0, min: 0 },
    averageMemberLevel: { type: Number, default: 0, min: 0 },
    gangLevel: { type: Number, default: 1, min: 1 },
    territoriesControlled: { type: Number, default: 0, min: 0 },
    bankBalance: { type: Number, default: 0, min: 0 },
    upgradeCount: { type: Number, default: 0, min: 0 },

    // Calculated
    components: {
      type: PowerRatingComponentsSchema,
      default: () => ({
        memberScore: 0,
        levelScore: 0,
        avgMemberLevelScore: 0,
        territoryScore: 0,
        wealthScore: 0,
        upgradeScore: 0,
        winRateBonus: 0,
      }),
    },
    powerRating: { type: Number, default: 0, min: 0, index: true },
    tier: {
      type: String,
      enum: Object.values(WarLeagueTier),
      default: WarLeagueTier.BRONZE,
      index: true,
    },

    // Historical performance
    seasonWins: { type: Number, default: 0, min: 0 },
    seasonLosses: { type: Number, default: 0, min: 0 },
    winStreak: { type: Number, default: 0, min: 0 },

    // Cache management
    calculatedAt: { type: Date, default: Date.now },
    validUntil: { type: Date, default: () => getDefaultValidUntil() },
  },
  {
    timestamps: true,
  }
);

// =============================================================================
// INDEXES
// =============================================================================

GangPowerRatingSchema.index({ gangId: 1 }, { unique: true });
GangPowerRatingSchema.index({ tier: 1, powerRating: -1 });
GangPowerRatingSchema.index({ validUntil: 1 });
GangPowerRatingSchema.index({ powerRating: -1 });

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get default validUntil time (4 hours from now)
 */
function getDefaultValidUntil(): Date {
  const validUntil = new Date();
  validUntil.setHours(validUntil.getHours() + 4);
  return validUntil;
}

/**
 * Calculate win rate bonus based on season performance
 */
function calculateWinRateBonus(wins: number, losses: number): number {
  const total = wins + losses;
  if (total < 3) return 0; // Need minimum games for bonus

  const winRate = wins / total;

  if (winRate >= WIN_RATE_BONUS_THRESHOLDS.EXCEPTIONAL.rate) {
    return WIN_RATE_BONUS_THRESHOLDS.EXCEPTIONAL.bonus;
  }
  if (winRate >= WIN_RATE_BONUS_THRESHOLDS.GOOD.rate) {
    return WIN_RATE_BONUS_THRESHOLDS.GOOD.bonus;
  }
  if (winRate >= WIN_RATE_BONUS_THRESHOLDS.AVERAGE.rate) {
    return WIN_RATE_BONUS_THRESHOLDS.AVERAGE.bonus;
  }
  if (winRate >= WIN_RATE_BONUS_THRESHOLDS.POOR.rate) {
    return WIN_RATE_BONUS_THRESHOLDS.POOR.bonus;
  }
  return WIN_RATE_BONUS_THRESHOLDS.TERRIBLE.bonus;
}

/**
 * Determine tier from power rating
 */
function determineTier(powerRating: number): WarLeagueTier {
  for (const threshold of TIER_THRESHOLDS) {
    if (
      powerRating >= threshold.minPowerRating &&
      powerRating <= threshold.maxPowerRating
    ) {
      return threshold.tier;
    }
  }
  return WarLeagueTier.BRONZE;
}

/**
 * Calculate power rating components
 */
function calculateComponents(
  memberCount: number,
  avgMemberLevel: number,
  gangLevel: number,
  territories: number,
  bankBalance: number,
  upgradeCount: number,
  seasonWins: number,
  seasonLosses: number
): IPowerRatingComponents {
  const memberScore = memberCount * POWER_RATING_WEIGHTS.MEMBER_WEIGHT;
  const levelScore = gangLevel * POWER_RATING_WEIGHTS.GANG_LEVEL_WEIGHT;
  const avgMemberLevelScore = avgMemberLevel * POWER_RATING_WEIGHTS.AVG_MEMBER_LEVEL_WEIGHT;
  const territoryScore = territories * POWER_RATING_WEIGHTS.TERRITORY_WEIGHT;
  const wealthScore = Math.min(
    bankBalance / POWER_RATING_WEIGHTS.WEALTH_DIVISOR,
    POWER_RATING_WEIGHTS.WEALTH_CAP
  );
  const upgradeScore = upgradeCount * POWER_RATING_WEIGHTS.UPGRADE_WEIGHT;
  const winRateBonus = calculateWinRateBonus(seasonWins, seasonLosses);

  return {
    memberScore,
    levelScore,
    avgMemberLevelScore,
    territoryScore,
    wealthScore,
    upgradeScore,
    winRateBonus,
  };
}

/**
 * Calculate total power rating from components
 */
function calculateTotalRating(components: IPowerRatingComponents): number {
  return Math.floor(
    components.memberScore +
    components.levelScore +
    components.avgMemberLevelScore +
    components.territoryScore +
    components.wealthScore +
    components.upgradeScore +
    components.winRateBonus
  );
}

// =============================================================================
// STATIC METHODS
// =============================================================================

/**
 * Find power rating by gang ID
 */
GangPowerRatingSchema.statics.findByGang = async function (
  gangId: mongoose.Types.ObjectId
): Promise<IGangPowerRating | null> {
  return this.findOne({ gangId });
};

/**
 * Calculate and cache power rating for a gang
 */
GangPowerRatingSchema.statics.calculateAndCache = async function (
  gangId: mongoose.Types.ObjectId
): Promise<IGangPowerRating> {
  const Gang = mongoose.model('Gang');
  const Character = mongoose.model('Character');
  const Territory = mongoose.model('Territory');

  // Fetch gang data
  const gang = await Gang.findById(gangId);
  if (!gang) {
    throw new Error('Gang not found');
  }

  // Calculate member count and average level
  const memberIds = gang.members?.map((m: any) => m.characterId) || [];
  const members = await Character.find({ _id: { $in: memberIds } }).select('level');
  const memberCount = members.length;
  const avgMemberLevel = memberCount > 0
    ? members.reduce((sum: number, m: any) => sum + (m.level || 1), 0) / memberCount
    : 1;

  // Count territories
  const territoriesControlled = await Territory.countDocuments({
    controlledBy: gangId,
  });

  // Get upgrade count
  const upgradeCount = gang.upgrades
    ? Object.values(gang.upgrades).filter((v: any) => v && typeof v === 'number' && v > 0).length
    : 0;

  // Get or create rating document
  let rating = await this.findOne({ gangId });
  const isNew = !rating;

  if (!rating) {
    rating = new this({ gangId, gangName: gang.name });
  }

  // Update raw values
  rating.gangName = gang.name;
  rating.memberCount = memberCount;
  rating.averageMemberLevel = avgMemberLevel;
  rating.gangLevel = gang.level || 1;
  rating.territoriesControlled = territoriesControlled;
  rating.bankBalance = gang.bank || 0;
  rating.upgradeCount = upgradeCount;

  // Calculate components
  rating.components = calculateComponents(
    rating.memberCount,
    rating.averageMemberLevel,
    rating.gangLevel,
    rating.territoriesControlled,
    rating.bankBalance,
    rating.upgradeCount,
    rating.seasonWins,
    rating.seasonLosses
  );

  // Calculate total rating and tier
  rating.powerRating = calculateTotalRating(rating.components);
  rating.tier = determineTier(rating.powerRating);

  // Update cache timestamps
  rating.calculatedAt = new Date();
  rating.validUntil = getDefaultValidUntil();

  await rating.save();
  return rating;
};

/**
 * Refresh all stale ratings (called by cron job)
 */
GangPowerRatingSchema.statics.refreshStaleRatings = async function (): Promise<number> {
  const now = new Date();

  // Find stale ratings
  const staleRatings = await this.find({
    validUntil: { $lte: now },
  }).select('gangId');

  let refreshed = 0;
  for (const rating of staleRatings) {
    try {
      await this.calculateAndCache(rating.gangId);
      refreshed++;
    } catch (error) {
      // Gang may have been deleted - remove the rating
      await this.deleteOne({ gangId: rating.gangId });
    }
  }

  return refreshed;
};

/**
 * Get all gangs in a specific tier
 */
GangPowerRatingSchema.statics.getGangsInTier = async function (
  tier: WarLeagueTier
): Promise<IGangPowerRating[]> {
  return this.find({ tier }).sort({ powerRating: -1 });
};

/**
 * Get gangs that can match against a specific gang
 * (same tier or adjacent tiers within power range)
 */
GangPowerRatingSchema.statics.getMatchableGangs = async function (
  gangId: mongoose.Types.ObjectId
): Promise<IGangPowerRating[]> {
  const rating = await this.findOne({ gangId });
  if (!rating) {
    return [];
  }

  // Get adjacent tier ordinals
  const tierOrder = Object.values(WarLeagueTier);
  const currentTierIndex = tierOrder.indexOf(rating.tier);
  const matchableTiers = [rating.tier];

  if (currentTierIndex > 0) {
    matchableTiers.push(tierOrder[currentTierIndex - 1]);
  }
  if (currentTierIndex < tierOrder.length - 1) {
    matchableTiers.push(tierOrder[currentTierIndex + 1]);
  }

  // Calculate power range (50% difference max)
  const minPower = rating.powerRating * 0.5;
  const maxPower = rating.powerRating * 1.5;

  return this.find({
    gangId: { $ne: gangId },
    tier: { $in: matchableTiers },
    powerRating: { $gte: minPower, $lte: maxPower },
  }).sort({ powerRating: -1 });
};

// =============================================================================
// INSTANCE METHODS
// =============================================================================

/**
 * Record a war win
 */
GangPowerRatingSchema.methods.recordWin = async function (): Promise<void> {
  this.seasonWins += 1;
  this.winStreak += 1;

  // Recalculate components with new win rate
  this.components = calculateComponents(
    this.memberCount,
    this.averageMemberLevel,
    this.gangLevel,
    this.territoriesControlled,
    this.bankBalance,
    this.upgradeCount,
    this.seasonWins,
    this.seasonLosses
  );

  this.powerRating = calculateTotalRating(this.components);
  this.tier = determineTier(this.powerRating);
  this.calculatedAt = new Date();

  await this.save();
};

/**
 * Record a war loss
 */
GangPowerRatingSchema.methods.recordLoss = async function (): Promise<void> {
  this.seasonLosses += 1;
  this.winStreak = 0;

  // Recalculate components with new win rate
  this.components = calculateComponents(
    this.memberCount,
    this.averageMemberLevel,
    this.gangLevel,
    this.territoriesControlled,
    this.bankBalance,
    this.upgradeCount,
    this.seasonWins,
    this.seasonLosses
  );

  this.powerRating = calculateTotalRating(this.components);
  this.tier = determineTier(this.powerRating);
  this.calculatedAt = new Date();

  await this.save();
};

/**
 * Reset season stats (called at season end)
 */
GangPowerRatingSchema.methods.resetSeasonStats = async function (): Promise<void> {
  this.seasonWins = 0;
  this.seasonLosses = 0;
  this.winStreak = 0;

  // Recalculate without win rate bonus
  this.components = calculateComponents(
    this.memberCount,
    this.averageMemberLevel,
    this.gangLevel,
    this.territoriesControlled,
    this.bankBalance,
    this.upgradeCount,
    0,
    0
  );

  this.powerRating = calculateTotalRating(this.components);
  this.tier = determineTier(this.powerRating);
  this.calculatedAt = new Date();

  await this.save();
};

/**
 * Check if rating is stale
 */
GangPowerRatingSchema.methods.isStale = function (): boolean {
  return new Date() >= this.validUntil;
};

/**
 * Force refresh the rating
 */
GangPowerRatingSchema.methods.refresh = async function (): Promise<IGangPowerRating> {
  const GangPowerRating = mongoose.model('GangPowerRating') as IGangPowerRatingModel;
  return GangPowerRating.calculateAndCache(this.gangId);
};

// =============================================================================
// MODEL EXPORT
// =============================================================================

export const GangPowerRating = mongoose.model<IGangPowerRating, IGangPowerRatingModel>(
  'GangPowerRating',
  GangPowerRatingSchema
);

export default GangPowerRating;
