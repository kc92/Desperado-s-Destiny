# Legacy System - Cross-Character Progression

## Overview

The Legacy System is a comprehensive cross-character progression feature that rewards players for their lifetime achievements across all characters. As players complete milestones with any character, they earn rewards that benefit future characters, creating a sense of continuity and progression that transcends individual character lives.

## Core Concepts

### Legacy Profile (Player-Level)
Each **User** (not Character) has a single Legacy Profile that tracks:
- **Lifetime Stats**: Aggregated statistics across all characters
- **Milestones**: 50+ achievements with progress tracking
- **Legacy Tier**: Bronze, Silver, Gold, Platinum, or Legendary
- **Rewards**: Bonuses that can be claimed by new characters
- **Character Contributions**: Historical record of each character's achievements

### Legacy Tiers

Players progress through five legacy tiers based on total milestones completed:

| Tier | Milestones Required | Key Bonuses |
|------|---------------------|-------------|
| **Bronze** | 10 | +5% XP, +100 starting gold |
| **Silver** | 25 | +10% XP, +5% gold, starter weapon/armor |
| **Gold** | 50 | +15% XP, +10% gold, +10 skill points, +10% energy |
| **Platinum** | 100 | +20% XP, +15% gold, +500 reputation, unlock special classes |
| **Legendary** | 200 | +25% XP, +20% gold, legendary gear, VIP access, exclusive content |

### Milestones (50+ Total)

Milestones are categorized into:

1. **Combat** (15 milestones)
   - Enemy defeats, boss kills, duels won, damage dealt/taken
   - Examples: "First Blood" (10 enemies), "Legendary Gunslinger" (1000 enemies)

2. **Economic** (12 milestones)
   - Gold earned/spent, properties owned, trades, crafting
   - Examples: "First Fortune" (1000 gold), "Business Tycoon" (100,000 gold)

3. **Social** (8 milestones)
   - Gang rank, friends, mail, reputation
   - Examples: "Gang Leader" (Rank 10), "Legendary Reputation" (200k rep)

4. **Exploration** (6 milestones)
   - Locations discovered, secrets found, territories
   - Examples: "Explorer" (10 locations), "Master Explorer" (100 locations)

5. **Quest** (7 milestones)
   - Total quests, legendary quests, story quests, side quests
   - Examples: "Quest Master" (200 quests), "Ultimate Quester" (500 quests)

6. **Skill** (5 milestones)
   - Skills maxed, professions mastered, skill points earned
   - Examples: "Skill Master" (10 maxed), "Master of Trades" (5 professions)

7. **Time** (5 milestones)
   - Days played, logins, seasonal events
   - Examples: "One Month Strong" (30 days), "Year of the Gun" (365 days)

8. **Special** (6 milestones)
   - Achievements, characters created, highest level/fame
   - Examples: "Completionist" (200 achievements), "Veteran of Many Lives" (10 characters)

### Bonus Types

The legacy system provides various bonus types:

- **XP_MULTIPLIER**: Increases XP gain (stacks additively)
- **GOLD_MULTIPLIER**: Increases gold earnings (stacks additively)
- **ENERGY_BONUS**: Increases maximum energy (stacks additively)
- **FAME_BONUS**: Increases fame gain (stacks additively)
- **STARTING_GOLD**: Bonus gold for new characters
- **STARTING_ITEMS**: Equipment/items granted at character creation
- **STARTING_SKILLS**: Bonus skill points at character creation
- **STARTING_REPUTATION**: Bonus reputation at character creation
- **UNLOCK_CLASS**: Unlock special character classes
- **UNLOCK_FEATURE**: Unlock gameplay features
- **COSMETIC**: Exclusive visual items, titles, effects

## Architecture

### File Structure
```
server/src/
├── data/legacy/
│   ├── milestones.ts          # 50+ milestone definitions
│   ├── tiers.ts               # Tier requirements and bonuses
│   ├── INTEGRATION.md         # Integration guide
│   └── README.md              # This file
├── models/
│   └── LegacyProfile.model.ts # MongoDB schema
├── services/
│   └── legacy.service.ts      # Business logic
├── controllers/
│   └── legacy.controller.ts   # HTTP handlers
└── routes/
    └── legacy.routes.ts       # API endpoints

shared/src/types/
└── legacy.types.ts            # TypeScript type definitions
```

### Data Flow

```
Game Action → Legacy Event → Service Update → Check Milestones → Award Rewards
                                                      ↓
                                              Update Tier → Save Profile
```

## API Endpoints

All endpoints require authentication and are prefixed with `/api/legacy`.

### GET /profile
Get complete legacy profile with tier info and active bonuses.

**Response:**
```json
{
  "profile": {
    "userId": "...",
    "currentTier": "gold",
    "totalMilestonesCompleted": 52,
    "lifetimeStats": { ... },
    "completedMilestones": ["combat_rookie", ...],
    "rewards": [ ... ]
  },
  "tierDefinition": {
    "tier": "gold",
    "displayName": "Gold Legacy",
    "milestonesRequired": 50,
    "bonuses": [ ... ]
  },
  "nextTier": {
    "tier": "platinum",
    "milestonesRequired": 100
  },
  "milestonesUntilNextTier": 48,
  "activeBonuses": {
    "xpMultiplier": 1.15,
    "goldMultiplier": 1.10,
    "startingGold": 500,
    "startingItems": ["steel_revolver", "reinforced_vest"],
    "startingSkillBonus": 10
  }
}
```

