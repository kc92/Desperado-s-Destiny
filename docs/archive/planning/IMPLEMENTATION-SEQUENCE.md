# Implementation Sequence: Foundation-First Approach

## Philosophy

**Principle:** Build abstractions FIRST, then migrate existing code to use them.

**Why this matters:**
- Scattered fixes create inconsistent patterns
- Retroactive fixes without foundations lead to bugs
- Each phase should be independently testable
- Rollback is clean (disable new code, old still works)

---

# PHASE 0: FOUNDATION UTILITIES
**Goal:** Create reusable utilities that will be used across all subsequent phases.
**Duration:** 2-3 hours
**Dependencies:** None

## 0.1 String Utilities (NEW FILE)
**File:** `server/src/utils/stringUtils.ts`

```typescript
/**
 * String Utilities
 * Safe string manipulation functions
 */

/**
 * Escape special regex characters to prevent injection
 * @param str - User input to escape
 * @returns Escaped string safe for RegExp constructor
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Create case-insensitive exact match regex safely
 * @param str - String to match exactly
 * @returns RegExp that matches string case-insensitively
 */
export function createExactMatchRegex(str: string): RegExp {
  return new RegExp(`^${escapeRegex(str)}$`, 'i');
}

/**
 * Truncate string with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length including ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}
```

**Used by:** chatHandlers.ts, adminCommands.ts (4+ locations)

---

## 0.2 Validation Schemas (NEW FILE)
**File:** `server/src/utils/validation.ts`

```typescript
/**
 * Validation Utilities
 * Centralized input validation with type-safe results
 */

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

/**
 * Validate pagination parameters with safe defaults
 */
export interface PaginationParams {
  limit: number;
  offset: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function validatePagination(
  input: { limit?: unknown; offset?: unknown; page?: unknown; sortBy?: unknown; sortOrder?: unknown },
  options: { maxLimit?: number; defaultLimit?: number } = {}
): ValidationResult<PaginationParams> {
  const { maxLimit = 100, defaultLimit = 50 } = options;
  const errors: string[] = [];

  // Parse limit
  let limit = defaultLimit;
  if (input.limit !== undefined) {
    const parsed = Number(input.limit);
    if (!Number.isFinite(parsed) || parsed < 1) {
      errors.push('limit must be a positive number');
    } else {
      limit = Math.min(Math.floor(parsed), maxLimit);
    }
  }

  // Parse offset (or calculate from page)
  let offset = 0;
  if (input.page !== undefined) {
    const parsed = Number(input.page);
    if (!Number.isFinite(parsed) || parsed < 1) {
      errors.push('page must be a positive number');
    } else {
      offset = (Math.floor(parsed) - 1) * limit;
    }
  } else if (input.offset !== undefined) {
    const parsed = Number(input.offset);
    if (!Number.isFinite(parsed) || parsed < 0) {
      errors.push('offset must be a non-negative number');
    } else {
      offset = Math.floor(parsed);
    }
  }

  // Parse sortOrder
  let sortOrder: 'asc' | 'desc' = 'desc';
  if (input.sortOrder !== undefined) {
    if (input.sortOrder !== 'asc' && input.sortOrder !== 'desc') {
      errors.push('sortOrder must be "asc" or "desc"');
    } else {
      sortOrder = input.sortOrder;
    }
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      limit,
      offset,
      sortBy: typeof input.sortBy === 'string' ? input.sortBy : undefined,
      sortOrder
    }
  };
}

/**
 * Validate positive integer
 */
export function validatePositiveInt(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number } = {}
): ValidationResult<number> {
  const { min = 1, max = Number.MAX_SAFE_INTEGER } = options;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
    return { success: false, errors: [`${fieldName} must be an integer`] };
  }
  if (parsed < min) {
    return { success: false, errors: [`${fieldName} must be at least ${min}`] };
  }
  if (parsed > max) {
    return { success: false, errors: [`${fieldName} must be at most ${max}`] };
  }

  return { success: true, data: parsed };
}

/**
 * Validate MongoDB ObjectId format
 */
export function isValidObjectId(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return /^[a-fA-F0-9]{24}$/.test(value);
}

/**
 * Validate enum value against allowed values
 */
export function validateEnum<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  fieldName: string
): ValidationResult<T> {
  if (typeof value !== 'string') {
    return { success: false, errors: [`${fieldName} must be a string`] };
  }
  if (!allowedValues.includes(value as T)) {
    return {
      success: false,
      errors: [`${fieldName} must be one of: ${allowedValues.join(', ')}`]
    };
  }
  return { success: true, data: value as T };
}
```

