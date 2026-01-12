/**
 * Gambling Hub Page
 * Main orchestration page for the gambling system
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Modal } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { GameCard, SessionStats, getGameName } from '@/components/gambling';
import { useGamblingStore } from '@/store/useGamblingStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useToast } from '@/store/useToastStore';
import { formatDollars } from '@/utils/format';
import type { GameType } from '@/services/gambling.service';

type TabType = 'games' | 'session' | 'history' | 'leaderboard';

export const GamblingHub: React.FC = () => {
  const navigate = useNavigate();
  const { currentCharacter } = useCharacterStore();
  const { info, success } = useToast();
  const {
    activeSession,
    locations,
    selectedLocation,
    isLoading,
    isSubmitting,
    error,
    loadLocations,
    startSession,
    endSession,
    setSelectedLocation,
    clearError,
  } = useGamblingStore();

  const [activeTab, setActiveTab] = useState<TabType>('games');
  const [selectedGame, setSelectedGame] = useState<GameType | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  useEffect(() => {
    // Switch to session tab when session starts
    if (activeSession) {
      setActiveTab('session');
    }
  }, [activeSession]);

  const handleSelectGame = (game: GameType) => {
    setSelectedGame(game);
    setShowLocationModal(true);
  };

  const handleStartSession = async (location: typeof locations[0]) => {
    if (!selectedGame) return;

    try {
      await startSession(location, selectedGame);
      setShowLocationModal(false);
      setSelectedLocation(location);
      info('Game Started', `Welcome to ${getGameName(selectedGame)}!`);

      // Navigate to the specific game page
      const gameRoutes: Record<GameType, string> = {
        blackjack: '/game/gambling/blackjack',
        roulette: '/game/gambling/roulette',
        craps: '/game/gambling/craps',
        faro: '/game/gambling/faro',
        three_card_monte: '/game/gambling/three-card-monte',
        wheel_of_fortune: '/game/gambling/wheel-of-fortune',
      };
      navigate(gameRoutes[selectedGame]);
    } catch (err) {
      // Error handled in store
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;

    const netResult = activeSession.netResult;
    await endSession();

    if (netResult !== 0) {
      if (netResult > 0) {
        success('Session Complete', `You won ${formatDollars(netResult)}!`);
      } else {
        info('Session Complete', `You lost ${formatDollars(Math.abs(netResult))}`);
      }
    }

    setActiveTab('games');
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'history') {
      navigate('/game/gambling/history');
    } else if (tab === 'leaderboard') {
      navigate('/game/gambling/leaderboard');
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

  const games: GameType[] = ['blackjack', 'roulette', 'craps', 'faro', 'three_card_monte', 'wheel_of_fortune'];

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
                onClick={() => !tab.disabled && handleTabChange(tab.id)}
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
        <SessionStats
          session={activeSession}
          gameName={getGameName(activeSession.gameType)}
          onCashOut={handleEndSession}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-blood-red/20 border-2 border-blood-red rounded-lg p-4">
          <p className="text-blood-red">{error}</p>
          <Button variant="ghost" size="sm" onClick={clearError} className="mt-2">
            Dismiss
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
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
              {games.map((game) => (
                <GameCard
                  key={game}
                  game={game}
                  onClick={() => handleSelectGame(game)}
                  disabled={isSubmitting}
                />
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Session Tab - Active Game Info */}
      {activeTab === 'session' && activeSession && (
        <Card variant="parchment">
          <div className="p-6 text-center space-y-4">
            <h2 className="text-xl font-western text-wood-dark">
              Playing {getGameName(activeSession.gameType)}
            </h2>
            {selectedLocation && (
              <p className="text-wood-grain">at {selectedLocation.name}</p>
            )}

            <div className="flex justify-center gap-4">
              <Button
                variant="secondary"
                onClick={() => {
                  const gameRoutes: Record<GameType, string> = {
                    blackjack: '/game/gambling/blackjack',
                    roulette: '/game/gambling/roulette',
                    craps: '/game/gambling/craps',
                    faro: '/game/gambling/faro',
                    three_card_monte: '/game/gambling/three-card-monte',
                    wheel_of_fortune: '/game/gambling/wheel-of-fortune',
                  };
                  navigate(gameRoutes[activeSession.gameType]);
                }}
              >
                Return to Game
              </Button>
              <Button variant="danger" onClick={handleEndSession}>
                Cash Out
              </Button>
            </div>
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
            {locations
              .filter((loc) => selectedGame && loc.availableGames.includes(selectedGame))
              .map((location) => (
                <button
                  key={location._id}
                  onClick={() => handleStartSession(location)}
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
            <div className="space-y-3">
              <p className="text-center text-wood-grain py-4">
                No specific locations available. Using default settings.
              </p>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  if (selectedGame) {
                    const defaultLocation = {
                      _id: 'default',
                      name: 'Frontier Saloon',
                      description: 'A dusty saloon with games of chance',
                      availableGames: games,
                      minBet: 10,
                      maxBet: 10000,
                    };
                    handleStartSession(defaultLocation as any);
                  }
                }}
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Play at Default Location
              </Button>
            </div>
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

export default GamblingHub;
