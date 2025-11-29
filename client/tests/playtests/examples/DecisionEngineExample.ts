/**
 * DecisionEngineExample.ts
 *
 * Comprehensive examples demonstrating the DecisionEngine in various scenarios.
 * Shows how different personalities make different decisions in the same context.
 */

import { PersonalitySystem } from '../intelligence/PersonalitySystem.js';
import {
  DecisionEngine,
  GameContext,
  GameAction,
  createDefaultActions,
  createSampleContext,
  filterActionsByContext,
  explainDecision,
  Goal,
} from '../intelligence/DecisionEngine.js';

// ============================================================================
// EXAMPLE 1: Basic Decision Making
// ============================================================================

export function example1_BasicDecision(): void {
  console.log('='.repeat(80));
  console.log('EXAMPLE 1: Basic Decision Making');
  console.log('='.repeat(80));
  console.log();

  // Create a Grinder personality
  const personality = PersonalitySystem.createPersonality('grinder');
  const engine = new DecisionEngine(personality);

  // Create context
  const context = createSampleContext();

  // Get actions
  const actions = createDefaultActions();
  const viable = filterActionsByContext(actions, context);

  // Make decision
  const choice = engine.selectAction(viable, context);

  console.log(`Personality: ${personality.name}`);
  console.log(`Context: Level ${context.character.level}, ${context.character.gold} gold, ${context.character.energy} energy`);
  console.log(`Available Actions: ${viable.length}`);
  console.log();
  console.log(`DECISION: ${choice.name}`);
  console.log(`  Energy Cost: ${choice.energyCost}`);
  console.log(`  Expected Reward: ${choice.expectedReward}`);
  console.log(`  Success Rate: ${(choice.successProbability * 100).toFixed(0)}%`);
  console.log();
}

// ============================================================================
// EXAMPLE 2: Personality Comparison
// ============================================================================

export function example2_PersonalityComparison(): void {
  console.log('='.repeat(80));
  console.log('EXAMPLE 2: Same Context, Different Personalities');
  console.log('='.repeat(80));
  console.log();

  const context = createSampleContext();
  const actions = filterActionsByContext(createDefaultActions(), context);

  const archetypes = ['grinder', 'combat', 'social', 'explorer', 'criminal', 'economist'];

  console.log('Given the same game state, different personalities choose:');
  console.log();

  archetypes.forEach(archetype => {
    const personality = PersonalitySystem.createPersonality(archetype);
    const engine = new DecisionEngine(personality);
    const choice = engine.selectAction(actions, context);

    console.log(`${personality.name.padEnd(25)} → ${choice.name}`);
  });

  console.log();
}

// ============================================================================
// EXAMPLE 3: Goal-Driven Decisions
// ============================================================================

export function example3_GoalDrivenDecisions(): void {
  console.log('='.repeat(80));
  console.log('EXAMPLE 3: Goal-Driven Decision Making');
  console.log('='.repeat(80));
  console.log();

  const personality = PersonalitySystem.createPersonality('grinder');
  const engine = new DecisionEngine(personality);

  // Scenario 1: Wealth goal
  const wealthContext: GameContext = {
    ...createSampleContext(),
    goals: [
      {
        id: 'get_rich',
        name: 'Earn 1000 Gold',
        type: 'wealth',
        priority: 10,
        progress: 0.2,
        target: 1000,
        active: true,
      },
    ],
  };

  const actions = filterActionsByContext(createDefaultActions(), wealthContext);
  const wealthChoice = engine.selectAction(actions, wealthContext);

  console.log('Scenario 1: High-priority wealth goal');
  console.log(`  Active Goal: ${wealthContext.goals[0].name} (Priority: ${wealthContext.goals[0].priority})`);
  console.log(`  Decision: ${wealthChoice.name}`);
  console.log();

  // Scenario 2: Combat mastery goal
  const combatContext: GameContext = {
    ...createSampleContext(),
    goals: [
      {
        id: 'combat_master',
        name: 'Become Combat Master',
        type: 'combat',
        priority: 10,
        progress: 0.1,
        active: true,
        relatedActions: ['combat_bandit', 'combat_duel', 'combat_boss', 'train_combat'],
      },
    ],
  };

  const combatChoice = engine.selectAction(actions, combatContext);

  console.log('Scenario 2: High-priority combat goal');
  console.log(`  Active Goal: ${combatContext.goals[0].name} (Priority: ${combatContext.goals[0].priority})`);
  console.log(`  Decision: ${combatChoice.name}`);
  console.log();

  // Scenario 3: Multiple competing goals
  const multiGoalContext: GameContext = {
    ...createSampleContext(),
    goals: [
      {
        id: 'wealth',
        name: 'Get Rich',
        type: 'wealth',
        priority: 5,
        progress: 0.5,
        active: true,
      },
      {
        id: 'combat',
        name: 'Combat Training',
        type: 'combat',
        priority: 8,
        progress: 0.2,
        active: true,
      },
      {
        id: 'social',
        name: 'Make Friends',
        type: 'social',
        priority: 3,
        progress: 0.7,
        active: true,
      },
    ],
  };

  const multiChoice = engine.selectAction(actions, multiGoalContext);

  console.log('Scenario 3: Multiple competing goals');
  multiGoalContext.goals.forEach(g => {
    console.log(`  - ${g.name}: Priority ${g.priority}, Progress ${(g.progress * 100).toFixed(0)}%`);
  });
  console.log(`  Decision: ${multiChoice.name}`);
  console.log('  Rationale: Engine prioritizes high-priority, low-progress goals');
  console.log();
}

