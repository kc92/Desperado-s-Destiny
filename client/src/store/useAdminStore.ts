/**
 * Admin Store
 * Manages admin operations state using Zustand
 */

import { create } from 'zustand';
import adminService from '@/services/admin.service';
import { logger } from '@/services/logger.service';

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
      const response = await adminService.getUsers(params);

      set({
        users: response.users,
        isLoading: false
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch users';
      logger.error('Failed to fetch users', error, { params });
      set({
        error: errorMessage,
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
      const response = await adminService.getUserDetails(userId);
      set({ isLoading: false });
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch user details';
      logger.error('Failed to fetch user details', error, { userId });
      set({
        error: errorMessage,
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
      await adminService.banUser(userId, reason ? { reason } : undefined);

      // Update local state
      set((state) => ({
        users: state.users.map(user =>
          user._id === userId ? { ...user, isActive: false } : user
        ),
        isLoading: false
      }));
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to ban user';
      logger.error('Failed to ban user', error, { userId, reason });
      set({
        error: errorMessage,
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
      await adminService.unbanUser(userId);

      // Update local state
      set((state) => ({
        users: state.users.map(user =>
          user._id === userId ? { ...user, isActive: true } : user
        ),
        isLoading: false
      }));
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to unban user';
      logger.error('Failed to unban user', error, { userId });
      set({
        error: errorMessage,
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
      const response = await adminService.getCharacters(params);

      set({
        characters: response.characters,
        isLoading: false
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch characters';
      logger.error('Failed to fetch characters', error, { params });
      set({
        error: errorMessage,
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
      const response = await adminService.updateCharacter(characterId, updates);

      // Update local state
      set((state) => ({
        characters: state.characters.map(char =>
          char._id === characterId ? response.character : char
        ),
        isLoading: false
      }));
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update character';
      logger.error('Failed to update character', error, { characterId, updates });
      set({
        error: errorMessage,
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
      await adminService.deleteCharacter(characterId);

      // Update local state
      set((state) => ({
        characters: state.characters.filter(char => char._id !== characterId),
        isLoading: false
      }));
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete character';
      logger.error('Failed to delete character', error, { characterId });
      set({
        error: errorMessage,
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
      await adminService.adjustGold({ characterId, amount, reason });

      // Refresh characters to get updated gold
      await get().fetchCharacters();

      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to adjust gold';
      logger.error('Failed to adjust gold', error, { characterId, amount, reason });
      set({
        error: errorMessage,
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
      const analytics = await adminService.getAnalytics();

      set({
        analytics,
        isLoading: false
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch analytics';
      logger.error('Failed to fetch analytics', error);
      set({
        error: errorMessage,
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
      const response = await adminService.getGangs(params);

      set({
        gangs: response.gangs,
        isLoading: false
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch gangs';
      logger.error('Failed to fetch gangs', error, { params });
      set({
        error: errorMessage,
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
      await adminService.disbandGang(gangId);

      // Update local state
      set((state) => ({
        gangs: state.gangs.filter(gang => gang._id !== gangId),
        isLoading: false
      }));
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to disband gang';
      logger.error('Failed to disband gang', error, { gangId });
      set({
        error: errorMessage,
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
      const serverHealth = await adminService.getServerHealth();

      set({
        serverHealth,
        isLoading: false
      });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch server health';
      logger.error('Failed to fetch server health', error);
      set({
        error: errorMessage,
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
