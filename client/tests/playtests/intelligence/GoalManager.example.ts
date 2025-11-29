/**
 * GoalManager.example.ts
 *
 * Example usage and integration patterns for the GoalManager system.
 * Demonstrates how to create goal-driven bot behavior with emergent narratives.
 */

import { GoalManager, GameContext } from './GoalManager.js';
import { PersonalitySystem, PersonalityProfile } from './PersonalitySystem.js';

// ============================================================================
// BASIC USAGE EXAMPLE
// ============================================================================

/**
 * Example 1: Creating a goal-driven grinder bot
 */
function example1_GrinderBot() {
  console.log('=== Example 1: Grinder Bot ===\n');

  // Create grinder personality
  const personality = PersonalitySystem.createPersonality('grinder');

  // Initialize goal manager
  const goalManager = new GoalManager(personality);

  console.log('Initial Goals:');
  goalManager.getCurrentGoals().forEach(goal => {
    console.log(`  - [Priority ${goal.priority}] ${goal.name}: ${goal.description}`);
  });

  // Simulate game context
  const context: GameContext = {
    character: {
      id: 'bot-1',
      name: 'GrinderBot',
      level: 3,
      experience: 450,
      gold: 150,
      energy: { current: 80, max: 100 },
      skills: {
        gunfighting: 25,
        tracking: 15,
        survival: 20,
        stealth: 10,
      },
      location: 'dusty_gulch',
      friends: 0,
      inventory: { items: [], count: 5 },
      achievements: [],
      quests: { active: [], completed: ['tutorial_quest'] },
      combat: { duelsWon: 2, duelsLost: 1, bossesDefeated: [] },
      exploration: { locationsVisited: ['start_town', 'dusty_gulch'], locationsUnlocked: ['dusty_gulch'] },
      reputation: { settler: 10 },
    },
  };

  // Update progress
  console.log('\nUpdating goal progress...');
  goalManager.updateProgress(context);

  console.log('\nCurrent Goal Progress:');
  goalManager.getCurrentGoals().forEach(goal => {
    const progressPercent = (goal.progress * 100).toFixed(1);
    console.log(`  - ${goal.name}: ${progressPercent}% complete`);
  });

  // Get recommended action
  const recommendedAction = goalManager.getRecommendedAction();
  console.log(`\nRecommended Action: ${recommendedAction}`);

  console.log('\n');
}

// ============================================================================
// GOAL COMPLETION AND EMERGENT CHAINS
// ============================================================================

/**
 * Example 2: Demonstrating goal completion chains
 */
function example2_GoalChains() {
  console.log('=== Example 2: Goal Completion Chains ===\n');

  const personality = PersonalitySystem.createPersonality('combat');
  const goalManager = new GoalManager(personality);

  console.log('Initial Goals:');
  goalManager.getCurrentGoals().forEach(goal => {
    console.log(`  - ${goal.name} (${goal.type})`);
  });

  // Simulate achieving level 10 and winning 10 duels
  const context: GameContext = {
    character: {
      id: 'bot-2',
      name: 'CombatBot',
      level: 10,
      experience: 2500,
      gold: 450,
      energy: { current: 70, max: 100 },
      skills: {
        gunfighting: 60,
        tracking: 30,
        survival: 25,
        stealth: 15,
      },
      location: 'combat_arena',
      friends: 2,
      inventory: { items: [], count: 8 },
      achievements: ['first_duel_win', 'ten_duels_won'],
      quests: { active: [], completed: ['combat_training', 'first_blood'] },
      combat: { duelsWon: 10, duelsLost: 3, bossesDefeated: [] },
      exploration: { locationsVisited: ['start_town', 'combat_arena'], locationsUnlocked: ['combat_arena'] },
      reputation: { combat_guild: 45 },
    },
  };

  console.log('\n--- Completing "Win 10 Duels" Goal ---');
  goalManager.updateProgress(context);

  console.log('\nNew Emergent Goals Generated:');
  goalManager.getCurrentGoals().forEach(goal => {
    console.log(`  - [Priority ${goal.priority}] ${goal.name}`);
    console.log(`    └─ ${goal.description}`);
  });

  console.log('\nCompleted Goals:');
  goalManager.getCompletedGoals().forEach(goal => {
    console.log(`  ✓ ${goal.name} (completed at ${goal.completedAt?.toLocaleTimeString()})`);
  });

  console.log('\n');
}

