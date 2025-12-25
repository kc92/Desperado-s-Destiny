# COMBAT SYSTEMS AUDIT REPORT

**Project:** Desperados Destiny
**Audit Date:** 2025-12-15
**Auditor:** Claude (Sonnet 4.5)
**Scope:** All combat-related systems including core combat, dueling, boss encounters, world bosses, and companion combat

---

## EXECUTIVE SUMMARY

This audit analyzed 5 major combat systems comprising 18 files and approximately 8,500 lines of code. The combat systems show a **mix of production-ready code and incomplete/problematic implementations**.

**Overall Grade: C+ (74/100)**

### Critical Findings:
- ✅ **Strong foundations** in Core Combat and Duel systems with good security fixes
- ⚠️ **Major gaps** in Boss Encounter and Legendary Combat systems
- ❌ **Missing implementations** throughout (TODOs, stubbed functions)
- ⚠️ **Race conditions** in World Boss system
- ⚠️ **Memory leaks** identified and partially fixed in Duel handlers

---

## SYSTEM 1: CORE COMBAT

**Files Analyzed:**
- `server/src/services/combat.service.ts` (877 lines)
- `server/src/services/combatTransaction.service.ts` (475 lines)

### ✅ WHAT'S RIGHT

#### 1. Security Fixes Properly Applied (Lines 124-125, 150-152, 446-479)
```typescript
// Line 124-125: Secure RNG for damage variance
const variance = SecureRNG.range(0, 5);

// Line 150-152: Secure RNG for NPC redraw
if (SecureRNG.chance(redrawChance)) {

// Lines 446-479: Secure loot rolling
const gold = SecureRNG.range(lootTable.goldMin, lootTable.goldMax);
for (const item of lootTable.items) {
  if (SecureRNG.chance(item.chance)) {
```
**Good:** All RNG operations use `SecureRNG` instead of `Math.random()`, preventing client-side manipulation.

#### 2. Distributed Locking (Lines 173-224, 237-398)
```typescript
// Line 173-224: Lock prevents duplicate combat starts
return withLock(`lock:combat:${characterId}`, async () => {
  const existingCombat = await CombatEncounter.findActiveByCharacter(characterId);
  if (existingCombat) {
    throw new Error('Character is already in combat');
  }
```
**Good:** Prevents race conditions where players could start multiple combats simultaneously.

#### 3. Transaction-Safe Reward System (combatTransaction.service.ts)
```typescript
// Lines 113-140: Save encounter BEFORE awarding rewards
await encounter.save({ session });
logger.debug(`Encounter ${encounterId} saved with status: ${encounter.status}`);

// Then handle post-combat operations
if (turnResult.combatEnded) {
  if (turnResult.victory) {
    await this.handleVictory(character, npc, encounter, encounter.lootAwarded!, session);
  }
```
**Excellent:** The "rewards before save" bug has been properly fixed. Critical fix documented in comments.

#### 4. Quest Integration (Lines 310-311, 537-542)
```typescript
// Line 310-311: Quest progress on kill
await QuestService.onEnemyDefeated(character._id.toString(), npcType);

// Lines 537-542: Quest progress on item loot
try {
  await QuestService.onItemCollected(character._id.toString(), itemName, 1);
} catch (questError) {
  logger.error('Failed to update quest progress for combat loot:', questError);
}
```
**Good:** Proper error handling ensures combat doesn't fail if quest service is down.

### ⚠️ WHAT'S WRONG

#### 1. No Energy Refund on Combat Failure (Lines 190-196)
```typescript
// Line 190-196: Energy deducted but not refunded on errors
const hasEnergy = await EnergyService.spendEnergy(
  characterId,
  this.COMBAT_ENERGY_COST
);
if (!hasEnergy) {
  throw new Error('Insufficient energy to start combat');
}
// If encounter.save() fails after this, energy is lost!
```
**Problem:** If combat creation fails after energy is spent, player loses energy with no encounter.
**Fix:** Move energy deduction inside transaction or refund on error.

#### 2. Inconsistent Skill Detection (Lines 63-69, 87-95)
```typescript
// Line 63-69: String matching is fragile
if (skill.skillId.toLowerCase().includes('combat') ||
    skill.skillId.toLowerCase().includes('fight') ||
    skill.skillId.toLowerCase().includes('defense')) {
```
**Problem:**
- Hardcoded string matching will break if skill IDs change
- No centralized skill categorization
- Different criteria in different functions (combat vs fight vs attack vs shoot)

**Fix:** Create a skill categorization system or use skill metadata.

#### 3. Magic Numbers Everywhere (Lines 110-121, 269-290)
```typescript
// Lines 110-121: Hardcoded damage values
const baseDamage: Record<HandRank, number> = {
  [HandRank.ROYAL_FLUSH]: 50,
  [HandRank.STRAIGHT_FLUSH]: 40,
  // etc...
};
```
**Problem:** Should be in game constants for balance tuning. Duplicated in multiple services.

#### 4. Potential Race Condition in Boss Cooldown Check (Lines 688-712)
```typescript
// Lines 688-712: N+1 query pattern fixed, but still has race condition
const recentDefeats = await CombatEncounter.find({
  characterId: new mongoose.Types.ObjectId(characterId),
  npcId: { $in: bossIds },
  status: CombatStatus.PLAYER_VICTORY,
  endedAt: { $gte: cooldownThreshold }
});
```
**Problem:** Between checking cooldown and starting encounter, another request could sneak in.
**Fix:** Use distributed lock or atomic "findOneAndUpdate" with cooldown check.

### 🐛 BUG FIXES NEEDED

#### BUG 1: Session Not Properly Cleaned Up (Lines 607-652)
```typescript
// Line 607: Session created but not always cleaned up
const session = await mongoose.startSession();
session.startTransaction();

try {
  // ... combat logic
  await session.commitTransaction();
  session.endSession();
} catch (error) {
  await session.abortTransaction();
  session.endSession();
  throw error;
}
```
**Line 616-631:** If error occurs in validation (lines 616-631), session is aborted but `endSession()` may not be called in all error paths.
**Fix:** Use try-finally to guarantee session cleanup.

#### BUG 2: Character HP Calculation Missing Premium Integration (combatTransaction.service.ts, Line 629)
```typescript
// Line 629 in combatTransaction.service.ts: Missing premium bonus
private static getCharacterMaxHP(character: ICharacter): number {
  const baseHP = 100;
  const levelBonus = character.level * 5;
  const combatSkillBonus = character.skills
    .filter(s => s.skillId.toLowerCase().includes('combat'))
    .reduce((sum, s) => sum + s.level * 2, 0);

  return baseHP + levelBonus + combatSkillBonus;
  // MISSING: Premium HP bonus applied in combat.service.ts but not here!
}
```
**Fix:** Import and apply `PremiumUtils.calculateHPWithBonus()` like in combat.service.ts (lines 73-75).

### ❌ LOGICAL GAPS

