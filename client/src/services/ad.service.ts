/**
 * Ad Service
 * API client for monetization/ad-related endpoints
 */

import apiClient from './api';
import type { ApiResponse } from '@/types';

/**
 * Ad reward types matching backend AdRewardType enum
 */
export enum AdRewardType {
  XP_BOOST = 'xp_boost',
  GOLD_BOOST = 'gold_boost',
  ENERGY_BOOST = 'energy_boost',
  ENERGY_REFILL = 'energy_refill',
  EXTRA_CONTRACT = 'extra_contract',
  BONUS_GOLD = 'bonus_gold',
}

/**
 * Active bonus from watching an ad
 */
export interface ActiveBonus {
  type: AdRewardType;
  multiplier: number;
  expiresAt: string;
  remainingMinutes: number;
}

/**
 * Player bonuses response
 */
export interface PlayerBonuses {
  source: 'subscription' | 'ads' | 'none';
  isSubscriber: boolean;
  xpMultiplier: number;
  goldMultiplier: number;
  energyRegenMultiplier: number;
  activeBonuses: ActiveBonus[];
  pendingBonusGold: number;
  pendingExtraContracts: number;
}

/**
 * Ad reward status response
 */
export interface AdRewardStatus {
  activeBonuses: ActiveBonus[];
  dailyViews: Record<string, number>;
  dailyCaps: Record<string, number>;
  canWatch: Record<string, boolean>;
  pendingBonusGold: number;
  pendingExtraContracts: number;
}

/**
 * Ad config for a reward type
 */
export interface AdRewardConfig {
  type: string;
  durationMinutes: number;
  multiplier: number;
  dailyCap: number;
  description: string;
}

/**
 * Ad configuration response
 */
export interface AdConfig {
  rewards: AdRewardConfig[];
  adDurationSeconds: number;
}

/**
 * Claim reward response
 */
export interface ClaimRewardResponse {
  rewardType: string;
  reward: {
    type: string;
    value?: number;
    duration?: number;
    multiplier?: number;
  };
  message: string;
}

/**
 * Ad service for monetization API calls
 */
export const adService = {
  /**
   * Get player's current bonuses (from subscription or ads)
   */
  getPlayerBonuses: async (): Promise<PlayerBonuses> => {
    const response = await apiClient.get<ApiResponse<PlayerBonuses>>(
      '/monetization/bonuses'
    );
    return response.data.data!;
  },

  /**
   * Get ad reward status (active bonuses, remaining daily views)
   */
  getAdRewardStatus: async (): Promise<AdRewardStatus> => {
    const response = await apiClient.get<ApiResponse<AdRewardStatus>>(
      '/monetization/ad-status'
    );
    return response.data.data!;
  },

  /**
   * Get configuration for all ad reward types
   */
  getAdConfig: async (): Promise<AdConfig> => {
    const response = await apiClient.get<ApiResponse<AdConfig>>(
      '/monetization/ad-config'
    );
    return response.data.data!;
  },

  /**
   * Check if player should see ads (not a subscriber)
   */
  shouldShowAds: async (): Promise<boolean> => {
    const response = await apiClient.get<ApiResponse<{ showAds: boolean }>>(
      '/monetization/should-show-ads'
    );
    return response.data.data!.showAds;
  },

  /**
   * Claim reward after watching an ad
   * @param rewardType - Type of reward to claim
   * @param adNetworkToken - Verification token from ad network (required in production)
   */
  claimAdReward: async (
    rewardType: AdRewardType,
    adNetworkToken?: string
  ): Promise<ClaimRewardResponse> => {
    const response = await apiClient.post<ApiResponse<ClaimRewardResponse>>(
      '/monetization/ad-reward',
      { rewardType, adNetworkToken }
    );
    return response.data.data!;
  },

  /**
   * Use a pending bonus gold reward
   */
  useBonusGold: async (): Promise<{ consumed: boolean; message: string }> => {
    const response = await apiClient.post<ApiResponse<{ consumed: boolean; message: string }>>(
      '/monetization/use-bonus-gold'
    );
    return response.data.data!;
  },

  /**
   * Use a pending extra contract reward
   */
  useExtraContract: async (): Promise<{ consumed: boolean; message: string }> => {
    const response = await apiClient.post<ApiResponse<{ consumed: boolean; message: string }>>(
      '/monetization/use-extra-contract'
    );
    return response.data.data!;
  },
};

export default adService;
