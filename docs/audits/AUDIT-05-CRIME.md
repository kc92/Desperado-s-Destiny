# AUDIT 05: CRIME & OUTLAW SYSTEMS

**Audit Date:** 2025-12-15
**Systems Audited:** Crime, Bounty, Bounty Hunters, Jail, Disguise, Bribery
**Total Files Reviewed:** 15
**Severity Levels:** CRITICAL 🔴 | HIGH 🟠 | MEDIUM 🟡 | LOW 🟢

---

## EXECUTIVE SUMMARY

The Crime & Outlaw systems represent a moderately well-implemented feature set with good architectural separation. However, the implementation suffers from significant gaps in integration, missing backend functionality, incomplete validation, and potential race conditions. The systems show promise but require substantial hardening before production deployment.

**Overall Assessment:** ⚠️ **NEEDS SIGNIFICANT WORK**

### Key Findings:
- ✅ Good separation of concerns between systems
- ✅ Well-structured transaction handling in most services
- ✅ Comprehensive crime outcome template system (33,000+ combinations)
- ⚠️ Missing critical backend implementations (jail activities, disguise detection)
- ⚠️ Inconsistent integration between related systems
- ⚠️ Race conditions in bounty and wanted level updates
- ⚠️ Missing validation and error handling
- ⚠️ Incomplete admin authorization checks

---

## SYSTEM 1: CRIME SYSTEM

### Files Analyzed
- `server/src/controllers/crime.controller.ts` (397 lines)
- `server/src/services/crime.service.ts` (687 lines)
- `server/src/data/crimeOutcomeTemplates.ts` (1,155 lines)

### ✅ WHAT IT DOES RIGHT

#### 1. Comprehensive Crime Resolution Logic
**Lines: crime.service.ts:46-320**
```typescript
static async resolveCrimeAttempt(
  action: IAction,
  character: ICharacter,
  actionSuccess: boolean
): Promise<CrimeResolutionResult>
```
- Properly considers time-of-day modifiers
- Integrates weather effects
- Applies crowd-based detection modifiers
- Uses distributed locks to prevent race conditions (line 122)

#### 2. Rich Template System
**Lines: crimeOutcomeTemplates.ts:1-1155**
- Excellent content authoring system with 70+ base templates
- Variable substitution system for dynamic content
- Calculates to 33,000+ unique combinations
- Well-organized by crime type (robbery, pickpocket, burglary, etc.)
- Proper rarity weighting system

#### 3. Transaction Safety
**Lines: crime.service.ts:326-399**
```typescript
const session = await mongoose.startSession();
session.startTransaction();
```
- All gold operations use proper MongoDB sessions
- Consistent rollback on errors
- GoldService integration for transaction tracking

#### 4. Good Integration Points
- Integrates with QuestService for crime tracking (line 186-187)
- Updates reputation system appropriately (lines 189-209)
- Creates reputation spreading events (lines 212-268)

### ❌ WHAT'S WRONG

#### 🔴 CRITICAL: Race Condition in Bounty Creation
**Location: crime.service.ts:139-164**
```typescript
// BUG: This import and call happen INSIDE the lock but use a separate transaction
const { BountyService } = await import('./bounty.service');
await BountyService.addCrimeBounty(
  character._id.toString(),
  crimeName,
  faction,
  character.currentLocation
);
```

**Problem:** The bounty creation happens in a separate transaction from the crime resolution, creating a potential race condition where:
1. Crime resolves and increases wanted level
2. Bounty creation fails
3. Character has increased wanted level but no corresponding bounty
4. System state is inconsistent

**Impact:** Wanted level and bounty can become desynchronized, breaking the bounty hunting system.

**Fix Required:** Pass the session to BountyService.addCrimeBounty or handle bounty creation within the same transaction.

#### 🔴 CRITICAL: Crime Templates Never Actually Used
**Location: crimeOutcomeTemplates.ts:1-1155**

**Problem:** The entire crime outcome template system (1,155 lines of code) is NEVER REFERENCED anywhere in the codebase. Search reveals:
```bash
# No imports found
grep -r "crimeOutcomeTemplates" server/src/
# No usage found
grep -r "ROBBERY_TEMPLATES" server/src/
grep -r "getTemplatesByCrimeType" server/src/
```

**Impact:**
- 1,155 lines of dead code
- Claimed "33,000+ combinations" never actually generated
- Crime messages are hardcoded in crime.service.ts (lines 180-309)
- Wasted development effort

**Fix Required:** Either implement the template system or remove it entirely.

#### 🟠 HIGH: Missing Crime Type Validation
**Location: crime.service.ts:51-62**
```typescript
if (action.type !== ActionType.CRIME || !action.crimeProperties) {
  return {
    wasWitnessed: false,
    wasJailed: false,
    // ... returns success with default values
  };
}
```

**Problem:** Silently returns success for non-crime actions instead of throwing an error. This masks programming errors.

**Fix Required:** Throw an error or log a warning when called with invalid action type.

#### 🟠 HIGH: Hardcoded Witness NPC
**Location: crime.service.ts:252**
```typescript
const originNpcId = 'red-gulch-sheriff'; // Default witness
```

**Problem:** Always uses the same NPC as witness, regardless of location or context. Breaks immersion and makes reputation spreading unrealistic.

**Fix Required:** Dynamically select an appropriate NPC based on location.

#### 🟡 MEDIUM: Inconsistent Bail Cost Calculation
**Location: crime.controller.ts:377**
```typescript
const bailCost = character.wantedLevel * 50;
```
**vs**
**Location: crime.service.ts:352-354**
```typescript
const bailCost = character.lastBailCost > 0
  ? character.lastBailCost
  : character.wantedLevel * 50;
```

**Problem:** Controller calculates bail differently than service. Creates confusion and potential bugs.

**Fix Required:** Use a single source of truth for bail calculation.

#### 🟡 MEDIUM: No Cooldown on Arrests
**Location: crime.service.ts:490-612**

**Problem:** Players can spam arrest other players with no cooldown limit. Only checks `canArrestTarget()` but that's never implemented on the Character model (based on code review).

**Fix Required:** Implement actual arrest cooldown tracking.

### 🔍 LOGICAL GAPS

