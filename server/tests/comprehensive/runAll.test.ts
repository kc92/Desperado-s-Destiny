/**
 * COMPREHENSIVE TEST ORCHESTRATOR
 * Runs all exhaustive tests in sequence and generates unified report
 *
 * This master test suite:
 * - Executes all system tests
 * - Executes all location tests
 * - Executes all action tests
 * - Generates a comprehensive bug report
 * - Identifies critical issues
 */

import request from 'supertest';
import { Express } from 'express';
import mongoose from 'mongoose';
import { Character } from '../../src/models/Character.model';
import { Location } from '../../src/models/Location.model';
import { Action } from '../../src/models/Action.model';
import { Gang } from '../../src/models/Gang.model';

interface TestResults {
  systemTests: SystemTestResults;
  locationTests: LocationTestResults;
  actionTests: ActionTestResults;
  timestamp: string;
  duration: number;
}

interface SystemTestResults {
  total: number;
  passed: number;
  failed: number;
  systems: Map<string, { status: 'pass' | 'fail'; error?: string }>;
}

interface LocationTestResults {
  total: number;
  passed: number;
  failed: number;
  buildingTypes: number;
  connectionIssues: number;
  errors: any[];
}

interface ActionTestResults {
  total: number;
  tested: number;
  executable: number;
  requirementsNotMet: number;
  errors: any[];
  categories: number;
  energyIssues: number;
}

