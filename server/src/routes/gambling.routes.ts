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
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { gamblingRateLimiter } from '../middleware/gamblingRateLimiter';
import { requireCsrfToken, requireCsrfTokenWithRotation } from '../middleware/csrf.middleware';
import { checkGoldDuplication, rateLimitGoldTransactions } from '../middleware/antiExploit.middleware';
import { validate, GamblingSchemas } from '../validation';

const router = Router();

// NOTE: Controllers are already wrapped with asyncHandler, so don't double-wrap here.
// Double-wrapping causes `next` to be undefined in the inner asyncHandler,
// leading to unhandled promise rejections when errors are thrown.

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
router.post('/sessions', requireCsrfToken, startSession);

// Place a bet in session - CSRF rotation for wager placement
router.post('/sessions/:sessionId/bet', requireCsrfTokenWithRotation, validate(GamblingSchemas.placeBet), gamblingRateLimiter, rateLimitGoldTransactions(50), checkGoldDuplication(), placeBet);

// End a session
router.post('/sessions/:sessionId/end', requireCsrfToken, endSession);

export default router;
