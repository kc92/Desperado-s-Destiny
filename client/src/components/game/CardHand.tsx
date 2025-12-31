/**
 * CardHand Component
 * Displays 5 cards in a poker hand with sequential flip animation
 * WCAG 2.1 AA compliant with keyboard navigation and screen reader support
 */

import React, { useEffect, useState, useRef } from 'react';
import { Card, Suit, Rank } from '@desperados/shared';
import { PlayingCard } from './PlayingCard';
import { logger } from '@/services/logger.service';
import { useAnnouncer, gameAnnouncements } from '@/hooks/useAnnouncer';

// Map rank enum to accessible names
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

// Map suit enum to accessible names
const SUIT_NAMES: Record<Suit, string> = {
  [Suit.SPADES]: 'Spades',
  [Suit.HEARTS]: 'Hearts',
  [Suit.CLUBS]: 'Clubs',
  [Suit.DIAMONDS]: 'Diamonds',
};

interface CardHandProps {
  /** The 5 cards in the hand */
  cards: Card[];
  /** Whether cards are being revealed sequentially */
  isRevealing: boolean;
  /** Callback when all cards have been revealed */
  onRevealComplete?: () => void;
  /** Indices of cards that should be highlighted (winning cards) */
  highlightedIndices?: number[];
  /** Size of the cards */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Indices of cards that are selected (held) */
  selectedIndices?: number[];
  /** Callback when a card is toggled for selection */
  onToggleCard?: (index: number) => void;
  /** Whether cards are selectable (hold phase) */
  isSelectable?: boolean;
}

/**
 * Displays a hand of 5 poker cards with fan arrangement and sequential flip
 */
export const CardHand: React.FC<CardHandProps> = ({
  cards,
  isRevealing,
  onRevealComplete,
  highlightedIndices = [],
  size = 'md',
  className = '',
  selectedIndices = [],
  onToggleCard,
  isSelectable = false,
}) => {
  const [flippedCards, setFlippedCards] = useState<boolean[]>([false, false, false, false, false]);
  const [revealComplete, setRevealComplete] = useState(false);
  const { announce } = useAnnouncer();
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Helper to get card name for screen readers
  const getCardName = (card: Card): string => {
    return `${RANK_NAMES[card.rank]} of ${SUIT_NAMES[card.suit]}`;
  };

  // Reset state when cards change
  // PRODUCTION FIX: During hold phase (isSelectable), show cards face-up immediately
  useEffect(() => {
    if (cards.length === 5) {
      if (isSelectable) {
        // Hold phase: cards should be visible immediately for selection
        setFlippedCards([true, true, true, true, true]);
        setRevealComplete(true);
      } else {
        // Combat resolution: start face-down for reveal animation
        setFlippedCards([false, false, false, false, false]);
        setRevealComplete(false);
      }
    }
  }, [cards, isSelectable]);

  // Handle sequential reveal animation with screen reader announcements
  useEffect(() => {
    if (isRevealing && !revealComplete && cards.length === 5) {
      // Flip cards one by one with 200ms delay
      const timers: NodeJS.Timeout[] = [];

      cards.forEach((card, index) => {
        const timer = setTimeout(() => {
          setFlippedCards(prev => {
            const updated = [...prev];
            updated[index] = true;
            return updated;
          });

          // Announce each card to screen readers
          const cardName = getCardName(card);
          announce(gameAnnouncements.cardReveal(cardName, index + 1), { delay: 100 });

          // If this is the last card, mark reveal as complete
          if (index === cards.length - 1) {
            setTimeout(() => {
              setRevealComplete(true);
              if (onRevealComplete) {
                onRevealComplete();
              }
            }, 600); // Wait for flip animation to complete
          }
        }, index * 200); // 200ms delay between each card

        timers.push(timer);
      });

      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [isRevealing, revealComplete, cards, onRevealComplete, announce, getCardName]);

  // Handle keyboard navigation within the card hand
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!cards.length) return;

    let newIndex = focusedIndex;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = Math.max(0, focusedIndex - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        newIndex = Math.min(cards.length - 1, focusedIndex + 1);
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = cards.length - 1;
        break;
      default:
        return;
    }

    if (newIndex !== focusedIndex) {
      setFocusedIndex(newIndex);
      // Focus the card at the new index
      const cardElements = containerRef.current?.querySelectorAll('[role="img"], [role="button"]');
      if (cardElements && cardElements[newIndex]) {
        (cardElements[newIndex] as HTMLElement).focus();
      }
    }
  };

  // If no cards, show empty state (face-down cards)
  if (cards.length === 0) {
    return (
      <div className={`flex justify-center items-center gap-2 ${className}`}>
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`
              ${size === 'sm' ? 'w-16 h-24' : size === 'md' ? 'w-24 h-36' : 'w-32 h-48'}
              rounded-lg border-4 border-leather-saddle shadow-wood
              bg-gradient-to-br from-leather-brown via-leather-tan to-leather-brown
              opacity-50
              transform transition-transform hover:scale-105
            `}
            style={{
              transform: `rotate(${(index - 2) * 3}deg) translateY(${Math.abs(index - 2) * 8}px)`,
            }}
          />
        ))}
      </div>
    );
  }

  // Ensure we have exactly 5 cards
  if (cards.length !== 5) {
    logger.warn(`CardHand expects 5 cards, but received ${cards.length}`, { context: 'CardHand', cardsReceived: cards.length });
    return null;
  }

  // Generate accessible description of the hand
  const getHandDescription = (): string => {
    if (!flippedCards.some(Boolean)) {
      return 'Poker hand with 5 face-down cards';
    }
    const revealedCards = cards
      .filter((_, i) => flippedCards[i])
      .map(c => getCardName(c))
      .join(', ');
    return `Poker hand: ${revealedCards}`;
  };

  return (
    <div
      ref={containerRef}
      className={`flex justify-center items-center gap-2 ${className}`}
      role="group"
      aria-label={getHandDescription()}
      onKeyDown={handleKeyDown}
    >
      {cards.map((card, index) => (
        <div
          key={`${card.suit}-${card.rank}-${index}`}
          className="transform transition-all duration-300 hover:-translate-y-4"
          style={{
            // Fan arrangement: slight rotation and vertical offset
            transform: `rotate(${(index - 2) * 5}deg) translateY(${Math.abs(index - 2) * 12}px)`,
            zIndex: index,
          }}
        >
          <PlayingCard
            card={card}
            isFlipped={flippedCards[index]}
            isHighlighted={highlightedIndices.includes(index)}
            isSelected={selectedIndices.includes(index)}
            isSelectable={isSelectable && flippedCards[index]}
            onClick={() => onToggleCard?.(index)}
            size={size}
            onFlipComplete={() => {
              // Individual card flip complete
            }}
          />
        </div>
      ))}
      {/* Screen reader live region for card reveals */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="sr-only"
      >
        {revealComplete && highlightedIndices.length > 0 && (
          <span>
            Winning cards: {highlightedIndices.map(i => getCardName(cards[i])).join(', ')}
          </span>
        )}
      </div>
    </div>
  );
};

export default CardHand;
