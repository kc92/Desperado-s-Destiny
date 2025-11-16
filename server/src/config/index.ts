import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Required environment variables that must be present
 */
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'REDIS_URL',
  'JWT_SECRET',
  'FRONTEND_URL',
] as const;

/**
 * Validates that all required environment variables are present
 * @throws Error if any required environment variable is missing
 */
function validateEnv(): void {
  const missingVars: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
}

/**
 * Application configuration object
 * All configuration values are centralized here for easy access
 */
export const config = {
  /**
   * Environment (development, production, test)
   */
  env: process.env['NODE_ENV'] || 'development',

  /**
   * Server configuration
   */
  server: {
    port: parseInt(process.env['PORT'] || '5000', 10),
    frontendUrl: process.env['FRONTEND_URL'] || 'http://localhost:5173',
  },

  /**
   * Database configuration
   */
  database: {
    mongoUri: process.env['MONGODB_URI'] || 'mongodb://localhost:27017/desperados-destiny',
    mongoTestUri: process.env['MONGODB_TEST_URI'] || 'mongodb://localhost:27017/desperados-destiny-test',
    redisUrl: process.env['REDIS_URL'] || 'redis://localhost:6379',
    redisPassword: process.env['REDIS_PASSWORD'] || undefined,
  },

  /**
   * JWT configuration
   */
  jwt: {
    secret: process.env['JWT_SECRET'] || '',
    expiresIn: process.env['JWT_EXPIRE'] || '7d',
    refreshSecret: process.env['JWT_REFRESH_SECRET'] || '',
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRE'] || '30d',
  },

  /**
   * Session configuration
   */
  session: {
    secret: process.env['SESSION_SECRET'] || '',
    maxAge: parseInt(process.env['SESSION_MAX_AGE'] || '86400000', 10),
  },

  /**
   * Rate limiting configuration
   */
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
  },

  /**
   * Logging configuration
   */
  logging: {
    level: process.env['LOG_LEVEL'] || 'info',
  },

  /**
   * Game configuration
   */
  game: {
    maxPlayersPerLobby: parseInt(process.env['MAX_PLAYERS_PER_LOBBY'] || '100', 10),
    gameTickRate: parseInt(process.env['GAME_TICK_RATE'] || '30', 10),
  },

  /**
   * Check if running in production
   */
  isProduction: process.env['NODE_ENV'] === 'production',

  /**
   * Check if running in development
   */
  isDevelopment: process.env['NODE_ENV'] === 'development',

  /**
   * Check if running in test
   */
  isTest: process.env['NODE_ENV'] === 'test',
} as const;

// Validate environment variables on module load
// Skip validation in test environment to allow for test-specific configs
if (process.env['NODE_ENV'] !== 'test') {
  validateEnv();
}

export default config;
