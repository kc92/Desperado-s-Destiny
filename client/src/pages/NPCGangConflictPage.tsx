/**
 * NPC Gang Conflict Page
 * Interface for interacting with NPC gangs: view, pay tribute, challenge territory, missions, and boss fights
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useToast } from '@/store/useToastStore';
import { Card, Button, Modal, ConfirmDialog, EmptyState } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { SkillProgressBar } from '@/components/game/SkillProgressBar';
import {
  useNPCGangConflict,
  NPCGang,
  NPCGangOverview,
  NPCGangMission,
  NPCGangRelationship,
  NPCGangStanding,
  MissionDifficulty,
  ChallengePhase,
} from '@/hooks/useNPCGangConflict';

type ViewTab = 'gangs' | 'missions' | 'relationships';

/** Standing color mapping */
const standingColors: Record<NPCGangStanding, { bg: string; text: string; border: string }> = {
  hostile: { bg: 'bg-red-900/30', text: 'text-red-400', border: 'border-red-500' },
  unfriendly: { bg: 'bg-orange-900/30', text: 'text-orange-400', border: 'border-orange-500' },
  neutral: { bg: 'bg-gray-700/30', text: 'text-gray-400', border: 'border-gray-500' },
  friendly: { bg: 'bg-green-900/30', text: 'text-green-400', border: 'border-green-500' },
  allied: { bg: 'bg-blue-900/30', text: 'text-blue-400', border: 'border-blue-500' },
};

/** Difficulty color mapping */
const difficultyColors: Record<MissionDifficulty, string> = {
  easy: 'text-green-400',
  medium: 'text-yellow-400',
  hard: 'text-orange-400',
  legendary: 'text-purple-400',
};

/** Challenge phase labels */
const challengePhaseLabels: Record<ChallengePhase, string> = {
  none: 'No Challenge',
  initiated: 'Challenge Initiated',
  missions_required: 'Complete Missions',
  ready_for_battle: 'Ready for Battle',
  victory: 'Victory!',
  defeat: 'Defeated',
};

