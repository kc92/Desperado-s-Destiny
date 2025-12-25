# Comprehensive Remediation Plan v3

## Executive Summary

**Total Issues:** 64+ actionable items across 6 categories
**Estimated Effort:** 4-5 implementation phases
**Priority:** Security > Game Exploits > Performance > Error Handling > Client

---

# PHASE 1: CRITICAL SECURITY FIXES

## 1.1 Regex Injection in Character Lookup
**File:** `server/src/sockets/chatHandlers.ts:368`
**Severity:** CRITICAL
**Effort:** 15 minutes

**Current Code:**
```typescript
const targetChar = await Character.findOne({
  name: new RegExp(`^${targetName}$`, 'i'),
  isActive: true
});
```

**Fix:** Create and use regex escape utility
```typescript
// Add to server/src/utils/stringUtils.ts
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// In chatHandlers.ts:368
import { escapeRegex } from '../utils/stringUtils';
const escapedName = escapeRegex(targetName);
const targetChar = await Character.findOne({
  name: new RegExp(`^${escapedName}$`, 'i'),
  isActive: true
});
```

**Also fix in:**
- `server/src/utils/adminCommands.ts:177-180, 222-225, 263-266, 343-346`

---

## 1.2 Remove Deprecated Auth Middleware
**File:** `server/src/middleware/requireAuth.ts`
**Severity:** CRITICAL
**Effort:** 1-2 hours

**Problem:** File hardcodes `emailVerified: true` and `role: 'user'`, bypassing actual verification.

**Impact Analysis - Files importing from requireAuth.ts:**
```
Routes using DEPRECATED middleware:
- death.routes.ts
- bounty.routes.ts
- dailyContract.routes.ts
- bossEncounter.routes.ts
- bank.routes.ts
- cosmic.routes.ts

Middleware using ONLY the type (safe):
- actionInfluence.middleware.ts (AuthRequest type only)
- antiExploit.middleware.ts (AuthRequest type only)
- characterOwnership.middleware.ts (AuthRequest type only)
- gangPermission.ts (AuthRequest type only)
- jail.middleware.ts (AuthRequest type only)
```

**Fix Steps:**
1. Update all routes importing deprecated middleware:
```typescript
// CHANGE FROM:
import { requireAuth } from '../middleware/requireAuth';
// TO:
import { requireAuth } from '../middleware/auth.middleware';
```

2. Update type imports:
```typescript
// CHANGE FROM:
import { AuthRequest } from './requireAuth';
// TO:
import { AuthenticatedRequest } from './auth.middleware';
// OR keep AuthRequest as alias in auth.middleware.ts
```

3. Add type alias to auth.middleware.ts for compatibility:
```typescript
// Add to auth.middleware.ts
export type AuthRequest = AuthenticatedRequest;
```

4. Delete `server/src/middleware/requireAuth.ts`

---

## 1.3 Rate Limit Username Check Endpoint
**File:** `server/src/routes/auth.routes.ts:57`
**Severity:** HIGH
**Effort:** 15 minutes

**Current Code:**
```typescript
router.get('/check-username', asyncHandler(checkUsername));
```

**Fix:**
```typescript
// Add to auth.routes.ts imports
import { createRateLimiter } from '../middleware/rateLimiter';

// Create specific limiter
const usernameCheckLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 checks per hour
  message: 'Too many username checks, please try again later',
  keyGenerator: (req) => req.ip || 'unknown'
});

// Apply to route
router.get('/check-username', usernameCheckLimiter, asyncHandler(checkUsername));
```

---

## 1.4 Protect Leaderboard Routes
**File:** `server/src/routes/leaderboard.routes.ts`
**Severity:** HIGH
**Effort:** 30 minutes

**Options:**
1. Add authentication (recommended for detailed stats)
2. Add aggressive rate limiting (if must remain public)

