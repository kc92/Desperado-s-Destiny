# Autonomous Leveler Bot - Complete Guide

## Overview

The **Autonomous Leveler Bot** is an intelligent, self-playing bot that creates a character from scratch and plays Desperados Destiny with adaptive decision-making. It tests multiple game systems simultaneously while pursuing long-term goals.

### Key Features

- 🤖 **Fully Autonomous** - Makes intelligent decisions without user input
- 🎯 **Goal-Oriented** - Pursues level and gold targets
- 🧠 **Adaptive Learning** - Adjusts strategy based on success/failure patterns
- 📊 **Comprehensive Metrics** - Tracks all actions and outcomes
- 🎮 **Multi-System Testing** - Exercises combat, economy, crafting, questing, and more
- 🔄 **Self-Recovering** - Handles errors gracefully and recovers

---

## Quick Start

### Run the Bot

```bash
cd client
npm run bot:autonomous
```

### Run in Background (Headless)

```bash
npm run bot:autonomous:headless
```

### Watch the Bot

The bot will:
1. Register a new account automatically
2. Create a character
3. Start playing with intelligent decision-making
4. Log progress every 10 cycles
5. Take screenshots every 20 cycles
6. Run until goals are achieved or manually stopped

**To stop:** Press `Ctrl+C`

---

## How It Works

### Decision-Making System

The bot uses a **priority-based decision system** that evaluates the current game state and chooses the best action:

#### 1. State Assessment

```typescript
{
  currentLocation: "Red Gulch",
  availableActions: ["Combat", "Crime", "Crafting"],
  characterStats: {
    level: 5,
    health: 80/100,
    energy: 45/100,
    gold: 1250,
    experience: 450
  }
}
```

#### 2. Decision Factors

The bot considers:
- **Survival Needs** - Health and energy levels
- **Goal Progress** - How close to level/gold targets
- **Success History** - Past performance of each action type
- **Action Weights** - Learned preferences (adjusted over time)
- **Resource Availability** - Gold, items, energy

#### 3. Action Selection

Actions are prioritized:

| Priority | Condition | Action | Reasoning |
|----------|-----------|--------|-----------|
| 10.0 | Energy < 20 | Wait for energy | Critical resource |
| 9.0 | Health < 30% | Heal | Survival |
| 8.5 | Below level goal | Quest | Best XP |
| 8.0 | Below level goal | Combat | Good XP + loot |
| 7.0 | Below gold goal | Crime | Fast gold |
| 6.5 | Below gold goal | Trading | Steady income |
| 5.0 | Has resources | Crafting | Gear improvements |
| 4.0 | Random 20% | Explore | Discovery |

#### 4. Adaptive Learning

After each action, the bot:
- Records success/failure
- Updates success rate statistics
- Adjusts action weights:
  - **Success** → Increase weight by 5%
  - **Failure** → Decrease weight by 5%

Example:
```
Combat: 80% success rate → weight increases from 1.0 to 1.4
Crime: 40% success rate → weight decreases from 0.8 to 0.6
```

---

## Action Implementations

### Combat
- Navigates to Actions/Combat page
- Selects from: Bar Brawl, Duel Outlaw, Hunt Wildlife, Clear Bandit Camp
- Waits for resolution
- Tracks success/failure

### Crime
- Navigates to Crimes page
- Selects from: Pickpocket, Steal from Market, Burgle Store, Rob
- Handles jail consequences
- Learns from outcomes

### Questing
- Finds Quest Log
- Accepts available quests
- Completes objectives
- Tracks rewards

### Trading
- Visits shops/markets
- Buys low, sells high (future enhancement)
- Manages inventory

### Crafting
- Visits workshop/forge
- Crafts useful items
- Improves gear

### Exploration
- Travels to new locations
- Discovers new content
- Unlocks opportunities

---

## Goals and Targets

### Default Goals

```typescript
targetLevel = 20
targetGold = 10000
```

### Progress Tracking

The bot logs progress every 10 cycles:

```
📊 Progress Report:
   Level: 8/20
   Gold: 3,450/10,000
   Actions performed:
     combat: 45 times (78.0% success)
     crime: 32 times (51.2% success)
     quest: 18 times (88.9% success)
     crafting: 12 times (75.0% success)
     exploring: 8 times (62.5% success)
```

