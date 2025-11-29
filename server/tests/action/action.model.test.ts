/**
 * Action Model Tests
 *
 * Unit tests for Action and ActionResult models
 */

import { Action, ActionType } from '../../src/models/Action.model';
import { ActionResult } from '../../src/models/ActionResult.model';
import { Character } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import { Suit, HandRank, Rank } from '@desperados/shared';
import mongoose from 'mongoose';

describe('Action Model', () => {
  describe('Action Schema Validation', () => {
    it('should create a valid action', async () => {
      const action = new Action({
        type: ActionType.CRIME,
        name: 'Test Crime',
        description: 'A test crime action for testing purposes',
        energyCost: 15,
        difficulty: 50,
        requiredSuit: Suit.SPADES,
        rewards: {
          xp: 100,
          gold: 50,
          items: ['test_item']
        },
        isActive: true
      });

      const saved = await action.save();
      expect(saved._id).toBeDefined();
      expect(saved.type).toBe(ActionType.CRIME);
      expect(saved.name).toBe('Test Crime');
      expect(saved.energyCost).toBe(15);
      expect(saved.difficulty).toBe(50);
    });

    it('should enforce required fields', async () => {
      const action = new Action({
        // Missing required fields
      });

      await expect(action.save()).rejects.toThrow();
    });

    it('should validate ActionType enum', async () => {
      const action = new Action({
        type: 'INVALID_TYPE' as any,
        name: 'Test',
        description: 'Test description here',
        energyCost: 10,
        difficulty: 30,
        rewards: { xp: 50, gold: 25 }
      });

      await expect(action.save()).rejects.toThrow();
    });

    it('should validate energy cost range', async () => {
      const action = new Action({
        type: ActionType.COMBAT,
        name: 'Test Combat',
        description: 'A test combat action for testing purposes',
        energyCost: 0, // Invalid: must be >= 1
        difficulty: 50,
        rewards: { xp: 100, gold: 50 }
      });

      await expect(action.save()).rejects.toThrow();
    });

    it('should validate difficulty range', async () => {
      const action = new Action({
        type: ActionType.CRAFT,
        name: 'Test Craft',
        description: 'A test craft action for testing purposes',
        energyCost: 20,
        difficulty: 101, // Invalid: max is 100
        rewards: { xp: 100, gold: 50 }
      });

      await expect(action.save()).rejects.toThrow();
    });
  });

  describe('Action Static Methods', () => {
    beforeEach(async () => {
      await Action.seedStarterActions();
    });

    it('should find all active actions', async () => {
      const actions = await Action.findActiveActions();
      expect(actions.length).toBeGreaterThan(0);
      expect(actions.every(a => a.isActive)).toBe(true);
    });

    it('should find actions by type', async () => {
      const crimeActions = await Action.findActionsByType(ActionType.CRIME);
      expect(crimeActions.length).toBeGreaterThan(0);
      expect(crimeActions.every(a => a.type === ActionType.CRIME)).toBe(true);
    });

    it('should seed starter actions without errors', async () => {
      // Clear actions first
      await Action.deleteMany({});

      await Action.seedStarterActions();

      const actions = await Action.findActiveActions();
      expect(actions.length).toBeGreaterThanOrEqual(10);
    });

    it('should not duplicate actions when seeding twice', async () => {
      await Action.seedStarterActions();
      const firstCount = await Action.countDocuments();

      await Action.seedStarterActions();
      const secondCount = await Action.countDocuments();

      expect(firstCount).toBe(secondCount);
    });
  });

  describe('Action Instance Methods', () => {
    it('should return safe object without sensitive data', async () => {
      // Seed actions first
      await Action.seedStarterActions();

      const action = await Action.findOne({ isActive: true });
      expect(action).toBeDefined();

      const safeObject = action!.toSafeObject();

      expect(safeObject._id).toBeDefined();
      expect(safeObject.type).toBeDefined();
      expect(safeObject.name).toBeDefined();
      expect(safeObject.description).toBeDefined();
      expect(safeObject.energyCost).toBeDefined();
      expect(safeObject.difficulty).toBeDefined();
      expect(safeObject.rewards).toBeDefined();
      expect(safeObject.isActive).toBeDefined();
    });
  });
});

