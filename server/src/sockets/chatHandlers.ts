/**
 * Chat Socket Event Handlers
 *
 * Handle all Socket.io chat events with full validation and error handling
 */

import { Socket } from 'socket.io';
import { AuthenticatedSocket, requireSocketAuth, verifyCharacterOwnership } from '../middleware/socketAuth';
import { ChatService } from '../services/chat.service';
import { PresenceService } from '../services/presence.service';
import { ChatRateLimiter } from '../middleware/chatRateLimiter';
import { AdminCommands } from '../utils/adminCommands';
import { RoomType, IMessage } from '../models/Message.model';
import { isValidRoomType, getRoomDisplayName } from '../utils/chatAccess';
import logger from '../utils/logger';
import { createExactMatchRegex } from '../utils/stringUtils';

/**
 * Chat event payload interfaces
 */
interface JoinRoomPayload {
  roomType: string;
  roomId: string;
}

interface LeaveRoomPayload {
  roomType: string;
  roomId: string;
}

interface SendMessagePayload {
  roomType: string;
  roomId: string;
  content: string;
  _clientId?: string; // Client-generated ID for optimistic update confirmation
}

interface FetchHistoryPayload {
  roomType: string;
  roomId: string;
  limit?: number;
  offset?: number;
}

interface TypingPayload {
  roomType: string;
  roomId: string;
}

/**
 * Socket room name generator
 */
function getRoomName(roomType: RoomType, roomId: string): string {
  return `${roomType}:${roomId}`;
}

/**
 * Register all chat event handlers on a socket
 *
 * @param socket - Authenticated socket instance
 */
export function registerChatHandlers(socket: Socket): void {
  const authSocket = socket as AuthenticatedSocket;

  // Verify socket is authenticated
  try {
    requireSocketAuth(authSocket);
  } catch (error) {
    logger.error(`Socket ${socket.id} is not authenticated, cannot register chat handlers`);
    return;
  }

  // Register event handlers
  authSocket.on('chat:join_room', (payload: JoinRoomPayload) => {
    void handleJoinRoom(authSocket, payload);
  });

  authSocket.on('chat:leave_room', (payload: LeaveRoomPayload) => {
    void handleLeaveRoom(authSocket, payload);
  });

  authSocket.on('chat:send_message', (payload: SendMessagePayload) => {
    void handleSendMessage(authSocket, payload);
  });

  authSocket.on('chat:fetch_history', (payload: FetchHistoryPayload) => {
    void handleFetchHistory(authSocket, payload);
  });

  authSocket.on('chat:typing', (payload: TypingPayload) => {
    void handleTyping(authSocket, payload);
  });

  logger.debug(`Chat handlers registered for socket ${socket.id}`);
}

/**
 * Handle join room event
 */
