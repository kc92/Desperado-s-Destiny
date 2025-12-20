/**
 * Production Routes
 * API routes for property production system
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  startProduction,
  collectProduction,
  cancelProduction,
  getSlotDetails,
  getPropertySlots,
  getActiveProductions,
  getCompletedProductions,
  updateProductionStatuses
} from '../controllers/production.controller';

const router = Router();

/**
 * Rate limiter for production actions
 * Limit: 20 production starts per minute to prevent abuse
 */
const productionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: {
    success: false,
    error: 'Too many production requests. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Production Routes
 * All routes require authentication and character selection
 */

// Start a new production order
// POST /api/production/start
// Body: { slotId, productId, quantity, workerIds?, rushOrder? }
router.post('/start', requireAuth, requireCsrfToken, requireCharacter, productionLimiter, asyncHandler(startProduction));

// Collect completed production
// POST /api/production/collect/:slotId
// Body: { autoSell? }
router.post('/collect/:slotId', requireAuth, requireCsrfToken, requireCharacter, asyncHandler(collectProduction));

// Cancel active production
// POST /api/production/cancel/:slotId
router.post('/cancel/:slotId', requireAuth, requireCsrfToken, requireCharacter, asyncHandler(cancelProduction));

// Get slot details
// GET /api/production/slot/:slotId
router.get('/slot/:slotId', requireAuth, requireCharacter, asyncHandler(getSlotDetails));

// Get all slots for a property
// GET /api/production/property/:propertyId
router.get('/property/:propertyId', requireAuth, requireCharacter, asyncHandler(getPropertySlots));

// Get active productions for character
// GET /api/production/active
router.get('/active', requireAuth, requireCharacter, asyncHandler(getActiveProductions));

// Get completed productions ready for collection
// GET /api/production/completed
router.get('/completed', requireAuth, requireCharacter, asyncHandler(getCompletedProductions));

// Admin: Update production statuses (for cron jobs)
// POST /api/production/update-statuses
router.post('/update-statuses', requireAuth, requireCsrfToken, asyncHandler(updateProductionStatuses));

export default router;
