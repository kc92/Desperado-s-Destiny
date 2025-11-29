/**
 * Crime Service
 * API client for crime-related operations (jail, wanted status, bounties)
 */

import api from './api';

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
  newGold: number;
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
   */
  async getWantedStatus(): Promise<WantedStatus> {
    const response = await api.get<{ data: WantedStatus }>('/crimes/wanted');
    return response.data.data;
  },

  /**
   * Get jail status for current character
   */
  async getJailStatus(): Promise<JailStatus> {
    const response = await api.get<{ data: JailStatus }>('/crimes/jail-status');
    return response.data.data;
  },

  /**
   * Pay bail to get out of jail early
   */
  async payBail(): Promise<PayBailResult> {
    const response = await api.post<{ data: PayBailResult }>('/crimes/pay-bail');
    return response.data.data;
  },

  /**
   * Lay low to reduce wanted level
   * @param useGold - If true, pay 50 gold (instant). If false, wait 30 minutes.
   */
  async layLow(useGold: boolean): Promise<LayLowResult> {
    const response = await api.post<{ data: LayLowResult }>('/crimes/lay-low', { useGold });
    return response.data.data;
  },

  /**
   * Arrest a wanted player
   * @param targetId - Character ID of the target to arrest
   */
  async arrestPlayer(targetId: string): Promise<ArrestResult> {
    const response = await api.post<{ data: ArrestResult }>(`/crimes/arrest/${targetId}`);
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
