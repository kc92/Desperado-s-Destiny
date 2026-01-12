/**
 * TutorialAutoTrigger Component
 * Automatically triggers tutorial for new players and handles resume prompts
 */

import React, { useEffect } from 'react';
import { useTutorialStore, getTotalEstimatedMinutes } from '@/store/useTutorialStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Button, Modal } from '@/components/ui';

// Map faction ID to intro section
const FACTION_INTRO_MAP: Record<string, string> = {
  'SETTLER_ALLIANCE': 'intro_settler',
  'NAHI_COALITION': 'intro_nahi',
  'FRONTERA': 'intro_frontera',
};

export const TutorialAutoTrigger: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { currentCharacter } = useCharacterStore();
  const {
    tutorialCompleted,
    isActive,
    isPaused,
    showResumePrompt,
    currentSection,
    characterId: tutorialCharacterId,
    startTutorial,
    resumeTutorial,
    skipTutorial,
    resetTutorial,
    dismissResumePrompt,
  } = useTutorialStore();

  const [showSkipConfirm, setShowSkipConfirm] = React.useState(false);

  // Helper to get start params
  const getStartParams = () => {
    if (!currentCharacter?.faction) return { section: 'intro_settler', factionId: 'SETTLER_ALLIANCE' };

    const section = FACTION_INTRO_MAP[currentCharacter.faction] || 'intro_settler';
    return { section, factionId: currentCharacter.faction };
  };

  // Auto-trigger tutorial for new characters
  useEffect(() => {
    // Only check when authenticated with a character
    if (!isAuthenticated || !currentCharacter) return;

    // Check if this is a brand new character (level 1, no XP)
    const isNewCharacter =
      currentCharacter.level === 1 &&
      (currentCharacter.experience === 0 || currentCharacter.experience === undefined);

    // Check if tutorial state belongs to a DIFFERENT character
    const isDifferentCharacter = tutorialCharacterId && tutorialCharacterId !== currentCharacter._id;

    // CASE 1: New character, but localStorage has tutorial state from a different character
    // Reset and start fresh for this new character
    if (isNewCharacter && isDifferentCharacter) {
      resetTutorial();
      const timer = setTimeout(() => {
        const { section, factionId } = getStartParams();
        startTutorial(section, 'core', factionId);
      }, 1500);
      return () => clearTimeout(timer);
    }

    // CASE 2: New character, tutorial marked complete from previous character (stale localStorage)
    // Also reset and start fresh
    if (isNewCharacter && tutorialCompleted && !tutorialCharacterId) {
      // Tutorial was completed but characterId is null - likely stale data
      resetTutorial();
      const timer = setTimeout(() => {
        const { section, factionId } = getStartParams();
        startTutorial(section, 'core', factionId);
      }, 1500);
      return () => clearTimeout(timer);
    }

    // CASE 3: Tutorial is already active/paused/completed for THIS character - don't interfere
    if (tutorialCharacterId === currentCharacter._id) {
      // Tutorial state belongs to this character, respect it
      return;
    }

    // CASE 4: Don't auto-trigger if tutorial is already running or completed
    if (tutorialCompleted || isActive || isPaused || showResumePrompt) return;

    // CASE 5: Brand new character with no tutorial history at all - start tutorial
    if (isNewCharacter) {
      const timer = setTimeout(() => {
        const { section, factionId } = getStartParams();
        startTutorial(section, 'core', factionId);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, currentCharacter, tutorialCompleted, isActive, isPaused, showResumePrompt, tutorialCharacterId, startTutorial, resetTutorial]);

  // Only show resume prompt if it's for the current character
  const isCurrentCharacterTutorial = tutorialCharacterId === currentCharacter?._id;

  // Don't render anything if not authenticated, no resume prompt needed, or tutorial is for a different character
  if (!isAuthenticated || !currentCharacter || !showResumePrompt || !currentSection || !isCurrentCharacterTutorial) {
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
              const { section, factionId } = getStartParams();
              startTutorial(section, 'core', factionId);
            }}
            fullWidth
          >
            Start Over
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowSkipConfirm(true)}
            fullWidth
          >
            Skip Tutorial
          </Button>
        </div>

        <p className="text-xs text-desert-stone text-center">
          You can replay the tutorial anytime from Settings.
        </p>

        {/* Skip confirmation nested modal */}
        {showSkipConfirm && (
          <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60">
            <div className="bg-gradient-to-b from-leather-brown to-leather-dark border-4 border-gold-dark rounded-lg shadow-2xl p-6 max-w-md mx-4">
              <h3 className="text-lg font-western text-gold-light mb-3">
                Skip Tutorial?
              </h3>
              <p className="text-desert-sand mb-4">
                Are you sure you want to skip the tutorial? You can resume it later from the Settings menu.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowSkipConfirm(false)}
                >
                  Continue Tutorial
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setShowSkipConfirm(false);
                    skipTutorial();
                  }}
                >
                  Skip Tutorial
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Display name for React DevTools
TutorialAutoTrigger.displayName = 'TutorialAutoTrigger';

export default TutorialAutoTrigger;
