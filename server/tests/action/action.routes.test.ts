/**
 * Action Routes Tests
 *
 * Tests for GET endpoints for actions and action history
 */

import { Express } from 'express';
import app from '../testApp';
import { Action, ActionType } from '../../src/models/Action.model';
import { ActionResult } from '../../src/models/ActionResult.model';
import { Character } from '../../src/models/Character.model';
import { apiPost, apiGet, expectSuccess, expectError } from '../helpers/api.helpers';
import { setupCompleteGameState } from '../helpers/testHelpers';

describe('Action Routes', () => {
  let testApp: Express;
  let token: string;
  let characterId: string;

  beforeEach(async () => {
    testApp = app;

    // Setup complete game state (user + character)
    const gameState = await setupCompleteGameState(testApp);
    token = gameState.token;
    characterId = gameState.character._id;

    // Seed starter actions
    await Action.seedStarterActions();
  });

  describe('GET /api/actions - List All Actions', () => {
    it('should return all active actions', async () => {
      const res = await apiGet(testApp, '/api/actions', token);

      expectSuccess(res);
      expect(res.body.data.actions).toBeDefined();
      expect(res.body.data.total).toBeGreaterThan(0);
    });

    it('should group actions by type', async () => {
      const res = await apiGet(testApp, '/api/actions', token);

      expectSuccess(res);
      const actions = res.body.data.actions;

      expect(actions[ActionType.CRIME]).toBeDefined();
      expect(actions[ActionType.COMBAT]).toBeDefined();
      expect(actions[ActionType.CRAFT]).toBeDefined();
      expect(actions[ActionType.SOCIAL]).toBeDefined();

      expect(Array.isArray(actions[ActionType.CRIME])).toBe(true);
      expect(Array.isArray(actions[ActionType.COMBAT])).toBe(true);
      expect(Array.isArray(actions[ActionType.CRAFT])).toBe(true);
      expect(Array.isArray(actions[ActionType.SOCIAL])).toBe(true);
    });

    it('should include all required action fields', async () => {
      const res = await apiGet(testApp, '/api/actions', token);

      expectSuccess(res);
      const actions = res.body.data.actions;

      // Get first action from any type
      const allActions = [
        ...actions[ActionType.CRIME],
        ...actions[ActionType.COMBAT],
        ...actions[ActionType.CRAFT],
        ...actions[ActionType.SOCIAL]
      ];

      expect(allActions.length).toBeGreaterThan(0);

      const action = allActions[0];
      expect(action._id).toBeDefined();
      expect(action.type).toBeDefined();
      expect(action.name).toBeDefined();
      expect(action.description).toBeDefined();
      expect(action.energyCost).toBeDefined();
      expect(action.difficulty).toBeDefined();
      expect(action.rewards).toBeDefined();
      expect(action.rewards.xp).toBeDefined();
      expect(action.rewards.gold).toBeDefined();
    });

    it('should require authentication', async () => {
      const res = await apiGet(testApp, '/api/actions');

      expectError(res, 401);
    });

    it('should only return active actions', async () => {
      // Deactivate one action
      const actions = await Action.findActiveActions();
      const firstAction = actions[0];
      firstAction.isActive = false;
      await firstAction.save();

      const res = await apiGet(testApp, '/api/actions', token);

      expectSuccess(res);
      const returnedActions = [
        ...res.body.data.actions[ActionType.CRIME],
        ...res.body.data.actions[ActionType.COMBAT],
        ...res.body.data.actions[ActionType.CRAFT],
        ...res.body.data.actions[ActionType.SOCIAL]
      ];

      // Should not include deactivated action
      const deactivatedFound = returnedActions.find(
        (a: any) => a._id === firstAction._id.toString()
      );
      expect(deactivatedFound).toBeUndefined();
    });
  });

  describe('GET /api/actions/:id - Get Single Action', () => {
    it('should return single action by ID', async () => {
      const actions = await Action.findActiveActions();
      const actionId = actions[0]._id.toString();

      const res = await apiGet(testApp, `/api/actions/${actionId}`, token);

      expectSuccess(res);
      expect(res.body.data.action).toBeDefined();
      expect(res.body.data.action._id).toBe(actionId);
    });

    it('should include all action details', async () => {
      const actions = await Action.findActiveActions();
      const actionId = actions[0]._id.toString();

      const res = await apiGet(testApp, `/api/actions/${actionId}`, token);

      expectSuccess(res);
      const action = res.body.data.action;

      expect(action._id).toBe(actionId);
      expect(action.type).toBeDefined();
      expect(action.name).toBeDefined();
      expect(action.description).toBeDefined();
      expect(action.energyCost).toBeGreaterThan(0);
      expect(action.difficulty).toBeGreaterThan(0);
      expect(action.rewards).toBeDefined();
    });

    it('should return 404 for non-existent action', async () => {
      const res = await apiGet(testApp, '/api/actions/507f1f77bcf86cd799439011', token);

      expectError(res, 404);
      expect(res.body.error).toContain('Action not found');
    });

    it('should return 404 for inactive action', async () => {
      const actions = await Action.findActiveActions();
      const action = actions[0];
      action.isActive = false;
      await action.save();

      const res = await apiGet(testApp, `/api/actions/${action._id}`, token);

      expectError(res, 404);
    });

    it('should require authentication', async () => {
      const actions = await Action.findActiveActions();
      const actionId = actions[0]._id.toString();

      const res = await apiGet(testApp, `/api/actions/${actionId}`);

      expectError(res, 401);
    });
  });

  describe('GET /api/actions/history/:characterId - Get Action History', () => {
    beforeEach(async () => {
      // Perform some actions to create history
      const actions = await Action.findActiveActions();
      const actionId = actions[0]._id.toString();

      // Perform 3 challenges
      for (let i = 0; i < 3; i++) {
        await apiPost(
          testApp,
          '/api/actions/challenge',
          {
            actionId,
            characterId
          },
          token
        );

        // Restore energy
        const char = await Character.findById(characterId);
        if (char) {
          char.energy = 150;
          await char.save();
        }
      }
    });

    it('should return action history for character', async () => {
      const res = await apiGet(testApp, `/api/actions/history/${characterId}`, token);

      expectSuccess(res);
      expect(res.body.data.history).toBeDefined();
      expect(res.body.data.history.length).toBe(3);
    });

    it('should include action result details', async () => {
      const res = await apiGet(testApp, `/api/actions/history/${characterId}`, token);

      expectSuccess(res);
      const history = res.body.data.history;

      expect(history.length).toBeGreaterThan(0);
      const result = history[0];

      expect(result.cardsDrawn).toHaveLength(5);
      expect(result.handRank).toBeDefined();
      expect(result.handScore).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.rewardsGained).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should include character statistics', async () => {
      const res = await apiGet(testApp, `/api/actions/history/${characterId}`, token);

      expectSuccess(res);
      expect(res.body.data.stats).toBeDefined();

      const stats = res.body.data.stats;
      expect(stats.totalActions).toBe(3);
      expect(stats.successCount).toBeDefined();
      expect(stats.failureCount).toBeDefined();
      expect(stats.successRate).toBeDefined();
      expect(stats.totalXpGained).toBeDefined();
      expect(stats.totalGoldGained).toBeDefined();
    });

    it('should return history in descending order (newest first)', async () => {
      const res = await apiGet(testApp, `/api/actions/history/${characterId}`, token);

      expectSuccess(res);
      const history = res.body.data.history;

      if (history.length > 1) {
        const first = new Date(history[0].timestamp).getTime();
        const second = new Date(history[1].timestamp).getTime();
        expect(first).toBeGreaterThanOrEqual(second);
      }
    });

    it('should support pagination', async () => {
      const res = await apiGet(testApp, `/api/actions/history/${characterId}?page=1&limit=2`, token);

      expectSuccess(res);
      expect(res.body.data.history.length).toBeLessThanOrEqual(2);
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(2);
      expect(res.body.data.pagination.total).toBe(3);
    });

    it('should return empty array for character with no history', async () => {
      // Create new character
      const gameState = await setupCompleteGameState(testApp, 'new@example.com');

      const res = await apiGet(testApp, `/api/actions/history/${gameState.character._id}`, gameState.token);

      expectSuccess(res);
      expect(res.body.data.history).toEqual([]);
      expect(res.body.data.stats.totalActions).toBe(0);
    });

    it('should require authentication', async () => {
      const res = await apiGet(testApp, `/api/actions/history/${characterId}`);

      expectError(res, 401);
    });

    it('should verify character ownership', async () => {
      // Create another user
      const otherUser = await setupCompleteGameState(testApp, 'other@example.com');

      // Try to access first user's character history
      const res = await apiGet(testApp, `/api/actions/history/${characterId}`, otherUser.token);

      expectError(res, 403);
      expect(res.body.error).toContain('do not own');
    });

    it('should return 404 for non-existent character', async () => {
      const res = await apiGet(testApp, '/api/actions/history/507f1f77bcf86cd799439011', token);

      expectError(res, 404);
      expect(res.body.error).toContain('Character not found');
    });
  });

  describe('Action System Integration', () => {
    it('should have at least 10 starter actions', async () => {
      const actions = await Action.findActiveActions();
      expect(actions.length).toBeGreaterThanOrEqual(10);
    });

    it('should have actions covering all 4 types', async () => {
      const crimeActions = await Action.find({ type: ActionType.CRIME, isActive: true });
      const combatActions = await Action.find({ type: ActionType.COMBAT, isActive: true });
      const craftActions = await Action.find({ type: ActionType.CRAFT, isActive: true });
      const socialActions = await Action.find({ type: ActionType.SOCIAL, isActive: true });

      expect(crimeActions.length).toBeGreaterThan(0);
      expect(combatActions.length).toBeGreaterThan(0);
      expect(craftActions.length).toBeGreaterThan(0);
      expect(socialActions.length).toBeGreaterThan(0);
    });

    it('should have actions with varying difficulties', async () => {
      const actions = await Action.findActiveActions();
      const difficulties = actions.map(a => a.difficulty);

      const minDifficulty = Math.min(...difficulties);
      const maxDifficulty = Math.max(...difficulties);

      expect(minDifficulty).toBeLessThan(50);
      expect(maxDifficulty).toBeGreaterThan(50);
    });

    it('should have actions with varying energy costs', async () => {
      const actions = await Action.findActiveActions();
      const costs = actions.map(a => a.energyCost);

      const minCost = Math.min(...costs);
      const maxCost = Math.max(...costs);

      expect(minCost).toBeLessThan(20);
      expect(maxCost).toBeGreaterThan(20);
    });
  });
});