**Fix Option 1 - Add Auth:**
```typescript
import { requireAuth } from '../middleware/auth.middleware';
import { createRateLimiter } from '../middleware/rateLimiter';

const leaderboardLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30
});

router.use(leaderboardLimiter);
router.get('/level', requireAuth, getLevelLeaderboard);
router.get('/gold', requireAuth, getGoldLeaderboard);
// ... etc
```

---

## 1.5 Add Duel Idempotency Tokens
**File:** `server/src/sockets/duelHandlers.ts:982-1124`
**Severity:** CRITICAL
**Effort:** 2-3 hours

**Problem:** No double-submission prevention. Client can send bet twice.

**Fix - Add submission tracking:**
```typescript
// Add to duelHandlers.ts at module level
const processedActions = new Map<string, Set<string>>();

// Cleanup function
function cleanupProcessedActions(duelId: string): void {
  processedActions.delete(duelId);
}

// In handleBet (line ~1000)
async function handleBet(socket: AuthenticatedSocket, payload: BetPayload) {
  const { duelId, action, amount, actionId } = payload; // Client must send unique actionId

  // Check idempotency
  const duelActions = processedActions.get(duelId) || new Set();
  if (duelActions.has(actionId)) {
    socket.emit('duel:error', { error: 'Action already processed', code: 'DUPLICATE_ACTION' });
    return;
  }

  // Mark as processing
  duelActions.add(actionId);
  processedActions.set(duelId, duelActions);

  try {
    // ... existing bet logic
  } catch (error) {
    // Remove from processed on failure so retry is possible
    duelActions.delete(actionId);
    throw error;
  }
}
```

**Client-side change:**
```typescript
// In useDuelSocket.ts - generate unique action IDs
const bet = (action: BettingAction, amount?: number) => {
  const actionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  socketService.emit('duel:bet', { duelId, action, amount, actionId });
};
```

---

# PHASE 2: GAME LOGIC HARDENING

## 2.1 Duel Wager Timeout Recovery
**File:** `server/src/services/duel.service.ts`
**Severity:** CRITICAL
**Effort:** 2 hours

**Problem:** Locked gold can be stuck forever if duel gets corrupted.

**Fix - Add cleanup job:**
```typescript
// Create server/src/jobs/duelCleanup.job.ts
import { Duel, DuelStatus, DuelType } from '../models/Duel.model';
import { Character } from '../models/Character.model';
import logger from '../utils/logger';

const STUCK_DUEL_THRESHOLD_HOURS = 24;

export async function cleanupStuckDuels(): Promise<void> {
  const threshold = new Date(Date.now() - STUCK_DUEL_THRESHOLD_HOURS * 60 * 60 * 1000);

  // Find wager duels stuck in non-terminal states
  const stuckDuels = await Duel.find({
    type: DuelType.WAGER,
    status: { $nin: [DuelStatus.COMPLETED, DuelStatus.CANCELLED, DuelStatus.EXPIRED] },
    updatedAt: { $lt: threshold }
  });

  for (const duel of stuckDuels) {
    try {
      // Unlock gold for both players
      await Character.bulkWrite([
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
      ]);

      duel.status = DuelStatus.EXPIRED;
      await duel.save();

      logger.warn(`Cleaned up stuck duel ${duel._id}, returned ${duel.wagerAmount} gold to each player`);
    } catch (error) {
      logger.error(`Failed to cleanup stuck duel ${duel._id}:`, error);
    }
  }
}
```

**Register in scheduler:**
```typescript
// In server.ts or jobs index
import { cleanupStuckDuels } from './jobs/duelCleanup.job';
import cron from 'node-cron';

cron.schedule('0 * * * *', cleanupStuckDuels); // Every hour
```

---

## 2.2 Boss Cooldown Distributed Lock
**File:** `server/src/services/combat.service.ts:738-757`
**Severity:** MEDIUM
**Effort:** 1 hour

**Problem:** Race condition allows fighting same boss twice.

