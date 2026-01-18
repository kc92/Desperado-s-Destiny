/**
 * BlackjackGame Component
 * Hit or Stand to reach target score without busting
 * Used for Social encounters
 */

import React, { useState, useEffect } from 'react';
import { Card, Rank } from '@desperados/shared';
import { PlayingCard } from '../PlayingCard';

interface BlackjackGameProps {
  hand: Card[];
  selectedCards: number[];
  onToggleCard: (index: number) => void;
  onAction: (action: { type: string; cardIndices?: number[] }) => void;
  isLoading: boolean;
  turnNumber: number;
  maxTurns: number;
  relevantSuit?: string;
  difficulty: number;
  availableActions: string[];
  // Phase 3: Vegas-style options
  hasDoubledDown?: boolean;
  hasInsurance?: boolean;
  cardCountHint?: string;
  characterSkillBonus?: number;
  dealerShowsAce?: boolean;
  adjustedTarget?: number;  // Server-calculated target with skill modifiers applied
}

// Calculate blackjack value
const calculateValue = (cards: Card[]): number => {
  let value = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === Rank.ACE) {
      aces++;
      value += 11;
    } else if ([Rank.JACK, Rank.QUEEN, Rank.KING].includes(card.rank)) {
      value += 10;
    } else {
      value += parseInt(String(card.rank));
    }
  }

  // Adjust for aces
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
};

// Get target based on difficulty
const getTarget = (difficulty: number): number => {
  const targets: Record<number, number> = {
    1: 15,
    2: 17,
    3: 18,
    4: 19,
    5: 21,
  };
  return targets[difficulty] || 18;
};

