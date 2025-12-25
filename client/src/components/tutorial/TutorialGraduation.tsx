/**
 * TutorialGraduation Component
 *
 * Phase 16: Graduation ceremony screen shown when player completes the tutorial
 * Displays Hawk's farewell message, rewards earned, and milestones achieved
 */

import React, { useState, useEffect, useCallback } from 'react';
import { HawkAvatar, HAWK_PROFILE } from './HawkAvatar';
import { Button, Modal } from '@/components/ui';
import { useCharacterStore } from '@/store/useCharacterStore';
import { tutorialService } from '@/services/tutorial.service';
import type { GraduationRewards, TutorialMilestone } from '@/services/tutorial.service';
import { logger } from '@/services/logger.service';

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface TutorialGraduationProps {
  /** Whether the graduation ceremony is open */
  isOpen: boolean;
  /** Callback when ceremony is closed */
  onClose: () => void;
  /** Callback when graduation is completed */
  onComplete?: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const HAWK_FAREWELL_MESSAGES = [
  "Well, [player_name], you've come a long way from that greenhorn I first met.",
  "The frontier's a dangerous place, but I reckon you're ready to face it now.",
  "Remember what I taught you - keep your wits sharp and your aim sharper.",
  "This old gunslinger's seen a lot of folks come and go, but you... you've got what it takes.",
  "The West is yours now, partner. Make your own legend.",
];

// ============================================================================
// COMPONENT
// ============================================================================

export const TutorialGraduation: React.FC<TutorialGraduationProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { currentCharacter } = useCharacterStore();
  const characterId = currentCharacter?._id;
  const playerName = currentCharacter?.name || 'partner';

  // State
  const [phase, setPhase] = useState<'intro' | 'rewards' | 'milestones' | 'farewell'>('intro');
  const [rewards, setRewards] = useState<GraduationRewards | null>(null);
  const [milestones, setMilestones] = useState<TutorialMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);

  // Fetch graduation data
  const fetchGraduationData = useCallback(async () => {
    if (!characterId) return;

    setIsLoading(true);
    try {
      const milestonesResponse = await tutorialService.getMilestones(characterId);
      if (milestonesResponse.success && milestonesResponse.data) {
        setMilestones(milestonesResponse.data.earned);
      }
    } catch (error) {
      logger.error('[TutorialGraduation] Failed to fetch data', error as Error, {
        context: 'TutorialGraduation.fetchData',
        characterId,
      });
    } finally {
      setIsLoading(false);
    }
  }, [characterId]);

  // Complete graduation
  const completeGraduation = useCallback(async () => {
    if (!characterId || isCompleted) return;

    setIsLoading(true);
    try {
      const response = await tutorialService.completeGraduation(characterId);
      if (response.success && response.data) {
        setRewards(response.data.rewards);
        setIsCompleted(true);
        onComplete?.();
      }
    } catch (error) {
      logger.error('[TutorialGraduation] Failed to complete graduation', error as Error, {
        context: 'TutorialGraduation.complete',
        characterId,
      });
    } finally {
      setIsLoading(false);
    }
  }, [characterId, isCompleted, onComplete]);

  // Handle phase transitions
  const handleNext = useCallback(() => {
    switch (phase) {
      case 'intro':
        setPhase('rewards');
        break;
      case 'rewards':
        setPhase('milestones');
        break;
      case 'milestones':
        setPhase('farewell');
        break;
      case 'farewell':
        if (currentMessage < HAWK_FAREWELL_MESSAGES.length - 1) {
          setCurrentMessage((prev) => prev + 1);
        } else {
          completeGraduation();
        }
        break;
    }
  }, [phase, currentMessage, completeGraduation]);

  // Handle close
  const handleClose = useCallback(() => {
    if (!isCompleted) {
      completeGraduation();
    }
    onClose();
  }, [isCompleted, completeGraduation, onClose]);

  // Fetch data on open
  useEffect(() => {
    if (isOpen) {
      fetchGraduationData();
      setPhase('intro');
      setCurrentMessage(0);
    }
  }, [isOpen, fetchGraduationData]);

  // Process farewell message
  const processMessage = (text: string): string => {
    return text.replace(/\[player_name\]/g, playerName);
  };

  // Render content based on phase
  const renderContent = () => {
    switch (phase) {
      case 'intro':
        return <IntroPhase onNext={handleNext} />;
      case 'rewards':
        return <RewardsPhase rewards={rewards} onNext={handleNext} />;
      case 'milestones':
        return <MilestonesPhase milestones={milestones} onNext={handleNext} />;
      case 'farewell':
        return (
          <FarewellPhase
            message={processMessage(HAWK_FAREWELL_MESSAGES[currentMessage])}
            isLast={currentMessage === HAWK_FAREWELL_MESSAGES.length - 1}
            onNext={handleNext}
            isLoading={isLoading}
            isCompleted={isCompleted}
          />
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title=""
      className="!max-w-2xl !p-0"
      showCloseButton={false}
    >
      <div className="bg-gradient-to-b from-leather-brown to-leather-dark">
        {/* Header banner */}
        <div className="relative bg-gradient-to-r from-gold-dark via-gold-medium to-gold-dark py-6 px-8 text-center">
          <div className="absolute inset-0 bg-[url('/assets/textures/leather.png')] opacity-10" />
          <h2 className="text-3xl font-western text-leather-dark relative">
            Graduation Ceremony
          </h2>
          <p className="text-leather-brown/80 text-sm mt-1 relative">
            {HAWK_PROFILE.name}'s Mentorship Complete
          </p>
        </div>

        {/* Main content */}
        <div className="p-6 min-h-[400px] flex flex-col">
          {isLoading && phase === 'intro' ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-gold-light border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-desert-stone">Preparing ceremony...</p>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </Modal>
  );
};

// ============================================================================
// PHASE COMPONENTS
// ============================================================================

interface PhaseProps {
  onNext: () => void;
}

const IntroPhase: React.FC<PhaseProps> = ({ onNext }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <div className="mb-6">
        <HawkAvatar expression="proud" size="large" isActive />
      </div>
      <h3 className="text-2xl font-western text-gold-light mb-4">
        Congratulations, Graduate!
      </h3>
      <p className="text-desert-sand max-w-md mb-8">
        You've completed {HAWK_PROFILE.name}'s mentorship program and proven yourself
        ready to face the challenges of the Wild West on your own.
      </p>
      <Button variant="primary" size="lg" onClick={onNext}>
        View Your Rewards
      </Button>
    </div>
  );
};

interface RewardsPhaseProps extends PhaseProps {
  rewards: GraduationRewards | null;
}

const RewardsPhase: React.FC<RewardsPhaseProps> = ({ rewards, onNext }) => {
  // Default rewards if not yet fetched
  const displayRewards = rewards || {
    totalXp: 500,
    totalDollars: 100,
    specialItem: {
      itemId: 'hawks_feather',
      name: "Hawk's Feather",
      description: 'A keepsake from your mentor',
    },
    milestonesEarned: [],
  };

  return (
    <div className="flex-1 flex flex-col">
      <h3 className="text-xl font-western text-gold-light text-center mb-6">
        Your Graduation Rewards
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* XP Reward */}
        <div className="bg-wood-dark/50 border border-gold-dark/50 rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">⭐</div>
          <p className="text-2xl font-bold text-gold-light">{displayRewards.totalXp}</p>
          <p className="text-sm text-desert-stone">Experience Points</p>
        </div>

        {/* Dollars Reward */}
        <div className="bg-wood-dark/50 border border-gold-dark/50 rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">💵</div>
          <p className="text-2xl font-bold text-gold-light">${displayRewards.totalDollars}</p>
          <p className="text-sm text-desert-stone">Dollars</p>
        </div>

        {/* Special Item */}
        <div className="bg-wood-dark/50 border border-gold-dark/50 rounded-lg p-4 text-center">
          <div className="text-3xl mb-2">🪶</div>
          <p className="text-lg font-bold text-gold-light">{displayRewards.specialItem.name}</p>
          <p className="text-xs text-desert-stone">{displayRewards.specialItem.description}</p>
        </div>
      </div>

      <div className="mt-auto text-center">
        <Button variant="primary" onClick={onNext}>
          View Milestones
        </Button>
      </div>
    </div>
  );
};

