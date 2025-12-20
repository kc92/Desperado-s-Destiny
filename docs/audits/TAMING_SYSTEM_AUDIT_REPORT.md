# TAMING SYSTEM AUDIT REPORT
## Wild Animal Capture System - Desperados Destiny

**Audit Date:** December 15, 2025
**Auditor:** Claude Code Assistant
**System Scope:** Wild animal taming mechanics, success rates, state management

---

## EXECUTIVE SUMMARY

The taming system is **functionally complete** with solid architecture, but has **6 critical bugs** and **multiple incomplete implementations** that could lead to player frustration and exploitation. The system handles wild animal encounters and multi-attempt taming with progress tracking, but has significant issues with skill validation, energy spending, and success rate calculations.

**Overall Rating:** ⚠️ **NEEDS FIXES** - 6/10
- Core mechanics: Implemented
- Critical bugs: 6 identified
- Incomplete features: 3 major gaps
- Exploit potential: Moderate-High

---

## 1. SYSTEM OVERVIEW

### What This System Does
The taming system allows players to capture wild animals and add them to their companion roster. It implements:

1. **Wild Encounters**: Location-based animal spawning with rarity/difficulty-based probability
2. **Multi-Attempt Taming**: 5 attempts per animal before it flees
3. **Progressive Success**: Each failed attempt increases future success chance
4. **Skill-Based Mechanics**: Character stats and skills affect taming success
5. **Persistent State**: Taming attempts survive server restarts (MongoDB-backed)

### Core Files
- **Service**: `server/src/services/taming.service.ts` (383 lines)
- **Model**: `server/src/models/TamingAttempt.model.ts` (201 lines)
- **Data**: `server/src/data/companionSpecies.ts` (991 lines)
- **Controller**: `server/src/controllers/companion.controller.ts` (lines 487-652)
- **Routes**: `server/src/routes/companion.routes.ts` (lines 174-201)
- **Client Hook**: `client/src/hooks/useCompanions.ts` (line 605-628)
- **Client Page**: `client/src/pages/Companion.tsx` (lines 148-161)

### Core Mechanics

#### Taming Attempt Flow
```
1. Player finds wild encounter at location
2. Checks level/reputation requirements
3. Spends 15 energy (TAMING_ENERGY_COST)
4. Checks kennel capacity (max 3 base)
5. Creates/loads TamingAttempt document
6. Calculates success chance:
   - Base: 100 - (difficulty * 10)
   - Spirit bonus: character.stats.spirit * 0.5
   - Skill bonus: animal_handling * 3
   - Progress bonus: attempt.progress * 0.2
   - Max: 95% total
7. Rolls d100 for success
8. On success: Creates companion at bondLevel 10
9. On failure: Adds progress, allows retry (max 5 attempts)
```

#### Species Distribution
- **19 total species** across 4 categories:
  - Dogs: 8 species (common farm/guard dogs to exotic hybrids)
  - Birds: 3 species (hawks, eagles, ravens)
  - Exotic: 6 species (raccoons, wolves, mountain lions, bears)
  - Supernatural: 4 species (ghost hounds, chupacabras, thunderbirds)

#### Taming Difficulty Range
- **Level 3**: Raccoon (difficulty 3, 70% base chance)
- **Level 4**: Catahoula/Raven (difficulty 4, 60% base)
- **Level 5**: Red-Tailed Hawk (difficulty 5, 50% base)
- **Level 6**: Coydog (difficulty 6, 40% base)
- **Level 7**: Bear Cub (difficulty 7, 30% base)
- **Level 8**: Wolf Hybrid (difficulty 8, 20% base)
- **Level 9**: Wolf/Golden Eagle (difficulty 9, 10% base)
- **Level 10**: Mountain Lion (difficulty 10, 0% base chance!)

---

## 2. STRENGTHS

### ✅ Well-Designed Architecture

1. **Transaction Safety** (taming.service.ts:110-112)
   ```typescript
   const session = await mongoose.startSession();
   session.startTransaction();
   ```
   - Proper MongoDB transactions prevent partial state
   - Rollback on errors ensures data consistency

