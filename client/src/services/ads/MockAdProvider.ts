/**
 * Mock Ad Provider
 * Simulates ads for development and testing without real ad network
 *
 * Shows a fake "ad" overlay that counts down, allowing testing of:
 * - Full ad flow
 * - UI interactions
 * - Reward granting
 * - Error handling
 */

import { AdRewardType } from '../ad.service';
import { BaseAdProvider, AdProviderConfig, AdResult } from './AdProvider';

/** Duration of mock ad in milliseconds */
const MOCK_AD_DURATION = 5000; // 5 seconds for testing (real ads are 15-30s)

/** Simulated failure rate for testing error handling (0-1) */
const MOCK_FAILURE_RATE = 0.05; // 5% chance of failure

/**
 * Mock ad state for UI rendering
 */
export interface MockAdState {
  isShowing: boolean;
  progress: number;
  remainingSeconds: number;
  rewardType: AdRewardType | null;
  canSkip: boolean;
}

/**
 * Callbacks for mock ad UI
 */
export interface MockAdCallbacks {
  onStateChange: (state: MockAdState) => void;
}

/**
 * Mock Ad Provider for development testing
 */
export class MockAdProvider extends BaseAdProvider {
  readonly name = 'MockAdProvider';

  private mockCallbacks: MockAdCallbacks | null = null;
  private adInterval: ReturnType<typeof setInterval> | null = null;
  private currentAdResolve: ((result: AdResult) => void) | null = null;

  /**
   * Set callbacks for UI updates
   */
  setCallbacks(callbacks: MockAdCallbacks): void {
    this.mockCallbacks = callbacks;
  }

  /**
   * Initialize the mock provider
   */
  async initialize(config: AdProviderConfig): Promise<void> {
    this.config = config;
    this._isInitialized = true;
    console.log('[MockAdProvider] Initialized in development mode');
  }

  /**
   * Ads are always "available" in mock mode
   */
  async isAdAvailable(_rewardType: AdRewardType): Promise<boolean> {
    return true;
  }

  /**
   * No-op for mock provider - ads don't need preloading
   */
  async preloadAd(_rewardType: AdRewardType): Promise<void> {
    // No preloading needed for mock ads
  }

  /**
   * Show a mock rewarded ad
   */
  async showRewardedAd(rewardType: AdRewardType): Promise<AdResult> {
    if (this._isPlaying) {
      return {
        success: false,
        completed: false,
        error: 'An ad is already playing',
      };
    }

    // Simulate random failure for testing
    if (Math.random() < MOCK_FAILURE_RATE) {
      this.config.onAdError?.('Mock ad failed to load (simulated error)');
      return {
        success: false,
        completed: false,
        error: 'Mock ad failed to load (simulated error)',
      };
    }

    this._isPlaying = true;
    this.config.onAdLoading?.();

    // Small delay to simulate ad loading
    await new Promise((resolve) => setTimeout(resolve, 500));

    this.config.onAdReady?.();
    this.config.onAdStarted?.();

    // Return a promise that resolves when the ad completes
    return new Promise((resolve) => {
      this.currentAdResolve = resolve;

      let elapsed = 0;
      const updateInterval = 100; // Update every 100ms
      const totalDuration = MOCK_AD_DURATION;

      // Update state for UI
      const updateState = () => {
        const progress = Math.min(elapsed / totalDuration, 1);
        const remainingSeconds = Math.ceil((totalDuration - elapsed) / 1000);

        this.config.onAdProgress?.(progress);

        this.mockCallbacks?.onStateChange({
          isShowing: true,
          progress,
          remainingSeconds,
          rewardType,
          canSkip: elapsed >= 2000, // Can skip after 2 seconds
        });
      };

      // Initial state
      updateState();

      // Progress interval
      this.adInterval = setInterval(() => {
        elapsed += updateInterval;
        updateState();

        // Ad completed
        if (elapsed >= totalDuration) {
          this.completeAd(true);
        }
      }, updateInterval);
    });
  }

  /**
   * Skip the current mock ad
   */
  skipAd(): void {
    if (this._isPlaying && this.currentAdResolve) {
      this.completeAd(false, true);
    }
  }

  /**
   * Complete the current ad
   */
  private completeAd(completed: boolean, skipped = false): void {
    if (this.adInterval) {
      clearInterval(this.adInterval);
      this.adInterval = null;
    }

    this._isPlaying = false;

    // Reset UI state
    this.mockCallbacks?.onStateChange({
      isShowing: false,
      progress: 0,
      remainingSeconds: 0,
      rewardType: null,
      canSkip: false,
    });

    if (completed) {
      this.config.onAdCompleted?.();
    } else if (skipped) {
      this.config.onAdSkipped?.();
    }

    // Generate a mock verification token
    const mockToken = `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    this.currentAdResolve?.({
      success: true,
      completed,
      skipped,
      verificationToken: completed ? mockToken : undefined,
    });

    this.currentAdResolve = null;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.adInterval) {
      clearInterval(this.adInterval);
      this.adInterval = null;
    }
    this.currentAdResolve = null;
    this.mockCallbacks = null;
    super.destroy();
  }
}

/**
 * Singleton instance for the mock provider
 */
let mockProviderInstance: MockAdProvider | null = null;

export function getMockAdProvider(): MockAdProvider {
  if (!mockProviderInstance) {
    mockProviderInstance = new MockAdProvider();
  }
  return mockProviderInstance;
}