**Used by:** All controllers for query/body validation

---

## 0.3 Socket Handler Wrapper (NEW FILE)
**File:** `server/src/utils/socketHandlerWrapper.ts`

```typescript
/**
 * Socket Handler Wrapper
 * Provides error handling, logging, and validation for socket events
 */

import { AuthenticatedSocket } from '../middleware/socketAuth';
import logger from './logger';
import { sanitizeErrorMessage } from './errors';

type SocketHandler<T> = (socket: AuthenticatedSocket, payload: T) => Promise<void>;

interface WrapperOptions {
  /** Event name for error emission */
  errorEvent?: string;
  /** Whether to log the payload (default: false for security) */
  logPayload?: boolean;
  /** Validation function for payload */
  validate?: (payload: unknown) => { valid: boolean; errors?: string[] };
}

/**
 * Wrap a socket handler with error handling, logging, and optional validation
 */
export function wrapSocketHandler<T>(
  eventName: string,
  handler: SocketHandler<T>,
  options: WrapperOptions = {}
): (socket: AuthenticatedSocket, payload: T) => void {
  const {
    errorEvent = `${eventName}:error`,
    logPayload = false,
    validate
  } = options;

  return (socket: AuthenticatedSocket, payload: T) => {
    // Wrap in async IIFE to handle promise
    (async () => {
      const startTime = Date.now();
      const { userId, characterId } = socket.data;

      try {
        // Validate payload if validator provided
        if (validate) {
          const validation = validate(payload);
          if (!validation.valid) {
            socket.emit(errorEvent, {
              error: 'Invalid payload',
              code: 'VALIDATION_ERROR',
              details: validation.errors
            });
            return;
          }
        }

        // Execute handler
        await handler(socket, payload);

        // Log success (debug level)
        logger.debug(`Socket ${eventName} completed`, {
          userId,
          characterId,
          duration: Date.now() - startTime,
          ...(logPayload && { payload })
        });

      } catch (error) {
        // Log error
        logger.error(`Socket ${eventName} failed`, {
          userId,
          characterId,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          duration: Date.now() - startTime
        });

        // Emit error to client
        socket.emit(errorEvent, {
          error: sanitizeErrorMessage(error),
          code: 'HANDLER_ERROR'
        });
      }
    })();
  };
}

/**
 * Create idempotency tracker for socket events
 * Prevents duplicate processing of the same action
 */
export class IdempotencyTracker {
  private processed = new Map<string, Set<string>>();
  private readonly ttlMs: number;

  constructor(ttlMs: number = 60000) {
    this.ttlMs = ttlMs;
  }

  /**
   * Check if action was already processed
   * @returns true if this is a duplicate
   */
  isDuplicate(contextId: string, actionId: string): boolean {
    const actions = this.processed.get(contextId);
    return actions?.has(actionId) ?? false;
  }

  /**
   * Mark action as processed
   */
  markProcessed(contextId: string, actionId: string): void {
    let actions = this.processed.get(contextId);
    if (!actions) {
      actions = new Set();
      this.processed.set(contextId, actions);
    }
    actions.add(actionId);

    // Auto-cleanup after TTL
    setTimeout(() => {
      actions?.delete(actionId);
      if (actions?.size === 0) {
        this.processed.delete(contextId);
      }
    }, this.ttlMs);
  }

  /**
   * Clear all tracked actions for a context (e.g., when duel ends)
   */
  clearContext(contextId: string): void {
    this.processed.delete(contextId);
  }
}

// Singleton for duel action idempotency
export const duelIdempotency = new IdempotencyTracker(300000); // 5 minutes
```

**Used by:** chatHandlers.ts, duelHandlers.ts

---

## 0.4 Service Transaction Helper (EXTEND EXISTING)
**File:** `server/src/utils/transaction.helper.ts` (extend if exists, create if not)

