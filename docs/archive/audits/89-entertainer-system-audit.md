# Entertainer System Audit Report

## Overview
The Entertainer System provides wandering NPC performers who travel between locations on fixed routes, offer performances for energy, and teach learnable skills. Uses static data-driven configurations for performers, schedules, and interactions. Integrates with character energy/gold systems and trust levels.

## Files Analyzed
- Server: entertainer.service.ts, entertainer.controller.ts, entertainer.routes.ts
- Client: useEntertainers.ts

## What's Done Well
- Clean separation of concerns (routes → controller → service)
- Comprehensive API endpoints for public and protected operations
- Good route organization with proper authentication/authorization middleware
- Well-structured useEntertainers hook with loading/error state management
- Trust-based skill learning system with cost validation
- Multiple query endpoints for flexibility (by type, location, schedule)
- Proper use of asyncHandler for error handling
- Performance recommendations system (foundation for future enhancement)
- Schedule calculation system for location routing

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Hardcoded Trust Placeholder | entertainer.service.ts:207 | `entertainer.trustLevel` used directly instead of querying actual player trust | Implement trust tracking system: `NPCTrust.findOne({characterId, entertainerId})` |
| Missing Inventory Integration | entertainer.service.ts:136 | Item rewards from performances not added to inventory | Implement actual InventoryService integration |
| No Buff System Integration | entertainer.service.ts:140-153 | Buff application commented as "depends on buff system" - not applied | Integrate with character buff system |
| Incomplete Mood System | entertainer.service.ts:418-420 | Mood effects loaded but not persisted | Implement mood tracking in character model |
| Transaction Safety Missing | entertainer.service.ts:103,124,130,161,247,260 | Gold/energy modifications not transactional | Wrap all resource modifications in MongoDB transactions |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Hardcoded Trust Check Value | entertainer.service.ts:374 | Magic number `20` for gossip trust threshold | Extract to constant: `GOSSIP_MIN_TRUST = 20` |
| No Rate Limiting on Client | useEntertainers.ts:342-360 | Multiple rapid performance watches could spam server | Add client-side debouncing |
| Skill Learning Without Verification | entertainer.service.ts:201 | Skill lookup uses find() but doesn't verify skill belongs to entertainer | Add validation |
| Missing Gold Refund on Failure | entertainer.service.ts:234-242 | If learning fails after checks pass but before save, gold deducted but skill not granted | Implement atomic transaction |
| Static Performance Data | entertainer.service.ts:499 | `getRecommendedPerformances` returns hardcoded "top 5" with no actual recommendation logic | Implement actual recommendation algorithm |
| No Entertainer Availability Check | entertainer.controller.ts:104-120 | getLocationPerformances doesn't verify performances match location schedule | Add schedule validation |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Hardcoded Schedule Values | entertainer.service.ts:352 | Time ranges hardcoded without explanation | Create PerformanceSchedule type with clear semantics |
| No Schedule Conflict Resolution | entertainer.service.ts:310-327 | Route calculation doesn't handle overlapping stay durations | Add validation for route stays |
| Incomplete Search | entertainer.controller.ts:196-213 | Search only matches name/title, no filtering by performance type or location | Enhance search parameters |
| Gossip Generation Stub | entertainer.service.ts:393-398 | Gossip content is placeholder strings, not connected to gossip system | Integrate with Gossip model |
| No Day-Based Filtering | entertainer.controller.ts:104-120 | getLocationPerformances doesn't actually filter by day parameter | Add day-based schedule validation |
| Missing Null Checks | entertainer.service.ts:85,323 | Potential null dereference if performance/stop not found | Add explicit null checks |

## Bug Fixes Needed
1. **entertainer.service.ts:207** - Replace placeholder trust with NPCTrust query
2. **entertainer.service.ts:136** - Implement item reward: `InventoryService.addItem(characterId, performance.rewards.item, 1)`
3. **entertainer.service.ts:151** - Implement buff application: `character.addActiveBuff(...)`
4. **entertainer.service.ts:103,124,130,160-161** - Wrap in transaction
5. **entertainer.service.ts:374** - Extract constant: `const GOSSIP_MIN_TRUST = 20;`
6. **entertainer.controller.ts:318-326** - Add null check
7. **useEntertainers.ts:342-360** - Add debounce

## Incomplete Implementations
- Trust system only uses placeholder value from entertainer data
- Buff application skeleton with no actual stat modification
- Mood effect tracking not persisted to character model
- Item rewards not delivered to inventory
- Gossip content is hardcoded placeholder text
- Recommendations are static "top 5" with no personalization
- Search functionality missing type/location filters
- Schedule validation incomplete (no overlap detection)
- No performance history tracking
- Skill learning doesn't track which skills character has already learned

## Recommendations
1. **CRITICAL**: Implement trust system integration with NPCTrust model queries
2. **CRITICAL**: Wrap all resource modifications in MongoDB transactions
3. **HIGH**: Connect buff application to character's active buff system
4. **HIGH**: Implement inventory integration for item rewards
5. **HIGH**: Complete gossip system integration with actual content
6. **MEDIUM**: Implement real recommendation algorithm based on character needs
7. **MEDIUM**: Add client-side debouncing to prevent spam
8. **LOW**: Add performance history and tracking analytics

## Estimated Fix Effort
- Critical fixes: 10 hours
- High fixes: 6 hours
- Medium fixes: 4 hours
- Total: 20 hours

**Overall Score: 6/10** (API structure is solid but core features - trust, buffs, items - are incomplete stubs that won't function in production)
