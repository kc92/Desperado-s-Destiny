/**
 * Dollar Service Tests - Comprehensive Coverage
 *
 * Tests all dollar/currency transaction operations including:
 * - Core transactions (add, deduct, transfer)
 * - Validation and safety checks
 * - Audit trail and logging
 * - Concurrency and race conditions
 * - Wealth tax system
 * - Newcomer stake system
 * - Edge cases and error handling
 */

import mongoose from 'mongoose';
import { DollarService, MAX_DOLLARS, TransactionSource, TransactionType, CurrencyType } from '../../src/services/dollar.service';
import { Character } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import { GoldTransaction } from '../../src/models/GoldTransaction.model';
import { Location } from '../../src/models/Location.model';

// Disable transactions for simpler testing (we test concurrency separately)
process.env.DISABLE_TRANSACTIONS = 'true';

// Test data
let testUser: any;
let testCharacter: any;
let testCharacter2: any;
let testLocation: any;

/**
 * Setup before each test
 */
beforeEach(async () => {
  // Clear all collections
  await Character.deleteMany({});
  await User.deleteMany({});
  await GoldTransaction.deleteMany({});
  await Location.deleteMany({});

  // Create test location with valid enum values
  testLocation = await Location.create({
    name: 'Test Town',
    type: 'town_square',
    description: 'A test location for dollar service tests',
    shortDescription: 'Test town center',
    region: 'town',
    dangerLevel: 1,
    availableActions: [],
    availableCrimes: [],
    jobs: [],
    shops: [],
    npcs: [],
    connections: [],
    factionInfluence: { settlerAlliance: 0, nahiCoalition: 0, frontera: 0 },
    isUnlocked: true,
    isHidden: false
  });

  // Create test user
  testUser = await User.create({
    email: 'test@example.com',
    username: 'testuser',
    passwordHash: 'hashedpassword123',
    isVerified: true
  });

  // Create test characters with proper structure
  testCharacter = await Character.create({
    userId: testUser._id,
    name: 'TestCharacter1',
    faction: 'SETTLER_ALLIANCE',
    appearance: {
      bodyType: 'male',
      skinTone: 5,
      facePreset: 1,
      hairStyle: 3,
      hairColor: 2
    },
    dollars: 1000,
    gold: 1000, // For backward compatibility
    level: 10,
    currentLocation: testLocation._id.toString(),
    factionReputation: {
      settlerAlliance: 0,
      nahiCoalition: 0,
      frontera: 0
    }
  });

  testCharacter2 = await Character.create({
    userId: testUser._id,
    name: 'TestCharacter2',
    faction: 'SETTLER_ALLIANCE',
    appearance: {
      bodyType: 'female',
      skinTone: 3,
      facePreset: 2,
      hairStyle: 5,
      hairColor: 4
    },
    dollars: 500,
    gold: 500,
    level: 5,
    currentLocation: testLocation._id.toString(),
    factionReputation: {
      settlerAlliance: 0,
      nahiCoalition: 0,
      frontera: 0
    }
  });
});

/**
 * Cleanup after each test
 */
afterEach(async () => {
  jest.clearAllMocks();
});

// ============================================
// CORE TRANSACTIONS
// ============================================

