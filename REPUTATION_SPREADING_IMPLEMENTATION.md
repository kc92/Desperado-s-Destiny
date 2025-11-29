# Reputation Spreading System Implementation Report
## Phase 3, Wave 3.2 - Desperados Destiny

**Implementation Date:** 2025-11-25
**System Version:** 1.0.0
**Status:** ✅ Complete

---

## Executive Summary

Successfully implemented a comprehensive reputation spreading system where news about player actions propagates through NPC social networks. When players commit crimes, complete quests, or perform notable actions, NPCs who witness or hear about these events form opinions that affect future interactions.

## System Overview

### Core Concept
NPCs maintain knowledge about player characters through a network-based spreading mechanism. Information degrades as it spreads (like a game of telephone), creating realistic knowledge distribution patterns across the game world.

### Spreading Mechanics
- **Origin (Hop 0):** NPC witnesses event firsthand (100% accuracy)
- **First Hop:** Direct connections get 80% impact
- **Second Hop:** Second-degree connections get 60% impact
- **Third Hop:** Third-degree connections get 40% impact
- **Beyond:** Information doesn't spread further

**Special Modifiers:**
- **Faction Bonus:** Same-faction NPCs spread 20% faster
- **Relationship Bonus:** Family members share with 90% retention (vs 80%)
- **Source Credibility:** Direct witnesses = 100%, heard = 80-60%, rumor = 40-30%

---

## Files Created

### 1. Type Definitions
**File:** `shared/src/types/reputation.types.ts` (356 lines)

**Event Types (15 total):**
- `CRIME_COMMITTED` - Player commits crime
- `CRIME_WITNESSED` - Crime witnessed by NPC
- `QUEST_COMPLETED` - Quest completion
- `NPC_HELPED` - Player helped an NPC
- `NPC_HARMED` - Player harmed an NPC
- `TRADE_COMPLETED` - Completed trade
- `BOUNTY_COLLECTED` - Collected bounty
- `DUEL_WON` / `DUEL_LOST` - Duel outcomes
- `GANG_JOINED` - Joined a gang
- `ACHIEVEMENT_EARNED` - Earned achievement
- `GIFT_GIVEN` - Gave gift to NPC
- `SERVICE_PURCHASED` - Purchased service
- `BRIBE_GIVEN` - Bribed an NPC
- `THREAT_MADE` - Threatened an NPC

**Key Interfaces:**
```typescript
interface ReputationEvent {
  characterId: string;
  eventType: ReputationEventType;
  magnitude: number;        // 1-100 impact
  sentiment: number;        // -100 to +100
  locationId: string;
  originNpcId?: string;
  spreadRadius: number;     // How many hops
  decayRate: number;        // 0-1 degradation per hop
}

interface NPCKnowledge {
  npcId: string;
  characterId: string;
  events: KnownEvent[];
  overallOpinion: number;   // -100 to +100
  trustLevel: number;       // 0-100
  fearLevel: number;        // 0-100
  respectLevel: number;     // 0-100
}

interface ReputationModifier {
  priceModifier: number;           // 0.5x to 2.0x
  dialogueAccessLevel: number;     // 0-10
  willHelp: boolean;
  willHarm: boolean;
  willReport: boolean;             // Report crimes
  willTrade: boolean;
  qualityOfService: number;        // 0-100
}
```

**Event Configurations:**
Each event type has default values for magnitude, sentiment, spread radius, decay rate, and expiration time.

---

### 2. Database Models

#### A. ReputationEvent Model
**File:** `server/src/models/ReputationEvent.model.ts` (173 lines)

**Schema:**
- CharacterId (indexed)
- Event type (15 types)
- Magnitude (1-100)
- Sentiment (-100 to +100)
- Location (indexed)
- Origin NPC (who witnessed)
- Spread radius (max hops)
- Decay rate (degradation)
- Expiration date
- Spread count (how many NPCs know)

**Static Methods:**
- `findActiveEvents()` - Get non-expired events
- `findByLocation()` - Events in specific location
- `findByNPC()` - Events witnessed by NPC
- `cleanupExpiredEvents()` - Background cleanup

#### B. NPCKnowledge Model
**File:** `server/src/models/NPCKnowledge.model.ts` (393 lines)

**Schema:**
- NPC ID + Character ID (compound unique index)
- Events array (all known events)
- Overall opinion (-100 to +100)
- Event counters (positive/negative/neutral)
- Trust/fear/respect levels
- First knowledge date
- Last interaction date

