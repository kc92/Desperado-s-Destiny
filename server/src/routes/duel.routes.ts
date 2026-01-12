/**
 * Duel Routes
 * API routes for PvP deck game challenges
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
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
import { requireCsrfToken, requireCsrfTokenWithRotation } from '../middleware/csrf.middleware';
import { checkGoldDuplication } from '../middleware/antiExploit.middleware';
import { validate, DuelSchemas } from '../validation';
import { duelRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// All duel routes require authentication and character selection
router.use(requireAuth);
router.use(requireCharacter);

/**
 * POST /api/duels/challenge
 * Challenge another player to a duel
 * Body: { targetId, type?, wagerAmount? }
 * CSRF rotation for wager commitment
 */
router.post('/challenge', duelRateLimiter, requireCsrfTokenWithRotation, validate(DuelSchemas.challenge), checkGoldDuplication(), asyncHandler(challengePlayer));

/**
 * POST /api/duels/:duelId/accept
 * Accept a duel challenge
 */
router.post('/:duelId/accept', requireCsrfToken, asyncHandler(acceptDuel));

/**
 * POST /api/duels/:duelId/decline
 * Decline a duel challenge
 */
router.post('/:duelId/decline', requireCsrfToken, asyncHandler(declineDuel));

/**
 * POST /api/duels/:duelId/cancel
 * Cancel a duel challenge (by challenger)
 */
router.post('/:duelId/cancel', requireCsrfToken, asyncHandler(cancelDuel));

/**
 * GET /api/duels/:duelId/game
 * Get current game state for an active duel
 */
router.get('/:duelId/game', asyncHandler(getDuelGame));

/**
 * POST /api/duels/:duelId/play
 * Play an action in the duel
 * Body: { action: { type, cardIndices? } }
 */
router.post('/:duelId/play', requireCsrfToken, validate(DuelSchemas.action), asyncHandler(playDuelAction));

/**
 * GET /api/duels/pending
 * Get pending challenges for the character
 */
router.get('/pending', asyncHandler(getPendingChallenges));

/**
 * GET /api/duels/active
 * Get active duels for the character
 */
router.get('/active', asyncHandler(getActiveDuels));

/**
 * GET /api/duels/history
 * Get duel history for the character
 * Query: { limit? }
 */
router.get('/history', asyncHandler(getDuelHistory));

/**
 * GET /api/duels/stats
 * Get duel statistics for the character
 */
router.get('/stats', asyncHandler(getDuelStats));

export default router;
