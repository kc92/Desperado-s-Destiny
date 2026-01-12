/**
 * Gang Routes Tests
 *
 * Integration tests for gang API endpoints
 * Uses global MongoMemoryReplSet setup for transaction support
 */

import request from 'supertest';
import mongoose from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { createTestApp } from '../testApp';
import { Gang } from '../../src/models/Gang.model';

const app = createTestApp();
import { Character, ICharacter } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import { GangInvitation } from '../../src/models/GangInvitation.model';
import { config } from '../../src/config';
import { Faction, GangRole } from '@desperados/shared';

// Note: Global setup handles MongoMemoryReplSet connection
// afterEach cleanup is handled by global setup

function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, config.jwt.secret, { expiresIn: '1h' });
}

describe('Gang Routes', () => {
  let testUser: any;
  let testCharacter: ICharacter;
  let authToken: string;

  beforeEach(async () => {
    testUser = await User.create({
      email: 'gangroutestest@example.com',
      passwordHash: 'hashedpassword123',
      isEmailVerified: true,
    });

    testCharacter = await Character.create({
      userId: testUser._id,
      name: 'RoutesTester',
      faction: Faction.FRONTERA,
      level: 15,
      totalLevel: 100, // Required for gang creation (MIN_TOTAL_LEVEL: 100)
      dollars: 5000,   // Gang creation costs 2000 dollars
      appearance: {
        bodyType: 'male',
        skinTone: 5,
        facePreset: 3,
        hairStyle: 7,
        hairColor: 2,
      },
      currentLocation: 'el-paso',
      gold: 5000,
    });

    authToken = generateToken(testUser._id.toString(), testUser.email);
  });

  describe('POST /api/gangs/create', () => {
    it('should create a gang with valid data', async () => {
      const response = await request(app)
        .post('/api/gangs/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          characterId: testCharacter._id.toString(),
          name: 'The Legends',
          tag: 'LEG',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('The Legends');
      expect(response.body.data.tag).toBe('LEG');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/gangs/create')
        .send({
          characterId: testCharacter._id.toString(),
          name: 'Gang',
          tag: 'GNG',
        });

      expect(response.status).toBe(401);
    });

    it('should reject invalid data', async () => {
      const response = await request(app)
        .post('/api/gangs/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          characterId: testCharacter._id.toString(),
          name: 'AB',
          tag: 'AB',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/gangs', () => {
    beforeEach(async () => {
      await Gang.create({
        name: 'Gang One',
        tag: 'G1',
        leaderId: testCharacter._id,
        members: [{ characterId: testCharacter._id, role: GangRole.LEADER, joinedAt: new Date(), contribution: 0 }],
        level: 5,
      });

      await Gang.create({
        name: 'Gang Two',
        tag: 'G2',
        leaderId: new mongoose.Types.ObjectId(),
        members: [],
        level: 10,
      });
    });

    it('should list all gangs', async () => {
      const response = await request(app).get('/api/gangs');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.gangs).toHaveLength(2);
      expect(response.body.data.pagination.total).toBe(2);
    });

    it('should support pagination', async () => {
      const response = await request(app).get('/api/gangs?limit=1&offset=0');

      expect(response.status).toBe(200);
      expect(response.body.data.gangs).toHaveLength(1);
      expect(response.body.data.pagination.limit).toBe(1);
    });

    it('should support sorting by level', async () => {
      const response = await request(app).get('/api/gangs?sortBy=level&sortOrder=desc');

      expect(response.status).toBe(200);
      // Verify that gangs are sorted by level in descending order
      const gangs = response.body.data.gangs;
      expect(gangs.length).toBeGreaterThanOrEqual(2);
      // First gang should have higher or equal level compared to second
      expect(gangs[0].level).toBeGreaterThanOrEqual(gangs[1].level);
    });
  });

  describe('GET /api/gangs/:id', () => {
    let gang: any;

    beforeEach(async () => {
      gang = await Gang.create({
        name: 'Test Gang',
        tag: 'TG',
        leaderId: testCharacter._id,
        members: [{ characterId: testCharacter._id, role: GangRole.LEADER, joinedAt: new Date(), contribution: 0 }],
      });
    });

    it('should get gang by ID', async () => {
      const response = await request(app).get(`/api/gangs/${gang._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Gang');
    });

    it('should return 404 for non-existent gang', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/gangs/${fakeId}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/gangs/:id/bank/deposit', () => {
    let gang: any;

    beforeEach(async () => {
      gang = await Gang.create({
        name: 'Bank Gang',
        tag: 'BG',
        leaderId: testCharacter._id,
        members: [{ characterId: testCharacter._id, role: GangRole.LEADER, joinedAt: new Date(), contribution: 0 }],
        bank: 0,
      });

      testCharacter.gangId = gang._id;
      await testCharacter.save();
    });

    it('should deposit gold to gang bank', async () => {
      const response = await request(app)
        .post(`/api/gangs/${gang._id}/bank/deposit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          characterId: testCharacter._id.toString(),
          amount: 500,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.gang.bank).toBe(500);
      expect(response.body.data.transaction).toBeDefined();
    });

    it('should reject negative amounts', async () => {
      const response = await request(app)
        .post(`/api/gangs/${gang._id}/bank/deposit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          characterId: testCharacter._id.toString(),
          amount: -100,
        });

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/gangs/${gang._id}/bank/deposit`)
        .send({
          characterId: testCharacter._id.toString(),
          amount: 500,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/gangs/:id/bank/withdraw', () => {
    let gang: any;

    beforeEach(async () => {
      gang = await Gang.create({
        name: 'Withdraw Gang',
        tag: 'WG',
        leaderId: testCharacter._id,
        members: [{ characterId: testCharacter._id, role: GangRole.LEADER, joinedAt: new Date(), contribution: 0 }],
        bank: 5000,
      });

      testCharacter.gangId = gang._id;
      await testCharacter.save();
    });

    it('should withdraw gold from gang bank', async () => {
      const response = await request(app)
        .post(`/api/gangs/${gang._id}/bank/withdraw`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          characterId: testCharacter._id.toString(),
          amount: 1000,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.gang.bank).toBe(4000);
    });

    it('should reject withdrawal exceeding bank balance', async () => {
      const response = await request(app)
        .post(`/api/gangs/${gang._id}/bank/withdraw`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          characterId: testCharacter._id.toString(),
          amount: 10000,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/gangs/:id/upgrades/:upgradeType', () => {
    let gang: any;

    beforeEach(async () => {
      gang = await Gang.create({
        name: 'Upgrade Gang',
        tag: 'UG',
        leaderId: testCharacter._id,
        members: [{ characterId: testCharacter._id, role: GangRole.LEADER, joinedAt: new Date(), contribution: 0 }],
        bank: 10000,
        upgrades: { vaultSize: 0, memberSlots: 0, warChest: 0, perkBooster: 0 },
      });

      testCharacter.gangId = gang._id;
      await testCharacter.save();
    });

    it('should purchase vaultSize upgrade', async () => {
      const response = await request(app)
        .post(`/api/gangs/${gang._id}/upgrades/vaultSize`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          characterId: testCharacter._id.toString(),
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.upgrades.vaultSize).toBe(1);
    });

    it('should reject invalid upgrade type', async () => {
      const response = await request(app)
        .post(`/api/gangs/${gang._id}/upgrades/invalidType`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          characterId: testCharacter._id.toString(),
        });

      expect(response.status).toBe(400);
    });

    it('should require leader permission', async () => {
      // Change leadership to someone else so testCharacter is no longer the leader
      const otherLeaderId = new mongoose.Types.ObjectId();
      gang.leaderId = otherLeaderId;
      gang.members[0].role = GangRole.MEMBER;
      gang.members.push({ characterId: otherLeaderId, role: GangRole.LEADER, joinedAt: new Date(), contribution: 0 });
      await gang.save();

      const response = await request(app)
        .post(`/api/gangs/${gang._id}/upgrades/vaultSize`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          characterId: testCharacter._id.toString(),
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/gangs/:id/members/:characterId', () => {
    let gang: any;
    let member: ICharacter;

    beforeEach(async () => {
      member = await Character.create({
        userId: testUser._id,
        name: 'KickableOne',
        faction: Faction.FRONTERA,
        level: 10,
        appearance: {
          bodyType: 'male',
          skinTone: 3,
          facePreset: 2,
          hairStyle: 5,
          hairColor: 1,
        },
        currentLocation: 'el-paso',
        gold: 1000,
      });

      gang = await Gang.create({
        name: 'Kick Gang',
        tag: 'KG',
        leaderId: testCharacter._id,
        members: [
          { characterId: testCharacter._id, role: GangRole.LEADER, joinedAt: new Date(), contribution: 0 },
          { characterId: member._id, role: GangRole.MEMBER, joinedAt: new Date(), contribution: 0 },
        ],
      });

      member.gangId = gang._id;
      await member.save();
    });

    it('should kick member from gang', async () => {
      const response = await request(app)
        .delete(`/api/gangs/${gang._id}/members/${member._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          kickerId: testCharacter._id.toString(),
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('PATCH /api/gangs/:id/members/:characterId/promote', () => {
    let gang: any;
    let member: ICharacter;

    beforeEach(async () => {
      member = await Character.create({
        userId: testUser._id,
        name: 'Promotable',
        faction: Faction.FRONTERA,
        level: 10,
        appearance: {
          bodyType: 'male',
          skinTone: 3,
          facePreset: 2,
          hairStyle: 5,
          hairColor: 1,
        },
        currentLocation: 'el-paso',
        gold: 1000,
      });

      gang = await Gang.create({
        name: 'Promote Gang',
        tag: 'PG',
        leaderId: testCharacter._id,
        members: [
          { characterId: testCharacter._id, role: GangRole.LEADER, joinedAt: new Date(), contribution: 0 },
          { characterId: member._id, role: GangRole.MEMBER, joinedAt: new Date(), contribution: 0 },
        ],
      });

      member.gangId = gang._id;
      await member.save();
    });

    it('should promote member to officer', async () => {
      const response = await request(app)
        .patch(`/api/gangs/${gang._id}/members/${member._id}/promote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          promoterId: testCharacter._id.toString(),
          newRole: GangRole.OFFICER,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject invalid role', async () => {
      const response = await request(app)
        .patch(`/api/gangs/${gang._id}/members/${member._id}/promote`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          promoterId: testCharacter._id.toString(),
          newRole: 'invalidRole',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/gangs/:id', () => {
    let gang: any;

    beforeEach(async () => {
      gang = await Gang.create({
        name: 'Disband Gang',
        tag: 'DG',
        leaderId: testCharacter._id,
        members: [{ characterId: testCharacter._id, role: GangRole.LEADER, joinedAt: new Date(), contribution: 0 }],
        bank: 1000,
      });

      testCharacter.gangId = gang._id;
      await testCharacter.save();
    });

    it('should disband gang', async () => {
      const response = await request(app)
        .delete(`/api/gangs/${gang._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          characterId: testCharacter._id.toString(),
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const updatedGang = await Gang.findById(gang._id);
      expect(updatedGang!.isActive).toBe(false);
    });
  });

  describe('GET /api/gangs/:id/transactions', () => {
    let gang: any;

    beforeEach(async () => {
      gang = await Gang.create({
        name: 'Transaction Gang',
        tag: 'TRG',
        leaderId: testCharacter._id,
        members: [{ characterId: testCharacter._id, role: GangRole.LEADER, joinedAt: new Date(), contribution: 0 }],
        bank: 0,
      });

      testCharacter.gangId = gang._id;
      await testCharacter.save();
    });

    it('should get gang transaction history', async () => {
      const response = await request(app)
        .get(`/api/gangs/${gang._id}/transactions`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 10, offset: 0 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
    });
  });

  describe('GET /api/gangs/:id/stats', () => {
    let gang: any;

    beforeEach(async () => {
      gang = await Gang.create({
        name: 'Stats Gang',
        tag: 'STG',
        leaderId: testCharacter._id,
        members: [{ characterId: testCharacter._id, role: GangRole.LEADER, joinedAt: new Date(), contribution: 2000 }],
        stats: { totalWins: 5, totalLosses: 2, territoriesConquered: 3, totalRevenue: 10000 },
      });
    });

    it('should get gang statistics', async () => {
      const response = await request(app).get(`/api/gangs/${gang._id}/stats`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalDeposits');
      expect(response.body.data).toHaveProperty('topContributors');
    });
  });
});
