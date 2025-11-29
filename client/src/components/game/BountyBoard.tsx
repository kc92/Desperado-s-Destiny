/**
 * BountyBoard Component
 * List of wanted players that can be arrested
 * Displays as a wooden board with pinned bounty notices
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

export interface Bounty {
  characterId: string;
  characterName: string;
  wantedLevel: number;
  bountyAmount: number;
  lastSeenLocation: string;
  lastSeenTime: Date;
  recentCrimes: string[];
}

interface BountyBoardProps {
  /** List of available bounties */
  bounties: Bounty[];
  /** Callback when arrest button is clicked */
  onArrest: (bounty: Bounty) => void;
  /** Whether the board is loading */
  isLoading?: boolean;
}

type SortBy = 'bounty' | 'wanted' | 'recent';
type FilterLevel = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Format how long ago a time was
 */
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

/**
 * Bounty board with filtering and sorting
 */
export const BountyBoard: React.FC<BountyBoardProps> = ({
  bounties,
  onArrest,
  isLoading = false,
}) => {
  const [sortBy, setSortBy] = useState<SortBy>('bounty');
  const [filterLevel, setFilterLevel] = useState<FilterLevel>(0);

  // Apply filters
  const filteredBounties = bounties.filter((bounty) => {
    if (filterLevel === 0) return true;
    return bounty.wantedLevel >= filterLevel;
  });

  // Apply sorting
  const sortedBounties = [...filteredBounties].sort((a, b) => {
    switch (sortBy) {
      case 'bounty':
        return b.bountyAmount - a.bountyAmount;
      case 'wanted':
        return b.wantedLevel - a.wantedLevel;
      case 'recent':
        return b.lastSeenTime.getTime() - a.lastSeenTime.getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <div className="text-center parchment p-6 rounded-lg border-4 border-leather-brown bg-gradient-to-br from-wood-light to-wood-medium">
        <h1 className="text-5xl font-western text-blood-red mb-2" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}>
          BOUNTY BOARD
        </h1>
        <p className="text-wood-dark text-lg">
          Hunt outlaws, earn rewards!
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between parchment p-4 rounded-lg border-2 border-wood-medium">
        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-wood-grain uppercase tracking-wide">Sort by:</span>
          <Button
            variant={sortBy === 'bounty' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('bounty')}
          >
            Bounty
          </Button>
          <Button
            variant={sortBy === 'wanted' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('wanted')}
          >
            Wanted Level
          </Button>
          <Button
            variant={sortBy === 'recent' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('recent')}
          >
            Recently Seen
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-wood-grain uppercase tracking-wide">Min Wanted:</span>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(Number(e.target.value) as FilterLevel)}
            className="px-3 py-1 rounded border-2 border-wood-medium bg-parchment text-wood-dark"
          >
            <option value={0}>All</option>
            <option value={1}>1+ Stars</option>
            <option value={2}>2+ Stars</option>
            <option value={3}>3+ Stars</option>
            <option value={4}>4+ Stars</option>
            <option value={5}>5 Stars</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="text-wood-medium">Loading bounties...</div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sortedBounties.length === 0 && (
        <div className="text-center py-12 parchment p-8 rounded-lg border-2 border-wood-medium">
          <div className="text-4xl mb-4">🤠</div>
          <p className="text-wood-medium text-lg">
            {filterLevel > 0
              ? `No bounties at ${filterLevel}+ star level`
              : 'No wanted outlaws at this time'}
          </p>
          <p className="text-wood-grain text-sm mt-2">
            Check back later or lower your filter
          </p>
        </div>
      )}

      {/* Bounty List */}
      {!isLoading && sortedBounties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedBounties.map((bounty) => (
            <div
              key={bounty.characterId}
              className="parchment p-5 rounded-lg border-3 border-leather-brown shadow-wood hover:shadow-gold transition-all duration-300 transform hover:-translate-y-1"
              style={{
                backgroundImage: 'linear-gradient(135deg, #f4e8d0 0%, #e8d7b8 100%)',
              }}
            >
              {/* Wanted Header */}
              <div className="text-center mb-3">
                <div className="text-2xl font-western text-blood-red mb-1">
                  WANTED
                </div>
                <div className="text-xl font-western text-wood-dark">
                  {bounty.characterName}
                </div>
              </div>

              {/* Stars */}
              <div className="flex justify-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className={`text-xl ${
                      index < bounty.wantedLevel ? 'text-blood-red' : 'text-gray-300'
                    }`}
                  >
                    ⭐
                  </span>
                ))}
              </div>

              {/* Bounty Amount */}
              <div className="text-center mb-3 p-3 bg-gold-dark/20 rounded border-2 border-gold-dark">
                <div className="text-xs text-wood-grain uppercase tracking-wide">Reward</div>
                <div className="text-2xl font-western text-gold-dark">
                  {bounty.bountyAmount}g
                </div>
              </div>

              {/* Last Seen */}
              <div className="mb-3 p-2 bg-wood-light/30 rounded border border-wood-medium">
                <div className="text-xs text-wood-grain uppercase tracking-wide mb-1">
                  Last Seen
                </div>
                <div className="text-sm text-wood-dark font-semibold">
                  {bounty.lastSeenLocation}
                </div>
                <div className="text-xs text-wood-grain">
                  {formatTimeAgo(bounty.lastSeenTime)}
                </div>
              </div>

              {/* Recent Crimes */}
              {bounty.recentCrimes.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-wood-grain uppercase tracking-wide mb-1">
                    Known For
                  </div>
                  <div className="text-xs text-wood-dark">
                    {bounty.recentCrimes.slice(0, 2).join(', ')}
                    {bounty.recentCrimes.length > 2 && '...'}
                  </div>
                </div>
              )}

              {/* Arrest Button */}
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => onArrest(bounty)}
              >
                Arrest
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Footer Note */}
      <div className="text-center text-sm text-wood-grain italic">
        <p>Bounties updated in real-time. First come, first served!</p>
      </div>
    </div>
  );
};

export default BountyBoard;
