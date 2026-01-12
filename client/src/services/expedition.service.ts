/**
 * Expedition Service
 * API client for expedition system - offline progression
 */

import { apiCall } from './api';
import {
  ExpeditionType,
  ExpeditionDurationTier,
  ExpeditionStatus,
  ExpeditionOutcome,
  IExpeditionDTO,
  IExpeditionAvailability,
  IExpeditionTypeConfig,
  IExpeditionResult,
  EXPEDITION_CONFIGS,
} from '@desperados/shared';

// Re-export types and enums for convenience
export {
  ExpeditionType,
  ExpeditionDurationTier,
  ExpeditionStatus,
  ExpeditionOutcome,
  EXPEDITION_CONFIGS,
};

export type {
  IExpeditionDTO,
  IExpeditionAvailability,
  IExpeditionTypeConfig,
  IExpeditionResult,
};

/**
 * Response types
 */
export interface ExpeditionTypesResponse {
  type: string;
  name: string;
  description: string;
  flavorText: string;
  durations: Record<ExpeditionDurationTier, { minMs: number; maxMs: number; defaultMs: number }>;
  validStartLocations: string[];
  minLevel?: number;
  skillRequirements?: Record<string, number>;
  energyCost: number;
  goldCost?: number;
  primarySkill: string;
  baseXpReward: number;
  baseGoldReward: number;
  resourceTypes: string[];
}

export interface AvailabilityResponse {
  locationId: string;
  expeditions: IExpeditionAvailability[];
}

export interface ActiveExpeditionResponse {
  expedition: IExpeditionDTO | null;
  hasActive: boolean;
}

export interface StartExpeditionRequest {
  type: ExpeditionType;
  durationTier: ExpeditionDurationTier;
  customDurationMs?: number;
  mountId?: string;
  suppliesItemIds?: string[];
  gangMemberIds?: string[];
}

/**
 * Expedition Service API
 */
