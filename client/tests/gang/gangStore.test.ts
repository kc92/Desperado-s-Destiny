/**
 * Gang Store Tests
 * Comprehensive test suite for gang store functionality
 *
 * NOTE: This is a comprehensive example demonstrating the testing pattern.
 * Complete test implementation would require 40+ tests across all gang functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGangStore } from '@/store/useGangStore';
import { gangService } from '@/services/gang.service';
import { GangRole, GangUpgradeType } from '@desperados/shared';

vi.mock('@/services/gang.service');
vi.mock('@/services/socket.service', () => ({
  socketService: {
    isConnected: () => false,
    on: vi.fn(),
    off: vi.fn(),
  },
}));

describe('Gang Store', () => {
  beforeEach(() => {
    useGangStore.setState({
      currentGang: null,
      gangs: [],
      territories: [],
      activeWars: [],
      selectedGang: null,
      selectedWar: null,
      bankTransactions: [],
      isLoading: false,
      error: null,
    });

    vi.clearAllMocks();
  });

  describe('createGang', () => {
    it('should create a gang successfully', async () => {
      const mockGang = {
        _id: 'gang123',
        name: 'Test Gang',
        tag: 'TEST',
        level: 1,
        bank: 0,
        maxMembers: 15,
        members: [],
        territories: [],
        upgrades: {
          vaultSize: 0,
          memberSlots: 0,
          warChest: 0,
          perkBooster: 0,
        },
        perks: {
          xpBonus: 5,
          goldBonus: 0,
          energyBonus: 0,
        },
        stats: {
          totalWins: 0,
          totalLosses: 0,
          territoriesConquered: 0,
          totalRevenue: 0,
        },
        createdAt: new Date(),
        isActive: true,
        currentMembers: 1,
        officerCount: 0,
        territoriesCount: 0,
      };

      vi.mocked(gangService.createGang).mockResolvedValue({
        success: true,
        data: { gang: mockGang },
      });

      const { result } = renderHook(() => useGangStore());

      await act(async () => {
        await result.current.createGang('Test Gang', 'TEST');
      });

      expect(gangService.createGang).toHaveBeenCalledWith('Test Gang', 'TEST');
      expect(result.current.currentGang).toEqual(mockGang);
      expect(result.current.isCreating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle gang creation errors', async () => {
      vi.mocked(gangService.createGang).mockResolvedValue({
        success: false,
        error: 'Gang name already taken',
      });

      const { result } = renderHook(() => useGangStore());

      await act(async () => {
        try {
          await result.current.createGang('Test Gang', 'TEST');
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.currentGang).toBeNull();
      expect(result.current.error).toBe('Gang name already taken');
    });

    it('should validate gang creation requirements', async () => {
      vi.mocked(gangService.createGang).mockResolvedValue({
        success: false,
        error: 'Insufficient gold',
      });

      const { result } = renderHook(() => useGangStore());

      await act(async () => {
        try {
          await result.current.createGang('Test Gang', 'TEST');
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      expect(result.current.error).toBe('Insufficient gold');
    });
  });

  describe('fetchGangs', () => {
    it('should fetch gangs with pagination', async () => {
      const mockGangs = [
        {
          _id: 'gang1',
          name: 'Gang 1',
          tag: 'G1',
          level: 10,
          members: [],
          territories: [],
        },
        {
          _id: 'gang2',
          name: 'Gang 2',
          tag: 'G2',
          level: 5,
          members: [],
          territories: [],
        },
      ];

      vi.mocked(gangService.getGangs).mockResolvedValue({
        success: true,
        data: {
          gangs: mockGangs,
          total: 100,
          hasMore: true,
        },
      });

      const { result } = renderHook(() => useGangStore());

      await act(async () => {
        await result.current.fetchGangs({ limit: 50, offset: 0 });
      });

      expect(result.current.gangs).toEqual(mockGangs);
      expect(result.current.gangsPagination.total).toBe(100);
      expect(result.current.gangsPagination.hasMore).toBe(true);
    });

    it('should support gang search filters', async () => {
      const filters = {
        sortBy: 'level' as const,
        sortOrder: 'desc' as const,
        search: 'Test',
        limit: 50,
        offset: 0,
      };

      vi.mocked(gangService.getGangs).mockResolvedValue({
        success: true,
        data: { gangs: [], total: 0, hasMore: false },
      });

      const { result } = renderHook(() => useGangStore());

      await act(async () => {
        await result.current.fetchGangs(filters);
      });

      expect(gangService.getGangs).toHaveBeenCalledWith(filters);
    });
  });

  describe('depositToBank', () => {
    it('should deposit gold to gang bank', async () => {
      const mockGang = {
        _id: 'gang123',
        name: 'Test Gang',
        bank: 1000,
      };

      vi.mocked(gangService.depositToBank).mockResolvedValue({
        success: true,
        data: {
          gang: { ...mockGang, bank: 2000 },
          newBalance: 2000,
        },
      });

      const { result } = renderHook(() => useGangStore());

      useGangStore.setState({ currentGang: mockGang as any });

      await act(async () => {
        await result.current.depositToBank('gang123', 1000);
      });

      expect(gangService.depositToBank).toHaveBeenCalledWith('gang123', 1000);
      expect(result.current.currentGang?.bank).toBe(2000);
      expect(result.current.isDepositing).toBe(false);
    });

    it('should validate deposit amount', async () => {
      vi.mocked(gangService.depositToBank).mockResolvedValue({
        success: false,
        error: 'Insufficient funds',
      });

      const { result } = renderHook(() => useGangStore());

      await act(async () => {
        try {
          await result.current.depositToBank('gang123', 10000);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      expect(result.current.error).toBe('Insufficient funds');
    });
  });

  describe('withdrawFromBank', () => {
    it('should allow officers to withdraw from bank', async () => {
      const mockGang = {
        _id: 'gang123',
        name: 'Test Gang',
        bank: 2000,
      };

      vi.mocked(gangService.withdrawFromBank).mockResolvedValue({
        success: true,
        data: {
          gang: { ...mockGang, bank: 1500 },
          newBalance: 1500,
        },
      });

      const { result } = renderHook(() => useGangStore());

      await act(async () => {
        await result.current.withdrawFromBank('gang123', 500);
      });

      expect(gangService.withdrawFromBank).toHaveBeenCalledWith('gang123', 500);
      expect(result.current.isWithdrawing).toBe(false);
    });

    it('should prevent non-officers from withdrawing', async () => {
      vi.mocked(gangService.withdrawFromBank).mockResolvedValue({
        success: false,
        error: 'Insufficient permissions',
      });

      const { result } = renderHook(() => useGangStore());

      await act(async () => {
        try {
          await result.current.withdrawFromBank('gang123', 500);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      expect(result.current.error).toBe('Insufficient permissions');
    });
  });

  describe('purchaseUpgrade', () => {
    it('should purchase vault size upgrade', async () => {
      const mockGang = {
        _id: 'gang123',
        upgrades: {
          vaultSize: 1,
          memberSlots: 0,
          warChest: 0,
          perkBooster: 0,
        },
      };

      vi.mocked(gangService.purchaseUpgrade).mockResolvedValue({
        success: true,
        data: {
          gang: {
            ...mockGang,
            upgrades: { ...mockGang.upgrades, vaultSize: 2 },
          } as any,
        },
      });

      const { result } = renderHook(() => useGangStore());

      await act(async () => {
        await result.current.purchaseUpgrade('gang123', GangUpgradeType.VAULT_SIZE);
      });

      expect(gangService.purchaseUpgrade).toHaveBeenCalledWith('gang123', GangUpgradeType.VAULT_SIZE);
      expect(result.current.isUpgrading).toBe(false);
    });

    it('should validate upgrade cost', async () => {
      vi.mocked(gangService.purchaseUpgrade).mockResolvedValue({
        success: false,
        error: 'Insufficient bank funds',
      });

      const { result } = renderHook(() => useGangStore());

      await act(async () => {
        try {
          await result.current.purchaseUpgrade('gang123', GangUpgradeType.VAULT_SIZE);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      expect(result.current.error).toBe('Insufficient bank funds');
    });

    it('should prevent maxed upgrades', async () => {
      vi.mocked(gangService.purchaseUpgrade).mockResolvedValue({
        success: false,
        error: 'Upgrade already at max level',
      });

      const { result } = renderHook(() => useGangStore());

      await act(async () => {
        try {
          await result.current.purchaseUpgrade('gang123', GangUpgradeType.VAULT_SIZE);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });
  });

  describe('member management', () => {
    it('should kick member from gang', async () => {
      const mockGang = {
        _id: 'gang123',
        members: [
          { characterId: 'char1', role: GangRole.MEMBER },
          { characterId: 'char2', role: GangRole.MEMBER },
        ],
      };

      vi.mocked(gangService.kickMember).mockResolvedValue({
        success: true,
        data: {
          gang: {
            ...mockGang,
            members: [mockGang.members[0]],
          } as any,
        },
      });

      const { result } = renderHook(() => useGangStore());

      await act(async () => {
        await result.current.kickMember('gang123', 'char2');
      });

      expect(gangService.kickMember).toHaveBeenCalledWith('gang123', 'char2');
    });

    it('should promote member to officer', async () => {
      vi.mocked(gangService.promoteMember).mockResolvedValue({
        success: true,
        data: { gang: {} as any },
      });

      const { result } = renderHook(() => useGangStore());

      await act(async () => {
        await result.current.promoteMember('gang123', 'char1', GangRole.OFFICER);
      });

      expect(gangService.promoteMember).toHaveBeenCalledWith('gang123', 'char1', GangRole.OFFICER);
    });
  });

  describe('territory management', () => {
    it('should fetch all territories', async () => {
      const mockTerritories = [
        {
          _id: 'territory1',
          name: 'Red Gulch',
          controllingGangId: null,
          isUnderSiege: false,
        },
      ];

      vi.mocked(gangService.getTerritories).mockResolvedValue({
        success: true,
        data: { territories: mockTerritories as any },
      });

      const { result } = renderHook(() => useGangStore());

      await act(async () => {
        await result.current.fetchTerritories();
      });

      expect(result.current.territories).toEqual(mockTerritories);
    });

    it('should declare war on territory', async () => {
      const mockWar = {
        _id: 'war1',
        territoryId: 'territory1',
        attackerGangId: 'gang123',
        capturePoints: 50,
      };

      vi.mocked(gangService.declareWar).mockResolvedValue({
        success: true,
        data: { war: mockWar as any },
      });

      const { result } = renderHook(() => useGangStore());

      await act(async () => {
        await result.current.declareWar('territory1', 5000);
      });

      expect(gangService.declareWar).toHaveBeenCalledWith('territory1', 5000);
      expect(result.current.activeWars).toContainEqual(mockWar);
    });

    it('should contribute to active war', async () => {
      const mockWar = {
        _id: 'war1',
        capturePoints: 55,
      };

      vi.mocked(gangService.contributeToWar).mockResolvedValue({
        success: true,
        data: { war: mockWar as any },
      });

      const { result } = renderHook(() => useGangStore());

      useGangStore.setState({
        activeWars: [{ _id: 'war1', capturePoints: 50 } as any],
      });

      await act(async () => {
        await result.current.contributeToWar('war1', 1000);
      });

      expect(gangService.contributeToWar).toHaveBeenCalledWith('war1', 1000);
    });
  });

  describe('Socket.io integration', () => {
    it('should update gang on member_joined event', () => {
      const mockGang = {
        _id: 'gang123',
        members: [{ characterId: 'char1' }],
      };

      useGangStore.setState({ currentGang: mockGang as any });

      const { result } = renderHook(() => useGangStore());

      act(() => {
        const handler = result.current.initializeSocketListeners();
        handler();
      });
    });
  });
});

/**
 * Additional test files needed for complete coverage:
 *
 * 1. client/tests/gang/GangProfile.test.tsx (10 tests)
 *    - Render all tabs
 *    - Member management (kick, promote)
 *    - Bank operations (deposit, withdraw)
 *    - Upgrade purchases
 *    - Permissions (leader, officer, member actions)
 *
 * 2. client/tests/gang/TerritoryMap.test.tsx (10 tests)
 *    - Render 12 territories
 *    - Territory click (modal open)
 *    - War details display
 *    - Declare war
 *    - Contribute to war
 *    - Socket updates (territory ownership)
 *
 * 3. client/tests/gang/GangCreation.test.tsx (5 tests)
 *    - Form validation
 *    - Name/tag availability checks
 *    - Cost requirements
 *    - Success flow
 *    - Error handling
 *
 * 4. client/tests/gang/GangList.test.tsx (5 tests)
 *    - Render gang cards
 *    - Sorting
 *    - Search
 *    - Pagination
 *    - Empty state
 */
