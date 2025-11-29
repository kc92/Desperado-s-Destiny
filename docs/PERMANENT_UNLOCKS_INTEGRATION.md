# Permanent Unlocks System - Integration Guide

## Overview
The Permanent Unlocks system provides account-wide features, cosmetics, and gameplay enhancements that persist across all characters. This guide explains how to integrate the system with other game features.

## Architecture

### Data Flow
```
Player Action → Trigger Event → Check Requirements → Grant Unlock → Apply Effects
```

### Key Components

1. **Unlock Definitions** (`server/src/data/unlocks/`)
   - Cosmetics: Visual customization
   - Gameplay: Character slots, abilities, companions
   - Convenience: Quality-of-life features
   - Prestige: Exclusive access and recognition

2. **Database Layer** (`server/src/models/AccountUnlocks.model.ts`)
   - Stores earned unlocks per user
   - Pre-computed active effects for performance
   - Progress tracking and statistics

3. **Service Layer** (`server/src/services/permanentUnlock.service.ts`)
   - Business logic for unlock management
   - Requirement evaluation
   - Effect application

4. **Trigger System** (`server/src/services/unlockTrigger.service.ts`)
   - Automatic unlock granting
   - Event-based triggers
   - Milestone tracking

## Integration Points

### 1. Character Creation

When creating a new character, apply permanent unlock effects:

```typescript
import { applyUnlockEffectsToCharacter } from '../services/permanentUnlock.service';

// In character.controller.ts or character creation logic
const characterData = {
  name: 'John Doe',
  gold: 100,
  strength: 10,
  // ... other fields
};

// Apply unlock bonuses
const enhancedData = await applyUnlockEffectsToCharacter(userId, characterData);

// Create character with enhanced data
const character = await Character.create(enhancedData);
```

**Applied Effects:**
- Starting gold bonuses
- Starting stat bonuses
- Available starting locations
- Unlocked horse breeds
- Unlocked companion types

### 2. Character Slot Validation

Check if user can create more characters:

```typescript
import { canCreateCharacter, getMaxCharacterSlots } from '../services/permanentUnlock.service';

// Before allowing character creation
const canCreate = await canCreateCharacter(userId);
if (!canCreate) {
  const maxSlots = await getMaxCharacterSlots(userId);
  throw new Error(`Maximum character slots (${maxSlots}) reached`);
}
```

**Character Slot Unlocks:**
- Base: 2 slots (default)
- +1 at Legacy Tier 2 (3 total)
- +1 at Legacy Tier 5 (4 total)
- +1 at Legacy Tier 10 (5 total maximum)

### 3. Achievement Integration

Automatically grant unlocks when achievements are earned:

```typescript
import { processAchievementUnlock } from '../services/unlockTrigger.service';

// In achievement.service.ts after granting achievement
await grantAchievement(userId, achievementId);

// Trigger unlock check
await processAchievementUnlock(userId, achievementId);
```

**Achievement-based Unlocks:**
- Portrait frames
- Special abilities
- Starting location access
- Companion types
- Faction access
- And more (see `triggers.ts`)

### 4. Legacy System Integration

Grant unlocks when legacy tier increases:

```typescript
import { processLegacyTierUnlock, syncLegacyUnlocks } from '../services/unlockTrigger.service';

// When legacy tier increases
await processLegacyTierUnlock(userId, newTier);

// Or sync all legacy-based unlocks
await syncLegacyUnlocks(userId);
```

**Legacy Tier Unlocks:**
- Character slots (tiers 2, 5, 10)
- Auto-loot (tier 5)
- Inventory expansion (tier 6, 10)
- Special abilities (tier 8)
- Fast travel (tier 12)
- And more

### 5. Milestone Triggers

Track and grant unlocks based on gameplay milestones:

```typescript
import {
  processLevelMilestone,
  processDuelMilestone,
  processCrimeMilestone,
  processGoldMilestone
} from '../services/unlockTrigger.service';

// After character level up
await processLevelMilestone(userId, newLevel);

// After duel victory
await processDuelMilestone(userId, totalDuelsWon);

// After committing crime
await processCrimeMilestone(userId, totalCrimes);

// After earning gold
await processGoldMilestone(userId, totalGoldEarned);
```

