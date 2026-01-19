/**
 * Location Hub Page
 * Main orchestration page for the location system
 * Coordinates all location sub-components and handles navigation
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, LoadingSpinner } from '@/components/ui';
import { LocationHeader, LocationActivityTabs, TravelPanel, ActionModal } from '@/components/location';
import { LocationGraveyard } from '@/components/location/LocationGraveyard';
import { SaloonLocationView } from '@/components/saloon';
import { TavernTables } from '@/components/tavern';
import { useLocationStore } from '@/store/useLocationStore';
import { useCharacterStore } from '@/store/useCharacterStore';

// Sub-components
import { LocationBuildings } from './LocationBuildings';
import { LocationActions } from './LocationActions';
import { LocationJobs } from './LocationJobs';
import { LocationShops } from './LocationShops';
import { LocationNPCs } from './LocationNPCs';
import { LocationTraining } from './LocationTraining';
import { LocationHostiles } from './LocationHostiles';

/**
 * Location types that support card tables
 */
const SALOON_TYPES = ['saloon', 'worker_tavern', 'cantina', 'tavern'];

const isSaloonLocation = (locationType: string): boolean => {
  return SALOON_TYPES.includes(locationType.toLowerCase());
};

export const LocationHub: React.FC = () => {
  const { currentCharacter, refreshCharacter } = useCharacterStore();
  const {
    location,
    isLoading,
    error,
    activeTab,
    buildings,
    zoneTravelOptions,
    allLocations,
    travelingTo,
    selectedAction,
    fetchLocation,
    setActiveTab,
    setSelectedAction,
    handleExitBuilding,
    handleTravel,
    fetchLocationActions,
    clearError,
  } = useLocationStore();
  const navigate = useNavigate();

  // Fetch location on mount and when character changes
  useEffect(() => {
    if (currentCharacter) {
      fetchLocation();
    }
  }, [currentCharacter, fetchLocation]);

  const handleRefresh = async () => {
    await refreshCharacter();
    await fetchLocation();
  };

  const handleActionComplete = (_success: boolean, _rewards?: { gold?: number; xp?: number; items?: any[] }) => {
    setSelectedAction(null);
    refreshCharacter();
    fetchLocationActions();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => { clearError(); fetchLocation(); }}>Retry</Button>
        </Card>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <p className="text-gray-500">No location data</p>
        </Card>
      </div>
    );
  }

  // Check if we're in a parent town (has buildings)
  const isParentTown = buildings.length > 0;

  // Check if we're inside a building
  const isInsideBuilding = !!location.parentId;

  // Check if this is a saloon location
  const isSaloon = isSaloonLocation(location.type);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Exit Building Button */}
      {isInsideBuilding && (
        <div className="flex justify-start">
          <Button
            onClick={async () => {
              await handleExitBuilding();
              await refreshCharacter();
            }}
            variant="secondary"
            className="bg-gray-800/80 hover:bg-gray-700/80 border-gray-600"
          >
            ← Exit Building
          </Button>
        </div>
      )}

      {/* Saloon Location View - Immersive saloon experience */}
      {isSaloon ? (
        <SaloonLocationView
          location={{
            id: location._id,
            name: location.name,
            type: location.type,
            shortDescription: location.shortDescription,
            description: location.description,
            icon: location.icon,
            atmosphere: location.atmosphere,
            dangerLevel: location.dangerLevel,
            factionInfluence: location.factionInfluence,
            features: location.features || [],
            npcs: location.npcs,
            connections: location.connections?.map(conn => ({
              targetId: conn.targetLocationId,
              targetName: conn.description || conn.targetLocationId,
              travelCost: conn.energyCost,
              isLocked: false
            })) || []
          }}
          onRefresh={handleRefresh}
          onTravel={handleTravel}
          onNPCInteract={(npcId) => {
            const npc = location.npcs.find(n => n.id === npcId);
            if (npc) {
              useLocationStore.getState().setSelectedNPC(npc);
            }
          }}
          gamblingTablesSlot={
            <TavernTables
              locationId={location._id}
              locationName={location.name}
            />
          }
        />
      ) : (
        <>
          {/* Location Header */}
          <LocationHeader
            name={location.name}
            shortDescription={location.shortDescription}
            atmosphere={location.atmosphere}
            icon={location.icon}
            type={location.type}
            dangerLevel={location.dangerLevel}
            factionInfluence={location.factionInfluence}
            zoneInfo={zoneTravelOptions?.zoneInfo}
            isParentTown={isParentTown}
          />

          {/* Activity Tabs */}
          <LocationActivityTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            availableTabs={{
              hasJobs: !isParentTown && location.jobs.length > 0,
              hasCrimes: !isParentTown,
              hasTraining: location.type === 'skill_academy',
              hasCrafting: true,
              hasGathering: false,
              hasFishing: (location.fishingSpots?.length ?? 0) > 0,
              hasShops: !isParentTown && location.shops.length > 0,
              hasTravel: !!(zoneTravelOptions || (location.connectedLocations && location.connectedLocations.length > 0)),
            }}
          />
        </>
      )}

      {/* Buildings Section - Town buildings grid */}
      {!isSaloon && <LocationBuildings onRefresh={handleRefresh} />}

      {/* Location-Specific Actions */}
      {!isSaloon && !isParentTown && (activeTab === 'overview' || activeTab === 'crimes' || activeTab === 'craft') && (
        <LocationActions />
      )}

      {/* Jobs Section */}
      {!isSaloon && !isParentTown && (activeTab === 'overview' || activeTab === 'jobs') && (
        <LocationJobs onRefresh={handleRefresh} />
      )}

      {/* Shops Section */}
      {!isSaloon && !isParentTown && (activeTab === 'overview' || activeTab === 'shop') && (
        <LocationShops onRefresh={handleRefresh} />
      )}

      {/* NPCs Section */}
      {!isSaloon && !isParentTown && (
        <LocationNPCs />
      )}

      {/* Training Activities (Academy) */}
      {!isSaloon && (activeTab === 'overview' || activeTab === 'train') && (
        <LocationTraining onRefresh={handleRefresh} />
      )}

      {/* Fishing Section */}
      {!isSaloon && location.fishingSpots && location.fishingSpots.length > 0 &&
       (activeTab === 'overview' || activeTab === 'fish') && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-blue-400 mb-4">🎣 Fishing Spots</h2>
          <p className="text-sm text-gray-400 mb-4">
            Cast your line and try to catch some fish at these spots.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {location.fishingSpots.map(spot => (
              <div key={spot.spotId} className="p-4 bg-gradient-to-br from-blue-900/30 to-gray-800/50 rounded-lg border border-blue-700/50 hover:border-blue-500 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-200">{spot.name}</h3>
                    <p className="text-xs text-gray-400 capitalize">{spot.waterType}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-yellow-400">
                      {'⭐'.repeat(Math.ceil(spot.difficulty / 25))}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-2 line-clamp-2">{spot.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">🐟 {spot.commonFish.length} species</span>
                    {spot.legendaryFish && (
                      <span className="text-purple-400">👑 Legendary</span>
                    )}
                  </div>
                  {spot.scenicValue && (
                    <span className="text-cyan-400">🌄 {spot.scenicValue}% scenic</span>
                  )}
                </div>
                {spot.requiredLevel && spot.requiredLevel > (currentCharacter?.level || 1) ? (
                  <div className="mt-3 text-center text-xs text-red-400">
                    Requires Level {spot.requiredLevel}
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="mt-3 w-full bg-blue-900/50 hover:bg-blue-800/50 border-blue-700"
                    onClick={() => navigate(`/game/fishing?spot=${spot.spotId}`)}
                  >
                    Fish Here
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Hostile NPCs */}
      {!isSaloon && (
        <LocationHostiles onRefresh={handleRefresh} />
      )}

      {/* Graveyard Section */}
      {location && (
        <LocationGraveyard
          locationId={location._id}
          locationName={location.name}
          canClaim={true}
          compact
        />
      )}

      {/* Travel Section */}
      {!isSaloon && (zoneTravelOptions || (location.connectedLocations && location.connectedLocations.length > 0)) &&
       (activeTab === 'overview' || activeTab === 'travel') && (
        <TravelPanel
          location={location}
          zoneTravelOptions={zoneTravelOptions}
          allLocations={allLocations}
          playerEnergy={currentCharacter?.energy || 0}
          travelingTo={travelingTo}
          onTravel={handleTravel}
        />
      )}

      {/* Action Modal */}
      {selectedAction && (
        <ActionModal
          action={selectedAction}
          onClose={() => setSelectedAction(null)}
          onComplete={handleActionComplete}
        />
      )}
    </div>
  );
};

export default LocationHub;
