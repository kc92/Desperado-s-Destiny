# Usage Guide - Playtest Bot System

**Version**: 2.0
**Last Updated**: November 2025
**Audience**: Power Users, QA Testers

## Command-Line Options

### Basic Commands

```bash
# Run all bots
npm run playtest

# Run specific bot
npm run playtest:combat
npm run playtest:economy
npm run playtest:social

# Run adversarial bot
cd advanced && npx ts-node runAdversarialBot.ts
```

### Advanced Usage

```bash
# Run with custom config
npx ts-node runPlaytests.ts combat --headless --cycles=500

# Run multiple instances
npx ts-node runPlaytests.ts combat &
npx ts-node runPlaytests.ts combat &
npx ts-node runPlaytests.ts combat &

# Run with debug logging
DEBUG=* npm run playtest:combat
```

---

## Configuration File Format

### Bot Configuration

```typescript
interface BotConfig {
  name: string;              // Display name for logging
  username: string;          // Game username
  email: string;            // Login email
  password: string;         // Password
  characterName: string;    // Character name
  baseUrl?: string;         // Default: http://localhost:3002
  headless?: boolean;       // Default: false
  slowMo?: number;          // Default: 50ms
}
```

### Decision Engine Configuration

```typescript
interface DecisionOptions {
  debug?: boolean;              // Enable debug logging
  allowRisky?: boolean;         // Allow risky actions (default: true)
  minEnergyThreshold?: number;  // Min energy for actions (default: 10)
  goalWeight?: number;          // Goal importance (default: 1.0)
  efficiencyWeight?: number;    // Efficiency importance (default: 1.0)
  randomVariance?: number;      // Randomness (default: 0.2)
  considerCombos?: boolean;     // Use action combos (default: true)
  useHistory?: boolean;         // Learn from history (default: true)
}
```

---

## Interpreting Metrics

### Metrics Dashboard

**File**: `data/{BotName}-metrics-{timestamp}-summary.json`

```json
{
  "botName": "CombatBot-Gunslinger",
  "runtime": "3h 42m",
  "totalActions": 347,
  "successRate": 0.83,
  "efficiency": {
    "goldPerHour": 612.5,
    "actionsPerHour": 86.75,
    "goldPerEnergy": 3.2
  },
  "goals": {
    "completed": 5,
    "active": 3,
    "completionRate": 0.625
  },
  "combat": {
    "wins": 23,
    "losses": 4,
    "winRate": 0.85
  }
}
```

### Key Metrics Explained

**successRate**: Percentage of actions that succeeded
- **Good**: >0.7 (70%)
- **Average**: 0.5-0.7 (50-70%)
- **Poor**: <0.5 (<50%)

**goldPerHour**: Gold earned per hour of runtime
- Indicates economic efficiency
- Compare across bots to find imbalances

**actionsPerHour**: How many actions bot performs per hour
- **Low (<50)**: Bot is slow or waiting frequently
- **Normal (50-100)**: Healthy activity level
- **High (>100)**: Very active, check if realistic

**goalCompletionRate**: Goals completed vs created
- **Good**: >0.5 (completing more than creating)
- **Poor**: <0.3 (creating faster than completing)

---

## Reading Bot Logs

### Log Format

```
[TIMESTAMP] LEVEL - Message

Example:
[2025-11-27 04:00:10] INFO  - Browser initialized
[2025-11-27 04:00:15] ACTION - Starting combat encounter
[2025-11-27 04:00:20] DECISION - Selected: Fight Bandits (score: 87.3)
[2025-11-27 04:00:25] GOAL - Progress: Earn 1000 Gold (24%)
[2025-11-27 04:00:30] ERROR - Failed to click button
```

### Log Levels

- **INFO**: General information, startup/shutdown
- **ACTION**: Bot performed an action
- **DECISION**: Bot made a decision (shows what and why)
- **GOAL**: Goal progress updates
- **METRIC**: Metrics recorded (gold earned, etc.)
- **WARN**: Non-critical issues
- **ERROR**: Errors that need attention

### Finding Specific Information

```bash
# See all actions performed
grep "ACTION" logs/CombatBot-*.log

# See all decisions made
grep "DECISION" logs/CombatBot-*.log

# See goal progress
grep "GOAL" logs/CombatBot-*.log

# See errors only
grep "ERROR" logs/CombatBot-*.log

# See last 50 lines
tail -50 logs/CombatBot-*.log
```

---

## Using Metrics Dashboard

### Viewing Summary

```bash
# View JSON summary
cat data/CombatBot-*-summary.json | jq '.'

# Extract specific metrics
cat data/CombatBot-*-summary.json | jq '.efficiency.goldPerHour'
cat data/CombatBot-*-summary.json | jq '.combat.winRate'
```

### Comparing Bots

```bash
# Compare gold per hour across all bots
for file in data/*-summary.json; do
  echo "$file:"
  cat "$file" | jq '.efficiency.goldPerHour'
done

# Compare success rates
for file in data/*-summary.json; do
  echo "$file:"
  cat "$file" | jq '.successRate'
done
```

---

## Reviewing Exploit Reports

### Adversarial Bot Output

**File**: `data/AdversarialBot-exploits-{timestamp}.json`

