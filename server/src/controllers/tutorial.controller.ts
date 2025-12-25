/**
 * Tutorial Controller
 * Handles tutorial-related API requests including reward distribution
 *
 * Phase 16: Enhanced with Hawk mentorship system, state machine, and graduation
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CharacterProgressionService } from '../services/characterProgression.service';
import { TransactionSource } from '../models/GoldTransaction.model';
import { Character } from '../models/Character.model';
import { TutorialStateService, ITutorialSummary } from '../services/tutorialState.service';
import { HawkDialogueService, IHawkDialogueRequest, ITipContext } from '../services/hawkDialogue.service';
import { TutorialMilestoneService } from '../services/tutorialMilestone.service';
import { TutorialPhase, PHASE_DISPLAY_NAMES } from '../models/TutorialProgress.model';
import { HawkExpression } from '../models/HawkCompanion.model';
import { DialogueTrigger } from '../data/hawkDialogue';
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
  // Energy system teaching (Sprint 6 addition)
  'energy-1', 'energy-2', 'energy-3',
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

  // Energy system teaching (Sprint 6 addition)
  // Teaches players about energy costs, regeneration, and management
  'energy-1': { xp: 10 }, // Energy bar explanation
  'energy-2': { xp: 15 }, // Wait for energy (simulated regen moment)
  'energy-3': { xp: 20, items: [{ itemId: 'coffee', quantity: 3 }] }, // Given regular coffee as practice

  // Progression rewards
  'prog-3': { xp: 25 }, // Start training
  'prog-4': { gold: 100, xp: 50 }, // Tutorial farewell

  // Tutorial completion bonus - includes Traveler's Coffee for energy refill!
  'tutorial-complete': {
    gold: 200,
    xp: 100,
    items: [
      { itemId: 'travelers-coffee', quantity: 2 }, // Full energy restore x2
      { itemId: 'bandages', quantity: 5 },         // Health restore starter
    ]
  },
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

// ============================================================================
// PHASE 16: NEW HAWK MENTORSHIP ENDPOINTS
// ============================================================================

/**
 * GET /api/tutorial/status/:characterId
 * Get complete tutorial status including Hawk companion state
 */
export async function getTutorialStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.params;

    // Verify character ownership
    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({ success: false, error: 'Character not found' });
      return;
    }

    if (character.userId.toString() !== userId) {
      res.status(403).json({ success: false, error: 'You do not own this character' });
      return;
    }

    // Get tutorial summary
    const summary = await TutorialStateService.getTutorialSummary(characterId);

    // Check for auto-skip (overlevel)
    const autoSkipped = await TutorialStateService.checkAutoSkip(characterId);
    if (autoSkipped) {
      // Refresh summary after auto-skip
      const updatedSummary = await TutorialStateService.getTutorialSummary(characterId);
      res.status(200).json({
        success: true,
        data: {
          ...updatedSummary,
          autoSkipped: true,
          message: 'Tutorial auto-skipped due to character level'
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    logger.error('Error getting tutorial status:', error);
    res.status(500).json({ success: false, error: 'Failed to get tutorial status' });
  }
}

/**
 * POST /api/tutorial/initialize
 * Initialize tutorial for a new character
 */
export async function initializeTutorial(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.body;

    // Verify character ownership
    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({ success: false, error: 'Character not found' });
      return;
    }

    if (character.userId.toString() !== userId) {
      res.status(403).json({ success: false, error: 'You do not own this character' });
      return;
    }

    // Initialize tutorial
    const progress = await TutorialStateService.initializeTutorial(characterId);

    // Get intro dialogue
    const dialogue = await HawkDialogueService.triggerDialogue(
      characterId,
      DialogueTrigger.PHASE_START,
      { phase: TutorialPhase.AWAKENING }
    );

    res.status(200).json({
      success: true,
      data: {
        phase: progress.currentPhase,
        step: progress.currentStep,
        phaseName: PHASE_DISPLAY_NAMES[progress.currentPhase],
        hawkDialogue: dialogue
      }
    });
  } catch (error) {
    logger.error('Error initializing tutorial:', error);
    res.status(500).json({ success: false, error: 'Failed to initialize tutorial' });
  }
}

/**
 * POST /api/tutorial/advance
 * Advance to next step within current phase
 */
