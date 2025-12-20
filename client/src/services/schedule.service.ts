/**
 * Schedule Service
 * API client for NPC schedule and location tracking operations
 */

import apiClient from './api';
import type { ApiResponse } from '@desperados/shared';
import type {
  NPCSchedule,
  NPCActivityState,
  NPCActivity,
  GetNPCsAtLocationResponse,
  GetNPCScheduleResponse,
  GetCurrentActivityResponse,
  CheckNPCAvailabilityResponse,
  GetAllNPCLocationsResponse,
  NPCInteractionContext,
} from '@desperados/shared';

/**
 * Response type for activity statistics
 */
export interface ActivityStatistics {
  currentHour: number;
  totalNPCs: number;
  byActivity: {
    [key: string]: {
      count: number;
      npcs: string[];
    };
  };
  byLocation: {
    [key: string]: {
      locationName: string;
      npcCount: number;
    };
  };
}

/**
 * Response type for NPCs by activity
 */
export interface NPCsByActivityResponse {
  activityType: NPCActivity;
  currentHour: number;
  npcs: NPCActivityState[];
  totalCount: number;
}

/**
 * Response type for NPC interaction context
 */
export interface NPCInteractionContextResponse {
  context: NPCInteractionContext;
  reputation: number;
  relationshipLevel: string;
}

/**
 * Response type for all schedules
 */
export interface AllSchedulesResponse {
  schedules: NPCSchedule[];
  totalCount: number;
}

/**
 * Schedule Service
 * Handles all NPC schedule and location tracking API calls
 */
