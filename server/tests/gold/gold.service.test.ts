/**
 * Gold Service Tests
 * Sprint 4 - Agent 2
 *
 * Comprehensive tests for gold economy system including:
 * - Transaction safety and rollback
 * - Concurrent operations (race conditions)
 * - Insufficient funds validation
 * - Transaction history accuracy
 * - Statistics calculations
 */

import mongoose from 'mongoose';
import { GoldService } from '../../src/services/gold.service';
import { Character, ICharacter } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import { GoldTransaction, TransactionSource, TransactionType } from '../../src/models/GoldTransaction.model';
import { Faction } from '@desperados/shared';

describe('GoldService', () => {
  let testUser: any;
  let testCharacter: ICharacter;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      email: 'goldtest@example.com',
      passwordHash: 'hashedpassword123',
      isEmailVerified: true,
    });

    // Create test character with default 100 gold
    testCharacter = await Character.create({
      userId: testUser._id,
      name: 'GoldTester',
      faction: Faction.FRONTERA,
      appearance: {
        bodyType: 'male',
        skinTone: 5,
        facePreset: 3,
        hairStyle: 7,
        hairColor: 2,
      },
      currentLocation: 'el-paso',
      dollars: 100,
    });
  });

  describe('addGold()', () => {
    it('should add gold to character balance', async () => {
      const result = await GoldService.addGold(
        testCharacter._id,
        50,
        TransactionSource.COMBAT_VICTORY
      );

      expect(result.newBalance).toBe(150);

      // Verify character was updated
      const updated = await Character.findById(testCharacter._id);
      expect(updated!.dollars).toBe(150);
    });

    it('should create transaction record with correct data', async () => {
      await GoldService.addGold(
        testCharacter._id,
        75,
        TransactionSource.BOUNTY_REWARD,
        { targetName: 'Outlaw Billy' }
      );

      const transactions = await GoldTransaction.find({ characterId: testCharacter._id });
      expect(transactions).toHaveLength(1);
      expect(transactions[0].amount).toBe(75);
      expect(transactions[0].type).toBe(TransactionType.EARNED);
      expect(transactions[0].source).toBe(TransactionSource.BOUNTY_REWARD);
      expect(transactions[0].balanceBefore).toBe(100);
      expect(transactions[0].balanceAfter).toBe(175);
      expect(transactions[0].metadata.targetName).toBe('Outlaw Billy');
    });

    it('should reject negative amounts', async () => {
      await expect(
        GoldService.addGold(testCharacter._id, -50, TransactionSource.COMBAT_VICTORY)
      ).rejects.toThrow('Cannot add negative dollars');
    });

    it('should handle concurrent additions without race conditions', async () => {
      // Simulate 5 concurrent gold additions
      const promises = Array(5).fill(null).map(() =>
        GoldService.addGold(testCharacter._id, 20, TransactionSource.COMBAT_VICTORY)
      );

      await Promise.all(promises);

      const updated = await Character.findById(testCharacter._id);
      expect(updated!.dollars).toBe(200); // 100 + (5 * 20)

      const transactions = await GoldTransaction.find({ characterId: testCharacter._id });
      expect(transactions).toHaveLength(5);
    });

    // Skip: This test requires transactions but DISABLE_TRANSACTIONS=true in test env
    it.skip('should rollback on error', async () => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        await GoldService.addGold(
          testCharacter._id,
          50,
          TransactionSource.COMBAT_VICTORY,
          undefined,
          session
        );

        // Simulate error
        throw new Error('Simulated error');
      } catch (error) {
        await session.abortTransaction();
      } finally {
        session.endSession();
      }

      // Verify no changes were made
      const updated = await Character.findById(testCharacter._id);
      expect(updated!.dollars).toBe(100);

      const transactions = await GoldTransaction.find({ characterId: testCharacter._id });
      expect(transactions).toHaveLength(0);
    });
  });

  describe('deductGold()', () => {
    it('should deduct gold from character balance', async () => {
      const result = await GoldService.deductGold(
        testCharacter._id,
        30,
        TransactionSource.BAIL_PAYMENT
      );

      expect(result.newBalance).toBe(70);

      const updated = await Character.findById(testCharacter._id);
      expect(updated!.dollars).toBe(70);
    });

    it('should create transaction record with negative amount', async () => {
      await GoldService.deductGold(
        testCharacter._id,
        25,
        TransactionSource.LAY_LOW_PAYMENT
      );

      const transactions = await GoldTransaction.find({ characterId: testCharacter._id });
      expect(transactions).toHaveLength(1);
      expect(transactions[0].amount).toBe(-25); // Negative for spent
      expect(transactions[0].type).toBe(TransactionType.SPENT);
      expect(transactions[0].balanceBefore).toBe(100);
      expect(transactions[0].balanceAfter).toBe(75);
    });

    it('should reject insufficient funds', async () => {
      await expect(
        GoldService.deductGold(testCharacter._id, 150, TransactionSource.BAIL_PAYMENT)
      ).rejects.toThrow('Insufficient dollars');

      // Verify no changes
      const updated = await Character.findById(testCharacter._id);
      expect(updated!.dollars).toBe(100);
    });

    it('should reject negative amounts', async () => {
      await expect(
        GoldService.deductGold(testCharacter._id, -50, TransactionSource.BAIL_PAYMENT)
      ).rejects.toThrow('Cannot deduct negative dollars');
    });

    it('should allow deducting exact balance', async () => {
      const result = await GoldService.deductGold(
        testCharacter._id,
        100,
        TransactionSource.COMBAT_DEATH
      );

      expect(result.newBalance).toBe(0);
    });
  });

  describe('getBalance()', () => {
    it('should return current gold balance', async () => {
      const balance = await GoldService.getBalance(testCharacter._id);
      expect(balance).toBe(100);
    });

    it('should return 0 for nonexistent character', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const balance = await GoldService.getBalance(fakeId);
      expect(balance).toBe(0);
    });
  });

  describe('canAfford()', () => {
    it('should return true if character has sufficient gold', async () => {
      const canAfford = await GoldService.canAfford(testCharacter._id, 50);
      expect(canAfford).toBe(true);
    });

    it('should return false if character has insufficient gold', async () => {
      const canAfford = await GoldService.canAfford(testCharacter._id, 150);
      expect(canAfford).toBe(false);
    });

    it('should return true if amount equals balance', async () => {
      const canAfford = await GoldService.canAfford(testCharacter._id, 100);
      expect(canAfford).toBe(true);
    });
  });

  describe('getTransactionHistory()', () => {
    beforeEach(async () => {
      // Create multiple transactions
      await GoldService.addGold(testCharacter._id, 50, TransactionSource.COMBAT_VICTORY);
      await GoldService.deductGold(testCharacter._id, 20, TransactionSource.BAIL_PAYMENT);
      await GoldService.addGold(testCharacter._id, 100, TransactionSource.BOUNTY_REWARD);
      await GoldService.deductGold(testCharacter._id, 10, TransactionSource.LAY_LOW_PAYMENT);
    });

    it('should return transaction history in reverse chronological order', async () => {
      const history = await GoldService.getTransactionHistory(testCharacter._id);

      expect(history).toHaveLength(4);
      expect(history[0].source).toBe(TransactionSource.LAY_LOW_PAYMENT); // Most recent
      expect(history[3].source).toBe(TransactionSource.COMBAT_VICTORY); // Oldest
    });

    it('should respect limit parameter', async () => {
      const history = await GoldService.getTransactionHistory(testCharacter._id, 2);
      expect(history).toHaveLength(2);
    });

    it('should respect offset parameter', async () => {
      const history = await GoldService.getTransactionHistory(testCharacter._id, 2, 2);
      expect(history).toHaveLength(2);
      expect(history[0].source).toBe(TransactionSource.BAIL_PAYMENT);
    });
  });

  describe('getStatistics()', () => {
    beforeEach(async () => {
      // Earned: 50 + 100 = 150
      await GoldService.addGold(testCharacter._id, 50, TransactionSource.COMBAT_VICTORY);
      await GoldService.addGold(testCharacter._id, 100, TransactionSource.BOUNTY_REWARD);

      // Spent: 20 + 10 = 30
      await GoldService.deductGold(testCharacter._id, 20, TransactionSource.BAIL_PAYMENT);
      await GoldService.deductGold(testCharacter._id, 10, TransactionSource.LAY_LOW_PAYMENT);
    });

    it('should calculate total earned correctly', async () => {
      const stats = await GoldService.getStatistics(testCharacter._id);
      expect(stats.totalEarned).toBe(150);
    });

    it('should calculate total spent correctly', async () => {
      const stats = await GoldService.getStatistics(testCharacter._id);
      expect(stats.totalSpent).toBe(30);
    });

    it('should calculate net amount correctly', async () => {
      const stats = await GoldService.getStatistics(testCharacter._id);
      expect(stats.netAmount).toBe(120); // 150 earned - 30 spent
    });

    it('should count total transactions', async () => {
      const stats = await GoldService.getStatistics(testCharacter._id);
      expect(stats.transactionCount).toBe(4);
    });

    it('should track largest earning', async () => {
      const stats = await GoldService.getStatistics(testCharacter._id);
      expect(stats.largestEarning).toBe(100);
    });

    it('should track largest expense', async () => {
      const stats = await GoldService.getStatistics(testCharacter._id);
      expect(stats.largestExpense).toBe(20);
    });

    it('should handle character with no transactions', async () => {
      const newChar = await Character.create({
        userId: testUser._id,
        name: 'NoTransactions',
        faction: Faction.NAHI_COALITION,
        appearance: {
          bodyType: 'female',
          skinTone: 3,
          facePreset: 1,
          hairStyle: 2,
          hairColor: 4,
        },
        currentLocation: 'santa-fe',
        dollars: 100,
      });

      const stats = await GoldService.getStatistics(newChar._id);
      expect(stats.totalEarned).toBe(0);
      expect(stats.totalSpent).toBe(0);
      expect(stats.netAmount).toBe(0);
      expect(stats.transactionCount).toBe(0);
    });
  });

  describe('getTransactionsBySource()', () => {
    beforeEach(async () => {
      await GoldService.addGold(testCharacter._id, 50, TransactionSource.COMBAT_VICTORY);
      await GoldService.addGold(testCharacter._id, 30, TransactionSource.COMBAT_VICTORY);
      await GoldService.addGold(testCharacter._id, 100, TransactionSource.BOUNTY_REWARD);
    });

    it('should filter transactions by source', async () => {
      const combatTransactions = await GoldService.getTransactionsBySource(
        testCharacter._id,
        TransactionSource.COMBAT_VICTORY
      );

      expect(combatTransactions).toHaveLength(2);
      expect(combatTransactions[0].amount).toBe(30);
      expect(combatTransactions[1].amount).toBe(50);
    });
  });

  describe('getTotalFromSource()', () => {
    beforeEach(async () => {
      await GoldService.addGold(testCharacter._id, 50, TransactionSource.COMBAT_VICTORY);
      await GoldService.addGold(testCharacter._id, 30, TransactionSource.COMBAT_VICTORY);
      await GoldService.addGold(testCharacter._id, 100, TransactionSource.BOUNTY_REWARD);
    });

    it('should calculate total from specific source', async () => {
      const total = await GoldService.getTotalFromSource(
        testCharacter._id,
        TransactionSource.COMBAT_VICTORY
      );

      expect(total).toBe(80); // 50 + 30
    });
  });

  describe('Transaction Safety', () => {
    it('should maintain balance consistency across failed transactions', async () => {
      // Add gold
      await GoldService.addGold(testCharacter._id, 50, TransactionSource.COMBAT_VICTORY);

      // Attempt to deduct more than available (should fail)
      try {
        await GoldService.deductGold(testCharacter._id, 200, TransactionSource.BAIL_PAYMENT);
      } catch (error) {
        // Expected to fail
      }

      // Balance should be unchanged after failed deduction
      const balance = await GoldService.getBalance(testCharacter._id);
      expect(balance).toBe(150); // 100 + 50
    });

    it('should handle session-based transactions correctly', async () => {
      const session = await mongoose.startSession();
      await session.startTransaction();

      try {
        await GoldService.addGold(
          testCharacter._id,
          50,
          TransactionSource.COMBAT_VICTORY,
          undefined,
          session
        );

        await GoldService.deductGold(
          testCharacter._id,
          20,
          TransactionSource.BAIL_PAYMENT,
          undefined,
          session
        );

        await session.commitTransaction();
      } finally {
        session.endSession();
      }

      const balance = await GoldService.getBalance(testCharacter._id);
      expect(balance).toBe(130); // 100 + 50 - 20

      const transactions = await GoldTransaction.find({ characterId: testCharacter._id });
      expect(transactions).toHaveLength(2);
    });
  });
});
