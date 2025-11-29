/**
 * Socket.io Handlers
 *
 * Manages real-time communication for mail, friends, notifications, etc.
 */

import { Server as SocketServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import logger from '../utils/logger';
import { getRedisClient, isRedisConnected } from '../config/redis';

interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

interface AuthenticatedSocket extends Socket {
  userId?: string;
  characterId?: string;
}

/**
 * Initialize Socket.io handlers
 */
export function initializeSocketHandlers(io: SocketServer): void {
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, config.auth.jwtSecret) as JWTPayload;
      socket.userId = decoded.userId;

      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    logger.info(`Socket connected: ${socket.id}, User: ${socket.userId}`);

    socket.on('character:join', async (characterId: string) => {
      if (!characterId) {
        socket.emit('error', { message: 'Character ID required' });
        return;
      }

      socket.characterId = characterId;
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

      logger.info(`Character ${characterId} joined room ${roomName}`);

      socket.emit('character:joined', {
        characterId,
        room: roomName,
        message: 'Successfully joined character room'
      });

      io.to(roomName).emit('character:online', { characterId });
    });

    socket.on('character:leave', async (characterId: string) => {
      if (!characterId) {
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

      if (socket.characterId && isRedisConnected()) {
        try {
          const redisClient = getRedisClient();
          await redisClient.del(`session:character:${socket.characterId}`);

          const roomName = `character:${socket.characterId}`;
          io.to(roomName).emit('character:offline', {
            characterId: socket.characterId
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
