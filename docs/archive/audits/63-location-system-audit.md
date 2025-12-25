# Location System Audit Report

## Overview
The Location System manages travel mechanics, location discovery, region management, and location-specific actions. It integrates with weather, world events, encounters, and quest systems with atomic transaction support. The system uses a hierarchical structure with zones, regions, and buildings.

## Files Analyzed
- Server: location.service.ts, location.controller.ts, Location.model.ts
- Client: location.service.ts, useWorldStore.ts

## What's Done Well
- Comprehensive atomic transaction handling for travel with MongoDB sessions
- Proper energy cost calculations with weather and world event modifiers
- Zone-aware navigation with adjacent zone discovery
- Hierarchical location structure (regions → locations → buildings)
- Encounter checking before energy deduction (prevents exploit)
- Connection graph-based travel with flexible energy costs
- Good separation of concerns between controller and service
- Proper error handling with detailed failure messages
- Integration with multiple systems (weather, encounters, quests)

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Missing transaction session cleanup on successful save | location.service.ts:350 | Session is committed but not explicitly ended - potential resource leak if followed by error | Always call `session.endSession()` after commit in finally block |
| Job cooldown Map type issue | location.service.ts:474 | `character.jobCooldowns` cast as Map but may not initialize properly | Initialize as Map in Character model if not already |
| Transaction not aborted on EncounterService error | location.service.ts:177-188 | If EncounterService throws, transaction isn't explicitly handled | Wrap EncounterService call in try-catch inside transaction |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| N+1 query in getAvailableActions | location.service.ts:87-90 | Finds action IDs then fetches all in separate query | Use `findById().populate()` or fetch by ID array in single query |
| Race condition in travel energy cost calculation | location.service.ts:280-291 | Energy checked after weather/event modifications but character hasn't saved yet | Verify character energy after all modifiers, not before |
| Missing bounds check for energy cost modifiers | location.service.ts:231-271 | Weather and event modifiers applied sequentially without cap - cost could exceed 100x | Implement max energy cost cap per travel |
| Unsafe ObjectId handling in getCurrentLocation | location.controller.ts:109-114 | String comparison for ObjectId detection may fail with edge cases | Use `ObjectId.isValid()` from mongoose properly |
| Job rewards applied outside transaction | location.service.ts:526-540 | Gold/XP rewards added after transaction commit - rollback vulnerable | Move GoldService.addGold and addExperience inside transaction |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Weapon/armor filtering not implemented | location.service.ts:73-106 | getAvailableActions doesn't filter by character equipment or permissions | Add permission checking for location-specific actions |
| Missing location discovery tracking | location.service.ts:149-392 | Travel doesn't mark locations as discovered or update map state | Add discovery tracking for world map progression |
| No validation of location connections | location.service.ts:208-223 | Connection validity not checked before allowing travel | Verify connection exists and is valid before travel |
| Weather service error silently ignored | location.service.ts:251-254 | Weather check failure logged but travel proceeds normally | Consider failing travel if weather check fails |
| Shop purchase item mutation risk | location.service.ts:672-681 | Directly mutates inventory array without validation | Clone inventory item before pushing |

## Bug Fixes Needed
1. **location.service.ts:386-391** - Add `finally` block to ensure `session.endSession()` called in travelToLocation
2. **Character.model.ts** - Ensure Character model initializes jobCooldowns as Map
3. **location.service.ts:526** - Pass session to GoldService.addGold in performJob
4. **location.service.ts:271** - Add `Math.min(energyCost, MAX_ENERGY_COST)` after all modifiers
5. **location.service.ts:87** - Use Location.find().populate('actions') for getAvailableActions

## Incomplete Implementations
- Location discovery tracking (no flag for visited/discovered locations)
- Dynamic shop inventory (shops have static items, no restock mechanics)
- Location reputation effects (no reputation gain/loss for actions at locations)
- Building schedule enforcement (operating hours checked but not enforced for crimes/jobs)
- Crowd effects on job/crime success rates
- Location-specific skill requirements

## Recommendations
1. **HIGH**: Fix transaction session cleanup to prevent resource leaks
2. **HIGH**: Move all reward operations inside database transaction
3. **HIGH**: Implement energy cost caps to prevent exploits
4. **MEDIUM**: Add location discovery tracking for progression
5. **MEDIUM**: Implement building schedule enforcement for all location activities
6. **MEDIUM**: Add crowd-based modifiers to all location activities
7. **LOW**: Optimize N+1 queries with population/aggregation

## Estimated Fix Effort
- Critical fixes: 3 hours
- High fixes: 5 hours
- Medium fixes: 6 hours
- Total: 14 hours

**Overall Score: 7/10** (Good transaction handling and structure but session cleanup and reward transaction issues need fixing)
