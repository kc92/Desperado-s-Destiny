# Desperados Destiny - Batch-Specific Remediation Plans

This document provides detailed remediation instructions for each of the 96 systems, organized by batch.

---

# BATCH 1: CORE INFRASTRUCTURE (8 Systems)

## System 1: Authentication (9/10)

**Status:** Excellent - Minor fixes only

### Files
- `server/src/controllers/auth.controller.ts`
- `server/src/utils/jwt.ts`
- `server/src/middleware/auth.middleware.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| LOW | Expired tokens accumulate | auth.controller.ts:149-160 | Add cleanup job to remove expired tokens |
| LOW | Cookie maxAge comment | auth.controller.ts:299 | Verify against config.jwt.expiresIn |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `AuditLogger` for all auth events
- [ ] Add rate limiting to `/auth/me` endpoint

---

## System 2: Account Security (9/10)

**Status:** Excellent - One critical flag to remove

### Files
- `server/src/services/accountSecurity.service.ts`
- `server/src/services/tokenBlacklist.service.ts`
- `server/src/services/tokenManagement.service.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | ALLOW_REDIS_BYPASS flag | tokenManagement.service.ts:249 | DELETE ENTIRELY |
| HIGH | Session limit not on refresh | tokenManagement.service.ts:61-107 | Check limit before refreshing |
| HIGH | IP binding only on refresh | tokenManagement.service.ts:131-147 | Capture IP on login too |

### Refactoring Tasks
- [ ] Remove REDIS_BYPASS flag
- [ ] Add startup Redis validation for production
- [ ] Extend `BaseService` class

---

## System 3: Character Management

**Status:** Good

### Files
- `server/src/controllers/character.controller.ts`
- `server/src/services/character.service.ts`
- `server/src/models/Character.model.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | Add validation schemas | Use Zod for character creation |
| MEDIUM | Add `getSkillLevel()` method | Implement on Character model |
| LOW | Add character indexes | locationId, gangId, wantedLevel |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Add input validation middleware
- [ ] Use `SecureRNG` for any random operations

---

## System 4: Energy System

**Status:** Good

### Files
- `server/src/controllers/energy.controller.ts`
- `server/src/services/energy.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| HIGH | Use atomic operations | Replace read-modify-write with `$inc` |
| MEDIUM | Add energy cap constant | Use `CHARACTER_CONSTANTS.MAX_ENERGY` |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use constants from shared/constants
- [ ] Add transaction support for multi-step operations

---

## System 5: Destiny Deck Engine (4/10)

**Status:** CRITICAL - Game-breaking bug

### Files
- `server/src/controllers/action.controller.ts`
- `server/src/services/actionDeck.service.ts`
- `server/src/services/handEvaluator.service.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | Difficulty * 100,000 | action.controller.ts:238 | Change to `difficulty * COMBAT_CONSTANTS.DIFFICULTY_MULTIPLIER` |
| CRITICAL | Missing DeckGame.tsx | client/src/components/game/ | Create component or remove routes |
| CRITICAL | Items never awarded | action.controller.ts:279 | Implement item reward distribution |
| HIGH | In-memory pendingGames | actionDeck.service.ts:32-47 | Migrate to Redis StateManager |
| HIGH | Uses deprecated spendEnergy | actionDeck.service.ts:271 | Use `EnergyService.spend()` |
| HIGH | Uses stats not skills | action.controller.ts:30-39 | Use `getSkillBonusForSuit()` |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Migrate pending games to Redis
- [ ] Use `SecureRNG` for card dealing
- [ ] Use constants for difficulty calculation
- [ ] Add validation for difficulty range (0-100)

---

## System 6: Skill Training

**Status:** Good

### Files
- `server/src/controllers/skill.controller.ts`
- `server/src/services/skill.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | Hardcoded skill caps | Use `CHARACTER_CONSTANTS.MAX_SKILL_LEVEL` |
| LOW | Add skill constants | Extract skill names to constants |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use constants from shared/constants
- [ ] Add transaction support

---

## System 7: Tutorial System

**Status:** Good

### Files
- `server/src/controllers/tutorial.controller.ts`
- `server/src/services/mentor.service.ts`
- `client/src/store/useTutorialStore.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| LOW | Add progress tracking | Persist tutorial progress to database |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `AuditLogger` for tutorial completion

---

## System 8: Error Handling

**Status:** Good Foundation

### Files
- `server/src/utils/errorHandler.ts`
- `server/src/utils/AppError.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| HIGH | Enhance AppError | Add error codes enum, context support |
| MEDIUM | Standardize error responses | Consistent JSON structure |

### Refactoring Tasks
- [ ] Add `ErrorCode` enum
- [ ] Add static factory methods
- [ ] Add context parameter for debugging

