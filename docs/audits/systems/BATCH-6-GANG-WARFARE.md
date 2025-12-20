# BATCH 6: Gang Warfare & Heists Systems Audit Report

## Summary

| System | Grade | Production Ready | Critical Issues | Est. Fix Time |
|--------|-------|------------------|-----------------|---------------|
| Gang Heist | C+ (68%) | 65% | 3 critical | 2-3 days |
| Gang War Deck | C+ (70%) | 60% | 4 critical | 2-3 days |
| NPC Gang Conflict | C+ (65%) | 55% | 5 critical | 6 days |
| War Objectives | C (60%) | 40% | 4 critical | 3-4 days |

**Overall Assessment:** Gang warfare systems have solid architectural foundations but suffer from **critical integration gaps**, **missing jail/consequence systems**, and **incomplete auto-resolution jobs**.

---

## GANG HEIST SYSTEM

### Grade: C+ (68/100)

**System Overview:**
- Multi-phase cooperative robberies (planning → progress → execution)
- 6 target types (banks, payroll, stagecoach, estates)
- Role-based crew assignments (lookout, safecracker, muscle, driver, mastermind)
- Success formula: Base 20% + Planning (30%) + Skill (40%) - Risk - Heat

**Top 5 Strengths:**
1. Excellent transaction safety with MongoDB sessions
2. Cryptographically secure RNG (SecureRNG)
3. Distributed locking prevents double-execution
4. Well-designed success formula (clamped 5-95%)
5. Comprehensive TypeScript types

**Critical Issues:**

1. **Incomplete Role Assignment Endpoint** (`heist.controller.ts:300-342`)
   - Stub implementation: "use plan endpoint with roleAssignments"
   - Players cannot modify roles after initial planning

2. **Jail Integration Missing** (`heist.service.ts:280-299`)
   - Arrested characters only LOGGED, not jailed
   - `JailService.jailPlayer()` exists but never called
   - Casualties don't apply damage/death

3. **Client-Server Type Mismatch**
   - Client expects 8 targets, server has 6
   - Values don't match: `bank_vault` vs `red_gulch_bank`

**Exploits:**
- No equipment cost refund on cancel (leader can grief)
- Planning progress can be spammed (no cooldown/cost)
- Skill level ignores actual character skills (uses level*2)

**Missing Features:**
- Heat level system (calculated but never persisted)
- Scheduled heists (field exists, no logic)
- Client UI components

---

## GANG WAR DECK SYSTEM

### Grade: C+ (70/100)

**System Overview:**
- Card-based warfare with 3 game modes:
  - Raids: Press Your Luck (10 energy, 5/1 pts)
  - Champion Duels: Poker Hold/Draw (25 pts)
  - Leader Showdown: High-stakes poker (50 pts)
- Database-backed sessions with TTL cleanup
- Socket.io real-time updates

**Top 5 Strengths:**
1. Persistent session management (survives restart)
2. Comprehensive Socket.io integration
3. Solid energy & validation system
4. Well-structured game type separation
5. Rich war logging

**Critical Issues:**

1. **Missing `await` in Controller** (`gangWarDeck.controller.ts:100, 176`)
   - Returns Promise instead of data
   - Runtime crashes guaranteed

2. **Missing Gang Permission Validation** (`gangWarDeck.service.ts:271-309`)
   - Anyone can select champions for duels
   - No check that caller has authority

3. **Race Condition in Raid Cooldown** (`gangWarDeck.service.ts:108-116`)
   - Check-then-act pattern allows duplicate raids
   - Need unique compound index

4. **Missing Side Validation** (`gangWarDeck.service.ts:371-398`)
   - No validation attacker is in attacking gang
   - Participant check after session creation

**Balance Concerns:**
- Raid spam potential (no daily limit)
- Champion duel imbalance (one poker expert dominates)
- Leader showdown too restrictive (30-point window)
- No diminishing returns on raids

---

## NPC GANG CONFLICT SYSTEM

### Grade: C+ (65/100) - 6.5/10

**System Overview:**
- 4 NPC gangs with unique specialties (Frontera, Comanche, Railroad, Syndicate)
- Tribute system for relationship improvement
- Mission system with relationship gates
- Territory challenge with multi-stage conquest
- Automated daily attacks on hostile gangs

**Top 5 Strengths:**
1. Excellent transaction safety
2. Rich NPC gang data (leaders, abilities, backstories)
3. Well-structured relationship system (-100 to +100)
4. Comprehensive world events (5 types)
5. Robust client component (666 lines)

**Critical Issues:**

1. **Missing ActiveNPCMission Model** (`npcGangConflict.service.ts:88-89`)
   - Missions accepted but NEVER tracked
   - Progress cannot be saved, missions never complete

2. **Race Condition in Challenge System** (`npcGangConflict.service.ts:246-249`)
   - Duplicate challenges possible

3. **World Events Never Applied** (`npcGangConflict.service.ts:147-152`)
   - Events generated but have ZERO gameplay effect
   - ALLIANCE_OFFER (-50%) and TRIBUTE_DEMAND (+100%) ignored

