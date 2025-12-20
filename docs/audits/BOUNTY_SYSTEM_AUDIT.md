# BOUNTY SYSTEM AUDIT REPORT
**Western RPG Game - Desperados Destiny**
**Audit Date:** 2025-12-15
**Auditor:** Claude Code Analysis
**Status:** Production Hardening Phase

---

## EXECUTIVE SUMMARY

The Bounty System is a **moderately complete** feature with solid core mechanics but several critical security gaps and incomplete implementations. The system handles player-placed bounties, faction crime bounties, wanted levels, and bounty hunter encounters. However, it lacks proper admin protections, has race condition vulnerabilities, and contains unimplemented integrations.

**Overall Grade:** C+ (Functional but needs hardening)

---

## 1. SYSTEM OVERVIEW

### How Bounties Work

#### A. Bounty Creation Flow
1. **Faction Bounties (Crime-Based)**
   - Triggered when crimes are witnessed (`crime.service.ts:152`)
   - Crime type determines bounty amount (min/max ranges in `bounty.types.ts:128-174`)
   - Creates active bounty record with faction issuer
   - Updates character's WantedLevel across factions

2. **Player Bounties**
   - Any player can place bounty on another (minimum 100 gold)
   - Gold is deducted immediately from issuer (`bounty.service.ts:134`)
   - Bounty expires after 7 days (`bounty.service.ts:161`)
   - Cannot place bounty on yourself (validation at `bounty.service.ts:119`)

#### B. Wanted Level Calculation
- **Per-Faction Tracking:** Settler Alliance, Nahi Coalition, Frontera
- **Total Bounty:** Sum of all faction bounties (`bounty.model.ts:297`)
- **Wanted Ranks:** 5 tiers from UNKNOWN (0-99g) to MOST_WANTED (5000+ gold)
- **Recalculation:** Happens on every bounty change (`bounty.service.ts:379-450`)

#### C. Bounty Collection
- Hunter must defeat/capture target (check: `isDead || isJailed || isKnockedOut`)
- Cannot collect your own bounty
- Faction restrictions apply for faction-issued bounties
- Gold awarded via `GoldService.addGold()` with transaction logging

#### D. Bounty Hunter Encounters
- Spawn chance based on wanted rank (5-30% per action)
- Hunter levels scale with bounty amount
- Can be paid off at 150% of total bounty (`bountyHunter.service.ts:183`)
- Players can hire hunters to track enemies

---

## 2. TOP 5 STRENGTHS

### 1. **Transaction Integrity** ⭐⭐⭐⭐⭐
**Location:** `server/src/services/bounty.service.ts:104-183, 192-273`

All financial operations use MongoDB sessions with proper transaction handling:
```typescript
const session = await mongoose.startSession();
session.startTransaction();
try {
  // ... operations ...
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
}
```
**Impact:** Prevents partial gold transfers, bounty duplication, and inconsistent state.

### 2. **Comprehensive Wanted Level System** ⭐⭐⭐⭐
**Location:** `server/src/models/Bounty.model.ts:280-300`

The wanted level calculation is elegant and automatic:
- Separate faction tracking
- Automatic rank calculation based on thresholds
- Recalculation triggers on every bounty change
- Instance methods for easy access (`wantedLevel.recalculate()`)

### 3. **Proper Database Indexing** ⭐⭐⭐⭐
**Location:** `server/src/models/Bounty.model.ts:224-237`

Well-designed compound indexes for performance:
```typescript
BountySchema.index({ targetId: 1, status: 1 });
BountySchema.index({ status: 1, createdAt: -1 });
BountySchema.index({ amount: -1, status: 1 }); // For bounty board sorting
```
**Impact:** Fast queries on bounty board, character lookups, and leaderboards.

### 4. **Automated Cleanup Jobs** ⭐⭐⭐⭐
**Location:** `server/src/jobs/bountyCleanup.ts`

Two CRON jobs handle maintenance:
- **Expiration Job:** Runs every 15 minutes, expires old bounties
- **Decay Job:** Runs daily at midnight, reduces faction bounties by 10%
- Both use distributed locks to prevent duplicate execution across instances
- Proper error handling and logging

