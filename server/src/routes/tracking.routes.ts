/**
 * Tracking Routes
 * API routes for the tracking system (part of hunting)
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { attemptTracking } from '../controllers/tracking.controller';

const router = Router();

/**
 * Rate limiter for tracking actions
 * Limit: 30 actions per minute
 */
const trackingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    error: 'Too many tracking attempts. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Tracking Routes
 * All routes require authentication and character selection
 */

// Attempt to track an animal during a hunting trip
router.post('/attempt', requireAuth, requireCharacter, trackingLimiter, attemptTracking);

export default router;
