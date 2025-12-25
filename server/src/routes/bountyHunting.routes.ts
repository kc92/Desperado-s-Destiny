/**
 * Bounty Hunting Routes
 * API endpoints for the bounty hunting system
 *
 * Sprint 7: Mid-Game Content - Bounty Hunting (L20 unlock)
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getAvailableBounties,
  acceptBounty,
  progressTracking,
  confrontTarget,
  abandonHunt,
  getHuntHistory,
  getStatistics
} from '../controllers/bountyHunting.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/bounty-hunting/available/:characterId
 * Get available bounties and current hunt status
 */
router.get('/available/:characterId', getAvailableBounties);

/**
 * POST /api/bounty-hunting/accept
 * Accept a bounty and start hunting
 * Body: { characterId: string, targetId: string }
 */
router.post('/accept', acceptBounty);

/**
 * POST /api/bounty-hunting/track
 * Progress tracking on current bounty (costs energy)
 * Body: { characterId: string }
 */
router.post('/track', progressTracking);

/**
 * POST /api/bounty-hunting/confront
 * Confront the bounty target
 * Body: { characterId: string, method: 'fight' | 'negotiate' | 'ambush' }
 */
router.post('/confront', confrontTarget);

/**
 * POST /api/bounty-hunting/abandon
 * Abandon current bounty hunt
 * Body: { characterId: string }
 */
router.post('/abandon', abandonHunt);

/**
 * GET /api/bounty-hunting/history/:characterId
 * Get bounty hunting history
 * Query: limit (optional, default 20)
 */
router.get('/history/:characterId', getHuntHistory);

/**
 * GET /api/bounty-hunting/stats/:characterId
 * Get bounty hunting statistics
 */
router.get('/stats/:characterId', getStatistics);

export default router;
