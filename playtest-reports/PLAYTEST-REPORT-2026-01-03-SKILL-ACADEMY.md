# Skill Academy Playtest Report
**Date:** 2026-01-03
**Tester:** Claude (Autonomous Playtest)
**Test Account:** playtest-full@desperados.dev
**Character:** FullPlaytestHero (Settler Alliance, TL 27, CL 1)

---

## Executive Summary

**Overall Status:** PARTIAL SUCCESS - Visit objectives fixed, combat/skill objectives blocked

| Metric | Value |
|--------|-------|
| Bugs Fixed | 1 (BUG-010) |
| New Bugs Found | 2 (BUG-011, BUG-012) |
| Visit Objectives | WORKING |
| Skill Objectives | BLOCKED |
| Kill Objectives | BLOCKED |

---

## Bug Report

### BUG-010: NPC Interaction Not Triggering Quest Progress [FIXED]

**Severity:** Critical (Blocking)
**Status:** FIXED
**Phase:** Skill Academy - All Quests

**Description:**
Clicking on an NPC in the Location page opened a modal but did NOT call the server API to register the interaction. This meant 'visit' type quest objectives never completed.

**Root Cause:**
In `client/src/pages/Location.tsx`, the NPC modal was purely client-side state (`setSelectedNPC(npc)`). It displayed NPC info but never called `npcService.interactWithNPC(npcId)`.

**Fix Applied:**
Added a `useEffect` hook at line 390-399 that calls the NPC interaction API when an NPC is selected:

```typescript
// Trigger NPC interaction API when an NPC is selected
// This updates quest progress for 'visit' type objectives
useEffect(() => {
  if (selectedNPC && location?._id) {
    npcService.interactWithNPC(selectedNPC.id).catch((err) => {
      // Silently handle - low energy or other errors shouldn't block modal
      logger.debug('NPC interaction failed (possibly low energy)', { error: err.message });
    });
  }
}, [selectedNPC, location?._id]);
```

**Verification:**
- Clicked on Iron Jack Thornwood at Desperados Academy
- Quest Log updated: "Meet Iron Jack at the Combat Yard" changed from 0/1 to 1/1
- Energy deducted: 150 -> 148 (2 energy for NPC interaction)

---

### BUG-011: Training Dummies Not Fightable [CRITICAL]

**Severity:** Critical (Blocking)
**Status:** OPEN
**Phase:** Skill Academy - Combat Quests

**Description:**
Training dummies exist as NPCs at the Academy but cannot be fought. They appear in "People Here" section with just dialogue - no "Fight", "Attack", or "Train" button.

**Quest Impact:**
All combat skill quests have objectives like "Defeat training dummies 0/3" which cannot be completed.

**Root Cause:**
In `server/src/data/locations/skill-academy.ts`, the training dummy is defined as a regular NPC:
```typescript
{
  id: 'training-dummy',
  name: 'Training Dummy',
  title: 'Combat Training Target',
  description: '...',
  isVendor: false,
  // Missing: role: 'training' or isTrainable: true
}
```

There's no mechanism to initiate combat with training objects.

**Fix Required:**
1. Add `role: 'training'` or `isTrainable: true` to training NPCs
2. Modify Location.tsx to show "Train" button for training-type NPCs
3. Implement training combat system that:
   - Creates simplified combat encounter (player always wins)
   - Awards quest progress via `QuestService.onEnemyDefeated(characterId, 'training-dummy')`
   - Costs energy but grants skill XP

---

### BUG-012: Skill Practice Objectives Have No Mechanism [CRITICAL]

**Severity:** Critical (Blocking)
**Status:** OPEN
**Phase:** Skill Academy - All Skill Quests

**Description:**
Quest objectives with `type: 'skill'` and targets like `skill:melee_combat` have no way to be completed. There's no UI action that triggers skill usage for quest progress.

**Quest Impact:**
All 27 academy quests have "Practice [skill] basics" objectives that cannot be completed.

**Root Cause:**
The quest system has `QuestService.onSkillUsed()` method but nothing calls it. Skills are trained passively via the Skills page, but there's no "practice" action that counts toward quest objectives.

