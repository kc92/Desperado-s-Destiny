# Stagecoach System Audit Report

## Overview
The Stagecoach System manages passenger travel, ticket booking, route scheduling, and stagecoach ambushes. It includes comprehensive route management, seat allocation, and ambush mechanics with terrain advantages and guard encounters.

## Files Analyzed
- Server: stagecoach.service.ts, stagecoachAmbush.service.ts
- Client: useStagecoach.ts
- Types: stagecoach.types.ts

## What's Done Well
- Realistic ambush mechanics with multiple strategies
- Well-designed terrain advantage system
- Comprehensive loot distribution system
- Good route and spot data structure
- Proper transaction handling for ticket booking
- Guard and driver NPC generation
- Multiple ambush strategies supported
- Clear route pricing and duration calculations

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| In-Memory Ambush Plans | stagecoachAmbush.service.ts:172 | Plans stored only in Map, lost on restart | Persist to database |
| Ticket Refund Exploit | stagecoach.service.ts:557 | Character can cancel ANY ticket for 80% refund | Validate ticket ownership |
| Missing Seat Allocation | stagecoach.service.ts:284 | Random seat assignment not validated | Validate seat availability |
| No Route Validation | stagecoach.service.ts | Can book non-existent routes | Validate route exists |
| Stagecoach Persistence Issue | stagecoach.service.ts:365 | Stagecoach instances only stored in-memory | Persist to database |
| Unvalidated Ambush Setup | stagecoachAmbush.service.ts:234 | No verification ambush time is realistic | Validate ambush timing |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Session Hijacking | stagecoach.service.ts | No check that person on stagecoach is actual ticket holder | Verify ticket holder |
| Location Spoofing | stagecoach.service.ts:662 | Character location not re-verified at completion | Re-verify location |
| Missing Witness Consequences | stagecoachAmbush.service.ts | Witnesses identified but no actual bounty implementation | Implement bounty creation |
| N+1 Query in Seat Calculation | stagecoach.service.ts:270 | getAvailableSeats() called for every booking | Optimize query |
| Casualty Simulation Issues | stagecoachAmbush.service.ts | Guards/passengers killed but no persistence | Track casualties |
| Incomplete Escape Logic | stagecoachAmbush.service.ts:487 | Escape chance calculated but not properly integrated | Complete escape mechanics |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No Stagecoach Capacity Realism | stagecoach.service.ts:119 | Random capacity based on route type | Use fixed capacity per coach type |
| Missing Carriage Integrity | stagecoach.service.ts | Damage to stagecoach not persisted | Track stagecoach condition |
| Incomplete Way Station Integration | stagecoach.service.ts | Stations referenced but not fully integrated | Complete station mechanics |
| Weather Effect Not Implemented | stagecoach.service.ts | weatherAffected flag but no actual impact | Implement weather effects |
| No scheduled departures | stagecoach.service.ts | Coaches leave on demand | Add scheduled departure times |
| Missing robbery report | stagecoachAmbush.service.ts | No newspaper/gossip integration | Add event to newspaper system |

## Bug Fixes Needed
1. **stagecoachAmbush.service.ts:172** - Replace Map with MongoDB collection for ambush plans
2. **stagecoach.service.ts:557** - Validate ticket belongs to requesting character
3. **stagecoach.service.ts:284** - Check seat availability before assignment
4. **stagecoach.service.ts:365** - Persist stagecoach instances to database
5. **stagecoachAmbush.service.ts:234** - Validate ambush time is within stagecoach travel window
6. **stagecoach.service.ts:662** - Re-verify character location at journey completion

## Incomplete Implementations
- Ambush persistence: Plans stored in volatile Map
- Ticket ownership validation: Anyone can refund any ticket
- Witness consequences: Witnesses identified but no bounty created
- Casualty tracking: NPCs killed but not persisted
- Weather effects: Flag exists but no implementation
- Scheduled departures: Coaches leave on demand, no schedule
- Way station integration: Stations exist but no stop mechanics
- Carriage damage: No tracking of stagecoach condition

## Recommendations
1. **IMMEDIATE**: Persist ambush plans to MongoDB collection
2. Add ticket ownership validation for all operations
3. Validate seat availability before booking
4. Re-verify character location at journey completion
5. Implement witness bounty creation after ambush
6. Add stagecoach damage tracking and repair mechanics
7. Complete way station integration with rest stops
8. Implement weather effects on travel and ambush
9. Add scheduled departure times
10. Integrate robbery events with newspaper system

## Estimated Fix Effort
- Critical fixes: 10 hours
- High fixes: 10 hours
- Medium fixes: 8 hours
- Total: 28 hours

**Overall Score: 5/10** (Good ambush mechanics but critical persistence and validation issues; in-memory storage and ticket exploits need immediate attention)
