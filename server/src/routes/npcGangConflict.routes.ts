/**
 * NPC Gang Conflict Routes
 *
 * Routes for player vs NPC gang interactions
 */

import { Router } from 'express';
import * as npcGangConflictController from '../controllers/npcGangConflict.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { apiRateLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * Apply authentication to all routes
 */
router.use(requireAuth);

/**
 * GET /api/npc-gangs
 * List all NPC gangs
 */
router.get('/', apiRateLimiter, asyncHandler(npcGangConflictController.listNPCGangs));

/**
 * GET /api/npc-gangs/relationships
 * Get all NPC gang relationships for player gang
 */
router.get('/relationships', apiRateLimiter, asyncHandler(npcGangConflictController.getAllRelationships));

/**
 * GET /api/npc-gangs/:gangId
 * Get specific NPC gang details
 */
router.get('/:gangId', apiRateLimiter, asyncHandler(npcGangConflictController.getNPCGangDetails));

/**
 * GET /api/npc-gangs/:gangId/overview
 * Get comprehensive overview of NPC gang for player
 */
router.get('/:gangId/overview', apiRateLimiter, asyncHandler(npcGangConflictController.getNPCGangOverview));

/**
 * GET /api/npc-gangs/:gangId/relationship
 * Get player gang's relationship with NPC gang
 */
router.get('/:gangId/relationship', apiRateLimiter, asyncHandler(npcGangConflictController.getRelationship));

/**
 * POST /api/npc-gangs/:gangId/tribute
 * Pay tribute to NPC gang
 * Requires: Gang leader
 */
router.post('/:gangId/tribute', requireCsrfToken, apiRateLimiter, asyncHandler(npcGangConflictController.payTribute));

/**
 * GET /api/npc-gangs/:gangId/missions
 * Get available missions from NPC gang
 */
router.get('/:gangId/missions', apiRateLimiter, asyncHandler(npcGangConflictController.getAvailableMissions));

/**
 * POST /api/npc-gangs/:gangId/missions/:missionId
 * Accept mission from NPC gang
 */
router.post('/:gangId/missions/:missionId', requireCsrfToken, apiRateLimiter, asyncHandler(npcGangConflictController.acceptMission));

/**
 * POST /api/npc-gangs/:gangId/challenge
 * Challenge NPC gang for territory
 * Requires: Gang leader, Level 15+
 */
router.post('/:gangId/challenge', requireCsrfToken, apiRateLimiter, asyncHandler(npcGangConflictController.challengeTerritory));

/**
 * POST /api/npc-gangs/:gangId/challenge/mission
 * Complete challenge mission
 */
router.post('/:gangId/challenge/mission', requireCsrfToken, apiRateLimiter, asyncHandler(npcGangConflictController.completeChallengeMission));

/**
 * POST /api/npc-gangs/:gangId/challenge/final-battle
 * Fight final battle for territory
 * Requires: Challenge complete
 */
router.post('/:gangId/challenge/final-battle', requireCsrfToken, apiRateLimiter, asyncHandler(npcGangConflictController.fightFinalBattle));

/**
 * POST /api/npc-gangs/:gangId/attack
 * Simulate NPC gang attack (testing/admin only)
 */
router.post('/:gangId/attack', requireCsrfToken, apiRateLimiter, asyncHandler(npcGangConflictController.simulateAttack));

export default router;
