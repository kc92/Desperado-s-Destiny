# Desperados Destiny - Master Remediation Plan

**Created:** December 14, 2025
**Scope:** Complete architectural refactor addressing all 96 systems
**Goal:** Production-ready, secure, performant, maintainable codebase

---

## Executive Summary

This remediation plan transforms the codebase from its current state (5.8/10) to production-ready (target: 9/10) through:

1. **Shared Infrastructure Foundation** - Creating reusable base services and utilities
2. **Cross-Cutting Concern Resolution** - Systematically fixing patterns across all systems
3. **System-Specific Remediation** - Detailed fixes for each of the 96 systems

### Guiding Principles

1. **DRY** - Extract common patterns into shared services
2. **Fail-Safe** - Systems fail closed, not open
3. **Atomic** - All multi-step operations are transactional
4. **Persistent** - No in-memory storage for game state
5. **Secure** - Ownership verification and validation by default
6. **Observable** - Comprehensive logging and audit trails
7. **Testable** - Dependency injection and clear interfaces

---

# PHASE 0: SHARED INFRASTRUCTURE FOUNDATION

Before remediating individual systems, we create shared infrastructure that ALL systems will use. This ensures consistency and reduces duplication.

## 0.1 Base Service Class

**File:** `server/src/services/base/BaseService.ts`

```typescript
import { ClientSession, startSession } from 'mongoose';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { Character } from '../models/Character.model';

export abstract class BaseService {
  protected serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * Execute operation within a MongoDB transaction
   * Handles session creation, commit, abort, and cleanup
   */
  protected async withTransaction<T>(
    operation: (session: ClientSession) => Promise<T>,
    options?: { retries?: number; existingSession?: ClientSession }
  ): Promise<T> {
    const maxRetries = options?.retries ?? 3;

    // Use existing session if provided (for nested transactions)
    if (options?.existingSession) {
      return operation(options.existingSession);
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const session = await startSession();

      try {
        session.startTransaction();
        const result = await operation(session);
        await session.commitTransaction();
        return result;
      } catch (error) {
        await session.abortTransaction();
        lastError = error as Error;

        // Only retry on transient errors
        if (!this.isRetryableError(error) || attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff
        await this.delay(Math.pow(2, attempt) * 100);
      } finally {
        await session.endSession();
      }
    }

    throw lastError;
  }

  /**
   * Verify character exists and belongs to user
   * Throws AppError if verification fails
   */
  protected async verifyCharacterOwnership(
    userId: string,
    characterId: string,
    session?: ClientSession
  ): Promise<ICharacter> {
    const character = await Character.findById(characterId).session(session || null);

    if (!character) {
      throw new AppError('Character not found', 404);
    }

    if (character.userId.toString() !== userId.toString()) {
      this.logSecurityEvent('OWNERSHIP_VIOLATION', { userId, characterId });
      throw new AppError('Character does not belong to user', 403);
    }

    return character;
  }

  /**
   * Log with service context
   */
  protected log(level: 'debug' | 'info' | 'warn' | 'error', message: string, meta?: object) {
    logger[level](`[${this.serviceName}] ${message}`, meta);
  }

  /**
   * Log security-relevant events
   */
  protected logSecurityEvent(event: string, details: object) {
    logger.warn(`[SECURITY] [${this.serviceName}] ${event}`, details);
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      return error.message.includes('WriteConflict') ||
             error.message.includes('TransientTransactionError');
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

**All services will extend this base class.**

---

## 0.2 Secure RNG Service

**File:** `server/src/services/base/SecureRNG.ts`

```typescript
import { randomBytes, randomInt } from 'crypto';

export class SecureRNG {
  /**
   * Generate cryptographically secure random number in range [min, max]
   */
  static range(min: number, max: number): number {
    return randomInt(min, max + 1);
  }

  /**
   * Roll a die (d4, d6, d8, d10, d12, d20, d100)
   */
  static roll(sides: number): number {
    return randomInt(1, sides + 1);
  }

  /**
   * D20 roll with modifier
   */
  static d20(modifier: number = 0): number {
    return this.roll(20) + modifier;
  }

  /**
   * Percentage roll (1-100)
   */
  static d100(): number {
    return this.roll(100);
  }

  /**
   * Check if roll succeeds against difficulty
   */
  static rollCheck(difficulty: number, modifier: number = 0): { success: boolean; roll: number; total: number } {
    const roll = this.roll(100);
    const total = roll + modifier;
    return {
      success: total >= difficulty,
      roll,
      total
    };
  }

  /**
   * Weighted random selection
   * @param items Array of { item: T, weight: number }
   */
  static weightedSelect<T>(items: Array<{ item: T; weight: number }>): T {
    const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
    let random = this.range(1, totalWeight);

    for (const { item, weight } of items) {
      random -= weight;
      if (random <= 0) {
        return item;
      }
    }

    return items[items.length - 1].item;
  }

  /**
   * Shuffle array using Fisher-Yates with crypto RNG
   */
  static shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = randomInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Generate random bytes as hex string
   */
  static hex(length: number = 16): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Boolean with probability (0-1)
   */
  static chance(probability: number): boolean {
    return this.d100() <= probability * 100;
  }
}
```

**Replace ALL `Math.random()` calls with `SecureRNG` methods.**

---

## 0.3 State Manager Service

**File:** `server/src/services/base/StateManager.ts`

Unified state management for real-time game state.

```typescript
import { Redis } from 'ioredis';
import { getRedisClient } from '../../config/redis';
import { logger } from '../../utils/logger';

export interface StateOptions {
  ttl?: number;  // TTL in seconds
  namespace?: string;
}

export class StateManager {
  private redis: Redis;
  private namespace: string;

  constructor(namespace: string = 'game') {
    this.redis = getRedisClient();
    this.namespace = namespace;
  }

  private key(id: string): string {
    return `${this.namespace}:${id}`;
  }

  /**
   * Get state by ID
   */
  async get<T>(id: string): Promise<T | null> {
    const data = await this.redis.get(this.key(id));
    if (!data) return null;

    try {
      return JSON.parse(data) as T;
    } catch {
      logger.error(`[StateManager] Failed to parse state for ${id}`);
      return null;
    }
  }

  /**
   * Set state with optional TTL
   */
  async set<T>(id: string, state: T, options?: StateOptions): Promise<void> {
    const key = this.key(id);
    const value = JSON.stringify(state);

    if (options?.ttl) {
      await this.redis.setex(key, options.ttl, value);
    } else {
      await this.redis.set(key, value);
    }
  }

  /**
   * Update state atomically using WATCH/MULTI/EXEC
   */
  async update<T>(
    id: string,
    updater: (current: T | null) => T,
    options?: StateOptions
  ): Promise<T> {
    const key = this.key(id);

    // Use WATCH for optimistic locking
    await this.redis.watch(key);

    try {
      const current = await this.get<T>(id);
      const updated = updater(current);

      const multi = this.redis.multi();

      if (options?.ttl) {
        multi.setex(key, options.ttl, JSON.stringify(updated));
      } else {
        multi.set(key, JSON.stringify(updated));
      }

      const result = await multi.exec();

      if (!result) {
        // WATCH detected conflict, retry
        return this.update(id, updater, options);
      }

      return updated;
    } finally {
      await this.redis.unwatch();
    }
  }

  /**
   * Delete state
   */
  async delete(id: string): Promise<boolean> {
    const deleted = await this.redis.del(this.key(id));
    return deleted > 0;
  }

  /**
   * Check if state exists
   */
  async exists(id: string): Promise<boolean> {
    return (await this.redis.exists(this.key(id))) > 0;
  }

  /**
   * Get all keys matching pattern
   */
  async keys(pattern: string = '*'): Promise<string[]> {
    return this.redis.keys(`${this.namespace}:${pattern}`);
  }

