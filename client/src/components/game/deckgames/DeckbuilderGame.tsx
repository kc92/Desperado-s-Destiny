/**
 * DeckbuilderGame Component
 * Draw limited cards to build combos (pairs, flushes, straights)
 * Used for Crafting encounters
 */

import React, { useState, useEffect } from 'react';
import { Card, Rank } from '@desperados/shared';
import { PlayingCard } from '../PlayingCard';

interface DeckbuilderGameProps {
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
}

// Analyze hand for combos
const analyzeHand = (cards: Card[]): string[] => {
  const combos: string[] = [];

  if (cards.length === 0) return combos;

  // Count ranks
  const rankCounts: Record<string, number> = {};
  cards.forEach(card => {
    rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
  });

  // Count suits
  const suitCounts: Record<string, number> = {};
  cards.forEach(card => {
    suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
  });

  // Check for pairs/trips/quads
  Object.entries(rankCounts).forEach(([_rank, count]) => {
    if (count >= 4) combos.push('Four of a Kind!');
    else if (count >= 3) combos.push('Triple');
    else if (count >= 2) combos.push('Pair');
  });

  // Check for flushes
  Object.entries(suitCounts).forEach(([_suit, count]) => {
    if (count >= 5) combos.push('Flush 5!');
    else if (count >= 4) combos.push('Flush 4');
    else if (count >= 3) combos.push('Flush 3');
  });

  // Check for straights (simplified)
  const rankValues = cards.map(c => {
    if (c.rank === Rank.ACE) return 14;
    if (c.rank === Rank.KING) return 13;
    if (c.rank === Rank.QUEEN) return 12;
    if (c.rank === Rank.JACK) return 11;
    return parseInt(String(c.rank));
  }).sort((a, b) => a - b);

  let consecutive = 1;
  let maxConsecutive = 1;
  for (let i = 1; i < rankValues.length; i++) {
    if (rankValues[i] === rankValues[i-1] + 1) {
      consecutive++;
      maxConsecutive = Math.max(maxConsecutive, consecutive);
    } else if (rankValues[i] !== rankValues[i-1]) {
      consecutive = 1;
    }
  }

  if (maxConsecutive >= 5) combos.push('Straight!');
  else if (maxConsecutive >= 4) combos.push('Straight 4');
  else if (maxConsecutive >= 3) combos.push('Straight 3');

  return combos;
};

export const DeckbuilderGame: React.FC<DeckbuilderGameProps> = ({
  hand,
  selectedCards: _selectedCards,
  onToggleCard: _onToggleCard,
  onAction,
  isLoading,
  turnNumber: _turnNumber,
  maxTurns,
  relevantSuit,
  difficulty: _difficulty,
  availableActions: _availableActions,
}) => {
  const [lastCardFlipped, setLastCardFlipped] = useState(false);

  const combos = analyzeHand(hand);
  const drawsRemaining = maxTurns - hand.length;

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

  const handleDraw = () => {
    onAction({ type: 'draw' });
  };

  const handleStop = () => {
    onAction({ type: 'stop' });
  };

  const canDraw = drawsRemaining > 0 && !isLoading;
  const canStop = hand.length > 0 && !isLoading;

  return (
    <div className="space-y-6">
      {/* Game info */}
      <div className="flex justify-between items-center">
        <span className="text-desert-sand text-sm">
          Draws Remaining: {drawsRemaining}
        </span>
        <span className="text-gold-light font-bold">
          Cards: {hand.length}
        </span>
      </div>

      {/* Efficiency bonus indicator */}
      <div className="bg-wood-darker rounded p-3 border border-wood-light/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-desert-sand">Efficiency Bonus</span>
          <span className="text-sm text-gold-light">
            +{Math.max(0, drawsRemaining * 10)}%
          </span>
        </div>
        <p className="text-xs text-desert-dust">
          Unused draws give bonus multiplier to rewards!
        </p>
      </div>

      {/* Current combos */}
      <div className="bg-wood-darker rounded p-3 border border-gold-dark/50">
        <h4 className="text-gold-light text-sm font-bold mb-2">Current Combos:</h4>
        {combos.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {combos.map((combo, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-green-900/50 text-green-400 text-xs rounded"
              >
                {combo}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-desert-dust text-xs">No combos yet - draw more cards!</p>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center">
        <p className="text-desert-sand">
          Build combos efficiently. Fewer draws = bigger bonus!
        </p>
      </div>

      {/* Card display */}
      <div className="flex flex-wrap justify-center items-end gap-2 py-4 min-h-[180px]">
        {hand.map((card, index) => (
          <div
            key={`${card.suit}-${card.rank}-${index}`}
            className="transform transition-all duration-300"
          >
            <PlayingCard
              card={card}
              isFlipped={index < hand.length - 1 || lastCardFlipped}
              size="sm"
              isHighlighted={
                !!(relevantSuit &&
                card.suit.toLowerCase() === relevantSuit.toLowerCase())
              }
            />
          </div>
        ))}

        {hand.length === 0 && (
          <div className="w-16 h-24 border-2 border-dashed border-wood-light rounded-lg flex items-center justify-center">
            <span className="text-wood-light text-xs">Draw</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-center gap-4">
        {combos.length > 0 && (
          <button
            onClick={handleStop}
            disabled={!canStop}
            className={`
              px-6 py-3 rounded-lg font-western text-lg
              transition-all duration-200
              ${canStop
                ? 'bg-green-700 hover:bg-green-600 text-white border-2 border-green-500 hover:scale-105'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Craft! (+{drawsRemaining * 10}% bonus)
          </button>
        )}

        <button
          onClick={handleDraw}
          disabled={!canDraw}
          className={`
            px-6 py-3 rounded-lg font-western text-lg
            transition-all duration-200
            ${canDraw
              ? 'bg-leather-saddle hover:bg-leather-brown text-gold-light border-2 border-gold-dark hover:scale-105'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? 'Drawing...' : `Draw (${drawsRemaining} left)`}
        </button>
      </div>

      {/* Combo guide */}
      <div className="mt-4 p-3 bg-wood-darker rounded border border-wood-light/30">
        <h4 className="text-gold-light text-sm font-bold mb-2">Combo Types:</h4>
        <div className="grid grid-cols-2 gap-1 text-xs text-desert-sand">
          <span>Pair - 2 same rank</span>
          <span>Triple - 3 same rank</span>
          <span>Four of Kind - 4 same rank</span>
          <span>Flush 3+ - 3+ same suit</span>
          <span>Straight 3+ - 3+ consecutive</span>
          <span>Efficiency - unused draws</span>
        </div>
      </div>
    </div>
  );
};

export default DeckbuilderGame;
