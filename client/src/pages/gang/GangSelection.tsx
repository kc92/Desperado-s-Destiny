/**
 * Gang Selection Component
 * Shown when player is not in a gang - allows creating or joining
 */

import React from 'react';
import { Card, Button, Modal } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useGangStore, useGangSocketListeners } from '@/store/useGangStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import type { Gang } from '@desperados/shared';

interface GangSelectionProps {
  onCreateClick: () => void;
  showJoinModal: boolean;
  onJoinModalClose: () => void;
}

export const GangSelection: React.FC<GangSelectionProps> = ({
  onCreateClick,
  showJoinModal,
  onJoinModalClose,
}) => {
  const { currentCharacter } = useCharacterStore();
  const {
    gangs,
    selectedGang,
    isLoading,
    setSelectedGang,
    joinGang,
  } = useGangStore();

  // Initialize socket listeners
  useGangSocketListeners();

  const recruitingGangs = gangs.filter(g => g.isRecruiting);

  const handleJoinGang = async (gangId: string) => {
    try {
      await joinGang(gangId);
      onJoinModalClose();
    } catch {
      // Error handled in store
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card variant="leather">
        <div className="p-6">
          <h1 className="text-3xl font-western text-gold-light mb-2">
            Gang Territory
          </h1>
          <p className="text-desert-sand font-serif">
            Join a gang to participate in territory wars and group activities
          </p>
        </div>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="wood" hover className="cursor-pointer" onClick={onCreateClick}>
          <div className="p-6 text-center">
            <div className="text-4xl mb-3">🏴</div>
            <h2 className="text-xl font-western text-desert-sand mb-2">
              Create Gang
            </h2>
            <p className="text-desert-stone text-sm">
              Start your own gang and recruit members
            </p>
            <div className="mt-4 text-gold-light font-bold">
              Cost: $5,000
            </div>
          </div>
        </Card>

        <Card
          variant="leather"
          hover
          className="cursor-pointer"
          onClick={() => setSelectedGang(null)}
        >
          <div className="p-6 text-center">
            <div className="text-4xl mb-3">🤝</div>
            <h2 className="text-xl font-western text-desert-sand mb-2">
              Join Gang
            </h2>
            <p className="text-desert-stone text-sm">
              Apply to join an existing gang
            </p>
            <div className="mt-4 text-gold-light">
              {recruitingGangs.length} recruiting
            </div>
          </div>
        </Card>
      </div>

      {/* Available Gangs */}
      <Card variant="parchment">
        <div className="p-6">
          <h2 className="text-2xl font-western text-wood-dark mb-4">
            Active Gangs
          </h2>

          {isLoading ? (
            <div aria-busy="true" aria-live="polite">
              <CardGridSkeleton count={6} columns={3} />
            </div>
          ) : gangs.length === 0 ? (
            <EmptyState
              icon="🤠"
              title="No Gangs Found"
              description="No gangs are active yet. Be the first to establish a gang and claim your territory!"
              actionText="Create Gang"
              onAction={onCreateClick}
              size="md"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gangs.map((gang) => (
                <button
                  key={gang._id}
                  className="p-4 bg-wood-grain/10 rounded hover:bg-wood-grain/20 transition-colors cursor-pointer text-left w-full"
                  onClick={() => setSelectedGang(gang)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-wood-dark">
                      {gang.name} [{gang.tag}]
                    </h3>
                    {gang.isRecruiting && (
                      <span className="text-xs bg-green-600/20 text-green-600 px-2 py-1 rounded">
                        Recruiting
                      </span>
                    )}
                  </div>
                  <div className="text-sm space-y-1 text-wood-grain">
                    <div>Level {gang.level}</div>
                    <div>{gang.members?.length || 0}/{gang.maxMembers || 20} members</div>
                    <div>Rep: {(gang.reputation || 0).toLocaleString()}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Join Gang Modal */}
      <Modal
        isOpen={showJoinModal || selectedGang !== null}
        onClose={() => {
          setSelectedGang(null);
          onJoinModalClose();
        }}
        title="Join Gang"
      >
        {selectedGang ? (
          <GangDetailView
            gang={selectedGang}
            playerLevel={currentCharacter?.level || 1}
            onJoin={() => handleJoinGang(selectedGang._id)}
            onBack={() => setSelectedGang(null)}
          />
        ) : (
          <div className="space-y-3">
            {recruitingGangs.map((gang) => (
              <button
                key={gang._id}
                onClick={() => setSelectedGang(gang)}
                className="w-full p-3 text-left bg-wood-grain/10 rounded hover:bg-wood-grain/20 transition-colors"
              >
                <div className="font-bold text-wood-dark">
                  {gang.name} [{gang.tag}]
                </div>
                <div className="text-sm text-wood-grain">
                  Level {gang.level} • {gang.members?.length || 0}/{gang.maxMembers || 20} members
                </div>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

// Sub-component for gang detail view
interface GangDetailViewProps {
  gang: Gang;
  playerLevel: number;
  onJoin: () => void;
  onBack: () => void;
}

const GangDetailView: React.FC<GangDetailViewProps> = ({
  gang,
  playerLevel,
  onJoin,
  onBack,
}) => {
  const leader = gang.members?.find(m => m.role === 'leader');
  const minLevel = gang.minimumLevel || 1;
  const meetsLevel = playerLevel >= minLevel;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-wood-dark">
          {gang.name} [{gang.tag}]
        </h3>
        {gang.description && (
          <p className="text-sm text-wood-grain mt-1">
            {gang.description}
          </p>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Leader:</span>
          <span className="font-bold">{leader?.characterName || 'Unknown'}</span>
        </div>
        <div className="flex justify-between">
          <span>Members:</span>
          <span>{gang.members?.length || 0}/{gang.maxMembers || 20}</span>
        </div>
        <div className="flex justify-between">
          <span>Min Level:</span>
          <span className={meetsLevel ? '' : 'text-red-500'}>{minLevel}</span>
        </div>
        <div className="flex justify-between">
          <span>Territories:</span>
          <span>{gang.territories?.length || 0}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="primary"
          onClick={onJoin}
          disabled={!gang.isRecruiting || !meetsLevel}
        >
          {!gang.isRecruiting
            ? 'Not Recruiting'
            : !meetsLevel
            ? `Need Level ${minLevel}`
            : 'Apply to Join'
          }
        </Button>
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
};

export default GangSelection;
