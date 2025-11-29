/**
 * GoalManager.ts
 *
 * Dynamic goal management system that generates, tracks, and completes goals,
 * creating emergent goal-oriented behavior that feels human and purposeful.
 *
 * Features:
 * - 14 distinct goal types covering all game activities
 * - Personality-driven goal generation
 * - Emergent goal chains (completing goals generates new ones)
 * - Dynamic priority adjustment based on deadlines and progress
 * - Goal dependencies and prerequisite chains
 * - Narrative arc creation through goal sequences
 */

import { PersonalityProfile, PersonalityTraits } from './PersonalitySystem.js';

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Goal represents a single objective with progress tracking
 */
export interface Goal {
  /** Unique identifier for this goal */
  id: string;

  /** Type of goal (determines progress calculation and follow-ups) */
  type: GoalType;

  /** Human-readable name */
  name: string;

  /** Description of what needs to be accomplished */
  description: string;

  /** Priority level (1-10, where 10 is highest) */
  priority: number;

  /** Goal-specific target (varies by goal type) */
  target: any;

  /** Current progress toward completion (0-1) */
  progress: number;

  /** Optional deadline for time-sensitive goals */
  deadline?: Date;

  /** Goals that should be added when this goal completes */
  followUpGoals?: Goal[];

  /** Goals that must be completed before this goal becomes active */
  prerequisites?: string[];

  /** When this goal was created */
  createdAt: Date;

  /** When this goal was completed (if completed) */
  completedAt?: Date;

  /** Metadata for goal-specific tracking */
  metadata?: Record<string, any>;
}

/**
 * All available goal types in the system
 */
export type GoalType =
  | 'level_up'           // Reach specific character level
  | 'earn_gold'          // Accumulate gold amount
  | 'join_gang'          // Join any gang or specific gang
  | 'max_skill'          // Max out a specific skill
  | 'complete_quest'     // Complete quest(s)
  | 'win_duels'          // Win X duels
  | 'unlock_location'    // Travel to/unlock location
  | 'craft_item'         // Craft specific item or quantity
  | 'make_friends'       // Add X friends
  | 'explore'            // Visit X locations
  | 'buy_property'       // Purchase property/item
  | 'achieve_rank'       // Reach specific rank/reputation
  | 'collect_items'      // Collect specific items
  | 'defeat_boss';       // Defeat specific boss/enemy

/**
 * GameContext provides current game state for goal evaluation
 */
export interface GameContext {
  character: {
    id: string;
    name: string;
    level: number;
    experience: number;
    gold: number;
    energy: {
      current: number;
      max: number;
    };
    skills: Record<string, number>;
    location: string;
    gang?: {
      id: string;
      name: string;
      rank: string;
    };
    friends: number;
    inventory: {
      items: any[];
      count: number;
    };
    achievements: string[];
    quests: {
      active: any[];
      completed: string[];
    };
    combat: {
      duelsWon: number;
      duelsLost: number;
      bossesDefeated: string[];
    };
    exploration: {
      locationsVisited: string[];
      locationsUnlocked: string[];
    };
    reputation: Record<string, number>;
  };
  worldState?: {
    availableLocations: string[];
    availableQuests: any[];
  };
}

/**
 * GoalTemplate defines how to generate and evaluate a specific goal type
 */
export interface GoalTemplate {
  /** Goal type this template handles */
  type: GoalType;

  /** Generate target value based on current context */
  generateTarget: (context: GameContext, personality: PersonalityProfile) => any;

  /** Calculate progress (0-1) for this goal */
  calculateProgress: (goal: Goal, context: GameContext) => number;

  /** Generate follow-up goals when this goal completes */
  getFollowUpGoals: (goal: Goal, context: GameContext, personality: PersonalityProfile) => Goal[];

  /** Get base priority for this goal type given personality */
  getBasePriority: (personality: PersonalityProfile) => number;
}

// ============================================================================
// GOAL TEMPLATES
// ============================================================================

/**
 * Template for level_up goals
 */
const LEVEL_UP_TEMPLATE: GoalTemplate = {
  type: 'level_up',

  generateTarget: (context: GameContext, personality: PersonalityProfile): number => {
    const currentLevel = context.character.level;

    // Grinders aim for higher level jumps
    if (personality.archetype === 'grinder') {
      return currentLevel + Math.floor(Math.random() * 3) + 3; // +3 to +5 levels
    }

    // Others aim for smaller increments
    return currentLevel + Math.floor(Math.random() * 2) + 1; // +1 to +2 levels
  },

  calculateProgress: (goal: Goal, context: GameContext): number => {
    return Math.min(1.0, context.character.level / goal.target);
  },

  getFollowUpGoals: (goal: Goal, context: GameContext, personality: PersonalityProfile): Goal[] => {
    const goals: Goal[] = [];

    // After leveling, want to improve character capabilities
    if (personality.traits.patience > 0.6) {
      // Patient players upgrade skills
      goals.push(createGoal('max_skill', {
        target: getRandomSkill(context),
        priority: 7,
      }, personality));
    }

    if (personality.traits.greed > 0.6) {
      // Greedy players earn gold for new gear
      goals.push(createGoal('earn_gold', {
        target: context.character.level * 100,
        priority: 6,
      }, personality));
    }

    return goals;
  },

  getBasePriority: (personality: PersonalityProfile): number => {
    if (personality.archetype === 'grinder') return 10;
    if (personality.archetype === 'combat') return 8;
    if (personality.archetype === 'economist') return 5;
    return 7;
  },
};

