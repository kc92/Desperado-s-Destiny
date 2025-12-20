/**
 * Reputation Spreading Service
 * API client for reputation spreading endpoints
 * Part of Phase 3, Wave 3.2 - Reputation Spreading System
 */

import apiClient from './api';
import type { ApiResponse } from '@/types';
import type {
  ReputationEvent,
  ReputationEventType,
  ReputationModifier,
  LocationReputation,
  SpreadResult,
  GetNPCKnowledgeResponse,
} from '@desperados/shared';

/**
 * NPC knowledge summary for listing
 */
export interface NPCKnowledgeSummary {
  npcId: string;
  overallOpinion: number;
  trustLevel: number;
  fearLevel: number;
  respectLevel: number;
  eventsKnown: number;
  lastUpdated: Date;
}

/**
 * Request body for creating reputation events
 */
export interface CreateEventRequestBody {
  characterId: string;
  eventType: ReputationEventType;
  magnitude: number;
  sentiment: number;
  locationId: string;
  originNpcId?: string;
  faction?: string;
  description?: string;
}

/**
 * Reputation spreading service for API calls
 */
export const reputationSpreadingService = {
  /**
   * Get player's overall reputation in a location
   * GET /api/reputation-spreading/:characterId
   */
  getPlayerReputation: async (characterId: string, locationId?: string) => {
    const params = locationId ? { locationId } : undefined;
    const response = await apiClient.get<ApiResponse<{ reputation: LocationReputation }>>(
      `/reputation-spreading/${characterId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Get what an NPC knows about a player
   * GET /api/reputation-spreading/npc/:npcId/:characterId
   */
  getNPCKnowledge: async (npcId: string, characterId: string) => {
    const response = await apiClient.get<ApiResponse<GetNPCKnowledgeResponse>>(
      `/reputation-spreading/npc/${npcId}/${characterId}`
    );
    return response.data;
  },

  /**
   * Get reputation modifier for NPC interactions
   * GET /api/reputation-spreading/modifier/:npcId/:characterId
   */
  getReputationModifier: async (npcId: string, characterId: string) => {
    const response = await apiClient.get<ApiResponse<{ modifier: ReputationModifier }>>(
      `/reputation-spreading/modifier/${npcId}/${characterId}`
    );
    return response.data;
  },

  /**
   * Get all NPCs who know about a character
   * GET /api/reputation-spreading/knowledgeable/:characterId
   */
  getKnowledgeableNPCs: async (characterId: string) => {
    const response = await apiClient.get<ApiResponse<{ npcs: NPCKnowledgeSummary[]; total: number }>>(
      `/reputation-spreading/knowledgeable/${characterId}`
    );
    return response.data;
  },

  /**
   * Get reputation events for a character
   * GET /api/reputation-spreading/events/:characterId
   */
  getReputationEvents: async (characterId: string, locationId?: string, limit: number = 20) => {
    const params: { locationId?: string; limit: number } = { limit };
    if (locationId) {
      params.locationId = locationId;
    }
    const response = await apiClient.get<ApiResponse<{ events: ReputationEvent[]; total: number }>>(
      `/reputation-spreading/events/${characterId}`,
      { params }
    );
    return response.data;
  },

  /**
   * Create a new reputation event (manual/testing)
   * POST /api/reputation-spreading/event
   */
  createReputationEvent: async (eventData: CreateEventRequestBody) => {
    const response = await apiClient.post<
      ApiResponse<{
        event: ReputationEvent;
        spreadResult: SpreadResult;
        message: string;
      }>
    >(
      '/reputation-spreading/event',
      eventData
    );
    return response.data;
  },

  /**
   * Manually trigger spreading of an event (admin only)
   * POST /api/reputation-spreading/spread/:eventId
   */
  spreadReputationEvent: async (eventId: string) => {
    const response = await apiClient.post<
      ApiResponse<{
        spreadResult: SpreadResult;
        message: string;
      }>
    >(
      `/reputation-spreading/spread/${eventId}`
    );
    return response.data;
  },

  /**
   * Cleanup expired events (admin/cron)
   * POST /api/reputation-spreading/cleanup
   */
  cleanupExpiredEvents: async () => {
    const response = await apiClient.post<
      ApiResponse<{
        deletedCount: number;
        message: string;
      }>
    >(
      '/reputation-spreading/cleanup'
    );
    return response.data;
  },

  /**
   * Decay old events (admin/cron)
   * POST /api/reputation-spreading/decay
   */
  decayOldEvents: async () => {
    const response = await apiClient.post<
      ApiResponse<{
        decayedCount: number;
        message: string;
      }>
    >(
      '/reputation-spreading/decay'
    );
    return response.data;
  },
};

export default reputationSpreadingService;
