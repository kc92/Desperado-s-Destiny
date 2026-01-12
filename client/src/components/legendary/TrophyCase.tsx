/**
 * TrophyCase Component
 * Display earned legendary trophies
 */

import { Card } from '@/components/ui';
import {
  legendaryHuntService,
  type LegendaryTrophy,
  type LegendaryCategory,
} from '@/services/legendaryHunt.service';

interface TrophyCaseProps {
  trophies: LegendaryTrophy[];
  isLoading?: boolean;
  onSelectTrophy?: (trophy: LegendaryTrophy) => void;
}

export function TrophyCase({
  trophies,
  isLoading,
  onSelectTrophy,
}: TrophyCaseProps) {
  if (isLoading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-32 bg-gray-700 rounded" />
      </Card>
    );
  }

  if (trophies.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="text-4xl mb-2">🏆</div>
        <h3 className="text-lg font-bold text-gray-400">No Trophies Yet</h3>
        <p className="text-sm text-gray-500">
          Defeat legendary animals to collect their trophies!
        </p>
      </Card>
    );
  }

  const categoryIcons: Record<LegendaryCategory, string> = {
    predator: '🦁',
    prey: '🦌',
    mythical: '🐉',
    extinct: '🦴',
  };

  // Sort by most recent first
  const sortedTrophies = [...trophies].sort((a, b) => {
    return (
      new Date(b.defeatedAt).getTime() - new Date(a.defeatedAt).getTime()
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
          <span>🏆</span> Trophy Case
        </h3>
        <span className="text-gray-500 text-sm">{trophies.length} collected</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {sortedTrophies.map(trophy => (
          <Card
            key={trophy._id}
            className={`p-3 cursor-pointer transition-all hover:border-yellow-500/50 ${
              trophy.equipped ? 'border-yellow-500 bg-yellow-900/10' : ''
            }`}
            onClick={() => onSelectTrophy?.(trophy)}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">
                {categoryIcons[trophy.category]}
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-amber-400">{trophy.legendaryName}</h4>
                  {trophy.equipped && (
                    <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                      Equipped
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  Defeated on {new Date(trophy.defeatedAt).toLocaleDateString()}
                  {trophy.completionTime > 0 && (
                    <> • {legendaryHuntService.formatCompletionTime(trophy.completionTime)}</>
                  )}
                </div>

                {/* Bonuses */}
                {trophy.bonuses && trophy.bonuses.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {trophy.bonuses.map((bonus, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded"
                      >
                        +{bonus.value} {bonus.stat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default TrophyCase;
