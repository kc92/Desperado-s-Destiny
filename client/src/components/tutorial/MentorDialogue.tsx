/**
 * MentorDialogue Component
 * Displays Hawk's dialogue with typewriter effect and western styling
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTutorialStore } from '@/store/useTutorialStore';
import { useToastStore } from '@/store/useToastStore';
import {
  TUTORIAL_DIALOGUES,
  MENTOR,
  getMentorPortrait,
  type MentorExpression,
} from '@/data/tutorial/mentorDialogues';
import { Button } from '@/components/ui';
import { logger } from '@/services/logger.service';

// Action waiting state enum
type WaitingState = 'none' | 'waiting' | 'completed';

// Typewriter timing constants
const CHAR_DELAY = 35; // ms per character
const PUNCTUATION_DELAY = 150; // extra delay after . ! ?
const COMMA_DELAY = 80; // extra delay after ,

interface MentorDialogueProps {
  onComplete?: () => void;
  onSkip?: () => void;
  playerName?: string;
  spotlightPosition?: 'top' | 'bottom' | 'center' | null;
}

export const MentorDialogue: React.FC<MentorDialogueProps> = ({
  onComplete,
  onSkip,
  playerName = 'partner',
  spotlightPosition = null,
}) => {
  const {
    isActive,
    currentSection,
    currentStep,
    currentDialogueLine,
    nextStep,
    nextDialogueLine,
    skipTutorial,
    skipSection,
    pauseTutorial,
    getTotalProgress,
    getCurrentSection,
    getCurrentStep,
    canProceed,
    getAnalyticsSummary,
    activePath,
    canSkipTutorial,
    getTotalStepsCompleted,
  } = useTutorialStore();

  // Local state
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentExpression, setCurrentExpression] = useState<MentorExpression>('neutral');
  const [showActionText, setShowActionText] = useState(false);
  const [waitingForAction, setWaitingForAction] = useState<WaitingState>('none');

  // Refs for cleanup
  const typewriterRef = useRef<NodeJS.Timeout | null>(null);
  const charIndexRef = useRef(0);

  // Get current step data for action requirements
  const currentStepData = getCurrentStep();

  // Get current dialogue
  const dialogue = TUTORIAL_DIALOGUES.find(
    d => d.sectionId === currentSection && d.stepIndex === currentStep
  );
  const currentLine = dialogue?.lines[currentDialogueLine];
  const section = getCurrentSection();

  // Escape HTML entities to prevent XSS
  const escapeHtml = useCallback((str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }, []);

  // Process text with placeholders (XSS-safe)
  const processText = useCallback((text: string): string => {
    const safePlayerName = escapeHtml(playerName);
    return text
      .replace(/\[player_name\]/g, safePlayerName)
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gold-light">$1</strong>');
  }, [playerName, escapeHtml]);

  // Typewriter effect
  const startTypewriter = useCallback((text: string) => {
    if (!text) return;

    setIsTyping(true);
    setDisplayedText('');
    charIndexRef.current = 0;

    const processedText = processText(text);
    const plainText = processedText.replace(/<[^>]+>/g, ''); // Strip HTML for timing

    const typeChar = () => {
      if (charIndexRef.current < plainText.length) {
        const char = plainText[charIndexRef.current];
        charIndexRef.current++;

        // Build displayed text with HTML tags
        setDisplayedText(processedText.substring(0, charIndexRef.current + (processedText.length - plainText.length)));

        // Calculate delay for next character
        let delay = CHAR_DELAY;
        if (['.', '!', '?'].includes(char)) {
          delay = PUNCTUATION_DELAY;
        } else if (char === ',') {
          delay = COMMA_DELAY;
        }

        typewriterRef.current = setTimeout(typeChar, delay);
      } else {
        setIsTyping(false);
      }
    };

    typeChar();
  }, [processText]);

  // Skip typewriter and show full text
  const skipTypewriter = useCallback(() => {
    if (typewriterRef.current) {
      clearTimeout(typewriterRef.current);
    }
    if (currentLine?.text) {
      setDisplayedText(processText(currentLine.text));
    }
    setIsTyping(false);
  }, [currentLine, processText]);

  // Start typewriter when line changes
  useEffect(() => {
    if (currentLine) {
      setCurrentExpression(currentLine.expression);
      setShowActionText(!!currentLine.actionText);

      if (currentLine.text) {
        startTypewriter(currentLine.text);
      } else {
        setDisplayedText('');
        setIsTyping(false);
      }
    }

    return () => {
      if (typewriterRef.current) {
        clearTimeout(typewriterRef.current);
      }
    };
  }, [currentLine, startTypewriter]);

  // Handle continue/advance
  const handleContinue = useCallback(() => {
    if (isTyping) {
      skipTypewriter();
      return;
    }

    if (!dialogue) return;

    if (currentDialogueLine < dialogue.lines.length - 1) {
      // More lines in this dialogue
      nextDialogueLine();
    } else {
      // End of dialogue for this step - check if action is required
      const stepRequiresAction = currentStepData?.requiresAction;

      if (stepRequiresAction && !canProceed()) {
        // Step requires an action that hasn't been completed yet
        // Enter waiting state - don't advance
        setWaitingForAction('waiting');
        return;
      }

      // Action complete or no action required - proceed
      setWaitingForAction('none');
      if (onComplete) {
        onComplete();
      }
      nextStep();
    }
  }, [isTyping, skipTypewriter, dialogue, currentDialogueLine, nextDialogueLine, nextStep, onComplete, currentStepData, canProceed]);

  // Effect to auto-advance when waiting and action is completed
  useEffect(() => {
    if (waitingForAction !== 'waiting') return;

    // Check if action is now complete
    if (canProceed()) {
      setWaitingForAction('completed');
      // Small delay to show completion before advancing
      const timer = setTimeout(() => {
        setWaitingForAction('none');
        if (onComplete) {
          onComplete();
        }
        nextStep();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [waitingForAction, canProceed, nextStep, onComplete]);

  // Subscribe to store changes to detect action completion while waiting
  useEffect(() => {
    if (waitingForAction !== 'waiting') return;

    let prevLength = useTutorialStore.getState().completedActions.length;

    // Subscribe to full state changes and check for completedActions changes
    const unsubscribe = useTutorialStore.subscribe((state) => {
      const currentLength = state.completedActions.length;
      if (currentLength !== prevLength) {
        prevLength = currentLength;
        // Force re-check of canProceed by triggering a state update
        setWaitingForAction('waiting'); // Keep same state to trigger effect re-run
      }
    });

    return unsubscribe;
  }, [waitingForAction]);

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleContinue();
      } else if (e.key === 'Escape') {
        if (onSkip) onSkip();
        else skipSection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleContinue, onSkip, skipSection]);

  // Don't render if not active or no dialogue
  if (!isActive || !currentSection || !dialogue || !currentLine) {
    return null;
  }

  const progress = getTotalProgress();
  const isLastLine = currentDialogueLine === dialogue.lines.length - 1;
  const sectionIndex = activePath.findIndex(s => s.id === currentSection);

  // Determine positioning based on spotlight location
  const getPositionClasses = () => {
    if (spotlightPosition === 'top') {
      // Spotlight is in top half - position dialogue at bottom
      return 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]';
    } else if (spotlightPosition === 'bottom') {
      // Spotlight is in bottom half - position dialogue at top
      return 'fixed top-24 left-1/2 -translate-x-1/2 z-[9999]';
    }
    // No spotlight or center - keep centered
    return 'fixed inset-0 z-[9999] flex items-center justify-center';
  };

  return (
    <div className={`${getPositionClasses()} p-6 pointer-events-none`}>
      <div className="flex flex-col items-center w-full max-w-2xl pointer-events-auto">
        {/* Main dialogue box */}
        <div className="bg-gradient-to-b from-leather-brown to-leather-dark border-4 border-gold-dark rounded-lg shadow-2xl overflow-hidden w-full relative">
          {/* Wood frame effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-3 h-3 bg-gold-dark/50 rounded-full translate-x-1 translate-y-1" />
            <div className="absolute top-0 right-0 w-3 h-3 bg-gold-dark/50 rounded-full -translate-x-1 translate-y-1" />
            <div className="absolute bottom-0 left-0 w-3 h-3 bg-gold-dark/50 rounded-full translate-x-1 -translate-y-1" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-gold-dark/50 rounded-full -translate-x-1 -translate-y-1" />
          </div>

          {/* Header with portrait and name */}
          <div className="flex items-start gap-4 p-4 pb-2">
            {/* Portrait */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-3 border-gold-dark bg-wood-dark overflow-hidden shadow-lg">
                <img
                  src={getMentorPortrait(currentExpression)}
                  alt={`${MENTOR.name} - ${currentExpression}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image not found
                    (e.target as HTMLImageElement).src = '/assets/portraits/mentor/placeholder.png';
                  }}
                />
              </div>
            </div>

            {/* Name and skip button */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-western text-gold-light">
                    {MENTOR.name}
                  </h3>
                  <p className="text-xs text-desert-stone">
                    {MENTOR.title}
                  </p>
                </div>
                <button
                  onClick={() => onSkip ? onSkip() : skipTutorial()}
                  className="text-xs text-desert-stone/70 hover:text-desert-sand transition-colors px-2 py-1"
                >
                  Skip Tutorial
                </button>
              </div>
            </div>
          </div>

          {/* Dialogue content */}
          <div className="px-4 pb-3 min-h-[80px]">
            {/* Action text (italics) */}
            {showActionText && currentLine.actionText && (
              <p className="text-sm text-desert-stone italic mb-2">
                {currentLine.actionText}
              </p>
            )}

            {/* Main dialogue text */}
            <div
              className="text-desert-sand font-serif text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: displayedText }}
            />

            {/* Typing indicator */}
            {isTyping && (
              <span className="inline-block w-2 h-4 bg-gold-light/70 ml-1 animate-pulse" />
            )}
          </div>

          {/* Progress indicator */}
          <div className="px-4 pb-2">
            <div className="flex items-center gap-2">
              {activePath.map((s, i) => (
                <div
                  key={s.id}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    i < sectionIndex
                      ? 'bg-gold-light'
                      : i === sectionIndex
                      ? 'bg-gold-medium ring-2 ring-gold-light/50'
                      : 'bg-wood-grain/50'
                  }`}
                  title={s.name}
                />
              ))}
              <span className="ml-auto text-xs text-desert-stone">
                {progress}% Complete
              </span>
            </div>
          </div>

          {/* Action Prompt Panel - shown when waiting for player action */}
          {waitingForAction === 'waiting' && currentStepData?.actionPrompt && (
            <div className="px-4 pb-3">
              <div className="bg-gold-dark/20 border border-gold-medium/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-gold-light animate-pulse" />
                  <span className="text-xs font-semibold text-gold-light uppercase tracking-wide">
                    Action Required
                  </span>
                </div>
                <p className="text-desert-sand font-medium">
                  {currentStepData.actionPrompt}
                </p>
              </div>
            </div>
          )}

          {/* Action Completed Feedback */}
          {waitingForAction === 'completed' && (
            <div className="px-4 pb-3">
              <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">&#10003;</span>
                  <span className="text-green-300 font-medium">
                    Action completed! Continuing...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer with actions */}
          <div className="flex items-center justify-between px-4 py-3 bg-wood-dark/50 border-t border-gold-dark/30">
            <button
              onClick={() => {
                const canSkip = canSkipTutorial();
                if (!canSkip) {
                  const stepsCompleted = getTotalStepsCompleted();
                  const stepsNeeded = 5 - stepsCompleted;
                  useToastStore.getState().addToast({
                    type: 'info',
                    title: 'Complete More Steps',
                    message: `Complete ${stepsNeeded} more step${stepsNeeded !== 1 ? 's' : ''} to unlock skip`,
                    duration: 3000,
                  });
                  return;
                }
                skipSection();
                // Log analytics in development
                if (import.meta.env.DEV) {
                  const summary = getAnalyticsSummary();
                  logger.info('[Tutorial Analytics] Section skipped. Current summary:', { context: 'MentorDialogue', summary });
                }
              }}
              className={`text-sm transition-colors ${
                canSkipTutorial()
                  ? 'text-desert-stone hover:text-desert-sand cursor-pointer'
                  : 'text-desert-stone/40 cursor-not-allowed'
              }`}
              title={canSkipTutorial() ? 'Skip this section' : `Complete ${5 - getTotalStepsCompleted()} more steps to unlock`}
            >
              Skip Section
            </button>

            <div className="flex items-center gap-2">
              {section && (
                <span className="text-xs text-desert-stone mr-2">
                  {section.name} • {currentStep + 1}/{section.steps.length}
                </span>
              )}

              {waitingForAction === 'waiting' ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-desert-stone italic">
                    Waiting for action...
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={pauseTutorial}
                    title="Minimize tutorial to interact with the game"
                  >
                    Minimize
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleContinue}
                  disabled={waitingForAction === 'completed'}
                >
                  {isTyping ? 'Skip' : isLastLine ? 'Continue' : 'Next'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Click anywhere hint */}
        <p className="text-center text-xs text-desert-stone/70 mt-3">
          {waitingForAction === 'waiting'
            ? 'Complete the action above to continue'
            : 'Press Enter or click Continue to advance'}
        </p>
      </div>

    </div>
  );
};

// Display name for React DevTools
MentorDialogue.displayName = 'MentorDialogue';

export default MentorDialogue;
