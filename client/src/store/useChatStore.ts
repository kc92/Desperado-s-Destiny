/**
 * Chat Store
 *
 * Zustand store for managing chat state and real-time updates
 */

import { create } from 'zustand';
import type {
  ChatMessage,
  RoomType,
  OnlineUser,
  WhisperConversation,
  ChatSettings,
} from '@desperados/shared';
import { socketService } from '@/services/socket.service';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface ActiveRoom {
  type: RoomType;
  id: string;
}

interface ChatState {
  // Messages indexed by room key: `${roomType}-${roomId}`
  messages: Map<string, ChatMessage[]>;

  // Active room
  activeRoom: ActiveRoom | null;

  // Online users per room
  onlineUsers: Map<string, OnlineUser[]>;

  // Typing indicators per room: Map<roomKey, username[]>
  typingUsers: Map<string, string[]>;

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

  // Actions
  initialize: () => void;
  cleanup: () => void;
  joinRoom: (type: RoomType, id: string) => Promise<void>;
  leaveRoom: (type: RoomType, id: string) => void;
  sendMessage: (content: string, recipientId?: string) => Promise<void>;
  fetchHistory: (limit?: number, offset?: number) => Promise<void>;
  markAsRead: (type: RoomType, id: string) => void;
  setTyping: (isTyping: boolean) => void;
  reportMessage: (messageId: string, reason: string) => Promise<void>;
  updateSettings: (settings: Partial<ChatSettings>) => void;
  getOnlineUsers: (type: RoomType, id: string) => Promise<void>;
  openWhisper: (userId: string, username: string, faction: string) => void;
  closeWhisper: (userId: string) => void;
  clearError: () => void;
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
    console.error('[Chat] Failed to load settings:', error);
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
    console.error('[Chat] Failed to save settings:', error);
  }
};

/**
 * Get room key for indexing
 */
const getRoomKey = (type: RoomType, id: string): string => `${type}-${id}`;

/**
 * Typing debounce timers
 */
const typingTimers = new Map<string, NodeJS.Timeout>();

/**
 * Play notification sound
 */
