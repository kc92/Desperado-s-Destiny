/**
 * Location Hostiles Component
 * Displays hostile NPCs available for combat at the current location
 */

import React from 'react';
import { Card, Button, LoadingSpinner } from '@/components/ui';
import { CombatModal } from '@/components/location';
import { useLocationStore } from '@/store/useLocationStore';
import { useCharacterStore } from '@/store/useCharacterStore';

interface LocationHostilesProps {
  onRefresh?: () => void;
}

export const LocationHostiles: React.FC<LocationHostilesProps> = ({ onRefresh }) => {
  const { refreshCharacter } = useCharacterStore();
  const {
    hostileNPCs,
    hostilesLoading,
    selectedCombatNPC,
    setSelectedCombatNPC,
    fetchHostileNPCs,
  } = useLocationStore();

  if (hostileNPCs.length === 0 && !hostilesLoading) {
    return null;
  }

  const handleCombatComplete = (_victory: boolean, _rewards?: { gold?: number; xp?: number; items?: any[] }) => {
    setSelectedCombatNPC(null);
    refreshCharacter();
    fetchHostileNPCs(); // Refresh hostiles in case NPC was defeated
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <>
      <Card className="p-6">
        <h2 className="text-xl font-bold text-red-400 mb-4">⚔️ Hostile Encounters</h2>
        <p className="text-sm text-gray-400 mb-4">
          Dangerous individuals lurking in this area. Approach with caution.
        </p>

        {hostilesLoading ? (
          <div className="text-center py-4">
            <LoadingSpinner size="sm" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {hostileNPCs.map((npc) => {
              // Extended NPC props from server
              const extNpc = npc as typeof npc & {
                icon?: string;
                title?: string;
                baseStats?: { health?: number };
                rewards?: { gold?: number; xp?: number }
              };

              return (
                <div
                  key={npc._id}
                  className="p-4 bg-gradient-to-br from-red-900/30 to-gray-800/50 rounded-lg border border-red-700/50 hover:border-red-500 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{extNpc.icon || '💀'}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-200">{npc.name}</h3>
                      {extNpc.title && (
                        <p className="text-xs text-red-400">{extNpc.title}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{npc.description}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">Lvl {npc.level || 1}</span>
                      <span className="text-red-400">HP {extNpc.baseStats?.health || 100}</span>
                    </div>
                    <span className="text-gray-500">
                      {npc.difficulty || 'Normal'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      <span className="text-yellow-400">💰 {extNpc.rewards?.gold || 0}</span>
                      <span className="ml-2 text-purple-400">⭐ {extNpc.rewards?.xp || 0}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-red-900/50 hover:bg-red-800/50 border-red-700"
                      onClick={() => setSelectedCombatNPC(npc)}
                    >
                      Fight
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Combat Modal */}
      {selectedCombatNPC && (
        <CombatModal
          npc={selectedCombatNPC}
          onClose={() => setSelectedCombatNPC(null)}
          onComplete={handleCombatComplete}
        />
      )}
    </>
  );
};

export default LocationHostiles;
