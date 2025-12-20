# BATCH 4: Stealth & Detection Systems Audit Report

## Summary

| System | Grade | Production Ready | Critical Issues | Est. Fix Time |
|--------|-------|------------------|-----------------|---------------|
| Disguise System | C+ (65%) | 65% | 2 critical | 14 hours |
| Perception System | C+ (65%) | 65% | 5 critical | 32 hours |
| Stalking System | F (0%) | 0% | ORPHANED | 8-12 hours |
| Tracking System | C (50%) | 25% | 3 critical | 26-36 hours |

**Overall Assessment:** Stealth systems are **fragmented and incomplete**. Multiple systems exist but don't integrate with each other. Core features like disguise detection and hunting progression are broken or orphaned.

---

## DISGUISE SYSTEM

### Grade: C+ (65/100) - 6.5/10

**System Overview:**
- 6 disguise types (Settler, Nahi, Frontera, Deputy, Merchant, Priest)
- Purchase with gold (50-125g), temporary duration (20-45min)
- Reduces effective wanted level for building access
- Detection mechanic exists but is NEVER CALLED

**Top 5 Strengths:**
1. Excellent transaction safety with MongoDB sessions
2. Clean architecture (service/controller/routes)
3. Auto-cleanup of expired disguises
4. Client-server state sync
5. UI polish with countdown timer

**Critical Issues:**

1. **`wantedReduction` Property Never Used** (`accessRestriction.middleware.ts:153`)
   - Hardcoded `-2` instead of looking up disguise's actual reduction
   - Deputy Badge (reduction: 3) provides same benefit as cheaper Settler Clothes (reduction: 2)

2. **`checkDetection()` Never Called** - Core mechanic non-functional
   - Detection endpoint exists but NO system calls it
   - Disguises never get detected during crimes, actions, or building access

**Medium Issues:**
- Detection penalty too weak (+1 wanted level for blown disguise)
- Bounty hunters use raw wanted level, ignoring disguises
- `requiredItems` field implemented but unused
- UI component exists but not wired to any pages

**Recommendations:**
1. Fix wantedReduction to use actual disguise value (1 hour)
2. Integrate detection checks into crime resolution (3 hours)
3. Add cunning stat modifier to detection chance (1 hour)

---

## PERCEPTION SYSTEM

### Grade: C+ (65/100) - 6.5/10

**System Overview:**
- Skill-based intelligence gathering during PvP duels
- Progressive tiers unlock at levels 1, 11, 21, 36, 46
- Passive hints (confidence, hand ranges, tells)
- Active abilities (READ_OPPONENT, COLD_READ, POKER_FACE, FALSE_TELL)
- Contest rolls: d100 + skill*1.5

**Top 5 Strengths:**
1. Well-designed progressive tier system
2. Secure RNG implementation throughout
3. Strong TypeScript type safety
4. Skill vs skill contest mechanic
5. Rich flavor text and frontend polish

**Critical Issues:**

1. **Cold Read Doesn't Actually Reveal Hand** (`perception.service.ts:472-509`)
   - Returns generic message, not actual hand evaluation
   - Ability doesn't fulfill its promise

2. **Hand Strength Parameter Not Validated** (`perception.service.ts:171-177`)
   - `duelHandlers.ts:1333` uses `hand.length` as proxy (always 5!)
   - Should use poker hand rank 1-10

3. **Direct Card Object Leakage** (`perception.service.ts:318-328`)
   - Returns actual Card object reference (security risk)
   - Should return card notation string

4. **Cooldown Not Enforced in Service** (`perception.service.ts:80-89`)
   - Returns cooldown value but doesn't check it
   - Relies entirely on caller to enforce

5. **No Energy Validation** (`perception.service.ts:384-393`)
   - Could accept negative energy, bypass checks

**Incomplete:**
- 4 cheating abilities defined but not implemented (PEEK, MARK_CARDS, REROLL, PALM_CARD)
- Hand strength calculation missing
- Betting pattern analysis too simplistic

**Recommendations:**
1. Fix hand strength calculation with poker evaluator (2 hours)
2. Make Cold Read return actual hand rank (3 hours)
3. Validate energy parameter (30 min)
4. Implement or remove cheating abilities (6 hours)

---

## STALKING SYSTEM

### Grade: F (0%) - COMPLETELY ORPHANED

**System Overview:**
- Sophisticated stalking mechanics for hunting phase 2
- Wind direction, noise, stealth, equipment bonuses
- 560 lines of well-architected code
- **NEVER CALLED by any route, controller, or system**

**The Problem:**
The stalking system (`stalking.service.ts`) is a complete, well-designed implementation that is **completely unused**:

1. **No Routes Expose It** - No `/stalking` endpoints exist
2. **No Controllers Use It** - No imports of StalkingService found
3. **Alternative Workflow Exists** - `hunting.service.ts` has simplified workflow that skips stalking
4. **Frontend Doesn't Expect It** - Client phases: `tracking | aiming | result` (no "stalking")

