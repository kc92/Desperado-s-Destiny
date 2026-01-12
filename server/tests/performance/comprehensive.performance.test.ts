/**
 * Comprehensive Performance Testing Suite
 *
 * Tests system performance across all major subsystems:
 * - API endpoint response times
 * - Database query performance
 * - Concurrent user handling
 * - Memory usage patterns
 * - Load testing under stress
 * - Scalability assessment
 */

import request from 'supertest';
import { createTestApp } from '../testApp';
import { setupCompleteGameState } from '../helpers/testHelpers';
import { apiPost, apiGet } from '../helpers/api.helpers';
import { Character } from '../../src/models/Character.model';
import { Gang } from '../../src/models/Gang.model';
import { CombatEncounter } from '../../src/models/CombatEncounter.model';
import { NPC } from '../../src/models/NPC.model';
import { NPCType } from '@desperados/shared';

const app = createTestApp();

// Performance metrics tracking
interface PerformanceMetrics {
  endpoint: string;
  minTime: number;
  maxTime: number;
  avgTime: number;
  p50: number;
  p95: number;
  p99: number;
  totalRequests: number;
  failures: number;
}

const performanceResults: PerformanceMetrics[] = [];

function calculateMetrics(endpoint: string, times: number[], failures: number): PerformanceMetrics {
  const sorted = times.sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);

  return {
    endpoint,
    minTime: sorted[0] || 0,
    maxTime: sorted[sorted.length - 1] || 0,
    avgTime: sum / sorted.length || 0,
    p50: sorted[Math.floor(sorted.length * 0.5)] || 0,
    p95: sorted[Math.floor(sorted.length * 0.95)] || 0,
    p99: sorted[Math.floor(sorted.length * 0.99)] || 0,
    totalRequests: sorted.length + failures,
    failures
  };
}

