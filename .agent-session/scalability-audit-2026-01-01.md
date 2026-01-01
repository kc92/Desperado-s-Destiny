# Scalability Audit Report - 2026-01-01

## Executive Summary

Comprehensive codebase analysis identified **47 scalability issues** across 4 domains:
- **Socket.io**: 2 critical O(n) lookups, in-memory timer issues
- **Database**: 5 critical unbounded arrays, N+1 patterns, missing indexes
- **Caching**: 5 in-memory Maps not horizontally scalable
- **Memory**: 6+ module-level setIntervals without cleanup

**Current Capacity**: ~1,000-3,000 concurrent users
**Target Capacity**: 10,000+ concurrent users

---

## Critical Issues (Immediate Action Required)

### 1. O(n) Socket Lookups

| File | Line | Issue | Fix |
|------|------|-------|-----|
| `server/src/sockets/cardTableHandlers.ts` | 547-556 | `io.fetchSockets()` iterates ALL sockets | Use `io.in('user:${id}')` room |
| `server/src/config/socket.ts` | 425-440 | Same pattern in disconnectSocket | Use `io.to(socketId).disconnectSockets()` |

### 2. Unbounded Document Arrays

| Field | Model | Risk | Fix |
|-------|-------|------|-----|
| `inventory` | Character | 10,000+ items possible | Add max 1000 cap |
| `skills` | Character | Unbounded | Archive old skills |
| `fateMarks` | Character | Grows per death | Limit to 100 |
| `devilDeals` | Character | Never cleaned | Remove consumed deals |
| `specializations` | Character | Unbounded | Cap at reasonable limit |

### 3. ActionDeckSession Bloat

**File**: `server/src/services/actionDeck.service.ts:160-169`
**Issue**: Stores full `character.toObject()` (600KB+) per session
**Impact**: 1000 sessions = 600MB unnecessary storage
**Fix**: Store only `{ characterId, actionId }` and fetch on demand

### 4. In-Memory Maps (Not Horizontally Scalable)

| Service | Map | Risk |
|---------|-----|------|
| `gathering.service.ts:122` | `cooldowns` | Lost on restart, no sync |
| `mood.service.ts:156` | `moodStates` | Different moods per instance |
| `schedule.service.ts:33` | `scheduleCache` | Never invalidated |
| `systemEvent.service.ts:23` | `subscriptions` | Cross-instance events fail |
| `teamCardGameHandlers.ts:87` | `disconnectTimers` | Lost on restart |

### 5. Module-Level setIntervals Without Cleanup

| File | Line | Interval | Risk |
|------|------|----------|------|
| `antiExploit.middleware.ts` | 537 | 5min cleanup | No ref stored, can't clear |
| `territoryBonus.service.ts` | 74 | 1min cleanup | Same issue |
| `taming.service.ts` | 380 | Unknown | Same issue |
| `worldBoss.service.ts` | 434 | Unknown | Same issue |
| `deckGame.controller.ts` | 24 | 5min cleanup | Same issue |

---

## High Priority Issues

### Database Performance

1. **ActionResult.getCharacterStats()** - Loads all results into memory, filters in JS
   - Fix: Use MongoDB aggregation pipeline

2. **Crime Service Decay Loop** - No pagination when processing all characters
   - Fix: Use `.limit(1000).skip()` batching

3. **Missing Indexes**:
   - `Character.{wantedLevel, isActive}` - Used in decay loop
   - `ActionResult.{characterId, success, timestamp}` - Leaderboard queries

4. **Populate Without Select**:
   - 8+ services call `.populate()` without `.select()`
   - Impact: 2-3x bandwidth waste

### Socket.io Issues

1. **Timer Polling Initialization** - Started on first connection, not at startup
   - Risk: Race conditions in multi-instance setup
   - Fix: Move to server.ts initialization

2. **Event Listener Accumulation** - 11+ handlers per socket
   - Risk: Memory bloat if disconnect fails
   - Fix: Explicit cleanup pattern

### Cache Invalidation Gaps

1. **Dynamic Pricing Fallback** - In-memory cache not invalidated on Redis write
2. **NPC Data** - No caching at all, 2+N*2 queries per request
3. **Character Skills** - No caching, loaded from document each time

---

## Medium Priority Issues

### Database

- Missing `.lean()` on read-only queries
- N+1 patterns in cosmicQuest, deityDream services
- Mail model missing some indexes

### Client-Side

- `useEnergy.ts:283-306` - Interval recreated on dependency change
- `useGameTime.ts:13-14` - Instance counting race condition
- Global flags surviving React StrictMode remounts

---

## Positive Patterns Found

- ✅ Redis adapter for Socket.io horizontal scaling
- ✅ Room-based broadcasting (`user:${characterId}`)
- ✅ Distributed locks (withLock pattern in 40+ services)
- ✅ TTL-based state management (DuelStateManager)
- ✅ Rate limiting with Redis (16+ endpoints)
- ✅ Graceful shutdown with drain period
- ✅ MongoDB connection pooling (50 prod, 10 dev)

---

## Recommended Fix Order

### Phase 1: Critical (This Sprint)
1. Fix O(n) socket lookups in cardTableHandlers
2. Add inventory/array caps to Character model
3. Store only IDs in ActionDeckSession
4. Migrate gathering cooldowns to Redis

### Phase 2: High (Next Sprint)
1. Store setInterval references for cleanup
2. Add missing database indexes
3. Fix ActionResult.getCharacterStats() aggregation
4. Add .select() to populate calls

### Phase 3: Medium (Following Sprint)
1. Add NPC data caching
2. Fix useEnergy interval recreation
3. Implement cache invalidation hooks
4. Add pagination to decay loops

---

## Files Requiring Changes

**Critical (8 files)**:
- `server/src/sockets/cardTableHandlers.ts`
- `server/src/services/actionDeck.service.ts`
- `server/src/models/Character.model.ts`
- `server/src/services/gathering.service.ts`
- `server/src/services/mood.service.ts`
- `server/src/services/schedule.service.ts`
- `server/src/sockets/teamCardGameHandlers.ts`
- `server/src/middleware/antiExploit.middleware.ts`

**High Priority (12 files)**:
- `server/src/models/ActionResult.model.ts`
- `server/src/models/ActionDeckSession.model.ts`
- `server/src/services/crime.service.ts`
- `server/src/services/territoryBonus.service.ts`
- `server/src/services/taming.service.ts`
- `server/src/services/worldBoss.service.ts`
- `server/src/controllers/deckGame.controller.ts`
- `server/src/services/combat.service.ts` (populate)
- `server/src/services/propertyTax.service.ts` (populate)
- `server/src/services/workerTask.service.ts` (populate)
- `client/src/hooks/useEnergy.ts`
- `client/src/hooks/useGameTime.ts`

---

## Metrics to Monitor

After implementing fixes:
1. Memory usage per instance (target: <512MB)
2. Socket lookup latency (target: <1ms)
3. Database query count per action (target: <5)
4. Redis cache hit rate (target: >80%)
5. P99 response time (target: <200ms)
