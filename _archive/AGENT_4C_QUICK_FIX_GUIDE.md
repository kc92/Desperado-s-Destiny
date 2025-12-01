# Agent 4C Quick Fix Guide - Top Priority Files

Based on Agent 4B's work, these are the files with the most remaining errors that should be tackled next.

## Top 20 Files by Error Count

| File | Errors | Primary Issues | Estimated Difficulty |
|------|--------|----------------|---------------------|
| `services/unlockTrigger.service.ts` | 10 | Missing methods, type mismatches | Medium |
| `services/permanentUnlock.service.ts` | 10 | Missing methods, type mismatches | Medium |
| `services/tournamentManager.service.ts` | 9 | Interface mismatches | Medium |
| `services/secrets.service.ts` | 8 | Missing properties | Easy |
| `services/resistance.service.ts` | 8 | Type incompatibilities | Medium |
| `jobs/gossipSpread.job.ts` | 7 | Missing NPC properties | Easy |
| `services/raceSimulation.service.ts` | 6 | Type mismatches | Medium |
| `services/mysteriousFigure.service.ts` | 6 | Missing properties | Easy |
| `services/horseRacing.service.ts` | 5 | Missing shared exports | Easy |
| `services/train.service.ts` | 4 | Type mismatches | Easy |
| `services/stagecoach.service.ts` | 4 | Type mismatches | Easy |
| `services/raceBetting.service.ts` | 4 | Method signatures | Easy |
| `services/legendaryHunt.service.ts` | 4 | Property access | Easy |
| `services/jail.service.ts` | 4 | NotificationService.sendNotification | Easy |
| `jobs/npcGangEvents.ts` | 4 | TaskOptions.scheduled | Medium |

---

## Quick Wins (Est. 30-40 errors, <30 min)

### 1. Fix NotificationService.sendNotification (4 errors)
**File:** `server/src/services/notification.service.ts`

Add missing method:
```typescript
static async sendNotification(
  characterId: string,
  type: string,
  message: string,
  metadata?: any
): Promise<void> {
  // Implementation
}
```

**Fixes:** 4 errors in jail.service.ts

---

### 2. Fix Horse Racing Shared Types (5 errors)
**Files:**
- `shared/src/types/horse.types.ts`
- `server/src/services/horseRacing.service.ts`

Add missing exports to shared:
```typescript
export interface HorseShow {
  // ... definition
}

export interface RaceResultResponse {
  // ... definition
}

export interface ShowResultResponse {
  // ... definition
}
```

**OR** create local interfaces if not needed in shared.

**Fixes:** 5 errors in horseRacing.service.ts

---

### 3. Fix Gossip Job NPC Knowledge (7 errors)
**File:** `server/src/models/NPCKnowledge.model.ts`

Add missing properties:
```typescript
export interface INPCKnowledge extends Document {
  // ... existing properties
  gossipiness: number;  // How likely to spread gossip
  memoryDuration: number;  // How long they remember things
}
```

**Fixes:** 7 errors in gossipSpread.job.ts

---

### 4. Fix GossipService Methods (2 errors)
**File:** `server/src/services/gossip.service.ts`

Add or export missing methods:
```typescript
export class GossipService {
  // ... existing methods

  static async attemptSpread(gossipId: string, npcId: string): Promise<boolean> {
    // Implementation
  }
}
```

**Fixes:** 2 errors in gossipSpread.job.ts

---

### 5. Fix Calendar Interface Methods (2 errors)
**File:** `server/src/models/GameCalendar.model.ts`

Add methods to interface:
```typescript
export interface IGameCalendar extends Document {
  // ... existing properties

  // Methods
  getSeasonForMonth(month: Month): Season;
  calculateMoonPhase(day: number): MoonPhase;
}
```

**Fixes:** 2 errors in calendar.service.ts

---

## Medium Priority (Est. 40-50 errors, 1-2 hours)

### 6. Fix Property Model Schema Issues (~10 errors)
**File:** `server/src/models/Property.model.ts`

Issues:
- PropertyWorker missing `workerType` field
- ProductionSlot missing `recipeId` field
- PropertyStatus enum missing values ('abandoned', 'foreclosed')

Add to schema:
```typescript
const PropertyWorkerSchema = new Schema({
  // ... existing fields
  workerType: { type: String, enum: ['MANAGER', 'LABORER', 'CRAFTSMAN'] }
});

const ProductionSlotSchema = new Schema({
  // ... existing fields
  recipeId: { type: String }
});

export enum PropertyStatus {
  // ... existing values
  ABANDONED = 'abandoned',
  FORECLOSED = 'foreclosed'
}
```

---

### 7. Fix Bounty Model Methods (~5 errors)
**File:** `server/src/models/Bounty.model.ts`

Add missing method/property:
```typescript
export interface IBounty extends Document {
  // ... existing properties
  isActive: boolean;

  // Methods
  canBeCollectedBy(characterId: string): boolean;
}
```

---

### 8. Fix Tournament Manager (~9 errors)
**File:** `server/src/services/tournamentManager.service.ts`

Likely needs:
- Model interface updates
- Method signature fixes
- Type assertions for ObjectId

---

### 9. Fix Unlock Services (~20 errors)
**Files:**
- `services/unlockTrigger.service.ts`
- `services/permanentUnlock.service.ts`

Likely needs:
- Model method definitions
- Type compatibility fixes
- Interface updates

---

## Pattern-Based Fixes

### ObjectId Type Assertion Pattern
When you see: `Argument of type 'ObjectId' is not assignable`

Fix with:
```typescript
// Before
someFunction(document._id)

// After
someFunction(document._id.toString())
// OR
someFunction(document._id as any)
```

---

### Missing Method Pattern
When you see: `Property 'methodName' does not exist`

1. Check if method is defined in implementation
2. If yes, add to interface:
```typescript
export interface IModelName extends Document {
  methodName(param: Type): ReturnType;
}
```
3. If no, implement the method

---

### Enum Value Missing Pattern
When you see: `Type '"value"' is not assignable to type 'EnumName'`

Add to enum:
```typescript
export enum EnumName {
  // ... existing values
  NEW_VALUE = 'new_value'
}
```

---

## Testing Strategy

After each fix batch:

1. **Compile**
   ```bash
   cd server && npx tsc --noEmit
   ```

2. **Count errors**
   ```bash
   npx tsc --noEmit 2>&1 | wc -l
   ```

3. **Check error types**
   ```bash
   npx tsc --noEmit 2>&1 | grep -E "TS[0-9]+" -o | sort | uniq -c | sort -rn
   ```

4. **Verify no regressions**
   - Ensure error count only decreases
   - Check that fixed files don't reappear in error list

---

## Goal

Reduce from **216 errors** to **<100 errors** by fixing:
- ✅ All quick wins (20-30 errors)
- ✅ Most medium priority (40-50 errors)
- 🎯 Target: **~130 errors remaining** for Agent 4D

---

**Created by:** Agent 4B
**For:** Agent 4C (Next in sequence)
**Date:** 2025-11-26