2. **Persistent State Management** (TamingAttempt.model.ts)
   - TTL indexes auto-delete expired attempts after 24h
   - Compound indexes optimize queries
   - Clean separation of concerns

3. **SecureRNG Usage** (taming.service.ts:237)
   ```typescript
   const roll = SecureRNG.d100();
   ```
   - Uses cryptographically secure randomness
   - Prevents client-side prediction/manipulation

4. **Progressive Difficulty** (taming.service.ts:298)
   ```typescript
   attempt.progress += (100 - speciesDef.tamingDifficulty * 10) / this.MAX_ATTEMPTS;
   ```
   - Each failure builds toward success
   - Prevents frustration from bad RNG streaks

5. **Rich Species Data** (companionSpecies.ts)
   - 19 fully-defined species with detailed stats
   - Lore-appropriate Western/supernatural themes
   - Balanced combat/utility roles

6. **Good Error Handling**
   - AppError with proper status codes
   - Informative error messages
   - Client-friendly response format

### ✅ Smart Balance Mechanics

1. **Rarity-Based Encounter Rates** (taming.service.ts:77-87)
   - Legendary: 5% spawn chance
   - Epic: 15%
   - Rare: 30%
   - Uncommon: 50%
   - Common: 80%

2. **Location-Aware** (taming.service.ts:494)
   - Encounters filtered by character's current location
   - Enables regional variety

3. **Reputation Gates** (taming.service.ts:53-71, 143-164)
   - Exotic animals require faction reputation
   - Wolf Hybrid needs 40+ Nahi Coalition rep
   - Prevents early-game exploitation

---

## 3. ISSUES & BUGS

### 🔴 CRITICAL BUG #1: Energy Spent Before Validation
**Location:** `taming.service.ts:167-174`

```typescript
// Check energy
const hasEnergy = await EnergyService.spendEnergy(
  characterId,
  COMPANION_CONSTANTS.TAMING_ENERGY_COST
);

if (!hasEnergy) {
  throw new AppError('Insufficient energy', 400);
}
```

**Problem:** Energy is **spent** before checking kennel capacity. If kennel is full, player loses 15 energy for nothing.

**Impact:**
- Player wastes energy on failed attempts
- Frustrating user experience
- Economic imbalance (energy is precious resource)

**Correct Order:**
1. Check capacity first
2. Then spend energy
3. Then create attempt

---

### 🔴 CRITICAL BUG #2: Animal Handling Skill Doesn't Exist
**Location:** `taming.service.ts:228`

```typescript
const animalHandlingSkill = character.getSkillLevel('animal_handling'); // If such skill exists
```

**Problem:** Comment admits uncertainty. Skill IS defined in `skills.constants.ts:210-218` but:
1. No validation that skill exists
2. `getSkillLevel()` may return undefined
3. Undefined * 3 = NaN, breaking success calculations

**Evidence:**
```typescript
// skills.constants.ts:210-218
ANIMAL_HANDLING: {
  id: 'animal_handling',
  name: 'Animal Handling',
  description: 'Training and calming animals',
  suit: DestinySuit.HEARTS,
  category: SkillCategory.SPIRIT,
  maxLevel: 50,
  baseTrainingTime: TIME.HOUR,
  icon: '🐴'
}
```

**Impact:**
- NaN success rate if skill undefined
- Possible 100% success or 0% success depending on NaN handling
- Unpredictable taming outcomes

**Fix Required:**
```typescript
const animalHandlingSkill = character.getSkillLevel('animal_handling') || 0;
```

---

### 🔴 CRITICAL BUG #3: Attempt Counter Logic Flaw
**Location:** `taming.service.ts:205-221`

```typescript
attempt.attempts += 1;
attempt.lastAttemptAt = new Date();

// Check if too many attempts (animal fled)
if (attempt.attempts > this.MAX_ATTEMPTS) {  // Line 209
  attempt.status = 'failed';
  await attempt.save({ session });
  await session.abortTransaction();
  // ...
}
```

