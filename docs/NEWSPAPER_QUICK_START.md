# Newspaper System - Quick Start Guide

## For Developers: How to Trigger Newspaper Articles

### Import the Event Hooks

```typescript
import { newspaperEvents } from '../utils/newspaperEvents';
```

### Report Player Actions

#### Bank Robbery
```typescript
await newspaperEvents.reportBankRobbery({
  characterId: player._id,
  characterName: player.name,
  location: 'Red Gulch Bank',
  amount: 5000
});
```

#### Train Heist
```typescript
await newspaperEvents.reportTrainHeist({
  characterId: player._id,
  characterName: player.name,
  trainName: 'Western Express',
  amount: 10000
});
```

#### Legendary Animal Kill
```typescript
await newspaperEvents.reportLegendaryKill({
  characterId: player._id,
  characterName: player.name,
  creatureName: 'Demon Bear',
  location: 'Dark Forest',
  reward: 1000
});
```

#### Duel Outcome
```typescript
await newspaperEvents.reportDuel({
  winnerId: winner._id,
  winnerName: winner.name,
  loserId: loser._id,
  loserName: loser.name,
  location: 'Main Street',
  fatal: true
});
```

#### Gang War
```typescript
await newspaperEvents.reportGangWar({
  gang1Name: 'Morgan Gang',
  gang2Name: 'Valdez Cartel',
  location: 'The Frontera'
});
```

#### Territory Change
```typescript
await newspaperEvents.reportTerritoryChange({
  territory: 'Red Gulch',
  newFaction: 'Frontera Cartel',
  previousFaction: 'Settler Alliance'
});
```

#### Arrest
```typescript
await newspaperEvents.reportArrest({
  characterId: player._id,
  characterName: player.name,
  crime: 'bank robbery',
  location: 'Red Gulch',
  bounty: 500
});
```

#### Jailbreak/Escape
```typescript
await newspaperEvents.reportEscape({
  characterId: player._id,
  characterName: player.name,
  location: 'Red Gulch Jail'
});
```

#### Bounty Claimed
```typescript
await newspaperEvents.reportBountyClaimed({
  hunterId: hunter._id,
  hunterName: hunter.name,
  criminalId: criminal._id,
  criminalName: criminal.name,
  bounty: 1000
});
```

#### Achievement Unlock
```typescript
await newspaperEvents.reportAchievement({
  characterId: player._id,
  characterName: player.name,
  achievementName: 'Legendary Gunslinger',
  description: 'won 100 duels without losing'
});
```

#### Supernatural Sighting
```typescript
await newspaperEvents.reportSupernaturalSighting({
  creatureName: 'ghostly stagecoach',
  location: 'Dead Man\'s Canyon'
});
```

## Frontend Integration

### Get All Newspapers
```typescript
const response = await fetch('/api/newspapers');
const { newspapers } = await response.json();
```

### Get Current Edition
```typescript
const response = await fetch('/api/newspapers/red-gulch-gazette/current');
const { edition } = await response.json();
```

### Read Article
```typescript
const response = await fetch('/api/newspapers/articles/123456');
const { article } = await response.json();
```

### Subscribe to Newspaper
```typescript
const response = await fetch('/api/newspapers/red-gulch-gazette/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    subscriptionType: 'monthly',
    autoRenew: true
  })
});
```

### Search Articles
```typescript
const response = await fetch('/api/newspapers/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    characterName: 'Jack Morgan',
    category: 'crime',
    limit: 10
  })
});
const { articles } = await response.json();
```

### Get Breaking News
```typescript
const response = await fetch('/api/newspapers/breaking-news?limit=5');
const { articles } = await response.json();
```

