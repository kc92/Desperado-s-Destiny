# AUDIT 17: COMPETITIVE SYSTEMS - COMPREHENSIVE ANALYSIS

**Audit Date:** 2025-12-15
**Systems Analyzed:** Tournament System, Shooting Contests, Gambling System, Leaderboards
**Files Reviewed:** 15 service files, 9 model files, 6 controller files, 4 route files
**Severity Scale:** CRITICAL > HIGH > MEDIUM > LOW > INFO

---

## EXECUTIVE SUMMARY

The competitive systems in Desperados Destiny provide players with multiple avenues for competitive gameplay including tournaments, shooting contests, gambling, and leaderboards. This audit reveals a **mixed implementation** with some systems being well-architected while others contain critical issues that could lead to exploits, data loss, and poor player experience.

### Overall Assessment
- **Tournament System (Dual Implementation):** MEDIUM - Two separate tournament systems exist with different purposes but some overlap
- **Shooting Contests:** HIGH - Well-designed but missing critical features and has implementation gaps
- **Gambling System:** MEDIUM - Good security improvements but logical issues and incomplete features
- **Leaderboard System:** LOW - Simple but functional, lacks features and optimization
- **Cheating Detection:** MEDIUM - Basic implementation with TODOs that need completion

### Critical Findings
1. **Two separate tournament systems** causing confusion and potential data inconsistencies
2. **In-memory game state storage** that will be lost on server restart (Line 41, tournament.service.ts)
3. **Missing entry fee refunds** in shooting contest cancellations (Line 607, shootingContest.service.ts)
4. **Race conditions** in tournament match resolution
5. **Incomplete gambling item integration** (TODOs in cheating.service.ts)
6. **Missing leaderboard features** for competitive systems

---

## SYSTEM 1: TOURNAMENT SYSTEM

### Architecture Overview

**DUAL IMPLEMENTATION DETECTED:**
1. **tournament.service.ts** - Deck game tournaments (poker variants)
2. **tournamentManager.service.ts** - Poker tournament manager

This is either intentional separation or architectural debt that needs clarification.

### What It Does RIGHT ✅

#### 1. Solid Bracket Generation (tournament.service.ts)
```typescript
// Lines 233-280: Clean bracket generation algorithm
const matches: TournamentMatch[] = [];
const numParticipants = shuffled.length;

// Calculate bracket size (next power of 2)
let bracketSize = 2;
while (bracketSize < numParticipants) {
  bracketSize *= 2;
}

// Number of byes needed
const numByes = bracketSize - numParticipants;
```
**STRENGTH:** Properly handles bracket sizing, byes, and advancement logic.

#### 2. Distributed Locking for Tournament Registration
```typescript
// Lines 97-163: Proper locking to prevent race conditions
export async function joinTournament(
  tournamentId: string,
  characterId: string
): Promise<ITournament> {
  return withLock(`lock:tournament:${tournamentId}`, async () => {
    // ... registration logic
  }, { ttl: 30, retries: 3 });
}
```
**STRENGTH:** Uses distributed locks to prevent concurrent registration issues.

#### 3. Comprehensive Match State Tracking
```typescript
// Lines 20-39: Well-defined game state structure
interface TournamentGameState {
  tournamentId: string;
  matchId: string;
  player1State: GameState;
  player2State: GameState;
  player1Resolved: boolean;
  player2Resolved: boolean;
  player1Result?: any;
  player2Result?: any;
}
```
**STRENGTH:** Clear state separation between players.

#### 4. Proper Prize Distribution
```typescript
// Lines 582-593: Winner gets full prize pool
if (tournament.prizePool > 0) {
  await GoldService.addGold(
    winnerId as any,
    tournament.prizePool,
    TransactionSource.TOURNAMENT_WIN,
    {
      tournamentId: tournament._id,
      tournamentName: tournament.name,
      description: `Won ${tournament.name}`
    }
  );
}
```
**STRENGTH:** Transaction tracking for prize awards.

### What's WRONG ❌

#### CRITICAL: In-Memory Game State Storage
**File:** `server/src/services/tournament.service.ts`
**Lines:** 41, 384, 610
**Severity:** CRITICAL

```typescript
// Line 41: This will lose all active games on server restart!
const activeTournamentGames = new Map<string, TournamentGameState>();

// Line 384: State stored only in memory
activeTournamentGames.set(matchId, gameState);

// Line 610: Deleted without persistence
activeTournamentGames.delete(matchId);
```

**PROBLEM:**
- All active tournament matches are lost on server restart/crash
- No way to recover in-progress games
- Players lose their progress and potentially entry fees

**IMPACT:** Players will experience frustration and support tickets when servers restart during tournaments.

**FIX NEEDED:**
```typescript
// Use Redis or database-backed storage
import { RedisService } from './redis.service';

export async function startTournamentMatch(
  tournamentId: string,
  matchId: string
): Promise<TournamentGameState> {
  // ... initialization code ...

  // Store in Redis with TTL
  await RedisService.set(
    `tournament:match:${matchId}`,
    JSON.stringify(gameState),
    3600 // 1 hour TTL
  );

  return gameState;
}
```

---

#### HIGH: Tie-Breaking Logic Missing
**File:** `server/src/services/tournament.service.ts`
**Lines:** 502-510
**Severity:** HIGH

```typescript
// Line 502: What if scores are exactly equal?
if (player1Score >= player2Score) {
  winnerId = match.player1Id!;
  winnerName = match.player1Name!;
  loserId = match.player2Id!;
} else {
  winnerId = match.player2Id!;
  winnerName = match.player2Name!;
  loserId = match.player1Id!;
}
```

**PROBLEM:**
- Uses `>=` which always gives player 1 advantage on ties
- No tiebreaker mechanism (hand quality, time, etc.)
- Unfair to player 2

**FIX NEEDED:**
```typescript
// Determine winner with proper tiebreaker
let winnerId: mongoose.Types.ObjectId;
let winnerName: string;
let loserId: mongoose.Types.ObjectId;

if (player1Score > player2Score) {
  winnerId = match.player1Id!;
  winnerName = match.player1Name!;
  loserId = match.player2Id!;
} else if (player2Score > player1Score) {
  winnerId = match.player2Id!;
  winnerName = match.player2Name!;
  loserId = match.player1Id!;
} else {
  // TIE: Use hand quality as tiebreaker
  const p1HandValue = getHandRank(gameState.player1Result.handName);
  const p2HandValue = getHandRank(gameState.player2Result.handName);

  if (p1HandValue > p2HandValue) {
    winnerId = match.player1Id!;
    winnerName = match.player1Name!;
    loserId = match.player2Id!;
  } else if (p2HandValue > p1HandValue) {
    winnerId = match.player2Id!;
    winnerName = match.player2Name!;
    loserId = match.player1Id!;
  } else {
    // Ultimate tiebreaker: coin flip
    const coinFlip = SecureRNG.chance(0.5);
    if (coinFlip) {
      winnerId = match.player1Id!;
      winnerName = match.player1Name!;
      loserId = match.player2Id!;
    } else {
      winnerId = match.player2Id!;
      winnerName = match.player2Name!;
      loserId = match.player1Id!;
    }
  }
}
```

---

#### MEDIUM: Refund Uses Wrong Transaction Source
**File:** `server/src/services/tournament.service.ts`
**Lines:** 193-202
**Severity:** MEDIUM

```typescript
// Line 196: Using TOURNAMENT_WIN for a refund?
await GoldService.addGold(
  characterId as any,
  tournament.entryFee,
  TransactionSource.TOURNAMENT_WIN, // WRONG!
  {
    tournamentId: tournament._id,
    description: `Refund for leaving ${tournament.name}`
  }
);
```

**PROBLEM:**
- Misleading transaction categorization
- Analytics will show false wins
- May confuse achievement tracking

**FIX NEEDED:**
```typescript
// Create proper refund transaction source
await GoldService.addGold(
  characterId as any,
  tournament.entryFee,
  TransactionSource.TOURNAMENT_REFUND, // New source needed
  {
    tournamentId: tournament._id,
    description: `Refund for leaving ${tournament.name}`
  }
);
```

---

#### MEDIUM: Tournament Manager TODOs
**File:** `server/src/services/tournamentManager.service.ts`
**Lines:** 199, 360, 404
**Severity:** MEDIUM

```typescript
// Line 199: Hardcoded template reference
tournament.nextBlindIncrease = getNextBlindIncreaseTime(
  'standard', // TODO: Get from template
  tournament.startedAt,
  tournament.currentBlindLevel
);

// Line 360: Another hardcoded reference
const prizeDistribution = calculatePrizeDistribution(
  tournament.prizePool,
  'championship' // TODO: Get from template
);
```

**PROBLEM:**
- Hardcoded tournament types
- Template data not being used
- Inconsistent blind/prize structures

**FIX NEEDED:**
```typescript
// Store template ID in tournament
tournament.nextBlindIncrease = getNextBlindIncreaseTime(
  tournament.blindScheduleId, // Use actual template
  tournament.startedAt,
  tournament.currentBlindLevel
);

const prizeDistribution = calculatePrizeDistribution(
  tournament.prizePool,
  tournament.tournamentType // Use actual type
);
```

---

#### LOW: Missing Double Elimination Support
**File:** `server/src/services/tournament.service.ts`
**Lines:** 56
**Severity:** LOW

```typescript
// Line 56: Only single elimination implemented
type: TournamentType = TournamentType.SINGLE_ELIMINATION,
```

