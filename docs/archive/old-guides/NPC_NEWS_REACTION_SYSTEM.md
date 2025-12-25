# NPC News Reaction System
**Phase 12, Wave 12.1 - NPC News Reactions**

## Overview

The NPC News Reaction System creates a living, responsive world where NPCs react to news articles, gossip, and world events. NPCs remember what they hear, form opinions about players, and modify their behavior accordingly.

## System Architecture

### Core Components

1. **Gossip Items** - Individual pieces of news/gossip that spread through NPC network
2. **NPC Knowledge** - What each NPC knows and believes
3. **Witness Accounts** - Firsthand accounts from NPCs who saw events
4. **Reaction Patterns** - How different NPC types react to different news
5. **Dialogue Integration** - How reactions modify NPC conversations

## Gossip Mechanics

### Gossip Creation

Gossip can be created from:
- **Events**: Combat, crimes, heroic acts
- **Newspaper Articles**: Published news stories
- **Rumors**: Pure speculation with low truthfulness
- **Witness Accounts**: Firsthand observations

### Gossip Spreading

```typescript
const spreadAttempt = await GossipService.attemptSpread(
  gossipId,
  fromNPCId,
  toNPCId,
  'same_location', // proximity
  'friend' // relationship
);
```

**Spread Factors:**
- **Base Spread Chance**: 30%
- **Proximity Bonus**: +20% if same location
- **Relationship Bonus**: +15% if friends
- **Gossipiness**: Multiplier based on NPC personality (50%-150%)

### Truth Degradation

As gossip spreads, it becomes less accurate:

| Version | Truthfulness | Changes |
|---------|-------------|---------|
| 0 (Original) | 100% | Accurate facts |
| 1 | 85% | Minor embellishments |
| 2 | 70% | Numbers exaggerated |
| 3 | 55% | Details confused |
| 4 | 40% | Highly distorted |
| 5+ | <40% | Unrecognizable legend |

### Example Truth Degradation

**True Event**: "Player killed a bandit in self-defense"

**Version 1** (90% truth): "Player killed a bandit in a shootout"

**Version 2** (75% truth): "Player killed two bandits single-handed"

**Version 3** (60% truth): "Player killed a whole gang without reloading"

**Version 4** (45% truth): "Player killed 20 men in one night"

**Version 5** (30% truth): "Player is a supernatural gunslinger who can't be killed"

## NPC Knowledge System

### What NPCs Know

Each NPC tracks:
- **Read Articles**: Newspaper stories they've seen
- **Heard Gossip**: Gossip items they know
- **Witnessed Events**: Events they saw personally
- **Player Opinions**: How they feel about each player character

### Opinion Formation

NPCs form opinions based on four metrics:

```typescript
interface NPCOpinion {
  respect: number;      // -100 to 100
  fear: number;         // 0 to 100
  trust: number;        // -100 to 100
  curiosity: number;    // 0 to 100
}
```

**Opinion Calculation:**
- Positive news: +respect, +trust, +curiosity
- Negative news: -respect, -trust, +fear
- Shocking news: +curiosity, +fear
- Heroic acts: +respect, +trust
- Criminal acts: -trust, +fear (if harmful)

### Memory Duration

NPCs forget old news over time:
- **Default**: 7 days
- **Major events**: 30 days
- **Legendary events**: 365 days
- **Personal experience**: Never forgotten

## Reaction System

### Reaction Types

| Type | Triggers | Effects |
|------|----------|---------|
| **Fear** | High criminal notoriety | Flee, refuse service, call law |
| **Respect** | Heroic reputation | Discounts, tips, new dialogue |
| **Hostility** | Enemy faction, crimes | Refuse service, attack, report |
| **Curiosity** | Legendary events | Questions, gather around |
| **Nervousness** | Territory instability | Price increases, limited services |
| **Admiration** | Impressive deeds | Discounts, share secrets |
| **Disgust** | Dishonorable acts | Refuse service, insult |
| **Amusement** | Scandals | Gossip, jokes |

### Reaction Patterns

Example: Fear of Notorious Criminal

```typescript
{
  id: 'fear_notorious_criminal',
  triggers: [
    {
      triggerType: 'player_nearby',
      conditions: {
        topic: ['crime', 'death'],
        sentiment: ['negative'],
        minNotorietyImpact: 50
      }
    }
  ],
  reactionType: 'fear',
  intensityFormula: 'notoriety * 0.8',
  behaviors: [
    { type: 'flee' },
    { type: 'refuse_service', params: { dialogueSet: 'fearful' } }
  ],
  npcTypes: ['civilian', 'shopkeeper']
}
```

### Behavior Modifications

**Price Changes:**
- Respect (60+): 10% discount
- Respect (80+): 15% discount
- Fear (50+): 10% markup
- Distrust: 20% markup

