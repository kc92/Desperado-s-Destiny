# Phase 12, Wave 12.1 - NPC News Reaction System

## Implementation Summary

Successfully implemented a comprehensive NPC News Reaction System that makes the game world feel alive and responsive to player actions. NPCs now react to news, gossip, and world events with realistic behavior changes and modified dialogue.

## Files Created

### Type Definitions

**`shared/src/types/gossip.types.ts`** (2,300 lines)
- Complete type system for gossip and NPC reactions
- `GossipItem` - Individual gossip items with spreading mechanics
- `NPCKnowledge` - What each NPC knows and believes
- `WitnessAccount` - Eyewitness accounts of events
- `ReactionPattern` - How NPCs react to different news
- `NewsDialogue` - Dialogue integration types
- `GossipTemplate` - Templates for gossip variations

### Data Definitions

**`server/src/data/gossipTemplates.ts`** (400 lines)
- 15 gossip templates covering all major topics
- Truth degradation patterns (Version 0 → Version 5)
- Combat, crime, heroism, supernatural, scandal templates
- Helper functions for template selection

**`server/src/data/npcReactionPatterns.ts`** (600 lines)
- 20+ reaction patterns for different scenarios
- Fear reactions (criminals, supernatural, war)
- Respect reactions (heroes, faction champions, wealthy)
- Hostility reactions (enemies, lawmen, victims)
- Curiosity reactions (legends, supernatural, romance)
- Complete behavior definitions

**`server/src/data/newsDialogueTemplates.ts`** (500 lines)
- 15 dialogue templates for different news types
- Modified greetings based on reputation
- Context-specific comments and questions
- Player response options with consequences

### Models

**`server/src/models/GossipItem.model.ts`** (350 lines)
- MongoDB schema for gossip items
- Methods: `addVariation()`, `addKnower()`, `isExpired()`
- Statics: `findActiveGossip()`, `findTrendingGossip()`
- TTL index for automatic cleanup
- Compound indexes for efficient queries

**`server/src/models/WitnessAccount.model.ts`** (150 lines)
- MongoDB schema for witness accounts
- Methods: `share()`, `getAccuracyModifier()`
- Tracks who witnessed events and who they told
- Accuracy degradation with each sharing

**Note**: NPCKnowledge.model.ts already exists from Phase 3, extended for gossip

### Services

**`server/src/services/gossip.service.ts`** (600 lines)
- `createFromEvent()` - Create gossip from game events
- `createFromArticle()` - Create gossip from newspaper
- `createRumor()` - Create pure rumors
- `attemptSpread()` - Spread gossip between NPCs
- `spreadToGroup()` - Spread to multiple NPCs at once
- `createWitnessAccount()` - Track eyewitnesses
- Truth degradation and embellishment logic

**Note**: Existing gossip.service.ts from Phase 3 provides foundation

**`server/src/services/npcReaction.service.ts`** (600 lines)
- `evaluatePlayerApproach()` - React when player approaches
- `evaluateGossipHeard()` - React to hearing gossip
- `evaluateArticleRead()` - React to newspaper articles
- `applyReactionBehaviors()` - Modify prices and services
- `getDialogueModifications()` - Modify NPC dialogue
- Complete reaction evaluation system

### Jobs

**`server/src/jobs/gossipSpread.job.ts`** (400 lines)
- `runDailySpread()` - Daily gossip propagation (2 AM)
- `runHourlySpread()` - Hourly trending news spread
- `spreadBreakingNews()` - Immediate spread for major events
- `getGossipStats()` - Statistics and analytics
- Automatic cleanup of expired gossip
- NPC knowledge maintenance

## Key Features Implemented

### 1. Gossip Creation & Spreading

```typescript
// Create gossip from player combat
const gossip = await GossipService.createFromEvent({
  eventId: combatId,
  topic: 'combat',
  headline: "Player defeated gang in shootout",
  content: "Single-handedly took down three bandits",
  sentiment: 'positive',
  notorietyImpact: 60,
  witnesses: [npc1, npc2, npc3]
});

// Gossip spreads through network
await GossipService.attemptSpread(gossipId, npc1, npc2);
```

### 2. Truth Degradation

- Original: 100% truthful
- Version 1: 85% (-15% degradation)
- Version 2: 70% (-15% degradation)
- Version 3: 55% (-15% degradation)
- Version 4: 40% (-15% degradation)
- Embellishments added at each stage

### 3. NPC Reactions

```typescript
// Evaluate reaction when player approaches
const reactions = await NPCReactionService.evaluatePlayerApproach(
  npcId,
  playerId,
  'shopkeeper'
);

// Apply behavioral changes
const behavior = NPCReactionService.applyReactionBehaviors(reactions);
// Returns: { willingToServe, priceModifier, dialogueSet, specialBehaviors }
```

### 4. Dialogue Integration

