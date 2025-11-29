/**
 * Boss Encounter Routes
 *
 * Express router for individual boss encounter endpoints
 * (separate from world boss system which handles server-wide boss events)
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import bossEncounterController from '../controllers/bossEncounter.controller';

const router = Router();

// ============================================
// Boss Discovery & Information Routes
// ============================================

/**
 * GET /api/boss-encounters
 * Get all available bosses and character's discovery progress
 */
router.get('/', requireAuth, requireCharacter, bossEncounterController.getAllBossesWithProgress);

/**
 * GET /api/boss-encounters/active
 * Get character's active boss encounter if any
 */
router.get('/active', requireAuth, requireCharacter, bossEncounterController.getActiveEncounter);

/**
 * GET /api/boss-encounters/:bossId
 * Get specific boss details and character's discovery progress
 */
router.get('/:bossId', requireAuth, requireCharacter, bossEncounterController.getBossDetails);

/**
 * GET /api/boss-encounters/:bossId/availability
 * Check if a boss is available for the character
 */
router.get('/:bossId/availability', requireAuth, requireCharacter, bossEncounterController.checkAvailability);

/**
 * GET /api/boss-encounters/:bossId/history
 * Get character's encounter history for a specific boss
 */
router.get('/:bossId/history', requireAuth, requireCharacter, bossEncounterController.getEncounterHistory);

/**
 * GET /api/boss-encounters/:bossId/leaderboard
 * Get leaderboard for a specific boss (public)
 * Query: { limit?: number }
 */
router.get('/:bossId/leaderboard', bossEncounterController.getBossLeaderboard);

// ============================================
// Encounter Initiation Routes
// ============================================

/**
 * POST /api/boss-encounters/:bossId/initiate
 * Initiate a boss encounter
 * Body: { location: string, partyMemberIds?: string[] }
 */
router.post('/:bossId/initiate', requireAuth, requireCharacter, bossEncounterController.initiateBossEncounter);

// ============================================
// Combat Session Routes
// ============================================

/**
 * GET /api/boss-encounters/sessions/:sessionId
 * Get current boss encounter session status
 */
router.get('/sessions/:sessionId', requireAuth, requireCharacter, bossEncounterController.getEncounterSession);

/**
 * POST /api/boss-encounters/sessions/:sessionId/attack
 * Execute a combat action in boss encounter
 * Body: { action: 'attack' | 'defend' | 'item' | 'flee', targetId?: string, itemId?: string }
 */
router.post('/sessions/:sessionId/attack', requireAuth, requireCharacter, bossEncounterController.processBossAttack);

/**
 * POST /api/boss-encounters/sessions/:sessionId/abandon
 * Abandon a boss encounter (counts as defeat)
 */
router.post('/sessions/:sessionId/abandon', requireAuth, requireCharacter, bossEncounterController.abandonEncounter);

export default router;