**Two Competing Implementations:**
- **Legacy (USED):** `TrackingService` → `HuntingService.takeShot()` (simplified)
- **Stalking (UNUSED):** `StalkingAndShootingService` (sophisticated, never called)

**Data Model Issues:**
- HuntingTrip uses "stalking" status but `hunting.service.ts` uses "aiming"
- Missing fields: `trackingProgress`, `shotPlacement`
- Client-server mismatch on phase names

**Recommendation:** Either:
- **Option A:** Integrate stalking system (superior mechanics, 8-12 hours)
- **Option B:** Delete 560 lines of dead code (1 hour)

---

## TRACKING SYSTEM

### Grade: C (50%) - 25% Production Ready

**System Overview:**
- Phase 1 of 4-phase hunting workflow
- Skill-based success with tracking skill bonus (+5% per level)
- Energy cost (3 energy per attempt)
- Determines track freshness, direction, distance

**Top 5 Strengths:**
1. Robust transaction management
2. Comprehensive validation
3. Well-structured data types
4. Realistic tracking simulation
5. Proper rate limiting (30/min)

**Critical Issues:**

1. **Companion Bonus Not Implemented** (`tracking.service.ts:121-122`)
   - Hardcoded to 0, companion system exists but not integrated

2. **Missing Stalking/Shooting Controllers** - Only tracking controller exists
   - `stalking.service.ts` exists but NO controller
   - `harvesting.service.ts` exists but NO controller
   - Cannot complete hunting trips - stuck after tracking phase

3. **No Routes for Stalking/Harvesting**
   - Only tracking routes registered in `routes/index.ts`
   - Frontend cannot call phases 2-4

**Medium Issues:**
- Frontend-backend API mismatch (`attemptTracking` vs `trackAnimal`)
- No integration with Legendary Hunt system
- Missing quest/achievement integration

**Production Status:** **BLOCKING** - Tracking alone is incomplete. Players cannot complete hunts.

**Estimated Work:**
- Create missing controllers: 2-3 hours
- Add missing routes: 1 hour
- Implement companion bonus: 2-3 hours
- Fix frontend-backend mismatch: 1-2 hours
- **Total: 26-36 hours** for production-ready hunting

---

## CROSS-SYSTEM FINDINGS

### System Integration Matrix

| System A | System B | Integration Status |
|----------|----------|-------------------|
| Disguise | Crime | ❌ Detection never called |
| Disguise | Bounty Hunter | ❌ Raw wanted used, ignores disguise |
| Perception | Duel | ✅ Socket.io integrated |
| Perception | Combat | ❌ No integration |
| Stalking | Hunting | ❌ Completely orphaned |
| Tracking | Hunting | ⚠️ Partial (missing phases 2-4) |
| Tracking | Legendary Hunt | ❌ Separate systems |

### Shared Problems

1. **Dead Code Everywhere**
   - Stalking system: 560 lines unused
   - Perception cheating abilities: defined but not implemented
   - Disguise detection: exists but never called

2. **Duplicate/Competing Implementations**
   - Two hunting workflows (stalking vs simplified)
   - Two tracking approaches (standard vs legendary)

3. **Missing Controllers/Routes**
   - Stalking, shooting, harvesting all have services but no API exposure

4. **Phase Name Inconsistencies**
   - "stalking" vs "aiming" used interchangeably
   - Client and server disagree on valid phases

---

## PRIORITY FIX ORDER

### Immediate (Ship Blockers)
1. **Create hunting controllers** - Cannot complete hunts without them
2. **Fix disguise wantedReduction** - Core mechanic broken
3. **Fix perception hand strength** - Returns incorrect values

### High Priority (Week 1)
1. Decide: Integrate or delete stalking system
2. Add missing hunting routes (stalking, shooting, harvesting)
3. Implement companion tracking bonus
4. Integrate disguise detection into crime system

### Medium Priority (Week 2)
1. Fix perception Cold Read to reveal actual hands
2. Standardize hunting phase names across codebase
3. Add perception abilities or remove from constants
4. Wire disguise UI to actual pages

---

## ESTIMATED EFFORT

| System | Critical Fixes | Full Completion |
|--------|---------------|-----------------|
| Disguise | 4.5 hours | 14 hours |
| Perception | 5.5 hours | 32 hours |
| Stalking | Decision needed | 8-12 hours (integrate) or 1 hour (delete) |
| Tracking | 6-8 hours | 26-36 hours |
| **Total** | **~20 hours** | **~3-4 weeks** |

---

## CONCLUSION

The stealth/detection systems represent a **significant technical debt** in the codebase. While individual components have solid implementations:

- **Disguise:** Well-designed but core detection mechanic never fires
- **Perception:** Sophisticated but several abilities don't work as advertised
- **Stalking:** Complete implementation that's completely unused
- **Tracking:** Functional but blocks progression (missing phases 2-4)

**Key Decision Required:** The stalking system dilemma must be resolved:
- Either integrate the superior stalking mechanics (better gameplay)
- Or delete 560 lines of dead code (cleaner codebase)

The hunting system cannot ship without at minimum creating the missing controllers and routes for phases 2-4.