---

# BATCH 2: COMBAT SYSTEMS (10 Systems)

## System 9: PvE Combat (6/10)

**Status:** Critical race condition

### Files
- `server/src/controllers/combat.controller.ts`
- `server/src/services/combat.service.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | Turn race condition | combat.service.ts:321-327 | Use atomic `findOneAndUpdate` with turn validation |
| CRITICAL | Energy not transactional | combat.service.ts:183-191 | Move energy deduction to transaction |
| HIGH | Damage bias | combat.service.ts:266,406 | Apply difficulty modifier consistently |
| MEDIUM | No NPC level validation | combat.controller.ts:48-51 | Compare character level to NPC |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `withLock` for encounter operations
- [ ] Use `SecureRNG` for damage rolls
- [ ] Add constants for energy costs

---

## System 10: PvP Duels (4/10)

**Status:** CRITICAL - Hand ranking not implemented

### Files
- `server/src/controllers/duel.controller.ts`
- `server/src/services/duel.service.ts`
- `server/src/sockets/duelHandlers.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | Hand ranking TODO | duelHandlers.ts:915 | Implement using `HandEvaluator.evaluateHand()` |
| CRITICAL | In-memory game state | duel.service.ts:33 | Migrate to `duelStateManager` |
| HIGH | All-in logic TODO | duelHandlers.ts:1084 | Implement all-in state handling |
| HIGH | Cheating loss TODO | duelHandlers.ts:1234 | End duel on cheat detection |
| HIGH | Wager recovery partial | duel.service.ts:508-545 | Use transaction for recovery |
| MEDIUM | Socket lookup O(n) | duelHandlers.ts:238-254 | Cache socket mapping |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Migrate ALL in-memory Maps to Redis StateManager
- [ ] Use `SecureRNG` for card dealing
- [ ] Add validation schemas
- [ ] Use `withLock` for state modifications

---

## System 11: Duel State Management

**Status:** Needs Redis migration

### Files
- `server/src/services/duelStateManager.service.ts`
- `server/src/services/duelTimerManager.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| HIGH | Timer polling 1s | Reduce to 500ms |
| MEDIUM | State not persisted | Use Redis with TTL |

### Refactoring Tasks
- [ ] Use `StateManager` base class
- [ ] Add proper error handling

---

## System 12: World Boss

**Status:** Moderate

### Files
- `server/src/services/worldBoss.service.ts`
- `server/src/services/worldBossSession.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| HIGH | Session state in memory | Migrate to MongoDB/Redis |
| MEDIUM | Damage aggregation | Use atomic operations |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `SecureRNG` for boss actions
- [ ] Add distributed locking

---

## System 13: Boss Phase System

**Status:** Good

### Files
- `server/src/services/bossPhase.service.ts`
- `server/src/services/bossEncounter.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | Hardcoded phase values | Extract to constants |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use constants

---

## System 14: Legendary Hunts

**Status:** Moderate

### Files
- `server/src/services/legendaryHunt.service.ts`
- `server/src/services/legendaryCombat.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| HIGH | Hunt state in memory | Migrate to Redis |
| MEDIUM | Reward distribution | Use transactions |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `huntingStateManager`
- [ ] Use `SecureRNG`

---

## System 15: Bounty Hunter

**Status:** Good

### Files
- `server/src/services/bountyHunter.service.ts`
- `server/src/services/bounty.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | Bounty creation not atomic | Add transaction |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use transactions

---

## System 16: Perception System

**Status:** Good

### Files
- `server/src/services/perception.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| LOW | Add perception constants | Extract to shared constants |

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 17: Companion Combat

**Status:** Moderate

### Files
- `server/src/services/companionCombat.service.ts`
- `server/src/services/companion.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | Companion damage not atomic | Add transaction |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `SecureRNG`

---

## System 18: Death & Resurrection

**Status:** Good

### Files
- `server/src/services/death.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | Death penalty calculation | Use constants |

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

# BATCH 3: ECONOMY & TRADING (12 Systems)

## System 19: Gold Economy (9/10)

**Status:** Excellent

### Files
- `server/src/services/gold.service.ts`
- `server/src/controllers/gold.controller.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| HIGH | No rate limiting | gold.controller.ts | Add rate limiter middleware |
| MEDIUM | Statistics loads all | gold.service.ts:308-348 | Use aggregation pipeline |

### Refactoring Tasks
- [ ] Already follows best practices - use as reference
- [ ] Add rate limiting to endpoints

---

## System 20: Banking System

**Status:** Good

### Files
- `server/src/services/bank.service.ts`
- `server/src/controllers/bank.controller.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | Add transaction safety | Wrap in transactions |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `GoldService` for all transfers

---

## System 21: Marketplace (6/10)

