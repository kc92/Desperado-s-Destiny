/**
 * War Tier Service
 *
 * Phase 2.1: Weekly War Schedule
 *
 * Manages power rating calculations and tier assignments:
 * - Calculate gang power ratings
 * - Determine appropriate tiers
 * - Validate tier-based matchmaking
 * - Bulk refresh operations
 */

import mongoose from 'mongoose';
import { GangPowerRating, IGangPowerRating } from '../models/GangPowerRating.model';
import { Gang, IGang } from '../models/Gang.model';
import { Character } from '../models/Character.model';
import { Territory } from '../models/Territory.model';
import {
  WarLeagueTier,
  TIER_THRESHOLDS,
  POWER_RATING_WEIGHTS,
  WIN_RATE_BONUS_THRESHOLDS,
  TIER_MATCHING,
} from '@desperados/shared';
import logger from '../utils/logger';

// =============================================================================
// TYPES
// =============================================================================

export interface PowerRatingBreakdown {
  memberScore: number;
  levelScore: number;
  avgMemberLevelScore: number;
  territoryScore: number;
  wealthScore: number;
  upgradeScore: number;
  winRateBonus: number;
  total: number;
}

export interface TierMatchResult {
  canMatch: boolean;
  reason?: string;
  tierDifference: number;
  powerDifference: number;
  powerDifferencePercent: number;
}

export interface TierDistribution {
  tier: WarLeagueTier;
  count: number;
  averagePowerRating: number;
}

export interface GangRankingEntry {
  gangId: mongoose.Types.ObjectId;
  gangName: string;
  tier: WarLeagueTier;
  powerRating: number;
  rank: number;
  seasonWins: number;
  seasonLosses: number;
  winRate: number;
}

// =============================================================================
// SERVICE CLASS
// =============================================================================

export class WarTierService {
  /**
   * Calculate power rating for a gang
   */
  static async calculatePowerRating(
    gangId: mongoose.Types.ObjectId
  ): Promise<IGangPowerRating> {
    return GangPowerRating.calculateAndCache(gangId);
  }

  /**
   * Get cached power rating, calculating if stale or missing
   */
  static async getPowerRating(
    gangId: mongoose.Types.ObjectId,
    forceRefresh: boolean = false
  ): Promise<IGangPowerRating> {
    const existing = await GangPowerRating.findByGang(gangId);

    if (existing && !forceRefresh && !existing.isStale()) {
      return existing;
    }

    return GangPowerRating.calculateAndCache(gangId);
  }

  /**
   * Get power rating breakdown for display
   */
  static async getPowerRatingBreakdown(
    gangId: mongoose.Types.ObjectId
  ): Promise<PowerRatingBreakdown> {
    const rating = await this.getPowerRating(gangId);

    return {
      memberScore: rating.components.memberScore,
      levelScore: rating.components.levelScore,
      avgMemberLevelScore: rating.components.avgMemberLevelScore,
      territoryScore: rating.components.territoryScore,
      wealthScore: rating.components.wealthScore,
      upgradeScore: rating.components.upgradeScore,
      winRateBonus: rating.components.winRateBonus,
      total: rating.powerRating,
    };
  }

  /**
   * Check if two gangs can match based on tier rules
   */
  static async canMatch(
    gangId1: mongoose.Types.ObjectId,
    gangId2: mongoose.Types.ObjectId
  ): Promise<TierMatchResult> {
    const rating1 = await this.getPowerRating(gangId1);
    const rating2 = await this.getPowerRating(gangId2);

    const tierOrder = Object.values(WarLeagueTier);
    const tierIndex1 = tierOrder.indexOf(rating1.tier);
    const tierIndex2 = tierOrder.indexOf(rating2.tier);
    const tierDifference = Math.abs(tierIndex1 - tierIndex2);

    // Check tier adjacency
    if (tierDifference > 1 && !TIER_MATCHING.ADJACENT_TIER_MATCHING) {
      return {
        canMatch: false,
        reason: `Tier difference too large: ${rating1.tier} vs ${rating2.tier}`,
        tierDifference,
        powerDifference: Math.abs(rating1.powerRating - rating2.powerRating),
        powerDifferencePercent: 0,
      };
    }

    // Even with adjacent tier matching, can't skip tiers
    if (tierDifference > 1) {
      return {
        canMatch: false,
        reason: `Cannot match gangs more than 1 tier apart`,
        tierDifference,
        powerDifference: Math.abs(rating1.powerRating - rating2.powerRating),
        powerDifferencePercent: 0,
      };
    }

    // Check power rating difference
    const higherRating = Math.max(rating1.powerRating, rating2.powerRating);
    const lowerRating = Math.min(rating1.powerRating, rating2.powerRating);
    const powerDifferencePercent = lowerRating > 0
      ? (higherRating - lowerRating) / lowerRating
      : 1;

    if (powerDifferencePercent > TIER_MATCHING.MAX_POWER_DIFFERENCE) {
      return {
        canMatch: false,
        reason: `Power difference too large: ${(powerDifferencePercent * 100).toFixed(1)}% (max ${TIER_MATCHING.MAX_POWER_DIFFERENCE * 100}%)`,
        tierDifference,
        powerDifference: higherRating - lowerRating,
        powerDifferencePercent,
      };
    }

    return {
      canMatch: true,
      tierDifference,
      powerDifference: Math.abs(rating1.powerRating - rating2.powerRating),
      powerDifferencePercent,
    };
  }

