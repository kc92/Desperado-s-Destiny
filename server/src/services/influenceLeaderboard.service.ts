/**
 * Influence Leaderboard Service
 *
 * Handles leaderboard queries and rankings for faction influence
 * Phase 11, Wave 11.1
 */

import mongoose from 'mongoose';
import { TerritoryFactionId as FactionId } from '@desperados/shared';
import type {
  InfluenceLeaderboardEntry,
  FactionLeaderboard,
  TerritoryFlipEvent,
  ActionEffectivenessStats,
  ActionCategory,
} from '@desperados/shared';
import {
  PlayerInfluenceContribution,
  IPlayerInfluenceContribution,
} from '../models/PlayerInfluenceContribution.model';
import { Character } from '../models/Character.model';
import { Gang } from '../models/Gang.model';
import logger from '../utils/logger';

/**
 * Influence Leaderboard Service
 */
export class InfluenceLeaderboardService {
  /**
   * Get global leaderboard (all factions)
   */
  static async getGlobalLeaderboard(
    limit: number = 100,
    period: 'all' | 'weekly' | 'monthly' = 'all'
  ): Promise<InfluenceLeaderboardEntry[]> {
    try {
      const sortField = period === 'weekly'
        ? 'weeklyInfluence'
        : period === 'monthly'
        ? 'monthlyInfluence'
        : 'totalInfluenceContributed';

      const contributions = await PlayerInfluenceContribution.find()
        .sort({ [sortField]: -1 })
        .limit(limit)
        .populate('characterId', 'name level gangId')
        .lean();

      const entries: InfluenceLeaderboardEntry[] = [];

      for (let i = 0; i < contributions.length; i++) {
        const contrib = contributions[i] as any;
        const character = contrib.characterId;

        let gangName: string | undefined;
        if (character.gangId) {
          const gang = await Gang.findById(character.gangId).select('name').lean();
          gangName = gang?.name;
        }

        entries.push({
          rank: i + 1,
          characterId: character._id.toString(),
          characterName: character.name,
          characterLevel: character.level,
          factionId: contrib.factionId,
          totalInfluence: contrib.totalInfluenceContributed,
          weeklyInfluence: contrib.weeklyInfluence,
          monthlyInfluence: contrib.monthlyInfluence,
          currentMilestone: contrib.currentMilestone,
          gangId: character.gangId?.toString(),
          gangName,
        });
      }

      return entries;
    } catch (error) {
      logger.error('Error getting global leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get faction-specific leaderboard
   */
  static async getFactionLeaderboard(
    factionId: FactionId,
    limit: number = 100,
    period: 'all' | 'weekly' | 'monthly' = 'all'
  ): Promise<FactionLeaderboard> {
    try {
      const topContributors = await PlayerInfluenceContribution.getTopContributors(
        factionId,
        limit,
        period
      );

      const entries: InfluenceLeaderboardEntry[] = [];

      for (let i = 0; i < topContributors.length; i++) {
        const contrib = topContributors[i] as any;
        const character = contrib.characterId;

        let gangName: string | undefined;
        if (character?.gangId) {
          const gang = await Gang.findById(character.gangId).select('name').lean();
          gangName = gang?.name;
        }

        entries.push({
          rank: i + 1,
          characterId: character?._id?.toString() || contrib.characterId.toString(),
          characterName: character?.name || contrib.characterName,
          characterLevel: character?.level || 1,
          factionId: contrib.factionId,
          totalInfluence: contrib.totalInfluenceContributed,
          weeklyInfluence: contrib.weeklyInfluence,
          monthlyInfluence: contrib.monthlyInfluence,
          currentMilestone: contrib.currentMilestone,
          gangId: character?.gangId?.toString(),
          gangName,
        });
      }

      // Calculate total faction influence
      const totalFactionInfluence = await PlayerInfluenceContribution.getFactionTotalInfluence(
        factionId
      );

      // Calculate territories controlled (placeholder - needs territory control system)
      const territoriesControlled = 0; // TODO: Implement when territory control is connected

      // Calculate weekly growth
      const weeklyGrowth = this.calculateWeeklyGrowth(topContributors);

      return {
        factionId,
        factionName: this.getFactionDisplayName(factionId),
        topContributors: entries,
        totalFactionInfluence,
        territoriesControlled,
        weeklyGrowth,
      };
    } catch (error) {
      logger.error(`Error getting faction leaderboard for ${factionId}:`, error);
      throw error;
    }
  }

  /**
   * Get all faction leaderboards
   */
  static async getAllFactionLeaderboards(
    limit: number = 50
  ): Promise<FactionLeaderboard[]> {
    const factions = Object.values(FactionId);
    const leaderboards: FactionLeaderboard[] = [];

    for (const faction of factions) {
      try {
        const leaderboard = await this.getFactionLeaderboard(faction, limit);
        leaderboards.push(leaderboard);
      } catch (error) {
        logger.error(`Error loading leaderboard for ${faction}:`, error);
      }
    }

    // Sort by total faction influence
    leaderboards.sort((a, b) => b.totalFactionInfluence - a.totalFactionInfluence);

    return leaderboards;
  }

  /**
   * Get character's rank for a specific faction
   */
  static async getCharacterRank(
    characterId: mongoose.Types.ObjectId,
    factionId: FactionId,
    period: 'all' | 'weekly' | 'monthly' = 'all'
  ): Promise<{
    rank: number;
    totalContributors: number;
    percentile: number;
  }> {
    try {
      const contribution = await PlayerInfluenceContribution.findByCharacter(
        characterId,
        factionId
      );

      if (!contribution) {
        return {
          rank: 0,
          totalContributors: 0,
          percentile: 0,
        };
      }

      const sortField = period === 'weekly'
        ? 'weeklyInfluence'
        : period === 'monthly'
        ? 'monthlyInfluence'
        : 'totalInfluenceContributed';

      const contributionValue = period === 'weekly'
        ? contribution.weeklyInfluence
        : period === 'monthly'
        ? contribution.monthlyInfluence
        : contribution.totalInfluenceContributed;

      const rank = await PlayerInfluenceContribution.countDocuments({
        factionId,
        [sortField]: { $gt: contributionValue },
      });

      const totalContributors = await PlayerInfluenceContribution.countDocuments({
        factionId,
      });

      const percentile = totalContributors > 0
        ? Math.round((1 - rank / totalContributors) * 100)
        : 0;

      return {
        rank: rank + 1,
        totalContributors,
        percentile,
      };
    } catch (error) {
      logger.error('Error getting character rank:', error);
      throw error;
    }
  }

  /**
   * Get character's ranks across all factions
   */
  static async getCharacterAllRanks(
    characterId: mongoose.Types.ObjectId
  ): Promise<
    Array<{
      factionId: FactionId;
      rank: number;
      totalContributors: number;
      contribution: number;
    }>
  > {
    const contributions = await PlayerInfluenceContribution.find({ characterId });
    const ranks: Array<{
      factionId: FactionId;
      rank: number;
      totalContributors: number;
      contribution: number;
    }> = [];

    for (const contrib of contributions) {
      const rankData = await this.getCharacterRank(characterId, contrib.factionId);
      ranks.push({
        factionId: contrib.factionId,
        rank: rankData.rank,
        totalContributors: rankData.totalContributors,
        contribution: contrib.totalInfluenceContributed,
      });
    }

    return ranks;
  }

  /**
   * Get action effectiveness stats for a character
   */
  static async getActionEffectivenessStats(
    characterId: mongoose.Types.ObjectId,
    factionId?: FactionId
  ): Promise<ActionEffectivenessStats[]> {
    try {
      const query = factionId
        ? { characterId, factionId }
        : { characterId };

      const contributions = await PlayerInfluenceContribution.find(query);

      const statsMap = new Map<ActionCategory, ActionEffectivenessStats>();

      for (const contrib of contributions) {
        for (const typeContrib of contrib.contributionsByType) {
          const existing = statsMap.get(typeContrib.category);

          if (existing) {
            existing.timesPerformed += 1;
            existing.averageInfluenceGained =
              (existing.averageInfluenceGained * (existing.timesPerformed - 1) + typeContrib.amount) /
              existing.timesPerformed;
            existing.bestSingleGain = Math.max(existing.bestSingleGain, typeContrib.amount);
            // Count unique territories
            const territoryCount = contrib.contributionsByTerritory.length;
            existing.territoriesAffected = Math.max(existing.territoriesAffected, territoryCount);
          } else {
            statsMap.set(typeContrib.category, {
              actionCategory: typeContrib.category,
              timesPerformed: 1,
              averageInfluenceGained: typeContrib.amount,
              bestSingleGain: typeContrib.amount,
              territoriesAffected: contrib.contributionsByTerritory.length,
              milestoneProgress: contrib.totalInfluenceContributed,
            });
          }
        }
      }

      return Array.from(statsMap.values());
    } catch (error) {
      logger.error('Error getting action effectiveness stats:', error);
      throw error;
    }
  }

  /**
   * Get recent territory flip events
   */
  static async getRecentTerritoryFlips(
    limit: number = 20
  ): Promise<TerritoryFlipEvent[]> {
    // TODO: Implement when territory flip tracking is added
    // For now, return empty array
    return [];
  }

  /**
   * Get faction power rankings
   */
  static async getFactionPowerRankings(): Promise<
    Array<{
      factionId: FactionId;
      factionName: string;
      totalInfluence: number;
      activeContributors: number;
      weeklyGrowth: number;
      rank: number;
    }>
  > {
    const factions = Object.values(FactionId);
    const rankings: Array<{
      factionId: FactionId;
      factionName: string;
      totalInfluence: number;
      activeContributors: number;
      weeklyGrowth: number;
      rank: number;
    }> = [];

    for (const faction of factions) {
      const totalInfluence = await PlayerInfluenceContribution.getFactionTotalInfluence(faction);

      const activeContributors = await PlayerInfluenceContribution.countDocuments({
        factionId: faction,
        weeklyInfluence: { $gt: 0 },
      });

      const contributions = await PlayerInfluenceContribution.find({
        factionId: faction,
      }).select('weeklyInfluence');

      const weeklyGrowth = contributions.reduce((sum, c) => sum + c.weeklyInfluence, 0);

      rankings.push({
        factionId: faction,
        factionName: this.getFactionDisplayName(faction),
        totalInfluence,
        activeContributors,
        weeklyGrowth,
        rank: 0, // Will be set after sorting
      });
    }

    // Sort by total influence
    rankings.sort((a, b) => b.totalInfluence - a.totalInfluence);

    // Assign ranks
    rankings.forEach((ranking, index) => {
      ranking.rank = index + 1;
    });

    return rankings;
  }

  /**
   * Calculate weekly growth from contributions
   */
  private static calculateWeeklyGrowth(
    contributions: IPlayerInfluenceContribution[]
  ): number {
    return contributions.reduce((sum, contrib) => sum + contrib.weeklyInfluence, 0);
  }

  /**
   * Get display name for faction
   */
  private static getFactionDisplayName(factionId: FactionId): string {
    const names: Record<FactionId, string> = {
      [FactionId.SETTLER_ALLIANCE]: 'Settler Alliance',
      [FactionId.NAHI_COALITION]: 'Nahi Coalition',
      [FactionId.FRONTERA_CARTEL]: 'Frontera Cartel',
      [FactionId.US_MILITARY]: 'U.S. Military',
      [FactionId.RAILROAD_BARONS]: 'Railroad Barons',
      [FactionId.INDEPENDENT_OUTLAWS]: 'Independent Outlaws',
    };

    return names[factionId] || factionId;
  }

  /**
   * Get top performers for the week
   */
  static async getWeeklyTopPerformers(limit: number = 10): Promise<{
    mostImproved: InfluenceLeaderboardEntry[];
    mostActions: Array<{
      characterId: string;
      characterName: string;
      actionsPerformed: number;
      totalInfluence: number;
    }>;
    milestoneReached: Array<{
      characterId: string;
      characterName: string;
      milestone: string;
      factionId: FactionId;
      reachedAt: Date;
    }>;
  }> {
    // Get most improved (highest weekly influence)
    const mostImproved = await this.getGlobalLeaderboard(limit, 'weekly');

    // Get most actions performed
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const contributions = await PlayerInfluenceContribution.find({
      lastContribution: { $gte: weekAgo },
    })
      .sort({ totalActionsPerformed: -1 })
      .limit(limit)
      .populate('characterId', 'name')
      .lean();

    const mostActions = contributions.map((contrib: any) => ({
      characterId: contrib.characterId._id.toString(),
      characterName: contrib.characterId.name,
      actionsPerformed: contrib.totalActionsPerformed,
      totalInfluence: contrib.totalInfluenceContributed,
    }));

    // Get recent milestone achievements
    const milestones = await PlayerInfluenceContribution.find({
      lastMilestoneReached: { $gte: weekAgo },
    })
      .sort({ lastMilestoneReached: -1 })
      .limit(limit)
      .populate('characterId', 'name')
      .lean();

    const milestoneReached = milestones.map((contrib: any) => ({
      characterId: contrib.characterId._id.toString(),
      characterName: contrib.characterId.name,
      milestone: contrib.currentMilestone,
      factionId: contrib.factionId,
      reachedAt: contrib.lastMilestoneReached,
    }));

    return {
      mostImproved,
      mostActions,
      milestoneReached,
    };
  }
}
