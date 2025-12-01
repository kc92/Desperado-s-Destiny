# NPC Cross-References System - Implementation Report

**Phase 3, Wave 3.1 - NPC Cross-references System**
**Status**: Complete
**Date**: 2025-11-25

---

## Executive Summary

The NPC Cross-references System has been fully implemented, creating a rich, interconnected world where NPCs reference each other, share gossip, and have complex relationship webs. This system makes the game world feel lived-in and cohesive, with NPCs who have histories, opinions, and connections to each other.

---

## System Architecture

### 1. Core Components

#### **Type Definitions** (`shared/src/types/relationship.types.ts`)
- **RelationshipType Enum**: 19 relationship types including family, friends, enemies, lovers, business partners, criminal associates
- **FamilyRelation Enum**: 12 specific family relations (parent, sibling, cousin, etc.)
- **GossipCategory Enum**: 10 categories (personal, criminal, romance, business, etc.)
- **GossipTruthfulness Enum**: 5 levels from complete lies to completely true
- **NPCRelationship Interface**: Complete relationship data structure
- **GossipItem Interface**: Gossip with spreading mechanics and conditions
- **NPCOpinion Interface**: NPC opinions about other NPCs
- **DialogueCrossReference Interface**: Templates for dynamic NPC mentions

#### **Database Models**
1. **NPCRelationship Model** (`server/src/models/NPCRelationship.model.ts`)
   - Stores relationships between NPCs
   - 10+ static methods for querying relationships
   - BFS pathfinding to find connections between NPCs
   - Support for public/secret relationships
   - Reveal conditions for secret relationships

2. **Gossip Model** (`server/src/models/Gossip.model.ts`)
   - Stores gossip items that spread through the network
   - Tracks who knows what gossip
   - Automatic spreading based on spreadFactor
   - Expiration and staleness tracking
   - Trust level and faction requirements

#### **Services**
1. **GossipService** (`server/src/services/gossip.service.ts`)
   - `getGossip()`: Get gossip an NPC can share with player
   - `createGossip()`: Generate gossip from events
   - `spreadGossip()`: Propagate through NPC network
   - `getNPCOpinion()`: Get one NPC's opinion of another
   - `getRelationships()`: Get all relationships for NPC
   - `findConnection()`: Find path between two NPCs
   - `onGameEvent()`: Create event-triggered gossip

2. **Enhanced NPC Service** (`server/src/services/npc.service.ts`)
   - Integrated cross-references into NPC interactions
   - `getCrossReferences()`: Generate dynamic NPC mentions
   - Added gossip and crossReferences to interaction results
   - Smart template selection based on sentiment

#### **API Routes** (`server/src/routes/gossip.routes.ts`)
```
GET  /api/gossip/npc/:npcId              - Get gossip from NPC
GET  /api/gossip/about/:npcId            - Get gossip about NPC
GET  /api/gossip/opinion/:npcId1/:npcId2 - Get NPC opinion
GET  /api/gossip/relationships/:npcId    - Get NPC relationships
GET  /api/gossip/connection/:npcId1/:npcId2 - Find connection path
GET  /api/gossip/category/:category      - Get gossip by category
GET  /api/gossip/active                  - Get all active gossip
POST /api/gossip/:gossipId/spread        - Spread gossip (admin)
POST /api/gossip/create                  - Create gossip (admin)
POST /api/gossip/cleanup                 - Cleanup old gossip (cron)
```

---

## Relationship Web Data

### Statistics
- **Total Relationships**: 35+ defined relationships
- **Family Groups**: 3 families (Morrison, Martinez, Chen)
- **Relationship Clusters**: 7 clusters
- **Secret Relationships**: 6 hidden relationships to discover

### Family Networks

#### **1. Morrison Family** (Settler - Scattered)
- **Jake Morrison** (Bartender, Red Gulch)
- **Thomas Morrison** (Blacksmith, Dusty Flats)
- **Dr. Sarah Morrison** (Doctor, Red Gulch)
- **Old Man Morrison** (Elder, Spirit Springs - SECRET)

**Dynamics**:
- Jake left the family forge to run a saloon (caused tension)
- Sarah is the responsible sibling
- Father disappeared and lives with the Nahi (secret)
- Siblings reconciled but tension remains

#### **2. Martinez Family** (Frontera - Crime Family)
- **El Carnicero** (Gang Boss)
- **Rosa Martinez** (Cantina Owner, sister)
- **Miguel Martinez** (Smuggler, nephew)
- **Carlos Martinez** (Deceased brother - drives revenge plot)

**Dynamics**:
- Rosa runs cantina as front for criminal operations
- Miguel wants to prove himself to his uncle
- Carlos's death by Sheriff Clayton created blood feud
- Fiercely loyal, family above all

