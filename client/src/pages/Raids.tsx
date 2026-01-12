/**
 * Raids Page
 * Gang raid planning, target selection, and defense management
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '@/store/useCharacterStore';
import { raidService, Raid, RaidTarget, RaidsSummary } from '@/services/raid.service';
import { Card, Button, Modal } from '@/components/ui';
import { formatDollars } from '@/utils/format';
import { logger } from '@/services/logger.service';

/**
 * Raid type configuration
 */
const RAID_TYPES = [
  { id: 'property', name: 'Property Raid', icon: '🏠', description: 'Raid player or NPC properties for loot' },
  { id: 'treasury', name: 'Treasury Raid', icon: '💰', description: 'Attack a gang treasury for gold' },
  { id: 'territory', name: 'Territory Raid', icon: '🏴', description: 'Weaken enemy territory control' },
  { id: 'production', name: 'Production Raid', icon: '⚒️', description: 'Steal from production facilities' },
];

/**
 * Role display info
 */
const ROLE_INFO: Record<string, { icon: string; description: string }> = {
  leader: { icon: '👑', description: 'Commands the raid' },
  muscle: { icon: '💪', description: 'Handles combat' },
  lookout: { icon: '👁️', description: 'Watches for trouble' },
  specialist: { icon: '🔧', description: 'Disables defenses' },
};

