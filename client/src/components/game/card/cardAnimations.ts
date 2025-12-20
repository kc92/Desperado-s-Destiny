/**
 * Card Animation Constants & Utilities
 * Core timing, easing, and position calculations for Destiny Deck animations
 */

// Animation timing constants (in seconds)
// Optimized for ~3.5s total reveal sequence
export const TIMING = {
  // Individual card animations (snappy for repeat plays)
  DEAL_DURATION: 0.3,
  FLIP_DURATION: 0.25,
  FINAL_CARD_FLIP_DURATION: 0.35, // Slightly longer for dramatic emphasis
  DISCARD_DURATION: 0.25,
  BOUNCE_DURATION: 0.15,

  // Stagger delays
  DEAL_STAGGER: 0.1,
  FLIP_STAGGER: 0.15, // Increased to build tension between reveals
  DISCARD_STAGGER: 0.06,

  // Sequence delays
  PAUSE_AFTER_DEAL: 0.15,
  PAUSE_AFTER_DISCARD: 0.2,
  PAUSE_BEFORE_RESULT: 0.3,
  PAUSE_BEFORE_BANNER: 0.2, // New: pause before hand strength banner
};

// Easing curves for western "snap" feel
export const EASING = {
  // Sharp snap for card deals
  DEAL: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  // Smooth for flips
  FLIP: [0.4, 0, 0.2, 1] as [number, number, number, number],
  // Quick exit for discards
  DISCARD: [0.4, 0, 1, 1] as [number, number, number, number],
  // Bouncy landing
  BOUNCE: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
  // Standard ease out
  EASE_OUT: [0, 0, 0.2, 1] as [number, number, number, number],
};

// Position configurations
export const POSITIONS = {
  // Deck position (top-left)
  DECK: { x: -200, y: -150 },
  // Discard pile position (top-right)
  DISCARD: { x: 200, y: -150 },
};

/**
 * Calculate fan layout positions for 5 cards
 */
export function calculateFanPositions(
  cardWidth: number,
  options?: {
    fanAngle?: number;
    fanSpread?: number;
    verticalOffset?: number;
  }
) {
  const { fanAngle = 5, fanSpread = 1.1, verticalOffset = 12 } = options || {};

  return [0, 1, 2, 3, 4].map((index) => {
    const centerOffset = index - 2;
    return {
      x: centerOffset * cardWidth * fanSpread,
      y: Math.abs(centerOffset) * verticalOffset,
      rotation: centerOffset * fanAngle,
      zIndex: index,
    };
  });
}

/**
 * Card animation state types
 */
export type CardAnimationState =
  | 'in_deck'
  | 'dealing'
  | 'in_hand'
  | 'lifting'    // New: lift before flip for emphasis
  | 'flipping'
  | 'revealed'
  | 'selected'
  | 'discarding'
  | 'discarded';

/**
 * Motion variants for AnimatedCard
 * Enhanced with arc trajectory for dramatic deal animation
 */
