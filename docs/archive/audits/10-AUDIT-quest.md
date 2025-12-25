# Quest System Audit Report

## Overview

**Purpose:** Comprehensive production readiness audit of the Quest System in Desperados Destiny
**Scope:** Quest management, daily contracts, legendary quests, progress tracking, and reward distribution
**Date:** December 14, 2025
**Auditor:** Claude Code (Sonnet 4.5)

### Files Analyzed

**Core Services:**
- `server/src/services/quest.service.ts` (494 lines)
- `server/src/services/dailyContract.service.ts` (861 lines)
- `server/src/services/legendaryQuest.service.ts` (714 lines)

**Models:**
- `server/src/models/Quest.model.ts`
- `server/src/models/DailyContract.model.ts`
- `server/src/models/LegendaryProgress.model.ts`

**Controllers & Routes:**
- `server/src/controllers/quest.controller.ts`
- `server/src/routes/quest.routes.ts`
- `server/src/controllers/dailyContract.controller.ts`
- `server/src/routes/dailyContract.routes.ts`

**Client Integration:**
- `client/src/hooks/useQuests.ts`

**Data Files:**
- `server/src/data/quests/starter-quests.ts` (13 narrative quests)
- `server/src/data/contractTemplates.ts` (67 procedural templates)
- `server/src/data/legendaryQuests/` (6 epic quest chains)

---

## What Works Well

### 1. Transaction Safety for Rewards
**quest.service.ts:325-457**
- Quest completion uses Mongoose transactions properly
- Gold rewards use `GoldService.addGold()` with session parameter
- XP rewards call `character.addExperience()` within transaction
- Inventory updates occur within transaction scope
- Transaction rollback on error with proper try-catch-finally
- Excellent pattern: `session.commitTransaction()` and `session.abortTransaction()`

### 2. Daily Contract System Architecture
**dailyContract.service.ts**
- Seeded RNG for consistent daily generation (lines 88-180)
- Procedural generation from 67 templates across 6 categories
- Transaction-safe reward distribution (lines 263-430)
- Streak tracking with milestone bonuses (lines 349-409)
- Proper date handling with UTC normalization
- Leaderboard aggregation pipeline (lines 315-344)

### 3. Quest State Management
**Quest.model.ts:180-181**
- Compound unique index: `{ characterId: 1, questId: 1 }` prevents duplicate quest acceptance
- Status indexes for efficient queries
- Proper enums for quest types, statuses, and objective types

### 4. Progress Tracking Integration
**QUEST_TRIGGERS_WIRED_PART_A.md**
- Quest triggers integrated into 8+ game systems
- Silently fails with try/catch to prevent blocking game actions (lines 34-42 in quest.service.ts)
- Progressive updates without data loss (lines 280-316)

### 5. Legendary Quest Chain System
**legendaryQuest.service.ts**
- 6 epic quest chains with proper prerequisite checking
- Chain and quest progress tracking via subdocuments
- Proper use of CharacterProgressionService and InventoryService for rewards (lines 517-591)
- Milestone tracking and completion percentage calculations

### 6. Client-Side Hook Architecture
**useQuests.ts**
- Clean separation of concerns
- Proper error handling with logger integration
- State management for available/active/completed quests
- Character refresh on quest completion (line 261)

---

## Critical Issues Found

### CRITICAL: Race Condition in Quest Progress Updates
**File:** `server/src/services/quest.service.ts:280-316`
**Severity:** CRITICAL
**Impact:** Multiple simultaneous actions could cause lost progress or duplicate completions

**Problem:**
```typescript
static async updateProgress(
  characterId: string,
  objectiveType: string,
  target: string,
  amount: number = 1
): Promise<ICharacterQuest[]> {
  const activeQuests = await CharacterQuest.find({
    characterId,
    status: 'active'
  });

  const updatedQuests: ICharacterQuest[] = [];

  for (const quest of activeQuests) {
    let updated = false;

    for (const objective of quest.objectives) {
      if (objective.type === objectiveType && objective.target === target) {
        objective.current = Math.min(objective.current + amount, objective.required);
        updated = true;
      }
    }

    if (updated) {
      await quest.save();  // No transaction, no optimistic locking
      updatedQuests.push(quest);

      const allComplete = quest.objectives.every(obj => obj.current >= obj.required);
      if (allComplete) {
        await this.completeQuest(characterId, quest.questId);  // Separate call
      }
    }
  }

  return updatedQuests;
}
```

**Race Condition Scenarios:**
1. Player kills 2 enemies simultaneously → both trigger `onEnemyDefeated()` → race condition on `objective.current`
2. Player completes multiple objectives at once → could trigger `completeQuest()` multiple times
3. No version checking or atomic updates

