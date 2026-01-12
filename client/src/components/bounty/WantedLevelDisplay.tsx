/**
 * WantedLevelDisplay Component
 * Shows player's current wanted level and active bounties on them
 */

import { Card } from '@/components/ui';
import { bountyService, type WantedLevel } from '@/services/bounty.service';

interface WantedLevelDisplayProps {
  wantedLevel: WantedLevel | null;
  isLoading?: boolean;
}

export function WantedLevelDisplay({ wantedLevel, isLoading }: WantedLevelDisplayProps) {
  if (isLoading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-20 bg-gray-700 rounded" />
      </Card>
    );
  }

  if (!wantedLevel || wantedLevel.wantedLevel === 0) {
    return (
      <Card className="p-4 border-green-700/50 bg-gradient-to-r from-green-900/10 to-transparent">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⭐</span>
          <div>
            <h3 className="font-bold text-green-400">Clean Record</h3>
            <p className="text-sm text-gray-400">
              You're a law-abiding citizen. No bounties on your head.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const levelLabel = bountyService.formatWantedLevel(wantedLevel.wantedLevel);
  const spawnChance = bountyService.calculateSpawnChance(wantedLevel.wantedLevel);

  // Color based on wanted level
  const levelColors = [
    'text-green-400',   // 0
    'text-yellow-400',  // 1-2
    'text-yellow-400',
    'text-amber-400',   // 3-5
    'text-amber-400',
    'text-amber-400',
    'text-red-400',     // 6-10
    'text-red-400',
    'text-red-400',
    'text-red-400',
    'text-red-400',
    'text-purple-400',  // 11+
  ];
  const levelColor = levelColors[Math.min(wantedLevel.wantedLevel, 11)] || 'text-purple-400';

  return (
    <Card className="p-4 border-red-700/50 bg-gradient-to-r from-red-900/20 to-transparent">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🔴</span>
          <div>
            <h3 className={`font-bold text-xl ${levelColor}`}>WANTED</h3>
            <p className="text-gray-400">{levelLabel}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-red-400">
            ${wantedLevel.totalBounty}
          </div>
          <span className="text-sm text-gray-500">total bounty</span>
        </div>
      </div>

      {/* Wanted Stars */}
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: Math.min(wantedLevel.wantedLevel, 5) }).map((_, i) => (
          <span key={i} className="text-yellow-400 text-lg">★</span>
        ))}
        {wantedLevel.wantedLevel > 5 && (
          <span className="text-red-400 text-sm ml-1">+{wantedLevel.wantedLevel - 5}</span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
        <div className="bg-gray-800/50 rounded p-2 text-center">
          <div className={levelColor}>{wantedLevel.wantedLevel}</div>
          <div className="text-gray-500 text-xs">Wanted Level</div>
        </div>
        <div className="bg-gray-800/50 rounded p-2 text-center">
          <div className="text-amber-400">{wantedLevel.activeBounties.length}</div>
          <div className="text-gray-500 text-xs">Active Bounties</div>
        </div>
        <div className="bg-gray-800/50 rounded p-2 text-center">
          <div className="text-red-400">{spawnChance}%</div>
          <div className="text-gray-500 text-xs">Hunter Chance</div>
        </div>
      </div>

      {/* Recent Crimes */}
      {wantedLevel.crimes && wantedLevel.crimes.length > 0 && (
        <div className="border-t border-gray-700 pt-3">
          <h4 className="text-gray-400 text-sm mb-2">Recent Crimes</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {wantedLevel.crimes.slice(0, 5).map((crime, idx) => (
              <div
                key={crime._id || idx}
                className="flex justify-between text-xs text-gray-500"
              >
                <span className="capitalize">
                  {crime.type.replace(/_/g, ' ')}
                  {crime.witnessed && ' (Witnessed)'}
                </span>
                <span className={`${
                  crime.severity <= 2 ? 'text-yellow-400' :
                  crime.severity <= 4 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {bountyService.getCrimeSeverityLabel(crime.severity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning */}
      {spawnChance > 20 && (
        <div className="mt-3 p-2 bg-red-900/30 rounded text-red-400 text-sm text-center">
          ⚠️ Watch your back! Bounty hunters are after you.
        </div>
      )}
    </Card>
  );
}

export default WantedLevelDisplay;
