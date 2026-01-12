
import request from 'supertest';
import mongoose from 'mongoose';
import { createTestApp } from './testApp';
import { User } from '../src/models/User.model';
import { generateToken } from '../src/utils/jwt';

const app = createTestApp();

describe('Character Creation Debug', () => {
  let token: string;

  beforeAll(async () => {
    const user = await User.create({
      email: `debug_char_${Date.now()}@test.com`,
      passwordHash: 'hash',
      isActive: true,
      emailVerified: true
    });
    token = generateToken({ userId: user._id.toString(), email: user.email });
  });

  it('should create character without 500', async () => {
    const res = await request(app)
      .post('/api/characters')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'DebugChar',
        faction: 'SETTLER_ALLIANCE',
        appearance: {
          bodyType: 'male',
          skinTone: 5,
          facePreset: 1,
          hairStyle: 1,
          hairColor: 1
        }
      });

    if (res.status === 500) {
      console.error('500 Error Body:', JSON.stringify(res.body, null, 2));
    }
    
    expect(res.status).toBe(201);
  });
});
