/**
 * World Boss Routes
 *
 * Express router for world boss and boss encounter endpoints
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { requireCharacter } from '../middleware/characterOwnership.middleware';
import worldBossController from '../controllers/worldBoss.controller';

const router = Router();

// ============================================
// Public Routes (no auth required)
// ============================================

/**
 * GET /api/world-bosses
 * Get all world bosses and their status (spawn times, active status)
 */
router.get('/', worldBossController.getAllWorldBosses);

/**
 * GET /api/world-bosses/:bossId/status
 * Get status of a specific world boss
 */
router.get('/:bossId/status', worldBossController.getWorldBossStatus);

/**
 * GET /api/world-bosses/:bossId/leaderboard
 * Get leaderboard for a world boss session
 */
router.get('/:bossId/leaderboard', worldBossController.getWorldBossLeaderboard);

// ============================================
// Protected Routes (auth + character required)
// ============================================

/**
 * POST /api/world-bosses/:bossId/join
 * Join a world boss fight
 */
router.post('/:bossId/join', requireAuth, requireCharacter, worldBossController.joinWorldBoss);

/**
 * POST /api/world-bosses/:bossId/attack
 * Attack a world boss
 * Body: { damage: number }
 */
router.post('/:bossId/attack', requireAuth, requireCharacter, worldBossController.attackWorldBoss);

/**
 * GET /api/world-bosses/:bossId/participant
 * Get participant data for current character
 */
router.get('/:bossId/participant', requireAuth, requireCharacter, worldBossController.getParticipantData);

// ============================================
// Admin Routes (auth required, TODO: add admin check)
// ============================================

/**
 * POST /api/world-bosses/:bossId/spawn
 * Spawn a world boss (admin only)
 */
router.post('/:bossId/spawn', requireAuth, worldBossController.spawnWorldBoss);

/**
 * POST /api/world-bosses/:bossId/end
 * End a world boss session (admin only)
 * Body: { victory: boolean }
 */
router.post('/:bossId/end', requireAuth, worldBossController.endWorldBossSession);

// ============================================
// Boss Encounter Routes (Individual Boss Fights)
// ============================================

/**
 * GET /api/world-bosses/encounters/:bossId/availability
 * Check if a specific boss is available for the character
 */
router.get('/encounters/:bossId/availability', requireAuth, requireCharacter, worldBossController.checkBossAvailability);

/**
 * POST /api/world-bosses/encounters/:bossId/initiate
 * Initiate a boss encounter
 * Body: { location: string, partyMemberIds?: string[] }
 */
router.post('/encounters/:bossId/initiate', requireAuth, requireCharacter, worldBossController.initiateBossEncounter);

/**
 * POST /api/world-bosses/encounters/:sessionId/attack
 * Attack a boss in an active encounter
 * Body: { action: 'attack' | 'defend' | 'item' | 'flee', targetId?: string, itemId?: string }
 */
router.post('/encounters/:sessionId/attack', requireAuth, requireCharacter, worldBossController.processBossAttack);

export default router;
