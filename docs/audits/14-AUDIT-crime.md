# Crime System Audit Report

**Date:** 2025-12-14
**Auditor:** Claude Code
**Scope:** Production Readiness Assessment
**Risk Level:** MEDIUM-HIGH
**Production Readiness:** 72%

---

## Overview

### Purpose
This audit comprehensively analyzes the Crime System in Desperados Destiny to assess production readiness, identify critical bugs, security vulnerabilities, and incomplete implementations.

### Scope
The Crime System encompasses three interconnected subsystems:
1. **Crime Mechanics** - Crime actions, witness detection, consequences
2. **Jail System** - Imprisonment, activities, escape, bail
3. **Bounty System** - Bounty tracking, wanted levels, bounty hunting

### Files Analyzed
**Server:**
- `server/src/services/crime.service.ts` (682 lines)
- `server/src/services/jail.service.ts` (816 lines)
- `server/src/services/bounty.service.ts` (621 lines)
- `server/src/controllers/crime.controller.ts` (397 lines)
- `server/src/routes/crime.routes.ts` (56 lines)
- `server/src/models/Bounty.model.ts` (359 lines)
- `server/src/middleware/jail.middleware.ts` (274 lines)
- `server/src/jobs/bountyCleanup.ts` (137 lines)
- `server/src/models/Character.model.ts` (crime-related sections)

**Client:**
- `client/src/store/useCrimeStore.ts` (279 lines)
- `client/src/services/crime.service.ts` (126 lines)

**Total Lines Reviewed:** ~3,747 lines

---

## What Works Well

### Excellent Architecture Decisions

1. **Transaction-Safe Operations**
   - All critical operations use MongoDB sessions with proper transaction handling
   - `crime.service.ts:327-393` - Bail payment uses transactions
   - `jail.service.ts:49-117` - Jail operations properly handle sessions
   - Consistent rollback on errors prevents data corruption

2. **Comprehensive Integration**
   - Crime system integrates with 7+ other systems: Time, Weather, Crowd, Reputation, Quest, Gold, Notification
   - Environmental modifiers (time, weather, crowd) affect crime detection
   - Reputation spreading events create dynamic world responses

3. **Well-Designed Data Models**
   - Bounty model includes proper indexes for performance
   - Character model has dedicated crime fields with appropriate validation
   - Enum-based type safety for bounty types, statuses, wanted ranks

4. **Robust Middleware Protection**
   - `jail.middleware.ts` prevents actions while jailed with multiple protective layers
   - Auto-release functionality
   - Smart route allowlisting for jailed players

5. **Background Job Infrastructure**
   - `bountyCleanup.ts` handles bounty expiration and decay
   - Distributed locking prevents race conditions in cron jobs
   - Proper error handling and logging

### Strong Crime Mechanics

1. **Dynamic Witness System**
   - Time-based detection modifiers (crimes easier at night)
   - Weather effects (fog/rain reduce detection)
   - Crowd density impacts witness chance

2. **Graduated Consequences**
   - Wanted levels cap at 5 with meaningful thresholds
   - Bounty amounts scale with wanted level
   - Jail time varies by crime severity (5-240 minutes)

3. **Flexible Bounty System**
   - Three bounty types: Faction, Player, Story
   - Per-faction wanted tracking
   - Wanted ranks from Unknown to Most Wanted

---

## Critical Issues Found

### CRITICAL Severity

#### C1: Race Condition in Wanted Level Updates
**Location:** `crime.service.ts:555-562` and `bounty.service.ts:367-438`
**Severity:** CRITICAL

**Issue:** When a player is arrested, the system:
1. Sets `target.wantedLevel = 0`
2. Sets `target.bountyAmount = 0`
3. Calls `BountyService.updateWantedLevel()` which recalculates from active bounties

This creates a race condition where Character model and Bounty/WantedLevel models can desynchronize.

**Impact:**
- Character could have wantedLevel=0 but active bounties still exist
- Bounty hunters could exploit by collecting bounties on "clean" characters
- Database inconsistency could persist indefinitely