/**
 * Template for earn_gold goals
 */
const EARN_GOLD_TEMPLATE: GoalTemplate = {
  type: 'earn_gold',

  generateTarget: (context: GameContext, personality: PersonalityProfile): number => {
    const currentGold = context.character.gold;

    if (personality.archetype === 'economist') {
      // Economists aim for large sums
      return Math.max(currentGold * 2, 1000);
    }

    if (personality.archetype === 'grinder') {
      return Math.max(currentGold + 500, 500);
    }

    // Others aim for modest amounts
    return Math.max(currentGold + 200, 200);
  },

  calculateProgress: (goal: Goal, context: GameContext): number => {
    const startGold = goal.metadata?.startGold || 0;
    const targetGold = goal.target;
    const currentGold = context.character.gold;

    return Math.min(1.0, (currentGold - startGold) / (targetGold - startGold));
  },

  getFollowUpGoals: (goal: Goal, context: GameContext, personality: PersonalityProfile): Goal[] => {
    const goals: Goal[] = [];

    // After earning gold, spend it purposefully
    if (context.character.gold >= 500) {
      if (personality.archetype === 'combat') {
        // Combat bots buy gear
        goals.push(createGoal('buy_property', {
          target: 'weapon',
          priority: 8,
        }, personality));
      } else if (personality.archetype === 'economist') {
        // Economists invest in crafting
        goals.push(createGoal('craft_item', {
          target: { type: 'any', count: 5 },
          priority: 7,
        }, personality));
      } else if (personality.archetype === 'social') {
        // Social players contribute to gang
        if (context.character.gang) {
          goals.push(createGoal('complete_quest', {
            target: { questType: 'gang' },
            priority: 7,
          }, personality));
        }
      }
    }

    // Greedy personalities always want more gold
    if (personality.traits.greed > 0.7) {
      goals.push(createGoal('earn_gold', {
        target: context.character.gold * 1.5,
        priority: 8,
      }, personality));
    }

    return goals;
  },

  getBasePriority: (personality: PersonalityProfile): number => {
    if (personality.archetype === 'economist') return 10;
    if (personality.archetype === 'grinder') return 8;
    if (personality.archetype === 'criminal') return 8;
    return 6;
  },
};

/**
 * Template for join_gang goals
 */
const JOIN_GANG_TEMPLATE: GoalTemplate = {
  type: 'join_gang',

  generateTarget: (context: GameContext, personality: PersonalityProfile): any => {
    // Social and loyal personalities prefer specific gang types
    if (personality.traits.loyalty > 0.7) {
      return { type: 'reputable', minReputation: 50 };
    }

    // Criminal personalities prefer outlaw gangs
    if (personality.archetype === 'criminal') {
      return { type: 'outlaw' };
    }

    // Others just want any gang
    return 'any';
  },

  calculateProgress: (goal: Goal, context: GameContext): number => {
    return context.character.gang ? 1.0 : 0.0;
  },

  getFollowUpGoals: (goal: Goal, context: GameContext, personality: PersonalityProfile): Goal[] => {
    const goals: Goal[] = [];

    // After joining gang, participate actively
    goals.push(createGoal('complete_quest', {
      target: { questType: 'gang', count: 3 },
      priority: 8,
    }, personality));

    // Social personalities make friends in gang
    if (personality.traits.sociability > 0.6) {
      goals.push(createGoal('make_friends', {
        target: 3,
        priority: 7,
      }, personality));
    }

    // Loyal personalities contribute resources
    if (personality.traits.loyalty > 0.6) {
      goals.push(createGoal('earn_gold', {
        target: 500,
        priority: 6,
        metadata: { purpose: 'gang_contribution' },
      }, personality));
    }

    return goals;
  },

  getBasePriority: (personality: PersonalityProfile): number => {
    if (personality.archetype === 'social') return 10;
    if (personality.archetype === 'combat') return 7;
    if (personality.traits.loyalty > 0.7) return 8;
    return 5;
  },
};

/**
 * Template for max_skill goals
 */
const MAX_SKILL_TEMPLATE: GoalTemplate = {
  type: 'max_skill',

  generateTarget: (context: GameContext, personality: PersonalityProfile): any => {
    // Choose skill based on personality
    if (personality.archetype === 'combat') {
      return { skill: 'gunfighting', level: 100 };
    } else if (personality.archetype === 'economist') {
      return { skill: 'crafting', level: 100 };
    } else if (personality.archetype === 'criminal') {
      return { skill: 'stealth', level: 100 };
    }

    // Random skill for others
    const skills = Object.keys(context.character.skills);
    const randomSkill = skills[Math.floor(Math.random() * skills.length)];
    return { skill: randomSkill, level: 100 };
  },

  calculateProgress: (goal: Goal, context: GameContext): number => {
    const skillName = goal.target.skill;
    const targetLevel = goal.target.level;
    const currentLevel = context.character.skills[skillName] || 0;

    return Math.min(1.0, currentLevel / targetLevel);
  },

  getFollowUpGoals: (goal: Goal, context: GameContext, personality: PersonalityProfile): Goal[] => {
    const goals: Goal[] = [];

    // After maxing one skill, work on another
    if (personality.traits.patience > 0.7) {
      const skills = Object.keys(context.character.skills);
      const unmaxedSkills = skills.filter(s => context.character.skills[s] < 100);

      if (unmaxedSkills.length > 0) {
        goals.push(createGoal('max_skill', {
          target: { skill: unmaxedSkills[0], level: 100 },
          priority: 6,
        }, personality));
      }
    }

    return goals;
  },

  getBasePriority: (personality: PersonalityProfile): number => {
    if (personality.archetype === 'grinder') return 9;
    if (personality.archetype === 'combat') return 8;
    return 6;
  },
};

