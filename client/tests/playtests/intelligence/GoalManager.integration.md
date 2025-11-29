# GoalManager Integration Guide

## Overview

This guide shows how to integrate the GoalManager system into existing bot implementations to create goal-driven, purposeful behavior.

## Integration Steps

### Step 1: Import GoalManager

```typescript
import { GoalManager, GameContext } from './intelligence/GoalManager.js';
import { PersonalitySystem } from './intelligence/PersonalitySystem.js';
```

### Step 2: Add GoalManager to Bot Class

```typescript
export class CombatBot extends BotBase {
  private goalManager: GoalManager;
  private personality: PersonalityProfile;

  constructor(config: BotConfig) {
    super(config);

    // Create personality
    this.personality = PersonalitySystem.createPersonality('combat');

    // Initialize goal manager
    this.goalManager = new GoalManager(this.personality);

    this.logger.info(`GoalManager initialized with ${this.goalManager.getCurrentGoals().length} goals`);
  }
}
```

### Step 3: Create Game Context Builder

```typescript
/**
 * Build GameContext from current bot state
 */
private async buildGameContext(): Promise<GameContext> {
  // Get current character state from page
  const level = await this.getLevel();
  const gold = await this.getGold();
  const energy = await this.getEnergy();

  // Parse skills from page
  const skills = await this.parseSkills();

  // Get combat stats
  const combatStats = await this.parseCombatStats();

  return {
    character: {
      id: this.config.characterId || 'bot-character',
      name: this.config.username,
      level,
      gold,
      energy: {
        current: energy,
        max: 100, // Assuming max is 100
      },
      skills,
      location: await this.getCurrentLocation(),
      friends: await this.getFriendCount(),
      inventory: {
        items: await this.getInventoryItems(),
        count: await this.getInventoryCount(),
      },
      achievements: await this.getAchievements(),
      quests: {
        active: await this.getActiveQuests(),
        completed: await this.getCompletedQuests(),
      },
      combat: combatStats,
      exploration: {
        locationsVisited: await this.getVisitedLocations(),
        locationsUnlocked: await this.getUnlockedLocations(),
      },
      reputation: await this.getReputation(),
    },
  };
}
```

### Step 4: Update Main Behavior Loop

```typescript
async runBehaviorLoop(): Promise<void> {
  this.logger.info('Starting goal-driven behavior loop');

  let cycles = 0;
  const maxCycles = 1000;

  while (this.shouldContinue() && cycles < maxCycles) {
    cycles++;

    try {
      // Build current game context
      const context = await this.buildGameContext();

      // Update goal progress
      this.goalManager.updateProgress(context);

      // Log current focus
      const topGoal = this.goalManager.getTopGoal();
      if (topGoal) {
        this.logger.info(
          `Current goal: ${topGoal.name} ` +
          `(${(topGoal.progress * 100).toFixed(1)}% complete, ` +
          `priority: ${topGoal.priority})`
        );
      }

      // Get recommended action
      const recommendedAction = this.goalManager.getRecommendedAction();

      // Execute goal-aligned action
      if (recommendedAction) {
        await this.executeGoalAction(recommendedAction, context);
      } else {
        // Fallback to default behavior
        await this.executeDefaultAction(context);
      }

      // Log goal statistics periodically
      if (cycles % 10 === 0) {
        this.logGoalStatistics();
      }

      await this.waitRandom(10000, 30000);

    } catch (error) {
      this.logger.error(`Error in goal-driven cycle: ${error}`);
      this.metrics.recordError();
      await this.waitRandom(5000, 10000);
    }
  }

  this.logFinalGoalSummary();
}
```

### Step 5: Implement Goal-Aligned Action Execution

```typescript
/**
 * Execute action based on goal recommendation
 */
private async executeGoalAction(
  action: string,
  context: GameContext
): Promise<void> {
  this.logger.action(`Executing goal-aligned action: ${action}`);

  switch (action) {
    case 'combat':
      await this.engageInCombat();
      break;

    case 'duel':
    case 'pvp':
      await this.lookForDuels();
      break;

    case 'skill_training':
      await this.trainSkills();
      break;

    case 'job':
      await this.performJob();
      break;

    case 'quest':
      await this.completeQuest();
      break;

    case 'explore':
    case 'travel':
      await this.exploreLocation();
      break;

    case 'shop':
      await this.visitShop();
      break;

    case 'social':
    case 'chat':
      await this.socialInteraction();
      break;

    case 'craft':
      await this.craftItems();
      break;

    case 'gang_search':
      await this.searchForGang();
      break;

    case 'faction_quest':
      await this.completeFactionQuest();
      break;

    case 'gather':
    case 'loot':
      await this.gatherResources();
      break;

    case 'combat_boss':
      await this.huntBoss();
      break;

    default:
      this.logger.warn(`Unknown action: ${action}, using fallback`);
      await this.executeDefaultAction(context);
  }
}
```