**Service Changes:**
- High fear: Refuse all service
- High hostility: Refuse service
- High respect: Offer rare items
- Gang war: Limit weapon sales

**Dialogue Changes:**
- Fear: Nervous, short answers
- Respect: Friendly, helpful
- Hostility: Rude, dismissive
- Curiosity: Inquisitive, gossipy

## Dialogue Integration

### Modified Greetings

```typescript
// Fear
"*backs away nervously* I... I don't want any trouble."

// Respect
"An honor to meet you! I've heard great things."

// Hostility
"You're not welcome here."

// Curiosity
"Is it true what they say about you?"
```

### News Comments

NPCs reference recent news in dialogue:

```typescript
// Heroism
"Heard you saved those folks. Town owes you."

// Crime
"The law's been asking about you."

// Supernatural
"People say strange things happen around you."

// Combat
"They say you're one of the fastest guns around."
```

### Questions

NPCs ask about events they've heard about:

```typescript
{
  question: "Is it true you took on three men at once?",
  responses: [
    {
      text: "It was four, actually.",
      effect: 'embellish',
      reputationChange: 5
    },
    {
      text: "Just doing what needed to be done.",
      effect: 'confirm',
      reputationChange: 2,
      trustChange: 3
    },
    {
      text: "You shouldn't believe everything you hear.",
      effect: 'deny',
      trustChange: -2
    }
  ]
}
```

## Witness System

### Creating Witness Accounts

When NPCs witness events:

```typescript
const witness = await GossipService.createWitnessAccount({
  npcId: witnessNPCId,
  eventId: eventId,
  eventType: 'combat',
  eventDescription: "Player shot three bandits in the saloon",
  participants: [playerId, bandit1Id, bandit2Id, bandit3Id],
  location: saloonId,
  npcPerception: 80 // Accuracy based on NPC stats
});
```

**Accuracy Factors:**
- High perception: 90%+ accuracy
- Medium perception: 70-80% accuracy
- Low perception: <50% accuracy, misidentifications

### Witness Credibility

Witnesses are more credible than gossip:
- **Eyewitness**: 100% believed initially
- **Second-hand**: 70% believed
- **Third-hand**: 40% believed
- **Rumor**: 20% believed

## Gossip Spread Mechanics

### Daily Spread Cycle

Every day at 2 AM:
1. Get all active gossip
2. For each gossip item:
   - For each NPC who knows it:
     - Roll against gossipiness
     - Find nearby NPCs
     - Attempt spread to 1-3 targets
3. Clean up expired gossip
4. Clean up old NPC knowledge

### Hourly Spread (Trending News)

Every hour:
1. Get high-impact recent gossip
2. Spread more aggressively
3. Update trending list

### Breaking News

Immediate spread for critical events:
```typescript
await GossipSpreadJob.spreadBreakingNews(
  gossipId,
  sourceNPCIds
);
```

## Implementation Examples

### Creating Gossip from Player Combat

```typescript
// Player wins a fight
const gossip = await GossipService.createFromEvent({
  eventId: combatEventId,
  eventType: 'combat',
  subjectType: 'player',
  subjectId: playerId,
  topic: 'combat',
  headline: `${playerName} defeated gang in shootout`,
  content: `${playerName} single-handedly took down three bandits`,
  sentiment: 'positive',
  notorietyImpact: 60,
  witnesses: witnessNPCIds
});
```

### Evaluating NPC Reaction

```typescript
// Player approaches shopkeeper
const reactions = await NPCReactionService.evaluatePlayerApproach(
  shopkeeperId,
  playerId,
  'shopkeeper',
  'neutral'
);

const behavior = NPCReactionService.applyReactionBehaviors(
  reactions,
  100 // Base item price
);

// Result:
// {
//   willingToServe: true,
//   priceModifier: 0.9,  // 10% discount due to respect
//   dialogueSet: 'friendly',
//   specialBehaviors: ['tip:helpful_information']
// }
```

### Modified NPC Dialogue

```typescript
const dialogue = NPCReactionService.getDialogueModifications(
  reactions,
  playerName
);

// Result:
// {
//   greeting: "An honor to meet you, famous gunslinger!",
//   comments: [
//     "The stories about you are impressive.",
//     "You've made quite a name for yourself."
//   ],
//   questions: [
//     "Is it true you took down a whole gang?"
//   ]
// }
```

## Database Schema

### GossipItem

