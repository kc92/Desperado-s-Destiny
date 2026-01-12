/**
 * ALL ACTIONS EXHAUSTIVE TEST
 * Systematically tests EVERY action in the game
 */

import request from 'supertest';
import mongoose from 'mongoose';
import { Action } from '../../src/models/Action.model';
import { Character } from '../../src/models/Character.model';
import app from '../testApp';
import { setupCompleteGameState } from '../helpers/testHelpers';
import { seedAllLocations } from '../helpers/seedHelpers';

describe('🎯 ALL ACTIONS EXHAUSTIVE TEST', () => {
  let authToken: string;
  let testCharacterId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Seed locations before running tests (actions are tied to locations)
    await seedAllLocations();

    // Use the proven setupCompleteGameState helper
    const gameState = await setupCompleteGameState(app);
    authToken = gameState.token;
    testCharacterId = gameState.character._id.toString();
    testUserId = gameState.user._id;

    // Select the character
    await request(app)
      .patch(`/api/characters/${testCharacterId}/select`)
      .set('Cookie', `token=${authToken}`);

    // Give character full energy and dollars for testing
    await Character.findByIdAndUpdate(testCharacterId, {
      $set: {
        energy: 100,
        dollars: 10000,
        gold: 10000,  // Must also set gold for DollarService migration compatibility
      },
    });
  });

  afterAll(async () => {
    if (testCharacterId) await Character.findByIdAndDelete(testCharacterId);
    if (testUserId) {
      await mongoose.connection.collection('users').deleteOne({
        _id: new mongoose.Types.ObjectId(testUserId)
      });
    }
  });

  describe('🎯 Test Every Action', () => {
    it('should test all actions in the database', async () => {
      const actions = await Action.find({ isActive: true });

      console.log(`\n🎯 Testing ${actions.length} actions...\n`);

      expect(actions.length).toBeGreaterThan(0);

      const results = {
        total: actions.length,
        tested: 0,
        executable: 0,
        requirementsNotMet: 0,
        errors: [] as any[],
      };

      for (const action of actions) {
        results.tested++;

        try {
          // Test executing the action
          const res = await request(app)
            .post(`/api/actions/${action._id}/execute`)
            .set('Cookie', `token=${authToken}`)
            .send({});

          if (res.status === 200) {
            results.executable++;
            console.log(`  ✅ ${action.name} - SUCCESS`);
          } else if (res.status === 400 || res.status === 403) {
            results.requirementsNotMet++;
            console.log(`  ⚠️  ${action.name} - Requirements not met (${res.body.error || res.body.message})`);
          } else {
            results.errors.push({
              action: action.name,
              status: res.status,
              error: res.body.error || res.body.message,
            });
            console.log(`  ❌ ${action.name} - HTTP ${res.status}`);
          }
        } catch (error: any) {
          results.errors.push({
            action: action.name,
            error: error.message,
          });
          console.log(`  ❌ ${action.name} - ${error.message}`);
        }
      }

      console.log(`\n📊 Action Test Results:`);
      console.log(`  Total Actions: ${results.total}`);
      console.log(`  Tested: ${results.tested}`);
      console.log(`  Executable: ${results.executable}`);
      console.log(`  Requirements Not Met: ${results.requirementsNotMet}`);
      console.log(`  Errors: ${results.errors.length}`);

      if (results.errors.length > 0) {
        console.log(`\n❌ Failed Actions:`);
        results.errors.forEach(err => {
          console.log(`  - ${err.action}: ${err.error}`);
        });
      }

      // All actions should at least respond (even if requirements not met)
      expect(results.tested).toBe(results.total);
      expect(results.errors.length).toBeLessThan(results.total * 0.1); // Less than 10% hard errors
    });
  });

  describe('🎲 Test Action Categories', () => {
    it('should test actions by category', async () => {
      const actions = await Action.find({ isActive: true });
      const categoriesMap = new Map<string, any[]>();

      // Group actions by category
      for (const action of actions) {
        const category = action.category || 'uncategorized';
        if (!categoriesMap.has(category)) {
          categoriesMap.set(category, []);
        }
        categoriesMap.get(category)!.push(action);
      }

      console.log(`\n📋 Action Categories Found: ${categoriesMap.size}\n`);

      for (const [category, categoryActions] of categoriesMap) {
        console.log(`\n📁 ${category}: ${categoryActions.length} actions`);

        // Test first action in each category
        if (categoryActions.length > 0) {
          const testAction = categoryActions[0];

          const res = await request(app)
            .post(`/api/actions/${testAction._id}/execute`)
            .set('Cookie', `token=${authToken}`)
            .send({});

          if (res.status === 200) {
            console.log(`  ✅ ${testAction.name} (executable)`);
          } else {
            console.log(`  ⚠️  ${testAction.name} (${res.status})`);
          }
        }
      }
    });
  });

  describe('⚡ Test Action Energy Costs', () => {
    it('should validate all actions have proper energy costs', async () => {
      const actions = await Action.find({ isActive: true });

      console.log(`\n⚡ Validating energy costs for ${actions.length} actions...\n`);

      const invalidEnergyCosts: any[] = [];

      for (const action of actions) {
        if (action.energyCost === undefined || action.energyCost === null) {
          invalidEnergyCosts.push({
            name: action.name,
            issue: 'No energy cost defined',
          });
        } else if (action.energyCost < 0) {
          invalidEnergyCosts.push({
            name: action.name,
            issue: `Negative energy cost: ${action.energyCost}`,
          });
        } else if (action.energyCost > 100) {
          invalidEnergyCosts.push({
            name: action.name,
            issue: `Energy cost too high: ${action.energyCost}`,
          });
        }
      }

      if (invalidEnergyCosts.length > 0) {
        console.log(`⚠️  Found ${invalidEnergyCosts.length} actions with invalid energy costs:`);
        invalidEnergyCosts.forEach(issue => {
          console.log(`  - ${issue.name}: ${issue.issue}`);
        });
      } else {
        console.log(`✅ All actions have valid energy costs`);
      }

      expect(invalidEnergyCosts.length).toBe(0);
    });
  });

  describe('💰 Test Action Gold Requirements', () => {
    it('should validate actions with gold costs', async () => {
      const actions = await Action.find({
        isActive: true,
        goldCost: { $exists: true, $gt: 0 },
      });

      console.log(`\n💰 Testing ${actions.length} actions with gold costs...\n`);

      for (const action of actions) {
        console.log(`  💵 ${action.name}: ${action.goldCost} gold`);

        // Verify action validates gold cost
        const res = await request(app)
          .post(`/api/actions/${action._id}/execute`)
          .set('Cookie', `token=${authToken}`)
          .send({});

        // Should either succeed or fail with proper error
        expect([200, 400, 403]).toContain(res.status);
      }
    });
  });

  describe('🎖️ Test Action Skill Requirements', () => {
    it('should test actions with skill requirements', async () => {
      const actions = await Action.find({
        isActive: true,
        'skillRequirements.0': { $exists: true },
      });

      console.log(`\n🎖️ Testing ${actions.length} actions with skill requirements...\n`);

      for (const action of actions) {
        if (action.skillRequirements && action.skillRequirements.length > 0) {
          const skills = action.skillRequirements.map(sr => `${sr.skillId} (${sr.level})`).join(', ');
          console.log(`  🎯 ${action.name}: requires ${skills}`);
        }

        const res = await request(app)
          .post(`/api/actions/${action._id}/execute`)
          .set('Cookie', `token=${authToken}`)
          .send({});

        expect([200, 400, 403]).toContain(res.status);
      }
    });
  });

  describe('🎲 Test Action Success/Failure', () => {
    it('should test actions that use success mechanics', async () => {
      const actions = await Action.find({
        isActive: true,
        baseSuccessChance: { $exists: true },
      }).limit(10);

      console.log(`\n🎲 Testing ${actions.length} actions with success chance...\n`);

      for (const action of actions) {
        console.log(`  🎯 ${action.name}: ${action.baseSuccessChance}% base success`);

        // Execute multiple times to test randomness
        const results = { success: 0, failure: 0, error: 0 };

        for (let i = 0; i < 3; i++) {
          const res = await request(app)
            .post(`/api/actions/${action._id}/execute`)
            .set('Cookie', `token=${authToken}`)
            .send({});

          if (res.status === 200) {
            if (res.body.data?.success) {
              results.success++;
            } else {
              results.failure++;
            }
          } else {
            results.error++;
          }
        }

        console.log(`    Results: ${results.success} success, ${results.failure} failure, ${results.error} errors`);
      }
    });
  });
});
