/**
 * Action Routes
 *
 * API routes for Destiny Deck action challenges
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import { preventActionsWhileJailed } from '../middleware/jail.middleware';
import {
  performChallenge,
  getActions,
  getAction,
  getActionHistory
} from '../controllers/action.controller';
import {
  startAction,
  playAction,
  getActionGame,
  forfeitActionGame
} from '../controllers/actionDeck.controller';
import { requireCharacter } from '../middleware/characterOwnership.middleware';

const router = Router();

/**
 * Rate limiter for action challenges
 * Limit: 60 challenges per minute to prevent abuse
 */
const challengeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: {
    success: false,
    error: 'Too many action attempts. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Action Routes
 * All routes require authentication
 */

// Perform a Destiny Deck challenge (jail check applied)
router.post('/challenge', requireAuth, preventActionsWhileJailed, challengeLimiter, performChallenge);

// Get all available actions
router.get('/', requireAuth, getActions);

// Get single action by ID
router.get('/:id', requireAuth, getAction);

// Get action history for a character
router.get('/history/:characterId', requireAuth, getActionHistory);

/**
 * Interactive Deck Game Action Routes
 * New system with player agency
 */

router.post('/start', requireAuth, requireCharacter, preventActionsWhileJailed, challengeLimiter, startAction);
router.post('/play', requireAuth, requireCharacter, challengeLimiter, playAction);
router.get('/game/:gameId', requireAuth, requireCharacter, getActionGame);
router.post('/game/:gameId/forfeit', requireAuth, requireCharacter, forfeitActionGame);

export default router;
