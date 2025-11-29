/**
 * BotMemoryExample.ts
 *
 * Demonstration of BotMemory system capabilities
 * Shows how bots learn from experience and improve over time
 */

import { BotMemory, ActionOutcome, GameContext } from './BotMemory';

/**
 * Simulate a combat action with realistic outcomes
 */
function simulateCombat(context: GameContext): ActionOutcome {
  const healthFactor = context.character.health / 100;
  const energyFactor = context.character.energy / 100;
  const equipmentBonus = (context.character.equipment?.length || 0) > 0 ? 0.2 : 0;

  // Success probability based on context
  const baseSuccessChance = 0.5;
  const successChance = Math.min(0.95,
    baseSuccessChance +
    (healthFactor * 0.2) +
    (energyFactor * 0.15) +
    equipmentBonus
  );

  const success = Math.random() < successChance;

  return {
    id: `combat-${Date.now()}-${Math.random()}`,
    action: { type: 'combat', target: 'bandit' },
    timestamp: new Date(),
    success,
    reward: success ? 30 + Math.floor(Math.random() * 40) : 0,
    cost: 15,
    context: { ...context },
    duration: 2000 + Math.floor(Math.random() * 1000)
  };
}

/**
 * Simulate a job action
 */
function simulateJob(context: GameContext): ActionOutcome {
  const energyFactor = context.character.energy / 100;
  const timeBonus = context.timeOfDay === 'morning' ? 0.2 : 0;

  const successChance = Math.min(0.95, 0.7 + (energyFactor * 0.15) + timeBonus);
  const success = Math.random() < successChance;

  return {
    id: `job-${Date.now()}-${Math.random()}`,
    action: { type: 'job', params: { jobType: 'general' } },
    timestamp: new Date(),
    success,
    reward: success ? 20 + Math.floor(Math.random() * 20) : 0,
    cost: 10,
    context: { ...context },
    duration: 1500 + Math.floor(Math.random() * 500)
  };
}

/**
 * Simulate a crime action
 */
function simulateCrime(context: GameContext): ActionOutcome {
  const levelBonus = Math.min(0.3, context.character.level * 0.05);
  const locationBonus = context.location === 'bank' ? 0.3 : 0;

  const successChance = 0.4 + levelBonus + locationBonus;
  const success = Math.random() < successChance;

  return {
    id: `crime-${Date.now()}-${Math.random()}`,
    action: { type: 'crime', params: { crimeType: 'robbery' } },
    timestamp: new Date(),
    success,
    reward: success ? 50 + Math.floor(Math.random() * 100) : 0,
    cost: 20,
    context: { ...context },
    duration: 3000 + Math.floor(Math.random() * 2000),
    error: !success ? 'Caught by sheriff' : undefined
  };
}

/**
 * Run basic learning demonstration
 */
function demonstrateBasicLearning() {
  console.log('\n=== BASIC LEARNING DEMONSTRATION ===\n');

  const memory = new BotMemory();

  // Simulate 100 actions with varying contexts
  for (let i = 0; i < 100; i++) {
    const context: GameContext = {
      character: {
        health: 50 + Math.floor(Math.random() * 50),
        energy: 30 + Math.floor(Math.random() * 70),
        gold: 100 + i * 10,
        level: 1 + Math.floor(i / 20)
      },
      location: Math.random() > 0.5 ? 'saloon' : 'bank',
      timeOfDay: ['morning', 'afternoon', 'evening', 'night'][Math.floor(Math.random() * 4)] as any
    };

    // Choose random action
    const actionType = Math.random();
    let outcome: ActionOutcome;

    if (actionType < 0.4) {
      outcome = simulateCombat(context);
    } else if (actionType < 0.7) {
      outcome = simulateJob(context);
    } else {
      outcome = simulateCrime(context);
    }

    memory.recordOutcome(outcome);
  }

  // Show what was learned
  const stats = memory.getStats();
  console.log('PERFORMANCE STATS:');
  console.log(`- Total Actions: ${stats.totalActions}`);
  console.log(`- Success Rate: ${(stats.averageSuccessRate * 100).toFixed(1)}%`);
  console.log(`- Total Rewards: ${stats.totalReward.toFixed(0)} gold`);
  console.log(`- Total Costs: ${stats.totalCost.toFixed(0)} energy`);
  console.log(`- Trend: ${stats.recentTrend}`);
  console.log(`- Best Action: ${stats.bestAction}`);
  console.log(`- Worst Action: ${stats.worstAction}`);

  console.log('\nACTION BREAKDOWN:');
  for (const [action, breakdown] of Object.entries(stats.actionBreakdown)) {
    console.log(`- ${action}:`);
    console.log(`  - Count: ${breakdown.count}`);
    console.log(`  - Success Rate: ${(breakdown.successRate * 100).toFixed(1)}%`);
    console.log(`  - Avg Reward: ${breakdown.averageReward.toFixed(1)} gold`);
    console.log(`  - Efficiency: ${breakdown.efficiency.toFixed(2)} gold/energy`);
  }

  console.log('\nCONFIDENT PATTERNS DISCOVERED:');
  const patterns = memory.getConfidentPatterns(0.6);
  patterns.slice(0, 5).forEach(p => {
    console.log(`- ${p.pattern}:`);
    console.log(`  Success: ${(p.successRate * 100).toFixed(1)}%`);
    console.log(`  Confidence: ${(p.confidence * 100).toFixed(0)}%`);
    console.log(`  Trend: ${p.trend}`);
  });
}

