# Legacy System - Quick Reference Card

## Instant Integration Examples

### 1. Track Combat Victory
```typescript
import { legacyService } from '../services/legacy.service';
import { LegacyEventType } from '../../../shared/src/types/legacy.types';

// After combat win
await legacyService.updateLegacyProgress({
  eventType: LegacyEventType.COMBAT_VICTORY,
  userId: character.userId.toString(),
  characterId: character._id.toString(),
  value: 1,
});
```

### 2. Apply Bonuses to New Character
```typescript
const bonuses = await legacyService.getNewCharacterBonuses(userId);

const character = new CharacterModel({
  userId,
  name,
  gold: BASE_GOLD + bonuses.allBonuses.startingGold,
  skillPoints: BASE_SKILLS + bonuses.allBonuses.startingSkillBonus,
  reputation: bonuses.allBonuses.startingReputation,
  inventory: [...bonuses.allBonuses.startingItems],
});
```

### 3. Apply XP Multiplier
```typescript
const bonuses = await legacyService.getBonusMultipliers(userId);
const finalXP = baseXP * bonuses.xpMultiplier;
character.experience += finalXP;
```

### 4. Apply Gold Multiplier
```typescript
const bonuses = await legacyService.getBonusMultipliers(userId);
const finalGold = baseGold * bonuses.goldMultiplier;
character.gold += finalGold;
```

## Common Event Types

| Event | Stat Tracked | When to Call |
|-------|--------------|--------------|
| `COMBAT_VICTORY` | totalEnemiesDefeated | After winning combat |
| `GOLD_EARNED` | totalGoldEarned | When gold awarded |
| `QUEST_COMPLETED` | totalQuestsCompleted | When quest finishes |
| `LEVEL_UP` | highestLevelReached | When character levels |
| `ACHIEVEMENT_UNLOCKED` | totalAchievementsUnlocked | When achievement earned |

## API Endpoints

```bash
# Get legacy profile
GET /api/legacy/profile

# Get milestones
GET /api/legacy/milestones

# Get bonuses
GET /api/legacy/bonuses

# Get new character bonuses
GET /api/legacy/new-character-bonuses

# Claim reward
POST /api/legacy/claim-reward
Body: { "rewardId": "...", "characterId": "..." }
```

## Legacy Tiers

| Tier | Milestones | XP | Gold |
|------|------------|-----|------|
| Bronze | 10 | +5% | 0% |
| Silver | 25 | +10% | +5% |
| Gold | 50 | +15% | +10% |
| Platinum | 100 | +20% | +15% |
| Legendary | 200 | +25% | +20% |

## Milestone Categories

1. **Combat** (10 enemies → 5000)
2. **Economic** (1K gold → 1M)
3. **Social** (gang, friends, rep)
4. **Exploration** (locations, secrets)
5. **Quest** (story, side, legendary)
6. **Skill** (maxed, professions)
7. **Time** (days, logins)
8. **Special** (achievements, level)

## Best Practices

### ✅ DO
- Batch updates (end of combat, not each hit)
- Use async/await or fire-and-forget
- Cache bonuses per request
- Handle errors gracefully

### ❌ DON'T
- Update on every single action
- Block gameplay for legacy updates
- Forget to apply multipliers
- Ignore integration errors

## Testing

```bash
# Test stat update
curl -X POST http://localhost:3001/api/legacy/admin/update-stat \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"statKey":"totalEnemiesDefeated","value":100,"increment":true}'

# Check profile
curl http://localhost:3001/api/legacy/profile \
  -H "Authorization: Bearer TOKEN"
```

## File Locations

- **Types**: `shared/src/types/legacy.types.ts`
- **Service**: `server/src/services/legacy.service.ts`
- **Milestones**: `server/src/data/legacy/milestones.ts`
- **Tiers**: `server/src/data/legacy/tiers.ts`
- **Model**: `server/src/models/LegacyProfile.model.ts`

## Need More Info?

- **Full Documentation**: `server/src/data/legacy/README.md`
- **Integration Guide**: `server/src/data/legacy/INTEGRATION.md`
- **Completion Report**: `PHASE_15_WAVE_15.1_LEGACY_SYSTEM_COMPLETE.md`
