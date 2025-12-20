/**
 * Leaderboard Service Unit Tests
 * Comprehensive tests for leaderboard API calls and utility methods
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  leaderboardService,
  LeaderboardEntry,
  GangLeaderboardEntry,
  LeaderboardType,
} from './leaderboard.service';
import api from './api';

// Mock the API module
vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
  },
}));

// ===== Test Data Factories =====

const createMockLeaderboardEntry = (overrides: Partial<LeaderboardEntry> = {}): LeaderboardEntry => ({
  rank: 1,
  characterId: 'char-1',
  name: 'Outlaw Joe',
  value: 1000,
  faction: 'outlaw',
  level: 50,
  ...overrides,
});

const createMockGangEntry = (overrides: Partial<GangLeaderboardEntry> = {}): GangLeaderboardEntry => ({
  rank: 1,
  gangId: 'gang-1',
  name: 'The Bandits',
  tag: 'TBD',
  value: 5000,
  memberCount: 10,
  level: 5,
  leader: 'Boss Joe',
  faction: 'outlaw',
  ...overrides,
});

describe('Leaderboard Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ===== API Methods =====

  describe('API Methods', () => {
    describe('getLevelLeaderboard', () => {
      it('fetches level leaderboard with defaults', async () => {
        const mockLeaderboard = [
          createMockLeaderboardEntry({ rank: 1, value: 100 }),
          createMockLeaderboardEntry({ rank: 2, value: 90, characterId: 'char-2' }),
        ];
        vi.mocked(api.get).mockResolvedValueOnce({
          data: { data: { leaderboard: mockLeaderboard, type: 'level', range: 'all' } },
        });

        const result = await leaderboardService.getLevelLeaderboard();

        expect(api.get).toHaveBeenCalledWith('/leaderboard/level', {
          params: { range: 'all', limit: 100 },
        });
        expect(result.leaderboard).toHaveLength(2);
        expect(result.type).toBe('level');
      });

      it('fetches with custom range and limit', async () => {
        vi.mocked(api.get).mockResolvedValueOnce({
          data: { data: { leaderboard: [], type: 'level', range: 'weekly' } },
        });

        await leaderboardService.getLevelLeaderboard('weekly', 50);

        expect(api.get).toHaveBeenCalledWith('/leaderboard/level', {
          params: { range: 'weekly', limit: 50 },
        });
      });
    });

    describe('getGoldLeaderboard', () => {
      it('fetches gold leaderboard successfully', async () => {
        const mockLeaderboard = [createMockLeaderboardEntry({ value: 10000 })];
        vi.mocked(api.get).mockResolvedValueOnce({
          data: { data: { leaderboard: mockLeaderboard, type: 'gold', range: 'all' } },
        });

        const result = await leaderboardService.getGoldLeaderboard();

        expect(api.get).toHaveBeenCalledWith('/leaderboard/gold', {
          params: { range: 'all', limit: 100 },
        });
        expect(result.type).toBe('gold');
      });
    });

    describe('getReputationLeaderboard', () => {
      it('fetches reputation leaderboard successfully', async () => {
        vi.mocked(api.get).mockResolvedValueOnce({
          data: { data: { leaderboard: [], type: 'reputation', range: 'monthly' } },
        });

        const result = await leaderboardService.getReputationLeaderboard('monthly');

        expect(api.get).toHaveBeenCalledWith('/leaderboard/reputation', {
          params: { range: 'monthly', limit: 100 },
        });
        expect(result.type).toBe('reputation');
      });
    });

    describe('getCombatLeaderboard', () => {
      it('fetches combat leaderboard successfully', async () => {
        vi.mocked(api.get).mockResolvedValueOnce({
          data: { data: { leaderboard: [], type: 'combat', range: 'all' } },
        });

        const result = await leaderboardService.getCombatLeaderboard();

        expect(api.get).toHaveBeenCalledWith('/leaderboard/combat', {
          params: { range: 'all', limit: 100 },
        });
        expect(result.type).toBe('combat');
      });
    });

    describe('getBountiesLeaderboard', () => {
      it('fetches bounties leaderboard successfully', async () => {
        vi.mocked(api.get).mockResolvedValueOnce({
          data: { data: { leaderboard: [], type: 'bounties', range: 'all' } },
        });

        const result = await leaderboardService.getBountiesLeaderboard();

        expect(api.get).toHaveBeenCalledWith('/leaderboard/bounties', {
          params: { range: 'all', limit: 100 },
        });
        expect(result.type).toBe('bounties');
      });
    });

    describe('getGangsLeaderboard', () => {
      it('fetches gangs leaderboard successfully', async () => {
        const mockGangs = [createMockGangEntry()];
        vi.mocked(api.get).mockResolvedValueOnce({
          data: { data: { leaderboard: mockGangs, type: 'gangs', range: 'all' } },
        });

        const result = await leaderboardService.getGangsLeaderboard();

        expect(api.get).toHaveBeenCalledWith('/leaderboard/gangs', {
          params: { range: 'all', limit: 100 },
        });
        expect(result.type).toBe('gangs');
        expect(result.leaderboard[0].memberCount).toBe(10);
      });
    });

    describe('getAllLeaderboards', () => {
      it('fetches all leaderboards in parallel', async () => {
        vi.mocked(api.get)
          .mockResolvedValueOnce({ data: { data: { leaderboard: [], type: 'level', range: 'all' } } })
          .mockResolvedValueOnce({ data: { data: { leaderboard: [], type: 'gold', range: 'all' } } })
          .mockResolvedValueOnce({ data: { data: { leaderboard: [], type: 'reputation', range: 'all' } } })
          .mockResolvedValueOnce({ data: { data: { leaderboard: [], type: 'combat', range: 'all' } } })
          .mockResolvedValueOnce({ data: { data: { leaderboard: [], type: 'bounties', range: 'all' } } })
          .mockResolvedValueOnce({ data: { data: { leaderboard: [], type: 'gangs', range: 'all' } } });

        const result = await leaderboardService.getAllLeaderboards();

        expect(api.get).toHaveBeenCalledTimes(6);
        expect(result.level).toBeDefined();
        expect(result.gold).toBeDefined();
        expect(result.reputation).toBeDefined();
        expect(result.combat).toBeDefined();
        expect(result.bounties).toBeDefined();
        expect(result.gangs).toBeDefined();
      });

      it('passes range and limit to all calls', async () => {
        vi.mocked(api.get).mockResolvedValue({ data: { data: { leaderboard: [], type: 'level', range: 'weekly' } } });

        await leaderboardService.getAllLeaderboards('weekly', 50);

        expect(api.get).toHaveBeenCalledWith(expect.any(String), {
          params: { range: 'weekly', limit: 50 },
        });
      });
    });
  });

  // ===== Convenience Methods =====

  describe('Convenience Methods', () => {
    describe('findCharacterRank', () => {
      it('finds character rank when present', () => {
        const leaderboard = [
          createMockLeaderboardEntry({ rank: 1, characterId: 'char-1' }),
          createMockLeaderboardEntry({ rank: 2, characterId: 'char-2' }),
          createMockLeaderboardEntry({ rank: 3, characterId: 'char-3' }),
        ];

        const result = leaderboardService.findCharacterRank(leaderboard, 'char-2');

        expect(result).toBe(2);
      });

      it('returns null when character not found', () => {
        const leaderboard = [
          createMockLeaderboardEntry({ characterId: 'char-1' }),
          createMockLeaderboardEntry({ characterId: 'char-2' }),
        ];

        const result = leaderboardService.findCharacterRank(leaderboard, 'char-999');

        expect(result).toBeNull();
      });

      it('handles empty leaderboard', () => {
        const result = leaderboardService.findCharacterRank([], 'char-1');

        expect(result).toBeNull();
      });
    });

    describe('findGangRank', () => {
      it('finds gang rank when present', () => {
        const leaderboard = [
          createMockGangEntry({ rank: 1, gangId: 'gang-1' }),
          createMockGangEntry({ rank: 2, gangId: 'gang-2' }),
        ];

        const result = leaderboardService.findGangRank(leaderboard, 'gang-2');

        expect(result).toBe(2);
      });

      it('returns null when gang not found', () => {
        const leaderboard = [createMockGangEntry({ gangId: 'gang-1' })];

        const result = leaderboardService.findGangRank(leaderboard, 'gang-999');

        expect(result).toBeNull();
      });
    });

    describe('getTopEntries', () => {
      it('returns top N entries', () => {
        const leaderboard = [
          createMockLeaderboardEntry({ rank: 1 }),
          createMockLeaderboardEntry({ rank: 2 }),
          createMockLeaderboardEntry({ rank: 3 }),
          createMockLeaderboardEntry({ rank: 4 }),
          createMockLeaderboardEntry({ rank: 5 }),
        ];

        const result = leaderboardService.getTopEntries(leaderboard, 3);

        expect(result).toHaveLength(3);
        expect(result[2].rank).toBe(3);
      });

      it('returns all entries if count exceeds length', () => {
        const leaderboard = [
          createMockLeaderboardEntry({ rank: 1 }),
          createMockLeaderboardEntry({ rank: 2 }),
        ];

        const result = leaderboardService.getTopEntries(leaderboard, 10);

        expect(result).toHaveLength(2);
      });

      it('returns empty for empty leaderboard', () => {
        const result = leaderboardService.getTopEntries([], 5);

        expect(result).toHaveLength(0);
      });
    });

    describe('getTopGangEntries', () => {
      it('returns top N gang entries', () => {
        const leaderboard = [
          createMockGangEntry({ rank: 1 }),
          createMockGangEntry({ rank: 2 }),
          createMockGangEntry({ rank: 3 }),
        ];

        const result = leaderboardService.getTopGangEntries(leaderboard, 2);

        expect(result).toHaveLength(2);
      });
    });

    describe('filterByFaction', () => {
      it('filters entries by faction', () => {
        const leaderboard = [
          createMockLeaderboardEntry({ characterId: 'c1', faction: 'outlaw' }),
          createMockLeaderboardEntry({ characterId: 'c2', faction: 'lawman' }),
          createMockLeaderboardEntry({ characterId: 'c3', faction: 'outlaw' }),
        ];

        const result = leaderboardService.filterByFaction(leaderboard, 'outlaw');

        expect(result).toHaveLength(2);
        expect(result.every((e) => e.faction === 'outlaw')).toBe(true);
      });

      it('returns empty when no matches', () => {
        const leaderboard = [
          createMockLeaderboardEntry({ faction: 'outlaw' }),
          createMockLeaderboardEntry({ faction: 'outlaw' }),
        ];

        const result = leaderboardService.filterByFaction(leaderboard, 'lawman');

        expect(result).toHaveLength(0);
      });
    });

    describe('calculateStats', () => {
      it('calculates stats correctly', () => {
        const leaderboard = [
          createMockLeaderboardEntry({ rank: 1, characterId: 'c1', value: 1000 }),
          createMockLeaderboardEntry({ rank: 2, characterId: 'c2', value: 800 }),
          createMockLeaderboardEntry({ rank: 3, characterId: 'c3', value: 600 }),
          createMockLeaderboardEntry({ rank: 4, characterId: 'c4', value: 400 }),
        ];

        const result = leaderboardService.calculateStats(leaderboard, 'c2');

        expect(result.topValue).toBe(1000);
        expect(result.averageValue).toBe(700); // (1000+800+600+400)/4
        expect(result.totalEntries).toBe(4);
        expect(result.myRank).toBe(2);
        expect(result.myValue).toBe(800);
      });

      it('handles when character not in leaderboard', () => {
        const leaderboard = [
          createMockLeaderboardEntry({ rank: 1, value: 1000 }),
        ];

        const result = leaderboardService.calculateStats(leaderboard, 'c999');

        expect(result.myRank).toBeUndefined();
        expect(result.myValue).toBe(0);
      });

      it('handles empty leaderboard', () => {
        const result = leaderboardService.calculateStats([]);

        expect(result.topValue).toBe(0);
        expect(result.averageValue).toBe(0);
        expect(result.totalEntries).toBe(0);
      });

      it('handles no characterId provided', () => {
        const leaderboard = [
          createMockLeaderboardEntry({ rank: 1, value: 500 }),
        ];

        const result = leaderboardService.calculateStats(leaderboard);

        expect(result.myRank).toBeUndefined();
        expect(result.myValue).toBe(0);
        expect(result.topValue).toBe(500);
      });
    });

    describe('getRankSuffix', () => {
      it('returns 1st for rank 1', () => {
        expect(leaderboardService.getRankSuffix(1)).toBe('1st');
      });

      it('returns 2nd for rank 2', () => {
        expect(leaderboardService.getRankSuffix(2)).toBe('2nd');
      });

      it('returns 3rd for rank 3', () => {
        expect(leaderboardService.getRankSuffix(3)).toBe('3rd');
      });

      it('returns 4th for rank 4', () => {
        expect(leaderboardService.getRankSuffix(4)).toBe('4th');
      });

      it('returns 11th for rank 11 (special case)', () => {
        expect(leaderboardService.getRankSuffix(11)).toBe('11th');
      });

      it('returns 12th for rank 12 (special case)', () => {
        expect(leaderboardService.getRankSuffix(12)).toBe('12th');
      });

      it('returns 13th for rank 13 (special case)', () => {
        expect(leaderboardService.getRankSuffix(13)).toBe('13th');
      });

      it('returns 21st for rank 21', () => {
        expect(leaderboardService.getRankSuffix(21)).toBe('21st');
      });

      it('returns 22nd for rank 22', () => {
        expect(leaderboardService.getRankSuffix(22)).toBe('22nd');
      });

      it('returns 23rd for rank 23', () => {
        expect(leaderboardService.getRankSuffix(23)).toBe('23rd');
      });

      it('returns 101st for rank 101', () => {
        expect(leaderboardService.getRankSuffix(101)).toBe('101st');
      });

      it('returns 111th for rank 111 (special case)', () => {
        expect(leaderboardService.getRankSuffix(111)).toBe('111th');
      });
    });

    describe('getRankTier', () => {
      it('returns Champion for rank 1', () => {
        expect(leaderboardService.getRankTier(1, 1000)).toBe('Champion');
      });

      it('returns Elite for ranks 2-3', () => {
        expect(leaderboardService.getRankTier(2, 1000)).toBe('Elite');
        expect(leaderboardService.getRankTier(3, 1000)).toBe('Elite');
      });

      it('returns Top 10 for ranks 4-10', () => {
        expect(leaderboardService.getRankTier(4, 1000)).toBe('Top 10');
        expect(leaderboardService.getRankTier(10, 1000)).toBe('Top 10');
      });

      it('returns Top 50 for ranks 11-50', () => {
        expect(leaderboardService.getRankTier(11, 1000)).toBe('Top 50');
        expect(leaderboardService.getRankTier(50, 1000)).toBe('Top 50');
      });

      it('returns Top 100 for ranks 51-100', () => {
        expect(leaderboardService.getRankTier(51, 1000)).toBe('Top 100');
        expect(leaderboardService.getRankTier(100, 1000)).toBe('Top 100');
      });

      it('returns percentage for ranks above 100', () => {
        expect(leaderboardService.getRankTier(150, 1000)).toBe('Top 15%');
        expect(leaderboardService.getRankTier(500, 1000)).toBe('Top 50%');
      });
    });

    describe('getRankColor', () => {
      it('returns gold for rank 1', () => {
        expect(leaderboardService.getRankColor(1)).toBe('#FFD700');
      });

      it('returns silver for rank 2', () => {
        expect(leaderboardService.getRankColor(2)).toBe('#C0C0C0');
      });

      it('returns bronze for rank 3', () => {
        expect(leaderboardService.getRankColor(3)).toBe('#CD7F32');
      });

      it('returns royal blue for ranks 4-10', () => {
        expect(leaderboardService.getRankColor(4)).toBe('#4169E1');
        expect(leaderboardService.getRankColor(10)).toBe('#4169E1');
      });

      it('returns lime green for ranks 11-50', () => {
        expect(leaderboardService.getRankColor(11)).toBe('#32CD32');
        expect(leaderboardService.getRankColor(50)).toBe('#32CD32');
      });

      it('returns gray for ranks above 50', () => {
        expect(leaderboardService.getRankColor(51)).toBe('#808080');
        expect(leaderboardService.getRankColor(100)).toBe('#808080');
        expect(leaderboardService.getRankColor(500)).toBe('#808080');
      });
    });

    describe('formatValue', () => {
      it('formats level type', () => {
        expect(leaderboardService.formatValue(50, 'level')).toBe('Level 50');
      });

      it('formats gold type with currency symbol', () => {
        expect(leaderboardService.formatValue(10000, 'gold')).toBe('$10,000');
      });

      it('formats reputation type', () => {
        expect(leaderboardService.formatValue(5000, 'reputation')).toBe('5,000 Rep');
      });

      it('formats combat type', () => {
        expect(leaderboardService.formatValue(100, 'combat')).toBe('100 Wins');
      });

      it('formats bounties type with currency symbol', () => {
        expect(leaderboardService.formatValue(25000, 'bounties')).toBe('$25,000 Bounty');
      });

      it('formats gangs type', () => {
        expect(leaderboardService.formatValue(50000, 'gangs')).toBe('50,000 Points');
      });

      it('formats unknown type as plain number', () => {
        expect(leaderboardService.formatValue(1234, 'unknown' as LeaderboardType)).toBe('1,234');
      });

      it('handles large numbers with commas', () => {
        expect(leaderboardService.formatValue(1000000, 'gold')).toBe('$1,000,000');
      });
    });

    describe('getRankChange', () => {
      it('calculates positive rank change (moved up)', () => {
        const oldLeaderboard = [
          createMockLeaderboardEntry({ rank: 1, characterId: 'c1' }),
          createMockLeaderboardEntry({ rank: 5, characterId: 'c2' }),
        ];
        const newLeaderboard = [
          createMockLeaderboardEntry({ rank: 1, characterId: 'c1' }),
          createMockLeaderboardEntry({ rank: 2, characterId: 'c2' }),
        ];

        const result = leaderboardService.getRankChange(oldLeaderboard, newLeaderboard, 'c2');

        expect(result.oldRank).toBe(5);
        expect(result.newRank).toBe(2);
        expect(result.change).toBe(3); // Moved up 3 positions
      });

      it('calculates negative rank change (moved down)', () => {
        const oldLeaderboard = [
          createMockLeaderboardEntry({ rank: 2, characterId: 'c1' }),
        ];
        const newLeaderboard = [
          createMockLeaderboardEntry({ rank: 5, characterId: 'c1' }),
        ];

        const result = leaderboardService.getRankChange(oldLeaderboard, newLeaderboard, 'c1');

        expect(result.change).toBe(-3); // Moved down 3 positions
      });

      it('handles no change in rank', () => {
        const oldLeaderboard = [
          createMockLeaderboardEntry({ rank: 3, characterId: 'c1' }),
        ];
        const newLeaderboard = [
          createMockLeaderboardEntry({ rank: 3, characterId: 'c1' }),
        ];

        const result = leaderboardService.getRankChange(oldLeaderboard, newLeaderboard, 'c1');

        expect(result.change).toBe(0);
      });

      it('handles character not in old leaderboard', () => {
        const oldLeaderboard: LeaderboardEntry[] = [];
        const newLeaderboard = [
          createMockLeaderboardEntry({ rank: 5, characterId: 'c1' }),
        ];

        const result = leaderboardService.getRankChange(oldLeaderboard, newLeaderboard, 'c1');

        expect(result.oldRank).toBeNull();
        expect(result.newRank).toBe(5);
        expect(result.change).toBe(0);
      });

      it('handles character not in new leaderboard', () => {
        const oldLeaderboard = [
          createMockLeaderboardEntry({ rank: 5, characterId: 'c1' }),
        ];
        const newLeaderboard: LeaderboardEntry[] = [];

        const result = leaderboardService.getRankChange(oldLeaderboard, newLeaderboard, 'c1');

        expect(result.oldRank).toBe(5);
        expect(result.newRank).toBeNull();
        expect(result.change).toBe(0);
      });
    });

    describe('getRangeDisplayName', () => {
      it('returns All Time for all', () => {
        expect(leaderboardService.getRangeDisplayName('all')).toBe('All Time');
      });

      it('returns This Month for monthly', () => {
        expect(leaderboardService.getRangeDisplayName('monthly')).toBe('This Month');
      });

      it('returns This Week for weekly', () => {
        expect(leaderboardService.getRangeDisplayName('weekly')).toBe('This Week');
      });

      it('returns Today for daily', () => {
        expect(leaderboardService.getRangeDisplayName('daily')).toBe('Today');
      });
    });

    describe('getTypeDisplayName', () => {
      it('returns Level Rankings for level', () => {
        expect(leaderboardService.getTypeDisplayName('level')).toBe('Level Rankings');
      });

      it('returns Wealth Rankings for gold', () => {
        expect(leaderboardService.getTypeDisplayName('gold')).toBe('Wealth Rankings');
      });

      it('returns Reputation Rankings for reputation', () => {
        expect(leaderboardService.getTypeDisplayName('reputation')).toBe('Reputation Rankings');
      });

      it('returns Combat Rankings for combat', () => {
        expect(leaderboardService.getTypeDisplayName('combat')).toBe('Combat Rankings');
      });

      it('returns Most Wanted for bounties', () => {
        expect(leaderboardService.getTypeDisplayName('bounties')).toBe('Most Wanted');
      });

      it('returns Gang Rankings for gangs', () => {
        expect(leaderboardService.getTypeDisplayName('gangs')).toBe('Gang Rankings');
      });
    });
  });
});