async function handleJoinRoom(
  socket: AuthenticatedSocket,
  payload: JoinRoomPayload
): Promise<void> {
  try {
    const { characterId, characterName, userId } = socket.data;
    const { roomType, roomId } = payload;

    // DEBUG: Log incoming join request
    logger.debug('chat:join_room received', {
      socketId: socket.id,
      characterId,
      payload,
      roomType,
      roomId,
      roomTypeType: typeof roomType
    });

    // H10 SECURITY FIX: Per-event character ownership verification
    const isOwned = await verifyCharacterOwnership(socket);
    if (!isOwned) {
      socket.emit('chat:error', {
        error: 'Character verification failed. Please reconnect.',
        code: 'CHARACTER_VERIFICATION_FAILED'
      });
      socket.disconnect(true);
      return;
    }

    // Validate room type
    if (!isValidRoomType(roomType)) {
      socket.emit('chat:error', {
        error: 'Invalid room type',
        code: 'INVALID_ROOM_TYPE'
      });
      return;
    }

    // Validate room ID
    if (!roomId || typeof roomId !== 'string' || roomId.trim().length === 0) {
      socket.emit('chat:error', {
        error: 'Invalid room ID',
        code: 'INVALID_ROOM_ID'
      });
      return;
    }

    // Check ban status
    const banStatus = await ChatRateLimiter.checkBanStatus(userId);
    if (banStatus.isBanned) {
      socket.emit('chat:error', {
        error: 'You are banned from chat',
        code: 'BANNED',
        reason: banStatus.reason
      });
      return;
    }

    // Validate room access
    try {
      await ChatService.validateRoomAccess(characterId, roomType as RoomType, roomId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Access denied';
      socket.emit('chat:error', {
        error: errorMessage,
        code: 'ACCESS_DENIED'
      });
      return;
    }

    // Generate room name
    const roomName = getRoomName(roomType as RoomType, roomId);

    // Join the room
    await socket.join(roomName);

    logger.info(
      `Character ${characterName} (${characterId}) joined room ${roomName}`
    );

    // Notify user of successful join
    socket.emit('chat:room_joined', {
      roomType,
      roomId,
      roomName: getRoomDisplayName(roomType as RoomType, roomId),
      timestamp: new Date().toISOString()
    });

    // Fetch current user's character details for broadcast
    const { Character } = await import('../models/Character.model');
    const joiningChar = await Character.findById(characterId).populate('gangId').lean();

    // Create OnlineUser object for the joining user
    const joiningUser = {
      userId: characterId,
      username: characterName,
      faction: joiningChar?.faction || 'settler',
      level: joiningChar?.level || 1,
      gangName: (joiningChar?.gangId as { name?: string } | undefined)?.name,
      isOnline: true
    };

    // Broadcast user joined to room with proper OnlineUser format
    socket.to(roomName).emit('chat:user_joined', {
      roomType,
      roomId,
      user: joiningUser,
      timestamp: new Date().toISOString()
    });

    // Send online users list
    const presenceUsers = await PresenceService.getOnlineUsers(
      roomType as RoomType,
      roomId
    );

    // Transform PresenceService users to shared OnlineUser format
    const allCharacterIds = presenceUsers.map(u => u.characterId);
    const characters = await Character.find({ _id: { $in: allCharacterIds } }).populate('gangId').lean();

    const onlineUsers = presenceUsers.map(pu => {
      const char = characters.find(c => c._id.toString() === pu.characterId);
      return {
        userId: pu.characterId,
        username: pu.characterName,
        faction: char?.faction || 'settler',
        level: char?.level || 1,
        gangName: (char?.gangId as { name?: string } | undefined)?.name,
        isOnline: true
      };
    });

    socket.emit('chat:online_users', {
      roomType,
      roomId,
      users: onlineUsers,
      count: onlineUsers.length
    });

  } catch (error) {
    logger.error(`Error in handleJoinRoom for socket ${socket.id}:`, error);
    socket.emit('chat:error', {
      error: 'Failed to join room',
      code: 'JOIN_ROOM_FAILED'
    });
  }
}

/**
 * Handle leave room event
 */
async function handleLeaveRoom(
  socket: AuthenticatedSocket,
  payload: LeaveRoomPayload
): Promise<void> {
  try {
    const { characterId, characterName } = socket.data;
    const { roomType, roomId } = payload;

    // Validate room type
    if (!isValidRoomType(roomType)) {
      socket.emit('chat:error', {
        error: 'Invalid room type',
        code: 'INVALID_ROOM_TYPE'
      });
      return;
    }

    // Generate room name
    const roomName = getRoomName(roomType as RoomType, roomId);

    // Leave the room
    await socket.leave(roomName);

    logger.info(
      `Character ${characterName} (${characterId}) left room ${roomName}`
    );

    // Notify user of successful leave
    socket.emit('chat:room_left', {
      roomType,
      roomId,
      timestamp: new Date().toISOString()
    });

    // Broadcast user left to room (use userId to match client expectations)
    socket.to(roomName).emit('chat:user_left', {
      userId: characterId,
      characterName,
      roomType,
      roomId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Error in handleLeaveRoom for socket ${socket.id}:`, error);
    socket.emit('chat:error', {
      error: 'Failed to leave room',
      code: 'LEAVE_ROOM_FAILED'
    });
  }
}

/**
 * Handle send message event
 */
async function handleSendMessage(
  socket: AuthenticatedSocket,
  payload: SendMessagePayload
): Promise<void> {
  try {
    const { characterId, characterName, userId, userRole } = socket.data;
    const { roomType, roomId, content, _clientId } = payload;

    // H10 SECURITY FIX: Re-verify character ownership on message send
    // This prevents actions if character was deleted/transferred since socket connected
    const isOwned = await verifyCharacterOwnership(socket);
    if (!isOwned) {
      socket.emit('chat:error', {
        error: 'Character verification failed. Please reconnect.',
        code: 'CHARACTER_VERIFICATION_FAILED'
      });
      socket.disconnect(true);
      return;
    }

    // Validate inputs
    if (!isValidRoomType(roomType)) {
      socket.emit('chat:error', {
        error: 'Invalid room type',
        code: 'INVALID_ROOM_TYPE'
      });
      return;
    }

    if (!roomId || typeof roomId !== 'string') {
      socket.emit('chat:error', {
        error: 'Invalid room ID',
        code: 'INVALID_ROOM_ID'
      });
      return;
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      socket.emit('chat:error', {
        error: 'Message content cannot be empty',
        code: 'EMPTY_MESSAGE'
      });
      return;
    }

    if (content.length > 500) {
      socket.emit('chat:error', {
        error: 'Message exceeds maximum length of 500 characters',
        code: 'MESSAGE_TOO_LONG'
      });
      return;
    }

    // Check ban status
    const banStatus = await ChatRateLimiter.checkBanStatus(userId);
    if (banStatus.isBanned) {
      socket.emit('chat:error', {
        error: 'You are banned from chat',
        code: 'BANNED',
        reason: banStatus.reason
      });
      return;
    }

    // Check if message is an admin command
    if (AdminCommands.isAdminCommand(content)) {
      // SECURITY FIX: Verify admin role before executing admin commands
      if (userRole !== 'admin') {
        socket.emit('chat:error', {
          error: 'Admin privileges required',
          code: 'ADMIN_REQUIRED'
        });
        logger.warn(`Non-admin user ${userId} attempted admin command: ${content.split(' ')[0]}`);
        return;
      }

      const result = await AdminCommands.executeCommand(
        userId,
        content,
        roomType as RoomType,
        roomId
      );

      // Send command result to admin
      socket.emit('chat:admin_command_result', {
        success: result.success,
        message: result.message
      });

      // Broadcast system message if provided
      if (result.success && result.systemMessage) {
        const roomName = getRoomName(roomType as RoomType, roomId);
        const systemMessage = await ChatService.createSystemMessage(
          roomType as RoomType,
          roomId,
          result.systemMessage
        );

        // Emit system message without wrapper (matches ServerToClientEvents type)
        const systemMsgObj = systemMessage.toObject ? systemMessage.toObject() : systemMessage;
        socket.to(roomName).emit('chat:message', systemMsgObj);
        socket.emit('chat:message', systemMsgObj);

        // Handle kick command - disconnect the target
        if (content.toLowerCase().startsWith('/kick')) {
          const args = content.split(/\s+/);
          const targetName = args[1];

          if (targetName) {
            const { Character } = await import('../models/Character.model');
            const targetChar = await Character.findOne({
              name: createExactMatchRegex(targetName),
              isActive: true
            });

            if (targetChar) {
              const { disconnectCharacter } = await import('../config/socket');
              await disconnectCharacter(
                targetChar._id.toString(),
                'Kicked by admin'
              );
            }
          }
        }
      }

      return;
    }

    // Check rate limit
    const rateLimitResult = await ChatRateLimiter.checkRateLimit(
      userId,
      characterId,
      roomType as RoomType,
      userRole === 'admin'
    );

    if (!rateLimitResult.allowed) {
      if (rateLimitResult.isMuted) {
        socket.emit('chat:error', {
          error: 'You are muted',
          code: 'MUTED',
          expiresAt: rateLimitResult.muteExpiresAt?.toISOString()
        });
      } else {
        socket.emit('rate_limit_exceeded', {
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          resetAt: rateLimitResult.resetAt?.toISOString()
        });
      }
      return;
    }

    // Validate room access
    try {
      await ChatService.validateRoomAccess(characterId, roomType as RoomType, roomId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Access denied';
      socket.emit('chat:error', {
        error: errorMessage,
        code: 'ACCESS_DENIED'
      });
      return;
    }

    // Save message (profanity filtering happens in service)
    const message = await ChatService.saveMessage(
      characterId,
      characterName,
      roomType as RoomType,
      roomId,
      content
    );

    // Broadcast message to room (other users receive without _clientId)
    const roomName = getRoomName(roomType as RoomType, roomId);
    const messageObj = message.toObject();

    socket.to(roomName).emit('chat:message', messageObj);

    // Send to sender as confirmation (include _clientId for optimistic update)
    socket.emit('chat:message', {
      ...messageObj,
      _clientId // Echo back the client ID for confirmation
    });

    logger.debug(
      `Message sent by ${characterName} in ${roomType}:${roomId}`
    );

  } catch (error) {
    logger.error(`Error in handleSendMessage for socket ${socket.id}:`, error);
    socket.emit('chat:error', {
      error: 'Failed to send message',
      code: 'SEND_MESSAGE_FAILED'
    });
  }
}

/**
 * Handle fetch history event
 */
async function handleFetchHistory(
  socket: AuthenticatedSocket,
  payload: FetchHistoryPayload
): Promise<void> {
  try {
    const { characterId, userId } = socket.data;
    const { roomType, roomId, limit = 50, offset = 0 } = payload;

    // H10 SECURITY FIX: Per-event character ownership verification
    const isOwned = await verifyCharacterOwnership(socket);
    if (!isOwned) {
      socket.emit('chat:error', {
        error: 'Character verification failed. Please reconnect.',
        code: 'CHARACTER_VERIFICATION_FAILED'
      });
      socket.disconnect(true);
      return;
    }

    // SECURITY FIX: Rate limit history fetch to prevent DoS
    const historyLimitResult = await ChatRateLimiter.checkHistoryFetchLimit(userId);
    if (!historyLimitResult.allowed) {
      socket.emit('rate_limit_exceeded', {
        event: 'fetch_history',
        retryAfter: historyLimitResult.retryAfter || 60
      });
      return;
    }

    // Validate room type
    if (!isValidRoomType(roomType)) {
      socket.emit('chat:error', {
        error: 'Invalid room type',
        code: 'INVALID_ROOM_TYPE'
      });
      return;
    }

    // Validate room access
    try {
      await ChatService.validateRoomAccess(characterId, roomType as RoomType, roomId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Access denied';
      socket.emit('chat:error', {
        error: errorMessage,
        code: 'ACCESS_DENIED'
      });
      return;
    }

    // Fetch message history
    const messages = await ChatService.getMessageHistory(
      roomType as RoomType,
      roomId,
      limit,
      offset
    );

    // Send history to client
    socket.emit('chat:history', {
      roomType,
      roomId,
      messages,
      count: messages.length,
      limit,
      offset
    });

  } catch (error) {
    logger.error(`Error in handleFetchHistory for socket ${socket.id}:`, error);
    socket.emit('chat:error', {
      error: 'Failed to fetch message history',
      code: 'FETCH_HISTORY_FAILED'
    });
  }
}

/**
 * Handle typing indicator event
 */
async function handleTyping(
  socket: AuthenticatedSocket,
  payload: TypingPayload
): Promise<void> {
  try {
    const { characterName, userId } = socket.data;
    const { roomType, roomId } = payload;

    // SECURITY FIX: Rate limit typing indicators to prevent spam
    const typingLimitResult = await ChatRateLimiter.checkTypingLimit(userId);
    if (!typingLimitResult.allowed) {
      // Silently drop - don't notify client for typing rate limits
      return;
    }

    // Validate room type
    if (!isValidRoomType(roomType)) {
      return;
    }

    // Generate room name
    const roomName = getRoomName(roomType as RoomType, roomId);

    // Broadcast typing indicator to room (except sender)
    socket.to(roomName).emit('chat:typing', {
      characterName,
      roomType,
      roomId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error(`Error in handleTyping for socket ${socket.id}:`, error);
  }
}

export default {
  registerChatHandlers
};