#### GAP 1: No Validation of NPC Existence After Populate
```typescript
// Line 241: Populated npcId but type safety lost
const encounter = await CombatEncounter.findById(encounterId)
  .populate('npcId');

// Line 299: Unsafe type assertion
const npc = encounter.npcId as unknown as INPC;
```
**Problem:** If NPC was deleted, `encounter.npcId` could be null, causing crash at line 299.
**Fix:** Add null check after populate.

#### GAP 2: Missing Validation for Party Combat
```typescript
// Line 122: Party member IDs accepted but never validated
const partyMemberIds?: string[]
```
**Problem:** No verification that:
- Party members exist
- Party members are online
- Party members aren't already in combat
- Party size limits are enforced

**Fix:** Add party validation in `initiateBossEncounter`.

#### GAP 3: No Escape Mechanism Documentation
```typescript
// Line 602-653: fleeCombat exists but usage unclear
static async fleeCombat(encounterId: string, characterId: string)
```
**Problem:**
- When can players flee? (Only first 3 rounds, line 629)
- What's the cost? (None apparent)
- Does fleeing affect reputation? (Not implemented)

**Fix:** Document flee mechanics and add penalties.

### 🚧 INCOMPLETE IMPLEMENTATIONS

#### TODO 1: Death Service Integration Missing Fields (Lines 579-597)
```typescript
// Line 585: Using DeathService but some features unintegrated
const deathPenalty = await DeathService.handleDeath(
  character._id.toString(),
  DeathType.COMBAT,
  session
);
```
**Missing:**
- No check for respawn location
- No corpse item drops handling
- Death statistics not updated in combat stats

---

## SYSTEM 2: DUELING (PvP)

**Files Analyzed:**
- `server/src/controllers/duel.controller.ts` (374 lines)
- `server/src/services/duel.service.ts` (851 lines)
- `server/src/services/duelSession.service.ts` (271 lines)
- `server/src/services/duelStateManager.service.ts` (321 lines)
- `server/src/services/duelTimerManager.service.ts` (284 lines)
- `server/src/routes/duel.routes.ts` (92 lines)
- `server/src/sockets/duelHandlers.ts` (1711 lines)

### ✅ WHAT'S RIGHT

#### 1. Comprehensive Security Fixes (C5 Security Fix, Lines 40-154 in duel.service.ts)
```typescript
// Lines 47-50: Distributed lock prevents race conditions
const lockKey = duelChallengeLockKey(challengerId);

return withLock(lockKey, async () => {
  // Lines 99-111: Atomic gold locking
  const lockResult = await Character.findOneAndUpdate(
    {
      _id: challengerId,
      gold: { $gte: wagerAmount }  // Atomic check
    },
    {
      $inc: {
        gold: -wagerAmount,
        lockedGold: wagerAmount
      }
    },
    { new: true }
  );
```
**Excellent:** The C5 security fix properly prevents double-spend exploits with distributed locks and atomic operations.

#### 2. Error Recovery with Gold Refund (Lines 132-149)
```typescript
// Lines 132-149: If duel creation fails, unlock gold
try {
  await duel.save();
} catch (error) {
  if (type === DuelType.WAGER) {
    await Character.findOneAndUpdate(
      { _id: challengerId },
      {
        $inc: {
          gold: wagerAmount,
          lockedGold: -wagerAmount
        }
      }
    );
    logger.warn(`Duel creation failed, unlocked ${wagerAmount} gold`);
  }
  throw error;
}
```
**Excellent:** Proper compensating transaction on failure.

#### 3. Memory Leak Prevention (duelHandlers.ts, Lines 93-206)
```typescript
// Lines 93-104: Track animation timers for cleanup
function registerAnimationTimer(duelId: string, timer: NodeJS.Timeout): void {
  const timers = animationTimers.get(duelId) || [];
  timers.push(timer);
  animationTimers.set(duelId, timers);
}

// Lines 108-118: Clear all timers
function clearAnimationTimers(duelId: string): void {
  const timers = animationTimers.get(duelId);
  if (timers) {
    for (const timer of timers) {
      clearTimeout(timer);
    }
    animationTimers.delete(duelId);
  }
}
```
**Excellent:** H8 fix prevents memory leaks from uncancelled timers.

#### 4. Graceful Shutdown Handling (Lines 165-206)
```typescript
// Lines 165-206: Cleanup all resources on shutdown
function handleGracefulShutdown(): void {
  // Stop cleanup interval
  if (cleanupIntervalRef) {
    clearInterval(cleanupIntervalRef);
  }
  // Clear all disconnect timers
  for (const timer of disconnectTimers.values()) {
    clearTimeout(timer);
  }
  disconnectTimers.clear();
  // Clear animation timers
  for (const timers of animationTimers.values()) {
    for (const timer of timers) {
      clearTimeout(timer);
    }
  }
  animationTimers.clear();
}
```
**Excellent:** Comprehensive shutdown prevents resource leaks on server restart.

#### 5. Disconnect Handling with Timeout (Lines 1584-1694)
```typescript
// Lines 1584-1694: H5 Security fix - disconnect timeout with auto-forfeit
const DISCONNECT_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

// Set timeout for forfeit if player doesn't reconnect
const timeoutTimer = setTimeout(async () => {
  // Check if player reconnected
  if (hasReconnected) {
    return;
  }
  // Auto-forfeit
  // ... forfeit logic
}, DISCONNECT_TIMEOUT_MS);
```
**Good:** Prevents duels from hanging if player disconnects. 10-minute grace period is reasonable.

#### 6. Atomic Ready State (Lines 624-627, duelHandlers.ts)
```typescript
// Lines 624-627: H8 race condition fix
const { bothReady, state } = await DuelStateManager.setCharacterReady(duelId, characterId);

// Only one handler sees bothReady=true due to atomic update
if (bothReady) {
  await startDuelGame(duelId, state);
}
```
**Excellent:** Prevents race condition where both players press "ready" simultaneously.

### ⚠️ WHAT'S WRONG

#### 1. Perception Service Not Validated (duelHandlers.ts, Lines 1217-1224)
```typescript
// Lines 1217-1224: perceptionService.useAbility called but no error handling
const result = perceptionService.useAbility(
  ability as DuelAbility,
  playerPerceptionLevel,
  opponentDeceptionLevel,
  opponentHand,
  playerAbilityState.energy
);

if (!result.success) {
  socket.emit('duel:ability_result', { success: false });
  return;
}
```
**Problem:** What if `perceptionService.useAbility` throws? No try-catch wrapper.
**Fix:** Wrap in try-catch like other handlers.

#### 2. Duplicate State Storage (duel.service.ts + duelSession.service.ts)
```typescript
// duel.service.ts lines 336-370: State stored in DuelSession model
await DuelSession.findOneAndUpdate({ duelId }, {
  challengerState: {
    ...challengerState,
    resolved: false
  },
  // ... more state
});

// duelStateManager.service.ts lines 76-79: ALSO stored in Redis
async setState(duelId: string, state: ActiveDuelState): Promise<void> {
  await stateManager.setState(duelId, state);
}
```
**Problem:** Dual storage in both MongoDB and Redis creates inconsistency risk.
**Confusion:** Which is source of truth? Code uses both interchangeably.
**Fix:** Choose one: Either use Redis for active state + MongoDB for history, OR use only MongoDB.