### 5. **Rich Bounty Hunter System** ⭐⭐⭐⭐
**Location:** `server/src/services/bountyHunter.service.ts`

Sophisticated NPC hunter mechanics:
- Territory-based hunter selection
- Dynamic spawn rates based on wanted level
- Payoff negotiations (150% of bounty)
- Hireable hunters with cooldowns
- Active encounter tracking with multiple resolution paths

---

## 3. CRITICAL ISSUES & BUGS

### SEVERITY: CRITICAL 🔴

#### Issue #1: Admin Authorization Missing
**Location:** `server/src/controllers/bounty.controller.ts:277-278`
```typescript
// TODO: Add admin authorization check
// For now, any authenticated user can cancel bounties (for testing)
```
**Impact:** ANY authenticated player can cancel ALL bounties for any character.

**Exploit:**
```javascript
// Attacker can remove their own bounties
fetch('/api/bounty/cancel/their-character-id', { method: 'DELETE' });
// Or grief other players by canceling their lucrative bounties
```

**Fix Required:** Add admin middleware check before allowing cancellation.

---

#### Issue #2: Self-Bounty Collection Race Condition
**Location:** `server/src/services/bounty.service.ts:212-214`

**Vulnerability:**
```typescript
// Can't collect bounty on yourself
if (hunterId === bounty.targetId.toString()) {
  throw new Error('Cannot collect bounty on yourself');
}
```

**Problem:** The check happens AFTER fetching the bounty. A player could:
1. Place high bounty on Player B
2. Defeat Player B
3. Quickly call `collectBounty` with their own character ID AND Player B's bounty ID
4. Timing race: If they collect before another hunter, they get reward for defeating someone else

**Additional Race:** The defeat status check (`isDead || isJailed || isKnockedOut`) at line 228 is not atomic with the collection. Player status could change between check and reward.

**Fix Required:** Add compound unique index and atomic update operation.

---

#### Issue #3: Missing Bounty Refund on Expiration
**Location:** `server/src/services/bounty.service.ts:555-578`

When player-placed bounties expire:
```typescript
static async expireOldBounties(): Promise<number> {
  const result = await Bounty.updateMany(
    { status: BountyStatus.ACTIVE, expiresAt: { $lte: new Date() } },
    { $set: { status: BountyStatus.EXPIRED } }
  );
  // NO REFUND LOGIC!
}
```

**Impact:** Players lose their gold permanently when their bounties expire uncollected. The gold just vanishes from the economy.

**Expected:** Refund should go back to issuer, or partial refund (e.g., 50%).

---

### SEVERITY: HIGH 🟠

#### Issue #4: Bounty Board Doesn't Filter by Location
**Location:** `server/src/services/bounty.service.ts:331-374`

The `getBountyBoard()` accepts a `location` parameter but doesn't use it:
```typescript
static async getBountyBoard(
  location?: string,  // ← Accepted but ignored!
  limit: number = 50
): Promise<BountyBoardEntry[]> {
  const bounties = await Bounty.find({
    status: BountyStatus.ACTIVE,
    // No location filter here
```

**Impact:** Players see ALL bounties globally regardless of location parameter.

---

#### Issue #5: Player Bounties Count Toward All Factions
**Location:** `server/src/services/bounty.service.ts:417-420`

```typescript
} else if (bounty.bountyType === BountyType.PLAYER) {
  // Player bounties count toward all factions
  settlerAlliance += bounty.amount;  // ← Only adds to Settler!
}
```

**Bug:** Comment says "all factions" but only adds to settlerAlliance.
**Impact:** Inconsistent wanted level calculation. Players with high player-bounties only get wanted by one faction instead of all.

---

#### Issue #6: No Validation on Crime Bounty Amounts
**Location:** `server/src/services/bounty.service.ts:46-57`

