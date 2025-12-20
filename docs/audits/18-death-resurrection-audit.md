# Death & Resurrection System Audit Report

## Overview
The Death & Resurrection System manages player death, applies penalties (gold loss, XP loss, item drops), handles respawn mechanics, and integrates with jail system for wanted criminals.

## Files Analyzed
- Server: death.service.ts, death.controller.ts, death.routes.ts
- Client: useDeath.ts

## What's Done Well
- Session-based death handling (transaction wrapping)
- Respawn location intelligence (safe towns in same region)
- Death type enumeration (COMBAT, DUEL, PVP, EXECUTION, etc.)
- Item drop probability (10-30% of 1-3 items)
- Jail integration for wanted criminals (level 3+)

## Issues Found

### CRITICAL SECURITY
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Client sets respawn location | death.controller.ts:116 | Can teleport anywhere | Remove locationId parameter |
| No respawn rate limiting | death.routes.ts | Can spam respawn | Add rate limiter |

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| No respawn location validation | death.service.ts:206-249 | Location might not exist | Add isActive filter |
| Death loop possible | death.service.ts:301 | Can die during respawn | Add invincibility/ghost state |
| Item drop structure unclear | death.service.ts:116-131 | inventory schema unknown | Verify inventory structure |
| XP loss not level-scaled | death.service.ts:112 | Same % for all levels | Cap XP loss |
| Execution doesn't clear bounties | death.service.ts:196-200 | bountyAmount=0 but docs exist | Call BountyService.cancelBounties() |
| No already-dead check | death.service.ts:37-96 | Can die multiple times | Check isDead state |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Gold loss not scaled | death.service.ts:109 | Same % for all levels | Add level-based floor |
| Death stats incomplete | death.service.ts:314-337 | Same value for all death types | Track per death type |
| Respawn delay not enforced | death.service.ts:301 | Client decides when | Store death time, validate |
| No anti-suicide prevention | death.service.ts:37 | Can trigger ENVIRONMENTAL | Restrict death types |
| Jail not called in death flow | death.service.ts:343-354 | shouldSendToJail() not used | Call in handleDeath() |

## Bug Fixes Needed
1. **CRITICAL SECURITY** - Remove locationId parameter, use calculated location only
2. **CRITICAL SECURITY** - Add rate limiter to respawn endpoint
3. **CRITICAL** - Add `isActive: true` filter in respawn location query
4. **CRITICAL** - Call `BountyService.cancelBounties()` on execution
5. **CRITICAL** - Check if character already dead before processing
6. **CRITICAL** - Add ghost state during respawn delay
7. **MEDIUM** - Store death time, validate elapsed before respawn

## Incomplete Implementations
- Death Penalty Appeal System - can't negotiate penalties
- Companion Handling on Death - state undefined
- Injury/Permanent Consequences - full recovery from death
- Death Replay/Ghost Mode - just in respawn limbo

## Integration Issues
- Death not integrated with companion system
- No death integration with bounty collection
- Missing housing/base integration for respawn

## Recommendations
1. **IMMEDIATE SECURITY**: Remove client location control
2. **IMMEDIATE SECURITY**: Add rate limiting
3. Validate respawn locations
4. Fix bounty clearing on execution
5. Add ghost state during respawn
6. Integrate with companion system

## Estimated Fix Effort
- Critical fixes: 6 hours
- Medium fixes: 3 hours
- Total: 9 hours

**Overall Score: 5/10** (Critical security issues with respawn)
