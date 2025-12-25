/**
 * Crime Variety System - Sprint 6
 *
 * Adds depth to the crime system with:
 * 1. Chain Crimes (multi-step heists)
 * 2. Random Events during crimes
 *
 * These systems create more engaging criminal gameplay beyond single actions.
 */

import { SecureRNG } from '../services/base/SecureRNG';

// ============================================================================
// TYPES
// ============================================================================

export type ChainCrimeStatus = 'available' | 'in_progress' | 'completed' | 'failed' | 'abandoned';

export interface ChainCrimeStep {
  stepId: string;
  name: string;
  description: string;
  type: 'skill_check' | 'crime' | 'combat' | 'social' | 'timed' | 'choice';
  skillRequired?: string;
  skillLevel?: number;
  energyCost: number;
  timeLimit?: number; // Minutes, if timed
  successChance?: number; // Base success chance
  failureConsequence?: 'abort' | 'penalty' | 'continue'; // What happens on failure
  rewards?: {
    gold?: number;
    xp?: number;
    item?: string;
  };
}

export interface ChainCrime {
  chainId: string;
  name: string;
  description: string;
  briefing: string;
  levelRequired: number;
  skillRequired?: string;
  skillLevelRequired?: number;
  steps: ChainCrimeStep[];
  totalRewards: {
    gold: { min: number; max: number };
    xp: number;
    items?: string[];
    reputation?: { faction: string; amount: number }[];
  };
  timeLimit?: number; // Hours to complete entire chain
  cooldown: number; // Hours before can attempt again
  difficultyTier: 'easy' | 'medium' | 'hard' | 'legendary';
  flavorTags: string[];
}

export interface CrimeRandomEvent {
  eventId: string;
  name: string;
  description: string;
  triggerChance: number; // 0-100 percentage
  crimeTypes: string[]; // Which crime types can trigger this
  outcomes: CrimeRandomEventOutcome[];
  skillCheck?: {
    skill: string;
    difficulty: number;
    successOutcome: string;
    failureOutcome: string;
  };
}

export interface CrimeRandomEventOutcome {
  outcomeId: string;
  description: string;
  effect: 'bonus' | 'penalty' | 'complication' | 'choice' | 'escape';
  goldModifier?: number; // Multiplier (1.5 = +50%)
  xpModifier?: number;
  wantedIncrease?: number;
  freeItem?: string;
  requiresChoice?: {
    options: { label: string; effect: string; consequence: string }[];
  };
}

// ============================================================================
// CHAIN CRIMES - MULTI-STEP HEISTS
// ============================================================================

