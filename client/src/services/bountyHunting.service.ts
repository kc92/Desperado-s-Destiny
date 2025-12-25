/**
 * Bounty Hunting Service
 * API client for bounty hunting endpoints (Sprint 7)
 */

import apiClient from './api';
import type { ApiResponse } from '@/types';

export interface BountyTarget {
  targetId: string;
  name: string;
  alias?: string;
  description: string;
  tier: 'low' | 'medium' | 'high' | 'legendary';
  reward: number;
  difficulty: number;
  lastSeenLocation?: string;
  crimes: string[];
  dangerLevel: number;
}

export interface ActiveHunt {
  _id: string;
  characterId: string;
  targetId: string;
  targetName: string;
  tier: string;
  reward: number;
  trackingProgress: number;
  trackingRequired: number;
  status: 'tracking' | 'located' | 'confronting' | 'completed' | 'failed' | 'abandoned';
  startedAt: Date;
  locatedAt?: Date;
  completedAt?: Date;
}

export interface HuntResult {
  success: boolean;
  method: 'fight' | 'negotiate' | 'ambush';
  reward?: number;
  xpGained?: number;
  injuries?: number;
  targetEscaped?: boolean;
  message: string;
}

export interface BountyHuntingStats {
  totalHunts: number;
  successfulHunts: number;
  failedHunts: number;
  abandonedHunts: number;
  totalRewards: number;
  averageTrackingTime: number;
  preferredMethod: string;
  highestTierCompleted: string;
}

export interface HuntHistory {
  _id: string;
  targetName: string;
  tier: string;
  reward: number;
  method?: string;
  success: boolean;
  startedAt: Date;
  completedAt: Date;
}

/**
 * Bounty Hunting service for API calls
 */
export const bountyHuntingService = {
  /**
   * Get available bounties and current hunt status
   */
  getAvailableBounties: async (characterId: string) => {
    const response = await apiClient.get<ApiResponse<{
      bounties: BountyTarget[];
      activeHunt: ActiveHunt | null;
      canAcceptNew: boolean;
    }>>(
      `/bounty-hunting/available/${characterId}`
    );
    return response.data;
  },

  /**
   * Accept a bounty and start hunting
   */
  acceptBounty: async (characterId: string, targetId: string) => {
    const response = await apiClient.post<ApiResponse<{ hunt: ActiveHunt }>>(
      '/bounty-hunting/accept',
      { characterId, targetId }
    );
    return response.data;
  },

  /**
   * Progress tracking on current bounty (costs energy)
   */
  progressTracking: async (characterId: string) => {
    const response = await apiClient.post<ApiResponse<{
      hunt: ActiveHunt;
      progressGained: number;
      clueFound?: string;
      energyCost: number;
    }>>(
      '/bounty-hunting/track',
      { characterId }
    );
    return response.data;
  },

  /**
   * Confront the bounty target
   */
  confrontTarget: async (characterId: string, method: 'fight' | 'negotiate' | 'ambush') => {
    const response = await apiClient.post<ApiResponse<{ hunt: ActiveHunt; result: HuntResult }>>(
      '/bounty-hunting/confront',
      { characterId, method }
    );
    return response.data;
  },

  /**
   * Abandon current bounty hunt
   */
  abandonHunt: async (characterId: string) => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/bounty-hunting/abandon',
      { characterId }
    );
    return response.data;
  },

  /**
   * Get bounty hunting history
   */
  getHuntHistory: async (characterId: string, limit: number = 20) => {
    const response = await apiClient.get<ApiResponse<{ history: HuntHistory[] }>>(
      `/bounty-hunting/history/${characterId}`,
      { params: { limit } }
    );
    return response.data;
  },

  /**
   * Get bounty hunting statistics
   */
  getStatistics: async (characterId: string) => {
    const response = await apiClient.get<ApiResponse<{ stats: BountyHuntingStats }>>(
      `/bounty-hunting/stats/${characterId}`
    );
    return response.data;
  },
};

export default bountyHuntingService;
