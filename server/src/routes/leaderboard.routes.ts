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

const router = Router();

/**
 * GET /api/leaderboard/level
 * Get level leaderboard
 * Query params: range (all|monthly|weekly|daily), limit
 */
router.get('/level', asyncHandler(getLevelLeaderboard));

/**
 * GET /api/leaderboard/gold
 * Get gold/wealth leaderboard
 * Query params: range, limit
 */
router.get('/gold', asyncHandler(getGoldLeaderboard));

/**
 * GET /api/leaderboard/reputation
 * Get reputation leaderboard
 * Query params: range, limit
 */
router.get('/reputation', asyncHandler(getReputationLeaderboard));

/**
 * GET /api/leaderboard/combat
 * Get combat wins leaderboard
 * Query params: range, limit
 */
router.get('/combat', asyncHandler(getCombatLeaderboard));

/**
 * GET /api/leaderboard/bounties
 * Get bounties/wanted leaderboard
 * Query params: range, limit
 */
router.get('/bounties', asyncHandler(getBountiesLeaderboard));

/**
 * GET /api/leaderboard/gangs
 * Get gangs leaderboard
 * Query params: range, limit
 */
router.get('/gangs', asyncHandler(getGangsLeaderboard));

export default router;