**Instance Methods:**
- `addEvent()` - Add new knowledge
- `removeEvent()` - Forget event
- `recalculateOpinion()` - Update opinion based on events
- `getEventsByType()` - Filter events
- `getMostRecentEvent()` - Latest knowledge

**Opinion Calculation:**
- Weighted by magnitude and credibility
- Time decay (recent events matter more)
- Minimum 30% weight for old events
- Fear increases with negative high-magnitude events
- Respect increases with any high-magnitude events

---

### 3. Core Service

**File:** `server/src/services/reputationSpreading.service.ts` (612 lines)

**Main Functions:**

**`createReputationEvent()`**
```typescript
// Create event and automatically spread through network
const { event, spreadResult } = await createReputationEvent(
  characterId,
  ReputationEventType.CRIME_WITNESSED,
  locationId,
  {
    magnitude: 80,
    sentiment: -70,
    originNpcId: 'red-gulch-sheriff',
    faction: 'settlerAlliance'
  }
);
// Returns: event + { npcsInformed, hopDistribution, averageMagnitude }
```

**`spreadReputation(eventId)`**
- Loads NPC relationship network
- Spreads event through connections
- Tracks informed NPCs by hop distance
- Applies degradation per hop
- Applies faction/family bonuses
- Returns spread statistics

**`getNPCKnowledge(npcId, characterId)`**
- Returns what specific NPC knows about player
- Includes all events and overall opinion

**`getReputationModifier(npcId, characterId)`**
- Calculates interaction modifiers
- Returns price multiplier, dialogue access, behavioral flags
- Opinion → Price: -100 = 2.0x, 0 = 1.0x, +100 = 0.5x

**`getPlayerReputation(characterId, locationId)`**
- Overall reputation in location
- NPC knowledge count
- Dominant sentiment
- Recent events
- Faction standing

**Background Jobs:**
- `cleanupExpiredEvents()` - Delete old events
- `decayOldEvents()` - Reduce impact over time (10% per day)

---

### 4. Integration Points

#### A. Crime Service Integration
**File:** `server/src/services/crime.service.ts` (modified)

**Unwitnessed Crime:**
```typescript
ReputationEventType.CRIME_COMMITTED
Magnitude: 40 (lower, rumor-based)
Sentiment: -40
```

**Witnessed Crime:**
```typescript
ReputationEventType.CRIME_WITNESSED
Magnitude: 80 (high impact)
Sentiment: -70
Origin NPC: Sheriff (witness)
```

**Failed & Caught:**
```typescript
ReputationEventType.CRIME_WITNESSED
Magnitude: 70
Sentiment: -85 (extremely negative)
```

#### B. Quest Service Integration
**File:** `server/src/services/quest.service.ts` (modified)

**Quest Completion:**
```typescript
ReputationEventType.QUEST_COMPLETED
Magnitude: 50
Sentiment: Based on quest faction reward
Faction: Extracted from quest rewards
```

---

### 5. API Layer

#### A. Controller
**File:** `server/src/controllers/reputationSpreading.controller.ts` (272 lines)

**Endpoints:**
1. `GET /api/reputation-spreading/:characterId` - Player's overall reputation
2. `GET /api/reputation-spreading/npc/:npcId/:characterId` - NPC's knowledge
3. `GET /api/reputation-spreading/modifier/:npcId/:characterId` - Interaction modifiers
4. `GET /api/reputation-spreading/knowledgeable/:characterId` - All NPCs who know player
5. `GET /api/reputation-spreading/events/:characterId` - Player's reputation events
6. `POST /api/reputation-spreading/event` - Create manual event
7. `POST /api/reputation-spreading/spread/:eventId` - Trigger manual spread (admin)
8. `POST /api/reputation-spreading/cleanup` - Cleanup expired events (admin)
9. `POST /api/reputation-spreading/decay` - Decay old events (admin)

#### B. Routes
**File:** `server/src/routes/reputationSpreading.routes.ts` (86 lines)

All routes require authentication. Admin-only routes check for admin role.

**Integrated into:** `server/src/routes/index.ts`
- Route prefix: `/api/reputation-spreading`

---

## Event Spread Configurations

### High-Impact Events (Magnitude 70+, Spread Radius 3-4)
- **CRIME_WITNESSED:** Mag 80, Sent -70, Radius 4, Decay 15%, Expires 10 days
- **NPC_HARMED:** Mag 85, Sent -85, Radius 4, Decay 10%, Expires 14 days
- **BOUNTY_COLLECTED:** Mag 75, Sent +60, Radius 3, Decay 15%, Expires 7 days