export const cardVariants = {
  inDeck: {
    x: POSITIONS.DECK.x,
    y: POSITIONS.DECK.y,
    scale: 0.8,
    rotateY: 0,
    rotateZ: -5,
    rotateX: 10,
    opacity: 0,
    filter: 'blur(0px)',
  },
  dealing: (custom: { index: number; position: { x: number; y: number; rotation: number } }) => ({
    // Arc trajectory: start from deck, arc upward, settle into position
    x: [POSITIONS.DECK.x, custom.position.x * 0.4, custom.position.x],
    y: [POSITIONS.DECK.y, custom.position.y - 40, custom.position.y],
    scale: [0.8, 1.05, 1],
    rotateY: 0,
    rotateZ: [-5, custom.position.rotation + 3, custom.position.rotation],
    rotateX: [10, 3, 0],
    opacity: [0, 1, 1],
    filter: ['blur(2px)', 'blur(1px)', 'blur(0px)'],
    transition: {
      duration: TIMING.DEAL_DURATION,
      delay: custom.index * TIMING.DEAL_STAGGER,
      ease: EASING.BOUNCE,
      times: [0, 0.6, 1], // Arc peaks at 60% of animation
    },
  }),
  inHand: (custom: { position: { x: number; y: number; rotation: number } }) => ({
    x: custom.position.x,
    y: custom.position.y,
    scale: 1,
    rotateY: 0,
    rotateZ: custom.position.rotation,
    rotateX: 0,
    opacity: 1,
    filter: 'blur(0px)',
  }),
  // Lift animation before flip for emphasis
  lifting: (custom: { position: { x: number; y: number; rotation: number } }) => ({
    x: custom.position.x,
    y: custom.position.y - 15,
    scale: 1.03,
    rotateY: 0,
    rotateZ: custom.position.rotation,
    rotateX: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.1,
      ease: EASING.EASE_OUT,
    },
  }),
  revealed: (custom: { position: { x: number; y: number; rotation: number }; isFinalCard?: boolean }) => ({
    x: custom.position.x,
    y: custom.position.y,
    scale: 1,
    rotateY: 0, // PlayingCard handles flip internally
    rotateZ: custom.position.rotation,
    rotateX: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      y: {
        duration: 0.15,
        ease: EASING.BOUNCE,
      },
      scale: {
        duration: 0.15,
        ease: EASING.BOUNCE,
      },
    },
  }),
  selected: (custom: { position: { x: number; y: number; rotation: number } }) => ({
    x: custom.position.x,
    y: custom.position.y - 20,
    scale: 1.05,
    rotateY: 0, // PlayingCard handles flip internally
    rotateZ: custom.position.rotation,
    rotateX: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.15,
      ease: EASING.EASE_OUT,
    },
  }),
  discarding: (custom: { index: number }) => ({
    x: POSITIONS.DISCARD.x,
    y: POSITIONS.DISCARD.y,
    scale: 0.7,
    rotateY: 0, // PlayingCard handles flip internally
    rotateZ: 15 + (custom.index * 5),
    rotateX: -5,
    opacity: 0,
    filter: 'blur(2px)',
    transition: {
      duration: TIMING.DISCARD_DURATION,
      ease: EASING.DISCARD,
    },
  }),
};

/**
 * Deck pile variants
 */
export const deckVariants = {
  idle: {
    scale: 1,
    transition: {
      repeat: Infinity,
      repeatType: 'reverse' as const,
      duration: 2,
    },
  },
  dealing: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

/**
 * Result display variants
 */
export const resultVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: EASING.EASE_OUT,
    },
  },
};

/**
 * Winner highlight animation - dramatic gold pulse for winning cards
 */
export const highlightVariants = {
  normal: {
    boxShadow: '0 0 0 rgba(255, 215, 0, 0)',
    scale: 1,
  },
  highlighted: {
    boxShadow: [
      '0 0 0 rgba(255, 215, 0, 0)',
      '0 0 30px rgba(255, 215, 0, 0.9)',
      '0 0 15px rgba(255, 215, 0, 0.6)',
      '0 0 25px rgba(255, 215, 0, 0.8)',
    ],
    scale: [1, 1.02, 1, 1.01],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      repeatType: 'reverse' as const,
      ease: 'easeInOut' as const,
    },
  },
  // Initial burst when first highlighted
  highlightBurst: {
    boxShadow: [
      '0 0 0 rgba(255, 215, 0, 0)',
      '0 0 50px rgba(255, 215, 0, 1)',
      '0 0 25px rgba(255, 215, 0, 0.8)',
    ],
    scale: [1, 1.08, 1.02],
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
    },
  },
};

/**
 * Hand strength banner animation variants
 */
export const bannerVariants = {
  hidden: {
    y: 50,
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
    },
  },
  // For strong hands (Flush+), add extra emphasis
  emphasis: {
    y: 0,
    opacity: 1,
    scale: [0.8, 1.15, 1],
    transition: {
      scale: {
        duration: 0.5,
        times: [0, 0.6, 1],
        ease: 'easeOut' as const,
      },
      opacity: { duration: 0.2 },
      y: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 15,
      },
    },
  },
};

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation duration multiplier based on reduced motion preference
 */
export function getMotionMultiplier(): number {
  return prefersReducedMotion() ? 0 : 1;
}
