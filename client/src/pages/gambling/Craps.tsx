/**
 * Craps Game Page
 * Roll the dice and beat the house
 */

import React, { useCallback } from 'react';
import { Button } from '@/components/ui';
import { BetControls } from '@/components/gambling';
import { useGamblingStore } from '@/store/useGamblingStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useToast } from '@/store/useToastStore';
import { formatDollars } from '@/utils/format';
import type { CrapsState } from '@/services/gambling.service';

export const Craps: React.FC = () => {
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
  const { success, info } = useToast();

  const crapsState: CrapsState | null =
    activeGame.type === 'craps' ? activeGame.state : null;

  const playCraps = useCallback(async () => {
    if (!activeSession || !currentCharacter || isPlaying || !crapsState) return;
    if (betAmount > currentCharacter.gold) return;

    setIsPlaying(true);

    if (crapsState.point === null) {
      // Come-out roll
      updateCharacter({ gold: currentCharacter.gold - betAmount });
      updateLocalSession(0, betAmount, false);
    }

    // Simulate roll delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;

    let result: 'win' | 'lose' | 'point_set' | undefined;
    let payout = 0;
    let newPoint = crapsState.point;

    if (crapsState.point === null) {
      if (total === 7 || total === 11) {
        result = crapsState.betType === 'pass' ? 'win' : 'lose';
        payout = result === 'win' ? betAmount * 2 : 0;
      } else if (total === 2 || total === 3 || total === 12) {
        result = crapsState.betType === 'pass' ? 'lose' : 'win';
        payout = result === 'win' ? betAmount * 2 : 0;
      } else {
        result = 'point_set';
        newPoint = total;
      }
    } else {
      if (total === crapsState.point) {
        result = crapsState.betType === 'pass' ? 'win' : 'lose';
        payout = result === 'win' ? betAmount * 2 : 0;
        newPoint = null;
      } else if (total === 7) {
        result = crapsState.betType === 'pass' ? 'lose' : 'win';
        payout = result === 'win' ? betAmount * 2 : 0;
        newPoint = null;
      }
    }

    setActiveGame({
      type: 'craps',
      state: { ...crapsState, dice: [die1, die2], point: newPoint, result, payout }
    });

    if (result && result !== 'point_set') {
      updateLocalSession(payout, 0);
      if (payout > 0) {
        updateCharacter({ gold: currentCharacter.gold + payout });
        success('You Won!', `Payout: ${formatDollars(payout)}`);
      }
    } else if (result === 'point_set') {
      info('Point Set', `The point is ${total}. Roll again!`);
    }

    setIsPlaying(false);
  }, [activeSession, currentCharacter, isPlaying, crapsState, betAmount, setIsPlaying, updateCharacter, updateLocalSession, setActiveGame, success, info]);

  const setBetType = (type: 'pass' | 'dont_pass') => {
    setActiveGame({
      type: 'craps',
      state: { currentBet: betAmount, betType: type, dice: [0, 0], point: null, result: undefined }
    });
  };

  if (!activeSession || !currentCharacter) {
    return <div className="text-center py-8 text-wood-grain">No active session.</div>;
  }

  if (!crapsState) {
    setActiveGame({
      type: 'craps',
      state: { currentBet: betAmount, betType: 'pass', dice: [0, 0], point: null }
    });
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-western text-wood-dark mb-2">Craps</h2>
        <p className="text-wood-grain">Roll the dice and beat the house</p>
      </div>

      <div className="text-center space-y-4">
        <BetControls
          betAmount={betAmount}
          onBetChange={setBetAmount}
          minBet={selectedLocation?.minBet || 10}
          maxBet={Math.min(selectedLocation?.maxBet || 10000, currentCharacter.gold)}
          disabled={isPlaying || (crapsState?.point !== null)}
        />

        {/* Bet Type Selection */}
        {crapsState?.point === null && (
          <div className="flex justify-center gap-4">
            <Button
              variant={crapsState?.betType === 'pass' ? 'primary' : 'ghost'}
              onClick={() => setBetType('pass')}
              disabled={isPlaying}
            >
              Pass Line
            </Button>
            <Button
              variant={crapsState?.betType === 'dont_pass' ? 'primary' : 'ghost'}
              onClick={() => setBetType('dont_pass')}
              disabled={isPlaying}
            >
              Don't Pass
            </Button>
          </div>
        )}

        {/* Point Display */}
        {crapsState?.point !== null && crapsState?.point !== undefined && (
          <div className="text-xl font-western text-gold-light">
            Point: {crapsState?.point}
          </div>
        )}

        {/* Dice Display */}
        <div className="flex justify-center gap-4 text-6xl">
          {crapsState?.dice && crapsState.dice[0] > 0 ? (
            <>
              <span>{['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][crapsState.dice[0] - 1]}</span>
              <span>{['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][crapsState.dice[1] - 1]}</span>
            </>
          ) : (
            <>
              <span className="text-wood-grain/50">🎲</span>
              <span className="text-wood-grain/50">🎲</span>
            </>
          )}
        </div>

        {/* Roll Total */}
        {crapsState?.dice && (
          <p className="text-xl text-wood-dark">
            Total: {crapsState.dice[0] + crapsState.dice[1]}
          </p>
        )}

        {/* Result */}
        {crapsState?.result && crapsState.result !== 'point_set' && (
          <div className={`text-2xl font-western ${
            crapsState.result === 'win' ? 'text-green-500' : 'text-red-500'
          }`}>
            {crapsState.result === 'win'
              ? `You Won! +${formatDollars(crapsState.payout || 0)}`
              : 'Seven Out!'}
          </div>
        )}

        <Button
          variant="secondary"
          onClick={playCraps}
          disabled={isPlaying || betAmount > currentCharacter.gold}
          isLoading={isPlaying}
        >
          {crapsState?.point === null
            ? `Roll (${formatDollars(betAmount)})`
            : 'Roll Again'}
        </Button>
      </div>
    </div>
  );
};

export default Craps;
