/**
 * Socket Error Boundary Component
 *
 * Wraps socket-dependent components to show connection status
 * and provide retry options when connection fails.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { socketService } from '@/services/socket.service';
import { useChatStore } from '@/store/useChatStore';

interface SocketErrorBoundaryProps {
  children: React.ReactNode;
  /** Custom fallback component to show on error */
  fallback?: React.ReactNode;
  /** Whether to show a banner instead of replacing content */
  bannerMode?: boolean;
  /** Callback when connection status changes */
  onStatusChange?: (status: 'connected' | 'disconnected' | 'connecting' | 'error') => void;
}

/**
 * Socket Error Boundary
 *
 * Shows connection status and retry options when socket connection fails.
 * Use to wrap components that depend on real-time socket communication.
 */
export function SocketErrorBoundary({
  children,
  fallback,
  bannerMode = false,
  onStatusChange,
}: SocketErrorBoundaryProps): JSX.Element {
  const { connectionStatus, initialize } = useChatStore();
  const [isRetrying, setIsRetrying] = useState(false);

  // Notify parent of status changes
  useEffect(() => {
    onStatusChange?.(connectionStatus);
  }, [connectionStatus, onStatusChange]);

  const handleRetry = useCallback(() => {
    setIsRetrying(true);

    // Re-initialize the socket connection
    socketService.connect();
    initialize();

    // Reset retry state after a delay
    setTimeout(() => {
      setIsRetrying(false);
    }, 3000);
  }, [initialize]);

  const isError = connectionStatus === 'error';
  const isDisconnected = connectionStatus === 'disconnected';
  const isConnecting = connectionStatus === 'connecting' || isRetrying;

  // If connected, just render children
  if (connectionStatus === 'connected') {
    return <>{children}</>;
  }

  // Banner mode - show banner above content
  if (bannerMode) {
    return (
      <>
        {(isError || isDisconnected) && (
          <div
            className={`px-4 py-2 flex items-center justify-between text-sm ${
              isError
                ? 'bg-blood-red/10 border-b border-blood-red text-blood-red'
                : 'bg-gold-medium/10 border-b border-gold-medium text-gold-dark'
            }`}
            role="alert"
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isError ? 'bg-blood-red' : 'bg-gold-medium animate-pulse'
                }`}
              />
              <span>
                {isError
                  ? 'Connection lost. Some features may be unavailable.'
                  : isConnecting
                  ? 'Reconnecting...'
                  : 'Connection interrupted.'}
              </span>
            </div>

            <button
              onClick={handleRetry}
              disabled={isConnecting}
              className={`px-3 py-1 text-sm font-semibold rounded transition-colors ${
                isConnecting
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gold-medium text-wood-dark hover:bg-gold-light'
              }`}
            >
              {isConnecting ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        )}

        {isConnecting && !isError && !isDisconnected && (
          <div className="px-4 py-2 bg-gold-medium/10 border-b border-gold-medium text-gold-dark text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gold-medium animate-pulse" />
            <span>Connecting...</span>
          </div>
        )}

        {children}
      </>
    );
  }

  // Full replacement mode - show fallback or default error UI
  if (isError || isDisconnected) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 mb-4 text-blood-red">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-western text-wood-dark mb-2">
            {isError ? 'Connection Error' : 'Disconnected'}
          </h3>

          <p className="text-wood-grain mb-4 max-w-sm">
            {isError
              ? 'Unable to connect to the server. Please check your internet connection.'
              : 'Connection to the server was interrupted.'}
          </p>

          <button
            onClick={handleRetry}
            disabled={isConnecting}
            className={`px-6 py-2 font-semibold rounded-lg transition-colors ${
              isConnecting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gold-medium text-wood-dark hover:bg-gold-light'
            }`}
          >
            {isConnecting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Reconnecting...
              </span>
            ) : (
              'Try Again'
            )}
          </button>
        </div>
    );
  }

  // Connecting state
  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 mb-4 text-gold-medium animate-spin">
          <svg fill="none" viewBox="0 0 24 24" className="w-full h-full">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <p className="text-wood-grain">Connecting to server...</p>
      </div>
    );
  }

  // Default fallback
  return <>{children}</>;
}

export default SocketErrorBoundary;
