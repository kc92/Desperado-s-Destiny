/**
 * DeckGame Component
 * Main wrapper for all deck-based mini-games
 * Handles game state, API calls, and renders appropriate game UI
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@desperados/shared';
import { PokerHoldDraw } from './PokerHoldDraw';
import { PressYourLuck } from './PressYourLuck';
import { BlackjackGame } from './BlackjackGame';
import { DeckbuilderGame } from './DeckbuilderGame';
import { GameResult } from './GameResult';
import { api } from '../../../services/api';
import { dispatchDeckDrawn } from '@/utils/tutorialEvents';
import { logger } from '@/services/logger.service';

export type GameType = 'pokerHoldDraw' | 'pressYourLuck' | 'blackjack' | 'deckbuilder' | 'combatDuel';

export interface GameState {
  gameId: string;
  gameType: GameType;
  status: 'waiting_action' | 'resolved' | 'continue';
  hand: Card[];
  turnNumber: number;
  maxTurns: number;
  timeLimit: number;
  timeRemaining?: number;
  relevantSuit?: string;
  difficulty: number;
  availableActions: string[];
  // Phase 3: Enhanced game state
  characterSuitBonus?: number;
  // Poker-specific
  rerollsUsed?: number;
  rerollsAvailable?: number;
  peeksUsed?: number;
  peeksAvailable?: number;
  peekedCard?: Card | null;
  earlyFinishBonus?: number;
  // Blackjack-specific
  hasDoubledDown?: boolean;
  hasInsurance?: boolean;
  cardCountHint?: string;
  dealerShowsAce?: boolean;
  // Press Your Luck-specific
  safeDrawCost?: number;
  streakCount?: number;
  streakMultiplier?: number;
  potentialDoubleDownReward?: number;
  dangerMeter?: number;
  // Combat Duel-specific
  opponentHP?: number;
  opponentMaxHP?: number;
  opponentName?: string;
  playerHP?: number;
  playerMaxHP?: number;
  attackCards?: number[];
  defenseCards?: number[];
  opponentAttackDamage?: number;
  opponentDefenseReduction?: number;
  lastPlayerDamage?: number;
  lastOpponentDamage?: number;
  combatRound?: number;
  canFlee?: boolean;
  weaponBonus?: number;
  armorBonus?: number;
  // Phase 5: Risk/Reward Systems
  wagerAmount?: number;
  wagerTier?: 'low' | 'medium' | 'high' | 'vip';
  wagerMultiplier?: number;
  currentStreak?: number;
  streakBonus?: number;
  hotHandActive?: boolean;
  hotHandRoundsLeft?: number;
  underdogBonus?: number;
  canBailOut?: boolean;
  bailOutValue?: number;
  partialRewardPercent?: number;
}

export interface ActionResult {
  actionName: string;
  actionType: string;
  success: boolean;
  rewardsGained: {
    xp: number;
    gold: number;
    items: string[];
  };
  energyRemaining: number;
}

export interface DeckGameResult {
  success: boolean;
  handName?: string;
  score: number;
  suitMatches: number;
  suitBonus: {
    multiplier: number;
    specialEffect?: string;
  };
  mitigation?: {
    damageReduction: number;
  };
  // Phase 5: Bonus breakdown
  bonusBreakdown?: string[];
  bailedOut?: boolean;
}

interface DeckGameProps {
  /** Initial game state from API */
  initialState: GameState;
  /** Action info (for PvE games) */
  actionInfo?: {
    name: string;
    type: string;
    difficulty: number;
    energyCost: number;
    rewards: any;
  };
  /** Callback when game completes */
  onComplete: (result: { gameResult: DeckGameResult; actionResult?: ActionResult }) => void;
  /** Callback when game is cancelled/forfeited */
  onForfeit?: () => void;
  /** Game context type */
  context: 'action' | 'duel' | 'tournament' | 'raid' | 'job';
  /** Job ID for job context */
  jobId?: string;
}

/**
 * Main deck game component that routes to specific game type UIs
 */