**Status:** Critical race conditions

### Files
- `server/src/services/marketplace.service.ts`
- `server/src/controllers/marketplace.controller.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | Bid refund race | marketplace.service.ts:634-659 | Delete inside transaction |
| CRITICAL | No atomic item verification | marketplace.service.ts:218-224 | Use `findOneAndUpdate` with `$pull` |
| CRITICAL | Expired listing not atomic | marketplace.service.ts:1138-1198 | Add recovery mechanism |
| HIGH | Buyout equals starting | marketplace.service.ts:604-606 | Enforce buyout > startingPrice |
| HIGH | Price history outside txn | marketplace.service.ts:291-295 | Include in transaction |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `withLock` for bid operations
- [ ] Use `withTransaction` for all multi-step operations
- [ ] Add validation schemas

---

## System 22: Property System

**Status:** Critical - gold methods broken

### Files
- `server/src/services/property.service.ts`
- `server/src/services/propertyPurchase.service.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | deductGold doesn't exist | propertyPurchase.service.ts:656 | Use `GoldService.deductGold()` |
| CRITICAL | addGold doesn't exist | propertyPurchase.service.ts:661 | Use `GoldService.addGold()` |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `GoldService` for all gold operations
- [ ] Use transactions

---

## System 23: Property Tax System

**Status:** Moderate

### Files
- `server/src/services/propertyTax.service.ts`
- `server/src/services/foreclosure.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| HIGH | Tax calculation race | Add unique index on (propertyId, taxPeriod) |
| MEDIUM | Use transactions | Wrap tax bill creation |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `withTransaction`

---

## System 24: Shop/Inventory

**Status:** Moderate

### Files
- `server/src/services/shop.service.ts`
- `server/src/services/inventory.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | Item mutation risk | Clone items before pushing |
| MEDIUM | Add transaction safety | Wrap purchase in transaction |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `GoldService` for purchases
- [ ] Use transactions

---

## System 25: Crafting System

**Status:** Moderate

### Files
- `server/src/services/crafting.service.ts`
- `server/src/controllers/crafting.controller.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | Material consumption not atomic | Use transaction |
| LOW | Extract recipe constants | Move to constants file |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use transactions
- [ ] Use `SecureRNG` for quality rolls

---

## System 26: Production System

**Status:** Moderate

### Files
- `server/src/services/production.service.ts`
- `server/src/controllers/production.controller.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| HIGH | Worker N+1 query | Use bulkWrite |
| MEDIUM | Use transactions | Wrap production cycles |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Optimize batch operations

---

## System 27: Workshop System

**Status:** Good

### Files
- `server/src/services/workshop.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 28: Masterwork System

**Status:** Good

### Files
- `server/src/services/masterwork.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `SecureRNG` for quality rolls

---

## System 29: Daily Contracts

**Status:** Good

### Files
- `server/src/services/dailyContract.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 30: Login Rewards

**Status:** Good

### Files
- `server/src/services/loginReward.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use transactions for reward distribution

---

# BATCH 4: GANG & TERRITORY (10 Systems)

## System 31: Gang System (6/10)

**Status:** Multiple IDOR vulnerabilities

### Files
- `server/src/services/gang.service.ts`
- `server/src/controllers/gang.controller.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | IDOR in depositBank | gang.controller.ts:323-360 | Add `verifyCharacterOwnership` |
| CRITICAL | IDOR in sendInvitation | gang.controller.ts:569-595 | Add `verifyCharacterOwnership` |
| CRITICAL | Member count race | gang.service.ts:194 | Re-check after transaction begins |
| HIGH | IDOR in kickMember | gang.controller.ts:251-277 | Add `verifyCharacterOwnership` |
| HIGH | IDOR in promoteMember | gang.controller.ts:283-317 | Add `verifyCharacterOwnership` |
| HIGH | N+1 in getGangStats | gang.service.ts:844-890 | Use aggregation pipeline |
| MEDIUM | Bank capacity unlimited | gang.service.ts | Implement `getMaxBankCapacity()` |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Add ownership verification to ALL endpoints
- [ ] Use validation schemas
- [ ] Use constants for limits

---

## System 32: Gang Economy

**Status:** Moderate

### Files
- `server/src/services/gangEconomy.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | Add transaction safety | Use transactions |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `GoldService` for transfers

---

## System 33: Gang Base

**Status:** Good