describe('🎯 COMPREHENSIVE TEST ORCHESTRATOR', () => {
  let app: Express;
  let authToken: string;
  let testCharacterId: string;
  let testUserId: string;
  let startTime: number;

  const results: TestResults = {
    systemTests: {
      total: 0,
      passed: 0,
      failed: 0,
      systems: new Map(),
    },
    locationTests: {
      total: 0,
      passed: 0,
      failed: 0,
      buildingTypes: 0,
      connectionIssues: 0,
      errors: [],
    },
    actionTests: {
      total: 0,
      tested: 0,
      executable: 0,
      requirementsNotMet: 0,
      errors: [],
      categories: 0,
      energyIssues: 0,
    },
    timestamp: new Date().toISOString(),
    duration: 0,
  };

  beforeAll(async () => {
    startTime = Date.now();

    console.log('\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎮 DESPERADOS DESTINY - COMPREHENSIVE SYSTEM TEST');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Started: ${new Date().toLocaleString()}\n`);

    const { default: createApp } = await import('../testApp');
    app = createApp();

    // Create test user and character
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `orchestrator-${Date.now()}@test.com`,
        password: 'TestPassword123!',
      });

    authToken = registerRes.body.data.token;
    testUserId = registerRes.body.data.user._id;

    const charRes = await request(app)
      .post('/api/characters')
      .set('Cookie', `token=${authToken}`)
      .send({
        name: `Orchestrator${Date.now()}`,
        faction: 'SETTLER_ALLIANCE',
      });

    testCharacterId = charRes.body.data.character._id;

    await request(app)
      .patch(`/api/characters/${testCharacterId}/select`)
      .set('Cookie', `token=${authToken}`);

    // Give character full resources for testing
    await Character.findByIdAndUpdate(testCharacterId, {
      $set: {
        energy: 100,
        gold: 10000,
      },
    });

    console.log('✅ Test environment initialized');
    console.log(`   User ID: ${testUserId}`);
    console.log(`   Character ID: ${testCharacterId}\n`);
  });

  afterAll(async () => {
    if (testCharacterId) await Character.findByIdAndDelete(testCharacterId);
    if (testUserId) {
      await mongoose.connection.collection('users').deleteOne({
        _id: new mongoose.Types.ObjectId(testUserId)
      });
    }

    results.duration = Date.now() - startTime;
    generateReport(results);
  });

  describe('📍 PHASE 1: Location System Tests', () => {
    it('should test all locations', async () => {
      console.log('\n📍 PHASE 1: Testing Location System');
      console.log('─────────────────────────────────────────────────────────\n');

      const locations = await Location.find({});
      results.locationTests.total = locations.length;

      console.log(`Found ${locations.length} locations to test\n`);

      for (const location of locations) {
        try {
          const res = await request(app)
            .get(`/api/locations/${location._id}`)
            .set('Cookie', `token=${authToken}`);

          if (res.status === 200) {
            results.locationTests.passed++;
            console.log(`  ✅ ${location.name} (${location.type})`);
          } else {
            results.locationTests.failed++;
            results.locationTests.errors.push({
              location: location.name,
              error: `HTTP ${res.status}`,
            });
            console.log(`  ❌ ${location.name} - HTTP ${res.status}`);
          }
        } catch (error: any) {
          results.locationTests.failed++;
          results.locationTests.errors.push({
            location: location.name,
            error: error.message,
          });
          console.log(`  ❌ ${location.name} - ${error.message}`);
        }
      }

      // Count building types
      const buildingTypes = new Set(locations.map(l => l.type));
      results.locationTests.buildingTypes = buildingTypes.size;

      console.log(`\n📊 Location Test Summary:`);
      console.log(`   Total: ${results.locationTests.total}`);
      console.log(`   Passed: ${results.locationTests.passed}`);
      console.log(`   Failed: ${results.locationTests.failed}`);
      console.log(`   Building Types: ${results.locationTests.buildingTypes}`);
    });

    it('should validate location connections', async () => {
      console.log('\n🔗 Validating Location Connections...\n');

      const locations = await Location.find({});
      let connectionIssues = 0;

      for (const location of locations) {
        if (location.connections && location.connections.length > 0) {
          for (const conn of location.connections) {
            const targetLoc = await Location.findById(conn.targetLocationId);

            if (!targetLoc) {
              connectionIssues++;
              console.log(`  ⚠️  ${location.name} → [MISSING: ${conn.targetLocationId}]`);
            }
          }
        }
      }

      results.locationTests.connectionIssues = connectionIssues;
      console.log(`\n   Connection Issues: ${connectionIssues}`);
    });
  });

  describe('🎯 PHASE 2: Action System Tests', () => {
    it('should test all actions', async () => {
      console.log('\n🎯 PHASE 2: Testing Action System');
      console.log('─────────────────────────────────────────────────────────\n');

      const actions = await Action.find({ isActive: true });
      results.actionTests.total = actions.length;

      console.log(`Found ${actions.length} actions to test\n`);

      // Test energy costs
      let energyIssues = 0;
      for (const action of actions) {
        if (
          action.energyCost === undefined ||
          action.energyCost === null ||
          action.energyCost < 0 ||
          action.energyCost > 100
        ) {
          energyIssues++;
        }
      }
      results.actionTests.energyIssues = energyIssues;

      // Test action execution
      for (const action of actions) {
        results.actionTests.tested++;

        try {
          const res = await request(app)
            .post(`/api/actions/${action._id}/execute`)
            .set('Cookie', `token=${authToken}`)
            .send({});

          if (res.status === 200) {
            results.actionTests.executable++;
            console.log(`  ✅ ${action.name}`);
          } else if (res.status === 400 || res.status === 403) {
            results.actionTests.requirementsNotMet++;
            console.log(`  ⚠️  ${action.name} (requirements not met)`);
          } else {
            results.actionTests.errors.push({
              action: action.name,
              status: res.status,
              error: res.body.error || res.body.message,
            });
            console.log(`  ❌ ${action.name} - HTTP ${res.status}`);
          }
        } catch (error: any) {
          results.actionTests.errors.push({
            action: action.name,
            error: error.message,
          });
          console.log(`  ❌ ${action.name} - ${error.message}`);
        }
      }

      // Count categories
      const categories = new Set(actions.map(a => a.category || 'uncategorized'));
      results.actionTests.categories = categories.size;

      console.log(`\n📊 Action Test Summary:`);
      console.log(`   Total: ${results.actionTests.total}`);
      console.log(`   Tested: ${results.actionTests.tested}`);
      console.log(`   Executable: ${results.actionTests.executable}`);
      console.log(`   Requirements Not Met: ${results.actionTests.requirementsNotMet}`);
      console.log(`   Errors: ${results.actionTests.errors.length}`);
      console.log(`   Categories: ${results.actionTests.categories}`);
      console.log(`   Energy Issues: ${results.actionTests.energyIssues}`);
    });
  });

  describe('🎮 PHASE 3: Game System Tests', () => {
    const systemTests = [
      { name: 'Locations', endpoint: '/api/locations', method: 'GET' },
      { name: 'Current Location', endpoint: '/api/locations/current', method: 'GET' },
      { name: 'Combat Encounters', endpoint: '/api/combat/encounters', method: 'GET' },
      { name: 'Skills', endpoint: '/api/skills', method: 'GET' },
      { name: 'Territory', endpoint: '/api/territory', method: 'GET' },
      { name: 'Mail', endpoint: '/api/mail', method: 'GET' },
      { name: 'Friends', endpoint: '/api/friends', method: 'GET' },
      { name: 'Notifications', endpoint: '/api/notifications', method: 'GET' },
      { name: 'Unread Count', endpoint: '/api/notifications/unread-count', method: 'GET' },
      { name: 'Achievements', endpoint: '/api/achievements', method: 'GET' },
      { name: 'Leaderboard', endpoint: '/api/leaderboard', method: 'GET' },
      { name: 'World State', endpoint: '/api/world/state', method: 'GET' },
      { name: 'World Time', endpoint: '/api/world/time', method: 'GET' },
      { name: 'Weather', endpoint: '/api/world/weather', method: 'GET' },
      { name: 'Gangs', endpoint: '/api/gangs', method: 'GET' },
      { name: 'Shop Items', endpoint: '/api/shop/items', method: 'GET' },
    ];

    it('should test all game systems', async () => {
      console.log('\n🎮 PHASE 3: Testing Game Systems');
      console.log('─────────────────────────────────────────────────────────\n');

      results.systemTests.total = systemTests.length;

      for (const test of systemTests) {
        try {
          const res = await request(app)
            .get(test.endpoint)
            .set('Cookie', `token=${authToken}`);

          if (res.status === 200) {
            results.systemTests.passed++;
            results.systemTests.systems.set(test.name, { status: 'pass' });
            console.log(`  ✅ ${test.name}`);
          } else if (res.status === 404) {
            results.systemTests.failed++;
            results.systemTests.systems.set(test.name, {
              status: 'fail',
              error: 'Endpoint not found',
            });
            console.log(`  ⚠️  ${test.name} (not implemented)`);
          } else {
            results.systemTests.failed++;
            results.systemTests.systems.set(test.name, {
              status: 'fail',
              error: `HTTP ${res.status}`,
            });
            console.log(`  ❌ ${test.name} - HTTP ${res.status}`);
          }
        } catch (error: any) {
          results.systemTests.failed++;
          results.systemTests.systems.set(test.name, {
            status: 'fail',
            error: error.message,
          });
          console.log(`  ❌ ${test.name} - ${error.message}`);
        }
      }

      console.log(`\n📊 System Test Summary:`);
      console.log(`   Total: ${results.systemTests.total}`);
      console.log(`   Passed: ${results.systemTests.passed}`);
      console.log(`   Failed: ${results.systemTests.failed}`);
    });
  });
});

function generateReport(results: TestResults): void {
  console.log('\n\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 FINAL TEST REPORT');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Completed: ${new Date().toLocaleString()}`);
  console.log(`Duration: ${(results.duration / 1000).toFixed(2)}s`);
  console.log('');

  // Overall Summary
  const totalTests =
    results.systemTests.total +
    results.locationTests.total +
    results.actionTests.total;
  const totalPassed =
    results.systemTests.passed +
    results.locationTests.passed +
    results.actionTests.executable;
  const totalFailed =
    results.systemTests.failed +
    results.locationTests.failed +
    results.actionTests.errors.length;

  console.log('📈 OVERALL SUMMARY');
  console.log('─────────────────────────────────────────────────────────');
  console.log(`Total Tests Run: ${totalTests}`);
  console.log(`Passed: ${totalPassed} (${((totalPassed / totalTests) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${totalFailed} (${((totalFailed / totalTests) * 100).toFixed(1)}%)`);
  console.log('');

  // System Tests
  console.log('🎮 GAME SYSTEMS');
  console.log('─────────────────────────────────────────────────────────');
  console.log(`Total Systems: ${results.systemTests.total}`);
  console.log(`Passed: ${results.systemTests.passed}`);
  console.log(`Failed: ${results.systemTests.failed}`);
  if (results.systemTests.failed > 0) {
    console.log('\nFailed Systems:');
    results.systemTests.systems.forEach((value, key) => {
      if (value.status === 'fail') {
        console.log(`  ❌ ${key}: ${value.error}`);
      }
    });
  }
  console.log('');

  // Location Tests
  console.log('📍 LOCATIONS & BUILDINGS');
  console.log('─────────────────────────────────────────────────────────');
  console.log(`Total Locations: ${results.locationTests.total}`);
  console.log(`Accessible: ${results.locationTests.passed}`);
  console.log(`Failed: ${results.locationTests.failed}`);
  console.log(`Building Types: ${results.locationTests.buildingTypes}`);
  console.log(`Connection Issues: ${results.locationTests.connectionIssues}`);
  if (results.locationTests.errors.length > 0) {
    console.log('\nTop Location Errors:');
    results.locationTests.errors.slice(0, 5).forEach(err => {
      console.log(`  ❌ ${err.location}: ${err.error}`);
    });
  }
  console.log('');

  // Action Tests
  console.log('🎯 ACTIONS');
  console.log('─────────────────────────────────────────────────────────');
  console.log(`Total Actions: ${results.actionTests.total}`);
  console.log(`Executable: ${results.actionTests.executable}`);
  console.log(`Requirements Not Met: ${results.actionTests.requirementsNotMet}`);
  console.log(`Errors: ${results.actionTests.errors.length}`);
  console.log(`Categories: ${results.actionTests.categories}`);
  console.log(`Energy Issues: ${results.actionTests.energyIssues}`);
  if (results.actionTests.errors.length > 0) {
    console.log('\nTop Action Errors:');
    results.actionTests.errors.slice(0, 5).forEach(err => {
      console.log(`  ❌ ${err.action}: ${err.error || err.status}`);
    });
  }
  console.log('');

  // Critical Issues
  console.log('🚨 CRITICAL ISSUES');
  console.log('─────────────────────────────────────────────────────────');
  const criticalIssues = [];

  if (results.systemTests.failed > results.systemTests.total * 0.3) {
    criticalIssues.push('⚠️  More than 30% of game systems are failing');
  }
  if (results.locationTests.failed > results.locationTests.total * 0.2) {
    criticalIssues.push('⚠️  More than 20% of locations are inaccessible');
  }
  if (results.actionTests.errors.length > results.actionTests.total * 0.1) {
    criticalIssues.push('⚠️  More than 10% of actions have hard errors');
  }
  if (results.actionTests.energyIssues > 0) {
    criticalIssues.push(`⚠️  ${results.actionTests.energyIssues} actions have invalid energy costs`);
  }
  if (results.locationTests.connectionIssues > 10) {
    criticalIssues.push(`⚠️  ${results.locationTests.connectionIssues} location connection issues found`);
  }

  if (criticalIssues.length === 0) {
    console.log('✅ No critical issues detected!');
  } else {
    criticalIssues.forEach(issue => console.log(issue));
  }
  console.log('');

  // Recommendations
  console.log('💡 RECOMMENDATIONS');
  console.log('─────────────────────────────────────────────────────────');
  if (results.systemTests.failed > 0) {
    console.log('1. Review failed game system endpoints and implement missing routes');
  }
  if (results.locationTests.errors.length > 0) {
    console.log('2. Fix location retrieval errors - check Location model and routes');
  }
  if (results.actionTests.errors.length > 0) {
    console.log('3. Debug action execution errors - review action controller logic');
  }
  if (results.actionTests.energyIssues > 0) {
    console.log('4. Update action energy costs to valid range (0-100)');
  }
  if (results.locationTests.connectionIssues > 0) {
    console.log('5. Fix location connection references - remove orphaned connections');
  }
  console.log('');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('Test Report Complete');
  console.log('═══════════════════════════════════════════════════════════\n');
}