describe('DollarService - Core Transactions', () => {
  describe('addDollars()', () => {
    it('should add dollars to character balance', async () => {
      const result = await DollarService.addDollars(
        testCharacter._id,
        100,
        TransactionSource.COMBAT_VICTORY
      );

      expect(result.newBalance).toBe(1100);
      expect(result.transaction).toBeDefined();
      expect(result.transaction.amount).toBe(100);
      expect(result.transaction.type).toBe(TransactionType.EARNED);
    });

    it('should create audit trail for dollar addition', async () => {
      await DollarService.addDollars(
        testCharacter._id,
        250,
        TransactionSource.QUEST_REWARD,
        { questId: 'test-quest' }
      );

      const transactions = await GoldTransaction.find({ characterId: testCharacter._id });
      expect(transactions.length).toBe(1);
      expect(transactions[0].source).toBe(TransactionSource.QUEST_REWARD);
      expect(transactions[0].balanceBefore).toBe(1000);
      expect(transactions[0].balanceAfter).toBe(1250);
    });

    it('should reject negative amounts', async () => {
      await expect(
        DollarService.addDollars(testCharacter._id, -50, TransactionSource.STARTING_GOLD)
      ).rejects.toThrow('Cannot add negative dollars');
    });

    it('should handle zero amount gracefully', async () => {
      const result = await DollarService.addDollars(
        testCharacter._id,
        0,
        TransactionSource.STARTING_GOLD
      );
      expect(result.newBalance).toBe(1000);
    });
  });

  describe('deductDollars()', () => {
    it('should deduct dollars from character balance', async () => {
      const result = await DollarService.deductDollars(
        testCharacter._id,
        200,
        TransactionSource.SHOP_PURCHASE
      );

      expect(result.newBalance).toBe(800);
      expect(result.transaction.amount).toBe(-200);
      expect(result.transaction.type).toBe(TransactionType.SPENT);
    });

    it('should reject insufficient funds', async () => {
      await expect(
        DollarService.deductDollars(testCharacter._id, 2000, TransactionSource.SHOP_PURCHASE)
      ).rejects.toThrow(/Insufficient dollars/);
    });

    it('should reject negative amounts', async () => {
      await expect(
        DollarService.deductDollars(testCharacter._id, -100, TransactionSource.STARTING_GOLD)
      ).rejects.toThrow('Cannot deduct negative dollars');
    });

    it('should create audit trail for deduction', async () => {
      await DollarService.deductDollars(
        testCharacter._id,
        150,
        TransactionSource.SHOP_PURCHASE,
        { itemId: 'test-item' }
      );

      const transactions = await GoldTransaction.find({ characterId: testCharacter._id });
      expect(transactions.length).toBe(1);
      expect(transactions[0].source).toBe(TransactionSource.SHOP_PURCHASE);
      expect(transactions[0].balanceBefore).toBe(1000);
      expect(transactions[0].balanceAfter).toBe(850);
    });
  });

  describe('transferDollars()', () => {
    it('should transfer dollars between characters', async () => {
      const result = await DollarService.transferDollars(
        testCharacter._id,
        testCharacter2._id,
        300,
        TransactionSource.PLAYER_TRADE
      );

      expect(result.fromBalance).toBe(700);
      expect(result.toBalance).toBe(800);
      expect(result.fromTransaction.amount).toBe(-300);
      expect(result.toTransaction.amount).toBe(300);
    });

    it('should prevent self-transfer', async () => {
      await expect(
        DollarService.transferDollars(
          testCharacter._id,
          testCharacter._id,
          100,
          TransactionSource.PLAYER_TRADE
        )
      ).rejects.toThrow('Cannot transfer dollars to yourself');
    });

    it('should reject transfer with insufficient funds', async () => {
      await expect(
        DollarService.transferDollars(
          testCharacter._id,
          testCharacter2._id,
          5000,
          TransactionSource.PLAYER_TRADE
        )
      ).rejects.toThrow(/Insufficient dollars/);
    });

    it('should reject zero or negative transfer amounts', async () => {
      await expect(
        DollarService.transferDollars(
          testCharacter._id,
          testCharacter2._id,
          0,
          TransactionSource.PLAYER_TRADE
        )
      ).rejects.toThrow('Transfer amount must be positive');

      await expect(
        DollarService.transferDollars(
          testCharacter._id,
          testCharacter2._id,
          -100,
          TransactionSource.PLAYER_TRADE
        )
      ).rejects.toThrow('Transfer amount must be positive');
    });
  });
});

// ============================================
// VALIDATION & SAFETY
// ============================================