// ============================================================================
// PERSONALITY-DRIVEN GOAL SELECTION
// ============================================================================

/**
 * Example 3: Different personalities generate different goals
 */
function example3_PersonalityDrivenGoals() {
  console.log('=== Example 3: Personality-Driven Goal Generation ===\n');

  const archetypes = ['grinder', 'social', 'explorer', 'combat', 'economist', 'criminal', 'roleplayer'];

  archetypes.forEach(archetype => {
    const personality = PersonalitySystem.createPersonality(archetype);
    const goalManager = new GoalManager(personality);

    console.log(`${personality.name} (${archetype}):`);
    goalManager.getCurrentGoals().slice(0, 3).forEach(goal => {
      console.log(`  [${goal.priority}] ${goal.name}`);
    });
    console.log('');
  });
}

// ============================================================================
// ACTION FILTERING BASED ON GOALS
// ============================================================================

/**
 * Example 4: Using goals to filter and prioritize actions
 */
function example4_ActionFiltering() {
  console.log('=== Example 4: Goal-Based Action Filtering ===\n');

  const personality = PersonalitySystem.createPersonality('economist');
  const goalManager = new GoalManager(personality);

  const availableActions = [
    'combat_encounter',
    'craft_item',
    'trade_goods',
    'explore_location',
    'duel_player',
    'skill_training',
    'join_gang',
    'complete_quest',
  ];

  console.log('Available Actions:', availableActions.join(', '));
  console.log('\nTop Goal:', goalManager.getTopGoal()?.name);
  console.log('\nAction Analysis:');

  availableActions.forEach(action => {
    const contributes = goalManager.doesActionContributeToGoals(action);
    const marker = contributes ? '✓' : '✗';
    console.log(`  ${marker} ${action}`);
  });

  const recommended = goalManager.getRecommendedAction();
  console.log(`\nRecommended Action: ${recommended}`);

  console.log('\n');
}

// ============================================================================
// DYNAMIC PRIORITY ADJUSTMENT
// ============================================================================

/**
 * Example 5: Goals with deadlines get priority boosts
 */
function example5_DynamicPriority() {
  console.log('=== Example 5: Dynamic Priority Adjustment ===\n');

  const personality = PersonalitySystem.createPersonality('explorer');
  const goalManager = new GoalManager(personality);

  // Add a goal with a tight deadline (24 hours)
  const urgentGoal = {
    id: 'urgent-quest',
    type: 'complete_quest' as const,
    name: 'Complete Urgent Quest',
    description: 'Time-sensitive quest expires soon',
    priority: 5,
    target: { count: 1, type: 'urgent' },
    progress: 0.3,
    deadline: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000), // Created 36 hours ago
  };

  goalManager.addGoal(urgentGoal);

  console.log('Before Priority Adjustment:');
  goalManager.getCurrentGoals().forEach(goal => {
    const deadline = goal.deadline ? ` (deadline: ${goal.deadline.toLocaleString()})` : '';
    console.log(`  [${goal.priority}] ${goal.name}${deadline}`);
  });

  // Simulate context
  const context: GameContext = {
    character: {
      id: 'bot-3',
      name: 'ExplorerBot',
      level: 5,
      experience: 800,
      gold: 200,
      energy: { current: 90, max: 100 },
      skills: { tracking: 40, survival: 35 },
      location: 'frontier',
      friends: 3,
      inventory: { items: [], count: 10 },
      achievements: [],
      quests: { active: [{ id: 'urgent', name: 'Urgent Quest' }], completed: ['explore_1', 'explore_2'] },
      combat: { duelsWon: 1, duelsLost: 0, bossesDefeated: [] },
      exploration: {
        locationsVisited: ['town', 'forest', 'mountains', 'frontier'],
        locationsUnlocked: ['frontier'],
      },
      reputation: {},
    },
  };

  // Update progress (triggers priority adjustment)
  goalManager.updateProgress(context);

  console.log('\nAfter Priority Adjustment:');
  goalManager.getCurrentGoals().forEach(goal => {
    const deadline = goal.deadline ? ` (deadline approaching!)` : '';
    console.log(`  [${goal.priority}] ${goal.name}${deadline}`);
  });

  console.log('\n');
}

