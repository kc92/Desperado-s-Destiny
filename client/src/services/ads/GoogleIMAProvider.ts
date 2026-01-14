/**
 * Google IMA SDK Ad Provider
 * Integrates with Google Interactive Media Ads for rewarded video ads
 *
 * Documentation: https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side
 *
 * Setup required:
 * 1. Add IMA SDK script to index.html: <script src="https://imasdk.googleapis.com/js/sdkloader/ima3.js"></script>
 * 2. Create Ad Manager account at https://admanager.google.com
 * 3. Create ad units and get ad tag URLs
 * 4. Configure VITE_GOOGLE_IMA_AD_TAG_URL in .env
 */

import { AdRewardType } from '../ad.service';
import { BaseAdProvider, AdProviderConfig, AdResult } from './AdProvider';

// Google IMA SDK types (simplified - full types would come from @types/google.ima)
declare global {
  interface Window {
    google?: {
      ima: {
        AdDisplayContainer: new (container: HTMLElement, video: HTMLVideoElement) => IMAAdDisplayContainer;
        AdsLoader: new (container: IMAAdDisplayContainer) => IMAAdsLoader;
        AdsRequest: new () => IMAAdsRequest;
        AdsManagerLoadedEvent: {
          Type: { ADS_MANAGER_LOADED: string };
        };
        AdErrorEvent: {
          Type: { AD_ERROR: string };
        };
        AdEvent: {
          Type: {
            CONTENT_PAUSE_REQUESTED: string;
            CONTENT_RESUME_REQUESTED: string;
            ALL_ADS_COMPLETED: string;
            COMPLETE: string;
            SKIPPED: string;
            STARTED: string;
            FIRST_QUARTILE: string;
            MIDPOINT: string;
            THIRD_QUARTILE: string;
          };
        };
        ViewMode: {
          NORMAL: string;
          FULLSCREEN: string;
        };
      };
    };
  }
}

interface IMAAdDisplayContainer {
  initialize(): void;
  destroy(): void;
}

interface IMAAdsLoader {
  addEventListener(event: string, handler: (e: any) => void): void;
  requestAds(request: IMAAdsRequest): void;
  destroy(): void;
}

interface IMAAdsRequest {
  adTagUrl: string;
  linearAdSlotWidth: number;
  linearAdSlotHeight: number;
}

interface IMAAdsManager {
  init(width: number, height: number, viewMode: string): void;
  start(): void;
  destroy(): void;
  addEventListener(event: string, handler: (e: any) => void): void;
  getRemainingTime(): number;
}

/**
 * Google IMA Ad Provider
 */
export class GoogleIMAProvider extends BaseAdProvider {
  readonly name = 'GoogleIMAProvider';

  private adContainer: HTMLElement | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private adDisplayContainer: IMAAdDisplayContainer | null = null;
  private adsLoader: IMAAdsLoader | null = null;
  private adsManager: IMAAdsManager | null = null;
  private currentResolve: ((result: AdResult) => void) | null = null;
  private adTagUrl: string = '';

  /**
   * Check if IMA SDK is loaded
   */
  private isIMALoaded(): boolean {
    return typeof window !== 'undefined' && !!window.google?.ima;
  }

  /**
   * Initialize the Google IMA provider
   */
  async initialize(config: AdProviderConfig): Promise<void> {
    this.config = config;

    // Get ad tag URL from config or environment
    this.adTagUrl = config.defaultAdUnitId ||
      (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GOOGLE_IMA_AD_TAG_URL : '') ||
      '';

    if (!this.adTagUrl) {
      console.warn('[GoogleIMAProvider] No ad tag URL configured. Set VITE_GOOGLE_IMA_AD_TAG_URL in .env');
    }

    // Check if IMA SDK is available
    if (!this.isIMALoaded()) {
      console.error(
        '[GoogleIMAProvider] Google IMA SDK not loaded. Add this to index.html:\n' +
        '<script src="https://imasdk.googleapis.com/js/sdkloader/ima3.js"></script>'
      );
      throw new Error('Google IMA SDK not loaded');
    }

    // Create container elements for ads
    this.createAdElements();

    this._isInitialized = true;
    console.log('[GoogleIMAProvider] Initialized');
  }

  /**
   * Create DOM elements needed for ad playback
   */
  private createAdElements(): void {
    // Create container div
    this.adContainer = document.createElement('div');
    this.adContainer.id = 'ad-container';
    this.adContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10000;
      display: none;
      background: rgba(0, 0, 0, 0.9);
    `;

    // Create video element for ad playback
    this.videoElement = document.createElement('video');
    this.videoElement.id = 'ad-video';
    this.videoElement.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
    `;

    this.adContainer.appendChild(this.videoElement);
    document.body.appendChild(this.adContainer);
  }

  /**
   * Initialize IMA SDK components
   */
  private initializeIMA(): void {
    if (!this.adContainer || !this.videoElement || !window.google?.ima) {
      return;
    }

    // Create ad display container
    this.adDisplayContainer = new window.google.ima.AdDisplayContainer(
      this.adContainer,
      this.videoElement
    );

    // Create ads loader
    this.adsLoader = new window.google.ima.AdsLoader(this.adDisplayContainer);

    // Listen for ads manager loaded
    this.adsLoader.addEventListener(
      window.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      this.onAdsManagerLoaded.bind(this)
    );

    // Listen for errors
    this.adsLoader.addEventListener(
      window.google.ima.AdErrorEvent.Type.AD_ERROR,
      this.onAdError.bind(this)
    );
  }