  /**
   * Set expiration on existing key
   */
  async expire(id: string, seconds: number): Promise<boolean> {
    return (await this.redis.expire(this.key(id), seconds)) === 1;
  }
}

// Pre-configured state managers for different domains
export const duelStateManager = new StateManager('duel');
export const raidStateManager = new StateManager('raid');
export const huntingStateManager = new StateManager('hunt');
export const gamblingStateManager = new StateManager('gambling');
export const showdownStateManager = new StateManager('showdown');
```

**Migrate ALL in-memory Maps to StateManager.**

---

## 0.4 Distributed Lock Service

**File:** `server/src/services/base/DistributedLock.ts`

```typescript
import Redlock from 'redlock';
import { getRedisClient } from '../../config/redis';
import { logger } from '../../utils/logger';

const redlock = new Redlock([getRedisClient()], {
  driftFactor: 0.01,
  retryCount: 10,
  retryDelay: 200,
  retryJitter: 200,
  automaticExtensionThreshold: 500
});

export interface LockOptions {
  ttl?: number;  // Lock TTL in ms (default: 10000)
  retries?: number;
}

/**
 * Execute operation with distributed lock
 * Prevents concurrent execution across multiple server instances
 */
export async function withLock<T>(
  resource: string,
  operation: () => Promise<T>,
  options?: LockOptions
): Promise<T> {
  const ttl = options?.ttl ?? 10000;
  const lockKey = `lock:${resource}`;

  let lock;
  try {
    lock = await redlock.acquire([lockKey], ttl);
    logger.debug(`[Lock] Acquired: ${resource}`);

    return await operation();
  } finally {
    if (lock) {
      try {
        await lock.release();
        logger.debug(`[Lock] Released: ${resource}`);
      } catch (err) {
        logger.error(`[Lock] Failed to release: ${resource}`, err);
      }
    }
  }
}

/**
 * Lock key generators for common resources
 */
export const LockKeys = {
  character: (id: string) => `character:${id}`,
  gang: (id: string) => `gang:${id}`,
  marketplace: (listingId: string) => `marketplace:${listingId}`,
  duel: (duelId: string) => `duel:${duelId}`,
  combat: (encounterId: string) => `combat:${encounterId}`,
  job: (jobName: string) => `job:${jobName}`,
  auction: (auctionId: string) => `auction:${auctionId}`,
  war: (warId: string) => `war:${warId}`,
  quest: (characterId: string, questId: string) => `quest:${characterId}:${questId}`
};
```

**Use for ALL concurrent operations that need mutual exclusion.**

---

## 0.5 Unified Game Constants

**File:** `shared/src/constants/game.constants.ts`

```typescript
// ===== CHARACTER LIMITS =====
export const CHARACTER_CONSTANTS = {
  MAX_LEVEL: 50,
  MAX_GOLD: 2_147_483_647, // 2^31 - 1 (safe integer)
  MAX_ENERGY: 100,
  ENERGY_REGEN_RATE: 1, // per minute
  MAX_INVENTORY_SIZE: 100,
  MAX_BANK_SLOTS: 200,
  MAX_SKILL_LEVEL: 100,
  MAX_CHARACTERS_PER_ACCOUNT: 3,
  DEFAULT_SPAWN_LOCATION: 'dusty-springs',
} as const;

// ===== FACTION DEFINITIONS =====
export const FACTIONS = ['settler', 'nahi', 'frontera'] as const;
export type Faction = typeof FACTIONS[number];

// ===== GANG CONSTANTS =====
export const GANG_CONSTANTS = {
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 50,
  MIN_TAG_LENGTH: 2,
  MAX_TAG_LENGTH: 4,
  MAX_MEMBERS: 50,
  CREATION_COST: 5000,
  MAX_BANK_CAPACITY: 10_000_000,
  WAR_DECLARATION_COST: 1000,
  RAID_ENERGY_COST: 10,
  RAID_COOLDOWN_MINUTES: 5,
} as const;

// ===== MARKETPLACE CONSTANTS =====
export const MARKETPLACE_CONSTANTS = {
  TAX_RATE: 0.05, // 5%
  MIN_LISTING_HOURS: 1,
  MAX_LISTING_HOURS: 168, // 7 days
  MIN_BID_INCREMENT: 1,
  MAX_ACTIVE_LISTINGS_PER_CHARACTER: 20,
  FEATURED_LISTING_COST: 100,
} as const;

// ===== COMBAT CONSTANTS =====
export const COMBAT_CONSTANTS = {
  BASE_ENERGY_COST: 5,
  FLEE_ENERGY_COST: 3,
  MAX_ENCOUNTER_DURATION_MINUTES: 30,
  TURN_TIMEOUT_SECONDS: 60,
  DIFFICULTY_MULTIPLIER: 100, // NOT 100,000!
} as const;

// ===== GAMBLING CONSTANTS =====
export const GAMBLING_CONSTANTS = {
  MIN_BET: 1,
  MAX_BET: 100_000,
  MAX_BETS_PER_DAY: 100,
  HOUSE_EDGE: 0.02, // 2%
  SESSION_TIMEOUT_MINUTES: 30,
} as const;

// ===== HUNTING CONSTANTS =====
export const HUNTING_CONSTANTS = {
  ENERGY_COST: 15,
  MAX_HUNT_DURATION_MINUTES: 60,
  TRACKING_TIMEOUT_SECONDS: 300,
  SHOT_PLACEMENT_TIMEOUT_SECONDS: 30,
} as const;

// ===== DUEL CONSTANTS =====
export const DUEL_CONSTANTS = {
  MIN_WAGER: 0,
  MAX_WAGER: 1_000_000,
  TURN_TIMEOUT_SECONDS: 30,
  RECONNECT_GRACE_PERIOD_SECONDS: 60,
  MAX_ROUNDS: 5,
} as const;

// ===== RATE LIMIT CONSTANTS =====
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: { max: 5, windowMs: 15 * 60 * 1000 },
  REGISTRATION: { max: 3, windowMs: 60 * 60 * 1000 },
  PASSWORD_RESET: { max: 3, windowMs: 60 * 60 * 1000 },
  MARKETPLACE: { max: 60, windowMs: 60 * 60 * 1000 },
  SHOP: { max: 100, windowMs: 60 * 60 * 1000 },
  GOLD_TRANSFER: { max: 20, windowMs: 60 * 60 * 1000 },
  CHAT: { max: 30, windowMs: 60 * 1000 },
  ADMIN: { max: 100, windowMs: 60 * 1000 },
} as const;

// ===== SANITY CONSTANTS =====
export const SANITY_CONSTANTS = {
  MAX_SANITY: 100,
  REGEN_RATE_PER_HOUR: 5,
  SAFE_TOWNS: ['dusty-springs', 'frontier-falls', 'red-rock'],
  SANITY_STATES: {
    STABLE: { min: 80, max: 100 },
    RATTLED: { min: 60, max: 79 },
    SHAKEN: { min: 40, max: 59 },
    BREAKING: { min: 20, max: 39 },
    SHATTERED: { min: 0, max: 19 },
  },
} as const;

// ===== LEVEL TIER CONSTANTS =====
export const LEVEL_TIERS = {
  TIER_SIZE: 5,
  TIERS: [
    { min: 1, max: 5, name: 'Greenhorn' },
    { min: 6, max: 10, name: 'Tenderfoot' },
    { min: 11, max: 20, name: 'Frontier Hand' },
    { min: 21, max: 30, name: 'Trailblazer' },
    { min: 31, max: 40, name: 'Frontier Veteran' },
    { min: 41, max: 50, name: 'Legend of the West' },
  ],
} as const;
```

**Replace ALL hardcoded values with these constants.**

---

## 0.6 Validation Schemas

**File:** `server/src/validation/schemas.ts`

```typescript
import { z } from 'zod';
import { Types } from 'mongoose';
import { FACTIONS, CHARACTER_CONSTANTS, GANG_CONSTANTS } from '@shared/constants';

