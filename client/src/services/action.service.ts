/**
 * Action Service
 * API client for action-related endpoints
 */

import apiClient from './api';
import type { ApiResponse } from '@/types';
import type { Action, ActionResult, ActionType } from '@desperados/shared';
import { logger } from '@/services/logger.service';

interface GetActionsResponse {
  actions: Action[];
}

interface GetActionResponse {
  action: Action;
}

interface AttemptChallengeRequest {
  actionId: string;
  characterId: string;
}

interface AttemptChallengeResponse {
  result: ActionResult;
}

interface GetActionHistoryResponse {
  history: ActionResult[];
  total: number;
}

/**
 * Response for filtered location actions
 * Phase 7: Location-Specific Actions System
 */
interface FilteredLocationActionsResponse {
  actions: {
    crimes: Action[];
    combat: Action[];
    craft: Action[];
    social: Action[];
    global: Action[];
  };
  location: {
    id: string;
    name: string;
    type: string;
  } | null;
  totalCount: number;
}

/**
 * Action Service - Handles all action-related API calls
 */
export const actionService = {
  /**
   * Get all available actions (optionally filtered by type or location)
   */
  async getActions(filters?: {
    type?: ActionType;
    locationId?: string;
    minLevel?: number;
  }): Promise<ApiResponse<GetActionsResponse>> {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.locationId) params.append('locationId', filters.locationId);
      if (filters?.minLevel !== undefined) params.append('minLevel', filters.minLevel.toString());

      const queryString = params.toString();
      const url = `/actions${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<ApiResponse<GetActionsResponse>>(url);
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get actions', error as Error, { context: 'actionService.getActions', filters });
      return {
        success: false,
        error: error.message || 'Failed to load actions',
      };
    }
  },

  /**
   * Get a specific action by ID
   */
  async getAction(actionId: string): Promise<ApiResponse<GetActionResponse>> {
    try {
      const response = await apiClient.get<ApiResponse<GetActionResponse>>(
        `/actions/${actionId}`
      );
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get action', error as Error, { context: 'actionService.getAction', actionId });
      return {
        success: false,
        error: error.message || 'Failed to load action',
      };
    }
  },

  /**
   * Attempt an action challenge (draw cards and resolve)
   */
  async attemptChallenge(
    actionId: string,
    characterId: string
  ): Promise<ApiResponse<AttemptChallengeResponse>> {
    try {
      const requestData: AttemptChallengeRequest = {
        actionId,
        characterId,
      };

      const response = await apiClient.post<ApiResponse<AttemptChallengeResponse>>(
        '/actions/challenge',
        requestData
      );
      return response.data;
    } catch (error: any) {
      logger.error('Failed to attempt challenge', error as Error, { context: 'actionService.attemptChallenge', actionId, characterId });
      return {
        success: false,
        error: error.message || 'Failed to attempt action',
      };
    }
  },

  /**
   * Get action history for a character
   */
  async getActionHistory(
    characterId: string,
    filters?: {
      actionType?: ActionType;
      success?: boolean;
      limit?: number;
      skip?: number;
    }
  ): Promise<ApiResponse<GetActionHistoryResponse>> {
    try {
      const params = new URLSearchParams();
      params.append('characterId', characterId);
      if (filters?.actionType) params.append('actionType', filters.actionType);
      if (filters?.success !== undefined) params.append('success', filters.success.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.skip) params.append('skip', filters.skip.toString());

      const queryString = params.toString();
      const url = `/actions/history?${queryString}`;

      const response = await apiClient.get<ApiResponse<GetActionHistoryResponse>>(url);
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get action history', error as Error, { context: 'actionService.getActionHistory', characterId, filters });
      return {
        success: false,
        error: error.message || 'Failed to load action history',
      };
    }
  },

  /**
   * Get filtered actions at current location
   * Returns actions categorized by type (crimes, combat, craft, social, global)
   * Crimes are filtered by character's CUNNING skill level
   *
   * Phase 7: Location-Specific Actions System
   */
  async getFilteredLocationActions(): Promise<ApiResponse<FilteredLocationActionsResponse>> {
    try {
      const response = await apiClient.get<ApiResponse<FilteredLocationActionsResponse>>(
        '/locations/current/actions/filtered'
      );
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get filtered location actions', error as Error, { context: 'actionService.getFilteredLocationActions' });
      return {
        success: false,
        error: error.message || 'Failed to load location actions',
      };
    }
  },
};

export default actionService;
