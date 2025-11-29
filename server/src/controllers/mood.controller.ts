/**
 * Mood Controller
 *
 * Handles HTTP requests for NPC mood system
 */

import { Request, Response } from 'express';
import { MoodService } from '../services/mood.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { AppError } from '../utils/errors';
import { MoodFactor, MoodAffectingEvent, PlayerMoodAction } from '@desperados/shared';
import { getNPCPersonality } from '../data/npcPersonalities';

/**
 * Get mood state for a specific NPC
 * GET /api/moods/npc/:npcId
 */
export const getNPCMood = asyncHandler(async (req: Request, res: Response) => {
  const { npcId } = req.params;

  const moodState = await MoodService.getNPCMood(npcId);
  const effects = MoodService.getMoodEffects(moodState.currentMood, moodState.moodIntensity);
  const personality = getNPCPersonality(npcId);

  res.status(200).json({
    success: true,
    data: {
      moodState,
      effects,
      personality: personality || null,
    },
  });
});

/**
 * Get moods for all NPCs in a location
 * GET /api/moods/location/:locationId
 */
export const getLocationMoods = asyncHandler(async (req: Request, res: Response) => {
  const { locationId } = req.params;

  // For now, return moods for predefined NPCs
  // In production, query NPCs by location from database
  const npcIds = [
    'general_store_01',
    'bartender_01',
    'sheriff_01',
    'blacksmith_01',
  ];

  const npcs = await Promise.all(
    npcIds.map(async (npcId) => {
      const moodState = await MoodService.getNPCMood(npcId);
      const effects = MoodService.getMoodEffects(moodState.currentMood, moodState.moodIntensity);
      const personality = getNPCPersonality(npcId);

      return {
        npcId,
        name: personality?.name || 'Unknown NPC',
        role: personality?.role || 'unknown',
        mood: moodState.currentMood,
        intensity: moodState.moodIntensity,
        effects,
      };
    })
  );

  res.status(200).json({
    success: true,
    data: {
      locationId,
      npcs,
    },
  });
});

/**
 * Apply a mood factor to an NPC
 * POST /api/moods/apply
 */
export const applyMoodFactor = asyncHandler(async (req: Request, res: Response) => {
  const { npcId, factor } = req.body as { npcId: string; factor: MoodFactor };

  if (!npcId || !factor) {
    throw new AppError('Missing required fields: npcId and factor', 400);
  }

  const moodState = await MoodService.applyMoodFactor(npcId, factor);
  const effects = MoodService.getMoodEffects(moodState.currentMood, moodState.moodIntensity);

  res.status(200).json({
    success: true,
    data: {
      moodState,
      effects,
    },
  });
});

/**
 * Trigger event-based mood changes
 * POST /api/moods/event
 */
export const triggerEventMood = asyncHandler(async (req: Request, res: Response) => {
  const event = req.body as MoodAffectingEvent;

  if (!event.eventType || !event.locationId || !event.triggeredMood) {
    throw new AppError('Missing required event fields', 400);
  }

  const result = await MoodService.reactToEvent(event);

  res.status(200).json({
    success: true,
    data: {
      affected: result.affected,
      event,
    },
  });
});

/**
 * Apply player action mood effect
 * POST /api/moods/player-action
 */
export const applyPlayerAction = asyncHandler(async (req: Request, res: Response) => {
  const action = req.body as PlayerMoodAction;

  if (!action.characterId || !action.npcId || !action.actionType) {
    throw new AppError('Missing required action fields', 400);
  }

  const moodState = await MoodService.applyPlayerAction(action);
  const effects = MoodService.getMoodEffects(moodState.currentMood, moodState.moodIntensity);

  res.status(200).json({
    success: true,
    data: {
      moodState,
      effects,
    },
  });
});

/**
 * Update all NPC moods (batch operation)
 * POST /api/moods/update-all
 */
export const updateAllMoods = asyncHandler(async (req: Request, res: Response) => {
  const result = await MoodService.updateWorldMoods();

  res.status(200).json({
    success: true,
    data: {
      updated: result.updated,
    },
  });
});

/**
 * Decay mood factors (remove expired)
 * POST /api/moods/decay
 */
export const decayMoodFactors = asyncHandler(async (req: Request, res: Response) => {
  const result = await MoodService.decayMoodFactors();

  res.status(200).json({
    success: true,
    data: {
      decayed: result.decayed,
    },
  });
});

/**
 * Get mood description for an NPC
 * GET /api/moods/description/:npcId
 */
export const getMoodDescription = asyncHandler(async (req: Request, res: Response) => {
  const { npcId } = req.params;

  const moodState = await MoodService.getNPCMood(npcId);
  const personality = getNPCPersonality(npcId);
  const description = MoodService.getMoodDescription(
    moodState.currentMood,
    moodState.moodIntensity,
    personality?.name || 'The NPC'
  );

  res.status(200).json({
    success: true,
    data: {
      description,
      mood: moodState.currentMood,
      intensity: moodState.moodIntensity,
    },
  });
});