**PROBLEM:**
- Model defines DOUBLE_ELIMINATION enum value
- Service doesn't implement it
- Dead code in model

**FIX NEEDED:** Either remove the enum value or implement double elimination logic.

---

### BUG FIXES NEEDED 🐛

#### Bug #1: Placement Calculation Off-by-One
**File:** `server/src/services/tournament.service.ts`
**Line:** 527

```typescript
// CURRENT (WRONG):
loserParticipant.placement = tournament.participants.filter(p => !p.eliminated).length + 1;

// This gives wrong placements because it counts active players BEFORE marking loser as eliminated
// If 4 players remain, loser gets placement 5 (should be 4)

// CORRECT:
tournament.participants.filter(p => p.eliminated).length
// Or move this after marking loserParticipant.eliminated = true
```

---

#### Bug #2: Missing Validation for Duplicate Participants
**File:** `server/src/services/tournament.service.ts`
**Lines:** 117-122

```typescript
// Check if already joined
const alreadyJoined = tournament.participants.some(
  p => p.characterId.toString() === characterId
);
if (alreadyJoined) {
  throw new Error('Already registered for this tournament');
}
```

**PROBLEM:** This check is inside the lock, but there's no unique index on the database level to prevent duplicates if the lock fails or times out.

**FIX:** Add compound unique index:
```typescript
// In Tournament.model.ts
TournamentSchema.index({ _id: 1, 'participants.characterId': 1 }, { unique: true, sparse: true });
```

---

#### Bug #3: Tournament Can Start With Less Than Min Participants
**File:** `server/src/services/tournamentManager.service.ts`
**Line:** 182

```typescript
// Line 182: Check happens, but what if participants leave after this?
if (tournament.registeredPlayers.length < tournament.minPlayers) {
  throw new Error(`Minimum ${tournament.minPlayers} players required`);
}

// Tournament starts...
// But no lock prevents players from leaving during startup
```

**FIX:** Add distributed lock around tournament start process.

---

### LOGICAL GAPS 🧩

#### Gap #1: No Tournament Timeout Handling
**Files:** tournament.service.ts, tournamentManager.service.ts
**Severity:** MEDIUM

**MISSING:**
- What if a player disconnects during a match?
- What if a match never completes?
- No timeout for match completion
- No forfeit mechanism

**NEEDED:**
```typescript
interface TournamentMatch {
  // ... existing fields ...
  startedAt?: Date;
  timeoutMinutes: number; // Add this
  forfeitedBy?: mongoose.Types.ObjectId; // Add this
}

// In match processing
export async function processTournamentAction(...) {
  const match = tournament.matches.find(m => m.matchId === matchId);

  // Check for timeout
  if (match.startedAt) {
    const elapsed = Date.now() - match.startedAt.getTime();
    const timeout = match.timeoutMinutes * 60 * 1000;

    if (elapsed > timeout) {
      // Auto-forfeit or draw
      throw new Error('Match timeout - contact support');
    }
  }
}
```

---

#### Gap #2: No Spectator Support
**Severity:** LOW

The tournament system has no way for non-participants to view ongoing matches. This is a missed opportunity for engagement.

**NEEDED:**
```typescript
export async function getTournamentMatchLive(
  tournamentId: string,
  matchId: string,
  viewerId?: string
): Promise<{
  match: TournamentMatch;
  canView: boolean;
  isParticipant: boolean;
  publicState: any; // Sanitized state for spectators
}> {
  // Implementation
}
```

---

#### Gap #3: No Tournament Seeding
**Severity:** MEDIUM

```typescript
// Line 231: Random shuffle with no seeding option
const shuffled = SecureRNG.shuffle([...tournament.participants]);
```

**PROBLEM:**
- No way to seed tournaments by skill/level
- Top players could meet in first round
- Less competitive tournament structure

**NEEDED:**
```typescript
export interface CreateTournamentOptions {
  // ... existing options ...
  seedingMethod?: 'random' | 'level' | 'rating' | 'manual';
  seeds?: Record<string, number>; // characterId -> seed position
}

function seedParticipants(
  participants: TournamentParticipant[],
  method: string,
  seeds?: Record<string, number>
): TournamentParticipant[] {
  // Implementation
}
```

---

### INCOMPLETE IMPLEMENTATIONS 🚧

#### Incomplete #1: Blind Schedule Integration
**File:** tournamentManager.service.ts
**Lines:** 199, 404

The blind schedule template system exists but uses hardcoded values instead of the template data.

---

#### Incomplete #2: Prize Distribution Logic
**File:** tournamentManager.service.ts
**Lines:** 360-382

Only pays the winner currently. No 2nd, 3rd place prizes despite having a prize structure.

---

#### Incomplete #3: Tournament History/Stats
**Files:** tournament.service.ts, tournamentManager.service.ts

**MISSING:**
- No lifetime tournament stats per player
- No tournament history beyond basic queries
- No achievement tracking for tournament wins

**NEEDED:**
```typescript
interface ITournamentStats {
  characterId: mongoose.Types.ObjectId;
  tournamentsEntered: number;
  tournamentsWon: number;
  winRate: number;
  totalPrizeMoney: number;
  bestFinish: number;
  averageFinish: number;
  favoriteGameType: string;
}
```

---

## SYSTEM 2: SHOOTING CONTESTS

### What It Does RIGHT ✅

#### 1. Excellent Shooting Mechanics
**File:** `server/src/services/shootingMechanics.service.ts`
**Lines:** 94-151

```typescript
static calculateAccuracyFactors(
  baseSkill: number,
  weapon: AllowedWeapon,
  target: Target,
  shotsAlreadyTaken: number,
  weather?: WeatherConditions
): AccuracyFactors {
  // Comprehensive factor calculation
  const weaponBonus = WEAPON_BONUSES[weapon].accuracy;
  const distancePenalty = this.calculateDistancePenalty(weapon, target.distance);
  const weatherPenalty = weather ? this.calculateWeatherPenalty(weather, target.distance) : 0;
  const fatiguePenalty = this.calculateFatiguePenalty(shotsAlreadyTaken);
  const sizeModifier = SIZE_MODIFIERS[target.size];
  const movementPenalty = target.movement ? MOVEMENT_PENALTIES[target.movement] : 0;

  // ... clamping and calculation ...
}
```

**STRENGTH:** Extremely detailed shooting simulation with proper physics-like calculations.

#### 2. Transaction-Safe Registration
**File:** `server/src/services/shootingContest.service.ts`
**Lines:** 91-176

```typescript
static async registerForContest(
  contestId: string,
  characterId: string,
  weapon: AllowedWeapon
): Promise<IShootingContest> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ... registration logic with session ...
    await session.commitTransaction();
    return contest;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

**STRENGTH:** Proper use of database transactions for atomic operations.

#### 3. Comprehensive Weather System
**File:** `server/src/services/shootingMechanics.service.ts`
**Lines:** 296-342

```typescript
static generateWeather(location: string): WeatherConditions {
  // Location-specific adjustments
  if (location.includes('Fort Ashford')) {
    windSpeed += SecureRNG.chance(1) * 10;
  } else if (location.includes('Frontera')) {
    windSpeed = 0;
    temperature = 75;
    visibility = 90; // Underground - dim lighting
  }

  // Random weather events (10% chance)
  if (SecureRNG.chance(0.1) && !location.includes('Frontera')) {
    // Precipitation logic
  }

  return { windSpeed, windDirection, temperature, precipitation, visibility };
}
```

**STRENGTH:** Rich environmental simulation that affects gameplay.

#### 4. Detailed Shooting Records
**File:** `server/src/services/shootingContest.service.ts`
**Lines:** 451-485

```typescript
// Update shooting record
const record = await ShootingRecord.findOrCreate(characterId, characterName);

if (participant) {
  const lastRound = contest.rounds[contest.rounds.length - 1];
  const finalScore = lastRound.scores.get(characterId);

  if (finalScore) {
    record.updateRecord(
      contest.contestType,
      participant.totalScore,
      finalScore.accuracy,
      finalScore.averageTime,
      contest._id.toString()
    );
  }
}
```

**STRENGTH:** Persistent player statistics and achievements.

### What's WRONG ❌

#### HIGH: Missing Refund on Contest Cancellation
**File:** `server/src/services/shootingContest.service.ts`
**Lines:** 594-610
**Severity:** HIGH

```typescript
static async cancelContest(contestId: string): Promise<IShootingContest> {
  const contest = await ShootingContest.findById(contestId);
  if (!contest) {
    throw new Error('Contest not found');
  }

  if (contest.status === 'completed') {
    throw new Error('Cannot cancel completed contest');
  }

  contest.status = 'cancelled';
  await contest.save();

  // Refund entry fees would go here  <-- COMMENT ONLY, NO IMPLEMENTATION!

  return contest;
}
```

**PROBLEM:**
- Entry fees are taken during registration
- But never refunded on cancellation
- Players lose money for no reason

**IMPACT:** Financial loss for players, potential for abuse (create contests, cancel, keep fees).

**FIX NEEDED:**
```typescript
static async cancelContest(contestId: string): Promise<IShootingContest> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const contest = await ShootingContest.findById(contestId).session(session);
    if (!contest) {
      throw new Error('Contest not found');
    }

    if (contest.status === 'completed') {
      throw new Error('Cannot cancel completed contest');
    }

    // Refund all participants
    for (const shooter of contest.registeredShooters) {
      if (contest.entryFee > 0) {
        await GoldService.addGold(
          shooter.characterId.toString(),
          contest.entryFee,
          TransactionSource.SHOOTING_CONTEST_REFUND,
          {
            contestId: contest._id.toString(),
            contestName: contest.name,
            reason: 'Contest cancelled'
          },
          session
        );
      }
    }

    contest.status = 'cancelled';
    await contest.save({ session });

    await session.commitTransaction();
    return contest;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

