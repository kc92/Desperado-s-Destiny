/**
 * NotificationBell Component
 * Bell icon with unread badge and dropdown showing recent notifications
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

export const NotificationBell: React.FC = React.memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Refresh notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1);
    }
  }, [isOpen, fetchNotifications]);

  // Memoize toggle handler
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Memoize notification click handler
  const handleNotificationClick = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Memoize close dropdown handler
  const handleCloseDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Memoize badge display text
  const badgeText = useMemo(
    () => (unreadCount > 99 ? '99+' : unreadCount),
    [unreadCount]
  );

  // Memoize recent notifications (top 10) - with null safety
  const recentNotifications = useMemo(
    () => (notifications ?? []).slice(0, 10),
    [notifications]
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-desert-sand hover:text-gold-light transition-colors focus-visible-gold"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls="notification-dropdown"
      >
        {/* Bell Icon */}
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
            aria-label={`${unreadCount} unread notifications`}
          >
            {badgeText}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          id="notification-dropdown"
          className="absolute right-0 mt-2 w-80 bg-wood-dark border border-wood-grain rounded-lg shadow-xl z-50"
          role="menu"
          aria-label="Notifications menu"
        >
          {/* Header */}
          <div className="p-3 border-b border-wood-grain flex justify-between items-center">
            <h3 className="font-western text-gold-light">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-desert-stone hover:text-gold-light transition-colors focus-visible-gold"
                aria-label="Mark all notifications as read"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading && (!notifications || notifications.length === 0) ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold-light mx-auto"></div>
              </div>
            ) : !notifications || notifications.length === 0 ? (
              <p className="p-4 text-center text-desert-stone text-sm">
                No notifications yet
              </p>
            ) : (
              recentNotifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onClick={handleNotificationClick}
                  onMarkRead={() => markAsRead(notification._id)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-wood-grain">
            <Link
              to="/game/notifications"
              onClick={handleCloseDropdown}
              className="block text-center text-sm text-gold-light hover:underline"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
});

// Display name for React DevTools
NotificationBell.displayName = 'NotificationBell';

export default NotificationBell;
