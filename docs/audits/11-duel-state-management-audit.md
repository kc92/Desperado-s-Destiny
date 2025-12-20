# Duel State Management System Audit Report

## Overview
Duel state management uses a dual-layer approach: DuelStateManager (Redis) for real-time sync and DuelSessionService (MongoDB) for persistence. DuelTimerManager handles timeout scheduling.

## Files Analyzed
- Server: duelStateManager.service.ts, duelTimerManager.service.ts, duelSession.service.ts
- Related: duel.service.ts (activeDuelGames)

## What's Done Well
- Elegant Redis state pattern (get/set/delete/update)
- Atomic updates via Redis WATCH/MULTI/EXEC
- TTL-based automatic cleanup (2 hours)
- Distributed timer management with polling
- Crash recovery via DuelSessionService
- Strong TypeScript interfaces

## Issues Found

### CRITICAL
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Dual state not synchronized | duel.service.ts:33 + duelStateManager | activeDuelGames (memory) + Redis not synced | Use single source of truth |
| updateStateAtomic missing init | duelStateManager.ts:106-114 | updateFn might receive null | Add null check |

### HIGH
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| TTL refresh never called | duelStateManager.ts:315-317 | Long duels expire | Call refreshTTL on updates |
| Betting history unbounded | duelStateManager.ts:42 | Arrays grow indefinitely | Cap to last 50 actions |
| Round results unbounded | duelStateManager.ts:36 | Arrays grow indefinitely | Limit to 50 rounds |
| Ability cooldown not atomic | duelHandlers.ts:1160-1166 | Race on cooldown check | Atomic check-and-set |

### MEDIUM
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| DuelSessionService never called | duelSession.service.ts | Exists but not used in handlers | Integrate saveSession |
| Character mapping not cleaned | duelStateManager.ts:264-266 | TTL expiry leaves orphan mappings | Add TTL to mapping |
| No phase transition validation | duelStateManager.ts:192-194 | Can jump phases | Validate allowed transitions |
| Socket ID mismatch | duelHandlers.ts:560 | Old socket ID in state after reconnect | Update on reconnect |

### LOW
| Issue | File:Line | Description | Fix Required |
|-------|-----------|-------------|--------------|
| Betting history after failure | duelHandlers.ts:1031-1034 | Added before action completes | Add after success |

## Bug Fixes Needed
1. **CRITICAL** - Save activeDuelGames hands to Redis after each action
2. **CRITICAL** - Add null check in updateStateAtomic: return early if state undefined
3. **HIGH** - Cap roundResults and bettingHistory arrays to last 50
4. **HIGH** - Integrate DuelSessionService.saveSession() calls after major state changes
5. **MEDIUM** - Add TTL to characterToDuelMapping
6. **MEDIUM** - Use atomic check-and-set for ability cooldowns

## Incomplete Implementations
- DuelSessionService Integration - service exists but never called
- TTL Refresh on Activity - method exists but never invoked
- Hand Persistence - game hands not saved to state manager
- Ability Use Atomicity - cooldown/energy not atomic
- Phase Transition Validation - no checks for valid progressions

## Architecture Issues

### Dual State Problem
The system maintains state in TWO places:
1. `activeDuelGames` Map in duel.service.ts (in-memory)
2. `DuelStateManager` in Redis

These are NOT synchronized. On server restart:
- Redis state survives
- activeDuelGames (with hands) is LOST
- Game cannot continue

### Recommended Architecture
1. **Single source of truth**: Store ALL state in Redis via DuelStateManager
2. **Include hands**: Current hands, drawn cards, discarded cards
3. **Persist to MongoDB**: Only for crash recovery/audit trail
4. **No in-memory maps**: Remove activeDuelGames entirely

## Recommendations
1. Consolidate to single state storage (Redis)
2. Implement state events for loose coupling
3. Add state versioning for optimistic locking
4. Implement audit trail in Redis stream
5. Add health check for state consistency

## Estimated Fix Effort
- Critical fixes: 6 hours
- High fixes: 4 hours
- Medium fixes: 3 hours
- Total: 13 hours

**Overall Score: 5/10** (Critical state synchronization issue)
