/**
 * Legacy Controller
 * HTTP endpoints for cross-character progression system
 */

import { Request, Response } from 'express';
import { legacyService } from '../services/legacy.service';
import logger from '../utils/logger';
import { sanitizeErrorMessage } from '../utils/errors';
import {
  ClaimLegacyRewardRequest,
  LegacyProfileResponse,
  LegacyMilestonesResponse,
} from '@desperados/shared';
import { LEGACY_MILESTONES } from '../data/legacy/milestones';
import { Character } from '../models/Character.model';

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
    logger.error('[LegacyController] Error fetching legacy profile:', error);
    res.status(500).json({
      error: 'Failed to fetch legacy profile',
      message: sanitizeErrorMessage(error),
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
    logger.error('[LegacyController] Error fetching milestones:', error);
    res.status(500).json({
      error: 'Failed to fetch milestones',
      message: sanitizeErrorMessage(error),
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
    logger.error('[LegacyController] Error fetching active bonuses:', error);
    res.status(500).json({
      error: 'Failed to fetch active bonuses',
      message: sanitizeErrorMessage(error),
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
    logger.error('[LegacyController] Error fetching new character bonuses:', error);
    res.status(500).json({
      error: 'Failed to fetch new character bonuses',
      message: sanitizeErrorMessage(error),
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

    // Verify characterId belongs to the authenticated user
    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({
        error: 'Character not found',
        message: 'The specified character does not exist',
      });
      return;
    }

    if (character.userId.toString() !== userId.toString()) {
      logger.warn(`[LegacyController] IDOR attempt: User ${userId} tried to claim reward for character ${characterId} owned by ${character.userId}`);
      res.status(403).json({
        error: 'Unauthorized',
        message: 'You do not own this character',
      });
      return;
    }

    const result = await legacyService.claimReward({
      rewardId,
      characterId,
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error('[LegacyController] Error claiming reward:', error);
    res.status(400).json({
      error: 'Failed to claim reward',
      message: sanitizeErrorMessage(error),
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
    logger.error('[LegacyController] Error fetching available rewards:', error);
    res.status(500).json({
      error: 'Failed to fetch available rewards',
      message: sanitizeErrorMessage(error),
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
    logger.error('[LegacyController] Error fetching lifetime stats:', error);
    res.status(500).json({
      error: 'Failed to fetch lifetime stats',
      message: sanitizeErrorMessage(error),
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
    logger.error('[LegacyController] Error fetching character contributions:', error);
    res.status(500).json({
      error: 'Failed to fetch character contributions',
      message: sanitizeErrorMessage(error),
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
    logger.error('[LegacyController] Error updating stat:', error);
    res.status(500).json({
      error: 'Failed to update stat',
      message: sanitizeErrorMessage(error),
    });
  }
};
