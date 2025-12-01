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
  startedAt: string | null;
  completedAt: string | null;
  skipCount: number;
  quizAnswers: Record<string, boolean>;
  practiceDrawCount: number;
  skillToggleUsed: boolean;
  analytics: TutorialAnalytics;
  // New: Track unlocked deep-dive modules
  unlockedDeepDives: string[];
}

// Full tutorial state interface
interface TutorialState extends TutorialProgress {
  isActive: boolean;
  isPaused: boolean;
  showResumePrompt: boolean;

  // Actions
  startTutorial: (sectionId: string, type: 'core' | 'deep_dive') => void;
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
  canProceed: () => boolean;
  getAvailableDeepDives: () => TutorialSection[];
  getUnlockedDeepDives: () => TutorialSection[];
}

// --- AAA Tutorial Content ---

// CORE ONBOARDING PATH (Mandatory, Linear)
export const CORE_TUTORIAL_SECTIONS: TutorialSection[] = [
  {
    id: 'welcome',
    name: 'Welcome to the Frontier',
    description: 'Meet your guide, understand the basics, and explore your surroundings.',
    icon: '🤠',
    estimatedMinutes: 5,
    type: 'core',
    steps: [
      { id: 'welcome-1', title: 'Welcome, Partner!', description: 'Meet Hawk, your guide.', dialogueId: 'welcome-greeting', position: 'center' },
      { id: 'welcome-2', title: 'Your Dashboard', description: 'This is your essential info hub.', dialogueId: 'welcome-dashboard', target: '[data-tutorial-target="dashboard-stats"]', highlight: ['[data-tutorial-target="dashboard-stats"]'], requiresAction: 'click-dashboard', actionPrompt: 'Click your character portrait or stats panel' },
      { id: 'welcome-3', title: 'Character & Inventory', description: 'Manage your gear and resources.', dialogueId: 'welcome-character-panel', target: '[data-tutorial-target="character-panel-button"]', highlight: ['[data-tutorial-target="character-panel-button"]'], requiresAction: 'open-character-panel', actionPrompt: 'Open your Character Panel' },
      { id: 'welcome-4', title: 'Basic Navigation', description: 'Move around the world.', dialogueId: 'welcome-navigation', requiresAction: 'navigate-to-red-gulch', actionPrompt: 'Navigate to Red Gulch Town Square (click on map or travel option)' },
    ],
  },
  {
    id: 'destiny_energy',
    name: 'Destiny & Drive (Deck & Energy)',
    description: 'Understand the card system that governs actions and how to manage your energy.',
    icon: '🃏⚡',
    estimatedMinutes: 7,
    type: 'core',
    steps: [
      { id: 'deck-1', title: 'The Destiny Deck', description: 'Every action is a gamble.', dialogueId: 'deck-intro' },
      { id: 'deck-2', title: 'Hand Ranks', description: 'Better hands, better results.', dialogueId: 'deck-hands' },
      { id: 'deck-3', title: 'Practice Draw', description: 'Draw your first hand to see it in action.', dialogueId: 'deck-practice-success', requiresAction: 'draw-cards', actionPrompt: 'Click "Draw Cards"' },
      { id: 'energy-1', title: 'Your Energy', description: 'Actions cost energy, manage it wisely.', dialogueId: 'energy-intro', target: '[data-tutorial-target="energy-bar"]', highlight: ['[data-tutorial-target="energy-bar"]'] },
      { id: 'energy-2', title: 'Energy Costs', description: 'Different actions, different costs.', dialogueId: 'energy-explain' },
    ],
  },
  {
    id: 'first_job',
    name: 'First Steps (Jobs & Rewards)',
    description: 'Take your first job and earn some honest coin.',
    icon: '💰',
    estimatedMinutes: 7,
    type: 'core',
    steps: [
      { id: 'job-1', title: 'The Bounty Board', description: 'Find available tasks.', dialogueId: 'job-intro', target: '[data-tutorial-target="jobs-link"]', highlight: ['[data-tutorial-target="jobs-link"]'], requiresAction: 'navigate-jobs', actionPrompt: 'Go to the Jobs board' },
      { id: 'job-2', title: 'Choose a Job', description: 'Select "General Labor" in Red Gulch.', dialogueId: 'job-select', target: '[data-job-id="general-labor"]', highlight: ['[data-job-id="general-labor"]'], requiresAction: 'accept-job-general-labor', actionPrompt: 'Accept the General Labor job' },
      { id: 'job-3', title: 'Complete Job', description: 'See your rewards.', dialogueId: 'job-complete-confirm', requiresAction: 'complete-job-general-labor', actionPrompt: 'Complete the job (this usually takes time or energy)' },
      { id: 'job-4', title: 'Check Your Earnings', description: 'Gold and XP will show here.', dialogueId: 'job-rewards', target: '[data-tutorial-target="currency-gold"]', highlight: ['[data-tutorial-target="currency-gold"]'] },
    ],
  },
  {
    id: 'basic_combat',
    name: 'First Blood (Basic Combat)',
    description: 'Engage in your first combat encounter and learn to defend yourself.',
    icon: '⚔️',
    estimatedMinutes: 5,
    type: 'core',
    steps: [
      { id: 'combat-1', title: 'Into the Wild', description: 'Find an easy target.', dialogueId: 'combat-intro', requiresAction: 'travel-to-wild-encounter', actionPrompt: 'Travel to the wilderness for an encounter (e.g., fight a Coyote)' },
      { id: 'combat-2', title: 'Combat Start', description: 'Your first duel.', dialogueId: 'combat-start', requiresAction: 'initiate-combat-coyote', actionPrompt: 'Initiate combat with a Coyote' },
      { id: 'combat-3', title: 'Battle Flow', description: 'Cards and strategy.', dialogueId: 'combat-flow' },
      { id: 'combat-4', title: 'Victory & Loot', description: 'Claim your spoils.', dialogueId: 'combat-loot', target: '[data-tutorial-target="combat-loot-summary"]', highlight: ['[data-tutorial-target="combat-loot-summary"]'] },
    ],
  },
  {
    id: 'intro_crafting',
    name: 'Hands-On (Introduction to Crafting)',
    description: 'Learn the basics of gathering, refining, and selling materials.',
    icon: '🔨',
    estimatedMinutes: 10,
    type: 'core',
    steps: [
      { id: 'craft-1', title: 'Gathering First', description: 'You\'ll need raw materials.', dialogueId: 'craft-gather-intro', requiresAction: 'travel-to-mine', actionPrompt: 'Travel to the Abandoned Mine (loc_f_02)' },
      { id: 'craft-2', title: 'Mine for Ore', description: 'Extract some iron.', dialogueId: 'craft-mine-job', requiresAction: 'complete-job-mine-iron-ore', actionPrompt: 'Complete the "Mine for Iron Ore" job' },
      { id: 'craft-3', title: 'Your Inventory', description: 'Check your new resources.', dialogueId: 'craft-inventory', target: '[data-tutorial-target="inventory-link"]', highlight: ['[data-tutorial-target="inventory-link"]'], requiresAction: 'open-inventory', actionPrompt: 'Open your Inventory' },
      { id: 'craft-4', title: 'The Crafting Bench', description: 'Where raw becomes refined.', dialogueId: 'craft-refine-intro', target: '[data-tutorial-target="crafting-link"]', highlight: ['[data-tutorial-target="crafting-link"]'], requiresAction: 'navigate-crafting', actionPrompt: 'Go to the Crafting menu' },
      { id: 'craft-5', title: 'Refine Materials', description: 'Turn ore into ingots.', dialogueId: 'craft-refine-action', requiresAction: 'craft-recipe-silver-ingot', actionPrompt: 'Craft 1 Silver Ingot (find the recipe and click craft)' },
      { id: 'craft-6', title: 'Market Bound', description: 'Sell your excess goods.', dialogueId: 'craft-sell-intro', requiresAction: 'navigate-marketplace', actionPrompt: 'Go to the Marketplace' },
      { id: 'craft-7', title: 'List Your Goods', description: 'Put your ingot up for sale.', dialogueId: 'craft-list-item', requiresAction: 'sell-item-silver-ingot', actionPrompt: 'Sell 1 Silver Ingot on the market' },
    ],
  },
  {
    id: 'end_core',
    name: 'Your Journey Truly Begins',
    description: 'You are now ready to face the frontier!',
    icon: '🌅',
    estimatedMinutes: 2,
    type: 'core',
    steps: [
      { id: 'end-1', title: 'Tutorial Complete!', description: 'Hawk bids you farewell.', dialogueId: 'complete-farewell' },
      { id: 'end-2', title: 'What Next?', description: 'Explore the world, pursue professions, or seek fame.', dialogueId: 'complete-options' },
    ],
  },
];

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
const ALL_TUTORIAL_SECTIONS = [...CORE_TUTORIAL_SECTIONS, ...DEEP_DIVE_TUTORIALS];
const TOTAL_STEPS = ALL_TUTORIAL_SECTIONS.reduce((sum, s) => sum + s.steps.length, 0);

