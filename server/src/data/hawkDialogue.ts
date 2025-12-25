/**
 * Hawk Dialogue System
 *
 * Complete dialogue content for Hawk's mentorship during tutorial (L1-10)
 * Organized by phase with contextual dialogue triggers
 */

import { HawkExpression, HawkMood } from '../models/HawkCompanion.model';
import { TutorialPhase } from '../models/TutorialProgress.model';

/**
 * Dialogue trigger types
 */
export enum DialogueTrigger {
  // Tutorial phase transitions
  PHASE_START = 'phase_start',
  PHASE_COMPLETE = 'phase_complete',
  STEP_COMPLETE = 'step_complete',

  // Contextual triggers
  FIRST_TIME = 'first_time',
  STRUGGLING = 'struggling',
  SUCCESS = 'success',
  IDLE = 'idle',
  RETURNING = 'returning',

  // Game state triggers
  LOW_ENERGY = 'low_energy',
  LOW_HEALTH = 'low_health',
  LEVEL_UP = 'level_up',
  COMBAT_LOSS = 'combat_loss',
  COMBAT_WIN = 'combat_win',
  FIRST_SKILL = 'first_skill',
  FIRST_CONTRACT = 'first_contract',

  // Special triggers
  EASTER_EGG = 'easter_egg',
  FAREWELL = 'farewell',
}

/**
 * Dialogue entry structure
 */
export interface HawkDialogueEntry {
  text: string;
  expression: HawkExpression;
  voiceHint?: string;
  duration?: number;  // Display duration in ms (default 5000)
  actionPrompt?: string;  // Optional action text to display
}

/**
 * Step dialogue structure
 */
export interface StepDialogue {
  text: string;
  expression: HawkExpression;
  actionRequired?: string;  // Action ID required to proceed
  highlight?: string;       // CSS selector to highlight
}

/**
 * Phase dialogue structure
 */
export interface PhaseDialogue {
  intro: HawkDialogueEntry;
  steps: StepDialogue[];
  complete: HawkDialogueEntry;
  // Additional contextual dialogue
  contextual?: Record<string, HawkDialogueEntry>;
}

/**
 * Main dialogue content organized by phase
 */
