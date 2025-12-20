import { TutorialSection } from '@/store/useTutorialStore';

// ============================================ 
// FACTION INTRODUCTIONS (BRANCHING START)
// ============================================ 

export const INTRO_SETTLER: TutorialSection = {
  id: 'intro_settler',
  name: 'Settler Orientation',
  description: 'Learn about Red Gulch and secure the perimeter.',
  icon: '🏛️',
  estimatedMinutes: 8,
  type: 'core',
  steps: [
    {
      id: 'settler-1',
      title: 'Welcome to Red Gulch',
      description: 'Hawk introduces you to Settler Territory.',
      dialogueId: 'settler-welcome',
      position: 'center'
    },
    {
      id: 'settler-1b',
      title: 'Settler Territory',
      description: 'Learn about the zone you\'re in.',
      dialogueId: 'settler-zone',
      position: 'center'
    },
    {
      id: 'settler-2',
      title: 'The Governor\'s Request',
      description: 'Your first assignment awaits at the Western Outpost.',
      dialogueId: 'settler-task',
      requiresAction: 'navigate-to-outpost',
      actionPrompt: 'Travel to the Western Outpost'
    },
    {
      id: 'settler-3',
      title: 'Perimeter Check',
      description: 'Prove your worth to the Alliance.',
      dialogueId: 'settler-check',
      requiresAction: 'complete-job-perimeter-check',
      actionPrompt: 'Complete "Perimeter Check" job'
    },
    {
      id: 'settler-4',
      title: 'Mission Complete',
      description: 'Return to Red Gulch with your report.',
      dialogueId: 'settler-complete',
      position: 'center'
    }
  ],
};

export const INTRO_NAHI: TutorialSection = {
  id: 'intro_nahi',
  name: 'Coalition Initiation',
  description: 'Connect with the land and protect the sacred sites.',
  icon: '🪶',
  estimatedMinutes: 8,
  type: 'core',
  steps: [
    {
      id: 'nahi-1',
      title: 'Walk the Path',
      description: 'Hawk acknowledges your allegiance.',
      dialogueId: 'nahi-welcome',
      position: 'center'
    },
    {
      id: 'nahi-1b',
      title: 'Coalition Lands',
      description: 'Learn about the territory you protect.',
      dialogueId: 'nahi-zone',
      position: 'center'
    },
    {
      id: 'nahi-2',
      title: 'Sacred Duty',
      description: 'Elders report intruders near the springs.',
      dialogueId: 'nahi-task',
      requiresAction: 'navigate-to-springs',
      actionPrompt: 'Travel to Sacred Springs'
    },
    {
      id: 'nahi-3',
      title: 'Scout Intruders',
      description: 'Observe without being seen.',
      dialogueId: 'nahi-check',
      requiresAction: 'complete-job-scout-intruders',
      actionPrompt: 'Complete "Scout Intruders" job'
    },
    {
      id: 'nahi-4',
      title: 'The Land Remembers',
      description: 'Return to Kaiowa Mesa with your findings.',
      dialogueId: 'nahi-complete',
      position: 'center'
    }
  ],
};

export const INTRO_FRONTERA: TutorialSection = {
  id: 'intro_frontera',
  name: 'Frontera Job',
  description: 'Prove your worth to the syndicate.',
  icon: '🔪',
  estimatedMinutes: 8,
  type: 'core',
  steps: [
    {
      id: 'frontera-1',
      title: 'Welcome to Freedom',
      description: 'Hawk acknowledges your allegiance.',
      dialogueId: 'frontera-welcome',
      position: 'center'
    },
    {
      id: 'frontera-1b',
      title: 'Outlaw Territory',
      description: 'Learn the rules of the lawless lands.',
      dialogueId: 'frontera-zone',
      position: 'center'
    },
    {
      id: 'frontera-2',
      title: 'El Rey\'s Test',
      description: 'Move a package through town unnoticed.',
      dialogueId: 'frontera-task',
      requiresAction: 'navigate-to-smugglers-den',
      actionPrompt: 'Travel to Smuggler\'s Den'
    },
    {
      id: 'frontera-3',
      title: 'The Handoff',
      description: 'Deliver the goods.',
      dialogueId: 'frontera-check',
      requiresAction: 'complete-job-smuggle-goods',
      actionPrompt: 'Complete "Smuggle Goods" job'
    },
    {
      id: 'frontera-4',
      title: 'Earned Trust',
      description: 'Return to The Frontera as a made member.',
      dialogueId: 'frontera-complete',
      position: 'center'
    }
  ],
};

// ============================================
// CORE MECHANICS (SHARED)
// ============================================