export const CHAIN_CRIMES: ChainCrime[] = [
  // ========== EASY TIER (L5+) ==========
  {
    chainId: 'chain-saloon-heist',
    name: 'The Saloon Score',
    description: 'A simple three-step job: case the saloon, acquire the keys, and clean out the back room safe.',
    briefing: `"Listen, partner. The Golden Spur Saloon keeps a week's worth of poker winnings in their back room safe. Nobody guards it during the day shift - just need the right keys. I've got a plan, but I need someone with quick hands. You in?"`,
    levelRequired: 5,
    skillRequired: 'LOCKPICKING',
    skillLevelRequired: 3,
    steps: [
      {
        stepId: 'saloon-case',
        name: 'Case the Joint',
        description: 'Spend an evening at the saloon observing patterns, guard rotations, and safe location.',
        type: 'skill_check',
        skillRequired: 'CUNNING',
        skillLevel: 3,
        energyCost: 15,
        successChance: 85,
        failureConsequence: 'continue',
        rewards: { xp: 25 }
      },
      {
        stepId: 'saloon-keys',
        name: 'Acquire the Keys',
        description: 'Pickpocket or bribe the bartender to get the back room keys.',
        type: 'choice',
        energyCost: 20,
        successChance: 75,
        failureConsequence: 'penalty',
        rewards: { xp: 30 }
      },
      {
        stepId: 'saloon-heist',
        name: 'Clean Out the Safe',
        description: 'Break into the back room and crack the safe before anyone notices.',
        type: 'crime',
        skillRequired: 'LOCKPICKING',
        skillLevel: 5,
        energyCost: 30,
        timeLimit: 5,
        successChance: 70,
        failureConsequence: 'abort',
        rewards: { gold: 500, xp: 50 }
      }
    ],
    totalRewards: {
      gold: { min: 400, max: 800 },
      xp: 150,
      items: ['saloon-key-copy']
    },
    timeLimit: 24,
    cooldown: 72,
    difficultyTier: 'easy',
    flavorTags: ['saloon', 'safe', 'stealth']
  },

  {
    chainId: 'chain-stagecoach-ambush',
    name: 'Stagecoach Ambush',
    description: 'Set up an ambush on the road, stop the stagecoach, and relieve the passengers of their valuables.',
    briefing: `"The noon stage from Silver City always carries payroll for the mine workers. Problem is, they've got a shotgun guard now. We need to be smart about this - block the road, deal with the guard, grab the strongbox. Fast and clean."`,
    levelRequired: 8,
    steps: [
      {
        stepId: 'stage-scout',
        name: 'Scout the Route',
        description: 'Find the perfect spot for an ambush along the stagecoach route.',
        type: 'skill_check',
        skillRequired: 'HUNTING',
        skillLevel: 5,
        energyCost: 20,
        successChance: 80,
        failureConsequence: 'continue',
        rewards: { xp: 35 }
      },
      {
        stepId: 'stage-block',
        name: 'Block the Road',
        description: 'Set up a roadblock using fallen trees or debris.',
        type: 'timed',
        energyCost: 25,
        timeLimit: 3,
        successChance: 90,
        failureConsequence: 'penalty',
        rewards: { xp: 25 }
      },
      {
        stepId: 'stage-guard',
        name: 'Neutralize the Guard',
        description: 'Deal with the shotgun guard - talk, intimidate, or fight.',
        type: 'combat',
        skillRequired: 'GUN_FIGHTING',
        skillLevel: 8,
        energyCost: 25,
        successChance: 65,
        failureConsequence: 'abort',
        rewards: { xp: 50, item: 'shotgun-shells' }
      },
      {
        stepId: 'stage-rob',
        name: 'Rob the Passengers',
        description: 'Relieve the passengers of their valuables and grab the strongbox.',
        type: 'crime',
        energyCost: 20,
        successChance: 85,
        failureConsequence: 'continue',
        rewards: { gold: 800, xp: 75 }
      }
    ],
    totalRewards: {
      gold: { min: 600, max: 1200 },
      xp: 250,
      items: ['stagecoach-schedule'],
      reputation: [{ faction: 'frontera', amount: 15 }]
    },
    timeLimit: 48,
    cooldown: 96,
    difficultyTier: 'medium',
    flavorTags: ['stagecoach', 'ambush', 'robbery']
  },

  // ========== MEDIUM TIER (L15+) ==========
  {
    chainId: 'chain-bank-heist',
    name: 'The Big Score',
    description: 'A sophisticated bank heist requiring inside information, careful planning, and flawless execution.',
    briefing: `"Red Gulch First National. They just took delivery of a shipment of gold bars - railroad payroll. Security is tight, but I've got a man on the inside. This is the kind of job that makes legends... or corpses. You got the nerve?"`,
    levelRequired: 15,
    skillRequired: 'LOCKPICKING',
    skillLevelRequired: 15,
    steps: [
      {
        stepId: 'bank-intel',
        name: 'Gather Intelligence',
        description: 'Meet with your inside contact and learn the vault schedule.',
        type: 'social',
        skillRequired: 'CUNNING',
        skillLevel: 10,
        energyCost: 25,
        successChance: 90,
        failureConsequence: 'continue',
        rewards: { xp: 50 }
      },
      {
        stepId: 'bank-blueprint',
        name: 'Acquire Blueprints',
        description: 'Steal or bribe your way to the bank building blueprints.',
        type: 'crime',
        skillRequired: 'LOCKPICKING',
        skillLevel: 12,
        energyCost: 30,
        successChance: 75,
        failureConsequence: 'penalty',
        rewards: { xp: 75, item: 'bank-blueprints' }
      },
      {
        stepId: 'bank-crew',
        name: 'Recruit a Crew',
        description: 'Find reliable partners for the job - a safecracker and a lookout.',
        type: 'social',
        skillRequired: 'CUNNING',
        skillLevel: 12,
        energyCost: 20,
        successChance: 80,
        failureConsequence: 'abort',
        rewards: { xp: 50 }
      },
      {
        stepId: 'bank-distraction',
        name: 'Create a Distraction',
        description: 'Stage a distraction to draw the sheriff and deputies away.',
        type: 'choice',
        energyCost: 35,
        successChance: 70,
        failureConsequence: 'penalty',
        rewards: { xp: 60 }
      },
      {
        stepId: 'bank-vault',
        name: 'Crack the Vault',
        description: 'Break into the bank and crack the vault before time runs out.',
        type: 'crime',
        skillRequired: 'LOCKPICKING',
        skillLevel: 20,
        energyCost: 40,
        timeLimit: 10,
        successChance: 55,
        failureConsequence: 'abort',
        rewards: { gold: 3000, xp: 150 }
      },
      {
        stepId: 'bank-escape',
        name: 'Clean Getaway',
        description: 'Escape town before the alarm is raised.',
        type: 'timed',
        energyCost: 25,
        timeLimit: 5,
        successChance: 75,
        failureConsequence: 'penalty',
        rewards: { xp: 100 }
      }
    ],
    totalRewards: {
      gold: { min: 2500, max: 5000 },
      xp: 600,
      items: ['legendary-lockpick', 'bank-heist-mask'],
      reputation: [
        { faction: 'frontera', amount: 50 },
        { faction: 'settler', amount: -30 }
      ]
    },
    timeLimit: 72,
    cooldown: 168, // 1 week
    difficultyTier: 'hard',
    flavorTags: ['bank', 'vault', 'crew', 'legendary']
  },

  // ========== HARD TIER (L25+) ==========
  {
    chainId: 'chain-train-heist',
    name: 'The Express Job',
    description: 'Rob the Pacific Express carrying a fortune in gold. Requires dynamite, timing, and nerves of steel.',
    briefing: `"The Pacific Express runs through Buzzard Canyon every Tuesday. Next week, it's carrying $50,000 in gold bars for the San Francisco mint. We stop the train, blow the express car, grab the gold. Easy said. Not easy done. You with me, partner?"`,
    levelRequired: 25,
    skillRequired: 'EXPLOSIVES',
    skillLevelRequired: 15,
    steps: [
      {
        stepId: 'train-schedule',
        name: 'Obtain Train Schedule',
        description: 'Bribe or steal the detailed train schedule from the railroad office.',
        type: 'crime',
        skillRequired: 'CUNNING',
        skillLevel: 15,
        energyCost: 30,
        successChance: 80,
        failureConsequence: 'continue',
        rewards: { xp: 75, item: 'train-schedule' }
      },
      {
        stepId: 'train-dynamite',
        name: 'Acquire Dynamite',
        description: 'Get enough dynamite to stop a train. The Chinese workers might help... for a price.',
        type: 'social',
        skillRequired: 'CUNNING',
        skillLevel: 12,
        energyCost: 25,
        successChance: 85,
        failureConsequence: 'penalty',
        rewards: { xp: 50, item: 'dynamite-bundle' }
      },
      {
        stepId: 'train-crew',
        name: 'Assemble Your Gang',
        description: 'You need at least 5 riders for a job this big. Recruit from the territory\'s best.',
        type: 'social',
        skillRequired: 'CUNNING',
        skillLevel: 18,
        energyCost: 35,
        successChance: 70,
        failureConsequence: 'abort',
        rewards: { xp: 100 }
      },
      {
        stepId: 'train-block',
        name: 'Set the Trap',
        description: 'Plant dynamite on the tracks and set up your ambush positions in the canyon.',
        type: 'timed',
        skillRequired: 'EXPLOSIVES',
        skillLevel: 20,
        energyCost: 40,
        timeLimit: 10,
        successChance: 65,
        failureConsequence: 'abort',
        rewards: { xp: 125 }
      },
      {
        stepId: 'train-stop',
        name: 'Stop the Train',
        description: 'Detonate the charges and bring the Pacific Express to a halt.',
        type: 'skill_check',
        skillRequired: 'EXPLOSIVES',
        skillLevel: 25,
        energyCost: 35,
        successChance: 60,
        failureConsequence: 'abort',
        rewards: { xp: 100 }
      },
      {
        stepId: 'train-guards',
        name: 'Overwhelm the Guards',
        description: 'The express car has Pinkerton guards. Your gang needs to neutralize them.',
        type: 'combat',
        skillRequired: 'GUN_FIGHTING',
        skillLevel: 20,
        energyCost: 45,
        successChance: 55,
        failureConsequence: 'penalty',
        rewards: { xp: 150, item: 'pinkerton-badge' }
      },
      {
        stepId: 'train-safe',
        name: 'Blow the Safe',
        description: 'Use the remaining dynamite to crack open the express safe.',
        type: 'skill_check',
        skillRequired: 'EXPLOSIVES',
        skillLevel: 22,
        energyCost: 30,
        timeLimit: 5,
        successChance: 70,
        failureConsequence: 'continue',
        rewards: { gold: 10000, xp: 200 }
      },
      {
        stepId: 'train-escape',
        name: 'Vanish into the Badlands',
        description: 'Escape before the cavalry arrives. Split up and rendezvous at the hideout.',
        type: 'timed',
        energyCost: 30,
        timeLimit: 15,
        successChance: 65,
        failureConsequence: 'penalty',
        rewards: { xp: 150 }
      }
    ],
    totalRewards: {
      gold: { min: 8000, max: 15000 },
      xp: 1200,
      items: ['legendary-bandana', 'gold-bar', 'train-robber-title'],
      reputation: [
        { faction: 'frontera', amount: 100 },
        { faction: 'settler', amount: -75 },
        { faction: 'nahi', amount: -25 }
      ]
    },
    timeLimit: 120, // 5 days
    cooldown: 336, // 2 weeks
    difficultyTier: 'legendary',
    flavorTags: ['train', 'dynamite', 'gang', 'legendary', 'pinkerton']
  }
];