### Files
- `server/src/services/gangBase.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 34: Gang Wars (4/10)

**Status:** Critical - energy system broken

### Files
- `server/src/services/gangWar.service.ts`
- `server/src/services/gangWarDeck.service.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | Capture points overflow | gangWarDeck.service.ts:219-222 | Verify min/max applied correctly |
| CRITICAL | Energy never regenerates | gangWarDeck.service.ts:88-91 | Add regen mechanics or reduce cost |
| CRITICAL | Raid games leak memory | gangWarDeck.service.ts:109-114 | Add timeout cleanup (5 min max) |
| CRITICAL | In-memory state lost | gangWarDeck.service.ts:59-61 | Migrate to Redis StateManager |
| HIGH | Member raid cooldown | gangWarDeck.service.ts:108-114 | Add per-character cooldown |
| HIGH | War funding validation | gangWar.service.ts:35-37 | Validate against balance |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Migrate to `raidStateManager`, `showdownStateManager`
- [ ] Use `withLock` for war state modifications
- [ ] Add cleanup jobs

---

## System 35: NPC Gang Conflicts

**Status:** Moderate

### Files
- `server/src/services/npcGangConflict.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `SecureRNG`

---

## System 36: Territory Control

**Status:** Moderate

### Files
- `server/src/services/territory.service.ts`
- `server/src/services/territoryControl.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | Add transaction safety | Use transactions |

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 37: Territory Influence

**Status:** Moderate

### Files
- `server/src/services/territoryInfluence.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 38: Conquest System

**Status:** Moderate

### Files
- `server/src/services/conquest.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use transactions

---

## System 39: Faction Wars

**Status:** Moderate

### Files
- `server/src/services/factionWar.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use constants for faction list

---

## System 40: Heist System

**Status:** Moderate

### Files
- `server/src/services/heist.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| HIGH | State in memory | Migrate to Redis |
| MEDIUM | Add transaction safety | Use transactions |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `SecureRNG`
- [ ] Migrate state to Redis

---

# BATCH 5: SOCIAL & COMMUNICATION (10 Systems)

## System 41: Real-time Chat (6.5/10)

**Status:** Fail-open rate limiting

### Files
- `server/src/services/chat.service.ts`
- `server/src/sockets/chatHandlers.ts`
- `server/src/middleware/chatRateLimiter.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | Unbounded query | chat.service.ts:134-139 | Enforce max limits |
| CRITICAL | Fail-open rate limit | chatRateLimiter.ts:144-145 | Change to fail-closed |
| HIGH | Report functionality stubbed | chat.controller.ts:235-242 | Implement report workflow |
| HIGH | Missing rate limit on HTTP | chat.routes.ts | Add rate limiter middleware |
| MEDIUM | Missing index | chat.service.ts:134 | Add compound index |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Fix fail-open to fail-closed
- [ ] Add validation schemas
- [ ] Implement report system

---

## System 42: Mail System

**Status:** Moderate

### Files
- `server/src/services/mail.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | Add rate limiting | Use mail rate limiter |

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 43: Friend System

**Status:** Moderate

### Files
- `server/src/services/friend.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | Add rate limiting | Use friend rate limiter |

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 44: Notifications

**Status:** Good

### Files
- `server/src/services/notification.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 45: NPC Relationships

**Status:** Moderate

### Files
- `server/src/services/reputation.service.ts`
- `server/src/services/npcReaction.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | Add transaction safety | Use transactions for rep changes |

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 46: NPC Gossip

**Status:** Moderate

### Files
- `server/src/services/gossip.service.ts`
- `server/src/services/reputationSpreading.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | Memory inefficiency | Add timeout and pagination |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Add batch processing

---

## System 47: Mentor System

**Status:** Good

### Files
- `server/src/services/mentor.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 48: Newspaper System

**Status:** Good

### Files
- `server/src/services/newspaper.service.ts`
- `server/src/services/headlineGenerator.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 49: Secrets Discovery

**Status:** Good

### Files
- `server/src/services/secrets.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 50: Chinese Diaspora

**Status:** Good

### Files
- `server/src/services/chineseDiaspora.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

# BATCH 6: ACTIVITIES & MINI-GAMES (12 Systems)

## System 51: Crime System (7.5/10)

**Status:** Good - minor transaction issues

### Files
- `server/src/services/crime.service.ts`
- `server/src/controllers/crime.controller.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | Bounty race condition | crime.service.ts:136-159 | Wrap in transaction |
| HIGH | Missing cooldown | crime.service.ts:531-540 | Verify and add rate limiting |
| HIGH | No transaction in layLow | crime.service.ts:400-479 | Use same transaction |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use transactions for all operations
- [ ] Use `SecureRNG` for witness detection

---

## System 52: Jail/Bail

**Status:** Moderate

### Files
- `server/src/services/jail.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| HIGH | Release validation | Check not in jail before release |

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 53: Gambling Games (6/10)

**Status:** Weak RNG, non-atomic bets

