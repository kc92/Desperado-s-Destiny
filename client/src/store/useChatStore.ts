/**
 * Chat Store
 *
 * Zustand store for managing chat state and real-time updates
 *
 * IMPORTANT: Uses initialization ID tracking to prevent StrictMode
 * double-invocation from creating duplicate socket listeners.
 */

import { create } from 'zustand';
import {
  RoomType,
  MessageType,
} from '@desperados/shared';
import type {
  ChatMessage,
  OnlineUser,
  WhisperConversation,
  ChatSettings,
  ServerToClientEvents,
} from '@desperados/shared';
import { socketService } from '@/services/socket.service';
import { logger } from '@/services/logger.service';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Message delivery status for optimistic updates
 */
type MessageStatus = 'pending' | 'sent' | 'failed';

/**
 * Extended chat message with client-side status for optimistic updates
 */
export interface ClientChatMessage extends ChatMessage {
  /** Client-generated ID for tracking pending messages */
  _clientId?: string;
  /** Message delivery status */
  _status?: MessageStatus;
  /** Error message if delivery failed */
  _error?: string;
}

interface ActiveRoom {
  type: RoomType;
  id: string;
}

interface ChatState {
  // Messages indexed by room key: `${roomType}-${roomId}`
  messages: Map<string, ClientChatMessage[]>;

  // Pending message timeouts for optimistic updates
  _pendingTimeouts: Map<string, NodeJS.Timeout>;

  // Active room
  activeRoom: ActiveRoom | null;

  // Online users per room
  onlineUsers: Map<string, OnlineUser[]>;

  // Typing indicators per room: Map<roomKey, username[]>
  typingUsers: Map<string, string[]>;

  // Typing debounce timers - stored in state to prevent memory leaks
  // Key format: `${roomKey}-${username}` or `self-${roomKey}`
  _typingTimers: Map<string, NodeJS.Timeout>;

  // Unread counts per room
  unreadCounts: Map<string, number>;

  // Whisper conversations
  whispers: Map<string, WhisperConversation>;

  // Connection status
  connectionStatus: ConnectionStatus;

  // Mute status
  mutedUntil: Date | null;

  // Loading states
  isLoadingHistory: boolean;
  isSendingMessage: boolean;

  // Error
  error: string | null;

  // Settings
  settings: ChatSettings;

  // Initialization tracking to prevent StrictMode duplicate listeners
  _initialized: boolean;
  _initializationId: string | null;

  // Actions
  initialize: () => void;
  cleanup: () => void;
  joinRoom: (type: RoomType, id: string) => Promise<void>;
  leaveRoom: (type: RoomType, id: string) => void;
  sendMessage: (content: string, recipientId?: string) => Promise<void>;
  retrySendMessage: (clientId: string) => Promise<void>;
  fetchHistory: (limit?: number, offset?: number) => Promise<void>;
  markAsRead: (type: RoomType, id: string) => void;
  setTyping: (isTyping: boolean) => void;
  reportMessage: (messageId: string, reason: string) => Promise<void>;
  updateSettings: (settings: Partial<ChatSettings>) => void;
  getOnlineUsers: (type: RoomType, id: string) => Promise<void>;
  openWhisper: (userId: string, username: string, faction: string) => void;
  closeWhisper: (userId: string) => void;
  clearError: () => void;
  confirmMessage: (clientId: string, serverMessage: ChatMessage) => void;
  failMessage: (clientId: string, error: string) => void;
}

const SETTINGS_STORAGE_KEY = 'chat_settings';

const defaultSettings: ChatSettings = {
  soundEnabled: true,
  browserNotificationsEnabled: false,
  notificationVolume: 50,
  showTypingIndicators: true,
  timestampFormat: 'relative',
  profanityFilterEnabled: false,
  showOnlineUsers: true,
  fontSize: 'medium',
  isMinimized: true, // Default to minimized so chat doesn't cover page content
};

/**
 * Load settings from localStorage
 */
