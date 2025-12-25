/**
 * Mining Controller
 * Handles mining claim API requests
 *
 * Sprint 7: Mid-Game Content - Mining Claims (L25 unlock)
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { MiningClaimService } from '../services/miningClaim.service';
import { getClaimLocationById } from '../data/activities/miningClaims';
import logger from '../utils/logger';

/**
 * GET /api/mining/locations/:characterId
 * Get available claim locations and owned claims
 */
export async function getAvailableLocations(req: AuthRequest, res: Response): Promise<void> {
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

    const { locations, ownedClaims, canStakeMore } = await MiningClaimService.getAvailableLocations(characterId);

    res.status(200).json({
      success: true,
      data: {
        locations: locations.map(l => ({
          claimId: l.claimId,
          name: l.name,
          description: l.description,
          region: l.region,
          tier: l.tier,
          levelRequired: l.levelRequired,
          stakeCost: l.stakeCost,
          resources: l.resources,
          contestable: l.contestable,
          dangerLevel: l.dangerLevel,
          flavorText: l.flavorText
        })),
        ownedClaims: ownedClaims.map(c => ({
          id: c._id,
          claimId: c.claimId,
          name: getClaimLocationById(c.claimId)?.name,
          tier: c.tier,
          status: c.status,
          lastCollectedAt: c.lastCollectedAt,
          totalYield: c.totalYield,
          upgradeLevel: c.upgradeLevel
        })),
        canStakeMore
      }
    });
  } catch (error) {
    logger.error('Error getting mining locations:', error);
    res.status(500).json({ success: false, error: 'Failed to get locations' });
  }
}

/**
 * POST /api/mining/stake
 * Stake a new mining claim
 */
export async function stakeClaim(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, claimId, useDeed } = req.body;
    if (!characterId || !claimId) {
      res.status(400).json({ success: false, error: 'Character ID and claim ID required' });
      return;
    }

    const result = await MiningClaimService.stakeClaim(characterId, claimId, useDeed || false);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    const location = getClaimLocationById(claimId);

    res.status(200).json({
      success: true,
      data: {
        id: result.claim?._id,
        claimId: result.claim?.claimId,
        name: location?.name,
        tier: result.claim?.tier,
        message: `You have staked a claim at ${location?.name}!`
      }
    });
  } catch (error) {
    logger.error('Error staking claim:', error);
    res.status(500).json({ success: false, error: 'Failed to stake claim' });
  }
}

/**
 * POST /api/mining/collect
 * Collect yield from a mining claim
 */
export async function collectYield(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, claimDocId } = req.body;
    if (!characterId || !claimDocId) {
      res.status(400).json({ success: false, error: 'Character ID and claim document ID required' });
      return;
    }

    const result = await MiningClaimService.collectYield(characterId, claimDocId);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        resources: result.resources,
        goldValue: result.goldValue,
        hoursAccumulated: result.hoursAccumulated
      }
    });
  } catch (error) {
    logger.error('Error collecting yield:', error);
    res.status(500).json({ success: false, error: 'Failed to collect yield' });
  }
}

/**
 * POST /api/mining/upgrade
 * Upgrade a mining claim
 */
export async function upgradeClaim(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, claimDocId } = req.body;
    if (!characterId || !claimDocId) {
      res.status(400).json({ success: false, error: 'Character ID and claim document ID required' });
      return;
    }

    const result = await MiningClaimService.upgradeClaim(characterId, claimDocId);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        newTier: result.newTier,
        cost: result.cost,
        message: `Claim upgraded to Tier ${result.newTier}!`
      }
    });
  } catch (error) {
    logger.error('Error upgrading claim:', error);
    res.status(500).json({ success: false, error: 'Failed to upgrade claim' });
  }
}

/**
 * POST /api/mining/abandon
 * Abandon a mining claim
 */
export async function abandonClaim(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, claimDocId } = req.body;
    if (!characterId || !claimDocId) {
      res.status(400).json({ success: false, error: 'Character ID and claim document ID required' });
      return;
    }

    const success = await MiningClaimService.abandonClaim(characterId, claimDocId);

    if (!success) {
      res.status(400).json({ success: false, error: 'Failed to abandon claim' });
      return;
    }

    res.status(200).json({
      success: true,
      data: { message: 'Claim abandoned' }
    });
  } catch (error) {
    logger.error('Error abandoning claim:', error);
    res.status(500).json({ success: false, error: 'Failed to abandon claim' });
  }
}

/**
 * POST /api/mining/contest
 * Contest another player's claim
 */
export async function contestClaim(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, claimDocId } = req.body;
    if (!characterId || !claimDocId) {
      res.status(400).json({ success: false, error: 'Character ID and claim document ID required' });
      return;
    }

    const result = await MiningClaimService.contestClaim(characterId, claimDocId);

    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }

    res.status(200).json({
      success: true,
      data: { message: 'Claim contested! The battle for this claim has begun.' }
    });
  } catch (error) {
    logger.error('Error contesting claim:', error);
    res.status(500).json({ success: false, error: 'Failed to contest claim' });
  }
}

/**
 * GET /api/mining/stats/:characterId
 * Get mining statistics
 */
export async function getStatistics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.params;

    const stats = await MiningClaimService.getStatistics(characterId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting statistics:', error);
    res.status(500).json({ success: false, error: 'Failed to get statistics' });
  }
}