### Medium-Impact Events (Magnitude 40-65, Spread Radius 2-3)
- **QUEST_COMPLETED:** Mag 50, Sent +50, Radius 2, Decay 25%, Expires 5 days
- **NPC_HELPED:** Mag 60, Sent +70, Radius 3, Decay 20%, Expires 6 days
- **DUEL_WON:** Mag 65, Sent +50, Radius 3, Decay 20%, Expires 5 days

### Low-Impact Events (Magnitude <40, Spread Radius 1-2)
- **TRADE_COMPLETED:** Mag 30, Sent +40, Radius 1, Decay 30%, Expires 3 days
- **SERVICE_PURCHASED:** Mag 25, Sent +30, Radius 1, Decay 30%, Expires 2 days

---

## Example Spreading Scenario

**Scenario:** Player robs the general store (witnessed by sheriff)

### Event Creation
```typescript
Event: CRIME_WITNESSED
Magnitude: 80
Sentiment: -70
Origin NPC: red-gulch-sheriff
Location: red-gulch
```

### Network Spread

**Hop 0 (Origin):**
- Sheriff learns: 100% magnitude (80), credibility 100%
- Opinion: -70 (very negative)

**Hop 1 (Direct Connections):**
- Deputy (employer): 80% magnitude (64), credibility 80%, heardFrom: sheriff
- Bartender (informant): 80% magnitude (64), credibility 80%, heardFrom: sheriff
- Opinion: -56 each

**Hop 2 (Second Degree):**
- Store Owner (friend of bartender): 60% magnitude (48), credibility 60%
- Bank Teller (via bartender): 60% magnitude (48), credibility 60%
- Opinion: -42 each

**Hop 3 (Third Degree):**
- Blacksmith (via store owner): 40% magnitude (32), credibility 40%
- Opinion: -28

**Result:**
- 6 NPCs informed total
- Average magnitude: 56
- Spread across 4 hops
- Information degraded realistically

---

## Reputation Effects on Gameplay

### Price Modifiers
```
Opinion  | Price Multiplier
---------|------------------
+80      | 0.6x (40% discount)
+40      | 0.8x (20% discount)
0        | 1.0x (normal)
-40      | 1.2x (20% markup)
-80      | 1.4x (40% markup)
```

### Dialogue Access Levels (0-10)
```
Trust Level | Access | Description
------------|--------|-------------
90-100      | 10     | Deepest secrets, romance options
70-89       | 7-9    | Personal stories, faction secrets
50-69       | 5-6    | Standard dialogue
30-49       | 3-4    | Basic interaction
0-29        | 0-2    | Hostile, minimal dialogue
```

### Behavioral Flags
- **willHelp:** Opinion > 30 AND trust > 40
- **willHarm:** Opinion < -50 OR fear > 70
- **willReport:** Opinion < -30 AND trust < 30 (reports crimes to authorities)
- **willTrade:** Opinion > -40

### Quality of Service (0-100)
```
Score = 50 + (opinion / 2) + (trust / 4)

Examples:
- Opinion +80, Trust 80 = 90 (excellent rewards)
- Opinion 0, Trust 50 = 62 (standard rewards)
- Opinion -60, Trust 20 = 25 (poor rewards)
```

---

## Knowledge Decay System

### Time-Based Decay
- Events older than 30 days: Magnitude reduced by 10% daily
- Events below magnitude 10: Automatically forgotten
- Major events (magnitude 80+): Decay 50% slower

### Expiration
Each event type has configured expiration:
- Short-term (2-3 days): Trade, services
- Medium-term (5-7 days): Quests, duels, crimes
- Long-term (14-30 days): Major crimes, gang membership

### Cleanup Jobs
**Recommended Schedule:**
- `cleanupExpiredEvents()`: Daily cron job
- `decayOldEvents()`: Daily cron job

---

## Testing Considerations

### Unit Tests Needed
1. Event creation with default configs
2. Spreading algorithm accuracy
3. Opinion calculation formulas
4. Modifier calculations
5. Knowledge decay mechanics

### Integration Tests Needed
1. Crime → Reputation event → NPC knowledge
2. Quest completion → Reputation event
3. Multiple events affecting same NPC
4. Network spreading across relationship clusters
5. Faction multipliers

