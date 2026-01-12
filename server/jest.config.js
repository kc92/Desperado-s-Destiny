module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      useESM: true,
      isolatedModules: true,
    }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^redis$': '<rootDir>/tests/__mocks__/redis.ts',
    '^isomorphic-dompurify$': '<rootDir>/tests/__mocks__/isomorphic-dompurify.ts',
  },
  setupFiles: ['<rootDir>/tests/setEnv.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testTimeout: 30000,
  maxWorkers: 2, // Reduce concurrency to prevent MongoDB lock contention
  verbose: true,
  transformIgnorePatterns: [
    'node_modules/(?!(uuid|isomorphic-dompurify|dompurify|parse5|jsdom)/)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/performance/', // Skip intensive performance tests in regular runs
  ],
};
