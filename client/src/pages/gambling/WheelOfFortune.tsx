/**
 * Wheel of Fortune Game Page
 * Spin the wheel and win big!
 */

import React, { useCallback } from 'react';
import { Button } from '@/components/ui';
import { BetControls } from '@/components/gambling';
import { useGamblingStore } from '@/store/useGamblingStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useToast } from '@/store/useToastStore';
import { formatDollars } from '@/utils/format';
import type { WheelOfFortuneState } from '@/services/gambling.service';

export const WheelOfFortune: React.FC = () => {
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

  const wheelState: WheelOfFortuneState | null =
    activeGame.type === 'wheel_of_fortune' ? activeGame.state : null;

  const playWheel = useCallback(async () => {
    if (!activeSession || !currentCharacter || isPlaying || !wheelState) return;
    if (betAmount > currentCharacter.gold) return;

    setIsPlaying(true);
    setActiveGame({ type: 'wheel_of_fortune', state: { ...wheelState, isSpinning: true } });
    updateCharacter({ gold: currentCharacter.gold - betAmount });
    updateLocalSession(0, betAmount, false);

    // Simulate spin delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const segments = [1, 2, 5, 10, 20, 1, 2, 5, 1, 2, 1, 2];
    const spinResult = segments[Math.floor(Math.random() * segments.length)];
    const won = wheelState.selectedSegment === spinResult;
    const payout = won ? betAmount * spinResult : 0;

    setActiveGame({
      type: 'wheel_of_fortune',
      state: { ...wheelState, spinResult, isSpinning: false, result: won ? 'win' : 'lose', payout }
    });

    updateLocalSession(payout, 0);
    if (payout > 0) {
      updateCharacter({ gold: currentCharacter.gold + payout });
      success('You Won!', `Payout: ${formatDollars(payout)}`);
    }

    setIsPlaying(false);
  }, [activeSession, currentCharacter, isPlaying, wheelState, betAmount, setIsPlaying, setActiveGame, updateCharacter, updateLocalSession, success]);

  if (!activeSession || !currentCharacter) {
    return <div className="text-center py-8 text-wood-grain">No active session.</div>;
  }

  // Initialize wheel state if needed
  if (!wheelState) {
    setActiveGame({
      type: 'wheel_of_fortune',
      state: { currentBet: betAmount, selectedSegment: 1, isSpinning: false }
    });
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-western text-wood-dark mb-2">Wheel of Fortune</h2>
        <p className="text-wood-grain">Pick a number and spin to win!</p>
      </div>

      <div className="text-center space-y-4">
        <BetControls
          betAmount={betAmount}
          onBetChange={setBetAmount}
          minBet={selectedLocation?.minBet || 10}
          maxBet={Math.min(selectedLocation?.maxBet || 10000, currentCharacter.gold)}
          disabled={wheelState?.isSpinning}
        />

        {/* Segment Selection */}
        <div>
          <label className="block text-sm text-wood-grain mb-2">Pick a Multiplier</label>
          <div className="flex justify-center gap-2 flex-wrap">
            {[1, 2, 5, 10, 20].map((seg) => (
              <button
                key={seg}
                onClick={() => wheelState && setActiveGame({
                  type: 'wheel_of_fortune',
                  state: { ...wheelState, selectedSegment: seg }
                })}
                disabled={wheelState?.isSpinning}
                className={`w-16 h-16 rounded-full font-bold text-lg transition-all
                  ${wheelState?.selectedSegment === seg
                    ? 'bg-gold-light text-wood-dark scale-110'
                    : 'bg-wood-grain/20 text-wood-dark hover:bg-wood-grain/40'
                  }
                `}
              >
                {seg}x
              </button>
            ))}
          </div>
        </div>

        {/* Wheel Display */}
        <div className={`text-8xl ${wheelState?.isSpinning ? 'animate-spin' : ''}`}>
          🎡
        </div>

        {/* Result */}
        {wheelState?.spinResult !== undefined && !wheelState.isSpinning && (
          <div className={`text-2xl font-western ${
            wheelState.result === 'win' ? 'text-green-500' : 'text-red-500'
          }`}>
            Result: {wheelState.spinResult}x
            {wheelState.result === 'win' && ` - You Won ${formatDollars(wheelState.payout || 0)}!`}
            {wheelState.result === 'lose' && ' - Better luck next time!'}
          </div>
        )}

        <Button
          variant="secondary"
          onClick={playWheel}
          disabled={!wheelState?.selectedSegment || wheelState?.isSpinning || betAmount > currentCharacter.gold}
          isLoading={wheelState?.isSpinning}
          loadingText="Spinning..."
        >
          Spin the Wheel ({formatDollars(betAmount)})
        </Button>
      </div>
    </div>
  );
};

export default WheelOfFortune;
