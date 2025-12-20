/**
 * Mentor Page
 * Interface for finding mentors, training with them, and unlocking abilities
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useToast } from '@/store/useToastStore';
import { Card, Button, Modal, ConfirmDialog, EmptyState } from '@/components/ui';
import { CardGridSkeleton } from '@/components/ui/Skeleton';
import { SkillProgressBar } from '@/components/game/SkillProgressBar';
import {
  useMentors,
  Mentor,
  MentorAbility,
  MentorRelationship,
  MentorSpecialization,
  MentorAvailability,
  TrainingType,
  AbilityStatus,
  ActiveMentorship,
} from '@/hooks/useMentors';
import { dispatchTrainingStarted } from '@/utils/tutorialEvents';

type ViewTab = 'browse' | 'current' | 'abilities' | 'history';

/** Specialization icons */
const specializationIcons: Record<MentorSpecialization, string> = {
  combat: '👊',
  marksmanship: '🎯',
  stealth: '👤',
  survival: '🏕️',
  trading: '💰',
  crafting: '🔨',
  leadership: '👑',
  diplomacy: '🤝',
  gambling: '🎲',
  medicine: '💉',
  tracking: '🐾',
  horsemanship: '🐎',
};

/** Specialization colors */
const specializationColors: Record<MentorSpecialization, string> = {
  combat: 'text-red-400 bg-red-900/30 border-red-500',
  marksmanship: 'text-orange-400 bg-orange-900/30 border-orange-500',
  stealth: 'text-purple-400 bg-purple-900/30 border-purple-500',
  survival: 'text-green-400 bg-green-900/30 border-green-500',
  trading: 'text-yellow-400 bg-yellow-900/30 border-yellow-500',
  crafting: 'text-amber-400 bg-amber-900/30 border-amber-500',
  leadership: 'text-gold-light bg-gold-dark/30 border-gold-light',
  diplomacy: 'text-blue-400 bg-blue-900/30 border-blue-500',
  gambling: 'text-pink-400 bg-pink-900/30 border-pink-500',
  medicine: 'text-cyan-400 bg-cyan-900/30 border-cyan-500',
  tracking: 'text-lime-400 bg-lime-900/30 border-lime-500',
  horsemanship: 'text-brown-400 bg-amber-900/30 border-amber-600',
};

/** Availability status styles */
const availabilityStyles: Record<MentorAvailability, { text: string; bg: string }> = {
  available: { text: 'text-green-400', bg: 'bg-green-600/80' },
  busy: { text: 'text-yellow-400', bg: 'bg-yellow-600/80' },
  traveling: { text: 'text-blue-400', bg: 'bg-blue-600/80' },
  unavailable: { text: 'text-red-400', bg: 'bg-red-600/80' },
};

