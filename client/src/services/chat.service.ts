/**
 * Chat Service
 * API client for chat-related HTTP endpoints
 * Note: Real-time messaging uses Socket.IO, this handles HTTP fallbacks
 */

import apiClient from './api';
import type { ApiResponse } from '@/types';

export interface ChatMessage {
  _id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'message' | 'system' | 'emote' | 'whisper';
  createdAt: Date;
  editedAt?: Date;
  isDeleted: boolean;
}

export interface OnlineUser {
  characterId: string;
  characterName: string;
  gangId?: string;
  gangTag?: string;
  level: number;
  status: 'online' | 'away' | 'busy';
  joinedAt: Date;
}

export interface MuteStatus {
  isMuted: boolean;
  mutedUntil?: Date;
  reason?: string;
  mutedBy?: string;
}

export interface ChatStats {
  totalMessages: number;
  activeRooms: number;
  onlineUsers: number;
  messagesLast24h: number;
  reportsPending: number;
}

/**
 * Chat service for HTTP API calls
 */
export const chatService = {
  /**
   * Get message history for a room
   */
  getMessages: async (roomId: string, limit: number = 50, before?: string) => {
    const response = await apiClient.get<ApiResponse<{ messages: ChatMessage[]; hasMore: boolean }>>(
      '/chat/messages',
      { params: { roomId, limit, before } }
    );
    return response.data;
  },

  /**
   * Get online users for a room
   */
  getOnlineUsers: async (roomId: string) => {
    const response = await apiClient.get<ApiResponse<{ users: OnlineUser[] }>>(
      '/chat/online-users',
      { params: { roomId } }
    );
    return response.data;
  },

  /**
   * Check if current user is muted
   */
  getMuteStatus: async (roomId?: string) => {
    const response = await apiClient.get<ApiResponse<{ status: MuteStatus }>>(
      '/chat/mute-status',
      { params: { roomId } }
    );
    return response.data;
  },

  /**
   * Report a message
   */
  reportMessage: async (messageId: string, reason: string) => {
    const response = await apiClient.post<ApiResponse<{ reportId: string }>>(
      '/chat/report',
      { messageId, reason }
    );
    return response.data;
  },

  /**
   * Get chat statistics (admin only)
   */
  getChatStats: async () => {
    const response = await apiClient.get<ApiResponse<{ stats: ChatStats }>>(
      '/chat/stats'
    );
    return response.data;
  },
};

export default chatService;
