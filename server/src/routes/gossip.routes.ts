/**
 * Gossip Routes
 *
 * API routes for the gossip and cross-reference system
 * Part of Phase 3, Wave 3.1 - NPC Cross-references System
 */

import express from 'express';
import {
  getGossipFromNPC,
  getGossipAboutNPC,
  getNPCOpinion,
  getNPCRelationships,
  findConnection,
  getGossipByCategory,
  getActiveGossip,
  spreadGossip,
  createGossip,
  cleanupGossip
} from '../controllers/gossip.controller';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireCsrfToken } from '../middleware/csrf.middleware';

const router = express.Router();

/**
 * Public routes (no authentication required)
 */

// Get active gossip (public news/rumors)
router.get('/active', asyncHandler(getActiveGossip));

// Get gossip by category
router.get('/category/:category', asyncHandler(getGossipByCategory));

// Find connection between NPCs
router.get('/connection/:npcId1/:npcId2', asyncHandler(findConnection));

/**
 * Protected routes (require authentication)
 */

// Get gossip from an NPC (player interaction)
router.get('/npc/:npcId', requireAuth, asyncHandler(getGossipFromNPC));

// Get gossip about a specific NPC
router.get('/about/:npcId', requireAuth, asyncHandler(getGossipAboutNPC));

// Get NPC's opinion about another NPC
router.get('/opinion/:askerNpcId/:subjectNpcId', requireAuth, asyncHandler(getNPCOpinion));

// Get relationships for an NPC
router.get('/relationships/:npcId', requireAuth, asyncHandler(getNPCRelationships));

/**
 * Admin/testing routes
 * Protected by requireAdmin middleware
 */

// Spread gossip (for testing/events)
router.post('/:gossipId/spread', requireAuth, requireCsrfToken, requireAdmin, asyncHandler(spreadGossip));

// Create gossip (for testing/events)
router.post('/create', requireAuth, requireCsrfToken, requireAdmin, asyncHandler(createGossip));

// Cleanup old gossip (cron job endpoint - internal only, CSRF protects from XSRF)
router.post('/cleanup', requireCsrfToken, asyncHandler(cleanupGossip));

export default router;
