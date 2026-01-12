/**
 * Location Buildings Component
 * Displays town buildings grid with enter functionality
 */

import React from 'react';
import { Card, Button, LoadingSpinner, Modal } from '@/components/ui';
import { useLocationStore, type TownBuilding } from '@/store/useLocationStore';

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

interface LocationBuildingsProps {
  onRefresh?: () => void;
}

export const LocationBuildings: React.FC<LocationBuildingsProps> = ({ onRefresh }) => {
  const {
    buildings,
    buildingsLoading,
    selectedBuilding,
    setSelectedBuilding,
    handleEnterBuilding,
  } = useLocationStore();

  if (buildings.length === 0) {
    return null;
  }

  const getBuildingConfig = (building: TownBuilding) => {
    return buildingConfig[building.type] || {
      icon: building.icon || '🏠',
      color: 'bg-gray-800/50 border-gray-600'
    };
  };

  const onEnterBuilding = async (buildingId: string) => {
    await handleEnterBuilding(buildingId);
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <>
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
              const config = getBuildingConfig(building);

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
                {getBuildingConfig(selectedBuilding).icon}
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
                onClick={() => onEnterBuilding(selectedBuilding.id)}
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
    </>
  );
};

export default LocationBuildings;
