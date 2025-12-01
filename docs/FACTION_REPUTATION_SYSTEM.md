# Faction Reputation System - Implementation Complete

## Overview

The Faction Reputation System is now fully implemented and integrated throughout the game. Players can build or destroy their standing with three major factions: Settler Alliance, Nahi Coalition, and Frontera.

## Factions

### 1. Settler Alliance
- **Identity**: Law-abiding settlers, railroad builders, bankers
- **Values**: Order, commerce, civilization
- **Bonuses**: Better shop prices, bank access, railroad discounts
- **Penalties**: Crimes significantly hurt reputation

### 2. Nahi Coalition
- **Identity**: Indigenous peoples, spiritual leaders, traditionalists
- **Values**: Honor, spirituality, land preservation
- **Bonuses**: Spirit guides, sacred site access, special medicines
- **Penalties**: Neutral stance - less affected by player actions

### 3. Frontera
- **Identity**: Outlaws, smugglers, frontier rebels
- **Values**: Freedom, defiance, profit
- **Bonuses**: Black market access, criminal networks, hideouts
- **Penalties**: Law-abiding actions hurt reputation

## Standing Levels

| Standing | Rep Range | Price Modifier | Effects |
|----------|-----------|----------------|---------|
| **Hostile** | -100 to -50 | +30% markup | Denied faction services, attacked on sight |
| **Unfriendly** | -50 to 0 | +15% markup | Limited services, cold reception |
| **Neutral** | 0 to 25 | Normal | Standard access |
| **Friendly** | 25 to 75 | -10% discount | Special quests, better dialogue |
| **Honored** | 75 to 100 | -20% discount | Exclusive items, faction champion |

## Files Created

### Core System
- **`server/src/services/reputation.service.ts`** - Main service handling all reputation logic
- **`server/src/models/ReputationHistory.model.ts`** - Audit trail of reputation changes
- **`server/src/controllers/reputation.controller.ts`** - API endpoints
- **`server/src/routes/reputation.routes.ts`** - Route definitions

### Integration Points
- **`server/src/services/quest.service.ts`** - Quest completion grants reputation
- **`server/src/services/crime.service.ts`** - Crimes affect reputation
- **`server/src/services/shop.service.ts`** - Prices modified by faction standing

### Data & Documentation
- **`server/src/scripts/seedReputationData.ts`** - Example quests with reputation rewards
- **`FACTION_REPUTATION_SYSTEM.md`** - This documentation

## API Endpoints

### GET `/api/reputation`
Get all faction standings for current character.

**Response:**
```json
{
  "success": true,
  "data": {
    "settlerAlliance": {
      "rep": 45,
      "standing": "friendly",
      "benefits": ["10% price discount", "Access to special quests", "Railroad fast travel"],
      "priceModifier": 0.9
    },
    "nahiCoalition": {
      "rep": 10,
      "standing": "neutral",
      "benefits": ["Normal prices", "Standard access"],
      "priceModifier": 1.0
    },
    "frontera": {
      "rep": -25,
      "standing": "unfriendly",
      "benefits": ["15% price increase", "Limited access to services"],
      "priceModifier": 1.15
    }
  }
}
```

### GET `/api/reputation/:faction`
Get standing with specific faction.

**Parameters:**
- `faction`: settlerAlliance | nahiCoalition | frontera

**Response:**
```json
{
  "success": true,
  "data": {
    "faction": "settlerAlliance",
    "rep": 45,
    "standing": "friendly",
    "benefits": ["10% price discount", "Access to special quests"],
    "priceModifier": 0.9,
    "nextStanding": "honored",
    "repNeededForNext": 30
  }
}
```

### GET `/api/reputation/history`
Get reputation change history.