// ============================================================================
// GOAL STATISTICS AND TRACKING
// ============================================================================

/**
 * Example 6: Tracking bot performance through goal statistics
 */
function example6_GoalStats() {
  console.log('=== Example 6: Goal Statistics ===\n');

  const personality = PersonalitySystem.createPersonality('grinder');
  const goalManager = new GoalManager(personality);

  // Simulate some progress
  const context: GameContext = {
    character: {
      id: 'bot-4',
      name: 'StatsBot',
      level: 8,
      experience: 1800,
      gold: 650,
      energy: { current: 60, max: 100 },
      skills: { gunfighting: 50, tracking: 40, survival: 35, stealth: 25 },
      location: 'town',
      friends: 1,
      inventory: { items: [], count: 15 },
      achievements: ['level_5', 'rich_prospector'],
      quests: { active: [], completed: ['tutorial', 'first_job', 'skill_master'] },
      combat: { duelsWon: 5, duelsLost: 2, bossesDefeated: [] },
      exploration: { locationsVisited: ['town', 'mines'], locationsUnlocked: ['mines'] },
      reputation: { settler: 30 },
    },
  };

  // Update multiple times to simulate gameplay
  for (let i = 0; i < 3; i++) {
    goalManager.updateProgress(context);
    context.character.level += 1;
    context.character.gold += 100;
  }

  const stats = goalManager.getStats();

  console.log('Goal Manager Statistics:');
  console.log(`  Active Goals: ${stats.activeGoals}`);
  console.log(`  Completed Goals: ${stats.completedGoals}`);
  console.log(`  Completion Rate: ${(stats.completionRate * 100).toFixed(1)}%`);
  console.log(`  Average Priority: ${stats.averagePriority.toFixed(1)}`);
  console.log(`  Average Progress: ${(stats.averageProgress * 100).toFixed(1)}%`);

  console.log('\n');
}

// ============================================================================
// BOT INTEGRATION EXAMPLE
// ============================================================================

/**
 * Example 7: Full integration with a bot decision-making system
 */
class GoalDrivenBot {
  private goalManager: GoalManager;
  private personality: PersonalityProfile;
  private context: GameContext;

  constructor(archetype: string) {
    this.personality = PersonalitySystem.createPersonality(archetype);
    this.goalManager = new GoalManager(this.personality);

    // Initialize with mock context
    this.context = this.createMockContext();
  }

  /**
   * Main decision-making loop
   */
  async decideNextAction(): Promise<string> {
    // Update goal progress
    this.goalManager.updateProgress(this.context);

    // Get top priority goal
    const topGoal = this.goalManager.getTopGoal();

    if (!topGoal) {
      console.log('No active goals! Exploring randomly...');
      return 'explore';
    }

    console.log(`\n=== Decision Making ===`);
    console.log(`Top Goal: ${topGoal.name} (${(topGoal.progress * 100).toFixed(1)}% complete)`);
    console.log(`Priority: ${topGoal.priority}/10`);

    // Get recommended action
    const recommendedAction = this.goalManager.getRecommendedAction();

    if (recommendedAction) {
      console.log(`Recommended Action: ${recommendedAction}`);
      return recommendedAction;
    }

    // Fallback to personality-driven action
    console.log('No specific recommendation, using personality preferences...');
    const preferredActivities = this.personality.preferences.preferredActivities;
    return preferredActivities[Math.floor(Math.random() * preferredActivities.length)];
  }