**Milestone Categories:**
- Level milestones (5, 10, 15, 25, 30, 50)
- Duel victories (10, 25, 100, 250)
- Crimes committed (50, 100, 200, 500)
- Gold earned (5k, 10k, 25k, 50k, 100k, 250k, 500k, 1M, 10M)
- Time played (1 day, 30 days)
- Gang rank (rank 3, leader)

### 6. Cosmetic Application

Apply unlocked cosmetics to character profiles:

```typescript
import { getAccountUnlocks } from '../services/permanentUnlock.service';

// Get available cosmetics
const unlocks = await getAccountUnlocks(userId);
const cosmetics = unlocks.activeEffects.cosmetics;

// Available cosmetics:
// - portraitFrames: string[]
// - nameplateColors: string[]
// - titles: string[]
// - chatBadges: string[]
// - profileBackgrounds: string[]
// - deathAnimations: string[]
```

### 7. Convenience Features

Check and apply convenience features:

```typescript
const unlocks = await getAccountUnlocks(userId);
const convenience = unlocks.activeEffects.convenience;

// Auto-loot
if (convenience.autoLoot) {
  // Automatically collect loot after combat
}

// Fast travel
if (convenience.fastTravelPoints.includes('universal')) {
  // Allow travel to any location
} else if (convenience.fastTravelPoints.includes('saloons')) {
  // Allow travel to saloons only
}

// Inventory expansion
const totalInventorySlots = baseInventory + convenience.extraInventorySlots;

// Bank vault expansion
const totalBankSlots = baseBank + convenience.extraBankVaultSlots;

// Mail attachments
const maxAttachments = baseMail + convenience.extraMailAttachmentSlots;
```

### 8. Prestige Features

Check access to exclusive content:

```typescript
const unlocks = await getAccountUnlocks(userId);
const prestige = unlocks.activeEffects.prestige;

// Faction access
if (prestige.factionAccess.includes('shadow_council')) {
  // Allow access to Shadow Council content
}

// VIP areas
if (prestige.vipAreas.includes('high_stakes_rooms')) {
  // Allow entry to high-stakes gambling
}

// NPC dialogues
if (prestige.npcDialogues.includes('native_elders')) {
  // Show special dialogue options
}

// Hall of Fame
if (prestige.hallOfFameEntry) {
  // Display in Hall of Fame
}
```

### 9. Gameplay Abilities

Apply passive ability effects:

```typescript
const unlocks = await getAccountUnlocks(userId);
const abilities = unlocks.activeEffects.gameplay.abilities;

// Lucky Draw (+5% Destiny Deck bonus)
if (abilities.includes('lucky_draw')) {
  destinyBonus += 0.05;
}

// Quick Recovery (-10% jail time)
if (abilities.includes('quick_recovery')) {
  jailTime *= 0.9;
}

// Silver Tongue (+10% trade prices)
if (abilities.includes('silver_tongue')) {
  tradeBonus += 0.1;
}

// Eagle Eye (+10% rare item chance)
if (abilities.includes('eagle_eye')) {
  rareItemChance += 0.1;
}

// Iron Will (+15% status resist)
if (abilities.includes('iron_will')) {
  statusResist += 0.15;
}
```

## API Endpoints

### Get Account Unlocks
```http
GET /api/unlocks
Authorization: Bearer <token>
```

Returns all unlocks and active effects for the authenticated user.

### Get Available Unlocks
```http
GET /api/unlocks/available
Authorization: Bearer <token>
```

Returns all unlocks (earned and unearned) with progress information.

### Get Unlock Progress
```http
GET /api/unlocks/:id/progress
Authorization: Bearer <token>
```

Returns progress toward a specific unlock.

### Claim Unlock
```http
POST /api/unlocks/:id/claim
Authorization: Bearer <token>
```

Mark an earned unlock as claimed (seen by user).

### Check Character Slots
```http
GET /api/unlocks/character-slots
Authorization: Bearer <token>
```

Returns max slots and whether user can create more characters.

### Sync Legacy Unlocks
```http
POST /api/unlocks/sync-legacy
Authorization: Bearer <token>
```

Synchronize unlocks with current legacy tier.

## Frontend Integration

### Display Unlocks in Character Creation

```typescript
// Fetch account unlocks
const response = await fetch('/api/unlocks', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data } = await response.json();

// Show available starting locations
const startingLocations = data.activeEffects.gameplay.startingLocations;

// Show available cosmetics
const portraits = data.activeEffects.cosmetics.portraitFrames;
const colors = data.activeEffects.cosmetics.nameplateColors;

// Show starting bonuses
const hasGoldBonus = data.unlocks.some(u =>
  u.unlockId.startsWith('start_bonus_gold')
);
```

