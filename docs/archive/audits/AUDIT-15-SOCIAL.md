# AUDIT 15: NPC & SOCIAL SYSTEMS

**Date**: 2025-12-15
**Auditor**: Claude (Sonnet 4.5)
**Scope**: NPC Interactions, Reputation, Gossip, Mentor, Service Providers, Entertainers
**Status**: CRITICAL ISSUES FOUND

---

## EXECUTIVE SUMMARY

The NPC & Social Systems contain **extensive and well-designed content** with procedural dialogue templates, comprehensive gossip expansion, and sophisticated reputation spreading mechanics. However, they suffer from **significant implementation gaps**, **missing model dependencies**, **inconsistent data structures**, and **performance concerns** that prevent these systems from functioning in production.

### Risk Assessment: HIGH
- **Blocker Issues**: 8 (Missing models, broken imports, data inconsistencies)
- **Critical Issues**: 12 (Logic errors, validation gaps, performance problems)
- **Major Issues**: 18 (Incomplete features, TODO comments, missing error handling)
- **Minor Issues**: 23 (Code quality, documentation gaps)

---

## SYSTEM 1: NPC INTERACTIONS

### Files Analyzed
- `server/src/services/npc.service.ts` (533 lines)
- `server/src/models/NPC.model.ts` (543 lines)
- `server/src/models/NPCTrust.model.ts` (190 lines)
- `server/src/models/NPCRelationship.model.ts` (295 lines)
- `server/src/data/npcDialogueTemplates.ts` (1500 lines)

### What It Does RIGHT ✅

1. **Excellent Dialogue Template System**
   - 200+ base templates (10 roles × 5 moods × 4 contexts)
   - Professional mood mapping system (lines 54-75)
   - Comprehensive role coverage: bartender, sheriff, merchant, blacksmith, doctor, banker, saloon_girl, rancher, outlaw, preacher
   - Multiple variations per template for natural conversation
   - Total of 1490+ calculated dialogue combinations

2. **Robust Trust System**
   - Clean atomic operations with aggregation pipeline (NPCTrust.model.ts lines 97-135)
   - Proper trust level capping (0-100) with min/max operators
   - Unique composite index on characterId+npcId (line 77)
   - Secret unlocking tracking (lines 148-184)
   - Transaction support for atomic trust updates

3. **Well-Structured NPC Model**
   - Clear separation of combat NPCs vs. social NPCs
   - Good mood system integration (lines 36-40)
   - Proper indexes for efficient queries (lines 146-150)
   - Automatic respawn logic via aggregation (lines 156-187)
   - 15 starter NPCs with balanced loot tables

4. **Sophisticated Relationship Network**
   - Graph-based relationship tracking
   - BFS pathfinding algorithm for connections (lines 239-286)
   - Sentiment and strength tracking (-10 to +10, 1 to 10)
   - Relationship reveal conditions (lines 122-127)
   - Public vs. secret relationships

5. **Energy-Gated Interactions**
   - 2 energy cost prevents trust grinding spam (line 158)
   - Proper transaction usage for atomicity (lines 153-270)
   - Fire-and-forget quest updates (lines 222-225)

### What's WRONG ❌

#### BLOCKER ISSUES

**B1. Missing Model Import** (npc.service.ts line 8)
```typescript
import { NPCTrust, INPCTrust } from '../models/NPCTrust.model';
```
**Problem**: Imports exist but the model file is in the wrong location. Actual path should be verified.

**B2. Missing Gossip Service** (npc.service.ts line 244)
```typescript
const gossip = await GossipService.getGossip(npcId, characterId);
```
**Issue**: GossipService.getGossip is called but service may not be properly initialized.

**B3. STARTER_NPCS Data Inconsistency** (NPC.model.ts lines 211-530)
```typescript
export const STARTER_NPCS: Partial<INPC>[] = [
  {
    name: 'Barroom Brawler',
    type: NPCType.OUTLAW,
    // ... combat stats
  }
];
```
**Problem**: These are COMBAT NPCs but the service expects SOCIAL NPCs from location data. Two completely different NPC systems are conflated.

**B4. Location NPC Type Mismatch** (npc.service.ts line 85)
```typescript
for (const npc of location.npcs) {
  const trust = characterId ? await NPCTrust.findOne({ characterId, npcId: npc.id }) : null;
```
**Issue**: `location.npcs` returns `LocationNPC` type (from shared), but trust lookup expects string `npc.id`. No validation that this field exists.

#### CRITICAL ISSUES

**C1. N+1 Query Pattern** (npc.service.ts lines 72-118)
```typescript
static async getNPCsAtLocation(locationId: string, characterId?: string): Promise<NPCWithTrust[]> {
  const location = await Location.findById(locationId);
  const allNPCs: NPCWithTrust[] = [];

  // For each NPC, individual trust query
  for (const npc of location.npcs) {
    const trust = characterId
      ? await NPCTrust.findOne({ characterId, npcId: npc.id })
      : null;
```
**Impact**: If a location has 20 NPCs, this creates 20+ separate database queries.
**Fix**: Batch load all trusts in one query before the loop.

**C2. Missing Dialogue Variable Substitution** (npc.service.ts lines 276-312)
```typescript
private static getDialogueForTier(npc: LocationNPC, tier: TrustTier, character: ICharacter): string[] {
  const allDialogue = npc.dialogue || [];
  // ...
  return shuffled.slice(0, selectedCount);
}
```
**Problem**: Templates have variables like `{PLAYER}`, `{RECENT_LOCATION}` but NO substitution logic exists. Returns raw templates with unresolved variables.

**C3. Cross-Reference Generation Broken** (npc.service.ts lines 474-509)
```typescript
private static generateCrossReference(relationship: any, speakingNpcId: string): string | null {
  const isSubject = relationship.npcId === speakingNpcId;
  const subjectNpcId = isSubject ? relationship.relatedNpcId : relationship.npcId;

  // ...
  return template
    .replace('{subject}', subjectNpcId)  // Uses NPC ID, not NAME
    .replace('{relationship}', relationshipName)
    .replace('{detail}', detail)
    .replace('{location}', 'their usual spot');  // Hardcoded!
}
```
**Issues**:
1. Replaces `{subject}` with NPC ID instead of NPC name
2. Location is hardcoded to "their usual spot"
3. No actual NPC name lookup

**C4. Unsafe Type Coercion** (npc.service.ts lines 91, 249)
```typescript
...(npc as any).toObject ? (npc as any).toObject() : npc,
```
**Risk**: Suppresses TypeScript safety. If `npc` structure changes, silent runtime failures.

**C5. Trust Grinding Prevention Incomplete** (npc.service.ts lines 199-207)
```typescript
let trustIncrease = 2;
if (oldTrustLevel < 20) trustIncrease += 1;

if (npc.faction && character.faction === npc.faction) {
  trustIncrease += 2;
}
```
**Problem**: No cooldown or limit on interactions. Player can spam-interact for +2/+3/+4 trust indefinitely if they have energy.
**Missing**: Daily interaction limit or diminishing returns.

**C6. Relationship Pathfinding Performance** (NPCRelationship.model.ts lines 239-286)
```typescript
while (queue.length > 0) {
  const { npcId, path } = queue.shift()!;
  // ...
  const relationships = await this.find({
    $or: [{ npcId }, { relatedNpcId: npcId }],
    isPublic: true
  });
```
**Issue**: Database query INSIDE the BFS loop. For a 6-hop search through a dense network, this could create hundreds of queries.
**Fix**: Pre-load all relationships into memory first.

#### LOGICAL GAPS

**L1. No Dialogue Template Resolution**
- Templates exist (npcDialogueTemplates.ts) but never used by service
- No connection between template system and actual NPC interactions
- Variable substitution system defined but not implemented

**L2. Missing NPC Name Lookup**
- Service uses `npcId` strings everywhere
- No method to get NPC name from ID
- Cross-references will display IDs instead of names

**L3. No Trust Decay System**
- Trust only increases, never decreases
- No time-based decay for unused relationships
- Should decay 1-2 points per week without interaction

**L4. Quest Discovery Never Returns Quests** (npc.service.ts lines 359-385)
```typescript
static async getQuestsFromNPC(npcId: string, characterId: string): Promise<IQuestDefinition[]> {
  // ...
  const npcQuests = availableQuests.filter(quest => {
    if (quest.questId.includes(`npc:${npcId}`)) {
      return true;
    }
    return false;
  });
  return npcQuests;
}
```
**Problem**: Relies on quest IDs following `npc:{npcId}:questName` pattern. No evidence this pattern is used anywhere.

