# Permanent Unlocks System Audit Report

## Overview
The Permanent Unlocks system manages account-wide persistent features that carry across all characters, including cosmetics, gameplay enhancements, convenience features, and prestige items. It uses MongoDB to track unlocks, requirements evaluation, and active effects. The system supports complex requirement chains (allOf/anyOf) and automatic effect application.

## Files Analyzed
- Server: permanentUnlock.service.ts, permanentUnlock.controller.ts, permanentUnlock.routes.ts
- Models: AccountUnlocks.model.ts, User.model.ts, Character.model.ts, Achievement.model.ts
- Types: permanentUnlocks.types.ts
- Tests: permanentUnlocks.test.ts

## What's Done Well
- Comprehensive type system with clear enums for categories and requirement types
- Well-structured requirement evaluation with support for compound requirements (allOf/anyOf)
- Proper authentication on all routes via requireAuth middleware
- Atomic effects application through dedicated applyUnlockEffectsToAccount function
- Good separation of concerns between service, controller, and routes
- Model methods for common operations (hasUnlock, claimUnlock, getUnclaimedUnlocks)
- Extensive test coverage with 47 test cases covering major functionality
- Proper use of findOrCreate pattern for creating default documents
- Schema indexes on frequently queried fields (userId, unlockId, claimed, earnedAt)
- Transaction-safe operations with session management

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Missing Model Fields | permanentUnlock.service.ts:159-243 | 6 TODO comments indicate missing User model fields: legacyTier, totalGoldEarned, totalCrimesCommitted, totalDuelsWon, totalTimePlayed, gangRank | Add fields to User and Character models; implement tracking for these metrics |
| Event/Purchase Requirements Unimplemented | permanentUnlock.service.ts:261-282 | PURCHASE and EVENT requirement types always return false; no integration with payment/event systems | Implement event system and premium purchase tracking |
| No Unlock Data File | permanentUnlock.service.ts:22 | Import from '../data/unlocks' but file doesn't exist | Create unlocks data file with all unlock definitions |
| Race Condition on Duplicate Unlock Grant | permanentUnlock.service.ts:306-309 | Checking hasUnlock then pushing doesn't prevent concurrent duplicate adds | Wrap in transaction or use MongoDB $addToSet operator |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| N+1 Query Problem | permanentUnlock.service.ts:428-443 | getAvailableUnlocks calls getUnlockProgress for EVERY unlock in allUnlocks array | Batch load progress data or pre-compute in background job |
| No Input Validation | permanentUnlock.controller.ts:46-87 | Route parameters like :id are not validated before passing to service | Add validation middleware (joi/zod) for unlock IDs |
| Percentage Calculation Issue | permanentUnlock.service.ts:167,181,196,211 | Division by zero risk if requiredValue is 0; also percentage can exceed 100% | Add guards: if requiredValue === 0, set percentage to 100; clamp to [0,100] |
| Missing Achievement Validation | permanentUnlock.service.ts:142-146 | No check if achievementId is valid; just queries Achievement collection without validating | Validate achievement IDs exist before querying |
| Unbounded Array Growth | permanentUnlock.service.ts:319-331 | The unlocks array on AccountUnlocks grows unbounded; no cleanup of very old or revoked unlocks | Consider archiving old records or implementing soft-delete |
| Session Not Used in grantUnlock | permanentUnlock.service.ts:293-336 | Uses findOrCreate and save but doesn't use MongoDB transactions despite complex multi-step operation | Wrap in session.startTransaction() for atomicity |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Empty Error Messages | permanentUnlock.service.ts:49,69,75,300 | Generic error messages don't include what failed (which unlock, which requirement) | Add context to error messages |
| Hardcoded Default Starting Stats | permanentUnlock.service.ts:481-492 | Starting stats application duplicates logic; applied separately for each stat | Refactor to single loop |
| No Null Coalescing in Requirement Checks | permanentUnlock.service.ts:160,189,204,219,234,249 | Type assertion (user as any) suggests unsafe property access | Use optional chaining consistently |
| Missing Controller Error Handling | permanentUnlock.controller.ts:15-124 | asyncHandler used but no custom error response formatting | Add error formatter middleware |
| Claim Unlock Missing Validation | permanentUnlock.service.ts:509-512 | claimUnlock throws generic error; doesn't distinguish "not found" from "already claimed" | Return detailed error status |
| No Logging | permanentUnlock.service.ts | No logging of unlock grants, claims, or requirement evaluations | Add logger.info/debug for audit trail |

## Bug Fixes Needed
1. **permanentUnlock.service.ts:307** - Replace duplicate check with atomic $addToSet operation
2. **permanentUnlock.service.ts:159,189,204,219,234,249** - Add null checks and default values for missing User fields
3. **permanentUnlock.service.ts:167,181,196,211** - Add guards for division by zero and clamp percentage to [0,100]
4. **permanentUnlock.service.ts:428-443** - Optimize N+1 query by batch loading or caching progress
5. **permanentUnlock.controller.ts:46-87** - Add input validation for unlock IDs
6. **permanentUnlock.service.ts:261-282** - Implement EVENT and PURCHASE requirement evaluation
7. **permanentUnlock.service.ts:293-336** - Use MongoDB transaction for atomic grantUnlock operation

## Incomplete Implementations
- EVENT requirement type (always returns false - no event system integration)
- PURCHASE requirement type (always returns false - no premium purchase tracking)
- Legacy tier field on User model (referenced but doesn't exist)
- Multiple stat tracking on User model (totalGoldEarned, totalCrimesCommitted, totalDuelsWon, totalTimePlayed)
- Gang rank on Character model (referenced but implementation incomplete)
- Unlock trigger service (imported in tests but service doesn't exist)
- Cascading unlock checks (mentioned as expandable at line 518)

## Recommendations
1. **CRITICAL**: Create data/unlocks.ts with all unlock definitions matching test expectations
2. **CRITICAL**: Add missing User model fields for tracking
3. **HIGH**: Implement batch loading in getAvailableUnlocks to fix N+1 query problem
4. **HIGH**: Add comprehensive input validation to all controller endpoints
5. **HIGH**: Fix division by zero and percentage clamping in requirement evaluation
6. **MEDIUM**: Implement event system integration for EVENT requirement type
7. **MEDIUM**: Implement premium purchase tracking for PURCHASE requirement type
8. **MEDIUM**: Add transaction support to grantUnlock operation
9. **MEDIUM**: Add structured logging for unlock operations
10. **LOW**: Implement unlock deduplication using $addToSet in MongoDB
11. **LOW**: Create background job to clean up old unclaimed unlocks
12. **LOW**: Cache unlock definitions in memory to reduce lookups

## Estimated Fix Effort
- Critical fixes: 8 hours
- High fixes: 6 hours
- Medium fixes: 5 hours
- Total: 19 hours

**Overall Score: 6.5/10** (Good architecture and test coverage but significant data model gaps and incomplete implementations)