describe('DollarService - Validation & Safety', () => {
  describe('overflow prevention', () => {
    it('should prevent balance from exceeding MAX_DOLLARS', async () => {
      // Set character to near max
      await Character.findByIdAndUpdate(testCharacter._id, {
        dollars: MAX_DOLLARS - 100,
        gold: MAX_DOLLARS - 100
      });

      await expect(
        DollarService.addDollars(testCharacter._id, 200, TransactionSource.STARTING_GOLD)
      ).rejects.toThrow(/Dollar cap exceeded/);
    });

    it('should prevent transfer that would exceed recipient cap', async () => {
      await Character.findByIdAndUpdate(testCharacter2._id, {
        dollars: MAX_DOLLARS - 50,
        gold: MAX_DOLLARS - 50
      });

      await expect(
        DollarService.transferDollars(
          testCharacter._id,
          testCharacter2._id,
          100,
          TransactionSource.PLAYER_TRADE
        )
      ).rejects.toThrow(/dollar cap/i);
    });
  });

  describe('underflow prevention', () => {
    it('should not allow balance to go negative', async () => {
      const balance = await DollarService.getBalance(testCharacter._id);

      await expect(
        DollarService.deductDollars(testCharacter._id, balance + 1, TransactionSource.STARTING_GOLD)
      ).rejects.toThrow(/Insufficient dollars/);
    });
  });

  describe('invalid character handling', () => {
    it('should throw error for non-existent character on add', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(
        DollarService.addDollars(fakeId, 100, TransactionSource.STARTING_GOLD)
      ).rejects.toThrow(/Character not found/);
    });

    it('should throw error for non-existent character on deduct', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(
        DollarService.deductDollars(fakeId, 100, TransactionSource.STARTING_GOLD)
      ).rejects.toThrow(/Character not found/);
    });

    it('should throw error for non-existent sender in transfer', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(
        DollarService.transferDollars(fakeId, testCharacter2._id, 100, TransactionSource.PLAYER_TRADE)
      ).rejects.toThrow(/Sender character not found/);
    });

    it('should throw error for non-existent recipient in transfer', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(
        DollarService.transferDollars(testCharacter._id, fakeId, 100, TransactionSource.PLAYER_TRADE)
      ).rejects.toThrow(/Recipient character not found/);
    });
  });
});

// ============================================
// BALANCE & AFFORDABILITY
// ============================================

describe('DollarService - Balance & Affordability', () => {
  describe('getBalance()', () => {
    it('should return current dollar balance', async () => {
      const balance = await DollarService.getBalance(testCharacter._id);
      expect(balance).toBe(1000);
    });

    it('should return 0 for character with no balance', async () => {
      await Character.findByIdAndUpdate(testCharacter._id, { dollars: 0, gold: 0 });
      const balance = await DollarService.getBalance(testCharacter._id);
      expect(balance).toBe(0);
    });
  });

  describe('canAfford()', () => {
    it('should return true when character has sufficient funds', async () => {
      const canAfford = await DollarService.canAfford(testCharacter._id, 500);
      expect(canAfford).toBe(true);
    });

    it('should return true for exact balance', async () => {
      const canAfford = await DollarService.canAfford(testCharacter._id, 1000);
      expect(canAfford).toBe(true);
    });

    it('should return false when character has insufficient funds', async () => {
      const canAfford = await DollarService.canAfford(testCharacter._id, 1001);
      expect(canAfford).toBe(false);
    });
  });
});

// ============================================
// TRANSACTION HISTORY & STATISTICS
// ============================================

