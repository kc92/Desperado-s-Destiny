# Desperados Destiny - Intelligent Playtest Bot System

**Version**: 2.0 (AI-Powered)
**Last Updated**: November 2025
**Status**: Production-Ready

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [System Architecture](#system-architecture)
- [Bot Types](#bot-types)
- [Running Bots](#running-bots)
- [Configuration](#configuration)
- [Output & Metrics](#output--metrics)
- [Documentation](#documentation)
- [System Requirements](#system-requirements)

---

## Overview

This is a **sophisticated AI-powered automated playtest system** featuring intelligent bots that simulate realistic player behavior. The system was built over 8 weeks and includes:

- **17+ TypeScript modules** with advanced AI decision-making
- **8 distinct personality archetypes** (Grinder, Social, Explorer, Combat, Economist, Criminal, Roleplayer, Chaos)
- **Intelligent decision engine** with goal-oriented behavior
- **Learning and memory system** that improves over time
- **Social intelligence** for friend/gang interactions
- **Emergent behavior** from personality + goals + memory
- **Comprehensive metrics** and performance tracking

### Key Features

- **Goal-Oriented Behavior**: Bots create and pursue dynamic goals
- **Personality-Driven Decisions**: 8 unique personalities drive different playstyles
- **Learning from Experience**: Bots remember past actions and adapt strategies
- **Social Networks**: Realistic friendship formation and gang participation
- **Human-Like Behavior**: Random delays, mistakes, exploration patterns
- **Adversarial Testing**: Dedicated bot for exploit discovery
- **Economic Simulation**: Market dynamics and resource optimization
- **Chat Generation**: Context-aware conversation with other players

---

## Quick Start

### 1. Prerequisites

```bash
# Server must be running
cd server
npm run dev

# Client must be running (in separate terminal)
cd client
npm run dev
```

### 2. Run All Bots (Recommended for Testing)

```bash
npm run playtest
```

This starts all 3 bots in parallel:
- **CombatBot**: Tests combat, duels, and PvE systems
- **EconomyBot**: Tests jobs, crafting, trading, and gold economy
- **SocialBot**: Tests chat, friends, mail, and gang systems

### 3. Run Individual Bots

```bash
# Combat-focused testing
npm run playtest:combat

# Economy-focused testing
npm run playtest:economy

# Social-focused testing
npm run playtest:social
```

### 4. Advanced: Run Adversarial Bot

```bash
cd client/tests/playtests/advanced
npx ts-node runAdversarialBot.ts
```

This bot actively searches for exploits, edge cases, and vulnerabilities.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BOT LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  CombatBot   │  │  EconomyBot  │  │  SocialBot   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         └──────────────────┴──────────────────┘             │
│                            ↓                                │
│                     ┌──────────────┐                        │
│                     │   BotBase    │                        │
│                     └──────┬───────┘                        │
└────────────────────────────┼────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────┐
│               INTELLIGENCE LAYER                            │
│                            ↓                                │
│  ┌─────────────┐  ┌────────────────┐  ┌─────────────┐     │
│  │ Personality │  │ DecisionEngine │  │ GoalManager │     │
│  │   System    │  │                │  │             │     │
│  └─────────────┘  └────────────────┘  └─────────────┘     │
│                                                             │
│  ┌─────────────┐  ┌────────────────┐  ┌─────────────┐     │
│  │  BotMemory  │  │     Social     │  │HumanBehavior│     │
│  │             │  │  Intelligence  │  │  Simulator  │     │
│  └─────────────┘  └────────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────┐
│               AUTOMATION LAYER                              │
│                            ↓                                │
│  ┌─────────────┐  ┌────────────────┐  ┌─────────────┐     │
│  │PageObjects  │  │  BotSelectors  │  │ BotMetrics  │     │
│  └─────────────┘  └────────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed system design.

---

## Bot Types

### 1. CombatBot (Combat-Focused Warrior)

**Personality**: Combat Enthusiast
**Primary Goals**: Win duels, max combat skills, defeat bosses
**Behaviors**:
- Seeks PvP duels with other players
- Hunts bounties and notorious outlaws
- Upgrades weapons and armor strategically
- Trains combat skills
- Completes combat-oriented quests

**Test Coverage**:
- Combat encounter mechanics
- Duel matchmaking and outcomes
- Weapon/armor effectiveness
- Combat skill progression
- PvP balance

### 2. EconomyBot (Market-Savvy Trader)

**Personality**: Economist
**Primary Goals**: Accumulate wealth, craft items, optimize efficiency
**Behaviors**:
- Completes high-paying jobs
- Gathers crafting resources
- Crafts and sells items for profit
- Monitors market prices
- Optimizes gold-per-hour efficiency

**Test Coverage**:
- Job completion and payouts
- Crafting system mechanics
- Market pricing and trading
- Resource gathering efficiency
- Economic balance

### 3. SocialBot (Community-Focused Connector)

**Personality**: Social Butterfly
**Primary Goals**: Make friends, join gangs, socialize
**Behaviors**:
- Sends chat messages in context
- Adds friends based on compatibility
- Sends mail to other players
- Joins and participates in gang activities
- Completes social quests

**Test Coverage**:
- Chat system functionality
- Friend request/acceptance flow
- Mail sending and receiving
- Gang recruitment and activities
- Social network formation

### 4. AdversarialBot (Security Tester)

**Personality**: Chaos Agent
**Primary Goals**: Find exploits, test edge cases
**Behaviors**:
- Rapid-fire API requests
- Invalid input combinations
- Race condition testing
- Resource exhaustion attempts
- Unusual action sequences

**Test Coverage**:
- API rate limiting
- Input validation
- Edge case handling
- System stability
- Security vulnerabilities

---

## Running Bots

### Configuration Options

Each bot accepts a configuration object:

```typescript
interface BotConfig {
  name: string;              // Display name for logging
  username: string;          // Game username
  email: string;            // Login email
  password: string;         // Password
  characterName: string;    // Character name to create/use
  baseUrl?: string;         // Game URL (default: http://localhost:3002)
  headless?: boolean;       // Run headless (default: false)
  slowMo?: number;          // Delay between actions in ms (default: 50)
}
```

### Customizing Bot Behavior

Edit `runPlaytests.ts` to customize:

```typescript
const botConfigs = {
  combat: {
    name: 'CombatBot-Gunslinger',
    username: 'playtest_combat',
    email: 'combat.bot@playtest.local',
    password: 'TestBot123!',
    characterName: 'GunslingerBot',
    headless: false,        // Set to true for headless mode
    slowMo: 30,            // Adjust speed (0-100ms recommended)
  },
  // ... other bots
};
```

### Stopping Bots Gracefully

Press `Ctrl+C` to stop all bots. The system will:
1. Complete current actions
2. Save all metrics data
3. Generate summary reports
4. Close browser instances cleanly

---

## Configuration

### Environment Variables

Create a `.env` file (optional):

```bash
# Game server URL
GAME_URL=http://localhost:3002

# Bot run duration (cycles)
BOT_MAX_CYCLES=1000

# Default slowMo value
BOT_SLOW_MO=30

# Headless mode
BOT_HEADLESS=false
```

### Personality Tuning

Modify personality traits in `intelligence/PersonalitySystem.ts`:

```typescript
const COMBAT_ARCHETYPE: PersonalityProfile = {
  archetype: 'combat',
  traits: {
    riskTolerance: 0.85,    // 0 = cautious, 1 = reckless
    sociability: 0.4,       // 0 = solo, 1 = social
    patience: 0.5,          // 0 = impulsive, 1 = patient
    greed: 0.6,            // 0 = altruistic, 1 = greedy
    aggression: 0.9,       // 0 = peaceful, 1 = combative
    loyalty: 0.6,          // 0 = independent, 1 = loyal
    curiosity: 0.3,        // 0 = routine, 1 = exploratory
  },
  // ... other settings
};
```

---

## Output & Metrics

### Directory Structure

```
client/tests/playtests/
├── data/           # Metrics and performance data
├── logs/           # Detailed execution logs
└── screenshots/    # Visual snapshots (if enabled)
```

### Metrics Files

**Raw Data** (`data/{BotName}-metrics-{timestamp}.json`):
```json
{
  "botName": "CombatBot-Gunslinger",
  "startTime": "2025-11-27T04:00:00.000Z",
  "actions": [
    {
      "action": "combat_bandit",
      "timestamp": "2025-11-27T04:01:23.456Z",
      "success": true,
      "energyCost": 15,
      "goldReward": 50,
      "metadata": { ... }
    }
  ]
}
```

**Summary Report** (`data/{BotName}-metrics-{timestamp}-summary.json`):
```json
{
  "totalActions": 347,
  "successRate": 0.83,
  "totalGoldEarned": 2450,
  "totalEnergySpent": 1850,
  "goalsCompleted": 5,
  "friendsAdded": 7,
  "combatWins": 23,
  "efficiency": {
    "goldPerHour": 612.5,
    "actionsPerHour": 86.75
  }
}
```

### Log Files

**Log Format** (`logs/{BotName}-{timestamp}.log`):
```
[2025-11-27 04:00:10] INFO  - Browser initialized
[2025-11-27 04:00:15] INFO  - Login complete
[2025-11-27 04:00:20] ACTION - Starting combat encounter
[2025-11-27 04:00:25] METRIC - Combat won: +50 gold, -15 energy
[2025-11-27 04:00:30] DECISION - Selected: Fight Bandits (score: 87.3)
[2025-11-27 04:00:35] GOAL - Progress: Earn 1000 Gold (24%)
```

---

## Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| [README.md](./README.md) | This file - overview and quick start | All users |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Detailed system architecture | Developers |
| [DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md) | How to extend the system | Developers |
| [MAINTENANCE.md](./docs/MAINTENANCE.md) | Troubleshooting and maintenance | DevOps/Maintainers |
| [USAGE_GUIDE.md](./docs/USAGE_GUIDE.md) | Advanced usage and configuration | Power users |
| [API_REFERENCE.md](./docs/API_REFERENCE.md) | Complete API documentation | Developers |
| [THEORY.md](./docs/THEORY.md) | AI concepts and game theory | Research/Design |

---

## System Requirements

### Software Requirements
- **Node.js**: v16+
- **npm**: v7+
- **TypeScript**: v4.5+
- **Puppeteer**: v19+

### Hardware Requirements
- **RAM**: 4GB minimum, 8GB recommended (per bot)
- **CPU**: Multi-core processor (bots run in parallel)
- **Disk**: 500MB for logs and metrics per test run

### Browser Requirements
- **Chromium/Chrome**: Installed and accessible to Puppeteer
- **Display**: Not required if running headless

### Game Server Requirements
- Game server running on `http://localhost:3002` (default)
- Test accounts pre-created or registration enabled
- Rate limiting disabled or configured for bot accounts

---

## Troubleshooting

### Common Issues

**Bot won't start**
```bash
# Check if server is running
curl http://localhost:3002

# Check Node version
node --version  # Should be v16+

# Reinstall dependencies
npm install
```

**Login fails**
- Verify bot account exists in database
- Check credentials in `runPlaytests.ts`
- Ensure server is accessible

**Slow performance**
- Reduce `slowMo` value
- Enable headless mode: `headless: true`
- Reduce `BOT_MAX_CYCLES`

**Browser crashes**
- Increase system RAM
- Run bots sequentially instead of parallel
- Enable headless mode

### Debug Mode

Enable detailed logging:

```typescript
const bot = new CombatBot({
  ...config,
  debug: true  // Add debug flag
});
```

---

## Contributing

### Adding New Behaviors

1. Create goal in `GoalManager.ts`
2. Add decision logic in `DecisionEngine.ts`
3. Implement action in bot file
4. Add metrics tracking

### Creating New Bot Types

1. Extend `BotBase` class
2. Define personality profile
3. Implement `runBehaviorLoop()`
4. Add to `runPlaytests.ts`

See [DEVELOPER_GUIDE.md](./docs/DEVELOPER_GUIDE.md) for details.

---

## License

Internal development tool for Desperados Destiny project.

---

## Credits

Developed as part of Desperados Destiny game development, 2025.

**System Components**:
- Bot Framework (Week 1-2)
- AI Intelligence Layer (Week 3-4)
- Social Systems (Week 5-6)
- Economy & Metrics (Week 7-8)
