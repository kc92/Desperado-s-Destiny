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
import { requireAuth } from '../middleware/requireAuth';
import { requireCharacter } from '../middleware/characterOwnership.middleware';

const router = Router();

// Public routes
router.get('/contests', getActiveContests);
router.get('/templates', getContestTemplates);
router.get('/leaderboard', getLeaderboard);
router.get('/contests/:contestId', getContestDetails);

// Protected routes - require auth and character
router.use(requireAuth);
router.use(requireCharacter);

// Get character's shooting record
router.get('/my-record', getMyRecord);

// Get character's contests
router.get('/my-contests', getMyContests);

// Get contest history
router.get('/history', getContestHistory);

// Register for a contest
router.post('/contests/:contestId/register', registerForContest);

// Take a shot during contest
router.post('/contests/:contestId/shoot', takeShot);

// Create a new contest (for scheduled/admin use)
router.post('/contests', createContest);

export default router;
