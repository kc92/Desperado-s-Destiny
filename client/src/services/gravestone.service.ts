/**
 * Gravestone Service
 * API client for gravestone and inheritance operations
 */

import { api } from './api';
import { logger } from './logger.service';
import {
  Gravestone,
  InheritanceClaimResult,
  InheritanceTier,
} from '@desperados/shared';

export interface GravestoneListResult {
  success: boolean;
  gravestones: Gravestone[];
  total: number;
  message?: string;
}

export interface GravestoneResult {
  success: boolean;
  gravestone: Gravestone | null;
  message?: string;
}

export interface GraveyardStatsResult {
  success: boolean;
  stats: {
    totalDeadCharacters: number;
    claimedInheritances: number;
    unclaimedInheritances: number;
    totalGoldInherited: number;
    highestLevelDeath: number;
  };
  message?: string;
}

export interface InheritancePreviewResult {
  success: boolean;
  preview: {
    goldPool: number;
    heirloomCount: number;
    skillCount: number;
    prestigeBonus: number;
    ancestorName: string;
    ancestorLevel: number;
    epitaph: string;
  } | null;
  message?: string;
}

class GravestoneService {
  /**
   * Get gravestones at a specific location
   */
  async getGravestonesAtLocation(locationId: string, limit: number = 10): Promise<GravestoneListResult> {
    try {
      const response = await api.get<{
        data: {
          gravestones: Gravestone[];
          total: number;
        }
      }>(`/gravestones/location/${locationId}?limit=${limit}`);

      return {
        success: true,
        gravestones: response.data.data.gravestones || [],
        total: response.data.data.total || 0,
      };
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch gravestones';
      logger.error('[GravestoneService] getGravestonesAtLocation error:', err as Error, {
        context: { locationId, limit, message },
      });
      return {
        success: false,
        gravestones: [],
        total: 0,
        message,
      };
    }
  }

  /**
   * Get user's gravestones (their dead characters)
   */
  async getUserGravestones(): Promise<GravestoneListResult> {
    try {
      const response = await api.get<{
        data: {
          gravestones: Gravestone[];
          total: number;
        }
      }>('/gravestones/mine');

      return {
        success: true,
        gravestones: response.data.data.gravestones || [],
        total: response.data.data.total || 0,
      };
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch your gravestones';
      logger.error('[GravestoneService] getUserGravestones error:', err as Error, {
        context: { message },
      });
      return {
        success: false,
        gravestones: [],
        total: 0,
        message,
      };
    }
  }

  /**
   * Get unclaimed gravestones for the user
   */
  async getUnclaimedGravestones(): Promise<GravestoneListResult> {
    try {
      const response = await api.get<{
        data: {
          gravestones: Gravestone[];
          total: number;
        }
      }>('/gravestones/unclaimed');

      return {
        success: true,
        gravestones: response.data.data.gravestones || [],
        total: response.data.data.total || 0,
      };
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch unclaimed gravestones';
      logger.error('[GravestoneService] getUnclaimedGravestones error:', err as Error, {
        context: { message },
      });
      return {
        success: false,
        gravestones: [],
        total: 0,
        message,
      };
    }
  }

  /**
   * Get a specific gravestone by ID
   */
  async getGravestone(gravestoneId: string): Promise<GravestoneResult> {
    try {
      const response = await api.get<{
        data: {
          gravestone: Gravestone;
        }
      }>(`/gravestones/${gravestoneId}`);

      return {
        success: true,
        gravestone: response.data.data.gravestone,
      };
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch gravestone';
      logger.error('[GravestoneService] getGravestone error:', err as Error, {
        context: { gravestoneId, message },
      });
      return {
        success: false,
        gravestone: null,
        message,
      };
    }
  }

  /**
   * Get inheritance preview for a gravestone
   */
  async getInheritancePreview(gravestoneId: string): Promise<InheritancePreviewResult> {
    try {
      const response = await api.get<{
        data: {
          preview: InheritancePreviewResult['preview'];
        }
      }>(`/gravestones/${gravestoneId}/preview`);

      return {
        success: true,
        preview: response.data.data.preview,
      };
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch inheritance preview';
      logger.error('[GravestoneService] getInheritancePreview error:', err as Error, {
        context: { gravestoneId, message },
      });
      return {
        success: false,
        preview: null,
        message,
      };
    }
  }

  /**
   * Claim inheritance from a gravestone
   */
  async claimInheritance(gravestoneId: string): Promise<InheritanceClaimResult> {
    try {
      const response = await api.post<{
        data: InheritanceClaimResult;
      }>(`/gravestones/${gravestoneId}/claim`);

      return response.data.data;
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to claim inheritance';
      logger.error('[GravestoneService] claimInheritance error:', err as Error, {
        context: { gravestoneId, message },
      });
      return {
        success: false,
        tier: InheritanceTier.MEAGER,
        goldReceived: 0,
        heirlooms: [],
        skillBoosts: {},
        destinyHand: [],
        message,
      };
    }
  }

  /**
   * Get graveyard statistics for the user
   */
  async getGraveyardStats(): Promise<GraveyardStatsResult> {
    try {
      const response = await api.get<{
        data: GraveyardStatsResult['stats'];
      }>('/gravestones/stats');

      return {
        success: true,
        stats: response.data.data,
      };
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch graveyard stats';
      logger.error('[GravestoneService] getGraveyardStats error:', err as Error, {
        context: { message },
      });
      return {
        success: false,
        stats: {
          totalDeadCharacters: 0,
          claimedInheritances: 0,
          unclaimedInheritances: 0,
          totalGoldInherited: 0,
          highestLevelDeath: 0,
        },
        message,
      };
    }
  }

  /**
   * Get recent deaths for world news
   */
  async getRecentDeaths(limit: number = 20): Promise<GravestoneListResult> {
    try {
      const response = await api.get<{
        data: {
          gravestones: Gravestone[];
          total: number;
        }
      }>(`/gravestones/recent?limit=${limit}`);

      return {
        success: true,
        gravestones: response.data.data.gravestones || [],
        total: response.data.data.total || 0,
      };
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Failed to fetch recent deaths';
      logger.error('[GravestoneService] getRecentDeaths error:', err as Error, {
        context: { limit, message },
      });
      return {
        success: false,
        gravestones: [],
        total: 0,
        message,
      };
    }
  }

  /**
   * Check if current character can claim a gravestone
   */
  async canClaimGravestone(gravestoneId: string): Promise<{ canClaim: boolean; reason?: string }> {
    try {
      const response = await api.get<{
        data: {
          canClaim: boolean;
          reason?: string;
        }
      }>(`/gravestones/${gravestoneId}/can-claim`);

      return response.data.data;
    } catch (err: any) {
      const reason = err.response?.data?.error || err.message || 'Failed to check claim eligibility';
      logger.error('[GravestoneService] canClaimGravestone error:', err as Error, {
        context: { gravestoneId, reason },
      });
      return { canClaim: false, reason };
    }
  }
}

export const gravestoneService = new GravestoneService();
export default gravestoneService;