#### MEDIUM: Hit Zone Selection Algorithm Issue
**File:** `server/src/services/shootingMechanics.service.ts`
**Lines:** 218-237
**Severity:** MEDIUM

```typescript
private static determineHitZone(hitZones: HitZone[], roll: number, finalChance: number): HitZone {
  // Sort zones by difficulty (hardest first)
  const sortedZones = [...hitZones].sort((a, b) => a.difficulty - b.difficulty);

  // Allocate hit chance proportionally
  let cumulativeChance = 0;
  const normalizedRoll = (roll / finalChance) * 100;

  for (const zone of sortedZones) {
    const zoneChance = 100 * zone.difficulty / sortedZones.reduce((sum, z) => sum + z.difficulty, 0);
    cumulativeChance += zoneChance;

    if (normalizedRoll <= cumulativeChance) {
      return zone;
    }
  }

  // Fallback to least difficult zone
  return sortedZones[sortedZones.length - 1];
}
```

**PROBLEM:**
- Sorts by difficulty ASCENDING (Line 220: `a.difficulty - b.difficulty`)
- Comment says "hardest first" but code does easiest first
- The algorithm allocates MORE chance to HIGHER difficulty zones (Line 227)
- This makes hard zones EASIER to hit (backwards!)

**FIX NEEDED:**
```typescript
private static determineHitZone(hitZones: HitZone[], roll: number, finalChance: number): HitZone {
  // Sort zones by difficulty (easiest first for proper probability allocation)
  const sortedZones = [...hitZones].sort((a, b) => b.difficulty - a.difficulty); // REVERSED

  // Lower difficulty = larger zone = higher hit chance
  const totalDifficulty = sortedZones.reduce((sum, z) => sum + (10 - z.difficulty), 0);

  let cumulativeChance = 0;
  const normalizedRoll = (roll / finalChance) * 100;

  for (const zone of sortedZones) {
    const zoneWeight = (10 - zone.difficulty); // Invert so low difficulty = high weight
    const zoneChance = 100 * zoneWeight / totalDifficulty;
    cumulativeChance += zoneChance;

    if (normalizedRoll <= cumulativeChance) {
      return zone;
    }
  }

  // Fallback to largest/easiest zone
  return sortedZones[sortedZones.length - 1];
}
```

---

#### MEDIUM: No Contest State Validation
**File:** `server/src/services/shootingContest.service.ts`
**Lines:** 209-243
**Severity:** MEDIUM

```typescript
static async shoot(
  contestId: string,
  characterId: string,
  targetId: string
): Promise<{ shot: ShootingShotResult; contest: IShootingContest }> {
  const contest = await ShootingContest.findById(contestId);
  // ... validation ...

  // Get current round
  const currentRound = contest.rounds[contest.currentRound];
  // No bounds checking!

  // Find participant
  const participant = contest.registeredShooters.find(
    p => p.characterId.toString() === characterId && !p.eliminated
  );
  // ... shoot logic ...
}
```

**PROBLEM:**
- No validation that currentRound index is valid
- Could crash if rounds array is empty or index out of bounds
- No check if contest has been modified concurrently

**FIX NEEDED:**
```typescript
static async shoot(
  contestId: string,
  characterId: string,
  targetId: string
): Promise<{ shot: ShootingShotResult; contest: IShootingContest }> {
  const contest = await ShootingContest.findById(contestId);
  if (!contest) {
    throw new Error('Contest not found');
  }

  if (contest.status !== 'in_progress' && contest.status !== 'final_round') {
    throw new Error('Contest is not in progress');
  }

  // Validate round index
  if (contest.currentRound < 0 || contest.currentRound >= contest.rounds.length) {
    throw new Error('Invalid contest state: round index out of bounds');
  }

  const currentRound = contest.rounds[contest.currentRound];
  if (!currentRound || currentRound.status !== 'in_progress') {
    throw new Error('No active round');
  }

  // ... rest of logic ...
}
```

---

#### LOW: Incomplete Prize Award Logic
**File:** `server/src/services/shootingContest.service.ts`
**Lines:** 426-488
**Severity:** LOW

```typescript
private static async awardPrize(
  characterId: string,
  characterName: string,
  contest: IShootingContest,
  prize: any,
  placement: number
): Promise<void> {
  const character = await Character.findById(characterId);
  if (!character) return;

  // Award gold
  if (prize.gold > 0) {
    await GoldService.addGold(/* ... */);
  }

  // ... shooting record updates ...

  // Award reputation, items, etc would go here  <-- COMMENT ONLY!
}
```

**PROBLEM:**
- Promise to award items and reputation in prizes
- Only gold is actually awarded
- Items and reputation defined in prize structure but not given

**FIX NEEDED:**
```typescript
// Award items if specified
if (prize.item) {
  await InventoryService.addItem(characterId, prize.item, 1, {
    source: 'shooting_contest_prize',
    contestId: contest._id.toString(),
    placement
  });
}

// Award reputation if specified
if (prize.reputation) {
  await ReputationService.addReputation(
    characterId,
    'marksman',
    prize.reputation,
    `Placed ${placement} in ${contest.name}`
  );
}
```

---

### BUG FIXES NEEDED 🐛

#### Bug #1: Elimination Count Underflow
**File:** `server/src/services/shootingContest.service.ts`
**Lines:** 328-350

```typescript
// Handle eliminations
if (currentRound.eliminations && currentRound.eliminations > 0) {
  const sortedScores = scores.sort((a: any, b: any) => {
    const aRank = currentRound.scores.get(a.playerId)?.rank || 999;
    const bRank = currentRound.scores.get(b.playerId)?.rank || 999;
    return aRank - bRank;
  });

  // Eliminate bottom performers
  const toEliminate = sortedScores.slice(-currentRound.eliminations);
  // BUG: What if there are fewer players than eliminations?
  // e.g., 2 players left, 3 eliminations configured
}
```

**FIX:**
```typescript
const playersRemaining = scores.filter(s => !s.eliminated).length;
const actualEliminations = Math.min(
  currentRound.eliminations,
  Math.max(0, playersRemaining - 1) // Must leave at least 1 player
);
const toEliminate = sortedScores.slice(-actualEliminations);
```

---

#### Bug #2: Score Map Type Mismatch
**File:** `server/src/services/shootingContest.service.ts`
**Lines:** 246-262, 294

```typescript
// Line 246: Create score with string key
const scoreKey = characterId;
let roundScore = currentRound.scores.get(scoreKey);

// Line 262: Set with string key
currentRound.scores.set(scoreKey, roundScore);

// Line 294: Also set with string key
currentRound.scores.set(scoreKey, roundScore);
```

But in the model:
```typescript
// ShootingContest.model.ts Line 92-95
scores: {
  type: Map,
  of: RoundScoreSchema
},
```

**PROBLEM:**
- Map keys are strings (characterId)
- But no guarantee of consistency (could be ObjectId.toString() or just ObjectId)
- May cause scores to be stored multiple times for same player

**FIX:** Explicitly normalize keys:
```typescript
const scoreKey = characterId.toString(); // Always string
```

---

### LOGICAL GAPS 🧩

#### Gap #1: No Practice Mode
**Severity:** LOW

Players can't practice shooting mechanics before entering paid contests. This creates a barrier to entry.

**NEEDED:**
```typescript
export interface PracticeRange {
  id: string;
  location: string;
  cost: number;
  targets: Target[];
  allowedWeapons: AllowedWeapon[];
}

static async startPracticeSession(
  characterId: string,
  rangeId: string,
  weapon: AllowedWeapon
): Promise<PracticeSession> {
  // Implementation
}
```

---

#### Gap #2: No Mid-Contest Forfeit
**Severity:** MEDIUM

Once registered, players must complete all rounds or lose their entry fee. No graceful exit.

**NEEDED:**
```typescript
static async forfeitContest(
  contestId: string,
  characterId: string
): Promise<{
  contest: IShootingContest;
  refundAmount: number;
}> {
  // Partial refund based on rounds completed
  const roundsCompleted = contest.currentRound;
  const totalRounds = contest.rounds.length;
  const refundPercentage = 1 - (roundsCompleted / totalRounds);
  const refundAmount = Math.floor(contest.entryFee * refundPercentage);

  // Mark as eliminated and refund
  // Implementation
}
```

---

#### Gap #3: No Anti-Cheating Measures
**Severity:** MEDIUM

```typescript
static async shoot(/* ... */) {
  // ... existing code ...

  // No validation that:
  // - Time between shots is realistic
  // - Accuracy isn't impossibly high
  // - Player isn't using automated tools
}
```

**NEEDED:**
```typescript
// Add shot timing validation
if (roundScore.shots.length > 0) {
  const lastShot = roundScore.shots[roundScore.shots.length - 1];
  const timeSinceLastShot = Date.now() - lastShot.timestamp;

  if (timeSinceLastShot < 500) { // 500ms minimum between shots
    throw new Error('Shots too rapid - suspicious activity');
  }
}

// Add accuracy anomaly detection
const recentAccuracy = roundScore.shots.slice(-10).filter(s => s.hit).length / 10;
if (recentAccuracy > 0.95 && participant.marksmanshipSkill < 80) {
  // Flag for review
  await AnticheatService.flagSuspiciousActivity(characterId, 'impossible_accuracy');
}
```

