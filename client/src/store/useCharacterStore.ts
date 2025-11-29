/**
 * Character Store
 * Manages character state and operations
 */

import { create } from 'zustand';
import type { SafeCharacter, CharacterCreation } from '@desperados/shared';
import { characterService } from '@/services/character.service';
import { useEnergyStore } from './useEnergyStore';

interface CharacterStore {
  // State
  characters: SafeCharacter[];
  currentCharacter: SafeCharacter | null;
  currentLocation: string | null;
  isLoading: boolean;
  error: string | null;
  lastAction: string | null;

  // Actions
  loadCharacters: () => Promise<void>;
  createCharacter: (data: CharacterCreation) => Promise<SafeCharacter>;
  selectCharacter: (id: string) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  loadSelectedCharacter: () => Promise<void>;
  updateCharacter: (updates: Partial<SafeCharacter>) => void;
  setLocation: (location: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setLastAction: (action: string | null) => void;
  clearCharacterState: () => void;
  refreshCharacter: () => Promise<void>;

  // Computed
  hasCharacters: () => boolean;
  canCreateCharacter: () => boolean;
}

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  // Initial state
  characters: [],
  currentCharacter: null,
  currentLocation: null,
  isLoading: false,
  error: null,
  lastAction: null,

  loadCharacters: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await characterService.getCharacters();

      if (response.success && response.data) {
        set({
          characters: response.data.characters,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.error || 'Failed to load characters');
      }
    } catch (error: any) {
      console.error('Failed to load characters:', error);
      set({
        characters: [],
        isLoading: false,
        error: error.message || 'Failed to load characters',
      });
    }
  },

  createCharacter: async (data: CharacterCreation) => {
    set({ isLoading: true, error: null });

    try {
      const response = await characterService.createCharacter(data);

      if (response.success && response.data) {
        const newCharacter = response.data.character;

        set((state) => ({
          characters: [...state.characters, newCharacter],
          isLoading: false,
          error: null,
        }));

        return newCharacter;
      } else {
        throw new Error(response.error || 'Failed to create character');
      }
    } catch (error: any) {
      console.error('Failed to create character:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to create character',
      });
      throw error;
    }
  },

  selectCharacter: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await characterService.selectCharacter(id);

      if (response.success && response.data) {
        const character = response.data.character;

        set({
          currentCharacter: character,
          currentLocation: character.locationId,
          isLoading: false,
          error: null,
        });

        // Initialize energy store with character's energy data
        useEnergyStore.getState().initializeEnergy(
          character.energy,
          character.maxEnergy || 100,
          character.isPremium ? 15 : 10,
          character.isPremium || false
        );

        localStorage.setItem('selectedCharacterId', id);
      } else {
        throw new Error(response.error || 'Failed to select character');
      }
    } catch (error: any) {
      console.error('Failed to select character:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to select character',
      });
      throw error;
    }
  },

  deleteCharacter: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await characterService.deleteCharacter(id);

      if (response.success) {
        set((state) => ({
          characters: state.characters.filter((char) => char._id !== id),
          currentCharacter: state.currentCharacter?._id === id ? null : state.currentCharacter,
          isLoading: false,
          error: null,
        }));

        if (localStorage.getItem('selectedCharacterId') === id) {
          localStorage.removeItem('selectedCharacterId');
        }
      } else {
        throw new Error(response.error || 'Failed to delete character');
      }
    } catch (error: any) {
      console.error('Failed to delete character:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to delete character',
      });
      throw error;
    }
  },

  loadSelectedCharacter: async () => {
    const id = localStorage.getItem('selectedCharacterId');

    if (!id) {
      set({ isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      const response = await characterService.getCharacter(id);

      if (response.success && response.data) {
        const character = response.data.character;

        set({
          currentCharacter: character,
          currentLocation: character.locationId,
          isLoading: false,
        });

        // Initialize energy store with character's energy data
        useEnergyStore.getState().initializeEnergy(
          character.energy,
          character.maxEnergy || 100,
          character.isPremium ? 15 : 10,
          character.isPremium || false
        );
      } else {
        localStorage.removeItem('selectedCharacterId');
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load selected character:', error);
      localStorage.removeItem('selectedCharacterId');
      set({ isLoading: false });
    }
  },

  updateCharacter: (updates: Partial<SafeCharacter>) => {
    set((state) => {
      if (!state.currentCharacter) return state;

      const previousLevel = state.currentCharacter.level;
      const updatedCharacter = { ...state.currentCharacter, ...updates };
      const newLevel = updatedCharacter.level;

      // Check if character leveled up
      if (newLevel && previousLevel && newLevel > previousLevel) {
        // Trigger level up sound (via custom event)
        window.dispatchEvent(new CustomEvent('character-level-up', {
          detail: { from: previousLevel, to: newLevel }
        }));
      }

      return {
        currentCharacter: updatedCharacter,
        characters: state.characters.map((char) =>
          char._id === updatedCharacter._id ? updatedCharacter : char
        ),
      };
    });
  },

  setLocation: (location: string) => {
    set({ currentLocation: location });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  setLastAction: (action: string | null) => {
    set({ lastAction: action });
  },

  clearCharacterState: () => {
    set({
      characters: [],
      currentCharacter: null,
      currentLocation: null,
      isLoading: false,
      error: null,
      lastAction: null,
    });
    localStorage.removeItem('selectedCharacterId');
  },

  refreshCharacter: async () => {
    const { currentCharacter } = get();

    if (!currentCharacter) return;

    try {
      const response = await characterService.getCharacter(currentCharacter._id);

      if (response.success && response.data) {
        set({
          currentCharacter: response.data.character,
          currentLocation: response.data.character.locationId,
        });
      }
    } catch (error) {
      console.error('Failed to refresh character:', error);
    }
  },

  hasCharacters: () => {
    return get().characters.length > 0;
  },

  canCreateCharacter: () => {
    return get().characters.length < 3;
  },
}));

export default useCharacterStore;
