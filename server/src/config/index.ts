import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
// Note: Cannot import logger here due to circular dependency
// logger imports config, so config cannot import logger

// Load environment variables
// Try server root first (Docker/local), then project root (fallback)
const serverEnvPath = path.resolve(__dirname, '../../.env');
const projectEnvPath = path.resolve(__dirname, '../../../.env');

let dotenvResult = dotenv.config({ path: serverEnvPath });
if (dotenvResult.error) {
  dotenvResult = dotenv.config({ path: projectEnvPath });
}

// Only log non-sensitive config status in development
if (process.env.NODE_ENV !== 'production') {
  if (dotenvResult.error) {
    console.warn('[Config] Failed to load .env file:', dotenvResult.error.message);
  }
}

/**
 * Security constants
 */
const SECURITY = {
  JWT_SECRET_MIN_LENGTH: 32,
  SESSION_SECRET_MIN_LENGTH: 32,
  MIN_SECRET_ENTROPY: 3.0, // Minimum bits of entropy per character
  KNOWN_WEAK_SECRETS: [
    'your-secret-key',
    'secret',
    'jwt-secret',
    'changeme',
    'development-secret',
    'test-secret',
  ],
} as const;

/**
 * PRODUCTION FIX: Calculate Shannon entropy of a string
 * Used to detect weak/predictable secrets like "aaaaaa" or "123123"
 */
function calculateEntropy(str: string): number {
  if (!str || str.length === 0) return 0;

  const charCounts = new Map<string, number>();
  for (const char of str) {
    charCounts.set(char, (charCounts.get(char) || 0) + 1);
  }

  let entropy = 0;
  for (const count of charCounts.values()) {
    const probability = count / str.length;
    entropy -= probability * Math.log2(probability);
  }

  return entropy;
}

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
 * Additional required environment variables for production
 */
const productionRequiredEnvVars = [
  'JWT_REFRESH_SECRET',
  'SESSION_SECRET',
] as const;

/**
 * Validation warning interface
 */
interface ValidationWarning {
  level: 'error' | 'warning';
  message: string;
}

/**
 * Generate a cryptographically secure random secret
 */
function generateSecureSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validates that all required environment variables are present
 * @throws Error if any required environment variable is missing
 */
