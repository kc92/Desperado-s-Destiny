/**
 * MongoDB Transaction Utility
 *
 * Provides safe transaction handling that works on both standalone and replica set MongoDB
 * On standalone instances, operations run without transactions
 */

import mongoose from 'mongoose';
import logger from './logger';

let isReplicaSet: boolean | null = null;

/**
 * Check if MongoDB is running as a replica set (supports transactions)
 */
async function checkReplicaSetStatus(): Promise<boolean> {
  if (isReplicaSet !== null) {
    return isReplicaSet;
  }

  try {
    const admin = mongoose.connection.db?.admin();
    if (!admin) {
      isReplicaSet = false;
      return false;
    }

    const serverStatus = await admin.serverStatus();
    isReplicaSet = !!serverStatus.repl;

    if (!isReplicaSet) {
      logger.info('[MongoDB] Running in standalone mode - transactions disabled');
    } else {
      logger.info('[MongoDB] Running in replica set mode - transactions enabled');
    }

    return isReplicaSet;
  } catch (error) {
    // If we can't check, assume standalone
    isReplicaSet = false;
    logger.debug('[MongoDB] Could not determine replica set status, assuming standalone');
    return false;
  }
}

/**
 * Execute a function with optional transaction support
 *
 * @param fn - Function to execute. Receives session (or null if standalone)
 * @param options - Configuration options
 */
export async function withOptionalTransaction<T>(
  fn: (session: mongoose.ClientSession | null) => Promise<T>,
  options: {
    /** Whether this operation truly requires transaction consistency */
    requiresTransaction?: boolean;
  } = {}
): Promise<T> {
  const supportsTransactions = await checkReplicaSetStatus();

  if (!supportsTransactions) {
    // Standalone mode: execute without transaction
    return fn(null);
  }

  // Replica set mode: use transaction
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const result = await fn(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Create a session-aware query helper
 * Returns a function that adds session to query if available
 */
export function withSession<T extends mongoose.Query<any, any>>(
  query: T,
  session: mongoose.ClientSession | null
): T {
  if (session) {
    return query.session(session) as T;
  }
  return query;
}

/**
 * Session-aware save helper
 */
export async function saveWithSession(
  doc: mongoose.Document,
  session: mongoose.ClientSession | null
): Promise<mongoose.Document> {
  if (session) {
    return doc.save({ session });
  }
  return doc.save();
}

export default {
  withOptionalTransaction,
  withSession,
  saveWithSession,
  checkReplicaSetStatus,
};
