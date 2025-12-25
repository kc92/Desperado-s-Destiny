/**
 * Achievement Controller
 * HTTP layer for achievement endpoints
 *
 * Phase 1.3: Refactored to use AchievementService for all business logic
 * Controller is now a thin HTTP layer following separation of concerns
 */

import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { AchievementService } from '../services/achievement.service';
import logger from '../utils/logger';

/**
 * Get all achievements for the current character
 * GET /api/achievements
 */
export const getAchievements = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const data = await AchievementService.getAchievements(characterId);

    res.json({
      success: true,
      data,
    });
  }
);

/**
 * Get achievement progress summary
 * GET /api/achievements/summary
 */
export const getAchievementSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const summary = await AchievementService.getSummary(characterId);

    res.json({
      success: true,
      data: summary,
    });
  }
);

/**
 * Get unclaimed completed achievements
 * GET /api/achievements/unclaimed
 */
export const getUnclaimedAchievements = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const data = await AchievementService.getUnclaimed(characterId);

    res.json({
      success: true,
      data,
    });
  }
);

/**
 * Claim achievement reward
 * POST /api/achievements/:achievementId/claim
 */
export const claimAchievementReward = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;
    const { achievementId } = req.params;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    try {
      const result = await AchievementService.claimReward(characterId, achievementId);

      res.json({
        success: true,
        data: result,
        message: `Claimed ${result.achievement.title} rewards!`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message === 'Achievement not found') {
        res.status(404).json({ success: false, error: message });
      } else if (message === 'Achievement not completed' || message === 'Achievement rewards already claimed') {
        res.status(400).json({ success: false, error: message });
      } else {
        throw error;
      }
    }
  }
);

/**
 * Claim all unclaimed achievement rewards
 * POST /api/achievements/claim-all
 */
export const claimAllAchievementRewards = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.characterId;

    if (!characterId) {
      res.status(400).json({ success: false, error: 'No character selected' });
      return;
    }

    const result = await AchievementService.claimAllRewards(characterId);

    const claimedCount = result.dollarsAwarded > 0 || result.experienceAwarded > 0 || result.itemsAwarded.length > 0
      ? 'multiple'
      : 0;

    res.json({
      success: true,
      data: {
        claimed: claimedCount,
        rewards: {
          gold: result.dollarsAwarded,
          experience: result.experienceAwarded,
          items: result.itemsAwarded,
        },
      },
      message: claimedCount === 0 ? 'No achievements to claim' : 'Claimed achievement rewards!',
    });
  }
);

/**
 * Update achievement progress (internal use)
 * Called by other services/controllers when actions complete
 *
 * @deprecated Use AchievementService.incrementProgress() directly
 * Kept for backwards compatibility with existing code
 */
export async function updateAchievementProgress(
  characterId: string,
  achievementType: string,
  progressIncrement: number = 1
): Promise<void> {
  await AchievementService.incrementProgress(characterId, achievementType, progressIncrement);
}

/**
 * Set achievement progress to a specific value (for economy tracking)
 *
 * @deprecated Use AchievementService.setProgress() directly
 * Kept for backwards compatibility with existing code
 */
export async function setAchievementProgress(
  characterId: string,
  achievementType: string,
  progress: number
): Promise<void> {
  await AchievementService.setProgress(characterId, achievementType, progress);
}

export default {
  getAchievements,
  getAchievementSummary,
  getUnclaimedAchievements,
  claimAchievementReward,
  claimAllAchievementRewards,
  updateAchievementProgress,
  setAchievementProgress,
};
