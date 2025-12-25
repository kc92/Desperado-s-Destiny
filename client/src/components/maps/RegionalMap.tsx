/**
 * Regional Map Component
 * Shows zones within a selected region with terrain visualization
 */

import React, { useState } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { Card, Button } from '@/components/ui';
import type {
  ZoneSummary,
  ZoneWithLocations,
  FactionType,
  ContinentWithRegions,
  RegionWithZones,
  LocationSummary,
} from '@desperados/shared';

interface RegionalMapProps {
  onZoneClick?: (zone: ZoneSummary) => void;
  onBackToContinent?: () => void;
}

/**
 * Get faction color
 */
function getFactionColor(faction: FactionType): string {
  const colors: Record<FactionType, string> = {
    settler: '#d97706',
    nahi: '#059669',
    frontera: '#7c3aed',
    neutral: '#6b7280',
  };
  return colors[faction] || colors.neutral;
}

/**
 * Get theme background color
 */
function getThemeColor(theme: string): string {
  const themes: Record<string, string> = {
    desert: '#e8c99c',
    canyon: '#c9a574',
    mountains: '#9ca3af',
    plains: '#a3c28a',
    forest: '#6b8e5a',
    badlands: '#b87333',
    river: '#7db8bf',
  };
  return themes[theme.toLowerCase()] || themes.desert;
}

/**
 * Get danger level color
 */