### Files
- `server/src/services/gambling.service.ts`
- `server/src/controllers/gambling.controller.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | Weak RNG | gambling.service.ts:110,206,387,445 | Use `SecureRNG` |
| CRITICAL | Non-atomic bets | gambling.service.ts:225-233 | Wrap in transaction |
| CRITICAL | Blackjack hardcoded | gambling.service.ts:357-358 | Document or fix |
| HIGH | Game state not validated | gambling.service.ts:125-146 | Add schema validation |
| MEDIUM | No session timeout | gambling.service.ts:88-106 | Add idle timeout |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Replace ALL `Math.random()` with `SecureRNG`
- [ ] Use transactions for all bets
- [ ] Use `gamblingStateManager`

---

## System 54: High Stakes Events

**Status:** Moderate

### Files
- `server/src/services/highStakesEvents.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| HIGH | Use SecureRNG | Replace Math.random() |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `SecureRNG`

---

## System 55: Horse Racing (4/10)

**Status:** No model persistence

### Files
- `server/src/services/horseRacing.service.ts`
- `server/src/controllers/racing.controller.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | No HorseRace model | horseRacing.service.ts:42 | Create and use model |
| CRITICAL | Weak RNG | horseRacing.service.ts:171 | Use `SecureRNG` |
| CRITICAL | No transaction support | racing.controller.ts:176 | Implement betting with transactions |
| HIGH | Type safety issues | horseRacing.service.ts:42 | Remove `as any` casts |

### Refactoring Tasks
- [ ] Create `HorseRace` model
- [ ] Extend `BaseService` class
- [ ] Use `SecureRNG`
- [ ] Implement proper persistence

---

## System 56: Horse Breeding

**Status:** Moderate

### Files
- `server/src/services/horseBreeding.service.ts`
- `server/src/services/horseBond.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | Use SecureRNG | For trait inheritance |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `SecureRNG`

---

## System 57: Shooting Contests

**Status:** Moderate

### Files
- `server/src/services/shootingContest.service.ts`
- `server/src/services/shootingMechanics.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | Use SecureRNG | For accuracy calculations |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `SecureRNG`

---

## System 58: Hunting System (3/10)

**Status:** NON-FUNCTIONAL - hunt never completes

### Files
- `server/src/services/hunting.service.ts`
- `server/src/controllers/hunting.controller.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | Hunt never completes | hunting.service.ts:161-171 | Create `completeHunt()` endpoint |
| CRITICAL | Animal selection stubbed | hunting.service.ts:276-298 | Call `selectRandomAnimal()` |
| CRITICAL | Gold reward never applied | hunting.service.ts:248 | Integrate `GoldService` |
| HIGH | Skill level undefined | hunting.service.ts:304-330 | Implement `getSkillLevel()` |
| HIGH | XP never awarded | hunting.service.ts:211 | Integrate experience service |

### Implementation Required
1. Create `completeHunt()` method
2. Create `resolveHunt()` method with shot placement
3. Implement `selectRandomAnimal()` using `SecureRNG.weightedSelect()`
4. Integrate `GoldService` for rewards
5. Integrate experience service for XP

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `huntingStateManager` instead of in-memory
- [ ] Use `SecureRNG` for all random operations
- [ ] Add hunting route endpoints

---

## System 59: Fishing System

**Status:** Moderate

### Files
- `server/src/services/fishing.service.ts`
- `server/src/services/fishFighting.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | Use SecureRNG | For fish encounters |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `SecureRNG`

---

## System 60: Train Robbery

**Status:** Moderate

### Files
- `server/src/services/train.service.ts`
- `server/src/services/trainRobbery.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| HIGH | State in memory | Migrate to Redis |
| MEDIUM | Use transactions | For loot distribution |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `SecureRNG`
- [ ] Migrate state to Redis

---

## System 61: Stagecoach System

**Status:** Moderate

### Files
- `server/src/services/stagecoach.service.ts`
- `server/src/services/stagecoachAmbush.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | Use transactions | For ambush outcomes |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `SecureRNG`

---

## System 62: Tournament System

**Status:** Moderate

### Files
- `server/src/services/tournament.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| HIGH | State in memory | Migrate to Redis/MongoDB |
| MEDIUM | Add transaction safety | Use transactions |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `SecureRNG` for matchmaking

---

# BATCH 7: WORLD SYSTEMS (10 Systems)

## System 63: Location System (7/10)

**Status:** Good - session cleanup needed

### Files
- `server/src/services/location.service.ts`
- `server/src/controllers/location.controller.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | Session cleanup | location.service.ts:350 | Add finally block with `session.endSession()` |
| HIGH | Job rewards outside txn | location.service.ts:526-540 | Move inside transaction |
| HIGH | Energy cost no cap | location.service.ts:231-271 | Add `Math.min(cost, MAX_COST)` |
| MEDIUM | No location discovery tracking | location.service.ts | Add discovery flags |

### Refactoring Tasks
- [ ] Extend `BaseService` class (use `withTransaction` helper)
- [ ] Use constants for energy costs
- [ ] Add validation schemas

---

## System 64: Weather System

**Status:** Good

### Files
- `server/src/services/weather.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `SecureRNG` for weather changes