  /**
   * Find matchable opponents for a gang
   */
  static async findMatchableOpponents(
    gangId: mongoose.Types.ObjectId,
    limit: number = 10
  ): Promise<IGangPowerRating[]> {
    const matchable = await GangPowerRating.getMatchableGangs(gangId);
    return matchable.slice(0, limit);
  }

  /**
   * Get all gangs in a specific tier
   */
  static async getGangsInTier(
    tier: WarLeagueTier
  ): Promise<IGangPowerRating[]> {
    return GangPowerRating.getGangsInTier(tier);
  }

  /**
   * Get tier distribution across all gangs
   */
  static async getTierDistribution(): Promise<TierDistribution[]> {
    const distribution: TierDistribution[] = [];

    for (const tier of Object.values(WarLeagueTier)) {
      const gangsInTier = await GangPowerRating.find({ tier });
      const avgRating = gangsInTier.length > 0
        ? gangsInTier.reduce((sum, g) => sum + g.powerRating, 0) / gangsInTier.length
        : 0;

      distribution.push({
        tier,
        count: gangsInTier.length,
        averagePowerRating: Math.round(avgRating),
      });
    }

    return distribution;
  }

  /**
   * Get leaderboard rankings within a tier
   */
  static async getTierLeaderboard(
    tier: WarLeagueTier,
    limit: number = 50
  ): Promise<GangRankingEntry[]> {
    const gangsInTier = await GangPowerRating.find({ tier })
      .sort({ powerRating: -1 })
      .limit(limit);

    return gangsInTier.map((gang, index) => {
      const totalGames = gang.seasonWins + gang.seasonLosses;
      const winRate = totalGames > 0
        ? (gang.seasonWins / totalGames) * 100
        : 0;

      return {
        gangId: gang.gangId,
        gangName: gang.gangName,
        tier: gang.tier,
        powerRating: gang.powerRating,
        rank: index + 1,
        seasonWins: gang.seasonWins,
        seasonLosses: gang.seasonLosses,
        winRate: Math.round(winRate * 10) / 10,
      };
    });
  }

  /**
   * Get global leaderboard (all tiers)
   */
  static async getGlobalLeaderboard(
    limit: number = 100
  ): Promise<GangRankingEntry[]> {
    const topGangs = await GangPowerRating.find()
      .sort({ powerRating: -1 })
      .limit(limit);

    return topGangs.map((gang, index) => {
      const totalGames = gang.seasonWins + gang.seasonLosses;
      const winRate = totalGames > 0
        ? (gang.seasonWins / totalGames) * 100
        : 0;

      return {
        gangId: gang.gangId,
        gangName: gang.gangName,
        tier: gang.tier,
        powerRating: gang.powerRating,
        rank: index + 1,
        seasonWins: gang.seasonWins,
        seasonLosses: gang.seasonLosses,
        winRate: Math.round(winRate * 10) / 10,
      };
    });
  }

  /**
   * Refresh all power ratings (called by cron job)
   */
  static async refreshAllRatings(): Promise<{
    refreshed: number;
    errors: number;
  }> {
    const allGangs = await Gang.find().select('_id');
    let refreshed = 0;
    let errors = 0;

    for (const gang of allGangs) {
      try {
        await GangPowerRating.calculateAndCache(gang._id as mongoose.Types.ObjectId);
        refreshed++;
      } catch (error) {
        logger.error(`Failed to refresh power rating for gang ${gang._id}:`, error);
        errors++;
      }
    }

    logger.info(`Power rating refresh complete: ${refreshed} refreshed, ${errors} errors`);

    return { refreshed, errors };
  }

  /**
   * Refresh stale ratings only
   */
  static async refreshStaleRatings(): Promise<number> {
    return GangPowerRating.refreshStaleRatings();
  }

