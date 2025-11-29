# GoalManager System

## Overview

The **GoalManager** is a dynamic goal generation and tracking system that creates emergent, goal-oriented behavior for bot testing. It transforms bots from random action-takers into purposeful agents with coherent objectives and narrative arcs.

## Key Features

### 1. **14 Goal Types**
Comprehensive coverage of all game activities:
- `level_up` - Progress to specific character level
- `earn_gold` - Accumulate wealth
- `join_gang` - Find and join a gang
- `max_skill` - Master a specific skill
- `complete_quest` - Complete quest chains
- `win_duels` - PvP combat victories
- `unlock_location` - Travel and unlock new areas
- `craft_item` - Crafting objectives
- `make_friends` - Build social network
- `explore` - Visit multiple locations
- `buy_property` - Purchase equipment/property
- `achieve_rank` - Faction reputation goals
- `collect_items` - Item collection objectives
- `defeat_boss` - Boss encounter challenges

### 2. **Personality-Driven Goals**
Each archetype gets goals that match their playstyle:

| Archetype | Starter Goals | Behavior Pattern |
|-----------|---------------|------------------|
| **Grinder** | Level Up, Earn Gold, Max Skill | Efficiency-focused progression |
| **Social** | Make Friends, Join Gang | Community building |
| **Explorer** | Explore Locations, Unlock Areas | Discovery and variety |
| **Combat** | Win Duels, Max Combat Skill | Battle-focused challenges |
| **Economist** | Earn Gold, Craft Items, Buy Property | Wealth accumulation |
| **Criminal** | Earn Gold (via crimes), Max Stealth | High-risk activities |
| **Roleplayer** | Complete Quests, Join Gang, Achieve Rank | Story-driven progression |
| **Chaos** | Random mix | Unpredictable testing |

### 3. **Emergent Goal Chains**
Goals generate follow-up goals, creating narrative arcs:

```
Level Up (Level 5)
  ↓ (completes)
  ├─→ Max Skill (gunfighting)
  └─→ Earn Gold (500)
      ↓ (completes)
      └─→ Buy Property (weapon)
          ↓ (completes)
          └─→ Win Duels (10)
```

### 4. **Dynamic Priority Adjustment**
Goals adapt their priority based on:
- **Deadline Proximity**: Goals near deadline get +1 to +3 priority boost
- **Progress**: Goals >70% complete get priority boost
- **Stagnation**: Goals with no progress for 48+ hours lose priority

### 5. **Progress Tracking**
Each goal type has custom progress calculation:
- Level goals: `current_level / target_level`
- Gold goals: `(current - start) / (target - start)`
- Binary goals: `0.0` or `1.0` (completed/not completed)
- Collection goals: `items_collected / target_count`

## Architecture

### Core Interfaces

```typescript
interface Goal {
  id: string;
  type: GoalType;
  name: string;
  description: string;
  priority: number;      // 1-10
  target: any;           // Goal-specific target
  progress: number;      // 0-1
  deadline?: Date;
  followUpGoals?: Goal[];
  prerequisites?: string[];
  createdAt: Date;
  completedAt?: Date;
  metadata?: Record<string, any>;
}

interface GoalTemplate {
  type: GoalType;
  generateTarget: (context, personality) => any;
  calculateProgress: (goal, context) => number;
  getFollowUpGoals: (goal, context, personality) => Goal[];
  getBasePriority: (personality) => number;
}
```

### GoalManager Class

```typescript
class GoalManager {
  // Core Methods
  addGoal(goal: Goal): void
  updateProgress(context: GameContext): void
  getCurrentGoals(): Goal[]
  getTopGoal(): Goal | null

  // Decision Support
  doesActionContributeToGoals(actionType: string): boolean
  getRecommendedAction(): string | null

  // Statistics
  getStats(): GoalStats
  getCompletedGoals(): Goal[]
}
```

## Usage Examples

### Basic Usage

```typescript
import { GoalManager } from './GoalManager.js';
import { PersonalitySystem } from './PersonalitySystem.js';

// Create personality and goal manager
const personality = PersonalitySystem.createPersonality('grinder');
const goalManager = new GoalManager(personality);

// Initial goals are automatically created based on personality
console.log(goalManager.getCurrentGoals());
// Output:
// [
//   { name: "Reach Level 5", priority: 10, progress: 0 },
//   { name: "Earn 100 Gold", priority: 8, progress: 0 },
//   { name: "Master a skill", priority: 7, progress: 0 }
// ]
```

### Progress Updates

```typescript
// Game context from bot's current state
const context: GameContext = {
  character: {
    level: 3,
    gold: 75,
    skills: { gunfighting: 45 },
    // ... other properties
  }
};

// Update all goal progress
goalManager.updateProgress(context);

// Check updated progress
goalManager.getCurrentGoals().forEach(goal => {
  console.log(`${goal.name}: ${(goal.progress * 100).toFixed(1)}% complete`);
});
// Output:
// Reach Level 5: 60.0% complete
// Earn 100 Gold: 75.0% complete
// Master a skill: 45.0% complete
```