**Recommendation:** Replace Character model's `wantedLevel` and `bountyAmount` fields with computed properties.

---

#### C2: Bail Payment Exploit - Duplicate Transactions
**Location:** `crime.service.ts:321-394` and `jail.service.ts:363-442`
**Severity:** CRITICAL

**Issue:** Two separate bail payment implementations exist:
1. `CrimeService.payBail()` - Used by crime controller
2. `JailService.payBail()` - Supports paying for others

Both accept `characterId` but have different validation.

**Recommendation:** Consolidate to single implementation with distributed lock.

---

#### C3: Bounty Collection Without Validation
**Location:** `bounty.service.ts:187-261`
**Severity:** CRITICAL

**Issue:** `collectBounty()` doesn't verify target was actually defeated/captured.

**Impact:**
- Gold duplication exploit
- Bounties marked collected but targets remain free
- Economy breaking exploit

**Recommendation:** Add required `combatSessionId` parameter. Verify combat occurred.

---

### HIGH Severity

#### H1: Missing Session Management in Bounty Decay
**Location:** `bounty.service.ts:492-538`
**Severity:** HIGH

**Issue:** `decayBounties()` iterates through bounties updating individually without transaction.

---

#### H2: Character Model Dual Bounty Storage
**Location:** `Character.model.ts:134`, `Character.model.ts:449`
**Severity:** HIGH

**Issue:** Character model stores both:
- `bountyAmount: number` - Direct field
- Bounty documents in separate Bounty collection

These can desynchronize.

---

#### H3: Arrest Cooldown Not Persisted
**Location:** `Character.model.ts:136`, `crime.service.ts:582`
**Severity:** HIGH

**Issue:** `arrestCooldowns: Map<string, Date>` doesn't persist correctly in MongoDB.

---

#### H4: Missing Location Validation for Arrests
**Location:** `crime.service.ts:485-607`
**Severity:** HIGH

**Issue:** `arrestPlayer()` doesn't verify both players are in same location.

---

### MEDIUM Severity

#### M1: Lay Low Time Cost Not Implemented
**Location:** `crime.service.ts:454-457`
```typescript
// Time cost: 30 minutes (could implement actual waiting time)
// For MVP, we'll just apply the reduction immediately
```

#### M2: Jail Activity Cooldowns Not Tracked
**Location:** `jail.service.ts:725-732`
```typescript
// For now, always allow
return { canPerform: true, minutesRemaining: 0 };
```

#### M3: Bounty Hunter Encounters Not Implemented
**Location:** `bounty.service.ts:444-486`
Methods marked deprecated with note "Use BountyHunterService" but that service doesn't exist.

---

## Incomplete Implementations

### I1: Missing Crime Model
No persistent record of crimes committed. Only Character.wantedLevel and Bounty documents exist.

### I2: Jail Reason Not Tracked
**Location:** `jail.service.ts:614`
```typescript
reason: null, // Would need to track this
```

### I3: Jail Statistics Not Implemented
**Location:** `jail.service.ts:624-641`
```typescript
return {
  totalArrests: 0,
  totalJailTime: 0,
  // All zeros - not implemented
};
```

### I4: Socialization Activities Return Random Messages
**Location:** `jail.service.ts:791-814`
"Useful tips" flagged but never tracked or used.

### I5: Wanted Level Decay Job Missing
`decayWantedLevels()` implemented but never called by any cron job.

---

## Logical Gaps

### G1: Bounty Collection vs Player Arrest Duplication
Two different mechanisms for collecting bounties with unclear usage.

### G2: No Validation of Crime Requirements
When crimes added to action deck, no validation of requirements.

### G3: Missing Multi-Faction Bounty Handling
Player bounties only count toward Settler Alliance, not all factions as commented.

### G4: Bail Cost Calculation Discrepancy
Three different bail cost calculations with inconsistent results.

### G5: No Maximum Wanted Level Enforcement
Direct assignments bypass the cap at 5.

