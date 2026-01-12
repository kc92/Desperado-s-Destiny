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
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';
import { requireCharacterOwnership } from '../middleware/characterOwnership.middleware';
import { reputationRateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * All routes require authentication
 */
router.use(requireAuth);

/**
 * GET /api/reputation-spreading/:characterId
 * Get player's overall reputation in a location
 * Protected: User must own this character
 */
router.get('/:characterId', requireCharacterOwnership, asyncHandler(getPlayerReputation));

/**
 * GET /api/reputation-spreading/npc/:npcId/:characterId
 * Get what an NPC knows about a player
 * Protected: User must own this character
 */
router.get('/npc/:npcId/:characterId', requireCharacterOwnership, asyncHandler(getNPCKnowledge));

/**
 * GET /api/reputation-spreading/modifier/:npcId/:characterId
 * Get reputation modifier for NPC interactions
 * Protected: User must own this character
 */
router.get('/modifier/:npcId/:characterId', requireCharacterOwnership, asyncHandler(getReputationModifier));

/**
 * GET /api/reputation-spreading/knowledgeable/:characterId
 * Get all NPCs who know about a character
 * Protected: User must own this character
 */
router.get('/knowledgeable/:characterId', requireCharacterOwnership, asyncHandler(getKnowledgeableNPCs));

/**
 * GET /api/reputation-spreading/events/:characterId
 * Get reputation events for a character
 * Protected: User must own this character
 */
router.get('/events/:characterId', requireCharacterOwnership, asyncHandler(getReputationEvents));

/**
 * POST /api/reputation-spreading/event
 * Create a new reputation event (manual/testing)
 */
router.post('/event', requireCsrfToken, reputationRateLimiter, asyncHandler(createReputationEvent));

/**
 * POST /api/reputation-spreading/spread/:eventId
 * Manually trigger spreading of an event (admin only)
 */
router.post('/spread/:eventId', requireCsrfToken, reputationRateLimiter, asyncHandler(spreadReputationEvent));

/**
 * POST /api/reputation-spreading/cleanup
 * Cleanup expired events (admin/cron)
 */
router.post('/cleanup', requireCsrfToken, reputationRateLimiter, asyncHandler(cleanupExpiredEvents));

/**
 * POST /api/reputation-spreading/decay
 * Decay old events (admin/cron)
 */
router.post('/decay', requireCsrfToken, reputationRateLimiter, asyncHandler(decayOldEvents));

export default router;
