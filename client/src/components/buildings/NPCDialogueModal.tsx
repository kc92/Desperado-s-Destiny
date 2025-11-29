/**
 * NPCDialogueModal Component
 * Full-screen dialogue modal for NPC interactions
 */

import React, { useState, useEffect } from 'react';
import { useBuildingStore } from '../../store/useBuildingStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface NPCDialogueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartQuest?: (questId: string) => void;
  onOpenShop?: (shopId: string) => void;
}

// Faction color schemes for NPC portraits
const FACTION_PORTRAIT_STYLES: Record<string, string> = {
  settler: 'from-faction-settler/30 to-blue-900/50 border-faction-settler',
  nahi: 'from-faction-nahi/30 to-teal-900/50 border-faction-nahi',
  frontera: 'from-faction-frontera/30 to-red-900/50 border-faction-frontera',
  neutral: 'from-wood-medium/30 to-wood-dark/50 border-wood-light',
};

export const NPCDialogueModal: React.FC<NPCDialogueModalProps> = ({
  isOpen,
  onClose,
  onStartQuest,
  onOpenShop,
}) => {
  const { selectedNPC, selectNPC } = useBuildingStore();
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [showQuests, setShowQuests] = useState(false);

  // Reset dialogue when NPC changes
  useEffect(() => {
    setCurrentDialogueIndex(0);
    setShowQuests(false);
  }, [selectedNPC]);

  if (!selectedNPC) {
    return null;
  }

  const handleClose = () => {
    selectNPC(null);
    onClose();
  };

  const handleNextDialogue = () => {
    if (selectedNPC.dialogue && currentDialogueIndex < selectedNPC.dialogue.length - 1) {
      setCurrentDialogueIndex(currentDialogueIndex + 1);
    }
  };

  const handlePrevDialogue = () => {
    if (currentDialogueIndex > 0) {
      setCurrentDialogueIndex(currentDialogueIndex - 1);
    }
  };

  const factionStyle = FACTION_PORTRAIT_STYLES[selectedNPC.faction || 'neutral'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title=""
      size="xl"
      showCloseButton={false}
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side - NPC Portrait and Info */}
        <div className="md:w-1/3 space-y-4">
          {/* Portrait */}
          <div
            className={`
              relative w-full aspect-square rounded-lg
              bg-gradient-to-br ${factionStyle}
              border-4 overflow-hidden
            `}
          >
            {/* Placeholder portrait - silhouette */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-8xl opacity-50">👤</div>
            </div>

            {/* Personality indicator */}
            {selectedNPC.personality && (
              <div className="absolute bottom-2 left-2 right-2 text-center">
                <span className="px-2 py-1 bg-black/50 rounded text-xs text-white italic">
                  {selectedNPC.personality}
                </span>
              </div>
            )}
          </div>

          {/* NPC Info */}
          <div className="text-center">
            <h2 className="text-2xl font-western text-desert-sand">
              {selectedNPC.name}
            </h2>
            {selectedNPC.title && (
              <p className="text-gold-medium">{selectedNPC.title}</p>
            )}
            {selectedNPC.faction && (
              <p className="text-sm text-desert-clay uppercase mt-1">
                {selectedNPC.faction}
              </p>
            )}
          </div>

          {/* Trust Level (placeholder) */}
          <Card variant="leather" padding="sm" className="text-center">
            <p className="text-xs text-desert-clay uppercase mb-1">Trust Level</p>
            <div className="flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < 2 ? 'text-gold-medium' : 'text-wood-dark'}>
                  ★
                </span>
              ))}
            </div>
            <p className="text-xs text-desert-clay mt-1">Neutral</p>
          </Card>

          {/* Quick actions */}
          <div className="space-y-2">
            {selectedNPC.isVendor && selectedNPC.shopId && (
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => onOpenShop?.(selectedNPC.shopId!)}
              >
                🛒 Open Shop
              </Button>
            )}
            {selectedNPC.quests && selectedNPC.quests.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => setShowQuests(!showQuests)}
              >
                📜 View Quests ({selectedNPC.quests.length})
              </Button>
            )}
          </div>
        </div>

        {/* Right side - Dialogue */}
        <div className="md:w-2/3 flex flex-col">
          {/* Main dialogue area */}
          {!showQuests ? (
            <>
              {/* Description */}
              <Card variant="parchment" className="mb-4">
                <p className="text-wood-dark">{selectedNPC.description}</p>
              </Card>

              {/* Dialogue */}
              {selectedNPC.dialogue && selectedNPC.dialogue.length > 0 && (
                <div className="flex-1">
                  <Card variant="wood" className="h-full flex flex-col">
                    {/* Dialogue content */}
                    <div className="flex-1 mb-4">
                      <p className="text-lg text-desert-sand italic leading-relaxed">
                        "{selectedNPC.dialogue[currentDialogueIndex]}"
                      </p>
                    </div>

                    {/* Dialogue navigation */}
                    <div className="flex items-center justify-between pt-4 border-t border-wood-light">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePrevDialogue}
                        disabled={currentDialogueIndex === 0}
                      >
                        ← Previous
                      </Button>
                      <span className="text-sm text-desert-clay">
                        {currentDialogueIndex + 1} / {selectedNPC.dialogue.length}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNextDialogue}
                        disabled={currentDialogueIndex === selectedNPC.dialogue.length - 1}
                      >
                        Next →
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {/* Response options (placeholder for future dialogue trees) */}
              <div className="mt-4 space-y-2">
                <p className="text-sm text-desert-clay">Responses:</p>
                <div className="grid grid-cols-1 gap-2">
                  <button className="p-3 text-left bg-wood-light/20 rounded hover:bg-wood-light/40 transition-colors text-desert-sand">
                    "Tell me more about yourself."
                  </button>
                  <button className="p-3 text-left bg-wood-light/20 rounded hover:bg-wood-light/40 transition-colors text-desert-sand">
                    "What's the news around here?"
                  </button>
                  {selectedNPC.isVendor && (
                    <button
                      className="p-3 text-left bg-gold-medium/20 rounded hover:bg-gold-medium/40 transition-colors text-gold-medium"
                      onClick={() => onOpenShop?.(selectedNPC.shopId!)}
                    >
                      "Let me see what you're selling."
                    </button>
                  )}
                  <button
                    className="p-3 text-left bg-blood-red/20 rounded hover:bg-blood-red/40 transition-colors text-desert-clay"
                    onClick={handleClose}
                  >
                    "[Leave]"
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Quests view */
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-western text-gold-medium">Available Quests</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowQuests(false)}>
                  ← Back
                </Button>
              </div>

              <div className="space-y-3">
                {selectedNPC.quests?.map((questId) => (
                  <Card key={questId} variant="parchment" className="hover:border-gold-medium transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-western text-wood-dark">
                          {questId.replace(/_/g, ' ')}
                        </h4>
                        <p className="text-sm text-wood-medium">
                          Quest details would appear here...
                        </p>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onStartQuest?.(questId)}
                      >
                        Accept
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Close button at bottom */}
      <div className="mt-6 text-center">
        <Button variant="ghost" onClick={handleClose}>
          End Conversation
        </Button>
      </div>
    </Modal>
  );
};

export default NPCDialogueModal;
