# BATCH 7: Territory Control Systems Audit Report

## Summary

| System | Grade | Production Ready | Critical Issues | Est. Fix Time |
|--------|-------|------------------|-----------------|---------------|
| Territory Control | C+ (70%) | 55% | 5 critical | 2-3 days |
| Territory Influence | C+ (68%) | 40% | 4 critical | 2-3 days |
| Resistance System | D+ (45%) | 20% | 5 critical | 2-3 days |
| Conquest/Fortification | D+ (42%) | 30% | 5 critical | 40-60 hours |

**Overall Assessment:** Territory systems have excellent architectural foundations with clean service layers and comprehensive type systems, but suffer from **critical race conditions**, **missing job scheduling**, **incomplete persistence**, and **admin endpoint exposure**. None of these systems are production-ready.

---

## TERRITORY CONTROL SYSTEM

### Grade: C+ (70/100)

**System Overview:**
- Zone-based influence tracking for gang territories
- 5 activity types (CRIME, FIGHT, BRIBE, BUSINESS, PASSIVE)
- Control thresholds (>50% influence OR 20-point lead)
- Daily decay/income job via territoryMaintenance.ts

**Top 5 Strengths:**
1. Clean separation of concerns (service/controller/route)
2. SecureRNG for all influence calculations (6 uses)
3. Distributed lock on maintenance job
4. Comprehensive influence mechanics with decay
5. Control level thresholds well-designed (30-50-70%)

**Critical Issues:**

1. **RACE CONDITION: Zone Control Updates** (`territoryControl.service.ts:186-199`)
   - Between zone.save() and gang.save(), concurrent requests corrupt state
   - Gang territories array out of sync with zone control
   - No transaction/session management

2. **MISSING TRANSACTION: Influence Loss** (`territoryControl.service.ts:468-502`)
   - Two separate database operations with gap
   - App crash after zone.save() leaves gang territories inconsistent

3. **INFLUENCE DECAY BUG** (`TerritoryZone.model.ts:373-376`)
   - `lastActivity` NOT UPDATED after decay
   - Active gangs lose all influence if they go idle after ONE activity
   - Compounds infinitely: -5/day forever

4. **contestZone BYPASS** (`territoryControl.service.ts:249`)
   - Requires 10 influence but grants 10 automatically if exactly 0
   - Logic contradiction allows always contesting

5. **NO RATE LIMITING**
   - `/territory/influence` endpoint unprotected
   - Spam 100 req/sec for massive influence

**Security Concerns:**
- TOCTOU vulnerability in gang membership check
- No idempotency keys (network retry = double influence)
- No audit log for territory changes

**Production Status:** NOT READY - Race conditions must be fixed

---

## TERRITORY INFLUENCE SYSTEM

### Grade: C+ (68/100)

**System Overview:**
- Faction-based influence (6 factions)
- Equilibrium-based decay (converges to ~16.67 per faction)
- Control levels: CONTESTED → DISPUTED → CONTROLLED → DOMINATED
- 90-day TTL on influence history

**Top 5 Strengths:**
1. Comprehensive audit logging with InfluenceHistory model
2. TTL indexes for auto-cleanup
3. Type-safe shared types between client/server
4. Distributed locks on decay jobs
5. Clear control level thresholds (0-30-50-70-100)

**Critical Issues:**

1. **ADMIN ENDPOINTS UNPROTECTED** (`territoryInfluence.routes.ts:165-178`)
   - `/initialize` and `/apply-daily-decay` only require basic auth
   - Any authenticated user can reinitialize all territories
   - Missing `requireAdmin` middleware

2. **DUPLICATE DECAY JOBS**
   - `influenceDecay.job.ts` (03:00 AM) calls TerritoryInfluenceService
   - `territoryMaintenance.ts` (00:00 AM) calls TerritoryControlService
   - Different services, different decay logic - double decay possible

