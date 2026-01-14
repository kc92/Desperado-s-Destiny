/**
 * Ad Manager
 * Singleton that manages ad provider selection and provides a unified interface
 *
 * Usage:
 *   const adManager = getAdManager();
 *   await adManager.initialize();
 *   const result = await adManager.showRewardedAd(AdRewardType.XP_BOOST);
 */

import { AdRewardType, adService } from '../ad.service';
import { IAdProvider, AdProviderConfig, AdResult } from './AdProvider';
import { getMockAdProvider, MockAdProvider, MockAdState } from './MockAdProvider';
import { getGoogleIMAProvider } from './GoogleIMAProvider';

/**
 * Ad manager configuration
 */
export interface AdManagerConfig {
  /** Force use of mock provider even in production */
  forceMock?: boolean;
  /** Google IMA ad tag URL */
  googleIMAAdTagUrl?: string;
  /** Test mode for real providers */
  testMode?: boolean;
  /** Callbacks for ad state changes */
  onAdStateChange?: (state: AdManagerState) => void;
}

/**
 * Current ad manager state
 */
export interface AdManagerState {
  isInitialized: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  provider: string;
  mockState?: MockAdState;
}

/**
 * Ad Manager singleton class
 */
class AdManager {
  private provider: IAdProvider | null = null;
  private config: AdManagerConfig = {};
  private stateCallback: ((state: AdManagerState) => void) | null = null;
  private _isInitialized = false;

  /**
   * Get current state
   */
  getState(): AdManagerState {
    return {
      isInitialized: this._isInitialized,
      isLoading: this.provider?.isLoading ?? false,
      isPlaying: this.provider?.isPlaying ?? false,
      provider: this.provider?.name ?? 'none',
    };
  }

  /**
   * Set state change callback
   */
  setStateCallback(callback: ((state: AdManagerState) => void) | null): void {
    this.stateCallback = callback;
  }

  /**
   * Emit state change
   */
  private emitStateChange(mockState?: MockAdState): void {
    const state: AdManagerState = {
      ...this.getState(),
      mockState,
    };
    this.stateCallback?.(state);
    this.config.onAdStateChange?.(state);
  }

  /**
   * Initialize the ad manager and select appropriate provider
   */
  async initialize(config: AdManagerConfig = {}): Promise<void> {
    if (this._isInitialized) {
      console.log('[AdManager] Already initialized');
      return;
    }

    this.config = config;

    // Determine which provider to use
    const useMock = this.shouldUseMockProvider();

    if (useMock) {
      console.log('[AdManager] Using MockAdProvider for development');
      const mockProvider = getMockAdProvider();

      // Set up mock state callbacks
      mockProvider.setCallbacks({
        onStateChange: (state) => this.emitStateChange(state),
      });

      this.provider = mockProvider;
    } else {
      console.log('[AdManager] Using GoogleIMAProvider for production');
      this.provider = getGoogleIMAProvider();
    }

    // Provider callbacks
    const providerConfig: AdProviderConfig = {
      testMode: config.testMode,
      defaultAdUnitId: config.googleIMAAdTagUrl,
      onAdLoading: () => this.emitStateChange(),
      onAdReady: () => this.emitStateChange(),
      onAdStarted: () => this.emitStateChange(),
      onAdProgress: () => this.emitStateChange(),
      onAdCompleted: () => this.emitStateChange(),
      onAdSkipped: () => this.emitStateChange(),
      onAdError: (error) => {
        console.error('[AdManager] Ad error:', error);
        this.emitStateChange();
      },
    };

    try {
      await this.provider.initialize(providerConfig);
      this._isInitialized = true;
      this.emitStateChange();
      console.log('[AdManager] Initialized successfully');
    } catch (error) {
      console.error('[AdManager] Failed to initialize provider:', error);

      // Fall back to mock if real provider fails
      if (!useMock) {
        console.log('[AdManager] Falling back to MockAdProvider');
        const mockProvider = getMockAdProvider();
        mockProvider.setCallbacks({
          onStateChange: (state) => this.emitStateChange(state),
        });
        await mockProvider.initialize(providerConfig);
        this.provider = mockProvider;
        this._isInitialized = true;
        this.emitStateChange();
      } else {
        throw error;
      }
    }
  }

