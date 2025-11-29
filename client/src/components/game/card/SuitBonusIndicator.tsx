/**
 * SuitBonusIndicator Component
 * Floating bonus indicator shown on cards that match the relevant suit
 * Displays suit symbol and skill bonus with animation
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Suit } from '@desperados/shared';
import { prefersReducedMotion } from './cardAnimations';

interface SuitBonusIndicatorProps {
  /** The suit being matched */
  suit: Suit;
  /** Whether to show the indicator */
  isVisible: boolean;
  /** Optional delay before showing (for staggered effect) */
  delay?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

// Suit display configuration
const SUIT_CONFIG: Record<Suit, {
  symbol: string;
  name: string;
  skillName: string;
  color: string;
  bgColor: string;
  glowColor: string;
}> = {
  [Suit.SPADES]: {
    symbol: '♠',
    name: 'Spades',
    skillName: 'Cunning',
    color: 'text-gray-200',
    bgColor: 'bg-gray-800/90',
    glowColor: 'shadow-[0_0_15px_rgba(156,163,175,0.6)]',
  },
  [Suit.HEARTS]: {
    symbol: '♥',
    name: 'Hearts',
    skillName: 'Spirit',
    color: 'text-red-400',
    bgColor: 'bg-red-900/90',
    glowColor: 'shadow-[0_0_15px_rgba(248,113,113,0.6)]',
  },
  [Suit.CLUBS]: {
    symbol: '♣',
    name: 'Clubs',
    skillName: 'Combat',
    color: 'text-green-400',
    bgColor: 'bg-green-900/90',
    glowColor: 'shadow-[0_0_15px_rgba(74,222,128,0.6)]',
  },
  [Suit.DIAMONDS]: {
    symbol: '♦',
    name: 'Diamonds',
    skillName: 'Craft',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/90',
    glowColor: 'shadow-[0_0_15px_rgba(96,165,250,0.6)]',
  },
};

// Size configuration
const SIZE_CONFIG = {
  sm: {
    container: 'px-1.5 py-0.5 text-xs',
    symbol: 'text-sm',
  },
  md: {
    container: 'px-2 py-1 text-sm',
    symbol: 'text-base',
  },
  lg: {
    container: 'px-3 py-1.5 text-base',
    symbol: 'text-lg',
  },
};

// Animation variants
const indicatorVariants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.8,
    transition: {
      duration: 0.2,
    },
  },
};

// Float animation for the suit symbol
const floatVariants = {
  animate: {
    y: [0, -3, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

export const SuitBonusIndicator: React.FC<SuitBonusIndicatorProps> = ({
  suit,
  isVisible,
  delay = 0,
  size = 'md',
  className = '',
}) => {
  const reducedMotion = prefersReducedMotion();
  const config = SUIT_CONFIG[suit];
  const sizeConfig = SIZE_CONFIG[size];

  // Reduced motion: simple static display
  if (reducedMotion) {
    return (
      <AnimatePresence>
        {isVisible && (
          <div
            className={`
              inline-flex items-center gap-1 rounded-full
              ${sizeConfig.container}
              ${config.bgColor}
              ${config.glowColor}
              border border-white/20
              font-bold
              ${className}
            `}
          >
            <span className={`${config.color} ${sizeConfig.symbol}`}>
              {config.symbol}
            </span>
            <span className="text-white">
              +{config.skillName}
            </span>
          </div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={indicatorVariants}
          transition={{ delay }}
          className={`
            inline-flex items-center gap-1 rounded-full
            ${sizeConfig.container}
            ${config.bgColor}
            ${config.glowColor}
            border border-white/20
            font-bold
            ${className}
          `}
          style={{
            willChange: 'transform, opacity',
          }}
        >
          <motion.span
            variants={floatVariants}
            animate="animate"
            className={`${config.color} ${sizeConfig.symbol}`}
          >
            {config.symbol}
          </motion.span>
          <span className="text-white whitespace-nowrap">
            +{config.skillName}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * SuitBonusOverlay Component
 * Centered overlay showing total suit bonus when 3+ cards match
 */
interface SuitBonusOverlayProps {
  /** The matching suit */
  suit: Suit;
  /** Number of matching cards */
  matchCount: number;
  /** Bonus multiplier */
  multiplier: number;
  /** Whether to show the overlay */
  isVisible: boolean;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

const overlayVariants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.3,
    },
  },
};

const symbolPulseVariants = {
  animate: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

export const SuitBonusOverlay: React.FC<SuitBonusOverlayProps> = ({
  suit,
  matchCount,
  multiplier,
  isVisible,
  onAnimationComplete,
  className = '',
}) => {
  const reducedMotion = prefersReducedMotion();
  const config = SUIT_CONFIG[suit];

  // Determine emphasis based on multiplier
  const isHighBonus = multiplier >= 1.5;

  // Reduced motion: simple static display
  if (reducedMotion) {
    return (
      <AnimatePresence>
        {isVisible && (
          <div
            className={`
              text-center p-6 rounded-xl
              ${config.bgColor}
              ${isHighBonus ? config.glowColor : ''}
              border-2 border-white/30
              ${className}
            `}
          >
            <div className={`text-6xl ${config.color} mb-2`}>
              {config.symbol}
            </div>
            <div className="text-white text-xl font-bold mb-1">
              {matchCount}/5 {config.name}
            </div>
            <div className="text-gold-light text-2xl font-western">
              {multiplier.toFixed(1)}x {config.skillName} BONUS!
            </div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          onAnimationComplete={onAnimationComplete}
          className={`
            text-center p-6 rounded-xl
            ${config.bgColor}
            ${isHighBonus ? config.glowColor : ''}
            border-2 border-white/30
            ${className}
          `}
          style={{
            willChange: 'transform, opacity',
          }}
        >
          {/* Large suit symbol */}
          <motion.div
            variants={isHighBonus ? symbolPulseVariants : {}}
            animate={isHighBonus ? 'animate' : undefined}
            className={`text-6xl ${config.color} mb-2`}
          >
            {config.symbol}
          </motion.div>

          {/* Match count */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white text-xl font-bold mb-1"
          >
            {matchCount}/5 {config.name}
          </motion.div>

          {/* Multiplier */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' as const }}
            className={`text-2xl font-western ${isHighBonus ? 'text-gold-light' : 'text-gold-medium'}`}
          >
            {multiplier.toFixed(1)}x {config.skillName} BONUS!
          </motion.div>

          {/* High bonus special effect */}
          {isHighBonus && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-gold-light mt-2 uppercase tracking-wider"
            >
              ★ Exceptional Alignment ★
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuitBonusIndicator;
