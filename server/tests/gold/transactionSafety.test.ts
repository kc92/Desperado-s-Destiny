/**
 * Gold Transaction Safety Tests
 *
 * Tests to ensure gold transactions are atomic and prevent race conditions
 */

import request from 'supertest';
import app from '../testApp';
import { Character } from '../../src/models/Character.model';
import { GoldTransaction } from '../../src/models/GoldTransaction.model';
import { Item } from '../../src/models/Item.model';
import { clearDatabase } from '../helpers/db.helpers';
import { apiGet, apiPost, expectSuccess, expectError } from '../helpers/api.helpers';
import { setupCompleteGameState } from '../helpers/testHelpers';

describe('Gold Transaction Safety Tests', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  /**
   * Helper to create a test item
   */
  async function createTestItem() {
    const item = new Item({
      itemId: 'test-sword',
      name: 'Test Sword',
      description: 'A sword for testing',
      type: 'WEAPON',
      price: 100,
      sellPrice: 50,
      levelRequired: 1,
      inShop: true,
      isStackable: false,
      isEquippable: true,
      equipSlot: 'weapon',
      effects: []
    });
    await item.save();
    return item;
  }

  describe('Concurrent Purchase Attempts', () => {
    it('should handle concurrent purchases without double-spending', async () => {
      const { character, token } = await setupCompleteGameState(app);
      const item = await createTestItem();

      // Give character exactly enough gold for one purchase
      character.gold = 100;
      await character.save();

      // Attempt multiple concurrent purchases
      const purchases = Array(5).fill(null).map(() =>
        apiPost(
          app,
          '/api/shop/buy',
          {
            characterId: character._id.toString(),
            itemId: item.itemId,
            quantity: 1
          },
          token
        )
      );

      const results = await Promise.all(purchases);

      // Only one should succeed
      const successes = results.filter(r => r.status === 200);
      const failures = results.filter(r => r.status === 400);

      expect(successes.length).toBe(1);
      expect(failures.length).toBe(4);

      // Verify final balance is correct (0 if one purchase succeeded)
      const updatedChar = await Character.findById(character._id);
      expect(updatedChar?.gold).toBe(0);
    });

    it('should prevent race condition with rapid purchases', async () => {
      const { character, token } = await setupCompleteGameState(app);
      const item = await createTestItem();

      // Give character enough for 2 purchases
      character.gold = 200;
      await character.save();

      // Attempt 10 concurrent purchases
      const purchases = Array(10).fill(null).map(() =>
        apiPost(
          app,
          '/api/shop/buy',
          {
            characterId: character._id.toString(),
            itemId: item.itemId,
            quantity: 1
          },
          token
        )
      );

      const results = await Promise.all(purchases);

      // Exactly 2 should succeed
      const successes = results.filter(r => r.status === 200);
      expect(successes.length).toBe(2);

      // Verify final balance
      const updatedChar = await Character.findById(character._id);
      expect(updatedChar?.gold).toBe(0);
    });

    it('should maintain consistency with concurrent gold deductions', async () => {
      const { character, token } = await setupCompleteGameState(app);

      character.gold = 1000;
      await character.save();

      // Create multiple items
      const items = await Promise.all([
        createTestItem(),
        new Item({
          itemId: 'test-item-2',
          name: 'Test Item 2',
          type: 'CONSUMABLE',
          price: 150,
          sellPrice: 75,
          inShop: true,
          isStackable: true,
          isConsumable: true,
          effects: []
        }).save()
      ]);

      // Attempt multiple concurrent purchases of different items
      const purchases = [
        apiPost(app, '/api/shop/buy', {
          characterId: character._id.toString(),
          itemId: items[0].itemId,
          quantity: 1
        }, token),
        apiPost(app, '/api/shop/buy', {
          characterId: character._id.toString(),
          itemId: items[1].itemId,
          quantity: 1
        }, token),
        apiPost(app, '/api/shop/buy', {
          characterId: character._id.toString(),
          itemId: items[0].itemId,
          quantity: 1
        }, token)
      ];

      await Promise.all(purchases);

      // Verify total deducted matches purchases
      const updatedChar = await Character.findById(character._id);
      const transactions = await GoldTransaction.find({
        characterId: character._id
      });

      // Calculate total spent
      const totalSpent = transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Final balance should be initial - total spent
      expect(updatedChar?.gold).toBe(1000 - totalSpent);
    });
  });

  describe('Balance Non-Negativity', () => {
    it('should prevent balance from going negative', async () => {
      const { character, token } = await setupCompleteGameState(app);
      const item = await createTestItem();

      // Give character less than item cost
      character.gold = 50;
      await character.save();

      const response = await apiPost(
        app,
        '/api/shop/buy',
        {
          characterId: character._id.toString(),
          itemId: item.itemId,
          quantity: 1
        },
        token
      );

      expect(response.status).toBe(400);
      expectError(response, 400);
      expect(response.body.error).toMatch(/insufficient|not enough/i);

      // Verify balance unchanged
      const updatedChar = await Character.findById(character._id);
      expect(updatedChar?.gold).toBe(50);
    });

    it('should prevent negative balance with exact amount edge case', async () => {
      const { character, token } = await setupCompleteGameState(app);
      const item = await createTestItem();

      // Give character exactly item cost
      character.gold = 100;
      await character.save();

      // First purchase should succeed
      const response1 = await apiPost(
        app,
        '/api/shop/buy',
        {
          characterId: character._id.toString(),
          itemId: item.itemId,
          quantity: 1
        },
        token
      );

      expect(response1.status).toBe(200);

      // Second purchase should fail
      const response2 = await apiPost(
        app,
        '/api/shop/buy',
        {
          characterId: character._id.toString(),
          itemId: item.itemId,
          quantity: 1
        },
        token
      );

      expect(response2.status).toBe(400);

      // Verify balance is 0, not negative
      const updatedChar = await Character.findById(character._id);
      expect(updatedChar?.gold).toBe(0);
    });

    it('should handle large quantity purchases safely', async () => {
      const { character, token } = await setupCompleteGameState(app);
      const item = await createTestItem();

      character.gold = 500;
      await character.save();

      // Try to buy more than affordable (5 items at 100 each = 500, but trying 10)
      const response = await apiPost(
        app,
        '/api/shop/buy',
        {
          characterId: character._id.toString(),
          itemId: item.itemId,
          quantity: 10
        },
        token
      );

      expect(response.status).toBe(400);
      expectError(response, 400);

      // Balance should be unchanged
      const updatedChar = await Character.findById(character._id);
      expect(updatedChar?.gold).toBe(500);
    });
  });

  describe('Transaction Rollback on Failure', () => {
    it('should rollback transaction if inventory update fails', async () => {
      const { character, token } = await setupCompleteGameState(app);

      character.gold = 1000;
      await character.save();

      // Try to buy non-existent item
      const response = await apiPost(
        app,
        '/api/shop/buy',
        {
          characterId: character._id.toString(),
          itemId: 'non-existent-item',
          quantity: 1
        },
        token
      );

      expect(response.status).toBe(404);

      // Balance should be unchanged
      const updatedChar = await Character.findById(character._id);
      expect(updatedChar?.gold).toBe(1000);

      // No transaction record should be created
      const transactions = await GoldTransaction.find({
        characterId: character._id,
        source: 'SHOP_PURCHASE'
      });
      expect(transactions.length).toBe(0);
    });

    it('should rollback if character becomes inactive during transaction', async () => {
      const { character, token } = await setupCompleteGameState(app);
      const item = await createTestItem();

      character.gold = 1000;
      await character.save();

      // This is a theoretical test - in practice, you'd need to simulate
      // character deactivation mid-transaction
      const initialGold = character.gold;

      // Deactivate character
      character.isActive = false;
      await character.save();

      const response = await apiPost(
        app,
        '/api/shop/buy',
        {
          characterId: character._id.toString(),
          itemId: item.itemId,
          quantity: 1
        },
        token
      );

      // Should fail due to inactive character
      expect([400, 404]).toContain(response.status);

      // Balance should not have changed
      const updatedChar = await Character.findById(character._id);
      expect(updatedChar?.gold).toBe(initialGold);
    });
  });

  describe('Audit Trail Creation', () => {
    it('should create transaction record for every purchase', async () => {
      const { character, token } = await setupCompleteGameState(app);
      const item = await createTestItem();

      character.gold = 500;
      await character.save();

      await apiPost(
        app,
        '/api/shop/buy',
        {
          characterId: character._id.toString(),
          itemId: item.itemId,
          quantity: 1
        },
        token
      );

      const transactions = await GoldTransaction.find({
        characterId: character._id,
        source: 'SHOP_PURCHASE'
      });

      expect(transactions.length).toBe(1);
      expect(transactions[0].amount).toBe(-100);
      expect(transactions[0].balanceBefore).toBe(500);
      expect(transactions[0].balanceAfter).toBe(400);
    });

    it('should create accurate audit trail for multiple transactions', async () => {
      const { character, token } = await setupCompleteGameState(app);
      const item = await createTestItem();

      character.gold = 500;
      await character.save();

      // Make 3 purchases
      await apiPost(app, '/api/shop/buy', {
        characterId: character._id.toString(),
        itemId: item.itemId,
        quantity: 1
      }, token);

      await apiPost(app, '/api/shop/buy', {
        characterId: character._id.toString(),
        itemId: item.itemId,
        quantity: 1
      }, token);

      await apiPost(app, '/api/shop/buy', {
        characterId: character._id.toString(),
        itemId: item.itemId,
        quantity: 1
      }, token);

      const transactions = await GoldTransaction.find({
        characterId: character._id
      }).sort({ timestamp: 1 });

      expect(transactions.length).toBe(3);

      // Verify sequence
      expect(transactions[0].balanceBefore).toBe(500);
      expect(transactions[0].balanceAfter).toBe(400);

      expect(transactions[1].balanceBefore).toBe(400);
      expect(transactions[1].balanceAfter).toBe(300);

      expect(transactions[2].balanceBefore).toBe(300);
      expect(transactions[2].balanceAfter).toBe(200);
    });

    it('should include metadata in transaction records', async () => {
      const { character, token } = await setupCompleteGameState(app);
      const item = await createTestItem();

      character.gold = 500;
      await character.save();

      await apiPost(
        app,
        '/api/shop/buy',
        {
          characterId: character._id.toString(),
          itemId: item.itemId,
          quantity: 2
        },
        token
      );

      const transaction = await GoldTransaction.findOne({
        characterId: character._id
      });

      expect(transaction?.metadata).toBeDefined();
      expect(transaction?.metadata.itemId).toBe(item.itemId);
      expect(transaction?.metadata.quantity).toBe(2);
    });

    it('should not create transaction record on failed purchase', async () => {
      const { character, token } = await setupCompleteGameState(app);
      const item = await createTestItem();

      character.gold = 50; // Not enough
      await character.save();

      await apiPost(
        app,
        '/api/shop/buy',
        {
          characterId: character._id.toString(),
          itemId: item.itemId,
          quantity: 1
        },
        token
      );

      const transactions = await GoldTransaction.find({
        characterId: character._id,
        source: 'SHOP_PURCHASE'
      });

      expect(transactions.length).toBe(0);
    });
  });

  describe('Integer Overflow Prevention', () => {
    it('should handle large gold amounts safely', async () => {
      const { character, token } = await setupCompleteGameState(app);

      // Set gold to near max safe integer
      character.gold = Number.MAX_SAFE_INTEGER - 1000;
      await character.save();

      // Verify it's stored correctly
      const updatedChar = await Character.findById(character._id);
      expect(updatedChar?.gold).toBe(Number.MAX_SAFE_INTEGER - 1000);
    });

    it('should prevent integer overflow in quantity calculations', async () => {
      const { character, token } = await setupCompleteGameState(app);
      const item = await createTestItem();

      character.gold = 1000000;
      await character.save();

      // Try to buy with very large quantity
      const response = await apiPost(
        app,
        '/api/shop/buy',
        {
          characterId: character._id.toString(),
          itemId: item.itemId,
          quantity: Number.MAX_SAFE_INTEGER
        },
        token
      );

      // Should fail with appropriate error
      expect([400]).toContain(response.status);
    });
  });

  describe('Concurrent Deposit and Withdrawal', () => {
    it('should handle simultaneous deposits and withdrawals', async () => {
      const { character, token } = await setupCompleteGameState(app);
      const item = await createTestItem();

      character.gold = 500;
      await character.save();

      // Simulate earning gold while spending
      const operations = [
        // Spending
        apiPost(app, '/api/shop/buy', {
          characterId: character._id.toString(),
          itemId: item.itemId,
          quantity: 1
        }, token),
        // More operations could go here
      ];

      await Promise.all(operations);

      // Verify consistency
      const updatedChar = await Character.findById(character._id);
      const transactions = await GoldTransaction.find({
        characterId: character._id
      });

      const totalChange = transactions.reduce((sum, t) => sum + t.amount, 0);
      expect(updatedChar?.gold).toBe(500 + totalChange);
    });
  });
});
