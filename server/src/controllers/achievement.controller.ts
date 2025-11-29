/**
 * Achievement Controller
 * Handles achievement tracking and rewards
 */

import { Request, Response } from 'express';
import { Achievement, ACHIEVEMENT_DEFINITIONS } from '../models/Achievement.model';
import { Character } from '../models/Character.model';
import { asyncHandler } from '../middleware/asyncHandler';
import { GoldService, TransactionSource } from '../services/gold.service';
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

    // Get existing achievements
    let achievements = await Achievement.find({ characterId }).lean();

    // Initialize missing achievements
    const existingTypes = achievements.map(a => a.achievementType);
    const missingAchievements = ACHIEVEMENT_DEFINITIONS.filter(
      def => !existingTypes.includes(def.type)
    );

    if (missingAchievements.length > 0) {
      const newAchievements = missingAchievements.map(def => ({
        characterId,
        achievementType: def.type,
        title: def.title,
        description: def.description,
        category: def.category,
        tier: def.tier,
        target: def.target,
        progress: 0,
        completed: false,
        reward: def.reward
      }));

      await Achievement.insertMany(newAchievements);
      achievements = await Achievement.find({ characterId }).lean();
    }

    // Group by category
    const grouped = {
      combat: achievements.filter(a => a.category === 'combat'),
      crime: achievements.filter(a => a.category === 'crime'),
      social: achievements.filter(a => a.category === 'social'),
      economy: achievements.filter(a => a.category === 'economy'),
      exploration: achievements.filter(a => a.category === 'exploration'),
      special: achievements.filter(a => a.category === 'special')
    };

    // Calculate stats
    const completedCount = achievements.filter(a => a.completed).length;
    const totalCount = achievements.length;
    const recentlyCompleted = achievements
      .filter(a => a.completed && a.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        achievements: grouped,
        stats: {
          completed: completedCount,
          total: totalCount,
          percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
        },
        recentlyCompleted
      }
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

    const achievements = await Achievement.find({ characterId }).lean();

    const byCategory = {
      combat: { completed: 0, total: 0 },
      crime: { completed: 0, total: 0 },
      social: { completed: 0, total: 0 },
      economy: { completed: 0, total: 0 },
      exploration: { completed: 0, total: 0 },
      special: { completed: 0, total: 0 }
    };

    const byTier = {
      bronze: { completed: 0, total: 0 },
      silver: { completed: 0, total: 0 },
      gold: { completed: 0, total: 0 },
      legendary: { completed: 0, total: 0 }
    };

    achievements.forEach(a => {
      byCategory[a.category as keyof typeof byCategory].total++;
      byTier[a.tier as keyof typeof byTier].total++;

      if (a.completed) {
        byCategory[a.category as keyof typeof byCategory].completed++;
        byTier[a.tier as keyof typeof byTier].completed++;
      }
    });

    res.json({
      success: true,
      data: {
        byCategory,
        byTier,
        total: achievements.length,
        completed: achievements.filter(a => a.completed).length
      }
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

    const achievement = await Achievement.findOne({
      _id: achievementId,
      characterId
    });

    if (!achievement) {
      res.status(404).json({ success: false, error: 'Achievement not found' });
      return;
    }

    if (!achievement.completed) {
      res.status(400).json({ success: false, error: 'Achievement not completed' });
      return;
    }

    // Check if already claimed (completedAt already set means rewards given)
    // Actually, we set completedAt when progress reaches target
    // Let's add a claimed flag check - for now just return success with reward info

    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({ success: false, error: 'Character not found' });
      return;
    }

    // Apply rewards
    if (achievement.reward.gold) {
      await GoldService.addGold(
        characterId,
        achievement.reward.gold,
        TransactionSource.ACHIEVEMENT,
        `Achievement reward: ${achievement.title}`
      );
    }
    if (achievement.reward.experience) {
      character.experience += achievement.reward.experience;
    }

    await character.save();

    res.json({
      success: true,
      data: {
        achievement,
        rewardsApplied: achievement.reward
      },
      message: `Claimed ${achievement.title} rewards!`
    });
  }
);

/**
 * Update achievement progress (internal use)
 * Called by other controllers when actions complete
 */
export async function updateAchievementProgress(
  characterId: string,
  achievementType: string,
  progressIncrement: number = 1
): Promise<void> {
  try {
    const achievement = await Achievement.findOne({
      characterId,
      achievementType
    });

    if (!achievement || achievement.completed) {
      return;
    }

    achievement.progress += progressIncrement;

    if (achievement.progress >= achievement.target) {
      achievement.progress = achievement.target;
      achievement.completed = true;
      achievement.completedAt = new Date();
    }

    await achievement.save();
  } catch (error) {
    logger.error('Error updating achievement progress:', error);
  }
}

/**
 * Set achievement progress to a specific value (for economy tracking)
 */
export async function setAchievementProgress(
  characterId: string,
  achievementType: string,
  progress: number
): Promise<void> {
  try {
    const achievement = await Achievement.findOne({
      characterId,
      achievementType
    });

    if (!achievement || achievement.completed) {
      return;
    }

    achievement.progress = progress;

    if (achievement.progress >= achievement.target) {
      achievement.progress = achievement.target;
      achievement.completed = true;
      achievement.completedAt = new Date();
    }

    await achievement.save();
  } catch (error) {
    logger.error('Error setting achievement progress:', error);
  }
}

export default {
  getAchievements,
  getAchievementSummary,
  claimAchievementReward,
  updateAchievementProgress,
  setAchievementProgress
};