// ===== COMMON VALIDATORS =====

export const objectIdSchema = z.string().refine(
  (val) => Types.ObjectId.isValid(val),
  { message: 'Invalid ObjectId format' }
);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ===== CHARACTER VALIDATORS =====

export const characterNameSchema = z.string()
  .min(3, 'Name must be at least 3 characters')
  .max(20, 'Name must be at most 20 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Name can only contain letters, numbers, underscores, and hyphens');

export const factionSchema = z.enum(FACTIONS);

export const createCharacterSchema = z.object({
  name: characterNameSchema,
  faction: factionSchema,
});

// ===== GANG VALIDATORS =====

export const gangNameSchema = z.string()
  .min(GANG_CONSTANTS.MIN_NAME_LENGTH)
  .max(GANG_CONSTANTS.MAX_NAME_LENGTH);

export const gangTagSchema = z.string()
  .min(GANG_CONSTANTS.MIN_TAG_LENGTH)
  .max(GANG_CONSTANTS.MAX_TAG_LENGTH)
  .regex(/^[A-Z0-9]+$/, 'Tag must be uppercase letters and numbers only');

export const createGangSchema = z.object({
  name: gangNameSchema,
  tag: gangTagSchema,
  description: z.string().max(500).optional(),
});

// ===== GOLD VALIDATORS =====

export const goldAmountSchema = z.number()
  .int('Amount must be a whole number')
  .positive('Amount must be positive')
  .max(CHARACTER_CONSTANTS.MAX_GOLD);

export const goldTransferSchema = z.object({
  recipientId: objectIdSchema,
  amount: goldAmountSchema,
  reason: z.string().max(200).optional(),
});

// ===== MARKETPLACE VALIDATORS =====

export const createListingSchema = z.object({
  itemId: objectIdSchema,
  startingPrice: goldAmountSchema,
  buyoutPrice: goldAmountSchema.optional(),
  duration: z.number().int().min(1).max(168), // hours
  category: z.string(),
  subcategory: z.string().optional(),
});

export const placeBidSchema = z.object({
  listingId: objectIdSchema,
  amount: goldAmountSchema,
});

// ===== COMBAT VALIDATORS =====

export const startCombatSchema = z.object({
  npcId: objectIdSchema,
  difficulty: z.number().min(0).max(100).optional(),
});

// ===== DUEL VALIDATORS =====

export const createDuelSchema = z.object({
  opponentId: objectIdSchema,
  wager: z.number().int().min(0).max(1_000_000),
  isRanked: z.boolean().default(false),
});

// ===== QUEST VALIDATORS =====

export const acceptQuestSchema = z.object({
  questId: objectIdSchema,
});

export const completeObjectiveSchema = z.object({
  questId: objectIdSchema,
  objectiveId: z.string(),
  progress: z.number().int().min(1).optional(),
});
```

**Apply validation to ALL controller inputs.**

---

## 0.7 Validation Middleware

**File:** `server/src/middleware/validate.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export const validate = (schema: AnyZodObject, source: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await schema.parseAsync(req[source]);
      req[source] = data; // Replace with validated/transformed data
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        return next(new AppError(`Validation failed: ${messages.join(', ')}`, 400));
      }
      next(error);
    }
  };
};

// Usage in routes:
// router.post('/gang', validate(createGangSchema), gangController.createGang);
```

---

## 0.8 Standard Error Handler

**File:** `server/src/utils/AppError.ts` (enhanced)

```typescript
export enum ErrorCode {
  // Authentication
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',

  // Authorization
  FORBIDDEN = 'FORBIDDEN',
  OWNERSHIP_VIOLATION = 'OWNERSHIP_VIOLATION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Game Logic
  INSUFFICIENT_GOLD = 'INSUFFICIENT_GOLD',
  INSUFFICIENT_ENERGY = 'INSUFFICIENT_ENERGY',
  COOLDOWN_ACTIVE = 'COOLDOWN_ACTIVE',
  LEVEL_REQUIREMENT = 'LEVEL_REQUIREMENT',

  // State
  INVALID_STATE = 'INVALID_STATE',
  RACE_CONDITION = 'RACE_CONDITION',

  // System
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }

  static notFound(resource: string, id?: string): AppError {
    return new AppError(
      `${resource} not found${id ? `: ${id}` : ''}`,
      404,
      ErrorCode.NOT_FOUND,
      { resource, id }
    );
  }

  static unauthorized(reason?: string): AppError {
    return new AppError(
      reason || 'Unauthorized',
      401,
      ErrorCode.UNAUTHORIZED
    );
  }

  static forbidden(reason?: string): AppError {
    return new AppError(
      reason || 'Access denied',
      403,
      ErrorCode.FORBIDDEN
    );
  }

  static insufficientGold(required: number, available: number): AppError {
    return new AppError(
      `Insufficient gold: need ${required}, have ${available}`,
      400,
      ErrorCode.INSUFFICIENT_GOLD,
      { required, available }
    );
  }

  static insufficientEnergy(required: number, available: number): AppError {
    return new AppError(
      `Insufficient energy: need ${required}, have ${available}`,
      400,
      ErrorCode.INSUFFICIENT_ENERGY,
      { required, available }
    );
  }

  static cooldown(remainingSeconds: number): AppError {
    return new AppError(
      `Action on cooldown: ${remainingSeconds} seconds remaining`,
      429,
      ErrorCode.COOLDOWN_ACTIVE,
      { remainingSeconds }
    );
  }

  static invalidState(expected: string, actual: string): AppError {
    return new AppError(
      `Invalid state: expected ${expected}, got ${actual}`,
      400,
      ErrorCode.INVALID_STATE,
      { expected, actual }
    );
  }
}
```

**Use AppError consistently throughout ALL services.**

---

## 0.9 Audit Logger Enhancement

**File:** `server/src/services/base/AuditLogger.ts`

```typescript
import { AuditLog } from '../../models/AuditLog.model';
import { logger } from '../../utils/logger';

export interface AuditEvent {
  userId: string;
  characterId?: string;
  action: string;
  category: 'AUTH' | 'GAME' | 'ECONOMY' | 'ADMIN' | 'SECURITY' | 'SOCIAL';
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

export class AuditLogger {
  /**
   * Log audit event - fires and forgets to not block operations
   */
  static log(event: AuditEvent): void {
    setImmediate(async () => {
      try {
        await AuditLog.create({
          ...event,
          timestamp: new Date(),
          sanitizedDetails: this.sanitize(event.details),
        });
      } catch (error) {
        // Fallback to file logging if DB fails
        logger.error('[AuditLog] Failed to write to database, logging to file', {
          event,
          error,
        });
      }
    });
  }

