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
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken, requireCsrfTokenWithRotation } from '../middleware/csrf.middleware';
import { checkGoldDuplication, rateLimitGoldTransactions } from '../middleware/antiExploit.middleware';
import { validate, GamblingSchemas } from '../validation';

const router = Router();

// Public routes
router.get('/games', asyncHandler(getGames));
router.get('/games/:gameId', asyncHandler(getGameDetails));
router.get('/locations', asyncHandler(getLocations));
router.get('/locations/:locationId', asyncHandler(getLocationDetails));
router.get('/items', asyncHandler(getItems));
router.get('/leaderboard', asyncHandler(getLeaderboard));

// Protected routes - require auth and character
router.use(requireAuth);
router.use(requireCharacter);

// Get character's gambling stats
router.get('/my-stats', asyncHandler(getMyStats));

// Get gambling history
router.get('/history', asyncHandler(getHistory));

// Get current session
router.get('/sessions/current', asyncHandler(getCurrentSession));

// Start a new session
router.post('/sessions', requireCsrfToken, asyncHandler(startSession));

// Place a bet in session - CSRF rotation for wager placement
router.post('/sessions/:sessionId/bet', requireCsrfTokenWithRotation, validate(GamblingSchemas.placeBet), gamblingRateLimiter, rateLimitGoldTransactions(50), checkGoldDuplication(), asyncHandler(placeBet));

// End a session
router.post('/sessions/:sessionId/end', requireCsrfToken, asyncHandler(endSession));

export default router;
