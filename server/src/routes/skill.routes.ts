/**
 * Skill Routes
 *
 * API routes for skill training and progression
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacterOwnership } from '../middleware/characterOwnership.middleware';
import { preventActionsWhileJailed } from '../middleware/jail.middleware';
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
 */

// Get all skills and character's skill progress
router.get('/', requireAuth, requireCharacterOwnership, getSkills);

// Get character's suit bonuses
router.get('/bonuses', requireAuth, requireCharacterOwnership, getSuitBonuses);

// Start training a skill (jail check applied)
router.post('/train', requireAuth, requireCharacterOwnership, preventActionsWhileJailed, startTraining);

// Cancel current training
router.post('/cancel', requireAuth, requireCharacterOwnership, cancelTraining);

// Complete current training
router.post('/complete', requireAuth, requireCharacterOwnership, completeTraining);

export default router;