  /**
   * Determine if we should use the mock provider
   */
  private shouldUseMockProvider(): boolean {
    // Force mock if configured
    if (this.config.forceMock) {
      return true;
    }

    // Use mock in development
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      return true;
    }

    // Use mock if no Google IMA configured
    const hasGoogleIMA =
      this.config.googleIMAAdTagUrl ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_IMA_AD_TAG_URL);

    if (!hasGoogleIMA) {
      console.warn('[AdManager] No VITE_GOOGLE_IMA_AD_TAG_URL configured, using mock');
      return true;
    }

    return false;
  }

  /**
   * Check if we should show ads to this player
   */
  async shouldShowAds(): Promise<boolean> {
    try {
      return await adService.shouldShowAds();
    } catch (error) {
      console.error('[AdManager] Error checking if should show ads:', error);
      // Default to showing ads if we can't check
      return true;
    }
  }

  /**
   * Check if an ad is available for the given reward type
   */
  async isAdAvailable(rewardType: AdRewardType): Promise<boolean> {
    if (!this.provider || !this._isInitialized) {
      return false;
    }
    return this.provider.isAdAvailable(rewardType);
  }

  /**
   * Get ad reward status from the server
   */
  async getAdRewardStatus() {
    return adService.getAdRewardStatus();
  }

  /**
   * Get ad configuration from the server
   */
  async getAdConfig() {
    return adService.getAdConfig();
  }

  /**
   * Show a rewarded ad and claim the reward if completed
   */
  async showRewardedAd(rewardType: AdRewardType): Promise<{
    success: boolean;
    reward?: any;
    error?: string;
  }> {
    if (!this.provider || !this._isInitialized) {
      return {
        success: false,
        error: 'Ad provider not initialized',
      };
    }

    try {
      // Show the ad
      const adResult: AdResult = await this.provider.showRewardedAd(rewardType);

      if (!adResult.success || !adResult.completed) {
        return {
          success: false,
          error: adResult.error || (adResult.skipped ? 'Ad was skipped' : 'Ad failed to complete'),
        };
      }

      // Claim the reward from the server
      try {
        const claimResult = await adService.claimAdReward(
          rewardType,
          adResult.verificationToken
        );

        return {
          success: true,
          reward: claimResult,
        };
      } catch (claimError: any) {
        console.error('[AdManager] Error claiming reward:', claimError);
        return {
          success: false,
          error: claimError.message || 'Failed to claim reward',
        };
      }
    } catch (error: any) {
      console.error('[AdManager] Error showing ad:', error);
      return {
        success: false,
        error: error.message || 'Failed to show ad',
      };
    }
  }

  /**
   * Skip the current ad (mock provider only)
   */
  skipAd(): void {
    if (this.provider instanceof MockAdProvider) {
      this.provider.skipAd();
    }
  }

  /**
   * Get player bonuses
   */
  async getPlayerBonuses() {
    return adService.getPlayerBonuses();
  }

  /**
   * Check if currently using mock provider
   */
  isMockProvider(): boolean {
    return this.provider?.name === 'MockAdProvider';
  }

  /**
   * Destroy the ad manager
   */
  destroy(): void {
    this.provider?.destroy();
    this.provider = null;
    this._isInitialized = false;
    this.stateCallback = null;
    this.emitStateChange();
  }
}

/**
 * Singleton instance
 */
let adManagerInstance: AdManager | null = null;

/**
 * Get the ad manager singleton
 */
export function getAdManager(): AdManager {
  if (!adManagerInstance) {
    adManagerInstance = new AdManager();
  }
  return adManagerInstance;
}

/**
 * Reset the ad manager (for testing)
 */
export function resetAdManager(): void {
  adManagerInstance?.destroy();
  adManagerInstance = null;
}

export default getAdManager;
