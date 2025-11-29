/**
 * Action Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { actionService } from '@/services/action.service';
import apiClient from '@/services/api';
import { ActionType, Suit, Rank, HandRank } from '@desperados/shared';

// Mock the API client
vi.mock('@/services/api');

describe('actionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getActions', () => {
    it('fetches all actions without filters', async () => {
      const mockActions = [
        {
          _id: 'action-1',
          name: 'Test Action',
          type: ActionType.CRIME,
          energyCost: 20,
          difficulty: 5,
          targetScore: 300,
          rewards: { xp: 100 },
        },
      ];

      (apiClient.get as any).mockResolvedValue({
        data: {
          success: true,
          data: { actions: mockActions },
        },
      });

      const result = await actionService.getActions();

      expect(apiClient.get).toHaveBeenCalledWith('/actions');
      expect(result.success).toBe(true);
      expect(result.data?.actions).toEqual(mockActions);
    });

    it('fetches actions with filters', async () => {
      (apiClient.get as any).mockResolvedValue({
        data: {
          success: true,
          data: { actions: [] },
        },
      });

      await actionService.getActions({
        type: ActionType.COMBAT,
        locationId: 'location-1',
        minLevel: 5,
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('type=COMBAT')
      );
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('locationId=location-1')
      );
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('minLevel=5')
      );
    });

    it('handles errors gracefully', async () => {
      (apiClient.get as any).mockRejectedValue(new Error('Network error'));

      const result = await actionService.getActions();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });
  });

  describe('getAction', () => {
    it('fetches a specific action by ID', async () => {
      const mockAction = {
        _id: 'action-1',
        name: 'Test Action',
        type: ActionType.CRIME,
      };

      (apiClient.get as any).mockResolvedValue({
        data: {
          success: true,
          data: { action: mockAction },
        },
      });

      const result = await actionService.getAction('action-1');

      expect(apiClient.get).toHaveBeenCalledWith('/actions/action-1');
      expect(result.success).toBe(true);
      expect(result.data?.action).toEqual(mockAction);
    });

    it('handles not found errors', async () => {
      (apiClient.get as any).mockRejectedValue(new Error('Not found'));

      const result = await actionService.getAction('invalid-id');

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('attemptChallenge', () => {
    it('attempts an action challenge', async () => {
      const mockResult = {
        result: {
          action: { _id: 'action-1', name: 'Test Action' },
          characterId: 'char-1',
          hand: [
            { suit: Suit.SPADES, rank: Rank.ACE },
            { suit: Suit.HEARTS, rank: Rank.KING },
            { suit: Suit.CLUBS, rank: Rank.QUEEN },
            { suit: Suit.DIAMONDS, rank: Rank.JACK },
            { suit: Suit.SPADES, rank: Rank.TEN },
          ],
          handEvaluation: {
            rank: HandRank.HIGH_CARD,
            score: 300,
            description: 'High Card',
            primaryCards: [],
            kickers: [],
          },
          suitBonuses: [],
          totalScore: 300,
          success: true,
          margin: 50,
          energySpent: 20,
          timestamp: new Date(),
        },
      };

      (apiClient.post as any).mockResolvedValue({
        data: {
          success: true,
          data: mockResult,
        },
      });

      const result = await actionService.attemptChallenge('action-1', 'char-1');

      expect(apiClient.post).toHaveBeenCalledWith('/actions/challenge', {
        actionId: 'action-1',
        characterId: 'char-1',
      });
      expect(result.success).toBe(true);
      expect(result.data?.result.success).toBe(true);
    });

    it('handles challenge failures', async () => {
      const mockResult = {
        result: {
          action: { _id: 'action-1', name: 'Test Action' },
          characterId: 'char-1',
          hand: [],
          handEvaluation: {
            rank: HandRank.HIGH_CARD,
            score: 200,
            description: 'High Card',
            primaryCards: [],
            kickers: [],
          },
          suitBonuses: [],
          totalScore: 200,
          success: false,
          margin: -100,
          energySpent: 20,
          timestamp: new Date(),
        },
      };

      (apiClient.post as any).mockResolvedValue({
        data: {
          success: true,
          data: mockResult,
        },
      });

      const result = await actionService.attemptChallenge('action-1', 'char-1');

      expect(result.success).toBe(true);
      expect(result.data?.result.success).toBe(false);
    });

    it('handles API errors', async () => {
      (apiClient.post as any).mockRejectedValue(
        new Error('Insufficient energy')
      );

      const result = await actionService.attemptChallenge('action-1', 'char-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient energy');
    });
  });

  describe('getActionHistory', () => {
    it('fetches action history for a character', async () => {
      const mockHistory = [
        {
          _id: 'result-1',
          action: { _id: 'action-1', name: 'Test Action' },
          characterId: 'char-1',
          success: true,
          totalScore: 350,
        },
      ];

      (apiClient.get as any).mockResolvedValue({
        data: {
          success: true,
          data: { history: mockHistory, total: 1 },
        },
      });

      const result = await actionService.getActionHistory('char-1');

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('characterId=char-1')
      );
      expect(result.success).toBe(true);
      expect(result.data?.history).toEqual(mockHistory);
    });

    it('fetches action history with filters', async () => {
      (apiClient.get as any).mockResolvedValue({
        data: {
          success: true,
          data: { history: [], total: 0 },
        },
      });

      await actionService.getActionHistory('char-1', {
        actionType: ActionType.CRIME,
        success: true,
        limit: 10,
        skip: 0,
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('actionType=CRIME')
      );
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('success=true')
      );
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=10')
      );
    });

    it('handles errors when fetching history', async () => {
      (apiClient.get as any).mockRejectedValue(new Error('Server error'));

      const result = await actionService.getActionHistory('char-1');

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
});
