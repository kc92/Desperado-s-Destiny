/**
 * Gambling Page
 * 6 game types: Blackjack, Roulette, Craps, Faro, Three-Card Monte, Wheel of Fortune
 */

import React, { useEffect, useState } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import { Card, Button, Modal, EmptyState } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/store/useToastStore';
import { formatDollars, formatTimeAgo } from '@/utils/format';
import { logger } from '@/services/logger.service';
import gamblingService, {
  type GameType,
  type GamblingLocation,
  type GameSession,
  type BlackjackState,
  type RouletteState,
  type CrapsState,
  type FaroState,
  type ThreeCardMonteState,
  type WheelOfFortuneState,
  type SessionHistory,
  type LeaderboardEntry,
} from '@/services/gambling.service';

type TabType = 'games' | 'session' | 'history' | 'leaderboard';

export const Gambling: React.FC = () => {
  const { currentCharacter, updateCharacter } = useCharacterStore();
  const { success, error: showError, info } = useToast();

  // State
  const [activeTab, setActiveTab] = useState<TabType>('games');
  const [locations, setLocations] = useState<GamblingLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<GamblingLocation | null>(null);
  const [activeSession, setActiveSession] = useState<GameSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Game states
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState(false);

  // Individual game states
  const [blackjackState, setBlackjackState] = useState<BlackjackState | null>(null);
  const [rouletteState, setRouletteState] = useState<RouletteState | null>(null);
  const [crapsState, setCrapsState] = useState<CrapsState | null>(null);
  const [faroState, setFaroState] = useState<FaroState | null>(null);
  const [monteState, setMonteState] = useState<ThreeCardMonteState | null>(null);
  const [wheelState, setWheelState] = useState<WheelOfFortuneState | null>(null);

  // Modal state
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      switch (activeTab) {
        case 'games':
          await loadLocations();
          break;
        case 'history':
          await loadSessionHistory();
          break;
        case 'leaderboard':
          await loadLeaderboard();
          break;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocations = async () => {
    try {
      const locations = await gamblingService.getLocations();
      setLocations(locations);
    } catch (err: unknown) {
      logger.error('Failed to load locations', err as Error, { context: 'Gambling.loadLocations' });
      setLocations([]);
    }
  };

  const loadSessionHistory = async () => {
    try {
      const sessions = await gamblingService.getHistory();
      setSessionHistory(sessions);
    } catch (err: unknown) {
      logger.error('Failed to load history', err as Error, { context: 'Gambling.loadSessionHistory' });
      setSessionHistory([]);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const leaderboard = await gamblingService.getLeaderboard();
      setLeaderboard(leaderboard);
    } catch (err: unknown) {
      logger.error('Failed to load leaderboard', err as Error, { context: 'Gambling.loadLeaderboard' });
      setLeaderboard([]);
    }
  };

  const handleStartSession = async (location: GamblingLocation, game: GameType) => {
    if (!currentCharacter) return;

    setIsSubmitting(true);
    try {
      const result = await gamblingService.startSession({
        locationId: location._id,
        gameType: game,
      });

      setActiveSession(result.session || {
        _id: 'local-session',
        gameType: game,
        locationId: location._id,
        status: 'active',
        currentBet: 0,
        totalWagered: 0,
        totalWon: 0,
        netResult: 0,
        handsPlayed: 0,
        startTime: new Date().toISOString(),
      });
      setSelectedLocation(location);
      setSelectedGame(game);
      setActiveTab('session');
      setShowLocationModal(false);
      info('Game Started', `Welcome to ${getGameName(game)}!`);
    } catch {
      // Start local session for demo
      setActiveSession({
        _id: 'local-session',
        gameType: game,
        locationId: location._id,
        status: 'active',
        currentBet: 0,
        totalWagered: 0,
        totalWon: 0,
        netResult: 0,
        handsPlayed: 0,
        startTime: new Date().toISOString(),
      });
      setSelectedLocation(location);
      setSelectedGame(game);
      setActiveTab('session');
      setShowLocationModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;

    try {
      await gamblingService.endSession(activeSession._id);
    } catch (err) {
      logger.error('Failed to end session', err as Error, { context: 'Gambling.handleEndSession', sessionId: activeSession._id });
    }

    if (activeSession.netResult !== 0) {
      if (activeSession.netResult > 0) {
        success('Session Complete', `You won ${formatDollars(activeSession.netResult)}!`);
      } else {
        info('Session Complete', `You lost ${formatDollars(Math.abs(activeSession.netResult))}`);
      }
    }

    setActiveSession(null);
    setSelectedGame(null);
    setSelectedLocation(null);
    resetGameStates();
    setActiveTab('games');
    loadSessionHistory();
  };

  const resetGameStates = () => {
    setBlackjackState(null);
    setRouletteState(null);
    setCrapsState(null);
    setFaroState(null);
    setMonteState(null);
    setWheelState(null);
    setBetAmount(100);
  };

  // Game Logic Functions
  const playBlackjack = async (action: 'deal' | 'hit' | 'stand' | 'double') => {
    if (!activeSession || !currentCharacter || isPlaying) return;

    if (action === 'deal' && betAmount > currentCharacter.gold) {
      showError('Insufficient Gold', 'You cannot afford this bet!');
      return;
    }

    setIsPlaying(true);

    try {
      const result = await gamblingService.playBlackjack(
        activeSession._id,
        action,
        action === 'deal' ? betAmount : undefined
      );

      setBlackjackState(result);
      updateSessionStats(result);
    } catch {
      // Simulate locally
      simulateBlackjack(action);
    } finally {
      setIsPlaying(false);
    }
  };

  const simulateBlackjack = (action: 'deal' | 'hit' | 'stand' | 'double') => {
    if (action === 'deal') {
      const playerCards = [dealCard(), dealCard()];
      const dealerCards = [dealCard(), dealCard()];
      const playerTotal = calculateHandTotal(playerCards);
      const dealerTotal = calculateHandTotal([dealerCards[0]]);

      const newState: BlackjackState = {
        playerHand: {
          cards: playerCards,
          total: playerTotal,
          isBusted: playerTotal > 21,
          isBlackjack: playerTotal === 21 && playerCards.length === 2,
        },
        dealerHand: {
          cards: dealerCards,
          total: dealerTotal,
          isBusted: false,
          isBlackjack: false,
        },
        dealerHidden: true,
        currentBet: betAmount,
        canHit: playerTotal < 21,
        canStand: true,
        canDouble: playerCards.length === 2 && (currentCharacter?.gold ?? 0) >= betAmount * 2,
        canSplit: playerCards.length === 2 && playerCards[0].value === playerCards[1].value,
      };

      // Check for blackjack
      if (newState.playerHand.isBlackjack) {
        newState.dealerHidden = false;
        newState.dealerHand.total = calculateHandTotal(dealerCards);
        if (calculateHandTotal(dealerCards) === 21) {
          newState.result = 'push';
          newState.payout = betAmount;
        } else {
          newState.result = 'blackjack';
          newState.payout = Math.floor(betAmount * 2.5);
        }
        newState.canHit = false;
        newState.canStand = false;
        newState.canDouble = false;
        updateLocalSession(newState.payout || 0, betAmount);
      } else {
        updateLocalSession(0, betAmount, false);
      }

      setBlackjackState(newState);
      if (currentCharacter) {
        updateCharacter({ gold: currentCharacter.gold - betAmount });
      }
    } else if (action === 'hit' && blackjackState) {
      const newCard = dealCard();
      const newCards = [...blackjackState.playerHand.cards, newCard];
      const newTotal = calculateHandTotal(newCards);

      const newState = {
        ...blackjackState,
        playerHand: {
          ...blackjackState.playerHand,
          cards: newCards,
          total: newTotal,
          isBusted: newTotal > 21,
        },
        canHit: newTotal < 21,
        canDouble: false,
        canSplit: false,
      };

      if (newTotal > 21) {
        newState.result = 'lose';
        newState.payout = 0;
        newState.canHit = false;
        newState.canStand = false;
        updateLocalSession(0, 0);
      }

      setBlackjackState(newState);
    } else if (action === 'stand' && blackjackState) {
      const dealerCards = [...blackjackState.dealerHand.cards];
      let dealerTotal = calculateHandTotal(dealerCards);

      while (dealerTotal < 17) {
        dealerCards.push(dealCard());
        dealerTotal = calculateHandTotal(dealerCards);
      }

      const playerTotal = blackjackState.playerHand.total;
      let result: 'win' | 'lose' | 'push';
      let payout = 0;

      if (dealerTotal > 21 || playerTotal > dealerTotal) {
        result = 'win';
        payout = blackjackState.currentBet * 2;
      } else if (playerTotal < dealerTotal) {
        result = 'lose';
        payout = 0;
      } else {
        result = 'push';
        payout = blackjackState.currentBet;
      }

      const newState = {
        ...blackjackState,
        dealerHand: {
          cards: dealerCards,
          total: dealerTotal,
          isBusted: dealerTotal > 21,
          isBlackjack: dealerTotal === 21 && dealerCards.length === 2,
        },
        dealerHidden: false,
        result,
        payout,
        canHit: false,
        canStand: false,
        canDouble: false,
        canSplit: false,
      };

      setBlackjackState(newState);
      updateLocalSession(payout, 0);
      if (payout > 0 && currentCharacter) {
        updateCharacter({ gold: currentCharacter.gold + payout });
      }
    } else if (action === 'double' && blackjackState) {
      const additionalBet = blackjackState.currentBet;
      if (currentCharacter) {
        updateCharacter({ gold: currentCharacter.gold - additionalBet });
      }

      const newCard = dealCard();
      const newCards = [...blackjackState.playerHand.cards, newCard];
      const playerTotal = calculateHandTotal(newCards);

      let dealerCards = [...blackjackState.dealerHand.cards];
      let dealerTotal = calculateHandTotal(dealerCards);

      while (dealerTotal < 17) {
        dealerCards.push(dealCard());
        dealerTotal = calculateHandTotal(dealerCards);
      }

      let result: 'win' | 'lose' | 'push';
      let payout = 0;
      const totalBet = blackjackState.currentBet * 2;

      if (playerTotal > 21) {
        result = 'lose';
      } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
        result = 'win';
        payout = totalBet * 2;
      } else if (playerTotal < dealerTotal) {
        result = 'lose';
      } else {
        result = 'push';
        payout = totalBet;
      }

      const newState = {
        ...blackjackState,
        playerHand: {
          cards: newCards,
          total: playerTotal,
          isBusted: playerTotal > 21,
          isBlackjack: false,
        },
        dealerHand: {
          cards: dealerCards,
          total: dealerTotal,
          isBusted: dealerTotal > 21,
          isBlackjack: false,
        },
        dealerHidden: false,
        currentBet: totalBet,
        result,
        payout,
        canHit: false,
        canStand: false,
        canDouble: false,
        canSplit: false,
      };

      setBlackjackState(newState);
      updateLocalSession(payout, additionalBet);
      if (payout > 0 && currentCharacter) {
        updateCharacter({ gold: currentCharacter.gold + payout });
      }
    }
  };

  const playRoulette = async () => {
    if (!activeSession || !currentCharacter || isPlaying) return;
    if (!rouletteState?.selectedBets.length) {
      showError('No Bets', 'Place at least one bet!');
      return;
    }

    const totalBet = rouletteState.selectedBets.reduce((sum, b) => sum + b.amount, 0);
    if (totalBet > currentCharacter.gold) {
      showError('Insufficient Gold', 'You cannot afford these bets!');
      return;
    }

    setIsPlaying(true);

    try {
      const result = await gamblingService.playRoulette(
        activeSession._id,
        rouletteState.selectedBets
      );
      setRouletteState((prev) => prev ? { ...prev, ...result } : null);
      updateSessionStats(result);
    } catch {
      // Simulate locally
      simulateRoulette();
    } finally {
      setIsPlaying(false);
    }
  };

  const simulateRoulette = () => {
    if (!rouletteState || !currentCharacter) return;

    const totalBet = rouletteState.selectedBets.reduce((sum, b) => sum + b.amount, 0);
    updateCharacter({ gold: currentCharacter.gold - totalBet });

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

    setRouletteState({
      ...rouletteState,
      result,
      winningBets,
      payout,
    });

    updateLocalSession(payout, totalBet);
    if (payout > 0 && currentCharacter) {
      updateCharacter({ gold: currentCharacter.gold + payout });
      success('You Won!', `Payout: ${formatDollars(payout)}`);
    }
  };

  const playWheelOfFortune = async () => {
    if (!activeSession || !currentCharacter || isPlaying || !wheelState) return;
    if (betAmount > currentCharacter.gold) {
      showError('Insufficient Gold', 'You cannot afford this bet!');
      return;
    }

    setIsPlaying(true);
    setWheelState((prev) => prev ? { ...prev, isSpinning: true } : null);
    updateCharacter({ gold: currentCharacter.gold - betAmount });
    updateLocalSession(0, betAmount, false);

    // Simulate spin delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const segments = [1, 2, 5, 10, 20, 1, 2, 5, 1, 2, 1, 2]; // Weighted wheel
    const spinResult = segments[Math.floor(Math.random() * segments.length)];
    const won = wheelState.selectedSegment === spinResult;
    const payout = won ? betAmount * spinResult : 0;

    setWheelState({
      ...wheelState,
      spinResult,
      isSpinning: false,
      result: won ? 'win' : 'lose',
      payout,
    });

    updateLocalSession(payout, 0);
    if (payout > 0) {
      updateCharacter({ gold: currentCharacter.gold + payout });
      success('You Won!', `Payout: ${formatDollars(payout)}`);
    }

    setIsPlaying(false);
  };

  const playThreeCardMonte = async () => {
    if (!activeSession || !currentCharacter || isPlaying || !monteState || monteState.selectedPosition === null) return;
    if (betAmount > currentCharacter.gold) {
      showError('Insufficient Gold', 'You cannot afford this bet!');
      return;
    }

    setIsPlaying(true);
    updateCharacter({ gold: currentCharacter.gold - betAmount });
    updateLocalSession(0, betAmount, false);

    // Simulate shuffle delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const queenPosition = Math.floor(Math.random() * 3);
    const won = monteState.selectedPosition === queenPosition;
    const payout = won ? betAmount * 2 : 0;

    setMonteState({
      ...monteState,
      queenPosition,
      revealed: true,
      result: won ? 'win' : 'lose',
      payout,
    });

    updateLocalSession(payout, 0);
    if (payout > 0) {
      updateCharacter({ gold: currentCharacter.gold + payout });
      success('You Won!', `The Queen was there! Payout: ${formatDollars(payout)}`);
    }

    setIsPlaying(false);
  };

  const playCraps = async () => {
    if (!activeSession || !currentCharacter || isPlaying || !crapsState) return;
    if (betAmount > currentCharacter.gold) {
      showError('Insufficient Gold', 'You cannot afford this bet!');
      return;
    }

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
      // Come-out roll rules
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
      // Point phase
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

    setCrapsState({
      ...crapsState,
      dice: [die1, die2],
      point: newPoint,
      result,
      payout,
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
  };

  const playFaro = async () => {
    if (!activeSession || !currentCharacter || isPlaying || !faroState || !faroState.selectedCard) return;
    if (betAmount > currentCharacter.gold) {
      showError('Insufficient Gold', 'You cannot afford this bet!');
      return;
    }

    setIsPlaying(true);
    updateCharacter({ gold: currentCharacter.gold - betAmount });
    updateLocalSession(0, betAmount, false);

    // Simulate card draw delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const losingCard = cards[Math.floor(Math.random() * cards.length)];
    const winningCard = cards[Math.floor(Math.random() * cards.length)];

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

    setFaroState({
      ...faroState,
      losingCard,
      winningCard,
      result,
      payout,
    });

    updateLocalSession(payout, 0);
    if (payout > 0) {
      updateCharacter({ gold: currentCharacter.gold + payout });
      if (result === 'win') {
        success('You Won!', `Payout: ${formatDollars(payout)}`);
      }
    }

    setIsPlaying(false);
  };

  const updateLocalSession = (payout: number, wagered: number, isComplete: boolean = true) => {
    setActiveSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        totalWagered: prev.totalWagered + wagered,
        totalWon: prev.totalWon + payout,
        netResult: prev.netResult + (payout - wagered),
        handsPlayed: isComplete ? prev.handsPlayed + 1 : prev.handsPlayed,
      };
    });
  };

  const updateSessionStats = (result: any) => {
    // Update session based on API response
    if (result.session) {
      setActiveSession(result.session);
    }
  };

  const getGameName = (game: GameType) => {
    switch (game) {
      case 'blackjack': return 'Blackjack';
      case 'roulette': return 'Roulette';
      case 'craps': return 'Craps';
      case 'faro': return 'Faro';
      case 'three_card_monte': return 'Three-Card Monte';
      case 'wheel_of_fortune': return 'Wheel of Fortune';
    }
  };

  const getGameIcon = (game: GameType) => {
    switch (game) {
      case 'blackjack': return '🃏';
      case 'roulette': return '🎰';
      case 'craps': return '🎲';
      case 'faro': return '♠️';
      case 'three_card_monte': return '🎴';
      case 'wheel_of_fortune': return '🎡';
    }
  };

  const getGameDescription = (game: GameType) => {
    switch (game) {
      case 'blackjack': return 'Beat the dealer by getting closer to 21';
      case 'roulette': return 'Bet on where the ball lands';
      case 'craps': return 'Roll the dice and beat the house';
      case 'faro': return 'Bet on cards to win or lose';
      case 'three_card_monte': return 'Find the Queen among three cards';
      case 'wheel_of_fortune': return 'Spin the wheel for big prizes';
    }
  };

  if (!currentCharacter) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card variant="leather">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-western text-gold-light mb-4">No Character Selected</h2>
            <p className="text-desert-sand">Please select a character to access Gambling.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card variant="leather">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-western text-gold-light">Gambling Den</h1>
              <p className="text-desert-sand font-serif mt-1">
                Try your luck at games of chance in Sangre Territory
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-desert-stone">Your Dollars</p>
              <p className="text-2xl font-western text-gold-light">
                {formatDollars(currentCharacter.gold)}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {([
              { id: 'games', label: 'Games', icon: '🎰', disabled: false },
              { id: 'session', label: 'Active Game', icon: '🃏', disabled: !activeSession },
              { id: 'history', label: 'History', icon: '📜', disabled: false },
              { id: 'leaderboard', label: 'High Rollers', icon: '🏆', disabled: false },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`
                  px-4 py-2 rounded font-serif capitalize transition-all
                  ${activeTab === tab.id
                    ? 'bg-gold-light text-wood-dark'
                    : tab.disabled
                    ? 'bg-wood-dark/30 text-desert-stone cursor-not-allowed'
                    : 'bg-wood-dark/50 text-desert-sand hover:bg-wood-dark/70'
                  }
                `}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Session Stats Bar */}
      {activeSession && (
        <Card variant="wood">
          <div className="p-4 flex justify-between items-center">
            <div className="flex gap-6">
              <div>
                <span className="text-xs text-desert-stone">Game</span>
                <p className="font-bold text-desert-sand">{getGameName(activeSession.gameType)}</p>
              </div>
              <div>
                <span className="text-xs text-desert-stone">Hands</span>
                <p className="font-bold text-desert-sand">{activeSession.handsPlayed}</p>
              </div>
              <div>
                <span className="text-xs text-desert-stone">Wagered</span>
                <p className="font-bold text-desert-sand">{formatDollars(activeSession.totalWagered)}</p>
              </div>
              <div>
                <span className="text-xs text-desert-stone">Won</span>
                <p className="font-bold text-green-400">{formatDollars(activeSession.totalWon)}</p>
              </div>
              <div>
                <span className="text-xs text-desert-stone">Net</span>
                <p className={`font-bold ${activeSession.netResult >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {activeSession.netResult >= 0 ? '+' : ''}{formatDollars(activeSession.netResult)}
                </p>
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={handleEndSession}>
              Cash Out
            </Button>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-blood-red/20 border-2 border-blood-red rounded-lg p-4">
          <p className="text-blood-red">{error}</p>
          <Button variant="ghost" size="sm" onClick={() => setError(null)} className="mt-2">
            Dismiss
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && activeTab !== 'session' && (
        <Card variant="parchment">
          <div className="p-6">
            <CardGridSkeleton count={6} columns={3} />
          </div>
        </Card>
      )}

      {/* Games Tab - Game Selection */}
      {!isLoading && activeTab === 'games' && (
        <Card variant="parchment">
          <div className="p-6">
            <h2 className="text-xl font-western text-wood-dark mb-4">Choose a Game</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(['blackjack', 'roulette', 'craps', 'faro', 'three_card_monte', 'wheel_of_fortune'] as GameType[]).map((game) => (
                <button
                  key={game}
                  onClick={() => {
                    setSelectedGame(game);
                    setShowLocationModal(true);
                  }}
                  className="bg-wood-grain/10 rounded-lg p-6 border-2 border-wood-grain/30 hover:border-gold-light transition-all hover:scale-105 text-left"
                >
                  <div className="text-4xl mb-3">{getGameIcon(game)}</div>
                  <h3 className="font-western text-lg text-wood-dark">{getGameName(game)}</h3>
                  <p className="text-sm text-wood-grain mt-1">{getGameDescription(game)}</p>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Active Session Tab - Game Play Area */}
      {activeTab === 'session' && activeSession && (
        <Card variant="parchment">
          <div className="p-6">
            {/* Blackjack Game */}
            {activeSession.gameType === 'blackjack' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-western text-wood-dark mb-2">Blackjack</h2>
                  <p className="text-wood-grain">Get closer to 21 than the dealer without going over</p>
                </div>

                {!blackjackState ? (
                  <div className="text-center space-y-4">
                    <div>
                      <label className="block text-sm text-wood-grain mb-2">Bet Amount</label>
                      <div className="flex justify-center gap-2">
                        <input
                          type="number"
                          value={betAmount}
                          onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-32 px-3 py-2 bg-wood-grain/10 border border-wood-grain/30 rounded text-center"
                          min={selectedLocation?.minBet || 10}
                          max={Math.min(selectedLocation?.maxBet || 10000, currentCharacter.gold)}
                        />
                      </div>
                      <div className="flex justify-center gap-2 mt-2">
                        {[100, 500, 1000].map((amt) => (
                          <Button
                            key={amt}
                            variant="ghost"
                            size="sm"
                            onClick={() => setBetAmount(Math.min(amt, currentCharacter.gold))}
                          >
                            {formatDollars(amt)}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => playBlackjack('deal')}
                      disabled={betAmount > currentCharacter.gold || isPlaying}
                      isLoading={isPlaying}
                    >
                      Deal Cards
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Dealer's Hand */}
                    <div className="text-center">
                      <h3 className="text-lg text-wood-grain mb-2">Dealer's Hand</h3>
                      <div className="flex justify-center gap-2">
                        {blackjackState.dealerHand.cards.map((card, i) => (
                          <div
                            key={i}
                            className={`w-16 h-24 rounded-lg border-2 flex items-center justify-center text-2xl font-bold
                              ${blackjackState.dealerHidden && i === 1
                                ? 'bg-blue-900 border-blue-700 text-blue-700'
                                : 'bg-white border-gray-300'
                              }
                              ${card.suit === '♥' || card.suit === '♦' ? 'text-red-500' : 'text-black'}
                            `}
                          >
                            {blackjackState.dealerHidden && i === 1 ? '?' : `${card.value}${card.suit}`}
                          </div>
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
                          <div
                            key={i}
                            className={`w-16 h-24 rounded-lg border-2 bg-white border-gray-300 flex items-center justify-center text-2xl font-bold
                              ${card.suit === '♥' || card.suit === '♦' ? 'text-red-500' : 'text-black'}
                            `}
                          >
                            {card.value}{card.suit}
                          </div>
                        ))}
                      </div>
                      <p className="text-wood-dark mt-2">Total: {blackjackState.playerHand.total}</p>
                    </div>

                    {/* Result */}
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

                    {/* Actions */}
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
                            disabled={!blackjackState.canDouble || isPlaying}
                          >
                            Double
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="secondary"
                          onClick={() => setBlackjackState(null)}
                        >
                          New Hand
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Wheel of Fortune Game */}
            {activeSession.gameType === 'wheel_of_fortune' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-western text-wood-dark mb-2">Wheel of Fortune</h2>
                  <p className="text-wood-grain">Pick a number and spin to win!</p>
                </div>

                <div className="text-center space-y-4">
                  {/* Bet Amount */}
                  <div>
                    <label className="block text-sm text-wood-grain mb-2">Bet Amount</label>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-32 px-3 py-2 bg-wood-grain/10 border border-wood-grain/30 rounded text-center"
                      min={10}
                      max={currentCharacter.gold}
                      disabled={wheelState?.isSpinning}
                    />
                  </div>

                  {/* Segment Selection */}
                  <div>
                    <label className="block text-sm text-wood-grain mb-2">Pick a Multiplier</label>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {[1, 2, 5, 10, 20].map((seg) => (
                        <button
                          key={seg}
                          onClick={() => setWheelState((prev) => ({ ...prev!, selectedSegment: seg }))}
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

                  {/* Spin Button */}
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (!wheelState) {
                        setWheelState({
                          currentBet: betAmount,
                          selectedSegment: 1,
                          isSpinning: false,
                        });
                      }
                      playWheelOfFortune();
                    }}
                    disabled={!wheelState?.selectedSegment || wheelState?.isSpinning || betAmount > currentCharacter.gold}
                    isLoading={wheelState?.isSpinning}
                    loadingText="Spinning..."
                  >
                    Spin the Wheel ({formatDollars(betAmount)})
                  </Button>
                </div>
              </div>
            )}

            {/* Three Card Monte */}
            {activeSession.gameType === 'three_card_monte' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-western text-wood-dark mb-2">Three-Card Monte</h2>
                  <p className="text-wood-grain">Find the Queen to double your money!</p>
                </div>

                <div className="text-center space-y-4">
                  {/* Bet Amount */}
                  <div>
                    <label className="block text-sm text-wood-grain mb-2">Bet Amount</label>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-32 px-3 py-2 bg-wood-grain/10 border border-wood-grain/30 rounded text-center"
                      min={10}
                      max={currentCharacter.gold}
                      disabled={isPlaying}
                    />
                  </div>

                  {/* Cards */}
                  <div className="flex justify-center gap-4">
                    {[0, 1, 2].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => {
                          if (!monteState?.revealed) {
                            setMonteState((prev) => ({
                              ...prev!,
                              selectedPosition: pos,
                            }));
                          }
                        }}
                        disabled={isPlaying || monteState?.revealed}
                        className={`w-24 h-36 rounded-lg border-4 transition-all transform
                          ${monteState?.selectedPosition === pos
                            ? 'border-gold-light scale-105'
                            : 'border-wood-grain/50'
                          }
                          ${monteState?.revealed && monteState?.queenPosition === pos
                            ? 'bg-red-500'
                            : 'bg-blue-900'
                          }
                          ${!monteState?.revealed ? 'hover:scale-105 cursor-pointer' : ''}
                        `}
                      >
                        <div className="h-full flex items-center justify-center text-4xl text-white">
                          {monteState?.revealed
                            ? monteState.queenPosition === pos ? '♛' : '?'
                            : '🂠'
                          }
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Result */}
                  {monteState?.revealed && (
                    <div className={`text-2xl font-western ${
                      monteState.result === 'win' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {monteState.result === 'win'
                        ? `You Found the Queen! Won ${formatDollars(monteState.payout || 0)}!`
                        : 'The Queen was hidden elsewhere!'
                      }
                    </div>
                  )}

                  {/* Action Button */}
                  {!monteState?.revealed ? (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (!monteState) {
                          setMonteState({
                            currentBet: betAmount,
                            selectedPosition: null,
                            revealed: false,
                          });
                        } else if (monteState.selectedPosition !== null) {
                          playThreeCardMonte();
                        }
                      }}
                      disabled={
                        (monteState && monteState.selectedPosition === null) ||
                        isPlaying ||
                        betAmount > currentCharacter.gold
                      }
                      isLoading={isPlaying}
                    >
                      {!monteState ? 'Start Game' : 'Reveal Cards'}
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => setMonteState(null)}
                    >
                      Play Again
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Craps */}
            {activeSession.gameType === 'craps' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-western text-wood-dark mb-2">Craps</h2>
                  <p className="text-wood-grain">Roll the dice and try your luck!</p>
                </div>

                <div className="text-center space-y-4">
                  {!crapsState ? (
                    <>
                      {/* Bet Amount */}
                      <div>
                        <label className="block text-sm text-wood-grain mb-2">Bet Amount</label>
                        <input
                          type="number"
                          value={betAmount}
                          onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-32 px-3 py-2 bg-wood-grain/10 border border-wood-grain/30 rounded text-center"
                          min={10}
                          max={currentCharacter.gold}
                        />
                      </div>

                      {/* Bet Type Selection */}
                      <div>
                        <label className="block text-sm text-wood-grain mb-2">Choose Your Bet</label>
                        <div className="flex justify-center gap-4">
                          <Button
                            variant="secondary"
                            onClick={() => setCrapsState({
                              currentBet: betAmount,
                              betType: 'pass',
                              point: null,
                              dice: [0, 0],
                            })}
                          >
                            Pass Line
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => setCrapsState({
                              currentBet: betAmount,
                              betType: 'dont_pass',
                              point: null,
                              dice: [0, 0],
                            })}
                          >
                            Don't Pass
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Game Info */}
                      <div className="bg-wood-grain/10 p-4 rounded-lg">
                        <p className="text-wood-grain">
                          Bet: <span className="font-bold">{crapsState.betType === 'pass' ? 'Pass Line' : "Don't Pass"}</span>
                        </p>
                        {crapsState.point && (
                          <p className="text-gold-dark font-bold text-xl mt-2">
                            Point: {crapsState.point}
                          </p>
                        )}
                      </div>

                      {/* Dice Display */}
                      <div className="flex justify-center gap-4">
                        {crapsState.dice.map((die, i) => (
                          <div
                            key={i}
                            className={`w-20 h-20 bg-white rounded-lg border-4 border-gray-300 flex items-center justify-center text-4xl font-bold
                              ${isPlaying ? 'animate-bounce' : ''}
                            `}
                          >
                            {die > 0 ? ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][die] : '?'}
                          </div>
                        ))}
                      </div>

                      {crapsState.dice[0] > 0 && (
                        <p className="text-xl font-bold text-wood-dark">
                          Total: {crapsState.dice[0] + crapsState.dice[1]}
                        </p>
                      )}

                      {/* Result */}
                      {crapsState.result && crapsState.result !== 'point_set' && (
                        <div className={`text-2xl font-western ${
                          crapsState.result === 'win' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {crapsState.result === 'win'
                            ? `You Won ${formatDollars(crapsState.payout || 0)}!`
                            : 'You Lost!'
                          }
                        </div>
                      )}

                      {/* Roll Button */}
                      {(!crapsState.result || crapsState.result === 'point_set') ? (
                        <Button
                          variant="secondary"
                          onClick={playCraps}
                          disabled={isPlaying}
                          isLoading={isPlaying}
                          loadingText="Rolling..."
                        >
                          Roll Dice
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          onClick={() => setCrapsState(null)}
                        >
                          New Game
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Faro */}
            {activeSession.gameType === 'faro' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-western text-wood-dark mb-2">Faro</h2>
                  <p className="text-wood-grain">Pick a card - if it wins, you win!</p>
                </div>

                <div className="text-center space-y-4">
                  {/* Bet Amount */}
                  <div>
                    <label className="block text-sm text-wood-grain mb-2">Bet Amount</label>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-32 px-3 py-2 bg-wood-grain/10 border border-wood-grain/30 rounded text-center"
                      min={10}
                      max={currentCharacter.gold}
                      disabled={faroState?.winningCard !== undefined}
                    />
                  </div>

                  {/* Card Selection */}
                  <div>
                    <label className="block text-sm text-wood-grain mb-2">Pick Your Card</label>
                    <div className="flex justify-center gap-1 flex-wrap max-w-md mx-auto">
                      {['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].map((card) => (
                        <button
                          key={card}
                          onClick={() => setFaroState((prev) => ({
                            ...prev!,
                            selectedCard: card,
                          }))}
                          disabled={faroState?.winningCard !== undefined}
                          className={`w-10 h-14 rounded border-2 font-bold text-sm transition-all
                            ${faroState?.selectedCard === card
                              ? 'bg-gold-light text-wood-dark border-gold-dark scale-110'
                              : 'bg-white text-black border-gray-300 hover:border-gold-light'
                            }
                            ${faroState?.winningCard === card ? 'ring-2 ring-green-500' : ''}
                            ${faroState?.losingCard === card ? 'ring-2 ring-red-500' : ''}
                          `}
                        >
                          {card}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Result Display */}
                  {faroState?.winningCard && (
                    <div className="bg-wood-grain/10 p-4 rounded-lg">
                      <p className="text-wood-grain">
                        Losing Card: <span className="text-red-500 font-bold">{faroState.losingCard}</span>
                        {' | '}
                        Winning Card: <span className="text-green-500 font-bold">{faroState.winningCard}</span>
                      </p>
                      <div className={`text-2xl font-western mt-2 ${
                        faroState.result === 'win' ? 'text-green-500' :
                        faroState.result === 'push' ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {faroState.result === 'win' && `You Won ${formatDollars(faroState.payout || 0)}!`}
                        {faroState.result === 'push' && 'Push - Bet Returned'}
                        {faroState.result === 'lose' && 'You Lost!'}
                      </div>
                    </div>
                  )}

                  {/* Play Button */}
                  {!faroState?.winningCard ? (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        if (!faroState) {
                          setFaroState({
                            currentBet: betAmount,
                            selectedCard: 'A',
                          });
                        } else {
                          playFaro();
                        }
                      }}
                      disabled={!faroState?.selectedCard || isPlaying || betAmount > currentCharacter.gold}
                      isLoading={isPlaying}
                    >
                      {!faroState ? 'Start Game' : 'Draw Cards'}
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => setFaroState(null)}
                    >
                      Play Again
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Roulette */}
            {activeSession.gameType === 'roulette' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-western text-wood-dark mb-2">Roulette</h2>
                  <p className="text-wood-grain">Place your bets on the wheel!</p>
                </div>

                <div className="space-y-4">
                  {/* Bet Controls */}
                  <div className="flex justify-center gap-4 items-center">
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-24 px-3 py-2 bg-wood-grain/10 border border-wood-grain/30 rounded text-center"
                      min={10}
                      max={currentCharacter.gold}
                      disabled={rouletteState?.result !== undefined}
                    />
                    <span className="text-wood-grain">per bet</span>
                  </div>

                  {/* Quick Bets */}
                  <div className="flex justify-center gap-2 flex-wrap">
                    {[
                      { type: 'red', label: 'Red', color: 'bg-red-600' },
                      { type: 'black', label: 'Black', color: 'bg-gray-800' },
                      { type: 'even', label: 'Even', color: 'bg-green-600' },
                      { type: 'odd', label: 'Odd', color: 'bg-green-600' },
                      { type: 'low', label: '1-18', color: 'bg-blue-600' },
                      { type: 'high', label: '19-36', color: 'bg-blue-600' },
                    ].map((bet) => (
                      <button
                        key={bet.type}
                        onClick={() => {
                          if (!rouletteState) {
                            setRouletteState({
                              currentBet: betAmount,
                              selectedBets: [{ type: bet.type, value: bet.type, amount: betAmount }],
                              winningBets: [],
                            });
                          } else if (!rouletteState.result) {
                            setRouletteState((prev) => ({
                              ...prev!,
                              selectedBets: [...prev!.selectedBets, { type: bet.type, value: bet.type, amount: betAmount }],
                            }));
                          }
                        }}
                        disabled={rouletteState?.result !== undefined}
                        className={`px-4 py-2 ${bet.color} text-white rounded font-bold hover:opacity-80 transition-opacity`}
                      >
                        {bet.label}
                      </button>
                    ))}
                  </div>

                  {/* Current Bets */}
                  {rouletteState?.selectedBets && rouletteState.selectedBets.length > 0 && (
                    <div className="bg-wood-grain/10 p-4 rounded-lg">
                      <p className="text-sm text-wood-grain mb-2">Your Bets:</p>
                      <div className="flex flex-wrap gap-2">
                        {rouletteState.selectedBets.map((bet, i) => (
                          <span key={i} className="px-2 py-1 bg-wood-dark/20 rounded text-sm">
                            {bet.type}: {formatDollars(bet.amount)}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-wood-dark mt-2">
                        Total: {formatDollars(rouletteState.selectedBets.reduce((sum, b) => sum + b.amount, 0))}
                      </p>
                    </div>
                  )}

                  {/* Result */}
                  {rouletteState?.result !== undefined && (
                    <div className="text-center">
                      <div className={`text-6xl w-16 h-16 mx-auto rounded-full flex items-center justify-center font-bold
                        ${isRed(rouletteState.result) ? 'bg-red-600 text-white' :
                          rouletteState.result === 0 ? 'bg-green-600 text-white' : 'bg-gray-800 text-white'}
                      `}>
                        {rouletteState.result}
                      </div>
                      <div className={`text-2xl font-western mt-4 ${
                        rouletteState.payout && rouletteState.payout > 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {rouletteState.payout && rouletteState.payout > 0
                          ? `You Won ${formatDollars(rouletteState.payout)}!`
                          : 'No Winning Bets'
                        }
                      </div>
                    </div>
                  )}

                  {/* Spin Button */}
                  {!rouletteState?.result ? (
                    <div className="flex justify-center gap-4">
                      <Button
                        variant="ghost"
                        onClick={() => setRouletteState(null)}
                        disabled={!rouletteState?.selectedBets.length}
                      >
                        Clear Bets
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={playRoulette}
                        disabled={
                          !rouletteState?.selectedBets.length ||
                          isPlaying ||
                          rouletteState.selectedBets.reduce((sum, b) => sum + b.amount, 0) > currentCharacter.gold
                        }
                        isLoading={isPlaying}
                      >
                        Spin Wheel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <Button
                        variant="secondary"
                        onClick={() => setRouletteState(null)}
                      >
                        New Round
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* History Tab */}
      {!isLoading && activeTab === 'history' && (
        <Card variant="parchment">
          <div className="p-6">
            {sessionHistory.length === 0 ? (
              <EmptyState
                icon="📜"
                title="No Gambling History"
                description="Start playing to build your history!"
                variant="default"
                size="md"
              />
            ) : (
              <div className="space-y-3">
                {sessionHistory.map((session) => (
                  <div
                    key={session._id}
                    className="bg-wood-grain/10 p-4 rounded-lg flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getGameIcon(session.gameType)}</span>
                      <div>
                        <p className="font-bold text-wood-dark">{getGameName(session.gameType)}</p>
                        <p className="text-sm text-wood-grain">
                          {session.locationName} - {session.handsPlayed} hands
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${session.netResult >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {session.netResult >= 0 ? '+' : ''}{formatDollars(session.netResult)}
                      </p>
                      <p className="text-xs text-wood-grain">
                        {formatTimeAgo(new Date(session.endTime))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Leaderboard Tab */}
      {!isLoading && activeTab === 'leaderboard' && (
        <Card variant="parchment">
          <div className="p-6">
            {leaderboard.length === 0 ? (
              <EmptyState
                icon="🏆"
                title="No High Rollers Yet"
                description="Be the first to make the leaderboard!"
                variant="default"
                size="md"
              />
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={`${entry.characterId}-${entry.gameType}`}
                    className={`
                      p-3 rounded transition-all
                      ${entry.rank <= 3 ? 'bg-gold-light/10' : 'bg-wood-grain/5'}
                      hover:bg-wood-grain/10
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-xl font-bold text-wood-dark w-10 text-center">
                          {entry.rank === 1 && '🥇'}
                          {entry.rank === 2 && '🥈'}
                          {entry.rank === 3 && '🥉'}
                          {entry.rank > 3 && entry.rank}
                        </div>
                        <span className="text-2xl">{getGameIcon(entry.gameType)}</span>
                        <div>
                          <div className="font-bold text-wood-dark">{entry.characterName}</div>
                          <div className="text-sm text-wood-grain">
                            {getGameName(entry.gameType)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gold-dark">
                          Biggest Win: {formatDollars(entry.biggestWin)}
                        </div>
                        <div className="text-sm text-wood-grain">
                          Total: {formatDollars(entry.totalWon)} ({(entry.winRate * 100).toFixed(1)}% win rate)
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Location Selection Modal */}
      <Modal
        isOpen={showLocationModal}
        onClose={() => {
          setShowLocationModal(false);
          setSelectedGame(null);
        }}
        title={`Play ${selectedGame ? getGameName(selectedGame) : 'Game'}`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-wood-grain">Select a gambling location:</p>

          <div className="space-y-3">
            {locations.filter((loc) => selectedGame && loc.availableGames.includes(selectedGame)).map((location) => (
              <button
                key={location._id}
                onClick={() => selectedGame && handleStartSession(location, selectedGame)}
                disabled={isSubmitting}
                className="w-full p-4 bg-wood-grain/10 rounded-lg border-2 border-wood-grain/30 hover:border-gold-light text-left transition-all"
              >
                <h4 className="font-western text-wood-dark">{location.name}</h4>
                <p className="text-sm text-wood-grain">{location.description}</p>
                <div className="flex gap-4 mt-2 text-xs text-wood-grain">
                  <span>Min Bet: {formatDollars(location.minBet)}</span>
                  <span>Max Bet: {formatDollars(location.maxBet)}</span>
                </div>
              </button>
            ))}
          </div>

          {locations.filter((loc) => selectedGame && loc.availableGames.includes(selectedGame)).length === 0 && (
            <p className="text-center text-wood-grain py-4">
              No locations available for this game. Using default location.
            </p>
          )}

          <Button
            variant="ghost"
            fullWidth
            onClick={() => {
              setShowLocationModal(false);
              setSelectedGame(null);
            }}
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
};

// Helper functions
function dealCard() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const numericValues: Record<string, number> = {
    'A': 11, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 10, 'Q': 10, 'K': 10
  };

  const suit = suits[Math.floor(Math.random() * suits.length)];
  const value = values[Math.floor(Math.random() * values.length)];

  return { suit, value, numericValue: numericValues[value] };
}

function calculateHandTotal(cards: { numericValue: number; value: string }[]) {
  let total = cards.reduce((sum, card) => sum + card.numericValue, 0);
  let aces = cards.filter((card) => card.value === 'A').length;

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

function isRed(num: number): boolean {
  const reds = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  return reds.includes(num);
}

export default Gambling;
