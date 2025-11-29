# Legacy System Integration Guide

## Overview
The Legacy System tracks cross-character progression and provides bonuses to new characters based on lifetime achievements. This document explains how to integrate the legacy system with existing game systems.

## Integration Points

### 1. Character Creation
When a new character is created, apply legacy bonuses.

**Location**: `server/src/controllers/character.controller.ts`

```typescript
import { legacyService } from '../services/legacy.service';

// In createCharacter controller
const userId = req.user!._id;

// Get legacy bonuses for new character
const legacyBonuses = await legacyService.getNewCharacterBonuses(userId);

// Apply bonuses to new character
const character = new CharacterModel({
  // ... other fields
  gold: baseGold + legacyBonuses.allBonuses.startingGold,
  skillPoints: baseSkillPoints + legacyBonuses.allBonuses.startingSkillBonus,
  reputation: legacyBonuses.allBonuses.startingReputation,
  // Add starting items to inventory
  inventory: [...legacyBonuses.allBonuses.startingItems],
});

// Track character creation
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.CHARACTER_CREATED,
  userId,
  characterId: character._id.toString(),
  value: 1,
});
```

### 2. Combat System
Track combat victories, boss kills, damage dealt/taken.

**Location**: `server/src/services/combat.service.ts`

```typescript
import { legacyService } from './legacy.service';
import { LegacyEventType } from '../../../shared/src/types/legacy.types';

// After combat victory
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.COMBAT_VICTORY,
  userId: character.userId.toString(),
  characterId: character._id.toString(),
  value: 1,
});

// If boss defeated
if (enemy.isBoss) {
  await legacyService.updateLegacyProgress({
    eventType: LegacyEventType.BOSS_DEFEATED,
    userId: character.userId.toString(),
    characterId: character._id.toString(),
    value: 1,
  });
}

// Track damage dealt (optional - can batch)
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.DAMAGE_DEALT,
  userId: character.userId.toString(),
  characterId: character._id.toString(),
  value: damageDealt,
});
```

### 3. Gold System
Track gold earned and spent, apply multipliers.

**Location**: `server/src/services/gold.service.ts`

```typescript
import { legacyService } from './legacy.service';
import { LegacyEventType } from '../../../shared/src/types/legacy.types';

// When awarding gold
const bonuses = await legacyService.getBonusMultipliers(userId);
const goldWithBonus = baseGold * bonuses.goldMultiplier;

await addGold(character, goldWithBonus);

// Track gold earned
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.GOLD_EARNED,
  userId,
  characterId,
  value: goldWithBonus,
});

// When spending gold
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.GOLD_SPENT,
  userId,
  characterId,
  value: goldSpent,
});
```

### 4. Quest System
Track quest completions by type.

**Location**: `server/src/services/quest.service.ts`

```typescript
import { legacyService } from './legacy.service';
import { LegacyEventType } from '../../../shared/src/types/legacy.types';

// When quest completed
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.QUEST_COMPLETED,
  userId: character.userId.toString(),
  characterId: character._id.toString(),
  value: 1,
  metadata: {
    questType: quest.type, // 'legendary', 'story', 'side'
  },
});
```

### 5. Achievement System
Track achievement unlocks.

**Location**: `server/src/services/achievement.service.ts`

```typescript
import { legacyService } from './legacy.service';
import { LegacyEventType } from '../../../shared/src/types/legacy.types';

// When achievement unlocked
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.ACHIEVEMENT_UNLOCKED,
  userId,
  characterId,
  value: 1,
});
```

### 6. Gang System
Track gang rank.

**Location**: `server/src/services/gang.service.ts`

```typescript
import { legacyService } from './legacy.service';
import { LegacyEventType } from '../../../shared/src/types/legacy.types';

// When gang rank increases
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.GANG_RANK_INCREASED,
  userId,
  characterId,
  value: newRank,
});
```

### 7. Friend System
Track friends made.

**Location**: `server/src/services/friend.service.ts`

```typescript
import { legacyService } from './legacy.service';
import { LegacyEventType } from '../../../shared/src/types/legacy.types';

// When friend added
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.FRIEND_ADDED,
  userId,
  characterId,
  value: 1,
});
```

### 8. Mail System
Track mail sent.

**Location**: `server/src/services/mail.service.ts`

```typescript
import { legacyService } from './legacy.service';
import { LegacyEventType } from '../../../shared/src/types/legacy.types';

// When mail sent
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.MAIL_SENT,
  userId,
  characterId,
  value: 1,
});
```

### 9. Territory System
Track territories controlled.

**Location**: `server/src/services/territory.service.ts`

```typescript
import { legacyService } from './legacy.service';
import { LegacyEventType } from '../../../shared/src/types/legacy.types';

// When territory captured
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.TERRITORY_CAPTURED,
  userId,
  characterId,
  value: 1,
});
```

### 10. Skill System
Track skills maxed, skill points earned, apply XP multipliers.

**Location**: `server/src/services/skill.service.ts`

