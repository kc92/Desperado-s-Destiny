/**
 * Duel Routes
 * API routes for PvP deck game challenges
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import {
  challengePlayer,
  acceptDuel,
  declineDuel,
  cancelDuel,
  getDuelGame,
  playDuelAction,
  getPendingChallenges,
  getActiveDuels,
  getDuelHistory,
  getDuelStats
} from '../controllers/duel.controller';

const router = Router();

// All duel routes require authentication and character selection
router.use(requireAuth);
router.use(requireCharacter);

/**
 * POST /api/duels/challenge
 * Challenge another player to a duel
 * Body: { targetId, type?, wagerAmount? }
 */
router.post('/challenge', challengePlayer);

/**
 * POST /api/duels/:duelId/accept
 * Accept a duel challenge
 */
router.post('/:duelId/accept', acceptDuel);

/**
 * POST /api/duels/:duelId/decline
 * Decline a duel challenge
 */
router.post('/:duelId/decline', declineDuel);

/**
 * POST /api/duels/:duelId/cancel
 * Cancel a duel challenge (by challenger)
 */
router.post('/:duelId/cancel', cancelDuel);

/**
 * GET /api/duels/:duelId/game
 * Get current game state for an active duel
 */
router.get('/:duelId/game', getDuelGame);

/**
 * POST /api/duels/:duelId/play
 * Play an action in the duel
 * Body: { action: { type, cardIndices? } }
 */
router.post('/:duelId/play', playDuelAction);

/**
 * GET /api/duels/pending
 * Get pending challenges for the character
 */
router.get('/pending', getPendingChallenges);

/**
 * GET /api/duels/active
 * Get active duels for the character
 */
router.get('/active', getActiveDuels);

/**
 * GET /api/duels/history
 * Get duel history for the character
 * Query: { limit? }
 */
router.get('/history', getDuelHistory);

/**
 * GET /api/duels/stats
 * Get duel statistics for the character
 */
router.get('/stats', getDuelStats);

export default router;
