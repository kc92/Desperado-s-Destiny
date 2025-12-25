/**
 * War MVP Service
 *
 * Phase 2.4: MVP calculation, title awards, and career stats updates
 * at war end.
 */

import mongoose from 'mongoose';
import { WarContributionStats, IWarContributionStats } from '../models/WarContributionStats.model';
import { CharacterWarCareer } from '../models/CharacterWarCareer.model';
import { WarContributionService } from './warContribution.service';
import {
  WarContributionCategory,
  IWarMVPResult,
  IWarLeaderboardEntry,
} from '@desperados/shared';
import {
  WAR_CATEGORY_TITLES,
  TITLE_THRESHOLDS,
} from '@desperados/shared';
import { emitToRoom } from '../config/socket';
import logger from '../utils/logger';

/**
 * War MVP Service
 */
export class WarMVPService {
  /**
   * Determine MVP and top performers at war end
   */
  static async determineWarMVP(warId: mongoose.Types.ObjectId): Promise<IWarMVPResult> {
    // Get all participants sorted by MVP score
    const participants = await WarContributionStats.find({ warId })
      .sort({ totalPoints: -1 })
      .populate('gangId', 'name tag');

    if (participants.length === 0) {
      throw new Error('No participants found for war');
    }

    // Calculate MVP scores for all participants
    const scoredParticipants = participants.map(p => ({
      stats: p,
      mvpScore: WarContributionService.calculateMVPScore(p),
    })).sort((a, b) => b.mvpScore - a.mvpScore);

    // Get MVP (highest score)
    const mvp = scoredParticipants[0];

    // Build leaderboard entries
    const buildLeaderboardEntry = (stats: IWarContributionStats, rank: number): IWarLeaderboardEntry => {
      const categoryPoints = {
        [WarContributionCategory.COMBAT]: stats.combatPoints,
        [WarContributionCategory.RAIDS]: stats.raidPoints,
        [WarContributionCategory.TERRITORY]: stats.territoryPoints,
        [WarContributionCategory.RESOURCES]: stats.resourcePoints,
        [WarContributionCategory.SUPPORT]: stats.supportPoints,
        [WarContributionCategory.LEADERSHIP]: stats.leadershipPoints,
      };

      let topCategory = WarContributionCategory.COMBAT;
      let topCategoryPoints = 0;
      for (const [cat, pts] of Object.entries(categoryPoints)) {
        if (pts > topCategoryPoints) {
          topCategory = cat as WarContributionCategory;
          topCategoryPoints = pts;
        }
      }

      const gang = stats.gangId as unknown as { name?: string };

      return {
        rank,
        characterId: stats.characterId.toString(),
        characterName: stats.characterName,
        gangId: stats.gangId.toString(),
        gangName: gang?.name || 'Unknown',
        totalPoints: stats.totalPoints,
        topCategory,
        topCategoryPoints,
        isCurrentMVP: rank === 1,
      };
    };

    // Get top 3 and top 10
    const top3 = scoredParticipants.slice(0, 3).map((p, i) =>
      buildLeaderboardEntry(p.stats, i + 1)
    );
    const top10 = scoredParticipants.slice(0, 10).map((p, i) =>
      buildLeaderboardEntry(p.stats, i + 1)
    );

    // Determine category MVPs
    const categoryMVPs = this.determineCategoryMVPs(participants);

    return {
      mvpCharacterId: mvp.stats.characterId.toString(),
      mvpCharacterName: mvp.stats.characterName,
      mvpScore: mvp.mvpScore,
      top3,
      top10,
      categoryMVPs,
    };
  }

  /**
   * Determine MVP for each category
   */
  private static determineCategoryMVPs(
    participants: IWarContributionStats[]
  ): Record<WarContributionCategory, { characterId: string; characterName: string; points: number }> {
    const categoryMVPs: Record<WarContributionCategory, { characterId: string; characterName: string; points: number }> = {
      [WarContributionCategory.COMBAT]: { characterId: '', characterName: '', points: 0 },
      [WarContributionCategory.RAIDS]: { characterId: '', characterName: '', points: 0 },
      [WarContributionCategory.TERRITORY]: { characterId: '', characterName: '', points: 0 },
      [WarContributionCategory.RESOURCES]: { characterId: '', characterName: '', points: 0 },
      [WarContributionCategory.SUPPORT]: { characterId: '', characterName: '', points: 0 },
      [WarContributionCategory.LEADERSHIP]: { characterId: '', characterName: '', points: 0 },
    };

    for (const p of participants) {
      // Check each category
      if (p.combatPoints > categoryMVPs[WarContributionCategory.COMBAT].points) {
        categoryMVPs[WarContributionCategory.COMBAT] = {
          characterId: p.characterId.toString(),
          characterName: p.characterName,
          points: p.combatPoints,
        };
      }
      if (p.raidPoints > categoryMVPs[WarContributionCategory.RAIDS].points) {
        categoryMVPs[WarContributionCategory.RAIDS] = {
          characterId: p.characterId.toString(),
          characterName: p.characterName,
          points: p.raidPoints,
        };
      }
      if (p.territoryPoints > categoryMVPs[WarContributionCategory.TERRITORY].points) {
        categoryMVPs[WarContributionCategory.TERRITORY] = {
          characterId: p.characterId.toString(),
          characterName: p.characterName,
          points: p.territoryPoints,
        };
      }
      if (p.resourcePoints > categoryMVPs[WarContributionCategory.RESOURCES].points) {
        categoryMVPs[WarContributionCategory.RESOURCES] = {
          characterId: p.characterId.toString(),
          characterName: p.characterName,
          points: p.resourcePoints,
        };
      }
      if (p.supportPoints > categoryMVPs[WarContributionCategory.SUPPORT].points) {
        categoryMVPs[WarContributionCategory.SUPPORT] = {
          characterId: p.characterId.toString(),
          characterName: p.characterName,
          points: p.supportPoints,
        };
      }
      if (p.leadershipPoints > categoryMVPs[WarContributionCategory.LEADERSHIP].points) {
        categoryMVPs[WarContributionCategory.LEADERSHIP] = {
          characterId: p.characterId.toString(),
          characterName: p.characterName,
          points: p.leadershipPoints,
        };
      }
    }

    return categoryMVPs;
  }

