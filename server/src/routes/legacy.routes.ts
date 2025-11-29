/**
 * Legacy Routes
 * API routes for cross-character progression system
 */

import { Router } from 'express';
import {
  getLegacyProfile,
  getMilestones,
  getActiveBonuses,
  getNewCharacterBonuses,
  claimReward,
  getAvailableRewards,
  getLifetimeStats,
  getCharacterContributions,
  updateStat,
} from '../controllers/legacy.controller';
import { requireAuth } from '../middleware/requireAuth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// All legacy routes require authentication
router.use(requireAuth);

/**
 * GET /api/legacy/profile
 * Get complete legacy profile with tier info and bonuses
 */
router.get('/profile', asyncHandler(getLegacyProfile));

/**
 * GET /api/legacy/milestones
 * Get all milestones with progress tracking
 */
router.get('/milestones', asyncHandler(getMilestones));

/**
 * GET /api/legacy/bonuses
 * Get active bonuses (multipliers, starting bonuses)
 */
router.get('/bonuses', asyncHandler(getActiveBonuses));

/**
 * GET /api/legacy/new-character-bonuses
 * Get bonuses that apply when creating a new character
 */
router.get('/new-character-bonuses', asyncHandler(getNewCharacterBonuses));

/**
 * GET /api/legacy/rewards
 * Get available unclaimed rewards
 */
router.get('/rewards', asyncHandler(getAvailableRewards));

/**
 * POST /api/legacy/claim-reward
 * Claim a legacy reward for a character
 * Body: { rewardId: string, characterId: string }
 */
router.post('/claim-reward', asyncHandler(claimReward));

/**
 * GET /api/legacy/stats
 * Get lifetime stats
 */
router.get('/stats', asyncHandler(getLifetimeStats));

/**
 * GET /api/legacy/contributions
 * Get character contribution history
 */
router.get('/contributions', asyncHandler(getCharacterContributions));

/**
 * POST /api/legacy/admin/update-stat
 * Admin/Dev endpoint to manually update a stat (for testing)
 * Body: { statKey: string, value: number, increment?: boolean }
 */
router.post('/admin/update-stat', asyncHandler(updateStat));

export default router;