  /**
   * Recursively sanitize sensitive fields
   */
  private static sanitize(obj: Record<string, unknown>, depth: number = 0): Record<string, unknown> {
    if (depth > 10) return { _truncated: true };

    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'authorization', 'cookie', 'refreshToken'];
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveFields.some(f => key.toLowerCase().includes(f))) {
        result[key] = '[REDACTED]';
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.sanitize(value as Record<string, unknown>, depth + 1);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  // Convenience methods
  static authEvent(userId: string, action: string, success: boolean, details: Record<string, unknown> = {}) {
    this.log({ userId, action, category: 'AUTH', details, success });
  }

  static gameEvent(userId: string, characterId: string, action: string, details: Record<string, unknown> = {}) {
    this.log({ userId, characterId, action, category: 'GAME', details, success: true });
  }

  static economyEvent(userId: string, characterId: string, action: string, details: Record<string, unknown>) {
    this.log({ userId, characterId, action, category: 'ECONOMY', details, success: true });
  }

  static securityEvent(userId: string, action: string, details: Record<string, unknown>) {
    this.log({ userId, action, category: 'SECURITY', details, success: false });
  }
}
```

---

## 0.10 Index File Exports

**File:** `server/src/services/base/index.ts`

```typescript
export { BaseService } from './BaseService';
export { SecureRNG } from './SecureRNG';
export { StateManager, duelStateManager, raidStateManager, huntingStateManager, gamblingStateManager, showdownStateManager } from './StateManager';
export { withLock, LockKeys } from './DistributedLock';
export { AuditLogger, AuditEvent } from './AuditLogger';
```

---

# PHASE 0 CHECKLIST

| Task | Status | Notes |
|------|--------|-------|
| Create `server/src/services/base/` directory | TODO | |
| Implement BaseService.ts | TODO | |
| Implement SecureRNG.ts | TODO | |
| Implement StateManager.ts | TODO | |
| Implement DistributedLock.ts | TODO | |
| Install redlock package | TODO | `npm install redlock` |
| Install zod package | TODO | `npm install zod` |
| Update shared/constants/game.constants.ts | TODO | |
| Create validation schemas | TODO | |
| Create validation middleware | TODO | |
| Enhance AppError class | TODO | |
| Create AuditLogger | TODO | |
| Update exports in index files | TODO | |
| Write unit tests for base services | TODO | |

**Estimated Time:** 16 hours

---

# PHASE 1: CRITICAL GAME-BREAKERS

These fixes are BLOCKING - game cannot launch without them.

## 1.1 Destiny Deck Difficulty Fix

**File:** `server/src/controllers/action.controller.ts:238`

**Current (BROKEN):**
```typescript
const threshold = action.difficulty * 100000; // IMPOSSIBLE TO WIN
```

**Fixed:**
```typescript
import { COMBAT_CONSTANTS } from '@shared/constants';

const threshold = action.difficulty * COMBAT_CONSTANTS.DIFFICULTY_MULTIPLIER; // = difficulty * 100
```

**Additional Changes:**
- Import `COMBAT_CONSTANTS` at top of file
- Add input validation for difficulty (0-100 range)
- Log the threshold calculation for debugging

---

## 1.2 PvP Duel Hand Ranking Implementation

**File:** `server/src/sockets/duelHandlers.ts:915`

**Current (TODO stub):**
```typescript
// TODO: Calculate hand rankings
```

**Implementation:**
```typescript
import { HandEvaluator } from '../services/handEvaluator.service';

// In the round resolution function:
const player1Result = HandEvaluator.evaluateHand(player1Cards);
const player2Result = HandEvaluator.evaluateHand(player2Cards);

const comparison = HandEvaluator.compareHands(player1Result, player2Result);

if (comparison > 0) {
  winner = player1Id;
} else if (comparison < 0) {
  winner = player2Id;
} else {
  // Tie - split pot
  winner = null;
}

// Award pot to winner
await this.resolveDuelRound(duelId, winner, player1Result, player2Result, session);
```

**Verify HandEvaluator exists and works:**
- Check `handEvaluator.service.ts` implementation
- Write tests for all poker hand rankings
- Test tie-breaking logic

---

## 1.3 Hunting System Completion

**File:** `server/src/services/hunting.service.ts`

**Problem:** Hunt starts but never completes - no endpoint to finish hunt.

**Implementation Plan:**

1. Add `completeHunt` method to hunting.service.ts:
```typescript
async completeHunt(characterId: string, session?: ClientSession): Promise<HuntResult> {
  return this.withTransaction(async (txSession) => {
    const hunt = await HuntingTrip.findOne({
      characterId,
      status: 'tracking'
    }).session(txSession);

    if (!hunt) {
      throw AppError.notFound('Active hunt');
    }

    // Select random animal based on hunting ground
    const animal = await this.selectRandomAnimal(hunt.huntingGroundId);

    // Determine shot placement
    const shotResult = this.determineShotPlacement(character);

    // Calculate kill quality
    const quality = this.determineKillQuality(shotResult, character);

    // Generate rewards
    const rewards = this.calculateHuntRewards(animal, quality);

    // Apply rewards (gold, XP, items)
    await GoldService.addGold(characterId, rewards.gold, 'HUNTING_REWARD', txSession);
    await CharacterService.addExperience(characterId, rewards.xp, txSession);

    // Update hunt status
    hunt.status = 'completed';
    hunt.harvestResult = { animal, quality, rewards };
    await hunt.save({ session: txSession });

    return {
      success: true,
      animal,
      quality,
      rewards,
      statistics: await this.updateHuntingStatistics(characterId, animal, quality)
    };
  }, { existingSession: session });
}
```

2. Add controller endpoint:
```typescript
// hunting.controller.ts
async completeHunt(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const character = req.character!;
    const result = await HuntingService.completeHunt(character._id.toString());
    res.json(result);
  } catch (error) {
    next(error);
  }
}
```

3. Add route:
```typescript
// hunting.routes.ts
router.post('/complete', requireAuth, requireCharacter, huntingController.completeHunt);
```

4. Implement missing helper methods:
- `selectRandomAnimal()` - use SecureRNG.weightedSelect
- `determineShotPlacement()` - use SecureRNG.d100 with skill modifiers
- `determineKillQuality()` - based on shot placement and skinning skill
- `calculateHuntRewards()` - gold, XP, items based on animal and quality

---

## 1.4 Property Purchase Gold Fix

**File:** `server/src/services/propertyPurchase.service.ts:656,661`

**Current (CRASHES):**
```typescript
await buyer.deductGold(price);  // Method doesn't exist!
await seller.addGold(price);    // Method doesn't exist!
```

**Fixed:**
```typescript
import { GoldService } from './gold.service';

// Inside transaction:
await GoldService.deductGold(
  buyer._id.toString(),
  price,
  'PROPERTY_PURCHASE',
  { propertyId: property._id, sellerId: seller._id },
  session
);

