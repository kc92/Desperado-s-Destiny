/**
 * API Contract Tests
 *
 * Validates that API responses match expected TypeScript types and structures
 * Ensures frontend can rely on consistent API contracts
 *
 * NOTE: These tests assume Sprint 2 authentication and character systems are implemented
 */

import { Express } from 'express';
import mongoose from 'mongoose';
import { Faction } from '@desperados/shared';
import {
  clearDatabase,
  createTestToken,
  apiGet,
  apiPost,
  expectSuccess
} from '../helpers';

// NOTE: When Sprint 2 is implemented, import the actual app
let app: Express;

// Mock models - Replace with actual imports when Sprint 2 is complete
// import { User } from '../../src/models/User.model';

describe('API Contract Tests', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it.skip('should return correct response shape', async () => {
        const res = await apiPost(app, '/api/auth/register', {
          email: 'test@test.com',
          password: 'SecurePass123!'
        });

        expectSuccess(res);
        expect(res.status).toBe(201);

        // Verify response structure
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message');
        expect(typeof res.body.message).toBe('string');
        expect(res.body).toHaveProperty('timestamp');

        // Verify message indicates verification needed
        expect(res.body.message).toMatch(/verification|verify|email/i);
      });

      it.skip('should not return sensitive data in response', async () => {
        const res = await apiPost(app, '/api/auth/register', {
          email: 'test@test.com',
          password: 'SecurePass123!'
        });

        expectSuccess(res);

        // Should NOT contain password or hash
        expect(JSON.stringify(res.body)).not.toContain('password');
        expect(JSON.stringify(res.body)).not.toContain('passwordHash');
        expect(JSON.stringify(res.body)).not.toContain('SecurePass123!');
      });
    });

    describe('POST /api/auth/login', () => {
      it.skip('should return SafeUser type on successful login', async () => {
        // Assume user exists and is verified
        // In real test: const user = await User.create({ email, passwordHash, emailVerified: true });

        const res = await apiPost(app, '/api/auth/login', {
          email: 'test@test.com',
          password: 'SecurePass123!'
        });

        expectSuccess(res);

        // Verify response structure matches SafeUser
        expect(res.body.data).toHaveProperty('user');
        const user = res.body.data.user;

        expect(user).toMatchObject({
          _id: expect.any(String),
          email: 'test@test.com',
          emailVerified: expect.any(Boolean),
          createdAt: expect.any(String), // ISO date string
          lastLogin: expect.any(String)
        });

        // Should NOT contain sensitive fields
        expect(user).not.toHaveProperty('passwordHash');
        expect(user).not.toHaveProperty('password');
        expect(user).not.toHaveProperty('verificationToken');
        expect(user).not.toHaveProperty('resetToken');
      });

      it.skip('should set authentication cookie', async () => {
        const res = await apiPost(app, '/api/auth/login', {
          email: 'test@test.com',
          password: 'SecurePass123!'
        });

        expectSuccess(res);

        // Verify cookie is set
        expect(res.headers['set-cookie']).toBeDefined();
        const cookies = Array.isArray(res.headers['set-cookie'])
          ? res.headers['set-cookie']
          : [res.headers['set-cookie']];

        const hasTokenCookie = cookies.some(cookie => cookie.includes('token='));
        expect(hasTokenCookie).toBe(true);
      });
    });

    describe('GET /api/auth/me', () => {
      it.skip('should return current user data when authenticated', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const token = createTestToken(userId, 'test@test.com');

        const res = await apiGet(app, '/api/auth/me', token);

        expectSuccess(res);

        // Verify response structure
        expect(res.body.data).toHaveProperty('user');
        const user = res.body.data.user;

        expect(user).toMatchObject({
          _id: userId,
          email: 'test@test.com',
          emailVerified: expect.any(Boolean),
          createdAt: expect.any(String),
          lastLogin: expect.any(String)
        });
      });

      it.skip('should return 401 when not authenticated', async () => {
        const res = await apiGet(app, '/api/auth/me');

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body).toHaveProperty('error');
        expect(res.body).toHaveProperty('code');
        expect(res.body.code).toBe('AUTHENTICATION_ERROR');
      });
    });
  });

  describe('Character Endpoints', () => {
    describe('POST /api/characters', () => {
      it.skip('should return SafeCharacter type on successful creation', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const token = createTestToken(userId, 'test@test.com');

        const res = await apiPost(
          app,
          '/api/characters',
          {
            name: 'Test Hero',
            faction: Faction.SETTLER_ALLIANCE,
            appearance: {
              bodyType: 'male',
              skinTone: 5,
              facePreset: 1,
              hairStyle: 1,
              hairColor: 1
            }
          },
          token
        );

        expectSuccess(res);
        expect(res.status).toBe(201);

        // Verify response structure matches SafeCharacter
        expect(res.body.data).toHaveProperty('character');
        const character = res.body.data.character;

        expect(character).toMatchObject({
          _id: expect.any(String),
          userId: userId,
          name: 'Test Hero',
          faction: Faction.SETTLER_ALLIANCE,
          level: 1,
          experience: 0,
          experienceToNextLevel: expect.any(Number),
          energy: expect.any(Number),
          maxEnergy: expect.any(Number),
          locationId: expect.any(String),
          createdAt: expect.any(String)
        });

        // Verify energy values are correct
        expect(character.energy).toBe(150); // FREE_MAX
        expect(character.maxEnergy).toBe(150);

        // Verify starting location matches faction
        expect(character.locationId).toBe('red-gulch'); // Settler Alliance starting location
      });

      it.skip('should include appearance data in response', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const token = createTestToken(userId, 'test@test.com');

        const appearanceData = {
          bodyType: 'female',
          skinTone: 8,
          facePreset: 3,
          hairStyle: 7,
          hairColor: 4
        };

        const res = await apiPost(
          app,
          '/api/characters',
          {
            name: 'Test Heroine',
            faction: Faction.NAHI_COALITION,
            appearance: appearanceData
          },
          token
        );

        expectSuccess(res);

        // Verify appearance data is returned (optional, depending on SafeCharacter definition)
        // If appearance is included in SafeCharacter:
        // expect(res.body.data.character.appearance).toMatchObject(appearanceData);
      });

      it.skip('should validate required fields', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const token = createTestToken(userId, 'test@test.com');

        // Missing name
        const res1 = await apiPost(
          app,
          '/api/characters',
          {
            faction: Faction.SETTLER_ALLIANCE,
            appearance: { bodyType: 'male', skinTone: 5, facePreset: 1, hairStyle: 1, hairColor: 1 }
          },
          token
        );

        expect(res1.status).toBe(400);
        expect(res1.body.success).toBe(false);
        expect(res1.body.code).toBe('VALIDATION_ERROR');

        // Missing faction
        const res2 = await apiPost(
          app,
          '/api/characters',
          {
            name: 'Test Hero',
            appearance: { bodyType: 'male', skinTone: 5, facePreset: 1, hairStyle: 1, hairColor: 1 }
          },
          token
        );

        expect(res2.status).toBe(400);
        expect(res2.body.code).toBe('VALIDATION_ERROR');

        // Missing appearance
        const res3 = await apiPost(
          app,
          '/api/characters',
          {
            name: 'Test Hero',
            faction: Faction.SETTLER_ALLIANCE
          },
          token
        );

        expect(res3.status).toBe(400);
        expect(res3.body.code).toBe('VALIDATION_ERROR');
      });
    });

    describe('GET /api/characters', () => {
      it.skip('should return array of CharacterListItem objects', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const token = createTestToken(userId, 'test@test.com');

        // Create a character first
        await apiPost(
          app,
          '/api/characters',
          {
            name: 'List Test Hero',
            faction: Faction.FRONTERA,
            appearance: { bodyType: 'male', skinTone: 6, facePreset: 1, hairStyle: 1, hairColor: 1 }
          },
          token
        );

        const res = await apiGet(app, '/api/characters', token);

        expectSuccess(res);

        // Verify response structure
        expect(res.body.data).toHaveProperty('characters');
        expect(Array.isArray(res.body.data.characters)).toBe(true);
        expect(res.body.data.characters.length).toBeGreaterThan(0);

        // Verify first character matches CharacterListItem structure
        const character = res.body.data.characters[0];
        expect(character).toMatchObject({
          _id: expect.any(String),
          name: expect.any(String),
          faction: expect.any(String),
          level: expect.any(Number),
          locationId: expect.any(String)
        });
      });

      it.skip('should return empty array when user has no characters', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const token = createTestToken(userId, 'test@test.com');

        const res = await apiGet(app, '/api/characters', token);

        expectSuccess(res);
        expect(res.body.data.characters).toEqual([]);
      });
    });

    describe('GET /api/characters/:id', () => {
      it.skip('should return full SafeCharacter object', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const token = createTestToken(userId, 'test@test.com');

        // Create a character
        const createRes = await apiPost(
          app,
          '/api/characters',
          {
            name: 'Detail Test Hero',
            faction: Faction.SETTLER_ALLIANCE,
            appearance: { bodyType: 'male', skinTone: 5, facePreset: 1, hairStyle: 1, hairColor: 1 }
          },
          token
        );

        const characterId = createRes.body.data.character._id;

        // Get character details
        const res = await apiGet(app, `/api/characters/${characterId}`, token);

        expectSuccess(res);

        expect(res.body.data).toHaveProperty('character');
        const character = res.body.data.character;

        expect(character).toMatchObject({
          _id: characterId,
          userId: userId,
          name: 'Detail Test Hero',
          faction: Faction.SETTLER_ALLIANCE,
          level: expect.any(Number),
          experience: expect.any(Number),
          experienceToNextLevel: expect.any(Number),
          energy: expect.any(Number),
          maxEnergy: expect.any(Number),
          locationId: expect.any(String),
          createdAt: expect.any(String)
        });
      });
    });

    describe('DELETE /api/characters/:id', () => {
      it.skip('should return success message on deletion', async () => {
        const userId = new mongoose.Types.ObjectId().toString();
        const token = createTestToken(userId, 'test@test.com');

        // Create a character
        const createRes = await apiPost(
          app,
          '/api/characters',
          {
            name: 'Delete Test Hero',
            faction: Faction.FRONTERA,
            appearance: { bodyType: 'male', skinTone: 6, facePreset: 1, hairStyle: 1, hairColor: 1 }
          },
          token
        );

        const characterId = createRes.body.data.character._id;

        // Delete character
        const res = await apiDelete(app, `/api/characters/${characterId}`, token);

        expectSuccess(res);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toMatch(/deleted|removed/i);
      });
    });
  });

  describe('Error Response Contracts', () => {
    it.skip('should return consistent error structure for validation errors', async () => {
      const res = await apiPost(app, '/api/auth/register', {
        email: 'invalid-email', // Invalid format
        password: '123' // Too short
      });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        success: false,
        error: expect.any(String),
        code: 'VALIDATION_ERROR',
        timestamp: expect.any(String)
      });

      // May include validation details
      if (res.body.details) {
        expect(Array.isArray(res.body.details)).toBe(true);
      }
    });

    it.skip('should return consistent error structure for authentication errors', async () => {
      const res = await apiGet(app, '/api/auth/me'); // No token

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({
        success: false,
        error: expect.any(String),
        code: 'AUTHENTICATION_ERROR',
        timestamp: expect.any(String)
      });
    });

    it.skip('should return consistent error structure for authorization errors', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const token = createTestToken(userId, 'test@test.com');
      const othersCharacterId = new mongoose.Types.ObjectId().toString();

      const res = await apiDelete(app, `/api/characters/${othersCharacterId}`, token);

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        success: false,
        error: expect.any(String),
        code: 'AUTHORIZATION_ERROR',
        timestamp: expect.any(String)
      });
    });

    it.skip('should return consistent error structure for not found errors', async () => {
      const userId = new mongoose.Types.ObjectId().toString();
      const token = createTestToken(userId, 'test@test.com');
      const nonExistentId = new mongoose.Types.ObjectId().toString();

      const res = await apiGet(app, `/api/characters/${nonExistentId}`, token);

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({
        success: false,
        error: expect.any(String),
        code: 'NOT_FOUND',
        timestamp: expect.any(String)
      });
    });
  });

  describe('Response Timestamp Consistency', () => {
    it.skip('should include timestamp in all responses', async () => {
      const res = await apiGet(app, '/api/health');

      expect(res.body).toHaveProperty('timestamp');
      expect(typeof res.body.timestamp).toBe('string');

      // Verify it's a valid ISO date
      const date = new Date(res.body.timestamp);
      expect(date.toString()).not.toBe('Invalid Date');
    });
  });
});