// ============================================================================
// RANDOM EVENTS DURING CRIMES
// ============================================================================

export const CRIME_RANDOM_EVENTS: CrimeRandomEvent[] = [
  // ========== WITNESS EVENTS (15% chance) ==========
  {
    eventId: 'event-witness-appears',
    name: 'Unexpected Witness',
    description: 'Someone stumbles upon you mid-crime!',
    triggerChance: 15,
    crimeTypes: ['robbery', 'burglary', 'pickpocket', 'assault'],
    outcomes: [
      {
        outcomeId: 'witness-flee',
        description: 'The witness screams and runs for help.',
        effect: 'penalty',
        wantedIncrease: 1
      },
      {
        outcomeId: 'witness-bribe',
        description: 'You quickly offer a bribe and they take it.',
        effect: 'choice',
        goldModifier: 0.7, // Lose 30% of take to bribe
        requiresChoice: {
          options: [
            { label: 'Bribe them ($50)', effect: 'escape', consequence: '-50 gold but no witness' },
            { label: 'Silence them', effect: 'penalty', consequence: '+2 wanted but they stay quiet' },
            { label: 'Run for it', effect: 'escape', consequence: '+1 wanted but keep your gold' }
          ]
        }
      }
    ],
    skillCheck: {
      skill: 'CUNNING',
      difficulty: 12,
      successOutcome: 'You convince them they saw nothing.',
      failureOutcome: 'They\'re going straight to the sheriff.'
    }
  },

  // ========== RIVAL GANG EVENTS (10% chance) ==========
  {
    eventId: 'event-rival-gang',
    name: 'Rival Gang Claims the Target',
    description: 'Another gang had the same idea tonight!',
    triggerChance: 10,
    crimeTypes: ['robbery', 'burglary', 'smuggling', 'train_robbery', 'bank_robbery'],
    outcomes: [
      {
        outcomeId: 'rival-fight',
        description: 'It comes down to a shootout for the prize.',
        effect: 'complication',
        wantedIncrease: 2
      },
      {
        outcomeId: 'rival-negotiate',
        description: 'You negotiate a split of the take.',
        effect: 'choice',
        goldModifier: 0.5, // Split 50/50
        requiresChoice: {
          options: [
            { label: 'Accept the split', effect: 'escape', consequence: 'Half the gold, no fight' },
            { label: 'Fight for it all', effect: 'complication', consequence: 'Combat check, winner takes all' },
            { label: 'Both walk away', effect: 'escape', consequence: 'No gold, no enemies' }
          ]
        }
      }
    ],
    skillCheck: {
      skill: 'GUN_FIGHTING',
      difficulty: 15,
      successOutcome: 'You drive off the rival gang and keep everything.',
      failureOutcome: 'They get the drop on you. Time to negotiate.'
    }
  },

  // ========== SHERIFF PATROL EVENTS (5% chance) ==========
  {
    eventId: 'event-sheriff-patrol',
    name: 'Sheriff Patrol',
    description: 'A deputy is making rounds and headed your way!',
    triggerChance: 5,
    crimeTypes: ['robbery', 'burglary', 'pickpocket', 'smuggling'],
    outcomes: [
      {
        outcomeId: 'patrol-hide',
        description: 'You duck into the shadows and wait.',
        effect: 'escape'
      },
      {
        outcomeId: 'patrol-bluff',
        description: 'You try to act natural.',
        effect: 'choice',
        requiresChoice: {
          options: [
            { label: 'Hide and wait', effect: 'escape', consequence: 'Skill check: success = clean escape' },
            { label: 'Bluff past them', effect: 'escape', consequence: 'Cunning check: success = walk right by' },
            { label: 'Fight', effect: 'complication', consequence: 'Combat but +3 wanted' },
            { label: 'Surrender', effect: 'penalty', consequence: 'Arrested, but shorter sentence' }
          ]
        }
      }
    ],
    skillCheck: {
      skill: 'CUNNING',
      difficulty: 10,
      successOutcome: 'The deputy walks right past without noticing you.',
      failureOutcome: '"Hey! You there! What are you doing?"'
    }
  },

  // ========== TRAP EVENTS (3% chance) ==========
  {
    eventId: 'event-trap',
    name: 'It\'s a Trap!',
    description: 'The target was an undercover setup!',
    triggerChance: 3,
    crimeTypes: ['robbery', 'smuggling', 'counterfeiting'],
    outcomes: [
      {
        outcomeId: 'trap-sprung',
        description: 'Law enforcement surrounds you.',
        effect: 'complication',
        wantedIncrease: 3
      }
    ],
    skillCheck: {
      skill: 'CUNNING',
      difficulty: 20,
      successOutcome: 'Something feels wrong. You slip away before the trap closes.',
      failureOutcome: 'The trap springs. Federal marshals emerge from hiding.'
    }
  },

  // ========== BONUS EVENTS (5% chance) ==========
  {
    eventId: 'event-extra-loot',
    name: 'Hidden Cache',
    description: 'You find more than you expected!',
    triggerChance: 5,
    crimeTypes: ['robbery', 'burglary', 'smuggling', 'train_robbery', 'bank_robbery'],
    outcomes: [
      {
        outcomeId: 'cache-gold',
        description: 'A hidden stash of gold coins!',
        effect: 'bonus',
        goldModifier: 1.5 // +50% gold
      },
      {
        outcomeId: 'cache-item',
        description: 'A valuable item was hidden here!',
        effect: 'bonus',
        freeItem: 'random-valuable'
      }
    ]
  },

  // ========== COMPLICATION EVENTS (10% chance) ==========
  {
    eventId: 'event-dog-alert',
    name: 'Dog Alert',
    description: 'A dog starts barking, alerting the neighborhood!',
    triggerChance: 10,
    crimeTypes: ['burglary', 'robbery'],
    outcomes: [
      {
        outcomeId: 'dog-quiet',
        description: 'You manage to quiet the dog.',
        effect: 'escape'
      },
      {
        outcomeId: 'dog-alert-neighbors',
        description: 'The barking draws attention.',
        effect: 'penalty',
        wantedIncrease: 1
      }
    ],
    skillCheck: {
      skill: 'HUNTING',
      difficulty: 8,
      successOutcome: 'You calm the dog with some jerky from your pocket.',
      failureOutcome: 'The barking intensifies. Lights flicker on in nearby windows.'
    }
  },

  {
    eventId: 'event-target-armed',
    name: 'Armed Target',
    description: 'Your mark is packing heat!',
    triggerChance: 8,
    crimeTypes: ['robbery', 'pickpocket', 'assault'],
    outcomes: [
      {
        outcomeId: 'armed-draw',
        description: 'They draw on you!',
        effect: 'complication'
      }
    ],
    skillCheck: {
      skill: 'GUN_FIGHTING',
      difficulty: 12,
      successOutcome: 'You draw faster and they think better of it.',
      failureOutcome: 'You find yourself staring down a gun barrel.'
    }
  },

  {
    eventId: 'event-drunk-interferer',
    name: 'Drunk Interference',
    description: 'A drunk stumbles into the scene!',
    triggerChance: 7,
    crimeTypes: ['robbery', 'pickpocket', 'burglary', 'assault'],
    outcomes: [
      {
        outcomeId: 'drunk-distraction',
        description: 'The drunk provides an unintentional distraction.',
        effect: 'bonus',
        goldModifier: 1.2 // +20% gold from distraction
      },
      {
        outcomeId: 'drunk-loud',
        description: 'The drunk loudly announces your presence.',
        effect: 'penalty',
        wantedIncrease: 1
      }
    ]
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get chain crimes available for a character's level
 */
export function getAvailableChainCrimes(level: number): ChainCrime[] {
  return CHAIN_CRIMES.filter(chain => chain.levelRequired <= level);
}

/**
 * Get chain crime by ID
 */
export function getChainCrimeById(chainId: string): ChainCrime | undefined {
  return CHAIN_CRIMES.find(chain => chain.chainId === chainId);
}

/**
 * Roll for a random event during a crime
 */
export function rollCrimeRandomEvent(crimeType: string): CrimeRandomEvent | null {
  // Get events that can trigger for this crime type
  const eligibleEvents = CRIME_RANDOM_EVENTS.filter(
    event => event.crimeTypes.includes(crimeType) || event.crimeTypes.includes('*')
  );

  if (eligibleEvents.length === 0) return null;

  // Roll for each eligible event
  for (const event of eligibleEvents) {
    const roll = SecureRNG.d100();
    if (roll <= event.triggerChance) {
      return event;
    }
  }

  return null;
}

/**
 * Calculate total rewards for a chain crime based on success rate
 */
export function calculateChainCrimeRewards(
  chain: ChainCrime,
  stepsCompleted: number,
  totalSteps: number
): { gold: number; xp: number; items: string[] } {
  const successRate = stepsCompleted / totalSteps;
  const goldRange = chain.totalRewards.gold;
  const baseGold = goldRange.min + (goldRange.max - goldRange.min) * successRate;

  return {
    gold: Math.floor(baseGold),
    xp: Math.floor(chain.totalRewards.xp * successRate),
    items: successRate >= 0.8 ? (chain.totalRewards.items || []) : []
  };
}

/**
 * Get chain crimes by difficulty tier
 */
export function getChainCrimesByTier(tier: ChainCrime['difficultyTier']): ChainCrime[] {
  return CHAIN_CRIMES.filter(chain => chain.difficultyTier === tier);
}

/**
 * Check if a character can attempt a specific chain crime
 */
export function canAttemptChainCrime(
  chain: ChainCrime,
  characterLevel: number,
  characterSkills: Map<string, number>
): { canAttempt: boolean; reason?: string } {
  if (characterLevel < chain.levelRequired) {
    return { canAttempt: false, reason: `Requires level ${chain.levelRequired}` };
  }

  if (chain.skillRequired && chain.skillLevelRequired) {
    const skillLevel = characterSkills.get(chain.skillRequired) || 0;
    if (skillLevel < chain.skillLevelRequired) {
      return {
        canAttempt: false,
        reason: `Requires ${chain.skillRequired} level ${chain.skillLevelRequired}`
      };
    }
  }

  return { canAttempt: true };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const TOTAL_CHAIN_CRIMES = CHAIN_CRIMES.length;
export const TOTAL_RANDOM_EVENTS = CRIME_RANDOM_EVENTS.length;