/**
 * Template for complete_quest goals
 */
const COMPLETE_QUEST_TEMPLATE: GoalTemplate = {
  type: 'complete_quest',

  generateTarget: (context: GameContext, personality: PersonalityProfile): any => {
    if (personality.archetype === 'explorer') {
      return { count: 5, type: 'exploration' };
    } else if (personality.archetype === 'combat') {
      return { count: 3, type: 'combat' };
    } else if (personality.archetype === 'social' && context.character.gang) {
      return { count: 3, type: 'gang' };
    }

    return { count: 2, type: 'any' };
  },

  calculateProgress: (goal: Goal, context: GameContext): number => {
    const startCount = goal.metadata?.startQuestCount || 0;
    const currentCount = context.character.quests.completed.length;
    const targetCount = goal.target.count;

    return Math.min(1.0, (currentCount - startCount) / targetCount);
  },

  getFollowUpGoals: (goal: Goal, context: GameContext, personality: PersonalityProfile): Goal[] => {
    const goals: Goal[] = [];

    // Explorers always want more quests
    if (personality.archetype === 'explorer') {
      goals.push(createGoal('complete_quest', {
        target: { count: 5, type: 'any' },
        priority: 9,
      }, personality));
    }

    // Roleplayers continue story arcs
    if (personality.archetype === 'roleplayer') {
      goals.push(createGoal('complete_quest', {
        target: { count: 3, type: 'story' },
        priority: 8,
      }, personality));
    }

    return goals;
  },

  getBasePriority: (personality: PersonalityProfile): number => {
    if (personality.archetype === 'explorer') return 10;
    if (personality.archetype === 'roleplayer') return 9;
    return 6;
  },
};

/**
 * Template for win_duels goals
 */
const WIN_DUELS_TEMPLATE: GoalTemplate = {
  type: 'win_duels',

  generateTarget: (context: GameContext, personality: PersonalityProfile): number => {
    if (personality.archetype === 'combat') {
      return Math.floor(Math.random() * 10) + 10; // 10-20 duels
    }

    return Math.floor(Math.random() * 5) + 3; // 3-7 duels
  },

  calculateProgress: (goal: Goal, context: GameContext): number => {
    const startWins = goal.metadata?.startDuelWins || 0;
    const currentWins = context.character.combat.duelsWon;
    const targetWins = goal.target;

    return Math.min(1.0, (currentWins - startWins) / targetWins);
  },

  getFollowUpGoals: (goal: Goal, context: GameContext, personality: PersonalityProfile): Goal[] => {
    const goals: Goal[] = [];

    // Combat enthusiasts continue dueling
    if (personality.archetype === 'combat') {
      goals.push(createGoal('win_duels', {
        target: goal.target + 10,
        priority: 9,
      }, personality));

      // Also upgrade combat gear
      goals.push(createGoal('buy_property', {
        target: 'weapon',
        priority: 8,
      }, personality));
    }

    return goals;
  },

  getBasePriority: (personality: PersonalityProfile): number => {
    if (personality.archetype === 'combat') return 10;
    if (personality.traits.aggression > 0.7) return 8;
    return 4;
  },
};

/**
 * Template for unlock_location goals
 */
const UNLOCK_LOCATION_TEMPLATE: GoalTemplate = {
  type: 'unlock_location',

  generateTarget: (context: GameContext, personality: PersonalityProfile): any => {
    const availableLocations = context.worldState?.availableLocations || [];
    const unlockedLocations = context.character.exploration.locationsUnlocked;

    const lockedLocations = availableLocations.filter(
      loc => !unlockedLocations.includes(loc)
    );

    if (lockedLocations.length > 0) {
      return lockedLocations[Math.floor(Math.random() * lockedLocations.length)];
    }

    return 'any';
  },

  calculateProgress: (goal: Goal, context: GameContext): number => {
    if (goal.target === 'any') {
      return context.character.exploration.locationsUnlocked.length > 0 ? 1.0 : 0.0;
    }

    return context.character.exploration.locationsUnlocked.includes(goal.target) ? 1.0 : 0.0;
  },

  getFollowUpGoals: (goal: Goal, context: GameContext, personality: PersonalityProfile): Goal[] => {
    const goals: Goal[] = [];

    // Explorers want to visit the newly unlocked location
    if (personality.archetype === 'explorer') {
      goals.push(createGoal('explore', {
        target: { count: 5 },
        priority: 9,
      }, personality));
    }

    return goals;
  },

  getBasePriority: (personality: PersonalityProfile): number => {
    if (personality.archetype === 'explorer') return 10;
    if (personality.traits.curiosity > 0.7) return 8;
    return 5;
  },
};

/**
 * Template for craft_item goals
 */
