/**
 * Raid Service
 * API client for raid-related endpoints (Phase 2.3)
 */

import apiClient from './api';
import type { ApiResponse } from '@/types';

export interface RaidTarget {
  id: string;
  name: string;
  type: string;
  ownerId: string;
  ownerName: string;
  gangId?: string;
  gangName?: string;
  defenseRating: number;
  estimatedLoot: number;
}

export interface Raid {
  _id: string;
  gangId: string;
  targetType: 'property' | 'treasury' | 'territory' | 'production';
  targetId: string;
  targetName: string;
  leaderId: string;
  participants: RaidParticipant[];
  status: 'planning' | 'scheduled' | 'executing' | 'completed' | 'failed' | 'cancelled';
  scheduledFor?: Date;
  executedAt?: Date;
  result?: RaidResult;
  createdAt: Date;
}

export interface RaidParticipant {
  characterId: string;
  characterName: string;
  role: 'leader' | 'muscle' | 'lookout' | 'specialist';
  joinedAt: Date;
}

export interface RaidResult {
  success: boolean;
  lootGained: number;
  damageDealt: number;
  casualties: number;
}

export interface PropertyDefense {
  propertyId: string;
  guards: Guard[];
  insuranceLevel: number;
  totalDefenseRating: number;
}

export interface Guard {
  _id: string;
  name: string;
  skillTier: number;
  hiredAt: Date;
  weeklyCost: number;
}

export interface RaidsSummary {
  totalRaids: number;
  successfulRaids: number;
  totalLoot: number;
  raidsDefended: number;
}

/**
 * Raid service for API calls
 */
export const raidService = {
  // ============================================================================
  // Raid Target Discovery
  // ============================================================================

  /**
   * Get available raid targets for a target type
   */
  getAvailableTargets: async (targetType: string, characterId: string) => {
    const response = await apiClient.get<ApiResponse<{ targets: RaidTarget[] }>>(
      `/raids/targets/${targetType}`,
      { params: { characterId } }
    );
    return response.data;
  },

  // ============================================================================
  // Raid Lifecycle
  // ============================================================================

  /**
   * Plan a new raid
   */
  planRaid: async (characterId: string, targetType: string, targetId: string) => {
    const response = await apiClient.post<ApiResponse<{ raid: Raid }>>(
      '/raids/plan',
      { characterId, targetType, targetId }
    );
    return response.data;
  },

  /**
   * Join an existing raid
   */
  joinRaid: async (raidId: string, characterId: string, role: string) => {
    const response = await apiClient.post<ApiResponse<{ raid: Raid }>>(
      `/raids/${raidId}/join`,
      { characterId, role }
    );
    return response.data;
  },

  /**
   * Schedule a raid for execution
   */
  scheduleRaid: async (raidId: string, characterId: string, scheduledFor: Date) => {
    const response = await apiClient.post<ApiResponse<{ raid: Raid }>>(
      `/raids/${raidId}/schedule`,
      { characterId, scheduledFor }
    );
    return response.data;
  },

  /**
   * Cancel a planned or scheduled raid
   */
  cancelRaid: async (raidId: string, characterId: string) => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `/raids/${raidId}/cancel`,
      { characterId }
    );
    return response.data;
  },

  /**
   * Execute a raid immediately
   */
  executeRaidNow: async (raidId: string, characterId: string) => {
    const response = await apiClient.post<ApiResponse<{ raid: Raid; result: RaidResult }>>(
      `/raids/${raidId}/execute`,
      { characterId }
    );
    return response.data;
  },

  // ============================================================================
  // Raid Queries
  // ============================================================================

  /**
   * Get active raids for the character's gang
   */
  getActiveRaids: async (characterId: string) => {
    const response = await apiClient.get<ApiResponse<{ raids: Raid[] }>>(
      '/raids/active',
      { params: { characterId } }
    );
    return response.data;
  },

  /**
   * Get raid history
   */
  getRaidHistory: async (characterId: string, limit: number = 20) => {
    const response = await apiClient.get<ApiResponse<{ raids: Raid[] }>>(
      '/raids/history',
      { params: { characterId, limit } }
    );
    return response.data;
  },

  /**
   * Get gang raids summary statistics
   */
  getGangRaidsSummary: async (characterId: string) => {
    const response = await apiClient.get<ApiResponse<{ summary: RaidsSummary }>>(
      '/raids/summary',
      { params: { characterId } }
    );
    return response.data;
  },

  /**
   * Get raid details by ID
   */
  getRaidDetails: async (raidId: string) => {
    const response = await apiClient.get<ApiResponse<{ raid: Raid }>>(
      `/raids/${raidId}`
    );
    return response.data;
  },

  // ============================================================================
  // Property Defense Management
  // ============================================================================

  /**
   * Get property defense details
   */
  getPropertyDefense: async (propertyId: string) => {
    const response = await apiClient.get<ApiResponse<{ defense: PropertyDefense }>>(
      `/raids/properties/${propertyId}/defense`
    );
    return response.data;
  },

  /**
   * Hire a guard for a property
   */
  hireGuard: async (propertyId: string, characterId: string, guardName: string, skillTier: number) => {
    const response = await apiClient.post<ApiResponse<{ guard: Guard; defense: PropertyDefense }>>(
      `/raids/properties/${propertyId}/guards`,
      { characterId, guardName, skillTier }
    );
    return response.data;
  },

  /**
   * Fire a guard from a property
   */
  fireGuard: async (propertyId: string, guardId: string, characterId: string) => {
    const response = await apiClient.delete<ApiResponse<{ defense: PropertyDefense }>>(
      `/raids/properties/${propertyId}/guards/${guardId}`,
      { data: { characterId } }
    );
    return response.data;
  },

  /**
   * Set property insurance level
   */
  setInsurance: async (propertyId: string, characterId: string, level: number) => {
    const response = await apiClient.put<ApiResponse<{ defense: PropertyDefense }>>(
      `/raids/properties/${propertyId}/insurance`,
      { characterId, level }
    );
    return response.data;
  },
};

export default raidService;
