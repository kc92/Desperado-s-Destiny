/**
 * Tournament Routes
 * API routes for PvP tournaments
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';
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
router.get('/open', asyncHandler(getOpenTournaments));

/**
 * GET /api/tournaments/active
 * Get tournaments in progress
 */
router.get('/active', asyncHandler(getActiveTournaments));

/**
 * GET /api/tournaments/history
 * Get tournament history for character
 */
router.get('/history', requireCharacter, asyncHandler(getTournamentHistory));

/**
 * POST /api/tournaments
 * Create a new tournament (admin)
 */
router.post('/', requireCsrfToken, asyncHandler(createTournament));

/**
 * POST /api/tournaments/:tournamentId/join
 * Join a tournament
 */
router.post('/:tournamentId/join', requireCharacter, requireCsrfToken, asyncHandler(joinTournament));

/**
 * POST /api/tournaments/:tournamentId/leave
 * Leave a tournament
 */
router.post('/:tournamentId/leave', requireCharacter, requireCsrfToken, asyncHandler(leaveTournament));

/**
 * POST /api/tournaments/:tournamentId/start
 * Start a tournament
 */
router.post('/:tournamentId/start', requireCsrfToken, asyncHandler(startTournament));

/**
 * GET /api/tournaments/:tournamentId/bracket
 * Get tournament bracket
 */
router.get('/:tournamentId/bracket', asyncHandler(getTournamentBracket));

/**
 * GET /api/tournaments/:tournamentId/my-match
 * Get current match for player
 */
router.get('/:tournamentId/my-match', requireCharacter, asyncHandler(getCurrentMatch));

/**
 * POST /api/tournaments/:tournamentId/match/:matchId/start
 * Start a tournament match
 */
router.post('/:tournamentId/match/:matchId/start', requireCharacter, requireCsrfToken, asyncHandler(startMatch));

/**
 * POST /api/tournaments/:tournamentId/match/:matchId/play
 * Play action in tournament match
 */
router.post('/:tournamentId/match/:matchId/play', requireCharacter, requireCsrfToken, asyncHandler(playMatchAction));

export default router;