// ============================================================================
// EXAMPLE 4: Risk Assessment
// ============================================================================

export function example4_RiskAssessment(): void {
  console.log('='.repeat(80));
  console.log('EXAMPLE 4: Risk Assessment by Different Personalities');
  console.log('='.repeat(80));
  console.log();

  const context = createSampleContext();

  // High-risk actions only
  const riskyActions = createDefaultActions().filter(a => a.risk > 0.7);

  console.log('Available high-risk actions:');
  riskyActions.forEach(a => {
    console.log(`  - ${a.name} (Risk: ${(a.risk * 100).toFixed(0)}%, Reward: ${a.expectedReward})`);
  });
  console.log();

  // Test with different personalities
  const personalities = [
    { archetype: 'grinder', riskTolerance: 0.2 },
    { archetype: 'combat', riskTolerance: 0.85 },
    { archetype: 'criminal', riskTolerance: 0.9 },
  ];

  personalities.forEach(({ archetype, riskTolerance }) => {
    const personality = PersonalitySystem.createPersonality(archetype);
    const engine = new DecisionEngine(personality);

    console.log(`${personality.name} (Risk Tolerance: ${(riskTolerance * 100).toFixed(0)}%)`);

    try {
      const choice = engine.selectAction(riskyActions, context);
      console.log(`  ✓ Willing to take risk: ${choice.name}`);
    } catch {
      console.log(`  ✗ Avoids all high-risk actions`);
    }
    console.log();
  });
}

// ============================================================================
// EXAMPLE 5: Resource Management
// ============================================================================

export function example5_ResourceManagement(): void {
  console.log('='.repeat(80));
  console.log('EXAMPLE 5: Resource Management Decisions');
  console.log('='.repeat(80));
  console.log();

  const personality = PersonalitySystem.createPersonality('grinder');
  const engine = new DecisionEngine(personality);

  // Scenario 1: High energy
  console.log('Scenario 1: High Energy (80/100)');
  const highEnergyContext: GameContext = {
    ...createSampleContext(),
    character: {
      ...createSampleContext().character,
      energy: 80,
    },
  };

  const actions = createDefaultActions();
  const highEnergyChoice = engine.selectAction(
    filterActionsByContext(actions, highEnergyContext),
    highEnergyContext
  );

  console.log(`  Decision: ${highEnergyChoice.name} (Cost: ${highEnergyChoice.energyCost} energy)`);
  console.log('  Rationale: Plenty of energy, can afford costly actions');
  console.log();

  // Scenario 2: Low energy
  console.log('Scenario 2: Low Energy (15/100)');
  const lowEnergyContext: GameContext = {
    ...createSampleContext(),
    character: {
      ...createSampleContext().character,
      energy: 15,
    },
  };

  const lowEnergyChoice = engine.selectAction(
    filterActionsByContext(actions, lowEnergyContext),
    lowEnergyContext
  );

  console.log(`  Decision: ${lowEnergyChoice.name} (Cost: ${lowEnergyChoice.energyCost} energy)`);
  console.log('  Rationale: Low energy, must conserve or rest');
  console.log();

  // Scenario 3: High gold
  console.log('Scenario 3: Rich (500 gold)');
  const richContext: GameContext = {
    ...createSampleContext(),
    character: {
      ...createSampleContext().character,
      gold: 500,
    },
  };

  const richChoice = engine.selectAction(
    filterActionsByContext(actions, richContext),
    richContext
  );

  console.log(`  Decision: ${richChoice.name}`);
  console.log('  Rationale: Can afford investments and upgrades');
  console.log();

  // Scenario 4: Poor
  console.log('Scenario 4: Poor (10 gold)');
  const poorContext: GameContext = {
    ...createSampleContext(),
    character: {
      ...createSampleContext().character,
      gold: 10,
    },
  };

  const poorChoice = engine.selectAction(
    filterActionsByContext(actions, poorContext),
    poorContext
  );

  console.log(`  Decision: ${poorChoice.name}`);
  console.log('  Rationale: Need to earn gold, cannot spend');
  console.log();
}