await GoldService.addGold(
  seller._id.toString(),
  price,
  'PROPERTY_SALE',
  { propertyId: property._id, buyerId: buyer._id },
  session
);
```

---

## PHASE 1 CHECKLIST

| Task | Status | Priority |
|------|--------|----------|
| Fix action.controller.ts difficulty calculation | TODO | P0 |
| Implement duel hand ranking evaluation | TODO | P0 |
| Add completeHunt endpoint and implementation | TODO | P0 |
| Fix propertyPurchase.service.ts gold methods | TODO | P0 |
| Write tests for all fixes | TODO | P0 |

**Estimated Time:** 24 hours

---

# PHASE 2: SECURITY LAYER

## 2.1 IDOR Vulnerability Fixes

### Gang System IDOR Fixes

**File:** `server/src/controllers/gang.controller.ts`

**Fix depositBank (line ~323):**
```typescript
async depositBank(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { gangId, amount, characterId } = req.body;

  // ADD THIS: Verify character ownership
  await this.verifyCharacterOwnership(req.user!._id, characterId);

  // ... rest of implementation
}
```

**Fix sendInvitation (line ~569):**
```typescript
async sendInvitation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { gangId, inviterId, recipientId } = req.body;

  // ADD THIS: Verify inviter owns their character
  await this.verifyCharacterOwnership(req.user!._id, inviterId);

  // ... rest of implementation
}
```

**Fix kickMember (line ~251):**
```typescript
async kickMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { gangId, kickerId, targetId } = req.body;

  // ADD THIS: Verify kicker owns their character
  await this.verifyCharacterOwnership(req.user!._id, kickerId);

  // ... rest of implementation
}
```

**Fix promoteMember (line ~283):**
```typescript
async promoteMember(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const { gangId, promoterId, targetId, newRole } = req.body;

  // ADD THIS: Verify promoter owns their character
  await this.verifyCharacterOwnership(req.user!._id, promoterId);

  // ... rest of implementation
}
```

---

## 2.2 Replace Math.random() with SecureRNG

**Files to update:**

| File | Lines | Current | Replacement |
|------|-------|---------|-------------|
| gambling.service.ts | 110, 206, 387, 445 | `Math.random()` | `SecureRNG.d100()` |
| horseRacing.service.ts | 171 | `Math.random()` | `SecureRNG.d100()` |
| combat.service.ts | multiple | `Math.random()` | `SecureRNG.chance()` |
| cheating.service.ts | multiple | `Math.random()` | `SecureRNG.d100()` |
| loot.service.ts | multiple | `Math.random()` | `SecureRNG.weightedSelect()` |

**Search command to find all:**
```bash
grep -rn "Math.random" server/src/services/
```

---

## 2.3 Remove REDIS_BYPASS Flag

**File:** `server/src/services/tokenManagement.service.ts:249`

**Remove entirely:**
```typescript
// DELETE THIS BLOCK:
if (process.env.ALLOW_REDIS_BYPASS === 'true') {
  return true; // Dangerous bypass!
}
```

**Add startup validation:**
```typescript
// In server/src/server.ts startup:
if (process.env.NODE_ENV === 'production') {
  const redis = getRedisClient();
  try {
    await redis.ping();
    logger.info('Redis connection verified');
  } catch (error) {
    logger.error('FATAL: Redis required in production but not available');
    process.exit(1);
  }
}
```

---

## 2.4 Fix Rate Limiting Fail-Open

**File:** `server/src/middleware/chatRateLimiter.ts:144-145`

**Current (FAIL-OPEN - BAD):**
```typescript
} catch (error) {
  logger.error('Rate limit check failed', error);
  return { allowed: true }; // DANGEROUS!
}
```

**Fixed (FAIL-CLOSED):**
```typescript
} catch (error) {
  logger.error('Rate limit check failed', error);
  // Fail closed - deny request if rate limiting unavailable
  return {
    allowed: false,
    retryAfter: 60,
    reason: 'Rate limiting service temporarily unavailable'
  };
}
```

**Apply to ALL rate limiters:**
- `rateLimiter.ts`
- `friendRateLimiter.ts`
- `mailRateLimiter.ts`

---

## PHASE 2 CHECKLIST

| Task | Status | Severity |
|------|--------|----------|
| Fix gang depositBank IDOR | TODO | CRITICAL |
| Fix gang sendInvitation IDOR | TODO | CRITICAL |
| Fix gang kickMember IDOR | TODO | HIGH |
| Fix gang promoteMember IDOR | TODO | HIGH |
| Replace Math.random() in gambling.service | TODO | HIGH |
| Replace Math.random() in horseRacing.service | TODO | HIGH |
| Replace Math.random() in combat.service | TODO | MEDIUM |
| Replace Math.random() in all services | TODO | MEDIUM |
| Remove REDIS_BYPASS flag | TODO | HIGH |
| Add Redis startup validation | TODO | HIGH |
| Fix chatRateLimiter fail-open | TODO | HIGH |
| Fix all rate limiters fail-open | TODO | HIGH |

**Estimated Time:** 12 hours

---

# PHASE 3: DATA PERSISTENCE MIGRATION

Migrate ALL in-memory storage to Redis/MongoDB.

## 3.1 Systems Requiring Migration

| System | Current | Target | TTL |
|--------|---------|--------|-----|
| Cosmic Horror | `Map<string, CosmicProgress>` | MongoDB Model | Permanent |
| PvP Duels | `Map<string, DuelGame>` | Redis (StateManager) | 2 hours |
| Gang Wars (Raids) | `Map<string, RaidGame>` | Redis (StateManager) | 30 min |
| Gang Wars (Duels) | `Map<string, ChampionDuel>` | Redis (StateManager) | 30 min |
| Gang Wars (Showdowns) | `Map<string, LeaderShowdown>` | Redis (StateManager) | 30 min |
| Reality Distortion | `Map<string, ActiveDistortion>` | MongoDB Model | Per distortion |
| Hunting | `Map<string, HuntingTrip>` | MongoDB (already exists?) | 1 hour |
| Horse Racing | In-memory race | MongoDB Model | Per race |
| Deck Engine | `Map<string, PendingGame>` | Redis (StateManager) | 30 min |
| Chat Rate Limits | `Map<string, RateLimitEntry>` | Redis | 1 hour |

## 3.2 Cosmic Horror Migration

**Create Model:** `server/src/models/CosmicProgress.model.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface ICosmicProgress extends Document {
  characterId: mongoose.Types.ObjectId;
  questlineStarted: boolean;
  currentQuestId: string;
  completedQuests: string[];
  corruptionLevel: number;
  choices: Map<string, string>;
  visionsExperienced: string[];
  loreDiscovered: string[];
  ritualHistory: Array<{
    ritualId: string;
    outcome: string;
    timestamp: Date;
  }>;
  endingPath: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const CosmicProgressSchema = new Schema({
  characterId: {
    type: Schema.Types.ObjectId,
    ref: 'Character',
    required: true,
    unique: true,
    index: true
  },
  questlineStarted: { type: Boolean, default: false },
  currentQuestId: { type: String, default: null },
  completedQuests: [{ type: String }],
  corruptionLevel: { type: Number, default: 0, min: 0, max: 100 },
  choices: { type: Map, of: String, default: new Map() },
  visionsExperienced: [{ type: String }],
  loreDiscovered: [{ type: String }],
  ritualHistory: [{
    ritualId: String,
    outcome: String,
    timestamp: { type: Date, default: Date.now }
  }],
  endingPath: { type: String, default: null },
}, { timestamps: true });

export const CosmicProgress = mongoose.model<ICosmicProgress>('CosmicProgress', CosmicProgressSchema);
```

**Update Service:**
```typescript
// cosmicQuest.service.ts

// REMOVE:
private progressMap = new Map<string, CosmicProgress>();

// REPLACE with:
private async getProgress(characterId: string): Promise<ICosmicProgress> {
  let progress = await CosmicProgress.findOne({ characterId });
  if (!progress) {
    progress = await CosmicProgress.create({ characterId });
  }
  return progress;
}

private async updateProgress(
  characterId: string,
  updates: Partial<ICosmicProgress>,
  session?: ClientSession
): Promise<ICosmicProgress> {
  return CosmicProgress.findOneAndUpdate(
    { characterId },
    { $set: updates },
    { new: true, upsert: true, session }
  );
}
```

## 3.3 PvP Duels Migration

**Update:** `server/src/services/duel.service.ts`

```typescript
import { duelStateManager } from './base/StateManager';

// REMOVE:
private activeDuelGames = new Map<string, DuelGameState>();

// REPLACE ALL Map operations with StateManager:

async getDuelState(duelId: string): Promise<DuelGameState | null> {
  return duelStateManager.get<DuelGameState>(duelId);
}

async setDuelState(duelId: string, state: DuelGameState): Promise<void> {
  await duelStateManager.set(duelId, state, { ttl: 7200 }); // 2 hour TTL
}

async updateDuelState(
  duelId: string,
  updater: (state: DuelGameState) => DuelGameState
): Promise<DuelGameState> {
  return duelStateManager.update(duelId, (current) => {
    if (!current) throw AppError.notFound('Duel', duelId);
    return updater(current);
  }, { ttl: 7200 });
}

async deleteDuelState(duelId: string): Promise<void> {
  await duelStateManager.delete(duelId);
}
```

## 3.4 Gang Wars Migration

**Update:** `server/src/services/gangWarDeck.service.ts`

```typescript
import { raidStateManager, showdownStateManager } from './base/StateManager';

// REMOVE:
private activeRaids = new Map<string, RaidGame>();
private championDuels = new Map<string, ChampionDuel>();
private leaderShowdowns = new Map<string, LeaderShowdown>();

// REPLACE with StateManager calls similar to duel migration
```

## 3.5 Horse Racing Migration

**Create Model:** `server/src/models/HorseRace.model.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IHorseRace extends Document {
  trackId: string;
  status: 'open' | 'closed' | 'racing' | 'completed';
  distance: number;
  entryFee: number;
  prizePool: number;
  participants: Array<{
    horseId: mongoose.Types.ObjectId;
    characterId: mongoose.Types.ObjectId;
    registeredAt: Date;
    finalPosition?: number;
    raceScore?: number;
  }>;
  results?: Array<{
    position: number;
    horseId: mongoose.Types.ObjectId;
    characterId: mongoose.Types.ObjectId;
    prize: number;
  }>;
  scheduledStart: Date;
  actualStart?: Date;
  completedAt?: Date;
  createdAt: Date;
}

const HorseRaceSchema = new Schema({
  trackId: { type: String, required: true },
  status: {
    type: String,
    enum: ['open', 'closed', 'racing', 'completed'],
    default: 'open'
  },
  distance: { type: Number, required: true },
  entryFee: { type: Number, required: true },
  prizePool: { type: Number, default: 0 },
  participants: [{
    horseId: { type: Schema.Types.ObjectId, ref: 'Horse', required: true },
    characterId: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
    registeredAt: { type: Date, default: Date.now },
    finalPosition: Number,
    raceScore: Number
  }],
  results: [{
    position: Number,
    horseId: { type: Schema.Types.ObjectId, ref: 'Horse' },
    characterId: { type: Schema.Types.ObjectId, ref: 'Character' },
    prize: Number
  }],
  scheduledStart: { type: Date, required: true },
  actualStart: Date,
  completedAt: Date
}, { timestamps: true });

HorseRaceSchema.index({ status: 1, scheduledStart: 1 });

export const HorseRace = mongoose.model<IHorseRace>('HorseRace', HorseRaceSchema);
```

---

## PHASE 3 CHECKLIST

| Task | Status | System |
|------|--------|--------|
| Create CosmicProgress model | TODO | Cosmic Horror |
| Migrate cosmicQuest.service.ts | TODO | Cosmic Horror |
| Migrate duel.service.ts to StateManager | TODO | PvP Duels |
| Migrate duelHandlers.ts to StateManager | TODO | PvP Duels |
| Migrate gangWarDeck.service.ts raids | TODO | Gang Wars |
| Migrate gangWarDeck.service.ts duels | TODO | Gang Wars |
| Migrate gangWarDeck.service.ts showdowns | TODO | Gang Wars |
| Create ActiveDistortion model | TODO | Reality Distortion |
| Migrate realityDistortion.service.ts | TODO | Reality Distortion |
| Create HorseRace model | TODO | Horse Racing |
| Migrate horseRacing.service.ts | TODO | Horse Racing |
| Migrate actionDeck.service.ts | TODO | Deck Engine |
| Add cleanup jobs for expired states | TODO | All |

**Estimated Time:** 32 hours

---

# PHASE 4: TRANSACTION SAFETY

Fix all race conditions and add proper transaction handling.

## 4.1 PvE Combat Turn Race Condition

**File:** `server/src/services/combat.service.ts:321-327`

**Current (RACE CONDITION):**
```typescript
const encounter = await CombatEncounter.findById(encounterId);
if (encounter.turn !== expectedTurn) {
  throw new Error('Not your turn');
}
encounter.turn++;
await encounter.save();
```

**Fixed (ATOMIC):**
```typescript
const encounter = await CombatEncounter.findOneAndUpdate(
  {
    _id: encounterId,
    turn: expectedTurn,  // Only update if turn matches
    status: 'active'
  },
  {
    $inc: { turn: 1 },
    $set: { lastActionAt: new Date() }
  },
  {
    new: true,
    session
  }
);

if (!encounter) {
  throw AppError.invalidState('your turn', 'not your turn or encounter ended');
}
```

## 4.2 Marketplace Bid Race Condition

**File:** `server/src/services/marketplace.service.ts:634-659`

**Current (RACE CONDITION):**
```typescript
// Refund previous bidder
const previousBidder = this.reservedBids.get(listingId);
this.reservedBids.delete(listingId);  // Deleted outside transaction!
// ... transaction continues
```

**Fixed:**
```typescript
await this.withTransaction(async (session) => {
  // Fetch listing with lock
  const listing = await Listing.findById(listingId).session(session);

  // Get previous bidder from listing, not Map
  const previousBidderId = listing.currentBidderId;
  const previousBidAmount = listing.currentBid;

  // Refund previous bidder within transaction
  if (previousBidderId) {
    await GoldService.addGold(
      previousBidderId,
      previousBidAmount,
      'BID_REFUND',
      { listingId },
      session
    );
  }

  // Deduct from new bidder
  await GoldService.deductGold(
    newBidderId,
    bidAmount,
    'BID_PLACED',
    { listingId },
    session
  );

  // Update listing
  listing.currentBidderId = newBidderId;
  listing.currentBid = bidAmount;
  listing.bidHistory.push({ bidderId: newBidderId, amount: bidAmount, timestamp: new Date() });
  await listing.save({ session });
});
```

## 4.3 Gang Member Count Race Condition

**File:** `server/src/services/gang.service.ts:194`

**Current (RACE CONDITION):**
```typescript
const maxMembers = gang.getMaxMembers();
if (gang.members.length >= maxMembers) {
  throw new Error('Gang is full');
}
// ... transaction starts AFTER check
```

**Fixed:**
```typescript
await this.withTransaction(async (session) => {
  // Fetch and lock gang document
  const gang = await Gang.findById(gangId).session(session);

  // Re-verify within transaction
  const maxMembers = gang.getMaxMembers();
  if (gang.members.length >= maxMembers) {
    throw new AppError('Gang is full', 400);
  }

  // Add member atomically
  const result = await Gang.findOneAndUpdate(
    {
      _id: gangId,
      'members.characterId': { $ne: characterId },  // Not already member
      $expr: { $lt: [{ $size: '$members' }, maxMembers] }  // Still has room
    },
    {
      $push: {
        members: {
          characterId,
          role: 'member',
          joinedAt: new Date(),
          contribution: 0
        }
      }
    },
    { new: true, session }
  );

  if (!result) {
    throw new AppError('Could not join gang - full or already member', 400);
  }
});
```

## 4.4 Background Jobs Distributed Locking

**File:** `server/src/jobs/queues.ts`

**Add distributed lock to all critical jobs:**
```typescript
import { withLock, LockKeys } from '../services/base/DistributedLock';

// Example: Marketplace auction processing
marketplaceQueue.process('processExpiredAuctions', async (job) => {
  return withLock(LockKeys.job('processExpiredAuctions'), async () => {
    // Only one instance processes at a time
    const expiredListings = await Listing.find({
      status: 'active',
      expiresAt: { $lte: new Date() }
    });

    for (const listing of expiredListings) {
      await withLock(LockKeys.auction(listing._id.toString()), async () => {
        await MarketplaceService.processExpiredListing(listing._id);
      });
    }

    return { processed: expiredListings.length };
  }, { ttl: 60000 }); // 60 second lock
});
```

---

## PHASE 4 CHECKLIST

| Task | Status | System |
|------|--------|--------|
| Fix combat turn race condition | TODO | PvE Combat |
| Fix marketplace bid race condition | TODO | Marketplace |
| Fix gang member count race condition | TODO | Gang System |
| Fix gold deduction race condition | TODO | Cheating Detection |
| Fix sanity passive regen race condition | TODO | Sanity System |
| Add distributed locks to marketplace job | TODO | Background Jobs |
| Add distributed locks to tax collection job | TODO | Background Jobs |
| Add distributed locks to war resolution job | TODO | Background Jobs |
| Add distributed locks to all repeatable jobs | TODO | Background Jobs |
| Add job deduplication check | TODO | Background Jobs |

**Estimated Time:** 24 hours

---

# PHASE 5: FEATURE COMPLETENESS

Complete all TODO stubs and implement missing features.

## 5.1 Legendary Quest Rewards (10 TODOs)

**File:** `server/src/services/legendaryQuest.service.ts:519-579`

Implement all reward types:

```typescript
private async awardRewards(
  character: ICharacter,
  rewards: LegendaryReward[],
  session: ClientSession
): Promise<void> {
  for (const reward of rewards) {
    switch (reward.type) {
      case 'experience':
        await CharacterService.addExperience(
          character._id.toString(),
          reward.amount,
          session
        );
        break;

      case 'gold':
        await GoldService.addGold(
          character._id.toString(),
          reward.amount,
          'LEGENDARY_QUEST_REWARD',
          { rewardId: reward.id },
          session
        );
        break;

      case 'item':
        await InventoryService.addItem(
          character._id.toString(),
          reward.itemId,
          reward.quantity || 1,
          session
        );
        break;

      case 'skill_points':
        await SkillService.addSkillPoints(
          character._id.toString(),
          reward.amount,
          session
        );
        break;

      case 'property':
        await PropertyService.grantProperty(
          character._id.toString(),
          reward.propertyId,
          session
        );
        break;

      case 'title':
        await CharacterService.unlockTitle(
          character._id.toString(),
          reward.titleId,
          session
        );
        break;

      case 'reputation':
        await ReputationService.modifyReputation(
          character._id.toString(),
          reward.factionId,
          reward.amount,
          session
        );
        break;

      default:
        this.log('warn', `Unknown reward type: ${reward.type}`);
    }
  }
}

private async applyWorldEffects(
  effects: WorldEffect[],
  character: ICharacter,
  session: ClientSession
): Promise<void> {
  for (const effect of effects) {
    switch (effect.type) {
      case 'faction_reputation':
        await ReputationService.modifyReputation(
          character._id.toString(),
          effect.targetFaction,
          effect.amount,
          session
        );
        break;

      case 'npc_relationship':
        await NPCRelationshipService.modifyRelationship(
          character._id.toString(),
          effect.npcId,
          effect.amount,
          session
        );
        break;

      case 'location_unlock':
        await LocationService.unlockLocation(
          character._id.toString(),
          effect.locationId,
          session
        );
        break;

      case 'world_state':
        await WorldStateService.setFlag(
          effect.flagName,
          effect.value,
          session
        );
        break;

      case 'quest_unlock':
        await QuestService.unlockQuest(
          character._id.toString(),
          effect.questId,
          session
        );
        break;

      default:
        this.log('warn', `Unknown world effect: ${effect.type}`);
    }
  }
}
```

## 5.2 Reality Distortion Effects (7 Stubs)

**File:** `server/src/services/realityDistortion.service.ts:407-454`

Implement all distortion effects:

```typescript
private async applyTimeDilation(
  character: ICharacter,
  distortion: Distortion,
  session: ClientSession
): Promise<void> {
  const multiplier = distortion.mechanicalEffect.timeMultiplier;

  // Apply energy regeneration modifier
  await CharacterService.setTemporaryModifier(
    character._id.toString(),
    'energyRegenRate',
    multiplier,
    distortion.duration * 60 * 1000, // Convert minutes to ms
    session
  );

  this.log('info', `Time dilation applied: ${multiplier}x for ${character._id}`);
}

private async applyProbabilityFlux(
  character: ICharacter,
  distortion: Distortion,
  session: ClientSession
): Promise<void> {
  const modifier = distortion.mechanicalEffect.luckModifier;

  await CharacterService.setTemporaryModifier(
    character._id.toString(),
    'luckBonus',
    modifier,
    distortion.duration * 60 * 1000,
    session
  );
}

private async applyMemoryCorruption(
  character: ICharacter,
  distortion: Distortion,
  session: ClientSession
): Promise<void> {
  // Apply corruption
  await CorruptionService.addCorruption(
    character._id.toString(),
    distortion.mechanicalEffect.corruptionGain || 3,
    session
  );

  // Apply sanity loss
  await SanityService.loseSanity(
    character._id.toString(),
    distortion.sanityLoss,
    `Distortion: ${distortion.name}`,
    session
  );
}

private async applySpatialShift(
  character: ICharacter,
  distortion: Distortion,
  session: ClientSession
): Promise<void> {
  // Get random location within The Scar
  const scarLocations = await LocationService.getLocationsByZone('the-scar');
  const randomLocation = SecureRNG.weightedSelect(
    scarLocations.map(loc => ({ item: loc, weight: 1 }))
  );

  // Teleport character
  await LocationService.teleportCharacter(
    character._id.toString(),
    randomLocation._id.toString(),
    session
  );

  this.log('info', `Spatial shift: ${character._id} moved to ${randomLocation.name}`);
}

private async applyEntityDuplication(
  character: ICharacter,
  distortion: Distortion,
  session: ClientSession
): Promise<void> {
  // Spawn hostile duplicate NPC
  await NPCService.spawnTemporaryNPC({
    templateId: 'doppelganger',
    locationId: character.locationId,
    hostileTo: [character._id],
    duration: distortion.duration * 60 * 1000,
    appearance: {
      mimics: character._id
    }
  }, session);
}

private async applyPathAlteration(
  character: ICharacter,
  distortion: Distortion,
  session: ClientSession
): Promise<void> {
  // Modify location connections temporarily
  const currentLocation = await LocationService.getLocation(character.locationId);

  await CharacterService.setTemporaryModifier(
    character._id.toString(),
    'pathfindingModifier',
    distortion.mechanicalEffect.pathModifier,
    distortion.duration * 60 * 1000,
    session
  );
}

private async applyPropertyChange(
  character: ICharacter,
  distortion: Distortion,
  session: ClientSession
): Promise<void> {
  // Select random equipped item
  const equippedItems = await InventoryService.getEquippedItems(character._id.toString());

  if (equippedItems.length === 0) return;

  const targetItem = SecureRNG.weightedSelect(
    equippedItems.map(item => ({ item, weight: 1 }))
  );

  // Apply temporary stat modification
  await InventoryService.applyTemporaryItemModifier(
    character._id.toString(),
    targetItem._id.toString(),
    distortion.mechanicalEffect.propertyModifier,
    distortion.duration * 60 * 1000,
    session
  );
}
```

## 5.3 Other TODO Completions

**Create tracking document for all TODOs:**

| File | Line | TODO | Priority | Assignee |
|------|------|------|----------|----------|
| duelHandlers.ts | 1084 | Handle all-in logic | HIGH | |
| duelHandlers.ts | 1234 | Handle duel loss due to cheating | HIGH | |
| gambling.service.ts | Multiple | Craps bet types | MEDIUM | |
| hunting.service.ts | Multiple | Shot placement, skinning | HIGH | |
| antiExploit.middleware.ts | 236-248 | hasGamblingItemBonus | MEDIUM | |
| antiExploit.middleware.ts | 210-240 | XP farming detection | LOW | |

---

## PHASE 5 CHECKLIST

| Task | Status | System |
|------|--------|--------|
| Implement legendary quest experience rewards | TODO | Legendary Quests |
| Implement legendary quest item rewards | TODO | Legendary Quests |
| Implement legendary quest skill point rewards | TODO | Legendary Quests |
| Implement legendary quest property rewards | TODO | Legendary Quests |
| Implement legendary quest reputation effects | TODO | Legendary Quests |
| Implement legendary quest NPC relationship effects | TODO | Legendary Quests |
| Implement legendary quest location unlock effects | TODO | Legendary Quests |
| Implement legendary quest world state effects | TODO | Legendary Quests |
| Implement time dilation effect | TODO | Reality Distortion |
| Implement probability flux effect | TODO | Reality Distortion |
| Implement memory corruption effect | TODO | Reality Distortion |
| Implement spatial shift effect | TODO | Reality Distortion |
| Implement entity duplication effect | TODO | Reality Distortion |
| Implement path alteration effect | TODO | Reality Distortion |
| Implement property change effect | TODO | Reality Distortion |
| Implement duel all-in logic | TODO | PvP Duels |
| Implement duel cheating loss | TODO | PvP Duels |
| Complete Craps bet types | TODO | Gambling |
| Implement hunting shot placement | TODO | Hunting |
| Implement gambling item bonus check | TODO | Anti-Exploit |

**Estimated Time:** 60 hours

---

# PHASE 6: PERFORMANCE OPTIMIZATION

## 6.1 N+1 Query Fixes

**Pattern to identify:**
```typescript
// BAD: N+1 query
const quests = await CharacterQuest.find({ characterId });
for (const quest of quests) {
  const definition = await Quest.findById(quest.questId); // N queries!
}
```

**Fixed:**
```typescript
// GOOD: Single query with population
const quests = await CharacterQuest.find({ characterId })
  .populate('questId')
  .lean();

// OR: Batch fetch
const quests = await CharacterQuest.find({ characterId }).lean();
const questIds = quests.map(q => q.questId);
const definitions = await Quest.find({ _id: { $in: questIds } }).lean();
const definitionMap = new Map(definitions.map(d => [d._id.toString(), d]));
```

**Files to fix:**
- `quest.controller.ts:31-51` - getActiveQuests
- `gang.service.ts:844-890` - getGangStats
- `marketplace.service.ts:313-329` - price history updates
- `productionTick.job.ts:76` - worker updates

## 6.2 Missing Indexes

**Add to models:**

```typescript
// Character.model.ts
CharacterSchema.index({ locationId: 1 });
CharacterSchema.index({ gangId: 1 });
CharacterSchema.index({ wantedLevel: 1 });

// Listing.model.ts (Marketplace)
ListingSchema.index({ status: 1, expiresAt: 1 });
ListingSchema.index({ sellerId: 1, status: 1 });
ListingSchema.index({ category: 1, subcategory: 1, status: 1 });
ListingSchema.index({ '$**': 'text' }); // Text search

// GangWar.model.ts
GangWarSchema.index({ status: 1, resolveAt: 1 });
GangWarSchema.index({ attackerGangId: 1, status: 1 });
GangWarSchema.index({ defenderGangId: 1, status: 1 });

// ChatMessage.model.ts
ChatMessageSchema.index({ roomType: 1, roomId: 1, timestamp: -1 });

// AuditLog.model.ts
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ category: 1, timestamp: -1 });
```

## 6.3 Aggregation Pipeline Optimization

**Example: Gold statistics (currently loads all transactions)**

```typescript
// CURRENT (BAD): Loads all transactions into memory
const transactions = await GoldTransaction.find({ characterId });
const total = transactions.reduce((sum, t) => sum + t.amount, 0);

