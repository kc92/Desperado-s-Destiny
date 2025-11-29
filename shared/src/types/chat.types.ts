/**
 * Chat Types - Real-time Communication
 *
 * Types for the chat system including messages, rooms, and user presence
 */

/**
 * Chat room types
 */
export enum RoomType {
  GLOBAL = 'global',
  FACTION = 'faction',
  GANG = 'gang',
  WHISPER = 'whisper',
}

/**
 * Message types
 */
export enum MessageType {
  CHAT = 'chat',
  SYSTEM = 'system',
  WHISPER = 'whisper',
}

/**
 * Chat message entity
 */
export interface ChatMessage {
  /** Message ID */
  _id: string;
  /** Room type */
  roomType: RoomType;
  /** Room ID (faction name, gang ID, or recipient ID for whispers) */
  roomId: string;
  /** Message type */
  type: MessageType;
  /** Sender user ID */
  senderId: string;
  /** Sender username */
  senderName: string;
  /** Sender faction */
  senderFaction: 'settler' | 'nahi' | 'frontera';
  /** Recipient user ID (for whispers) */
  recipientId?: string;
  /** Recipient username (for whispers) */
  recipientName?: string;
  /** Message content */
  content: string;
  /** Mentioned user IDs */
  mentions?: string[];
  /** Timestamp */
  createdAt: Date;
  /** Whether message has been edited */
  edited?: boolean;
  /** Edit timestamp */
  editedAt?: Date;
}

/**
 * Online user in a room
 */
export interface OnlineUser {
  /** User ID */
  userId: string;
  /** Username */
  username: string;
  /** User faction */
  faction: 'settler' | 'nahi' | 'frontera';
  /** Character level */
  level: number;
  /** Gang name (if in gang) */
  gangName?: string;
  /** Whether user is online */
  isOnline: boolean;
}

/**
 * Typing indicator
 */
export interface TypingIndicator {
  /** User ID */
  userId: string;
  /** Username */
  username: string;
  /** Room type */
  roomType: RoomType;
  /** Room ID */
  roomId: string;
  /** Timestamp when typing started */
  startedAt: Date;
}

/**
 * Chat room info
 */
export interface ChatRoom {
  /** Room type */
  type: RoomType;
  /** Room ID */
  id: string;
  /** Room display name */
  name: string;
  /** Number of users online */
  userCount: number;
  /** Unread message count */
  unreadCount: number;
  /** Last message in room */
  lastMessage?: ChatMessage;
}

/**
 * Whisper conversation
 */
export interface WhisperConversation {
  /** Other user's ID */
  userId: string;
  /** Other user's username */
  username: string;
  /** Other user's faction */
  faction: 'settler' | 'nahi' | 'frontera';
  /** Whether other user is online */
  isOnline: boolean;
  /** Unread count */
  unreadCount: number;
  /** Last message */
  lastMessage?: ChatMessage;
  /** Last activity timestamp */
  lastActivityAt: Date;
}

/**
 * Socket.io Events - Client to Server
 */
export interface ClientToServerEvents {
  /** Join a chat room */
  'chat:join_room': (data: { roomType: RoomType; roomId: string }) => void;

  /** Leave a chat room */
  'chat:leave_room': (data: { roomType: RoomType; roomId: string }) => void;

  /** Send a message */
  'chat:send_message': (data: {
    roomType: RoomType;
    roomId: string;
    content: string;
    recipientId?: string;
  }) => void;

  /** Fetch message history */
  'chat:fetch_history': (data: {
    roomType: RoomType;
    roomId: string;
    limit: number;
    offset: number;
  }) => void;

  /** User is typing */
  'chat:typing': (data: {
    roomType: RoomType;
    roomId: string;
    isTyping: boolean;
  }) => void;

  /** Report a message */
  'chat:report': (data: { messageId: string; reason: string }) => void;

  /** Request online users in room */
  'chat:get_online_users': (data: { roomType: RoomType; roomId: string }) => void;

  /** Mark messages as read */
  'chat:mark_read': (data: { roomType: RoomType; roomId: string }) => void;
}

/**
 * Socket.io Events - Server to Client
 */
export interface ServerToClientEvents {
  /** New message received */
  'chat:message': (message: ChatMessage) => void;

  /** Message history response */
  'chat:history': (data: {
    roomType: RoomType;
    roomId: string;
    messages: ChatMessage[];
    hasMore: boolean;
  }) => void;

  /** User started typing */
  'chat:typing': (data: {
    roomType: RoomType;
    roomId: string;
    userId: string;
    username: string;
    isTyping: boolean;
  }) => void;

  /** User joined room */
  'chat:user_joined': (data: {
    roomType: RoomType;
    roomId: string;
    user: OnlineUser;
  }) => void;

  /** User left room */
  'chat:user_left': (data: {
    roomType: RoomType;
    roomId: string;
    userId: string;
  }) => void;

  /** Online users list */
  'chat:online_users': (data: {
    roomType: RoomType;
    roomId: string;
    users: OnlineUser[];
  }) => void;

  /** User online status changed */
  'user:online': (user: OnlineUser) => void;

  /** User offline status changed */
  'user:offline': (data: { userId: string }) => void;

  /** Chat error */
  'chat:error': (error: { message: string; code?: string }) => void;

  /** Rate limit exceeded */
  'rate_limit_exceeded': (data: { retryAfter: number }) => void;

  /** User muted */
  'chat:muted': (data: { mutedUntil: Date; reason: string }) => void;
}

/**
 * Chat settings
 */
export interface ChatSettings {
  /** Sound notifications enabled */
  soundEnabled: boolean;
  /** Browser notifications enabled */
  browserNotificationsEnabled: boolean;
  /** Notification volume (0-100) */
  notificationVolume: number;
  /** Show typing indicators */
  showTypingIndicators: boolean;
  /** Timestamp format */
  timestampFormat: 'relative' | 'absolute';
  /** Profanity filter enabled */
  profanityFilterEnabled: boolean;
  /** Show online users list */
  showOnlineUsers: boolean;
  /** Message font size */
  fontSize: 'small' | 'medium' | 'large';
}
