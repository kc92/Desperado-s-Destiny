# BotMemory System Architecture

## Overview

The BotMemory system is a sophisticated machine learning framework that enables bot players to learn from experience, recognize patterns, and make intelligent decisions based on historical data.

```
┌─────────────────────────────────────────────────────────────┐
│                      BOT MEMORY SYSTEM                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐                   │
│  │   Record     │      │   Pattern    │                   │
│  │   Outcome    │─────▶│  Detection   │                   │
│  └──────────────┘      └──────────────┘                   │
│         │                      │                            │
│         │                      ▼                            │
│         │              ┌──────────────┐                    │
│         │              │  Learning    │                    │
│         │              │  Algorithms  │                    │
│         │              └──────────────┘                    │
│         │                      │                            │
│         ▼                      ▼                            │
│  ┌──────────────┐      ┌──────────────┐                   │
│  │   Memory     │      │    Stats &   │                   │
│  │   Storage    │      │  Analytics   │                   │
│  │  (Limited)   │      └──────────────┘                   │
│  └──────────────┘              │                            │
│         │                      │                            │
│         │                      ▼                            │
│         │              ┌──────────────┐                    │
│         └─────────────▶│ Recommend-   │                   │
│                        │   ations     │                   │
│                        └──────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

```
Action Performed
      │
      ▼
┌──────────────┐
│   Context    │ ← Health, Energy, Location, Time, Equipment
├──────────────┤
│   Action     │ ← Type, Target, Parameters
├──────────────┤
│   Outcome    │ ← Success, Reward, Cost, Duration, Error
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────┐
│         LEARNING SUBSYSTEMS              │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────┐  ┌────────────────┐ │
│  │ Success Rate   │  │ Pattern        │ │
│  │ Tracking       │  │ Recognition    │ │
│  └────────────────┘  └────────────────┘ │
│                                          │
│  ┌────────────────┐  ┌────────────────┐ │
│  │ Combo          │  │ Temporal       │ │
│  │ Detection      │  │ Analysis       │ │
│  └────────────────┘  └────────────────┘ │
│                                          │
│  ┌────────────────┐  ┌────────────────┐ │
│  │ Risk           │  │ Efficiency     │ │
│  │ Calibration    │  │ Optimization   │ │
│  └────────────────┘  └────────────────┘ │
│                                          │
└────────────┬─────────────────────────────┘
             │
             ▼
    ┌────────────────┐
    │ Recommendations│
    │  & Insights    │
    └────────────────┘
