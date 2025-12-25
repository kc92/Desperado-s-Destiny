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

// =============================================================================
// SPRINT 2: HOLD/DISCARD COMBAT SYSTEM ROUTES
// =============================================================================

/**
 * POST /api/combat/:encounterId/start-turn
 * Start a new turn in combat (draws cards, enters hold phase)
 */
router.post('/:encounterId/start-turn', requireAuth, requireCsrfToken, asyncHandler(combatController.startTurn));

/**
 * POST /api/combat/:encounterId/action
 * Process a player action during combat
 * Body: { type: 'hold' | 'confirm_hold' | 'reroll' | 'peek' | 'flee', cardIndices?: number[], cardIndex?: number }
 */
router.post('/:encounterId/action', requireAuth, requireCsrfToken, detectSuspiciousEarning(), asyncHandler(combatController.processAction));

/**
 * GET /api/combat/:encounterId/state
 * Get current round state for an encounter
 */
router.get('/:encounterId/state', requireAuth, asyncHandler(combatController.getRoundState));

// =============================================================================
// END SPRINT 2: HOLD/DISCARD COMBAT SYSTEM ROUTES
// =============================================================================

export default router;
