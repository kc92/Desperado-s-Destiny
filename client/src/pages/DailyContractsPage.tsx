/**
 * Daily Contracts Page
 *
 * Displays daily contracts with streak tracking and leaderboards
 * Part of the Competitor Parity Plan - Phase B
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button, Modal } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ContractCard, StreakTracker, ContractRewards } from '@/components/contracts';
import {
  useDailyContracts,
  Contract,
  ContractType,
  LeaderboardEntry,
  CompletionResult
} from '@/hooks/useDailyContracts';

type ContractFilter = 'all' | ContractType | 'completed';

/**
 * Contract type filter options
 */
const FILTER_OPTIONS: { value: ContractFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'combat', label: 'Combat' },
  { value: 'crime', label: 'Crime' },
  { value: 'social', label: 'Social' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'investigation', label: 'Investigation' },
  { value: 'crafting', label: 'Crafting' },
  { value: 'completed', label: 'Completed' }
];

export const DailyContractsPage: React.FC = () => {
  const {
    contracts,
    streakInfo,
    leaderboard,
    timeUntilReset,
    isLoading,
    error,
    message,
    fetchContracts,
    fetchStreakInfo,
    fetchLeaderboard,
    acceptContract,
    completeContract,
    claimStreakBonus,
    clearMessage
  } = useDailyContracts();

  const [filter, setFilter] = useState<ContractFilter>('all');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [completionResult, setCompletionResult] = useState<CompletionResult | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchContracts();
    fetchStreakInfo();
    fetchLeaderboard(10);
  }, [fetchContracts, fetchStreakInfo, fetchLeaderboard]);

  // Reset timer countdown
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      if (timeUntilReset) {
        const { hours, minutes, seconds } = timeUntilReset;
        setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [timeUntilReset]);

  // Filter contracts
  const filteredContracts = contracts.filter(contract => {
    if (filter === 'all') return true;
    if (filter === 'completed') return contract.status === 'completed';
    return contract.type === filter;
  });

  // Handle accept contract
  const handleAccept = useCallback(async (contractId: string) => {
    setActionLoading(true);
    await acceptContract(contractId);
    setActionLoading(false);
  }, [acceptContract]);

  // Handle complete contract
  const handleComplete = useCallback(async (contractId: string) => {
    setActionLoading(true);
    const result = await completeContract(contractId);
    if (result.success && result.result) {
      setCompletionResult(result.result);
    }
    setActionLoading(false);
  }, [completeContract]);

  // Handle claim streak bonus
  const handleClaimStreakBonus = useCallback(async () => {
    setActionLoading(true);
    await claimStreakBonus();
    setActionLoading(false);
  }, [claimStreakBonus]);

  // Stats summary
  const availableCount = contracts.filter(c => c.status === 'available').length;
  const inProgressCount = contracts.filter(c => c.status === 'in_progress').length;
  const completedCount = contracts.filter(c => c.status === 'completed').length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-western text-gold-light">Daily Contracts</h1>
        <p className="text-desert-stone">Complete missions for rewards and maintain your streak</p>
        {countdown && (
          <p className="text-sm text-desert-sand mt-2">
            Resets in: <span className="text-gold-light font-mono">{countdown}</span>
          </p>
        )}
      </div>

      {/* Message Toast */}
      {message && (
        <div
          className={`mb-6 rounded-lg p-4 text-center transition-all ${
            message.success
              ? 'bg-green-900/50 border border-green-500/50'
              : 'bg-red-900/50 border border-red-500/50'
          }`}
        >
          <p className="text-desert-sand">{message.text}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 mb-6 text-center">
          <p className="text-red-300">{error}</p>
          <Button onClick={() => fetchContracts()} variant="outline" size="sm" className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Streak Tracker */}
        <div className="lg:col-span-1 space-y-4">
          <StreakTracker
            streakInfo={streakInfo}
            onClaimBonus={handleClaimStreakBonus}
            isLoading={actionLoading}
          />

          {/* Stats Card */}
          <Card variant="wood" className="p-4">
            <h3 className="font-western text-lg text-desert-sand mb-3">Today's Progress</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-wood-dark/50 rounded p-2">
                <p className="text-blue-400 text-xl font-bold">{availableCount}</p>
                <p className="text-xs text-desert-stone">Available</p>
              </div>
              <div className="bg-wood-dark/50 rounded p-2">
                <p className="text-yellow-400 text-xl font-bold">{inProgressCount}</p>
                <p className="text-xs text-desert-stone">Active</p>
              </div>
              <div className="bg-wood-dark/50 rounded p-2">
                <p className="text-green-400 text-xl font-bold">{completedCount}</p>
                <p className="text-xs text-desert-stone">Done</p>
              </div>
            </div>
          </Card>

          {/* Leaderboard Preview */}
          <Card variant="wood" className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-western text-lg text-desert-sand">Top Streaks</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLeaderboard(true)}
              >
                View All
              </Button>
            </div>
            {leaderboard.slice(0, 5).map((entry, index) => (
              <div
                key={entry.characterId}
                className="flex justify-between items-center py-2 border-b border-wood-grain/30 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      index === 0
                        ? 'bg-gold-light text-wood-dark'
                        : index === 1
                        ? 'bg-gray-300 text-wood-dark'
                        : index === 2
                        ? 'bg-orange-400 text-wood-dark'
                        : 'bg-wood-grain/30 text-desert-sand'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-desert-sand">{entry.name}</span>
                </div>
                <span className="text-gold-light font-bold">{entry.streak} days</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Right Column - Contracts Grid */}
        <div className="lg:col-span-2">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {FILTER_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  filter === option.value
                    ? 'bg-gold-light text-wood-dark'
                    : 'bg-wood-dark border border-wood-grain text-desert-sand hover:border-gold-light/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div aria-busy="true" aria-live="polite">
              <CardGridSkeleton count={4} columns={2} />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredContracts.length === 0 && (
            <EmptyState
              icon="scroll"
              title={filter === 'all' ? 'No Contracts Available' : `No ${filter} Contracts`}
              description={
                filter === 'all'
                  ? 'Check back tomorrow for new contracts!'
                  : 'Try a different filter or check back later.'
              }
              actionText={filter !== 'all' ? 'Show All' : undefined}
              onAction={filter !== 'all' ? () => setFilter('all') : undefined}
              size="md"
            />
          )}

          {/* Contracts Grid */}
          {!isLoading && filteredContracts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContracts.map(contract => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  onAccept={handleAccept}
                  onComplete={handleComplete}
                  isLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Completion Celebration Modal */}
      {completionResult && (
        <Modal
          isOpen={true}
          onClose={() => setCompletionResult(null)}
          title="Contract Completed!"
        >
          <div className="space-y-4 text-center">
            {/* Success Animation */}
            <div className="text-6xl mb-4">*</div>

            <h3 className="font-western text-xl text-gold-light">
              {completionResult.contract.title}
            </h3>

            {/* Rewards */}
            <div className="bg-wood-dark/50 rounded-lg p-4">
              <h4 className="text-desert-sand font-western mb-3">Rewards Earned</h4>
              <ContractRewards rewards={completionResult.rewards} />
            </div>

            {/* Streak Update */}
            <div className="bg-wood-dark/50 rounded-lg p-4">
              <p className="text-desert-sand">
                Current Streak: <span className="text-gold-light font-bold text-xl">
                  {completionResult.streakUpdate.newStreak} days
                </span>
              </p>
              {completionResult.streakUpdate.bonusClaimed && completionResult.streakUpdate.bonusRewards && (
                <div className="mt-3 pt-3 border-t border-wood-grain/30">
                  <p className="text-purple-400 font-western mb-2">Streak Milestone Bonus!</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="text-xs bg-gold-light/10 text-gold-light px-2 py-1 rounded">
                      +{completionResult.streakUpdate.bonusRewards.gold} Gold
                    </span>
                    <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded">
                      +{completionResult.streakUpdate.bonusRewards.xp} XP
                    </span>
                    {completionResult.streakUpdate.bonusRewards.item && (
                      <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded">
                        {completionResult.streakUpdate.bonusRewards.item}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button onClick={() => setCompletionResult(null)} fullWidth>
              Continue
            </Button>
          </div>
        </Modal>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <Modal
          isOpen={true}
          onClose={() => setShowLeaderboard(false)}
          title="Streak Leaderboard"
        >
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.characterId}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  index < 3
                    ? 'bg-wood-dark/70 border border-gold-light/30'
                    : 'bg-wood-dark/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0
                        ? 'bg-gold-light text-wood-dark'
                        : index === 1
                        ? 'bg-gray-300 text-wood-dark'
                        : index === 2
                        ? 'bg-orange-400 text-wood-dark'
                        : 'bg-wood-grain/30 text-desert-sand'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-desert-sand font-serif">{entry.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-gold-light font-bold text-lg">{entry.streak}</span>
                  <span className="text-desert-stone text-sm ml-1">days</span>
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <p className="text-center text-desert-stone py-4">
                No streak data available yet.
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DailyContractsPage;
