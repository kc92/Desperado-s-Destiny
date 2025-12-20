# BATCH 8: Faction & Large-Scale War Systems Audit Report

## Summary

| System | Grade | Production Ready | Critical Issues | Est. Fix Time |
|--------|-------|------------------|-----------------|---------------|
| Faction War | C+ (68%) | 45% | 4 critical | 2-3 days |
| Warfare System | C+ (72%) | 50% | 4 critical | 2-3 days |
| War Resolution | C+ (65%) | 40% | 5 critical | 2-3 days |
| War Events/Objectives | C+ (72%) | 50% | 5 critical | 2-3 days |

**Overall Assessment:** War systems have excellent architectural foundations with clean separation of concerns, transaction safety, and distributed job scheduling. However, they suffer from **critical admin endpoint exposure**, **in-memory state in distributed systems**, **missing status updates**, and **incomplete integrations**. None are production-ready.

---

## FACTION WAR SYSTEM

### Grade: C+ (68/100)

**System Overview:**
- Large-scale PvP event system for faction territorial conflicts
- Template-based events: SKIRMISH → BATTLE → CAMPAIGN → WAR
- Phase progression: ANNOUNCEMENT → MOBILIZATION → ACTIVE_COMBAT → RESOLUTION
- Participant tracking, objective scoring, MVP selection, reward distribution

**Top 5 Strengths:**
1. Clean architecture: hooks → services → controllers → models
2. Transaction-based operations with MongoDB sessions
3. Comprehensive objective system (21 templates, 3 categories)
4. Good database indexes on status, timestamps, territory
5. Instance methods for phase transitions and eligibility checks

**Critical Issues:**

1. **NO ADMIN ROUTE PROTECTION** (`factionWar.routes.ts:76-118`)
   - `/faction-wars` (POST) - Create events
   - `/faction-wars/update-phases` (POST) - Modify phases
   - `/faction-wars/:warEventId/resolve` (POST) - Distribute rewards
   - Only `requireAuth` middleware - ANY player can create/resolve wars!

2. **CLIENT-SERVER TYPE MISMATCH** (`factionWar.service.ts vs model`)
   - Client expects `event.attackerParticipants` and `event.defenderParticipants` arrays
   - Server stores participants in separate `WarParticipant` collection
   - Model only has counts: `attackerCount`, `defenderCount`
   - Client code will crash at runtime

3. **RACE CONDITION: Participant Join Count** (`factionWar.service.ts:193-202`)
   - `warEvent.totalParticipants += 1` is non-atomic read-modify-write
   - Concurrent joins can lose increments
   - Should use MongoDB `$inc` operator

4. **FACTION ALIGNMENT NOT VALIDATED CLIENT-SIDE**
   - Client sends arbitrary `side` parameter
   - Server validates but client allows invalid attempts
   - Best practice: prevent at client layer too

**Incomplete Features:**
- Gang name hardcoded to "Unknown Gang" (TODO at line 175)
- Adjacent territories always returns `[]` (TODO at line 389-392)
- Missing cron job integration for phase updates
- No war event cancellation mechanism

**Production Status:** NOT READY - Admin protection critical

---

## WARFARE SYSTEM

### Grade: C+ (72/100)

**System Overview:**
- Orchestrates both gang wars (GangWarService) and faction wars (FactionWarService)
- Bull queues for distributed job scheduling
- Socket.IO broadcasting for real-time updates
- Client hook (useWarfare.ts) for frontend integration

**Top 5 Strengths:**
1. Clean separation between GangWarService and FactionWarService
2. Transaction-safe operations with Mongoose sessions
3. Distributed locks prevent concurrent job execution
4. Proper CRON scheduling with Bull queues (vs raw node-cron)
5. Comprehensive logging at all levels

**Critical Issues:**

1. **DIVISION-BY-ZERO VULNERABILITY** (`GangWar.model.ts:561`)
   - `const fundingRatio = this.attackerFunding / (this.attackerFunding + this.defenderFunding)`
   - Both zero = NaN, corrupts capturePoints
   - Occurs when war declared but no one contributes

2. **MEMORY-BASED STATE IN DISTRIBUTED SYSTEM** (`warEventScheduler.job.ts:37-42`)
   - `spawnTracking` object stores last spawn times in-memory
   - Multi-instance deployment: each server has own copy
   - Server A spawns at 10:00, Server B (null state) spawns at 10:30
   - Violates 24/48/336/2160-hour cooldowns across instances