### Goal Achievement

When both goals are met:
```
🎉 All goals achieved! Bot completing successfully.
```

The bot will print a final report and shut down.

---

## Monitoring

### Live Logs

Watch the console for:
- Decision-making reasoning
- Action outcomes
- Stats updates
- Error handling

Example:
```
=== Cycle 45/2000 ===
Current energy: 67
💡 Decision: combat (Priority: 9.60)
   Reasoning: Need XP to reach level 20. Combat success rate: 80.0%
⚡ Executing: combat
⚔️ Engaging in combat...
✅ Combat initiated
```

### Screenshots

Screenshots are saved to `client/tests/playtests/screenshots/`:
- `autonomous-cycle-20.png`
- `autonomous-cycle-40.png`
- `error-<timestamp>.png` (on errors)

### Metrics

The bot tracks:
- Total actions performed
- Success rates per action type
- Learned action weights
- Level/gold progression

---

## Advanced Configuration

### Modify Goals

Edit `AutonomousLevelerBot.ts`:

```typescript
private readonly targetLevel: number = 30;  // Change from 20
private readonly targetGold: number = 50000; // Change from 10000
```

### Adjust Action Weights

Edit initial weights in the constructor:

```typescript
private actionWeights: Map<string, number> = new Map([
  ['combat', 1.5],    // Prefer combat more
  ['crime', 0.3],     // Avoid crime
  ['crafting', 1.0],
  ['trading', 1.2],   // Prefer trading
  ['questing', 1.5],  // Prefer questing
  ['exploring', 0.8],
]);
```

### Change Cycle Count

Edit in `runBehaviorLoop()`:

```typescript
const maxCycles = 5000; // Increase from 2000 for longer sessions
```

### Adjust Wait Times

Edit human-like delays:

```typescript
// Between actions
await this.waitRandom(10000, 20000); // 10-20 seconds instead of 5-15

// Energy regeneration
await this.waitRandom(120000, 180000); // 2-3 minutes instead of 1-1.5
```

---

## Testing Strategy

The bot systematically tests:

### Game Systems Exercised

1. **Authentication**
   - Account registration
   - Login persistence
   - Session management

2. **Character System**
   - Character creation
   - Stat tracking
   - Level progression

3. **Combat System**
   - Various combat types
   - Damage calculations
   - Victory/defeat handling

4. **Economy**
   - Gold earning
   - Trading
   - Resource management

5. **Crime System**
   - Crime execution
   - Jail mechanics
   - Reputation effects

6. **Questing**
   - Quest discovery
   - Objective completion
   - Reward distribution

7. **Crafting**
   - Item creation
   - Resource consumption
   - Gear improvement

8. **Travel/Exploration**
   - Location navigation
   - Discovery mechanics
   - Map coverage

### What Gets Tested

- ✅ All navigation flows
- ✅ Button interactions
- ✅ Form submissions
- ✅ API calls (indirectly)
- ✅ State persistence
- ✅ Error handling
- ✅ UI responsiveness
- ✅ Game balance
- ✅ Progression systems

---

## Troubleshooting

### Bot Stops Immediately

**Problem:** Bot exits right after starting

**Solution:**
- Check that server is running on `localhost:5000`
- Check that client is running on `localhost:3001`
- Verify MongoDB is running

### Bot Gets Stuck

**Problem:** Bot repeats same action

**Solution:**
- Check screenshots to see what page it's on
- Look for error messages in logs
- May need to adjust selectors for UI elements

### Low Success Rates

**Problem:** Most actions failing

**Solution:**
- Character may be too low level for actions
- Check energy levels
- Review action requirements

### Navigation Issues

**Problem:** Bot can't find navigation links

**Solution:**
- Verify UI has proper link text (case-sensitive)
- Check that data attributes are present
- May need to update selectors

---

## File Structure

