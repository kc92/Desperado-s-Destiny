/**
 * Friend Routes Tests
 *
 * Integration tests for friend API endpoints
 */

import request from 'supertest';
import app from '../testApp';
import { Character } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import { Friend } from '../../src/models/Friend.model';
import { clearDatabase } from '../helpers/db.helpers';
import { createTestToken } from '../helpers/auth.helpers';
import { Faction } from '@desperados/shared';

describe('Friend Routes', () => {
  let char1: any;
  let char2: any;
  let user1Token: string;
  let user2Token: string;

  beforeEach(async () => {
    await clearDatabase();

    const user1 = await User.create({
      email: 'user1@test.com',
      passwordHash: 'hash1',
      emailVerified: true
    });

    const user2 = await User.create({
      email: 'user2@test.com',
      passwordHash: 'hash2',
      emailVerified: true
    });

    char1 = await Character.create({
      userId: user1._id,
      name: 'Alice',
      faction: Faction.FRONTERA,
      appearance: {
        bodyType: 'female',
        skinTone: 5,
        facePreset: 0,
        hairStyle: 0,
        hairColor: 0
      },
      currentLocation: 'frontera-town',
      gold: 100
    });

    char2 = await Character.create({
      userId: user2._id,
      name: 'Bob',
      faction: Faction.FRONTERA,
      appearance: {
        bodyType: 'male',
        skinTone: 3,
        facePreset: 1,
        hairStyle: 1,
        hairColor: 1
      },
      currentLocation: 'frontera-town',
      gold: 100
    });

    user1Token = createTestToken(user1._id.toString(), user1.email);
    user2Token = createTestToken(user2._id.toString(), user2.email);
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('POST /api/friends/request', () => {
    it('should send friend request', async () => {
      const res = await request(app)
        .post('/api/friends/request')
        .set('Authorization', `Bearer ${user1Token}`)
        .set('X-Character-ID', char1._id.toString())
        .send({
          recipientId: char2._id.toString()
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.requesterName).toBe('Alice');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/friends/request')
        .send({
          recipientId: char2._id.toString()
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/friends/requests', () => {
    beforeEach(async () => {
      await Friend.create({
        requesterId: char1._id,
        requesterName: char1.name,
        recipientId: char2._id,
        recipientName: char2.name,
        status: 'PENDING'
      });
    });

    it('should fetch friend requests', async () => {
      const res = await request(app)
        .get('/api/friends/requests')
        .set('Authorization', `Bearer ${user2Token}`)
        .set('X-Character-ID', char2._id.toString());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('GET /api/friends', () => {
    beforeEach(async () => {
      await Friend.create({
        requesterId: char1._id,
        requesterName: char1.name,
        recipientId: char2._id,
        recipientName: char2.name,
        status: 'ACCEPTED',
        respondedAt: new Date()
      });
    });

    it('should fetch friends list', async () => {
      const res = await request(app)
        .get('/api/friends')
        .set('Authorization', `Bearer ${user1Token}`)
        .set('X-Character-ID', char1._id.toString());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0]).toHaveProperty('online');
    });
  });

  describe('POST /api/friends/:id/accept', () => {
    it('should accept friend request', async () => {
      const request = await Friend.create({
        requesterId: char1._id,
        requesterName: char1.name,
        recipientId: char2._id,
        recipientName: char2.name,
        status: 'PENDING'
      });

      const res = await request(app)
        .post(`/api/friends/${request._id}/accept`)
        .set('Authorization', `Bearer ${user2Token}`)
        .set('X-Character-ID', char2._id.toString());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ACCEPTED');
    });
  });

  describe('POST /api/friends/:id/reject', () => {
    it('should reject friend request', async () => {
      const request = await Friend.create({
        requesterId: char1._id,
        requesterName: char1.name,
        recipientId: char2._id,
        recipientName: char2.name,
        status: 'PENDING'
      });

      const res = await request(app)
        .post(`/api/friends/${request._id}/reject`)
        .set('Authorization', `Bearer ${user2Token}`)
        .set('X-Character-ID', char2._id.toString());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
