/**
 * Bounty Controller
 *
 * HTTP request handlers for bounty system endpoints
 */

import { Request, Response } from 'express';
import { BountyService } from '../services/bounty.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { HttpStatus } from '../types';
import logger from '../utils/logger';

/**
 * Get wanted level for current character
 * GET /api/bounty/wanted
 */
export const getWantedLevel = asyncHandler(async (req: Request, res: Response) => {
  const characterId = req.characterId;

  if (!characterId) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      error: 'Character not selected',
    });
  }

  const wantedLevel = await BountyService.getWantedLevel(characterId);

  return res.status(HttpStatus.OK).json({
    success: true,
    data: {
      characterId: wantedLevel.characterId.toString(),
      characterName: wantedLevel.characterName,
      settlerAlliance: wantedLevel.settlerAlliance,
      nahiCoalition: wantedLevel.nahiCoalition,
      frontera: wantedLevel.frontera,
      totalBounty: wantedLevel.totalBounty,
      wantedRank: wantedLevel.wantedRank,
      activeBounties: wantedLevel.activeBounties,
      lastCrimeDate: wantedLevel.lastCrimeDate,
      lastSeenLocation: wantedLevel.lastSeenLocation,
    },
  });
});

/**
 * Get bounty board (available bounties to hunt)
 * GET /api/bounty/board
 */
export const getBountyBoard = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const location = req.query.location as string | undefined;

  const bounties = await BountyService.getBountyBoard(location, limit);

  return res.status(HttpStatus.OK).json({
    success: true,
    data: bounties,
    meta: {
      count: bounties.length,
      location: location || 'all',
    },
  });
});

/**
 * Get active bounties for a specific character
 * GET /api/bounty/:characterId
 */
export const getCharacterBounties = asyncHandler(async (req: Request, res: Response) => {
  const { characterId } = req.params;

  if (!characterId) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      error: 'Character ID is required',
    });
  }

  const bounties = await BountyService.getActiveBounties(characterId);

  // Convert to safe response format
  const safeBounties = bounties.map((bounty) => ({
    id: bounty._id.toString(),
    targetId: bounty.targetId.toString(),
    targetName: bounty.targetName,
    bountyType: bounty.bountyType,
    issuerId: bounty.issuerId?.toString(),
    issuerName: bounty.issuerName,
    issuerFaction: bounty.issuerFaction,
    amount: bounty.amount,
    reason: bounty.reason,
    crimes: bounty.crimes,
    status: bounty.status,
    createdAt: bounty.createdAt,
    expiresAt: bounty.expiresAt,
    lastSeenLocation: bounty.lastSeenLocation,
    collectibleBy: bounty.collectibleBy,
  }));

  return res.status(HttpStatus.OK).json({
    success: true,
    data: safeBounties,
    meta: {
      count: safeBounties.length,
      characterId,
    },
  });
});

/**
 * Place a bounty on another player
 * POST /api/bounty/place
 */
export const placeBounty = asyncHandler(async (req: Request, res: Response) => {
  const characterId = req.characterId;

  if (!characterId) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      error: 'Character not selected',
    });
  }

  const { targetId, amount, reason } = req.body;

  // Validation
  if (!targetId) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      error: 'Target character ID is required',
    });
  }

  if (!amount || typeof amount !== 'number' || amount < 100) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      error: 'Amount must be at least $100',
    });
  }

  try {
    const bounty = await BountyService.placeBounty(
      characterId,
      targetId,
      amount,
      reason
    );

    return res.status(HttpStatus.CREATED).json({
      success: true,
      data: {
        id: bounty._id.toString(),
        targetId: bounty.targetId.toString(),
        targetName: bounty.targetName,
        amount: bounty.amount,
        reason: bounty.reason,
        expiresAt: bounty.expiresAt,
      },
      message: `Bounty of $${amount} placed on ${bounty.targetName}`,
    });
  } catch (error: any) {
    logger.error('Error placing bounty:', error);
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      error: error.message || 'Failed to place bounty',
    });
  }
});

/**
 * Collect a bounty by bringing in the target
 * POST /api/bounty/collect
 */
export const collectBounty = asyncHandler(async (req: Request, res: Response) => {
  const characterId = req.characterId;

  if (!characterId) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      error: 'Character not selected',
    });
  }

  const { bountyId } = req.body;

  if (!bountyId) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      error: 'Bounty ID is required',
    });
  }

  try {
    const result = await BountyService.collectBounty(characterId, bountyId);

    return res.status(HttpStatus.OK).json({
      success: true,
      data: {
        goldEarned: result.goldEarned,
      },
      message: result.message,
    });
  } catch (error: any) {
    logger.error('Error collecting bounty:', error);
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      error: error.message || 'Failed to collect bounty',
    });
  }
});

/**
 * Get most wanted criminals (leaderboard)
 * GET /api/bounty/most-wanted
 */
export const getMostWanted = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10;

  const mostWanted = await BountyService.getMostWanted(limit);

  const safeList = mostWanted.map((wl) => ({
    characterId: wl.characterId.toString(),
    characterName: wl.characterName,
    totalBounty: wl.totalBounty,
    wantedRank: wl.wantedRank,
    activeBounties: wl.activeBounties,
    lastSeenLocation: wl.lastSeenLocation,
    lastCrimeDate: wl.lastCrimeDate,
  }));

  return res.status(HttpStatus.OK).json({
    success: true,
    data: safeList,
    meta: {
      count: safeList.length,
    },
  });
});

/**
 * Check if bounty hunter should spawn for current character
 * GET /api/bounty/hunter-check
 */
export const checkBountyHunter = asyncHandler(async (req: Request, res: Response) => {
  const characterId = req.characterId;

  if (!characterId) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      error: 'Character not selected',
    });
  }

  const encounter = await BountyService.getBountyHunterEncounter(characterId);

  return res.status(HttpStatus.OK).json({
    success: true,
    data: encounter,
  });
});

/**
 * Admin: Cancel all bounties for a character
 * DELETE /api/bounty/cancel/:characterId
 */
export const cancelBounties = asyncHandler(async (req: Request, res: Response) => {
  const { characterId } = req.params;

  if (!characterId) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      error: 'Character ID is required',
    });
  }

  // Admin authorization enforced at route level via requireAdmin middleware

  const cancelled = await BountyService.cancelBounties(characterId);

  return res.status(HttpStatus.OK).json({
    success: true,
    message: `Cancelled ${cancelled} bounties`,
    data: {
      cancelled,
    },
  });
});
