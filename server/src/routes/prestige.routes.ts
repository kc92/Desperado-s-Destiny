/**
 * Prestige Routes
 * API routes for the prestige/endgame system
 */

import { Router } from 'express';
import {
  getPrestigeInfo,
  performPrestige,
  getPrestigeHistory,
  getPrestigeRanks,
  checkPrestigeEligibility,
} from '../controllers/prestige.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// All prestige routes require authentication
router.use(requireAuth);

/**
 * GET /api/prestige
 * Get prestige info for current character (rank, bonuses, eligibility)
 * Query: { characterId: string }
 */
router.get('/', asyncHandler(getPrestigeInfo));

/**
 * POST /api/prestige/reset
 * Perform prestige reset - resets level/skills but grants permanent bonuses
 * Body: { characterId: string }
 */
router.post('/reset', requireCsrfToken, asyncHandler(performPrestige));

/**
 * GET /api/prestige/history
 * Get prestige history for a character
 * Query: { characterId: string }
 */
router.get('/history', asyncHandler(getPrestigeHistory));

/**
 * GET /api/prestige/ranks
 * Get all prestige rank definitions
 */
router.get('/ranks', asyncHandler(getPrestigeRanks));

/**
 * GET /api/prestige/eligibility
 * Check prestige eligibility with detailed requirements
 * Query: { characterId: string }
 */
router.get('/eligibility', asyncHandler(checkPrestigeEligibility));

export default router;
