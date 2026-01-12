# Phase 3 Production Remediation Plan

## Overview
This document outlines the remaining technical debt and security gaps identified through comprehensive codebase analysis. All P0/P1 issues from Phases 1-2 have been resolved. Phase 3 focuses on hardening, optimization, and test coverage.

**Analysis Date:** January 2026
**Target Completion:** Pre-Beta Launch
**Last Updated:** January 11, 2026

---

## COMPLETION STATUS

| Category | Issue Count | Risk Level | Status |
|----------|-------------|------------|--------|
| Missing CSRF Protection | 18 routes | HIGH | **FIXED** |
| Missing Rate Limiting | 25+ routes | HIGH | **FIXED** |
| Shop Double-Spend Race Condition | CRITICAL | CRITICAL | **FIXED** |
| Marketplace Double-Listing | CRITICAL | CRITICAL | **FIXED** |
| Production Transaction Safeguard | CRITICAL | CRITICAL | **FIXED** |
| Admin IDOR Vulnerability | CRITICAL | CRITICAL | **FIXED** |
| Auth Rate Limiting | HIGH | HIGH | **FIXED** |
| Duplicate Mongoose Indexes | 16 duplicates | MEDIUM | Deferred (P2) |
| Missing Input Validation | 18 routes | MEDIUM | Deferred (P2) |
| Skipped Tests | 159 tests | LOW | Deferred (P3) |

### Critical Security Fixes Completed (January 11, 2026)

#### CRITICAL VULNERABILITIES RESOLVED:

1. **Shop Double-Spend Race Condition** - `shop.service.ts`
   - **Previously:** Non-atomic read-modify-write allowed currency duplication
   - **Fix:** Uses `findOneAndUpdate` with `$gte` check for atomic dollar deduction
   - **Location:** Lines 184-202, 230-235

2. **Marketplace Double-Listing Race Condition** - `marketplace.service.ts`
   - **Previously:** Concurrent bids/purchases could cause item duplication
   - **Fix:** Added `withLock()` distributed locks for `placeBid()` and `buyNow()`
   - **Location:** Lines 604-607, 759-762

3. **Production Transaction Safeguard** - `transaction.helper.ts`
   - **Previously:** `DISABLE_TRANSACTIONS=true` could be set in production
   - **Fix:** Server refuses to start if transactions disabled in production
   - **Location:** Lines 29-56 (module-level check with fatal error)

4. **Admin IDOR Vulnerability** - `admin.controller.ts`
   - **Previously:** Weak ObjectId validation allowed data enumeration
   - **Fix:** Added `escapeRegex()` for NoSQL injection prevention + `safePaginationParams()` for DoS prevention
   - **Location:** Lines 25-67

#### HIGH PRIORITY FIXES:

5. **Authentication Rate Limiting** - `auth.routes.ts`
   - All auth endpoints now have dedicated rate limiters:
     - `loginRateLimiter`: 5/15min per IP (brute force prevention)
     - `registrationRateLimiter`: 3/hour (spam prevention)
     - `passwordResetRateLimiter`: 3/hour (abuse prevention)
     - `passwordResetEmailLimiter`: 5/24h per email (DoS prevention)
     - `twoFactorRateLimiter`: 10/15min (2FA abuse prevention)
     - `emailVerificationRateLimiter`: 5/hour (verification spam)

### P1 Fixes Completed (Earlier in January 11, 2026)

1. **CSRF Protection Added** - 18 POST routes now protected:
   - `bountyHunting.routes.ts`: 4 routes (accept, track, confront, abandon)
   - `cattleDrive.routes.ts`: 5 routes (start, progress, event, complete, abandon)
   - `deepMining.routes.ts`: 9 routes (stake, collect, protection, bribe, create, descend, mine, equipment, quote, sell)
   - `currency.routes.ts`: 2 routes (exchange/sell, exchange/buy)
   - `investment.routes.ts`: 2 routes (invest, cashout)

2. **Rate Limiting Added** - New rate limiters created and applied:
   - `currencyExchangeRateLimiter`: 10/min per character (currency routes)
   - `duelRateLimiter`: 5/min per character (duel challenges)
   - `investmentRateLimiter`: 20/min per character (investment routes)
   - `activityRateLimiter`: 30/min per character (bounty, cattle, mining)
   - `reputationRateLimiter`: 10/min per character (reputation spreading)

