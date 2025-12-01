/**
 * Socket.io Handlers
 *
 * Manages real-time communication for mail, friends, notifications, etc.
 */

import { Server as SocketServer } from 'socket.io';
import logger from '../utils/logger';
import { getRedisClient, isRedisConnected } from '../config/redis';
import { socketAuthMiddleware, AuthenticatedSocket } from '../middleware/socketAuth';

/**
 * Initialize Socket.io handlers
 */
export function initializeSocketHandlers(io: SocketServer): void {
  // Use robust authentication middleware
  io.use(socketAuthMiddleware);

  io.on('connection', async (rawSocket) => {
    const socket = rawSocket as AuthenticatedSocket;
    const { userId, characterId, characterName } = socket.data;

    logger.info(`Socket connected: ${socket.id}, User: ${userId}, Character: ${characterName} (${characterId})`);

    // Automatically join user-specific room for notifications
    const userRoom = `user:${userId}`;
    await socket.join(userRoom);

    socket.on('character:join', async (requestedCharacterId: string) => {
      // Validate that the requested character matches the authenticated character
      if (requestedCharacterId && requestedCharacterId !== characterId) {
        logger.warn(`Socket ${socket.id} attempted to join unauthorized character room: ${requestedCharacterId}`);
        socket.emit('error', { message: 'Unauthorized character access' });
        return;
      }

      const roomName = `character:${characterId}`;

      await socket.join(roomName);

      if (isRedisConnected()) {
        try {
          const redisClient = getRedisClient();
          await redisClient.set(
            `session:character:${characterId}`,
            socket.id,
            { EX: 3600 }
          );
        } catch (error) {
          logger.error('Error setting Redis session:', error);
        }
      }

      logger.info(`Character ${characterId} (${characterName}) joined room ${roomName}`);

      socket.emit('character:joined', {
        characterId,
        room: roomName,
        message: 'Successfully joined character room'
      });

      io.to(roomName).emit('character:online', { characterId });
    });

    socket.on('character:leave', async (targetCharacterId: string) => {
      // Only allow leaving the authenticated character's room
      if (targetCharacterId && targetCharacterId !== characterId) {
        return;
      }

      const roomName = `character:${characterId}`;
      await socket.leave(roomName);

      if (isRedisConnected()) {
        try {
          const redisClient = getRedisClient();
          await redisClient.del(`session:character:${characterId}`);
        } catch (error) {
          logger.error('Error deleting Redis session:', error);
        }
      }

      logger.info(`Character ${characterId} left room ${roomName}`);

      io.to(roomName).emit('character:offline', { characterId });
    });

    socket.on('disconnect', async (reason) => {
      logger.info(`Socket disconnected: ${socket.id} - Reason: ${reason}`);

      if (isRedisConnected()) {
        try {
          const redisClient = getRedisClient();
          await redisClient.del(`session:character:${characterId}`);

          const roomName = `character:${characterId}`;
          io.to(roomName).emit('character:offline', {
            characterId: characterId
          });
        } catch (error) {
          logger.error('Error cleaning up Redis session:', error);
        }
      }
    });

    socket.on('error', (error) => {
      logger.error(`Socket error: ${socket.id}`, error);
    });
  });

  logger.info('Socket.io handlers initialized');
}
