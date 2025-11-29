# Emergent Social Dynamics - Quick Start Guide

## 5-Minute Setup

### 1. Import and Initialize

```typescript
import { EmergentDynamicsOrchestrator } from './social/EmergentDynamics.js';
import { PersonalitySystem } from '../intelligence/PersonalitySystem.js';

const orchestrator = new EmergentDynamicsOrchestrator();
```

### 2. Register Bots

```typescript
// Register 10 bots with random personalities
for (let i = 0; i < 10; i++) {
  const personality = PersonalitySystem.createRandomPersonality();
  orchestrator.registerBot(`bot-${i}`, `Bot ${i}`, personality);
}
```

### 3. Record Interactions

```typescript
// Positive interaction
orchestrator.recordInteraction('bot-0', 'bot-1', 'cooperation', 'positive');

// Negative interaction
orchestrator.recordInteraction('bot-2', 'bot-3', 'combat', 'negative');
```

### 4. Run Analysis

```typescript
const result = orchestrator.runCycle();

console.log('Gang proposals:', result.gangProposals.length);
console.log('Network density:', result.networkAnalysis.density);
console.log('Influence events:', result.influenceEvents.length);
```

### 5. Get Analytics

```typescript
const analytics = orchestrator.getAnalytics();

console.log('Total bots:', analytics.totalBots);
console.log('Friends:', analytics.friendCount);
console.log('Gangs formed:', analytics.gangCount);
```

## Common Patterns

### Check Bot's Social Context

```typescript
const context = orchestrator.getBotSocialContext('bot-0');

if (context.friends.includes('bot-1')) {
  // Trust bot-1
} else if (context.enemies.includes('bot-1')) {
  // Avoid bot-1
}
```

### Form a Gang Manually

```typescript
const proposals = orchestrator.runCycle().gangProposals;

// Auto-form high-affinity gangs
for (const proposal of proposals) {
  if (proposal.avgAffinity > 0.8) {
    // Gang will be auto-formed
    console.log('Gang formed:', proposal.suggestedName);
  }
}
```

### Spread Influence

```typescript
// Influence spreads automatically from central nodes
// during runCycle(), or manually:

const influenceSystem = new InfluenceSpreadingSystem(profiles);
const event = influenceSystem.spreadInfluence(
  'bot-leader',
  'opinion',
  'We should attack',
  0.9
);
```

### Export Data

```typescript
const data = orchestrator.exportSocialData();
fs.writeFileSync('social-data.json', data);
```

## Interaction Types

- `'chat'` - Casual conversation
- `'trade'` - Economic exchange
- `'combat'` - Fighting
- `'cooperation'` - Working together
- `'betrayal'` - Trust violation (severe)
- `'gift'` - Giving items
- `'help'` - Assistance

## Outcomes

- `'positive'` - Successful/beneficial
- `'negative'` - Failed/harmful
- `'neutral'` - No strong impact

## Network Metrics Explained

- **Density**: How connected the network is (0-1)
- **Avg Path Length**: Degrees of separation between bots
- **Clustering Coefficient**: Tendency to form tight groups
- **Central Nodes**: Most influential bots
- **Bridges**: Bots connecting different groups

## Next Steps

1. See `EmergentDynamics.example.ts` for 10 detailed examples
2. Read `README.md` for complete documentation
3. Run `EmergentDynamics.test.ts` to see test cases
4. Check `AGENT_13_COMPLETION_REPORT.md` for technical details

## Troubleshooting

### No Gangs Forming?
- Need at least 3 bots with 0.75+ mutual affinity
- Record more positive interactions between same bots

### Low Network Density?
- Register more bots
- Record more interactions
- Use diverse personality types

### Slow Performance?
- Reduce bot count (<50 for real-time)
- Increase cycle interval
- Enable sampling mode

## Contact

For questions or issues, refer to the complete documentation in `README.md`.
