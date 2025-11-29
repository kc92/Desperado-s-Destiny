# Permanent Unlocks - Quick Reference

## Quick Integration

### Character Creation
```typescript
import { applyUnlockEffectsToCharacter, canCreateCharacter } from '../services/permanentUnlock.service';

// Check if can create
if (!await canCreateCharacter(userId)) {
  throw new Error('Maximum character slots reached');
}

// Apply bonuses
const characterData = { name, gold: 100, strength: 10, ... };
const enhanced = await applyUnlockEffectsToCharacter(userId, characterData);
const character = await Character.create(enhanced);
```

### Achievement Integration
```typescript
import { processAchievementUnlock } from '../services/unlockTrigger.service';

// After granting achievement
await grantAchievement(userId, achievementId);
await processAchievementUnlock(userId, achievementId);
```

### Legacy Integration
```typescript
import { processLegacyTierUnlock } from '../services/unlockTrigger.service';

// When legacy tier increases
user.legacyTier = newTier;
await user.save();
await processLegacyTierUnlock(userId, newTier);
```

### Milestone Tracking
```typescript
import {
  processLevelMilestone,
  processDuelMilestone,
  processGoldMilestone
} from '../services/unlockTrigger.service';

// Level up
await processLevelMilestone(userId, character.level);

// Duel victory
await processDuelMilestone(userId, user.totalDuelsWon);

// Gold earned
await processGoldMilestone(userId, user.totalGoldEarned);
```

### Get Unlocks
```typescript
import { getAccountUnlocks } from '../services/permanentUnlock.service';

const unlocks = await getAccountUnlocks(userId);

// Use active effects
if (unlocks.activeEffects.convenience.autoLoot) {
  // Auto-collect loot
}

if (unlocks.activeEffects.gameplay.abilities.includes('lucky_draw')) {
  destinyBonus += 0.05;
}

const inventory = baseSlots + unlocks.activeEffects.convenience.extraInventorySlots;
```

## Unlock Categories

### Cosmetic (25+)
- Portrait frames (6)
- Nameplate colors (6)
- Titles (5)
- Chat badges (4)
- Profile backgrounds (4)
- Death animations (4)

### Gameplay (20+)
- Character slots (3)
- Starting locations (4)
- Starting bonuses (7)
- Abilities (5)
- Horse breeds (4)
- Companions (4)

### Convenience (15+)
- Auto-loot (1)
- Fast travel (5)
- Inventory expansion (4)
- Bank expansion (3)
- Mail expansion (3)

### Prestige (10+)
- Faction access (3)
- VIP areas (4)
- NPC dialogues (3)
- Legacy titles (5)
- Hall of Fame (3)

## Key Milestones

### Level
- 5: Bronze frame, Mail +2
- 10: Desert background, Inventory +10
- 15: Silver frame
- 25: Inventory +20
- 30: Gold frame
- 50: Legend title

### Legacy Tier
- 2: 3rd character slot
- 3: Dramatic death
- 5: 4th slot, Auto-loot, Hall of Fame bronze
- 6: Inventory +30
- 8: Iron Will ability
- 10: 5th slot, Legendary frame, Inventory +50, HoF silver
- 12: Universal fast travel
- 15: Immortal title, HoF gold
- 20: Eternal Legend

### Gold
- 5k: Green name
- 10k: Saloon background, Bank +25
- 25k: +100 starting gold
- 50k: Gold name, Fast travel banks, Bank +50
- 100k: +250 starting gold, VIP gambling
- 250k: Arabian horse, Bank +100
- 500k: +500 starting gold
- 1M: Golden Circle faction
- 10M: Gold Emperor title

### Duels
- 10: Gunslinger title
- 25: Blood red name
- 100: Duelist badge
- 250: Legendary gunslinger dialogues

### Crimes
- 50: Outlaw title
- 100: Wanted frame
- 200: Hideout background
- 500: Mountain hideout start

## API Endpoints

```
GET    /api/unlocks                     Get all account unlocks
GET    /api/unlocks/available           Get unlocks with progress
GET    /api/unlocks/character-slots     Check slot availability
POST   /api/unlocks/sync-legacy         Sync legacy unlocks
GET    /api/unlocks/:id/progress        Get unlock progress
GET    /api/unlocks/:id/eligibility     Check eligibility
POST   /api/unlocks/:id/claim           Claim earned unlock
```

## Passive Abilities

```typescript
const abilities = unlocks.activeEffects.gameplay.abilities;

if (abilities.includes('lucky_draw')) {
  // +5% Destiny Deck bonus
  destinyBonus += 0.05;
}

if (abilities.includes('quick_recovery')) {
  // -10% jail time
  jailTime *= 0.9;
}

if (abilities.includes('silver_tongue')) {
  // +10% trade prices
  tradeBonus += 0.1;
}

if (abilities.includes('eagle_eye')) {
  // +10% rare item chance
  rareItemChance += 0.1;
}

if (abilities.includes('iron_will')) {
  // +15% status resist
  statusResist += 0.15;
}
```

## Character Slots

```typescript
Base: 2 slots
+ Legacy Tier 2: +1 (3 total)
+ Legacy Tier 5: +1 (4 total)
+ Legacy Tier 10: +1 (5 total maximum)
```

## Starting Bonuses (Stackable)

```typescript
Gold:
- Prospector's Cache: +100g
- Banker's Fortune: +250g
- Tycoon's Inheritance: +500g
Total: +850g

Stats:
- Born Strong: +2 STR
- Born Fast: +2 SPD
- Born Clever: +2 CUN
- Born Charming: +2 CHA
Total: +8 stats
```

## Common Patterns

### Check and Apply
```typescript
// Get unlocks once
const unlocks = await getAccountUnlocks(userId);

// Check multiple features
const autoLoot = unlocks.activeEffects.convenience.autoLoot;
const abilities = unlocks.activeEffects.gameplay.abilities;
const inventory = unlocks.activeEffects.convenience.extraInventorySlots;
```

### Retroactive Sync
```typescript
import { syncAllMilestoneUnlocks } from '../services/unlockTrigger.service';

// For existing users or migration
await syncAllMilestoneUnlocks(userId);
```

### Display Progress
```typescript
import { getAvailableUnlocks } from '../services/permanentUnlock.service';

const available = await getAvailableUnlocks(userId);

available.forEach(unlock => {
  console.log(`${unlock.name}: ${unlock.progress.percentage}%`);
  if (unlock.earned) {
    console.log('✓ Unlocked!');
  }
});
```

## Testing

```bash
# Run tests
npm test server/tests/unlocks/permanentUnlocks.test.ts

# Test specific scenario
npm test -- --testNamePattern="should grant unlock on legacy tier"
```

## Troubleshooting

### Unlock not granted
1. Check requirement evaluation
2. Verify trigger is configured
3. Check for duplicates in database
4. Ensure user meets requirements

### Character slots not working
1. Check `activeEffects.totalCharacterSlots`
2. Run `syncLegacyUnlocks(userId)`
3. Verify legacy tier is correct
4. Check character count vs max slots

### Performance issues
1. Use pre-computed `activeEffects`
2. Avoid recalculating on every request
3. Cache unlock definitions
4. Batch unlock operations
