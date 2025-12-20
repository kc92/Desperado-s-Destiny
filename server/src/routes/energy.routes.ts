/**
 * Energy Routes
 *
 * API routes for energy management system
 */

import { Router } from 'express';
import { EnergyController } from '../controllers/energy.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = Router();

/**
 * All energy routes require authentication and character
 */
router.use(requireAuth);
router.use(requireCharacter);

/**
 * GET /api/energy/status
 * Get current energy status for authenticated character
 */
router.get('/status', asyncHandler(EnergyController.getStatus));

/**
 * GET /api/energy/can-afford/:cost
 * Check if character can afford an action with given energy cost
 */
router.get('/can-afford/:cost', asyncHandler(EnergyController.canAfford));

/**
 * POST /api/energy/spend
 * Spend energy for an action
 * Body: { amount: number }
 */
router.post('/spend', requireCsrfToken, asyncHandler(EnergyController.spend));

/**
 * POST /api/energy/grant
 * Grant energy to a character (admin only)
 * Body: { amount: number, allowOverMax?: boolean }
 */
router.post('/grant', requireCsrfToken, requireAdmin, asyncHandler(EnergyController.grant));

/**
 * POST /api/energy/regenerate
 * Force regeneration calculation and return updated energy
 */
router.post('/regenerate', requireCsrfToken, asyncHandler(EnergyController.regenerate));

/**
 * POST /api/energy/rest
 * Rest to restore energy and potentially receive divine dreams
 * Body: { restType?: 'short' | 'long' }
 */
router.post('/rest', requireCsrfToken, asyncHandler(EnergyController.rest));

export default router;
