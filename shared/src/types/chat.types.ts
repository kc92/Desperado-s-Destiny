/**
 * Chat Types - Real-time Communication
 *
 * Types for the chat system including messages, rooms, and user presence
 *
 * Also includes socket event interfaces that extend to duel and gang systems
 */

import type {
  DuelClientState,
  ChallengeNotification,
  RoundResult,
  PerceptionCheckResult,
  AbilityResultEvent,
  CheatDetectedEvent,
  BettingAction,
} from './duel.types';
import type { Card } from './destinyDeck.types';
import type { Gang, GangRole } from './gang.types';
import type { GangWar } from './gangWar.types';

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
  // ============================================================================
  // CHAT EVENTS
  // ============================================================================

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

  // ============================================================================
  // DUEL EVENTS
  // ============================================================================

  /** Join a duel room */
  'duel:join_room': (data: { duelId: string }) => void;

  /** Leave a duel room */
  'duel:leave_room': (data: { duelId: string }) => void;

  /** Player ready for duel */
  'duel:ready': (data: { duelId: string }) => void;

  /** Hold cards during draw phase */
  'duel:hold_cards': (data: { duelId: string; cardIndices: number[] }) => void;

  /** Draw new cards */
  'duel:draw': (data: { duelId: string }) => void;

  /** Place bet */
  'duel:bet': (data: { duelId: string; action: BettingAction; amount?: number }) => void;

  /** Use ability */
  'duel:use_ability': (data: { duelId: string; ability: string; targetIndex?: number }) => void;

  /** Forfeit duel */
  'duel:forfeit': (data: { duelId: string }) => void;

  /** Request rematch */
  'duel:request_rematch': (data: { duelId: string }) => void;

  /** Send emote */
  'duel:emote': (data: { duelId: string; emote: string }) => void;
}

/**
 * Socket.io Events - Server to Client
 */
export interface ServerToClientEvents {
  // ============================================================================
  // CHAT EVENTS
  // ============================================================================

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

  // ============================================================================
  // DUEL EVENTS
  // ============================================================================

  /** Duel state update */
  'duel:state_update': (state: DuelClientState) => void;

  /** Challenge received */
  'duel:challenge_received': (challenge: ChallengeNotification) => void;

  /** Opponent joined duel */
  'duel:opponent_joined': (data: { name: string }) => void;

  /** Opponent left duel */
  'duel:opponent_left': (data: { name: string }) => void;

  /** Opponent reconnected */
  'duel:opponent_reconnected': (data: { name: string }) => void;

  /** Game started */
  'duel:game_start': (state: DuelClientState) => void;

  /** Cards dealt */
  'duel:cards_dealt': (data: { cards: Card[]; roundNumber: number }) => void;

  /** Opponent action */
  'duel:opponent_action': (data: { actionType: string; timestamp: number }) => void;

  /** Reveal phase */
  'duel:reveal_phase': (data: { hands: unknown }) => void;

  /** Round result */
  'duel:round_result': (result: RoundResult) => void;

  /** Game complete */
  'duel:game_complete': (data: {
    winnerId: string;
    winnerName: string;
    finalScore: { challenger: number; challenged: number };
    rewards: unknown;
    isForfeit: boolean;
  }) => void;

  /** Time warning */
  'duel:time_warning': (data: { secondsRemaining: number }) => void;

  /** Perception result */
  'duel:perception_result': (result: PerceptionCheckResult) => void;

  /** Ability result */
  'duel:ability_result': (result: AbilityResultEvent) => void;

  /** Cheat detected */
  'duel:cheat_detected': (data: CheatDetectedEvent) => void;

  /** Emote received */
  'duel:emote': (data: { playerId: string; emote: string }) => void;

  /** Duel error */
  'duel:error': (data: { message: string; code: string }) => void;

  // ============================================================================
  // GANG EVENTS
  // ============================================================================

  /** Gang member joined */
  'gang:member_joined': (data: {
    gangId: string;
    member: {
      characterId: string;
      characterName: string;
      level: number;
      role: GangRole;
      joinedAt: Date;
      contribution: number;
    };
  }) => void;

  /** Gang member left */
  'gang:member_left': (data: { gangId: string; characterId: string }) => void;

  /** Gang member promoted */
  'gang:member_promoted': (data: {
    gangId: string;
    characterId: string;
    newRole: GangRole;
  }) => void;

  /** Gang bank updated */
  'gang:bank_updated': (data: { gangId: string; newBalance: number }) => void;

  /** Gang upgrade purchased */
  'gang:upgrade_purchased': (data: { gangId: string; gang: Gang }) => void;

  // ============================================================================
  // TERRITORY EVENTS
  // ============================================================================

  /** Territory war declared */
  'territory:war_declared': (war: GangWar) => void;

  /** Territory war contributed */
  'territory:war_contributed': (data: {
    warId: string;
    capturePoints: number;
    war: GangWar;
  }) => void;

  /** Territory war resolved */
  'territory:war_resolved': (data: {
    warId: string;
    territoryId: string;
    winnerGangId: string | null;
  }) => void;

  /** Territory conquered */
  'territory:conquered': (data: {
    territoryId: string;
    newOwnerGangId: string;
    newOwnerGangName: string;
  }) => void;
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