```typescript
/**
 * Transaction Helper
 * Standardized MongoDB transaction patterns
 */

import mongoose from 'mongoose';
import logger from './logger';

export interface TransactionOptions {
  /** Maximum retry attempts on transient errors */
  maxRetries?: number;
  /** Whether to use read concern "snapshot" */
  snapshotRead?: boolean;
}

/**
 * Execute function within a MongoDB transaction with automatic retry
 * Handles session lifecycle and error rollback
 */
export async function withTransaction<T>(
  fn: (session: mongoose.ClientSession) => Promise<T>,
  options: TransactionOptions = {}
): Promise<T> {
  const { maxRetries = 3, snapshotRead = false } = options;

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt < maxRetries) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction({
        readConcern: snapshotRead ? { level: 'snapshot' } : undefined,
        writeConcern: { w: 'majority' }
      });

      const result = await fn(session);

      await session.commitTransaction();
      return result;

    } catch (error) {
      await session.abortTransaction();
      lastError = error as Error;

      // Check if transient error (can retry)
      const isTransient =
        error instanceof Error &&
        (error.message.includes('TransientTransactionError') ||
         error.message.includes('WriteConflict'));

      if (!isTransient) {
        throw error;
      }

      attempt++;
      logger.warn(`Transaction retry ${attempt}/${maxRetries}`, {
        error: error instanceof Error ? error.message : 'Unknown'
      });

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 50 * Math.pow(2, attempt)));

    } finally {
      session.endSession();
    }
  }

  throw lastError || new Error('Transaction failed after max retries');
}

/**
 * Execute function with distributed lock AND transaction
 * For operations that need both concurrency control and atomicity
 */
export async function withLockAndTransaction<T>(
  lockKey: string,
  fn: (session: mongoose.ClientSession) => Promise<T>,
  options: { lockTtl?: number } & TransactionOptions = {}
): Promise<T> {
  const { withLock } = await import('./distributedLock');
  const { lockTtl = 30000, ...transactionOptions } = options;

  return withLock(lockKey, async () => {
    return withTransaction(fn, transactionOptions);
  }, { ttl: lockTtl });
}
```

**Used by:** All services that need atomic operations

---

## 0.5 Update Utils Barrel Export
**File:** `server/src/utils/index.ts` (update)

```typescript
// Add new exports
export * from './stringUtils';
export * from './validation';
export * from './socketHandlerWrapper';
export { withTransaction, withLockAndTransaction } from './transaction.helper';
```

---

# PHASE 1: BASE SERVICE PATTERN
**Goal:** Create optional base patterns that services can adopt incrementally.
**Duration:** 2 hours
**Dependencies:** Phase 0

## 1.1 Service Result Type (NEW FILE)
**File:** `server/src/services/base/serviceResult.ts`

```typescript
/**
 * Service Result Types
 * Standardized return types for service methods
 */

import { AppError } from '../../utils/errors';

/**
 * Result type for service operations
 * Provides explicit success/failure without throwing
 */
export type ServiceResult<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Create successful result
 */
export function ok<T>(data: T): ServiceResult<T> {
  return { success: true, data };
}

/**
 * Create failure result
 */
export function fail<E = AppError>(error: E): ServiceResult<never, E> {
  return { success: false, error };
}

/**
 * Unwrap result, throwing on failure
 */
export function unwrap<T>(result: ServiceResult<T>): T {
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}

/**
 * Map over successful result
 */
export function mapResult<T, U>(
  result: ServiceResult<T>,
  fn: (data: T) => U
): ServiceResult<U> {
  if (!result.success) return result;
  return ok(fn(result.data));
}
```

**Benefits:**
- Services can return explicit success/failure
- Controllers can handle errors without try/catch
- Type-safe error handling

---

## 1.2 Rate Limiter Factory Enhancement
**File:** `server/src/middleware/rateLimiter.ts` (extend)

Add convenience factory for common patterns:

```typescript
// Add to existing rateLimiter.ts

/**
 * Create rate limiter for sensitive endpoints (username checks, password resets)
 */
export const createSensitiveEndpointLimiter = (
  identifier: string,
  maxRequests: number = 30,
  windowMinutes: number = 60
) => createRateLimiter({
  windowMs: windowMinutes * 60 * 1000,
  max: maxRequests,
  message: `Too many ${identifier} requests, please try again later`,
  keyGenerator: (req) => `${identifier}:${req.ip || 'unknown'}`
});

// Pre-built limiters for common cases
export const usernameCheckLimiter = createSensitiveEndpointLimiter('username-check', 30, 60);
export const passwordResetLimiter = createSensitiveEndpointLimiter('password-reset', 5, 60);
export const emailVerifyLimiter = createSensitiveEndpointLimiter('email-verify', 10, 60);
```

