/**
 * Chat Controller
 *
 * HTTP endpoints for chat operations
 */

import { Response } from 'express';
import { ChatService } from '../services/chat.service';
import { PresenceService } from '../services/presence.service';
import { ChatRateLimiter } from '../middleware/chatRateLimiter';
import { RoomType } from '../models/Message.model';
import { isValidRoomType } from '../utils/chatAccess';
import { AppError, HttpStatus } from '../types';
import { sendSuccess } from '../utils/responseHelpers';
import logger from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Character } from '../models/Character.model';

/**
 * GET /api/chat/messages
 * Fetch message history for a room
 */
export async function getMessages(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { roomType, roomId, limit = '50', offset = '0' } = req.query;

    // Validate inputs
    if (!roomType || typeof roomType !== 'string') {
      throw new AppError('Room type is required', HttpStatus.BAD_REQUEST);
    }

    if (!roomId || typeof roomId !== 'string') {
      throw new AppError('Room ID is required', HttpStatus.BAD_REQUEST);
    }

    if (!isValidRoomType(roomType)) {
      throw new AppError('Invalid room type', HttpStatus.BAD_REQUEST);
    }

    // Parse pagination parameters
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);

    if (isNaN(limitNum) || limitNum <= 0 || limitNum > 100) {
      throw new AppError('Limit must be between 1 and 100', HttpStatus.BAD_REQUEST);
    }

    if (isNaN(offsetNum) || offsetNum < 0) {
      throw new AppError('Offset must be non-negative', HttpStatus.BAD_REQUEST);
    }

    // Get user's character
    if (!req.user) {
      throw new AppError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    const character = await Character.findOne({
      userId: req.user._id,
      isActive: true
    }).sort({ lastActive: -1 });

    if (!character) {
      throw new AppError('No active character found', HttpStatus.NOT_FOUND);
    }

    // Validate room access
    await ChatService.validateRoomAccess(
      character._id.toString(),
      roomType as RoomType,
      roomId
    );

    // Fetch messages
    const messages = await ChatService.getMessageHistory(
      roomType as RoomType,
      roomId,
      limitNum,
      offsetNum
    );

    sendSuccess(res, {
      messages,
      roomType,
      roomId,
      limit: limitNum,
      offset: offsetNum,
      count: messages.length
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error fetching messages:', error);
    throw new AppError('Failed to fetch messages', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * GET /api/chat/online-users
 * Get online users for a room
 */
export async function getOnlineUsers(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { roomType, roomId } = req.query;

    // Validate inputs
    if (!roomType || typeof roomType !== 'string') {
      throw new AppError('Room type is required', HttpStatus.BAD_REQUEST);
    }

    if (!roomId || typeof roomId !== 'string') {
      throw new AppError('Room ID is required', HttpStatus.BAD_REQUEST);
    }

    if (!isValidRoomType(roomType)) {
      throw new AppError('Invalid room type', HttpStatus.BAD_REQUEST);
    }

    // Get user's character
    if (!req.user) {
      throw new AppError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    const character = await Character.findOne({
      userId: req.user._id,
      isActive: true
    }).sort({ lastActive: -1 });

    if (!character) {
      throw new AppError('No active character found', HttpStatus.NOT_FOUND);
    }

    // Validate room access
    await ChatService.validateRoomAccess(
      character._id.toString(),
      roomType as RoomType,
      roomId
    );

    // Get online users
    const users = await PresenceService.getOnlineUsers(
      roomType as RoomType,
      roomId
    );

    sendSuccess(res, {
      users,
      count: users.length,
      roomType,
      roomId
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error fetching online users:', error);
    throw new AppError('Failed to fetch online users', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * GET /api/chat/mute-status
 * Check if user is muted
 */
export async function getMuteStatus(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    const muteStatus = await ChatRateLimiter.checkMuteStatus(req.user._id);

    sendSuccess(res, muteStatus);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error checking mute status:', error);
    throw new AppError('Failed to check mute status', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * POST /api/chat/report
 * Report a message
 */
export async function reportMessage(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const { messageId, reason } = req.body;

    // Validate inputs
    if (!messageId || typeof messageId !== 'string') {
      throw new AppError('Message ID is required', HttpStatus.BAD_REQUEST);
    }

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      throw new AppError('Report reason is required', HttpStatus.BAD_REQUEST);
    }

    const validReasons = ['spam', 'harassment', 'profanity', 'other'];
    if (!validReasons.includes(reason)) {
      throw new AppError(
        'Invalid reason. Must be one of: spam, harassment, profanity, other',
        HttpStatus.BAD_REQUEST
      );
    }

    if (!req.user) {
      throw new AppError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    // Get user's character
    const character = await Character.findOne({
      userId: req.user._id,
      isActive: true
    }).sort({ lastActive: -1 });

    if (!character) {
      throw new AppError('No active character found', HttpStatus.NOT_FOUND);
    }

    // Log the report (in production, this would create a Report record)
    logger.warn(
      `Message ${messageId} reported by character ${character.name} (${character._id}) for ${reason}`
    );

    sendSuccess(res, {
      success: true,
      message: 'Message reported successfully. Moderators will review it.'
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error reporting message:', error);
    throw new AppError('Failed to report message', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

/**
 * GET /api/chat/stats
 * Get chat statistics (admin only)
 */
export async function getChatStats(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required', HttpStatus.UNAUTHORIZED);
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      throw new AppError('Admin access required', HttpStatus.FORBIDDEN);
    }

    // Get statistics
    const totalMessages = await ChatService.getTotalMessageCount();
    const globalMessages = await ChatService.getTotalMessageCount(RoomType.GLOBAL);
    const factionMessages = await ChatService.getTotalMessageCount(RoomType.FACTION);
    const gangMessages = await ChatService.getTotalMessageCount(RoomType.GANG);
    const whisperMessages = await ChatService.getTotalMessageCount(RoomType.WHISPER);

    const onlineUsers = await PresenceService.getAllOnlineUsers();

    sendSuccess(res, {
      totalMessages,
      messagesByRoom: {
        global: globalMessages,
        faction: factionMessages,
        gang: gangMessages,
        whisper: whisperMessages
      },
      onlineUsers: {
        count: onlineUsers.length,
        users: onlineUsers
      }
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Error fetching chat stats:', error);
    throw new AppError('Failed to fetch chat stats', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export default {
  getMessages,
  getOnlineUsers,
  getMuteStatus,
  reportMessage,
  getChatStats
};
