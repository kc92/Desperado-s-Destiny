/**
 * MentorPanel Component
 * Displays mentors, mentorship progress, and abilities
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Modal } from '@/components/ui';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import mentorService, {
  Mentor,
  Mentorship,
  MentorAbility,
  MentorEligibility,
} from '@/services/mentor.service';

/**
 * Get specialty icon
 */
const getSpecialtyIcon = (specialty: string): string => {
  const icons: Record<string, string> = {
    GUNSLINGER: '🔫',
    OUTLAW: '🏴',
    SHAMAN: '🪶',
    LAWMAN: '⭐',
    CRAFTSMAN: '🔨',
  };
  return icons[specialty.toUpperCase()] || '👤';
};

/**
 * Get specialty color
 */
const getSpecialtyColor = (specialty: string): string => {
  const colors: Record<string, string> = {
    GUNSLINGER: 'text-red-400',
    OUTLAW: 'text-purple-400',
    SHAMAN: 'text-green-400',
    LAWMAN: 'text-blue-400',
    CRAFTSMAN: 'text-yellow-400',
  };
  return colors[specialty.toUpperCase()] || 'text-desert-sand';
};

/**
 * Get trust level info
 */
const getTrustLevelInfo = (trustLevel: string): { label: string; progress: number; color: string } => {
  const levels: Record<string, { label: string; progress: number; color: string }> = {
    ACQUAINTANCE: { label: 'Acquaintance', progress: 20, color: 'bg-gray-500' },
    STUDENT: { label: 'Student', progress: 40, color: 'bg-blue-500' },
    APPRENTICE: { label: 'Apprentice', progress: 60, color: 'bg-green-500' },
    DISCIPLE: { label: 'Disciple', progress: 80, color: 'bg-purple-500' },
    HEIR: { label: 'Heir', progress: 100, color: 'bg-gold-light' },
  };
  return levels[trustLevel.toUpperCase()] || { label: 'Unknown', progress: 0, color: 'bg-gray-500' };
};

/**
 * Get ability type badge color
 */
const getAbilityTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    passive: 'bg-blue-600/30 text-blue-300',
    active: 'bg-red-600/30 text-red-300',
    unlock: 'bg-purple-600/30 text-purple-300',
  };
  return colors[type] || 'bg-gray-600/30 text-gray-300';
};

interface MentorCardProps {
  mentor: Mentor;
  isAvailable: boolean;
  onClick: () => void;
}

/**
 * Mentor Card Component
 */
const MentorCard: React.FC<MentorCardProps> = ({ mentor, isAvailable, onClick }) => (
  <div
    className={`p-4 rounded-lg border transition-all cursor-pointer ${
      isAvailable
        ? 'bg-wood-dark/50 border-wood-light/30 hover:border-gold-dark hover:bg-wood-dark'
        : 'bg-gray-800/30 border-gray-700/30 opacity-60'
    }`}
    onClick={onClick}
  >
    <div className="flex items-start gap-3">
      <span className="text-3xl">{getSpecialtyIcon(mentor.specialty)}</span>
      <div className="flex-1">
        <h3 className={`font-bold ${getSpecialtyColor(mentor.specialty)}`}>
          {mentor.npcName}
        </h3>
        <p className="text-sm text-desert-sand capitalize">{mentor.specialty.toLowerCase()} Mentor</p>
        <p className="text-xs text-desert-stone mt-1">📍 {mentor.location}</p>
      </div>
      {isAvailable && (
        <span className="text-xs bg-green-600/30 text-green-300 px-2 py-1 rounded">
          Available
        </span>
      )}
    </div>
    <p className="text-sm text-desert-dust mt-3 line-clamp-2">
      {mentor.storyline.introduction}
    </p>
    <div className="mt-3 flex gap-2">
      {mentor.abilities.slice(0, 3).map((ability) => (
        <span
          key={ability.id}
          className={`text-xs px-2 py-1 rounded ${getAbilityTypeColor(ability.type)}`}
        >
          {ability.name}
        </span>
      ))}
      {mentor.abilities.length > 3 && (
        <span className="text-xs text-desert-stone">+{mentor.abilities.length - 3} more</span>
      )}
    </div>
  </div>
);

interface AbilityCardProps {
  ability: MentorAbility;
  isUnlocked: boolean;
  currentTrustLevel: string;
  onUse?: () => void;
}

/**
 * Ability Card Component
 */
