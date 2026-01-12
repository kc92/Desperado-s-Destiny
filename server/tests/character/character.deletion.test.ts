/**
 * Character Deletion Tests
 *
 * Tests for character deletion endpoint
 */

import request from 'supertest';
import app from '../testApp';
import { Character } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import { createTestToken, createTestUserWithPassword } from '../helpers/auth.helpers';
import { apiPost, apiDelete, apiGet, expectSuccess, expectError } from '../helpers/api.helpers';
import { Faction } from '@desperados/shared';

describe('Character Deletion', () => {
  let user1Id: string;
  let user2Id: string;
  let token1: string;
  let token2: string;

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

  beforeEach(async () => {
    // Create User 1
    const email1 = `user1.deletion.${Date.now()}@example.com`;
    const userData1 = await createTestUserWithPassword(email1, 'TestPass123!');
    const user1 = await User.create({
      ...userData1,
      emailVerified: true
    });
    user1Id = user1._id.toString();
    token1 = createTestToken(user1Id, email1);

    // Create User 2
    const email2 = `user2.deletion.${Date.now()}@example.com`;
    const userData2 = await createTestUserWithPassword(email2, 'TestPass123!');
    const user2 = await User.create({
      ...userData2,
      emailVerified: true
    });
    user2Id = user2._id.toString();
    token2 = createTestToken(user2Id, email2);
  });

  describe('DELETE /api/characters/:id - Success Cases', () => {
    it('should soft delete a character', async () => {
      // Create character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token1);
      const characterId = createResponse.body.data.character._id;

      // Delete character
      const response = await apiDelete(app, `/api/characters/${characterId}`, token1);

      expectSuccess(response);
      expect(response.body.message).toContain('deleted');

      // Verify soft delete in database
      const character = await Character.findById(characterId);
      expect(character).toBeDefined();
      expect(character!.isActive).toBe(false);
    });

    it('should remove deleted character from character list', async () => {
      // Create character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token1);
      const characterId = createResponse.body.data.character._id;

      // Delete character
      await apiDelete(app, `/api/characters/${characterId}`, token1);

      // Check character list
      const listResponse = await apiGet(app, '/api/characters', token1);
      expectSuccess(listResponse);
      expect(listResponse.body.data.characters).toHaveLength(0);
    });

    it('should allow creating new character after deletion (within limit)', async () => {
      // Create and delete a character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token1);
      const characterId = createResponse.body.data.character._id;

      await apiDelete(app, `/api/characters/${characterId}`, token1);

      // Create new character with same name
      const newResponse = await apiPost(app, '/api/characters', validCharacterData, token1);
      expectSuccess(newResponse);
      expect(newResponse.status).toBe(201);
    });
  });

  describe('DELETE /api/characters/:id - Permission Tests', () => {
    it('should not allow deleting another user\'s character', async () => {
      // User 1 creates character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token1);
      const characterId = createResponse.body.data.character._id;

      // User 2 tries to delete it
      const response = await apiDelete(app, `/api/characters/${characterId}`, token2);

      expectError(response, 403);
      expect(response.body.error).toContain('do not own');

      // Verify character still exists
      const character = await Character.findById(characterId);
      expect(character).toBeDefined();
      expect(character!.isActive).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await apiDelete(app, '/api/characters/507f1f77bcf86cd799439099');

      expectError(response, 401);
    });
  });

  describe('DELETE /api/characters/:id - Error Cases', () => {
    it('should return 404 for non-existent character', async () => {
      const fakeId = '507f1f77bcf86cd799439099';
      const response = await apiDelete(app, `/api/characters/${fakeId}`, token1);

      expectError(response, 404);
    });

    it('should return 404 for already deleted character', async () => {
      // Create and delete character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token1);
      const characterId = createResponse.body.data.character._id;

      await apiDelete(app, `/api/characters/${characterId}`, token1);

      // Try to delete again
      const response = await apiDelete(app, `/api/characters/${characterId}`, token1);

      expectError(response, 404);
    });

    it('should return 400 for invalid character ID format', async () => {
      const response = await apiDelete(app, '/api/characters/invalid-id', token1);

      expectError(response, 400);
    });
  });

  describe('DELETE /api/characters/:id - Character Limit Integration', () => {
    it('should free up slot for new character after deletion', async () => {
      // Create 3 characters (max limit)
      const char1 = await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'Character One'
      }, token1);

      await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'Character Two'
      }, token1);

      await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'Character Three'
      }, token1);

      // Try to create 4th - should fail
      let response = await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'Character Four'
      }, token1);
      expectError(response, 400);

      // Delete one character
      const characterId = char1.body.data.character._id;
      await apiDelete(app, `/api/characters/${characterId}`, token1);

      // Now should be able to create new character
      response = await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'Character Four'
      }, token1);
      expectSuccess(response);
    });
  });
});
