/**
 * HandStrengthBanner Component
 * Dramatic announcement of poker hand strength after card reveal
 * Slides up with spring physics, scales based on hand strength
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HandRank } from '@desperados/shared';
import { bannerVariants, prefersReducedMotion } from './cardAnimations';

interface HandStrengthBannerProps {
  /** The poker hand rank (1-10) */
  handRank: HandRank;
  /** Human-readable hand name (e.g., "Flush", "Full House") */
  handName: string;
  /** Whether the banner should be visible */
  isVisible: boolean;
  /** Whether the action succeeded */
  isSuccess?: boolean;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// Map HandRank to display names (backup if handName not provided)
const HAND_RANK_NAMES: Record<HandRank, string> = {
  [HandRank.HIGH_CARD]: 'High Card',
  [HandRank.PAIR]: 'Pair',
  [HandRank.TWO_PAIR]: 'Two Pair',
  [HandRank.THREE_OF_A_KIND]: 'Three of a Kind',
  [HandRank.STRAIGHT]: 'Straight',
  [HandRank.FLUSH]: 'Flush',
  [HandRank.FULL_HOUSE]: 'Full House',
  [HandRank.FOUR_OF_A_KIND]: 'Four of a Kind',
  [HandRank.STRAIGHT_FLUSH]: 'Straight Flush',
  [HandRank.ROYAL_FLUSH]: 'Royal Flush',
};

// Determine hand strength tier for styling
type HandTier = 'weak' | 'moderate' | 'strong' | 'exceptional';

function getHandTier(rank: HandRank): HandTier {
  if (rank >= HandRank.STRAIGHT_FLUSH) return 'exceptional'; // 9-10
  if (rank >= HandRank.FLUSH) return 'strong'; // 6-8
  if (rank >= HandRank.THREE_OF_A_KIND) return 'moderate'; // 4-5
  return 'weak'; // 1-3
}

// Tier-based styling
const TIER_STYLES: Record<HandTier, {
  bgGradient: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
  fontSize: string;
}> = {
  weak: {
    bgGradient: 'from-wood-dark/90 to-wood-darker/90',
    textColor: 'text-desert-sand',
    borderColor: 'border-wood-medium',
    glowColor: '',
    fontSize: 'text-2xl md:text-3xl',
  },
  moderate: {
    bgGradient: 'from-wood-dark/90 via-leather-brown/80 to-wood-dark/90',
    textColor: 'text-gold-medium',
    borderColor: 'border-gold-dark',
    glowColor: '',
    fontSize: 'text-3xl md:text-4xl',
  },
  strong: {
    bgGradient: 'from-gold-dark/90 via-leather-saddle/80 to-gold-dark/90',
    textColor: 'text-gold-light',
    borderColor: 'border-gold-medium',
    glowColor: 'shadow-[0_0_30px_rgba(255,215,0,0.4)]',
    fontSize: 'text-4xl md:text-5xl',
  },
  exceptional: {
    bgGradient: 'from-gold-medium/90 via-gold-light/70 to-gold-medium/90',
    textColor: 'text-wood-darker',
    borderColor: 'border-gold-light',
    glowColor: 'shadow-[0_0_50px_rgba(255,215,0,0.7)]',
    fontSize: 'text-5xl md:text-6xl',
  },
};

export const HandStrengthBanner: React.FC<HandStrengthBannerProps> = ({
  handRank,
  handName,
  isVisible,
  isSuccess = true,
  onAnimationComplete,
  className = '',
}) => {
  const reducedMotion = prefersReducedMotion();
  const tier = getHandTier(handRank);
  const styles = TIER_STYLES[tier];
  const displayName = handName || HAND_RANK_NAMES[handRank];

  // Use emphasis variant for strong+ hands
  const variant = tier === 'strong' || tier === 'exceptional' ? 'emphasis' : 'visible';

  // Reduced motion: simple opacity transition
  if (reducedMotion) {
    return (
      <AnimatePresence>
        {isVisible && (
          <div
            className={`
              text-center py-4 px-8 rounded-lg
              border-2 ${styles.borderColor}
              bg-gradient-to-r ${styles.bgGradient}
              ${styles.glowColor}
              ${className}
            `}
          >
            <h2 className={`font-western ${styles.fontSize} ${styles.textColor} uppercase tracking-wider`}>
              {displayName}
            </h2>
            {tier === 'exceptional' && (
              <div className="text-gold-dark text-sm font-bold uppercase tracking-widest mt-1">
                Legendary Hand!
              </div>
            )}
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
          animate={variant}
          exit="hidden"
          variants={bannerVariants}
          onAnimationComplete={onAnimationComplete}
          className={`
            text-center py-4 px-8 rounded-lg
            border-2 ${styles.borderColor}
            bg-gradient-to-r ${styles.bgGradient}
            ${styles.glowColor}
            ${className}
          `}
          style={{
            willChange: 'transform, opacity',
          }}
        >
          {/* Hand Name */}
          <motion.h2
            className={`font-western ${styles.fontSize} ${styles.textColor} uppercase tracking-wider`}
            animate={tier === 'exceptional' ? {
              textShadow: [
                '0 0 10px rgba(255,215,0,0.5)',
                '0 0 30px rgba(255,215,0,0.8)',
                '0 0 10px rgba(255,215,0,0.5)',
              ],
            } : {}}
            transition={tier === 'exceptional' ? {
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut' as const,
            } : {}}
          >
            {displayName}
          </motion.h2>

          {/* Subtitle for exceptional hands */}
          {tier === 'exceptional' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gold-dark text-sm font-bold uppercase tracking-widest mt-1"
            >
              {handRank === HandRank.ROYAL_FLUSH ? '★ LEGENDARY HAND! ★' : '★ Exceptional! ★'}
            </motion.div>
          )}

          {/* Success/Failure indicator */}
          {!isSuccess && tier !== 'exceptional' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-blood-red text-xs font-semibold uppercase tracking-wide mt-2"
            >
              Not quite enough...
            </motion.div>
          )}

          {/* Hand rank indicator bars */}
          <motion.div
            className="flex justify-center gap-1 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, staggerChildren: 0.05 }}
          >
            {Array.from({ length: 10 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.2 + index * 0.03 }}
                className={`
                  w-2 h-6 rounded-full origin-bottom
                  ${index < handRank
                    ? tier === 'exceptional'
                      ? 'bg-gold-light shadow-[0_0_8px_rgba(255,215,0,0.8)]'
                      : tier === 'strong'
                        ? 'bg-gold-medium shadow-[0_0_4px_rgba(255,215,0,0.5)]'
                        : 'bg-gold-dark'
                    : 'bg-wood-darker/50'
                  }
                `}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HandStrengthBanner;