---

## EXECUTIVE SUMMARY (Original Analysis)

---

## P1 - HIGH PRIORITY (Security)

### Issue #1: Missing CSRF Protection on 18 POST Routes

**Impact:** Cross-site request forgery attacks possible on state-changing endpoints
**Risk:** HIGH - Attackers can perform actions on behalf of authenticated users

**Affected Files:**

#### `server/src/routes/bountyHunting.routes.ts`
- `POST /bounty-hunting/start` - Missing CSRF
- `POST /bounty-hunting/complete` - Missing CSRF
- `POST /bounty-hunting/abandon` - Missing CSRF
- `POST /bounty-hunting/claim-reward` - Missing CSRF
- `POST /bounty-hunting/track` - Missing CSRF
- `POST /bounty-hunting/ambush` - Missing CSRF

#### `server/src/routes/cattleDrive.routes.ts`
- `POST /cattle-drive/start` - Missing CSRF
- `POST /cattle-drive/complete` - Missing CSRF
- `POST /cattle-drive/abandon` - Missing CSRF
- `POST /cattle-drive/herd-action` - Missing CSRF
- `POST /cattle-drive/defend` - Missing CSRF
- `POST /cattle-drive/purchase-cattle` - Missing CSRF

#### `server/src/routes/deepMining.routes.ts`
- `POST /deep-mining/claim` - Missing CSRF
- `POST /deep-mining/upgrade-shaft` - Missing CSRF
- `POST /deep-mining/hire-worker` - Missing CSRF
- `POST /deep-mining/fence-ore` - Missing CSRF
- `POST /deep-mining/bribe-inspector` - Missing CSRF
- `POST /deep-mining/sabotage` - Missing CSRF

**Solution:**
```typescript
// In each affected route file, add:
import { requireCsrfToken } from '../middleware/csrf.middleware';

// Change from:
router.post('/start', requireAuth, asyncHandler(startBountyHunt));

// To:
router.post('/start', requireAuth, requireCsrfToken, asyncHandler(startBountyHunt));
```

**Implementation Steps:**
1. Open each affected route file
2. Import `requireCsrfToken` middleware
3. Add `requireCsrfToken` after `requireAuth` on each POST route
4. Run tests to verify no regressions

---

### Issue #2: Missing Rate Limiting on Economic Operations

**Impact:** Abuse vectors for currency/economy manipulation
**Risk:** HIGH - Economic exploits can destabilize game economy

**Critical Gaps (No Rate Limiting):**

| Route | Risk | Recommended Limit |
|-------|------|-------------------|
| `POST /api/currency/exchange/*` | Currency manipulation | 10/min per character |
| `POST /api/duels/challenge` | Spam challenges | 5/min per character |
| `POST /api/investments/*` | Economic abuse | 20/min per character |
| `POST /api/bounty-hunting/*` | XP farming | 30/min per character |
| `POST /api/cattle-drive/*` | Resource farming | 20/min per character |
| `POST /api/deep-mining/*` | Resource farming | 30/min per character |
| `POST /api/reputation-spreading/*` | Rep manipulation | 10/min per character |

**Solution - Create Character-Based Rate Limiters:**

```typescript
// server/src/middleware/rateLimiter.ts

// Economic operations - strict limits
export const economicRateLimiter = createRateLimiter({
  prefix: 'economic',
  windowMs: 60 * 1000,  // 1 minute
  max: 10,
  keyGenerator: (req) => req.character?._id?.toString() || req.ip,
  message: 'Too many economic transactions. Please wait.'
});

// Duel challenges - prevent spam
export const duelRateLimiter = createRateLimiter({
  prefix: 'duel',
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.character?._id?.toString() || req.ip,
  message: 'Too many duel challenges. Please wait.'
});

// Activity rate limiter (bounty, cattle, mining)
export const activityRateLimiter = createRateLimiter({
  prefix: 'activity',
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.character?._id?.toString() || req.ip,
  message: 'Too many actions. Please slow down.'
});
```

