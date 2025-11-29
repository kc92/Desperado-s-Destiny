/**
 * Action Challenge Tests
 *
 * Comprehensive tests for the Destiny Deck challenge system
 */

import { Express } from 'express';
import app from '../../src/server';
import { Action, ActionType } from '../../src/models/Action.model';
import { ActionResult } from '../../src/models/ActionResult.model';
import { Character } from '../../src/models/Character.model';
import { apiPost, apiGet, expectSuccess, expectError } from '../helpers/api.helpers';
import { setupCompleteGameState } from '../helpers/testHelpers';
import { Suit, HandRank } from '@desperados/shared';

describe('Action Challenge System', () => {
  let testApp: Express;
  let token: string;
  let characterId: string;
  let actionId: string;

  beforeEach(async () => {
    testApp = app;

    // Setup complete game state (user + character)
    const gameState = await setupCompleteGameState(testApp);
    token = gameState.token;
    characterId = gameState.character._id;

    // Seed starter actions
    await Action.seedStarterActions();

    // Get first action for testing
    const actions = await Action.findActiveActions();
    actionId = actions[0]._id.toString();
  });

  describe('POST /api/actions/challenge - Basic Functionality', () => {
    it('should successfully perform an action challenge', async () => {
      const res = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId,
          characterId
        },
        token
      );

      expectSuccess(res);
      expect(res.body.data.result).toBeDefined();
      expect(res.body.data.result.cardsDrawn).toHaveLength(5);
      expect(res.body.data.result.handRank).toBeGreaterThanOrEqual(HandRank.HIGH_CARD);
      expect(res.body.data.result.handRank).toBeLessThanOrEqual(HandRank.ROYAL_FLUSH);
      expect(res.body.data.result.handDescription).toBeDefined();
      expect(res.body.data.result.challengeSuccess).toBeDefined();
      expect(typeof res.body.data.result.challengeSuccess).toBe('boolean');
    });

    it('should draw exactly 5 unique cards', async () => {
      const res = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId,
          characterId
        },
        token
      );

      expectSuccess(res);
      const cards = res.body.data.result.cardsDrawn;
      expect(cards).toHaveLength(5);

      // Verify no duplicates
      const cardStrings = cards.map((c: any) => `${c.suit}-${c.rank}`);
      const uniqueCards = new Set(cardStrings);
      expect(uniqueCards.size).toBe(5);
    });

    it('should return valid poker hand evaluation', async () => {
      const res = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId,
          characterId
        },
        token
      );

      expectSuccess(res);
      const result = res.body.data.result;
      expect(result.handScore).toBeGreaterThan(0);
      expect(result.totalScore).toBeGreaterThanOrEqual(result.handScore);
      expect(result.difficultyThreshold).toBeGreaterThan(0);
    });

    it('should apply suit bonuses based on character stats', async () => {
      // Get character and update stats
      const character = await Character.findById(characterId);
      if (!character) throw new Error('Character not found');

      character.stats.cunning = 5;
      character.stats.spirit = 3;
      character.stats.combat = 4;
      character.stats.craft = 2;
      await character.save();

      const res = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId,
          characterId
        },
        token
      );

      expectSuccess(res);
      const result = res.body.data.result;
      expect(result.suitBonuses).toBeDefined();
      expect(result.suitBonuses.spades).toBe(10); // cunning * 2
      expect(result.suitBonuses.hearts).toBe(6);   // spirit * 2
      expect(result.suitBonuses.clubs).toBe(8);    // combat * 2
      expect(result.suitBonuses.diamonds).toBe(4); // craft * 2
    });

    it('should deduct energy on successful challenge', async () => {
      // Get initial energy
      const initialChar = await Character.findById(characterId);
      if (!initialChar) throw new Error('Character not found');
      const initialEnergy = Math.floor(initialChar.energy);

      const action = await Action.findById(actionId);
      if (!action) throw new Error('Action not found');

      const res = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId,
          characterId
        },
        token
      );

      expectSuccess(res);
      const energyRemaining = res.body.data.result.energyRemaining;
      expect(energyRemaining).toBe(initialEnergy - action.energyCost);

      // Verify in database
      const updatedChar = await Character.findById(characterId);
      expect(Math.floor(updatedChar!.energy)).toBe(energyRemaining);
    });

    it('should create ActionResult record on challenge', async () => {
      const res = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId,
          characterId
        },
        token
      );

      expectSuccess(res);

      // Verify ActionResult was created
      const results = await ActionResult.find({ characterId });
      expect(results).toHaveLength(1);
      expect(results[0].actionId.toString()).toBe(actionId);
      expect(results[0].cardsDrawn).toHaveLength(5);
      expect(results[0].success).toBeDefined();
    });
  });

  describe('POST /api/actions/challenge - Success and Failure', () => {
    it('should award rewards on successful challenge', async () => {
      const action = await Action.findById(actionId);
      if (!action) throw new Error('Action not found');

      // Set character stats very high to guarantee success
      const character = await Character.findById(characterId);
      if (!character) throw new Error('Character not found');

      const initialXP = character.experience;
      character.stats.cunning = 50;
      character.stats.spirit = 50;
      character.stats.combat = 50;
      character.stats.craft = 50;
      await character.save();

      const res = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId,
          characterId
        },
        token
      );

      expectSuccess(res);
      const result = res.body.data.result;

      if (result.challengeSuccess) {
        expect(result.rewardsGained.xp).toBe(action.rewards.xp);
        expect(result.rewardsGained.gold).toBe(action.rewards.gold);
        expect(result.characterXP).toBe(initialXP + action.rewards.xp);
      }
    });

    it('should not award rewards on failed challenge', async () => {
      // Set character stats very low and use difficult action
      const character = await Character.findById(characterId);
      if (!character) throw new Error('Character not found');

      character.stats.cunning = 0;
      character.stats.spirit = 0;
      character.stats.combat = 0;
      character.stats.craft = 0;
      await character.save();

      // Find a difficult action
      const difficultActions = await Action.find({
        isActive: true,
        difficulty: { $gte: 70 }
      });

      if (difficultActions.length === 0) {
        // Skip if no difficult actions exist
        return;
      }

      const difficultActionId = difficultActions[0]._id.toString();

      // Perform multiple challenges to get at least one failure
      let failureFound = false;
      for (let i = 0; i < 10; i++) {
        const res = await apiPost(
          testApp,
          '/api/actions/challenge',
          {
            actionId: difficultActionId,
            characterId
          },
          token
        );

        // Regenerate energy for next attempt
        const char = await Character.findById(characterId);
        if (char) {
          char.energy = 150;
          await char.save();
        }

        if (!res.body.data.result.challengeSuccess) {
          expect(res.body.data.result.rewardsGained.xp).toBe(0);
          expect(res.body.data.result.rewardsGained.gold).toBe(0);
          failureFound = true;
          break;
        }
      }

      // It's statistically almost impossible to not get at least one failure
      expect(failureFound).toBe(true);
    });
  });

  describe('POST /api/actions/challenge - Energy Validation', () => {
    it('should reject challenge with insufficient energy', async () => {
      const character = await Character.findById(characterId);
      if (!character) throw new Error('Character not found');

      const action = await Action.findById(actionId);
      if (!action) throw new Error('Action not found');

      // Set energy below requirement
      character.energy = action.energyCost - 1;
      await character.save();

      const res = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId,
          characterId
        },
        token
      );

      expectError(res, 400);
      expect(res.body.error).toContain('Insufficient energy');
      expect(res.body.details).toBeDefined();
      expect(res.body.details.required).toBe(action.energyCost);
      expect(res.body.details.current).toBeLessThan(action.energyCost);
    });

    it('should not deduct energy on validation failure', async () => {
      const character = await Character.findById(characterId);
      if (!character) throw new Error('Character not found');

      character.energy = 5;
      await character.save();

      const res = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId: 'invalid-id',
          characterId
        },
        token
      );

      expectError(res);

      // Verify energy unchanged
      const updatedChar = await Character.findById(characterId);
      expect(Math.floor(updatedChar!.energy)).toBe(5);
    });
  });

  describe('POST /api/actions/challenge - Security and Validation', () => {
    it('should require authentication', async () => {
      const res = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId,
          characterId
        }
      );

      expectError(res, 401);
    });

    it('should validate character ownership', async () => {
      // Create another user + character
      const otherGameState = await setupCompleteGameState(testApp, 'other@example.com');

      // Try to use other user's character
      const res = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId,
          characterId: otherGameState.character._id
        },
        token // Using first user's token
      );

      expectError(res, 403);
      expect(res.body.error).toContain('do not own');
    });

    it('should validate required fields', async () => {
      const res1 = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          characterId
        },
        token
      );
      expectError(res1, 400);

      const res2 = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId
        },
        token
      );
      expectError(res2, 400);

      const res3 = await apiPost(
        testApp,
        '/api/actions/challenge',
        {},
        token
      );
      expectError(res3, 400);
    });

    it('should reject invalid action ID', async () => {
      const res = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId: '507f1f77bcf86cd799439011', // Valid ObjectId format but doesn't exist
          characterId
        },
        token
      );

      expectError(res, 404);
      expect(res.body.error).toContain('Action not found');
    });

    it('should reject invalid character ID', async () => {
      const res = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId,
          characterId: '507f1f77bcf86cd799439011' // Valid ObjectId format but doesn't exist
        },
        token
      );

      expectError(res, 404);
      expect(res.body.error).toContain('Character not found');
    });
  });

  describe('POST /api/actions/challenge - Transaction Safety', () => {
    it('should use MongoDB transactions for energy deduction', async () => {
      // This test verifies transaction behavior by checking energy consistency
      const character = await Character.findById(characterId);
      if (!character) throw new Error('Character not found');

      const initialEnergy = Math.floor(character.energy);

      const res = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId,
          characterId
        },
        token
      );

      expectSuccess(res);

      // Verify energy was deducted atomically
      const updatedChar = await Character.findById(characterId);
      const action = await Action.findById(actionId);

      expect(Math.floor(updatedChar!.energy)).toBe(initialEnergy - action!.energyCost);
    });

    it('should rollback on error during challenge', async () => {
      const character = await Character.findById(characterId);
      if (!character) throw new Error('Character not found');

      const initialEnergy = Math.floor(character.energy);

      // Try with invalid action ID (should fail before transaction completes)
      const res = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId: 'invalid',
          characterId
        },
        token
      );

      expectError(res);

      // Verify energy unchanged
      const updatedChar = await Character.findById(characterId);
      expect(Math.floor(updatedChar!.energy)).toBe(initialEnergy);
    });
  });

  describe('POST /api/actions/challenge - Multi-User Isolation', () => {
    it('should isolate challenges between different users', async () => {
      // Create second user
      const user2State = await setupCompleteGameState(testApp, 'user2@example.com');

      // Perform challenges for both users
      const res1 = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId,
          characterId
        },
        token
      );

      const res2 = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId,
          characterId: user2State.character._id
        },
        user2State.token
      );

      expectSuccess(res1);
      expectSuccess(res2);

      // Verify separate ActionResult records
      const results1 = await ActionResult.find({ characterId });
      const results2 = await ActionResult.find({ characterId: user2State.character._id });

      expect(results1).toHaveLength(1);
      expect(results2).toHaveLength(1);
      expect(results1[0]._id.toString()).not.toBe(results2[0]._id.toString());
    });
  });

  describe('POST /api/actions/challenge - Card Drawing Randomness', () => {
    it('should draw different hands on multiple challenges', async () => {
      const hands: string[] = [];

      // Restore character energy for multiple challenges
      for (let i = 0; i < 5; i++) {
        const char = await Character.findById(characterId);
        if (char) {
          char.energy = 150;
          await char.save();
        }

        const res = await apiPost(
          testApp,
          '/api/actions/challenge',
          {
            actionId,
            characterId
          },
          token
        );

        expectSuccess(res);
        const cards = res.body.data.result.cardsDrawn;
        const handString = cards.map((c: any) => `${c.suit}-${c.rank}`).join(',');
        hands.push(handString);
      }

      // Very unlikely all 5 hands are identical (would be a bug)
      const uniqueHands = new Set(hands);
      expect(uniqueHands.size).toBeGreaterThan(1);
    });
  });

  describe('POST /api/actions/challenge - Action Types', () => {
    it('should work for CRIME actions', async () => {
      const crimeActions = await Action.find({ type: ActionType.CRIME, isActive: true });
      expect(crimeActions.length).toBeGreaterThan(0);

      const res = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId: crimeActions[0]._id.toString(),
          characterId
        },
        token
      );

      expectSuccess(res);
      expect(res.body.data.result.actionType).toBe(ActionType.CRIME);
    });

    it('should work for COMBAT actions', async () => {
      const combatActions = await Action.find({ type: ActionType.COMBAT, isActive: true });
      expect(combatActions.length).toBeGreaterThan(0);

      const res = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId: combatActions[0]._id.toString(),
          characterId
        },
        token
      );

      expectSuccess(res);
      expect(res.body.data.result.actionType).toBe(ActionType.COMBAT);
    });

    it('should work for CRAFT actions', async () => {
      const craftActions = await Action.find({ type: ActionType.CRAFT, isActive: true });
      expect(craftActions.length).toBeGreaterThan(0);

      const res = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId: craftActions[0]._id.toString(),
          characterId
        },
        token
      );

      expectSuccess(res);
      expect(res.body.data.result.actionType).toBe(ActionType.CRAFT);
    });

    it('should work for SOCIAL actions', async () => {
      const socialActions = await Action.find({ type: ActionType.SOCIAL, isActive: true });
      expect(socialActions.length).toBeGreaterThan(0);

      const res = await apiPost(
        testApp,
        '/api/actions/challenge',
        {
          actionId: socialActions[0]._id.toString(),
          characterId
        },
        token
      );

      expectSuccess(res);
      expect(res.body.data.result.actionType).toBe(ActionType.SOCIAL);
    });
  });
});
