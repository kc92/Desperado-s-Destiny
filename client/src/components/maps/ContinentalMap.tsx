/**
 * Continental Map Component
 * Shows the full frontier view with all regions as clickable markers
 */

import React, { useState, useEffect } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { Card } from '@/components/ui';
import type {
  RegionSummary,
  FactionType,
  ContinentWithRegions,
} from '@desperados/shared';

interface ContinentalMapProps {
  onRegionClick?: (region: RegionSummary) => void;
}

/**
 * Get faction color
 */
function getFactionColor(faction: FactionType): string {
  const colors: Record<FactionType, string> = {
    settler: '#d97706', // Amber
    nahi: '#059669', // Emerald
    frontera: '#7c3aed', // Violet
    neutral: '#6b7280', // Gray
  };
  return colors[faction] || colors.neutral;
}

/**
 * Get faction border color
 */
function getFactionBorder(faction: FactionType): string {
  const colors: Record<FactionType, string> = {
    settler: '#92400e',
    nahi: '#047857',
    frontera: '#5b21b6',
    neutral: '#4b5563',
  };
  return colors[faction] || colors.neutral;
}

/**
 * Get region icon based on category
 */
function getRegionIcon(icon: string): string {
  return icon || '📍';
}

/**
 * Default region positions for the map (normalized 0-1 coordinates)
 * These are fallbacks when backend doesn't provide position data
 */
const DEFAULT_REGION_POSITIONS: Record<string, { x: number; y: number }> = {
  dusty_flats: { x: 0.2, y: 0.3 },
  red_canyon: { x: 0.5, y: 0.2 },
  silver_peaks: { x: 0.8, y: 0.25 },
  rio_grande_valley: { x: 0.3, y: 0.5 },
  frontier_plains: { x: 0.55, y: 0.45 },
  nahi_highlands: { x: 0.75, y: 0.5 },
  badlands: { x: 0.35, y: 0.7 },
  mesa_country: { x: 0.6, y: 0.7 },
  border_territory: { x: 0.15, y: 0.8 },
};

/**
 * Get region position - uses backend data if available, falls back to defaults
 */
function getRegionPosition(region: RegionSummary, mapWidth: number, mapHeight: number): { x: number; y: number } {
  // Use backend position if available (normalized 0-1 coordinates)
  if (region.position) {
    return {
      x: region.position.x * mapWidth,
      y: region.position.y * mapHeight,
    };
  }

  // Fall back to default positions
  const defaultPos = DEFAULT_REGION_POSITIONS[region.id] || { x: 0.5, y: 0.5 };
  return {
    x: defaultPos.x * mapWidth,
    y: defaultPos.y * mapHeight,
  };
}

