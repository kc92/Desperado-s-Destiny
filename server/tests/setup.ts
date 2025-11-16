/**
 * Test Setup
 *
 * Global test setup for backend tests
 * Sets up in-memory MongoDB for testing
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

/**
 * Setup before all tests
 */
beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Set the in-memory MongoDB URI
  process.env.MONGODB_URI = mongoUri;

  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

/**
 * Cleanup after each test
 */
afterEach(async () => {
  // Clear all collections after each test
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
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

  // Stop in-memory MongoDB server
  if (mongoServer) {
    await mongoServer.stop();
  }
});

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
