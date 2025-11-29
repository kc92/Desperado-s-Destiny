/**
 * PokerHoldDraw Component
 * Poker-style game: Draw 5 cards, choose which to hold, redraw the rest
 * Now with full deal/discard animations
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@desperados/shared';
import { AnimatedCard, CardDeck, DiscardPile, calculateFanPositions } from '../card';
import { useCardAnimations } from '../../../hooks/useCardAnimations';
import { useSoundEffects, SoundEffect } from '../../../hooks/useSoundEffects';

interface PokerHoldDrawProps {
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
  // Phase 3: Strategic options
  rerollsUsed?: number;
  rerollsAvailable?: number;
  peeksUsed?: number;
  peeksAvailable?: number;
  peekedCard?: Card | null;
  earlyFinishBonus?: number;
  characterSkillBonus?: number;
}

export const PokerHoldDraw: React.FC<PokerHoldDrawProps> = ({
  hand,
  selectedCards,
  onToggleCard,
  onAction,
  isLoading,
  turnNumber,
  maxTurns,
  relevantSuit,
  difficulty: _difficulty,
  availableActions,
  // Phase 3 props
  rerollsUsed = 0,
  rerollsAvailable = 0,
  peeksUsed = 0,
  peeksAvailable = 0,
  peekedCard = null,
  earlyFinishBonus = 0,
  characterSkillBonus = 0,
}) => {
  const [cardsRevealed, setCardsRevealed] = useState(false);

  // Sound effects
  const { playSound } = useSoundEffects();

  // Map useCardAnimations sound callback to our sound effect types
  const handleSoundEffect = (effect: 'deal' | 'flip' | 'discard' | 'victory') => {
    playSound(effect as SoundEffect);
  };

  // Animation orchestration
  const {
    cardStates,
    isAnimating,
    phase,
    dealCards,
    revealHand,
    reset,
  } = useCardAnimations({
    cardWidth: 96,
    onSoundEffect: handleSoundEffect,
    onDealComplete: () => {
      // Auto-reveal after deal
      revealHand();
    },
    onFlipComplete: () => {
      setCardsRevealed(true);
    },
    onDiscardComplete: () => {
      setCardsRevealed(true);
    },
  });

  // Fan positions for card layout
  const fanPositions = calculateFanPositions(96);

  // Start deal animation when hand changes
  useEffect(() => {
    if (hand.length === 5) {
      setCardsRevealed(false);
      reset();
      dealCards(hand);
    }
  }, [hand, dealCards, reset]);

  const handleDraw = () => {
    // Pass indices of held cards
    onAction({
      type: 'hold',
      cardIndices: selectedCards,
    });
  };

  // Phase 3: Strategic action handlers
  const handleReroll = () => {
    if (selectedCards.length > 0) {
      onAction({
        type: 'reroll',
        cardIndices: selectedCards,
      });
    }
  };

  const handlePeek = () => {
    onAction({ type: 'peek' });
  };

  const handleEarlyFinish = () => {
    onAction({ type: 'early_finish' });
  };

  // Check available actions
  const canReroll = availableActions.includes('reroll') && selectedCards.length > 0 && rerollsUsed < rerollsAvailable;
  const canPeek = availableActions.includes('peek') && peeksUsed < peeksAvailable;
  const canEarlyFinish = availableActions.includes('early_finish') && turnNumber < maxTurns;
  const remainingRerolls = Math.max(0, rerollsAvailable - rerollsUsed);
  const remainingPeeks = Math.max(0, peeksAvailable - peeksUsed);

  const isFirstTurn = turnNumber === 1;
  const canDraw = cardsRevealed && !isLoading && !isAnimating;

  // Count cards matching relevant suit
  const suitCount = relevantSuit
    ? hand.filter(card => card.suit.toLowerCase() === relevantSuit.toLowerCase()).length
    : 0;

  return (
    <div className="space-y-6">
      {/* Game info with skill bonus */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-desert-sand">
          Turn {turnNumber}/{maxTurns}
        </span>
        <div className="flex items-center gap-4">
          {characterSkillBonus > 0 && (
            <span className="text-green-400 text-xs bg-green-900/30 px-2 py-1 rounded">
              +{Math.floor(characterSkillBonus * 0.4)} threshold | +{Math.floor(characterSkillBonus * 0.3)} score
            </span>
          )}
          {relevantSuit && (
            <span className="text-gold-light">
              Suit Matches: {suitCount}/5
            </span>
          )}
        </div>
      </div>

      {/* Phase 3: Special abilities status */}
      {(rerollsAvailable > 0 || peeksAvailable > 0) && (
        <div className="flex justify-center gap-4 text-xs">
          {rerollsAvailable > 0 && (
            <span className={`px-2 py-1 rounded ${remainingRerolls > 0 ? 'bg-blue-900/50 text-blue-300' : 'bg-gray-800 text-gray-500'}`}>
              🔄 Rerolls: {remainingRerolls}/{rerollsAvailable}
            </span>
          )}
          {peeksAvailable > 0 && (
            <span className={`px-2 py-1 rounded ${remainingPeeks > 0 ? 'bg-purple-900/50 text-purple-300' : 'bg-gray-800 text-gray-500'}`}>
              👁️ Peeks: {remainingPeeks}/{peeksAvailable}
            </span>
          )}
          {canEarlyFinish && earlyFinishBonus > 0 && (
            <span className="px-2 py-1 rounded bg-gold-dark/50 text-gold-light">
              ⚡ Speed Bonus: +{earlyFinishBonus}%
            </span>
          )}
        </div>
      )}

      {/* Peeked card display */}
      {peekedCard && (
        <div className="text-center p-2 bg-purple-900/30 rounded border border-purple-500">
          <span className="text-purple-300 text-sm">
            👁️ Next card: <span className="font-bold">{peekedCard.rank} of {peekedCard.suit}</span>
          </span>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center">
        {isFirstTurn ? (
          <p className="text-desert-sand">
            Click cards to <span className="text-green-400 font-bold">HOLD</span> them,
            then draw to replace the rest
          </p>
        ) : (
          <p className="text-gold-light font-bold">
            Final Hand - Good luck, partner!
          </p>
        )}
      </div>

      {/* Main game area with deck, cards, and discard */}
      <div className="relative h-64 flex items-center justify-center">
        {/* Card Deck (source) */}
        <CardDeck
          isDealing={phase === 'dealing' || phase === 'drawing'}
          position={{ x: 20, y: 20 }}
          size="md"
        />

        {/* Discard Pile (destination) */}
        <DiscardPile
          discardedCards={[]}
          isReceiving={phase === 'discarding'}
          position={{ x: 520, y: 20 }}
          size="md"
        />

        {/* Animated card hand */}
        <div className="relative" style={{ width: 500, height: 200 }}>
          {cardStates.map((cardData, index) => (
            <AnimatedCard
              key={`${cardData.card.suit}-${cardData.card.rank}-${index}`}
              card={cardData.card}
              animationState={
                selectedCards.includes(index) && cardData.state === 'revealed'
                  ? 'selected'
                  : cardData.state
              }
              index={index}
              position={fanPositions[index]}
              isFinalCard={index === 4}
              isHighlighted={
                !!(relevantSuit &&
                cardData.card.suit.toLowerCase() === relevantSuit.toLowerCase())
              }
              showSuitBonus={cardsRevealed && !isFirstTurn}
              isSelected={selectedCards.includes(index)}
              isSelectable={isFirstTurn && cardsRevealed && !isAnimating}
              onClick={() => {
                if (isFirstTurn && cardsRevealed && !isAnimating) {
                  onToggleCard(index);
                }
              }}
              size="md"
            />
          ))}
        </div>
      </div>

      {/* Selection summary */}
      {isFirstTurn && cardsRevealed && (
        <div className="text-center text-sm text-desert-sand">
          {selectedCards.length === 0 ? (
            <span>No cards held - all 5 will be replaced</span>
          ) : selectedCards.length === 5 ? (
            <span className="text-green-400">Holding all cards - no replacement</span>
          ) : (
            <span>
              Holding {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''},
              replacing {5 - selectedCards.length}
            </span>
          )}
        </div>
      )}

      {/* Action buttons */}
      {isFirstTurn && (
        <div className="space-y-3">
          {/* Main draw button */}
          <div className="flex justify-center">
            <button
              onClick={handleDraw}
              disabled={!canDraw}
              className={`
                px-8 py-3 rounded-lg font-western text-lg
                transition-all duration-200
                ${canDraw
                  ? 'bg-leather-saddle hover:bg-leather-brown text-gold-light border-2 border-gold-dark hover:scale-105'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isLoading || isAnimating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  {isAnimating ? 'Dealing...' : 'Drawing...'}
                </span>
              ) : selectedCards.length === 5 ? (
                'Stand Pat'
              ) : (
                `Draw ${5 - selectedCards.length} Card${5 - selectedCards.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>

          {/* Phase 3: Strategic action buttons */}
          {(canReroll || canPeek || canEarlyFinish) && (
            <div className="flex justify-center gap-3">
              {canReroll && (
                <button
                  onClick={handleReroll}
                  disabled={!canDraw || selectedCards.length === 0}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-bold
                    transition-all duration-200
                    ${canDraw && selectedCards.length > 0
                      ? 'bg-blue-700 hover:bg-blue-600 text-white border border-blue-500 hover:scale-105'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }
                  `}
                  title="Replace selected cards without using a turn"
                >
                  🔄 Reroll ({remainingRerolls})
                </button>
              )}
              {canPeek && (
                <button
                  onClick={handlePeek}
                  disabled={!canDraw}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-bold
                    transition-all duration-200
                    ${canDraw
                      ? 'bg-purple-700 hover:bg-purple-600 text-white border border-purple-500 hover:scale-105'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }
                  `}
                  title="See the next card in the deck"
                >
                  👁️ Peek ({remainingPeeks})
                </button>
              )}
              {canEarlyFinish && (
                <button
                  onClick={handleEarlyFinish}
                  disabled={!canDraw}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-bold
                    transition-all duration-200
                    ${canDraw
                      ? 'bg-gold-dark hover:bg-gold-light text-wood-dark border border-gold-light hover:scale-105'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }
                  `}
                  title={`Finish now with ${earlyFinishBonus}% speed bonus`}
                >
                  ⚡ Cash Out (+{earlyFinishBonus}%)
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Poker hand hints */}
      <div className="mt-4 p-3 bg-wood-darker rounded border border-wood-light/30">
        <h4 className="text-gold-light text-sm font-bold mb-2">Poker Hands (Best to Worst):</h4>
        <div className="grid grid-cols-2 gap-1 text-xs text-desert-sand">
          <span>Royal Flush - 1000pts</span>
          <span>Straight Flush - 900pts</span>
          <span>Four of a Kind - 800pts</span>
          <span>Full House - 700pts</span>
          <span>Flush - 600pts</span>
          <span>Straight - 500pts</span>
          <span>Three of a Kind - 400pts</span>
          <span>Two Pair - 300pts</span>
          <span>Pair - 200pts</span>
          <span>High Card - 100pts</span>
        </div>
      </div>
    </div>
  );
};

export default PokerHoldDraw;
