/**
 * BountyBoard Component
 * Grid display of available bounties
 */

import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { BountyCard } from './BountyCard';
import { bountyService, type BountyListing } from '@/services/bounty.service';

interface BountyBoardProps {
  bounties: BountyListing[];
  totalBounties: number;
  totalRewards: number;
  isLoading?: boolean;
  onRefresh: () => void;
  onClaimBounty?: (bountyId: string) => void;
  currentCharacterId?: string;
}

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard' | 'deadly';
type SortOption = 'reward-high' | 'reward-low' | 'level-high' | 'level-low' | 'expiring';

export function BountyBoard({
  bounties,
  totalBounties,
  totalRewards,
  isLoading,
  onRefresh,
  onClaimBounty,
  currentCharacterId,
}: BountyBoardProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('reward-high');

  // Filter bounties
  let filteredBounties = [...bounties];

  if (difficultyFilter !== 'all') {
    filteredBounties = bountyService.filterByDifficulty(filteredBounties, difficultyFilter);
  }

  if (onlineOnly) {
    filteredBounties = bountyService.filterByOnlineStatus(filteredBounties, true);
  }

  // Sort bounties
  switch (sortBy) {
    case 'reward-high':
      filteredBounties = bountyService.sortByReward(filteredBounties, true);
      break;
    case 'reward-low':
      filteredBounties = bountyService.sortByReward(filteredBounties, false);
      break;
    case 'level-high':
      filteredBounties.sort((a, b) => b.targetLevel - a.targetLevel);
      break;
    case 'level-low':
      filteredBounties.sort((a, b) => a.targetLevel - b.targetLevel);
      break;
    case 'expiring':
      filteredBounties.sort((a, b) =>
        new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
      );
      break;
  }

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <Card className="p-4 bg-gradient-to-r from-amber-900/20 to-transparent">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-gray-400 text-sm">Active Bounties</span>
              <div className="text-2xl font-bold text-amber-400">{totalBounties}</div>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Total Rewards</span>
              <div className="text-2xl font-bold text-green-400">${totalRewards}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Difficulty Filter */}
        <div className="flex gap-1">
          {(['all', 'easy', 'medium', 'hard', 'deadly'] as DifficultyFilter[]).map(diff => (
            <Button
              key={diff}
              variant={difficultyFilter === diff ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setDifficultyFilter(diff)}
            >
              {diff === 'all' ? 'All' : diff.charAt(0).toUpperCase() + diff.slice(1)}
            </Button>
          ))}
        </div>

        {/* Online Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={onlineOnly}
            onChange={(e) => setOnlineOnly(e.target.checked)}
            className="rounded bg-gray-700 border-gray-600"
          />
          <span className="text-sm text-gray-400">Online Only</span>
        </label>

        {/* Sort Select */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-gray-300"
        >
          <option value="reward-high">Reward (High to Low)</option>
          <option value="reward-low">Reward (Low to High)</option>
          <option value="level-high">Level (High to Low)</option>
          <option value="level-low">Level (Low to High)</option>
          <option value="expiring">Expiring Soon</option>
        </select>
      </div>

      {/* Bounty Grid */}
      {filteredBounties.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-4xl mb-2">🎯</div>
          <h3 className="text-lg font-bold text-gray-400">No Bounties Available</h3>
          <p className="text-sm text-gray-500">
            {bounties.length > 0
              ? 'Try adjusting your filters'
              : 'Check back later for new bounties'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBounties.map(bounty => (
            <BountyCard
              key={bounty._id}
              bounty={bounty}
              onClaim={onClaimBounty ? () => onClaimBounty(bounty._id) : undefined}
              isLoading={isLoading}
              currentCharacterId={currentCharacterId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default BountyBoard;
