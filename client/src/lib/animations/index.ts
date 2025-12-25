/**
 * Animation System - Central Export
 * Authoritative source for all animation constants and utilities
 *
 * Phase 17: UI Polish - Animation System Unification
 *
 * This module consolidates:
 * - Timing constants (durations, easing curves, springs)
 * - Framer Motion presets (variants for common patterns)
 * - Animation hooks (reduced motion support, sequencing)
 *
 * @example
 * ```tsx
 * import { presets, useAnimationConfig, duration, easing } from '@/lib/animations';
 *
 * function MyComponent() {
 *   const { shouldAnimate, getTransition } = useAnimationConfig();
 *
 *   return (
 *     <motion.div
 *       variants={presets.fadeInUp}
 *       initial="hidden"
 *       animate="visible"
 *       transition={getTransition('base')}
 *     />
 *   );
 * }
 * ```
 */

// =============================================================================
// TIMING EXPORTS
// =============================================================================

export {
  duration,
  durationMs,
  easing,
  easingCss,
  stagger,
  spring,
  delay,
  timing,
  type TimingToken,
} from './timing';

// =============================================================================
// PRESET EXPORTS
// =============================================================================

export {
  // Fade animations
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  // Scale animations
  scaleIn,
  scaleInBounce,
  popIn,
  // Slide animations
  slideInFromBottom,
  slideInFromTop,
  slideInFromLeft,
  slideInFromRight,
  // Stagger animations
  staggerContainer,
  staggerContainerFast,
  staggerContainerSlow,
  staggerItem,
  // Modal animations
  modalBackdrop,
  modalContent,
  drawer,
  // Interaction animations
  buttonPress,
  hoverLift,
  cardHover,
  // Western-themed
  goldGlow,
  bloodPulse,
  shake,
  // Loading animations
  spin,
  pulse,
  shimmer,
  // Transition presets
  transitions,
  // Combined object
  presets,
  type AnimationPreset,
} from './presets';

// =============================================================================
// HOOK EXPORTS
// =============================================================================

export {
  // Reduced motion
  prefersReducedMotion,
  useReducedMotion,
  // Animation config
  useAnimationConfig,
  // Animation utilities
  useAnimationSequence,
  useStagger,
  useHoverAnimation,
  useEntranceAnimation,
} from './hooks';

// =============================================================================
// COMBINED ANIMATIONS OBJECT
// =============================================================================

import { timing } from './timing';
import { presets } from './presets';

export const animations = {
  timing,
  presets,
} as const;

export default animations;
