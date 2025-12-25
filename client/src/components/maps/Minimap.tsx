/**
 * Minimap Component
 * A compact widget showing current location with quick access to full map
 */

import React, { useEffect } from 'react';
import { useMapStore } from '@/store/useMapStore';
import { Card, Button } from '@/components/ui';
import type { FactionType } from '@desperados/shared';

interface MinimapProps {
  onOpenFullMap?: () => void;
  className?: string;
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

export const Minimap: React.FC<MinimapProps> = ({ onOpenFullMap, className = '' }) => {
  const {
    geographyTree,
    breadcrumb,
    playerLocationId,
    isMinimapExpanded,
    toggleMinimap,
    fetchGeographyTree,
    getLocationsInCurrentZone,
  } = useMapStore();

  useEffect(() => {
    if (!geographyTree) {
      fetchGeographyTree();
    }
  }, [geographyTree, fetchGeographyTree]);

  // Get current zone's locations for mini view (use optimized store getter)
  const currentZone = breadcrumb.zone;
  const currentLocations = getLocationsInCurrentZone();

  if (isMinimapExpanded) {
    // Expanded minimap view
    return (
      <Card variant="parchment" className={`p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-western text-wood-dark text-sm">Local Area</h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onOpenFullMap}>
              Full Map
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleMinimap}>
              Collapse
            </Button>
          </div>
        </div>

        {/* Mini zone view */}
        <div className="relative bg-desert-sand/30 border border-wood-grain rounded overflow-hidden">
          <svg viewBox="0 0 200 150" className="w-full h-auto" style={{ maxHeight: '150px' }}>
            <rect width="200" height="150" fill="#d4c4a8" />

            {currentLocations.map((loc, i) => {
              const cols = Math.ceil(Math.sqrt(currentLocations.length * 1.5));
              const col = i % cols;
              const row = Math.floor(i / cols);
              const cellWidth = 200 / (cols + 1);
              const cellHeight = 150 / (Math.ceil(currentLocations.length / cols) + 1);
              const x = cellWidth * (col + 1);
              const y = cellHeight * (row + 1);
              const isPlayer = playerLocationId === loc.id;

              return (
                <g key={loc.id}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isPlayer ? 10 : 6}
                    fill={isPlayer ? '#22c55e' : '#78350f'}
                    stroke={isPlayer ? '#166534' : '#92400e'}
                    strokeWidth={isPlayer ? 2 : 1}
                    className={isPlayer ? 'animate-pulse' : ''}
                  />
                  <text
                    x={x}
                    y={y + 18}
                    textAnchor="middle"
                    style={{ fontSize: '8px' }}
                    className="fill-wood-dark"
                  >
                    {loc.name.substring(0, 10)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Current location info */}
        {breadcrumb.location && (
          <div className="mt-3 p-2 bg-wood-dark/50 rounded text-xs">
            <div className="flex items-center gap-2 text-gold-light">
              <span className="text-lg">{breadcrumb.location.icon || '📍'}</span>
              <div>
                <p className="font-western">{breadcrumb.location.name}</p>
                <p className="text-desert-stone">{currentZone?.name || 'Unknown Zone'}</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    );
  }

  // Collapsed minimap view
  return (
    <Card
      variant="leather"
      className={`p-3 cursor-pointer hover:bg-wood-dark/70 transition-colors ${className}`}
      onClick={toggleMinimap}
    >
      <div className="flex items-center gap-3">
        {/* Mini indicator */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: getFactionColor(currentZone?.primaryFaction || 'neutral') }}
        >
          <span className="text-sm">{currentZone?.icon || '🗺️'}</span>
        </div>

        {/* Location text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-western text-desert-sand truncate">
            {breadcrumb.location?.name || 'Unknown'}
          </p>
          <p className="text-xs text-desert-stone truncate">
            {currentZone?.name || 'Explore the map'}
          </p>
        </div>

        {/* Expand icon */}
        <span className="text-desert-stone text-xs">
          Click to expand
        </span>
      </div>
    </Card>
  );
};

export default Minimap;
