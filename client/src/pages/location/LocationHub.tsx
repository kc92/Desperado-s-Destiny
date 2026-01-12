/**
 * Location Hub Page
 * Main orchestration page for the location system
 * Coordinates all location sub-components and handles navigation
 */

import React, { useEffect } from 'react';
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
