/**
 * Deity Encounter Controller
 *
 * Handles API endpoints for deity manifestations including:
 * - Stranger encounters (discovery, interaction, completion)
 * - Omen queries
 * - Dream acknowledgment
 */

import { Request, Response, NextFunction } from 'express';
import { Types, isValidObjectId } from 'mongoose';
import deityStrangerService from '../services/deityStranger.service';
import deityOmenService from '../services/deityOmen.service';
import deityDreamService, { DreamType } from '../services/deityDream.service';
import { DeityAttention, DeityName } from '../models/DeityAttention.model';
import { DivineManifestation } from '../models/DivineManifestation.model';
import { CharacterKarma } from '../models/CharacterKarma.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { AppError } from '../utils/errors';
import { asyncHandler } from '../middleware/asyncHandler';
import logger from '../utils/logger';

/**
 * Get strangers at a specific location available to the character
 * GET /api/deity/strangers/:locationId
 */
export const getStrangersAtLocation = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const characterId = req.user?.characterId;
  const { locationId } = req.params;

  if (!characterId) {
    res.status(401).json({ success: false, error: 'Character not authenticated' });
    return;
  }

  const strangers = await deityStrangerService.findStrangersForCharacter(
    characterId,
    new Types.ObjectId(locationId)
  );

  // Map to safe response (hide internal details)
  const safeStrangers = strangers.map(s => ({
    id: s._id,
    name: s.name,
    description: s.description,
    interactionType: s.interactionType,
    locationName: s.locationName,
    expiresAt: s.expiresAt
  }));

  res.json({
    success: true,
    strangers: safeStrangers,
    count: safeStrangers.length
  });
});

/**
 * Get all strangers available to the character (any location)
 * GET /api/deity/strangers
 */
export const getAllAvailableStrangers = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const characterId = req.user?.characterId;

  if (!characterId) {
    res.status(401).json({ success: false, error: 'Character not authenticated' });
    return;
  }

  const strangers = await deityStrangerService.findStrangersForCharacter(characterId);

  const safeStrangers = strangers.map(s => ({
    id: s._id,
    name: s.name,
    description: s.description,
    interactionType: s.interactionType,
    locationName: s.locationName,
    expiresAt: s.expiresAt
  }));

  res.json({
    success: true,
    strangers: safeStrangers,
    count: safeStrangers.length
  });
});

/**
 * Start interaction with a stranger
 * POST /api/deity/strangers/:strangerId/interact
 */
export const startStrangerInteraction = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const characterId = req.user?.characterId;
  const { strangerId } = req.params;

  if (!characterId) {
    res.status(401).json({ success: false, error: 'Character not authenticated' });
    return;
  }

  const result = await deityStrangerService.startInteraction(strangerId, characterId);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: result.error
    });
    return;
  }

  const stranger = result.stranger!;
  res.json({
    success: true,
    stranger: {
      id: stranger._id,
      name: stranger.name,
      description: stranger.description,
      interactionType: stranger.interactionType,
      payload: stranger.payload,
      deitySource: stranger.deitySource
    }
  });
});

/**
 * Complete interaction with a stranger
 * POST /api/deity/strangers/:strangerId/complete
 */
export const completeStrangerInteraction = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const characterId = req.user?.characterId;
  const { strangerId } = req.params;
  const { testPassed, responseChosen, tradeAccepted, giftAccepted } = req.body;

  if (!characterId) {
    res.status(401).json({ success: false, error: 'Character not authenticated' });
    return;
  }

  const result = await deityStrangerService.completeInteraction(
    strangerId,
    characterId,
    { testPassed, responseChosen, tradeAccepted, giftAccepted }
  );

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: result.error
    });
    return;
  }

  res.json({
    success: true,
    rewards: result.rewards
  });
});

/**
 * Get active omen effects for the character
 * GET /api/deity/omens
 */
export const getActiveOmens = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const characterId = req.user?.characterId;

  if (!characterId) {
    res.status(401).json({ success: false, error: 'Character not authenticated' });
    return;
  }

  const effects = await deityOmenService.getActiveOmenEffects(characterId);

  res.json({
    success: true,
    blessings: effects.blessings,
    curses: effects.curses
  });
});

/**
 * Get omen modifier for a specific effect type
 * GET /api/deity/omens/modifier/:effectType
 */
