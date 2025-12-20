/**
 * Notification Service
 * API client for notification management
 */

import api from './api';
import {
  Notification,
  NotificationType,
  GetNotificationsResponse,
  GetUnreadCountResponse,
  MarkAllAsReadResponse,
} from '@shared/types/notification.types';

// ===== Additional Response Types =====

export interface MarkAsReadResponse {
  success: boolean;
  data: Notification;
}

export interface DeleteNotificationResponse {
  success: boolean;
  message: string;
}

// ===== Query Parameters =====

export interface GetNotificationsParams {
  limit?: number;
  offset?: number;
}

// ===== Notification Service =====

export const notificationService = {
  /**
   * Get user notifications with pagination
   */
  async getNotifications(params?: GetNotificationsParams): Promise<GetNotificationsResponse> {
    const response = await api.get<GetNotificationsResponse>('/notifications', { params });
    return response.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get<GetUnreadCountResponse>('/notifications/unread-count');
    return response.data.data.count;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<MarkAllAsReadResponse> {
    const response = await api.patch<MarkAllAsReadResponse>('/notifications/mark-all-read');
    return response.data;
  },

  /**
   * Mark a specific notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await api.patch<MarkAsReadResponse>(`/notifications/${notificationId}/read`);
    return response.data.data;
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete<DeleteNotificationResponse>(`/notifications/${notificationId}`);
  },

  // ===== Convenience Methods =====

  /**
   * Get only unread notifications
   */
  async getUnreadNotifications(params?: GetNotificationsParams): Promise<Notification[]> {
    const response = await this.getNotifications(params);
    return response.data.filter(notification => !notification.isRead);
  },

  /**
   * Get notifications by type
   */
  async getNotificationsByType(
    type: NotificationType,
    params?: GetNotificationsParams
  ): Promise<Notification[]> {
    const response = await this.getNotifications(params);
    return response.data.filter(notification => notification.type === type);
  },

  /**
   * Check if there are unread notifications
   */
  async hasUnread(): Promise<boolean> {
    const count = await this.getUnreadCount();
    return count > 0;
  },
};

export default notificationService;
