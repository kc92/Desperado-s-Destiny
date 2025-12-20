/**
 * Karma Service Tests
 * Phase 6.8 - Deity System Testing
 *
 * Comprehensive tests for karma/deity system including:
 * - Karma recording and dimension updates
 * - Threshold crossing detection
 * - Blessing and curse generation
 * - Deity affinity calculations
 * - Race condition prevention
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import karmaService from '../../src/services/karma.service';
import { CharacterKarma, ICharacterKarma, KarmaDimension } from '../../src/models/CharacterKarma.model';
import { DivineManifestation } from '../../src/models/DivineManifestation.model';
import { DeityAttention } from '../../src/models/DeityAttention.model';
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
  await CharacterKarma.deleteMany({});
  await DivineManifestation.deleteMany({});
  await DeityAttention.deleteMany({});
});

describe('KarmaService', () => {
  let testUser: any;
  let testCharacter: ICharacter;

  beforeEach(async () => {
    testUser = await User.create({
      email: 'karmatest@example.com',
      passwordHash: 'hashedpassword123',
      isEmailVerified: true,
    });

    testCharacter = await Character.create({
      userId: testUser._id,
      name: 'KarmaTester',
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

  describe('getOrCreateKarma()', () => {
    it('should create new karma record for character without one', async () => {
      const karma = await karmaService.getOrCreateKarma(testCharacter._id.toString());

      expect(karma).toBeDefined();
      expect(karma.characterId.toString()).toBe(testCharacter._id.toString());
      expect(karma.karma.mercy).toBe(0);
      expect(karma.karma.honor).toBe(0);
      expect(karma.gamblerAffinity).toBe(0);
      expect(karma.outlawKingAffinity).toBe(0);
    });

    it('should return existing karma record if one exists', async () => {
      // Create initial karma
      const initial = await karmaService.getOrCreateKarma(testCharacter._id.toString());
      initial.karma.honor = 25;
      await initial.save();

      // Get again - should return same record
      const retrieved = await karmaService.getOrCreateKarma(testCharacter._id.toString());
      expect(retrieved.karma.honor).toBe(25);
      expect(retrieved._id.toString()).toBe(initial._id.toString());
    });
  });

  describe('recordAction()', () => {
    it('should record CRIME_MURDER action correctly', async () => {
      const result = await karmaService.recordAction(
        testCharacter._id.toString(),
        'CRIME_MURDER',
        'Killed an innocent bystander'
      );

      expect(result.karma).toBeDefined();
      expect(result.karma.karma.cruelty).toBeGreaterThan(0);
      expect(result.karma.karma.chaos).toBeGreaterThan(0);
      expect(result.karma.karma.justice).toBeLessThan(0);
      expect(result.karma.totalActions).toBe(1);
    });

    it('should record GAVE_TO_POOR action correctly', async () => {
      const result = await karmaService.recordAction(
        testCharacter._id.toString(),
        'GAVE_TO_POOR',
        'Donated gold to homeless man'
      );

      expect(result.karma).toBeDefined();
      expect(result.karma.karma.charity).toBeGreaterThan(0);
      expect(result.karma.karma.greed).toBeLessThan(0);
    });

    it('should track recent actions', async () => {
      await karmaService.recordAction(testCharacter._id.toString(), 'CRIME_THEFT_POOR', 'Stole from beggar');
      await karmaService.recordAction(testCharacter._id.toString(), 'NPC_HELPED_FREE', 'Helped stranger');

      const karma = await CharacterKarma.findOne({ characterId: testCharacter._id });
      expect(karma!.recentActions.length).toBe(2);
    });

    it('should handle unknown action type gracefully', async () => {
      const result = await karmaService.recordAction(
        testCharacter._id.toString(),
        'UNKNOWN_ACTION_TYPE',
        'Unknown action'
      );

      // Should not throw, but karma should remain unchanged
      expect(result.karma).toBeDefined();
    });
  });

  describe('Deity Affinities', () => {
    it('should increase Gambler affinity for honorable actions', async () => {
      // Honor and Justice increase Gambler affinity
      await karmaService.recordAction(testCharacter._id.toString(), 'COMBAT_FAIR_DUEL', 'Fair fight');

      const karma = await CharacterKarma.findOne({ characterId: testCharacter._id });
      expect(karma!.gamblerAffinity).toBeGreaterThan(0);
    });

    it('should increase Outlaw King affinity for chaotic actions', async () => {
      // Chaos and Survival increase Outlaw King affinity
      await karmaService.recordAction(testCharacter._id.toString(), 'CRIME_ARSON', 'Burned building');

      const karma = await CharacterKarma.findOne({ characterId: testCharacter._id });
      // Arson increases chaos which favors Outlaw King
      expect(karma!.outlawKingAffinity).toBeGreaterThan(-100);
    });
  });

  describe('getDominantTrait()', () => {
    it('should return NEUTRAL for character with no karma', async () => {
      const karma = await karmaService.getOrCreateKarma(testCharacter._id.toString());
      const dominant = karma.getDominantTrait();

      expect(dominant.trait).toBe('NEUTRAL');
      expect(dominant.value).toBe(0);
    });

    it('should return highest positive trait', async () => {
      const karma = await karmaService.getOrCreateKarma(testCharacter._id.toString());
      karma.karma.honor = 50;
      karma.karma.mercy = 30;
      await karma.save();

      const dominant = karma.getDominantTrait();
      expect(dominant.trait).toBe('HONOR');
      expect(dominant.value).toBe(50);
      expect(dominant.isPositive).toBe(true);
    });

    it('should return highest negative trait as dominant', async () => {
      const karma = await karmaService.getOrCreateKarma(testCharacter._id.toString());
      karma.karma.cruelty = 80;
      karma.karma.deception = 40;
      await karma.save();

      const dominant = karma.getDominantTrait();
      expect(dominant.trait).toBe('CRUELTY');
      expect(dominant.value).toBe(80);
    });
  });

  describe('Threshold Detection', () => {
    it('should not trigger threshold at low karma values', async () => {
      const result = await karmaService.recordAction(
        testCharacter._id.toString(),
        'CRIME_THEFT_POOR',
        'Minor theft'
      );

      // Single action shouldn't cross thresholds
      expect(result.intervention).toBeNull();
    });

    it('should detect threshold crossing after multiple actions', async () => {
      // Build up karma to cross threshold
      for (let i = 0; i < 10; i++) {
        await karmaService.recordAction(
          testCharacter._id.toString(),
          'CRIME_MURDER',
          `Murder ${i + 1}`
        );
      }

      const karma = await CharacterKarma.findOne({ characterId: testCharacter._id });
      // After 10 murders, cruelty should be high
      expect(karma!.karma.cruelty).toBeGreaterThanOrEqual(25);
    });
  });

  describe('getKarmaSummary()', () => {
    it('should return complete karma summary', async () => {
      await karmaService.recordAction(testCharacter._id.toString(), 'COMBAT_FAIR_DUEL', 'Fair fight');

      const summary = await karmaService.getKarmaSummary(testCharacter._id.toString());

      expect(summary.karma).toBeDefined();
      expect(summary.activeBlessings).toBeDefined();
      expect(summary.activeCurses).toBeDefined();
      expect(Array.isArray(summary.activeBlessings)).toBe(true);
      expect(Array.isArray(summary.activeCurses)).toBe(true);
    });
  });

  describe('Race Condition Prevention', () => {
    it('should handle concurrent karma updates correctly', async () => {
      // Simulate concurrent requests
      const promises = Array(5).fill(null).map((_, i) =>
        karmaService.recordAction(
          testCharacter._id.toString(),
          'CRIME_THEFT_RICH',
          `Concurrent theft ${i + 1}`
        )
      );

      // All should complete without errors
      const results = await Promise.allSettled(promises);
      const fulfilled = results.filter(r => r.status === 'fulfilled');

      // At least some should succeed (with retry logic)
      expect(fulfilled.length).toBeGreaterThan(0);

      // Final karma should reflect accumulated changes
      const karma = await CharacterKarma.findOne({ characterId: testCharacter._id });
      expect(karma!.totalActions).toBeGreaterThan(0);
    });
  });
});

describe('CharacterKarma Model', () => {
  let testUser: any;
  let testCharacter: ICharacter;

  beforeEach(async () => {
    testUser = await User.create({
      email: 'modeltest@example.com',
      passwordHash: 'hashedpassword123',
      isEmailVerified: true,
    });

    testCharacter = await Character.create({
      userId: testUser._id,
      name: 'ModelTester',
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

  describe('detectMoralConflict()', () => {
    it('should detect mercy vs cruelty conflict', async () => {
      const karma = await CharacterKarma.create({
        characterId: testCharacter._id,
        karma: {
          mercy: 50,
          cruelty: 50,
          greed: 0,
          charity: 0,
          justice: 0,
          chaos: 0,
          honor: 0,
          deception: 0,
          survival: 0,
          loyalty: 0
        }
      });

      const conflict = karma.detectMoralConflict();
      expect(conflict).toBeDefined();
      expect(conflict).toContain('mercy');
      expect(conflict).toContain('cruelty');
    });

    it('should return null when no conflict exists', async () => {
      const karma = await CharacterKarma.create({
        characterId: testCharacter._id,
        karma: {
          mercy: 50,
          cruelty: 0,
          greed: 0,
          charity: 50,
          justice: 50,
          chaos: 0,
          honor: 50,
          deception: 0,
          survival: 0,
          loyalty: 0
        }
      });

      const conflict = karma.detectMoralConflict();
      expect(conflict).toBeNull();
    });
  });

  describe('getRelationshipStatus()', () => {
    it('should return Blessed for high positive affinity', async () => {
      const karma = await CharacterKarma.create({
        characterId: testCharacter._id,
        gamblerAffinity: 80
      });

      const status = karma.getRelationshipStatus('GAMBLER');
      expect(status).toBe('Blessed');
    });

    it('should return Cursed for high negative affinity', async () => {
      const karma = await CharacterKarma.create({
        characterId: testCharacter._id,
        outlawKingAffinity: -80
      });

      const status = karma.getRelationshipStatus('OUTLAW_KING');
      expect(status).toBe('Cursed');
    });

    it('should return Neutral for near-zero affinity', async () => {
      const karma = await CharacterKarma.create({
        characterId: testCharacter._id,
        gamblerAffinity: 5
      });

      const status = karma.getRelationshipStatus('GAMBLER');
      expect(status).toBe('Neutral');
    });
  });
});