**Fix:**
```typescript
import { withLock } from '../utils/distributedLock';

static async getAvailableBosses(characterId: string): Promise<BossInfo[]> {
  // Use lock to prevent concurrent boss fight initiation
  return withLock(`boss-check:${characterId}`, async () => {
    // ... existing logic
  }, { ttl: 5000 });
}

static async initiateBossEncounter(characterId: string, bossId: string): Promise<CombatEncounter> {
  return withLock(`boss-fight:${characterId}:${bossId}`, async () => {
    // Check cooldown INSIDE lock
    const recentDefeat = await CombatEncounter.findOne({
      characterId,
      npcId: bossId,
      status: CombatStatus.PLAYER_VICTORY,
      endedAt: { $gte: new Date(Date.now() - boss.cooldownMs) }
    });

    if (recentDefeat) {
      throw new Error('Boss is still on cooldown');
    }

    // ... create encounter
  }, { ttl: 30000 });
}
```

---

## 2.3 XP Level-Up Loop Protection
**File:** `server/src/services/characterProgression.service.ts:105-128`
**Severity:** MEDIUM
**Effort:** 30 minutes

**Fix:**
```typescript
const MAX_LEVELS_PER_BATCH = 10;

static async processLevelUps(character: ICharacter): Promise<number> {
  let levelsGained = 0;

  while (character.level < PROGRESSION.MAX_LEVEL && levelsGained < MAX_LEVELS_PER_BATCH) {
    const xpNeeded = this.calculateXPForLevel(character.level);
    if (character.experience < xpNeeded) break;

    character.experience -= xpNeeded;
    character.level += 1;
    levelsGained += 1;
  }

  if (levelsGained >= MAX_LEVELS_PER_BATCH) {
    logger.warn(`Character ${character._id} hit level-up batch limit, may need additional processing`);
  }

  return levelsGained;
}
```

---

## 2.4 Energy Retry Exponential Backoff
**File:** `server/src/services/energy.service.ts:215-221`
**Severity:** MEDIUM
**Effort:** 30 minutes

**Current (recursive retry):**
```typescript
if (!result) {
  return this.spend(characterId, cost, session); // Infinite recursion risk
}
```

**Fix:**
```typescript
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 50;

static async spend(
  characterId: string,
  cost: number,
  session?: mongoose.ClientSession,
  retryCount: number = 0
): Promise<EnergySpendResult> {
  // ... optimistic lock attempt

  if (!result) {
    if (retryCount >= MAX_RETRIES) {
      throw new Error('Energy spend failed after max retries - concurrent modification');
    }

    // Exponential backoff
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, retryCount)));
    return this.spend(characterId, cost, session, retryCount + 1);
  }

  // ... success path
}
```

---

## 2.5 Gang Treasury Transaction Scope
**File:** `server/src/services/gangEconomy.service.ts:164-235`
**Severity:** HIGH
**Effort:** 1 hour