**Files to Modify:**
- `server/src/middleware/rateLimiter.ts` - Add new limiters
- `server/src/routes/currency.routes.ts` - Apply `economicRateLimiter`
- `server/src/routes/duel.routes.ts` - Apply `duelRateLimiter`
- `server/src/routes/investment.routes.ts` - Apply `economicRateLimiter`
- `server/src/routes/bountyHunting.routes.ts` - Apply `activityRateLimiter`
- `server/src/routes/cattleDrive.routes.ts` - Apply `activityRateLimiter`
- `server/src/routes/deepMining.routes.ts` - Apply `activityRateLimiter`
- `server/src/routes/reputationSpreading.routes.ts` - Apply `activityRateLimiter`

---

## P2 - MEDIUM PRIORITY (Performance & Code Quality)

### Issue #3: 16 Duplicate Mongoose Index Definitions

**Impact:** Startup warnings, potential index conflicts, wasted resources
**Risk:** MEDIUM - Performance degradation, confusing logs

**Duplicate Indexes by Model:**

| Model | Duplicated Fields | Location Conflict |
|-------|-------------------|-------------------|
| `Character.model.ts` | `userId`, `totalLevel`, `combatLevel` | Field-level `index: true` vs `schema.index()` |
| `Gang.model.ts` | `baseId`, `isActive` | Same conflict |
| `GangInvitation.model.ts` | Compound `gangId+recipientId` | Same conflict |
| `ActionResult.model.ts` | `characterId`, `timestamp` | Same conflict |
| `GoldTransaction.model.ts` | `characterId`, `currencyType`, `timestamp` | Same conflict |
| `Bounty.model.ts` | `targetId`, `bountyType`, `issuerFaction`, `amount`, `status`, `createdAt` | Same conflict |
| `WantedLevel.model.ts` | `characterId`, `characterName` | Same conflict |

**Root Cause:**
Indexes defined in two places:
1. Field-level: `userId: { type: Schema.Types.ObjectId, index: true }`
2. Schema-level: `CharacterSchema.index({ userId: 1 })`

**Solution - Consolidate to Schema-Level Only:**

```typescript
// BEFORE (duplicate):
const CharacterSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  // ...
});
CharacterSchema.index({ userId: 1 });

// AFTER (single definition):
const CharacterSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // ...
});
// All indexes defined at schema level
CharacterSchema.index({ userId: 1 });
```

**Files to Modify:**
1. `server/src/models/Character.model.ts` - Remove field-level `index: true` for userId, totalLevel, combatLevel
2. `server/src/models/Gang.model.ts` - Remove field-level `index: true` for baseId, isActive
3. `server/src/models/GangInvitation.model.ts` - Remove field-level `index: true` for gangId, recipientId
4. `server/src/models/ActionResult.model.ts` - Remove field-level `index: true` for characterId, timestamp
5. `server/src/models/GoldTransaction.model.ts` - Remove field-level `index: true` for characterId, currencyType, timestamp
6. `server/src/models/Bounty.model.ts` - Remove field-level `index: true` for all 6 fields
7. `server/src/models/WantedLevel.model.ts` - Remove field-level `index: true` for characterId, characterName

**Post-Fix Verification:**
```bash
# Run server and verify no duplicate index warnings
cd server && npm run dev 2>&1 | grep -i "duplicate"
# Should return empty
```

---

### Issue #4: Missing Input Validation Schemas

**Impact:** Malformed input can cause unexpected behavior
**Risk:** MEDIUM - Potential for injection or data corruption

**Routes Without Zod Validation:**

| Route File | Missing Validation |
|------------|-------------------|
| `bountyHunting.routes.ts` | All 6 POST routes |
| `cattleDrive.routes.ts` | All 6 POST routes |
| `deepMining.routes.ts` | All 6 POST routes |

**Solution - Add Validation Schemas:**

```typescript
// server/src/validation/bountyHunting.schemas.ts
import { z } from 'zod';

export const startBountyHuntSchema = z.object({
  characterId: z.string().regex(/^[a-f0-9]{24}$/, 'Invalid character ID'),
  bountyId: z.string().regex(/^[a-f0-9]{24}$/, 'Invalid bounty ID'),
});

export const completeBountyHuntSchema = z.object({
  characterId: z.string().regex(/^[a-f0-9]{24}$/, 'Invalid character ID'),
  huntId: z.string().regex(/^[a-f0-9]{24}$/, 'Invalid hunt ID'),
  outcome: z.enum(['success', 'failure', 'escape']),
});

// ... additional schemas for each endpoint
```

