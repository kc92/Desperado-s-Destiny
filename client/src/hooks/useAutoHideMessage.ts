/**
 * useAutoHideMessage Hook
 * Provides a message state with automatic timeout-based hiding and proper cleanup
 *
 * Production hardening: Prevents setTimeout memory leaks by cleaning up on unmount
 */

import { useState, useRef, useEffect, useCallback } from 'react';

export interface AutoHideMessage {
  text: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface UseAutoHideMessageOptions {
  /** Duration in ms before message auto-hides (default: 3000) */
  duration?: number;
}

interface UseAutoHideMessageReturn {
  /** Current message or null */
  message: AutoHideMessage | null;
  /** Set a message that will auto-hide after duration */
  showMessage: (message: AutoHideMessage) => void;
  /** Manually clear the message immediately */
  clearMessage: () => void;
}

/**
 * Hook for managing messages that auto-hide after a timeout
 * Properly cleans up timers on unmount to prevent memory leaks
 */
export function useAutoHideMessage(options: UseAutoHideMessageOptions = {}): UseAutoHideMessageReturn {
  const { duration = 3000 } = options;

  const [message, setMessage] = useState<AutoHideMessage | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const clearMessage = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setMessage(null);
  }, []);

  const showMessage = useCallback((newMessage: AutoHideMessage) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setMessage(newMessage);

    // Set new auto-hide timer
    timerRef.current = setTimeout(() => {
      setMessage(null);
      timerRef.current = null;
    }, duration);
  }, [duration]);

  return { message, showMessage, clearMessage };
}

export default useAutoHideMessage;