```typescript
import { legacyService } from './legacy.service';
import { LegacyEventType } from '../../../shared/src/types/legacy.types';

// When awarding XP
const bonuses = await legacyService.getBonusMultipliers(userId);
const xpWithBonus = baseXP * bonuses.xpMultiplier;

// When skill maxed
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.SKILL_MAXED,
  userId,
  characterId,
  value: 1,
});

// When skill point earned
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.SKILL_POINT_EARNED,
  userId,
  characterId,
  value: 1,
});
```

### 11. Crafting System
Track items crafted.

**Location**: `server/src/services/crafting.service.ts`

```typescript
import { legacyService } from './legacy.service';
import { LegacyEventType } from '../../../shared/src/types/legacy.types';

// When item crafted
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.ITEM_CRAFTED,
  userId,
  characterId,
  value: 1,
});
```

### 12. Shop System
Track items bought/sold.

**Location**: `server/src/services/shop.service.ts`

```typescript
import { legacyService } from './legacy.service';
import { LegacyEventType } from '../../../shared/src/types/legacy.types';

// When item bought
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.ITEM_BOUGHT,
  userId,
  characterId,
  value: 1,
});

// When item sold
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.ITEM_SOLD,
  userId,
  characterId,
  value: 1,
});
```

### 13. Location System
Track locations discovered, secrets found.

**Location**: `server/src/services/location.service.ts`

```typescript
import { legacyService } from './legacy.service';
import { LegacyEventType } from '../../../shared/src/types/legacy.types';

// When location discovered
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.LOCATION_DISCOVERED,
  userId,
  characterId,
  value: 1,
});

// When secret found
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.SECRET_FOUND,
  userId,
  characterId,
  value: 1,
});
```

### 14. Duel System
Track duel wins/losses, apply fame multipliers.

**Location**: `server/src/services/duel.service.ts`

```typescript
import { legacyService } from './legacy.service';
import { LegacyEventType } from '../../../shared/src/types/legacy.types';

// When duel won
const bonuses = await legacyService.getBonusMultipliers(userId);
const fameWithBonus = baseFame * bonuses.fameMultiplier;

await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.DUEL_WON,
  userId,
  characterId,
  value: 1,
});

// When duel lost
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.DUEL_LOST,
  userId,
  characterId,
  value: 1,
});
```

### 15. Character Level/Fame
Track highest level and fame reached.

**Location**: `server/src/services/character.service.ts` or wherever level-up occurs

```typescript
import { legacyService } from './legacy.service';
import { LegacyEventType } from '../../../shared/src/types/legacy.types';

// When character levels up
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.LEVEL_UP,
  userId,
  characterId,
  value: newLevel,
});

// When fame gained
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.FAME_GAINED,
  userId,
  characterId,
  value: currentFame,
});
```

### 16. Character Deletion/Retirement
Aggregate stats when character is deleted or retired.

**Location**: `server/src/controllers/character.controller.ts`

```typescript
import { legacyService } from '../services/legacy.service';

// In deleteCharacter or retireCharacter controller
const userId = character.userId.toString();
const characterId = character._id.toString();

// Aggregate all character stats to legacy
await legacyService.aggregateCharacterStats(
  userId,
  characterId,
  character.name,
  character.level,
  {
    // Pass all relevant stats from character
    totalEnemiesDefeated: character.stats.enemiesDefeated,
    totalGoldEarned: character.stats.goldEarned,
    totalQuestsCompleted: character.quests.completed.length,
    // ... etc
  },
  true // retired flag
);
```

### 17. Daily Login
Track login count and days played.

**Location**: `server/src/middleware/auth.middleware.ts` or login handler

```typescript
import { legacyService } from '../services/legacy.service';
import { LegacyEventType } from '../../../shared/src/types/legacy.types';

// On daily login
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.LOGIN,
  userId,
  value: 1,
});

// Track days played (call once per day)
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.DAY_PLAYED,
  userId,
  value: 1,
});
```

## Event Type Reference

