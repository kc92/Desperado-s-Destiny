/**
 * HawkCompanion Component
 *
 * Phase 16: Main container for the Hawk mentor system
 * Manages companion state, dialogue display, and contextual tips
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HawkAvatar, HawkMiniAvatar, HAWK_PROFILE } from './HawkAvatar';
import { HawkDialogueBox, FloatingTipIndicator } from './HawkDialogueBox';
import { useCharacterStore } from '@/store/useCharacterStore';
import { tutorialService } from '@/services/tutorial.service';
import type {
  TutorialStatus,
  HawkDialogue,
  ContextualTip,
  TutorialPhase,
  HawkExpression,
  DialogueTrigger,
} from '@/services/tutorial.service';
import { logger } from '@/services/logger.service';

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface HawkCompanionProps {
  /** Whether the companion is visible */
  visible?: boolean;
  /** Position of the companion */
  position?: 'bottom-left' | 'bottom-right';
  /** Whether to show contextual tips */
  showTips?: boolean;
  /** Callback when tutorial phase changes */
  onPhaseChange?: (newPhase: TutorialPhase) => void;
  /** Callback when dialogue is shown */
  onDialogueShown?: (dialogue: HawkDialogue) => void;
}

// ============================================================================
// COMPANION STATE
// ============================================================================

