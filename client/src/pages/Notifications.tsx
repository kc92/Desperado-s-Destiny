/**
 * Notifications Page
 * Full page view of all notifications with filtering and actions
 */

import React, { useState, useEffect } from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { NotificationItem } from '@/components/notifications';
import { Card, Button, EmptyState } from '@/components/ui';
import type { Notification } from '@desperados/shared';

// Define notification types locally since we no longer use the hook
type NotificationType =
  | 'MAIL_RECEIVED'
  | 'FRIEND_REQUEST'
  | 'FRIEND_ACCEPTED'
  | 'GANG_INVITATION'
  | 'GANG_WAR_UPDATE'
  | 'COMBAT_DEFEAT'
  | 'JAIL_RELEASED'
  | 'SKILL_TRAINED';

type FilterType = 'all' | 'unread' | 'social' | 'combat' | 'gang';

const filterConfig: Record<FilterType, { label: string; types?: NotificationType[] }> = {
  all: { label: 'All' },
  unread: { label: 'Unread' },
  social: {
    label: 'Social',
    types: ['MAIL_RECEIVED', 'FRIEND_REQUEST', 'FRIEND_ACCEPTED'],
  },
  combat: {
    label: 'Combat',
    types: ['COMBAT_DEFEAT', 'JAIL_RELEASED'],
  },
  gang: {
    label: 'Gang',
    types: ['GANG_INVITATION', 'GANG_WAR_UPDATE'],
  },
};

export const Notifications: React.FC = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Use the notification store
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearError,
  } = useNotificationStore();

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications(20, 0);
  }, [fetchNotifications]);

  // Load more notifications
  const loadMore = async () => {
    const offset = page * 20;
    await fetchNotifications(20, offset);
    setPage(prev => prev + 1);

    // Check if we have more notifications to load
    // If we received less than 20, we've reached the end
    if (notifications.length < offset + 20) {
      setHasMore(false);
    }
  };

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    const types = filterConfig[filter].types;
    return types ? types.includes(notification.type as NotificationType) : true;
  });

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-western text-gold-light">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-desert-stone mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button size="sm" variant="secondary" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {(Object.keys(filterConfig) as FilterType[]).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-serif whitespace-nowrap transition-colors ${
              filter === key
                ? 'bg-gold-light text-wood-dark'
                : 'bg-wood-dark border border-wood-grain text-desert-sand hover:border-gold-light/50'
            }`}
          >
            {filterConfig[key].label}
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <Card variant="leather" className="p-4 mb-4 border-red-600">
          <p className="text-red-500 text-sm">{error}</p>
        </Card>
      )}

      {/* Notification List */}
      <Card variant="leather" className="overflow-hidden">
        {isLoading && notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-light mx-auto mb-4"></div>
            <p className="text-desert-stone">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon="🔔"
              title={filter === 'all' ? 'No Notifications Yet' : `No ${filterConfig[filter].label} Notifications`}
              description={filter === 'all'
                ? "All quiet on the frontier. We'll let you know when something happens!"
                : `No ${filterConfig[filter].label.toLowerCase()} notifications to show.`
              }
              size="sm"
            />
          </div>
        ) : (
          <div>
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkRead={() => markAsRead(notification._id)}
                onDelete={() => deleteNotification(notification._id)}
                showActions
              />
            ))}
          </div>
        )}
      </Card>

      {/* Load More */}
      {hasMore && filteredNotifications.length > 0 && (
        <div className="mt-4 text-center">
          <Button
            variant="secondary"
            onClick={loadMore}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      )}

      {/* Info Footer */}
      <p className="text-xs text-desert-stone text-center mt-4">
        Notifications are automatically deleted after 30 days
      </p>
    </div>
  );
};

export default Notifications;
