# Playtest Bot System Architecture

**Document Version**: 2.0
**Last Updated**: November 2025
**Status**: Production-Ready

## Table of Contents

- [System Overview](#system-overview)
- [Architectural Layers](#architectural-layers)
- [Component Relationships](#component-relationships)
- [Data Flow](#data-flow)
- [Design Decisions](#design-decisions)
- [Technology Stack](#technology-stack)
- [Scalability & Performance](#scalability--performance)

---

## System Overview

The playtest bot system is a **three-layer architecture** designed for intelligent, autonomous game testing:

```
┌─────────────────────────────────────────────────────────────────┐
│                        BOT LAYER                                │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  CombatBot   │  │  EconomyBot  │  │  SocialBot   │          │
│  │              │  │              │  │              │          │
│  │ - run()      │  │ - run()      │  │ - run()      │          │
│  │ - combat()   │  │ - jobs()     │  │ - chat()     │          │
│  │ - duels()    │  │ - craft()    │  │ - mail()     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         └──────────────────┴──────────────────┘                 │
│                            ↓                                    │
│                     ┌──────────────┐                            │
│                     │   BotBase    │                            │
│                     │              │                            │
│                     │ - init()     │                            │
│                     │ - login()    │                            │
│                     │ - navigate() │                            │
│                     └──────┬───────┘                            │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                   INTELLIGENCE LAYER                            │
│                            ↓                                    │
│  ┌─────────────────┐  ┌────────────────┐  ┌─────────────────┐ │
│  │ Personality     │  │ DecisionEngine │  │  GoalManager    │ │
│  │   System        │  │                │  │                 │ │
│  │                 │  │ - scoreAction  │  │ - createGoal    │ │
│  │ - 8 archetypes  │  │ - selectBest   │  │ - trackProgress │ │
│  │ - trait-driven  │  │ - explainWhy   │  │ - completeGoal  │ │
│  └─────────────────┘  └────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌────────────────┐  ┌─────────────────┐ │
│  │   BotMemory     │  │    Social      │  │  HumanBehavior  │ │
│  │                 │  │  Intelligence  │  │    Simulator    │ │
│  │ - recordAction  │  │                │  │                 │ │
│  │ - learnPattern  │  │ - friendships  │  │ - delays        │ │
│  │ - recommend     │  │ - gangs        │  │ - mistakes      │ │
│  └─────────────────┘  └────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌────────────────┐                       │
│  │  ChatGenerator  │  │   Emergent     │                       │
│  │                 │  │   Dynamics     │                       │
│  │ - context-aware │  │                │                       │
│  │ - personality   │  │ - economics    │                       │
│  │ - realistic     │  │ - social graph │                       │
│  └─────────────────┘  └────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                   AUTOMATION LAYER                              │
│                            ↓                                    │
│  ┌─────────────────┐  ┌────────────────┐  ┌─────────────────┐ │
│  │  PageObjects    │  │  BotSelectors  │  │   BotMetrics    │ │
│  │                 │  │                │  │                 │ │
│  │ - LoginPage     │  │ - clickButton  │  │ - record()      │ │
│  │ - CombatPage    │  │ - typeInput    │  │ - save()        │ │
│  │ - ShopPage      │  │ - waitElement  │  │ - summarize()   │ │
│  │ - GangPage      │  │ - getText      │  │                 │ │
│  └─────────────────┘  └────────────────┘  └─────────────────┘ │
│                                                                 │
│  ┌─────────────────┐  ┌────────────────┐                       │
│  │   BotLogger     │  │  Puppeteer     │                       │
│  │                 │  │   Helpers      │                       │
│  │ - info()        │  │                │                       │
│  │ - error()       │  │ - find()       │                       │
│  │ - action()      │  │ - click()      │                       │
│  └─────────────────┘  └────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architectural Layers

### Layer 1: Bot Layer (High-Level Behavior)

**Purpose**: Implements specific bot types and orchestrates high-level actions

**Components**:
- **BotBase** (abstract): Common functionality for all bots
  - Browser initialization
  - Login/authentication
  - Navigation
  - Resource tracking (gold, energy)
  - Lifecycle management

- **CombatBot**: Combat-focused testing
  - PvE combat encounters
  - Player duels
  - Bounty hunting
  - Gear upgrades

- **EconomyBot**: Economic system testing
  - Job completion
  - Crafting and trading
  - Market interactions
  - Resource optimization

- **SocialBot**: Social feature testing
  - Chat messages
  - Friend management
  - Mail system
  - Gang participation

- **AdversarialBot**: Security testing
  - Exploit discovery
  - Edge case testing
  - Rate limit testing
  - Invalid input combinations

**Design Pattern**: Template Method pattern - BotBase defines the skeleton, subclasses fill in specific behaviors

---

### Layer 2: Intelligence Layer (AI Decision-Making)

**Purpose**: Provides intelligent, human-like decision-making capabilities

**Components**:

#### 1. PersonalitySystem
- **8 personality archetypes**: Grinder, Social, Explorer, Combat, Economist, Criminal, Roleplayer, Chaos
- **7 trait dimensions**: riskTolerance, sociability, patience, greed, aggression, loyalty, curiosity
- **Trait values**: 0.0 (minimum) to 1.0 (maximum)
- **Purpose**: Drives decision-making preferences and behavior patterns

**Example**:
```typescript
{
  archetype: 'combat',
  traits: {
    riskTolerance: 0.85,  // High risk acceptance
    aggression: 0.9,      // Very combative
    sociability: 0.4,     // Somewhat social
    // ...
  }
}
```

#### 2. DecisionEngine
- **Multi-factor scoring**: Goals, efficiency, risk, personality, history
- **Context-aware**: Considers game state, resources, time of day
- **Explainable AI**: Generates human-readable reasoning
- **Learning integration**: Uses historical data to improve decisions

**Scoring Formula**:
```
finalScore = (baseScore + goalAlignment + resourceEfficiency +
              riskAdjustment + historicalBonus + situationalBonus)
             × personalityMultiplier × preferenceMultiplier
```

#### 3. GoalManager
- **14 goal types**: level_up, earn_gold, join_gang, max_skill, complete_quest, win_duels, unlock_location, craft_item, make_friends, explore, buy_property, achieve_rank, collect_items, defeat_boss
- **Dynamic priority**: Adjusts based on deadlines, progress, urgency
- **Emergent goals**: Completing goals generates new follow-up goals
- **Goal chains**: Prerequisites and dependencies

**Goal Lifecycle**:
1. Initialize starter goals based on personality
2. Track progress via game context
3. Dynamically adjust priorities
4. Complete goal → generate follow-ups
5. Create emergent goal chains

#### 4. BotMemory
- **Limited memory**: 1000 recent actions (human-like forgetting)
- **Pattern recognition**: Detects correlations (health/success, time/outcome)
- **Combo learning**: Identifies effective action sequences
- **Risk calibration**: Learns actual vs. estimated risk
- **Efficiency tracking**: Gold per energy, gold per minute

**Learning Process**:
1. Record action outcome
2. Update success rates
3. Detect patterns
4. Identify combos
5. Calibrate risk
6. Generate recommendations

#### 5. SocialIntelligence
- **Relationship tracking**: 4 stages (stranger, acquaintance, friend, close friend)
- **Affinity calculation**: Based on interactions, shared interests, compatibility
- **Friend request logic**: Considers personality, mutual friends, faction
- **Gang compatibility**: Assesses fit based on gang reputation, values
- **Relationship decay**: Affinity decreases without interaction

#### 6. HumanBehaviorSimulator
- **Realistic delays**: Variable wait times (not robotic)
- **Mistakes**: Occasional wrong clicks, typos
- **Exploration**: Wandering, curiosity-driven actions
- **Fatigue simulation**: Performance degrades over time
- **Break patterns**: Periodic pauses

#### 7. ChatGenerator
- **Context-aware**: Generates appropriate messages for situation
- **Personality-driven**: Message tone matches bot personality
- **Variety**: Avoids repetition, uses templates with variation
- **Realistic conversation**: Responds to context, maintains coherence

#### 8. EmergentDynamics
- **Economic modeling**: Supply/demand, price fluctuations
- **Social networks**: Clustering, centrality measures, community detection
- **Faction dynamics**: Reputation propagation, conflict simulation

---

### Layer 3: Automation Layer (Browser Interaction)

**Purpose**: Handles low-level browser automation and data collection

**Components**:

#### 1. PageObjects
- **Page Object Pattern**: Encapsulates page-specific selectors and actions
- **15+ page classes**: LoginPage, CombatPage, ShopPage, GangPage, etc.
- **Selector centralization**: All selectors in one place per page
- **Maintainability**: Easy to update when UI changes

**Example**:
```typescript
class CombatPage extends BasePage {
  private selectors = {
    attackButton: ['Fight', 'Attack', 'Strike'],
    victoryText: ['Victory', 'Won']
  };

  async attack(): Promise<boolean> {
    return await clickButtonByText(this.page, ...this.selectors.attackButton);
  }
}
```

#### 2. BotSelectors
- **Flexible selectors**: Multiple text variations per element
- **Resilient**: Works across UI iterations
- **Text-based**: Uses visible labels (not brittle CSS selectors)
- **Helper functions**: clickButtonByText, typeByPlaceholder, hasElementWithText

#### 3. PuppeteerHelpers
- **Low-level utilities**: findButtonByText, waitAndClickButton
- **DOM manipulation**: Direct browser interaction
- **Error handling**: Robust retry logic

#### 4. BotMetrics
- **Action tracking**: Records every bot action with timestamp
- **Performance metrics**: Gold/hour, actions/hour, success rates
- **Real-time updates**: Continuous data collection
- **Summary generation**: Aggregated reports at completion

**Metric Types**:
- Action counts
- Success/failure rates
- Resource changes (gold, energy)
- Time-based metrics
- Goal progress
- Social interactions

#### 5. BotLogger
- **Structured logging**: INFO, ACTION, DECISION, GOAL, ERROR levels
- **File output**: Timestamped log files
- **Console output**: Real-time monitoring
- **Debugging**: Detailed execution traces

---

## Component Relationships

### Data Flow Diagram

```
User Starts Bot
      ↓
┌─────────────┐
│   BotBase   │
│   init()    │
└─────┬───────┘
      ↓
┌─────────────────┐
│  Personality    │
│  System         │
│  (load profile) │
└─────┬───────────┘
      ↓
┌─────────────────┐
│  GoalManager    │
│  (init goals)   │
└─────┬───────────┘
      ↓
┌─────────────────┐
│  BotMemory      │
│  (empty)        │
└─────┬───────────┘
      ↓
┌──────────────────────────────────┐
│       Behavior Loop              │
│                                  │
│  1. Get game context             │
│  2. DecisionEngine.selectAction  │
│  3. PageObject.performAction     │
│  4. BotMetrics.recordAction      │
│  5. BotMemory.recordOutcome      │
│  6. GoalManager.updateProgress   │
│  7. Repeat                       │
└──────────────────────────────────┘
      ↓
Save Metrics & Logs
```

### Decision-Making Flow

```
Game Context
      ↓
┌─────────────────────────┐
│   DecisionEngine        │
│                         │
│   For each action:      │
│   1. Check viable       │
│   2. Calculate scores   │
│   3. Apply personality  │
│   4. Use history        │
│   5. Add variance       │
└─────────┬───────────────┘
          ↓
    Scored Actions
          ↓
┌─────────────────────────┐
│   Select Best Action    │
│   (highest score)       │
└─────────┬───────────────┘
          ↓
    Perform Action
          ↓
┌─────────────────────────┐
│   Record Outcome        │
│   - Success/failure     │
│   - Rewards/costs       │
│   - Context             │
└─────────┬───────────────┘
          ↓
    Update Memory & Goals
```

### Integration Points

**Bot ↔ Intelligence**:
- Bot provides game context
- Intelligence returns decisions
- Bot executes decisions
- Bot reports outcomes back

**Intelligence ↔ Memory**:
- DecisionEngine queries historical success rates
- Memory provides pattern recommendations
- GoalManager updates based on learned efficiency

**Bot ↔ Automation**:
- Bot calls PageObject methods
- PageObjects use BotSelectors
- Selectors use PuppeteerHelpers
- Results flow back up

---

## Design Decisions

### 1. Why Three Layers?

**Separation of Concerns**:
- **Bot Layer**: What to test (domain logic)
- **Intelligence Layer**: How to decide (AI logic)
- **Automation Layer**: How to interact (technical implementation)

**Benefits**:
- Easy to modify AI without changing browser code
- Easy to add new bot types without rewriting intelligence
- Each layer can be tested independently

### 2. Why Personality-Driven?

**Realistic Diversity**:
- Real players have different playstyles
- Testing needs to cover all player types
- Single bot behavior misses edge cases

**Emergent Behavior**:
- Personality + Goals + Memory = Complex, realistic behavior
- Bots develop unique "identities" over time
- More thorough testing than scripted bots

### 3. Why Goal-Oriented?

**Human-Like Purposefulness**:
- Real players have objectives
- Random actions don't stress-test progression systems
- Goal chains test long-term game loops

**Adaptive Testing**:
- Goals adjust to game state
- Bots pursue realistic objectives
- Tests actual player journeys

### 4. Why Learning/Memory?

**Continuous Improvement**:
- Bots get better over time
- Discover optimal strategies
- Adapt to game balance changes

**Pattern Discovery**:
- Finds correlations humans might miss
- Identifies successful action sequences
- Calibrates risk accurately

### 5. Why Page Object Pattern?

**Maintainability**:
- UI changes only require updating one file
- Selectors centralized per page
- No duplicate selector definitions

**Reusability**:
- All bots share same page objects
- Consistent interaction patterns
- DRY principle

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **TypeScript** | 4.5+ | Type safety, better tooling |
| **Node.js** | 16+ | Runtime environment |
| **Puppeteer** | 19+ | Browser automation |
| **Chromium** | Latest | Headless browser |

### Why TypeScript?

- **Type Safety**: Catch errors at compile time
- **IntelliSense**: Better developer experience
- **Refactoring**: Safe code changes
- **Documentation**: Types serve as inline docs

### Why Puppeteer?

- **Headless Chrome**: Real browser environment
- **Full API**: Complete control over browser
- **Performance**: Fast execution
- **Debugging**: Can run in visible mode

---

## Scalability & Performance

### Horizontal Scaling

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ CombatBot │  │EconomyBot│  │ SocialBot │
│ Instance  │  │ Instance │  │ Instance  │
└─────┬────┘  └─────┬────┘  └─────┬────┘
      │             │             │
      └─────────────┴─────────────┘
                    │
            ┌───────┴────────┐
            │  Game Server   │
            └────────────────┘
```

**Concurrent Execution**:
- Bots run in parallel
- Independent browser instances
- Shared game server

**Resource Requirements**:
- ~1GB RAM per bot
- ~10% CPU per bot
- Network bandwidth minimal

### Vertical Scaling

**Optimize Single Bot**:
- Headless mode (less memory)
- Reduce slowMo delay
- Batch metric writes
- Periodic memory cleanup

### Performance Benchmarks

| Metric | Value |
|--------|-------|
| Bot startup time | ~5 seconds |
| Action execution | ~1-3 seconds |
| Memory per bot | ~800MB |
| Actions per hour | ~80-120 |
| Metrics file size | ~5MB per 1000 actions |

---

## File Organization

```
client/tests/playtests/
├── bots/                    # Bot Layer
│   ├── CombatBot.ts
│   ├── EconomyBot.ts
│   └── SocialBot.ts
│
├── intelligence/            # Intelligence Layer
│   ├── PersonalitySystem.ts
│   ├── DecisionEngine.ts
│   ├── GoalManager.ts
│   ├── BotMemory.ts
│   └── (example files)
│
├── social/                  # Social Intelligence
│   ├── SocialIntelligence.ts
│   ├── ChatGenerator.ts
│   └── EmergentDynamics.ts
│
├── behavior/               # Human Behavior
│   └── HumanBehaviorSimulator.ts
│
├── advanced/               # Advanced Bots
│   ├── AdversarialBot.ts
│   └── runAdversarialBot.ts
│
├── utils/                  # Automation Layer
│   ├── BotBase.ts
│   ├── BotLogger.ts
│   ├── BotMetrics.ts
│   ├── BotSelectors.ts
│   ├── PageObjects.ts
│   ├── PuppeteerHelpers.ts
│   └── index.ts
│
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md (this file)
│   ├── DEVELOPER_GUIDE.md
│   ├── MAINTENANCE.md
│   ├── USAGE_GUIDE.md
│   ├── API_REFERENCE.md
│   └── THEORY.md
│
├── data/                   # Metrics output
├── logs/                   # Log output
├── examples/               # Code examples
│
└── runPlaytests.ts        # Main entry point
```

---

## Evolution Timeline

**Week 1-2: Foundation**
- BotBase, BotLogger, BotMetrics
- BotSelectors, PuppeteerHelpers
- Basic CombatBot, EconomyBot, SocialBot
- Page Object Pattern

**Week 3-4: Intelligence**
- PersonalitySystem (8 archetypes)
- DecisionEngine (multi-factor scoring)
- GoalManager (14 goal types)
- BotMemory (learning system)

**Week 5-6: Social**
- SocialIntelligence
- ChatGenerator
- EmergentDynamics
- Network formation

**Week 7-8: Advanced**
- AdversarialBot
- Economic modeling
- Comprehensive metrics
- Full documentation

---

## Summary

The playtest bot system is a production-ready, three-layer architecture that combines:

- **Intelligent decision-making** (8 personalities, goal-oriented behavior, learning)
- **Robust automation** (Page Objects, flexible selectors, error handling)
- **Comprehensive metrics** (detailed logging, performance tracking, summary reports)

The architecture is designed for:
- **Maintainability**: Clear separation of concerns
- **Extensibility**: Easy to add new bots and behaviors
- **Scalability**: Parallel execution, efficient resource usage
- **Realism**: Human-like behavior through personality + goals + memory

**Next Steps**: See [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for extending the system.
