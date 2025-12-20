# Horse Racing System Audit Report

## Overview
The Horse Racing system manages race creation, horse race simulations, betting mechanics, and leaderboards. It integrates with the Horse model to calculate race performance based on stats, bond level, trained skills, and equipment. The system includes both racing and horse show mechanics with prize distribution.

## Files Analyzed
- Server: horseRacing.service.ts, racing.controller.ts

## What's Done Well
- Comprehensive race score calculation with multiple stat factors (speed 40%, stamina 30%, condition 20%, bond 10%)
- Proper horse condition validation before race entry (stamina >= 70%, health >= 80%)
- Bond level integration with score multiplier (1.0 to 1.5x)
- Horse show scoring with type-specific mechanics (beauty, skill, obedience)
- Breed-specific beauty show bonuses properly implemented
- Leaderboard functions for racing, combat, and distance travel
- Proper error handling for missing horses and invalid races
- Good separation of concerns between controller and service

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Race model not created | horseRacing.service.ts:42 | Mock race object created with `any` type instead of actual HorseRace model | Create HorseRace model and implement database persistence |
| Missing RNG seed/fairness | horseRacing.service.ts:171 | Random race scores use Math.random() without seed | Implement server-side RNG with non-predictable entropy |
| No transaction support | racing.controller.ts:176 | Betting endpoint not implemented; no atomic transaction | Implement full betting service with transaction support |
| Type safety issues | horseRacing.service.ts:42 | Multiple `as any` type assertions hiding schema mismatches | Fix type definitions and remove type assertions |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Missing race model persistence | horseRacing.service.ts:62 | enterRace returns mock race, never saves to database | Implement HorseRace.save() call |
| Unvalidated race state | racing.controller.ts:54 | No validation that race is in correct status before entry | Add status checks |
| Race simulation not accessible | horseRacing.service.ts:65 | simulateRace is never called from controller endpoints | Create controller endpoint |
| No race registration tracking | racing.controller.ts:132 | enterRace doesn't update race.participants | Add participant registration |
| Missing bet validation | racing.controller.ts:204 | Bet endpoint returns mock response without implementing betting | Implement raceBetting.service |
| Incomplete odds calculation | racing.controller.ts:368 | baseOdds formula uses hardcoded values | Update odds calculation |
| No gold transaction | racing.controller.ts:197 | placeBet checks character.gold but never actually deducts it | Integrate gold service |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Race history query N+1 | racing.controller.ts:277 | No population of horse details in race history | Add .populate() calls |
| Missing race results | racing.controller.ts:270 | No endpoint to view race results after completion | Create getRaceResults endpoint |
| No show model | horseRacing.service.ts:197 | enterShow returns mock show object, not saved | Create HorseShow model |
| Hardcoded race parameters | horseRacing.service.ts:46 | Distance, entryFee, prizePool are hardcoded | Make configurable from templates |
| No race cancellation | racing.controller.ts:24 | Can't cancel race or refund entries | Add race cancellation |

## Bug Fixes Needed
1. **racing.controller.ts:158-162** - enterRace passes wrong parameters to service
2. **horseRacing.service.ts:79** - calculateRaceScore references horse.training.trainedSkills but doesn't check if empty
3. **horseRacing.service.ts:154** - calculateBondMultiplier used before being imported/exported
4. **horseRacing.service.ts:311** - Breed comparison uses string instead of HorseBreed enum
5. **racing.controller.ts:69** - checkEventQualification may receive different reputation formats

## Incomplete Implementations
- raceBetting.service.ts: File referenced but not found; betting system is stubbed
- HorseRace model: No model file found; races use mock objects
- Prize distribution: simulateShow awards prizes but never integrates with gold service
- Race scheduler: No recurring race creation or periodic simulations
- Prestigious events: Data exists but no simulation mechanics implemented
- Race weather: Weather affects shooting but not races

## Recommendations
1. **IMMEDIATE**: Implement HorseRace and HorseShow models with proper persistence
2. Create raceBetting.service.ts with atomic transactions and fair odds calculation
3. Add transaction support to racing endpoints (enter + bet + gold deduction)
4. Implement server-side RNG seeding for fair competition
5. Add race result viewing and statistics tracking
6. Implement race cancellation with refund logic
7. Add leaderboard filtering by date range and filters

## Estimated Fix Effort
- Critical fixes: 16 hours
- High fixes: 12 hours
- Medium fixes: 8 hours
- Total: 36 hours

**Overall Score: 4/10** (Core functionality is partially implemented but lacks database persistence, betting system, and fair RNG. Mock objects prevent actual racing gameplay.)
