/**
 * Deity Attention Model Tests
 * Phase 6.8 - Deity System Testing
 *
 * Tests for deity attention tracking including:
 * - Atomic getOrCreate operations
 * - Attention calculation
 * - Intervention chance calculation
 * - Race condition prevention
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DeityAttention, IDeityAttention, DeityName } from '../../src/models/DeityAttention.model';
import { Character, ICharacter } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import { Faction } from '@desperados/shared';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
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
  await Character.deleteMany({});
  await User.deleteMany({});
  await DeityAttention.deleteMany({});
});

describe('DeityAttention Model', () => {
  let testUser: any;
  let testCharacter: ICharacter;

  beforeEach(async () => {
    testUser = await User.create({
      email: 'attentiontest@example.com',
      passwordHash: 'hashedpassword123',
      isEmailVerified: true,
    });

    testCharacter = await Character.create({
      userId: testUser._id,
      name: 'AttentionTester',
      faction: Faction.FRONTERA,
      appearance: {
        bodyType: 'male',
        skinTone: 5,
        facePreset: 3,
        hairStyle: 7,
        hairColor: 2,
      },
      currentLocation: 'el-paso',
      gold: 100,
    });
  });

  describe('getOrCreate()', () => {
    it('should create new attention record if none exists', async () => {
      const attention = await DeityAttention.getOrCreate(
        testCharacter._id.toString(),
        'GAMBLER'
      );

      expect(attention).toBeDefined();
      expect(attention.characterId.toString()).toBe(testCharacter._id.toString());
      expect(attention.deityName).toBe('GAMBLER');
      expect(attention.attention).toBe(0);
      expect(attention.interest).toBe(0);
    });

    it('should return existing record if one exists', async () => {
      // Create initial
      const initial = await DeityAttention.getOrCreate(
        testCharacter._id.toString(),
        'GAMBLER'
      );
      initial.attention = 50;
      await initial.save();

      // Get again
      const retrieved = await DeityAttention.getOrCreate(
        testCharacter._id.toString(),
        'GAMBLER'
      );

      expect(retrieved.attention).toBe(50);
      expect(retrieved._id.toString()).toBe(initial._id.toString());
    });

    it('should handle concurrent getOrCreate calls atomically', async () => {
      // Simulate race condition with concurrent calls
      const promises = Array(5).fill(null).map(() =>
        DeityAttention.getOrCreate(testCharacter._id.toString(), 'OUTLAW_KING')
      );

      const results = await Promise.all(promises);

      // All should return the same record
      const ids = results.map(r => r._id.toString());
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds.length).toBe(1);

      // Only one record should exist in database
      const count = await DeityAttention.countDocuments({
        characterId: testCharacter._id,
        deityName: 'OUTLAW_KING'
      });
      expect(count).toBe(1);
    });

    it('should create separate records for each deity', async () => {
      const gamblerAttention = await DeityAttention.getOrCreate(
        testCharacter._id.toString(),
        'GAMBLER'
      );
      const outlawAttention = await DeityAttention.getOrCreate(
        testCharacter._id.toString(),
        'OUTLAW_KING'
      );

      expect(gamblerAttention._id.toString()).not.toBe(outlawAttention._id.toString());
      expect(gamblerAttention.deityName).toBe('GAMBLER');
      expect(outlawAttention.deityName).toBe('OUTLAW_KING');
    });
  });

  describe('calculateInterventionChance()', () => {
    it('should return minimum 10% of base chance at 0 attention (LOGIC-4 fix)', async () => {
      const attention = await DeityAttention.create({
        characterId: testCharacter._id,
        deityName: 'GAMBLER',
        attention: 0,
        interest: 0
      });

      const chance = attention.calculateInterventionChance(0.2);
      // At 0 attention, should get 10% modifier (0.1 * 0.2 = 0.02)
      expect(chance).toBeGreaterThan(0);
      expect(chance).toBeCloseTo(0.02, 2);
    });

    it('should return base chance at 50 attention', async () => {
      const attention = await DeityAttention.create({
        characterId: testCharacter._id,
        deityName: 'GAMBLER',
        attention: 50,
        interest: 0
      });

      const chance = attention.calculateInterventionChance(0.2);
      // At 50 attention, modifier is 1.0, so chance equals base
      expect(chance).toBeCloseTo(0.2, 2);
    });

    it('should return 2x base chance at 100 attention', async () => {
      const attention = await DeityAttention.create({
        characterId: testCharacter._id,
        deityName: 'GAMBLER',
        attention: 100,
        interest: 0
      });

      const chance = attention.calculateInterventionChance(0.2);
      // At 100 attention, modifier is 2.0, so chance is doubled
      expect(chance).toBeCloseTo(0.4, 2);
    });

    it('should add interest bonus to intervention chance', async () => {
      const attention = await DeityAttention.create({
        characterId: testCharacter._id,
        deityName: 'GAMBLER',
        attention: 50,
        interest: 100 // Maximum interest
      });

      const chance = attention.calculateInterventionChance(0.2);
      // At 100 interest, should get 50% bonus on top of attention modifier
      expect(chance).toBeCloseTo(0.3, 2); // 0.2 * 1.0 * 1.5 = 0.3
    });

    it('should cap intervention chance at 50%', async () => {
      const attention = await DeityAttention.create({
        characterId: testCharacter._id,
        deityName: 'GAMBLER',
        attention: 100,
        interest: 100
      });

      const chance = attention.calculateInterventionChance(0.5);
      // Even with maximum attention and interest, should be capped at 50%
      expect(chance).toBeLessThanOrEqual(0.5);
    });
  });

  describe('updateKarmaTrajectory()', () => {
    it('should track karma trajectory changes', async () => {
      const attention = await DeityAttention.create({
        characterId: testCharacter._id,
        deityName: 'GAMBLER',
        attention: 0,
        karmaTrajectory: 'STABLE'
      });

      attention.updateKarmaTrajectory(5);
      expect(attention.karmaTrajectory).toBe('RISING');

      attention.updateKarmaTrajectory(-5);
      expect(attention.karmaTrajectory).toBe('FALLING');

      attention.updateKarmaTrajectory(0.5);
      expect(attention.karmaTrajectory).toBe('STABLE');
    });
  });

  describe('Static Finders', () => {
    it('findByCharacterAndDeity should find correct record', async () => {
      await DeityAttention.create({
        characterId: testCharacter._id,
        deityName: 'GAMBLER',
        attention: 25
      });
      await DeityAttention.create({
        characterId: testCharacter._id,
        deityName: 'OUTLAW_KING',
        attention: 75
      });

      const gamblerRecord = await DeityAttention.findByCharacterAndDeity(
        testCharacter._id,
        'GAMBLER'
      );
      const outlawRecord = await DeityAttention.findByCharacterAndDeity(
        testCharacter._id,
        'OUTLAW_KING'
      );

      expect(gamblerRecord?.attention).toBe(25);
      expect(outlawRecord?.attention).toBe(75);
    });

    it('findHighAttentionCharacters should return characters above threshold', async () => {
      // Create multiple character attention records
      await DeityAttention.create({
        characterId: testCharacter._id,
        deityName: 'GAMBLER',
        attention: 80
      });

      const secondUser = await User.create({
        email: 'second@example.com',
        passwordHash: 'hashedpassword123',
        isEmailVerified: true
      });
      const secondCharacter = await Character.create({
        userId: secondUser._id,
        name: 'LowAttention',
        faction: Faction.FRONTERA,
        appearance: {
          bodyType: 'male',
          skinTone: 5,
          facePreset: 3,
          hairStyle: 7,
          hairColor: 2
        },
        currentLocation: 'el-paso',
        gold: 100
      });
      await DeityAttention.create({
        characterId: secondCharacter._id,
        deityName: 'GAMBLER',
        attention: 20
      });

      const highAttention = await DeityAttention.findHighAttentionCharacters('GAMBLER', 50, 10);
      expect(highAttention.length).toBe(1);
      expect(highAttention[0].characterId.toString()).toBe(testCharacter._id.toString());
    });
  });
});
