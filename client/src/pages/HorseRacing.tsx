/**
 * Horse Racing Page
 * View races, enter with horses, place bets, and view leaderboards
 */

import React, { useEffect, useState } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import { Card, Button, Modal, EmptyState } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/store/useToastStore';
import { formatDollars, formatTimeAgo } from '@/utils/format';
import api from '@/services/api';
import { logger } from '@/services/logger.service';

// Types
interface Horse {
  _id: string;
  name: string;
  breed: string;
  speed: number;
  stamina: number;
  handling: number;
  level: number;
  experience: number;
  condition: 'excellent' | 'good' | 'fair' | 'tired' | 'exhausted';
  winRate: number;
  totalRaces: number;
  wins: number;
}

interface RaceTrack {
  _id: string;
  name: string;
  length: number;
  terrain: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  description: string;
}

interface RaceEntry {
  characterId: string;
  characterName: string;
  horseId: string;
  horseName: string;
  odds: number;
  position?: number;
  time?: number;
}

interface Race {
  _id: string;
  track: RaceTrack;
  status: 'upcoming' | 'registering' | 'racing' | 'finished' | 'cancelled';
  entryFee: number;
  prizePool: number;
  maxEntries: number;
  entries: RaceEntry[];
  startTime: string;
  results?: RaceEntry[];
  winner?: {
    characterId: string;
    characterName: string;
    horseName: string;
    time: number;
  };
}

interface Bet {
  _id: string;
  raceId: string;
  amount: number;
  targetCharacterId: string;
  targetHorseName: string;
  odds: number;
  status: 'pending' | 'won' | 'lost';
  payout?: number;
  createdAt: string;
}

interface LeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  horseName: string;
  wins: number;
  totalRaces: number;
  winRate: number;
  earnings: number;
}

type TabType = 'races' | 'my-horses' | 'bets' | 'leaderboard';