```

## Core Components

### 1. Memory Storage

```
┌─────────────────────────────────────┐
│          MEMORY STORAGE             │
├─────────────────────────────────────┤
│                                     │
│  History: ActionOutcome[]           │
│  ├─ Limited size (1000 default)     │
│  ├─ Automatic pruning (FIFO)        │
│  └─ Full context preservation       │
│                                     │
│  Success Rates: Map<string, number> │
│  ├─ Per action type                 │
│  ├─ Updated on each action          │
│  └─ Used for decision making        │
│                                     │
│  Patterns: Map<string, Pattern>     │
│  ├─ Context correlations            │
│  ├─ Confidence scores               │
│  └─ Trend tracking                  │
│                                     │
│  Combos: Map<string, ActionCombo>   │
│  ├─ Action sequences                │
│  ├─ Success rates                   │
│  └─ Average rewards                 │
│                                     │
└─────────────────────────────────────┘
```

### 2. Pattern Recognition

```
┌─────────────────────────────────────────────┐
│           PATTERN DETECTION                 │
├─────────────────────────────────────────────┤
│                                             │
│  Health Patterns                            │
│  ├─ combat_health_20 → 25% success          │
│  ├─ combat_health_40 → 55% success          │
│  ├─ combat_health_60 → 78% success          │
│  └─ combat_health_80 → 92% success          │
│                                             │
│  Energy Patterns                            │
│  ├─ job_energy_0 → 45% success              │
│  ├─ job_energy_25 → 68% success             │
│  ├─ job_energy_50 → 82% success             │
│  └─ job_energy_75 → 87% success             │
│                                             │
│  Location Patterns                          │
│  ├─ crime_location_bank → 65% success       │
│  ├─ crime_location_saloon → 40% success     │
│  └─ job_location_ranch → 78% success        │
│                                             │
│  Equipment Patterns                         │
│  ├─ combat_equipped → 75% success           │
│  └─ combat_unequipped → 48% success         │
│                                             │
│  Level Patterns                             │
│  ├─ combat_level_0 → 45% success            │
│  ├─ combat_level_5 → 68% success            │
│  └─ combat_level_10 → 82% success           │
│                                             │
└─────────────────────────────────────────────┘
```

### 3. Combo Learning

```
┌─────────────────────────────────────────────┐
│            COMBO DETECTION                  │
├─────────────────────────────────────────────┤
│                                             │
│  Sequence Window: [action-2, action-1, action-0]
│                                             │
│  Example Combos:                            │
│  ┌─────────────────────────────────────┐   │
│  │ job → upgrade → combat              │   │
│  │  Success: 88%                       │   │
│  │  Avg Reward: 110 gold               │   │
│  │  Confidence: 0.85                   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ rest → job → job                    │   │
│  │  Success: 92%                       │   │
│  │  Avg Reward: 65 gold                │   │
│  │  Confidence: 0.78                   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ crime → crime → crime               │   │
│  │  Success: 22%                       │   │
│  │  Avg Reward: 45 gold                │   │
│  │  Confidence: 0.65 (AVOID)           │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

### 4. Temporal Patterns

```
┌─────────────────────────────────────────────┐
│         TEMPORAL PATTERN ANALYSIS           │
├─────────────────────────────────────────────┤
│                                             │
│  Morning (6am-12pm)                         │
│  ├─ job: 87% success, 32 avg reward         │
│  ├─ combat: 65% success, 45 avg reward      │
│  └─ crime: 42% success, 78 avg reward       │
│                                             │
│  Afternoon (12pm-6pm)                       │
│  ├─ job: 72% success, 28 avg reward         │
│  ├─ combat: 78% success, 52 avg reward      │
│  └─ crime: 55% success, 88 avg reward       │
│                                             │
│  Evening (6pm-10pm)                         │
│  ├─ job: 65% success, 25 avg reward         │
│  ├─ combat: 72% success, 48 avg reward      │
│  └─ crime: 68% success, 102 avg reward      │
│                                             │
│  Night (10pm-6am)                           │
│  ├─ job: 58% success, 22 avg reward         │
│  ├─ combat: 82% success, 58 avg reward      │
│  └─ crime: 72% success, 115 avg reward      │
│                                             │
│  Optimal Schedule:                          │
│  Morning    → Jobs (highest success)        │
│  Afternoon  → Combat (strong NPCs awake)    │
│  Evening    → Crimes (guards changing)      │
│  Night      → Combat/Crimes (best rewards)  │
│                                             │
└─────────────────────────────────────────────┘
```

### 5. Efficiency Optimization

```
┌─────────────────────────────────────────────┐
│        EFFICIENCY METRICS                   │
├─────────────────────────────────────────────┤
│                                             │
│  Gold per Energy:                           │
│  ┌─────────────────────────────┐           │
│  │ crime:  4.2 gold/energy     │ ← Best    │
│  │ combat: 3.1 gold/energy     │           │
│  │ job:    2.8 gold/energy     │           │
│  └─────────────────────────────┘           │
│                                             │
│  Gold per Minute:                           │
│  ┌─────────────────────────────┐           │
│  │ job:    20.5 gold/min       │ ← Best    │
│  │ combat: 16.8 gold/min       │           │
│  │ crime:  12.2 gold/min       │           │
│  └─────────────────────────────┘           │
│                                             │
│  Overall Score (reward/cost × success):     │
│  ┌─────────────────────────────┐           │
│  │ job:    2.38                │ ← Best    │
│  │ combat: 2.17                │           │
│  │ crime:  1.89                │           │
│  └─────────────────────────────┘           │
│                                             │
│  Recommendation:                            │
│  - High energy: crimes (best reward/energy) │
│  - Limited time: jobs (fastest)             │
│  - Balanced: jobs (best overall score)      │
│                                             │
└─────────────────────────────────────────────┘
```

