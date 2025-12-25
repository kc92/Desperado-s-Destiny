/**
 * Tutorial Routes
 * API routes for the tutorial reward and analytics system
 *
 * Phase 16: Enhanced with Hawk mentorship system routes
 */

import express from 'express';
import {
  // Legacy endpoints
  claimStepReward,
  getProgress,
  trackAnalytics,
  // Phase 16 endpoints
  getTutorialStatus,
  initializeTutorial,
  advanceStep,
  completePhase,
  skipTutorial,
  getHawkDialogue,
  interactWithHawk,
  getContextualTip,
  markTipShown,
  getMilestones,
  completeGraduation,
  resumeTutorial
} from '../controllers/tutorial.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = express.Router();

// ============================================================================
// LEGACY ENDPOINTS (maintained for backward compatibility)
// ============================================================================

/**
 * POST /api/tutorial/claim-reward
 * Claim rewards for completing a tutorial step
 * Body: { stepId: string, characterId: string }
 */
router.post('/claim-reward', requireAuth, requireCsrfToken, asyncHandler(claimStepReward));

/**
 * GET /api/tutorial/progress/:characterId
 * Get tutorial progress for a character
 * Returns: { claimedSteps: string[], availableRewards: object[] }
 */
router.get('/progress/:characterId', requireAuth, asyncHandler(getProgress));

/**
 * POST /api/tutorial/analytics
 * Track tutorial analytics (skip, completion)
 * Body: { event: 'skip' | 'complete' | 'section_complete', data: object, characterId: string }
 */
router.post('/analytics', requireAuth, requireCsrfToken, asyncHandler(trackAnalytics));

// ============================================================================
// PHASE 16: HAWK MENTORSHIP SYSTEM ENDPOINTS
// ============================================================================

/**
 * GET /api/tutorial/status/:characterId
 * Get complete tutorial status including Hawk companion state
 */
router.get('/status/:characterId', requireAuth, asyncHandler(getTutorialStatus));

/**
 * POST /api/tutorial/initialize
 * Initialize tutorial for a new character
 * Body: { characterId: string }
 */
router.post('/initialize', requireAuth, requireCsrfToken, asyncHandler(initializeTutorial));

/**
 * POST /api/tutorial/advance
 * Advance to next step within current phase
 * Body: { characterId: string, objectiveCompleted?: string }
 */
router.post('/advance', requireAuth, requireCsrfToken, asyncHandler(advanceStep));

/**
 * POST /api/tutorial/complete-phase
 * Complete current phase and transition to next
 * Body: { characterId: string }
 */
router.post('/complete-phase', requireAuth, requireCsrfToken, asyncHandler(completePhase));

/**
 * POST /api/tutorial/skip
 * Skip tutorial entirely
 * Body: { characterId: string, reason?: 'user_request' | 'overlevel' | 'returning_player' }
 */
router.post('/skip', requireAuth, requireCsrfToken, asyncHandler(skipTutorial));

/**
 * POST /api/tutorial/resume
 * Resume tutorial after disconnect/break
 * Body: { characterId: string }
 */
router.post('/resume', requireAuth, requireCsrfToken, asyncHandler(resumeTutorial));

// ============================================================================
// HAWK DIALOGUE ENDPOINTS
// ============================================================================

/**
 * GET /api/tutorial/hawk/dialogue/:characterId
 * Get contextual Hawk dialogue
 * Query: { trigger?: DialogueTrigger, context?: JSON string }
 */
router.get('/hawk/dialogue/:characterId', requireAuth, asyncHandler(getHawkDialogue));

/**
 * POST /api/tutorial/hawk/interact
 * Record player interaction with Hawk
 * Body: { characterId: string, topic?: HawkTopic }
 */
router.post('/hawk/interact', requireAuth, requireCsrfToken, asyncHandler(interactWithHawk));

/**
 * GET /api/tutorial/hawk/tip/:characterId
 * Get contextual tip based on game state
 */
router.get('/hawk/tip/:characterId', requireAuth, asyncHandler(getContextualTip));

/**
 * POST /api/tutorial/hawk/tip/:tipId/shown
 * Mark a tip as shown
 * Body: { characterId: string }
 */
router.post('/hawk/tip/:tipId/shown', requireAuth, requireCsrfToken, asyncHandler(markTipShown));

// ============================================================================
// MILESTONE ENDPOINTS
// ============================================================================

/**
 * GET /api/tutorial/milestones/:characterId
 * Get player's tutorial milestones
 */
router.get('/milestones/:characterId', requireAuth, asyncHandler(getMilestones));

/**
 * POST /api/tutorial/graduation/complete
 * Complete graduation ceremony
 * Body: { characterId: string }
 */
router.post('/graduation/complete', requireAuth, requireCsrfToken, asyncHandler(completeGraduation));

export default router;
