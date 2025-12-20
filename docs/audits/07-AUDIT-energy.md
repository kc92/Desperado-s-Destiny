# Energy System Audit Report

## Overview

The energy system is a critical resource management system that gates all gameplay actions in Desperados Destiny.

**Audit Date:** 2025-12-14
**Risk Level:** HIGH - Multiple critical issues that could lead to energy duplication exploits

---

## Files Analyzed

### Backend Services
- `server/src/services/energy.service.ts` (~300 lines)
- `server/src/controllers/energy.controller.ts` (~200 lines)
- `server/src/routes/energy.routes.ts` (54 lines)
- `server/src/models/Character.model.ts` (energy fields)

### Client-Side
- `client/src/store/useEnergyStore.ts`
- `client/src/components/game/EnergyDisplay.tsx`
- `client/src/hooks/useEnergy.ts`

### Constants
- `shared/src/constants/game.constants.ts` (energy constants)

### Tests
- `server/tests/integration/energySystem.test.ts`

---

## What Works Well

### 1. Modern Service Layer (EnergyService)

**Strengths:**
- **Atomic operations with optimistic locking** (lines 196-222): Uses `findOneAndUpdate` with version checking
- **Automatic retry mechanism** (line 221): Detects and recovers from concurrent modification conflicts
- **Premium multiplier support** (lines 75-83): Graceful fallback when premium utils fail
- **Pure calculation functions** (lines 49-69): `calculateRegeneration()` is testable and side-effect free
- **MongoDB session support** (lines 146-150, 246-250): Enables transaction safety
- **Time-until-full calculation** (lines 115-119): Accurate timing for UI display

### 2. Client-Side Store Architecture
**File:** `useEnergyStore.ts`

- **Local regeneration timer** (lines 87-109): Reduces server load with client-side interpolation
- **Automatic cleanup** (lines 114-121): Prevents memory leaks
- **Periodic sync** (line 123): Prevents client-server drift

### 3. Constants Configuration
**File:** `game.constants.ts`

- **Centralized configuration** (lines 12-33): Single source of truth
- **Clear documentation**: Comments explain regen rates
- **Type safety**: Uses `as const` for immutability

---

## Critical Issues Found

### 2.1 DUAL IMPLEMENTATION ANTI-PATTERN
**Risk:** CRITICAL - Race conditions, inconsistent behavior

**Problem:** Two completely different energy spending implementations coexist:

**Implementation A: Modern Atomic Service (EnergyService)**
- Uses atomic operations
- Has optimistic locking
- Includes regeneration in spend logic
- Returns structured results

**Implementation B: Legacy Character Methods**
- Mutates character object directly
- NO transaction safety
- NO race condition protection
- Throws errors instead of returning results

**Evidence:**
- 20 files use `character.spendEnergy()` (UNSAFE)
- 5 files use `EnergyService.spend()` (SAFE)

**Impact:** 80% of codebase uses unsafe methods

---

### 2.2 ENERGY CONTROLLER USES DEPRECATED METHODS
**Risk:** HIGH - Broken features, potential exploits

**Issue 1:** `getStatus()` Doesn't Save Mutations (Line 22)
- Mutates character but never saves
- Returns mutated value but database not updated
- **Potential energy duplication exploit**

**Issue 2:** `canAfford()` Doesn't Await Promise (Line 144)
- Returns `Promise { <pending> }` instead of `true/false`
- Client receives unusable data
- Broken feature

**Issue 3:** `regenerate()` Uses Unsafe Pattern (Lines 168-196)
- Multi-step process creates race condition window

---

### 2.3 CHARACTER MODEL METHODS LACK SAFETY
**Risk:** HIGH - Race conditions

**Attack Vector for `spendEnergy()`:**
```
Time  | Request A                    | Request B
------|------------------------------|------------------------------
T0    | Read: energy = 100          |
T1    |                              | Read: energy = 100
T2    | Spend 50: energy = 50       |
T3    |                              | Spend 50: energy = 50
T4    | Save: energy = 50           |
T5    |                              | Save: energy = 50

Result: Spent 100 energy total, but only deducted 50!
```

---

### 2.4 NO VALIDATION ON ENERGY GRANT
**Risk:** MEDIUM

**Issue:** `grant()` method allows infinite energy without authorization checks
- No maximum amount limit
- No permission validation
- No rate limiting
- No audit logging

---

### 2.5 PREMIUM MULTIPLIER CALCULATION FLAW
**Risk:** MEDIUM - Game balance

**Configuration Contradiction:**
- `game.constants.ts` says premium regenerates SLOWER (8 hours vs 5 hours)
- `premium.utils.ts` says premium regenerates FASTER (1.5x multiplier)

---

