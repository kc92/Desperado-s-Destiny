/**
 * Socket.io Client Service
 *
 * Singleton service for managing WebSocket connections to the chat server
 */

import { io, Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@desperados/shared';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

type StatusCallback = (status: ConnectionStatus) => void;

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
    return import.meta.env.VITE_SOCKET_URL || window.location.origin;
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
      this.updateStatus('disconnected');

      if (reason === 'io server disconnect') {
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      this.updateStatus('error');
    });

    this.socket.io.on('reconnect_attempt', (attempt) => {
      this._reconnectAttempts = attempt;

      if (attempt >= this.maxReconnectAttempts) {
        this.socket?.disconnect();
        this.updateStatus('error');
      }
    });

    this.socket.io.on('reconnect', (attempt) => {
      this._reconnectAttempts = 0;
      this.updateStatus('connected');
    });

    this.socket.io.on('reconnect_failed', () => {
      this.updateStatus('error');
    });
  }

  /**
   * Connect to the socket server
   */
  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.updateStatus('connecting');

    const socketUrl = this.getSocketUrl();

    this.socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 10000,
    });

    this.setupListeners();
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
   * Emit a socket event
   */
  emit<E extends keyof ClientToServerEvents>(
    event: E,
    ...args: Parameters<ClientToServerEvents[E]>
  ): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit(event, ...args);
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
