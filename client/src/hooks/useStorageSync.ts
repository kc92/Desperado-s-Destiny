/**
 * useStorageSync Hook
 *
 * Provides cross-tab synchronization via localStorage storage events.
 * When one tab updates a value, other tabs are notified and can sync.
 */

import { useEffect } from 'react';
import { logger } from '@/services/logger.service';

/**
 * Hook for syncing a specific localStorage key across browser tabs
 *
 * @param key - The localStorage key to watch
 * @param onSync - Callback when value changes from another tab
 *
 * @example
 * ```tsx
 * useStorageSync<string>('selectedCharacterId', (newValue) => {
 *   if (newValue !== currentCharacterId) {
 *     setSelectedCharacter(newValue);
 *   }
 * });
 * ```
 */
export function useStorageSync<T>(
  key: string,
  onSync: (value: T | null) => void
): void {
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Only process events for our key
      if (event.key !== key) return;

      // Ignore events from current tab (shouldn't happen, but safety check)
      if (event.storageArea !== localStorage) return;

      try {
        const newValue = event.newValue ? JSON.parse(event.newValue) as T : null;
        logger.debug('[StorageSync] Value changed in another tab', {
          key,
          hasValue: newValue !== null,
        });
        onSync(newValue);
      } catch (error) {
        logger.error('[StorageSync] Failed to parse storage value', error as Error, {
          key,
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, onSync]);
}

/**
 * Write a value to localStorage with proper serialization
 * Use this to ensure consistent format for cross-tab sync
 */
export function writeStorageValue<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logger.error('[StorageSync] Failed to write to storage', error as Error, { key });
  }
}

/**
 * Read a value from localStorage with proper deserialization
 */
export function readStorageValue<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : null;
  } catch (error) {
    logger.error('[StorageSync] Failed to read from storage', error as Error, { key });
    return null;
  }
}

/**
 * Remove a value from localStorage
 */
export function removeStorageValue(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    logger.error('[StorageSync] Failed to remove from storage', error as Error, { key });
  }
}

/**
 * Hook for BroadcastChannel-based sync (more reliable for auth events)
 *
 * BroadcastChannel is better for auth because:
 * 1. Storage events don't fire in the same tab
 * 2. Auth state needs immediate cross-tab sync
 * 3. More reliable for critical operations
 *
 * @example
 * ```tsx
 * useAuthBroadcast((message) => {
 *   if (message.type === 'LOGOUT') {
 *     // Force logout this tab
 *     logout();
 *   }
 * });
 * ```
 */
export interface AuthBroadcastMessage {
  type: 'LOGIN' | 'LOGOUT' | 'SESSION_EXPIRED' | 'CHARACTER_CHANGED';
  userId?: string;
  characterId?: string;
  timestamp: number;
}

let authChannel: BroadcastChannel | null = null;

/**
 * Get or create the auth broadcast channel
 */
function getAuthChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') {
    // BroadcastChannel not supported (older browsers, some Safari versions)
    return null;
  }

  if (!authChannel) {
    authChannel = new BroadcastChannel('desperados_auth_state');
  }

  return authChannel;
}

/**
 * Hook to listen for auth-related broadcasts from other tabs
 */
export function useAuthBroadcast(
  onMessage: (message: AuthBroadcastMessage) => void
): void {
  useEffect(() => {
    const channel = getAuthChannel();
    if (!channel) return;

    const handleMessage = (event: MessageEvent<AuthBroadcastMessage>) => {
      logger.debug('[AuthBroadcast] Received message', event.data);
      onMessage(event.data);
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
    };
  }, [onMessage]);
}

/**
 * Broadcast an auth event to all other tabs
 */
export function broadcastAuthEvent(
  type: AuthBroadcastMessage['type'],
  data?: Partial<Omit<AuthBroadcastMessage, 'type' | 'timestamp'>>
): void {
  const channel = getAuthChannel();
  if (!channel) {
    // Fall back to storage event (triggers in other tabs)
    try {
      const key = '_auth_broadcast';
      localStorage.setItem(key, JSON.stringify({ type, ...data, timestamp: Date.now() }));
      // Clean up immediately (we just need the event)
      localStorage.removeItem(key);
    } catch (error) {
      logger.error('[AuthBroadcast] Failed to broadcast via storage', error as Error);
    }
    return;
  }

  const message: AuthBroadcastMessage = {
    type,
    timestamp: Date.now(),
    ...data,
  };

  channel.postMessage(message);
  logger.debug('[AuthBroadcast] Sent message', message);
}

/**
 * Storage keys used for cross-tab sync
 */
export const STORAGE_KEYS = {
  SELECTED_CHARACTER_ID: 'selectedCharacterId',
  CHAT_SETTINGS: 'chat_settings',
  AUTH_BROADCAST: '_auth_broadcast',
} as const;

export default {
  useStorageSync,
  useAuthBroadcast,
  broadcastAuthEvent,
  writeStorageValue,
  readStorageValue,
  removeStorageValue,
  STORAGE_KEYS,
};