1. **No Crime Difficulty Scaling** - All crimes use the same witness detection formula regardless of crime severity
2. **Missing Crime Cooldowns** - Players can commit unlimited crimes back-to-back
3. **No Location-Based Restrictions** - Can commit any crime anywhere
4. **Missing Crime Prerequisites** - No level, skill, or item requirements
5. **No Crime Tutorial/Documentation** - Players won't understand the witness/wanted system

### 📝 INCOMPLETE IMPLEMENTATIONS

**Location: crime.service.ts:106-109**
```typescript
const crimeAvailability = TimeService.checkCrimeAvailability(
  action.name,
  baseWitnessChance
);
```
**Issue:** Result is calculated but never used. Dead code.

---

## SYSTEM 2: BOUNTY SYSTEM

### Files Analyzed
- `server/src/services/bounty.service.ts` (633 lines)
- `server/src/controllers/bounty.controller.ts` (290 lines)
- `server/src/routes/bounty.routes.ts` (80 lines)
- `server/src/jobs/bountyCleanup.ts` (137 lines)
- `server/src/models/Bounty.model.ts` (359 lines)

### ✅ WHAT IT DOES RIGHT

#### 1. Excellent Data Modeling
**Lines: Bounty.model.ts:1-359**
- Proper indexes for common queries (lines 225-237)
- Separate Bounty and WantedLevel models with clear responsibilities
- Good instance methods (isActive, canBeCollectedBy)
- Comprehensive static methods for common operations

#### 2. Proper Transaction Handling
**Lines: bounty.service.ts:98-183**
```typescript
const session = await mongoose.startSession();
session.startTransaction();
// ... operations
await session.commitTransaction();
```
- All state-changing operations use transactions
- Consistent error handling and rollback
- GoldService integration for payment tracking

#### 3. Well-Designed Bounty Board
**Lines: bounty.service.ts:331-374**
- Efficient query with proper filtering
- Enriches bounties with character data
- Sorted by amount and creation date
- Pagination support

#### 4. Automated Maintenance Jobs
**Lines: bountyCleanup.ts:1-137**
- Two separate cron jobs (expiration and decay)
- Proper distributed locking to prevent double-execution
- Configurable schedules
- Good logging

### ❌ WHAT'S WRONG

#### 🔴 CRITICAL: Race Condition in Wanted Level Updates
**Location: bounty.service.ts:379-451**
```typescript
static async updateWantedLevel(
  characterId: string,
  session?: mongoose.ClientSession
): Promise<IWantedLevel> {
  // Gets character WITHOUT using session
  const character = await Character.findById(characterId);

  // Gets bounties WITHOUT using session
  const bounties = await Bounty.find({...});

  // Only uses session for save
  await wantedLevel.save({ session });
}
```

