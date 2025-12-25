/**
 * World Map Page
 * Unified map view with zoom controls and overlays
 */

import React, { useEffect, useState } from 'react';
import { useMapStore, MapOverlay } from '@/store/useMapStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { ContinentalMap, RegionalMap, LocalMap, Minimap } from '@/components/maps';
import { LocationBreadcrumb } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import type { RegionSummary, ZoneSummary, LocationSummary } from '@desperados/shared';

/**
 * WorldMap page component
 */
export const WorldMap: React.FC = () => {
  const { currentCharacter } = useCharacterStore();
  const {
    geographyTree,
    currentZoom,
    focusedContinentId,
    focusedRegionId,
    focusedZoneId,
    activeOverlays,
    isLoading,
    error,
    fetchGeographyTree,
    setZoom,
    focusRegion,
    focusZone,
    focusLocation,
    focusContinent,
    toggleOverlay,
    setPlayerLocation,
  } = useMapStore();

  const [showLegend, setShowLegend] = useState(false);

  // Fetch geography data on mount
  useEffect(() => {
    fetchGeographyTree();
  }, [fetchGeographyTree]);

  // Sync player location with character
  useEffect(() => {
    if (currentCharacter?.locationId) {
      setPlayerLocation(currentCharacter.locationId);
    }
  }, [currentCharacter?.locationId, setPlayerLocation]);

  // Initialize focused continent if not set
  useEffect(() => {
    if (geographyTree && !focusedContinentId && geographyTree.continents.length > 0) {
      focusContinent(geographyTree.continents[0].id);
    }
  }, [geographyTree, focusedContinentId, focusContinent]);

  // Handle navigation
  const handleRegionClick = (region: RegionSummary) => {
    focusRegion(region.id);
    setZoom('regional');
  };

  const handleZoneClick = (zone: ZoneSummary) => {
    focusZone(zone.id);
    setZoom('local');
  };

  const handleLocationClick = (location: LocationSummary) => {
    focusLocation(location.id);
  };

  const handleBackToContinent = () => {
    setZoom('continental');
    focusContinent(focusedContinentId);
  };

  const handleBackToRegion = () => {
    setZoom('regional');
  };

  // Toggle overlay
  const handleToggleOverlay = (overlay: MapOverlay) => {
    toggleOverlay(overlay);
  };

  // Loading state
  if (isLoading && !geographyTree) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-light mx-auto" />
            <p className="text-desert-sand font-serif">Loading map data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card variant="leather" className="p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button variant="primary" onClick={() => fetchGeographyTree()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-western text-wood-dark text-shadow-gold mb-2">
          World Map
        </h1>
        <LocationBreadcrumb className="mb-4" />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-desert-stone">Zoom:</span>
          <div className="flex bg-wood-dark/30 rounded-lg p-1">
            <Button
              variant={currentZoom === 'continental' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => {
                setZoom('continental');
                focusContinent(focusedContinentId);
              }}
            >
              Continental
            </Button>
            <Button
              variant={currentZoom === 'regional' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setZoom('regional')}
              disabled={!focusedRegionId}
            >
              Regional
            </Button>
            <Button
              variant={currentZoom === 'local' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setZoom('local')}
              disabled={!focusedZoneId}
            >
              Local
            </Button>
          </div>
        </div>

        {/* Overlay toggles */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-desert-stone">Overlays:</span>
          <Button
            variant={activeOverlays.includes('danger') ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleToggleOverlay('danger')}
          >
            Danger
          </Button>
          <Button
            variant={activeOverlays.includes('faction') ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleToggleOverlay('faction')}
          >
            Faction
          </Button>
          <Button
            variant={activeOverlays.includes('territory') ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleToggleOverlay('territory')}
          >
            Territory
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLegend(!showLegend)}
          >
            {showLegend ? 'Hide' : 'Show'} Legend
          </Button>
        </div>
      </div>

      {/* Legend panel */}
      {showLegend && (
        <Card variant="leather" className="p-4 mb-6">
          <h3 className="font-western text-desert-sand mb-3">Map Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-desert-stone font-medium mb-2">Factions</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-amber-600" />
                  <span className="text-desert-sand">Settler</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-600" />
                  <span className="text-desert-sand">Nahi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-violet-600" />
                  <span className="text-desert-sand">Frontera</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-500" />
                  <span className="text-desert-sand">Neutral</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-desert-stone font-medium mb-2">Danger Levels</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">0-20</span>
                  <span className="text-desert-sand">Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">21-50</span>
                  <span className="text-desert-sand">Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-400">51-80</span>
                  <span className="text-desert-sand">Dangerous</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400">81-100</span>
                  <span className="text-desert-sand">Deadly</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-desert-stone font-medium mb-2">Markers</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-desert-sand">Your Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gold-light border border-amber-600" />
                  <span className="text-desert-sand">Zone Hub</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <span className="text-desert-sand">Locked</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-desert-stone font-medium mb-2">Terrain</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span>🏜️</span>
                  <span className="text-desert-sand">Desert</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🏔️</span>
                  <span className="text-desert-sand">Mountains</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🌲</span>
                  <span className="text-desert-sand">Forest</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🌾</span>
                  <span className="text-desert-sand">Plains</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main map display */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map area */}
        <div className="lg:col-span-3">
          {currentZoom === 'continental' && (
            <ContinentalMap onRegionClick={handleRegionClick} />
          )}
          {currentZoom === 'regional' && (
            <RegionalMap
              onZoneClick={handleZoneClick}
              onBackToContinent={handleBackToContinent}
            />
          )}
          {currentZoom === 'local' && (
            <LocalMap
              onLocationClick={handleLocationClick}
              onBackToRegion={handleBackToRegion}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Minimap */}
          <Minimap />

          {/* Quick info */}
          <Card variant="leather" className="p-4">
            <h3 className="font-western text-desert-sand mb-3">Quick Info</h3>
            <div className="space-y-2 text-sm">
              {geographyTree && (
                <>
                  <div className="flex justify-between">
                    <span className="text-desert-stone">Continents:</span>
                    <span className="text-desert-sand">{geographyTree.continents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-desert-stone">Total Regions:</span>
                    <span className="text-desert-sand">
                      {geographyTree.continents.reduce((sum, c) => sum + c.regions.length, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-desert-stone">Total Zones:</span>
                    <span className="text-desert-sand">
                      {geographyTree.continents.reduce(
                        (sum, c) => sum + c.regions.reduce((s, r) => s + r.zones.length, 0),
                        0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-desert-stone">Total Locations:</span>
                    <span className="text-desert-sand">
                      {geographyTree.continents.reduce(
                        (sum, c) =>
                          sum +
                          c.regions.reduce(
                            (s, r) => s + r.zones.reduce((z, zone) => z + zone.locations.length, 0),
                            0
                          ),
                        0
                      )}
                    </span>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Navigation help */}
          <Card variant="leather" className="p-4">
            <h3 className="font-western text-desert-sand mb-3">Navigation</h3>
            <div className="space-y-2 text-xs text-desert-stone">
              <p>Click on regions to zoom in</p>
              <p>Click on zones to see locations</p>
              <p>Click on locations to travel</p>
              <p>Use breadcrumb to navigate back</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
