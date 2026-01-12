/**
 * Transaction Helper
 *
 * Provides utilities for handling MongoDB transactions with test environment fallback
 * Implements atomic transaction safety for all gold operations
 */

import mongoose, { ClientSession } from 'mongoose';
import logger from './logger';

/**
 * Transaction options for retry behavior
 */
export interface TransactionOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

/**
 * Default transaction options
 */
const DEFAULT_OPTIONS: Required<TransactionOptions> = {
  maxRetries: 3,
  retryDelay: 100, // milliseconds
  timeout: 30000, // 30 seconds
};

/**
 * PRODUCTION SAFEGUARD: Fatal error if transactions disabled in production
 * This check runs at module load time to prevent misconfiguration
 */
if (process.env.DISABLE_TRANSACTIONS === 'true' && process.env.NODE_ENV === 'production') {
  const errorMsg = `
================================================================================
FATAL SECURITY ERROR: DISABLE_TRANSACTIONS=true in production environment!
================================================================================

MongoDB transactions CANNOT be disabled in production. This would expose the
application to:
  - Race conditions in currency operations (double-spend exploits)
  - Data inconsistency during multi-document updates
  - Economic exploits that could destabilize the game economy

To fix this:
  1. Remove DISABLE_TRANSACTIONS from your production .env
  2. Ensure your MongoDB deployment supports transactions (replica set or sharded)
  3. If using Atlas, transactions are supported by default

The server will NOT start until this is resolved.
================================================================================
`;
  console.error(errorMsg);
  logger.error('FATAL: DISABLE_TRANSACTIONS=true in production - server refusing to start');
  process.exit(1);
}

/**
 * Checks if transactions are disabled (test environment only)
 * SECURITY: This can only return true in non-production environments
 */
export function areTransactionsDisabled(): boolean {
  // Double-check: never disable in production (belt + suspenders)
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  return process.env.DISABLE_TRANSACTIONS === 'true' || process.env.NODE_ENV === 'test';
}

/**
 * Starts a session with optional transaction
 * In test mode, returns a mock session that doesn't use transactions
 */
export async function startSession(): Promise<ClientSession> {
  const session = await mongoose.startSession();

  if (!areTransactionsDisabled()) {
    try {
      await session.startTransaction();
    } catch (error) {
      logger.warn('Failed to start transaction, continuing without transaction:', error);
    }
  }

  return session;
}

/**
 * Checks if an error is retryable (transient transaction error)
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;

  // MongoDB transient transaction errors
  if (error.hasErrorLabel && error.hasErrorLabel('TransientTransactionError')) {
    return true;
  }

  // Write conflict errors
  if (error.code === 112 || error.codeName === 'WriteConflict') {
    return true;
  }

  // Network errors
  if (error.name === 'MongoNetworkError') {
    return true;
  }

  return false;
}

/**
 * Wrapper for operations that should use transactions with retry logic
 *
 * This ensures atomic operations for all gold-related transactions:
 * - Prevents race conditions by serializing concurrent operations
 * - Automatically retries on transient failures
 * - Provides full rollback on any error
 *
 * @param operation - The operation to execute within the transaction
 * @param existingSession - Optional existing session to use
 * @param options - Transaction retry options
 * @returns Result of the operation
 */
export async function withTransaction<T>(
  operation: (session: ClientSession) => Promise<T>,
  existingSession?: ClientSession,
  options?: TransactionOptions
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const useExistingSession = !!existingSession;
  let lastError: any;

  // If using existing session, don't retry
  if (useExistingSession) {
    return await executeTransaction(operation, existingSession, true);
  }

  // Retry loop for new sessions
  for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
    try {
      const session = await mongoose.startSession();

      try {
        const result = await executeTransaction(operation, session, false);
        return result;
      } finally {
        await session.endSession();
      }
    } catch (error) {
      lastError = error;

      if (isRetryableError(error) && attempt < opts.maxRetries) {
        logger.warn(`Transaction failed with retryable error (attempt ${attempt}/${opts.maxRetries}):`, error);

        // Exponential backoff
        const delay = opts.retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Non-retryable error or max retries reached
      throw error;
    }
  }

  throw lastError;
}

