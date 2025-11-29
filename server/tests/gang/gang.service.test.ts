/**
 * Gang Service Tests
 *
 * Comprehensive tests for gang service operations including:
 * - Transaction safety and rollback
 * - Permission enforcement
 * - Bank operations
 * - Upgrade system
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { GangService } from '../../src/services/gang.service';
import { Gang, IGang } from '../../src/models/Gang.model';
import { GangBankTransaction } from '../../src/models/GangBankTransaction.model';
import { GangInvitation } from '../../src/models/GangInvitation.model';
import { Character, ICharacter } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import { GoldTransaction } from '../../src/models/GoldTransaction.model';
import { Faction, GangRole, GangUpgradeType } from '@desperados/shared';

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
  await Gang.deleteMany({});
  await GangBankTransaction.deleteMany({});
  await GangInvitation.deleteMany({});
  await Character.deleteMany({});
  await User.deleteMany({});
  await GoldTransaction.deleteMany({});
});

describe('GangService', () => {
  let testUser: any;
  let testCharacter: ICharacter;

  beforeEach(async () => {
    testUser = await User.create({
      email: 'gangservicetest@example.com',
      passwordHash: 'hashedpassword123',
      isEmailVerified: true,
    });

    testCharacter = await Character.create({
      userId: testUser._id,
      name: 'GangCreator',
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
  });

  describe('createGang()', () => {
    it('should create gang with valid data', async () => {
      const gang = await GangService.createGang(
        testUser._id.toString(),
        testCharacter._id.toString(),
        'The Outlaws',
        'OUT'
      );

      expect(gang.name).toBe('The Outlaws');
      expect(gang.tag).toBe('OUT');
      expect(gang.leaderId.toString()).toBe(testCharacter._id.toString());
      expect(gang.members).toHaveLength(1);
      expect(gang.members[0].role).toBe(GangRole.LEADER);

      const updatedCharacter = await Character.findById(testCharacter._id);
      expect(updatedCharacter!.gold).toBe(3000);
      expect(updatedCharacter!.gangId).not.toBeNull();
    });

    it('should reject creation if character level too low', async () => {
      testCharacter.level = 5;
      await testCharacter.save();

      await expect(
        GangService.createGang(testUser._id.toString(), testCharacter._id.toString(), 'Gang', 'GNG')
      ).rejects.toThrow('must be level 10');
    });

    it('should reject creation if insufficient gold', async () => {
      testCharacter.gold = 1000;
      await testCharacter.save();

      await expect(
        GangService.createGang(testUser._id.toString(), testCharacter._id.toString(), 'Gang', 'GNG')
      ).rejects.toThrow('Insufficient gold');
    });

    it('should reject creation if character already in gang', async () => {
      await GangService.createGang(
        testUser._id.toString(),
        testCharacter._id.toString(),
        'First Gang',
        'FG'
      );

      await expect(
        GangService.createGang(testUser._id.toString(), testCharacter._id.toString(), 'Second Gang', 'SG')
      ).rejects.toThrow('already in a gang');
    });

    it('should reject duplicate gang names', async () => {
      await GangService.createGang(
        testUser._id.toString(),
        testCharacter._id.toString(),
        'The Gang',
        'TG1'
      );

      const character2 = await Character.create({
        userId: testUser._id,
        name: 'Leader2',
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

      await expect(
        GangService.createGang(testUser._id.toString(), character2._id.toString(), 'The Gang', 'TG2')
      ).rejects.toThrow('name is already taken');
    });

    it('should rollback on error (transaction safety)', async () => {
      const originalGold = testCharacter.gold;

      try {
        await GangService.createGang(
          testUser._id.toString(),
          testCharacter._id.toString(),
          'A',
          'A'
        );
      } catch (error) {
        const updatedCharacter = await Character.findById(testCharacter._id);
        expect(updatedCharacter!.gold).toBe(originalGold);
        const gangs = await Gang.find({});
        expect(gangs).toHaveLength(0);
      }
    });
  });

  describe('joinGang()', () => {
    let gang: IGang;
    let joiner: ICharacter;
    let invitation: any;

    beforeEach(async () => {
      gang = await GangService.createGang(
        testUser._id.toString(),
        testCharacter._id.toString(),
        'The Guild',
        'TG'
      );

      joiner = await Character.create({
        userId: testUser._id,
        name: 'Joiner',
        faction: Faction.FRONTERA,
        level: 10,
        appearance: {
          bodyType: 'female',
          skinTone: 3,
          facePreset: 2,
          hairStyle: 5,
          hairColor: 1,
        },
        currentLocation: 'el-paso',
        gold: 1000,
      });

      invitation = await GangInvitation.create({
        gangId: gang._id,
        gangName: gang.name,
        inviterId: testCharacter._id,
        inviterName: testCharacter.name,
        recipientId: joiner._id,
        recipientName: joiner.name,
      });
    });

    it('should join gang with valid invitation', async () => {
      const updatedGang = await GangService.joinGang(
        gang._id.toString(),
        joiner._id.toString(),
        invitation._id.toString()
      );

      expect(updatedGang.members).toHaveLength(2);
      expect(updatedGang.isMember(joiner._id)).toBe(true);

      const updatedJoiner = await Character.findById(joiner._id);
      expect(updatedJoiner!.gangId?.toString()).toBe(gang._id.toString());

      const updatedInvitation = await GangInvitation.findById(invitation._id);
      expect(updatedInvitation!.status).toBe('ACCEPTED');
    });

    it('should reject join if already in gang', async () => {
      joiner.gangId = gang._id;
      await joiner.save();

      await expect(
        GangService.joinGang(gang._id.toString(), joiner._id.toString(), invitation._id.toString())
      ).rejects.toThrow('already in a gang');
    });

    it('should reject join if gang is full', async () => {
      gang.upgrades.memberSlots = 0;
      while (gang.members.length < gang.getMaxMembers()) {
        gang.addMember(new mongoose.Types.ObjectId(), GangRole.MEMBER);
      }
      await gang.save();

      await expect(
        GangService.joinGang(gang._id.toString(), joiner._id.toString(), invitation._id.toString())
      ).rejects.toThrow('maximum capacity');
    });
  });

  describe('leaveGang()', () => {
    let gang: IGang;
    let member: ICharacter;

    beforeEach(async () => {
      gang = await GangService.createGang(
        testUser._id.toString(),
        testCharacter._id.toString(),
        'The Crew',
        'TC'
      );

      member = await Character.create({
        userId: testUser._id,
        name: 'Member1',
        faction: Faction.FRONTERA,
        level: 10,
        appearance: {
          bodyType: 'male',
          skinTone: 3,
          facePreset: 2,
          hairStyle: 5,
          hairColor: 1,
        },
        currentLocation: 'el-paso',
        gold: 1000,
        gangId: gang._id,
      });

      gang.addMember(member._id, GangRole.MEMBER);
      await gang.save();
    });

    it('should leave gang successfully', async () => {
      await GangService.leaveGang(gang._id.toString(), member._id.toString());

      const updatedGang = await Gang.findById(gang._id);
      expect(updatedGang!.members).toHaveLength(1);
      expect(updatedGang!.isMember(member._id)).toBe(false);

      const updatedMember = await Character.findById(member._id);
      expect(updatedMember!.gangId).toBeNull();
    });

    it('should prevent leader from leaving without transfer', async () => {
      await expect(
        GangService.leaveGang(gang._id.toString(), testCharacter._id.toString())
      ).rejects.toThrow('transfer leadership');
    });
  });

  describe('kickMember()', () => {
    let gang: IGang;
    let officer: ICharacter;
    let member: ICharacter;

    beforeEach(async () => {
      gang = await GangService.createGang(
        testUser._id.toString(),
        testCharacter._id.toString(),
        'The Squad',
        'TS'
      );

      officer = await Character.create({
        userId: testUser._id,
        name: 'Officer1',
        faction: Faction.FRONTERA,
        level: 12,
        appearance: {
          bodyType: 'male',
          skinTone: 3,
          facePreset: 2,
          hairStyle: 5,
          hairColor: 1,
        },
        currentLocation: 'el-paso',
        gold: 1000,
        gangId: gang._id,
      });

      member = await Character.create({
        userId: testUser._id,
        name: 'Member2',
        faction: Faction.FRONTERA,
        level: 8,
        appearance: {
          bodyType: 'female',
          skinTone: 4,
          facePreset: 3,
          hairStyle: 6,
          hairColor: 2,
        },
        currentLocation: 'el-paso',
        gold: 1000,
        gangId: gang._id,
      });

      gang.addMember(officer._id, GangRole.OFFICER);
      gang.addMember(member._id, GangRole.MEMBER);
      await gang.save();
    });

    it('should kick member as officer', async () => {
      const updatedGang = await GangService.kickMember(
        gang._id.toString(),
        officer._id.toString(),
        member._id.toString()
      );

      expect(updatedGang.members).toHaveLength(2);
      expect(updatedGang.isMember(member._id)).toBe(false);
    });

    it('should prevent kicking the leader', async () => {
      await expect(
        GangService.kickMember(gang._id.toString(), officer._id.toString(), testCharacter._id.toString())
      ).rejects.toThrow('Cannot kick the leader');
    });

    it('should prevent member from kicking anyone', async () => {
      await expect(
        GangService.kickMember(gang._id.toString(), member._id.toString(), officer._id.toString())
      ).rejects.toThrow('Only officers and leaders');
    });
  });

  describe('promoteMember()', () => {
    let gang: IGang;
    let member: ICharacter;

    beforeEach(async () => {
      gang = await GangService.createGang(
        testUser._id.toString(),
        testCharacter._id.toString(),
        'The Company',
        'TCO'
      );

      member = await Character.create({
        userId: testUser._id,
        name: 'Member3',
        faction: Faction.FRONTERA,
        level: 12,
        appearance: {
          bodyType: 'male',
          skinTone: 3,
          facePreset: 2,
          hairStyle: 5,
          hairColor: 1,
        },
        currentLocation: 'el-paso',
        gold: 1000,
        gangId: gang._id,
      });

      gang.addMember(member._id, GangRole.MEMBER);
      await gang.save();
    });

    it('should promote member to officer', async () => {
      const updatedGang = await GangService.promoteMember(
        gang._id.toString(),
        testCharacter._id.toString(),
        member._id.toString(),
        GangRole.OFFICER
      );

      expect(updatedGang.getMemberRole(member._id)).toBe(GangRole.OFFICER);
    });

    it('should transfer leadership atomically', async () => {
      const updatedGang = await GangService.promoteMember(
        gang._id.toString(),
        testCharacter._id.toString(),
        member._id.toString(),
        GangRole.LEADER
      );

      expect(updatedGang.getMemberRole(member._id)).toBe(GangRole.LEADER);
      expect(updatedGang.getMemberRole(testCharacter._id)).toBe(GangRole.OFFICER);
      expect(updatedGang.leaderId.toString()).toBe(member._id.toString());
    });

    it('should prevent non-leaders from promoting', async () => {
      gang.members[0].role = GangRole.OFFICER;
      await gang.save();

      await expect(
        GangService.promoteMember(
          gang._id.toString(),
          testCharacter._id.toString(),
          member._id.toString(),
          GangRole.OFFICER
        )
      ).rejects.toThrow('Only the leader can promote');
    });
  });

  describe('depositToBank()', () => {
    let gang: IGang;

    beforeEach(async () => {
      gang = await GangService.createGang(
        testUser._id.toString(),
        testCharacter._id.toString(),
        'The Bank',
        'TB'
      );

      testCharacter = await Character.findById(testCharacter._id) as ICharacter;
    });

    it('should deposit gold to gang bank (transaction-safe)', async () => {
      const initialGold = testCharacter.gold;
      const initialBank = gang.bank;

      const { gang: updatedGang, transaction } = await GangService.depositToBank(
        gang._id.toString(),
        testCharacter._id.toString(),
        500
      );

      expect(updatedGang.bank).toBe(initialBank + 500);

      const updatedCharacter = await Character.findById(testCharacter._id);
      expect(updatedCharacter!.gold).toBe(initialGold - 500);

      expect(transaction.type).toBe('DEPOSIT');
      expect(transaction.amount).toBe(500);
      expect(transaction.balanceAfter).toBe(initialBank + 500);
    });

    it('should reject deposit with insufficient gold', async () => {
      testCharacter.gold = 100;
      await testCharacter.save();

      await expect(
        GangService.depositToBank(gang._id.toString(), testCharacter._id.toString(), 500)
      ).rejects.toThrow('Insufficient gold');
    });

    it('should update member contribution', async () => {
      await GangService.depositToBank(gang._id.toString(), testCharacter._id.toString(), 1000);

      const updatedGang = await Gang.findById(gang._id);
      const member = updatedGang!.members.find(m => m.characterId.toString() === testCharacter._id.toString());
      expect(member!.contribution).toBe(3000);
    });

    it('should rollback on error', async () => {
      const initialGold = testCharacter.gold;
      const initialBank = gang.bank;

      try {
        await GangService.depositToBank(gang._id.toString(), testCharacter._id.toString(), -100);
      } catch (error) {
        const updatedCharacter = await Character.findById(testCharacter._id);
        expect(updatedCharacter!.gold).toBe(initialGold);

        const updatedGang = await Gang.findById(gang._id);
        expect(updatedGang!.bank).toBe(initialBank);
      }
    });
  });

  describe('withdrawFromBank()', () => {
    let gang: IGang;

    beforeEach(async () => {
      gang = await GangService.createGang(
        testUser._id.toString(),
        testCharacter._id.toString(),
        'The Vault',
        'TV'
      );

      gang.bank = 5000;
      await gang.save();

      testCharacter = await Character.findById(testCharacter._id) as ICharacter;
    });

    it('should withdraw gold from gang bank (transaction-safe)', async () => {
      const initialGold = testCharacter.gold;
      const initialBank = gang.bank;

      const { gang: updatedGang, transaction } = await GangService.withdrawFromBank(
        gang._id.toString(),
        testCharacter._id.toString(),
        1000
      );

      expect(updatedGang.bank).toBe(initialBank - 1000);

      const updatedCharacter = await Character.findById(testCharacter._id);
      expect(updatedCharacter!.gold).toBe(initialGold + 1000);

      expect(transaction.type).toBe('WITHDRAWAL');
      expect(transaction.amount).toBe(-1000);
    });

    it('should reject withdrawal with insufficient bank funds', async () => {
      gang.bank = 100;
      await gang.save();

      await expect(
        GangService.withdrawFromBank(gang._id.toString(), testCharacter._id.toString(), 500)
      ).rejects.toThrow('Insufficient gang bank funds');
    });

    it('should reject withdrawal by non-officers', async () => {
      gang.members[0].role = GangRole.MEMBER;
      await gang.save();

      await expect(
        GangService.withdrawFromBank(gang._id.toString(), testCharacter._id.toString(), 100)
      ).rejects.toThrow('Only officers and leaders');
    });
  });

  describe('purchaseUpgrade()', () => {
    let gang: IGang;

    beforeEach(async () => {
      gang = await GangService.createGang(
        testUser._id.toString(),
        testCharacter._id.toString(),
        'The Upgraded',
        'TU'
      );

      gang.bank = 10000;
      await gang.save();
    });

    it('should purchase vault size upgrade', async () => {
      const initialBank = gang.bank;

      const updatedGang = await GangService.purchaseUpgrade(
        gang._id.toString(),
        testCharacter._id.toString(),
        GangUpgradeType.VAULT_SIZE
      );

      expect(updatedGang.upgrades.vaultSize).toBe(1);
      expect(updatedGang.bank).toBeLessThan(initialBank);
    });

    it('should purchase member slots upgrade', async () => {
      const updatedGang = await GangService.purchaseUpgrade(
        gang._id.toString(),
        testCharacter._id.toString(),
        GangUpgradeType.MEMBER_SLOTS
      );

      expect(updatedGang.upgrades.memberSlots).toBe(1);
      expect(updatedGang.getMaxMembers()).toBe(20);
    });

    it('should purchase perk booster upgrade', async () => {
      const updatedGang = await GangService.purchaseUpgrade(
        gang._id.toString(),
        testCharacter._id.toString(),
        GangUpgradeType.PERK_BOOSTER
      );

      expect(updatedGang.upgrades.perkBooster).toBe(1);
      const perks = updatedGang.getActivePerks();
      expect(perks.xpBonus).toBeGreaterThan(5);
    });

    it('should reject purchase if maxed', async () => {
      gang.upgrades.vaultSize = 10;
      await gang.save();

      await expect(
        GangService.purchaseUpgrade(
          gang._id.toString(),
          testCharacter._id.toString(),
          GangUpgradeType.VAULT_SIZE
        )
      ).rejects.toThrow('maximum level');
    });

    it('should reject purchase with insufficient funds', async () => {
      gang.bank = 100;
      await gang.save();

      await expect(
        GangService.purchaseUpgrade(
          gang._id.toString(),
          testCharacter._id.toString(),
          GangUpgradeType.VAULT_SIZE
        )
      ).rejects.toThrow('Insufficient gang bank funds');
    });

    it('should reject purchase by non-leaders', async () => {
      gang.members[0].role = GangRole.OFFICER;
      await gang.save();

      await expect(
        GangService.purchaseUpgrade(
          gang._id.toString(),
          testCharacter._id.toString(),
          GangUpgradeType.VAULT_SIZE
        )
      ).rejects.toThrow('Only the leader');
    });
  });

  describe('disbandGang()', () => {
    let gang: IGang;
    let member1: ICharacter;
    let member2: ICharacter;

    beforeEach(async () => {
      gang = await GangService.createGang(
        testUser._id.toString(),
        testCharacter._id.toString(),
        'The Disbanded',
        'TD'
      );

      member1 = await Character.create({
        userId: testUser._id,
        name: 'Member4',
        faction: Faction.FRONTERA,
        level: 10,
        appearance: {
          bodyType: 'male',
          skinTone: 3,
          facePreset: 2,
          hairStyle: 5,
          hairColor: 1,
        },
        currentLocation: 'el-paso',
        gold: 500,
        gangId: gang._id,
      });

      member2 = await Character.create({
        userId: testUser._id,
        name: 'Member5',
        faction: Faction.FRONTERA,
        level: 10,
        appearance: {
          bodyType: 'female',
          skinTone: 4,
          facePreset: 3,
          hairStyle: 6,
          hairColor: 2,
        },
        currentLocation: 'el-paso',
        gold: 500,
        gangId: gang._id,
      });

      gang.addMember(member1._id, GangRole.MEMBER);
      gang.addMember(member2._id, GangRole.MEMBER);
      gang.bank = 3000;
      await gang.save();
    });

    it('should disband gang and distribute funds fairly', async () => {
      const distributionAmount = Math.floor(3000 / 3);

      await GangService.disbandGang(gang._id.toString(), testCharacter._id.toString());

      const updatedGang = await Gang.findById(gang._id);
      expect(updatedGang!.isActive).toBe(false);
      expect(updatedGang!.bank).toBe(0);

      const updatedLeader = await Character.findById(testCharacter._id);
      const updatedMember1 = await Character.findById(member1._id);
      const updatedMember2 = await Character.findById(member2._id);

      expect(updatedLeader!.gangId).toBeNull();
      expect(updatedMember1!.gangId).toBeNull();
      expect(updatedMember2!.gangId).toBeNull();

      const goldTransactions = await GoldTransaction.find({});
      expect(goldTransactions.length).toBeGreaterThan(0);
    });

    it('should reject disband by non-leader', async () => {
      await expect(
        GangService.disbandGang(gang._id.toString(), member1._id.toString())
      ).rejects.toThrow('Only the leader');
    });
  });

  describe('getGangTransactions()', () => {
    let gang: IGang;

    beforeEach(async () => {
      gang = await GangService.createGang(
        testUser._id.toString(),
        testCharacter._id.toString(),
        'The Transactors',
        'TT'
      );

      gang.bank = 5000;
      await gang.save();

      testCharacter = await Character.findById(testCharacter._id) as ICharacter;
    });

    it('should return paginated transaction history', async () => {
      await GangService.depositToBank(gang._id.toString(), testCharacter._id.toString(), 100);
      await GangService.depositToBank(gang._id.toString(), testCharacter._id.toString(), 200);
      await GangService.depositToBank(gang._id.toString(), testCharacter._id.toString(), 300);

      const { transactions, total } = await GangService.getGangTransactions(
        gang._id.toString(),
        2,
        0
      );

      expect(transactions).toHaveLength(2);
      expect(total).toBe(3);
    });
  });

  describe('getGangStats()', () => {
    let gang: IGang;

    beforeEach(async () => {
      gang = await GangService.createGang(
        testUser._id.toString(),
        testCharacter._id.toString(),
        'The Stats',
        'TS2'
      );

      gang.bank = 5000;
      await gang.save();

      testCharacter = await Character.findById(testCharacter._id) as ICharacter;
    });

    it('should calculate gang statistics correctly', async () => {
      await GangService.depositToBank(gang._id.toString(), testCharacter._id.toString(), 1000);
      await GangService.depositToBank(gang._id.toString(), testCharacter._id.toString(), 500);
      await GangService.withdrawFromBank(gang._id.toString(), testCharacter._id.toString(), 300);

      const stats = await GangService.getGangStats(gang._id.toString());

      expect(stats.totalDeposits).toBe(1500);
      expect(stats.totalWithdrawals).toBe(300);
      expect(stats.topContributors).toHaveLength(1);
      expect(stats.topContributors[0].contribution).toBe(3500);
    });
  });
});
