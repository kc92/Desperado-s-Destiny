# Daily Contracts System Audit Report

## Overview
The Daily Contracts system generates 3-5 procedural daily missions with 6 contract types, seeded daily generation, streak tracking, and milestone bonuses.

## Files Analyzed
- Server: dailyContract.service.ts, dailyContract.controller.ts, dailyContract.routes.ts, DailyContract.model.ts
- Data: contractTemplates.ts

## What's Done Well
- Seeded daily generation (LCG) ensuring consistency
- Difficulty distribution by character level
- Streak system with 10 milestone days (1-7, 14, 21, 30)
- Streak bonus validation (one per day)
- UTC-based daily reset
- Progress triggering with type validation
- Transaction-protected completion

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Streak calculation flawed | DailyContract.model.ts:287-294 | Increments even if missed days | Check consecutive |
| Login-based streak no time check | dailyContract.service.ts:361-363 | Skipping days still counts | Check lastCompletedDate |
| Reward duplication possible | dailyContract.service.ts:259-414 | No idempotency check | Add duplicate prevention |
| Streak bonus auto-claim bug | dailyContract.service.ts:370-408 | Only milestone days work | Clarify scaling |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Progress soft lock | dailyContract.service.ts:237-254 | updateProgress doesn't validate | Use triggerProgress |
| Reputation type confusion | dailyContract.service.ts:337-350 | Map vs Object conversion | Validate type |
| Time until reset wrong | dailyContract.service.ts:672-684 | Sets hour to 24 (confusing) | Use proper date math |
| Expiry not enforced on progress | dailyContract.service.ts:194-220 | Can complete expired | Add expiry check |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Template coverage unknown | contractTemplates.ts:1-4 | Claims 67 but only 15 shown | Verify all exist |
| Streak history inaccurate | dailyContract.service.ts:456-478 | Calculated not from data | Query actual records |

## Bug Fixes Needed
1. **CRITICAL - DailyContract.model.ts:287-294** - Check consecutive days: `if (yesterdayContract && yesterdayContract.completedCount > 0 && lastCompletedDate === yesterday)`
2. **CRITICAL - dailyContract.service.ts:276-292** - Add idempotency check: `if (contract.status === 'completed') return existingResult`
3. **HIGH - dailyContract.service.ts:207-246** - Add expiry validation in progress updates
4. **HIGH - dailyContract.service.ts:674-675** - Fix: `tomorrow.setUTCDate(tomorrow.getUTCDate() + 1); tomorrow.setUTCHours(0, 0, 0, 0)`

## Incomplete Implementations
- Contract difficulty dynamic scaling
- Contract reward scaling by level
- Contract failure handling (no penalty for expiry)
- Progressive difficulty increase

## Recommendations
1. **IMMEDIATE**: Fix streak calculation to require consecutive days
2. **IMMEDIATE**: Add idempotency to prevent duplicate rewards
3. Add contract failure state
4. Add expiry validation in progress
5. Fix streak history calculation
6. Verify all 67 templates exist

## Estimated Fix Effort
- Critical fixes: 6 hours
- High fixes: 4 hours
- Medium fixes: 2 hours
- Total: 12 hours

**Overall Score: 5/10** (Critical streak calculation issues)