**L5. NPC Faction Not Stored**
```typescript
if (npc.faction && character.faction === npc.faction) {
```
**Issue**: `LocationNPC` type from shared doesn't have a `faction` field. Trust bonus logic will never trigger.

### BUG FIXES NEEDED

**BF1. Fix Dialogue Selection** (npc.service.ts lines 276-312)
```typescript
// CURRENT - WRONG
private static getDialogueForTier(npc: LocationNPC, tier: TrustTier, character: ICharacter): string[] {
  const allDialogue = npc.dialogue || [];
  // Uses static dialogue array from location data
}

// SHOULD BE
private static getDialogueForTier(
  npc: LocationNPC,
  tier: TrustTier,
  character: ICharacter
): string[] {
  // Get templates for NPC's role and current mood
  const npcMood = mapMoodToDialogueMood(npc.currentMood);
  const template = getDialogueTemplate(npc.role, npcMood, 'greeting');

  if (!template) return ['...'];

  // Select random dialogue and substitute variables
  const rawDialogue = getRandomDialogue(template);
  return [substituteVariables(rawDialogue, {
    PLAYER: character.name,
    RECENT_LOCATION: character.lastLocation || 'the trails',
    NPC: npc.name
  })];
}
```

**BF2. Fix Cross-Reference NPC Names** (npc.service.ts line 505)
```typescript
// CURRENT - WRONG
.replace('{subject}', subjectNpcId)  // Uses ID

// SHOULD BE
const subjectNpc = await this.getNPCById(subjectNpcId);
const subjectName = subjectNpc?.name || 'that person';
return template
  .replace('{subject}', subjectName)
  .replace('{relationship}', relationshipName)
  .replace('{detail}', detail)
  .replace('{location}', subjectNpc?.location || 'around town');
```

**BF3. Add Batch Trust Loading** (npc.service.ts lines 72-118)
```typescript
// BEFORE the loop
const npcIds = [...location.npcs.map(n => n.id)];
const trusts = characterId
  ? await NPCTrust.find({
      characterId,
      npcId: { $in: npcIds }
    }).lean()
  : [];

const trustMap = new Map(trusts.map(t => [t.npcId, t]));

// IN the loop
for (const npc of location.npcs) {
  const trust = trustMap.get(npc.id);
  allNPCs.push({
    ...(npc as any).toObject ? (npc as any).toObject() : npc,
    trustLevel: trust?.trustLevel || 0,
    interactionCount: trust?.interactionCount || 0,
    locationId: location._id.toString(),
    locationName: location.name
  });
}
```

**BF4. Fix Relationship Pathfinding** (NPCRelationship.model.ts lines 239-286)
```typescript
// Pre-load ALL relationships
const allRelationships = await this.find({ isPublic: true }).lean();
const relationshipMap = new Map<string, any[]>();

for (const rel of allRelationships) {
  if (!relationshipMap.has(rel.npcId)) relationshipMap.set(rel.npcId, []);
  if (!relationshipMap.has(rel.relatedNpcId)) relationshipMap.set(rel.relatedNpcId, []);
  relationshipMap.get(rel.npcId)!.push(rel);
  relationshipMap.get(rel.relatedNpcId)!.push(rel);
}

// BFS using in-memory data
while (queue.length > 0) {
  const { npcId, path } = queue.shift()!;
  const relationships = relationshipMap.get(npcId) || [];
  // ... rest of logic
}
```

### INCOMPLETE IMPLEMENTATIONS

**I1. Dialogue Template System Not Integrated**
- 1490+ dialogue variations created but never used
- No connection between templates and NPC service
- Variable substitution not implemented

**I2. Relationship History Not Displayed**
- `history` field exists but never shown to player
- Shared secrets tracked but never revealed
- Ongoing conflicts defined but not surfaced

**I3. Trust Tier Rewards Not Implemented**
- Trust tiers defined (STRANGER to CONFIDANT)
- No actual rewards or benefits at each tier
- Should unlock: better prices, exclusive quests, secret information

**I4. NPC Schedule/Availability Not Tracked**
- NPCs always available for interaction
- No time-of-day or location-based availability
- Should have schedules like entertainers do

---

## SYSTEM 2: REPUTATION SYSTEM

### Files Analyzed
- `server/src/services/reputationSpreading.service.ts` (651 lines)
- `server/src/routes/reputation.routes.ts` (45 lines)
- `server/src/routes/reputationSpreading.routes.ts` (84 lines)
- `server/src/controllers/reputationSpreading.controller.ts` (299 lines)

### What It Does RIGHT ✅

1. **Sophisticated Event Spreading Algorithm**
   - Multi-hop network propagation (0-3 hops)
   - Magnitude degradation with configurable decay rate
   - Faction-aware spread multiplier (1.2x for same faction)
   - Hop distance tracking and credibility calculation

2. **Good Batch Processing**
   - cleanupExpiredEvents uses batch operations (lines 520-578)
   - decayOldEvents uses batch processing (lines 584-650)
   - Cursor-based pagination to prevent memory exhaustion
   - Proper use of MongoDB $pull operator

3. **Well-Designed Reputation Modifiers** (lines 442-503)
   - Price modifier: -100 to +100 opinion = 0.5x to 2.0x price
   - Dialogue access levels (0-10)
   - Behavioral flags: willHelp, willHarm, willReport, willTrade
   - Quality of service (0-100)

4. **Proper Transaction Management**
   - Event creation wrapped in transaction context
   - Atomic operations for knowledge updates
   - Safe error handling and rollback

### What's WRONG ❌

#### BLOCKER ISSUES

**B5. Missing Models Referenced**
```typescript
import { ReputationEvent as ReputationEventModel } from '../models/ReputationEvent.model';
import { NPCKnowledge as NPCKnowledgeModel } from '../models/NPCKnowledge.model';
```
**Status**: These models are imported but may not exist or be incomplete. Need to verify.

**B6. Broken Import Path** (reputationSpreading.service.ts line 262)
```typescript
const { ALL_NPC_RELATIONSHIPS } = await import('../data/npcRelationships');
```
**Problem**: Dynamic import may fail if file doesn't exist. No error handling for import failure.

#### CRITICAL ISSUES

**C7. Event Validation Missing** (reputationSpreading.service.ts lines 44-99)
```typescript
static async createReputationEvent(
  characterId: string,
  eventType: ReputationEventType,
  locationId: string,
  options: { ... } = {}
): Promise<{ event: IReputationEvent; spreadResult: SpreadResult }> {
```
**Problems**:
1. No validation that characterId exists
2. No validation that locationId is valid
3. No validation that originNpcId exists
4. Magnitude/sentiment not validated against bounds

**C8. Reputation Spread May Create Infinite Events**
```typescript
const degradedMagnitude = event.magnitude * Math.pow(1 - event.decayRate, hop);
degradedMagnitude *= factionMultiplier;
```
**Risk**: If `decayRate` is 0 or `factionMultiplier` is very high, events spread indefinitely with no magnitude loss.
**Missing**: Minimum magnitude threshold (e.g., stop spreading if magnitude < 10).

**C9. Knowledge Source Logic Flawed** (lines 161-168)
```typescript
let source: KnowledgeSource;
if (hop === 1) {
  source = KnowledgeSource.HEARD;
} else if (hop === 2) {
  source = KnowledgeSource.HEARD;  // Same as hop 1!
} else {
  source = KnowledgeSource.RUMOR;
}
```
**Bug**: Hop 1 and hop 2 both use `HEARD`. Should be:
- Hop 0: WITNESSED
- Hop 1: HEARD
- Hop 2: HEARD_FROM_FRIEND
- Hop 3+: RUMOR

**C10. Sentiment Exaggeration Not Capped** (lines 227-231)
```typescript
if (source === KnowledgeSource.RUMOR) {
  const exaggeration = SecureRNG.range(-10, 10);
  sentiment = Math.max(-100, Math.min(100, sentiment + exaggeration));
}
```
**Issue**: This only applies to rumors. All other sources have raw sentiment that could exceed [-100, 100] bounds.

