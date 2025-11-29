/**
 * PlayingCard Component
 * Displays a single playing card with flip animation
 */

import React, { useEffect, useState } from 'react';
import { Card as CardType, Suit, Rank } from '@desperados/shared';

interface PlayingCardProps {
  /** The card to display */
  card: CardType;
  /** Whether the card is flipped to show its face */
  isFlipped: boolean;
  /** Callback when flip animation completes */
  onFlipComplete?: () => void;
  /** Whether this card is highlighted as part of winning hand */
  isHighlighted?: boolean;
  /** Whether this card is selected (for hold/discard) */
  isSelected?: boolean;
  /** Whether this card is selectable */
  isSelectable?: boolean;
  /** Click handler for selection */
  onClick?: () => void;
  /** Whether this card is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

// Map suits to Unicode symbols
const SUIT_SYMBOLS: Record<Suit, string> = {
  [Suit.SPADES]: '♠',
  [Suit.HEARTS]: '♥',
  [Suit.CLUBS]: '♣',
  [Suit.DIAMONDS]: '♦',
};

// Map suits to accessible names for screen readers
const SUIT_NAMES: Record<Suit, string> = {
  [Suit.SPADES]: 'Spades',
  [Suit.HEARTS]: 'Hearts',
  [Suit.CLUBS]: 'Clubs',
  [Suit.DIAMONDS]: 'Diamonds',
};

// Map suits to colors
const SUIT_COLORS: Record<Suit, string> = {
  [Suit.SPADES]: 'text-black',
  [Suit.HEARTS]: 'text-red-600',
  [Suit.CLUBS]: 'text-black',
  [Suit.DIAMONDS]: 'text-red-600',
};

// Map rank enum to display string
const RANK_DISPLAY: Record<Rank, string> = {
  [Rank.TWO]: '2',
  [Rank.THREE]: '3',
  [Rank.FOUR]: '4',
  [Rank.FIVE]: '5',
  [Rank.SIX]: '6',
  [Rank.SEVEN]: '7',
  [Rank.EIGHT]: '8',
  [Rank.NINE]: '9',
  [Rank.TEN]: '10',
  [Rank.JACK]: 'J',
  [Rank.QUEEN]: 'Q',
  [Rank.KING]: 'K',
  [Rank.ACE]: 'A',
};

// Map rank enum to accessible names for screen readers
const RANK_NAMES: Record<Rank, string> = {
  [Rank.TWO]: 'Two',
  [Rank.THREE]: 'Three',
  [Rank.FOUR]: 'Four',
  [Rank.FIVE]: 'Five',
  [Rank.SIX]: 'Six',
  [Rank.SEVEN]: 'Seven',
  [Rank.EIGHT]: 'Eight',
  [Rank.NINE]: 'Nine',
  [Rank.TEN]: 'Ten',
  [Rank.JACK]: 'Jack',
  [Rank.QUEEN]: 'Queen',
  [Rank.KING]: 'King',
  [Rank.ACE]: 'Ace',
};

// Size styles
const SIZE_STYLES = {
  sm: {
    container: 'w-16 h-24',
    rank: 'text-lg',
    suit: 'text-2xl',
    corner: 'text-xs',
  },
  md: {
    container: 'w-24 h-36',
    rank: 'text-2xl',
    suit: 'text-4xl',
    corner: 'text-sm',
  },
  lg: {
    container: 'w-32 h-48',
    rank: 'text-3xl',
    suit: 'text-5xl',
    corner: 'text-base',
  },
};

/**
 * Playing card component with 3D flip animation
 * Memoized to prevent unnecessary re-renders in card hands
 */
export const PlayingCard: React.FC<PlayingCardProps> = React.memo(({
  card,
  isFlipped,
  onFlipComplete,
  isHighlighted = false,
  isSelected = false,
  isSelectable = false,
  onClick,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const [hasFlipped, setHasFlipped] = useState(isFlipped);
  const sizeStyle = SIZE_STYLES[size];
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const suitColor = SUIT_COLORS[card.suit];
  const rankDisplay = RANK_DISPLAY[card.rank];

  // Accessible names for screen readers
  const suitName = SUIT_NAMES[card.suit];
  const rankName = RANK_NAMES[card.rank];
  const cardLabel = `${rankName} of ${suitName}`;
  const cardStateLabel = isSelected
    ? `${cardLabel}, held`
    : isHighlighted
      ? `${cardLabel}, highlighted`
      : cardLabel;

  const handleClick = () => {
    if (isSelectable && !disabled && onClick) {
      onClick();
    }
  };

  // Handle flip animation completion
  useEffect(() => {
    if (isFlipped !== hasFlipped) {
      setHasFlipped(isFlipped);

      // Call completion callback after animation duration (600ms)
      if (onFlipComplete) {
        const timer = setTimeout(() => {
          onFlipComplete();
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [isFlipped, hasFlipped, onFlipComplete]);

  return (
    <div
      className={`relative ${sizeStyle.container} ${className} ${isSelectable && !disabled ? 'cursor-pointer' : ''} ${disabled ? 'opacity-50' : ''}`}
      style={{ perspective: '1000px' }}
      onClick={handleClick}
      role={isSelectable ? 'button' : 'img'}
      aria-label={isFlipped ? cardStateLabel : 'Card face down'}
      aria-pressed={isSelectable ? isSelected : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={isSelectable && !disabled ? 0 : -1}
      onKeyDown={(e) => {
        if (isSelectable && !disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* HOLD indicator */}
      {isSelected && (
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded z-20">
          HOLD
        </div>
      )}
      <div
        className={`
          relative w-full h-full transition-all duration-300 ease-in-out
          ${isFlipped ? 'rotate-y-180' : ''}
          ${isHighlighted ? 'ring-4 ring-gold-light ring-offset-2 ring-offset-wood-dark shadow-gold' : ''}
          ${isSelected ? 'ring-4 ring-green-500 -translate-y-4 shadow-lg shadow-green-500/50' : ''}
          ${isSelectable && !disabled && !isSelected ? 'hover:-translate-y-2 hover:shadow-lg' : ''}
        `}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateY(${isFlipped ? '180deg' : '0deg'}) ${isSelected ? 'translateY(-8px)' : ''}`,
        }}
      >
        {/* Card Back */}
        <div
          className="absolute inset-0 rounded-lg border-4 border-leather-saddle shadow-wood overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Leather texture background */}
          <div className="w-full h-full bg-gradient-to-br from-leather-brown via-leather-tan to-leather-brown p-2">
            {/* Gold border pattern */}
            <div className="w-full h-full border-4 border-gold-dark rounded flex items-center justify-center relative overflow-hidden">
              {/* Western pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-repeat" style={{
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(139,69,19,0.3) 10px, rgba(139,69,19,0.3) 20px)`,
                }}></div>
              </div>

              {/* Center emblem */}
              <div className="text-gold-light text-4xl font-western z-10">DD</div>
            </div>
          </div>
        </div>

        {/* Card Front */}
        <div
          className="absolute inset-0 rounded-lg border-4 border-wood-dark bg-gradient-to-br from-desert-sand to-desert-dust shadow-wood overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Parchment texture */}
          <div className="w-full h-full p-2">
            {/* Corner rank/suit (top-left) */}
            <div className={`absolute top-1 left-1 flex flex-col items-center leading-none ${suitColor}`}>
              <div className={`font-bold ${sizeStyle.corner}`}>{rankDisplay}</div>
              <div className={sizeStyle.corner}>{suitSymbol}</div>
            </div>

            {/* Corner rank/suit (bottom-right, rotated) */}
            <div className={`absolute bottom-1 right-1 flex flex-col items-center leading-none ${suitColor} rotate-180`}>
              <div className={`font-bold ${sizeStyle.corner}`}>{rankDisplay}</div>
              <div className={sizeStyle.corner}>{suitSymbol}</div>
            </div>

            {/* Center suit symbol */}
            <div className="w-full h-full flex items-center justify-center">
              <div className={`${suitColor} ${sizeStyle.suit} font-bold`}>
                {suitSymbol}
              </div>
            </div>

            {/* Large rank in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`${suitColor} ${sizeStyle.rank} font-bold opacity-30`}>
                {rankDisplay}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if relevant props change
  return (
    prevProps.card.suit === nextProps.card.suit &&
    prevProps.card.rank === nextProps.card.rank &&
    prevProps.isFlipped === nextProps.isFlipped &&
    prevProps.isHighlighted === nextProps.isHighlighted &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isSelectable === nextProps.isSelectable &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.size === nextProps.size &&
    prevProps.className === nextProps.className
  );
});

// Display name for React DevTools
PlayingCard.displayName = 'PlayingCard';

export default PlayingCard;