3. **RACE CONDITION: modifyInfluence**
   - No distributed lock on concurrent territory updates
   - Two +10 influence requests can result in only +10 total

4. **ROUNDING ERRORS IN DECAY**
   - Floating point percentage decay without normalization
   - 6 factions never sum to exactly 100 after decay
   - Control thresholds become unpredictable

**Client-Server Mismatch:**
- Hook expects: `taxReduction, xpBonus, safePassage, factionServices, specialPerks`
- Server returns: `shopDiscount, reputationBonus, hasSafeHouse, jobPriority, crimeHeatReduction`

**Production Status:** NOT READY - Admin protection and decay deduplication critical

---

## RESISTANCE SYSTEM

### Grade: D+ (45/100) - **SEVERELY INCOMPLETE**

**System Overview:**
- Post-conquest occupation mechanics
- 5 activity types (SABOTAGE, GUERRILLA, PROPAGANDA, SMUGGLING, RECRUITMENT)
- Liberation campaign system
- Diplomatic solutions

**Top 5 Strengths:**
1. Clean service architecture
2. SecureRNG for success calculations
3. Configuration-driven activity costs/effects
4. Good TypeScript types
5. Faction authorization on suppression

**Critical Issues:**

1. **DIPLOMATIC SOLUTION STUB** (`resistance.service.ts:391-415`)
   - Method returns hardcoded success
   - No database persistence
   - Feature completely non-functional

2. **LIBERATION CAMPAIGN NOT PERSISTED** (`resistance.service.ts:233-316`)
   - Campaign object created but NEVER SAVED
   - Data lost after API response
   - Cannot track or complete campaigns

3. **JOB NEVER SCHEDULED** (`processDailyResistance`)
   - Method exists but never called
   - Not in any cron job or queue
   - Resistance never decays, persists forever

4. **CAPTURE LOGIC INVERTED** (`resistance.service.ts:78-80`)
   - Uses `successRate` for capture probability (backwards)
   - Higher success rate = lower capture chance (makes no sense)

5. **RACE CONDITION** (`processDailyResistance`)
   - No distributed lock
   - Multi-instance deployment = double processing

**Missing Models:**
- No DiplomaticSolution model
- No LiberationCampaign model
- Activities embedded only (no standalone model)

**Production Status:** **BROKEN** - 2 core features have no persistence

---

## CONQUEST/FORTIFICATION SYSTEM

### Grade: D+ (42/100)

**System Overview:**
- Large-scale territory siege mechanics
- State machine: CONTESTED → SIEGE_DECLARED → ASSAULT → CONTROL_CHANGE → STABLE
- Fortification types with defense bonuses
- War objectives integration

**Top 5 Strengths:**
1. Excellent state machine design with clear transitions
2. Comprehensive configuration (stages, requirements, effects)
3. Database indexing on frequently queried fields
4. Transaction support in WarObjectivesService
5. Faction-specific bonuses and multipliers

**Critical Issues:**

1. **RACE CONDITION: Concurrent Siege Declaration** (`conquest.service.ts:129-135`)
   - No locking between siege check and creation
   - Multiple sieges can be declared on same territory

2. **ADMIN ENDPOINTS UNPROTECTED** (`conquest.controller.ts:369-405`)
   - `initializeTerritoryState` and `updateOccupationStatuses` exposed
   - Any authenticated user can corrupt game state

3. **UNBOUNDED PAGINATION** (`conquest.service.ts:560-562`)
   - `updateOccupationStatuses` loads ALL territories
   - No limit/skip - N+1 database problem
   - Cron job can timeout on large datasets

4. **RESOURCE COMMITMENT NOT DEDUCTED** (`conquest.service.ts:137-144`)
   - Server validates minimum resources
   - But never checks character actually has them
   - Never deducts from character balance

5. **FORTIFICATION ARRAY NULL CHECK MISSING** (`conquest.service.ts:397-400`)
   - `for (const fort of state.fortifications)` crashes if undefined

