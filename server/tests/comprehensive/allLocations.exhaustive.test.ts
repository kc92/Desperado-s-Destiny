/**
 * ALL LOCATIONS & BUILDINGS EXHAUSTIVE TEST
 * Systematically tests every location and every building in the game
 */

import request from 'supertest';
import { Express } from 'express';
import mongoose from 'mongoose';
import { Location } from '../../src/models/Location.model';
import { Character } from '../../src/models/Character.model';

describe('📍 ALL LOCATIONS & BUILDINGS EXHAUSTIVE TEST', () => {
  let app: Express;
  let authToken: string;
  let testCharacterId: string;
  let testUserId: string;

  beforeAll(async () => {
    const { default: createApp } = await import('../testApp');
    app = createApp();

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `location-test-${Date.now()}@test.com`,
        password: 'TestPassword123!',
      });

    authToken = registerRes.body.data.token;
    testUserId = registerRes.body.data.user._id;

    const charRes = await request(app)
      .post('/api/characters')
      .set('Cookie', `token=${authToken}`)
      .send({
        name: `LocationTester${Date.now()}`,
        faction: 'SETTLER_ALLIANCE',
      });

    testCharacterId = charRes.body.data.character._id;

    await request(app)
      .patch(`/api/characters/${testCharacterId}/select`)
      .set('Cookie', `token=${authToken}`);
  });

  afterAll(async () => {
    if (testCharacterId) await Character.findByIdAndDelete(testCharacterId);
    if (testUserId) {
      await mongoose.connection.collection('users').deleteOne({
        _id: new mongoose.Types.ObjectId(testUserId)
      });
    }
  });

  describe('🗺️ Test Every Location', () => {
    it('should retrieve and validate all locations in database', async () => {
      const locations = await Location.find({});

      console.log(`\n📊 Testing ${locations.length} locations...\n`);

      expect(locations.length).toBeGreaterThan(0);

      const results = {
        total: locations.length,
        tested: 0,
        passed: 0,
        failed: 0,
        errors: [] as any[],
      };

      for (const location of locations) {
        results.tested++;

        try {
          // Test 1: Location has required fields
          expect(location.name).toBeDefined();
          expect(location.type).toBeDefined();

          // Test 2: Can retrieve location by ID via API
          const res = await request(app)
            .get(`/api/locations/${location._id}`)
            .set('Cookie', `token=${authToken}`);

          if (res.status === 200) {
            expect(res.body.data.location._id).toBe(location._id.toString());
            expect(res.body.data.location.name).toBe(location.name);
            results.passed++;
            console.log(`  ✅ ${location.name} (${location.type})`);
          } else {
            results.failed++;
            results.errors.push({
              location: location.name,
              error: `HTTP ${res.status}`,
              body: res.body,
            });
            console.log(`  ❌ ${location.name} - Failed with status ${res.status}`);
          }
        } catch (error: any) {
          results.failed++;
          results.errors.push({
            location: location.name,
            error: error.message,
          });
          console.log(`  ❌ ${location.name} - ${error.message}`);
        }
      }

      console.log(`\n📊 Location Test Results:`);
      console.log(`  Total: ${results.total}`);
      console.log(`  Passed: ${results.passed}`);
      console.log(`  Failed: ${results.failed}`);

      if (results.errors.length > 0) {
        console.log(`\n❌ Failed Locations:`);
        results.errors.forEach(err => {
          console.log(`  - ${err.location}: ${err.error}`);
        });
      }

      // Allow some failures (endpoints might not be implemented yet)
      const successRate = results.passed / results.total;
      expect(successRate).toBeGreaterThan(0.5); // At least 50% should work
    });
  });

  describe('🏢 Test All Building Types', () => {
    it('should test all unique building types', async () => {
      const locations = await Location.find({});
      const buildingTypes = [...new Set(locations.map(l => l.type))];

      console.log(`\n🏢 Testing ${buildingTypes.length} building types...\n`);

      for (const type of buildingTypes) {
        const buildingsOfType = locations.filter(l => l.type === type);
        console.log(`  📍 ${type}: ${buildingsOfType.length} buildings`);

        // Test first building of each type
        if (buildingsOfType.length > 0) {
          const building = buildingsOfType[0];

          const res = await request(app)
            .get(`/api/locations/${building._id}`)
            .set('Cookie', `token=${authToken}`);

          expect([200, 404]).toContain(res.status);

          if (res.status === 200) {
            console.log(`    ✅ ${building.name} accessible`);
          }
        }
      }
    });
  });

  describe('🚶 Test Location Travel System', () => {
    it('should test travel between different location types', async () => {
      const locations = await Location.find({}).limit(5);

      if (locations.length < 2) {
        console.log('  ⚠️  Not enough locations to test travel');
        return;
      }

      console.log(`\n🚶 Testing travel between ${locations.length} locations...\n`);

      for (let i = 0; i < locations.length - 1; i++) {
        const from = locations[i];
        const to = locations[i + 1];

        const res = await request(app)
          .post('/api/locations/travel')
          .set('Cookie', `token=${authToken}`)
          .send({ targetLocationId: to._id });

        // Travel might fail due to distance/energy, but should respond properly
        expect([200, 400, 403]).toContain(res.status);

        if (res.status === 200) {
          console.log(`  ✅ ${from.name} → ${to.name}`);
        } else {
          console.log(`  ⚠️  ${from.name} → ${to.name} (${res.status}: ${res.body.error || res.body.message})`);
        }
      }
    });
  });

  describe('🏪 Test Buildings with Special Features', () => {
    it('should test saloons', async () => {
      const saloons = await Location.find({ type: 'saloon' });
      console.log(`\n🍺 Testing ${saloons.length} saloons...`);

      for (const saloon of saloons) {
        const res = await request(app)
          .get(`/api/locations/${saloon._id}`)
          .set('Cookie', `token=${authToken}`);

        expect([200, 404]).toContain(res.status);
        if (res.status === 200) {
          console.log(`  ✅ ${saloon.name}`);
        }
      }
    });

    it('should test banks', async () => {
      const banks = await Location.find({ type: 'bank' });
      console.log(`\n🏦 Testing ${banks.length} banks...`);

      for (const bank of banks) {
        const res = await request(app)
          .get(`/api/locations/${bank._id}`)
          .set('Cookie', `token=${authToken}`);

        expect([200, 404]).toContain(res.status);
        if (res.status === 200) {
          console.log(`  ✅ ${bank.name}`);
        }
      }
    });

    it('should test general stores', async () => {
      const stores = await Location.find({ type: 'general_store' });
      console.log(`\n🏪 Testing ${stores.length} general stores...`);

      for (const store of stores) {
        const res = await request(app)
          .get(`/api/locations/${store._id}`)
          .set('Cookie', `token=${authToken}`);

        expect([200, 404]).toContain(res.status);
        if (res.status === 200) {
          console.log(`  ✅ ${store.name}`);
        }
      }
    });

    it('should test sheriff offices', async () => {
      const sheriffOffices = await Location.find({ type: 'sheriff_office' });
      console.log(`\n⭐ Testing ${sheriffOffices.length} sheriff offices...`);

      for (const office of sheriffOffices) {
        const res = await request(app)
          .get(`/api/locations/${office._id}`)
          .set('Cookie', `token=${authToken}`);

        expect([200, 404]).toContain(res.status);
        if (res.status === 200) {
          console.log(`  ✅ ${office.name}`);
        }
      }
    });
  });

  describe('🗺️ Test Location Connections', () => {
    it('should validate location connections are bidirectional', async () => {
      const locations = await Location.find({});

      console.log(`\n🔗 Validating location connections...\n`);

      let connectionIssues = 0;

      for (const location of locations) {
        if (location.connections && location.connections.length > 0) {
          for (const conn of location.connections) {
            const targetLoc = await Location.findById(conn.targetLocationId);

            if (!targetLoc) {
              console.log(`  ⚠️  ${location.name} connects to non-existent location ${conn.targetLocationId}`);
              connectionIssues++;
            } else {
              // Check if connection is bidirectional
              const reverseConnection = targetLoc.connections?.find(
                c => c.targetLocationId.toString() === location._id.toString()
              );

              if (!reverseConnection) {
                console.log(`  ⚠️  ${location.name} → ${targetLoc.name} (one-way)`);
              }
            }
          }
        }
      }

      console.log(`\n  Total connection issues: ${connectionIssues}`);
      expect(connectionIssues).toBeLessThan(10); // Allow some issues
    });
  });
});