#### **3. Chen Family** (Settler - Immigrant Business)
- **Martha Chen** (General Store Owner)
- **Wei Chen** (Laundry Owner, spouse)
- **Li Chen** (Telegraph Operator, daughter)

**Dynamics**:
- Built successful businesses through hard work
- Parents extremely proud of Li
- Wei is protective father
- Strong family bonds

### Cross-Faction Relationships

#### **Sheriff Clayton <-> El Carnicero** (ENEMIES)
- Blood feud from brother's death 10 years ago
- Shared secret: The shootout was staged
- Ongoing conflict drives major storyline

#### **Banker <-> Frontera Smuggler** (SECRET)
- Money laundering operation
- Banker hates it but profits too much
- Can be discovered through "uncover-corruption" quest

#### **Priest <-> Nahi Shaman** (RIVALS)
- Different faiths, mutual respect
- Discuss theology and philosophy
- Bridge between cultures

### Romantic Relationships (Some Secret)

#### **Saloon Girl Ruby <-> Deputy** (SECRET LOVERS)
- Keep relationship hidden due to professions
- Requires 75+ trust to discover
- Romeo & Juliet style forbidden love

#### **Blacksmith <-> Martha Chen** (FORMER LOVERS)
- Courted before she married Wei
- Ended badly, adds to business rivalry
- Secret past adds depth to their competition

### Criminal Networks

#### **Shadow Syndicate** (SECRET)
- **Members**: Banker, Mayor, Land Baron, Smuggler
- **Nature**: Corruption conspiracy
- **Activities**: Embezzlement, land grabs, bribery
- **Discovery**: Requires quests and secret ledger

---

## Dialogue Templates

### Cross-Reference Categories

#### **1. Mentions** (Neutral)
```
"My {relationship} {subject} works at {location}."
"You should talk to {subject}. They can help with that."
"I know {subject}. We go way back."
```

#### **2. Opinions** (Based on Sentiment)
```
"You ask me about {subject}? {detail}"
"{subject} is {detail}"
"Let me tell you about {subject}. {detail}"
```

#### **3. Warnings** (Negative Sentiment)
```
"Watch out for {subject}. They {action}."
"Be careful around {subject}. {detail}"
"Don't trust {subject}. {detail}"
```

#### **4. Recommendations** (Positive Sentiment)
```
"You should meet {subject}. {detail}"
"{subject} is good people. {detail}"
"Trust me, see {subject}. {detail}"
```

#### **5. Gossip Sharing** (Trust Required)
```
"Did you hear what happened with {subject}? {detail}"
"Between us, {subject} {detail}"
"You didn't hear it from me, but {subject} {detail}"
```

### Gossip Templates by Category

**10 categories with 8 templates each**:
- Personal, Criminal, Romance, Business, Conflict
- Rumor, News, Political, Supernatural, Secret

**Example - Criminal Category**:
```
"Keep your distance from {subject}. They {action}."
"I heard {subject} {action}. Sheriff's been asking questions."
"They say {subject} {action}. Wouldn't surprise me none."
```

### Event-Triggered Gossip

**Supported Events**:
- `crime_committed`: "Did you hear? [Player] committed a crime!"
- `player_arrested`: "They threw [Player] in jail!"
- `gang_joined`: "[Player] joined the [Gang]!"
- `combat_won`: "[Player] beat [Enemy] in a fight!"
- `high_reputation`: "[Player] made quite a name for themselves!"

---

## How It Works

### 1. NPC Interaction Flow

```
Player talks to NPC
    ↓
Get NPC relationships (public, trust-gated)
    ↓
Generate 1-3 cross-references based on:
    - Relationship type
    - Sentiment (positive/negative/neutral)
    - Trust level
    ↓
Get gossip NPC knows (trust-gated)
    ↓
Return dialogue with:
    - Base dialogue (trust tier)
    - Cross-references
    - Gossip items
    - Available quests
```

### 2. Gossip Spreading

```
Event occurs (crime, arrest, etc.)
    ↓
Create gossip item
    ↓
Origin NPC knows it
    ↓
Spread to connected NPCs based on:
    - spreadFactor (1-10)
    - Relationship strength
    - Random chance
    ↓
Gossip propagates through network
    ↓
Players can hear it from NPCs who know it
```

### 3. Trust-Gated Discovery

```
Low Trust (0-19): Basic mentions, public info
    ↓
Medium Trust (20-59): Opinions, some gossip
    ↓
High Trust (60-79): Secrets, detailed history
    ↓
Confidant (80-100): All secrets, conspiracies
```

### 4. Relationship Discovery

