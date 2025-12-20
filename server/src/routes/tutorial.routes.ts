/**
 * Tutorial Routes
 * API routes for the tutorial reward and analytics system
 */

import express from 'express';
import { claimStepReward, getProgress, trackAnalytics } from '../controllers/tutorial.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = express.Router();

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

export default router;
