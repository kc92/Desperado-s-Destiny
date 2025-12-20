# BATCH 2: Legendary & Companion Combat Systems Audit Report

## Summary

| System | Grade | Production Ready | Critical Issues | Est. Fix Time |
|--------|-------|------------------|-----------------|---------------|
| Legendary Hunt | B- (72%) | 70% | 4 high-risk | 1-2 days |
| Companion System | B (70%) | 70% | 4 critical | 2-3 days |
| Taming System | C+ (60%) | 60% | 6 critical | 4-6 hours |
| Action Deck | B+ (75%) | 75% | 2 critical | 2-3 hours |

---

## LEGENDARY HUNT SYSTEM

### Grade: B- (72/100)

**System Overview:**
Multi-phase boss encounter system for rare/mythical animals with:
- Discovery System (clues, rumors, spawn conditions)
- Combat System (turn-based multi-phase boss fights)
- Quest Integration (legendary quest chains with moral choices)

**Strengths:**
- Robust transaction safety with distributed locking (`legendaryHunt.service.ts:533-654`)
- Well-designed combat phases with dynamic transitions (`legendaryCombat.service.ts:395-409`)
- Excellent database indexing for leaderboards (`LegendaryHunt.model.ts:143-149`)
- Clean separation of concerns (discovery/combat/quest)
- Sophisticated reward system with multiple types

**Critical Issues:**

1. **Character health not persisted** (`legendaryCombat.service.ts:93-98`)
   - Damage calculated but never saved to database
   - Player can "die" but still have full health afterward

2. **Unchecked type assertions** (`legendaryQuest.service.ts:393-394`)
   - `choicesMade` cast to Map but likely an object
   - Will cause runtime errors on Map method calls

3. **Session ownership vulnerability** (`legendaryHunt.controller.ts:366-381`)
   - Ownership verified AFTER fetching session
   - Timing window for session hijacking

4. **Spawn conditions always return true** (`legendaryHunt.service.ts:313-328`)
   - Placeholder code: `"For now, return true if conditions exist"`
   - Legendaries spawn regardless of time/weather

**Incomplete Features (7 TODOs):**
- Quest system integration
- Inventory system integration
- Faction reputation system
- NPC relationship system
- Location unlock system
- World state system
- Item usage in combat

**Recommendations:**
1. Fix character health persistence (add `await character.save()`)
2. Fix type casting for choicesMade
3. Implement spawn conditions with time/weather integration
4. Complete inventory integration for item rewards

---

## COMPANION SYSTEM

### Grade: B (70/100) - 7/10

**Strengths:**
- Clean separation of concerns (service/controller/model layers)
- Robust data model with instance methods (feed, heal, takeDamage)
- Transaction safety with MongoDB sessions
- Rich content (20 species, 38 abilities)
- Role-based combat damage calculation
- Rate limiting on all endpoints

**Critical Issues:**
1. **Bond decay race condition** (`companionBondDecay.job.ts:31-34`) - Query doesn't use session, multiple instances could process same companions
2. **Active companion location mismatch** (`companion.service.ts:254`) - No validation character is at location
3. **Ability cooldown map serialization** (`AnimalCompanion.model.ts:638-642`) - No defensive check for undefined Map
4. **Taming skill bonus broken** (`taming.service.ts:227-229`) - `getSkillLevel()` method doesn't exist, returns undefined → NaN

**Logic Errors:**
- Defensive role damage calculation can divide by zero (`companionCombat.service.ts:98-124`)
- Feed method ignores foodCost parameter
- Multiple active companions possible due to missing unique index

**Incomplete Features:**
- Kennel capacity upgrades (TODO at line 74)
- Breeding system (types defined, no implementation)
- Companion aging (field exists, no job)
- `mayLeave()` method never called
- Combat not integrated with main combat system

**Recommendations:**
1. Fix skill bonus in taming (use Spirit stat instead)
2. Add defensive check for ability cooldowns Map
3. Add unique index on (ownerId, isActive=true)
4. Add transaction to bond decay job

---

## TAMING SYSTEM

### Grade: C+ (60/100) - 6/10

**Strengths:**
- Excellent transaction safety with MongoDB sessions
- Cryptographically secure RNG (no client prediction)
- 19 fully-defined species with rich lore
- Progressive difficulty with 5-attempt retry system
- TTL indexes for automatic cleanup
- Proper error handling with AppError

