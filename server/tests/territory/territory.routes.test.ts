/**
 * Territory Routes Tests
 *
 * Integration tests for territory and gang war API endpoints
 */

import { Express } from 'express';
import app from '../testApp';
import { Territory } from '../../src/models/Territory.model';
import { Gang } from '../../src/models/Gang.model';
import { GangWar } from '../../src/models/GangWar.model';
import { Character } from '../../src/models/Character.model';
import { TerritoryService } from '../../src/services/territory.service';
import { apiPost, apiGet, expectSuccess, expectError } from '../helpers/api.helpers';
import { setupCompleteGameState } from '../helpers/testHelpers';
import { clearDatabase } from '../helpers/db.helpers';

describe('Territory Routes', () => {
  let testApp: Express;
  let token: string;
  let characterId: string;
  let gangId: string;

  beforeEach(async () => {
    testApp = app;
    await clearDatabase();
    await TerritoryService.seedTerritories();

    const gameState = await setupCompleteGameState(testApp);
    token = gameState.token;
    characterId = gameState.character._id;

    const character = await Character.findById(characterId);
    character!.dollars = 50000;
    await character!.save();

    const gang = await Gang.create({
      name: 'Test Gang',
      tag: 'TEST',
      leaderId: character!._id,
      memberIds: [character!._id],
      bankBalance: 100000,
      territories: [],
      upgrades: { warChest: 1 },
    });

    gangId = gang._id.toString();
  });

  describe('GET /api/territories', () => {
    it('should list all territories', async () => {
      const res = await apiGet(testApp, '/api/territories', token);

      expectSuccess(res);
      expect(res.body.data.territories).toBeDefined();
      expect(res.body.data.total).toBe(12);
    });

    it('should require authentication', async () => {
      const res = await apiGet(testApp, '/api/territories');

      expectError(res, 401);
    });

    it('should include territory details', async () => {
      const res = await apiGet(testApp, '/api/territories', token);

      expectSuccess(res);
      const territories = res.body.data.territories;
      const redGulch = territories.find((t: typeof Territory.prototype) => t.id === 'red-gulch');

      expect(redGulch).toBeDefined();
      expect(redGulch.name).toBe('Red Gulch');
      expect(redGulch.faction).toBe('SETTLER');
      expect(redGulch.benefits.goldBonus).toBe(10);
      expect(redGulch.difficulty).toBe(3);
    });
  });

  describe('GET /api/territories/stats', () => {
    it('should return territory statistics', async () => {
      const res = await apiGet(testApp, '/api/territories/stats', token);

      expectSuccess(res);
      const stats = res.body.data.stats;

      expect(stats.total).toBe(12);
      expect(stats.controlled).toBe(0);
      expect(stats.available).toBe(12);
      expect(stats.byFaction.SETTLER).toBe(4);
    });
  });

  describe('GET /api/territories/:id', () => {
    it('should get single territory', async () => {
      const res = await apiGet(testApp, '/api/territories/red-gulch', token);

      expectSuccess(res);
      expect(res.body.data.territory.id).toBe('red-gulch');
      expect(res.body.data.territory.name).toBe('Red Gulch');
    });

    it('should return 404 for non-existent territory', async () => {
      const res = await apiGet(testApp, '/api/territories/invalid', token);

      expectError(res, 404);
    });
  });

  describe('POST /api/territories/:id/declare-war', () => {
    it('should declare war successfully', async () => {
      const res = await apiPost(testApp, '/api/territories/red-gulch/declare-war', { funding: 10000 }, token);

      expectSuccess(res, 201);
      expect(res.body.data.war).toBeDefined();
      expect(res.body.data.war.status).toBe('ACTIVE');
      expect(res.body.data.war.attackerFunding).toBe(10000);
    });

    it('should reject war with insufficient funding', async () => {
      const res = await apiPost(testApp, '/api/territories/red-gulch/declare-war', { funding: 500 }, token);

      expectError(res, 400);
      expect(res.body.error).toContain('1000');
    });

    it('should reject war from non-gang-leader', async () => {
      const memberState = await setupCompleteGameState(testApp, `member-${Date.now()}@example.com`);
      const member = await Character.findById(memberState.character._id);

      const gang = await Gang.findById(gangId);
      gang!.memberIds.push(member!._id);
      await gang!.save();

      const res = await apiPost(
        testApp,
        '/api/territories/red-gulch/declare-war',
        { funding: 10000 },
        memberState.token
      );

      expectError(res, 403);
      expect(res.body.error).toContain('gang leader');
    });

    it('should require authentication', async () => {
      const res = await apiPost(testApp, '/api/territories/red-gulch/declare-war', { funding: 10000 });

      expectError(res, 401);
    });

    it('should reject war on already-sieged territory', async () => {
      await apiPost(testApp, '/api/territories/red-gulch/declare-war', { funding: 10000 }, token);

      const gang2State = await setupCompleteGameState(testApp, `gang2-${Date.now()}@example.com`);
      const gang2Character = await Character.findById(gang2State.character._id);

      const gang2 = await Gang.create({
        name: 'Gang 2',
        tag: 'G2',
        leaderId: gang2Character!._id,
        memberIds: [gang2Character!._id],
        bankBalance: 100000,
        upgrades: { warChest: 1 },
      });

      const res = await apiPost(
        testApp,
        '/api/territories/red-gulch/declare-war',
        { funding: 10000 },
        gang2State.token
      );

      expectError(res, 400);
      expect(res.body.error).toContain('siege');
    });
  });

  describe('GET /api/territories/:id/wars', () => {
    it('should get war history for territory', async () => {
      const res = await apiGet(testApp, '/api/territories/red-gulch/wars', token);

      expectSuccess(res);
      expect(res.body.data.wars).toBeDefined();
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should paginate war history', async () => {
      const res = await apiGet(testApp, '/api/territories/red-gulch/wars?limit=5&offset=0', token);

      expectSuccess(res);
      expect(res.body.data.pagination.limit).toBe(5);
      expect(res.body.data.pagination.offset).toBe(0);
    });
  });

  describe('GET /api/territories/:id/history', () => {
    it('should get conquest history', async () => {
      const res = await apiGet(testApp, '/api/territories/red-gulch/history', token);

      expectSuccess(res);
      expect(res.body.data.history).toBeDefined();
      expect(Array.isArray(res.body.data.history)).toBe(true);
    });
  });

  describe('GET /api/wars', () => {
    it('should list all active wars', async () => {
      await apiPost(testApp, '/api/territories/red-gulch/declare-war', { funding: 10000 }, token);

      const res = await apiGet(testApp, '/api/wars', token);

      expectSuccess(res);
      expect(res.body.data.wars).toBeDefined();
      expect(res.body.data.total).toBe(1);
    });

    it('should require authentication', async () => {
      const res = await apiGet(testApp, '/api/wars');

      expectError(res, 401);
    });
  });

  describe('POST /api/wars/:id/contribute', () => {
    let warId: string;

    beforeEach(async () => {
      const declareRes = await apiPost(
        testApp,
        '/api/territories/red-gulch/declare-war',
        { funding: 10000 },
        token
      );
      warId = declareRes.body.data.war._id;
    });

    it('should contribute to war successfully', async () => {
      const res = await apiPost(testApp, `/api/wars/${warId}/contribute`, { amount: 5000 }, token);

      expectSuccess(res);
      expect(res.body.data.war.attackerFunding).toBe(15000);
    });

    it('should reject contribution with insufficient gold', async () => {
      const character = await Character.findById(characterId);
      character!.dollars = 100;
      await character!.save();

      const res = await apiPost(testApp, `/api/wars/${warId}/contribute`, { amount: 5000 }, token);

      expectError(res, 400);
      expect(res.body.error).toContain('Insufficient');
    });

    it('should reject negative contribution', async () => {
      const res = await apiPost(testApp, `/api/wars/${warId}/contribute`, { amount: -100 }, token);

      expectError(res, 400);
      expect(res.body.error).toContain('positive');
    });

    it('should require authentication', async () => {
      const res = await apiPost(testApp, `/api/wars/${warId}/contribute`, { amount: 5000 });

      expectError(res, 401);
    });
  });

  describe('GET /api/wars/:id', () => {
    let warId: string;

    beforeEach(async () => {
      const declareRes = await apiPost(
        testApp,
        '/api/territories/red-gulch/declare-war',
        { funding: 10000 },
        token
      );
      warId = declareRes.body.data.war._id;
    });

    it('should get war by ID', async () => {
      const res = await apiGet(testApp, `/api/wars/${warId}`, token);

      expectSuccess(res);
      expect(res.body.data.war._id).toBe(warId);
      expect(res.body.data.war.status).toBe('ACTIVE');
    });

    it('should return 404 for non-existent war', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await apiGet(testApp, `/api/wars/${fakeId}`, token);

      expectError(res, 404);
    });
  });

  describe('POST /api/wars/:id/resolve', () => {
    let warId: string;

    beforeEach(async () => {
      const declareRes = await apiPost(
        testApp,
        '/api/territories/red-gulch/declare-war',
        { funding: 10000 },
        token
      );
      warId = declareRes.body.data.war._id;
    });

    it('should manually resolve war', async () => {
      const res = await apiPost(testApp, `/api/wars/${warId}/resolve`, {}, token);

      expectSuccess(res);
      expect(res.body.data.war.status).not.toBe('ACTIVE');
      expect(res.body.data.territory).toBeDefined();
    });

    it('should return 400 for already resolved war', async () => {
      await apiPost(testApp, `/api/wars/${warId}/resolve`, {}, token);

      const res = await apiPost(testApp, `/api/wars/${warId}/resolve`, {}, token);

      expectError(res, 400);
    });
  });
});
