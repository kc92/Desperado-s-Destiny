# Maintenance Guide - Playtest Bot System

**Version**: 2.0
**Last Updated**: November 2025
**Audience**: DevOps, Maintainers, Support

## Table of Contents

- [Troubleshooting Common Issues](#troubleshooting-common-issues)
- [Fixing Broken Selectors](#fixing-broken-selectors)
- [Updating Personality Parameters](#updating-personality-parameters)
- [Tuning Decision Engine Weights](#tuning-decision-engine-weights)
- [Performance Optimization](#performance-optimization)
- [Error Recovery Procedures](#error-recovery-procedures)
- [Bot Health Monitoring](#bot-health-monitoring)
- [Log Analysis](#log-analysis)
- [Database Maintenance](#database-maintenance)

---

## Troubleshooting Common Issues

### Bot Won't Start

**Symptom**: Bot crashes immediately after running

**Diagnosis**:
```bash
# Check Node version
node --version
# Should be v16 or higher

# Check dependencies
npm list puppeteer typescript

# Check server is running
curl http://localhost:3002
```

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Update TypeScript
npm install -g typescript@latest

# Verify Puppeteer installation
npx puppeteer browsers install chrome
```

---

### Login Fails

**Symptom**: Bot cannot log in, stuck at login page

**Diagnosis**:
```typescript
// Enable debug logging in BotBase
this.logger.info(`Attempting login with: ${this.config.email}`);
```

**Common Causes**:
1. **User doesn't exist** - Create user manually
2. **Wrong credentials** - Check `runPlaytests.ts` config
3. **Server not running** - Start server
4. **Rate limiting** - Wait and retry

**Solution**:
```bash
# Create test user via server script
cd server
node createTestUser.js playtest_combat combat.bot@playtest.local TestBot123!

# Or via MongoDB
mongo
use desperados_destiny
db.users.find({ email: "combat.bot@playtest.local" })
```

---

### Character Selection Hangs

**Symptom**: Bot logs in but can't select character

**Diagnosis**:
```typescript
// Check what's on page
await this.screenshot('character-selection-debug');
```

**Common Causes**:
1. **No character exists** - Bot will create one
2. **Button text changed** - Update selectors
3. **Modal blocking** - Close modal first

**Solution**:
```typescript
// In BotBase.ts selectCharacter()
this.logger.info('Looking for Play button...');

// Try multiple button texts
const playClicked = await clickButtonByText(
  this.page,
  'Play',
  'Continue',
  'Select',
  'Choose Character'  // Add new variation
);
```

---

### Actions Not Executing

**Symptom**: Bot appears to be working but no actions happen

**Diagnosis**:
```bash
# Check logs for decision-making
cat logs/CombatBot-*.log | grep DECISION

# Check if actions are being selected
cat logs/CombatBot-*.log | grep "Performing:"
```

**Common Causes**:
1. **No viable actions** - All actions filtered out
2. **Low energy** - Bot waiting to recover
3. **Page navigation failed** - Bot on wrong page

**Solution**:
```typescript
// Add debug logging to bot
this.logger.info(`Viable actions: ${viableActions.length}`);
this.logger.info(`Current energy: ${await this.getEnergy()}`);
this.logger.info(`Current page: ${this.page?.url()}`);
```

---

### High Memory Usage

**Symptom**: Bot consumes >2GB RAM

**Diagnosis**:
```bash
# Monitor memory
top -p $(pgrep -f "runPlaytests")

# Or use Node built-in
node --max-old-space-size=1024 runPlaytests.ts
```

**Solution**:
```typescript
// In BotMemory.ts - reduce history size
constructor(maxHistorySize: number = 500) {  // Was 1000
  this.maxHistorySize = maxHistorySize;
}

// Close unused pages
await this.page?.close();
await this.browser?.close();

// Run headless mode
headless: true
```

---

## Fixing Broken Selectors

### When UI Changes Break Bots

**Example Problem**: Button text changed from "Fight" to "Battle"

### Step 1: Identify the Broken Selector

```bash
# Check logs for selector errors
cat logs/*.log | grep "Failed to find"
cat logs/*.log | grep "not found"

# Example output:
# [ERROR] Failed to find button with text: Fight
```

### Step 2: Find Where Selector is Defined

```bash
# Search for the selector
cd client/tests/playtests
grep -r "Fight" --include="*.ts"

# Example output:
# utils/PageObjects.ts:    attackButton: ['Fight', 'Attack'],
```

### Step 3: Update the Selector

**Option A: Add New Variation**
```typescript
// In PageObjects.ts
export class CombatPage extends BasePage {
  private selectors = {
    attackButton: [
      'Fight',
      'Attack',
      'Battle',  // Add new variation
      'Strike'
    ],
  };
}
```

**Option B: Replace Old Selector**
```typescript
// If old text is completely removed
attackButton: ['Battle', 'Strike'],  // Remove 'Fight'
```

### Step 4: Test the Fix

```bash
# Run bot to verify
npm run playtest:combat

# Watch logs
tail -f logs/CombatBot-*.log
```

### Common Selector Updates

| Old Text | New Text | File | Line |
|----------|----------|------|------|
| "Fight" | "Battle" | PageObjects.ts | CombatPage |
| "Log In" | "Sign In" | PageObjects.ts | LoginPage |
| "Create" | "New Character" | BotBase.ts | createNewCharacter |

---

## Updating Personality Parameters

### When to Update

- Bots are too aggressive/passive
- Bots don't test certain features
- Bots behave unrealistically

### How to Update

**File**: `intelligence/PersonalitySystem.ts`

```typescript
const COMBAT_ARCHETYPE: PersonalityProfile = {
  archetype: 'combat',
  traits: {
    riskTolerance: 0.85,  // Increase for more risk-taking
    sociability: 0.4,     // Increase for more social actions
    patience: 0.5,        // Increase for less rushing
    greed: 0.6,           // Increase for more gold focus
    aggression: 0.9,      // Increase for more combat
    loyalty: 0.6,         // Increase for more gang focus
    curiosity: 0.3,       // Increase for more exploration
  },
};
```

### Trait Effects

| Trait | Low (0.0-0.3) | Medium (0.4-0.6) | High (0.7-1.0) |
|-------|---------------|------------------|----------------|
| **riskTolerance** | Safe actions only | Balanced | High-risk actions |
| **sociability** | Solo play | Some social | Very social |
| **patience** | Impulsive | Moderate | Methodical |
| **greed** | Altruistic | Balanced | Profit-driven |
| **aggression** | Peaceful | Balanced | Combative |
| **loyalty** | Independent | Moderate | Faction-loyal |
| **curiosity** | Routine | Balanced | Exploratory |

### Testing Changes

```bash
# Create variant to test
const testPersonality = PersonalitySystem.createVariant('combat');

# Modify specific trait
testPersonality.traits.aggression = 0.5;  // Reduce aggression

# Use in bot
const bot = new CombatBot(config, testPersonality);
```

---

## Tuning Decision Engine Weights

### Understanding Weights

**File**: `intelligence/DecisionEngine.ts`

```typescript
constructor(personality: PersonalityProfile, options: DecisionOptions = {}) {
  this.options = {
    goalWeight: options.goalWeight ?? 1.0,         // Goal importance
    efficiencyWeight: options.efficiencyWeight ?? 1.0,  // Efficiency importance
    randomVariance: options.randomVariance ?? 0.2,      // Randomness
    // ...
  };
}
```

### Common Adjustments

**Make bots more goal-focused**:
```typescript
const engine = new DecisionEngine(personality, {
  goalWeight: 2.0,        // Double goal importance
  efficiencyWeight: 0.5,  // Halve efficiency importance
});
```

**Make bots more efficient**:
```typescript
const engine = new DecisionEngine(personality, {
  goalWeight: 0.5,
  efficiencyWeight: 2.0,  // Prioritize gold/energy efficiency
});
```

**Add more randomness (less predictable)**:
```typescript
const engine = new DecisionEngine(personality, {
  randomVariance: 0.4,  // Increase from default 0.2
});
```

**Make bots more deterministic**:
```typescript
const engine = new DecisionEngine(personality, {
  randomVariance: 0.05,  // Very low randomness
});
```

---

## Performance Optimization

### Reducing CPU Usage

```typescript
// Increase delays between actions
protected async waitRandom(minMs: number, maxMs: number): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await new Promise(resolve => setTimeout(resolve, delay * 2));  // Double delay
}
```

### Reducing Memory Usage

```typescript
// Limit metrics history
class BotMetrics {
  private maxActions = 500;  // Was unlimited

  recordAction(action: string, metadata?: any): void {
    this.actions.push({ action, timestamp: new Date(), metadata });

    // Limit size
    if (this.actions.length > this.maxActions) {
      this.actions.shift();
    }
  }
}
```

### Running Headless

```typescript
// In runPlaytests.ts
const botConfigs = {
  combat: {
    // ...
    headless: true,  // No visible browser window
    slowMo: 0,       // No artificial delays
  },
};
```

### Parallel vs Sequential

```typescript
// Parallel (higher resource usage, faster)
await Promise.all([
  combatBot.start(),
  economyBot.start(),
  socialBot.start(),
]);

// Sequential (lower resource usage, slower)
await combatBot.start();
await economyBot.start();
await socialBot.start();
```

---

## Error Recovery Procedures

### Bot Crash Recovery

**Step 1: Check logs**
```bash
cat logs/CombatBot-*.log | tail -50
```

**Step 2: Identify error**
```
[ERROR] Page error: Cannot read property 'click' of null
```

**Step 3: Add error handling**
```typescript
async performAction(): Promise<void> {
  try {
    await this.clickButton();
  } catch (error) {
    this.logger.error(`Action failed: ${error}`);

    // Try to recover
    await this.navigateToSafePage();
    await this.waitRandom(5000, 10000);

    // Continue instead of crashing
    return;
  }
}
```

### Network Error Recovery

```typescript
async navigateTo(linkText: string): Promise<void> {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await clickLinkByText(this.page, linkText);
      return;  // Success
    } catch (error) {
      attempt++;
      this.logger.warn(`Navigation failed (attempt ${attempt}/${maxRetries})`);

      if (attempt < maxRetries) {
        await this.waitRandom(2000, 5000);
      } else {
        throw error;  // Give up after max retries
      }
    }
  }
}
```

---

## Bot Health Monitoring

### Real-Time Monitoring Script

Create `monitoring/bot-health.sh`:

```bash
#!/bin/bash

# Monitor bot processes
watch -n 5 'ps aux | grep runPlaytests'

# Monitor memory usage
watch -n 5 'ps aux | grep runPlaytests | awk "{print \$6}"'

# Monitor log output
tail -f logs/*.log | grep -E "ERROR|WARN|SUCCESS"
```

### Automated Alerts

Create `monitoring/check-bot-health.js`:

```javascript
const fs = require('fs');
const path = require('path');

// Check if bots are still running
function checkBotStatus() {
  const logDir = './logs';
  const logs = fs.readdirSync(logDir);

  logs.forEach(log => {
    const logPath = path.join(logDir, log);
    const stats = fs.statSync(logPath);
    const modifiedAgo = Date.now() - stats.mtimeMs;

    // If log hasn't been updated in 5 minutes, alert
    if (modifiedAgo > 5 * 60 * 1000) {
      console.error(`ALERT: Bot may be stuck - ${log}`);
      // Send email/Slack notification here
    }
  });
}

setInterval(checkBotStatus, 60000);  // Check every minute
```

---

## Log Analysis

### Finding Errors

```bash
# All errors
grep -i error logs/*.log

# Errors with context (3 lines before and after)
grep -i -C 3 error logs/*.log

# Count errors by type
grep -i error logs/*.log | sort | uniq -c | sort -nr
```

### Analyzing Decision-Making

```bash
# See what bot chose to do
grep "Selected:" logs/CombatBot-*.log

# See why bot chose it
grep "Reasoning:" logs/CombatBot-*.log

# See decision scores
grep "score:" logs/CombatBot-*.log
```

### Performance Analysis

```bash
# Count actions per hour
total_actions=$(grep -c "ACTION" logs/CombatBot-*.log)
start_time=$(head -1 logs/CombatBot-*.log | awk '{print $1, $2}')
end_time=$(tail -1 logs/CombatBot-*.log | awk '{print $1, $2}')

# Calculate duration and rate
# (Implementation depends on log format)
```

---

## Database Maintenance

### Cleaning Up Test Data

```javascript
// MongoDB cleanup script
db.users.deleteMany({ email: { $regex: /playtest.*@playtest\.local/ } });
db.characters.deleteMany({ name: { $regex: /Bot$/ } });
db.actions.deleteMany({ userId: { $in: botUserIds } });
```

### Resetting Bot Accounts

```javascript
// Reset bot character to level 1
db.characters.updateMany(
  { name: { $regex: /Bot$/ } },
  {
    $set: {
      level: 1,
      gold: 100,
      energy: 100,
      health: 100
    }
  }
);
```

---

## Maintenance Checklist

### Daily
- [ ] Check bot logs for errors
- [ ] Verify bots are running
- [ ] Check memory usage
- [ ] Review latest metrics

### Weekly
- [ ] Clear old logs (>7 days)
- [ ] Archive metrics data
- [ ] Review bot performance trends
- [ ] Update selectors if UI changed

### Monthly
- [ ] Clean database of test data
- [ ] Update dependencies
- [ ] Review and tune personality parameters
- [ ] Optimize performance

---

## Getting Help

**Common Issues**: Check this guide first
**Selector Problems**: See "Fixing Broken Selectors" section
**Performance Issues**: See "Performance Optimization" section
**Other Issues**: Contact development team

---

**Next**: See [USAGE_GUIDE.md](./USAGE_GUIDE.md) for advanced usage options.