**Recommendation:**
- Wrap in transaction
- Use atomic `$inc` operator for progress updates
- Add version field for optimistic locking
- Debounce rapid progress updates

---

### HIGH: Missing Session Parameter in Nested Transaction Calls
**File:** `server/src/services/legendaryQuest.service.ts:517-591`
**Severity:** HIGH
**Impact:** Reward distribution could fail partially without rollback

**Problem:**
```typescript
private static async awardRewards(
  character: ICharacter,
  progress: ILegendaryProgress,
  rewards: LegendaryQuestReward[]
): Promise<void> {
  for (const reward of rewards) {
    switch (reward.type) {
      case 'gold':
        await GoldService.addGold(
          character._id as mongoose.Types.ObjectId,
          reward.amount,
          TransactionSource.QUEST_REWARD,
          { source: 'legendary_quest' }
          // Missing session parameter!
        );
        break;
      case 'experience':
        await CharacterProgressionService.addExperience(
          character._id,
          reward.amount,
          'LEGENDARY_QUEST'
          // Missing session parameter!
        );
        break;
    }
  }
}
```

**Recommendation:**
- Add transaction support to `awardRewards()`
- Pass session to all nested service calls
- Wrap `completeQuest()` and `makeChoice()` in transactions

---

### MEDIUM: Legendary Quest Service Has No Transaction Safety
**File:** `server/src/services/legendaryQuest.service.ts`
**Severity:** MEDIUM
**Impact:** Partial reward grants, inconsistent state

**Problem:**
No use of `mongoose.startSession()` anywhere in the file. Key methods that modify state without transactions:
- `completeQuest()` (lines 419-511)
- `makeChoice()` (lines 352-414)
- `completeObjective()` (lines 280-347)

**Recommendation:**
- Add transaction support to all state-modifying methods
- Ensure atomic updates for multi-step operations

---

### MEDIUM: No Routes/Controllers for Legendary Quest System
**Severity:** MEDIUM
**Impact:** Legendary quests are not accessible via API

**Missing Files:**
- `server/src/controllers/legendaryQuest.controller.ts` - NOT FOUND
- `server/src/routes/legendaryQuest.routes.ts` - NOT FOUND
- No route registration in `server/src/routes/index.ts`

**Current State:**
- Service layer fully implemented (714 lines)
- Data files exist (6 quest chains)
- No API endpoints to access it

**Recommendation:**
- Create controller with endpoints:
  - `GET /api/legendary-quests/chains` - Get available chains
  - `GET /api/legendary-quests/chains/:chainId` - Get chain details
  - `POST /api/legendary-quests/chains/:chainId/start` - Start chain
  - `POST /api/legendary-quests/quests/:questId/complete` - Complete quest
  - `POST /api/legendary-quests/objectives/:objectiveId/complete` - Complete objective
  - `POST /api/legendary-quests/choices/:choiceId` - Make choice
- Create routes file
- Register in index.ts

---

### MEDIUM: Daily Contract Progress Tracking Not Wired to Game Actions
**File:** `server/src/services/dailyContract.service.ts:582-658`
**Severity:** MEDIUM
**Impact:** Contract progress requires manual API calls

**Problem:**
`triggerProgress()` method exists but is not called from any game services. Only accessible via API endpoint.

**Recommendation:**
- Wire into combat.service.ts for combat contracts
- Wire into crime.service.ts for crime contracts
- Wire into shop.service.ts for delivery contracts
- Wire into crafting.service.ts for crafting contracts
- Follow the same pattern as quest.service.ts triggers

---

### LOW: Quest Client Hook Has Non-Existent API Endpoints
**File:** `client/src/hooks/useQuests.ts:216-243, 246-270`
**Severity:** LOW
**Impact:** Client-side quest progress/completion calls will fail

**Missing Routes:**
- `POST /quests/:questId/progress` - NOT FOUND
- `POST /quests/:questId/complete` - NOT FOUND

**Recommendation:**
- Add `updateQuestProgress` controller method
- Add `completeQuest` controller method
- Add routes for these endpoints

---

## Incomplete Implementations

### TODO: World Effect System Not Implemented
**File:** `server/src/services/legendaryQuest.service.ts:596-623`
**Lines:** 603-620
**Severity:** MEDIUM

