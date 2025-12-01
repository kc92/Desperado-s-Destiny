/**
 * Location Page
 * Shows current location with contextual actions, jobs, shops, and travel options
 */

import React, { useEffect, useState } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import { Card, Button, LoadingSpinner, Modal } from '@/components/ui';
import { api } from '@/services/api';

interface LocationJob {
  id: string;
  name: string;
  description: string;
  energyCost: number;
  cooldownMinutes: number;
  rewards: {
    goldMin: number;
    goldMax: number;
    xp: number;
    items?: string[];
  };
  requirements?: {
    minLevel?: number;
    requiredSkill?: string;
    skillLevel?: number;
  };
}

interface ShopItem {
  itemId: string;
  name: string;
  description: string;
  price: number;
  quantity?: number;
  requiredLevel?: number;
}

interface LocationShop {
  id: string;
  name: string;
  description: string;
  shopType: string;
  items: ShopItem[];
}

interface LocationNPC {
  id: string;
  name: string;
  title?: string;
  description: string;
  faction?: string;
  dialogue?: string[];
  quests?: string[];
}

interface LocationConnection {
  targetLocationId: string;
  energyCost: number;
  description?: string;
}

interface LocationData {
  _id: string;
  name: string;
  description: string;
  shortDescription: string;
  type: string;
  region: string;
  parentId?: string;
  icon?: string;
  atmosphere?: string;
  jobs: LocationJob[];
  shops: LocationShop[];
  npcs: LocationNPC[];
  connections: LocationConnection[];
  dangerLevel: number;
  factionInfluence: {
    settlerAlliance: number;
    nahiCoalition: number;
    frontera: number;
  };
  connectedLocations?: LocationData[];
}

interface TownBuilding {
  id: string;
  name: string;
  type: string;
  description: string;
  icon?: string;
  isOpen: boolean;
}

// Building type to icon/color mapping
const buildingConfig: Record<string, { icon: string; color: string }> = {
  saloon: { icon: '🍺', color: 'bg-amber-900/50 border-amber-700' },
  bank: { icon: '🏦', color: 'bg-emerald-900/50 border-emerald-700' },
  general_store: { icon: '🏪', color: 'bg-purple-900/50 border-purple-700' },
  sheriff_office: { icon: '⭐', color: 'bg-blue-900/50 border-blue-700' },
  hotel: { icon: '🏨', color: 'bg-rose-900/50 border-rose-700' },
  telegraph_office: { icon: '📨', color: 'bg-cyan-900/50 border-cyan-700' },
  church: { icon: '⛪', color: 'bg-slate-800/50 border-slate-600' },
  doctors_office: { icon: '🏥', color: 'bg-red-900/50 border-red-700' },
  blacksmith: { icon: '⚒️', color: 'bg-gray-800/50 border-gray-600' },
  stables: { icon: '🐎', color: 'bg-orange-900/50 border-orange-700' },
  government: { icon: '🏛️', color: 'bg-indigo-900/50 border-indigo-700' },
  mining_office: { icon: '⛏️', color: 'bg-stone-800/50 border-stone-600' },
  elite_club: { icon: '🎩', color: 'bg-violet-900/50 border-violet-700' },
  labor_exchange: { icon: '👷', color: 'bg-yellow-900/50 border-yellow-700' },
  worker_tavern: { icon: '🍻', color: 'bg-amber-800/50 border-amber-600' },
  tent_city: { icon: '⛺', color: 'bg-zinc-800/50 border-zinc-600' },
  laundry: { icon: '🧺', color: 'bg-sky-900/50 border-sky-700' },
  apothecary: { icon: '🧪', color: 'bg-teal-900/50 border-teal-700' },
  tea_house: { icon: '🍵', color: 'bg-green-900/50 border-green-700' },
  business: { icon: '💼', color: 'bg-neutral-800/50 border-neutral-600' },
  entertainment: { icon: '🎭', color: 'bg-pink-900/50 border-pink-700' },
  labor: { icon: '🔧', color: 'bg-orange-800/50 border-orange-600' },
  service: { icon: '🛎️', color: 'bg-blue-800/50 border-blue-600' },
  camp: { icon: '⛺', color: 'bg-zinc-800/50 border-zinc-600' },
  assay_office: { icon: '⚖️', color: 'bg-amber-800/50 border-amber-600' },
};

