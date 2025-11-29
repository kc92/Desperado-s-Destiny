/**
 * Jail Routes
 *
 * API routes for jail system
 */

import { Router } from 'express';
import { JailController } from '../controllers/jail.controller';
import { requireAuth } from '../middleware/requireAuth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * All jail routes require authentication
 */
router.use(requireAuth);

/**
 * GET /api/jail/status
 * Get current jail status for authenticated character
 */
router.get('/status', asyncHandler(JailController.getStatus));

/**
 * GET /api/jail/stats
 * Get jail statistics for authenticated character
 */
router.get('/stats', asyncHandler(JailController.getStats));

/**
 * POST /api/jail/escape
 * Attempt to escape from jail
 */
router.post('/escape', asyncHandler(JailController.attemptEscape));

/**
 * POST /api/jail/bribe
 * Attempt to bribe a guard
 * Body: { amount: number }
 */
router.post('/bribe', asyncHandler(JailController.attemptBribe));

/**
 * POST /api/jail/bail
 * Pay bail for self or another character
 * Body: { characterId?: string }
 */
router.post('/bail', asyncHandler(JailController.payBail));

/**
 * POST /api/jail/activity
 * Perform a jail activity
 * Body: { activity: JailActivity }
 */
router.post('/activity', asyncHandler(JailController.doActivity));

/**
 * POST /api/jail/turn-in/:characterId
 * Turn in a wanted player for bounty
 */
router.post('/turn-in/:characterId', asyncHandler(JailController.turnInPlayer));

/**
 * POST /api/jail/release/:characterId (Admin only)
 * Release a player from jail
 * Note: This should have admin middleware in production
 */
router.post('/release/:characterId', asyncHandler(JailController.releasePlayer));

export default router;