**Incomplete Implementations:**
- Fortification routes: service exists, no endpoints
- Resistance activities: config defined, no service
- Post-conquest effects: config exists, never applied
- War objectives: created but never linked to scoring

**Production Status:** NOT READY - 40-60 hours to production-ready

---

## CROSS-SYSTEM FINDINGS

### Architecture Strengths
- Clean service layer abstraction across all systems
- Comprehensive TypeScript types
- Good use of MongoDB indexes
- Distributed locks on cron jobs (when remembered)
- Shared types between client/server

### Critical Shared Problems

1. **Race Conditions Everywhere**
   - Territory Control: zone/gang sync
   - Territory Influence: concurrent modifyInfluence
   - Resistance: processDailyResistance
   - Conquest: siege declaration

2. **Admin Endpoints Unprotected**
   - Territory Influence: /initialize, /apply-daily-decay
   - Conquest: initializeTerritoryState, updateOccupationStatuses

3. **Jobs Not Scheduled or Duplicated**
   - Resistance: processDailyResistance never called
   - Influence: two different jobs run decay logic

4. **Missing Persistence**
   - Resistance: diplomatic solutions not saved
   - Resistance: liberation campaigns not saved
   - Conquest: winner determination not stored

### System Confusion

| Concept | System 1 | System 2 | Overlap |
|---------|----------|----------|---------|
| Influence | territoryControl (gang) | territoryInfluence (faction) | Different entities |
| Decay | territoryMaintenance (gang) | influenceDecay (faction) | Both at 00:00/03:00 |
| Control | Gang zones | Faction territories | Unclear relationship |
| Resistance | resistance.service | conquest effects | Not integrated |

---

## PRIORITY FIX ORDER

### Immediate (Ship Blockers)
1. **Add distributed locks** to all influence/conquest modification methods
2. **Add requireAdmin** to initialization/update endpoints
3. **Schedule processDailyResistance** in cron jobs
4. **Fix influence decay lastActivity** timestamp update
5. **Add null checks** to fortification loops

### High Priority (Week 1)
1. Deduplicate decay jobs (one service for gang, one for faction)
2. Implement diplomatic solution persistence
3. Implement liberation campaign model and storage
4. Add transaction support to zone/gang updates
5. Fix capture probability logic inversion

### Medium Priority (Week 2)
1. Add pagination to updateOccupationStatuses
2. Implement resource deduction for siege declaration
3. Fix client-server AlignmentBenefits type mismatch
4. Add rate limiting to influence endpoints
5. Connect conquest objectives to war scoring

---

## ESTIMATED EFFORT

| System | Critical Fixes | Full Completion |
|--------|---------------|-----------------|
| Territory Control | 2-3 days | 1 week |
| Territory Influence | 2-3 days | 1 week |
| Resistance | 2-3 days | 1-2 weeks |
| Conquest/Fortification | 1 week | 2-3 weeks |
| **Total** | **~2-3 weeks** | **~6-8 weeks** |

---

## CONCLUSION

The territory control systems represent **ambitious game design** with sophisticated mechanics:
- Multi-faction influence competition
- Gang zone control
- Post-conquest occupation with resistance
- Large-scale siege warfare

However, they suffer from:

1. **Critical race conditions** - Data corruption under concurrent load
2. **Missing security** - Admin endpoints exposed to all users
3. **Incomplete features** - Resistance has no persistence, decay never runs
4. **System confusion** - Gang vs faction territory systems overlap

**Key Blockers:**
- Admin endpoint protection (5-minute fix, critical security)
- Race condition fixes (2-3 days, prevents corruption)
- Job scheduling for resistance (10-minute fix, enables entire system)
- Persistence for diplomatic/liberation (1 day, core features non-functional)

**Recommendation:** These systems need significant hardening before production. The resistance system is essentially 20% functional. Territory control systems are more complete but unsafe under concurrent load. Prioritize admin protection and race condition fixes before any production deployment.