export const Location: React.FC = () => {
  const { currentCharacter, refreshCharacter } = useCharacterStore();

  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Job state
  const [performingJob, setPerformingJob] = useState<string | null>(null);
  const [jobResult, setJobResult] = useState<any>(null);

  // Shop state
  const [selectedShop, setSelectedShop] = useState<LocationShop | null>(null);
  const [purchaseResult, setPurchaseResult] = useState<any>(null);

  // Travel state
  const [travelingTo, setTravelingTo] = useState<string | null>(null);

  // NPC state
  const [selectedNPC, setSelectedNPC] = useState<LocationNPC | null>(null);

  // Crime state
  const [crimes, setCrimes] = useState<any[]>([]);
  const [crimesLoading, setCrimesLoading] = useState(false);

  // Buildings state
  const [buildings, setBuildings] = useState<TownBuilding[]>([]);
  const [buildingsLoading, setBuildingsLoading] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<TownBuilding | null>(null);

  // Fetch current location
  const fetchLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/locations/current');
      const locationData = response.data.data.location;
      setLocation(locationData);

      // Fetch location-specific crimes and buildings
      if (locationData?._id) {
        fetchCrimes(locationData._id);
        fetchBuildings(locationData._id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load location');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch crimes available at this location
  const fetchCrimes = async (locationId: string) => {
    try {
      setCrimesLoading(true);
      const response = await api.get(`/actions?locationId=${locationId}`);
      const crimeActions = response.data.data.actions?.CRIME || [];
      setCrimes(crimeActions);
    } catch (err: any) {
      console.error('Failed to fetch crimes:', err);
    } finally {
      setCrimesLoading(false);
    }
  };

  // Fetch buildings for this town
  const fetchBuildings = async (locationId: string) => {
    try {
      setBuildingsLoading(true);
      const response = await api.get(`/locations/${locationId}/buildings`);
      if (response.data.success && response.data.data?.buildings) {
        setBuildings(response.data.data.buildings);
      }
    } catch (err: any) {
      console.error('Failed to fetch buildings:', err);
      setBuildings([]);
    } finally {
      setBuildingsLoading(false);
    }
  };

  // Handle entering a building
  const handleEnterBuilding = async (buildingId: string) => {
    try {
      await api.post(`/locations/buildings/${buildingId}/enter`);
      setSelectedBuilding(null);
      await refreshCharacter();
      await fetchLocation();
    } catch (err: any) {
      console.error('Failed to enter building:', err);
    }
  };

  // Handle exiting a building
  const handleExitBuilding = async () => {
    try {
      await api.post('/locations/buildings/exit');
      await refreshCharacter();
      await fetchLocation();
    } catch (err: any) {
      console.error('Failed to exit building:', err);
      setError(err.response?.data?.message || 'Failed to exit building');
    }
  };

  useEffect(() => {
    if (currentCharacter) {
      fetchLocation();
    }
  }, [currentCharacter]);

  // Perform a job
  const handlePerformJob = async (jobId: string) => {
    try {
      setPerformingJob(jobId);
      setJobResult(null);
      const response = await api.post(`/locations/current/jobs/${jobId}`);
      setJobResult(response.data.data.result);
      await refreshCharacter();
    } catch (err: any) {
      setJobResult({
        success: false,
        message: err.response?.data?.message || 'Failed to perform job'
      });
    } finally {
      setPerformingJob(null);
    }
  };

  // Purchase an item
  const handlePurchase = async (shopId: string, itemId: string) => {
    try {
      setPurchaseResult(null);
      const response = await api.post(`/locations/current/shops/${shopId}/purchase`, { itemId });
      setPurchaseResult(response.data.data.result);
      await refreshCharacter();
    } catch (err: any) {
      setPurchaseResult({
        success: false,
        message: err.response?.data?.message || 'Failed to purchase item'
      });
    }
  };

  // Travel to location
  const handleTravel = async (targetId: string) => {
    try {
      setTravelingTo(targetId);
      const response = await api.post('/locations/travel', { targetLocationId: targetId });
      await refreshCharacter();
      setLocation(response.data.data.result.newLocation);
      setTravelingTo(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to travel');
      setTravelingTo(null);
    }
  };

  // Get danger level color
  const getDangerColor = (level: number) => {
    if (level <= 3) return 'text-green-500';
    if (level <= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Get danger level text
  const getDangerText = (level: number) => {
    if (level <= 2) return 'Safe';
    if (level <= 4) return 'Moderate';
    if (level <= 6) return 'Dangerous';
    if (level <= 8) return 'Very Dangerous';
    return 'Extremely Dangerous';
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
          <Button onClick={fetchLocation}>Retry</Button>
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

  // Check if we're in a parent town (has buildings) - hide individual sections
  const isParentTown = buildings.length > 0;

  // Check if we're inside a building (has a parent location)
  const isInsideBuilding = !!location?.parentId;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Exit Building Button */}
      {isInsideBuilding && (
        <div className="flex justify-start">
          <Button
            onClick={handleExitBuilding}
            variant="secondary"
            className="bg-gray-800/80 hover:bg-gray-700/80 border-gray-600"
          >
            ← Exit Building
          </Button>
        </div>
      )}

      {/* Location Header */}
      <Card className="p-6 bg-gradient-to-r from-amber-900/50 to-amber-800/50 border-amber-700">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-amber-100 flex items-center gap-2">
              <span className="text-4xl">{location.icon || '📍'}</span>
              {location.name}
            </h1>
            <p className="text-amber-200/80 mt-2">{location.shortDescription}</p>
          </div>
          <div className="text-right">
            <p className={`font-semibold ${getDangerColor(location.dangerLevel)}`}>
              {getDangerText(location.dangerLevel)}
            </p>
            <p className="text-sm text-gray-400">Danger Level: {location.dangerLevel}/10</p>
          </div>
        </div>

        {location.atmosphere && (
          <div className="mt-4 p-4 bg-black/20 rounded-lg italic text-amber-100/70">
            {location.atmosphere}
          </div>
        )}

        <p className="mt-4 text-gray-300">{location.description}</p>

        {/* Faction Influence */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div className="text-center p-2 bg-blue-900/30 rounded">
            <p className="font-semibold text-blue-400">Settlers</p>
            <p>{location.factionInfluence.settlerAlliance}%</p>
          </div>
          <div className="text-center p-2 bg-green-900/30 rounded">
            <p className="font-semibold text-green-400">Coalition</p>
            <p>{location.factionInfluence.nahiCoalition}%</p>
          </div>
          <div className="text-center p-2 bg-red-900/30 rounded">
            <p className="font-semibold text-red-400">Frontera</p>
            <p>{location.factionInfluence.frontera}%</p>
          </div>
        </div>
      </Card>

      {/* Buildings Section */}
      {buildings.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-amber-400">🏛️ Town Buildings</h2>
            <span className="text-sm text-gray-400">{buildings.length} locations</span>
          </div>

          {buildingsLoading ? (
            <div className="text-center py-4">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {buildings.map((building) => {
                const config = buildingConfig[building.type] || {
                  icon: building.icon || '🏠',
                  color: 'bg-gray-800/50 border-gray-600'
                };

                return (
                  <button
                    key={building.id}
                    onClick={() => setSelectedBuilding(building)}
                    className={`${config.color} border rounded-lg p-3 text-left transition-all hover:scale-[1.02] ${
                      building.isOpen ? 'hover:border-amber-500' : 'opacity-60 cursor-not-allowed'
                    }`}
                    disabled={!building.isOpen}
                    data-testid={`building-${building.id}`}
                    data-building-name={building.name}
                    data-building-type={building.type}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">{config.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">
                          {building.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {building.description}
                        </p>
                        {!building.isOpen && (
                          <span className="text-xs text-red-400 font-bold mt-1 block">CLOSED</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Building Detail Modal */}
      {selectedBuilding && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedBuilding(null)}
          title={selectedBuilding.name}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">
                {buildingConfig[selectedBuilding.type]?.icon || selectedBuilding.icon || '🏠'}
              </span>
              <div>
                <p className="text-sm text-gray-400 capitalize">
                  {selectedBuilding.type.replace(/_/g, ' ')}
                </p>
                <p className={selectedBuilding.isOpen ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>
                  {selectedBuilding.isOpen ? '● Open' : '● Closed'}
                </p>
              </div>
            </div>

            <p className="text-gray-300">{selectedBuilding.description}</p>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => handleEnterBuilding(selectedBuilding.id)}
                disabled={!selectedBuilding.isOpen}
                className="flex-1"
              >
                Enter Building
              </Button>
              <Button
                variant="secondary"
                onClick={() => setSelectedBuilding(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Jobs Section - Only show when inside a building, not in parent town */}
      {!isParentTown && location.jobs.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-amber-400 mb-4">💼 Available Jobs</h2>

          {jobResult && (
            <div className={`mb-4 p-3 rounded ${jobResult.success ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
              <p>{jobResult.message}</p>
              {jobResult.success && (
                <p className="text-sm mt-1">
                  Earned: {jobResult.goldEarned} gold, {jobResult.xpEarned} XP
                </p>
              )}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {location.jobs.map(job => (
              <div key={job.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <h3 className="font-semibold text-amber-300">{job.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{job.description}</p>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-blue-400">⚡ {job.energyCost} energy</span>
                  <span className="text-yellow-400">
                    💰 {job.rewards.goldMin}-{job.rewards.goldMax} gold
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {job.rewards.xp} XP • {job.cooldownMinutes}m cooldown
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handlePerformJob(job.id)}
                    disabled={performingJob === job.id || (currentCharacter?.energy || 0) < job.energyCost}
                  >
                    {performingJob === job.id ? 'Working...' : 'Work'}
                  </Button>
                </div>
                {job.requirements?.minLevel && job.requirements.minLevel > 1 && (
                  <p className="text-xs text-orange-400 mt-1">
                    Requires level {job.requirements.minLevel}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Crimes Section - Only show when inside a building, not in parent town */}
      {!isParentTown && crimes.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-red-400 mb-4">🔫 Criminal Opportunities</h2>

          {crimesLoading ? (
            <div className="text-center py-4">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {crimes.map(crime => (
                <div key={crime._id} className="p-4 bg-gray-800/50 rounded-lg border border-red-900/50">
                  <h3 className="font-semibold text-red-300">{crime.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{crime.description}</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-blue-400">⚡ {crime.energyCost} energy</span>
                    <span className="text-yellow-400">
                      💰 {crime.rewards?.gold || 0} gold
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Difficulty: {crime.difficulty}
                    </span>
                    <span className="text-red-400">
                      ⚠️ +{crime.crimeProperties?.wantedLevelIncrease || 1} wanted
                    </span>
                  </div>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full bg-red-900/50 hover:bg-red-800/50 border-red-700"
                      onClick={() => {
                        // Store crime data and navigate to action challenge
                        sessionStorage.setItem('selectedAction', JSON.stringify(crime));
                        window.location.href = '/game/action-challenge';
                      }}
                      disabled={(currentCharacter?.energy || 0) < crime.energyCost}
                    >
                      Attempt Crime
                    </Button>
                  </div>
                  {crime.crimeProperties?.jailTimeOnFailure && (
                    <p className="text-xs text-red-400/70 mt-2 text-center">
                      ⛓️ {crime.crimeProperties.jailTimeOnFailure}m jail on failure
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Shops Section - Only show when inside a building, not in parent town */}
      {!isParentTown && location.shops.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-amber-400 mb-4">🏪 Shops</h2>

          {purchaseResult && (
            <div className={`mb-4 p-3 rounded ${purchaseResult.success ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
              {purchaseResult.message}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {location.shops.map(shop => (
              <div key={shop.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <h3 className="font-semibold text-amber-300">{shop.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{shop.description}</p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3 w-full"
                  onClick={() => setSelectedShop(shop)}
                >
                  Browse ({shop.items.length} items)
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* NPCs Section - Only show when inside a building, not in parent town */}
      {!isParentTown && location.npcs.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-amber-400 mb-4">👤 People Here</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {location.npcs.map(npc => (
              <div
                key={npc.id}
                className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 cursor-pointer hover:border-amber-500 transition-colors"
                onClick={() => setSelectedNPC(npc)}
              >
                <h3 className="font-semibold text-amber-300">{npc.name}</h3>
                {npc.title && <p className="text-xs text-gray-500">{npc.title}</p>}
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{npc.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Travel Section */}
      {location.connectedLocations && location.connectedLocations.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold text-amber-400 mb-4">🗺️ Travel</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {location.connectedLocations.map(dest => {
              const connection = location.connections.find(c => c.targetLocationId === dest._id);
              const energyCost = connection?.energyCost || 10;
              return (
                <div
                  key={dest._id}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                  data-testid={`travel-destination-${dest._id}`}
                  data-location-name={dest.name}
                  data-location-type={dest.type}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{dest.icon || '📍'}</span>
                    <div>
                      <h3 className="font-semibold text-amber-300">{dest.name}</h3>
                      <p className="text-xs text-gray-500">{dest.shortDescription}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-blue-400">⚡ {energyCost} energy</span>
                    <Button
                      size="sm"
                      onClick={() => handleTravel(dest._id)}
                      disabled={travelingTo === dest._id || (currentCharacter?.energy || 0) < energyCost}
                      data-testid={`travel-button-${dest._id}`}
                    >
                      {travelingTo === dest._id ? 'Traveling...' : 'Go'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Shop Modal */}
      {selectedShop && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedShop(null);
            setPurchaseResult(null);
          }}
          title={selectedShop.name}
        >
          <div className="space-y-4">
            <p className="text-gray-400">{selectedShop.description}</p>

            {purchaseResult && (
              <div className={`p-3 rounded ${purchaseResult.success ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                {purchaseResult.message}
              </div>
            )}

            <div className="space-y-2">
              {selectedShop.items.map(item => (
                <div key={item.itemId} className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                  <div>
                    <p className="font-semibold text-amber-300">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.description}</p>
                    {item.requiredLevel && item.requiredLevel > 1 && (
                      <p className="text-xs text-orange-400">Requires level {item.requiredLevel}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-semibold">{item.price}g</p>
                    <Button
                      size="sm"
                      onClick={() => handlePurchase(selectedShop.id, item.itemId)}
                      disabled={(currentCharacter?.gold || 0) < item.price}
                    >
                      Buy
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* NPC Modal */}
      {selectedNPC && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedNPC(null)}
          title={selectedNPC.name}
        >
          <div className="space-y-4">
            {selectedNPC.title && (
              <p className="text-amber-400 text-sm">{selectedNPC.title}</p>
            )}
            <p className="text-gray-300">{selectedNPC.description}</p>

            {selectedNPC.dialogue && selectedNPC.dialogue.length > 0 && (
              <div className="p-4 bg-gray-800/50 rounded-lg italic text-gray-400">
                "{selectedNPC.dialogue[Math.floor(Math.random() * selectedNPC.dialogue.length)]}"
              </div>
            )}

            {selectedNPC.quests && selectedNPC.quests.length > 0 && (
              <div className="mt-4">
                <p className="text-amber-400 text-sm font-semibold mb-2">Available Quests</p>
                {selectedNPC.quests.map(quest => (
                  <Button key={quest} size="sm" variant="secondary" className="mr-2 mb-2">
                    {quest}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Location;
