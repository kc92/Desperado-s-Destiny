/**
 * Tutorial Store - AAA Tutorial System
 * Manages tutorial/onboarding state with Hawk mentor character
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// MentorExpression type imported for potential future use
import type { MentorExpression as _MentorExpression } from '@/data/tutorial/mentorDialogues';
import { FACTION_INTROS, SHARED_CORE_PATH, INTRO_SETTLER } from '@/data/tutorial/onboardingSteps';
import { tutorialService } from '@/services/tutorial.service';
import { logger } from '@/services/logger.service';
import { useCharacterStore } from './useCharacterStore';
import { useSkillStore } from './useSkillStore';

// Tutorial step with action requirements
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  requiresAction?: string; // ID of action required to proceed
  actionPrompt?: string; // Text to prompt user for action
  highlight?: string[]; // CSS selectors for elements to highlight
  dialogueId?: string; // ID for mentor dialogue associated with this step
  rewards?: { // Optional rewards for completing a step
    gold?: number;
    xp?: number;
    items?: { itemId: string; quantity: number }[];
  };
}

// Tutorial section grouping
export interface TutorialSection {
  id: string;
  name: string;
  description: string;
  icon: string;
  estimatedMinutes: number;
  type: 'core' | 'deep_dive'; // Added type for core vs. deep-dive
  steps: TutorialStep[];
  unlockCondition?: { // Conditions to unlock deep-dive modules
    minLevel?: number;
    professionId?: string;
    minProfessionLevel?: number;
    completedCoreSections?: string[];
  };
}

// Tutorial analytics tracking
export interface TutorialSkipEvent {
  sectionId: string;
  stepId: string;
  timestamp: string;
  progress: number;
  timeSpentMs: number;
  tutorialType: 'core' | 'deep_dive'; // Added tutorial type
}

export interface TutorialCompletionEvent {
  sectionId: string;
  timestamp: string;
  timeSpentMs: number;
  tutorialType: 'core' | 'deep_dive'; // Added tutorial type
}

export interface TutorialAnalytics {
  skipEvents: TutorialSkipEvent[];
  completionEvents: TutorialCompletionEvent[];
  sectionStartTimes: Record<string, number>;
}

// Tutorial progress state
export interface TutorialProgress {
  tutorialCompleted: boolean; // True if the core tutorial is completed
  completedSections: string[]; // IDs of completed core sections
  completedDeepDives: string[]; // IDs of completed deep-dive modules
  currentSection: string | null; // ID of current active section
  currentStep: number; // Index of current step within the section
  currentDialogueLine: number; // Index of current dialogue line within the step
  tutorialType: 'core' | 'deep_dive' | null; // Type of currently active tutorial
  activePath: TutorialSection[]; // Dynamic path for the current tutorial run
  startedAt: string | null;
  completedAt: string | null;
  skipCount: number;
  quizAnswers: Record<string, boolean>;
  practiceDrawCount: number;
  skillToggleUsed: boolean;
  analytics: TutorialAnalytics;
  // Track completed tutorial actions for canProceed validation
  completedActions: string[];
  // New: Track unlocked deep-dive modules
  unlockedDeepDives: string[];
  // Track which character this tutorial state belongs to
  characterId: string | null;
}

// Full tutorial state interface
interface TutorialState extends TutorialProgress {
  isActive: boolean;
  isPaused: boolean;
  showResumePrompt: boolean;
  showCompletionModal: boolean;

  // Actions
  startTutorial: (sectionId: string, type: 'core' | 'deep_dive', factionId?: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  nextDialogueLine: () => void;
  skipSection: () => void;
  skipTutorial: () => void; // Skips only the core tutorial
  pauseTutorial: () => void;
  resumeTutorial: () => void;
  completeTutorial: () => void; // Completes only the core tutorial
  completeSection: () => void;
  resetTutorial: () => void;
  dismissResumePrompt: () => void;
  dismissCompletionModal: () => void;
  unlockDeepDive: (sectionId: string) => void;

  // Quiz and interaction tracking
  recordQuizAnswer: (questionId: string, correct: boolean) => void;
  recordPracticeDraw: () => void;
  recordSkillToggle: () => void;

  // Action completion
  completeAction: (actionId: string) => void;

  // Analytics tracking
  trackSkip: (sectionId: string, stepId: string) => void;
  trackCompletion: (sectionId: string) => void;
  getAnalyticsSummary: () => {
    totalSkips: number;
    skipsBySection: Record<string, number>;
    completedSections: string[];
    averageProgressAtSkip: number;
    averageTimeBeforeSkipMs: number;
    sectionCompletionTimes: Record<string, number>;
  };

  // Computed helpers
  getCurrentSection: () => TutorialSection | undefined;
  getCurrentStep: () => TutorialStep | undefined;
  getTotalProgress: () => number; // Only for core tutorial
  getTotalStepsCompleted: () => number; // Count of all completed steps
  canProceed: () => boolean;
  canSkipTutorial: () => boolean; // Returns true if mandatory steps completed
  getAvailableDeepDives: () => TutorialSection[];
  getUnlockedDeepDives: () => TutorialSection[];
}

// --- AAA Tutorial Content ---

// Export default settler path as fallback for imports
export const CORE_TUTORIAL_SECTIONS: TutorialSection[] = [INTRO_SETTLER, ...SHARED_CORE_PATH];

// OPTIONAL DEEP-DIVE MODULES (Non-linear, On-demand)
export const DEEP_DIVE_TUTORIALS: TutorialSection[] = [
  {
    id: 'deep_deck_mastery',
    name: 'Destiny Deck Mastery',
    description: 'Advanced strategies for manipulating the Destiny Deck and maximizing your hand ranks.',
    icon: '🃏',
    estimatedMinutes: 10,
    type: 'deep_dive',
    unlockCondition: {
      completedCoreSections: ['destiny_energy'],
    },
    steps: [
      { id: 'dd-deck-1', title: 'Advanced Card Theory', description: 'Understanding suit priorities.', dialogueId: 'dd-deck-theory' },
      { id: 'dd-deck-2', title: 'Skill Bonuses', description: 'How your skills influence draws.', dialogueId: 'dd-deck-skill-bonuses', requiresAction: 'toggle-skills', actionPrompt: 'Toggle skill bonuses in a practice draw' },
      { id: 'dd-deck-3', title: 'Critical Success', description: 'Maximizing your odds for perfect hands.', dialogueId: 'dd-deck-critical' },
      { id: 'dd-deck-4', title: 'Practice Advanced Draws', description: 'Achieve a "Good" or better hand.', dialogueId: 'dd-deck-practice-advanced', requiresAction: 'achieve-good-hand', actionPrompt: 'Perform practice draws until you get a "Good" hand' },
    ],
  },
  {
    id: 'deep_hunting_basics',
    name: 'Hunting & Tracking Basics',
    description: 'Learn to track prey, use hunting gear, and harvest valuable resources.',
    icon: '🐾',
    estimatedMinutes: 15,
    type: 'deep_dive',
    unlockCondition: {
      minLevel: 5,
      professionId: 'hunting',
      minProfessionLevel: 1,
    },
    steps: [
      { id: 'dd-hunt-1', title: 'Tracking Basics', description: 'Finding fresh signs of wildlife.', dialogueId: 'dd-hunt-intro', requiresAction: 'travel-to-hunting-grounds', actionPrompt: 'Travel to a hunting ground (e.g., Sangre Canyon)' },
      { id: 'dd-hunt-2', title: 'Using Scent Glands', description: 'Lure your prey.', dialogueId: 'dd-hunt-scent', requiresAction: 'use-item-predator-scent-gland', actionPrompt: 'Use a Predator Scent Gland' },
      { id: 'dd-hunt-3', title: 'The Perfect Kill', description: 'Maximize your harvest.', dialogueId: 'dd-hunt-kill', requiresAction: 'defeat-wildlife-for-perfect-hide', actionPrompt: 'Defeat a wildlife NPC and harvest a "Perfect Hide"' },
      { id: 'dd-hunt-4', title: 'Skinning Techniques', description: 'Using your knife to get more resources.', dialogueId: 'dd-hunt-skinning', requiresAction: 'equip-masterwork-skinning-knife', actionPrompt: 'Equip a Masterwork Skinning Knife' },
    ],
  },
  {
    id: 'deep_blacksmithing',
    name: 'Forging Ahead (Blacksmithing)',
    description: 'A deeper dive into smelting, component crafting, and basic weapon forging.',
    icon: '🔨',
    estimatedMinutes: 20,
    type: 'deep_dive',
    unlockCondition: {
      minProfessionLevel: 10,
      professionId: 'blacksmithing',
      completedCoreSections: ['intro_crafting'],
    },
    steps: [
      { id: 'dd-bs-1', title: 'The Blacksmith\'s Art', description: 'Beyond basic ingots.', dialogueId: 'dd-bs-intro' },
      { id: 'dd-bs-2', title: 'Crafting Components', description: 'Build a Blade Blank.', dialogueId: 'dd-bs-component', requiresAction: 'craft-recipe-blade-blank', actionPrompt: 'Craft 1 Blade Blank' },
      { id: 'dd-bs-3', title: 'Forging a Weapon', description: 'Your first true weapon.', dialogueId: 'dd-bs-weapon', requiresAction: 'craft-recipe-rough-iron-sword', actionPrompt: 'Craft 1 Rough Iron Sword' },
      { id: 'dd-bs-4', title: 'Tool Quality Matters', description: 'Upgrade your tools for better results.', dialogueId: 'dd-bs-tool-quality', requiresAction: 'equip-tool-blacksmith-good', actionPrompt: 'Equip a "Good Blacksmith\'s Hammer"' },
    ],
  },
  // Add more deep-dive modules for other professions, combat roles, etc.
];

// Combine all sections for tracking total steps
export const TUTORIAL_SECTIONS = [...CORE_TUTORIAL_SECTIONS, ...DEEP_DIVE_TUTORIALS];

// Number of mandatory steps before skip is allowed
// This covers the essential onboarding: Destiny Deck basics, Energy, Stats, First Action
export const MANDATORY_STEPS = 5;

// Initial progress state
const initialProgress: TutorialProgress = {
  tutorialCompleted: false,
  completedSections: [],
  completedDeepDives: [],
  currentSection: null,
  currentStep: 0,
  currentDialogueLine: 0,
  tutorialType: null, // Initial type
  activePath: [], // Initial empty path
  startedAt: null,
  completedAt: null,
  skipCount: 0,
  quizAnswers: {},
  practiceDrawCount: 0,
  skillToggleUsed: false,
  analytics: {
    skipEvents: [],
    completionEvents: [],
    sectionStartTimes: {},
  },
  completedActions: [],
  unlockedDeepDives: [],
  characterId: null,
};

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialProgress,
      isActive: false,
      isPaused: false,
      showResumePrompt: false,
      showCompletionModal: false,

      // Start tutorial from beginning or specific section/type
      startTutorial: (sectionId: string, type: 'core' | 'deep_dive', factionId?: string) => {
        const now = Date.now();
        let activePath: TutorialSection[] = get().activePath;

        // Determine path
        if (type === 'core') {
          if (factionId && FACTION_INTROS[factionId]) {
            activePath = [FACTION_INTROS[factionId], ...SHARED_CORE_PATH];
          } else if (activePath.length === 0) {
            // Fallback if no path set and no faction provided
            activePath = CORE_TUTORIAL_SECTIONS; 
          }
        } else {
          activePath = DEEP_DIVE_TUTORIALS;
        }

        const section = activePath.find(s => s.id === sectionId);

        if (section) {
          // Get current character ID to associate tutorial with this character
          const currentCharacterId = useCharacterStore.getState().currentCharacter?._id || null;

          set(state => ({
            isActive: true,
            isPaused: false,
            showResumePrompt: false,
            currentSection: sectionId,
            currentStep: 0,
            currentDialogueLine: 0,
            tutorialType: type,
            activePath: activePath,
            characterId: currentCharacterId, // Track which character this tutorial belongs to
            startedAt: state.startedAt || new Date().toISOString(),
            analytics: {
              ...state.analytics,
              sectionStartTimes: {
                ...state.analytics.sectionStartTimes,
                [sectionId]: now,
              },
            },
          }));
        } else {
          logger.error(`Tutorial section ${sectionId} not found for type ${type}`, new Error('Tutorial section not found'), { context: 'useTutorialStore.startTutorial', sectionId, type });
        }
      },

      // Go to next step in current section
      nextStep: () => {
        const state = get();
        const section = state.activePath.find(s => s.id === state.currentSection);

        if (!section) {
          logger.error('Current tutorial section not found.', new Error('Current tutorial section not found'), { context: 'useTutorialStore.nextStep', currentSection: state.currentSection });
          return;
        }

        if (state.currentStep < section.steps.length - 1) {
          // More steps in this section
          set({
            currentStep: state.currentStep + 1,
            currentDialogueLine: 0,
          });
        } else {
          // End of section - complete it
          get().completeSection();
        }
      },

      // Go to previous step
      prevStep: () => {
        const { currentStep, currentDialogueLine } = get();
        if (currentDialogueLine > 0) {
          set({ currentDialogueLine: currentDialogueLine - 1 });
        } else if (currentStep > 0) {
          set({ currentStep: currentStep - 1, currentDialogueLine: 0 });
        }
      },

      // Advance to next dialogue line
      nextDialogueLine: () => {
        set(state => ({ 
          currentDialogueLine: state.currentDialogueLine + 1,
        }));
      },

      // Skip current section and move to next (only for core tutorial)
      skipSection: () => {
        const state = get();
        if (state.tutorialType !== 'core') {
            logger.warn('Cannot skip deep-dive sections in this manner.', { context: 'useTutorialStore.skipSection', tutorialType: state.tutorialType });
            return;
        }

        // Check if mandatory steps are completed before allowing skip
        if (!get().canSkipTutorial()) {
          logger.warn(`Cannot skip yet. Complete ${MANDATORY_STEPS} steps first. Currently at ${get().getTotalStepsCompleted()} steps.`, { context: 'useTutorialStore.skipSection', mandatorySteps: MANDATORY_STEPS, totalStepsCompleted: get().getTotalStepsCompleted() });
          return;
        }

        const currentIndex = state.activePath.findIndex(s => s.id === state.currentSection);

        // Track the skip event
        if (state.currentSection) {
          const section = state.activePath[currentIndex];
          const step = section?.steps[state.currentStep];
          if (step) {
            get().trackSkip(state.currentSection, step.id);
          }
        }

        set(prev => ({ skipCount: prev.skipCount + 1 }));

        if (currentIndex < state.activePath.length - 1) {
          // Move to next core section
          const nextSection = state.activePath[currentIndex + 1];
          const now = Date.now();
          set(prevState => ({
            currentSection: nextSection.id,
            currentStep: 0,
            currentDialogueLine: 0,
            analytics: {
              ...prevState.analytics,
              sectionStartTimes: {
                ...prevState.analytics.sectionStartTimes,
                [nextSection.id]: now,
              },
            },
          }));
        } else {
          // Last core section - complete core tutorial
          get().completeTutorial();
        }
      },

      // Skip entire core tutorial
      skipTutorial: () => {
        const state = get();
        if (state.tutorialType !== 'core') {
            logger.warn('Can only skip the core tutorial using this method.', { context: 'useTutorialStore.skipTutorial', tutorialType: state.tutorialType });
            return;
        }

        // Check if mandatory steps are completed before allowing skip
        if (!get().canSkipTutorial()) {
          logger.warn(`Cannot skip tutorial yet. Complete ${MANDATORY_STEPS} mandatory steps first. Currently at ${get().getTotalStepsCompleted()} steps.`, { context: 'useTutorialStore.skipTutorial', mandatorySteps: MANDATORY_STEPS, totalStepsCompleted: get().getTotalStepsCompleted() });
          return;
        }

        // Track skip event for entire tutorial
        if (state.currentSection) {
          const section = state.getCurrentSection();
          const step = section?.steps[state.currentStep];
          if (step) {
            get().trackSkip(state.currentSection, step.id);
          }
        }

        set({
          isActive: false,
          isPaused: false,
          currentSection: null,
          currentStep: 0,
          currentDialogueLine: 0,
          tutorialType: null,
          tutorialCompleted: true,
          completedAt: new Date().toISOString(),
          skipCount: get().skipCount + 1,
        });
      },

      // Pause tutorial (e.g., when navigating away)
      pauseTutorial: () => {
        set({ isPaused: true });
      },

      // Resume paused tutorial
      resumeTutorial: () => {
        set({
          isPaused: false,
          showResumePrompt: false,
          isActive: true,
        });
      },

      // Complete current section and move to next (handles core and deep-dive)
      completeSection: () => {
        const state = get();
        const { currentSection, completedSections, completedDeepDives, tutorialType, activePath } = state;

        if (!currentSection || !tutorialType) return;

        // Track section completion
        get().trackCompletion(currentSection);

        // Mark section as completed
        let newCompletedSections = completedSections;
        let newCompletedDeepDives = completedDeepDives;

        if (tutorialType === 'core') {
            if (!completedSections.includes(currentSection)) {
                newCompletedSections = [...completedSections, currentSection];
            }
        } else { // deep_dive
            if (!completedDeepDives.includes(currentSection)) {
                newCompletedDeepDives = [...completedDeepDives, currentSection];
            }
        }

        // Handle rewards for step completion via server-side API
        const currentStepObj = state.getCurrentStep();
        if (currentStepObj?.id) {
            // Claim rewards from server (server defines actual reward amounts)
            const characterId = useCharacterStore.getState().currentCharacter?._id;
            if (characterId) {
                tutorialService.claimReward(currentStepObj.id, characterId)
                    .then((result) => {
                        if (result.success && result.data) {
                            const { rewards, character } = result.data;
                            // Update character store with new values if provided
                            if (character) {
                                useCharacterStore.getState().updateCharacter({
                                    gold: character.gold,
                                    experience: character.experience,
                                    level: character.level,
                                });
                            }
                            if (rewards.gold || rewards.xp) {
                                logger.info(`[Tutorial] Rewards claimed for ${currentStepObj.id}:`, { context: 'useTutorialStore.completeSection', stepId: currentStepObj.id, rewards });
                            }
                            if (rewards.leveledUp) {
                                logger.info(`[Tutorial] Level up! New level: ${rewards.newLevel}`, { context: 'useTutorialStore.completeSection', newLevel: rewards.newLevel });
                            }
                        }
                    })
                    .catch((err) => {
                        logger.warn('[Tutorial] Failed to claim rewards:', { context: 'useTutorialStore.completeSection', error: err });
                    });
            }
        }

        if (tutorialType === 'core') {
            // Find next core section
            const currentIndex = activePath.findIndex(s => s.id === currentSection);
            const nextSection = activePath[currentIndex + 1];

            if (nextSection) {
              const now = Date.now();
              set(prevState => ({
                completedSections: newCompletedSections,
                currentSection: nextSection.id,
                currentStep: 0,
                currentDialogueLine: 0,
                analytics: {
                  ...prevState.analytics,
                  sectionStartTimes: {
                    ...prevState.analytics.sectionStartTimes,
                    [nextSection.id]: now,
                  },
                },
              }));
            } else {
              // All core sections complete
              get().completeTutorial();
            }
        } else { // deep_dive - just end it
            set({
                completedDeepDives: newCompletedDeepDives,
                isActive: false,
                isPaused: false,
                currentSection: null,
                currentStep: 0,
                currentDialogueLine: 0,
                tutorialType: null,
            });
            logger.info(`[Tutorial] Deep-dive tutorial "${currentSection}" completed.`, { context: 'useTutorialStore.completeSection', sectionId: currentSection });
        }
      },

      // Complete entire core tutorial
      completeTutorial: () => {
        const { completedSections, currentSection, startedAt } = get();
        const finalCompleted = currentSection && !completedSections.includes(currentSection) && get().tutorialType === 'core'
          ? [...completedSections, currentSection]
          : completedSections;

        const completedAt = new Date().toISOString();
        const timeSpentMs = startedAt ? new Date(completedAt).getTime() - new Date(startedAt).getTime() : 0;

        // Claim tutorial completion bonus reward
        const characterId = useCharacterStore.getState().currentCharacter?._id;
        if (characterId) {
            // Claim the special 'tutorial-complete' bonus reward
            tutorialService.claimReward('tutorial-complete', characterId)
                .then((result) => {
                    if (result.success && result.data?.rewards) {
                        logger.info('[Tutorial] Completion bonus claimed:', { context: 'useTutorialStore.completeTutorial', rewards: result.data.rewards });
                        if (result.data.character) {
                            useCharacterStore.getState().updateCharacter({
                                gold: result.data.character.gold,
                                experience: result.data.character.experience,
                                level: result.data.character.level,
                            });
                        }
                    }
                })
                .catch((err) => logger.warn('[Tutorial] Failed to claim completion bonus:', { context: 'useTutorialStore.completeTutorial', error: err }));

            // Send analytics to server
            tutorialService.trackAnalytics(characterId, {
                event: 'complete',
                sectionId: currentSection || 'tutorial',
                progress: 100,
                timeSpentMs,
                tutorialType: 'core',
            }).catch((err) => logger.warn('[Tutorial] Failed to track completion analytics:', { context: 'useTutorialStore.completeTutorial', error: err }));
        }

        set({
          isActive: false,
          isPaused: false,
          tutorialCompleted: true, // Only core tutorial sets this to true
          completedSections: finalCompleted,
          currentSection: null,
          currentStep: 0,
          currentDialogueLine: 0,
          tutorialType: null,
          completedAt,
          showCompletionModal: true, // Show the completion celebration modal
        });
      },

      // Reset all tutorial progress
      resetTutorial: () => {
        set({
          ...initialProgress,
          isActive: false,
          isPaused: false,
          showResumePrompt: false,
        });
      },

      // Dismiss resume prompt without resuming
      dismissResumePrompt: () => {
        set({ showResumePrompt: false });
      },

      // Dismiss completion celebration modal
      dismissCompletionModal: () => {
        set({ showCompletionModal: false });
      },

      // Unlock a deep-dive module
      unlockDeepDive: (sectionId: string) => {
        set(state => ({
            unlockedDeepDives: state.unlockedDeepDives.includes(sectionId)
                ? state.unlockedDeepDives
                : [...state.unlockedDeepDives, sectionId],
        }));
      },

      // Record quiz answer
      recordQuizAnswer: (questionId: string, correct: boolean) => {
        set(state => ({
          quizAnswers: {
            ...state.quizAnswers,
            [questionId]: correct,
          },
        }));
      },

      // Record a practice draw
      recordPracticeDraw: () => {
        set(state => ({
          practiceDrawCount: state.practiceDrawCount + 1,
        }));
      },

      // Record skill toggle usage
      recordSkillToggle: () => {
        set({ skillToggleUsed: true });
      },

      // Complete a required action
      completeAction: (actionId: string) => {
        // Use callback form to avoid race condition with concurrent calls
        set((state) => {
          if (state.completedActions.includes(actionId)) {
            return state; // Already completed, no change
          }
          return {
            ...state,
            completedActions: [...state.completedActions, actionId],
          };
        });

        // Check for auto-advance using the latest state after update
        const step = get().getCurrentStep();
        if (step?.requiresAction === actionId) {
          // Resume tutorial if it was paused (minimized) and advance to next step
          set({ isPaused: false });
          get().nextStep();
        }
      },

      // Track skip event with analytics
      trackSkip: (sectionId: string, stepId: string) => {
        const state = get();
        const sectionStartTime = state.analytics.sectionStartTimes[sectionId] || Date.now();
        const timeSpentMs = Date.now() - sectionStartTime;

        const event: TutorialSkipEvent = {
          sectionId,
          stepId,
          timestamp: new Date().toISOString(),
          progress: state.getTotalProgress(),
          timeSpentMs,
          tutorialType: state.tutorialType || 'core', // Default to core if null
        };

        if (import.meta.env.DEV) {
          logger.info('[Tutorial Analytics] Skip:', { context: 'useTutorialStore.trackSkip', event, sectionId, stepId });
          logger.info(`[Tutorial]   Section: ${sectionId}, Step: ${stepId}`, { context: 'useTutorialStore.trackSkip' });
          logger.info(`[Tutorial]   Progress: ${event.progress}%, Time spent: ${Math.round(timeSpentMs / 1000)}s`, { context: 'useTutorialStore.trackSkip' });
        }

        // Store in state
        set(prevState => ({
          analytics: {
            ...prevState.analytics,
            skipEvents: [...prevState.analytics.skipEvents, event],
          },
        }));

        // Send skip analytics to server
        const characterId = useCharacterStore.getState().currentCharacter?._id;
        if (characterId) {
            tutorialService.trackAnalytics(characterId, {
                event: 'skip',
                sectionId,
                stepId,
                progress: event.progress,
                timeSpentMs,
                tutorialType: event.tutorialType,
            }).catch((err) => logger.warn('[Tutorial] Failed to track skip analytics:', { context: 'useTutorialStore.trackSkip', error: err }));
        }
      },

      // Track section completion
      trackCompletion: (sectionId: string) => {
        const state = get();
        const sectionStartTime = state.analytics.sectionStartTimes[sectionId] || Date.now();
        const timeSpentMs = Date.now() - sectionStartTime;

        const event: TutorialCompletionEvent = {
          sectionId,
          timestamp: new Date().toISOString(),
          timeSpentMs,
          tutorialType: state.tutorialType || 'core', // Default to core if null
        };

        if (import.meta.env.DEV) {
          logger.info('[Tutorial Analytics] Complete:', { context: 'useTutorialStore.trackCompletion', event, sectionId });
          logger.info(`[Tutorial]   Section: ${sectionId}, Time spent: ${Math.round(timeSpentMs / 1000)}s`, { context: 'useTutorialStore.trackCompletion' });
        }

        // Store in state
        set(prevState => ({
          analytics: {
            ...prevState.analytics,
            completionEvents: [...prevState.analytics.completionEvents, event],
          },
        }));

        // Send section completion analytics to server
        const characterId = useCharacterStore.getState().currentCharacter?._id;
        if (characterId) {
            tutorialService.trackAnalytics(characterId, {
                event: 'section_complete',
                sectionId,
                timeSpentMs,
                tutorialType: event.tutorialType,
            }).catch((err) => logger.warn('[Tutorial] Failed to track section completion:', { context: 'useTutorialStore.trackCompletion', error: err }));
        }
      },

      // Get analytics summary
      getAnalyticsSummary: () => {
        const { skipEvents, completionEvents } = get().analytics;

        // Calculate skips by section
        const skipsBySection = skipEvents.reduce((acc, event) => {
          acc[event.sectionId] = (acc[event.sectionId] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Calculate average progress at skip
        const averageProgressAtSkip = skipEvents.length > 0
          ? skipEvents.reduce((sum, event) => sum + event.progress, 0) / skipEvents.length
          : 0;

        // Calculate average time before skip
        const averageTimeBeforeSkipMs = skipEvents.length > 0
          ? skipEvents.reduce((sum, event) => sum + event.timeSpentMs, 0) / skipEvents.length
          : 0;

        // Calculate section completion times
        const sectionCompletionTimes = completionEvents.reduce((acc, event) => {
          acc[event.sectionId] = event.timeSpentMs;
          return acc;
        }, {} as Record<string, number>);

        return {
          totalSkips: skipEvents.length,
          skipsBySection,
          completedSections: completionEvents.map(e => e.sectionId),
          averageProgressAtSkip,
          averageTimeBeforeSkipMs,
          sectionCompletionTimes,
        };
      },

      // Get current section object
      getCurrentSection: () => {
        const { currentSection, activePath } = get();
        if (!currentSection) return undefined;
        return activePath.find(s => s.id === currentSection);
      },

      // Get current step object
      getCurrentStep: () => {
        const section = get().getCurrentSection();
        if (!section) return undefined;
        return section.steps[get().currentStep];
      },

      // Calculate total progress percentage (only for core tutorial)
      getTotalProgress: () => {
        const { completedSections, currentSection, currentStep, activePath, tutorialType } = get();

        // Only calculate for core tutorial
        if (tutorialType !== 'core') return 0;

        let completedSteps = 0;

        // Count steps in completed sections
        for (const section of activePath) {
          if (completedSections.includes(section.id)) {
            completedSteps += section.steps.length;
          }
        }

        // Add current progress in active section
        if (currentSection && !completedSections.includes(currentSection)) {
          const currentCoreSection = activePath.find(s => s.id === currentSection);
          if (currentCoreSection) {
            completedSteps += currentStep;
          }
        }

        const coreTotalSteps = activePath.reduce((sum, s) => sum + s.steps.length, 0);
        return coreTotalSteps > 0 ? Math.round((completedSteps / coreTotalSteps) * 100) : 0;
      },

      // Get total number of steps completed (for mandatory step enforcement)
      getTotalStepsCompleted: () => {
        const { completedSections, currentSection, currentStep, activePath } = get();

        let completedSteps = 0;

        // Count steps in completed sections
        for (const section of activePath) {
          if (completedSections.includes(section.id)) {
            completedSteps += section.steps.length;
          }
        }

        // Add current progress in active section (current step index = completed steps in this section)
        if (currentSection && !completedSections.includes(currentSection)) {
          completedSteps += currentStep;
        }

        return completedSteps;
      },

      // Check if mandatory steps are completed to allow skipping
      canSkipTutorial: () => {
        const totalCompleted = get().getTotalStepsCompleted();
        return totalCompleted >= MANDATORY_STEPS;
      },

      // Check if current step can proceed (action requirements met)
      canProceed: () => {
        const step = get().getCurrentStep();
        if (!step?.requiresAction) return true;

        const state = get();
        const actionId = step.requiresAction;

        // Special cases that have dedicated tracking (not in completedActions)
        switch (actionId) {
            case 'draw-cards':
                return state.practiceDrawCount >= 1;
            case 'toggle-skills':
                return state.skillToggleUsed;
            case 'achieve-good-hand':
                // Requires a practice draw with quality tracking
                return state.practiceDrawCount >= 1;
        }

        // Check if this action has been completed via completeAction()
        // This covers all game interactions like navigation, jobs, crafting, combat, etc.
        if (state.completedActions.includes(actionId)) {
            return true;
        }

        // Action not yet completed - player must perform it
        return false;
      },

      // Get all available deep-dive modules (based on unlock conditions)
      getAvailableDeepDives: () => {
          const state = get();
          // Get character data for level checks
          const character = useCharacterStore.getState().currentCharacter;
          const characterLevel = character?.level ?? 1;
          // Get skill data for profession level checks
          const skillData = useSkillStore.getState().skillData;
          const getSkillLevel = (skillId: string): number => {
              const skill = skillData?.find((sd) => sd.skillId === skillId);
              return skill?.level ?? 0;
          };

          return DEEP_DIVE_TUTORIALS.filter(dd => {
              if (state.completedDeepDives.includes(dd.id)) return false; // Already completed
              if (state.unlockedDeepDives.includes(dd.id)) return true; // Manually unlocked

              // Check unlock conditions
              const conditions = dd.unlockCondition;
              if (!conditions) return true; // Always available if no conditions

              if (conditions.minLevel && characterLevel < conditions.minLevel) return false;
              if (conditions.professionId && conditions.minProfessionLevel) {
                  const professionLevel = getSkillLevel(conditions.professionId);
                  if (professionLevel < conditions.minProfessionLevel) return false;
              }
              if (conditions.completedCoreSections && !conditions.completedCoreSections.every(sectionId => state.completedSections.includes(sectionId))) return false;

              return true;
          });
      },

      // Get deep-dive modules that have been explicitly unlocked
      getUnlockedDeepDives: () => {
          const state = get();
          return DEEP_DIVE_TUTORIALS.filter(dd => state.unlockedDeepDives.includes(dd.id));
      },

    }),
    {
      name: 'tutorial-storage',
      partialize: (state) => ({
        tutorialCompleted: state.tutorialCompleted,
        completedSections: state.completedSections,
        completedDeepDives: state.completedDeepDives, // Persist new field
        currentSection: state.currentSection,
        currentStep: state.currentStep,
        currentDialogueLine: state.currentDialogueLine,
        tutorialType: state.tutorialType, // Persist new field
        activePath: state.activePath, // Persist the path!
        startedAt: state.startedAt,
        completedAt: state.completedAt,
        skipCount: state.skipCount,
        quizAnswers: state.quizAnswers,
        practiceDrawCount: state.practiceDrawCount,
        skillToggleUsed: state.skillToggleUsed,
        analytics: state.analytics,
        completedActions: state.completedActions, // Persist completed tutorial actions
        unlockedDeepDives: state.unlockedDeepDives, // Persist new field
        characterId: state.characterId, // Persist character ID for per-character tutorial state
      }),
      onRehydrateStorage: () => (state) => {
        // Get the current character ID (may be null on initial load)
        const currentCharacterId = useCharacterStore.getState().currentCharacter?._id;

        // Show resume prompt only if tutorial was in progress AND belongs to current character
        if (state && state.currentSection && !state.tutorialCompleted) {
          if (state.characterId && state.characterId === currentCharacterId) {
            // Same character - show resume prompt
            state.showResumePrompt = true;
            state.isActive = false;
            state.isPaused = true;
          } else {
            // Different character or no character yet - reset tutorial state for fresh start
            state.showResumePrompt = false;
            state.currentSection = null;
            state.currentStep = 0;
            state.currentDialogueLine = 0;
            state.isActive = false;
            state.isPaused = false;
            state.characterId = null;
          }
        }
      },
    }
  )
);

// Helper to get section by ID
export const getTutorialSection = (sectionId: string, type: 'core' | 'deep_dive'): TutorialSection | undefined => {
  const targetSections = type === 'core' ? CORE_TUTORIAL_SECTIONS : DEEP_DIVE_TUTORIALS;
  return targetSections.find(s => s.id === sectionId);
};

// Get total estimated time
export const getTotalEstimatedMinutes = (): number => {
  return TUTORIAL_SECTIONS.reduce((sum, s) => sum + s.estimatedMinutes, 0);
};

export default useTutorialStore;
