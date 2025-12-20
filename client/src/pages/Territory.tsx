/**
 * Territory Page
 * Interactive map of Sangre Territory with location details and navigation
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useActionStore } from '@/store/useActionStore';
import { useTerritoryStore } from '@/store/useTerritoryStore';
import { Card, Button } from '@/components/ui';
import type { Territory as TerritoryData } from '@desperados/shared';
// import { formatDistanceToNow } from 'date-fns';

interface TerritoryLocation {
  id: string;
  name: string;
  type: 'town' | 'wilderness' | 'outpost' | 'hideout';
  faction: string;
  controlledBy?: string;
  population: number;
  dangerLevel: number;
  coordinates: { x: number; y: number };
  description: string;
  availableActions: string[];
  playerCount?: number;
}

/**
 * Territory exploration and map page
 */
export const Territory: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentCharacter,
    currentLocation,
    setLocation,
  } = useCharacterStore();
  const {
    fetchActions,
  } = useActionStore();

  // Use territory store instead of local state
  const {
    territories: storeData,
    isLoading,
    error: storeError,
    fetchTerritories,
  } = useTerritoryStore();

  // Local UI state
  const [selectedTerritory, setSelectedTerritory] = useState<TerritoryLocation | null>(null);
  const [travelTime, setTravelTime] = useState<number>(0);
  const [isTraveling, setIsTraveling] = useState(false);

  // Convert Territory[] from store to TerritoryLocation[] for UI
  // This is a temporary mapping layer until we fully migrate to Territory types
  const territories: TerritoryLocation[] = storeData.length > 0
    ? storeData.map(mapTerritoryToLocation)
    : getMockTerritories();

  // Load territories on mount and set current location as selected
  useEffect(() => {
    fetchTerritories();
  }, [fetchTerritories]);

  // Set current location as selected when territories load
  useEffect(() => {
    if (territories.length > 0 && currentLocation && !selectedTerritory) {
      const current = territories.find((t) => t.name === currentLocation);
      if (current) {
        setSelectedTerritory(current);
      }
    }
  }, [territories, currentLocation, selectedTerritory]);

  /**
   * Map Territory from store to TerritoryLocation for UI
   * This is a temporary adapter until we fully migrate to Territory types
   */
  function mapTerritoryToLocation(territory: TerritoryData): TerritoryLocation {
    return {
      id: territory.id,
      name: territory.name,
      type: 'town', // Default type - could be enhanced based on territory data
      faction: territory.faction,
      controlledBy: territory.controllingGangName || territory.faction,
      population: 0, // Not available in Territory type
      dangerLevel: territory.difficulty,
      coordinates: territory.position || { x: 50, y: 50 },
      description: territory.description,
      availableActions: [], // Not available in Territory type
      playerCount: undefined, // Not available in Territory type
    };
  }

  function getMockTerritories(): TerritoryLocation[] { return [
    {
      id: 'dusty-gulch',
      name: 'Dusty Gulch',
      type: 'town',
      faction: 'Settler Alliance',
      controlledBy: 'Settler Alliance',
      population: 850,
      dangerLevel: 2,
      coordinates: { x: 50, y: 30 },
      description: 'A bustling frontier town with saloons, shops, and opportunities.',
      availableActions: ['shop', 'gamble', 'work', 'rest'],
      playerCount: 12
    },
    {
      id: 'crimson-canyon',
      name: 'Crimson Canyon',
      type: 'wilderness',
      faction: 'Contested',
      population: 0,
      dangerLevel: 4,
      coordinates: { x: 75, y: 45 },
      description: 'Dangerous canyon known for bandits and hidden treasures.',
      availableActions: ['explore', 'hunt', 'mine'],
      playerCount: 3
    },
    {
      id: 'fort-salvation',
      name: 'Fort Salvation',
      type: 'outpost',
      faction: 'Frontera Collective',
      controlledBy: 'Frontera Collective',
      population: 350,
      dangerLevel: 1,
      coordinates: { x: 25, y: 60 },
      description: 'Military outpost offering protection and lawful work.',
      availableActions: ['enlist', 'trade', 'rest'],
      playerCount: 8
    },
    {
      id: 'shadow-ridge',
      name: 'Shadow Ridge',
      type: 'hideout',
      faction: 'Nahi Coalition',
      controlledBy: 'Black Rose Gang',
      population: 75,
      dangerLevel: 5,
      coordinates: { x: 90, y: 20 },
      description: 'Notorious gang hideout. Enter at your own risk.',
      availableActions: ['fence', 'recruit', 'raid'],
      playerCount: 5
    }
  ]; }

  const calculateTravelTime = (from: TerritoryLocation, to: TerritoryLocation) => {
    const distance = Math.sqrt(
      Math.pow(to.coordinates.x - from.coordinates.x, 2) +
      Math.pow(to.coordinates.y - from.coordinates.y, 2)
    );
    return Math.ceil(distance * 100); // milliseconds
  };

  const handleTravel = async (territory: TerritoryLocation) => {
    if (!currentCharacter || isTraveling) return;

    const current = territories.find(t => t.name === currentLocation);
    if (!current) return;

    const time = calculateTravelTime(current, territory);
    setTravelTime(time);
    setIsTraveling(true);

    // Simulate travel time
    setTimeout(async () => {
      setLocation(territory.name);
      await fetchActions(territory.id);
      setSelectedTerritory(territory);
      setIsTraveling(false);
      setTravelTime(0);
    }, Math.min(time, 3000)); // Cap at 3 seconds for demo
  };

  const getDangerColor = (level: number) => {
    if (level <= 1) return 'text-green-600';
    if (level <= 2) return 'text-yellow-600';
    if (level <= 3) return 'text-orange-600';
    if (level <= 4) return 'text-red-600';
    return 'text-red-800';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'town': return '🏘️';
      case 'wilderness': return '🏜️';
      case 'outpost': return '🏰';
      case 'hideout': return '🏚️';
      default: return '📍';
    }
  };

  if (!currentCharacter) {
    return (
      <div className="text-center py-12">
        <p className="text-desert-sand">No character selected</p>
        <Button onClick={() => navigate('/character-select')} className="mt-4">
          Select Character
        </Button>
      </div>
    );
  }

  // Show loading state
  if (isLoading && territories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-desert-sand">Loading territories...</p>
      </div>
    );
  }

  // Show error state if store error exists and no fallback data
  if (storeError && territories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error loading territories: {storeError}</p>
        <Button onClick={() => fetchTerritories()} variant="primary">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card variant="leather">
        <div className="p-6">
          <h1 className="text-3xl font-western text-gold-light mb-2">
            Sangre Territory Map
          </h1>
          <p className="text-desert-sand font-serif">
            Current Location: <span className="text-gold-light font-bold">
              {currentLocation || 'Unknown'}
            </span>
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <div className="lg:col-span-2">
          <Card variant="parchment" className="h-[500px] relative">
            <div className="absolute inset-0 p-6">
              <h2 className="text-xl font-western text-wood-dark mb-4">
                Territory Overview
              </h2>

              {/* Simple ASCII Map */}
              <div className="bg-desert-sand/10 rounded p-4 font-mono text-xs overflow-auto h-[400px]">
                <pre className="text-wood-dark">
{`    SANGRE TERRITORY - 1875
    ═══════════════════════════════════════════

         Shadow Ridge ⛰️
              [NH]

                        🏘️ Dusty Gulch
                       [SA]

    🏰 Fort Salvation         🏜️ Crimson
        [FC]                     Canyon
                                [--]

    ═══════════════════════════════════════════
    [SA] Settler Alliance  [FC] Frontera Collective
    [NH] Nahi Coalition    [--] Contested
`}
                </pre>
              </div>

              {/* Location Grid */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {territories.map((territory) => (
                  <button
                    key={territory.id}
                    onClick={() => setSelectedTerritory(territory)}
                    className={`
                      text-left p-2 rounded transition-all
                      ${selectedTerritory?.id === territory.id
                        ? 'bg-gold-light/20 border-gold-light border'
                        : 'hover:bg-wood-grain/10'
                      }
                      ${territory.name === currentLocation
                        ? 'ring-2 ring-green-600'
                        : ''
                      }
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTypeIcon(territory.type)}</span>
                      <div className="flex-1">
                        <div className="font-bold text-wood-dark text-sm">
                          {territory.name}
                        </div>
                        <div className="text-xs text-wood-grain">
                          {territory.faction}
                        </div>
                      </div>
                      {territory.playerCount && territory.playerCount > 0 && (
                        <span className="text-xs bg-gold-light/20 px-1 rounded">
                          👤 {territory.playerCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Location Details */}
        <div>
          <Card variant="wood">
            <div className="p-6">
              <h2 className="text-xl font-western text-desert-sand mb-4">
                Location Details
              </h2>

              {selectedTerritory ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-gold-light flex items-center gap-2">
                      {getTypeIcon(selectedTerritory.type)}
                      {selectedTerritory.name}
                    </h3>
                    <p className="text-sm text-desert-stone mt-1">
                      {selectedTerritory.description}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-desert-stone">Type:</span>
                      <span className="text-desert-sand capitalize">
                        {selectedTerritory.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-desert-stone">Faction:</span>
                      <span className="text-desert-sand">
                        {selectedTerritory.faction}
                      </span>
                    </div>
                    {selectedTerritory.population > 0 && (
                      <div className="flex justify-between">
                        <span className="text-desert-stone">Population:</span>
                        <span className="text-desert-sand">
                          {selectedTerritory.population.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-desert-stone">Danger Level:</span>
                      <span className={getDangerColor(selectedTerritory.dangerLevel)}>
                        {'★'.repeat(selectedTerritory.dangerLevel)}
                      </span>
                    </div>
                    {selectedTerritory.playerCount !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-desert-stone">Players Here:</span>
                        <span className="text-desert-sand">
                          {selectedTerritory.playerCount}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedTerritory.availableActions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-desert-sand mb-2">
                        Available Actions:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTerritory.availableActions.map((action) => (
                          <span
                            key={action}
                            className="px-2 py-1 bg-leather/20 rounded text-xs text-desert-sand capitalize"
                          >
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTerritory.name !== currentLocation && (
                    <Button
                      variant="primary"
                      onClick={() => handleTravel(selectedTerritory)}
                      disabled={isTraveling}
                      className="w-full"
                    >
                      {isTraveling ? (
                        <>
                          <span className="animate-pulse">Traveling...</span>
                          {travelTime > 0 && (
                            <span className="ml-2 text-xs">
                              ({Math.ceil(travelTime / 1000)}s)
                            </span>
                          )}
                        </>
                      ) : (
                        'Travel Here'
                      )}
                    </Button>
                  )}

                  {selectedTerritory.name === currentLocation && (
                    <div className="text-center text-green-600 font-bold">
                      📍 You are here
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-desert-stone text-center py-8">
                  Select a location on the map to view details
                </p>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card variant="leather" className="mt-4">
            <div className="p-6">
              <h3 className="text-lg font-western text-desert-sand mb-3">
                Quick Travel
              </h3>
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const town = territories.find(t => t.type === 'town');
                    if (town) handleTravel(town);
                  }}
                  className="w-full"
                  disabled={isTraveling}
                >
                  🏘️ Nearest Town
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const safe = territories.reduce((min, t) =>
                      t.dangerLevel < min.dangerLevel ? t : min
                    );
                    handleTravel(safe);
                  }}
                  className="w-full"
                  disabled={isTraveling}
                >
                  🛡️ Safest Location
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/game')}
                  className="w-full"
                >
                  ← Back to Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};