// ============================================================================
// EXAMPLE 6: Historical Learning
// ============================================================================

export function example6_HistoricalLearning(): void {
  console.log('='.repeat(80));
  console.log('EXAMPLE 6: Learning from Historical Outcomes');
  console.log('='.repeat(80));
  console.log();

  const personality = PersonalitySystem.createPersonality('grinder');
  const engine = new DecisionEngine(personality);

  // Context with successful combat history
  const successfulCombatContext: GameContext = {
    ...createSampleContext(),
    memory: [
      {
        actionId: 'combat_bandit',
        actionType: 'combat',
        timestamp: Date.now() - 1000,
        success: true,
        actualReward: 55,
        energyCost: 15,
        goldCost: 0,
      },
      {
        actionId: 'combat_bandit',
        actionType: 'combat',
        timestamp: Date.now() - 2000,
        success: true,
        actualReward: 52,
        energyCost: 15,
        goldCost: 0,
      },
      {
        actionId: 'combat_bandit',
        actionType: 'combat',
        timestamp: Date.now() - 3000,
        success: true,
        actualReward: 48,
        energyCost: 15,
        goldCost: 0,
      },
    ],
  };

  const actions = createDefaultActions();
  const combatActions = actions.filter(a => a.type === 'combat');

  console.log('Context: 3 successful combat encounters (100% success rate)');
  const choice1 = engine.selectAction(
    filterActionsByContext(actions, successfulCombatContext),
    successfulCombatContext
  );
  console.log(`  Decision: ${choice1.name}`);
  console.log('  Rationale: Historical success boosts combat action scores');
  console.log();

  // Context with failed crime history
  const failedCrimeContext: GameContext = {
    ...createSampleContext(),
    memory: [
      {
        actionId: 'crime_robbery',
        actionType: 'crime',
        timestamp: Date.now() - 1000,
        success: false,
        actualReward: 0,
        energyCost: 18,
        goldCost: 0,
      },
      {
        actionId: 'crime_robbery',
        actionType: 'crime',
        timestamp: Date.now() - 2000,
        success: false,
        actualReward: 0,
        energyCost: 18,
        goldCost: 0,
      },
      {
        actionId: 'crime_pickpocket',
        actionType: 'crime',
        timestamp: Date.now() - 3000,
        success: false,
        actualReward: 0,
        energyCost: 5,
        goldCost: 0,
      },
    ],
  };

  console.log('Context: 3 failed crime attempts (0% success rate)');
  const choice2 = engine.selectAction(
    filterActionsByContext(actions, failedCrimeContext),
    failedCrimeContext
  );
  console.log(`  Decision: ${choice2.name}`);
  console.log('  Rationale: Historical failure penalizes crime actions');
  console.log();
}

// ============================================================================
// EXAMPLE 7: Situational Awareness
// ============================================================================

export function example7_SituationalAwareness(): void {
  console.log('='.repeat(80));
  console.log('EXAMPLE 7: Situational Awareness (Time, Events, Location)');
  console.log('='.repeat(80));
  console.log();

  const personality = PersonalitySystem.createPersonality('grinder');
  const engine = new DecisionEngine(personality);

  const actions = createDefaultActions();

  // Scenario 1: Night time
  console.log('Scenario 1: Night Time');
  const nightContext: GameContext = {
    ...createSampleContext(),
    world: {
      ...createSampleContext().world,
      timeOfDay: 'night',
    },
  };

  const nightChoice = engine.selectAction(
    filterActionsByContext(actions, nightContext),
    nightContext
  );

  console.log(`  Time: Night`);
  console.log(`  Decision: ${nightChoice.name}`);
  console.log('  Rationale: Some actions (like crimes) favor night time');
  console.log();

  // Scenario 2: Active events
  console.log('Scenario 2: Gold Rush Event Active');
  const eventContext: GameContext = {
    ...createSampleContext(),
    world: {
      ...createSampleContext().world,
      activeEvents: ['gold_rush'],
    },
  };

  const eventChoice = engine.selectAction(
    filterActionsByContext(actions, eventContext),
    eventContext
  );

  console.log(`  Active Events: ${eventContext.world.activeEvents.join(', ')}`);
  console.log(`  Decision: ${eventChoice.name}`);
  console.log('  Rationale: Engine boosts actions related to active events');
  console.log();

  // Scenario 3: High server population
  console.log('Scenario 3: High Server Population');
  const populationContext: GameContext = {
    ...createSampleContext(),
    world: {
      ...createSampleContext().world,
      population: 'high',
    },
  };

  const popChoice = engine.selectAction(
    filterActionsByContext(actions, populationContext),
    populationContext
  );

  console.log(`  Population: High`);
  console.log(`  Decision: ${popChoice.name}`);
  console.log('  Rationale: High population favors social/PvP actions');
  console.log();
}