```typescript
const crimeKey = crimeName.toUpperCase().replace(/\s+/g, '_');
const crimeConfig = CRIME_BOUNTY_AMOUNTS[crimeKey];

if (!crimeConfig) {
  logger.warn(`Unknown crime type for bounty: ${crimeName}, using default`);
}

const min = crimeConfig?.min || 25;
const max = crimeConfig?.max || 100;
```

**Problem:** ANY unknown crime type defaults to 25-100 gold. A malicious or buggy crime service could trigger bounties with arbitrary names.

**Exploit Scenario:**
```typescript
// Crime service bug creates weird crime
await BountyService.addCrimeBounty(
  targetId,
  "SUPER_MEGA_BANK_HEIST_9000", // Not in config
  faction
); // Creates 25-100g bounty (should be 5000+)
```

**Fix:** Throw error or use stricter validation for unknown crimes.

---

### SEVERITY: MEDIUM 🟡

#### Issue #7: Deprecated Methods Still Exposed
**Location:** `server/src/services/bounty.service.ts:453-498`

```typescript
/**
 * @deprecated Use BountyHunterService.checkHunterSpawn instead
 */
static shouldSpawnBountyHunter(wantedRank: WantedRank): boolean {
  // ... still functional
}
```

**Problem:** Deprecated methods are still public and could be called, causing duplicate hunter spawns or inconsistent behavior.

**Fix:** Make these methods private or remove entirely.

---

#### Issue #8: Bounty Decay Doesn't Update Wanted Levels Efficiently
**Location:** `server/src/services/bounty.service.ts:504-550`

```typescript
for (const bounty of bounties) {
  // ... decay logic ...
  await bounty.save();

  // Update wanted level for THIS character
  await this.updateWantedLevel(bounty.targetId.toString());
}
```

**Problem:** If 1000 bounties decay, this makes 1000 individual `updateWantedLevel()` calls, each doing a separate database query.

**Fix:** Batch the wanted level updates or use aggregation.

---

#### Issue #9: Client-Server Type Mismatch
**Location:**
- Client: `client/src/services/bounty.service.ts:10-44`
- Server: `server/src/models/Bounty.model.ts:19-40`

**Client Interface:**
```typescript
export interface WantedLevel {
  wantedLevel: number;          // ← Number
  activeBounties: Bounty[];     // ← Full array of bounty objects
  crimes: Crime[];              // ← Full crime objects
  reputation: 'outlaw' | 'neutral' | 'lawful';  // ← Missing from server
}
```

**Server Interface:**
```typescript
export interface IWantedLevel {
  wantedRank: WantedRank;       // ← Enum, not number
  activeBounties: number;       // ← Count only, not array
  // No crimes field
  // No reputation field
}
```

**Impact:** Frontend expects data that backend doesn't send. This will cause runtime errors.

---

#### Issue #10: Missing Character Deletion Cascade
**Location:** `server/src/models/Bounty.model.ts`

**Problem:** No cleanup logic for when characters are deleted.

**Scenario:**
1. Player A places 10,000 gold bounty on Player B
2. Player B deletes their character
3. Bounty remains ACTIVE forever (no target exists)
4. Hunters can't collect it
5. Player A's 10,000 gold is permanently locked

**Fix:** Add pre-delete hook on Character model to cancel/expire bounties.

---

## 4. INCOMPLETE/TODO ITEMS

### TODO #1: Admin Authorization
**Location:** `server/src/controllers/bounty.controller.ts:277`
```typescript
// TODO: Add admin authorization check
// For now, any authenticated user can cancel bounties (for testing)
```
**Status:** CRITICAL - Must implement before production.

---

### TODO #2: Trust Level Checking
**Location:** `server/src/services/bountyHunter.service.ts:664-667`
```typescript
// Check trust requirements
if (minTrustRequired && minTrustRequired > 0) {
  // TODO: Check NPC trust level when that system is implemented
  // For now, assume trust is met
}
```
**Status:** LOW - Feature not implemented yet, but gracefully handled.

---

### TODO #3: Missing Integration Points

