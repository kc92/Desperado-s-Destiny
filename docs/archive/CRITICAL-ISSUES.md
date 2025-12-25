# CRITICAL ISSUES - Desperados Destiny

**Document Version:** 1.0
**Last Updated:** December 2025
**Status:** Pre-Production Assessment
**Overall Rating:** 7.5/10 - Strong foundation, critical gaps to address

---

## Executive Summary

This document identifies **12 critical issues** that must be addressed before production deployment. Issues are categorized by severity:

- **CRITICAL (4)** - Production blockers, economy-breaking exploits
- **MEDIUM (4)** - Should fix before beta testing
- **LOW (4)** - Balance tuning, quality of life

---

## Production Blockers (Must Fix Before Any Public Access)

### 1. Race Condition: Energy Service [CRITICAL]

| Attribute | Value |
|-----------|-------|
| **File** | `server/src/services/energy.service.ts:58-88` |
| **Issue** | Read-Modify-Write pattern allows double-spending energy |
| **Exploit** | Concurrent requests can bypass energy checks |
| **Impact** | Players get free actions, breaks game economy |
| **Effort** | 2-4 hours |

**Current Code (Vulnerable):**
```typescript
const character = await Character.findById(characterId);  // Read
await this.regenerateEnergy(character);                    // Compute
if (character.energy < cost) return false;                 // Check
character.energy -= cost;                                  // Modify
await character.save();                                    // Write
```

**Required Fix:**
```typescript
const result = await Character.findByIdAndUpdate(
  characterId,
  { $inc: { energy: -cost } },
  { new: true }
);
if (!result || result.energy < 0) {
  // Rollback if insufficient energy
  await Character.findByIdAndUpdate(characterId, { $inc: { energy: cost } });
  throw new AppError('Insufficient energy', 400);
}
```

---

### 2. In-Memory Duel State [CRITICAL]

| Attribute | Value |
|-----------|-------|
| **File** | `server/src/sockets/duelHandlers.ts:111-115` |
| **Issue** | Duel state stored in JavaScript Maps, not persistent |
| **Impact** | Cannot scale horizontally, state lost on restart |
| **Effort** | 2-3 days |

**Current Code (Problematic):**
```typescript
const activeDuelStates = new Map<string, ActiveDuelState>();
const characterToDuel = new Map<string, string>();
const turnTimers = new Map<string, NodeJS.Timeout>();
```

**Problems:**
- Server restart = all active duels lost
- Cannot run multiple server instances
- No failover capability
- Max ~500 concurrent duels per server

**Required Fix:** Migrate to Redis-backed state storage with TTL and pub/sub for multi-instance coordination.

---

### 3. Duel Service Missing Sessions [HIGH]

| Attribute | Value |
|-----------|-------|
| **File** | `server/src/services/duel.service.ts:181-185` |
| **Issue** | Gold unlock operations don't use MongoDB sessions |
| **Impact** | Inconsistent state on partial transaction failures |
| **Effort** | 4-8 hours |

**Problem:** When a duel ends, gold is unlocked for both players. If one unlock succeeds and the other fails, the database is left in an inconsistent state.

**Fix:** Propagate MongoDB sessions to all character update operations within duel resolution.

---

### 4. TypeScript Compilation Errors [HIGH]

| Attribute | Value |
|-----------|-------|
| **Issue** | 73 server-side errors, 565+ client-side errors |
| **Impact** | Production builds fail completely |
| **Effort** | 1-2 weeks |

**Current State:**
- Server: 73 TypeScript errors
- Client: 565+ TypeScript errors
- Cannot generate production builds

**Root Causes:**
- `strictNullChecks: false` hiding null bugs
- `noImplicitReturns: false` hiding missing returns
- Mixed type definitions across packages

---

## Security Vulnerabilities

### 5. CORS Configuration [MEDIUM]

| Attribute | Value |
|-----------|-------|
| **File** | `server/src/server.ts:129` |
| **Issue** | Production allows requests without Origin header |
| **Risk** | CSRF attacks from curl/mobile apps |
| **Effort** | 1-2 hours |

**Current Code:**
```typescript
if (!origin) {
  return callback(null, true);  // ALLOWS ANYONE in production!
}
```

**Fix:** Reject origin-less requests in production environment.

---

### 6. Rate Limiting Not Distributed [MEDIUM]

| Attribute | Value |
|-----------|-------|
| **File** | `server/src/middleware/rateLimiter.ts` |
| **Issue** | Uses in-memory store (express-rate-limit default) |
| **Impact** | Multiple servers don't share rate limits |
| **Effort** | 4-8 hours |

**Fix:** Implement Redis-based rate limiter using `rate-limit-redis` package.

---

### 7. Fail-Open Auth in Dev [LOW]

| Attribute | Value |
|-----------|-------|
| **File** | `server/src/middleware/auth.middleware.ts:76-88` |
| **Issue** | Dev mode bypasses blacklist checks |
| **Risk** | If env vars leak, tokens bypass security |
| **Effort** | 1-2 hours |

**Fix:** Only fail-open in explicit `NODE_ENV=test` mode, never in development.

---

## Memory & Performance Issues

### 8. Socket Handler Memory Leaks [MEDIUM]

