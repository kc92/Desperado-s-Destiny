/**
 * DuelAnimatedHand Component
 * Displays animated card hand for PvP duels
 * Integrates with useCardAnimations for deal/reveal sequences
 */

import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Card } from '@desperados/shared';
import { AnimatedCard } from '@/components/game/card/AnimatedCard';
import { useCardAnimations } from '@/hooks/useCardAnimations';
import { calculateFanPositions } from '@/components/game/card/cardAnimations';

interface DuelAnimatedHandProps {
  /** Cards to display */
  cards: Card[];
  /** Indices of selected (held) cards */
  selectedIndices: number[];
  /** Callback when a card is clicked */
  onCardClick?: (index: number) => void;
  /** Whether cards can be selected */
  canSelect: boolean;
  /** Trigger deal animation */
  triggerDeal?: boolean;
  /** Trigger reveal animation */
  triggerReveal?: boolean;
  /** Callback when deal animation completes */
  onDealComplete?: () => void;
  /** Callback when reveal animation completes */
  onRevealComplete?: () => void;
  /** Card size */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show cards face up */
  faceUp?: boolean;
  /** Additional class name */
  className?: string;
}

export const DuelAnimatedHand: React.FC<DuelAnimatedHandProps> = ({
  cards,
  selectedIndices,
  onCardClick,
  canSelect,
  triggerDeal = false,
  triggerReveal = false,
  onDealComplete,
  onRevealComplete,
  size = 'md',
  faceUp = true,
  className = '',
}) => {
  // Card dimensions based on size
  const cardWidth = size === 'sm' ? 64 : size === 'md' ? 80 : 96;

  // Calculate fan positions
  const fanPositions = calculateFanPositions(cardWidth, {
    fanAngle: 4,
    fanSpread: 1.0,
    verticalOffset: 8,
  });

  // Initialize animation hook
  const {
    cardStates,
    isAnimating,
    phase,
    dealCards,
    revealHand,
    reset,
  } = useCardAnimations({
    cardWidth,
    onDealComplete,
    onFlipComplete: onRevealComplete,
    onSoundEffect: (_effect) => {
      // Could integrate with audio system here
      // Audio integration placeholder
    },
  });

  // Trigger deal animation when requested
  useEffect(() => {
    if (triggerDeal && cards.length === 5 && !isAnimating) {
      dealCards(cards);
    }
  }, [triggerDeal, cards, isAnimating, dealCards]);

  // Trigger reveal animation when requested
  useEffect(() => {
    if (triggerReveal && !isAnimating && phase === 'waiting') {
      revealHand();
    }
  }, [triggerReveal, isAnimating, phase, revealHand]);

  // Reset when cards change significantly (new round)
  useEffect(() => {
    if (cards.length === 0) {
      reset();
    }
  }, [cards.length, reset]);

  // Handle card click with selection toggle
  const handleCardClick = useCallback((index: number) => {
    if (canSelect && onCardClick) {
      onCardClick(index);
    }
  }, [canSelect, onCardClick]);

  // Determine animation state for each card
  const getCardAnimationState = (index: number) => {
    // If we have animated card states, use them
    if (cardStates[index]) {
      const state = cardStates[index].state;
      // Override with selected state if card is selected
      if (selectedIndices.includes(index) && state === 'revealed') {
        return 'selected';
      }
      return state;
    }
    // Default states based on faceUp prop
    if (selectedIndices.includes(index)) {
      return 'selected';
    }
    return faceUp ? 'revealed' : 'in_hand';
  };

  // If no animation running and we have cards, show them statically
  const displayCards = cardStates.length > 0
    ? cardStates.map(cs => cs.card)
    : cards;

  const displayPositions = cardStates.length > 0
    ? cardStates.map(cs => cs.position)
    : fanPositions;

  return (
    <div
      className={`relative w-full h-32 flex items-center justify-center ${className}`}
      style={{ perspective: '1000px' }}
    >
      {/* Card container */}
      <div className="relative" style={{ width: cardWidth * 5, height: 120 }}>
        {displayCards.map((card, index) => (
          <AnimatedCard
            key={`${card.suit}-${card.rank}-${index}`}
            card={card}
            animationState={getCardAnimationState(index)}
            index={index}
            position={displayPositions[index] || fanPositions[index]}
            isFinalCard={index === 4}
            isHighlighted={selectedIndices.includes(index)}
            isSelected={selectedIndices.includes(index)}
            isSelectable={canSelect && !isAnimating}
            onClick={() => handleCardClick(index)}
            size={size}
          />
        ))}
      </div>

      {/* Selection hint overlay */}
      {canSelect && !isAnimating && (
        <motion.div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm text-gold-light/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Click cards to hold
        </motion.div>
      )}

      {/* Animation phase indicator (dev mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-wood-light/50">
          Phase: {phase} | Animating: {isAnimating ? 'yes' : 'no'}
        </div>
      )}
    </div>
  );
};

export default DuelAnimatedHand;