### Manual Test Scenarios
1. Commit witnessed crime, check sheriff's opinion
2. Complete helpful quest, verify NPC gratitude
3. Check price differences at shop based on reputation
4. Verify gossip spreads through Morrison family
5. Test reputation decay over simulated time

---

## Performance Considerations

### Indexes Created
- `ReputationEvent`: characterId, locationId, eventType, expiresAt, timestamp
- `NPCKnowledge`: (npcId, characterId) unique, characterId, overallOpinion

### Optimization Strategies
1. **Lazy Spreading:** Events spread on creation, not on-demand
2. **Network Caching:** Load relationship network once per spread
3. **Batch Updates:** Update all NPC knowledge in single operation
4. **Query Limits:** Paginate event lists, limit spread radius to 3 hops
5. **TTL Indexes:** Use MongoDB TTL index on expiresAt for auto-cleanup

### Estimated Performance
- Create + Spread event: ~50-200ms (depending on network size)
- Get NPC knowledge: ~5-10ms (indexed query)
- Calculate modifiers: ~1-2ms (in-memory calculation)
- Cleanup job: ~100-500ms (bulk delete)

---

## Future Enhancements

### Potential Extensions
1. **Dynamic Origin Detection:** Auto-detect witnessing NPCs based on location/time
2. **Event Clustering:** Combine similar events (multiple thefts → "crime spree")
3. **Reputation Milestones:** Special effects at -100/-50/0/50/100 thresholds
4. **Faction-Wide Effects:** Entire faction learns about high-magnitude events
5. **Player Gossip System:** Players can spread their own (possibly false) rumors
6. **Disguise System:** Reduce spread radius when disguised
7. **Bribery:** Pay NPCs to "forget" negative events
8. **Witness Elimination:** Extreme option to silence witnesses
9. **Reputation Quests:** Special quests to restore damaged reputation
10. **Regional Fame:** Territory-wide reputation tracking

### API Extensions
1. `GET /reputation-spreading/comparison/:characterId1/:characterId2` - Compare reputations
2. `POST /reputation-spreading/forget` - Bribe NPC to forget events
3. `GET /reputation-spreading/timeline/:characterId` - Reputation over time
4. `GET /reputation-spreading/heatmap/:characterId` - Visual reputation map

---

## Integration Checklist

### ✅ Completed
- [x] Type definitions created
- [x] Database models created
- [x] Core spreading service implemented
- [x] Crime service integration
- [x] Quest service integration
- [x] API controller created
- [x] Routes registered
- [x] Shared package exports updated

### 🔲 Remaining
- [ ] Unit tests
- [ ] Integration tests
- [ ] Background cron jobs setup
- [ ] Admin panel UI
- [ ] Player-facing UI (reputation screen)
- [ ] NPC dialogue integration
- [ ] Price modifier integration in shop
- [ ] Documentation for content creators

---

## Configuration Reference

### Environment Variables (None required)
System uses default configurations from `EVENT_SPREAD_CONFIGS`.

### Database Indexes
All indexes created automatically via Mongoose schema.

### Cron Jobs (Recommended)
```javascript
// Daily at 2 AM
schedule('0 2 * * *', async () => {
  await ReputationSpreadingService.cleanupExpiredEvents();
  await ReputationSpreadingService.decayOldEvents();
});
```

---

## Summary

The Reputation Spreading System successfully implements a realistic social network-based reputation system where:

1. **Player actions create events** that NPCs witness or hear about
2. **Information spreads** through NPC relationship networks with realistic degradation
3. **NPCs form opinions** based on what they know (weighted by magnitude, credibility, time)
4. **Opinions affect gameplay** through prices, dialogue access, and NPC behavior
5. **Knowledge decays naturally** over time, with old events being forgotten

The system integrates seamlessly with existing crime and quest systems, creating emergent gameplay where player reputation becomes a valuable resource to manage.

**Files Modified:** 4
**Files Created:** 7
**Total Lines of Code:** ~2,000
**Event Types Supported:** 15
**API Endpoints:** 9
**Database Collections:** 2

---

## Contact & Support

For questions about this implementation:
- System Design: See `shared/src/types/reputation.types.ts` for type definitions
- Spreading Algorithm: See `server/src/services/reputationSpreading.service.ts`
- API Usage: See `server/src/controllers/reputationSpreading.controller.ts`

**Status:** ✅ Ready for Testing
**Next Steps:** Create unit tests, integrate with NPC dialogue system, add cron jobs
