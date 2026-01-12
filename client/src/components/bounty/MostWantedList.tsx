/**
 * MostWantedList Component
 * Leaderboard of most wanted criminals
 */

import { Card } from '@/components/ui';
import { type MostWantedEntry } from '@/services/bounty.service';

interface MostWantedListProps {
  entries: MostWantedEntry[];
  isLoading?: boolean;
  currentCharacterId?: string;
  onSelectTarget?: (characterId: string) => void;
}

export function MostWantedList({
  entries,
  isLoading,
  currentCharacterId,
  onSelectTarget,
}: MostWantedListProps) {
  if (isLoading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-48 bg-gray-700 rounded" />
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="text-4xl mb-2">🤠</div>
        <h3 className="text-lg font-bold text-gray-400">No Outlaws Found</h3>
        <p className="text-sm text-gray-500">The frontier is peaceful... for now.</p>
      </Card>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-300';
      case 3: return 'text-amber-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
        <span>🔴</span> Most Wanted
      </h3>

      <div className="space-y-2">
        {entries.map((entry) => {
          const isSelf = entry.characterId === currentCharacterId;

          return (
            <Card
              key={entry.characterId}
              className={`p-3 cursor-pointer transition-all hover:bg-gray-800/50 ${
                isSelf ? 'border-red-500/50 bg-red-900/10' : ''
              }`}
              onClick={() => onSelectTarget?.(entry.characterId)}
            >
              <div className="flex items-center justify-between">
                {/* Left side - Rank and Name */}
                <div className="flex items-center gap-3">
                  <span className={`text-xl ${getRankColor(entry.rank)}`}>
                    {getRankIcon(entry.rank)}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-400">
                        {entry.characterName}
                      </span>
                      {entry.isOnline && (
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      )}
                      {isSelf && (
                        <span className="text-xs text-red-400">(You)</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {entry.faction || 'No faction'} • {entry.activeBounties} bounties
                    </div>
                  </div>
                </div>

                {/* Right side - Bounty */}
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">
                    ${entry.totalBounty}
                  </div>
                  <div className="flex items-center gap-1 justify-end">
                    {Array.from({ length: Math.min(entry.wantedLevel, 5) }).map((_, i) => (
                      <span key={i} className="text-yellow-400 text-xs">★</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Last Seen */}
              {entry.lastSeen && (
                <div className="text-xs text-gray-600 mt-1">
                  Last seen: {entry.lastSeen}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default MostWantedList;