export const HAWK_DIALOGUE: Record<TutorialPhase, PhaseDialogue | null> = {
  // ========================================
  // Phase 0: AWAKENING
  // ========================================
  [TutorialPhase.AWAKENING]: {
    intro: {
      text: "Easy there, friend. You took a nasty spill off that stagecoach. Name's Hawk. Been watching the frontier for longer than I care to remember. Let's get you on your feet.",
      expression: HawkExpression.CONCERNED,
      duration: 7000
    },
    steps: [
      {
        text: "First things first - can you stand? Good. The desert's no place to lie around.",
        expression: HawkExpression.TEACHING,
        actionRequired: 'tutorial-stand'
      },
      {
        text: "See that canteen? Grab it. Staying hydrated out here isn't optional.",
        expression: HawkExpression.TEACHING,
        actionRequired: 'tutorial-canteen',
        highlight: '[data-tutorial="canteen"]'
      },
      {
        text: "Now, let's check your gear. The bandits took most of it, but you've still got the basics.",
        expression: HawkExpression.THINKING,
        actionRequired: 'check-inventory'
      },
      {
        text: "Not bad. You've got grit - I can see it. Most folks would've given up by now.",
        expression: HawkExpression.PLEASED,
        actionRequired: 'tutorial-acknowledge'
      },
      {
        text: "There's a settlement nearby - Dusthaven. Rough place, but it's a start. Follow me.",
        expression: HawkExpression.NEUTRAL,
        actionRequired: 'navigate-to-dusthaven'
      }
    ],
    complete: {
      text: "You're tougher than you look. Dusthaven's just ahead. Time you learned to handle yourself in a fight.",
      expression: HawkExpression.PLEASED,
      duration: 6000
    },
    contextual: {
      idle: {
        text: "Don't just stand there. The desert waits for no one.",
        expression: HawkExpression.WARNING
      },
      first_move: {
        text: "That's it. One foot in front of the other.",
        expression: HawkExpression.PLEASED
      }
    }
  },

  // ========================================
  // Phase 1: FIRST COMBAT
  // ========================================
  [TutorialPhase.FIRST_COMBAT]: {
    intro: {
      text: "See those cards in your pocket? Out here, we settle disputes with the Destiny Deck. It's not just cards - it's life and death.",
      expression: HawkExpression.TEACHING,
      duration: 7000
    },
    steps: [
      {
        text: "The Destiny Deck ain't like those fancy games back East. Each card carries weight - red hits harder, black builds defense.",
        expression: HawkExpression.TEACHING,
        actionRequired: 'view-deck-tutorial'
      },
      {
        text: "Hearts and diamonds pack punch. Clubs and spades protect you. Pairs and sets? That's where real power lies.",
        expression: HawkExpression.TEACHING,
        actionRequired: 'tutorial-acknowledge'
      },
      {
        text: "Coyote ahead. Perfect practice. Don't worry, I'll make sure you don't die... probably.",
        expression: HawkExpression.AMUSED,
        actionRequired: 'initiate-combat-coyote'
      },
      {
        text: "Draw your hand. Look at what you've got before you decide what to play.",
        expression: HawkExpression.COMBAT_READY,
        actionRequired: 'draw-destiny-deck'
      },
      {
        text: "Good. Now think - attack with red, defend with black. Sometimes the best offense is knowing when to hold back.",
        expression: HawkExpression.THINKING,
        actionRequired: 'play-card'
      },
      {
        text: "Watch the enemy's pattern. Every creature has tells. Learn them, live longer.",
        expression: HawkExpression.WARNING,
        actionRequired: 'observe-enemy'
      },
      {
        text: "Finish it! Don't let wounded prey suffer - or escape to bite you later.",
        expression: HawkExpression.COMBAT_READY,
        actionRequired: 'win-combat'
      },
      {
        text: "Check the carcass. Even a mangy coyote might carry something useful.",
        expression: HawkExpression.TEACHING,
        actionRequired: 'loot-enemy'
      }
    ],
    complete: {
      text: "Ha! Not bad for a greenhorn. You've got the instincts. Let's sharpen them.",
      expression: HawkExpression.PROUD,
      duration: 6000
    },
    contextual: {
      combat_loss: {
        text: "Don't fret. Every gunslinger gets knocked down. The trick is getting back up smarter.",
        expression: HawkExpression.CONCERNED
      },
      combat_win: {
        text: "Clean kill. You're learning.",
        expression: HawkExpression.PLEASED
      },
      low_health: {
        text: "You're bleeding bad. Use those bandages before you pass out.",
        expression: HawkExpression.WARNING
      }
    }
  },

  // ========================================
  // Phase 2: SURVIVAL
  // ========================================
  [TutorialPhase.SURVIVAL]: {
    intro: {
      text: "Fighting's one thing, but the desert'll kill you just as dead if you don't respect it. See that energy bar? That's your life force.",
      expression: HawkExpression.WARNING,
      duration: 7000
    },
    steps: [
      {
        text: "Everything you do takes energy. Walk too far, fight too long, and you'll collapse in the dust.",
        expression: HawkExpression.TEACHING,
        actionRequired: 'view-energy-bar'
      },
      {
        text: "Watch how it drains when you work. Smart folks pace themselves.",
        expression: HawkExpression.TEACHING,
        actionRequired: 'perform-action'
      },
      {
        text: "When you're low, you've got options. Rest at the saloon, eat something, or wait it out.",
        expression: HawkExpression.THINKING,
        actionRequired: 'tutorial-acknowledge'
      },
      {
        text: "Beds cost money, but they're worth it. A good night's rest is worth more than gold out here.",
        expression: HawkExpression.TEACHING,
        actionRequired: 'visit-saloon'
      },
      {
        text: "Food restores some energy on the go. Coffee's good for a quick boost when you can't rest.",
        expression: HawkExpression.TEACHING,
        actionRequired: 'use-consumable'
      },
      {
        text: "Manage your energy like you manage your bullets - waste either, and you're dead.",
        expression: HawkExpression.WARNING,
        actionRequired: 'restore-energy'
      }
    ],
    complete: {
      text: "Good. You understand the basics of staying alive. Now let's make sure you can thrive.",
      expression: HawkExpression.PLEASED,
      duration: 6000
    },
    contextual: {
      low_energy: {
        text: "You're dragging. Rest at the saloon, eat something, or you'll collapse before any bandit gets the chance.",
        expression: HawkExpression.CONCERNED
      },
      energy_restored: {
        text: "Better. Keep that energy up and you'll live longer.",
        expression: HawkExpression.PLEASED
      }
    }
  },

  // ========================================
  // Phase 3: SKILL TRAINING
  // ========================================
  [TutorialPhase.SKILL_TRAINING]: {
    intro: {
      text: "Raw talent only gets you so far. See that training dummy? Time to develop some real skills.",
      expression: HawkExpression.TEACHING,
      duration: 6000
    },
    steps: [
      {
        text: "The frontier rewards specialists. Pick a skill that fits how you want to survive.",
        expression: HawkExpression.TEACHING,
        actionRequired: 'open-skills'
      },
      {
        text: "Gunslinging makes you deadlier in combat. Mining earns honest coin. Each path has its own rewards.",
        expression: HawkExpression.THINKING,
        actionRequired: 'browse-skills'
      },
      {
        text: "Training takes time. Queue up what you want to learn and let it simmer.",
        expression: HawkExpression.TEACHING,
        actionRequired: 'queue-skill'
      },
      {
        text: "While skills train in the background, you're free to do other work. Multi-tasking keeps you alive.",
        expression: HawkExpression.PLEASED,
        actionRequired: 'start-training'
      },
      {
        text: "Each skill level makes you better at specific things. Higher skills unlock new opportunities.",
        expression: HawkExpression.TEACHING,
        actionRequired: 'view-skill-benefits'
      },
      {
        text: "Don't spread yourself too thin starting out. Master one thing before moving to the next.",
        expression: HawkExpression.WARNING,
        actionRequired: 'tutorial-acknowledge'
      },
      {
        text: "Check back when training completes. Your new abilities will be waiting.",
        expression: HawkExpression.PLEASED,
        actionRequired: 'acknowledge-training'
      }
    ],
    complete: {
      text: "You're developing nicely. Time to put those skills to use. Folks around here always need help.",
      expression: HawkExpression.PLEASED,
      duration: 6000
    },
    contextual: {
      first_skill: {
        text: "Feel that? Your muscles remembering what to do. Skills make the difference between survivor and legend.",
        expression: HawkExpression.PLEASED
      },
      skill_up: {
        text: "Now you're getting it. Keep at it - mastery takes time, but you've got what it takes.",
        expression: HawkExpression.PROUD
      }
    }
  },

  // ========================================
  // Phase 4: CONTRACTS
  // ========================================
  [TutorialPhase.CONTRACTS]: {
    intro: {
      text: "Want to make a name for yourself? The contract board's your ticket. Daily jobs, decent pay, and reputation.",
      expression: HawkExpression.TEACHING,
      duration: 6000
    },
    steps: [
      {
        text: "Every settlement has a contract board. Jobs range from delivery runs to hunting bounties.",
        expression: HawkExpression.TEACHING,
        actionRequired: 'open-contracts'
      },
      {
        text: "Read the requirements carefully. Some jobs need specific skills or equipment.",
        expression: HawkExpression.THINKING,
        actionRequired: 'browse-contracts'
      },
      {
        text: "Pick something within your abilities. No shame in starting small.",
        expression: HawkExpression.TEACHING,
        actionRequired: 'accept-contract'
      },
      {
        text: "Now complete what you promised. A frontier man's word is his bond.",
        expression: HawkExpression.WARNING,
        actionRequired: 'complete-contract'
      },
      {
        text: "Daily contracts refresh each day. Keep checking for new opportunities.",
        expression: HawkExpression.TEACHING,
        actionRequired: 'tutorial-acknowledge'
      },
      {
        text: "Build a reputation for reliability and better contracts will come your way.",
        expression: HawkExpression.PLEASED,
        actionRequired: 'collect-reward'
      }
    ],
    complete: {
      text: "See? That's how it works out here. Hard work, honest pay. Well... mostly honest.",
      expression: HawkExpression.AMUSED,
      duration: 6000
    },
    contextual: {
      first_contract: {
        text: "Good choice. Complete it well and word spreads. Do enough contracts, and doors start opening.",
        expression: HawkExpression.PLEASED
      },
      contract_failed: {
        text: "Don't take on more than you can handle. A failed contract hurts your name.",
        expression: HawkExpression.CONCERNED
      }
    }
  },

  // ========================================
  // Phase 5: SOCIAL
  // ========================================
  [TutorialPhase.SOCIAL]: {
    intro: {
      text: "Lone wolves don't last long out here. Time you learned who's who and what's what in these parts.",
      expression: HawkExpression.THINKING,
      duration: 6000
    },
    steps: [
      {
        text: "Every person you meet has their own story, their own angle. Pay attention to what they say.",
        expression: HawkExpression.TEACHING,
        actionRequired: 'talk-to-npc'
      },
      {
        text: "Some folks give information. Others give jobs. A few might try to kill you. Learn to tell the difference.",
        expression: HawkExpression.WARNING,
        actionRequired: 'interact-npc'
      },
      {
        text: "Your reputation follows you everywhere. Help folks, they remember. Cross them, they remember that too.",
        expression: HawkExpression.TEACHING,
        actionRequired: 'view-reputation'
      },
      {
        text: "Build trust slowly. The frontier doesn't forgive loose lips or broken promises.",
        expression: HawkExpression.THINKING,
        actionRequired: 'tutorial-acknowledge'
      },
      {
        text: "Good standing with the right people opens doors. Bad standing closes them - sometimes permanently.",
        expression: HawkExpression.WARNING,
        actionRequired: 'improve-reputation'
      }
    ],
    complete: {
      text: "You're learning to read people. Good. Now, there's something bigger you need to understand - the factions.",
      expression: HawkExpression.THINKING,
      duration: 6000
    },
    contextual: {
      npc_friendly: {
        text: "Made a friend? Good. Keep them close. True friends are rare out here.",
        expression: HawkExpression.PLEASED
      },
      reputation_gained: {
        text: "Word's spreading about you. Keep it positive if you want to stay welcome.",
        expression: HawkExpression.PLEASED
      }
    }
  },

  // ========================================
  // Phase 6: FACTION INTRO
  // ========================================
  [TutorialPhase.FACTION_INTRO]: {
    intro: {
      text: "Three powers control this territory. The Law tries to bring order. The Outlaws resist it. And the Natives... they were here first.",
      expression: HawkExpression.TEACHING,
      duration: 7000
    },
    steps: [
      {
        text: "The Settler Alliance backs the law. Marshal Drake and his deputies keep the peace... their way.",
        expression: HawkExpression.NEUTRAL,
        actionRequired: 'learn-settler-alliance'
      },
      {
        text: "Work with the law, they protect you. Cross them, and there's nowhere to hide.",
        expression: HawkExpression.WARNING,
        actionRequired: 'tutorial-acknowledge'
      },
      {
        text: "The Frontera - outlaws and free spirits. They answer to no one. Freedom, they call it. Chaos, others say.",
        expression: HawkExpression.THINKING,
        actionRequired: 'learn-frontera'
      },
      {
        text: "Join the outlaws and the law hunts you. But the rewards can be... substantial.",
        expression: HawkExpression.AMUSED,
        actionRequired: 'tutorial-acknowledge'
      },
      {
        text: "The Nahi Coalition - native peoples fighting to preserve what's theirs. Can't say I blame them.",
        expression: HawkExpression.THINKING,
        actionRequired: 'learn-nahi-coalition'
      },
      {
        text: "They have knowledge of this land no settler possesses. Earn their trust, and they share it.",
        expression: HawkExpression.TEACHING,
        actionRequired: 'tutorial-acknowledge'
      },
      {
        text: "Me? I stay neutral. Got my reasons. But you'll have to choose your own path eventually.",
        expression: HawkExpression.THINKING,
        actionRequired: 'view-faction-standings'
      },
      {
        text: "Choose carefully. Faction friends come with faction enemies.",
        expression: HawkExpression.WARNING,
        actionRequired: 'tutorial-acknowledge'
      }
    ],
    complete: {
      text: "You know the players now. How you deal with them is your business. Just remember - every choice has consequences.",
      expression: HawkExpression.WARNING,
      duration: 6000
    },
    contextual: {
      faction_rep_gained: {
        text: "You're picking a side. That's your choice to make, but know what it costs.",
        expression: HawkExpression.THINKING
      },
      faction_rep_lost: {
        text: "Burned a bridge there. Some can be rebuilt. Others... not so much.",
        expression: HawkExpression.CONCERNED
      }
    }
  },

  // ========================================
  // Phase 7: GANG BASICS
  // ========================================
  [TutorialPhase.GANG_BASICS]: {
    intro: {
      text: "Strength in numbers, they say. Gangs are the real power out here. Territory, protection, opportunity.",
      expression: HawkExpression.TEACHING,
      duration: 6000
    },
    steps: [
      {
        text: "Gangs control territory. That territory means bonuses - better income, safer travel, exclusive resources.",
        expression: HawkExpression.TEACHING,
        actionRequired: 'view-territories'
      },
      {
        text: "Join one, start one, or stay solo - all valid choices. But gang members get advantages loners don't.",
        expression: HawkExpression.THINKING,
        actionRequired: 'view-gangs'
      },
      {
        text: "Gang wars happen. Territory changes hands. The strong grow stronger, the weak get absorbed.",
        expression: HawkExpression.WARNING,
        actionRequired: 'learn-gang-wars'
      },
      {
        text: "Leaders set the direction. Members contribute to the cause. Everyone shares in the rewards.",
        expression: HawkExpression.TEACHING,
        actionRequired: 'tutorial-acknowledge'
      },
      {
        text: "A good gang watches your back. A bad one drags you down. Choose your company wisely.",
        expression: HawkExpression.THINKING,
        actionRequired: 'browse-gang-options'
      },
      {
        text: "You can go solo - many do. But don't be surprised when gangs make life difficult for independents.",
        expression: HawkExpression.WARNING,
        actionRequired: 'tutorial-acknowledge'
      },
      {
        text: "Whether you join or stay free, understand how the power structures work. That knowledge keeps you alive.",
        expression: HawkExpression.TEACHING,
        actionRequired: 'complete-gang-tutorial'
      }
    ],
    complete: {
      text: "You know enough now to make your own choices about gangs. Just remember - loyalty goes both ways.",
      expression: HawkExpression.WARNING,
      duration: 6000
    },
    contextual: {
      joined_gang: {
        text: "Found yourself a crew. Treat them right and they'll do the same for you.",
        expression: HawkExpression.PLEASED
      },
      stayed_solo: {
        text: "Going it alone? Respect. Just know when to pick your battles.",
        expression: HawkExpression.NEUTRAL
      }
    }
  },

  // ========================================
  // Phase 8: GRADUATION
  // ========================================
  [TutorialPhase.GRADUATION]: {
    intro: {
      text: "Well now... look at you. Not the same lost soul I found by that overturned stagecoach.",
      expression: HawkExpression.PROUD,
      duration: 6000
    },
    steps: [
      {
        text: "You've learned to fight, survive, work, and navigate the politics of the frontier. That's more than most manage.",
        expression: HawkExpression.THINKING,
        actionRequired: 'tutorial-acknowledge'
      },
      {
        text: "The world gets harder from here. Tougher enemies, higher stakes, bigger rewards for those brave enough to claim them.",
        expression: HawkExpression.WARNING,
        actionRequired: 'tutorial-acknowledge'
      },
      {
        text: "I've seen something in you from the start. Something that says survivor. Something that says... legend, maybe.",
        expression: HawkExpression.PLEASED,
        actionRequired: 'tutorial-acknowledge'
      },
      {
        text: "This is where I leave you, friend. Got other lost souls to find. But I'll be watching. Make me proud out there.",
        expression: HawkExpression.FAREWELL,
        actionRequired: 'accept-farewell'
      }
    ],
    complete: {
      text: "Go on now. The frontier's waiting. And remember - you've always got a friend in old Hawk.",
      expression: HawkExpression.FAREWELL,
      duration: 8000
    },
    contextual: {
      final_gift: {
        text: "Here. Take this feather. It's brought me luck for decades. Maybe it'll do the same for you.",
        expression: HawkExpression.PLEASED
      }
    }
  },

  // Terminal states have no dialogue
  [TutorialPhase.NOT_STARTED]: null,
  [TutorialPhase.COMPLETED]: null,
  [TutorialPhase.SKIPPED]: null
};