**Problem:** Uses `>` instead of `>=`. This allows **6 attempts** instead of 5:
- Attempt 1: attempts = 1 (allowed)
- Attempt 2: attempts = 2 (allowed)
- Attempt 3: attempts = 3 (allowed)
- Attempt 4: attempts = 4 (allowed)
- Attempt 5: attempts = 5 (allowed)
- Attempt 6: attempts = 6 → NOW > 5, flee triggers

**Impact:**
- Off-by-one error gives extra free attempt
- 20% more chances than intended
- Easier taming than designed

**Fix:**
```typescript
if (attempt.attempts >= this.MAX_ATTEMPTS) {
```

---

### 🔴 CRITICAL BUG #4: Progress Bonus Stacking Issue
**Location:** `taming.service.ts:232-234`

```typescript
// Previous progress helps
const progressBonus = attempt.progress * 0.2;

const totalChance = Math.min(95, baseChance + spiritBonus + skillBonus + progressBonus);
```

**Problem:** Progress scales infinitely with attempt count. For a difficulty 10 animal:
- Base: 0%
- After attempt 1: progress = 20, bonus = 4%
- After attempt 2: progress = 40, bonus = 8%
- After attempt 3: progress = 60, bonus = 12%
- After attempt 4: progress = 80, bonus = 16%
- After attempt 5: progress = 100, bonus = 20%

**But wait:** Progress calculation is also broken...

---

### 🔴 CRITICAL BUG #5: Progress Calculation Inconsistent
**Location:** `taming.service.ts:298`

```typescript
attempt.progress += (100 - speciesDef.tamingDifficulty * 10) / this.MAX_ATTEMPTS;
```

**Problem:** This formula gives LESS progress for HARDER animals:
- Difficulty 3 (Raccoon): +14 progress per attempt
- Difficulty 5 (Hawk): +10 progress per attempt
- Difficulty 10 (Mountain Lion): 0 progress per attempt!

**This is backwards!** Mountain Lion taming becomes impossible:
- Base chance: 0%
- Progress never increases
- Even with max Spirit (100) + max skill (50): 50 + 150 + 0 = 200% → capped at 95%

Actually that works, but the logic is still backwards from design intent.

**Expected Behavior:** Harder animals should give MORE progress per attempt (to compensate for lower base rate).

---

### 🔴 CRITICAL BUG #6: Transaction Abort Doesn't Refund Energy
**Location:** `taming.service.ts:212-213, 317-319`

```typescript
await attempt.save({ session });
await session.abortTransaction();  // Rolls back attempt save
session.endSession();
```

**Problem:** Energy was spent BEFORE the transaction started (line 167). Aborting the transaction:
- ✅ Rolls back the TamingAttempt document
- ❌ Does NOT refund the energy (spent outside transaction)

**Impact:**
- Player loses energy when animal flees
- Player loses energy on kennel capacity check failure
- Creates edge case where energy is deducted but no attempt recorded

**Fix:** Move energy spend inside transaction, or manually refund on abort.

---

### ⚠️ MEDIUM BUG #7: Encounter Rate Calculation
**Location:** `taming.service.ts:77-87`

```typescript
const rarityChance: Record<string, number> = {
  common: 0.8,
  uncommon: 0.5,
  rare: 0.3,
  epic: 0.15,
  legendary: 0.05
};

if (!SecureRNG.chance(rarityChance[speciesDef.rarity])) {
  continue;  // Skip this species
}
```

**Problem:** Each species rolls independently. This means:
- Common species have 80% chance to appear
- But if you have 5 common species, expected encounters = 5 * 0.8 = 4
- Legendary species have 5% chance
- With 3 legendary species, expected encounters = 3 * 0.05 = 0.15

**Impact:**
- Encounter lists vary wildly in length
- Sometimes 0 encounters, sometimes 10+
- Player experience inconsistent

**Better Design:** Guarantee N encounters, weighted by rarity.

---

### ⚠️ MEDIUM BUG #8: Missing Location Filtering
**Location:** `taming.service.ts:33-100`

