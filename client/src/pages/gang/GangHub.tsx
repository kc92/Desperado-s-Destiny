/**
 * Gang Hub Page
 * Main orchestration page for the gang system
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, ConfirmDialog } from '@/components/ui';
import { DeclareWarModal, WarDetailModal, NPCGangPanel } from '@/components/gang';
import { useGangStore, useGangSocketListeners } from '@/store/useGangStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useToast } from '@/store/useToastStore';
import { useGangWars, type GangWar as LocalGangWar } from '@/hooks/useGangWars';

// Sub-components
import { GangHeader } from './GangHeader';
import { GangMembers } from './GangMembers';
import { GangActions } from './GangActions';
import { GangWarsSection } from './GangWarsSection';
import { GangSelection } from './GangSelection';

export const GangHub: React.FC = () => {
  const navigate = useNavigate();
  const { currentCharacter } = useCharacterStore();
  const { success, error: showError } = useToast();
  const {
    currentGang,
    isLoading,
    error,
    fetchCurrentGang,
    fetchGangs,
    createGang,
    leaveGang,
    clearError,
  } = useGangStore();

  // Use the gang wars hook for war-related functionality (provides correctly-typed data)
  const {
    activeWars,
    availableTerritories,
    declareWar,
    contributeToWar,
  } = useGangWars(currentGang?._id);

  // Initialize socket listeners
  useGangSocketListeners();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showDeclareWarModal, setShowDeclareWarModal] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [selectedWar, setSelectedWar] = useState<LocalGangWar | null>(null);

  // Create form state
  const [createForm, setCreateForm] = useState({
    name: '',
    tag: '',
    description: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (currentCharacter) {
      fetchCurrentGang();
      fetchGangs();
    }
  }, [currentCharacter, fetchCurrentGang, fetchGangs]);

  // Handle create gang
  const handleCreateGang = async () => {
    if (!createForm.name.trim() || !createForm.tag.trim()) {
      showError('Error', 'Gang name and tag are required');
      return;
    }

    if (!currentCharacter?._id) {
      showError('Error', 'Character not loaded');
      return;
    }

    setIsCreating(true);
    try {
      await createGang(createForm.name, createForm.tag, currentCharacter._id);
      setShowCreateModal(false);
      setCreateForm({ name: '', tag: '', description: '' });
      success('Success', `Gang "${createForm.name}" created!`);
    } catch (err: any) {
      showError('Error', err.message || 'Failed to create gang');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle leave gang
  const handleLeaveGang = async () => {
    try {
      await leaveGang();
      setShowLeaveConfirm(false);
      success('Success', 'You have left the gang');
    } catch (err: any) {
      showError('Error', err.message || 'Failed to leave gang');
    }
  };

  // Handle declare war - returns boolean for DeclareWarModal
  const handleDeclareWar = async (territoryId: string, funding: number): Promise<boolean> => {
    const result = await declareWar(territoryId, funding);
    if (result) {
      setShowDeclareWarModal(false);
      success('War Declared', 'Your gang has declared war!');
    } else {
      showError('Error', 'Failed to declare war');
    }
    return result;
  };

  // Handle contribute to war - returns boolean for WarDetailModal
  const handleContributeToWar = async (warId: string, amount: number): Promise<boolean> => {
    const result = await contributeToWar(warId, amount);
    if (result) {
      success('Contributed', `You contributed $${amount.toLocaleString()} to the war effort!`);
    } else {
      showError('Error', 'Failed to contribute');
    }
    return result;
  };

  if (!currentCharacter) {
    return (
      <div className="text-center py-12">
        <p className="text-desert-sand">No character selected</p>
        <Button onClick={() => navigate('/character-select')} className="mt-4">
          Select Character
        </Button>
      </div>
    );
  }

  // Show gang selection if not in a gang
  if (!currentGang) {
    return (
      <>
        <GangSelection
          onCreateClick={() => setShowCreateModal(true)}
          showJoinModal={showJoinModal}
          onJoinModalClose={() => setShowJoinModal(false)}
        />

        {/* Create Gang Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Gang"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="gangName" className="block text-sm font-medium text-wood-dark mb-1">
                Gang Name
              </label>
              <input
                id="gangName"
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter gang name"
                maxLength={30}
              />
            </div>

            <div>
              <label htmlFor="gangTag" className="block text-sm font-medium text-wood-dark mb-1">
                Tag (3-4 letters)
              </label>
              <input
                id="gangTag"
                type="text"
                value={createForm.tag}
                onChange={(e) => setCreateForm({ ...createForm, tag: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border rounded"
                placeholder="TAG"
                maxLength={4}
              />
            </div>

            <div>
              <label htmlFor="gangDescription" className="block text-sm font-medium text-wood-dark mb-1">
                Description
              </label>
              <textarea
                id="gangDescription"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                rows={3}
                placeholder="Describe your gang's purpose"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleCreateGang}
                disabled={isCreating}
                isLoading={isCreating}
              >
                Create Gang ($5,000)
              </Button>
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  // Show current gang view
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Gang Header */}
      <GangHeader gang={currentGang} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members List */}
        <div className="lg:col-span-2">
          <GangMembers
            gang={currentGang}
            onLeaveGang={() => setShowLeaveConfirm(true)}
          />
        </div>

        {/* Gang Actions */}
        <GangActions
          gang={currentGang}
          onDeclareWar={() => setShowDeclareWarModal(true)}
        />
      </div>

      {/* Gang Wars Section */}
      <GangWarsSection
        gang={currentGang}
        onDeclareWar={() => setShowDeclareWarModal(true)}
        onSelectWar={setSelectedWar}
      />

      {/* NPC Gang Panel */}
      <NPCGangPanel
        playerGangId={currentGang._id}
        playerGangLevel={currentGang.level}
        gangTreasury={currentGang.bank || 0}
        onTributesPaid={() => fetchCurrentGang()}
      />

      {/* Declare War Modal */}
      <DeclareWarModal
        isOpen={showDeclareWarModal}
        onClose={() => setShowDeclareWarModal(false)}
        territories={availableTerritories.filter(t => t.controllingGangId !== currentGang._id)}
        gangBank={currentGang.bank || 0}
        hasWarChest={true}
        hasActiveWar={activeWars.some(
          w => w.attackerGangId === currentGang._id || w.defenderGangId === currentGang._id
        )}
        onDeclare={handleDeclareWar}
      />

      {/* War Detail Modal */}
      {selectedWar && (
        <WarDetailModal
          war={selectedWar}
          currentGangId={currentGang._id}
          characterGold={currentCharacter.gold}
          onClose={() => setSelectedWar(null)}
          onContribute={handleContributeToWar}
        />
      )}

      {/* Leave Confirm Dialog */}
      <ConfirmDialog
        isOpen={showLeaveConfirm}
        title="Leave Gang"
        message="Are you sure you want to leave your gang? You will lose access to the gang treasury and territories."
        confirmText="Leave Gang"
        cancelText="Stay"
        confirmVariant="danger"
        onConfirm={handleLeaveGang}
        onCancel={() => setShowLeaveConfirm(false)}
        isLoading={isLoading}
        icon="🏴"
      />

      {/* Error display */}
      {error && (
        <div className="fixed bottom-4 right-4 z-50 bg-blood-red text-white px-6 py-4 rounded-lg shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-bold">Error</div>
              <div className="text-sm">{error}</div>
            </div>
            <button onClick={clearError} className="ml-4 text-white/70 hover:text-white">
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GangHub;
