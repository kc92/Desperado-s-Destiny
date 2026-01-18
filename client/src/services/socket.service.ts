/**
 * Socket.io Client Service
 *
 * Singleton service for managing WebSocket connections to the chat server.
 * Includes enhanced error handling, reconnection with exponential backoff,
 * and proper status reporting.
 */

import { io, Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@desperados/shared';
import { logger } from '@/services/logger.service';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

type StatusCallback = (status: ConnectionStatus) => void;

/**
 * Result of an emit operation
 */
export interface EmitResult {
  success: boolean;
  error?: string;
}

/**
 * Disconnect reasons that should trigger auto-reconnect
 */
const AUTO_RECONNECT_REASONS = [
  'io server disconnect',
  'transport close',
  'transport error',
  'ping timeout',
];

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private statusCallbacks: Set<StatusCallback> = new Set();
  private currentStatus: ConnectionStatus = 'disconnected';
  // @ts-ignore used only for logging
  private _reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;

  /**
   * Get the socket URL based on environment
   */
  private getSocketUrl(): string {
    // In development, use empty string to connect to same origin (proxy handles it)
    // In production, use the configured URL or same origin
    if (import.meta.env.DEV) {
      return ''; // Use proxy in development
    }
    return import.meta.env.VITE_WS_URL || window.location.origin;
  }

  /**
   * Update connection status and notify callbacks
   */
  private updateStatus(status: ConnectionStatus): void {
    this.currentStatus = status;
    this.statusCallbacks.forEach((callback) => callback(status));
  }

  /**
   * Set up socket event listeners
   */
  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this._reconnectAttempts = 0;
      this.updateStatus('connected');
    });

    this.socket.on('disconnect', (reason) => {
      logger.info('[Socket] Disconnected', { reason });
      this.updateStatus('disconnected');

      // Auto-reconnect for recoverable disconnect reasons
      if (AUTO_RECONNECT_REASONS.includes(reason)) {
        logger.info('[Socket] Attempting auto-reconnect', { reason });
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      logger.error('[Socket] Connection error', error as Error, { context: 'socketService.connect_error' });
      this.updateStatus('error');
    });

    this.socket.io.on('reconnect_attempt', (attempt) => {
      this._reconnectAttempts = attempt;

      if (attempt >= this.maxReconnectAttempts) {
        this.socket?.disconnect();
        this.updateStatus('error');
      }
    });

    this.socket.io.on('reconnect', (_attempt) => {
      this._reconnectAttempts = 0;
      this.updateStatus('connected');
    });

    this.socket.io.on('reconnect_failed', () => {
      this.updateStatus('error');
    });
  }

  /**
   * Connect to the socket server
   * PRODUCTION FIX: Returns a Promise for proper async handling
   * @param timeoutMs - Connection timeout in milliseconds (default 10000)
   * @returns Promise that resolves when connected or rejects on error/timeout
   */
  connect(timeoutMs = 10000): Promise<void> {
    // Already connected - resolve immediately
    if (this.socket?.connected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.updateStatus('connecting');

      const socketUrl = this.getSocketUrl();

      this.socket = io(socketUrl, {
        withCredentials: true,
        // Start with polling (more reliable through proxies), then upgrade to websocket
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 10000,
      });

      // Set up connection timeout
      const timeout = setTimeout(() => {
        cleanup();
        this.updateStatus('error');
        reject(new Error('Socket connection timeout'));
      }, timeoutMs);

      // Track cleanup for one-time listeners
      const cleanup = () => {
        clearTimeout(timeout);
        this.socket?.off('connect', onConnect);
        this.socket?.off('connect_error', onError);
      };

      const onConnect = () => {
        cleanup();
        // setupListeners will handle ongoing connect events
        resolve();
      };

      const onError = (error: Error) => {
        cleanup();
        reject(error);
      };

      // One-time listeners for initial connection
      this.socket.once('connect', onConnect);
      this.socket.once('connect_error', onError);

      // Set up persistent listeners for reconnection handling
      this.setupListeners();
    });
  }

  /**
   * Disconnect from the socket server
   */
  disconnect(): void {
    if (!this.socket) return;

    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
    this._reconnectAttempts = 0;
    this.updateStatus('disconnected');
  }

  /**
   * Subscribe to a socket event
   */
  on<E extends keyof ServerToClientEvents>(
    event: E,
    callback: ServerToClientEvents[E]
  ): void {
    if (!this.socket) {
      return;
    }

    this.socket.on(event, callback as any);
  }

  /**
   * Unsubscribe from a socket event
   */
  off<E extends keyof ServerToClientEvents>(
    event: E,
    callback?: ServerToClientEvents[E]
  ): void {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback as any);
    } else {
      this.socket.off(event);
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(attempt = 1): void {
    const maxAttempts = this.maxReconnectAttempts;
    const baseDelay = this.reconnectDelay;
    const maxDelay = 30000; // 30 seconds max

    if (attempt > maxAttempts) {
      logger.error('[Socket] Max reconnect attempts reached', new Error('Max reconnect attempts'), {
        attempts: attempt - 1,
      });
      this.updateStatus('error');
      return;
    }

    // Exponential backoff with jitter
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    const jitter = Math.random() * 1000;
    const actualDelay = delay + jitter;

    logger.info('[Socket] Scheduling reconnect', { attempt, delay: actualDelay });

    setTimeout(() => {
      // Don't reconnect if already connected or status changed
      if (this.socket?.connected) {
        logger.info('[Socket] Already reconnected, skipping attempt');
        return;
      }

      logger.info('[Socket] Attempting reconnect', { attempt });
      this.socket?.connect();

      // Check connection after a short delay
      setTimeout(() => {
        if (!this.socket?.connected) {
          this.attemptReconnect(attempt + 1);
        }
      }, 2000);
    }, actualDelay);
  }

  /**
   * Emit a socket event with success/failure indication
   * Returns false if socket is not connected
   */
  emit<E extends keyof ClientToServerEvents>(
    event: E,
    ...args: Parameters<ClientToServerEvents[E]>
  ): boolean {
    if (!this.socket?.connected) {
      logger.warn('[Socket] Cannot emit - not connected', { event });
      return false;
    }

    try {
      this.socket.emit(event, ...args);
      return true;
    } catch (error) {
      logger.error('[Socket] Emit failed', error as Error, { event });
      return false;
    }
  }

  /**
   * Emit with callback for acknowledgment-based responses
   * Use for operations that need confirmation
   */
  emitWithAck<E extends keyof ClientToServerEvents>(
    event: E,
    args: Parameters<ClientToServerEvents[E]>[0],
    callback: (error: Error | null, response?: any) => void,
    timeoutMs = 10000
  ): boolean {
    if (!this.socket?.connected) {
      callback(new Error('Socket not connected'));
      return false;
    }

    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      callback(new Error('Socket operation timed out'));
    }, timeoutMs);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.socket.emit as any)(event, args, (response: any) => {
        if (timedOut) return;

        clearTimeout(timeoutId);

        if (response?.error) {
          callback(new Error(response.error));
        } else {
          callback(null, response);
        }
      });
      return true;
    } catch (error) {
      clearTimeout(timeoutId);
      callback(error as Error);
      return false;
    }
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return this.currentStatus;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Wait for socket connection with timeout
   * PRODUCTION FIX: Allows async code to wait for connection before proceeding
   * @param timeoutMs - Maximum time to wait for connection (default 5000ms)
   * @returns Promise that resolves to true if connected, false if timeout
   */
  waitForConnection(timeoutMs = 5000): Promise<boolean> {
    // Already connected
    if (this.socket?.connected) {
      return Promise.resolve(true);
    }

    // If status is error, don't wait
    if (this.currentStatus === 'error') {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, timeoutMs);

      const unsubscribe = this.onStatusChange((status) => {
        if (status === 'connected') {
          clearTimeout(timeout);
          unsubscribe();
          resolve(true);
        } else if (status === 'error') {
          clearTimeout(timeout);
          unsubscribe();
          resolve(false);
        }
      });

      // If socket exists but not connected, trigger reconnect
      if (this.socket && !this.socket.connected && this.currentStatus === 'disconnected') {
        this.socket.connect();
      }
    });
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(callback: StatusCallback): () => void {
    this.statusCallbacks.add(callback);

    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  /**
   * Get the socket instance (use with caution)
   */
  getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
