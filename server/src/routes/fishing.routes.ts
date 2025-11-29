/**
 * Fishing Routes
 * API routes for the fishing system
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import {
  startFishing,
  getCurrentSession,
  checkForBite,
  setHook,
  endFishing
} from '../controllers/fishing.controller';

const router = Router();

/**
 * Rate limiter for fishing actions
 * Limit: 60 actions per minute to allow for frequent bite checks
 */
const fishingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: {
    success: false,
    error: 'Too many fishing actions. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Fishing Routes
 * All routes require authentication and character selection
 */

// Get current fishing session
router.get('/session', requireAuth, requireCharacter, getCurrentSession);

// Start a new fishing session
router.post('/start', requireAuth, requireCharacter, fishingLimiter, startFishing);

// Check for a bite (can be called frequently during fishing)
router.post('/check-bite', requireAuth, requireCharacter, fishingLimiter, checkForBite);

// Set the hook when a bite is detected
router.post('/set-hook', requireAuth, requireCharacter, fishingLimiter, setHook);

// End the current fishing session
router.post('/end', requireAuth, requireCharacter, fishingLimiter, endFishing);

export default router;