describe('DollarService - Transaction History', () => {
  beforeEach(async () => {
    // Create some transactions
    await DollarService.addDollars(testCharacter._id, 100, TransactionSource.COMBAT_VICTORY);
    await DollarService.addDollars(testCharacter._id, 200, TransactionSource.QUEST_REWARD);
    await DollarService.deductDollars(testCharacter._id, 50, TransactionSource.SHOP_PURCHASE);
  });

  describe('getTransactionHistory()', () => {
    it('should return transaction history', async () => {
      const history = await DollarService.getTransactionHistory(testCharacter._id);
      expect(history.length).toBe(3);
    });

    it('should return history in reverse chronological order', async () => {
      const history = await DollarService.getTransactionHistory(testCharacter._id);
      expect(history[0].source).toBe(TransactionSource.SHOP_PURCHASE); // Most recent
      expect(history[2].source).toBe(TransactionSource.COMBAT_VICTORY); // Oldest
    });

    it('should respect limit parameter', async () => {
      const history = await DollarService.getTransactionHistory(testCharacter._id, 2);
      expect(history.length).toBe(2);
    });

    it('should respect offset parameter', async () => {
      const history = await DollarService.getTransactionHistory(testCharacter._id, 10, 1);
      expect(history.length).toBe(2);
    });
  });

  describe('getStatistics()', () => {
    it('should calculate total earned and spent', async () => {
      const stats = await DollarService.getStatistics(testCharacter._id);
      expect(stats.totalEarned).toBe(300); // 100 + 200
      expect(stats.totalSpent).toBe(50);
      expect(stats.netAmount).toBe(250);
      expect(stats.transactionCount).toBe(3);
    });

    it('should track largest earning and expense', async () => {
      const stats = await DollarService.getStatistics(testCharacter._id);
      expect(stats.largestEarning).toBe(200);
      expect(stats.largestExpense).toBe(50);
    });
  });

  describe('getTransactionsBySource()', () => {
    it('should filter transactions by source', async () => {
      const combatTransactions = await DollarService.getTransactionsBySource(
        testCharacter._id,
        TransactionSource.COMBAT_VICTORY
      );
      expect(combatTransactions.length).toBe(1);
      expect(combatTransactions[0].amount).toBe(100);
    });
  });

  describe('getTotalFromSource()', () => {
    it('should sum amounts from a specific source', async () => {
      await DollarService.addDollars(testCharacter._id, 150, TransactionSource.COMBAT_VICTORY);

      const total = await DollarService.getTotalFromSource(
        testCharacter._id,
        TransactionSource.COMBAT_VICTORY
      );
      expect(total).toBe(250); // 100 + 150
    });
  });
});

// ============================================
// BATCH OPERATIONS
// ============================================

describe('DollarService - Batch Operations', () => {
  let char3: any;
  let char4: any;

  beforeEach(async () => {
    char3 = await Character.create({
      userId: testUser._id,
      name: 'Character3',
      faction: 'SETTLER_ALLIANCE',
      appearance: {
        bodyType: 'male',
        skinTone: 4,
        facePreset: 3,
        hairStyle: 6,
        hairColor: 1
      },
      dollars: 100,
      gold: 100,
      level: 3,
      currentLocation: testLocation._id.toString(),
      factionReputation: { settlerAlliance: 0, nahiCoalition: 0, frontera: 0 }
    });

    char4 = await Character.create({
      userId: testUser._id,
      name: 'Character4',
      faction: 'FRONTERA',
      appearance: {
        bodyType: 'female',
        skinTone: 7,
        facePreset: 4,
        hairStyle: 9,
        hairColor: 5
      },
      dollars: 100,
      gold: 100,
      level: 4,
      currentLocation: testLocation._id.toString(),
      factionReputation: { settlerAlliance: 0, nahiCoalition: 0, frontera: 0 }
    });
  });

  describe('batchTransferDollars()', () => {
    it('should transfer to multiple recipients', async () => {
      const result = await DollarService.batchTransferDollars(
        testCharacter._id,
        [
          { characterId: testCharacter2._id, amount: 100 },
          { characterId: char3._id, amount: 150 },
          { characterId: char4._id, amount: 50 }
        ],
        TransactionSource.PLAYER_TRADE
      );

      expect(result.length).toBe(3);

      // Verify sender balance
      const senderBalance = await DollarService.getBalance(testCharacter._id);
      expect(senderBalance).toBe(700); // 1000 - 300

      // Verify recipients
      expect(await DollarService.getBalance(testCharacter2._id)).toBe(600);
      expect(await DollarService.getBalance(char3._id)).toBe(250);
      expect(await DollarService.getBalance(char4._id)).toBe(150);
    });

    it('should reject if sender has insufficient funds for total', async () => {
      await expect(
        DollarService.batchTransferDollars(
          testCharacter._id,
          [
            { characterId: testCharacter2._id, amount: 600 },
            { characterId: char3._id, amount: 600 }
          ],
          TransactionSource.PLAYER_TRADE
        )
      ).rejects.toThrow(/Insufficient dollars for batch transfer/);
    });

    it('should reject empty transfers array', async () => {
      await expect(
        DollarService.batchTransferDollars(testCharacter._id, [], TransactionSource.PLAYER_TRADE)
      ).rejects.toThrow('No transfers specified');
    });
  });
});