### GET /milestones
Get all milestones with progress tracking.

**Response:**
```json
{
  "milestones": [ ... ],
  "progress": [
    {
      "milestoneId": "combat_veteran",
      "currentValue": 75,
      "requirement": 100,
      "completed": false
    }
  ],
  "completed": ["combat_rookie", "first_fortune"],
  "inProgress": ["combat_veteran", "entrepreneur"],
  "locked": ["combat_master", "tycoon"]
}
```

### GET /bonuses
Get active bonuses for the authenticated user.

**Response:**
```json
{
  "xpMultiplier": 1.15,
  "goldMultiplier": 1.10,
  "energyMultiplier": 1.10,
  "fameMultiplier": 1.05,
  "startingGold": 500,
  "startingItems": ["steel_revolver", "reinforced_vest"],
  "startingSkillBonus": 10,
  "startingReputation": 0,
  "unlockedClasses": [],
  "unlockedFeatures": [],
  "cosmetics": []
}
```

### GET /new-character-bonuses
Get bonuses that apply when creating a new character.

**Response:**
```json
{
  "tier": "gold",
  "tierBonuses": [ ... ],
  "milestoneBonuses": [ ... ],
  "allBonuses": { ... },
  "availableRewards": [ ... ]
}
```

### GET /rewards
Get available unclaimed rewards.

### POST /claim-reward
Claim a legacy reward for a character.

**Request Body:**
```json
{
  "rewardId": "combat_veteran_1234567890",
  "characterId": "..."
}
```

### GET /stats
Get lifetime statistics.

### GET /contributions
Get character contribution history.

### POST /admin/update-stat
Admin endpoint to manually update a stat (for testing).

**Request Body:**
```json
{
  "statKey": "totalEnemiesDefeated",
  "value": 100,
  "increment": true
}
```

## Usage Examples

### Track Combat Victory
```typescript
import { legacyService } from '../services/legacy.service';
import { LegacyEventType } from '../../../shared/src/types/legacy.types';

await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.COMBAT_VICTORY,
  userId: character.userId.toString(),
  characterId: character._id.toString(),
  value: 1,
});
```

### Apply Bonuses to New Character
```typescript
const bonuses = await legacyService.getNewCharacterBonuses(userId);

const character = new CharacterModel({
  userId,
  name: characterName,
  gold: BASE_GOLD + bonuses.allBonuses.startingGold,
  skillPoints: BASE_SKILL_POINTS + bonuses.allBonuses.startingSkillBonus,
  reputation: bonuses.allBonuses.startingReputation,
  inventory: [...bonuses.allBonuses.startingItems],
});
```

### Apply XP/Gold Multipliers
```typescript
const bonuses = await legacyService.getBonusMultipliers(userId);

const xpToAward = baseXP * bonuses.xpMultiplier;
const goldToAward = baseGold * bonuses.goldMultiplier;
```

### Aggregate Character Stats on Deletion
```typescript
await legacyService.aggregateCharacterStats(
  userId,
  characterId,
  character.name,
  character.level,
  {
    totalEnemiesDefeated: character.stats.enemiesDefeated,
    totalGoldEarned: character.stats.lifetimeGoldEarned,
    totalQuestsCompleted: character.quests.completed.length,
    // ... other stats
  },
  true // retired flag
);
```

## Database Schema

### LegacyProfile Collection

