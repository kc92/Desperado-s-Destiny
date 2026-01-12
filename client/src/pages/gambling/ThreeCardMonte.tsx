/**
 * Three Card Monte Game Page
 * Find the Queen among three cards
 */

import React, { useCallback } from 'react';
import { Button } from '@/components/ui';
import { BetControls } from '@/components/gambling';
import { useGamblingStore } from '@/store/useGamblingStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useToast } from '@/store/useToastStore';
import { formatDollars } from '@/utils/format';
import type { ThreeCardMonteState } from '@/services/gambling.service';

export const ThreeCardMonte: React.FC = () => {
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

  const monteState: ThreeCardMonteState | null =
    activeGame.type === 'three_card_monte' ? activeGame.state : null;

  const playMonte = useCallback(async () => {
    if (!activeSession || !currentCharacter || isPlaying || !monteState || monteState.selectedPosition === null) return;
    if (betAmount > currentCharacter.gold) return;

    setIsPlaying(true);
    updateCharacter({ gold: currentCharacter.gold - betAmount });
    updateLocalSession(0, betAmount, false);

    // Simulate shuffle delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const queenPosition = Math.floor(Math.random() * 3);
    const won = monteState.selectedPosition === queenPosition;
    const payout = won ? betAmount * 2 : 0;

    setActiveGame({
      type: 'three_card_monte',
      state: { ...monteState, queenPosition, revealed: true, result: won ? 'win' : 'lose', payout }
    });

    updateLocalSession(payout, 0);
    if (payout > 0) {
      updateCharacter({ gold: currentCharacter.gold + payout });
      success('You Won!', `The Queen was there! Payout: ${formatDollars(payout)}`);
    }

    setIsPlaying(false);
  }, [activeSession, currentCharacter, isPlaying, monteState, betAmount, setIsPlaying, updateCharacter, updateLocalSession, setActiveGame, success]);

  const selectPosition = (pos: number) => {
    if (monteState?.revealed) {
      // Reset for new game
      setActiveGame({
        type: 'three_card_monte',
        state: { currentBet: betAmount, selectedPosition: pos, revealed: false }
      });
    } else {
      setActiveGame({
        type: 'three_card_monte',
        state: { ...monteState, currentBet: monteState?.currentBet || betAmount, selectedPosition: pos, revealed: monteState?.revealed || false }
      });
    }
  };

  if (!activeSession || !currentCharacter) {
    return <div className="text-center py-8 text-wood-grain">No active session.</div>;
  }

  // Initialize state if needed
  if (!monteState) {
    setActiveGame({
      type: 'three_card_monte',
      state: { currentBet: betAmount, selectedPosition: null, revealed: false }
    });
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-western text-wood-dark mb-2">Three-Card Monte</h2>
        <p className="text-wood-grain">Find the Queen to double your money!</p>
      </div>

      <div className="text-center space-y-4">
        <BetControls
          betAmount={betAmount}
          onBetChange={setBetAmount}
          minBet={selectedLocation?.minBet || 10}
          maxBet={Math.min(selectedLocation?.maxBet || 10000, currentCharacter.gold)}
          disabled={isPlaying}
        />

        {/* Card Selection */}
        <div className="flex justify-center gap-4">
          {[0, 1, 2].map((pos) => (
            <button
              key={pos}
              onClick={() => selectPosition(pos)}
              disabled={isPlaying}
              className={`w-20 h-28 rounded-lg border-2 text-4xl flex items-center justify-center transition-all
                ${monteState?.revealed && monteState.queenPosition === pos
                  ? 'bg-gold-light border-gold-dark'
                  : monteState?.selectedPosition === pos
                  ? 'bg-blue-900 border-blue-500 scale-105'
                  : 'bg-blue-800 border-blue-600 hover:border-blue-400'
                }
              `}
            >
              {monteState?.revealed
                ? pos === monteState.queenPosition ? '👑' : '🃏'
                : monteState?.selectedPosition === pos ? '?' : '🎴'}
            </button>
          ))}
        </div>

        {/* Result */}
        {monteState?.revealed && (
          <div className={`text-2xl font-western ${
            monteState.result === 'win' ? 'text-green-500' : 'text-red-500'
          }`}>
            {monteState.result === 'win'
              ? `You Found the Queen! +${formatDollars(monteState.payout || 0)}`
              : 'Not this time! The Queen was hiding elsewhere.'}
          </div>
        )}

        <Button
          variant="secondary"
          onClick={monteState?.revealed ? () => selectPosition(0) : playMonte}
          disabled={(monteState?.selectedPosition === null && !monteState?.revealed) || isPlaying || betAmount > currentCharacter.gold}
          isLoading={isPlaying}
        >
          {monteState?.revealed ? 'Play Again' : `Find the Queen (${formatDollars(betAmount)})`}
        </Button>
      </div>
    </div>
  );
};

export default ThreeCardMonte;