#### 3. Gold Transaction Missing Balance Validation (Lines 506-519, duel.service.ts)
```typescript
// Lines 506-519: Creating transaction but not verifying balance
await GoldTransaction.create([{
  characterId: loserId,
  amount: -duel.wagerAmount,
  type: TransactionType.SPENT,
  balanceBefore: (loserChar?.gold || 0) + duel.wagerAmount,
  balanceAfter: loserChar?.gold || 0,
  // ...
}], { session });
```
**Problem:** `balanceBefore` calculation assumes loser had the gold, but what if `loserChar` is null?
**Fix:** Add null check for `loserChar` and `winnerChar` before creating transactions.

#### 4. Incomplete Ability System (Lines 1115-1116, duelHandlers.ts)
```typescript
// Lines 1115-1116: TODO comment
case BettingAction.ALL_IN:
  // TODO: Handle all-in logic
  break;
```
**Problem:** All-in betting not implemented despite being in action types.
**Impact:** Players can select "All In" but nothing happens.

### 🐛 BUG FIXES NEEDED

#### BUG 1: Partial Gold Recovery on Transaction Failure (Lines 549-576, duel.service.ts)
```typescript
// Lines 549-576: Atomic bulkWrite but error handling incomplete
const bulkResult = await Character.bulkWrite([
  {
    updateOne: {
      filter: { _id: duel.challengerId },
      update: { $inc: { gold: duel.wagerAmount, lockedGold: -duel.wagerAmount } }
    }
  },
  {
    updateOne: {
      filter: { _id: duel.challengedId },
      update: { $inc: { gold: duel.wagerAmount, lockedGold: -duel.wagerAmount } }
    }
  }
], { ordered: false });

if (bulkResult.modifiedCount === 2) {
  logger.info(`Recovered gold for both players`);
} else {
  logger.error(`CRITICAL: Partial gold recovery`);
  // NO RETRY OR ALERT MECHANISM!
}
```
**Problem:** If only one update succeeds, there's no retry or admin alert system.
**Impact:** Players can permanently lose gold if server crashes at wrong moment.
**Fix:** Implement retry with exponential backoff or manual review queue.

#### BUG 2: Memory Leak from DuelSession (Lines 429-614, duel.service.ts)
```typescript
// Lines 429-614: DuelSession deleted only on normal completion
} finally {
  // MEMORY LEAK FIX: Always clean up game state
  await DuelSession.deleteOne({ duelId });
}
```
**Problem:** If resolveDuel crashes before the finally block, DuelSession persists forever.
**Fix:** Add TTL index on DuelSession model or background cleanup job.

#### BUG 3: Disconnect Timer Not Cleared on Forfeit (duelHandlers.ts, Line 1404)
```typescript
// Lines 1366-1440: handleForfeit doesn't clear disconnect timer
async function handleForfeit(socket, payload) {
  // ... forfeit logic
  await DuelStateManager.cleanupDuel(duelId, state);
  // MISSING: await clearDisconnectTimer(duelId, characterId);
}
```
**Impact:** Disconnect timer fires after forfeit, triggering double cleanup.
**Fix:** Add `clearDisconnectTimer()` call in handleForfeit.

### ❌ LOGICAL GAPS

#### GAP 1: No Validation of Challenged Player Gold (Lines 94-96, duel.service.ts)
```typescript
// Lines 94-96: Checks if challenged has gold but not atomically locked
if (challenged.gold < wagerAmount) {
  throw new Error(`${challenged.name} doesn't have enough gold`);
}
```
**Problem:** Between this check and them accepting (line 189-199), they could spend their gold.
**Fix:** Lock both players' gold during PENDING state, not just challenger.

#### GAP 2: No Cheating Detection (Lines 1251-1266, duelHandlers.ts)
```typescript
// Lines 1251-1266: Cheating detection commented out
if (result.detected) {
  emitToRoom(roomName, 'duel:cheat_detected', {
    // ...
  });
  // TODO: Handle duel loss due to cheating
}
```
**Problem:** Detection logic exists but punishment not implemented.
**Impact:** Cheaters detected but not penalized.

#### GAP 3: Timer Manager Polling Never Stops (duelTimerManager.service.ts, Lines 176-189)
```typescript
// Lines 176-189: startPolling creates interval but no cleanup
startPolling(onTimeout: TimeoutCallback): void {
  if (pollingInterval) {
    logger.warn('Timer polling already started');
    return;
  }
  pollingInterval = setInterval(() => {
    void this.processExpiredTimers();
  }, POLL_INTERVAL_MS);
}
```
**Problem:** Interval runs forever, even with no active duels.
**Fix:** Stop polling when no active duels, restart when first duel created.

### 🚧 INCOMPLETE IMPLEMENTATIONS

#### TODO 1: Perception Passive Hints (Lines 1336-1340, duelHandlers.ts)
```typescript
// Lines 1336-1340: Poker face blocks passive perception
if (opponentAbilityState.pokerFaceActive) {
  return; // Blocked
}
```
**Incomplete:** No indication to player that they're being blocked. UI won't know why hints stopped.
**Fix:** Emit event indicating hints blocked by poker face.

#### TODO 2: Hand Evaluation Previously Stubbed (Lines 908-922, duelHandlers.ts)
```typescript
// Lines 908-922: CRITICAL FIX applied
try {
  if (challengerState.hand && challengerState.hand.length === 5) {
    challengerEval = evaluateHand(challengerState.hand);
  }
} catch (error) {
  logger.error(`Error evaluating hands`, { error });
}
```
**Note:** This was previously a TODO stub, now properly implemented. Good!

---

## SYSTEM 3: BOSS ENCOUNTERS

**Files Analyzed:**
- `server/src/controllers/bossEncounter.controller.ts` (731 lines)
- `server/src/services/bossEncounter.service.ts` (639 lines)
- `server/src/services/bossPhase.service.ts` (379 lines)
- `server/src/services/legendaryCombat.service.ts` (660 lines)
- `server/src/routes/bossEncounter.routes.ts` (91 lines)

### ✅ WHAT'S RIGHT

#### 1. Comprehensive Discovery System (Lines 38-86, bossEncounter.controller.ts)
```typescript
// Lines 38-86: Discovery tracking well-designed
const discoveries = await BossDiscovery.find({ characterId });
const discoveryMap = new Map<string, any>();
discoveries.forEach(d => {
  discoveryMap.set(d.bossId, d);
});

