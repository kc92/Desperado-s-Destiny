# Newspaper System - Phase 12, Wave 12.1

## Overview

The Newspaper System creates a dynamic, immersive frontier journalism experience where player actions and world events are reported through four distinct newspapers, each with its own voice, bias, and coverage area.

## Features

### Four Distinct Newspapers

#### 1. The Red Gulch Gazette
- **Alignment**: Settler-aligned
- **Coverage**: Red Gulch, Longhorn Ranch, Whiskey Bend, Dusty Creek
- **Bias**: Pro-law, anti-criminal, pro-military
- **Style**: Respectable, accurate, pro-civilization
- **Publish Day**: Friday
- **Price**: $2 (single) / $20 (monthly subscription)
- **Editor**: Elijah Montgomery

#### 2. La Voz de la Frontera
- **Alignment**: Frontera-aligned
- **Coverage**: The Frontera, border region, smuggler routes
- **Bias**: Pro-frontera, anti-settler, neutral on crime
- **Style**: Bilingual (Spanish/English), fearless border coverage
- **Publish Day**: Wednesday
- **Price**: $3 (single) / $25 (monthly subscription)
- **Editor**: Rosa Delgado

#### 3. The Fort Ashford Dispatch
- **Alignment**: Military-aligned
- **Coverage**: Fort Ashford, military outposts, government land
- **Bias**: Pro-military, pro-law, anti-criminal
- **Style**: Official military communication, propaganda
- **Publish Day**: Monday
- **Price**: $1 (single) / $15 (monthly subscription)
- **Editor**: Major Harold Blackwood

#### 4. The Frontier Oracle
- **Alignment**: Sensationalist
- **Coverage**: All territories, remote locations, mysterious sites
- **Bias**: Sensationalist
- **Style**: Tabloid, supernatural stories, exaggerated accounts
- **Publish Day**: Sunday
- **Price**: $5 (single) / $30 (monthly subscription)
- **Editor**: Cornelius P. Worthington III

## Article Categories

### Crime
- Bank robberies
- Train heists
- Murders/assassinations
- Arrests and trials
- Jailbreaks/escapes
- Gang activities

### Politics
- Territory changes
- Faction wars
- Elections
- Law changes
- Diplomatic events

### Business
- Market price changes
- New business openings
- Property sales
- Economic trends

### Society
- Social events
- Weddings/deaths (NPCs)
- Notable visitors
- Entertainment

### Weird West
- Supernatural sightings
- Mysterious events
- Strange disappearances
- Cult activities

### Player Actions
- Legendary animal kills
- Notable achievements
- Gang wars
- Duels
- Bounty claims

## Dynamic Article Generation

### Headline Templates

50+ headline templates cover all major event types:

```typescript
// Example: Bank Robbery
"DARING DAYLIGHT HEIST: $5,000 Stolen from First National"
"BOLD ROBBERY AT Red Gulch: Thieves Escape with $10,000"
"BANK ROBBERS STRIKE: Law Enforcement in Pursuit"
```

### Bias Modifiers

Each newspaper applies its bias to headlines and content:

**Pro-Law Bias:**
```
"CRIMINAL SCUM ROB Red Gulch: Law Enforcement in Pursuit"
```

**Sensationalist Bias:**
```
"SHOCKING HEIST! Mysterious Bandits Steal $10,000 in BROAD DAYLIGHT!"
```

**Pro-Frontera Bias:**
```
"Red Gulch LIBERATED: Frontera Forces Victorious"
```

## Subscription System

### Subscription Types

1. **Single Purchase** ($1-5)
   - Buy one current edition
   - Instant access
   - No recurring charge

2. **Monthly Subscription** ($15-30)
   - Weekly delivery via mail
   - Auto-renewal option
   - Access to all editions during subscription

3. **Archive Access** ($50)
   - Lifetime access to all past editions
   - Searchable archive
   - No recurring charge

### Delivery Methods

- **Mail Delivery**: Articles delivered to in-game mailbox
- **Instant Access**: Immediate notification when published

## API Endpoints

### Public Endpoints

```
GET /api/newspapers
Get all available newspapers

GET /api/newspapers/:newspaperId/current
Get current edition of newspaper

GET /api/newspapers/:newspaperId/editions/:editionNumber
Get specific edition

GET /api/newspapers/articles/:articleId
Get specific article (marks as read if authenticated)

POST /api/newspapers/search
Search articles by various criteria

GET /api/newspapers/breaking-news
Get recent featured articles

GET /api/newspapers/:newspaperId/stats
Get newspaper statistics
```

### Protected Endpoints (Require Authentication)

```
POST /api/newspapers/:newspaperId/subscribe
Subscribe to newspaper (monthly or archive)

POST /api/newspapers/:newspaperId/buy
Buy single newspaper edition

DELETE /api/newspapers/subscriptions/:subscriptionId
Cancel subscription

GET /api/newspapers/subscriptions
Get character's active subscriptions

GET /api/newspapers/mentions/:characterId
Get articles mentioning character
```

### Admin Endpoints

```
POST /api/newspapers/articles
Create article manually

POST /api/newspapers/publish
Trigger publication manually
```

### System Endpoints

```
POST /api/newspapers/world-event
Handle world event and create articles
```

## Integration with Game Systems

### Event Hooks

The newspaper system integrates with other game systems through event hooks:

