# Sanity System Audit Report

## Overview
The Sanity System is a well-structured horror tracking mechanism that manages character mental state through sanity loss/restoration, hallucinations, traumas, and horror resistance. The service includes passive sanity regeneration and integration with restoration methods requiring gold and energy costs.

## Files Analyzed
- Server: sanity.service.ts, SanityTracker.model.ts, sanity.controller.ts, sanity.routes.ts
- Client: useSanity.ts

## What's Done Well
- Solid MongoDB schema with proper indexing (characterId, sanityState, currentSanity)
- Comprehensive state machine for sanity levels (STABLE → RATTLED → SHAKEN → BREAKING → SHATTERED)
- Hallucination system with type definitions and auto-expiration
- Combat penalty calculation based on sanity state
- Atmospheric messaging system with themed descriptions per sanity state
- Proper error handling in controllers with AppError abstraction
- Transaction-aware restoration with optional session support
- Passive regeneration job integrated with location checks

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Race condition in passive regen | sanity.service.ts:232-247 | Loop processes all trackers without locking; concurrent reads not atomic | Implement distributed lock or batch update with MongoDB transaction |
| Missing input validation on loseSanity | sanity.service.ts:45-91 | Amount parameter not validated for negative/zero values | Add validation: `if (amount <= 0) throw new AppError(...)` |
| No database session for async hallucination save | sanity.service.ts:62-66 | Hallucination added without checking if save succeeded before building resistance | Wrap in try-catch or use transaction |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Hardcoded safe town list | sanity.service.ts:241 | Safe towns array hardcoded instead of config | Move to config constants or Location model query |
| Missing sanity loss in ritual cancellation | ritual.service.ts:147-148 | TODO comment indicates sanity cost not integrated for rituals | Uncomment integration with SanityService.loseSanity |
| Incomplete useSanityRestoration implementation | useSanity.ts:142-152 | Client expects `/sanity` GET endpoint but no route defined | Add GET route for sanity status |
| No validation of restoration method cost | sanity.service.ts:286-300 | Energy/gold deduction happens but race condition possible | Use atomic findOneAndUpdate with $inc |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Loose type casting | sanity.service.ts:87-88 | `hallucination as any` and `trauma as any` bypasses TypeScript safety | Remove type assertions; ensure types match |
| Passive regen doesn't handle hoursSinceLastRegen = 0 | sanity.service.ts:243 | Could double-regen if exactly 1 hour | Set `lastRestoration = now` after calculation |
| Missing null check for corruption tracker | ritual.service.ts:53 | CorruptionService.getOrCreateTracker could fail but no error handling | Add try-catch or verify service throws properly |
| Limited hallucination diversity | SanityTracker.model.ts:350-387 | Only 4-5 descriptions per type; can repeat within same session | Expand description pool or track recently-used |

## Bug Fixes Needed
1. **sanity.service.ts:232-247** - Implement distributed lock or MongoDB transaction for passive regen atomicity
2. **sanity.service.ts:45-50** - Add validation: `if (!amount || amount <= 0) throw new AppError('Amount must be positive', 400)`
3. **sanity.service.ts:62-66** - Wrap hallucination creation in error handling with rollback
4. **ritual.service.ts:147-148** - Uncomment and implement SanityService.loseSanity integration
5. **sanity.service.ts:241** - Move safe towns list to constants/config file with fallback
6. **SanityTracker.model.ts:233-256** - Improve hallucination description variety or add seen tracking

## Incomplete Implementations
- Sanity restoration methods (payment handling exists but methods not fully defined in constants)
- Hallucination effect application to character stats (logged but not applied)
- Trauma healing progression system (permanent traumas can't be healed)
- Combat penalty enforcement (calculated but not applied to actual combat)
- Reality distortion system (referenced in routes but minimal implementation)

## Recommendations
1. **URGENT**: Implement distributed locking for passive sanity regen job to prevent race conditions
2. Add comprehensive input validation across all entry points
3. Move hardcoded values (safe towns, thresholds) to HORROR_CONSTANTS config
4. Complete hallucination effect system - make effects actually impact gameplay
5. Implement trauma healing progression instead of permanent penalties
6. Add audit logging for all sanity-affecting operations
7. Create database indexes on sanityState for efficient job queries
8. Add rate limiting to sanity loss (max X per minute to prevent spam)

## Estimated Fix Effort
- Critical fixes: 8 hours
- High fixes: 6 hours
- Medium fixes: 4 hours
- Total: 18 hours

**Overall Score: 6.5/10** (Core functionality works but lacks production-grade transaction safety and complete feature implementation)