| Attribute | Value |
|-----------|-------|
| **File** | `server/src/sockets/duelHandlers.ts` |
| **Issue** | Timers and state maps not cleaned on disconnect |
| **Impact** | Memory grows unbounded over time |
| **Effort** | 2-4 hours |

**Missing Cleanup:**
```typescript
socket.on('disconnect', () => {
  const duelId = characterToDuel.get(characterId);
  if (duelId) {
    clearTimeout(turnTimers.get(duelId));
    turnTimers.delete(duelId);
    activeDuelStates.delete(duelId);
    characterToDuel.delete(characterId);
  }
});
```

---

### 9. Single-Instance Job Processing [MEDIUM]

| Attribute | Value |
|-----------|-------|
| **Files** | `server/src/jobs/*.job.ts` (9 files) |
| **Issue** | Cron jobs run on every server instance |
| **Impact** | Duplicate processing, wasted resources |
| **Effort** | 1-2 days |

**Affected Jobs:**
- warResolution.job
- bountyCleanup.job
- territoryMaintenance.job
- marketplace.job
- gangEconomyJobs.job
- productionTick.job
- weeklyTaxCollection.job
- gossipSpread.job
- influenceDecay.job

**Fix:** Implement distributed job queue using Bull (Redis-based) or Agenda (MongoDB-based).

---

## Game Balance Issues (Not Blockers)

### 10. NPC Redraw Mechanic [LOW]

| Attribute | Value |
|-----------|-------|
| **Issue** | 50% redraw chance at high difficulty is unfair |
| **Impact** | NPCs get 1.5x effective hand quality |
| **Recommendation** | Cap redraw at 35% for player parity |

**Current Formula:**
```
Redraw Chance = min(0.50, 0.05 + (difficulty × 0.05))
```

---

### 11. Skill Training Time [BY DESIGN - NOT AN ISSUE]

| Attribute | Value |
|-----------|-------|
| **Status** | Working as intended |
| **Design Intent** | Long-term MMORPG progression comparable to RuneScape |
| **Note** | 7.3 years to max all skills is appropriate for hardcore MMORPG retention |

**Comparison to Industry:**
- RuneScape 99 skills: 1,000-2,000+ hours each
- Torn skills: Similar multi-year investment
- This creates long-term player investment and retention

---

### 12. Combat Damage Variance [LOW]

| Attribute | Value |
|-----------|-------|
| **Issue** | 0-5 variance on 80+ damage is only 6% |
| **Impact** | Combat feels predictable, lacks excitement |
| **Recommendation** | Increase variance to 0-15 (±15%) |

---

## Remediation Priority Schedule

### Week 1: Critical Security
| Day | Task | Effort |
|-----|------|--------|
| 1-2 | Fix energy service race condition | 4h |
| 2-3 | Fix duel service session propagation | 8h |
| 3-4 | Fix CORS configuration | 2h |
| 4-5 | Add socket disconnect cleanup | 4h |

### Week 2: Scalability
| Day | Task | Effort |
|-----|------|--------|
| 1-3 | Migrate duel state to Redis | 24h |
| 3-4 | Implement distributed rate limiting | 8h |
| 4-5 | Set up Redis adapter for Socket.io | 8h |

### Week 3: Infrastructure
| Day | Task | Effort |
|-----|------|--------|
| 1-4 | Resolve TypeScript compilation errors | 32h |
| 4-5 | Implement distributed job queue | 16h |

### Week 4: Testing & Validation
| Day | Task | Effort |
|-----|------|--------|
| 1-2 | Load test with 100+ concurrent users | 16h |
| 2-3 | Security penetration testing | 16h |
| 3-5 | Economy exploit testing | 24h |

---

## Quick Reference: Files to Fix

### Critical Path (Week 1)
```
server/src/services/energy.service.ts       # Race condition
server/src/services/duel.service.ts         # Session propagation
server/src/server.ts                        # CORS fix
server/src/sockets/duelHandlers.ts          # Memory leaks
```

### Scalability (Week 2)
```
server/src/sockets/duelHandlers.ts          # Redis migration
server/src/middleware/rateLimiter.ts        # Distributed limiting
server/src/config/socket.ts                 # Redis adapter
```

### Infrastructure (Week 3)
```
server/tsconfig.json                        # Strict mode
client/tsconfig.json                        # Strict mode
server/src/jobs/*.job.ts                    # Distributed queue
```

---

## Success Criteria

Before declaring "Production Ready":

- [ ] All 4 CRITICAL issues resolved
- [ ] All 4 MEDIUM issues resolved
- [ ] TypeScript compiles with zero errors (client & server)
- [ ] Load test passes with 100 concurrent users
- [ ] No economy exploits found in 24-hour test
- [ ] Horizontal scaling verified with 2+ server instances
- [ ] Monitoring and alerting configured

---

## Notes

### What's Already Good
- Gold service uses proper atomic operations (model implementation)
- Authentication system is robust (JWT, refresh tokens, bcrypt)
- Rate limiting is comprehensive (just needs distribution)
- Error handling with Sentry integration
- Tutorial system is exceptionally well-designed

### Commercial Potential
The Destiny Deck system is a genuine innovation in browser gaming. With these issues addressed, the project has real commercial potential in an underserved market.

---

*Generated by Claude Code - AAA Game Development Analysis*
*December 2025*
