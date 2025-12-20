/**
 * Socket Handler Wrapper
 * Provides error handling, logging, and validation for socket events
 *
 * Phase 0 Foundation - Used by chatHandlers, duelHandlers, and other socket handlers
 *
 * SECURITY: This wrapper ensures all socket handlers:
 * - Catch and log errors properly (no unhandled promise rejections)
 * - Sanitize error messages before sending to clients
 * - Track performance metrics
 * - Prevent duplicate action processing (idempotency)
 */

import { AuthenticatedSocket } from '../middleware/socketAuth';
import logger from './logger';
import { sanitizeErrorMessage } from './errors';

/**
 * Socket handler function type
 */
type SocketHandler<T> = (socket: AuthenticatedSocket, payload: T) => Promise<void>;

/**
 * Validation function type for socket payloads
 */
type PayloadValidator<T> = (payload: unknown) => { valid: boolean; errors?: string[]; data?: T };

/**
 * Options for the socket handler wrapper
 */
interface WrapperOptions<T> {
  /** Event name for error emission (default: `${eventName}:error`) */
  errorEvent?: string;
  /** Whether to log the payload (default: false for security) */
  logPayload?: boolean;
  /** Validation function for payload */
  validate?: PayloadValidator<T>;
  /** Custom error codes for specific error types */
  errorCodes?: {
    validation?: string;
    handler?: string;
  };
}

/**
 * Wrap a socket handler with error handling, logging, and optional validation
 *
 * This is the primary utility for creating safe socket event handlers.
 * All socket handlers should use this wrapper to ensure consistent
 * error handling and logging.
 *
 * @param eventName - Name of the socket event (for logging)
 * @param handler - Async handler function
 * @param options - Configuration options
 * @returns Wrapped handler function safe to use with socket.on()
 *
 * @example
 * socket.on('chat:send',
 *   wrapSocketHandler('chat:send', handleChatSend, {
 *     errorEvent: 'chat:error',
 *     validate: (payload) => ({
 *       valid: typeof payload?.message === 'string',
 *       errors: ['message is required']
 *     })
 *   })
 * );
 */
export function wrapSocketHandler<T>(
  eventName: string,
  handler: SocketHandler<T>,
  options: WrapperOptions<T> = {}
): (socket: AuthenticatedSocket, payload: T) => void {
  const {
    errorEvent = `${eventName}:error`,
    logPayload = false,
    validate,
    errorCodes = {}
  } = options;

  const validationErrorCode = errorCodes.validation || 'VALIDATION_ERROR';
  const handlerErrorCode = errorCodes.handler || 'HANDLER_ERROR';

  return (socket: AuthenticatedSocket, payload: T) => {
    // Wrap in async IIFE to properly handle the promise
    (async () => {
      const startTime = Date.now();
      const { userId, characterId, characterName } = socket.data;

      try {
        // Validate payload if validator provided
        if (validate) {
          const validation = validate(payload);
          if (!validation.valid) {
            logger.warn(`Socket ${eventName} validation failed`, {
              userId,
              characterId,
              errors: validation.errors
            });
            socket.emit(errorEvent, {
              error: 'Invalid request data',
              code: validationErrorCode,
              details: validation.errors
            });
            return;
          }
          // Use validated data if provided
          if (validation.data !== undefined) {
            payload = validation.data;
          }
        }

        // Execute handler
        await handler(socket, payload);

        // Log success (debug level to avoid log spam)
        logger.debug(`Socket ${eventName} completed`, {
          userId,
          characterId,
          characterName,
          duration: Date.now() - startTime,
          ...(logPayload && { payload })
        });

      } catch (error) {
        const duration = Date.now() - startTime;

        // Log error with full context
        logger.error(`Socket ${eventName} failed`, {
          userId,
          characterId,
          characterName,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          duration
        });

        // Emit sanitized error to client
        socket.emit(errorEvent, {
          error: sanitizeErrorMessage(error),
          code: handlerErrorCode
        });
      }
    })();
  };
}

