/**
 * Local Map Component
 * Street-level view showing locations within a zone
 */

import React, { useState } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { Card, Button } from '@/components/ui';
import type {
  LocationSummary,
  ContinentWithRegions,
  RegionWithZones,
  ZoneWithLocations,
} from '@desperados/shared';

interface LocalMapProps {
  onLocationClick?: (location: LocationSummary) => void;
  onBackToRegion?: () => void;
}

/**
 * Get location type icon
 */
function getLocationIcon(type: string, icon?: string): string {
  if (icon) return icon;

  const icons: Record<string, string> = {
    town: '🏘️',
    city: '🏙️',
    village: '🏚️',
    outpost: '🏕️',
    camp: '⛺',
    mine: '⛏️',
    ranch: '🐴',
    saloon: '🍺',
    shop: '🏪',
    bank: '🏦',
    sheriff: '⭐',
    church: '⛪',
    station: '🚂',
    fort: '🏰',
    ruins: '🏚️',
    cave: '🕳️',
    landmark: '📍',
  };
  return icons[type.toLowerCase()] || '📍';
}

/**
 * Get location type color
 */
function getLocationColor(type: string): string {
  const colors: Record<string, string> = {
    town: '#d97706',
    city: '#ea580c',
    village: '#78716c',
    outpost: '#65a30d',
    camp: '#16a34a',
    mine: '#6b7280',
    ranch: '#ca8a04',
    saloon: '#dc2626',
    shop: '#2563eb',
    bank: '#7c3aed',
    sheriff: '#f59e0b',
    church: '#e5e7eb',
    station: '#374151',
    fort: '#991b1b',
    ruins: '#57534e',
    cave: '#1f2937',
    landmark: '#0891b2',
  };
  return colors[type.toLowerCase()] || '#6b7280';
}

