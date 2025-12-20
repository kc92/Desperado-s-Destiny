/**
 * Friend Store
 * Manages friend state using Zustand
 */

import { create } from 'zustand';
import type { Friend, FriendWithOnlineStatus } from '@desperados/shared';
import { friendService } from '@/services/friend.service';
import { logger } from '@/services/logger.service';

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
      const friends = await friendService.getFriends();

      set({
        friends,
        isLoading: false
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch friends';
      logger.error('Failed to fetch friends', error, { errorMessage });

      set({
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  fetchRequests: async () => {
    set({ isLoading: true, error: null });

    try {
      const requests = await friendService.getFriendRequests();

      set({
        requests,
        isLoading: false
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch friend requests';
      logger.error('Failed to fetch friend requests', error, { errorMessage });

      set({
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  sendRequest: async (recipientId: string) => {
    set({ isLoading: true, error: null });

    try {
      await friendService.sendFriendRequest(recipientId);
      set({ isLoading: false });

      await get().fetchFriends();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send friend request';
      logger.error('Failed to send friend request', error, { recipientId, errorMessage });

      set({
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  acceptRequest: async (requestId: string) => {
    set({ isLoading: true, error: null });

    try {
      await friendService.acceptFriendRequest(requestId);
      set({ isLoading: false });

      await get().fetchRequests();
      await get().fetchFriends();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to accept friend request';
      logger.error('Failed to accept friend request', error, { requestId, errorMessage });

      set({
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  rejectRequest: async (requestId: string) => {
    set({ isLoading: true, error: null });

    try {
      await friendService.rejectFriendRequest(requestId);
      set({ isLoading: false });

      await get().fetchRequests();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reject friend request';
      logger.error('Failed to reject friend request', error, { requestId, errorMessage });

      set({
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  removeFriend: async (friendId: string) => {
    set({ isLoading: true, error: null });

    try {
      await friendService.removeFriend(friendId);
      set({ isLoading: false });

      await get().fetchFriends();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to remove friend';
      logger.error('Failed to remove friend', error, { friendId, errorMessage });

      set({
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  blockUser: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      await friendService.blockUser(userId);
      set({ isLoading: false });

      await get().fetchFriends();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to block user';
      logger.error('Failed to block user', error, { userId, errorMessage });

      set({
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));