#### Crime Witnessing System
The `addCrimeBounty` method requires a `faction` parameter, but there's no apparent logic to determine WHICH faction witnessed the crime. The crime service just passes a faction, but how is it determined?

**Location to investigate:** `server/src/services/crime.service.ts:152-155`

#### Combat Integration
Bounty collection requires target to be defeated, but no clear integration with combat system:
```typescript
const isDefeated = target.isDead || target.isJailed || target.isKnockedOut;
```

Are these flags properly set by combat? Is there a race condition where status changes mid-collection?

#### Notification System
No notifications when:
- Someone places bounty on you
- Your bounty is collected
- Bounty hunter is tracking you
- Your placed bounty expires (with no refund!)

---

## 5. EXPLOIT POTENTIAL

### Exploit #1: Bounty Farming via Alt Accounts 🚨
**Severity:** HIGH

**Method:**
1. Create alt account (Character B)
2. Main account places minimum bounty (100 gold) on alt
3. Main account defeats alt in controlled fight
4. Main account collects 100 gold bounty
5. Net loss: 0 gold, but gains:
   - Bounty hunter reputation
   - Quest progress (if bounty collection is tracked)
   - Achievement progress
   - Combat XP from the fight

**Mitigation Ideas:**
- Minimum bounty should be higher (500-1000 gold)
- IP/device fingerprinting to detect alt accounts
- Cooldown on placing bounties on same character
- Bounty collection should not count toward achievements if placed by same account

---

### Exploit #2: Bounty Sniping via Logout Timing 🚨
**Severity:** MEDIUM

**Method:**
1. See high bounty on target
2. Defeat target
3. Before collecting, log out
4. Target respawns and leaves defeat state
5. Another hunter can't collect (target not defeated)
6. Original hunter logs back in, defeats again, collects

**Why it works:** The defeat check at collection time (`bounty.service.ts:228`) is separate from the actual combat. Status could reset.

**Fix:** Store "defeated by" field with timestamp, allow collection window.

---

### Exploit #3: Wanted Level Manipulation via Gold Duplication 🚨
**Severity:** HIGH (IF gold duplication exists elsewhere)

If there's ANY gold duplication bug in the game:
1. Duplicate gold
2. Place massive bounties on throwaway alt accounts
3. Collect them with main account
4. Even with transaction logs, the gold appears legitimate ("bounty reward")

**This is why the admin cancel endpoint is critical** - if exploits are discovered, admins need to quickly cancel fraudulent bounties.

---

### Exploit #4: Grief Attack via Bounty Spam 🚨
**Severity:** LOW-MEDIUM

**Method:**
1. Rich player targets victim
2. Places 100+ small bounties (100 gold each = 10,000 total)
3. Victim now has high wanted level
4. Bounty hunters constantly attack victim
5. Victim's gameplay is severely disrupted

**Mitigation:**
- Rate limit on placing bounties (not currently implemented)
- Maximum bounties per issuer per target (e.g., 5 max)
- Combine multiple player bounties on same target into one total

---

### Exploit #5: Hunter Payoff Arbitrage 🚨
**Severity:** LOW

**Current Logic:**
- Payoff amount = 150% of total bounty (`bountyHunter.service.ts:183`)
- You pay 1500 gold to avoid 1000 gold bounty

**Exploit:**
If player has 5000 gold bounty but only 100 gold in pocket:
1. Store 4900 gold with friend/bank
2. Get caught by hunter
3. Can't pay off (insufficient gold)
4. Fight/escape instead
5. If successful, saved 1500+ gold

**This isn't really exploitative** - it's smart gameplay. But the payoff system might need minimum gold check or debt mechanism.

---

## 6. PRIORITY RECOMMENDATIONS

### IMMEDIATE (Before Production Launch) 🔴

#### 1. Fix Admin Authorization (CRITICAL)
**File:** `server/src/controllers/bounty.controller.ts:267-289`
```typescript
export const cancelBounties = asyncHandler(async (req: Request, res: Response) => {
  // ADD THIS:
  if (!req.user?.isAdmin) {
    return res.status(HttpStatus.FORBIDDEN).json({
      success: false,
      error: 'Admin access required',
    });
  }
  // ... rest of function
});
```

