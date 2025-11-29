/**
 * Legacy Controller
 * HTTP endpoints for cross-character progression system
 */

import { Request, Response } from 'express';
import { legacyService } from '../services/legacy.service';
import {
  ClaimLegacyRewardRequest,
  LegacyProfileResponse,
  LegacyMilestonesResponse,
} from '@desperados/shared';
import { LEGACY_MILESTONES } from '../data/legacy/milestones';

/**
 * Get legacy profile for authenticated user
 * GET /api/legacy/profile
 */
export const getLegacyProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id;

    const result = await legacyService.getLegacyProfileWithDetails(userId);

    const response: LegacyProfileResponse = {
      profile: result.profile,
      tierDefinition: result.tierDefinition,
      nextTier: result.nextTier || undefined,
      milestonesUntilNextTier: result.milestonesUntilNextTier || undefined,
      activeBonuses: result.activeBonuses,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching legacy profile:', error);
    res.status(500).json({
      error: 'Failed to fetch legacy profile',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get all milestones with progress
 * GET /api/legacy/milestones
 */
export const getMilestones = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id;

    const progress = await legacyService.getMilestoneProgress(userId);
    const completed = await legacyService.getCompletedMilestones(userId);

    // Separate milestones into categories
    const progressMap = new Map(progress.map((p) => [p.milestoneId, p]));
    const completedSet = new Set(completed);

    const inProgress: string[] = [];
    const locked: string[] = [];

    for (const milestone of LEGACY_MILESTONES) {
      if (completedSet.has(milestone.id)) {
        continue; // Already in completed array
      }

      const prog = progressMap.get(milestone.id);
      if (prog && prog.currentValue > 0) {
        inProgress.push(milestone.id);
      } else {
        locked.push(milestone.id);
      }
    }

    const response: LegacyMilestonesResponse = {
      milestones: LEGACY_MILESTONES,
      progress,
      completed,
      inProgress,
      locked,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({
      error: 'Failed to fetch milestones',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get active bonuses for authenticated user
 * GET /api/legacy/bonuses
 */
export const getActiveBonuses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id;

    const bonuses = await legacyService.getBonusMultipliers(userId);

    res.status(200).json(bonuses);
  } catch (error) {
    console.error('Error fetching active bonuses:', error);
    res.status(500).json({
      error: 'Failed to fetch active bonuses',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get new character bonuses
 * GET /api/legacy/new-character-bonuses
 */
export const getNewCharacterBonuses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id;

    const bonuses = await legacyService.getNewCharacterBonuses(userId);

    res.status(200).json(bonuses);
  } catch (error) {
    console.error('Error fetching new character bonuses:', error);
    res.status(500).json({
      error: 'Failed to fetch new character bonuses',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Claim a legacy reward
 * POST /api/legacy/claim-reward
 */
export const claimReward = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { rewardId, characterId } = req.body as ClaimLegacyRewardRequest;

    if (!rewardId || !characterId) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'rewardId and characterId are required',
      });
      return;
    }

    // TODO: Verify characterId belongs to user

    const result = await legacyService.claimReward({
      rewardId,
      characterId,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error claiming reward:', error);
    res.status(400).json({
      error: 'Failed to claim reward',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get available rewards
 * GET /api/legacy/rewards
 */
export const getAvailableRewards = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id;

    const rewards = await legacyService.getAvailableRewards(userId);

    res.status(200).json(rewards);
  } catch (error) {
    console.error('Error fetching available rewards:', error);
    res.status(500).json({
      error: 'Failed to fetch available rewards',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get lifetime stats
 * GET /api/legacy/stats
 */
export const getLifetimeStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id;

    const profile = await legacyService.getLegacyProfile(userId);

    res.status(200).json(profile.lifetimeStats);
  } catch (error) {
    console.error('Error fetching lifetime stats:', error);
    res.status(500).json({
      error: 'Failed to fetch lifetime stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get character contributions
 * GET /api/legacy/contributions
 */
export const getCharacterContributions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id;

    const profile = await legacyService.getLegacyProfile(userId);

    res.status(200).json(profile.characterContributions);
  } catch (error) {
    console.error('Error fetching character contributions:', error);
    res.status(500).json({
      error: 'Failed to fetch character contributions',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Admin/Dev: Update a specific stat (for testing)
 * POST /api/legacy/admin/update-stat
 */
export const updateStat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { statKey, value, increment } = req.body;

    if (!statKey || value === undefined) {
      res.status(400).json({
        error: 'Missing required fields',
        message: 'statKey and value are required',
      });
      return;
    }

    const profile = await legacyService.updateStat(
      userId,
      statKey,
      value,
      increment !== false
    );

    res.status(200).json(profile);
  } catch (error) {
    console.error('Error updating stat:', error);
    res.status(500).json({
      error: 'Failed to update stat',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