```typescript
private static async applyWorldEffects(
  character: any,
  effects: LegendaryQuestWorldEffect[]
): Promise<void> {
  for (const effect of effects) {
    switch (effect.type) {
      case 'faction_reputation':
        // TODO: Implement faction reputation system
        break;

      case 'npc_relationship':
        // TODO: Implement NPC relationship system
        break;

      case 'location_unlock':
        // TODO: Implement location unlock system
        break;

      case 'world_state':
        // TODO: Implement world state system
        break;

      case 'quest_unlock':
      case 'quest_lock':
        // TODO: Implement quest availability system
        break;
    }
  }
}
```

**Impact:** Legendary quest choices and completions have no world consequences
**Recommendation:** Implement stubs or remove world effect options from quest data

---

### TODO: Incomplete Prerequisite Checking
**File:** `server/src/services/legendaryQuest.service.ts:79-86`
**Lines:** 79, 85
**Severity:** LOW

```typescript
const playerData = {
  level: character.level,
  completedQuests: [], // TODO: Link to regular quest system
  factionRep: {
    outlaws: character.reputation?.outlaws || 0,
    nahi_coalition: character.reputation?.coalition || 0,
    settlers: character.reputation?.settlers || 0,
  },
  inventory: {}, // TODO: Link to inventory system
};
```

**Impact:** Quest prerequisites cannot check for completed quests or inventory items
**Recommendation:**
- Link to `CharacterQuest.find({ characterId, status: 'completed' })`
- Link to character inventory system

---

### Placeholder Data Used in Daily Contracts
**File:** `server/src/data/contractTemplates.ts:38-125`
**Severity:** LOW

Hardcoded placeholder NPCs, locations, and items:
- 12 NPCs (Sheriff McGraw, Doc Holiday, etc.)
- 12 locations (Saloon, Bank, etc.)
- 12 items (Whiskey, Gold Nuggets, etc.)

**Impact:** Contracts may reference non-existent game entities
**Recommendation:** Validate placeholder data against actual game database or use dynamic lookups

---

## Logical Gaps

### No Validation: Quest Definition vs Character Quest Mismatch
**File:** `server/src/services/quest.service.ts:258-274`
**Severity:** MEDIUM

When accepting a quest, objectives are copied from definition to character quest. But what if the definition changes after acceptance?

**Gap:** No version tracking or validation when completing quests.

**Scenario:**
1. Player accepts quest "Kill 5 bandits"
2. Admin changes quest definition to "Kill 10 bandits"
3. Player completes 5 bandits
4. `completeQuest()` validates against NEW definition (10 required) - fails

**Recommendation:**
- Add `definitionVersion` field to CharacterQuest
- Validate against snapshot, not current definition

---

### No Maximum Active Quest Limit
**File:** `server/src/services/quest.service.ts:215-275`
**Severity:** LOW

Players can accept unlimited quests simultaneously.

**Recommendation:**
- Add `MAX_ACTIVE_QUESTS` constant (e.g., 10)
- Check count before acceptance
- Return appropriate error

---

### No Expiration Handling for Timed Quests
**File:** `server/src/services/quest.service.ts`
**Severity:** MEDIUM

Quests can have `expiresAt` field (line 272), but no automatic expiration:
- No background job to mark expired quests
- No validation during `completeQuest()` to prevent completing expired quests
- No cleanup of expired quests

**Recommendation:**
- Add validation in `completeQuest()`: `if (new Date() > quest.expiresAt) throw new AppError('Quest expired', 400);`
- Create scheduled job to mark expired quests as 'failed'

---

### Abandoned Quests Are Deleted, Not Marked Failed
**File:** `server/src/services/quest.service.ts:463-473`
**Severity:** LOW

**Gap:** No quest history for abandoned quests. Statistics and analytics impossible.

**Recommendation:**
- Change to update: `status: 'abandoned', abandonedAt: new Date()`
- Keep record for player history
- Add to quest schema: `'abandoned'` status enum

---

### Reward Item Validation Missing
**File:** `server/src/services/quest.service.ts:376-389`
**Severity:** MEDIUM

When granting item rewards, no validation that item exists:

**Gap:** Could grant non-existent items, break game economy.

**Recommendation:**
- Validate item exists in item database
- Use InventoryService which likely has validation
- Throw error if item not found

---

### Contract Streak Breaking Logic May Be Incorrect
**File:** `server/src/models/DailyContract.model.ts:266-310`
**Severity:** MEDIUM

**Gap:** What if there's no `yesterdayContract` at all? Player gets streak = 0 even if they completed contracts 2 days ago.

**Scenario:**
- Day 1: Complete contracts (streak = 1)
- Day 2: Player doesn't log in (no record created)
- Day 3: Player logs in → `yesterdayContract` is null → streak = 0

**Recommendation:**
- Look back 2 days to allow for missed days
- Add grace period or streak freeze items