#### 2. Implement Bounty Refunds on Expiration
**File:** `server/src/services/bounty.service.ts:555-578`

**Logic:**
```typescript
static async expireOldBounties(): Promise<number> {
  const bounties = await Bounty.find({
    status: BountyStatus.ACTIVE,
    expiresAt: { $lte: new Date() },
  });

  let expired = 0;
  for (const bounty of bounties) {
    // If player-placed, refund 50% to issuer
    if (bounty.bountyType === BountyType.PLAYER && bounty.issuerId) {
      const refundAmount = Math.floor(bounty.amount * 0.5);
      await GoldService.addGold(
        bounty.issuerId,
        refundAmount,
        TransactionSource.BOUNTY_REFUND,
        { bountyId: bounty._id, description: 'Bounty expired, partial refund' }
      );
    }

    bounty.status = BountyStatus.EXPIRED;
    await bounty.save();
    expired++;
  }

  return expired;
}
```

#### 3. Fix Player Bounty Faction Distribution
**File:** `server/src/services/bounty.service.ts:417-420`
```typescript
} else if (bounty.bountyType === BountyType.PLAYER) {
  // Player bounties count toward all factions equally
  const amountPerFaction = Math.floor(bounty.amount / 3);
  settlerAlliance += amountPerFaction;
  nahiCoalition += amountPerFaction;
  frontera += amountPerFaction;
}
```

#### 4. Add Character Deletion Cleanup
**File:** `server/src/models/Character.model.ts`
```typescript
CharacterSchema.pre('deleteOne', async function() {
  const characterId = this.getQuery()._id;

  // Cancel all bounties where this character is target
  await Bounty.updateMany(
    { targetId: characterId, status: BountyStatus.ACTIVE },
    { $set: { status: BountyStatus.CANCELLED } }
  );

  // Refund player-placed bounties where this character was issuer
  const issuedBounties = await Bounty.find({
    issuerId: characterId,
    status: BountyStatus.ACTIVE,
    bountyType: BountyType.PLAYER,
  });

  for (const bounty of issuedBounties) {
    // Refund to issuer... wait, they're being deleted!
    // Maybe just cancel and log gold loss
    bounty.status = BountyStatus.CANCELLED;
    await bounty.save();
  }
});
```

---

### HIGH PRIORITY (Next Sprint) 🟠

#### 5. Implement Bounty Placement Rate Limiting
**File:** `server/src/routes/bounty.routes.ts`

Add middleware:
```typescript
import { createRateLimiter } from '../middleware/rateLimiter';

const bountyPlaceLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 bounties per hour
  message: 'Too many bounties placed. Please wait before placing more.',
});

router.post('/place', bountyPlaceLimiter, placeBounty);
```

#### 6. Add Bounty Notifications
**Integration Points:**
- When bounty placed on you → Send notification
- When your bounty is collected → Send notification
- When bounty hunter spawns → Send notification
- When your placed bounty expires → Send notification with refund info

**Use existing notification system** (assuming it exists based on file structure).

#### 7. Fix Client-Server Type Alignment
Create proper DTOs in shared package that both client and server use.

#### 8. Add Location Filtering to Bounty Board
**File:** `server/src/services/bounty.service.ts:331-374`
```typescript
const query: any = {
  status: BountyStatus.ACTIVE,
  $or: [
    { expiresAt: null },
    { expiresAt: { $gt: new Date() } },
  ],
};

// Add location filter
if (location) {
  query.lastSeenLocation = location;
}

const bounties = await Bounty.find(query)
  .sort({ amount: -1, createdAt: -1 })
  .limit(limit);
```

---

### MEDIUM PRIORITY (Future Enhancement) 🟡

#### 9. Optimize Bounty Decay Performance
Use bulk operations instead of loop with individual saves.

#### 10. Remove Deprecated Methods
Clean up `shouldSpawnBountyHunter` and `getBountyHunterEncounter` or make them private.