---

## System 65: Day/Night Cycle

**Status:** Good

### Files
- `server/src/services/time.service.ts`
- `server/src/services/schedule.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 66: Calendar/Events

**Status:** Good

### Files
- `server/src/services/calendar.service.ts`
- `server/src/services/season.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 67: Holiday Events

**Status:** Good

### Files
- `server/src/services/holiday.service.ts`
- `server/src/services/holidayRewards.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use transactions for rewards

---

## System 68: World Events

**Status:** Moderate

### Files
- `server/src/services/worldEvent.service.ts`
- `server/src/services/systemEvent.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | Event state persistence | Add to database |

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 69: Frontier Zodiac

**Status:** Good

### Files
- `server/src/services/frontierZodiac.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 70: NPC Schedules

**Status:** Good

### Files
- `server/src/services/schedule.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 71: Crowd System

**Status:** Good

### Files
- `server/src/services/crowd.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `SecureRNG` for crowd generation

---

## System 72: Wandering NPCs

**Status:** Moderate

### Files
- `server/src/services/wanderingNpc.service.ts`
- `server/src/services/wanderingMerchant.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | State persistence | Add to database |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `SecureRNG` for movement

---

# BATCH 8: PROGRESSION & META (8 Systems)

## System 73: Quest System (7/10)

**Status:** Good - N+1 queries

### Files
- `server/src/services/quest.service.ts`
- `server/src/controllers/quest.controller.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | Double-spend prevention | quest.service.ts:358-409 | Add reward claim check |
| HIGH | N+1 query | quest.controller.ts:31-51 | Use `.populate()` |
| HIGH | Race condition | quest.service.ts:293-312 | Use `$inc` operator |
| MEDIUM | No timeLimit enforcement | quest.service.ts:268-271 | Add expiration job |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Optimize queries
- [ ] Add validation schemas

---

## System 74: Legendary Quests (4/10)

**Status:** 10 TODO implementations

### Files
- `server/src/services/legendaryQuest.service.ts`
- `server/src/models/LegendaryProgress.model.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | 10 TODO placeholders | legendaryQuest.service.ts:519-579 | Implement ALL reward/effect types |
| CRITICAL | Unsafe type casting | legendaryQuest.service.ts:512,554 | Add proper typing |
| CRITICAL | No transaction protection | legendaryQuest.service.ts:262,333,398-399 | Wrap in transactions |
| HIGH | Race condition on choice | legendaryQuest.service.ts:388-392 | Use transactions |
| HIGH | Missing duplicate prevention | legendaryQuest.service.ts:484-486 | Add idempotency check |

### Implementation Required
See Phase 5 in REMEDIATION-MASTER-PLAN.md for full implementation.

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Implement ALL TODO stubs
- [ ] Use transactions throughout
- [ ] Add proper typing

---

## System 75: Achievement System

**Status:** Good

### Files
- `server/src/services/achievement.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use transactions for unlocks

---

## System 76: Leaderboards

**Status:** Moderate

### Files
- `server/src/services/leaderboard.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | No pagination | Add limit/offset |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Add caching for top rankings

---

## System 77: Specialization

**Status:** Good

### Files
- `server/src/services/specialization.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 78: Legacy Progression

**Status:** Moderate

### Files
- `server/src/services/legacy.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | State persistence | Ensure database storage |

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 79: Permanent Unlocks

**Status:** Good

### Files
- `server/src/services/permanentUnlock.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 80: Action Effects

**Status:** Good

### Files
- `server/src/services/actionEffects.service.ts`
- `server/src/data/actionInfluenceMap.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

# BATCH 9: END-GAME & SPECIAL (10 Systems)

## System 81: Cosmic Horror Storyline (4/10)

**Status:** CRITICAL - in-memory storage

