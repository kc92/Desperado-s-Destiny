/**
 * Travel Map Component
 * Interactive SVG map showing all locations with travel connections
 * Following the TerritoryMap.tsx pattern
 */

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui';
import type { Location, WorldZoneType } from '@desperados/shared';
import { ZONE_INFO } from '@desperados/shared';

interface TravelMapProps {
  locations: Location[];
  currentLocationId?: string;
  onLocationClick?: (location: Location) => void;
  onTravelClick?: (targetLocation: Location) => void;
  playerEnergy?: number;
}

/**
 * Legacy map position coordinates for locations without mapPosition data
 * Will be removed once all locations have mapPosition in the database
 */
const FALLBACK_MAP_POSITIONS: Record<string, { x: number; y: number }> = {
  '6501a0000000000000000001': { x: 400, y: 150 }, // Red Gulch
  '6501a0000000000000000003': { x: 480, y: 100 }, // Fort Ashford
  '6501a0000000000000000002': { x: 180, y: 350 }, // The Frontera
  '6501a0000000000000000004': { x: 620, y: 180 }, // Kaiowa Mesa
  '6501a0000000000000000005': { x: 300, y: 280 }, // Sangre Canyon
  '6501a000000000000000000c': { x: 500, y: 400 }, // Whiskey Bend
  '6501a000000000000000000a': { x: 650, y: 350 }, // Longhorn Ranch
  '6501a0000000000000000006': { x: 200, y: 180 }, // Goldfinger's Mine
  '6501a000000000000000000b': { x: 580, y: 280 }, // Spirit Springs
  '6601a0000000000000000001': { x: 440, y: 200 }, // Desperados Academy
};

/**
 * Get map position for a location (from location data or fallback)
 */
function getMapPosition(location: Location): { x: number; y: number } | null {
  // Use mapPosition from location data if available
  if (location.mapPosition?.x !== undefined && location.mapPosition?.y !== undefined) {
    return location.mapPosition;
  }
  // Fall back to hardcoded positions
  return FALLBACK_MAP_POSITIONS[location.id] || null;
}

/**
 * Zone colors for visual grouping
 */
const ZONE_COLORS: Record<WorldZoneType, { fill: string; stroke: string }> = {
  settler_territory: { fill: '#fef3c7', stroke: '#d97706' },
  sangre_canyon: { fill: '#fecaca', stroke: '#dc2626' },
  coalition_lands: { fill: '#d1fae5', stroke: '#10b981' },
  outlaw_territory: { fill: '#e0e7ff', stroke: '#6366f1' },
  frontier: { fill: '#fce7f3', stroke: '#ec4899' },
  ranch_country: { fill: '#fef9c3', stroke: '#eab308' },
  sacred_mountains: { fill: '#dbeafe', stroke: '#3b82f6' },
};

/**
 * Get icon for location type
 */
function getLocationIcon(type: string): string {
  const icons: Record<string, string> = {
    settlement: '🏘️',
    fort: '🏰',
    ranch: '🐄',
    mine: '⛏️',
    saloon: '🍺',
    sacred_site: '✨',
    canyon: '🏜️',
    springs: '💧',
    mesa: '🪶',
    cave: '🦇',
    camp: '🏕️',
    hideout: '💀',
    trading_post: '🛒',
    wilderness: '🌵',
    wasteland: '☠️',
    skill_academy: '📚',
    bank: '🏦',
    church: '⛪',
    courthouse: '⚖️',
    cantina: '🎭',
  };
  return icons[type] || '📍';
}

