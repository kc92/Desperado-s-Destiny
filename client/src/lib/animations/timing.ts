/**
 * Animation Timing & Easing Constants
 * Authoritative source for all animation timing in Desperados Destiny
 *
 * Phase 17: UI Polish - Animation System Unification
 */

// =============================================================================
// DURATION CONSTANTS (in seconds for Framer Motion, ms for CSS)
// =============================================================================

export const duration = {
  /** 0.1s - instant feedback (tooltips, micro-interactions) */
  instant: 0.1,
  /** 0.15s - fast interactions (hover states, button feedback) */
  fast: 0.15,
  /** 0.3s - standard transitions (modals, panels) */
  base: 0.3,
  /** 0.5s - slow, deliberate transitions (page transitions) */
  slow: 0.5,
  /** 0.8s - dramatic reveals (rewards, victories) */
  dramatic: 0.8,
  /** 1.2s - extended animations (combat effects) */
  extended: 1.2,
} as const;

// CSS-compatible millisecond versions
export const durationMs = {
  instant: 100,
  fast: 150,
  base: 300,
  slow: 500,
  dramatic: 800,
  extended: 1200,
} as const;

// =============================================================================
// EASING CURVES
// =============================================================================

/**
 * Easing curves for consistent animation feel
 * Named for western "snap" aesthetic
 */
export const easing = {
  /** Standard ease-out for most transitions */
  default: [0.4, 0, 0.2, 1] as [number, number, number, number],

  /** Sharp snap for quick actions (card deals, button clicks) */
  snap: [0.25, 0.1, 0.25, 1] as [number, number, number, number],

  /** Smooth deceleration for entering elements */
  enter: [0, 0, 0.2, 1] as [number, number, number, number],

  /** Quick acceleration for exiting elements */
  exit: [0.4, 0, 1, 1] as [number, number, number, number],

  /** Bouncy overshoot for playful interactions */
  bounce: [0.34, 1.56, 0.64, 1] as [number, number, number, number],

  /** Spring-like for attention-grabbing */
  spring: [0.68, -0.55, 0.27, 1.55] as [number, number, number, number],

  /** Linear for continuous animations (progress bars, spinners) */
  linear: [0, 0, 1, 1] as [number, number, number, number],
} as const;

// CSS-compatible string versions
export const easingCss = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  snap: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  enter: 'cubic-bezier(0, 0, 0.2, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  spring: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
  linear: 'linear',
} as const;

// =============================================================================
// STAGGER DELAYS
// =============================================================================

export const stagger = {
  /** 0.05s - rapid succession (list items) */
  fast: 0.05,
  /** 0.1s - standard stagger (cards, menu items) */
  base: 0.1,
  /** 0.15s - deliberate stagger (build tension) */
  slow: 0.15,
  /** 0.2s - dramatic stagger (reveals) */
  dramatic: 0.2,
} as const;

// =============================================================================
// SPRING CONFIGS (for Framer Motion spring animations)
// =============================================================================

export const spring = {
  /** Snappy spring - quick response, minimal overshoot */
  snappy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
  },
  /** Bouncy spring - playful with overshoot */
  bouncy: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 20,
  },
  /** Soft spring - gentle, floaty feel */
  soft: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 25,
  },
  /** Stiff spring - very quick, minimal motion */
  stiff: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 35,
  },
} as const;

// =============================================================================
// DELAY PRESETS
// =============================================================================

export const delay = {
  /** No delay */
  none: 0,
  /** 0.1s - micro pause */
  micro: 0.1,
  /** 0.2s - short pause */
  short: 0.2,
  /** 0.3s - medium pause */
  medium: 0.3,
  /** 0.5s - long pause */
  long: 0.5,
  /** 0.8s - dramatic pause */
  dramatic: 0.8,
} as const;

// =============================================================================
// COMBINED EXPORT
// =============================================================================

export const timing = {
  duration,
  durationMs,
  easing,
  easingCss,
  stagger,
  spring,
  delay,
} as const;

export type TimingToken = typeof timing;
