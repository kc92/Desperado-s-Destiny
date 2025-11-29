/**
 * Territory Routes
 *
 * API routes for territory management
 */

import { Router } from 'express';
import { TerritoryController } from '../controllers/territory.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/territories
 * List all territories
 */
router.get('/', requireAuth, TerritoryController.list);

/**
 * GET /api/territories/stats
 * Get territory statistics
 */
router.get('/stats', requireAuth, TerritoryController.getStats);

/**
 * GET /api/territories/:id
 * Get single territory
 */
router.get('/:id', requireAuth, TerritoryController.getById);

/**
 * POST /api/territories/:id/declare-war
 * Declare war on a territory (gang leader only)
 */
router.post('/:id/declare-war', requireAuth, TerritoryController.declareWar);

/**
 * GET /api/territories/:id/wars
 * Get war history for a territory
 */
router.get('/:id/wars', requireAuth, TerritoryController.getWars);

/**
 * GET /api/territories/:id/history
 * Get conquest history for a territory
 */
router.get('/:id/history', requireAuth, TerritoryController.getHistory);

export default router;