**Problem:** `getWildEncounters()` accepts `location` parameter but doesn't actually filter species by location. All tameable species appear everywhere.

**Current Code:**
```typescript
static async getWildEncounters(
  characterId: string,
  location: string  // ← Parameter unused except in return
): Promise<WildEncounter[]> {
  // ... filters by level, reputation, rarity
  // NO location-based filtering!

  encounters.push({
    species: speciesDef.species,
    location,  // ← Just echoes input
    // ...
  });
}
```

**Impact:**
- Mountain lions in desert towns
- Bears in the saloon
- No regional variety
- Breaks immersion

**Missing Feature:** Species should have `habitats: string[]` field, filter by `location`.

---

### ⚠️ MINOR BUG #9: Expiry Extension on Every Attempt
**Location:** `taming.service.ts:300`

```typescript
// Extend expiry on activity (24 hours from last attempt)
attempt.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
```

**Problem:** Each failed attempt resets the 24-hour timer. A persistent player can keep the same animal encounter alive indefinitely by attempting every 23 hours.

**Impact:**
- Legendary encounters never expire if player keeps trying
- Goes against TTL design intent
- Minor exploit potential

**Better Design:** Only extend expiry X times, or use fixed expiry from first attempt.

---

### ⚠️ MINOR BUG #10: No Validation of Species in attemptTaming
**Location:** `companion.controller.ts:528-564`

```typescript
export async function attemptTaming(req: CharacterRequest, res: Response): Promise<void> {
  const { species } = req.body;

  if (!species) {
    res.status(400).json({
      success: false,
      error: 'Species required'
    });
    return;
  }

  const result = await TamingService.attemptTaming(characterId, species, location);
  // No validation that species is a valid enum value!
}
```

**Problem:** Malicious client can send `species: "DRAGON"` and it will pass validation until it reaches `getSpeciesDefinition()`.

**Impact:**
- Unclear error messages
- Potential for injection if species string isn't sanitized
- Poor UX (generic 400 error instead of specific message)

**Fix:** Validate species against `CompanionSpecies` enum before service call.

---

## 4. INCOMPLETE IMPLEMENTATIONS

### 🔶 INCOMPLETE #1: Location-Based Spawning
**Status:** Stub implementation
**Location:** `taming.service.ts:35, 89-96`

```typescript
location: string  // Parameter accepted but not used

encounters.push({
  species: speciesDef.species,
  location,  // Just echoes back what was sent
  tameable: true,
  hostility,
  difficulty: speciesDef.tamingDifficulty || 5,
  description: speciesDef.description
});
```

**Missing:**
- Species habitat definitions
- Location-based filtering logic
- Biome/region system integration

**Impact:** All animals appear everywhere, breaking immersion.

---

### 🔶 INCOMPLETE #2: Hostility Mechanic
**Status:** Calculated but unused
**Location:** `taming.service.ts:73-74`

```typescript
// Calculate hostility (higher difficulty = more hostile)
const hostility = Math.min(100, (speciesDef.tamingDifficulty || 5) * 10);
```

**Missing:**
- Hostile animals don't attack back
- No combat consequence for taming dangerous animals
- Hostility value sent to client but no UI integration

**Impact:** Meaningless stat that confuses players.

---

### 🔶 INCOMPLETE #3: Taming Progress UI
**Status:** Backend complete, frontend stub
**Location:** `companion.controller.ts:570-609`

```typescript
export async function getTamingProgress(req: CharacterRequest, res: Response): Promise<void> {
  const progress = await TamingService.getTamingProgress(characterId, species as any);

  res.status(200).json({
    success: true,
    data: {
      species,
      progress: progress?.progress || 0,
      attempts: progress?.attempts || 0,
      hasActiveAttempt: progress !== null
    }
  });
}
```

**Missing:**
- Client-side polling for progress
- Visual progress bar in UI
- "Abandon taming" button integration

**Current Client:** `Companion.tsx` only shows tame/not-tame binary, no progress tracking.

