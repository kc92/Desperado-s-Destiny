/**
 * Combat Performance & Load Tests
 * Sprint 4 - Agent 3
 *
 * Performance tests to ensure combat system scales properly
 * Tests concurrent operations, response times, and memory usage
 */

import request from 'supertest';
import app from '../testApp';
import { setupCompleteGameState } from '../helpers/testHelpers';
import { apiPost } from '../helpers/api.helpers';
import { NPC, INPC } from '../../src/models/NPC.model';
import { NPCType } from '@desperados/shared';

describe('Combat Performance Tests', () => {
  // Extended timeout for performance tests
  jest.setTimeout(120000);

  beforeAll(async () => {
    // Create test NPCs
    await NPC.create({
      name: 'Test Bandit',
      type: NPCType.OUTLAW,
      level: 5,
      maxHP: 50,
      difficulty: 3,
      lootTable: {
        goldMin: 10,
        goldMax: 20,
        xpReward: 50,
        items: []
      },
      location: 'Test Location',
      respawnTime: 300,
      description: 'Test NPC',
      isActive: true
    });
  });

  describe('Concurrent Combat Operations', () => {
    it('should handle 10 concurrent combat starts in < 10s', async () => {
      const startTime = Date.now();
      const promises = [];

      // Create 10 characters and start combat simultaneously
      for (let i = 0; i < 10; i++) {
        const promise = (async () => {
          const { token, character } = await setupCompleteGameState(
            app,
            `perf-test-${i}@example.com`
          );

          const npc = await NPC.findOne({ name: 'Test Bandit' });

          return apiPost(
            app,
            '/api/combat/start',
            {
              characterId: character._id,
              npcId: npc?._id.toString()
            },
            token
          );
        })();

        promises.push(promise);
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // All should succeed
      results.forEach(result => {
        expect(result.status).toBe(201);
      });

      // Should complete in under 10 seconds
      expect(duration).toBeLessThan(10000);

      console.log(`10 concurrent combat starts completed in ${duration}ms`);
    }, 15000);

    it('should handle concurrent turns without race conditions', async () => {
      const userCount = 5;
      const encounters: any[] = [];

      // Setup: Create users and start combats
      for (let i = 0; i < userCount; i++) {
        const { token, character } = await setupCompleteGameState(
          app,
          `turn-test-${i}@example.com`
        );

        const npc = await NPC.findOne({ name: 'Test Bandit' });
        const startRes = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: npc?._id.toString()
          },
          token
        );

        encounters.push({
          token,
          encounterId: startRes.body.data.encounter._id,
          characterId: character._id
        });
      }

      // Execute concurrent turns
      const startTime = Date.now();
      const turnPromises = encounters.map(enc =>
        apiPost(
          app,
          '/api/combat/turn',
          { encounterId: enc.encounterId },
          enc.token
        )
      );

      const results = await Promise.all(turnPromises);
      const endTime = Date.now();

      // All should succeed
      results.forEach(result => {
        expect(result.status).toBe(200);
      });

      console.log(`${userCount} concurrent turns completed in ${endTime - startTime}ms`);
    }, 15000);
  });

  describe('Response Time Performance', () => {
    it('should complete combat start in < 1000ms', async () => {
      const { token, character } = await setupCompleteGameState(app);
      const npc = await NPC.findOne({ name: 'Test Bandit' });

      const startTime = Date.now();

      const response = await apiPost(
        app,
        '/api/combat/start',
        {
          characterId: character._id,
          npcId: npc?._id.toString()
        },
        token
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(201);
      expect(duration).toBeLessThan(1000);

      console.log(`Combat start completed in ${duration}ms`);
    });

    it('should complete turn execution in < 500ms', async () => {
      const { token, character } = await setupCompleteGameState(app);
      const npc = await NPC.findOne({ name: 'Test Bandit' });

      const startRes = await apiPost(
        app,
        '/api/combat/start',
        {
          characterId: character._id,
          npcId: npc?._id.toString()
        },
        token
      );

      const encounterId = startRes.body.data.encounter._id;

      const startTime = Date.now();

      const response = await apiPost(
        app,
        '/api/combat/turn',
        { encounterId },
        token
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500);

      console.log(`Combat turn completed in ${duration}ms`);
    });
  });

  describe('Damage Calculation Performance', () => {
    it('should calculate 1000 damage iterations in < 100ms', () => {
      const { CombatService } = require('../../src/services/combat.service');
      const { HandRank } = require('@desperados/shared');

      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        CombatService.calculateDamage(HandRank.PAIR, 10, 5);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100);
      console.log(`1000 damage calculations completed in ${duration}ms`);
    });
  });

  describe('Loot Rolling Performance', () => {
    it('should roll loot 1000 times in < 200ms', () => {
      const { CombatService } = require('../../src/services/combat.service');

      const mockNPC = {
        name: 'Test NPC',
        type: NPCType.OUTLAW,
        level: 5,
        maxHP: 50,
        difficulty: 3,
        lootTable: {
          goldMin: 10,
          goldMax: 20,
          xpReward: 50,
          items: [
            { name: 'Item 1', chance: 0.5, rarity: 'common' },
            { name: 'Item 2', chance: 0.3, rarity: 'uncommon' },
            { name: 'Item 3', chance: 0.1, rarity: 'rare' }
          ]
        }
      };

      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        CombatService.rollLoot(mockNPC);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(200);
      console.log(`1000 loot rolls completed in ${duration}ms`);
    });
  });

  describe('Database Query Performance', () => {
    it('should fetch active NPCs in < 100ms', async () => {
      const startTime = Date.now();

      const npcs = await NPC.findActiveNPCs();

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(npcs).toBeDefined();
      expect(duration).toBeLessThan(100);

      console.log(`Fetched ${npcs.length} NPCs in ${duration}ms`);
    });

    it('should handle 50 sequential combat encounter queries efficiently', async () => {
      const { token, character } = await setupCompleteGameState(app);
      const npc = await NPC.findOne({ name: 'Test Bandit' });

      // Start combat
      const startRes = await apiPost(
        app,
        '/api/combat/start',
        {
          characterId: character._id,
          npcId: npc?._id.toString()
        },
        token
      );

      const encounterId = startRes.body.data.encounter._id;

      const startTime = Date.now();

      // Query encounter 50 times
      const { CombatEncounter } = require('../../src/models/CombatEncounter.model');
      for (let i = 0; i < 50; i++) {
        await CombatEncounter.findById(encounterId);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(500);
      console.log(`50 encounter queries completed in ${duration}ms (avg: ${duration / 50}ms)`);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during 100 damage calculations', () => {
      const { CombatService } = require('../../src/services/combat.service');
      const { HandRank } = require('@desperados/shared');

      const initialMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB

      // Run 100 calculations
      for (let i = 0; i < 100; i++) {
        CombatService.calculateDamage(HandRank.ROYAL_FLUSH, 20, 10);
      }

      const finalMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB
      const memoryIncrease = finalMemory - initialMemory;

      // Should not increase memory by more than 5MB
      expect(memoryIncrease).toBeLessThan(5);

      console.log(`Memory increase after 100 calculations: ${memoryIncrease.toFixed(2)}MB`);
    });
  });

  describe('Scalability Tests', () => {
    it('should maintain performance with 20 active combats', async () => {
      const combatCount = 20;
      const encounters: any[] = [];

      // Create 20 combats
      const setupStart = Date.now();
      for (let i = 0; i < combatCount; i++) {
        const { token, character } = await setupCompleteGameState(
          app,
          `scale-test-${i}@example.com`
        );

        const npc = await NPC.findOne({ name: 'Test Bandit' });
        const startRes = await apiPost(
          app,
          '/api/combat/start',
          {
            characterId: character._id,
            npcId: npc?._id.toString()
          },
          token
        );

        encounters.push({
          token,
          encounterId: startRes.body.data.encounter._id
        });
      }
      const setupEnd = Date.now();

      console.log(`Setup ${combatCount} combats in ${setupEnd - setupStart}ms`);

      // Execute turns concurrently
      const turnStart = Date.now();
      const turnPromises = encounters.map(enc =>
        apiPost(app, '/api/combat/turn', { encounterId: enc.encounterId }, enc.token)
      );

      const results = await Promise.all(turnPromises);
      const turnEnd = Date.now();

      // All should succeed
      results.forEach(result => {
        expect(result.status).toBe(200);
      });

      console.log(`Executed ${combatCount} turns concurrently in ${turnEnd - turnStart}ms`);
    }, 30000);
  });
});
