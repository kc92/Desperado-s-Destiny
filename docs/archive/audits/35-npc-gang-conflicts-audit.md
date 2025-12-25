# NPC Gang Conflicts System Audit Report

## Overview
The NPC Gang Conflict System manages interactions between player gangs and NPC gangs, including tribute payments, territory challenges, combat missions, and relationship management. It provides a complex relationship mechanic with dynamic world events and NPC attacks triggered through cron jobs.

## Files Analyzed
- Server: npcGangConflict.service.ts, npcGangConflict.controller.ts, npcGangConflict.routes.ts, npcGangEvents.ts
- Client: No dedicated client store found (missing implementation)
- Shared Types: npcGang.types.ts

## What's Done Well
- Comprehensive NPC gang data structure with specialties, attack patterns, and lore
- Well-structured relationship scoring system with attitude thresholds (-100 to +100)
- Transactional operations with proper session management for tribute and challenge flows
- Clear separation of concerns between service and controller layers
- Proper error handling with descriptive messages throughout
- Automated NPC gang jobs with scheduled attacks and world events
- Mission system with repeatable quests and relationship-gated content
- Proper logging for audit trails

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Undefined Methods Not Implemented | npcGangConflict.service.ts:87-91 | activeMissions and recentAttacks arrays are hardcoded as empty arrays | Create ActiveNPCMission and NPCAttackHistory models |
| Missing Race Condition Protection | npcGangConflict.service.ts:246-264 | Challenge initiation doesn't prevent duplicate challenges | Add database-level constraint or Redis lock |
| No Input Validation on Zone ID | npcGangConflict.service.ts:200-240 | zoneId parameter is not validated as string format | Validate zone ID format before querying |
| Missing NPC Gang World Events Integration | npcGangConflict.service.ts:1-659 | Service ignores world events that modify tribute costs, attack chances | Integrate getActiveWorldEvents() and apply modifiers |
| Data Loss on Session Rollback | npcGangConflict.service.ts:186, 281, 464 | If session rollback occurs after partial success, no compensation | Add compensating transactions or return partial success |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No Validation for Mission Rewards | npcGangConflict.service.ts:549-630 | acceptMission() creates mission without validating reward structure | Validate mission template exists and rewards are valid |
| Hardcoded Values Not Configurable | npcGangConflict.service.ts:96, 251, 260 | Hardcoded tribute cost (1000), challenge cost (1000), level requirement (15) | Extract to constants.ts or config object |
| Missing Gang Leader Validation | npcGangConflict.service.ts:219-221 | Only checks if character is leader, not if character is gang member | Add member verification check |
| No Character Level Validation | npcGangConflict.service.ts:549-630 | acceptMission() doesn't validate character level against requirements | Implement actual requirement checking |
| XP Distribution Bug | npcGangConflict.service.ts:418-425 | XP distribution uses (memberChar as any).xp without proper type | Use proper Character model methods for XP |
| Victory Chance Exploitable | npcGangConflict.service.ts:382-386 | Victory chance doesn't account for member skill/level distribution | Weight member count by average member level |
| No Cleanup for Expired Challenges | npcGangConflict.service.ts:1-659 | Challenge expiration only handled by cron job | Add expiration check at start of fightFinalBattle() |
| Missing Retaliation System | npcGangConflict.service.ts:534 | canRetaliate flag is hardcoded true, but no retaliation mechanic | Implement retaliation endpoint or remove flag |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Inconsistent Error Handling | npcGangConflict.controller.ts:18-337 | Some endpoints use asyncHandler, others don't | Wrap all controller handlers consistently |
| No Rate Limiting on Expensive Operations | npcGangConflict.routes.ts:54, 73, 86 | Tribute, challenge, and battle endpoints may need stricter limits | Consider adding stricter per-user limiter |
| Missing Pagination for Large Datasets | npcGangConflict.service.ts:648-657 | getGangRelationships() returns all relationships without pagination | Add limit parameter with default and max values |
| Relationship Object Casting | npcGangConflict.service.ts:100 | relationship.toObject() as any bypasses TypeScript | Create proper TypeScript mapping function |

## Bug Fixes Needed
1. **CRITICAL - npcGangConflict.service.ts:87-91** - Implement ActiveNPCMission and NPCAttackHistory models
2. **CRITICAL - npcGangConflict.service.ts:246** - Add race condition protection for challenges
3. **HIGH - npcGangConflict.service.ts:596-599** - Check character level against requirements
4. **HIGH - npcGangConflict.service.ts:372-374** - Add expiry check before final battle
5. **HIGH - npcGangConflict.service.ts:96, 147-151** - Integrate world events into calculations
6. **HIGH - npcGangConflict.service.ts:418-425** - Fix XP distribution type safety

## Incomplete Implementations
- No Active Mission Tracking - activeMissions array is always empty
- No Attack History - recentAttacks always returns empty array
- Missing Retaliation System - canRetaliate flag exists but endpoint doesn't
- No Mission Progress Tracking - Mission template has progress field but service doesn't update it
- No World Event Modifiers - Service ignores active world events

## Recommendations
1. **IMMEDIATE**: Create and integrate ActiveNPCMission and NPCAttackHistory models
2. Add race condition protection to challenge system
3. Implement proper mission requirement validation
4. Fix victory chance calculation to consider member levels
5. Add expiration check for challenges before final battle
6. Integrate world events into all calculations
7. Implement missing retaliation system

## Estimated Fix Effort
- Critical fixes: 16 hours
- High fixes: 12 hours
- Medium fixes: 8 hours
- Total: 36 hours

**Overall Score: 6.5/10** (Foundation is solid with good transaction handling, but has critical gaps in mission tracking and race conditions)