export async function advanceStep(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, objectiveCompleted } = req.body;

    // Verify character ownership
    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({ success: false, error: 'Character not found' });
      return;
    }

    if (character.userId.toString() !== userId) {
      res.status(403).json({ success: false, error: 'You do not own this character' });
      return;
    }

    // Advance step
    const result = await TutorialStateService.advanceStep(characterId, objectiveCompleted);

    res.status(200).json({
      success: true,
      data: {
        newStep: result.newStep,
        phaseComplete: result.phaseComplete,
        hawkDialogue: result.hawkDialogue
      }
    });
  } catch (error) {
    logger.error('Error advancing tutorial step:', error);
    res.status(500).json({ success: false, error: 'Failed to advance step' });
  }
}

/**
 * POST /api/tutorial/complete-phase
 * Complete current phase and transition to next
 */
export async function completePhase(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.body;

    // Verify character ownership
    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({ success: false, error: 'Character not found' });
      return;
    }

    if (character.userId.toString() !== userId) {
      res.status(403).json({ success: false, error: 'You do not own this character' });
      return;
    }

    // Complete phase
    const result = await TutorialStateService.completePhase(characterId);

    // Award milestone if exists
    let milestoneResult = null;
    if (result.milestone) {
      milestoneResult = await TutorialMilestoneService.awardMilestone(
        characterId,
        result.milestone
      );
    }

    res.status(200).json({
      success: true,
      data: {
        previousPhase: result.previousPhase,
        newPhase: result.newPhase,
        newPhaseName: PHASE_DISPLAY_NAMES[result.newPhase],
        milestone: milestoneResult,
        hawkDialogue: result.hawkDialogue,
        isGraduation: result.isGraduation
      }
    });
  } catch (error) {
    logger.error('Error completing tutorial phase:', error);
    res.status(500).json({ success: false, error: 'Failed to complete phase' });
  }
}

/**
 * POST /api/tutorial/skip
 * Skip tutorial entirely
 */
export async function skipTutorial(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, reason = 'user_request' } = req.body;

    // Verify character ownership
    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({ success: false, error: 'Character not found' });
      return;
    }

    if (character.userId.toString() !== userId) {
      res.status(403).json({ success: false, error: 'You do not own this character' });
      return;
    }

    // Skip tutorial
    await TutorialStateService.skipTutorial(characterId, reason);

    res.status(200).json({
      success: true,
      data: {
        skipped: true,
        reason,
        message: 'Tutorial skipped. You can always find Hawk in the saloon for tips.'
      }
    });
  } catch (error) {
    logger.error('Error skipping tutorial:', error);
    res.status(500).json({ success: false, error: 'Failed to skip tutorial' });
  }
}

/**
 * GET /api/tutorial/hawk/dialogue/:characterId
 * Get contextual Hawk dialogue
 */
export async function getHawkDialogue(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.params;
    const { trigger, context } = req.query;

    // Verify character ownership
    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({ success: false, error: 'Character not found' });
      return;
    }

    if (character.userId.toString() !== userId) {
      res.status(403).json({ success: false, error: 'You do not own this character' });
      return;
    }

    // Parse context if provided
    let parsedContext;
    if (context && typeof context === 'string') {
      try {
        parsedContext = JSON.parse(context);
      } catch {
        parsedContext = undefined;
      }
    }

    // Get dialogue
    const dialogue = await HawkDialogueService.getDialogue(
      characterId,
      {
        trigger: (trigger as DialogueTrigger) || DialogueTrigger.IDLE,
        context: parsedContext
      }
    );

    if (!dialogue) {
      res.status(200).json({
        success: true,
        data: null,
        message: 'No dialogue available for this context'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: dialogue
    });
  } catch (error) {
    logger.error('Error getting Hawk dialogue:', error);
    res.status(500).json({ success: false, error: 'Failed to get dialogue' });
  }
}

/**
 * POST /api/tutorial/hawk/interact
 * Record player interaction with Hawk
 */
export async function interactWithHawk(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId, topic } = req.body;

    // Verify character ownership
    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({ success: false, error: 'Character not found' });
      return;
    }

    if (character.userId.toString() !== userId) {
      res.status(403).json({ success: false, error: 'You do not own this character' });
      return;
    }

    // Record topic interest if provided
    if (topic) {
      await HawkDialogueService.recordTopicInterest(characterId, topic);
    }

    // Get contextual response
    const dialogue = await HawkDialogueService.triggerDialogue(
      characterId,
      DialogueTrigger.FIRST_TIME
    );

    res.status(200).json({
      success: true,
      data: {
        dialogue,
        topic: topic || null
      }
    });
  } catch (error) {
    logger.error('Error interacting with Hawk:', error);
    res.status(500).json({ success: false, error: 'Failed to interact with Hawk' });
  }
}

/**
 * GET /api/tutorial/hawk/tip/:characterId
 * Get contextual tip based on game state
 */
