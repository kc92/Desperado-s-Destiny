/**
 * Gang Model Tests
 *
 * Tests for gang model methods and validations
 *
 * Note: Uses global MongoMemoryReplSet setup from tests/setup.ts
 */

import mongoose from 'mongoose';
import { Gang, IGang } from '../../src/models/Gang.model';
import { Character, ICharacter } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import { Faction, GangRole, GangPermission, GangUpgradeType } from '@desperados/shared';

// Note: Global setup (tests/setup.ts) handles MongoMemoryReplSet connection
// afterEach cleanup is handled by global setup

describe('Gang Model', () => {
  let testUser: any;
  let testCharacter: ICharacter;
  let testGang: IGang;

  beforeEach(async () => {
    testUser = await User.create({
      email: 'gangtest@example.com',
      passwordHash: 'hashedpassword123',
      isEmailVerified: true,
    });

    testCharacter = await Character.create({
      userId: testUser._id,
      name: 'GangLeader',
      faction: Faction.FRONTERA,
      level: 15,
      appearance: {
        bodyType: 'male',
        skinTone: 5,
        facePreset: 3,
        hairStyle: 7,
        hairColor: 2,
      },
      currentLocation: 'el-paso',
      gold: 5000,
    });

    testGang = await Gang.create({
      name: 'Test Gang',
      tag: 'TEST',
      leaderId: testCharacter._id,
      members: [
        {
          characterId: testCharacter._id,
          role: GangRole.LEADER,
          joinedAt: new Date(),
          contribution: 2000,
        },
      ],
      bank: 1000,
      level: 1,
      perks: { xpBonus: 5, goldBonus: 0, energyBonus: 0 },
      upgrades: { vaultSize: 0, memberSlots: 0, warChest: 0, perkBooster: 0 },
      territories: [],
      stats: { totalWins: 0, totalLosses: 0, territoriesConquered: 0, totalRevenue: 0 },
    });
  });

  describe('Gang Creation and Validation', () => {
    it('should create a gang with valid data', async () => {
      expect(testGang.name).toBe('Test Gang');
      expect(testGang.tag).toBe('TEST');
      expect(testGang.leaderId.toString()).toBe(testCharacter._id.toString());
      expect(testGang.members).toHaveLength(1);
    });

    it('should reject duplicate gang names (case-insensitive)', async () => {
      await expect(
        Gang.create({
          name: 'test gang',
          tag: 'TG',
          leaderId: testCharacter._id,
        })
      ).rejects.toThrow();
    });

    it('should reject duplicate gang tags', async () => {
      await expect(
        Gang.create({
          name: 'Different Gang',
          tag: 'TEST',
          leaderId: testCharacter._id,
        })
      ).rejects.toThrow();
    });

    it('should reject invalid gang names', async () => {
      await expect(
        Gang.create({
          name: 'AB',
          tag: 'AB',
          leaderId: testCharacter._id,
        })
      ).rejects.toThrow();

      await expect(
        Gang.create({
          name: 'A'.repeat(21),
          tag: 'LONG',
          leaderId: testCharacter._id,
        })
      ).rejects.toThrow();
    });

    it('should reject invalid gang tags', async () => {
      await expect(
        Gang.create({
          name: 'Valid Name',
          tag: 'A',
          leaderId: testCharacter._id,
        })
      ).rejects.toThrow();

      await expect(
        Gang.create({
          name: 'Valid Name',
          tag: 'TOOLONG',
          leaderId: testCharacter._id,
        })
      ).rejects.toThrow();
    });
  });

  describe('Member Management Methods', () => {
    it('should correctly identify if character is a member', () => {
      expect(testGang.isMember(testCharacter._id)).toBe(true);
      expect(testGang.isMember(new mongoose.Types.ObjectId())).toBe(false);
    });

    it('should correctly identify if character is an officer', () => {
      expect(testGang.isOfficer(testCharacter._id)).toBe(true);

      testGang.members[0].role = GangRole.MEMBER;
      expect(testGang.isOfficer(testCharacter._id)).toBe(false);
    });

    it('should correctly identify if character is a leader', () => {
      expect(testGang.isLeader(testCharacter._id)).toBe(true);
      expect(testGang.isLeader(new mongoose.Types.ObjectId())).toBe(false);
    });

    it('should get member role correctly', () => {
      expect(testGang.getMemberRole(testCharacter._id)).toBe(GangRole.LEADER);
      expect(testGang.getMemberRole(new mongoose.Types.ObjectId())).toBeNull();
    });

    it('should add member successfully', () => {
      const newMemberId = new mongoose.Types.ObjectId();
      testGang.addMember(newMemberId, GangRole.MEMBER);

      expect(testGang.members).toHaveLength(2);
      expect(testGang.isMember(newMemberId)).toBe(true);
      expect(testGang.getMemberRole(newMemberId)).toBe(GangRole.MEMBER);
    });

    it('should prevent adding duplicate members', () => {
      expect(() => {
        testGang.addMember(testCharacter._id, GangRole.MEMBER);
      }).toThrow('already a member');
    });

    it('should remove member successfully', () => {
      const newMemberId = new mongoose.Types.ObjectId();
      testGang.addMember(newMemberId, GangRole.MEMBER);

      testGang.removeMember(newMemberId);
      expect(testGang.members).toHaveLength(1);
      expect(testGang.isMember(newMemberId)).toBe(false);
    });

    it('should prevent removing the leader', () => {
      expect(() => {
        testGang.removeMember(testCharacter._id);
      }).toThrow('Cannot remove the leader');
    });

    it('should promote member successfully', () => {
      const newMemberId = new mongoose.Types.ObjectId();
      testGang.addMember(newMemberId, GangRole.MEMBER);

      testGang.promoteMember(newMemberId, GangRole.OFFICER);
      expect(testGang.getMemberRole(newMemberId)).toBe(GangRole.OFFICER);
    });

    it('should transfer leadership atomically', () => {
      const newMemberId = new mongoose.Types.ObjectId();
      testGang.addMember(newMemberId, GangRole.MEMBER);

      testGang.promoteMember(newMemberId, GangRole.LEADER);

      expect(testGang.getMemberRole(newMemberId)).toBe(GangRole.LEADER);
      expect(testGang.getMemberRole(testCharacter._id)).toBe(GangRole.OFFICER);
      expect(testGang.leaderId.toString()).toBe(newMemberId.toString());
    });
  });

  describe('Permission System', () => {
    it('should grant VIEW_DETAILS to all members', async () => {
      expect(await testGang.hasPermission(testCharacter._id, GangPermission.VIEW_DETAILS)).toBe(true);
    });

    it('should grant DEPOSIT_BANK to all members', async () => {
      expect(await testGang.hasPermission(testCharacter._id, GangPermission.DEPOSIT_BANK)).toBe(true);
    });

    it('should grant WITHDRAW_BANK to officers and leaders only', async () => {
      expect(await testGang.hasPermission(testCharacter._id, GangPermission.WITHDRAW_BANK)).toBe(true);

      testGang.members[0].role = GangRole.MEMBER;
      expect(await testGang.hasPermission(testCharacter._id, GangPermission.WITHDRAW_BANK)).toBe(false);
    });

    it('should grant INVITE_MEMBERS to officers and leaders only', async () => {
      expect(await testGang.hasPermission(testCharacter._id, GangPermission.INVITE_MEMBERS)).toBe(true);

      testGang.members[0].role = GangRole.MEMBER;
      expect(await testGang.hasPermission(testCharacter._id, GangPermission.INVITE_MEMBERS)).toBe(false);
    });

    it('should grant PURCHASE_UPGRADES to leader only', async () => {
      expect(await testGang.hasPermission(testCharacter._id, GangPermission.PURCHASE_UPGRADES)).toBe(true);

      testGang.members[0].role = GangRole.OFFICER;
      expect(await testGang.hasPermission(testCharacter._id, GangPermission.PURCHASE_UPGRADES)).toBe(false);
    });

    it('should deny permissions to non-members', async () => {
      const nonMemberId = new mongoose.Types.ObjectId();
      expect(await testGang.hasPermission(nonMemberId, GangPermission.VIEW_DETAILS)).toBe(false);
    });
  });

  describe('Gang Bank and Upgrades', () => {
    it('should check if gang can afford amount', () => {
      expect(testGang.canAfford(500)).toBe(true);
      expect(testGang.canAfford(1000)).toBe(true);
      expect(testGang.canAfford(1001)).toBe(false);
    });

    it('should calculate max bank capacity based on vault size', () => {
      expect(testGang.getMaxBankCapacity()).toBe(0);

      testGang.upgrades.vaultSize = 1;
      expect(testGang.getMaxBankCapacity()).toBe(10000);

      testGang.upgrades.vaultSize = 5;
      expect(testGang.getMaxBankCapacity()).toBe(50000);
    });

    it('should calculate max members based on member slots upgrade', () => {
      expect(testGang.getMaxMembers()).toBe(15);

      testGang.upgrades.memberSlots = 1;
      expect(testGang.getMaxMembers()).toBe(20);

      testGang.upgrades.memberSlots = 5;
      expect(testGang.getMaxMembers()).toBe(40);
    });

    it('should check if upgrade can be leveled up', () => {
      expect(testGang.canUpgrade(GangUpgradeType.VAULT_SIZE)).toBe(true);

      testGang.upgrades.vaultSize = 10;
      expect(testGang.canUpgrade(GangUpgradeType.VAULT_SIZE)).toBe(false);
    });

    it('should calculate active perks with booster multiplier', () => {
      // Set higher gang level so 10% boost is visible after floor()
      // baseXP = 5 + level, need at least 10 to see difference: 10 * 1.0 = 10, 10 * 1.1 = 11
      testGang.level = 10;

      const perks1 = testGang.getActivePerks();
      expect(perks1.xpBonus).toBeGreaterThan(0);
      expect(perks1.goldBonus).toBeGreaterThanOrEqual(0);

      testGang.upgrades.perkBooster = 1;
      const perks2 = testGang.getActivePerks();
      expect(perks2.xpBonus).toBeGreaterThan(perks1.xpBonus);
      expect(perks2.goldBonus).toBeGreaterThan(perks1.goldBonus);
    });
  });

  describe('Gang Level Calculation', () => {
    it('should calculate gang level based on member levels', async () => {
      const level = await testGang.calculateLevel();
      expect(level).toBeGreaterThanOrEqual(1);
      expect(level).toBeLessThanOrEqual(50);
    });
  });

  describe('Static Methods', () => {
    it('should find gang by name (case-insensitive)', async () => {
      const gang = await Gang.findByName('test gang');
      expect(gang).not.toBeNull();
      expect(gang!.name).toBe('Test Gang');
    });

    it('should find gang by tag', async () => {
      const gang = await Gang.findByTag('test');
      expect(gang).not.toBeNull();
      expect(gang!.tag).toBe('TEST');
    });

    it('should find gang by character ID', async () => {
      const gang = await Gang.findByCharacterId(testCharacter._id);
      expect(gang).not.toBeNull();
      expect(gang!._id.toString()).toBe(testGang._id.toString());
    });

    it('should check if name is taken', async () => {
      expect(await Gang.isNameTaken('Test Gang')).toBe(true);
      expect(await Gang.isNameTaken('test gang')).toBe(true);
      expect(await Gang.isNameTaken('Nonexistent Gang')).toBe(false);
    });

    it('should check if tag is taken', async () => {
      expect(await Gang.isTagTaken('TEST')).toBe(true);
      expect(await Gang.isTagTaken('test')).toBe(true);
      expect(await Gang.isTagTaken('NONE')).toBe(false);
    });
  });

  describe('Virtuals', () => {
    it('should calculate currentMembers count', () => {
      expect(testGang.currentMembers).toBe(1);

      testGang.addMember(new mongoose.Types.ObjectId(), GangRole.MEMBER);
      expect(testGang.currentMembers).toBe(2);
    });

    it('should calculate officerCount', () => {
      expect(testGang.officerCount).toBe(1);

      testGang.addMember(new mongoose.Types.ObjectId(), GangRole.OFFICER);
      expect(testGang.officerCount).toBe(2);

      testGang.addMember(new mongoose.Types.ObjectId(), GangRole.MEMBER);
      expect(testGang.officerCount).toBe(2);
    });

    it('should calculate territoriesCount', () => {
      expect(testGang.territoriesCount).toBe(0);

      testGang.territories.push('territory-1');
      expect(testGang.territoriesCount).toBe(1);
    });
  });

  describe('toSafeObject', () => {
    it('should return safe gang object without sensitive data', () => {
      const safeObj = testGang.toSafeObject();

      expect(safeObj).toHaveProperty('_id');
      expect(safeObj).toHaveProperty('name');
      expect(safeObj).toHaveProperty('tag');
      expect(safeObj).toHaveProperty('bank');
      expect(safeObj).toHaveProperty('level');
      expect(safeObj).toHaveProperty('perks');
      expect(safeObj).toHaveProperty('upgrades');
      expect(safeObj).toHaveProperty('currentMembers');
      expect(safeObj).toHaveProperty('maxMembers');
    });
  });
});