---

### INCOMPLETE IMPLEMENTATIONS 🚧

#### Incomplete #1: Target Sets
**File:** `server/src/services/shootingContest.service.ts`
**Lines:** 493-507

```typescript
private static getTargetsForRound(contestType: ContestType, roundType: RoundType): Target[] {
  const targetSet = TARGET_SETS[contestType];
  if (!targetSet) return []; // Returns empty array!

  // Map round types to target sets
  if (roundType === 'qualification') {
    return targetSet.qualification || [];
  } else if (roundType === 'semifinals' || roundType === 'elimination') {
    return targetSet.semifinals || [];
  } else if (roundType === 'finals' || roundType === 'shootoff') {
    return targetSet.finals || [];
  }

  return targetSet.qualification || [];
}
```

**PROBLEM:**
- Silent failures with empty arrays
- No error if target set not defined
- Contest could start with no targets!

**FIX:**
```typescript
private static getTargetsForRound(contestType: ContestType, roundType: RoundType): Target[] {
  const targetSet = TARGET_SETS[contestType];
  if (!targetSet) {
    throw new Error(`No target set defined for contest type: ${contestType}`);
  }

  let targets: Target[] | undefined;

  if (roundType === 'qualification') {
    targets = targetSet.qualification;
  } else if (roundType === 'semifinals' || roundType === 'elimination') {
    targets = targetSet.semifinals;
  } else if (roundType === 'finals' || roundType === 'shootoff') {
    targets = targetSet.finals;
  }

  if (!targets || targets.length === 0) {
    throw new Error(`No targets defined for ${contestType} - ${roundType}`);
  }

  return targets;
}
```

---

## SYSTEM 3: GAMBLING SYSTEM

### What It Does RIGHT ✅

#### 1. Security Improvements with SecureRNG
**File:** `server/src/services/gambling.service.ts`
**Lines:** 99, 366, 396, 455, 508, 542, 590

```typescript
// Line 99: Secure dealer skill generation
dealerSkillLevel: SecureRNG.range(5, 10),

// Line 366: Secure blackjack outcomes
const random = SecureRNG.d100();

// Line 396: Secure roulette spins
const spinResult = SecureRNG.range(0, 36);

// Line 455-456: Secure craps rolls
const die1 = SecureRNG.roll(6);
const die2 = SecureRNG.roll(6);
```

**STRENGTH:** All gambling outcomes use cryptographically secure RNG, preventing exploitation.

#### 2. Distributed Locking for Concurrent Bets
**File:** `server/src/services/gambling.service.ts`
**Lines:** 127-259

```typescript
export async function makeBet(/* ... */): Promise<{...}> {
  const lockKey = `lock:gambling:${sessionId}`;

  return withLock(lockKey, async () => {
    // ... betting logic ...
  }, { ttl: 30, retries: 10 });
}
```

**STRENGTH:** Prevents race conditions on rapid bets.

#### 3. Comprehensive Gambling History Tracking
**File:** `server/src/models/GamblingHistory.model.ts`
**Lines:** 46-107

```typescript
export interface IGamblingHistory extends Document {
  totalSessions: number;
  totalGoldWagered: number;
  totalGoldWon: number;
  totalGoldLost: number;
  netLifetimeProfit: number;
  sessionsByGame: Map<string, number>;
  profitByGame: Map<string, number>;
  biggestSingleWin: number;
  biggestSingleLoss: number;
  longestWinStreak: number;
  longestLossStreak: number;
  // ... addiction tracking ...
  // ... cheating tracking ...
}
```

**STRENGTH:** Rich data for analytics and player progression.

#### 4. Addiction System with Debuffs
**File:** `server/src/models/GamblingHistory.model.ts`
**Lines:** 375-459

```typescript
GamblingHistorySchema.methods.updateAddictionLevel = function(): void {
  const THRESHOLDS = {
    CASUAL: 20,
    REGULAR: 50,
    PROBLEM: 100,
    COMPULSIVE: 200
  };

  if (this.totalSessions >= THRESHOLDS.COMPULSIVE) {
    this.addictionLevel = AddictionLevel.ADDICTED;
    this.applyAddictionDebuffs(AddictionLevel.ADDICTED);
  }
  // ... progressive addiction tracking ...
}
```

**STRENGTH:** Meaningful consequences for gambling behavior.

### What's WRONG ❌

#### CRITICAL: Double Gold Deduction
**File:** `server/src/services/gambling.service.ts`
**Lines:** 232-239
**Severity:** CRITICAL

```typescript
// Update character gold
if (netChange > 0) {
  await character.deductGold(betAmount, TransactionSource.GAMBLING_LOSS); // DEDUCTS BET
  await character.addGold(payout, TransactionSource.GAMBLING_WIN);        // ADDS PAYOUT
} else if (netChange < 0) {
  await character.deductGold(betAmount, TransactionSource.GAMBLING_LOSS); // DEDUCTS BET AGAIN!
}
```

**PROBLEM:**
- On a WIN: Deducts bet amount, then adds payout (CORRECT)
  - Net result: -bet + payout = netChange ✅
- On a LOSS: Only deducts bet amount (CORRECT) ✅
- On a PUSH: No action (MISSING!) ❌

**Wait, let me re-analyze...**

Actually, looking at the logic:
- `netChange = payout - betAmount` (Line 223)
- If WIN: payout > betAmount, so netChange > 0
  - Deduct bet (player pays)
  - Add payout (player receives)
  - Net: -bet + payout = ✅ CORRECT
- If LOSS: payout = 0, so netChange < 0
  - Deduct bet
  - Net: -bet = ✅ CORRECT
- If PUSH: payout = betAmount, so netChange = 0
  - No deduction or addition ❌ WRONG (bet should still be taken and returned)

**Actually CORRECT for wins/losses, but PUSH logic is wrong:**

```typescript
// CURRENT (Line 232-239):
if (netChange > 0) {
  await character.deductGold(betAmount, TransactionSource.GAMBLING_LOSS);
  await character.addGold(payout, TransactionSource.GAMBLING_WIN);
} else if (netChange < 0) {
  await character.deductGold(betAmount, TransactionSource.GAMBLING_LOSS);
}
// PUSH (netChange === 0) does NOTHING - bet is never actually taken from character!
```

**FIX NEEDED:**
```typescript
// Update character gold - ALL bets must be deducted first
await character.deductGold(betAmount, TransactionSource.GAMBLING_BET, {
  sessionId,
  gameType: session.gameType
});

// Then handle payout
if (result === 'WIN') {
  await character.addGold(payout, TransactionSource.GAMBLING_WIN, {
    sessionId,
    gameType: session.gameType
  });
} else if (result === 'PUSH') {
  await character.addGold(betAmount, TransactionSource.GAMBLING_PUSH, {
    sessionId,
    gameType: session.gameType
  });
}
// LOSS: no additional action, bet already taken
```

---

#### HIGH: Incomplete Gambling Item Integration
**File:** `server/src/services/cheating.service.ts`
**Lines:** 67, 247-250
**Severity:** HIGH

```typescript
// Line 67: Hardcoded to 0
const itemBonus = 0; // TODO: Check for gambling items equipped

// Lines 247-250: Stub function
export async function hasGamblingItemBonus(/* ... */): Promise<{...}> {
  const character = await Character.findById(characterId);
  if (!character) {
    return { hasItem: false, bonus: 0 };
  }

  // TODO: Check character's inventory and equipment for gambling items
  // This would integrate with the item system

  return { hasItem: false, bonus: 0 };
}
```

**PROBLEM:**
- Gambling items exist in game data (GAMBLING_ITEMS)
- But they don't actually DO anything
- Cheating detection ignores items
- Players can buy useless items

**IMPACT:** Players waste gold on non-functional items, breaking immersion.

**FIX NEEDED:**
```typescript
export async function hasGamblingItemBonus(
  characterId: string,
  itemType: 'cheat' | 'winRate' | 'detection'
): Promise<{ hasItem: boolean; bonus: number; itemId?: string }> {
  const character = await Character.findById(characterId);
  if (!character) {
    return { hasItem: false, bonus: 0 };
  }

  // Check equipped items
  const equippedItems = character.equipment?.accessories || [];

  for (const itemId of equippedItems) {
    const item = GAMBLING_ITEMS[itemId];
    if (!item) continue;

    // Check if item provides the bonus type we're looking for
    if (itemType === 'cheat' && item.effects.cheatSuccessBonus) {
      return {
        hasItem: true,
        bonus: item.effects.cheatSuccessBonus,
        itemId: item.id
      };
    }

    if (itemType === 'detection' && item.effects.detectionReduction) {
      return {
        hasItem: true,
        bonus: item.effects.detectionReduction,
        itemId: item.id
      };
    }

    if (itemType === 'winRate' && item.effects.winRateBonus) {
      return {
        hasItem: true,
        bonus: item.effects.winRateBonus,
        itemId: item.id
      };
    }
  }

  return { hasItem: false, bonus: 0 };
}

// Then use it:
const skillLevel = getRelevantSkillLevel(character, method);
const itemBonus = await hasGamblingItemBonus(characterId, 'cheat');
const totalBonus = skillLevel + itemBonus.bonus;
```

---

#### MEDIUM: recordHandResult Type Confusion
**File:** `server/src/services/gambling.service.ts`
**Lines:** 225, 287-303
**Severity:** MEDIUM