export const DESTINY_DECK_QUIZ: TutorialSection = {
  id: 'destiny_deck_quiz',
  name: 'Test Your Knowledge',
  description: 'Prove you understand the Destiny Deck.',
  icon: '🎴',
  estimatedMinutes: 3,
  type: 'core',
  steps: [
    {
      id: 'quiz-1',
      title: 'Pop Quiz',
      description: 'Hawk wants to make sure you understood the basics.',
      dialogueId: 'quiz-intro',
      position: 'center'
    },
    {
      id: 'quiz-2',
      title: 'The Quiz',
      description: 'Answer questions about poker hands.',
      dialogueId: 'quiz-start',
      requiresAction: 'complete-hand-quiz',
      actionPrompt: 'Complete the quiz'
    },
    {
      id: 'quiz-3',
      title: 'Well Done',
      description: 'You passed the test.',
      dialogueId: 'quiz-complete',
      position: 'center'
    }
  ],
};

export const COMBAT_BASICS: TutorialSection = {
  id: 'combat_basics',
  name: 'Survival Instincts',
  description: 'Defend yourself against a sudden threat.',
  icon: '⚔️',
  estimatedMinutes: 7,
  type: 'core',
  steps: [
    {
      id: 'combat-1',
      title: 'Ambush!',
      description: 'You are attacked while on the job.',
      dialogueId: 'combat-ambush',
      position: 'center'
    },
    {
      id: 'combat-2',
      title: 'The Destiny Deck',
      description: 'Understand how fate decides combat.',
      dialogueId: 'deck-intro-combat'
    },
    {
      id: 'combat-3',
      title: 'Defend Yourself',
      description: 'Win your first duel.',
      dialogueId: 'combat-start',
      requiresAction: 'initiate-combat-tutorial',
      actionPrompt: 'Fight the attacker'
    },
    {
      id: 'combat-4',
      title: 'Victory',
      description: 'You survived. Claim your loot.',
      dialogueId: 'combat-victory',
      target: '[data-tutorial-target="combat-loot-summary"]'
    }
  ],
};

export const ECONOMY_BASICS: TutorialSection = {
  id: 'economy_basics',
  name: 'Making a Living',
  description: 'Gather resources and understand the economy.',
  icon: '💰',
  estimatedMinutes: 10,
  type: 'core',
  steps: [
    {
      id: 'eco-1',
      title: 'The Aftermath',
      description: 'War requires resources.',
      dialogueId: 'eco-intro',
      position: 'center'
    },
    {
      id: 'eco-2',
      title: 'Gathering',
      description: 'Head to the mines to restock.',
      dialogueId: 'eco-mine-task',
      requiresAction: 'navigate-to-mine',
      actionPrompt: 'Travel to the Abandoned Mine'
    },
        { 
          id: 'eco-3', 
          title: 'Strike the Earth', 
          description: 'Mine for Iron Ore.', 
          dialogueId: 'eco-mine-action',
          requiresAction: 'complete-job-mine-iron-ore',
          actionPrompt: 'Complete "Mine Iron Ore" job'
        },    {
      id: 'eco-4',
      title: 'Refining',
      description: 'Turn ore into something useful.',
      dialogueId: 'eco-refine-intro',
      requiresAction: 'navigate-crafting',
      actionPrompt: 'Go to the Crafting menu'
    },
    {
      id: 'eco-5',
      title: 'The Smelter',
      description: 'Craft an Iron Ingot.',
      dialogueId: 'eco-craft-ingot',
      requiresAction: 'craft-iron-ingot',
      actionPrompt: 'Craft 1 Iron Ingot'
    }
  ],
};

export const PROGRESSION_SYSTEM: TutorialSection = {
  id: 'progression_system',
  name: 'Becoming a Legend',
  description: 'Train your skills and prepare for the long haul.',
  icon: '📈',
  estimatedMinutes: 5,
  type: 'core',
  steps: [
    {
      id: 'prog-1',
      title: 'Skill Matters',
      description: 'Why you survived today.',
      dialogueId: 'prog-intro',
      target: '[data-tutorial-target="skills-link"]'
    },
    {
      id: 'prog-2',
      title: 'Choose Your Path',
      description: 'Select a skill to train.',
      dialogueId: 'prog-select',
      requiresAction: 'navigate-skills',
      actionPrompt: 'Open Skills Menu'
    },
    {
      id: 'prog-3',
      title: 'Start Training',
      description: 'Queue a skill for offline progression.',
      dialogueId: 'prog-train',
      requiresAction: 'start-training',
      actionPrompt: 'Start training any skill'
    },
    {
      id: 'prog-4',
      title: 'Farewell',
      description: 'Hawk leaves you to your destiny.',
      dialogueId: 'prog-farewell',
      position: 'center'
    }
  ],
};

// Map faction to their specific intro section
export const FACTION_INTROS: Record<string, TutorialSection> = {
  'SETTLER_ALLIANCE': INTRO_SETTLER,
  'NAHI_COALITION': INTRO_NAHI,
  'FRONTERA': INTRO_FRONTERA,
};

// The shared path everyone takes after intro
export const SHARED_CORE_PATH = [
  COMBAT_BASICS,
  DESTINY_DECK_QUIZ,
  ECONOMY_BASICS,
  PROGRESSION_SYSTEM
];
