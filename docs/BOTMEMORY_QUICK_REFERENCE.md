# BotMemory Quick Reference Card

## One-Minute Setup

```typescript
import { BotMemory } from './intelligence/BotMemory';

// Initialize
const memory = new BotMemory(1000); // max 1000 actions

// Record action
memory.recordOutcome({
  id: 'unique-id',
  action: { type: 'combat', target: 'bandit' },
  timestamp: new Date(),
  success: true,
  reward: 50,
  cost: 10,
  context: {
    character: { health: 80, energy: 45, gold: 200, level: 5 }
  },
  duration: 2500
});

// Get recommendation
const rec = memory.getRecommendation(currentContext);

// Check adaptation
if (memory.shouldAdaptStrategy()) {
  adaptStrategy();
}
```

## Common Methods

| Method | Returns | Use Case |
|--------|---------|----------|
| `recordOutcome(outcome)` | `void` | Record every action result |
| `getSuccessRate(actionType)` | `number` | Check action viability |
| `getRecommendation(context)` | `string \| null` | Get smart suggestion |
| `shouldAdaptStrategy()` | `boolean` | Detect failing strategy |
| `getStats()` | `MemoryStats` | Performance summary |
| `getConfidentPatterns(min)` | `Pattern[]` | High-confidence patterns |
| `getBestCombos(min)` | `ActionCombo[]` | Top action sequences |
| `getMostEfficientActions()` | `object` | Best efficiency metrics |
| `getLearningReport()` | `string` | Full learning summary |
| `exportMemory()` | `string` | Save for analysis |

## Quick Patterns

### Health Pattern
```typescript
if (context.character.health < 40) {
  const rec = memory.getRecommendation(context);
  // May return: 'avoid_combat_low_health'
}
```

### Energy Pattern
```typescript
if (context.character.energy < 25) {
  const rec = memory.getRecommendation(context);
  // May return: 'rest_low_energy'
}
```

### Temporal Pattern
```typescript
const insights = memory.getTemporalInsights();
const bestTime = insights.bestTimeForAction.get('job');
// Returns: 'morning' if jobs work best in morning
```

### Combo Pattern
```typescript
const combos = memory.getBestCombos(0.7);
// Returns: [{ sequence: ['job', 'upgrade', 'combat'], successRate: 0.88, ... }]
```

## Quick Efficiency Check

```typescript
const efficient = memory.getMostEfficientActions();

// Best gold per energy
const bestGPE = efficient.byGoldPerEnergy; // e.g., 'crime'

// Best gold per minute
const bestGPM = efficient.byGoldPerMinute; // e.g., 'job'

// Best overall (balanced)
const bestOverall = efficient.byOverallScore; // e.g., 'job'
```

## Quick Stats

```typescript
const stats = memory.getStats();

console.log(`Success: ${(stats.averageSuccessRate * 100).toFixed(1)}%`);
console.log(`Trend: ${stats.recentTrend}`); // 'improving', 'declining', 'stable'
console.log(`Best: ${stats.bestAction}`);
console.log(`Worst: ${stats.worstAction}`);
```

## Quick Recommendations

```typescript
const context = getCurrentContext();
const rec = memory.getRecommendation(context);

switch(rec) {
  case 'avoid_combat_low_health':
    return { type: 'job' }; // Safer option

  case 'rest_low_energy':
    return { type: 'rest' };

  case 'equip_gear_before_combat':
    await equipBestGear();
    return { type: 'combat' };

  default:
    // No specific recommendation, use normal logic
    return chooseActionNormally();
}
```

## Quick Integration Pattern

```typescript
class BotPlayer {
  private memory = new BotMemory();

  async takeTurn() {
    // 1. Get context
    const context = this.getContext();

    // 2. Get recommendation
    const rec = this.memory.getRecommendation(context);

    // 3. Choose action
    const action = this.chooseAction(rec);

    // 4. Execute
    const result = await this.performAction(action);

    // 5. Learn
    this.memory.recordOutcome({
      id: generateId(),
      action,
      timestamp: new Date(),
      success: result.success,
      reward: result.gold || 0,
      cost: result.energy || 0,
      context,
      duration: result.duration
    });

    // 6. Adapt if needed
    if (this.memory.shouldAdaptStrategy()) {
      this.personality.adaptStrategy();
    }
  }
}
```

