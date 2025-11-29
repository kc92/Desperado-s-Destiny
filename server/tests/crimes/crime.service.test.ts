/**
 * Crime Service Tests
 *
 * Tests for crime resolution, jail mechanics, wanted levels, and player arrests
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../../src/models/Character.model';
import { Action, IAction, ActionType } from '../../src/models/Action.model';
import { CrimeService } from '../../src/services/crime.service';
import { clearDatabase } from '../helpers';
import { Faction, Suit } from '@desperados/shared';

describe('Crime Service', () => {
  let testCharacter: ICharacter;
  let crimeAction: IAction;
  let testCharacter2: ICharacter;

  beforeEach(async () => {
    await clearDatabase();

    // Create test character
    testCharacter = await Character.create({
      userId: new mongoose.Types.ObjectId(),
      name: 'Test Outlaw',
      faction: Faction.FRONTERA,
      appearance: {
        bodyType: 'male',
        skinTone: 5,
        facePreset: 1,
        hairStyle: 1,
        hairColor: 1
      },
      currentLocation: 'villa-esperanza',
      level: 5,
      experience: 0,
      energy: 150,
      maxEnergy: 150,
      lastEnergyUpdate: new Date(),
      stats: { cunning: 5, spirit: 2, combat: 3, craft: 1 },
      skills: [],
      inventory: [],
      combatStats: { wins: 0, losses: 0, totalDamage: 0, kills: 0 },
      isJailed: false,
      jailedUntil: null,
      wantedLevel: 0,
      lastWantedDecay: new Date(),
      bountyAmount: 0,
      lastArrestTime: null,
      arrestCooldowns: new Map(),
      lastActive: new Date(),
      isActive: true
    });

    // Create second character for arrest tests
    testCharacter2 = await Character.create({
      userId: new mongoose.Types.ObjectId(),
      name: 'Bounty Hunter',
      faction: Faction.SETTLER_ALLIANCE,
      appearance: {
        bodyType: 'female',
        skinTone: 3,
        facePreset: 2,
        hairStyle: 3,
        hairColor: 4
      },
      currentLocation: 'fort-liberty',
      level: 10,
      experience: 0,
      energy: 150,
      maxEnergy: 150,
      lastEnergyUpdate: new Date(),
      stats: { cunning: 2, spirit: 5, combat: 8, craft: 3 },
      skills: [],
      inventory: [],
      combatStats: { wins: 10, losses: 2, totalDamage: 5000, kills: 8 },
      isJailed: false,
      jailedUntil: null,
      wantedLevel: 0,
      lastWantedDecay: new Date(),
      bountyAmount: 0,
      lastArrestTime: null,
      arrestCooldowns: new Map(),
      lastActive: new Date(),
      isActive: true
    });

    // Create a crime action
    crimeAction = await Action.create({
      type: ActionType.CRIME,
      name: 'Test Bank Heist',
      description: 'Rob a test bank',
      energyCost: 40,
      difficulty: 75,
      requiredSuit: Suit.SPADES,
      rewards: { xp: 200, gold: 250, items: [] },
      crimeProperties: {
        jailTimeOnFailure: 120,
        wantedLevelIncrease: 4,
        witnessChance: 80,
        bailCost: 500
      },
      isActive: true
    });
  });

  describe('resolveCrimeAttempt', () => {
    it('should not apply consequences for non-CRIME actions', async () => {
      const nonCrimeAction = await Action.create({
        type: ActionType.COMBAT,
        name: 'Test Fight',
        description: 'Test combat',
        energyCost: 20,
        difficulty: 50,
        rewards: { xp: 50, gold: 30, items: [] },
        isActive: true
      });

      const result = await CrimeService.resolveCrimeAttempt(nonCrimeAction, testCharacter, true);

      expect(result.wasWitnessed).toBe(false);
      expect(result.wasJailed).toBe(false);
      expect(result.wantedLevelIncreased).toBe(0);
    });

    it('should jail character if crime failed', async () => {
      const result = await CrimeService.resolveCrimeAttempt(crimeAction, testCharacter, false);

      expect(result.wasJailed).toBe(true);
      expect(result.jailTimeMinutes).toBe(120);
      expect(result.wantedLevelIncreased).toBe(4);
      expect(result.newWantedLevel).toBe(4);

      // Refresh character from DB
      const updatedChar = await Character.findById(testCharacter._id);
      expect(updatedChar!.isJailed).toBe(true);
      expect(updatedChar!.wantedLevel).toBe(4);
      expect(updatedChar!.bountyAmount).toBe(400); // 4 * 100
    });

    it('should jail character if witnessed (even on success)', async () => {
      // Mock Math.random to guarantee witness
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.5); // 50% is below 80% witness chance

      const result = await CrimeService.resolveCrimeAttempt(crimeAction, testCharacter, true);

      expect(result.wasWitnessed).toBe(true);
      expect(result.wasJailed).toBe(true);

      Math.random = originalRandom;
    });

    it('should not jail if successful and not witnessed', async () => {
      // Mock Math.random to guarantee no witness
      const originalRandom = Math.random;
      Math.random = jest.fn(() => 0.9); // 90% is above 80% witness chance

      const result = await CrimeService.resolveCrimeAttempt(crimeAction, testCharacter, true);

      expect(result.wasWitnessed).toBe(false);
      expect(result.wasJailed).toBe(false);
      expect(result.wantedLevelIncreased).toBe(0);

      Math.random = originalRandom;
    });

    it('should cap wanted level at 5', async () => {
      testCharacter.wantedLevel = 4;
      await testCharacter.save();

      const result = await CrimeService.resolveCrimeAttempt(crimeAction, testCharacter, false);

      expect(result.newWantedLevel).toBe(5); // Capped at 5, not 8
    });

    it('should return appropriate message for different outcomes', async () => {
      const originalRandom = Math.random;

      // Success, no witness
      Math.random = jest.fn(() => 0.9);
      let result = await CrimeService.resolveCrimeAttempt(crimeAction, testCharacter, true);
      expect(result.message).toContain('pulled it off');

      // Failure, no witness
      Math.random = jest.fn(() => 0.9);
      result = await CrimeService.resolveCrimeAttempt(crimeAction, testCharacter, false);
      expect(result.message).toContain('failed');

      Math.random = originalRandom;
    });
  });

  describe('payBail', () => {
    beforeEach(async () => {
      testCharacter.sendToJail(60);
      testCharacter.wantedLevel = 3;
      await testCharacter.save();
    });

    it('should release character from jail when bail is paid', async () => {
      const result = await CrimeService.payBail(testCharacter._id.toString());

      expect(result.success).toBe(true);
      expect(result.goldSpent).toBe(150); // 3 * 50

      const updatedChar = await Character.findById(testCharacter._id);
      expect(updatedChar!.isJailed).toBe(false);
      expect(updatedChar!.jailedUntil).toBeNull();
    });

    it('should fail if character is not jailed', async () => {
      testCharacter.releaseFromJail();
      await testCharacter.save();

      const result = await CrimeService.payBail(testCharacter._id.toString());

      expect(result.success).toBe(false);
      expect(result.error).toBe('Character is not jailed');
    });

    it('should fail if character does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const result = await CrimeService.payBail(fakeId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Character not found');
    });
  });

  describe('layLow', () => {
    beforeEach(async () => {
      testCharacter.wantedLevel = 3;
      await testCharacter.save();
    });

    it('should reduce wanted level by 1 when laying low with gold', async () => {
      const result = await CrimeService.layLow(testCharacter._id.toString(), true);

      expect(result.success).toBe(true);
      expect(result.newWantedLevel).toBe(2);
      expect(result.costPaid).toBe('50 gold');

      const updatedChar = await Character.findById(testCharacter._id);
      expect(updatedChar!.wantedLevel).toBe(2);
    });

    it('should reduce wanted level by 1 when laying low with time', async () => {
      const result = await CrimeService.layLow(testCharacter._id.toString(), false);

      expect(result.success).toBe(true);
      expect(result.newWantedLevel).toBe(2);
      expect(result.costPaid).toBe('30 minutes');
    });

    it('should fail if wanted level is already 0', async () => {
      testCharacter.wantedLevel = 0;
      await testCharacter.save();

      const result = await CrimeService.layLow(testCharacter._id.toString(), false);

      expect(result.success).toBe(false);
      expect(result.error).toBe('No wanted level to reduce');
    });

    it('should not reduce wanted level below 0', async () => {
      testCharacter.wantedLevel = 1;
      await testCharacter.save();

      const result = await CrimeService.layLow(testCharacter._id.toString(), true);

      expect(result.success).toBe(true);
      expect(result.newWantedLevel).toBe(0);
    });

    it('should fail if character does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const result = await CrimeService.layLow(fakeId, false);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Character not found');
    });
  });

  describe('arrestPlayer', () => {
    beforeEach(async () => {
      // Set up target as wanted criminal
      testCharacter.wantedLevel = 4;
      testCharacter.bountyAmount = 400;
      await testCharacter.save();
    });

    it('should successfully arrest a wanted criminal', async () => {
      const result = await CrimeService.arrestPlayer(
        testCharacter2._id.toString(),
        testCharacter._id.toString()
      );

      expect(result.success).toBe(true);
      expect(result.bountyEarned).toBe(400);
      expect(result.targetJailTime).toBe(120); // 4 * 30

      // Check target is jailed
      const target = await Character.findById(testCharacter._id);
      expect(target!.isJailed).toBe(true);
      expect(target!.wantedLevel).toBe(0);
      expect(target!.bountyAmount).toBe(0);

      // Check arrester has cooldown
      const arrester = await Character.findById(testCharacter2._id);
      expect(arrester!.arrestCooldowns.has(testCharacter._id.toString())).toBe(true);
    });

    it('should fail if target wanted level is below 3', async () => {
      testCharacter.wantedLevel = 2;
      await testCharacter.save();

      const result = await CrimeService.arrestPlayer(
        testCharacter2._id.toString(),
        testCharacter._id.toString()
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('cannot be arrested');
    });

    it('should fail if target is already jailed', async () => {
      testCharacter.sendToJail(60);
      await testCharacter.save();

      const result = await CrimeService.arrestPlayer(
        testCharacter2._id.toString(),
        testCharacter._id.toString()
      );

      expect(result.success).toBe(false);
    });

    it('should fail if trying to arrest yourself', async () => {
      const result = await CrimeService.arrestPlayer(
        testCharacter._id.toString(),
        testCharacter._id.toString()
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('cannot arrest yourself');
    });

    it('should fail if arrester is jailed', async () => {
      testCharacter2.sendToJail(60);
      await testCharacter2.save();

      const result = await CrimeService.arrestPlayer(
        testCharacter2._id.toString(),
        testCharacter._id.toString()
      );

      expect(result.success).toBe(false);
    });

    it('should respect arrest cooldowns', async () => {
      // First arrest succeeds
      await CrimeService.arrestPlayer(
        testCharacter2._id.toString(),
        testCharacter._id.toString()
      );

      // Reset target for second attempt
      testCharacter.wantedLevel = 4;
      testCharacter.bountyAmount = 400;
      testCharacter.releaseFromJail();
      await testCharacter.save();

      // Second arrest within cooldown should fail
      const result = await CrimeService.arrestPlayer(
        testCharacter2._id.toString(),
        testCharacter._id.toString()
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('cooldown');
    });

    it('should fail if arrester character not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const result = await CrimeService.arrestPlayer(fakeId, testCharacter._id.toString());

      expect(result.success).toBe(false);
      expect(result.message).toContain('Arrester character not found');
    });

    it('should fail if target character not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const result = await CrimeService.arrestPlayer(testCharacter2._id.toString(), fakeId);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Target character not found');
    });
  });

  describe('decayWantedLevels', () => {
    it('should decay wanted levels after 24 hours', async () => {
      // Set up multiple characters with wanted levels
      const char1 = await Character.create({
        userId: new mongoose.Types.ObjectId(),
        name: 'Outlaw 1',
        faction: Faction.FRONTERA,
        appearance: testCharacter.appearance,
        currentLocation: 'villa-esperanza',
        level: 1,
        energy: 150,
        maxEnergy: 150,
        lastEnergyUpdate: new Date(),
        stats: { cunning: 0, spirit: 0, combat: 0, craft: 0 },
        skills: [],
        inventory: [],
        combatStats: { wins: 0, losses: 0, totalDamage: 0, kills: 0 },
        wantedLevel: 3,
        lastWantedDecay: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        isActive: true
      });

      const char2 = await Character.create({
        userId: new mongoose.Types.ObjectId(),
        name: 'Outlaw 2',
        faction: Faction.FRONTERA,
        appearance: testCharacter.appearance,
        currentLocation: 'villa-esperanza',
        level: 1,
        energy: 150,
        maxEnergy: 150,
        lastEnergyUpdate: new Date(),
        stats: { cunning: 0, spirit: 0, combat: 0, craft: 0 },
        skills: [],
        inventory: [],
        combatStats: { wins: 0, losses: 0, totalDamage: 0, kills: 0 },
        wantedLevel: 5,
        lastWantedDecay: new Date(Date.now() - 30 * 60 * 60 * 1000), // 30 hours ago
        isActive: true
      });

      const result = await CrimeService.decayWantedLevels();

      expect(result.charactersDecayed).toBe(2);
      expect(result.totalReduced).toBe(2);

      const updatedChar1 = await Character.findById(char1._id);
      const updatedChar2 = await Character.findById(char2._id);

      expect(updatedChar1!.wantedLevel).toBe(2);
      expect(updatedChar2!.wantedLevel).toBe(4);
    });

    it('should not decay if less than 24 hours have passed', async () => {
      testCharacter.wantedLevel = 3;
      testCharacter.lastWantedDecay = new Date(Date.now() - 20 * 60 * 60 * 1000); // 20 hours ago
      await testCharacter.save();

      const result = await CrimeService.decayWantedLevels();

      expect(result.charactersDecayed).toBe(0);

      const updatedChar = await Character.findById(testCharacter._id);
      expect(updatedChar!.wantedLevel).toBe(3);
    });

    it('should not decay characters with wanted level 0', async () => {
      testCharacter.wantedLevel = 0;
      testCharacter.lastWantedDecay = new Date(Date.now() - 30 * 60 * 60 * 1000);
      await testCharacter.save();

      const result = await CrimeService.decayWantedLevels();

      expect(result.charactersDecayed).toBe(0);
    });
  });

  describe('getBountyList', () => {
    it('should return only characters with wanted level >= 3', async () => {
      // Create characters with various wanted levels
      await Character.create({
        userId: new mongoose.Types.ObjectId(),
        name: 'Most Wanted',
        faction: Faction.FRONTERA,
        appearance: testCharacter.appearance,
        currentLocation: 'villa-esperanza',
        level: 10,
        energy: 150,
        maxEnergy: 150,
        lastEnergyUpdate: new Date(),
        stats: { cunning: 0, spirit: 0, combat: 0, craft: 0 },
        skills: [],
        inventory: [],
        combatStats: { wins: 0, losses: 0, totalDamage: 0, kills: 0 },
        wantedLevel: 5,
        bountyAmount: 500,
        isActive: true
      });

      await Character.create({
        userId: new mongoose.Types.ObjectId(),
        name: 'Outlaw',
        faction: Faction.FRONTERA,
        appearance: testCharacter.appearance,
        currentLocation: 'dusty-gulch',
        level: 5,
        energy: 150,
        maxEnergy: 150,
        lastEnergyUpdate: new Date(),
        stats: { cunning: 0, spirit: 0, combat: 0, craft: 0 },
        skills: [],
        inventory: [],
        combatStats: { wins: 0, losses: 0, totalDamage: 0, kills: 0 },
        wantedLevel: 3,
        bountyAmount: 300,
        isActive: true
      });

      await Character.create({
        userId: new mongoose.Types.ObjectId(),
        name: 'Petty Thief',
        faction: Faction.FRONTERA,
        appearance: testCharacter.appearance,
        currentLocation: 'villa-esperanza',
        level: 2,
        energy: 150,
        maxEnergy: 150,
        lastEnergyUpdate: new Date(),
        stats: { cunning: 0, spirit: 0, combat: 0, craft: 0 },
        skills: [],
        inventory: [],
        combatStats: { wins: 0, losses: 0, totalDamage: 0, kills: 0 },
        wantedLevel: 2,
        bountyAmount: 200,
        isActive: true
      });

      const bounties = await CrimeService.getBountyList();

      expect(bounties).toHaveLength(2);
      expect(bounties[0].name).toBe('Most Wanted');
      expect(bounties[1].name).toBe('Outlaw');
    });

    it('should not include jailed characters', async () => {
      const wantedChar = await Character.create({
        userId: new mongoose.Types.ObjectId(),
        name: 'Jailed Criminal',
        faction: Faction.FRONTERA,
        appearance: testCharacter.appearance,
        currentLocation: 'villa-esperanza',
        level: 5,
        energy: 150,
        maxEnergy: 150,
        lastEnergyUpdate: new Date(),
        stats: { cunning: 0, spirit: 0, combat: 0, craft: 0 },
        skills: [],
        inventory: [],
        combatStats: { wins: 0, losses: 0, totalDamage: 0, kills: 0 },
        wantedLevel: 4,
        bountyAmount: 400,
        isJailed: true,
        jailedUntil: new Date(Date.now() + 60 * 60 * 1000),
        isActive: true
      });

      const bounties = await CrimeService.getBountyList();

      expect(bounties).toHaveLength(0);
    });

    it('should return empty array if no wanted criminals', async () => {
      const bounties = await CrimeService.getBountyList();
      expect(bounties).toHaveLength(0);
    });

    it('should include character details in bounty list', async () => {
      await Character.create({
        userId: new mongoose.Types.ObjectId(),
        name: 'Wanted Criminal',
        faction: Faction.FRONTERA,
        appearance: testCharacter.appearance,
        currentLocation: 'villa-esperanza',
        level: 8,
        energy: 150,
        maxEnergy: 150,
        lastEnergyUpdate: new Date(),
        stats: { cunning: 0, spirit: 0, combat: 0, craft: 0 },
        skills: [],
        inventory: [],
        combatStats: { wins: 0, losses: 0, totalDamage: 0, kills: 0 },
        wantedLevel: 4,
        bountyAmount: 400,
        lastActive: new Date(),
        isActive: true
      });

      const bounties = await CrimeService.getBountyList();

      expect(bounties).toHaveLength(1);
      expect(bounties[0]).toHaveProperty('characterId');
      expect(bounties[0]).toHaveProperty('name', 'Wanted Criminal');
      expect(bounties[0]).toHaveProperty('level', 8);
      expect(bounties[0]).toHaveProperty('wantedLevel', 4);
      expect(bounties[0]).toHaveProperty('bountyAmount', 400);
      expect(bounties[0]).toHaveProperty('location', 'villa-esperanza');
      expect(bounties[0]).toHaveProperty('lastActive');
    });
  });
});