### Files
- `server/src/services/cosmicQuest.service.ts`
- `server/src/services/cosmicEnding.service.ts`
- `server/src/controllers/cosmic.controller.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | In-memory storage | cosmicQuest.service.ts:27-29 | Create `CosmicProgress` MongoDB model |
| CRITICAL | Data loss on restart | cosmicQuest.service.ts:27-29 | Persist to database |
| CRITICAL | No atomic operations | cosmicQuest.service.ts:93-117 | Add transactions |
| HIGH | Objective mutation | cosmicQuest.service.ts:259 | Clone before modification |
| HIGH | Choice rewards incomplete | cosmicQuest.service.ts:394-406 | Implement full logic |

### Implementation Required
See Phase 3 in REMEDIATION-MASTER-PLAN.md for CosmicProgress model.

### Refactoring Tasks
- [ ] Create `CosmicProgress` model
- [ ] Extend `BaseService` class
- [ ] Migrate from Map to MongoDB
- [ ] Add validation

---

## System 82: Reality Distortion (3/10)

**Status:** Most effects are stubs

### Files
- `server/src/services/realityDistortion.service.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | Effects never applied | realityDistortion.service.ts:302-371 | Implement all effect methods |
| CRITICAL | Sanity loss only logged | realityDistortion.service.ts:327 | Call `SanityService.reduceSanity()` |
| CRITICAL | In-memory storage | realityDistortion.service.ts:20-25 | Migrate to MongoDB |
| CRITICAL | Memory leak | realityDistortion.service.ts:375-377 | Implement cleanup job |
| HIGH | 7 stub methods | realityDistortion.service.ts:407-454 | Implement all |

### Implementation Required
See Phase 5 in REMEDIATION-MASTER-PLAN.md for full implementation.

### Refactoring Tasks
- [ ] Create `ActiveDistortion` model
- [ ] Extend `BaseService` class
- [ ] Implement ALL 7 effect methods
- [ ] Integrate with `SanityService`

---

## System 83: Scar Content

**Status:** Moderate

### Files
- `server/src/services/scarContent.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `SecureRNG`

---

## System 84: Sanity System (6.5/10)

**Status:** Race condition in passive regen

### Files
- `server/src/services/sanity.service.ts`
- `server/src/models/SanityTracker.model.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | Race condition | sanity.service.ts:232-247 | Use distributed lock |
| CRITICAL | Missing input validation | sanity.service.ts:45-91 | Validate amount > 0 |
| HIGH | Hardcoded safe towns | sanity.service.ts:241 | Move to constants |
| HIGH | Restoration race | sanity.service.ts:286-300 | Use atomic `$inc` |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `withLock` for batch operations
- [ ] Use constants
- [ ] Add validation

---

## System 85: Ritual System

**Status:** Moderate

### Files
- `server/src/services/ritual.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| HIGH | Sanity integration | Uncomment SanityService call |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use transactions

---

## System 86: Disguise System (8/10)

**Status:** Good - well implemented

### Files
- `server/src/services/disguise.service.ts`
- `server/src/controllers/disguise.controller.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | Detection penalty low | disguise.service.ts:270-272 | Increase to 3-5 |
| HIGH | Dynamic import fragile | disguise.service.ts:159-169 | Move import to top |
| HIGH | No stat integration | disguise.service.ts:259 | Add stealth modifier |

### Refactoring Tasks
- [ ] Extend `BaseService` class (already good patterns)
- [ ] Move GoldService import to top
- [ ] Add stealth to detection formula

---

## System 87: Bribe System

**Status:** Good

### Files
- `server/src/services/bribe.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `GoldService` for transactions

---

## System 88: Taming System

**Status:** Moderate

### Files
- `server/src/services/taming.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | Use SecureRNG | For taming outcomes |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `SecureRNG`

---

## System 89: Entertainer System

**Status:** Good

### Files
- `server/src/services/entertainer.service.ts`

### Refactoring Tasks
- [ ] Extend `BaseService` class

---

## System 90: Mysterious Figure

**Status:** Moderate

### Files
- `server/src/services/mysteriousFigure.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| MEDIUM | State persistence | Ensure database storage |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use `SecureRNG`

---

# BATCH 10: INFRASTRUCTURE & VALIDATION (6 Systems)

## System 91: Balance Validation (6/10)

**Status:** Hardcoded values

### Files
- `server/src/services/balanceValidation.service.ts`

### Fixes Required

| Priority | Issue | Fix |
|----------|-------|-----|
| HIGH | Hardcoded max level | Use `CHARACTER_CONSTANTS.MAX_LEVEL` |
| MEDIUM | No caching | Cache validation results |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use constants

---

## System 92: Content Validation (6.5/10)

**Status:** Hardcoded values, incomplete stubs

### Files
- `server/src/services/contentValidation.service.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | Thread safety | contentValidation.service.ts:37-39 | Add read-only snapshot |
| HIGH | Hardcoded role strings | contentValidation.service.ts:156-167 | Use enums |
| HIGH | Hardcoded max level | contentValidation.service.ts:297 | Use constants |
| MEDIUM | Hardcoded faction list | contentValidation.service.ts:348 | Import from constants |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use constants for all values
- [ ] Implement missing stubs

---

## System 93: Cheating Detection (5.5/10)

**Status:** Gold deduction race condition