const playSound = (type: 'message' | 'whisper' | 'mention', volume: number): void => {
  if (volume === 0) return;

  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.volume = volume / 100;
  audio.play().catch((error) => {
    console.warn('[Chat] Failed to play sound:', error);
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
  activeRoom: null,
  onlineUsers: new Map(),
  typingUsers: new Map(),
  unreadCounts: new Map(),
  whispers: new Map(),
  connectionStatus: 'disconnected',
  mutedUntil: null,
  isLoadingHistory: false,
  isSendingMessage: false,
  error: null,
  settings: loadSettings(),

  /**
   * Initialize chat system
   */
  initialize: () => {
    const state = get();

    if (socketService.isConnected()) {
      return;
    }

    socketService.onStatusChange((status) => {
      set({ connectionStatus: status });
    });

    socketService.connect();

    socketService.on('chat:message', (message) => {
      const roomKey = getRoomKey(message.roomType, message.roomId);
      const messages = new Map(state.messages);
      const roomMessages = messages.get(roomKey) || [];

      const isDuplicate = roomMessages.some((m) => m._id === message._id);
      if (!isDuplicate) {
        messages.set(roomKey, [...roomMessages, message]);
      }

      const activeRoom = state.activeRoom;
      const isActiveRoom =
        activeRoom?.type === message.roomType && activeRoom?.id === message.roomId;

      const unreadCounts = new Map(state.unreadCounts);
      if (!isActiveRoom) {
        const currentCount = unreadCounts.get(roomKey) || 0;
        unreadCounts.set(roomKey, currentCount + 1);

        const { settings } = state;
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

    socketService.on('chat:history', (data) => {
      const roomKey = getRoomKey(data.roomType, data.roomId);
      const messages = new Map(state.messages);
      const existingMessages = messages.get(roomKey) || [];

      const newMessages = [...data.messages, ...existingMessages];
      const uniqueMessages = Array.from(
        new Map(newMessages.map((m) => [m._id, m])).values()
      );

      messages.set(roomKey, uniqueMessages);

      set({ messages, isLoadingHistory: false });
    });

    socketService.on('chat:typing', (data) => {
      const roomKey = getRoomKey(data.roomType, data.roomId);
      const typingUsers = new Map(state.typingUsers);
      const roomTyping = typingUsers.get(roomKey) || [];

      if (data.isTyping) {
        if (!roomTyping.includes(data.username)) {
          typingUsers.set(roomKey, [...roomTyping, data.username]);
        }

        const existingTimer = typingTimers.get(`${roomKey}-${data.username}`);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        const timer = setTimeout(() => {
          const updated = new Map(get().typingUsers);
          const current = updated.get(roomKey) || [];
          updated.set(roomKey, current.filter((u) => u !== data.username));
          set({ typingUsers: updated });
          typingTimers.delete(`${roomKey}-${data.username}`);
        }, 3000);

        typingTimers.set(`${roomKey}-${data.username}`, timer);
      } else {
        typingUsers.set(roomKey, roomTyping.filter((u) => u !== data.username));
      }

      set({ typingUsers });
    });

    socketService.on('chat:user_joined', (data) => {
      const roomKey = getRoomKey(data.roomType, data.roomId);
      const onlineUsers = new Map(state.onlineUsers);
      const roomUsers = onlineUsers.get(roomKey) || [];

      if (!roomUsers.find((u) => u.userId === data.user.userId)) {
        onlineUsers.set(roomKey, [...roomUsers, data.user]);
        set({ onlineUsers });
      }
    });

    socketService.on('chat:user_left', (data) => {
      const roomKey = getRoomKey(data.roomType, data.roomId);
      const onlineUsers = new Map(state.onlineUsers);
      const roomUsers = onlineUsers.get(roomKey) || [];

      onlineUsers.set(roomKey, roomUsers.filter((u) => u.userId !== data.userId));
      set({ onlineUsers });
    });

    socketService.on('chat:online_users', (data) => {
      const roomKey = getRoomKey(data.roomType, data.roomId);
      const onlineUsers = new Map(state.onlineUsers);
      onlineUsers.set(roomKey, data.users);
      set({ onlineUsers });
    });

    socketService.on('user:online', (user) => {
      const whispers = new Map(state.whispers);
      const whisper = whispers.get(user.userId);
      if (whisper) {
        whispers.set(user.userId, { ...whisper, isOnline: true });
        set({ whispers });
      }
    });

    socketService.on('user:offline', (data) => {
      const whispers = new Map(state.whispers);
      const whisper = whispers.get(data.userId);
      if (whisper) {
        whispers.set(data.userId, { ...whisper, isOnline: false });
        set({ whispers });
      }
    });

    socketService.on('chat:error', (error) => {
      console.error('[Chat] Error:', error.message);
      set({ error: error.message });
    });

    socketService.on('rate_limit_exceeded', (data) => {
      const mutedUntil = new Date(Date.now() + data.retryAfter * 1000);
      set({ mutedUntil, error: `Rate limited. Try again in ${data.retryAfter}s` });

      setTimeout(() => {
        set({ mutedUntil: null });
      }, data.retryAfter * 1000);
    });

    socketService.on('chat:muted', (data) => {
      set({
        mutedUntil: new Date(data.mutedUntil),
        error: `You have been muted: ${data.reason}`,
      });
    });
  },

  /**
   * Cleanup chat system
   */
  cleanup: () => {
    typingTimers.forEach((timer) => clearTimeout(timer));
    typingTimers.clear();

    socketService.disconnect();

    set({
      messages: new Map(),
      activeRoom: null,
      onlineUsers: new Map(),
      typingUsers: new Map(),
      unreadCounts: new Map(),
      whispers: new Map(),
      connectionStatus: 'disconnected',
      mutedUntil: null,
      isLoadingHistory: false,
      isSendingMessage: false,
      error: null,
    });
  },

  /**
   * Join a chat room
   */
  joinRoom: async (type: RoomType, id: string) => {
    const state = get();

    if (!socketService.isConnected()) {
      set({ error: 'Not connected to chat server' });
      throw new Error('Not connected to chat server');
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
   * Send a message
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

    set({ isSendingMessage: true, error: null });

    try {
      // Validate activeRoom is present when needed
      if (!recipientId && !state.activeRoom) {
        set({ isSendingMessage: false, error: 'No active room selected' });
        throw new Error('No active room selected');
      }

      const roomType = state.activeRoom?.type ?? 'direct';
      const roomId = recipientId || state.activeRoom?.id;

      socketService.emit('chat:send_message', {
        roomType,
        roomId,
        content: content.trim(),
        recipientId,
      });

      set({ isSendingMessage: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send message';
      set({ isSendingMessage: false, error: message });
      throw error;
    }
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
    const existingTimer = typingTimers.get(`self-${roomKey}`);

    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    socketService.emit('chat:typing', {
      roomType: state.activeRoom.type,
      roomId: state.activeRoom.id,
      isTyping,
    });

    if (isTyping) {
      const timer = setTimeout(() => {
        get().setTyping(false);
      }, 3000);

      typingTimers.set(`self-${roomKey}`, timer);
    }
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
