/**
 * BaseService - Abstract base class for all services
 *
 * Provides common functionality:
 * - MongoDB transaction handling with automatic retry
 * - Character ownership verification (prevents IDOR)
 * - Contextual logging
 * - Security event logging
 *
 * All game services should extend this class to ensure
 * consistent behavior across the codebase.
 */

import { ClientSession, startSession } from 'mongoose';
import logger from '../../utils/logger';
import { AppError, AuthorizationError, NotFoundError } from '../../utils/errors';
import { Character, ICharacter } from '../../models/Character.model';
import { ErrorCode } from '@desperados/shared';

/**
 * Options for transaction execution
 */
export interface TransactionOptions {
  /** Number of retry attempts for transient errors (default: 3) */
  retries?: number;
  /** Use existing session for nested transactions */
  existingSession?: ClientSession;
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * Result of a transaction with metadata
 */
export interface TransactionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  attempts: number;
}

/**
 * Abstract base class for all services
 */
export abstract class BaseService {
  protected readonly serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * Execute operation within a MongoDB transaction
   * Handles session creation, commit, abort, and cleanup
   * Implements automatic retry with exponential backoff for transient errors
   *
   * @param operation - Async function to execute within transaction
   * @param options - Transaction configuration options
   * @returns Result of the operation
   * @throws Original error after all retries exhausted
   *
   * @example
   * ```typescript
   * const result = await this.withTransaction(async (session) => {
   *   await Character.findByIdAndUpdate(charId, { gold: newGold }, { session });
   *   await GoldTransaction.create([{ ... }], { session });
   *   return { success: true };
   * });
   * ```
   */
  protected async withTransaction<T>(
    operation: (session: ClientSession) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T> {
    const maxRetries = options?.retries ?? 3;
    const timeout = options?.timeout ?? 30000;

    // Use existing session if provided (for nested transactions)
    if (options?.existingSession) {
      return operation(options.existingSession);
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const session = await startSession();

      try {
        // Set transaction timeout
        const transactionPromise = this.executeTransaction(session, operation);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Transaction timeout')), timeout)
        );

        const result = await Promise.race([transactionPromise, timeoutPromise]);
        return result;
      } catch (error) {
        await session.abortTransaction().catch(() => {});
        lastError = error as Error;

        this.log('warn', `Transaction attempt ${attempt}/${maxRetries} failed`, {
          error: lastError.message,
          attempt
        });

        // Only retry on transient errors
        if (!this.isRetryableError(error) || attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff: 100ms, 200ms, 400ms...
        await this.delay(Math.pow(2, attempt) * 100);
      } finally {
        await session.endSession().catch(() => {});
      }
    }

    throw lastError;
  }

  /**
   * Execute the transaction operation with proper commit/abort handling
   */
  private async executeTransaction<T>(
    session: ClientSession,
    operation: (session: ClientSession) => Promise<T>
  ): Promise<T> {
    session.startTransaction({
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' }
    });

    const result = await operation(session);
    await session.commitTransaction();
    return result;
  }

  /**
   * Verify character exists and belongs to user
   * This is the PRIMARY IDOR protection mechanism
   *
   * @param userId - User ID from authenticated request
   * @param characterId - Character ID from request params
   * @param session - Optional MongoDB session for transactional reads
   * @returns Character document if verification passes
   * @throws NotFoundError if character doesn't exist
   * @throws AuthorizationError if character doesn't belong to user
   *
   * @example
   * ```typescript
   * const character = await this.verifyCharacterOwnership(req.user.id, req.params.characterId);
   * // Safe to proceed - character definitely belongs to this user
   * ```
   */
  protected async verifyCharacterOwnership(
    userId: string,
    characterId: string,
    session?: ClientSession
  ): Promise<ICharacter> {
    const character = await Character.findById(characterId).session(session || null);

    if (!character) {
      throw new NotFoundError('Character');
    }

    if (character.userId.toString() !== userId.toString()) {
      this.logSecurityEvent('OWNERSHIP_VIOLATION', {
        userId,
        characterId,
        actualOwner: character.userId.toString()
      });
      throw new AuthorizationError('Character does not belong to user');
    }

    return character;
  }

  /**
   * Verify multiple characters belong to the same user
   * Useful for operations involving multiple characters
   *
   * @param userId - User ID from authenticated request
   * @param characterIds - Array of character IDs to verify
   * @param session - Optional MongoDB session
   * @returns Array of verified character documents
   */
  protected async verifyMultipleCharacterOwnership(
    userId: string,
    characterIds: string[],
    session?: ClientSession
  ): Promise<ICharacter[]> {
    const characters = await Character.find({
      _id: { $in: characterIds }
    }).session(session || null);

    if (characters.length !== characterIds.length) {
      const foundIds = characters.map(c => c._id.toString());
      const missingIds = characterIds.filter(id => !foundIds.includes(id));
      throw new NotFoundError(`Characters: ${missingIds.join(', ')}`);
    }

    for (const character of characters) {
      if (character.userId.toString() !== userId.toString()) {
        this.logSecurityEvent('OWNERSHIP_VIOLATION', {
          userId,
          characterId: character._id.toString(),
          actualOwner: character.userId.toString()
        });
        throw new AuthorizationError('One or more characters do not belong to user');
      }
    }

    return characters;
  }

  /**
   * Log with service context
   * Automatically prefixes messages with service name
   *
   * @param level - Log level (debug, info, warn, error)
   * @param message - Log message
   * @param meta - Additional metadata object
   */
  protected log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    meta?: Record<string, unknown>
  ): void {
    logger[level](`[${this.serviceName}] ${message}`, meta);
  }

  /**
   * Log security-relevant events
   * These are always logged at WARN level for visibility
   *
   * @param event - Security event type (e.g., 'OWNERSHIP_VIOLATION', 'SUSPICIOUS_ACTIVITY')
   * @param details - Event details
   */
  protected logSecurityEvent(event: string, details: Record<string, unknown>): void {
    logger.warn(`[SECURITY] [${this.serviceName}] ${event}`, {
      event,
      service: this.serviceName,
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  /**
   * Log audit events for important state changes
   * Used for tracking who did what and when
   *
   * @param action - Action performed (e.g., 'GOLD_TRANSFER', 'ITEM_PURCHASE')
   * @param actorId - ID of the user/character performing the action
   * @param targetId - ID of the target (if any)
   * @param details - Additional details about the action
   */
  protected logAuditEvent(
    action: string,
    actorId: string,
    targetId: string | null,
    details: Record<string, unknown>
  ): void {
    logger.info(`[AUDIT] [${this.serviceName}] ${action}`, {
      action,
      service: this.serviceName,
      actorId,
      targetId,
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  /**
   * Create a standardized AppError with service context
   *
   * @param message - Error message
   * @param statusCode - HTTP status code
   * @param code - Error code from shared constants
   * @returns AppError instance
   */
  protected createError(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR
  ): AppError {
    return new AppError(`[${this.serviceName}] ${message}`, statusCode, code);
  }

  /**
   * Check if an error is retryable (transient)
   * Used by withTransaction to determine retry behavior
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('writeconflict') ||
        message.includes('transienttransactionerror') ||
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('ECONNRESET'.toLowerCase())
      );
    }
    return false;
  }

  /**
   * Promise-based delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default BaseService;
