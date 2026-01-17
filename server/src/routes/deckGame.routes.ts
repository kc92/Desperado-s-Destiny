/**
 * Deck Game Routes
 * Routes for deck mini-game sessions
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import {
  startGame,
  gameAction,
  getGameStateEndpoint,
  forfeitGame
} from '../controllers/deckGame.controller';

const router = Router();

// All deck game routes require authentication and character selection
router.use(requireAuth);
router.use(requireCharacter);

/**
 * POST /api/deck/start
 * Start a new deck game
 * Body: { gameType, difficulty?, relevantSuit?, timeLimit? }
 */
router.post('/start', requireCsrfToken, asyncHandler(startGame));

/**
 * POST /api/deck/action
 * Process a player action
 * Body: { gameId, action: { type, cardIndices? } }
 */
router.post('/action', requireCsrfToken, asyncHandler(gameAction));

/**
 * GET /api/deck/:gameId
 * Get current game state
 */
router.get('/:gameId', asyncHandler(getGameStateEndpoint));

/**
 * POST /api/deck/:gameId/forfeit
 * Abandon a game
 */
router.post('/:gameId/forfeit', requireCsrfToken, asyncHandler(forfeitGame));

export default router;