// FIXED (GOOD): Aggregation pipeline
const stats = await GoldTransaction.aggregate([
  { $match: { characterId: new Types.ObjectId(characterId) } },
  {
    $group: {
      _id: null,
      totalEarned: {
        $sum: { $cond: [{ $gt: ['$amount', 0] }, '$amount', 0] }
      },
      totalSpent: {
        $sum: { $cond: [{ $lt: ['$amount', 0] }, { $abs: '$amount' }, 0] }
      },
      transactionCount: { $sum: 1 }
    }
  }
]);
```

---

## PHASE 6 CHECKLIST

| Task | Status | Impact |
|------|--------|--------|
| Fix quest.controller N+1 queries | TODO | HIGH |
| Fix gang.service N+1 queries | TODO | HIGH |
| Fix marketplace.service N+1 queries | TODO | MEDIUM |
| Fix productionTick.job N+1 queries | TODO | MEDIUM |
| Add Character model indexes | TODO | HIGH |
| Add Listing model indexes | TODO | HIGH |
| Add GangWar model indexes | TODO | MEDIUM |
| Add ChatMessage model indexes | TODO | HIGH |
| Add AuditLog model indexes | TODO | MEDIUM |
| Convert gold statistics to aggregation | TODO | MEDIUM |
| Convert marketplace statistics to aggregation | TODO | MEDIUM |
| Add query explain analysis | TODO | LOW |

**Estimated Time:** 20 hours

---

# PHASE 7: POLISH AND STANDARDIZATION

## 7.1 Error Message Standardization

All errors should:
1. Use `AppError` class with error codes
2. Include context for debugging
3. Not leak internal details to clients

**Example migration:**
```typescript
// BEFORE
throw new Error('Something went wrong');

