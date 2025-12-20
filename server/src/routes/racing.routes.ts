/**
 * Racing Routes
 * Horse racing system routes
 */

import { Router } from 'express';
import {
  getRaces,
  getRaceDetails,
  getPrestigiousEvents,
  enterRace,
  placeBet,
  getMyRaceHorses,
  getRaceHistory,
  getRacingLeaderboard,
  getRaceOdds,
} from '../controllers/racing.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken, requireCsrfTokenWithRotation } from '../middleware/csrf.middleware';

const router = Router();

// Public routes
router.get('/races', asyncHandler(getRaces));
router.get('/events', asyncHandler(getPrestigiousEvents));
router.get('/leaderboard', asyncHandler(getRacingLeaderboard));
router.get('/races/:raceId', asyncHandler(getRaceDetails));
router.get('/races/:raceId/odds', asyncHandler(getRaceOdds));

// Protected routes - require auth and character
router.use(requireAuth);
router.use(requireCharacter);

// Get character's eligible horses
router.get('/my-horses', asyncHandler(getMyRaceHorses));

// Get race history
router.get('/history', asyncHandler(getRaceHistory));

// Enter a race
router.post('/races/:raceId/enter', requireCsrfToken, asyncHandler(enterRace));

// Place a bet - CSRF rotation for wager placement
router.post('/races/:raceId/bet', requireCsrfTokenWithRotation, asyncHandler(placeBet));

export default router;
