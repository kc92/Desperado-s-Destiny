/**
 * Skill Training Routes
 *
 * API routes for skill training activities
 * Part of Phase 19: Core Loop Overhaul
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacterOwnership } from '../middleware/characterOwnership.middleware';
import { preventActionsWhileJailed } from '../middleware/jail.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { skillTrainingRateLimiter } from '../middleware/rateLimiter';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import {
  getActivities,
  getActivitiesForSkill,
  getLevel1Activities,
  checkRequirements,
  performTraining,
  getCooldowns,
  getActivityStats
} from '../controllers/skillTraining.controller';

const router = Router();

/**
 * Skill Training Routes
 * Most routes require authentication and character ownership
 * Character ID is passed as a query parameter: ?characterId=xxx
 */

// Public: Get activity stats (no auth required)
router.get('/stats', asyncHandler(getActivityStats));

// Public: Get Level 1 activities (no auth required - for new player info)
router.get('/level1', asyncHandler(getLevel1Activities));

// Get all training activities available to character
router.get(
  '/activities',
  requireAuth,
  requireCharacterOwnership,
  skillTrainingRateLimiter,
  asyncHandler(getActivities)
);

// Get activities for a specific skill
router.get(
  '/activities/:skillId',
  requireAuth,
  requireCharacterOwnership,
  skillTrainingRateLimiter,
  asyncHandler(getActivitiesForSkill)
);

// Check requirements for a training activity
router.get(
  '/check/:activityId',
  requireAuth,
  requireCharacterOwnership,
  skillTrainingRateLimiter,
  asyncHandler(checkRequirements)
);

// Get all cooldowns for character
router.get(
  '/cooldowns',
  requireAuth,
  requireCharacterOwnership,
  skillTrainingRateLimiter,
  asyncHandler(getCooldowns)
);

// Perform a training activity (requires CSRF, jail check)
router.post(
  '/perform',
  requireAuth,
  requireCsrfToken,
  requireCharacterOwnership,
  skillTrainingRateLimiter,
  preventActionsWhileJailed,
  asyncHandler(performTraining)
);

export default router;
