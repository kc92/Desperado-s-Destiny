/**
 * Chat Service
 *
 * Business logic for chat message operations
 */

import mongoose from 'mongoose';
import DOMPurify from 'isomorphic-dompurify';
import { Message, IMessage, RoomType } from '../models/Message.model';
import { User } from '../models/User.model';
import { filterProfanity } from '../utils/profanityFilter';
import { validateRoomAccess } from '../utils/chatAccess';
import logger from '../utils/logger';

/**
 * Message report interface
 */
export interface MessageReport {
  messageId: string;
  reportedBy: string;
  reason: string;
  timestamp: Date;
}

/**
 * Chat Service Class
 */
export class ChatService {
  /**
   * Save a new message
   *
   * @param senderId - Character's ObjectId
   * @param senderName - Character's name (denormalized)
   * @param roomType - Type of room (GLOBAL, FACTION, GANG, WHISPER)
   * @param roomId - Room identifier
   * @param content - Message content
   * @param isSystemMessage - Whether this is a system message (default: false)
   * @returns Saved message document
   */
  static async saveMessage(
    senderId: string | mongoose.Types.ObjectId,
    senderName: string,
    roomType: RoomType,
    roomId: string,
    content: string,
    isSystemMessage: boolean = false
  ): Promise<IMessage> {
    try {
      // Validate inputs
      if (!senderId || !senderName || !roomType || !roomId) {
        throw new Error('Missing required parameters');
      }

      // Validate content length
      if (content === undefined || content === null) {
        throw new Error('Missing required parameters');
      }

      const trimmedContent = content.trim();

      if (trimmedContent.length === 0) {
        throw new Error('Message content cannot be empty');
      }

      if (trimmedContent.length > 500) {
        throw new Error('Message content exceeds maximum length of 500 characters');
      }

      // Validate sender name length
      if (senderName.length < 3 || senderName.length > 20) {
        throw new Error('Sender name must be between 3 and 20 characters');
      }

      // C7 SECURITY FIX: Sanitize HTML to prevent XSS attacks, then filter profanity
      // Strip ALL HTML tags - chat messages should be plain text only
      const sanitizedContent = DOMPurify.sanitize(trimmedContent, { ALLOWED_TAGS: [] });

      // Filter profanity (unless it's a system message)
      const filteredContent = isSystemMessage
        ? sanitizedContent
        : filterProfanity(sanitizedContent);

      // Create message
      const message = new Message({
        senderId: typeof senderId === 'string'
          ? new mongoose.Types.ObjectId(senderId)
          : senderId,
        senderName,
        roomType,
        roomId,
        content: filteredContent,
        timestamp: new Date(),
        isSystemMessage
      });

      // Save to database
      await message.save();

      logger.debug(`Message saved: ${message._id} in ${roomType}:${roomId}`);

      return message;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error saving message: ${error.message}`);
        throw error;
      }
      logger.error('Unknown error saving message:', error);
      throw new Error('Failed to save message');
    }
  }

  /**
   * Get message history for a room
   *
   * @param roomType - Type of room
   * @param roomId - Room identifier
   * @param limit - Maximum number of messages to fetch (default: 50, max: 100)
   * @param offset - Number of messages to skip (default: 0)
   * @returns Array of messages (newest first)
   */
  static async getMessageHistory(
    roomType: RoomType,
    roomId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<IMessage[]> {
    try {
      // Validate inputs
      if (!roomType || !roomId) {
        throw new Error('Missing required parameters');
      }

      // Use model's static method
      const messages = await Message.getMessageHistory(
        roomType,
        roomId,
        limit,
        offset
      );

      return messages;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error fetching message history: ${error.message}`);
        throw error;
      }
      logger.error('Unknown error fetching message history:', error);
      throw new Error('Failed to fetch message history');
    }
  }

  /**
   * Delete a message (admin only)
   *
   * @param messageId - Message's ObjectId
   * @param userId - User ID of the person deleting (must be admin)
   * @throws Error if user is not admin or message not found
   */
  static async deleteMessage(
    messageId: string | mongoose.Types.ObjectId,
    userId: string | mongoose.Types.ObjectId
  ): Promise<void> {
    try {
      // Validate inputs
      if (!messageId || !userId) {
        throw new Error('Missing required parameters');
      }

      // Check if user is admin
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (user.role !== 'admin') {
        throw new Error('Only admins can delete messages');
      }

      // Find and delete message
      const message = await Message.findByIdAndDelete(messageId);

      if (!message) {
        throw new Error('Message not found');
      }

      logger.info(`Message ${messageId} deleted by admin ${userId}`);
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error deleting message: ${error.message}`);
        throw error;
      }
      logger.error('Unknown error deleting message:', error);
      throw new Error('Failed to delete message');
    }
  }

  /**
   * Validate room access for a character
   *
   * @param characterId - Character's ObjectId
   * @param roomType - Type of room
   * @param roomId - Room identifier
   * @returns True if access granted
   * @throws Error if access denied
   */
  static async validateRoomAccess(
    characterId: string | mongoose.Types.ObjectId,
    roomType: RoomType,
    roomId: string
  ): Promise<boolean> {
    try {
      return await validateRoomAccess(characterId, roomType, roomId);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Room access validation failed');
    }
  }

  /**
   * Get recent messages count for a room
   *
   * @param roomType - Type of room
   * @param roomId - Room identifier
   * @param sinceMinutes - Number of minutes to look back (default: 60)
   * @returns Number of messages
   */
  static async getRecentMessageCount(
    roomType: RoomType,
    roomId: string,
    sinceMinutes: number = 60
  ): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setMinutes(cutoffDate.getMinutes() - sinceMinutes);

      const count = await Message.countDocuments({
        roomType,
        roomId,
        timestamp: { $gte: cutoffDate }
      });

      return count;
    } catch (error) {
      logger.error('Error getting recent message count:', error);
      return 0;
    }
  }

  /**
   * Search messages by content
   *
   * @param roomType - Type of room
   * @param roomId - Room identifier
   * @param searchTerm - Search term
   * @param limit - Maximum results (default: 20)
   * @returns Array of matching messages
   */
  static async searchMessages(
    roomType: RoomType,
    roomId: string,
    searchTerm: string,
    limit: number = 20
  ): Promise<IMessage[]> {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        return [];
      }

      // C2 SECURITY FIX: Additional validation BEFORE regex to prevent NoSQL injection
      if (typeof searchTerm !== 'string') {
        logger.warn('Invalid search term type');
        return [];
      }
      // Reject MongoDB operator characters that could be used for injection
      if (searchTerm.includes('$') || searchTerm.includes('{') || searchTerm.includes('}')) {
        logger.warn('Rejected search term with potential injection characters');
        return [];
      }
      // Enforce maximum length to prevent ReDoS
      if (searchTerm.length > 100) {
        logger.warn('Search term exceeds maximum length');
        return [];
      }

      // C2 SECURITY FIX: Escape regex to prevent NoSQL injection in search
      const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const messages = await Message.find({
        roomType,
        roomId,
        content: { $regex: escapedSearchTerm, $options: 'i' }
      })
        .sort({ timestamp: -1 })
        .limit(Math.min(limit, 50))
        .exec();

      return messages;
    } catch (error) {
      logger.error('Error searching messages:', error);
      return [];
    }
  }

  /**
   * Get messages by sender
   *
   * @param senderId - Character's ObjectId
   * @param limit - Maximum messages to return (default: 50)
   * @returns Array of messages
   */
  static async getMessagesBySender(
    senderId: string | mongoose.Types.ObjectId,
    limit: number = 50
  ): Promise<IMessage[]> {
    try {
      const messages = await Message.find({
        senderId: typeof senderId === 'string'
          ? new mongoose.Types.ObjectId(senderId)
          : senderId
      })
        .sort({ timestamp: -1 })
        .limit(Math.min(limit, 100))
        .exec();

      return messages;
    } catch (error) {
      logger.error('Error getting messages by sender:', error);
      return [];
    }
  }

  /**
   * Create system message
   *
   * @param roomType - Type of room
   * @param roomId - Room identifier
   * @param content - System message content
   * @returns Saved system message
   */
  static async createSystemMessage(
    roomType: RoomType,
    roomId: string,
    content: string
  ): Promise<IMessage> {
    try {
      // Use a special system sender ID (all zeros)
      const systemSenderId = new mongoose.Types.ObjectId('000000000000000000000000');

      return await this.saveMessage(
        systemSenderId,
        'System',
        roomType,
        roomId,
        content,
        true
      );
    } catch (error) {
      logger.error('Error creating system message:', error);
      throw new Error('Failed to create system message');
    }
  }

  /**
   * Cleanup old messages (maintenance task)
   *
   * @param daysOld - Delete messages older than this many days (default: 30)
   * @returns Number of messages deleted
   */
  static async cleanupOldMessages(daysOld: number = 30): Promise<number> {
    try {
      const deletedCount = await Message.deleteOldMessages(daysOld);
      logger.info(`Cleaned up ${deletedCount} old messages`);
      return deletedCount;
    } catch (error) {
      logger.error('Error cleaning up old messages:', error);
      return 0;
    }
  }

  /**
   * Get total message count for analytics
   *
   * @param roomType - Optional room type filter
   * @param roomId - Optional room ID filter
   * @returns Total message count
   */
  static async getTotalMessageCount(
    roomType?: RoomType,
    roomId?: string
  ): Promise<number> {
    try {
      const query: {
        roomType?: RoomType;
        roomId?: string;
      } = {};

      if (roomType) {
        query.roomType = roomType;
      }

      if (roomId) {
        query.roomId = roomId;
      }

      const count = await Message.countDocuments(query);
      return count;
    } catch (error) {
      logger.error('Error getting total message count:', error);
      return 0;
    }
  }
}

export default ChatService;
