/**
 * Energy System Tests
 *
 * Tests for energy regeneration and spending
 */

import app from '../testApp';
import { Character } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import { EnergyService } from '../../src/services/energy.service';
import { createTestToken, createTestUserWithPassword } from '../helpers/auth.helpers';
import { apiPost, apiGet, apiPatch, expectSuccess } from '../helpers/api.helpers';
import { Faction, ENERGY } from '@desperados/shared';

describe('Energy System', () => {
  let userId: string;
  let token: string;

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
    // Create User
    const email = `test.energy.${Date.now()}@example.com`;
    const userData = await createTestUserWithPassword(email, 'TestPass123!');
    const user = await User.create({
      ...userData,
      emailVerified: true
    });
    userId = user._id.toString();
    token = createTestToken(userId, email);
  });

  describe('Energy Regeneration', () => {
    it('should initialize character with full energy', async () => {
      const response = await apiPost(app, '/api/characters', validCharacterData, token);

      expectSuccess(response);
      expect(response.body.data.character.energy).toBe(ENERGY.FREE_MAX);
      expect(response.body.data.character.maxEnergy).toBe(ENERGY.FREE_MAX);
    });

    it('should calculate energy regeneration correctly', async () => {
      // Create character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token);
      const characterId = createResponse.body.data.character._id;

      // Set energy to 50 and set lastEnergyUpdate to 1 hour ago
      const character = await Character.findById(characterId);
      character!.energy = 50;
      character!.lastEnergyUpdate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      await character!.save();

      // Calculate expected regen
      // Free players: 150 energy over 5 hours = 30 energy/hour
      const expectedEnergyGain = 30; // 1 hour * 30 energy/hour

      const regenAmount = await EnergyService.calculateRegenAmount(character!);
      expect(regenAmount).toBeCloseTo(expectedEnergyGain, 0);
    });

    it('should not regenerate beyond maxEnergy', async () => {
      // Create character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token);
      const characterId = createResponse.body.data.character._id;

      // Set energy to near max and set old timestamp
      const character = await Character.findById(characterId);
      character!.energy = 140;
      character!.lastEnergyUpdate = new Date(Date.now() - 10 * 60 * 60 * 1000); // 10 hours ago
      await character!.save();

      await EnergyService.regenerateEnergy(character!);

      expect(character!.energy).toBe(ENERGY.FREE_MAX);
      expect(character!.energy).not.toBeGreaterThan(ENERGY.FREE_MAX);
    });

    it('should regenerate energy when fetching character', async () => {
      // Create character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token);
      const characterId = createResponse.body.data.character._id;

      // Set energy to 50 and set lastEnergyUpdate to 1 hour ago
      const character = await Character.findById(characterId);
      character!.energy = 50;
      character!.lastEnergyUpdate = new Date(Date.now() - 60 * 60 * 1000);
      await character!.save();

      // Fetch character - should trigger regeneration
      const response = await apiGet(app, `/api/characters/${characterId}`, token);

      expectSuccess(response);
      expect(response.body.data.character.energy).toBeGreaterThan(50);
    });

    it('should regenerate energy when selecting character', async () => {
      // Create character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token);
      const characterId = createResponse.body.data.character._id;

      // Set energy to 50 and old timestamp
      const character = await Character.findById(characterId);
      character!.energy = 50;
      character!.lastEnergyUpdate = new Date(Date.now() - 60 * 60 * 1000);
      await character!.save();

      // Select character
      const response = await apiPatch(app, `/api/characters/${characterId}/select`, {}, token);

      expectSuccess(response);
      expect(response.body.data.character.energy).toBeGreaterThan(50);
    });
  });

  describe('Energy Spending', () => {
    it('should spend energy successfully when character has enough', async () => {
      // Create character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token);
      const characterId = createResponse.body.data.character._id;

      const character = await Character.findById(characterId);
      const initialEnergy = character!.energy;

      // Spend 50 energy
      const success = await EnergyService.spendEnergy(characterId, 50);

      expect(success).toBe(true);

      const updatedCharacter = await Character.findById(characterId);
      expect(updatedCharacter!.energy).toBe(initialEnergy - 50);
    });

    it('should fail to spend energy when character has insufficient energy', async () => {
      // Create character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token);
      const characterId = createResponse.body.data.character._id;

      // Set energy to 20
      const character = await Character.findById(characterId);
      character!.energy = 20;
      await character!.save();

      // Try to spend 50 energy
      const success = await EnergyService.spendEnergy(characterId, 50);

      expect(success).toBe(false);

      // Energy should remain unchanged
      const updatedCharacter = await Character.findById(characterId);
      expect(updatedCharacter!.energy).toBe(20);
    });

    it('should update lastEnergyUpdate when spending energy', async () => {
      // Create character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token);
      const characterId = createResponse.body.data.character._id;

      const character = await Character.findById(characterId);
      const oldTimestamp = new Date(Date.now() - 60000); // 1 minute ago
      character!.lastEnergyUpdate = oldTimestamp;
      await character!.save();

      // Spend energy
      await EnergyService.spendEnergy(characterId, 10);

      const updatedCharacter = await Character.findById(characterId);
      expect(updatedCharacter!.lastEnergyUpdate.getTime()).toBeGreaterThan(oldTimestamp.getTime());
    });

    it('should prevent race conditions with transaction', async () => {
      // Create character with 100 energy
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token);
      const characterId = createResponse.body.data.character._id;

      const character = await Character.findById(characterId);
      character!.energy = 100;
      await character!.save();

      // Try to spend energy concurrently (simulate race condition)
      const results = await Promise.all([
        EnergyService.spendEnergy(characterId, 60),
        EnergyService.spendEnergy(characterId, 60)
      ]);

      // Only one should succeed
      const successCount = results.filter(r => r === true).length;
      expect(successCount).toBe(1);

      // Final energy should be 40 (100 - 60), not negative
      const finalCharacter = await Character.findById(characterId);
      expect(finalCharacter!.energy).toBeGreaterThanOrEqual(0);
      expect(finalCharacter!.energy).toBeLessThanOrEqual(100);
    });
  });

  describe('Energy Service - Additional Methods', () => {
    it('should calculate time until full energy correctly', async () => {
      // Create character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token);
      const characterId = createResponse.body.data.character._id;

      const character = await Character.findById(characterId);
      character!.energy = 0;
      character!.lastEnergyUpdate = new Date();
      await character!.save();

      const timeUntilFull = await EnergyService.getTimeUntilFullEnergy(character!);

      // Free players: 5 hours to full = 5 * 60 * 60 * 1000 ms
      const expectedTime = 5 * 60 * 60 * 1000;
      expect(timeUntilFull).toBeCloseTo(expectedTime, -3); // Allow 1000ms variance
    });

    it('should return 0 for time until full when already at max', async () => {
      // Create character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token);
      const characterId = createResponse.body.data.character._id;

      const character = await Character.findById(characterId);
      character!.energy = ENERGY.FREE_MAX;
      await character!.save();

      const timeUntilFull = await EnergyService.getTimeUntilFullEnergy(character!);
      expect(timeUntilFull).toBe(0);
    });

    it('should grant energy correctly', async () => {
      // Create character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token);
      const characterId = createResponse.body.data.character._id;

      const character = await Character.findById(characterId);
      character!.energy = 50;
      await character!.save();

      // Grant 30 energy
      await EnergyService.grantEnergy(characterId, 30, false);

      const updatedCharacter = await Character.findById(characterId);
      expect(updatedCharacter!.energy).toBe(80);
    });

    it('should not exceed maxEnergy when granting energy (unless allowed)', async () => {
      // Create character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token);
      const characterId = createResponse.body.data.character._id;

      const character = await Character.findById(characterId);
      character!.energy = 140;
      await character!.save();

      // Grant 30 energy without allowing over max
      await EnergyService.grantEnergy(characterId, 30, false);

      const updatedCharacter = await Character.findById(characterId);
      expect(updatedCharacter!.energy).toBe(ENERGY.FREE_MAX);
    });

    it('should allow exceeding maxEnergy when flag is set', async () => {
      // Create character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token);
      const characterId = createResponse.body.data.character._id;

      const character = await Character.findById(characterId);
      character!.energy = 140;
      await character!.save();

      // Grant 30 energy with allowOverMax = true
      await EnergyService.grantEnergy(characterId, 30, true);

      const updatedCharacter = await Character.findById(characterId);
      expect(updatedCharacter!.energy).toBe(170);
    });
  });

  describe('Character Select Endpoint - Energy Integration', () => {
    it('should update lastActive when selecting character', async () => {
      // Create character
      const createResponse = await apiPost(app, '/api/characters', validCharacterData, token);
      const characterId = createResponse.body.data.character._id;

      const character = await Character.findById(characterId);
      const oldTimestamp = character!.lastActive;

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      // Select character
      const response = await apiPatch(app, `/api/characters/${characterId}/select`, {}, token);

      expectSuccess(response);
      const newTimestamp = new Date(response.body.data.character.lastActive);
      expect(newTimestamp.getTime()).toBeGreaterThan(oldTimestamp.getTime());
    });
  });
});
