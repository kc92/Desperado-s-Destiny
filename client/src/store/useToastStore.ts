/**
 * Toast Notification Store
 * Global toast notification system using Zustand with Western theme
 */

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  icon?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
  // Convenience methods
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
}

// Generate unique ID
const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Default durations by type (in ms)
const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 5000,
  error: 5000,
  warning: 5000,
  info: 5000,
};

// Western-themed icons by type
const DEFAULT_ICONS: Record<ToastType, string> = {
  success: '★',
  error: '✗',
  warning: '⚡',
  info: '◆',
};

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = generateId();
    const duration = toast.duration ?? DEFAULT_DURATIONS[toast.type];
    const icon = toast.icon ?? DEFAULT_ICONS[toast.type];

    const newToast: Toast = {
      ...toast,
      id,
      icon,
      duration,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAll: () => {
    set({ toasts: [] });
  },

  // Convenience methods
  success: (title, message) => {
    return get().addToast({ type: 'success', title, message });
  },

  error: (title, message) => {
    return get().addToast({ type: 'error', title, message });
  },

  warning: (title, message) => {
    return get().addToast({ type: 'warning', title, message });
  },

  info: (title, message) => {
    return get().addToast({ type: 'info', title, message });
  },
}));

// Export convenience hook
export const useToast = () => {
  const { success, error, warning, info, addToast } = useToastStore();
  return { success, error, warning, info, addToast };
};