**Query Parameters:**
- `faction` (optional): Filter by specific faction
- `limit` (optional): Number of records (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "characterId": "...",
        "faction": "settlerAlliance",
        "change": 10,
        "reason": "Quest: Help the Sheriff",
        "previousValue": 35,
        "newValue": 45,
        "timestamp": "2025-01-15T10:30:00Z"
      }
    ],
    "count": 1
  }
}
```

### GET `/api/reputation/benefits`
Get guide of all faction benefits at different standings.

## Reputation Changes

### Quest Completion
When quests include reputation rewards:
```typescript
{
  type: 'reputation',
  faction: 'settlerAlliance',
  amount: 15
}
```

### Crime System
| Action | Settler Alliance | Frontera |
|--------|-----------------|----------|
| Successful crime (unwitnessed) | -5 | +2 |
| Successful crime (witnessed) | -10 | 0 |
| Failed and caught | -15 | 0 |

### NPC Interactions (Future)
- Helping faction NPCs: +5 to +10
- Betraying faction NPCs: -25 to -50
- Killing faction NPCs: -15 to -30

### Shop Purchases
Prices automatically modified based on faction standing:
```typescript
const finalPrice = basePrice * priceModifier;
// Hostile: 1.3x
// Unfriendly: 1.15x
// Neutral: 1.0x
// Friendly: 0.9x
// Honored: 0.8x
```

## ReputationService API

### Core Methods

#### `modifyReputation(characterId, faction, amount, reason)`
Modify faction reputation and create audit record.

**Parameters:**
- `characterId`: Character ID
- `faction`: 'settlerAlliance' | 'nahiCoalition' | 'frontera'
- `amount`: Reputation change (-100 to +100)
- `reason`: Description for audit trail

**Returns:**
```typescript
{
  newRep: number,
  standing: Standing,
  changed: boolean,
  standingChanged?: boolean,
  previousStanding?: Standing
}
```

#### `getStanding(reputation: number): Standing`
Convert reputation number to standing level.

#### `getAllStandings(characterId)`
Get all faction standings for a character.

#### `meetsRequirement(characterId, faction, minStanding)`
Check if character meets faction requirement.

#### `getPriceModifier(standing: Standing): number`
Get price multiplier for standing level.

#### `getReputationChange(actionType, targetFaction, magnitude)`
Calculate reputation change for action.

**Action Types:**
- `'quest_complete'`: +10 (minor) or +20 (major)
- `'help_faction'`: +5 (minor) or +10 (major)
- `'crime'`: -5 (minor) or -10 (major)
- `'kill_npc'`: -15 (minor) or -30 (major)
- `'betray_faction'`: -25 (minor) or -50 (major)

#### `applyRivalPenalties(characterId, helpedFaction, amount, reason)`
Apply penalties to rival factions (30% of gain).

**Rival Relationships:**
- Settler Alliance ↔ Frontera (mutual rivals)
- Nahi Coalition: Neutral (no rivals)

## Integration Examples

### Quest with Reputation Reward
```typescript
// In quest definition
{
  rewards: [
    {
      type: 'gold',
      amount: 100
    },
    {
      type: 'reputation',
      faction: 'settlerAlliance',
      amount: 15
    }
  ]
}
```

### Crime Affecting Reputation
```typescript
// In crime.service.ts - automatic integration
if (actionSuccess && !wasWitnessed) {
  // Hurts Settler reputation
  await ReputationService.modifyReputation(
    characterId,
    'settlerAlliance',
    -5,
    `Crime: ${action.name}`
  );

  // Boosts Frontera reputation
  await ReputationService.modifyReputation(
    characterId,
    'frontera',
    2,
    `Crime: ${action.name}`
  );
}
```

### Shop with Faction Pricing
```typescript
// When purchasing from faction shop
await ShopService.buyItem(
  characterId,
  itemId,
  quantity,
  'settlerAlliance' // shopFaction
);

// Returns: { character, item, totalCost, basePrice, priceModifier }
// totalCost automatically adjusted based on standing
```

### Location Access Requirements
```typescript
// In Location.requirements
{
  faction: 'settlerAlliance',
  factionStanding: 'friendly' // Requires 25+ reputation
}