export const DeckGame: React.FC<DeckGameProps> = ({
  initialState,
  actionInfo,
  onComplete,
  onForfeit,
  context = 'action',
  jobId,
}) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ gameResult: DeckGameResult; actionResult?: ActionResult } | null>(null);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

  // Dispatch tutorial event when deck game initializes with a hand
  useEffect(() => {
    if (initialState.hand && initialState.hand.length > 0) {
      dispatchDeckDrawn();
    }
  }, []);

  // Handle player action submission
  const handleAction = async (action: { type: string; cardIndices?: number[] }) => {
    setIsLoading(true);
    setError(null);

    try {
      let endpoint = '';
      let payload: any = { action };

      // Route to correct API endpoint based on context
      switch (context) {
        case 'action':
          endpoint = '/actions/play';
          payload = { gameId: gameState.gameId, action };
          break;
        case 'job':
          endpoint = `/locations/current/jobs/${jobId}/play`;
          payload = { gameId: gameState.gameId, action };
          break;
        case 'duel':
          endpoint = `/duels/${gameState.gameId}/play`;
          break;
        case 'tournament':
          endpoint = `/tournaments/match/${gameState.gameId}/play`;
          break;
        case 'raid':
          endpoint = `/wars/${gameState.gameId}/raid/play`;
          break;
      }

      const response = await api.post(endpoint, payload);
      const data = response.data.data;

      if (data.status === 'resolved' || data.status === 'completed' || data.status === 'busted' || data.completed === true) {
        // Game complete - show result screen (onComplete called when user dismisses)
        setResult({
          gameResult: data.gameResult,
          actionResult: data.actionResult,
        });
      } else if (data.completed === false && data.gameState) {
        // Job game continues - use gameState from response, merge availableActions if separate
        setGameState({ ...data.gameState, availableActions: data.availableActions || data.gameState.availableActions });
        setSelectedCards([]);  // Clear card selections for next turn
      } else {
        // Game continues - include all Phase 3 and Phase 5 state updates
        setGameState(prev => ({
          ...prev,
          hand: data.hand,
          turnNumber: data.turnNumber || prev.turnNumber,
          status: 'waiting_action',
          availableActions: data.availableActions || [],
          // Phase 3 state updates
          characterSuitBonus: data.characterSuitBonus ?? prev.characterSuitBonus,
          // Poker
          rerollsUsed: data.rerollsUsed ?? prev.rerollsUsed,
          rerollsAvailable: data.rerollsAvailable ?? prev.rerollsAvailable,
          peeksUsed: data.peeksUsed ?? prev.peeksUsed,
          peeksAvailable: data.peeksAvailable ?? prev.peeksAvailable,
          peekedCard: data.peekedCard ?? null,
          earlyFinishBonus: data.earlyFinishBonus ?? prev.earlyFinishBonus,
          // Blackjack
          hasDoubledDown: data.hasDoubledDown ?? prev.hasDoubledDown,
          hasInsurance: data.hasInsurance ?? prev.hasInsurance,
          cardCountHint: data.cardCountHint ?? prev.cardCountHint,
          dealerShowsAce: data.dealerShowsAce ?? prev.dealerShowsAce,
          // Press Your Luck
          safeDrawCost: data.safeDrawCost ?? prev.safeDrawCost,
          streakCount: data.streakCount ?? prev.streakCount,
          streakMultiplier: data.streakMultiplier ?? prev.streakMultiplier,
          potentialDoubleDownReward: data.potentialDoubleDownReward ?? prev.potentialDoubleDownReward,
          dangerMeter: data.dangerMeter ?? prev.dangerMeter,
          // Phase 5: Risk/Reward
          wagerAmount: data.wagerAmount ?? prev.wagerAmount,
          wagerTier: data.wagerTier ?? prev.wagerTier,
          wagerMultiplier: data.wagerMultiplier ?? prev.wagerMultiplier,
          currentStreak: data.currentStreak ?? prev.currentStreak,
          streakBonus: data.streakBonus ?? prev.streakBonus,
          hotHandActive: data.hotHandActive ?? prev.hotHandActive,
          hotHandRoundsLeft: data.hotHandRoundsLeft ?? prev.hotHandRoundsLeft,
          underdogBonus: data.underdogBonus ?? prev.underdogBonus,
          canBailOut: data.canBailOut ?? prev.canBailOut,
          bailOutValue: data.bailOutValue ?? prev.bailOutValue,
          partialRewardPercent: data.partialRewardPercent ?? prev.partialRewardPercent,
        }));
        setSelectedCards([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process action');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle card selection toggle
  const toggleCardSelection = (index: number) => {
    setSelectedCards(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  // Handle forfeit
  const handleForfeit = async () => {
    if (!onForfeit) return;

    try {
      if (context === 'action') {
        await api.post(`/actions/game/${gameState.gameId}/forfeit`);
      }
      onForfeit();
    } catch (err) {
      logger.error('Failed to forfeit', err as Error, { context: 'DeckGame.handleForfeit', gameId: gameState.gameId });
    }
  };

  // Show result screen if game is complete
  if (result) {
    return (
      <GameResult
        gameResult={result.gameResult}
        actionResult={result.actionResult}
        actionInfo={actionInfo}
        gameType={gameState.gameType}
        onDismiss={onComplete ? () => onComplete(result) : undefined}
      />
    );
  }

  // Render appropriate game UI based on type
  const renderGame = () => {
    const commonProps = {
      hand: gameState.hand,
      selectedCards,
      onToggleCard: toggleCardSelection,
      onAction: handleAction,
      isLoading,
      turnNumber: gameState.turnNumber,
      maxTurns: gameState.maxTurns,
      relevantSuit: gameState.relevantSuit,
      difficulty: gameState.difficulty,
      availableActions: gameState.availableActions,
      characterSkillBonus: gameState.characterSuitBonus || 0,
    };

    switch (gameState.gameType) {
      case 'pokerHoldDraw':
        return (
          <PokerHoldDraw
            {...commonProps}
            rerollsUsed={gameState.rerollsUsed}
            rerollsAvailable={gameState.rerollsAvailable}
            peeksUsed={gameState.peeksUsed}
            peeksAvailable={gameState.peeksAvailable}
            peekedCard={gameState.peekedCard}
            earlyFinishBonus={gameState.earlyFinishBonus}
          />
        );
      case 'pressYourLuck':
        return (
          <PressYourLuck
            {...commonProps}
            safeDrawCost={gameState.safeDrawCost}
            streakCount={gameState.streakCount}
            streakMultiplier={gameState.streakMultiplier}
            hasDoubledDown={gameState.hasDoubledDown}
            potentialDoubleDownReward={gameState.potentialDoubleDownReward}
            dangerMeter={gameState.dangerMeter}
          />
        );
      case 'blackjack':
        return (
          <BlackjackGame
            {...commonProps}
            hasDoubledDown={gameState.hasDoubledDown}
            hasInsurance={gameState.hasInsurance}
            cardCountHint={gameState.cardCountHint}
            dealerShowsAce={gameState.dealerShowsAce}
          />
        );
      case 'deckbuilder':
        return <DeckbuilderGame {...commonProps} />;
      case 'combatDuel':
        // Combat Duel uses the deck game system
        // Player selects cards for attack vs defense
        return (
          <div className="space-y-4">
            <div className="text-center text-gold-light font-western text-xl">
              ⚔️ Combat Duel - Round {gameState.combatRound || 1}
            </div>

            {/* Opponent info */}
            <div className="bg-red-900/30 p-3 rounded border border-red-500">
              <div className="flex justify-between items-center">
                <span className="text-red-300 font-bold">{gameState.opponentName || 'Opponent'}</span>
                <span className="text-red-400">
                  HP: {gameState.opponentHP}/{gameState.opponentMaxHP}
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded mt-2">
                <div
                  className="h-full bg-red-500 rounded transition-all"
                  style={{ width: `${((gameState.opponentHP || 0) / (gameState.opponentMaxHP || 1)) * 100}%` }}
                />
              </div>
              <div className="text-xs text-red-300 mt-1">
                Incoming: {gameState.opponentAttackDamage} dmg | Defense: {gameState.opponentDefenseReduction}
              </div>
            </div>

            {/* Card hand with selection */}
            <div className="text-center text-sm text-desert-sand">
              Click cards to assign: Red = Attack, Blue = Defense
            </div>
            <div className="flex justify-center gap-2">
              {commonProps.hand.map((card, index) => {
                const isAttack = gameState.attackCards?.includes(index);
                const isDefense = gameState.defenseCards?.includes(index);
                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (isAttack) {
                        commonProps.onAction({ type: 'select_defense', cardIndices: [index] });
                      } else if (isDefense) {
                        commonProps.onAction({ type: 'select_attack', cardIndices: [...(gameState.attackCards || []), index] });
                      } else {
                        commonProps.onAction({ type: 'select_attack', cardIndices: [...(gameState.attackCards || []), index] });
                      }
                    }}
                    className={`
                      cursor-pointer w-16 h-24 rounded border-2 flex items-center justify-center text-lg font-bold
                      transition-all hover:scale-105
                      ${isAttack ? 'border-red-500 bg-red-900/50 text-red-300' : ''}
                      ${isDefense ? 'border-blue-500 bg-blue-900/50 text-blue-300' : ''}
                      ${!isAttack && !isDefense ? 'border-gray-500 bg-gray-800 text-gray-400' : ''}
                    `}
                  >
                    {card.rank}{card.suit[0].toUpperCase()}
                  </div>
                );
              })}
            </div>

            {/* Player info */}
            <div className="bg-green-900/30 p-3 rounded border border-green-500">
              <div className="flex justify-between items-center">
                <span className="text-green-300 font-bold">You</span>
                <span className="text-green-400">
                  HP: {gameState.playerHP}/{gameState.playerMaxHP}
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded mt-2">
                <div
                  className="h-full bg-green-500 rounded transition-all"
                  style={{ width: `${((gameState.playerHP || 0) / (gameState.playerMaxHP || 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => commonProps.onAction({ type: 'execute_turn' })}
                disabled={commonProps.isLoading}
                className="px-6 py-3 bg-gold-dark hover:bg-gold-light text-wood-dark font-bold rounded transition-all hover:scale-105"
              >
                Execute Turn
              </button>
              {gameState.canFlee && (
                <button
                  onClick={() => commonProps.onAction({ type: 'flee' })}
                  disabled={commonProps.isLoading}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-all"
                >
                  Flee
                </button>
              )}
            </div>
          </div>
        );
      default:
        return <div>Unknown game type: {gameState.gameType}</div>;
    }
  };

  return (
    <div className="bg-wood-dark rounded-lg border-4 border-leather-saddle p-6">
      {/* Header with action info */}
      {actionInfo && (
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-western text-gold-light">{actionInfo.name}</h2>
          <p className="text-desert-sand text-sm">
            Difficulty: {actionInfo.difficulty} | Energy: {actionInfo.energyCost}
          </p>
          {gameState.relevantSuit && (
            <p className="text-sm mt-1">
              <span className="text-gold-light">Relevant Suit: </span>
              <span className={
                gameState.relevantSuit === 'hearts' || gameState.relevantSuit === 'diamonds'
                  ? 'text-red-500'
                  : 'text-white'
              }>
                {gameState.relevantSuit === 'spades' && '♠ Spades'}
                {gameState.relevantSuit === 'hearts' && '♥ Hearts'}
                {gameState.relevantSuit === 'clubs' && '♣ Clubs'}
                {gameState.relevantSuit === 'diamonds' && '♦ Diamonds'}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Phase 5: Risk/Reward Status Bar */}
      {(gameState.wagerAmount || gameState.currentStreak || gameState.hotHandActive || gameState.canBailOut) && (
        <div className="mb-4 p-3 bg-wood-darker rounded border border-wood-light/30">
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            {/* Wager Info */}
            {gameState.wagerAmount && gameState.wagerAmount > 0 && (
              <span className={`px-2 py-1 rounded font-bold ${
                gameState.wagerTier === 'vip' ? 'bg-purple-900/50 text-purple-300' :
                gameState.wagerTier === 'high' ? 'bg-red-900/50 text-red-300' :
                gameState.wagerTier === 'medium' ? 'bg-yellow-900/50 text-yellow-300' :
                'bg-green-900/50 text-green-300'
              }`}>
                💰 Wager: ${gameState.wagerAmount} ({gameState.wagerMultiplier}x)
              </span>
            )}

            {/* Win Streak */}
            {gameState.currentStreak && gameState.currentStreak > 0 && (
              <span className="px-2 py-1 rounded bg-green-900/50 text-green-300">
                🔥 Streak: {gameState.currentStreak} ({gameState.streakBonus?.toFixed(1)}x)
              </span>
            )}

            {/* Loss Streak / Underdog */}
            {gameState.currentStreak && gameState.currentStreak < -2 && (
              <span className="px-2 py-1 rounded bg-blue-900/50 text-blue-300">
                💪 Underdog: +{Math.round((gameState.underdogBonus || 0) * 100)}% success
              </span>
            )}

            {/* Hot Hand */}
            {gameState.hotHandActive && (
              <span className="px-2 py-1 rounded bg-orange-900/50 text-orange-300 animate-pulse">
                🎯 HOT HAND! ({gameState.hotHandRoundsLeft} rounds)
              </span>
            )}

            {/* Bail-Out Option */}
            {gameState.canBailOut && gameState.bailOutValue && gameState.bailOutValue > 0 && (
              <button
                onClick={() => handleAction({ type: 'bail_out' })}
                disabled={isLoading}
                className="px-2 py-1 rounded bg-yellow-700 hover:bg-yellow-600 text-white font-bold transition-colors"
                title={`Cash out now for ${gameState.partialRewardPercent}% of rewards`}
              >
                🏃 Bail Out: ${gameState.bailOutValue} ({gameState.partialRewardPercent}%)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-center">
          {error}
        </div>
      )}

      {/* Game UI */}
      {renderGame()}

      {/* Forfeit button */}
      {onForfeit && (
        <div className="mt-4 text-center">
          <button
            onClick={handleForfeit}
            className="text-sm text-desert-dust hover:text-red-400 transition-colors"
            disabled={isLoading}
          >
            Forfeit Game
          </button>
        </div>
      )}
    </div>
  );
};

export default DeckGame;