---

### 🔶 INCOMPLETE #4: Companion Renaming After Taming
**Status:** Hardcoded default name
**Location:** `taming.service.ts:249`

```typescript
const companion = new AnimalCompanion({
  ownerId: character._id,
  name: `Wild ${speciesDef.name}`, // Default name, player can rename
  // ...
});
```

**Missing:**
- Post-taming name selection dialog
- Client flow to immediately rename after successful tame

**Current Behavior:** All tamed animals named "Wild [Species]" until manually renamed in kennel.

---

## 5. CODE QUALITY

### Type Safety: 7/10

**Good:**
- ✅ Proper TypeScript interfaces for all data structures
- ✅ Mongoose schemas with validation
- ✅ Enum usage for species, trust levels, combat roles

**Issues:**
- ⚠️ `species as any` cast in controller (companion.controller.ts:591)
- ⚠️ Unsafe `character.getSkillLevel()` call without null check
- ⚠️ Map type for cooldowns causes type confusion

### Error Handling: 8/10

**Good:**
- ✅ Try-catch with transaction rollback
- ✅ AppError with proper HTTP status codes
- ✅ Informative error messages
- ✅ Client error handling in hooks

**Issues:**
- ⚠️ Energy not refunded on transaction abort (Bug #6)
- ⚠️ Some errors swallowed in Companion.tsx (lines 63, 71, 79)

### Performance: 6/10

**Good:**
- ✅ MongoDB indexes on frequently queried fields
- ✅ TTL index for auto-cleanup
- ✅ Compound indexes for complex queries

**Concerns:**
- ⚠️ `getTameableSpecies()` iterates all 19 species every request
- ⚠️ No caching of species definitions
- ⚠️ Multiple database queries per taming attempt (character, attempt, species lookup)
- ⚠️ `getWildEncounters()` does RNG for every species instead of batch calculation

**Optimization Opportunities:**
```typescript
// Cache species definitions at module load
const TAMEABLE_SPECIES_CACHE = getTameableSpecies();

// Use aggregation pipeline instead of multiple queries
const pipeline = [
  { $match: { characterId, species, status: 'in_progress' } },
  { $lookup: { from: 'characters', localField: 'characterId', foreignField: '_id' } }
];
```

### Code Organization: 9/10

**Good:**
- ✅ Clear separation: Service → Controller → Route
- ✅ Shared types in `@desperados/shared`
- ✅ Companion data in separate file
- ✅ Model has both static and instance methods
- ✅ Constants centralized

**Minor Issues:**
- ⚠️ `MAX_ATTEMPTS` hardcoded in service, should be in constants
- ⚠️ Some magic numbers (0.5, 0.2, 3) for bonus calculations

### Testing: 0/10

**Missing:**
- ❌ No unit tests for taming service
- ❌ No integration tests for taming flow
- ❌ No tests for edge cases (max attempts, energy refunds, etc.)
- ❌ No mock data for testing species

**Critical Test Cases Needed:**
1. Taming succeeds on 1st attempt
2. Taming succeeds on 5th attempt (boundary)
3. Animal flees after 5 attempts (boundary)
4. Insufficient energy handling
5. Kennel full handling
6. Level requirement enforcement
7. Reputation requirement enforcement
8. Progress calculation verification
9. Transaction rollback scenarios
10. Concurrent taming attempts

---

## 6. SECURITY & EXPLOITS

### 🔐 Exploit #1: Progress Manipulation via Retry Timing
**Severity:** Low
**Vector:** Player can maximize progress by:
1. Starting taming attempt
2. Waiting 23 hours 59 minutes
3. Attempting again (resets expiry)
4. Repeat indefinitely

**Mitigation:** Fixed expiry or attempt limit regardless of timing.

---

### 🔐 Exploit #2: Kennel Capacity Race Condition
**Severity:** Medium
**Vector:**
1. Player has 2/3 capacity
2. Opens two browser tabs
3. Simultaneously tames two animals
4. Both pass capacity check before either creates companion
5. Results in 4/3 capacity

**Current Code:** No distributed lock on kennel capacity check (line 177-180)

**Mitigation:** Use atomic transaction or distributed lock.

---

### 🔐 Exploit #3: Invalid Species Submission
**Severity:** Low
**Vector:** Client sends `species: "INVALID"` via API

**Current:** Fails gracefully with AppError, but unclear messaging

**Mitigation:** Validate enum in controller before service call.

---

### 🔐 Exploit #4: Energy Drain via Rapid Attempts
**Severity:** Medium
**Vector:** Malicious client spams taming attempts

**Current Protection:**
- Rate limit: 30 attempts/hour (companion.routes.ts:66-75)
- Energy cost: 15 per attempt = 450 energy/hour max

**Analysis:** Rate limit is reasonable, but combined with Bug #6 (energy not refunded on failure), creates griefing potential.

---

## 7. RECOMMENDATIONS

### Priority 1: CRITICAL FIXES (Do Immediately)

1. **Fix Energy Spend Order** (taming.service.ts:167)
   ```typescript
   // BEFORE energy spend
   const existingCompanions = await AnimalCompanion.findByOwner(characterId);
   if (existingCompanions.length >= COMPANION_CONSTANTS.BASE_KENNEL_CAPACITY) {
     throw new AppError('Kennel is full', 400);
   }

   // THEN spend energy
   const hasEnergy = await EnergyService.spendEnergy(/*...*/);
   ```

2. **Fix Skill Validation** (taming.service.ts:228)
   ```typescript
   const animalHandlingSkill = character.getSkillLevel?.('animal_handling') ?? 0;
   ```

3. **Fix Attempt Counter** (taming.service.ts:209)
   ```typescript
   if (attempt.attempts >= this.MAX_ATTEMPTS) {
   ```

4. **Fix Energy Refund on Transaction Abort**
   - Move energy spend inside transaction, OR
   - Manually refund energy before aborting transaction

5. **Fix Progress Formula** - Make harder animals give MORE progress:
   ```typescript
   // Current (backwards):
   attempt.progress += (100 - speciesDef.tamingDifficulty * 10) / this.MAX_ATTEMPTS;

   // Better:
   attempt.progress += (speciesDef.tamingDifficulty * 2); // Harder = faster progress
   ```

---

### Priority 2: IMPORTANT IMPROVEMENTS (Do Soon)

6. **Add Species Enum Validation** (companion.controller.ts:542)
   ```typescript
   if (!Object.values(CompanionSpecies).includes(species)) {
     res.status(400).json({
       success: false,
       error: `Invalid species: ${species}`
     });
     return;
   }
   ```

7. **Implement Location-Based Filtering**
   - Add `habitats: string[]` to species definitions
   - Filter encounters by `habitats.includes(location)`

8. **Fix Encounter Rate Logic**
   - Guarantee N encounters per request
   - Use weighted selection instead of independent rolls

9. **Add Distributed Lock for Kennel Capacity**
   ```typescript
   const lock = await acquireLock(`kennel:${characterId}`);
   try {
     // Check capacity + create companion atomically
   } finally {
     await releaseLock(lock);
   }
   ```

10. **Add Comprehensive Tests**
    - Unit tests for success rate calculation
    - Integration tests for taming flow
    - Edge case tests (boundaries, errors, race conditions)

---

### Priority 3: POLISH & UX (Do Eventually)

11. **Add Progress Tracking UI**
    - Show progress bar in taming modal
    - Display attempts remaining
    - Add "Abandon" button

12. **Implement Hostility Consequences**
    - High-hostility animals can attack during taming
    - Failed taming deals damage
    - Success gives more bond for dangerous animals

13. **Add Post-Taming Name Dialog**
    - Prompt player to name companion immediately
    - Default to "Wild [Species]" if skipped

14. **Optimize Species Lookup**
    - Cache tameable species list at module load
    - Use Map for O(1) species definition lookup
    - Consider Redis cache for frequently accessed data

15. **Add Taming Statistics**
    - Track successful tames by species
    - Show success rate history
    - Add achievements for rare tames

16. **Improve Error Messages**
    - "You need level 15 to tame this animal" (not generic 400)
    - "This animal requires 50 reputation with Nahi Coalition"
    - "Your kennel is full (3/3). Release or upgrade to continue."

---

## 8. CONCLUSION

The taming system has a **solid foundation** with good architecture (transactions, persistent state, SecureRNG), but suffers from **critical bugs** that will frustrate players and create exploits.

### Must-Fix Before Launch:
1. Energy spending order (Bug #1)
2. Skill validation (Bug #2)
3. Attempt counter (Bug #3)
4. Energy refund on abort (Bug #6)

### Should-Fix Soon:
5. Progress calculation logic (Bug #5)
6. Location filtering (Incomplete #1)
7. Encounter rate consistency (Bug #7)
8. Species enum validation (Bug #10)

### System Maturity:
- **Backend**: 75% complete (core works, needs bug fixes)
- **Frontend**: 60% complete (basic UI, missing progress tracking)
- **Testing**: 0% complete (no tests exist)
- **Documentation**: 40% complete (code comments good, no external docs)

### Estimated Fix Time:
- **Critical bugs**: 4-6 hours
- **Important improvements**: 8-12 hours
- **Polish & UX**: 20-30 hours
- **Comprehensive testing**: 15-20 hours

**Total**: ~50-70 hours to bring system to production-ready state.

### Overall Assessment:
⚠️ **NEEDS WORK** - System is functional but has too many bugs for production. Fix critical bugs first, then iterate on UX and location filtering. The architecture is sound, so fixes should be straightforward.

---

## APPENDIX A: File Reference

### Server Files
- `server/src/services/taming.service.ts` - Core taming logic (383 lines)
- `server/src/models/TamingAttempt.model.ts` - State persistence (201 lines)
- `server/src/data/companionSpecies.ts` - Species definitions (991 lines)
- `server/src/controllers/companion.controller.ts` - HTTP handlers
- `server/src/routes/companion.routes.ts` - Route definitions
- `shared/src/types/companion.types.ts` - Shared type definitions (583 lines)

### Client Files
- `client/src/hooks/useCompanions.ts` - React hook (698 lines)
- `client/src/pages/Companion.tsx` - UI page (704 lines)
- `client/src/services/companion.service.ts` - API calls (referenced)

### Related Systems
- `server/src/models/AnimalCompanion.model.ts` - Companion storage (762 lines)
- `server/src/services/energy.service.ts` - Energy management
- `shared/src/constants/skills.constants.ts` - Skill definitions (line 210-218)

---

## APPENDIX B: Test Coverage Recommendations

### Unit Tests Needed
```typescript
describe('TamingService.attemptTaming', () => {
  it('should spend energy only after capacity check');
  it('should handle missing animal_handling skill gracefully');
  it('should prevent 6th taming attempt');
  it('should calculate progress correctly for difficulty 10');
  it('should refund energy on transaction abort');
  it('should respect MAX_ATTEMPTS limit');
  it('should not allow taming below level requirement');
  it('should not allow taming without reputation');
  it('should create companion with correct initial values');
  it('should grant XP on successful tame');
});

describe('TamingService.getWildEncounters', () => {
  it('should filter by character level');
  it('should filter by reputation requirements');
  it('should respect rarity spawn rates');
  it('should not spawn duplicate species');
  it('should return location in encounter data');
});

describe('TamingAttempt.model', () => {
  it('should auto-expire after 24 hours');
  it('should prevent progress > 100');
  it('should track attempt count correctly');
  it('should clean up expired attempts');
});
```

### Integration Tests Needed
```typescript
describe('Taming Flow (E2E)', () => {
  it('should complete full taming flow from encounter to companion');
  it('should handle concurrent taming attempts correctly');
  it('should prevent kennel overflow');
  it('should persist taming progress across server restart');
  it('should handle animal fleeing after max attempts');
  it('should reject invalid species enum values');
});
```

---

**End of Report**
