/**
 * Character Creation Tests
 *
 * Tests for character creation endpoint
 */

import request from 'supertest';
import app from '../../src/server';
import { Character } from '../../src/models/Character.model';
import { createTestToken } from '../helpers/auth.helpers';
import { apiPost, expectSuccess, expectError } from '../helpers/api.helpers';
import { Faction, FACTIONS, CHARACTER_VALIDATION } from '@desperados/shared';

describe('Character Creation', () => {
  const userId = '507f1f77bcf86cd799439011';
  const token = createTestToken(userId, 'test@example.com');

  const validCharacterData = {
    name: 'Jack Thornton',
    faction: Faction.SETTLER_ALLIANCE,
    appearance: {
      bodyType: 'male',
      skinTone: 5,
      facePreset: 3,
      hairStyle: 7,
      hairColor: 2
    }
  };

  describe('POST /api/characters - Success Cases', () => {
    it('should create a character with valid data', async () => {
      const response = await apiPost(app, '/api/characters', validCharacterData, token);

      expectSuccess(response);
      expect(response.status).toBe(201);
      expect(response.body.data.character).toBeDefined();
      expect(response.body.data.character.name).toBe('Jack Thornton');
      expect(response.body.data.character.faction).toBe(Faction.SETTLER_ALLIANCE);
      expect(response.body.data.character.level).toBe(1);
      expect(response.body.data.character.energy).toBe(150);
      expect(response.body.data.character.maxEnergy).toBe(150);
    });

    it('should set correct starting location for Settler Alliance', async () => {
      const response = await apiPost(app, '/api/characters', {
        ...validCharacterData,
        faction: Faction.SETTLER_ALLIANCE
      }, token);

      expectSuccess(response);
      expect(response.body.data.character.currentLocation).toBe(FACTIONS[Faction.SETTLER_ALLIANCE].startingLocationId);
    });

    it('should set correct starting location for Nahi Coalition', async () => {
      const response = await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'Running Wolf',
        faction: Faction.NAHI_COALITION
      }, token);

      expectSuccess(response);
      expect(response.body.data.character.currentLocation).toBe(FACTIONS[Faction.NAHI_COALITION].startingLocationId);
    });

    it('should set correct starting location for Frontera', async () => {
      const response = await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'Miguel Rodriguez',
        faction: Faction.FRONTERA
      }, token);

      expectSuccess(response);
      expect(response.body.data.character.currentLocation).toBe(FACTIONS[Faction.FRONTERA].startingLocationId);
    });

    it('should initialize stats to 0', async () => {
      const response = await apiPost(app, '/api/characters', validCharacterData, token);

      expectSuccess(response);
      expect(response.body.data.character.stats).toEqual({
        cunning: 0,
        spirit: 0,
        combat: 0,
        craft: 0
      });
    });

    it('should trim and normalize character name', async () => {
      const response = await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: '  Jack   Thornton  '
      }, token);

      expectSuccess(response);
      expect(response.body.data.character.name).toBe('Jack Thornton');
    });
  });

  describe('POST /api/characters - Validation Errors', () => {
    it('should reject name that is too short', async () => {
      const response = await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'ab'
      }, token);

      expectError(response, 400);
      expect(response.body.errors).toContain(
        expect.stringContaining('at least')
      );
    });

    it('should reject name that is too long', async () => {
      const response = await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'a'.repeat(21)
      }, token);

      expectError(response, 400);
      expect(response.body.errors).toContain(
        expect.stringContaining('not exceed')
      );
    });

    it('should reject name with invalid characters', async () => {
      const response = await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'Jack@Thornton'
      }, token);

      expectError(response, 400);
      expect(response.body.errors).toContain(
        expect.stringContaining('invalid characters')
      );
    });

    it('should reject forbidden names', async () => {
      for (const forbiddenName of CHARACTER_VALIDATION.FORBIDDEN_NAMES) {
        const response = await apiPost(app, '/api/characters', {
          ...validCharacterData,
          name: forbiddenName
        }, token);

        expectError(response, 400);
        expect(response.body.errors).toContain(
          expect.stringContaining('not allowed')
        );
      }
    });

    it('should reject invalid faction', async () => {
      const response = await apiPost(app, '/api/characters', {
        ...validCharacterData,
        faction: 'INVALID_FACTION'
      }, token);

      expectError(response, 400);
      expect(response.body.errors).toContain(
        expect.stringContaining('Invalid faction')
      );
    });

    it('should reject invalid appearance data', async () => {
      const response = await apiPost(app, '/api/characters', {
        ...validCharacterData,
        appearance: {
          bodyType: 'invalid',
          skinTone: 11, // Out of range
          facePreset: 3,
          hairStyle: 7,
          hairColor: 2
        }
      }, token);

      expectError(response, 400);
    });
  });

  describe('POST /api/characters - Duplicate Names', () => {
    it('should reject duplicate character name (case-insensitive)', async () => {
      // Create first character
      await apiPost(app, '/api/characters', validCharacterData, token);

      // Try to create second character with same name
      const response = await apiPost(app, '/api/characters', validCharacterData, token);

      expectError(response, 409);
      expect(response.body.error).toContain('already taken');
    });

    it('should reject duplicate name with different casing', async () => {
      // Create first character
      await apiPost(app, '/api/characters', validCharacterData, token);

      // Try with different casing
      const response = await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'JACK THORNTON'
      }, token);

      expectError(response, 409);
      expect(response.body.error).toContain('already taken');
    });
  });

  describe('POST /api/characters - Character Limits', () => {
    it('should enforce maximum 3 characters per user', async () => {
      // Create 3 characters
      await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'Character One'
      }, token);

      await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'Character Two'
      }, token);

      await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'Character Three'
      }, token);

      // Try to create 4th character
      const response = await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'Character Four'
      }, token);

      expectError(response, 400);
      expect(response.body.error).toContain('Maximum');
    });

    it('should allow creating character after deleting one', async () => {
      // Create 3 characters
      const char1 = await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'Character One'
      }, token);

      await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'Character Two'
      }, token);

      await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'Character Three'
      }, token);

      // Delete one
      const characterId = char1.body.data.character._id;
      await request(app)
        .delete(`/api/characters/${characterId}`)
        .set('Authorization', `Bearer ${token}`);

      // Should now be able to create another
      const response = await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'Character Four'
      }, token);

      expectSuccess(response);
    });
  });

  describe('POST /api/characters - Authentication', () => {
    it('should require authentication', async () => {
      const response = await apiPost(app, '/api/characters', validCharacterData);

      expectError(response, 401);
    });

    it('should reject invalid token', async () => {
      const response = await apiPost(
        app,
        '/api/characters',
        validCharacterData,
        'invalid-token'
      );

      expectError(response, 401);
    });
  });

  describe('POST /api/characters - Database Persistence', () => {
    it('should persist character to database', async () => {
      const response = await apiPost(app, '/api/characters', validCharacterData, token);

      expectSuccess(response);

      const characterId = response.body.data.character._id;
      const dbCharacter = await Character.findById(characterId);

      expect(dbCharacter).toBeDefined();
      expect(dbCharacter!.name).toBe('Jack Thornton');
      expect(dbCharacter!.faction).toBe(Faction.SETTLER_ALLIANCE);
    });
  });
});
