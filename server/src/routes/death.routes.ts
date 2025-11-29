/**
 * Death Routes
 *
 * API routes for death, respawn, and death statistics system
 */

import { Router } from 'express';
import { DeathController } from '../controllers/death.controller';
import { requireAuth } from '../middleware/requireAuth';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * All death routes require authentication
 */
router.use(requireAuth);

/**
 * GET /api/death/penalties
 * Get information about death penalties (no character required)
 */
router.get('/penalties', asyncHandler(DeathController.getPenalties));

/**
 * Character-specific routes require character middleware
 */
router.use(requireCharacter);

/**
 * GET /api/death/status
 * Get current death/respawn status for authenticated character
 */
router.get('/status', asyncHandler(DeathController.getStatus));

/**
 * GET /api/death/history
 * Get death statistics and history for authenticated character
 */
router.get('/history', asyncHandler(DeathController.getHistory));

/**
 * POST /api/death/trigger
 * Trigger death for a character
 * Body: { deathType: DeathType }
 */
router.post('/trigger', asyncHandler(DeathController.triggerDeath));

/**
 * POST /api/death/respawn
 * Respawn character at designated location
 * Body: { locationId?: string }
 */
router.post('/respawn', asyncHandler(DeathController.respawn));

/**
 * POST /api/death/check-jail
 * Check if death should result in jail time instead
 * Body: { killerType: 'lawful_npc' | 'lawful_player' | 'outlaw' }
 */
router.post('/check-jail', asyncHandler(DeathController.checkJail));

export default router;