---

# PHASE 2: AUTH MIDDLEWARE MIGRATION
**Goal:** Remove deprecated requireAuth.ts, migrate all routes to auth.middleware.ts
**Duration:** 2-3 hours
**Dependencies:** Phase 0, Phase 1

## 2.1 Add Type Alias for Compatibility
**File:** `server/src/middleware/auth.middleware.ts` (modify)

```typescript
// Add at end of file for backward compatibility
export type AuthRequest = AuthenticatedRequest;
```

## 2.2 Migration Order (by dependency risk)

**Low Risk - Only import type:**
1. `middleware/actionInfluence.middleware.ts`
2. `middleware/antiExploit.middleware.ts`
3. `middleware/characterOwnership.middleware.ts`
4. `middleware/gangPermission.ts`
5. `middleware/jail.middleware.ts`

**Change:**
```typescript
// FROM:
import { AuthRequest } from './requireAuth';
// TO:
import { AuthRequest } from './auth.middleware';
```

**Medium Risk - Import requireAuth function:**
1. `routes/bounty.routes.ts`
2. `routes/bank.routes.ts`
3. `routes/death.routes.ts`
4. `routes/dailyContract.routes.ts`
5. `routes/bossEncounter.routes.ts`
6. `routes/cosmic.routes.ts`

**Change:**
```typescript
// FROM:
import { requireAuth } from '../middleware/requireAuth';
// TO:
import { requireAuth } from '../middleware/auth.middleware';
```

## 2.3 Delete Deprecated File
After all migrations verified:
```bash
git rm server/src/middleware/requireAuth.ts
```

## 2.4 Test Each Migration
For each changed route file:
1. Start server, ensure no import errors
2. Hit protected endpoint, verify auth works
3. Hit endpoint without token, verify 401

---

# PHASE 3: CRITICAL SECURITY FIXES
**Goal:** Apply security fixes using the new foundation utilities
**Duration:** 3-4 hours
**Dependencies:** Phase 0, Phase 2

## 3.1 Regex Injection Fix

**Files to update:**
1. `server/src/sockets/chatHandlers.ts:368`
2. `server/src/utils/adminCommands.ts:177, 222, 263, 343`

**Pattern:**
```typescript
// Import at top
import { createExactMatchRegex } from '../utils/stringUtils';

// Replace unsafe patterns:
// FROM:
const targetChar = await Character.findOne({
  name: new RegExp(`^${targetName}$`, 'i'),
  isActive: true
});

// TO:
const targetChar = await Character.findOne({
  name: createExactMatchRegex(targetName),
  isActive: true
});
```

## 3.2 Username Rate Limiting

**File:** `server/src/routes/auth.routes.ts`

```typescript
// Add import
import { usernameCheckLimiter } from '../middleware/rateLimiter';

// Update route (line ~57)
router.get('/check-username', usernameCheckLimiter, asyncHandler(checkUsername));
```

## 3.3 Socket Handler Wrapping

**File:** `server/src/sockets/chatHandlers.ts`

```typescript
// Import wrapper
import { wrapSocketHandler } from '../utils/socketHandlerWrapper';

// Replace fire-and-forget pattern:
// FROM:
authSocket.on('chat:join_room', (payload: JoinRoomPayload) => {
  void handleJoinRoom(authSocket, payload);
});

// TO:
authSocket.on('chat:join_room',
  wrapSocketHandler('chat:join_room', handleJoinRoom, { errorEvent: 'chat:error' })
);
```

## 3.4 Duel Idempotency

**File:** `server/src/sockets/duelHandlers.ts`