/** Ability status styles */
const abilityStatusStyles: Record<AbilityStatus, { text: string; bg: string; border: string }> = {
  locked: { text: 'text-gray-400', bg: 'bg-gray-800/50', border: 'border-gray-600' },
  available: { text: 'text-gold-light', bg: 'bg-gold-dark/30', border: 'border-gold-light' },
  unlocked: { text: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-500' },
  mastered: { text: 'text-purple-400', bg: 'bg-purple-900/30', border: 'border-purple-500' },
};

/** Training type labels and descriptions */
const trainingTypes: Record<TrainingType, { label: string; description: string; energyCost: number }> = {
  basic: { label: 'Basic Training', description: 'Fundamental techniques and basics', energyCost: 10 },
  advanced: { label: 'Advanced Training', description: 'Complex techniques requiring focus', energyCost: 20 },
  master: { label: 'Master Training', description: 'Elite instruction for experienced students', energyCost: 30 },
  special: { label: 'Special Training', description: 'Unique techniques only this mentor knows', energyCost: 50 },
};

/** Mentor Card Component */
const MentorCard: React.FC<{
  mentor: Mentor;
  relationship?: MentorRelationship;
  onClick: () => void;
  isCurrentMentor: boolean;
}> = ({ mentor, relationship, onClick, isCurrentMentor }) => {
  const specColors = specializationColors[mentor.specialization];
  const availStyle = availabilityStyles[mentor.availability];

  return (
    <Card
      variant="leather"
      padding="none"
      hover
      onClick={onClick}
      className={`overflow-hidden border-2 ${isCurrentMentor ? 'border-gold-light ring-2 ring-gold-light/30' : 'border-wood-grain/30'}`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${specColors.split(' ')[1]} border-2 ${specColors.split(' ')[2]}`}>
              {mentor.iconEmoji}
            </div>
            <div>
              <h3 className="text-lg font-western text-desert-sand">{mentor.name}</h3>
              <p className="text-sm text-desert-stone">{mentor.title}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${availStyle.bg} text-white`}>
              {mentor.availability}
            </span>
            {isCurrentMentor && (
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-gold-dark text-gold-light">
                CURRENT
              </span>
            )}
          </div>
        </div>

        {/* Specialization Badge */}
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded mb-3 ${specColors}`}>
          <span>{specializationIcons[mentor.specialization]}</span>
          <span className="text-sm font-bold capitalize">{mentor.specialization}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-desert-sand line-clamp-2 mb-3">{mentor.description}</p>

        {/* Training Benefits */}
        <div className="mb-3">
          <div className="text-xs text-desert-stone mb-1">Teaches:</div>
          <div className="flex flex-wrap gap-1">
            <span className="px-2 py-0.5 bg-gold-dark/30 text-gold-light text-xs rounded">
              {mentor.trainingBenefits.primarySkill}
            </span>
            {mentor.trainingBenefits.secondarySkills.slice(0, 2).map((skill, i) => (
              <span key={i} className="px-2 py-0.5 bg-wood-dark/50 text-desert-sand text-xs rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Requirements Preview */}
        <div className="text-xs text-desert-stone">
          Requires: Level {mentor.requirements.level}
          {mentor.requirements.gold && ` + $${mentor.requirements.gold}`}
        </div>

        {/* Training Progress (if has relationship) */}
        {relationship && (
          <div className="mt-3 pt-3 border-t border-wood-grain/30">
            <SkillProgressBar
              current={relationship.trainingLevel}
              max={5}
              label="Training Level"
              color="gold"
              showPercentage={false}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

/** Ability Card Component */
const AbilityCard: React.FC<{
  ability: MentorAbility;
  canUnlock: boolean;
  onUse?: () => void;
  isLoading: boolean;
}> = ({ ability, canUnlock, onUse, isLoading }) => {
  const statusStyle = abilityStatusStyles[ability.status];

  return (
    <Card
      variant="wood"
      padding="sm"
      className={`border-2 ${statusStyle.border} ${statusStyle.bg}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{ability.iconEmoji}</span>
          <div>
            <h4 className="font-western text-desert-sand">{ability.name}</h4>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase ${statusStyle.text}`}>
                {ability.status}
              </span>
              <span className="text-xs text-desert-stone">
                Tier {ability.tier} - {ability.type}
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-desert-sand mb-3">{ability.description}</p>

      {/* Requirements */}
      {ability.status === 'locked' && (
        <div className="text-xs text-desert-stone mb-2 space-y-1">
          <div>Training Level: {ability.requirements.trainingLevel}</div>
          {ability.requirements.skillLevel && (
            <div>Skill Level: {ability.requirements.skillLevel}</div>
          )}
          {ability.requirements.gold && (
            <div>Gold: ${ability.requirements.gold}</div>
          )}
        </div>
      )}

      {/* Effects */}
      <div className="text-xs text-gold-light mb-2">
        {ability.effects.stat && (
          <span>+{ability.effects.value}% {ability.effects.stat}</span>
        )}
        {ability.effects.duration && (
          <span className="ml-2">({ability.effects.duration}s)</span>
        )}
        {ability.effects.cooldown && (
          <span className="ml-2 text-desert-stone">CD: {ability.effects.cooldown}s</span>
        )}
      </div>

      {/* Action Button */}
      {ability.status === 'unlocked' && ability.type !== 'passive' && onUse && (
        <Button
          size="sm"
          variant="primary"
          onClick={onUse}
          isLoading={isLoading}
          className="w-full"
        >
          Use Ability
        </Button>
      )}
      {ability.status === 'available' && canUnlock && (
        <div className="text-xs text-gold-light text-center">
          Continue training to unlock
        </div>
      )}
    </Card>
  );
};

/** Training Session Modal */
const TrainingModal: React.FC<{
  mentor: Mentor;
  relationship?: MentorRelationship;
  playerGold: number;
  playerEnergy: number;
  onTrain: (type: TrainingType) => void;
  onClose: () => void;
  isLoading: boolean;
}> = ({ mentor, relationship, playerGold, playerEnergy, onTrain, onClose, isLoading }) => {
  const [selectedType, setSelectedType] = useState<TrainingType>('basic');

  const canAfford = (type: TrainingType) => playerGold >= mentor.trainingCosts[type];
  const hasEnergy = (type: TrainingType) => playerEnergy >= trainingTypes[type].energyCost;
  const canTrain = (type: TrainingType) => canAfford(type) && hasEnergy(type);

  return (
    <div className="space-y-6">
      {/* Mentor Info */}
      <div className="flex items-center gap-4 pb-4 border-b border-wood-grain/30">
        <span className="text-5xl">{mentor.iconEmoji}</span>
        <div>
          <h3 className="text-xl font-western text-desert-sand">{mentor.name}</h3>
          <p className="text-desert-stone">{mentor.title}</p>
          <p className="text-sm text-gold-light mt-1">
            Training Level: {relationship?.trainingLevel || 0}/5
          </p>
        </div>
      </div>

      {/* Mentor Quote */}
      <div className="p-3 bg-wood-dark/30 rounded italic text-desert-sand text-sm">
        "{mentor.dialogue.training[0]}"
      </div>

      {/* Training Options */}
      <div className="space-y-3">
        <h4 className="text-lg font-western text-desert-sand">Training Sessions</h4>

        {(Object.keys(trainingTypes) as TrainingType[]).map((type) => {
          const info = trainingTypes[type];
          const cost = mentor.trainingCosts[type];
          const available = canTrain(type);

          return (
            <div
              key={type}
              className={`p-4 rounded border-2 cursor-pointer transition-colors ${
                selectedType === type
                  ? 'border-gold-light bg-gold-dark/20'
                  : 'border-wood-grain/30 hover:border-wood-grain/50'
              } ${!available ? 'opacity-50' : ''}`}
              onClick={() => available && setSelectedType(type)}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h5 className="font-bold text-desert-sand">{info.label}</h5>
                  <p className="text-sm text-desert-stone">{info.description}</p>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${canAfford(type) ? 'text-gold-light' : 'text-red-400'}`}>
                    ${cost}
                  </div>
                  <div className={`text-xs ${hasEnergy(type) ? 'text-blue-400' : 'text-red-400'}`}>
                    {info.energyCost} Energy
                  </div>
                </div>
              </div>
              {selectedType === type && (
                <div className="mt-2 pt-2 border-t border-wood-grain/30 text-sm">
                  <div className="text-gold-light">Expected Rewards:</div>
                  <div className="text-desert-sand">
                    +{type === 'basic' ? '50' : type === 'advanced' ? '100' : type === 'master' ? '200' : '400'} XP in {mentor.trainingBenefits.primarySkill}
                  </div>
                  {type === 'special' && (
                    <div className="text-purple-400">+ Chance to unlock special ability</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Training Tips */}
      <Card variant="parchment" padding="sm">
        <h5 className="text-sm font-bold text-wood-dark mb-1">Mentor's Tip:</h5>
        <p className="text-sm text-wood-grain italic">"{mentor.dialogue.tips[0]}"</p>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={() => onTrain(selectedType)}
          isLoading={isLoading}
          disabled={!canTrain(selectedType)}
          className="flex-1"
        >
          {canTrain(selectedType)
            ? `Begin ${trainingTypes[selectedType].label}`
            : canAfford(selectedType)
            ? 'Not Enough Energy'
            : 'Not Enough Gold'}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

/** Current Mentor Panel */
const CurrentMentorPanel: React.FC<{
  mentorship: ActiveMentorship;
  onTrain: () => void;
  onLeave: () => void;
  onUseAbility: (abilityId: string) => void;
  isLoading: boolean;
}> = ({ mentorship, onTrain, onLeave, onUseAbility, isLoading }) => {
  const { mentor, relationship } = mentorship;
  const specColors = specializationColors[mentor.specialization];

  return (
    <div className="space-y-6">
      {/* Mentor Header */}
      <Card variant="leather" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-wood-dark/20 to-transparent"></div>
        <div className="relative p-6">
          <div className="flex items-start gap-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-5xl ${specColors.split(' ')[1]} border-4 ${specColors.split(' ')[2]}`}>
              {mentor.iconEmoji}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-western text-gold-light">{mentor.name}</h2>
              <p className="text-desert-sand">{mentor.title}</p>
              <p className="text-sm text-desert-stone mt-1">{mentor.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded ${specColors}`}>
                  {specializationIcons[mentor.specialization]} {mentor.specialization}
                </span>
                <span className="text-sm text-desert-stone">
                  at {mentor.locationName}
                </span>
              </div>
            </div>
          </div>

          {/* Training Progress */}
          <div className="mt-6">
            <SkillProgressBar
              current={relationship.trainingLevel}
              max={5}
              label="Training Level"
              color="gold"
            />
            <div className="flex justify-between text-sm mt-2">
              <span className="text-desert-stone">
                Sessions: {relationship.totalTrainingSessions}
              </span>
              <span className="text-desert-stone">
                Total XP: {relationship.totalXpGained.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button variant="primary" onClick={onTrain} className="flex-1">
              Train Now
            </Button>
            <Button variant="danger" onClick={onLeave}>
              Leave Mentor
            </Button>
          </div>
        </div>
      </Card>

      {/* Unlocked Abilities */}
      <div>
        <h3 className="text-xl font-western text-desert-sand mb-4">
          Abilities ({relationship.unlockedAbilities.length}/{mentor.abilities.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mentor.abilities.map((ability) => {
            const isUnlocked = relationship.unlockedAbilities.includes(ability.id);
            const displayAbility = {
              ...ability,
              status: isUnlocked ? 'unlocked' as AbilityStatus : ability.status,
            };

            return (
              <AbilityCard
                key={ability.id}
                ability={displayAbility}
                canUnlock={ability.requirements.trainingLevel <= relationship.trainingLevel}
                onUse={isUnlocked && ability.type !== 'passive' ? () => onUseAbility(ability.id) : undefined}
                isLoading={isLoading}
              />
            );
          })}
        </div>
      </div>

      {/* Mentor Dialogue */}
      <Card variant="parchment" padding="md">
        <h4 className="text-lg font-western text-wood-dark mb-2">Mentor's Words</h4>
        <p className="text-wood-grain italic">"{mentor.dialogue.greeting[0]}"</p>
        <div className="mt-4 space-y-2">
          <h5 className="text-sm font-bold text-wood-dark">Training Tips:</h5>
          {mentor.dialogue.tips.map((tip, i) => (
            <p key={i} className="text-sm text-wood-grain">* {tip}</p>
          ))}
        </div>
      </Card>
    </div>
  );
};

/**
 * Mentor Page Component
 */
export const MentorPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentCharacter } = useCharacterStore();
  const { success, error: showError } = useToast();

  const {
    mentors,
    currentMentor,
    relationships,
    unlockedAbilities,
    stats,
    selectedMentor,
    isLoading,
    error,
    fetchAllMentors,
    fetchAvailableMentors,
    fetchMentorDetails,
    fetchCurrentMentor,
    fetchRelationships,
    fetchUnlockedAbilities,
    fetchStats,
    requestMentorship,
    startTraining,
    leaveMentor,
    useAbility,
    clearSelectedMentor,
    clearError,
  } = useMentors();

  const [activeTab, setActiveTab] = useState<ViewTab>('browse');
  const [showMentorDetail, setShowMentorDetail] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [filterSpecialization, setFilterSpecialization] = useState<MentorSpecialization | 'all'>('all');
  const [actionLoading, setActionLoading] = useState(false);

  // Load data on mount
  useEffect(() => {
    fetchAllMentors();
    fetchAvailableMentors();
    fetchCurrentMentor();
    fetchRelationships();
    fetchUnlockedAbilities();
    fetchStats();
  }, [fetchAllMentors, fetchAvailableMentors, fetchCurrentMentor, fetchRelationships, fetchUnlockedAbilities, fetchStats]);

  // Get relationship for a mentor
  const getRelationship = useCallback(
    (mentorId: string) => relationships.find((r) => r.mentorId === mentorId),
    [relationships]
  );

  // Check if mentor is current
  const isCurrentMentorCheck = useCallback(
    (mentorId: string) => currentMentor?.mentor.id === mentorId,
    [currentMentor]
  );

  // Handle mentor card click
  const handleMentorClick = useCallback(
    async (mentor: Mentor) => {
      await fetchMentorDetails(mentor.id);
      setShowMentorDetail(true);
    },
    [fetchMentorDetails]
  );

  // Handle close detail modal
  const handleCloseDetail = useCallback(() => {
    setShowMentorDetail(false);
    clearSelectedMentor();
  }, [clearSelectedMentor]);

  // Handle request mentorship
  const handleRequestMentorship = useCallback(async () => {
    if (!selectedMentor) return;

    setActionLoading(true);
    const result = await requestMentorship(selectedMentor.id);
    setActionLoading(false);

    if (result.success) {
      success('Mentorship Accepted!', result.message);
      setShowMentorDetail(false);
      setActiveTab('current');
    } else {
      showError('Request Failed', result.error || result.message);
    }
  }, [selectedMentor, requestMentorship, success, showError]);

  // Handle start training
  const handleStartTraining = useCallback(async (type: TrainingType) => {
    if (!currentMentor) return;

    setActionLoading(true);
    const result = await startTraining(currentMentor.mentor.id, type);
    setActionLoading(false);

    if (result.success) {
      success('Training Complete!', result.message);
      setShowTrainingModal(false);
      // Dispatch tutorial event for training
      dispatchTrainingStarted(currentMentor.mentor.id);
      if (result.rewards?.abilityUnlocked) {
        success('Ability Unlocked!', `You learned: ${result.rewards.abilityUnlocked}`);
      }
    } else {
      showError('Training Failed', result.error || result.message);
    }
  }, [currentMentor, startTraining, success, showError]);

  // Handle leave mentor
  const handleLeaveMentor = useCallback(async () => {
    setActionLoading(true);
    const result = await leaveMentor();
    setActionLoading(false);
    setShowLeaveConfirm(false);

    if (result.success) {
      success('Left Mentor', result.message);
      setActiveTab('browse');
    } else {
      showError('Failed', result.message);
    }
  }, [leaveMentor, success, showError]);

  // Handle use ability
  const handleUseAbility = useCallback(async (abilityId: string) => {
    setActionLoading(true);
    const result = await useAbility(abilityId);
    setActionLoading(false);

    if (result.success) {
      success('Ability Used!', result.message);
    } else {
      showError('Failed', result.message);
    }
  }, [useAbility, success, showError]);

  // Filter mentors
  const filteredMentors = mentors.filter((m) =>
    filterSpecialization === 'all' || m.specialization === filterSpecialization
  );

  // Handle error display
  useEffect(() => {
    if (error) {
      showError('Error', error);
      clearError();
    }
  }, [error, showError, clearError]);

  // Check if player meets mentor requirements
  const meetsRequirements = useCallback(
    (mentor: Mentor) => {
      if (!currentCharacter) return false;
      if (currentCharacter.level < mentor.requirements.level) return false;
      if (mentor.requirements.gold && currentCharacter.gold < mentor.requirements.gold) return false;
      // Could also check skills and reputation here
      return true;
    },
    [currentCharacter]
  );

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
            <span>🎓</span>
            Mentor Training
          </h1>
          <p className="text-desert-stone mt-1">
            Learn from legendary masters to unlock powerful abilities
          </p>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="text-xl font-bold text-gold-light">{stats.mentorsUnlocked}</div>
              <div className="text-xs text-desert-stone">Mentors</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gold-light">{stats.totalAbilitiesUnlocked}</div>
              <div className="text-xs text-desert-stone">Abilities</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gold-light">{stats.totalTrainingSessions}</div>
              <div className="text-xs text-desert-stone">Sessions</div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-wood-grain/30 pb-2">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 rounded-t-lg font-serif transition-colors ${
            activeTab === 'browse'
              ? 'bg-wood-dark text-gold-light border-b-2 border-gold-light'
              : 'text-desert-stone hover:text-desert-sand'
          }`}
        >
          Browse Mentors ({mentors.length})
        </button>
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-2 rounded-t-lg font-serif transition-colors ${
            activeTab === 'current'
              ? 'bg-wood-dark text-gold-light border-b-2 border-gold-light'
              : 'text-desert-stone hover:text-desert-sand'
          }`}
        >
          Current Mentor {currentMentor && '(1)'}
        </button>
        <button
          onClick={() => setActiveTab('abilities')}
          className={`px-4 py-2 rounded-t-lg font-serif transition-colors ${
            activeTab === 'abilities'
              ? 'bg-wood-dark text-gold-light border-b-2 border-gold-light'
              : 'text-desert-stone hover:text-desert-sand'
          }`}
        >
          My Abilities ({unlockedAbilities.length})
        </button>
      </div>

      {/* Loading State */}
      {isLoading && activeTab !== 'current' && (
        <div aria-busy="true" aria-live="polite">
          <CardGridSkeleton count={6} columns={3} />
        </div>
      )}

      {/* Browse Tab */}
      {activeTab === 'browse' && !isLoading && (
        <>
          {/* Specialization Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setFilterSpecialization('all')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                filterSpecialization === 'all'
                  ? 'bg-gold-dark text-gold-light'
                  : 'bg-wood-dark/50 text-desert-stone hover:text-desert-sand'
              }`}
            >
              All
            </button>
            {Object.keys(specializationIcons).map((spec) => (
              <button
                key={spec}
                onClick={() => setFilterSpecialization(spec as MentorSpecialization)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  filterSpecialization === spec
                    ? 'bg-gold-dark text-gold-light'
                    : 'bg-wood-dark/50 text-desert-stone hover:text-desert-sand'
                }`}
              >
                {specializationIcons[spec as MentorSpecialization]} {spec}
              </button>
            ))}
          </div>

          {filteredMentors.length === 0 ? (
            <EmptyState
              icon="🎓"
              title="No Mentors Found"
              description="No mentors match your current filter."
              actionText="Show All"
              onAction={() => setFilterSpecialization('all')}
              size="lg"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMentors.map((mentor) => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                  relationship={getRelationship(mentor.id)}
                  onClick={() => handleMentorClick(mentor)}
                  isCurrentMentor={isCurrentMentorCheck(mentor.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Current Mentor Tab */}
      {activeTab === 'current' && (
        <>
          {currentMentor ? (
            <CurrentMentorPanel
              mentorship={currentMentor}
              onTrain={() => setShowTrainingModal(true)}
              onLeave={() => setShowLeaveConfirm(true)}
              onUseAbility={handleUseAbility}
              isLoading={actionLoading}
            />
          ) : (
            <EmptyState
              icon="🤝"
              title="No Current Mentor"
              description="You haven't chosen a mentor yet. Browse available mentors and request training."
              actionText="Browse Mentors"
              onAction={() => setActiveTab('browse')}
              size="lg"
            />
          )}
        </>
      )}

      {/* Abilities Tab */}
      {activeTab === 'abilities' && !isLoading && (
        <>
          {unlockedAbilities.length === 0 ? (
            <EmptyState
              icon="✨"
              title="No Abilities Unlocked"
              description="Train with mentors to unlock powerful abilities."
              actionText="Find a Mentor"
              onAction={() => setActiveTab('browse')}
              size="lg"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedAbilities.map((ability) => (
                <AbilityCard
                  key={ability.id}
                  ability={{ ...ability, status: 'unlocked' }}
                  canUnlock={false}
                  onUse={ability.type !== 'passive' ? () => handleUseAbility(ability.id) : undefined}
                  isLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Mentor Detail Modal */}
      {showMentorDetail && selectedMentor && (
        <Modal
          isOpen={true}
          onClose={handleCloseDetail}
          title={selectedMentor.name}
          size="lg"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-5xl ${specializationColors[selectedMentor.specialization].split(' ')[1]} border-4 ${specializationColors[selectedMentor.specialization].split(' ')[2]}`}>
                {selectedMentor.iconEmoji}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-western text-desert-sand">{selectedMentor.name}</h3>
                <p className="text-desert-stone">{selectedMentor.title}</p>
                <p className="text-sm text-desert-sand mt-2">{selectedMentor.description}</p>
              </div>
            </div>

            {/* Backstory */}
            <Card variant="parchment" padding="sm">
              <h4 className="text-sm font-bold text-wood-dark mb-1">Background</h4>
              <p className="text-sm text-wood-grain">{selectedMentor.backstory}</p>
            </Card>

            {/* Training Benefits */}
            <div>
              <h4 className="text-lg font-western text-desert-sand mb-2">Training Benefits</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-desert-stone mb-1">Primary Skill:</div>
                  <div className="text-gold-light font-bold">{selectedMentor.trainingBenefits.primarySkill}</div>
                </div>
                <div>
                  <div className="text-sm text-desert-stone mb-1">Secondary Skills:</div>
                  <div className="text-desert-sand">{selectedMentor.trainingBenefits.secondarySkills.join(', ')}</div>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-sm text-desert-stone mb-1">Bonuses:</div>
                <div className="flex flex-wrap gap-2">
                  {selectedMentor.trainingBenefits.bonuses.map((bonus, i) => (
                    <span key={i} className="px-2 py-1 bg-gold-dark/20 text-gold-light text-sm rounded">
                      {bonus}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h4 className="text-lg font-western text-desert-sand mb-2">Requirements</h4>
              <div className="space-y-1 text-sm">
                <div className={currentCharacter.level >= selectedMentor.requirements.level ? 'text-green-400' : 'text-red-400'}>
                  Level: {selectedMentor.requirements.level} (You: {currentCharacter.level})
                </div>
                {selectedMentor.requirements.gold && (
                  <div className={currentCharacter.gold >= selectedMentor.requirements.gold ? 'text-green-400' : 'text-red-400'}>
                    Gold: ${selectedMentor.requirements.gold} (You: ${currentCharacter.gold})
                  </div>
                )}
                {selectedMentor.requirements.reputation && (
                  <div className="text-desert-stone">
                    Reputation: {selectedMentor.requirements.reputation}
                  </div>
                )}
              </div>
            </div>

            {/* Abilities Preview */}
            <div>
              <h4 className="text-lg font-western text-desert-sand mb-2">Abilities ({selectedMentor.abilities.length})</h4>
              <div className="space-y-2">
                {selectedMentor.abilities.map((ability) => (
                  <div key={ability.id} className="flex items-center justify-between p-2 bg-wood-dark/30 rounded">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{ability.iconEmoji}</span>
                      <div>
                        <div className="text-sm font-bold text-desert-sand">{ability.name}</div>
                        <div className="text-xs text-desert-stone">Tier {ability.tier} {ability.type}</div>
                      </div>
                    </div>
                    <div className="text-xs text-desert-stone">
                      Training Lv {ability.requirements.trainingLevel}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            {!isCurrentMentorCheck(selectedMentor.id) && (
              <Button
                variant="primary"
                onClick={handleRequestMentorship}
                isLoading={actionLoading}
                disabled={!meetsRequirements(selectedMentor) || !!currentMentor}
                className="w-full"
              >
                {currentMentor
                  ? 'Leave Current Mentor First'
                  : meetsRequirements(selectedMentor)
                  ? 'Request Mentorship'
                  : 'Requirements Not Met'}
              </Button>
            )}
            {isCurrentMentorCheck(selectedMentor.id) && (
              <Button
                variant="primary"
                onClick={() => {
                  handleCloseDetail();
                  setActiveTab('current');
                }}
                className="w-full"
              >
                Go to Training
              </Button>
            )}
          </div>
        </Modal>
      )}

      {/* Training Modal */}
      {showTrainingModal && currentMentor && (
        <Modal
          isOpen={true}
          onClose={() => setShowTrainingModal(false)}
          title="Training Session"
          size="lg"
        >
          <TrainingModal
            mentor={currentMentor.mentor}
            relationship={currentMentor.relationship}
            playerGold={currentCharacter.gold}
            playerEnergy={currentCharacter.energy}
            onTrain={handleStartTraining}
            onClose={() => setShowTrainingModal(false)}
            isLoading={actionLoading}
          />
        </Modal>
      )}

      {/* Leave Mentor Confirmation */}
      <ConfirmDialog
        isOpen={showLeaveConfirm}
        title="Leave Mentor"
        message={`Are you sure you want to leave ${currentMentor?.mentor.name}? Your progress will be saved, but you'll need to rejoin to continue training.`}
        confirmText="Leave Mentor"
        cancelText="Stay"
        confirmVariant="danger"
        onConfirm={handleLeaveMentor}
        onCancel={() => setShowLeaveConfirm(false)}
        isLoading={actionLoading}
        icon="🚪"
      />
    </div>
  );
};

export default MentorPage;
