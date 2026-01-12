/**
 * Gold Transaction Atomicity Tests
 *
 * Tests to ensure gold transactions rollback properly on failures
 * Validates that partial operations don't leave the system in an inconsistent state
 *
 * NOTE: Uses global test setup from tests/setup.ts which provides MongoMemoryReplSet
 * for transaction support
 */

import mongoose from 'mongoose';
import { GoldService } from '../../src/services/gold.service';
import { Character, ICharacter } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import { GoldTransaction, TransactionSource } from '../../src/models/GoldTransaction.model';
import { Faction } from '@desperados/shared';

describe('Gold Transaction Atomicity', () => {
  let testUser1: any;
  let testUser2: any;
  let character1: ICharacter;
  let character2: ICharacter;

  beforeEach(async () => {
    // Create test users
    testUser1 = await User.create({
      username: 'atomicity_user1',
      email: 'atomicity1@test.com',
      passwordHash: 'hashedPassword123',
      emailVerified: true,
    });

    testUser2 = await User.create({
      username: 'atomicity_user2',
      email: 'atomicity2@test.com',
      passwordHash: 'hashedPassword456',
      emailVerified: true,
    });

    // Create test characters
    character1 = await Character.create({
      userId: testUser1._id,
      name: 'Atomic Alice',
      faction: 'SETTLER_ALLIANCE' as any,
      level: 5,
      experience: 500,
      dollars: 1000,
      currentLocation: 'el-paso',
      energy: 100,
      maxEnergy: 100,
      lastEnergyUpdate: new Date(),
      appearance: {
        bodyType: 'female',
        skinTone: 3,
        facePreset: 2,
        hairStyle: 5,
        hairColor: 1,
      },
      stats: {
        cunning: 10,
        spirit: 10,
        combat: 10,
        craft: 10,
      },
    });

    character2 = await Character.create({
      userId: testUser2._id,
      name: 'Atomic Bob',
      faction: 'NAHI_COALITION' as any,
      level: 5,
      experience: 500,
      dollars: 500,
      currentLocation: 'el-paso',
      energy: 100,
      maxEnergy: 100,
      lastEnergyUpdate: new Date(),
      appearance: {
        bodyType: 'male',
        skinTone: 2,
        facePreset: 1,
        hairStyle: 3,
        hairColor: 4,
      },
      stats: {
        cunning: 10,
        spirit: 10,
        combat: 10,
        craft: 10,
      },
    });
  });

  describe('Transfer Rollback', () => {
    it('should rollback transfer when recipient not found', async () => {
      const initialBalance = character1.dollars;
      const fakeId = new mongoose.Types.ObjectId();

      await expect(
        GoldService.transferGold(
          character1._id,
          fakeId,
          100,
          TransactionSource.PLAYER_TRADE,
          { note: 'test transfer' }
        )
      ).rejects.toThrow('Recipient character not found');

      // Verify sender's balance unchanged
      const updatedChar1 = await Character.findById(character1._id);
      expect(updatedChar1?.dollars).toBe(initialBalance);

      // Verify no transactions created
      const transactions = await GoldTransaction.find({
        characterId: character1._id,
      });
      expect(transactions.length).toBe(0);
    });

    it('should rollback transfer when sender has insufficient funds', async () => {
      const initialBalance1 = character1.dollars;
      const initialBalance2 = character2.dollars;

      await expect(
        GoldService.transferGold(
          character1._id,
          character2._id,
          2000, // More than character1 has
          TransactionSource.PLAYER_TRADE
        )
      ).rejects.toThrow(/insufficient/i);

      // Verify balances unchanged
      const updatedChar1 = await Character.findById(character1._id);
      const updatedChar2 = await Character.findById(character2._id);

      expect(updatedChar1?.dollars).toBe(initialBalance1);
      expect(updatedChar2?.dollars).toBe(initialBalance2);

      // Verify no transactions created
      const transactions = await GoldTransaction.find({});
      expect(transactions.length).toBe(0);
    });

    it('should successfully complete full transfer', async () => {
      const result = await GoldService.transferGold(
        character1._id,
        character2._id,
        200,
        TransactionSource.PLAYER_TRADE,
        { note: 'successful transfer' }
      );

      // Verify balances updated
      expect(result.fromBalance).toBe(800);
      expect(result.toBalance).toBe(700);

      // Verify in database
      const updatedChar1 = await Character.findById(character1._id);
      const updatedChar2 = await Character.findById(character2._id);

      expect(updatedChar1?.dollars).toBe(800);
      expect(updatedChar2?.dollars).toBe(700);

      // Verify transactions created
      const transactions = await GoldTransaction.find({});
      expect(transactions.length).toBe(2);

      const sentTx = transactions.find(t => t.amount < 0);
      const receivedTx = transactions.find(t => t.amount > 0);

      expect(sentTx?.amount).toBe(-200);
      expect(sentTx?.balanceBefore).toBe(1000);
      expect(sentTx?.balanceAfter).toBe(800);

      expect(receivedTx?.amount).toBe(200);
      expect(receivedTx?.balanceBefore).toBe(500);
      expect(receivedTx?.balanceAfter).toBe(700);
    });

    it('should prevent self-transfer', async () => {
      const initialBalance = character1.dollars;

      await expect(
        GoldService.transferGold(
          character1._id,
          character1._id,
          100,
          TransactionSource.PLAYER_TRADE
        )
      ).rejects.toThrow(/cannot transfer dollars to yourself/i);

      // Verify balance unchanged
      const updatedChar = await Character.findById(character1._id);
      expect(updatedChar?.dollars).toBe(initialBalance);
    });

    it('should reject negative transfer amounts', async () => {
      const initialBalance1 = character1.dollars;
      const initialBalance2 = character2.dollars;

      await expect(
        GoldService.transferGold(
          character1._id,
          character2._id,
          -100,
          TransactionSource.PLAYER_TRADE
        )
      ).rejects.toThrow(/must be positive/i);

      // Verify balances unchanged
      const updatedChar1 = await Character.findById(character1._id);
      const updatedChar2 = await Character.findById(character2._id);

      expect(updatedChar1?.dollars).toBe(initialBalance1);
      expect(updatedChar2?.dollars).toBe(initialBalance2);
    });

    it('should reject zero transfer amounts', async () => {
      await expect(
        GoldService.transferGold(
          character1._id,
          character2._id,
          0,
          TransactionSource.PLAYER_TRADE
        )
      ).rejects.toThrow(/must be positive/i);
    });
  });

  describe('Batch Transfer Rollback', () => {
    let character3: ICharacter;

    beforeEach(async () => {
      const testUser3 = await User.create({
        username: 'atomicity_user3',
        email: 'atomicity3@test.com',
        passwordHash: 'hashedPassword789',
        emailVerified: true,
      });

      character3 = await Character.create({
        userId: testUser3._id,
        name: 'Atomic Charlie',
        faction: 'FRONTERA' as any,
        level: 5,
        experience: 500,
        dollars: 300,
        currentLocation: 'el-paso',
        energy: 100,
        maxEnergy: 100,
        lastEnergyUpdate: new Date(),
        appearance: {
          bodyType: 'male',
          skinTone: 4,
          facePreset: 3,
          hairStyle: 7,
          hairColor: 2,
        },
        stats: {
          cunning: 10,
          spirit: 10,
          combat: 10,
          craft: 10,
        },
      });
    });

    it('should rollback entire batch if one recipient not found', async () => {
      const initialBalance1 = character1.dollars;
      const initialBalance2 = character2.dollars;
      const initialBalance3 = character3.dollars;
      const fakeId = new mongoose.Types.ObjectId();

      await expect(
        GoldService.batchTransferGold(
          character1._id,
          [
            { characterId: character2._id, amount: 100 },
            { characterId: fakeId, amount: 100 }, // This will fail
            { characterId: character3._id, amount: 100 },
          ],
          TransactionSource.GANG_DISBAND_REFUND
        )
      ).rejects.toThrow(/not found/i);

      // Verify all balances unchanged
      const updatedChar1 = await Character.findById(character1._id);
      const updatedChar2 = await Character.findById(character2._id);
      const updatedChar3 = await Character.findById(character3._id);

      expect(updatedChar1?.dollars).toBe(initialBalance1);
      expect(updatedChar2?.dollars).toBe(initialBalance2);
      expect(updatedChar3?.dollars).toBe(initialBalance3);

      // Verify no transactions created
      const transactions = await GoldTransaction.find({});
      expect(transactions.length).toBe(0);
    });

    it('should rollback if sender has insufficient funds for batch', async () => {
      const initialBalance1 = character1.dollars;
      const initialBalance2 = character2.dollars;
      const initialBalance3 = character3.dollars;

      await expect(
        GoldService.batchTransferGold(
          character1._id,
          [
            { characterId: character2._id, amount: 500 },
            { characterId: character3._id, amount: 600 }, // Total 1100 > 1000 available
          ],
          TransactionSource.GANG_DISBAND_REFUND
        )
      ).rejects.toThrow(/insufficient/i);

      // Verify all balances unchanged
      const updatedChar1 = await Character.findById(character1._id);
      const updatedChar2 = await Character.findById(character2._id);
      const updatedChar3 = await Character.findById(character3._id);

      expect(updatedChar1?.dollars).toBe(initialBalance1);
      expect(updatedChar2?.dollars).toBe(initialBalance2);
      expect(updatedChar3?.dollars).toBe(initialBalance3);
    });

    it('should successfully complete full batch transfer', async () => {
      const results = await GoldService.batchTransferGold(
        character1._id,
        [
          { characterId: character2._id, amount: 200 },
          { characterId: character3._id, amount: 300 },
        ],
        TransactionSource.GANG_DISBAND_REFUND,
        { reason: 'gang disbanded' }
      );

      expect(results.length).toBe(2);

      // Verify sender's balance
      const updatedChar1 = await Character.findById(character1._id);
      expect(updatedChar1?.dollars).toBe(500); // 1000 - 200 - 300

      // Verify recipients' balances
      const updatedChar2 = await Character.findById(character2._id);
      const updatedChar3 = await Character.findById(character3._id);

      expect(updatedChar2?.dollars).toBe(700); // 500 + 200
      expect(updatedChar3?.dollars).toBe(600); // 300 + 300

      // Verify transactions created (1 for sender + 2 for recipients)
      const transactions = await GoldTransaction.find({});
      expect(transactions.length).toBe(3);

      const senderTx = transactions.find(
        t => t.characterId.toString() === character1._id.toString() && t.amount < 0
      );
      expect(senderTx?.amount).toBe(-500);
      expect(senderTx?.balanceBefore).toBe(1000);
      expect(senderTx?.balanceAfter).toBe(500);
    });

    it('should reject batch with negative amounts', async () => {
      await expect(
        GoldService.batchTransferGold(
          character1._id,
          [
            { characterId: character2._id, amount: 100 },
            { characterId: character3._id, amount: -50 }, // Invalid
          ],
          TransactionSource.GANG_DISBAND_REFUND
        )
      ).rejects.toThrow(/must be positive/i);
    });

    it('should reject empty batch transfers', async () => {
      await expect(
        GoldService.batchTransferGold(
          character1._id,
          [],
          TransactionSource.GANG_DISBAND_REFUND
        )
      ).rejects.toThrow(/no transfers specified/i);
    });
  });

  describe('Deduct Gold Rollback', () => {
    it('should not create transaction record on insufficient funds', async () => {
      const initialBalance = character1.dollars;

      await expect(
        GoldService.deductGold(
          character1._id,
          2000,
          TransactionSource.SHOP_PURCHASE
        )
      ).rejects.toThrow(/insufficient/i);

      // Verify balance unchanged
      const updatedChar = await Character.findById(character1._id);
      expect(updatedChar?.dollars).toBe(initialBalance);

      // Verify no transaction created
      const transactions = await GoldTransaction.find({
        characterId: character1._id,
      });
      expect(transactions.length).toBe(0);
    });

    it('should reject negative deduction amounts', async () => {
      await expect(
        GoldService.deductGold(
          character1._id,
          -100,
          TransactionSource.SHOP_PURCHASE
        )
      ).rejects.toThrow(/cannot deduct negative/i);
    });

    it('should handle edge case of exact balance', async () => {
      const result = await GoldService.deductGold(
        character1._id,
        1000, // Exact balance
        TransactionSource.SHOP_PURCHASE
      );

      expect(result.newBalance).toBe(0);

      const updatedChar = await Character.findById(character1._id);
      expect(updatedChar?.dollars).toBe(0);
    });
  });

  describe('Add Gold Rollback', () => {
    it('should reject negative add amounts', async () => {
      const initialBalance = character1.dollars;

      await expect(
        GoldService.addGold(
          character1._id,
          -100,
          TransactionSource.QUEST_REWARD
        )
      ).rejects.toThrow(/cannot add negative/i);

      // Verify balance unchanged
      const updatedChar = await Character.findById(character1._id);
      expect(updatedChar?.dollars).toBe(initialBalance);
    });

    it('should successfully add gold', async () => {
      const result = await GoldService.addGold(
        character1._id,
        500,
        TransactionSource.QUEST_REWARD,
        { questId: 'test-quest' }
      );

      expect(result.newBalance).toBe(1500);

      // Verify in database
      const updatedChar = await Character.findById(character1._id);
      expect(updatedChar?.dollars).toBe(1500);

      // Verify transaction created
      const transaction = await GoldTransaction.findOne({
        characterId: character1._id,
      });

      expect(transaction?.amount).toBe(500);
      expect(transaction?.balanceBefore).toBe(1000);
      expect(transaction?.balanceAfter).toBe(1500);
      expect(transaction?.metadata?.questId).toBe('test-quest');
    });
  });

  describe('Concurrent Operations with Rollback', () => {
    it('should handle concurrent deductions atomically', async () => {
      // Attempt multiple concurrent deductions
      const operations = [
        GoldService.deductGold(character1._id, 300, TransactionSource.SHOP_PURCHASE),
        GoldService.deductGold(character1._id, 400, TransactionSource.SHOP_PURCHASE),
        GoldService.deductGold(character1._id, 500, TransactionSource.SHOP_PURCHASE),
      ];

      // Some should succeed, some should fail
      const results = await Promise.allSettled(operations);

      const successes = results.filter(r => r.status === 'fulfilled');
      const failures = results.filter(r => r.status === 'rejected');

      // At least one should fail since total is 1200 but only 1000 available
      expect(failures.length).toBeGreaterThan(0);

      // Verify final balance matches successful operations
      const updatedChar = await Character.findById(character1._id);
      const transactions = await GoldTransaction.find({
        characterId: character1._id,
      });

      const totalDeducted = transactions.reduce(
        (sum, t) => sum + Math.abs(t.amount),
        0
      );

      expect(updatedChar?.dollars).toBe(1000 - totalDeducted);
    });

    it('should maintain consistency with concurrent transfers', async () => {
      // Create multiple characters
      const user3 = await User.create({
        username: 'user3',
        email: 'user3@test.com',
        passwordHash: 'pass',
        emailVerified: true,
      });

      const char3 = await Character.create({
        userId: user3._id,
        name: 'Charlie',
        faction: 'SETTLER_ALLIANCE' as any,
        level: 1,
        dollars: 0,
        currentLocation: 'el-paso',
        energy: 100,
        maxEnergy: 100,
        lastEnergyUpdate: new Date(),
        appearance: {
          bodyType: 'male',
          skinTone: 1,
          facePreset: 1,
          hairStyle: 1,
          hairColor: 1,
        },
        stats: { cunning: 10, spirit: 10, combat: 10, craft: 10 },
      });

      // Attempt multiple concurrent transfers from same sender
      const transfers = [
        GoldService.transferGold(
          character1._id,
          character2._id,
          400,
          TransactionSource.PLAYER_TRADE
        ),
        GoldService.transferGold(
          character1._id,
          char3._id,
          700,
          TransactionSource.PLAYER_TRADE
        ),
      ];

      const results = await Promise.allSettled(transfers);

      // Exactly one should succeed (both together exceed balance)
      const successes = results.filter(r => r.status === 'fulfilled');
      expect(successes.length).toBe(1);

      // Verify balances are consistent
      const updatedChar1 = await Character.findById(character1._id);
      const transactions = await GoldTransaction.find({});

      const senderTransactions = transactions.filter(
        t => t.characterId.toString() === character1._id.toString()
      );

      const totalSent = senderTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      expect(updatedChar1?.dollars).toBe(1000 - totalSent);
    });
  });
});
