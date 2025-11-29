# DecisionEngine Quick Start Guide

**Version:** 1.0
**Date:** 2025-11-27
**Status:** Production Ready

---

## What is DecisionEngine?

DecisionEngine is an intelligent decision-making system for playtest bots that makes context-aware action selections based on:
- **Personality traits** (8 archetypes)
- **Active goals** (what the bot is trying to achieve)
- **Game state** (gold, energy, health, location, etc.)
- **Historical outcomes** (learning from past successes/failures)
- **Situational context** (time of day, events, population)
- **Resource efficiency** (reward-to-cost ratios)
- **Risk tolerance** (personality-based risk assessment)

**Result:** Bots feel intelligent and human-like, not random or robotic.

---

## Quick Start (5 Minutes)

### 1. Import Dependencies

```typescript
import { PersonalitySystem } from './intelligence/PersonalitySystem.js';
import {
  DecisionEngine,
  GameContext,
  GameAction,
  createDefaultActions,
  createSampleContext,
} from './intelligence/DecisionEngine.js';
```

### 2. Create a Bot with DecisionEngine

```typescript
class SmartBot extends BotBase {
  // Create personality and engine
  private personality = PersonalitySystem.createPersonality('grinder');
  private engine = new DecisionEngine(this.personality);

  async runBehaviorLoop(): Promise<void> {
    while (this.shouldContinue()) {
      // Build game context
      const context: GameContext = {
        character: {
          level: await this.getLevel(),
          gold: await this.getGold(),
          energy: await this.getEnergy(),
          health: 100,
          skills: {},
          equipment: [],
          location: 'town',
        },
        world: {
          timeOfDay: 'afternoon',
          factionStandings: {},
          activeEvents: [],
        },
        goals: [
          {
            id: 'earn_gold',
            name: 'Get Rich',
            type: 'wealth',
            priority: 8,
            progress: 0.3,
            active: true,
          },
        ],
        memory: [],
        recentActions: [],
      };

      // Get available actions (simplified example)
      const actions = createDefaultActions();

      // Let engine decide what to do
      const choice = this.engine.selectAction(actions, context);

      // Execute the chosen action
      console.log(`Bot decided: ${choice.name}`);
      await this.performAction(choice);

      // Wait before next decision
      await this.waitRandom(10000, 30000);
    }
  }

  private async performAction(action: GameAction): Promise<void> {
    // Implement action execution here
    // Navigate to page, click buttons, etc.
  }
}
```

### 3. Run It

```typescript
const bot = new SmartBot({
  username: 'test-bot',
  headless: false,
});

await bot.start();
```

---

## Personality Archetypes

Choose a personality that matches your bot's intended behavior:

| Archetype | Behavior | Best For |
|-----------|----------|----------|
| **grinder** | Efficiency-focused, repeats profitable actions | Gold farming, leveling |
| **combat** | Aggressive, seeks fights and PvP | Combat testing |
| **social** | Community-focused, chat and friends | Social features |
| **explorer** | Curious, avoids repetition, tries everything | Feature discovery |
| **criminal** | High-risk, illegal activities | Crime system testing |
| **economist** | Patient trader, crafts for profit | Economy testing |
| **roleplayer** | Story-driven, immersive | Quest/lore testing |
| **chaos** | Completely random | Edge case testing |

---

## Defining Actions

Actions tell the engine what's possible. Each action has:

```typescript
const exampleAction: GameAction = {
  id: 'combat_bandit',           // Unique ID
  type: 'combat',                 // Category
  name: 'Fight Bandits',          // Display name
  energyCost: 15,                 // Energy required
  goldCost: 0,                    // Gold required
  expectedReward: 50,             // Expected reward value
  successProbability: 0.7,        // Chance of success (0-1)
  risk: 0.5,                      // Risk level (0-1)
  complexity: 5,                  // Complexity (1-10)
  requiresBrowser: true,          // Needs browser interaction
  contributesToGoal: ['combat'],  // Which goals it helps
  skillsImproved: ['combat'],     // Which skills it trains
};
```

### Quick Action Creation

```typescript
// Use default actions (26 pre-made actions)
const actions = createDefaultActions();

// Or create custom actions
const customActions: GameAction[] = [
  {
    id: 'rob_bank',
    type: 'crime',
    name: 'Rob the Bank',
    energyCost: 30,
    goldCost: 0,
    expectedReward: 500,
    successProbability: 0.3,
    risk: 0.95,
    complexity: 10,
    requiresBrowser: true,
    contributesToGoal: ['get_rich'],
  },
  // Add more...
];
```

