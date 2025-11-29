/**
 * Gossip Controller
 *
 * Handles HTTP requests for the gossip and cross-reference system
 * Part of Phase 3, Wave 3.1 - NPC Cross-references System
 */

import { Request, Response } from 'express';
import { GossipService } from '../services/gossip.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../utils/errors';
import { GossipCategory } from '@desperados/shared';

/**
 * Get gossip from an NPC
 * GET /api/gossip/npc/:npcId
 */
export const getGossipFromNPC = asyncHandler(async (req: Request, res: Response) => {
  const { npcId } = req.params;
  const characterId = req.character?._id.toString();

  if (!characterId) {
    throw new AppError('Character not found', 404);
  }

  const result = await GossipService.getGossip(npcId, characterId);

  res.json({
    success: true,
    data: result
  });
});

/**
 * Get gossip about a specific NPC
 * GET /api/gossip/about/:npcId
 */
export const getGossipAboutNPC = asyncHandler(async (req: Request, res: Response) => {
  const { npcId } = req.params;
  const characterId = req.character?._id.toString();

  if (!characterId) {
    throw new AppError('Character not found', 404);
  }

  // Get character's trust level (can be enhanced to get from specific NPC)
  const trustLevel = 0; // Default, enhance this based on requirements

  const gossip = await GossipService.getGossipAboutNPC(npcId, trustLevel);

  res.json({
    success: true,
    data: { gossip }
  });
});

/**
 * Get NPC's opinion about another NPC
 * GET /api/gossip/opinion/:askerNpcId/:subjectNpcId
 */
export const getNPCOpinion = asyncHandler(async (req: Request, res: Response) => {
  const { askerNpcId, subjectNpcId } = req.params;

  const opinion = await GossipService.getNPCOpinion(askerNpcId, subjectNpcId);

  if (!opinion) {
    throw new AppError('No relationship found between these NPCs', 404);
  }

  res.json({
    success: true,
    data: { opinion }
  });
});

/**
 * Get relationships for an NPC
 * GET /api/gossip/relationships/:npcId
 */
export const getNPCRelationships = asyncHandler(async (req: Request, res: Response) => {
  const { npcId } = req.params;

  const relationships = await GossipService.getPublicRelationships(npcId);

  res.json({
    success: true,
    data: { relationships }
  });
});

/**
 * Find connection path between two NPCs
 * GET /api/gossip/connection/:npcId1/:npcId2
 */
export const findConnection = asyncHandler(async (req: Request, res: Response) => {
  const { npcId1, npcId2 } = req.params;

  const path = await GossipService.findConnection(npcId1, npcId2);

  res.json({
    success: true,
    data: {
      path,
      degrees: path.length > 0 ? path.length - 1 : -1,
      connected: path.length > 0
    }
  });
});

/**
 * Get gossip by category
 * GET /api/gossip/category/:category
 */
export const getGossipByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.params;

  // Validate category
  if (!Object.values(GossipCategory).includes(category as GossipCategory)) {
    throw new AppError('Invalid gossip category', 400);
  }

  const gossip = await GossipService.getGossipByCategory(category as GossipCategory);

  res.json({
    success: true,
    data: { gossip }
  });
});

/**
 * Get active gossip
 * GET /api/gossip/active
 */
export const getActiveGossip = asyncHandler(async (req: Request, res: Response) => {
  const gossip = await GossipService.getActiveGossip();

  res.json({
    success: true,
    data: { gossip }
  });
});

/**
 * Spread gossip (admin/testing only)
 * POST /api/gossip/:gossipId/spread
 */
export const spreadGossip = asyncHandler(async (req: Request, res: Response) => {
  const { gossipId } = req.params;

  const result = await GossipService.spreadGossip(gossipId);

  res.json({
    success: true,
    data: result
  });
});

/**
 * Create gossip (admin/testing only)
 * POST /api/gossip/create
 */
export const createGossip = asyncHandler(async (req: Request, res: Response) => {
  const { originNpc, options } = req.body;

  if (!originNpc || !options) {
    throw new AppError('Missing required fields: originNpc, options', 400);
  }

  const gossip = await GossipService.createGossip(originNpc, options);

  res.json({
    success: true,
    data: { gossip }
  });
});

/**
 * Cleanup old gossip (admin/cron job)
 * POST /api/gossip/cleanup
 */
export const cleanupGossip = asyncHandler(async (req: Request, res: Response) => {
  const count = await GossipService.cleanupOldGossip();

  res.json({
    success: true,
    data: {
      message: `Cleaned up ${count} stale gossip items`,
      count
    }
  });
});
