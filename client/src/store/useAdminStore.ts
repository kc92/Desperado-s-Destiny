/**
 * Admin Store
 * Manages admin operations state using Zustand
 */

import { create } from 'zustand';
import api from '@/services/api';

// Types
export interface AdminUser {
  _id: string;
  email: string;
  emailVerified: boolean;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AdminCharacter {
  _id: string;
  name: string;
  level: number;
  gold: number;
  faction: string;
  userId?: {
    email: string;
  };
}

export interface AdminGang {
  _id: string;
  name: string;
  tag: string;
  bankBalance: number;
  leaderId?: {
    name: string;
  };
}

export interface AdminAnalytics {
  users: {
    total: number;
    active: number;
    inactive: number;
    newThisWeek: number;
  };
  characters: {
    total: number;
    levelDistribution: Array<{ _id: number; count: number }>;
  };
  gangs: {
    total: number;
  };
  economy: {
    totalGoldInCirculation: number;
    averageGoldPerCharacter: number;
    totalTransactions: number;
    transactionVolume24h: number;
  };
}

export interface ServerHealth {
  server: {
    uptime: number;
    uptimeFormatted: string;
    nodeVersion: string;
    platform: string;
  };
  memory: {
    used: number;
    total: number;
    rss: number;
    system: {
      total: number;
      free: number;
      usagePercent: number;
    };
  };
  cpu: {
    count: number;
    loadAverage: number[];
  };
  database: {
    status: string;
    connected: boolean;
  };
}

interface AdminStore {
  // State
  users: AdminUser[];
  characters: AdminCharacter[];
  gangs: AdminGang[];
  analytics: AdminAnalytics | null;
  serverHealth: ServerHealth | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUsers: (params?: { search?: string; role?: string; isActive?: boolean; page?: number; limit?: number }) => Promise<void>;
  fetchUserDetails: (userId: string) => Promise<any>;
  banUser: (userId: string, reason?: string) => Promise<void>;
  unbanUser: (userId: string) => Promise<void>;

  fetchCharacters: (params?: { search?: string; faction?: string; minLevel?: number; maxLevel?: number; page?: number; limit?: number }) => Promise<void>;
  updateCharacter: (characterId: string, updates: any) => Promise<void>;
  deleteCharacter: (characterId: string) => Promise<void>;

  adjustGold: (characterId: string, amount: number, reason?: string) => Promise<void>;

  fetchAnalytics: () => Promise<void>;

  fetchGangs: (params?: { page?: number; limit?: number }) => Promise<void>;
  disbandGang: (gangId: string) => Promise<void>;

  fetchServerHealth: () => Promise<void>;

  clearError: () => void;
}

/**
 * Zustand store for admin operations
 */
export const useAdminStore = create<AdminStore>()((set, get) => ({
  // Initial state
  users: [],
  characters: [],
  gangs: [],
  analytics: null,
  serverHealth: null,
  isLoading: false,
  error: null,

  /**
   * Fetch users with optional filtering
   */
  fetchUsers: async (params = {}) => {
    set({ isLoading: true, error: null });

    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.role) queryParams.append('role', params.role);
      if (params.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
      if (params.page) queryParams.append('page', String(params.page));
      if (params.limit) queryParams.append('limit', String(params.limit));

      const response = await api.get(`/admin/users?${queryParams.toString()}`);

      set({
        users: response.data.users,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch users',
        isLoading: false
      });
      throw error;
    }
  },

  /**
   * Fetch detailed user information
   */
  fetchUserDetails: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get(`/admin/users/${userId}`);
      set({ isLoading: false });
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch user details',
        isLoading: false
      });
      throw error;
    }
  },

  /**
   * Ban a user
   */
  banUser: async (userId: string, reason?: string) => {
    set({ isLoading: true, error: null });

    try {
      await api.post(`/admin/users/${userId}/ban`, { reason });

      // Update local state
      set((state) => ({
        users: state.users.map(user =>
          user._id === userId ? { ...user, isActive: false } : user
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to ban user',
        isLoading: false
      });
      throw error;
    }
  },

  /**
   * Unban a user
   */
  unbanUser: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      await api.post(`/admin/users/${userId}/unban`);

      // Update local state
      set((state) => ({
        users: state.users.map(user =>
          user._id === userId ? { ...user, isActive: true } : user
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to unban user',
        isLoading: false
      });
      throw error;
    }
  },

  /**
   * Fetch characters with optional filtering
   */
  fetchCharacters: async (params = {}) => {
    set({ isLoading: true, error: null });

    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.faction) queryParams.append('faction', params.faction);
      if (params.minLevel) queryParams.append('minLevel', String(params.minLevel));
      if (params.maxLevel) queryParams.append('maxLevel', String(params.maxLevel));
      if (params.page) queryParams.append('page', String(params.page));
      if (params.limit) queryParams.append('limit', String(params.limit));

      const response = await api.get(`/admin/characters?${queryParams.toString()}`);

      set({
        characters: response.data.characters,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch characters',
        isLoading: false
      });
      throw error;
    }
  },

  /**
   * Update a character's properties
   */
  updateCharacter: async (characterId: string, updates: any) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.put(`/admin/characters/${characterId}`, updates);

      // Update local state
      set((state) => ({
        characters: state.characters.map(char =>
          char._id === characterId ? response.data.character : char
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to update character',
        isLoading: false
      });
      throw error;
    }
  },

  /**
   * Delete a character
   */
  deleteCharacter: async (characterId: string) => {
    set({ isLoading: true, error: null });

    try {
      await api.delete(`/admin/characters/${characterId}`);

      // Update local state
      set((state) => ({
        characters: state.characters.filter(char => char._id !== characterId),
        isLoading: false
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to delete character',
        isLoading: false
      });
      throw error;
    }
  },

  /**
   * Adjust character's gold
   */
  adjustGold: async (characterId: string, amount: number, reason?: string) => {
    set({ isLoading: true, error: null });

    try {
      await api.post('/admin/gold/adjust', { characterId, amount, reason });

      // Refresh characters to get updated gold
      await get().fetchCharacters();

      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to adjust gold',
        isLoading: false
      });
      throw error;
    }
  },

  /**
   * Fetch analytics data
   */
  fetchAnalytics: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get('/admin/analytics');

      set({
        analytics: response.data,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch analytics',
        isLoading: false
      });
      throw error;
    }
  },

  /**
   * Fetch gangs
   */
  fetchGangs: async (params = {}) => {
    set({ isLoading: true, error: null });

    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', String(params.page));
      if (params.limit) queryParams.append('limit', String(params.limit));

      const response = await api.get(`/admin/gangs?${queryParams.toString()}`);

      set({
        gangs: response.data.gangs,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch gangs',
        isLoading: false
      });
      throw error;
    }
  },

  /**
   * Disband a gang
   */
  disbandGang: async (gangId: string) => {
    set({ isLoading: true, error: null });

    try {
      await api.delete(`/admin/gangs/${gangId}`);

      // Update local state
      set((state) => ({
        gangs: state.gangs.filter(gang => gang._id !== gangId),
        isLoading: false
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to disband gang',
        isLoading: false
      });
      throw error;
    }
  },

  /**
   * Fetch server health metrics
   */
  fetchServerHealth: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get('/admin/server/health');

      set({
        serverHealth: response.data,
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch server health',
        isLoading: false
      });
      throw error;
    }
  },

  /**
   * Clear error state
   */
  clearError: () => {
    set({ error: null });
  }
}));

export default useAdminStore;