/**
 * Contextual tips shown based on game state
 */
export const CONTEXTUAL_TIPS: Record<string, HawkDialogueEntry> = {
  energy_low: {
    text: "Your energy's dropping. Find a bed or grab some food before you collapse.",
    expression: HawkExpression.CONCERNED,
    duration: 4000
  },
  energy_critical: {
    text: "You're running on fumes. Stop what you're doing and rest, now.",
    expression: HawkExpression.WARNING,
    duration: 4000
  },
  health_low: {
    text: "Those wounds need tending. Use some bandages before your next fight.",
    expression: HawkExpression.CONCERNED,
    duration: 4000
  },
  combat_struggling: {
    text: "Tough fight? Try building pairs before going for damage. Defense buys time.",
    expression: HawkExpression.TEACHING,
    duration: 5000
  },
  combat_streak_loss: {
    text: "Three losses in a row. Maybe find easier prey while you build up strength.",
    expression: HawkExpression.CONCERNED,
    duration: 5000
  },
  idle_reminder: {
    text: "Taking a break? Smart. The desert'll be here when you're ready.",
    expression: HawkExpression.AMUSED,
    duration: 4000
  },
  locked_feature: {
    text: "That's locked for now. Keep leveling and it'll open up.",
    expression: HawkExpression.TEACHING,
    duration: 4000
  },
  first_death: {
    text: "Jail time. Happens to everyone. Use it to plan your next move.",
    expression: HawkExpression.CONCERNED,
    duration: 5000
  },
  level_up: {
    text: "Nice work! Each level opens new doors. Check what's available now.",
    expression: HawkExpression.PLEASED,
    duration: 4000
  },
  inventory_full: {
    text: "Pack's full. Sell something or leave it behind. Space is precious.",
    expression: HawkExpression.TEACHING,
    duration: 4000
  },
  night_warning: {
    text: "Sun's going down. Night brings different dangers. Stay alert.",
    expression: HawkExpression.WARNING,
    duration: 4000
  },
  wanted_level_high: {
    text: "You're getting too hot. Lay low or the law will come calling.",
    expression: HawkExpression.WARNING,
    duration: 4000
  },
  first_bounty: {
    text: "Got a price on your head now. Exciting, ain't it? Just don't get caught.",
    expression: HawkExpression.AMUSED,
    duration: 5000
  },
  gold_earned: {
    text: "Money in your pocket. Don't spend it all in one place... unless that place sells bullets.",
    expression: HawkExpression.PLEASED,
    duration: 4000
  },
  returning_player: {
    text: "Back for more? Good. Where were we... ah yes, let me remind you.",
    expression: HawkExpression.PLEASED,
    duration: 4000
  }
};