**Problem:** The function accepts a session parameter but DOESN'T USE IT for reading data. This creates race conditions:
1. Transaction A: Crime creates bounty in session
2. Transaction B: updateWantedLevel reads bounties OUTSIDE session (doesn't see new bounty)
3. Transaction A: Commits
4. Transaction B: Saves wanted level WITHOUT the new bounty included
5. Result: Wanted level is incorrect

**Impact:** CRITICAL - Wanted levels will frequently be wrong, breaking the entire bounty hunting system.

**Fix Required:** Use session for ALL database operations when provided.

#### 🔴 CRITICAL: Dual Bounty Systems Create Confusion
**Location: Multiple files**

**Problem:** There are TWO separate bounty systems in the codebase:

1. **Old System (Character model)**:
   - `character.bountyAmount`
   - `character.wantedLevel`
   - Used by `CrimeService.arrestPlayer()` (crime.service.ts:561-566)

2. **New System (Bounty model)**:
   - `Bounty` collection
   - `WantedLevel` collection
   - Used by `BountyService`

These systems DON'T SYNC WITH EACH OTHER!

**Evidence:**
```typescript
// crime.service.ts:561-566 - Uses OLD system
const bountyAmount = target.bountyAmount;
target.wantedLevel = 0;
target.bountyAmount = 0;

// bounty.service.ts:404-421 - Uses NEW system
switch (bounty.issuerFaction) {
  case BountyFaction.SETTLER_ALLIANCE:
    settlerAlliance += bounty.amount;
```

**Impact:**
- Bounties tracked in both places
- No synchronization between systems
- Player confusion
- Exploits possible by gaming one system vs the other

**Fix Required:** Remove one system or properly sync them.

#### 🟠 HIGH: Player Bounties Expire But Faction Bounties Don't
**Location: bounty.service.ts:160-161**
```typescript
// Player bounties expire after 7 days
expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
```
**vs**
**Location: bounty.service.ts:71**
```typescript
// Faction bounties - no expiration
expiresAt: undefined,
```

**Problem:** Faction bounties never expire (only decay by 10% per day). This means:
- Old crimes stick forever
- Wanted level never truly clears
- No fresh start for reformed players

**Design Question:** Is this intentional? Should faction bounties have a max lifetime (e.g., 30 days)?

#### 🟠 HIGH: Bounty Decay Math Error
**Location: bountyCleanup.ts:71, bounty.service.ts:504-549**

**Cron Schedule:**
```typescript
cron.schedule('0 0 * * *', async () => {
  // "Run at midnight UTC every day"
```

**Decay Logic:**
```typescript
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
const bounties = await Bounty.find({
  createdAt: { $lte: oneDayAgo },
```

**Problem:** The job runs once per day, but it finds bounties created ≥24 hours ago. If a bounty was created 25 hours ago:
- Day 1 (midnight): 10% decay applied
- Day 2 (midnight): Another 10% decay applied
- Total decay: 19% instead of intended 10%

Bounties created shortly after midnight get double-decayed.

**Fix Required:** Track `lastDecayDate` and only decay if it's been ≥24h since last decay.

#### 🟡 MEDIUM: Missing Validation on Bounty Amount
**Location: bounty.service.ts:124-127**
```typescript
// Minimum bounty is 100 gold
if (amount < 100) {
  throw new Error('Minimum bounty is 100 gold');
}
```

**Missing:**
- No maximum bounty amount (players could place 999,999,999 gold bounty)
- No validation that amount is an integer
- No validation against player's actual gold balance BEFORE checking hasGold

**Fix Required:** Add comprehensive validation.

#### 🟡 MEDIUM: Deprecated Methods Not Removed
**Location: bounty.service.ts:454-498**
```typescript
/**
 * @deprecated Use BountyHunterService.checkHunterSpawn instead
 */
static shouldSpawnBountyHunter(wantedRank: WantedRank): boolean {
  // 45 lines of code
}

/**
 * @deprecated Use BountyHunterService.checkHunterSpawn instead
 */
static async getBountyHunterEncounter(characterId: string): Promise<{...}> {
  // 29 lines of code
}
```

**Problem:** Deprecated methods still present. Creates confusion and maintenance burden.

**Used By:** `bounty.controller.ts:255` still calls `getBountyHunterEncounter()`

**Fix Required:** Migrate controller to use new service, then remove deprecated methods.

### 🔍 LOGICAL GAPS

1. **No Bounty Pooling** - Multiple small bounties on same target aren't combined
2. **Missing Bounty Withdrawal** - Players can't cancel bounties they placed
3. **No Bounty Escrow** - Gold is deducted immediately, even if bounty never collected
4. **Missing Bounty Notifications** - Target not notified when bounty placed on them
5. **No Evidence System** - Bounties appear instantly without "wanted posters"

### 📝 INCOMPLETE IMPLEMENTATIONS

**Location: bounty.controller.ts:277-278**
```typescript
// TODO: Add admin authorization check
// For now, any authenticated user can cancel bounties (for testing)
```

**Impact:** SECURITY ISSUE - Any player can cancel any bounty!

---

## SYSTEM 3: BOUNTY HUNTERS

### Files Analyzed
- `server/src/services/bountyHunter.service.ts` (672 lines)
- `server/src/controllers/bountyHunter.controller.ts` (247 lines)
- `server/src/routes/bountyHunter.routes.ts` (55 lines)
- `server/src/jobs/hunterTracking.ts` (56 lines)

### ✅ WHAT IT DOES RIGHT

#### 1. Rich Hunter Data Integration
**Lines: bountyHunter.service.ts:18-23**
```typescript
import {
  BOUNTY_HUNTERS,
  getHunterById,
  getHuntersByTerritory,
  getHuntersForBounty,
  getHireableHunters,
} from '../data/bountyHunters';
```
- Imports from dedicated data file (not reviewed but referenced)
- Good separation of data from logic

#### 2. Sophisticated Encounter System
**Lines: bountyHunter.service.ts:159-212**
- Tracks hunter encounters in database
- Supports multiple encounter types (random, hired, story, patrol)
- Stores negotiation and payoff capabilities
- Proper session management

#### 3. Well-Designed Hiring System
**Lines: bountyHunter.service.ts:304-432**
- Cost calculation based on target's bounty
- Hire cooldowns prevent spam
- Proper gold deduction
- Creates active hunter tracking

#### 4. Automated Position Updates
**Lines: bountyHunter.service.ts:534-586**
- Decrements time until encounter
- Auto-creates encounter when hunter reaches target
- Cleans up expired hires

### ❌ WHAT'S WRONG

#### 🔴 CRITICAL: Missing Mongoose Schemas
**Location: bountyHunter.service.ts:34-83**
```typescript
const HunterEncounterSchema = new mongoose.Schema({
  hunterId: { type: String, required: true },
  // ...
});

const HunterEncounterModel = mongoose.model('HunterEncounter', HunterEncounterSchema);

const ActiveHunterSchema = new mongoose.Schema({
  hunterId: { type: String, required: true, unique: true },
  // ...
});

const ActiveHunterModel = mongoose.model('ActiveHunter', ActiveHunterSchema);
```

**Problem:** These schemas are defined IN THE SERVICE FILE, not in `/models/`. This violates MVC architecture and creates several issues:

1. **No TypeScript Interfaces** - No `IHunterEncounter` or `IActiveHunter` interfaces
2. **Can't Be Imported** - Other services can't reference these models
3. **No Instance Methods** - Can't add helper methods
4. **Testing Difficulty** - Can't mock models
5. **Duplicate Indexes** - Indexes defined twice (lines 60-62, 79-81)

**Impact:** Architecture violation, maintenance difficulty, potential bugs.

**Fix Required:** Move to proper model files with interfaces.

#### 🟠 HIGH: No Validation of Hunter Data
**Location: bountyHunter.service.ts:169**
```typescript
const hunter = getHunterById(hunterId);
if (!hunter) {
  throw new Error('Hunter not found');
}
```

**Problem:** No validation that:
- Hunter level is appropriate for target
- Hunter operates in current location
- Hunter exists in static data
- Hunter stats are valid

**Fix Required:** Add comprehensive validation.

#### 🟠 HIGH: Payment Deducted But Not Used
**Location: bountyHunter.controller.ts:69**
```typescript
const { hunterId, targetId, payment } = req.body as HireHunterRequest;
```

**Problem:** `payment` is extracted from request but NEVER USED. Service calculates cost independently (bountyHunter.service.ts:351-354). This creates potential exploits:
- Client sends `payment: 1`
- Server calculates `cost: 500`
- Who pays what?

**Fix Required:** Either remove payment from request or validate it matches calculated cost.

#### 🟡 MEDIUM: Weak Hunter Spawn Logic
**Location: bountyHunter.service.ts:89-156**
```typescript
const spawnChance = this.getSpawnChance(wantedLevel.wantedRank);
if (!SecureRNG.chance(spawnChance)) {
  return { shouldSpawn: false };
}
```

**Problem:** Spawn chance is:
- UNKNOWN: 0%
- PETTY_CRIMINAL: 0%
- OUTLAW: 5%
- NOTORIOUS: 15%
- MOST_WANTED: 30%

This means MOST_WANTED criminals only have 30% chance per check. When are these checks made? Not clear from code.

**Design Question:** Should this be cumulative (increases over time) or per-action?

#### 🟡 MEDIUM: Missing Contract Completion
**Location: bountyHunter.service.ts:547-562**
```typescript
if (activeHunter.hoursUntilEncounter <= 0) {
  await this.createEncounter(/* ... */);

  // Reset hunter
  activeHunter.targetId = undefined;
  activeHunter.hoursUntilEncounter = undefined;
}
```

**Problem:** When hunter finds target:
1. Encounter is created
2. Hunter is reset
3. What happens to the hire contract?
4. Does employer get refunded if hunter fails?
5. Is there a completion notification?

**Missing:** Contract resolution logic.

### 🔍 LOGICAL GAPS

1. **No Hunter Reputation** - All hunters are equally reliable
2. **Missing Hunter Inventory** - Hunters don't have equipment or stats
3. **No Multi-Hunter Encounters** - Only one hunter tracks at a time
4. **Missing Hunter AI** - No decision-making (always attacks on sight)
5. **No Hunter Dialogue** - Encounter system exists but no actual dialogue

### 📝 INCOMPLETE IMPLEMENTATIONS

**Location: bountyHunter.service.ts:664-667**
```typescript
if (minTrustRequired && minTrustRequired > 0) {
  // TODO: Check NPC trust level when that system is implemented
  // For now, assume trust is met
}
```

**Impact:** Trust requirements are completely bypassed.

---

## SYSTEM 4: JAIL SYSTEM

### Files Analyzed
- `server/src/services/jail.service.ts` (811 lines)
- `server/src/middleware/jail.middleware.ts` (275 lines)

### ✅ WHAT IT DOES RIGHT

#### 1. Comprehensive Jail State Management
**Lines: jail.service.ts:42-119**
```typescript
static async jailPlayer(
  characterId: string | mongoose.Types.ObjectId,
  sentence: number,
  reason: JailReason,
  bailAmount?: number,
  canBail: boolean = true,
  session?: mongoose.ClientSession
): Promise<JailState>
```
- Flexible session handling (internal or external)
- Proper transaction management
- Notification system integration
- Returns complete jail state

#### 2. Smart Middleware Architecture
**Lines: jail.middleware.ts:18-97**
```typescript
export async function preventActionsWhileJailed(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void>
```
- Auto-releases expired sentences
- Provides detailed error responses
- Flavor text for immersion
- Proper ownership verification

#### 3. Multiple Escape/Release Options
- Serve time (passive)
- Pay bail (gold)
- Escape attempt (skill-based)
- Bribe guard (gold + chance)
- Turned in by another player

#### 4. Location-Based Jail System
**Lines: jail.service.ts:647-672**
- Multiple jail locations
- Maps locations to jails
- Release to appropriate town square

### ❌ WHAT'S WRONG

#### 🔴 CRITICAL: Jail Activities Not Implemented
**Location: jail.service.ts:446-496**
```typescript
static async doJailActivity(
  characterId: string | mongoose.Types.ObjectId,
  activity: JailActivity
): Promise<JailActivityResult> {
  // ...
  switch (activity) {
    case JailActivity.PRISON_LABOR:
      result = await this.doPrisonLabor(character, session);
      break;

    case JailActivity.SOCIALIZE:
      result = await this.socialize(character, session);
      break;

    case JailActivity.WAIT:
      result = {
        success: true,
        activity: JailActivity.WAIT,
        message: 'You wait patiently in your cell...'
      };
      break;
```

**But cooldown checking is stubbed:**
```typescript
// Lines 724-731
private static checkActivityCooldown(
  character: ICharacter,
  activity: JailActivity
): { canPerform: boolean; minutesRemaining: number } {
  // This would need to be tracked in character model
  // For now, always allow
  return { canPerform: true, minutesRemaining: 0 };
}
```

**And recording is stubbed:**
```typescript
// Lines 736-739
private static recordActivityAttempt(character: ICharacter, activity: JailActivity): void {
  // Would need to track this in character model
  logger.debug(`Activity attempted: ${character.name} - ${activity}`);
}
```

**Problem:**
1. Players can spam prison labor infinitely (no cooldown)
2. Players can make infinite gold while jailed
3. Activities are tracked nowhere
4. Completely exploitable

**Impact:** CRITICAL EXPLOIT - Infinite gold generation.

**Fix Required:** Implement proper cooldown tracking in Character model.

#### 🔴 CRITICAL: Jail Escape Increases Wanted Level
**Location: jail.service.ts:183-253**

**Problem:** Current implementation:
1. Player escapes jail successfully
2. Player is released (line 211)
3. NO wanted level increase
4. Player faces no consequences

**This is unrealistic and exploitable:** Players should get HIGHER wanted levels for escaping, not just more jail time on failure.

**Fix Required:** Add wanted level increase on successful escape.

#### 🟠 HIGH: Bribe Mechanics Allow Infinite Attempts
**Location: jail.service.ts:258-357**
```typescript
// Check cooldown
const cooldown = this.checkActivityCooldown(character, JailActivity.BRIBE_GUARD);
if (!cooldown.canPerform) {
  throw new Error(`Must wait ${cooldown.minutesRemaining} minutes...`);
}
```

**Problem:** Cooldown check is stubbed (always returns true). Players can:
1. Attempt bribe
2. If rejected, lose half gold (line 329)
3. Immediately try again with remaining gold
4. Repeat until out of gold or successful

**Impact:** Bribery becomes "keep trying until you succeed" rather than a strategic decision.

**Fix Required:** Implement actual cooldown (e.g., 1 hour between bribe attempts).

#### 🟠 HIGH: Turn-In System Bypasses Bounty System
**Location: jail.service.ts:501-596**
```typescript
static async turnInPlayer(
  hunterId: string | mongoose.Types.ObjectId,
  targetId: string | mongoose.Types.ObjectId
): Promise<TurnInResult> {
  // Uses old bounty system
  const baseBounty = target.bountyAmount;
  const bountyReward = Math.floor(baseBounty * BOUNTY_TURN_IN_MULTIPLIER);

  // Awards gold directly
  await GoldService.addGold(/* ... */);

  // Reduces wanted level by 1
  target.decreaseWantedLevel(1);
}
```

**Problem:** This uses the OLD character.bountyAmount system, NOT the new Bounty collection system. Creates:
- Dual bounty tracking (as identified earlier)
- Inconsistent rewards
- Bounty collection via two different paths

**Fix Required:** Integrate with proper BountyService.

#### 🟡 MEDIUM: Jail Stats Never Collected
**Location: jail.service.ts:623-640**
```typescript
static async getJailStats(
  characterId: string | mongoose.Types.ObjectId
): Promise<JailStats> {
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

**Problem:** All stats hardcoded to 0. Function is useless.

**Impact:** No jail statistics tracking, achievements, or leaderboards possible.

#### 🟡 MEDIUM: Escape Chance Calculation Weakness
**Location: jail.service.ts:701-719**
```typescript
private static calculateEscapeChance(character: ICharacter): number {
  let chance = JAIL_ACTIVITIES.escape_attempt.baseSuccessChance;

  // Cunning skill increases escape chance
  const cunningBonus = character.stats.cunning * 0.01;
  chance += cunningBonus;

  // Check for relevant skills
  for (const skill of character.skills) {
    if (skill.skillId.toLowerCase().includes('stealth') ||
        skill.skillId.toLowerCase().includes('lockpick') ||
        skill.skillId.toLowerCase().includes('escape')) {
      chance += skill.level * 0.02;
    }
  }

  // Cap at 75% max chance
  return Math.min(0.75, chance);
}
```

**Problems:**
1. Uses string matching on skill IDs (fragile)
2. No validation that skills actually exist
3. Bonus stacks infinitely (if player has "stealth", "stealth_master", "stealth_expert")
4. Cunning bonus very weak (need 100 cunning for +100%)

**Fix Required:** Use skill enumeration instead of string matching.

### 🔍 LOGICAL GAPS

1. **No Jail Sentence Modifiers** - All crimes jail for fixed time
2. **Missing Parole System** - No early release for good behavior
3. **No Jail Reputation** - Other prisoners don't remember you
4. **Missing Work Credits** - Prison labor doesn't reduce sentence
5. **No Jail Gangs/Factions** - No social dynamics in jail

### 📝 INCOMPLETE IMPLEMENTATIONS

**Location: jail.service.ts:601-617**
```typescript
static getJailInfo(character: ICharacter): JailState {
  return {
    // ...
    sentence: character.isJailed && character.jailedUntil
      ? Math.floor((character.jailedUntil.getTime() - Date.now() + character.getRemainingJailTime() * 60 * 1000) / (60 * 1000))
      : 0,
    reason: null, // Would need to track this
```

**Impact:** Jail reason never displayed to player.

---

## SYSTEM 5: DISGUISE SYSTEM

### Files Analyzed
- `server/src/services/disguise.service.ts` (331 lines)
- `server/src/controllers/disguise.controller.ts` (187 lines)
- `server/src/routes/disguise.routes.ts` (64 lines)

### ✅ WHAT IT DOES RIGHT

#### 1. Well-Designed Disguise Types
**Lines: disguise.service.ts:24-79**
```typescript
export const DISGUISE_TYPES: DisguiseType[] = [
  {
    id: 'settler_clothes',
    name: 'Settler Clothes',
    description: 'Plain work clothes...',
    faction: 'settler',
    wantedReduction: 2,
    durationMinutes: 30,
    cost: 50,
  },
  // 6 total disguise types
];
```
- Good variety of disguises
- Clear cost/benefit tradeoff
- Faction-specific and neutral options

#### 2. Simple But Effective Detection System
**Lines: disguise.service.ts:236-286**
```typescript
const detectionChance = 5 + buildingDangerLevel + character.wantedLevel * 3;
const detected = SecureRNG.chance(detectionChance / 100);
```
- Scales with wanted level
- Considers location danger
- Auto-removes disguise on detection

#### 3. Clean Controller Implementation
**Lines: disguise.controller.ts:1-187**
- Proper validation
- Good error messages
- Consistent response format

### ❌ WHAT'S WRONG

#### 🔴 CRITICAL: Disguise System Never Checked
**Location: Search across codebase**

```bash
# Search for disguise checks in action/crime systems
grep -r "checkDetection\|currentDisguise" server/src/services/*.service.ts
# Only found in disguise.service.ts itself
```

**Problem:** The disguise system exists but is NEVER INTEGRATED with:
- Crime system (should reduce detection chance)
- Building access (should bypass wanted level restrictions)
- Bounty hunter spawns (should prevent encounters)
- NPC interactions (should affect dialogue)

**Impact:** DEAD FEATURE - Players can equip disguises but they DO NOTHING except exist in the database.

**Fix Required:** Integrate disguise checks into all relevant systems.

#### 🟠 HIGH: Disguise Doesn't Reduce Wanted Level
**Location: disguise.service.ts:24-79**

**Definition:**
```typescript
wantedReduction: 2, // How much it reduces wanted level
```

**But in code:**
```typescript
// Lines 236-286 - Detection system
// No code that actually reduces wanted level
// Only prevents detection
```

**Problem:** Property `wantedReduction` is defined but never used. Disguises don't actually reduce effective wanted level.

**Design Conflict:** Should disguises:
1. Reduce effective wanted level (as property suggests)?
2. Only prevent detection (as code implements)?

**Fix Required:** Clarify and implement consistent behavior.

#### 🟠 HIGH: Required Items Not Enforced
**Location: disguise.service.ts:148-157**
```typescript
// Check required items
if (disguise.requiredItems && disguise.requiredItems.length > 0) {
  const hasItems = disguise.requiredItems.every((itemId) =>
    character.inventory.some((inv) => inv.itemId === itemId && inv.quantity > 0)
  );
  if (!hasItems) {
    return { success: false, message: 'Missing required items for disguise' };
  }
}
```

**Problem:**
1. Code checks for required items
2. But NONE of the disguise types define `requiredItems`
3. Property is always `undefined`
4. Check never triggers

**Impact:** Dead code, wasted complexity.

**Fix Required:** Either add required items to disguises or remove the check.

#### 🟡 MEDIUM: No Inventory Consumption
**Location: disguise.service.ts:99-199**

**Problem:** When applying disguise:
1. Gold is deducted (line 160-170)
2. Items are checked (line 148-157)
3. Items are NEVER consumed/removed from inventory

**This means:**
- One-time item requirements persist forever
- No consumable disguise mechanics
- Unrealistic inventory management

**Fix Required:** Decide if disguises should consume items or be permanent unlocks.

#### 🟡 MEDIUM: Faction Disguise Has No Effect
**Location: disguise.service.ts:176**
```typescript
character.disguiseFaction = disguise.faction;
```

**Problem:** Faction is stored but never checked:
```bash
grep -r "disguiseFaction" server/src/
# Only assignments, no reads
```

**Impact:** Faction-specific disguises provide no faction-specific benefits.

**Fix Required:** Integrate faction disguise with NPC interactions and reputation.

### 🔍 LOGICAL GAPS

1. **No Disguise Quality Levels** - All disguises equally effective
2. **Missing Custom Disguises** - Can't create unique disguises
3. **No Disguise Wear/Tear** - Disguises last forever (until removed)
4. **Missing Social Disguises** - No merchant/priest actual interactions
5. **No Disguise Combinations** - Can't layer disguises

### 📝 INCOMPLETE IMPLEMENTATIONS

**None identified** - System is minimal but what exists is complete. Problem is lack of integration.

---

## SYSTEM 6: BRIBERY SYSTEM

### Files Analyzed
- `server/src/services/bribe.service.ts` (211 lines)
- `server/src/controllers/bribe.controller.ts` (190 lines)
- `server/src/routes/bribe.routes.ts` (49 lines)

### ✅ WHAT IT DOES RIGHT

#### 1. Dual Bribe Types
**Lines: bribe.service.ts:1-211**
- Guard bribes for access (fixed cost)
- NPC bribes for information (variable cost with success chance)
- Different mechanics for different use cases

#### 2. Good Success Calculation
**Lines: bribe.service.ts:121-126**
```typescript
const baseChance = 50;
const amountBonus = Math.min(30, amount / 10);
const cunningBonus = character.stats.cunning * 2;
const successChance = baseChance + amountBonus + cunningBonus;
```
- Scales with bribe amount
- Character skill matters
- Has min/max bounds

#### 3. Proper Gold Handling
**Lines: bribe.service.ts:129-172**
- Failed bribes lose half the gold
- Transaction tracking
- Session-safe operations

### ❌ WHAT'S WRONG

#### 🔴 CRITICAL: Bribe System Never Called
**Location: Search across codebase**

```bash
grep -r "bribeGuard\|bribeNPC" server/src/ --exclude-dir=controllers --exclude-dir=routes
# Only found in bribe.service.ts itself
```

**Problem:** Like the disguise system, bribery exists but is NEVER INTEGRATED:
- No building access checks call `bribeGuard()`
- No NPC interactions call `bribeNPC()`
- Routes exist but nothing triggers them

**Impact:** DEAD FEATURE - Players can call API endpoints but nothing in the game uses bribes.

**Fix Required:** Integrate with building access and NPC dialogue systems.

#### 🟠 HIGH: Criminal Reputation Has No Effect
**Location: bribe.service.ts:66, 143**
```typescript
character.criminalReputation = Math.min(100, (character.criminalReputation || 0) + 1);
```

**Problem:** Criminal reputation is:
1. Incremented on bribe
2. Capped at 100
3. Saved to database
4. NEVER READ OR USED

```bash
grep -r "criminalReputation" server/src/ | grep -v "="
# Only assignments, no reads
```

**Impact:** Reputation tracking is pointless.

**Fix Required:** Either use criminal reputation in gameplay or remove tracking.

#### 🟠 HIGH: No Bribe Refusal Consequences
**Location: bribe.service.ts:158-176**
```typescript
} else {
  // Failed bribe - still lose some gold
  const lostAmount = Math.floor(amount / 2);
  // ...
  return {
    success: false,
    goldSpent: lostAmount,
    message: `"How dare you! Get out of my sight!" You lost ${lostAmount} gold.`,
  };
}
```

**Problem:** When NPC refuses bribe:
1. Player loses gold (good)
2. NO wanted level increase
3. NO reputation loss
4. NO other consequences

**Realistic consequences should include:**
- Wanted level +1 (attempted bribery)
- Reputation loss with NPC's faction
- Possibly being reported to authorities

**Fix Required:** Add proper consequences for failed bribes.

#### 🟡 MEDIUM: Guard Bribe Always Succeeds
**Location: bribe.service.ts:24-88**
```typescript
static async bribeGuard(
  characterId: string,
  buildingId: string,
  bribeCost: number
): Promise<BribeResult> {
  // ...
  // Deduct gold
  await GoldService.deductGold(/* ... */);

  // No chance check - always succeeds
  return {
    success: true,
    goldSpent: bribeCost,
    accessGranted: true,
```

**Problem:** Guard bribes ALWAYS succeed (no chance roll). This is:
- Unrealistic (guards should sometimes refuse)
- Exploitable (guaranteed access for gold)
- Less interesting gameplay

**Compare to NPC bribes which have success chance.**

**Fix Required:** Add success chance based on wanted level and amount.

#### 🟡 MEDIUM: Recommended Bribe Calculation Is Too Simple
**Location: bribe.service.ts:194-207**
```typescript
static calculateRecommendedBribe(
  npcFaction: string | undefined,
  characterFaction: string,
  requestDifficulty: number // 1-10
): number {
  let baseCost = requestDifficulty * 10;

  // Cross-faction bribes cost more
  if (npcFaction && npcFaction !== characterFaction) {
    baseCost *= 1.5;
  }

  return Math.floor(baseCost);
}
```

**Problems:**
1. Only considers faction and difficulty
2. Doesn't consider NPC's role/importance
3. Doesn't scale with game economy
4. 1.5x multiplier is arbitrary
5. Doesn't consider player's reputation

**Fix Required:** More sophisticated calculation considering multiple factors.

### 🔍 LOGICAL GAPS

1. **No Bribe History** - NPCs don't remember past bribes
2. **Missing Witness System** - No one sees you bribing
3. **No Escalation** - Can't increase bribe if refused
4. **Missing Evidence** - No paper trail of bribes
5. **No Bribe Blackmail** - Can't be blackmailed for past bribes

### 📝 INCOMPLETE IMPLEMENTATIONS

**Location: bribe.controller.ts:149-188**
```typescript
static async getBuildingOptions(req: Request, res: Response): Promise<void> {
  // Calculate bribe costs based on wanted level
  const baseBribeCost = 50;
  const wantedMultiplier = 1 + (character.wantedLevel * 0.5);
  const bribeCost = Math.floor(baseBribeCost * wantedMultiplier);

  // Returns calculated values but...
  // No actual building data fetched
  // No actual guard stats checked
  // Just math
}
```

**Impact:** Endpoint exists but provides limited value.

---

## CROSS-SYSTEM ISSUES

### 🔴 CRITICAL: Dual Bounty System Desynchronization

**The Smoking Gun:**

**Old System (Character model):**
```typescript
// character.model.ts
interface ICharacter {
  wantedLevel: number;
  bountyAmount: number;
  lastWantedDecay: Date;
}
```

**New System (Bounty model):**
```typescript
// Bounty.model.ts
interface IBounty {
  targetId: ObjectId;
  amount: number;
  // ...
}

interface IWantedLevel {
  characterId: ObjectId;
  settlerAlliance: number;
  nahiCoalition: number;
  frontera: number;
  totalBounty: number;
  wantedRank: WantedRank;
}
```

**Systems Using OLD:**
- `crime.controller.ts:377` - `character.wantedLevel * 50`
- `crime.service.ts:561-566` - `target.bountyAmount`, `target.wantedLevel = 0`
- `jail.service.ts:520` - `target.wantedLevel < WANTED_ARREST_THRESHOLD`
- `jail.middleware.ts:66` - `character.wantedLevel`

**Systems Using NEW:**
- `bounty.service.ts` - Everything
- `bountyHunter.service.ts:100` - `BountyService.getWantedLevel()`

**Impact:**
1. Crime creates bounties in NEW system
2. Jail checks wanted level in OLD system
3. Values diverge
4. Bounty hunters see different wanted level than jail does
5. Complete system breakdown

**Fix Required:** URGENT - Pick one system and migrate all code to use it.

### 🔴 CRITICAL: No Integration Between Systems

**Disguise System:**
- Defines `wantedReduction` but crime system doesn't check it
- Detection system exists but is never called
- Faction disguises stored but never used

**Bribery System:**
- Guard bribes defined but no access checks use them
- NPC bribes work but no NPCs request them
- Criminal reputation tracked but never impacts gameplay

**Jail System:**
- Escape increases wanted level but bounty system doesn't know
- Turn-in bypasses bounty collection
- Activities don't integrate with any progression systems

**Impact:** Features exist in isolation, not as cohesive gameplay systems.

### 🟠 HIGH: Inconsistent Gold Transaction Sources

**Location: Multiple files**

```typescript
// Different transaction sources used inconsistently
TransactionSource.BAIL_PAYMENT // Used in crime.service.ts AND jail.service.ts
TransactionSource.BOUNTY_REWARD // Used in crime.service.ts, bounty.service.ts, jail.service.ts
TransactionSource.BRIBE // Used in jail.service.ts AND bribe.service.ts
TransactionSource.DISGUISE_PURCHASE // Only in disguise.service.ts
TransactionSource.BOUNTY_PAYOFF // Only in bountyHunter.service.ts
TransactionSource.HIRE_HUNTER // Only in bountyHunter.service.ts
```

**Problem:** Some sources used in multiple places (good), others only in one place. Creates confusion about which transactions belong where.

**Fix Required:** Standardize transaction source usage across all systems.

### 🟡 MEDIUM: No Unified Crime/Punishment Flow

**Current State:**
1. **Crime** → Creates bounty (maybe)
2. **Bounty** → Exists independently
3. **Jail** → Uses old wanted level
4. **Disguise** → Not connected
5. **Bribe** → Not connected

**What SHOULD Happen:**
1. Player commits crime
2. Witness chance checked (modified by disguise if worn)
3. If witnessed, bounty created
4. Bounty hunters potentially spawn based on total bounty
5. If caught, jail sentence determined by crime + wanted level
6. In jail, can bribe guard or escape
7. If escape, wanted level increases further
8. Disguise allows temporary evasion

**Fix Required:** Design and implement unified crime flow.

---

## PERFORMANCE ISSUES

### 🟠 HIGH: Unbounded Queries

**Location: bounty.service.ts:666-680**
```typescript
const wanted = await Character.find({
  wantedLevel: { $gte: 3 },
  isJailed: false,
  isActive: true
}).select('name level wantedLevel bountyAmount currentLocation lastActive');
```

**Problem:** No limit on query. If 10,000 players have wanted level ≥3, this returns ALL of them.

**Fix Required:** Add limit and pagination.

**Location: bounty.service.ts:336-344**
```typescript
const bounties = await Bounty.find({
  status: BountyStatus.ACTIVE,
  // ...
})
  .sort({ amount: -1, createdAt: -1 })
  .limit(limit); // Good! But...
```

**Problem:** Sorts THEN limits. MongoDB must sort all active bounties before applying limit. If there are 100,000 active bounties, this is slow.

**Fix Required:** Add compound index on `(status, amount, createdAt)` to enable index-supported sort.

### 🟡 MEDIUM: N+1 Query Problem

**Location: bounty.service.ts:349-366**
```typescript
for (const bounty of bounties) {
  const target = await Character.findById(bounty.targetId).select('level');
  const wantedLevel = await WantedLevel.findOne({ characterId: bounty.targetId });

  entries.push({/* ... */});
}
```

**Problem:** For each bounty (up to 50), makes 2 additional queries. If limit=50:
- 1 query for bounties
- 50 queries for characters
- 50 queries for wanted levels
- Total: 101 queries

**Fix Required:** Use `$lookup` aggregation or batch queries.

### 🟡 MEDIUM: Inefficient Bounty Decay

**Location: bounty.service.ts:504-549**
```typescript
const bounties = await Bounty.find({
  status: BountyStatus.ACTIVE,
  bountyType: BountyType.FACTION,
  createdAt: { $lte: oneDayAgo },
  amount: { $gt: 10 },
});

for (const bounty of bounties) {
  const reduction = Math.floor(bounty.amount * 0.1);
  if (reduction > 0) {
    bounty.amount -= reduction;
    // ...
    await bounty.save();

    // Update wanted level for this character
    await this.updateWantedLevel(bounty.targetId.toString());
  }
}
```

**Problem:**
1. Fetches all bounties into memory
2. Updates each individually (N queries)
3. Updates wanted level for each (N more queries)
4. If same character has multiple bounties, updates wanted level multiple times

**Fix Required:** Use `updateMany` and batch wanted level updates.

---

## SECURITY ISSUES

### 🔴 CRITICAL: Admin Endpoint Unprotected
**Location: bounty.controller.ts:277-289**
```typescript
/**
 * Admin: Cancel all bounties for a character
 */
export const cancelBounties = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Add admin authorization check
  // For now, any authenticated user can cancel bounties (for testing)

  const cancelled = await BountyService.cancelBounties(characterId);
```

**Impact:** ANY PLAYER can cancel ANY bounties by calling this endpoint.

**Fix Required:** Add admin role check immediately.

### 🟠 HIGH: No Rate Limiting on Expensive Operations

**Operations that should be rate-limited:**
1. **Place Bounty** - Could spam bounties
2. **Escape Attempt** - Should have cooldown (stubbed)
3. **Bribe Attempt** - Should have cooldown (stubbed)
4. **Hire Hunter** - Could spam hires

**Fix Required:** Add rate limiting middleware to these endpoints.

### 🟠 HIGH: Character Ownership Not Always Verified

**Location: bounty.controller.ts:70-108**
```typescript
export const getCharacterBounties = asyncHandler(async (req: Request, res: Response) => {
  const { characterId } = req.params;
  // ...
  const bounties = await BountyService.getActiveBounties(characterId);
  // No ownership check - any player can see any character's bounties
```

**Impact:** Information leak - players can see other players' bounties without proper authorization.

**Fix Required:** Add ownership verification or document that this is public information.

### 🟡 MEDIUM: No Input Sanitization

**Location: Multiple controllers**

**Examples:**
```typescript
// bounty.controller.ts:125
const { targetId, amount, reason } = req.body;
// 'reason' is user input, stored directly in database

// bribe.service.ts:28
buildingId: string,
// buildingId is user input, used in queries
```

**Problem:** No sanitization of string inputs. Potential for:
- NoSQL injection
- XSS if displayed in UI
- Database pollution

**Fix Required:** Add input validation and sanitization middleware.

---

## RECOMMENDATIONS

### IMMEDIATE (Do Before Production)

1. **🔴 Fix Dual Bounty System**
   - Pick ONE system (recommend NEW system)
   - Migrate all code to use it
   - Remove or deprecate old system
   - Add migration script for existing data

2. **🔴 Fix Race Conditions**
   - Pass sessions to all `updateWantedLevel()` calls
   - Pass sessions to `BountyService.addCrimeBounty()`
   - Test concurrent crime resolution

3. **🔴 Implement Jail Activity Cooldowns**
   - Add cooldown tracking to Character model
   - Implement `checkActivityCooldown()`
   - Implement `recordActivityAttempt()`
   - Add cooldown bypass for testing

4. **🔴 Secure Admin Endpoints**
   - Add admin role middleware
   - Apply to `cancelBounties` and any other admin functions
   - Add audit logging for admin actions

5. **🔴 Remove Dead Code**
   - Delete `crimeOutcomeTemplates.ts` OR implement it
   - Remove deprecated bounty hunter methods
   - Clean up unused imports

### HIGH PRIORITY (Do Soon)

6. **🟠 Integrate Disguise System**
   - Add disguise checks to crime witness calculation
   - Add disguise checks to bounty hunter spawn
   - Add disguise checks to building access
   - Implement faction disguise benefits

7. **🟠 Integrate Bribery System**
   - Add bribe options to building access
   - Add bribe options to NPC dialogues
   - Implement guard bribe success chance
   - Add consequences for failed bribes

8. **🟠 Fix Bounty Decay Math**
   - Add `lastDecayDate` to Bounty model
   - Only decay if ≥24h since last decay
   - Test decay scheduling

9. **🟠 Optimize Database Queries**
   - Add compound indexes
   - Convert N+1 queries to batch operations
   - Add pagination to unbounded queries

10. **🟠 Move Mongoose Schemas to Models**
    - Create `HunterEncounter.model.ts`
    - Create `ActiveHunter.model.ts`
    - Add proper TypeScript interfaces
    - Add instance methods

### MEDIUM PRIORITY (Polish & Enhancement)

11. **🟡 Implement Jail Stats Tracking**
    - Create JailHistory model
    - Record all jail events
    - Implement stat queries
    - Add achievements

12. **🟡 Add Comprehensive Validation**
    - Validate bounty amounts (min/max)
    - Validate bribe amounts
    - Sanitize string inputs
    - Add schema validation

13. **🟡 Unify Crime/Punishment Flow**
    - Design unified flow diagram
    - Document system interactions
    - Implement integration points
    - Add end-to-end tests

14. **🟡 Improve Error Messages**
    - Add specific error codes
    - Improve client-facing messages
    - Add context to error responses

15. **🟡 Add Rate Limiting**
    - Implement per-endpoint rate limits
    - Add rate limit headers
    - Add rate limit bypass for testing

### NICE TO HAVE (Future)

16. **🟢 Enhanced Bounty System**
    - Bounty pooling
    - Bounty withdrawal
    - Evidence/poster system
    - Bounty notifications

17. **🟢 Advanced Jail Features**
    - Parole system
    - Work credits reduce sentence
    - Jail gangs/factions
    - Jail reputation

18. **🟢 Hunter Improvements**
    - Hunter reputation
    - Multi-hunter encounters
    - Hunter AI/decision-making
    - Actual dialogue system

19. **🟢 Disguise Enhancements**
    - Quality levels
    - Custom disguises
    - Wear and tear
    - Disguise combinations

20. **🟢 Bribery Depth**
    - Bribe history/memory
    - Bribe blackmail
    - Witness system
    - Escalating bribes

---

## TESTING REQUIREMENTS

### Unit Tests Needed
- [ ] Crime resolution (all outcome paths)
- [ ] Bounty creation and collection
- [ ] Wanted level calculation
- [ ] Jail sentence calculation
- [ ] Disguise detection
- [ ] Bribe success chance
- [ ] Hunter spawn logic

### Integration Tests Needed
- [ ] Crime → Bounty flow
- [ ] Bounty → Hunter spawn flow
- [ ] Arrest → Jail flow
- [ ] Escape → Wanted level flow
- [ ] Disguise → Crime detection flow
- [ ] Bribe → Access flow

### Load Tests Needed
- [ ] Concurrent crime resolution
- [ ] Bounty board with 1000+ bounties
- [ ] Hunter position updates with 100+ active hunters
- [ ] Jail activity spam attempts

---

## CONCLUSION

The Crime & Outlaw systems show good architectural thinking but suffer from incomplete implementation and poor integration. The biggest issues are:

1. **Dual bounty systems** that don't sync
2. **Missing integration** between related systems
3. **Stubbed implementations** in critical areas
4. **Dead code** that was never connected
5. **Security gaps** in admin functions

**Estimated Fix Effort:**
- CRITICAL fixes: 3-5 days
- HIGH priority: 5-7 days
- MEDIUM priority: 7-10 days
- Total: 15-22 days to production-ready

**Risk Assessment:**
- Current state: **HIGH RISK** - Multiple critical bugs
- After CRITICAL fixes: **MEDIUM RISK** - Functional but limited
- After HIGH priority: **LOW RISK** - Production-ready
- After MEDIUM priority: **VERY LOW RISK** - Polished

The systems have good bones but need significant work before launch.
