/**
 * Quest Triggers Integration Tests
 *
 * Tests the automatic quest progress updates when game events occur
 */

import mongoose from 'mongoose';
import { QuestService } from '../../src/services/quest.service';
import { QuestDefinition, CharacterQuest } from '../../src/models/Quest.model';
import { Character } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import '../setup';

describe('Quest Triggers Integration', () => {
  let testUser: any;
  let testCharacter: any;
  let testQuestId: string;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      email: `quest-trigger-test-${Date.now()}@test.com`,
      username: `questtrigger${Date.now()}`,
      passwordHash: 'hashedpassword123',
      emailVerified: true
    });

    // Create test character
    testCharacter = await Character.create({
      userId: testUser._id,
      name: `TriggerTester${Date.now()}`,
      faction: 'FRONTERA',
      level: 10,
      experience: 500,
      gold: 1000,
      energy: 100,
      maxEnergy: 150,
      skills: [],
      inventory: [],
      currentLocation: 'red-gulch'
    });

    testQuestId = `test-quest-${Date.now()}`;
  });

  afterEach(async () => {
    // Clean up test data
    await CharacterQuest.deleteMany({ characterId: testCharacter._id });
    await QuestDefinition.deleteMany({ questId: testQuestId });
    await Character.deleteMany({ userId: testUser._id });
    await User.deleteMany({ _id: testUser._id });
  });

  describe('onCrimeCompleted', () => {
    it('should update quest progress for crime objectives', async () => {
      // Create quest with crime objective
      await QuestDefinition.create({
        questId: testQuestId,
        name: 'Criminal Mastermind',
        description: 'Complete crimes to prove your worth',
        type: 'side',
        levelRequired: 1,
        prerequisites: [],
        objectives: [
          {
            id: 'obj-1',
            description: 'Complete any crime',
            type: 'crime',
            target: 'any',
            required: 3
          }
        ],
        rewards: [{ type: 'xp', amount: 100 }],
        repeatable: false,
        isActive: true
      });

      // Accept the quest
      await QuestService.acceptQuest(testCharacter._id.toString(), testQuestId);

      // Trigger crime completion
      await QuestService.onCrimeCompleted(testCharacter._id.toString(), 'pickpocket');

      // Check progress
      const quest = await CharacterQuest.findOne({
        characterId: testCharacter._id,
        questId: testQuestId
      });

      expect(quest).toBeDefined();
      expect(quest!.objectives[0].current).toBe(1);
    });

    it('should update both specific and generic crime objectives', async () => {
      await QuestDefinition.create({
        questId: testQuestId,
        name: 'Pickpocket Pro',
        description: 'Master the art of pickpocketing',
        type: 'side',
        levelRequired: 1,
        prerequisites: [],
        objectives: [
          {
            id: 'obj-1',
            description: 'Pickpocket victims',
            type: 'crime',
            target: 'pickpocket',
            required: 5
          },
          {
            id: 'obj-2',
            description: 'Complete any crimes',
            type: 'crime',
            target: 'any',
            required: 10
          }
        ],
        rewards: [{ type: 'gold', amount: 500 }],
        repeatable: false,
        isActive: true
      });

      await QuestService.acceptQuest(testCharacter._id.toString(), testQuestId);
      await QuestService.onCrimeCompleted(testCharacter._id.toString(), 'pickpocket');

      const quest = await CharacterQuest.findOne({
        characterId: testCharacter._id,
        questId: testQuestId
      });

      expect(quest!.objectives[0].current).toBe(1); // specific
      expect(quest!.objectives[1].current).toBe(1); // generic
    });
  });

  describe('onLocationVisited', () => {
    it('should update quest progress for visit objectives', async () => {
      await QuestDefinition.create({
        questId: testQuestId,
        name: 'Territory Explorer',
        description: 'Visit key locations',
        type: 'side',
        levelRequired: 1,
        prerequisites: [],
        objectives: [
          {
            id: 'obj-1',
            description: 'Visit Red Gulch',
            type: 'visit',
            target: 'red-gulch',
            required: 1
          }
        ],
        rewards: [{ type: 'xp', amount: 50 }],
        repeatable: false,
        isActive: true
      });

      await QuestService.acceptQuest(testCharacter._id.toString(), testQuestId);
      await QuestService.onLocationVisited(testCharacter._id.toString(), 'red-gulch');

      const quest = await CharacterQuest.findOne({
        characterId: testCharacter._id,
        questId: testQuestId
      });

      expect(quest!.objectives[0].current).toBe(1);
    });
  });

  describe('onEnemyDefeated', () => {
    it('should update quest progress for kill objectives', async () => {
      await QuestDefinition.create({
        questId: testQuestId,
        name: 'Outlaw Hunter',
        description: 'Defeat outlaws terrorizing the territory',
        type: 'side',
        levelRequired: 1,
        prerequisites: [],
        objectives: [
          {
            id: 'obj-1',
            description: 'Defeat outlaws',
            type: 'kill',
            target: 'OUTLAW',
            required: 5
          }
        ],
        rewards: [{ type: 'gold', amount: 200 }],
        repeatable: false,
        isActive: true
      });

      await QuestService.acceptQuest(testCharacter._id.toString(), testQuestId);
      await QuestService.onEnemyDefeated(testCharacter._id.toString(), 'OUTLAW');

      const quest = await CharacterQuest.findOne({
        characterId: testCharacter._id,
        questId: testQuestId
      });

      expect(quest!.objectives[0].current).toBe(1);
    });
  });

  describe('onItemCollected', () => {
    it('should update quest progress for collect objectives', async () => {
      await QuestDefinition.create({
        questId: testQuestId,
        name: 'Treasure Hunter',
        description: 'Collect valuable items',
        type: 'side',
        levelRequired: 1,
        prerequisites: [],
        objectives: [
          {
            id: 'obj-1',
            description: 'Collect gold nuggets',
            type: 'collect',
            target: 'gold-nugget',
            required: 10
          }
        ],
        rewards: [{ type: 'gold', amount: 1000 }],
        repeatable: false,
        isActive: true
      });

      await QuestService.acceptQuest(testCharacter._id.toString(), testQuestId);
      await QuestService.onItemCollected(testCharacter._id.toString(), 'gold-nugget', 3);

      const quest = await CharacterQuest.findOne({
        characterId: testCharacter._id,
        questId: testQuestId
      });

      expect(quest!.objectives[0].current).toBe(3);
    });
  });

  describe('onGoldEarned', () => {
    it('should update quest progress for gold objectives', async () => {
      await QuestDefinition.create({
        questId: testQuestId,
        name: 'Fortune Seeker',
        description: 'Accumulate wealth',
        type: 'side',
        levelRequired: 1,
        prerequisites: [],
        objectives: [
          {
            id: 'obj-1',
            description: 'Earn gold',
            type: 'gold',
            target: 'any',
            required: 1000
          }
        ],
        rewards: [{ type: 'item', itemId: 'gold-pouch' }],
        repeatable: false,
        isActive: true
      });

      await QuestService.acceptQuest(testCharacter._id.toString(), testQuestId);
      await QuestService.onGoldEarned(testCharacter._id.toString(), 250);

      const quest = await CharacterQuest.findOne({
        characterId: testCharacter._id,
        questId: testQuestId
      });

      expect(quest!.objectives[0].current).toBe(250);
    });
  });

  describe('Quest Auto-Completion', () => {
    it('should auto-complete quest when all objectives are met', async () => {
      await QuestDefinition.create({
        questId: testQuestId,
        name: 'Quick Task',
        description: 'Simple one-off task',
        type: 'daily',
        levelRequired: 1,
        prerequisites: [],
        objectives: [
          {
            id: 'obj-1',
            description: 'Defeat any enemy',
            type: 'kill',
            target: 'any',
            required: 1
          }
        ],
        rewards: [
          { type: 'xp', amount: 50 },
          { type: 'gold', amount: 100 }
        ],
        repeatable: false,
        isActive: true
      });

      await QuestService.acceptQuest(testCharacter._id.toString(), testQuestId);
      await QuestService.onEnemyDefeated(testCharacter._id.toString(), 'WILDLIFE');

      const quest = await CharacterQuest.findOne({
        characterId: testCharacter._id,
        questId: testQuestId
      });

      expect(quest!.status).toBe('completed');
      expect(quest!.completedAt).toBeDefined();
    });
  });

  describe('Multiple Quest Updates', () => {
    it('should update multiple active quests with matching objectives', async () => {
      const questId1 = `${testQuestId}-1`;
      const questId2 = `${testQuestId}-2`;

      // Create two quests with similar objectives
      await QuestDefinition.create({
        questId: questId1,
        name: 'Quest A',
        description: 'First quest',
        type: 'side',
        levelRequired: 1,
        prerequisites: [],
        objectives: [
          { id: 'obj-1', description: 'Kill enemies', type: 'kill', target: 'any', required: 5 }
        ],
        rewards: [{ type: 'xp', amount: 100 }],
        repeatable: false,
        isActive: true
      });

      await QuestDefinition.create({
        questId: questId2,
        name: 'Quest B',
        description: 'Second quest',
        type: 'side',
        levelRequired: 1,
        prerequisites: [],
        objectives: [
          { id: 'obj-1', description: 'Kill enemies', type: 'kill', target: 'any', required: 10 }
        ],
        rewards: [{ type: 'gold', amount: 200 }],
        repeatable: false,
        isActive: true
      });

      // Accept both quests
      await QuestService.acceptQuest(testCharacter._id.toString(), questId1);
      await QuestService.acceptQuest(testCharacter._id.toString(), questId2);

      // Defeat enemy - should update both
      await QuestService.onEnemyDefeated(testCharacter._id.toString(), 'OUTLAW');

      const quest1 = await CharacterQuest.findOne({
        characterId: testCharacter._id,
        questId: questId1
      });
      const quest2 = await CharacterQuest.findOne({
        characterId: testCharacter._id,
        questId: questId2
      });

      expect(quest1!.objectives[0].current).toBe(1);
      expect(quest2!.objectives[0].current).toBe(1);

      // Clean up additional quests
      await QuestDefinition.deleteMany({ questId: { $in: [questId1, questId2] } });
    });
  });
});
