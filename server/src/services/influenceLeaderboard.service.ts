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
import { Territory } from '../models/Territory.model';
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

      // Batch fetch all gang names to avoid N+1 queries
      const gangIds = contributions
        .map((c: any) => c.characterId?.gangId)
        .filter((id: any) => id != null);

      const gangMap = new Map<string, string>();
      if (gangIds.length > 0) {
        const gangs = await Gang.find({ _id: { $in: gangIds } }).select('name').lean();
        for (const gang of gangs) {
          gangMap.set(gang._id.toString(), gang.name);
        }
      }

      const entries: InfluenceLeaderboardEntry[] = contributions.map((contrib: any, i: number) => {
        const character = contrib.characterId;
        const gangName = character?.gangId ? gangMap.get(character.gangId.toString()) : undefined;

        return {
          rank: i + 1,
          characterId: character?._id?.toString() || '',
          characterName: character?.name || 'Unknown',
          characterLevel: character?.level || 1,
          factionId: contrib.factionId,
          totalInfluence: contrib.totalInfluenceContributed,
          weeklyInfluence: contrib.weeklyInfluence,
          monthlyInfluence: contrib.monthlyInfluence,
          currentMilestone: contrib.currentMilestone,
          gangId: character?.gangId?.toString(),
          gangName,
        };
      });

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

      // Batch fetch all gang names to avoid N+1 queries
      const gangIds = topContributors
        .map((c: any) => c.characterId?.gangId)
        .filter((id: any) => id != null);

      const gangMap = new Map<string, string>();
      if (gangIds.length > 0) {
        const gangs = await Gang.find({ _id: { $in: gangIds } }).select('name').lean();
        for (const gang of gangs) {
          gangMap.set(gang._id.toString(), gang.name);
        }
      }

      const entries: InfluenceLeaderboardEntry[] = topContributors.map((contrib: any, i: number) => {
        const character = contrib.characterId;
        const gangName = character?.gangId ? gangMap.get(character.gangId.toString()) : undefined;

        return {
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
        };
      });

      // Run these queries in parallel instead of sequentially
      const [totalFactionInfluence, territoriesControlled] = await Promise.all([
        PlayerInfluenceContribution.getFactionTotalInfluence(factionId),
        Territory.countDocuments({
          faction: factionId,
          controllingGangId: { $ne: null },
        })
      ]);

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

    // Fetch all faction leaderboards in parallel
    const leaderboardPromises = factions.map(async faction => {
      try {
        return await this.getFactionLeaderboard(faction, limit);
      } catch (error) {
        logger.error(`Error loading leaderboard for ${faction}:`, error);
        return null;
      }
    });

    const results = await Promise.all(leaderboardPromises);
    const leaderboards = results.filter((lb): lb is FactionLeaderboard => lb !== null);

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
   * Get recent territory flip events from conquest history
   */
  static async getRecentTerritoryFlips(
    limit: number = 20
  ): Promise<TerritoryFlipEvent[]> {
    try {
      // Get all territories with conquest history
      const territories = await Territory.find({
        'conquestHistory.0': { $exists: true },
      }).lean();

      // Flatten all conquest events across territories
      const allFlips: Array<{
        territoryId: string;
        territoryName: string;
        faction: string;
        conquest: {
          gangId: string;
          gangName: string;
          conqueredAt: Date;
          capturePoints: number;
        };
      }> = [];

      for (const territory of territories) {
        for (const conquest of territory.conquestHistory || []) {
          allFlips.push({
            territoryId: territory.id,
            territoryName: territory.name,
            faction: territory.faction,
            conquest: {
              gangId: conquest.gangId?.toString() || '',
              gangName: conquest.gangName,
              conqueredAt: conquest.conqueredAt,
              capturePoints: conquest.capturePoints,
            },
          });
        }
      }

      // Sort by conquest date descending and take limit
      allFlips.sort((a, b) =>
        new Date(b.conquest.conqueredAt).getTime() - new Date(a.conquest.conqueredAt).getTime()
      );
      const recentFlips = allFlips.slice(0, limit);

      // Map to TerritoryFlipEvent format
      return recentFlips.map(flip => ({
        territoryId: flip.territoryId,
        territoryName: flip.territoryName,
        previousFaction: null, // Not tracked in conquest history
        newFaction: flip.faction as FactionId,
        flipTime: new Date(flip.conquest.conqueredAt),
        triggeringAction: undefined,
        finalInfluenceScores: new Map<FactionId, number>(),
      }));
    } catch (error) {
      logger.error('Error getting recent territory flips:', error);
      return [];
    }
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

    // Fetch all faction data in parallel using aggregation for efficiency
    const rankingPromises = factions.map(async faction => {
      const [totalInfluence, activeContributors, weeklyGrowthResult] = await Promise.all([
        PlayerInfluenceContribution.getFactionTotalInfluence(faction),
        PlayerInfluenceContribution.countDocuments({
          factionId: faction,
          weeklyInfluence: { $gt: 0 },
        }),
        // Use aggregation to sum weeklyInfluence in a single query
        PlayerInfluenceContribution.aggregate([
          { $match: { factionId: faction } },
          { $group: { _id: null, total: { $sum: '$weeklyInfluence' } } }
        ])
      ]);

      const weeklyGrowth = weeklyGrowthResult[0]?.total || 0;

      return {
        factionId: faction,
        factionName: this.getFactionDisplayName(faction),
        totalInfluence,
        activeContributors,
        weeklyGrowth,
        rank: 0, // Will be set after sorting
      };
    });

    const rankings = await Promise.all(rankingPromises);

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
