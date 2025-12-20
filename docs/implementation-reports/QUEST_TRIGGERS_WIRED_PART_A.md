# Quest Triggers Wiring - Part A Complete

## Summary
Successfully wired Quest trigger methods into game action services. Quest progress is now automatically tracked when players perform actions that match quest objectives.

## Changes Made

### 1. Gold Service (`server/src/services/gold.service.ts`)
**Trigger:** `QuestService.onGoldEarned(characterId, amount)`

**Location:** After gold is successfully added in `addGold()` method (line 79-85)

**Implementation:**
```typescript
// Trigger quest progress for gold earned
try {
  await QuestService.onGoldEarned(character._id.toString(), amount);
} catch (questError) {
  // Don't fail gold transaction if quest update fails
  logger.error('Failed to update quest progress for gold earned:', questError);
}
```

**When Triggered:** Every time gold is added to a character's balance through any source.

---

### 2. Character Model (`server/src/models/Character.model.ts`)
**Trigger:** `QuestService.onLevelUp(characterId, newLevel)`

**Location:** Inside `addExperience()` instance method when level increases (lines 530-540)

**Changes:**
- Changed method signature from `void` to `Promise<void>` (line 152)
- Updated method implementation to be async (line 508)
- Added quest trigger when character levels up

**Implementation:**
```typescript
// Trigger quest progress if level increased
if (leveledUp) {
  try {
    // Use dynamic import to avoid circular dependency
    const { QuestService } = await import('../services/quest.service');
    await QuestService.onLevelUp(this._id.toString(), this.level);
  } catch (questError) {
    // Don't fail level up if quest update fails
    console.error('Failed to update quest progress for level up:', questError);
  }
}
```

**When Triggered:** Every time a character gains enough XP to level up.

**Side Effect Updates:** Updated all 9 calls to `addExperience()` throughout the codebase to use `await`:
- `crafting.service.ts` (line 130)
- `combat.service.ts` (line 525)
- `encounter.service.ts` (line 429)
- `location.service.ts` (line 414)
- `actionDeck.service.ts` (lines 228, 259)
- `action.controller.ts` (line 186)
- `quest.service.ts` (line 367)
- `worldEvent.service.ts` (line 405)

---

### 3. Skill Service (`server/src/services/skill.service.ts`)
**Trigger:** `QuestService.onSkillLevelUp(characterId, skillId, newLevel)`

**Location:** After skill training completes and skill level increases (lines 310-318)

**Implementation:**
```typescript
// Trigger quest progress for skill level up
if (leveledUp) {
  try {
    await QuestService.onSkillLevelUp(characterId, training.skillId, training.level);
  } catch (questError) {
    // Don't fail skill completion if quest update fails
    logger.error('Failed to update quest progress for skill level up:', questError);
  }
}
```

**When Triggered:** When skill training completes and the skill gains a level.

---

### 4. Shop Service (`server/src/services/shop.service.ts`)
**Trigger:** `QuestService.onItemCollected(characterId, itemId, quantity)`

**Location:** After successful item purchase (lines 177-183)

**Implementation:**
```typescript
// Trigger quest progress for item collected
try {
  await QuestService.onItemCollected(characterId, itemId, quantity);
} catch (questError) {
  // Don't fail purchase if quest update fails
  console.error('Failed to update quest progress for item purchase:', questError);
}
```

**When Triggered:** When a player purchases an item from the shop.

---

### 5. Crafting Service (`server/src/services/crafting.service.ts`)
**Trigger:** `QuestService.onItemCollected(characterId, itemId, quantity)`

**Location:** After item is successfully crafted (lines 137-143)

**Implementation:**
```typescript
// Trigger quest progress for item collected
try {
  await QuestService.onItemCollected(characterId, recipe.output.itemId, recipe.output.quantity);
} catch (questError) {
  // Don't fail crafting if quest update fails
  logger.error('Failed to update quest progress for crafted item:', questError);
}
```

**When Triggered:** When a player crafts an item through the crafting system.

---

### 6. Combat Service (`server/src/services/combat.service.ts`)
**Trigger:** `QuestService.onItemCollected(characterId, itemId, quantity)`