---

## Setting Goals

Goals drive decisions. High-priority, incomplete goals dominate choices:

```typescript
const goals: Goal[] = [
  {
    id: 'wealth',
    name: 'Earn 1000 Gold',
    type: 'wealth',
    priority: 10,              // 1-10 (10 = highest)
    progress: 0.15,            // 0-1 (15% complete)
    target: 1000,              // Target value
    active: true,              // Is this goal active?
    relatedActions: ['job', 'crime', 'quest'],
  },
  {
    id: 'combat_master',
    name: 'Become Combat Master',
    type: 'combat',
    priority: 6,
    progress: 0.4,
    active: true,
  },
];
```

**Priority System:**
- Priority 10: Urgent, dominates all decisions
- Priority 7-9: Important, strong influence
- Priority 4-6: Moderate, considered
- Priority 1-3: Low, minor influence

**Progress System:**
- 0.0 = Not started (highest urgency)
- 0.5 = Half complete
- 1.0 = Complete (no longer influences decisions)

---

## Historical Learning

The engine learns from outcomes to make better decisions:

```typescript
const memory: ActionOutcome[] = [
  {
    actionId: 'combat_bandit',
    actionType: 'combat',
    timestamp: Date.now(),
    success: true,              // Did it succeed?
    actualReward: 55,           // Actual reward received
    energyCost: 15,             // Actual cost paid
    goldCost: 0,
  },
  // More outcomes...
];

// Engine will:
// - Boost actions with high success rates
// - Penalize actions with low success rates
// - Learn what works for this bot
```

---

## Configuration Options

Customize engine behavior:

```typescript
const engine = new DecisionEngine(personality, {
  debug: true,                  // Log detailed reasoning
  allowRisky: true,             // Allow high-risk actions
  minEnergyThreshold: 20,       // Don't act below this energy
  goalWeight: 1.5,              // Emphasize goals more
  efficiencyWeight: 0.8,        // Emphasize efficiency less
  randomVariance: 0.15,         // Human-like randomness (0-1)
  useHistory: true,             // Learn from past actions
  considerCombos: true,         // Detect action sequences
});
```

---

## Understanding Decisions

### Get Detailed Explanation

```typescript
const scoredActions = engine.getAllActionScores(actions, context);
console.log(explainDecision(scoredActions));
```

**Output:**
```
Selected: Fight Bandits
Score: 87.34
Reasoning: strongly aligns with active goals, matches Combat Enthusiast personality

Score Breakdown:
  Base Score: 45.00
  Goal Alignment: 50.00
  Resource Efficiency: 22.50
  Risk Adjustment: -5.00
  Personality Multiplier: 1.85x
  Historical Bonus: 10.00
  Situational Bonus: 0.00

Alternatives Considered:
  2. Mine for Gold (82.15): highly efficient reward-to-cost ratio
  3. Work as Deputy Sheriff (65.40): low-risk safe option
  4. Train Combat Skills (58.20): proven success in past attempts
```

---

## Common Patterns

### Pattern 1: Energy-Aware Bot

```typescript
const context: GameContext = {
  character: {
    energy: await this.getEnergy(),
    // If energy < 20, engine will favor low-cost actions
    // If energy < 10, engine will likely choose "Rest"
  },
  // ...
};
```

### Pattern 2: Time-Based Actions

```typescript
const nightActions = actions.filter(a =>
  a.availableTime?.includes('night')
);

const context: GameContext = {
  world: {
    timeOfDay: 'night', // Engine will prioritize night actions
  },
  // ...
};
```

### Pattern 3: Event-Driven Decisions

```typescript
const context: GameContext = {
  world: {
    activeEvents: ['gold_rush', 'gang_war'],
    // Engine boosts actions related to these events
  },
  // ...
};
```

### Pattern 4: Learning Bot

```typescript
// After each action, record the outcome
const outcome: ActionOutcome = {
  actionId: choice.id,
  actionType: choice.type,
  timestamp: Date.now(),
  success: didSucceed,
  actualReward: goldEarned,
  energyCost: energySpent,
  goldCost: goldSpent,
};

context.memory.push(outcome);

// Keep memory manageable (last 100 actions)
if (context.memory.length > 100) {
  context.memory.shift();
}
```

---

## Troubleshooting

### Problem: Bot Makes Random Decisions

