/**
 * Load Testing Script
 *
 * Simulates realistic load with concurrent users performing various operations
 * Run with: ts-node server/tests/performance/load-test.ts
 */

import request from 'supertest';
import { app } from '../../src/server';

interface LoadTestConfig {
  totalUsers: number;
  duration: number; // milliseconds
  rampUpTime: number; // milliseconds
  operations: OperationType[];
}

type OperationType = 'login' | 'getCharacters' | 'combat' | 'gang' | 'mixed';

interface LoadTestResult {
  operation: string;
  totalRequests: number;
  successful: number;
  failed: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p95ResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
}

class LoadTester {
  private config: LoadTestConfig;
  private results: Map<string, number[]> = new Map();
  private errors: Map<string, number> = new Map();
  private startTime: number = 0;

  constructor(config: LoadTestConfig) {
    this.config = config;
  }

  private async simulateUser(userId: number): Promise<void> {
    const operations = this.config.operations;

    // Random operation selection
    const operation = operations[Math.floor(Math.random() * operations.length)];

    const startTime = Date.now();
    let success = false;

    try {
      switch (operation) {
        case 'login':
          await this.performLogin(userId);
          success = true;
          break;
        case 'getCharacters':
          await this.performGetCharacters(userId);
          success = true;
          break;
        case 'combat':
          await this.performCombat(userId);
          success = true;
          break;
        case 'gang':
          await this.performGangOperation(userId);
          success = true;
          break;
        case 'mixed':
          await this.performMixedOperations(userId);
          success = true;
          break;
      }

      const duration = Date.now() - startTime;
      this.recordResult(operation, duration);
    } catch (error) {
      this.recordError(operation);
    }
  }

  private async performLogin(userId: number): Promise<void> {
    await request(app)
      .post('/api/auth/login')
      .send({
        email: `loadtest${userId}@test.com`,
        password: 'password123'
      });
  }

