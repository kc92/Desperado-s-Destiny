/**
 * TownBuildingsGrid Component
 * Grid display of all buildings in a town
 */

import React, { useEffect, useState } from 'react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { BuildingCard } from './BuildingCard';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface TownBuildingsGridProps {
  townId: string;
  townName: string;
  characterLevel: number;
  characterWantedLevel: number;
  isInGang: boolean;
  onBuildingEnter?: () => void;
}

type FilterCategory = 'all' | 'commerce' | 'services' | 'social' | 'faction';

const CATEGORY_FILTERS: Record<FilterCategory, string[]> = {
  all: [],
  commerce: ['general_store', 'bank', 'blacksmith', 'assay_office'],
  services: ['doctors_office', 'telegraph_office', 'stables', 'hotel'],
  social: ['saloon', 'church', 'cantina', 'fighting_pit'],
  faction: ['spirit_lodge', 'council_fire', 'medicine_lodge', 'smugglers_den', 'shrine'],
};

export const TownBuildingsGrid: React.FC<TownBuildingsGridProps> = ({
  townId,
  townName,
  characterLevel,
  characterWantedLevel,
  isInGang,
  onBuildingEnter,
}) => {
  const {
    buildings,
    isLoading,
    error,
    fetchBuildingsInTown,
    enterBuilding,
  } = useBuildingStore();

  const [filter, setFilter] = useState<FilterCategory>('all');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'level'>('name');

  // Fetch buildings on mount
  useEffect(() => {
    fetchBuildingsInTown(townId);
  }, [townId, fetchBuildingsInTown]);

  // Handle building entry
  const handleEnter = async (buildingId: string) => {
    const success = await enterBuilding(buildingId);
    if (success && onBuildingEnter) {
      onBuildingEnter();
    }
  };

  // Filter and sort buildings
  const filteredBuildings = buildings
    .filter((building) => {
      if (filter === 'all') return true;
      return CATEGORY_FILTERS[filter].includes(building.type);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'level':
          return (a.requirements?.minLevel || 0) - (b.requirements?.minLevel || 0);
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gold-medium border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-desert-sand">Loading buildings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="wood" className="text-center p-8">
        <p className="text-blood-red mb-4">{error}</p>
        <Button variant="primary" onClick={() => fetchBuildingsInTown(townId)}>
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-western text-desert-sand text-shadow-gold">
            {townName}
          </h2>
          <p className="text-desert-clay">
            {buildings.length} buildings • {buildings.filter(b => b.isOpen).length} open
          </p>
        </div>
      </div>

      {/* Filters and Sort */}
      <Card variant="leather" padding="sm" className="flex flex-wrap items-center gap-4">
        {/* Category filters */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-desert-sand mr-2">Filter:</span>
          {(Object.keys(CATEGORY_FILTERS) as FilterCategory[]).map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              className={`
                px-3 py-1 rounded text-sm font-semibold transition-colors
                ${filter === category
                  ? 'bg-gold-medium text-wood-dark'
                  : 'bg-wood-dark text-desert-sand hover:bg-wood-light'
                }
              `}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-desert-sand">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'type' | 'level')}
            className="px-3 py-1 rounded bg-wood-dark text-desert-sand border border-wood-light text-sm"
          >
            <option value="name">Name</option>
            <option value="type">Type</option>
            <option value="level">Level</option>
          </select>
        </div>
      </Card>

      {/* Buildings Grid */}
      {filteredBuildings.length === 0 ? (
        <Card variant="wood" className="text-center p-8">
          <p className="text-desert-clay">No buildings match your filter.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBuildings.map((building) => (
            <BuildingCard
              key={building._id}
              building={building}
              characterLevel={characterLevel}
              characterWantedLevel={characterWantedLevel}
              isInGang={isInGang}
              onEnter={handleEnter}
              playerCount={0} // TODO: Get from WebSocket
            />
          ))}
        </div>
      )}

      {/* Quick stats */}
      <Card variant="parchment" padding="sm" className="flex justify-around text-center">
        <div>
          <p className="text-2xl font-western text-wood-dark">
            {buildings.filter(b => b.isOpen).length}
          </p>
          <p className="text-xs text-wood-medium uppercase">Open Now</p>
        </div>
        <div>
          <p className="text-2xl font-western text-wood-dark">
            {buildings.filter(b => !b.requirements || characterLevel >= (b.requirements.minLevel || 0)).length}
          </p>
          <p className="text-xs text-wood-medium uppercase">Accessible</p>
        </div>
        <div>
          <p className="text-2xl font-western text-wood-dark">
            {buildings.reduce((sum, b) => sum + b.npcs.length, 0)}
          </p>
          <p className="text-xs text-wood-medium uppercase">NPCs</p>
        </div>
        <div>
          <p className="text-2xl font-western text-wood-dark">
            {buildings.reduce((sum, b) => sum + b.shops.length, 0)}
          </p>
          <p className="text-xs text-wood-medium uppercase">Shops</p>
        </div>
      </Card>
    </div>
  );
};

export default TownBuildingsGrid;
