/**
 * useMobile Hook
 * Detects mobile devices and touch capabilities
 * Optimizes UI behavior for mobile users
 */

import { useState, useEffect } from 'react';

interface MobileDetection {
  /** Whether the device is mobile (screen width <= 768px) */
  isMobile: boolean;
  /** Whether the device is a small mobile (screen width <= 480px) */
  isSmallMobile: boolean;
  /** Whether the device is a tablet (768px < width <= 1024px) */
  isTablet: boolean;
  /** Whether the device supports touch */
  isTouch: boolean;
  /** Whether the device is in landscape orientation */
  isLandscape: boolean;
  /** Current screen width */
  screenWidth: number;
  /** Current screen height */
  screenHeight: number;
}

/**
 * Hook to detect mobile devices and capabilities
 * Updates on window resize and orientation change
 */
export function useMobile(): MobileDetection {
  const [detection, setDetection] = useState<MobileDetection>(() => {
    // Initial detection (SSR-safe)
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isSmallMobile: false,
        isTablet: false,
        isTouch: false,
        isLandscape: false,
        screenWidth: 0,
        screenHeight: 0,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
      isMobile: width <= 768,
      isSmallMobile: width <= 480,
      isTablet: width > 768 && width <= 1024,
      isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      isLandscape: width > height,
      screenWidth: width,
      screenHeight: height,
    };
  });

  useEffect(() => {
    // Function to update detection
    const updateDetection = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setDetection({
        isMobile: width <= 768,
        isSmallMobile: width <= 480,
        isTablet: width > 768 && width <= 1024,
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        isLandscape: width > height,
        screenWidth: width,
        screenHeight: height,
      });
    };

    // Debounce resize events for performance
    let resizeTimer: NodeJS.Timeout;
    const debouncedUpdate = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateDetection, 150);
    };

    // Listen for resize and orientation change
    window.addEventListener('resize', debouncedUpdate);
    window.addEventListener('orientationchange', updateDetection);

    // Initial update
    updateDetection();

    // Cleanup
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('orientationchange', updateDetection);
    };
  }, []);

  return detection;
}

/**
 * Hook to detect if user prefers reduced motion
 * Respects accessibility preferences
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to detect network connection quality
 * Helps optimize content delivery on mobile
 */
export function useConnectionQuality(): {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
} {
  const [connection, setConnection] = useState(() => {
    if (typeof window === 'undefined' || !('connection' in navigator)) {
      return {
        effectiveType: '4g',
        downlink: 10,
        rtt: 50,
        saveData: false,
      };
    }

    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    return {
      effectiveType: conn?.effectiveType || '4g',
      downlink: conn?.downlink || 10,
      rtt: conn?.rtt || 50,
      saveData: conn?.saveData || false,
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('connection' in navigator)) return;

    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

    if (!conn) return;

    const updateConnection = () => {
      setConnection({
        effectiveType: conn.effectiveType || '4g',
        downlink: conn.downlink || 10,
        rtt: conn.rtt || 50,
        saveData: conn.saveData || false,
      });
    };

    conn.addEventListener('change', updateConnection);

    return () => {
      conn.removeEventListener('change', updateConnection);
    };
  }, []);

  return connection;
}

export default useMobile;