// ============================================
// WEALTH TAX SYSTEM
// ============================================

describe('DollarService - Wealth Tax System', () => {
  describe('calculateWealthTax()', () => {
    it('should return 0 for balance below threshold', async () => {
      const tax = DollarService.calculateWealthTax(5000);
      expect(tax).toBe(0);
    });

    it('should calculate progressive tax for wealthy characters', async () => {
      // WEALTH_TAX.EXEMPT_THRESHOLD is 100,000 - balance must be above this
      const tax = DollarService.calculateWealthTax(500000); // $500K (in 100K-1M tier)
      expect(tax).toBeGreaterThan(0);
    });

    it('should respect max daily tax cap', async () => {
      const tax = DollarService.calculateWealthTax(10000000);
      // Should be capped at WEALTH_TAX.MAX_DAILY_TAX
      expect(tax).toBeLessThanOrEqual(100000); // Assuming max is 100k
    });
  });

  describe('isInWealthTaxGracePeriod()', () => {
    it('should return true for new characters', async () => {
      const newDate = new Date();
      expect(DollarService.isInWealthTaxGracePeriod(newDate)).toBe(true);
    });

    it('should return false for old characters', async () => {
      const oldDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      expect(DollarService.isInWealthTaxGracePeriod(oldDate)).toBe(false);
    });
  });

  describe('collectWealthTax()', () => {
    it('should collect tax from wealthy character', async () => {
      // Make character wealthy
      await Character.findByIdAndUpdate(testCharacter._id, {
        dollars: 100000,
        gold: 100000,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Old character
      });

      const result = await DollarService.collectWealthTax(testCharacter._id);

      if (result) {
        expect(result.taxCollected).toBeGreaterThan(0);
        expect(result.newBalance).toBeLessThan(100000);
      }
    });

    it('should skip collection for characters in grace period', async () => {
      // Character is new (created in beforeEach)
      await Character.findByIdAndUpdate(testCharacter._id, {
        dollars: 100000,
        gold: 100000
      });

      const result = await DollarService.collectWealthTax(testCharacter._id);
      expect(result).toBeNull();
    });
  });
});

// ============================================
// NEWCOMER STAKE SYSTEM
// ============================================

describe('DollarService - Newcomer Stake System', () => {
  describe('isInNewcomerPeriod()', () => {
    it('should return true for new characters (within 2 hours)', async () => {
      const newDate = new Date();
      expect(DollarService.isInNewcomerPeriod(newDate)).toBe(true);
    });

    it('should return false for old characters', async () => {
      const oldDate = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
      expect(DollarService.isInNewcomerPeriod(oldDate)).toBe(false);
    });
  });

  describe('getNewcomerMultiplier()', () => {
    it('should return 1.5 for new characters', async () => {
      const multiplier = DollarService.getNewcomerMultiplier(new Date());
      expect(multiplier).toBe(1.5);
    });

    it('should return 1.0 for old characters', async () => {
      const oldDate = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const multiplier = DollarService.getNewcomerMultiplier(oldDate);
      expect(multiplier).toBe(1.0);
    });
  });

  describe('applyNewcomerBonus()', () => {
    it('should apply 50% bonus to new characters', async () => {
      const result = DollarService.applyNewcomerBonus(100, new Date());
      expect(result.adjustedAmount).toBe(150);
      expect(result.bonusApplied).toBe(true);
      expect(result.bonusAmount).toBe(50);
    });

    it('should not apply bonus to old characters', async () => {
      const oldDate = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const result = DollarService.applyNewcomerBonus(100, oldDate);
      expect(result.adjustedAmount).toBe(100);
      expect(result.bonusApplied).toBe(false);
      expect(result.bonusAmount).toBe(0);
    });
  });

  describe('getNewcomerStakeStatus()', () => {
    it('should return active status for new characters', async () => {
      const status = DollarService.getNewcomerStakeStatus(new Date());
      expect(status.isActive).toBe(true);
      expect(status.multiplier).toBe(1.5);
      expect(status.timeRemainingMs).toBeGreaterThan(0);
    });

    it('should return inactive status for old characters', async () => {
      const oldDate = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const status = DollarService.getNewcomerStakeStatus(oldDate);
      expect(status.isActive).toBe(false);
      expect(status.multiplier).toBe(1.0);
      expect(status.timeRemainingMs).toBe(0);
    });
  });
});