**Critical Bugs:**
1. **Energy spent before validation** - Players lose 15 energy even if kennel is full
2. **Missing skill validation** - `animal_handling` returns undefined → NaN calculations
3. **Off-by-one error** - Players get 6 attempts instead of 5 (uses `>` instead of `>=`)
4. **Progress formula backwards** - Harder animals give LESS progress than easy ones
5. **Progress bonus scaling** - Can stack infinitely, Mountain Lions get 0 progress
6. **Energy not refunded on abort** - Transaction rollback doesn't refund energy spent outside transaction

**Incomplete Features:**
- Location-based spawning (all animals appear everywhere)
- Hostility mechanic (calculated but no gameplay effect)
- Progress tracking UI (backend complete, frontend shows binary)
- Post-taming naming (all default to "Wild [Species]")

**Security Concerns:**
- Kennel capacity race condition (no distributed lock)
- Progress manipulation via retry timing
- Invalid species enum submission possible

**Priority Fixes (4-6 hours):**
1. Fix energy spend order (check capacity BEFORE spending)
2. Add null check for `animal_handling` skill
3. Fix attempt counter (`>=` instead of `>`)
4. Refund energy on transaction abort

---

## ACTION DECK SYSTEM

### Grade: B+ (75/100) - 7.5/10

**Strengths:**
- Solid architecture with clean separation (Controller → Service → Game Engine)
- Uses SecureRNG (crypto-based) throughout - no Math.random()
- Database-backed sessions (survives server restart)
- Skill system integration with well-documented formulas
- Comprehensive GameState interface
- TTL-based session cleanup (5-minute expiry)
- Strong TypeScript types shared between client/server

**Critical Issues:**

1. **Energy Deduction Race Condition** (`actionDeck.service.ts:74-81, 188-268`)
   - Energy check happens OUTSIDE transaction
   - Players can rapidly start multiple actions before any resolve
   - Exploit: Start 5 x 30-energy actions with only 100 energy
   - **Fix:** Move energy check inside transaction, use atomic findOneAndUpdate

2. **7 Incomplete Game Types** (`deckGames.ts:2277-2286`)
   - Three-Card Monte, Solitaire Race, Texas Hold'em, Rummy, War of Attrition, Euchre, Cribbage
   - All use Faro's placeholder logic
   - **Fix:** Remove from types or implement

**Incomplete Features:**
- Phase 5 Risk/Reward systems defined but never called (wagering, streak bonuses, bail-out)
- Talent bonuses integration (parameter exists but never passed)
- Synergy multipliers always default to 1.0

**Performance Issues:**
- `ActionResult.getCharacterStats()` loads ALL results into memory (PERF-02)
- Missing compound index for session ownership checks

**Priority Fixes:**
1. **P0 (Immediate):** Fix energy race condition - 2-3 hours
2. **P1 (This Sprint):** Wire up Phase 5 features OR remove incomplete game types
3. **P2 (Next Sprint):** Fix performance issues with aggregation

---

## CROSS-SYSTEM FINDINGS

### Shared Problems
1. **Skill method doesn't exist** - `getSkillLevel()` called but not defined on Character model
2. **Race conditions on capacity checks** - No distributed locks on kennel/deck limits
3. **Energy handling inconsistent** - Sometimes deducted before validation, sometimes after

### Architecture Recommendations
1. Implement `getSkillLevel()` on Character model or create utility function
2. Add distributed locks for capacity-limited resources
3. Standardize energy deduction pattern (always atomic within transaction)
4. Complete or remove stub features (breeding, aging, 7 card games)

---

## PRIORITY FIX ORDER

### Immediate (Before Production)
1. Fix energy race condition in Action Deck (CRITICAL EXPLOIT)
2. Fix skill bonus calculations (affects taming AND companion combat)
3. Add defensive checks for Map serialization

### High Priority (Week 1)
1. Fix taming attempt counter off-by-one
2. Fix progress formula (harder = more progress)
3. Add transaction to bond decay job
4. Wire up Phase 5 reward systems OR remove from types

### Medium Priority (Week 2)
1. Implement location-based spawning for taming
2. Add unique index for active companions
3. Fix ActionResult performance with aggregation
4. Implement missing game types or remove

---

## ESTIMATED EFFORT

| System | Critical Fixes | Full Completion |
|--------|---------------|-----------------|
| Legendary Hunt | TBD | TBD |
| Companion | 2-3 days | 2-3 weeks |
| Taming | 4-6 hours | 1-2 weeks |
| Action Deck | 2-3 hours | 1-2 weeks |
| **Total** | **~4 days** | **~2 months** |