#### 11. Add Bounty Placement Limits
- Max 5 active bounties per issuer on same target
- Combine multiple bounties into aggregate total
- Prevents grief attacks

#### 12. Enhanced Fraud Detection
- Track bounty placement patterns
- Flag suspicious bounty/collection loops
- Alert admins to potential alt account farming

---

## 7. ARCHITECTURAL OBSERVATIONS

### Strengths:
- Clean separation between Bounty and BountyHunter services
- Proper use of MongoDB transactions
- Background jobs for maintenance
- Rich domain model with instance methods

### Weaknesses:
- No clear event system (bounty events should trigger notifications)
- Client-server type mismatch
- Mixed responsibility (BountyService has both business logic and data access)
- No integration tests visible

---

## 8. TESTING RECOMMENDATIONS

### Critical Test Cases Missing:

1. **Bounty Collection Race Conditions**
   - Two hunters try to collect same bounty simultaneously
   - Target status changes mid-collection
   - Target deletes character mid-collection

2. **Gold Transaction Integrity**
   - Bounty placement fails mid-transaction
   - Collection fails mid-transaction
   - Verify rollbacks work

3. **Wanted Level Calculation**
   - Multiple bounties from different factions
   - Bounty decay effects
   - Rank threshold edge cases

4. **Expiration Edge Cases**
   - Bounty expires exactly at collection time
   - Multiple bounties expire in batch
   - Refund calculation

5. **Admin Functions**
   - Authorization checks
   - Cancel bounties for non-existent character
   - Cancel bounties during active collection

---

## 9. SECURITY ASSESSMENT

| Category | Grade | Notes |
|----------|-------|-------|
| **Authentication** | B | Basic auth required, but missing admin checks |
| **Authorization** | D | Critical admin endpoint unprotected |
| **Input Validation** | C+ | Some validation, but crime names not strict |
| **Transaction Integrity** | A | Excellent use of MongoDB sessions |
| **Rate Limiting** | F | No rate limiting on bounty placement |
| **Audit Logging** | B | Gold transactions logged, but not bounty actions |
| **Error Handling** | B+ | Proper try-catch, but some error messages too verbose |

---

## 10. FINAL VERDICT

### What Works:
- Core bounty mechanics are solid
- Transaction safety is excellent
- Wanted level system is well-designed
- Background maintenance jobs work
- Bounty hunter system is feature-rich

### What's Broken:
- Admin authorization missing (CRITICAL)
- No bounty refunds on expiration
- Client-server type mismatch
- Location filtering doesn't work
- Multiple exploit vectors exist

### What's Missing:
- Rate limiting
- Notification integration
- Character deletion cleanup
- Fraud detection
- Integration tests

### Production Readiness Score: 6.5/10

**Recommendation:** **DO NOT DEPLOY** to production until:
1. Admin authorization is fixed
2. Bounty refunds are implemented
3. Client-server types are aligned
4. Rate limiting is added
5. Character deletion cascade is implemented

**Timeline Estimate:** 3-5 days to fix critical issues, 1-2 weeks for high-priority items.

---

## APPENDIX: File Reference Map

### Server Files
- **Service:** `server/src/services/bounty.service.ts` (633 lines)
- **Service:** `server/src/services/bountyHunter.service.ts` (672 lines)
- **Model:** `server/src/models/Bounty.model.ts` (359 lines)
- **Controller:** `server/src/controllers/bounty.controller.ts` (290 lines)
- **Routes:** `server/src/routes/bounty.routes.ts` (80 lines)
- **Jobs:** `server/src/jobs/bountyCleanup.ts` (137 lines)

### Client Files
- **Store:** `client/src/store/useBountyStore.ts` (419 lines)
- **Service:** `client/src/services/bounty.service.ts` (308 lines)
- **Component:** `client/src/components/game/BountyBoard.tsx` (251 lines)

### Shared Files
- **Types:** `shared/src/types/bounty.types.ts` (271 lines)

### Total Lines of Code: ~3,420 lines

---

**End of Audit Report**