**Fix Required:**
1. Add "Practice" actions to the Academy location (or add to Available Actions)
2. When a practice action is performed, call `QuestService.onSkillUsed(characterId, skillId, 1)`
3. Alternatively, tie skill quest objectives to existing training actions

---

## What Works (Verified Functional)

### 1. NPC Visit Objectives
- Clicking NPC now triggers server API call
- Quest progress updates for 'visit' type objectives
- Energy is properly deducted (2 energy per interaction)
- Trust system works (trust increases on interaction)

### 2. Academy Location
- All 4 mentors present: Iron Jack, Silk Viola, Walking Moon, Gus Hornsby
- All 7 training objects present: Training Dummy, Hidden Target, Practice Mannequin, etc.
- Academy connected to Red Gulch (2 energy travel cost)
- Jobs available: Academy Assistant, Repair Training Dummies

### 3. Quest System Core
- Quests display correctly in Quest Log
- Active/Available/Completed tabs work
- Quest details modal shows objectives, progress, rewards
- Objective progress persists across page navigation

---

## Systemic Analysis

### Quest Objective Type Support

| Type | Status | Mechanism |
|------|--------|-----------|
| `visit` | WORKING | NPC interaction API triggers progress |
| `skill` | BROKEN | No action triggers skill usage |
| `kill` | BROKEN | No combat with training NPCs |
| `collect` | UNTESTED | Item collection likely works |

### Academy Quests by Objective Blockage

| Category | Quests | Visit | Skill | Kill | Completable |
|----------|--------|-------|-------|------|-------------|
| Combat (Jack) | 5 | All work | All blocked | All blocked | 0/5 |
| Cunning (Viola) | 8 | All work | All blocked | Some blocked | 0/8 |
| Spirit (Moon) | 6 | All work | All blocked | None | 0/6 |
| Craft (Gus) | 8 | All work | All blocked | None | 0/8 |

---

## Recommendations

### Priority 1: Training Combat System

1. **Add training NPC role**
   ```typescript
   role: 'training'
   isTrainable: true
   trainingSkill: 'melee_combat'
   difficulty: 1
   ```

2. **Add "Train" button to NPC modal**
   - Show for NPCs with `role: 'training'`
   - Opens training combat interface

3. **Implement training combat**
   - Simplified card game (always winnable)
   - Awards skill XP on completion
   - Triggers `QuestService.onEnemyDefeated()`

### Priority 2: Skill Practice Actions

1. **Add practice actions to Academy**
   - One action per skill category
   - Energy cost: 5-10
   - Reward: Small skill XP + quest progress

2. **Hook into quest system**
   - Call `QuestService.onSkillUsed()` on practice completion

### Priority 3: Polish

1. **Quest objective hints**
   - Show "Go to Academy to practice" for skill objectives
   - Show "Attack Training Dummy" for kill objectives

2. **Progress indicators**
   - Visual feedback when objective updates
   - Toast notification on objective completion

---

## Files Modified

| File | Change |
|------|--------|
| `client/src/pages/Location.tsx` | Added NPC interaction useEffect (lines 390-399) |
| (import added) | Added `npcService` import (line 15) |

---

## Test Environment

| Component | Status |
|-----------|--------|
| Server | Running (nodemon) |
| Client | Vite dev server (localhost:5173) |
| Database | MongoDB (connected, freshly seeded) |
| Browser | Chrome (DevTools MCP) |
| Test Duration | ~30 minutes |

---

## Conclusion

**Progress Made:**
- Fixed critical BUG-010: Visit objectives now work correctly
- Verified Academy location has all required NPCs and training objects
- Confirmed quest system core functionality is solid

**Remaining Blockers:**
- BUG-011: Training dummies need combat interface
- BUG-012: Skill practice actions need implementation

**Estimated Work to Complete Academy:**
- Training combat system: 2-3 hours
- Skill practice actions: 1-2 hours
- Testing and polish: 1 hour
- **Total: 4-6 hours**

**Critical Path:**
1. Implement training combat for dummies
2. Add practice actions per skill
3. Re-run playtest to verify all 27 quests completable

---

*Report generated by autonomous playtest using Chrome DevTools MCP*