```typescript
// Line 225: Calls with lowercase
(session as any).recordHandResult(result.toLowerCase() as 'win' | 'loss' | 'push');

// But the method signature is (Line 287):
GamblingSessionSchema.methods.recordHandResult = function(
  this: IGamblingSession,
  result: 'WIN' | 'LOSS' | 'PUSH'  // UPPERCASE!
): void {
```

**PROBLEM:**
- Service calls with lowercase ('win')
- Method expects uppercase ('WIN')
- Type assertion bypasses TypeScript safety
- Method will fail switch statement

**FIX NEEDED:**
```typescript
// Option 1: Fix the service call
(session as any).recordHandResult(result); // Already uppercase

// Option 2: Make method accept both
GamblingSessionSchema.methods.recordHandResult = function(
  this: IGamblingSession,
  result: 'WIN' | 'LOSS' | 'PUSH' | 'win' | 'loss' | 'push'
): void {
  this.handsPlayed += 1;

  const normalizedResult = result.toUpperCase() as 'WIN' | 'LOSS' | 'PUSH';

  switch (normalizedResult) {
    case 'WIN':
      this.handsWon += 1;
      break;
    case 'LOSS':
      this.handsLost += 1;
      break;
    case 'PUSH':
      this.handsPushed += 1;
      break;
  }
};
```

---

#### MEDIUM: Session Financial Tracking Inconsistency
**File:** `server/src/models/GamblingSession.model.ts`
**Lines:** 260-282
**Severity:** MEDIUM

```typescript
GamblingSessionSchema.methods.updateFinancials = function(
  this: IGamblingSession,
  goldChange: number,
  wagerAmount: number
): void {
  this.currentGold += goldChange;  // Updates current gold
  this.totalWagered += wagerAmount;

  if (goldChange > 0) {
    this.totalWon += goldChange;
    // ...
  } else if (goldChange < 0) {
    const loss = Math.abs(goldChange);
    this.totalLost += loss;
    // ...
  }

  this.netProfit = this.currentGold - this.startingGold;
};
```

**PROBLEM:**
- `currentGold` is updated in the session
- But the actual character gold is updated separately in service
- If character gold update fails, session shows wrong balance
- Creates data inconsistency

**FIX NEEDED:**
```typescript
// Don't track currentGold in session, calculate it on demand
GamblingSessionSchema.methods.getCurrentGold = async function(
  this: IGamblingSession
): Promise<number> {
  const character = await Character.findById(this.characterId);
  return character?.gold || this.startingGold;
};

// Remove currentGold from schema, add virtual
GamblingSessionSchema.virtual('currentBalance').get(function() {
  return this.startingGold + this.netProfit;
});
```

---

#### LOW: Incomplete Blackjack Implementation
**File:** `server/src/services/gambling.service.ts`
**Lines:** 338-383
**Severity:** LOW

```typescript
async function playBlackjackHand(/* ... */): Promise<{...}> {
  // Deal initial cards
  const playerCard1 = drawCard();
  const playerCard2 = drawCard();
  const dealerCard1 = drawCard();
  const dealerCard2 = drawCard();

  let playerTotal = getBlackjackValue([playerCard1, playerCard2]);
  let dealerTotal = getBlackjackValue([dealerCard1, dealerCard2]);

  // Check for player blackjack
  if (playerTotal === 21) {
    // Dealer checks for blackjack
    if (dealerTotal === 21) {
      return { result: 'PUSH', payout: betAmount, newGameState: {} };
    }
    // Player wins 3:2
    return { result: 'WIN', payout: Math.floor(betAmount * 2.5), newGameState: {} };
  }

  // Simulate house edge (SKIPS ACTUAL GAMEPLAY!)
  const winChance = 50 - houseEdge;
  const random = SecureRNG.d100();

  let result: 'WIN' | 'LOSS' | 'PUSH';
  // ... simple random outcome ...
}
```

**PROBLEM:**
- Deals cards but doesn't use them
- No hit/stand/double/split mechanics
- Just random outcome based on house edge
- `action` parameter is completely ignored

**IMPACT:** Not real blackjack, just a coin flip with card images.

**FIX NEEDED:**
Full blackjack implementation with player actions, or remove the card dealing facade.

---

### BUG FIXES NEEDED 🐛

#### Bug #1: Addiction Calculation Overflow
**File:** `server/src/models/GamblingHistory.model.ts`
**Lines:** 303-370

```typescript
GamblingHistorySchema.methods.recordSession = function(/* ... */) {
  this.totalSessions += 1;
  this.totalGoldWagered += goldWagered;

  if (netProfit > 0) {
    this.totalGoldWon += netProfit;
  } else {
    this.totalGoldLost += Math.abs(netProfit);
  }

  this.netLifetimeProfit = this.totalGoldWon - this.totalGoldLost;
  // BUG: If totalGoldWon or totalGoldLost exceed Number.MAX_SAFE_INTEGER
  // calculations become unreliable
}
```

**FIX:** Use BigInt or cap values:
```typescript
const MAX_GOLD = 1_000_000_000; // 1 billion cap

this.totalGoldWon = Math.min(this.totalGoldWon + netProfit, MAX_GOLD);
```

---

#### Bug #2: Cheat Success Rate Division by Zero
**File:** `server/src/models/GamblingHistory.model.ts`
**Lines:** 484-487

```typescript
// Update cheat success rate
const totalCheats = this.successfulCheats + this.timesCaughtCheating;
if (totalCheats > 0) {
  this.cheatSuccessRate = (this.successfulCheats / totalCheats) * 100;
}
// BUG: What if timesCaughtCheating increments but this is first cheat?
// Then totalCheats = 0 + 1 = 1, but successfulCheats = 0
// Result: 0% success rate even though they haven't tried to succeed yet
```

**FIX:** Track total attempts separately:
```typescript
cheatAttemptsTotal: number; // Add to schema
successfulCheats: number;
timesCaughtCheating: number;

// Calculate rate:
this.cheatSuccessRate = this.cheatAttemptsTotal > 0
  ? (this.successfulCheats / this.cheatAttemptsTotal) * 100
  : 0;
```

---

#### Bug #3: Roulette Red/Black Logic Error
**File:** `server/src/services/gambling.service.ts`
**Lines:** 408-409

```typescript
const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
won = betDetails.color === 'RED' ? redNumbers.includes(spinResult) : !redNumbers.includes(spinResult) && spinResult !== 0;
```

**BUG:**
- Black bet wins if `!redNumbers.includes(spinResult) && spinResult !== 0`
- This INCLUDES 0 as a loss (correct)
- But what about numbers not in redNumbers and not 0?
- Roulette wheels have specific black numbers, not "anything not red and not 0"

**ACTUAL ROULETTE:**
- Red: 1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36
- Black: 2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35
- Green: 0 (and sometimes 00)

**FIX:**
```typescript
const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

if (betDetails.color === 'RED') {
  won = redNumbers.includes(spinResult);
} else if (betDetails.color === 'BLACK') {
  won = blackNumbers.includes(spinResult);
} else {
  throw new Error('Invalid color bet');
}
```

---

### LOGICAL GAPS 🧩

#### Gap #1: No Session Timeout/Auto-End
**Severity:** MEDIUM

```typescript
// GamblingSession.model.ts
// Sessions can stay open forever
// No automatic cleanup of abandoned sessions
```

**NEEDED:**
```typescript
// Add to model
sessionTimeoutMinutes: {
  type: Number,
  default: 120 // 2 hours
}

// Add job to check for expired sessions
export async function cleanupAbandonedSessions(): Promise<void> {
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000);

  const expiredSessions = await GamblingSession.find({
    status: 'ACTIVE',
    startTime: { $lt: cutoff }
  });

  for (const session of expiredSessions) {
    await endGamblingSession(session._id.toString(), session.characterId.toString());
  }
}
```

---

#### Gap #2: No Maximum Bet per Session
**Severity:** HIGH

Players can bet unlimited amounts per session, potentially leading to:
- Extreme losses
- Addiction spiraling
- Exploit attempts

**NEEDED:**
```typescript
// In gambling game definition
maxBetPerSession?: number;
maxLossPerSession?: number;

// In makeBet service
const session = await GamblingSession.findById(sessionId);
const sessionLoss = Math.abs(Math.min(0, session.netProfit));

if (game.maxLossPerSession && sessionLoss >= game.maxLossPerSession) {
  throw new Error(`Session loss limit reached (${game.maxLossPerSession} gold). Please end session.`);
}
```

---

#### Gap #3: No Responsible Gambling Features
**Severity:** MEDIUM

The addiction system tracks problems but doesn't help players:
- No self-exclusion option
- No betting limits by choice
- No reality checks (time/money spent)

**NEEDED:**
```typescript
interface ResponsibleGamblingSettings {
  characterId: mongoose.Types.ObjectId;
  dailyLossLimit?: number;
  sessionTimeLimit?: number; // minutes
  selfExcludedUntil?: Date;
  realityCheckInterval?: number; // minutes
}

// Reality check
if (session.getDurationMinutes() % settings.realityCheckInterval === 0) {
  return {
    ...result,
    realityCheck: {
      timeSpent: session.getDurationMinutes(),
      netProfit: session.netProfit,
      message: "You've been gambling for ${timeSpent} minutes with ${netProfit} gold profit/loss"
    }
  };
}
```

---

### INCOMPLETE IMPLEMENTATIONS 🚧

#### Incomplete #1: All Card Games
**Files:** gambling.service.ts Lines 338-606

All card games (Blackjack, Faro, Monte) use simplified random outcomes instead of actual card mechanics:
- No deck management
- No card counting implications
- No strategy elements
- Just random with house edge