const loadSettings = (): ChatSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (error) {
    logger.error('Failed to load chat settings from localStorage', error as Error);
  }
  return defaultSettings;
};

/**
 * Save settings to localStorage
 */
const saveSettings = (settings: ChatSettings): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    logger.error('Failed to save chat settings to localStorage', error as Error);
  }
};

/**
 * Get room key for indexing
 */
const getRoomKey = (type: RoomType, id: string): string => `${type}-${id}`;

/**
 * Track registered socket listeners for cleanup
 * This prevents memory leaks from unremoved event listeners
 */
interface RegisteredListener {
  event: keyof ServerToClientEvents;
  handler: (...args: any[]) => void;
}
const registeredListeners: RegisteredListener[] = [];

/**
 * Helper to register socket listener and track it for cleanup
 */
const addTrackedListener = <E extends keyof ServerToClientEvents>(
  event: E,
  handler: (...args: any[]) => void
): void => {
  socketService.on(event, handler as ServerToClientEvents[E]);
  registeredListeners.push({ event, handler });
};

/**
 * Helper to unregister all tracked socket listeners
 */
const removeAllTrackedListeners = (): void => {
  registeredListeners.forEach(({ event, handler }) => {
    socketService.off(event, handler as ServerToClientEvents[typeof event]);
  });
  registeredListeners.length = 0; // Clear the array
};

/**
 * Play notification sound
 */
const playSound = (type: 'message' | 'whisper' | 'mention', volume: number): void => {
  if (volume === 0) return;

  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = volume / 100;
  audio.play().catch((error) => {
    logger.warn('Failed to play chat sound', { type, volume, error: error.message });
  });
};

/**
 * Show browser notification
 */