```typescript
// In routes file:
import { validateRequest } from '../middleware/validation.middleware';
import { startBountyHuntSchema } from '../validation/bountyHunting.schemas';

router.post('/start',
  requireAuth,
  requireCsrfToken,
  validateRequest(startBountyHuntSchema),
  asyncHandler(startBountyHunt)
);
```

**Files to Create:**
- `server/src/validation/bountyHunting.schemas.ts`
- `server/src/validation/cattleDrive.schemas.ts`
- `server/src/validation/deepMining.schemas.ts`

---

## P3 - LOW PRIORITY (Technical Debt)

### Issue #5: Skipped Test Coverage

**Impact:** Unknown behavior in untested code paths
**Risk:** LOW - Tests exist but are skipped

**Statistics:**
- **159 tests skipped** (using `.skip` or `.todo`)
- **0% controller test coverage**
- **8% service test coverage**
- **92% service coverage gap**

**Top Files with Skipped Tests:**
1. `tests/comprehensive/allActions.exhaustive.test.ts` - 40+ skipped
2. `tests/comprehensive/allLocations.exhaustive.test.ts` - 30+ skipped
3. `tests/gang/gang.e2e.test.ts` - 15+ skipped
4. `tests/combat/combat.integration.test.ts` - 12+ skipped

**Recommended Approach:**
1. **Triage skipped tests** - Categorize as:
   - `BLOCKED` - Needs infrastructure (Redis, etc.)
   - `OUTDATED` - API changed, test needs update
   - `FLAKY` - Intermittent failures
   - `TODO` - Never implemented

2. **Priority order:**
   - Fix `OUTDATED` tests first (quick wins)
   - Add infrastructure for `BLOCKED` tests
   - Investigate and fix `FLAKY` tests
   - Implement `TODO` tests for critical paths

3. **Coverage targets:**
   - Controllers: 60% (from 0%)
   - Services: 70% (from 8%)
   - Critical paths (auth, economy, combat): 90%

---

## IMPLEMENTATION ORDER

| Priority | Issue | Effort | Files |
|----------|-------|--------|-------|
| 1 | CSRF on 18 routes | 1-2 hours | 3 route files |
| 2 | Rate limiting on economic routes | 2-3 hours | 1 middleware + 7 route files |
| 3 | Fix duplicate indexes | 1-2 hours | 7 model files |
| 4 | Input validation schemas | 3-4 hours | 3 new schema files + 3 route files |
| 5 | Test coverage | 2-3 days | Multiple test files |

**Total Estimated Effort:** 2-3 days for P1-P2, ongoing for P3

---

## VERIFICATION CHECKLIST

### After CSRF Fix:
- [ ] All 18 routes return 403 without CSRF token
- [ ] All 18 routes succeed with valid CSRF token
- [ ] Frontend correctly sends CSRF token to new endpoints

### After Rate Limiting:
- [ ] Economic routes block after 10 requests/minute
- [ ] Duel routes block after 5 requests/minute
- [ ] Activity routes block after 30 requests/minute
- [ ] Rate limit errors return 429 with clear message

### After Index Fix:
- [ ] Server starts with zero duplicate index warnings
- [ ] All queries using indexed fields perform well
- [ ] No index-related errors in logs

### After Validation:
- [ ] Invalid ObjectIds return 400 error
- [ ] Missing required fields return 400 error
- [ ] Malformed requests don't crash server

---

## SUCCESS CRITERIA

- [ ] Zero CSRF-vulnerable POST endpoints
- [ ] All economic operations rate-limited
- [ ] Zero duplicate index warnings on startup
- [ ] All user input validated with Zod schemas
- [ ] Test suite: 0 skipped tests in critical paths
- [ ] Load test: 500 concurrent users, <1% error rate

---

## APPENDIX: Commands for Verification

```bash
# Check for remaining CSRF gaps
grep -r "router.post" server/src/routes/ | grep -v "requireCsrfToken" | grep -v ".test."

# Check for duplicate index warnings
cd server && npm run dev 2>&1 | grep -i "duplicate\|index"

# Run all tests including previously skipped
cd server && npm test -- --no-cache

# Check rate limiter coverage
grep -r "RateLimiter\|rateLimiter" server/src/routes/ | wc -l

# Validate all schemas exist
ls -la server/src/validation/*.schemas.ts
```