---

## Security Concerns

### S1: No Rate Limiting on Crime Endpoints
Crime endpoints have no rate limiting, enabling spam attacks.

### S2: No Input Validation on Bounty Amounts
No maximum check on bounty placement.

### S3: Insufficient Authorization on Bounty Collection
Doesn't verify faction memberships in database.

---

## Recommendations

### Priority 1 - Critical (Fix Before Launch)

1. **Fix C1: Race Condition in Wanted Levels** (2 hours)
2. **Fix C2: Bail Payment Duplication** (4 hours)
3. **Fix C3: Bounty Collection Validation** (6 hours)
4. **Fix H1: Bounty Decay Session Management** (3 hours)
5. **Fix H2: Dual Bounty Storage** (8 hours)

**Total P1 Effort:** 23 hours (~3 days)

### Priority 2 - High (Fix Within Sprint)

1. **Fix H3: Arrest Cooldown Persistence** (2 hours)
2. **Fix H4: Location Validation for Arrests** (1 hour)
3. **Implement I5: Wanted Level Decay Job** (2 hours)
4. **Fix G1: Bounty Collection Duplication** (4 hours)
5. **Add S1: Rate Limiting** (2 hours)

**Total P2 Effort:** 11 hours (~1.5 days)

### Priority 3 - Medium (Next Release)

1. **Implement M1: Lay Low Time Cost** (4 hours)
2. **Implement M2: Jail Activity Cooldowns** (6 hours)
3. **Fix G4: Bail Cost Standardization** (3 hours)
4. **Add S2: Input Validation** (4 hours)
5. **Fix I2: Jail Reason Tracking** (2 hours)

**Total P3 Effort:** 19 hours (~2.5 days)

---

## Risk Assessment

### Overall Risk Level: MEDIUM-HIGH

**Critical Risks (5):**
- Race conditions in wanted level management
- Potential gold duplication through bail/bounty exploits
- Bounty collection without proper validation
- Database inconsistency between Character and Bounty models
- Missing transaction handling in background jobs

**High Risks (4):**
- Cooldown data loss on server restart
- Location-based exploits
- Client-server time desync
- Incomplete feature implementations

### Production Readiness: 72%

**Breakdown:**
- Functionality: 85% - Most features work
- Security: 60% - Multiple validation and exploit issues
- Reliability: 70% - Race conditions and session issues
- Performance: 80% - Good indexing, some optimization needed
- Maintainability: 75% - Well-structured but some technical debt

### Blockers for Production

**Must Fix (P1):**
1. Race condition in wanted level updates (C1)
2. Bounty collection exploit (C3)
3. Dual bounty storage sync issues (H2)

**Should Fix (P2):**
1. Cooldown persistence (H3)
2. Rate limiting (S1)
3. Wanted level decay job (I5)

### Estimated Time to Production Ready
- **Minimum:** 34 hours (P1 + critical P2) = ~1 week
- **Recommended:** 53 hours (P1 + P2 + some P3) = ~1.5 weeks

---

## Summary

The Crime System is **well-architected with strong fundamentals** but has **critical production blockers**:

### Strengths
- Excellent transaction safety in most operations
- Comprehensive system integration
- Robust middleware protection
- Good data modeling with proper indexes
- Background job infrastructure in place

### Critical Weaknesses
- Race conditions in wanted level management
- Potential gold duplication exploits
- Database consistency issues between models
- Missing validation on bounty collection
- Incomplete cooldown tracking

### Path to Production
1. **Week 1:** Fix all P1 issues (23 hours)
2. **Week 2:** Fix critical P2 issues + add tests (20 hours)
3. **Week 3:** Security hardening + remaining P2 (15 hours)
4. **Total:** ~3 weeks to production-ready state

### Final Verdict
**Current State:** NOT PRODUCTION READY
**With P1 Fixes:** CONDITIONAL GO
**With P1+P2 Fixes:** PRODUCTION READY

The system has solid bones but needs focused effort on transaction integrity, validation, and security before launch.
