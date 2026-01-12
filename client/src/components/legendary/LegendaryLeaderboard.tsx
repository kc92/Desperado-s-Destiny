/**
 * LegendaryLeaderboard Component
 * Kill leaderboard for a legendary animal
 */

import { Card } from '@/components/ui';
import {
  legendaryHuntService,
  type LeaderboardEntry,
} from '@/services/legendaryHunt.service';

interface LegendaryLeaderboardProps {
  legendaryName: string;
  entries: LeaderboardEntry[];
  isLoading?: boolean;
  currentCharacterId?: string;
}

export function LegendaryLeaderboard({
  legendaryName,
  entries,
  isLoading,
  currentCharacterId,
}: LegendaryLeaderboardProps) {
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
        <div className="text-4xl mb-2">🏅</div>
        <h3 className="text-lg font-bold text-gray-400">No Records Yet</h3>
        <p className="text-sm text-gray-500">
          Be the first to defeat {legendaryName}!
        </p>
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
    <Card className="p-4">
      <h3 className="font-bold text-gray-300 mb-4">
        {legendaryName} - Fastest Hunters
      </h3>

      <div className="space-y-2">
        {entries.map(entry => {
          const isSelf = entry.characterId === currentCharacterId;

          return (
            <div
              key={entry.characterId}
              className={`flex items-center justify-between p-2 rounded ${
                isSelf
                  ? 'bg-amber-900/30 border border-amber-500/50'
                  : 'bg-gray-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-xl ${getRankColor(entry.rank)}`}>
                  {getRankIcon(entry.rank)}
                </span>
                <div>
                  <span className={`font-medium ${isSelf ? 'text-amber-400' : 'text-gray-300'}`}>
                    {entry.characterName}
                    {isSelf && <span className="text-xs ml-1">(You)</span>}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-green-400 font-bold">
                  {legendaryHuntService.formatCompletionTime(entry.completionTime)}
                </div>
                <div className="text-xs text-gray-500">
                  {entry.turnsUsed} turns
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default LegendaryLeaderboard;
