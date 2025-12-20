/**
 * JWT Key Rotation Service
 *
 * Manages versioned signing keys for JWT tokens.
 * Supports graceful key rotation with overlap period.
 */

import crypto from 'crypto';
import { getRedisClient, isRedisConnected } from '../config/redis';
import { config } from '../config';
import logger from '../utils/logger';

interface SigningKey {
  version: number;
  key: string;
  createdAt: string;
  expiresAt: string | null;
  isActive: boolean;
}

const KEY_PREFIX = 'jwt:signing:key:';
const ACTIVE_VERSION_KEY = 'jwt:signing:active_version';
const KEY_EXPIRY_DAYS = parseInt(process.env.JWT_KEY_EXPIRY_DAYS || '30', 10);
const MAX_STORED_VERSIONS = 5;

export class KeyRotationService {
  private static fallbackKey: string | null = null;
  private static initialized = false;

  /**
   * Initialize key rotation system
   * Creates initial key if none exists
   */
  static async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Store env secret as fallback
    this.fallbackKey = config.jwt.secret;

    if (!isRedisConnected()) {
      logger.warn('Redis not connected. Using fallback JWT secret.');
      this.initialized = true;
      return;
    }

    try {
      const redis = getRedisClient();
      const activeVersion = await redis.get(ACTIVE_VERSION_KEY);

      if (!activeVersion) {
        // First run - create initial key from env
        const initialKey = config.jwt.secret;
        await this.storeKey(1, initialKey, null);
        await redis.set(ACTIVE_VERSION_KEY, '1');
        logger.info('JWT key rotation initialized with version 1');
      } else {
        logger.info(`JWT key rotation active at version ${activeVersion}`);
      }

      this.initialized = true;
    } catch (error) {
      logger.error('Failed to initialize key rotation:', error);
      // Continue with fallback key
      this.initialized = true;
    }
  }

  /**
   * Get the current active signing key
   */
  static async getActiveKey(): Promise<{ version: number; key: string }> {
    if (!isRedisConnected()) {
      return { version: 0, key: this.fallbackKey! };
    }

    try {
      const redis = getRedisClient();
      const versionStr = await redis.get(ACTIVE_VERSION_KEY);
      const version = parseInt(versionStr || '1', 10);

      const keyData = await redis.get(`${KEY_PREFIX}${version}`);
      if (!keyData) {
        logger.warn('Active key not found in Redis, using fallback');
        return { version: 0, key: this.fallbackKey! };
      }

      const parsed = JSON.parse(keyData) as SigningKey;
      return { version, key: parsed.key };
    } catch (error) {
      logger.error('Error getting active key:', error);
      return { version: 0, key: this.fallbackKey! };
    }
  }

  /**
   * Get all valid keys for verification (newest first)
   */
  static async getValidKeys(): Promise<Array<{ version: number; key: string }>> {
    const keys: Array<{ version: number; key: string }> = [];

    if (!isRedisConnected()) {
      keys.push({ version: 0, key: this.fallbackKey! });
      return keys;
    }

    try {
      const redis = getRedisClient();
      const activeVersionStr = await redis.get(ACTIVE_VERSION_KEY);
      const activeVersion = parseInt(activeVersionStr || '1', 10);

      // Check current and previous versions
      for (let v = activeVersion; v >= Math.max(1, activeVersion - MAX_STORED_VERSIONS); v--) {
        const keyData = await redis.get(`${KEY_PREFIX}${v}`);
        if (keyData) {
          const parsed = JSON.parse(keyData) as SigningKey;

          // Check if expired
          if (!parsed.expiresAt || new Date(parsed.expiresAt) > new Date()) {
            keys.push({ version: v, key: parsed.key });
          }
        }
      }

      // Always include fallback as last resort
      if (keys.length === 0) {
        keys.push({ version: 0, key: this.fallbackKey! });
      }

      return keys;
    } catch (error) {
      logger.error('Error getting valid keys:', error);
      return [{ version: 0, key: this.fallbackKey! }];
    }
  }

  /**
   * Rotate to a new signing key
   */
  static async rotateKey(): Promise<{ version: number; previousVersion: number }> {
    if (!isRedisConnected()) {
      throw new Error('Cannot rotate keys: Redis not connected');
    }

    try {
      const redis = getRedisClient();
      const currentVersionStr = await redis.get(ACTIVE_VERSION_KEY);
      const currentVersion = parseInt(currentVersionStr || '1', 10);
      const newVersion = currentVersion + 1;

      // Generate new cryptographically secure key
      const newKey = this.generateKey();

      // Mark old key with expiration
      const oldKeyData = await redis.get(`${KEY_PREFIX}${currentVersion}`);
      if (oldKeyData) {
        const parsed = JSON.parse(oldKeyData) as SigningKey;
        parsed.expiresAt = new Date(
          Date.now() + KEY_EXPIRY_DAYS * 24 * 60 * 60 * 1000
        ).toISOString();
        parsed.isActive = false;
        await redis.set(`${KEY_PREFIX}${currentVersion}`, JSON.stringify(parsed));
      }

      // Store new key
      await this.storeKey(newVersion, newKey, null);
      await redis.set(ACTIVE_VERSION_KEY, newVersion.toString());

      // Clean up very old keys
      await this.cleanupOldKeys(newVersion);

      logger.info(`JWT key rotated from version ${currentVersion} to ${newVersion}`);

      return { version: newVersion, previousVersion: currentVersion };
    } catch (error) {
      logger.error('Failed to rotate key:', error);
      throw error;
    }
  }

  /**
   * Get key info for admin dashboard
   */
  static async getKeyInfo(): Promise<{
    activeVersion: number;
    totalKeys: number;
    oldestExpiry: string | null;
  }> {
    if (!isRedisConnected()) {
      return { activeVersion: 0, totalKeys: 1, oldestExpiry: null };
    }

    try {
      const redis = getRedisClient();
      const activeVersionStr = await redis.get(ACTIVE_VERSION_KEY);
      const activeVersion = parseInt(activeVersionStr || '1', 10);

      let totalKeys = 0;
      let oldestExpiry: string | null = null;

      for (let v = activeVersion; v >= Math.max(1, activeVersion - MAX_STORED_VERSIONS); v--) {
        const keyData = await redis.get(`${KEY_PREFIX}${v}`);
        if (keyData) {
          totalKeys++;
          const parsed = JSON.parse(keyData) as SigningKey;
          if (parsed.expiresAt && (!oldestExpiry || parsed.expiresAt < oldestExpiry)) {
            oldestExpiry = parsed.expiresAt;
          }
        }
      }

      return { activeVersion, totalKeys, oldestExpiry };
    } catch (error) {
      logger.error('Error getting key info:', error);
      return { activeVersion: 0, totalKeys: 1, oldestExpiry: null };
    }
  }

  /**
   * Generate a cryptographically secure key
   */
  private static generateKey(): string {
    return crypto.randomBytes(64).toString('base64');
  }

  /**
   * Store a signing key
   */
  private static async storeKey(
    version: number,
    key: string,
    expiresAt: Date | null
  ): Promise<void> {
    const redis = getRedisClient();

    const keyData: SigningKey = {
      version,
      key,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt?.toISOString() || null,
      isActive: true,
    };

    await redis.set(`${KEY_PREFIX}${version}`, JSON.stringify(keyData));
  }

  /**
   * Clean up expired keys beyond retention limit
   */
  private static async cleanupOldKeys(currentVersion: number): Promise<void> {
    try {
      const redis = getRedisClient();

      // Delete keys older than MAX_STORED_VERSIONS
      for (let v = currentVersion - MAX_STORED_VERSIONS - 1; v >= 1; v--) {
        const keyExists = await redis.exists(`${KEY_PREFIX}${v}`);
        if (keyExists) {
          await redis.del(`${KEY_PREFIX}${v}`);
          logger.info(`Deleted expired JWT key version ${v}`);
        } else {
          // No more older keys
          break;
        }
      }
    } catch (error) {
      logger.warn('Error cleaning up old keys:', error);
    }
  }
}

export default KeyRotationService;