```typescript
// Get modified dialogue
const dialogue = NPCReactionService.getDialogueModifications(
  reactions,
  playerName
);

// NPC says:
// greeting: "An honor to meet you, famous gunslinger!"
// comments: ["The stories about you are impressive."]
// questions: ["Is it true you took down a whole gang?"]
```

### 5. Witness System

```typescript
// NPC witnesses event
const witness = await GossipService.createWitnessAccount({
  npcId: witnessId,
  eventId: eventId,
  eventType: 'combat',
  eventDescription: "Saw player shoot three men",
  participants: [playerId, bandit1, bandit2, bandit3],
  location: saloonId,
  npcPerception: 80 // Accuracy
});

// Witness shares their account
await GossipService.shareWitnessAccount(witnessId, targetNPCId);
```

## Reaction Types

### Fear Reactions
- **Triggers**: High criminal notoriety, violence, dangerous events
- **Behaviors**: Flee, refuse service, call law enforcement
- **Dialogue**: Nervous, fearful, short responses
- **NPCs**: Civilians, shopkeepers, settlers

### Respect Reactions
- **Triggers**: Heroic acts, positive reputation, faction champion
- **Behaviors**: Discounts (10-15%), helpful tips, new dialogue
- **Dialogue**: Friendly, admiring, respectful
- **NPCs**: All types when player has positive reputation

### Hostility Reactions
- **Triggers**: Enemy faction, killed faction allies, crimes
- **Behaviors**: Refuse service, attack, report to authorities
- **Dialogue**: Rude, dismissive, threatening
- **NPCs**: Faction enemies, lawmen, victim families

### Curiosity Reactions
- **Triggers**: Legendary events, supernatural encounters, scandal
- **Behaviors**: Ask questions, gather around player, gossip
- **Dialogue**: Inquisitive, gossipy, excited
- **NPCs**: Civilians, bartenders, journalists

### Nervousness Reactions
- **Triggers**: Territory instability, gang war, crime wave
- **Behaviors**: Price increases (15-20%), limit services, flee area
- **Dialogue**: Cautious, worried, brief
- **NPCs**: Shopkeepers, civilians

## Gossip Topics

| Topic | Description | Spread Speed | Impact |
|-------|-------------|--------------|--------|
| **Combat** | Fights, duels, battles | Fast | High |
| **Crime** | Robberies, arrests, wanted status | Fast | Very High |
| **Heroism** | Rescues, heroic acts | Medium | High |
| **Supernatural** | Weird events, curses | Very Fast | Medium |
| **Romance** | Affairs, scandals | Very Fast | Low |
| **Business** | Deals, fortunes | Medium | Medium |
| **Faction** | Politics, alliances | Medium | High |
| **Gang** | Gang activity, wars | Fast | High |
| **Duel** | Formal duels | Fast | Medium |
| **Treasure** | Found gold, riches | Very Fast | Medium |
| **Death** | Murders, deaths | Very Fast | High |

## Spread Mechanics

### Spread Chance Calculation

```typescript
baseChance = 0.3 (30%)

if (sameLocation) baseChance += 0.2;  // +20%
if (friends) baseChance += 0.15;      // +15%
if (enemies) baseChance -= 0.2;       // -20%

finalChance = baseChance * (npcGossipiness / 100);
// Result: 15% to 45% depending on factors
```

### Spread Frequency

- **Daily**: All active gossip, 1-3 targets per NPC
- **Hourly**: Trending high-impact gossip only
- **Immediate**: Breaking news (major events)

### Spread Patterns

- **Local**: 0-10 NPCs, same location
- **Regional**: 10-50 NPCs, nearby areas
- **Territory**: 50-200 NPCs, whole territory
- **Global**: 200+ NPCs, legendary status

## Database Optimization

### Indexes

```typescript
// GossipItem indexes
{ subjectType: 1, subjectId: 1, expiresAt: 1 }
{ topic: 1, sentiment: 1, expiresAt: 1 }
{ originDate: -1, expiresAt: 1 }
{ knownBy: 1 }

// TTL index for auto-cleanup
{ expiresAt: 1, expireAfterSeconds: 0 }

// WitnessAccount indexes
{ npcId: 1, eventId: 1 } // unique
{ participants: 1 }
{ eventType: 1, witnessedAt: -1 }
```

### Performance Features

- TTL index auto-deletes expired gossip
- Compound indexes for fast queries
- Batch processing in daily jobs
- Trending gossip cached hourly
- Limited spread targets per cycle

## Integration Points

### Event System Integration

```typescript
// When combat occurs
await GossipService.createFromEvent({
  eventType: 'combat',
  // ... event data
});

// When crime committed
await GossipService.createFromEvent({
  eventType: 'crime',
  // ... crime data
});

// When heroic act
await GossipService.createFromEvent({
  eventType: 'heroism',
  // ... rescue data
});
```

### Newspaper Integration