// ============================================================================
// EXAMPLE 8: Detailed Analysis
// ============================================================================

export function example8_DetailedAnalysis(): void {
  console.log('='.repeat(80));
  console.log('EXAMPLE 8: Detailed Decision Analysis');
  console.log('='.repeat(80));
  console.log();

  const personality = PersonalitySystem.createPersonality('combat');
  const engine = new DecisionEngine(personality, { debug: false });

  const context = createSampleContext();
  const actions = filterActionsByContext(createDefaultActions(), context);

  // Get all scored actions
  const scoredActions = engine.getAllActionScores(actions, context);

  // Show detailed explanation
  console.log(explainDecision(scoredActions));
}

// ============================================================================
// EXAMPLE 9: Explorer Archetype (Avoids Repetition)
// ============================================================================

export function example9_ExplorerBehavior(): void {
  console.log('='.repeat(80));
  console.log('EXAMPLE 9: Explorer Archetype - Avoiding Repetition');
  console.log('='.repeat(80));
  console.log();

  const personality = PersonalitySystem.createPersonality('explorer');
  const engine = new DecisionEngine(personality);

  const context: GameContext = {
    ...createSampleContext(),
    recentActions: ['combat_bandit', 'job_sheriff', 'combat_bandit'],
  };

  const actions = filterActionsByContext(createDefaultActions(), context);

  console.log(`Personality: ${personality.name}`);
  console.log(`Recent Actions: ${context.recentActions.join(', ')}`);
  console.log();

  // Make several decisions
  console.log('Making 5 consecutive decisions:');
  for (let i = 0; i < 5; i++) {
    const choice = engine.selectAction(actions, context);
    console.log(`  ${i + 1}. ${choice.name}`);

    // Update recent actions
    context.recentActions = context.recentActions || [];
    context.recentActions.push(choice.id);
    if (context.recentActions.length > 5) {
      context.recentActions.shift();
    }
  }

  console.log();
  console.log('Notice: Explorer rarely repeats the same action');
  console.log();
}

// ============================================================================
// EXAMPLE 10: Grinder Archetype (Loves Repetition)
// ============================================================================

export function example10_GrinderBehavior(): void {
  console.log('='.repeat(80));
  console.log('EXAMPLE 10: Grinder Archetype - Efficient Repetition');
  console.log('='.repeat(80));
  console.log();

  const personality = PersonalitySystem.createPersonality('grinder');
  const engine = new DecisionEngine(personality);

  const context: GameContext = {
    ...createSampleContext(),
    recentActions: [],
  };

  const actions = filterActionsByContext(createDefaultActions(), context);

  console.log(`Personality: ${personality.name}`);
  console.log();

  // Make several decisions
  console.log('Making 10 consecutive decisions:');
  const actionCounts: Record<string, number> = {};

  for (let i = 0; i < 10; i++) {
    const choice = engine.selectAction(actions, context);

    actionCounts[choice.name] = (actionCounts[choice.name] || 0) + 1;

    console.log(`  ${i + 1}. ${choice.name}`);

    // Update recent actions
    context.recentActions = context.recentActions || [];
    context.recentActions.push(choice.id);
    if (context.recentActions.length > 5) {
      context.recentActions.shift();
    }
  }

  console.log();
  console.log('Action frequency:');
  Object.entries(actionCounts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([action, count]) => {
      console.log(`  ${action}: ${count} times`);
    });

  console.log();
  console.log('Notice: Grinder repeats efficient actions frequently');
  console.log();
}

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================

export function runAllExamples(): void {
  example1_BasicDecision();
  example2_PersonalityComparison();
  example3_GoalDrivenDecisions();
  example4_RiskAssessment();
  example5_ResourceManagement();
  example6_HistoricalLearning();
  example7_SituationalAwareness();
  example8_DetailedAnalysis();
  example9_ExplorerBehavior();
  example10_GrinderBehavior();

  console.log('='.repeat(80));
  console.log('ALL EXAMPLES COMPLETE');
  console.log('='.repeat(80));
}

// Run if executed directly
if (require.main === module) {
  runAllExamples();
}
