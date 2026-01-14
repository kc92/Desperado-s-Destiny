/**
 * useAdRewards Hook
 * React hook for managing ad rewards and player bonuses
 *
 * Usage:
 *   const { showAd, isLoading, canWatchAd, activeBonuses } = useAdRewards();
 *   await showAd(AdRewardType.XP_BOOST);
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getAdManager, AdManagerState } from '@/services/ads/AdManager';
import { AdRewardType, AdRewardStatus, PlayerBonuses, AdConfig } from '@/services/ad.service';
import { MockAdState } from '@/services/ads/MockAdProvider';

/**
 * Hook return type
 */
export interface UseAdRewardsReturn {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  isMockProvider: boolean;

  // Mock ad state (for rendering mock ad UI)
  mockAdState: MockAdState | null;

  // Data
  shouldShowAds: boolean;
  adStatus: AdRewardStatus | null;
  playerBonuses: PlayerBonuses | null;
  adConfig: AdConfig | null;

  // Actions
  initialize: () => Promise<void>;
  showAd: (rewardType: AdRewardType) => Promise<{ success: boolean; reward?: any; error?: string }>;
  skipAd: () => void;
  refreshStatus: () => Promise<void>;

  // Helpers
  canWatchAd: (rewardType: AdRewardType) => boolean;
  getRemainingViews: (rewardType: AdRewardType) => number;
  getActiveBonus: (rewardType: AdRewardType) => { multiplier: number; remainingMinutes: number } | null;
}

/**
 * useAdRewards hook
 */
export function useAdRewards(): UseAdRewardsReturn {
  const adManager = useRef(getAdManager());

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMockProvider, setIsMockProvider] = useState(false);
  const [mockAdState, setMockAdState] = useState<MockAdState | null>(null);

  // Data
  const [shouldShowAds, setShouldShowAds] = useState(true);
  const [adStatus, setAdStatus] = useState<AdRewardStatus | null>(null);
  const [playerBonuses, setPlayerBonuses] = useState<PlayerBonuses | null>(null);
  const [adConfig, setAdConfig] = useState<AdConfig | null>(null);

  /**
   * Handle state changes from ad manager
   */
  const handleStateChange = useCallback((state: AdManagerState) => {
    setIsInitialized(state.isInitialized);
    setIsLoading(state.isLoading);
    setIsPlaying(state.isPlaying);
    setMockAdState(state.mockState ?? null);
  }, []);

  /**
   * Initialize the ad system
   */
  const initialize = useCallback(async () => {
    if (isInitialized) return;

    try {
      // Set up state callback
      adManager.current.setStateCallback(handleStateChange);

      // Initialize ad manager
      await adManager.current.initialize();

      setIsInitialized(true);
      setIsMockProvider(adManager.current.isMockProvider());

      // Load initial data
      await refreshStatus();
    } catch (error) {
      console.error('[useAdRewards] Failed to initialize:', error);
    }
  }, [isInitialized, handleStateChange]);

  /**
   * Refresh ad status and player bonuses from server
   */
  const refreshStatus = useCallback(async () => {
    try {
      const [showAds, status, bonuses, config] = await Promise.all([
        adManager.current.shouldShowAds(),
        adManager.current.getAdRewardStatus(),
        adManager.current.getPlayerBonuses(),
        adManager.current.getAdConfig(),
      ]);

      setShouldShowAds(showAds);
      setAdStatus(status);
      setPlayerBonuses(bonuses);
      setAdConfig(config);
    } catch (error) {
      console.error('[useAdRewards] Failed to refresh status:', error);
    }
  }, []);

  /**
   * Show an ad for a specific reward type
   */
  const showAd = useCallback(async (rewardType: AdRewardType) => {
    if (!isInitialized) {
      return { success: false, error: 'Ad system not initialized' };
    }

    setIsLoading(true);

    try {
      const result = await adManager.current.showRewardedAd(rewardType);

      // Refresh status after watching ad
      if (result.success) {
        await refreshStatus();
      }

      return result;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, refreshStatus]);

  /**
   * Skip the current ad (mock only)
   */
  const skipAd = useCallback(() => {
    adManager.current.skipAd();
  }, []);

  /**
   * Check if player can watch an ad for a reward type
   */
  const canWatchAd = useCallback((rewardType: AdRewardType): boolean => {
    if (!adStatus) return false;
    return adStatus.canWatch[rewardType] ?? false;
  }, [adStatus]);

  /**
   * Get remaining ad views for a reward type
   */
  const getRemainingViews = useCallback((rewardType: AdRewardType): number => {
    if (!adStatus) return 0;
    const dailyCap = adStatus.dailyCaps[rewardType] ?? 0;
    const dailyViews = adStatus.dailyViews[rewardType] ?? 0;
    return Math.max(0, dailyCap - dailyViews);
  }, [adStatus]);

  /**
   * Get active bonus for a reward type
   */
  const getActiveBonus = useCallback((rewardType: AdRewardType): { multiplier: number; remainingMinutes: number } | null => {
    if (!adStatus) return null;

    const bonus = adStatus.activeBonuses.find(b => b.type === rewardType);
    if (!bonus) return null;

    return {
      multiplier: bonus.multiplier,
      remainingMinutes: bonus.remainingMinutes,
    };
  }, [adStatus]);

  /**
   * Auto-initialize on mount
   */
  useEffect(() => {
    initialize();

    return () => {
      adManager.current.setStateCallback(null);
    };
  }, [initialize]);

  /**
   * Periodically refresh status
   */
  useEffect(() => {
    if (!isInitialized) return;

    // Refresh every 60 seconds
    const interval = setInterval(refreshStatus, 60000);

    return () => clearInterval(interval);
  }, [isInitialized, refreshStatus]);

  return {
    // State
    isInitialized,
    isLoading,
    isPlaying,
    isMockProvider,
    mockAdState,

    // Data
    shouldShowAds,
    adStatus,
    playerBonuses,
    adConfig,

    // Actions
    initialize,
    showAd,
    skipAd,
    refreshStatus,

    // Helpers
    canWatchAd,
    getRemainingViews,
    getActiveBonus,
  };
}

export default useAdRewards;
