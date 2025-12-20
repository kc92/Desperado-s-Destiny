/**
 * Hunting Routes
 * API routes for the hunting system
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import {
  checkHuntAvailability,
  startHunt,
  getCurrentTrip,
  getHuntingStatistics,
  abandonHunt
} from '../controllers/hunting.controller';

const router = Router();

/**
 * Rate limiter for hunting actions
 * Limit: 30 actions per minute
 */
const huntingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    error: 'Too many hunting actions. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Hunting Routes
 * All routes require authentication and character selection
 */

// Check if character can hunt and get available grounds
router.get('/availability', requireAuth, requireCharacter, asyncHandler(checkHuntAvailability));

// Get current hunting trip
router.get('/current', requireAuth, requireCharacter, asyncHandler(getCurrentTrip));

// Get hunting statistics for character
router.get('/statistics', requireAuth, requireCharacter, asyncHandler(getHuntingStatistics));

// Start a new hunting trip
router.post('/start', requireAuth, requireCsrfToken, requireCharacter, huntingLimiter, asyncHandler(startHunt));

// Abandon current hunting trip
router.post('/abandon', requireAuth, requireCsrfToken, requireCharacter, huntingLimiter, asyncHandler(abandonHunt));

export default router;
