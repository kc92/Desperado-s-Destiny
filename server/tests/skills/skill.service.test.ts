/**
 * Skill Service Tests
 *
 * Tests for skill training logic, calculations, and progression
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../../src/models/Character.model';
import { SkillService } from '../../src/services/skill.service';
import { SKILLS, SKILL_PROGRESSION, DestinySuit, TIME } from '@desperados/shared';
import { clearDatabase } from '../helpers';
import { Faction } from '@desperados/shared';

describe('Skill Service', () => {
  let testCharacter: ICharacter;

  beforeEach(async () => {
    await clearDatabase();

    // Create a test character
    testCharacter = await Character.create({
      userId: new mongoose.Types.ObjectId(),
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

  describe('initializeSkills', () => {
    it('should initialize all 25 skills at level 1', () => {
      const skills = SkillService.initializeSkills();

      expect(skills).toHaveLength(25);
      skills.forEach(skill => {
        expect(skill.level).toBe(1);
        expect(skill.experience).toBe(0);
        expect(skill.trainingStarted).toBeUndefined();
        expect(skill.trainingCompletes).toBeUndefined();
      });
    });

    it('should include all skill IDs from SKILLS constant', () => {
      const skills = SkillService.initializeSkills();
      const skillIds = skills.map(s => s.skillId);

      Object.values(SKILLS).forEach(skillDef => {
        expect(skillIds).toContain(skillDef.id);
      });
    });
  });

  describe('calculateXPForNextLevel', () => {
    it('should calculate XP correctly (level * 100)', () => {
      expect(SkillService.calculateXPForNextLevel(1)).toBe(100);
      expect(SkillService.calculateXPForNextLevel(5)).toBe(500);
      expect(SkillService.calculateXPForNextLevel(10)).toBe(1000);
      expect(SkillService.calculateXPForNextLevel(25)).toBe(2500);
    });

    it('should return 0 for max level', () => {
      expect(SkillService.calculateXPForNextLevel(50)).toBe(0);
    });
  });

  describe('calculateSkillTrainingTime', () => {
    it('should calculate training time with 10% scaling per level', () => {
      const baseTime = TIME.HOUR; // 1 hour for most skills

      // Level 1: baseTime * (1 + 1 * 0.1) = baseTime * 1.1
      const level1Time = SkillService.calculateSkillTrainingTime('lockpicking', 1);
      expect(level1Time).toBe(Math.floor(baseTime * 1.1));

      // Level 5: baseTime * (1 + 5 * 0.1) = baseTime * 1.5
      const level5Time = SkillService.calculateSkillTrainingTime('lockpicking', 5);
      expect(level5Time).toBe(Math.floor(baseTime * 1.5));

      // Level 10: baseTime * (1 + 10 * 0.1) = baseTime * 2.0
      const level10Time = SkillService.calculateSkillTrainingTime('lockpicking', 10);
      expect(level10Time).toBe(Math.floor(baseTime * 2.0));
    });

    it('should respect different base training times', () => {
      // Blacksmithing has 2-hour base time
      const blacksmithingTime = SkillService.calculateSkillTrainingTime('blacksmithing', 1);
      expect(blacksmithingTime).toBe(Math.floor(TIME.HOUR * 2 * 1.1));

      // Lockpicking has 1-hour base time
      const lockpickingTime = SkillService.calculateSkillTrainingTime('lockpicking', 1);
      expect(lockpickingTime).toBe(Math.floor(TIME.HOUR * 1.1));
    });

    it('should throw error for invalid skill', () => {
      expect(() => {
        SkillService.calculateSkillTrainingTime('invalid_skill', 1);
      }).toThrow();
    });
  });

  describe('calculateSuitBonuses', () => {
    it('should calculate correct bonuses for each suit', () => {
      // Set up character with specific skill levels
      const lockpicking = testCharacter.skills.find(s => s.skillId === 'lockpicking')!;
      lockpicking.level = 10;

      const stealth = testCharacter.skills.find(s => s.skillId === 'stealth')!;
      stealth.level = 5;

      const rangedCombat = testCharacter.skills.find(s => s.skillId === 'ranged_combat')!;
      rangedCombat.level = 8;

      const bonuses = SkillService.calculateSuitBonuses(testCharacter);

      // Lockpicking (10) + Stealth (5) + other Spades skills (at level 1)
      expect(bonuses[DestinySuit.SPADES]).toBeGreaterThanOrEqual(15);

      // Ranged Combat (8) + other Clubs skills (at level 1)
      expect(bonuses[DestinySuit.CLUBS]).toBeGreaterThanOrEqual(8);
    });

    it('should return 0 bonuses for level 1 skills across the board', () => {
      // Default initialized character has all skills at level 1
      const bonuses = SkillService.calculateSuitBonuses(testCharacter);

      // Each suit should have bonuses equal to number of skills * 1
      expect(bonuses[DestinySuit.SPADES]).toBeGreaterThan(0);
      expect(bonuses[DestinySuit.HEARTS]).toBeGreaterThan(0);
      expect(bonuses[DestinySuit.CLUBS]).toBeGreaterThan(0);
      expect(bonuses[DestinySuit.DIAMONDS]).toBeGreaterThan(0);
    });

    it('should sum all skill levels for each suit correctly', () => {
      // Set multiple Spades skills to different levels
      testCharacter.skills.find(s => s.skillId === 'lockpicking')!.level = 10;
      testCharacter.skills.find(s => s.skillId === 'stealth')!.level = 8;
      testCharacter.skills.find(s => s.skillId === 'pickpocket')!.level = 5;

      const bonuses = SkillService.calculateSuitBonuses(testCharacter);

      // At minimum: 10 + 8 + 5 = 23 (plus any other Spades skills at level 1)
      expect(bonuses[DestinySuit.SPADES]).toBeGreaterThanOrEqual(23);
    });
  });

  describe('startTraining', () => {
    it('should start training successfully', async () => {
      const result = await SkillService.startTraining(
        testCharacter._id.toString(),
        'lockpicking'
      );

      expect(result.success).toBe(true);
      expect(result.training).toBeDefined();
      expect(result.training!.skillId).toBe('lockpicking');
      expect(result.training!.startedAt).toBeInstanceOf(Date);
      expect(result.training!.completesAt).toBeInstanceOf(Date);
      expect(result.training!.xpReward).toBe(100); // Level 1 -> 2 = 100 XP
    });

    it('should set correct completion time', async () => {
      const beforeStart = Date.now();
      const result = await SkillService.startTraining(
        testCharacter._id.toString(),
        'lockpicking'
      );

      const expectedDuration = SkillService.calculateSkillTrainingTime('lockpicking', 1);
      const actualDuration = result.training!.completesAt.getTime() - result.training!.startedAt.getTime();

      // Allow 100ms tolerance for test execution time
      expect(Math.abs(actualDuration - expectedDuration)).toBeLessThan(100);
    });

    it('should prevent training two skills at once', async () => {
      // Start training lockpicking
      await SkillService.startTraining(testCharacter._id.toString(), 'lockpicking');

      // Try to start training stealth
      const result = await SkillService.startTraining(testCharacter._id.toString(), 'stealth');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Already training');
    });

    it('should prevent training skill at max level', async () => {
      // Set lockpicking to max level
      const lockpicking = testCharacter.skills.find(s => s.skillId === 'lockpicking')!;
      lockpicking.level = 50;
      await testCharacter.save();

      const result = await SkillService.startTraining(
        testCharacter._id.toString(),
        'lockpicking'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('maximum level');
    });

    it('should fail for invalid skill ID', async () => {
      const result = await SkillService.startTraining(
        testCharacter._id.toString(),
        'invalid_skill'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid skill');
    });

    it('should fail for non-existent character', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const result = await SkillService.startTraining(fakeId, 'lockpicking');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Character not found');
    });
  });

  describe('cancelTraining', () => {
    it('should cancel active training', async () => {
      // Start training
      await SkillService.startTraining(testCharacter._id.toString(), 'lockpicking');

      // Cancel training
      const result = await SkillService.cancelTraining(testCharacter._id.toString());

      expect(result.success).toBe(true);

      // Verify training was cancelled
      await testCharacter.reload();
      const training = testCharacter.getCurrentTraining();
      expect(training).toBeNull();
    });

    it('should fail if not currently training', async () => {
      const result = await SkillService.cancelTraining(testCharacter._id.toString());

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not currently training');
    });

    it('should not award XP when cancelling', async () => {
      // Start training
      await SkillService.startTraining(testCharacter._id.toString(), 'lockpicking');

      const lockpickingBefore = testCharacter.skills.find(s => s.skillId === 'lockpicking')!;
      const xpBefore = lockpickingBefore.experience;

      // Cancel training
      await SkillService.cancelTraining(testCharacter._id.toString());

      // Reload and check XP unchanged
      await testCharacter.reload();
      const lockpickingAfter = testCharacter.skills.find(s => s.skillId === 'lockpicking')!;
      expect(lockpickingAfter.experience).toBe(xpBefore);
    });
  });

  describe('completeTraining', () => {
    it('should fail if training not complete yet', async () => {
      // Start training
      await SkillService.startTraining(testCharacter._id.toString(), 'lockpicking');

      // Try to complete immediately
      const result = await SkillService.completeTraining(testCharacter._id.toString());

      expect(result.success).toBe(false);
      expect(result.error).toContain('not complete');
    });

    it('should complete training and award XP', async () => {
      // Start training
      await SkillService.startTraining(testCharacter._id.toString(), 'lockpicking');

      // Manually set completion time to the past
      await testCharacter.reload();
      const lockpicking = testCharacter.skills.find(s => s.skillId === 'lockpicking')!;
      lockpicking.trainingCompletes = new Date(Date.now() - 1000);
      await testCharacter.save();

      // Complete training
      const result = await SkillService.completeTraining(testCharacter._id.toString());

      expect(result.success).toBe(true);
      expect(result.result!.xpAwarded).toBe(100);
      expect(result.result!.newXP).toBe(100);
    });

    it('should level up when XP threshold reached', async () => {
      // Set lockpicking to have 99 XP (1 away from level up)
      const lockpicking = testCharacter.skills.find(s => s.skillId === 'lockpicking')!;
      lockpicking.experience = 99;
      await testCharacter.save();

      // Start and complete training
      await SkillService.startTraining(testCharacter._id.toString(), 'lockpicking');

      await testCharacter.reload();
      const training = testCharacter.getCurrentTraining()!;
      training.trainingCompletes = new Date(Date.now() - 1000);
      await testCharacter.save();

      const result = await SkillService.completeTraining(testCharacter._id.toString());

      expect(result.success).toBe(true);
      expect(result.result!.leveledUp).toBe(true);
      expect(result.result!.newLevel).toBe(2);
      expect(result.result!.oldLevel).toBe(1);
    });

    it('should clear training state after completion', async () => {
      // Start training
      await SkillService.startTraining(testCharacter._id.toString(), 'lockpicking');

      // Set to past and complete
      await testCharacter.reload();
      const training = testCharacter.getCurrentTraining()!;
      training.trainingCompletes = new Date(Date.now() - 1000);
      await testCharacter.save();

      await SkillService.completeTraining(testCharacter._id.toString());

      // Verify training cleared
      await testCharacter.reload();
      expect(testCharacter.getCurrentTraining()).toBeNull();
    });

    it('should fail if not currently training', async () => {
      const result = await SkillService.completeTraining(testCharacter._id.toString());

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not currently training');
    });
  });

  describe('getTrainingTimeRemaining', () => {
    it('should return 0 when not training', () => {
      const remaining = SkillService.getTrainingTimeRemaining(testCharacter);
      expect(remaining).toBe(0);
    });

    it('should return correct time remaining', async () => {
      // Start training
      await SkillService.startTraining(testCharacter._id.toString(), 'lockpicking');

      await testCharacter.reload();
      const remaining = SkillService.getTrainingTimeRemaining(testCharacter);

      const expectedDuration = SkillService.calculateSkillTrainingTime('lockpicking', 1);

      // Remaining should be close to expected duration
      expect(remaining).toBeGreaterThan(0);
      expect(remaining).toBeLessThanOrEqual(expectedDuration);
    });

    it('should return 0 when training is complete', async () => {
      // Start training
      await SkillService.startTraining(testCharacter._id.toString(), 'lockpicking');

      // Set completion to past
      await testCharacter.reload();
      const training = testCharacter.getCurrentTraining()!;
      training.trainingCompletes = new Date(Date.now() - 1000);
      await testCharacter.save();

      await testCharacter.reload();
      const remaining = SkillService.getTrainingTimeRemaining(testCharacter);
      expect(remaining).toBe(0);
    });
  });

  describe('Transaction Safety', () => {
    it('should handle concurrent training attempts safely', async () => {
      // Try to start training the same skill simultaneously
      const results = await Promise.all([
        SkillService.startTraining(testCharacter._id.toString(), 'lockpicking'),
        SkillService.startTraining(testCharacter._id.toString(), 'stealth')
      ]);

      // Only one should succeed
      const successes = results.filter(r => r.success);
      expect(successes).toHaveLength(1);
    });
  });
});
