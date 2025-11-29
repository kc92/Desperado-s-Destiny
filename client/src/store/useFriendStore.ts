/**
 * Friend Store
 * Manages friend state using Zustand
 */

import { create } from 'zustand';
import type { Friend, FriendWithOnlineStatus } from '@desperados/shared';
import { api } from '@/services/api';

interface FriendStore {
  friends: FriendWithOnlineStatus[];
  requests: Friend[];
  isLoading: boolean;
  error: string | null;

  fetchFriends: () => Promise<void>;
  fetchRequests: () => Promise<void>;
  sendRequest: (recipientId: string) => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  clearError: () => void;
}

export const useFriendStore = create<FriendStore>((set, get) => ({
  friends: [],
  requests: [],
  isLoading: false,
  error: null,

  fetchFriends: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get('/friends');

      set({
        friends: response.data.data,
        isLoading: false
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch friends'
      });
      throw error;
    }
  },

  fetchRequests: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get('/friends/requests');

      set({
        requests: response.data.data,
        isLoading: false
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch friend requests'
      });
      throw error;
    }
  },

  sendRequest: async (recipientId: string) => {
    set({ isLoading: true, error: null });

    try {
      await api.post('/friends/request', { recipientId });
      set({ isLoading: false });

      await get().fetchFriends();
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to send friend request'
      });
      throw error;
    }
  },

  acceptRequest: async (requestId: string) => {
    set({ isLoading: true, error: null });

    try {
      await api.post(`/friends/${requestId}/accept`);
      set({ isLoading: false });

      await get().fetchRequests();
      await get().fetchFriends();
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to accept friend request'
      });
      throw error;
    }
  },

  rejectRequest: async (requestId: string) => {
    set({ isLoading: true, error: null });

    try {
      await api.post(`/friends/${requestId}/reject`);
      set({ isLoading: false });

      await get().fetchRequests();
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to reject friend request'
      });
      throw error;
    }
  },

  removeFriend: async (friendId: string) => {
    set({ isLoading: true, error: null });

    try {
      await api.delete(`/friends/${friendId}`);
      set({ isLoading: false });

      await get().fetchFriends();
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to remove friend'
      });
      throw error;
    }
  },

  blockUser: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      await api.post(`/friends/block/${userId}`);
      set({ isLoading: false });

      await get().fetchFriends();
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to block user'
      });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));
