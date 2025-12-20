/**
 * Skill Routes
 *
 * API routes for skill training and progression
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacterOwnership } from '../middleware/characterOwnership.middleware';
import { preventActionsWhileJailed } from '../middleware/jail.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { skillTrainingRateLimiter } from '../middleware/rateLimiter';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { validate, SkillSchemas } from '../validation';
import {
  getSkills,
  startTraining,
  cancelTraining,
  completeTraining,
  getSuitBonuses
} from '../controllers/skill.controller';

const router = Router();

/**
 * Skill Routes
 * All routes require authentication and character ownership
 * Character ID is passed as a query parameter: ?characterId=xxx
 *
 * Rate limited to 10 requests per minute per user to prevent abuse
 */

// Get all skills and character's skill progress
router.get('/', requireAuth, requireCharacterOwnership, skillTrainingRateLimiter, asyncHandler(getSkills));

// Get character's suit bonuses
router.get('/bonuses', requireAuth, requireCharacterOwnership, skillTrainingRateLimiter, asyncHandler(getSuitBonuses));

// Start training a skill (jail check applied, validation applied)
router.post(
  '/train',
  requireAuth,
  requireCsrfToken,
  requireCharacterOwnership,
  skillTrainingRateLimiter,
  validate(SkillSchemas.startTraining),
  preventActionsWhileJailed,
  asyncHandler(startTraining)
);

// Cancel current training
router.post('/cancel', requireAuth, requireCsrfToken, requireCharacterOwnership, skillTrainingRateLimiter, asyncHandler(cancelTraining));

// Complete current training
router.post('/complete', requireAuth, requireCsrfToken, requireCharacterOwnership, skillTrainingRateLimiter, asyncHandler(completeTraining));

export default router;
