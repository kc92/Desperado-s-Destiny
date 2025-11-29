/**
 * Tournament Routes
 * API routes for PvP tournaments
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import {
  createTournament,
  joinTournament,
  leaveTournament,
  startTournament,
  getTournamentBracket,
  getCurrentMatch,
  startMatch,
  playMatchAction,
  getOpenTournaments,
  getActiveTournaments,
  getTournamentHistory
} from '../controllers/tournament.controller';

const router = Router();

// All tournament routes require authentication
router.use(requireAuth);

/**
 * GET /api/tournaments/open
 * Get tournaments open for registration
 */
router.get('/open', getOpenTournaments);

/**
 * GET /api/tournaments/active
 * Get tournaments in progress
 */
router.get('/active', getActiveTournaments);

/**
 * GET /api/tournaments/history
 * Get tournament history for character
 */
router.get('/history', requireCharacter, getTournamentHistory);

/**
 * POST /api/tournaments
 * Create a new tournament (admin)
 */
router.post('/', createTournament);

/**
 * POST /api/tournaments/:tournamentId/join
 * Join a tournament
 */
router.post('/:tournamentId/join', requireCharacter, joinTournament);

/**
 * POST /api/tournaments/:tournamentId/leave
 * Leave a tournament
 */
router.post('/:tournamentId/leave', requireCharacter, leaveTournament);

/**
 * POST /api/tournaments/:tournamentId/start
 * Start a tournament
 */
router.post('/:tournamentId/start', startTournament);

/**
 * GET /api/tournaments/:tournamentId/bracket
 * Get tournament bracket
 */
router.get('/:tournamentId/bracket', getTournamentBracket);

/**
 * GET /api/tournaments/:tournamentId/my-match
 * Get current match for player
 */
router.get('/:tournamentId/my-match', requireCharacter, getCurrentMatch);

/**
 * POST /api/tournaments/:tournamentId/match/:matchId/start
 * Start a tournament match
 */
router.post('/:tournamentId/match/:matchId/start', requireCharacter, startMatch);

/**
 * POST /api/tournaments/:tournamentId/match/:matchId/play
 * Play action in tournament match
 */
router.post('/:tournamentId/match/:matchId/play', requireCharacter, playMatchAction);

export default router;
