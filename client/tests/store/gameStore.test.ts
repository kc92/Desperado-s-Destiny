/**
 * Game Store Tests
 * Tests for character management in game store
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '@/store/useGameStore';
import { characterService } from '@/services/character.service';
import { Faction } from '@desperados/shared';

// Mock character service
vi.mock('@/services/character.service', () => ({
  characterService: {
    getCharacters: vi.fn(),
    createCharacter: vi.fn(),
    selectCharacter: vi.fn(),
    deleteCharacter: vi.fn(),
    getCharacter: vi.fn(),
  },
}));

describe('GameStore', () => {
  beforeEach(() => {
    // Reset store state
    useGameStore.setState({
      characters: [],
      currentCharacter: null,
      isLoading: false,
      error: null,
      currentLocation: null,
      lastAction: null,
    });

    // Clear mocks
    vi.clearAllMocks();

    // Clear localStorage
    localStorage.clear();
  });

  describe('loadCharacters', () => {
    it('should load characters successfully', async () => {
      const mockCharacters = [
        {
          _id: '1',
          name: 'Test Character',
          faction: Faction.SETTLER_ALLIANCE,
          level: 1,
          experience: 0,
          experienceToNextLevel: 100,
          energy: 150,
          maxEnergy: 150,
          locationId: 'red-gulch',
          createdAt: new Date(),
        },
      ];

      vi.mocked(characterService.getCharacters).mockResolvedValue({
        success: true,
        data: { characters: mockCharacters },
      });

      await useGameStore.getState().loadCharacters();

      const state = useGameStore.getState();
      expect(state.characters).toEqual(mockCharacters);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle load error', async () => {
      vi.mocked(characterService.getCharacters).mockRejectedValue(
        new Error('Failed to load')
      );

      await useGameStore.getState().loadCharacters();

      const state = useGameStore.getState();
      expect(state.characters).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Failed to load');
    });
  });

  describe('createCharacter', () => {
    it('should create character and update state', async () => {
      const newCharacter = {
        _id: '1',
        name: 'New Character',
        faction: Faction.NAHI_COALITION,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        energy: 150,
        maxEnergy: 150,
        locationId: 'sacred-springs',
        createdAt: new Date(),
      };

      vi.mocked(characterService.createCharacter).mockResolvedValue({
        success: true,
        data: { character: newCharacter },
      });

      await useGameStore.getState().createCharacter({
        name: 'New Character',
        faction: Faction.NAHI_COALITION,
      });

      const state = useGameStore.getState();
      expect(state.characters).toHaveLength(1);
      expect(state.characters[0]).toEqual(newCharacter);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle create error', async () => {
      vi.mocked(characterService.createCharacter).mockRejectedValue(
        new Error('Failed to create')
      );

      await expect(
        useGameStore.getState().createCharacter({
          name: 'Test',
          faction: Faction.FRONTERA,
        })
      ).rejects.toThrow('Failed to create');

      const state = useGameStore.getState();
      expect(state.characters).toHaveLength(0);
      expect(state.error).toBe('Failed to create');
    });
  });

  describe('selectCharacter', () => {
    it('should select character and store in localStorage', async () => {
      const character = {
        _id: '1',
        name: 'Selected',
        faction: Faction.SETTLER_ALLIANCE,
        level: 5,
        experience: 250,
        experienceToNextLevel: 500,
        energy: 100,
        maxEnergy: 150,
        locationId: 'red-gulch',
        createdAt: new Date(),
      };

      vi.mocked(characterService.selectCharacter).mockResolvedValue({
        success: true,
        data: { character },
      });

      await useGameStore.getState().selectCharacter('1');

      const state = useGameStore.getState();
      expect(state.currentCharacter).toEqual(character);
      expect(state.currentLocation).toBe('red-gulch');
      expect(localStorage.getItem('selectedCharacterId')).toBe('1');
    });
  });

  describe('deleteCharacter', () => {
    it('should delete character from array', async () => {
      // Setup initial state with characters
      useGameStore.setState({
        characters: [
          {
            _id: '1',
            name: 'Keep',
            faction: Faction.SETTLER_ALLIANCE,
            level: 1,
            experience: 0,
            experienceToNextLevel: 100,
            energy: 150,
            maxEnergy: 150,
            locationId: 'red-gulch',
            createdAt: new Date(),
          },
          {
            _id: '2',
            name: 'Delete',
            faction: Faction.NAHI_COALITION,
            level: 1,
            experience: 0,
            experienceToNextLevel: 100,
            energy: 150,
            maxEnergy: 150,
            locationId: 'sacred-springs',
            createdAt: new Date(),
          },
        ],
      });

      vi.mocked(characterService.deleteCharacter).mockResolvedValue({
        success: true,
      });

      await useGameStore.getState().deleteCharacter('2');

      const state = useGameStore.getState();
      expect(state.characters).toHaveLength(1);
      expect(state.characters[0]._id).toBe('1');
    });

    it('should clear currentCharacter if deleted', async () => {
      const character = {
        _id: '1',
        name: 'Delete Me',
        faction: Faction.FRONTERA,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        energy: 150,
        maxEnergy: 150,
        locationId: 'villa-esperanza',
        createdAt: new Date(),
      };

      useGameStore.setState({
        characters: [character],
        currentCharacter: character,
      });

      localStorage.setItem('selectedCharacterId', '1');

      vi.mocked(characterService.deleteCharacter).mockResolvedValue({
        success: true,
      });

      await useGameStore.getState().deleteCharacter('1');

      const state = useGameStore.getState();
      expect(state.currentCharacter).toBe(null);
      expect(localStorage.getItem('selectedCharacterId')).toBe(null);
    });
  });

  describe('computed properties', () => {
    it('hasCharacters should return true when characters exist', () => {
      useGameStore.setState({
        characters: [
          {
            _id: '1',
            name: 'Test',
            faction: Faction.SETTLER_ALLIANCE,
            level: 1,
            experience: 0,
            experienceToNextLevel: 100,
            energy: 150,
            maxEnergy: 150,
            locationId: 'red-gulch',
            createdAt: new Date(),
          },
        ],
      });

      expect(useGameStore.getState().hasCharacters()).toBe(true);
    });

    it('hasCharacters should return false when no characters', () => {
      expect(useGameStore.getState().hasCharacters()).toBe(false);
    });

    it('canCreateCharacter should return true when less than 3 characters', () => {
      useGameStore.setState({
        characters: [
          {
            _id: '1',
            name: 'Test',
            faction: Faction.SETTLER_ALLIANCE,
            level: 1,
            experience: 0,
            experienceToNextLevel: 100,
            energy: 150,
            maxEnergy: 150,
            locationId: 'red-gulch',
            createdAt: new Date(),
          },
        ],
      });

      expect(useGameStore.getState().canCreateCharacter()).toBe(true);
    });

    it('canCreateCharacter should return false when 3 characters', () => {
      const mockChar = {
        _id: '1',
        name: 'Test',
        faction: Faction.SETTLER_ALLIANCE,
        level: 1,
        experience: 0,
        experienceToNextLevel: 100,
        energy: 150,
        maxEnergy: 150,
        locationId: 'red-gulch',
        createdAt: new Date(),
      };

      useGameStore.setState({
        characters: [
          mockChar,
          { ...mockChar, _id: '2', name: 'Test2' },
          { ...mockChar, _id: '3', name: 'Test3' },
        ],
      });

      expect(useGameStore.getState().canCreateCharacter()).toBe(false);
    });
  });

  describe('clearGameState', () => {
    it('should clear all state and localStorage', () => {
      useGameStore.setState({
        characters: [
          {
            _id: '1',
            name: 'Test',
            faction: Faction.SETTLER_ALLIANCE,
            level: 1,
            experience: 0,
            experienceToNextLevel: 100,
            energy: 150,
            maxEnergy: 150,
            locationId: 'red-gulch',
            createdAt: new Date(),
          },
        ],
        currentCharacter: {
          _id: '1',
          name: 'Test',
          faction: Faction.SETTLER_ALLIANCE,
          level: 1,
          experience: 0,
          experienceToNextLevel: 100,
          energy: 150,
          maxEnergy: 150,
          locationId: 'red-gulch',
          createdAt: new Date(),
        },
        error: 'Some error',
      });

      localStorage.setItem('selectedCharacterId', '1');

      useGameStore.getState().clearGameState();

      const state = useGameStore.getState();
      expect(state.characters).toEqual([]);
      expect(state.currentCharacter).toBe(null);
      expect(state.error).toBe(null);
      expect(localStorage.getItem('selectedCharacterId')).toBe(null);
    });
  });
});