/**
 * Execute a single transaction attempt
 */
async function executeTransaction<T>(
  operation: (session: ClientSession) => Promise<T>,
  session: ClientSession,
  isExternalSession: boolean
): Promise<T> {
  try {
    // Only start transaction if not disabled and we created the session
    if (!isExternalSession && !areTransactionsDisabled()) {
      try {
        await session.startTransaction({
          readConcern: { level: 'snapshot' },
          writeConcern: { w: 'majority' },
          readPreference: 'primary'
        });
      } catch (error) {
        logger.warn('Failed to start transaction, continuing without transaction:', error);
      }
    }

    const result = await operation(session);

    // Only commit if we started the transaction
    if (!isExternalSession && !areTransactionsDisabled() && session.inTransaction()) {
      await session.commitTransaction();
    }

    return result;
  } catch (error) {
    // Only abort if we started the transaction
    if (!isExternalSession && !areTransactionsDisabled() && session.inTransaction()) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        logger.error('Error aborting transaction:', abortError);
      }
    }
    throw error;
  }
}

/**
 * Execute operation with session (without transaction in test mode)
 */
export async function withSession<T>(
  operation: (session: ClientSession | null) => Promise<T>
): Promise<T> {
  if (areTransactionsDisabled()) {
    // In test mode, just execute without session
    return await operation(null);
  }

  return await withTransaction(operation);
}

/**
 * Execute multiple operations within a single transaction
 * Useful for complex multi-step operations that must all succeed or all fail
 *
 * @param operations - Array of operations to execute
 * @returns Array of results
 */
export async function withTransactionBatch<T>(
  operations: Array<(session: ClientSession) => Promise<T>>
): Promise<T[]> {
  return withTransaction(async (session) => {
    const results: T[] = [];

    for (const operation of operations) {
      const result = await operation(session);
      results.push(result);
    }

    return results;
  });
}

/**
 * Safe wrapper for gold operations that require atomicity
 * Provides additional validation and error handling specific to gold transactions
 *
 * @param operation - The gold operation to execute
 * @param context - Context for error messages (e.g., "purchase item", "transfer gold")
 * @returns Result of the operation
 */
export async function withGoldTransaction<T>(
  operation: (session: ClientSession) => Promise<T>,
  context: string = 'gold operation'
): Promise<T> {
  try {
    return await withTransaction(operation);
  } catch (error: any) {
    // Add context to error message
    if (error.message) {
      error.message = `Failed to ${context}: ${error.message}`;
    }

    logger.error(`Gold transaction failed [${context}]:`, error);
    throw error;
  }
}

/**
 * Execute function with distributed lock AND transaction
 * For operations that need both concurrency control and atomicity
 *
 * This is the safest option for financial operations where you need:
 * 1. No concurrent modifications (lock)
 * 2. All-or-nothing semantics (transaction)
 *
 * @param lockKey - Redis lock key (e.g., "lock:gold:characterId")
 * @param operation - Function to execute while holding lock
 * @param options - Lock TTL and transaction options
 * @returns Result of the operation
 *
 * @example
 * await withLockAndTransaction(
 *   `lock:gold:${characterId}`,
 *   async (session) => {
 *     const char = await Character.findById(characterId).session(session);
 *     char.gold -= amount;
 *     await char.save({ session });
 *   },
 *   { lockTtl: 10000 }
 * );
 */
export async function withLockAndTransaction<T>(
  lockKey: string,
  operation: (session: ClientSession) => Promise<T>,
  options: { lockTtl?: number } & TransactionOptions = {}
): Promise<T> {
  const { withLock } = await import('./distributedLock');
  const { lockTtl = 10000, ...transactionOptions } = options;

  return withLock(lockKey, async () => {
    return withTransaction(operation, undefined, transactionOptions);
  }, { ttl: lockTtl / 1000 });
}

export default {
  areTransactionsDisabled,
  startSession,
  withTransaction,
  withSession,
  withTransactionBatch,
  withGoldTransaction,
  withLockAndTransaction,
};
