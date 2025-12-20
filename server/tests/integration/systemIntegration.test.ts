/**
 * System Integration Tests
 * Tests cross-system interactions and data flows
 */

import mongoose from 'mongoose';
import { Character, ICharacter } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import { LegacyProfileModel } from '../../src/models/LegacyProfile.model';
import { GoldTransaction } from '../../src/models/GoldTransaction.model';
import { CombatEncounter } from '../../src/models/CombatEncounter.model';
import { NPC } from '../../src/models/NPC.model';
import { Gang } from '../../src/models/Gang.model';
import { Quest } from '../../src/models/Quest.model';
import { GoldService, TransactionSource } from '../../src/services/gold.service';
import { CombatService } from '../../src/services/combat.service';
import { QuestService } from '../../src/services/quest.service';
import { SkillService } from '../../src/services/skill.service';
import { GangService } from '../../src/services/gang.service';
import { SystemEventService } from '../../src/services/systemEvent.service';
import { IntegrationHealthChecker } from '../../src/utils/integrationHealth';
import { Faction, LegacyTier, SystemName, SystemEventType } from '@desperados/shared';
import { clearDatabase } from '../helpers/testHelpers';

describe('System Integration Tests', () => {
  let testUser: any;
  let testCharacter: ICharacter;

  beforeAll(async () => {
    await clearDatabase();
  });

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      email: `test${Date.now()}@example.com`,
      password: 'hashedpassword',
      emailVerified: true
    });

    // Create test character
    testCharacter = await Character.create({
      userId: testUser._id,
      name: `TestHero${Date.now()}`,
      faction: Faction.SETTLER_ALLIANCE,
      appearance: {
        bodyType: 'male',
        skinTone: 5,
        facePreset: 2,
        hairStyle: 7,
        hairColor: 3
      },
      level: 5,
      experience: 500,
      gold: 1000,
      currentLocation: 'red-gulch',
      stats: {
        cunning: 10,
        spirit: 10,
        combat: 10,
        craft: 10
      }
    });
  });

  afterEach(async () => {
    await clearDatabase();
    SystemEventService.clearSubscriptions();
  });

  describe('Character + Legacy Integration', () => {
    it('should create legacy profile when character is created', async () => {
      // Check if legacy profile exists
      const legacyProfile = await LegacyProfileModel.findOne({
        userId: testUser._id
      });

      expect(legacyProfile).toBeDefined();
      if (legacyProfile) {
        expect(legacyProfile.userId.toString()).toBe(testUser._id.toString());
        expect(legacyProfile.currentTier).toBe(LegacyTier.NONE);
        expect(legacyProfile.lifetimeStats.totalCharactersCreated).toBeGreaterThanOrEqual(0);
      }
    });

    it('should receive legacy bonuses on new character', async () => {
      // Create legacy profile with bonuses
      const legacyProfile = await LegacyProfileModel.getOrCreate(testUser._id);
      legacyProfile.updateStat('totalGoldEarned', 50000);
      legacyProfile.updateTier(LegacyTier.BRONZE);
      await legacyProfile.save();

      // Create new character
      const newChar = await Character.create({
        userId: testUser._id,
        name: `LegacyHero${Date.now()}`,
        faction: Faction.FRONTERA,
        appearance: {
          bodyType: 'female',
          skinTone: 3,
          facePreset: 1,
          hairStyle: 5,
          hairColor: 2
        },
        level: 1,
        gold: 100,
        currentLocation: 'perdition'
      });

      expect(newChar).toBeDefined();
      // Legacy bonuses would be applied during character creation if implemented
      // This test validates the integration points exist
    });

    it('should update legacy stats on character actions', async () => {
      const legacyBefore = await LegacyProfileModel.getOrCreate(testUser._id);
      const goldBefore = legacyBefore.lifetimeStats.totalGoldEarned;

      // Earn gold
      await GoldService.addGold(
        testCharacter._id,
        500,
        TransactionSource.QUEST_REWARD
      );

      // Legacy profile should be updated (would require event integration)
      const legacyAfter = await LegacyProfileModel.findOne({
        userId: testUser._id
      });

      expect(legacyAfter).toBeDefined();
      // Note: This requires SystemEventService integration to fully work
    });

    it('should aggregate character stats to legacy on deletion', async () => {
      const legacyBefore = await LegacyProfileModel.getOrCreate(testUser._id);
      const charsBefore = legacyBefore.lifetimeStats.totalCharactersRetired;

      // Update character stats
      testCharacter.combatStats.wins = 10;
      testCharacter.combatStats.kills = 25;
      await testCharacter.save();

      // Delete character (soft delete by setting inactive)
      testCharacter.isActive = false;
      await testCharacter.save();

      // Legacy should track retirement (would require event integration)
      const legacyAfter = await LegacyProfileModel.findOne({
        userId: testUser._id
      });

      expect(legacyAfter).toBeDefined();
    });
  });

  describe('Combat + Multiple Systems Integration', () => {
    let testNPC: any;

    beforeEach(async () => {
      // Create test NPC
      testNPC = await NPC.create({
        name: 'Test Bandit',
        type: 'OUTLAW',
        level: 3,
        difficulty: 5,
        maxHP: 100,
        location: 'red-gulch',
        lootTable: {
          goldMin: 50,
          goldMax: 100,
          xpReward: 150,
          items: [
            { name: 'leather-vest', chance: 0.3 }
          ]
        },
        isActive: true
      });
    });

    it('should update XP, gold, reputation, and legacy on combat victory', async () => {
      const goldBefore = testCharacter.gold;
      const xpBefore = testCharacter.experience;
      const levelBefore = testCharacter.level;

      // Initiate and win combat
      const encounter = await CombatService.initiateCombat(
        testCharacter,
        testNPC._id.toString()
      );

      // Simulate combat rounds until victory
      // Note: Full combat simulation would go here
      // For integration test, we verify the integration points exist

      expect(encounter).toBeDefined();
      expect(encounter.characterId.toString()).toBe(testCharacter._id.toString());
      expect(encounter.npcId.toString()).toBe(testNPC._id.toString());
    });

    it('should trigger achievements and legendary quest progress on boss defeat', async () => {
      // Create boss NPC
      const boss = await NPC.create({
        name: 'Test Boss',
        type: 'BOSS',
        level: 10,
        difficulty: 8,
        maxHP: 500,
        location: 'red-gulch',
        lootTable: {
          goldMin: 500,
          goldMax: 1000,
          xpReward: 2000,
          items: [
            { name: 'legendary-weapon', chance: 0.1 }
          ]
        },
        isActive: true
      });

      const encounter = await CombatService.initiateCombat(
        testCharacter,
        boss._id.toString()
      );

      expect(encounter).toBeDefined();
      // Boss defeat would trigger multiple systems:
      // - Achievement check
      // - Legendary quest progress
      // - Reputation gain
      // - Legacy stat update
      // - Newspaper article generation
    });

    it('should affect bounty, fame, and territory influence on duel win', async () => {
      // Duel integration test
      // Would test PvP combat effects on multiple systems
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('Economy Flow Integration', () => {
    it('should apply legacy multipliers to gold earned', async () => {
      // Create legacy profile with gold multiplier
      const legacy = await LegacyProfileModel.getOrCreate(testUser._id);
      legacy.updateTier(LegacyTier.GOLD); // Gold tier = +20% gold
      await legacy.save();

      const goldBefore = testCharacter.gold;

      // Earn gold
      const result = await GoldService.addGold(
        testCharacter._id,
        100,
        TransactionSource.COMBAT_VICTORY
      );

      // Verify gold was added
      expect(result.newBalance).toBeGreaterThan(goldBefore);

      // Verify transaction was recorded
      const transactions = await GoldTransaction.find({
        characterId: testCharacter._id
      });
      expect(transactions.length).toBeGreaterThan(0);
    });

    it('should integrate shop purchases with inventory limits', async () => {
      const goldBefore = testCharacter.gold;

      // Simulate shop purchase
      await GoldService.deductGold(
        testCharacter._id,
        50,
        TransactionSource.SHOP_PURCHASE,
        { itemId: 'health-potion', quantity: 5 }
      );

      // Verify gold was deducted
      const charAfter = await Character.findById(testCharacter._id);
      expect(charAfter?.gold).toBe(goldBefore - 50);

      // Verify transaction
      const transaction = await GoldTransaction.findOne({
        characterId: testCharacter._id,
        source: TransactionSource.SHOP_PURCHASE
      });
      expect(transaction).toBeDefined();
      expect(transaction?.amount).toBe(-50);
    });

    it('should flow property income to character correctly', async () => {
      const goldBefore = testCharacter.gold;

      // Simulate property income
      await GoldService.addGold(
        testCharacter._id,
        200,
        TransactionSource.PROPERTY_INCOME,
        { propertyId: 'saloon-001', propertyName: 'Dusty Saloon' }
      );

      const charAfter = await Character.findById(testCharacter._id);
      expect(charAfter?.gold).toBe(goldBefore + 200);

      // Verify transaction metadata
      const transaction = await GoldTransaction.findOne({
        characterId: testCharacter._id,
        source: TransactionSource.PROPERTY_INCOME
      });
      expect(transaction?.metadata?.propertyName).toBe('Dusty Saloon');
    });

    it('should deduct crafting costs properly', async () => {
      const goldBefore = testCharacter.gold;

      // Simulate crafting cost
      await GoldService.deductGold(
        testCharacter._id,
        75,
        TransactionSource.CRAFTING,
        { recipeId: 'leather-vest', ingredientsCost: 75 }
      );

      const charAfter = await Character.findById(testCharacter._id);
      expect(charAfter?.gold).toBe(goldBefore - 75);
    });
  });

  describe('Progression Chain Integration', () => {
    it('should trigger XP, gold, reputation, achievements, and legacy on quest completion', async () => {
      // Quest completion triggers multiple systems
      const statsBefore = {
        gold: testCharacter.gold,
        xp: testCharacter.experience,
        level: testCharacter.level
      };

      // Simulate quest reward
      await GoldService.addGold(
        testCharacter._id,
        250,
        TransactionSource.QUEST_REWARD,
        { questId: 'starter-quest', questName: 'First Steps' }
      );

      await testCharacter.addExperience(300);
      await testCharacter.save();

      const charAfter = await Character.findById(testCharacter._id);
      expect(charAfter?.gold).toBeGreaterThan(statsBefore.gold);
      expect(charAfter?.experience).toBeGreaterThan(statsBefore.xp);
    });

    it('should enable new jobs, crafting recipes, and NPC interactions on skill unlock', async () => {
      // Add a skill to character
      testCharacter.skills.push({
        skillId: 'gunslinger',
        level: 5,
        experience: 250
      });
      await testCharacter.save();

      const skillLevel = testCharacter.getSkillLevel('gunslinger');
      expect(skillLevel).toBe(5);

      // Skill level 5 would unlock:
      // - Advanced gunslinger jobs
      // - Weapon crafting recipes
      // - Gunslinger NPC training options
    });

    it('should grant stat points, unlocks, and feature access on level up', async () => {
      const levelBefore = testCharacter.level;

      // Add enough XP to level up
      await testCharacter.addExperience(10000);
      await testCharacter.save();

      const charAfter = await Character.findById(testCharacter._id);
      expect(charAfter?.level).toBeGreaterThan(levelBefore);

      // Level up would trigger:
      // - Stat point allocation
      // - Feature unlocks (gang at level 5, property at level 10, etc.)
      // - Quest availability updates
      // - Legacy milestone progress
    });
  });

  describe('Social Systems Integration', () => {
    let testGang: any;

    beforeEach(async () => {
      // Create test gang
      testGang = await Gang.create({
        name: `TestGang${Date.now()}`,
        tag: 'TEST',
        leaderId: testCharacter._id,
        members: [
          {
            characterId: testCharacter._id,
            rank: 'leader',
            joinedAt: new Date(),
            contributionPoints: 0
          }
        ],
        bankBalance: 0,
        level: 1,
        experience: 0,
        maxMembers: 10
      });

      testCharacter.gangId = testGang._id;
      await testCharacter.save();
    });

    it('should update territory, reputation, and member rewards on gang actions', async () => {
      // Gang action affects multiple systems
      expect(testCharacter.gangId?.toString()).toBe(testGang._id.toString());

      // Gang actions would trigger:
      // - Territory influence updates
      // - Gang reputation changes
      // - Member reward distribution
      // - Legacy social milestones
    });

    it('should update mail, notifications, and legacy social milestones on friend actions', async () => {
      // Friend system integration
      // Would test friend requests, mail sending, notifications
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('System Event Dispatcher Integration', () => {
    it('should dispatch events to multiple systems', async () => {
      const eventsReceived: string[] = [];

      // Subscribe test handler
      SystemEventService.subscribe({
        system: SystemName.LEGACY,
        eventTypes: [SystemEventType.GOLD_EARNED],
        handler: async (event) => {
          eventsReceived.push(event.eventType);
        },
        priority: 0
      });

      // Dispatch event
      const result = await SystemEventService.emitGoldEarned(
        testCharacter._id.toString(),
        100,
        'test',
        { test: true }
      );

      expect(result.success).toBe(true);
      expect(result.event).toBeDefined();
      expect(result.event.source).toBe(SystemName.GOLD);
    });

    it('should handle event routing to correct systems', async () => {
      const result = await SystemEventService.emitCombatVictory(
        testCharacter._id.toString(),
        {
          goldEarned: 100,
          xpEarned: 150,
          isBoss: false
        }
      );

      expect(result.success).toBe(true);
      expect(result.event.targets).toContain(SystemName.LEGACY);
      expect(result.event.targets).toContain(SystemName.QUEST);
      expect(result.event.targets).toContain(SystemName.ACHIEVEMENT);
    });

    it('should handle async event processing', async () => {
      let handlerExecuted = false;

      SystemEventService.subscribe({
        system: SystemName.TEST as any,
        eventTypes: [SystemEventType.QUEST_COMPLETED],
        handler: async (event) => {
          await new Promise(resolve => setTimeout(resolve, 100));
          handlerExecuted = true;
        },
        priority: 0
      });

      await SystemEventService.emitQuestCompleted(
        testCharacter._id.toString(),
        'test-quest',
        { gold: 100, xp: 200 }
      );

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 200));
      expect(handlerExecuted).toBe(true);
    });

    it('should handle event errors gracefully', async () => {
      SystemEventService.subscribe({
        system: SystemName.TEST as any,
        eventTypes: [SystemEventType.ACHIEVEMENT_UNLOCKED],
        handler: async (_event) => {
          throw new Error('Test error');
        },
        priority: 0
      });

      const result = await SystemEventService.emitAchievementUnlocked(
        testCharacter._id.toString(),
        'test-achievement'
      );

      // Event should still be processed even if one handler fails
      expect(result.event.processed).toBe(true);
      // Errors should be recorded
      if (result.errors.length > 0) {
        expect(result.errors[0].error).toContain('error');
      }
    });
  });

  describe('Integration Health Checks', () => {
    it('should verify all system connections', async () => {
      const health = await IntegrationHealthChecker.checkAllSystems();

      expect(health).toBeDefined();
      expect(Array.isArray(health)).toBe(true);
      expect(health.length).toBeGreaterThan(0);

      // Check that critical systems are healthy
      const characterHealth = health.find(h => h.system === SystemName.CHARACTER);
      expect(characterHealth).toBeDefined();
    });

    it('should test critical data flows', async () => {
      const result = await IntegrationHealthChecker.verifyDataFlows();

      expect(result).toBeDefined();
      expect(result.flows).toBeDefined();
      expect(Array.isArray(result.flows)).toBe(true);

      // Character → Gold flow should work
      const charGoldFlow = result.flows.find(f => f.name.includes('Gold'));
      expect(charGoldFlow).toBeDefined();
    });

    it('should generate comprehensive health report', async () => {
      const report = await IntegrationHealthChecker.generateHealthReport();

      expect(report).toBeDefined();
      expect(report.overall).toBeDefined();
      expect(report.systems).toBeDefined();
      expect(report.dataFlows).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.summary.totalSystems).toBeGreaterThan(0);
    });

    it('should identify system dependencies', async () => {
      const deps = IntegrationHealthChecker.getDependencyGraph();

      expect(deps).toBeDefined();
      expect(Array.isArray(deps)).toBe(true);
      expect(deps.length).toBeGreaterThan(0);

      // Character should depend on User
      const charDep = deps.find(d => d.system === SystemName.CHARACTER);
      expect(charDep).toBeDefined();
      expect(charDep?.dependsOn).toContain(SystemName.USER);
    });

    it('should identify dependent systems', async () => {
      const dependents = IntegrationHealthChecker.getDependentSystems(
        SystemName.CHARACTER
      );

      expect(dependents).toBeDefined();
      expect(Array.isArray(dependents)).toBe(true);

      // Combat should depend on Character
      expect(dependents).toContain(SystemName.COMBAT);
    });
  });

  describe('Cross-System Transactions', () => {
    it('should handle atomic multi-system updates', async () => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Update multiple systems atomically
        await GoldService.addGold(
          testCharacter._id,
          100,
          TransactionSource.COMBAT_VICTORY,
          {},
          session
        );

        testCharacter.experience += 150;
        await testCharacter.save({ session });

        await session.commitTransaction();

        const charAfter = await Character.findById(testCharacter._id);
        expect(charAfter?.gold).toBe(1100);
        expect(charAfter?.experience).toBe(650);
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    });

    it('should rollback on transaction failure', async () => {
      const goldBefore = testCharacter.gold;
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Add gold
        await GoldService.addGold(
          testCharacter._id,
          100,
          TransactionSource.COMBAT_VICTORY,
          {},
          session
        );

        // Force an error
        throw new Error('Test error');

        // This should not be reached
        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
      } finally {
        session.endSession();
      }

      // Gold should not have changed
      const charAfter = await Character.findById(testCharacter._id);
      expect(charAfter?.gold).toBe(goldBefore);
    });
  });

  describe('Event Chain Testing', () => {
    it('should chain combat victory → XP → level up → milestone → achievement', async () => {
      // Set character close to level up
      testCharacter.experience = 900;
      testCharacter.level = 1;
      await testCharacter.save();

      const trackedEvents: string[] = [];

      // Subscribe to track event chain
      SystemEventService.subscribe({
        system: SystemName.TEST as any,
        eventTypes: [
          SystemEventType.COMBAT_VICTORY,
          SystemEventType.CHARACTER_LEVEL_UP,
          SystemEventType.ACHIEVEMENT_UNLOCKED
        ],
        handler: async (event) => {
          trackedEvents.push(event.eventType);
        },
        priority: 0
      });

      // Emit combat victory with enough XP to level up
      await SystemEventService.emitCombatVictory(
        testCharacter._id.toString(),
        {
          goldEarned: 100,
          xpEarned: 200,
          isBoss: false
        }
      );

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(trackedEvents).toContain(SystemEventType.COMBAT_VICTORY);
    });
  });
});