export const LocalMap: React.FC<LocalMapProps> = ({ onLocationClick, onBackToRegion }) => {
  const {
    geographyTree,
    focusedContinentId,
    focusedRegionId,
    focusedZoneId,
    playerLocationId,
    isLocationDiscovered,
  } = useMapStore();

  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  const continent = geographyTree?.continents.find(
    (c: ContinentWithRegions) => c.id === focusedContinentId
  );
  const region = continent?.regions.find(
    (r: RegionWithZones) => r.id === focusedRegionId
  );
  const zone = region?.zones.find(
    (z: ZoneWithLocations) => z.id === focusedZoneId
  );

  if (!zone) {
    return (
      <Card variant="leather" className="p-6">
        <div className="text-center py-8 text-desert-stone">
          Select a zone to view locations
        </div>
      </Card>
    );
  }

  const mapWidth = 800;
  const mapHeight = 450;

  // Calculate location positions (grid with some randomization for natural feel)
  const getLocationPosition = (index: number, total: number) => {
    const cols = Math.ceil(Math.sqrt(total * 1.5));
    const rows = Math.ceil(total / cols);
    const col = index % cols;
    const row = Math.floor(index / cols);

    const cellWidth = mapWidth / (cols + 1);
    const cellHeight = mapHeight / (rows + 1);

    // Add slight randomization for natural feel
    const jitterX = (Math.sin(index * 123.456) * 0.2) * cellWidth;
    const jitterY = (Math.cos(index * 654.321) * 0.2) * cellHeight;

    return {
      x: cellWidth * (col + 1) + jitterX,
      y: cellHeight * (row + 1) + jitterY,
    };
  };

  // Find hub location
  const hubLocation = zone.locations.find((loc: LocationSummary) => loc.isZoneHub);

  return (
    <Card variant="parchment" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-western text-wood-dark mb-1">
            {zone.icon} {zone.name}
          </h2>
          <p className="text-sm text-desert-stone">
            {zone.locationCount} locations - {zone.theme} terrain
          </p>
        </div>
        {onBackToRegion && (
          <Button variant="ghost" onClick={onBackToRegion}>
            ← Back to Region
          </Button>
        )}
      </div>

      <div className="relative bg-desert-sand/30 border-2 border-wood-grain rounded-lg overflow-hidden">
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-auto"
          style={{ maxHeight: '450px' }}
        >
          <defs>
            <filter id="locationShadow">
              <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.4" />
            </filter>
            <filter id="hubGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background with terrain pattern */}
          <rect width={mapWidth} height={mapHeight} fill="#d4c4a8" />

          {/* Decorative roads/paths */}
          {zone.locations.length > 1 && zone.locations.map((_loc: LocationSummary, i: number) => {
            if (i === zone.locations.length - 1) return null;
            const pos1 = getLocationPosition(i, zone.locations.length);
            const pos2 = getLocationPosition(i + 1, zone.locations.length);
            return (
              <line
                key={`road-${i}`}
                x1={pos1.x}
                y1={pos1.y}
                x2={pos2.x}
                y2={pos2.y}
                stroke="#92400e"
                strokeWidth="3"
                strokeDasharray="10,5"
                opacity="0.2"
              />
            );
          })}

          {/* Location markers */}
          {zone.locations.map((location: LocationSummary, index: number) => {
            const pos = getLocationPosition(index, zone.locations.length);
            const isHovered = hoveredLocation === location.id;
            const isPlayer = playerLocationId === location.id;
            const isHub = location.isZoneHub;
            const discovered = isLocationDiscovered(location.id);
            const size = isHub ? 40 : isHovered ? 35 : 30;

            return (
              <g key={location.id}>
                {/* Location marker */}
                <g
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className={`cursor-pointer ${!location.isUnlocked ? 'opacity-40' : ''}`}
                  onMouseEnter={() => setHoveredLocation(location.id)}
                  onMouseLeave={() => setHoveredLocation(null)}
                  onClick={() => location.isUnlocked && onLocationClick?.(location)}
                >
                  {/* Background circle */}
                  <circle
                    r={size}
                    fill={getLocationColor(location.type)}
                    stroke={isPlayer ? '#22c55e' : isHub ? '#fbbf24' : '#78350f'}
                    strokeWidth={isPlayer ? 4 : isHub ? 3 : 2}
                    filter={isHub ? 'url(#hubGlow)' : 'url(#locationShadow)'}
                    className={`transition-all duration-200 ${isPlayer ? 'animate-pulse' : ''}`}
                  />

                  {/* Location icon */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none"
                    style={{ fontSize: isHub ? '22px' : '18px' }}
                  >
                    {getLocationIcon(location.type, location.icon)}
                  </text>

                  {/* Player marker */}
                  {isPlayer && (
                    <g transform="translate(0, -45)">
                      <polygon
                        points="0,-12 8,4 -8,4"
                        fill="#22c55e"
                        stroke="#166534"
                        strokeWidth="1"
                      />
                      <text
                        y="-18"
                        textAnchor="middle"
                        className="fill-green-400 font-bold pointer-events-none"
                        style={{ fontSize: '10px' }}
                      >
                        YOU
                      </text>
                    </g>
                  )}

                  {/* Hub indicator */}
                  {isHub && !isPlayer && (
                    <g transform="translate(25, -25)">
                      <circle r="10" fill="#fbbf24" stroke="#92400e" strokeWidth="1" />
                      <text
                        y="4"
                        textAnchor="middle"
                        className="fill-wood-dark pointer-events-none"
                        style={{ fontSize: '12px' }}
                      >
                        H
                      </text>
                    </g>
                  )}

                  {/* Undiscovered fog */}
                  {!discovered && location.isUnlocked && (
                    <circle
                      r={size + 5}
                      fill="rgba(0,0,0,0.5)"
                      stroke="none"
                      className="pointer-events-none"
                    />
                  )}

                  {/* Lock icon */}
                  {!location.isUnlocked && (
                    <text
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none"
                      style={{ fontSize: '16px' }}
                    >
                      🔒
                    </text>
                  )}
                </g>

                {/* Location name */}
                <text
                  x={pos.x}
                  y={pos.y + size + 14}
                  textAnchor="middle"
                  className="fill-wood-dark font-western pointer-events-none"
                  style={{ fontSize: '11px' }}
                >
                  {location.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredLocation && (
          <div className="absolute bottom-4 left-4 bg-wood-dark/95 border-2 border-gold-light rounded-lg p-4 shadow-xl max-w-xs">
            {(() => {
              const location = zone.locations.find((l: LocationSummary) => l.id === hoveredLocation);
              if (!location) return null;

              const isPlayer = playerLocationId === location.id;
              const discovered = isLocationDiscovered(location.id);

              return (
                <div>
                  <h4 className="font-western text-gold-light text-lg mb-2 flex items-center gap-2">
                    <span>{getLocationIcon(location.type, location.icon)}</span>
                    {location.name}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-desert-stone">Type:</span>
                      <span className="text-desert-sand capitalize">{location.type}</span>
                    </div>
                    {location.isZoneHub && (
                      <div className="flex justify-between">
                        <span className="text-desert-stone">Role:</span>
                        <span className="text-gold-light">Zone Hub</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-desert-stone">Status:</span>
                      <span className={location.isUnlocked ? 'text-green-400' : 'text-red-400'}>
                        {location.isUnlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-desert-stone">Explored:</span>
                      <span className={discovered ? 'text-green-400' : 'text-orange-400'}>
                        {discovered ? 'Yes' : 'Not yet'}
                      </span>
                    </div>
                  </div>
                  {isPlayer && (
                    <p className="text-xs text-green-400 mt-2 pt-2 border-t border-wood-grain/30">
                      You are here
                    </p>
                  )}
                  {!isPlayer && location.isUnlocked && (
                    <p className="text-xs text-desert-stone mt-2 pt-2 border-t border-wood-grain/30">
                      Click to travel here
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
          <div className="w-3 h-3 rounded-full border-2 border-green-500 animate-pulse" />
          <span>Your Location</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gold-light border border-amber-600" />
          <span>Zone Hub</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500 opacity-50" />
          <span>Unexplored</span>
        </div>
        {hubLocation && (
          <div className="ml-auto text-desert-sand">
            Hub: {hubLocation.name}
          </div>
        )}
      </div>
    </Card>
  );
};

export default LocalMap;
