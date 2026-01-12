/**
 * Roulette Game Page
 * Bet on where the ball lands
 */

import React, { useCallback } from 'react';
import { Button } from '@/components/ui';
import { useGamblingStore } from '@/store/useGamblingStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useToast } from '@/store/useToastStore';
import { formatDollars } from '@/utils/format';
import type { RouletteState } from '@/services/gambling.service';

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const isRed = (n: number) => RED_NUMBERS.includes(n);

export const Roulette: React.FC = () => {
  const { currentCharacter, updateCharacter } = useCharacterStore();
  const {
    activeSession,
    activeGame,
    betAmount,
    isPlaying,
    setBetAmount,
    setActiveGame,
    setIsPlaying,
    updateLocalSession,
  } = useGamblingStore();
  const { success } = useToast();

  const rouletteState: RouletteState | null =
    activeGame.type === 'roulette' ? activeGame.state : null;

  const addBet = (type: string, value: string) => {
    if (!currentCharacter || betAmount > currentCharacter.gold) return;

    const currentBets = rouletteState?.selectedBets || [];
    const existingBet = currentBets.find(b => b.type === type && b.value === value);

    const newBets = existingBet
      ? currentBets.map(b =>
          b.type === type && b.value === value
            ? { ...b, amount: b.amount + betAmount }
            : b
        )
      : [...currentBets, { type, value, amount: betAmount }];

    setActiveGame({
      type: 'roulette',
      state: {
        currentBet: betAmount,
        selectedBets: newBets,
        winningBets: rouletteState?.winningBets || [],
      }
    });
  };

  const clearBets = () => {
    setActiveGame({
      type: 'roulette',
      state: { currentBet: betAmount, selectedBets: [], winningBets: [] }
    });
  };

  const spin = useCallback(async () => {
    if (!activeSession || !currentCharacter || isPlaying || !rouletteState) return;

    const totalBet = rouletteState.selectedBets.reduce((sum, b) => sum + b.amount, 0);
    if (totalBet === 0 || totalBet > currentCharacter.gold) return;

    setIsPlaying(true);
    updateCharacter({ gold: currentCharacter.gold - totalBet });
    updateLocalSession(0, totalBet, false);

    // Simulate spin delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const result = Math.floor(Math.random() * 37); // 0-36
    const winningBets: string[] = [];
    let payout = 0;

    rouletteState.selectedBets.forEach((bet) => {
      let won = false;
      let multiplier = 0;

      if (bet.type === 'number' && Number(bet.value) === result) {
        won = true;
        multiplier = 35;
      } else if (bet.type === 'red' && isRed(result)) {
        won = true;
        multiplier = 1;
      } else if (bet.type === 'black' && !isRed(result) && result !== 0) {
        won = true;
        multiplier = 1;
      } else if (bet.type === 'even' && result !== 0 && result % 2 === 0) {
        won = true;
        multiplier = 1;
      } else if (bet.type === 'odd' && result % 2 === 1) {
        won = true;
        multiplier = 1;
      } else if (bet.type === 'low' && result >= 1 && result <= 18) {
        won = true;
        multiplier = 1;
      } else if (bet.type === 'high' && result >= 19 && result <= 36) {
        won = true;
        multiplier = 1;
      }

      if (won) {
        winningBets.push(`${bet.type}-${bet.value}`);
        payout += bet.amount + bet.amount * multiplier;
      }
    });

    setActiveGame({
      type: 'roulette',
      state: { ...rouletteState, result, winningBets, payout }
    });

    updateLocalSession(payout, 0);
    if (payout > 0) {
      updateCharacter({ gold: currentCharacter.gold + payout });
      success('You Won!', `Payout: ${formatDollars(payout)}`);
    }

    setIsPlaying(false);
  }, [activeSession, currentCharacter, isPlaying, rouletteState, setIsPlaying, updateCharacter, updateLocalSession, setActiveGame, success]);

  if (!activeSession || !currentCharacter) {
    return <div className="text-center py-8 text-wood-grain">No active session.</div>;
  }

  if (!rouletteState) {
    setActiveGame({ type: 'roulette', state: { currentBet: betAmount, selectedBets: [], winningBets: [] } });
  }

  const totalBet = rouletteState?.selectedBets.reduce((sum, b) => sum + b.amount, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-western text-wood-dark mb-2">Roulette</h2>
        <p className="text-wood-grain">Place your bets and spin the wheel</p>
      </div>

      <div className="space-y-4">
        {/* Bet Amount Selector */}
        <div className="flex justify-center gap-2">
          {[10, 50, 100, 500].map(amt => (
            <Button
              key={amt}
              variant={betAmount === amt ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setBetAmount(amt)}
            >
              ${amt}
            </Button>
          ))}
        </div>

        {/* Outside Bets */}
        <div className="grid grid-cols-6 gap-2 max-w-lg mx-auto">
          <button onClick={() => addBet('red', 'red')} className="p-2 bg-red-600 text-white rounded font-bold">Red</button>
          <button onClick={() => addBet('black', 'black')} className="p-2 bg-gray-900 text-white rounded font-bold">Black</button>
          <button onClick={() => addBet('odd', 'odd')} className="p-2 bg-wood-grain/30 rounded font-bold">Odd</button>
          <button onClick={() => addBet('even', 'even')} className="p-2 bg-wood-grain/30 rounded font-bold">Even</button>
          <button onClick={() => addBet('low', '1-18')} className="p-2 bg-wood-grain/30 rounded font-bold">1-18</button>
          <button onClick={() => addBet('high', '19-36')} className="p-2 bg-wood-grain/30 rounded font-bold">19-36</button>
        </div>

        {/* Number Grid */}
        <div className="grid grid-cols-12 gap-1 max-w-lg mx-auto">
          <button
            onClick={() => addBet('number', '0')}
            className="col-span-12 p-2 bg-green-600 text-white rounded font-bold"
          >
            0
          </button>
          {Array.from({ length: 36 }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => addBet('number', String(n))}
              className={`p-2 rounded font-bold text-white text-sm
                ${isRed(n) ? 'bg-red-600' : 'bg-gray-900'}
              `}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Current Bets */}
        {rouletteState?.selectedBets && rouletteState.selectedBets.length > 0 && (
          <div className="text-center">
            <p className="text-wood-grain mb-2">Your Bets:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {rouletteState.selectedBets.map((bet, i) => (
                <span key={i} className="px-2 py-1 bg-gold-light/20 rounded text-sm">
                  {bet.type === 'number' ? `#${bet.value}` : bet.value}: {formatDollars(bet.amount)}
                </span>
              ))}
            </div>
            <p className="mt-2 font-bold">Total: {formatDollars(totalBet)}</p>
          </div>
        )}

        {/* Result */}
        {rouletteState?.result !== undefined && (
          <div className="text-center">
            <div className={`inline-block w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white
              ${rouletteState.result === 0 ? 'bg-green-600' : isRed(rouletteState.result) ? 'bg-red-600' : 'bg-gray-900'}
            `}>
              {rouletteState.result}
            </div>
            {rouletteState.payout !== undefined && rouletteState.payout > 0 && (
              <p className="mt-2 text-2xl font-western text-green-500">
                Won: {formatDollars(rouletteState.payout)}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button variant="ghost" onClick={clearBets} disabled={isPlaying}>
            Clear Bets
          </Button>
          <Button
            variant="secondary"
            onClick={spin}
            disabled={totalBet === 0 || isPlaying || totalBet > currentCharacter.gold}
            isLoading={isPlaying}
            loadingText="Spinning..."
          >
            Spin ({formatDollars(totalBet)})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Roulette;
