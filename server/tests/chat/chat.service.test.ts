/**
 * Chat Service Tests
 * Sprint 5 - Agent 1
 *
 * Comprehensive tests for chat message operations
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ChatService } from '../../src/services/chat.service';
import { Message, RoomType } from '../../src/models/Message.model';
import { Character, ICharacter } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import { Faction } from '@desperados/shared';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Disconnect if already connected
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoServer.stop();
});

afterEach(async () => {
  await Message.deleteMany({});
  await Character.deleteMany({});
  await User.deleteMany({});
});

describe('ChatService', () => {
  let testUser: any;
  let testCharacter: ICharacter;
  let adminUser: any;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      email: 'chattest@example.com',
      passwordHash: 'hashedpassword123',
      emailVerified: true,
      role: 'user',
    });

    // Create admin user
    adminUser = await User.create({
      email: 'admin@example.com',
      passwordHash: 'hashedpassword123',
      emailVerified: true,
      role: 'admin',
    });

    // Create test character
    testCharacter = await Character.create({
      userId: testUser._id,
      name: 'ChatTester',
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

  describe('saveMessage()', () => {
    it('should save a valid message', async () => {
      const message = await ChatService.saveMessage(
        testCharacter._id.toString(),
        testCharacter.name,
        RoomType.GLOBAL,
        'global',
        'Hello, world!'
      );

      expect(message._id).toBeDefined();
      expect(message.senderId.toString()).toBe(testCharacter._id.toString());
      expect(message.senderName).toBe(testCharacter.name);
      expect(message.roomType).toBe(RoomType.GLOBAL);
      expect(message.roomId).toBe('global');
      expect(message.content).toBe('Hello, world!');
      expect(message.isSystemMessage).toBe(false);
    });

    it('should filter profanity from message content', async () => {
      const message = await ChatService.saveMessage(
        testCharacter._id.toString(),
        testCharacter.name,
        RoomType.GLOBAL,
        'global',
        'This is a damn test'
      );

      expect(message.content).toBe('This is a **** test');
    });

    it('should throw error for empty message', async () => {
      await expect(
        ChatService.saveMessage(
          testCharacter._id.toString(),
          testCharacter.name,
          RoomType.GLOBAL,
          'global',
          ''
        )
      ).rejects.toThrow('Message content cannot be empty');
    });

    it('should throw error for message exceeding 500 characters', async () => {
      const longMessage = 'a'.repeat(501);

      await expect(
        ChatService.saveMessage(
          testCharacter._id.toString(),
          testCharacter.name,
          RoomType.GLOBAL,
          'global',
          longMessage
        )
      ).rejects.toThrow('Message content exceeds maximum length');
    });

    it('should save system message without profanity filtering', async () => {
      const message = await ChatService.saveMessage(
        testCharacter._id.toString(),
        'System',
        RoomType.GLOBAL,
        'global',
        'User damn was muted',
        true
      );

      expect(message.content).toBe('User damn was muted');
      expect(message.isSystemMessage).toBe(true);
    });

    it('should throw error for invalid sender name length', async () => {
      await expect(
        ChatService.saveMessage(
          testCharacter._id.toString(),
          'AB', // Too short
          RoomType.GLOBAL,
          'global',
          'Test message'
        )
      ).rejects.toThrow('Sender name must be between 3 and 20 characters');
    });
  });

  describe('getMessageHistory()', () => {
    it('should fetch message history for a room', async () => {
      // Create multiple messages
      await ChatService.saveMessage(
        testCharacter._id.toString(),
        testCharacter.name,
        RoomType.GLOBAL,
        'global',
        'Message 1'
      );

      await ChatService.saveMessage(
        testCharacter._id.toString(),
        testCharacter.name,
        RoomType.GLOBAL,
        'global',
        'Message 2'
      );

      await ChatService.saveMessage(
        testCharacter._id.toString(),
        testCharacter.name,
        RoomType.GLOBAL,
        'global',
        'Message 3'
      );

      const messages = await ChatService.getMessageHistory(
        RoomType.GLOBAL,
        'global',
        50,
        0
      );

      expect(messages).toHaveLength(3);
    });

    it('should return messages in descending order (newest first)', async () => {
      await ChatService.saveMessage(
        testCharacter._id.toString(),
        testCharacter.name,
        RoomType.GLOBAL,
        'global',
        'First message'
      );

      await new Promise(resolve => setTimeout(resolve, 10));

      await ChatService.saveMessage(
        testCharacter._id.toString(),
        testCharacter.name,
        RoomType.GLOBAL,
        'global',
        'Second message'
      );

      const messages = await ChatService.getMessageHistory(
        RoomType.GLOBAL,
        'global'
      );

      expect(messages[0].content).toBe('Second message');
      expect(messages[1].content).toBe('First message');
    });

    it('should respect limit parameter', async () => {
      // Create 5 messages
      for (let i = 0; i < 5; i++) {
        await ChatService.saveMessage(
          testCharacter._id.toString(),
          testCharacter.name,
          RoomType.GLOBAL,
          'global',
          `Message ${i + 1}`
        );
      }

      const messages = await ChatService.getMessageHistory(
        RoomType.GLOBAL,
        'global',
        3,
        0
      );

      expect(messages).toHaveLength(3);
    });

    it('should respect offset parameter for pagination', async () => {
      // Create 5 messages
      for (let i = 0; i < 5; i++) {
        await ChatService.saveMessage(
          testCharacter._id.toString(),
          testCharacter.name,
          RoomType.GLOBAL,
          'global',
          `Message ${i + 1}`
        );
      }

      const messages = await ChatService.getMessageHistory(
        RoomType.GLOBAL,
        'global',
        2,
        2
      );

      expect(messages).toHaveLength(2);
    });

    it('should only return messages for specified room', async () => {
      await ChatService.saveMessage(
        testCharacter._id.toString(),
        testCharacter.name,
        RoomType.GLOBAL,
        'global',
        'Global message'
      );

      await ChatService.saveMessage(
        testCharacter._id.toString(),
        testCharacter.name,
        RoomType.FACTION,
        'FRONTERA',
        'Faction message'
      );

      const messages = await ChatService.getMessageHistory(
        RoomType.GLOBAL,
        'global'
      );

      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe('Global message');
    });
  });

  describe('deleteMessage()', () => {
    it('should allow admin to delete message', async () => {
      const message = await ChatService.saveMessage(
        testCharacter._id.toString(),
        testCharacter.name,
        RoomType.GLOBAL,
        'global',
        'Test message'
      );

      await ChatService.deleteMessage(message._id, adminUser._id);

      const foundMessage = await Message.findById(message._id);
      expect(foundMessage).toBeNull();
    });

    it('should throw error for non-admin user', async () => {
      const message = await ChatService.saveMessage(
        testCharacter._id.toString(),
        testCharacter.name,
        RoomType.GLOBAL,
        'global',
        'Test message'
      );

      await expect(
        ChatService.deleteMessage(message._id, testUser._id)
      ).rejects.toThrow('Only admins can delete messages');
    });

    it('should throw error if message not found', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(
        ChatService.deleteMessage(fakeId, adminUser._id)
      ).rejects.toThrow('Message not found');
    });
  });

  describe('validateRoomAccess()', () => {
    it('should allow access to GLOBAL room for any user', async () => {
      const hasAccess = await ChatService.validateRoomAccess(
        testCharacter._id,
        RoomType.GLOBAL,
        'global'
      );

      expect(hasAccess).toBe(true);
    });

    it('should allow access to FACTION room for same faction', async () => {
      const hasAccess = await ChatService.validateRoomAccess(
        testCharacter._id,
        RoomType.FACTION,
        'FRONTERA'
      );

      expect(hasAccess).toBe(true);
    });

    it('should deny access to FACTION room for different faction', async () => {
      await expect(
        ChatService.validateRoomAccess(
          testCharacter._id,
          RoomType.FACTION,
          'NAHI_COALITION'
        )
      ).rejects.toThrow('not a member of faction');
    });
  });

  describe('getRecentMessageCount()', () => {
    it('should count messages within time window', async () => {
      // Create message
      await ChatService.saveMessage(
        testCharacter._id.toString(),
        testCharacter.name,
        RoomType.GLOBAL,
        'global',
        'Recent message'
      );

      const count = await ChatService.getRecentMessageCount(
        RoomType.GLOBAL,
        'global',
        5 // last 5 minutes
      );

      expect(count).toBe(1);
    });
  });

  describe('searchMessages()', () => {
    it('should find messages matching search term', async () => {
      await ChatService.saveMessage(
        testCharacter._id.toString(),
        testCharacter.name,
        RoomType.GLOBAL,
        'global',
        'Hello world'
      );

      await ChatService.saveMessage(
        testCharacter._id.toString(),
        testCharacter.name,
        RoomType.GLOBAL,
        'global',
        'Goodbye friend'
      );

      const results = await ChatService.searchMessages(
        RoomType.GLOBAL,
        'global',
        'hello'
      );

      expect(results).toHaveLength(1);
      expect(results[0].content).toBe('Hello world');
    });

    it('should return empty array for empty search term', async () => {
      const results = await ChatService.searchMessages(
        RoomType.GLOBAL,
        'global',
        ''
      );

      expect(results).toHaveLength(0);
    });
  });

  describe('getMessagesBySender()', () => {
    it('should return messages by specific sender', async () => {
      // Create second character
      const user2 = await User.create({
        email: 'chat2@example.com',
        passwordHash: 'hashedpassword123',
        emailVerified: true,
      });

      const char2 = await Character.create({
        userId: user2._id,
        name: 'ChatTester2',
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

      await ChatService.saveMessage(
        testCharacter._id.toString(),
        testCharacter.name,
        RoomType.GLOBAL,
        'global',
        'Message from char1'
      );

      await ChatService.saveMessage(
        char2._id.toString(),
        char2.name,
        RoomType.GLOBAL,
        'global',
        'Message from char2'
      );

      const messages = await ChatService.getMessagesBySender(
        testCharacter._id
      );

      expect(messages).toHaveLength(1);
      expect(messages[0].senderName).toBe(testCharacter.name);
    });
  });

  describe('createSystemMessage()', () => {
    it('should create system message', async () => {
      const message = await ChatService.createSystemMessage(
        RoomType.GLOBAL,
        'global',
        'Server maintenance in 5 minutes'
      );

      expect(message.isSystemMessage).toBe(true);
      expect(message.senderName).toBe('System');
      expect(message.content).toBe('Server maintenance in 5 minutes');
    });
  });

  describe('getTotalMessageCount()', () => {
    it('should count all messages', async () => {
      await ChatService.saveMessage(
        testCharacter._id.toString(),
        testCharacter.name,
        RoomType.GLOBAL,
        'global',
        'Message 1'
      );

      await ChatService.saveMessage(
        testCharacter._id.toString(),
        testCharacter.name,
        RoomType.FACTION,
        'FRONTERA',
        'Message 2'
      );

      const count = await ChatService.getTotalMessageCount();

      expect(count).toBe(2);
    });

    it('should filter count by room type', async () => {
      await ChatService.saveMessage(
        testCharacter._id.toString(),
        testCharacter.name,
        RoomType.GLOBAL,
        'global',
        'Global message'
      );

      await ChatService.saveMessage(
        testCharacter._id.toString(),
        testCharacter.name,
        RoomType.FACTION,
        'FRONTERA',
        'Faction message'
      );

      const count = await ChatService.getTotalMessageCount(RoomType.GLOBAL);

      expect(count).toBe(1);
    });
  });
});