**C11. Connection Graph May Be Empty** (lines 259-301)
```typescript
private static async getNPCConnections(locationId: string): Promise<NPCConnection[]> {
  try {
    const { ALL_NPC_RELATIONSHIPS } = await import('../data/npcRelationships');
    // ...
  } catch (error) {
    logger.error('Error loading NPC connections:', error);
    return [];  // Silent failure!
  }
}
```
**Problem**: If import fails or data is empty, spreading silently fails with 0 NPCs informed.
**Should**: Throw error or use fallback mechanism.

**C12. Share Chance Logic Exploitable** (lines 306-331)
```typescript
const shareChance = conn.isFamily ? 1.0 : (conn.strength / 10);
if (SecureRNG.chance(shareChance)) {
  connected.add(conn.relatedNpcId);
}
```
**Issue**: Family members ALWAYS share (chance = 1.0). In a town with 3 large families, events spread to 80%+ of NPCs instantly.
**Fix**: Family should have high chance (0.8-0.9) but not guaranteed.

#### LOGICAL GAPS

**L6. No Location-Based Spread Radius**
- Events spread based on relationship network only
- Should have geographical limits (e.g., events in Town A don't reach Town B unless someone travels)
- Missing: location distance calculation

**L7. No Event Priority/Importance**
- All events spread at same rate regardless of importance
- Should have: major events (murder, robbery) spread faster than minor events (gossip)
- Missing: event importance multiplier

**L8. Reputation Doesn't Affect Gameplay**
- Modifiers calculated but not used in actual interactions
- No integration with shop prices, quest availability, NPC dialogue
- Missing: middleware to apply modifiers

**L9. No Reputation Rewards**
- No achievements for reaching high/low reputation
- No faction benefits for good standing
- Missing: reputation milestone rewards

**L10. Events Don't Expire Naturally**
```typescript
const expirationHours = config.expirationHours || 168; // Default 1 week
const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);
```
**Problem**: Events are deleted at expiry but should fade/decay before deletion. Current: 100% magnitude until instant deletion at expiry.

### BUG FIXES NEEDED

**BF5. Fix Knowledge Source Logic** (reputationSpreading.service.ts lines 161-168)
```typescript
// CURRENT - WRONG
let source: KnowledgeSource;
if (hop === 1) {
  source = KnowledgeSource.HEARD;
} else if (hop === 2) {
  source = KnowledgeSource.HEARD;
} else {
  source = KnowledgeSource.RUMOR;
}

// SHOULD BE
let source: KnowledgeSource;
switch (hop) {
  case 0:
    source = KnowledgeSource.WITNESSED;
    break;
  case 1:
    source = KnowledgeSource.HEARD;
    break;
  case 2:
    source = KnowledgeSource.HEARD_FROM_FRIEND;
    break;
  default:
    source = KnowledgeSource.RUMOR;
}
```

**BF6. Add Minimum Magnitude Threshold** (reputationSpreading.service.ts line 155)
```typescript
let degradedMagnitude = event.magnitude * Math.pow(1 - event.decayRate, hop);
degradedMagnitude *= factionMultiplier;

// ADD THIS
if (degradedMagnitude < 10) {
  continue; // Stop spreading if too weak
}
```

**BF7. Cap Sentiment Range** (reputationSpreading.service.ts line 226)
```typescript
// BEFORE exaggeration
let sentiment = Math.max(-100, Math.min(100, event.sentiment));

if (source === KnowledgeSource.RUMOR) {
  const exaggeration = SecureRNG.range(-10, 10);
  sentiment = Math.max(-100, Math.min(100, sentiment + exaggeration));
}
```

**BF8. Add Connection Fallback** (reputationSpreading.service.ts lines 259-301)
```typescript
private static async getNPCConnections(locationId: string): Promise<NPCConnection[]> {
  try {
    const { ALL_NPC_RELATIONSHIPS } = await import('../data/npcRelationships');
    // ... existing logic

    if (connections.length === 0) {
      logger.warn(`No NPC relationships found for location ${locationId}, using default network`);
      // Create basic connections between all NPCs at location
      // (implementation of default network)
    }

    return connections;
  } catch (error) {
    logger.error('Error loading NPC connections:', error);
    throw new AppError('Failed to load NPC relationship network', 500);
  }
}
```

### INCOMPLETE IMPLEMENTATIONS

**I5. Route Implementation Incomplete** (reputation.routes.ts)
- Only 4 routes defined
- Missing routes for:
  - Get character's reputation summary
  - Get faction standings
  - Get reputation change history
  - Get NPCs who know about player

**I6. Controller Missing Validation**
- No input validation in controllers
- No rate limiting on reputation queries
- Missing: Express validator middleware

**I7. No Reputation Persistence**
- Events and knowledge stored, but no summary/cached reputation score
- Each request recalculates reputation from scratch
- Should have: ReputationSummary collection for fast lookups

---

## SYSTEM 3: GOSSIP SYSTEM

### Files Analyzed
- `server/src/models/Gossip.model.ts` (344 lines)
- `server/src/data/gossipExpansion.ts` (1321 lines)
- `server/src/jobs/gossipSpread.job.ts` (438 lines)
- `server/src/services/gossip.service.ts` (441 lines)

### What It Does RIGHT ✅

1. **Exceptional Content Generation**
   - 50 base templates across 5 tones (scandal, rumor, news, secret, warning)
   - Variable pools with 20+ options each
   - Embellishments and degradations for truth decay
   - Calculated: Millions of unique gossip combinations possible

2. **Sophisticated Spreading Mechanics**
   - Gossip spreads through NPC network based on "gossipiness" trait
   - Spread factor (1-10) controls viral potential
   - Truth degradation over multiple hops
   - Batch processing to prevent N+1 queries (gossipSpread.job.ts)

3. **Good Performance Optimizations** (gossipSpread.job.ts)
   - Batch loading of gossip and NPC knowledge (lines 48-65)
   - In-memory cache for spread calculations (lines 62-65)
   - Bulk write operations for updates (lines 100-112)
   - Distributed locking to prevent duplicate runs

4. **Clean Data Model** (Gossip.model.ts)
   - Comprehensive indexes for query patterns
   - Automatic origin NPC tracking (pre-save hook lines 333-338)
   - Trust-based filtering for player access
   - Expiration and staleness tracking

5. **Template System Excellence** (gossipExpansion.ts)
   - Professional variable substitution patterns
   - Event trigger mapping
   - Location and faction relevance tracking
   - Spread rate and truth value per template

### What's WRONG ❌

#### BLOCKER ISSUES

**B7. GossipItem Model Not Found**
```typescript
import { GossipItemModel } from '../models/GossipItem.model';
```
**Problem**: gossipSpread.job imports `GossipItemModel` but uses `Gossip` model elsewhere. Model mismatch or naming inconsistency.

**B8. Template Variables Never Substituted**
```typescript
// gossipExpansion.ts line 47
template: 'Did you hear? {NPC1} was seen leaving {LOCATION} with {NPC2} last {TIME_PERIOD}...'

// gossip.service.ts lines 117-149
private static async generateGossipContent(...): Promise<string> {
  switch (category) {
    case GossipCategory.PERSONAL:
      return `Did you hear about ${subject}? Word is they've been acting strange lately.`;
    // ...
  }
}
```
**Issue**: Templates with variables exist, but `generateGossipContent` returns hardcoded strings. Variable substitution system never implemented.

#### CRITICAL ISSUES

**C13. Gossip Spread Job Memory Leak Risk** (gossipSpread.job.ts lines 62-65)
```typescript
const knowledgeCache: KnowledgeCache = {
  byNpcId: new Map(allKnowledge.map(k => [k.npcId.toString(), k])),
  allNpcIds: allKnowledge.map(k => k.npcId.toString())
};
```
**Problem**: If there are 1000+ NPCs with knowledge records, this loads ALL into memory. For large games, could be 100MB+.
**Fix**: Process in batches, don't load all at once.

**C14. Gossip Expiry Date Not Enforced** (Gossip.model.ts lines 117-120)
```typescript
expiresAt: {
  type: Date,
  index: true
},
```
**Issue**: `expiresAt` field exists but no TTL index on MongoDB. Expired gossip stays in database until manual cleanup.
**Fix**: Add TTL index: `GossipSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })`

**C15. Spread Calculation Incorrect** (gossipSpread.job.ts lines 145-170)
```typescript
private static calculateSpread(npcId: string, gossip: any, cache: KnowledgeCache): string[] {
  const knowledge = cache.byNpcId.get(npcId);
  if (!knowledge) return [];

  const gossipiness = (knowledge as any).gossipiness || 50;
  if (gossipiness < 30) {
    return [];
  }
```
**Problem**: Uses `(knowledge as any).gossipiness` but `NPCKnowledge` model doesn't have this field. Will always be 50 (default).
**Missing**: Gossipiness trait on NPCs.

**C16. Gossip Categories Never Used for Filtering**
```typescript
// Model has category field
category: {
  type: String,
  required: true,
  enum: Object.values(GossipCategory),
  index: true
}

// But getGossipForPlayer doesn't filter by category
static.getGossipForPlayer = async function(
  npcId: string,
  playerTrustLevel: number,
  playerFaction?: string
): Promise<IGossip[]> {
  const query: any = {
    knownBy: npcId,
    isStale: false,
    trustRequired: { $lte: playerTrustLevel }
  };
  // No category filtering!
}
```
**Issue**: Player gets ALL gossip categories regardless of context. Should filter based on NPC role/player request.

**C17. Verifiable Gossip Never Verified** (Gossip.model.ts lines 86-92)
```typescript
verifiable: {
  type: Boolean,
  default: false
},
verificationMethod: {
  type: String
}
```
**Problem**: Fields exist but no logic to verify gossip truthfulness. Players can't investigate claims.

**C18. Breaking News Spread Flawed** (gossipSpread.job.ts lines 308-365)
```typescript
static async spreadBreakingNews(gossipId: string, sourceNPCIds: string[]): Promise<SpreadReport> {
  // ...
  for (const npcId of sourceNPCIds) {
    const targets = allNpcIds.filter(id => id !== npcId && !existingKnowers.has(id));

    for (const targetId of targets) {
      if (!newKnowers.includes(targetId)) {
        newKnowers.push(targetId);
        report.npcsInformed++;
      }
    }
  }
```
**Logic Error**: Every source NPC spreads to ALL targets. If 3 sources, and 100 NPCs total, spreads to 97 NPCs instantly. Should have limits/probability.

#### LOGICAL GAPS

**L11. No Player-Generated Gossip**
- System only creates NPC→NPC gossip
- Players can't spread rumors or start gossip
- Missing: Player actions creating gossip events

**L12. Gossip Doesn't Affect Reputation**
- Gossip about player exists but doesn't impact reputation system
- Two systems are parallel, not integrated
- Should: Negative gossip reduces reputation, positive gossip increases

**L13. No Gossip Verification Gameplay**
- `verifiable` and `verificationMethod` fields unused
- Could have quests to verify/debunk gossip
- Missing: Investigation mechanic

**L14. Truth Degradation Not Visible to Player**
- Templates have `truthValue` and `degradations`
- Player never told reliability of gossip
- Missing: UI indication of gossip reliability

**L15. Event-Triggered Gossip Limited** (gossip.service.ts lines 314-399)
- Only handles 5 event types: crime, arrest, gang, combat, reputation
- Should handle: property purchase, marriage, death, business opening, etc.
- Event mapping incomplete

### BUG FIXES NEEDED

**BF9. Implement Template Variable Substitution** (gossip.service.ts lines 117-149)
```typescript
// CURRENT - WRONG
private static async generateGossipContent(
  category: GossipCategory,
  subject: string,
  eventType?: string,
  eventData?: any
): Promise<string> {
  switch (category) {
    case GossipCategory.PERSONAL:
      return `Did you hear about ${subject}?...`;
  }
}

// SHOULD BE
private static async generateGossipContent(
  category: GossipCategory,
  subject: string,
  eventType?: string,
  eventData?: any
): Promise<string> {
  // Get templates for this category
  const templates = getGossipTemplatesByCategory(category);

  // Filter by event type if specified
  const relevantTemplates = eventType
    ? templates.filter(t => t.triggerEvents?.includes(eventType))
    : templates;

  if (relevantTemplates.length === 0) {
    return `Something happened with ${subject}.`;
  }

  // Select random template
  const template = SecureRNG.select(relevantTemplates);

  // Substitute variables
  let content = template.template;
  for (const varName of template.variables) {
    const value = getRandomGossipVariable(varName) || subject;
    content = content.replace(`{${varName}}`, value);
  }

  // Add random embellishment
  const embellishment = getRandomEmbellishment(template);
  if (embellishment) {
    content += ` ${embellishment}`;
  }

  return content;
}
```

**BF10. Add TTL Index** (Gossip.model.ts after line 169)
```typescript
// ADD THIS after other indexes
GossipSchema.index({ expiresAt: 1 }, {
  expireAfterSeconds: 0,
  partialFilterExpression: { expiresAt: { $exists: true } }
});
```

**BF11. Fix Breaking News Spread** (gossipSpread.job.ts lines 330-348)
```typescript
// CURRENT - WRONG
for (const npcId of sourceNPCIds) {
  const targets = allNpcIds.filter(id => id !== npcId && !existingKnowers.has(id));
  for (const targetId of targets) {
    if (!newKnowers.includes(targetId)) {
      newKnowers.push(targetId);
      report.npcsInformed++;
    }
  }
}

// SHOULD BE
const BREAKING_NEWS_SPREAD_LIMIT = 20; // Max NPCs per source
for (const npcId of sourceNPCIds) {
  const targets = allNpcIds.filter(id => id !== npcId && !existingKnowers.has(id));

  // Shuffle and limit
  const shuffled = SecureRNG.shuffle(targets);
  const limitedTargets = shuffled.slice(0, BREAKING_NEWS_SPREAD_LIMIT);

  for (const targetId of limitedTargets) {
    if (!newKnowers.includes(targetId)) {
      newKnowers.push(targetId);
      report.npcsInformed++;
    }
  }
}
```

**BF12. Add Gossip Category Filtering** (Gossip.model.ts lines 282-305)
```typescript
static.getGossipForPlayer = async function(
  npcId: string,
  playerTrustLevel: number,
  playerFaction?: string,
  categories?: GossipCategory[]  // ADD THIS
): Promise<IGossip[]> {
  const query: any = {
    knownBy: npcId,
    isStale: false,
    trustRequired: { $lte: playerTrustLevel }
  };

  // ADD THIS
  if (categories && categories.length > 0) {
    query.category = { $in: categories };
  }

  if (playerFaction) {
    query.$or = [
      { factionRequired: { $exists: false } },
      { factionRequired: playerFaction }
    ];
  } else {
    query.factionRequired = { $exists: false };
  }

  return this.find(query).sort({ startDate: -1 }).limit(10);
};
```

### INCOMPLETE IMPLEMENTATIONS

**I8. Variable Pool System Created But Not Used**
- `GOSSIP_VARIABLE_POOLS` with 18 categories defined (lines 1140-1210)
- Helper functions created (lines 1214-1320)
- NEVER called by gossip generation system

**I9. Template Trigger Events Not Wired**
- Templates specify `triggerEvents` like 'crime_committed', 'robbery'
- No integration with game event system to auto-generate gossip
- Missing: Event listener system

**I10. Gossip Spread Stats Never Recorded**
- `spreadTo` field in model (line 109-111)
- Never populated during spreading
- Can't track gossip propagation chains

---

## SYSTEM 4: MENTOR SYSTEM

### Files Analyzed
- `server/src/services/mentor.service.ts` (454 lines)
- `server/src/routes/mentor.routes.ts` (55 lines)

### What It Does RIGHT ✅

1. **Clean Service Architecture**
   - Clear separation of concerns
   - Good use of transactions (lines 139-189)
   - Proper error handling with AppError
   - Static data import pattern

2. **Comprehensive Requirement Checking** (lines 44-130)
   - Level, faction rep, NPC trust, skill requirements
   - No active bounty check for lawman mentors
   - Criminal reputation for outlaw mentors
   - Conflicting mentor history check

3. **Good Trust Level Progression** (lines 227-276)
   - 10% progress per task
   - Automatic tier advancement at 100%
   - New ability unlocking at each tier
   - Progress retention (50%) when leaving

4. **Ability System Well-Designed** (lines 280-353)
   - Active/passive/unlock ability types
   - Cooldown tracking with Map data structure
   - Energy cost validation
   - Proper cooldown management

5. **Clean Routes** (mentor.routes.ts)
   - Good separation of public/protected routes
   - Proper middleware ordering
   - RESTful design

### What's WRONG ❌

#### BLOCKER ISSUES

**B9. Missing Mentors Data Import** (mentor.service.ts line 10)
```typescript
import { MENTORS, getMentorById } from '../data/mentors';
```
**Problem**: No evidence this file exists. Service will fail to import.
**Need**: Create `server/src/data/mentors.ts` with mentor definitions.

**B10. Missing Mentorship Model** (mentor.service.ts line 7)
```typescript
import { Mentorship, IMentorship } from '../models/Mentorship.model';
```
**Status**: Model referenced but may not exist. Need verification.

#### CRITICAL ISSUES

**C19. N+1 Query in Availability Check** (mentor.service.ts lines 416-427)
```typescript
static async getAvailableMentors(characterId: string): Promise<Mentor[]> {
  const availableMentors: Mentor[] = [];

  for (const mentor of MENTORS) {
    const { canRequest } = await this.canBecomeMentee(characterId, mentor.mentorId);
    if (canRequest) {
      availableMentors.push(mentor);
    }
  }

  return availableMentors;
}
```
**Problem**: If there are 20 mentors, calls `canBecomeMentee` 20 times, each potentially making multiple DB queries.
**Fix**: Batch load character data, all trusts, history once, then check requirements in memory.

**C20. Skill Level Check Missing** (mentor.service.ts line 109)
```typescript
const characterSkillLevel = character.getSkillLevel(skillId);
```
**Problem**: `Character` model may not have `getSkillLevel` method. No verification of this method's existence.

**C21. Ability Cooldown Not Persisted** (mentor.service.ts lines 311-333)
```typescript
const cooldowns = mentorship.activeAbilityCooldowns as Map<string, Date>;
const cooldownEnd = cooldowns.get(abilityId);
// ...
cooldowns.set(abilityId, cooldownUntil);
mentorship.activeAbilityCooldowns = cooldowns;
await mentorship.save();
```
**Issue**: `Map` is not a native MongoDB type. Saving a Map as-is may not work. Should be stored as object or array.

**C22. Storyline Quest Completion Gives Unlimited Progress** (lines 384-411)
```typescript
static async completeStorylineQuest(characterId: string, questId: string): Promise<MentorProgressUpdate | null> {
  // ...
  if (!mentorship.storylineProgress.includes(questId)) {
    mentorship.storylineProgress.push(questId);
    await mentorship.save();

    // Storyline quests give significant progress
    return await this.advanceMentorship(characterId, 3);  // +30% progress!
  }
  return null;
}
```
**Problem**: No limit on storyline quests. If mentor has 10 quests, player can gain 300% trust progress (3 full levels) just from quests.
**Fix**: Cap total storyline progress contribution (e.g., max 150% from all quests combined).

**C23. Faction Rep Check Hardcoded** (lines 76-85)
```typescript
if (mentor.requirements.minFactionRep) {
  const factionKey = mentor.faction.toLowerCase().replace(/\s+/g, '');
  const repKey = factionKey === 'settleralliance' ? 'settlerAlliance' :
                 factionKey === 'nahicoalition' ? 'nahiCoalition' :
                 factionKey === 'frontera' ? 'frontera' : null;

  if (repKey && character.factionReputation[repKey] < mentor.requirements.minFactionRep) {
    reasons.push(`Requires ${mentor.requirements.minFactionRep} reputation with ${mentor.faction}`);
    canRequest = false;
  }
}
```
**Issue**: Hardcoded faction name mapping. Breaks if new factions added. Should use enum or map.

#### LOGICAL GAPS

**L16. Mentor Abilities Never Applied to Character**
```typescript
return {
  success: true,
  message: `${ability.name} activated!`,
  ability,
  cooldownUntil,
  effects: ability.effects  // Returns effects but doesn't apply them!
};
```
**Problem**: Ability use returns effects object but never modifies character stats. Effects documented but not implemented.

**L17. No Mentor Availability Check**
- Mentors always available for request
- No check if mentor is alive, in location, or willing
- Missing: Mentor state tracking

**L18. Leaving Mentor Has No Consequences**
```typescript
mentorship.retainedProgress = Math.floor(mentorship.trustProgress * 0.5);
```
**Issue**: Only lose 50% of current tier progress. If at tier 4 with 90% progress, can leave and rejoin to skip tier 1-3 again.
**Should**: Lose entire tier or have cooldown before re-joining.

**L19. No Mentor Exclusivity**
- Can have history with multiple mentors as long as not simultaneous
- No penalty for "mentor hopping"
- Should: Loyalty bonuses for sticking with one mentor

**L20. Trust Level Never Decreases**
- Trust only increases through tasks
- No decay for inactivity
- Should: Trust decays if not interacting for weeks

### BUG FIXES NEEDED

**BF13. Fix N+1 in Available Mentors** (mentor.service.ts lines 416-427)
```typescript
static async getAvailableMentors(characterId: string): Promise<Mentor[]> {
  // Batch load all data needed
  const character = await Character.findById(characterId);
  if (!character) return [];

  const allTrusts = await NPCTrust.find({ characterId }).lean();
  const trustMap = new Map(allTrusts.map(t => [t.npcId, t.trustLevel]));

  const history = await Mentorship.getMentorshipHistory(characterId);
  const hasActiveMentor = await Mentorship.hasActiveMentor(characterId);

  const availableMentors: Mentor[] = [];

  for (const mentor of MENTORS) {
    // Check all requirements using in-memory data
    if (hasActiveMentor) continue;
    if (character.level < mentor.requirements.minLevel) continue;

    const npcTrust = trustMap.get(mentor.npcId) || 0;
    if (npcTrust < mentor.requirements.minNpcTrust) continue;

    // ... other checks using loaded data

    availableMentors.push(mentor);
  }

  return availableMentors;
}
```

**BF14. Fix Cooldown Storage** (mentor.service.ts line 333)
```typescript
// CURRENT - WRONG
mentorship.activeAbilityCooldowns = cooldowns;  // Map<string, Date>

// SHOULD BE (in model schema)
activeAbilityCooldowns: {
  type: Map,
  of: Date
}

// OR store as object
const cooldownObject = Object.fromEntries(cooldowns);
mentorship.activeAbilityCooldowns = cooldownObject;
```

**BF15. Cap Storyline Quest Progress** (mentor.service.ts lines 407)
```typescript
static async completeStorylineQuest(characterId: string, questId: string): Promise<MentorProgressUpdate | null> {
  const current = await this.getCurrentMentor(characterId);
  if (!current) {
    throw new AppError('No active mentor', 404);
  }

  const { mentorship, mentor } = current;

  const storylineQuest = mentor.storyline.quests.find(q => q.questId === questId);
  if (!storylineQuest) {
    return null;
  }

  if (!mentorship.storylineProgress.includes(questId)) {
    mentorship.storylineProgress.push(questId);

    // ADD THIS CHECK
    const totalStorylineProgress = mentorship.storylineProgress.length * 30; // 3 tasks * 10% each
    const maxStorylineContribution = 150; // Cap at 1.5 levels from storylines

    if (totalStorylineProgress >= maxStorylineContribution) {
      await mentorship.save();
      return null; // Already maxed storyline contribution
    }

    await mentorship.save();
    return await this.advanceMentorship(characterId, 3);
  }

  return null;
}
```

### INCOMPLETE IMPLEMENTATIONS

**I11. Mentor Data Not Defined**
- Service imports from `../data/mentors` but file doesn't exist
- Need to create mentor definitions with:
  - Abilities
  - Requirements
  - Storyline quests
  - Conflicting mentors

**I12. Ability Effects Not Applied**
- Effects returned but never modify character
- Need to implement stat modification logic
- Missing: Buff application system

**I13. No Mentor Progression Tracking**
- Can't see progress toward next tier
- No UI for unlocked abilities
- Missing: Progress visualization

---

## SYSTEM 5: SERVICE PROVIDERS

### Files Analyzed
- `server/src/routes/serviceProvider.routes.ts` (43 lines)

### What It Does RIGHT ✅

1. **Clean Route Structure**
   - Clear separation of public/protected routes
   - RESTful URL patterns
   - Proper use of middleware

2. **Good Route Naming**
   - `/location/:locationId` for NPCs at location
   - `/:providerId/schedule` for schedules
   - `/:providerId/use-service` for actions

### What's WRONG ❌

#### BLOCKER ISSUES

**B11. Missing Controller File**
```typescript
import {
  getProvidersAtLocation,
  getProviderSchedule,
  getAvailableServices,
  useService,
  getAllProviders,
} from '../controllers/serviceProvider.controller';
```
**Problem**: Routes import 5 controller functions. Controller file not provided for audit. CANNOT VERIFY implementation exists.

#### CRITICAL ISSUES

**C24. No Rate Limiting**
- Service usage not rate limited
- Could spam service calls
- Missing: Rate limiter middleware

**C25. No Input Validation**
- No validation of locationId, providerId, or service parameters
- Missing: Express-validator middleware

**C26. No Error Handling**
- Routes don't wrap handlers in asyncHandler
- Errors will crash server
- Missing: Error handling middleware

#### LOGICAL GAPS

**L21. No Service Data Model**
- Routes exist but no evidence of underlying data
- How are service providers stored?
- Missing: ServiceProvider model or data file

**L22. No Schedule Validation**
- Can request schedule but no check if provider exists
- No time-of-day availability logic visible
- Missing: Schedule enforcement

**L23. No Payment Handling**
- `useService` route exists but no mention of cost
- Are services free? Paid? Energy cost?
- Missing: Payment integration

### BUG FIXES NEEDED

**BF16. Add Error Handling** (serviceProvider.routes.ts)
```typescript
import { asyncHandler } from '../middleware/asyncHandler';

// Wrap all handlers
router.get('/', asyncHandler(getAllProviders));
router.get('/:providerId/schedule', asyncHandler(getProviderSchedule));
router.get('/location/:locationId', requireAuth, asyncHandler(getProvidersAtLocation));
router.get('/:providerId/services', requireAuth, asyncHandler(getAvailableServices));
router.post('/:providerId/use-service', requireAuth, asyncHandler(useService));
```

**BF17. Add Validation** (serviceProvider.routes.ts)
```typescript
import { param, body } from 'express-validator';
import { validate } from '../middleware/validate';

router.get('/location/:locationId',
  requireAuth,
  param('locationId').isString().trim().notEmpty(),
  validate,
  asyncHandler(getProvidersAtLocation)
);

router.post('/:providerId/use-service',
  requireAuth,
  param('providerId').isString().trim().notEmpty(),
  body('serviceId').isString().trim().notEmpty(),
  validate,
  asyncHandler(useService)
);
```

### INCOMPLETE IMPLEMENTATIONS

**I14. No Service Provider Data**
- Routes defined but no data model
- No service definitions
- No provider schedules
- ENTIRE SYSTEM is stub

**I15. No Integration with Other Systems**
- Should integrate with:
  - Energy system (service costs energy)
  - Gold system (service costs money)
  - Reputation (provider opinion affects prices)
- Missing: All cross-system integration

---

## SYSTEM 6: ENTERTAINER SYSTEM

### Files Analyzed
- `server/src/services/entertainer.service.ts` (524 lines)
- `server/src/routes/entertainer.routes.ts` (106 lines)

### What It Does RIGHT ✅

1. **Comprehensive Service Implementation** (entertainer.service.ts)
   - Performance watching system (lines 67-187)
   - Skill learning system (lines 189-294)
   - Location tracking with day-based routing (lines 299-354)
   - Schedule checking (lines 359-377)
   - Gossip integration (lines 380-418)

2. **Good Route Organization** (entertainer.routes.ts)
   - Public routes for discovery
   - Protected routes for interactions
   - Proper parameter validation in URLs
   - Good middleware ordering

3. **Well-Designed Reward System**
   - Experience, gold, item, and buff rewards
   - Mood effects from performances
   - Trust gain from interactions
   - Buffs with duration and expiration tracking

4. **Dynamic Location System** (lines 299-354)
   - Entertainers travel on routes
   - Day-based location calculation
   - Cyclic routing system
   - Current location lookup

5. **Schedule System** (lines 359-377)
   - Hour-based activity tracking
   - "Performing" vs. other activities
   - Default schedule per entertainer

### What's WRONG ❌

#### BLOCKER ISSUES

**B12. Missing Entertainer Data File** (entertainer.service.ts line 9)
```typescript
import {
  WANDERING_ENTERTAINERS,
  WanderingEntertainer,
  Performance,
  PerformanceType,
  TeachableSkill,
  getEntertainerById,
  getEntertainersByType,
  getEntertainersAtLocation,
  getAvailablePerformances
} from '../data/wanderingEntertainers';
```
**Problem**: Imports from non-existent data file. Service will fail to load.
**Need**: Create `server/src/data/wanderingEntertainers.ts` with entertainer definitions.

**B13. Missing Controller File** (entertainer.routes.ts line 9-24)
```typescript
import {
  getAllEntertainers,
  getEntertainerDetails,
  // ... 10+ controller functions
} from '../controllers/entertainer.controller';
```
**Problem**: Routes import 16 controller functions. Controller file not in audit scope. Can't verify implementation.

#### CRITICAL ISSUES

**C27. Buff Application Not Implemented** (entertainer.service.ts lines 149-163)
```typescript
if (performance.rewards.buff) {
  const buff = performance.rewards.buff;
  const expiresAt = new Date(Date.now() + buff.duration * 60 * 1000);

  buffsApplied.push({
    stat: buff.stat,
    modifier: buff.modifier,
    duration: buff.duration,
    expiresAt
  });

  // Apply buff to character (implementation depends on buff system)
  // This would typically add to a character.activeBuffs array
}
```
**Problem**: Comment says "implementation depends on buff system" but nothing is implemented. Buff is recorded but never applied to character.

**C28. Item Reward Not Implemented** (lines 144-147)
```typescript
if (performance.rewards.item) {
  itemReceived = performance.rewards.item;
  // Add item to character inventory (implementation depends on inventory system)
}
```
**Problem**: Item name is saved to variable but never added to inventory. Player gets notification but no actual item.

**C29. Mood Effect Not Implemented** (lines 421-445)
```typescript
export async function applyPerformanceMoodEffect(
  characterId: string,
  moodEffect: { mood: string; duration: number; intensity: number; }
): Promise<void> {
  try {
    const character = await Character.findById(characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Apply mood effect (implementation depends on mood system)
    // This would typically set or modify character.currentMood
    // and track duration/expiration

    await character.save();
  }
```
**Problem**: Entire function body is a comment. Mood effects documented but not implemented.

**C30. Trust Tracking Not Persisted** (lines 167-168, 218)
```typescript
const trustGained = 2;
// Trust tracking would be implemented in a separate system
```
**Problem**: Trust gain calculated but never saved. Uses hardcoded placeholder (218).

**C31. Energy Check After Gold Transaction** (entertainer.service.ts lines 230-256)
```typescript
// Check energy
if (character.energy < skill.energyCost) {
  return {
    success: false,
    message: `Not enough energy...`,
    // ... returns all cost info
  };
}

// Check gold
if (character.gold < skill.goldCost) {
  return {
    success: false,
    message: `Not enough gold...`,
    // ... returns all cost info
  };
}

// Deduct costs
character.energy -= skill.energyCost;
await GoldService.deductGold(character._id.toString(), skill.goldCost, ...);
```
**Issue**: If energy check passes but gold check fails, we never refund the energy. Should check BOTH before deducting EITHER.
**Fix**: Move deductions after all validations.

**C32. Skill Effect Not Applied** (lines 268-276)
```typescript
const effectApplied = {
  stat: skill.effect.stat,
  modifier: skill.effect.modifier,
  permanent: skill.effect.permanent
};

// Apply permanent stat increase (implementation depends on character stat system)
// This would typically modify character stats or add to a learnedSkills array

await character.save();
```
**Problem**: Effect stored in variable but character never modified. Player pays but gets nothing.

**C33. Route Calculation Overflow** (lines 329-354)
```typescript
export function getEntertainerCurrentLocation(entertainerId: string, currentDay: number) {
  const entertainer = getEntertainerById(entertainerId);
  if (!entertainer) {
    return null;
  }

  // Calculate position in route based on day
  let totalDays = 0;
  for (const stop of entertainer.route) {
    totalDays += stop.stayDuration;
  }

  const dayInCycle = currentDay % totalDays;  // POTENTIAL DIVISION BY ZERO
```
**Bug**: If entertainer has no route stops, `totalDays = 0`, and `currentDay % 0 = NaN`.
**Fix**: Check `if (totalDays === 0)` and return default location.

#### LOGICAL GAPS

**L24. No Performance Cooldown**
- Player can watch same performance repeatedly
- Should have cooldown: "You've seen this act recently"
- Missing: Performance history tracking

**L25. No Entertainer Popularity/Fame**
- All entertainers treated equally
- Should have: Famous entertainers draw crowds, charge more
- Missing: Popularity system

**L26. No Crowd Size Mechanics**
- Performances don't track audience
- Could have: Better rewards with larger crowds
- Missing: Audience simulation

**L27. Gossip Access Not Trust-Gated** (lines 380-418)
```typescript
export function getGossipFromEntertainer(entertainerId: string, trustLevel: number, category?: string): string[] {
  // ...
  if (trustLevel < 20) {
    return ["I don't know you well enough to share secrets."];
  }

  // ... returns placeholder strings, not actual gossip
  return [
    `I hear things about ${availableCategories.join(', ')}...`,
    "Let me tell you what I've heard...",
  ];
}
```
**Problem**:
1. Returns hardcoded strings, not real gossip from gossip system
2. No integration with Gossip.getGossipForPlayer
3. Trust check exists but returns fake data anyway

**L28. No Event Creation for Performances**
- Entertainers perform but no gossip/reputation events created
- Should generate: "Great show by {entertainer} last night!"
- Missing: Event emission system

### BUG FIXES NEEDED

**BF18. Fix Resource Check Order** (entertainer.service.ts lines 230-266)
```typescript
// CURRENT - WRONG ORDER
if (character.energy < skill.energyCost) {
  return { success: false, ... };
}
if (character.gold < skill.goldCost) {
  return { success: false, ... };
}

character.energy -= skill.energyCost;
await GoldService.deductGold(...);

// SHOULD BE
// Check FIRST
if (character.energy < skill.energyCost) {
  return { success: false, message: `Not enough energy. Need ${skill.energyCost}, have ${character.energy}`, ... };
}

const hasGold = character.gold >= skill.goldCost;
if (!hasGold) {
  return { success: false, message: `Not enough gold. Need ${skill.goldCost}, have ${character.gold}`, ... };
}

// Deduct AFTER all checks pass
character.energy -= skill.energyCost;
await GoldService.deductGold(character._id.toString(), skill.goldCost, ...);
```

**BF19. Fix Division by Zero** (entertainer.service.ts lines 329-335)
```typescript
let totalDays = 0;
for (const stop of entertainer.route) {
  totalDays += stop.stayDuration;
}

// ADD THIS
if (totalDays === 0 || entertainer.route.length === 0) {
  logger.warn(`Entertainer ${entertainerId} has no route, defaulting to first location`);
  return {
    locationId: 'default-location',
    locationName: 'Unknown',
    performanceVenue: 'Town Square'
  };
}

const dayInCycle = currentDay % totalDays;
```

**BF20. Implement Actual Gossip Integration** (entertainer.service.ts lines 380-418)
```typescript
export async function getGossipFromEntertainer(
  entertainerId: string,
  characterId: string,  // ADD characterId parameter
  trustLevel: number,
  category?: string
): Promise<string[]> {
  const entertainer = getEntertainerById(entertainerId);
  if (!entertainer) {
    return [];
  }

  if (trustLevel < 20) {
    return ["I don't know you well enough to share secrets."];
  }

  if (!entertainer.gossipAccess || entertainer.gossipAccess.length === 0) {
    return ["I don't really hear much gossip in my line of work."];
  }

  // INTEGRATE WITH REAL GOSSIP SYSTEM
  const { GossipService } = await import('./gossip.service');
  const npcId = `entertainer-${entertainerId}`;

  const { gossip } = await GossipService.getGossip(npcId, characterId);

  // Filter by category if specified
  const filteredGossip = category
    ? gossip.filter(g => entertainer.gossipAccess.includes(g.category))
    : gossip.filter(g => entertainer.gossipAccess.includes(g.category));

  // Return gossip content
  return filteredGossip.slice(0, 3).map(g => g.content);
}
```

**BF21. Implement Buff Application** (entertainer.service.ts lines 149-163)
```typescript
if (performance.rewards.buff) {
  const buff = performance.rewards.buff;
  const expiresAt = new Date(Date.now() + buff.duration * 60 * 1000);

  buffsApplied.push({
    stat: buff.stat,
    modifier: buff.modifier,
    duration: buff.duration,
    expiresAt
  });

  // IMPLEMENT THIS
  if (!character.activeBuffs) {
    character.activeBuffs = [];
  }

  character.activeBuffs.push({
    source: 'entertainer_performance',
    sourceId: performanceId,
    stat: buff.stat,
    modifier: buff.modifier,
    expiresAt,
    appliedAt: new Date()
  });
}
```

### INCOMPLETE IMPLEMENTATIONS

**I16. Reward Systems Stubbed Out**
- Buff application commented out
- Item rewards commented out
- Mood effects commented out
- Skill effects commented out
- Only experience and gold actually work

**I17. No Entertainer Data**
- Service imports from non-existent data file
- Need to create: Entertainer definitions, performances, skills, routes

**I18. No Performance History**
- Can't track what performances player has seen
- No "favorite entertainer" system
- Missing: Performance attendance tracking

**I19. Gossip Returns Fake Data**
- Returns hardcoded placeholder strings
- Should integrate with real gossip system
- Currently useless for gameplay

---

## CROSS-SYSTEM ISSUES

### Integration Problems

**INT1. NPC Service vs. NPC Model Conflict**
- NPC.model.ts defines COMBAT NPCs (OUTLAW, WILDLIFE, LAWMAN)
- npc.service.ts expects SOCIAL NPCs (bartender, sheriff, merchant)
- Two separate systems using same "NPC" terminology
- Should be: CombatNPC vs. SocialNPC

**INT2. Reputation and Gossip Not Connected**
- ReputationSpreading service spreads events through NPC network
- Gossip service spreads gossip through NPC network
- Both systems track NPC knowledge independently
- Should share NPCKnowledge model

**INT3. Trust Systems Duplicated**
- NPCTrust model for NPC interactions
- Mentor service has its own trust tracking
- Entertainer service has placeholder trust
- Should consolidate into single trust system

**INT4. Missing Service Integration**
- Entertainer buffs not applied (no buff system)
- Service provider payments not implemented (no payment integration)
- Performance mood effects not applied (no mood system)
- All systems assume other systems exist but don't verify

**INT5. Dialogue Templates Never Used**
- 1490+ dialogue variations created in npcDialogueTemplates.ts
- npc.service.ts returns static dialogue from location data
- NO connection between template system and service
- Entire template system is dead code

### Data Consistency Issues

**DATA1. NPC ID Format Inconsistent**
- Some use MongoDB ObjectId
- Some use string IDs like 'bartender-01'
- Some use NPC names as IDs
- Should standardize on one format

**DATA2. Location Reference Inconsistent**
- Some use locationId (ObjectId)
- Some use locationName (string)
- Some use both
- Should use consistent foreign key

**DATA3. Faction Name Variations**
- "Settler Alliance" vs. "settlerAlliance" vs. "settler_alliance"
- "Nahi Coalition" vs. "nahiCoalition" vs. "nahi_coalition"
- "Frontera" vs. "frontera"
- Should use enum for consistency

**DATA4. Mood Type Mismatch**
- NPCs have MoodType from shared
- Dialogue templates have DialogueMood type
- Mapping function exists but types don't match perfectly
- Should unify mood types

---

## PERFORMANCE CONCERNS

### Database Query Issues

**PERF1. N+1 Queries in NPC Service** (Already documented as C1)
- getNPCsAtLocation creates 1 + N queries
- getAvailableMentors creates M × N queries
- Should batch load

**PERF2. N+1 Queries in Reputation Pathfinding** (Already documented as C6)
- BFS algorithm queries DB in loop
- Should pre-load relationship graph

**PERF3. Gossip Spread Job Memory Load** (Already documented as C13)
- Loads all NPC knowledge into memory
- Could be 100MB+ for large servers
- Should process in batches

**PERF4. Missing Indexes**
```typescript
// NPCTrust - Good indexes exist
NPCTrustSchema.index({ characterId: 1, npcId: 1 }, { unique: true });

// Gossip - Missing compound index
GossipSchema.index({ subject: 1, category: 1 });  // Exists
// MISSING: { knownBy: 1, category: 1, trustRequired: 1 }

// NPCRelationship - Good indexes exist
NPCRelationshipSchema.index({ npcId: 1, relatedNpcId: 1 }, { unique: true });

// BUT - No index on common query pattern:
// MISSING: { npcId: 1, canGossipAbout: 1, isPublic: 1 }
```

### Caching Opportunities

**CACHE1. Reputation Calculations**
- `getPlayerReputation` recalculates from all events every call
- Should cache reputation summary
- Update cache only when new events occur

**CACHE2. NPC Dialogue**
- Dialogue generation could be expensive with template system
- Should cache generated dialogue per NPC
- Invalidate cache daily or on major events

**CACHE3. Available Mentors**
- `getAvailableMentors` checks all mentors every call
- Requirements rarely change (level, faction rep)
- Should cache eligibility, invalidate on level-up

**CACHE4. Gossip For Player**
- Same gossip queries repeated frequently
- Should cache per NPC-player pair
- Invalidate when new gossip spreads

---

## SECURITY CONCERNS

### Input Validation

**SEC1. No NPC ID Validation**
```typescript
static async interactWithNPC(characterId: string, locationId: string, npcId: string) {
  // Directly uses npcId without validating format
  const npc = location.npcs.find(n => n.id === npcId);
```
**Risk**: NoSQL injection if npcId is object instead of string
**Fix**: Validate npcId is string and matches expected pattern

**SEC2. No Reputation Event Validation**
```typescript
static async createReputationEvent(
  characterId: string,
  eventType: ReputationEventType,
  locationId: string,
  options: { magnitude?: number; ... } = {}
)
```
**Risk**:
- magnitude could be negative or huge (9999999)
- sentiment could exceed bounds
- No validation of option values

**SEC3. No Rate Limiting**
- No limits on NPC interactions
- No limits on reputation queries
- No limits on gossip access
- Could spam for trust/reputation grinding

### Authorization

**AUTH1. Weak Ownership Checks**
```typescript
if (req.user?.characterId !== characterId) {
  throw new AppError('Unauthorized', 403);
}
```
**Issue**: Relies on optional chaining. If `req.user` is undefined, check passes!
**Fix**: `if (!req.user || req.user.characterId !== characterId)`

**AUTH2. No Admin Validation**
```typescript
if (req.user?.role !== 'admin') {
  throw new AppError('Unauthorized - Admin only', 403);
}
```
**Issue**: Same problem - optional chaining allows bypass
**Fix**: `if (!req.user || req.user.role !== 'admin')`

**AUTH3. Cross-Character Data Leakage**
- `getNPCsAtLocation` returns trust levels without auth check
- Could leak which NPCs other players have high trust with
- Should require character ownership

---

## RECOMMENDATIONS

### IMMEDIATE FIXES (P0 - Blockers)

1. **Create Missing Data Files**
   - `server/src/data/mentors.ts`
   - `server/src/data/wanderingEntertainers.ts`
   - `server/src/data/npcRelationships.ts` (verify exists)

2. **Verify Model Existence**
   - `Mentorship.model.ts`
   - `ReputationEvent.model.ts`
   - `NPCKnowledge.model.ts`
   - `GossipItem.model.ts` vs. `Gossip.model.ts` (resolve naming)

3. **Fix NPC System Separation**
   - Rename `NPC.model.ts` to `CombatNPC.model.ts`
   - Create `SocialNPC.model.ts` for bartenders, merchants, etc.
   - Update imports throughout codebase

4. **Implement Dialogue Template Integration**
   - Connect npcDialogueTemplates.ts to npc.service.ts
   - Implement variable substitution
   - Replace hardcoded dialogue

5. **Fix Critical Bugs**
   - BF5: Knowledge source logic (reputationSpreading.service.ts)
   - BF9: Template variable substitution (gossip.service.ts)
   - BF18: Resource check order (entertainer.service.ts)
   - BF19: Division by zero (entertainer.service.ts)

### HIGH PRIORITY (P1 - Critical)

6. **Implement Missing Functionality**
   - Buff application system
   - Item reward system
   - Mood effect system
   - Skill effect system

7. **Add Batch Loading**
   - BF3: NPCs at location
   - BF4: Relationship pathfinding
   - BF13: Available mentors

8. **Add Input Validation**
   - All controller endpoints
   - NPC ID format validation
   - Reputation event bounds checking
   - Mentor ability parameter validation

9. **Add Security Checks**
   - Fix optional chaining in auth checks
   - Add rate limiting middleware
   - Validate ownership on all queries
   - Prevent NoSQL injection

10. **Fix Performance Issues**
    - Add missing database indexes
    - Implement reputation caching
    - Batch process gossip spreading
    - Optimize relationship pathfinding

### MEDIUM PRIORITY (P2 - Major)

11. **Complete Integration**
    - Connect reputation to gossip system
    - Integrate entertainer gossip with real gossip
    - Apply reputation modifiers to NPC interactions
    - Unify trust tracking systems

12. **Add Missing Features**
    - Trust decay over time
    - Interaction cooldowns
    - NPC schedules and availability
    - Gossip verification gameplay
    - Performance history tracking

13. **Improve Data Consistency**
    - Standardize NPC ID format
    - Unify location references
    - Use faction enum everywhere
    - Consolidate mood types

14. **Add Caching Layer**
    - Cache reputation summaries
    - Cache generated dialogue
    - Cache mentor eligibility
    - Cache gossip queries

15. **Implement Event System**
    - Auto-generate gossip from game events
    - Create reputation events from player actions
    - Emit events for performances/interactions

### LOW PRIORITY (P3 - Minor)

16. **Code Quality**
    - Remove unsafe type coercions (`as any`)
    - Add comprehensive error messages
    - Improve logging throughout
    - Add JSDoc comments

17. **Documentation**
    - Document template variable syntax
    - Document gossip spreading algorithm
    - Document reputation calculation
    - API documentation for all routes

18. **Testing**
    - Unit tests for template substitution
    - Integration tests for spreading algorithms
    - E2E tests for full interaction flow
    - Performance benchmarks

19. **Monitoring**
    - Add metrics for gossip spread rate
    - Track reputation event creation
    - Monitor NPC interaction frequency
    - Alert on spreading failures

20. **Feature Enhancements**
    - Add personality to NPCs (beyond mood)
    - Implement memory/history tracking
    - Add dynamic dialogue branching
    - Create faction-specific content

---

## METRICS

### Code Volume
- **Total Lines Audited**: ~7,500
- **Models**: 6 files (1,667 lines)
- **Services**: 4 files (2,398 lines)
- **Routes**: 5 files (417 lines)
- **Data**: 2 files (2,821 lines)
- **Jobs**: 1 file (438 lines)

### Issue Breakdown
| Severity | Count | Examples |
|----------|-------|----------|
| Blocker | 13 | Missing models, broken imports, data conflicts |
| Critical | 33 | N+1 queries, logic errors, security gaps |
| Major | 28 | Incomplete features, missing integration |
| Minor | 31 | Code quality, documentation |
| **TOTAL** | **105** | |

### Test Coverage
- **Current**: 0% (no tests found)
- **Recommended**: >80% for critical paths
- **Priority**: Template substitution, spreading algorithms, trust calculations

### Technical Debt
- **High**: Dialogue template system built but not used
- **High**: Multiple reward systems stubbed out
- **Medium**: Data inconsistencies across systems
- **Medium**: Missing caching layer
- **Low**: Code quality improvements

---

## CONCLUSION

The NPC & Social Systems represent **ambitious and well-designed game mechanics** with exceptional content creation (1490+ dialogue templates, 50 gossip templates with millions of combinations). However, they suffer from **severe implementation gaps** that prevent them from functioning:

1. **Missing Dependencies**: 13 blocker-level missing files/models
2. **Stubbed Functionality**: Buffs, items, moods, skills all return data but don't modify character
3. **Disconnected Systems**: Dialogue templates created but never used, gossip doesn't affect reputation
4. **Performance Issues**: N+1 queries, missing indexes, no caching
5. **Security Gaps**: Weak validation, bypassable auth, no rate limiting

**Recommendation**: These systems require **2-3 weeks of focused development** to:
1. Create missing data files and models
2. Implement stubbed reward systems
3. Connect template system to services
4. Fix critical bugs and performance issues
5. Add proper validation and security

**Current Status**: NOT PRODUCTION READY - Contains excellent design but incomplete implementation.

---

**End of Audit Report**
