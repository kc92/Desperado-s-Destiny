/**
 * Leaderboard Routes
 * Routes for viewing leaderboards
 */

import { Router } from 'express';
import {
  getLevelLeaderboard,
  getGoldLeaderboard,
  getReputationLeaderboard,
  getCombatLeaderboard,
  getBountiesLeaderboard,
  getGangsLeaderboard
} from '../controllers/leaderboard.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { authenticate } from '../middleware/auth.middleware';
import { apiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * GET /api/leaderboard/level
 * Get level leaderboard
 * Query params: range (all|monthly|weekly|daily), limit
 * Protected: Requires authentication
 */
router.get('/level', authenticate, apiRateLimiter, asyncHandler(getLevelLeaderboard));

/**
 * GET /api/leaderboard/gold
 * Get gold/wealth leaderboard
 * Query params: range, limit
 * Protected: Requires authentication
 */
router.get('/gold', authenticate, apiRateLimiter, asyncHandler(getGoldLeaderboard));

/**
 * GET /api/leaderboard/reputation
 * Get reputation leaderboard
 * Query params: range, limit
 * Protected: Requires authentication
 */
router.get('/reputation', authenticate, apiRateLimiter, asyncHandler(getReputationLeaderboard));

/**
 * GET /api/leaderboard/combat
 * Get combat wins leaderboard
 * Query params: range, limit
 * Protected: Requires authentication
 */
router.get('/combat', authenticate, apiRateLimiter, asyncHandler(getCombatLeaderboard));

/**
 * GET /api/leaderboard/bounties
 * Get bounties/wanted leaderboard
 * Query params: range, limit
 * Protected: Requires authentication
 */
router.get('/bounties', authenticate, apiRateLimiter, asyncHandler(getBountiesLeaderboard));

/**
 * GET /api/leaderboard/gangs
 * Get gangs leaderboard
 * Query params: range, limit
 * Protected: Requires authentication
 */
router.get('/gangs', authenticate, apiRateLimiter, asyncHandler(getGangsLeaderboard));

export default router;