| Event Type | Stat Updated | Usage |
|------------|--------------|-------|
| `COMBAT_VICTORY` | totalEnemiesDefeated | After any combat win |
| `BOSS_DEFEATED` | totalBossesKilled | After defeating boss enemy |
| `DUEL_WON` | totalDuelsWon | After winning duel |
| `DUEL_LOST` | totalDuelsLost | After losing duel |
| `GOLD_EARNED` | totalGoldEarned | Whenever gold is awarded |
| `GOLD_SPENT` | totalGoldSpent | Whenever gold is spent |
| `PROPERTY_ACQUIRED` | totalPropertiesOwned | When property bought |
| `TRADE_COMPLETED` | totalTradesCompleted | When trade finalized |
| `ITEM_CRAFTED` | totalItemsCrafted | When item crafted |
| `ITEM_BOUGHT` | totalItemsBought | When item purchased |
| `ITEM_SOLD` | totalItemsSold | When item sold |
| `GANG_RANK_INCREASED` | highestGangRank | When gang rank goes up |
| `FRIEND_ADDED` | totalFriendsMade | When friend added |
| `MAIL_SENT` | totalMailSent | When mail sent |
| `REPUTATION_EARNED` | totalReputationEarned | When reputation gained |
| `LOCATION_DISCOVERED` | totalLocationsDiscovered | When new location found |
| `SECRET_FOUND` | totalSecretsFound | When secret discovered |
| `RARE_EVENT` | totalRareEventsWitnessed | When rare event occurs |
| `TERRITORY_CAPTURED` | totalTerritoriesControlled | When territory claimed |
| `QUEST_COMPLETED` | totalQuestsCompleted | When quest finished |
| `SKILL_MAXED` | totalSkillsMaxed | When skill reaches max |
| `SKILL_POINT_EARNED` | totalSkillPointsEarned | When skill point awarded |
| `PROFESSION_MASTERED` | totalProfessionsMastered | When profession mastered |
| `DAY_PLAYED` | totalDaysPlayed | Once per day active |
| `LOGIN` | totalLoginsCount | Each login |
| `SEASONAL_EVENT` | totalSeasonalEventsParticipated | When participating in event |
| `ACHIEVEMENT_UNLOCKED` | totalAchievementsUnlocked | When achievement earned |
| `CHARACTER_CREATED` | totalCharactersCreated | When character created |
| `CHARACTER_RETIRED` | totalCharactersRetired | When character retired |
| `LEVEL_UP` | highestLevelReached | When level increases |
| `FAME_GAINED` | highestFameReached | When fame increases |

## Best Practices

### 1. Batch Updates
For frequent events (like damage dealt), consider batching updates:

```typescript
// Bad - update on every hit
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.DAMAGE_DEALT,
  userId,
  characterId,
  value: 10,
});

// Good - batch at end of combat
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.DAMAGE_DEALT,
  userId,
  characterId,
  value: totalDamageInCombat,
});
```

### 2. Async/Non-Blocking
Legacy updates should not block gameplay:

```typescript
// Fire and forget (don't await)
legacyService.updateLegacyProgress({
  eventType: LegacyEventType.COMBAT_VICTORY,
  userId,
  characterId,
  value: 1,
}).catch(err => console.error('Legacy update failed:', err));

// Or use Promise.all for parallel operations
await Promise.all([
  saveCharacter(),
  awardRewards(),
  legacyService.updateLegacyProgress(payload),
]);
```

### 3. Error Handling
Don't let legacy failures break gameplay:

```typescript
try {
  await legacyService.updateLegacyProgress(payload);
} catch (error) {
  console.error('Legacy system error:', error);
  // Continue with gameplay
}
```

### 4. Apply Multipliers Early
Get bonuses once and reuse:

```typescript
// Get bonuses once per request
const bonuses = await legacyService.getBonusMultipliers(userId);

// Apply to all operations
const goldEarned = baseGold * bonuses.goldMultiplier;
const xpEarned = baseXP * bonuses.xpMultiplier;
const fameEarned = baseFame * bonuses.fameMultiplier;
```

## Testing

### Create Test Data
Use the admin endpoint to test milestones:

```bash
curl -X POST http://localhost:3001/api/legacy/admin/update-stat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "statKey": "totalEnemiesDefeated",
    "value": 100,
    "increment": true
  }'
```

### Verify Milestones
Check milestone progress:

```bash
curl http://localhost:3001/api/legacy/milestones \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test New Character Bonuses
```bash
curl http://localhost:3001/api/legacy/new-character-bonuses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Frontend Integration

### Display Legacy Tier
```typescript
const { profile, tierDefinition, activeBonuses } = await api.get('/legacy/profile');

// Show tier badge
<Badge color={tierDefinition.color}>
  {tierDefinition.displayName}
</Badge>

// Show bonuses
<div>
  XP Bonus: +{((activeBonuses.xpMultiplier - 1) * 100).toFixed(0)}%
  Gold Bonus: +{((activeBonuses.goldMultiplier - 1) * 100).toFixed(0)}%
</div>
```

### Show Milestone Progress
```typescript
const { milestones, progress } = await api.get('/legacy/milestones');

milestones.forEach(milestone => {
  const prog = progress.find(p => p.milestoneId === milestone.id);
  const percent = (prog.currentValue / prog.requirement) * 100;

  // Render progress bar
});
```

## Performance Considerations

1. **Indexes**: The LegacyProfile model has indexes on userId, currentTier, and totalMilestonesCompleted
2. **Caching**: Consider caching bonus multipliers per request/session
3. **Async Updates**: Legacy updates should be non-blocking
4. **Batch Operations**: Aggregate stats periodically rather than on every action

## Future Enhancements

1. **Legacy Challenges**: Special challenges that span multiple characters
2. **Family Trees**: Visual representation of character lineage
3. **Heirloom Items**: Special items that can be passed between characters
4. **Legacy Perks**: Permanent account-wide perks
5. **Season Legacy**: Seasonal legacy tracks that reset
