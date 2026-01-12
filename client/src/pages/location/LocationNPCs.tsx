/**
 * Location NPCs Component
 * Displays NPCs present at the current location with interaction modal
 */

import React, { useEffect } from 'react';
import { Card, Button, Modal } from '@/components/ui';
import { useLocationStore } from '@/store/useLocationStore';

export const LocationNPCs: React.FC = () => {
  const {
    location,
    selectedNPC,
    setSelectedNPC,
    interactWithNPC,
  } = useLocationStore();

  // Trigger NPC interaction API when an NPC is selected
  useEffect(() => {
    if (selectedNPC && location?._id) {
      interactWithNPC(selectedNPC.id);
    }
  }, [selectedNPC, location?._id, interactWithNPC]);

  if (!location || location.npcs.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="p-6">
        <h2 className="text-xl font-bold text-amber-400 mb-4">People Here</h2>
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
    </>
  );
};

export default LocationNPCs;
