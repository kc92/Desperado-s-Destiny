/**
 * Action Routes
 *
 * API routes for Destiny Deck action challenges
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import { preventActionsWhileJailed } from '../middleware/jail.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
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
import { detectSuspiciousEarning } from '../middleware/antiExploit.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';

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
router.post('/challenge', requireAuth, requireCsrfToken, preventActionsWhileJailed, challengeLimiter, asyncHandler(performChallenge));

// Get all available actions
router.get('/', requireAuth, asyncHandler(getActions));

// Get single action by ID
router.get('/:id', requireAuth, asyncHandler(getAction));

// Get action history for a character
router.get('/history/:characterId', requireAuth, asyncHandler(getActionHistory));

/**
 * Interactive Deck Game Action Routes
 * New system with player agency
 */

router.post('/start', requireAuth, requireCsrfToken, requireCharacter, preventActionsWhileJailed, challengeLimiter, detectSuspiciousEarning(), asyncHandler(startAction));
router.post('/play', requireAuth, requireCsrfToken, requireCharacter, challengeLimiter, detectSuspiciousEarning(), asyncHandler(playAction));
router.get('/game/:gameId', requireAuth, requireCharacter, asyncHandler(getActionGame));
router.post('/game/:gameId/forfeit', requireAuth, requireCsrfToken, requireCharacter, asyncHandler(forfeitActionGame));

export default router;