export const getOmenModifier = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const characterId = req.user?.characterId;
  const { effectType } = req.params;

  if (!characterId) {
    res.status(401).json({ success: false, error: 'Character not authenticated' });
    return;
  }

  const modifier = await deityOmenService.calculateOmenModifier(characterId, effectType);

  res.json({
    success: true,
    effectType,
    modifier
  });
});

/**
 * Acknowledge a divine manifestation (dream, omen, etc.)
 * POST /api/deity/manifestations/:manifestationId/acknowledge
 */
export const acknowledgeManifestation = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const characterId = req.user?.characterId;
  const { manifestationId } = req.params;
  const { response } = req.body;

  if (!characterId) {
    res.status(401).json({ success: false, error: 'Character not authenticated' });
    return;
  }

  const manifestation = await DivineManifestation.findById(manifestationId);

  if (!manifestation) {
    res.status(404).json({
      success: false,
      error: 'Manifestation not found'
    });
    return;
  }

  if (manifestation.targetCharacterId.toString() !== characterId) {
    res.status(403).json({
      success: false,
      error: 'This manifestation is not for you'
    });
    return;
  }

  manifestation.acknowledged = true;
  manifestation.acknowledgedAt = new Date();
  if (response) {
    manifestation.playerResponse = response;
  }
  await manifestation.save();

  // If it's a dream, apply dream effects
  if (manifestation.type === 'DREAM') {
    const effectData = JSON.parse(manifestation.effect || '{}');
    if (effectData.dreamType) {
      await deityDreamService.applyDreamEffects(characterId, effectData.dreamType);
    }
  }

  res.json({
    success: true,
    message: 'Manifestation acknowledged'
  });
});

/**
 * Get pending (unacknowledged) manifestations
 * GET /api/deity/manifestations/pending
 */
export const getPendingManifestations = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const characterId = req.user?.characterId;

  if (!characterId) {
    res.status(401).json({ success: false, error: 'Character not authenticated' });
    return;
  }

  const manifestations = await DivineManifestation.find({
    targetCharacterId: characterId,
    delivered: true,
    acknowledged: false
  })
    .sort({ urgency: -1, createdAt: -1 })
    .limit(10);

  res.json({
    success: true,
    manifestations: manifestations.map(m => ({
      id: m._id,
      type: m.type,
      deity: m.deityName,
      message: m.message,
      urgency: m.urgency,
      createdAt: m.createdAt
    })),
    count: manifestations.length
  });
});

/**
 * Get deity attention status for the character
 * GET /api/deity/attention
 */
export const getAttentionStatus = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const characterId = req.user?.characterId;

  if (!characterId) {
    res.status(401).json({ success: false, error: 'Character not authenticated' });
    return;
  }

  const [gamblerAttention, outlawAttention] = await Promise.all([
    DeityAttention.findByCharacterAndDeity(characterId, 'GAMBLER'),
    DeityAttention.findByCharacterAndDeity(characterId, 'OUTLAW_KING')
  ]);

  res.json({
    success: true,
    attention: {
      GAMBLER: gamblerAttention ? {
        attention: gamblerAttention.attention,
        interest: gamblerAttention.interest,
        trajectory: gamblerAttention.karmaTrajectory,
        lastIntervention: gamblerAttention.lastInterventionAt,
        totalInterventions: gamblerAttention.interventionCount
      } : null,
      OUTLAW_KING: outlawAttention ? {
        attention: outlawAttention.attention,
        interest: outlawAttention.interest,
        trajectory: outlawAttention.karmaTrajectory,
        lastIntervention: outlawAttention.lastInterventionAt,
        totalInterventions: outlawAttention.interventionCount
      } : null
    }
  });
});

/**
 * Get dream interpretation
 * GET /api/deity/dreams/interpretation
 */
export const getDreamInterpretation = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { dreamType, deity } = req.query;

  if (!dreamType || !deity) {
    res.status(400).json({
      success: false,
      error: 'dreamType and deity are required'
    });
    return;
  }

  const interpretation = deityDreamService.getDreamInterpretation(
    dreamType as 'PROPHETIC' | 'WARNING' | 'VISION' | 'NIGHTMARE' | 'MEMORY' | 'CHAOS_DREAM',
    deity as DeityName
  );

  res.json({
    success: true,
    interpretation
  });
});

