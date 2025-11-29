/**
 * Bounty Routes
 *
 * Endpoints for bounty/wanted system
 */

import { Router } from 'express';
import {
  getWantedLevel,
  getBountyBoard,
  getCharacterBounties,
  placeBounty,
  collectBounty,
  getMostWanted,
  checkBountyHunter,
  cancelBounties,
} from '../controllers/bounty.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

/**
 * All bounty routes require authentication
 */
router.use(requireAuth);

/**
 * GET /api/bounty/wanted
 * Get wanted level for current character
 */
router.get('/wanted', getWantedLevel);

/**
 * GET /api/bounty/board
 * Get bounty board (available bounties to hunt)
 * Query params: ?limit=50&location=red-gulch
 */
router.get('/board', getBountyBoard);

/**
 * GET /api/bounty/most-wanted
 * Get most wanted criminals leaderboard
 * Query params: ?limit=10
 */
router.get('/most-wanted', getMostWanted);

/**
 * GET /api/bounty/hunter-check
 * Check if bounty hunter should spawn for current character
 */
router.get('/hunter-check', checkBountyHunter);

/**
 * GET /api/bounty/:characterId
 * Get active bounties for a specific character
 */
router.get('/:characterId', getCharacterBounties);

/**
 * POST /api/bounty/place
 * Place a bounty on another player
 * Body: { targetId: string, amount: number, reason?: string }
 */
router.post('/place', placeBounty);

/**
 * POST /api/bounty/collect
 * Collect a bounty by bringing in the target
 * Body: { bountyId: string }
 */
router.post('/collect', collectBounty);

/**
 * DELETE /api/bounty/cancel/:characterId
 * Admin: Cancel all bounties for a character
 */
router.delete('/cancel/:characterId', cancelBounties);

export default router;
