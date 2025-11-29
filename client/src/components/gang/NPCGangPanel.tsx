/**
 * NPC Gang Panel Component
 * Displays NPC gangs with relationships, missions, and territory challenges
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Modal } from '@/components/ui';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import npcGangService, {
  NPCGang,
  NPCGangOverview,
  NPCGangRelationship,
  NPCGangMission,
} from '@/services/npcGang.service';
import { formatGold } from '@/utils/format';

interface NPCGangPanelProps {
  playerGangId: string;
  playerGangLevel: number;
  gangTreasury: number;
  onTributesPaid?: () => void;
}

/**
 * Get attitude color for relationship status
 */
const getAttitudeColor = (_attitude: string, reputation: number): string => {
  if (reputation >= 50) return 'text-green-400';
  if (reputation >= 20) return 'text-blue-400';
  if (reputation >= 0) return 'text-desert-sand';
  if (reputation >= -20) return 'text-yellow-400';
  return 'text-red-400';
};

/**
 * Get attitude label
 */
const getAttitudeLabel = (reputation: number): string => {
  if (reputation >= 50) return 'Allied';
  if (reputation >= 20) return 'Friendly';
  if (reputation >= 0) return 'Neutral';
  if (reputation >= -20) return 'Unfriendly';
  return 'Hostile';
};

/**
 * Get specialty icon
 */
const getSpecialtyIcon = (specialty: string): string => {
  const icons: Record<string, string> = {
    SMUGGLING: '📦',
    BORDER_RAIDS: '🏴',
    AMBUSHES: '🎯',
    TRACKING: '🔍',
    WILDERNESS: '🌲',
    HIT_AND_RUN: '💨',
    INDUSTRIAL: '🏭',
    HIRED_GUNS: '🔫',
    LEGAL_PRESSURE: '⚖️',
    ECONOMIC_WARFARE: '💰',
    CORRUPTION: '🎭',
    ASSASSINATION: '🗡️',
  };
  return icons[specialty] || '⚔️';
};

/**
 * Mission type icon
 */
const getMissionTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    DELIVERY: '📦',
    PROTECTION: '🛡️',
    SABOTAGE: '💥',
    ESPIONAGE: '🕵️',
    TERRITORY_DEFENSE: '🏰',
    ASSASSINATION: '🗡️',
  };
  return icons[type] || '📜';
};

/**
 * NPC Gang Card - Shows a single NPC gang
 */
const NPCGangCard: React.FC<{
  gang: NPCGang;
  relationship?: NPCGangRelationship;
  onSelect: () => void;
}> = ({ gang, relationship, onSelect }) => {
  const reputation = relationship?.reputation || 0;
  const attitudeLabel = getAttitudeLabel(reputation);
  const attitudeColor = getAttitudeColor(gang.attitude, reputation);

  return (
    <div
      className="p-4 bg-wood-darker rounded-lg border border-wood-light/30 hover:border-gold-dark/50 transition-all cursor-pointer"
      onClick={onSelect}
    >
      {/* Gang Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-western text-gold-light text-lg">{gang.name}</h3>
          <p className="text-desert-stone text-xs">Led by {gang.leader.name}</p>
        </div>
        <div className={`text-sm font-bold ${attitudeColor}`}>
          {attitudeLabel}
          <div className="text-xs text-desert-stone">Rep: {reputation}</div>
        </div>
      </div>

      {/* Gang Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div className="text-desert-sand">
          <span className="text-desert-stone">Strength:</span> {gang.strength}
        </div>
        <div className="text-desert-sand">
          <span className="text-desert-stone">Tribute:</span> {formatGold(gang.tributeCost)}
        </div>
      </div>

      {/* Specialties */}
      <div className="flex flex-wrap gap-1 mb-3">
        {gang.specialty.map((spec, i) => (
          <span
            key={i}
            className="text-xs px-2 py-1 bg-leather-brown/30 rounded text-desert-sand"
          >
            {getSpecialtyIcon(spec)} {spec.replace(/_/g, ' ')}
          </span>
        ))}
      </div>

      {/* Controlled Zones */}
      <div className="text-xs text-desert-stone">
        <span className="text-desert-dust">Controls:</span>{' '}
        {gang.controlledZones.length} zone{gang.controlledZones.length !== 1 ? 's' : ''}
      </div>

      {/* Available Missions Indicator */}
      {gang.missions && gang.missions.length > 0 && (
        <div className="mt-2 text-xs text-gold-light">
          {gang.missions.filter(m => reputation >= m.minRelationship).length} missions available
        </div>
      )}
    </div>
  );
};

