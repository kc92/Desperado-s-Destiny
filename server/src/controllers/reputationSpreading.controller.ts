/**
 * Reputation Spreading Controller
 *
 * Handles HTTP requests for reputation spreading system
 * Part of Phase 3, Wave 3.2 - Reputation Spreading System
 */

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ReputationSpreadingService } from '../services/reputationSpreading.service';
import { ReputationEventType } from '@desperados/shared';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../utils/errors';

/**
 * Get player's overall reputation
 * GET /api/reputation/:characterId
 */
export const getPlayerReputation = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { characterId } = req.params;

  // Verify ownership
  if (req.user?.characterId !== characterId) {
    throw new AppError('Unauthorized', 403);
  }

  // Get all location reputations (could be optimized to specific location)
  const locationId = req.query.locationId as string || 'red-gulch';

  const reputation = await ReputationSpreadingService.getPlayerReputation(
    characterId,
    locationId
  );

  res.json({
    success: true,
    data: {
      reputation
    }
  });
});

/**
 * Get NPC's knowledge about player
 * GET /api/reputation/npc/:npcId/:characterId
 */
export const getNPCKnowledge = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { npcId, characterId } = req.params;

  // Verify ownership
  if (req.user?.characterId !== characterId) {
    throw new AppError('Unauthorized', 403);
  }

  const knowledge = await ReputationSpreadingService.getNPCKnowledge(npcId, characterId);
  const modifier = await ReputationSpreadingService.getReputationModifier(npcId, characterId);

  // Determine interaction quality
  let interactionQuality: 'excellent' | 'good' | 'neutral' | 'poor' | 'hostile';
  const opinion = modifier.opinionScore;

  if (opinion >= 70) {
    interactionQuality = 'excellent';
  } else if (opinion >= 30) {
    interactionQuality = 'good';
  } else if (opinion >= -30) {
    interactionQuality = 'neutral';
  } else if (opinion >= -70) {
    interactionQuality = 'poor';
  } else {
    interactionQuality = 'hostile';
  }

  res.json({
    success: true,
    data: {
      npcKnowledge: knowledge,
      modifier,
      canInteract: modifier.willTrade || modifier.willHelp,
      interactionQuality
    }
  });
});

/**
 * Get reputation modifier for NPC interaction
 * GET /api/reputation/modifier/:npcId/:characterId
 */
export const getReputationModifier = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { npcId, characterId } = req.params;

  // Verify ownership
  if (req.user?.characterId !== characterId) {
    throw new AppError('Unauthorized', 403);
  }

  const modifier = await ReputationSpreadingService.getReputationModifier(npcId, characterId);

  res.json({
    success: true,
    data: {
      modifier
    }
  });
});

/**
 * Create manual reputation event (admin/testing)
 * POST /api/reputation/event
 */
export const createReputationEvent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    characterId,
    eventType,
    magnitude,
    sentiment,
    locationId,
    originNpcId,
    faction,
    description
  } = req.body;

  // Verify ownership or admin
  if (req.user?.characterId !== characterId && req.user?.role !== 'admin') {
    throw new AppError('Unauthorized', 403);
  }

  // Validate event type
  if (!Object.values(ReputationEventType).includes(eventType)) {
    throw new AppError('Invalid event type', 400);
  }

  const { event, spreadResult } = await ReputationSpreadingService.createReputationEvent(
    characterId,
    eventType,
    locationId,
    {
      magnitude,
      sentiment,
      faction,
      originNpcId,
      description
    }
  );

  res.status(201).json({
    success: true,
    data: {
      event,
      spreadResult,
      message: `Reputation event created and spread to ${spreadResult.npcsInformed} NPCs`
    }
  });
});

/**
 * Get all NPCs who know about a character
 * GET /api/reputation/knowledgeable/:characterId
 */
export const getKnowledgeableNPCs = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { characterId } = req.params;

  // Verify ownership
  if (req.user?.characterId !== characterId) {
    throw new AppError('Unauthorized', 403);
  }

  const { NPCKnowledge } = await import('../models/NPCKnowledge.model');
  const knowledgeRecords = await NPCKnowledge.findByCharacter(characterId);

  // Sort by opinion (best to worst)
  knowledgeRecords.sort((a, b) => b.overallOpinion - a.overallOpinion);

  res.json({
    success: true,
    data: {
      npcs: knowledgeRecords.map(k => ({
        npcId: k.npcId,
        overallOpinion: k.overallOpinion,
        trustLevel: k.trustLevel,
        fearLevel: k.fearLevel,
        respectLevel: k.respectLevel,
        eventsKnown: k.events.length,
        lastUpdated: k.lastUpdated
      })),
      total: knowledgeRecords.length
    }
  });
});

/**
 * Get reputation events for a character
 * GET /api/reputation/events/:characterId
 */
export const getReputationEvents = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { characterId } = req.params;
  const { locationId, limit = 20 } = req.query;

  // Verify ownership
  if (req.user?.characterId !== characterId) {
    throw new AppError('Unauthorized', 403);
  }

  const { ReputationEvent } = await import('../models/ReputationEvent.model');

  let events;
  if (locationId) {
    events = await ReputationEvent.find({
      characterId,
      locationId,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    })
      .sort({ timestamp: -1 })
      .limit(Number(limit));
  } else {
    // findActiveEvents returns a Promise, so we await it first
    const allEvents = await ReputationEvent.findActiveEvents(characterId);
    events = allEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, Number(limit));
  }

  res.json({
    success: true,
    data: {
      events,
      total: events.length
    }
  });
});

/**
 * Trigger manual spread of an event (admin/testing)
 * POST /api/reputation/spread/:eventId
 */
export const spreadReputationEvent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { eventId } = req.params;

  // Admin only
  if (req.user?.role !== 'admin') {
    throw new AppError('Unauthorized - Admin only', 403);
  }

  const spreadResult = await ReputationSpreadingService.spreadReputation(eventId);

  res.json({
    success: true,
    data: {
      spreadResult,
      message: `Event spread to ${spreadResult.npcsInformed} NPCs`
    }
  });
});

/**
 * Cleanup expired events (admin/cron)
 * POST /api/reputation/cleanup
 */
export const cleanupExpiredEvents = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // Admin only
  if (req.user?.role !== 'admin') {
    throw new AppError('Unauthorized - Admin only', 403);
  }

  const deletedCount = await ReputationSpreadingService.cleanupExpiredEvents();

  res.json({
    success: true,
    data: {
      deletedCount,
      message: `Cleaned up ${deletedCount} expired events`
    }
  });
});

/**
 * Decay old events (admin/cron)
 * POST /api/reputation/decay
 */
export const decayOldEvents = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // Admin only
  if (req.user?.role !== 'admin') {
    throw new AppError('Unauthorized - Admin only', 403);
  }

  const decayedCount = await ReputationSpreadingService.decayOldEvents();

  res.json({
    success: true,
    data: {
      decayedCount,
      message: `Decayed ${decayedCount} old events`
    }
  });
});