/**
 * Demonstrate pattern recognition
 */
function demonstratePatternRecognition() {
  console.log('\n=== PATTERN RECOGNITION DEMONSTRATION ===\n');

  const memory = new BotMemory();

  console.log('Training: 50 combat actions at different health levels...\n');

  // Deliberately create pattern: combat fails at low health
  for (let i = 0; i < 50; i++) {
    const health = i < 25 ? 20 + Math.random() * 20 : 60 + Math.random() * 40;
    const context: GameContext = {
      character: {
        health,
        energy: 50,
        gold: 100,
        level: 5
      },
      timeOfDay: 'afternoon'
    };

    // Low health = very likely to fail
    const successChance = health < 40 ? 0.2 : 0.8;
    const success = Math.random() < successChance;

    memory.recordOutcome({
      id: `combat-${i}`,
      action: { type: 'combat' },
      timestamp: new Date(),
      success,
      reward: success ? 40 : 0,
      cost: 15,
      context,
      duration: 2000
    });
  }

  // Test recommendation at low health
  const lowHealthContext: GameContext = {
    character: { health: 25, energy: 50, gold: 100, level: 5 },
    timeOfDay: 'afternoon'
  };

  const recommendation = memory.getRecommendation(lowHealthContext);
  console.log(`Recommendation at 25 health: ${recommendation}`);

  if (recommendation === 'avoid_combat_low_health') {
    console.log('✅ Bot learned to avoid combat at low health!');
  }

  // Test recommendation at high health
  const highHealthContext: GameContext = {
    character: { health: 90, energy: 50, gold: 100, level: 5 },
    timeOfDay: 'afternoon'
  };

  const recommendation2 = memory.getRecommendation(highHealthContext);
  console.log(`Recommendation at 90 health: ${recommendation2 || 'No specific recommendation'}`);

  // Show learned patterns
  console.log('\nLearned Patterns:');
  const patterns = memory.getConfidentPatterns(0.5);
  patterns.forEach(p => {
    if (p.pattern.includes('combat_health')) {
      console.log(`- ${p.pattern}: ${(p.successRate * 100).toFixed(1)}% success`);
    }
  });
}

/**
 * Demonstrate temporal patterns
 */
function demonstrateTemporalPatterns() {
  console.log('\n=== TEMPORAL PATTERN DEMONSTRATION ===\n');

  const memory = new BotMemory();

  console.log('Training: Jobs are better in morning, combat better at night...\n');

  // Create temporal patterns
  for (let i = 0; i < 100; i++) {
    const timeOfDay = ['morning', 'afternoon', 'evening', 'night'][i % 4] as any;

    const context: GameContext = {
      character: { health: 80, energy: 60, gold: 100, level: 5 },
      timeOfDay
    };

    // Jobs succeed more in morning
    if (i % 2 === 0) {
      const successChance = timeOfDay === 'morning' ? 0.9 : 0.5;
      memory.recordOutcome({
        id: `job-${i}`,
        action: { type: 'job' },
        timestamp: new Date(),
        success: Math.random() < successChance,
        reward: 30,
        cost: 10,
        context,
        duration: 1500
      });
    }
    // Combat succeeds more at night
    else {
      const successChance = timeOfDay === 'night' ? 0.85 : 0.5;
      memory.recordOutcome({
        id: `combat-${i}`,
        action: { type: 'combat' },
        timestamp: new Date(),
        success: Math.random() < successChance,
        reward: 40,
        cost: 15,
        context,
        duration: 2000
      });
    }
  }

  const insights = memory.getTemporalInsights();

  console.log('Best Time for Each Action:');
  insights.bestTimeForAction.forEach((time, action) => {
    console.log(`- ${action}: ${time}`);
  });

  console.log('\nActions by Time of Day:');
  insights.actionsByTimeOfDay.forEach((actions, time) => {
    console.log(`- ${time}: ${actions.join(', ')}`);
  });
}

