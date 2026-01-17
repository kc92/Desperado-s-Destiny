/**
 * AnimatedCard Component
 * Wraps PlayingCard with framer-motion animations for deal/discard sequences
 * Enhanced with GPU acceleration and dramatic reveal animations
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card as CardType, Suit } from '@desperados/shared';
import { PlayingCard } from '../PlayingCard';
import {
  CardAnimationState,
  cardVariants,
  highlightVariants,
  prefersReducedMotion,
} from './cardAnimations';
import { SuitBonusIndicator } from './SuitBonusIndicator';

interface AnimatedCardProps {
  /** The card to display */
  card: CardType;
  /** Current animation state */
  animationState: CardAnimationState;
  /** Card index in hand (0-4) */
  index: number;
  /** Position in fan layout */
  position: { x: number; y: number; rotation: number };
  /** Whether this is the final card (gets longer flip animation) */
  isFinalCard?: boolean;
  /** Whether card is highlighted (winning card / matches relevant suit) */
  isHighlighted?: boolean;
  /** Whether to show suit bonus indicator on highlighted cards */
  showSuitBonus?: boolean;
  /** Whether card is selected for hold */
  isSelected?: boolean;
  /** Whether card is selectable */
  isSelectable?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Callback when deal animation completes */
  onDealComplete?: () => void;
  /** Callback when flip animation completes */
  onFlipComplete?: () => void;
  /** Callback when discard animation completes */
  onDiscardComplete?: () => void;
  /** Card size */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  card,
  animationState,
  index,
  position,
  isFinalCard = false,
  isHighlighted = false,
  showSuitBonus = false,
  isSelected = false,
  isSelectable = false,
  onClick,
  onDealComplete,
  onFlipComplete,
  onDiscardComplete,
  size = 'md',
  className = '',
}) => {
  const reducedMotion = prefersReducedMotion();
  const [hasBeenHighlighted, setHasBeenHighlighted] = useState(false);

  // Track when highlight first activates for burst animation
  useEffect(() => {
    if (isHighlighted && !hasBeenHighlighted) {
      setHasBeenHighlighted(true);
    }
  }, [isHighlighted, hasBeenHighlighted]);

  // Determine if card should show face
  const isFlipped = ['revealed', 'selected', 'discarding', 'discarded'].includes(animationState);

  // Get the appropriate motion variant
  const getVariant = () => {
    switch (animationState) {
      case 'in_deck':
        return 'inDeck';
      case 'dealing':
        return 'dealing';
      case 'in_hand':
        return 'inHand';
      case 'lifting':
        return 'lifting';
      case 'flipping':
      case 'revealed':
        return 'revealed';
      case 'selected':
        return 'selected';
      case 'discarding':
      case 'discarded':
        return 'discarding';
      default:
        return 'inHand';
    }
  };

  // Get highlight animation variant
  const getHighlightVariant = () => {
    if (!isHighlighted) return 'normal';
    // Use burst animation on first highlight, then continuous pulse
    return hasBeenHighlighted ? 'highlighted' : 'highlightBurst';
  };

  // Handle animation completion
  const handleAnimationComplete = (definition: string) => {
    switch (definition) {
      case 'dealing':
        onDealComplete?.();
        break;
      case 'revealed':
        onFlipComplete?.();
        break;
      case 'discarding':
        onDiscardComplete?.();
        break;
    }
  };

  // Determine if animating (for GPU hints)
  const isAnimating = ['dealing', 'lifting', 'flipping', 'discarding'].includes(animationState);

  // If reduced motion, skip animations
  if (reducedMotion) {
    return (
      <div
        style={{
          position: 'absolute',
          transform: `translate(${position.x}px, ${position.y}px) rotate(${position.rotation}deg) translateZ(0)`,
          zIndex: isSelected ? 10 : index,
        }}
        className={className}
      >
        <PlayingCard
          card={card}
          isFlipped={isFlipped}
          isHighlighted={isHighlighted}
          isSelected={isSelected}
          isSelectable={isSelectable}
          onClick={onClick}
          size={size}
        />
      </div>
    );
  }

  // Handle click on the motion wrapper to ensure event propagation
  const handleCardClick = () => {
    if (isSelectable && onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      initial="inDeck"
      animate={getVariant()}
      custom={{ index, position, isFinalCard }}
      variants={cardVariants}
      onAnimationComplete={handleAnimationComplete}
      onClick={handleCardClick}
      style={{
        position: 'absolute',
        transformStyle: 'preserve-3d',
        zIndex: isSelected ? 10 : index,
        // GPU acceleration hints
        willChange: isAnimating ? 'transform, opacity, filter' : 'auto',
        transform: 'translateZ(0)',
        // Ensure click events register on motion wrapper
        pointerEvents: 'auto',
        cursor: isSelectable ? 'pointer' : 'default',
      }}
      className={className}
    >
      <motion.div
        initial="normal"
        animate={getHighlightVariant()}
        variants={highlightVariants}
        className="rounded-lg relative"
        style={{
          // Ensure highlight layer also gets GPU acceleration
          willChange: isHighlighted ? 'box-shadow, transform' : 'auto',
          // Allow click events to propagate through
          pointerEvents: 'auto',
        }}
      >
        <PlayingCard
          card={card}
          isFlipped={isFlipped}
          isHighlighted={isHighlighted}
          isSelected={isSelected}
          isSelectable={isSelectable}
          onClick={onClick}
          size={size}
        />

        {/* Suit Bonus Indicator - shown on highlighted cards when enabled */}
        {showSuitBonus && isHighlighted && isFlipped && (
          <div className="absolute -top-2 -right-2 z-10">
            <SuitBonusIndicator
              suit={card.suit as Suit}
              isVisible={true}
              delay={index * 0.1}
              size="sm"
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AnimatedCard;