export const HorseRacing: React.FC = () => {
  const { currentCharacter } = useCharacterStore();
  const { success, error: showError } = useToast();

  // State
  const [activeTab, setActiveTab] = useState<TabType>('races');
  const [races, setRaces] = useState<Race[]>([]);
  const [myHorses, setMyHorses] = useState<Horse[]>([]);
  const [, setTracks] = useState<RaceTrack[]>([]);
  const [myBets, setMyBets] = useState<Bet[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [showEnterModal, setShowEnterModal] = useState(false);
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [betTarget, setBetTarget] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state
  const [raceFilter, setRaceFilter] = useState<'all' | 'upcoming' | 'registering' | 'finished'>('all');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      switch (activeTab) {
        case 'races':
          await Promise.all([loadRaces(), loadTracks()]);
          break;
        case 'my-horses':
          await loadMyHorses();
          break;
        case 'bets':
          await loadMyBets();
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

  const loadRaces = async () => {
    try {
      const response = await api.get('/racing/races');
      setRaces(response.data.data?.races || []);
    } catch (err: any) {
      logger.error('Failed to load races', err as Error, { context: 'HorseRacing.loadRaces' });
      setRaces([]);
    }
  };

  const loadTracks = async () => {
    try {
      const response = await api.get('/racing/tracks');
      setTracks(response.data.data?.tracks || []);
    } catch (err: any) {
      logger.error('Failed to load tracks', err as Error, { context: 'HorseRacing.loadTracks' });
    }
  };

  const loadMyHorses = async () => {
    try {
      const response = await api.get('/racing/my-horses');
      setMyHorses(response.data.data?.horses || []);
    } catch (err: any) {
      logger.error('Failed to load horses', err as Error, { context: 'HorseRacing.loadMyHorses' });
      setMyHorses([]);
    }
  };

  const loadMyBets = async () => {
    try {
      const response = await api.get('/racing/bets');
      setMyBets(response.data.data?.bets || []);
    } catch (err: any) {
      logger.error('Failed to load bets', err as Error, { context: 'HorseRacing.loadMyBets' });
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await api.get('/racing/leaderboard');
      setLeaderboard(response.data.data?.leaderboard || []);
    } catch (err: any) {
      logger.error('Failed to load leaderboard', err as Error, { context: 'HorseRacing.loadLeaderboard' });
      setLeaderboard([]);
    }
  };

  const handleEnterRace = async () => {
    if (!selectedRace || !selectedHorse || !currentCharacter) return;

    setIsSubmitting(true);
    try {
      await api.post(`/racing/races/${selectedRace._id}/enter`, {
        horseId: selectedHorse,
      });
      success('Race Entry', 'Successfully entered the race!');
      setShowEnterModal(false);
      setSelectedRace(null);
      setSelectedHorse(null);
      loadRaces();
    } catch (err: any) {
      showError('Entry Failed', err.response?.data?.message || 'Failed to enter race');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlaceBet = async () => {
    if (!selectedRace || !betTarget || betAmount <= 0 || !currentCharacter) return;

    setIsSubmitting(true);
    try {
      await api.post(`/racing/races/${selectedRace._id}/bet`, {
        targetCharacterId: betTarget,
        amount: betAmount,
      });
      success('Bet Placed', `Successfully bet ${formatDollars(betAmount)}!`);
      setShowBetModal(false);
      setSelectedRace(null);
      setBetTarget(null);
      setBetAmount(100);
      loadMyBets();
    } catch (err: any) {
      showError('Bet Failed', err.response?.data?.message || 'Failed to place bet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRaces = races.filter((race) => {
    if (raceFilter === 'all') return true;
    return race.status === raceFilter;
  });

  const getStatusBadgeColor = (status: Race['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500/20 text-blue-300 border-blue-500';
      case 'registering':
        return 'bg-green-500/20 text-green-300 border-green-500';
      case 'racing':
        return 'bg-gold-light/20 text-gold-light border-gold-light';
      case 'finished':
        return 'bg-gray-500/20 text-gray-300 border-gray-500';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500';
    }
  };

  const getConditionColor = (condition: Horse['condition']) => {
    switch (condition) {
      case 'excellent':
        return 'text-green-400';
      case 'good':
        return 'text-green-300';
      case 'fair':
        return 'text-yellow-400';
      case 'tired':
        return 'text-orange-400';
      case 'exhausted':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getDifficultyColor = (difficulty: RaceTrack['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-orange-400';
      case 'extreme':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (!currentCharacter) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card variant="leather">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-western text-gold-light mb-4">No Character Selected</h2>
            <p className="text-desert-sand">Please select a character to access Horse Racing.</p>
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
              <h1 className="text-3xl font-western text-gold-light">Horse Racing</h1>
              <p className="text-desert-sand font-serif mt-1">
                Race your horses and bet on the fastest steeds in Sangre Territory
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
              { id: 'races', label: 'Races', icon: '🏇' },
              { id: 'my-horses', label: 'My Horses', icon: '🐴' },
              { id: 'bets', label: 'My Bets', icon: '🎲' },
              { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2 rounded font-serif capitalize transition-all
                  ${activeTab === tab.id
                    ? 'bg-gold-light text-wood-dark'
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
      {isLoading && (
        <Card variant="parchment">
          <div className="p-6">
            <CardGridSkeleton count={6} columns={3} />
          </div>
        </Card>
      )}

      {/* Races Tab */}
      {!isLoading && activeTab === 'races' && (
        <Card variant="parchment">
          <div className="p-6">
            {/* Race Filters */}
            <div className="flex gap-2 mb-6">
              {(['all', 'registering', 'upcoming', 'finished'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setRaceFilter(filter)}
                  className={`
                    px-3 py-1 rounded text-sm font-serif capitalize
                    ${raceFilter === filter
                      ? 'bg-desert-sand/20 text-desert-sand border border-desert-sand'
                      : 'text-desert-stone hover:text-desert-sand'
                    }
                  `}
                >
                  {filter === 'all' ? 'All Races' : filter}
                </button>
              ))}
            </div>

            {filteredRaces.length === 0 ? (
              <EmptyState
                icon="🏇"
                title="No Races Available"
                description="Check back later for upcoming races!"
                variant="default"
                size="md"
              />
            ) : (
              <div className="space-y-4">
                {filteredRaces.map((race) => (
                  <div
                    key={race._id}
                    className="bg-wood-grain/10 rounded-lg p-4 border border-wood-grain/30 hover:border-gold-light/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-western text-wood-dark">
                          {race.track.name}
                        </h3>
                        <p className="text-sm text-wood-grain">{race.track.description}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded text-xs font-bold uppercase border ${getStatusBadgeColor(
                          race.status
                        )}`}
                      >
                        {race.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-wood-grain">Entry Fee:</span>
                        <p className="font-bold text-gold-dark">{formatDollars(race.entryFee)}</p>
                      </div>
                      <div>
                        <span className="text-wood-grain">Prize Pool:</span>
                        <p className="font-bold text-gold-dark">{formatDollars(race.prizePool)}</p>
                      </div>
                      <div>
                        <span className="text-wood-grain">Entries:</span>
                        <p className="font-bold">
                          {race.entries.length}/{race.maxEntries}
                        </p>
                      </div>
                      <div>
                        <span className="text-wood-grain">Difficulty:</span>
                        <p className={`font-bold capitalize ${getDifficultyColor(race.track.difficulty)}`}>
                          {race.track.difficulty}
                        </p>
                      </div>
                      <div>
                        <span className="text-wood-grain">Start:</span>
                        <p className="font-bold">{new Date(race.startTime).toLocaleTimeString()}</p>
                      </div>
                    </div>

                    {/* Race Entries Preview */}
                    {race.entries.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-wood-grain mb-2">Entries:</p>
                        <div className="flex flex-wrap gap-2">
                          {race.entries.slice(0, 5).map((entry) => (
                            <span
                              key={entry.characterId}
                              className="px-2 py-1 bg-wood-dark/20 rounded text-xs"
                            >
                              {entry.horseName} ({entry.odds.toFixed(1)}x)
                            </span>
                          ))}
                          {race.entries.length > 5 && (
                            <span className="px-2 py-1 text-xs text-wood-grain">
                              +{race.entries.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Winner Display */}
                    {race.winner && (
                      <div className="mb-4 p-3 bg-gold-light/20 rounded border border-gold-dark">
                        <span className="text-wood-grain">Winner: </span>
                        <span className="font-bold text-gold-dark">
                          {race.winner.horseName} ({race.winner.characterName}) - {race.winner.time.toFixed(2)}s
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {race.status === 'registering' && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedRace(race);
                              setShowEnterModal(true);
                            }}
                            disabled={race.entries.length >= race.maxEntries}
                          >
                            Enter Race
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRace(race);
                              setShowBetModal(true);
                            }}
                            disabled={race.entries.length === 0}
                          >
                            Place Bet
                          </Button>
                        </>
                      )}
                      {race.status === 'upcoming' && (
                        <Button variant="ghost" size="sm" disabled>
                          Starts Soon
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* My Horses Tab */}
      {!isLoading && activeTab === 'my-horses' && (
        <Card variant="parchment">
          <div className="p-6">
            {myHorses.length === 0 ? (
              <EmptyState
                icon="🐴"
                title="No Horses Owned"
                description="Visit the stables to acquire your first horse!"
                variant="default"
                size="md"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myHorses.map((horse) => (
                  <div
                    key={horse._id}
                    className="bg-wood-grain/10 rounded-lg p-4 border border-wood-grain/30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">🐴</span>
                      <div>
                        <h3 className="font-western text-wood-dark">{horse.name}</h3>
                        <p className="text-sm text-wood-grain">{horse.breed}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-wood-grain">Speed:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-wood-dark/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${horse.speed}%` }}
                            />
                          </div>
                          <span className="font-bold w-8">{horse.speed}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-wood-grain">Stamina:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-wood-dark/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${horse.stamina}%` }}
                            />
                          </div>
                          <span className="font-bold w-8">{horse.stamina}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-wood-grain">Handling:</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-wood-dark/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500"
                              style={{ width: `${horse.handling}%` }}
                            />
                          </div>
                          <span className="font-bold w-8">{horse.handling}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm border-t border-wood-grain/30 pt-3">
                      <div>
                        <span className="text-wood-grain">Level:</span>
                        <p className="font-bold">{horse.level}</p>
                      </div>
                      <div>
                        <span className="text-wood-grain">Condition:</span>
                        <p className={`font-bold capitalize ${getConditionColor(horse.condition)}`}>
                          {horse.condition}
                        </p>
                      </div>
                      <div>
                        <span className="text-wood-grain">Win Rate:</span>
                        <p className="font-bold">{(horse.winRate * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <span className="text-wood-grain">Record:</span>
                        <p className="font-bold">
                          {horse.wins}W / {horse.totalRaces - horse.wins}L
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* My Bets Tab */}
      {!isLoading && activeTab === 'bets' && (
        <Card variant="parchment">
          <div className="p-6">
            {myBets.length === 0 ? (
              <EmptyState
                icon="🎲"
                title="No Bets Placed"
                description="Place a bet on an upcoming race to get started!"
                variant="default"
                size="md"
              />
            ) : (
              <div className="space-y-3">
                {myBets.map((bet) => (
                  <div
                    key={bet._id}
                    className={`
                      p-4 rounded-lg border
                      ${bet.status === 'pending'
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : bet.status === 'won'
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                      }
                    `}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-wood-dark">
                          Bet on: {bet.targetHorseName}
                        </p>
                        <p className="text-sm text-wood-grain">
                          {formatTimeAgo(new Date(bet.createdAt))}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gold-dark">{formatDollars(bet.amount)}</p>
                        <p className="text-sm text-wood-grain">Odds: {bet.odds.toFixed(1)}x</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`
                            px-2 py-1 rounded text-xs font-bold uppercase
                            ${bet.status === 'pending'
                              ? 'bg-blue-500/20 text-blue-300'
                              : bet.status === 'won'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-red-500/20 text-red-300'
                            }
                          `}
                        >
                          {bet.status}
                        </span>
                        {bet.payout && (
                          <p className="text-sm text-green-400 mt-1">
                            Won: {formatDollars(bet.payout)}
                          </p>
                        )}
                      </div>
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
                title="No Rankings Yet"
                description="Be the first to top the leaderboard!"
                variant="default"
                size="md"
              />
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.characterId}
                    className={`
                      p-3 rounded transition-all cursor-pointer
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
                        <div>
                          <div className="font-bold text-wood-dark">
                            {entry.characterName}
                          </div>
                          <div className="text-sm text-wood-grain">
                            Horse: {entry.horseName}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-wood-dark">
                          {entry.wins}W / {entry.totalRaces}R ({(entry.winRate * 100).toFixed(1)}%)
                        </div>
                        <div className="text-sm text-gold-dark">
                          Earnings: {formatDollars(entry.earnings)}
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

      {/* Enter Race Modal */}
      <Modal
        isOpen={showEnterModal}
        onClose={() => {
          setShowEnterModal(false);
          setSelectedRace(null);
          setSelectedHorse(null);
        }}
        title="Enter Race"
        size="md"
      >
        {selectedRace && (
          <div className="space-y-4">
            <div className="bg-wood-grain/10 p-4 rounded">
              <h4 className="font-western text-wood-dark">{selectedRace.track.name}</h4>
              <p className="text-sm text-wood-grain">{selectedRace.track.description}</p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <div>
                  <span className="text-wood-grain">Entry Fee:</span>
                  <p className="font-bold text-gold-dark">{formatDollars(selectedRace.entryFee)}</p>
                </div>
                <div>
                  <span className="text-wood-grain">Prize Pool:</span>
                  <p className="font-bold text-gold-dark">{formatDollars(selectedRace.prizePool)}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-serif text-wood-dark mb-2">
                Select Your Horse
              </label>
              {myHorses.length === 0 ? (
                <p className="text-red-500 text-sm">You don't own any horses!</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {myHorses.map((horse) => (
                    <button
                      key={horse._id}
                      onClick={() => setSelectedHorse(horse._id)}
                      className={`
                        w-full p-3 rounded text-left transition-all
                        ${selectedHorse === horse._id
                          ? 'bg-gold-light/30 border-2 border-gold-dark'
                          : 'bg-wood-grain/10 border-2 border-transparent hover:border-gold-light/50'
                        }
                        ${horse.condition === 'exhausted' || horse.condition === 'tired'
                          ? 'opacity-50'
                          : ''
                        }
                      `}
                      disabled={horse.condition === 'exhausted'}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold">{horse.name}</span>
                          <span className="text-sm text-wood-grain ml-2">({horse.breed})</span>
                        </div>
                        <span className={`text-sm capitalize ${getConditionColor(horse.condition)}`}>
                          {horse.condition}
                        </span>
                      </div>
                      <div className="text-xs text-wood-grain mt-1">
                        Speed: {horse.speed} | Stamina: {horse.stamina} | Win Rate: {(horse.winRate * 100).toFixed(1)}%
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {currentCharacter.gold < selectedRace.entryFee && (
              <p className="text-red-500 text-sm">Insufficient dollars for entry fee!</p>
            )}

            <div className="flex gap-3">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => {
                  setShowEnterModal(false);
                  setSelectedRace(null);
                  setSelectedHorse(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={handleEnterRace}
                disabled={
                  !selectedHorse ||
                  currentCharacter.gold < selectedRace.entryFee ||
                  isSubmitting
                }
                isLoading={isSubmitting}
                loadingText="Entering..."
              >
                Enter ({formatDollars(selectedRace.entryFee)})
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Place Bet Modal */}
      <Modal
        isOpen={showBetModal}
        onClose={() => {
          setShowBetModal(false);
          setSelectedRace(null);
          setBetTarget(null);
          setBetAmount(100);
        }}
        title="Place Bet"
        size="md"
      >
        {selectedRace && (
          <div className="space-y-4">
            <div className="bg-wood-grain/10 p-4 rounded">
              <h4 className="font-western text-wood-dark">{selectedRace.track.name}</h4>
              <p className="text-sm text-wood-grain">
                {selectedRace.entries.length} entries
              </p>
            </div>

            <div>
              <label className="block text-sm font-serif text-wood-dark mb-2">
                Select Horse to Bet On
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedRace.entries.map((entry) => (
                  <button
                    key={entry.characterId}
                    onClick={() => setBetTarget(entry.characterId)}
                    className={`
                      w-full p-3 rounded text-left transition-all
                      ${betTarget === entry.characterId
                        ? 'bg-gold-light/30 border-2 border-gold-dark'
                        : 'bg-wood-grain/10 border-2 border-transparent hover:border-gold-light/50'
                      }
                    `}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-bold">{entry.horseName}</span>
                        <span className="text-sm text-wood-grain ml-2">({entry.characterName})</span>
                      </div>
                      <span className="text-gold-dark font-bold">{entry.odds.toFixed(1)}x</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-serif text-wood-dark mb-2">
                Bet Amount
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="flex-1 px-3 py-2 bg-wood-grain/10 border border-wood-grain/30 rounded focus:border-gold-light focus:outline-none"
                  min={1}
                  max={currentCharacter.gold}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBetAmount(Math.floor(currentCharacter.gold / 2))}
                >
                  Half
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBetAmount(currentCharacter.gold)}
                >
                  Max
                </Button>
              </div>
              <p className="text-sm text-wood-grain mt-1">
                Your Dollars: {formatDollars(currentCharacter.gold)}
              </p>
              {betTarget && (
                <p className="text-sm text-gold-dark mt-1">
                  Potential Win: {formatDollars(Math.floor(betAmount * (selectedRace.entries.find(e => e.characterId === betTarget)?.odds || 1)))}
                </p>
              )}
            </div>

            {betAmount > currentCharacter.gold && (
              <p className="text-red-500 text-sm">Insufficient dollars!</p>
            )}

            <div className="flex gap-3">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => {
                  setShowBetModal(false);
                  setSelectedRace(null);
                  setBetTarget(null);
                  setBetAmount(100);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={handlePlaceBet}
                disabled={
                  !betTarget ||
                  betAmount <= 0 ||
                  betAmount > currentCharacter.gold ||
                  isSubmitting
                }
                isLoading={isSubmitting}
                loadingText="Placing Bet..."
              >
                Place Bet ({formatDollars(betAmount)})
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HorseRacing;
