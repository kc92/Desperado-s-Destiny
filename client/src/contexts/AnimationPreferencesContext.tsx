/**
 * Animation Preferences Context
 * Three-tier animation system: full / reduced / none
 * Respects system preferences while allowing user override
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Animation preference levels:
 * - full: All animations enabled (default for users without reduced motion)
 * - reduced: Simplified animations, no particle effects, shorter durations
 * - none: No animations at all, instant state changes
 */
export type AnimationPreference = 'full' | 'reduced' | 'none';

interface AnimationPreferencesContextValue {
  /** Current animation preference level */
  preference: AnimationPreference;
  /** Set animation preference (persisted to localStorage) */
  setPreference: (pref: AnimationPreference) => void;
  /** Whether system prefers reduced motion */
  systemPrefersReducedMotion: boolean;
  /** Quick check: should animations play at all? */
  shouldAnimate: boolean;
  /** Quick check: should particle effects play? */
  shouldShowParticles: boolean;
  /** Quick check: should complex effects (banners, celebrations) play? */
  shouldShowEffects: boolean;
  /** Get animation duration multiplier (1 for full, 0.5 for reduced, 0 for none) */
  durationMultiplier: number;
}

const AnimationPreferencesContext = createContext<AnimationPreferencesContextValue | null>(null);

const STORAGE_KEY = 'dd-animation-preference';

/**
 * Check if user's system prefers reduced motion
 */
function getSystemReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * Get initial preference from localStorage or system setting
 */
function getInitialPreference(): AnimationPreference {
  if (typeof window === 'undefined') return 'full';

  // Check localStorage first (user explicitly set preference)
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'full' || stored === 'reduced' || stored === 'none') {
    return stored;
  }

  // Fall back to system preference
  return getSystemReducedMotion() ? 'reduced' : 'full';
}

interface AnimationPreferencesProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for animation preferences
 * Wrap your app with this to enable the useAnimationPreferences hook
 */
export const AnimationPreferencesProvider: React.FC<AnimationPreferencesProviderProps> = ({ children }) => {
  const [preference, setPreferenceState] = useState<AnimationPreference>(getInitialPreference);
  const [systemPrefersReducedMotion, setSystemPrefersReducedMotion] = useState(getSystemReducedMotion);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersReducedMotion(e.matches);

      // Only auto-update if user hasn't explicitly set a preference
      if (!localStorage.getItem(STORAGE_KEY)) {
        setPreferenceState(e.matches ? 'reduced' : 'full');
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  // Persist preference changes
  const setPreference = useCallback((pref: AnimationPreference) => {
    setPreferenceState(pref);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, pref);
    }
  }, []);

  // Computed values
  const value = useMemo<AnimationPreferencesContextValue>(() => ({
    preference,
    setPreference,
    systemPrefersReducedMotion,
    shouldAnimate: preference !== 'none',
    shouldShowParticles: preference === 'full',
    shouldShowEffects: preference === 'full',
    durationMultiplier: preference === 'full' ? 1 : preference === 'reduced' ? 0.5 : 0,
  }), [preference, setPreference, systemPrefersReducedMotion]);

  return (
    <AnimationPreferencesContext.Provider value={value}>
      {children}
    </AnimationPreferencesContext.Provider>
  );
};

/**
 * Hook to access animation preferences
 * @throws Error if used outside AnimationPreferencesProvider
 */
export function useAnimationPreferences(): AnimationPreferencesContextValue {
  const context = useContext(AnimationPreferencesContext);

  if (!context) {
    throw new Error(
      'useAnimationPreferences must be used within an AnimationPreferencesProvider. ' +
      'Wrap your app with <AnimationPreferencesProvider> in App.tsx.'
    );
  }

  return context;
}

/**
 * Safe version that returns defaults if not in provider
 * Use this for components that may render outside the provider
 */
export function useAnimationPreferencesSafe(): AnimationPreferencesContextValue {
  const context = useContext(AnimationPreferencesContext);

  if (!context) {
    // Return safe defaults based on system preference
    const systemReduced = getSystemReducedMotion();
    return {
      preference: systemReduced ? 'reduced' : 'full',
      setPreference: () => {},
      systemPrefersReducedMotion: systemReduced,
      shouldAnimate: true,
      shouldShowParticles: !systemReduced,
      shouldShowEffects: !systemReduced,
      durationMultiplier: systemReduced ? 0.5 : 1,
    };
  }

  return context;
}

export default AnimationPreferencesContext;
