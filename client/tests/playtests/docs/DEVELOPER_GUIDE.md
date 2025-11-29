# Developer Guide - Playtest Bot System

**Version**: 2.0
**Last Updated**: November 2025
**Audience**: Developers extending the system

## Table of Contents

- [Getting Started](#getting-started)
- [Creating New Bot Types](#creating-new-bot-types)
- [Adding New Personalities](#adding-new-personalities)
- [Adding New Goal Types](#adding-new-goal-types)
- [Extending DecisionEngine](#extending-decisionengine)
- [Adding New Page Objects](#adding-new-page-objects)
- [Integrating New Game Systems](#integrating-new-game-systems)
- [Code Examples](#code-examples)
- [Testing Your Changes](#testing-your-changes)
- [Best Practices](#best-practices)

---

## Getting Started

### Development Environment Setup

```bash
# Clone the repository
git clone https://github.com/your-repo/desperados-destiny
cd desperados-destiny/client/tests/playtests

# Install dependencies
npm install

# Run TypeScript compiler in watch mode
npx tsc --watch

# Run a bot for testing
npx ts-node runPlaytests.ts combat
```

### Project Structure Familiarization

```
playtests/
├── bots/           # Your new bot goes here
├── intelligence/   # AI decision-making
├── social/         # Social behaviors
├── utils/          # Shared utilities
└── docs/           # Documentation
```

---

## Creating New Bot Types

### Step 1: Extend BotBase

Create `bots/MyNewBot.ts`:

```typescript
import { BotBase, BotConfig } from '../utils/BotBase.js';
import { PersonalitySystem } from '../intelligence/PersonalitySystem.js';
import { DecisionEngine } from '../intelligence/DecisionEngine.js';
import { GoalManager } from '../intelligence/GoalManager.js';

export class MyNewBot extends BotBase {
  private personality: PersonalityProfile;
  private decisionEngine: DecisionEngine;
  private goalManager: GoalManager;

  constructor(config: BotConfig) {
    super(config);

    // Create personality for this bot type
    this.personality = PersonalitySystem.createPersonality('grinder');

    // Initialize decision engine with personality
    this.decisionEngine = new DecisionEngine(this.personality, {
      debug: true,
      useHistory: true
    });

    // Initialize goal manager
    this.goalManager = new GoalManager(this.personality);
  }

  /**
   * Main behavior loop - REQUIRED
   * This is called repeatedly by BotBase
   */
  async runBehaviorLoop(): Promise<void> {
    this.logger.info('Starting behavior loop');

    let cycles = 0;
    const maxCycles = 1000;

    while (this.shouldContinue() && cycles < maxCycles) {
      cycles++;

      // 1. Get current game state
      const context = await this.getGameContext();

      // 2. Update goals with current state
      this.goalManager.updateProgress(context);

      // 3. Get available actions
      const availableActions = await this.getAvailableActions();

      // 4. Let decision engine choose best action
      const chosenAction = this.decisionEngine.selectAction(
        availableActions,
        context
      );

      // 5. Perform the action
      await this.performAction(chosenAction);

      // 6. Wait before next cycle (human-like delay)
      await this.waitRandom(10000, 30000);
    }

    this.logger.info(`Behavior loop complete. Cycles: ${cycles}`);
  }

  /**
   * Get current game context
   */
  private async getGameContext(): Promise<GameContext> {
    const gold = await this.getGold();
    const energy = await this.getEnergy();

    return {
      character: {
        level: 1,  // TODO: Get from page
        gold,
        energy,
        health: 100,  // TODO: Get from page
        skills: {},
        equipment: [],
        location: 'town',
      },
      world: {
        timeOfDay: 'afternoon',
        factionStandings: {},
        activeEvents: [],
      },
      goals: this.goalManager.getCurrentGoals(),
      memory: [],  // TODO: Integrate BotMemory
    };
  }

  /**
   * Get available actions for this bot
   */
  private async getAvailableActions(): Promise<GameAction[]> {
    // Define actions specific to this bot type
    return [
      {
        id: 'my_custom_action',
        type: 'custom',
        name: 'Do Custom Thing',
        energyCost: 10,
        goldCost: 0,
        expectedReward: 50,
        successProbability: 0.8,
        risk: 0.3,
        complexity: 5,
        requiresBrowser: true,
      },
      // Add more actions...
    ];
  }

  /**
   * Perform selected action
   */
  private async performAction(action: GameAction): Promise<void> {
    this.logger.action(`Performing: ${action.name}`);

    switch (action.type) {
      case 'custom':
        await this.doCustomAction();
        break;
      default:
        this.logger.warn(`Unknown action type: ${action.type}`);
    }

    this.metrics.recordAction(action.name);
  }

  /**
   * Custom action implementation
   */
  private async doCustomAction(): Promise<void> {
    // Navigate to page
    await this.navigateTo('My Page');

    // Perform action
    // Use page objects or selectors

    await this.waitRandom(1000, 2000);
  }
}
```

### Step 2: Add to Runner

Edit `runPlaytests.ts`:

```typescript
import { MyNewBot } from './bots/MyNewBot.js';

const botConfigs = {
  // ... existing configs
  mynew: {
    name: 'MyNewBot-Custom',
    username: 'playtest_mynew',
    email: 'mynew.bot@playtest.local',
    password: 'TestBot123!',
    characterName: 'CustomBot',
    headless: false,
    slowMo: 30,
  },
};

async function runMyNewBot(): Promise<void> {
  const bot = new MyNewBot(botConfigs.mynew);

  try {
    await bot.start();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Add to switch statement
switch (command) {
  case 'mynew':
    runMyNewBot();
    break;
  // ... existing cases
}
```

### Step 3: Test Your Bot

```bash
npm run playtest:mynew
# or
npx ts-node runPlaytests.ts mynew
```

---

## Adding New Personalities

### Step 1: Define Personality Profile

Edit `intelligence/PersonalitySystem.ts`:

```typescript
/**
 * The Risk-Seeker: High-risk, high-reward player
 */
const RISK_SEEKER_ARCHETYPE: PersonalityProfile = {
  archetype: 'risk_seeker',
  name: 'The Risk-Seeker',
  description: 'Takes calculated high-risk actions for maximum rewards',

  traits: {
    riskTolerance: 0.95,   // Extremely high risk tolerance
    sociability: 0.3,      // Somewhat isolated
    patience: 0.2,         // Impulsive
    greed: 0.9,            // Very profit-driven
    aggression: 0.8,       // Combative
    loyalty: 0.3,          // Low loyalty
    curiosity: 0.7,        // Exploratory
  },

  preferences: {
    preferredActivities: [
      'high_risk_crimes',
      'gambling',
      'dangerous_combat',
      'risky_investments',
      'pvp',
    ],
    avoidedActivities: [
      'safe_jobs',
      'grinding',
      'social_chat',
      'low_reward_activities',
    ],
    playStyle: 'chaotic',
  },
};
```

### Step 2: Add to Registry

```typescript
const ARCHETYPES: Record<string, PersonalityProfile> = {
  // ... existing archetypes
  risk_seeker: RISK_SEEKER_ARCHETYPE,
};
```

### Step 3: Use the Personality

```typescript
const personality = PersonalitySystem.createPersonality('risk_seeker');
const bot = new MyCombatBot(config, personality);
```

### Step 4: Test Personality Behavior

```typescript
// Create variant with slight modifications
const variant = PersonalitySystem.createVariant('risk_seeker');

// Test action selection
const actions = createDefaultActions();
const preferred = selectPreferredAction(actions, personality);

console.log(`Risk-seeker prefers: ${preferred}`);
```

---

## Adding New Goal Types

### Step 1: Define Goal Type

Edit `intelligence/GoalManager.ts`:

```typescript
export type GoalType =
  // ... existing types
  | 'reputation_master'  // New goal type
  | 'become_infamous';
```

### Step 2: Create Goal Template

```typescript
/**
 * Template for reputation_master goals
 */
const REPUTATION_MASTER_TEMPLATE: GoalTemplate = {
  type: 'reputation_master',

  generateTarget: (context, personality): any => {
    return {
      faction: 'outlaws',  // or based on personality
      reputation: 100,     // Maximum reputation
    };
  },

  calculateProgress: (goal, context): number => {
    const faction = goal.target.faction;
    const currentRep = context.character.reputation[faction] || 0;
    const targetRep = goal.target.reputation;

    return Math.min(1.0, currentRep / targetRep);
  },

  getFollowUpGoals: (goal, context, personality): Goal[] => {
    const goals: Goal[] = [];

    // After maxing one faction, work on another
    goals.push(createGoal('reputation_master', {
      target: { faction: 'merchants', reputation: 100 },
      priority: 7,
    }, personality));

    return goals;
  },

  getBasePriority: (personality): number => {
    if (personality.archetype === 'roleplayer') return 9;
    if (personality.traits.loyalty > 0.7) return 8;
    return 5;
  },
};
```

### Step 3: Register Template

```typescript
const GOAL_TEMPLATES: Record<GoalType, GoalTemplate> = {
  // ... existing templates
  reputation_master: REPUTATION_MASTER_TEMPLATE,
};
```

### Step 4: Add to Goal Names/Descriptions

```typescript
function generateGoalName(type: GoalType, target: any): string {
  const names: Record<GoalType, string> = {
    // ... existing names
    reputation_master: `Master ${target.faction} Reputation`,
  };
  return names[type] || `Unknown Goal`;
}

function generateGoalDescription(type: GoalType, target: any): string {
  const descriptions: Record<GoalType, string> = {
    // ... existing descriptions
    reputation_master: `Reach maximum reputation with ${target.faction}`,
  };
  return descriptions[type] || `Complete this goal`;
}
```

### Step 5: Use in Bot

```typescript
// Goals are automatically generated based on personality
// But you can also create manually:
const customGoal = createGoal('reputation_master', {
  target: { faction: 'outlaws', reputation: 100 },
  priority: 9,
}, personality);

goalManager.addGoal(customGoal);
```

---

## Extending DecisionEngine

### Adding New Scoring Factors

Edit `intelligence/DecisionEngine.ts`:

```typescript
/**
 * Calculate social bonus based on nearby players
 */
private calculateSocialBonus(action: GameAction, context: GameContext): number {
  let bonus = 0;

  // Social actions better with more players online
  if (action.type === 'social' && context.world.population === 'high') {
    bonus += 20;
  }

  // Gang actions better if in gang
  if (action.type === 'gang' && context.character.gang) {
    bonus += 15;
  }

  return bonus;
}
```

Then integrate into `scoreAction`:

```typescript
scoreAction(action: GameAction, context: GameContext): ScoredAction {
  // ... existing code

  const socialBonus = this.calculateSocialBonus(action, context);

  let totalScore = baseScore + goalAlignment + resourceEfficiency +
                   riskAdjustment + historicalBonus + situationalBonus +
                   socialBonus;  // Add new factor

  // ... rest of method
}
```

### Adding Custom Decision Logic

```typescript
/**
 * Override selectAction for custom logic
 */
class MyCustomDecisionEngine extends DecisionEngine {
  selectAction(availableActions: GameAction[], context: GameContext): GameAction {
    // Special case: Always rest if energy < 20
    if (context.character.energy < 20) {
      return availableActions.find(a => a.id === 'rest') || availableActions[0];
    }

    // Otherwise use parent logic
    return super.selectAction(availableActions, context);
  }
}
```

---

## Adding New Page Objects

### Step 1: Create Page Object Class

Edit `utils/PageObjects.ts`:

```typescript
/**
 * Reputation Page Object
 * Handles faction reputation interactions
 */
export class ReputationPage extends BasePage {
  private selectors = {
    factionTabs: ['Outlaws', 'Settlers', 'Merchants'],
    reputationDisplay: ['Reputation:', 'Standing:'],
    donatButton: ['Donate', 'Contribute'],
    completeQuestButton: ['Complete', 'Turn In'],
  };

  /**
   * Navigate to a specific faction tab
   */
  async selectFaction(faction: string): Promise<boolean> {
    return await clickButtonByText(this.page, faction);
  }

  /**
   * Get current reputation value
   */
  async getCurrentReputation(): Promise<number> {
    for (const selector of this.selectors.reputationDisplay) {
      const text = await getTextContent(this.page, selector);
      if (text) {
        const match = text.match(/(\d+)/);
        if (match) return parseInt(match[1]);
      }
    }
    return 0;
  }

  /**
   * Donate gold to faction
   */
  async donateGold(amount: number): Promise<boolean> {
    // Type amount
    await typeByPlaceholder(this.page, 'amount', amount.toString());

    // Click donate button
    return await clickButtonByText(this.page, ...this.selectors.donatButton);
  }

  /**
   * Complete a faction quest
   */
  async completeQuest(): Promise<boolean> {
    return await clickButtonByText(this.page, ...this.selectors.completeQuestButton);
  }
}
```

### Step 2: Export from index.ts

```typescript
export { ReputationPage } from './PageObjects.js';
```

### Step 3: Use in Bot

```typescript
import { ReputationPage } from '../utils/index.js';

class MyBot extends BotBase {
  private reputationPage: ReputationPage;

  constructor(config: BotConfig) {
    super(config);
    this.reputationPage = new ReputationPage(this.page!);
  }

  async improveFactionReputation(): Promise<void> {
    await this.navigateTo('Reputation');
    await this.reputationPage.selectFaction('Outlaws');

    const currentRep = await this.reputationPage.getCurrentReputation();
    console.log(`Current rep: ${currentRep}`);

    if (currentRep < 50) {
      await this.reputationPage.donateGold(100);
    }
  }
}
```

---

## Integrating New Game Systems

### Example: Adding Territory Control System

**Step 1: Add to GameContext**

```typescript
interface GameContext {
  character: {
    // ... existing fields
    territoriesControlled: string[];
  };
  world: {
    // ... existing fields
    availableTerritories: string[];
  };
}
```

**Step 2: Create Goal Type**

```typescript
| 'control_territory'  // New goal type
```

**Step 3: Create Actions**

```typescript
const actions: GameAction[] = [
  {
    id: 'capture_territory',
    type: 'territory',
    name: 'Capture Territory',
    energyCost: 30,
    goldCost: 100,
    expectedReward: 500,
    successProbability: 0.6,
    risk: 0.8,
    complexity: 9,
    requiresBrowser: true,
    contributesToGoal: ['control_territory'],
  },
  {
    id: 'defend_territory',
    type: 'territory',
    name: 'Defend Territory',
    energyCost: 20,
    goldCost: 0,
    expectedReward: 200,
    successProbability: 0.7,
    risk: 0.6,
    complexity: 7,
    requiresBrowser: true,
    contributesToGoal: ['control_territory'],
  },
];
```

**Step 4: Create Page Object**

```typescript
export class TerritoryPage extends BasePage {
  async captureTerritory(territoryName: string): Promise<boolean> {
    // Implementation
  }

  async defendTerritory(): Promise<boolean> {
    // Implementation
  }

  async getControlledTerritories(): Promise<string[]> {
    // Implementation
  }
}
```

**Step 5: Integrate into Bot**

```typescript
class TerritoryBot extends BotBase {
  private territoryPage: TerritoryPage;

  async runBehaviorLoop(): Promise<void> {
    // Use territoryPage to interact with system
  }
}
```

---

## Code Examples

### Complete Bot Example

See `examples/CompleteBot.example.ts` for a full working example.

### Decision Engine Example

```typescript
import { DecisionEngine, createDefaultActions, createSampleContext } from '../intelligence/DecisionEngine.js';
import { PersonalitySystem } from '../intelligence/PersonalitySystem.js';

// Create personality
const personality = PersonalitySystem.createPersonality('combat');

// Create decision engine
const engine = new DecisionEngine(personality, { debug: true });

// Get context
const context = createSampleContext();

// Get actions
const actions = createDefaultActions();

// Make decision
const chosen = engine.selectAction(actions, context);

console.log(`Chosen action: ${chosen.name}`);
```

### Goal Manager Example

```typescript
import { GoalManager } from '../intelligence/GoalManager.js';
import { PersonalitySystem } from '../intelligence/PersonalitySystem.js';

const personality = PersonalitySystem.createPersonality('grinder');
const goalManager = new GoalManager(personality);

// Goals are automatically initialized based on personality

// Update progress
goalManager.updateProgress(gameContext);

// Get top goal
const topGoal = goalManager.getTopGoal();
console.log(`Top goal: ${topGoal?.name}`);

// Get stats
const stats = goalManager.getStats();
console.log(`Completion rate: ${(stats.completionRate * 100).toFixed(1)}%`);
```

---

## Testing Your Changes

### Unit Testing

Create `tests/MyBot.test.ts`:

```typescript
import { MyNewBot } from '../bots/MyNewBot';

describe('MyNewBot', () => {
  it('should initialize correctly', () => {
    const bot = new MyNewBot({
      name: 'Test',
      username: 'test',
      email: 'test@test.com',
      password: 'test',
      characterName: 'TestChar',
    });

    expect(bot).toBeDefined();
  });

  // Add more tests
});
```

### Integration Testing

```bash
# Run bot for 5 cycles
npx ts-node runPlaytests.ts mynew

# Check logs
cat logs/MyNewBot-*.log

# Check metrics
cat data/MyNewBot-*-summary.json
```

### Manual Testing Checklist

- [ ] Bot starts successfully
- [ ] Login works
- [ ] Character selection works
- [ ] Actions are performed
- [ ] Metrics are recorded
- [ ] Logs are generated
- [ ] Bot stops gracefully
- [ ] No memory leaks (run for extended period)

---

## Best Practices

### Code Style

```typescript
// Use descriptive names
async performCombatAction() { }  // Good
async pca() { }  // Bad

// Add JSDoc comments
/**
 * Calculate damage dealt in combat
 * @param weapon - Weapon being used
 * @param skill - Combat skill level
 * @returns Damage amount
 */
calculateDamage(weapon: Weapon, skill: number): number { }

// Use TypeScript types
interface MyConfig {
  value: number;
}

// Not any
function doThing(config: MyConfig) { }  // Good
function doThing(config: any) { }  // Bad
```

### Error Handling

```typescript
try {
  await this.performAction();
} catch (error) {
  this.logger.error(`Action failed: ${error}`);
  // Don't crash - recover gracefully
  await this.handleError(error);
}
```

### Performance

```typescript
// Cache expensive operations
private cachedValue: number | null = null;

getValue(): number {
  if (this.cachedValue === null) {
    this.cachedValue = this.expensiveCalculation();
  }
  return this.cachedValue;
}

// Clean up resources
async cleanup() {
  await super.cleanup();
  // Clean up your resources
  this.cachedValue = null;
}
```

### Logging

```typescript
// Use appropriate log levels
this.logger.info('Starting action');       // General info
this.logger.action('Attacking bandit');   // Important actions
this.logger.decision('Chose combat');     // Decision-making
this.logger.goal('Progress: 50%');        // Goal updates
this.logger.error('Failed to attack');    // Errors
```

### Testing

```typescript
// Write testable code
// Bad: Hard to test
async doEverything() {
  const data = await fetchData();
  const processed = processData(data);
  await saveData(processed);
}

// Good: Easy to test each part
async fetchData(): Promise<Data> { }
processData(data: Data): ProcessedData { }
async saveData(data: ProcessedData): Promise<void> { }
```

---

## Next Steps

- Read [MAINTENANCE.md](./MAINTENANCE.md) for troubleshooting
- See [API_REFERENCE.md](./API_REFERENCE.md) for complete API docs
- Check [THEORY.md](./THEORY.md) for AI concepts

## Getting Help

- Check existing bots for examples
- Read inline code comments
- Consult API documentation
- Ask in team chat

Happy coding!
