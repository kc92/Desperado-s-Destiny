/**
 * Shooting Contest Routes
 * Shooting contest system routes
 */

import { Router } from 'express';
import {
  getActiveContests,
  getContestTemplates,
  getContestDetails,
  registerForContest,
  takeShot,
  getLeaderboard,
  getMyRecord,
  getMyContests,
  getContestHistory,
  createContest,
} from '../controllers/shootingContest.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

// Public routes
router.get('/contests', asyncHandler(getActiveContests));
router.get('/templates', asyncHandler(getContestTemplates));
router.get('/leaderboard', asyncHandler(getLeaderboard));
router.get('/contests/:contestId', asyncHandler(getContestDetails));

// Protected routes - require auth and character
router.use(requireAuth);
router.use(requireCharacter);

// Get character's shooting record
router.get('/my-record', asyncHandler(getMyRecord));

// Get character's contests
router.get('/my-contests', asyncHandler(getMyContests));

// Get contest history
router.get('/history', asyncHandler(getContestHistory));

// Register for a contest
router.post('/contests/:contestId/register', requireCsrfToken, asyncHandler(registerForContest));

// Take a shot during contest
router.post('/contests/:contestId/shoot', requireCsrfToken, asyncHandler(takeShot));

// Create a new contest (for scheduled/admin use)
router.post('/contests', requireCsrfToken, asyncHandler(createContest));

export default router;
