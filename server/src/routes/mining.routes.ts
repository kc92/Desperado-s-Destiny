/**
 * Mining Routes
 * API endpoints for the mining claim system
 *
 * Sprint 7: Mid-Game Content - Mining Claims (L25 unlock)
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { requireCharacterOwnership } from '../middleware/characterOwnership.middleware';
import {
  getAvailableLocations,
  stakeClaim,
  collectYield,
  upgradeClaim,
  abandonClaim,
  contestClaim,
  getStatistics
} from '../controllers/mining.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/mining/locations/:characterId
 * Get available claim locations and owned claims
 * Protected: User must own this character
 */
router.get('/locations/:characterId', requireCharacterOwnership, getAvailableLocations);

/**
 * POST /api/mining/stake
 * Stake a new mining claim
 * Body: { characterId: string, claimId: string, useDeed?: boolean }
 */
router.post('/stake', requireCsrfToken, stakeClaim);

/**
 * POST /api/mining/collect
 * Collect yield from a mining claim
 * Body: { characterId: string, claimDocId: string }
 */
router.post('/collect', requireCsrfToken, collectYield);

/**
 * POST /api/mining/upgrade
 * Upgrade a mining claim to the next tier
 * Body: { characterId: string, claimDocId: string }
 */
router.post('/upgrade', requireCsrfToken, upgradeClaim);

/**
 * POST /api/mining/abandon
 * Abandon a mining claim
 * Body: { characterId: string, claimDocId: string }
 */
router.post('/abandon', requireCsrfToken, abandonClaim);

/**
 * POST /api/mining/contest
 * Contest another player's claim (PvP)
 * Body: { characterId: string, claimDocId: string }
 */
router.post('/contest', requireCsrfToken, contestClaim);

/**
 * GET /api/mining/stats/:characterId
 * Get mining statistics
 * Protected: User must own this character
 */
router.get('/stats/:characterId', requireCharacterOwnership, getStatistics);

export default router;