```
client/tests/playtests/autonomous/
├── AutonomousLevelerBot.ts       # Main bot implementation
├── runAutonomousLevelerBot.ts    # Runner script
└── README.md                     # This file

client/tests/playtests/utils/
├── BotBase.ts                    # Base class (login, register, etc.)
├── BotLogger.ts                  # Logging utilities
├── BotMetrics.ts                 # Metrics tracking
└── BotSelectors.ts               # UI selector helpers
```

---

## Example Output

```
======================================================================
🤖 AUTONOMOUS LEVELER BOT - Starting...
======================================================================

📝 Bot Configuration:
   Name: AutonomousLeveler
   Email: autobot1732901234567@test.com
   Character: Auto Desperado 1732901234567
   URL: http://localhost:3001
   Headless: false

🚀 Initializing bot...
📝 Registering account...
🎭 Creating character...
🎮 Starting autonomous gameplay loop...
   Target: Level 20 | 10,000 gold
   The bot will make intelligent decisions based on game state
   Press Ctrl+C to stop

=== Cycle 1/2000 ===
Current energy: 100
💡 Decision: quest (Priority: 10.20)
   Reasoning: Quests give good XP and rewards
⚡ Executing: quest
📜 Attempting quest...
✅ Quest started

=== Cycle 2/2000 ===
Current energy: 85
💡 Decision: combat (Priority: 8.00)
   Reasoning: Need XP to reach level 20. Combat success rate: 50.0%
⚡ Executing: combat
⚔️ Engaging in combat...
✅ Combat initiated

...

📊 Progress Report:
   Level: 12/20
   Gold: 5,234/10,000
   Actions performed:
     combat: 125 times (76.8% success)
     crime: 67 times (54.2% success)
     quest: 89 times (91.0% success)
     crafting: 34 times (70.6% success)
     trading: 23 times (82.6% success)
     exploring: 18 times (66.7% success)

...

🎉 All goals achieved! Bot completing successfully.

============================================================
🎮 AUTONOMOUS BOT - FINAL REPORT
============================================================
Final Level: 20/20
Final Gold: 10,456/10,000

Total Actions Performed: 356

Action Breakdown:
  combat: 125 attempts, 76.8% success rate
  crime: 67 attempts, 54.2% success rate
  quest: 89 attempts, 91.0% success rate
  crafting: 34 attempts, 70.6% success rate
  trading: 23 attempts, 82.6% success rate
  exploring: 18 attempts, 66.7% success rate

Learned Action Weights:
  combat: 1.42
  crime: 0.61
  crafting: 0.78
  trading: 0.95
  questing: 1.68
  exploring: 0.72
============================================================

✅ Bot completed successfully!
```

---

## Benefits

### For Development

- **Automated Testing** - Continuously exercises game systems
- **Bug Discovery** - Finds edge cases and errors
- **Balance Testing** - Reveals game balance issues
- **Performance Testing** - Stress tests with real usage patterns
- **Regression Prevention** - Catches breaking changes

### For Game Design

- **Progression Metrics** - Real data on leveling speed
- **Economy Balance** - Gold earning/spending patterns
- **Difficulty Calibration** - Success rates reveal if content is too easy/hard
- **System Usage** - Shows which features players (might) use

### For QA

- **24/7 Testing** - Can run overnight
- **Reproducible** - Same bot, same behavior
- **Comprehensive** - Tests multiple systems
- **Metrics-Driven** - Quantitative results

---

## Next Steps

### Enhancements

1. **Smarter Trading** - Buy low, sell high logic
2. **Gang Activities** - Join gang, participate in wars
3. **Social Interaction** - Friends, mail, chat
4. **Territory Control** - Claim and defend territories
5. **Specialized Builds** - Try different character builds
6. **Multi-Bot Coordination** - Run multiple bots that interact

### Integration

1. **CI/CD Pipeline** - Run bot in continuous integration
2. **Performance Dashboards** - Track metrics over time
3. **Automated Reporting** - Email results daily
4. **Comparison Testing** - A/B test game changes

---

## Conclusion

The Autonomous Leveler Bot provides intelligent, adaptive gameplay testing that exercises multiple game systems while pursuing realistic goals. Its decision-making and learning capabilities make it an excellent tool for comprehensive testing and game balance analysis.

**Start testing:** `npm run bot:autonomous`