// Initial progress state
const initialProgress: TutorialProgress = {
  tutorialCompleted: false,
  completedSections: [],
  completedDeepDives: [],
  currentSection: null,
  currentStep: 0,
  currentDialogueLine: 0,
  tutorialType: null, // Initial type
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
  unlockedDeepDives: [],
};

export const useTutorialStore = create<TutorialState>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialProgress,
      isActive: false,
      isPaused: false,
      showResumePrompt: false,

      // Start tutorial from beginning or specific section/type
      startTutorial: (sectionId: string, type: 'core' | 'deep_dive') => {
        const targetSections = type === 'core' ? CORE_TUTORIAL_SECTIONS : DEEP_DIVE_TUTORIALS;
        const section = targetSections.find(s => s.id === sectionId);

        if (section) {
          const now = Date.now();
          set(state => ({
            isActive: true,
            isPaused: false,
            showResumePrompt: false,
            currentSection: sectionId,
            currentStep: 0,
            currentDialogueLine: 0,
            tutorialType: type,
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
          console.error(`Tutorial section ${sectionId} not found for type ${type}`);
        }
      },

      // Go to next step in current section
      nextStep: () => {
        const state = get();
        const targetSections = state.tutorialType === 'core' ? CORE_TUTORIAL_SECTIONS : DEEP_DIVE_TUTORIALS;
        const section = targetSections.find(s => s.id === state.currentSection);

        if (!section) {
          console.error('Current tutorial section not found.');
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
            console.warn('Cannot skip deep-dive sections in this manner.');
            return;
        }

        const currentIndex = CORE_TUTORIAL_SECTIONS.findIndex(s => s.id === state.currentSection);

        // Track the skip event
        if (state.currentSection) {
          const section = CORE_TUTORIAL_SECTIONS[currentIndex];
          const step = section?.steps[state.currentStep];
          if (step) {
            get().trackSkip(state.currentSection, step.id);
          }
        }

        set(prev => ({ skipCount: prev.skipCount + 1 }));

        if (currentIndex < CORE_TUTORIAL_SECTIONS.length - 1) {
          // Move to next core section
          const nextSection = CORE_TUTORIAL_SECTIONS[currentIndex + 1];
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
            console.warn('Can only skip the core tutorial using this method.');
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
        const { currentSection, completedSections, completedDeepDives, tutorialType } = state;

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

        // Handle rewards for step completion
        const currentStepObj = state.getCurrentStep();
        if (currentStepObj?.rewards) {
            // TODO: Dispatch actions to award rewards (gold, xp, items)
            console.log('Awarding rewards:', currentStepObj.rewards);
        }

        if (tutorialType === 'core') {
            // Find next core section
            const currentIndex = CORE_TUTORIAL_SECTIONS.findIndex(s => s.id === currentSection);
            const nextSection = CORE_TUTORIAL_SECTIONS[currentIndex + 1];

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
            console.log(`Deep-dive tutorial "${currentSection}" completed.`);
        }
      },

      // Complete entire core tutorial
      completeTutorial: () => {
        const { completedSections, currentSection } = get();
        const finalCompleted = currentSection && !completedSections.includes(currentSection) && get().tutorialType === 'core'
          ? [...completedSections, currentSection]
          : completedSections;

        set({
          isActive: false,
          isPaused: false,
          tutorialCompleted: true, // Only core tutorial sets this to true
          completedSections: finalCompleted,
          currentSection: null,
          currentStep: 0,
          currentDialogueLine: 0,
          tutorialType: null,
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
          tutorialType: state.tutorialType || 'core', // Default to core if null
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
          tutorialType: state.tutorialType || 'core', // Default to core if null
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
        const { currentSection, tutorialType } = get();
        if (!currentSection || !tutorialType) return undefined;
        const targetSections = tutorialType === 'core' ? CORE_TUTORIAL_SECTIONS : DEEP_DIVE_TUTORIALS;
        return targetSections.find(s => s.id === currentSection);
      },

      // Get current step object
      getCurrentStep: () => {
        const section = get().getCurrentSection();
        if (!section) return undefined;
        return section.steps[get().currentStep];
      },

      // Calculate total progress percentage (only for core tutorial)
      getTotalProgress: () => {
        const { completedSections, currentSection, currentStep } = get();

        let completedSteps = 0;

        // Count steps in completed sections
        for (const section of CORE_TUTORIAL_SECTIONS) {
          if (completedSections.includes(section.id)) {
            completedSteps += section.steps.length;
          }
        }

        // Add current progress in active section if it's a core tutorial
        if (currentSection && get().tutorialType === 'core' && !completedSections.includes(currentSection)) {
          const currentCoreSection = CORE_TUTORIAL_SECTIONS.find(s => s.id === currentSection);
          if (currentCoreSection) {
            completedSteps += currentStep;
          }
        }

        const coreTotalSteps = CORE_TUTORIAL_SECTIONS.reduce((sum, s) => sum + s.steps.length, 0);
        return coreTotalSteps > 0 ? Math.round((completedSteps / coreTotalSteps) * 100) : 0;
      },

      // Check if current step can proceed (action requirements met)
      canProceed: () => {
        const step = get().getCurrentStep();
        if (!step?.requiresAction) return true;

        const state = get();

        // Implement more sophisticated action checks here
        switch (step.requiresAction) {
            case 'click-dashboard': return true; // Handled by UI click event
            case 'open-character-panel': return true;
            case 'navigate-to-red-gulch': return true;
            case 'draw-cards': return state.practiceDrawCount >= 1;
            case 'accept-job-general-labor': return true;
            case 'complete-job-general-labor': return true; // This will need a backend check
            case 'travel-to-mine': return true;
            case 'complete-job-mine-iron-ore': return true;
            case 'open-inventory': return true;
            case 'navigate-crafting': return true;
            case 'craft-recipe-silver-ingot': return true;
            case 'navigate-marketplace': return true;
            case 'sell-item-silver-ingot': return true;
            case 'travel-to-wild-encounter': return true;
            case 'initiate-combat-coyote': return true;
            case 'use-item-predator-scent-gland': return true;
            case 'defeat-wildlife-for-perfect-hide': return true;
            case 'equip-masterwork-skinning-knife': return true;
            case 'craft-recipe-blade-blank': return true;
            case 'craft-recipe-rough-iron-sword': return true;
            case 'equip-tool-blacksmith-good': return true;
            case 'toggle-skills': return state.skillToggleUsed;
            case 'achieve-good-hand':
                 // This would require checking the last hand drawn quality
                 // For now, simply requiring a practice draw will suffice
                return state.practiceDrawCount >= 1;
            default:
                console.warn(`Unhandled requiresAction: ${step.requiresAction}`);
                return false;
        }
      },

      // Get all available deep-dive modules (based on unlock conditions)
      getAvailableDeepDives: () => {
          const state = get();
          return DEEP_DIVE_TUTORIALS.filter(dd => {
              if (state.completedDeepDives.includes(dd.id)) return false; // Already completed
              if (state.unlockedDeepDives.includes(dd.id)) return true; // Manually unlocked

              // Check unlock conditions
              const conditions = dd.unlockCondition;
              if (!conditions) return true; // Always available if no conditions

              if (conditions.minLevel && (/*characterLevel*/ 0 < conditions.minLevel)) return false;
              if (conditions.professionId && conditions.minProfessionLevel && (/*characterProfessionLevel*/ 0 < conditions.minProfessionLevel)) return false;
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
        startedAt: state.startedAt,
        completedAt: state.completedAt,
        skipCount: state.skipCount,
        quizAnswers: state.quizAnswers,
        practiceDrawCount: state.practiceDrawCount,
        skillToggleUsed: state.skillToggleUsed,
        analytics: state.analytics,
        unlockedDeepDives: state.unlockedDeepDives, // Persist new field
      }),
      onRehydrate: (state) => {
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

// Combine all sections for tracking total steps
const ALL_TUTORIAL_SECTIONS = [...CORE_TUTORIAL_SECTIONS, ...DEEP_DIVE_TUTORIALS];
const TOTAL_STEPS = ALL_TUTORIAL_SECTIONS.reduce((sum, s) => sum + s.steps.length, 0);

// Helper to get section by ID
export const getTutorialSection = (sectionId: string, type: 'core' | 'deep_dive'): TutorialSection | undefined => {
  const targetSections = type === 'core' ? CORE_TUTORIAL_SECTIONS : DEEP_DIVE_TUTORIALS;
  return targetSections.find(s => s.id === sectionId);
};

// Get total estimated time
export const getTotalEstimatedMinutes = (): number => {
  return ALL_TUTORIAL_SECTIONS.reduce((sum, s) => sum + s.estimatedMinutes, 0);
};

export default useTutorialStore;