/**
 * Idempotency tracker for preventing duplicate action processing
 *
 * Socket events can be received multiple times due to network issues,
 * client bugs, or malicious actors. This tracker prevents the same
 * action from being processed twice.
 *
 * Use cases:
 * - Duel actions (bet, fold, raise)
 * - Gold transfers
 * - Item purchases
 * - Any action that should only happen once
 *
 * @example
 * const tracker = new IdempotencyTracker(60000); // 1 minute TTL
 *
 * async function handleBet(socket, payload) {
 *   const { duelId, actionId, amount } = payload;
 *
 *   if (tracker.isDuplicate(duelId, actionId)) {
 *     socket.emit('duel:error', { error: 'Action already processed' });
 *     return;
 *   }
 *
 *   tracker.markProcessed(duelId, actionId);
 *   // ... process bet
 * }
 */
export class IdempotencyTracker {
  private processed = new Map<string, Set<string>>();
  private cleanupTimers = new Map<string, NodeJS.Timeout>();
  private readonly ttlMs: number;

  /**
   * @param ttlMs - Time in milliseconds before action IDs are forgotten (default: 60 seconds)
   */
  constructor(ttlMs: number = 60000) {
    this.ttlMs = ttlMs;
  }

  /**
   * Check if action was already processed
   *
   * @param contextId - Context identifier (e.g., duelId, transactionId)
   * @param actionId - Unique action identifier from client
   * @returns true if this action was already processed (duplicate)
   */
  isDuplicate(contextId: string, actionId: string): boolean {
    const actions = this.processed.get(contextId);
    return actions?.has(actionId) ?? false;
  }

  /**
   * Mark action as processed
   *
   * Call this BEFORE performing the action to prevent race conditions
   * where a duplicate request arrives while processing.
   *
   * @param contextId - Context identifier
   * @param actionId - Unique action identifier
   */
  markProcessed(contextId: string, actionId: string): void {
    let actions = this.processed.get(contextId);
    if (!actions) {
      actions = new Set();
      this.processed.set(contextId, actions);
    }
    actions.add(actionId);

    // Create cleanup key for this specific action
    const cleanupKey = `${contextId}:${actionId}`;

    // Clear any existing timer for this action
    const existingTimer = this.cleanupTimers.get(cleanupKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Auto-cleanup after TTL
    const timer = setTimeout(() => {
      actions?.delete(actionId);
      this.cleanupTimers.delete(cleanupKey);

      // Clean up context if empty
      if (actions?.size === 0) {
        this.processed.delete(contextId);
      }
    }, this.ttlMs);

    this.cleanupTimers.set(cleanupKey, timer);
  }

  /**
   * Clear all tracked actions for a context
   *
   * Call this when a context is completed (e.g., duel ends)
   * to free memory immediately.
   *
   * @param contextId - Context identifier to clear
   */
  clearContext(contextId: string): void {
    const actions = this.processed.get(contextId);
    if (actions) {
      // Clear all timers for this context
      for (const actionId of actions) {
        const cleanupKey = `${contextId}:${actionId}`;
        const timer = this.cleanupTimers.get(cleanupKey);
        if (timer) {
          clearTimeout(timer);
          this.cleanupTimers.delete(cleanupKey);
        }
      }
    }
    this.processed.delete(contextId);
  }

  /**
   * Get number of tracked contexts (for monitoring)
   */
  get contextCount(): number {
    return this.processed.size;
  }

  /**
   * Get total number of tracked actions (for monitoring)
   */
  get actionCount(): number {
    let count = 0;
    for (const actions of this.processed.values()) {
      count += actions.size;
    }
    return count;
  }
}

/**
 * Singleton idempotency tracker for duel actions
 * 5 minute TTL to handle slow/stuck duels
 */
export const duelIdempotency = new IdempotencyTracker(300000);

/**
 * Singleton idempotency tracker for gold transactions
 * 2 minute TTL
 */
export const goldIdempotency = new IdempotencyTracker(120000);

/**
 * Create a basic payload validator
 *
 * @param requiredFields - Array of field names that must be present
 * @returns Validator function
 */
export function createRequiredFieldsValidator<T extends Record<string, unknown>>(
  requiredFields: string[]
): PayloadValidator<T> {
  return (payload: unknown) => {
    if (!payload || typeof payload !== 'object') {
      return { valid: false, errors: ['Payload must be an object'] };
    }

    const errors: string[] = [];
    const obj = payload as Record<string, unknown>;

    for (const field of requiredFields) {
      if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
        errors.push(`${field} is required`);
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true, data: payload as T };
  };
}

export default {
  wrapSocketHandler,
  IdempotencyTracker,
  duelIdempotency,
  goldIdempotency,
  createRequiredFieldsValidator
};
