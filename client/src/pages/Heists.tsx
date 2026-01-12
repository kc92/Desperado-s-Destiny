/**
 * Heists Page
 * Gang heist planning, role assignment, and execution
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useHeist, HeistTarget, Heist, HeistRole } from '@/hooks/useHeist';
import { Card, Button, Modal } from '@/components/ui';
import { formatDollars } from '@/utils/format';

/**
 * Role display info with icons
 */
const ROLE_INFO: Record<HeistRole, { icon: string; description: string }> = {
  LEADER: { icon: '👑', description: 'Commands the operation' },
  LOOKOUT: { icon: '👁️', description: 'Watches for trouble' },
  SAFE_CRACKER: { icon: '🔐', description: 'Opens the vault' },
  MUSCLE: { icon: '💪', description: 'Handles resistance' },
  DRIVER: { icon: '🐴', description: 'Plans the escape' },
  INSIDE_MAN: { icon: '🕵️', description: 'Provides intel' },
  DISTRACTION: { icon: '🎭', description: 'Creates diversions' },
};

/**
 * Difficulty color mapping
 */
const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'EASY': return 'text-green-500';
    case 'MEDIUM': return 'text-yellow-500';
    case 'HARD': return 'text-orange-500';
    case 'LEGENDARY': return 'text-red-500';
    default: return 'text-desert-sand';
  }
};

