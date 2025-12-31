/**
 * Crime Service
 * API client for crime-related operations (jail, wanted status, bounties)
 */

import api from './api';
import { useCsrfStore } from '@/store/useCsrfStore';
import { logger } from './logger.service';

/**
 * Wanted status response
 */
export interface WantedStatus {
  wantedLevel: number;
  bountyAmount: number;
  recentCrimes: Array<{
    name: string;
    timestamp: Date;
  }>;
  timeUntilDecay: number;
}

/**
 * Jail status response
 */
export interface JailStatus {
  isJailed: boolean;
  jailedUntil: Date | null;
  bailCost: number;
  offense?: string;
}

/**
 * Pay bail result
 */
export interface PayBailResult {
  success: boolean;
  message?: string;
  dollarsSpent?: number;
  newGold?: number;
}

/**
 * Lay low result
 */
export interface LayLowResult {
  success: boolean;
  newWantedLevel: number;
  newGold?: number;
}

/**
 * Arrest result
 */
export interface ArrestResult {
  success: boolean;
  bountyEarned: number;
  newGold: number;
}

/**
 * Bounty entry
 */
export interface Bounty {
  characterId: string;
  characterName: string;
  wantedLevel: number;
  bountyAmount: number;
  lastSeenLocation: string;
  lastSeenTime: Date;
  recentCrimes: string[];
}

/**
 * Crime service for managing criminal activities
 */
export const crimeService = {
  /**
   * Get wanted status for current character
   * @param characterId - The character ID to check wanted status for
   */
  async getWantedStatus(characterId: string): Promise<WantedStatus> {
    const response = await api.get<{ data: WantedStatus }>(`/crimes/wanted?characterId=${characterId}`);
    return response.data.data;
  },

  /**
   * Get jail status for current character
   * @param characterId - The character ID to check jail status for
   */
  async getJailStatus(characterId: string): Promise<JailStatus> {
    const response = await api.get<{ data: JailStatus }>(`/crimes/jail-status?characterId=${characterId}`);
    return response.data.data;
  },

  /**
   * Pay bail to get out of jail early
   * @param characterId - The character ID paying bail
   */
  async payBail(characterId: string): Promise<PayBailResult> {
    // Debug logging to identify issues
    logger.debug('[CrimeService] payBail request:', {
      characterId,
      hasCharacterId: !!characterId,
      csrfToken: useCsrfStore?.getState?.()?.token ? 'present' : 'MISSING'
    });

    try {
      const response = await api.post<{ success: boolean; data: { message: string; dollarsSpent: number } }>('/crimes/pay-bail', { characterId });
      logger.debug('[CrimeService] payBail response:', { data: response.data });

      // Map server response to client interface
      return {
        success: response.data.success,
        message: response.data.data?.message,
        dollarsSpent: response.data.data?.dollarsSpent,
        newGold: response.data.data?.dollarsSpent // Map for backwards compatibility
      };
    } catch (error: any) {
      logger.error('[CrimeService] payBail error:', error, {
        status: error.response?.status,
        data: error.response?.data,
        characterId
      });
      throw error;
    }
  },

  /**
   * Lay low to reduce wanted level
   * @param characterId - The character ID laying low
   * @param useGold - If true, pay 50 gold (instant). If false, wait 30 minutes.
   */
  async layLow(characterId: string, useGold: boolean): Promise<LayLowResult> {
    const response = await api.post<{ data: LayLowResult }>('/crimes/lay-low', { characterId, useGold });
    return response.data.data;
  },

  /**
   * Arrest a wanted player
   * @param characterId - The character ID making the arrest
   * @param targetId - Character ID of the target to arrest
   */
  async arrestPlayer(characterId: string, targetId: string): Promise<ArrestResult> {
    const response = await api.post<{ data: ArrestResult }>(`/crimes/arrest/${targetId}`, { characterId });
    return response.data.data;
  },

  /**
   * Get list of wanted players (bounties)
   */
  async getBounties(): Promise<Bounty[]> {
    const response = await api.get<{ data: { bounties: Bounty[] } }>('/crimes/bounties');
    return response.data.data.bounties;
  },
};

export default crimeService;