```
NPCs mention each other organically
    ↓
Players learn about connections
    ↓
Can discover secret relationships:
    - Through quests
    - High trust levels
    - Finding items
    - Witnessing events
    ↓
Unlocks new dialogue and quests
```

---

## Implementation Features

### ✅ Complete Feature List

1. **19 Relationship Types** - From family to criminal associates
2. **35+ NPC Relationships** - Rich web of connections
3. **3 Family Groups** - Multi-generational families
4. **7 Relationship Clusters** - Social networks and factions
5. **6 Secret Relationships** - Hidden connections to discover
6. **10 Gossip Categories** - Diverse types of information
7. **80+ Dialogue Templates** - Dynamic, varied dialogue
8. **Event-Triggered Gossip** - World reacts to player actions
9. **Trust-Gated Content** - Deeper info at higher trust
10. **Gossip Spreading Algorithm** - Realistic information flow
11. **NPC Opinion System** - NPCs have views on each other
12. **Connection Pathfinding** - Find degrees of separation
13. **Public/Secret Relationships** - Discoverable secrets
14. **Cross-Faction Connections** - Bridges between groups
15. **Truthfulness System** - Gossip can be lies or truth

### Database Indexes

**NPCRelationship Model**:
- `{ npcId: 1, relatedNpcId: 1 }` - Unique constraint
- `{ relationshipType: 1, isPublic: 1 }` - Type queries
- `{ npcId: 1, canGossipAbout: 1 }` - Gossip filtering
- `{ isSecret: 1 }` - Secret relationship queries

**Gossip Model**:
- `{ subject: 1, category: 1 }` - Subject lookups
- `{ originNpc: 1, startDate: -1 }` - Origin tracking
- `{ knownBy: 1, isStale: 1 }` - Knowledge queries
- `{ expiresAt: 1, isStale: 1 }` - Cleanup queries
- `{ playerInvolved: 1, startDate: -1 }` - Player gossip

---

## Sample Interaction Examples

### Example 1: Talking to Jake (Bartender)

**Low Trust (Stranger)**:
```
Jake: "What'll it be, stranger?"
```

**Medium Trust (Friend)**:
```
Jake: "Between you and me..."
+ Cross-reference: "My sister Sarah runs the doctor's office. Best healer in town."
+ Gossip: "Did you hear about the sheriff? He's been spending time at odd hours..."
```

**High Trust (Confidant)**:
```
Jake: "You're family now. The basement poker game runs every night."
+ Cross-reference: "My brother Thomas, he's at Dusty Flats. We had a falling out, but blood is blood."
+ Secret Gossip: "The sheriff pays me for information. Don't tell anyone."
+ Family Secret: "My father... he didn't die. He's living with the Nahi at Spirit Springs."
```

### Example 2: Event-Triggered Gossip

**Player commits crime**:
```
Origin: Town Crier
Gossip: "Did you hear? [Player] robbed the bank! Bold as brass!"
Spread: 80% to connected NPCs
Result: Multiple NPCs mention it next interaction
```

**Player builds high reputation**:
```
Origin: Town Crier
Gossip: "[Player] made quite a name for themselves. They're good people."
Spread: 60% to connected NPCs
Effect: +2 reputation with faction
```

---

## API Usage Examples

### Get Gossip from NPC
```javascript
GET /api/gossip/npc/saloon-bartender
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "gossip": [
      {
        "id": "...",
        "subject": "red-gulch-sheriff",
        "category": "criminal",
        "content": "The sheriff's been taking bribes...",
        "truthfulness": 75,
        "trustRequired": 60
      }
    ],
    "newGossipCount": 2
  }
}
```

### Find Connection Between NPCs
```javascript
GET /api/gossip/connection/saloon-bartender/frontera-boss

Response:
{
  "success": true,
  "data": {
    "path": [
      "saloon-bartender",
      "red-gulch-sheriff",
      "frontera-boss"
    ],
    "degrees": 2,
    "connected": true
  }
}
```

### Get NPC Opinion
```javascript
GET /api/gossip/opinion/saloon-bartender/red-gulch-doctor

Response:
{
  "success": true,
  "data": {
    "opinion": {
      "npcId": "saloon-bartender",
      "subjectNpcId": "red-gulch-doctor",
      "sentiment": 8,
      "respect": 9,
      "trust": 10,
      "fear": 0,
      "shortOpinion": "Family is everything. She means the world to me.",
      "detailedOpinion": "Sarah's my sister. She's the best doctor..."
    }
  }
}
```

---

## Seeding the Database

### Run the Seed Script
```bash
cd server
npm run seed:relationships
```

### What Gets Seeded
1. **35+ NPC relationships**
2. **3 family networks** with 5+ members each
3. **2 rivalry networks**
4. **1 criminal conspiracy** (secret)
5. **Cross-faction connections**
6. **Romantic relationships** (some secret)

