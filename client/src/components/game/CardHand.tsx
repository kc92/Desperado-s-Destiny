/**
 * CardHand Component
 * Displays 5 cards in a poker hand with sequential flip animation
 */

import React, { useEffect, useState } from 'react';
import { Card } from '@desperados/shared';
import { PlayingCard } from './PlayingCard';

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
}) => {
  const [flippedCards, setFlippedCards] = useState<boolean[]>([false, false, false, false, false]);
  const [revealComplete, setRevealComplete] = useState(false);

  // Reset state when cards change
  useEffect(() => {
    if (cards.length === 5) {
      setFlippedCards([false, false, false, false, false]);
      setRevealComplete(false);
    }
  }, [cards]);

  // Handle sequential reveal animation
  useEffect(() => {
    if (isRevealing && !revealComplete && cards.length === 5) {
      // Flip cards one by one with 200ms delay
      const timers: NodeJS.Timeout[] = [];

      cards.forEach((_, index) => {
        const timer = setTimeout(() => {
          setFlippedCards(prev => {
            const updated = [...prev];
            updated[index] = true;
            return updated;
          });

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
  }, [isRevealing, revealComplete, cards, onRevealComplete]);

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
    console.warn(`CardHand expects 5 cards, but received ${cards.length}`);
    return null;
  }

  return (
    <div className={`flex justify-center items-center gap-2 ${className}`}>
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
            size={size}
            onFlipComplete={() => {
              // Individual card flip complete
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default CardHand;
