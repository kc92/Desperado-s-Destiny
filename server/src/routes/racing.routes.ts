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
import { requireAuth } from '../middleware/requireAuth';
import { requireCharacter } from '../middleware/characterOwnership.middleware';

const router = Router();

// Public routes
router.get('/races', getRaces);
router.get('/events', getPrestigiousEvents);
router.get('/leaderboard', getRacingLeaderboard);
router.get('/races/:raceId', getRaceDetails);
router.get('/races/:raceId/odds', getRaceOdds);

// Protected routes - require auth and character
router.use(requireAuth);
router.use(requireCharacter);

// Get character's eligible horses
router.get('/my-horses', getMyRaceHorses);

// Get race history
router.get('/history', getRaceHistory);

// Enter a race
router.post('/races/:raceId/enter', enterRace);

// Place a bet
router.post('/races/:raceId/bet', placeBet);

export default router;