```typescript
// Import at top
import { wrapSocketHandler, duelIdempotency } from '../utils/socketHandlerWrapper';

// In handleBet, add idempotency check:
async function handleBet(socket: AuthenticatedSocket, payload: BetPayload) {
  const { duelId, action, amount, actionId } = payload;

  // Check idempotency
  if (!actionId) {
    socket.emit('duel:error', { error: 'actionId required', code: 'MISSING_ACTION_ID' });
    return;
  }

  if (duelIdempotency.isDuplicate(duelId, actionId)) {
    socket.emit('duel:error', { error: 'Action already processed', code: 'DUPLICATE_ACTION' });
    return;
  }

  // Mark as processing BEFORE any async work
  duelIdempotency.markProcessed(duelId, actionId);

  // ... rest of handler
}

// On duel completion, clear context:
function completeDuel(duelId: string) {
  duelIdempotency.clearContext(duelId);
  // ... rest of cleanup
}
```

---

# PHASE 4: DATABASE PERFORMANCE
**Goal:** Add indexes and fix query patterns
**Duration:** 3-4 hours
**Dependencies:** None (can run in parallel with Phase 3)

## 4.1 Create Index Migration Script
**File:** `server/src/scripts/addMissingIndexes.ts`

```typescript
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import logger from '../utils/logger';

const INDEXES = [
  // Character indexes
  { collection: 'characters', index: { gangId: 1 }, options: { sparse: true } },
  { collection: 'characters', index: { currentLocation: 1 } },
  { collection: 'characters', index: { userId: 1, faction: 1 } },
  { collection: 'characters', index: { isJailed: 1 }, options: { sparse: true } },
  { collection: 'characters', index: { isActive: 1 } },

  // MarketListing indexes
  { collection: 'marketlistings', index: { sellerId: 1, status: 1 } },
  { collection: 'marketlistings', index: { category: 1, status: 1 } },
  { collection: 'marketlistings', index: { 'item.rarity': 1, expiresAt: 1 } },
  { collection: 'marketlistings', index: { featured: 1, listedAt: -1 } },

  // TerritoryInfluence indexes
  { collection: 'territoryinfluences', index: { territoryId: 1 } },
  { collection: 'territoryinfluences', index: { controllingFaction: 1 } },

  // GoldTransaction indexes
  { collection: 'goldtransactions', index: { characterId: 1, createdAt: -1 } },
  { collection: 'goldtransactions', index: { source: 1, createdAt: -1 } },

  // CombatEncounter indexes
  { collection: 'combatencounters', index: { characterId: 1, npcId: 1, status: 1 } },
  { collection: 'combatencounters', index: { characterId: 1, endedAt: -1 } },
];

async function createIndexes(): Promise<void> {
  await connectDatabase();

  for (const { collection, index, options } of INDEXES) {
    try {
      await mongoose.connection.collection(collection).createIndex(index, options || {});
      logger.info(`Created index on ${collection}:`, index);
    } catch (error: any) {
      if (error.code === 85 || error.code === 86) {
        logger.info(`Index already exists on ${collection}:`, index);
      } else {
        logger.error(`Failed to create index on ${collection}:`, error);
      }
    }
  }

  logger.info('Index migration complete');
  process.exit(0);
}

createIndexes().catch(console.error);
```

## 4.2 Fix N+1 in Leaderboard
**File:** `server/src/services/influenceLeaderboard.service.ts`

See REMEDIATION-PLAN-V3.md section 3.1 for full implementation.

## 4.3 Fix Unbounded Territory Queries
**File:** `server/src/jobs/warEventScheduler.job.ts`

```typescript
// Replace Territory.find() with filtered query
// FROM:
const territories = await Territory.find().session(session);
candidates = territories.filter(t => t.difficulty >= 6);

// TO:
const candidates = await Territory.find({
  difficulty: { $gte: 6 },
  isActive: true
}).session(session).limit(1000).lean();
```

---

# PHASE 5: ERROR HANDLING UNIFICATION
**Goal:** Replace console.error, add correlation IDs
**Duration:** 4-5 hours
**Dependencies:** Phase 0

## 5.1 Correlation ID Middleware
**File:** `server/src/middleware/correlationId.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
    }
  }
}

export function correlationIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const correlationId =
    (req.headers['x-correlation-id'] as string) ||
    (req.headers['x-request-id'] as string) ||
    uuidv4();

  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
}
```

## 5.2 Console.error Replacement Script