  /**
   * Award titles based on performance
   */
  static async awardWarTitles(
    warId: mongoose.Types.ObjectId,
    mvpResult: IWarMVPResult
  ): Promise<void> {
    try {
      // Award category titles to category MVPs
      for (const [category, mvp] of Object.entries(mvpResult.categoryMVPs)) {
        if (mvp.points > 0) {
          const career = await CharacterWarCareer.findOrCreate(
            new mongoose.Types.ObjectId(mvp.characterId),
            mvp.characterName
          );

          const title = WAR_CATEGORY_TITLES[category as WarContributionCategory];
          if (!career.titles.includes(title)) {
            // Track category MVP wins and award title if threshold met
            // For now, we just log it - title earning could be more complex
            logger.info(`Category MVP: ${mvp.characterName} earned ${title} for ${category}`);
          }
        }
      }

      // Check for War Legend title (5+ MVP wins)
      const overallMVPCareer = await CharacterWarCareer.findOne({
        characterId: new mongoose.Types.ObjectId(mvpResult.mvpCharacterId),
      });
      if (overallMVPCareer && overallMVPCareer.totalMVPs >= TITLE_THRESHOLDS.MVP_WINS_FOR_LEGEND) {
        if (!overallMVPCareer.titles.includes('War Legend')) {
          overallMVPCareer.titles.push('War Legend');
          await overallMVPCareer.save();
          logger.info(`${overallMVPCareer.characterName} earned War Legend title!`);
        }
      }
    } catch (error) {
      logger.error('Failed to award war titles:', error);
    }
  }

  /**
   * Update career stats for all participants after war ends
   */
  static async updateCareerStats(warId: mongoose.Types.ObjectId): Promise<void> {
    try {
      const participants = await WarContributionStats.find({ warId })
        .sort({ totalPoints: -1 });

      const mvpResult = await this.determineWarMVP(warId);
      const totalParticipants = participants.length;

      for (let i = 0; i < participants.length; i++) {
        const stats = participants[i];
        const rank = i + 1;
        const wasMVP = rank === 1;

        const career = await CharacterWarCareer.findOrCreate(
          stats.characterId,
          stats.characterName
        );

        career.addWarResult(
          warId,
          stats.totalPoints,
          rank,
          totalParticipants,
          {
            combat: stats.combatPoints,
            raids: stats.raidPoints,
            territory: stats.territoryPoints,
            resources: stats.resourcePoints,
            support: stats.supportPoints,
            leadership: stats.leadershipPoints,
          },
          wasMVP
        );

        await career.save();
      }

      // Award titles
      await this.awardWarTitles(warId, mvpResult);

      logger.info(`Updated career stats for ${participants.length} participants in war ${warId}`);
    } catch (error) {
      logger.error('Failed to update career stats:', error);
    }
  }

  /**
   * Get current MVP candidate (real-time during war)
   */
  static async getCurrentMVPCandidate(
    warId: mongoose.Types.ObjectId
  ): Promise<IWarLeaderboardEntry | null> {
    const stats = await WarContributionStats.getCurrentMVP(warId);
    if (!stats) return null;

    const categoryPoints = {
      [WarContributionCategory.COMBAT]: stats.combatPoints,
      [WarContributionCategory.RAIDS]: stats.raidPoints,
      [WarContributionCategory.TERRITORY]: stats.territoryPoints,
      [WarContributionCategory.RESOURCES]: stats.resourcePoints,
      [WarContributionCategory.SUPPORT]: stats.supportPoints,
      [WarContributionCategory.LEADERSHIP]: stats.leadershipPoints,
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
      rank: 1,
      characterId: stats.characterId.toString(),
      characterName: stats.characterName,
      gangId: stats.gangId.toString(),
      gangName: '',
      totalPoints: stats.totalPoints,
      topCategory,
      topCategoryPoints,
      isCurrentMVP: true,
    };
  }

  /**
   * Emit MVP change event when leadership changes
   */
  static async emitMVPChange(
    warId: mongoose.Types.ObjectId,
    previousMVP: { characterId: string; characterName: string; points: number } | undefined,
    newMVP: { characterId: string; characterName: string; points: number }
  ): Promise<void> {
    try {
      emitToRoom(`war:${warId}`, 'war:mvp_change', {
        warId: warId.toString(),
        previousMVP,
        newMVP,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.warn('Failed to emit MVP change:', error);
    }
  }
}

export default WarMVPService;
