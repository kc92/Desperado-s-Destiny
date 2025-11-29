/**
 * Skill Routes Tests
 *
 * Integration tests for skill training endpoints
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/server';
import { Character, ICharacter } from '../../src/models/Character.model';
import { SkillService } from '../../src/services/skill.service';
import { createTestToken } from '../helpers/auth.helpers';
import { apiGet, apiPost, expectSuccess, expectError } from '../helpers/api.helpers';
import { Faction, SKILLS, DestinySuit } from '@desperados/shared';
import { clearDatabase } from '../helpers';

describe('Skill Routes', () => {
  const userId = '507f1f77bcf86cd799439011';
  const token = createTestToken(userId, 'test@example.com');
  let testCharacter: ICharacter;

  beforeEach(async () => {
    await clearDatabase();

    // Create test character with initialized skills
    testCharacter = await Character.create({
      userId: new mongoose.Types.ObjectId(userId),
      name: 'Test Gunslinger',
      faction: Faction.FRONTERA,
      appearance: {
        bodyType: 'male',
        skinTone: 5,
        facePreset: 1,
        hairStyle: 1,
        hairColor: 1
      },
      currentLocation: 'villa-esperanza',
      level: 1,
      experience: 0,
      energy: 150,
      maxEnergy: 150,
      lastEnergyUpdate: new Date(),
      stats: { cunning: 0, spirit: 0, combat: 0, craft: 0 },
      skills: SkillService.initializeSkills(),
      inventory: [],
      lastActive: new Date(),
      isActive: true
    });
  });

  describe('GET /api/skills - Get Skills', () => {
    it('should get all skills for character', async () => {
      const response = await apiGet(
        app,
        `/api/skills?characterId=${testCharacter._id}`,
        token
      );

      expectSuccess(response);
      expect(response.body.data.skills).toBeDefined();
      expect(response.body.data.skills).toHaveLength(25);
      expect(response.body.data.characterSkills).toBeDefined();
      expect(response.body.data.characterSkills).toHaveLength(25);
      expect(response.body.data.bonuses).toBeDefined();
    });

    it('should include all skill information', async () => {
      const response = await apiGet(
        app,
        `/api/skills?characterId=${testCharacter._id}`,
        token
      );

      expectSuccess(response);
      const firstSkill = response.body.data.skills[0];
      expect(firstSkill).toHaveProperty('id');
      expect(firstSkill).toHaveProperty('name');
      expect(firstSkill).toHaveProperty('description');
      expect(firstSkill).toHaveProperty('suit');
      expect(firstSkill).toHaveProperty('category');
      expect(firstSkill).toHaveProperty('maxLevel');
      expect(firstSkill).toHaveProperty('icon');
    });

    it('should include character skill progress', async () => {
      const response = await apiGet(
        app,
        `/api/skills?characterId=${testCharacter._id}`,
        token
      );

      expectSuccess(response);
      const firstCharSkill = response.body.data.characterSkills[0];
      expect(firstCharSkill).toHaveProperty('skillId');
      expect(firstCharSkill).toHaveProperty('level');
      expect(firstCharSkill).toHaveProperty('xp');
      expect(firstCharSkill).toHaveProperty('xpToNextLevel');
      expect(firstCharSkill.level).toBe(1);
      expect(firstCharSkill.xp).toBe(0);
    });

    it('should show no current training by default', async () => {
      const response = await apiGet(
        app,
        `/api/skills?characterId=${testCharacter._id}`,
        token
      );

      expectSuccess(response);
      expect(response.body.data.currentTraining).toBeNull();
    });

    it('should show current training if active', async () => {
      // Start training
      await SkillService.startTraining(testCharacter._id.toString(), 'lockpicking');

      const response = await apiGet(
        app,
        `/api/skills?characterId=${testCharacter._id}`,
        token
      );

      expectSuccess(response);
      expect(response.body.data.currentTraining).not.toBeNull();
      expect(response.body.data.currentTraining.skillId).toBe('lockpicking');
      expect(response.body.data.currentTraining.startedAt).toBeDefined();
      expect(response.body.data.currentTraining.completesAt).toBeDefined();
    });

    it('should auto-complete training if finished', async () => {
      // Start training
      await SkillService.startTraining(testCharacter._id.toString(), 'lockpicking');

      // Manually set completion to past
      await testCharacter.reload();
      const training = testCharacter.getCurrentTraining()!;
      training.trainingCompletes = new Date(Date.now() - 1000);
      await testCharacter.save();

      // GET should auto-complete
      const response = await apiGet(
        app,
        `/api/skills?characterId=${testCharacter._id}`,
        token
      );

      expectSuccess(response);
      expect(response.body.data.currentTraining).toBeNull();

      // Check XP was awarded
      const lockpicking = response.body.data.characterSkills.find(
        (s: any) => s.skillId === 'lockpicking'
      );
      expect(lockpicking.xp).toBe(100);
    });

    it('should calculate suit bonuses correctly', async () => {
      const response = await apiGet(
        app,
        `/api/skills?characterId=${testCharacter._id}`,
        token
      );

      expectSuccess(response);
      expect(response.body.data.bonuses).toHaveProperty(DestinySuit.SPADES);
      expect(response.body.data.bonuses).toHaveProperty(DestinySuit.HEARTS);
      expect(response.body.data.bonuses).toHaveProperty(DestinySuit.CLUBS);
      expect(response.body.data.bonuses).toHaveProperty(DestinySuit.DIAMONDS);

      // All skills at level 1, so each suit should have bonuses
      expect(response.body.data.bonuses[DestinySuit.SPADES]).toBeGreaterThan(0);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/skills?characterId=${testCharacter._id}`)
        .expect(401);

      expectError(response);
    });

    it('should require character ownership', async () => {
      const otherUserId = '507f1f77bcf86cd799439012';
      const otherToken = createTestToken(otherUserId, 'other@example.com');

      const response = await apiGet(
        app,
        `/api/skills?characterId=${testCharacter._id}`,
        otherToken
      );

      expect(response.status).toBe(403);
      expectError(response);
    });
  });

  describe('POST /api/skills/train - Start Training', () => {
    it('should start training a skill', async () => {
      const response = await apiPost(
        app,
        `/api/skills/train?characterId=${testCharacter._id}`,
        { skillId: 'lockpicking' },
        token
      );

      expectSuccess(response);
      expect(response.body.data.training).toBeDefined();
      expect(response.body.data.training.skillId).toBe('lockpicking');
      expect(response.body.data.training.startedAt).toBeDefined();
      expect(response.body.data.training.completesAt).toBeDefined();
      expect(response.body.data.timeRemaining).toBeGreaterThan(0);
    });

    it('should calculate correct training duration', async () => {
      const response = await apiPost(
        app,
        `/api/skills/train?characterId=${testCharacter._id}`,
        { skillId: 'lockpicking' },
        token
      );

      expectSuccess(response);
      const expectedDuration = SkillService.calculateSkillTrainingTime('lockpicking', 1);
      const actualDuration = response.body.data.timeRemaining;

      // Allow 1 second tolerance
      expect(Math.abs(actualDuration - expectedDuration)).toBeLessThan(1000);
    });

    it('should prevent training two skills at once', async () => {
      // Start training lockpicking
      await apiPost(
        app,
        `/api/skills/train?characterId=${testCharacter._id}`,
        { skillId: 'lockpicking' },
        token
      );

      // Try to train stealth
      const response = await apiPost(
        app,
        `/api/skills/train?characterId=${testCharacter._id}`,
        { skillId: 'stealth' },
        token
      );

      expect(response.status).toBe(400);
      expectError(response);
      expect(response.body.error).toContain('Already training');
    });

    it('should fail for invalid skill ID', async () => {
      const response = await apiPost(
        app,
        `/api/skills/train?characterId=${testCharacter._id}`,
        { skillId: 'invalid_skill' },
        token
      );

      expect(response.status).toBe(400);
      expectError(response);
      expect(response.body.error).toContain('Invalid skill');
    });

    it('should fail if skill at max level', async () => {
      // Set lockpicking to max level
      const lockpicking = testCharacter.skills.find(s => s.skillId === 'lockpicking')!;
      lockpicking.level = 50;
      await testCharacter.save();

      const response = await apiPost(
        app,
        `/api/skills/train?characterId=${testCharacter._id}`,
        { skillId: 'lockpicking' },
        token
      );

      expect(response.status).toBe(400);
      expectError(response);
      expect(response.body.error).toContain('maximum level');
    });

    it('should fail without skillId', async () => {
      const response = await apiPost(
        app,
        `/api/skills/train?characterId=${testCharacter._id}`,
        {},
        token
      );

      expect(response.status).toBe(400);
      expectError(response);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/skills/train?characterId=${testCharacter._id}`)
        .send({ skillId: 'lockpicking' })
        .expect(401);

      expectError(response);
    });

    it('should require character ownership', async () => {
      const otherUserId = '507f1f77bcf86cd799439012';
      const otherToken = createTestToken(otherUserId, 'other@example.com');

      const response = await apiPost(
        app,
        `/api/skills/train?characterId=${testCharacter._id}`,
        { skillId: 'lockpicking' },
        otherToken
      );

      expect(response.status).toBe(403);
      expectError(response);
    });
  });

  describe('POST /api/skills/cancel - Cancel Training', () => {
    it('should cancel active training', async () => {
      // Start training
      await apiPost(
        app,
        `/api/skills/train?characterId=${testCharacter._id}`,
        { skillId: 'lockpicking' },
        token
      );

      // Cancel training
      const response = await apiPost(
        app,
        `/api/skills/cancel?characterId=${testCharacter._id}`,
        {},
        token
      );

      expectSuccess(response);
      expect(response.body.message).toContain('cancelled');

      // Verify training is cancelled
      await testCharacter.reload();
      expect(testCharacter.getCurrentTraining()).toBeNull();
    });

    it('should not award XP when cancelling', async () => {
      // Start training
      await apiPost(
        app,
        `/api/skills/train?characterId=${testCharacter._id}`,
        { skillId: 'lockpicking' },
        token
      );

      const lockpickingBefore = testCharacter.skills.find(s => s.skillId === 'lockpicking')!;
      const xpBefore = lockpickingBefore.experience;

      // Cancel
      await apiPost(
        app,
        `/api/skills/cancel?characterId=${testCharacter._id}`,
        {},
        token
      );

      // Check XP unchanged
      await testCharacter.reload();
      const lockpickingAfter = testCharacter.skills.find(s => s.skillId === 'lockpicking')!;
      expect(lockpickingAfter.experience).toBe(xpBefore);
    });

    it('should fail if not training', async () => {
      const response = await apiPost(
        app,
        `/api/skills/cancel?characterId=${testCharacter._id}`,
        {},
        token
      );

      expect(response.status).toBe(400);
      expectError(response);
      expect(response.body.error).toContain('Not currently training');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/skills/cancel?characterId=${testCharacter._id}`)
        .expect(401);

      expectError(response);
    });
  });

  describe('POST /api/skills/complete - Complete Training', () => {
    it('should complete training and award XP', async () => {
      // Start training
      await apiPost(
        app,
        `/api/skills/train?characterId=${testCharacter._id}`,
        { skillId: 'lockpicking' },
        token
      );

      // Set completion to past
      await testCharacter.reload();
      const training = testCharacter.getCurrentTraining()!;
      training.trainingCompletes = new Date(Date.now() - 1000);
      await testCharacter.save();

      // Complete
      const response = await apiPost(
        app,
        `/api/skills/complete?characterId=${testCharacter._id}`,
        {},
        token
      );

      expectSuccess(response);
      expect(response.body.data.result).toBeDefined();
      expect(response.body.data.result.xpAwarded).toBe(100);
      expect(response.body.data.result.newXP).toBe(100);
      expect(response.body.data.bonuses).toBeDefined();
    });

    it('should level up skill when XP threshold reached', async () => {
      // Set lockpicking to 99 XP
      const lockpicking = testCharacter.skills.find(s => s.skillId === 'lockpicking')!;
      lockpicking.experience = 99;
      await testCharacter.save();

      // Start and complete training
      await apiPost(
        app,
        `/api/skills/train?characterId=${testCharacter._id}`,
        { skillId: 'lockpicking' },
        token
      );

      await testCharacter.reload();
      const training = testCharacter.getCurrentTraining()!;
      training.trainingCompletes = new Date(Date.now() - 1000);
      await testCharacter.save();

      const response = await apiPost(
        app,
        `/api/skills/complete?characterId=${testCharacter._id}`,
        {},
        token
      );

      expectSuccess(response);
      expect(response.body.data.result.leveledUp).toBe(true);
      expect(response.body.data.result.newLevel).toBe(2);
      expect(response.body.data.message).toContain('leveled up');
    });

    it('should fail if training not complete', async () => {
      // Start training
      await apiPost(
        app,
        `/api/skills/train?characterId=${testCharacter._id}`,
        { skillId: 'lockpicking' },
        token
      );

      // Try to complete immediately
      const response = await apiPost(
        app,
        `/api/skills/complete?characterId=${testCharacter._id}`,
        {},
        token
      );

      expect(response.status).toBe(400);
      expectError(response);
      expect(response.body.error).toContain('not complete');
    });

    it('should clear training state after completion', async () => {
      // Start training
      await apiPost(
        app,
        `/api/skills/train?characterId=${testCharacter._id}`,
        { skillId: 'lockpicking' },
        token
      );

      // Set to past and complete
      await testCharacter.reload();
      const training = testCharacter.getCurrentTraining()!;
      training.trainingCompletes = new Date(Date.now() - 1000);
      await testCharacter.save();

      await apiPost(
        app,
        `/api/skills/complete?characterId=${testCharacter._id}`,
        {},
        token
      );

      // Verify training cleared
      await testCharacter.reload();
      expect(testCharacter.getCurrentTraining()).toBeNull();
    });

    it('should fail if not training', async () => {
      const response = await apiPost(
        app,
        `/api/skills/complete?characterId=${testCharacter._id}`,
        {},
        token
      );

      expect(response.status).toBe(400);
      expectError(response);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/skills/complete?characterId=${testCharacter._id}`)
        .expect(401);

      expectError(response);
    });
  });

  describe('GET /api/skills/bonuses - Get Suit Bonuses', () => {
    it('should return suit bonuses', async () => {
      const response = await apiGet(
        app,
        `/api/skills/bonuses?characterId=${testCharacter._id}`,
        token
      );

      expectSuccess(response);
      expect(response.body.data.bonuses).toBeDefined();
      expect(response.body.data.bonuses).toHaveProperty(DestinySuit.SPADES);
      expect(response.body.data.bonuses).toHaveProperty(DestinySuit.HEARTS);
      expect(response.body.data.bonuses).toHaveProperty(DestinySuit.CLUBS);
      expect(response.body.data.bonuses).toHaveProperty(DestinySuit.DIAMONDS);
    });

    it('should return detailed bonuses with skill breakdown', async () => {
      const response = await apiGet(
        app,
        `/api/skills/bonuses?characterId=${testCharacter._id}`,
        token
      );

      expectSuccess(response);
      expect(response.body.data.details).toBeDefined();
      expect(response.body.data.details).toHaveLength(4); // 4 suits

      const spadesDetail = response.body.data.details.find((d: any) => d.suit === DestinySuit.SPADES);
      expect(spadesDetail).toBeDefined();
      expect(spadesDetail.skills).toBeDefined();
      expect(Array.isArray(spadesDetail.skills)).toBe(true);
    });

    it('should calculate bonuses correctly with leveled skills', async () => {
      // Level up some Spades skills
      testCharacter.skills.find(s => s.skillId === 'lockpicking')!.level = 10;
      testCharacter.skills.find(s => s.skillId === 'stealth')!.level = 5;
      await testCharacter.save();

      const response = await apiGet(
        app,
        `/api/skills/bonuses?characterId=${testCharacter._id}`,
        token
      );

      expectSuccess(response);
      // Should have at least 15 from lockpicking + stealth
      expect(response.body.data.bonuses[DestinySuit.SPADES]).toBeGreaterThanOrEqual(15);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get(`/api/skills/bonuses?characterId=${testCharacter._id}`)
        .expect(401);

      expectError(response);
    });

    it('should require character ownership', async () => {
      const otherUserId = '507f1f77bcf86cd799439012';
      const otherToken = createTestToken(otherUserId, 'other@example.com');

      const response = await apiGet(
        app,
        `/api/skills/bonuses?characterId=${testCharacter._id}`,
        otherToken
      );

      expect(response.status).toBe(403);
      expectError(response);
    });
  });

  describe('Multi-User Isolation', () => {
    let user2Character: ICharacter;
    const user2Id = '507f1f77bcf86cd799439013';
    const user2Token = createTestToken(user2Id, 'user2@example.com');

    beforeEach(async () => {
      user2Character = await Character.create({
        userId: new mongoose.Types.ObjectId(user2Id),
        name: 'User2 Character',
        faction: Faction.SETTLER_ALLIANCE,
        appearance: {
          bodyType: 'female',
          skinTone: 3,
          facePreset: 2,
          hairStyle: 3,
          hairColor: 4
        },
        currentLocation: 'red-gulch',
        level: 1,
        experience: 0,
        energy: 150,
        maxEnergy: 150,
        lastEnergyUpdate: new Date(),
        stats: { cunning: 0, spirit: 0, combat: 0, craft: 0 },
        skills: SkillService.initializeSkills(),
        inventory: [],
        lastActive: new Date(),
        isActive: true
      });
    });

    it('should isolate training between users', async () => {
      // User 1 starts training
      await apiPost(
        app,
        `/api/skills/train?characterId=${testCharacter._id}`,
        { skillId: 'lockpicking' },
        token
      );

      // User 2 should still be able to train
      const response = await apiPost(
        app,
        `/api/skills/train?characterId=${user2Character._id}`,
        { skillId: 'lockpicking' },
        user2Token
      );

      expectSuccess(response);
    });

    it('should not let user access other user skills', async () => {
      const response = await apiGet(
        app,
        `/api/skills?characterId=${user2Character._id}`,
        token // User 1 trying to access User 2's character
      );

      expect(response.status).toBe(403);
      expectError(response);
    });
  });

  describe('Offline Progression', () => {
    it('should complete training that finished while offline', async () => {
      // Start training
      await apiPost(
        app,
        `/api/skills/train?characterId=${testCharacter._id}`,
        { skillId: 'lockpicking' },
        token
      );

      // Simulate time passing (set completion to past)
      await testCharacter.reload();
      const training = testCharacter.getCurrentTraining()!;
      training.trainingCompletes = new Date(Date.now() - 3600000); // 1 hour ago
      await testCharacter.save();

      // GET skills should auto-complete
      const response = await apiGet(
        app,
        `/api/skills?characterId=${testCharacter._id}`,
        token
      );

      expectSuccess(response);
      expect(response.body.data.currentTraining).toBeNull();

      // XP should be awarded
      const lockpicking = response.body.data.characterSkills.find(
        (s: any) => s.skillId === 'lockpicking'
      );
      expect(lockpicking.xp).toBeGreaterThan(0);
    });
  });
});
