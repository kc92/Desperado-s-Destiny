/**
 * Achievement Service Unit Tests
 * Comprehensive tests for achievement tracking and rewards
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  achievementService,
  Achievement,
  AchievementReward,
  AchievementCategory,
  AchievementTier,
} from './achievement.service';
import api from './api';

// Mock the API module
vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// ===== Test Data Factories =====

const createMockReward = (overrides: Partial<AchievementReward> = {}): AchievementReward => ({
  experience: 100,
  gold: 50,
  reputation: 10,
  ...overrides,
});

const createMockAchievement = (overrides: Partial<Achievement> = {}): Achievement => ({
  _id: 'ach-1',
  characterId: 'char-1',
  achievementType: 'kills_bandits',
  title: 'Bandit Slayer',
  description: 'Kill 100 bandits',
  category: 'combat',
  tier: 'bronze',
  target: 100,
  progress: 0,
  completed: false,
  reward: createMockReward(),
  ...overrides,
});

describe('Achievement Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ===== API Methods =====

  describe('API Methods', () => {
    describe('getAchievements', () => {
      it('fetches all achievements successfully', async () => {
        const mockResponse = {
          achievements: {
            combat: [createMockAchievement()],
            crime: [],
            social: [],
            economy: [],
            exploration: [],
            special: [],
          },
          stats: { completed: 5, total: 100, percentage: 5 },
          recentlyCompleted: [],
        };
        vi.mocked(api.get).mockResolvedValueOnce({
          data: { data: mockResponse },
        });

        const result = await achievementService.getAchievements();

        expect(api.get).toHaveBeenCalledWith('/achievements');
        expect(result.achievements.combat).toHaveLength(1);
      });

      it('handles API errors', async () => {
        vi.mocked(api.get).mockRejectedValueOnce(new Error('Server error'));

        await expect(achievementService.getAchievements()).rejects.toThrow('Server error');
      });
    });

    describe('getAchievementSummary', () => {
      it('fetches achievement summary successfully', async () => {
        const mockResponse = {
          totalCompleted: 10,
          totalAchievements: 100,
          completionRate: 10,
          byCategory: [{ category: 'combat' as AchievementCategory, completed: 5, total: 20 }],
          byTier: [{ tier: 'bronze' as AchievementTier, completed: 8, total: 30 }],
          recentlyCompleted: [],
          nearCompletion: [],
          unclaimedRewards: [],
        };
        vi.mocked(api.get).mockResolvedValueOnce({
          data: { data: mockResponse },
        });

        const result = await achievementService.getAchievementSummary();

        expect(api.get).toHaveBeenCalledWith('/achievements/summary');
        expect(result.totalCompleted).toBe(10);
        expect(result.completionRate).toBe(10);
      });
    });

    describe('claimAchievementReward', () => {
      it('claims reward successfully', async () => {
        const mockAchievement = createMockAchievement({
          completed: true,
          claimedAt: new Date().toISOString(),
        });
        const mockResponse = {
          message: 'Reward claimed',
          achievement: mockAchievement,
          rewards: { experience: 100, gold: 50 },
          newStats: { experience: 1000, gold: 500 },
        };
        vi.mocked(api.post).mockResolvedValueOnce({
          data: { data: mockResponse },
        });

        const result = await achievementService.claimAchievementReward('ach-1');

        expect(api.post).toHaveBeenCalledWith('/achievements/ach-1/claim');
        expect(result.message).toBe('Reward claimed');
        expect(result.rewards.experience).toBe(100);
      });

      it('handles uncompleted achievement claim', async () => {
        vi.mocked(api.post).mockRejectedValueOnce(new Error('Achievement not completed'));

        await expect(achievementService.claimAchievementReward('ach-1')).rejects.toThrow(
          'Achievement not completed'
        );
      });
    });
  });

  // ===== Convenience Methods =====

  describe('Convenience Methods', () => {
    describe('calculateProgress', () => {
      it('returns 0 for zero target', () => {
        const achievement = createMockAchievement({ target: 0, progress: 0 });

        const result = achievementService.calculateProgress(achievement);

        expect(result).toBe(0);
      });

      it('returns 0 for no progress', () => {
        const achievement = createMockAchievement({ target: 100, progress: 0 });

        const result = achievementService.calculateProgress(achievement);

        expect(result).toBe(0);
      });

      it('returns correct percentage for partial progress', () => {
        const achievement = createMockAchievement({ target: 100, progress: 50 });

        const result = achievementService.calculateProgress(achievement);

        expect(result).toBe(50);
      });

      it('returns 100 for completed achievement', () => {
        const achievement = createMockAchievement({ target: 100, progress: 100 });

        const result = achievementService.calculateProgress(achievement);

        expect(result).toBe(100);
      });

      it('caps at 100 for over-completed achievement', () => {
        const achievement = createMockAchievement({ target: 100, progress: 150 });

        const result = achievementService.calculateProgress(achievement);

        expect(result).toBe(100);
      });

      it('rounds to whole number', () => {
        const achievement = createMockAchievement({ target: 3, progress: 1 });

        const result = achievementService.calculateProgress(achievement);

        expect(result).toBe(33); // 33.33... rounded
      });
    });

    describe('isUnclaimed', () => {
      it('returns true for completed but unclaimed', () => {
        const achievement = createMockAchievement({
          completed: true,
          claimedAt: undefined,
        });

        const result = achievementService.isUnclaimed(achievement);

        expect(result).toBe(true);
      });

      it('returns false for claimed achievement', () => {
        const achievement = createMockAchievement({
          completed: true,
          claimedAt: new Date().toISOString(),
        });

        const result = achievementService.isUnclaimed(achievement);

        expect(result).toBe(false);
      });

      it('returns false for incomplete achievement', () => {
        const achievement = createMockAchievement({ completed: false });

        const result = achievementService.isUnclaimed(achievement);

        expect(result).toBe(false);
      });
    });

    describe('isNearCompletion', () => {
      it('returns true when progress above threshold', () => {
        const achievement = createMockAchievement({
          target: 100,
          progress: 85,
          completed: false,
        });

        const result = achievementService.isNearCompletion(achievement, 80);

        expect(result).toBe(true);
      });

      it('returns false when progress below threshold', () => {
        const achievement = createMockAchievement({
          target: 100,
          progress: 70,
          completed: false,
        });

        const result = achievementService.isNearCompletion(achievement, 80);

        expect(result).toBe(false);
      });

      it('returns false for completed achievements', () => {
        const achievement = createMockAchievement({
          target: 100,
          progress: 100,
          completed: true,
        });

        const result = achievementService.isNearCompletion(achievement, 80);

        expect(result).toBe(false);
      });

      it('uses default threshold of 80', () => {
        const achievement = createMockAchievement({
          target: 100,
          progress: 81,
          completed: false,
        });

        const result = achievementService.isNearCompletion(achievement);

        expect(result).toBe(true);
      });

      it('returns true at exactly threshold', () => {
        const achievement = createMockAchievement({
          target: 100,
          progress: 80,
          completed: false,
        });

        const result = achievementService.isNearCompletion(achievement, 80);

        expect(result).toBe(true);
      });
    });

    describe('filterByCategory', () => {
      it('filters achievements by category', () => {
        const achievements = [
          createMockAchievement({ _id: 'a1', category: 'combat' }),
          createMockAchievement({ _id: 'a2', category: 'crime' }),
          createMockAchievement({ _id: 'a3', category: 'combat' }),
        ];

        const result = achievementService.filterByCategory(achievements, 'combat');

        expect(result).toHaveLength(2);
        expect(result.every((a) => a.category === 'combat')).toBe(true);
      });

      it('returns empty array when no matches', () => {
        const achievements = [
          createMockAchievement({ category: 'combat' }),
          createMockAchievement({ category: 'crime' }),
        ];

        const result = achievementService.filterByCategory(achievements, 'special');

        expect(result).toHaveLength(0);
      });
    });

    describe('filterByTier', () => {
      it('filters achievements by tier', () => {
        const achievements = [
          createMockAchievement({ _id: 'a1', tier: 'bronze' }),
          createMockAchievement({ _id: 'a2', tier: 'gold' }),
          createMockAchievement({ _id: 'a3', tier: 'bronze' }),
        ];

        const result = achievementService.filterByTier(achievements, 'bronze');

        expect(result).toHaveLength(2);
        expect(result.every((a) => a.tier === 'bronze')).toBe(true);
      });

      it('filters legendary tier', () => {
        const achievements = [
          createMockAchievement({ tier: 'bronze' }),
          createMockAchievement({ tier: 'legendary' }),
        ];

        const result = achievementService.filterByTier(achievements, 'legendary');

        expect(result).toHaveLength(1);
        expect(result[0].tier).toBe('legendary');
      });
    });

    describe('getCompleted', () => {
      it('returns only completed achievements', () => {
        const achievements = [
          createMockAchievement({ _id: 'a1', completed: true }),
          createMockAchievement({ _id: 'a2', completed: false }),
          createMockAchievement({ _id: 'a3', completed: true }),
        ];

        const result = achievementService.getCompleted(achievements);

        expect(result).toHaveLength(2);
        expect(result.every((a) => a.completed)).toBe(true);
      });

      it('returns empty array when none completed', () => {
        const achievements = [
          createMockAchievement({ completed: false }),
          createMockAchievement({ completed: false }),
        ];

        const result = achievementService.getCompleted(achievements);

        expect(result).toHaveLength(0);
      });
    });

    describe('getUnclaimed', () => {
      it('returns only unclaimed achievements', () => {
        const achievements = [
          createMockAchievement({ _id: 'a1', completed: true, claimedAt: undefined }),
          createMockAchievement({ _id: 'a2', completed: true, claimedAt: new Date().toISOString() }),
          createMockAchievement({ _id: 'a3', completed: false }),
        ];

        const result = achievementService.getUnclaimed(achievements);

        expect(result).toHaveLength(1);
        expect(result[0]._id).toBe('a1');
      });
    });

    describe('getInProgress', () => {
      it('returns achievements with partial progress', () => {
        const achievements = [
          createMockAchievement({ _id: 'a1', completed: false, progress: 50 }),
          createMockAchievement({ _id: 'a2', completed: false, progress: 0 }),
          createMockAchievement({ _id: 'a3', completed: true, progress: 100 }),
        ];

        const result = achievementService.getInProgress(achievements);

        expect(result).toHaveLength(1);
        expect(result[0]._id).toBe('a1');
      });
    });

    describe('sortByProgress', () => {
      it('sorts by progress descending by default', () => {
        const achievements = [
          createMockAchievement({ _id: 'a1', target: 100, progress: 30 }),
          createMockAchievement({ _id: 'a2', target: 100, progress: 80 }),
          createMockAchievement({ _id: 'a3', target: 100, progress: 50 }),
        ];

        const result = achievementService.sortByProgress(achievements);

        expect(result[0]._id).toBe('a2');
        expect(result[1]._id).toBe('a3');
        expect(result[2]._id).toBe('a1');
      });

      it('sorts by progress ascending', () => {
        const achievements = [
          createMockAchievement({ _id: 'a1', target: 100, progress: 30 }),
          createMockAchievement({ _id: 'a2', target: 100, progress: 80 }),
        ];

        const result = achievementService.sortByProgress(achievements, false);

        expect(result[0]._id).toBe('a1');
        expect(result[1]._id).toBe('a2');
      });

      it('does not mutate original array', () => {
        const achievements = [
          createMockAchievement({ _id: 'a1', progress: 80 }),
          createMockAchievement({ _id: 'a2', progress: 30 }),
        ];
        const originalFirst = achievements[0];

        achievementService.sortByProgress(achievements);

        expect(achievements[0]).toBe(originalFirst);
      });
    });

    describe('sortByTier', () => {
      it('sorts by tier value descending by default', () => {
        const achievements = [
          createMockAchievement({ _id: 'a1', tier: 'bronze' }),
          createMockAchievement({ _id: 'a2', tier: 'legendary' }),
          createMockAchievement({ _id: 'a3', tier: 'gold' }),
        ];

        const result = achievementService.sortByTier(achievements);

        expect(result[0].tier).toBe('legendary');
        expect(result[1].tier).toBe('gold');
        expect(result[2].tier).toBe('bronze');
      });

      it('sorts by tier value ascending', () => {
        const achievements = [
          createMockAchievement({ _id: 'a1', tier: 'gold' }),
          createMockAchievement({ _id: 'a2', tier: 'bronze' }),
          createMockAchievement({ _id: 'a3', tier: 'platinum' }),
        ];

        const result = achievementService.sortByTier(achievements, false);

        expect(result[0].tier).toBe('bronze');
        expect(result[1].tier).toBe('gold');
        expect(result[2].tier).toBe('platinum');
      });
    });

    describe('getTierColor', () => {
      it('returns correct color for bronze', () => {
        const result = achievementService.getTierColor('bronze');
        expect(result).toBe('#CD7F32');
      });

      it('returns correct color for silver', () => {
        const result = achievementService.getTierColor('silver');
        expect(result).toBe('#C0C0C0');
      });

      it('returns correct color for gold', () => {
        const result = achievementService.getTierColor('gold');
        expect(result).toBe('#FFD700');
      });

      it('returns correct color for platinum', () => {
        const result = achievementService.getTierColor('platinum');
        expect(result).toBe('#E5E4E2');
      });

      it('returns correct color for legendary', () => {
        const result = achievementService.getTierColor('legendary');
        expect(result).toBe('#FF6B35');
      });
    });

    describe('getCategoryIcon', () => {
      it('returns correct icon for combat', () => {
        const result = achievementService.getCategoryIcon('combat');
        expect(result).toBe('⚔️');
      });

      it('returns correct icon for crime', () => {
        const result = achievementService.getCategoryIcon('crime');
        expect(result).toBe('💰');
      });

      it('returns correct icon for social', () => {
        const result = achievementService.getCategoryIcon('social');
        expect(result).toBe('👥');
      });

      it('returns correct icon for economy', () => {
        const result = achievementService.getCategoryIcon('economy');
        expect(result).toBe('💵');
      });

      it('returns correct icon for exploration', () => {
        const result = achievementService.getCategoryIcon('exploration');
        expect(result).toBe('🗺️');
      });

      it('returns correct icon for special', () => {
        const result = achievementService.getCategoryIcon('special');
        expect(result).toBe('⭐');
      });
    });

    describe('formatReward', () => {
      it('formats single reward type', () => {
        const reward = createMockReward({ experience: 500, gold: undefined, reputation: undefined });

        const result = achievementService.formatReward(reward);

        expect(result).toBe('500 XP');
      });

      it('formats all reward types', () => {
        const reward: AchievementReward = {
          experience: 100,
          gold: 50,
          reputation: 10,
          skillPoints: 2,
          title: 'Champion',
          cosmetic: { type: 'badge', id: 'badge-1', name: 'Golden Badge' },
        };

        const result = achievementService.formatReward(reward);

        expect(result).toContain('100 XP');
        expect(result).toContain('50 Gold');
        expect(result).toContain('10 Reputation');
        expect(result).toContain('2 Skill Points');
        expect(result).toContain('Title: "Champion"');
        expect(result).toContain('Golden Badge');
      });

      it('handles empty reward', () => {
        const reward: AchievementReward = {};

        const result = achievementService.formatReward(reward);

        expect(result).toBe('');
      });
    });

    describe('calculateTotalRewards', () => {
      it('calculates totals from multiple achievements', () => {
        const achievements = [
          createMockAchievement({
            reward: { experience: 100, gold: 50, reputation: 10, skillPoints: 1 },
          }),
          createMockAchievement({
            reward: { experience: 200, gold: 100, reputation: 20, skillPoints: 2, title: 'Hero' },
          }),
          createMockAchievement({
            reward: {
              experience: 50,
              cosmetic: { type: 'badge', id: 'b1', name: 'Star Badge' },
            },
          }),
        ];

        const result = achievementService.calculateTotalRewards(achievements);

        expect(result.totalExperience).toBe(350);
        expect(result.totalGold).toBe(150);
        expect(result.totalReputation).toBe(30);
        expect(result.totalSkillPoints).toBe(3);
        expect(result.titles).toEqual(['Hero']);
        expect(result.cosmetics).toEqual(['Star Badge']);
      });

      it('handles empty achievement list', () => {
        const result = achievementService.calculateTotalRewards([]);

        expect(result.totalExperience).toBe(0);
        expect(result.totalGold).toBe(0);
        expect(result.totalReputation).toBe(0);
        expect(result.totalSkillPoints).toBe(0);
        expect(result.titles).toEqual([]);
        expect(result.cosmetics).toEqual([]);
      });

      it('handles missing reward fields', () => {
        const achievements = [
          createMockAchievement({ reward: {} }),
          createMockAchievement({ reward: { experience: 100 } }),
        ];

        const result = achievementService.calculateTotalRewards(achievements);

        expect(result.totalExperience).toBe(100);
        expect(result.totalGold).toBe(0);
      });
    });

    describe('getNearCompletion', () => {
      it('returns achievements near completion sorted by progress', () => {
        const achievements = [
          createMockAchievement({ _id: 'a1', target: 100, progress: 50, completed: false }),
          createMockAchievement({ _id: 'a2', target: 100, progress: 90, completed: false }),
          createMockAchievement({ _id: 'a3', target: 100, progress: 85, completed: false }),
          createMockAchievement({ _id: 'a4', target: 100, progress: 100, completed: true }),
        ];

        const result = achievementService.getNearCompletion(achievements, 80);

        expect(result).toHaveLength(2);
        expect(result[0].achievementType).toBe('kills_bandits');
        expect(result[0].percentage).toBe(90);
        expect(result[1].percentage).toBe(85);
      });

      it('respects limit parameter', () => {
        const achievements = [
          createMockAchievement({ _id: 'a1', target: 100, progress: 90, completed: false }),
          createMockAchievement({ _id: 'a2', target: 100, progress: 85, completed: false }),
          createMockAchievement({ _id: 'a3', target: 100, progress: 82, completed: false }),
        ];

        const result = achievementService.getNearCompletion(achievements, 80, 2);

        expect(result).toHaveLength(2);
      });

      it('uses default limit of 5', () => {
        const achievements = Array.from({ length: 10 }, (_, i) =>
          createMockAchievement({
            _id: `a${i}`,
            target: 100,
            progress: 80 + i,
            completed: false,
          })
        );

        const result = achievementService.getNearCompletion(achievements, 80);

        expect(result).toHaveLength(5);
      });

      it('returns correct progress information', () => {
        const achievement = createMockAchievement({
          achievementType: 'test_type',
          title: 'Test Title',
          tier: 'gold',
          target: 100,
          progress: 90,
          completed: false,
        });

        const result = achievementService.getNearCompletion([achievement], 80);

        expect(result[0]).toEqual({
          achievementType: 'test_type',
          title: 'Test Title',
          current: 90,
          target: 100,
          percentage: 90,
          tier: 'gold',
        });
      });
    });
  });
});
