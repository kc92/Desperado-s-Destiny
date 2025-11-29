/**
 * Heist Routes
 *
 * API endpoints for gang heist operations
 */

import { Router } from 'express';
import { HeistController } from '../controllers/heist.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * All heist routes require authentication and character ownership
 */
router.use(requireAuth);
router.use(requireCharacter);

/**
 * GET /api/heists/available
 * Get available heist targets for the character's gang
 */
router.get('/available', asyncHandler(HeistController.getAvailableHeists));

/**
 * GET /api/heists
 * Get all heists for the character's gang
 * Query params: includeCompleted (boolean)
 */
router.get('/', asyncHandler(HeistController.getGangHeists));

/**
 * POST /api/heists/plan
 * Start planning a new heist
 * Body: { target: HeistTarget, roleAssignments?: [{ role: HeistRole, characterId: string }] }
 */
router.post('/plan', asyncHandler(HeistController.planHeist));

/**
 * POST /api/heists/:heistId/progress
 * Increase planning progress for a heist
 * Body: { amount?: number } (default 10)
 */
router.post('/:heistId/progress', asyncHandler(HeistController.increasePlanning));

/**
 * POST /api/heists/:heistId/execute
 * Execute a planned heist (leader only)
 */
router.post('/:heistId/execute', asyncHandler(HeistController.executeHeist));

/**
 * POST /api/heists/:heistId/cancel
 * Cancel a heist in planning (leader only)
 */
router.post('/:heistId/cancel', asyncHandler(HeistController.cancelHeist));

/**
 * POST /api/heists/:heistId/roles
 * Assign a role to a gang member
 * Body: { role: HeistRole, targetCharacterId: string }
 */
router.post('/:heistId/roles', asyncHandler(HeistController.assignRole));

export default router;