**Fix:** Ensure gang membership check and withdrawal are atomic:
```typescript
static async withdrawFromBank(
  gangId: string,
  characterId: string,
  amount: number
): Promise<WithdrawResult> {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Lock and verify gang membership in same transaction
    const gang = await Gang.findOneAndUpdate(
      {
        _id: gangId,
        'members.characterId': characterId,
        'members.role': { $in: [GangRole.LEADER, GangRole.OFFICER] },
        treasury: { $gte: amount }
      },
      { $inc: { treasury: -amount } },
      { session, new: true }
    );

    if (!gang) {
      throw new Error('Withdrawal failed: insufficient funds or permission denied');
    }

    // Credit character
    await Character.findByIdAndUpdate(
      characterId,
      { $inc: { gold: amount } },
      { session }
    );

    await session.commitTransaction();
    return { success: true, newTreasury: gang.treasury };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

# PHASE 3: DATABASE PERFORMANCE

## 3.1 Fix N+1 in Leaderboard Gang Lookups
**File:** `server/src/services/influenceLeaderboard.service.ts:51-59`
**Severity:** CRITICAL
**Effort:** 1 hour

**Current (N+1 pattern):**
```typescript
for (let i = 0; i < contributions.length; i++) {
  const gang = await Gang.findById(character.gangId).select('name').lean();
}
```

**Fix - Batch load all gangs:**
```typescript
static async getGlobalLeaderboard(limit: number = 100): Promise<InfluenceLeaderboardEntry[]> {
  const contributions = await FactionInfluenceContribution
    .find({})
    .sort({ totalInfluenceContributed: -1 })
    .limit(limit)
    .populate('characterId', 'name level gangId')
    .lean();

  // Collect unique gang IDs
  const gangIds = [...new Set(
    contributions
      .map(c => (c.characterId as any)?.gangId?.toString())
      .filter(Boolean)
  )];

  // Batch load all gangs in one query
  const gangs = await Gang.find({ _id: { $in: gangIds } })
    .select('_id name')
    .lean();

  // Create lookup map
  const gangMap = new Map(gangs.map(g => [g._id.toString(), g.name]));

  // Build entries without additional queries
  return contributions.map((contrib, i) => {
    const character = contrib.characterId as any;
    return {
      rank: i + 1,
      characterId: character._id.toString(),
      characterName: character.name,
      characterLevel: character.level,
      factionId: contrib.factionId,
      totalInfluence: contrib.totalInfluenceContributed,
      gangId: character.gangId?.toString(),
      gangName: character.gangId ? gangMap.get(character.gangId.toString()) : undefined,
    };
  });
}
```

---

## 3.2 Add Missing Database Indexes
**Files:** Multiple model files
**Severity:** HIGH
**Effort:** 1 hour

**Create index migration script:**
```typescript
// server/src/scripts/addMissingIndexes.ts
import mongoose from 'mongoose';
import { Character } from '../models/Character.model';
import { MarketListing } from '../models/MarketListing.model';
import { TerritoryInfluence } from '../models/TerritoryInfluence.model';
import logger from '../utils/logger';

export async function addMissingIndexes(): Promise<void> {
  logger.info('Adding missing indexes...');

  // Character indexes
  await Character.collection.createIndex({ gangId: 1 });
  await Character.collection.createIndex({ currentLocation: 1 });
  await Character.collection.createIndex({ userId: 1, faction: 1 });
  await Character.collection.createIndex({ isJailed: 1 });

  // MarketListing indexes
  await MarketListing.collection.createIndex({ sellerId: 1, status: 1 });
  await MarketListing.collection.createIndex({ category: 1, status: 1 });
  await MarketListing.collection.createIndex({ 'item.rarity': 1, expiresAt: 1 });
  await MarketListing.collection.createIndex({ featured: 1, listedAt: -1 });

  // TerritoryInfluence indexes
  await TerritoryInfluence.collection.createIndex({ territoryId: 1 });
  await TerritoryInfluence.collection.createIndex({ controllingFaction: 1 });
  await TerritoryInfluence.collection.createIndex({ 'factionInfluence.factionId': 1 });

  logger.info('Missing indexes added successfully');
}
```

---

## 3.3 Fix Unbounded Territory Queries
**File:** `server/src/jobs/warEventScheduler.job.ts:341,428`
**Severity:** CRITICAL
**Effort:** 30 minutes

**Current:**
```typescript
const territories = await Territory.find().session(session);
candidates = territories.filter(t => t.difficulty >= 6);
```

**Fix - Use query filter:**
```typescript
// For high difficulty territories
const candidates = await Territory.find({
  difficulty: { $gte: 6 },
  isActive: true
}).session(session).lean();

// If need all territories, add pagination
const BATCH_SIZE = 100;
let skip = 0;
let batch;
const allTerritories = [];

do {
  batch = await Territory.find()
    .skip(skip)
    .limit(BATCH_SIZE)
    .session(session)
    .lean();
  allTerritories.push(...batch);
  skip += BATCH_SIZE;
} while (batch.length === BATCH_SIZE);
```

---

# PHASE 4: ERROR HANDLING & LOGGING

## 4.1 Replace Console.error with Logger (404 instances)
**Severity:** HIGH
**Effort:** 2-3 hours

**Automated approach:**
```bash
# PowerShell script to find all console.error
Get-ChildItem -Path "server/src" -Recurse -Include "*.ts" |
  Select-String -Pattern "console\.error" |
  Group-Object Path |
  ForEach-Object { "$($_.Name): $($_.Count) instances" }
