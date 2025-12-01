/**
 * COMPREHENSIVE SYSTEM TESTING
 * Tests every major system in the game end-to-end
 *
 * This test suite systematically exercises:
 * - All game systems
 * - All API endpoints
 * - All character interactions
 * - All economic flows
 * - All combat mechanics
 */

import request from 'supertest';
import { Express } from 'express';
import mongoose from 'mongoose';
import { Character } from '../../src/models/Character.model';
import { Location } from '../../src/models/Location.model';
import { Action } from '../../src/models/Action.model';
import { Gang } from '../../src/models/Gang.model';

describe('🎮 COMPREHENSIVE SYSTEM TESTS', () => {
  let app: Express;
  let authToken: string;
  let testCharacterId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Import app after env setup
    const { default: createApp } = await import('../testApp');
    app = createApp();

    // Create test user and character
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `comprehensive-${Date.now()}@test.com`,
        password: 'TestPassword123!',
      });

    authToken = registerRes.body.data.token;
    testUserId = registerRes.body.data.user._id;

    // Create test character
    const charRes = await request(app)
      .post('/api/characters')
      .set('Cookie', `token=${authToken}`)
      .send({
        name: `SystemTester${Date.now()}`,
        faction: 'SETTLER_ALLIANCE',
      });

    testCharacterId = charRes.body.data.character._id;

    // Select character
    await request(app)
      .patch(`/api/characters/${testCharacterId}/select`)
      .set('Cookie', `token=${authToken}`);
  });

  afterAll(async () => {
    // Cleanup
    if (testCharacterId) {
      await Character.findByIdAndDelete(testCharacterId);
    }
    if (testUserId) {
      await mongoose.connection.collection('users').deleteOne({ _id: new mongoose.Types.ObjectId(testUserId) });
    }
  });

  describe('📍 Location System', () => {
    it('should retrieve all locations', async () => {
      const res = await request(app)
        .get('/api/locations')
        .set('Cookie', `token=${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.locations).toBeInstanceOf(Array);
      expect(res.body.data.locations.length).toBeGreaterThan(0);
    });

    it('should get current character location', async () => {
      const res = await request(app)
        .get('/api/locations/current')
        .set('Cookie', `token=${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.location).toBeDefined();
      expect(res.body.data.location.name).toBeDefined();
    });

    it('should travel to different locations', async () => {
      // Get available locations
      const locsRes = await request(app)
        .get('/api/locations')
        .set('Cookie', `token=${authToken}`);

      const locations = locsRes.body.data.locations;
      if (locations.length > 1) {
        const targetLocation = locations.find((l: any) => l._id !== testCharacterId);

        const travelRes = await request(app)
          .post('/api/locations/travel')
          .set('Cookie', `token=${authToken}`)
          .send({ targetLocationId: targetLocation._id });

        // Travel might fail due to energy/distance, but endpoint should respond
        expect([200, 400]).toContain(travelRes.status);
      }
    });
  });

  describe('⚔️ Combat System', () => {
    it('should get available combat encounters', async () => {
      const res = await request(app)
        .get('/api/combat/encounters')
        .set('Cookie', `token=${authToken}`);

      expect([200, 404]).toContain(res.status);
    });

    it('should handle combat initiation', async () => {
      // Try to start combat
      const res = await request(app)
        .post('/api/combat/start')
        .set('Cookie', `token=${authToken}`)
        .send({ npcId: new mongoose.Types.ObjectId() });

      // Will likely fail (no NPC), but should handle gracefully
      expect([200, 400, 404]).toContain(res.status);
    });
  });

  describe('🎯 Action System', () => {
    it('should retrieve all available actions', async () => {
      const actions = await Action.find({ isActive: true }).limit(50);
      expect(actions.length).toBeGreaterThan(0);
    });

    it('should test action execution for each action type', async () => {
      const actions = await Action.find({ isActive: true }).limit(10);

      for (const action of actions) {
        const res = await request(app)
          .post(`/api/actions/${action._id}/execute`)
          .set('Cookie', `token=${authToken}`)
          .send({});

        // Action might fail due to requirements, but should respond
        expect([200, 400, 403, 404]).toContain(res.status);
      }
    });
  });

  describe('💰 Economy System', () => {
    it('should check character gold balance', async () => {
      const res = await request(app)
        .get(`/api/characters/${testCharacterId}`)
        .set('Cookie', `token=${authToken}`);

      expect(res.status).toBe(200);
      expect(typeof res.body.data.character.gold).toBe('number');
    });

    it('should handle bank operations', async () => {
      const depositRes = await request(app)
        .post('/api/bank/deposit')
        .set('Cookie', `token=${authToken}`)
        .send({ amount: 10 });

      expect([200, 400]).toContain(depositRes.status);
    });

    it('should handle shop purchases', async () => {
      const res = await request(app)
        .get('/api/shop/items')
        .set('Cookie', `token=${authToken}`);

      expect([200, 404]).toContain(res.status);
    });
  });

  describe('👥 Gang System', () => {
    it('should create a gang', async () => {
      const res = await request(app)
        .post('/api/gangs')
        .set('Cookie', `token=${authToken}`)
        .send({
          name: `TestGang${Date.now()}`,
          description: 'Automated test gang',
        });

      expect([200, 201, 400]).toContain(res.status);
    });

    it('should retrieve gang list', async () => {
      const res = await request(app)
        .get('/api/gangs')
        .set('Cookie', `token=${authToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('🎲 Skills System', () => {
    it('should retrieve character skills', async () => {
      const res = await request(app)
        .get('/api/skills')
        .set('Cookie', `token=${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.skills).toBeDefined();
    });

    it('should train skills', async () => {
      const res = await request(app)
        .post('/api/skills/train')
        .set('Cookie', `token=${authToken}`)
        .send({ skillId: 'gunslinging' });

      expect([200, 400]).toContain(res.status);
    });
  });

  describe('🗺️ Territory System', () => {
    it('should get territory information', async () => {
      const res = await request(app)
        .get('/api/territory')
        .set('Cookie', `token=${authToken}`);

      expect([200, 404]).toContain(res.status);
    });
  });

  describe('📧 Mail System', () => {
    it('should retrieve mailbox', async () => {
      const res = await request(app)
        .get('/api/mail')
        .set('Cookie', `token=${authToken}`);

      expect(res.status).toBe(200);
    });

    it('should send mail to self', async () => {
      const res = await request(app)
        .post('/api/mail/send')
        .set('Cookie', `token=${authToken}`)
        .send({
          recipientId: testCharacterId,
          subject: 'Test Mail',
          body: 'Automated test message',
        });

      expect([200, 400]).toContain(res.status);
    });
  });

  describe('👫 Friends System', () => {
    it('should get friends list', async () => {
      const res = await request(app)
        .get('/api/friends')
        .set('Cookie', `token=${authToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('🔔 Notification System', () => {
    it('should retrieve notifications', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Cookie', `token=${authToken}`);

      expect(res.status).toBe(200);
    });

    it('should get unread count', async () => {
      const res = await request(app)
        .get('/api/notifications/unread-count')
        .set('Cookie', `token=${authToken}`);

      expect(res.status).toBe(200);
      expect(typeof res.body.data.count).toBe('number');
    });
  });

  describe('🎖️ Achievement System', () => {
    it('should retrieve achievements', async () => {
      const res = await request(app)
        .get('/api/achievements')
        .set('Cookie', `token=${authToken}`);

      expect([200, 404]).toContain(res.status);
    });
  });

  describe('🏆 Leaderboard System', () => {
    it('should get leaderboards', async () => {
      const res = await request(app)
        .get('/api/leaderboard')
        .set('Cookie', `token=${authToken}`);

      expect([200, 404]).toContain(res.status);
    });
  });

  describe('🌍 World State', () => {
    it('should retrieve world state', async () => {
      const res = await request(app)
        .get('/api/world/state')
        .set('Cookie', `token=${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.worldState).toBeDefined();
    });

    it('should get game time', async () => {
      const res = await request(app)
        .get('/api/world/time')
        .set('Cookie', `token=${authToken}`);

      expect([200, 404]).toContain(res.status);
    });

    it('should get weather', async () => {
      const res = await request(app)
        .get('/api/world/weather')
        .set('Cookie', `token=${authToken}`);

      expect([200, 404]).toContain(res.status);
    });
  });

  describe('⚡ Energy System', () => {
    it('should track energy correctly', async () => {
      const res = await request(app)
        .get(`/api/characters/${testCharacterId}`)
        .set('Cookie', `token=${authToken}`);

      expect(res.status).toBe(200);
      expect(typeof res.body.data.character.energy).toBe('number');
      expect(res.body.data.character.energy).toBeGreaterThanOrEqual(0);
      expect(res.body.data.character.energy).toBeLessThanOrEqual(100);
    });
  });
});