export async function getContextualTip(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.params;

    // Verify character ownership
    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({ success: false, error: 'Character not found' });
      return;
    }

    if (character.userId.toString() !== userId) {
      res.status(403).json({ success: false, error: 'You do not own this character' });
      return;
    }

    // Build context from character state
    const context: ITipContext = {
      energy: character.energy,
      maxEnergy: character.maxEnergy,
      wantedLevel: character.wantedLevel,
      inventoryFull: (character.inventory?.length || 0) >= 50 // Assuming 50 is max
    };

    // Get contextual tip
    const tip = await HawkDialogueService.getContextualTip(characterId, context);

    res.status(200).json({
      success: true,
      data: tip
    });
  } catch (error) {
    logger.error('Error getting contextual tip:', error);
    res.status(500).json({ success: false, error: 'Failed to get tip' });
  }
}

/**
 * POST /api/tutorial/hawk/tip/:tipId/shown
 * Mark a tip as shown
 */
export async function markTipShown(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { tipId } = req.params;
    const { characterId } = req.body;

    // Verify character ownership
    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({ success: false, error: 'Character not found' });
      return;
    }

    if (character.userId.toString() !== userId) {
      res.status(403).json({ success: false, error: 'You do not own this character' });
      return;
    }

    // Mark tip as shown
    await HawkDialogueService.markTipShown(characterId, tipId);

    res.status(200).json({
      success: true,
      data: { tipId, marked: true }
    });
  } catch (error) {
    logger.error('Error marking tip shown:', error);
    res.status(500).json({ success: false, error: 'Failed to mark tip' });
  }
}

/**
 * GET /api/tutorial/milestones/:characterId
 * Get player's tutorial milestones
 */
export async function getMilestones(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.params;

    // Verify character ownership
    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({ success: false, error: 'Character not found' });
      return;
    }

    if (character.userId.toString() !== userId) {
      res.status(403).json({ success: false, error: 'You do not own this character' });
      return;
    }

    // Get milestones
    const milestones = await TutorialMilestoneService.getCharacterMilestones(characterId);

    res.status(200).json({
      success: true,
      data: milestones
    });
  } catch (error) {
    logger.error('Error getting milestones:', error);
    res.status(500).json({ success: false, error: 'Failed to get milestones' });
  }
}

/**
 * POST /api/tutorial/graduation/complete
 * Complete graduation ceremony
 */
export async function completeGraduation(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.body;

    // Verify character ownership
    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({ success: false, error: 'Character not found' });
      return;
    }

    if (character.userId.toString() !== userId) {
      res.status(403).json({ success: false, error: 'You do not own this character' });
      return;
    }

    // Check if in graduation phase
    const currentPhase = await TutorialStateService.getCurrentPhase(characterId);
    if (currentPhase !== TutorialPhase.GRADUATION && currentPhase !== TutorialPhase.COMPLETED) {
      res.status(400).json({
        success: false,
        error: 'Character not at graduation phase'
      });
      return;
    }

    // Award graduation rewards
    const rewards = await TutorialMilestoneService.awardGraduationRewards(characterId);

    // Complete the phase if not already
    if (currentPhase === TutorialPhase.GRADUATION) {
      await TutorialStateService.completePhase(characterId);
    }

    res.status(200).json({
      success: true,
      data: {
        graduated: true,
        rewards,
        message: "Congratulations! You've completed Hawk's mentorship and are ready for the frontier."
      }
    });
  } catch (error) {
    logger.error('Error completing graduation:', error);
    res.status(500).json({ success: false, error: 'Failed to complete graduation' });
  }
}

/**
 * POST /api/tutorial/resume
 * Resume tutorial after disconnect/break
 */
export async function resumeTutorial(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { characterId } = req.body;

    // Verify character ownership
    const character = await Character.findById(characterId);
    if (!character) {
      res.status(404).json({ success: false, error: 'Character not found' });
      return;
    }

    if (character.userId.toString() !== userId) {
      res.status(403).json({ success: false, error: 'You do not own this character' });
      return;
    }

    // Resume tutorial
    const result = await TutorialStateService.resumeTutorial(characterId);

    res.status(200).json({
      success: true,
      data: {
        currentPhase: result.currentPhase,
        currentStep: result.currentStep,
        phaseName: PHASE_DISPLAY_NAMES[result.currentPhase],
        hawkDialogue: result.hawkDialogue
      }
    });
  } catch (error) {
    logger.error('Error resuming tutorial:', error);
    res.status(500).json({ success: false, error: 'Failed to resume tutorial' });
  }
}
