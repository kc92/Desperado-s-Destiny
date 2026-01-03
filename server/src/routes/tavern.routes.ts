/**
 * Tavern Routes
 *
 * API routes for tavern social activities and buffs.
 * Part of the Tavern Rest & Social System.
 */

import { Router } from 'express';
import { TavernController } from '../controllers/tavern.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

/**
 * All tavern routes require authentication and character
 */
router.use(requireAuth);
router.use(requireCharacter);

/**
 * GET /api/tavern/activities
 * Get available tavern activities at current location
 */
router.get('/activities', asyncHandler(TavernController.getActivities));

/**
 * GET /api/tavern/buffs
 * Get active buffs for character
 */
router.get('/buffs', asyncHandler(TavernController.getBuffs));

/**
 * POST /api/tavern/activities/:activityId
 * Perform a tavern activity
 */
router.post('/activities/:activityId', requireCsrfToken, asyncHandler(TavernController.performActivity));

export default router;