### Expected Output
```
=== NPC Relationship Seed Script ===

Total relationships defined: 35
Total clusters defined: 7

Relationships by type:
  Family: 12
  Friends: 5
  Enemies: 4
  Criminal Associates: 4

Visibility:
  Public: 29
  Secret: 6

Family groups:
  - Morrison Family: 4 members
  - Martinez Family: 4 members
  - Chen Family: 3 members

Relationships seeded: 35 successful, 0 errors
```

---

## Future Enhancements

### Planned Features

1. **Dynamic Relationship Changes**
   - Relationships evolve based on player actions
   - Events can improve/worsen NPC relationships
   - Marriages, births, deaths update family trees

2. **Gossip Verification System**
   - Players can verify gossip truthfulness
   - Uncover lies and spread truth
   - Reputation for spreading accurate info

3. **NPC Conversations**
   - NPCs talk to each other
   - Players can overhear conversations
   - Gossip spreads naturally through NPC chat

4. **Faction Relationship Networks**
   - Inter-faction diplomacy
   - Family members on opposing sides
   - Faction conflicts affect relationships

5. **Player Reputation in Gossip**
   - NPCs gossip about player specifically
   - Reputation affects what they say
   - Fame/infamy spreads through network

6. **Quest Integration**
   - Quests that explore relationships
   - Family drama questlines
   - Uncover conspiracy quests
   - Reunite separated families

7. **Visual Relationship Map**
   - Frontend graph visualization
   - See degrees of separation
   - Discover connection paths
   - Highlight secret relationships when discovered

---

## Technical Notes

### Performance Considerations

1. **Indexed Queries**: All relationship and gossip queries use indexes
2. **BFS Pathfinding**: Limited to 6 degrees of separation to prevent long searches
3. **Gossip Cleanup**: Cron job marks stale gossip to keep DB lean
4. **Limited Results**: Cross-references limited to 3 per interaction

### Security

1. **Trust-Gated Content**: Sensitive info requires trust levels
2. **Secret Relationships**: Hidden until discovery conditions met
3. **Faction Filtering**: Gossip can require faction membership

### Extensibility

1. **Template System**: Easy to add new dialogue templates
2. **Event Hooks**: Simple to trigger gossip from any game event
3. **Relationship Types**: Enum makes adding types straightforward
4. **Modular Services**: Clean separation of concerns

---

## Files Created/Modified

### Created Files (11 total)

**Shared Types**:
1. `shared/src/types/relationship.types.ts` - All relationship and gossip types

**Database Models**:
2. `server/src/models/NPCRelationship.model.ts` - Relationship storage
3. `server/src/models/Gossip.model.ts` - Gossip storage

**Services**:
4. `server/src/services/gossip.service.ts` - Gossip business logic

**Data**:
5. `server/src/data/npcRelationships.ts` - Relationship web data
6. `server/src/data/gossipTemplates.ts` - Dialogue templates

**API**:
7. `server/src/controllers/gossip.controller.ts` - HTTP handlers
8. `server/src/routes/gossip.routes.ts` - API routes

**Scripts**:
9. `server/src/scripts/seedRelationships.ts` - Database seeding

**Documentation**:
10. `NPC_CROSS_REFERENCES_IMPLEMENTATION.md` - This document

### Modified Files (3 total)

1. `server/src/services/npc.service.ts` - Added cross-reference generation
2. `server/src/routes/index.ts` - Added gossip routes
3. `shared/src/types/index.ts` - Export relationship types

---

## Testing Recommendations

### Unit Tests
1. Test relationship pathfinding algorithm
2. Test gossip spreading mechanics
3. Test cross-reference generation
4. Test trust-gating logic

### Integration Tests
1. Test NPC interaction with cross-references
2. Test event-triggered gossip creation
3. Test gossip spread through network
4. Test secret relationship discovery

### E2E Tests
1. Talk to NPCs at different trust levels
2. Trigger events and verify gossip spreads
3. Discover secret relationships
4. Build relationship networks

---

## Conclusion

The NPC Cross-references System is fully implemented and ready for integration. It provides:

- **Rich World Building**: 35+ interconnected relationships
- **Dynamic Dialogue**: NPCs mention each other naturally
- **Discoverable Secrets**: Hidden relationships and conspiracies
- **Living World**: Gossip spreads, events generate rumors
- **Scalable Architecture**: Easy to add more NPCs and relationships

This system transforms NPCs from isolated characters into a vibrant, interconnected community with histories, opinions, and social networks. Players will discover the web of relationships organically through dialogue, creating a deeper and more immersive experience.

---

**Implementation Status**: ✅ COMPLETE
**Ready for**: Testing, Frontend Integration, Content Expansion