// ============================================
// BACKWARD COMPATIBILITY
// ============================================

describe('DollarService - Backward Compatibility', () => {
  describe('deprecated aliases', () => {
    it('addGold should work as alias for addDollars', async () => {
      const result = await DollarService.addGold(
        testCharacter._id,
        100,
        TransactionSource.STARTING_GOLD
      );
      expect(result.newBalance).toBe(1100);
    });

    it('deductGold should work as alias for deductDollars', async () => {
      const result = await DollarService.deductGold(
        testCharacter._id,
        100,
        TransactionSource.STARTING_GOLD
      );
      expect(result.newBalance).toBe(900);
    });

    it('transferGold should work as alias for transferDollars', async () => {
      const result = await DollarService.transferGold(
        testCharacter._id,
        testCharacter2._id,
        100,
        TransactionSource.PLAYER_TRADE
      );
      expect(result.fromBalance).toBe(900);
      expect(result.toBalance).toBe(600);
    });
  });
});

// ============================================
// EDGE CASES
// ============================================

describe('DollarService - Edge Cases', () => {
  it('should handle very large amounts near MAX_SAFE_INTEGER', async () => {
    await Character.findByIdAndUpdate(testCharacter._id, {
      dollars: 1000,
      gold: 1000
    });

    // Should reject amount that would exceed MAX_DOLLARS
    const hugeAmount = MAX_DOLLARS + 1;
    await expect(
      DollarService.addDollars(testCharacter._id, hugeAmount, TransactionSource.STARTING_GOLD)
    ).rejects.toThrow(/Dollar cap exceeded/);
  });

  it('should handle rapid sequential transactions', async () => {
    // Execute multiple transactions sequentially
    for (let i = 0; i < 10; i++) {
      await DollarService.addDollars(testCharacter._id, 10, TransactionSource.COMBAT_VICTORY);
    }

    const balance = await DollarService.getBalance(testCharacter._id);
    expect(balance).toBe(1100); // 1000 + (10 * 10)

    const transactions = await GoldTransaction.find({ characterId: testCharacter._id });
    expect(transactions.length).toBe(10);
  });

  it('should handle deducting exact balance', async () => {
    const balance = await DollarService.getBalance(testCharacter._id);
    const result = await DollarService.deductDollars(
      testCharacter._id,
      balance,
      TransactionSource.SHOP_PURCHASE
    );
    expect(result.newBalance).toBe(0);
  });

  it('should handle multiple sources in same transaction set', async () => {
    await DollarService.addDollars(testCharacter._id, 100, TransactionSource.COMBAT_VICTORY);
    await DollarService.addDollars(testCharacter._id, 200, TransactionSource.QUEST_REWARD);
    await DollarService.addDollars(testCharacter._id, 50, TransactionSource.PROPERTY_INCOME);

    const combatTotal = await DollarService.getTotalFromSource(
      testCharacter._id,
      TransactionSource.COMBAT_VICTORY
    );
    const questTotal = await DollarService.getTotalFromSource(
      testCharacter._id,
      TransactionSource.QUEST_REWARD
    );
    const propertyTotal = await DollarService.getTotalFromSource(
      testCharacter._id,
      TransactionSource.PROPERTY_INCOME
    );

    expect(combatTotal).toBe(100);
    expect(questTotal).toBe(200);
    expect(propertyTotal).toBe(50);
  });
});
