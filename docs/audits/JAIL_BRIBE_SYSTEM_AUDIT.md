# JAIL & BRIBE SYSTEM AUDIT REPORT
**Western RPG Game - Desperados Destiny**
**Audit Date:** 2025-12-15
**Systems Analyzed:** Jail System, Bribe System, Bounty Turn-In, Escape Mechanics

---

## 1. SYSTEM OVERVIEW

### 1.1 Jail System Architecture

The jail system is a comprehensive criminal justice mechanism with multiple components:

**Core Components:**
- **Jail Service** (`server/src/services/jail.service.ts` - 810 lines)
  - Imprisonment logic with time-based sentences
  - Escape attempts with skill-based chance calculations
  - Bail payment system (self or friend)
  - In-jail bribery of guards
  - Prison labor activities for gold/XP
  - Bounty turn-in system for player arrests

- **Character Model Integration** (`server/src/models/Character.model.ts`)
  - `isJailed: boolean` - Jail status flag
  - `jailedUntil: Date | null` - Release timestamp
  - `lastBailCost: number` - Stores bail amount
  - `lastArrestTime: Date | null` - Last arrest timestamp
  - `arrestCooldowns: Map<string, Date>` - Prevents arrest spam
  - Methods: `isCurrentlyJailed()`, `getRemainingJailTime()`, `sendToJail()`, `releaseFromJail()`

- **Jail Middleware** (`server/src/middleware/jail.middleware.ts`)
  - `preventActionsWhileJailed` - Blocks most actions when jailed
  - `autoReleaseCheck` - Auto-releases on sentence expiration
  - `blockJailedPlayers` - General-purpose jail blocker
  - `smartJailBlock` - Route-based selective blocking

**Jail Mechanics:**
1. **Imprisonment Sources:**
   - Player turn-ins (bounty hunters)
   - Crime failures (caught committing crimes)
   - Admin pardons/releases

2. **Sentence Calculation:**
   - Wanted level based: 15 minutes per wanted level
   - Crime severity tiers: Minor (5-15m), Moderate (15-30m), Major (30-60m), Violent (60-120m)
   - Escape failure penalty: +30 minutes

3. **Bail System:**
   - Base formula: `(wantedLevel * 100) + (sentenceMinutes * 5)`
   - Can be paid by self or another player
   - Stored in `character.lastBailCost`
   - Some crimes don't allow bail (check: `bailCost === 0`)

4. **Jail Locations:**
   - 4 regional jails: Perdition, Sangre Mesa, Redstone Pass, Ironwood Basin
   - Location determined by current character location
   - Upon release, moved to town square of jail location

5. **In-Jail Activities:**
   - **Prison Labor**: Earn 5-15 gold, 10-25 XP (30min cooldown)
   - **Socialize**: Get flavor text and rare tips (10% chance)
   - **Escape Attempt**: 15% base + cunning/skill bonuses (60min cooldown)
   - **Bribe Guard**: 30% base acceptance + amount scaling (45min cooldown)
   - **Wait**: Do nothing

### 1.2 Bribe System Architecture

The bribe system allows bypassing restrictions through corruption:

**Core Components:**
- **Bribe Service** (`server/src/services/bribe.service.ts` - 210 lines)
  - Guard bribes for building access
  - NPC bribes for information/services
  - Success probability based on amount and stats

**Bribe Types:**

1. **Guard Bribes** (Building Access):
   - Purpose: Bypass wanted level restrictions at buildings
   - Cost: Variable based on wanted level
   - Success: Guaranteed (always accepted in current implementation)
   - Duration: 30 minutes of access
   - Side effect: +1 criminal reputation
   - Formula: `baseCost (50) * (1 + wantedLevel * 0.5)`

2. **NPC Bribes** (Information/Services):
   - Purpose: Get information or special services from NPCs
   - Base success: 50% + (amount/10) + (cunning * 2)
   - Success: Gold spent, info obtained, +2 criminal reputation
   - Failure: Lose half the gold offered
   - Cross-faction penalty: 1.5x cost multiplier

3. **Jail Guard Bribes** (Early Release):
   - Located in JailService, not BribeService
   - Minimum: `remainingMinutes * 10 gold/minute`
   - Base acceptance: 30% + scaling with overpayment
   - Success: Released from jail
   - Failure: Lose 50% of bribe amount
   - Cooldown: 45 minutes between attempts

