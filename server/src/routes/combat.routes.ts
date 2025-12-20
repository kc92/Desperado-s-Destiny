/**
 * Combat Routes
 *
 * Express router for turn-based combat endpoints
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import combatController from '../controllers/combat.controller';
import { detectSuspiciousEarning } from '../middleware/antiExploit.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { validate, CombatSchemas } from '../validation';

const router = Router();

/**
 * All combat routes require authentication
 */

/**
 * POST /api/combat/start
 * Start a new combat encounter with an NPC
 * Body: { npcId: string }
 */
router.post('/start', requireAuth, requireCsrfToken, validate(CombatSchemas.startEncounter), detectSuspiciousEarning(), asyncHandler(combatController.startCombat));

/**
 * POST /api/combat/turn/:encounterId
 * Play a turn in an active combat encounter
 */
router.post('/turn/:encounterId', requireAuth, requireCsrfToken, validate(CombatSchemas.combatAction), detectSuspiciousEarning(), asyncHandler(combatController.playTurn));

/**
 * GET /api/combat/active
 * Get the character's active combat encounter
 */
router.get('/active', requireAuth, asyncHandler(combatController.getActiveCombat));

/**
 * GET /api/combat/npcs
 * List all active NPCs available for combat
 */
router.get('/npcs', requireAuth, asyncHandler(combatController.listNPCs));

/**
 * GET /api/combat/history
 * Get combat history for the character
 * Query params: page (number), limit (number)
 */
router.get('/history', requireAuth, asyncHandler(combatController.getCombatHistory));

/**
 * GET /api/combat/stats
 * Get combat stats for the character
 */
router.get('/stats', requireAuth, asyncHandler(combatController.getCombatStats));

/**
 * POST /api/combat/flee/:encounterId
 * Flee from an active combat encounter (only allowed in first 3 rounds)
 */
router.post('/flee/:encounterId', requireAuth, requireCsrfToken, asyncHandler(combatController.fleeCombat));

export default router;