  /**
   * Simulate taking an action and updating context
   */
  async executeAction(action: string): Promise<void> {
    console.log(`\n→ Executing: ${action}`);

    // Simulate action effects
    switch (action) {
      case 'combat':
        this.context.character.experience += 50;
        this.context.character.gold += 25;
        this.context.character.combat.duelsWon += 1;
        this.context.character.energy.current -= 10;
        break;

      case 'skill_training':
        const skills = Object.keys(this.context.character.skills);
        const randomSkill = skills[Math.floor(Math.random() * skills.length)];
        this.context.character.skills[randomSkill] += 5;
        this.context.character.energy.current -= 15;
        break;

      case 'job':
        this.context.character.gold += 50;
        this.context.character.experience += 20;
        this.context.character.energy.current -= 20;
        break;

      case 'explore':
      case 'travel':
        const newLocation = `location_${Math.random().toString(36).substring(7)}`;
        this.context.character.exploration.locationsVisited.push(newLocation);
        this.context.character.experience += 30;
        this.context.character.energy.current -= 10;
        break;

      default:
        console.log(`  (Action "${action}" not implemented in example)`);
    }

    // Check for level up
    if (this.context.character.experience >= this.context.character.level * 200) {
      this.context.character.level += 1;
      this.context.character.experience = 0;
      console.log(`  ✨ LEVEL UP! Now level ${this.context.character.level}`);
    }

    // Update goals after action
    this.goalManager.updateProgress(this.context);

    // Display updated stats
    const stats = this.goalManager.getStats();
    console.log(`\n  Stats: ${stats.activeGoals} active goals, ${stats.completedGoals} completed`);
  }

  /**
   * Run bot for N cycles
   */
  async run(cycles: number): Promise<void> {
    console.log(`\n╔════════════════════════════════════════════════════╗`);
    console.log(`║  Goal-Driven Bot: ${this.personality.name.padEnd(33)}║`);
    console.log(`╚════════════════════════════════════════════════════╝`);

    for (let i = 0; i < cycles; i++) {
      console.log(`\n─── Cycle ${i + 1}/${cycles} ───`);

      const action = await this.decideNextAction();
      await this.executeAction(action);

      // Wait between actions
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Final summary
    console.log(`\n\n╔════════════════════════════════════════════════════╗`);
    console.log(`║  Session Complete                                  ║`);
    console.log(`╚════════════════════════════════════════════════════╝`);

    const stats = this.goalManager.getStats();
    console.log(`\nFinal Statistics:`);
    console.log(`  Character Level: ${this.context.character.level}`);
    console.log(`  Gold: ${this.context.character.gold}`);
    console.log(`  Locations Visited: ${this.context.character.exploration.locationsVisited.length}`);
    console.log(`  Active Goals: ${stats.activeGoals}`);
    console.log(`  Completed Goals: ${stats.completedGoals}`);
    console.log(`  Completion Rate: ${(stats.completionRate * 100).toFixed(1)}%`);

    console.log(`\nCompleted Goals:`);
    this.goalManager.getCompletedGoals().forEach(goal => {
      console.log(`  ✓ ${goal.name}`);
    });

    console.log(`\nRemaining Goals:`);
    this.goalManager.getCurrentGoals().forEach(goal => {
      console.log(`  • ${goal.name} (${(goal.progress * 100).toFixed(1)}% complete)`);
    });
  }

  private createMockContext(): GameContext {
    return {
      character: {
        id: `bot-${Math.random().toString(36).substring(7)}`,
        name: `${this.personality.archetype}Bot`,
        level: 1,
        experience: 0,
        gold: 50,
        energy: { current: 100, max: 100 },
        skills: {
          gunfighting: 10,
          tracking: 10,
          survival: 10,
          stealth: 10,
          intimidation: 10,
          persuasion: 10,
        },
        location: 'start_town',
        friends: 0,
        inventory: { items: [], count: 0 },
        achievements: [],
        quests: { active: [], completed: [] },
        combat: { duelsWon: 0, duelsLost: 0, bossesDefeated: [] },
        exploration: { locationsVisited: ['start_town'], locationsUnlocked: ['start_town'] },
        reputation: {},
      },
    };
  }
}

// ============================================================================
// RUN EXAMPLES
// ============================================================================

async function runAllExamples() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║            GoalManager System - Example Usage                 ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  // Run basic examples
  example1_GrinderBot();
  example2_GoalChains();
  example3_PersonalityDrivenGoals();
  example4_ActionFiltering();
  example5_DynamicPriority();
  example6_GoalStats();

  // Run full bot simulation
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║          Full Bot Simulation (5 cycles)                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  const bot = new GoalDrivenBot('grinder');
  await bot.run(5);
}

// Export for use in tests
export {
  example1_GrinderBot,
  example2_GoalChains,
  example3_PersonalityDrivenGoals,
  example4_ActionFiltering,
  example5_DynamicPriority,
  example6_GoalStats,
  GoalDrivenBot,
  runAllExamples,
};

// Run if executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
