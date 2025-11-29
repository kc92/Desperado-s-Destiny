/**
 * Presence Service Tests
 * Sprint 5 - Agent 1
 *
 * Tests for Redis-based online status tracking
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PresenceService } from '../../src/services/presence.service';
import { Character, ICharacter } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import { RoomType } from '../../src/models/Message.model';
import { Faction } from '@desperados/shared';
import { connectRedis, disconnectRedis, getRedisClient } from '../../src/config/redis';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Disconnect if already connected
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Connect to Redis
  await connectRedis();
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoServer.stop();

  // Disconnect from Redis
  await disconnectRedis();
});

afterEach(async () => {
  // Clear MongoDB
  await Character.deleteMany({});
  await User.deleteMany({});

  // Clear Redis
  const redis = getRedisClient();
  await redis.flushDb();
});

describe('PresenceService', () => {
  let testUser: any;
  let testCharacter: ICharacter;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      email: 'presencetest@example.com',
      passwordHash: 'hashedpassword123',
      emailVerified: true,
    });

    // Create test character
    testCharacter = await Character.create({
      userId: testUser._id,
      name: 'PresenceTester',
      faction: Faction.FRONTERA,
      appearance: {
        bodyType: 'male',
        skinTone: 5,
        facePreset: 3,
        hairStyle: 7,
        hairColor: 2,
      },
      currentLocation: 'el-paso',
    });
  });

  describe('setOnline()', () => {
    it('should set character as online in Redis', async () => {
      await PresenceService.setOnline(
        testCharacter._id.toString(),
        testCharacter.name
      );

      const isOnline = await PresenceService.isOnline(testCharacter._id.toString());
      expect(isOnline).toBe(true);
    });

    it('should store online user data correctly', async () => {
      await PresenceService.setOnline(
        testCharacter._id.toString(),
        testCharacter.name
      );

      const onlineUser = await PresenceService.getOnlineUser(
        testCharacter._id.toString()
      );

      expect(onlineUser).not.toBeNull();
      expect(onlineUser!.characterId).toBe(testCharacter._id.toString());
      expect(onlineUser!.characterName).toBe(testCharacter.name);
      expect(onlineUser!.lastSeen).toBeInstanceOf(Date);
    });

    it('should set Redis key with TTL', async () => {
      const redis = getRedisClient();

      await PresenceService.setOnline(
        testCharacter._id.toString(),
        testCharacter.name
      );

      const ttl = await redis.ttl(`online:${testCharacter._id}`);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(120);
    });
  });

  describe('setOffline()', () => {
    it('should remove character from online status', async () => {
      // Set online first
      await PresenceService.setOnline(
        testCharacter._id.toString(),
        testCharacter.name
      );

      expect(await PresenceService.isOnline(testCharacter._id.toString())).toBe(true);

      // Set offline
      await PresenceService.setOffline(testCharacter._id.toString());

      expect(await PresenceService.isOnline(testCharacter._id.toString())).toBe(false);
    });

    it('should remove from sorted set', async () => {
      const redis = getRedisClient();

      await PresenceService.setOnline(
        testCharacter._id.toString(),
        testCharacter.name
      );

      await PresenceService.setOffline(testCharacter._id.toString());

      const members = await redis.zRange('online:all', 0, -1);
      expect(members).not.toContain(testCharacter._id.toString());
    });
  });

  describe('heartbeat()', () => {
    it('should extend TTL on heartbeat', async () => {
      const redis = getRedisClient();

      await PresenceService.setOnline(
        testCharacter._id.toString(),
        testCharacter.name
      );

      // Wait 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get TTL before heartbeat
      const ttlBefore = await redis.ttl(`online:${testCharacter._id}`);

      // Send heartbeat
      await PresenceService.heartbeat(testCharacter._id.toString());

      // Get TTL after heartbeat
      const ttlAfter = await redis.ttl(`online:${testCharacter._id}`);

      // TTL should be refreshed (close to 120 seconds)
      expect(ttlAfter).toBeGreaterThan(ttlBefore);
      expect(ttlAfter).toBeGreaterThan(115);
    });

    it('should throw error if character not online', async () => {
      await expect(
        PresenceService.heartbeat(testCharacter._id.toString())
      ).rejects.toThrow();
    });
  });

  describe('isOnline()', () => {
    it('should return true for online character', async () => {
      await PresenceService.setOnline(
        testCharacter._id.toString(),
        testCharacter.name
      );

      const isOnline = await PresenceService.isOnline(testCharacter._id.toString());
      expect(isOnline).toBe(true);
    });

    it('should return false for offline character', async () => {
      const isOnline = await PresenceService.isOnline(testCharacter._id.toString());
      expect(isOnline).toBe(false);
    });
  });

  describe('getAllOnlineUsers()', () => {
    it('should return all online users', async () => {
      // Create multiple characters
      const user2 = await User.create({
        email: 'presence2@example.com',
        passwordHash: 'hashedpassword123',
        emailVerified: true,
      });

      const char2 = await Character.create({
        userId: user2._id,
        name: 'PresenceTester2',
        faction: Faction.NAHI_COALITION,
        appearance: {
          bodyType: 'female',
          skinTone: 3,
          facePreset: 1,
          hairStyle: 5,
          hairColor: 4,
        },
        currentLocation: 'santa-fe',
      });

      // Set both online
      await PresenceService.setOnline(
        testCharacter._id.toString(),
        testCharacter.name
      );

      await PresenceService.setOnline(
        char2._id.toString(),
        char2.name
      );

      // Get all online users
      const onlineUsers = await PresenceService.getAllOnlineUsers();

      expect(onlineUsers).toHaveLength(2);
      expect(onlineUsers.map(u => u.characterName)).toContain(testCharacter.name);
      expect(onlineUsers.map(u => u.characterName)).toContain(char2.name);
    });

    it('should return sorted by character name', async () => {
      const user2 = await User.create({
        email: 'presence2@example.com',
        passwordHash: 'hashedpassword123',
        emailVerified: true,
      });

      const char2 = await Character.create({
        userId: user2._id,
        name: 'Alice',
        faction: Faction.SETTLER_ALLIANCE,
        appearance: {
          bodyType: 'female',
          skinTone: 3,
          facePreset: 1,
          hairStyle: 5,
          hairColor: 4,
        },
        currentLocation: 'san-antonio',
      });

      await PresenceService.setOnline(testCharacter._id.toString(), 'Zack');
      await PresenceService.setOnline(char2._id.toString(), 'Alice');

      const onlineUsers = await PresenceService.getAllOnlineUsers();

      expect(onlineUsers[0].characterName).toBe('Alice');
      expect(onlineUsers[1].characterName).toBe('Zack');
    });
  });

  describe('getOnlineUsers() by room', () => {
    it('should return all users for GLOBAL room', async () => {
      await PresenceService.setOnline(
        testCharacter._id.toString(),
        testCharacter.name
      );

      const onlineUsers = await PresenceService.getOnlineUsers(
        RoomType.GLOBAL,
        'global'
      );

      expect(onlineUsers).toHaveLength(1);
      expect(onlineUsers[0].characterName).toBe(testCharacter.name);
    });

    it('should filter by faction for FACTION room', async () => {
      // Create character in different faction
      const user2 = await User.create({
        email: 'presence2@example.com',
        passwordHash: 'hashedpassword123',
        emailVerified: true,
      });

      const char2 = await Character.create({
        userId: user2._id,
        name: 'NahiTester',
        faction: Faction.NAHI_COALITION,
        appearance: {
          bodyType: 'female',
          skinTone: 3,
          facePreset: 1,
          hairStyle: 5,
          hairColor: 4,
        },
        currentLocation: 'santa-fe',
      });

      // Set both online
      await PresenceService.setOnline(
        testCharacter._id.toString(),
        testCharacter.name
      );

      await PresenceService.setOnline(
        char2._id.toString(),
        char2.name
      );

      // Get online users for FRONTERA faction
      const fronteraUsers = await PresenceService.getOnlineUsers(
        RoomType.FACTION,
        'FRONTERA'
      );

      expect(fronteraUsers).toHaveLength(1);
      expect(fronteraUsers[0].characterName).toBe(testCharacter.name);
    });
  });

  describe('getOnlineCount()', () => {
    it('should return count of online users', async () => {
      await PresenceService.setOnline(
        testCharacter._id.toString(),
        testCharacter.name
      );

      const count = await PresenceService.getOnlineCount(
        RoomType.GLOBAL,
        'global'
      );

      expect(count).toBe(1);
    });
  });

  describe('cleanupExpiredStatuses()', () => {
    it('should remove expired entries from sorted set', async () => {
      const redis = getRedisClient();

      await PresenceService.setOnline(
        testCharacter._id.toString(),
        testCharacter.name
      );

      // Manually delete the key to simulate expiry
      await redis.del(`online:${testCharacter._id}`);

      // Cleanup should remove from sorted set
      const cleaned = await PresenceService.cleanupExpiredStatuses();

      expect(cleaned).toBe(1);

      const members = await redis.zRange('online:all', 0, -1);
      expect(members).not.toContain(testCharacter._id.toString());
    });
  });
});
