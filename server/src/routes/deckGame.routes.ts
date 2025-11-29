/**
 * Deck Game Routes
 * Routes for deck mini-game sessions
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import {
  startGame,
  gameAction,
  getGameState,
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
router.post('/start', startGame);

/**
 * POST /api/deck/action
 * Process a player action
 * Body: { gameId, action: { type, cardIndices? } }
 */
router.post('/action', gameAction);

/**
 * GET /api/deck/:gameId
 * Get current game state
 */
router.get('/:gameId', getGameState);

/**
 * POST /api/deck/:gameId/forfeit
 * Abandon a game
 */
router.post('/:gameId/forfeit', forfeitGame);

export default router;