/**
 * TEST COVERAGE SUMMARY
 *
 * These tests validate API response contracts match TypeScript types:
 *
 * 1. Authentication Endpoints
 *    - POST /api/auth/register returns success message
 *    - POST /api/auth/login returns SafeUser + sets cookie
 *    - GET /api/auth/me returns SafeUser or 401
 *    - No sensitive data in responses
 *
 * 2. Character Endpoints
 *    - POST /api/characters returns SafeCharacter (201)
 *    - GET /api/characters returns CharacterListItem[]
 *    - GET /api/characters/:id returns SafeCharacter
 *    - DELETE /api/characters/:id returns success message
 *    - Required field validation
 *    - Faction-specific starting locations
 *
 * 3. Error Response Contracts
 *    - Validation errors: 400 + VALIDATION_ERROR code
 *    - Authentication errors: 401 + AUTHENTICATION_ERROR code
 *    - Authorization errors: 403 + AUTHORIZATION_ERROR code
 *    - Not found errors: 404 + NOT_FOUND code
 *    - Consistent error structure across all endpoints
 *
 * 4. Response Consistency
 *    - All responses include timestamp
 *    - Success responses have success: true
 *    - Error responses have success: false + error message
 *    - Sensitive data never exposed
 *
 * FRONTEND IMPACT: HIGH
 * These contracts ensure the frontend can rely on consistent API structures
 * without runtime type errors or missing data.
 *
 * TOTAL TEST CASES: 15+ contract validation scenarios
 * ASSERTIONS: 80+ type and structure validations
 */

// Helper function (local to this file)
function apiDelete(app: Express, path: string, token?: string): Promise<any> {
  const req = request(app).delete(path);
  if (token) {
    req.set('Authorization', `Bearer ${token}`);
  }
  return req;
}
