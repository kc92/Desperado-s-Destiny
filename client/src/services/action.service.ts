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
 * All methods support AbortSignal for request cancellation
 */
export const actionService = {
  /**
   * Get all available actions (optionally filtered by type or location)
   * @param filters - Optional filters for action type, location, and minimum level
   * @param signal - Optional AbortSignal for request cancellation
   */
  async getActions(filters?: {
    type?: ActionType;
    locationId?: string;
    minLevel?: number;
  }, signal?: AbortSignal): Promise<ApiResponse<GetActionsResponse>> {
    try {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.locationId) params.append('locationId', filters.locationId);
      if (filters?.minLevel !== undefined) params.append('minLevel', filters.minLevel.toString());

      const queryString = params.toString();
      const url = `/actions${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<ApiResponse<GetActionsResponse>>(url, { signal });
      return response.data;
    } catch (error: any) {
      // Don't log abort errors - they're expected during cleanup
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }
      logger.error('Failed to get actions', error as Error, { context: 'actionService.getActions', filters });
      return {
        success: false,
        error: error.message || 'Failed to load actions',
      };
    }
  },

  /**
   * Get a specific action by ID
   * @param actionId - The action ID to fetch
   * @param signal - Optional AbortSignal for request cancellation
   */
  async getAction(actionId: string, signal?: AbortSignal): Promise<ApiResponse<GetActionResponse>> {
    try {
      const response = await apiClient.get<ApiResponse<GetActionResponse>>(
        `/actions/${actionId}`,
        { signal }
      );
      return response.data;
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }
      logger.error('Failed to get action', error as Error, { context: 'actionService.getAction', actionId });
      return {
        success: false,
        error: error.message || 'Failed to load action',
      };
    }
  },

  /**
   * Attempt an action challenge (draw cards and resolve)
   * @param actionId - The action to attempt
   * @param characterId - The character performing the action
   * @param signal - Optional AbortSignal for request cancellation
   */
  async attemptChallenge(
    actionId: string,
    characterId: string,
    signal?: AbortSignal
  ): Promise<ApiResponse<AttemptChallengeResponse>> {
    try {
      const requestData: AttemptChallengeRequest = {
        actionId,
        characterId,
      };

      const response = await apiClient.post<ApiResponse<AttemptChallengeResponse>>(
        '/actions/challenge',
        requestData,
        { signal }
      );
      return response.data;
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }
      logger.error('Failed to attempt challenge', error as Error, { context: 'actionService.attemptChallenge', actionId, characterId });
      return {
        success: false,
        error: error.message || 'Failed to attempt action',
      };
    }
  },

  /**
   * Get action history for a character
   * @param characterId - The character whose history to fetch
   * @param filters - Optional filters for action type, success, and pagination
   * @param signal - Optional AbortSignal for request cancellation
   */
  async getActionHistory(
    characterId: string,
    filters?: {
      actionType?: ActionType;
      success?: boolean;
      limit?: number;
      skip?: number;
    },
    signal?: AbortSignal
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

      const response = await apiClient.get<ApiResponse<GetActionHistoryResponse>>(url, { signal });
      return response.data;
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }
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
   * @param signal - Optional AbortSignal for request cancellation
   */
  async getFilteredLocationActions(signal?: AbortSignal): Promise<ApiResponse<FilteredLocationActionsResponse>> {
    try {
      const response = await apiClient.get<ApiResponse<FilteredLocationActionsResponse>>(
        '/locations/current/actions/filtered',
        { signal }
      );
      return response.data;
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        return { success: false, error: 'Request cancelled' };
      }
      logger.error('Failed to get filtered location actions', error as Error, { context: 'actionService.getFilteredLocationActions' });
      return {
        success: false,
        error: error.message || 'Failed to load location actions',
      };
    }
  },
};

export default actionService;