const CRAFT_ITEM_TEMPLATE: GoalTemplate = {
  type: 'craft_item',

  generateTarget: (context: GameContext, personality: PersonalityProfile): any => {
    if (personality.archetype === 'economist') {
      return { type: 'any', count: 10 };
    }

    return { type: 'any', count: 3 };
  },

  calculateProgress: (goal: Goal, context: GameContext): number => {
    const startCount = goal.metadata?.startCraftCount || 0;
    const currentCount = goal.metadata?.currentCraftCount || 0;
    const targetCount = goal.target.count;

    return Math.min(1.0, (currentCount - startCount) / targetCount);
  },

  getFollowUpGoals: (goal: Goal, context: GameContext, personality: PersonalityProfile): Goal[] => {
    const goals: Goal[] = [];

    // Economists continue crafting
    if (personality.archetype === 'economist') {
      goals.push(createGoal('craft_item', {
        target: { type: 'any', count: 10 },
        priority: 8,
      }, personality));

      // Sell crafted items
      goals.push(createGoal('earn_gold', {
        target: context.character.gold + 500,
        priority: 7,
      }, personality));
    }

    return goals;
  },

  getBasePriority: (personality: PersonalityProfile): number => {
    if (personality.archetype === 'economist') return 9;
    return 4;
  },
};

/**
 * Template for make_friends goals
 */
const MAKE_FRIENDS_TEMPLATE: GoalTemplate = {
  type: 'make_friends',

  generateTarget: (context: GameContext, personality: PersonalityProfile): number => {
    if (personality.archetype === 'social') {
      return Math.floor(Math.random() * 10) + 10; // 10-20 friends
    }

    return Math.floor(Math.random() * 5) + 3; // 3-7 friends
  },

  calculateProgress: (goal: Goal, context: GameContext): number => {
    const startFriends = goal.metadata?.startFriendCount || 0;
    const currentFriends = context.character.friends;
    const targetFriends = goal.target;

    return Math.min(1.0, (currentFriends - startFriends) / (targetFriends - startFriends));
  },

  getFollowUpGoals: (goal: Goal, context: GameContext, personality: PersonalityProfile): Goal[] => {
    const goals: Goal[] = [];

    // Social butterflies always want more friends
    if (personality.archetype === 'social') {
      goals.push(createGoal('make_friends', {
        target: context.character.friends + 10,
        priority: 9,
      }, personality));
    }

    return goals;
  },

  getBasePriority: (personality: PersonalityProfile): number => {
    if (personality.archetype === 'social') return 10;
    if (personality.traits.sociability > 0.7) return 8;
    return 4;
  },
};

/**
 * Template for explore goals
 */
const EXPLORE_TEMPLATE: GoalTemplate = {
  type: 'explore',

  generateTarget: (context: GameContext, personality: PersonalityProfile): any => {
    if (personality.archetype === 'explorer') {
      return { count: 10 };
    }

    return { count: 5 };
  },

  calculateProgress: (goal: Goal, context: GameContext): number => {
    const startCount = goal.metadata?.startLocationCount || 0;
    const currentCount = context.character.exploration.locationsVisited.length;
    const targetCount = goal.target.count;

    return Math.min(1.0, (currentCount - startCount) / targetCount);
  },

  getFollowUpGoals: (goal: Goal, context: GameContext, personality: PersonalityProfile): Goal[] => {
    const goals: Goal[] = [];

    // Explorers continue exploring
    if (personality.archetype === 'explorer') {
      goals.push(createGoal('explore', {
        target: { count: 10 },
        priority: 10,
      }, personality));

      // Try to unlock new locations
      goals.push(createGoal('unlock_location', {
        target: 'any',
        priority: 8,
      }, personality));
    }

    return goals;
  },

  getBasePriority: (personality: PersonalityProfile): number => {
    if (personality.archetype === 'explorer') return 10;
    if (personality.traits.curiosity > 0.7) return 7;
    return 5;
  },
};

/**
 * Template for buy_property goals
 */
const BUY_PROPERTY_TEMPLATE: GoalTemplate = {
  type: 'buy_property',

  generateTarget: (context: GameContext, personality: PersonalityProfile): any => {
    if (personality.archetype === 'combat') {
      return { type: 'weapon', minCost: 200 };
    } else if (personality.archetype === 'economist') {
      return { type: 'property', minCost: 1000 };
    }

    return { type: 'any', minCost: 100 };
  },

  calculateProgress: (goal: Goal, context: GameContext): number => {
    // This is binary - either purchased or not
    return goal.metadata?.purchased ? 1.0 : 0.0;
  },

  getFollowUpGoals: (goal: Goal, context: GameContext, personality: PersonalityProfile): Goal[] => {
    const goals: Goal[] = [];

    // After buying weapon, use it in combat
    if (goal.target.type === 'weapon' && personality.archetype === 'combat') {
      goals.push(createGoal('win_duels', {
        target: 5,
        priority: 8,
      }, personality));
    }

    // After buying property, earn gold to maintain it
    if (goal.target.type === 'property') {
      goals.push(createGoal('earn_gold', {
        target: context.character.gold + 500,
        priority: 7,
      }, personality));
    }

    return goals;
  },

  getBasePriority: (personality: PersonalityProfile): number => {
    if (personality.archetype === 'economist') return 8;
    if (personality.archetype === 'combat') return 7;
    return 5;
  },
};