```typescript
{
  userId: ObjectId,              // Reference to User
  currentTier: String,           // 'bronze', 'silver', 'gold', 'platinum', 'legendary'
  lifetimeStats: {
    totalEnemiesDefeated: Number,
    totalGoldEarned: Number,
    // ... 30+ stats
  },
  milestoneProgress: [{
    milestoneId: String,
    currentValue: Number,
    requirement: Number,
    completed: Boolean,
    completedAt: Date,
    timesCompleted: Number
  }],
  completedMilestones: [String], // Array of milestone IDs
  rewards: [{
    id: String,
    name: String,
    description: String,
    bonus: Object,
    unlockedAt: Date,
    claimed: Boolean,
    claimedBy: String,            // Character ID
    claimedAt: Date,
    oneTimeUse: Boolean
  }],
  characterContributions: [{
    characterId: String,
    characterName: String,
    level: Number,
    playedFrom: Date,
    playedUntil: Date,
    retired: Boolean,
    stats: Object,
    notableMilestones: [String]
  }],
  totalMilestonesCompleted: Number,
  lastUpdated: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
- `userId` (unique)
- `currentTier`
- `totalMilestonesCompleted` (descending)
- `lastUpdated` (descending)
- `completedMilestones`

## Integration Points

See [INTEGRATION.md](./INTEGRATION.md) for detailed integration instructions with:
- Character creation
- Combat system
- Gold/economy system
- Quest system
- Achievement system
- Gang system
- Friend/mail systems
- Territory system
- Skill/XP system
- Crafting system
- Shop system
- Location/exploration
- Duel system
- Character deletion/retirement
- Login tracking

## Design Decisions

### Player-Level, Not Character-Level
Legacy is tied to the **User** account, not individual characters. This ensures:
- Progress persists across character deaths/deletions
- True "family lineage" feeling
- Encourages experimentation with new characters
- Account-level investment

### Additive Multipliers
XP and gold multipliers stack additively, not multiplicatively:
- Tier bonus: +15% XP (1.15x)
- Milestone bonus: +5% XP (1.05x)
- **Total: 1.20x, not 1.15 * 1.05 = 1.2075x**

This prevents exponential scaling while still feeling rewarding.

### Milestone Rewards vs Tier Rewards
- **Tier Rewards**: Applied automatically based on total milestones
- **Milestone Rewards**: Can be claimed individually for specific achievements

This provides both passive bonuses (tiers) and active choices (claiming rewards).

### Hidden Milestones
Some milestones are "hidden" (secret achievements):
- `combat_legend` - Defeat 5000 enemies
- `economic_empire` - Earn 1,000,000 gold
- `legendary_reputation` - Earn 200,000 reputation
- `master_explorer` - Discover 100 locations
- `ultimate_quester` - Complete 500 quests
- `year_played` - Play for 365 days

These create surprise delight moments for dedicated players.

### Repeatable Milestones
Currently, milestones are **one-time** achievements. Future enhancement could add repeatable milestones (e.g., "Defeat 1000 enemies" that repeats infinitely, each time granting a small bonus).

## Performance Considerations

1. **Batch Updates**: Don't update legacy on every single action. Batch updates where appropriate (e.g., end of combat, not each hit).

2. **Async Operations**: Legacy updates should not block gameplay. Use fire-and-forget or Promise.all patterns.

3. **Caching**: Consider caching bonus multipliers per request/session to avoid repeated database queries.

4. **Indexes**: All critical queries are indexed (userId, tier, milestones).

5. **Aggregation Pipeline**: For leaderboards or analytics, use MongoDB aggregation pipelines on the LegacyProfile collection.

## Testing

### Manual Testing
```bash
# Get your legacy profile
curl http://localhost:3001/api/legacy/profile \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update a stat (admin endpoint)
curl -X POST http://localhost:3001/api/legacy/admin/update-stat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "statKey": "totalEnemiesDefeated",
    "value": 1000,
    "increment": false
  }'

# Check milestones
curl http://localhost:3001/api/legacy/milestones \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Integration Testing
Create test characters, perform actions, verify legacy updates, create new character, verify bonuses applied.

## Future Enhancements

### Phase 1 Enhancements
- **Legacy Challenges**: Special challenges that span multiple characters
- **Season Legacy**: Seasonal legacy tracks that reset each season
- **Legacy Leaderboards**: Show top legacy profiles globally

### Phase 2 Enhancements
- **Heirloom Items**: Special items that can be passed between characters
- **Family Tree UI**: Visual representation of character lineage
- **Legacy Achievements**: Meta-achievements for legacy system itself

### Phase 3 Enhancements
- **Legacy Quests**: Special quest lines only available to high-tier legacy players
- **Legacy Events**: Timed events that grant legacy rewards
- **Legacy Shop**: Exclusive shop using legacy points

### Phase 4 Enhancements
- **Prestige System**: Reset legacy for even greater bonuses
- **Legacy Skins**: Cosmetic rewards tied to legacy tier
- **Cross-Server Legacy**: Legacy that works across game servers

## FAQ

### Q: What happens if I delete all my characters?
**A:** Your legacy profile persists! All your milestone progress and rewards remain, ready to benefit your next character.

### Q: Can I reset my legacy?
**A:** Not currently, but a future "Prestige" system might allow this for additional bonuses.

### Q: Do legacy bonuses stack with other bonuses?
**A:** Yes! Legacy multipliers stack with event bonuses, gang bonuses, item bonuses, etc. (multiplicatively with other systems, but legacy bonuses stack additively with each other).

### Q: Can I see other players' legacy profiles?
**A:** Not currently, but future leaderboards will show top legacy tiers.

### Q: What's the fastest way to level up my legacy tier?
**A:** Focus on categories with many easy milestones (Time, Social, Economic early game, Combat mid-game, Quest/Exploration late game).

### Q: Do hidden milestones count toward tier progression?
**A:** Yes! Hidden milestones count the same as visible ones.

### Q: Can legacy bonuses be disabled for a "hardcore" run?
**A:** Not currently, but this would be a good future feature.

## Credits

- **Design**: Phase 15, Wave 15.1 - Cross-Character Progression System
- **Implementation**: Desperados Destiny Development Team
- **Inspired By**: Classic MMO legacy systems, roguelike meta-progression

---

**Last Updated**: 2025-11-26
**Version**: 1.0.0
**Status**: Production Ready
