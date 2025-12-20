/**
 * Quest Service Unit Tests
 * Comprehensive tests for quest-related API calls and utility methods
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { questService, Quest, QuestDefinition, QuestObjective, QuestReward } from './quest.service';
import api from './api';

// Mock the API module
vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// ===== Test Data Factories =====

const createMockObjective = (overrides: Partial<QuestObjective> = {}): QuestObjective => ({
  id: 'obj-1',
  description: 'Kill 5 bandits',
  type: 'kill',
  target: 'bandit',
  current: 0,
  required: 5,
  completed: false,
  ...overrides,
});

const createMockReward = (overrides: Partial<QuestReward> = {}): QuestReward => ({
  experience: 100,
  gold: 50,
  reputation: 10,
  ...overrides,
});

const createMockQuestDefinition = (overrides: Partial<QuestDefinition> = {}): QuestDefinition => ({
  questId: 'quest-1',
  name: 'Bandit Hunt',
  description: 'Hunt down the bandits terrorizing the town',
  type: 'side',
  difficulty: 'medium',
  level: 5,
  objectives: [createMockObjective()],
  rewards: createMockReward(),
  ...overrides,
});

const createMockQuest = (overrides: Partial<Quest> = {}): Quest => ({
  _id: 'quest-instance-1',
  characterId: 'char-1',
  questId: 'quest-1',
  status: 'active',
  objectives: [createMockObjective()],
  startedAt: new Date().toISOString(),
  ...overrides,
});

describe('Quest Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ===== API Methods =====

  describe('API Methods', () => {
    describe('getAvailableQuests', () => {
      it('fetches available quests successfully', async () => {
        const mockQuests = [createMockQuestDefinition()];
        vi.mocked(api.get).mockResolvedValueOnce({
          data: { data: { quests: mockQuests } },
        });

        const result = await questService.getAvailableQuests();

        expect(api.get).toHaveBeenCalledWith('/quests/available');
        expect(result.quests).toEqual(mockQuests);
      });

      it('handles empty quest list', async () => {
        vi.mocked(api.get).mockResolvedValueOnce({
          data: { data: { quests: [] } },
        });

        const result = await questService.getAvailableQuests();

        expect(result.quests).toEqual([]);
      });

      it('propagates API errors', async () => {
        vi.mocked(api.get).mockRejectedValueOnce(new Error('Network error'));

        await expect(questService.getAvailableQuests()).rejects.toThrow('Network error');
      });
    });

    describe('getActiveQuests', () => {
      it('fetches active quests successfully', async () => {
        const mockQuests = [createMockQuest()];
        vi.mocked(api.get).mockResolvedValueOnce({
          data: { data: { quests: mockQuests } },
        });

        const result = await questService.getActiveQuests();

        expect(api.get).toHaveBeenCalledWith('/quests/active');
        expect(result.quests).toEqual(mockQuests);
      });

      it('handles multiple active quests', async () => {
        const mockQuests = [
          createMockQuest({ _id: 'q1', questId: 'quest-1' }),
          createMockQuest({ _id: 'q2', questId: 'quest-2' }),
          createMockQuest({ _id: 'q3', questId: 'quest-3' }),
        ];
        vi.mocked(api.get).mockResolvedValueOnce({
          data: { data: { quests: mockQuests } },
        });

        const result = await questService.getActiveQuests();

        expect(result.quests).toHaveLength(3);
      });
    });

    describe('getCompletedQuests', () => {
      it('fetches completed quests successfully', async () => {
        const mockQuests = [createMockQuest({ status: 'completed', completedAt: new Date().toISOString() })];
        vi.mocked(api.get).mockResolvedValueOnce({
          data: { data: { quests: mockQuests } },
        });

        const result = await questService.getCompletedQuests();

        expect(api.get).toHaveBeenCalledWith('/quests/completed');
        expect(result.quests[0].status).toBe('completed');
      });
    });

    describe('acceptQuest', () => {
      it('accepts a quest successfully', async () => {
        const mockQuest = createMockQuest();
        const mockDefinition = createMockQuestDefinition();
        vi.mocked(api.post).mockResolvedValueOnce({
          data: {
            data: {
              message: 'Quest accepted',
              quest: mockQuest,
              definition: mockDefinition,
            },
          },
        });

        const result = await questService.acceptQuest('quest-1');

        expect(api.post).toHaveBeenCalledWith('/quests/accept', { questId: 'quest-1' });
        expect(result.message).toBe('Quest accepted');
        expect(result.quest).toEqual(mockQuest);
        expect(result.definition).toEqual(mockDefinition);
      });

      it('handles invalid quest ID', async () => {
        vi.mocked(api.post).mockRejectedValueOnce(new Error('Quest not found'));

        await expect(questService.acceptQuest('invalid-id')).rejects.toThrow('Quest not found');
      });
    });

    describe('abandonQuest', () => {
      it('abandons a quest successfully', async () => {
        vi.mocked(api.post).mockResolvedValueOnce({
          data: {
            data: {
              message: 'Quest abandoned',
              questId: 'quest-1',
            },
          },
        });

        const result = await questService.abandonQuest('quest-1');

        expect(api.post).toHaveBeenCalledWith('/quests/abandon', { questId: 'quest-1' });
        expect(result.message).toBe('Quest abandoned');
        expect(result.questId).toBe('quest-1');
      });
    });

    describe('getQuestDetails', () => {
      it('fetches quest details successfully', async () => {
        const mockQuest = createMockQuest();
        const mockDefinition = createMockQuestDefinition();
        vi.mocked(api.get).mockResolvedValueOnce({
          data: {
            data: {
              quest: mockQuest,
              definition: mockDefinition,
            },
          },
        });

        const result = await questService.getQuestDetails('quest-1');

        expect(api.get).toHaveBeenCalledWith('/quests/quest-1');
        expect(result.quest).toEqual(mockQuest);
        expect(result.definition).toEqual(mockDefinition);
      });

      it('includes chain information when available', async () => {
        const mockQuest = createMockQuest();
        const mockDefinition = createMockQuestDefinition({
          chain: {
            chainId: 'chain-1',
            chainName: 'The Main Story',
            order: 1,
            total: 5,
          },
        });
        vi.mocked(api.get).mockResolvedValueOnce({
          data: {
            data: {
              quest: mockQuest,
              definition: mockDefinition,
              chain: {
                chainId: 'chain-1',
                chainName: 'The Main Story',
                description: 'The main storyline',
                totalQuests: 5,
                completedQuests: 0,
                currentQuest: 'quest-1',
              },
            },
          },
        });

        const result = await questService.getQuestDetails('quest-1');

        expect(result.chain).toBeDefined();
        expect(result.chain?.chainName).toBe('The Main Story');
      });
    });
  });

  // ===== Convenience Methods =====

  describe('Convenience Methods', () => {
    describe('meetsRequirements', () => {
      it('returns canAccept true when no requirements', () => {
        const quest = createMockQuestDefinition({ requirements: undefined });

        const result = questService.meetsRequirements(1, 'outlaw', 0, [], quest);

        expect(result.canAccept).toBe(true);
        expect(result.reason).toBeUndefined();
      });

      it('checks level requirement - passes', () => {
        const quest = createMockQuestDefinition({
          requirements: { level: 5 },
        });

        const result = questService.meetsRequirements(10, 'outlaw', 0, [], quest);

        expect(result.canAccept).toBe(true);
      });

      it('checks level requirement - fails', () => {
        const quest = createMockQuestDefinition({
          requirements: { level: 10 },
        });

        const result = questService.meetsRequirements(5, 'outlaw', 0, [], quest);

        expect(result.canAccept).toBe(false);
        expect(result.reason).toBe('Requires level 10');
      });

      it('checks faction requirement - passes', () => {
        const quest = createMockQuestDefinition({
          requirements: { faction: 'outlaw' },
        });

        const result = questService.meetsRequirements(10, 'outlaw', 0, [], quest);

        expect(result.canAccept).toBe(true);
      });

      it('checks faction requirement - fails', () => {
        const quest = createMockQuestDefinition({
          requirements: { faction: 'lawman' },
        });

        const result = questService.meetsRequirements(10, 'outlaw', 0, [], quest);

        expect(result.canAccept).toBe(false);
        expect(result.reason).toBe('Requires faction: lawman');
      });

      it('checks reputation requirement - passes', () => {
        const quest = createMockQuestDefinition({
          requirements: { reputation: 100 },
        });

        const result = questService.meetsRequirements(10, 'outlaw', 150, [], quest);

        expect(result.canAccept).toBe(true);
      });

      it('checks reputation requirement - fails', () => {
        const quest = createMockQuestDefinition({
          requirements: { reputation: 100 },
        });

        const result = questService.meetsRequirements(10, 'outlaw', 50, [], quest);

        expect(result.canAccept).toBe(false);
        expect(result.reason).toBe('Requires 100 reputation');
      });

      it('checks completed quests requirement - passes', () => {
        const quest = createMockQuestDefinition({
          requirements: { completedQuests: ['quest-a', 'quest-b'] },
        });

        const result = questService.meetsRequirements(10, 'outlaw', 0, ['quest-a', 'quest-b', 'quest-c'], quest);

        expect(result.canAccept).toBe(true);
      });

      it('checks completed quests requirement - fails', () => {
        const quest = createMockQuestDefinition({
          requirements: { completedQuests: ['quest-a', 'quest-b'] },
        });

        const result = questService.meetsRequirements(10, 'outlaw', 0, ['quest-a'], quest);

        expect(result.canAccept).toBe(false);
        expect(result.reason).toBe('Requires completion of previous quests');
      });

      it('checks multiple requirements - all pass', () => {
        const quest = createMockQuestDefinition({
          requirements: {
            level: 5,
            faction: 'outlaw',
            reputation: 50,
          },
        });

        const result = questService.meetsRequirements(10, 'outlaw', 100, [], quest);

        expect(result.canAccept).toBe(true);
      });

      it('checks multiple requirements - fails first', () => {
        const quest = createMockQuestDefinition({
          requirements: {
            level: 15,
            faction: 'outlaw',
            reputation: 50,
          },
        });

        const result = questService.meetsRequirements(10, 'outlaw', 100, [], quest);

        expect(result.canAccept).toBe(false);
        expect(result.reason).toBe('Requires level 15');
      });
    });

    describe('calculateProgress', () => {
      it('returns 0 for empty objectives', () => {
        const quest = createMockQuest({ objectives: [] });

        const result = questService.calculateProgress(quest);

        expect(result).toBe(0);
      });

      it('returns 0 for no objectives', () => {
        const quest = createMockQuest({ objectives: undefined as unknown as QuestObjective[] });

        const result = questService.calculateProgress(quest);

        expect(result).toBe(0);
      });

      it('returns 0 when no objectives completed', () => {
        const quest = createMockQuest({
          objectives: [
            createMockObjective({ completed: false }),
            createMockObjective({ id: 'obj-2', completed: false }),
          ],
        });

        const result = questService.calculateProgress(quest);

        expect(result).toBe(0);
      });

      it('returns 50 when half objectives completed', () => {
        const quest = createMockQuest({
          objectives: [
            createMockObjective({ completed: true }),
            createMockObjective({ id: 'obj-2', completed: false }),
          ],
        });

        const result = questService.calculateProgress(quest);

        expect(result).toBe(50);
      });

      it('returns 100 when all objectives completed', () => {
        const quest = createMockQuest({
          objectives: [
            createMockObjective({ completed: true }),
            createMockObjective({ id: 'obj-2', completed: true }),
          ],
        });

        const result = questService.calculateProgress(quest);

        expect(result).toBe(100);
      });

      it('rounds to whole number', () => {
        const quest = createMockQuest({
          objectives: [
            createMockObjective({ completed: true }),
            createMockObjective({ id: 'obj-2', completed: false }),
            createMockObjective({ id: 'obj-3', completed: false }),
          ],
        });

        const result = questService.calculateProgress(quest);

        expect(result).toBe(33); // 33.33... rounded
      });

      it('handles single objective', () => {
        const quest = createMockQuest({
          objectives: [createMockObjective({ completed: true })],
        });

        const result = questService.calculateProgress(quest);

        expect(result).toBe(100);
      });
    });

    describe('getTimeRemaining', () => {
      it('returns null for quest without expiry', () => {
        const quest = createMockQuest({ expiresAt: undefined });

        const result = questService.getTimeRemaining(quest);

        expect(result).toBeNull();
      });

      it('returns minutes remaining for active quest', () => {
        const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
        const quest = createMockQuest({ expiresAt: futureDate.toISOString() });

        const result = questService.getTimeRemaining(quest);

        expect(result).toBeGreaterThan(55);
        expect(result).toBeLessThanOrEqual(60);
      });

      it('returns 0 for expired quest', () => {
        const pastDate = new Date(Date.now() - 60 * 1000); // 1 minute ago
        const quest = createMockQuest({ expiresAt: pastDate.toISOString() });

        const result = questService.getTimeRemaining(quest);

        expect(result).toBe(0);
      });

      it('handles quest expiring soon', () => {
        const soonDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
        const quest = createMockQuest({ expiresAt: soonDate.toISOString() });

        const result = questService.getTimeRemaining(quest);

        expect(result).toBeGreaterThan(3);
        expect(result).toBeLessThanOrEqual(5);
      });
    });

    describe('isExpired', () => {
      it('returns false for quest without expiry', () => {
        const quest = createMockQuest({ expiresAt: undefined });

        const result = questService.isExpired(quest);

        expect(result).toBe(false);
      });

      it('returns false for active quest', () => {
        const futureDate = new Date(Date.now() + 60 * 60 * 1000);
        const quest = createMockQuest({ expiresAt: futureDate.toISOString() });

        const result = questService.isExpired(quest);

        expect(result).toBe(false);
      });

      it('returns true for expired quest', () => {
        const pastDate = new Date(Date.now() - 60 * 1000);
        const quest = createMockQuest({ expiresAt: pastDate.toISOString() });

        const result = questService.isExpired(quest);

        expect(result).toBe(true);
      });
    });

    describe('formatRewards', () => {
      it('formats experience only', () => {
        const rewards = createMockReward({ experience: 500, gold: undefined, reputation: undefined });

        const result = questService.formatRewards(rewards);

        expect(result).toBe('500 XP');
      });

      it('formats gold only', () => {
        const rewards = createMockReward({ experience: undefined, gold: 1000, reputation: undefined });

        const result = questService.formatRewards(rewards);

        expect(result).toBe('1000 Gold');
      });

      it('formats all reward types', () => {
        const rewards: QuestReward = {
          experience: 100,
          gold: 50,
          reputation: 10,
          skillPoints: 2,
          items: [{ itemId: 'item-1', name: 'Revolver', quantity: 1 }],
          title: 'Bandit Hunter',
        };

        const result = questService.formatRewards(rewards);

        expect(result).toContain('100 XP');
        expect(result).toContain('50 Gold');
        expect(result).toContain('10 Reputation');
        expect(result).toContain('2 Skill Points');
        expect(result).toContain('1 item(s)');
        expect(result).toContain('Title: Bandit Hunter');
      });

      it('handles empty rewards', () => {
        const rewards: QuestReward = {};

        const result = questService.formatRewards(rewards);

        expect(result).toBe('');
      });

      it('handles multiple items', () => {
        const rewards: QuestReward = {
          items: [
            { itemId: 'item-1', name: 'Revolver', quantity: 1 },
            { itemId: 'item-2', name: 'Bullets', quantity: 50 },
          ],
        };

        const result = questService.formatRewards(rewards);

        expect(result).toBe('2 item(s)');
      });
    });

    describe('filterByType', () => {
      it('filters quests by type', () => {
        const quests = [
          createMockQuestDefinition({ questId: 'q1', type: 'main' }),
          createMockQuestDefinition({ questId: 'q2', type: 'side' }),
          createMockQuestDefinition({ questId: 'q3', type: 'main' }),
          createMockQuestDefinition({ questId: 'q4', type: 'daily' }),
        ];

        const result = questService.filterByType(quests, 'main');

        expect(result).toHaveLength(2);
        expect(result.every((q) => q.type === 'main')).toBe(true);
      });

      it('returns empty array when no matches', () => {
        const quests = [
          createMockQuestDefinition({ type: 'side' }),
          createMockQuestDefinition({ type: 'side' }),
        ];

        const result = questService.filterByType(quests, 'legendary');

        expect(result).toHaveLength(0);
      });

      it('handles empty array', () => {
        const result = questService.filterByType([], 'main');

        expect(result).toHaveLength(0);
      });
    });

    describe('filterByDifficulty', () => {
      it('filters quests by difficulty', () => {
        const quests = [
          createMockQuestDefinition({ questId: 'q1', difficulty: 'easy' }),
          createMockQuestDefinition({ questId: 'q2', difficulty: 'hard' }),
          createMockQuestDefinition({ questId: 'q3', difficulty: 'easy' }),
        ];

        const result = questService.filterByDifficulty(quests, 'easy');

        expect(result).toHaveLength(2);
        expect(result.every((q) => q.difficulty === 'easy')).toBe(true);
      });

      it('filters legendary difficulty', () => {
        const quests = [
          createMockQuestDefinition({ questId: 'q1', difficulty: 'legendary' }),
          createMockQuestDefinition({ questId: 'q2', difficulty: 'hard' }),
        ];

        const result = questService.filterByDifficulty(quests, 'legendary');

        expect(result).toHaveLength(1);
        expect(result[0].questId).toBe('q1');
      });
    });

    describe('sortByLevel', () => {
      it('sorts quests by level ascending', () => {
        const quests = [
          createMockQuestDefinition({ questId: 'q1', level: 10 }),
          createMockQuestDefinition({ questId: 'q2', level: 5 }),
          createMockQuestDefinition({ questId: 'q3', level: 15 }),
        ];

        const result = questService.sortByLevel(quests, true);

        expect(result[0].level).toBe(5);
        expect(result[1].level).toBe(10);
        expect(result[2].level).toBe(15);
      });

      it('sorts quests by level descending', () => {
        const quests = [
          createMockQuestDefinition({ questId: 'q1', level: 10 }),
          createMockQuestDefinition({ questId: 'q2', level: 5 }),
          createMockQuestDefinition({ questId: 'q3', level: 15 }),
        ];

        const result = questService.sortByLevel(quests, false);

        expect(result[0].level).toBe(15);
        expect(result[1].level).toBe(10);
        expect(result[2].level).toBe(5);
      });

      it('does not mutate original array', () => {
        const quests = [
          createMockQuestDefinition({ questId: 'q1', level: 10 }),
          createMockQuestDefinition({ questId: 'q2', level: 5 }),
        ];
        const originalFirst = quests[0];

        questService.sortByLevel(quests, true);

        expect(quests[0]).toBe(originalFirst);
      });
    });

    describe('sortByReward', () => {
      it('sorts quests by reward value descending by default', () => {
        const quests = [
          createMockQuestDefinition({ questId: 'q1', rewards: { experience: 50, gold: 10 } }),
          createMockQuestDefinition({ questId: 'q2', rewards: { experience: 100, gold: 50 } }),
          createMockQuestDefinition({ questId: 'q3', rewards: { experience: 200, gold: 5 } }),
        ];

        const result = questService.sortByReward(quests);

        // q2: 100 + 50*10 = 600
        // q3: 200 + 5*10 = 250
        // q1: 50 + 10*10 = 150
        expect(result[0].questId).toBe('q2');
        expect(result[1].questId).toBe('q3');
        expect(result[2].questId).toBe('q1');
      });

      it('sorts quests by reward value ascending', () => {
        const quests = [
          createMockQuestDefinition({ questId: 'q1', rewards: { experience: 50, gold: 10 } }),
          createMockQuestDefinition({ questId: 'q2', rewards: { experience: 100, gold: 50 } }),
        ];

        const result = questService.sortByReward(quests, true);

        expect(result[0].questId).toBe('q1');
        expect(result[1].questId).toBe('q2');
      });

      it('handles missing reward values', () => {
        const quests = [
          createMockQuestDefinition({ questId: 'q1', rewards: {} }),
          createMockQuestDefinition({ questId: 'q2', rewards: { experience: 100 } }),
        ];

        const result = questService.sortByReward(quests);

        expect(result[0].questId).toBe('q2');
        expect(result[1].questId).toBe('q1');
      });
    });

    describe('getQuestChains', () => {
      it('groups quests by chain', () => {
        const quests = [
          createMockQuestDefinition({
            questId: 'q1',
            chain: { chainId: 'chain-1', chainName: 'Story A', order: 1, total: 3 },
          }),
          createMockQuestDefinition({
            questId: 'q2',
            chain: { chainId: 'chain-1', chainName: 'Story A', order: 2, total: 3 },
          }),
          createMockQuestDefinition({
            questId: 'q3',
            chain: { chainId: 'chain-2', chainName: 'Story B', order: 1, total: 2 },
          }),
          createMockQuestDefinition({ questId: 'q4' }), // No chain
        ];

        const result = questService.getQuestChains(quests);

        expect(result.size).toBe(2);
        expect(result.get('chain-1')).toHaveLength(2);
        expect(result.get('chain-2')).toHaveLength(1);
      });

      it('returns empty map for quests without chains', () => {
        const quests = [
          createMockQuestDefinition({ questId: 'q1' }),
          createMockQuestDefinition({ questId: 'q2' }),
        ];

        const result = questService.getQuestChains(quests);

        expect(result.size).toBe(0);
      });

      it('handles empty quest list', () => {
        const result = questService.getQuestChains([]);

        expect(result.size).toBe(0);
      });
    });
  });
});
