/**
 * Toast Component
 * Western-themed toast notifications with leather and gold styling
 */

import React, { useEffect, useState } from 'react';
import { useToastStore, Toast as ToastType, ToastType as ToastVariant } from '@/store/useToastStore';

// Variant styles mapping with Western theme
const variantStyles: Record<ToastVariant, {
  bg: string;
  border: string;
  icon: string;
  shadow: string;
  iconBg: string;
}> = {
  success: {
    bg: 'bg-wood-medium',
    border: 'border-gold-medium',
    icon: 'text-gold-light',
    shadow: 'shadow-gold',
    iconBg: 'bg-gold-dark/20',
  },
  error: {
    bg: 'bg-leather-brown',
    border: 'border-blood-red',
    icon: 'text-blood-crimson',
    shadow: 'shadow-lg',
    iconBg: 'bg-blood-dark/20',
  },
  warning: {
    bg: 'bg-leather-saddle',
    border: 'border-gold-dark',
    icon: 'text-gold-light',
    shadow: 'shadow-gold',
    iconBg: 'bg-gold-dark/30',
  },
  info: {
    bg: 'bg-wood-dark',
    border: 'border-faction-settler',
    icon: 'text-faction-settler',
    shadow: 'shadow-lg',
    iconBg: 'bg-faction-settler/20',
  },
  reward: {
    bg: 'bg-gradient-to-r from-gold-dark to-gold-medium',
    border: 'border-gold-light',
    icon: 'text-wood-dark',
    shadow: 'shadow-gold',
    iconBg: 'bg-gold-pale/30',
  },
};

interface ToastItemProps {
  toast: ToastType;
  onRemove: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const styles = variantStyles[toast.type];

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsEntering(false), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(onRemove, 300); // Wait for exit animation
  };

  // Auto-trigger exit animation before removal
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
      }, toast.duration - 300);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border-3
        transform transition-all duration-300 ease-out min-w-[320px] max-w-sm
        ${styles.bg} ${styles.border} ${styles.shadow}
        ${isEntering ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        ${isExiting ? 'translate-x-full opacity-0 scale-95' : ''}
      `}
      style={{
        backgroundImage: `linear-gradient(135deg, transparent 24%, rgba(0, 0, 0, .03) 25%, rgba(0, 0, 0, .03) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, .03) 75%, rgba(0, 0, 0, .03) 76%, transparent 77%, transparent)`,
        backgroundSize: '30px 30px',
      }}
      role="alert"
      aria-live="polite"
    >
      {/* Icon with background */}
      <div
        className={`
          flex items-center justify-center flex-shrink-0
          w-10 h-10 rounded-full ${styles.iconBg}
          border-2 ${styles.border}
        `}
      >
        <span className={`text-2xl font-bold ${styles.icon}`} aria-hidden="true">
          {toast.icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <h4 className="font-western text-desert-sand text-base leading-tight mb-1">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="text-desert-dust text-sm leading-snug font-serif">
            {toast.message}
          </p>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              handleRemove();
            }}
            className="mt-2 text-sm text-gold-light hover:text-gold-pale underline font-serif transition-colors"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={handleRemove}
        className="flex-shrink-0 text-desert-sand/60 hover:text-desert-sand transition-colors rounded p-1 hover:bg-black/10"
        aria-label="Dismiss notification"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

/**
 * Toast Container - renders all active toasts
 * Positioned at top-right with slide-in animations
 * Add this to your App.tsx layout
 */
export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};

// Display name for React DevTools
ToastContainer.displayName = 'ToastContainer';

export default ToastContainer;