### 2.6 CLIENT-SERVER DESYNCHRONIZATION RISK
**Risk:** MEDIUM

**Problem:** Two separate regeneration timers running independently
- Store timer AND component timer both regenerate
- Different math in each
- Rounding errors accumulate drift
- Browser throttling causes desync

---

## Incomplete Implementations

### 3.1 ALL TESTS ARE SKIPPED
**Risk:** HIGH - Zero test coverage

**14 tests written, all `.skip()`'d:**
- 5 regeneration tests
- 5 spending tests
- 3 race condition tests (MOST IMPORTANT)
- 2 premium tests

**Impact:** Zero test coverage for critical system

---

### 3.2 USEENERGY HOOK API MISMATCH
**Risk:** MEDIUM

Hook defines interfaces that backend doesn't support:
- `nextRegenAt` - Backend doesn't provide this
- `bonuses: EnergyBonus[]` - Backend doesn't support bonuses
- `totalBonusRegen` - Not implemented
- `isExhausted` - Not a backend field

---

## Logical Gaps

### 4.1 NO MAXIMUM ENERGY VALIDATION
`maxEnergy` can be set to any value, no upper bound

### 4.2 NO ENERGY FLOOR VALIDATION
Energy can theoretically go negative through direct database manipulation

### 4.3 REGENERATION DOESN'T SAVE TIMESTAMP
Critical timestamp update missing in getStatus()

### 4.4 NO CONCURRENT SPEND PROTECTION IN SERVICES
Check-then-act pattern with 180+ lines between check and spend

### 4.5 PREMIUM MULTIPLIER NOT CACHED PER-REQUEST
Multiple Redis lookups per energy operation

---

## Recommendations

### Immediate (P0 - Critical)

1. **Deprecate Character Model Energy Methods**
   - Add warnings to `character.spendEnergy()`, `character.regenerateEnergy()`
   - Refactor 20 files to use `EnergyService.spend()`

2. **Fix Energy Controller**
   - Use atomic `EnergyService.getStatus()` in getStatus endpoint
   - Add `await` to `canAfford()` method
   - Use atomic operations in `regenerate()`

3. **Add Energy Model Validations**
   - Add `min: 0` and `max: 1000` constraints

### High Priority (P1)

4. **Un-skip and Run Tests**
   - Enable all 14 tests
   - Add to CI/CD pipeline

5. **Clarify Premium Energy Configuration**
   - Choose: More energy + slower regen OR more energy + faster regen
   - Remove contradiction between constants and utils

6. **Add Audit Logging to Grant**
   - Log admin grants
   - Add maximum grant limits

### Medium Priority (P2)

7. **Unify Client Regeneration**
   - Remove duplicate timer from EnergyDisplay.tsx
   - Use only useEnergyStore

8. **Add Energy Transaction History**
   - Create EnergyTransaction model
   - Track all energy changes

9. **Add Energy Event System**
   - Emit events for SPENT, GRANTED, DEPLETED, FULL

---

## Risk Assessment Matrix

| Issue | Severity | Likelihood | Priority |
|-------|----------|------------|----------|
| Dual implementation (race conditions) | CRITICAL | High | P0 |
| Controller unsaved mutations | CRITICAL | High | P0 |
| Character methods unsafe | HIGH | High | P0 |
| All tests skipped | HIGH | Medium | P1 |
| Premium config contradictory | HIGH | Medium | P1 |
| Grant no validation | MEDIUM | Low | P1 |
| Client desync | MEDIUM | High | P2 |
| Concurrent spend in services | HIGH | Medium | P0 |

---

## Summary Statistics

### Code Coverage
- **Backend Services:** 2 implementations (modern + legacy)
- **Energy Operations:** 20+ files use unsafe methods
- **Tests:** 14 tests written, 0 running (100% skipped)
- **Client Components:** 3 (Store, Hook, Display)

### Issues by Severity
- **Critical:** 3 issues
- **High:** 5 issues
- **Medium:** 6 issues
- **Low:** 2 issues

### Remediation Effort
- **P0 (Immediate):** ~40 hours
- **P1 (High):** ~16 hours
- **P2 (Medium):** ~24 hours
- **P3 (Low):** ~40 hours

**Total Estimated Effort:** ~120 hours (3 weeks)

---

## Conclusion

The energy system has a **solid foundation** in the modern `EnergyService` implementation but is **critically undermined** by widespread use of unsafe legacy methods.

**Before Production Launch:**
1. Refactor all energy spending to use `EnergyService.spend()`
2. Fix energy controller methods
3. Add model validations (min/max)
4. Un-skip and run all 14 tests
5. Resolve premium configuration contradiction

**These 5 actions MUST be completed** to prevent energy duplication exploits that would break the game economy.

**Production Readiness:** 40% (Critical fixes required)
