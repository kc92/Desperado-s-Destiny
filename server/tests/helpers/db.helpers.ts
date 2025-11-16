/**
 * Database Test Helpers
 *
 * Helper functions for database operations in tests
 */

import mongoose from 'mongoose';

/**
 * Clears all documents from a specific collection
 */
export async function clearCollection(collectionName: string): Promise<void> {
  const collection = mongoose.connection.collections[collectionName];
  if (collection) {
    await collection.deleteMany({});
  }
}

/**
 * Clears all collections in the database
 */
export async function clearDatabase(): Promise<void> {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

/**
 * Gets the count of documents in a collection
 */
export async function getCollectionCount(collectionName: string): Promise<number> {
  const collection = mongoose.connection.collections[collectionName];
  if (!collection) {
    return 0;
  }
  return await collection.countDocuments();
}

/**
 * Checks if database is connected
 */
export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Waits for database connection
 */
export async function waitForConnection(timeoutMs: number = 5000): Promise<void> {
  const startTime = Date.now();

  while (!isDatabaseConnected()) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error('Database connection timeout');
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

/**
 * Creates a test database connection (for isolated tests)
 */
export async function createTestConnection(uri?: string): Promise<typeof mongoose> {
  if (!uri) {
    throw new Error('Database URI required for test connection');
  }
  return await mongoose.connect(uri);
}

/**
 * Drops the entire test database
 */
export async function dropDatabase(): Promise<void> {
  await mongoose.connection.dropDatabase();
}
