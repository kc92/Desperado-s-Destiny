# Legacy Progression System Audit Report

## Overview
The legacy system tracks lifetime player statistics across all characters and maps them to milestone completions and tier progression. It provides cross-character bonuses, starting equipment for new characters, and a prestige-like mechanism. The system uses comprehensive event mapping, tier definitions, and reward management with proper persistence in MongoDB.

## Files Analyzed
- Server: legacy.service.ts, legacy.controller.ts, legacy.routes.ts, LegacyProfile.model.ts
- Data: data/legacy/milestones.ts, data/legacy/tiers.ts (referenced)

## What's Done Well
- Comprehensive event type system covering 29+ different activities (combat, economic, social, exploration)
- Well-designed tier progression based on milestone completions
- Proper MongoDB model with instance methods for stat updates
- Good separation of concerns: service handles logic, controller handles HTTP, model handles persistence
- Transaction-like consistency through getOrCreate() pattern
- Proper authentication check on all routes (requireAuth middleware)
- Reward system with one-time use tracking and claiming logic
- Character contribution tracking for prestige validation
- Milestone progress tracking with completion counts
- Good error sanitization in controller responses

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Missing character ownership validation | legacy.controller.ts:166 | `claimReward()` has TODO comment but no verification that characterId belongs to authenticated user | Implement character ownership check against User model before processing |
| Race condition in milestone checking | legacy.service.ts:201-250 | Multiple concurrent stat updates could miss milestone thresholds - no transaction wrapping | Wrap checkMilestones() calls in optimistic locking or version control |
| Stat increment vulnerability | legacy.service.ts:210-212 | Uses loose `+=` operator without bounds - stat could overflow if extreme values provided | Add max bounds: `Math.min(Number.MAX_SAFE_INTEGER, current + value)` |
| No validation of reward.bonus structure | legacy.service.ts:233-245 | Creates LegacyReward with bonus object but no schema validation - could have malformed data | Validate bonus against LegacyBonusType and required fields |
| Quest type metadata not validated | legacy.service.ts:148-154 | `payload.metadata?.questType` accepted without enum validation - could create unwanted stat buckets | Only allow: 'legendary' | 'story' | 'side' |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Bonus calculation overflow risk | legacy.service.ts:364-410 | Additive multiplier stacking could result in multipliers > 100x if many bonuses applied | Cap multipliers at reasonable limit (e.g., 5x max) |
| Missing tier definition bounds | legacy.service.ts:256-258 | Calls getTierDefinition() without validation that tier exists - could fail if tier enum is wrong | Add explicit validation: `if (!tierDef) throw new AppError(...)` |
| Repeatable milestone vulnerability | legacy.service.ts:206-210 | Allows unlimited claim of repeatable milestone rewards - no cooldown or cap | Add repeatable claim cooldown or cap at N claims per tier |
| Unsafe reward filter logic | legacy.service.ts:271-273 | Filters rewards with `!r.claimed || !r.oneTimeUse` - logic is OR not AND, could claim already-used one-time rewards | Change to: `!r.claimed && (!r.oneTimeUse || !r.claimedAt)` |
| No validation of milestone requirements | legacy.service.ts:201-250 | Milestone.requirement used directly without bounds - could be 0 or negative | Validate milestone config: `require(m.requirement > 0)` |
| Update stat endpoint not admin-guarded | legacy.controller.ts:256-287 | `/admin/update-stat` has NO admin check, allows any authenticated user to manipulate stats | Add admin authorization middleware |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Event payload not validated | legacy.service.ts:46-76 | `updateLegacyProgress()` accepts any LegacyEventPayload without schema validation | Add Zod/ts-guard validation at controller level |
| Missing userId validation | legacy.controller.ts:26,57,109 | Uses `req.user!._id` with non-null assertion - could crash if auth middleware fails | Add guard: `if (!req.user) { res.status(401)... return; }` |
| Inconsistent error handling | legacy.controller.ts:25-45 vs 150-181 | Some endpoints return 500, others return 400 for same error types | Standardize error responses |
| Response structure inconsistency | legacy.controller.ts:38 vs 113 | getLegacyProfile wraps in object, getActiveBonuses returns raw object - inconsistent API | All endpoints should return consistent wrapper |
| Character date tracking wrong | legacy.service.ts:311 | `playedFrom` set to current date, should be character creation date | Track character createdAt and pass to aggregateCharacterStats() |
| Missing contribution archiving | legacy.service.ts:296-334 | Character contributions accumulate forever, no archiving of old/inactive characters | Consider archiving contributions from > 1 year ago |

## Bug Fixes Needed
1. **legacy.controller.ts:166** - Add character ownership validation before reward claim
2. **legacy.controller.ts:256-287** - Add admin authorization check on /admin/update-stat endpoint
3. **legacy.service.ts:210-212** - Add bounds checking on stat increments
4. **legacy.service.ts:364-410** - Add caps on multiplier stacking (max 5x)
5. **legacy.service.ts:271-273** - Fix reward filter logic
6. **legacy.service.ts:311** - Change playedFrom to accept createdAt from character data
7. **legacy.service.ts:46-76** - Add schema validation for incoming event payloads
8. **legacy.controller.ts:26,57,109,132,192** - Add null checks for req.user
9. **legacy.service.ts:148-154** - Validate questType against enum

## Incomplete Implementations
- No endpoints to view other players' legacy profiles (public leaderboard)
- No visual tier progression indicators (percentile to next tier)
- Reward claiming logic doesn't apply bonuses to character (just returns bonus data)
- No expire mechanics for unclaimed rewards (could accumulate indefinitely)
- Missing feature unlock tracking (unlockedFeatures array not checked anywhere)
- No seasonal event tracking or reset mechanics
- Character contribution history has no indexing for performance queries
- No migration path for early players who started before legacy system
- Admin update-stat endpoint has no admin guard
- Mastery achievement tracking incomplete

## Recommendations
1. **CRITICAL PRIORITY**: Add character ownership validation in claimReward()
2. **CRITICAL PRIORITY**: Add admin authorization check on /admin/update-stat endpoint
3. **CRITICAL PRIORITY**: Add bounds checking and validation on all stat increments
4. Implement schema validation for LegacyEventPayload using Zod
5. Fix reward filter logic to prevent claiming already-used one-time rewards
6. Standardize all error responses to consistent format
7. Add tier definition and milestone requirement validation
8. Implement reward expiration mechanics (e.g., expire after 90 days if unclaimed)
9. Add character contribution archiving for old characters
10. Create public legacy leaderboard endpoint showing top players/tiers
11. Implement tier progress visualization with percentile to next tier
12. Add integration hooks to actually apply bonuses to new characters
13. Create admin endpoints to view/audit legacy progression

## Estimated Fix Effort
- Critical fixes: 4 hours
- High fixes: 6 hours
- Medium fixes: 5 hours
- Total: 15 hours

**Overall Score: 6.5/10** (Comprehensive event mapping but missing character validation in reward claiming and no admin protection on stat manipulation endpoint)