/**
 * Status badge component
 */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    planning: 'bg-blue-600/20 text-blue-400',
    scheduled: 'bg-purple-600/20 text-purple-400',
    executing: 'bg-yellow-600/20 text-yellow-400',
    completed: 'bg-green-600/20 text-green-400',
    failed: 'bg-red-600/20 text-red-400',
    cancelled: 'bg-gray-600/20 text-gray-400',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${colors[status] || 'bg-gray-600/20 text-gray-400'}`}>
      {status}
    </span>
  );
};

/**
 * Raid target card
 */
const RaidTargetCard: React.FC<{
  target: RaidTarget;
  onSelect: () => void;
  isDisabled: boolean;
}> = ({ target, onSelect, isDisabled }) => {
  return (
    <div
      onClick={!isDisabled ? onSelect : undefined}
      className={`p-4 bg-wood-dark/50 rounded-lg border transition-all ${
        isDisabled
          ? 'opacity-50 cursor-not-allowed border-wood-grain/30'
          : 'cursor-pointer border-wood-grain hover:border-gold-light'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-western text-gold-light">{target.name}</h4>
        <span className="text-xs text-desert-stone">{target.type}</span>
      </div>

      <div className="text-sm text-desert-stone mb-2">
        Owner: <span className="text-desert-sand">{target.ownerName}</span>
        {target.gangName && (
          <span className="text-desert-stone"> ({target.gangName})</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-desert-stone">Defense:</span>
          <span className="text-red-400 ml-1">{'★'.repeat(Math.min(5, Math.ceil(target.defenseRating / 20)))}</span>
        </div>
        <div>
          <span className="text-desert-stone">Loot:</span>
          <span className="text-gold-light ml-1">~{formatDollars(target.estimatedLoot)}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Active raid card
 */
const ActiveRaidCard: React.FC<{
  raid: Raid;
  characterId: string;
  onExecute: () => void;
  onCancel: () => void;
  isExecuting: boolean;
}> = ({ raid, characterId, onExecute, onCancel, isExecuting }) => {
  const isLeader = raid.leaderId === characterId;
  const canExecute = raid.status === 'planning' && raid.participants.length >= 2;

  return (
    <Card variant="leather" className="border-2 border-gold-light">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-western text-gold-light">{raid.targetName}</h3>
            <p className="text-sm text-desert-stone">
              {RAID_TYPES.find(t => t.id === raid.targetType)?.name || raid.targetType}
            </p>
          </div>
          <StatusBadge status={raid.status} />
        </div>

        {/* Participants */}
        <div className="mb-4">
          <p className="text-sm text-desert-stone mb-2">
            Team ({raid.participants.length} members):
          </p>
          <div className="flex flex-wrap gap-2">
            {raid.participants.map((p) => (
              <div
                key={p.characterId}
                className="text-xs px-2 py-1 rounded bg-wood-dark text-desert-sand"
              >
                {ROLE_INFO[p.role]?.icon} {p.characterName}
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled time if any */}
        {raid.scheduledFor && (
          <div className="mb-4 text-sm">
            <span className="text-desert-stone">Scheduled for: </span>
            <span className="text-gold-light">
              {new Date(raid.scheduledFor).toLocaleString()}
            </span>
          </div>
        )}

        {/* Actions */}
        {isLeader && raid.status === 'planning' && (
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={onExecute}
              disabled={!canExecute || isExecuting}
            >
              {isExecuting ? 'Executing...' : 'Execute Now'}
            </Button>
            <Button variant="danger" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        )}

        {!isLeader && raid.status === 'planning' && (
          <p className="text-sm text-desert-stone">
            Waiting for leader to execute the raid...
          </p>
        )}

        {/* Result display */}
        {raid.result && (
          <div className={`mt-4 p-3 rounded ${raid.result.success ? 'bg-green-600/20' : 'bg-red-600/20'}`}>
            <p className={`font-bold ${raid.result.success ? 'text-green-400' : 'text-red-400'}`}>
              {raid.result.success ? 'Raid Successful!' : 'Raid Failed'}
            </p>
            {raid.result.success && (
              <p className="text-sm text-gold-light">
                Loot: {formatDollars(raid.result.lootGained)}
              </p>
            )}
            {raid.result.casualties > 0 && (
              <p className="text-sm text-red-400">
                Casualties: {raid.result.casualties}
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Raid history entry
 */
const RaidHistoryEntry: React.FC<{ raid: Raid }> = ({ raid }) => {
  return (
    <div className="p-3 bg-wood-dark/30 rounded flex justify-between items-center">
      <div>
        <p className="font-bold text-desert-sand">{raid.targetName}</p>
        <p className="text-xs text-desert-stone">
          {raid.executedAt ? new Date(raid.executedAt).toLocaleDateString() : 'N/A'}
        </p>
      </div>
      <div className="text-right">
        <StatusBadge status={raid.status} />
        {raid.result && raid.result.success && (
          <p className="text-xs text-gold-light mt-1">
            +{formatDollars(raid.result.lootGained)}
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Main Raids Page
 */
export const Raids: React.FC = () => {
  const navigate = useNavigate();
  const { currentCharacter } = useCharacterStore();

  // State
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [targets, setTargets] = useState<RaidTarget[]>([]);
  const [activeRaids, setActiveRaids] = useState<Raid[]>([]);
  const [raidHistory, setRaidHistory] = useState<Raid[]>([]);
  const [summary, setSummary] = useState<RaidsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Plan raid modal
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<RaidTarget | null>(null);

  const characterId = currentCharacter?._id || '';
  const isInGang = !!currentCharacter?.gangId;

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!characterId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [activeRes, historyRes, summaryRes] = await Promise.all([
        raidService.getActiveRaids(characterId),
        raidService.getRaidHistory(characterId, 10),
        raidService.getGangRaidsSummary(characterId),
      ]);

      if (activeRes.success && activeRes.data) {
        setActiveRaids(activeRes.data.raids || []);
      }
      if (historyRes.success && historyRes.data) {
        setRaidHistory(historyRes.data.raids || []);
      }
      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data.summary);
      }
    } catch (err: any) {
      logger.error('Failed to fetch raid data', err, { context: 'Raids.fetchData' });
      setError('Failed to load raid data');
    } finally {
      setIsLoading(false);
    }
  }, [characterId]);

  // Fetch targets for selected type
  const fetchTargets = useCallback(async (type: string) => {
    if (!characterId) return;

    setIsLoading(true);
    try {
      const response = await raidService.getAvailableTargets(type, characterId);
      if (response.success && response.data) {
        setTargets(response.data.targets || []);
      }
    } catch (err: any) {
      logger.error('Failed to fetch targets', err, { context: 'Raids.fetchTargets' });
      setError('Failed to load raid targets');
    } finally {
      setIsLoading(false);
    }
  }, [characterId]);

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load targets when type changes
  useEffect(() => {
    if (selectedType) {
      fetchTargets(selectedType);
    } else {
      setTargets([]);
    }
  }, [selectedType, fetchTargets]);

  // Handle plan raid
  const handlePlanRaid = async () => {
    if (!selectedTarget || !selectedType) return;

    setIsLoading(true);
    try {
      const response = await raidService.planRaid(characterId, selectedType, selectedTarget.id);
      if (response.success) {
        setShowPlanModal(false);
        setSelectedTarget(null);
        setResultMessage({ type: 'success', message: `Started planning raid on ${selectedTarget.name}!` });
        fetchData();
      } else {
        setResultMessage({ type: 'error', message: response.error || 'Failed to plan raid' });
      }
    } catch (err: any) {
      setResultMessage({ type: 'error', message: err.message || 'Failed to plan raid' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setResultMessage(null), 3000);
    }
  };

  // Handle execute raid
  const handleExecuteRaid = async (raidId: string) => {
    setIsExecuting(true);
    try {
      const response = await raidService.executeRaidNow(raidId, characterId);
      if (response.success && response.data) {
        const result = response.data.result;
        if (result.success) {
          setResultMessage({
            type: 'success',
            message: `Raid successful! Gained ${formatDollars(result.lootGained)}`,
          });
        } else {
          setResultMessage({ type: 'error', message: 'Raid failed!' });
        }
        fetchData();
      } else {
        setResultMessage({ type: 'error', message: response.error || 'Failed to execute raid' });
      }
    } catch (err: any) {
      setResultMessage({ type: 'error', message: err.message || 'Failed to execute raid' });
    } finally {
      setIsExecuting(false);
      setTimeout(() => setResultMessage(null), 5000);
    }
  };

  // Handle cancel raid
  const handleCancelRaid = async (raidId: string) => {
    try {
      const response = await raidService.cancelRaid(raidId, characterId);
      if (response.success) {
        setResultMessage({ type: 'success', message: 'Raid cancelled' });
        fetchData();
      } else {
        setResultMessage({ type: 'error', message: response.error || 'Failed to cancel raid' });
      }
    } catch (err: any) {
      setResultMessage({ type: 'error', message: err.message || 'Failed to cancel raid' });
    } finally {
      setTimeout(() => setResultMessage(null), 3000);
    }
  };

  // Not in gang
  if (!isInGang) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card variant="leather" className="p-8 text-center">
          <div className="text-6xl mb-4">⚔️</div>
          <h1 className="text-2xl font-western text-gold-light mb-4">Gang Required</h1>
          <p className="text-desert-sand mb-6">
            You must be in a gang to participate in raids. Join or create a gang to access this feature.
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
          <h1 className="text-3xl font-western text-gold-light mb-2">Gang Raids</h1>
          <p className="text-desert-sand font-serif">
            Plan and execute raids on properties, treasuries, and enemy territories.
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
          <Button variant="secondary" size="sm" onClick={() => setError(null)}>Dismiss</Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Raids */}
          {activeRaids.length > 0 && (
            <div>
              <h2 className="text-xl font-western text-desert-sand mb-4">Active Raids</h2>
              <div className="space-y-4">
                {activeRaids.map((raid) => (
                  <ActiveRaidCard
                    key={raid._id}
                    raid={raid}
                    characterId={characterId}
                    onExecute={() => handleExecuteRaid(raid._id)}
                    onCancel={() => handleCancelRaid(raid._id)}
                    isExecuting={isExecuting}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Raid Types */}
          <div>
            <h2 className="text-xl font-western text-desert-sand mb-4">Select Raid Type</h2>
            <div className="grid grid-cols-2 gap-4">
              {RAID_TYPES.map((type) => (
                <Card
                  key={type.id}
                  variant={selectedType === type.id ? 'leather' : 'wood'}
                  hover
                  className={`cursor-pointer transition-all ${
                    selectedType === type.id ? 'border-2 border-gold-light' : ''
                  }`}
                  onClick={() => setSelectedType(selectedType === type.id ? null : type.id)}
                >
                  <div className="p-4 text-center">
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <h3 className="font-western text-gold-light">{type.name}</h3>
                    <p className="text-xs text-desert-stone mt-1">{type.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Available Targets */}
          {selectedType && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-western text-desert-sand">
                  Available Targets
                </h2>
                {isLoading && <span className="text-sm text-desert-stone">Loading...</span>}
              </div>

              {targets.length === 0 && !isLoading ? (
                <Card variant="wood" className="p-8 text-center">
                  <p className="text-desert-stone">No targets available for this raid type.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {targets.map((target) => (
                    <RaidTargetCard
                      key={target.id}
                      target={target}
                      onSelect={() => {
                        setSelectedTarget(target);
                        setShowPlanModal(true);
                      }}
                      isDisabled={activeRaids.length > 0}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Stats */}
          <Card variant="wood">
            <div className="p-6">
              <h3 className="text-lg font-western text-desert-sand mb-4">Raid Stats</h3>
              {summary ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-desert-stone">Total Raids</span>
                    <span className="text-gold-light font-bold">{summary.totalRaids}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-desert-stone">Successful</span>
                    <span className="text-green-500 font-bold">{summary.successfulRaids}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-desert-stone">Success Rate</span>
                    <span className="text-gold-light font-bold">
                      {summary.totalRaids > 0
                        ? Math.round((summary.successfulRaids / summary.totalRaids) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-desert-stone">Total Loot</span>
                    <span className="text-gold-light font-bold">{formatDollars(summary.totalLoot)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-desert-stone">Defended</span>
                    <span className="text-blue-400 font-bold">{summary.raidsDefended}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-desert-stone">Loading stats...</p>
              )}
            </div>
          </Card>

          {/* Recent Raids */}
          <Card variant="leather">
            <div className="p-6">
              <h3 className="text-lg font-western text-desert-sand mb-4">Recent Raids</h3>
              <div className="space-y-2">
                {raidHistory.length === 0 ? (
                  <p className="text-sm text-desert-stone text-center py-4">No raid history yet</p>
                ) : (
                  raidHistory.slice(0, 5).map((raid) => (
                    <RaidHistoryEntry key={raid._id} raid={raid} />
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
                      <span className="font-bold text-wood-dark capitalize">{role}</span>
                      <p className="text-xs text-wood-grain">{info.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Plan Raid Modal */}
      <Modal
        isOpen={showPlanModal}
        onClose={() => {
          setShowPlanModal(false);
          setSelectedTarget(null);
        }}
        title="Plan Raid"
      >
        {selectedTarget && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-western text-gold-light">{selectedTarget.name}</h3>
              <p className="text-sm text-desert-stone mt-1">
                {RAID_TYPES.find(t => t.id === selectedType)?.name}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-desert-stone">Owner:</span>
                <span className="ml-2 text-desert-sand">{selectedTarget.ownerName}</span>
              </div>
              <div>
                <span className="text-desert-stone">Defense:</span>
                <span className="ml-2 text-red-400">
                  {'★'.repeat(Math.min(5, Math.ceil(selectedTarget.defenseRating / 20)))}
                </span>
              </div>
              <div>
                <span className="text-desert-stone">Est. Loot:</span>
                <span className="ml-2 text-gold-light">{formatDollars(selectedTarget.estimatedLoot)}</span>
              </div>
              {selectedTarget.gangName && (
                <div>
                  <span className="text-desert-stone">Gang:</span>
                  <span className="ml-2 text-desert-sand">{selectedTarget.gangName}</span>
                </div>
              )}
            </div>

            <div className="border-t border-wood-grain/30 pt-4">
              <p className="text-sm text-desert-stone mb-2">
                Planning a raid will notify your gang members. Once enough members join,
                the raid leader can execute the attack.
              </p>
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
                onClick={handlePlanRaid}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Planning...' : 'Start Planning'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Raids;
