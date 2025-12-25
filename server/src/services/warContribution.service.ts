/**
 * War Contribution Service
 *
 * Phase 2.4: Core service for recording contributions, updating stats,
 * and managing war leaderboards in real-time.
 */

import mongoose from 'mongoose';
import { WarContribution, IWarContribution } from '../models/WarContribution.model';
import { WarContributionStats, IWarContributionStats } from '../models/WarContributionStats.model';
import { Character } from '../models/Character.model';
import {
  WarContributionType,
  WarContributionCategory,
  WAR_CONTRIBUTION_TYPE_TO_CATEGORY,
  IWarLeaderboardEntry,
} from '@desperados/shared';
import {
  WAR_CONTRIBUTION_POINT_VALUES,
  WAR_CATEGORY_WEIGHTS,
  DIVERSITY_BONUS,
} from '@desperados/shared';
import { emitToRoom } from '../config/socket';
import logger from '../utils/logger';

/**
 * Result of recording a contribution
 */
export interface RecordContributionResult {
  success: boolean;
  contribution?: IWarContribution;
  newStats?: IWarContributionStats;
  error?: string;
}

/**
 * War Contribution Service
 */
export class WarContributionService {
  /**
   * Record a contribution (main entry point)
   * Called from other services when contribution actions occur
   */
  static async recordContribution(
    warId: mongoose.Types.ObjectId,
    gangId: mongoose.Types.ObjectId,
    characterId: mongoose.Types.ObjectId,
    type: WarContributionType,
    rawValue?: number,
    context?: Record<string, unknown>
  ): Promise<RecordContributionResult> {
    try {
      // Get character name
      const character = await Character.findById(characterId);
      if (!character) {
        return { success: false, error: 'Character not found' };
      }

      // Calculate points
      const basePoints = WAR_CONTRIBUTION_POINT_VALUES[type];
      const points = rawValue !== undefined
        ? Math.floor(basePoints * rawValue)
        : basePoints;

      // Get category from type
      const category = WAR_CONTRIBUTION_TYPE_TO_CATEGORY[type];

      // Create contribution record
      const contribution = await WarContribution.create({
        warId,
        gangId,
        characterId,
        characterName: character.name,
        type,
        category,
        points,
        rawValue,
        context,
      });

      // Update aggregated stats
      const stats = await this.updateStats(
        warId,
        gangId,
        characterId,
        character.name,
        category,
        points,
        type
      );

      // Emit real-time update
      this.emitContributionUpdate(warId, gangId, characterId, character.name, type, points, stats);

      logger.debug(`Recorded war contribution: ${type} for ${character.name} (+${points} pts)`);

      return {
        success: true,
        contribution,
        newStats: stats,
      };
    } catch (error) {
      logger.error('Failed to record war contribution:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update aggregated stats after a contribution
   */
  private static async updateStats(
    warId: mongoose.Types.ObjectId,
    gangId: mongoose.Types.ObjectId,
    characterId: mongoose.Types.ObjectId,
    characterName: string,
    category: WarContributionCategory,
    points: number,
    type: WarContributionType
  ): Promise<IWarContributionStats> {
    // Find or create stats record
    let stats = await WarContributionStats.findOne({ warId, characterId });
    if (!stats) {
      stats = new WarContributionStats({
        warId,
        gangId,
        characterId,
        characterName,
      });
    }

    // Update category-specific points
    switch (category) {
      case WarContributionCategory.COMBAT:
        stats.combatPoints += points;
        break;
      case WarContributionCategory.RAIDS:
        stats.raidPoints += points;
        break;
      case WarContributionCategory.TERRITORY:
        stats.territoryPoints += points;
        break;
      case WarContributionCategory.RESOURCES:
        stats.resourcePoints += points;
        break;
      case WarContributionCategory.SUPPORT:
        stats.supportPoints += points;
        break;
      case WarContributionCategory.LEADERSHIP:
        stats.leadershipPoints += points;
        break;
    }

    // Update totals
    stats.totalPoints += points;
    stats.actionsCount += 1;

    // Update win/loss counts for combat-related contributions
    if (type === WarContributionType.DECK_GAME_WIN ||
        type === WarContributionType.CHAMPION_DUEL_WIN ||
        type === WarContributionType.LEADER_SHOWDOWN_WIN ||
        type === WarContributionType.RAID_LED ||
        type === WarContributionType.ZONE_CAPTURE) {
      stats.winsCount += 1;
    } else if (type === WarContributionType.DECK_GAME_LOSS) {
      stats.lossesCount += 1;
    }

    // Update active categories
    if (!stats.activeCategories.includes(category)) {
      stats.activeCategories.push(category);
    }

    await stats.save();
    return stats;
  }

  /**
   * Emit real-time contribution update via Socket.IO
   */
  private static emitContributionUpdate(
    warId: mongoose.Types.ObjectId,
    gangId: mongoose.Types.ObjectId,
    characterId: mongoose.Types.ObjectId,
    characterName: string,
    type: WarContributionType,
    points: number,
    stats: IWarContributionStats
  ): void {
    try {
      // Emit to war room
      emitToRoom(`war:${warId}`, 'war:contribution', {
        warId: warId.toString(),
        gangId: gangId.toString(),
        characterId: characterId.toString(),
        characterName,
        type,
        points,
        newTotal: stats.totalPoints,
        newRank: stats.rank,
      });
    } catch (error) {
      logger.warn('Failed to emit contribution update:', error);
    }
  }

  /**
   * Get current stats for a character in a war
   */
  static async getWarStats(
    warId: mongoose.Types.ObjectId,
    characterId: mongoose.Types.ObjectId
  ): Promise<IWarContributionStats | null> {
    return WarContributionStats.findOne({ warId, characterId });
  }

  /**
   * Get war leaderboard (top N)
   */
  static async getWarLeaderboard(
    warId: mongoose.Types.ObjectId,
    limit: number = 10
  ): Promise<IWarLeaderboardEntry[]> {
    const stats = await WarContributionStats.getWarLeaderboard(warId, limit);

    return stats.map((s, index) => {
      // Find top category
      const categoryPoints = {
        [WarContributionCategory.COMBAT]: s.combatPoints,
        [WarContributionCategory.RAIDS]: s.raidPoints,
        [WarContributionCategory.TERRITORY]: s.territoryPoints,
        [WarContributionCategory.RESOURCES]: s.resourcePoints,
        [WarContributionCategory.SUPPORT]: s.supportPoints,
        [WarContributionCategory.LEADERSHIP]: s.leadershipPoints,
      };

      let topCategory = WarContributionCategory.COMBAT;
      let topCategoryPoints = 0;
      for (const [cat, pts] of Object.entries(categoryPoints)) {
        if (pts > topCategoryPoints) {
          topCategory = cat as WarContributionCategory;
          topCategoryPoints = pts;
        }
      }

      const gang = s.gangId as unknown as { name?: string };

      return {
        rank: index + 1,
        characterId: s.characterId.toString(),
        characterName: s.characterName,
        gangId: s.gangId.toString(),
        gangName: gang?.name || 'Unknown Gang',
        totalPoints: s.totalPoints,
        topCategory,
        topCategoryPoints,
        isCurrentMVP: index === 0,
      };
    });
  }

  /**
   * Get gang-specific leaderboard
   */
  static async getGangLeaderboard(
    warId: mongoose.Types.ObjectId,
    gangId: mongoose.Types.ObjectId
  ): Promise<IWarLeaderboardEntry[]> {
    const stats = await WarContributionStats.getGangLeaderboard(warId, gangId);

    return stats.map((s, index) => {
      const categoryPoints = {
        [WarContributionCategory.COMBAT]: s.combatPoints,
        [WarContributionCategory.RAIDS]: s.raidPoints,
        [WarContributionCategory.TERRITORY]: s.territoryPoints,
        [WarContributionCategory.RESOURCES]: s.resourcePoints,
        [WarContributionCategory.SUPPORT]: s.supportPoints,
        [WarContributionCategory.LEADERSHIP]: s.leadershipPoints,
      };

      let topCategory = WarContributionCategory.COMBAT;
      let topCategoryPoints = 0;
      for (const [cat, pts] of Object.entries(categoryPoints)) {
        if (pts > topCategoryPoints) {
          topCategory = cat as WarContributionCategory;
          topCategoryPoints = pts;
        }
      }

      return {
        rank: index + 1,
        characterId: s.characterId.toString(),
        characterName: s.characterName,
        gangId: s.gangId.toString(),
        gangName: '',
        totalPoints: s.totalPoints,
        topCategory,
        topCategoryPoints,
        isCurrentMVP: false,
      };
    });
  }

  /**
   * Recalculate all ranks for a war (call periodically)
   */
  static async recalculateRanks(warId: mongoose.Types.ObjectId): Promise<void> {
    await WarContributionStats.recalculateRanks(warId);
  }

  /**
   * Get contribution history for a character in a war
   */
  static async getContributionHistory(
    warId: mongoose.Types.ObjectId,
    characterId: mongoose.Types.ObjectId
  ): Promise<IWarContribution[]> {
    return WarContribution.findByCharacterInWar(warId, characterId);
  }

  /**
   * Get category breakdown for a character
   */
  static async getCategoryBreakdown(
    warId: mongoose.Types.ObjectId,
    characterId: mongoose.Types.ObjectId
  ): Promise<Record<WarContributionCategory, number>> {
    return WarContribution.getCategoryBreakdown(warId, characterId);
  }

  /**
   * Calculate MVP score with weighted categories and bonuses
   */
  static calculateMVPScore(stats: IWarContributionStats): number {
    // Base weighted score
    let score = 0;
    score += stats.combatPoints * WAR_CATEGORY_WEIGHTS[WarContributionCategory.COMBAT];
    score += stats.raidPoints * WAR_CATEGORY_WEIGHTS[WarContributionCategory.RAIDS];
    score += stats.territoryPoints * WAR_CATEGORY_WEIGHTS[WarContributionCategory.TERRITORY];
    score += stats.resourcePoints * WAR_CATEGORY_WEIGHTS[WarContributionCategory.RESOURCES];
    score += stats.supportPoints * WAR_CATEGORY_WEIGHTS[WarContributionCategory.SUPPORT];
    score += stats.leadershipPoints * WAR_CATEGORY_WEIGHTS[WarContributionCategory.LEADERSHIP];

    // Apply diversity bonus
    const diversityBonus = Math.min(
      stats.activeCategories.length * DIVERSITY_BONUS.PER_CATEGORY,
      DIVERSITY_BONUS.MAX_BONUS
    );
    score *= (1 + diversityBonus);

    // Apply win rate efficiency (optional)
    const winRate = stats.getWinRate();
    if (stats.actionsCount >= 5) { // Only apply if enough actions
      const efficiencyMultiplier = 0.9 + (winRate * 0.3); // 0.9 to 1.2
      score *= efficiencyMultiplier;
    }

    return Math.floor(score);
  }

  /**
   * Get all participants in a war
   */
  static async getWarParticipants(
    warId: mongoose.Types.ObjectId
  ): Promise<IWarContributionStats[]> {
    return WarContributionStats.find({ warId }).sort({ totalPoints: -1 });
  }
}

export default WarContributionService;
