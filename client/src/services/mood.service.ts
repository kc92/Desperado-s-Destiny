/**
 * Mood Service
 * API client for NPC mood system operations
 */

import { apiCall } from './api';
import type {
  NPCMoodState,
  MoodEffects,
  MoodFactor,
  MoodAffectingEvent,
  PlayerMoodAction,
  NPCPersonality,
} from '@desperados/shared';

/**
 * Response type for getNPCMood
 */
export interface GetNPCMoodResponse {
  moodState: NPCMoodState;
  effects: MoodEffects;
  personality: NPCPersonality | null;
}

/**
 * Response type for getLocationMoods
 */
export interface GetLocationMoodsResponse {
  locationId: string;
  npcs: Array<{
    npcId: string;
    name: string;
    role: string;
    mood: string;
    intensity: number;
    effects: MoodEffects;
  }>;
}

/**
 * Response type for applyMoodFactor, triggerEventMood, applyPlayerAction
 */
export interface MoodStateResponse {
  moodState: NPCMoodState;
  effects: MoodEffects;
}

/**
 * Response type for triggerEventMood
 */
export interface EventMoodResponse {
  affected: number;
  event: MoodAffectingEvent;
}

/**
 * Response type for updateAllMoods
 */
export interface UpdateAllMoodsResponse {
  updated: number;
}

/**
 * Response type for decayMoodFactors
 */
export interface DecayMoodFactorsResponse {
  decayed: number;
}

/**
 * Response type for getMoodDescription
 */
export interface MoodDescriptionResponse {
  description: string;
  mood: string;
  intensity: number;
}

/**
 * Get mood state for a specific NPC
 * GET /api/moods/npc/:npcId
 */
export async function getNPCMood(npcId: string): Promise<GetNPCMoodResponse> {
  return apiCall<GetNPCMoodResponse>('get', `/moods/npc/${npcId}`);
}

/**
 * Get moods for all NPCs in a location
 * GET /api/moods/location/:locationId
 */
export async function getLocationMoods(locationId: string): Promise<GetLocationMoodsResponse> {
  return apiCall<GetLocationMoodsResponse>('get', `/moods/location/${locationId}`);
}

/**
 * Get mood description for an NPC
 * GET /api/moods/description/:npcId
 */
export async function getMoodDescription(npcId: string): Promise<MoodDescriptionResponse> {
  return apiCall<MoodDescriptionResponse>('get', `/moods/description/${npcId}`);
}

/**
 * Apply a mood factor to an NPC
 * POST /api/moods/apply
 * Requires authentication
 */
export async function applyMoodFactor(
  npcId: string,
  factor: MoodFactor
): Promise<MoodStateResponse> {
  return apiCall<MoodStateResponse>('post', '/moods/apply', { npcId, factor });
}

/**
 * Trigger event-based mood changes
 * POST /api/moods/event
 * Requires authentication
 */
export async function triggerEventMood(event: MoodAffectingEvent): Promise<EventMoodResponse> {
  return apiCall<EventMoodResponse>('post', '/moods/event', event);
}

/**
 * Apply player action mood effect
 * POST /api/moods/player-action
 * Requires authentication
 */
export async function applyPlayerAction(action: PlayerMoodAction): Promise<MoodStateResponse> {
  return apiCall<MoodStateResponse>('post', '/moods/player-action', action);
}

/**
 * Update all NPC moods (batch operation)
 * POST /api/moods/update-all
 * Requires authentication
 */
export async function updateAllMoods(): Promise<UpdateAllMoodsResponse> {
  return apiCall<UpdateAllMoodsResponse>('post', '/moods/update-all');
}

/**
 * Decay mood factors (remove expired)
 * POST /api/moods/decay
 * Requires authentication
 */
export async function decayMoodFactors(): Promise<DecayMoodFactorsResponse> {
  return apiCall<DecayMoodFactorsResponse>('post', '/moods/decay');
}

/**
 * Default export - mood service object
 */
const moodService = {
  getNPCMood,
  getLocationMoods,
  getMoodDescription,
  applyMoodFactor,
  triggerEventMood,
  applyPlayerAction,
  updateAllMoods,
  decayMoodFactors,
};

export default moodService;