4. **Tribute Streak Broken by Weekly Job** (`npcGangEvents.ts:292-297`)
   - `$inc: { tributeStreak: -1 }` decrements ALL streaks
   - Should only decrement unpaid tributes

5. **NPCAttackHistory Never Persisted** (`npcGangConflict.service.ts:92`)
   - Attacks execute but history never saved

**Missing Features:**
- Mission completion endpoint
- Retaliation system (flag exists, no endpoint)
- Challenge mission link
- Final battle leader abilities

---

## WAR OBJECTIVES SYSTEM

### Grade: C (60/100) - 60-70% Complete

**System Overview:**
- Faction war events with 4 types (Skirmish → Battle → Campaign → War)
- 24 unique objectives across 3 categories (Combat, Strategic, Support)
- Scaling system based on participants and event type
- MVP selection with diversity bonus
- Phase management (Announcement → Mobilization → Combat → Resolution)

**Top 5 Strengths:**
1. Well-designed objective scaling
2. Comprehensive transactional safety
3. Rich objective diversity (24 templates)
4. Robust event phase management
5. MVP system with diversity bonus

**Critical Issues:**

1. **Wrong Service Called in Resolution Job** (`warResolution.ts:33`)
   - Calls `GangWarService.autoResolveWars()` instead of `FactionWarService`
   - Faction wars NEVER auto-resolve

2. **No Auto-Resolution Method** (`factionWar.service.ts`)
   - `resolveWarEvent(event)` exists but no batch method
   - Events that fail phase update never resolve

3. **Missing Integration Hooks** (`warObjectives.service.ts:176-415`)
   - `recordNPCKill`, `recordDuelWin`, `recordSupportAction` exist
   - But combat/duel services NEVER call them
   - Objectives only progress via manual contribution

4. **No Admin Middleware** (`factionWar.routes.ts:76-118`)
   - Anyone can create/resolve war events
   - Only `requireAuth` protection

**Balance Concerns:**
- 80x scaling at max (8x event × 10x participants)
- Support actions undervalued (2-5x less than combat)
- MVP selection may exclude defenders
- No late-joiner penalty

---

## CROSS-SYSTEM FINDINGS

### Shared Problems

1. **Jail/Consequence Integration Missing**
   - Heists: Arrested players not jailed
   - NPC Attacks: No injury system
   - War: No capture/death consequences

2. **Auto-Resolution Jobs Broken**
   - Gang War Deck: No cleanup on war end
   - Faction War: Wrong service called
   - NPC Conflict: Events generated but not applied

3. **Permission/Admin Middleware Missing**
   - War event creation unprotected
   - Champion selection unvalidated
   - NPC attack simulation exposed

4. **Client-Server Type Mismatches**
   - Heist targets mismatch
   - Gang war game states mismatch
   - Different type definitions in client vs shared

### Integration Gaps

| System A | System B | Status |
|----------|----------|--------|
| Heist | Jail | ❌ Not integrated |
| Heist | Character Skills | ❌ Ignores skills |
| War Deck | Combat | ✅ Uses deckGames |
| War Objectives | Combat | ❌ No hooks |
| War Objectives | Duel | ❌ No hooks |
| NPC Conflict | Territory | ⚠️ Partial |

---

## PRIORITY FIX ORDER

### Immediate (Ship Blockers)
1. **Add `await` to gangWarDeck controller** - Crashes guaranteed
2. **Fix warResolution.ts service call** - Wars never resolve
3. **Create ActiveNPCMission model** - Missions non-functional
4. **Implement jail integration for heists** - No consequences

### High Priority (Week 1)
1. Add permission validation for champion duels
2. Fix tribute streak weekly job bug
3. Create auto-resolution method for faction wars
4. Add admin middleware to war event routes
5. Integrate objective hooks with combat/duel services

### Medium Priority (Week 2)
1. Fix client-server type mismatches
2. Implement world event modifiers
3. Add race condition protection
4. Create NPCAttackHistory model
5. Balance support action point values

---

## ESTIMATED EFFORT

| System | Critical Fixes | Full Completion |
|--------|---------------|-----------------|
| Gang Heist | 2-3 days | 2 weeks |
| Gang War Deck | 1-2 days | 1 week |
| NPC Gang Conflict | 4-5 days | 6 days |
| War Objectives | 2-3 days | 1 week |
| **Total** | **~2 weeks** | **~4 weeks** |

---

## CONCLUSION

The gang warfare systems represent **ambitious game design** with sophisticated mechanics (card-based warfare, multi-phase heists, NPC relationships). However, they suffer from:

1. **Critical integration failures** - Services exist but never called
2. **Missing consequence systems** - Arrests/injuries logged but not applied
3. **Broken auto-resolution** - Events/wars never complete automatically
4. **Security gaps** - Admin endpoints unprotected

**Key Blocker:** The faction war system will appear to work but events will never resolve because `warResolution.ts` calls the wrong service. This is a 5-minute fix with critical impact.

**Recommendation:** Fix the 4 critical issues in each system before any production deployment. The warfare features are too interconnected to deploy partially.