export const expeditionService = {
  /**
   * Get all expedition type configurations
   */
  getTypes: async (): Promise<ExpeditionTypesResponse[]> => {
    return apiCall<ExpeditionTypesResponse[]>('get', '/expeditions/types');
  },

  /**
   * Check expedition availability at current location
   */
  getAvailability: async (): Promise<AvailabilityResponse> => {
    return apiCall<AvailabilityResponse>('get', '/expeditions/availability');
  },

  /**
   * Get active expedition for character
   */
  getActive: async (): Promise<ActiveExpeditionResponse> => {
    return apiCall<ActiveExpeditionResponse>('get', '/expeditions/active');
  },

  /**
   * Get expedition history
   */
  getHistory: async (limit: number = 10): Promise<IExpeditionDTO[]> => {
    return apiCall<IExpeditionDTO[]>('get', '/expeditions/history', { limit });
  },

  /**
   * Get details of a specific expedition
   */
  getExpedition: async (expeditionId: string): Promise<IExpeditionDTO> => {
    return apiCall<IExpeditionDTO>('get', `/expeditions/${expeditionId}`);
  },

  /**
   * Start a new expedition
   */
  start: async (request: StartExpeditionRequest): Promise<IExpeditionDTO> => {
    return apiCall<IExpeditionDTO>('post', '/expeditions/start', request);
  },

  /**
   * Cancel an active expedition
   */
  cancel: async (expeditionId: string): Promise<{ message: string }> => {
    return apiCall<{ message: string }>('post', `/expeditions/${expeditionId}/cancel`);
  },

  // ===== Helper Functions =====

  /**
   * Get expedition type display info
   */
  getTypeInfo: (type: ExpeditionType): { icon: string; name: string; color: string } => {
    const info: Record<ExpeditionType, { icon: string; name: string; color: string }> = {
      [ExpeditionType.HUNTING_TRIP]: { icon: '🦌', name: 'Hunting Trip', color: 'text-green-400' },
      [ExpeditionType.PROSPECTING_RUN]: { icon: '⛏️', name: 'Prospecting Run', color: 'text-amber-400' },
      [ExpeditionType.TRADE_CARAVAN]: { icon: '🐎', name: 'Trade Caravan', color: 'text-blue-400' },
      [ExpeditionType.SCOUTING_MISSION]: { icon: '🔭', name: 'Scouting Mission', color: 'text-purple-400' },
    };
    return info[type] || { icon: '📦', name: type, color: 'text-gray-400' };
  },

  /**
   * Get duration tier display info
   */
  getDurationInfo: (tier: ExpeditionDurationTier): { name: string; description: string; color: string } => {
    const info: Record<ExpeditionDurationTier, { name: string; description: string; color: string }> = {
      [ExpeditionDurationTier.QUICK]: {
        name: 'Quick',
        description: '1-2 hours, 95% success, 1x rewards',
        color: 'text-green-400'
      },
      [ExpeditionDurationTier.STANDARD]: {
        name: 'Standard',
        description: '4-8 hours, 85% success, 2x rewards',
        color: 'text-amber-400'
      },
      [ExpeditionDurationTier.EXTENDED]: {
        name: 'Extended',
        description: '12-24 hours, 70% success, 4x rewards',
        color: 'text-red-400'
      },
    };
    return info[tier] || { name: tier, description: '', color: 'text-gray-400' };
  },

  /**
   * Get outcome display info
   */
  getOutcomeInfo: (outcome: ExpeditionOutcome): { name: string; icon: string; color: string } => {
    const info: Record<ExpeditionOutcome, { name: string; icon: string; color: string }> = {
      [ExpeditionOutcome.CRITICAL_SUCCESS]: { name: 'Critical Success', icon: '🌟', color: 'text-yellow-400' },
      [ExpeditionOutcome.SUCCESS]: { name: 'Success', icon: '✅', color: 'text-green-400' },
      [ExpeditionOutcome.PARTIAL_SUCCESS]: { name: 'Partial Success', icon: '⚠️', color: 'text-amber-400' },
      [ExpeditionOutcome.FAILURE]: { name: 'Failure', icon: '❌', color: 'text-red-400' },
      [ExpeditionOutcome.CRITICAL_FAILURE]: { name: 'Critical Failure', icon: '💀', color: 'text-red-600' },
    };
    return info[outcome] || { name: outcome, icon: '❓', color: 'text-gray-400' };
  },

  /**
   * Get status display info
   */
  getStatusInfo: (status: ExpeditionStatus): { name: string; color: string } => {
    const info: Record<ExpeditionStatus, { name: string; color: string }> = {
      [ExpeditionStatus.PREPARING]: { name: 'Preparing', color: 'text-blue-400' },
      [ExpeditionStatus.IN_PROGRESS]: { name: 'In Progress', color: 'text-amber-400' },
      [ExpeditionStatus.COMPLETED]: { name: 'Completed', color: 'text-green-400' },
      [ExpeditionStatus.FAILED]: { name: 'Failed', color: 'text-red-400' },
      [ExpeditionStatus.CANCELLED]: { name: 'Cancelled', color: 'text-gray-400' },
    };
    return info[status] || { name: status, color: 'text-gray-400' };
  },

  /**
   * Format duration in milliseconds to readable string
   */
  formatDuration: (ms: number): string => {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));

    if (hours === 0) {
      return `${minutes}m`;
    }
    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
  },

  /**
   * Format remaining time from estimated completion date
   */
  formatRemainingTime: (estimatedCompletionAt: Date | string): string => {
    const end = new Date(estimatedCompletionAt).getTime();
    const now = Date.now();
    const remaining = Math.max(0, end - now);

    if (remaining === 0) {
      return 'Complete!';
    }

    return expeditionService.formatDuration(remaining);
  },

  /**
   * Calculate progress percentage
   */
  calculateProgress: (startedAt: Date | string, estimatedCompletionAt: Date | string): number => {
    const start = new Date(startedAt).getTime();
    const end = new Date(estimatedCompletionAt).getTime();
    const now = Date.now();

    const total = end - start;
    const elapsed = now - start;

    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  },
};

export default expeditionService;