export const scheduleService = {
  /**
   * Get all NPCs currently at a specific location
   * @param locationId - The location ID to check
   * @param hour - Optional specific hour to check (0-23)
   */
  async getNPCsAtLocation(
    locationId: string,
    hour?: number
  ): Promise<ApiResponse<GetNPCsAtLocationResponse['data']>> {
    try {
      const params = new URLSearchParams();
      if (hour !== undefined) params.append('hour', hour.toString());

      const url = `/schedule/location/${locationId}${
        params.toString() ? `?${params}` : ''
      }`;
      const response = await apiClient.get<
        ApiResponse<GetNPCsAtLocationResponse['data']>
      >(url);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch NPCs at location',
      };
    }
  },

  /**
   * Get complete schedule for a specific NPC
   * @param npcId - The NPC ID
   * @param includeNext - Include upcoming activities
   */
  async getNPCSchedule(
    npcId: string,
    includeNext?: boolean
  ): Promise<ApiResponse<GetNPCScheduleResponse['data']>> {
    try {
      const params = new URLSearchParams();
      if (includeNext !== undefined)
        params.append('includeNext', includeNext.toString());

      const url = `/schedule/npc/${npcId}${
        params.toString() ? `?${params}` : ''
      }`;
      const response = await apiClient.get<
        ApiResponse<GetNPCScheduleResponse['data']>
      >(url);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch NPC schedule',
      };
    }
  },

  /**
   * Get current activity for a specific NPC
   * @param npcId - The NPC ID
   * @param hour - Optional specific hour to check (0-23)
   */
  async getCurrentActivity(
    npcId: string,
    hour?: number
  ): Promise<ApiResponse<GetCurrentActivityResponse['data']>> {
    try {
      const params = new URLSearchParams();
      if (hour !== undefined) params.append('hour', hour.toString());

      const url = `/schedule/npc/${npcId}/current${
        params.toString() ? `?${params}` : ''
      }`;
      const response = await apiClient.get<
        ApiResponse<GetCurrentActivityResponse['data']>
      >(url);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch current activity',
      };
    }
  },

  /**
   * Check if NPC is available for interaction
   * @param npcId - The NPC ID
   * @param hour - Optional specific hour to check (0-23)
   */
  async checkNPCAvailability(
    npcId: string,
    hour?: number
  ): Promise<ApiResponse<CheckNPCAvailabilityResponse['data']>> {
    try {
      const params = new URLSearchParams();
      if (hour !== undefined) params.append('hour', hour.toString());

      const url = `/schedule/npc/${npcId}/available${
        params.toString() ? `?${params}` : ''
      }`;
      const response = await apiClient.get<
        ApiResponse<CheckNPCAvailabilityResponse['data']>
      >(url);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to check NPC availability',
      };
    }
  },

  /**
   * Get interaction context for an NPC (dialogue suggestions)
   * @param npcId - The NPC ID
   * @param reputation - Player's reputation with NPC (0-100, default 50)
   */
  async getNPCInteractionContext(
    npcId: string,
    reputation?: number
  ): Promise<ApiResponse<NPCInteractionContextResponse>> {
    try {
      const params = new URLSearchParams();
      if (reputation !== undefined)
        params.append('reputation', reputation.toString());

      const url = `/schedule/npc/${npcId}/interaction${
        params.toString() ? `?${params}` : ''
      }`;
      const response = await apiClient.get<
        ApiResponse<NPCInteractionContextResponse>
      >(url);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch interaction context',
      };
    }
  },

  /**
   * Get all NPC locations at current time
   * @param hour - Optional specific hour to check (0-23)
   * @param location - Optional location filter
   * @param activity - Optional activity filter
   */
  async getAllNPCLocations(
    hour?: number,
    location?: string,
    activity?: NPCActivity
  ): Promise<ApiResponse<GetAllNPCLocationsResponse['data']>> {
    try {
      const params = new URLSearchParams();
      if (hour !== undefined) params.append('hour', hour.toString());
      if (location) params.append('location', location);
      if (activity) params.append('activity', activity);

      const url = `/schedule/locations${
        params.toString() ? `?${params}` : ''
      }`;
      const response = await apiClient.get<
        ApiResponse<GetAllNPCLocationsResponse['data']>
      >(url);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch NPC locations',
      };
    }
  },

  /**
   * Get all NPCs performing a specific activity
   * @param activityType - The activity type to filter by
   * @param hour - Optional specific hour to check (0-23)
   */
  async getNPCsByActivity(
    activityType: NPCActivity,
    hour?: number
  ): Promise<ApiResponse<NPCsByActivityResponse>> {
    try {
      const params = new URLSearchParams();
      if (hour !== undefined) params.append('hour', hour.toString());

      const url = `/schedule/activity/${activityType}${
        params.toString() ? `?${params}` : ''
      }`;
      const response = await apiClient.get<ApiResponse<NPCsByActivityResponse>>(
        url
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch NPCs by activity',
      };
    }
  },

  /**
   * Get activity statistics for current hour
   * @param hour - Optional specific hour to check (0-23)
   */
  async getActivityStatistics(
    hour?: number
  ): Promise<ApiResponse<ActivityStatistics>> {
    try {
      const params = new URLSearchParams();
      if (hour !== undefined) params.append('hour', hour.toString());

      const url = `/schedule/statistics${
        params.toString() ? `?${params}` : ''
      }`;
      const response = await apiClient.get<ApiResponse<ActivityStatistics>>(
        url
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch activity statistics',
      };
    }
  },

  /**
   * Get all NPC schedules (admin/debug)
   * WARNING: This endpoint may return large amounts of data
   */
  async getAllSchedules(): Promise<ApiResponse<AllSchedulesResponse>> {
    try {
      const response = await apiClient.get<ApiResponse<AllSchedulesResponse>>(
        '/schedule/all'
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch all schedules',
      };
    }
  },
};

// Named exports for individual functions
export const getNPCsAtLocation = scheduleService.getNPCsAtLocation;
export const getNPCSchedule = scheduleService.getNPCSchedule;
export const getCurrentActivity = scheduleService.getCurrentActivity;
export const checkNPCAvailability = scheduleService.checkNPCAvailability;
export const getNPCInteractionContext = scheduleService.getNPCInteractionContext;
export const getAllNPCLocations = scheduleService.getAllNPCLocations;
export const getNPCsByActivity = scheduleService.getNPCsByActivity;
export const getActivityStatistics = scheduleService.getActivityStatistics;
export const getAllSchedules = scheduleService.getAllSchedules;

// Default export
export default scheduleService;