/** Gang Card Component */
const GangCard: React.FC<{
  gang: NPCGang;
  relationship?: NPCGangRelationship;
  onClick: () => void;
}> = ({ gang, relationship, onClick }) => {
  const standing = relationship?.standing || 'neutral';
  const colors = standingColors[standing];

  return (
    <Card
      variant="leather"
      padding="none"
      hover
      onClick={onClick}
      className={`overflow-hidden border-2 ${colors.border}`}
    >
      <div className={`p-4 ${colors.bg}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{gang.iconEmoji}</span>
            <div>
              <h3 className="text-lg font-western text-desert-sand">{gang.name}</h3>
              <p className="text-sm text-desert-stone">[{gang.tag}]</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${colors.text} ${colors.bg}`}>
            {standing}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="text-center p-2 bg-wood-dark/30 rounded">
            <div className="text-lg font-bold text-gold-light">{gang.strength}</div>
            <div className="text-xs text-desert-stone">Strength</div>
          </div>
          <div className="text-center p-2 bg-wood-dark/30 rounded">
            <div className="text-lg font-bold text-gold-light">{gang.territories.length}</div>
            <div className="text-xs text-desert-stone">Territories</div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-desert-sand line-clamp-2 mb-3">{gang.description}</p>

        {/* Challenge Status */}
        {relationship?.challengePhase && relationship.challengePhase !== 'none' && (
          <div className="p-2 bg-gold-dark/20 rounded border border-gold-light/30">
            <div className="text-xs text-gold-light font-bold">
              {challengePhaseLabels[relationship.challengePhase]}
            </div>
            {relationship.challengePhase === 'missions_required' && (
              <div className="text-xs text-desert-sand mt-1">
                {relationship.challengeMissionsCompleted}/{relationship.challengeMissionsRequired} missions
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

/** Mission Card Component */
const MissionCard: React.FC<{
  mission: NPCGangMission;
  onAccept: () => void;
  onComplete: () => void;
  isLoading: boolean;
}> = ({ mission, onAccept, onComplete, isLoading }) => {
  const difficultyColor = difficultyColors[mission.difficulty];

  return (
    <Card variant="wood" padding="sm" className="border border-wood-grain/30">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-western text-desert-sand">{mission.title}</h4>
          <span className={`text-xs font-bold uppercase ${difficultyColor}`}>
            {mission.difficulty}
          </span>
        </div>
        <div className="text-right">
          <div className="text-gold-light font-bold">${mission.rewards.gold}</div>
          <div className="text-xs text-desert-stone">{mission.rewards.xp} XP</div>
        </div>
      </div>

      <p className="text-sm text-desert-stone mb-3">{mission.description}</p>

      {/* Objectives */}
      <div className="mb-3">
        <div className="text-xs text-desert-stone mb-1">Objectives:</div>
        <ul className="text-sm text-desert-sand space-y-1">
          {mission.objectives.map((obj, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-gold-light">*</span>
              {obj}
            </li>
          ))}
        </ul>
      </div>

      {/* Requirements */}
      {mission.requirements.level > 1 && (
        <div className="text-xs text-desert-stone mb-3">
          Requires: Level {mission.requirements.level}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {mission.status === 'available' && (
          <Button
            size="sm"
            variant="primary"
            onClick={onAccept}
            isLoading={isLoading}
            loadingText="Accepting..."
          >
            Accept Mission
          </Button>
        )}
        {mission.status === 'active' && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onComplete}
            isLoading={isLoading}
            loadingText="Completing..."
          >
            Complete Mission
          </Button>
        )}
      </div>
    </Card>
  );
};

/** Relationship Card Component */
const RelationshipCard: React.FC<{
  relationship: NPCGangRelationship;
  gang?: NPCGang;
  onPayTribute: () => void;
  isLoading: boolean;
}> = ({ relationship, gang, onPayTribute, isLoading }) => {
  const colors = standingColors[relationship.standing];

  return (
    <Card variant="leather" padding="sm" className={`border-2 ${colors.border}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{gang?.iconEmoji || '👥'}</span>
          <div>
            <h4 className="font-western text-desert-sand">{relationship.gangName}</h4>
            <span className={`text-sm font-bold ${colors.text}`}>
              {relationship.standing.charAt(0).toUpperCase() + relationship.standing.slice(1)}
            </span>
          </div>
        </div>
        {relationship.isAtWar && (
          <div className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
            AT WAR
          </div>
        )}
      </div>

      {/* Standing Progress */}
      <div className="mb-3">
        <SkillProgressBar
          current={relationship.standingPoints}
          max={1000}
          label="Standing"
          color="gold"
          showPercentage={false}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <span className="text-desert-stone">Missions Completed:</span>
          <span className="text-desert-sand ml-2">{relationship.missionsCompleted}</span>
        </div>
        <div>
          <span className="text-desert-stone">Tribute Owed:</span>
          <span className="text-gold-light ml-2">${relationship.tributeOwed}</span>
        </div>
      </div>

      {/* Tribute Button */}
      {relationship.tributeOwed > 0 && (
        <Button
          size="sm"
          variant="secondary"
          onClick={onPayTribute}
          isLoading={isLoading}
          loadingText="Paying..."
          className="w-full"
        >
          Pay Tribute (${relationship.tributeOwed})
        </Button>
      )}
    </Card>
  );
};

/** Gang Detail Modal Content */
const GangDetailModal: React.FC<{
  overview: NPCGangOverview;
  onPayTribute: (amount?: number) => void;
  onChallenge: () => void;
  onAcceptMission: (missionId: string) => void;
  onCompleteMission: (missionId: string) => void;
  onBossFight: () => void;
  isLoading: boolean;
  playerLevel: number;
  playerGold: number;
}> = ({
  overview,
  onPayTribute,
  onChallenge,
  onAcceptMission,
  onCompleteMission,
  onBossFight,
  isLoading,
  playerLevel,
  playerGold,
}) => {
  const { gang, relationship, availableMissions, canChallenge, challengeRequirements } = overview;
  const colors = standingColors[relationship.standing];

  const canStartChallenge =
    canChallenge &&
    playerLevel >= challengeRequirements.levelRequired &&
    playerGold >= challengeRequirements.goldRequired;

  return (
    <div className="space-y-6">
      {/* Gang Header */}
      <div className={`p-4 rounded-lg ${colors.bg} border ${colors.border}`}>
        <div className="flex items-start gap-4">
          <span className="text-6xl">{gang.iconEmoji}</span>
          <div className="flex-1">
            <h3 className="text-2xl font-western text-desert-sand">{gang.name}</h3>
            <p className="text-desert-stone mb-2">{gang.faction}</p>
            <p className="text-sm text-desert-sand">{gang.description}</p>
          </div>
          <div className="text-right">
            <div className={`px-3 py-1 rounded font-bold ${colors.text} ${colors.bg} border ${colors.border}`}>
              {relationship.standing.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Leader Info */}
      <Card variant="wood" padding="sm">
        <h4 className="text-lg font-western text-gold-light mb-2">Leader: {gang.leader.name}</h4>
        <p className="text-sm text-desert-stone mb-1">{gang.leader.title}</p>
        <p className="text-sm text-desert-sand mb-2">{gang.leader.description}</p>
        <div className="flex gap-2 flex-wrap">
          {gang.leader.specialAbilities.map((ability, i) => (
            <span key={i} className="px-2 py-1 bg-blood-red/30 text-blood-crimson text-xs rounded">
              {ability}
            </span>
          ))}
        </div>
        <div className="mt-2 text-sm">
          <span className="text-desert-stone">Combat Power:</span>
          <span className="text-gold-light font-bold ml-2">{gang.leader.combatPower}</span>
        </div>
      </Card>

      {/* Territories */}
      <div>
        <h4 className="text-lg font-western text-desert-sand mb-3">Controlled Territories</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {gang.territories.map((territory) => (
            <div key={territory.id} className="p-3 bg-wood-dark/30 rounded border border-wood-grain/30">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-desert-sand">{territory.name}</span>
                <span className="text-xs text-gold-light">{territory.controlStrength}% Control</span>
              </div>
              <p className="text-xs text-desert-stone mb-2">{territory.description}</p>
              <div className="flex flex-wrap gap-1">
                {territory.bonuses.map((bonus, i) => (
                  <span key={i} className="px-1 py-0.5 bg-gold-dark/20 text-gold-light text-xs rounded">
                    {bonus}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tribute */}
        <Card variant="leather" padding="sm">
          <h4 className="text-lg font-western text-desert-sand mb-2">Pay Tribute</h4>
          <p className="text-sm text-desert-stone mb-3">
            Keep the peace by paying your dues. Tribute rate: ${gang.tributeRate}
          </p>
          {relationship.tributeOwed > 0 && (
            <p className="text-sm text-gold-light mb-2">
              Outstanding: ${relationship.tributeOwed}
            </p>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onPayTribute(gang.tributeRate)}
            isLoading={isLoading}
            disabled={playerGold < gang.tributeRate}
          >
            {playerGold < gang.tributeRate ? 'Insufficient Gold' : `Pay $${gang.tributeRate}`}
          </Button>
        </Card>

        {/* Challenge Territory */}
        <Card variant="leather" padding="sm">
          <h4 className="text-lg font-western text-desert-sand mb-2">Challenge Territory</h4>
          <div className="text-sm text-desert-stone mb-3 space-y-1">
            <div>Level Required: <span className={playerLevel >= challengeRequirements.levelRequired ? 'text-green-400' : 'text-red-400'}>{challengeRequirements.levelRequired}</span></div>
            <div>Gold Required: <span className={playerGold >= challengeRequirements.goldRequired ? 'text-green-400' : 'text-red-400'}>${challengeRequirements.goldRequired}</span></div>
          </div>
          {relationship.challengePhase === 'none' && (
            <Button
              size="sm"
              variant="danger"
              onClick={onChallenge}
              isLoading={isLoading}
              disabled={!canStartChallenge}
            >
              {canStartChallenge ? 'Issue Challenge' : 'Requirements Not Met'}
            </Button>
          )}
          {relationship.challengePhase === 'missions_required' && (
            <div className="text-sm text-gold-light">
              Complete {relationship.challengeMissionsRequired - relationship.challengeMissionsCompleted} more missions
            </div>
          )}
          {relationship.challengePhase === 'ready_for_battle' && (
            <Button
              size="sm"
              variant="danger"
              onClick={onBossFight}
              isLoading={isLoading}
            >
              Fight {gang.leader.name}!
            </Button>
          )}
        </Card>
      </div>

      {/* Available Missions */}
      {availableMissions.length > 0 && (
        <div>
          <h4 className="text-lg font-western text-desert-sand mb-3">Available Missions</h4>
          <div className="space-y-3">
            {availableMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onAccept={() => onAcceptMission(mission.id)}
                onComplete={() => onCompleteMission(mission.id)}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>
      )}

      {/* Special Features */}
      {gang.specialFeatures.length > 0 && (
        <div>
          <h4 className="text-lg font-western text-desert-sand mb-2">Benefits of Alliance</h4>
          <div className="flex flex-wrap gap-2">
            {gang.specialFeatures.map((feature, i) => (
              <span key={i} className="px-3 py-1 bg-gold-dark/20 text-gold-light text-sm rounded border border-gold-light/30">
                {feature}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Lore */}
      <Card variant="parchment" padding="sm">
        <h4 className="text-lg font-western text-wood-dark mb-2">History</h4>
        <p className="text-sm text-wood-grain italic">"{gang.lore}"</p>
      </Card>
    </div>
  );
};

/**
 * NPC Gang Conflict Page Component
 */
export const NPCGangConflictPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentCharacter } = useCharacterStore();
  const { success, error: showError } = useToast();

  const {
    gangs,
    relationships,
    selectedGang,
    isLoading,
    error,
    fetchAllGangs,
    fetchRelationships,
    fetchGangOverview,
    payTribute,
    challengeTerritory,
    acceptMission,
    completeMission,
    initiateBossFight,
    clearSelectedGang,
    clearError,
  } = useNPCGangConflict();

  const [activeTab, setActiveTab] = useState<ViewTab>('gangs');
  const [showGangDetail, setShowGangDetail] = useState(false);
  const [showTributeConfirm, setShowTributeConfirm] = useState(false);
  const [tributeGangId, setTributeGangId] = useState<string | null>(null);
  const [tributeAmount, setTributeAmount] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  // Load data on mount
  useEffect(() => {
    fetchAllGangs();
    fetchRelationships();
  }, [fetchAllGangs, fetchRelationships]);

  // Get relationship for a gang
  const getRelationship = useCallback(
    (gangId: string) => relationships.find((r) => r.gangId === gangId),
    [relationships]
  );

  // Handle gang card click
  const handleGangClick = useCallback(
    async (gang: NPCGang) => {
      await fetchGangOverview(gang.id);
      setShowGangDetail(true);
    },
    [fetchGangOverview]
  );

  // Handle close detail modal
  const handleCloseDetail = useCallback(() => {
    setShowGangDetail(false);
    clearSelectedGang();
  }, [clearSelectedGang]);

  // Handle pay tribute
  const handlePayTribute = useCallback(
    async (gangId: string, amount: number) => {
      setTributeGangId(gangId);
      setTributeAmount(amount);
      setShowTributeConfirm(true);
    },
    []
  );

  // Confirm tribute payment
  const confirmTribute = useCallback(async () => {
    if (!tributeGangId) return;

    setActionLoading(true);
    const result = await payTribute(tributeGangId, tributeAmount);
    setActionLoading(false);
    setShowTributeConfirm(false);

    if (result.success) {
      success('Tribute Paid', result.message);
      if (selectedGang) {
        await fetchGangOverview(selectedGang.gang.id);
      }
    } else {
      showError('Payment Failed', result.message);
    }
  }, [tributeGangId, tributeAmount, payTribute, selectedGang, fetchGangOverview, success, showError]);

  // Handle challenge territory
  const handleChallenge = useCallback(async () => {
    if (!selectedGang) return;

    setActionLoading(true);
    const result = await challengeTerritory(selectedGang.gang.id);
    setActionLoading(false);

    if (result.success) {
      success('Challenge Issued!', result.message);
      await fetchGangOverview(selectedGang.gang.id);
    } else {
      showError('Challenge Failed', result.message);
    }
  }, [selectedGang, challengeTerritory, fetchGangOverview, success, showError]);

  // Handle accept mission
  const handleAcceptMission = useCallback(
    async (missionId: string) => {
      if (!selectedGang) return;

      setActionLoading(true);
      const result = await acceptMission(selectedGang.gang.id, missionId);
      setActionLoading(false);

      if (result.success) {
        success('Mission Accepted', result.message);
        await fetchGangOverview(selectedGang.gang.id);
      } else {
        showError('Failed', result.message);
      }
    },
    [selectedGang, acceptMission, fetchGangOverview, success, showError]
  );

  // Handle complete mission
  const handleCompleteMission = useCallback(
    async (missionId: string) => {
      if (!selectedGang) return;

      setActionLoading(true);
      const result = await completeMission(selectedGang.gang.id, missionId);
      setActionLoading(false);

      if (result.success) {
        success('Mission Complete!', result.message);
        await fetchGangOverview(selectedGang.gang.id);
      } else {
        showError('Failed', result.message);
      }
    },
    [selectedGang, completeMission, fetchGangOverview, success, showError]
  );

  // Handle boss fight
  const handleBossFight = useCallback(async () => {
    if (!selectedGang) return;

    setActionLoading(true);
    const bossFight = await initiateBossFight(selectedGang.gang.id);
    setActionLoading(false);

    if (bossFight) {
      // Navigate to combat page or show boss fight modal
      success('Battle Begins!', `Prepare to face ${bossFight.bossName}!`);
      navigate('/game/combat');
    } else {
      showError('Failed', 'Could not initiate boss fight');
    }
  }, [selectedGang, initiateBossFight, navigate, success, showError]);

  // Handle error display
  useEffect(() => {
    if (error) {
      showError('Error', error);
      clearError();
    }
  }, [error, showError, clearError]);

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-western text-gold-light flex items-center gap-3">
            <span>👥</span>
            NPC Gang Conflict
          </h1>
          <p className="text-desert-stone mt-1">
            Navigate the dangerous politics of the frontier's most powerful gangs
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-wood-grain/30 pb-2">
        <button
          onClick={() => setActiveTab('gangs')}
          className={`px-4 py-2 rounded-t-lg font-serif transition-colors ${
            activeTab === 'gangs'
              ? 'bg-wood-dark text-gold-light border-b-2 border-gold-light'
              : 'text-desert-stone hover:text-desert-sand'
          }`}
        >
          NPC Gangs ({gangs.length})
        </button>
        <button
          onClick={() => setActiveTab('relationships')}
          className={`px-4 py-2 rounded-t-lg font-serif transition-colors ${
            activeTab === 'relationships'
              ? 'bg-wood-dark text-gold-light border-b-2 border-gold-light'
              : 'text-desert-stone hover:text-desert-sand'
          }`}
        >
          Relationships ({relationships.length})
        </button>
        <button
          onClick={() => setActiveTab('missions')}
          className={`px-4 py-2 rounded-t-lg font-serif transition-colors ${
            activeTab === 'missions'
              ? 'bg-wood-dark text-gold-light border-b-2 border-gold-light'
              : 'text-desert-stone hover:text-desert-sand'
          }`}
        >
          Active Missions
        </button>
      </div>

      {/* Loading State */}
      {isLoading && !showGangDetail && (
        <div aria-busy="true" aria-live="polite">
          <CardGridSkeleton count={4} columns={2} />
        </div>
      )}

      {/* Gangs Tab */}
      {activeTab === 'gangs' && !isLoading && (
        <>
          {gangs.length === 0 ? (
            <EmptyState
              icon="🏴"
              title="No Gangs Found"
              description="There are no NPC gangs in this region yet."
              size="lg"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gangs.map((gang) => (
                <GangCard
                  key={gang.id}
                  gang={gang}
                  relationship={getRelationship(gang.id)}
                  onClick={() => handleGangClick(gang)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Relationships Tab */}
      {activeTab === 'relationships' && !isLoading && (
        <>
          {relationships.length === 0 ? (
            <EmptyState
              icon="🤝"
              title="No Relationships"
              description="You haven't interacted with any NPC gangs yet. Visit gangs to establish relationships."
              actionText="View Gangs"
              onAction={() => setActiveTab('gangs')}
              size="lg"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relationships.map((rel) => (
                <RelationshipCard
                  key={rel.gangId}
                  relationship={rel}
                  gang={gangs.find((g) => g.id === rel.gangId)}
                  onPayTribute={() => handlePayTribute(rel.gangId, rel.tributeOwed)}
                  isLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Missions Tab */}
      {activeTab === 'missions' && !isLoading && (
        <Card variant="wood" padding="md">
          <h3 className="text-xl font-western text-desert-sand mb-4">Active Missions</h3>
          <p className="text-desert-stone mb-4">
            Select a gang to view and accept missions. Complete missions to improve your standing and progress toward territory challenges.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gangs.map((gang) => (
              <Card
                key={gang.id}
                variant="leather"
                padding="sm"
                hover
                onClick={() => handleGangClick(gang)}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{gang.iconEmoji}</span>
                  <div>
                    <h4 className="font-western text-desert-sand">{gang.name}</h4>
                    <p className="text-sm text-desert-stone">View missions</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Gang Detail Modal */}
      {showGangDetail && selectedGang && (
        <Modal
          isOpen={true}
          onClose={handleCloseDetail}
          title={selectedGang.gang.name}
          size="xl"
        >
          <GangDetailModal
            overview={selectedGang}
            onPayTribute={(amount) => handlePayTribute(selectedGang.gang.id, amount || selectedGang.gang.tributeRate)}
            onChallenge={handleChallenge}
            onAcceptMission={handleAcceptMission}
            onCompleteMission={handleCompleteMission}
            onBossFight={handleBossFight}
            isLoading={actionLoading}
            playerLevel={currentCharacter.level}
            playerGold={currentCharacter.gold}
          />
        </Modal>
      )}

      {/* Tribute Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showTributeConfirm}
        title="Pay Tribute"
        message={`Pay $${tributeAmount} in tribute to maintain peace?`}
        confirmText={`Pay $${tributeAmount}`}
        cancelText="Cancel"
        confirmVariant="primary"
        onConfirm={confirmTribute}
        onCancel={() => setShowTributeConfirm(false)}
        isLoading={actionLoading}
        icon="💰"
      />
    </div>
  );
};

export default NPCGangConflictPage;