/**
 * Demonstrate combo learning
 */
function demonstrateComboLearning() {
  console.log('\n=== COMBO LEARNING DEMONSTRATION ===\n');

  const memory = new BotMemory();

  console.log('Training: job -> upgrade -> combat combo is effective...\n');

  // Create successful combo pattern
  for (let i = 0; i < 20; i++) {
    const context: GameContext = {
      character: { health: 80, energy: 60, gold: 100 + i * 50, level: 5 },
      timeOfDay: 'afternoon',
      recentActions: i > 0 ? ['job', 'upgrade'] : []
    };

    // Job
    memory.recordOutcome({
      id: `job-${i}`,
      action: { type: 'job' },
      timestamp: new Date(),
      success: true,
      reward: 30,
      cost: 10,
      context: { ...context, recentActions: [] },
      duration: 1500
    });

    // Upgrade
    memory.recordOutcome({
      id: `upgrade-${i}`,
      action: { type: 'upgrade' },
      timestamp: new Date(),
      success: true,
      reward: 0,
      cost: 5,
      context: { ...context, recentActions: ['job'] },
      duration: 1000
    });

    // Combat (more successful after upgrade)
    memory.recordOutcome({
      id: `combat-${i}`,
      action: { type: 'combat' },
      timestamp: new Date(),
      success: Math.random() < 0.9, // Very high success after upgrade
      reward: 60,
      cost: 15,
      context: { ...context, recentActions: ['job', 'upgrade'] },
      duration: 2000
    });
  }

  // Also record some standalone combats with lower success
  for (let i = 0; i < 10; i++) {
    memory.recordOutcome({
      id: `solo-combat-${i}`,
      action: { type: 'combat' },
      timestamp: new Date(),
      success: Math.random() < 0.5, // Lower success without upgrade
      reward: 40,
      cost: 15,
      context: {
        character: { health: 80, energy: 60, gold: 100, level: 5 },
        timeOfDay: 'afternoon'
      },
      duration: 2000
    });
  }

  const combos = memory.getBestCombos(0.5);

  console.log('Learned Combos:');
  combos.forEach(c => {
    console.log(`- ${c.sequence.join(' → ')}:`);
    console.log(`  Success Rate: ${(c.successRate * 100).toFixed(1)}%`);
    console.log(`  Avg Reward: ${c.averageReward.toFixed(0)} gold`);
    console.log(`  Confidence: ${(c.confidence * 100).toFixed(0)}%`);
  });
}

/**
 * Demonstrate strategy adaptation
 */
function demonstrateStrategyAdaptation() {
  console.log('\n=== STRATEGY ADAPTATION DEMONSTRATION ===\n');

  const memory = new BotMemory();

  console.log('Phase 1: Successful strategy (80% success)...');

  // Phase 1: Things going well
  for (let i = 0; i < 20; i++) {
    memory.recordOutcome({
      id: `action-${i}`,
      action: { type: 'job' },
      timestamp: new Date(),
      success: Math.random() < 0.8,
      reward: 30,
      cost: 10,
      context: {
        character: { health: 80, energy: 60, gold: 100, level: 5 },
        timeOfDay: 'morning'
      },
      duration: 1500
    });
  }

  console.log(`Should adapt? ${memory.shouldAdaptStrategy() ? 'YES' : 'NO'}`);

  console.log('\nPhase 2: Strategy failing (30% success)...');

  // Phase 2: Strategy stops working
  for (let i = 0; i < 20; i++) {
    memory.recordOutcome({
      id: `action-${20 + i}`,
      action: { type: 'job' },
      timestamp: new Date(),
      success: Math.random() < 0.3, // Much lower success
      reward: 30,
      cost: 10,
      context: {
        character: { health: 80, energy: 60, gold: 100, level: 5 },
        timeOfDay: 'morning'
      },
      duration: 1500
    });
  }

  console.log(`Should adapt? ${memory.shouldAdaptStrategy() ? 'YES ✅' : 'NO'}`);

  const stats = memory.getStats();
  console.log(`\nOverall success: ${(stats.averageSuccessRate * 100).toFixed(1)}%`);
  console.log(`Trend: ${stats.recentTrend}`);
}

/**
 * Demonstrate efficiency optimization
 */
