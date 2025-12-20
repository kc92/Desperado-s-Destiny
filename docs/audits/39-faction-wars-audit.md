# Faction Wars System Audit Report

## Overview
The Faction Wars System manages large-scale faction conflict events with dynamic objectives, multi-phase warfare, participant scoring, and faction-wide rewards. Events progress through announcement, mobilization, active combat, and resolution phases with comprehensive statistics and leaderboard tracking.

## Files Analyzed
- Server: factionWar.service.ts, factionWar.controller.ts, factionWar.routes.ts, FactionWarEvent.model.ts, factionWar.types.ts
- Client: useFactionWar.ts

## What's Done Well
- Well-designed phase state machine with clear transitions (ANNOUNCEMENT -> MOBILIZATION -> ACTIVE_COMBAT -> RESOLUTION)
- Comprehensive objective system supporting primary, secondary, and bonus objectives
- Detailed reward distribution system with victory, participation, and MVP rewards
- Proper use of MongoDB transactions for atomic operations (joinWarEvent, distributeRewards)
- Clear separation of service, controller, and route layers
- Scalable reward calculation based on template multipliers
- Good type safety with detailed enums and interfaces
- Instance methods for score calculation, winner determination, and phase updates
- Participant tracking with score contributions by type (combat, strategic, support, leadership)

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Missing Alliance Validation | factionWar.service.ts:158-162 | Accepts alliedFactions without validating they agreed to alliance | Validate alliance agreements in external system |
| Race Condition: Concurrent Participation | factionWar.service.ts:147-154 | Checks existing participation but doesn't lock | Use atomic findAndUpdate to prevent duplicate participants |
| No Participant Capacity Validation | factionWar.service.ts:122-154 | joinWarEvent doesn't validate totalParticipants against maxParticipants | Add capacity check |
| Unbounded Participant Query | factionWar.service.ts:330 | distributeRewards queries all participants without pagination | Add pagination/batch processing |
| Missing War Phase Duration Enforcement | factionWar.service.ts:256-275 | updateEventPhases doesn't enforce minimum/maximum phase durations | Validate duration constraints |
| Score Manipulation Vulnerability | factionWar.service.ts:251 | warScore updated without validation or atomicity | Use $inc operator and validate score increases |
| No WarParticipant Model Reference | factionWar.service.ts:20 | Imports WarParticipant model but it's not defined in visible files | Ensure WarParticipant model is properly defined |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Incomplete Gang Name Population | factionWar.service.ts:175 | Hardcodes 'Unknown Gang' instead of fetching actual gang name | Query Gang model and populate with actual name |
| Missing Event Template Validation | factionWar.service.ts:38-46 | Doesn't validate template actually exists before using it | Add template existence check |
| No Level Requirement Enforcement | factionWar.service.ts:142-144 | canJoin checks minLevel but doesn't validate against template | Use template.minLevel instead of calculated |
| Missing Objective Completion Validation | factionWar.service.ts:425-445 | completeObjective allows completion without validating objective is valid | Validate objective exists and isn't already completed |
| No War Event Time Validation | factionWar.controller.ts:40 | customStartTime accepted without validating it's in reasonable future | Validate startTime is between now and MAX_ADVANCE_SCHEDULE |
| Missing Authorization Checks | factionWar.controller.ts:239 | updateEventPhases and resolveWarEvent lack admin/cron role verification | Add roleGuard middleware for privileged operations |
| No Tie-Breaking Logic | factionWar.service.ts:289 | calculateWinner returns undefined on tie but doesn't implement tie-breaker | Define tie-breaker rules |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| MVP Percentage Hardcoded | factionWar.service.ts:370 | MVP selection uses hardcoded 5% from WAR_SCORING | Use template MVP multiplier if available |
| Arbitrary Phase Timing | factionWar.service.ts:397 | 2-hour hardcoded buffer before start for MOBILIZATION phase | Use template announcementHours |
| No Adjacent Territory Effects | factionWar.service.ts:90 | Adjacent territories fetched but never used for gameplay mechanics | Implement adjacency effects |
| No Score Formula Documentation | factionWar.service.ts:475-476 | kill/duel point calculations lack explanation | Document scoring formula |
| No Objective Progress Callback | factionWar.service.ts:485 | getAllObjectives exists but no system to report progress updates | Implement progress tracking and WebSocket notifications |
| Incomplete Leaderboard Sorting | factionWar.service.ts:481-482 | Manual sorting instead of database query | Implement database-level sorting with pagination |
| War Event Duplication Risk | factionWar.controller.ts:78 | No check if war already exists between same factions on same territory | Add uniqueness constraint |

## Bug Fixes Needed
1. **CRITICAL - factionWar.service.ts:147-154** - Use findAndUpdate with upsert to prevent duplicate participants
2. **CRITICAL - factionWar.service.ts:122-154** - Add capacity validation before accepting new participant
3. **CRITICAL - factionWar.service.ts:175** - Query Gang model for actual gang name
4. **HIGH - factionWar.service.ts:258-275** - Validate phase durations against template constraints
5. **HIGH - factionWar.service.ts:296-299** - Implement influence change application to factions
6. **HIGH - factionWar.service.ts:330** - Add pagination for distributeRewards
7. **HIGH - factionWar.service.ts:370** - Use template MVP multiplier instead of hardcoded
8. **HIGH - factionWar.controller.ts:30-38** - Add missing authorization checks for admin endpoints

## Incomplete Implementations
- Territory Adjacency Effects - Adjacent territories tracked but no gameplay mechanics
- Objective Progress Tracking - No system to report objective progress to participants
- Casualty Calculation - casualty field initialized but never calculated or applied
- Influence System Integration - influenceChange calculated but never applied
- Gang/Alliance Effects - alliedFactions accepted but no validation or gameplay mechanics
- Leaderboard Real-time Updates - Leaderboard built at resolution instead of live
- Event Cancellation - No system to cancel/abort stuck events
- Objective Difficulty Scaling - Objectives created with static targets regardless of participant count
- Reward Redemption - Rewards awarded but no system to actually grant items/currency

## Recommendations
1. **CRITICAL**: Implement atomic findAndUpdate for participant registration
2. **CRITICAL**: Add capacity validation and enforce participant limits
3. **CRITICAL**: Implement influence application system
4. **HIGH**: Complete gang name resolution and alliance validation
5. **HIGH**: Add proper authorization checks for all admin/system operations
6. **HIGH**: Implement tie-breaking logic for equal scores
7. **MEDIUM**: Add real-time objective progress tracking
8. **MEDIUM**: Implement casualty calculation based on gameplay results
9. **MEDIUM**: Add territory adjacency effects

## Estimated Fix Effort
- Critical fixes: 5 hours
- High fixes: 8 hours
- Medium fixes: 10 hours
- Total: 23 hours

**Overall Score: 7/10** (Good phase state machine and reward distribution, but missing critical validation and race condition vulnerabilities)