/**
 * Template for achieve_rank goals
 */
const ACHIEVE_RANK_TEMPLATE: GoalTemplate = {
  type: 'achieve_rank',

  generateTarget: (context: GameContext, personality: PersonalityProfile): any => {
    return { faction: 'any', rank: 'respected' };
  },

  calculateProgress: (goal: Goal, context: GameContext): number => {
    const targetReputation = goal.metadata?.targetReputation || 100;
    const currentReputation = Object.values(context.character.reputation).reduce((a, b) => Math.max(a, b), 0);

    return Math.min(1.0, currentReputation / targetReputation);
  },

  getFollowUpGoals: (goal: Goal, context: GameContext, personality: PersonalityProfile): Goal[] => {
    const goals: Goal[] = [];

    // After achieving rank, maintain it through quests
    goals.push(createGoal('complete_quest', {
      target: { count: 3, type: 'faction' },
      priority: 7,
    }, personality));

    return goals;
  },

  getBasePriority: (personality: PersonalityProfile): number => {
    if (personality.archetype === 'roleplayer') return 8;
    if (personality.traits.loyalty > 0.7) return 7;
    return 5;
  },
};

/**
 * Template for collect_items goals
 */
const COLLECT_ITEMS_TEMPLATE: GoalTemplate = {
  type: 'collect_items',

  generateTarget: (context: GameContext, personality: PersonalityProfile): any => {
    return { type: 'any', count: 10 };
  },

  calculateProgress: (goal: Goal, context: GameContext): number => {
    const startCount = goal.metadata?.startItemCount || 0;
    const currentCount = context.character.inventory.count;
    const targetCount = goal.target.count;

    return Math.min(1.0, (currentCount - startCount) / targetCount);
  },

  getFollowUpGoals: (goal: Goal, context: GameContext, personality: PersonalityProfile): Goal[] => {
    const goals: Goal[] = [];

    // After collecting, craft or sell
    if (personality.archetype === 'economist') {
      goals.push(createGoal('craft_item', {
        target: { type: 'any', count: 5 },
        priority: 7,
      }, personality));
    }

    return goals;
  },

  getBasePriority: (personality: PersonalityProfile): number => {
    if (personality.archetype === 'economist') return 7;
    if (personality.archetype === 'grinder') return 6;
    return 4;
  },
};

/**
 * Template for defeat_boss goals
 */
const DEFEAT_BOSS_TEMPLATE: GoalTemplate = {
  type: 'defeat_boss',

  generateTarget: (context: GameContext, personality: PersonalityProfile): any => {
    return { boss: 'any', difficulty: 'medium' };
  },

  calculateProgress: (goal: Goal, context: GameContext): number => {
    if (goal.target.boss === 'any') {
      return context.character.combat.bossesDefeated.length > 0 ? 1.0 : 0.0;
    }

    return context.character.combat.bossesDefeated.includes(goal.target.boss) ? 1.0 : 0.0;
  },

  getFollowUpGoals: (goal: Goal, context: GameContext, personality: PersonalityProfile): Goal[] => {
    const goals: Goal[] = [];

    // After defeating boss, seek harder challenges
    if (personality.archetype === 'combat') {
      goals.push(createGoal('defeat_boss', {
        target: { boss: 'any', difficulty: 'hard' },
        priority: 9,
      }, personality));
    }

    return goals;
  },

  getBasePriority: (personality: PersonalityProfile): number => {
    if (personality.archetype === 'combat') return 9;
    if (personality.traits.aggression > 0.7) return 7;
    return 5;
  },
};

// ============================================================================
// GOAL TEMPLATE REGISTRY
// ============================================================================

const GOAL_TEMPLATES: Record<GoalType, GoalTemplate> = {
  level_up: LEVEL_UP_TEMPLATE,
  earn_gold: EARN_GOLD_TEMPLATE,
  join_gang: JOIN_GANG_TEMPLATE,
  max_skill: MAX_SKILL_TEMPLATE,
  complete_quest: COMPLETE_QUEST_TEMPLATE,
  win_duels: WIN_DUELS_TEMPLATE,
  unlock_location: UNLOCK_LOCATION_TEMPLATE,
  craft_item: CRAFT_ITEM_TEMPLATE,
  make_friends: MAKE_FRIENDS_TEMPLATE,
  explore: EXPLORE_TEMPLATE,
  buy_property: BUY_PROPERTY_TEMPLATE,
  achieve_rank: ACHIEVE_RANK_TEMPLATE,
  collect_items: COLLECT_ITEMS_TEMPLATE,
  defeat_boss: DEFEAT_BOSS_TEMPLATE,
};

// ============================================================================
// GOAL CREATION UTILITIES
// ============================================================================

/**
 * Create a new goal with default values
 */
function createGoal(
  type: GoalType,
  params: {
    target: any;
    priority: number;
    deadline?: Date;
    metadata?: Record<string, any>;
  },
  personality: PersonalityProfile
): Goal {
  const template = GOAL_TEMPLATES[type];
  const basePriority = template.getBasePriority(personality);

  return {
    id: generateGoalId(),
    type,
    name: generateGoalName(type, params.target),
    description: generateGoalDescription(type, params.target),
    priority: params.priority || basePriority,
    target: params.target,
    progress: 0,
    deadline: params.deadline,
    followUpGoals: [],
    prerequisites: [],
    createdAt: new Date(),
    metadata: params.metadata || {},
  };
}

