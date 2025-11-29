/**
 * Crime Integration Tests
 *
 * End-to-end tests for complete crime workflows
 */

import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../testApp';
import { Character, ICharacter } from '../../src/models/Character.model';
import { User, IUser } from '../../src/models/User.model';
import { Action, ActionType } from '../../src/models/Action.model';
import { createTestToken, clearDatabase } from '../helpers';
import { Faction, Suit } from '@desperados/shared';

describe('Crime System Integration', () => {
  let authToken: string;
  let testUser: IUser;
  let criminal: ICharacter;
  let bountyHunter: ICharacter;

  beforeEach(async () => {
    await clearDatabase();

    testUser = await User.create({
      email: `test${Date.now()}@example.com`,
      passwordHash: 'hashedpassword',
      isEmailVerified: true
    });

    authToken = createTestToken(testUser._id.toString(), testUser.email);

    criminal = await Character.create({
      userId: testUser._id,
      name: `Criminal${Date.now()}`,
      faction: Faction.FRONTERA,
      appearance: {
        bodyType: 'male',
        skinTone: 5,
        facePreset: 1,
        hairStyle: 1,
        hairColor: 1
      },
      currentLocation: 'villa-esperanza',
      level: 5,
      energy: 150,
      maxEnergy: 150,
      lastEnergyUpdate: new Date(),
      stats: { cunning: 5, spirit: 2, combat: 3, craft: 1 },
      skills: [],
      inventory: [],
      combatStats: { wins: 0, losses: 0, totalDamage: 0, kills: 0 },
      isActive: true
    });

    bountyHunter = await Character.create({
      userId: testUser._id,
      name: `Hunter${Date.now()}`,
      faction: Faction.SETTLER_ALLIANCE,
      appearance: {
        bodyType: 'female',
        skinTone: 3,
        facePreset: 2,
        hairStyle: 3,
        hairColor: 4
      },
      currentLocation: 'fort-liberty',
      level: 10,
      energy: 150,
      maxEnergy: 150,
      lastEnergyUpdate: new Date(),
      stats: { cunning: 2, spirit: 5, combat: 8, craft: 3 },
      skills: [],
      inventory: [],
      combatStats: { wins: 10, losses: 2, totalDamage: 5000, kills: 8 },
      isActive: true
    });
  });

  describe('Complete Crime → Jail → Bail Flow', () => {
    let crimeAction: any;

    beforeEach(async () => {
      crimeAction = await Action.create({
        type: ActionType.CRIME,
        name: 'Petty Theft',
        description: 'Steal something small',
        energyCost: 10,
        difficulty: 25,
        requiredSuit: Suit.SPADES,
        rewards: { xp: 20, gold: 10, items: [] },
        crimeProperties: {
          jailTimeOnFailure: 30,
          wantedLevelIncrease: 1,
          witnessChance: 50,
          bailCost: 50
        },
        isActive: true
      });
    });

    it('should complete full crime flow: commit → caught → jailed → pay bail', async () => {
      // 1. Perform crime action (will be integrated with action system)
      // For now, manually set up as if crime was caught
      criminal.sendToJail(30);
      criminal.increaseWantedLevel(1);
      await criminal.save();

      // 2. Verify character is jailed
      let response = await request(app)
        .get('/api/crimes/jail-status')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ characterId: criminal._id.toString() });

      expect(response.body.data.isJailed).toBe(true);
      expect(response.body.data.wantedLevel).toBe(1);

      // 3. Try to perform action while jailed (should fail)
      // This would use the action endpoint with jail middleware

      // 4. Pay bail to escape
      response = await request(app)
        .post('/api/crimes/pay-bail')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ characterId: criminal._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // 5. Verify character is free
      response = await request(app)
        .get('/api/crimes/jail-status')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ characterId: criminal._id.toString() });

      expect(response.body.data.isJailed).toBe(false);
    });
  });

  describe('Wanted Level Accumulation', () => {
    it('should accumulate wanted level across multiple crimes', async () => {
      // Simulate multiple crimes
      for (let i = 0; i < 3; i++) {
        criminal.increaseWantedLevel(1);
      }
      await criminal.save();

      const response = await request(app)
        .get('/api/crimes/wanted')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ characterId: criminal._id.toString() });

      expect(response.body.data.wantedLevel).toBe(3);
      expect(response.body.data.canBeArrested).toBe(true);
      expect(response.body.data.bountyAmount).toBe(300);
    });

    it('should cap wanted level at 5', async () => {
      criminal.increaseWantedLevel(10);
      await criminal.save();

      const response = await request(app)
        .get('/api/crimes/wanted')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ characterId: criminal._id.toString() });

      expect(response.body.data.wantedLevel).toBe(5);
      expect(response.body.data.wantedLevelName).toBe('Most Wanted');
    });
  });

  describe('Player Arrest Flow', () => {
    beforeEach(async () => {
      criminal.wantedLevel = 4;
      criminal.bountyAmount = 400;
      await criminal.save();
    });

    it('should complete full arrest flow: wanted → arrest → jailed', async () => {
      // 1. Check bounty board
      let response = await request(app)
        .get('/api/crimes/bounties')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data.bounties).toHaveLength(1);
      expect(response.body.data.bounties[0].name).toBe(criminal.name);

      // 2. Arrest the criminal
      response = await request(app)
        .post(`/api/crimes/arrest/${criminal._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ characterId: bountyHunter._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.data.bountyEarned).toBe(400);

      // 3. Verify criminal is jailed
      response = await request(app)
        .get('/api/crimes/jail-status')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ characterId: criminal._id.toString() });

      expect(response.body.data.isJailed).toBe(true);

      // 4. Verify wanted level reset
      response = await request(app)
        .get('/api/crimes/wanted')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ characterId: criminal._id.toString() });

      expect(response.body.data.wantedLevel).toBe(0);

      // 5. Verify no longer on bounty board
      response = await request(app)
        .get('/api/crimes/bounties')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data.bounties).toHaveLength(0);
    });

    it('should prevent duplicate arrests with cooldown', async () => {
      // First arrest
      await request(app)
        .post(`/api/crimes/arrest/${criminal._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ characterId: bountyHunter._id.toString() });

      // Reset criminal status for second attempt
      const updatedCriminal = await Character.findById(criminal._id);
      updatedCriminal!.wantedLevel = 4;
      updatedCriminal!.bountyAmount = 400;
      updatedCriminal!.releaseFromJail();
      await updatedCriminal!.save();

      // Second arrest (should fail due to cooldown)
      const response = await request(app)
        .post(`/api/crimes/arrest/${criminal._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ characterId: bountyHunter._id.toString() });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('cooldown');
    });
  });

  describe('Wanted Level Decay', () => {
    it('should reduce wanted level after laying low', async () => {
      criminal.wantedLevel = 3;
      await criminal.save();

      // Lay low with gold
      const response = await request(app)
        .post('/api/crimes/lay-low')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ characterId: criminal._id.toString(), useGold: true });

      expect(response.status).toBe(200);
      expect(response.body.data.newWantedLevel).toBe(2);

      // Verify wanted status updated
      const statusResponse = await request(app)
        .get('/api/crimes/wanted')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ characterId: criminal._id.toString() });

      expect(statusResponse.body.data.wantedLevel).toBe(2);
    });

    it('should allow multiple lay-low actions to clear wanted level', async () => {
      criminal.wantedLevel = 3;
      await criminal.save();

      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/crimes/lay-low')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ characterId: criminal._id.toString(), useGold: false });
      }

      const response = await request(app)
        .get('/api/crimes/wanted')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ characterId: criminal._id.toString() });

      expect(response.body.data.wantedLevel).toBe(0);
    });
  });

  describe('Jail Prevention Middleware', () => {
    beforeEach(async () => {
      criminal.sendToJail(60);
      await criminal.save();
    });

    it('should prevent lay-low while jailed', async () => {
      criminal.wantedLevel = 3;
      await criminal.save();

      const response = await request(app)
        .post('/api/crimes/lay-low')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ characterId: criminal._id.toString() });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('jail');
      expect(response.body.jail.isJailed).toBe(true);
    });

    it('should provide jail info in error response', async () => {
      const response = await request(app)
        .post('/api/crimes/lay-low')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ characterId: criminal._id.toString() });

      expect(response.body.jail).toHaveProperty('remainingMinutes');
      expect(response.body.jail).toHaveProperty('bailCost');
      expect(response.body.jail).toHaveProperty('message');
      expect(response.body.jail).toHaveProperty('flavorText');
    });
  });

  describe('Multi-Criminal Bounty Board', () => {
    let otherUser: IUser;
    let criminal2: ICharacter;
    let criminal3: ICharacter;

    beforeEach(async () => {
      otherUser = await User.create({
        email: 'other@example.com',
        passwordHash: 'hash',
        isEmailVerified: true
      });

      criminal2 = await Character.create({
        userId: otherUser._id,
        name: 'Outlaw2',
        faction: Faction.FRONTERA,
        appearance: criminal.appearance,
        currentLocation: 'dusty-gulch',
        level: 7,
        energy: 150,
        maxEnergy: 150,
        lastEnergyUpdate: new Date(),
        stats: { cunning: 0, spirit: 0, combat: 0, craft: 0 },
        skills: [],
        inventory: [],
        combatStats: { wins: 0, losses: 0, totalDamage: 0, kills: 0 },
        wantedLevel: 5,
        bountyAmount: 500,
        isActive: true
      });

      criminal3 = await Character.create({
        userId: otherUser._id,
        name: 'Outlaw3',
        faction: Faction.NAHI_COALITION,
        appearance: criminal.appearance,
        currentLocation: 'sacred-mesa',
        level: 4,
        energy: 150,
        maxEnergy: 150,
        lastEnergyUpdate: new Date(),
        stats: { cunning: 0, spirit: 0, combat: 0, craft: 0 },
        skills: [],
        inventory: [],
        combatStats: { wins: 0, losses: 0, totalDamage: 0, kills: 0 },
        wantedLevel: 3,
        bountyAmount: 300,
        isActive: true
      });
    });

    it('should show all wanted criminals across all users', async () => {
      const response = await request(app)
        .get('/api/crimes/bounties')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data.bounties).toHaveLength(2);
      expect(response.body.data.total).toBe(2);

      const bounties = response.body.data.bounties;
      expect(bounties.some((b: any) => b.name === 'Outlaw2')).toBe(true);
      expect(bounties.some((b: any) => b.name === 'Outlaw3')).toBe(true);
    });

    it('should allow arresting criminals from different users', async () => {
      const response = await request(app)
        .post(`/api/crimes/arrest/${criminal2._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ characterId: bountyHunter._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.data.bountyEarned).toBe(500);
    });
  });

  describe('Character Methods Integration', () => {
    it('should correctly calculate bounty based on wanted level', async () => {
      for (let level = 0; level <= 5; level++) {
        criminal.wantedLevel = level;
        await criminal.save();

        const response = await request(app)
          .get('/api/crimes/wanted')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ characterId: criminal._id.toString() });

        expect(response.body.data.bountyAmount).toBe(level * 100);
      }
    });

    it('should correctly identify arrestable characters', async () => {
      const testCases = [
        { wantedLevel: 0, canBeArrested: false },
        { wantedLevel: 2, canBeArrested: false },
        { wantedLevel: 3, canBeArrested: true },
        { wantedLevel: 5, canBeArrested: true }
      ];

      for (const testCase of testCases) {
        criminal.wantedLevel = testCase.wantedLevel;
        await criminal.save();

        const response = await request(app)
          .get('/api/crimes/wanted')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ characterId: criminal._id.toString() });

        expect(response.body.data.canBeArrested).toBe(testCase.canBeArrested);
      }
    });
  });

  describe('Wanted Level Progression', () => {
    it('should progress through wanted level tiers correctly', async () => {
      const tiers = [
        { level: 0, name: 'Clean', canArrest: false },
        { level: 1, name: 'Petty Criminal', canArrest: false },
        { level: 2, name: 'Known Thief', canArrest: false },
        { level: 3, name: 'Outlaw', canArrest: true },
        { level: 4, name: 'Notorious', canArrest: true },
        { level: 5, name: 'Most Wanted', canArrest: true }
      ];

      for (const tier of tiers) {
        criminal.wantedLevel = tier.level;
        criminal.bountyAmount = tier.level * 100;
        await criminal.save();

        const response = await request(app)
          .get('/api/crimes/wanted')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ characterId: criminal._id.toString() });

        expect(response.body.data.wantedLevelName).toBe(tier.name);
        expect(response.body.data.canBeArrested).toBe(tier.canArrest);
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid character IDs gracefully', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const response = await request(app)
        .get('/api/crimes/wanted')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ characterId: fakeId });

      expect(response.status).toBe(404);
    });

    it('should handle missing authentication', async () => {
      const response = await request(app)
        .get('/api/crimes/bounties');

      expect(response.status).toBe(401);
    });

    it('should handle attempting to arrest while jailed', async () => {
      bountyHunter.sendToJail(60);
      await bountyHunter.save();

      criminal.wantedLevel = 5;
      criminal.bountyAmount = 500;
      await criminal.save();

      const response = await request(app)
        .post(`/api/crimes/arrest/${criminal._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ characterId: bountyHunter._id.toString() });

      expect(response.status).toBe(400);
    });
  });
});
