/**
 * ToastContainer Component
 * Renders stacked toast notifications from the notification store
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '@/store/useNotificationStore';
import type { NotificationType } from '@desperados/shared';

// Icons for each notification type
const notificationIcons: Record<string, string> = {
  MAIL_RECEIVED: '📨',
  FRIEND_REQUEST: '🤝',
  FRIEND_ACCEPTED: '✅',
  GANG_INVITATION: '🤠',
  GANG_WAR_UPDATE: '⚔️',
  COMBAT_DEFEAT: '💀',
  JAIL_RELEASED: '🔓',
  SKILL_TRAINED: '📚',
};

interface ToastItemProps {
  toastId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ type, title, message, link, onClose }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const icon = notificationIcons[type] || '🔔';
  const duration = 5000;

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => handleClose(), duration);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const handleClick = () => {
    if (link) navigate(link);
    handleClose();
  };

  return (
    <div
      className={`bg-wood-dark border border-gold-light/50 rounded-lg shadow-xl p-4 max-w-sm transition-all duration-300 ${
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className="flex gap-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-western text-gold-light text-sm">{title}</h4>
          <p className="text-sm text-desert-sand truncate">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="text-desert-stone hover:text-white transition-colors flex-shrink-0"
          aria-label="Close notification"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      {link && (
        <button onClick={handleClick} className="block mt-2 text-sm text-gold-light hover:underline text-left">
          View details →
        </button>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-wood-medium/50 rounded-b-lg overflow-hidden">
        <div
          className="h-full bg-gold-light/50"
          style={{ width: '100%', animation: `shrink ${duration}ms linear forwards` }}
        />
      </div>
      <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotificationStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.toastId}
          toastId={toast.toastId}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          link={toast.link}
          onClose={() => removeToast(toast.toastId)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