// Checked by accessRestriction.middleware.ts
```

## Database Schema

### ReputationHistory Collection
```typescript
{
  characterId: ObjectId,
  faction: 'settlerAlliance' | 'nahiCoalition' | 'frontera',
  change: number,
  reason: string,
  previousValue: number, // -100 to 100
  newValue: number,      // -100 to 100
  timestamp: Date
}
```

**Indexes:**
- `{ characterId: 1, timestamp: -1 }`
- `{ characterId: 1, faction: 1, timestamp: -1 }`

### Character.factionReputation
```typescript
factionReputation: {
  settlerAlliance: number, // -100 to 100
  nahiCoalition: number,   // -100 to 100
  frontera: number         // -100 to 100
}
```

## Testing the System

### 1. Seed Example Data
```bash
npm run seed:reputation
```

### 2. Test API Endpoints
```bash
# Get all standings
GET /api/reputation

# Get specific faction
GET /api/reputation/settlerAlliance

# Get history
GET /api/reputation/history?faction=settlerAlliance&limit=20

# Get benefits guide
GET /api/reputation/benefits
```

### 3. Complete Quests
- Accept quest: `POST /api/quests/accept`
- Complete quest with reputation reward
- Check standing: `GET /api/reputation`

### 4. Commit Crimes
- Commit crime: `POST /api/crimes/attempt`
- Check reputation decreased: `GET /api/reputation/settlerAlliance`

### 5. Purchase Items
- Buy from faction shop (prices auto-adjusted)
- Verify discount/markup applied

## Future Enhancements

### Phase 5 (Recommended Next Steps)

1. **NPC Dialogue System**
   - NPCs react differently based on faction standing
   - Unlock special dialogue at friendly/honored
   - Hostile NPCs refuse interaction or attack

2. **Faction-Specific Quests**
   - Exclusive quest chains for each faction
   - Mutually exclusive paths (choosing one hurts another)
   - Epic faction storylines

3. **Territory Control**
   - Factions control different regions
   - Standing affects safety/access in territories
   - Dynamic faction wars affect reputation

4. **Faction Disguises**
   - Temporarily appear as faction member
   - Access restricted areas
   - Disguise breaks if discovered

5. **Reputation Decay**
   - Inactivity slowly moves reputation toward neutral
   - Requires ongoing engagement with factions

6. **Faction Events**
   - Server-wide events favor specific factions
   - Temporary reputation bonuses
   - Special rewards for participation

## Notes for Developers

### Adding Reputation to New Systems

1. **Import the service:**
```typescript
import { ReputationService, Faction } from '../services/reputation.service';
```

2. **Modify reputation:**
```typescript
await ReputationService.modifyReputation(
  characterId,
  'settlerAlliance',
  10,
  'Reason for change'
);
```

3. **Check standing:**
```typescript
const standings = await ReputationService.getAllStandings(characterId);
const standing = standings.settlerAlliance.standing;
```

4. **Apply price modifiers:**
```typescript
const modifier = ReputationService.getPriceModifier(standing);
const finalPrice = Math.round(basePrice * modifier);
```

### Error Handling
- All reputation updates wrapped in try-catch
- Failed reputation updates don't break parent operations
- Errors logged but don't fail quests/crimes/purchases

### Performance
- Reputation checks cached in character object
- History queries indexed for fast retrieval
- Bulk updates supported for admin operations

## Conclusion

The Faction Reputation System is production-ready and fully integrated. Players can now:

- ✅ Build relationships with three unique factions
- ✅ Earn reputation through quests
- ✅ Lose reputation through crimes
- ✅ Enjoy faction-based price modifiers
- ✅ Track all reputation changes
- ✅ View standing requirements and benefits
- ✅ Experience dynamic faction interactions

The system is extensible, well-documented, and ready for Phase 5 enhancements!
