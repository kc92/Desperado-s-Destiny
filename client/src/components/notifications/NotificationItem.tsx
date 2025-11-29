/**
 * NotificationItem Component
 * Displays a single notification with icon, title, message, and time
 */

import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Notification, NotificationType } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
  onMarkRead?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

// Icons for each notification type
const notificationIcons: Record<NotificationType, string> = {
  MAIL_RECEIVED: '📨',
  FRIEND_REQUEST: '🤝',
  FRIEND_ACCEPTED: '✅',
  GANG_INVITATION: '🤠',
  GANG_WAR_UPDATE: '⚔️',
  COMBAT_DEFEAT: '💀',
  JAIL_RELEASED: '🔓',
  SKILL_TRAINED: '📚',
};

// Format time ago
const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

export const NotificationItem: React.FC<NotificationItemProps> = React.memo(({
  notification,
  onClick,
  onMarkRead,
  onDelete,
  showActions = false,
}) => {
  const navigate = useNavigate();

  // Memoize icon lookup
  const icon = useMemo(
    () => notificationIcons[notification.type] || '🔔',
    [notification.type]
  );

  // Memoize formatted time
  const timeAgo = useMemo(
    () => formatTimeAgo(notification.createdAt),
    [notification.createdAt]
  );

  // Memoize main click handler
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    }
    if (!notification.isRead && onMarkRead) {
      onMarkRead();
    }
    if (notification.link) {
      navigate(notification.link);
    }
  }, [onClick, onMarkRead, notification.isRead, notification.link, navigate]);

  // Memoize mark read handler
  const handleMarkRead = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMarkRead) {
      onMarkRead();
    }
  }, [onMarkRead]);

  // Memoize delete handler
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  }, [onDelete]);

  return (
    <div
      onClick={handleClick}
      className={`p-3 border-b border-wood-grain/30 hover:bg-wood-medium/50 cursor-pointer transition-colors ${
        !notification.isRead ? 'bg-wood-medium/20' : ''
      }`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <span className="text-xl flex-shrink-0">{icon}</span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm ${
              notification.isRead
                ? 'text-desert-stone'
                : 'text-desert-sand font-medium'
            }`}
          >
            {notification.title}
          </p>
          <p className="text-xs text-desert-stone truncate">
            {notification.message}
          </p>
          <p className="text-xs text-desert-stone/70 mt-1">
            {timeAgo}
          </p>
        </div>

        {/* Unread indicator */}
        {!notification.isRead && (
          <div className="w-2 h-2 bg-gold-light rounded-full self-center flex-shrink-0" />
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 mt-2 ml-8">
          {!notification.isRead && onMarkRead && (
            <button
              onClick={handleMarkRead}
              className="text-xs text-desert-stone hover:text-gold-light transition-colors"
            >
              Mark read
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="text-xs text-desert-stone hover:text-red-500 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if notification data or handlers change
  return (
    prevProps.notification._id === nextProps.notification._id &&
    prevProps.notification.isRead === nextProps.notification.isRead &&
    prevProps.notification.title === nextProps.notification.title &&
    prevProps.notification.message === nextProps.notification.message &&
    prevProps.notification.createdAt === nextProps.notification.createdAt &&
    prevProps.showActions === nextProps.showActions &&
    prevProps.onClick === nextProps.onClick &&
    prevProps.onMarkRead === nextProps.onMarkRead &&
    prevProps.onDelete === nextProps.onDelete
  );
});

// Display name for React DevTools
NotificationItem.displayName = 'NotificationItem';

export default NotificationItem;
