/**
 * UI Store
 * Manages UI state (modals, notifications, etc.) using Zustand
 */

import { create } from 'zustand';
import type { Notification } from '@/types';

interface UIStore {
  // State
  notifications: Notification[];
  isModalOpen: boolean;
  modalContent: React.ReactNode | null;
  modalTitle: string;

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  openModal: (title: string, content: React.ReactNode) => void;
  closeModal: () => void;
}

/**
 * Zustand store for UI state
 */
export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  notifications: [],
  isModalOpen: false,
  modalContent: null,
  modalTitle: '',

  /**
   * Add a notification
   */
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove after duration (default 5 seconds)
    const duration = notification.duration || 5000;
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(
          (n) => n.id !== newNotification.id
        ),
      }));
    }, duration);
  },

  /**
   * Remove a specific notification
   */
  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  /**
   * Clear all notifications
   */
  clearNotifications: () => {
    set({ notifications: [] });
  },

  /**
   * Open modal with content
   */
  openModal: (title: string, content: React.ReactNode) => {
    set({
      isModalOpen: true,
      modalTitle: title,
      modalContent: content,
    });
  },

  /**
   * Close modal
   */
  closeModal: () => {
    set({
      isModalOpen: false,
      modalTitle: '',
      modalContent: null,
    });
  },
}));
