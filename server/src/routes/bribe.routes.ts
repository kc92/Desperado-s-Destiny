/**
 * Bribe Routes
 *
 * API routes for bribery system
 */

import { Router } from 'express';
import { BribeController } from '../controllers/bribe.controller';
import { requireAuth } from '../middleware/requireAuth';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * All bribe routes require authentication and character
 */
router.use(requireAuth);
router.use(requireCharacter);

/**
 * GET /api/bribe/calculate
 * Calculate recommended bribe amount for an NPC
 * Query params: npcFaction, requestDifficulty
 */
router.get('/calculate', asyncHandler(BribeController.calculateRecommended));

/**
 * GET /api/bribe/options/:buildingId
 * Get bribe options for a specific building
 */
router.get('/options/:buildingId', asyncHandler(BribeController.getBuildingOptions));

/**
 * POST /api/bribe/guard
 * Bribe a guard to bypass wanted level restrictions
 * Body: { buildingId: string, amount: number }
 */
router.post('/guard', asyncHandler(BribeController.bribeGuard));

/**
 * POST /api/bribe/npc
 * Bribe an NPC for information or services
 * Body: { npcId: string, amount: number }
 */
router.post('/npc', asyncHandler(BribeController.bribeNPC));

export default router;