export function TravelMap({
  locations,
  currentLocationId,
  onLocationClick,
  onTravelClick,
  playerEnergy = 100,
}: TravelMapProps) {
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Filter to only main locations (not sub-buildings) that have map positions
  const mainLocations = useMemo(() => {
    return locations.filter((loc) => !loc.parentId && getMapPosition(loc));
  }, [locations]);

  // Current location object
  const currentLocation = useMemo(() => {
    return locations.find((loc) => loc.id === currentLocationId);
  }, [locations, currentLocationId]);

  // Get travel connections from current location
  const travelableLocations = useMemo(() => {
    if (!currentLocation) return new Set<string>();
    return new Set(currentLocation.connections?.map((c) => c.targetLocationId) || []);
  }, [currentLocation]);

  // Get connection energy cost
  const getEnergyCost = (targetId: string): number => {
    const connection = currentLocation?.connections?.find(
      (c) => c.targetLocationId === targetId
    );
    return connection?.energyCost || 0;
  };

  const handleLocationClick = (location: Location) => {
    if (location.id === currentLocationId) {
      // Already here
      onLocationClick?.(location);
      return;
    }

    if (travelableLocations.has(location.id)) {
      const energyCost = getEnergyCost(location.id);
      if (playerEnergy >= energyCost) {
        onTravelClick?.(location);
      }
    } else {
      setSelectedLocation(location.id);
      onLocationClick?.(location);
    }
  };

  return (
    <Card className="bg-amber-50 border-2 border-amber-900 p-4">
      <div className="mb-4">
        <h3 className="text-xl font-western text-amber-900 mb-2">Sangre Territory Map</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-700" />
            <span>You are here</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-400 border-2 border-amber-600" />
            <span>Can travel</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-400 border-2 border-gray-600" />
            <span>Distant</span>
          </div>
        </div>
      </div>

      <div className="relative bg-gradient-to-b from-amber-100 to-amber-200 border border-amber-700 rounded overflow-hidden">
        <svg
          viewBox="0 0 800 550"
          className="w-full h-auto"
          style={{ maxHeight: '550px' }}
        >
          <defs>
            <filter id="mapShadow">
              <feDropShadow dx="1" dy="1" stdDeviation="2" floodOpacity="0.3" />
            </filter>
            <pattern id="terrain" patternUnits="userSpaceOnUse" width="20" height="20">
              <circle cx="10" cy="10" r="1" fill="#d4a574" opacity="0.3" />
            </pattern>
          </defs>

          {/* Background terrain */}
          <rect width="800" height="550" fill="url(#terrain)" />

          {/* Zone backgrounds */}
          <ellipse cx="400" cy="150" rx="180" ry="100" fill="#fef3c7" opacity="0.5" />
          <ellipse cx="180" cy="380" rx="120" ry="100" fill="#e0e7ff" opacity="0.5" />
          <ellipse cx="660" cy="180" rx="140" ry="120" fill="#d1fae5" opacity="0.5" />
          <ellipse cx="300" cy="300" rx="150" ry="100" fill="#fecaca" opacity="0.5" />
          <ellipse cx="500" cy="420" rx="120" ry="100" fill="#fce7f3" opacity="0.5" />
          <ellipse cx="650" cy="350" rx="100" ry="80" fill="#fef9c3" opacity="0.5" />

          {/* Zone labels */}
          <text x="400" y="70" textAnchor="middle" className="fill-amber-700 font-semibold" style={{ fontSize: '12px' }}>
            Settler Territory
          </text>
          <text x="180" y="450" textAnchor="middle" className="fill-indigo-700 font-semibold" style={{ fontSize: '12px' }}>
            Outlaw Territory
          </text>
          <text x="680" y="80" textAnchor="middle" className="fill-emerald-700 font-semibold" style={{ fontSize: '12px' }}>
            Coalition Lands
          </text>
          <text x="300" y="380" textAnchor="middle" className="fill-red-700 font-semibold" style={{ fontSize: '12px' }}>
            Sangre Canyon
          </text>
          <text x="500" y="500" textAnchor="middle" className="fill-pink-700 font-semibold" style={{ fontSize: '12px' }}>
            The Frontier
          </text>
          <text x="680" cy="420" textAnchor="middle" className="fill-yellow-700 font-semibold" style={{ fontSize: '12px' }}>
            Ranch Country
          </text>

          {/* Draw connections */}
          {currentLocation?.connections?.map((connection) => {
            const targetLoc = locations.find((l) => l.id === connection.targetLocationId);
            const targetPos = targetLoc ? getMapPosition(targetLoc) : null;
            const sourcePos = currentLocation ? getMapPosition(currentLocation) : null;
            if (!targetPos || !sourcePos) return null;

            const canAfford = playerEnergy >= connection.energyCost;

            return (
              <g key={connection.targetLocationId}>
                <line
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke={canAfford ? '#d97706' : '#9ca3af'}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.6"
                />
                {/* Energy cost label */}
                <text
                  x={(sourcePos.x + targetPos.x) / 2}
                  y={(sourcePos.y + targetPos.y) / 2 - 5}
                  textAnchor="middle"
                  className={`font-semibold ${canAfford ? 'fill-amber-800' : 'fill-gray-500'}`}
                  style={{ fontSize: '10px' }}
                >
                  {connection.energyCost}⚡
                </text>
              </g>
            );
          })}

          {/* Draw locations */}
          {mainLocations.map((location) => {
            const pos = getMapPosition(location);
            if (!pos) return null;

            const isCurrentLocation = location.id === currentLocationId;
            const isHovered = hoveredLocation === location.id;
            const isSelected = selectedLocation === location.id;
            const isTravelable = travelableLocations.has(location.id);
            const energyCost = getEnergyCost(location.id);
            const canAfford = playerEnergy >= energyCost;

            let fillColor = '#9ca3af'; // Gray - distant
            let strokeColor = '#6b7280';

            if (isCurrentLocation) {
              fillColor = '#22c55e'; // Green - current
              strokeColor = '#15803d';
            } else if (isTravelable && canAfford) {
              fillColor = '#fbbf24'; // Amber - can travel
              strokeColor = '#d97706';
            } else if (isTravelable && !canAfford) {
              fillColor = '#f87171'; // Red - can't afford
              strokeColor = '#dc2626';
            }

            const radius = isCurrentLocation ? 18 : isHovered ? 16 : 14;

            return (
              <g
                key={location.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredLocation(location.id)}
                onMouseLeave={() => setHoveredLocation(null)}
                onClick={() => handleLocationClick(location)}
              >
                {/* Location circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isHovered || isSelected ? 3 : 2}
                  filter="url(#mapShadow)"
                  className={`transition-all ${isCurrentLocation ? 'animate-pulse' : ''}`}
                />

                {/* Location icon */}
                <text
                  x={pos.x}
                  y={pos.y + 5}
                  textAnchor="middle"
                  style={{ fontSize: '14px' }}
                  className="pointer-events-none"
                >
                  {location.icon || getLocationIcon(location.type)}
                </text>

                {/* Location name */}
                <text
                  x={pos.x}
                  y={pos.y - 22}
                  textAnchor="middle"
                  className="fill-amber-900 font-semibold pointer-events-none"
                  style={{ fontSize: '10px' }}
                >
                  {location.name}
                </text>

                {/* Danger indicator */}
                {location.dangerLevel >= 5 && (
                  <text
                    x={pos.x + 16}
                    y={pos.y - 10}
                    className="fill-red-600 pointer-events-none"
                    style={{ fontSize: '10px' }}
                  >
                    ⚠️
                  </text>
                )}

                {/* Zone hub indicator */}
                {location.isZoneHub && (
                  <circle
                    cx={pos.x + 14}
                    cy={pos.y + 14}
                    r={6}
                    fill="#fbbf24"
                    stroke="#d97706"
                    strokeWidth="1"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredLocation && (
          <div className="absolute top-2 right-2 bg-white border-2 border-amber-800 rounded p-3 shadow-lg max-w-xs">
            {(() => {
              const location = locations.find((l) => l.id === hoveredLocation);
              if (!location) return null;

              const isTravelable = travelableLocations.has(location.id);
              const energyCost = getEnergyCost(location.id);
              const canAfford = playerEnergy >= energyCost;
              const zoneInfo = location.zone ? ZONE_INFO[location.zone as WorldZoneType] : null;

              return (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{location.icon || getLocationIcon(location.type)}</span>
                    <h4 className="font-semibold text-amber-900">{location.name}</h4>
                  </div>

                  {zoneInfo && (
                    <div className="text-xs text-amber-600 mb-2">
                      {zoneInfo.icon} {zoneInfo.name}
                    </div>
                  )}

                  <p className="text-xs text-amber-800 mb-2">{location.shortDescription}</p>

                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-amber-700">Danger:</span>
                      <span className="font-semibold">
                        {'⚠️'.repeat(Math.ceil(location.dangerLevel / 2))}
                      </span>
                    </div>

                    {location.id === currentLocationId && (
                      <div className="text-green-600 font-semibold mt-2">
                        ✓ You are here
                      </div>
                    )}

                    {isTravelable && location.id !== currentLocationId && (
                      <div className={`mt-2 pt-2 border-t border-amber-200 ${canAfford ? 'text-amber-700' : 'text-red-600'}`}>
                        <span className="font-semibold">
                          {canAfford ? 'Click to travel' : 'Not enough energy'}
                        </span>
                        <span className="ml-2">{energyCost}⚡</span>
                      </div>
                    )}

                    {!isTravelable && location.id !== currentLocationId && (
                      <div className="text-gray-500 mt-2 pt-2 border-t border-amber-200">
                        No direct route
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Zone Legend */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {Object.entries(ZONE_INFO).map(([zoneId, info]) => (
          <div key={zoneId} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded"
              style={{
                backgroundColor: ZONE_COLORS[zoneId as WorldZoneType]?.fill || '#ccc',
                border: `1px solid ${ZONE_COLORS[zoneId as WorldZoneType]?.stroke || '#999'}`,
              }}
            />
            <span className="text-amber-800">
              {info.icon} {info.name}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default TravelMap;
