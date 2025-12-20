/**
 * Tutorial Controller
 * Handles tutorial-related API requests including reward distribution
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CharacterProgressionService } from '../services/characterProgression.service';
import { TransactionSource } from '../models/GoldTransaction.model';
import { Character } from '../models/Character.model';
import logger from '../utils/logger';

/**
 * Valid tutorial step IDs that can receive rewards
 * This prevents abuse by only allowing specific steps to claim rewards
 */
const VALID_REWARD_STEPS = new Set([
  // Settler intro
  'settler-1', 'settler-2', 'settler-3',
  // Nahi intro
  'nahi-1', 'nahi-2', 'nahi-3',
  // Frontera intro
  'frontera-1', 'frontera-2', 'frontera-3',
  // Combat basics
  'combat-1', 'combat-2', 'combat-3', 'combat-4',
  // Economy basics
  'eco-1', 'eco-2', 'eco-3', 'eco-4', 'eco-5',
  // Progression system
  'prog-1', 'prog-2', 'prog-3', 'prog-4',
  // Tutorial completion bonus
  'tutorial-complete',
]);

/**
 * Predefined rewards for tutorial steps
 * These are server-authoritative to prevent client manipulation
 */
const STEP_REWARDS: Record<string, { gold?: number; xp?: number; items?: Array<{ itemId: string; quantity: number }> }> = {
  // Introduction rewards (small)
  'settler-3': { gold: 25, xp: 15 },
  'nahi-3': { gold: 25, xp: 15 },
  'frontera-3': { gold: 25, xp: 15 },

  // Combat rewards
  'combat-2': { xp: 10 }, // Destiny Deck explanation
  'combat-4': { gold: 50, xp: 25 }, // Victory loot

  // Economy rewards
  'eco-3': { xp: 15 }, // Mining
  'eco-5': { gold: 30, xp: 20 }, // Crafting ingot

  // Progression rewards
  'prog-3': { xp: 25 }, // Start training
  'prog-4': { gold: 100, xp: 50 }, // Tutorial farewell

  // Tutorial completion bonus
  'tutorial-complete': { gold: 200, xp: 100 },
};

/**
 * POST /api/tutorial/claim-reward
 * Claim rewards for completing a tutorial step
 *
 * Body: { stepId: string }
 *
 * Returns the rewards granted and updated character state
 */
export async function claimStepReward(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { stepId, characterId } = req.body;

    // Validate input
    if (!stepId || typeof stepId !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Missing or invalid stepId',
      });
      return;
    }

    if (!characterId || typeof characterId !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Missing or invalid characterId',
      });
      return;
    }

    // Validate step ID is allowed
    if (!VALID_REWARD_STEPS.has(stepId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid tutorial step',
      });
      return;
    }

    // Verify character ownership
    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found',
      });
      return;
    }

    if (character.userId.toString() !== userId) {
      res.status(403).json({
        success: false,
        error: 'You do not own this character',
      });
      return;
    }

    // Check if step has already been claimed (stored on character)
    const claimedSteps = character.tutorialRewardsClaimed || [];
    if (claimedSteps.includes(stepId)) {
      res.status(400).json({
        success: false,
        error: 'Reward already claimed for this step',
        data: { alreadyClaimed: true },
      });
      return;
    }

    // Get rewards for this step
    const rewards = STEP_REWARDS[stepId];
    if (!rewards) {
      // Step exists but has no rewards - just mark as completed
      await Character.findByIdAndUpdate(characterId, {
        $addToSet: { tutorialRewardsClaimed: stepId },
      });

      res.status(200).json({
        success: true,
        data: {
          stepId,
          rewards: { gold: 0, xp: 0, items: [] },
          message: 'Step completed (no rewards for this step)',
        },
      });
      return;
    }

    // Award rewards using CharacterProgressionService
    const result = await CharacterProgressionService.awardRewards(
      characterId,
      {
        gold: rewards.gold,
        xp: rewards.xp,
        items: rewards.items,
      },
      TransactionSource.TUTORIAL_REWARD
    );

    // Mark step as claimed
    await Character.findByIdAndUpdate(characterId, {
      $addToSet: { tutorialRewardsClaimed: stepId },
    });

    logger.info(
      `Tutorial reward claimed: ${stepId} for character ${character.name} - ${result.goldAwarded} gold, ${result.xpAwarded} XP`
    );

    // Get updated character
    const updatedCharacter = await Character.findById(characterId);

    res.status(200).json({
      success: true,
      data: {
        stepId,
        rewards: {
          gold: result.goldAwarded,
          xp: result.xpAwarded,
          items: result.itemsAwarded,
          leveledUp: result.leveledUp,
          newLevel: result.newLevel,
        },
        character: updatedCharacter ? {
          gold: updatedCharacter.gold,
          experience: updatedCharacter.experience,
          level: updatedCharacter.level,
        } : null,
      },
    });
  } catch (error) {
    logger.error('Error claiming tutorial reward:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to claim reward',
    });
  }
}

/**
 * GET /api/tutorial/progress/:characterId
 * Get tutorial progress for a character
 *
 * Returns which steps have been claimed
 */
export async function getProgress(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { characterId } = req.params;

    // Verify character ownership
    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({
        success: false,
        error: 'Character not found',
      });
      return;
    }

    if (character.userId.toString() !== userId) {
      res.status(403).json({
        success: false,
        error: 'You do not own this character',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        claimedSteps: character.tutorialRewardsClaimed || [],
        availableRewards: Object.entries(STEP_REWARDS)
          .filter(([stepId]) => !(character.tutorialRewardsClaimed || []).includes(stepId))
          .map(([stepId, rewards]) => ({ stepId, ...rewards })),
      },
    });
  } catch (error) {
    logger.error('Error getting tutorial progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get tutorial progress',
    });
  }
}

/**
 * POST /api/tutorial/analytics
 * Track tutorial analytics (skip, completion)
 *
 * Body: { event: 'skip' | 'complete', data: object }
 */
export async function trackAnalytics(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { event, data, characterId } = req.body;

    if (!event || !['skip', 'complete', 'section_complete'].includes(event)) {
      res.status(400).json({
        success: false,
        error: 'Invalid event type',
      });
      return;
    }

    // Log analytics (in production, send to analytics service)
    logger.info(`Tutorial analytics: ${event}`, {
      userId,
      characterId,
      event,
      data,
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      data: { recorded: true },
    });
  } catch (error) {
    logger.error('Error tracking tutorial analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track analytics',
    });
  }
}