### Files
- `server/src/services/cheating.service.ts`
- `server/src/middleware/antiExploit.middleware.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | Gold deduction race | cheating.service.ts:164-167 | Use atomic transaction |
| CRITICAL | Faction reputation unsafe | cheating.service.ts:151-160 | Use enum for factions |
| CRITICAL | hasGamblingItemBonus stub | antiExploit.middleware.ts:236-248 | Implement or remove |
| HIGH | `||` instead of `??` | cheating.service.ts:106 | Use nullish coalescing |
| HIGH | XP farming non-functional | antiExploit.middleware.ts:210-240 | Implement tracking |

### Refactoring Tasks
- [ ] Extend `BaseService` class
- [ ] Use transactions for gold operations
- [ ] Implement stub methods
- [ ] Use constants for magic numbers

---

## System 94: Rate Limiting (7/10)

**Status:** Redis fallback issues

### Files
- `server/src/middleware/rateLimiter.ts`
- `server/src/middleware/friendRateLimiter.ts`
- `server/src/middleware/mailRateLimiter.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | Redis fallback loses distribution | rateLimiter.ts:46 | Implement local store with warning |
| HIGH | goldTransferRateLimiter key flaw | rateLimiter.ts:186-188 | Require auth before limiter |
| HIGH | passwordResetRateLimiter IP-only | rateLimiter.ts:241-257 | Add email-based tracking |
| MEDIUM | Admin rate limiter not exported | rateLimiter.ts:350-372 | Export in index.ts |

### Refactoring Tasks
- [ ] Fix fail-open to fail-closed
- [ ] Export all limiters in index.ts
- [ ] Use constants for limits

---

## System 95: Audit Logging (6.5/10)

**Status:** Incomplete sanitization

### Files
- `server/src/middleware/auditLog.middleware.ts`
- `server/src/models/AuditLog.model.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | No admin role check | auditLog.middleware.ts:86 | Add null check |
| CRITICAL | Incomplete sanitization | auditLog.middleware.ts:69-75 | Implement recursive |
| CRITICAL | No fallback logging | auditLog.middleware.ts:135-141 | Add file-based fallback |
| HIGH | No pagination | AuditLog.model.ts:110-135 | Add offset/limit |
| MEDIUM | Export missing | auditLog.middleware.ts | Export in index.ts |

### Refactoring Tasks
- [ ] Implement recursive sanitization
- [ ] Add file-based fallback
- [ ] Export in middleware/index.ts

---

## System 96: Background Jobs (6/10)

**Status:** Missing distributed locks

### Files
- `server/src/jobs/queues.ts`
- `server/src/jobs/influenceDecay.job.ts`
- `server/src/jobs/productionTick.job.ts`
- `server/src/jobs/marketplace.job.ts`

### Fixes Required

| Priority | Issue | File:Line | Fix |
|----------|-------|-----------|-----|
| CRITICAL | Race condition marketplace | marketplace.job.ts:36-66 | Use `withLock` |
| CRITICAL | Job deduplication missing | queues.ts:513-811 | Check job exists before scheduling |
| CRITICAL | No job locking | queues.ts | Use Bull locking or Redis locks |
| CRITICAL | Missing error recovery | queues.ts:150-156 | Implement retry with notifications |
| HIGH | console.log in production | productionTick.job.ts:20-24 | Use logger |
| HIGH | N+1 in worker health | productionTick.job.ts:76 | Use bulkWrite |

### Refactoring Tasks
- [ ] Add `withLock` to all critical jobs
- [ ] Implement job deduplication
- [ ] Replace console.log with logger
- [ ] Add job monitoring/alerting

---

# SUMMARY STATISTICS

## Issues by Priority

| Priority | Count |
|----------|-------|
| CRITICAL | 47 |
| HIGH | 68 |
| MEDIUM | 85 |
| LOW | 23 |
| **TOTAL** | **223** |

## Systems Requiring Major Work

| System | Score | Primary Issues |
|--------|-------|----------------|
| Hunting | 3/10 | Non-functional |
| Reality Distortion | 3/10 | Stub implementations |
| PvP Duels | 4/10 | TODO in core logic |
| Destiny Deck | 4/10 | Game-breaking math |
| Cosmic Horror | 4/10 | In-memory storage |
| Gang Wars | 4/10 | Broken energy system |
| Horse Racing | 4/10 | No persistence |
| Legendary Quests | 4/10 | 10 TODO stubs |

## Common Refactoring Pattern

Every service should:
1. Extend `BaseService` class
2. Use `withTransaction()` for multi-step operations
3. Use `withLock()` for concurrent access
4. Use `SecureRNG` for randomness
5. Use shared constants
6. Use validation schemas
7. Use `AuditLogger` for sensitive operations

---

**Document Version:** 1.0
**Last Updated:** December 14, 2025
