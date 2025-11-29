/**
 * Notification Store
 * Manages notification state using Zustand
 */

import { create } from 'zustand';
import type { Notification } from '@desperados/shared';
import { api } from '@/services/api';

// Import sound system (we'll play sounds directly from the store)
let playNotificationSound: ((type: 'notification' | 'message' | 'whisper' | 'mention') => void) | null = null;

// Initialize sound player (called from app initialization)
export const initNotificationSounds = (soundPlayer: (type: 'notification' | 'message' | 'whisper' | 'mention') => void) => {
  playNotificationSound = soundPlayer;
};

interface ToastNotification extends Notification {
  toastId: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  toasts: ToastNotification[];

  fetchNotifications: (limit?: number, offset?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  showToast: (notification: Notification) => void;
  removeToast: (toastId: string) => void;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  toasts: [],

  fetchNotifications: async (limit = 20, offset = 0) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.get('/notifications', {
        params: { limit, offset }
      });

      set({
        notifications: response.data.data,
        unreadCount: response.data.unreadCount,
        isLoading: false
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to fetch notifications'
      });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      set({ unreadCount: response.data.data.count });
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);

      const updatedNotifications = get().notifications.map(n =>
        n._id === notificationId ? { ...n, isRead: true } : n
      );

      set({
        notifications: updatedNotifications,
        unreadCount: Math.max(0, get().unreadCount - 1)
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to mark notification as read'
      });
    }
  },

  markAllAsRead: async () => {
    set({ isLoading: true, error: null });

    try {
      await api.patch('/notifications/mark-all-read');

      const updatedNotifications = get().notifications.map(n => ({
        ...n,
        isRead: true
      }));

      set({
        notifications: updatedNotifications,
        unreadCount: 0,
        isLoading: false
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || 'Failed to mark all as read'
      });
    }
  },

  deleteNotification: async (notificationId: string) => {
    try {
      await api.delete(`/notifications/${notificationId}`);

      const updatedNotifications = get().notifications.filter(
        n => n._id !== notificationId
      );

      set({ notifications: updatedNotifications });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete notification'
      });
    }
  },

  addNotification: (notification: Notification) => {
    set({
      notifications: [notification, ...get().notifications],
      unreadCount: get().unreadCount + 1
    });

    // Play notification sound
    if (playNotificationSound) {
      playNotificationSound('notification');
    }
  },

  showToast: (notification: Notification) => {
    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    set({
      toasts: [...get().toasts, { ...notification, toastId }]
    });

    // Play notification sound
    if (playNotificationSound) {
      playNotificationSound('notification');
    }
  },

  removeToast: (toastId: string) => {
    set({
      toasts: get().toasts.filter(t => t.toastId !== toastId)
    });
  },

  clearError: () => set({ error: null })
}));