### 6. Recommendation System

```
┌─────────────────────────────────────────────┐
│          RECOMMENDATION ENGINE              │
├─────────────────────────────────────────────┤
│                                             │
│  Input: Current GameContext                 │
│  ├─ Character state (health, energy, etc.)  │
│  ├─ Time of day                             │
│  ├─ Location                                │
│  └─ Recent actions                          │
│                                             │
│  Analysis:                                  │
│  ├─ Check learned patterns                  │
│  ├─ Evaluate temporal factors               │
│  ├─ Consider combo opportunities            │
│  └─ Assess efficiency metrics               │
│                                             │
│  Output: Recommendation                     │
│                                             │
│  Examples:                                  │
│  ┌─────────────────────────────────────┐   │
│  │ avoid_combat_low_health             │   │
│  │  ├─ Health: 25                      │   │
│  │  ├─ Pattern: combat_health_20       │   │
│  │  ├─ Success Rate: 22%               │   │
│  │  └─ Confidence: 0.85                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ focus_jobs_morning                  │   │
│  │  ├─ Time: 8am                       │   │
│  │  ├─ Pattern: morning_job            │   │
│  │  ├─ Success Rate: 87%               │   │
│  │  └─ Avg Reward: 32 gold             │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ complete_combo_job->upgrade->combat │   │
│  │  ├─ Recent: [job, upgrade]          │   │
│  │  ├─ Combo Success: 88%              │   │
│  │  ├─ Avg Reward: 110 gold            │   │
│  │  └─ Confidence: 0.85                │   │
│  └─────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

## Learning Progression

```
Action Count:      0      50     100    200    500    1000
                   │       │       │      │      │      │
Success Rate:  50% ├──────>├──────>├─────>├─────>├─────>│ 72%
                   │       │       │      │      │      │
Patterns:        0 ├──────>├──────>├─────>├─────>├─────>│ 15
                   │       │       │      │      │      │
Combos:          0 ├──────>├──────>├─────>├─────>├─────>│ 7
                   │       │       │      │      │      │
Adaptations:     0 ├──────>├──────>├─────>├─────>├─────>│ 3
                   │       │       │      │      │      │
                   Random  Learning Optimizing Expert  Master
