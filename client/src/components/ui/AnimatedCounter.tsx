/**
 * AnimatedCounter Component
 * Smooth animated number transitions for currency/XP displays
 *
 * Phase 2: UX Polish - Feedback animations
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export type EasingFunction = 'linear' | 'easeOut' | 'easeInOut';

export interface AnimatedCounterProps {
  /** Current value to display */
  value: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Prefix to display before the number (e.g., "$") */
  prefix?: string;
  /** Suffix to display after the number (e.g., " XP") */
  suffix?: string;
  /** Custom number formatter */
  formatter?: (value: number) => string;
  /** Show color change on increase (green) / decrease (red) */
  showDelta?: boolean;
  /** Duration to show delta color in ms */
  deltaColorDuration?: number;
  /** Easing function for animation */
  easing?: EasingFunction;
  /** Additional CSS classes */
  className?: string;
  /** Callback when animation completes */
  onComplete?: () => void;
}

// =============================================================================
// EASING FUNCTIONS
// =============================================================================

const easingFunctions: Record<EasingFunction, (t: number) => number> = {
  linear: (t) => t,
  easeOut: (t) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
};

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Animated counter with smooth number transitions
 *
 * @example
 * ```tsx
 * // Currency display
 * <AnimatedCounter value={goldAmount} prefix="$" showDelta />
 *
 * // XP display
 * <AnimatedCounter value={xpAmount} suffix=" XP" />
 *
 * // Custom formatting
 * <AnimatedCounter
 *   value={percentage}
 *   formatter={(v) => `${v.toFixed(1)}%`}
 * />
 * ```
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 500,
  prefix = '',
  suffix = '',
  formatter = (v) => Math.round(v).toLocaleString(),
  showDelta = false,
  deltaColorDuration = 1000,
  easing = 'easeOut',
  className = '',
  onComplete,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [deltaDirection, setDeltaDirection] = useState<'increase' | 'decrease' | null>(null);
  const previousValueRef = useRef(value);
  const animationRef = useRef<number | null>(null);
  const deltaTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Get delta color classes
  const getDeltaColorClass = useCallback(() => {
    if (!showDelta || !deltaDirection) return '';
    return deltaDirection === 'increase'
      ? 'text-green-500'
      : 'text-blood-crimson';
  }, [showDelta, deltaDirection]);

  // Animate from previous value to new value
  useEffect(() => {
    const startValue = previousValueRef.current;
    const endValue = value;
    const diff = endValue - startValue;

    // Update previous value reference
    previousValueRef.current = value;

    // No animation needed if value hasn't changed
    if (diff === 0) return;

    // Set delta direction for color
    if (showDelta) {
      setDeltaDirection(diff > 0 ? 'increase' : 'decrease');

      // Clear previous timeout
      if (deltaTimeoutRef.current) {
        clearTimeout(deltaTimeoutRef.current);
      }

      // Reset delta color after duration
      deltaTimeoutRef.current = setTimeout(() => {
        setDeltaDirection(null);
      }, deltaColorDuration);
    }

    // Skip animation if user prefers reduced motion
    if (prefersReducedMotion.current) {
      setDisplayValue(endValue);
      onComplete?.();
      return;
    }

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startTime = performance.now();
    const easingFn = easingFunctions[easing];

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easingFn(progress);

      const currentValue = startValue + diff * easedProgress;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        animationRef.current = null;
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, easing, showDelta, deltaColorDuration, onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (deltaTimeoutRef.current) {
        clearTimeout(deltaTimeoutRef.current);
      }
    };
  }, []);

  return (
    <span
      className={`
        inline-block tabular-nums
        transition-colors duration-300
        ${getDeltaColorClass()}
        ${deltaDirection ? 'animate-count-up' : ''}
        ${className}
      `}
      aria-live="polite"
      aria-atomic="true"
    >
      {prefix}
      {formatter(displayValue)}
      {suffix}
    </span>
  );
};

AnimatedCounter.displayName = 'AnimatedCounter';

export default AnimatedCounter;
