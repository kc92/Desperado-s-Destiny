/**
 * Gang War Service Tests
 *
 * Comprehensive tests for gang warfare system
 * Tests war declaration, contributions, resolution, and auto-resolution
 */

import mongoose from 'mongoose';
import { Territory } from '../../src/models/Territory.model';
import { Gang } from '../../src/models/Gang.model';
import { Character } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import { GangWar, WarStatus } from '../../src/models/GangWar.model';
import { GangWarService } from '../../src/services/gangWar.service';
import { TerritoryService } from '../../src/services/territory.service';
import { clearDatabase } from '../helpers/db.helpers';

describe('Gang War Service', () => {
  let testUser: typeof User.prototype;
  let testCharacter: typeof Character.prototype;
  let testGang: typeof Gang.prototype;

  beforeEach(async () => {
    await clearDatabase();
    await TerritoryService.seedTerritories();

    testUser = await User.create({
      email: 'leader@example.com',
      password: 'hashedpassword',
    });

    testCharacter = await Character.create({
      userId: testUser._id,
      name: 'Gang Leader',
      faction: 'SETTLER_ALLIANCE',
      appearance: {
        bodyType: 'male',
        skinTone: 5,
        facePreset: 1,
        hairStyle: 1,
        hairColor: 1,
      },
      currentLocation: 'red-gulch',
      gold: 10000,
    });

    testGang = await Gang.create({
      name: 'Test Gang',
      tag: 'TEST',
      leaderId: testCharacter._id,
      memberIds: [testCharacter._id],
      bankBalance: 50000,
      territories: [],
      upgrades: { warChest: 1 },
    });
  });

  describe('declareWar', () => {
    it('should declare war successfully with valid parameters', async () => {
      const war = await GangWarService.declareWar(
        testGang._id,
        testCharacter._id,
        'red-gulch',
        5000
      );

      expect(war).toBeDefined();
      expect(war.status).toBe(WarStatus.ACTIVE);
      expect(war.attackerGangId.toString()).toBe(testGang._id.toString());
      expect(war.attackerFunding).toBe(5000);
      expect(war.capturePoints).toBe(100);
    });

    it('should reject war with funding below minimum (1000)', async () => {
      await expect(
        GangWarService.declareWar(testGang._id, testCharacter._id, 'red-gulch', 500)
      ).rejects.toThrow('Minimum war funding is 1000 gold');
    });

    it('should reject war if character is not gang leader', async () => {
      const member = await Character.create({
        userId: testUser._id,
        name: 'Member',
        faction: 'SETTLER_ALLIANCE',
        appearance: {
          bodyType: 'female',
          skinTone: 3,
          facePreset: 2,
          hairStyle: 2,
          hairColor: 2,
        },
        currentLocation: 'red-gulch',
        gold: 5000,
      });

      testGang.memberIds.push(member._id);
      await testGang.save();

      await expect(
        GangWarService.declareWar(testGang._id, member._id, 'red-gulch', 5000)
      ).rejects.toThrow('Only gang leader can declare war');
    });

    it('should reject war if gang has no war chest upgrade', async () => {
      testGang.upgrades.warChest = 0;
      await testGang.save();

      await expect(
        GangWarService.declareWar(testGang._id, testCharacter._id, 'red-gulch', 5000)
      ).rejects.toThrow('Gang must have War Chest upgrade to declare war');
    });

    it('should reject war if gang bank has insufficient funds', async () => {
      testGang.bankBalance = 500;
      await testGang.save();

      await expect(
        GangWarService.declareWar(testGang._id, testCharacter._id, 'red-gulch', 5000)
      ).rejects.toThrow('Insufficient gang bank balance');
    });

    it('should reject war if territory is already under siege', async () => {
      await GangWarService.declareWar(testGang._id, testCharacter._id, 'red-gulch', 5000);

      const otherGang = await Gang.create({
        name: 'Other Gang',
        tag: 'OTHR',
        leaderId: new mongoose.Types.ObjectId(),
        memberIds: [],
        bankBalance: 50000,
        upgrades: { warChest: 1 },
      });

      await expect(
        GangWarService.declareWar(
          otherGang._id,
          otherGang.leaderId,
          'red-gulch',
          5000
        )
      ).rejects.toThrow('Territory is already under siege');
    });

    it('should reject war if gang is already in active war', async () => {
      await GangWarService.declareWar(testGang._id, testCharacter._id, 'red-gulch', 5000);

      await expect(
        GangWarService.declareWar(testGang._id, testCharacter._id, 'sacred-springs', 5000)
      ).rejects.toThrow('Gang is already involved in an active war');
    });

    it('should deduct funding from gang bank', async () => {
      const initialBalance = testGang.bankBalance;

      await GangWarService.declareWar(testGang._id, testCharacter._id, 'red-gulch', 5000);

      const updatedGang = await Gang.findById(testGang._id);
      expect(updatedGang?.bankBalance).toBe(initialBalance - 5000);
    });

    it('should set resolveAt to 24 hours after declaration', async () => {
      const before = Date.now();
      const war = await GangWarService.declareWar(
        testGang._id,
        testCharacter._id,
        'red-gulch',
        5000
      );
      const after = Date.now();

      const expectedResolveTime = 24 * 60 * 60 * 1000;
      const actualResolveTime = war.resolveAt.getTime() - war.declaredAt.getTime();

      expect(actualResolveTime).toBeGreaterThanOrEqual(expectedResolveTime - 1000);
      expect(actualResolveTime).toBeLessThanOrEqual(expectedResolveTime + 1000);
    });

    it('should create war log entry for declaration', async () => {
      const war = await GangWarService.declareWar(
        testGang._id,
        testCharacter._id,
        'red-gulch',
        5000
      );

      expect(war.warLog).toHaveLength(1);
      expect(war.warLog[0].event).toBe('WAR_DECLARED');
      expect(war.warLog[0].data.initialFunding).toBe(5000);
    });
  });

  describe('contributeToWar', () => {
    let war: typeof GangWar.prototype;

    beforeEach(async () => {
      war = await GangWarService.declareWar(
        testGang._id,
        testCharacter._id,
        'red-gulch',
        5000
      );
    });

    it('should allow attacker to contribute to war', async () => {
      const updatedWar = await GangWarService.contributeToWar(
        war._id,
        testCharacter._id,
        2000
      );

      expect(updatedWar.attackerFunding).toBe(7000);
      expect(updatedWar.attackerContributions).toHaveLength(1);
      expect(updatedWar.attackerContributions[0].amount).toBe(2000);
    });

    it('should deduct gold from contributing character', async () => {
      const initialGold = testCharacter.gold;

      await GangWarService.contributeToWar(war._id, testCharacter._id, 2000);

      const updatedCharacter = await Character.findById(testCharacter._id);
      expect(updatedCharacter?.gold).toBe(initialGold - 2000);
    });

    it('should reject contribution if character has insufficient gold', async () => {
      testCharacter.gold = 500;
      await testCharacter.save();

      await expect(
        GangWarService.contributeToWar(war._id, testCharacter._id, 1000)
      ).rejects.toThrow('Insufficient gold');
    });

    it('should reject contribution with negative or zero amount', async () => {
      await expect(
        GangWarService.contributeToWar(war._id, testCharacter._id, 0)
      ).rejects.toThrow('Contribution amount must be positive');

      await expect(
        GangWarService.contributeToWar(war._id, testCharacter._id, -100)
      ).rejects.toThrow('Contribution amount must be positive');
    });

    it('should reject contribution from character not in involved gang', async () => {
      const outsider = await Character.create({
        userId: testUser._id,
        name: 'Outsider',
        faction: 'FRONTERA_KINGDOMS',
        appearance: {
          bodyType: 'male',
          skinTone: 5,
          facePreset: 1,
          hairStyle: 1,
          hairColor: 1,
        },
        currentLocation: 'villa-esperanza',
        gold: 5000,
      });

      await expect(
        GangWarService.contributeToWar(war._id, outsider._id, 1000)
      ).rejects.toThrow('Character is not in a gang');
    });

    it('should reject contribution to inactive war', async () => {
      war.status = WarStatus.ATTACKER_WON;
      await war.save();

      await expect(
        GangWarService.contributeToWar(war._id, testCharacter._id, 1000)
      ).rejects.toThrow('War is not active');
    });

    it('should recalculate capture points after contribution', async () => {
      const defenderUser = await User.create({
        email: 'defender@example.com',
        password: 'hashedpassword',
      });

      const defenderCharacter = await Character.create({
        userId: defenderUser._id,
        name: 'Defender',
        faction: 'SETTLER_ALLIANCE',
        appearance: {
          bodyType: 'male',
          skinTone: 5,
          facePreset: 1,
          hairStyle: 1,
          hairColor: 1,
        },
        currentLocation: 'red-gulch',
        gold: 10000,
      });

      const defenderGang = await Gang.create({
        name: 'Defender Gang',
        tag: 'DEF',
        leaderId: defenderCharacter._id,
        memberIds: [defenderCharacter._id],
        territories: ['red-gulch'],
      });

      const territory = await Territory.findOne({ id: 'red-gulch' });
      if (territory) {
        territory.controllingGangId = defenderGang._id;
        await territory.save();
      }

      const defenderWar = await GangWarService.declareWar(
        testGang._id,
        testCharacter._id,
        'red-gulch',
        5000
      );

      const updatedWar = await GangWarService.contributeToWar(
        defenderWar._id,
        defenderCharacter._id,
        5000
      );

      expect(updatedWar.capturePoints).toBe(50);
    });

    it('should add contribution to war log', async () => {
      const updatedWar = await GangWarService.contributeToWar(
        war._id,
        testCharacter._id,
        2000
      );

      const contributionLog = updatedWar.warLog.find(
        log => log.event === 'CONTRIBUTION'
      );

      expect(contributionLog).toBeDefined();
      expect(contributionLog?.data.amount).toBe(2000);
      expect(contributionLog?.data.side).toBe('attacker');
    });
  });

  describe('calculateCapturePoints', () => {
    it('should return 100 if defender has no funding', async () => {
      const war = await GangWarService.declareWar(
        testGang._id,
        testCharacter._id,
        'red-gulch',
        5000
      );

      expect(war.capturePoints).toBe(100);
    });

    it('should calculate 50:50 with equal funding', async () => {
      const war = await GangWar.create({
        attackerGangId: testGang._id,
        attackerGangName: 'Test Gang',
        defenderGangId: new mongoose.Types.ObjectId(),
        defenderGangName: 'Defender',
        territoryId: 'red-gulch',
        status: WarStatus.ACTIVE,
        declaredAt: new Date(),
        resolveAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        attackerFunding: 5000,
        defenderFunding: 5000,
        attackerContributions: [],
        defenderContributions: [],
        capturePoints: 0,
        warLog: [],
      });

      const calculatedPoints = war.calculateCapturePoints();
      expect(calculatedPoints).toBe(50);
    });

    it('should calculate 75:25 with 3:1 funding ratio', async () => {
      const war = await GangWar.create({
        attackerGangId: testGang._id,
        attackerGangName: 'Test Gang',
        defenderGangId: new mongoose.Types.ObjectId(),
        defenderGangName: 'Defender',
        territoryId: 'red-gulch',
        status: WarStatus.ACTIVE,
        declaredAt: new Date(),
        resolveAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        attackerFunding: 7500,
        defenderFunding: 2500,
        attackerContributions: [],
        defenderContributions: [],
        capturePoints: 0,
        warLog: [],
      });

      const calculatedPoints = war.calculateCapturePoints();
      expect(calculatedPoints).toBe(75);
    });

    it('should round to 2 decimal places', async () => {
      const war = await GangWar.create({
        attackerGangId: testGang._id,
        attackerGangName: 'Test Gang',
        defenderGangId: new mongoose.Types.ObjectId(),
        defenderGangName: 'Defender',
        territoryId: 'red-gulch',
        status: WarStatus.ACTIVE,
        declaredAt: new Date(),
        resolveAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        attackerFunding: 6666,
        defenderFunding: 3334,
        attackerContributions: [],
        defenderContributions: [],
        capturePoints: 0,
        warLog: [],
      });

      const calculatedPoints = war.calculateCapturePoints();
      expect(calculatedPoints).toBe(66.66);
    });
  });

  describe('resolveWar', () => {
    it('should resolve war with attacker victory (>= 60 points)', async () => {
      const war = await GangWarService.declareWar(
        testGang._id,
        testCharacter._id,
        'red-gulch',
        10000
      );

      const { war: resolvedWar, territory } = await GangWarService.resolveWar(war._id);

      expect(resolvedWar.status).toBe(WarStatus.ATTACKER_WON);
      expect(territory.controllingGangId?.toString()).toBe(testGang._id.toString());
      expect(territory.capturePoints).toBe(100);
    });

    it('should resolve war with defender victory (< 60 points)', async () => {
      const defenderUser = await User.create({
        email: 'defender@example.com',
        password: 'hashedpassword',
      });

      const defenderCharacter = await Character.create({
        userId: defenderUser._id,
        name: 'Defender',
        faction: 'SETTLER_ALLIANCE',
        appearance: {
          bodyType: 'male',
          skinTone: 5,
          facePreset: 1,
          hairStyle: 1,
          hairColor: 1,
        },
        currentLocation: 'red-gulch',
        gold: 50000,
      });

      const defenderGang = await Gang.create({
        name: 'Defender Gang',
        tag: 'DEF',
        leaderId: defenderCharacter._id,
        memberIds: [defenderCharacter._id],
        bankBalance: 100000,
        territories: ['red-gulch'],
        upgrades: { warChest: 1 },
      });

      const territory = await Territory.findOne({ id: 'red-gulch' });
      if (territory) {
        territory.controllingGangId = defenderGang._id;
        await territory.save();
      }

      const war = await GangWarService.declareWar(
        testGang._id,
        testCharacter._id,
        'red-gulch',
        5000
      );

      await GangWarService.contributeToWar(war._id, defenderCharacter._id, 15000);

      const { war: resolvedWar, territory: updatedTerritory } =
        await GangWarService.resolveWar(war._id);

      expect(resolvedWar.status).toBe(WarStatus.DEFENDER_WON);
      expect(updatedTerritory.controllingGangId?.toString()).toBe(defenderGang._id.toString());
    });

    it('should update gang territories on conquest', async () => {
      const war = await GangWarService.declareWar(
        testGang._id,
        testCharacter._id,
        'red-gulch',
        10000
      );

      await GangWarService.resolveWar(war._id);

      const updatedGang = await Gang.findById(testGang._id);
      expect(updatedGang?.territories).toContain('red-gulch');
    });

    it('should increment gang stats on victory', async () => {
      const war = await GangWarService.declareWar(
        testGang._id,
        testCharacter._id,
        'red-gulch',
        10000
      );

      await GangWarService.resolveWar(war._id);

      const updatedGang = await Gang.findById(testGang._id);
      expect(updatedGang?.stats.totalWins).toBe(1);
      expect(updatedGang?.stats.territoriesConquered).toBe(1);
    });

    it('should increment gang stats on loss', async () => {
      const defenderUser = await User.create({
        email: 'defender@example.com',
        password: 'hashedpassword',
      });

      const defenderCharacter = await Character.create({
        userId: defenderUser._id,
        name: 'Defender',
        faction: 'SETTLER_ALLIANCE',
        appearance: {
          bodyType: 'male',
          skinTone: 5,
          facePreset: 1,
          hairStyle: 1,
          hairColor: 1,
        },
        currentLocation: 'red-gulch',
        gold: 50000,
      });

      const defenderGang = await Gang.create({
        name: 'Defender Gang',
        tag: 'DEF',
        leaderId: defenderCharacter._id,
        memberIds: [defenderCharacter._id],
        territories: ['red-gulch'],
      });

      const territory = await Territory.findOne({ id: 'red-gulch' });
      if (territory) {
        territory.controllingGangId = defenderGang._id;
        await territory.save();
      }

      const war = await GangWarService.declareWar(
        testGang._id,
        testCharacter._id,
        'red-gulch',
        5000
      );

      await GangWarService.contributeToWar(war._id, defenderCharacter._id, 15000);

      await GangWarService.resolveWar(war._id);

      const updatedGang = await Gang.findById(testGang._id);
      expect(updatedGang?.stats.totalLosses).toBe(1);
    });

    it('should add to conquest history', async () => {
      const war = await GangWarService.declareWar(
        testGang._id,
        testCharacter._id,
        'red-gulch',
        10000
      );

      await GangWarService.resolveWar(war._id);

      const territory = await Territory.findOne({ id: 'red-gulch' });
      expect(territory?.conquestHistory).toHaveLength(1);
      expect(territory?.conquestHistory[0].gangName).toBe('Test Gang');
    });

    it('should set resolvedAt timestamp', async () => {
      const war = await GangWarService.declareWar(
        testGang._id,
        testCharacter._id,
        'red-gulch',
        10000
      );

      const before = Date.now();
      const { war: resolvedWar } = await GangWarService.resolveWar(war._id);
      const after = Date.now();

      expect(resolvedWar.resolvedAt).not.toBeNull();
      const resolvedTime = resolvedWar.resolvedAt!.getTime();
      expect(resolvedTime).toBeGreaterThanOrEqual(before);
      expect(resolvedTime).toBeLessThanOrEqual(after);
    });
  });

  describe('autoResolveWars', () => {
    it('should auto-resolve expired wars', async () => {
      const war = await GangWarService.declareWar(
        testGang._id,
        testCharacter._id,
        'red-gulch',
        5000
      );

      war.resolveAt = new Date(Date.now() - 1000);
      await war.save();

      const resolved = await GangWarService.autoResolveWars();

      expect(resolved).toBe(1);

      const updatedWar = await GangWar.findById(war._id);
      expect(updatedWar?.status).not.toBe(WarStatus.ACTIVE);
    });

    it('should not resolve non-expired wars', async () => {
      await GangWarService.declareWar(testGang._id, testCharacter._id, 'red-gulch', 5000);

      const resolved = await GangWarService.autoResolveWars();

      expect(resolved).toBe(0);
    });

    it('should handle multiple expired wars', async () => {
      const war1 = await GangWarService.declareWar(
        testGang._id,
        testCharacter._id,
        'red-gulch',
        5000
      );

      const gang2 = await Gang.create({
        name: 'Gang 2',
        tag: 'G2',
        leaderId: new mongoose.Types.ObjectId(),
        memberIds: [],
        bankBalance: 50000,
        upgrades: { warChest: 1 },
      });

      const war2 = await GangWarService.declareWar(
        gang2._id,
        gang2.leaderId,
        'sacred-springs',
        5000
      );

      war1.resolveAt = new Date(Date.now() - 1000);
      war2.resolveAt = new Date(Date.now() - 1000);
      await war1.save();
      await war2.save();

      const resolved = await GangWarService.autoResolveWars();

      expect(resolved).toBe(2);
    });
  });

  describe('getActiveWars', () => {
    it('should return all active wars', async () => {
      await GangWarService.declareWar(testGang._id, testCharacter._id, 'red-gulch', 5000);

      const gang2 = await Gang.create({
        name: 'Gang 2',
        tag: 'G2',
        leaderId: new mongoose.Types.ObjectId(),
        memberIds: [],
        bankBalance: 50000,
        upgrades: { warChest: 1 },
      });

      await GangWarService.declareWar(gang2._id, gang2.leaderId, 'sacred-springs', 5000);

      const activeWars = await GangWarService.getActiveWars();

      expect(activeWars).toHaveLength(2);
    });

    it('should not return resolved wars', async () => {
      const war = await GangWarService.declareWar(
        testGang._id,
        testCharacter._id,
        'red-gulch',
        5000
      );

      await GangWarService.resolveWar(war._id);

      const activeWars = await GangWarService.getActiveWars();

      expect(activeWars).toHaveLength(0);
    });

    it('should sort by resolveAt ascending', async () => {
      const war1 = await GangWarService.declareWar(
        testGang._id,
        testCharacter._id,
        'red-gulch',
        5000
      );

      const gang2 = await Gang.create({
        name: 'Gang 2',
        tag: 'G2',
        leaderId: new mongoose.Types.ObjectId(),
        memberIds: [],
        bankBalance: 50000,
        upgrades: { warChest: 1 },
      });

      const war2 = await GangWarService.declareWar(
        gang2._id,
        gang2.leaderId,
        'sacred-springs',
        5000
      );

      war1.resolveAt = new Date(Date.now() + 10000);
      war2.resolveAt = new Date(Date.now() + 5000);
      await war1.save();
      await war2.save();

      const activeWars = await GangWarService.getActiveWars();

      expect(activeWars[0]._id.toString()).toBe(war2._id.toString());
      expect(activeWars[1]._id.toString()).toBe(war1._id.toString());
    });
  });

  describe('getWarHistory', () => {
    it('should return war history for territory', async () => {
      const war = await GangWarService.declareWar(
        testGang._id,
        testCharacter._id,
        'red-gulch',
        5000
      );

      await GangWarService.resolveWar(war._id);

      const { wars, total } = await GangWarService.getWarHistory('red-gulch', 50, 0);

      expect(total).toBe(1);
      expect(wars).toHaveLength(1);
    });

    it('should not return active wars in history', async () => {
      await GangWarService.declareWar(testGang._id, testCharacter._id, 'red-gulch', 5000);

      const { wars, total } = await GangWarService.getWarHistory('red-gulch', 50, 0);

      expect(total).toBe(0);
      expect(wars).toHaveLength(0);
    });

    it('should paginate results', async () => {
      for (let i = 0; i < 5; i++) {
        const war = await GangWarService.declareWar(
          testGang._id,
          testCharacter._id,
          'red-gulch',
          5000
        );
        await GangWarService.resolveWar(war._id);

        const gang = await Gang.findById(testGang._id);
        if (gang) {
          gang.territories = [];
          await gang.save();
        }
      }

      const { wars: page1, total } = await GangWarService.getWarHistory('red-gulch', 2, 0);
      const { wars: page2 } = await GangWarService.getWarHistory('red-gulch', 2, 2);

      expect(total).toBe(5);
      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(2);
      expect(page1[0]._id.toString()).not.toBe(page2[0]._id.toString());
    });
  });
});