**Location:** Inside `awardLoot()` method after each item is added to inventory (lines 540-546)

**Implementation:**
```typescript
// Trigger quest progress for item collected
try {
  await QuestService.onItemCollected(character._id.toString(), itemName, 1);
} catch (questError) {
  // Don't fail loot if quest update fails
  logger.error('Failed to update quest progress for combat loot:', questError);
}
```

**When Triggered:** When items are looted from defeated NPCs/enemies.

---

## Already Wired (No Changes Needed)

These triggers were already properly wired in previous work:

- **`onCrimeCompleted`** - In `crime.service.ts`
- **`onLocationVisited`** - In `location.service.ts`
- **`onEnemyDefeated`** - In `combat.service.ts` (line 333)

---

## Not Implemented (Part B - Deferred)

**`onNPCInteraction(characterId, npcId)`** - Requires NPC interaction service which will be handled by parallel agent.

---

## Design Patterns Used

### 1. Error Isolation
All quest triggers are wrapped in try-catch blocks to ensure that quest system failures don't break core game mechanics:
```typescript
try {
  await QuestService.onQuestTrigger(...);
} catch (questError) {
  logger.error('Quest update failed', questError);
}
```

### 2. Circular Dependency Prevention
Character model uses dynamic imports to avoid circular dependencies:
```typescript
const { QuestService } = await import('../services/quest.service');
```

### 3. Transaction Safety
Quest triggers are called AFTER successful transaction commits, ensuring quest progress only updates for successful actions.

---

## Testing Recommendations

### Manual Testing Scenarios

1. **Gold Quest Progress**
   - Create quest requiring "Earn 100 gold"
   - Complete crimes/jobs/combat to earn gold
   - Verify quest progress increases by gold amount earned

2. **Level Up Quest Progress**
   - Create quest requiring "Reach level 5"
   - Award XP through various methods
   - Verify quest completes when character levels up

3. **Skill Level Quest Progress**
   - Create quest requiring "Gunslinger level 3"
   - Train skill to target level
   - Verify quest progress updates on skill level up

4. **Item Collection Quest Progress**
   - Create quest requiring "Collect 5 bandanas"
   - Test acquisition through:
     - Shop purchases
     - Crafting
     - Combat loot
   - Verify all three sources update quest progress

### Integration Testing
- Test multiple quest objectives completing simultaneously
- Verify quest completion triggers when all objectives met
- Confirm quest rewards are granted correctly
- Test with malformed quest data (missing objectives, invalid targets)

---

## Performance Considerations

- Quest updates are async and don't block main game flows
- Failures in quest system are logged but don't halt gameplay
- Quest queries use indexed fields (characterId, status)
- Quest triggers fire only on success (after transaction commits)

---

## Files Modified

1. `server/src/services/gold.service.ts` - Added quest trigger for gold earned
2. `server/src/models/Character.model.ts` - Added quest trigger for level up, made addExperience async
3. `server/src/services/skill.service.ts` - Added quest trigger for skill level up
4. `server/src/services/shop.service.ts` - Added quest trigger for item purchase
5. `server/src/services/crafting.service.ts` - Added quest trigger for crafted items
6. `server/src/services/combat.service.ts` - Added quest trigger for looted items
7. `server/src/services/encounter.service.ts` - Updated addExperience call to await
8. `server/src/services/location.service.ts` - Updated addExperience call to await
9. `server/src/services/actionDeck.service.ts` - Updated addExperience calls to await
10. `server/src/controllers/action.controller.ts` - Updated addExperience call to await
11. `server/src/services/quest.service.ts` - Updated addExperience call to await
12. `server/src/services/worldEvent.service.ts` - Updated addExperience call to await

---

## Compilation Status

TypeScript compilation checked - no new errors introduced. Pre-existing errors in other files remain unchanged.

---

## Next Steps (Part B)

To be handled by parallel agent:
- Wire `onNPCInteraction` trigger when NPC service is implemented
- Add integration tests for quest system
- Create quest seed data for testing
- Implement quest UI notifications
