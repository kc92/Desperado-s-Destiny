/**
 * TutorialAutoTrigger Component
 * Automatically triggers tutorial for new players and handles resume prompts
 */

import React, { useEffect } from 'react';
import { useTutorialStore, getTotalEstimatedMinutes } from '@/store/useTutorialStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Button, Modal } from '@/components/ui';

export const TutorialAutoTrigger: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { currentCharacter } = useCharacterStore();
  const {
    tutorialCompleted,
    isActive,
    isPaused,
    showResumePrompt,
    currentSection,
    startTutorial,
    resumeTutorial,
    skipTutorial,
    resetTutorial,
    dismissResumePrompt,
  } = useTutorialStore();

  // Auto-trigger tutorial for new characters
  useEffect(() => {
    // Only check when authenticated with a character
    if (!isAuthenticated || !currentCharacter) return;

    // Don't auto-trigger if tutorial is completed or already active
    if (tutorialCompleted || isActive || isPaused || showResumePrompt) return;

    // Check if this is a brand new character
    const isNewCharacter =
      currentCharacter.level === 1 &&
      currentCharacter.experience === 0;

    if (isNewCharacter) {
      // Small delay to let the UI settle
      const timer = setTimeout(() => {
        startTutorial('welcome', 'core');
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, currentCharacter, tutorialCompleted, isActive, isPaused, showResumePrompt, startTutorial]);

  // Don't render anything if no resume prompt needed
  if (!showResumePrompt || !currentSection) {
    return null;
  }

  const estimatedMinutes = getTotalEstimatedMinutes();

  return (
    <Modal
      isOpen={showResumePrompt}
      onClose={dismissResumePrompt}
      title="Continue Tutorial?"
    >
      <div className="space-y-4">
        <p className="text-desert-sand">
          You were in the middle of the tutorial. Would you like to continue where you left off?
        </p>

        <div className="bg-wood-dark/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <p className="text-gold-light font-semibold">
                Tutorial Progress Saved
              </p>
              <p className="text-sm text-desert-stone">
                ~{estimatedMinutes} minutes total
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="primary"
            onClick={resumeTutorial}
            fullWidth
          >
            Resume Tutorial
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              resetTutorial();
              startTutorial('welcome', 'core');
            }}
            fullWidth
          >
            Start Over
          </Button>
          <Button
            variant="ghost"
            onClick={skipTutorial}
            fullWidth
          >
            Skip Tutorial
          </Button>
        </div>

        <p className="text-xs text-desert-stone text-center">
          You can replay the tutorial anytime from Settings.
        </p>
      </div>
    </Modal>
  );
};

// Display name for React DevTools
TutorialAutoTrigger.displayName = 'TutorialAutoTrigger';

export default TutorialAutoTrigger;
