
import request from 'supertest';
import mongoose from 'mongoose';
import { createTestApp } from './testApp';
import { User } from '../src/models/User.model';
import { Character } from '../src/models/Character.model';
import { Action, ActionType } from '../src/models/Action.model';
import { generateToken } from '../src/utils/jwt';

const app = createTestApp();

describe('Action Challenge Debug', () => {
  let token: string;
  let characterId: string;
  let actionId: string;

  beforeAll(async () => {
    // 1. Create User
    const user = await User.create({
      email: `debug_action_${Date.now()}@test.com`,
      passwordHash: 'hash',
      isActive: true,
      emailVerified: true
    });
    token = generateToken({ userId: user._id.toString(), email: user.email });

    // 2. Create Character
    const character = await Character.create({
      userId: user._id,
      name: 'DebugHero',
      faction: 'SETTLER_ALLIANCE',
      currentLocation: 'frontera-town',
      appearance: {
        bodyType: 'male',
        skinTone: 5,
        facePreset: 1,
        hairStyle: 1,
        hairColor: 1
      },
      energy: 100,
      maxEnergy: 100,
      stats: { cunning: 5, spirit: 5, combat: 5, craft: 5 }
    });
    characterId = character._id.toString();

    // 3. Create Action
    const action = await Action.create({
      name: 'Debug Action',
      description: 'Test action for debugging purposes',
      type: ActionType.CRIME,
      energyCost: 10,
      difficulty: 1,
      rewards: { xp: 10, gold: 10 },
      isActive: true
    });
    actionId = action._id.toString();
  });

  it('should perform challenge without 500', async () => {
    const res = await request(app)
      .post('/api/actions/challenge')
      .set('Authorization', `Bearer ${token}`)
      .send({ actionId, characterId });

    if (res.status === 500) {
      console.error('500 Error Body:', JSON.stringify(res.body, null, 2));
    }
    
    expect(res.status).toBe(200);
  });
});