---

#### Incomplete #2: Wheel of Fortune
**File:** gambling.service.ts Lines 566-606

```typescript
async function playWheelSpin(/* ... */) {
  // Hardcoded wheel segments
  const segments = [
    { symbol: 'STAR', count: 1, payout: 40 },
    // ...
  ];

  // Should be configurable per location/event
}
```

---

#### Incomplete #3: Memorable Moments
**File:** `server/src/models/GamblingHistory.model.ts`
**Lines:** 515-525

```typescript
GamblingHistorySchema.methods.addMemorableMoment = function(
  this: IGamblingHistory,
  moment: IGamblingMoment
): void {
  this.memorableMoments.push(moment);

  // Keep only last 50 moments
  if (this.memorableMoments.length > 50) {
    this.memorableMoments = this.memorableMoments.slice(-50);
  }
};
```

**PROBLEM:** Method exists but is NEVER CALLED anywhere. Memorable moments are never recorded.

**FIX:** Call it when significant events occur:
```typescript
// In makeBet when big win/loss
if (netChange >= 1000 || netChange <= -1000) {
  const history = await GamblingHistory.findByCharacter(characterId);
  if (history) {
    history.addMemorableMoment({
      id: uuidv4(),
      timestamp: new Date(),
      gameType: session.gameType,
      description: netChange > 0 ? `Won ${netChange} gold!` : `Lost ${Math.abs(netChange)} gold`,
      goldAmount: Math.abs(netChange),
      wasWin: netChange > 0,
      location: session.location,
      witnesses: session.otherPlayers.map(p => p.toString())
    });
    await history.save();
  }
}
```

---

## SYSTEM 4: LEADERBOARD SYSTEM

### What It Does RIGHT ✅

#### 1. Clean Controller Pattern
**File:** `server/src/controllers/leaderboard.controller.ts`
**Lines:** 32-62

```typescript
export const getLevelLeaderboard = asyncHandler(
  async (req: Request, res: Response) => {
    const range = (req.query.range as string) || 'all';
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 100));

    const dateFilter = getDateFilter(range);
    const query: any = { isActive: true };
    if (dateFilter) {
      query.lastActive = { $gte: dateFilter };
    }

    const characters = await Character.find(query)
      .select('name level experience faction')
      .sort({ level: -1, experience: -1 })
      .limit(limit)
      .lean();

    // ... formatting ...
  }
);
```

**STRENGTH:** Proper query optimization with select(), sort(), limit(), and lean().

#### 2. Calculated Reputation Metric
**File:** `server/src/controllers/leaderboard.controller.ts`
**Lines:** 106-150

```typescript
export const getReputationLeaderboard = asyncHandler(
  async (req: Request, res: Response) => {
    // Reputation = level * 100 + wins * 10
    const characters = await Character.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          reputation: {
            $add: [
              { $multiply: ['$level', 100] },
              { $multiply: [{ $ifNull: ['$combatStats.wins', 0] }, 10] }
            ]
          }
        }
      },
      { $sort: { reputation: -1 } },
      { $limit: limit },
      // ...
    ]);
  }
);
```

**STRENGTH:** Uses aggregation pipeline for computed metrics.

### What's WRONG ❌

#### HIGH: Missing Indexes for Leaderboard Queries
**File:** `server/src/controllers/leaderboard.controller.ts`
**All query functions**
**Severity:** HIGH

```typescript
// Line 43: Sorts on level + experience
.sort({ level: -1, experience: -1 })

// Line 82: Sorts on gold
.sort({ gold: -1 })

// Line 130: Sorts on computed reputation
{ $sort: { reputation: -1 } }

// Line 169: Sorts on combatStats.wins
.sort({ 'combatStats.wins': -1 })

// Line 209: Sorts on bountyAmount
.sort({ bountyAmount: -1 })
```

**PROBLEM:**
- None of these fields have compound indexes
- Leaderboard queries will be slow with many players
- MongoDB will do in-memory sorts (32MB limit)

**FIX NEEDED in Character.model.ts:**
```typescript
// Add these indexes
CharacterSchema.index({ isActive: 1, level: -1, experience: -1 });
CharacterSchema.index({ isActive: 1, gold: -1 });
CharacterSchema.index({ isActive: 1, 'combatStats.wins': -1 });
CharacterSchema.index({ isActive: 1, bountyAmount: -1 });
CharacterSchema.index({ isActive: 1, lastActive: -1 });
```

---

#### MEDIUM: No Caching for Leaderboards
**File:** `server/src/controllers/leaderboard.controller.ts`
**All functions**
**Severity:** MEDIUM

```typescript
// Every request queries the database
const characters = await Character.find(query)
  .sort({ level: -1, experience: -1 })
  .limit(limit)
  .lean();
```

**PROBLEM:**
- Leaderboards change infrequently but are queried often
- Expensive aggregations on every request
- Could use Redis caching with 5-minute TTL

**FIX NEEDED:**
```typescript
export const getLevelLeaderboard = asyncHandler(
  async (req: Request, res: Response) => {
    const range = (req.query.range as string) || 'all';
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 100));

    const cacheKey = `leaderboard:level:${range}:${limit}`;

    // Try cache first
    const cached = await RedisService.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Query database
    const dateFilter = getDateFilter(range);
    const query: any = { isActive: true };
    if (dateFilter) {
      query.lastActive = { $gte: dateFilter };
    }

    const characters = await Character.find(query)
      .select('name level experience faction')
      .sort({ level: -1, experience: -1 })
      .limit(limit)
      .lean();

    const leaderboard = characters.map((char, index) => ({
      rank: index + 1,
      characterId: char._id,
      name: char.name,
      value: char.level,
      experience: char.experience,
      faction: char.faction
    }));

    const response = {
      success: true,
      data: { leaderboard, type: 'level', range }
    };

    // Cache for 5 minutes
    await RedisService.set(cacheKey, JSON.stringify(response), 300);

    res.json(response);
  }
);
```

---

#### MEDIUM: Date Filter Mutates Input
**File:** `server/src/controllers/leaderboard.controller.ts`
**Lines:** 14-26
**Severity:** MEDIUM

```typescript
function getDateFilter(range: string): Date | null {
  const now = new Date();
  switch (range) {
    case 'daily':
      return new Date(now.setDate(now.getDate() - 1)); // MUTATES now!
    case 'weekly':
      return new Date(now.setDate(now.getDate() - 7)); // MUTATES already mutated now!
    case 'monthly':
      return new Date(now.setMonth(now.getMonth() - 1)); // MUTATES again!
    default:
      return null;
  }
}
```

**PROBLEM:**
- `setDate()` mutates the Date object
- If function is called multiple times in same request, dates will be wrong
- Creates subtle timing bugs

**FIX NEEDED:**
```typescript
function getDateFilter(range: string): Date | null {
  switch (range) {
    case 'daily':
      return new Date(Date.now() - 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    case 'monthly': {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }
    default:
      return null;
  }
}
```

---

#### LOW: Missing Leaderboards for Competitive Systems
**File:** `server/src/controllers/leaderboard.controller.ts`
**Severity:** LOW

```typescript
// EXISTS:
// - Level
// - Gold
// - Reputation
// - Combat
// - Bounties
// - Gangs

// MISSING:
// - Tournaments (wins, total prize money)
// - Shooting contests (accuracy, wins)
// - Gambling (biggest wins, profit)
// - Duels
// - Properties (wealth, production)
```

**FIX NEEDED:**
Add dedicated leaderboards for each competitive system in their respective services.

---

### BUG FIXES NEEDED 🐛

#### Bug #1: Gang Leaderboard Bank Balance Issue
**File:** `server/src/controllers/leaderboard.controller.ts`
**Lines:** 244-256

```typescript
const gangs = await Gang.aggregate([
  { $match: query },
  {
    $addFields: {
      memberCount: { $size: '$members' },
      territoryCount: { $size: { $ifNull: ['$territories', []] } },
      bankBalance: '$bank'  // Assumes 'bank' field exists
    }
  },
  // ...
]);
```

**PROBLEM:**
- Assumes Gang model has `bank` field
- May be `bankBalance`, `treasury`, or nested
- Will return undefined if field name is wrong

**FIX:** Check Gang model schema and use correct field name.

---

### LOGICAL GAPS 🧩

#### Gap #1: No Personal Rank Indicator
**Severity:** MEDIUM

Players can see top 100 but don't know their own rank if they're not in top 100.

**NEEDED:**
```typescript
export const getMyRank = asyncHandler(
  async (req: Request, res: Response) => {
    const characterId = req.character!._id;
    const { type = 'level' } = req.query;

    // Count how many characters are ranked higher
    let rank: number;

    switch (type) {
      case 'level':
        rank = await Character.countDocuments({
          isActive: true,
          $or: [
            { level: { $gt: req.character!.level } },
            {
              level: req.character!.level,
              experience: { $gt: req.character!.experience }
            }
          ]
        }) + 1;
        break;
      // ... other types ...
    }

    res.json({
      success: true,
      data: { rank, type }
    });
  }
);
```

---

#### Gap #2: No Rank Change Tracking
**Severity:** LOW

Players can't see if they moved up or down since last time they checked.