## Performance Tips

1. **Always record outcomes** - Even failures teach the bot
2. **Rich context** - More context = better patterns
3. **Trust recommendations** - They're based on data
4. **Monitor adaptation** - Respond when triggered
5. **Periodic reports** - Use `getLearningReport()` every 100 actions

## Common Patterns

### Pattern Detection
- Requires 5+ occurrences for confidence
- Confidence score 0-1 (use 0.6+ for decisions)
- Tracks trends: improving/declining/stable

### Combo Detection
- Looks at sequences of 3 actions
- Requires multiple occurrences
- Compares combo success to individual actions

### Temporal Patterns
- Buckets by time of day
- Requires 5+ occurrences per time
- Identifies best times for each action

### Strategy Adaptation
- Triggers when recent success < 40%
- Looks at last 20 actions
- Requires minimum 10 actions

## Memory Limits

- **Default:** 1000 actions
- **Pruning:** FIFO (oldest removed first)
- **Memory:** ~1-2 MB for 1000 actions
- **Customizable:** `new BotMemory(customSize)`

## Export/Import

```typescript
// Export
const data = memory.exportMemory();
fs.writeFileSync('memory.json', data);

// Import
const saved = fs.readFileSync('memory.json', 'utf-8');
memory.importMemory(saved);

// Share between bots
bot2.memory.importMemory(bot1.memory.exportMemory());
```

## Learning Timeline

| Actions | Expected Behavior |
|---------|------------------|
| 0-50 | Random, exploring |
| 50-100 | First patterns emerge |
| 100-200 | Basic optimization |
| 200-500 | Strategic decisions |
| 500+ | Expert performance |

## Success Metrics

After 1000 actions, expect:
- **Success Rate:** 70-75% (vs 50% random)
- **Patterns:** 15-20 confident patterns
- **Combos:** 5-7 effective sequences
- **Efficiency:** 40%+ improvement
- **Adaptations:** 2-3 successful strategy changes

## Debug Tips

```typescript
// Check what bot has learned
console.log(memory.getLearningReport());

// Check specific pattern
const patterns = memory.getConfidentPatterns();
console.log(patterns.filter(p => p.pattern.includes('combat')));

// Check efficiency
const stats = memory.getStats();
console.log(stats.actionBreakdown);

// Export for analysis
const data = JSON.parse(memory.exportMemory());
console.log(data.patterns);
console.log(data.combos);
```

## Common Mistakes to Avoid

❌ **Don't** record outcomes without context
✅ **Do** provide full context including health, energy, location, time

❌ **Don't** ignore recommendations
✅ **Do** consider recommendations in decision making

❌ **Don't** expect perfect performance immediately
✅ **Do** allow 100+ actions for meaningful learning

❌ **Don't** forget to check adaptation triggers
✅ **Do** monitor `shouldAdaptStrategy()` regularly

❌ **Don't** use without recording outcomes
✅ **Do** record EVERY action outcome, including failures

## One-Liner Checks

```typescript
// Is combat safe right now?
const combatRate = memory.getSuccessRate('combat');
const isSafe = combatRate > 0.6;

// Should I rest?
const rec = memory.getRecommendation(context);
const shouldRest = rec === 'rest_low_energy';

// Am I improving?
const trend = memory.getStats().recentTrend;
const improving = trend === 'improving';

// What's most efficient?
const best = memory.getMostEfficientActions().byOverallScore;

// Do I need to change strategy?
const needsChange = memory.shouldAdaptStrategy();
```

## File Locations

- **Implementation:** `client/tests/playtests/intelligence/BotMemory.ts`
- **Examples:** `client/tests/playtests/intelligence/BotMemoryExample.ts`
- **Docs:** `client/tests/playtests/intelligence/README.md`
- **Reports:** `AGENT_8_BOTMEMORY_REPORT.md`
- **Architecture:** `BOTMEMORY_ARCHITECTURE.md`

## Getting Help

1. Read the JSDoc comments in BotMemory.ts
2. Run BotMemoryExample.ts demonstrations
3. Check BOTMEMORY_ARCHITECTURE.md for diagrams
4. Review AGENT_8_BOTMEMORY_REPORT.md for details
5. See README.md for integration guides

---

**Quick Start:** Import, initialize, record outcomes, get recommendations. That's it!