/**
 * Get dialogue for a specific phase and step
 */
export function getPhaseDialogue(phase: TutorialPhase): PhaseDialogue | null {
  return HAWK_DIALOGUE[phase];
}

/**
 * Get step dialogue for a specific step in a phase
 */
export function getStepDialogue(phase: TutorialPhase, stepIndex: number): StepDialogue | null {
  const phaseDialogue = HAWK_DIALOGUE[phase];
  if (!phaseDialogue || stepIndex < 0 || stepIndex >= phaseDialogue.steps.length) {
    return null;
  }
  return phaseDialogue.steps[stepIndex];
}

/**
 * Get contextual tip by ID
 */
export function getContextualTip(tipId: string): HawkDialogueEntry | null {
  return CONTEXTUAL_TIPS[tipId] || null;
}

/**
 * Get all tip IDs
 */
export function getAllTipIds(): string[] {
  return Object.keys(CONTEXTUAL_TIPS);
}

/**
 * Generate a returning player dialogue based on where they left off
 */
export function getReturningDialogue(phase: TutorialPhase, stepIndex: number): HawkDialogueEntry {
  const phaseNames: Record<TutorialPhase, string> = {
    [TutorialPhase.NOT_STARTED]: 'the beginning',
    [TutorialPhase.AWAKENING]: 'waking up in the desert',
    [TutorialPhase.FIRST_COMBAT]: 'learning to fight',
    [TutorialPhase.SURVIVAL]: 'survival basics',
    [TutorialPhase.SKILL_TRAINING]: 'training skills',
    [TutorialPhase.CONTRACTS]: 'taking contracts',
    [TutorialPhase.SOCIAL]: 'making friends',
    [TutorialPhase.FACTION_INTRO]: 'the factions',
    [TutorialPhase.GANG_BASICS]: 'gang territory',
    [TutorialPhase.GRADUATION]: 'graduation',
    [TutorialPhase.COMPLETED]: 'the end',
    [TutorialPhase.SKIPPED]: 'nowhere'
  };

  return {
    text: `Back again? Good. We were in the middle of ${phaseNames[phase]}. Let's pick up where we left off.`,
    expression: HawkExpression.PLEASED,
    duration: 5000
  };
}
