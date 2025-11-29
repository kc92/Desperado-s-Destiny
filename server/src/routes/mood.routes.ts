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
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

/**
 * Public routes (read-only)
 */
router.get('/npc/:npcId', getNPCMood);
router.get('/location/:locationId', getLocationMoods);
router.get('/description/:npcId', getMoodDescription);

/**
 * Protected routes (require authentication)
 */
router.use(requireAuth);

router.post('/apply', applyMoodFactor);
router.post('/event', triggerEventMood);
router.post('/player-action', applyPlayerAction);
router.post('/update-all', updateAllMoods);
router.post('/decay', decayMoodFactors);

export default router;