// AFTER
throw new AppError(
  'Failed to process marketplace bid',
  400,
  ErrorCode.INVALID_STATE,
  { listingId, bidAmount, reason: 'Listing expired' }
);
```

## 7.2 Logging Standardization

Replace all `console.log` with logger:

```bash
# Find all console.log statements
grep -rn "console.log" server/src/
```

**Replace with:**
```typescript
import { logger } from '../utils/logger';

// Debug level for development details
logger.debug('Processing action', { actionId, characterId });

// Info level for important operations
logger.info('Character created', { characterId, faction });

// Warn level for recoverable issues
logger.warn('Rate limit exceeded', { userId, endpoint });

// Error level for failures
logger.error('Database connection failed', { error, retryCount });
```

## 7.3 Type Safety Improvements

Remove all `any` type assertions:

```bash
# Find all 'any' usages
grep -rn ": any" server/src/
grep -rn "as any" server/src/
```

**Replace with proper types or unknown + type guards.**

---

## PHASE 7 CHECKLIST

| Task | Status | Scope |
|------|--------|-------|
| Audit all Error throws for AppError usage | TODO | All services |
| Replace console.log with logger (server) | TODO | Server |
| Replace console.log with logger (client) | TODO | Client |
| Remove all `any` type assertions | TODO | All |
| Add JSDoc to all public methods | TODO | All services |
| Update API documentation | TODO | Routes |
| Create error code documentation | TODO | Docs |

**Estimated Time:** 24 hours

---

# IMPLEMENTATION ORDER

## Sprint 1 (Week 1-2): Foundation + Critical
1. Phase 0: Shared Infrastructure
2. Phase 1: Critical Game-Breakers

## Sprint 2 (Week 3-4): Security
3. Phase 2: Security Layer

## Sprint 3 (Week 5-6): Persistence + Transactions
4. Phase 3: Data Persistence Migration
5. Phase 4: Transaction Safety

## Sprint 4 (Week 7-10): Features
6. Phase 5: Feature Completeness

## Sprint 5 (Week 11-12): Performance + Polish
7. Phase 6: Performance Optimization
8. Phase 7: Polish and Standardization

---

# TOTAL ESTIMATED EFFORT

| Phase | Hours |
|-------|-------|
| Phase 0: Foundation | 16 |
| Phase 1: Critical | 24 |
| Phase 2: Security | 12 |
| Phase 3: Persistence | 32 |
| Phase 4: Transactions | 24 |
| Phase 5: Features | 60 |
| Phase 6: Performance | 20 |
| Phase 7: Polish | 24 |
| **TOTAL** | **212 hours** |

**With testing and code review buffer: ~300 hours**

---

# SUCCESS METRICS

After remediation:
- [ ] All 96 systems score 7/10 or higher
- [ ] Zero critical security vulnerabilities
- [ ] Zero game-breaking bugs
- [ ] All game state persists across restarts
- [ ] No race conditions in concurrent operations
- [ ] All tests pass
- [ ] Performance benchmarks met
- [ ] Production deployment successful

---

**Document Version:** 1.0
**Last Updated:** December 14, 2025
