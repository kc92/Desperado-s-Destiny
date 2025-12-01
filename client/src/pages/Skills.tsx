/**
 * Skills Page
 * Main skill training interface with real-time progress tracking
 */

import React, { useState, useEffect } from 'react';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useSkillStore } from '@/store/useSkillStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { SkillCategory, Skill, SkillData, NotificationType, DestinySuit } from '@desperados/shared';
import { SkillCard } from '@/components/game/SkillCard';
import { SkillCategoryFilter } from '@/components/game/SkillCategoryFilter';
import { TrainingStatus } from '@/components/game/TrainingStatus';
import { SkillBonusSummary } from '@/components/game/SkillBonusSummary';
import { HowSkillsWorkModal } from '@/components/game/HowSkillsWorkModal';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CardGridSkeleton, ProgressBarSkeleton } from '@/components/ui/Skeleton';
import { MentorPanel } from '@/components/mentor';

/**
 * Skills page component
 */
export const Skills: React.FC = () => {
  const {
    currentCharacter
  } = useCharacterStore();
  const {
    skills,
    skillData,
    currentTraining,
    skillBonuses,
    isTrainingSkill,
    isLoading: isSkillsLoading,
    error: skillsError,
    startTraining,
    cancelTraining,
    completeTraining,
    startSkillsPolling,
    stopSkillsPolling,
  } = useSkillStore();

  const isLoading = isSkillsLoading;
  const error = skillsError;

  const { showToast } = useNotificationStore();

  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'ALL'>('ALL');
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);
  const [showTrainModal, setShowTrainModal] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [selectedSkillForTraining, setSelectedSkillForTraining] = useState<Skill | null>(null);
  const [levelUpResult, setLevelUpResult] = useState<{ skillName: string; newLevel: number } | null>(null);

  // Start polling on mount, stop on unmount
  useEffect(() => {
    startSkillsPolling();

    return () => {
      stopSkillsPolling();
    };
  }, [startSkillsPolling, stopSkillsPolling]);

  // Get skill data for a skill
  const getSkillData = (skillId: string): SkillData => {
    const data = skillData.find((sd) => sd.skillId === skillId);
    return (
      data || {
        skillId,
        level: 0,
        xp: 0,
        xpToNextLevel: 100,
      }
    );
  };

  // Get current training skill
  const currentTrainingSkill = currentTraining
    ? skills.find((s) => s.id === currentTraining.skillId)
    : null;

  // Filter skills by category
  const filteredSkills = skills.filter((skill) => {
    if (selectedCategory === 'ALL') return true;
    return skill.category === selectedCategory;
  });

  // Sort skills by level (highest first)
  const sortedSkills = [...filteredSkills].sort((a, b) => {
    const aLevel = getSkillData(a.id).level;
    const bLevel = getSkillData(b.id).level;
    return bLevel - aLevel;
  });

  // Calculate category counts
  const categoryCounts = {
    ALL: skills.length,
    COMBAT: skills.filter((s) => s.category === 'COMBAT').length,
    CUNNING: skills.filter((s) => s.category === 'CUNNING').length,
    SPIRIT: skills.filter((s) => s.category === 'SPIRIT').length,
    CRAFT: skills.filter((s) => s.category === 'CRAFT').length,
  };

  // Check if all skills are maxed
  const allSkillsMaxed = skills.every((skill) => {
    const data = getSkillData(skill.id);
    return data.level >= skill.maxLevel;
  });

  // Handle train skill
  const handleTrain = (skill: Skill) => {
    setSelectedSkillForTraining(skill);
    setShowTrainModal(true);
  };

  // Confirm train
  const confirmTrain = async () => {
    if (!selectedSkillForTraining) return;

    try {
      await startTraining(selectedSkillForTraining.id);
      setShowTrainModal(false);
      setSelectedSkillForTraining(null);
    } catch (err) {
      console.error('Failed to start training:', err);
    }
  };

  // Handle cancel training
  const handleCancelTraining = () => {
    setShowCancelModal(true);
  };

  // Confirm cancel
  const confirmCancel = async () => {
    try {
      await cancelTraining();
      setShowCancelModal(false);
    } catch (err) {
      console.error('Failed to cancel training:', err);
    }
  };

  // Handle complete training
  const handleCompleteTraining = async () => {
    if (!currentTrainingSkill) return;

    try {
      await completeTraining();

      // Show celebration
      const data = getSkillData(currentTrainingSkill.id);
      setLevelUpResult({
        skillName: currentTrainingSkill.name,
        newLevel: data.level,
      });
      setShowCelebration(true);

      // Show toast notification
      const suitNames: Record<string, string> = {
        [DestinySuit.SPADES]: 'Spades',
        [DestinySuit.HEARTS]: 'Hearts',
        [DestinySuit.CLUBS]: 'Clubs',
        [DestinySuit.DIAMONDS]: 'Diamonds',
      };
      const suitName = currentTrainingSkill.suit ? suitNames[currentTrainingSkill.suit] || currentTrainingSkill.suit : 'cards';

      showToast({
        _id: `skill-${Date.now()}`,
        characterId: currentCharacter?._id || '',
        type: NotificationType.SKILL_TRAINED,
        title: `${currentTrainingSkill.name} Leveled Up!`,
        message: `${currentTrainingSkill.name} is now level ${data.level}! +${data.level} to ${suitName}`,
        isRead: false,
        link: '/skills',
        createdAt: new Date().toISOString(),
        // updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to complete training:', err);
    }
  };

  // Loading state
  if (isLoading && skills.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl" aria-busy="true" aria-live="polite">
        <div className="mb-8">
          <div className="h-12 w-64 bg-wood-dark/30 rounded animate-pulse mb-2" />
          <div className="h-6 w-48 bg-wood-dark/20 rounded animate-pulse" />
        </div>
        <div className="mb-6">
          <ProgressBarSkeleton />
        </div>
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-wood-dark/30 rounded animate-pulse" />
          ))}
        </div>
        <CardGridSkeleton count={9} columns={3} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-western text-wood-dark text-shadow-gold mb-2">
            Skill Training
          </h1>
          {currentCharacter && (
            <p className="text-lg text-wood-grain">
              {currentCharacter.name} - Level {currentCharacter.level}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {isActive && getCurrentStep()?.requiresAction === 'toggle-skills' && (
            <Button
              variant="primary"
              onClick={() => completeTutorialAction('toggle-skills')}
              data-tutorial-target="toggle-skills-button"
            >
              Toggle Skill Bonus
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowHowItWorks(true)}>
            How Skills Work
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-blood-red/10 border-2 border-blood-red rounded text-blood-red">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Training Status Panel */}
      {currentTraining && currentTrainingSkill && (
        <TrainingStatus
          training={currentTraining}
          skill={currentTrainingSkill}
          onCancel={handleCancelTraining}
          onComplete={handleCompleteTraining}
        />
      )}

      {/* Empty state: No training active */}
      {!currentTraining && (
        <div className="mb-6 p-6 parchment rounded-lg border-2 border-gold-dark text-center">
          <p className="text-lg text-wood-dark">
            <span className="text-2xl mr-2">⚡</span>
            Select a skill to start training
          </p>
        </div>
      )}

      {/* Skill Bonus Summary */}
      <SkillBonusSummary bonuses={skillBonuses} skills={skills} skillData={skillData} />

      {/* Category Filter */}
      <SkillCategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        counts={categoryCounts}
      />

      {/* All Skills Maxed Message */}
      {allSkillsMaxed && (
        <div className="mb-6 p-6 bg-gold-dark/20 border-4 border-gold-dark rounded-lg text-center">
          <h2 className="text-3xl font-western text-gold-dark mb-2">
            Frontier Legend!
          </h2>
          <p className="text-lg text-wood-dark">
            You've maxed out all skills! You're a true master of the Wild West!
          </p>
        </div>
      )}

      {/* Skill Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedSkills.map((skill) => {
          const data = getSkillData(skill.id);
          const isThisSkillTraining = currentTraining?.skillId === skill.id;
          const canTrain = !isTrainingSkill && data.level < skill.maxLevel;

          return (
            <SkillCard
              key={skill.id}
              skill={skill}
              skillData={data}
              isTraining={isThisSkillTraining}
              canTrain={canTrain}
              onTrain={() => handleTrain(skill)}
            />
          );
        })}
      </div>

      {/* Empty state: No skills in category */}
      {sortedSkills.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-wood-grain">
            No skills found in this category.
          </p>
        </div>
      )}

      {/* Mentor Training Section */}
      <div className="mt-12">
        <h2 className="text-3xl font-western text-wood-dark text-shadow-gold mb-6">
          Mentor Training
        </h2>
        <MentorPanel />
      </div>

      {/* How Skills Work Modal */}
      <HowSkillsWorkModal isOpen={showHowItWorks} onClose={() => setShowHowItWorks(false)} />

      {/* Train Confirmation Modal */}
      {selectedSkillForTraining && (
        <Modal
          isOpen={showTrainModal}
          onClose={() => setShowTrainModal(false)}
          title="Confirm Training"
          size="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{selectedSkillForTraining.icon}</span>
              <div>
                <h3 className="text-xl font-western text-wood-dark">
                  {selectedSkillForTraining.name}
                </h3>
                <p className="text-sm text-wood-grain">
                  Level {getSkillData(selectedSkillForTraining.id).level} →{' '}
                  {getSkillData(selectedSkillForTraining.id).level + 1}
                </p>
              </div>
            </div>

            <p className="text-wood-dark">
              Training will take approximately{' '}
              <strong className="text-gold-dark">
                {Math.floor(selectedSkillForTraining.baseTrainingTime / 60000)} minutes
              </strong>
              . Training continues even when you're offline.
            </p>

            <div className="flex gap-3">
              <Button variant="primary" fullWidth onClick={confirmTrain}>
                Start Training
              </Button>
              <Button variant="ghost" onClick={() => setShowTrainModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Cancel Training Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Training?"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-wood-dark">
            Are you sure you want to cancel training? All progress will be lost and you won't gain any XP.
          </p>

          <div className="flex gap-3">
            <Button variant="danger" fullWidth onClick={confirmCancel}>
              Yes, Cancel Training
            </Button>
            <Button variant="ghost" onClick={() => setShowCancelModal(false)}>
              Keep Training
            </Button>
          </div>
        </div>
      </Modal>

      {/* Level Up Celebration Modal */}
      <Modal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        title="Level Up!"
        size="md"
      >
        {levelUpResult && (
          <div className="space-y-6 text-center">
            <div className="text-6xl">🎉</div>

            <div>
              <h3 className="text-2xl font-western text-gold-dark mb-2">
                Congratulations!
              </h3>
              <p className="text-lg text-wood-dark">
                <strong>{levelUpResult.skillName}</strong> is now level{' '}
                <strong className="text-gold-dark">{levelUpResult.newLevel}</strong>!
              </p>
            </div>

            <div className="p-4 bg-gold-dark/20 border-2 border-gold-dark rounded">
              <p className="text-sm text-wood-dark">
                Your Destiny Deck bonuses have increased!
              </p>
            </div>

            <Button variant="primary" fullWidth onClick={() => setShowCelebration(false)}>
              Continue
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Skills;