**Solution:** Check goal alignment
```typescript
// Make sure goals are defined and have high priority
goals: [
  {
    id: 'main_goal',
    priority: 10,  // Use 8-10 for strong influence
    progress: 0.2, // Low progress = higher urgency
    active: true,  // Must be active!
  }
]
```

### Problem: Bot Never Takes Risks

**Solution:** Check personality risk tolerance
```typescript
// Grinder has low risk tolerance (0.2)
// Use Combat or Criminal for risk-taking
const personality = PersonalitySystem.createPersonality('combat');
// Risk tolerance: 0.85

// Or adjust options
const engine = new DecisionEngine(personality, {
  allowRisky: true,
});
```

### Problem: Bot Repeats Same Action

**Solution:** This might be intentional!
```typescript
// Grinder personality loves repetition (efficient)
// Use Explorer to avoid repetition
const personality = PersonalitySystem.createPersonality('explorer');

// Or track recent actions
context.recentActions = this.lastFiveActions;
// Explorer will avoid these automatically
```

### Problem: Engine Throws "No actions available"

**Solution:** Actions are filtered by viability
```typescript
// Check that actions are possible:
// - energyCost <= character.energy
// - goldCost <= character.gold
// - minLevel <= character.level
// - availableTime matches world.timeOfDay

// Use filterActionsByContext to see what's viable
const viable = filterActionsByContext(allActions, context);
console.log(`Viable actions: ${viable.length}`);
```

---

## Examples to Learn From

Run the examples to see the engine in action:

```typescript
import {
  example1_BasicDecision,
  example2_PersonalityComparison,
  example3_GoalDrivenDecisions,
  example4_RiskAssessment,
  example5_ResourceManagement,
  runAllExamples,
} from './examples/DecisionEngineExample.js';

// Run individual example
example1_BasicDecision();

// Or run all 10 examples
runAllExamples();
```

---

## Best Practices

### 1. **Define Clear Goals**
```typescript
// Good: Specific, measurable goal
{
  id: 'level_10',
  name: 'Reach Level 10',
  type: 'skills',
  priority: 9,
  progress: currentLevel / 10,
  target: 10,
}

// Bad: Vague goal
{
  name: 'Get Better',
  priority: 5,
  progress: 0.5,
}
```

### 2. **Update Context Frequently**
```typescript
// Update every decision cycle
context.character.energy = await this.getEnergy();
context.character.gold = await this.getGold();
context.world.timeOfDay = this.calculateTimeOfDay();
```

### 3. **Record All Outcomes**
```typescript
// Always record, even failures
const outcome = {
  actionId: choice.id,
  actionType: choice.type,
  timestamp: Date.now(),
  success: result.success,
  actualReward: result.reward || 0,
  energyCost: choice.energyCost,
  goldCost: choice.goldCost,
};
context.memory.push(outcome);
```

### 4. **Use Appropriate Personalities**
```typescript
// Match personality to test goal
const combatBot = new DecisionEngine(
  PersonalitySystem.createPersonality('combat')
);

const economyBot = new DecisionEngine(
  PersonalitySystem.createPersonality('economist')
);
```

### 5. **Enable Debug for Development**
```typescript
const engine = new DecisionEngine(personality, {
  debug: process.env.NODE_ENV === 'development',
});
```

---

## Next Steps

1. **Read the full report:** `DECISIONENGINE-COMPLETION-REPORT.md`
2. **Study examples:** `client/tests/playtests/examples/DecisionEngineExample.ts`
3. **Review source:** `client/tests/playtests/intelligence/DecisionEngine.ts`
4. **Integrate into bots:** Use the minimal integration example above
5. **Test different personalities:** See how each archetype behaves

---

## File Locations

```
client/tests/playtests/
├── intelligence/
│   ├── PersonalitySystem.ts        # 8 personality archetypes
│   └── DecisionEngine.ts           # Main decision engine (1,436 lines)
├── examples/
│   └── DecisionEngineExample.ts    # 10 usage examples (600+ lines)
└── bots/
    └── (your bots here - integrate DecisionEngine)
```

---

## Support

**Questions?** Check:
1. JSDoc comments in `DecisionEngine.ts`
2. 10 examples in `DecisionEngineExample.ts`
3. Full report in `DECISIONENGINE-COMPLETION-REPORT.md`

**Issues?** Common problems are in Troubleshooting section above.

---

**DecisionEngine is ready to make your bots smarter. Happy bot building!**
