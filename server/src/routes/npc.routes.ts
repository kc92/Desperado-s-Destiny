/**
 * NPC Routes
 * Routes for NPC interaction operations
 */

import { Router } from 'express';
import { requireAuth, requireCharacter } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import npcController from '../controllers/npc.controller';

const router = Router();

// Protected routes (require authentication and character)
router.get('/trusts', requireAuth, requireCharacter, asyncHandler(npcController.getCharacterTrusts));
router.get('/location/:locationId', requireAuth, requireCharacter, asyncHandler(npcController.getNPCsAtLocation));
router.get('/:npcId', requireAuth, requireCharacter, asyncHandler(npcController.getNPCDetails));
router.post('/:npcId/interact', requireAuth, requireCharacter, requireCsrfToken, asyncHandler(npcController.interactWithNPC));
router.get('/:npcId/quests', requireAuth, requireCharacter, asyncHandler(npcController.getQuestsFromNPC));
router.get('/:npcId/trust', requireAuth, requireCharacter, asyncHandler(npcController.getNPCTrust));

export default router;
