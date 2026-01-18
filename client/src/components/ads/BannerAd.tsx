/**
 * BannerAd Component
 * Displays banner advertisements for passive revenue
 *
 * Supports multiple ad sizes and lazy loading for performance.
 * In development mode, shows a placeholder. In production,
 * integrates with Google AdSense or Ad Manager.
 *
 * Usage:
 *   <BannerAd size="leaderboard" />
 *   <BannerAd size="medium-rectangle" className="my-4" />
 */

import React, { useEffect, useRef, useState } from 'react';

/**
 * Standard IAB ad sizes
 */
export type BannerAdSize =
  | 'leaderboard' // 728x90
  | 'medium-rectangle' // 300x250
  | 'large-rectangle' // 336x280
  | 'skyscraper' // 120x600
  | 'wide-skyscraper'; // 160x600

/**
 * Size dimensions mapping
 */
const AD_DIMENSIONS: Record<BannerAdSize, { width: number; height: number }> = {
  'leaderboard': { width: 728, height: 90 },
  'medium-rectangle': { width: 300, height: 250 },
  'large-rectangle': { width: 336, height: 280 },
  'skyscraper': { width: 120, height: 600 },
  'wide-skyscraper': { width: 160, height: 600 },
};

/**
 * Default ad slots from environment
 */
const DEFAULT_AD_SLOTS: Partial<Record<BannerAdSize, string>> = {
  'leaderboard': import.meta.env.VITE_AD_SLOT_LEADERBOARD,
  'medium-rectangle': import.meta.env.VITE_AD_SLOT_MEDIUM_RECT,
};

interface BannerAdProps {
  /** Ad size variant */
  size: BannerAdSize;
  /** Additional CSS classes */
  className?: string;
  /** Ad slot ID (for Google AdSense) - defaults to env var for size */
  adSlot?: string;
  /** Whether to lazy load the ad */
  lazy?: boolean;
}

/**
 * BannerAd component for displaying banner advertisements
 */
export const BannerAd: React.FC<BannerAdProps> = ({
  size,
  className = '',
  adSlot: propAdSlot,
  lazy = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(!lazy);
  const [adBlocked, setAdBlocked] = useState(false);
  const dimensions = AD_DIMENSIONS[size];

  // Use provided adSlot or default from environment
  const adSlot = propAdSlot || DEFAULT_AD_SLOTS[size];

  // Check if we're in development mode
  const isDev = import.meta.env.DEV;

  // Lazy load using Intersection Observer
  useEffect(() => {
    if (!lazy || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isVisible]);

  // Initialize Google AdSense when visible (production only)
  useEffect(() => {
    if (!isVisible || isDev || !adSlot) return;

    try {
      // Check if adsbygoogle is available
      const adsbygoogle = (window as any).adsbygoogle;
      if (adsbygoogle) {
        adsbygoogle.push({});
      }
    } catch (error) {
      console.warn('[BannerAd] AdSense initialization failed:', error);
      setAdBlocked(true);
    }
  }, [isVisible, isDev, adSlot]);

  // Development placeholder
  if (isDev || !adSlot) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center bg-wood-dark/30 border-2 border-dashed border-wood-medium rounded-lg ${className}`}
        style={{ width: dimensions.width, height: dimensions.height, maxWidth: '100%' }}
      >
        <div className="text-center text-desert-muted text-sm">
          <div className="text-lg mb-1">Ad Space</div>
          <div className="text-xs opacity-75">
            {dimensions.width}x{dimensions.height}
          </div>
        </div>
      </div>
    );
  }

  // Ad blocked fallback
  if (adBlocked) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center bg-wood-dark/20 rounded-lg ${className}`}
        style={{ width: dimensions.width, height: dimensions.height, maxWidth: '100%' }}
      >
        <div className="text-center text-desert-muted text-xs p-2">
          <div>Support Desperados Destiny</div>
          <div className="opacity-75">Consider disabling your ad blocker</div>
        </div>
      </div>
    );
  }

  // Production AdSense ad
  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${className}`}
      style={{ width: dimensions.width, height: dimensions.height, maxWidth: '100%' }}
    >
      {isVisible && (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: dimensions.width, height: dimensions.height }}
          data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT_ID}
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
};

export default BannerAd;
