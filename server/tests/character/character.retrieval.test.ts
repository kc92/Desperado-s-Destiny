/**
 * Character Retrieval Tests
 *
 * Tests for character listing and retrieval endpoints
 */

import app from '../testApp';
import { Character } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import { createTestToken, createTestUserWithPassword } from '../helpers/auth.helpers';
import { apiPost, apiGet, expectSuccess, expectError } from '../helpers/api.helpers';
import { Faction } from '@desperados/shared';

describe('Character Retrieval', () => {
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
    const email1 = `user1.retrieval.${Date.now()}@example.com`;
    const userData1 = await createTestUserWithPassword(email1, 'TestPass123!');
    const user1 = await User.create({
      ...userData1,
      emailVerified: true
    });
    user1Id = user1._id.toString();
    token1 = createTestToken(user1Id, email1);

    // Create User 2
    const email2 = `user2.retrieval.${Date.now()}@example.com`;
    const userData2 = await createTestUserWithPassword(email2, 'TestPass123!');
    const user2 = await User.create({
      ...userData2,
      emailVerified: true
    });
    user2Id = user2._id.toString();
    token2 = createTestToken(user2Id, email2);
  });

  describe('GET /api/characters - List Characters', () => {
    it('should return empty array when user has no characters', async () => {
      const response = await apiGet(app, '/api/characters', token1);

      expectSuccess(response);
      expect(response.body.data.characters).toEqual([]);
    });

    it('should return all characters for authenticated user', async () => {
      // Create 3 characters
      await apiPost(app, '/api/characters', {
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

      const response = await apiGet(app, '/api/characters', token1);

      expectSuccess(response);
      expect(response.body.data.characters).toHaveLength(3);
    });

    it('should sort characters by lastActive descending', async () => {
      // Create characters with delays to ensure different timestamps
      const char1 = await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'Character One'
      }, token1);

      await new Promise(resolve => setTimeout(resolve, 10));

      const char2 = await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'Character Two'
      }, token1);

      await new Promise(resolve => setTimeout(resolve, 10));

      const char3 = await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'Character Three'
      }, token1);

      const response = await apiGet(app, '/api/characters', token1);

      expectSuccess(response);
      expect(response.body.data.characters[0].name).toBe('Character Three');
      expect(response.body.data.characters[1].name).toBe('Character Two');
      expect(response.body.data.characters[2].name).toBe('Character One');
    });

    it('should only return characters owned by authenticated user', async () => {
      // User 1 creates characters
      await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'User1 Character'
      }, token1);

      // User 2 creates characters
      await apiPost(app, '/api/characters', {
        ...validCharacterData,
        name: 'User2 Character'
      }, token2);

      // Check user 1's characters
      const response1 = await apiGet(app, '/api/characters', token1);
      expectSuccess(response1);
      expect(response1.body.data.characters).toHaveLength(1);
      expect(response1.body.data.characters[0].name).toBe('User1 Character');

      // Check user 2's characters
      const response2 = await apiGet(app, '/api/characters', token2);
      expectSuccess(response2);
      expect(response2.body.data.characters).toHaveLength(1);
      expect(response2.body.data.characters[0].name).toBe('User2 Character');
    });

    it('should not return deleted characters', async () => {
      // Create character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token1);
      const characterId = createResponse.body.data.character._id;

      // Soft delete character
      await Character.findByIdAndUpdate(characterId, { isActive: false });

      // Should not appear in list
      const response = await apiGet(app, '/api/characters', token1);
      expectSuccess(response);
      expect(response.body.data.characters).toHaveLength(0);
    });

    it('should require authentication', async () => {
      const response = await apiGet(app, '/api/characters');

      expectError(response, 401);
    });
  });

  describe('GET /api/characters/:id - Get Single Character', () => {
    it('should return character by ID', async () => {
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token1);
      const characterId = createResponse.body.data.character._id;

      const response = await apiGet(app, `/api/characters/${characterId}`, token1);

      expectSuccess(response);
      expect(response.body.data.character._id).toBe(characterId);
      expect(response.body.data.character.name).toBe('Jack Thornton');
    });

    it('should regenerate energy before returning character', async () => {
      // Create character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token1);
      const characterId = createResponse.body.data.character._id;

      // Manually reduce energy and set old lastEnergyUpdate
      const character = await Character.findById(characterId);
      character!.energy = 50;
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      character!.lastEnergyUpdate = oneHourAgo;
      await character!.save();

      // Get character - should regenerate energy
      const response = await apiGet(app, `/api/characters/${characterId}`, token1);

      expectSuccess(response);
      
      // Should have gained roughly 30 energy (free regen rate is 30/hr)
      // Allow for small timing differences (±1)
      const expectedEnergy = 50 + 30; 
      expect(response.body.data.character.energy).toBeGreaterThanOrEqual(expectedEnergy - 1);
      expect(response.body.data.character.energy).toBeLessThanOrEqual(expectedEnergy + 1);
    });

    it('should not allow access to other user\'s character', async () => {
      // User 1 creates character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token1);
      const characterId = createResponse.body.data.character._id;

      // User 2 tries to access it
      const response = await apiGet(app, `/api/characters/${characterId}`, token2);

      expectError(response, 403);
      expect(response.body.error).toContain('do not own');
    });

    it('should return 404 for non-existent character', async () => {
      const fakeId = '507f1f77bcf86cd799439099';
      const response = await apiGet(app, `/api/characters/${fakeId}`, token1);

      expectError(response, 404);
    });

    it('should return 404 for deleted character', async () => {
      // Create and delete character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token1);
      const characterId = createResponse.body.data.character._id;

      await Character.findByIdAndUpdate(characterId, { isActive: false });

      const response = await apiGet(app, `/api/characters/${characterId}`, token1);

      expectError(response, 404);
    });

    it('should return 400 for invalid character ID format', async () => {
      const response = await apiGet(app, '/api/characters/invalid-id', token1);

      expectError(response, 400);
    });

    it('should require authentication', async () => {
      const response = await apiGet(app, '/api/characters/507f1f77bcf86cd799439099');

      expectError(response, 401);
    });
  });
});