```typescript
// Bank robbery
await newspaperEvents.reportBankRobbery({
  characterId,
  characterName,
  location: 'Red Gulch',
  amount: 5000
});

// Legendary kill
await newspaperEvents.reportLegendaryKill({
  characterId,
  characterName,
  creatureName: 'Demon Bear',
  location: 'Dark Forest',
  reward: 1000
});

// Duel outcome
await newspaperEvents.reportDuel({
  winnerId,
  winnerName,
  loserId,
  loserName,
  location: 'Main Street',
  fatal: true
});
```

### Available Event Hooks

- `reportBankRobbery()`
- `reportTrainHeist()`
- `reportLegendaryKill()`
- `reportDuel()`
- `reportGangWar()`
- `reportTerritoryChange()`
- `reportArrest()`
- `reportEscape()`
- `reportBountyClaimed()`
- `reportAchievement()`
- `reportSupernaturalSighting()`

## Player Impact

### Reputation Effects

Articles about players can affect their reputation:

```typescript
article.reputationEffects.set(characterId, -10); // Negative article
article.reputationEffects.set(characterId, +15); // Positive article
```

### Bounty Increases

Criminal activities reported in newspapers can increase bounties:

```typescript
article.bountyIncrease = 500; // Adds $500 to bounty
```

### Infamy Gain

Notorious actions increase player infamy:

```typescript
article.infamyGain = 25; // Increases infamy by 25
```

### NPC Reactions

NPCs reference newspaper articles:
- Law enforcement reads wanted posters
- Bounty hunters track mentioned criminals
- Citizens react to player mentions
- Faction leaders note political articles

## Publication Schedule

### Weekly Publication

Each newspaper publishes on a specific day:
- Monday: Fort Ashford Dispatch
- Wednesday: La Voz de la Frontera
- Friday: Red Gulch Gazette
- Sunday: The Frontier Oracle

### Breaking News

Featured articles can be published immediately for urgent events:
- Major crimes
- Territory changes
- Faction wars
- Legendary achievements

## Article Search

Players can search articles by:
- Newspaper
- Category
- Event type
- Character name
- Date range
- Keywords (full-text search)

## Statistics Tracking

Each newspaper tracks:
- Total editions published
- Total articles written
- Total subscribers
- Most-read article
- Average reactions per article
- Revenue from subscriptions

## Database Models

### NewsArticle
```typescript
{
  newspaperId: string;
  headline: string;
  byline: string;
  content: string;
  category: ArticleCategory;
  publishDate: Date;
  editionNumber: number;
  eventType: WorldEventType;
  involvedCharacters: ObjectId[];
  involvedFactions: FactionId[];
  location: string;
  reputationEffects: Map<string, number>;
  bountyIncrease: number;
  infamyGain: number;
  readBy: ObjectId[];
  reactionsCount: number;
  featured: boolean;
}
```

### NewsSubscription
```typescript
{
  characterId: ObjectId;
  newspaperId: string;
  subscriptionType: 'single' | 'monthly' | 'archive';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  deliveryMethod: 'mail' | 'instant';
  paid: boolean;
}
```

## Implementation Files

### Types
- `shared/src/types/newspaper.types.ts` - TypeScript type definitions

### Data
- `server/src/data/newspapers.ts` - Newspaper definitions
- `server/src/data/headlineTemplates.ts` - 50+ headline templates

### Models
- `server/src/models/NewsArticle.model.ts` - Article storage
- `server/src/models/NewsSubscription.model.ts` - Subscription tracking

### Services
- `server/src/services/newspaper.service.ts` - Core newspaper logic
- `server/src/services/headlineGenerator.service.ts` - Article generation

### Controllers & Routes
- `server/src/controllers/newspaper.controller.ts` - HTTP endpoints
- `server/src/routes/newspaper.routes.ts` - Route definitions

### Jobs
- `server/src/jobs/newspaperPublisher.job.ts` - Weekly publication job

### Utilities
- `server/src/utils/newspaperEvents.ts` - Event integration hooks

## Future Enhancements

### Planned Features

1. **Player-Written Articles**
   - Players can submit articles
   - Editor approval system
   - Payment for published articles

2. **Letters to the Editor**
   - Players respond to articles
   - Published in next edition
   - Reputation impact

3. **Advertising System**
   - Players/gangs buy ad space
   - Classified ads
   - Business promotion

4. **Investigative Journalism**
   - Reporters investigate crimes
   - Multi-part story series
   - Quest triggers

5. **Photo System**
   - Articles include images
   - Player screenshots
   - Wanted posters with photos

6. **Print Shop Mechanic**
   - Players can own newspapers
   - Hire reporters
   - Control editorial content

## Usage Examples

### Subscribe to Newspaper

```typescript
// Frontend call
const response = await fetch('/api/newspapers/red-gulch-gazette/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
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
```

### Get Breaking News

```typescript
const response = await fetch('/api/newspapers/breaking-news?limit=5');
const { articles } = await response.json();
```

## Frontier Journalism

The Newspaper System brings the Wild West to life through dynamic, biased, and immersive journalism. Every player action can become frontier legend, every crime can make headlines, and every achievement can be immortalized in print.

Players will see their names in print, their deeds reported (or misreported), and their reputations shaped by the frontier press. The newspapers create a living, breathing world where actions have consequences and stories spread across the territory.

Welcome to frontier journalism, desperado.
