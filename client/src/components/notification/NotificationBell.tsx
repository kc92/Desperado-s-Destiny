/**
 * Notification Bell Component
 * Displays notification count and dropdown list
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Notification } from '@desperados/shared';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export const NotificationBell: React.FC = () => {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotificationStore();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(10, 0);
    }
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    navigate(notification.link);
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteNotification = async (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'MAIL_RECEIVED':
        return '✉️';
      case 'FRIEND_REQUEST':
        return '👤';
      case 'FRIEND_ACCEPTED':
        return '✅';
      case 'COMBAT_DEFEAT':
        return '⚔️';
      case 'JAIL_RELEASED':
        return '🔓';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-brown-700 rounded"
      >
        <svg
          className="w-6 h-6 text-gold-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-brown-800 border-2 border-brown-600 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-brown-600 flex justify-between items-center">
            <h3 className="font-semibold text-gold-400">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-gold-400 hover:text-gold-300"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="divide-y divide-brown-700">
            {notifications.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            )}

            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-3 cursor-pointer hover:bg-brown-700 ${
                  !notification.isRead ? 'bg-brown-900' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gold-400">
                          {notification.title}
                        </div>
                        <div className="text-sm text-gray-400 mt-0.5">
                          {notification.message}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true
                          })}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteNotification(e, notification._id)}
                        className="text-gray-500 hover:text-red-400 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
                {!notification.isRead && (
                  <div className="absolute right-2 top-3 w-2 h-2 bg-gold-400 rounded-full" />
                )}
              </div>
            ))}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-brown-600 text-center">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
                className="text-sm text-gold-400 hover:text-gold-300"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