### Show Unlock Progress

```typescript
// Fetch available unlocks with progress
const response = await fetch('/api/unlocks/available', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data } = await response.json();

// Display unlock cards
data.forEach(unlock => {
  console.log(unlock.name);
  console.log(`Progress: ${unlock.progress.percentage}%`);
  console.log(`Earned: ${unlock.earned}`);
});
```

### Unlock Notifications

```typescript
// Check for unclaimed unlocks
const unclaimed = data.unlocks.filter(u => !u.claimed);

if (unclaimed.length > 0) {
  // Show notification
  showUnlockNotification(unclaimed);

  // Claim after user sees them
  for (const unlock of unclaimed) {
    await fetch(`/api/unlocks/${unlock.unlockId}/claim`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}
```

## Database Considerations

### Indexes
The AccountUnlocks model includes indexes on:
- `userId` (unique)
- `unlocks.unlockId`
- `unlocks.earnedAt`
- `unlocks.claimed`
- `stats.totalUnlocks`

### Performance
Active effects are pre-computed and stored in the document to avoid expensive lookups during character creation and gameplay.

### Migration
For existing users, run a sync operation to grant retroactive unlocks:

```typescript
import { syncAllMilestoneUnlocks } from '../services/unlockTrigger.service';

// For each existing user
await syncAllMilestoneUnlocks(userId);
```

## Testing

### Test Unlock Requirements

```typescript
import { checkUnlockEligibility } from '../services/permanentUnlock.service';

const { eligible, progress } = await checkUnlockEligibility(userId, 'portrait_frame_gold');

console.log(`Eligible: ${eligible}`);
console.log(`Progress: ${progress.currentValue}/${progress.requiredValue}`);
```

### Test Unlock Granting

```typescript
import { grantUnlock } from '../services/permanentUnlock.service';

await grantUnlock(userId, 'auto_loot', 'test:manual_grant');
```

### Test Character Slot Limits

```typescript
import { canCreateCharacter, getMaxCharacterSlots } from '../services/permanentUnlock.service';

const maxSlots = await getMaxCharacterSlots(userId);
const canCreate = await canCreateCharacter(userId);

console.log(`Max slots: ${maxSlots}`);
console.log(`Can create: ${canCreate}`);
```

## Future Enhancements

### Premium Unlocks
The system is designed to support premium purchases:

```typescript
// Add premium flag to unlock definition
{
  id: 'premium_portrait_1',
  name: 'Premium Portrait Frame',
  premium: true,
  requirements: {
    type: UnlockRequirementType.PURCHASE,
    purchaseId: 'premium_pack_1',
    premiumCurrency: 500
  }
}
```

### Event-based Unlocks
Limited-time unlocks during special events:

```typescript
import { processEventUnlock } from '../services/unlockTrigger.service';

// During special event
await processEventUnlock(userId, 'founding_period');
```

### Complex Requirements
Combine multiple requirements:

```typescript
requirements: {
  type: UnlockRequirementType.ACHIEVEMENT,
  allOf: [
    { type: UnlockRequirementType.LEGACY_TIER, legacyTier: 5 },
    { type: UnlockRequirementType.DUELS_WON, minValue: 100 }
  ]
}
```

## Troubleshooting

### Unlock Not Granted
1. Check requirement evaluation in service
2. Verify trigger is properly configured
3. Check database for duplicate unlock prevention
4. Verify user meets all requirements

### Character Slot Limit Issues
1. Check AccountUnlocks.activeEffects.totalCharacterSlots
2. Verify legacy tier unlocks are synced
3. Check character count vs. max slots

### Performance Issues
1. Use pre-computed activeEffects instead of recalculating
2. Add database indexes if querying frequently
3. Cache unlock definitions in memory
4. Batch unlock grants during sync operations

## Summary

The Permanent Unlocks system provides:
- **70+ unlocks** across 4 categories
- **Account-wide progression** that persists
- **Automatic triggers** for achievements and milestones
- **Flexible requirement system** for complex unlocking
- **Pre-computed effects** for performance
- **Premium content ready** for future monetization

Integrate at these key points:
- Character creation (apply bonuses)
- Achievement system (trigger unlocks)
- Legacy system (sync unlocks)
- Milestone tracking (grant rewards)
- UI displays (show progress and cosmetics)
