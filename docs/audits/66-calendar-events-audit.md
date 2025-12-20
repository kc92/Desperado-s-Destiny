# Calendar/Events System Audit Report

## Overview
The Calendar System manages the game calendar with weekly/monthly/yearly progression, seasonal effects, holidays, moon phases, and scheduled events. It syncs game time with real-world elapsed time and applies seasonal modifiers to gameplay.

## Files Analyzed
- Server: calendar.service.ts, season.service.ts, GameCalendar.model.ts, WorldState.model.ts

## What's Done Well
- Singleton calendar pattern for global time state
- Real-world to game-time conversion (1 real day = 1 game week)
- Comprehensive seasonal effects system with 4 seasons
- Moon phase calculation based on day-of-year (28-day cycle)
- Holiday tracking with active holiday detection
- Scheduled event support with recurring patterns
- Proper time sync on startup
- Seasonal modifier system for travel, energy, hunting, fishing
- Moon phase effects including supernatural encounter chance

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Race condition in advanceTime | calendar.service.ts:107-142 | Calendar read, advanced, and saved without atomic operation | Use MongoDB transaction or atomic findAndModify |
| Calendar not auto-advancing | calendar.service.ts:107-142 | advanceTime must be called manually - no background job | Implement scheduled job to call advanceTime periodically |
| Month bounds overflow not handled | calendar.service.ts:230-233 | expectedMonth calculation can exceed 12 without wrapping | Add proper modulo: `expectedMonth = ((gameMonthsPassed) % 12) + 1` |
| Multiple calendar instances possible | calendar.service.ts:36-44 | No enforcement of singleton pattern - multiple calendars could be created | Add unique index on singleton flag or collection count check |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Console.log instead of logger | calendar.service.ts:139-141, 155, 260, 292, 305 | Production code uses console.log instead of logger | Replace all `console.log` with logger calls |
| Holiday date calculation imprecise | calendar.service.ts:148-151 | Approximates day of month as (week-1)*7 + day - fails for multi-week holidays | Use exact date comparison with start/end dates |
| Moon phase methods called incorrectly | calendar.service.ts:268-270 | Calls `(calendar as any).getSeasonForMonth()` - undefined method | These methods are on schema but need explicit typing |
| Synchronized time check missing | calendar.service.ts:250-294 | syncCalendar doesn't verify season/moon phase after sync | Add validation that season and moon phase match expected values |
| Season change doesn't persist to DB | calendar.service.ts:114-129 | advanceTime changes seasonalEffects but doesn't verify save completes | Add `await calendar.save()` error handling |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Holiday lookup only by ID | calendar.service.ts:88-90 | activeHolidayId lookup works but doesn't handle missing holidays | Add fallback and logging for missing holiday |
| Timestamp calculation fragile | calendar.service.ts:191-192 | dateToTimestamp uses year*10000 + month*100 + week*10 + day - could overflow | Use proper date comparison instead |
| Day of year calculation wrong | calendar.service.ts:287-294 | getDayOfYear assumes 28 days/month but calendar system uses 7-day weeks - inconsistent | Clarify: is it 28 days/month or 4 weeks/month? |
| Missing event end date handling | calendar.service.ts:182-185 | endDate optional but compared with Infinity - could produce incorrect results | Require endDate or clarify one-time vs recurring events |
| Seasonal effects not applied to economy | season.service.ts:55-57 | getSeasonalEffects fetched but not applied to shop prices, creature spawns | No integration with shop/economy systems |
| Moon phase bonus combined naively | season.service.ts:135-140 | getFishingBonus just adds season + moon bonuses - could create unrealistic values | Cap total bonus or use multiplicative formula |

## Bug Fixes Needed
1. Implement background job to call advanceTime daily (separate service)
2. **calendar.service.ts:230** - Fix month calculation: `expectedMonth = 1 + (gameMonthsPassed % 12)`
3. **calendar.service.ts:268-270** - Add `as IGameCalendar` typing to calendar methods
4. **calendar.service.ts:139, 155, 260, 292, 305** - Replace all `console.log` with logger
5. **GameCalendar.model.ts:287-294** - Fix getDayOfYear calculation to match 28-day month system
6. Add `npcActivityModifier` to SeasonalEffects interface

## Incomplete Implementations
- Automatic calendar advancement (no background job)
- Event persistence and querying
- Recurring event pattern handling
- Holiday-based event generation
- Integration of seasonal effects with shops/economy
- Integration of moon phase with supernatural encounters
- Calendar reset/initialization on new game
- Historical calendar tracking

## Recommendations
1. **CRITICAL**: Implement background job to advance calendar daily
2. **CRITICAL**: Use atomic transactions for calendar updates
3. **HIGH**: Fix month calculation overflow bug
4. **HIGH**: Replace console.log with proper logger
5. **HIGH**: Clarify week/month/day calculation system
6. **MEDIUM**: Integrate seasonal effects with economy system
7. **MEDIUM**: Implement event persistence and querying
8. **LOW**: Add historical calendar tracking for world progression

## Estimated Fix Effort
- Critical fixes: 5 hours
- High fixes: 4 hours
- Medium fixes: 6 hours
- Total: 15 hours

**Overall Score: 6/10** (Good seasonal and moon phase systems but critical missing auto-advancement and race conditions)