  /**
   * Initialize power ratings for all gangs that don't have one
   */
  static async initializeRatings(): Promise<number> {
    const gangsWithoutRatings = await Gang.find({
      _id: {
        $nin: await GangPowerRating.find().distinct('gangId'),
      },
    }).select('_id');

    let initialized = 0;

    for (const gang of gangsWithoutRatings) {
      try {
        await GangPowerRating.calculateAndCache(gang._id as mongoose.Types.ObjectId);
        initialized++;
      } catch (error) {
        logger.error(`Failed to initialize rating for gang ${gang._id}:`, error);
      }
    }

    logger.info(`Initialized power ratings for ${initialized} gangs`);

    return initialized;
  }

  /**
   * Get tier thresholds for display
   */
  static getTierThresholds(): {
    tier: WarLeagueTier;
    minPowerRating: number;
    maxPowerRating: number;
  }[] {
    return TIER_THRESHOLDS.map(t => ({
      tier: t.tier,
      minPowerRating: t.minPowerRating,
      maxPowerRating: t.maxPowerRating,
    }));
  }

  /**
   * Get power rating weights for display
   */
  static getPowerRatingWeights(): typeof POWER_RATING_WEIGHTS {
    return POWER_RATING_WEIGHTS;
  }

  /**
   * Predict tier for given stats (for UI preview)
   */
  static predictTier(
    memberCount: number,
    avgMemberLevel: number,
    gangLevel: number,
    territories: number,
    bankBalance: number,
    upgradeCount: number,
    seasonWins: number = 0,
    seasonLosses: number = 0
  ): {
    predictedTier: WarLeagueTier;
    predictedPowerRating: number;
    breakdown: PowerRatingBreakdown;
  } {
    const memberScore = memberCount * POWER_RATING_WEIGHTS.MEMBER_WEIGHT;
    const levelScore = gangLevel * POWER_RATING_WEIGHTS.GANG_LEVEL_WEIGHT;
    const avgMemberLevelScore = avgMemberLevel * POWER_RATING_WEIGHTS.AVG_MEMBER_LEVEL_WEIGHT;
    const territoryScore = territories * POWER_RATING_WEIGHTS.TERRITORY_WEIGHT;
    const wealthScore = Math.min(
      bankBalance / POWER_RATING_WEIGHTS.WEALTH_DIVISOR,
      POWER_RATING_WEIGHTS.WEALTH_CAP
    );
    const upgradeScore = upgradeCount * POWER_RATING_WEIGHTS.UPGRADE_WEIGHT;

    // Calculate win rate bonus
    const total = seasonWins + seasonLosses;
    let winRateBonus = 0;
    if (total >= 3) {
      const winRate = seasonWins / total;
      if (winRate >= WIN_RATE_BONUS_THRESHOLDS.EXCEPTIONAL.rate) {
        winRateBonus = WIN_RATE_BONUS_THRESHOLDS.EXCEPTIONAL.bonus;
      } else if (winRate >= WIN_RATE_BONUS_THRESHOLDS.GOOD.rate) {
        winRateBonus = WIN_RATE_BONUS_THRESHOLDS.GOOD.bonus;
      } else if (winRate >= WIN_RATE_BONUS_THRESHOLDS.AVERAGE.rate) {
        winRateBonus = WIN_RATE_BONUS_THRESHOLDS.AVERAGE.bonus;
      } else if (winRate >= WIN_RATE_BONUS_THRESHOLDS.POOR.rate) {
        winRateBonus = WIN_RATE_BONUS_THRESHOLDS.POOR.bonus;
      } else {
        winRateBonus = WIN_RATE_BONUS_THRESHOLDS.TERRIBLE.bonus;
      }
    }

    const powerRating = Math.floor(
      memberScore + levelScore + avgMemberLevelScore +
      territoryScore + wealthScore + upgradeScore + winRateBonus
    );

    // Determine tier
    let predictedTier = WarLeagueTier.BRONZE;
    for (const threshold of TIER_THRESHOLDS) {
      if (
        powerRating >= threshold.minPowerRating &&
        powerRating <= threshold.maxPowerRating
      ) {
        predictedTier = threshold.tier;
        break;
      }
    }

    return {
      predictedTier,
      predictedPowerRating: powerRating,
      breakdown: {
        memberScore,
        levelScore,
        avgMemberLevelScore,
        territoryScore,
        wealthScore,
        upgradeScore,
        winRateBonus,
        total: powerRating,
      },
    };
  }

  /**
   * Reset all season stats (called at season end)
   */
  static async resetAllSeasonStats(): Promise<number> {
    const allRatings = await GangPowerRating.find();
    let reset = 0;

    for (const rating of allRatings) {
      try {
        await rating.resetSeasonStats();
        reset++;
      } catch (error) {
        logger.error(`Failed to reset season stats for gang ${rating.gangId}:`, error);
      }
    }

    logger.info(`Reset season stats for ${reset} gangs`);

    return reset;
  }
}

export default WarTierService;
