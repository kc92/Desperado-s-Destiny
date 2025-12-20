# Day/Night Cycle Audit Report

## Overview
The Time Service manages game time acceleration (4:1 ratio), time periods, building operating hours, and time-based gameplay effects. It provides crime availability checking and NPC availability calculation based on time period.

## Files Analyzed
- Server: time.service.ts, Location.model.ts

## What's Done Well
- Clear time period definitions with 7 periods (dawn, morning, noon, afternoon, evening, night, midnight)
- Comprehensive building profile system with default operating hours
- Time-based effect modifiers for crime detection, NPC activity, and shop availability
- Proper period calculation from hour values
- Midnight wraparound handling for buildings open late
- Crime time restriction system with clear business hour logic
- Location description variation based on time
- NPC availability probability based on activity level

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Time progression not automated | time.service.ts:30-31 | Game time calculated from real time but doesn't update on server - relies on client calls | Implement background job to tick game time (separate from client) |
| Race condition in operating hours check | time.service.ts:322-376 | Multiple simultaneous checks could have millisecond inconsistencies | Cache current hour for duration of request |
| No persistence of time-based state changes | time.service.ts:304-314 | Time state calculated but not saved - NPC positions, shop inventory not persisted | Implement time tick job to update world state |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Crime availability hardcoded to crimeName | time.service.ts:394-396 | String matching on crime name fragile - typo breaks functionality | Use crimeId instead of name, validate existence |
| Missing handling of 24-hour wraparound | time.service.ts:352-357 | Midnight wraparound logic only works if openHour > closeHour (e.g., 20-4) - fails for edge cases | Add explicit test for midnight-crossing hours |
| No bounds checking for building hours | time.service.ts:332-348 | Building hours can be 0-23 but no validation that open < close (when not wrapping) | Validate hours: 0-23, and either open < close or open > close (wraparound) |
| NPC availability calculation too simplistic | time.service.ts:432-448 | Only uses activity level > 0.5, ignores character's schedule data | Implement full schedule-based NPC availability |
| Time effects not applied to travel speed | time.service.ts:245-299 | TimeEffects defined but not applied to travel time calculations | Integrate with LocationService travel calculations |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Building profile for unknown types | time.service.ts:338-345 | Unknown building types treated as "always open" without warning | Log warning for unmapped building types |
| Crime detection modifier mismatch | time.service.ts:418-423 | Returns crimeDetectionModifier but should return actual detection chance | Calculate `baseWitnessChance * crimeDetectionModifier` |
| Incomplete time effect coverage | time.service.ts:245-299 | TimeEffects missing stealth modifier, perception modifier, combat accuracy | Extend TimeEffects interface with additional modifiers |
| Missing timezone support | time.service.ts:30-31 | GAME_START_TIME hardcoded to UTC - multiplayer servers could desync | Store timezone or use epoch-based calculation |
| Location description generation not queried | time.service.ts:458-489 | getLocationDescription is static utility but never called from controllers | Missing integration with location responses |

## Bug Fixes Needed
1. Implement background job for game time progression (separate service)
2. **time.service.ts:394-396** - Use crimeId instead of crimeName for crime availability check
3. **time.service.ts:330-348** - Add validation for building hours: validate open/close are 0-23
4. Cache currentHour at request level to prevent millisecond inconsistencies
5. **location.controller.ts:800** - Integrate getLocationDescription into location response

## Incomplete Implementations
- Automated game time progression (relies on manual calls)
- Time-based inventory restocking
- Time-based NPC schedule persistence
- Time-based encounter table rotation
- Time-based shop availability enforcement (calculated but not enforced)
- Skill-based time modifiers (stealth at night, perception at dawn, etc.)
- Circadian rhythm effects on character performance

## Recommendations
1. **CRITICAL**: Implement background time tick job to progress game time
2. **HIGH**: Add validation for building operating hours
3. **HIGH**: Integrate time effects into travel and skill calculations
4. **MEDIUM**: Implement time-based shop inventory rotation
5. **MEDIUM**: Add skill-based modifiers to TimeEffects
6. **MEDIUM**: Create NPC schedule persistence on time progression
7. **LOW**: Implement timezone support for multiplayer

## Estimated Fix Effort
- Critical fixes: 4 hours
- High fixes: 3 hours
- Medium fixes: 6 hours
- Total: 13 hours

**Overall Score: 7/10** (Good time period structure but missing automated progression and integration with other systems)
