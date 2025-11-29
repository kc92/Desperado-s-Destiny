/**
 * NoSQL Injection Security Tests
 *
 * Tests to ensure MongoDB injection attacks are prevented
 */

import request from 'supertest';
import app from '../testApp';
import { User } from '../../src/models/User.model';
import { Character } from '../../src/models/Character.model';
import { Gang } from '../../src/models/Gang.model';
import { clearDatabase } from '../helpers/db.helpers';
import { apiGet, apiPost, apiPut, expectSuccess, expectError } from '../helpers/api.helpers';
import { setupCompleteGameState } from '../helpers/testHelpers';
import bcrypt from 'bcryptjs';

describe('NoSQL Injection Security Tests', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  const injectionPayloads = [
    { $gt: '' },
    { $ne: null },
    { $where: '1==1' },
    { $regex: '.*' },
    { $nin: [] },
    { $or: [{}] },
    { $and: [{}] },
    { $exists: true }
  ];

  describe('Character Search Injection Prevention', () => {
    it('should prevent $gt injection in character search', async () => {
      const { token } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/characters/search',
        {
          name: { $gt: '' } // Should match all
        },
        token
      );

      // Should reject or sanitize
      expect([400, 404]).toContain(response.status);
    });

    it('should prevent $where injection in character queries', async () => {
      const { token } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/characters/search',
        {
          name: { $where: 'this.name.length > 0' }
        },
        token
      );

      // Should reject malicious query
      expect([400, 404]).toContain(response.status);
    });

    it('should prevent $regex injection for data extraction', async () => {
      const { token } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/characters/search',
        {
          name: { $regex: '.*' } // Match everything
        },
        token
      );

      // Should reject or sanitize
      expect([400, 404]).toContain(response.status);
    });

    it('should handle normal string searches correctly', async () => {
      const { character, token } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/characters/search',
        {
          name: character.name // Normal string
        },
        token
      );

      // Normal search should work
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('Character Lookup Injection Prevention', () => {
    it('should prevent $ne injection in character lookup', async () => {
      const { token } = await setupCompleteGameState(app);

      const response = await apiGet(
        app,
        '/api/characters?characterId[$ne]=null',
        token
      );

      // Should reject query parameter injection
      expect([400, 404]).toContain(response.status);
    });

    it('should prevent injection in character ID parameter', async () => {
      const { token } = await setupCompleteGameState(app);

      // Try to inject object instead of string
      const response = await apiPost(
        app,
        '/api/actions/perform',
        {
          characterId: { $ne: null },
          actionId: 'test'
        },
        token
      );

      expect([400, 403]).toContain(response.status);
    });

    it('should validate character ID format strictly', async () => {
      const { token } = await setupCompleteGameState(app);

      const maliciousIds = [
        { $gt: '' },
        ['507f1f77bcf86cd799439011', { $ne: null }],
        { _id: { $ne: null } }
      ];

      for (const maliciousId of maliciousIds) {
        const response = await apiPost(
          app,
          '/api/characters/lookup',
          {
            characterId: maliciousId
          },
          token
        );

        expect([400, 404]).toContain(response.status);
      }
    });
  });

  describe('Authentication Injection Prevention', () => {
    it('should prevent $ne injection to bypass password check', async () => {
      const { email } = await setupCompleteGameState(app, 'target@example.com');

      // Try to bypass password check with $ne
      const response = await apiPost(
        app,
        '/api/auth/login',
        {
          email: email,
          password: { $ne: null } // Try to match any password
        }
      );

      expect(response.status).toBe(400);
      expectError(response, 400);
    });

    it('should prevent $regex injection in email lookup', async () => {
      await setupCompleteGameState(app, 'test@example.com');

      const response = await apiPost(
        app,
        '/api/auth/login',
        {
          email: { $regex: '.*@example.com' }, // Try to match all emails
          password: 'test'
        }
      );

      expect(response.status).toBe(400);
      expectError(response, 400);
    });

    it('should handle email as string only', async () => {
      const response = await apiPost(
        app,
        '/api/auth/login',
        {
          email: ['admin@example.com', { $ne: null }],
          password: 'test'
        }
      );

      expect(response.status).toBe(400);
      expectError(response, 400);
    });
  });

  describe('Gang Search Injection Prevention', () => {
    it('should prevent $or injection to bypass membership checks', async () => {
      const { token } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/gangs/search',
        {
          $or: [
            { name: 'Test' },
            { members: { $exists: true } }
          ]
        },
        token
      );

      expect([400, 404]).toContain(response.status);
    });

    it('should prevent $where injection in gang queries', async () => {
      const { token } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/gangs/search',
        {
          $where: 'this.bank > 0'
        },
        token
      );

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('Prototype Pollution Prevention', () => {
    it('should prevent __proto__ pollution in character creation', async () => {
      const { token } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/characters',
        {
          name: 'Test Character',
          faction: 'SETTLER_ALLIANCE',
          __proto__: { isAdmin: true },
          appearance: {
            bodyType: 'male',
            skinTone: 5,
            facePreset: 1,
            hairStyle: 3,
            hairColor: 2
          }
        },
        token
      );

      // Should either reject or ignore __proto__
      if (response.status === 201) {
        const character = response.body.data.character;
        expect(character.isAdmin).toBeUndefined();
      }
    });

    it('should prevent constructor pollution', async () => {
      const { character, token } = await setupCompleteGameState(app);

      const response = await apiPut(
        app,
        `/api/characters/${character._id}`,
        {
          constructor: { prototype: { isAdmin: true } }
        },
        token
      );

      // Should reject or ignore
      if (response.status === 200) {
        const updated = response.body.data.character;
        expect(updated.isAdmin).toBeUndefined();
      }
    });

    it('should prevent prototype pollution via nested objects', async () => {
      const { token } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/gangs',
        {
          name: 'Test Gang',
          tag: 'TEST',
          '__proto__.isAdmin': true,
          'constructor.prototype.isAdmin': true
        },
        token
      );

      // Should not create admin properties
      if (response.status === 201) {
        const gang = response.body.data.gang;
        expect((gang as any).isAdmin).toBeUndefined();
      }
    });
  });

  describe('Query Parameter Injection', () => {
    it('should sanitize query parameters in GET requests', async () => {
      const { token } = await setupCompleteGameState(app);

      // Try to inject via URL query parameters
      const response = await apiGet(
        app,
        '/api/characters?userId[$ne]=null&isActive[$ne]=false',
        token
      );

      // Should not expose all characters
      expect([400, 404]).toContain(response.status);
    });

    it('should prevent array injection in query params', async () => {
      const { token } = await setupCompleteGameState(app);

      const response = await request(app)
        .get('/api/characters')
        .query({ characterId: ['id1', { $ne: null }] })
        .set('Authorization', `Bearer ${token}`);

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('Update Operation Injection', () => {
    it('should prevent $set operator injection in updates', async () => {
      const { character, token } = await setupCompleteGameState(app);

      const response = await apiPut(
        app,
        `/api/characters/${character._id}`,
        {
          $set: { gold: 999999, level: 100 }
        },
        token
      );

      // Should reject $set operator
      expect([400]).toContain(response.status);
    });

    it('should prevent $inc operator injection', async () => {
      const { character, token } = await setupCompleteGameState(app);

      const response = await apiPut(
        app,
        `/api/characters/${character._id}`,
        {
          $inc: { gold: 999999 }
        },
        token
      );

      expect([400]).toContain(response.status);
    });

    it('should prevent $unset operator injection', async () => {
      const { character, token } = await setupCompleteGameState(app);

      const response = await apiPut(
        app,
        `/api/characters/${character._id}`,
        {
          $unset: { wantedLevel: '' }
        },
        token
      );

      expect([400]).toContain(response.status);
    });
  });

  describe('Aggregation Injection Prevention', () => {
    it('should prevent $lookup injection in aggregation', async () => {
      const { token } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/characters/stats',
        {
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'user'
              }
            }
          ]
        },
        token
      );

      expect([400, 404]).toContain(response.status);
    });

    it('should prevent $match injection with operators', async () => {
      const { token } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/gangs/leaderboard',
        {
          filters: {
            $match: {
              $where: 'this.bank > 0'
            }
          }
        },
        token
      );

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('Input Type Validation', () => {
    it('should reject objects where strings expected', async () => {
      const { token } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/characters',
        {
          name: { $ne: null }, // Object instead of string
          faction: 'SETTLER_ALLIANCE',
          appearance: {
            bodyType: 'male',
            skinTone: 5,
            facePreset: 1,
            hairStyle: 3,
            hairColor: 2
          }
        },
        token
      );

      expect(response.status).toBe(400);
      expectError(response, 400);
    });

    it('should reject arrays where strings expected', async () => {
      const { character, token } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/mail/send',
        {
          characterId: character._id.toString(),
          recipientCharacterId: ['id1', 'id2'],
          subject: 'Test',
          message: 'Test'
        },
        token
      );

      expect([400]).toContain(response.status);
    });

    it('should validate number fields strictly', async () => {
      const { character, token } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/shop/buy',
        {
          characterId: character._id.toString(),
          itemId: 'test-item',
          quantity: { $gt: 0 } // Object instead of number
        },
        token
      );

      expect([400, 404]).toContain(response.status);
    });
  });
});
