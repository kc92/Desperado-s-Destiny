/**
 * Character Service
 * API client for character-related endpoints
 */

import apiClient from './api';
import type { ApiResponse } from '@/types';
import type { SafeCharacter, CharacterCreation } from '@desperados/shared';

/**
 * Character service for API calls
 */
export const characterService = {
  /**
   * Create a new character
   */
  createCharacter: async (data: CharacterCreation) => {
    const response = await apiClient.post<ApiResponse<{ character: SafeCharacter }>>(
      '/characters',
      data
    );
    return response.data;
  },

  /**
   * Get all characters for the authenticated user
   */
  getCharacters: async () => {
    const response = await apiClient.get<ApiResponse<{ characters: SafeCharacter[] }>>(
      '/characters'
    );
    return response.data;
  },

  /**
   * Get a specific character by ID
   */
  getCharacter: async (id: string) => {
    const response = await apiClient.get<ApiResponse<{ character: SafeCharacter }>>(
      `/characters/${id}`
    );
    return response.data;
  },

  /**
   * Delete a character
   */
  deleteCharacter: async (id: string) => {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/characters/${id}`
    );
    return response.data;
  },

  /**
   * Select a character as the active character
   */
  selectCharacter: async (id: string) => {
    const response = await apiClient.patch<ApiResponse<{ character: SafeCharacter }>>(
      `/characters/${id}/select`
    );
    return response.data;
  },
};

export default characterService;