interface CompanionState {
  isActive: boolean;
  expression: HawkExpression;
  currentDialogue: HawkDialogue | null;
  currentTip: ContextualTip | null;
  tutorialStatus: TutorialStatus | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CompanionState = {
  isActive: false,
  expression: 'neutral',
  currentDialogue: null,
  currentTip: null,
  tutorialStatus: null,
  isLoading: true,
  error: null,
};

// ============================================================================
// COMPONENT
// ============================================================================

export const HawkCompanion: React.FC<HawkCompanionProps> = ({
  visible = true,
  position = 'bottom-left',
  showTips = true,
  onPhaseChange,
  onDialogueShown,
}) => {
  const { currentCharacter } = useCharacterStore();
  const characterId = currentCharacter?._id;

  // State
  const [state, setState] = useState<CompanionState>(initialState);
  const [showDialogue, setShowDialogue] = useState(false);
  const [showTipBox, setShowTipBox] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch tutorial status
  const fetchStatus = useCallback(async () => {
    if (!characterId) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await tutorialService.getStatus(characterId);
      if (response.success && response.data) {
        const status = response.data;
        setState((prev) => ({
          ...prev,
          isActive: status.isActive,
          expression: status.hawk?.expression || 'neutral',
          tutorialStatus: status,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isActive: false,
          isLoading: false,
          error: response.error || 'Failed to load tutorial status',
        }));
      }
    } catch (error) {
      logger.error('[HawkCompanion] Failed to fetch status', error as Error, {
        context: 'HawkCompanion.fetchStatus',
        characterId,
      });
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to connect to server',
      }));
    }
  }, [characterId]);

  // Fetch contextual tip
  const fetchTip = useCallback(async () => {
    if (!characterId || !showTips || !state.isActive) return;

    try {
      const response = await tutorialService.getContextualTip(characterId);
      if (response.success && response.data) {
        const tipData = response.data;
        setState((prev) => ({
          ...prev,
          currentTip: tipData,
          expression: tipData.expression || prev.expression,
        }));
      }
    } catch (error) {
      logger.debug('[HawkCompanion] Failed to fetch tip', {
        context: 'HawkCompanion.fetchTip',
        characterId,
      });
    }
  }, [characterId, showTips, state.isActive]);

  // Request dialogue from server
  const requestDialogue = useCallback(
    async (trigger?: DialogueTrigger, context?: Record<string, unknown>) => {
      if (!characterId) return;

      try {
        const response = await tutorialService.getHawkDialogue(characterId, trigger, context);
        if (response.success && response.data) {
          const dialogueData = response.data;
          setState((prev) => ({
            ...prev,
            currentDialogue: dialogueData,
            expression: dialogueData.expression || prev.expression,
          }));
          setShowDialogue(true);
          onDialogueShown?.(dialogueData);
        }
      } catch (error) {
        logger.error('[HawkCompanion] Failed to get dialogue', error as Error, {
          context: 'HawkCompanion.requestDialogue',
          characterId,
          trigger,
        });
      }
    },
    [characterId, onDialogueShown]
  );

  // Handle avatar click (interact with Hawk)
  const handleAvatarClick = useCallback(async () => {
    if (!characterId) return;

    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    try {
      const response = await tutorialService.interactWithHawk(characterId);
      if (response.success && response.data?.dialogue) {
        setState((prev) => ({
          ...prev,
          currentDialogue: response.data!.dialogue,
          expression: response.data!.dialogue?.expression || prev.expression,
        }));
        setShowDialogue(true);
        onDialogueShown?.(response.data.dialogue);
      } else {
        // No dialogue - just expand the panel
        setIsExpanded(true);
      }
    } catch (error) {
      logger.debug('[HawkCompanion] Interaction failed', {
        context: 'HawkCompanion.handleAvatarClick',
      });
      setIsExpanded(true);
    }
  }, [characterId, isExpanded, onDialogueShown]);

  // Handle dialogue dismiss
  const handleDialogueDismiss = useCallback(() => {
    setShowDialogue(false);
    setState((prev) => ({ ...prev, currentDialogue: null }));
  }, []);

  // Handle tip dismiss
  const handleTipDismiss = useCallback(async () => {
    setShowTipBox(false);
    if (characterId && state.currentTip) {
      await tutorialService.markTipShown(characterId, state.currentTip.tipId);
    }
    setState((prev) => ({ ...prev, currentTip: null }));
  }, [characterId, state.currentTip]);

  // Handle tip click
  const handleTipClick = useCallback(() => {
    if (state.currentTip) {
      setShowTipBox(true);
    }
  }, [state.currentTip]);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Periodic tip check
  useEffect(() => {
    if (!state.isActive || !showTips) return;

    // Initial tip fetch
    fetchTip();

    // Check for tips periodically (every 2 minutes)
    const interval = setInterval(fetchTip, 120000);
    return () => clearInterval(interval);
  }, [state.isActive, showTips, fetchTip]);

  // Track phase changes
  useEffect(() => {
    if (state.tutorialStatus?.currentPhase) {
      onPhaseChange?.(state.tutorialStatus.currentPhase);
    }
  }, [state.tutorialStatus?.currentPhase, onPhaseChange]);

  // Computed values
  const hasNewTip = useMemo(() => {
    return !!state.currentTip && !showTipBox;
  }, [state.currentTip, showTipBox]);

  const tipAsDialogue = useMemo((): HawkDialogue | null => {
    if (!state.currentTip) return null;
    return {
      text: state.currentTip.text,
      expression: state.currentTip.expression,
      duration: 5000,
    };
  }, [state.currentTip]);

  // Don't render if not visible, not active, or loading
  if (!visible || !characterId) {
    return null;
  }

  if (state.isLoading) {
    return null; // Silently loading
  }

  if (!state.isActive) {
    return null; // Tutorial not active
  }

  const positionClass = position === 'bottom-left' ? 'left-4' : 'right-4';

  return (
    <>
      {/* Main companion widget */}
      <div className={`fixed bottom-4 ${positionClass} z-[9995]`}>
        {/* Expanded panel */}
        {isExpanded && (
          <div className="mb-3 bg-leather-dark/95 border-2 border-gold-dark rounded-lg shadow-xl p-3 w-64 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gold-dark/30">
              <HawkAvatar expression={state.expression} size="small" />
              <div>
                <h4 className="text-sm font-semibold text-gold-light">{HAWK_PROFILE.name}</h4>
                <p className="text-xs text-desert-stone">{HAWK_PROFILE.title}</p>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="ml-auto text-desert-stone/70 hover:text-desert-sand"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            {/* Tutorial progress */}
            {state.tutorialStatus && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-desert-stone">Current Phase:</span>
                  <span className="text-desert-sand font-medium">
                    {state.tutorialStatus.phaseName}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-wood-grain/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-light transition-all duration-500"
                    style={{ width: `${state.tutorialStatus.overallProgress}%` }}
                  />
                </div>
                <p className="text-xs text-desert-stone text-right">
                  {Math.round(state.tutorialStatus.overallProgress)}% Complete
                </p>

                {/* Step progress */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-desert-stone">Step:</span>
                  <span className="text-desert-sand">
                    {state.tutorialStatus.currentStep + 1} / {state.tutorialStatus.totalSteps}
                  </span>
                </div>

                {/* Milestones earned */}
                {state.tutorialStatus.milestonesEarned.length > 0 && (
                  <div className="pt-2 border-t border-gold-dark/30">
                    <p className="text-xs text-desert-stone mb-1">Milestones Earned:</p>
                    <div className="flex flex-wrap gap-1">
                      {state.tutorialStatus.milestonesEarned.slice(0, 5).map((m, i) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-0.5 bg-gold-dark/30 rounded text-xs text-gold-light"
                        >
                          {m}
                        </span>
                      ))}
                      {state.tutorialStatus.milestonesEarned.length > 5 && (
                        <span className="text-xs text-desert-stone">
                          +{state.tutorialStatus.milestonesEarned.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-3 pt-2 border-t border-gold-dark/30 flex gap-2">
              <button
                onClick={() => requestDialogue('idle')}
                className="flex-1 px-2 py-1.5 bg-wood-dark hover:bg-wood-grain/30 border border-gold-dark/50 rounded text-xs text-desert-sand transition-colors"
              >
                Talk to {HAWK_PROFILE.name}
              </button>
            </div>
          </div>
        )}

        {/* Floating avatar button */}
        <button
          onClick={handleAvatarClick}
          className="group relative"
          aria-label={isExpanded ? 'Close Hawk panel' : 'Open Hawk panel'}
        >
          <HawkAvatar
            expression={state.expression}
            size="medium"
            isActive={showDialogue || isExpanded}
            clickable
          />

          {/* Status indicator */}
          {hasNewTip && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold-light rounded-full flex items-center justify-center text-xs font-bold text-leather-dark animate-bounce">
              !
            </span>
          )}

          {/* Hover tooltip */}
          <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-leather-dark border border-gold-dark rounded px-2 py-1 text-xs text-desert-sand whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {HAWK_PROFILE.name} - Click to interact
          </span>
        </button>
      </div>

      {/* Dialogue box (when showing) */}
      {showDialogue && state.currentDialogue && (
        <HawkDialogueBox
          dialogue={state.currentDialogue}
          isVisible={showDialogue}
          position={position === 'bottom-left' ? 'bottom-left' : 'bottom-right'}
          onDismiss={handleDialogueDismiss}
          playerName={currentCharacter?.name || 'partner'}
        />
      )}

      {/* Tip box (when showing tip) */}
      {showTipBox && tipAsDialogue && (
        <HawkDialogueBox
          dialogue={tipAsDialogue}
          isVisible={showTipBox}
          position={position === 'bottom-left' ? 'bottom-left' : 'bottom-right'}
          isTip
          onDismiss={handleTipDismiss}
          dismissable={state.currentTip?.dismissable ?? true}
        />
      )}

      {/* Tip indicator (when tip available but box not shown) */}
      {hasNewTip && !showDialogue && !isExpanded && (
        <FloatingTipIndicator
          hasNewTip={true}
          expression={state.currentTip?.expression || 'neutral'}
          onClick={handleTipClick}
        />
      )}
    </>
  );
};

// ============================================================================
// COMPACT COMPANION (for sidebar/header use)
// ============================================================================

export interface CompactHawkProps {
  /** Click handler */
  onClick?: () => void;
  /** Show progress indicator */
  showProgress?: boolean;
}

export const CompactHawk: React.FC<CompactHawkProps> = ({ onClick, showProgress = false }) => {
  const { currentCharacter } = useCharacterStore();
  const [status, setStatus] = useState<TutorialStatus | null>(null);

  useEffect(() => {
    if (!currentCharacter?._id) return;

    tutorialService.getStatus(currentCharacter._id).then((res) => {
      if (res.success && res.data) {
        setStatus(res.data);
      }
    });
  }, [currentCharacter?._id]);

  if (!status?.isActive) return null;

  return (
    <div className="flex items-center gap-2">
      <HawkMiniAvatar
        expression={status.hawk?.expression || 'neutral'}
        onClick={onClick}
        showIndicator={showProgress}
        indicatorColor="gold"
      />
      {showProgress && (
        <div className="hidden sm:block">
          <p className="text-xs text-desert-stone">{status.phaseName}</p>
          <div className="w-16 h-1 bg-wood-grain/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold-light"
              style={{ width: `${status.overallProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Display names
HawkCompanion.displayName = 'HawkCompanion';
CompactHawk.displayName = 'CompactHawk';

export default HawkCompanion;