### Action Decision Making

```typescript
// Get top priority goal
const topGoal = goalManager.getTopGoal();
console.log(`Current focus: ${topGoal.name}`);

// Get recommended action
const action = goalManager.getRecommendedAction();
console.log(`Recommended: ${action}`);
// Output: "combat" or "skill_training" or "job"

// Check if specific action contributes to goals
if (goalManager.doesActionContributeToGoals('combat')) {
  console.log('Combat contributes to current goals');
}
```

### Goal Completion

```typescript
// When progress reaches 100%, goals auto-complete
const levelUpContext: GameContext = {
  character: { level: 5, gold: 100, /* ... */ }
};

goalManager.updateProgress(levelUpContext);

// Completed goals generate new goals
console.log(goalManager.getCompletedGoals());
// [{ name: "Reach Level 5", completedAt: "..." }]

console.log(goalManager.getCurrentGoals());
// New emergent goals:
// [
//   { name: "Master gunfighting", priority: 7 },
//   { name: "Earn 500 Gold", priority: 6 }
// ]
```

## Integration with Bot System

### Goal-Driven Bot Example

```typescript
class GoalDrivenBot extends BotBase {
  private goalManager: GoalManager;

  async runBehaviorLoop(): Promise<void> {
    while (this.shouldContinue()) {
      // Get current game state
      const context = await this.getGameContext();

      // Update goal progress
      this.goalManager.updateProgress(context);

      // Get recommended action
      const action = this.goalManager.getRecommendedAction();

      // Execute action
      await this.executeAction(action);

      // Log progress
      const topGoal = this.goalManager.getTopGoal();
      this.logger.info(
        `Working on: ${topGoal.name} ` +
        `(${(topGoal.progress * 100).toFixed(1)}% complete)`
      );
    }
  }
}
```

### Action Filtering

```typescript
// Filter available actions by goal relevance
const availableActions = await this.getAvailableActions();

const goalRelevantActions = availableActions.filter(action =>
  this.goalManager.doesActionContributeToGoals(action)
);

// Prioritize goal-relevant actions
if (goalRelevantActions.length > 0) {
  return goalRelevantActions[0];
} else {
  // Fallback to personality preferences
  return this.selectByPersonality(availableActions);
}
```

## Goal Templates Deep Dive

### Example: Level Up Template

```typescript
const LEVEL_UP_TEMPLATE: GoalTemplate = {
  type: 'level_up',

  // Generate target based on personality
  generateTarget: (context, personality) => {
    if (personality.archetype === 'grinder') {
      return context.character.level + 3; // Ambitious
    }
    return context.character.level + 1; // Incremental
  },

  // Calculate progress
  calculateProgress: (goal, context) => {
    return Math.min(1.0, context.character.level / goal.target);
  },

  // Generate follow-ups when completed
  getFollowUpGoals: (goal, context, personality) => {
    const goals = [];

    // Patient personalities upgrade skills
    if (personality.traits.patience > 0.6) {
      goals.push(createGoal('max_skill', {
        target: { skill: 'gunfighting', level: 100 },
        priority: 7
      }, personality));
    }

    // Greedy personalities earn gold
    if (personality.traits.greed > 0.6) {
      goals.push(createGoal('earn_gold', {
        target: context.character.level * 100,
        priority: 6
      }, personality));
    }

    return goals;
  },

  // Base priority by personality
  getBasePriority: (personality) => {
    if (personality.archetype === 'grinder') return 10;
    if (personality.archetype === 'combat') return 8;
    return 7;
  }
};
```

## Goal Statistics

Track bot performance through goal metrics:

```typescript
const stats = goalManager.getStats();

console.log(`
  Active Goals: ${stats.activeGoals}
  Completed Goals: ${stats.completedGoals}
  Completion Rate: ${(stats.completionRate * 100).toFixed(1)}%
  Average Priority: ${stats.averagePriority.toFixed(1)}
  Average Progress: ${(stats.averageProgress * 100).toFixed(1)}%
`);
```

## Advanced Features

### 1. Deadline Management

```typescript
// Create goal with deadline
const urgentGoal = createGoal('complete_quest', {
  target: { count: 1, type: 'urgent' },
  priority: 7,
  deadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
}, personality);

goalManager.addGoal(urgentGoal);

// Goals near deadline automatically boost priority
// < 24 hours: +3 priority
// < 48 hours: +2 priority
// < 72 hours: +1 priority
```

### 2. Goal Prerequisites

```typescript
// Define goal dependencies
const bossGoal = createGoal('defeat_boss', {
  target: { boss: 'final_boss' },
  priority: 8
}, personality);

bossGoal.prerequisites = ['max_skill_gunfighting', 'level_10'];

// Goal won't become active until prerequisites complete
```

