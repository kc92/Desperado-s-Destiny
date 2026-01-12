// Disable MongoDB transactions in test environment to prevent lock timeouts
// Must be set BEFORE any imports to ensure all services respect this flag
process.env.DISABLE_TRANSACTIONS = 'true';

/**
 * Test Setup
 *
 * Global test setup for backend tests
 * Sets up in-memory MongoDB REPLICA SET for testing
 * Note: Transactions disabled via DISABLE_TRANSACTIONS for test stability
 */

// Mock EmailService to prevent SMTP connection attempts during tests
jest.mock('../src/services/email.service', () => ({
  EmailService: {
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
    sendEmail: jest.fn().mockResolvedValue(true),
  }
}));

// Mock Socket.io to prevent "Socket.io server is not initialized" errors
jest.mock('../src/config/socket', () => ({
  getSocketIO: jest.fn(() => ({
    emit: jest.fn(),
    on: jest.fn(),
    to: jest.fn(() => ({ emit: jest.fn() })),
    sockets: {
      sockets: new Map(),
    },
  })),
  initializeSocketIO: jest.fn().mockResolvedValue({}),
}));

import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { connectRedis, disconnectRedis } from '../src/config/redis';

let mongoServer: MongoMemoryReplSet;

/**
 * Setup before all tests
 */
beforeAll(async () => {
  // Connect Redis Mock
  await connectRedis();

  // Create in-memory MongoDB REPLICA SET (enables transactions)
  mongoServer = await MongoMemoryReplSet.create({
    replSet: {
      count: 1, // Single node replica set
      storageEngine: 'wiredTiger',
    },
  });
  const mongoUri = mongoServer.getUri();

  // Set the in-memory MongoDB URI
  process.env.MONGODB_URI = mongoUri;

  // Connect to the in-memory database
  await mongoose.connect(mongoUri);

  // Wait for replica set to be ready (prevents race conditions)
  const admin = mongoose.connection.db!.admin();
  await admin.ping();
}, 120000); // Increased timeout for replica set initialization

/**
 * Cleanup after each test
 * Uses sequential deletion to prevent lock conflicts
 */
afterEach(async () => {
  // Clear all collections after each test (sequential to prevent lock conflicts)
  if (mongoose.connection.readyState === 1) {
    const collections = Object.values(mongoose.connection.collections);
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
});

/**
 * Cleanup after all tests
 */
afterAll(async () => {
  // Disconnect from database
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }

  // Stop in-memory MongoDB replica set
  if (mongoServer) {
    await mongoServer.stop();
  }

  // Disconnect Redis
  await disconnectRedis();
}, 60000); // Increased timeout for cleanup

// Increase test timeout for integration tests
jest.setTimeout(30000);

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  // Uncomment to suppress console output during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  // error: jest.fn(),
};

// Export helper functions for backward compatibility
// Some tests import these from setup.ts instead of db.helpers.ts
export async function connectTestDB(): Promise<void> {
  // Connection is handled by beforeAll, this is a no-op for compatibility
  if (mongoose.connection.readyState !== 1) {
    throw new Error('Database not initialized. Ensure setup.ts runs first.');
  }
}

export async function closeTestDB(): Promise<void> {
  // Cleanup is handled by afterAll, this is a no-op for compatibility
}

export async function disconnectTestDB(): Promise<void> {
  // Cleanup is handled by afterAll, this is a no-op for compatibility
}

export async function clearTestDB(): Promise<void> {
  // Clear all collections
  if (mongoose.connection.readyState === 1) {
    const collections = Object.values(mongoose.connection.collections);
    await Promise.all(
      collections.map(collection => collection.deleteMany({}))
    );
  }
}
