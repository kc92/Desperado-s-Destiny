# NPC Interaction System - Quick Reference

## API Endpoints

### Get NPCs at Location
```http
GET /api/npcs/location/:locationId
Authorization: Bearer <token>
X-Character-Id: <characterId>

Response:
{
  "success": true,
  "data": {
    "npcs": [
      {
        "id": "saloon-bartender",
        "name": "Jake Morrison",
        "title": "Bartender",
        "trustLevel": 25,
        "interactionCount": 8,
        "locationId": "65abc123...",
        "locationName": "Red Gulch Saloon",
        ...
      }
    ]
  }
}
```

### Interact with NPC
```http
POST /api/npcs/:npcId/interact
Authorization: Bearer <token>
X-Character-Id: <characterId>

Response:
{
  "success": true,
  "data": {
    "interaction": {
      "npc": { ... },
      "dialogue": ["You're becoming a regular...", "..."],
      "availableQuests": [ ... ],
      "trustLevel": 27,
      "trustIncrease": 2,
      "unlockedSecrets": [ ... ],  // If any
      "newTrustTier": "acquaintance"  // If tier changed
    },
    "character": { ... }  // Updated character data
  }
}
```

### Get NPC Quests
```http
GET /api/npcs/:npcId/quests
Authorization: Bearer <token>
X-Character-Id: <characterId>

Response:
{
  "success": true,
  "data": {
    "quests": [ ... ]
  }
}
```

### Get Trust Level
```http
GET /api/npcs/:npcId/trust
Authorization: Bearer <token>
X-Character-Id: <characterId>

Response:
{
  "success": true,
  "data": {
    "npcId": "saloon-bartender",
    "trustLevel": 45,
    "tier": "friend"
  }
}
```

### Get All Character Trusts
```http
GET /api/npcs/trusts
Authorization: Bearer <token>
X-Character-Id: <characterId>

Response:
{
  "success": true,
  "data": {
    "trusts": [
      {
        "characterId": "...",
        "npcId": "saloon-bartender",
        "trustLevel": 45,
        "interactionCount": 15,
        "tier": "friend",
        ...
      }
    ]
  }
}
```

## Trust Tiers

| Tier | Trust Level | Dialogue Access | Typical Interactions |
|------|-------------|-----------------|----------------------|
| STRANGER | 0-19 | 30% | Basic greetings, generic responses |
| ACQUAINTANCE | 20-39 | 50% | Some personal details, hints |
| FRIEND | 40-59 | 70% | Personal stories, minor secrets |
| TRUSTED | 60-79 | 90% | Deep secrets, special opportunities |
| CONFIDANT | 80-100 | 100% | All dialogue, maximum benefits |

## Trust Gain Formula

```typescript
Base: +2 per interaction
Bonuses:
  + 1 if trust < 20 (new relationship)
  + 2 if NPC faction matches character faction

Maximum: 100 (capped)
Minimum: 0

Example:
- Settler character talks to Settler NPC with 15 trust
- Gain = 2 (base) + 1 (low trust) + 2 (faction) = +5 trust
- New trust = 20 (reached ACQUAINTANCE tier)
```

## Adding NPCs to Locations

### In Location Seed Data
```typescript
import { LocationNPC } from '@desperados/shared';

const location = {
  name: "Red Gulch Saloon",
  type: "saloon",
  // ... other fields
  npcs: [
    {
      id: 'saloon-bartender',
      name: 'Jake Morrison',
      title: 'Bartender',
      description: 'A grizzled bartender...',
      personality: 'Friendly but cautious',
      faction: 'settler',
      dialogue: [
        "What'll it be?",
        "You're new here.",
        // More dialogue = higher trust access
        "I trust you with this secret...",
      ],
      quests: ['npc:saloon-bartender:whiskey-runner'],
      isVendor: false,
      defaultTrust: 0
    }
  ]
};
```

### Creating NPC Quests
```typescript
{
  questId: 'npc:saloon-bartender:whiskey-runner', // Pattern: npc:{npcId}:{questName}
  name: "Jake's Whiskey Run",
  objectives: [
    {
      type: 'visit',
      target: 'npc:saloon-bartender',  // Triggers on interaction
      required: 1
    }
  ]
}
```

### Adding Trust-Gated Secrets
```typescript
const location = {
  secrets: [
    {
      id: 'saloon-basement',
      name: 'Hidden Basement',
      type: 'hidden_room',
      unlockCondition: {
        npcTrust: {
          npcId: 'saloon-bartender',
          level: 50  // Unlocks at FRIEND tier
        }
      },
      content: {
        actions: ['underground-poker'],
        dialogue: ["Welcome to the real saloon..."]
      }
    }
  ]
};
```

