/**
 * Bounty Hunting Controller
 * Handles bounty hunting API requests
 *
 * Sprint 7: Mid-Game Content - Bounty Hunting (L20 unlock)
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { BountyHuntingService } from '../services/bountyHunting.service';
import { getBountyTargetById } from '../data/activities/bountyTargets';
import logger from '../utils/logger';

/**
 * GET /api/bounty-hunting/available/:characterId
 * Get available bounties and current hunt status
 */
export async function getAvailableBounties(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.params;
    if (!characterId) {
      res.status(400).json({ success: false, error: 'Character ID required' });
      return;
    }

    const { bounties, activeHunt } = await BountyHuntingService.getAvailableBounties(characterId);

    res.status(200).json({
      success: true,
      data: {
        bounties: bounties.map(b => ({
          targetId: b.targetId,
          name: b.name,
          alias: b.alias,
          tier: b.tier,
          levelRequired: b.levelRequired,
          goldReward: b.goldReward,
          xpReward: b.xpReward,
          wantedPoster: b.wantedPoster,
          expiresInHours: b.expiresInHours,
          hasGang: b.hasGang,
          canNegotiate: b.canNegotiate,
          canAmbush: b.canAmbush
        })),
        activeHunt: activeHunt ? {
          huntId: activeHunt._id,
          targetId: activeHunt.targetId,
          targetName: getBountyTargetById(activeHunt.targetId)?.name,
          tier: activeHunt.tier,
          status: activeHunt.status,
          trackingProgress: activeHunt.trackingProgress,
          expiresAt: activeHunt.expiresAt,
          cluesFound: activeHunt.cluesFound,
          encounters: activeHunt.encounters
        } : null
      }
    });
  } catch (error) {
    logger.error('Error getting available bounties:', error);
    res.status(500).json({ success: false, error: 'Failed to get bounties' });
  }
}

/**
 * POST /api/bounty-hunting/accept
 * Accept a bounty and start hunting
 */
export async function acceptBounty(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, targetId } = req.body;
    if (!characterId || !targetId) {
      res.status(400).json({ success: false, error: 'Character ID and target ID required' });
      return;
    }

    const result = await BountyHuntingService.acceptBounty(characterId, targetId);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    const target = getBountyTargetById(targetId);

    res.status(200).json({
      success: true,
      data: {
        huntId: result.hunt?._id,
        targetName: target?.name,
        tier: result.hunt?.tier,
        expiresAt: result.hunt?.expiresAt,
        message: `You have accepted the bounty on ${target?.name}. Happy hunting.`
      }
    });
  } catch (error) {
    logger.error('Error accepting bounty:', error);
    res.status(500).json({ success: false, error: 'Failed to accept bounty' });
  }
}

/**
 * POST /api/bounty-hunting/track
 * Progress tracking on current bounty
 */
export async function progressTracking(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.body;
    if (!characterId) {
      res.status(400).json({ success: false, error: 'Character ID required' });
      return;
    }

    const result = await BountyHuntingService.progressTracking(characterId);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        progressGained: result.progressGained,
        newProgress: result.newProgress,
        canConfront: result.canConfront,
        encounter: result.encounter
      }
    });
  } catch (error) {
    logger.error('Error progressing tracking:', error);
    res.status(500).json({ success: false, error: 'Failed to progress tracking' });
  }
}

/**
 * POST /api/bounty-hunting/confront
 * Confront the bounty target
 */
export async function confrontTarget(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, method } = req.body;
    if (!characterId || !method) {
      res.status(400).json({ success: false, error: 'Character ID and method required' });
      return;
    }

    if (!['fight', 'negotiate', 'ambush'].includes(method)) {
      res.status(400).json({ success: false, error: 'Invalid method. Use: fight, negotiate, or ambush' });
      return;
    }

    const result = await BountyHuntingService.confrontTarget(characterId, method);

    res.status(200).json({
      success: result.success,
      data: {
        outcome: result.outcome,
        goldAwarded: result.goldAwarded,
        xpAwarded: result.xpAwarded,
        reputationChange: result.reputationChange,
        error: result.error
      }
    });
  } catch (error) {
    logger.error('Error confronting target:', error);
    res.status(500).json({ success: false, error: 'Failed to confront target' });
  }
}

/**
 * POST /api/bounty-hunting/abandon
 * Abandon current bounty hunt
 */
export async function abandonHunt(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.body;
    if (!characterId) {
      res.status(400).json({ success: false, error: 'Character ID required' });
      return;
    }

    const success = await BountyHuntingService.abandonHunt(characterId);

    if (!success) {
      res.status(400).json({ success: false, error: 'No active hunt to abandon' });
      return;
    }

    res.status(200).json({
      success: true,
      data: { message: 'Hunt abandoned' }
    });
  } catch (error) {
    logger.error('Error abandoning hunt:', error);
    res.status(500).json({ success: false, error: 'Failed to abandon hunt' });
  }
}

/**
 * GET /api/bounty-hunting/history/:characterId
 * Get bounty hunting history
 */
export async function getHuntHistory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;

    const history = await BountyHuntingService.getHuntHistory(characterId, limit);

    res.status(200).json({
      success: true,
      data: {
        history: history.map(h => ({
          huntId: h._id,
          targetId: h.targetId,
          targetName: getBountyTargetById(h.targetId)?.name,
          tier: h.tier,
          status: h.status,
          captureMethod: h.captureMethod,
          goldAwarded: h.goldAwarded,
          xpAwarded: h.xpAwarded,
          completedAt: h.completedAt
        }))
      }
    });
  } catch (error) {
    logger.error('Error getting hunt history:', error);
    res.status(500).json({ success: false, error: 'Failed to get history' });
  }
}

/**
 * GET /api/bounty-hunting/stats/:characterId
 * Get bounty hunting statistics
 */
export async function getStatistics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.params;

    const stats = await BountyHuntingService.getStatistics(characterId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting statistics:', error);
    res.status(500).json({ success: false, error: 'Failed to get statistics' });
  }
}