**Criminal Reputation:**
- Increases with each bribe (+1 for guard, +2 for NPC)
- Tracked in `character.criminalReputation` (0-100 scale)
- Currently has minimal game impact (potential future mechanic)

### 1.3 Escape System

**Escape Mechanics:**
- **Base Chance**: 15% (from `JAIL_ACTIVITIES.escape_attempt.baseSuccessChance`)
- **Cunning Bonus**: +1% per cunning stat point
- **Skill Bonuses**: +2% per level of stealth/lockpick/escape skills
- **Maximum**: Capped at 75%
- **Cooldown**: 60 minutes between attempts
- **Failure Penalty**: +30 minutes added to sentence
- **Success**: Character released with 'escaped' status

### 1.4 Bounty Turn-In System

**Turn-In Mechanics:**
- **Requirement**: Target must have wanted level 3+
- **Bounty Reward**: `targetBountyAmount * 1.5` (150% multiplier)
- **Jail Sentence**: `targetWantedLevel * 15 minutes`
- **Bail Cost**: `targetWantedLevel * 100 gold`
- **Arrest Cooldown**: Prevents same-player arrest spam (Map-based tracking)
- **Side Effects**:
  - Target's wanted level reduced by 1
  - Hunter gains gold reward
  - Target sent to jail
  - Notification sent to both players

---

## 2. TOP 5 STRENGTHS

### 2.1 Comprehensive Transaction Safety
**Location**: All services use mongoose sessions extensively
- All gold-modifying operations properly wrapped in transactions
- Rollback on errors prevents gold duplication
- Session management follows best practices
```typescript
// jail.service.ts:186-252
const session = await mongoose.startSession();
session.startTransaction();
try {
  // ... operations
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### 2.2 Robust Middleware Protection
**Location**: `jail.middleware.ts:18-96`
- Multiple layers of jail enforcement
- Auto-release when sentence expires
- Clear error messages with jail status
- Selective route blocking (allows chat, mail, friends while jailed)
- Ownership verification prevents unauthorized actions

### 2.3 Well-Designed Cooldown System
**Location**: Character model arrest cooldowns
- Map-based cooldown tracking prevents abuse
- Prevents arrest spam of same target
- Separate cooldowns for different jail activities
- Implemented at model level for persistence
```typescript
// Character.model.ts:926-943
canArrestTarget(targetId: string): boolean {
  const cooldowns = this.arrestCooldowns as Map<string, Date>;
  const lastArrest = cooldowns.get(targetId);
  if (lastArrest) {
    const hoursSinceArrest = (Date.now() - lastArrest.getTime()) / (1000 * 60 * 60);
    if (hoursSinceArrest < 24) return false;
  }
  return true;
}
```

### 2.4 Balanced Risk/Reward Economics
**Location**: Various constants and calculations
- Escape: High risk (30min penalty) vs reward (freedom)
- Bribe guard: Variable cost with chance of losing 50%
- Prison labor: Safe but low income (5-15 gold)
- Bounty turn-in: Lucrative (1.5x multiplier) with 24hr cooldown
- Bail costs scale with severity

### 2.5 Clean Service Architecture
**Location**: Service layer separation
- Clear separation of concerns (JailService, BribeService, GoldService)
- Reusable helper methods
- Proper error handling and logging
- Type-safe with shared types package
- Controller/Service/Model pattern properly implemented

---

## 3. CRITICAL ISSUES & BUGS

### 3.1 CRITICAL: Activity Cooldowns Not Enforced
**Severity**: CRITICAL
**Exploit Potential**: HIGH
**File**: `server/src/services/jail.service.ts:724-731`

```typescript
private static checkActivityCooldown(
  character: ICharacter,
  activity: JailActivity
): { canPerform: boolean; minutesRemaining: number } {
  // This would need to be tracked in character model
  // For now, always allow
  return { canPerform: true, minutesRemaining: 0 };
}
```

**Impact**: Players can:
- Spam escape attempts infinitely (should be 60min cooldown)
- Spam bribe attempts infinitely (should be 45min cooldown)
- Spam prison labor infinitely (should be 30min cooldown)
- Generate unlimited gold/XP from prison labor
- Brute force escapes through repeated attempts

**Recommended Fix**:
```typescript
// Add to Character.model.ts interface:
jailActivityCooldowns: Map<string, Date>;

