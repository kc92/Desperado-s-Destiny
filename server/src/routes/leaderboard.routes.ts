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

const router = Router();

/**
 * GET /api/leaderboard/level
 * Get level leaderboard
 * Query params: range (all|monthly|weekly|daily), limit
 */
router.get('/level', getLevelLeaderboard);

/**
 * GET /api/leaderboard/gold
 * Get gold/wealth leaderboard
 * Query params: range, limit
 */
router.get('/gold', getGoldLeaderboard);

/**
 * GET /api/leaderboard/reputation
 * Get reputation leaderboard
 * Query params: range, limit
 */
router.get('/reputation', getReputationLeaderboard);

/**
 * GET /api/leaderboard/combat
 * Get combat wins leaderboard
 * Query params: range, limit
 */
router.get('/combat', getCombatLeaderboard);

/**
 * GET /api/leaderboard/bounties
 * Get bounties/wanted leaderboard
 * Query params: range, limit
 */
router.get('/bounties', getBountiesLeaderboard);

/**
 * GET /api/leaderboard/gangs
 * Get gangs leaderboard
 * Query params: range, limit
 */
router.get('/gangs', getGangsLeaderboard);

export default router;