export const ContinentalMap: React.FC<ContinentalMapProps> = ({ onRegionClick }) => {
  const { geographyTree, isLoading, fetchGeographyTree, focusedContinentId } = useMapStore();
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  useEffect(() => {
    fetchGeographyTree();
  }, [fetchGeographyTree]);

  if (isLoading) {
    return (
      <Card variant="leather" className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-light" />
        </div>
      </Card>
    );
  }

  const continent: ContinentWithRegions | undefined = geographyTree?.continents.find(
    (c: ContinentWithRegions) => c.id === focusedContinentId
  ) || geographyTree?.continents[0];

  if (!continent) {
    return (
      <Card variant="leather" className="p-6">
        <div className="text-center py-8 text-desert-stone">
          No map data available
        </div>
      </Card>
    );
  }

  const mapWidth = 800;
  const mapHeight = 600;

  return (
    <Card variant="parchment" className="p-6">
      <div className="mb-4">
        <h2 className="text-2xl font-western text-wood-dark mb-2">
          {continent.icon} {continent.name}
        </h2>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: getFactionColor('settler') }} />
            <span className="text-desert-stone">Settler Territory</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: getFactionColor('nahi') }} />
            <span className="text-desert-stone">Nahi Lands</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: getFactionColor('frontera') }} />
            <span className="text-desert-stone">Frontera Zones</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: getFactionColor('neutral') }} />
            <span className="text-desert-stone">Neutral</span>
          </div>
        </div>
      </div>

      <div className="relative bg-desert-sand/30 border-2 border-wood-grain rounded-lg overflow-hidden">
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-auto"
          style={{ maxHeight: '600px' }}
        >
          <defs>
            <filter id="mapShadow">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.4" />
            </filter>
            <pattern id="dustPattern" patternUnits="userSpaceOnUse" width="20" height="20">
              <circle cx="10" cy="10" r="1" fill="#d4a574" opacity="0.3" />
            </pattern>
          </defs>

          {/* Background */}
          <rect width={mapWidth} height={mapHeight} fill="#e8d5b7" />
          <rect width={mapWidth} height={mapHeight} fill="url(#dustPattern)" />

          {/* Decorative compass */}
          <g transform={`translate(${mapWidth - 80}, 60)`}>
            <circle r="30" fill="none" stroke="#78350f" strokeWidth="2" />
            <line x1="0" y1="-25" x2="0" y2="25" stroke="#78350f" strokeWidth="2" />
            <line x1="-25" y1="0" x2="25" y2="0" stroke="#78350f" strokeWidth="2" />
            <text y="-35" textAnchor="middle" className="text-xs fill-wood-dark font-western">N</text>
          </g>

          {/* Region markers */}
          {continent.regions.map((region: RegionSummary & { zones: unknown[] }) => {
            const { x, y } = getRegionPosition(region, mapWidth, mapHeight);
            const isHovered = hoveredRegion === region.id;
            const baseRadius = 35;
            const radius = isHovered ? baseRadius + 5 : baseRadius;

            return (
              <g key={region.id}>
                {/* Region circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={getFactionColor(region.primaryFaction)}
                  stroke={getFactionBorder(region.primaryFaction)}
                  strokeWidth={isHovered ? 4 : 2}
                  filter="url(#mapShadow)"
                  className={`cursor-pointer transition-all duration-200 ${
                    !region.isUnlocked ? 'opacity-40' : ''
                  }`}
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => region.isUnlocked && onRegionClick?.(region)}
                />

                {/* Region icon */}
                <text
                  x={x}
                  y={y + 6}
                  textAnchor="middle"
                  className="pointer-events-none"
                  style={{ fontSize: '24px' }}
                >
                  {getRegionIcon(region.icon)}
                </text>

                {/* Region name */}
                <text
                  x={x}
                  y={y + radius + 18}
                  textAnchor="middle"
                  className="fill-wood-dark font-western pointer-events-none"
                  style={{ fontSize: '12px' }}
                >
                  {region.name}
                </text>

                {/* Zone count badge */}
                <g transform={`translate(${x + radius - 8}, ${y - radius + 8})`}>
                  <circle r="12" fill="#1f2937" />
                  <text
                    y="4"
                    textAnchor="middle"
                    className="fill-white pointer-events-none"
                    style={{ fontSize: '11px', fontWeight: 'bold' }}
                  >
                    {region.zoneCount}
                  </text>
                </g>

                {/* Lock icon for locked regions */}
                {!region.isUnlocked && (
                  <text
                    x={x}
                    y={y + 6}
                    textAnchor="middle"
                    className="pointer-events-none"
                    style={{ fontSize: '20px' }}
                  >
                    🔒
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredRegion && (
          <div className="absolute bottom-4 left-4 bg-wood-dark/95 border-2 border-gold-light rounded-lg p-4 shadow-xl max-w-sm">
            {(() => {
              const region = continent.regions.find((r: RegionSummary) => r.id === hoveredRegion);
              if (!region) return null;

              return (
                <div>
                  <h4 className="font-western text-gold-light text-lg mb-2">
                    {region.icon} {region.name}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-desert-stone">Faction:</span>
                      <span className="text-desert-sand capitalize">{region.primaryFaction}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-desert-stone">Zones:</span>
                      <span className="text-desert-sand">{region.zoneCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-desert-stone">Status:</span>
                      <span className={region.isUnlocked ? 'text-green-400' : 'text-red-400'}>
                        {region.isUnlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>
                  </div>
                  {region.isUnlocked && (
                    <p className="text-xs text-desert-stone mt-2 pt-2 border-t border-wood-grain/30">
                      Click to explore this region
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ContinentalMap;
