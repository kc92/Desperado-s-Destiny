/**
 * Daily Contract Routes
 *
 * Routes for the daily contract system
 * Part of the Competitor Parity Plan - Phase B
 */

import { Router } from 'express';
import {
  getDailyContracts,
  acceptContract,
  updateProgress,
  completeContract,
  getStreak,
  claimStreakBonus,
  getStreakLeaderboard,
  getResetTimer,
  triggerContractProgress,
  // Premium contracts (Sprint 7)
  getPremiumContracts,
  acceptPremiumContract,
  progressPremiumContract,
  completePremiumContract,
  abandonPremiumContract
} from '../controllers/dailyContract.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { detectSuspiciousEarning } from '../middleware/antiExploit.middleware';

const router = Router();

// All contract routes require auth and character
router.use(requireAuth);
router.use(requireCharacter);

// Get today's contracts
// GET /api/contracts/daily
router.get('/daily', asyncHandler(getDailyContracts));

// Get streak information
// GET /api/contracts/streak
router.get('/streak', asyncHandler(getStreak));

// Get streak leaderboard
// GET /api/contracts/leaderboard
router.get('/leaderboard', asyncHandler(getStreakLeaderboard));

// Get time until daily reset
// GET /api/contracts/reset-timer
router.get('/reset-timer', asyncHandler(getResetTimer));

// Claim streak bonus - detect suspicious earning patterns
// POST /api/contracts/streak/claim
router.post('/streak/claim', requireCsrfToken, detectSuspiciousEarning(), asyncHandler(claimStreakBonus));

// Trigger contract progress (internal use, but exposed for testing/debugging)
// POST /api/contracts/trigger
router.post('/trigger', requireCsrfToken, asyncHandler(triggerContractProgress));

// Accept a contract
// POST /api/contracts/:contractId/accept
router.post('/:contractId/accept', requireCsrfToken, asyncHandler(acceptContract));

// Update contract progress
// POST /api/contracts/:contractId/progress
router.post('/:contractId/progress', requireCsrfToken, asyncHandler(updateProgress));

// Complete a contract - detect suspicious earning patterns
// POST /api/contracts/:contractId/complete
router.post('/:contractId/complete', requireCsrfToken, detectSuspiciousEarning(), asyncHandler(completeContract));

// ============ Premium Contract Routes (Sprint 7) ============

// Get premium contracts for the character
// GET /api/contracts/premium
router.get('/premium', asyncHandler(getPremiumContracts));

// Accept a premium contract
// POST /api/contracts/premium/:templateId/accept
router.post('/premium/:templateId/accept', requireCsrfToken, asyncHandler(acceptPremiumContract));

// Progress a multi-phase premium contract
// POST /api/contracts/premium/:contractId/progress
router.post('/premium/:contractId/progress', requireCsrfToken, asyncHandler(progressPremiumContract));

// Complete a premium contract - detect suspicious earning patterns
// POST /api/contracts/premium/:contractId/complete
router.post('/premium/:contractId/complete', requireCsrfToken, detectSuspiciousEarning(), asyncHandler(completePremiumContract));

// Abandon a premium contract
// POST /api/contracts/premium/:contractId/abandon
router.post('/premium/:contractId/abandon', requireCsrfToken, asyncHandler(abandonPremiumContract));

export default router;
