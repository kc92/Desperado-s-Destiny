/**
 * Bounty Hunting Routes
 * API endpoints for the bounty hunting system
 *
 * Sprint 7: Mid-Game Content - Bounty Hunting (L20 unlock)
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireCharacterOwnership } from '../middleware/characterOwnership.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { activityRateLimiter } from '../middleware/rateLimiter';
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
 * Protected: User must own this character
 */
router.get('/available/:characterId', requireCharacterOwnership, getAvailableBounties);

/**
 * POST /api/bounty-hunting/accept
 * Accept a bounty and start hunting
 * Body: { characterId: string, targetId: string }
 */
router.post('/accept', requireCsrfToken, activityRateLimiter, acceptBounty);

/**
 * POST /api/bounty-hunting/track
 * Progress tracking on current bounty (costs energy)
 * Body: { characterId: string }
 */
router.post('/track', requireCsrfToken, activityRateLimiter, progressTracking);

/**
 * POST /api/bounty-hunting/confront
 * Confront the bounty target
 * Body: { characterId: string, method: 'fight' | 'negotiate' | 'ambush' }
 */
router.post('/confront', requireCsrfToken, activityRateLimiter, confrontTarget);

/**
 * POST /api/bounty-hunting/abandon
 * Abandon current bounty hunt
 * Body: { characterId: string }
 */
router.post('/abandon', requireCsrfToken, activityRateLimiter, abandonHunt);

/**
 * GET /api/bounty-hunting/history/:characterId
 * Get bounty hunting history
 * Query: limit (optional, default 20)
 * Protected: User must own this character
 */
router.get('/history/:characterId', requireCharacterOwnership, getHuntHistory);

/**
 * GET /api/bounty-hunting/stats/:characterId
 * Get bounty hunting statistics
 * Protected: User must own this character
 */
router.get('/stats/:characterId', requireCharacterOwnership, getStatistics);

export default router;
