/**
 * Disguise Routes
 *
 * API routes for disguise system
 */

import { Router } from 'express';
import { DisguiseController } from '../controllers/disguise.controller';
import { requireAuth } from '../middleware/requireAuth';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * All disguise routes require authentication
 */
router.use(requireAuth);

/**
 * GET /api/disguise/types
 * Get all disguise types (no character required)
 */
router.get('/types', asyncHandler(DisguiseController.getTypes));

/**
 * Character-specific routes require character middleware
 */
router.use(requireCharacter);

/**
 * GET /api/disguise/status
 * Get current disguise status for authenticated character
 */
router.get('/status', asyncHandler(DisguiseController.getStatus));

/**
 * GET /api/disguise/available
 * Get all available disguises with affordability info
 */
router.get('/available', asyncHandler(DisguiseController.getAvailable));

/**
 * POST /api/disguise/apply
 * Apply a disguise to the character
 * Body: { disguiseId: string }
 */
router.post('/apply', asyncHandler(DisguiseController.apply));

/**
 * POST /api/disguise/remove
 * Remove current disguise
 */
router.post('/remove', asyncHandler(DisguiseController.remove));

/**
 * POST /api/disguise/check-detection
 * Check if disguise is detected (used during actions)
 * Body: { dangerLevel: number }
 */
router.post('/check-detection', asyncHandler(DisguiseController.checkDetection));

export default router;
