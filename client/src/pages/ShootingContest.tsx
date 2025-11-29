/**
 * Shooting Contest Page
 * View contests, register, participate in shooting rounds, and view leaderboards
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import { Card, Button, Modal, EmptyState, LoadingSpinner } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/store/useToastStore';
import { formatGold, formatTimeAgo } from '@/utils/format';
import api from '@/services/api';

// Types
interface Target {
  id: string;
  type: 'stationary' | 'moving' | 'popup' | 'bonus';
  difficulty: number;
  points: number;
  distance: number;
  isHit: boolean;
  hitTime?: number;
}

interface ShootingRound {
  roundNumber: number;
  targets: Target[];
  score: number;
  accuracy: number;
  timeRemaining: number;
}

interface Participant {
  characterId: string;
  characterName: string;
  totalScore: number;
  accuracy: number;
  roundsCompleted: number;
  rank?: number;
}

interface Contest {
  _id: string;
  name: string;
  description: string;
  type: 'quick_draw' | 'precision' | 'rapid_fire' | 'mixed';
  status: 'upcoming' | 'registering' | 'active' | 'completed';
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  participants: Participant[];
  totalRounds: number;
  currentRound: number;
  startTime: string;
  endTime?: string;
  winner?: {
    characterId: string;
    characterName: string;
    score: number;
  };
}

interface PlayerStats {
  totalContests: number;
  wins: number;
  avgAccuracy: number;
  bestScore: number;
  totalEarnings: number;
}

interface LeaderboardEntry {
  rank: number;
  characterId: string;
  characterName: string;
  wins: number;
  totalContests: number;
  avgAccuracy: number;
  bestScore: number;
  earnings: number;
}

interface ActiveShootingState {
  contestId: string;
  currentRound: ShootingRound;
  timeRemaining: number;
  isAiming: boolean;
  shotsRemaining: number;
}

type TabType = 'contests' | 'shooting' | 'stats' | 'leaderboard';

export const ShootingContest: React.FC = () => {
  const { currentCharacter } = useCharacterStore();
  const { success, error: showError, info } = useToast();

  // State
  const [activeTab, setActiveTab] = useState<TabType>('contests');
  const [contests, setContests] = useState<Contest[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showContestDetails, setShowContestDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active shooting state
  const [activeSession, setActiveSession] = useState<ActiveShootingState | null>(null);
  const [isShooting, setIsShooting] = useState(false);

  // Filter state
  const [contestFilter, setContestFilter] = useState<'all' | 'registering' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Timer for active shooting
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeSession && activeSession.timeRemaining > 0) {
      timer = setInterval(() => {
        setActiveSession((prev) => {
          if (!prev || prev.timeRemaining <= 0) return prev;
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeSession?.contestId]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      switch (activeTab) {
        case 'contests':
          await loadContests();
          break;
        case 'stats':
          await loadPlayerStats();
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

  const loadContests = async () => {
    try {
      const response = await api.get('/shooting/contests');
      setContests(response.data.data?.contests || []);
    } catch (err: any) {
      console.error('Failed to load contests:', err);
      setContests(getMockContests());
    }
  };

  const loadPlayerStats = async () => {
    try {
      const response = await api.get('/shooting/stats');
      setPlayerStats(response.data.data?.stats || null);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
      setPlayerStats(getMockPlayerStats());
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await api.get('/shooting/leaderboard');
      setLeaderboard(response.data.data?.leaderboard || []);
    } catch (err: any) {
      console.error('Failed to load leaderboard:', err);
      setLeaderboard(getMockLeaderboard());
    }
  };

  const handleRegister = async () => {
    if (!selectedContest || !currentCharacter) return;

    setIsSubmitting(true);
    try {
      await api.post(`/shooting/contests/${selectedContest._id}/register`);
      success('Registration Complete', 'You have entered the shooting contest!');
      setShowRegisterModal(false);
      setSelectedContest(null);
      loadContests();
    } catch (err: any) {
      showError('Registration Failed', err.response?.data?.message || 'Failed to register');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartShooting = async (contest: Contest) => {
    if (!currentCharacter) return;

    try {
      const response = await api.get(`/shooting/contests/${contest._id}`);
      const contestData = response.data.data;

      // Initialize shooting session
      setActiveSession({
        contestId: contest._id,
        currentRound: {
          roundNumber: 1,
          targets: generateTargets(contest.type),
          score: 0,
          accuracy: 0,
          timeRemaining: 60,
        },
        timeRemaining: 60,
        isAiming: false,
        shotsRemaining: 10,
      });
      setActiveTab('shooting');
      info('Contest Started', 'Hit the targets to score points!');
    } catch (err: any) {
      showError('Start Failed', err.response?.data?.message || 'Failed to start shooting');
    }
  };

  const handleShoot = async (targetId: string) => {
    if (!activeSession || isShooting || activeSession.shotsRemaining <= 0) return;

    setIsShooting(true);

    try {
      // Simulate shooting with API call
      const response = await api.post(`/shooting/contests/${activeSession.contestId}/shoot`, {
        targetId,
      });

      const result = response.data.data;

      // Update local state
      setActiveSession((prev) => {
        if (!prev) return prev;

        const updatedTargets = prev.currentRound.targets.map((t) =>
          t.id === targetId ? { ...t, isHit: true, hitTime: Date.now() } : t
        );

        const hits = updatedTargets.filter((t) => t.isHit).length;
        const accuracy = hits / updatedTargets.length;
        const score = updatedTargets.filter((t) => t.isHit).reduce((sum, t) => sum + t.points, 0);

        return {
          ...prev,
          currentRound: {
            ...prev.currentRound,
            targets: updatedTargets,
            score,
            accuracy,
          },
          shotsRemaining: prev.shotsRemaining - 1,
        };
      });

      if (result?.hit) {
        success('Hit!', `+${result.points} points`);
      }
    } catch (err: any) {
      // Simulate hit locally for demo
      setActiveSession((prev) => {
        if (!prev) return prev;

        const target = prev.currentRound.targets.find((t) => t.id === targetId);
        if (!target || target.isHit) return prev;

        const isHit = Math.random() > 0.3; // 70% hit chance for demo

        const updatedTargets = prev.currentRound.targets.map((t) =>
          t.id === targetId ? { ...t, isHit } : t
        );

        const hits = updatedTargets.filter((t) => t.isHit).length;
        const attempts = updatedTargets.filter((t) => t.isHit !== undefined).length || 1;
        const accuracy = hits / attempts;
        const score = updatedTargets.filter((t) => t.isHit).reduce((sum, t) => sum + t.points, 0);

        if (isHit) {
          success('Hit!', `+${target.points} points`);
        }

        return {
          ...prev,
          currentRound: {
            ...prev.currentRound,
            targets: updatedTargets,
            score,
            accuracy,
          },
          shotsRemaining: prev.shotsRemaining - 1,
        };
      });
    } finally {
      setIsShooting(false);
    }
  };

  const handleEndSession = () => {
    if (activeSession) {
      info('Round Complete', `Final Score: ${activeSession.currentRound.score}`);
    }
    setActiveSession(null);
    setActiveTab('contests');
    loadContests();
  };

  const filteredContests = contests.filter((contest) => {
    if (contestFilter === 'all') return true;
    return contest.status === contestFilter;
  });

  const getStatusBadgeColor = (status: Contest['status']) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500/20 text-blue-300 border-blue-500';
      case 'registering':
        return 'bg-green-500/20 text-green-300 border-green-500';
      case 'active':
        return 'bg-gold-light/20 text-gold-light border-gold-light';
      case 'completed':
        return 'bg-gray-500/20 text-gray-300 border-gray-500';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500';
    }
  };

  const getContestTypeIcon = (type: Contest['type']) => {
    switch (type) {
      case 'quick_draw':
        return '🔫';
      case 'precision':
        return '🎯';
      case 'rapid_fire':
        return '💥';
      case 'mixed':
        return '🏆';
      default:
        return '🎯';
    }
  };

  const getTargetColor = (target: Target) => {
    if (target.isHit) return 'bg-green-500';
    if (target.type === 'bonus') return 'bg-gold-light';
    if (target.type === 'moving') return 'bg-blue-500';
    if (target.type === 'popup') return 'bg-purple-500';
    return 'bg-red-500';
  };

  if (!currentCharacter) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Card variant="leather">
          <div className="p-8 text-center">
            <h2 className="text-2xl font-western text-gold-light mb-4">No Character Selected</h2>
            <p className="text-desert-sand">Please select a character to access Shooting Contests.</p>
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
              <h1 className="text-3xl font-western text-gold-light">Shooting Contests</h1>
              <p className="text-desert-sand font-serif mt-1">
                Test your aim and compete for glory in Sangre Territory
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-desert-stone">Your Gold</p>
              <p className="text-2xl font-western text-gold-light">
                {formatGold(currentCharacter.gold)}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            {([
              { id: 'contests', label: 'Contests', icon: '🎯' },
              { id: 'shooting', label: 'Shooting Range', icon: '🔫' },
              { id: 'stats', label: 'My Stats', icon: '📊' },
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
      {isLoading && activeTab !== 'shooting' && (
        <Card variant="parchment">
          <div className="p-6">
            <CardGridSkeleton count={6} columns={3} />
          </div>
        </Card>
      )}

      {/* Contests Tab */}
      {!isLoading && activeTab === 'contests' && (
        <Card variant="parchment">
          <div className="p-6">
            {/* Contest Filters */}
            <div className="flex gap-2 mb-6">
              {(['all', 'registering', 'active', 'completed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setContestFilter(filter)}
                  className={`
                    px-3 py-1 rounded text-sm font-serif capitalize
                    ${contestFilter === filter
                      ? 'bg-desert-sand/20 text-desert-sand border border-desert-sand'
                      : 'text-desert-stone hover:text-desert-sand'
                    }
                  `}
                >
                  {filter === 'all' ? 'All Contests' : filter}
                </button>
              ))}
            </div>

            {filteredContests.length === 0 ? (
              <EmptyState
                icon="🎯"
                title="No Contests Available"
                description="Check back later for upcoming shooting contests!"
                variant="default"
                size="md"
              />
            ) : (
              <div className="space-y-4">
                {filteredContests.map((contest) => {
                  const isParticipant = contest.participants.some(
                    (p) => p.characterId === currentCharacter._id
                  );

                  return (
                    <div
                      key={contest._id}
                      className="bg-wood-grain/10 rounded-lg p-4 border border-wood-grain/30 hover:border-gold-light/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{getContestTypeIcon(contest.type)}</span>
                          <div>
                            <h3 className="text-lg font-western text-wood-dark">
                              {contest.name}
                            </h3>
                            <p className="text-sm text-wood-grain">{contest.description}</p>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded text-xs font-bold uppercase border ${getStatusBadgeColor(
                            contest.status
                          )}`}
                        >
                          {contest.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-wood-grain">Type:</span>
                          <p className="font-bold capitalize">{contest.type.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <span className="text-wood-grain">Entry Fee:</span>
                          <p className="font-bold text-gold-dark">{formatGold(contest.entryFee)}</p>
                        </div>
                        <div>
                          <span className="text-wood-grain">Prize Pool:</span>
                          <p className="font-bold text-gold-dark">{formatGold(contest.prizePool)}</p>
                        </div>
                        <div>
                          <span className="text-wood-grain">Participants:</span>
                          <p className="font-bold">
                            {contest.participants.length}/{contest.maxParticipants}
                          </p>
                        </div>
                        <div>
                          <span className="text-wood-grain">Rounds:</span>
                          <p className="font-bold">{contest.totalRounds}</p>
                        </div>
                      </div>

                      {/* Winner Display */}
                      {contest.winner && (
                        <div className="mb-4 p-3 bg-gold-light/20 rounded border border-gold-dark">
                          <span className="text-wood-grain">Winner: </span>
                          <span className="font-bold text-gold-dark">
                            {contest.winner.characterName} - {contest.winner.score} pts
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        {contest.status === 'registering' && !isParticipant && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedContest(contest);
                              setShowRegisterModal(true);
                            }}
                            disabled={contest.participants.length >= contest.maxParticipants}
                          >
                            Register
                          </Button>
                        )}
                        {contest.status === 'active' && isParticipant && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStartShooting(contest)}
                          >
                            Start Shooting
                          </Button>
                        )}
                        {isParticipant && (
                          <span className="px-3 py-1 text-sm bg-green-500/20 text-green-400 rounded">
                            Registered
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedContest(contest);
                            setShowContestDetails(true);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Shooting Tab - Active Shooting Range */}
      {activeTab === 'shooting' && (
        <Card variant="parchment">
          <div className="p-6">
            {!activeSession ? (
              <EmptyState
                icon="🔫"
                title="No Active Session"
                description="Register for a contest and start shooting to begin!"
                variant="default"
                size="md"
                actionText="View Contests"
                onAction={() => setActiveTab('contests')}
              />
            ) : (
              <div className="space-y-6">
                {/* Session Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-western text-wood-dark">
                      Round {activeSession.currentRound.roundNumber}
                    </h3>
                    <p className="text-sm text-wood-grain">
                      Shots Remaining: {activeSession.shotsRemaining}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gold-dark">
                      {activeSession.currentRound.score} pts
                    </div>
                    <div className="text-sm text-wood-grain">
                      Accuracy: {(activeSession.currentRound.accuracy * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-3xl font-bold ${
                        activeSession.timeRemaining <= 10 ? 'text-red-500 animate-pulse' : 'text-wood-dark'
                      }`}
                    >
                      {activeSession.timeRemaining}s
                    </div>
                    <div className="text-sm text-wood-grain">Time Left</div>
                  </div>
                </div>

                {/* Shooting Range */}
                <div className="relative bg-gradient-to-b from-sky-300 to-sky-500 rounded-lg p-8 min-h-[400px]">
                  {/* Targets */}
                  <div className="grid grid-cols-5 gap-4">
                    {activeSession.currentRound.targets.map((target) => (
                      <button
                        key={target.id}
                        onClick={() => handleShoot(target.id)}
                        disabled={target.isHit || isShooting || activeSession.shotsRemaining <= 0}
                        className={`
                          relative aspect-square rounded-full transition-all transform
                          ${getTargetColor(target)}
                          ${target.isHit ? 'opacity-30 scale-75' : 'hover:scale-110 cursor-crosshair'}
                          ${isShooting ? 'cursor-wait' : ''}
                          shadow-lg border-4 border-white
                        `}
                        title={`${target.points} points - ${target.type}`}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2/3 h-2/3 rounded-full border-4 border-white flex items-center justify-center">
                            <div className="w-1/3 h-1/3 rounded-full bg-white" />
                          </div>
                        </div>
                        {target.isHit && (
                          <div className="absolute inset-0 flex items-center justify-center text-4xl">
                            X
                          </div>
                        )}
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">
                          {target.points}pts
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                  <Button variant="danger" onClick={handleEndSession}>
                    End Session
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Stats Tab */}
      {!isLoading && activeTab === 'stats' && (
        <Card variant="parchment">
          <div className="p-6">
            {!playerStats ? (
              <EmptyState
                icon="📊"
                title="No Stats Available"
                description="Compete in shooting contests to build your stats!"
                variant="default"
                size="md"
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-wood-grain/10 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-gold-dark">{playerStats.totalContests}</div>
                  <div className="text-sm text-wood-grain">Total Contests</div>
                </div>
                <div className="bg-wood-grain/10 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-500">{playerStats.wins}</div>
                  <div className="text-sm text-wood-grain">Wins</div>
                </div>
                <div className="bg-wood-grain/10 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {(playerStats.avgAccuracy * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-wood-grain">Avg Accuracy</div>
                </div>
                <div className="bg-wood-grain/10 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-400">{playerStats.bestScore}</div>
                  <div className="text-sm text-wood-grain">Best Score</div>
                </div>
                <div className="bg-wood-grain/10 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-gold-light">
                    {formatGold(playerStats.totalEarnings)}
                  </div>
                  <div className="text-sm text-wood-grain">Total Earnings</div>
                </div>
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
                description="Be the first to top the shooting leaderboard!"
                variant="default"
                size="md"
              />
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.characterId}
                    className={`
                      p-3 rounded transition-all
                      ${entry.rank <= 3 ? 'bg-gold-light/10' : 'bg-wood-grain/5'}
                      ${entry.characterId === currentCharacter._id ? 'ring-2 ring-gold-light' : ''}
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
                          <div className="font-bold text-wood-dark">{entry.characterName}</div>
                          <div className="text-sm text-wood-grain">
                            {entry.wins}W / {entry.totalContests}C
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-wood-dark">
                          Best: {entry.bestScore} pts
                        </div>
                        <div className="text-sm text-wood-grain">
                          Accuracy: {(entry.avgAccuracy * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gold-dark">
                          {formatGold(entry.earnings)}
                        </div>
                        <div className="text-xs text-wood-grain">earnings</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Register Modal */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => {
          setShowRegisterModal(false);
          setSelectedContest(null);
        }}
        title="Register for Contest"
        size="md"
      >
        {selectedContest && (
          <div className="space-y-4">
            <div className="bg-wood-grain/10 p-4 rounded">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{getContestTypeIcon(selectedContest.type)}</span>
                <div>
                  <h4 className="font-western text-wood-dark">{selectedContest.name}</h4>
                  <p className="text-sm text-wood-grain">{selectedContest.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-wood-grain">Entry Fee:</span>
                  <p className="font-bold text-gold-dark">{formatGold(selectedContest.entryFee)}</p>
                </div>
                <div>
                  <span className="text-wood-grain">Prize Pool:</span>
                  <p className="font-bold text-gold-dark">{formatGold(selectedContest.prizePool)}</p>
                </div>
                <div>
                  <span className="text-wood-grain">Participants:</span>
                  <p className="font-bold">
                    {selectedContest.participants.length}/{selectedContest.maxParticipants}
                  </p>
                </div>
                <div>
                  <span className="text-wood-grain">Rounds:</span>
                  <p className="font-bold">{selectedContest.totalRounds}</p>
                </div>
              </div>
            </div>

            <div className="bg-wood-grain/5 p-3 rounded text-sm">
              <p>
                <span className="text-wood-grain">Your Gold:</span>{' '}
                <span className="font-bold">{formatGold(currentCharacter.gold)}</span>
              </p>
            </div>

            {currentCharacter.gold < selectedContest.entryFee && (
              <p className="text-red-500 text-sm">Insufficient gold for entry fee!</p>
            )}

            <div className="flex gap-3">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => {
                  setShowRegisterModal(false);
                  setSelectedContest(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={handleRegister}
                disabled={currentCharacter.gold < selectedContest.entryFee || isSubmitting}
                isLoading={isSubmitting}
                loadingText="Registering..."
              >
                Register ({formatGold(selectedContest.entryFee)})
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Contest Details Modal */}
      <Modal
        isOpen={showContestDetails}
        onClose={() => {
          setShowContestDetails(false);
          setSelectedContest(null);
        }}
        title="Contest Details"
        size="lg"
      >
        {selectedContest && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{getContestTypeIcon(selectedContest.type)}</span>
              <div>
                <h3 className="text-xl font-western text-wood-dark">{selectedContest.name}</h3>
                <p className="text-wood-grain">{selectedContest.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-wood-grain/10 p-3 rounded">
                <span className="text-wood-grain">Type:</span>
                <p className="font-bold capitalize">{selectedContest.type.replace('_', ' ')}</p>
              </div>
              <div className="bg-wood-grain/10 p-3 rounded">
                <span className="text-wood-grain">Entry Fee:</span>
                <p className="font-bold text-gold-dark">{formatGold(selectedContest.entryFee)}</p>
              </div>
              <div className="bg-wood-grain/10 p-3 rounded">
                <span className="text-wood-grain">Prize Pool:</span>
                <p className="font-bold text-gold-dark">{formatGold(selectedContest.prizePool)}</p>
              </div>
              <div className="bg-wood-grain/10 p-3 rounded">
                <span className="text-wood-grain">Rounds:</span>
                <p className="font-bold">{selectedContest.totalRounds}</p>
              </div>
            </div>

            {/* Participants List */}
            <div>
              <h4 className="font-western text-wood-dark mb-2">
                Participants ({selectedContest.participants.length}/{selectedContest.maxParticipants})
              </h4>
              {selectedContest.participants.length === 0 ? (
                <p className="text-wood-grain text-sm">No participants yet</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedContest.participants
                    .sort((a, b) => b.totalScore - a.totalScore)
                    .map((participant, index) => (
                      <div
                        key={participant.characterId}
                        className="flex justify-between items-center p-2 bg-wood-grain/5 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-wood-grain w-6">#{index + 1}</span>
                          <span className="font-bold text-wood-dark">
                            {participant.characterName}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{participant.totalScore} pts</span>
                          <span className="text-xs text-wood-grain ml-2">
                            ({(participant.accuracy * 100).toFixed(1)}% acc)
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              fullWidth
              onClick={() => {
                setShowContestDetails(false);
                setSelectedContest(null);
              }}
            >
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Helper functions
function generateTargets(type: Contest['type']): Target[] {
  const targets: Target[] = [];
  const count = type === 'rapid_fire' ? 10 : type === 'precision' ? 5 : 8;

  for (let i = 0; i < count; i++) {
    const isBonus = Math.random() < 0.1;
    const isMoving = type === 'mixed' ? Math.random() < 0.3 : type === 'rapid_fire' ? Math.random() < 0.2 : false;

    targets.push({
      id: `target-${i}`,
      type: isBonus ? 'bonus' : isMoving ? 'moving' : 'stationary',
      difficulty: Math.random() * 100,
      points: isBonus ? 50 : isMoving ? 20 : 10,
      distance: 20 + Math.random() * 80,
      isHit: false,
    });
  }

  return targets;
}

// Mock data functions
function getMockContests(): Contest[] {
  return [
    {
      _id: '1',
      name: 'Quick Draw Championship',
      description: 'Test your reflexes in this fast-paced competition',
      type: 'quick_draw',
      status: 'registering',
      entryFee: 500,
      prizePool: 2500,
      maxParticipants: 16,
      participants: [
        { characterId: 'c1', characterName: 'Quick Pete', totalScore: 0, accuracy: 0, roundsCompleted: 0 },
        { characterId: 'c2', characterName: 'Dusty Dan', totalScore: 0, accuracy: 0, roundsCompleted: 0 },
      ],
      totalRounds: 3,
      currentRound: 0,
      startTime: new Date(Date.now() + 3600000).toISOString(),
    },
    {
      _id: '2',
      name: 'Precision Masters',
      description: 'Accuracy is everything in this demanding contest',
      type: 'precision',
      status: 'active',
      entryFee: 1000,
      prizePool: 5000,
      maxParticipants: 8,
      participants: [
        { characterId: 'c1', characterName: 'Quick Pete', totalScore: 450, accuracy: 0.92, roundsCompleted: 2 },
        { characterId: 'c3', characterName: 'Sage Sarah', totalScore: 420, accuracy: 0.88, roundsCompleted: 2 },
      ],
      totalRounds: 5,
      currentRound: 3,
      startTime: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      _id: '3',
      name: 'Rapid Fire Showdown',
      description: 'Speed and volume - hit as many targets as you can!',
      type: 'rapid_fire',
      status: 'completed',
      entryFee: 750,
      prizePool: 3750,
      maxParticipants: 12,
      participants: [
        { characterId: 'c1', characterName: 'Quick Pete', totalScore: 890, accuracy: 0.78, roundsCompleted: 3, rank: 1 },
        { characterId: 'c2', characterName: 'Dusty Dan', totalScore: 820, accuracy: 0.75, roundsCompleted: 3, rank: 2 },
      ],
      totalRounds: 3,
      currentRound: 3,
      startTime: new Date(Date.now() - 7200000).toISOString(),
      endTime: new Date(Date.now() - 3600000).toISOString(),
      winner: {
        characterId: 'c1',
        characterName: 'Quick Pete',
        score: 890,
      },
    },
  ];
}

function getMockPlayerStats(): PlayerStats {
  return {
    totalContests: 15,
    wins: 5,
    avgAccuracy: 0.82,
    bestScore: 950,
    totalEarnings: 12500,
  };
}

function getMockLeaderboard(): LeaderboardEntry[] {
  return [
    {
      rank: 1,
      characterId: 'c1',
      characterName: 'Quick Pete',
      wins: 25,
      totalContests: 40,
      avgAccuracy: 0.92,
      bestScore: 1250,
      earnings: 75000,
    },
    {
      rank: 2,
      characterId: 'c2',
      characterName: 'Sage Sarah',
      wins: 22,
      totalContests: 38,
      avgAccuracy: 0.89,
      bestScore: 1180,
      earnings: 62000,
    },
    {
      rank: 3,
      characterId: 'c3',
      characterName: 'Iron Mike',
      wins: 18,
      totalContests: 35,
      avgAccuracy: 0.85,
      bestScore: 1100,
      earnings: 48000,
    },
    {
      rank: 4,
      characterId: 'c4',
      characterName: 'Dusty Dan',
      wins: 15,
      totalContests: 32,
      avgAccuracy: 0.82,
      bestScore: 980,
      earnings: 35000,
    },
    {
      rank: 5,
      characterId: 'c5',
      characterName: 'Wild Will',
      wins: 12,
      totalContests: 28,
      avgAccuracy: 0.78,
      bestScore: 920,
      earnings: 28000,
    },
  ];
}

export default ShootingContest;
