/**
 * Tutorial Store - AAA Tutorial System
 * Manages tutorial/onboarding state with Hawk mentor character
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MentorExpression } from '@/data/tutorial/mentorDialogues';

// Tutorial step with action requirements
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  requiresAction?: string;
  actionPrompt?: string;
  highlight?: string[];
  dialogueId?: string;
}

// Tutorial section grouping
export interface TutorialSection {
  id: string;
  name: string;
  description: string;
  icon: string;
  estimatedMinutes: number;
  steps: TutorialStep[];
}

// Tutorial analytics tracking
export interface TutorialSkipEvent {
  sectionId: string;
  stepId: string;
  timestamp: string;
  progress: number;
  timeSpentMs: number;
}

export interface TutorialCompletionEvent {
  sectionId: string;
  timestamp: string;
  timeSpentMs: number;
}

export interface TutorialAnalytics {
  skipEvents: TutorialSkipEvent[];
  completionEvents: TutorialCompletionEvent[];
  sectionStartTimes: Record<string, number>;
}

// Tutorial progress state
export interface TutorialProgress {
  tutorialCompleted: boolean;
  completedSections: string[];
  currentSection: string | null;
  currentStep: number;
  currentDialogueLine: number;
  startedAt: string | null;
  completedAt: string | null;
  skipCount: number;
  quizAnswers: Record<string, boolean>;
  practiceDrawCount: number;
  skillToggleUsed: boolean;
  analytics: TutorialAnalytics;
}

// Full tutorial state interface
interface TutorialState extends TutorialProgress {
  isActive: boolean;
  isPaused: boolean;
  showResumePrompt: boolean;

  // Actions
  startTutorial: (sectionId?: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  nextDialogueLine: () => void;
  skipSection: () => void;
  skipTutorial: () => void;
  pauseTutorial: () => void;
  resumeTutorial: () => void;
  completeTutorial: () => void;
  completeSection: () => void;
  resetTutorial: () => void;
  dismissResumePrompt: () => void;

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
  getTotalProgress: () => number;
  canProceed: () => boolean;
}

// AAA Tutorial content - 7 sections, ~25 total steps
export const TUTORIAL_SECTIONS: TutorialSection[] = [
  {
    id: 'welcome',
    name: 'Welcome',
    description: 'Meet your guide and learn the basics',
    icon: '🤠',
    estimatedMinutes: 3,
    steps: [
      {
        id: 'welcome-1',
        title: 'Welcome to Sangre Territory',
        description: 'Meet Hawk, your guide to the frontier',
        dialogueId: 'welcome-greeting',
        position: 'center',
      },
      {
        id: 'welcome-2',
        title: 'Your Dashboard',
        description: 'This is your home base',
        dialogueId: 'welcome-dashboard',
        target: '[data-tutorial-target="dashboard-stats"]',
        highlight: ['[data-tutorial-target="dashboard-stats"]'],
        requiresAction: 'click-dashboard',
        actionPrompt: 'Click the stats panel',
      },
      {
        id: 'welcome-3',
        title: 'Ready to Learn',
        description: 'The real lessons begin',
        dialogueId: 'welcome-complete',
      },
    ],
  },
  {
    id: 'destiny_deck',
    name: 'The Destiny Deck',
    description: 'Master the card system that determines your fate',
    icon: '🃏',
    estimatedMinutes: 5,
    steps: [
      {
        id: 'deck-1',
        title: 'The Destiny Deck',
        description: 'Every action is decided by the cards',
        dialogueId: 'deck-intro',
      },
      {
        id: 'deck-2',
        title: 'The Four Suits',
        description: 'Each suit represents a path',
        dialogueId: 'deck-cards',
      },
      {
        id: 'deck-3',
        title: 'Poker Hands',
        description: 'Better hands mean better results',
        dialogueId: 'deck-hands',
      },
      {
        id: 'deck-4',
        title: 'Test Your Knowledge',
        description: 'Identify the poker hands',
        dialogueId: 'deck-quiz',
        requiresAction: 'complete-quiz',
        actionPrompt: 'Answer all quiz questions',
      },
      {
        id: 'deck-5',
        title: 'Score vs Threshold',
        description: 'How success is determined',
        dialogueId: 'deck-threshold',
      },
      {
        id: 'deck-6',
        title: 'Practice Draw',
        description: 'Draw your first hand',
        dialogueId: 'deck-practice-success',
        requiresAction: 'draw-cards',
        actionPrompt: 'Click "Draw Cards"',
      },
      {
        id: 'deck-7',
        title: 'Skill Bonuses',
        description: 'Skills boost your suits',
        dialogueId: 'deck-skill-intro',
        requiresAction: 'toggle-skills',
        actionPrompt: 'Toggle the skill bonus',
      },
      {
        id: 'deck-8',
        title: 'Deck Mastery',
        description: 'You understand the Destiny Deck',
        dialogueId: 'deck-complete',
      },
    ],
  },
  {
    id: 'energy',
    name: 'Energy System',
    description: 'Learn to manage your most precious resource',
    icon: '⚡',
    estimatedMinutes: 2,
    steps: [
      {
        id: 'energy-1',
        title: 'Your Energy',
        description: 'Actions cost energy',
        dialogueId: 'energy-intro',
        target: '[data-tutorial-target="energy-bar"]',
        highlight: ['[data-tutorial-target="energy-bar"]'],
      },
      {
        id: 'energy-2',
        title: 'Energy Costs',
        description: 'Different actions, different costs',
        dialogueId: 'energy-explain',
      },
      {
        id: 'energy-3',
        title: 'Regeneration',
        description: 'Energy comes back over time',
        dialogueId: 'energy-regen',
      },
    ],
  },
  {
    id: 'actions',
    name: 'Taking Action',
    description: 'Learn to perform jobs and tasks',
    icon: '📋',
    estimatedMinutes: 3,
    steps: [
      {
        id: 'actions-1',
        title: 'The Bounty Board',
        description: 'Find work here',
        dialogueId: 'actions-intro',
        target: '[data-tutorial-target="actions-link"]',
        highlight: ['[data-tutorial-target="actions-link"]'],
        requiresAction: 'navigate-actions',
        actionPrompt: 'Click Bounty Board',
      },
      {
        id: 'actions-2',
        title: 'Choosing Actions',
        description: 'Pick tasks that suit you',
        dialogueId: 'actions-list',
      },
      {
        id: 'actions-3',
        title: 'Action Details',
        description: 'Understand costs and rewards',
        dialogueId: 'actions-detail',
      },
      {
        id: 'actions-4',
        title: 'Actions Mastered',
        description: 'You know how to take action',
        dialogueId: 'actions-complete',
      },
    ],
  },
  {
    id: 'skills',
    name: 'Skills & Training',
    description: 'Improve your abilities over time',
    icon: '📚',
    estimatedMinutes: 2,
    steps: [
      {
        id: 'skills-1',
        title: 'The Library',
        description: 'Train your skills here',
        dialogueId: 'skills-intro',
        target: '[data-tutorial-target="skills-link"]',
        highlight: ['[data-tutorial-target="skills-link"]'],
        requiresAction: 'navigate-skills',
        actionPrompt: 'Click The Library',
      },
      {
        id: 'skills-2',
        title: 'Skill Categories',
        description: 'Four paths, four suits',
        dialogueId: 'skills-categories',
      },
      {
        id: 'skills-3',
        title: 'Training',
        description: 'Set skills to train over time',
        dialogueId: 'skills-training',
      },
    ],
  },
  {
    id: 'combat',
    name: 'Combat Basics',
    description: 'Learn to fight and survive',
    icon: '⚔️',
    estimatedMinutes: 3,
    steps: [
      {
        id: 'combat-1',
        title: 'The Arena',
        description: 'Where battles happen',
        dialogueId: 'combat-intro',
        target: '[data-tutorial-target="combat-link"]',
        highlight: ['[data-tutorial-target="combat-link"]'],
        requiresAction: 'navigate-combat',
        actionPrompt: 'Click Dueling Grounds',
      },
      {
        id: 'combat-2',
        title: 'How Combat Works',
        description: 'Cards decide the outcome',
        dialogueId: 'combat-explain',
      },
      {
        id: 'combat-3',
        title: 'Combat Ready',
        description: 'You can handle yourself',
        dialogueId: 'combat-complete',
      },
    ],
  },
  {
    id: 'complete',
    name: 'Welcome to the Frontier',
    description: 'Your journey begins',
    icon: '🌅',
    estimatedMinutes: 2,
    steps: [
      {
        id: 'complete-1',
        title: 'Tutorial Complete',
        description: 'Hawk\'s farewell',
        dialogueId: 'complete-farewell',
      },
    ],
  },
];

// Calculate total steps
const TOTAL_STEPS = TUTORIAL_SECTIONS.reduce((sum, s) => sum + s.steps.length, 0);

// Initial progress state
const initialProgress: TutorialProgress = {
  tutorialCompleted: false,
  completedSections: [],
  currentSection: null,
  currentStep: 0,
  currentDialogueLine: 0,
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
};

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialProgress,
      isActive: false,
      isPaused: false,
      showResumePrompt: false,

      // Start tutorial from beginning or specific section
      startTutorial: (sectionId?: string) => {
        const targetSection = sectionId || 'welcome';
        const section = TUTORIAL_SECTIONS.find(s => s.id === targetSection);
        if (section) {
          const now = Date.now();
          set(state => ({
            isActive: true,
            isPaused: false,
            showResumePrompt: false,
            currentSection: targetSection,
            currentStep: 0,
            currentDialogueLine: 0,
            startedAt: state.startedAt || new Date().toISOString(),
            analytics: {
              ...state.analytics,
              sectionStartTimes: {
                ...state.analytics.sectionStartTimes,
                [targetSection]: now,
              },
            },
          }));
        }
      },

      // Go to next step in current section
      nextStep: () => {
        const state = get();
        const section = TUTORIAL_SECTIONS.find(s => s.id === state.currentSection);

        if (!section) return;

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

      // Skip current section and move to next
      skipSection: () => {
        const state = get();
        const currentIndex = TUTORIAL_SECTIONS.findIndex(s => s.id === state.currentSection);

        // Track the skip event
        if (state.currentSection) {
          const section = TUTORIAL_SECTIONS[currentIndex];
          const step = section?.steps[state.currentStep];
          if (step) {
            get().trackSkip(state.currentSection, step.id);
          }
        }

        set(prev => ({ skipCount: prev.skipCount + 1 }));

        if (currentIndex < TUTORIAL_SECTIONS.length - 1) {
          // Move to next section
          const nextSection = TUTORIAL_SECTIONS[currentIndex + 1];
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
          // Last section - complete tutorial
          get().completeTutorial();
        }
      },

      // Skip entire tutorial
      skipTutorial: () => {
        const state = get();

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

      // Complete current section and move to next
      completeSection: () => {
        const state = get();
        const { currentSection, completedSections } = state;

        if (!currentSection) return;

        // Track section completion
        get().trackCompletion(currentSection);

        // Mark section as completed
        const newCompletedSections = completedSections.includes(currentSection)
          ? completedSections
          : [...completedSections, currentSection];

        // Find next section
        const currentIndex = TUTORIAL_SECTIONS.findIndex(s => s.id === currentSection);
        const nextSection = TUTORIAL_SECTIONS[currentIndex + 1];

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
          // All sections complete
          get().completeTutorial();
        }
      },

      // Complete entire tutorial
      completeTutorial: () => {
        const { completedSections, currentSection } = get();
        const finalCompleted = currentSection && !completedSections.includes(currentSection)
          ? [...completedSections, currentSection]
          : completedSections;

        set({
          isActive: false,
          isPaused: false,
          tutorialCompleted: true,
          completedSections: finalCompleted,
          currentSection: null,
          currentStep: 0,
          currentDialogueLine: 0,
          completedAt: new Date().toISOString(),
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
        const state = get();
        const step = state.getCurrentStep();

        if (step?.requiresAction === actionId) {
          // Action completed - can now proceed
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
        };

        // Log to console in development
        if (import.meta.env.DEV) {
          console.log('[Tutorial Analytics] Skip:', event);
          console.log(`  Section: ${sectionId}, Step: ${stepId}`);
          console.log(`  Progress: ${event.progress}%, Time spent: ${Math.round(timeSpentMs / 1000)}s`);
        }

        // Store in state
        set(prevState => ({
          analytics: {
            ...prevState.analytics,
            skipEvents: [...prevState.analytics.skipEvents, event],
          },
        }));

        // TODO: Optionally send to API endpoint
        // apiClient.post('/api/analytics/tutorial-skip', event);
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
        };

        // Log to console in development
        if (import.meta.env.DEV) {
          console.log('[Tutorial Analytics] Complete:', event);
          console.log(`  Section: ${sectionId}, Time spent: ${Math.round(timeSpentMs / 1000)}s`);
        }

        // Store in state
        set(prevState => ({
          analytics: {
            ...prevState.analytics,
            completionEvents: [...prevState.analytics.completionEvents, event],
          },
        }));

        // TODO: Optionally send to API endpoint
        // apiClient.post('/api/analytics/tutorial-complete', event);
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
        const { currentSection } = get();
        return TUTORIAL_SECTIONS.find(s => s.id === currentSection);
      },

      // Get current step object
      getCurrentStep: () => {
        const section = get().getCurrentSection();
        if (!section) return undefined;
        return section.steps[get().currentStep];
      },

      // Calculate total progress percentage
      getTotalProgress: () => {
        const { completedSections, currentSection, currentStep } = get();

        let completedSteps = 0;

        // Count steps in completed sections
        for (const sectionId of completedSections) {
          const section = TUTORIAL_SECTIONS.find(s => s.id === sectionId);
          if (section) {
            completedSteps += section.steps.length;
          }
        }

        // Add current progress in active section
        if (currentSection && !completedSections.includes(currentSection)) {
          completedSteps += currentStep;
        }

        return Math.round((completedSteps / TOTAL_STEPS) * 100);
      },

      // Check if current step can proceed (action requirements met)
      canProceed: () => {
        const step = get().getCurrentStep();
        if (!step?.requiresAction) return true;

        const state = get();

        switch (step.requiresAction) {
          case 'complete-quiz':
            // Need 3 correct answers
            const correctAnswers = Object.values(state.quizAnswers).filter(v => v).length;
            return correctAnswers >= 3;

          case 'draw-cards':
            return state.practiceDrawCount >= 1;

          case 'toggle-skills':
            return state.skillToggleUsed;

          case 'click-dashboard':
          case 'navigate-actions':
          case 'navigate-skills':
          case 'navigate-combat':
            // These are handled by completeAction
            return false;

          default:
            return true;
        }
      },
    }),
    {
      name: 'tutorial-storage',
      partialize: (state) => ({
        tutorialCompleted: state.tutorialCompleted,
        completedSections: state.completedSections,
        currentSection: state.currentSection,
        currentStep: state.currentStep,
        currentDialogueLine: state.currentDialogueLine,
        startedAt: state.startedAt,
        completedAt: state.completedAt,
        skipCount: state.skipCount,
        quizAnswers: state.quizAnswers,
        practiceDrawCount: state.practiceDrawCount,
        skillToggleUsed: state.skillToggleUsed,
        analytics: state.analytics,
      }),
      onRehydrate: () => (state) => {
        // Show resume prompt if tutorial was in progress
        if (state && state.currentSection && !state.tutorialCompleted) {
          state.showResumePrompt = true;
          state.isActive = false;
          state.isPaused = true;
        }
      },
    }
  )
);

// Helper to get section by ID
export const getTutorialSection = (sectionId: string): TutorialSection | undefined => {
  return TUTORIAL_SECTIONS.find(s => s.id === sectionId);
};

// Get total estimated time
export const getTotalEstimatedMinutes = (): number => {
  return TUTORIAL_SECTIONS.reduce((sum, s) => sum + s.estimatedMinutes, 0);
};

export default useTutorialStore;