### Step 6: Add Action Filtering

```typescript
/**
 * Filter available actions by goal relevance
 */
private filterActionsByGoals(availableActions: string[]): string[] {
  const goalRelevant = availableActions.filter(action =>
    this.goalManager.doesActionContributeToGoals(action)
  );

  if (goalRelevant.length > 0) {
    this.logger.debug(`${goalRelevant.length}/${availableActions.length} actions contribute to goals`);
    return goalRelevant;
  }

  return availableActions;
}

/**
 * Select best action from available options
 */
private async selectBestAction(availableActions: string[]): Promise<string> {
  // First, filter by goal relevance
  const goalRelevant = this.filterActionsByGoals(availableActions);

  // If we have goal-relevant actions, use recommended action
  if (goalRelevant.length > 0) {
    const recommended = this.goalManager.getRecommendedAction();
    if (recommended && goalRelevant.includes(recommended)) {
      return recommended;
    }
    // Otherwise pick random goal-relevant action
    return goalRelevant[Math.floor(Math.random() * goalRelevant.length)];
  }

  // Fallback to personality-based selection
  return this.selectByPersonality(availableActions);
}
```

### Step 7: Add Goal Logging

```typescript
/**
 * Log goal statistics
 */
private logGoalStatistics(): void {
  const stats = this.goalManager.getStats();

  this.logger.info('=== Goal Statistics ===');
  this.logger.info(`Active Goals: ${stats.activeGoals}`);
  this.logger.info(`Completed Goals: ${stats.completedGoals}`);
  this.logger.info(`Completion Rate: ${(stats.completionRate * 100).toFixed(1)}%`);
  this.logger.info(`Average Priority: ${stats.averagePriority.toFixed(1)}`);
  this.logger.info(`Average Progress: ${(stats.averageProgress * 100).toFixed(1)}%`);

  // Log top 3 goals
  const topGoals = this.goalManager.getCurrentGoals().slice(0, 3);
  this.logger.info('Top Goals:');
  topGoals.forEach((goal, index) => {
    this.logger.info(
      `  ${index + 1}. [${goal.priority}] ${goal.name} ` +
      `(${(goal.progress * 100).toFixed(1)}%)`
    );
  });
}

/**
 * Log final goal summary at session end
 */
private logFinalGoalSummary(): void {
  this.logger.success('=== Final Goal Summary ===');

  const completed = this.goalManager.getCompletedGoals();
  const remaining = this.goalManager.getCurrentGoals();

  this.logger.info(`Completed: ${completed.length} goals`);
  completed.forEach(goal => {
    this.logger.success(`  ✓ ${goal.name} (${goal.type})`);
  });

  this.logger.info(`Remaining: ${remaining.length} goals`);
  remaining.forEach(goal => {
    this.logger.info(
      `  • ${goal.name} (${(goal.progress * 100).toFixed(1)}% complete)`
    );
  });
}
```

## Helper Method Implementations

### Page Parsing Methods

