/**
 * NPC Routes
 * Routes for NPC interaction operations
 */

import { Router } from 'express';
import { requireAuth, requireCharacter } from '../middleware/auth.middleware';
import npcController from '../controllers/npc.controller';

const router = Router();

// Protected routes (require authentication and character)
router.get('/trusts', requireAuth, requireCharacter, npcController.getCharacterTrusts);
router.get('/location/:locationId', requireAuth, requireCharacter, npcController.getNPCsAtLocation);
router.get('/:npcId', requireAuth, requireCharacter, npcController.getNPCDetails);
router.post('/:npcId/interact', requireAuth, requireCharacter, npcController.interactWithNPC);
router.get('/:npcId/quests', requireAuth, requireCharacter, npcController.getQuestsFromNPC);
router.get('/:npcId/trust', requireAuth, requireCharacter, npcController.getNPCTrust);

export default router;
