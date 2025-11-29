/**
 * useNotifications Hook
 * Manages notification state, Socket.io real-time updates, and API calls
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { socketService } from '@/services/socket.service';
import { useCharacterStore } from '@/store/useCharacterStore';

export type NotificationType =
  | 'MAIL_RECEIVED'
  | 'FRIEND_REQUEST'
  | 'FRIEND_ACCEPTED'
  | 'GANG_INVITATION'
  | 'GANG_WAR_UPDATE'
  | 'COMBAT_DEFEAT'
  | 'JAIL_RELEASED'
  | 'SKILL_TRAINED';

export interface Notification {
  _id: string;
  characterId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  total: number;
  page: number;
  pages: number;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: (page?: number) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { currentCharacter } = useCharacterStore();

  // Fetch notifications from API
  const fetchNotifications = useCallback(async (page = 1) => {
    if (!currentCharacter) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: NotificationsResponse }>(
        `/notifications?page=${page}&limit=20`
      );
      const data = response.data.data;

      if (page === 1) {
        setNotifications(data.notifications);
      } else {
        setNotifications(prev => [...prev, ...data.notifications]);
      }

      setUnreadCount(data.unreadCount);
      setCurrentPage(data.page);
      setTotalPages(data.pages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
      console.error('[useNotifications] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentCharacter]);

  // Load more notifications
  const loadMore = useCallback(async () => {
    if (currentPage < totalPages) {
      await fetchNotifications(currentPage + 1);
    }
  }, [currentPage, totalPages, fetchNotifications]);

  // Mark single notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('[useNotifications] Mark as read error:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error('[useNotifications] Mark all as read error:', err);
    }
  }, []);

  // Delete a notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err: any) {
      console.error('[useNotifications] Delete error:', err);
    }
  }, []);

  // Fetch initial data and unread count
  useEffect(() => {
    if (currentCharacter) {
      fetchNotifications(1);

      // Also fetch just the unread count
      api.get<{ data: { unreadCount: number } }>('/notifications/unread-count')
        .then(res => setUnreadCount(res.data.data.unreadCount))
        .catch(err => console.error('[useNotifications] Unread count error:', err));
    }
  }, [currentCharacter, fetchNotifications]);

  // Socket.io listener for real-time notifications
  useEffect(() => {
    if (!currentCharacter) return;

    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    // Subscribe to notification events
    // The server emits to `character:${characterId}` channel
    socketService.on('notification:new' as any, handleNewNotification);

    return () => {
      socketService.off('notification:new' as any, handleNewNotification);
    };
  }, [currentCharacter]);

  return {
    notifications: notifications ?? [],
    unreadCount: unreadCount ?? 0,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    hasMore: currentPage < totalPages,
    loadMore,
  };
};

export default useNotifications;