export const BlackjackGame: React.FC<BlackjackGameProps> = ({
  hand,
  selectedCards: _selectedCards,
  onToggleCard: _onToggleCard,
  onAction,
  isLoading,
  turnNumber: _turnNumber,
  maxTurns: _maxTurns,
  relevantSuit,
  difficulty,
  availableActions,
  // Phase 3 props
  hasDoubledDown = false,
  hasInsurance = false,
  cardCountHint = '',
  characterSkillBonus = 0,
  dealerShowsAce = false,
  adjustedTarget,
}) => {
  const [lastCardFlipped, setLastCardFlipped] = useState(false);

  const currentValue = calculateValue(hand);
  // Use server-provided adjusted target if available, otherwise fall back to base target
  const baseTarget = getTarget(difficulty);
  const target = adjustedTarget ?? baseTarget;
  const hasSkillBonus = adjustedTarget !== undefined && adjustedTarget < baseTarget;
  const isBusted = currentValue > 21;
  const hasBlackjack = currentValue === 21;

  // Suit matches (computed but not displayed in this game mode)
  /* const suitCount = relevantSuit
    ? hand.filter(card => card.suit.toLowerCase() === relevantSuit.toLowerCase()).length
    : 0; */

  // Animate last card
  useEffect(() => {
    if (hand.length > 0) {
      setLastCardFlipped(false);
      const timer = setTimeout(() => setLastCardFlipped(true), 100);
      return () => clearTimeout(timer);
    }
  }, [hand.length]);

  const handleHit = () => {
    onAction({ type: 'hit' });
  };

  const handleStand = () => {
    onAction({ type: 'stand' });
  };

  // Phase 3: Vegas-style action handlers
  const handleDoubleDown = () => {
    onAction({ type: 'double_down' });
  };

  const handleInsurance = () => {
    onAction({ type: 'insurance' });
  };

  const canHit = !isBusted && !hasBlackjack && !isLoading && !hasDoubledDown;
  const canStand = !isBusted && !isLoading && hand.length >= 2;

  // Phase 3: Check available actions
  const canDoubleDown = availableActions.includes('double_down') && hand.length === 2 && !hasDoubledDown && !isBusted;
  const canInsurance = availableActions.includes('insurance') && dealerShowsAce && !hasInsurance && hand.length === 2;

  // Determine status message and color
  const getStatusColor = () => {
    if (isBusted) return 'text-red-500';
    if (hasBlackjack) return 'text-gold-light';
    if (currentValue >= target) return 'text-green-400';
    if (currentValue >= target - 3) return 'text-yellow-400';
    return 'text-desert-sand';
  };

  return (
    <div className="space-y-6">
      {/* Game info with skill bonus */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-desert-sand text-sm">
            Cards: {hand.length}
          </span>
          {characterSkillBonus > 0 && (
            <span className="text-green-400 text-xs bg-green-900/30 px-2 py-1 rounded">
              Skill +{characterSkillBonus}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className={`font-bold text-lg ${getStatusColor()}`}>
            Value: {currentValue}
          </span>
          <span className="text-sm text-desert-sand">
            Target: {target}
            {hasSkillBonus && (
              <span className="text-green-400 text-xs ml-1">
                (was {baseTarget})
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Phase 3: Status indicators */}
      <div className="flex justify-center gap-3 text-xs">
        {hasDoubledDown && (
          <span className="px-2 py-1 rounded bg-yellow-900/50 text-yellow-300 font-bold">
            💰 DOUBLED DOWN - 2x Stakes!
          </span>
        )}
        {hasInsurance && (
          <span className="px-2 py-1 rounded bg-blue-900/50 text-blue-300">
            🛡️ Insurance Active
          </span>
        )}
        {cardCountHint && (
          <span className="px-2 py-1 rounded bg-purple-900/50 text-purple-300">
            🃏 {cardCountHint}
          </span>
        )}
      </div>

      {/* Progress to target */}
      <div className="bg-wood-darker rounded p-3 border border-wood-light/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-desert-sand">Progress to Target</span>
          <span className={`text-sm font-bold ${getStatusColor()}`}>
            {currentValue}/{target}
          </span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden relative">
          {/* Target line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-gold-light z-10"
            style={{ left: `${(target / 21) * 100}%` }}
          />
          {/* Current value */}
          <div
            className={`h-full transition-all duration-500 ${
              isBusted ? 'bg-red-500' :
              currentValue >= target ? 'bg-green-500' :
              'bg-blue-500'
            }`}
            style={{ width: `${Math.min((currentValue / 21) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Status message */}
      <div className="text-center">
        {isBusted ? (
          <p className="text-red-500 font-bold text-lg">
            💥 Bust! Over 21!
          </p>
        ) : hasBlackjack ? (
          <p className="text-gold-light font-bold text-lg">
            ⭐ Blackjack! Perfect 21!
          </p>
        ) : currentValue >= target ? (
          <p className="text-green-400">
            Good score! Stand to lock it in, or risk it for more.
          </p>
        ) : (
          <p className="text-desert-sand">
            Hit to draw, Stand to stop. Get close to {target} without going over 21!
          </p>
        )}
      </div>

      {/* Card display */}
      <div className="flex justify-center items-end gap-2 py-4 min-h-[180px]">
        {hand.map((card, index) => (
          <div
            key={`${card.suit}-${card.rank}-${index}`}
            className="transform transition-all duration-300"
          >
            <PlayingCard
              card={card}
              isFlipped={index < hand.length - 1 || lastCardFlipped}
              size="md"
              isHighlighted={
                !!(relevantSuit &&
                card.suit.toLowerCase() === relevantSuit.toLowerCase())
              }
            />
          </div>
        ))}

        {hand.length < 2 && (
          <div className="w-24 h-36 border-2 border-dashed border-wood-light rounded-lg flex items-center justify-center">
            <span className="text-wood-light text-xs">Hit</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!isBusted && !hasBlackjack && (
        <div className="space-y-3">
          {/* Main action buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleStand}
              disabled={!canStand}
              className={`
                px-6 py-3 rounded-lg font-western text-lg
                transition-all duration-200
                ${canStand
                  ? 'bg-blue-700 hover:bg-blue-600 text-white border-2 border-blue-500 hover:scale-105'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Stand
            </button>

            <button
              onClick={handleHit}
              disabled={!canHit}
              className={`
                px-6 py-3 rounded-lg font-western text-lg
                transition-all duration-200
                ${canHit
                  ? 'bg-green-700 hover:bg-green-600 text-white border-2 border-green-500 hover:scale-105'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isLoading ? 'Dealing...' : hasDoubledDown ? 'Final Card' : 'Hit'}
            </button>
          </div>

          {/* Phase 3: Vegas-style action buttons */}
          {(canDoubleDown || canInsurance) && (
            <div className="flex justify-center gap-3">
              {canDoubleDown && (
                <button
                  onClick={handleDoubleDown}
                  disabled={isLoading}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-bold
                    transition-all duration-200
                    ${!isLoading
                      ? 'bg-yellow-700 hover:bg-yellow-600 text-white border border-yellow-500 hover:scale-105'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }
                  `}
                  title="Double your bet, get exactly one more card"
                >
                  💰 Double Down (2x bet, 1 card)
                </button>
              )}
              {canInsurance && (
                <button
                  onClick={handleInsurance}
                  disabled={isLoading}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-bold
                    transition-all duration-200
                    ${!isLoading
                      ? 'bg-blue-700 hover:bg-blue-600 text-white border border-blue-500 hover:scale-105'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }
                  `}
                  title="Side bet against dealer blackjack (pays 2:1)"
                >
                  🛡️ Insurance (vs Dealer 21)
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Hints */}
      <div className="mt-4 p-3 bg-wood-darker rounded border border-wood-light/30">
        <h4 className="text-gold-light text-sm font-bold mb-2">Card Values:</h4>
        <div className="text-xs text-desert-sand space-y-1">
          <p>• Number cards = face value</p>
          <p>• J, Q, K = 10</p>
          <p>• Ace = 11 (or 1 if would bust)</p>
        </div>
      </div>
    </div>
  );
};

export default BlackjackGame;
