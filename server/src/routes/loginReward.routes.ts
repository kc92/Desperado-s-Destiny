/**
 * Login Reward Routes
 * Phase B - Competitor Parity Plan
 *
 * API routes for the login reward system
 */

import express from 'express';
import { LoginRewardController } from '../controllers/loginReward.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { detectSuspiciousEarning } from '../middleware/antiExploit.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = express.Router();

/**
 * GET /api/login-rewards/status
 * Get claim status for current day
 * Returns: canClaim, currentDay, currentWeek, todayReward preview
 */
router.get('/status', requireAuth, asyncHandler(LoginRewardController.getStatus));

/**
 * GET /api/login-rewards/calendar
 * Get full 28-day calendar with claimed status
 * Returns: Array of all days with claimed/unclaimed status
 */
router.get('/calendar', requireAuth, asyncHandler(LoginRewardController.getCalendar));

/**
 * GET /api/login-rewards/current
 * Get current day's reward preview
 * Returns: Day info and what reward will be given
 */
router.get('/current', requireAuth, asyncHandler(LoginRewardController.getCurrentReward));

/**
 * POST /api/login-rewards/claim
 * Claim today's reward
 * Returns: The claimed reward and updated progress
 */
router.post('/claim', requireAuth, requireCsrfToken, detectSuspiciousEarning(), asyncHandler(LoginRewardController.claimReward));

/**
 * POST /api/login-rewards/monthly
 * Claim monthly bonus (requires all 28 days claimed)
 * Returns: The monthly bonus reward
 */
router.post('/monthly', requireAuth, requireCsrfToken, detectSuspiciousEarning(), asyncHandler(LoginRewardController.claimMonthlyBonus));

/**
 * GET /api/login-rewards/statistics
 * Get login reward statistics
 * Returns: Total days claimed, streak, rewards earned, etc.
 */
router.get('/statistics', requireAuth, asyncHandler(LoginRewardController.getStatistics));

/**
 * POST /api/login-rewards/reset (Admin only)
 * Reset a character's login reward progress
 * Body: { characterId: string }
 */
router.post('/reset', requireAuth, requireCsrfToken, requireAdmin, asyncHandler(LoginRewardController.resetProgress));

export default router;
