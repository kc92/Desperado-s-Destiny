# NPC News Reactions - Quick Start Guide

## Overview

NPCs now react to news, gossip, and world events. They remember what they hear, form opinions about players, and change their behavior accordingly.

## Quick Examples

### Creating Gossip from Events

```typescript
import { GossipService } from './services/gossip.service';

// Player wins a fight
const gossip = await GossipService.createFromEvent({
  eventId: combatEvent._id,
  eventType: 'combat',
  subjectType: 'player',
  subjectId: player._id,
  topic: 'combat',
  headline: `${player.name} defeated bandits`,
  content: `${player.name} took down three bandits in the saloon`,
  sentiment: 'positive',
  notorietyImpact: 60,
  witnesses: [bartender._id, patron1._id, patron2._id]
});
```

### Evaluating NPC Reactions

```typescript
import { NPCReactionService } from './services/npcReaction.service';

// Player approaches shopkeeper
const reactions = await NPCReactionService.evaluatePlayerApproach(
  shopkeeper._id,
  player._id,
  'shopkeeper',
  shopkeeper.faction
);

// Apply behavioral changes
const behavior = NPCReactionService.applyReactionBehaviors(reactions);
// Returns: { willingToServe, priceModifier, dialogueSet, specialBehaviors }
```

## Reaction Types

- **Fear**: Criminal notoriety 50+ → Flee, refuse service
- **Respect**: Heroic acts → 10-15% discount, helpful tips
- **Hostility**: Enemy faction → Refuse service, attack
- **Curiosity**: Legendary events → Questions, gossip
- **Nervousness**: Gang war → Price +15%, limited service

## Truth Degradation

| Version | Truth | Example |
|---------|-------|---------|
| 0 | 100% | Player killed a bandit |
| 1 | 85% | Player killed two bandits |
| 2 | 70% | Player killed a gang |
| 3 | 55% | Player killed 10 men without reloading |
| 4 | 40% | Player is an unstoppable gunslinger |

## Automated Spreading

- **Daily (2 AM)**: All gossip spreads, expired cleaned up
- **Hourly**: High-impact gossip only
- **Breaking News**: Immediate spread for major events

## File Locations

- Types: `shared/src/types/gossip.types.ts`
- Models: `server/src/models/GossipItem.model.ts`
- Services: `server/src/services/gossip.service.ts`, `npcReaction.service.ts`
- Jobs: `server/src/jobs/gossipSpread.job.ts`
- Docs: `docs/NPC_NEWS_REACTION_SYSTEM.md`
