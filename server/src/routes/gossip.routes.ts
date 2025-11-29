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
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();

/**
 * Public routes (no authentication required)
 */

// Get active gossip (public news/rumors)
router.get('/active', getActiveGossip);

// Get gossip by category
router.get('/category/:category', getGossipByCategory);

// Find connection between NPCs
router.get('/connection/:npcId1/:npcId2', findConnection);

/**
 * Protected routes (require authentication)
 */

// Get gossip from an NPC (player interaction)
router.get('/npc/:npcId', requireAuth, getGossipFromNPC);

// Get gossip about a specific NPC
router.get('/about/:npcId', requireAuth, getGossipAboutNPC);

// Get NPC's opinion about another NPC
router.get('/opinion/:askerNpcId/:subjectNpcId', requireAuth, getNPCOpinion);

// Get relationships for an NPC
router.get('/relationships/:npcId', requireAuth, getNPCRelationships);

/**
 * Admin/testing routes
 * TODO: Add admin middleware when available
 */

// Spread gossip (for testing/events)
router.post('/:gossipId/spread', requireAuth, spreadGossip);

// Create gossip (for testing/events)
router.post('/create', requireAuth, createGossip);

// Cleanup old gossip (cron job endpoint)
router.post('/cleanup', cleanupGossip);

export default router;