/**
 * Admin: Force spawn a stranger
 * POST /api/deity/admin/spawn-stranger
 */
export const adminSpawnStranger = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { deity, locationId, targetCharacterId } = req.body;

  // Note: Admin permission is enforced at route level via requireAdmin middleware

  if (!deity || !locationId) {
    res.status(400).json({
      success: false,
      error: 'deity and locationId are required'
    });
    return;
  }

  // Validate deity parameter
  if (deity !== 'GAMBLER' && deity !== 'OUTLAW_KING') {
    throw new AppError('Invalid deity. Use GAMBLER or OUTLAW_KING', 400);
  }

  // Validate ObjectId parameters before construction
  if (!isValidObjectId(locationId)) {
    throw new AppError('Invalid locationId format', 400);
  }
  if (targetCharacterId && !isValidObjectId(targetCharacterId)) {
    throw new AppError('Invalid targetCharacterId format', 400);
  }

  const stranger = await deityStrangerService.spawnStranger(
    deity as DeityName,
    new Types.ObjectId(locationId),
    targetCharacterId ? new Types.ObjectId(targetCharacterId) : undefined
  );

  if (!stranger) {
    res.status(500).json({
      success: false,
      error: 'Failed to spawn stranger'
    });
    return;
  }

  res.json({
    success: true,
    stranger: {
      id: stranger._id,
      name: stranger.name,
      disguise: stranger.disguise,
      locationName: stranger.locationName,
      interactionType: stranger.interactionType
    }
  });
});

/**
 * Admin: Force an omen
 * POST /api/deity/admin/force-omen
 */
export const adminForceOmen = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { characterId, omenId } = req.body;

  // Note: Admin permission is enforced at route level via requireAdmin middleware

  if (!characterId || !omenId) {
    res.status(400).json({
      success: false,
      error: 'characterId and omenId are required'
    });
    return;
  }

  // Validate ObjectId before use
  if (!isValidObjectId(characterId)) {
    throw new AppError('Invalid characterId format', 400);
  }

  // Validate omenId is a non-empty string (actual omen validation happens in service)
  if (typeof omenId !== 'string' || omenId.trim().length === 0) {
    throw new AppError('Invalid omenId format', 400);
  }

  const result = await deityOmenService.forceOmen(characterId, omenId);

  if (!result) {
    res.status(400).json({
      success: false,
      error: 'Invalid omen ID'
    });
    return;
  }

  res.json({
    success: true,
    omen: {
      id: result.omen.id,
      description: result.omen.description,
      effect: result.omen.effect
    }
  });
});

/**
 * Admin: Force a dream
 * POST /api/deity/admin/force-dream
 */
export const adminForceDream = asyncHandler(async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { characterId, deity, dreamType } = req.body;

  // Note: Admin permission is enforced at route level via requireAdmin middleware

  if (!characterId || !deity || !dreamType) {
    res.status(400).json({
      success: false,
      error: 'characterId, deity, and dreamType are required'
    });
    return;
  }

  // Validate ObjectId before use
  if (!isValidObjectId(characterId)) {
    throw new AppError('Invalid characterId format', 400);
  }

  // Validate deity parameter
  if (deity !== 'GAMBLER' && deity !== 'OUTLAW_KING') {
    throw new AppError('Invalid deity. Use GAMBLER or OUTLAW_KING', 400);
  }

  // Validate dreamType is a non-empty string
  if (typeof dreamType !== 'string' || dreamType.trim().length === 0) {
    throw new AppError('Invalid dreamType format', 400);
  }

  const result = await deityDreamService.forceDream(
    characterId,
    deity as DeityName,
    dreamType as DreamType
  );

  if (!result) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate dream'
    });
    return;
  }

  res.json({
    success: true,
    dream: {
      deity: result.deity,
      dreamType: result.dreamType,
      message: result.message
    }
  });
});

export default {
  getStrangersAtLocation,
  getAllAvailableStrangers,
  startStrangerInteraction,
  completeStrangerInteraction,
  getActiveOmens,
  getOmenModifier,
  acknowledgeManifestation,
  getPendingManifestations,
  getAttentionStatus,
  getDreamInterpretation,
  adminSpawnStranger,
  adminForceOmen,
  adminForceDream
};