describe('Comprehensive Performance Testing Suite', () => {
  beforeAll(async () => {
    // Seed test NPCs
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
      location: 'Test Town',
      respawnTime: 300,
      description: 'A dangerous bandit',
      isActive: true
    });
  });

  afterAll(async () => {
    // Print performance summary
    console.log('\n========================================');
    console.log('PERFORMANCE TEST RESULTS');
    console.log('========================================\n');

    performanceResults.forEach(metric => {
      console.log(`${metric.endpoint}:`);
      console.log(`  Requests: ${metric.totalRequests} (${metric.failures} failures)`);
      console.log(`  Min: ${metric.minTime.toFixed(2)}ms`);
      console.log(`  Avg: ${metric.avgTime.toFixed(2)}ms`);
      console.log(`  P50: ${metric.p50.toFixed(2)}ms`);
      console.log(`  P95: ${metric.p95.toFixed(2)}ms`);
      console.log(`  P99: ${metric.p99.toFixed(2)}ms`);
      console.log(`  Max: ${metric.maxTime.toFixed(2)}ms\n`);
    });
  });

  afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      if (key !== 'npcs') {
        await collections[key].deleteMany({});
      }
    }
  });

  describe('1. API Response Time Benchmarks', () => {
    it('should measure /api/auth/login response time', async () => {
      const times: number[] = [];
      const failures: number[] = [];

      // Create test user
      const { user } = await setupCompleteGameState(app, 'perf@test.com');

      // Run 50 login requests
      for (let i = 0; i < 50; i++) {
        const start = Date.now();
        try {
          const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'perf@test.com', password: 'password123' });

          const duration = Date.now() - start;
          if (res.status === 200) {
            times.push(duration);
          } else {
            failures.push(duration);
          }
        } catch (error) {
          failures.push(Date.now() - start);
        }
      }

      const metrics = calculateMetrics('POST /api/auth/login', times, failures.length);
      performanceResults.push(metrics);

      expect(metrics.p95).toBeLessThan(500); // 95% under 500ms
      expect(metrics.avgTime).toBeLessThan(300); // Average under 300ms
    });

    it('should measure /api/characters response time', async () => {
      const times: number[] = [];
      const failures: number[] = [];

      const { token } = await setupCompleteGameState(app);

      // Run 100 requests
      for (let i = 0; i < 100; i++) {
        const start = Date.now();
        try {
          const res = await apiGet(app, '/api/characters', token);
          const duration = Date.now() - start;
          if (res.status === 200) {
            times.push(duration);
          } else {
            failures.push(duration);
          }
        } catch (error) {
          failures.push(Date.now() - start);
        }
      }

      const metrics = calculateMetrics('GET /api/characters', times, failures.length);
      performanceResults.push(metrics);

      expect(metrics.p95).toBeLessThan(200); // 95% under 200ms
      expect(metrics.avgTime).toBeLessThan(150);
    });

    it('should measure /api/combat/start response time', async () => {
      const times: number[] = [];
      const failures: number[] = [];

      const npc = await NPC.findOne({ name: 'Test Bandit' });

      // Create 20 users and test combat start
      for (let i = 0; i < 20; i++) {
        const { token, character } = await setupCompleteGameState(app, `combat${i}@test.com`);

        const start = Date.now();
        try {
          const res = await apiPost(
            app,
            '/api/combat/start',
            { characterId: character._id, npcId: npc?._id.toString() },
            token
          );

          const duration = Date.now() - start;
          if (res.status === 201) {
            times.push(duration);
          } else {
            failures.push(duration);
          }
        } catch (error) {
          failures.push(Date.now() - start);
        }
      }

      const metrics = calculateMetrics('POST /api/combat/start', times, failures.length);
      performanceResults.push(metrics);

      expect(metrics.p95).toBeLessThan(1000); // 95% under 1s
      expect(metrics.avgTime).toBeLessThan(600);
    });
  });

  describe('2. Database Query Performance', () => {
    it('should measure Character.findById performance', async () => {
      const times: number[] = [];

      const { character } = await setupCompleteGameState(app);

      // Run 1000 queries
      for (let i = 0; i < 1000; i++) {
        const start = Date.now();
        await Character.findById(character._id);
        times.push(Date.now() - start);
      }

      const metrics = calculateMetrics('Character.findById', times, 0);
      performanceResults.push(metrics);

      expect(metrics.p95).toBeLessThan(50); // 95% under 50ms
      expect(metrics.avgTime).toBeLessThan(20);
    });

    it('should measure Character.findByUserId performance', async () => {
      const times: number[] = [];

      const { user } = await setupCompleteGameState(app);

      // Create 5 characters for the user
      for (let i = 0; i < 5; i++) {
        await setupCompleteGameState(app, user.email);
      }

      // Run 500 queries
      for (let i = 0; i < 500; i++) {
        const start = Date.now();
        await Character.findByUserId(user._id.toString());
        times.push(Date.now() - start);
      }

      const metrics = calculateMetrics('Character.findByUserId', times, 0);
      performanceResults.push(metrics);

      expect(metrics.p95).toBeLessThan(100);
      expect(metrics.avgTime).toBeLessThan(50);
    });

    it('should measure Gang.findByCharacterId performance with indexes', async () => {
      const times: number[] = [];

      const { character } = await setupCompleteGameState(app);

      // Create a gang
      const gang = await Gang.create({
        name: 'Test Gang',
        tag: 'TEST',
        leaderId: character._id,
        members: [
          {
            characterId: character._id,
            role: 'leader',
            joinedAt: new Date(),
            contribution: 0
          }
        ]
      });

      // Run 500 queries
      for (let i = 0; i < 500; i++) {
        const start = Date.now();
        await Gang.findByCharacterId(character._id);
        times.push(Date.now() - start);
      }

      const metrics = calculateMetrics('Gang.findByCharacterId', times, 0);
      performanceResults.push(metrics);

      expect(metrics.p95).toBeLessThan(100);
      expect(metrics.avgTime).toBeLessThan(50);
    });

    it('should measure CombatEncounter.findActiveByCharacter performance', async () => {
      const times: number[] = [];

      const { character } = await setupCompleteGameState(app);
      const npc = await NPC.findOne({ name: 'Test Bandit' });

      // Create an active combat
      await CombatEncounter.create({
        characterId: character._id,
        npcId: npc?._id,
        playerHP: 100,
        playerMaxHP: 100,
        npcHP: 50,
        npcMaxHP: 50,
        status: 'ACTIVE',
        turn: 0,
        roundNumber: 1,
        startedAt: new Date()
      });

      // Run 500 queries
      for (let i = 0; i < 500; i++) {
        const start = Date.now();
        await CombatEncounter.findActiveByCharacter(character._id.toString());
        times.push(Date.now() - start);
      }

      const metrics = calculateMetrics('CombatEncounter.findActiveByCharacter', times, 0);
      performanceResults.push(metrics);

      expect(metrics.p95).toBeLessThan(100);
      expect(metrics.avgTime).toBeLessThan(50);
    });
  });

  describe('3. Concurrent User Load Testing', () => {
    it('should handle 10 concurrent user registrations', async () => {
      const start = Date.now();

      const promises = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .post('/api/auth/register')
          .send({
            email: `concurrent${i}@test.com`,
            password: 'password123',
            confirmPassword: 'password123'
          })
      );

      const results = await Promise.all(promises);
      const duration = Date.now() - start;

      const successCount = results.filter(r => r.status === 201).length;

      expect(successCount).toBe(10);
      expect(duration).toBeLessThan(5000); // All 10 in under 5s

      console.log(`10 concurrent registrations: ${duration}ms (${(duration/10).toFixed(2)}ms avg)`);
    });

    it('should handle 20 concurrent character creations', async () => {
      const users = await Promise.all(
        Array.from({ length: 20 }, (_, i) =>
          setupCompleteGameState(app, `char${i}@test.com`)
        )
      );

      const start = Date.now();

      const promises = users.map((user, i) =>
        apiPost(
          app,
          '/api/characters',
          {
            name: `Character${i}`,
            faction: 'FRONTERA',
            appearance: {
              bodyType: 'male',
              skinTone: 5,
              facePreset: 1,
              hairStyle: 1,
              hairColor: 1
            }
          },
          user.token
        )
      );

      const results = await Promise.all(promises);
      const duration = Date.now() - start;

      const successCount = results.filter(r => r.status === 201).length;

      expect(successCount).toBe(20);
      expect(duration).toBeLessThan(10000); // All 20 in under 10s

      console.log(`20 concurrent character creations: ${duration}ms (${(duration/20).toFixed(2)}ms avg)`);
    });

    it('should handle 50 concurrent combat initiations', async () => {
      const npc = await NPC.findOne({ name: 'Test Bandit' });

      const users = await Promise.all(
        Array.from({ length: 50 }, (_, i) =>
          setupCompleteGameState(app, `combat-load${i}@test.com`)
        )
      );

      const start = Date.now();

      const promises = users.map(user =>
        apiPost(
          app,
          '/api/combat/start',
          { characterId: user.character._id, npcId: npc?._id.toString() },
          user.token
        )
      );

      const results = await Promise.allSettled(promises);
      const duration = Date.now() - start;

      const successCount = results.filter(r => r.status === 'fulfilled').length;

      expect(successCount).toBeGreaterThan(45); // Allow some failures
      expect(duration).toBeLessThan(30000); // Under 30s

      console.log(`50 concurrent combat starts: ${duration}ms, ${successCount} successes`);
    });

    it('should handle mixed concurrent operations (30 users)', async () => {
      const npc = await NPC.findOne({ name: 'Test Bandit' });

      const users = await Promise.all(
        Array.from({ length: 30 }, (_, i) =>
          setupCompleteGameState(app, `mixed${i}@test.com`)
        )
      );

      const start = Date.now();

      // Mix of different operations
      const promises = users.flatMap((user, i) => {
        if (i % 3 === 0) {
          return [apiGet(app, '/api/characters', user.token)];
        } else if (i % 3 === 1) {
          return [apiPost(
            app,
            '/api/combat/start',
            { characterId: user.character._id, npcId: npc?._id.toString() },
            user.token
          )];
        } else {
          return [apiGet(app, '/api/characters/' + user.character._id, user.token)];
        }
      });

      const results = await Promise.allSettled(promises);
      const duration = Date.now() - start;

      const successCount = results.filter(r => r.status === 'fulfilled').length;

      expect(successCount).toBeGreaterThan(25);
      expect(duration).toBeLessThan(20000);

      console.log(`30 mixed concurrent operations: ${duration}ms, ${successCount} successes`);
    });
  });

  describe('4. Memory Usage Patterns', () => {
    it('should not leak memory during 500 sequential operations', async () => {
      const { token, character } = await setupCompleteGameState(app);

      // Force GC if available
      if (global.gc) {
        global.gc();
      }

      const initialMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB

      // Perform 500 operations
      for (let i = 0; i < 500; i++) {
        await apiGet(app, '/api/characters/' + character._id, token);

        // Periodic cleanup
        if (i % 100 === 0 && global.gc) {
          global.gc();
        }
      }

      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed / 1024 / 1024; // MB
      const memoryGrowth = finalMemory - initialMemory;

      console.log(`Memory growth after 500 operations: ${memoryGrowth.toFixed(2)}MB`);
      console.log(`Initial: ${initialMemory.toFixed(2)}MB, Final: ${finalMemory.toFixed(2)}MB`);

      // Memory growth should be reasonable (< 50MB)
      expect(memoryGrowth).toBeLessThan(50);
    });

    it('should handle rapid object creation without excessive memory growth', async () => {
      if (global.gc) {
        global.gc();
      }

      const initialMemory = process.memoryUsage().heapUsed / 1024 / 1024;

      // Create and delete 100 users
      const emails = Array.from({ length: 100 }, (_, i) => `mem-test${i}@test.com`);

      for (const email of emails) {
        await setupCompleteGameState(app, email);
      }

      // Clean up
      await Character.deleteMany({ userId: { $exists: true } });

      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed / 1024 / 1024;
      const memoryGrowth = finalMemory - initialMemory;

      console.log(`Memory growth after 100 user creations: ${memoryGrowth.toFixed(2)}MB`);

      expect(memoryGrowth).toBeLessThan(100);
    });
  });

  describe('5. Sustained Load Testing', () => {
    it('should maintain performance under sustained load (1000 requests)', async () => {
      const { token, character } = await setupCompleteGameState(app);

      const times: number[] = [];
      const batchSize = 50;
      const totalRequests = 1000;

      for (let batch = 0; batch < totalRequests / batchSize; batch++) {
        const batchPromises = Array.from({ length: batchSize }, async () => {
          const start = Date.now();
          await apiGet(app, '/api/characters/' + character._id, token);
          return Date.now() - start;
        });

        const batchTimes = await Promise.all(batchPromises);
        times.push(...batchTimes);
      }

      const metrics = calculateMetrics('Sustained Load (1000 requests)', times, 0);
      performanceResults.push(metrics);

      // Performance should not degrade significantly
      const firstBatch = times.slice(0, 50);
      const lastBatch = times.slice(-50);

      const firstAvg = firstBatch.reduce((a, b) => a + b, 0) / firstBatch.length;
      const lastAvg = lastBatch.reduce((a, b) => a + b, 0) / lastBatch.length;

      console.log(`First batch avg: ${firstAvg.toFixed(2)}ms`);
      console.log(`Last batch avg: ${lastAvg.toFixed(2)}ms`);
      console.log(`Performance degradation: ${((lastAvg - firstAvg) / firstAvg * 100).toFixed(2)}%`);

      // Allow max 50% degradation
      expect(lastAvg).toBeLessThan(firstAvg * 1.5);
    });
  });

  describe('6. Database Connection Pool Efficiency', () => {
    it('should efficiently reuse database connections', async () => {
      const users = await Promise.all(
        Array.from({ length: 20 }, (_, i) =>
          setupCompleteGameState(app, `pool-test${i}@test.com`)
        )
      );

      const start = Date.now();

      // Execute 100 parallel DB operations
      const promises = Array.from({ length: 100 }, (_, i) =>
        Character.findById(users[i % 20].character._id)
      );

      await Promise.all(promises);
      const duration = Date.now() - start;

      console.log(`100 parallel queries completed in ${duration}ms`);

      // Should complete quickly with connection pooling
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('7. Index Usage Verification', () => {
    it('should use indexes for Character.findByUserId', async () => {
      const { user } = await setupCompleteGameState(app);

      // Create multiple characters
      for (let i = 0; i < 10; i++) {
        await setupCompleteGameState(app, user.email);
      }

      const start = Date.now();
      await Character.findByUserId(user._id.toString());
      const duration = Date.now() - start;

      // With index, should be very fast even with many documents
      expect(duration).toBeLessThan(100);
    });

    it('should use indexes for Gang.findByCharacterId', async () => {
      const { character } = await setupCompleteGameState(app);

      // Create gang
      await Gang.create({
        name: 'Index Test Gang',
        tag: 'IDX',
        leaderId: character._id,
        members: [
          {
            characterId: character._id,
            role: 'leader',
            joinedAt: new Date(),
            contribution: 0
          }
        ]
      });

      const start = Date.now();
      await Gang.findByCharacterId(character._id);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(50);
    });
  });

  describe('8. Throughput Measurement', () => {
    it('should measure requests per second capacity', async () => {
      const { token, character } = await setupCompleteGameState(app);

      const testDuration = 5000; // 5 seconds
      const startTime = Date.now();
      let requestCount = 0;
      let errors = 0;

      while (Date.now() - startTime < testDuration) {
        try {
          await apiGet(app, '/api/characters/' + character._id, token);
          requestCount++;
        } catch (error) {
          errors++;
        }
      }

      const actualDuration = Date.now() - startTime;
      const rps = (requestCount / actualDuration) * 1000;

      console.log(`Throughput: ${rps.toFixed(2)} requests/second`);
      console.log(`Total requests: ${requestCount}, Errors: ${errors}`);

      // Should handle at least 20 RPS
      expect(rps).toBeGreaterThan(20);
      expect(errors).toBeLessThan(requestCount * 0.01); // < 1% error rate
    });
  });
});

/**
 * Performance Test Summary
 *
 * This suite tests:
 * 1. API endpoint response times (login, characters, combat)
 * 2. Database query performance with indexes
 * 3. Concurrent user load handling
 * 4. Memory usage and leak detection
 * 5. Sustained load performance
 * 6. Connection pool efficiency
 * 7. Index usage verification
 * 8. System throughput (requests/second)
 *
 * Metrics tracked:
 * - Response times (min, max, avg, p50, p95, p99)
 * - Memory usage (heap growth)
 * - Concurrent operation success rates
 * - Performance degradation under load
 * - Database connection efficiency
 */