```bash
# PowerShell script to find all files
Get-ChildItem -Path "server/src" -Recurse -Include "*.ts" |
  Select-String -Pattern "console\.error" |
  Select-Object Path, LineNumber, Line |
  Export-Csv -Path "console-errors.csv"
```

**Priority order:**
1. Jobs (eventSpawner, productionTick, calendarTick, etc.)
2. Services
3. Controllers
4. Middleware

**Pattern:**
```typescript
// FROM:
console.error('[ComponentName] Error:', error);

// TO:
logger.error('[ComponentName] Error', {
  error: error instanceof Error ? error.message : 'Unknown',
  stack: error instanceof Error ? error.stack : undefined,
  // Add context
});
```

---

# PHASE 6: CLIENT-SIDE FIXES
**Goal:** Fix React memory leaks and performance issues
**Duration:** 3-4 hours
**Dependencies:** None (can run in parallel)

## 6.1 useEnergy Interval Fix
**File:** `client/src/hooks/useEnergy.ts`

See REMEDIATION-PLAN-V3.md section 5.1.

## 6.2 Chat Timer Leak Fix
**File:** `client/src/store/useChatStore.ts`

See REMEDIATION-PLAN-V3.md section 5.3.

## 6.3 Message Virtualization (Optional)
**File:** `client/src/components/chat/ChatWindow.tsx`

See REMEDIATION-PLAN-V3.md section 5.2.

---

# EXECUTION ORDER SUMMARY

```
Week 1:
├── Day 1: Phase 0 (Foundation utilities) ............... 3 hrs
├── Day 2: Phase 1 (Base service pattern) ............... 2 hrs
├── Day 3: Phase 2 (Auth migration) ..................... 3 hrs
├── Day 4: Phase 3.1-3.2 (Regex, rate limit) ........... 2 hrs
└── Day 5: Phase 3.3-3.4 (Socket wrapper, idempotency) .. 4 hrs

Week 2:
├── Day 1: Phase 4.1-4.2 (Indexes, N+1 fix) ............ 3 hrs
├── Day 2: Phase 4.3 (Unbounded queries) ............... 2 hrs
├── Day 3: Phase 5.1 (Correlation ID) .................. 1 hr
├── Day 4: Phase 5.2 (Console.error - jobs) ............ 3 hrs
└── Day 5: Phase 5.2 (Console.error - services) ........ 3 hrs

Week 3:
├── Day 1: Phase 5.2 (Console.error - controllers) ..... 2 hrs
├── Day 2: Phase 6.1-6.2 (Client fixes) ................ 2 hrs
├── Day 3: Phase 6.3 (Optional virtualization) ......... 3 hrs
├── Day 4: Integration testing ......................... 4 hrs
└── Day 5: Final verification, documentation ........... 4 hrs
```

---

# TESTING STRATEGY

## Per-Phase Testing

| Phase | Test Type | What to Test |
|-------|-----------|--------------|
| 0 | Unit | Each utility function with edge cases |
| 1 | Unit | ServiceResult types, transaction helper |
| 2 | Integration | Each migrated route still works |
| 3 | Security | Regex injection blocked, rate limits work, idempotency works |
| 4 | Performance | Query times before/after indexes, N+1 eliminated |
| 5 | Observability | Logs have correlation IDs, no console.error |
| 6 | Browser | Memory profiler shows no leaks, virtualization scrolls smoothly |

## Rollback Plan

Each phase is designed for easy rollback:
- **Phase 0:** New files, just delete them
- **Phase 1:** Optional patterns, don't break existing code
- **Phase 2:** Can temporarily keep both auth files
- **Phase 3:** Revert specific handler changes
- **Phase 4:** Indexes don't break queries, just remove them
- **Phase 5:** Logging changes don't affect functionality
- **Phase 6:** Each client fix is independent

---

# SUCCESS METRICS

| Metric | Before | After |
|--------|--------|-------|
| Regex injection vectors | 5+ | 0 |
| Deprecated auth usage | 10+ routes | 0 |
| Socket handlers without error handling | 18+ | 0 |
| Duel double-submit vulnerability | Yes | No |
| Missing database indexes | 15+ | 0 |
| N+1 query patterns | 5+ | 0 |
| Console.error usage | 404 | 0 |
| Client memory leaks | 3+ | 0 |
| Request traceability | None | Full |