  private async performGetCharacters(userId: number): Promise<void> {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: `loadtest${userId}@test.com`,
        password: 'password123'
      });

    const token = loginRes.body.data?.token;

    await request(app)
      .get('/api/characters')
      .set('Authorization', `Bearer ${token}`);
  }

  private async performCombat(userId: number): Promise<void> {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: `loadtest${userId}@test.com`,
        password: 'password123'
      });

    const token = loginRes.body.data?.token;

    const charactersRes = await request(app)
      .get('/api/characters')
      .set('Authorization', `Bearer ${token}`);

    if (charactersRes.body.data?.characters?.length > 0) {
      const characterId = charactersRes.body.data.characters[0]._id;

      await request(app)
        .post('/api/combat/start')
        .set('Authorization', `Bearer ${token}`)
        .send({ characterId, npcId: 'test-npc-id' });
    }
  }

  private async performGangOperation(userId: number): Promise<void> {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: `loadtest${userId}@test.com`,
        password: 'password123'
      });

    const token = loginRes.body.data?.token;

    await request(app)
      .get('/api/gangs')
      .set('Authorization', `Bearer ${token}`);
  }

  private async performMixedOperations(userId: number): Promise<void> {
    await this.performLogin(userId);
    await this.performGetCharacters(userId);
  }

  private recordResult(operation: string, duration: number): void {
    if (!this.results.has(operation)) {
      this.results.set(operation, []);
    }
    this.results.get(operation)!.push(duration);
  }

  private recordError(operation: string): void {
    const currentErrors = this.errors.get(operation) || 0;
    this.errors.set(operation, currentErrors + 1);
  }

  private calculateStats(operation: string, durations: number[]): LoadTestResult {
    const sorted = [...durations].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const errors = this.errors.get(operation) || 0;
    const totalRequests = sorted.length + errors;

    const testDuration = (Date.now() - this.startTime) / 1000; // seconds

    return {
      operation,
      totalRequests,
      successful: sorted.length,
      failed: errors,
      avgResponseTime: sum / sorted.length,
      minResponseTime: sorted[0] || 0,
      maxResponseTime: sorted[sorted.length - 1] || 0,
      p95ResponseTime: sorted[Math.floor(sorted.length * 0.95)] || 0,
      requestsPerSecond: totalRequests / testDuration,
      errorRate: (errors / totalRequests) * 100
    };
  }

  async run(): Promise<LoadTestResult[]> {
    console.log('\n========================================');
    console.log('LOAD TEST STARTED');
    console.log('========================================');
    console.log(`Total Users: ${this.config.totalUsers}`);
    console.log(`Duration: ${this.config.duration}ms`);
    console.log(`Ramp-up Time: ${this.config.rampUpTime}ms`);
    console.log(`Operations: ${this.config.operations.join(', ')}`);
    console.log('========================================\n');

    this.startTime = Date.now();
    const endTime = this.startTime + this.config.duration;
    const rampUpInterval = this.config.rampUpTime / this.config.totalUsers;

    const userPromises: Promise<void>[] = [];

    // Ramp up users gradually
    for (let i = 0; i < this.config.totalUsers; i++) {
      await new Promise(resolve => setTimeout(resolve, rampUpInterval));

      // Each user performs operations until test ends
      const userPromise = (async () => {
        while (Date.now() < endTime) {
          await this.simulateUser(i);
          // Small delay between operations
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      })();

      userPromises.push(userPromise);
    }

    // Wait for all users to complete
    await Promise.all(userPromises);

    // Calculate and return results
    const results: LoadTestResult[] = [];

    for (const [operation, durations] of this.results.entries()) {
      const stats = this.calculateStats(operation, durations);
      results.push(stats);
    }

    this.printResults(results);

    return results;
  }

  private printResults(results: LoadTestResult[]): void {
    console.log('\n========================================');
    console.log('LOAD TEST RESULTS');
    console.log('========================================\n');

    results.forEach(result => {
      console.log(`Operation: ${result.operation}`);
      console.log(`  Total Requests: ${result.totalRequests}`);
      console.log(`  Successful: ${result.successful}`);
      console.log(`  Failed: ${result.failed}`);
      console.log(`  Error Rate: ${result.errorRate.toFixed(2)}%`);
      console.log(`  Requests/Second: ${result.requestsPerSecond.toFixed(2)}`);
      console.log(`  Avg Response Time: ${result.avgResponseTime.toFixed(2)}ms`);
      console.log(`  Min Response Time: ${result.minResponseTime.toFixed(2)}ms`);
      console.log(`  Max Response Time: ${result.maxResponseTime.toFixed(2)}ms`);
      console.log(`  P95 Response Time: ${result.p95ResponseTime.toFixed(2)}ms`);
      console.log('');
    });

    // Overall summary
    const totalRequests = results.reduce((sum, r) => sum + r.totalRequests, 0);
    const totalSuccessful = results.reduce((sum, r) => sum + r.successful, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
    const overallErrorRate = (totalFailed / totalRequests) * 100;
    const avgRPS = results.reduce((sum, r) => sum + r.requestsPerSecond, 0);

    console.log('========================================');
    console.log('OVERALL SUMMARY');
    console.log('========================================');
    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Successful: ${totalSuccessful}`);
    console.log(`Failed: ${totalFailed}`);
    console.log(`Overall Error Rate: ${overallErrorRate.toFixed(2)}%`);
    console.log(`Total Requests/Second: ${avgRPS.toFixed(2)}`);
    console.log('========================================\n');
  }
}

// Run load test scenarios
async function runLoadTests() {
  // Scenario 1: Light Load
  console.log('\n--- SCENARIO 1: LIGHT LOAD ---');
  const lightLoad = new LoadTester({
    totalUsers: 10,
    duration: 30000, // 30 seconds
    rampUpTime: 5000, // 5 seconds
    operations: ['login', 'getCharacters']
  });
  await lightLoad.run();

  // Scenario 2: Medium Load
  console.log('\n--- SCENARIO 2: MEDIUM LOAD ---');
  const mediumLoad = new LoadTester({
    totalUsers: 25,
    duration: 60000, // 60 seconds
    rampUpTime: 10000, // 10 seconds
    operations: ['login', 'getCharacters', 'combat', 'gang']
  });
  await mediumLoad.run();

  // Scenario 3: Heavy Load
  console.log('\n--- SCENARIO 3: HEAVY LOAD ---');
  const heavyLoad = new LoadTester({
    totalUsers: 50,
    duration: 60000, // 60 seconds
    rampUpTime: 15000, // 15 seconds
    operations: ['login', 'getCharacters', 'combat', 'gang', 'mixed']
  });
  await heavyLoad.run();

  // Scenario 4: Spike Test
  console.log('\n--- SCENARIO 4: SPIKE TEST ---');
  const spikeTest = new LoadTester({
    totalUsers: 100,
    duration: 30000, // 30 seconds
    rampUpTime: 2000, // 2 seconds (rapid spike)
    operations: ['login', 'getCharacters']
  });
  await spikeTest.run();
}

// Export for use in tests
export { LoadTester, LoadTestConfig, LoadTestResult };

// Run if executed directly
if (require.main === module) {
  runLoadTests()
    .then(() => {
      console.log('Load tests completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Load test failed:', error);
      process.exit(1);
    });
}