```typescript
/**
 * Parse skills from character page
 */
private async parseSkills(): Promise<Record<string, number>> {
  if (!this.page) return {};

  return await this.page.evaluate(() => {
    const skills: Record<string, number> = {};

    // Find skill elements (adjust selectors for your app)
    const skillElements = document.querySelectorAll('[data-skill]');

    skillElements.forEach(element => {
      const skillName = element.getAttribute('data-skill');
      const skillLevel = parseInt(element.textContent || '0');

      if (skillName) {
        skills[skillName] = skillLevel;
      }
    });

    return skills;
  });
}

/**
 * Parse combat statistics
 */
private async parseCombatStats(): Promise<{
  duelsWon: number;
  duelsLost: number;
  bossesDefeated: string[];
}> {
  if (!this.page) {
    return { duelsWon: 0, duelsLost: 0, bossesDefeated: [] };
  }

  return await this.page.evaluate(() => {
    // Adjust selectors for your app
    const duelsWon = parseInt(
      document.querySelector('[data-stat="duels-won"]')?.textContent || '0'
    );
    const duelsLost = parseInt(
      document.querySelector('[data-stat="duels-lost"]')?.textContent || '0'
    );

    const bossElements = document.querySelectorAll('[data-boss-defeated]');
    const bossesDefeated = Array.from(bossElements).map(
      el => el.getAttribute('data-boss-defeated') || ''
    );

    return { duelsWon, duelsLost, bossesDefeated };
  });
}

/**
 * Get current location
 */
private async getCurrentLocation(): Promise<string> {
  if (!this.page) return 'unknown';

  return await this.page.evaluate(() => {
    const locationElement = document.querySelector('[data-location]');
    return locationElement?.textContent || 'unknown';
  });
}

/**
 * Get friend count
 */
private async getFriendCount(): Promise<number> {
  if (!this.page) return 0;

  return await this.page.evaluate(() => {
    const friendElement = document.querySelector('[data-friend-count]');
    return parseInt(friendElement?.textContent || '0');
  });
}
```

## Example: Complete Integration for CombatBot

```typescript
import { BotBase, BotConfig } from '../utils/BotBase.js';
import { GoalManager, GameContext } from '../intelligence/GoalManager.js';
import { PersonalitySystem, PersonalityProfile } from '../intelligence/PersonalitySystem.js';

export class GoalDrivenCombatBot extends BotBase {
  private goalManager: GoalManager;
  private personality: PersonalityProfile;

  constructor(config: BotConfig) {
    super(config);
    this.personality = PersonalitySystem.createPersonality('combat');
    this.goalManager = new GoalManager(this.personality);
    this.logger.info(`Initialized with ${this.goalManager.getCurrentGoals().length} goals`);
  }

  async runBehaviorLoop(): Promise<void> {
    this.logger.info('Starting goal-driven combat bot');

    let cycles = 0;
    const maxCycles = 1000;

    while (this.shouldContinue() && cycles < maxCycles) {
      cycles++;
      this.logger.info(`=== Cycle ${cycles}/${maxCycles} ===`);

      try {
        // Build game context
        const context = await this.buildGameContext();

        // Update goals
        this.goalManager.updateProgress(context);

        // Log current objective
        const topGoal = this.goalManager.getTopGoal();
        if (topGoal) {
          this.logger.info(
            `Goal: ${topGoal.name} (${(topGoal.progress * 100).toFixed(1)}%)`
          );
        }

        // Get and execute recommended action
        const action = this.goalManager.getRecommendedAction();
        if (action) {
          await this.executeGoalAction(action, context);
        } else {
          await this.engageInCombat(); // Default action
        }

        // Periodic logging
        if (cycles % 10 === 0) {
          this.logGoalStatistics();
        }

        await this.waitRandom(10000, 30000);

      } catch (error) {
        this.logger.error(`Cycle error: ${error}`);
        this.metrics.recordError();
        await this.waitRandom(5000, 10000);
      }
    }

    this.logFinalGoalSummary();
  }

  private async buildGameContext(): Promise<GameContext> {
    const level = await this.getLevel();
    const gold = await this.getGold();
    const energy = await this.getEnergy();

    return {
      character: {
        id: this.config.characterId || 'combat-bot',
        name: this.config.username,
        level,
        gold,
        energy: { current: energy, max: 100 },
        skills: await this.parseSkills(),
        location: await this.getCurrentLocation(),
        friends: 0,
        inventory: { items: [], count: 0 },
        achievements: [],
        quests: { active: [], completed: [] },
        combat: {
          duelsWon: await this.getDuelsWon(),
          duelsLost: 0,
          bossesDefeated: [],
        },
        exploration: {
          locationsVisited: ['combat_arena'],
          locationsUnlocked: ['combat_arena'],
        },
        reputation: {},
      },
    };
  }

  private async executeGoalAction(action: string, context: GameContext): Promise<void> {
    this.logger.action(`Goal action: ${action}`);

    switch (action) {
      case 'combat':
      case 'duel':
      case 'pvp':
        await this.engageInCombat();
        break;
      case 'skill_training':
        await this.trainSkills();
        break;
      case 'shop':
        await this.checkAndUpgradeGear();
        break;
      default:
        await this.engageInCombat();
    }
  }

  private async parseSkills(): Promise<Record<string, number>> {
    // Simplified - return mock data
    return {
      gunfighting: Math.floor(Math.random() * 100),
      combat: Math.floor(Math.random() * 100),
    };
  }

  private async getDuelsWon(): Promise<number> {
    // Parse from page or return mock value
    return Math.floor(Math.random() * 20);
  }

  private logGoalStatistics(): void {
    const stats = this.goalManager.getStats();
    this.logger.info(`Goals: ${stats.activeGoals} active, ${stats.completedGoals} completed`);
    this.logger.info(`Completion rate: ${(stats.completionRate * 100).toFixed(1)}%`);
  }

  private logFinalGoalSummary(): void {
    const completed = this.goalManager.getCompletedGoals();
    const remaining = this.goalManager.getCurrentGoals();

    this.logger.success('=== Session Complete ===');
    this.logger.info(`Completed ${completed.length} goals:`);
    completed.forEach(g => this.logger.success(`  ✓ ${g.name}`));

    this.logger.info(`${remaining.length} goals remaining:`);
    remaining.forEach(g => this.logger.info(`  • ${g.name} (${(g.progress * 100).toFixed(1)}%)`));
  }
}
```

