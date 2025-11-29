/**
 * Chat Rate Limiter Tests
 * Sprint 5 - Agent 1
 *
 * Tests for Redis-based rate limiting
 */

import { ChatRateLimiter } from '../../src/middleware/chatRateLimiter';
import { RoomType } from '../../src/models/Message.model';
import { connectRedis, disconnectRedis, getRedisClient } from '../../src/config/redis';

beforeAll(async () => {
  await connectRedis();
});

afterAll(async () => {
  await disconnectRedis();
});

afterEach(async () => {
  const redis = getRedisClient();
  await redis.flushDb();
});

describe('ChatRateLimiter', () => {
  describe('checkRateLimit()', () => {
    it('should allow messages within rate limit', async () => {
      const result = await ChatRateLimiter.checkRateLimit(
        'user123',
        'char123',
        RoomType.GLOBAL,
        false
      );

      expect(result.allowed).toBe(true);
    });

    it('should block messages exceeding rate limit', async () => {
      const userId = 'user123';
      const characterId = 'char123';

      // Send 5 messages (GLOBAL limit)
      for (let i = 0; i < 5; i++) {
        await ChatRateLimiter.checkRateLimit(
          userId,
          characterId,
          RoomType.GLOBAL,
          false
        );
      }

      // 6th message should be blocked
      const result = await ChatRateLimiter.checkRateLimit(
        userId,
        characterId,
        RoomType.GLOBAL,
        false
      );

      expect(result.allowed).toBe(false);
      expect(result.resetAt).toBeDefined();
    });

    it('should bypass rate limit for admin users', async () => {
      // Send 10 messages as admin (should all be allowed)
      for (let i = 0; i < 10; i++) {
        const result = await ChatRateLimiter.checkRateLimit(
          'admin123',
          'adminchar123',
          RoomType.GLOBAL,
          true // isAdmin
        );

        expect(result.allowed).toBe(true);
      }
    });

    it('should use different limits for different room types', async () => {
      const userId = 'user123';
      const characterId = 'char123';

      // GANG and WHISPER have 10 msg limit
      // Send 10 messages to GANG room
      for (let i = 0; i < 10; i++) {
        const result = await ChatRateLimiter.checkRateLimit(
          userId,
          characterId,
          RoomType.GANG,
          false
        );

        expect(result.allowed).toBe(true);
      }

      // 11th message should be blocked
      const result = await ChatRateLimiter.checkRateLimit(
        userId,
        characterId,
        RoomType.GANG,
        false
      );

      expect(result.allowed).toBe(false);
    });
  });

  describe('muteUser()', () => {
    it('should mute user for specified duration', async () => {
      const userId = 'user123';
      const characterId = 'char123';

      await ChatRateLimiter.muteUser(userId, characterId, 60); // 60 seconds

      const muteStatus = await ChatRateLimiter.checkMuteStatus(userId);

      expect(muteStatus.isMuted).toBe(true);
      expect(muteStatus.expiresAt).toBeDefined();
    });

    it('should block messages from muted user', async () => {
      const userId = 'user123';
      const characterId = 'char123';

      await ChatRateLimiter.muteUser(userId, characterId, 60);

      const result = await ChatRateLimiter.checkRateLimit(
        userId,
        characterId,
        RoomType.GLOBAL,
        false
      );

      expect(result.allowed).toBe(false);
      expect(result.isMuted).toBe(true);
    });
  });

  describe('unmuteUser()', () => {
    it('should unmute a muted user', async () => {
      const userId = 'user123';
      const characterId = 'char123';

      await ChatRateLimiter.muteUser(userId, characterId, 60);
      await ChatRateLimiter.unmuteUser(userId);

      const muteStatus = await ChatRateLimiter.checkMuteStatus(userId);

      expect(muteStatus.isMuted).toBe(false);
    });
  });

  describe('banUser()', () => {
    it('should ban user permanently', async () => {
      const userId = 'user123';

      await ChatRateLimiter.banUser(userId, 'Spamming');

      const banStatus = await ChatRateLimiter.checkBanStatus(userId);

      expect(banStatus.isBanned).toBe(true);
      expect(banStatus.reason).toBe('Spamming');
    });
  });

  describe('unbanUser()', () => {
    it('should unban a banned user', async () => {
      const userId = 'user123';

      await ChatRateLimiter.banUser(userId, 'Spamming');
      await ChatRateLimiter.unbanUser(userId);

      const banStatus = await ChatRateLimiter.checkBanStatus(userId);

      expect(banStatus.isBanned).toBe(false);
    });
  });

  describe('clearRateLimit()', () => {
    it('should clear rate limit for user', async () => {
      const userId = 'user123';
      const characterId = 'char123';

      // Send 5 messages (hit limit)
      for (let i = 0; i < 5; i++) {
        await ChatRateLimiter.checkRateLimit(
          userId,
          characterId,
          RoomType.GLOBAL,
          false
        );
      }

      // Clear rate limit
      await ChatRateLimiter.clearRateLimit(userId, RoomType.GLOBAL);

      // Should be able to send again
      const result = await ChatRateLimiter.checkRateLimit(
        userId,
        characterId,
        RoomType.GLOBAL,
        false
      );

      expect(result.allowed).toBe(true);
    });
  });
});
