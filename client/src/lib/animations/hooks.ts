/**
 * Animation Hooks
 * React hooks for animation configuration with accessibility support
 *
 * Phase 17: UI Polish - Animation System Unification
 *
 * @example
 * ```tsx
 * import { useAnimationConfig, useReducedMotion } from '@/lib/animations';
 *
 * function MyComponent() {
 *   const { shouldAnimate, getTransition } = useAnimationConfig();
 *
 *   return (
 *     <motion.div
 *       animate={{ opacity: 1 }}
 *       transition={getTransition('base')}
 *     />
 *   );
 * }
 * ```
 */

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Transition, Variants } from 'framer-motion';
import { duration, easing, spring } from './timing';
import { transitions as transitionPresets } from './presets';

// =============================================================================
// REDUCED MOTION DETECTION
// =============================================================================

/**
 * Check if user prefers reduced motion
 * SSR-safe with hydration handling
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Hook to detect reduced motion preference
 * Updates on system preference change
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(() => prefersReducedMotion());

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
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

  return reducedMotion;
}

// =============================================================================
// ANIMATION CONFIG HOOK
// =============================================================================

type DurationKey = keyof typeof duration;
type EasingKey = keyof typeof easing;
type SpringKey = keyof typeof spring;

type SpringConfig = {
  type: 'spring';
  stiffness: number;
  damping: number;
};

interface AnimationConfig {
  /** Whether animations should play (false if reduced motion) */
  shouldAnimate: boolean;

  /** Get duration value (returns 0 if reduced motion) */
  getDuration: (key: DurationKey) => number;

  /** Get easing curve */
  getEasing: (key: EasingKey) => [number, number, number, number];

  /** Get spring config */
  getSpring: (key: SpringKey) => SpringConfig;

  /** Get transition preset (instant if reduced motion) */
  getTransition: (key: keyof typeof transitionPresets) => Transition;

  /** Apply reduced motion to any variants object */
  applyReducedMotion: (variants: Variants) => Variants;

  /** Motion multiplier (0 if reduced, 1 if normal) */
  motionMultiplier: number;
}

/**
 * Hook providing animation configuration with reduced motion support
 */
export function useAnimationConfig(): AnimationConfig {
  const reducedMotion = useReducedMotion();

  const motionMultiplier = reducedMotion ? 0 : 1;

  const getDuration = useCallback(
    (key: DurationKey): number => {
      return reducedMotion ? 0.01 : duration[key];
    },
    [reducedMotion]
  );

  const getEasing = useCallback(
    (key: EasingKey): [number, number, number, number] => {
      return easing[key];
    },
    []
  );

  const getSpring = useCallback(
    (key: SpringKey): SpringConfig => {
      if (reducedMotion) {
        return { type: 'spring', stiffness: 1000, damping: 100 };
      }
      return { ...spring[key] };
    },
    [reducedMotion]
  );

  const getTransition = useCallback(
    (key: keyof typeof transitionPresets): Transition => {
      if (reducedMotion) {
        return { duration: 0.01 };
      }
      return transitionPresets[key];
    },
    [reducedMotion]
  );

  const applyReducedMotion = useCallback(
    (variants: Variants): Variants => {
      if (!reducedMotion) return variants;

      const reduced: Variants = {};
      for (const [key, value] of Object.entries(variants)) {
        if (typeof value === 'object' && value !== null) {
          reduced[key] = {
            ...value,
            transition: { duration: 0.01 },
          };
        } else {
          reduced[key] = value;
        }
      }
      return reduced;
    },
    [reducedMotion]
  );

  return useMemo(
    () => ({
      shouldAnimate: !reducedMotion,
      getDuration,
      getEasing,
      getSpring,
      getTransition,
      applyReducedMotion,
      motionMultiplier,
    }),
    [
      reducedMotion,
      getDuration,
      getEasing,
      getSpring,
      getTransition,
      applyReducedMotion,
      motionMultiplier,
    ]
  );
}

// =============================================================================
// ANIMATION STATE HOOKS
// =============================================================================

type AnimationState = 'idle' | 'animating' | 'complete';

interface UseAnimationSequenceOptions {
  /** Auto-start the sequence */
  autoStart?: boolean;
  /** Delay before starting (ms) */
  delay?: number;
  /** Callback when sequence completes */
  onComplete?: () => void;
}

/**
 * Hook for managing animation sequence state
 */
export function useAnimationSequence(options: UseAnimationSequenceOptions = {}) {
  const { autoStart = false, delay = 0, onComplete } = options;
  const [state, setState] = useState<AnimationState>('idle');

  const start = useCallback(() => {
    if (delay > 0) {
      setTimeout(() => setState('animating'), delay);
    } else {
      setState('animating');
    }
  }, [delay]);

  const complete = useCallback(() => {
    setState('complete');
    onComplete?.();
  }, [onComplete]);

  const reset = useCallback(() => {
    setState('idle');
  }, []);

  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [autoStart, start]);

  return {
    state,
    isIdle: state === 'idle',
    isAnimating: state === 'animating',
    isComplete: state === 'complete',
    start,
    complete,
    reset,
  };
}

// =============================================================================
// STAGGER ANIMATION HOOK
// =============================================================================

interface UseStaggerOptions {
  /** Number of items to stagger */
  count: number;
  /** Base delay between items (seconds) */
  staggerDelay?: number;
  /** Initial delay before first item (seconds) */
  initialDelay?: number;
}

/**
 * Hook for calculating stagger delays
 */
export function useStagger(options: UseStaggerOptions) {
  const { count, staggerDelay = 0.1, initialDelay = 0 } = options;
  const reducedMotion = useReducedMotion();

  return useMemo(() => {
    if (reducedMotion) {
      return Array(count).fill(0);
    }

    return Array.from({ length: count }, (_, i) => initialDelay + i * staggerDelay);
  }, [count, staggerDelay, initialDelay, reducedMotion]);
}

// =============================================================================
// HOVER/FOCUS STATE HOOK
// =============================================================================

interface UseHoverAnimationReturn {
  isHovered: boolean;
  isFocused: boolean;
  isActive: boolean;
  handlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
  };
  animationState: 'idle' | 'hover' | 'focus';
}

/**
 * Hook for managing hover/focus animation states
 */
export function useHoverAnimation(): UseHoverAnimationReturn {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handlers = useMemo(
    () => ({
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
    }),
    []
  );

  const animationState = useMemo(() => {
    if (isHovered) return 'hover';
    if (isFocused) return 'focus';
    return 'idle';
  }, [isHovered, isFocused]);

  return {
    isHovered,
    isFocused,
    isActive: isHovered || isFocused,
    handlers,
    animationState,
  };
}

// =============================================================================
// ENTRANCE ANIMATION HOOK
// =============================================================================

interface UseEntranceAnimationOptions {
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Whether component should animate on mount */
  animateOnMount?: boolean;
}

/**
 * Hook for managing entrance animations
 */
export function useEntranceAnimation(options: UseEntranceAnimationOptions = {}) {
  const { delay = 0, animateOnMount = true } = options;
  const [hasEntered, setHasEntered] = useState(!animateOnMount);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!animateOnMount || reducedMotion) {
      setHasEntered(true);
      return;
    }

    const timer = setTimeout(() => {
      setHasEntered(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [animateOnMount, delay, reducedMotion]);

  return {
    hasEntered,
    animate: hasEntered ? 'visible' : 'hidden',
    initial: animateOnMount && !reducedMotion ? 'hidden' : 'visible',
  };
}
