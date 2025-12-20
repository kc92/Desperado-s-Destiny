/**
 * Mood Routes
 *
 * API routes for NPC mood system
 */

import { Router } from 'express';
import {
  getNPCMood,
  getLocationMoods,
  applyMoodFactor,
  triggerEventMood,
  applyPlayerAction,
  updateAllMoods,
  decayMoodFactors,
  getMoodDescription,
} from '../controllers/mood.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

/**
 * Public routes (read-only)
 */
router.get('/npc/:npcId', asyncHandler(getNPCMood));
router.get('/location/:locationId', asyncHandler(getLocationMoods));
router.get('/description/:npcId', asyncHandler(getMoodDescription));

/**
 * Protected routes (require authentication)
 */
router.use(requireAuth);

router.post('/apply', requireCsrfToken, asyncHandler(applyMoodFactor));
router.post('/event', requireCsrfToken, asyncHandler(triggerEventMood));
router.post('/player-action', requireCsrfToken, asyncHandler(applyPlayerAction));
router.post('/update-all', requireCsrfToken, asyncHandler(updateAllMoods));
router.post('/decay', requireCsrfToken, asyncHandler(decayMoodFactors));

export default router;