```

### Stage 1: Random (0-50 actions)
- No patterns yet
- ~50% success rate (random)
- Exploring action space
- Building initial data

### Stage 2: Learning (50-100 actions)
- First patterns emerge
- ~55-60% success rate
- Avoiding obvious mistakes
- Basic recommendations

### Stage 3: Optimizing (100-200 actions)
- Multiple confident patterns
- ~62-65% success rate
- Temporal optimization
- Combo recognition

### Stage 4: Expert (200-500 actions)
- Advanced pattern detection
- ~68-70% success rate
- Strategy adaptation
- Efficient action selection

### Stage 5: Master (500-1000 actions)
- Comprehensive knowledge
- ~72%+ success rate
- Optimal scheduling
- Predictive recommendations

## Integration Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      BOT PLAYER                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐      ┌──────────────┐                │
│  │ Personality  │      │  BotMemory   │                │
│  │   System     │◄────▶│   System     │                │
│  └──────────────┘      └──────────────┘                │
│         │                      │                         │
│         ▼                      ▼                         │
│  ┌──────────────────────────────────┐                  │
│  │      Decision Engine             │                  │
│  ├──────────────────────────────────┤                  │
│  │ 1. Get personality preferences   │                  │
│  │ 2. Query memory for success rates│                  │
│  │ 3. Get context-aware recommendations               │
│  │ 4. Evaluate action options       │                  │
│  │ 5. Select best action            │                  │
│  └──────────────┬───────────────────┘                  │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────┐                  │
│  │      Action Execution            │                  │
│  └──────────────┬───────────────────┘                  │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────────────────┐                  │
│  │   Record Outcome in Memory       │                  │
│  └──────────────────────────────────┘                  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Performance Characteristics

### Time Complexity

| Operation | Complexity | Notes |
|-----------|------------|-------|
| Record Outcome | O(p) | p = number of pattern types (constant) |
| Get Success Rate | O(1) | Map lookup |
| Get Recommendation | O(p) | p = number of patterns (~100) |
| Get Stats | O(n) | n = history size (max 1000) |
| Detect Patterns | O(k) | k = filtered subset size |
| Best Combos | O(c log c) | c = number of combos, sorted |

### Space Complexity

| Component | Size | Notes |
|-----------|------|-------|
| History | O(n) | n = maxHistorySize (1000) |
| Success Rates | O(a) | a = unique action types (~10) |
| Patterns | O(p) | p = detected patterns (~50-100) |
| Combos | O(c) | c = discovered combos (~20-30) |
| Total Memory | ~1-2 MB | Full system with 1000 actions |

## Usage Example

```typescript
// Initialize
const memory = new BotMemory(1000);
const personality = new PersonalitySystem('balanced_strategist');

// Game loop
while (playing) {
  // 1. Get current context
  const context = getCurrentGameContext();

  // 2. Get recommendation from memory
  const recommendation = memory.getRecommendation(context);

  // 3. Make decision based on personality + memory
  let action;
  if (recommendation === 'avoid_combat_low_health') {
    action = { type: 'job' }; // Safer alternative
  } else if (recommendation?.startsWith('complete_combo_')) {
    action = getNextComboAction(recommendation);
  } else {
    // Use personality preferences
    const successRates = {
      combat: memory.getSuccessRate('combat'),
      job: memory.getSuccessRate('job'),
      crime: memory.getSuccessRate('crime')
    };
    action = personality.chooseAction(successRates);
  }

  // 4. Execute action
  const result = await performAction(action);

  // 5. Record outcome for learning
  memory.recordOutcome({
    id: generateId(),
    action: action,
    timestamp: new Date(),
    success: result.success,
    reward: result.goldGained || 0,
    cost: result.energyUsed || 0,
    context: context,
    duration: result.duration
  });

  // 6. Check if adaptation needed
  if (memory.shouldAdaptStrategy()) {
    console.log('Adapting strategy - recent performance poor');
    personality.adaptStrategy();
  }

  // 7. Periodic reporting
  if (actionCount % 100 === 0) {
    console.log(memory.getLearningReport());
  }
}
```

## Key Insights

### 1. Human-Like Learning
- Limited memory prevents overfitting
- Learns from mistakes
- Adapts to changing conditions
- Forgets old, irrelevant patterns

### 2. Emergent Intelligence
- No hard-coded strategies
- Discovers optimal behaviors through experience
- Generalizes from specific cases
- Balances exploration vs exploitation

### 3. Context Awareness
- Multi-dimensional pattern recognition
- Considers full game state
- Temporal optimization
- Situational recommendations

### 4. Continuous Improvement
- Success rate increases over time
- Strategy adaptation when failing
- Efficiency optimization
- Pattern confidence refinement

### 5. Explainability
- Transparent decision making
- Detailed learning reports
- Pattern visualization
- Export for analysis

---

**Result:** Bots that genuinely learn, adapt, and improve - not just execute fixed algorithms.
