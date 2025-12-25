# NPC Schedules System Audit Report

## Overview
The Schedule Service is a well-architected system that manages NPC daily routines and location tracking. It implements time-based availability checking, activity-dependent dialogue generation, and location-based NPC discovery. The service is built on an in-memory cache model with integration to the TimeService for game hour calculations.

## Files Analyzed
- Server: schedule.service.ts
- Data: npcSchedules.ts
- Supporting: time.service.ts

## What's Done Well
- Clean separation of concerns with static utility methods
- Comprehensive schedule entry calculation with proper midnight wraparound logic
- Excellent time period enumeration patterns for activity-specific dialogue
- Good documentation with detailed JSDoc comments for all public methods
- Efficient cache-based lookup (Map data structure) for O(1) access
- Intelligent mood system for dialogue variation (friendly/neutral/busy/hostile)
- Smart next activity prediction for player guidance
- Proper logging of state changes for debugging

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Database Persistence Missing | schedule.service.ts:32 | Schedule cache is in-memory only; no database persistence. On server restart, all schedule state is lost | Implement MongoDB persistence with cache warming on startup |
| No Input Validation | schedule.service.ts:51-53 | getNPCSchedule accepts any npcId without validation, can crash if null | Add npcId format validation and existence checks |
| Dialogue Patterns Not Loaded | schedule.service.ts:249 | References ACTIVITY_DIALOGUE_PATTERNS that may not exist; no fallback if data file fails to load | Add error handling for missing data files at initialization |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| N+1 Query Pattern | schedule.service.ts:193-199 | getAllNPCSchedules() called in loop, then getCurrentActivity() called for each NPC (getAllNPCLocations method) | Refactor to batch process locations or use database join |
| No Hour Validation | schedule.service.ts:69 | getScheduleEntryAtHour accepts any hour without bounds checking (0-23); can produce incorrect results | Add validation: `if (hour < 0 || hour > 23) throw error` |
| Midnight Wraparound Edge Case | schedule.service.ts:77-88 | Logic assumes startHour and endHour are populated; no null check. What if entry.endHour is undefined? | Add defensive checks for undefined schedule properties |
| No Concurrency Control | schedule.service.ts:379 | setNPCSchedule modifies cache without locking; multiple simultaneous updates could corrupt state | Add mutex/locking for cache mutations |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Dialogue Random Selection Weak | schedule.service.ts:271 | Math.floor(Math.random() * array.length) is not cryptographically secure, but acceptable for game logic; inconsistent implementation | Create utility function for weighted random selection |
| Poor Error Recovery | schedule.service.ts:107-112 | Returns null silently instead of returning default activity state; client has no way to distinguish "NPC not found" from "no schedule entry" | Return error object with reason codes |
| Reputation Hard-Coded Thresholds | schedule.service.ts:293-297 | Thresholds for mood calculation (75 for friendly, 25 for hostile) are magic numbers | Extract to constants at module level |
| getNextScheduleEntry Assumption | schedule.service.ts:150-154 | Assumes if hour > currentHour, it's the next entry. Doesn't handle entries that wrap past midnight correctly for next-day calculation | Add day-of-week awareness for proper week wrapping |

## Bug Fixes Needed
1. **schedule.service.ts:51** - Add null/undefined check for npcId before Map.get()
2. **schedule.service.ts:69** - Add hour validation: `if (hour < 0 || hour > 23) return null`
3. **schedule.service.ts:107-112** - Create and return error object instead of null
4. **schedule.service.ts:145** - Fix week-wraparound logic for getNextScheduleEntry
5. **schedule.service.ts:193-199** - Batch NPC locations query to avoid nested loop
6. **schedule.service.ts:379** - Add database persistence call after cache update
7. **schedule.service.ts:390** - Log schedule updates to database transaction log

## Incomplete Implementations
- In-memory cache has no TTL or refresh mechanism; schedules are static
- No support for dynamic schedule modifications at runtime (only setNPCSchedule/removeNPCSchedule)
- No relationship tracking between NPCs (e.g., "NPC A always meets NPC B at location X")
- getUpcomingActivities doesn't account for multi-day spans properly
- No real-time schedule change notifications to connected clients

## Recommendations
1. **URGENT**: Implement database persistence for schedules (MongoDB schema: NPCSchedule collection)
2. Add Redis cache layer with 5-minute TTL for high-frequency queries (getAllNPCLocations called on location load)
3. Create ScheduleValidator class with comprehensive input/output checking
4. Add Zod schema validation for all schedule data at initialization
5. Implement event-driven system for schedule changes (emit event when NPC moves locations)
6. Create batch query method: `getNPCActivitiesForLocation(locationId)` to avoid N+1
7. Add database indexes on npcId, locationId, and activity type fields
8. Create schedule caching strategy: cache miss → load from DB → warm cache for 5 min
9. Add schedule history/audit table for debugging and rollback
10. Implement circuit breaker for TimeService dependency failures

## Estimated Fix Effort
- Critical fixes: 4 hours
- High fixes: 6 hours
- Medium fixes: 3 hours
- Total: 13 hours

**Overall Score: 6.5/10** (Solid core logic but lacks production-ready persistence, validation, and error handling; in-memory cache is a major limitation)
