/**
 * Jest Configuration for Comprehensive Testing
 * Runs exhaustive tests across all game systems, locations, and actions
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/comprehensive'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
    '!src/**/*.interface.ts',
  ],
  coverageDirectory: 'coverage-comprehensive',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 300000, // 5 minutes for comprehensive tests
  verbose: true,
  maxWorkers: 1, // Run tests sequentially to avoid conflicts
  detectOpenHandles: true,
  forceExit: true,
};
