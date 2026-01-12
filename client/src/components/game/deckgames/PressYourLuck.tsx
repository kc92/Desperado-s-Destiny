/**
 * PressYourLuck Component
 * Push-your-luck game: Draw cards one at a time, J/Q/K are danger cards
 * 3 danger cards = bust! Stop anytime to lock in your score.
 * Used for Crime encounters
 */

import React, { useState, useEffect } from 'react';
import { Card, Rank } from '@desperados/shared';
import { PlayingCard } from '../PlayingCard';

interface PressYourLuckProps {
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
  // Phase 3: Enhanced risk/reward options
  safeDrawCost?: number;
  streakCount?: number;
  streakMultiplier?: number;
  hasDoubledDown?: boolean;
  potentialDoubleDownReward?: number;
  dangerMeter?: number;
  characterSkillBonus?: number;
}

// Check if a card is a danger card (J, Q, K)
const isDangerCard = (card: Card): boolean => {
  return card.rank === Rank.JACK || card.rank === Rank.QUEEN || card.rank === Rank.KING;
};

export const PressYourLuck: React.FC<PressYourLuckProps> = ({
  hand,
  selectedCards: _selectedCards,
  onToggleCard: _onToggleCard,
  onAction,
  isLoading,
  turnNumber: _turnNumber,
  maxTurns,
  relevantSuit,
  difficulty: _difficulty,
  availableActions,
  // Phase 3 props
  safeDrawCost = 50,
  streakCount = 0,
  streakMultiplier = 1,
  hasDoubledDown = false,
  potentialDoubleDownReward = 0,
  dangerMeter = 0,
  characterSkillBonus = 0,
}) => {
  const [lastCardFlipped, setLastCardFlipped] = useState(false);

  // Count danger cards
  const dangerCount = hand.filter(isDangerCard).length;
  const isBusted = dangerCount >= 3;

  // Calculate current score (sum of card values, excluding danger cards)
  const currentScore = hand.reduce((sum, card) => {
    if (isDangerCard(card)) return sum;
    const value = card.rank === Rank.ACE ? 11 : parseInt(String(card.rank));
    return sum + (isNaN(value) ? 10 : value);
  }, 0);

  // Count suit matches
  const suitCount = relevantSuit
    ? hand.filter(card => card.suit.toLowerCase() === relevantSuit.toLowerCase()).length
    : 0;

  // Animate last card flip
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

  // Phase 3: Enhanced action handlers
  const handleSafeDraw = () => {
    onAction({ type: 'safe_draw' });
  };

  const handleDoubleDown = () => {
    onAction({ type: 'double_down' });
  };

  const canDraw = !isBusted && !isLoading && hand.length < maxTurns && !hasDoubledDown;
  const canStop = !isBusted && !isLoading && hand.length > 0;

  // Phase 3: Check available actions
  const canSafeDraw = availableActions.includes('safe_draw') && !isBusted && hand.length < maxTurns;
  const canDoubleDown = availableActions.includes('double_down') && !isBusted && !hasDoubledDown && hand.length >= 2;

  return (
    <div className="space-y-6">
      {/* Game info with skill bonus */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-desert-sand text-sm">
            Cards Drawn: {hand.length}/{maxTurns}
          </span>
          {characterSkillBonus > 0 && (
            <span className="text-green-400 text-xs bg-green-900/30 px-2 py-1 rounded">
              -{Math.floor(characterSkillBonus * 0.5)}% danger
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gold-light font-bold">
            Score: {currentScore}
            {streakMultiplier > 1 && (
              <span className="text-green-400 ml-1">(×{streakMultiplier.toFixed(1)})</span>
            )}
          </span>
          {relevantSuit && (
            <span className="text-sm text-desert-sand">
              Suit Matches: {suitCount}
            </span>
          )}
        </div>
      </div>

      {/* Phase 3: Status indicators */}
      <div className="flex justify-center gap-3 text-xs">
        {streakCount > 0 && (
          <span className="px-2 py-1 rounded bg-green-900/50 text-green-300">
            🔥 Streak: {streakCount} ({streakMultiplier.toFixed(1)}x)
          </span>
        )}
        {hasDoubledDown && (
          <span className="px-2 py-1 rounded bg-yellow-900/50 text-yellow-300 font-bold">
            💰 DOUBLED DOWN - {potentialDoubleDownReward > 0 ? `${potentialDoubleDownReward} potential!` : '2x stakes!'}
          </span>
        )}
      </div>

      {/* Enhanced Danger meter */}
      <div className="bg-wood-darker rounded p-3 border border-wood-light/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-desert-sand">Danger Level</span>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold ${
              dangerCount === 0 ? 'text-green-400' :
              dangerCount === 1 ? 'text-yellow-400' :
              dangerCount === 2 ? 'text-orange-500' :
              'text-red-500'
            }`}>
              {dangerCount}/3 {isBusted && '- BUSTED!'}
            </span>
            {dangerMeter > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded ${
                dangerMeter < 30 ? 'bg-green-900/50 text-green-300' :
                dangerMeter < 60 ? 'bg-yellow-900/50 text-yellow-300' :
                'bg-red-900/50 text-red-300'
              }`}>
                {dangerMeter}% bust risk
              </span>
            )}
          </div>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden relative">
          {/* Danger cards bar */}
          <div
            className={`h-full transition-all duration-500 ${
              dangerCount === 0 ? 'bg-green-500' :
              dangerCount === 1 ? 'bg-yellow-500' :
              dangerCount === 2 ? 'bg-orange-500' :
              'bg-red-500'
            }`}
            style={{ width: `${(dangerCount / 3) * 100}%` }}
          />
          {/* Bust probability overlay */}
          {dangerMeter > 0 && (
            <div
              className="absolute top-0 h-full bg-red-400/30 transition-all duration-300"
              style={{ width: `${Math.min(dangerMeter, 100)}%`, right: 0 }}
            />
          )}
        </div>
        <p className="text-xs text-desert-dust mt-1">
          J, Q, K are danger cards. Draw 3 and you lose everything!
        </p>
      </div>

      {/* Instructions */}
      <div className="text-center">
        {isBusted ? (
          <p className="text-red-500 font-bold text-lg">
            💀 Too risky! You've been caught!
          </p>
        ) : hand.length === 0 ? (
          <p className="text-desert-sand">
            Draw cards to build your score. Stop before you bust!
          </p>
        ) : (
          <p className="text-desert-sand">
            Push your luck or play it safe?
          </p>
        )}
      </div>

      {/* Card display */}
      <div className="flex flex-wrap justify-center items-end gap-2 py-4 min-h-[180px]">
        {hand.map((card, index) => (
          <div
            key={`${card.suit}-${card.rank}-${index}`}
            className={`transform transition-all duration-300 ${
              isDangerCard(card) ? 'scale-105' : ''
            }`}
          >
            <PlayingCard
              card={card}
              isFlipped={index < hand.length - 1 || lastCardFlipped}
              size="sm"
              isHighlighted={
                isDangerCard(card) ||
                !!(relevantSuit && card.suit.toLowerCase() === relevantSuit.toLowerCase())
              }
            />
            {isDangerCard(card) && (
              <div className="text-center mt-1">
                <span className="text-xs text-red-500 font-bold">DANGER!</span>
              </div>
            )}
          </div>
        ))}

        {/* Empty slot indicator */}
        {hand.length === 0 && (
          <div className="w-16 h-24 border-2 border-dashed border-wood-light rounded-lg flex items-center justify-center">
            <span className="text-wood-light text-xs">Draw</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!isBusted && (
        <div className="space-y-3">
          {/* Main action buttons */}
          <div className="flex justify-center gap-4">
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
              Stop ({Math.round(currentScore * streakMultiplier)} pts)
            </button>

            <button
              onClick={handleDraw}
              disabled={!canDraw}
              className={`
                px-6 py-3 rounded-lg font-western text-lg
                transition-all duration-200
                ${canDraw
                  ? 'bg-red-700 hover:bg-red-600 text-white border-2 border-red-500 hover:scale-105'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Drawing...
                </span>
              ) : (
                '🎲 Draw Card'
              )}
            </button>
          </div>

          {/* Phase 3: Enhanced action buttons */}
          {(canSafeDraw || canDoubleDown) && (
            <div className="flex justify-center gap-3">
              {canSafeDraw && (
                <button
                  onClick={handleSafeDraw}
                  disabled={isLoading}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-bold
                    transition-all duration-200
                    ${!isLoading
                      ? 'bg-blue-700 hover:bg-blue-600 text-white border border-blue-500 hover:scale-105'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }
                  `}
                  title={`Draw a safe card (no J/Q/K) for ${safeDrawCost} gold`}
                >
                  🛡️ Safe Draw (-${safeDrawCost})
                </button>
              )}
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
                  title="Double or nothing - risk it all!"
                >
                  💰 Double Down (2x or nothing!)
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Risk/Reward hint */}
      <div className="mt-4 p-3 bg-wood-darker rounded border border-wood-light/30">
        <h4 className="text-gold-light text-sm font-bold mb-2">Risk vs Reward:</h4>
        <div className="text-xs text-desert-sand space-y-1">
          <p>• Number cards (2-10, A) add to your score</p>
          <p>• Face cards (J, Q, K) are dangerous - 3 = bust!</p>
          <p>• Higher scores = better rewards</p>
          <p>• More cards = higher risk multiplier bonus</p>
        </div>
      </div>
    </div>
  );
};

export default PressYourLuck;
