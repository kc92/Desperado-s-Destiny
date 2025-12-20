# Crowd System Audit Report

## Overview
The Crowd Service dynamically calculates population density at locations based on time of day, weather, events, and day-of-week patterns. It provides detailed crowd calculations with multiple factors and atmospheric descriptions. The system is well-designed for atmospheric gameplay but has performance and persistence issues.

## Files Analyzed
- Server: crowd.service.ts
- Supporting: time.service.ts, worldEvent.service.ts

## What's Done Well
- Excellent multi-factor crowd calculation system
- Comprehensive crowd patterns for 25+ location types with realistic time variations
- Detailed atmospheric descriptions with multiple variations per crowd level (365+ descriptions)
- Proper weather modifier logic with indoor/outdoor distinction
- Solid crowd level determination thresholds
- Good factor tracking for transparency in calculations
- Crime modifier system thoughtfully integrated with crowd levels
- Excellent documentation with JSDoc for all methods

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Location DB Query in Loop | crowd.service.ts:857 | updateAllLocationCrowds iterates all locations and calls getCrowdLevel per location, resulting in O(n) DB calls with no batching | Refactor to batch query all locations and calculate in parallel |
| No Error Handling on DB Failures | crowd.service.ts:548-551 | Location.findById fails silently, returns null, but doesn't log error; crowd level becomes null without indication | Add try-catch with proper error logging and graceful defaults |
| Floating Point Precision Issues | crowd.service.ts:636 | estimatedCount = Math.round(capacity * finalMultiplier) can produce 0 for low multipliers; no minimum population | Add Math.max(1, estimatedCount) to ensure realistic minimums |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Event Modifier Async Without Await | crowd.service.ts:606 | getEventModifier is async but called in synchronous context; will return Promise instead of number | Make calculateCrowd fully async and await eventModifier |
| Weather Modifier Unrealistic | crowd.service.ts:694-705 | Dust storm reduces outdoor crowds to 20% instantly; no gradual effect ramp. Real behavior would be gradual accumulation | Add weather severity levels (light rain 0.8x, heavy rain 0.6x) |
| Hard-Coded Day Modifiers | crowd.service.ts:738-751 | Weekend logic assumes dayOfWeek % 7 == 6 or 0; doesn't match TimeService's actual week calculation | Align day-of-week calculation with TimeService.getCurrentGameTime() |
| No Cache Mechanism | crowd.service.ts:546-574 | getCrowdLevel called every location load, recalculates from scratch each time | Implement Redis caching with 10-minute TTL |
| Missing Capacity Defaults | crowd.service.ts:772-774 | Unknown location types default to 50 capacity; may be unrealistic for large outdoor areas | Add location size categories (tiny/small/medium/large/massive) |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Random Variation Too Wide | crowd.service.ts:626 | ±10% random variation (0.9-1.1) can cause crowd level to jump dramatically between calls | Add smoothing: track previous value and allow max 5% change per update |
| Atmosphere Selection Is Non-Deterministic | crowd.service.ts:836-846 | Random selection means same crowd level produces different descriptions on each call; unrealistic for world consistency | Seed random with locationId and hour for deterministic results |
| Day Modifier Not Location-Aware | crowd.service.ts:736-753 | All entertainment venues get 1.3x on weekends; doesn't account for seasonal events or individual location preferences | Add per-location weekend multiplier overrides |
| No Location Type Validation | crowd.service.ts:652 | getTimeMultiplier doesn't validate locationType exists in CROWD_PATTERNS; silently falls back to 'default' | Log warning when using default pattern, add schema validation |

## Bug Fixes Needed
1. **crowd.service.ts:548** - Add error handling with default crowd state fallback
2. **crowd.service.ts:606** - Make calculateCrowd async and await getEventModifier
3. **crowd.service.ts:636** - Add Math.max(1, estimatedCount) to prevent zero crowds
4. **crowd.service.ts:738** - Align day-of-week calculation with TimeService constants
5. **crowd.service.ts:857** - Batch location queries using Location.find() then process
6. **crowd.service.ts:626** - Add smoothing logic with previous crowd state tracking
7. **crowd.service.ts:836** - Use deterministic seed: `seed = hash(locationId + hour)`

## Incomplete Implementations
- No historical crowd data tracking (can't see if "usually crowded at 3pm")
- updateAllLocationCrowds creates no persistence; calculated values are discarded
- No special event crowd bonuses (e.g., +50% for festival)
- No location-specific modifiers (some places just busy naturally)
- No faction-based crowd variations (settlements vs. hideouts)
- No crowd movement between adjacent locations
- No occupancy limit enforcement (what happens at 100% capacity?)

## Recommendations
1. **URGENT**: Implement caching layer (Redis) with 10-minute TTL for crowd calculations
2. Make calculateCrowd fully async to handle async event modifier properly
3. Add crowd state persistence to database (CrowdSnapshot collection) with hourly snapshots
4. Create location type validation with Zod schema
5. Refactor updateAllLocationCrowds to use batch queries (Location.find() single call)
6. Add location-specific crowd baselines in Location model
7. Implement deterministic atmosphere descriptions (same inputs = same output)
8. Add crowd smoothing to prevent unrealistic spikes between hourly updates
9. Create CrowdEvents for major crowd changes (alert players to interesting dynamics)
10. Add special handling for faction-controlled areas (hideouts always sparse, settlements vary)

## Estimated Fix Effort
- Critical fixes: 5 hours
- High fixes: 4 hours
- Medium fixes: 3 hours
- Total: 12 hours

**Overall Score: 6/10** (Strong atmospheric design but significant performance issues with async handling and lack of caching)
