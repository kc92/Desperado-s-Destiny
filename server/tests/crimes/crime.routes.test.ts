/**
 * Crime Routes Tests
 *
 * Tests for crime-related HTTP endpoints
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../testApp';
import { Character, ICharacter } from '../../src/models/Character.model';
import { User, IUser } from '../../src/models/User.model';
import { createTestToken, clearDatabase } from '../helpers';
import { Faction } from '@desperados/shared';

describe('Crime Routes', () => {
  let authToken: string;
  let testUser: IUser;
  let testCharacter: ICharacter;
  let testCharacter2: ICharacter;

  beforeEach(async () => {
    await clearDatabase();

    // Create test user
    testUser = await User.create({
      email: `test${Date.now()}@example.com`,
      passwordHash: 'hashedpassword',
      isEmailVerified: true,
      createdAt: new Date(),
      lastLogin: new Date()
    });

    authToken = createTestToken(testUser._id.toString(), testUser.email);

    // Create test character
    testCharacter = await Character.create({
      userId: testUser._id,
      name: `TO${Date.now().toString().slice(-8)}`,
      faction: Faction.FRONTERA,
      appearance: {
        bodyType: 'male',
        skinTone: 5,
        facePreset: 1,
        hairStyle: 1,
        hairColor: 1
      },
      currentLocation: 'villa-esperanza',
      level: 5,
      energy: 150,
      maxEnergy: 150,
      lastEnergyUpdate: new Date(),
      stats: { cunning: 5, spirit: 2, combat: 3, craft: 1 },
      skills: [],
      inventory: [],
      combatStats: { wins: 0, losses: 0, totalDamage: 0, kills: 0 },
      wantedLevel: 0,
      lastWantedDecay: new Date(),
      bountyAmount: 0,
      lastActive: new Date(),
      isActive: true
    });

    // Create second character for arrest tests
    testCharacter2 = await Character.create({
      userId: testUser._id,
      name: `BH${Date.now().toString().slice(-8)}`,
      faction: Faction.SETTLER_ALLIANCE,
      appearance: {
        bodyType: 'female',
        skinTone: 3,
        facePreset: 2,
        hairStyle: 3,
        hairColor: 4
      },
      currentLocation: 'fort-liberty',
      level: 10,
      energy: 150,
      maxEnergy: 150,
      lastEnergyUpdate: new Date(),
      stats: { cunning: 2, spirit: 5, combat: 8, craft: 3 },
      skills: [],
      inventory: [],
      combatStats: { wins: 10, losses: 2, totalDamage: 5000, kills: 8 },
      wantedLevel: 0,
      lastWantedDecay: new Date(),
      bountyAmount: 0,
      lastActive: new Date(),
      isActive: true
    });
  });

  describe('POST /api/crimes/pay-bail', () => {
    beforeEach(async () => {
      testCharacter.sendToJail(60);
      testCharacter.wantedLevel = 3;
      await testCharacter.save();
    });

    it('should allow character to pay bail', async () => {
      const response = await request(app)
        .post('/api/crimes/pay-bail')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ characterId: testCharacter._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.goldSpent).toBe(150);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/crimes/pay-bail')
        .send({ characterId: testCharacter._id.toString() });

      expect(response.status).toBe(401);
    });

    it('should require character ownership', async () => {
      const otherUser = await User.create({
        email: 'other@example.com',
        passwordHash: 'hash',
        isEmailVerified: true
      });
      const otherToken = createTestToken(otherUser._id.toString(), otherUser.email);

      const response = await request(app)
        .post('/api/crimes/pay-bail')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ characterId: testCharacter._id.toString() });

      expect(response.status).toBe(403);
    });

    it('should fail if character not jailed', async () => {
      testCharacter.releaseFromJail();
      await testCharacter.save();

      const response = await request(app)
        .post('/api/crimes/pay-bail')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ characterId: testCharacter._id.toString() });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Character is not jailed');
    });

    it('should require characterId', async () => {
      const response = await request(app)
        .post('/api/crimes/pay-bail')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/crimes/wanted', () => {
    beforeEach(async () => {
      testCharacter.wantedLevel = 4;
      testCharacter.bountyAmount = 400;
      await testCharacter.save();
    });

    it('should return wanted status', async () => {
      const response = await request(app)
        .get('/api/crimes/wanted')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ characterId: testCharacter._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.wantedLevel).toBe(4);
      expect(response.body.data.bountyAmount).toBe(400);
      expect(response.body.data.wantedLevelName).toBe('Notorious');
      expect(response.body.data.canBeArrested).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/crimes/wanted')
        .query({ characterId: testCharacter._id.toString() });

      expect(response.status).toBe(401);
    });

    it('should require characterId', async () => {
      const response = await request(app)
        .get('/api/crimes/wanted')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/crimes/lay-low', () => {
    beforeEach(async () => {
      testCharacter.wantedLevel = 3;
      await testCharacter.save();
    });

    it('should reduce wanted level with gold', async () => {
      const response = await request(app)
        .post('/api/crimes/lay-low')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ characterId: testCharacter._id.toString(), useGold: true });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.newWantedLevel).toBe(2);
      expect(response.body.data.costPaid).toBe('50 gold');
    });

    it('should reduce wanted level with time', async () => {
      const response = await request(app)
        .post('/api/crimes/lay-low')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ characterId: testCharacter._id.toString(), useGold: false });

      expect(response.status).toBe(200);
      expect(response.body.data.newWantedLevel).toBe(2);
      expect(response.body.data.costPaid).toBe('30 minutes');
    });

    it('should fail if wanted level is 0', async () => {
      testCharacter.wantedLevel = 0;
      await testCharacter.save();

      const response = await request(app)
        .post('/api/crimes/lay-low')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ characterId: testCharacter._id.toString() });

      expect(response.status).toBe(400);
    });

    it('should be blocked if character is jailed', async () => {
      testCharacter.sendToJail(60);
      await testCharacter.save();

      const response = await request(app)
        .post('/api/crimes/lay-low')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ characterId: testCharacter._id.toString() });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('jail');
    });
  });

  describe('POST /api/crimes/arrest/:targetCharacterId', () => {
    beforeEach(async () => {
      testCharacter.wantedLevel = 4;
      testCharacter.bountyAmount = 400;
      await testCharacter.save();
    });

    it('should successfully arrest wanted criminal', async () => {
      const response = await request(app)
        .post(`/api/crimes/arrest/${testCharacter._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ characterId: testCharacter2._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.bountyEarned).toBe(400);
      expect(response.body.data.targetJailTime).toBe(120);
    });

    it('should fail if target not wanted enough', async () => {
      testCharacter.wantedLevel = 2;
      await testCharacter.save();

      const response = await request(app)
        .post(`/api/crimes/arrest/${testCharacter._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ characterId: testCharacter2._id.toString() });

      expect(response.status).toBe(400);
    });

    it('should fail if trying to arrest yourself', async () => {
      const response = await request(app)
        .post(`/api/crimes/arrest/${testCharacter._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ characterId: testCharacter._id.toString() });

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/crimes/arrest/${testCharacter._id}`)
        .send({ characterId: testCharacter2._id.toString() });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/crimes/bounties', () => {
    it('should return bounty board', async () => {
      // Create wanted characters
      await Character.create({
        userId: new mongoose.Types.ObjectId(),
        name: 'Wanted1',
        faction: Faction.FRONTERA,
        appearance: testCharacter.appearance,
        currentLocation: 'villa-esperanza',
        level: 5,
        energy: 150,
        maxEnergy: 150,
        lastEnergyUpdate: new Date(),
        stats: { cunning: 0, spirit: 0, combat: 0, craft: 0 },
        skills: [],
        inventory: [],
        combatStats: { wins: 0, losses: 0, totalDamage: 0, kills: 0 },
        wantedLevel: 5,
        bountyAmount: 500,
        isActive: true
      });

      await Character.create({
        userId: new mongoose.Types.ObjectId(),
        name: 'Wanted2',
        faction: Faction.FRONTERA,
        appearance: testCharacter.appearance,
        currentLocation: 'dusty-gulch',
        level: 3,
        energy: 150,
        maxEnergy: 150,
        lastEnergyUpdate: new Date(),
        stats: { cunning: 0, spirit: 0, combat: 0, craft: 0 },
        skills: [],
        inventory: [],
        combatStats: { wins: 0, losses: 0, totalDamage: 0, kills: 0 },
        wantedLevel: 3,
        bountyAmount: 300,
        isActive: true
      });

      const response = await request(app)
        .get('/api/crimes/bounties')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.bounties).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/crimes/bounties');
      expect(response.status).toBe(401);
    });

    it('should return empty array if no bounties', async () => {
      const response = await request(app)
        .get('/api/crimes/bounties')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.bounties).toHaveLength(0);
    });
  });

  describe('GET /api/crimes/jail-status', () => {
    it('should return jail status when jailed', async () => {
      testCharacter.sendToJail(60);
      testCharacter.wantedLevel = 3;
      await testCharacter.save();

      const response = await request(app)
        .get('/api/crimes/jail-status')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ characterId: testCharacter._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isJailed).toBe(true);
      expect(response.body.data.remainingMinutes).toBeGreaterThan(0);
      expect(response.body.data.bailCost).toBe(150);
    });

    it('should return jail status when not jailed', async () => {
      const response = await request(app)
        .get('/api/crimes/jail-status')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ characterId: testCharacter._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.data.isJailed).toBe(false);
      expect(response.body.data.remainingMinutes).toBe(0);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/crimes/jail-status')
        .query({ characterId: testCharacter._id.toString() });

      expect(response.status).toBe(401);
    });

    it('should require characterId', async () => {
      const response = await request(app)
        .get('/api/crimes/jail-status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('Multi-user isolation', () => {
    let otherUser: IUser;
    let otherCharacter: ICharacter;
    let otherToken: string;

    beforeEach(async () => {
      otherUser = await User.create({
        email: 'other@example.com',
        passwordHash: 'hash',
        isEmailVerified: true
      });

      otherToken = createTestToken(otherUser._id.toString(), otherUser.email);

      otherCharacter = await Character.create({
        userId: otherUser._id,
        name: 'OtherOutlaw',
        faction: Faction.NAHI_COALITION,
        appearance: testCharacter.appearance,
        currentLocation: 'sacred-mesa',
        level: 5,
        energy: 150,
        maxEnergy: 150,
        lastEnergyUpdate: new Date(),
        stats: { cunning: 0, spirit: 0, combat: 0, craft: 0 },
        skills: [],
        inventory: [],
        combatStats: { wins: 0, losses: 0, totalDamage: 0, kills: 0 },
        wantedLevel: 4,
        bountyAmount: 400,
        isActive: true
      });
    });

    it('should prevent accessing another users character for pay-bail', async () => {
      testCharacter.sendToJail(60);
      await testCharacter.save();

      const response = await request(app)
        .post('/api/crimes/pay-bail')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ characterId: testCharacter._id.toString() });

      expect(response.status).toBe(403);
    });

    it('should prevent accessing another users character for wanted status', async () => {
      const response = await request(app)
        .get('/api/crimes/wanted')
        .set('Authorization', `Bearer ${otherToken}`)
        .query({ characterId: testCharacter._id.toString() });

      expect(response.status).toBe(403);
    });

    it('should allow arresting another users character', async () => {
      const response = await request(app)
        .post(`/api/crimes/arrest/${otherCharacter._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ characterId: testCharacter._id.toString() });

      expect(response.status).toBe(200);
    });
  });
});