## Testing the Integration

### Manual Test

```typescript
import { GoalDrivenCombatBot } from './bots/GoalDrivenCombatBot.js';

async function testGoalIntegration() {
  const bot = new GoalDrivenCombatBot({
    username: 'test-goal-bot',
    characterId: 'test-char',
    headless: false, // Watch it in action
  });

  await bot.initialize();
  await bot.runBehaviorLoop();
  await bot.cleanup();
}

testGoalIntegration().catch(console.error);
```

### Automated Test

```typescript
describe('GoalManager Integration', () => {
  it('should guide bot behavior toward goals', async () => {
    const bot = new GoalDrivenCombatBot(testConfig);
    await bot.initialize();

    // Run for 5 cycles
    for (let i = 0; i < 5; i++) {
      const context = await bot.buildGameContext();
      bot.goalManager.updateProgress(context);

      const topGoal = bot.goalManager.getTopGoal();
      expect(topGoal).toBeDefined();

      const action = bot.goalManager.getRecommendedAction();
      expect(action).toBeDefined();

      await bot.executeGoalAction(action, context);
    }

    const stats = bot.goalManager.getStats();
    expect(stats.activeGoals).toBeGreaterThan(0);

    await bot.cleanup();
  });
});
```

## Best Practices

### 1. Context Accuracy
- Update context frequently (every cycle)
- Parse real values from page, not mock data
- Cache expensive operations where possible

### 2. Goal Alignment
- Map your app's actions to GoalManager action types
- Add custom goal types for game-specific features
- Tune goal priorities based on testing

### 3. Fallback Behavior
- Always have default action when no goal recommendation
- Don't let bots get stuck if goals can't progress
- Use personality preferences as secondary filter

### 4. Logging & Monitoring
- Log goal progress regularly
- Track completion rates across bot populations
- Monitor for goals that never complete (may need tuning)

### 5. Performance
- Build context efficiently (don't re-parse entire page every time)
- Update goals at appropriate intervals (not every single action)
- Clean up completed goals periodically if needed

## Troubleshooting

### Bot Not Following Goals
- Check that `buildGameContext()` returns accurate data
- Verify action mappings in `executeGoalAction()`
- Ensure `updateProgress()` is called regularly

### Goals Never Complete
- Check progress calculation logic
- Verify context contains necessary data
- Consider if goal targets are achievable

### Too Many/Few Goals
- Adjust follow-up goal generation in templates
- Modify personality-specific generation
- Tune goal completion thresholds

## Next Steps

1. **Extend to Other Bots**: Apply to SocialBot, EconomyBot, ExplorerBot
2. **Add Custom Goals**: Create game-specific goal types
3. **Analytics Dashboard**: Track goal patterns across bot population
4. **Machine Learning**: Use goal data to optimize templates

---

**Integration complete!** Your bots now have purpose-driven behavior with emergent narrative arcs.
