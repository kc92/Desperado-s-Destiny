/**
 * Ritual Service
 * API client for Dark Ritual system endpoints
 */

import api from './api';
import type { Ritual, ActiveRitual, RitualResult, RitualFailure } from '@desperados/shared';

// ===== Request Types =====

export interface StartRitualRequest {
  participants?: string[];
}

// ===== Response Types =====

export interface GetAvailableRitualsResponse {
  rituals: Ritual[];
  count: number;
}

export interface GetAllRitualsResponse {
  rituals: Ritual[];
  count: number;
}

export interface GetActiveRitualResponse {
  activeRitual: ActiveRitual | null;
}

export interface CanPerformRitualResponse {
  canPerform: boolean;
  reason?: string;
  missingRequirements?: {
    corruption?: number;
    energy?: number;
    sanity?: number;
    components?: string[];
    knowledge?: string[];
  };
}

export interface StartRitualResponse {
  message: string;
  completesAt: Date;
}

export interface CompleteRitualResponse {
  success: boolean;
  failed: boolean;
  results?: RitualResult[];
  failure?: RitualFailure;
  message: string;
}

export interface CancelRitualResponse {
  message: string;
  backlash?: {
    sanityLoss: number;
    corruptionGain: number;
    damage?: number;
    description: string;
  };
}

export interface DiscoverRitualResponse {
  message: string;
}

// ===== Ritual Service =====

export const ritualService = {
  /**
   * Get all available rituals for the character
   * Returns rituals the character has discovered and meets requirements for
   */
  async getAvailableRituals(): Promise<GetAvailableRitualsResponse> {
    const response = await api.get<{ data: GetAvailableRitualsResponse }>('/rituals');
    return response.data.data;
  },

  /**
   * Get all rituals (for discovery purposes)
   * Returns complete list of all rituals in the game
   */
  async getAllRituals(): Promise<GetAllRitualsResponse> {
    const response = await api.get<{ data: GetAllRitualsResponse }>('/rituals/all');
    return response.data.data;
  },

  /**
   * Get currently active ritual (if any)
   * Returns the ritual currently being performed by the character
   */
  async getActiveRitual(): Promise<ActiveRitual | null> {
    const response = await api.get<{ data: ActiveRitual | null }>('/rituals/active');
    return response.data.data;
  },

  /**
   * Check if character can perform a specific ritual
   * Validates all requirements without starting the ritual
   */
  async canPerformRitual(ritualId: string): Promise<CanPerformRitualResponse> {
    const response = await api.get<{ data: CanPerformRitualResponse }>(
      `/rituals/${ritualId}/check`
    );
    return response.data.data;
  },

  /**
   * Start performing a ritual
   * Begins the ritual process with optional participants for group rituals
   */
  async startRitual(
    ritualId: string,
    participants?: string[]
  ): Promise<StartRitualResponse> {
    const requestData: StartRitualRequest = participants ? { participants } : {};
    const response = await api.post<{ data: StartRitualResponse }>(
      `/rituals/${ritualId}/start`,
      requestData
    );
    return response.data.data;
  },

  /**
   * Complete the active ritual (if time has elapsed)
   * Resolves the ritual and applies results or failure consequences
   */
  async completeRitual(): Promise<CompleteRitualResponse> {
    const response = await api.post<{ data: CompleteRitualResponse }>('/rituals/complete');
    return response.data.data;
  },

  /**
   * Cancel the active ritual (causes backlash)
   * Interrupts the ritual early with negative consequences
   */
  async cancelRitual(): Promise<CancelRitualResponse> {
    const response = await api.post<{ data: CancelRitualResponse }>('/rituals/cancel');
    return response.data.data;
  },

  /**
   * Discover/learn a ritual
   * Adds the ritual to the character's known rituals
   */
  async discoverRitual(ritualId: string): Promise<DiscoverRitualResponse> {
    const response = await api.post<{ data: DiscoverRitualResponse }>(
      `/rituals/${ritualId}/discover`
    );
    return response.data.data;
  },
};

export default ritualService;