---

## Recommendations

### Priority 1 (Critical - Before Production)

1. **Fix Quest Progress Race Condition** (quest.service.ts:280-316)
   - Implement transaction wrapper
   - Use atomic `$inc` operations
   - Add optimistic locking with version field
   - Estimated effort: 4-6 hours

2. **Add Transaction Safety to Legendary Quest Service** (legendaryQuest.service.ts)
   - Wrap `completeQuest()`, `makeChoice()`, `awardRewards()` in transactions
   - Pass session to nested service calls (GoldService, CharacterProgressionService)
   - Estimated effort: 6-8 hours

3. **Implement Legendary Quest API Layer** (Missing files)
   - Create `legendaryQuest.controller.ts`
   - Create `legendaryQuest.routes.ts`
   - Register routes in index.ts
   - Estimated effort: 4-6 hours

### Priority 2 (High - Before Launch)

4. **Wire Daily Contract Triggers to Game Actions**
   - Integrate `triggerProgress()` into combat, crime, crafting, social systems
   - Follow pattern from quest.service.ts triggers
   - Estimated effort: 3-4 hours

5. **Add Quest Completion Endpoints**
   - `POST /quests/:questId/progress`
   - `POST /quests/:questId/complete`
   - Update quest.controller.ts
   - Estimated effort: 2-3 hours

6. **Implement Quest Expiration Handling**
   - Add validation in `completeQuest()`
   - Create scheduled job for expired quest cleanup
   - Estimated effort: 3-4 hours

### Priority 3 (Medium - Quality of Life)

7. **Add Active Quest Limit**
   - Implement `MAX_ACTIVE_QUESTS` constant
   - Add validation in `acceptQuest()`
   - Estimated effort: 1 hour

8. **Improve Quest Abandonment**
   - Change from delete to status update
   - Keep quest history
   - Estimated effort: 1-2 hours

9. **Implement World Effects System** (legendaryQuest.service.ts:596-623)
   - Complete TODOs for faction reputation, NPC relationships, location unlocks
   - OR: Remove world effects from quest data if not needed
   - Estimated effort: 8-12 hours (full) OR 1 hour (removal)

### Priority 4 (Low - Polish)

10. **Fix Streak Breaking Logic** (DailyContract.model.ts:266-310)
    - Allow 1-2 day grace period
    - Look back multiple days
    - Estimated effort: 2-3 hours

11. **Add Item Validation in Quest Rewards**
    - Validate items exist before granting
    - Estimated effort: 1-2 hours

12. **Link Legendary Quest Prerequisites**
    - Connect to CharacterQuest for completed quest checks
    - Connect to inventory for item checks
    - Estimated effort: 2-3 hours

---

## Risk Assessment

### Overall Risk Level: MEDIUM-HIGH

### Production Readiness: 70%

**Breakdown:**
- **Core Architecture:** 90% - Well-designed, transaction-safe for regular quests
- **Race Conditions:** 40% - Critical issue in progress updates
- **Transaction Safety:** 60% - Good for regular quests, missing for legendary
- **API Completeness:** 65% - Regular quests have API, legendary quests don't
- **Data Quality:** 85% - Good quest content, some placeholder data
- **Integration:** 60% - Quest triggers wired, contract triggers not
- **Error Handling:** 80% - Good try/catch patterns, proper logging

### Critical Blockers for Production:
1. Quest progress race condition MUST be fixed
2. Legendary quest API layer MUST be implemented
3. Transaction safety MUST be added to legendary quest service

### Can Ship With (But Should Fix Soon):
- Daily contract auto-triggers not wired
- Missing client quest endpoints
- Quest expiration not enforced
- World effects not implemented

### Safe to Defer:
- Active quest limits
- Quest abandonment tracking
- Streak grace periods
- Item validation improvements

---

## Summary

The Quest System demonstrates **strong architectural foundations** with excellent transaction safety for regular quests and a sophisticated daily contract generation system. However, **critical race conditions in progress tracking** and **missing transaction safety for legendary quests** pose significant risks for production deployment.

The most urgent issue is the **lack of atomic updates** in `quest.service.ts:updateProgress()`, which could lead to lost progress or duplicate rewards under concurrent load. The legendary quest system is feature-complete on the service layer but **completely inaccessible** due to missing API endpoints.

**Recommended Action:** Address Priority 1 issues (race conditions, legendary quest transactions and API) before production launch. Priority 2 issues should be completed within first sprint post-launch.

**Estimated Effort to Production Ready:** 20-28 hours of development work focused on critical fixes.

**Production Readiness:** 70%
