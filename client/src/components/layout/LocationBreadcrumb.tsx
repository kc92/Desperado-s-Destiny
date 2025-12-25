/**
 * Location Breadcrumb Component
 * Shows the hierarchical path: Continent > Region > Zone > Location
 * Clickable at each level to navigate the map
 */

import React, { useEffect } from 'react';
import { useMapStore } from '@/store/useMapStore';
import type { FactionType } from '@desperados/shared';

interface LocationBreadcrumbProps {
  onNavigate?: (level: 'continent' | 'region' | 'zone' | 'location', id: string) => void;
  className?: string;
  compact?: boolean;
}

/**
 * Get faction color for styling
 */
function getFactionTextColor(faction: FactionType): string {
  const colors: Record<FactionType, string> = {
    settler: 'text-amber-400',
    nahi: 'text-emerald-400',
    frontera: 'text-violet-400',
    neutral: 'text-gray-400',
  };
  return colors[faction] || colors.neutral;
}

export const LocationBreadcrumb: React.FC<LocationBreadcrumbProps> = ({
  onNavigate,
  className = '',
  compact = false,
}) => {
  const {
    geographyTree,
    breadcrumb,
    fetchGeographyTree,
    focusContinent,
    focusRegion,
    focusZone,
    focusLocation,
  } = useMapStore();

  useEffect(() => {
    if (!geographyTree) {
      fetchGeographyTree();
    }
  }, [geographyTree, fetchGeographyTree]);

  const handleContinentClick = () => {
    if (breadcrumb.continent) {
      focusContinent(breadcrumb.continent.id);
      onNavigate?.('continent', breadcrumb.continent.id);
    }
  };

  const handleRegionClick = () => {
    if (breadcrumb.region) {
      focusRegion(breadcrumb.region.id);
      onNavigate?.('region', breadcrumb.region.id);
    }
  };

  const handleZoneClick = () => {
    if (breadcrumb.zone) {
      focusZone(breadcrumb.zone.id);
      onNavigate?.('zone', breadcrumb.zone.id);
    }
  };

  const handleLocationClick = () => {
    if (breadcrumb.location) {
      focusLocation(breadcrumb.location.id);
      onNavigate?.('location', breadcrumb.location.id);
    }
  };

  // Nothing to show if no breadcrumb data
  if (!breadcrumb.continent && !breadcrumb.region && !breadcrumb.zone && !breadcrumb.location) {
    return (
      <div className={`text-sm text-desert-stone ${className}`}>
        <span className="opacity-50">Location unknown - open map to explore</span>
      </div>
    );
  }

  if (compact) {
    // Compact version - just show current location with zone
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        {breadcrumb.zone && (
          <>
            <span className="text-lg">{breadcrumb.zone.icon || '🏜️'}</span>
            <span
              className={`cursor-pointer hover:underline ${getFactionTextColor(breadcrumb.zone.primaryFaction)}`}
              onClick={handleZoneClick}
            >
              {breadcrumb.zone.name}
            </span>
          </>
        )}
        {breadcrumb.location && (
          <>
            <span className="text-desert-stone/50">/</span>
            <span
              className="text-desert-sand cursor-pointer hover:underline"
              onClick={handleLocationClick}
            >
              {breadcrumb.location.name}
            </span>
          </>
        )}
      </div>
    );
  }

  // Full breadcrumb
  return (
    <div className={`flex items-center flex-wrap gap-1 text-sm ${className}`}>
      {/* Continent */}
      {breadcrumb.continent && (
        <>
          <button
            onClick={handleContinentClick}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-wood-dark/30 transition-colors"
          >
            <span className="text-base">{breadcrumb.continent.icon || '🌎'}</span>
            <span className="text-desert-sand hover:text-gold-light">
              {breadcrumb.continent.name}
            </span>
          </button>
        </>
      )}

      {/* Region */}
      {breadcrumb.region && (
        <>
          <span className="text-desert-stone/50 px-1">{'>'}</span>
          <button
            onClick={handleRegionClick}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-wood-dark/30 transition-colors"
          >
            <span className="text-base">{breadcrumb.region.icon || '📍'}</span>
            <span className={`hover:underline ${getFactionTextColor(breadcrumb.region.primaryFaction)}`}>
              {breadcrumb.region.name}
            </span>
          </button>
        </>
      )}

      {/* Zone */}
      {breadcrumb.zone && (
        <>
          <span className="text-desert-stone/50 px-1">{'>'}</span>
          <button
            onClick={handleZoneClick}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-wood-dark/30 transition-colors"
          >
            <span className="text-base">{breadcrumb.zone.icon || '🏜️'}</span>
            <span className={`hover:underline ${getFactionTextColor(breadcrumb.zone.primaryFaction)}`}>
              {breadcrumb.zone.name}
            </span>
          </button>
        </>
      )}

      {/* Location */}
      {breadcrumb.location && (
        <>
          <span className="text-desert-stone/50 px-1">{'>'}</span>
          <button
            onClick={handleLocationClick}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-wood-dark/30 transition-colors"
          >
            <span className="text-base">{breadcrumb.location.icon || '🏘️'}</span>
            <span className="text-gold-light font-medium">
              {breadcrumb.location.name}
            </span>
          </button>
        </>
      )}

      {/* Current indicator - only show when we have valid location data */}
      {breadcrumb.location && (
        <span className="ml-2 px-2 py-0.5 bg-green-900/50 border border-green-500/30 rounded text-xs text-green-400">
          You are here
        </span>
      )}
    </div>
  );
};

export default LocationBreadcrumb;
