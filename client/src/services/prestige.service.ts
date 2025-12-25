/**
 * Prestige Service
 * API methods for the prestige/endgame system
 */

import { apiCall } from './api';

/**
 * Prestige bonus types
 */
export interface PrestigeBonus {
  type: 'xp_multiplier' | 'gold_multiplier' | 'skill_cap_increase' | 'starting_bonus';
  value: number;
  description: string;
}

/**
 * Prestige rank definition
 */
export interface PrestigeRank {
  rank: number;
  name: string;
  requiredLevel: number;
  bonuses: PrestigeBonus[];
  description: string;
  badge?: string;
}

/**
 * Current prestige state for a character
 */
export interface PrestigeState {
  currentRank: number;
  totalPrestiges: number;
  permanentBonuses: PrestigeBonus[];
  prestigeHistory: {
    rank: number;
    prestigedAt: string;
    levelAtPrestige: number;
  }[];
}

/**
 * Prestige info response from API
 */
export interface PrestigeInfoResponse {
  success: boolean;
  data: {
    currentRank: number;
    totalPrestiges: number;
    permanentBonuses: PrestigeBonus[];
    nextRank: PrestigeRank | null;
    canPrestige: boolean;
    prestigeHistory: {
      rank: number;
      prestigedAt: string;
      levelAtPrestige: number;
    }[];
  };
}

/**
 * Prestige reset response
 */
export interface PrestigeResetResponse {
  success: boolean;
  message: string;
  data: {
    newRank: PrestigeRank;
  };
}

/**
 * Prestige ranks response
 */
export interface PrestigeRanksResponse {
  success: boolean;
  data: {
    ranks: PrestigeRank[];
    maxRank: number;
  };
}

/**
 * Eligibility check response
 */
export interface PrestigeEligibilityResponse {
  success: boolean;
  data: {
    eligible: boolean;
    currentRank: number;
    nextRank: PrestigeRank | null;
    requirements: {
      type: string;
      current: number;
      required: number;
      met: boolean;
    }[];
    atMaxRank: boolean;
  };
}

/**
 * Prestige history response
 */
export interface PrestigeHistoryResponse {
  success: boolean;
  data: {
    history: {
      rank: number;
      prestigedAt: string;
      levelAtPrestige: number;
    }[];
    totalPrestiges: number;
  };
}

/**
 * Get prestige info for a character
 */
export async function getPrestigeInfo(characterId: string): Promise<PrestigeInfoResponse> {
  return apiCall<PrestigeInfoResponse>('get', `/prestige?characterId=${characterId}`);
}

/**
 * Perform prestige reset for a character
 */
export async function performPrestige(characterId: string): Promise<PrestigeResetResponse> {
  return apiCall<PrestigeResetResponse>('post', '/prestige/reset', { characterId });
}

/**
 * Get prestige history for a character
 */
export async function getPrestigeHistory(characterId: string): Promise<PrestigeHistoryResponse> {
  return apiCall<PrestigeHistoryResponse>('get', `/prestige/history?characterId=${characterId}`);
}

/**
 * Get all prestige rank definitions
 */
export async function getPrestigeRanks(): Promise<PrestigeRanksResponse> {
  return apiCall<PrestigeRanksResponse>('get', '/prestige/ranks');
}

/**
 * Check prestige eligibility with detailed requirements
 */
export async function checkPrestigeEligibility(characterId: string): Promise<PrestigeEligibilityResponse> {
  return apiCall<PrestigeEligibilityResponse>('get', `/prestige/eligibility?characterId=${characterId}`);
}

const prestigeService = {
  getPrestigeInfo,
  performPrestige,
  getPrestigeHistory,
  getPrestigeRanks,
  checkPrestigeEligibility,
};

export default prestigeService;