**NEEDED:**
```typescript
interface LeaderboardSnapshot {
  characterId: mongoose.Types.ObjectId;
  type: string;
  rank: number;
  value: number;
  timestamp: Date;
}

// Track rank changes
async function trackRankChange(
  characterId: string,
  type: string,
  currentRank: number,
  currentValue: number
): Promise<{ rankChange: number; valueChange: number }> {
  const lastSnapshot = await LeaderboardSnapshot.findOne({
    characterId,
    type
  }).sort({ timestamp: -1 });

  const rankChange = lastSnapshot ? lastSnapshot.rank - currentRank : 0;
  const valueChange = lastSnapshot ? currentValue - lastSnapshot.value : 0;

  // Save new snapshot
  await LeaderboardSnapshot.create({
    characterId,
    type,
    rank: currentRank,
    value: currentValue,
    timestamp: new Date()
  });

  return { rankChange, valueChange };
}
```

---

#### Gap #3: No Seasonal/Event Leaderboards
**Severity:** LOW

All leaderboards are lifetime or time-filtered. No way to have:
- Monthly competitions
- Seasonal resets
- Special event leaderboards

**NEEDED:**
```typescript
export const getSeasonalLeaderboard = asyncHandler(
  async (req: Request, res: Response) => {
    const { season = 'current', type = 'level' } = req.query;

    // Define season date ranges
    const seasonStart = getSeasonStartDate(season);
    const seasonEnd = getSeasonEndDate(season);

    // Query with season filter
    // Implementation
  }
);
```

---

### INCOMPLETE IMPLEMENTATIONS 🚧

#### Incomplete #1: Public Routes Without Data
**File:** `server/src/routes/leaderboard.routes.ts`
**Lines:** 23-58

```typescript
// All routes are public (no auth middleware)
router.get('/level', getLevelLeaderboard);
router.get('/gold', getGoldLeaderboard);
// ... etc ...
```

**ISSUE:**
- Routes are public but leak character data
- Should have option for anonymous leaderboards
- Or at least hide sensitive information

---

## SYSTEM 5: CHEATING DETECTION

### What It Does RIGHT ✅

#### 1. Multi-Factor Detection System
**File:** `server/src/services/cheating.service.ts`
**Lines:** 66-79

```typescript
// Base detection chance
let detectionChance = game.cheatDetectionBase;

// Modifiers
detectionChance -= skillLevel * 2; // -2% per skill level
detectionChance -= itemBonus;
detectionChance += session.dealerSkillLevel * 3; // +3% per dealer skill
detectionChance += (history?.knownCheater ? 20 : 0); // Known cheaters watched closely

// Clamp detection chance
detectionChance = Math.max(5, Math.min(95, detectionChance));
```

**STRENGTH:** Balanced detection with multiple factors.

#### 2. Secure Random Number Generation
**File:** `server/src/services/cheating.service.ts`
**Lines:** 86-92

```typescript
// Roll for success
const successRoll = SecureRNG.d100();
const success = successRoll <= successChance;

// Roll for detection
const detectionRoll = SecureRNG.d100();
const detected = detectionRoll <= detectionChance;
```

**STRENGTH:** Cryptographically secure outcomes.

#### 3. Graduated Consequences
**File:** `server/src/services/cheating.service.ts`
**Lines:** 149-193

```typescript
if (detected) {
  // Reputation loss
  // Fine
  // Jail time
  // Location ban

  message = `CAUGHT CHEATING by ${detectedBy}! You've been ejected from the game`;
  if (cheatAttempt.fine) {
    message += `, fined ${cheatAttempt.fine} gold`;
  }
  if (cheatAttempt.jailTime) {
    message += `, and sent to jail for ${cheatAttempt.jailTime} minutes`;
  }
  if (cheatAttempt.bannedFromLocation) {
    message += `. You are now BANNED from ${session.location}`;
  }
}
```

**STRENGTH:** Meaningful and escalating penalties.

### What's WRONG ❌

#### CRITICAL: Incomplete Item Integration
**Already documented above in Gambling System section**

---

#### MEDIUM: Skill Mapping Hardcoded
**File:** `server/src/services/cheating.service.ts`
**Lines:** 219-232
**Severity:** MEDIUM

```typescript
function getRelevantSkillLevel(character: ICharacter, method: CheatMethod): number {
  const skillMap: Record<CheatMethod, string> = {
    [CheatMethod.CARD_MANIPULATION]: 'sleight_of_hand',
    [CheatMethod.MARKED_CARDS]: 'observation',
    [CheatMethod.LOADED_DICE]: 'sleight_of_hand',
    [CheatMethod.COLLUSION]: 'cunning',
    [CheatMethod.CARD_COUNTING]: 'mathematics',
    [CheatMethod.MIRROR_SIGNAL]: 'observation',
    [CheatMethod.DEALER_COLLUSION]: 'cunning'
  };

  const skillId = skillMap[method];
  return character.getSkillLevel(skillId);
}
```

**PROBLEM:**
- Skill names are hardcoded strings
- If skill system changes, this breaks
- No validation that skills exist
- Returns 0 or undefined if skill not found

**FIX NEEDED:**
```typescript
import { SKILL_IDS } from '@desperados/shared/constants/skills.constants';

function getRelevantSkillLevel(character: ICharacter, method: CheatMethod): number {
  const skillMap: Record<CheatMethod, string> = {
    [CheatMethod.CARD_MANIPULATION]: SKILL_IDS.SLEIGHT_OF_HAND,
    [CheatMethod.MARKED_CARDS]: SKILL_IDS.OBSERVATION,
    [CheatMethod.LOADED_DICE]: SKILL_IDS.SLEIGHT_OF_HAND,
    [CheatMethod.COLLUSION]: SKILL_IDS.CUNNING,
    [CheatMethod.CARD_COUNTING]: SKILL_IDS.MATHEMATICS,
    [CheatMethod.MIRROR_SIGNAL]: SKILL_IDS.OBSERVATION,
    [CheatMethod.DEALER_COLLUSION]: SKILL_IDS.CUNNING
  };

  const skillId = skillMap[method];
  if (!skillId) {
    logger.warn(`No skill mapping for cheat method: ${method}`);
    return 0;
  }

  const skillLevel = character.getSkillLevel(skillId);
  if (skillLevel === undefined || skillLevel === null) {
    logger.warn(`Character ${character._id} missing skill: ${skillId}`);
    return 0;
  }

  return skillLevel;
}
```

---

#### MEDIUM: No Cheat Cooldown
**File:** `server/src/services/cheating.service.ts`
**Lines:** 60-64
**Severity:** MEDIUM

```typescript
// Check cheat attempt limit per session
if (session.cheatAttempts >= 3) {
  throw new Error('Maximum cheat attempts per session reached');
}
```

**PROBLEM:**
- Limit is per session only
- Player can end session and start new one
- Cheat 3 times, end, start, cheat 3 more
- Infinite attempts with no cooldown

**FIX NEEDED:**
```typescript
// Check session limit
if (session.cheatAttempts >= 3) {
  throw new Error('Maximum cheat attempts per session reached');
}

// Check recent attempts across sessions
const history = await GamblingHistory.findByCharacter(characterId);
if (history) {
  const recentCheats = await CheatAttemptLog.countDocuments({
    characterId,
    timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
  });

  if (recentCheats >= 5) {
    throw new Error('Too many recent cheat attempts. Please wait before trying again.');
  }
}
```

---

#### LOW: Detector Selection Random
**File:** `server/src/services/cheating.service.ts`
**Lines:** 96-107
**Severity:** LOW

```typescript
// Determine who detected (if detected)
let detectedBy: 'DEALER' | 'PLAYER' | 'SECURITY' | 'NONE' = 'NONE';
if (detected) {
  const detectorRoll = SecureRNG.d100();
  if (detectorRoll <= 60) {
    detectedBy = 'DEALER';
  } else if (detectorRoll <= 85) {
    detectedBy = 'SECURITY';
  } else {
    detectedBy = 'PLAYER';
  }
}
```

**PROBLEM:**
- Completely random, doesn't consider context
- Security should be more likely at high-security locations
- Players should be more likely at multiplayer tables
- Dealer likelihood should vary by dealer skill

**FIX NEEDED:**
```typescript
let detectedBy: 'DEALER' | 'PLAYER' | 'SECURITY' | 'NONE' = 'NONE';
if (detected) {
  const location = getGamblingLocationById(session.location);
  const dealerWeight = session.dealerSkillLevel * 10; // 50-100 for dealer
  const securityWeight = location?.securityLevel || 20;
  const playerWeight = session.otherPlayers.length * 5; // More players = more eyes

  const totalWeight = dealerWeight + securityWeight + playerWeight;
  const roll = SecureRNG.d100();
  const normalized = (roll / 100) * totalWeight;

  if (normalized < dealerWeight) {
    detectedBy = 'DEALER';
  } else if (normalized < dealerWeight + securityWeight) {
    detectedBy = 'SECURITY';
  } else {
    detectedBy = 'PLAYER';
  }
}
```

---

### BUG FIXES NEEDED 🐛

#### Bug #1: Reputation Modification Can Fail Silently
**File:** `server/src/services/cheating.service.ts`
**Lines:** 155-164

```typescript
// Reputation loss
if (character.factionReputation) {
  Object.keys(character.factionReputation).forEach(faction => {
    if (character.factionReputation[faction as keyof typeof character.factionReputation] !== undefined) {
      character.factionReputation[faction as keyof typeof character.factionReputation] = Math.max(
        -100,
        character.factionReputation[faction as keyof typeof character.factionReputation] - cheatAttempt.reputationLoss
      );
    }
  });
}
```

**PROBLEM:**
- If factionReputation is undefined, entire block is skipped silently
- Player keeps reputation despite being caught
- No error or warning

**FIX:**
```typescript
// Reputation loss - ensure factionReputation exists
if (!character.factionReputation) {
  character.factionReputation = {};
}