const bossesWithProgress = bosses.map(boss => {
  const discovery = discoveryMap.get(boss.id);
  return {
    boss: { /* ... */ },
    progress: discovery ? {
      discovered: discovery.discovered,
      encounterCount: discovery.encounterCount,
      victoryCount: discovery.victoryCount,
      bestAttempt: discovery.bestAttempt,
      // ...
    } : null
  };
});
```
**Good:** Efficient batch loading with Map for O(1) lookups. Progress tracking comprehensive.

#### 2. Distributed Lock on Boss Attacks (Lines 266-387, bossEncounter.service.ts)
```typescript
// Lines 266-387: Lock prevents concurrent attacks on same encounter
return withLock(`lock:encounter:${sessionId}`, async () => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ... combat processing
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
}, { ttl: 30, retries: 3 });
```
**Good:** Combines distributed lock with database transaction for full safety.

#### 3. Phase Transition System (bossPhase.service.ts, Lines 28-45)
```typescript
// Lines 28-45: Clean phase detection
static checkPhaseTransition(encounter, boss): boolean {
  const healthPercent = (encounter.bossHealth / encounter.bossMaxHealth) * 100;
  const currentPhase = getCurrentPhase(
    encounter.bossHealth,
    encounter.bossMaxHealth,
    boss.phases
  );

  if (currentPhase.phaseNumber > encounter.currentPhase) {
    encounter.currentPhase = currentPhase.phaseNumber;
    logger.info(`Boss entered phase ${currentPhase.phaseNumber}`);
    return true;
  }
  return false;
}
```
**Good:** Clear logic, proper logging, boolean return for easy testing.

### ⚠️ WHAT'S WRONG

#### 1. Missing Boss Data Validation (Lines 113-120, bossEncounter.controller.ts)
```typescript
// Lines 113-120: No null check on boss
const boss = getBossById(bossId);
if (!boss) {
  res.status(404).json({ success: false, error: 'Boss not found' });
  return;
}
// But later at line 128, assumes boss always exists
res.status(200).json({
  boss: {
    id: boss.id,  // Could crash if getBossById changed behavior
```
**Problem:** Inconsistent null handling. Early return but later code doesn't have null guards.

#### 2. Party Validation Missing (Lines 162-173, bossEncounter.service.ts)
```typescript
// Lines 162-173: Accepts party IDs but doesn't validate
const allCharacterIds = [characterId, ...(partyMemberIds || [])];
const playerCount = allCharacterIds.length;

// Validate party size
if (playerCount < boss.playerLimit.min || playerCount > boss.playerLimit.max) {
  throw new Error(`Boss requires ${boss.playerLimit.min}-${boss.playerLimit.max} players`);
}
```
**Missing:**
- No check if party members exist
- No check if party members are in different locations
- No check if party members are already in combat
- No check for duplicate IDs in partyMemberIds array

#### 3. Participant Verification Incomplete (Lines 324-327, bossEncounter.controller.ts)
```typescript
// Lines 324-327: Simple ID check
const isParticipant = encounter.characterIds.some(
  id => id.toString() === characterId
);
```
**Problem:** Doesn't check if participant is still alive, or if they abandoned earlier.

#### 4. Cooldown Calculation Race Condition (bossEncounter.service.ts, Lines 84-106)
```typescript
// Lines 84-106: Cooldown check not atomic
if (discovery.lastVictoryAt) {
  const cooldownEnd = new Date(
    discovery.lastVictoryAt.getTime() + boss.respawnCooldown * 60 * 60 * 1000
  );
  const now = new Date();

  if (now < cooldownEnd) {
    return { available: false, reason: 'Boss on cooldown' };
  }
}
```
**Problem:** Between checking cooldown and starting encounter (line 118), another request could start the boss.
**Fix:** Atomic check-and-update using `findOneAndUpdate`.

### 🐛 BUG FIXES NEEDED

#### BUG 1: Energy Deduction Not Refunded on Failure (Lines 152-160, bossEncounter.service.ts)
```typescript
// Lines 152-160: Energy spent outside transaction
const hasEnergy = await EnergyService.spendEnergy(characterId, energyCost);
if (!hasEnergy) {
  throw new Error('Insufficient energy');
}

// Lines 219: If save fails, energy is lost
await encounterDoc.save({ session });
```
**Problem:** Same issue as core combat - energy deducted before transaction commits.
**Fix:** Spend energy inside transaction or refund on error.

#### BUG 2: Best Attempt Comparison Wrong (Lines 424-428, bossEncounter.service.ts)
```typescript
// Lines 424-428: Comparing damage but description says health
if (
  !discovery.bestAttempt ||
  (state as any).damageDealt > discovery.bestAttempt.damageDealt
) {
  discovery.bestAttempt = {
    damageDealt: (state as any).damageDealt,
    healthRemaining: encounter.bossHealth,  // This is backwards!
    duration: duration,
```
**Problem:** If this is "best" attempt, shouldn't boss have LESS health remaining, not more damage dealt?
**Logic Error:** More damage ≠ better attempt if boss has more HP. Should track "closest to killing".
**Fix:** Compare `encounter.bossHealth` (lower is better) instead of `damageDealt`.

#### BUG 3: Legendary Combat Character Stats Access (legendaryCombat.service.ts, Lines 170-173)
```typescript
// Lines 170-173: Accessing character.stats.combat without null check
const baseDamage = character.stats.combat * 10;
```
**Problem:** `character.stats` might not exist or `combat` might be undefined.
**Fix:** Add null checks or use safe navigation.

#### BUG 4: Phase Change Detection Unreliable (legendaryCombat.service.ts, Lines 414-426)
```typescript
// Lines 414-426: Using > comparison for phase detection
for (const phase of legendary.phases) {
  if (phase.phase > currentPhase && healthPercent <= phase.healthThreshold) {
    session.currentPhase = phase.phase;
    return phase.phase;
  }
}
```
**Problem:** If phases aren't sorted by `phase.phase`, this will skip phases.
**Fix:** Sort phases before iteration or use different detection logic.

### ❌ LOGICAL GAPS

#### GAP 1: No Party Formation Validation
**Missing:** Entire party system referenced but not implemented:
- No party model referenced
- No party leader validation
- No party member consent
- No party level/gear requirements

#### GAP 2: Rewards Distribution Logic Unclear (Lines 392-578, bossEncounter.service.ts)
```typescript
// Lines 440-444: Each participant gets rewards divided by party size
const goldReward = Math.floor(
  SecureRNG.range(boss.goldReward.min, boss.goldReward.max) /
    encounter.characterIds.length
);
```
**Problem:**
- What if participant died early? Do they still get full share?
- What about damage contribution bonuses? (Lines 514-529 have partial logic)
- What if participant disconnected?

**Needs:** Clear reward distribution policy document.

#### GAP 3: Enrage Timer Not Enforced (Lines 299-312, bossEncounter.service.ts)
```typescript
// Lines 299-312: Checks enrage but only on player action
if (encounter.enrageAt && new Date() > encounter.enrageAt) {
  encounter.status = 'timeout';
  // ...
}
```
**Problem:** If no one takes action, enrage never triggers. Boss fight could hang forever.
**Fix:** Background job to check enrage timers periodically.

#### GAP 4: Ability Cooldown Not Validated (bossPhase.service.ts, Lines 50-96)
```typescript
// Lines 50-96: Ability selection checks cooldowns
const availableAbilities = boss.abilities.filter(ability => {
  const cooldown = cooldowns.get(ability.id) || 0;
  if (cooldown > 0) {
    return false;
  }
```
**Problem:** Cooldown decremented (line 112) but never validated that it's not negative.
**Fix:** Use `Math.max(0, remaining - 1)` to prevent negative cooldowns.

### 🚧 INCOMPLETE IMPLEMENTATIONS

#### TODO 1: Flee Mechanic (bossPhase.service.ts, Lines 224-241)
```typescript
// Lines 224-241: Flee action stubbed
if (action.action === 'flee') {
  // TODO: Handle flee
  return {
    characterId,
    action: 'flee',
    damage: 0,
  };
}
```
**Missing:** Flee success rate, penalty, effect on other party members.

#### TODO 2: Item Usage (bossPhase.service.ts, Lines 253-260)
```typescript
// Lines 253-260: Item action stubbed
if (action.action === 'item') {
  // TODO: Handle item use
  return {
    characterId,
    action: 'item',
    damage: 0,
  };
}
```
**Missing:** Entire item system integration.

#### TODO 3: Character Lookup in Defeat (Lines 597-602, bossEncounter.service.ts)
```typescript
// Lines 597-602: Character name hardcoded
const participants = Array.from(encounter.playerStates.entries()).map(([charId, state]) => ({
  characterId: charId,
  characterName: 'Unknown', // TODO: Lookup
  damageDealt: (state as any).damageDealt,
```
**Impact:** Defeat leaderboard shows "Unknown" for all players.

#### TODO 4: Environmental Hazards (bossPhase.service.ts, Lines 343-348)
```typescript
// Lines 343-348: Hazard damage hardcoded
if (currentPhase.environmentalHazard && session.turnCount % 2 === 0) {
  const hazardDamage = 50; // Would parse from hazard description
  damage += hazardDamage;
```
**Incomplete:** Should parse hazard type and apply appropriate damage/effects.

---

## SYSTEM 4: WORLD BOSSES

**Files Analyzed:**
- `server/src/controllers/worldBoss.controller.ts` (423 lines)
- `server/src/services/worldBoss.service.ts` (439 lines)
- `server/src/services/worldBossSession.service.ts` (264 lines)

### ✅ WHAT'S RIGHT

#### 1. Session Persistence (worldBossSession.service.ts, Lines 16-56)
```typescript
// Lines 16-56: Well-structured session creation
static async createSession(
  bossId: WorldBossType,
  maxHealth: number,
  session?: ClientSession
): Promise<IWorldBossSession> {
  const now = new Date();
  const endsAt = new Date(now.getTime() + this.SESSION_DURATION_HOURS * 60 * 60 * 1000);
  const expiresAt = new Date(endsAt.getTime() + 60 * 60 * 1000); // +1 hour buffer

  const bossSession = new WorldBossSession({
    bossId,
    currentHealth: maxHealth,
    maxHealth,
    currentPhase: 1,
    participants: [],
    startedAt: now,
    endsAt,
    expiresAt,
    status: 'active',
  });
```
**Good:** Proper TTL management with expiry buffer for cleanup. Optional session parameter for transactions.

#### 2. Leaderboard System (worldBossSession.service.ts, Lines 210-217)
```typescript
// Lines 210-217: Clean leaderboard implementation
static getTopDamageDealers(bossSession, limit = 10): ParticipantData[] {
  return [...bossSession.participants]
    .sort((a, b) => b.damageDealt - a.damageDealt)
    .slice(0, limit);
}
```
**Good:** Creates copy before sorting (immutable), configurable limit.

#### 3. Cleanup Job (worldBossSession.service.ts, Lines 236-249)
```typescript
// Lines 236-249: Cleanup for completed sessions
static async cleanupOldSessions(): Promise<number> {
  const result = await WorldBossSession.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { status: { $in: ['completed', 'failed'] },
        startedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    ],
  });
```
**Good:** Removes both expired sessions AND old completed sessions (24h retention).

### ⚠️ WHAT'S WRONG

#### 1. Race Condition Despite Lock (worldBoss.service.ts, Lines 184-254)
```typescript
// Lines 184-254: Lock applied but session read outside lock
return withLock(`lock:worldboss:${bossId}`, async () => {
  const session = await worldBossStateManager.get<WorldBossSession>(bossId);

  if (!session || session.status !== 'active') {
    return { success: false, message: 'Boss is not active' };
  }

  const participant = session.participants[characterId];
  if (!participant) {
    return { success: false, message: 'Not participating' };
  }
```
**Problem:** Between getting session and updating it, another request could modify participant data.
**Partial Fix:** Lock is applied, but session object is mutable. If using Redis, updates might not persist.

#### 2. Dual State Storage (worldBoss.service.ts + worldBossSession.service.ts)
```typescript
// worldBoss.service.ts line 89: Stores in Redis
await worldBossStateManager.set(bossId, session, { ttl: 7200 });

// worldBossSession.service.ts line 48: Stores in MongoDB
await bossSession.save();
```
**Problem:** Same issue as duels - state in two places creates inconsistency risk.
**Confusion:** Redis used for active state, MongoDB for persistence. But both services exist.
**Fix:** Clarify architecture: Use Redis for real-time state, MongoDB for audit trail only.

#### 3. Reward Distribution Outside Transaction (Lines 260-338, worldBoss.service.ts)
```typescript
// Lines 260-338: completeBossFight calls distributeRewards without transaction
private static async completeBossFight(bossId, victory) {
  // ...
  if (victory) {
    await this.distributeRewards(session);  // No session parameter!
  }
}

// Lines 283-338: distributeRewards makes multiple DB calls
private static async distributeRewards(session) {
  for (const participant of sortedParticipants) {
    const progress = await ScarProgressModel.findOrCreate(participant.characterId);
    await progress.addReputation(SCAR_CONSTANTS.WORLD_BOSS_REPUTATION_BONUS);
    await progress.recordWorldBossDefeat(session.bossId, participant.damageDealt);
    // ... more async calls
  }
}
```
**Problem:** Each participant update is separate transaction. If server crashes mid-distribution, some get rewards, others don't.
**Fix:** Wrap entire reward distribution in single transaction.

#### 4. Timer Check Inefficient (Lines 434-438, worldBoss.service.ts)
```typescript
// Lines 434-438: Polling all bosses every minute
setInterval(() => {
  for (const bossId of Object.values(WorldBossType)) {
    WorldBossService.checkEnrageTimer(bossId);
  }
}, 60 * 1000);
```
**Problem:**
- Checks ALL boss types even if none are active
- No error handling if check fails
- Interval created at module load, not when server starts (timing issues)

**Fix:** Only check active bosses, add error handling, start in server initialization.

### 🐛 BUG FIXES NEEDED

#### BUG 1: First Kill Detection Wrong (Lines 316-335, worldBoss.service.ts)
```typescript
// Lines 316-335: Accessing Map as both Map and object
const topParticipant = sortedParticipants[0];
if (topParticipant) {
  const progress = await ScarProgressModel.findOrCreate(topParticipant.characterId);
  const bossesMap = progress.worldBossesDefeated as any;
  const bossRecord = bossesMap instanceof Map
    ? bossesMap.get(session.bossId)
    : bossesMap[session.bossId];  // Treating as object

  if (bossRecord && bossRecord.count === 1) {
    // First kill logic
```
**Problem:** Mongoose stores Maps as objects, but code checks both. Type confusion.
**Fix:** Standardize on one access pattern, preferably Mongoose's object representation.

#### BUG 2: Participant Not Updated After Damage (worldBossSession.service.ts, Lines 142-169)
```typescript
// Lines 142-169: Records damage but doesn't save participant array
static async recordDamage(bossSession, characterId, damage, mongoSession?) {
  const participant = bossSession.participants.find((p) => p.characterId === characterId);

  participant.damageDealt += damage;  // Modifies in memory
  participant.lastActionAt = new Date();

  bossSession.currentHealth = Math.max(0, bossSession.currentHealth - damage);

  await this.saveSession(bossSession, mongoSession);  // Does this save participants array?
}
```
**Uncertain:** If `participants` is an embedded array, changes might not persist unless marked as modified.
**Fix:** Add `bossSession.markModified('participants')` before save.

#### BUG 3: No Validation in Admin Endpoints (worldBoss.controller.ts, Lines 211-237, 243-263)
```typescript
// Lines 211-237, 243-263: Admin endpoints with TODO for auth
export const spawnWorldBoss = asyncHandler(async (req, res) => {
  // TODO: Add admin authorization check
  const session = await WorldBossService.spawnWorldBoss(bossId);
  // ...
});

export const endWorldBossSession = asyncHandler(async (req, res) => {
  // TODO: Add admin authorization check
  await WorldBossService.endBossSession(bossId, victory);
```
**CRITICAL:** Anyone can spawn or end world bosses! No authentication at all.
**Impact:** Griefing exploit - non-admins can repeatedly spawn/end bosses.
**Fix:** Add `requireAdmin` middleware IMMEDIATELY.

### ❌ LOGICAL GAPS

#### GAP 1: No Minimum Damage Requirement Enforced (Lines 146-156, worldBoss.controller.ts)
```typescript
// Lines 146-156: Accepts any damage value
if (typeof damage !== 'number' || damage < 0) {
  throw new AppError('Valid damage value is required');
}

const result = await WorldBossService.attackWorldBoss(characterId, bossId, damage);
```
**Problem:**
- No maximum damage check (could send `Number.MAX_SAFE_INTEGER`)
- No validation against character's actual combat power
- Could deal 0 damage repeatedly to stay on leaderboard

**Fix:** Validate damage range based on character stats.

#### GAP 2: Concurrent Join Race Condition (Lines 110-166, worldBoss.service.ts)
```typescript
// Lines 128-129: Checks max participants but not atomically
const participantCount = Object.keys(session.participants).length;
if (participantCount >= session.boss.maxParticipants) {
  return { success: false, message: 'Boss encounter is full' };
}

// Lines 139-149: Adds participant
if (!session.participants[characterId]) {
  session.participants[characterId] = { /* ... */ };
  await worldBossStateManager.set(request.bossId, session, { ttl: 7200 });
}
```
**Problem:** Between checking count and adding participant, another request could join. Could exceed maxParticipants.
**Fix:** Use atomic increment or distributed lock around join operation.

#### GAP 3: No Participant Timeout (worldBossSession.service.ts)
```typescript
// Lines 118-133: Tracks lastActionAt but never uses it
participant.lastActionAt = new Date();
```
**Missing:** Logic to remove inactive participants after X minutes of no actions.
**Impact:** AFK players hold participant slots, preventing others from joining.

### 🚧 INCOMPLETE IMPLEMENTATIONS

#### TODO 1: Admin Authorization (Lines 220, 252 in worldBoss.controller.ts)
```typescript
// Line 220, 252: Critical security gaps
// TODO: Add admin authorization check
```
**Severity:** CRITICAL - anyone can control world bosses.

#### TODO 2: Loot Integration (worldBoss.service.ts, Line 309)
```typescript
// Line 309: Reward distribution incomplete
// Award loot (simplified - would integrate with inventory system)
logger.info(`Awarded rewards to ${participant.characterName}`);
```
**Missing:** Actual inventory item grants, not just logging.

---

## SYSTEM 5: COMPANION COMBAT

**File Analyzed:**
- `server/src/services/companionCombat.service.ts` (447 lines)

### ✅ WHAT'S RIGHT

#### 1. Role-Based Combat System (Lines 43-79)
```typescript
// Lines 43-79: Clean role differentiation
switch (companion.combatRole) {
  case CombatRole.ATTACKER:
    bonus = Math.floor(companion.attackPower * 0.5);
    if (handRank >= HandRank.FLUSH) {
      bonus = Math.floor(bonus * 1.3);  // Bonus for high hands
    }
    break;

  case CombatRole.DEFENDER:
    bonus = Math.floor(companion.attackPower * 0.3);
    break;
```
**Good:** Different roles have different damage formulas. Clear multipliers for balance tuning.

#### 2. Bond System Integration (Lines 75-77, 119-120)
```typescript
// Lines 75-77: Bond affects combat power
const bondModifier = 1 + (companion.bondLevel / 200);
bonus = Math.floor(bonus * bondModifier);

// Lines 119-120: Bond also affects defense
const bondModifier = 1 + (companion.bondLevel / 200);
reduction = Math.floor(reduction * bondModifier);
```
**Good:** Consistent formula across offense and defense. Max +50% at bond level 100.

#### 3. Ability Cooldown System (Lines 172-176)
```typescript
// Lines 172-176: Checks cooldown before use
if (!companion.canUseAbility(abilityId)) {
  throw new AppError('Cannot use this ability right now', 400);
}

// Line 183: Applies cooldown
companion.useAbility(abilityId);
```
**Good:** Delegates to model method, keeping service thin.

#### 4. Auto-Ability Logic (Lines 326-363)
```typescript
// Lines 326-363: Smart ability selection based on situation
static shouldAutoUseAbility(companion, playerHP, playerMaxHP, npcHP) {
  // Low player health - use defensive abilities
  if (playerHP < playerMaxHP * 0.3) {
    const defensiveAbilities = [
      CompanionAbilityId.LOYAL_DEFENSE,
      CompanionAbilityId.PHASE_SHIFT
    ];
    for (const abilityId of defensiveAbilities) {
      if (companion.abilities.includes(abilityId) && companion.canUseAbility(abilityId)) {
        return abilityId;
      }
    }
  }
```
**Good:** Context-aware AI for companion actions. Prioritizes survival over offense when player is low.

### ⚠️ WHAT'S WRONG

#### 1. No Null Checks on Character Stats (Lines 84-130)
```typescript
// Lines 84-130: Accessing companion properties without validation
if (!companion.isActive) {
  return { reducedDamage: incomingDamage, companionDamageTaken: 0 };
}

let reduction = 0;
let companionDamage = 0;

switch (companion.combatRole) {
  case CombatRole.DEFENDER:
    const absorbPercent = Math.min(0.5, companion.defensePower / 100);
    // What if defensePower is undefined/null?
```
**Problem:** No validation that `defensePower`, `attackPower`, etc. exist.
**Fix:** Add defaults or null checks.

#### 2. Ability Effect Calculation Magic Numbers (Lines 186-213)
```typescript
// Lines 186-213: Hardcoded multipliers
switch (ability.effectType) {
  case 'COMBAT_DAMAGE':
    effect.damageBonus = Math.floor(ability.power * (companion.attackPower / 50));
    break;

  case 'COMBAT_DEFENSE':
    effect.defenseBonus = Math.floor(ability.power * (companion.defensePower / 50));
    break;
```
**Problem:** Why `/50`? Magic number should be constant.
**Fix:** Define `ABILITY_SCALING_FACTOR` constant.

#### 3. Session Parameter Inconsistent (Lines 140, 219, 278, 295)
```typescript
// Some methods have optional session:
static async useCompanionAbility(
  characterId: string,
  companionId: string,
  abilityId: CompanionAbilityId,
  encounterId: string,
  session?: mongoose.ClientSession  // Optional
)

// Others save with or without session:
if (session) {
  await companion.save({ session });
} else {
  await companion.save();
}
```
**Inconsistency:** Some callers might pass session, others won't. If part of combat uses transaction and part doesn't, atomicity breaks.
**Fix:** Make session required for all combat-related operations OR remove it entirely and handle transactions at higher level.

#### 4. Item Find Chance Not Configurable (Line 255)
```typescript
// Line 255: Hardcoded 10% item find chance
if (SecureRNG.chance(0.1)) {
  companion.itemsFound += 1;
}
```
**Problem:** Should be based on companion species, bond level, or skills.
**Fix:** Make item find chance a companion attribute or derived from stats.

### 🐛 BUG FIXES NEEDED

#### BUG 1: Division by Zero Potential (Lines 122-124)
```typescript
// Lines 122-124: Could divide by zero
const actualDamageTaken = Math.min(companionDamage, companion.currentHealth);
const actualReduction = Math.floor(
  reduction * (actualDamageTaken / companionDamage || 1)  // || 1 guards against 0/0
);
```
**Analysis:** The `|| 1` saves it from NaN, but if `companionDamage` is 0, the multiplier becomes 1 (full reduction), which is incorrect.
**Better Fix:**
```typescript
const actualReduction = companionDamage > 0
  ? Math.floor(reduction * (actualDamageTaken / companionDamage))
  : 0;
```

#### BUG 2: Bond Gain Not Saved (Lines 216-217, 260-261)
```typescript
// Line 216: Gains bond but no explicit save
companion.gainBond(1);

// Line 218: Only saves if session exists
await companion.save({ session: useSession });

// BUT in applyCompanionDamage:
// Line 260: Gains bond
companion.gainBond(1);

// Lines 264-267: Conditional save
if (session) {
  await companion.save({ session });
} else {
  await companion.save();
}
```
**Problem:** If no session provided to `applyCompanionDamage`, bond gain is saved. But other functions don't save.
**Inconsistency:** Some bond gains persist, others don't.
**Fix:** Standardize save behavior.

### ❌ LOGICAL GAPS

#### GAP 1: No Companion Death Handling
```typescript
// Lines 280-299: damageCompanion can knock out companion
if (!survived) {
  companion.isActive = false;
  companion.currentHealth = 0;
  logger.warn(`Companion ${companion.name} was knocked out`);
}
```
**Missing:**
- What happens to ongoing combat when companion dies?
- Can companion be revived mid-combat?
- Does combat continue without companion bonuses?
- Any penalty for companion dying?

#### GAP 2: Auto-Ability Doesn't Check Energy (Lines 326-363)
```typescript
// Lines 326-363: Suggests ability but doesn't check if companion has energy
static shouldAutoUseAbility(companion, playerHP, playerMaxHP, npcHP) {
  // ...
  if (companion.abilities.includes(abilityId) && companion.canUseAbility(abilityId)) {
    return abilityId;
  }
```
**Problem:** `canUseAbility` checks cooldown (assumed) but what about energy cost?
**Fix:** Verify energy available before suggesting ability.

#### GAP 3: Combat Contribution Never Used (Lines 303-321)
```typescript
// Lines 303-321: Generates contribution summary but no callers
static async generateCombatContribution(
  companion: IAnimalCompanion,
  encounter: ICombatEncounter,
  totalDamageDealt: number,
  totalDamagePrevented: number,
  abilitiesUsed: CompanionAbilityId[]
): Promise<CompanionCombatContribution> {
  return {
    companionId: companion._id.toString(),
    companionName: companion.name,
    // ...
  };
}
```
**Problem:** This function is never called anywhere. Dead code.
**Impact:** Combat contribution stats never tracked.
**Fix:** Integrate into combat end flow or remove.

### 🚧 INCOMPLETE IMPLEMENTATIONS

#### TODO 1: Actual Ability Effects (Lines 186-213)
```typescript
// Lines 186-213: Effect calculation minimal
case 'DETECTION':
  effect.specialEffect = 'Reveals enemy information';
  break;
```
**Incomplete:** "Reveals enemy information" but what information? How is it revealed? No integration with UI.

#### TODO 2: Recovery After Combat Primitive (Lines 422-444)
```typescript
// Lines 422-444: Simple heal, no advanced logic
static async restoreAfterCombat(companion, victory, session?) {
  if (victory) {
    const healAmount = Math.floor(companion.maxHealth * 0.2);
    companion.heal(healAmount);
```
**Missing:**
- Scale heal based on bond level
- Different recovery for different roles
- Full heal if no damage taken
- Trauma/stress system if severely injured

---

## CROSS-CUTTING CONCERNS

### 1. TRANSACTION MANAGEMENT INCONSISTENCY

**Problem:** Different services handle transactions differently:
- Core Combat: Uses distributed lock + optional transaction
- Duel: Uses transaction everywhere but also Redis state
- Boss Encounter: Uses distributed lock + transaction
- World Boss: Uses lock but saves to both Redis and MongoDB
- Companion: Optional session parameter (inconsistent)

**Impact:**
- Code complexity high
- Hard to reason about atomicity
- Risk of partial updates

**Recommendation:** Standardize on ONE pattern:
```typescript
// Option A: Always use distributed lock + MongoDB transaction
withLock(key, async () => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // operations
    await session.commitTransaction();
  } catch {
    await session.abortTransaction();
  } finally {
    session.endSession();
  }
});

// Option B: Use Redis for state, MongoDB for history only
// State mutations in Redis (atomic)
// Completed combats written to MongoDB (audit trail)
```

### 2. MAGIC NUMBERS EVERYWHERE

**Examples:**
- Damage values: `50, 40, 35, 30...` (combat.service.ts)
- Bond modifiers: `/200`, `/100` (companion)
- Energy costs: `10` (combat), different in bosses
- Cooldown calculations: `24 * 60 * 60 * 1000` (repeated everywhere)
- TTL values: `7200`, `30`, `60000`

**Fix:** Create centralized constants file:
```typescript
// constants/combat.constants.ts
export const COMBAT_CONSTANTS = {
  ENERGY_COST: 10,
  BOSS_ENERGY_COST: 20,
  FLEE_MAX_ROUNDS: 3,
  DAMAGE_BY_HAND: { /* ... */ },
  BOND_DIVISOR: 200,
  // etc.
};
```

### 3. ERROR HANDLING PATTERNS VARY

**Inconsistencies:**
- Some functions throw `new Error()`
- Some throw `AppError` with status codes
- Some return `{ success: false, message: string }`
- Socket handlers emit errors vs throwing

**Fix:** Standardize error handling:
```typescript
// Services: Always throw AppError
throw new AppError('Message', HttpStatus.BAD_REQUEST);

// Controllers: Try-catch and convert to response
try {
  await service.method();
} catch (error) {
  if (error instanceof AppError) {
    res.status(error.status).json({ success: false, error: error.message });
  } else {
    logger.error('Unexpected error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

// Socket handlers: Try-catch and emit error event
try {
  await service.method();
} catch (error) {
  socket.emit('error', {
    code: error.code,
    message: sanitizeErrorMessage(error)
  });
}
```

### 4. LOGGING INCONSISTENCY

**Problems:**
- Some use `logger.info`, others `logger.warn`, some use `logger.error`
- No correlation IDs for tracing requests
- Some log before action, some after
- Sensitive data potentially logged (character names, gold amounts)

**Fix:** Establish logging standards:
```typescript
// Combat start
logger.info('Combat initiated', {
  correlationId: req.id,
  characterId,
  npcId,
  energyCost
});

// Combat end
logger.info('Combat completed', {
  correlationId: req.id,
  characterId,
  outcome: 'victory',
  duration: endTime - startTime
});

// Errors
logger.error('Combat failed', {
  correlationId: req.id,
  error: error.message,
  stack: error.stack
});
```

### 5. TYPE SAFETY ISSUES

**Problems:**
- `as any` casts everywhere (especially in boss encounter)
- `as unknown as INPC` (line 299, combat.service.ts)
- Optional chaining missing (`encounter.npcId?.name`)
- Inconsistent null checks

**Fix:**
1. Define proper types for all models
2. Use type guards instead of `as any`
3. Enable `strict: true` in tsconfig.json
4. Add null checks or use optional chaining

---

## RECOMMENDATIONS

### IMMEDIATE FIXES (This Week)

1. **CRITICAL: Secure World Boss Admin Endpoints**
   - File: `server/src/controllers/worldBoss.controller.ts`
   - Lines: 211-237, 243-263
   - Add `requireAdmin` middleware

2. **BUG: Fix Energy Refund on Combat Failure**
   - Files: `combat.service.ts` (line 190), `bossEncounter.service.ts` (line 152)
   - Refund energy if encounter creation fails

3. **BUG: Fix Partial Gold Recovery in Duels**
   - File: `duel.service.ts` lines 549-576
   - Implement retry logic or manual review queue

4. **BUG: Fix Disconnect Timer Leak in Forfeit**
   - File: `duelHandlers.ts` line 1404
   - Call `clearDisconnectTimer()` in `handleForfeit`

5. **MEMORY LEAK: Add TTL Index to DuelSession**
   - Model: `DuelSession.model.ts`
   - Add `{ expires: '1h' }` to schema

### SHORT-TERM IMPROVEMENTS (Next Sprint)

6. **Standardize Transaction Handling**
   - Create `withTransaction` utility
   - Refactor all combat services to use it consistently

7. **Extract Magic Numbers to Constants**
   - Create `constants/combat.constants.ts`
   - Replace all hardcoded values

8. **Complete Incomplete Features**
   - Implement `TODO` items in boss flee mechanic
   - Implement `TODO` items in boss item usage
   - Implement duel all-in betting

9. **Add Missing Validations**
   - Party member validation in boss encounters
   - Damage range validation in world bosses
   - Null checks throughout companion combat

10. **Fix Type Safety Issues**
    - Remove `as any` casts
    - Add proper type guards
    - Enable strict mode

### LONG-TERM REFACTORING (Next Month)

11. **Unify State Management**
    - Choose: Redis OR MongoDB for active state
    - Document clear separation between active/historical data

12. **Implement Comprehensive Testing**
    - Unit tests for all combat calculation functions
    - Integration tests for combat flows
    - Load tests for concurrent combat

13. **Add Monitoring**
    - Track combat success/failure rates
    - Monitor average combat duration
    - Alert on anomalies (e.g., too many failures)

14. **Performance Optimization**
    - Add caching for boss availability checks
    - Batch participant updates in world bosses
    - Index optimization on combat queries

15. **Documentation**
    - Document combat formulas
    - Create flow diagrams
    - Write developer guide for adding new combat features

---

## SCORING BREAKDOWN

| System | Score | Rationale |
|--------|-------|-----------|
| Core Combat | 82/100 | Strong security fixes, transaction safety, but missing validations and energy refund logic |
| Dueling (PvP) | 85/100 | Excellent distributed locking, memory leak fixes, disconnect handling; incomplete features drag down score |
| Boss Encounters | 65/100 | Good phase system, but many TODOs, missing validations, incomplete party system |
| World Bosses | 60/100 | Critical security gaps (no admin auth), race conditions, incomplete reward distribution |
| Companion Combat | 70/100 | Good role system and bond integration, but inconsistent saves, dead code, incomplete features |

**Overall Weighted Score: 74/100 (C+)**

---

## CONCLUSION

The combat systems in Desperados Destiny show **strong engineering in some areas** (Core Combat, Dueling) but **significant gaps in others** (World Bosses, Boss Encounters). The codebase demonstrates good security awareness with fixes for RNG manipulation, race conditions, and memory leaks. However, incomplete features, inconsistent patterns, and missing validations prevent a production-ready rating.

**Primary Concerns:**
1. World Boss admin endpoints are completely unsecured (CRITICAL)
2. Transaction management inconsistent across systems
3. Many TODO comments indicate incomplete features
4. State management split between Redis and MongoDB creates confusion
5. Party combat system referenced but not implemented

**Strengths:**
1. Secure RNG implementation prevents cheating
2. Distributed locking prevents most race conditions
3. Proper transaction handling in critical paths
4. Good error recovery (gold refunds)
5. Memory leak prevention measures

**Recommended Priority:**
1. Fix critical security issues (world boss admin)
2. Complete or remove incomplete features
3. Standardize transaction/state management patterns
4. Add comprehensive testing
5. Document combat mechanics

With focused effort on the high-priority fixes and completion of incomplete features, these systems could reach production quality within 2-3 sprints.