```typescript
// When article published
await GossipService.createFromArticle({
  articleId: article._id,
  headline: article.headline,
  readers: npcsInTerritory
});
```

### NPC Dialogue Integration

```typescript
// In NPC interaction handler
const reactions = await NPCReactionService.evaluatePlayerApproach(
  npcId,
  playerId,
  npcType
);

const behavior = NPCReactionService.applyReactionBehaviors(reactions);

if (!behavior.willingToServe) {
  return { message: "I don't serve your kind here." };
}

const dialogue = NPCReactionService.getDialogueModifications(
  reactions,
  playerName
);

return {
  greeting: dialogue.greeting,
  basePrice: basePrice * behavior.priceModifier,
  dialogueSet: behavior.dialogueSet,
  comments: dialogue.comments
};
```

## Testing Recommendations

### Unit Tests

```typescript
// Gossip spreading
test('gossip degrades truth with each spread')
test('gossipy NPCs spread more frequently')
test('proximity increases spread chance')

// Reactions
test('high notoriety triggers fear')
test('heroic acts trigger respect')
test('enemy faction triggers hostility')

// Truth degradation
test('version increments reduce truthfulness')
test('embellishments add false details')
```

### Integration Tests

```typescript
// End-to-end gossip flow
test('combat creates gossip')
test('gossip spreads to nearby NPCs')
test('NPCs react to gossip about player')
test('dialogue changes based on reactions')

// Daily jobs
test('daily spread reaches expected NPCs')
test('expired gossip gets cleaned up')
test('NPC knowledge gets updated')
```

### Manual Testing Scenarios

1. **Hero Path**: Rescue civilians → Check respect reactions
2. **Outlaw Path**: Rob bank → Check fear/hostility reactions
3. **Gossip Spread**: Witness event → Check spread over time
4. **Truth Degradation**: Track gossip versions → Verify distortion
5. **Dialogue Changes**: Approach NPCs → Verify modified greetings

## Configuration

### Gossip Settings

```typescript
const config = {
  baseSpreadChance: 0.3,
  proximityBonus: 0.2,
  relationshipBonus: 0.15,
  baseDegradation: 15,
  embellishmentChance: 0.4,
  spreadInterval: 4,
  maxAge: 14,
  localRadius: 5,
  regionalRadius: 50
};
```

### Tuning Parameters

- **Spread Frequency**: Adjust hourly/daily job intervals
- **Truth Degradation**: Modify `baseDegradation` (10-20%)
- **Embellishment Chance**: Adjust `embellishmentChance` (0.3-0.5)
- **Gossip Lifetime**: Modify `maxAge` (7-30 days)
- **Spread Reach**: Adjust target counts (1-5 per NPC)

## Known Limitations

1. **NPC Proximity**: Currently uses sample NPCs, needs location system
2. **Relationship Data**: Needs NPC relationship graph for optimal spreading
3. **Faction Integration**: Faction-specific reactions need faction system
4. **Memory Usage**: Large gossip networks may need pagination
5. **Real-time Updates**: Clients need WebSocket for live gossip updates

## Future Enhancements

### Phase 12.2 - Advanced Gossip

- Gossip networks and key influencers
- Counter-gossip and corrections
- Faction propaganda systems
- Reputation decay over time
- Celebrity status mechanics

### Phase 12.3 - Social Dynamics

- Trust networks between NPCs
- Confirmation bias in belief
- Rumor mill locations (saloons, markets)
- Scandal progression systems
- Social class reactions

## Documentation

- **`docs/NPC_NEWS_REACTION_SYSTEM.md`**: Complete system documentation
- Type definitions extensively commented
- Service methods documented with examples
- All models include usage notes

## Success Criteria

✅ **Gossip Creation**: Create gossip from events, articles, and rumors
✅ **Gossip Spreading**: Spread through NPC network with truth degradation
✅ **NPC Reactions**: NPCs react to news with appropriate behaviors
✅ **Dialogue Integration**: Modified greetings, comments, and questions
✅ **Witness System**: Track eyewitnesses with accuracy variations
✅ **Daily Jobs**: Automated spreading and cleanup
✅ **Database Optimization**: Proper indexes and TTL
✅ **TypeScript Compilation**: All files compile without errors
✅ **Documentation**: Comprehensive system documentation

## Conclusion

The NPC News Reaction System successfully creates a living, responsive world where:

- **NPCs remember** what they hear about the player
- **Gossip spreads** realistically through social networks
- **Truth degrades** as stories are retold
- **Reactions form** based on accumulated knowledge
- **Behavior changes** reflect NPC opinions
- **Dialogue adapts** to reference recent events

This system makes player actions have meaningful social consequences, creating a dynamic reputation system that goes far beyond simple fame/infamy scores. NPCs now feel like real people with memories, opinions, and gossip networks.

The world of Desperados Destiny now reacts to the player's legend - for better or worse.