### 3. Metadata Tracking

```typescript
// Store custom data with goals
const goldGoal = createGoal('earn_gold', {
  target: 1000,
  priority: 7,
  metadata: {
    startGold: context.character.gold,
    purpose: 'gang_contribution',
    method: 'preferred_crafting'
  }
}, personality);
```

## Personality-Specific Behavior

### Grinders
- Always generate new level_up goals after completing one
- Aim for +3 to +5 level jumps
- High priority on skill maxing and gold earning

### Explorers
- Never repeat same location twice in a row
- Generate exploration chains (explore → unlock → explore)
- Curiosity-driven quest selection

### Social Players
- After joining gang, generate gang quests and friend goals
- High priority on community activities
- Lower priority on solo grinding

### Combat Enthusiasts
- Combat goal chains (duels → gear upgrades → more duels)
- Boss defeat goals lead to harder bosses
- Weapon purchases trigger duel goals

### Economists
- Gold goals generate crafting goals
- Crafting goals generate more gold goals
- Reinvestment cycle creates wealth accumulation arc

## Testing Benefits

### 1. Coherent Bot Behavior
Bots pursue logical objective chains instead of random actions:
```
Random Bot: combat → chat → travel → combat → mail
Goal Bot:   combat → combat → upgrade → combat → level_check
```

### 2. Narrative Arcs
Goal chains create story-like progression:
```
Join Gang → Make Friends → Complete Gang Quest →
Earn Gold → Contribute to Gang → Achieve Rank
```

### 3. Realistic Diversity
8 archetypes × goal variations = hundreds of unique behavior patterns

### 4. Measurable Progress
Track bot effectiveness through goal completion rates

### 5. Edge Case Discovery
Goals push bots to explore all game systems systematically

## Configuration

### Adjusting Goal Generation

Modify goal templates to change behavior:

```typescript
// Make grinders more ambitious
LEVEL_UP_TEMPLATE.generateTarget = (context, personality) => {
  if (personality.archetype === 'grinder') {
    return context.character.level + 10; // Very ambitious
  }
  return context.character.level + 1;
};

// Adjust priority ranges
EARN_GOLD_TEMPLATE.getBasePriority = (personality) => {
  if (personality.archetype === 'economist') return 10;
  if (personality.traits.greed > 0.8) return 9; // New threshold
  return 6;
};
```

### Custom Goal Types

Add new goal types by:
1. Adding to `GoalType` union
2. Creating template with required methods
3. Registering in `GOAL_TEMPLATES`

```typescript
const CUSTOM_TEMPLATE: GoalTemplate = {
  type: 'my_custom_goal',
  generateTarget: (context, personality) => { /* ... */ },
  calculateProgress: (goal, context) => { /* ... */ },
  getFollowUpGoals: (goal, context, personality) => [],
  getBasePriority: (personality) => 5
};

GOAL_TEMPLATES['my_custom_goal'] = CUSTOM_TEMPLATE;
```

## Troubleshooting

### Goals Not Progressing
- Verify `GameContext` is being updated correctly
- Check `calculateProgress` logic for goal type
- Ensure actions map to goal types in `doesActionContributeToGoal`

### Too Many/Few Goals
- Adjust `getFollowUpGoals` in templates
- Modify personality-driven generation in `generatePersonalityGoals`
- Set stricter completion conditions

### Priority Conflicts
- Review `adjustPriority` logic
- Check `getBasePriority` values across templates
- Consider deadline impact on priority

## Performance Considerations

- **Memory**: ~1KB per goal, ~10-20 active goals per bot = minimal
- **CPU**: `updateProgress` is O(n) where n = active goals (typically <20)
- **Optimization**: Goals auto-complete and remove from active list

## Files

- `GoalManager.ts` - Core system (1000+ lines)
- `GoalManager.example.ts` - Usage examples and full bot integration
- `GoalManager.README.md` - This documentation

## Next Steps

1. **Integrate with existing bots** - Add GoalManager to CombatBot, EconomyBot, SocialBot
2. **Extend goal types** - Add game-specific goals (territory control, gang wars, etc.)
3. **Analytics** - Track goal completion patterns across bot populations
4. **Visualization** - Create goal tree visualizer for debugging
5. **Machine Learning** - Use goal completion data to optimize templates

## Examples

Run the examples file to see GoalManager in action:

```bash
npx tsx client/tests/playtests/intelligence/GoalManager.example.ts
```

This will demonstrate:
- Basic goal creation and tracking
- Goal completion chains
- Personality-driven generation
- Action filtering
- Dynamic priority adjustment
- Full bot simulation (5 cycles)

---

**Agent 7 - Week 3-4 Completion**
GoalManager provides the "why" behind bot actions, transforming random behavior into purposeful progression with emergent narrative arcs.