const showNotification = (title: string, body: string): void => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    });
  }
};

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  messages: new Map(),
  _pendingTimeouts: new Map(),
  activeRoom: null,
  onlineUsers: new Map(),
  typingUsers: new Map(),
  _typingTimers: new Map(),
  unreadCounts: new Map(),
  whispers: new Map(),
  connectionStatus: 'disconnected',
  mutedUntil: null,
  isLoadingHistory: false,
  isSendingMessage: false,
  error: null,
  settings: loadSettings(),
  _initialized: false,
  _initializationId: null,

  /**
   * Initialize chat system
   * Uses initialization ID tracking to prevent StrictMode duplicate listeners
   */
  initialize: () => {
    const state = get();

    // Already initialized and connected - skip
    if (state._initialized && state.connectionStatus !== 'disconnected') {
      logger.debug('Chat already initialized, skipping');
      return;
    }

    // Generate unique initialization ID for this call
    const initId = crypto.randomUUID();
    set({ _initializationId: initId });

    // Clean up any existing listeners first (handles StrictMode re-runs)
    removeAllTrackedListeners();

    // Check if we're still the active initialization (another init might have started)
    if (get()._initializationId !== initId) {
      logger.debug('Chat initialization superseded by another call, aborting');
      return;
    }

    socketService.onStatusChange((status) => {
      set({ connectionStatus: status });
    });

    // Set initial connection status (callback only fires on CHANGES, not initial state)
    set({ connectionStatus: socketService.getConnectionStatus() });

    // Ensure socket is connected (backup in case auth store didn't connect)
    // This handles edge cases where checkAuth() doesn't complete
    if (!socketService.isConnected()) {
      socketService.connect().catch((error) => {
        logger.warn('Chat socket connection failed, will retry on room join', { error });
      });
    }

    // Use tracked listeners to prevent memory leaks

    addTrackedListener('chat:message', (message) => {
      const roomKey = getRoomKey(message.roomType, message.roomId);
      const currentState = get();
      const messages = new Map(currentState.messages);
      const roomMessages = messages.get(roomKey) || [];

      // Check if this message confirms a pending optimistic message
      // The server may include _clientId if we sent it, or we match by content
      const messageWithClientId = message as ChatMessage & { _clientId?: string };
      const clientId = messageWithClientId._clientId;

      if (clientId) {
        // Server echoed back our clientId - confirm the pending message
        const pendingIndex = roomMessages.findIndex(
          m => (m as ClientChatMessage)._clientId === clientId && (m as ClientChatMessage)._status === 'pending'
        );

        if (pendingIndex !== -1) {
          // Replace pending message with confirmed server message
          const updatedMessages = [...roomMessages];
          updatedMessages[pendingIndex] = {
            ...message,
            _clientId: clientId,
            _status: 'sent',
          } as ClientChatMessage;
          messages.set(roomKey, updatedMessages);

          // Clear the timeout
          const pendingTimeouts = new Map(currentState._pendingTimeouts);
          const timeoutId = pendingTimeouts.get(clientId);
          if (timeoutId) {
            clearTimeout(timeoutId);
            pendingTimeouts.delete(clientId);
          }

          set({ messages, _pendingTimeouts: pendingTimeouts });
          return; // Don't add as new message, we updated the pending one
        }
      }

      // Check for duplicates (using server ID)
      const isDuplicate = roomMessages.some((m) => m._id === message._id);
      if (!isDuplicate) {
        messages.set(roomKey, [...roomMessages, message as ClientChatMessage]);
      }

      const activeRoom = currentState.activeRoom;
      const isActiveRoom =
        activeRoom?.type === message.roomType && activeRoom?.id === message.roomId;

      const unreadCounts = new Map(currentState.unreadCounts);
      if (!isActiveRoom) {
        const currentCount = unreadCounts.get(roomKey) || 0;
        unreadCounts.set(roomKey, currentCount + 1);

        const { settings } = currentState;
        if (settings.soundEnabled) {
          const soundType = message.type === 'whisper' ? 'whisper' :
                           message.mentions?.length ? 'mention' : 'message';
          playSound(soundType, settings.notificationVolume);
        }

        if (settings.browserNotificationsEnabled) {
          const title = message.type === 'whisper'
            ? `Whisper from ${message.senderName}`
            : `${message.senderName} in ${message.roomType}`;
          showNotification(title, message.content);
        }
      }

      set({ messages, unreadCounts });
    });

    addTrackedListener('chat:history', (data) => {
      const roomKey = getRoomKey(data.roomType, data.roomId);
      const currentState = get(); // Use current state, not stale closure state
      const messages = new Map(currentState.messages);
      const existingMessages = messages.get(roomKey) || [];

      const newMessages = [...data.messages, ...existingMessages];
      const uniqueMessages = Array.from(
        new Map(newMessages.map((m) => [m._id, m])).values()
      );

      messages.set(roomKey, uniqueMessages);

      set({ messages, isLoadingHistory: false });
    });

    addTrackedListener('chat:typing', (data) => {
      const roomKey = getRoomKey(data.roomType, data.roomId);
      const currentState = get(); // Use current state, not stale closure state
      const typingUsers = new Map(currentState.typingUsers);
      const typingTimers = new Map(currentState._typingTimers);
      const roomTyping = typingUsers.get(roomKey) || [];
      const timerKey = `${roomKey}-${data.username}`;

      if (data.isTyping) {
        if (!roomTyping.includes(data.username)) {
          typingUsers.set(roomKey, [...roomTyping, data.username]);
        }

        // Clear existing timer if any
        const existingTimer = typingTimers.get(timerKey);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        // Set new timer to remove typing indicator after 3 seconds
        const timer = setTimeout(() => {
          const latestState = get();
          const updatedTypingUsers = new Map(latestState.typingUsers);
          const updatedTimers = new Map(latestState._typingTimers);
          const current = updatedTypingUsers.get(roomKey) || [];
          updatedTypingUsers.set(roomKey, current.filter((u) => u !== data.username));
          updatedTimers.delete(timerKey);
          set({ typingUsers: updatedTypingUsers, _typingTimers: updatedTimers });
        }, 3000);

        typingTimers.set(timerKey, timer);
        set({ typingUsers, _typingTimers: typingTimers });
      } else {
        // User stopped typing - clear timer and remove from list
        const existingTimer = typingTimers.get(timerKey);
        if (existingTimer) {
          clearTimeout(existingTimer);
          typingTimers.delete(timerKey);
        }
        typingUsers.set(roomKey, roomTyping.filter((u) => u !== data.username));
        set({ typingUsers, _typingTimers: typingTimers });
      }
    });

    addTrackedListener('chat:user_joined', (data) => {
      const roomKey = getRoomKey(data.roomType, data.roomId);
      const currentState = get(); // Use current state, not stale closure state
      const onlineUsers = new Map(currentState.onlineUsers);
      const roomUsers = onlineUsers.get(roomKey) || [];

      if (!roomUsers.find((u) => u.userId === data.user.userId)) {
        onlineUsers.set(roomKey, [...roomUsers, data.user]);
        set({ onlineUsers });
      }
    });

    addTrackedListener('chat:user_left', (data) => {
      const roomKey = getRoomKey(data.roomType, data.roomId);
      const currentState = get(); // Use current state, not stale closure state
      const onlineUsers = new Map(currentState.onlineUsers);
      const roomUsers = onlineUsers.get(roomKey) || [];

      onlineUsers.set(roomKey, roomUsers.filter((u) => u.userId !== data.userId));
      set({ onlineUsers });
    });

    addTrackedListener('chat:online_users', (data) => {
      const roomKey = getRoomKey(data.roomType, data.roomId);
      const currentState = get(); // Use current state, not stale closure state
      const onlineUsers = new Map(currentState.onlineUsers);
      onlineUsers.set(roomKey, data.users);
      set({ onlineUsers });
    });

    addTrackedListener('user:online', (user) => {
      const currentState = get(); // Use current state, not stale closure state
      const whispers = new Map(currentState.whispers);
      const whisper = whispers.get(user.userId);
      if (whisper) {
        whispers.set(user.userId, { ...whisper, isOnline: true });
        set({ whispers });
      }
    });

    addTrackedListener('user:offline', (data) => {
      const currentState = get(); // Use current state, not stale closure state
      const whispers = new Map(currentState.whispers);
      const whisper = whispers.get(data.userId);
      if (whisper) {
        whispers.set(data.userId, { ...whisper, isOnline: false });
        set({ whispers });
      }
    });

    addTrackedListener('chat:error', (error) => {
      logger.error('Chat socket error', new Error(error.message), { error });
      set({ error: error.message });
    });

    addTrackedListener('rate_limit_exceeded', (data) => {
      const mutedUntil = new Date(Date.now() + data.retryAfter * 1000);
      set({ mutedUntil, error: `Rate limited. Try again in ${data.retryAfter}s` });

      setTimeout(() => {
        set({ mutedUntil: null });
      }, data.retryAfter * 1000);
    });

    addTrackedListener('chat:muted', (data) => {
      set({
        mutedUntil: new Date(data.mutedUntil),
        error: `You have been muted: ${data.reason}`,
      });
    });

    // Mark as initialized
    set({ _initialized: true });
    logger.debug('Chat system initialized', { initId });
  },

  /**
   * Cleanup chat system
   * Properly removes socket listeners but DOES NOT disconnect socket
   * Socket should remain connected for the session - managed by auth store
   */
  cleanup: () => {
    const state = get();

    logger.debug('Cleaning up chat system listeners', { initId: state._initializationId });

    // Clear all typing timers from store state
    state._typingTimers.forEach((timer) => clearTimeout(timer));

    // Remove all tracked socket listeners to prevent memory leaks
    removeAllTrackedListeners();

    // NOTE: Do NOT disconnect socket here - it should persist across navigation
    // Socket connection is managed by auth store at app level
    // Only disconnect when user logs out

    // Reset chat state but keep messages/whispers for UX continuity
    set({
      activeRoom: null,
      typingUsers: new Map(),
      _typingTimers: new Map(), // Clear timers map
      isLoadingHistory: false,
      isSendingMessage: false,
      error: null,
      _initialized: false,
      _initializationId: null,
    });
  },

  /**
   * Join a chat room
   */
  joinRoom: async (type: RoomType, id: string) => {
    const state = get();

    // PRODUCTION FIX: Wait for socket connection instead of failing immediately
    if (!socketService.isConnected()) {
      const connected = await socketService.waitForConnection(5000);
      if (!connected) {
        set({ error: 'Connection timeout - please refresh' });
        throw new Error('Connection timeout');
      }
    }

    if (state.activeRoom?.type === type && state.activeRoom?.id === id) {
      return;
    }

    if (state.activeRoom) {
      socketService.emit('chat:leave_room', {
        roomType: state.activeRoom.type,
        roomId: state.activeRoom.id,
      });
    }

    set({ activeRoom: { type, id }, isLoadingHistory: true });

    socketService.emit('chat:join_room', { roomType: type, roomId: id });

    await get().fetchHistory();
    get().markAsRead(type, id);
    await get().getOnlineUsers(type, id);
  },

  /**
   * Leave a chat room
   */
  leaveRoom: (type: RoomType, id: string) => {
    const state = get();

    socketService.emit('chat:leave_room', { roomType: type, roomId: id });

    if (state.activeRoom?.type === type && state.activeRoom?.id === id) {
      set({ activeRoom: null });
    }
  },

  /**
   * Send a message with optimistic update
   */
  sendMessage: async (content: string, recipientId?: string) => {
    const state = get();

    if (!state.activeRoom && !recipientId) {
      set({ error: 'No active room' });
      throw new Error('No active room');
    }

    if (!content.trim()) {
      set({ error: 'Message cannot be empty' });
      throw new Error('Message cannot be empty');
    }

    if (content.length > 500) {
      set({ error: 'Message too long (max 500 characters)' });
      throw new Error('Message too long');
    }

    if (state.mutedUntil && new Date() < state.mutedUntil) {
      const remainingTime = Math.ceil((state.mutedUntil.getTime() - Date.now()) / 1000);
      set({ error: `You are muted for ${remainingTime} more seconds` });
      throw new Error('User is muted');
    }

    // Validate activeRoom is present when needed
    if (!recipientId && !state.activeRoom) {
      set({ error: 'No active room selected' });
      throw new Error('No active room selected');
    }

    const roomType = state.activeRoom?.type ?? RoomType.WHISPER;
    const roomId = recipientId || state.activeRoom?.id || '';
    const trimmedContent = content.trim();

    // Generate client ID for tracking this message
    const clientId = `pending-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create optimistic message (will be updated when server confirms)
    const optimisticMessage: ClientChatMessage = {
      _id: clientId, // Temporary ID, replaced when server confirms
      _clientId: clientId,
      _status: 'pending',
      roomType,
      roomId,
      type: recipientId ? MessageType.WHISPER : MessageType.CHAT,
      senderId: 'pending', // Will be filled by server
      senderName: 'You', // Placeholder, shown while pending
      senderFaction: 'settler', // Placeholder
      content: trimmedContent,
      recipientId,
      createdAt: new Date(),
    };

    // Add optimistic message to UI immediately
    const messages = new Map(state.messages);
    const roomKey = getRoomKey(roomType, roomId);
    const roomMessages = messages.get(roomKey) || [];
    messages.set(roomKey, [...roomMessages, optimisticMessage]);

    set({ messages, isSendingMessage: true, error: null });

    // Set timeout to mark as failed if not confirmed within 10 seconds
    const timeoutId = setTimeout(() => {
      get().failMessage(clientId, 'Message delivery timed out');
    }, 10000);

    // Track the timeout so we can clear it on confirmation
    const pendingTimeouts = new Map(state._pendingTimeouts);
    pendingTimeouts.set(clientId, timeoutId);
    set({ _pendingTimeouts: pendingTimeouts });

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const emitSuccess = (socketService.emit as any)('chat:send_message', {
        roomType,
        roomId,
        content: trimmedContent,
        recipientId,
        _clientId: clientId, // Include clientId for message confirmation
      });

      if (!emitSuccess) {
        // Socket not connected, fail immediately
        get().failMessage(clientId, 'Not connected to server');
      }

      set({ isSendingMessage: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      get().failMessage(clientId, message);
      set({ isSendingMessage: false, error: message });
      throw error;
    }
  },

  /**
   * Retry sending a failed message
   */
  retrySendMessage: async (clientId: string) => {
    const state = get();

    // Find the failed message
    let failedMessage: ClientChatMessage | null = null;
    let roomKey: string | null = null;

    for (const [key, roomMessages] of state.messages) {
      const msg = roomMessages.find(m => m._clientId === clientId && m._status === 'failed');
      if (msg) {
        failedMessage = msg;
        roomKey = key;
        break;
      }
    }

    if (!failedMessage || !roomKey) {
      logger.warn('Failed message not found for retry', { clientId });
      return;
    }

    // Update status to pending
    const messages = new Map(state.messages);
    const roomMessages = messages.get(roomKey) || [];
    const updatedMessages = roomMessages.map(m =>
      m._clientId === clientId ? { ...m, _status: 'pending' as MessageStatus, _error: undefined } : m
    );
    messages.set(roomKey, updatedMessages);
    set({ messages });

    // Set new timeout
    const timeoutId = setTimeout(() => {
      get().failMessage(clientId, 'Message delivery timed out');
    }, 10000);

    const pendingTimeouts = new Map(state._pendingTimeouts);
    pendingTimeouts.set(clientId, timeoutId);
    set({ _pendingTimeouts: pendingTimeouts });

    // Retry sending
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const emitSuccess = (socketService.emit as any)('chat:send_message', {
      roomType: failedMessage.roomType,
      roomId: failedMessage.roomId,
      content: failedMessage.content,
      recipientId: failedMessage.recipientId,
      _clientId: clientId, // Include clientId for message confirmation
    });

    if (!emitSuccess) {
      get().failMessage(clientId, 'Not connected to server');
    }
  },

  /**
   * Confirm a pending message with server data
   */
  confirmMessage: (clientId: string, serverMessage: ChatMessage) => {
    const state = get();

    // Clear timeout
    const pendingTimeouts = new Map(state._pendingTimeouts);
    const timeoutId = pendingTimeouts.get(clientId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      pendingTimeouts.delete(clientId);
    }

    // Find and update the pending message
    const messages = new Map(state.messages);
    let messageUpdated = false;

    for (const [roomKey, roomMessages] of messages) {
      const index = roomMessages.findIndex(m => m._clientId === clientId);
      if (index !== -1) {
        const updatedMessages = [...roomMessages];
        // Replace with server message but keep client tracking fields
        updatedMessages[index] = {
          ...serverMessage,
          _clientId: clientId,
          _status: 'sent' as MessageStatus,
        };
        messages.set(roomKey, updatedMessages);
        messageUpdated = true;
        break;
      }
    }

    if (messageUpdated) {
      set({ messages, _pendingTimeouts: pendingTimeouts });
    }
  },

  /**
   * Mark a pending message as failed
   */
  failMessage: (clientId: string, error: string) => {
    const state = get();

    // Clear timeout
    const pendingTimeouts = new Map(state._pendingTimeouts);
    const timeoutId = pendingTimeouts.get(clientId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      pendingTimeouts.delete(clientId);
    }

    // Find and update the pending message
    const messages = new Map(state.messages);

    for (const [roomKey, roomMessages] of messages) {
      const index = roomMessages.findIndex(m => m._clientId === clientId && m._status === 'pending');
      if (index !== -1) {
        const updatedMessages = [...roomMessages];
        updatedMessages[index] = {
          ...updatedMessages[index],
          _status: 'failed' as MessageStatus,
          _error: error,
        };
        messages.set(roomKey, updatedMessages);
        break;
      }
    }

    set({ messages, _pendingTimeouts: pendingTimeouts, isSendingMessage: false });
    logger.warn('Message send failed', { clientId, error });
  },

  /**
   * Fetch message history
   */
  fetchHistory: async (limit = 50, offset = 0) => {
    const state = get();

    if (!state.activeRoom) {
      throw new Error('No active room');
    }

    set({ isLoadingHistory: true, error: null });

    try {
      socketService.emit('chat:fetch_history', {
        roomType: state.activeRoom.type,
        roomId: state.activeRoom.id,
        limit,
        offset,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch history';
      set({ isLoadingHistory: false, error: message });
      throw error;
    }
  },

  /**
   * Mark messages as read
   */
  markAsRead: (type: RoomType, id: string) => {
    const roomKey = getRoomKey(type, id);
    const unreadCounts = new Map(get().unreadCounts);
    unreadCounts.set(roomKey, 0);
    set({ unreadCounts });

    socketService.emit('chat:mark_read', { roomType: type, roomId: id });
  },

  /**
   * Set typing indicator
   */
  setTyping: (isTyping: boolean) => {
    const state = get();

    if (!state.activeRoom) return;

    const roomKey = getRoomKey(state.activeRoom.type, state.activeRoom.id);
    const timerKey = `self-${roomKey}`;
    const typingTimers = new Map(state._typingTimers);

    // Clear existing timer if any
    const existingTimer = typingTimers.get(timerKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
      typingTimers.delete(timerKey);
    }

    socketService.emit('chat:typing', {
      roomType: state.activeRoom.type,
      roomId: state.activeRoom.id,
      isTyping,
    });

    if (isTyping) {
      // Set timer to automatically stop typing after 3 seconds
      const timer = setTimeout(() => {
        get().setTyping(false);
      }, 3000);

      typingTimers.set(timerKey, timer);
    }

    set({ _typingTimers: typingTimers });
  },

  /**
   * Report a message
   */
  reportMessage: async (messageId: string, reason: string) => {
    set({ error: null });

    try {
      socketService.emit('chat:report', { messageId, reason });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to report message';
      set({ error: message });
      throw error;
    }
  },

  /**
   * Update chat settings
   */
  updateSettings: (newSettings: Partial<ChatSettings>) => {
    const settings = { ...get().settings, ...newSettings };
    saveSettings(settings);
    set({ settings });

    if (settings.browserNotificationsEnabled && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  },

  /**
   * Get online users in a room
   */
  getOnlineUsers: async (type: RoomType, id: string) => {
    socketService.emit('chat:get_online_users', { roomType: type, roomId: id });
  },

  /**
   * Open a whisper conversation
   */
  openWhisper: (userId: string, username: string, faction: string) => {
    const whispers = new Map(get().whispers);

    if (!whispers.has(userId)) {
      whispers.set(userId, {
        userId,
        username,
        faction: faction as 'settler' | 'nahi' | 'frontera',
        isOnline: true,
        unreadCount: 0,
        lastActivityAt: new Date(),
      });

      set({ whispers });
    }

    get().joinRoom('whisper' as RoomType, userId);
  },

  /**
   * Close a whisper conversation
   */
  closeWhisper: (userId: string) => {
    const whispers = new Map(get().whispers);
    whispers.delete(userId);
    set({ whispers });

    const state = get();
    if (state.activeRoom?.type === 'whisper' && state.activeRoom?.id === userId) {
      set({ activeRoom: null });
    }

    get().leaveRoom('whisper' as RoomType, userId);
  },

  /**
   * Clear error
   */
  clearError: () => {
    set({ error: null });
  },
}));
