/**
 * Town Hub Page
 * Main location-based hub where players interact with the town
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Beer,
  Shield,
  Landmark,
  ShoppingBag,
  Tractor,
  Train,
  HeartPulse,
  Hammer,
  MapPin,
  Zap,
  Coins,
  AlertCircle,
} from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useEnergyStore } from '@/store/useEnergyStore';
import { locationService } from '@/services/location.service';
import type { Location } from '@desperados/shared';

// Icon mapping for building types
const buildingIcons: Record<string, React.ElementType> = {
  town_square: Building2,
  saloon: Beer,
  sheriff_office: Shield,
  bank: Landmark,
  general_store: ShoppingBag,
  stables: Tractor,
  train_station: Train,
  doctors_office: HeartPulse,
  blacksmith: Hammer,
};

// Color themes for buildings
const buildingColors: Record<string, string> = {
  saloon: 'bg-amber-900/50 hover:bg-amber-900/70 border-amber-700',
  sheriff_office: 'bg-blue-900/50 hover:bg-blue-900/70 border-blue-700',
  bank: 'bg-emerald-900/50 hover:bg-emerald-900/70 border-emerald-700',
  general_store: 'bg-purple-900/50 hover:bg-purple-900/70 border-purple-700',
  stables: 'bg-orange-900/50 hover:bg-orange-900/70 border-orange-700',
  train_station: 'bg-slate-800/50 hover:bg-slate-800/70 border-slate-600',
  doctors_office: 'bg-red-900/50 hover:bg-red-900/70 border-red-700',
  blacksmith: 'bg-gray-800/50 hover:bg-gray-800/70 border-gray-600',
  town_square: 'bg-yellow-900/50 hover:bg-yellow-900/70 border-yellow-700',
};

const Town: React.FC = () => {
  const navigate = useNavigate();
    const { currentCharacter: character } = useCharacterStore();
  const { energy } = useEnergyStore();
  const [buildings, setBuildings] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTownData();
  }, []);

  const loadTownData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load town buildings
      const buildingsResult = await locationService.getAllLocations('town');
      if (buildingsResult.success && buildingsResult.data) {
        setBuildings(buildingsResult.data.locations);
      }

      // Load current location
      const locationResult = await locationService.getCurrentLocation();
      if (locationResult.success && locationResult.data) {
        setCurrentLocation(locationResult.data.location);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load town data');
    } finally {
      setLoading(false);
    }
  };

  const handleBuildingClick = async (building: Location) => {
    // Navigate to the building's specific page or show actions
    const buildingRoutes: Record<string, string> = {
      saloon: '/game/saloon',
      sheriff_office: '/game/sheriff',
      bank: '/game/bank',
      general_store: '/game/shop',
      stables: '/game/stables',
      train_station: '/game/travel',
      doctors_office: '/game/doctor',
      blacksmith: '/game/blacksmith',
      town_square: '/game/town',
    };

    const route = buildingRoutes[building.type];
    if (route) {
      // Travel to the building
      const travelResult = await locationService.travel(building.id);
      if (travelResult.success) {
        setCurrentLocation(building);
        // For now, show location-specific content
        // In future, navigate to specific building pages
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Frontera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 p-4">
      {/* Header - Character Status */}
      <div className="max-w-6xl mx-auto mb-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <div className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Location</p>
                  <p className="font-semibold text-amber-400">
                    {currentLocation?.name || 'Town Square'}
                  </p>
                </div>
              </div>

              {/* Character Name & Level */}
              <div className="text-center">
                <p className="text-lg font-bold text-white">{character?.name}</p>
                <p className="text-xs text-gray-400">Level {character?.level}</p>
              </div>

              {/* Energy */}
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Energy</p>
                  <p className="font-semibold text-blue-400">
                    {Math.floor(energy?.currentEnergy || 0)} / {energy?.maxEnergy || 100}
                  </p>
                </div>
              </div>

              {/* Gold */}
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-xs text-gray-500 uppercase">Gold</p>
                  <p className="font-semibold text-yellow-400">
                    ${character?.gold?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Town Title */}
      <div className="max-w-6xl mx-auto mb-6 text-center">
        <h1 className="text-3xl font-bold text-amber-500 mb-2">Frontera</h1>
        <p className="text-gray-400">
          {currentLocation?.atmosphere || 'The sun beats down on the dusty streets of this frontier town.'}
        </p>
      </div>

      {/* Buildings Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildings
            .filter(b => b.type !== 'town_square')
            .map((building) => {
              const Icon = buildingIcons[building.type] || Building2;
              const colorClass = buildingColors[building.type] || 'bg-gray-800/50 hover:bg-gray-800/70 border-gray-600';

              return (
                <button
                  key={building.id}
                  onClick={() => handleBuildingClick(building)}
                  className={`${colorClass} border rounded-lg p-4 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-black/30 rounded-lg">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">
                        {building.name}
                      </h3>
                      <p className="text-sm text-gray-300 mt-1">
                        {building.shortDescription}
                      </p>
                      {building.availableActions && building.availableActions.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          {building.availableActions.length} actions available
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-6xl mx-auto mt-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Quick Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/game/actions')}
              >
                All Actions
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/game/skills')}
              >
                Skills
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/game/inventory')}
              >
                Inventory
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/game/gang')}
              >
                Gang
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/game/mail')}
              >
                Mail
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Feed Placeholder */}
      <div className="max-w-6xl mx-auto mt-6">
        <Card className="bg-gray-800/50 border-gray-700">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Recent Activity</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Welcome to Frontera, {character?.name}!</p>
              <p>Activity feed coming soon...</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Town;