/**
 * Generate unique goal ID
 */
function generateGoalId(): string {
  return `goal-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Generate human-readable goal name
 */
function generateGoalName(type: GoalType, target: any): string {
  const names: Record<GoalType, string> = {
    level_up: `Reach Level ${target}`,
    earn_gold: `Earn ${target} Gold`,
    join_gang: `Join a Gang`,
    max_skill: `Master ${target.skill || 'a skill'}`,
    complete_quest: `Complete ${target.count || 1} Quest(s)`,
    win_duels: `Win ${target} Duel(s)`,
    unlock_location: `Unlock ${target === 'any' ? 'a Location' : target}`,
    craft_item: `Craft ${target.count || 1} Item(s)`,
    make_friends: `Make ${target} Friend(s)`,
    explore: `Visit ${target.count || 1} Location(s)`,
    buy_property: `Purchase ${target.type === 'any' ? 'Property' : target.type}`,
    achieve_rank: `Achieve ${target.rank || 'Rank'}`,
    collect_items: `Collect ${target.count || 1} Item(s)`,
    defeat_boss: `Defeat ${target.boss === 'any' ? 'a Boss' : target.boss}`,
  };

  return names[type] || `Unknown Goal`;
}

/**
 * Generate goal description
 */
function generateGoalDescription(type: GoalType, target: any): string {
  const descriptions: Record<GoalType, string> = {
    level_up: `Progress your character to level ${target}`,
    earn_gold: `Accumulate ${target} gold through jobs, combat, or trading`,
    join_gang: `Find and join a gang that suits your playstyle`,
    max_skill: `Train ${target.skill || 'your skill'} to maximum level`,
    complete_quest: `Complete ${target.count || 1} quest(s) to progress the story`,
    win_duels: `Defeat ${target} opponents in PvP duels`,
    unlock_location: `Travel to and unlock ${target === 'any' ? 'a new location' : target}`,
    craft_item: `Craft ${target.count || 1} item(s) using gathered resources`,
    make_friends: `Add ${target} player(s) to your friends list`,
    explore: `Visit ${target.count || 1} different location(s)`,
    buy_property: `Purchase ${target.type === 'any' ? 'property or equipment' : target.type}`,
    achieve_rank: `Reach ${target.rank || 'a higher rank'} in faction reputation`,
    collect_items: `Gather ${target.count || 1} item(s) for your inventory`,
    defeat_boss: `Defeat ${target.boss === 'any' ? 'a boss enemy' : target.boss}`,
  };

  return descriptions[type] || `Complete this goal`;
}

/**
 * Get a random skill from context
 */
function getRandomSkill(context: GameContext): { skill: string; level: number } {
  const skills = Object.keys(context.character.skills);
  const randomSkill = skills[Math.floor(Math.random() * skills.length)];
  return { skill: randomSkill, level: 100 };
}

// ============================================================================
// GOAL MANAGER CLASS
// ============================================================================

/**
 * GoalManager manages goal lifecycle and generates emergent behavior
 */
export class GoalManager {
  private goals: Goal[] = [];
  private completedGoals: Goal[] = [];
  private personality: PersonalityProfile;

  constructor(personality: PersonalityProfile) {
    this.personality = personality;
    this.initializeStarterGoals();
  }

  /**
   * Initialize starter goals based on personality archetype
   */
  private initializeStarterGoals(): void {
    switch (this.personality.archetype) {
      case 'grinder':
        this.addGoal(createGoal('level_up', { target: 5, priority: 10 }, this.personality));
        this.addGoal(createGoal('earn_gold', { target: 100, priority: 8 }, this.personality));
        this.addGoal(createGoal('max_skill', { target: { skill: 'any', level: 100 }, priority: 7 }, this.personality));
        break;

      case 'social':
        this.addGoal(createGoal('make_friends', { target: 5, priority: 10 }, this.personality));
        this.addGoal(createGoal('join_gang', { target: 'any', priority: 9 }, this.personality));
        break;

      case 'explorer':
        this.addGoal(createGoal('explore', { target: { count: 10 }, priority: 10 }, this.personality));
        this.addGoal(createGoal('unlock_location', { target: 'any', priority: 9 }, this.personality));
        this.addGoal(createGoal('complete_quest', { target: { count: 5, type: 'exploration' }, priority: 8 }, this.personality));
        break;

      case 'combat':
        this.addGoal(createGoal('win_duels', { target: 10, priority: 10 }, this.personality));
        this.addGoal(createGoal('max_skill', { target: { skill: 'gunfighting', level: 100 }, priority: 9 }, this.personality));
        this.addGoal(createGoal('defeat_boss', { target: { boss: 'any', difficulty: 'medium' }, priority: 8 }, this.personality));
        break;

      case 'economist':
        this.addGoal(createGoal('earn_gold', { target: 1000, priority: 10 }, this.personality));
        this.addGoal(createGoal('craft_item', { target: { type: 'any', count: 10 }, priority: 9 }, this.personality));
        this.addGoal(createGoal('buy_property', { target: { type: 'property', minCost: 500 }, priority: 8 }, this.personality));
        break;

      case 'criminal':
        this.addGoal(createGoal('earn_gold', { target: 500, priority: 10, metadata: { method: 'crimes' } }, this.personality));
        this.addGoal(createGoal('max_skill', { target: { skill: 'stealth', level: 100 }, priority: 8 }, this.personality));
        this.addGoal(createGoal('win_duels', { target: 5, priority: 7 }, this.personality));
        break;

      case 'roleplayer':
        this.addGoal(createGoal('complete_quest', { target: { count: 5, type: 'story' }, priority: 10 }, this.personality));
        this.addGoal(createGoal('join_gang', { target: { type: 'reputable' }, priority: 8 }, this.personality));
        this.addGoal(createGoal('achieve_rank', { target: { faction: 'any', rank: 'respected' }, priority: 7 }, this.personality));
        break;

      case 'chaos':
        // Chaos archetype gets random goals
        const randomTypes: GoalType[] = ['level_up', 'earn_gold', 'explore', 'win_duels', 'make_friends'];
        randomTypes.forEach((type, index) => {
          const template = GOAL_TEMPLATES[type];
          const target = template.generateTarget(this.createMockContext(), this.personality);
          this.addGoal(createGoal(type, { target, priority: 10 - index }, this.personality));
        });
        break;
    }
  }

  /**
   * Add a new goal to the active goals list
   */
  addGoal(goal: Goal): void {
    this.goals.push(goal);
    this.sortGoals();
  }

  /**
   * Sort goals by priority (highest first)
   */
  private sortGoals(): void {
    this.goals.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Update progress for all active goals
   */
  updateProgress(context: GameContext): void {
    for (const goal of [...this.goals]) {
      const template = GOAL_TEMPLATES[goal.type];
      const newProgress = template.calculateProgress(goal, context);
      goal.progress = newProgress;

      // Check for completion
      if (newProgress >= 1.0) {
        this.completeGoal(goal, context);
      }

      // Check for deadline expiration
      if (goal.deadline && new Date() > goal.deadline) {
        this.failGoal(goal);
      }

      // Dynamic priority adjustment
      this.adjustPriority(goal);
    }

    // Re-sort after priority adjustments
    this.sortGoals();
  }

  /**
   * Complete a goal and generate follow-up goals
   */
  private completeGoal(goal: Goal, context: GameContext): void {
    goal.completedAt = new Date();

    // Remove from active goals
    this.goals = this.goals.filter(g => g.id !== goal.id);
    this.completedGoals.push(goal);

    console.log(`✓ Goal completed: ${goal.name} (${goal.type})`);

    // Add predefined follow-up goals
    if (goal.followUpGoals && goal.followUpGoals.length > 0) {
      goal.followUpGoals.forEach(fg => this.addGoal(fg));
    }

    // Generate emergent goals from template
    const template = GOAL_TEMPLATES[goal.type];
    const emergentGoals = template.getFollowUpGoals(goal, context, this.personality);
    emergentGoals.forEach(g => this.addGoal(g));

    // Generate additional personality-driven goals
    const personalityGoals = this.generatePersonalityGoals(goal, context);
    personalityGoals.forEach(g => this.addGoal(g));
  }

  /**
   * Generate additional goals based on personality after completing a goal
   */
  private generatePersonalityGoals(completedGoal: Goal, context: GameContext): Goal[] {
    const goals: Goal[] = [];

    // Grinders always create another leveling goal
    if (this.personality.archetype === 'grinder') {
      if (completedGoal.type === 'level_up' || completedGoal.type === 'earn_gold') {
        goals.push(createGoal('level_up', {
          target: context.character.level + 3,
          priority: 9,
        }, this.personality));
      }
    }

    // Explorers generate exploration chains
    if (this.personality.archetype === 'explorer') {
      if (completedGoal.type === 'explore' || completedGoal.type === 'unlock_location') {
        goals.push(createGoal('explore', {
          target: { count: 10 },
          priority: 9,
        }, this.personality));
      }
    }

    // Social players expand their network
    if (this.personality.archetype === 'social') {
      if (completedGoal.type === 'make_friends' || completedGoal.type === 'join_gang') {
        goals.push(createGoal('make_friends', {
          target: context.character.friends + 5,
          priority: 8,
        }, this.personality));
      }
    }

    // Combat enthusiasts seek more challenges
    if (this.personality.archetype === 'combat') {
      if (completedGoal.type === 'win_duels' || completedGoal.type === 'defeat_boss') {
        goals.push(createGoal('win_duels', {
          target: context.character.combat.duelsWon + 10,
          priority: 9,
        }, this.personality));
      }
    }

    // Economists reinvest earnings
    if (this.personality.archetype === 'economist') {
      if (completedGoal.type === 'earn_gold' || completedGoal.type === 'craft_item') {
        goals.push(createGoal('earn_gold', {
          target: context.character.gold * 1.5,
          priority: 8,
        }, this.personality));
      }
    }

    return goals;
  }

  /**
   * Fail a goal (expired deadline or impossible)
   */
  private failGoal(goal: Goal): void {
    console.log(`✗ Goal failed: ${goal.name} (${goal.type})`);
    this.goals = this.goals.filter(g => g.id !== goal.id);
  }

  /**
   * Dynamically adjust goal priority based on various factors
   */
  private adjustPriority(goal: Goal): void {
    // Increase priority as deadline approaches
    if (goal.deadline) {
      const timeUntilDeadline = goal.deadline.getTime() - Date.now();
      const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);

      if (hoursUntilDeadline < 24) {
        goal.priority = Math.min(10, goal.priority + 3);
      } else if (hoursUntilDeadline < 48) {
        goal.priority = Math.min(10, goal.priority + 2);
      } else if (hoursUntilDeadline < 72) {
        goal.priority = Math.min(10, goal.priority + 1);
      }
    }

    // Increase priority if making good progress
    if (goal.progress > 0.7 && goal.priority < 8) {
      goal.priority = Math.min(10, goal.priority + 1);
    }

    // Decrease priority if stalled (no progress in a while)
    const goalAge = Date.now() - goal.createdAt.getTime();
    const hoursOld = goalAge / (1000 * 60 * 60);

    if (hoursOld > 48 && goal.progress < 0.3) {
      goal.priority = Math.max(1, goal.priority - 1);
    }
  }

  /**
   * Get current active goals sorted by priority
   */
  getCurrentGoals(): Goal[] {
    return [...this.goals];
  }

  /**
   * Get top priority goal
   */
  getTopGoal(): Goal | null {
    return this.goals[0] || null;
  }

  /**
   * Get all completed goals
   */
  getCompletedGoals(): Goal[] {
    return [...this.completedGoals];
  }

  /**
   * Check if an action contributes to any active goal
   */
  doesActionContributeToGoals(actionType: string): boolean {
    return this.goals.some(goal => this.doesActionContributeToGoal(actionType, goal));
  }

  /**
   * Check if action contributes to specific goal
   */
  private doesActionContributeToGoal(actionType: string, goal: Goal): boolean {
    const actionLower = actionType.toLowerCase();

    const mappings: Record<GoalType, string[]> = {
      level_up: ['combat', 'quest', 'job', 'skill_training', 'any'],
      earn_gold: ['job', 'crime', 'sell', 'trade', 'combat', 'quest'],
      join_gang: ['social', 'gang'],
      max_skill: ['skill_training', 'train', 'practice'],
      complete_quest: ['quest', 'mission', 'task'],
      win_duels: ['duel', 'pvp', 'combat', 'fight'],
      unlock_location: ['travel', 'explore', 'quest'],
      craft_item: ['craft', 'create', 'make'],
      make_friends: ['social', 'chat', 'friend'],
      explore: ['travel', 'explore', 'move'],
      buy_property: ['shop', 'buy', 'purchase'],
      achieve_rank: ['quest', 'faction', 'reputation'],
      collect_items: ['gather', 'loot', 'collect', 'harvest'],
      defeat_boss: ['combat', 'fight', 'boss', 'raid'],
    };

    const relevantActions = mappings[goal.type] || [];
    return relevantActions.some(action => actionLower.includes(action));
  }

  /**
   * Get recommended action based on top goal
   */
  getRecommendedAction(): string | null {
    const topGoal = this.getTopGoal();
    if (!topGoal) return null;

    const recommendations: Record<GoalType, string[]> = {
      level_up: ['combat', 'quest', 'skill_training'],
      earn_gold: ['job', 'crime', 'trade'],
      join_gang: ['gang_search', 'social'],
      max_skill: ['skill_training'],
      complete_quest: ['quest'],
      win_duels: ['duel', 'pvp'],
      unlock_location: ['travel', 'explore'],
      craft_item: ['craft'],
      make_friends: ['social', 'chat'],
      explore: ['travel'],
      buy_property: ['shop'],
      achieve_rank: ['faction_quest'],
      collect_items: ['gather', 'loot'],
      defeat_boss: ['combat_boss'],
    };

    const actions = recommendations[topGoal.type] || [];
    return actions.length > 0 ? actions[Math.floor(Math.random() * actions.length)] : null;
  }

  /**
   * Get goal statistics
   */
  getStats(): {
    activeGoals: number;
    completedGoals: number;
    completionRate: number;
    averagePriority: number;
    averageProgress: number;
  } {
    const activeGoals = this.goals.length;
    const completedGoals = this.completedGoals.length;
    const totalGoals = activeGoals + completedGoals;
    const completionRate = totalGoals > 0 ? completedGoals / totalGoals : 0;

    const averagePriority = activeGoals > 0
      ? this.goals.reduce((sum, g) => sum + g.priority, 0) / activeGoals
      : 0;

    const averageProgress = activeGoals > 0
      ? this.goals.reduce((sum, g) => sum + g.progress, 0) / activeGoals
      : 0;

    return {
      activeGoals,
      completedGoals,
      completionRate,
      averagePriority,
      averageProgress,
    };
  }

  /**
   * Create a mock context for initial goal generation
   */
  private createMockContext(): GameContext {
    return {
      character: {
        id: 'mock',
        name: 'Mock',
        level: 1,
        experience: 0,
        gold: 0,
        energy: { current: 100, max: 100 },
        skills: { gunfighting: 1, stealth: 1, crafting: 1 },
        location: 'start',
        friends: 0,
        inventory: { items: [], count: 0 },
        achievements: [],
        quests: { active: [], completed: [] },
        combat: { duelsWon: 0, duelsLost: 0, bossesDefeated: [] },
        exploration: { locationsVisited: [], locationsUnlocked: [] },
        reputation: {},
      },
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default GoalManager;
