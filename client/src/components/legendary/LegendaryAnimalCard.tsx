/**
 * LegendaryAnimalCard Component
 * Displays a legendary animal with discovery progress
 */

import { Card, Button, ProgressBar } from '@/components/ui';
import {
  legendaryHuntService,
  type LegendaryAnimal,
  type LegendaryProgress,
  type LegendaryCategory,
  type DiscoveryStatus,
} from '@/services/legendaryHunt.service';

interface LegendaryAnimalCardProps {
  legendary: LegendaryAnimal;
  progress: LegendaryProgress;
  onSelect: () => void;
  onInitiateHunt?: () => void;
  isLoading?: boolean;
}

export function LegendaryAnimalCard({
  legendary,
  progress,
  onSelect,
  onInitiateHunt,
  isLoading,
}: LegendaryAnimalCardProps) {
  const isDiscovered = legendaryHuntService.isDiscovered(progress);
  const isDefeated = legendaryHuntService.isDefeated(progress);
  const discoveryPercent = legendaryHuntService.getDiscoveryProgressPercent(progress);
  const winRate = legendaryHuntService.getWinRate(progress);

  const categoryColors: Record<LegendaryCategory, string> = {
    predator: 'text-red-400 bg-red-900/30',
    prey: 'text-green-400 bg-green-900/30',
    mythical: 'text-purple-400 bg-purple-900/30',
    extinct: 'text-gray-400 bg-gray-900/30',
  };

  const categoryIcons: Record<LegendaryCategory, string> = {
    predator: '🦁',
    prey: '🦌',
    mythical: '🐉',
    extinct: '🦴',
  };

  const statusLabels: Record<DiscoveryStatus, { label: string; color: string }> = {
    unknown: { label: 'Unknown', color: 'text-gray-500' },
    rumored: { label: 'Rumored', color: 'text-blue-400' },
    tracked: { label: 'Tracked', color: 'text-amber-400' },
    discovered: { label: 'Discovered', color: 'text-green-400' },
    defeated: { label: 'Defeated', color: 'text-purple-400' },
  };

  const status = statusLabels[progress.discoveryStatus];

  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:border-amber-500/50 ${
        isDefeated ? 'border-purple-500/50 bg-purple-900/10' :
        isDiscovered ? 'border-green-500/50' : ''
      }`}
      onClick={onSelect}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">
            {isDefeated ? '🏆' : categoryIcons[legendary.category]}
          </span>
          <div>
            <h3 className={`font-bold text-lg ${
              isDiscovered ? 'text-amber-400' : 'text-gray-400'
            }`}>
              {isDiscovered ? legendary.name : '???'}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded ${categoryColors[legendary.category]}`}>
              {legendaryHuntService.getCategoryDisplayName(legendary.category)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-sm ${status.color}`}>{status.label}</span>
          <div className="text-xs text-gray-500">Lv. {legendary.level}</div>
        </div>
      </div>

      {/* Description (only if discovered) */}
      {isDiscovered && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
          {legendary.description}
        </p>
      )}

      {/* Discovery Progress */}
      {!isDefeated && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Discovery Progress</span>
            <span className="text-amber-400">{discoveryPercent}%</span>
          </div>
          <ProgressBar
            value={discoveryPercent}
            max={100}
            color={discoveryPercent >= 75 ? 'green' : 'amber'}
            className="h-2"
          />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
        <div className="bg-gray-800/50 rounded p-2 text-center">
          <div className="text-gray-400">{progress.cluesFound}</div>
          <div className="text-xs text-gray-600">Clues</div>
        </div>
        <div className="bg-gray-800/50 rounded p-2 text-center">
          <div className="text-gray-400">{progress.encountersAttempted}</div>
          <div className="text-xs text-gray-600">Attempts</div>
        </div>
        <div className="bg-gray-800/50 rounded p-2 text-center">
          <div className={winRate > 50 ? 'text-green-400' : 'text-red-400'}>
            {winRate}%
          </div>
          <div className="text-xs text-gray-600">Win Rate</div>
        </div>
      </div>

      {/* Location hint (if discovered) */}
      {isDiscovered && (
        <div className="text-xs text-gray-500 mb-3">
          Location: {legendary.location}
        </div>
      )}

      {/* Trophy indicator */}
      {progress.hasTrophy && (
        <div className="mb-3 p-2 bg-yellow-900/30 rounded text-center">
          <span className="text-yellow-400">🏆 Trophy Collected</span>
        </div>
      )}

      {/* Actions */}
      {isDiscovered && onInitiateHunt && (
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onInitiateHunt();
          }}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : isDefeated ? 'Hunt Again' : 'Start Hunt'}
        </Button>
      )}

      {!isDiscovered && (
        <div className="text-center text-xs text-gray-500 italic">
          Find more clues to discover this legendary
        </div>
      )}
    </Card>
  );
}

export default LegendaryAnimalCard;