3. **REDUNDANT STATUS ASSIGNMENT** (`GangWar.model.ts:575`)
   - `this.status = winner === 'attacker' ? GangWarStatus.RESOLVED : GangWarStatus.RESOLVED`
   - Both branches assign same value - copy-paste error

4. **SOCKET BROADCAST EXPOSES DATA** (`gangWar.service.ts:136-145`)
   - `io.emit('territory:war_declared', {...})` broadcasts to ALL clients
   - Gang strength and funding visible to competitors

**Missing Validations:**
- No level requirement for declaring war
- No validation defender gang exists and owns territory
- No cooldown period between wars

**Production Status:** NOT READY - Memory-based state breaks in multi-instance

---

## WAR RESOLUTION SYSTEM

### Grade: C+ (65/100)

**System Overview:**
- CRON job running every 5 minutes via Bull queue
- Resolves expired gang wars and faction war events
- Handles territory control changes and reward distribution
- Distributed lock pattern prevents duplicate processing

**Top 5 Strengths:**
1. Transaction-safe resolution with rollback handling
2. Bull queues provide persistence and retry logic (3 attempts)
3. Distributed lock prevents concurrent resolution
4. Proper territory conquest history tracking (last 50 entries)
5. Socket.IO broadcasts war outcomes

**Critical Issues:**

1. **MISSING WAR STATUS UPDATE** (`GangWarService.resolveWar()`)
   - War's `status` field never explicitly set to `RESOLVED`
   - Wars remain ACTIVE after resolution
   - `autoResolveWars()` may attempt re-resolution

2. **TERRITORY CONTROL OWNERSHIP INCONSISTENCY** (`resolveWar():302-305`)
   - `war.defenderGangId` may not match `territory.controllingGangId`
   - Territory could change controllers between declaration and resolution
   - Territory removed from wrong gang

3. **INEFFICIENT EXPIRED WARS QUERY** (`GangWar.model.ts:518-523`)
   - `findExpiredWars()` loads ALL active wars, filters in-memory
   - Should use `{ status: ACTIVE, resolveAt: { $lte: now } }`
   - Unscalable with 10K+ wars

4. **RACE CONDITION: Declare During Auto-Resolution**
   - No mechanism prevents new war declaration during resolution
   - User declares war while autoResolveWars() processing old war
   - New war may be invalid due to cooldown or state issues

5. **SILENT JOB FAILURE** (`autoResolveWars():438-440`)
   - Failed resolutions logged but counted as processed
   - No retry marking for individual war failures

**Missing Database Index:**
- No composite index on `(status, resolveAt)` for efficient queries

**Production Status:** NOT READY - Missing status updates break resolution cycle

---

## WAR EVENTS/OBJECTIVES SYSTEM

### Grade: C+ (72/100)

**System Overview:**
- Event scheduler spawns faction wars based on probability and cooldowns
- 4 event types: SKIRMISH (70%), BATTLE (40%), CAMPAIGN (25%), WAR (5%)
- 21 objective templates across Combat, Strategic, Support categories
- Sophisticated scaling based on participant count and event type

**Top 5 Strengths:**
1. Thoughtful phase progression with proper timing
2. Well-balanced spawn rates and cooldowns
3. SecureRNG for random selection (not Math.random())
4. Proper distributed lock pattern for scheduler
5. Comprehensive reward tiers (participation, victory, MVP)

**Critical Issues:**

1. **ADMIN ACCESS CONTROL MISSING** (`factionWar.routes.ts:73, 103, 113`)
   - Comments say "should be admin only" but no enforcement
   - Any authenticated user can create war events
   - Routes marked `@access Private (should be admin only)`

2. **INFLUENCE CHANGE NEVER APPLIED** (`factionWar.service.ts:294-299`)
   - `event.influenceChange` calculated but never actually applied
   - Wars don't affect faction power balance
   - Core gameplay feature broken!

3. **SPAWN TRACKING RACE CONDITION** (`warEventScheduler.job.ts:37-42, 98-102`)
   - In-memory `spawnTracking` not protected by distributed lock
   - Server restart resets all cooldown timers
   - Multiple instances can spawn duplicate events