```

**Key files to fix (highest count):**
1. `jobs/eventSpawner.job.ts` - 6 instances
2. `jobs/productionTick.job.ts` - 6 instances
3. `jobs/calendarTick.job.ts` - 4 instances
4. `jobs/newspaperPublisher.job.ts` - 4 instances
5. `scripts/createIndexes.ts` - 3 instances

**Pattern replacement:**
```typescript
// FROM:
console.error('[JobName] Error:', error);

// TO:
import logger from '../utils/logger';
logger.error('[JobName] Error:', { error, context: { /* relevant data */ } });
```

---

## 4.2 Socket Handler Error Emission
**File:** `server/src/sockets/chatHandlers.ts:73-92` and `duelHandlers.ts`
**Severity:** HIGH
**Effort:** 2 hours

**Current (fire-and-forget):**
```typescript
authSocket.on('chat:join_room', (payload) => {
  void handleJoinRoom(authSocket, payload);
});
```

**Fix - Wrap with error handler:**
```typescript
function wrapSocketHandler<T>(
  handler: (socket: AuthenticatedSocket, payload: T) => Promise<void>,
  errorEvent: string
) {
  return async (socket: AuthenticatedSocket, payload: T) => {
    try {
      await handler(socket, payload);
    } catch (error) {
      logger.error(`Socket handler error:`, { error, event: errorEvent });
      socket.emit(errorEvent, {
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'HANDLER_ERROR'
      });
    }
  };
}

// Usage
authSocket.on('chat:join_room', (payload) => {
  wrapSocketHandler(handleJoinRoom, 'chat:error')(authSocket, payload);
});
```

---

## 4.3 Add Correlation ID Middleware
**Severity:** HIGH
**Effort:** 1 hour

**Create middleware:**
```typescript
// server/src/middleware/correlationId.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
    }
  }
}

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  // Add to logger context for this request
  logger.defaultMeta = { ...logger.defaultMeta, correlationId };

  next();
}
```

**Apply in server.ts:**
```typescript
import { correlationIdMiddleware } from './middleware/correlationId.middleware';
app.use(correlationIdMiddleware);
```

---

# PHASE 5: CLIENT-SIDE FIXES

## 5.1 Fix useEnergy Interval Accumulation
**File:** `client/src/hooks/useEnergy.ts:222-230`
**Severity:** HIGH
**Effort:** 30 minutes

**Current (interval recreated on dependency change):**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    regenerate();
  }, 60000);
  return () => clearInterval(interval);
}, [energyStatus, regenerate]); // Dependencies cause recreation
```

**Fix - Use ref to track interval:**
```typescript
const intervalRef = useRef<NodeJS.Timeout | null>(null);

useEffect(() => {
  // Clear any existing interval
  if (intervalRef.current) {
    clearInterval(intervalRef.current);
  }

  // Only start if we have energy status and not at max
  if (energyStatus && energyStatus.current < energyStatus.max) {
    intervalRef.current = setInterval(() => {
      regenerate();
    }, 60000);
  }

  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
}, [energyStatus?.current, energyStatus?.max]); // Minimal dependencies

// Store regenerate in ref to avoid stale closure
const regenerateRef = useRef(regenerate);
regenerateRef.current = regenerate;
```

---

## 5.2 Add Message Virtualization
**File:** `client/src/components/chat/ChatWindow.tsx`
**Severity:** MEDIUM
**Effort:** 2-3 hours

**Install dependency:**
```bash
npm install @tanstack/react-virtual
```

