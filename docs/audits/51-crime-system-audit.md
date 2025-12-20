# Crime System Audit Report

## Overview
The Crime System manages criminal activities, witness detection, jail mechanics, wanted levels, and arrest/bounty mechanics. It provides a comprehensive framework for tracking player criminality with weather/crowd modifiers, reputation impacts, and integration with bounty systems.

## Files Analyzed
- Server: crime.service.ts, crime.controller.ts, crime.routes.ts
- Client: crime.service.ts
- Models: Character model with wantedLevel, bountyAmount, isJailed fields

## What's Done Well
- Clean separation between service logic and HTTP controller
- Comprehensive witness detection with environmental modifiers (weather, crowd)
- Integration with multiple systems (bounty, reputation, reputation spreading)
- Proper transaction handling with mongoose sessions in arrestPlayer and payBail
- Good error messages and user-facing descriptions
- Logging at appropriate levels
- Authentication and authorization checks in controller
- Proper character ownership verification before operations

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Race condition in bounty creation | crime.service.ts:136-159 | Bounty system called outside transaction; if it fails, crime still processes | Wrap BountyService call in transaction |
| Inadequate jail release validation | jail.service.ts:128-142 | No check for attempt to release someone not in jail | Add defensive check before release |
| Missing input validation on bail amount | crime.controller.ts:17-82 | Controller doesn't validate bailCost parameter | Add schema validation |
| Gold transaction safety issue | crime.service.ts:362-372 | GoldService.deductGold called with potential type mismatch | Use proper type casting |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Missing cooldown enforcement | crime.service.ts:531-540 | canArrestTarget() called but implementation not visible | Verify cooldown logic and add rate limiting |
| Weak arrest validation | crime.service.ts:542-552 | Only checks wanted >= 3 and not jailed | Add comprehensive validation |
| Hardcoded witness origin | crime.service.ts:247, 285 | Uses hardcoded 'red-gulch-sheriff' for all crimes | Make witness origin dynamic |
| Incomplete wanted decay | crime.service.ts:613-646 | Decay only reduces by 1 per 24h; no upper limit check | Add cap to prevent over-decay |
| No transaction in layLow | crime.service.ts:400-479 | Gold deduction uses transaction but wanted level decrease doesn't | Use same transaction |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Unvalidated crime action properties | crime.service.ts:50-60 | Assumes action.crimeProperties exists without null check | Add defensive null check |
| Missing witness decay | crime.service.ts:110-111 | Witness chance never decreases with repeat crimes | Consider reputation-based scaling |
| Exception handling suppresses details | crime.controller.ts:75-81 | Generic error hides actual failure reason | Return actual error details |
| No rate limiting on wanted status checks | crime.controller.ts:88-160 | getWantedStatus can be hammered | Implement rate limiting |

## Bug Fixes Needed
1. **crime.service.ts:136-159** - Wrap BountyService.addCrimeBounty in transaction try/catch
2. **crime.service.ts:201-203, 237-238, 276-277** - Add error context to all reputation service error logs
3. **crime.controller.ts:49** - Change userId.toString() comparison to use ===
4. **crime.service.ts:347-349** - Add explicit fallback when lastBailCost is 0
5. **crime.service.ts:560** - wantedLevel set to 0 directly; should use decreaseWantedLevel method
6. **crime.controller.ts:146** - wantedLevelNames array bounds not checked

## Incomplete Implementations
- Arrest cooldown system: recordArrest() and canArrestTarget() methods called but not fully implemented
- Dynamic witness NPC: Hardcoded 'red-gulch-sheriff' instead of location-based witness
- Wanted level decay cap: No maximum decay limit documented or enforced
- Jail reason tracking: JailReason enum defined but not stored in Character model
- Reputation system integration: Basic integration exists but missing context on magnitude values

## Recommendations
1. **IMMEDIATE**: Add transaction-wide consistency checks for bounty + wanted level updates
2. Implement proper cooldown tracking with Redis or database timestamps
3. Return detailed error reasons instead of generic failure messages
4. Add indexes on frequently queried fields (wantedLevel, bountyAmount)
5. Implement location-aware witness origin assignment

## Estimated Fix Effort
- Critical fixes: 6 hours
- High fixes: 8 hours
- Medium fixes: 5 hours
- Total: 19 hours

**Overall Score: 7.5/10** (Good architecture and error handling, but missing critical validations on race conditions and cooldown enforcement)
