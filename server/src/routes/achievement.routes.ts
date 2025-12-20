/**
 * Achievement Routes
 * Routes for viewing and claiming achievements
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  getAchievements,
  getAchievementSummary,
  claimAchievementReward
} from '../controllers/achievement.controller';

const router = Router();

// All achievement routes require authentication and character selection
router.use(requireAuth);
router.use(requireCharacter);

/**
 * GET /api/achievements
 * Get all achievements for current character
 */
router.get('/', asyncHandler(getAchievements));

/**
 * GET /api/achievements/summary
 * Get achievement progress summary
 */
router.get('/summary', asyncHandler(getAchievementSummary));

/**
 * POST /api/achievements/:achievementId/claim
 * Claim achievement reward
 */
router.post('/:achievementId/claim', requireCsrfToken, asyncHandler(claimAchievementReward));

export default router;