// Implement in checkActivityCooldown:
const cooldowns = character.jailActivityCooldowns as Map<string, Date>;
const lastAttempt = cooldowns.get(activity);
if (lastAttempt) {
  const config = JAIL_ACTIVITIES[activity];
  const minutesSince = (Date.now() - lastAttempt.getTime()) / (60 * 1000);
  if (minutesSince < config.cooldown) {
    return { canPerform: false, minutesRemaining: config.cooldown - minutesSince };
  }
}
return { canPerform: true, minutesRemaining: 0 };
```

### 3.2 CRITICAL: recordActivityAttempt Does Nothing
**Severity**: CRITICAL
**Exploit Potential**: HIGH
**File**: `server/src/services/jail.service.ts:736-739`

```typescript
private static recordActivityAttempt(character: ICharacter, activity: JailActivity): void {
  // Would need to track this in character model
  logger.debug(`Activity attempted: ${character.name} - ${activity}`);
}
```

**Impact**:
- Called after escape/bribe attempts but does nothing
- No persistence of activity history
- Cooldown system completely non-functional
- Players can attempt activities unlimited times

**Recommended Fix**: Implement Map-based tracking similar to arrestCooldowns

### 3.3 HIGH: Jail Middleware Not Applied to Most Routes
**Severity**: HIGH
**Exploit Potential**: MEDIUM
**Files**:
- `server/src/routes/action.routes.ts:48,65`
- `server/src/routes/crime.routes.ts:35`

**Issue**: Only 3 routes use `preventActionsWhileJailed`:
1. `/api/actions/challenge` (line 48)
2. `/api/actions/start` (line 65)
3. `/api/crimes/lay-low` (line 35)

**Impact**: Jailed players can:
- Access most game features
- Travel to locations
- Use shops
- Participate in duels/tournaments
- Do gang activities
- Trade in marketplace
- Complete quests

**Current Protection**: Minimal
**Expected Protection**: Most gameplay routes should block jailed players

**Recommended Fix**:
```typescript
// Apply to critical routes:
router.use(preventActionsWhileJailed); // Global for route group
// OR selectively add to:
// - Combat routes
// - Travel/location routes
// - Shop/trading routes
// - Quest/mission routes
// - Gang operation routes
```

### 3.4 HIGH: Jail Stats Always Return Zeros
**Severity**: HIGH
**Impact**: MEDIUM
**File**: `server/src/services/jail.service.ts:623-640`

```typescript
static async getJailStats(characterId: string | mongoose.Types.ObjectId): Promise<JailStats> {
  // For now, return basic stats
  // In full implementation, we'd track detailed jail history
  return {
    totalArrests: 0,
    totalJailTime: 0,
    successfulEscapes: 0,
    failedEscapes: 0,
    timesBailed: 0,
    totalBailPaid: 0,
    totalBribes: 0,
    totalBribesPaid: 0,
    prisonLaborGold: 0,
    prisonLaborXP: 0
  };
}
```

**Impact**:
- No tracking of player criminal history
- Cannot detect repeat offenders
- No achievement tracking
- No analytics/metrics
- Leaderboards cannot show jail stats

**Recommended Fix**: Create JailHistory model or add fields to Character model

### 3.5 MEDIUM: Bail Cost Calculation Inconsistency
**Severity**: MEDIUM
**Exploit Potential**: LOW
**Files**:
- `server/src/services/jail.service.ts:80,677-679`
- `server/src/models/Character.model.ts:870`

**Issue**: Three different bail calculation formulas:

```typescript
// Formula 1 (jail.service.ts:677)
private static calculateBail(wantedLevel: number, sentenceMinutes: number): number {
  return (wantedLevel * 100) + (sentenceMinutes * 5);
}

// Formula 2 (Character.model.ts:870)
this.lastBailCost = bailCost ?? (this.wantedLevel * 50);