function getDangerColor(dangerRange: [number, number]): string {
  const avgDanger = (dangerRange[0] + dangerRange[1]) / 2;
  if (avgDanger <= 20) return 'text-green-400';
  if (avgDanger <= 40) return 'text-lime-400';
  if (avgDanger <= 60) return 'text-yellow-400';
  if (avgDanger <= 80) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Get danger level text
 */
function getDangerText(dangerRange: [number, number]): string {
  const avgDanger = (dangerRange[0] + dangerRange[1]) / 2;
  if (avgDanger <= 20) return 'Safe';
  if (avgDanger <= 40) return 'Low Risk';
  if (avgDanger <= 60) return 'Moderate';
  if (avgDanger <= 80) return 'Dangerous';
  return 'Deadly';
}

export const RegionalMap: React.FC<RegionalMapProps> = ({ onZoneClick, onBackToContinent }) => {
  const {
    geographyTree,
    focusedContinentId,
    focusedRegionId,
    playerLocationId,
    activeOverlays,
  } = useMapStore();

  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const continent = geographyTree?.continents.find(
    (c: ContinentWithRegions) => c.id === focusedContinentId
  );
  const region = continent?.regions.find(
    (r: RegionWithZones) => r.id === focusedRegionId
  );

  if (!region) {
    return (
      <Card variant="leather" className="p-6">
        <div className="text-center py-8 text-desert-stone">
          Select a region to view
        </div>
      </Card>
    );
  }

  const mapWidth = 800;
  const mapHeight = 500;

  // Calculate zone positions in a grid layout
  const getZonePosition = (index: number, total: number) => {
    const cols = Math.ceil(Math.sqrt(total));
    const rows = Math.ceil(total / cols);
    const col = index % cols;
    const row = Math.floor(index / cols);

    const cellWidth = mapWidth / (cols + 1);
    const cellHeight = mapHeight / (rows + 1);

    return {
      x: cellWidth * (col + 1),
      y: cellHeight * (row + 1),
    };
  };

  // Check if player is in a zone
  const isPlayerInZone = (zoneId: string) => {
    if (!playerLocationId) return false;
    const zone = region.zones.find((z: ZoneWithLocations) => z.id === zoneId);
    return zone?.locations.some((loc: LocationSummary) => loc.id === playerLocationId);
  };

  return (
    <Card variant="parchment" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-western text-wood-dark mb-1">
            {region.icon} {region.name}
          </h2>
          <p className="text-sm text-desert-stone">
            {region.zoneCount} zones - {region.primaryFaction} territory
          </p>
        </div>
        {onBackToContinent && (
          <Button variant="ghost" onClick={onBackToContinent}>
            ← Back to Continent
          </Button>
        )}
      </div>

      <div className="relative bg-desert-sand/20 border-2 border-wood-grain rounded-lg overflow-hidden">
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-auto"
          style={{ maxHeight: '500px' }}
        >
          <defs>
            <filter id="zoneShadow">
              <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Background */}
          <rect width={mapWidth} height={mapHeight} fill="#e8d5b7" />

          {/* Zone hexagons */}
          {region.zones.map((zone: ZoneWithLocations, index: number) => {
            const pos = getZonePosition(index, region.zones.length);
            const isHovered = hoveredZone === zone.id;
            const hasPlayer = isPlayerInZone(zone.id);
            const size = isHovered ? 60 : 55;

            // Hexagon points
            const hexPoints = Array.from({ length: 6 }, (_, i) => {
              const angle = (Math.PI / 3) * i - Math.PI / 6;
              return `${pos.x + size * Math.cos(angle)},${pos.y + size * Math.sin(angle)}`;
            }).join(' ');

            return (
              <g key={zone.id}>
                {/* Zone hexagon */}
                <polygon
                  points={hexPoints}
                  fill={getThemeColor(zone.theme)}
                  stroke={getFactionColor(zone.primaryFaction)}
                  strokeWidth={isHovered ? 4 : 2}
                  filter="url(#zoneShadow)"
                  className={`cursor-pointer transition-all duration-200 ${
                    !zone.isUnlocked ? 'opacity-40' : ''
                  }`}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                  onClick={() => zone.isUnlocked && onZoneClick?.(zone)}
                />

                {/* Zone icon */}
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none"
                  style={{ fontSize: '28px' }}
                >
                  {zone.icon || '🏜️'}
                </text>

                {/* Zone name */}
                <text
                  x={pos.x}
                  y={pos.y + size + 16}
                  textAnchor="middle"
                  className="fill-wood-dark font-western pointer-events-none"
                  style={{ fontSize: '11px' }}
                >
                  {zone.name}
                </text>

                {/* Location count badge */}
                <g transform={`translate(${pos.x + size - 10}, ${pos.y - size + 10})`}>
                  <circle r="10" fill="#374151" />
                  <text
                    y="3"
                    textAnchor="middle"
                    className="fill-white pointer-events-none"
                    style={{ fontSize: '10px', fontWeight: 'bold' }}
                  >
                    {zone.locationCount}
                  </text>
                </g>

                {/* Player marker */}
                {hasPlayer && (
                  <g transform={`translate(${pos.x}, ${pos.y - size + 5})`}>
                    <circle r="8" fill="#22c55e" className="animate-pulse" />
                    <text
                      y="4"
                      textAnchor="middle"
                      className="fill-white pointer-events-none"
                      style={{ fontSize: '10px' }}
                    >
                      You
                    </text>
                  </g>
                )}

                {/* Danger overlay */}
                {activeOverlays.includes('danger') && zone.isUnlocked && (
                  <g transform={`translate(${pos.x - size + 15}, ${pos.y + size - 20})`}>
                    <rect
                      x="-12"
                      y="-8"
                      width="24"
                      height="16"
                      rx="4"
                      fill="rgba(0,0,0,0.7)"
                    />
                    <text
                      textAnchor="middle"
                      className={`pointer-events-none ${getDangerColor(zone.dangerRange)}`}
                      style={{ fontSize: '8px', fontWeight: 'bold' }}
                      y="4"
                    >
                      {zone.dangerRange[0]}-{zone.dangerRange[1]}
                    </text>
                  </g>
                )}

                {/* Lock icon */}
                {!zone.isUnlocked && (
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none"
                    style={{ fontSize: '24px' }}
                  >
                    🔒
                  </text>
                )}
              </g>
            );
          })}

          {/* Connection lines between adjacent zones */}
          {region.zones.map((zone: ZoneWithLocations, index: number) => {
            const pos = getZonePosition(index, region.zones.length);
            // Draw connections to adjacent zones (simplified)
            return zone.locations
              .filter((_, i) => i === 0) // Just use first location for simplicity
              .map((_, i) => {
                const nextIndex = (index + 1) % region.zones.length;
                if (nextIndex <= index) return null;
                const nextPos = getZonePosition(nextIndex, region.zones.length);
                return (
                  <line
                    key={`${zone.id}-conn-${i}`}
                    x1={pos.x}
                    y1={pos.y}
                    x2={nextPos.x}
                    y2={nextPos.y}
                    stroke="#92400e"
                    strokeWidth="2"
                    strokeDasharray="8,4"
                    opacity="0.3"
                  />
                );
              });
          })}
        </svg>

        {/* Tooltip */}
        {hoveredZone && (
          <div className="absolute top-4 right-4 bg-wood-dark/95 border-2 border-gold-light rounded-lg p-4 shadow-xl max-w-xs">
            {(() => {
              const zone = region.zones.find((z: ZoneWithLocations) => z.id === hoveredZone);
              if (!zone) return null;

              return (
                <div>
                  <h4 className="font-western text-gold-light text-lg mb-2">
                    {zone.icon} {zone.name}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-desert-stone">Theme:</span>
                      <span className="text-desert-sand capitalize">{zone.theme}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-desert-stone">Locations:</span>
                      <span className="text-desert-sand">{zone.locationCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-desert-stone">Danger:</span>
                      <span className={getDangerColor(zone.dangerRange)}>
                        {getDangerText(zone.dangerRange)} ({zone.dangerRange[0]}-{zone.dangerRange[1]})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-desert-stone">Faction:</span>
                      <span className="text-desert-sand capitalize">{zone.primaryFaction}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-desert-stone">Status:</span>
                      <span className={zone.isUnlocked ? 'text-green-400' : 'text-red-400'}>
                        {zone.isUnlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                  </div>
                  {zone.isUnlocked && (
                    <p className="text-xs text-desert-stone mt-2 pt-2 border-t border-wood-grain/30">
                      Click to view locations
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-desert-stone">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span>Your Location</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getThemeColor('desert') }} />
          <span>Desert</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getThemeColor('canyon') }} />
          <span>Canyon</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getThemeColor('plains') }} />
          <span>Plains</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getThemeColor('mountains') }} />
          <span>Mountains</span>
        </div>
      </div>
    </Card>
  );
};

export default RegionalMap;
