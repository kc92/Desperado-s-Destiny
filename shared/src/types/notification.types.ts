/**
 * Notification Types
 *
 * Shared types for notification system
 */

export enum NotificationType {
  MAIL_RECEIVED = 'MAIL_RECEIVED',
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  FRIEND_ACCEPTED = 'FRIEND_ACCEPTED',
  GANG_INVITATION = 'GANG_INVITATION',
  GANG_WAR_UPDATE = 'GANG_WAR_UPDATE',
  COMBAT_DEFEAT = 'COMBAT_DEFEAT',
  JAIL_RELEASED = 'JAIL_RELEASED',
  SKILL_TRAINED = 'SKILL_TRAINED'
}

export interface Notification {
  _id: string;
  characterId: string;

  type: NotificationType;
  title: string;
  message: string;
  link: string;

  isRead: boolean;
  createdAt: string;
}

export interface GetNotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  unreadCount: number;
}

export interface GetUnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

export interface MarkAllAsReadResponse {
  success: boolean;
  data: {
    count: number;
  };
  message: string;
}