4. **OBJECTIVE COMPLETION RACE** (`warObjectives.service.ts:131-147`)
   - Two contributions can complete same objective simultaneously
   - `objective.completedBy` could be wrong faction
   - Needs atomic check-and-set or optimistic locking

5. **NO RATE LIMITING ON CONTRIBUTIONS** (`warObjectives.service.ts:75-171`)
   - `contributeToObjective()` accepts arbitrary amount parameter
   - No per-character-per-objective cooldown
   - Player could submit 1000 points/second

**Incomplete Implementations:**
- `recordNPCKill()` doesn't validate NPC faction properly
- `recordDuelWin()` doesn't record kill for winner in all cases
- Reward types ITEM, COSMETIC, INFLUENCE defined but never generated
- CANCELLED status defined but never assigned

**Production Status:** NOT READY - Influence system broken, admin endpoints exposed

---

## CROSS-SYSTEM FINDINGS

### Architecture Strengths
- Clean separation between gang wars and faction wars
- Transaction-safe operations throughout
- Bull queues for reliable job scheduling
- Distributed locks on cron jobs
- Good logging at all levels

### Critical Shared Problems

1. **Admin Endpoints Unprotected**
   - Create war events: anyone can do it
   - Resolve events: anyone can trigger
   - Update phases: anyone can manipulate

2. **In-Memory State in Distributed Systems**
   - spawnTracking object per-instance
   - Cooldowns not enforced across servers
   - Server restart resets state

3. **Missing Status Updates**
   - Gang wars never marked RESOLVED
   - Re-resolution attempts possible
   - Query filters may return resolved wars

4. **Integration Gaps**
   - Faction influence never applied after wars
   - Gang names hardcoded to "Unknown Gang"
   - Adjacent territories always empty
   - No hooks from combat/duel systems to record contributions

### War System Confusion

| War Type | Service | Resolution | Issues |
|----------|---------|------------|--------|
| Gang War | GangWarService | GangWar.model.ts | Status not updated |
| Faction War | FactionWarService | FactionWarEvent.model.ts | Admin unprotected |
| War Events | warEventScheduler.job.ts | warResolution.ts | In-memory tracking |

---

## PRIORITY FIX ORDER

### Immediate (Ship Blockers)
1. **Add requireAdmin** to war event creation/resolution endpoints
2. **Move spawnTracking** to database or Redis
3. **Add war.status = RESOLVED** before save in resolveWar()
4. **Fix division-by-zero** in funding ratio calculation
5. **Apply influence changes** after faction war resolution

### High Priority (Week 1)
1. Fix client-server participant type mismatch
2. Use atomic $inc for participant counts
3. Add composite index (status, resolveAt)
4. Implement objective contribution rate limiting
5. Fix objective completion race condition

### Medium Priority (Week 2)
1. Populate actual gang names in faction wars
2. Implement territory adjacency graph
3. Add event cancellation mechanism
4. Fix silent job failures with retry marking
5. Add level requirements for war declaration

---

## ESTIMATED EFFORT

| System | Critical Fixes | Full Completion |
|--------|---------------|-----------------|
| Faction War | 2-3 days | 1-2 weeks |
| Warfare System | 2-3 days | 1 week |
| War Resolution | 2-3 days | 1 week |
| War Events/Objectives | 2-3 days | 1-2 weeks |
| **Total** | **~2 weeks** | **~5-6 weeks** |

---

## CONCLUSION

The war systems represent **sophisticated game design** with:
- Multi-scale events (skirmish → war)
- Phase-based progression
- Objective systems with scoring
- Distributed job scheduling

However, they suffer from:

1. **Critical security gap** - Any user can create/resolve war events
2. **Distributed state failure** - In-memory tracking breaks in multi-instance
3. **Incomplete integration** - Influence never applied, objectives not connected to combat
4. **Status management bugs** - Wars don't properly transition to RESOLVED

**Key Blockers:**
- Admin endpoint protection (1 hour fix, critical security)
- Persistent spawn tracking (half day, breaks in production)
- Status update fix (10 minutes, prevents re-resolution)
- Influence application (2-4 hours, core feature broken)

**Recommendation:** These systems have excellent foundations but critical deployment issues. The admin endpoint exposure is an immediate security concern. The in-memory spawn tracking will cause event spam in production. Fix these before any production deployment.