### Get Character Mentions
```typescript
const response = await fetch(`/api/newspapers/mentions/${characterId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { articles } = await response.json();
```

## Available Newspapers

### The Red Gulch Gazette
- **ID**: `red-gulch-gazette`
- **Voice**: Respectable, pro-law
- **Price**: $2 / $20 monthly

### La Voz de la Frontera
- **ID**: `la-voz-frontera`
- **Voice**: Bilingual, fearless
- **Price**: $3 / $25 monthly

### The Fort Ashford Dispatch
- **ID**: `fort-ashford-dispatch`
- **Voice**: Military, official
- **Price**: $1 / $15 monthly

### The Frontier Oracle
- **ID**: `frontier-oracle`
- **Voice**: Sensationalist, tabloid
- **Price**: $5 / $30 monthly

## Article Categories

- `crime` - Criminal activities
- `politics` - Political events
- `business` - Economic news
- `society` - Social events
- `weird-west` - Supernatural
- `player-actions` - Player achievements

## When to Trigger Articles

### Always Trigger
- Major crimes (bank robberies, train heists)
- Player vs Player duels
- Legendary animal kills
- Territory changes
- Gang wars
- Achievement unlocks

### Sometimes Trigger
- Minor crimes (only if high-profile player)
- Social events (only if significant)
- Business events (only if major impact)

### Never Trigger
- Private actions
- Failed attempts (unless arrested)
- Normal daily activities

## Multiple Newspaper Coverage

The system automatically determines which newspapers cover an event:

- **Crime in Red Gulch** → Red Gulch Gazette + Frontier Oracle
- **Supernatural Event** → Frontier Oracle only
- **Territory Change** → ALL newspapers
- **Border Crime** → La Voz de la Frontera + Frontier Oracle
- **Military Event** → Fort Ashford Dispatch + Frontier Oracle

## Example: Complete Integration

```typescript
// In your crime service when bank robbery succeeds:
async executeBankRobbery(characterId: string, bankId: string) {
  // 1. Execute the robbery
  const result = await this.performRobbery(characterId, bankId);

  // 2. Update character stats
  await this.updateCharacter(characterId, result);

  // 3. Report to newspapers
  if (result.success) {
    await newspaperEvents.reportBankRobbery({
      characterId: new ObjectId(characterId),
      characterName: result.characterName,
      location: result.bankLocation,
      amount: result.stolenAmount
    });
  }

  return result;
}
```

## Testing Articles

### Manual Article Creation (Admin)
```typescript
const response = await fetch('/api/newspapers/articles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    newspaperId: 'red-gulch-gazette',
    eventType: 'bank-robbery',
    category: 'crime',
    involvedCharacters: [{
      id: player._id,
      name: player.name
    }],
    location: 'Red Gulch',
    details: {
      amount: '$5,000',
      location: 'Red Gulch'
    },
    timestamp: new Date()
  })
});
```

### Manual Publication (Admin)
```typescript
const response = await fetch('/api/newspapers/publish', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    newspaperId: 'red-gulch-gazette'
  })
});
```

## Publication Schedule

The newspaper publisher runs daily at 6:00 AM and publishes:
- **Monday**: Fort Ashford Dispatch
- **Wednesday**: La Voz de la Frontera
- **Friday**: Red Gulch Gazette
- **Sunday**: The Frontier Oracle

Articles created during the week are included in the next edition.

## Best Practices

1. **Always use event hooks** - Don't create articles directly
2. **Provide accurate data** - Character names, locations, amounts
3. **Check for significance** - Not every action needs an article
4. **Use appropriate event types** - Match the event to the correct type
5. **Include context** - Location and details make better articles

## Common Issues

### Article not appearing
- Check if event hook was called
- Verify character data is correct
- Ensure newspaper coverage includes location
- Wait for next publication day

### Wrong newspaper covering event
- Event hooks automatically select newspapers
- Check location/event type matching
- Frontier Oracle covers everything as backup

### Duplicate articles
- Event hooks handle deduplication
- Same event should only be reported once
- Multiple newspapers covering = intended behavior

## Need Help?

See full documentation: `docs/NEWSPAPER_SYSTEM.md`
