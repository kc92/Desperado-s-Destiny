/**
 * Ad Provider Interface
 * Abstract interface for different ad providers (Mock, Google IMA, Unity, etc.)
 */

import { AdRewardType } from '../ad.service';

/**
 * Result of showing an ad
 */
export interface AdResult {
  success: boolean;
  completed: boolean;
  verificationToken?: string;
  error?: string;
  skipped?: boolean;
}

/**
 * Ad provider configuration
 */
export interface AdProviderConfig {
  /** Test mode - show test ads instead of real ones */
  testMode?: boolean;
  /** Ad unit IDs for different reward types */
  adUnitIds?: Partial<Record<AdRewardType, string>>;
  /** Default ad unit ID if not specified per type */
  defaultAdUnitId?: string;
  /** Callback when ad starts loading */
  onAdLoading?: () => void;
  /** Callback when ad is ready to play */
  onAdReady?: () => void;
  /** Callback when ad starts playing */
  onAdStarted?: () => void;
  /** Callback for ad progress updates */
  onAdProgress?: (progress: number) => void;
  /** Callback when ad is completed */
  onAdCompleted?: () => void;
  /** Callback when ad is skipped */
  onAdSkipped?: () => void;
  /** Callback when ad errors */
  onAdError?: (error: string) => void;
}

/**
 * Ad provider interface
 * Implement this for each ad network (Mock, Google IMA, Unity, etc.)
 */
export interface IAdProvider {
  /** Provider name for logging */
  readonly name: string;

  /** Whether the provider is initialized */
  readonly isInitialized: boolean;

  /** Whether an ad is currently loading */
  readonly isLoading: boolean;

  /** Whether an ad is currently playing */
  readonly isPlaying: boolean;

  /**
   * Initialize the ad provider
   * @param config - Provider configuration
   */
  initialize(config: AdProviderConfig): Promise<void>;

  /**
   * Check if an ad is available for the given reward type
   * @param rewardType - Type of reward
   */
  isAdAvailable(rewardType: AdRewardType): Promise<boolean>;

  /**
   * Preload an ad for the given reward type
   * @param rewardType - Type of reward
   */
  preloadAd(rewardType: AdRewardType): Promise<void>;

  /**
   * Show a rewarded video ad
   * @param rewardType - Type of reward to grant on completion
   * @returns Result of showing the ad
   */
  showRewardedAd(rewardType: AdRewardType): Promise<AdResult>;

  /**
   * Destroy/cleanup the provider
   */
  destroy(): void;
}

/**
 * Base implementation with common functionality
 */
export abstract class BaseAdProvider implements IAdProvider {
  abstract readonly name: string;

  protected _isInitialized = false;
  protected _isLoading = false;
  protected _isPlaying = false;
  protected config: AdProviderConfig = {};

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  abstract initialize(config: AdProviderConfig): Promise<void>;
  abstract isAdAvailable(rewardType: AdRewardType): Promise<boolean>;
  abstract preloadAd(rewardType: AdRewardType): Promise<void>;
  abstract showRewardedAd(rewardType: AdRewardType): Promise<AdResult>;

  destroy(): void {
    this._isInitialized = false;
    this._isLoading = false;
    this._isPlaying = false;
  }
}