// Formula 3 (jail.middleware.ts:66)
const bailCost = character.wantedLevel * 50;
```

**Impact**:
- Confusing for players (different amounts shown)
- Potential exploit if amounts differ significantly
- Middleware shows different amount than actual cost

**Recommended Fix**: Use single source of truth - always use `character.lastBailCost`

### 3.6 MEDIUM: Race Condition in Auto-Release
**Severity**: MEDIUM
**Exploit Potential**: LOW
**File**: `server/src/middleware/jail.middleware.ts:84-89`

```typescript
// If jailed time has expired, auto-release
if (character.isJailed && character.jailedUntil && new Date() >= character.jailedUntil) {
  character.releaseFromJail();
  await character.save();
  logger.info(`Character ${characterId} automatically released from jail`);
}
```

**Issue**:
- Auto-release happens outside of transaction
- No session provided to save()
- Could conflict with other operations
- Multiple simultaneous requests could cause duplicate releases

**Recommended Fix**: Use transaction or move to scheduled job

### 3.7 MEDIUM: Bribe Guard Has No Failure Case
**Severity**: MEDIUM
**Exploit Potential**: LOW
**File**: `server/src/services/bribe.service.ts:29-88`

```typescript
static async bribeGuard(characterId: string, buildingId: string, bribeCost: number): Promise<BribeResult> {
  // ... validation ...

  // Deduct gold
  await GoldService.deductGold(...);

  // Increase criminal reputation
  character.criminalReputation = Math.min(100, (character.criminalReputation || 0) + 1);

  // Always succeeds!
  return {
    success: true,
    goldSpent: bribeCost,
    accessGranted: true,
    duration: 30,
    message: `You slip ${bribeCost} gold to the guard...`,
  };
}
```

**Issue**:
- Guard bribes always succeed (100% success rate)
- No RNG check
- No skill/stat influence
- Different from NPC bribes which can fail

**Impact**:
- Trivializes wanted level restrictions
- No risk for bribing guards
- Inconsistent with NPC bribe mechanics

**Recommended Fix**: Add probability check similar to NPC bribes

### 3.8 LOW: Notification Service Not Validated
**Severity**: LOW
**Impact**: LOW
**File**: Multiple locations calling `NotificationService.sendNotification`

**Issue**:
- NotificationService calls not awaited in some places
- No error handling if notification fails
- Could cause transaction commits with failed notifications

**Example** (`jail.service.ts:92-97`):
```typescript
await NotificationService.sendNotification(
  character._id.toString(),
  'JAIL',
  `You have been jailed...`,
  { sentence, reason, bailAmount: calculatedBail, canBail }
);
```

**Impact**: Minor - notifications are non-critical but should not block core functionality

---

## 4. INCOMPLETE/TODO ITEMS

### 4.1 Jail Reason Tracking Not Implemented
**Location**: `server/src/services/jail.service.ts:601-617`

```typescript
static getJailInfo(character: ICharacter): JailState {
  return {
    // ...
    reason: null, // Would need to track this
    // ...
  };
}
```

**Missing**:
- `jailReason` field in Character model
- Reason persistence when jailing
- Reason display in UI

### 4.2 Jail Location Mapping Incomplete
**Location**: `server/src/services/jail.service.ts:647-658`

```typescript
private static determineJailLocation(currentLocation: string): JailLocation {
  const locationJailMap: Record<string, JailLocation> = {
    'perdition': JailLocation.PERDITION_JAIL,
    'sangre-mesa': JailLocation.SANGRE_JAIL,
    'redstone-pass': JailLocation.REDSTONE_JAIL,
    'ironwood-basin': JailLocation.IRONWOOD_JAIL
  };

  return locationJailMap[currentLocation] || JailLocation.PERDITION_JAIL;
}
```

**Issue**:
- Only 4 locations mapped
- Comment says "simplified - would need full location mapping"
- Defaults to Perdition for all unmapped locations

### 4.3 Client-Side Jail Hook Missing
**Location**: Client-side hooks
**Status**: `useJail.ts` does not exist

**Missing Components**:
- No client hook for jail system
- Players cannot interact with jail from UI
- No escape/bribe/activity buttons
- No jail status display
- Bribe hook exists (`useBribe.ts`) but jail hook doesn't

**Impact**: System is server-only, players cannot use jail features

### 4.4 Advanced Escape Mechanics Not Implemented
**Location**: `jail.service.ts:701-719`

```typescript
// Check for relevant skills (lockpicking, stealth, etc)
for (const skill of character.skills) {
  if (skill.skillId.toLowerCase().includes('stealth') ||
      skill.skillId.toLowerCase().includes('lockpick') ||
      skill.skillId.toLowerCase().includes('escape')) {
    chance += skill.level * 0.02; // +2% per skill level
  }
}
```

**Issues**:
- String matching for skills is fragile
- No dedicated "Escape Artist" skill
- No items that boost escape chance
- No gang help for escapes
- No corruption level affecting guard susceptibility

### 4.5 Bribe Access Tracking Not Implemented
**Location**: `bribe.service.ts:78`

```typescript
return {
  success: true,
  accessGranted: true,
  duration: 30, // 30 minutes of access
  // ...
};
```

**Issue**:
- Duration returned but not tracked anywhere
- No mechanism to enforce 30-minute access window
- Buildings don't check if player has active bribe
- Effectively grants permanent access until server restart

### 4.6 Criminal Reputation Has No Game Impact
**Location**: `bribe.service.ts:66,143`

```typescript
// Increase criminal reputation slightly (bribing is illegal)
character.criminalReputation = Math.min(100, (character.criminalReputation || 0) + 1);
```

**Issue**:
- Field exists and increments
- No game mechanics use it
- No NPC reactions
- No reputation decay
- No benefits or penalties

---

## 5. EXPLOIT POTENTIAL

### 5.1 CRITICAL EXPLOIT: Infinite Prison Labor Gold/XP
**Severity**: CRITICAL - GAME BREAKING
**Exploitability**: TRIVIAL
**Location**: `jail.service.ts:744-781`

**Exploit Steps**:
1. Get jailed (any method)
2. Spam `/api/jail/activity` with `activity: "prison_labor"`
3. Earn 5-15 gold and 10-25 XP per request
4. Repeat unlimited times (no cooldown enforcement)

**Impact**:
- Generate thousands of gold while AFK in jail
- Level up rapidly from XP
- Economic imbalance
- Jail becomes more profitable than normal gameplay
- Players may intentionally get jailed to farm

**Proof of Concept**:
```javascript
// Automated exploit
async function jailFarmExploit() {
  while (inJail) {
    await fetch('/api/jail/activity', {
      method: 'POST',
      body: JSON.stringify({ activity: 'prison_labor' })
    });
    // No cooldown! Can spam instantly
  }
}
```

**Mitigation Priority**: IMMEDIATE

### 5.2 CRITICAL EXPLOIT: Escape Spam
**Severity**: CRITICAL
**Exploitability**: EASY
**Location**: `jail.service.ts:182-253`

**Exploit Steps**:
1. Get jailed
2. Spam escape attempts continuously
3. With 15% base + stat bonuses, 75% max chance
4. Average ~13 attempts to escape (at 75% chance)
5. No cooldown means instant spam

**Impact**:
- Jail becomes meaningless
- Players escape in seconds instead of serving time
- Wanted level system undermined
- High-stat characters never stay jailed

**Math**:
- At 75% success rate: 1/0.75 = 1.33 average attempts
- At 30% success rate: 1/0.30 = 3.33 average attempts
- With no cooldown, escaping takes seconds

**Mitigation Priority**: IMMEDIATE

### 5.3 HIGH EXPLOIT: Guard Bribe Spam
**Severity**: HIGH
**Exploitability**: EASY
**Location**: `jail.service.ts:258-357`

**Exploit Steps**:
1. Get jailed with short sentence
2. Calculate minimum bribe: `remainingMinutes * 10`
3. Spam bribe attempts with minimum amount
4. 30% base chance + scaling
5. No cooldown enforcement

**Impact**:
- Can attempt bribes hundreds of times
- Even at 30% success, likely escape quickly
- If rich, can guarantee escape
- Cooldown intended but not enforced

**Expected Behavior**: 45-minute cooldown between attempts
**Actual Behavior**: Unlimited attempts

### 5.4 MEDIUM EXPLOIT: Arrest Farming Edge Case
**Severity**: MEDIUM
**Exploitability**: MEDIUM
**Location**: `jail.service.ts:501-596`

**Exploit Setup**:
1. Create alt account
2. Get alt to wanted level 5
3. Turn in alt for bounty
4. Alt gets 24hr arrest cooldown
5. Switch to different main account
6. Turn in same alt again (different hunter)

**Issue**: Cooldown is per-hunter, not per-target

**Impact**:
- Single target can be turned in by multiple hunters
- Alt can be shared for bounty farming
- Unlimited gold generation with cooperation

**Mitigation**: Add global target arrest cooldown

### 5.5 LOW EXPLOIT: Middleware Bypass
**Severity**: LOW
**Exploitability**: MEDIUM
**Location**: Various route files

**Exploit**:
- Most routes don't have jail middleware
- Jailed players can access unprotected routes
- Can perform actions they shouldn't while jailed

**Examples of Unprotected Routes**:
- `/api/shop/*` - Can buy items
- `/api/marketplace/*` - Can trade
- `/api/duels/*` - Can duel
- `/api/quests/*` - Can do quests
- `/api/gang/*` - Can gang actions
- `/api/location/*` - Can travel

**Impact**: Jail is partially effective but easily circumvented

### 5.6 LOW EXPLOIT: Bail Cost Display Manipulation
**Severity**: LOW
**Exploitability**: LOW
**Location**: `jail.middleware.ts:66` vs actual bail cost

**Exploit**:
- Middleware shows: `wantedLevel * 50`
- Actual cost: `(wantedLevel * 100) + (sentenceMinutes * 5)`
- Player sees lower cost than reality

**Impact**: Minor confusion, possible UI exploit

---

## 6. PRIORITY RECOMMENDATIONS

### 6.1 IMMEDIATE (P0) - Fix Game-Breaking Exploits

#### 6.1.1 Implement Activity Cooldowns
**Priority**: P0 - CRITICAL
**Estimated Effort**: 4 hours
**Files to Modify**:
- `server/src/models/Character.model.ts` - Add `jailActivityCooldowns` Map
- `server/src/services/jail.service.ts` - Implement cooldown checking
- Add database migration for new field

**Implementation**:
```typescript
// Character.model.ts
jailActivityCooldowns: {
  type: Map,
  of: Date,
  default: new Map()
},

// jail.service.ts
private static checkActivityCooldown(character: ICharacter, activity: JailActivity) {
  const cooldowns = character.jailActivityCooldowns as Map<string, Date>;
  const lastAttempt = cooldowns.get(activity);

  if (lastAttempt) {
    const config = JAIL_ACTIVITIES[activity];
    const minutesSince = (Date.now() - lastAttempt.getTime()) / (60 * 1000);

    if (minutesSince < config.cooldown) {
      return {
        canPerform: false,
        minutesRemaining: Math.ceil(config.cooldown - minutesSince)
      };
    }
  }

  return { canPerform: true, minutesRemaining: 0 };
}

private static recordActivityAttempt(character: ICharacter, activity: JailActivity) {
  const cooldowns = character.jailActivityCooldowns as Map<string, Date>;
  cooldowns.set(activity, new Date());
  character.jailActivityCooldowns = cooldowns;
}
```

#### 6.1.2 Apply Jail Middleware Globally
**Priority**: P0 - CRITICAL
**Estimated Effort**: 2 hours
**Files to Modify**:
- All route files that should block jailed players

**Strategy**:
```typescript
// Option A: Global middleware in index.ts
router.use(autoReleaseCheck); // Check all routes for auto-release

// Option B: Route-specific (recommended)
// Add to each protected route group:
router.use(preventActionsWhileJailed);

// Routes to protect:
// - action.routes.ts (all actions)
// - crime.routes.ts (all crimes)
// - combat.routes.ts (all combat)
// - location.routes.ts (travel)
// - shop.routes.ts (shopping)
// - quest.routes.ts (quests)
// - gang.routes.ts (gang operations)
// - duel.routes.ts (dueling)
// - marketplace.routes.ts (trading)
```

### 6.2 HIGH PRIORITY (P1) - Core Functionality

#### 6.2.1 Implement Jail Statistics Tracking
**Priority**: P1
**Estimated Effort**: 6 hours
**Approach**: Create JailHistory model

```typescript
// models/JailHistory.model.ts
interface IJailHistory extends Document {
  characterId: ObjectId;
  totalArrests: number;
  totalJailTime: number; // minutes
  successfulEscapes: number;
  failedEscapes: number;
  timesBailed: number;
  totalBailPaid: number;
  totalBribes: number;
  totalBribesPaid: number;
  prisonLaborGold: number;
  prisonLaborXP: number;
  arrests: Array<{
    timestamp: Date;
    reason: JailReason;
    sentence: number;
    bailCost: number;
  }>;
}
```

#### 6.2.2 Fix Guard Bribe Success Rate
**Priority**: P1
**Estimated Effort**: 2 hours
**File**: `server/src/services/bribe.service.ts:29-88`

**Implementation**:
```typescript
static async bribeGuard(characterId: string, buildingId: string, bribeCost: number) {
  // Calculate success chance
  const baseChance = 60; // 60% base
  const wantedPenalty = character.wantedLevel * 5; // -5% per wanted level
  const costBonus = Math.min(20, bribeCost / 10); // +1% per 10 gold, max +20%
  const cunningBonus = character.stats.cunning * 2; // +2% per cunning

  const successChance = baseChance - wantedPenalty + costBonus + cunningBonus;
  const succeeded = SecureRNG.chance(successChance / 100);

  if (succeeded) {
    // Current success logic
  } else {
    // Failed - lose 50% of bribe, no access granted
    const lostGold = Math.floor(bribeCost * 0.5);
    await GoldService.deductGold(characterId, lostGold, ...);

    return {
      success: false,
      goldSpent: lostGold,
      accessGranted: false,
      message: "The guard refuses your bribe and pockets half your gold!"
    };
  }
}
```

#### 6.2.3 Standardize Bail Cost Calculation
**Priority**: P1
**Estimated Effort**: 1 hour
**Strategy**: Always use `character.lastBailCost` as source of truth

```typescript
// Remove calculations from middleware
// jail.middleware.ts:66 - Change to:
const bailCost = character.lastBailCost;

// Ensure lastBailCost is always set when jailing
// jail.service.ts:80 - Keep current:
const calculatedBail = bailAmount || this.calculateBail(character.wantedLevel, sentence);
```

### 6.3 MEDIUM PRIORITY (P2) - Enhancements

#### 6.3.1 Create Client-Side Jail Hook
**Priority**: P2
**Estimated Effort**: 8 hours
**New File**: `client/src/hooks/useJail.ts`

**Features to Include**:
- `checkJailStatus()` - Get current jail state
- `attemptEscape()` - Try to escape
- `attemptBribe(amount)` - Bribe guard
- `payBail(characterId?)` - Pay bail
- `doActivity(activity)` - Perform jail activity
- `getJailStats()` - Get statistics
- Real-time updates via WebSocket

#### 6.3.2 Implement Bribe Access Duration Tracking
**Priority**: P2
**Estimated Effort**: 4 hours

**Approach**:
```typescript
// Character.model.ts
activeBribes: Map<string, Date>; // buildingId -> expirationTime

// Building access check
function canAccessBuilding(character, building) {
  if (character.wantedLevel < building.minWantedLevel) {
    return true; // Not wanted
  }

  const bribeExpiration = character.activeBribes.get(building._id);
  if (bribeExpiration && new Date() < bribeExpiration) {
    return true; // Active bribe
  }

  return false; // Blocked
}

// On successful bribe
character.activeBribes.set(buildingId, new Date(Date.now() + 30 * 60 * 1000));
```

#### 6.3.3 Implement Jail Reason Tracking
**Priority**: P2
**Estimated Effort**: 3 hours

**Changes**:
```typescript
// Character.model.ts
currentJailReason: {
  type: String,
  enum: Object.values(JailReason),
  default: null
},

// jail.service.ts:83
character.currentJailReason = reason;

// jail.service.ts:613
reason: character.currentJailReason,
```

### 6.4 LOW PRIORITY (P3) - Polish & Features

#### 6.4.1 Implement Criminal Reputation Effects
**Priority**: P3
**Estimated Effort**: 12 hours

**Suggested Mechanics**:
- NPCs react differently based on criminalReputation
- Guards more suspicious (harder bribes) at high rep
- Criminal factions offer bonuses at high rep
- Decay over time if not committing crimes
- Visual indicator in UI

#### 6.4.2 Expand Jail Location Mapping
**Priority**: P3
**Estimated Effort**: 2 hours
**File**: `jail.service.ts:647-658`

Map all game locations to appropriate jails

#### 6.4.3 Advanced Escape Mechanics
**Priority**: P3
**Estimated Effort**: 8 hours

**Features**:
- Dedicated "Escape Artist" skill
- Tools/items that boost escape chance (lockpicks, rope)
- Gang members can help break you out
- Time of day affects escape chance
- Guard shift changes create opportunities

#### 6.4.4 Implement Auto-Release Job
**Priority**: P3
**Estimated Effort**: 4 hours

**Approach**:
```typescript
// jobs/jailAutoRelease.job.ts
export async function jailAutoReleaseJob() {
  const expiredSentences = await Character.find({
    isJailed: true,
    jailedUntil: { $lte: new Date() }
  });

  for (const character of expiredSentences) {
    await JailService.releasePlayer(character._id, 'served');
  }
}

// Schedule: Every 5 minutes
```

### 6.5 TESTING PRIORITIES

#### 6.5.1 Write Unit Tests
**Priority**: P1
**Coverage Needed**:
- Cooldown enforcement
- Bail calculations
- Escape probability
- Bribe success rates
- Transaction rollbacks

#### 6.5.2 Write Integration Tests
**Priority**: P1
**Scenarios**:
- Complete jail flow (arrest → escape/bail → release)
- Bounty turn-in flow
- Failed escape with penalty
- Bribe acceptance/rejection
- Concurrent arrest attempts

#### 6.5.3 Load Testing
**Priority**: P2
**Focus Areas**:
- Rapid activity spam (test cooldowns)
- Concurrent escape attempts
- Transaction isolation
- Race conditions in auto-release

---

## 7. SECURITY CONSIDERATIONS

### 7.1 Input Validation
**Status**: GOOD
**Location**: All controllers validate inputs properly

### 7.2 Authorization
**Status**: GOOD
**All routes protected by**:
- `requireAuth` - User must be logged in
- `requireCharacter` - Character ownership verified

### 7.3 Transaction Isolation
**Status**: EXCELLENT
**All monetary operations use sessions**

### 7.4 Rate Limiting
**Status**: GOOD
**Both routes protected**:
- `/api/jail` - apiRateLimiter (line 216)
- `/api/bribe` - apiRateLimiter (line 342)

### 7.5 SQL Injection / NoSQL Injection
**Status**: EXCELLENT
**All queries use Mongoose properly, no raw queries**

---

## 8. TECHNICAL DEBT SUMMARY

| Category | Count | Priority |
|----------|-------|----------|
| Critical Bugs | 2 | P0 |
| High Severity Issues | 5 | P1 |
| Medium Issues | 3 | P1-P2 |
| Low Issues | 2 | P3 |
| Missing Features | 6 | P2-P3 |
| TODO/Incomplete | 6 | P2-P3 |
| **Total** | **24** | - |

**Total Lines of Code**: 1,020 (Jail: 810, Bribe: 210)
**Test Coverage**: 0% (No tests found)
**Documentation**: Good (inline comments)

---

## 9. CONCLUSION

The Jail and Bribe systems are **architecturally sound** with excellent transaction handling and separation of concerns. However, the systems are **incomplete and exploitable** due to:

1. **Non-functional cooldown system** - Most critical issue
2. **Incomplete middleware protection** - Allows jailed players to play normally
3. **Missing client integration** - Players can't interact with jail features
4. **Stub implementations** - Many features return hardcoded values

**Recommended Action Plan**:
1. **Week 1**: Fix P0 issues (cooldowns, middleware) - BLOCKS PRODUCTION
2. **Week 2**: Implement P1 features (stats, bribe fixes, bail standardization)
3. **Week 3**: Add client hooks and UI integration
4. **Week 4**: Polish and testing

**Production Readiness**: **NOT READY**
**Estimated Time to Production**: 3-4 weeks with dedicated developer

The systems show strong foundational design but require completion of core mechanics before player-facing release.

---

## APPENDIX A: FILE REFERENCE

### Server Files
- `server/src/services/jail.service.ts` (810 lines)
- `server/src/services/bribe.service.ts` (210 lines)
- `server/src/controllers/jail.controller.ts` (243 lines)
- `server/src/controllers/bribe.controller.ts` (190 lines)
- `server/src/middleware/jail.middleware.ts` (275 lines)
- `server/src/routes/jail.routes.ts` (72 lines)
- `server/src/routes/bribe.routes.ts` (49 lines)
- `server/src/models/Character.model.ts` (relevant sections)

### Client Files
- `client/src/hooks/useBribe.ts` (187 lines)
- `client/src/hooks/useJail.ts` (MISSING - needs implementation)

### Shared Files
- `shared/src/types/jail.types.ts` (265 lines)

### Total Lines Audited
Approximately 2,300 lines of code analyzed

---

**End of Audit Report**