function demonstrateEfficiencyOptimization() {
  console.log('\n=== EFFICIENCY OPTIMIZATION DEMONSTRATION ===\n');

  const memory = new BotMemory();

  console.log('Training different action types...\n');

  // Jobs: Reliable but low reward
  for (let i = 0; i < 30; i++) {
    memory.recordOutcome({
      id: `job-${i}`,
      action: { type: 'job' },
      timestamp: new Date(),
      success: Math.random() < 0.85,
      reward: 25,
      cost: 10,
      context: {
        character: { health: 80, energy: 60, gold: 100, level: 5 },
        timeOfDay: 'morning'
      },
      duration: 1200
    });
  }

  // Combat: Medium reward, medium reliability
  for (let i = 0; i < 30; i++) {
    memory.recordOutcome({
      id: `combat-${i}`,
      action: { type: 'combat' },
      timestamp: new Date(),
      success: Math.random() < 0.65,
      reward: 50,
      cost: 15,
      context: {
        character: { health: 80, energy: 60, gold: 100, level: 5 },
        timeOfDay: 'afternoon'
      },
      duration: 2500
    });
  }

  // Crimes: High reward but risky
  for (let i = 0; i < 30; i++) {
    memory.recordOutcome({
      id: `crime-${i}`,
      action: { type: 'crime' },
      timestamp: new Date(),
      success: Math.random() < 0.45,
      reward: 100,
      cost: 20,
      context: {
        character: { health: 80, energy: 60, gold: 100, level: 5 },
        timeOfDay: 'night'
      },
      duration: 3000
    });
  }

  const efficient = memory.getMostEfficientActions();

  console.log('Most Efficient Actions:');
  console.log(`- By Gold/Energy: ${efficient.byGoldPerEnergy}`);
  console.log(`- By Gold/Minute: ${efficient.byGoldPerMinute}`);
  console.log(`- By Overall Score: ${efficient.byOverallScore}`);

  const stats = memory.getStats();
  console.log('\nDetailed Efficiency:');
  for (const [action, breakdown] of Object.entries(stats.actionBreakdown)) {
    console.log(`\n${action}:`);
    console.log(`  - Success Rate: ${(breakdown.successRate * 100).toFixed(1)}%`);
    console.log(`  - Avg Reward: ${breakdown.averageReward.toFixed(1)} gold`);
    console.log(`  - Avg Cost: ${breakdown.averageCost.toFixed(1)} energy`);
    console.log(`  - Efficiency: ${breakdown.efficiency.toFixed(2)} gold/energy`);
  }
}

/**
 * Generate comprehensive learning report
 */
function demonstrateLearningReport() {
  console.log('\n=== COMPREHENSIVE LEARNING REPORT ===\n');

  const memory = new BotMemory();

  // Simulate 200 varied actions
  const timesOfDay: Array<'morning' | 'afternoon' | 'evening' | 'night'> = ['morning', 'afternoon', 'evening', 'night'];

  for (let i = 0; i < 200; i++) {
    const context: GameContext = {
      character: {
        health: 40 + Math.floor(Math.random() * 60),
        energy: 30 + Math.floor(Math.random() * 70),
        gold: 100 + i * 20,
        level: 1 + Math.floor(i / 40),
        equipment: i > 100 ? ['pistol', 'hat'] : []
      },
      location: Math.random() > 0.5 ? 'saloon' : 'bank',
      timeOfDay: timesOfDay[i % 4]
    };

    const actionType = i % 3;
    let outcome: ActionOutcome;

    if (actionType === 0) {
      outcome = simulateCombat(context);
    } else if (actionType === 1) {
      outcome = simulateJob(context);
    } else {
      outcome = simulateCrime(context);
    }

    memory.recordOutcome(outcome);
  }

  // Generate and display report
  const report = memory.getLearningReport();
  console.log(report);
}

/**
 * Run all demonstrations
 */
export function runAllDemonstrations() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   BOT MEMORY SYSTEM DEMONSTRATIONS     ║');
  console.log('╚════════════════════════════════════════╝');

  demonstrateBasicLearning();
  demonstratePatternRecognition();
  demonstrateTemporalPatterns();
  demonstrateComboLearning();
  demonstrateStrategyAdaptation();
  demonstrateEfficiencyOptimization();
  demonstrateLearningReport();

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║        ALL DEMONSTRATIONS COMPLETE      ║');
  console.log('╚════════════════════════════════════════╝\n');
}

// Run if executed directly
if (require.main === module) {
  runAllDemonstrations();
}