```json
{
  "potentialExploits": [
    {
      "type": "duplicate_reward",
      "severity": "high",
      "description": "Clicking 'Claim Reward' twice gives double gold",
      "reproducible": true,
      "steps": [
        "Complete quest",
        "Click 'Claim Reward'",
        "Quickly click 'Claim Reward' again"
      ],
      "expectedBehavior": "Should only give reward once",
      "actualBehavior": "Gave reward twice (100 gold → 200 gold)",
      "timestamp": "2025-11-27T04:15:30.000Z"
    }
  ],
  "edgeCases": [
    {
      "type": "energy_overflow",
      "description": "Energy can go above 100 temporarily",
      "impact": "minor"
    }
  ]
}
```

### Reviewing Exploits

1. **Check severity**: High priority items first
2. **Verify reproducibility**: Can you reproduce it manually?
3. **Create bug ticket**: Document steps to reproduce
4. **Fix and re-test**: Run adversarial bot again

---

## Best Practices for Testing

### Running Long-Term Tests

```bash
# Run bots overnight
nohup npm run playtest > output.log 2>&1 &

# Check progress
tail -f output.log

# Check if still running
ps aux | grep runPlaytests
```

### Testing Specific Features

```typescript
// Create custom bot for feature testing
class FeatureTestBot extends BotBase {
  async runBehaviorLoop(): Promise<void> {
    // Focus only on feature being tested
    for (let i = 0; i < 100; i++) {
      await this.testSpecificFeature();
    }
  }

  async testSpecificFeature(): Promise<void> {
    // Test implementation
  }
}
```

### Stress Testing

```bash
# Run many bots simultaneously
for i in {1..10}; do
  npx ts-node runPlaytests.ts combat &
done

# Monitor server load
top
htop

# Monitor database connections
mongo
db.serverStatus().connections
```

### A/B Testing Game Changes

```bash
# Test BEFORE changes
npm run playtest
mv data/metrics-before.json metrics-before.json

# Make game changes

# Test AFTER changes
npm run playtest
mv data/metrics-after.json metrics-after.json

# Compare
diff metrics-before.json metrics-after.json
```

---

## Advanced Scenarios

### Custom Personality Testing

```typescript
// Test extreme personalities
const extremeGrinder: PersonalityProfile = {
  archetype: 'grinder',
  traits: {
    riskTolerance: 0.0,   // Minimum
    sociability: 0.0,     // Minimum
    patience: 1.0,        // Maximum
    greed: 1.0,           // Maximum
    aggression: 0.0,
    loyalty: 0.0,
    curiosity: 0.0,
  },
  // ...
};

const bot = new CombatBot(config, extremeGrinder);
```

### Scripted Test Sequences

```typescript
// Force specific action sequence
class ScriptedBot extends BotBase {
  private actionSequence = [
    'login',
    'select_character',
    'navigate_to_combat',
    'start_combat',
    'attack_3_times',
    'flee',
    'heal',
    'logout',
  ];

  async runBehaviorLoop(): Promise<void> {
    for (const action of this.actionSequence) {
      await this.performScriptedAction(action);
    }
  }
}
```

### Regression Testing

```bash
# Baseline metrics
npm run playtest
cp data/*-summary.json baseline/

# After each code change
npm run playtest
./scripts/compare-to-baseline.sh

# Alert if metrics degraded
```

---

## Tips & Tricks

### Speeding Up Tests

```typescript
// Reduce delays
slowMo: 0,
headless: true,

// Skip non-essential actions
if (action.type === 'social') {
  continue;  // Skip in fast mode
}
```

### Debugging Specific Issues

```typescript
// Take screenshots at each step
await this.screenshot('before-action');
await this.performAction();
await this.screenshot('after-action');

// Enable verbose logging
this.logger.info(`Current state: ${JSON.stringify(state)}`);
```

### Capturing Edge Cases

```typescript
// Random seed for reproducibility
Math.seedrandom('test-seed-123');

// Record full browser session
await this.page.setRecordVideo({
  path: 'recordings/bot-session.mp4'
});
```

---

## Interpreting Results

### What Makes a "Good" Test Run?

✅ **Success rate >70%**: Bot is effectively playing the game
✅ **No critical errors**: No crashes or severe bugs
✅ **Realistic behavior**: Actions make sense for personality
✅ **Goal progress**: Goals are being worked towards and completed
✅ **Varied actions**: Bot is using multiple game systems
✅ **Social engagement**: Bot interacts with other players (for social types)

### Red Flags

🚩 **Success rate <50%**: Something is broken
🚩 **Bot stuck on one page**: Navigation issue
🚩 **No goal progress**: Goals too hard or bot stuck
🚩 **Extreme metrics**: Suspiciously high gold/hour (exploit?)
🚩 **Memory leak**: RAM usage growing continuously
🚩 **Repetitive behavior**: Bot doing same action over and over

---

## FAQ

**Q: How long should I run bots?**
A: Minimum 1 hour for meaningful metrics. 4-8 hours for comprehensive testing.

**Q: Can I run bots in production?**
A: No! Only on test servers with test accounts.

**Q: How many bots can I run simultaneously?**
A: Depends on server capacity. Start with 3, scale up if server handles it.

**Q: Do bots need to be restarted regularly?**
A: Not required, but recommended every 12-24 hours to prevent memory buildup.

**Q: Can bots interfere with real players?**
A: Only if run on production. Always use isolated test environments.

---

**Next**: See [API_REFERENCE.md](./API_REFERENCE.md) for complete API documentation.
