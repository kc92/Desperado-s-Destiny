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
  triggerContractProgress
} from '../controllers/dailyContract.controller';
import { requireAuth } from '../middleware/requireAuth';
import { requireCharacter } from '../middleware/characterOwnership.middleware';

const router = Router();

// All contract routes require auth and character
router.use(requireAuth);
router.use(requireCharacter);

// Get today's contracts
// GET /api/contracts/daily
router.get('/daily', getDailyContracts);

// Get streak information
// GET /api/contracts/streak
router.get('/streak', getStreak);

// Get streak leaderboard
// GET /api/contracts/leaderboard
router.get('/leaderboard', getStreakLeaderboard);

// Get time until daily reset
// GET /api/contracts/reset-timer
router.get('/reset-timer', getResetTimer);

// Claim streak bonus
// POST /api/contracts/streak/claim
router.post('/streak/claim', claimStreakBonus);

// Trigger contract progress (internal use, but exposed for testing/debugging)
// POST /api/contracts/trigger
router.post('/trigger', triggerContractProgress);

// Accept a contract
// POST /api/contracts/:contractId/accept
router.post('/:contractId/accept', acceptContract);

// Update contract progress
// POST /api/contracts/:contractId/progress
router.post('/:contractId/progress', updateProgress);

// Complete a contract
// POST /api/contracts/:contractId/complete
router.post('/:contractId/complete', completeContract);

export default router;