function validateEnv(): void {
  const isProduction = process.env['NODE_ENV'] === 'production';
  const missingVars: string[] = [];
  const warnings: ValidationWarning[] = [];

  // Check base required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  // Check production-specific required variables
  if (isProduction) {
    for (const envVar of productionRequiredEnvVars) {
      if (!process.env[envVar]) {
        missingVars.push(envVar);
      }
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  // Production-specific security validations
  if (isProduction) {
    // Validate JWT secret strength
    const jwtSecret = process.env['JWT_SECRET'] || '';
    if (jwtSecret.length < SECURITY.JWT_SECRET_MIN_LENGTH) {
      throw new Error(
        `JWT_SECRET must be at least ${SECURITY.JWT_SECRET_MIN_LENGTH} characters in production. ` +
        `Current length: ${jwtSecret.length}`
      );
    }

    if ((SECURITY.KNOWN_WEAK_SECRETS as readonly string[]).includes(jwtSecret.toLowerCase())) {
      throw new Error(
        'JWT_SECRET is using a known weak/default value. ' +
        'Please generate a secure random secret for production.'
      );
    }

    // PRODUCTION FIX: Validate JWT secret entropy (detect patterns like "aaaa..." or "1234...")
    const jwtEntropy = calculateEntropy(jwtSecret);
    if (jwtEntropy < SECURITY.MIN_SECRET_ENTROPY) {
      throw new Error(
        `JWT_SECRET has low entropy (${jwtEntropy.toFixed(2)} bits). ` +
        `This indicates a weak/predictable secret. ` +
        `Use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
      );
    }

    // Validate JWT refresh secret
    const jwtRefreshSecret = process.env['JWT_REFRESH_SECRET'] || '';
    if (jwtRefreshSecret.length < SECURITY.JWT_SECRET_MIN_LENGTH) {
      throw new Error(
        `JWT_REFRESH_SECRET must be at least ${SECURITY.JWT_SECRET_MIN_LENGTH} characters in production.`
      );
    }

    if (jwtSecret === jwtRefreshSecret) {
      throw new Error(
        'JWT_SECRET and JWT_REFRESH_SECRET must be different values for security.'
      );
    }

    // Validate session secret
    const sessionSecret = process.env['SESSION_SECRET'] || '';
    if (sessionSecret.length < SECURITY.SESSION_SECRET_MIN_LENGTH) {
      throw new Error(
        `SESSION_SECRET must be at least ${SECURITY.SESSION_SECRET_MIN_LENGTH} characters in production.`
      );
    }

    // Warn about email configuration
    const smtpHost = process.env['SMTP_HOST'] || '';
    if (!smtpHost || smtpHost === 'smtp.mailtrap.io') {
      warnings.push({
        level: 'warning',
        message: 'SMTP_HOST is not configured or using Mailtrap. Email delivery may not work in production.'
      });
    }

    // Check for Sentry DSN (recommended for production error tracking)
    if (!process.env['SENTRY_DSN']) {
      warnings.push({
        level: 'warning',
        message: 'SENTRY_DSN is not configured. Error tracking will not be available.'
      });
    }

    // Check MongoDB connection string for Atlas (production-ready)
    const mongoUri = process.env['MONGODB_URI'] || '';
    if (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
      throw new Error(
        'MONGODB_URI points to localhost in production. ' +
        'Use a production MongoDB cluster (e.g., MongoDB Atlas).'
      );
    }

    // Check Redis connection - MUST use production Redis
    const redisUrl = process.env['REDIS_URL'] || '';
    if (redisUrl.includes('localhost') || redisUrl.includes('127.0.0.1')) {
      throw new Error(
        'REDIS_URL points to localhost in production. ' +
        'Use a production Redis cluster (e.g., Redis Cloud, ElastiCache).'
      );
    }

    // Check frontend URL
    const frontendUrl = process.env['FRONTEND_URL'] || '';
    if (frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1')) {
      throw new Error(
        'FRONTEND_URL points to localhost in production. ' +
        'Set this to your production domain.'
      );
    }
  }

  // Print warnings (using console.warn to avoid circular dependency with logger)
  for (const warning of warnings) {
    console.warn(`[CONFIG ${warning.level.toUpperCase()}] ${warning.message}`);
  }
}

/**
 * Get session secret, generating one if not provided (development only)
 */
function getSessionSecret(): string {
  const isProduction = process.env['NODE_ENV'] === 'production';
  const sessionSecret = process.env['SESSION_SECRET'];

  if (sessionSecret) {
    return sessionSecret;
  }

  if (isProduction) {
    // This should never happen due to validation, but just in case
    throw new Error('SESSION_SECRET is required in production');
  }

  // Generate a random secret for development
  const generated = generateSecureSecret();
  console.warn(
    '[CONFIG WARNING] SESSION_SECRET not set. Generated temporary secret for development. ' +
    'Set SESSION_SECRET in .env for persistent sessions.'
  );
  return generated;
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
   * SECURITY: Access tokens now expire in 1 hour (was 7 days)
   * - Shorter expiry reduces attack window if token is stolen
   * - Refresh tokens allow users to stay logged in without long-lived access tokens
   * - Refresh tokens can be revoked on the server if compromised
   */
  jwt: {
    secret: process.env['JWT_SECRET'] || '',
    expiresIn: process.env['JWT_EXPIRE'] || '1h', // SECURITY: Reduced from 7d to 1h
    refreshSecret: process.env['JWT_REFRESH_SECRET'] || '',
    refreshExpiresIn: process.env['JWT_REFRESH_EXPIRE'] || '7d', // Refresh token validity
  },

  /**
   * Auth configuration (alias for jwt for compatibility)
   */
  auth: {
    jwtSecret: process.env['JWT_SECRET'] || '',
    jwtExpire: process.env['JWT_EXPIRE'] || '1h', // SECURITY: Reduced from 7d to 1h
    jwtRefreshSecret: process.env['JWT_REFRESH_SECRET'] || '',
    jwtRefreshExpire: process.env['JWT_REFRESH_EXPIRE'] || '7d',
  },

  /**
   * Session configuration
   */
  session: {
    secret: getSessionSecret(),
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
   * Email configuration
   */
  email: {
    smtp: {
      host: process.env['SMTP_HOST'] || 'smtp.mailtrap.io',
      port: parseInt(process.env['SMTP_PORT'] || '587', 10),
      user: process.env['SMTP_USER'] || '',
      pass: process.env['SMTP_PASS'] || ''
    },
    from: process.env['EMAIL_FROM'] || 'noreply@desperados-destiny.com'
  },

  /**
   * Client URL for email links
   */
  clientUrl: process.env['FRONTEND_URL'] || 'http://localhost:5173',

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
