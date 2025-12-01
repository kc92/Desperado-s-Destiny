# NPC Interaction System - Implementation Complete

## Overview
A comprehensive NPC interaction system that handles player-NPC relationships, trust building, quest discovery, and secret unlocking. NPCs are location-based and stored within Location documents.

## Files Created

### 1. Model: NPCTrust.model.ts
**Location**: `server/src/models/NPCTrust.model.ts`

Tracks character-NPC trust relationships:
- `characterId`: Reference to character
- `npcId`: String ID of NPC (from location data)
- `trustLevel`: 0-100 trust score
- `interactionCount`: Number of interactions
- `lastInteraction`: Timestamp of last interaction
- `unlockedSecrets`: Array of secret IDs unlocked through trust

**Static Methods**:
- `getTrustLevel(characterId, npcId)`: Get current trust level
- `incrementTrust(characterId, npcId, amount)`: Increase trust
- `getCharacterTrusts(characterId)`: Get all trusts for character
- `getUnlockedSecrets(characterId, npcId)`: Get unlocked secrets
- `addUnlockedSecret(characterId, npcId, secretId)`: Record unlocked secret

### 2. Service: npc.service.ts
**Location**: `server/src/services/npc.service.ts`

**Core Methods**:

#### getNPCsAtLocation(locationId, characterId?)
- Returns all NPCs at location and its buildings
- Includes trust level for authenticated characters
- Returns `NPCWithTrust[]` with location info

#### getNPCById(npcId)
- Finds specific NPC by ID across all locations
- Returns `LocationNPC | null`

#### interactWithNPC(characterId, locationId, npcId)
- Main interaction handler
- Calculates trust increase (base +2, bonuses for low trust/faction match)
- Triggers quest discovery via `QuestService.onNPCInteraction()`
- Returns dialogue based on trust tier
- Checks and unlocks secrets if trust thresholds are met
- Returns `NPCInteractionResult`

#### getQuestsFromNPC(npcId, characterId)
- Returns available quests from this NPC
- Filters by quest ID pattern: `npc:{npcId}:questName`

#### modifyTrust(characterId, npcId, amount)
- Directly modify trust level (for quest/action rewards)

#### getTrustLevel(characterId, npcId)
- Get current trust level (0-100)

**Trust System**:

Trust Tiers:
- **STRANGER** (0-19): Basic dialogue, no secrets
- **ACQUAINTANCE** (20-39): More dialogue options
- **FRIEND** (40-59): Personal dialogue, some secrets
- **TRUSTED** (60-79): Deep dialogue, most secrets
- **CONFIDANT** (80-100): All dialogue, all secrets

Trust Gain:
- Base: +2 per interaction
- Low trust bonus: +1 if trust < 20
- Faction match bonus: +2 if NPC and character share faction
- Capped at 100

**Secret Unlocking**:
- Checks location secrets with `unlockCondition.npcTrust`
- Unlocks when trust crosses threshold
- Records unlocked secrets to prevent duplicates
- Returns newly unlocked secrets in interaction result

### 3. Controller: npc.controller.ts
**Location**: `server/src/controllers/npc.controller.ts`

**Endpoints**:

#### GET /api/npcs/location/:locationId
- Get all NPCs at a location
- Requires auth + character
- Returns NPCs with trust levels

#### GET /api/npcs/:npcId
- Get specific NPC details with trust info
- Requires auth + character
- Returns `NPCWithTrust`

#### POST /api/npcs/:npcId/interact
- Interact with NPC
- Requires auth + character
- Blocks if character is jailed
- Triggers trust gain, quest discovery, secret unlocking
- Returns interaction result + updated character

#### GET /api/npcs/:npcId/quests
- Get available quests from NPC
- Requires auth + character
- Returns filtered quest list

#### GET /api/npcs/:npcId/trust
- Get trust level with specific NPC
- Requires auth + character
- Returns trust level and tier

#### GET /api/npcs/trusts
- Get all character's NPC trusts
- Requires auth + character
- Returns array of trusts with tiers

### 4. Routes: npc.routes.ts
**Location**: `server/src/routes/npc.routes.ts`

All routes require `requireAuth` and `requireCharacter` middleware.

Registered in main router as `/api/npcs`

## Data Flow

### NPC Interaction Flow
```
1. Client: POST /api/npcs/:npcId/interact
2. Controller: Validate character, check not jailed
3. Service:
   - Get NPC from location
   - Calculate trust increase
   - Update trust in database
   - Trigger QuestService.onNPCInteraction()
   - Get available quests
   - Select dialogue based on trust tier
   - Check for secret unlocks
4. Return: Interaction result with dialogue, quests, trust, secrets
```

### Quest Discovery Flow
```
1. NPC interaction triggers QuestService.onNPCInteraction(characterId, npcId)
2. Quest service updates quest objectives with type='visit', target='npc:{npcId}'
3. Available quests filtered by NPC ID pattern
4. Quests returned to client if character meets requirements
```

### Secret Unlock Flow
```
1. Check location.secrets[] for npcTrust unlock conditions
2. For each secret with npcTrust condition matching this NPC:
   - Check if trust level just crossed threshold
   - If yes, add to unlockedSecrets result
   - Record in NPCTrust.unlockedSecrets to prevent re-unlock
3. Return unlocked secrets with interaction result
```