  /**
   * Handle ads manager loaded event
   */
  private onAdsManagerLoaded(event: any): void {
    if (!window.google?.ima) return;

    // Get the ads manager
    this.adsManager = event.getAdsManager(this.videoElement);

    const adsManager = this.adsManager;
    if (!adsManager) return;

    // Add event listeners
    adsManager.addEventListener(
      window.google.ima.AdEvent.Type.STARTED,
      () => {
        this.config.onAdStarted?.();
        this._isLoading = false;
        this._isPlaying = true;
      }
    );

    adsManager.addEventListener(
      window.google.ima.AdEvent.Type.COMPLETE,
      () => {
        this.config.onAdCompleted?.();
        this.completeAd(true);
      }
    );

    adsManager.addEventListener(
      window.google.ima.AdEvent.Type.SKIPPED,
      () => {
        this.config.onAdSkipped?.();
        this.completeAd(false, true);
      }
    );

    adsManager.addEventListener(
      window.google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
      () => {
        this.cleanupAdsManager();
      }
    );

    // Progress updates
    const progressInterval = setInterval(() => {
      if (this.adsManager && this._isPlaying) {
        const remaining = this.adsManager.getRemainingTime();
        // Approximate progress (assuming 30 second ad)
        const progress = Math.max(0, 1 - remaining / 30);
        this.config.onAdProgress?.(progress);
      } else {
        clearInterval(progressInterval);
      }
    }, 500);

    // Initialize and start
    try {
      const containerWidth = this.adContainer?.clientWidth ?? 640;
      const containerHeight = this.adContainer?.clientHeight ?? 360;
      adsManager.init(
        containerWidth,
        containerHeight,
        window.google.ima.ViewMode.NORMAL
      );
      adsManager.start();
      this.config.onAdReady?.();
    } catch (error) {
      console.error('[GoogleIMAProvider] Error starting ad:', error);
      this.onAdError({ getError: () => error });
    }
  }

  /**
   * Handle ad errors
   */
  private onAdError(event: any): void {
    const error = event.getError?.()?.toString() || 'Unknown ad error';
    console.error('[GoogleIMAProvider] Ad error:', error);
    this.config.onAdError?.(error);
    this.completeAd(false, false, error);
    this.cleanupAdsManager();
  }

  /**
   * Complete the current ad
   */
  private completeAd(completed: boolean, skipped = false, error?: string): void {
    this._isPlaying = false;
    this._isLoading = false;

    // Hide ad container
    if (this.adContainer) {
      this.adContainer.style.display = 'none';
    }

    // Generate verification token for completed ads
    // In production, this should come from Google's server-side verification
    const verificationToken = completed
      ? `ima_${Date.now()}_${Math.random().toString(36).substring(7)}`
      : undefined;

    this.currentResolve?.({
      success: completed,
      completed,
      skipped,
      verificationToken,
      error,
    });
    this.currentResolve = null;
  }

  /**
   * Cleanup ads manager
   */
  private cleanupAdsManager(): void {
    if (this.adsManager) {
      this.adsManager.destroy();
      this.adsManager = null;
    }
  }

  /**
   * Check if an ad is available
   */
  async isAdAvailable(_rewardType: AdRewardType): Promise<boolean> {
    return this._isInitialized && !!this.adTagUrl && this.isIMALoaded();
  }

  /**
   * Preload an ad (IMA SDK handles this automatically)
   */
  async preloadAd(_rewardType: AdRewardType): Promise<void> {
    // IMA SDK handles preloading automatically
  }

  /**
   * Show a rewarded video ad
   */
  async showRewardedAd(rewardType: AdRewardType): Promise<AdResult> {
    if (!this._isInitialized) {
      return {
        success: false,
        completed: false,
        error: 'Provider not initialized',
      };
    }

    if (!this.adTagUrl) {
      return {
        success: false,
        completed: false,
        error: 'No ad tag URL configured',
      };
    }

    if (this._isPlaying || this._isLoading) {
      return {
        success: false,
        completed: false,
        error: 'An ad is already in progress',
      };
    }

    this._isLoading = true;
    this.config.onAdLoading?.();

    // Show ad container
    if (this.adContainer) {
      this.adContainer.style.display = 'block';
    }

    // Initialize IMA if needed
    if (!this.adsLoader) {
      this.initializeIMA();
    }

    // Initialize ad display container (required before requesting ads)
    this.adDisplayContainer?.initialize();

    return new Promise((resolve) => {
      this.currentResolve = resolve;

      if (!window.google?.ima || !this.adsLoader) {
        this.completeAd(false, false, 'IMA SDK not available');
        return;
      }

      // Create ads request
      const adsRequest = new window.google.ima.AdsRequest();

      // Get ad unit ID for this reward type, or use default
      const adUnitId = this.config.adUnitIds?.[rewardType] || this.adTagUrl;
      adsRequest.adTagUrl = adUnitId;
      adsRequest.linearAdSlotWidth = this.adContainer?.clientWidth || 640;
      adsRequest.linearAdSlotHeight = this.adContainer?.clientHeight || 360;

      // Request ads
      this.adsLoader.requestAds(adsRequest);
    });
  }

  /**
   * Cleanup the provider
   */
  destroy(): void {
    this.cleanupAdsManager();

    if (this.adsLoader) {
      this.adsLoader.destroy();
      this.adsLoader = null;
    }

    if (this.adDisplayContainer) {
      this.adDisplayContainer.destroy();
      this.adDisplayContainer = null;
    }

    if (this.adContainer) {
      this.adContainer.remove();
      this.adContainer = null;
    }

    this.videoElement = null;
    this.currentResolve = null;

    super.destroy();
  }
}

/**
 * Singleton instance
 */
let googleIMAProviderInstance: GoogleIMAProvider | null = null;

export function getGoogleIMAProvider(): GoogleIMAProvider {
  if (!googleIMAProviderInstance) {
    googleIMAProviderInstance = new GoogleIMAProvider();
  }
  return googleIMAProviderInstance;
}
