/**
 * Combat Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { combatService } from '@/services/combat.service';
import apiClient from '@/services/api';
import { NPCType } from '@desperados/shared';

// Mock the API client
vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockNPC = {
  _id: 'npc1',
  name: 'Test Wolf',
  type: NPCType.WILDLIFE,
  level: 5,
  maxHP: 50,
  difficulty: 3,
  location: 'Desert',
  lootTable: {
    goldMin: 10,
    goldMax: 20,
    xpMin: 50,
    xpMax: 100,
    itemChance: 25,
    itemRarities: {
      common: 70,
      uncommon: 20,
      rare: 8,
      epic: 2,
      legendary: 0,
    },
  },
  isBoss: false,
};

const mockEncounter = {
  _id: 'encounter1',
  characterId: 'char1',
  npcId: 'npc1',
  npc: mockNPC,
  playerHP: 100,
  playerMaxHP: 100,
  npcHP: 50,
  npcMaxHP: 50,
  rounds: [],
  status: 'ACTIVE' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('CombatService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getNPCs', () => {
    it('fetches all NPCs successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { npcs: [mockNPC] },
        },
      };

      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await combatService.getNPCs();

      expect(apiClient.get).toHaveBeenCalledWith('/combat/npcs');
      expect(result.success).toBe(true);
      expect(result.data?.npcs).toHaveLength(1);
    });

    it('handles errors when fetching NPCs', async () => {
      (apiClient.get as any).mockRejectedValue(new Error('Network error'));

      const result = await combatService.getNPCs();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getNPCsByLocation', () => {
    it('fetches NPCs for specific location', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { npcs: [mockNPC] },
        },
      };

      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await combatService.getNPCsByLocation('desert');

      expect(apiClient.get).toHaveBeenCalledWith('/combat/npcs?location=desert');
      expect(result.success).toBe(true);
    });
  });

  describe('startCombat', () => {
    it('starts combat encounter successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { encounter: mockEncounter },
        },
      };

      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await combatService.startCombat('npc1', 'char1');

      expect(apiClient.post).toHaveBeenCalledWith('/combat/start', {
        npcId: 'npc1',
        characterId: 'char1',
      });
      expect(result.success).toBe(true);
      expect(result.data?.encounter).toBeDefined();
    });

    it('handles errors when starting combat', async () => {
      (apiClient.post as any).mockRejectedValue(new Error('Insufficient energy'));

      const result = await combatService.startCombat('npc1', 'char1');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('playTurn', () => {
    it('plays turn successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            result: {
              round: {},
              encounter: mockEncounter,
              playerWon: false,
              npcWon: false,
              combatEnded: false,
            },
          },
        },
      };

      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await combatService.playTurn('encounter1');

      expect(apiClient.post).toHaveBeenCalledWith('/combat/encounter1/turn');
      expect(result.success).toBe(true);
    });
  });

  describe('fleeCombat', () => {
    it('flees combat successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            result: {
              success: true,
              message: 'You fled from combat',
            },
          },
        },
      };

      (apiClient.post as any).mockResolvedValue(mockResponse);

      const result = await combatService.fleeCombat('encounter1');

      expect(apiClient.post).toHaveBeenCalledWith('/combat/encounter1/flee');
      expect(result.success).toBe(true);
    });
  });

  describe('getActiveCombat', () => {
    it('fetches active combat encounter', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { encounter: mockEncounter },
        },
      };

      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await combatService.getActiveCombat('char1');

      expect(apiClient.get).toHaveBeenCalledWith('/combat/active/char1');
      expect(result.success).toBe(true);
    });
  });

  describe('getCombatHistory', () => {
    it('fetches combat history with default limit', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { history: [] },
        },
      };

      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await combatService.getCombatHistory('char1');

      expect(apiClient.get).toHaveBeenCalledWith('/combat/history/char1?limit=10');
      expect(result.success).toBe(true);
    });

    it('fetches combat history with custom limit', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { history: [] },
        },
      };

      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await combatService.getCombatHistory('char1', 20);

      expect(apiClient.get).toHaveBeenCalledWith('/combat/history/char1?limit=20');
    });
  });

  describe('getCombatStats', () => {
    it('fetches combat stats successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            stats: {
              totalCombats: 10,
              victories: 7,
              defeats: 3,
              flees: 0,
              winRate: 70,
              totalDamageDealt: 500,
              totalDamageTaken: 300,
              totalXPGained: 1000,
              totalGoldGained: 200,
              totalGoldLost: 50,
            },
          },
        },
      };

      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await combatService.getCombatStats('char1');

      expect(apiClient.get).toHaveBeenCalledWith('/combat/stats/char1');
      expect(result.success).toBe(true);
      expect(result.data?.stats.winRate).toBe(70);
    });
  });
});
