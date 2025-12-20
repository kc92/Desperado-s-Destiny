# High Stakes Events System Audit Report

## Overview
High Stakes Events System manages special gambling tournaments and events with entry requirements, leaderboards, participant tracking, and prize distribution. Supports level requirements, reputation checks, faction requirements, and item requirements.

## Files Analyzed
- Server: highStakesEvents.service.ts, highStakesEvents.ts
- Types: gambling.types.ts with HighStakesEvent, EventRequirement, GamblingPrize

## What's Done Well
- Comprehensive requirement checking system (level, reputation, faction, items, achievements)
- Clear event state management with active event tracking
- Leaderboard system with ranking
- Prize distribution with multiple prize types (gold, items, titles, reputation)
- Integration with gambling history for record keeping
- Event scheduling logic with duration tracking
- Support for guaranteed prizes (all participants) and leaderboard prizes

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| In-memory participant tracking | highStakesEvents.service.ts:35 | Events stored in volatile Map; lost on server restart | Persist event participants to MongoDB or Redis |
| Race condition on event capacity | highStakesEvents.service.ts:163-166 | Two requests could both pass capacity check before either is saved | Use atomic increment |
| Missing entry fee rollback on failure | highStakesEvents.service.ts:173-175 | Deducts gold before checking all requirements | Move gold deduction to end after all validations |
| No event existence validation | highStakesEvents.service.ts:135-138 | Assumes event exists without checking | Add null check |
| Unvalidated achievement requirement | highStakesEvents.service.ts:111-113 | TODO comment; achievement check not implemented | Implement achievement checking |
| Prize distribution atomicity | highStakesEvents.service.ts:313-348 | Prize awards not transacted; could partially distribute | Wrap all awards in single transaction |
| Leaderboard query N+1 | highStakesEvents.service.ts:228-238 | Fetches character for each leaderboard entry | Use single aggregation pipeline |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No score update validation | highStakesEvents.service.ts:202-214 | Score updates not checked for validity | Add min/max score bounds |
| Item requirement check incomplete | highStakesEvents.service.ts:104-109 | TODO comment; assumes inventory.some exists | Validate inventory structure |
| Criminal reputation field access | highStakesEvents.service.ts:92-94 | Accesses character.criminalReputation but may not exist | Verify field exists |
| Missing event end time check | highStakesEvents.service.ts:145-149 | Checks if active but no validation that event hasn't ended | Add eventEnd vs current time check |
| Concurrent score updates unsafe | highStakesEvents.service.ts:207-213 | Multiple simultaneous score updates could race | Use database updates instead |
| Prize amount not validated | highStakesEvents.service.ts:270-296 | Prize amounts used directly without validation | Add validation |
| No refund on event cancellation | highStakesEvents.service.ts:300 | Participants lose entry fees with no refund | Implement refund mechanism |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Hardcoded prize multiplier | highStakesEvents.service.ts:282 | Prize logic assumes index-based placement; doesn't handle ties | Document tie-breaking logic |
| Missing timestamp validation | highStakesEvents.service.ts:40-55 | Uses currentDate but doesn't validate it's reasonable | Add timestamp validation |
| No event duplication prevention | highStakesEvents.service.ts:126-197 | Same character could join same event multiple times | Move duplicate check inside transaction |
| Incomplete notification system | highStakesEvents.service.ts:189 | Logs join but doesn't send notification | Send join confirmation notification |
| Score persistence missing | highStakesEvents.service.ts:202-214 | Updates in-memory scores but doesn't persist | Add saveParticipant call |
| No event access control | highStakesEvents.service.ts:353-370 | getEventDetails doesn't verify user has view permission | Add ownership/permission checks |

## Bug Fixes Needed
1. **highStakesEvents.service.ts:35** - Replace Map with MongoDB: create EventParticipation collection
2. **highStakesEvents.service.ts:164** - Add atomic increment: findByIdAndUpdate({ $inc: { participantCount: 1 } })
3. **highStakesEvents.service.ts:174** - Move gold deduction to line 186 after all validations
4. **highStakesEvents.service.ts:135** - Add: if (!event) throw new Error('Event not found')
5. **highStakesEvents.service.ts:228-230** - Use aggregation: Character.aggregate([{ $match: { _id: { $in: ids } } }])
6. **highStakesEvents.service.ts:294** - Add validation: if (!prize.amount || prize.amount <= 0) throw error
7. **highStakesEvents.service.ts:207-213** - Add database save for score updates

## Incomplete Implementations
- Persistent participant tracking: Uses volatile in-memory Map instead of database
- Achievement requirement checking: TODO comment indicates unimplemented
- Item requirement validation: TODO comment; uses .some() without structure validation
- Transaction consistency: Prize distribution not atomic
- Event persistence: No database storage across server restarts
- Concurrent score updates: Updates are in-memory and not atomic
- Refund mechanism: No way to refund entry fees on event cancellation

## Recommendations
1. **IMMEDIATE**: Move participant tracking to MongoDB EventParticipation collection
2. Add race condition protection using atomic operations for capacity checks
3. Move gold deduction to end of validation chain to prevent loss on failure
4. Implement transactional prize distribution
5. Optimize N+1 leaderboard query with aggregation
6. Implement achievement requirement checking
7. Add player notifications for event join/leave/win
8. Add event access control and ownership verification

## Estimated Fix Effort
- Critical fixes: 8 hours
- High fixes: 6 hours
- Medium fixes: 5 hours
- Total: 19 hours

**Overall Score: 5.5/10** (Significant architectural issues with in-memory event tracking and race conditions; must migrate to database-backed participant tracking)
