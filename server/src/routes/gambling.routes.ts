/**
 * Gambling Routes
 * Non-deck gambling games (Blackjack, Roulette, Craps, Faro, Monte, Wheel)
 */

import { Router } from 'express';
import {
  getGames,
  getGameDetails,
  getLocations,
  getLocationDetails,
  getItems,
  startSession,
  getCurrentSession,
  placeBet,
  endSession,
  getMyStats,
  getHistory,
  getLeaderboard,
} from '../controllers/gambling.controller';
import { requireAuth } from '../middleware/requireAuth';
import { requireCharacter } from '../middleware/characterOwnership.middleware';

const router = Router();

// Public routes
router.get('/games', getGames);
router.get('/games/:gameId', getGameDetails);
router.get('/locations', getLocations);
router.get('/locations/:locationId', getLocationDetails);
router.get('/items', getItems);
router.get('/leaderboard', getLeaderboard);

// Protected routes - require auth and character
router.use(requireAuth);
router.use(requireCharacter);

// Get character's gambling stats
router.get('/my-stats', getMyStats);

// Get gambling history
router.get('/history', getHistory);

// Get current session
router.get('/sessions/current', getCurrentSession);

// Start a new session
router.post('/sessions', startSession);

// Place a bet in session
router.post('/sessions/:sessionId/bet', placeBet);

// End a session
router.post('/sessions/:sessionId/end', endSession);

export default router;
