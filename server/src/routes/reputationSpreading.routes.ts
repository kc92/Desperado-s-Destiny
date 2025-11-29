/**
 * Reputation Spreading Routes
 *
 * API routes for reputation spreading system
 * Part of Phase 3, Wave 3.2 - Reputation Spreading System
 */

import { Router } from 'express';
import {
  getPlayerReputation,
  getNPCKnowledge,
  getReputationModifier,
  createReputationEvent,
  getKnowledgeableNPCs,
  getReputationEvents,
  spreadReputationEvent,
  cleanupExpiredEvents,
  decayOldEvents
} from '../controllers/reputationSpreading.controller';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

/**
 * All routes require authentication
 */
router.use(requireAuth);

/**
 * GET /api/reputation-spreading/:characterId
 * Get player's overall reputation in a location
 */
router.get('/:characterId', getPlayerReputation);

/**
 * GET /api/reputation-spreading/npc/:npcId/:characterId
 * Get what an NPC knows about a player
 */
router.get('/npc/:npcId/:characterId', getNPCKnowledge);

/**
 * GET /api/reputation-spreading/modifier/:npcId/:characterId
 * Get reputation modifier for NPC interactions
 */
router.get('/modifier/:npcId/:characterId', getReputationModifier);

/**
 * GET /api/reputation-spreading/knowledgeable/:characterId
 * Get all NPCs who know about a character
 */
router.get('/knowledgeable/:characterId', getKnowledgeableNPCs);

/**
 * GET /api/reputation-spreading/events/:characterId
 * Get reputation events for a character
 */
router.get('/events/:characterId', getReputationEvents);

/**
 * POST /api/reputation-spreading/event
 * Create a new reputation event (manual/testing)
 */
router.post('/event', createReputationEvent);

/**
 * POST /api/reputation-spreading/spread/:eventId
 * Manually trigger spreading of an event (admin only)
 */
router.post('/spread/:eventId', spreadReputationEvent);

/**
 * POST /api/reputation-spreading/cleanup
 * Cleanup expired events (admin/cron)
 */
router.post('/cleanup', cleanupExpiredEvents);

/**
 * POST /api/reputation-spreading/decay
 * Decay old events (admin/cron)
 */
router.post('/decay', decayOldEvents);

export default router;
