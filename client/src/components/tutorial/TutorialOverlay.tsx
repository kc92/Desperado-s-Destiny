import React, { useEffect } from 'react';
import { useTutorialStore, CORE_TUTORIAL_SECTIONS, DEEP_DIVE_TUTORIALS } from '@/store/useTutorialStore';
import { useCharacterStore } from '@/store/useCharacterStore';
import { MentorDialogue } from './MentorDialogue';
import { TutorialSpotlight } from './TutorialSpotlight';
import { TutorialAutoTrigger } from './TutorialAutoTrigger';
import { HandQuiz } from './HandQuiz';
import { Button, Modal } from '@/components/ui';
import { useGlobalTutorialActionHandlers } from '@/utils/tutorialActionHandlers';

// Skip confirmation modal
interface SkipConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const SkipConfirmModal: React.FC<SkipConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onCancel}
    title="Skip Tutorial?"
    className="!z-[10000]"
  >
    <div className="space-y-4">
      <p className="text-desert-sand">
        Are you sure you want to skip the tutorial? You can always replay it from the Help menu.
      </p>
      <div className="flex gap-2 justify-end">
        <Button variant="secondary" onClick={onCancel}>
          No, Continue
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Yes, Skip
        </Button>
      </div>
    </div>
  </Modal>
);

// Tutorial progress indicator (top-right)
const TutorialProgress: React.FC = () => {
  const { currentSection, currentStep, getTotalProgress, getCurrentSection, tutorialType } = useTutorialStore();
  const section = getCurrentSection();

  if (!section || tutorialType !== 'core') return null; // Only show progress for core tutorial

  const progress = getTotalProgress();
  const sectionIndex = CORE_TUTORIAL_SECTIONS.findIndex(s => s.id === currentSection);

  return (
    <div className="fixed top-20 right-4 z-[9997] bg-leather-dark/95 border-2 border-gold-dark rounded-lg p-3 min-w-[200px] shadow-xl">
      <div className="text-xs text-desert-stone mb-2 uppercase tracking-wide">
        Tutorial Progress
      </div>

      {/* Section dots */}
      <div className="flex items-center gap-1 mb-2">
        {CORE_TUTORIAL_SECTIONS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div
              className={`w-3 h-3 rounded-full transition-all ${
                i < sectionIndex
                  ? 'bg-gold-light'
                  : i === sectionIndex
                  ? 'bg-gold-medium ring-2 ring-gold-light/50 animate-pulse'
                  : 'bg-wood-grain/50'
              }`}
              title={s.name}
            />
            {i < CORE_TUTORIAL_SECTIONS.length - 1 && (
              <div className={`w-2 h-0.5 ${i < sectionIndex ? 'bg-gold-light/50' : 'bg-wood-grain/30'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Current section info */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{section.icon}</span>
        <div>
          <p className="text-sm font-semibold text-desert-sand">
            {section.name}
          </p>
          <p className="text-xs text-desert-stone">
            Step {currentStep + 1} of {section.steps.length}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-wood-grain/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-gold-light transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-desert-stone mt-1 text-right">
        {progress}% Complete
      </p>
    </div>
  );
};

export const TutorialOverlay: React.FC = () => {
  const {
    isActive,
    isPaused,
    currentSection,
    currentStep,
    getCurrentStep,
    skipTutorial,
    tutorialType,
  } = useTutorialStore();
  const { currentCharacter } = useCharacterStore();

  const [showSkipConfirm, setShowSkipConfirm] = React.useState(false);
  const [spotlightPosition, setSpotlightPosition] = React.useState<'top' | 'bottom' | 'center' | null>(null);
  const currentStepData = getCurrentStep();

  // Initialize global action handlers
  useGlobalTutorialActionHandlers();

  // Calculate spotlight position when step changes
  useEffect(() => {
    if (!isActive || !currentStepData?.target) {
      setSpotlightPosition(null);
      return;
    }

    const calculatePosition = () => {
      const element = document.querySelector(currentStepData.target!);
      if (!element) {
        setSpotlightPosition(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      const screenMidpoint = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;

      // If element is in top half, position dialogue at bottom (and vice versa)
      setSpotlightPosition(elementCenter < screenMidpoint ? 'top' : 'bottom');
    };

    // Calculate immediately
    calculatePosition();

    // Recalculate on resize
    window.addEventListener('resize', calculatePosition);
    return () => window.removeEventListener('resize', calculatePosition);
  }, [isActive, currentStepData?.target, currentStep]);

  // Get player name for dialogue
  const playerName = currentCharacter?.name || 'partner';

  // Handle skip request
  const handleSkipRequest = () => {
    setShowSkipConfirm(true);
  };

  const handleSkipConfirm = () => {
    setShowSkipConfirm(false);
    skipTutorial();

    // Log analytics summary in development
    if (import.meta.env.DEV) {
      const summary = useTutorialStore.getState().getAnalyticsSummary();
      console.log('[Tutorial Analytics] Summary at skip:', summary);
    }
  };

  const handleSkipCancel = () => {
    setShowSkipConfirm(false);
  };

  // Check if current step shows quiz
  const showQuiz = currentSection === 'destiny_deck' &&
    currentStepData?.requiresAction === 'complete-quiz';

  // Render auto-trigger (handles resume prompts)
  // This renders even when tutorial is not active
  const autoTrigger = <TutorialAutoTrigger />;

  // Don't render main overlay if not active
  if (!isActive || isPaused || !currentSection) {
    return autoTrigger;
  }

  // Check if current step has a spotlight target
  const hasSpotlightTarget = !!currentStepData?.target;

  return (
    <>
      {/* Auto-trigger for new players and resume prompts */}
      {autoTrigger}

      {/* Full-screen blocking backdrop - always visible when tutorial is active */}
      {/* Only show when there's no spotlight target (spotlight has its own dark overlay) */}
      {!hasSpotlightTarget && !showQuiz && (
        <div
          className="fixed inset-0 z-[9997] bg-black/80"
          aria-hidden="true"
        />
      )}

      {/* Progress indicator */}
      {tutorialType === 'core' && <TutorialProgress />}

      {/* Spotlight overlay */}
      <TutorialSpotlight />

      {/* Quiz overlay (when in quiz step) */}
      {showQuiz && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
          <HandQuiz />
        </div>
      )}

      {/* Mentor dialogue - positioned based on spotlight */}
      {!showQuiz && (
        <MentorDialogue
          playerName={playerName}
          onSkip={handleSkipRequest}
          spotlightPosition={spotlightPosition}
        />
      )}

      {/* Skip confirmation modal */}
      <SkipConfirmModal
        isOpen={showSkipConfirm}
        onConfirm={handleSkipConfirm}
        onCancel={handleSkipCancel}
      />
    </>
  );
};

// Display name for React DevTools
TutorialOverlay.displayName = 'TutorialOverlay';

export default TutorialOverlay;