**Implementation:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const ChatWindow: React.FC = () => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: activeRoomMessages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Estimated message height
    overscan: 5
  });

  return (
    <div ref={parentRef} className="chat-messages-container">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map(virtualItem => {
          const message = activeRoomMessages[virtualItem.index];
          return (
            <div
              key={message._id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`
              }}
            >
              <Message message={message} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

---

## 5.3 Fix Timer Leak in Rate Limit Handler
**File:** `client/src/store/useChatStore.ts:352-366`
**Severity:** CRITICAL
**Effort:** 30 minutes

**Fix - Track and clear timeouts:**
```typescript
// Add at module level
let mutedUntilTimeoutId: NodeJS.Timeout | null = null;

// In the rate_limit_exceeded handler
addTrackedListener('rate_limit_exceeded', (data) => {
  // Clear any existing timeout
  if (mutedUntilTimeoutId) {
    clearTimeout(mutedUntilTimeoutId);
    mutedUntilTimeoutId = null;
  }

  set({
    mutedUntil: new Date(Date.now() + data.retryAfter * 1000),
    error: `Rate limited. Try again in ${data.retryAfter} seconds`
  });

  mutedUntilTimeoutId = setTimeout(() => {
    set({ mutedUntil: null });
    mutedUntilTimeoutId = null;
  }, data.retryAfter * 1000);
});

// In cleanup function
cleanup: () => {
  if (mutedUntilTimeoutId) {
    clearTimeout(mutedUntilTimeoutId);
    mutedUntilTimeoutId = null;
  }
  // ... rest of cleanup
}
```

---

# IMPLEMENTATION TIMELINE

## Week 1: Critical Security
| Day | Tasks | Files |
|-----|-------|-------|
| 1 | 1.1 Regex injection fix | chatHandlers.ts, adminCommands.ts |
| 1 | 1.2 Deprecated auth migration (start) | 10+ route files |
| 2 | 1.2 Deprecated auth migration (complete) | middleware files |
| 2 | 1.3 Username rate limit | auth.routes.ts |
| 3 | 1.4 Leaderboard protection | leaderboard.routes.ts |
| 3 | 1.5 Duel idempotency (start) | duelHandlers.ts |
| 4 | 1.5 Duel idempotency (complete) | useDuelSocket.ts |
| 5 | Testing & verification | All phase 1 files |

## Week 2: Game Logic
| Day | Tasks | Files |
|-----|-------|-------|
| 1 | 2.1 Duel cleanup job | duelCleanup.job.ts (new) |
| 2 | 2.2 Boss cooldown lock | combat.service.ts |
| 2 | 2.3 XP loop protection | characterProgression.service.ts |
| 3 | 2.4 Energy retry backoff | energy.service.ts |
| 3 | 2.5 Gang treasury scope | gangEconomy.service.ts |
| 4-5 | Testing & verification | All phase 2 files |

## Week 3: Performance
| Day | Tasks | Files |
|-----|-------|-------|
| 1 | 3.1 Leaderboard N+1 fix | influenceLeaderboard.service.ts |
| 2 | 3.2 Add missing indexes | addMissingIndexes.ts (new) |
| 3 | 3.3 Unbounded query fixes | warEventScheduler.job.ts |
| 4-5 | Performance testing | Load tests |

## Week 4: Error Handling & Client
| Day | Tasks | Files |
|-----|-------|-------|
| 1 | 4.1 Console.error replacement (jobs) | 10+ job files |
| 2 | 4.2 Socket error handling | chatHandlers.ts, duelHandlers.ts |
| 2 | 4.3 Correlation ID | correlationId.middleware.ts (new) |
| 3 | 5.1 useEnergy interval fix | useEnergy.ts |
| 3 | 5.3 Timer leak fix | useChatStore.ts |
| 4 | 5.2 Message virtualization | ChatWindow.tsx |
| 5 | Final testing | All files |

---

# SUCCESS CRITERIA

| Metric | Before | After |
|--------|--------|-------|
| Critical vulnerabilities | 7 | 0 |
| High severity issues | 22 | 0 |
| Console.error usage (server) | 404 | 0 |
| N+1 query patterns | 5+ | 0 |
| Unbounded queries | 8+ | 0 |
| Timer/interval leaks | 3+ | 0 |
| TypeScript errors | 0 | 0 |
| Production build | Pass | Pass |
