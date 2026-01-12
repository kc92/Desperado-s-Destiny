/**
 * Location Header Component
 * Displays location name, description, atmosphere, and key info
 */

import { Card } from '@/components/ui';

interface FactionInfluence {
  settlerAlliance: number;
  nahiCoalition: number;
  frontera: number;
}

interface ZoneInfo {
  id: string;
  name: string;
  icon: string;
}

interface LocationHeaderProps {
  name: string;
  shortDescription: string;
  _description?: string; // Reserved for future use
  atmosphere?: string;
  icon?: string;
  type: string;
  dangerLevel: number;
  factionInfluence: FactionInfluence;
  zoneInfo?: ZoneInfo | null;
  isParentTown?: boolean;
  onReturnToTown?: () => void;
  parentLocationName?: string;
}

const getDangerColor = (level: number): string => {
  if (level <= 2) return 'text-green-400';
  if (level <= 4) return 'text-yellow-400';
  if (level <= 6) return 'text-orange-400';
  return 'text-red-400';
};

const getDangerLabel = (level: number): string => {
  if (level <= 2) return 'Safe';
  if (level <= 4) return 'Moderate';
  if (level <= 6) return 'Dangerous';
  if (level <= 8) return 'Very Dangerous';
  return 'Deadly';
};

const getDominantFaction = (influence: FactionInfluence): { name: string; color: string } | null => {
  const { settlerAlliance, nahiCoalition, frontera } = influence;
  const max = Math.max(settlerAlliance, nahiCoalition, frontera);

  if (max < 30) return null; // No dominant faction

  if (settlerAlliance === max) return { name: 'Settler Alliance', color: 'text-blue-400' };
  if (nahiCoalition === max) return { name: 'Nahi Coalition', color: 'text-green-400' };
  if (frontera === max) return { name: 'Frontera', color: 'text-purple-400' };

  return null;
};

export function LocationHeader({
  name,
  shortDescription,
  atmosphere,
  icon,
  type,
  dangerLevel,
  factionInfluence,
  zoneInfo,
  isParentTown,
  onReturnToTown,
  parentLocationName,
}: LocationHeaderProps) {
  const dominantFaction = getDominantFaction(factionInfluence);

  return (
    <Card className="p-6">
      {/* Zone Badge */}
      {zoneInfo && (
        <div className="mb-3 inline-flex items-center gap-1 px-2 py-1 bg-gray-800/50 rounded text-xs">
          <span>{zoneInfo.icon}</span>
          <span className="text-gray-300">{zoneInfo.name}</span>
        </div>
      )}

      {/* Return to Town Link */}
      {!isParentTown && onReturnToTown && parentLocationName && (
        <button
          onClick={onReturnToTown}
          className="mb-3 block text-sm text-amber-400 hover:text-amber-300 transition-colors"
        >
          ← Back to {parentLocationName}
        </button>
      )}

      {/* Main Header */}
      <div className="flex items-start gap-4">
        <span className="text-4xl">{icon || '📍'}</span>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-amber-300">{name}</h1>
          <p className="text-gray-400 text-sm capitalize">
            {type.replace(/_/g, ' ')}
          </p>
          <p className="text-gray-300 mt-1">{shortDescription}</p>
        </div>
      </div>

      {/* Atmosphere */}
      {atmosphere && (
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 italic text-gray-400 text-sm">
          {atmosphere}
        </div>
      )}

      {/* Stats Row */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        {/* Danger Level */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Danger:</span>
          <span className={getDangerColor(dangerLevel)}>
            {'⚠️'.repeat(Math.ceil(dangerLevel / 2))} {getDangerLabel(dangerLevel)}
          </span>
        </div>

        {/* Dominant Faction */}
        {dominantFaction && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Territory:</span>
            <span className={dominantFaction.color}>{dominantFaction.name}</span>
          </div>
        )}

        {/* Faction Influence Bars */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Influence:</span>
          <div className="flex items-center gap-1">
            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${factionInfluence.settlerAlliance}%` }}
                title={`Settler: ${factionInfluence.settlerAlliance}%`}
              />
            </div>
            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500"
                style={{ width: `${factionInfluence.nahiCoalition}%` }}
                title={`Nahi: ${factionInfluence.nahiCoalition}%`}
              />
            </div>
            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500"
                style={{ width: `${factionInfluence.frontera}%` }}
                title={`Frontera: ${factionInfluence.frontera}%`}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default LocationHeader;