const AbilityCard: React.FC<AbilityCardProps> = ({ ability, isUnlocked, currentTrustLevel, onUse }) => {
  const trustInfo = getTrustLevelInfo(ability.trustRequired);
  const currentInfo = getTrustLevelInfo(currentTrustLevel);
  const canUnlock = currentInfo.progress >= trustInfo.progress;

  return (
    <div
      className={`p-4 rounded-lg border ${
        isUnlocked
          ? 'bg-wood-dark border-gold-dark/50'
          : canUnlock
          ? 'bg-wood-dark/50 border-green-600/30'
          : 'bg-gray-800/30 border-gray-700/30 opacity-60'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className={`font-bold ${isUnlocked ? 'text-gold-light' : 'text-desert-sand'}`}>
            {ability.name}
          </h4>
          <span className={`text-xs px-2 py-0.5 rounded ${getAbilityTypeColor(ability.type)}`}>
            {ability.type}
          </span>
        </div>
        {isUnlocked ? (
          <span className="text-green-400 text-xl">✓</span>
        ) : (
          <span className="text-xs text-desert-stone">Requires: {trustInfo.label}</span>
        )}
      </div>
      <p className="text-sm text-desert-dust mt-2">{ability.description}</p>
      <div className="mt-2 space-y-1">
        {ability.effects.map((effect, i) => (
          <p key={i} className="text-xs text-green-400">
            • {effect.description}
          </p>
        ))}
      </div>
      {ability.type === 'active' && (
        <div className="mt-2 flex gap-3 text-xs text-desert-stone">
          {ability.cooldown && <span>⏱️ {ability.cooldown}s cooldown</span>}
          {ability.energyCost && <span>⚡ {ability.energyCost} energy</span>}
        </div>
      )}
      {isUnlocked && ability.type === 'active' && onUse && (
        <Button
          size="sm"
          variant="secondary"
          className="mt-3"
          onClick={onUse}
        >
          Use Ability
        </Button>
      )}
    </div>
  );
};

interface MentorDetailModalProps {
  mentor: Mentor;
  eligibility: MentorEligibility | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestMentorship: () => void;
  isRequesting: boolean;
}

/**
 * Mentor Detail Modal
 */
const MentorDetailModal: React.FC<MentorDetailModalProps> = ({
  mentor,
  eligibility,
  isOpen,
  onClose,
  onRequestMentorship,
  isRequesting,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={mentor.npcName}>
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <span className="text-5xl">{getSpecialtyIcon(mentor.specialty)}</span>
        <div>
          <h2 className={`text-2xl font-western ${getSpecialtyColor(mentor.specialty)}`}>
            {mentor.npcName}
          </h2>
          <p className="text-desert-sand capitalize">{mentor.specialty.toLowerCase()} Mentor</p>
          <p className="text-sm text-desert-stone">📍 {mentor.location}</p>
        </div>
      </div>

      {/* Background */}
      <div className="bg-wood-darker rounded-lg p-4 border border-wood-light/20">
        <p className="text-desert-sand italic">"{mentor.storyline.introduction}"</p>
        <p className="text-sm text-desert-dust mt-3">{mentor.storyline.background}</p>
      </div>

      {/* Requirements */}
      <div>
        <h3 className="text-lg font-bold text-gold-light mb-2">Requirements</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {mentor.requirements.minLevel && (
            <div className="flex justify-between">
              <span className="text-desert-stone">Min Level:</span>
              <span className="text-desert-sand">{mentor.requirements.minLevel}</span>
            </div>
          )}
          {mentor.requirements.minFactionRep && (
            <div className="flex justify-between">
              <span className="text-desert-stone">Faction Rep:</span>
              <span className="text-desert-sand">{mentor.requirements.minFactionRep}</span>
            </div>
          )}
          {mentor.requirements.minNpcTrust && (
            <div className="flex justify-between">
              <span className="text-desert-stone">NPC Trust:</span>
              <span className="text-desert-sand">{mentor.requirements.minNpcTrust}</span>
            </div>
          )}
          {mentor.requirements.noActiveBounty && (
            <div className="flex justify-between">
              <span className="text-desert-stone">No Bounty:</span>
              <span className="text-desert-sand">Required</span>
            </div>
          )}
        </div>
      </div>

      {/* Abilities Preview */}
      <div>
        <h3 className="text-lg font-bold text-gold-light mb-2">Abilities ({mentor.abilities.length})</h3>
        <div className="space-y-2">
          {mentor.abilities.map((ability) => (
            <div
              key={ability.id}
              className="flex items-center justify-between p-2 bg-wood-darker rounded"
            >
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${getAbilityTypeColor(ability.type)}`}>
                  {ability.type}
                </span>
                <span className="text-desert-sand">{ability.name}</span>
              </div>
              <span className="text-xs text-desert-stone">
                {getTrustLevelInfo(ability.trustRequired).label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legacy */}
      <div className="bg-gold-dark/20 rounded-lg p-4 border border-gold-dark/30">
        <h3 className="text-lg font-bold text-gold-light mb-2">Legacy Reward</h3>
        <p className="text-desert-sand">{mentor.storyline.legacy}</p>
      </div>

      {/* Eligibility */}
      {eligibility && (
        <div className={`p-4 rounded-lg ${eligibility.eligible ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
          {eligibility.eligible ? (
            <p className="text-green-400">✓ You meet all requirements for this mentor!</p>
          ) : (
            <div>
              <p className="text-red-400 font-bold mb-2">Missing Requirements:</p>
              <ul className="text-sm text-red-300 space-y-1">
                {eligibility.missingRequirements.map((req, i) => (
                  <li key={i}>• {req}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          disabled={!eligibility?.eligible || isRequesting}
          onClick={onRequestMentorship}
        >
          {isRequesting ? 'Requesting...' : 'Request Mentorship'}
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  </Modal>
);

/**
 * Main MentorPanel Component
 */
export const MentorPanel: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [availableMentorIds, setAvailableMentorIds] = useState<Set<string>>(new Set());
  const [currentMentor, setCurrentMentor] = useState<Mentor | null>(null);
  const [mentorship, setMentorship] = useState<Mentorship | null>(null);
  const [unlockedAbilities, setUnlockedAbilities] = useState<MentorAbility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [mentorEligibility, setMentorEligibility] = useState<MentorEligibility | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /**
   * Load all mentor data
   */
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allMentors, available, current, abilities] = await Promise.all([
        mentorService.getAllMentors(),
        mentorService.getAvailableMentors().catch(() => []),
        mentorService.getCurrentMentor(),
        mentorService.getMentorAbilities().catch(() => []),
      ]);

      setMentors(allMentors);
      setAvailableMentorIds(new Set(available.map(m => m.mentorId)));
      setCurrentMentor(current.mentor);
      setMentorship(current.mentorship);
      setUnlockedAbilities(abilities);
    } catch (error) {
      console.error('Failed to load mentor data:', error);
      showMessage('error', 'Failed to load mentor data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Show temporary message
   */
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  /**
   * Handle mentor selection
   */
  const handleSelectMentor = async (mentor: Mentor) => {
    setSelectedMentor(mentor);
    try {
      const { eligibility } = await mentorService.getMentorDetails(mentor.mentorId);
      setMentorEligibility(eligibility);
    } catch (error) {
      console.error('Failed to get mentor details:', error);
      setMentorEligibility(null);
    }
  };

  /**
   * Request mentorship
   */
  const handleRequestMentorship = async () => {
    if (!selectedMentor) return;
    setIsRequesting(true);
    try {
      const result = await mentorService.requestMentorship(selectedMentor.mentorId);
      showMessage('success', result.message || 'Mentorship requested!');
      setSelectedMentor(null);
      await loadData();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to request mentorship');
    } finally {
      setIsRequesting(false);
    }
  };

  /**
   * Leave current mentor
   */
  const handleLeaveMentor = async () => {
    setIsLeaving(true);
    try {
      const result = await mentorService.leaveMentor();
      showMessage('success', result.message || 'You have left your mentor');
      setShowLeaveConfirm(false);
      await loadData();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to leave mentor');
    } finally {
      setIsLeaving(false);
    }
  };

  /**
   * Use ability
   */
  const handleUseAbility = async (abilityId: string) => {
    try {
      const result = await mentorService.useAbility(abilityId);
      showMessage('success', result.message || 'Ability used!');
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to use ability');
    }
  };

  if (isLoading) {
    return (
      <Card variant="leather">
        <div className="p-6">
          <h2 className="text-xl font-western text-gold-light mb-4">Mentor Training</h2>
          <ListItemSkeleton count={3} />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Mentor Section */}
      {currentMentor && mentorship ? (
        <Card variant="leather">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <span className="text-5xl">{getSpecialtyIcon(currentMentor.specialty)}</span>
                <div>
                  <h2 className="text-2xl font-western text-gold-light">
                    {currentMentor.npcName}
                  </h2>
                  <p className={`capitalize ${getSpecialtyColor(currentMentor.specialty)}`}>
                    Your {currentMentor.specialty.toLowerCase()} Mentor
                  </p>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowLeaveConfirm(true)}
              >
                Leave Mentor
              </Button>
            </div>

            {/* Trust Progress */}
            <div className="bg-wood-darker rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-desert-sand">Trust Level</span>
                <span className={`font-bold ${getSpecialtyColor(currentMentor.specialty)}`}>
                  {getTrustLevelInfo(mentorship.trustLevel).label}
                </span>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getTrustLevelInfo(mentorship.trustLevel).color}`}
                  style={{ width: `${getTrustLevelInfo(mentorship.trustLevel).progress}%` }}
                />
              </div>
              <p className="text-xs text-desert-stone mt-2">
                {mentorship.trustPoints} trust points • {mentorship.completedQuests.length} quests completed
              </p>
            </div>

            {/* Greeting */}
            <div className="bg-wood-darker/50 rounded-lg p-4 mb-4 border-l-4 border-gold-dark">
              <p className="text-desert-sand italic">"{currentMentor.dialogue.greeting}"</p>
            </div>

            {/* Abilities */}
            <h3 className="text-lg font-bold text-gold-light mb-3">Your Abilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentMentor.abilities.map((ability) => (
                <AbilityCard
                  key={ability.id}
                  ability={ability}
                  isUnlocked={mentorship.unlockedAbilities.includes(ability.id)}
                  currentTrustLevel={mentorship.trustLevel}
                  onUse={
                    mentorship.unlockedAbilities.includes(ability.id) && ability.type === 'active'
                      ? () => handleUseAbility(ability.id)
                      : undefined
                  }
                />
              ))}
            </div>

            {/* Quests */}
            <h3 className="text-lg font-bold text-gold-light mt-6 mb-3">Training Quests</h3>
            <div className="space-y-2">
              {currentMentor.storyline.quests.map((quest) => {
                const isCompleted = mentorship.completedQuests.includes(quest.questId);
                const trustInfo = getTrustLevelInfo(quest.trustLevelUnlock);
                const currentTrust = getTrustLevelInfo(mentorship.trustLevel);
                const isAvailable = currentTrust.progress >= trustInfo.progress;

                return (
                  <div
                    key={quest.questId}
                    className={`p-3 rounded-lg flex items-center gap-3 ${
                      isCompleted
                        ? 'bg-green-900/30 border border-green-600/30'
                        : isAvailable
                        ? 'bg-wood-darker border border-gold-dark/30'
                        : 'bg-gray-800/30 border border-gray-700/30 opacity-60'
                    }`}
                  >
                    <span className="text-xl">
                      {isCompleted ? '✅' : isAvailable ? '📜' : '🔒'}
                    </span>
                    <div className="flex-1">
                      <h4 className={`font-bold ${isCompleted ? 'text-green-400' : 'text-desert-sand'}`}>
                        {quest.title}
                      </h4>
                      <p className="text-sm text-desert-dust">{quest.description}</p>
                    </div>
                    <span className="text-xs text-desert-stone">{trustInfo.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      ) : (
        <Card variant="leather">
          <div className="p-6">
            <h2 className="text-xl font-western text-gold-light mb-2">Find a Mentor</h2>
            <p className="text-desert-sand mb-4">
              Choose a mentor to learn powerful abilities and unlock unique storylines.
            </p>

            {mentors.length === 0 ? (
              <EmptyState
                icon="👤"
                title="No Mentors Available"
                description="Check back later for available mentors."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mentors.map((mentor) => (
                  <MentorCard
                    key={mentor.mentorId}
                    mentor={mentor}
                    isAvailable={availableMentorIds.has(mentor.mentorId)}
                    onClick={() => handleSelectMentor(mentor)}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Unlocked Abilities (when no mentor) */}
      {!currentMentor && unlockedAbilities.length > 0 && (
        <Card variant="wood">
          <div className="p-6">
            <h2 className="text-xl font-western text-desert-sand mb-4">
              Previously Unlocked Abilities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unlockedAbilities.map((ability) => (
                <AbilityCard
                  key={ability.id}
                  ability={ability}
                  isUnlocked={true}
                  currentTrustLevel="HEIR"
                  onUse={
                    ability.type === 'active'
                      ? () => handleUseAbility(ability.id)
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Mentor Detail Modal */}
      {selectedMentor && (
        <MentorDetailModal
          mentor={selectedMentor}
          eligibility={mentorEligibility}
          isOpen={!!selectedMentor}
          onClose={() => setSelectedMentor(null)}
          onRequestMentorship={handleRequestMentorship}
          isRequesting={isRequesting}
        />
      )}

      {/* Leave Confirmation Modal */}
      <Modal
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        title="Leave Mentor?"
      >
        <div className="space-y-4">
          <p className="text-desert-sand">
            Are you sure you want to leave your current mentor? You will keep any abilities you've
            already unlocked, but your progress towards new abilities will be lost.
          </p>
          <div className="flex gap-3">
            <Button
              variant="danger"
              onClick={handleLeaveMentor}
              disabled={isLeaving}
            >
              {isLeaving ? 'Leaving...' : 'Leave Mentor'}
            </Button>
            <Button variant="secondary" onClick={() => setShowLeaveConfirm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Message Toast */}
      {message && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
              message.type === 'success' ? 'bg-green-600' : 'bg-blood-red'
            } text-white`}
          >
            <span className="text-2xl">{message.type === 'success' ? '✓' : '⚠️'}</span>
            <div>
              <div className="font-bold">{message.type === 'success' ? 'Success' : 'Error'}</div>
              <div className="text-sm">{message.text}</div>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="ml-4 text-white/70 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorPanel;