describe('ActionResult Model', () => {
  let character: any;
  let action: any;

  beforeEach(async () => {
    // Create user
    const user = new User({
      email: 'test@example.com',
      passwordHash: 'hashedpassword123', // User model uses passwordHash field
      emailVerified: true,
      isActive: true
    });
    await user.save();

    // Create character
    character = new Character({
      userId: user._id,
      name: 'TestHero',
      faction: 'SETTLER_ALLIANCE',
      appearance: {
        bodyType: 'male',
        skinTone: 5,
        facePreset: 1,
        hairStyle: 3,
        hairColor: 2
      },
      currentLocation: 'town_center',
      energy: 150,
      maxEnergy: 150
    });
    await character.save();

    // Seed and get action
    await Action.seedStarterActions();
    const actions = await Action.findActiveActions();
    action = actions[0];
  });

  describe('ActionResult Schema Validation', () => {
    it('should create a valid action result', async () => {
      const result = new ActionResult({
        characterId: character._id,
        actionId: action._id,
        cardsDrawn: [
          { suit: Suit.SPADES, rank: Rank.ACE },
          { suit: Suit.HEARTS, rank: Rank.KING },
          { suit: Suit.CLUBS, rank: Rank.QUEEN },
          { suit: Suit.DIAMONDS, rank: Rank.JACK },
          { suit: Suit.SPADES, rank: Rank.TEN }
        ],
        handRank: HandRank.HIGH_CARD,
        handScore: 1000000,
        handDescription: 'High Card, Ace',
        suitBonuses: {
          spades: 10,
          hearts: 6,
          clubs: 8,
          diamonds: 4
        },
        totalScore: 1050000,
        success: true,
        rewardsGained: {
          xp: 100,
          gold: 50,
          items: []
        }
      });

      const saved = await result.save();
      expect(saved._id).toBeDefined();
      expect(saved.characterId.toString()).toBe(character._id.toString());
      expect(saved.success).toBe(true);
    });

    it('should require exactly 5 cards', async () => {
      const result = new ActionResult({
        characterId: character._id,
        actionId: action._id,
        cardsDrawn: [
          { suit: Suit.SPADES, rank: Rank.ACE },
          { suit: Suit.HEARTS, rank: Rank.KING }
        ], // Only 2 cards
        handRank: HandRank.PAIR,
        handScore: 2000000,
        handDescription: 'Pair of Aces',
        suitBonuses: { spades: 0, hearts: 0, clubs: 0, diamonds: 0 },
        totalScore: 2000000,
        success: true,
        rewardsGained: { xp: 50, gold: 25, items: [] }
      });

      await expect(result.save()).rejects.toThrow();
    });

    it('should validate HandRank enum', async () => {
      const result = new ActionResult({
        characterId: character._id,
        actionId: action._id,
        cardsDrawn: [
          { suit: Suit.SPADES, rank: Rank.ACE },
          { suit: Suit.HEARTS, rank: Rank.KING },
          { suit: Suit.CLUBS, rank: Rank.QUEEN },
          { suit: Suit.DIAMONDS, rank: Rank.JACK },
          { suit: Suit.SPADES, rank: Rank.TEN }
        ],
        handRank: 999 as any, // Invalid hand rank
        handScore: 1000000,
        handDescription: 'Invalid',
        suitBonuses: { spades: 0, hearts: 0, clubs: 0, diamonds: 0 },
        totalScore: 1000000,
        success: false,
        rewardsGained: { xp: 0, gold: 0, items: [] }
      });

      await expect(result.save()).rejects.toThrow();
    });
  });

  describe('ActionResult Static Methods', () => {
    beforeEach(async () => {
      // Create 3 action results for testing
      for (let i = 0; i < 3; i++) {
        const result = new ActionResult({
          characterId: character._id,
          actionId: action._id,
          cardsDrawn: [
            { suit: Suit.SPADES, rank: Rank.ACE },
            { suit: Suit.HEARTS, rank: Rank.KING },
            { suit: Suit.CLUBS, rank: Rank.QUEEN },
            { suit: Suit.DIAMONDS, rank: Rank.JACK },
            { suit: Suit.SPADES, rank: Rank.TEN }
          ],
          handRank: HandRank.HIGH_CARD,
          handScore: 1000000,
          handDescription: 'High Card',
          suitBonuses: { spades: 0, hearts: 0, clubs: 0, diamonds: 0 },
          totalScore: 1000000,
          success: i % 2 === 0, // Alternate success/failure
          rewardsGained: {
            xp: i % 2 === 0 ? 100 : 0,
            gold: i % 2 === 0 ? 50 : 0,
            items: []
          }
        });
        await result.save();
      }
    });

    it('should find results by character', async () => {
      const results = await ActionResult.findByCharacter(character._id.toString());
      expect(results.length).toBe(3);
    });

    it('should support pagination in findByCharacter', async () => {
      const results = await ActionResult.findByCharacter(character._id.toString(), 2, 0);
      expect(results.length).toBe(2);
    });

    it('should calculate character stats correctly', async () => {
      const stats = await ActionResult.getCharacterStats(character._id.toString());

      expect(stats.totalActions).toBe(3);
      expect(stats.successCount).toBe(2); // 0, 2 are successful (i % 2 === 0)
      expect(stats.failureCount).toBe(1);
      expect(stats.successRate).toBeCloseTo(66.66, 1);
      expect(stats.totalXpGained).toBe(200); // 2 successes * 100 xp
      expect(stats.totalGoldGained).toBe(100); // 2 successes * 50 gold
    });

    it('should return zero stats for character with no results', async () => {
      const newUser = new User({
        email: 'new@example.com',
        passwordHash: 'hashedpassword123', // User model uses passwordHash field
        emailVerified: true,
        isActive: true
      });
      await newUser.save();

      const newChar = new Character({
        userId: newUser._id,
        name: 'NewHero',
        faction: 'SETTLER_ALLIANCE',
        appearance: {
          bodyType: 'male',
          skinTone: 5,
          facePreset: 1,
          hairStyle: 3,
          hairColor: 2
        },
        currentLocation: 'town_center',
        energy: 150,
        maxEnergy: 150
      });
      await newChar.save();

      const stats = await ActionResult.getCharacterStats(newChar._id.toString());

      expect(stats.totalActions).toBe(0);
      expect(stats.successCount).toBe(0);
      expect(stats.failureCount).toBe(0);
      expect(stats.successRate).toBe(0);
      expect(stats.totalXpGained).toBe(0);
      expect(stats.totalGoldGained).toBe(0);
    });
  });

  describe('ActionResult Instance Methods', () => {
    it('should return safe object', async () => {
      const result = new ActionResult({
        characterId: character._id,
        actionId: action._id,
        cardsDrawn: [
          { suit: Suit.SPADES, rank: Rank.ACE },
          { suit: Suit.HEARTS, rank: Rank.KING },
          { suit: Suit.CLUBS, rank: Rank.QUEEN },
          { suit: Suit.DIAMONDS, rank: Rank.JACK },
          { suit: Suit.SPADES, rank: Rank.TEN }
        ],
        handRank: HandRank.HIGH_CARD,
        handScore: 1000000,
        handDescription: 'High Card, Ace',
        suitBonuses: { spades: 10, hearts: 6, clubs: 8, diamonds: 4 },
        totalScore: 1050000,
        success: true,
        rewardsGained: { xp: 100, gold: 50, items: [] }
      });

      await result.save();
      const safeObject = result.toSafeObject();

      expect(safeObject._id).toBeDefined();
      expect(safeObject.cardsDrawn).toHaveLength(5);
      expect(safeObject.success).toBe(true);
      expect(safeObject.rewardsGained).toBeDefined();
    });
  });
});
