/**
 * Ritual Routes
 * API endpoints for Dark Ritual system
 */

import { Router } from 'express';
import { RitualController } from '../controllers/ritual.controller';
import { requireAuth } from '../middleware/requireAuth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * All ritual routes require authentication
 */
router.use(requireAuth);

/**
 * GET /api/rituals
 * Get all available rituals for the character
 */
router.get('/', asyncHandler(RitualController.getAvailableRituals));

/**
 * GET /api/rituals/all
 * Get all rituals (for discovery purposes)
 */
router.get('/all', asyncHandler(RitualController.getAllRituals));

/**
 * GET /api/rituals/active
 * Get currently active ritual (if any)
 */
router.get('/active', asyncHandler(RitualController.getActiveRitual));

/**
 * GET /api/rituals/:ritualId/check
 * Check if character can perform a specific ritual
 */
router.get('/:ritualId/check', asyncHandler(RitualController.canPerformRitual));

/**
 * POST /api/rituals/:ritualId/start
 * Start performing a ritual
 * Body: { participants?: string[] }
 */
router.post('/:ritualId/start', asyncHandler(RitualController.startRitual));

/**
 * POST /api/rituals/complete
 * Complete the active ritual (if time has elapsed)
 */
router.post('/complete', asyncHandler(RitualController.completeRitual));

/**
 * POST /api/rituals/cancel
 * Cancel the active ritual (causes backlash)
 */
router.post('/cancel', asyncHandler(RitualController.cancelRitual));

/**
 * POST /api/rituals/:ritualId/discover
 * Discover/learn a ritual
 */
router.post('/:ritualId/discover', asyncHandler(RitualController.discoverRitual));

export default router;
