/**
 * CrimesList Component
 * Filtered view of all CRIME type actions with risk indicators
 * Displays warning banner if wanted level is high
 */

import React, { useState } from 'react';
import { Action, ActionType } from '@desperados/shared';
import { ActionCard } from './ActionCard';
import { Button } from '@/components/ui/Button';

interface CrimeMetadata {
  jailTimeMinutes?: number;
  wantedLevelIncrease?: number;
  witnessChance?: number;
  bailCost?: number;
}

interface CrimesListProps {
  /** All available actions (will be filtered to CRIME) */
  actions: Action[];
  /** Current character energy */
  currentEnergy: number;
  /** Current wanted level (0-5) */
  wantedLevel: number;
  /** Crime metadata for each action */
  crimeMetadata: Record<string, CrimeMetadata>;
  /** Callback when attempting a crime */
  onAttempt: (action: Action) => void;
  /** Whether data is loading */
  isLoading?: boolean;
}

type RiskFilter = 'all' | 'low' | 'medium' | 'high' | 'extreme';
type RewardFilter = 'all' | 'gold' | 'xp' | 'items';
type SortBy = 'risk' | 'reward' | 'jail';

/**
 * Calculate risk level for a crime
 */
const getRiskLevel = (metadata?: CrimeMetadata): 'low' | 'medium' | 'high' | 'extreme' => {
  if (!metadata) return 'low';

  const { witnessChance = 0, jailTimeMinutes = 0 } = metadata;

  if (witnessChance > 80 || jailTimeMinutes > 120) return 'extreme';
  if (witnessChance > 60 || jailTimeMinutes > 60) return 'high';
  if (witnessChance > 30 || jailTimeMinutes > 15) return 'medium';
  return 'low';
};

/**
 * Get sort value for crime based on sort type
 */
const getSortValue = (action: Action, metadata: CrimeMetadata | undefined, sortBy: SortBy): number => {
  switch (sortBy) {
    case 'risk':
      const risk = getRiskLevel(metadata);
      const riskValues = { low: 1, medium: 2, high: 3, extreme: 4 };
      return riskValues[risk];
    case 'reward':
      return (action.rewards.gold || 0) + action.rewards.xp;
    case 'jail':
      return metadata?.jailTimeMinutes || 0;
    default:
      return 0;
  }
};

/**
 * Crimes list with filtering and sorting
 */
export const CrimesList: React.FC<CrimesListProps> = ({
  actions,
  currentEnergy,
  wantedLevel,
  crimeMetadata,
  onAttempt,
  isLoading = false,
}) => {
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [rewardFilter, setRewardFilter] = useState<RewardFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('risk');

  // Filter to CRIME actions only
  const crimeActions = actions.filter((action) => action.type === ActionType.CRIME);

  // Apply filters
  const filteredActions = crimeActions.filter((action) => {
    // Risk filter
    if (riskFilter !== 'all') {
      const risk = getRiskLevel(crimeMetadata[action._id]);
      if (risk !== riskFilter) return false;
    }

    // Reward filter
    if (rewardFilter !== 'all') {
      if (rewardFilter === 'gold' && (!action.rewards.gold || action.rewards.gold === 0)) {
        return false;
      }
      if (rewardFilter === 'xp' && action.rewards.xp === 0) {
        return false;
      }
      if (rewardFilter === 'items' && (!action.rewards.items || action.rewards.items.length === 0)) {
        return false;
      }
    }

    return true;
  });

  // Apply sorting
  const sortedActions = [...filteredActions].sort((a, b) => {
    const aValue = getSortValue(a, crimeMetadata[a._id], sortBy);
    const bValue = getSortValue(b, crimeMetadata[b._id], sortBy);
    return bValue - aValue; // Descending order
  });

  const isHighlyWanted = wantedLevel >= 3;

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      {isHighlyWanted && (
        <div className="parchment p-6 rounded-lg border-4 border-blood-red bg-blood-red/10 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="text-5xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-2xl font-western text-blood-red mb-2">
                YOU ARE WANTED!
              </h3>
              <p className="text-wood-dark text-lg">
                Other players can arrest you for a bounty. Proceed with extreme caution!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="parchment p-4 rounded-lg border-2 border-wood-medium space-y-4">
        {/* Risk Level Filter */}
        <div>
          <h4 className="text-sm text-wood-grain uppercase tracking-wide mb-2">Risk Level:</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={riskFilter === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setRiskFilter('all')}
            >
              All
            </Button>
            <Button
              variant={riskFilter === 'low' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setRiskFilter('low')}
            >
              Low Risk
            </Button>
            <Button
              variant={riskFilter === 'medium' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setRiskFilter('medium')}
            >
              Medium Risk
            </Button>
            <Button
              variant={riskFilter === 'high' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setRiskFilter('high')}
            >
              High Risk
            </Button>
            <Button
              variant={riskFilter === 'extreme' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setRiskFilter('extreme')}
            >
              Extreme Risk
            </Button>
          </div>
        </div>

        {/* Reward Type Filter */}
        <div>
          <h4 className="text-sm text-wood-grain uppercase tracking-wide mb-2">Reward Type:</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={rewardFilter === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setRewardFilter('all')}
            >
              All
            </Button>
            <Button
              variant={rewardFilter === 'gold' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setRewardFilter('gold')}
            >
              Gold
            </Button>
            <Button
              variant={rewardFilter === 'xp' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setRewardFilter('xp')}
            >
              XP
            </Button>
            <Button
              variant={rewardFilter === 'items' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setRewardFilter('items')}
            >
              Items
            </Button>
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <h4 className="text-sm text-wood-grain uppercase tracking-wide mb-2">Sort By:</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={sortBy === 'risk' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('risk')}
            >
              Risk Level
            </Button>
            <Button
              variant={sortBy === 'reward' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('reward')}
            >
              Total Reward
            </Button>
            <Button
              variant={sortBy === 'jail' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSortBy('jail')}
            >
              Jail Time
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="text-wood-medium">Loading crimes...</div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sortedActions.length === 0 && (
        <div className="text-center py-12 parchment p-8 rounded-lg border-2 border-wood-medium">
          <div className="text-4xl mb-4">🏜️</div>
          <p className="text-wood-medium text-lg">
            No crimes match your filters
          </p>
          <p className="text-wood-grain text-sm mt-2">
            Try adjusting your filters
          </p>
        </div>
      )}

      {/* Crime Cards Grid */}
      {!isLoading && sortedActions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedActions.map((action) => (
            <ActionCard
              key={action._id}
              action={action}
              canAfford={Math.floor(currentEnergy) >= action.energyCost}
              currentEnergy={currentEnergy}
              onAttempt={onAttempt}
              crimeMetadata={crimeMetadata[action._id]}
            />
          ))}
        </div>
      )}

      {/* Results Count */}
      {!isLoading && sortedActions.length > 0 && (
        <div className="text-center text-sm text-wood-grain">
          Showing {sortedActions.length} of {crimeActions.length} crimes
        </div>
      )}
    </div>
  );
};

export default CrimesList;
