/**
 * Blackjack Game Page
 * Beat the dealer by getting closer to 21
 */

import React, { useCallback } from 'react';
import { Button } from '@/components/ui';
import { BetControls, PlayingCard } from '@/components/gambling';
import { useGamblingStore } from '@/store/useGamblingStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useToast } from '@/store/useToastStore';
import { formatDollars } from '@/utils/format';
import gamblingService, { type BlackjackState } from '@/services/gambling.service';
import { logger } from '@/services/logger.service';

export const Blackjack: React.FC = () => {
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
  const { success, error: showError } = useToast();

  // Type-safe blackjack state accessor
  const blackjackState: BlackjackState | null =
    activeGame.type === 'blackjack' ? activeGame.state : null;

  const playBlackjack = useCallback(async (action: 'deal' | 'hit' | 'stand' | 'double') => {
    if (!activeSession || !currentCharacter || isPlaying) return;

    if (action === 'deal' && betAmount > currentCharacter.gold) {
      showError('Insufficient Gold', 'You cannot afford this bet!');
      return;
    }

    setIsPlaying(true);

    try {
      if (action === 'deal') {
        // Deduct bet and start new hand
        updateCharacter({ gold: currentCharacter.gold - betAmount });
        updateLocalSession(0, betAmount, false);
      } else if (action === 'double' && blackjackState) {
        // Double down - double the bet
        updateCharacter({ gold: currentCharacter.gold - betAmount });
        updateLocalSession(0, betAmount, false);
      }

      const result = await gamblingService.playBlackjack(
        activeSession._id,
        action,
        action === 'deal' ? betAmount : undefined
      );

      // Result is the BlackjackState directly
      setActiveGame({ type: 'blackjack', state: result });

      if (result.result) {
        const payout = result.payout || 0;
        updateLocalSession(payout, 0);

        if (payout > 0) {
          updateCharacter({ gold: currentCharacter.gold + payout });
          if (result.result === 'blackjack') {
            success('BLACKJACK!', `Payout: ${formatDollars(payout)}`);
          } else {
            success('You Won!', `Payout: ${formatDollars(payout)}`);
          }
        }
      }
    } catch (err: any) {
      logger.error('Blackjack action failed', err, { context: 'Blackjack.playBlackjack', action });
      showError('Error', err.message || 'Failed to play');
    } finally {
      setIsPlaying(false);
    }
  }, [
    activeSession, currentCharacter, isPlaying, betAmount, blackjackState,
    setIsPlaying, updateCharacter, updateLocalSession, setActiveGame, success, showError
  ]);

  if (!activeSession || !currentCharacter) {
    return (
      <div className="text-center py-8">
        <p className="text-wood-grain">No active session. Start a game from the Games tab.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-western text-wood-dark mb-2">Blackjack</h2>
        <p className="text-wood-grain">Get closer to 21 than the dealer without going over</p>
      </div>

      {!blackjackState ? (
        // Pre-deal state - bet selection
        <div className="text-center space-y-4">
          <BetControls
            betAmount={betAmount}
            onBetChange={setBetAmount}
            minBet={selectedLocation?.minBet || 10}
            maxBet={Math.min(selectedLocation?.maxBet || 10000, currentCharacter.gold)}
            disabled={isPlaying}
          />
          <Button
            variant="secondary"
            onClick={() => playBlackjack('deal')}
            disabled={betAmount > currentCharacter.gold || isPlaying}
            isLoading={isPlaying}
          >
            Deal Cards ({formatDollars(betAmount)})
          </Button>
        </div>
      ) : (
        // Active game state
        <div className="space-y-6">
          {/* Dealer's Hand */}
          <div className="text-center">
            <h3 className="text-lg text-wood-grain mb-2">Dealer's Hand</h3>
            <div className="flex justify-center gap-2">
              {blackjackState.dealerHand.cards.map((card, i) => (
                <PlayingCard
                  key={i}
                  card={card}
                  hidden={blackjackState.dealerHidden && i === 1}
                />
              ))}
            </div>
            <p className="text-wood-dark mt-2">
              {blackjackState.dealerHidden
                ? `Showing: ${blackjackState.dealerHand.cards[0].numericValue}`
                : `Total: ${blackjackState.dealerHand.total}`}
            </p>
          </div>

          {/* Player's Hand */}
          <div className="text-center">
            <h3 className="text-lg text-wood-grain mb-2">Your Hand</h3>
            <div className="flex justify-center gap-2">
              {blackjackState.playerHand.cards.map((card, i) => (
                <PlayingCard key={i} card={card} />
              ))}
            </div>
            <p className="text-wood-dark mt-2">Total: {blackjackState.playerHand.total}</p>
          </div>

          {/* Result Display */}
          {blackjackState.result && (
            <div className={`text-center text-2xl font-western ${
              blackjackState.result === 'win' || blackjackState.result === 'blackjack'
                ? 'text-green-500'
                : blackjackState.result === 'lose'
                ? 'text-red-500'
                : 'text-yellow-500'
            }`}>
              {blackjackState.result === 'blackjack' && 'BLACKJACK!'}
              {blackjackState.result === 'win' && 'YOU WIN!'}
              {blackjackState.result === 'lose' && 'DEALER WINS'}
              {blackjackState.result === 'push' && 'PUSH'}
              {blackjackState.payout !== undefined && blackjackState.payout > 0 && (
                <p className="text-lg">{formatDollars(blackjackState.payout)}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-3">
            {!blackjackState.result ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => playBlackjack('hit')}
                  disabled={!blackjackState.canHit || isPlaying}
                >
                  Hit
                </Button>
                <Button
                  variant="primary"
                  onClick={() => playBlackjack('stand')}
                  disabled={!blackjackState.canStand || isPlaying}
                >
                  Stand
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => playBlackjack('double')}
                  disabled={!blackjackState.canDouble || isPlaying || betAmount > currentCharacter.gold}
                >
                  Double
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setActiveGame({ type: null })}
              >
                New Hand
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Blackjack;