// Apply loss to all factions
const allFactions = ['lawmen', 'outlaws', 'natives', 'settlers'];
for (const faction of allFactions) {
  const currentRep = character.factionReputation[faction] || 0;
  character.factionReputation[faction] = Math.max(
    -100,
    currentRep - cheatAttempt.reputationLoss
  );
}
```

---

### LOGICAL GAPS 🧩

#### Gap #1: No Pattern Detection
**Severity:** MEDIUM

System detects individual cheat attempts but not patterns:
- Always using same method
- Cheating at same location
- Cheating after every loss

**NEEDED:**
```typescript
async function analyzeCheatPattern(
  characterId: string
): Promise<{
  suspicious: boolean;
  reasons: string[];
  riskMultiplier: number;
}> {
  const recentCheats = await CheatAttemptLog.find({
    characterId,
    timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });

  const suspicious = false;
  const reasons: string[] = [];
  let riskMultiplier = 1.0;

  // Check method repetition
  const methodCounts = new Map<CheatMethod, number>();
  for (const cheat of recentCheats) {
    const count = methodCounts.get(cheat.method) || 0;
    methodCounts.set(cheat.method, count + 1);
  }

  for (const [method, count] of methodCounts) {
    if (count >= 5) {
      suspicious = true;
      reasons.push(`Repetitive use of ${method}`);
      riskMultiplier += 0.2;
    }
  }

  // Check success rate
  const successRate = recentCheats.filter(c => c.success).length / recentCheats.length;
  if (successRate > 0.8 && recentCheats.length >= 5) {
    suspicious = true;
    reasons.push('Suspiciously high success rate');
    riskMultiplier += 0.3;
  }

  return { suspicious, reasons, riskMultiplier };
}
```

---

#### Gap #2: No Appeals Process
**Severity:** LOW

Players banned from locations have no recourse:
- No way to appeal
- No way to work off the ban
- Permanent punishment with no redemption

**NEEDED:**
```typescript
async function appealLocationBan(
  characterId: string,
  location: string,
  compensationOffered: number
): Promise<{
  accepted: boolean;
  reason: string;
  unbanned?: boolean;
}> {
  const history = await GamblingHistory.findByCharacter(characterId);
  if (!history) {
    throw new Error('No gambling history found');
  }

  if (!history.isBannedFrom(location)) {
    throw new Error('Not banned from this location');
  }

  // Calculate required compensation
  const timesCaught = history.timesCaughtCheating;
  const baseFine = 5000;
  const requiredCompensation = baseFine * timesCaught;

  if (compensationOffered >= requiredCompensation) {
    // Remove ban
    history.bannedLocations = history.bannedLocations.filter(l => l !== location);
    await history.save();

    // Deduct compensation
    const character = await Character.findById(characterId);
    await character?.deductGold(compensationOffered, TransactionSource.BAN_APPEAL);
    await character?.save();

    return {
      accepted: true,
      reason: `Ban lifted for ${location}. Compensation of ${compensationOffered} gold accepted.`,
      unbanned: true
    };
  } else {
    return {
      accepted: false,
      reason: `Insufficient compensation. Required: ${requiredCompensation}, offered: ${compensationOffered}`
    };
  }
}
```

---

## CROSS-SYSTEM ISSUES

### Issue #1: Dual Tournament Systems
**Severity:** HIGH

**Files:**
- `server/src/services/tournament.service.ts` (Deck game tournaments)
- `server/src/services/tournamentManager.service.ts` (Poker tournaments)

**Problem:**
- Two separate implementations for similar functionality
- Unclear which one to use when
- Potential for confusion and bugs
- Code duplication

**Recommendation:**
1. **If intentional separation:** Document the distinction clearly
   - tournament.service.ts: Generic deck game tournaments (poker variants, blackjack, etc.)
   - tournamentManager.service.ts: Structured poker-specific tournaments with blinds
2. **If unintentional:** Consolidate into single system with different tournament types

---

### Issue #2: No Unified Competitive Ranking
**Severity:** MEDIUM

Each system tracks its own leaderboards:
- Tournaments have no lifetime stats
- Shooting contests have ShootingRecord
- Gambling has GamblingHistory
- Leaderboards are separate

**Problem:**
- No "master competitive rank" for players
- Can't compare across systems
- Missing cross-system achievements

**Recommendation:**
```typescript
interface CompetitiveProfile {
  characterId: mongoose.Types.ObjectId;

  // Overall
  totalCompetitiveEvents: number;
  totalPrizeMoney: number;
  overallRanking: number;

  // By system
  tournamentStats: {
    entered: number;
    won: number;
    totalPrizes: number;
    rating: number;
  };

  shootingStats: {
    contestsEntered: number;
    contestsWon: number;
    averageAccuracy: number;
    rating: number;
  };

  gamblingStats: {
    sessionsPlayed: number;
    netProfit: number;
    rating: number;
  };

  // Unified rating
  competitiveRating: number; // Composite of all systems
}
```

---

### Issue #3: Inconsistent Entry Fee Handling
**Severity:** MEDIUM

Different systems handle entry fees differently:
- **Tournaments:** Deduct immediately, refund on leave
- **Shooting Contests:** Deduct in transaction, no refund on cancel
- **Gambling:** Session-based, no upfront fee

**Problem:**
- Inconsistent UX
- Different refund policies
- Different transaction sources

**Recommendation:** Standardize entry fee handling across all competitive systems.

---

## RECOMMENDATIONS BY PRIORITY

### CRITICAL (Fix Immediately)

1. **Tournament Game State Persistence** - Move from in-memory Map to Redis/DB
2. **Shooting Contest Refunds** - Implement refund logic for cancelled contests
3. **Gambling PUSH Logic** - Fix gold handling for push results

### HIGH (Fix in Next Sprint)

4. **Tournament Tie-Breaking** - Implement proper tiebreaker logic
5. **Missing Leaderboard Indexes** - Add database indexes for performance
6. **Gambling Item Integration** - Complete the gambling items system
7. **Hit Zone Selection Fix** - Correct the backwards difficulty algorithm

### MEDIUM (Plan for Future)

8. **Leaderboard Caching** - Implement Redis caching
9. **Tournament Timeouts** - Add match timeout and forfeit system
10. **Cheat Cooldowns** - Prevent rapid-fire cheat attempts
11. **Session Auto-Cleanup** - Close abandoned gambling sessions
12. **Tournament TODOs** - Replace hardcoded template references

### LOW (Nice to Have)

13. **Double Elimination Tournaments** - Complete the implementation
14. **Tournament Seeding** - Add seeding options
15. **Shooting Practice Mode** - Allow practice before contests
16. **Responsible Gambling** - Add self-exclusion and limits
17. **Seasonal Leaderboards** - Add time-based competitions

---

## TESTING RECOMMENDATIONS

### Unit Tests Needed

1. **Tournament Bracket Generation**
   - Test with 2, 4, 8, 16, 32, 64 participants
   - Test with odd numbers requiring byes
   - Test advancement logic

2. **Shooting Mechanics**
   - Test accuracy calculations with various factors
   - Test hit zone selection probability distribution
   - Test weather impact calculations

3. **Gambling Outcomes**
   - Test house edge implementation
   - Test all game types (blackjack, roulette, craps, etc.)
   - Test SecureRNG distribution

4. **Cheating Detection**
   - Test detection chance calculations
   - Test skill/item modifiers
   - Test consequence application

### Integration Tests Needed

1. **Full Tournament Flow**
   - Registration → Start → Matches → Completion → Prize distribution
   - Test with multiple concurrent tournaments

2. **Shooting Contest Flow**
   - Registration → Start → Rounds → Elimination → Completion → Prizes
   - Test with weather variations

3. **Gambling Session Flow**
   - Start → Multiple bets → End → History update
   - Test cheating attempts and consequences

### Load Tests Needed

1. **Concurrent Tournament Matches**
   - 64-player tournament with simultaneous matches
   - Test distributed locking under load

2. **Leaderboard Performance**
   - Query with 10,000+ characters
   - Test without indexes vs with indexes

3. **Gambling Session Concurrency**
   - Multiple players at same table
   - Rapid betting sequences

---

## CONCLUSION

The competitive systems show **mixed quality** with some well-architected components (shooting mechanics, addiction tracking) alongside critical issues (in-memory state, missing refunds, incomplete features).

### Key Strengths
- Good use of SecureRNG for fair outcomes
- Comprehensive tracking systems (history, records)
- Distributed locking for concurrency
- Rich gameplay mechanics in shooting system

### Key Weaknesses
- Dual tournament systems causing confusion
- Critical state stored in memory (will be lost on restart)
- Incomplete implementations (TODOs, missing features)
- Missing indexes for performance
- Inconsistent error handling across systems

### Immediate Action Items
1. Move tournament game state to persistent storage (Redis/DB)
2. Implement shooting contest refunds
3. Fix gambling PUSH logic
4. Add database indexes for leaderboards
5. Complete gambling items integration

### Overall Grade: C+ (71/100)
- **Architecture:** B- (Some good patterns, but dual systems and memory issues)
- **Implementation:** C (Many incomplete features and TODOs)
- **Security:** B+ (Good use of SecureRNG and locking)
- **Performance:** D (Missing indexes, no caching)
- **Reliability:** C- (Memory state loss risk, missing error handling)

The systems are **functional but not production-ready**. Critical fixes are needed before launch to prevent data loss and ensure fair gameplay.

---

**End of Audit Report**