## Integration Points

### Quest System
- `QuestService.onNPCInteraction(characterId, npcId)` called on each interaction
- Quests can be tied to specific NPCs via ID pattern
- Quest completion can unlock NPC dialogue/trust

### Location System
- NPCs stored in `Location.npcs[]` array
- Buildings can have their own NPCs
- Secrets in locations can require NPC trust

### Faction System
- Faction match gives +2 trust bonus
- NPCs have faction affiliation
- Faction reputation can affect available dialogue

## Types & Interfaces

### NPCWithTrust
```typescript
interface NPCWithTrust extends LocationNPC {
  trustLevel: number;
  interactionCount: number;
  locationId: string;
  locationName: string;
}
```

### NPCInteractionResult
```typescript
interface NPCInteractionResult {
  npc: NPCWithTrust;
  dialogue: string[];
  availableQuests: IQuestDefinition[];
  trustLevel: number;
  trustIncrease: number;
  unlockedSecrets?: SecretContent[];
  newTrustTier?: string; // Only if tier changed
}
```

### Trust Tier Enum
```typescript
enum TrustTier {
  STRANGER = 'stranger',       // 0-19
  ACQUAINTANCE = 'acquaintance', // 20-39
  FRIEND = 'friend',            // 40-59
  TRUSTED = 'trusted',          // 60-79
  CONFIDANT = 'confidant'       // 80-100
}
```

## Database Schema

### NPCTrust Collection
```javascript
{
  characterId: ObjectId,        // ref: Character
  npcId: String,                // NPC ID from location
  trustLevel: Number,           // 0-100
  interactionCount: Number,     // Total interactions
  lastInteraction: Date,        // Last interaction time
  unlockedSecrets: [String],    // Secret IDs unlocked
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ characterId: 1, npcId: 1 }  // unique
{ trustLevel: -1 }
```

## Example Usage

### Client Interaction
```typescript
// Interact with NPC
POST /api/npcs/saloon-bartender/interact

Response:
{
  success: true,
  data: {
    interaction: {
      npc: {
        id: "saloon-bartender",
        name: "Jake the Bartender",
        trustLevel: 42,
        interactionCount: 15,
        locationId: "65abc...",
        locationName: "Red Gulch Saloon"
      },
      dialogue: [
        "You're becoming a regular around here.",
        "I heard something interesting last night...",
        "Between you and me, there's more to this saloon than meets the eye."
      ],
      availableQuests: [
        { questId: "npc:saloon-bartender:whiskey-runner", ... }
      ],
      trustLevel: 42,
      trustIncrease: 2,
      newTrustTier: "friend"
    }
  }
}
```

### Trust-Gated Content
```typescript
// Location secret with NPC trust requirement
{
  id: "saloon-basement",
  name: "Hidden Basement",
  type: "hidden_room",
  unlockCondition: {
    npcTrust: {
      npcId: "saloon-bartender",
      level: 50
    }
  },
  content: {
    actions: ["underground-poker"],
    dialogue: ["Jake: 'Welcome to the real saloon.'"]
  }
}
```

## Testing Checklist

- [ ] Create NPC in location seed data
- [ ] Interact with NPC (trust increases)
- [ ] Verify quest trigger on interaction
- [ ] Check dialogue changes with trust tiers
- [ ] Verify secret unlock at trust threshold
- [ ] Test faction bonus for matching factions
- [ ] Test trust cap at 100
- [ ] Verify jailed characters cannot interact
- [ ] Test getting all NPCs at location
- [ ] Test getting NPCs from buildings
- [ ] Verify trust persists across sessions
- [ ] Test multiple characters with same NPC (separate trust)

## Future Enhancements

1. **Time-Based Trust Decay**: Trust slowly decreases if not maintained
2. **Reputation Requirements**: Some NPCs require minimum reputation
3. **Gift System**: Give items to NPCs for trust boost
4. **NPC Schedules**: NPCs move between buildings based on time
5. **Trust-Based Prices**: Shop prices vary with NPC trust
6. **Betrayal System**: Negative trust for opposing faction actions
7. **NPC Relationships**: NPCs with positive/negative relationships
8. **Dynamic Dialogue**: Dialogue that references recent events
9. **Quest Chains**: Multi-step quests unlocked by trust progression
10. **Secret Information**: High trust reveals hidden game mechanics

## Notes

- NPCs are embedded in Location documents, not separate collections
- Trust is per-character, not per-user (each character has own relationships)
- Quest IDs should follow pattern `npc:{npcId}:questName` for auto-filtering
- Secrets can have multiple unlock conditions, NPC trust is just one type
- Trust gain formula can be adjusted in `interactWithNPC()` method
- Dialogue percentage available increases with trust tier
- All endpoints require authentication and active character selection

## API Summary

```
GET    /api/npcs/trusts                      - Get all character trusts
GET    /api/npcs/location/:locationId        - Get NPCs at location
GET    /api/npcs/:npcId                      - Get NPC details
POST   /api/npcs/:npcId/interact             - Interact with NPC
GET    /api/npcs/:npcId/quests               - Get NPC quests
GET    /api/npcs/:npcId/trust                - Get trust level
```

All routes protected by: `requireAuth`, `requireCharacter`
