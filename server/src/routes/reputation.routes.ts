/**
 * Reputation Routes
 * API endpoints for faction reputation system
 */

import { Router } from 'express';
import { ReputationController } from '../controllers/reputation.controller';
import { requireAuth } from '../middleware/requireAuth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * All reputation routes require authentication and active character
 */
router.use(requireAuth);

/**
 * GET /api/reputation
 * Get all faction standings for current character
 */
router.get('/', asyncHandler(ReputationController.getAllStandings));

/**
 * GET /api/reputation/benefits
 * Get benefits guide for all factions and standings
 */
router.get('/benefits', asyncHandler(ReputationController.getBenefitsGuide));

/**
 * GET /api/reputation/history
 * Get reputation change history
 * Query params: faction (optional), limit (optional, default 50)
 */
router.get('/history', asyncHandler(ReputationController.getHistory));

/**
 * GET /api/reputation/:faction
 * Get standing with a specific faction
 * Params: faction (settlerAlliance, nahiCoalition, frontera)
 */
router.get('/:faction', asyncHandler(ReputationController.getFactionStanding));

export default router;