## Service Usage

### In Your Code
```typescript
import { NPCService } from '../services/npc.service';

// Get NPCs at location
const npcs = await NPCService.getNPCsAtLocation(locationId, characterId);

// Interact with NPC
const result = await NPCService.interactWithNPC(
  characterId,
  locationId,
  npcId
);

// Manually adjust trust (for quest rewards, etc.)
await NPCService.modifyTrust(characterId, npcId, +10);

// Check trust level
const trustLevel = await NPCService.getTrustLevel(characterId, npcId);
const tier = NPCService.getTrustTier(trustLevel);
```

## Database Queries

### Get Character's Trust with NPC
```javascript
const trust = await NPCTrust.findOne({
  characterId: characterId,
  npcId: npcId
});
```

### Get All High-Trust NPCs for Character
```javascript
const trusts = await NPCTrust.find({
  characterId: characterId,
  trustLevel: { $gte: 50 }  // FRIEND or higher
});
```

### Find Characters Who Trust an NPC
```javascript
const trusters = await NPCTrust.find({
  npcId: npcId,
  trustLevel: { $gte: 80 }  // CONFIDANT tier
});
```

## Common Integration Patterns

### Quest Reward Trust Bonus
```typescript
// In quest completion handler
await NPCService.modifyTrust(characterId, npcId, +10);
```

### Faction Action Trust Impact
```typescript
// When player helps faction
if (npc.faction === actionFaction) {
  await NPCService.modifyTrust(characterId, npc.id, +5);
}
```

### Location Visit Discovery
```typescript
// When entering building with NPCs
const npcs = await NPCService.getNPCsAtLocation(locationId, characterId);
// Display NPCs to player
```

### Checking Secret Access
```typescript
// Before showing secret content
const trustLevel = await NPCService.getTrustLevel(characterId, npcId);
if (trustLevel >= secret.unlockCondition.npcTrust.level) {
  // Show secret
}
```

## Frontend Integration Examples

### Display NPC List
```typescript
const response = await fetch(`/api/npcs/location/${locationId}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Character-Id': characterId
  }
});

const { data } = await response.json();
data.npcs.forEach(npc => {
  console.log(`${npc.name} (Trust: ${npc.trustLevel} - ${getTierName(npc.trustLevel)})`);
});
```

### Interact with NPC
```typescript
const response = await fetch(`/api/npcs/${npcId}/interact`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Character-Id': characterId
  }
});

const { data } = await response.json();
const { interaction } = data;

// Show dialogue
interaction.dialogue.forEach(line => showDialogue(npc.name, line));

// Show trust change
if (interaction.newTrustTier) {
  showNotification(`Trust with ${npc.name} increased to ${interaction.newTrustTier}!`);
}

// Show unlocked secrets
if (interaction.unlockedSecrets) {
  interaction.unlockedSecrets.forEach(secret => {
    showNotification(`Unlocked: ${secret.name}!`);
  });
}

// Show available quests
interaction.availableQuests.forEach(quest => {
  showQuest(quest);
});
```

## Testing Checklist

- [ ] Create test NPC in location seed
- [ ] Verify NPC appears at location
- [ ] Test interaction increases trust
- [ ] Verify dialogue changes with trust tier
- [ ] Test faction bonus for matching factions
- [ ] Test secret unlock at trust threshold
- [ ] Verify quest trigger on interaction
- [ ] Test jailed character cannot interact
- [ ] Test trust cap at 100
- [ ] Test multiple characters have separate trust
- [ ] Verify trust persists across sessions
- [ ] Test quest filtering by NPC ID pattern

## Troubleshooting

### NPC not showing up
- Check location seed has NPC in npcs array
- Verify location is loaded in database
- Check NPC ID is unique

### Trust not increasing
- Verify character is authenticated
- Check NPCTrust document is being created
- Look for trust cap at 100

### Quests not appearing
- Verify quest ID matches pattern: `npc:{npcId}:questName`
- Check character meets quest level requirements
- Ensure quest is active in database

### Secrets not unlocking
- Verify trust level crosses threshold
- Check secret unlockCondition has correct npcId
- Ensure secret hasn't already been unlocked

## Performance Considerations

- NPCs are embedded in Location documents (no separate collection)
- Trust documents are indexed by characterId+npcId
- Location queries fetch NPCs automatically
- Consider caching frequently accessed NPCs
- Trust updates are atomic operations

## Security Notes

- All endpoints require authentication
- Character ownership verified by middleware
- Trust levels cannot be directly manipulated by client
- Secret unlocks are server-validated
- Jailed characters blocked from interaction
