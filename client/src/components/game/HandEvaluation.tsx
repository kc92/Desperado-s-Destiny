/**
 * HandEvaluation Component
 * Displays poker hand evaluation with rank, score, and bonuses
 */

import React from 'react';
import { HandRank, Suit } from '@desperados/shared';

interface HandEvaluationProps {
  /** The poker hand rank */
  handRank: HandRank;
  /** Base score from the hand */
  handScore: number;
  /** Suit bonuses applied */
  suitBonuses: Array<{ suit: Suit; bonus: number }>;
  /** Total score after bonuses */
  totalScore: number;
  /** Additional CSS classes */
  className?: string;
}

// Map HandRank enum to display names
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

// Map suits to display names
const SUIT_NAMES: Record<Suit, string> = {
  [Suit.SPADES]: 'Cunning',
  [Suit.HEARTS]: 'Spirit',
  [Suit.CLUBS]: 'Combat',
  [Suit.DIAMONDS]: 'Craft',
};

// Map suits to icons
const SUIT_ICONS: Record<Suit, string> = {
  [Suit.SPADES]: '♠',
  [Suit.HEARTS]: '♥',
  [Suit.CLUBS]: '♣',
  [Suit.DIAMONDS]: '♦',
};

// Determine if hand is strong (flush or better)
const isStrongHand = (rank: HandRank): boolean => {
  return rank >= HandRank.FLUSH;
};

/**
 * Displays evaluation of a poker hand with visual flair
 */
export const HandEvaluation: React.FC<HandEvaluationProps> = ({
  handRank,
  handScore,
  suitBonuses,
  totalScore,
  className = '',
}) => {
  const rankName = HAND_RANK_NAMES[handRank];
  const isStrong = isStrongHand(handRank);

  return (
    <div
      className={`
        wood-panel animate-fade-in
        ${isStrong ? 'ring-4 ring-gold-light shadow-gold' : ''}
        ${className}
      `}
    >
      {/* Hand Rank */}
      <div className="text-center mb-6">
        <h3
          className={`
            text-3xl font-western mb-2
            ${isStrong ? 'text-gold-light text-shadow-gold' : 'text-desert-sand text-shadow-dark'}
          `}
        >
          {rankName}
        </h3>
        {isStrong && (
          <div className="text-gold-medium text-sm font-semibold uppercase tracking-wider">
            Exceptional Hand!
          </div>
        )}
      </div>

      {/* Score Breakdown */}
      <div className="space-y-3">
        {/* Base Score */}
        <div className="flex justify-between items-center px-4 py-2 bg-wood-dark/30 rounded">
          <span className="text-desert-sand font-semibold">Base Hand Score:</span>
          <span className="text-gold-light text-xl font-bold">{handScore}</span>
        </div>

        {/* Suit Bonuses */}
        {suitBonuses.length > 0 && (
          <div className="space-y-2">
            <div className="text-desert-sand font-semibold text-sm uppercase tracking-wide px-4">
              Suit Bonuses:
            </div>
            {suitBonuses.map(({ suit, bonus }) => (
              <div
                key={suit}
                className="flex justify-between items-center px-4 py-2 bg-wood-dark/20 rounded"
              >
                <span className="text-desert-dust flex items-center gap-2">
                  <span className="text-xl">{SUIT_ICONS[suit]}</span>
                  <span>{SUIT_NAMES[suit]}</span>
                </span>
                <span className="text-gold-medium font-bold">+{bonus}</span>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="border-t-2 border-wood-dark/50 mx-4" />

        {/* Total Score */}
        <div
          className={`
            flex justify-between items-center px-4 py-3 rounded
            ${isStrong ? 'bg-gold-dark/30' : 'bg-wood-dark/40'}
          `}
        >
          <span
            className={`
              font-western text-lg
              ${isStrong ? 'text-gold-light' : 'text-desert-sand'}
            `}
          >
            Total Score:
          </span>
          <span
            className={`
              text-3xl font-bold
              ${isStrong ? 'text-gold-light animate-pulse-gold' : 'text-gold-medium'}
            `}
          >
            {totalScore}
          </span>
        </div>
      </div>

      {/* Hand Rank Visual Indicator */}
      <div className="mt-4 flex justify-center gap-1">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className={`
              w-2 h-8 rounded-full transition-all
              ${index < handRank
                ? isStrong
                  ? 'bg-gold-light shadow-gold'
                  : 'bg-gold-medium'
                : 'bg-wood-dark/30'
              }
            `}
          />
        ))}
      </div>
    </div>
  );
};

export default HandEvaluation;