```typescript
{
  _id: ObjectId,

  // Origin
  originalEventId: ObjectId,
  originNPC: ObjectId,
  source: 'witness' | 'newspaper' | 'gossip' | 'rumor',

  // Content
  headline: string,
  content: string,
  baseContent: string,
  currentVersion: number,
  truthfulness: number,

  // Spread
  knownBy: [ObjectId],
  currentReach: number,
  spreadPattern: 'local' | 'regional' | 'territory' | 'global',

  // Temporal
  originDate: Date,
  expiresAt: Date,

  // Variations
  variations: [{
    versionNumber: number,
    content: string,
    truthfulness: number,
    addedDetails: [string],
    spreadBy: ObjectId
  }]
}
```

### WitnessAccount

```typescript
{
  _id: ObjectId,
  npcId: ObjectId,
  eventId: ObjectId,

  eventType: string,
  eventDescription: string,
  participants: [ObjectId],
  location: ObjectId,

  accuracy: number,
  details: [string],
  misidentifications: [string],

  hasShared: boolean,
  sharedWith: [ObjectId],
  timesShared: number,

  witnessedAt: Date
}
```

## API Usage

### Create Gossip

```typescript
POST /api/gossip/create
{
  "eventId": "event123",
  "topic": "combat",
  "headline": "Gunfight at the saloon",
  "content": "Player defeated three bandits",
  "sentiment": "positive",
  "witnesses": ["npc1", "npc2"]
}
```

### Get Gossip About Player

```typescript
GET /api/gossip/character/:characterId
Response: [
  {
    "headline": "Defeated gang in shootout",
    "truthfulness": 85,
    "currentReach": 45,
    "topic": "combat"
  }
]
```

### Get NPC's Reaction

```typescript
GET /api/npc/:npcId/reaction/:characterId
Response: {
  "reactions": [{
    "reactionType": "respect",
    "intensity": 70
  }],
  "behavior": {
    "willingToServe": true,
    "priceModifier": 0.9,
    "dialogueSet": "friendly"
  }
}
```

## Configuration

### Gossip Spread Config

```typescript
{
  baseSpreadChance: 0.3,      // 30% base
  proximityBonus: 0.2,        // +20% same location
  relationshipBonus: 0.15,    // +15% friends

  baseDegradation: 15,        // 15% truth loss
  embellishmentChance: 0.4,   // 40% embellish

  spreadInterval: 4,          // Hours
  maxAge: 14,                 // Days

  localRadius: 5,             // Miles
  regionalRadius: 50          // Miles
}
```

## Performance Considerations

### Gossip Cleanup

- Expired gossip auto-deleted via TTL index
- Old NPC knowledge cleaned daily
- Inactive gossip (no spreads) archived weekly

### Optimization

- Index on `knownBy` for fast NPC lookups
- Index on `subjectId` + `expiresAt` for player queries
- Cache trending gossip for 1 hour
- Batch process daily spread

## Testing

### Unit Tests

```typescript
describe('Gossip Spread', () => {
  it('should degrade truth with each spread', async () => {
    const gossip = await createTestGossip(100);
    await spreadToNPC(gossip, npc1);
    expect(gossip.truthfulness).toBe(85);
  });

  it('should embellish based on NPC personality', async () => {
    const gossipyNPC = await createNPC({ gossipiness: 80 });
    const spread = await attemptSpread(gossip, gossipyNPC, npc2);
    expect(spread.distortions.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```typescript
describe('NPC Reactions', () => {
  it('should fear notorious criminals', async () => {
    const criminal = await createCriminal({ notoriety: 80 });
    const reactions = await evaluateReaction(npc, criminal);
    expect(reactions[0].reactionType).toBe('fear');
  });

  it('should respect heroes', async () => {
    const hero = await createHero({ fame: 70 });
    const reactions = await evaluateReaction(npc, hero);
    expect(reactions[0].reactionType).toBe('respect');
  });
});
```

## Future Enhancements

### Phase 12.2 - Advanced Features

1. **Gossip Networks**: Identify gossip hubs and key influencers
2. **Counter-Gossip**: NPCs can spread corrections to false rumors
3. **Faction Propaganda**: Factions spread biased news
4. **Newspaper Integration**: Articles automatically create gossip
5. **Reputation Decay**: Old news becomes less impactful
6. **NPC Conversations**: NPCs gossip to each other in real-time

### Phase 12.3 - Social Dynamics

1. **Trust Networks**: NPCs trust certain sources more
2. **Confirmation Bias**: NPCs believe news that fits their worldview
3. **Rumor Mills**: Certain locations are gossip hotspots
4. **Celebrity Status**: Famous players create gossip just by existing
5. **Scandal Mechanics**: Detailed scandal progression system

## Conclusion

The NPC News Reaction System creates a dynamic, believable world where NPCs:
- Remember and react to player actions
- Spread news through social networks
- Form opinions based on what they hear
- Modify behavior and dialogue accordingly

This system makes the game world feel alive and responsive, rewarding (or punishing) player actions with realistic social consequences.
