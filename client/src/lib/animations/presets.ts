/**
 * Framer Motion Animation Presets
 * Reusable motion variants for common animation patterns
 *
 * Phase 17: UI Polish - Animation System Unification
 *
 * @example
 * ```tsx
 * import { presets } from '@/lib/animations';
 *
 * <motion.div
 *   variants={presets.fadeIn}
 *   initial="hidden"
 *   animate="visible"
 * />
 * ```
 */

import { Variants, Transition } from 'framer-motion';
import { duration, easing, stagger, spring } from './timing';

// =============================================================================
// FADE ANIMATIONS
// =============================================================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.base, ease: easing.enter },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast, ease: easing.exit },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: easing.enter },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: duration.fast, ease: easing.exit },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: easing.enter },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: duration.fast, ease: easing.exit },
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.base, ease: easing.enter },
  },
  exit: {
    opacity: 0,
    x: 30,
    transition: { duration: duration.fast, ease: easing.exit },
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: duration.base, ease: easing.enter },
  },
  exit: {
    opacity: 0,
    x: -30,
    transition: { duration: duration.fast, ease: easing.exit },
  },
};

// =============================================================================
// SCALE ANIMATIONS
// =============================================================================

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.base, ease: easing.bounce },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: duration.fast, ease: easing.exit },
  },
};

export const scaleInBounce: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: spring.bouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: duration.fast },
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: [0.8, 1.1, 1],
    transition: {
      duration: duration.base,
      ease: easing.spring,
      times: [0, 0.6, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: duration.fast },
  },
};

// =============================================================================
// SLIDE ANIMATIONS
// =============================================================================

export const slideInFromBottom: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: duration.base, ease: easing.enter },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: duration.fast, ease: easing.exit },
  },
};

export const slideInFromTop: Variants = {
  hidden: { y: '-100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: duration.base, ease: easing.enter },
  },
  exit: {
    y: '-100%',
    opacity: 0,
    transition: { duration: duration.fast, ease: easing.exit },
  },
};

export const slideInFromLeft: Variants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: duration.base, ease: easing.enter },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: { duration: duration.fast, ease: easing.exit },
  },
};

export const slideInFromRight: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: duration.base, ease: easing.enter },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: { duration: duration.fast, ease: easing.exit },
  },
};

// =============================================================================
// CONTAINER ANIMATIONS (with stagger)
// =============================================================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.base,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: stagger.fast,
      staggerDirection: -1,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.fast,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger.slow,
      delayChildren: 0.2,
    },
  },
};

// Stagger child item (use with staggerContainer)
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: easing.enter },
  },
};

// =============================================================================
// MODAL / OVERLAY ANIMATIONS
// =============================================================================

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: duration.fast },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast, delay: 0.1 },
  },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: spring.bouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: duration.fast },
  },
};

export const drawer: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: { duration: duration.base, ease: easing.enter },
  },
  exit: {
    x: '100%',
    transition: { duration: duration.fast, ease: easing.exit },
  },
};

// =============================================================================
// INTERACTION ANIMATIONS
// =============================================================================

export const buttonPress: Variants = {
  idle: { scale: 1 },
  pressed: { scale: 0.95 },
  hover: { scale: 1.02 },
};

export const hoverLift: Variants = {
  idle: { y: 0, boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' },
  hover: { y: -4, boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)' },
};

export const cardHover: Variants = {
  idle: {
    y: 0,
    scale: 1,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: '0 12px 24px rgba(210, 105, 30, 0.4)',
    transition: { duration: duration.fast, ease: easing.enter },
  },
};

// =============================================================================
// WESTERN-THEMED ANIMATIONS
// =============================================================================

export const goldGlow: Variants = {
  idle: { boxShadow: '0 0 0 rgba(255, 215, 0, 0)' },
  glowing: {
    boxShadow: [
      '0 0 0 rgba(255, 215, 0, 0)',
      '0 0 30px rgba(255, 215, 0, 0.9)',
      '0 0 15px rgba(255, 215, 0, 0.6)',
    ],
    transition: {
      duration: duration.extended,
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
};

export const bloodPulse: Variants = {
  idle: { backgroundColor: 'rgba(139, 0, 0, 0)' },
  pulse: {
    backgroundColor: [
      'rgba(139, 0, 0, 0)',
      'rgba(139, 0, 0, 0.3)',
      'rgba(139, 0, 0, 0)',
    ],
    transition: { duration: duration.slow },
  },
};

export const shake: Variants = {
  idle: { x: 0 },
  shaking: {
    x: [-5, 5, -5, 5, 0],
    transition: { duration: duration.slow },
  },
};

// =============================================================================
// LOADING ANIMATIONS
// =============================================================================

export const spin: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

export const shimmer: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

// =============================================================================
// TRANSITION PRESETS
// =============================================================================

export const transitions = {
  instant: { duration: duration.instant, ease: easing.default } as Transition,
  fast: { duration: duration.fast, ease: easing.snap } as Transition,
  base: { duration: duration.base, ease: easing.default } as Transition,
  slow: { duration: duration.slow, ease: easing.default } as Transition,
  bouncy: spring.bouncy as Transition,
  snappy: spring.snappy as Transition,
} as const;

// =============================================================================
// COMBINED EXPORT
// =============================================================================

export const presets = {
  // Fade
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  // Scale
  scaleIn,
  scaleInBounce,
  popIn,
  // Slide
  slideInFromBottom,
  slideInFromTop,
  slideInFromLeft,
  slideInFromRight,
  // Stagger
  staggerContainer,
  staggerContainerFast,
  staggerContainerSlow,
  staggerItem,
  // Modal
  modalBackdrop,
  modalContent,
  drawer,
  // Interaction
  buttonPress,
  hoverLift,
  cardHover,
  // Western
  goldGlow,
  bloodPulse,
  shake,
  // Loading
  spin,
  pulse,
  shimmer,
  // Transitions
  transitions,
} as const;

export type AnimationPreset = keyof typeof presets;