interface MilestonesPhaseProps extends PhaseProps {
  milestones: TutorialMilestone[];
}

const MilestonesPhase: React.FC<MilestonesPhaseProps> = ({ milestones, onNext }) => {
  return (
    <div className="flex-1 flex flex-col">
      <h3 className="text-xl font-western text-gold-light text-center mb-4">
        Milestones Achieved
      </h3>
      <p className="text-desert-stone text-center text-sm mb-6">
        {milestones.length} milestone{milestones.length !== 1 ? 's' : ''} earned during your
        training
      </p>

      <div className="flex-1 overflow-y-auto max-h-64 space-y-2 mb-6">
        {milestones.length > 0 ? (
          milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex items-center gap-3 bg-wood-dark/30 border border-gold-dark/30 rounded-lg p-3"
            >
              <div className="text-2xl">{milestone.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-desert-sand">{milestone.name}</p>
                <p className="text-xs text-desert-stone truncate">{milestone.description}</p>
              </div>
              <div className="text-right text-xs">
                <p className="text-gold-light">+{milestone.xpReward} XP</p>
                <p className="text-green-400">+${milestone.dollarsReward}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-desert-stone">
            <p>No milestones data available</p>
          </div>
        )}
      </div>

      <div className="mt-auto text-center">
        <Button variant="primary" onClick={onNext}>
          {HAWK_PROFILE.name}'s Farewell
        </Button>
      </div>
    </div>
  );
};

interface FarewellPhaseProps extends PhaseProps {
  message: string;
  isLast: boolean;
  isLoading: boolean;
  isCompleted: boolean;
}

const FarewellPhase: React.FC<FarewellPhaseProps> = ({
  message,
  isLast,
  onNext,
  isLoading,
  isCompleted,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      {/* Hawk portrait */}
      <div className="mb-6">
        <HawkAvatar expression="farewell" size="large" isActive />
      </div>

      {/* Dialogue box */}
      <div className="bg-wood-dark/50 border-2 border-gold-dark rounded-lg p-6 max-w-lg w-full mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-gold-light">{HAWK_PROFILE.name}</span>
          <span className="text-xs text-desert-stone">says:</span>
        </div>
        <p className="text-desert-sand font-serif text-lg italic leading-relaxed">
          "{message}"
        </p>
      </div>

      {/* Continue button */}
      <Button
        variant="primary"
        size="lg"
        onClick={onNext}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-leather-dark border-t-transparent rounded-full animate-spin" />
            Completing...
          </span>
        ) : isLast ? (
          isCompleted ? 'Begin Your Journey' : 'Complete Graduation'
        ) : (
          'Continue'
        )}
      </Button>

      {/* Message indicator */}
      {!isLast && (
        <div className="flex gap-1 mt-4">
          {HAWK_FAREWELL_MESSAGES.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === HAWK_FAREWELL_MESSAGES.findIndex((m) =>
                  m.includes(message.split(',')[0].replace('"', ''))
                )
                  ? 'bg-gold-light'
                  : 'bg-wood-grain/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// GRADUATION TRIGGER HOOK
// ============================================================================

export const useGraduationTrigger = () => {
  const [showGraduation, setShowGraduation] = useState(false);
  const { currentCharacter } = useCharacterStore();

  const checkGraduation = useCallback(async () => {
    if (!currentCharacter?._id) return;

    try {
      const response = await tutorialService.getStatus(currentCharacter._id);
      if (response.success && response.data) {
        const status = response.data;
        // Show graduation if player is in graduation phase
        if (status.currentPhase === 'graduation' && !status.isGraduated) {
          setShowGraduation(true);
        }
      }
    } catch (error) {
      logger.debug('[useGraduationTrigger] Failed to check status');
    }
  }, [currentCharacter?._id]);

  return {
    showGraduation,
    setShowGraduation,
    checkGraduation,
  };
};

// Display name
TutorialGraduation.displayName = 'TutorialGraduation';

export default TutorialGraduation;
