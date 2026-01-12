/**
 * Faro Game Page
 * Classic Western card game - bet on cards to win or lose
 */

import React, { useCallback } from 'react';
import { Button } from '@/components/ui';
import { BetControls } from '@/components/gambling';
import { useGamblingStore } from '@/store/useGamblingStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useToast } from '@/store/useToastStore';
import { formatDollars } from '@/utils/format';
import type { FaroState } from '@/services/gambling.service';

const CARDS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const Faro: React.FC = () => {
  const { currentCharacter, updateCharacter } = useCharacterStore();
  const {
    activeSession,
    activeGame,
    betAmount,
    isPlaying,
    selectedLocation,
    setBetAmount,
    setActiveGame,
    setIsPlaying,
    updateLocalSession,
  } = useGamblingStore();
  const { success } = useToast();

  const faroState: FaroState | null =
    activeGame.type === 'faro' ? activeGame.state : null;

  const playFaro = useCallback(async () => {
    if (!activeSession || !currentCharacter || isPlaying || !faroState || !faroState.selectedCard) return;
    if (betAmount > currentCharacter.gold) return;

    setIsPlaying(true);
    updateCharacter({ gold: currentCharacter.gold - betAmount });
    updateLocalSession(0, betAmount, false);

    // Simulate card draw delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const losingCard = CARDS[Math.floor(Math.random() * CARDS.length)];
    const winningCard = CARDS[Math.floor(Math.random() * CARDS.length)];

    let result: 'win' | 'lose' | 'push';
    let payout = 0;

    if (faroState.selectedCard === winningCard && faroState.selectedCard !== losingCard) {
      result = 'win';
      payout = betAmount * 2;
    } else if (faroState.selectedCard === losingCard) {
      result = 'lose';
      payout = 0;
    } else if (winningCard === losingCard) {
      result = 'push';
      payout = betAmount;
    } else {
      result = 'lose';
      payout = 0;
    }

    setActiveGame({
      type: 'faro',
      state: { ...faroState, losingCard, winningCard, result, payout }
    });

    updateLocalSession(payout, 0);
    if (payout > 0) {
      updateCharacter({ gold: currentCharacter.gold + payout });
      if (result === 'win') {
        success('You Won!', `Payout: ${formatDollars(payout)}`);
      }
    }

    setIsPlaying(false);
  }, [activeSession, currentCharacter, isPlaying, faroState, betAmount, setIsPlaying, updateCharacter, updateLocalSession, setActiveGame, success]);

  const selectCard = (card: string) => {
    if (faroState?.result) {
      // Reset for new game
      setActiveGame({
        type: 'faro',
        state: { currentBet: betAmount, selectedCard: card }
      });
    } else {
      setActiveGame({
        type: 'faro',
        state: { currentBet: faroState?.currentBet || betAmount, selectedCard: card }
      });
    }
  };

  if (!activeSession || !currentCharacter) {
    return <div className="text-center py-8 text-wood-grain">No active session.</div>;
  }

  if (!faroState) {
    setActiveGame({ type: 'faro', state: { currentBet: betAmount, selectedCard: CARDS[0] } });
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-western text-wood-dark mb-2">Faro</h2>
        <p className="text-wood-grain">Pick a card - match the winner, avoid the loser</p>
      </div>

      <div className="text-center space-y-4">
        <BetControls
          betAmount={betAmount}
          onBetChange={setBetAmount}
          minBet={selectedLocation?.minBet || 10}
          maxBet={Math.min(selectedLocation?.maxBet || 10000, currentCharacter.gold)}
          disabled={isPlaying}
        />

        {/* Card Selection Grid */}
        <div className="grid grid-cols-7 gap-2 max-w-md mx-auto">
          {CARDS.map((card) => (
            <button
              key={card}
              onClick={() => selectCard(card)}
              disabled={isPlaying}
              className={`p-2 rounded border-2 font-bold transition-all
                ${faroState?.selectedCard === card
                  ? 'bg-gold-light border-gold-dark text-wood-dark scale-105'
                  : faroState?.result && card === faroState.winningCard
                  ? 'bg-green-500/30 border-green-500'
                  : faroState?.result && card === faroState.losingCard
                  ? 'bg-red-500/30 border-red-500'
                  : 'bg-wood-grain/20 border-wood-grain/40 hover:border-gold-light'
                }
              `}
            >
              {card}
            </button>
          ))}
        </div>

        {/* Result Display */}
        {faroState?.result && (
          <div className="space-y-2">
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <p className="text-sm text-wood-grain">Winner</p>
                <p className="text-2xl text-green-500 font-bold">{faroState.winningCard}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-wood-grain">Loser</p>
                <p className="text-2xl text-red-500 font-bold">{faroState.losingCard}</p>
              </div>
            </div>
            <div className={`text-2xl font-western ${
              faroState.result === 'win' ? 'text-green-500'
              : faroState.result === 'push' ? 'text-yellow-500'
              : 'text-red-500'
            }`}>
              {faroState.result === 'win' && `You Won! +${formatDollars(faroState.payout || 0)}`}
              {faroState.result === 'push' && 'Push - Bet Returned'}
              {faroState.result === 'lose' && 'You Lost!'}
            </div>
          </div>
        )}

        <Button
          variant="secondary"
          onClick={faroState?.result ? () => selectCard(faroState.selectedCard || 'A') : playFaro}
          disabled={!faroState?.selectedCard || isPlaying || betAmount > currentCharacter.gold}
          isLoading={isPlaying}
        >
          {faroState?.result ? 'Play Again' : `Draw Cards (${formatDollars(betAmount)})`}
        </Button>
      </div>
    </div>
  );
};

export default Faro;
