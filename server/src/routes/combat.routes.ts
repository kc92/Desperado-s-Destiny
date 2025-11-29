/**
 * Combat Routes
 *
 * Express router for turn-based combat endpoints
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import combatController from '../controllers/combat.controller';

const router = Router();

/**
 * All combat routes require authentication
 */

/**
 * POST /api/combat/start
 * Start a new combat encounter with an NPC
 * Body: { npcId: string }
 */
router.post('/start', requireAuth, combatController.startCombat);

/**
 * POST /api/combat/turn/:encounterId
 * Play a turn in an active combat encounter
 */
router.post('/turn/:encounterId', requireAuth, combatController.playTurn);

/**
 * GET /api/combat/active
 * Get the character's active combat encounter
 */
router.get('/active', requireAuth, combatController.getActiveCombat);

/**
 * GET /api/combat/npcs
 * List all active NPCs available for combat
 */
router.get('/npcs', requireAuth, combatController.listNPCs);

/**
 * GET /api/combat/history
 * Get combat history for the character
 * Query params: page (number), limit (number)
 */
router.get('/history', requireAuth, combatController.getCombatHistory);

/**
 * GET /api/combat/stats
 * Get combat stats for the character
 */
router.get('/stats', requireAuth, combatController.getCombatStats);

/**
 * POST /api/combat/flee/:encounterId
 * Flee from an active combat encounter (only allowed in first 3 rounds)
 */
router.post('/flee/:encounterId', requireAuth, combatController.fleeCombat);

export default router;