/**
 * Mission Card - Shows a single mission
 */
const MissionCard: React.FC<{
  mission: NPCGangMission;
  canAccept: boolean;
  onAccept: () => void;
  isLoading?: boolean;
}> = ({ mission, canAccept, onAccept, isLoading }) => {
  return (
    <div className="p-3 bg-leather/10 rounded border border-wood-light/20">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getMissionTypeIcon(mission.type)}</span>
          <div>
            <h4 className="font-bold text-desert-sand">{mission.name}</h4>
            <p className="text-xs text-desert-stone">
              Difficulty: {'⭐'.repeat(Math.min(mission.difficulty, 10))}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant={canAccept ? 'primary' : 'secondary'}
          disabled={!canAccept || isLoading}
          onClick={onAccept}
        >
          {isLoading ? 'Accepting...' : canAccept ? 'Accept' : 'Locked'}
        </Button>
      </div>

      <p className="text-sm text-desert-dust mb-2">{mission.description}</p>

      {/* Requirements */}
      <div className="text-xs space-y-1 mb-2">
        {mission.requirements.map((req, i) => (
          <div key={i} className="text-desert-stone">
            • {req.description}
          </div>
        ))}
        {mission.minRelationship > 0 && (
          <div className="text-desert-stone">
            • Requires {mission.minRelationship}+ reputation
          </div>
        )}
      </div>

      {/* Rewards */}
      <div className="flex flex-wrap gap-2 text-xs">
        {mission.rewards.map((reward, i) => (
          <span key={i} className="px-2 py-1 bg-gold-dark/20 text-gold-light rounded">
            {reward.description}
          </span>
        ))}
      </div>
    </div>
  );
};

/**
 * NPC Gang Detail Modal
 */
const NPCGangDetailModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  gang: NPCGang | null;
  overview: NPCGangOverview | null;
  playerGangLevel: number;
  gangTreasury: number;
  onPayTribute: () => Promise<void>;
  onAcceptMission: (missionId: string) => Promise<void>;
  onChallengeTerritory: (zoneId: string) => Promise<void>;
  isLoading: boolean;
}> = ({
  isOpen,
  onClose,
  gang,
  overview,
  playerGangLevel,
  gangTreasury,
  onPayTribute,
  onAcceptMission,
  onChallengeTerritory,
  isLoading,
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'missions' | 'challenge'>('overview');

  if (!gang) return null;

  const relationship = overview?.relationship;
  const reputation = relationship?.reputation || 0;
  const canAffordTribute = gangTreasury >= gang.tributeCost;
  const availableMissions = overview?.availableMissions || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={gang.name}
      size="lg"
    >
      <div className="space-y-4">
        {/* Leader Info */}
        <div className="p-4 bg-wood-darker rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-western text-gold-light">{gang.leader.name}</h3>
              <p className="text-desert-stone text-sm italic">"{gang.leader.title}"</p>
              <p className="text-desert-sand text-sm mt-2">{gang.leader.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gold-light">Lvl {gang.leader.level}</div>
              <div className="text-xs text-desert-stone">{gang.leader.maxHP} HP</div>
            </div>
          </div>

          {/* Leader Abilities */}
          <div className="mt-3 flex flex-wrap gap-2">
            {gang.leader.abilities.map((ability, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 bg-blood-red/20 text-red-300 rounded"
              >
                {ability}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-wood-light/30 pb-2">
          <button
            className={`px-4 py-2 rounded-t font-western ${
              activeTab === 'overview'
                ? 'bg-wood-dark text-gold-light'
                : 'text-desert-stone hover:text-desert-sand'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-4 py-2 rounded-t font-western ${
              activeTab === 'missions'
                ? 'bg-wood-dark text-gold-light'
                : 'text-desert-stone hover:text-desert-sand'
            }`}
            onClick={() => setActiveTab('missions')}
          >
            Missions ({availableMissions.length})
          </button>
          <button
            className={`px-4 py-2 rounded-t font-western ${
              activeTab === 'challenge'
                ? 'bg-wood-dark text-gold-light'
                : 'text-desert-stone hover:text-desert-sand'
            }`}
            onClick={() => setActiveTab('challenge')}
          >
            Challenge
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Relationship */}
            <div className="p-4 bg-leather/10 rounded">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-desert-sand">Your Relationship</h4>
                <div className={`text-lg font-bold ${getAttitudeColor(gang.attitude, reputation)}`}>
                  {getAttitudeLabel(reputation)} ({reputation})
                </div>
              </div>

              {/* Reputation Bar */}
              <div className="h-3 bg-wood-darker rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full transition-all ${
                    reputation >= 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.abs(reputation))}%` }}
                />
              </div>

              {/* Pay Tribute */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-desert-sand">Pay Tribute</p>
                  <p className="text-xs text-desert-stone">
                    Cost: {formatGold(gang.tributeCost)} | +15 reputation
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  disabled={!canAffordTribute || isLoading}
                  onClick={onPayTribute}
                >
                  {isLoading ? 'Paying...' : canAffordTribute ? 'Pay Tribute' : 'Need More Gold'}
                </Button>
              </div>
            </div>

            {/* Gang Backstory */}
            <div className="p-4 bg-leather/10 rounded">
              <h4 className="font-bold text-desert-sand mb-2">Backstory</h4>
              <p className="text-sm text-desert-dust italic">{gang.backstory}</p>
            </div>

            {/* Controlled Zones */}
            <div className="p-4 bg-leather/10 rounded">
              <h4 className="font-bold text-desert-sand mb-2">Controlled Territory</h4>
              <div className="flex flex-wrap gap-2">
                {gang.controlledZones.map((zone, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 bg-wood-dark text-desert-sand rounded"
                  >
                    📍 {zone.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'missions' && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {availableMissions.length === 0 ? (
              <div className="text-center py-8 text-desert-stone">
                <p className="text-2xl mb-2">🔒</p>
                <p>No missions available.</p>
                <p className="text-sm">Improve your reputation to unlock missions.</p>
              </div>
            ) : (
              availableMissions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  canAccept={
                    reputation >= mission.minRelationship &&
                    mission.requirements.every((req) => {
                      if (req.type === 'LEVEL') return playerGangLevel >= req.value;
                      return true;
                    })
                  }
                  onAccept={() => onAcceptMission(mission.id)}
                  isLoading={isLoading}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'challenge' && (
          <div className="space-y-4">
            {playerGangLevel < 15 ? (
              <div className="text-center py-8 text-desert-stone">
                <p className="text-2xl mb-2">⚔️</p>
                <p>Territory challenges unlock at Gang Level 15</p>
                <p className="text-sm mt-2">Current Level: {playerGangLevel}</p>
              </div>
            ) : (
              <>
                <div className="p-4 bg-blood-red/10 rounded border border-blood-red/30">
                  <h4 className="font-bold text-red-400 mb-2">Challenge for Territory</h4>
                  <p className="text-sm text-desert-sand mb-3">
                    Challenge {gang.name} for control of one of their zones.
                    This will start a war that requires completing missions and a final battle.
                  </p>

                  <div className="space-y-2 mb-4">
                    <label className="text-sm text-desert-stone">Select Zone to Challenge:</label>
                    <select
                      className="w-full p-2 bg-wood-dark border border-wood-light/30 rounded text-desert-sand"
                      value={selectedZone}
                      onChange={(e) => setSelectedZone(e.target.value)}
                    >
                      <option value="">-- Select Zone --</option>
                      {gang.controlledZones.map((zone) => (
                        <option key={zone} value={zone}>
                          {zone.replace(/-/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    variant="danger"
                    disabled={!selectedZone || isLoading}
                    onClick={() => onChallengeTerritory(selectedZone)}
                    className="w-full"
                  >
                    {isLoading ? 'Starting Challenge...' : 'Start Territory Challenge'}
                  </Button>
                </div>

                {/* Challenge Requirements */}
                <div className="p-4 bg-leather/10 rounded">
                  <h4 className="font-bold text-desert-sand mb-2">Challenge Requirements</h4>
                  <ul className="text-sm text-desert-dust space-y-1">
                    <li>• Gang Level 15+ ✓</li>
                    <li>• Complete 3 challenge missions</li>
                    <li>• Win final battle against {gang.leader.name}</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

/**
 * Main NPC Gang Panel Component
 */
export const NPCGangPanel: React.FC<NPCGangPanelProps> = ({
  playerGangId,
  playerGangLevel,
  gangTreasury,
  onTributesPaid,
}) => {
  const [npcGangs, setNPCGangs] = useState<NPCGang[]>([]);
  const [relationships, setRelationships] = useState<Record<string, NPCGangRelationship>>({});
  const [selectedGang, setSelectedGang] = useState<NPCGang | null>(null);
  const [selectedGangOverview, setSelectedGangOverview] = useState<NPCGangOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load NPC gangs and relationships
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [gangsData, relationshipsData] = await Promise.all([
        npcGangService.getAllGangs(),
        npcGangService.getAllRelationships(),
      ]);

      setNPCGangs(gangsData);

      // Index relationships by NPC gang ID
      const relMap: Record<string, NPCGangRelationship> = {};
      relationshipsData.forEach((rel) => {
        relMap[rel.npcGangId] = rel;
      });
      setRelationships(relMap);
    } catch (err: any) {
      console.error('Failed to load NPC gang data:', err);
      setError(err.message || 'Failed to load NPC gang data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load gang overview when selected
  const loadGangOverview = useCallback(async (gangId: string) => {
    try {
      const overview = await npcGangService.getGangOverview(gangId);
      setSelectedGangOverview(overview);
    } catch (err: any) {
      console.error('Failed to load gang overview:', err);
    }
  }, []);

  useEffect(() => {
    if (playerGangId) {
      loadData();
    }
  }, [playerGangId, loadData]);

  useEffect(() => {
    if (selectedGang) {
      loadGangOverview(selectedGang.id);
    }
  }, [selectedGang, loadGangOverview]);

  // Handle paying tribute
  const handlePayTribute = async () => {
    if (!selectedGang) return;

    try {
      setIsActionLoading(true);
      const result = await npcGangService.payTribute(selectedGang.id);
      setSuccessMessage(result.message);
      await loadData();
      await loadGangOverview(selectedGang.id);
      onTributesPaid?.();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to pay tribute');
      setTimeout(() => setError(null), 4000);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle accepting mission
  const handleAcceptMission = async (missionId: string) => {
    if (!selectedGang) return;

    try {
      setIsActionLoading(true);
      const result = await npcGangService.acceptMission(selectedGang.id, missionId);
      setSuccessMessage(result.message);
      await loadGangOverview(selectedGang.id);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to accept mission');
      setTimeout(() => setError(null), 4000);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle territory challenge
  const handleChallengeTerritory = async (zoneId: string) => {
    if (!selectedGang) return;

    try {
      setIsActionLoading(true);
      const result = await npcGangService.challengeTerritory(selectedGang.id, zoneId);
      setSuccessMessage(result.message);
      await loadData();
      await loadGangOverview(selectedGang.id);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to start territory challenge');
      setTimeout(() => setError(null), 4000);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card variant="leather">
        <div className="p-6">
          <h2 className="text-xl font-western text-gold-light mb-4">NPC Gangs</h2>
          <ListItemSkeleton count={4} />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card variant="leather">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-western text-gold-light">NPC Gangs</h2>
            <span className="text-sm text-desert-stone">
              {npcGangs.length} rival gangs in the territory
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-blood-red/20 border border-blood-red/50 rounded text-red-300 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-600/20 border border-green-600/50 rounded text-green-300 text-sm">
              {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {npcGangs.map((gang) => (
              <NPCGangCard
                key={gang.id}
                gang={gang}
                relationship={relationships[gang.id]}
                onSelect={() => setSelectedGang(gang)}
              />
            ))}
          </div>

          {npcGangs.length === 0 && (
            <div className="text-center py-8 text-desert-stone">
              <p className="text-2xl mb-2">🏜️</p>
              <p>No NPC gangs found in the territory.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Gang Detail Modal */}
      <NPCGangDetailModal
        isOpen={!!selectedGang}
        onClose={() => {
          setSelectedGang(null);
          setSelectedGangOverview(null);
        }}
        gang={selectedGang}
        overview={selectedGangOverview}
        playerGangLevel={playerGangLevel}
        gangTreasury={gangTreasury}
        onPayTribute={handlePayTribute}
        onAcceptMission={handleAcceptMission}
        onChallengeTerritory={handleChallengeTerritory}
        isLoading={isActionLoading}
      />
    </>
  );
};

export default NPCGangPanel;