/**
 * Status badge component
 */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    PLANNING: 'bg-blue-600/20 text-blue-400',
    READY: 'bg-green-600/20 text-green-400',
    IN_PROGRESS: 'bg-yellow-600/20 text-yellow-400',
    COMPLETED: 'bg-gray-600/20 text-gray-400',
    FAILED: 'bg-red-600/20 text-red-400',
    CANCELLED: 'bg-gray-600/20 text-gray-400',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${colors[status] || 'bg-gray-600/20 text-gray-400'}`}>
      {status}
    </span>
  );
};

/**
 * Heist target card for planning new heists
 */
const HeistTargetCard: React.FC<{
  target: HeistTarget;
  onSelect: () => void;
  isDisabled: boolean;
}> = ({ target, onSelect, isDisabled }) => {
  return (
    <Card
      variant="wood"
      hover={!isDisabled}
      className={`cursor-pointer transition-all ${isDisabled ? 'opacity-50' : ''}`}
      onClick={!isDisabled ? onSelect : undefined}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-western text-lg text-gold-light">{target.name}</h3>
          <span className={`text-sm font-bold ${getDifficultyColor(target.difficulty)}`}>
            {target.difficulty}
          </span>
        </div>

        <p className="text-sm text-desert-stone mb-3">{target.description}</p>

        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div>
            <span className="text-desert-stone">Payout:</span>
            <span className="text-gold-light ml-1">{formatDollars(target.basePayout)}</span>
          </div>
          <div>
            <span className="text-desert-stone">Risk:</span>
            <span className="text-red-400 ml-1">{'★'.repeat(target.riskLevel)}</span>
          </div>
          <div>
            <span className="text-desert-stone">Members:</span>
            <span className="text-desert-sand ml-1">
              {target.requirements.minMembers}-{target.requirements.maxMembers}
            </span>
          </div>
          <div>
            <span className="text-desert-stone">Duration:</span>
            <span className="text-desert-sand ml-1">{target.estimatedDuration}min</span>
          </div>
        </div>

        <div className="border-t border-wood-grain/30 pt-2">
          <p className="text-xs text-desert-stone mb-1">Required Roles:</p>
          <div className="flex flex-wrap gap-1">
            {target.requirements.requiredRoles.map((role) => (
              <span
                key={role}
                className="text-xs bg-leather/30 px-2 py-1 rounded"
                title={ROLE_INFO[role]?.description}
              >
                {ROLE_INFO[role]?.icon} {role.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>

        {!target.isAvailable && (
          <div className="mt-2 text-xs text-red-400">
            On cooldown - {target.cooldownHours}h remaining
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Active heist card showing current progress
 */
const ActiveHeistCard: React.FC<{
  heist: Heist;
  onIncrease: () => void;
  onExecute: () => void;
  onCancel: () => void;
  onViewDetails: () => void;
  isExecuting: boolean;
}> = ({ heist, onIncrease, onExecute, onCancel, onViewDetails, isExecuting }) => {
  const canExecute = heist.planningProgress >= 100 && heist.status === 'PLANNING';

  return (
    <Card variant="leather" className="border-2 border-gold-light">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-western text-gold-light">{heist.targetName}</h3>
            <p className="text-sm text-desert-stone">
              {heist.gangName} • {heist.participants.length} participants
            </p>
          </div>
          <StatusBadge status={heist.status} />
        </div>

        {/* Planning Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-desert-stone">Planning Progress</span>
            <span className="text-gold-light">{heist.planningProgress}%</span>
          </div>
          <div className="h-3 bg-wood-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-light to-gold-dark transition-all duration-500"
              style={{ width: `${heist.planningProgress}%` }}
            />
          </div>
        </div>

        {/* Success Chance */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-desert-stone">Success Chance</span>
            <span className={heist.successChance >= 70 ? 'text-green-500' : heist.successChance >= 40 ? 'text-yellow-500' : 'text-red-500'}>
              {heist.successChance}%
            </span>
          </div>
          <div className="h-2 bg-wood-dark rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                heist.successChance >= 70 ? 'bg-green-500' : heist.successChance >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${heist.successChance}%` }}
            />
          </div>
        </div>

        {/* Participants */}
        <div className="mb-4">
          <p className="text-sm text-desert-stone mb-2">Team:</p>
          <div className="flex flex-wrap gap-2">
            {heist.participants.map((p) => (
              <div
                key={p.characterId}
                className={`text-xs px-2 py-1 rounded ${
                  p.isReady ? 'bg-green-600/20 text-green-400' : 'bg-wood-dark text-desert-sand'
                }`}
              >
                {ROLE_INFO[p.role]?.icon} {p.characterName}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {heist.status === 'PLANNING' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={onIncrease}
                disabled={heist.planningProgress >= 100}
              >
                +10% Planning
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onExecute}
                disabled={!canExecute || isExecuting}
              >
                {isExecuting ? 'Executing...' : 'Execute Heist'}
              </Button>
            </>
          )}
          <Button variant="secondary" size="sm" onClick={onViewDetails}>
            Details
          </Button>
          {heist.status === 'PLANNING' && (
            <Button variant="danger" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

/**
 * Heist history entry
 */
const HeistHistoryEntry: React.FC<{ heist: Heist }> = ({ heist }) => {
  return (
    <div className="p-3 bg-wood-dark/30 rounded flex justify-between items-center">
      <div>
        <p className="font-bold text-desert-sand">{heist.targetName}</p>
        <p className="text-xs text-desert-stone">
          {heist.completedAt ? new Date(heist.completedAt).toLocaleDateString() : 'N/A'}
        </p>
      </div>
      <div className="text-right">
        <StatusBadge status={heist.status} />
        {heist.rewards && heist.rewards.length > 0 && (
          <p className="text-xs text-gold-light mt-1">
            +{formatDollars(heist.rewards.find(r => r.type === 'gold')?.amount || 0)}
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Main Heists Page
 */
export const Heists: React.FC = () => {
  const navigate = useNavigate();
  const { currentCharacter } = useCharacterStore();
  const {
    availableTargets,
    heists,
    isLoading,
    error,
    fetchAvailableTargets,
    fetchHeists,
    planHeist,
    increaseProgress,
    executeHeist,
    cancelHeist,
    clearError,
  } = useHeist();

  const [selectedTarget, setSelectedTarget] = useState<HeistTarget | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load data on mount
  useEffect(() => {
    fetchAvailableTargets();
    fetchHeists();
  }, [fetchAvailableTargets, fetchHeists]);

  // Check if player is in a gang
  const isInGang = !!currentCharacter?.gangId;

  // Get active heist (if any)
  const activeHeist = heists.find(h => h.status === 'PLANNING' || h.status === 'READY' || h.status === 'IN_PROGRESS');

  // Get completed heists
  const completedHeists = heists.filter(h => h.status === 'COMPLETED' || h.status === 'FAILED');

  // Handle plan heist
  const handlePlanHeist = async () => {
    if (!selectedTarget) return;

    const result = await planHeist(selectedTarget._id);
    if (result.success) {
      setShowPlanModal(false);
      setSelectedTarget(null);
      setResultMessage({ type: 'success', message: `Started planning ${selectedTarget.name}!` });
    } else {
      setResultMessage({ type: 'error', message: result.message });
    }

    setTimeout(() => setResultMessage(null), 3000);
  };

  // Handle increase progress
  const handleIncreaseProgress = async (heistId: string) => {
    const result = await increaseProgress(heistId, 1);
    if (!result.success) {
      setResultMessage({ type: 'error', message: result.message });
      setTimeout(() => setResultMessage(null), 3000);
    }
  };

  // Handle execute heist
  const handleExecuteHeist = async (heistId: string) => {
    setIsExecuting(true);
    const result = await executeHeist(heistId);
    setIsExecuting(false);

    if (result.success) {
      setResultMessage({
        type: 'success',
        message: `Heist successful! Earned ${formatDollars(result.rewards?.find(r => r.type === 'gold')?.amount || 0)}`,
      });
    } else {
      setResultMessage({ type: 'error', message: result.message });
    }

    setTimeout(() => setResultMessage(null), 5000);
  };

  // Handle cancel heist
  const handleCancelHeist = async (heistId: string) => {
    const result = await cancelHeist(heistId);
    if (result.success) {
      setResultMessage({ type: 'success', message: 'Heist cancelled' });
    } else {
      setResultMessage({ type: 'error', message: result.message });
    }

    setTimeout(() => setResultMessage(null), 3000);
  };

  // Not in gang
  if (!isInGang) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card variant="leather" className="p-8 text-center">
          <div className="text-6xl mb-4">🎭</div>
          <h1 className="text-2xl font-western text-gold-light mb-4">Gang Required</h1>
          <p className="text-desert-sand mb-6">
            You must be in a gang to participate in heists. Join or create a gang to access this feature.
          </p>
          <Button variant="primary" onClick={() => navigate('/game/gang')}>
            Go to Gang Page
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card variant="leather">
        <div className="p-6">
          <h1 className="text-3xl font-western text-gold-light mb-2">Gang Heists</h1>
          <p className="text-desert-sand font-serif">
            Plan and execute daring heists with your gang. Assign roles, gather intel, and strike when ready.
          </p>
        </div>
      </Card>

      {/* Result Message */}
      {resultMessage && (
        <div className={`p-4 rounded ${
          resultMessage.type === 'success' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
        }`}>
          {resultMessage.message}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded bg-red-600/20 text-red-400 flex justify-between items-center">
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={clearError}>Dismiss</Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Heist */}
          {activeHeist && (
            <div>
              <h2 className="text-xl font-western text-desert-sand mb-4">Active Heist</h2>
              <ActiveHeistCard
                heist={activeHeist}
                onIncrease={() => handleIncreaseProgress(activeHeist._id)}
                onExecute={() => handleExecuteHeist(activeHeist._id)}
                onCancel={() => handleCancelHeist(activeHeist._id)}
                onViewDetails={() => {}}
                isExecuting={isExecuting}
              />
            </div>
          )}

          {/* Available Targets */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-western text-desert-sand">Available Targets</h2>
              {isLoading && <span className="text-sm text-desert-stone">Loading...</span>}
            </div>

            {availableTargets.length === 0 && !isLoading ? (
              <Card variant="wood" className="p-8 text-center">
                <p className="text-desert-stone">No heist targets available at this time.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTargets.map((target) => (
                  <HeistTargetCard
                    key={target._id}
                    target={target}
                    onSelect={() => {
                      setSelectedTarget(target);
                      setShowPlanModal(true);
                    }}
                    isDisabled={!!activeHeist || !target.isAvailable}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <Card variant="wood">
            <div className="p-6">
              <h3 className="text-lg font-western text-desert-sand mb-4">Heist Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-desert-stone">Total Heists</span>
                  <span className="text-gold-light font-bold">{heists.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-desert-stone">Successful</span>
                  <span className="text-green-500 font-bold">
                    {heists.filter(h => h.status === 'COMPLETED').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-desert-stone">Failed</span>
                  <span className="text-red-500 font-bold">
                    {heists.filter(h => h.status === 'FAILED').length}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Heists */}
          <Card variant="leather">
            <div className="p-6">
              <h3 className="text-lg font-western text-desert-sand mb-4">Recent Heists</h3>
              <div className="space-y-2">
                {completedHeists.length === 0 ? (
                  <p className="text-sm text-desert-stone text-center py-4">No completed heists yet</p>
                ) : (
                  completedHeists.slice(0, 5).map((heist) => (
                    <HeistHistoryEntry key={heist._id} heist={heist} />
                  ))
                )}
              </div>
            </div>
          </Card>

          {/* Role Guide */}
          <Card variant="parchment">
            <div className="p-6">
              <h3 className="text-lg font-western text-wood-dark mb-4">Role Guide</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(ROLE_INFO).map(([role, info]) => (
                  <div key={role} className="flex items-center gap-2">
                    <span className="text-lg">{info.icon}</span>
                    <div>
                      <span className="font-bold text-wood-dark">{role.replace('_', ' ')}</span>
                      <p className="text-xs text-wood-grain">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Plan Heist Modal */}
      <Modal
        isOpen={showPlanModal}
        onClose={() => {
          setShowPlanModal(false);
          setSelectedTarget(null);
        }}
        title="Plan Heist"
      >
        {selectedTarget && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-western text-gold-light">{selectedTarget.name}</h3>
              <p className="text-sm text-desert-stone mt-1">{selectedTarget.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-desert-stone">Difficulty:</span>
                <span className={`ml-2 font-bold ${getDifficultyColor(selectedTarget.difficulty)}`}>
                  {selectedTarget.difficulty}
                </span>
              </div>
              <div>
                <span className="text-desert-stone">Base Payout:</span>
                <span className="ml-2 text-gold-light font-bold">
                  {formatDollars(selectedTarget.basePayout)}
                </span>
              </div>
              <div>
                <span className="text-desert-stone">Risk Level:</span>
                <span className="ml-2 text-red-400">{'★'.repeat(selectedTarget.riskLevel)}</span>
              </div>
              <div>
                <span className="text-desert-stone">Duration:</span>
                <span className="ml-2 text-desert-sand">{selectedTarget.estimatedDuration} min</span>
              </div>
            </div>

            <div className="border-t border-wood-grain/30 pt-4">
              <p className="text-sm text-desert-stone mb-2">Required Roles:</p>
              <div className="flex flex-wrap gap-2">
                {selectedTarget.requirements.requiredRoles.map((role) => (
                  <span
                    key={role}
                    className="text-sm bg-wood-dark px-3 py-1 rounded"
                  >
                    {ROLE_INFO[role]?.icon} {role.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowPlanModal(false);
                  setSelectedTarget(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handlePlanHeist}
                className="flex-1"
              >
                Start Planning
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Heists;
