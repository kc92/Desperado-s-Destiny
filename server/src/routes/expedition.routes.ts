/**
 * Expedition Routes
 * API routes for the expedition system (offline progression)
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import {
  getAvailability,
  getExpeditionTypes,
  getActiveExpedition,
  getExpeditionHistory,
  startExpedition,
  cancelExpedition,
  getExpeditionDetails
} from '../controllers/expedition.controller';

const router = Router();

/**
 * Rate limiter for expedition actions
 * Limit: 30 actions per minute (expeditions are slow)
 */
const expeditionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    error: 'Too many expedition actions. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Expedition Routes
 * All routes require authentication and character selection
 */

// Get all expedition type configurations
router.get('/types', requireAuth, requireCharacter, asyncHandler(getExpeditionTypes));

// Get expedition availability at current location
router.get('/availability', requireAuth, requireCharacter, asyncHandler(getAvailability));

// Get active expedition for character
router.get('/active', requireAuth, requireCharacter, asyncHandler(getActiveExpedition));

// Get expedition history
router.get('/history', requireAuth, requireCharacter, asyncHandler(getExpeditionHistory));

// Get specific expedition details
router.get('/:expeditionId', requireAuth, requireCharacter, asyncHandler(getExpeditionDetails));

// Start a new expedition
router.post('/start', requireAuth, requireCsrfToken, requireCharacter, expeditionLimiter, asyncHandler(startExpedition));

// Cancel an active expedition
router.post('/:expeditionId/cancel', requireAuth, requireCsrfToken, requireCharacter, expeditionLimiter, asyncHandler(cancelExpedition));

export default router;
