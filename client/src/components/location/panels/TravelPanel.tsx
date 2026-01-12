/**
 * Travel Panel Component
 * Unified travel interface with interactive map and zone-aware destinations
 */

import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { TravelMap } from '@/components/travel';
import type { Location as LocationType } from '@desperados/shared';

interface LocalConnection {
  _id: string;
  name: string;
  shortDescription: string;
  icon?: string;
  type: string;
}

interface ZoneExit {
  zone: string;
  hub: LocalConnection;
  energyCost: number;
}

interface ZoneInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface ZoneTravelOptions {
  localConnections: LocalConnection[];
  zoneExits: ZoneExit[];
  currentZone: string | null;
  zoneInfo: ZoneInfo | null;
}

interface LocationConnection {
  targetLocationId: string;
  energyCost: number;
  description?: string;
}

interface TravelPanelProps {
  location: {
    _id: string;
    name: string;
    connections: LocationConnection[];
    connectedLocations?: LocalConnection[];
  };
  zoneTravelOptions: ZoneTravelOptions | null;
  allLocations?: LocationType[];
  playerEnergy: number;
  travelingTo: string | null;
  onTravel: (locationId: string) => void;
}

type ViewMode = 'list' | 'map';

export function TravelPanel({
  location,
  zoneTravelOptions,
  allLocations = [],
  playerEnergy,
  travelingTo,
  onTravel,
}: TravelPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Convert locations to format expected by TravelMap
  const mapLocations: LocationType[] = allLocations.map((loc) => ({
    ...loc,
    id: loc.id || (loc as any)._id,
  }));

  const handleMapTravel = (targetLocation: LocationType) => {
    onTravel(targetLocation.id || (targetLocation as any)._id);
  };

  return (
    <Card className="p-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {zoneTravelOptions?.zoneInfo && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xl">{zoneTravelOptions.zoneInfo.icon}</span>
              <span className="text-amber-200 font-semibold">
                {zoneTravelOptions.zoneInfo.name}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-1 bg-gray-800/50 rounded-lg p-1">
          <button
            className={`px-3 py-1 rounded text-sm transition-colors ${
              viewMode === 'list'
                ? 'bg-amber-700 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
          <button
            className={`px-3 py-1 rounded text-sm transition-colors ${
              viewMode === 'map'
                ? 'bg-amber-700 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setViewMode('map')}
          >
            Map
          </button>
        </div>
      </div>

      {/* Zone Info */}
      {zoneTravelOptions?.zoneInfo && (
        <p className="text-xs text-gray-400 mb-4">
          {zoneTravelOptions.zoneInfo.description}
        </p>
      )}

      {/* Map View */}
      {viewMode === 'map' && mapLocations.length > 0 && (
        <div className="mb-4">
          <TravelMap
            locations={mapLocations}
            currentLocationId={location._id}
            playerEnergy={playerEnergy}
            onTravelClick={handleMapTravel}
          />
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {/* Local Connections */}
          {zoneTravelOptions && zoneTravelOptions.localConnections.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-amber-400 mb-3">
                Nearby Locations
              </h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {zoneTravelOptions.localConnections.map((dest) => {
                  const connection = location.connections.find(
                    (c) => c.targetLocationId === dest._id
                  );
                  const energyCost = connection?.energyCost || 10;
                  const canAfford = playerEnergy >= energyCost;

                  return (
                    <div
                      key={dest._id}
                      className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-amber-600 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{dest.icon || '📍'}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-amber-300 truncate">
                            {dest.name}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {dest.shortDescription}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className={`text-sm ${
                            canAfford ? 'text-blue-400' : 'text-red-400'
                          }`}
                        >
                          ⚡ {energyCost}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => onTravel(dest._id)}
                          disabled={travelingTo === dest._id || !canAfford}
                        >
                          {travelingTo === dest._id ? 'Going...' : 'Go'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Zone Exits */}
          {zoneTravelOptions && zoneTravelOptions.zoneExits.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-purple-400 mb-3">
                Other Zones
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                Journey to major hubs in distant territories.
              </p>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {zoneTravelOptions.zoneExits.map((exit) => {
                  const canAfford = playerEnergy >= exit.energyCost;

                  return (
                    <div
                      key={exit.hub._id}
                      className="p-3 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-lg border border-purple-700/50 hover:border-purple-500 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{exit.hub.icon || '🏛️'}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-purple-200 truncate">
                            {exit.hub.name}
                          </h4>
                          <p className="text-xs text-purple-400 capitalize">
                            {exit.zone.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                        {exit.hub.shortDescription}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm ${
                            canAfford ? 'text-blue-400' : 'text-red-400'
                          }`}
                        >
                          ⚡ {exit.energyCost}
                        </span>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-purple-900/50 hover:bg-purple-800/50 border-purple-700"
                          onClick={() => onTravel(exit.hub._id)}
                          disabled={travelingTo === exit.hub._id || !canAfford}
                        >
                          {travelingTo === exit.hub._id ? 'Going...' : 'Journey'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fallback: Connected Locations */}
          {!zoneTravelOptions &&
            location.connectedLocations &&
            location.connectedLocations.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-amber-400 mb-3">Travel</h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {location.connectedLocations.map((dest) => {
                    const connection = location.connections.find(
                      (c) => c.targetLocationId === dest._id
                    );
                    const energyCost = connection?.energyCost || 10;
                    const canAfford = playerEnergy >= energyCost;

                    return (
                      <div
                        key={dest._id}
                        className="p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{dest.icon || '📍'}</span>
                          <div>
                            <h4 className="font-semibold text-amber-300">
                              {dest.name}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {dest.shortDescription}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span
                            className={`text-sm ${
                              canAfford ? 'text-blue-400' : 'text-red-400'
                            }`}
                          >
                            ⚡ {energyCost}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => onTravel(dest._id)}
                            disabled={travelingTo === dest._id || !canAfford}
                          >
                            {travelingTo === dest._id ? 'Going...' : 'Go'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* No destinations */}
          {!zoneTravelOptions &&
            (!location.connectedLocations ||
              location.connectedLocations.length === 0) && (
              <p className="text-center text-gray-500 py-4">
                No travel destinations available from this location.
              </p>
            )}
        </>
      )}
    </Card>
  );
}

export default TravelPanel;
