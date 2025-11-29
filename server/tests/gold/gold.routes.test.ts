/**
 * Gold Routes Integration Tests
 * Sprint 4 - Agent 2
 *
 * Tests for gold API endpoints
 */

import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../src/app';
import { User } from '../../src/models/User.model';
import { Character } from '../../src/models/Character.model';
import { GoldService } from '../../src/services/gold.service';
import { TransactionSource } from '../../src/models/GoldTransaction.model';
import { Faction } from '@desperados/shared';

let mongoServer: MongoMemoryServer;
let authToken: string;
let testCharacter: any;

beforeAll(async () => {
  // Disconnect if already connected
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clean database
  await User.deleteMany({});
  await Character.deleteMany({});

  // Create test user and character
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'goldroutes@example.com',
      password: 'TestPass123!',
    });

  authToken = registerRes.body.data.token;

  const charRes = await request(app)
    .post('/api/characters')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      name: 'GoldRouteTester',
      faction: Faction.FRONTERA,
      appearance: {
        bodyType: 'male',
        skinTone: 5,
        facePreset: 3,
        hairStyle: 7,
        hairColor: 2,
      },
    });

  testCharacter = charRes.body.data;
});

describe('GET /api/gold/balance', () => {
  it('should return current gold balance', async () => {
    const res = await request(app)
      .get('/api/gold/balance')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.gold).toBe(100); // Starting gold
    expect(res.body.data.characterName).toBe('GoldRouteTester');
  });

  it('should require authentication', async () => {
    await request(app)
      .get('/api/gold/balance')
      .expect(401);
  });

  it('should return 404 if no active character', async () => {
    // Delete character
    await Character.deleteMany({});

    await request(app)
      .get('/api/gold/balance')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });
});

describe('GET /api/gold/history', () => {
  beforeEach(async () => {
    const char = await Character.findById(testCharacter._id);

    // Create transaction history
    await GoldService.addGold(char!._id, 50, TransactionSource.COMBAT_VICTORY);
    await GoldService.deductGold(char!._id, 20, TransactionSource.BAIL_PAYMENT);
    await GoldService.addGold(char!._id, 100, TransactionSource.BOUNTY_REWARD);
  });

  it('should return transaction history', async () => {
    const res = await request(app)
      .get('/api/gold/history')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.transactions).toHaveLength(3);
    expect(res.body.data.statistics.totalEarned).toBe(150);
    expect(res.body.data.statistics.totalSpent).toBe(20);
  });

  it('should support pagination with limit', async () => {
    const res = await request(app)
      .get('/api/gold/history?limit=2')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.data.transactions).toHaveLength(2);
    expect(res.body.data.pagination.limit).toBe(2);
    expect(res.body.data.pagination.hasMore).toBe(true);
  });

  it('should support pagination with offset', async () => {
    const res = await request(app)
      .get('/api/gold/history?limit=2&offset=1')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.data.transactions).toHaveLength(2);
    expect(res.body.data.pagination.offset).toBe(1);
  });

  it('should reject invalid limit', async () => {
    await request(app)
      .get('/api/gold/history?limit=999')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(400);
  });

  it('should reject negative offset', async () => {
    await request(app)
      .get('/api/gold/history?offset=-1')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(400);
  });
});

describe('GET /api/gold/statistics', () => {
  beforeEach(async () => {
    const char = await Character.findById(testCharacter._id);

    await GoldService.addGold(char!._id, 50, TransactionSource.COMBAT_VICTORY);
    await GoldService.addGold(char!._id, 100, TransactionSource.BOUNTY_REWARD);
    await GoldService.deductGold(char!._id, 20, TransactionSource.BAIL_PAYMENT);
  });

  it('should return gold statistics', async () => {
    const res = await request(app)
      .get('/api/gold/statistics')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.currentBalance).toBe(230); // 100 + 50 + 100 - 20
    expect(res.body.data.totalEarned).toBe(150);
    expect(res.body.data.totalSpent).toBe(20);
    expect(res.body.data.netGold).toBe(130);
    expect(res.body.data.transactionCount).toBe(3);
  });
});
