/**
 * Leaderboard Controller
 * Handles leaderboard rankings for various metrics
 */

import { Request, Response } from 'express';
import { Character } from '../models/Character.model';
import { Gang } from '../models/Gang.model';
import { asyncHandler } from '../middleware/asyncHandler';

/**
 * Get date range filter based on range parameter
 */
function getDateFilter(range: string): Date | null {
  const now = new Date();
  switch (range) {
    case 'daily':
      return new Date(now.setDate(now.getDate() - 1));
    case 'weekly':
      return new Date(now.setDate(now.getDate() - 7));
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() - 1));
    default: // 'all'
      return null;
  }
}

/**
 * Get level leaderboard
 * GET /api/leaderboard/level
 */
export const getLevelLeaderboard = asyncHandler(
  async (req: Request, res: Response) => {
    const range = (req.query.range as string) || 'all';
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 100));

    const dateFilter = getDateFilter(range);
    const query: any = { isActive: true };
    if (dateFilter) {
      query.lastActive = { $gte: dateFilter };
    }

    const characters = await Character.find(query)
      .select('name level experience faction')
      .sort({ level: -1, experience: -1 })
      .limit(limit)
      .lean();

    const leaderboard = characters.map((char, index) => ({
      rank: index + 1,
      characterId: char._id,
      name: char.name,
      value: char.level,
      experience: char.experience,
      faction: char.faction
    }));

    res.json({
      success: true,
      data: { leaderboard, type: 'level', range }
    });
  }
);

/**
 * Get gold leaderboard
 * GET /api/leaderboard/gold
 */
export const getGoldLeaderboard = asyncHandler(
  async (req: Request, res: Response) => {
    const range = (req.query.range as string) || 'all';
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 100));

    const dateFilter = getDateFilter(range);
    const query: any = { isActive: true };
    if (dateFilter) {
      query.lastActive = { $gte: dateFilter };
    }

    const characters = await Character.find(query)
      .select('name gold level faction')
      .sort({ gold: -1 })
      .limit(limit)
      .lean();

    const leaderboard = characters.map((char, index) => ({
      rank: index + 1,
      characterId: char._id,
      name: char.name,
      value: char.gold,
      level: char.level,
      faction: char.faction
    }));

    res.json({
      success: true,
      data: { leaderboard, type: 'gold', range }
    });
  }
);

/**
 * Get reputation leaderboard (based on level + combat wins)
 * GET /api/leaderboard/reputation
 */
export const getReputationLeaderboard = asyncHandler(
  async (req: Request, res: Response) => {
    const range = (req.query.range as string) || 'all';
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 100));

    const dateFilter = getDateFilter(range);
    const matchStage: any = { isActive: true };
    if (dateFilter) {
      matchStage.lastActive = { $gte: dateFilter };
    }

    // Reputation = level * 100 + wins * 10
    const characters = await Character.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          reputation: {
            $add: [
              { $multiply: ['$level', 100] },
              { $multiply: [{ $ifNull: ['$combatStats.wins', 0] }, 10] }
            ]
          }
        }
      },
      { $sort: { reputation: -1 } },
      { $limit: limit },
      { $project: { name: 1, reputation: 1, level: 1, faction: 1, 'combatStats.wins': 1 } }
    ]);

    const leaderboard = characters.map((char, index) => ({
      rank: index + 1,
      characterId: char._id,
      name: char.name,
      value: char.reputation,
      level: char.level,
      wins: char.combatStats?.wins || 0,
      faction: char.faction
    }));

    res.json({
      success: true,
      data: { leaderboard, type: 'reputation', range }
    });
  }
);

/**
 * Get combat leaderboard
 * GET /api/leaderboard/combat
 */
export const getCombatLeaderboard = asyncHandler(
  async (req: Request, res: Response) => {
    const range = (req.query.range as string) || 'all';
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 100));

    const dateFilter = getDateFilter(range);
    const query: any = { isActive: true };
    if (dateFilter) {
      query.lastActive = { $gte: dateFilter };
    }

    const characters = await Character.find(query)
      .select('name combatStats level faction')
      .sort({ 'combatStats.wins': -1 })
      .limit(limit)
      .lean();

    const leaderboard = characters.map((char, index) => ({
      rank: index + 1,
      characterId: char._id,
      name: char.name,
      value: char.combatStats?.wins || 0,
      kills: char.combatStats?.kills || 0,
      losses: char.combatStats?.losses || 0,
      level: char.level,
      faction: char.faction
    }));

    res.json({
      success: true,
      data: { leaderboard, type: 'combat', range }
    });
  }
);

/**
 * Get bounties leaderboard
 * GET /api/leaderboard/bounties
 */
export const getBountiesLeaderboard = asyncHandler(
  async (req: Request, res: Response) => {
    const range = (req.query.range as string) || 'all';
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 100));

    const dateFilter = getDateFilter(range);
    const query: any = { isActive: true };
    if (dateFilter) {
      query.lastActive = { $gte: dateFilter };
    }

    const characters = await Character.find(query)
      .select('name bountyAmount wantedLevel level faction')
      .sort({ bountyAmount: -1 })
      .limit(limit)
      .lean();

    const leaderboard = characters.map((char, index) => ({
      rank: index + 1,
      characterId: char._id,
      name: char.name,
      value: char.bountyAmount || 0,
      wantedLevel: char.wantedLevel || 0,
      level: char.level,
      faction: char.faction
    }));

    res.json({
      success: true,
      data: { leaderboard, type: 'bounties', range }
    });
  }
);

/**
 * Get gangs leaderboard
 * GET /api/leaderboard/gangs
 */
export const getGangsLeaderboard = asyncHandler(
  async (req: Request, res: Response) => {
    const range = (req.query.range as string) || 'all';
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 100));

    const dateFilter = getDateFilter(range);
    const query: any = { isActive: true };
    if (dateFilter) {
      query.updatedAt = { $gte: dateFilter };
    }

    const gangs = await Gang.aggregate([
      { $match: query },
      {
        $addFields: {
          memberCount: { $size: '$members' },
          territoryCount: { $size: { $ifNull: ['$territories', []] } },
          bankBalance: '$bank'
        }
      },
      { $sort: { level: -1, experience: -1 } },
      { $limit: limit },
      { $project: { name: 1, level: 1, experience: 1, memberCount: 1, territoryCount: 1, bankBalance: 1 } }
    ]);

    const leaderboard = gangs.map((gang, index) => ({
      rank: index + 1,
      gangId: gang._id,
      name: gang.name,
      value: gang.level,
      members: gang.memberCount || 0,
      territories: gang.territoryCount || 0,
      wealth: gang.bankBalance || 0
    }));

    res.json({
      success: true,
      data: { leaderboard, type: 'gangs', range }
    });
  }
);

export default {
  getLevelLeaderboard,
  getGoldLeaderboard,
  getReputationLeaderboard,
  getCombatLeaderboard,
  getBountiesLeaderboard,
  getGangsLeaderboard
};
