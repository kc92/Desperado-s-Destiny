/**
 * Socket.io Configuration
 *
 * Initialize and configure Socket.io server with authentication and event handlers
 * Uses Redis adapter for horizontal scaling across multiple server instances
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { config } from './index';
import logger from '../utils/logger';
import { socketAuthMiddleware, AuthenticatedSocket } from '../middleware/socketAuth';
import { registerChatHandlers } from '../sockets/chatHandlers';
import { registerDuelHandlers } from '../sockets/duelHandlers';
import { registerKarmaHandlers } from '../sockets/karmaHandlers';
import PresenceService from '../services/presence.service';

/**
 * Redis pub/sub clients for Socket.io adapter
 */
let pubClient: ReturnType<typeof createClient> | null = null;
let subClient: ReturnType<typeof createClient> | null = null;

/**
 * Socket.io server instance
 */
let io: SocketIOServer | null = null;

/**
 * Heartbeat interval (30 seconds)
 */
const HEARTBEAT_INTERVAL_MS = 30000;

/**
 * Initialize Socket.io server
 *
 * @param httpServer - HTTP server instance
 * @returns Socket.io server instance
 */
export async function initializeSocketIO(httpServer: HTTPServer): Promise<SocketIOServer> {
  try {
    logger.info('Initializing Socket.io server with Redis adapter...');

    // Create Socket.io server with configuration
    // Only include localhost origins in development mode
    const allowedOrigins = config.isProduction
      ? [config.server.frontendUrl]
      : [
          config.server.frontendUrl,
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:5173',
          'http://localhost:5174',
          'http://localhost:5175'
        ];

    io = new SocketIOServer(httpServer, {
      cors: {
        origin: (origin, callback) => {
          // Allow requests with no origin (like mobile apps)
          if (!origin) return callback(null, true);

          if (allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
      upgradeTimeout: 30000,
      maxHttpBufferSize: 1e6, // 1MB
      allowEIO3: true
    });

    // Set up Redis adapter for horizontal scaling
    // This allows multiple server instances to share Socket.io events
    try {
      const redisUrl = config.database.redisUrl;
      logger.info('Setting up Redis adapter for Socket.io...');

      pubClient = createClient({
        url: redisUrl,
        password: config.database.redisPassword,
      });
      subClient = pubClient.duplicate();

      // Handle Redis connection errors gracefully
      pubClient.on('error', (err) => {
        logger.error('Socket.io Redis pub client error:', err);
      });
      subClient.on('error', (err) => {
        logger.error('Socket.io Redis sub client error:', err);
      });

      await Promise.all([pubClient.connect(), subClient.connect()]);

      io.adapter(createAdapter(pubClient, subClient));
      logger.info('Socket.io Redis adapter connected - horizontal scaling enabled');
    } catch (redisError) {
      logger.warn('Failed to set up Redis adapter for Socket.io:', redisError);
      logger.warn('Socket.io will run in single-instance mode (no horizontal scaling)');
      // Continue without Redis adapter - single instance mode still works
    }

    // Apply authentication middleware
    io.use(socketAuthMiddleware);

    // Connection handler
    io.on('connection', (socket: Socket) => {
      handleConnection(socket as AuthenticatedSocket);
    });

    // Error handler
    io.on('error', (error: Error) => {
      logger.error('Socket.io server error:', error);
    });

    logger.info('Socket.io server initialized successfully');

    return io;
  } catch (error) {
    logger.error('Failed to initialize Socket.io:', error);
    throw new Error('Socket.io initialization failed');
  }
}

/**
 * Handle new socket connection
 *
 * @param socket - Authenticated socket instance
 */
function handleConnection(socket: AuthenticatedSocket): void {
  const { characterId, characterName } = socket.data;

  logger.info(
    `Client connected: ${socket.id} (Character: ${characterName}, ID: ${characterId})`
  );

  // Set character as online
  PresenceService.setOnline(characterId, characterName)
    .catch(error => {
      logger.error(`Error setting character ${characterId} online:`, error);
    });

  // Register chat event handlers
  registerChatHandlers(socket);

  // Register duel event handlers
  registerDuelHandlers(socket);

  // Register karma/deity event handlers
  registerKarmaHandlers(socket);

  // Setup heartbeat mechanism
  setupHeartbeat(socket);

  // Handle disconnection
  socket.on('disconnect', (reason: string) => {
    handleDisconnection(socket, reason);
  });

  // Handle errors
  socket.on('error', (error: Error) => {
    logger.error(`Socket ${socket.id} error:`, error);
  });

  // Emit connection success
  socket.emit('connected', {
    socketId: socket.id,
    characterName,
    timestamp: new Date().toISOString()
  });
}

/**
 * Setup heartbeat mechanism for socket
 *
 * @param socket - Authenticated socket instance
 */
function setupHeartbeat(socket: AuthenticatedSocket): void {
  const { characterId } = socket.data;

  // Client heartbeat event
  socket.on('heartbeat', async () => {
    try {
      await PresenceService.heartbeat(characterId);

      // Send acknowledgment
      socket.emit('heartbeat_ack', {
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Heartbeat error for socket ${socket.id}:`, error);
    }
  });

  // Cleanup heartbeat on disconnect
  socket.on('disconnect', () => {
    // Heartbeat cleanup handled in handleDisconnection
  });
}

/**
 * Handle socket disconnection
 *
 * @param socket - Authenticated socket instance
 * @param reason - Disconnection reason
 */
function handleDisconnection(socket: AuthenticatedSocket, reason: string): void {
  const { characterId, characterName } = socket.data;

  logger.info(
    `Client disconnected: ${socket.id} (Character: ${characterName}) - Reason: ${reason}`
  );

  // Set character as offline
  PresenceService.setOffline(characterId)
    .catch(error => {
      logger.error(`Error setting character ${characterId} offline:`, error);
    });

  // Leave all rooms
  const rooms = Array.from(socket.rooms);
  rooms.forEach(room => {
    if (room !== socket.id) {
      socket.leave(room);
      logger.debug(`Socket ${socket.id} left room ${room}`);
    }
  });
}

/**
 * Get Socket.io server instance
 *
 * @returns Socket.io server instance
 * @throws Error if Socket.io is not initialized
 */
export function getSocketIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io server is not initialized');
  }
  return io;
}

/**
 * Get Socket.io server instance (safe version - returns null if not initialized)
 *
 * @returns Socket.io server instance or null
 */
export function getIO(): SocketIOServer | null {
  return io;
}

/**
 * Emit event to specific room
 *
 * @param roomId - Room identifier
 * @param event - Event name
 * @param data - Event data
 */
export function emitToRoom(
  roomId: string,
  event: string,
  data: unknown
): void {
  try {
    const socketIO = getSocketIO();
    socketIO.to(roomId).emit(event, data);
    logger.debug(`Emitted ${event} to room ${roomId}`);
  } catch (error) {
    logger.error(`Error emitting to room ${roomId}:`, error);
  }
}

/**
 * Emit event to specific socket
 *
 * @param socketId - Socket ID
 * @param event - Event name
 * @param data - Event data
 */
export function emitToSocket(
  socketId: string,
  event: string,
  data: unknown
): void {
  try {
    const socketIO = getSocketIO();
    socketIO.to(socketId).emit(event, data);
    logger.debug(`Emitted ${event} to socket ${socketId}`);
  } catch (error) {
    logger.error(`Error emitting to socket ${socketId}:`, error);
  }
}

/**
 * Broadcast event to all connected clients
 *
 * @param event - Event name
 * @param data - Event data
 */
export function broadcastEvent(event: string, data: unknown): void {
  try {
    const socketIO = getSocketIO();
    socketIO.emit(event, data);
    logger.debug(`Broadcast ${event} to all clients`);
  } catch (error) {
    logger.error(`Error broadcasting ${event}:`, error);
  }
}

/**
 * Get all connected sockets
 *
 * @returns Array of socket IDs
 */
export async function getConnectedSockets(): Promise<string[]> {
  try {
    const socketIO = getSocketIO();
    const sockets = await socketIO.fetchSockets();
    return sockets.map(s => s.id);
  } catch (error) {
    logger.error('Error getting connected sockets:', error);
    return [];
  }
}

/**
 * Get number of connected clients
 *
 * @returns Number of connected clients
 */
export async function getConnectionCount(): Promise<number> {
  try {
    const sockets = await getConnectedSockets();
    return sockets.length;
  } catch (error) {
    logger.error('Error getting connection count:', error);
    return 0;
  }
}

/**
 * Disconnect a specific socket
 *
 * @param socketId - Socket ID to disconnect
 * @param reason - Disconnect reason
 */
export async function disconnectSocket(
  socketId: string,
  reason: string = 'Server initiated disconnect'
): Promise<void> {
  try {
    const socketIO = getSocketIO();
    const sockets = await socketIO.fetchSockets();
    const socket = sockets.find(s => s.id === socketId);

    if (socket) {
      socket.disconnect(true);
      logger.info(`Disconnected socket ${socketId}: ${reason}`);
    } else {
      logger.warn(`Socket ${socketId} not found for disconnect`);
    }
  } catch (error) {
    logger.error(`Error disconnecting socket ${socketId}:`, error);
  }
}

/**
 * Disconnect socket by character ID
 *
 * @param characterId - Character ID
 * @param reason - Disconnect reason
 */
export async function disconnectCharacter(
  characterId: string,
  reason: string = 'Server initiated disconnect'
): Promise<void> {
  try {
    const socketIO = getSocketIO();
    const sockets = await socketIO.fetchSockets();

    for (const socket of sockets) {
      const authSocket = socket as unknown as AuthenticatedSocket;
      if (authSocket.data?.characterId === characterId) {
        socket.disconnect(true);
        logger.info(`Disconnected character ${characterId}: ${reason}`);
        return;
      }
    }

    logger.warn(`No socket found for character ${characterId}`);
  } catch (error) {
    logger.error(`Error disconnecting character ${characterId}:`, error);
  }
}

/**
 * Shutdown Socket.io server gracefully
 */
export async function shutdownSocketIO(): Promise<void> {
  try {
    if (!io) {
      return;
    }

    logger.info('Shutting down Socket.io server...');

    // Get all connected sockets
    const sockets = await io.fetchSockets();

    // Disconnect all clients
    for (const socket of sockets) {
      socket.disconnect(true);
    }

    // Close the server
    io.close();
    io = null;

    // Close Redis adapter connections
    if (pubClient) {
      await pubClient.quit();
      pubClient = null;
      logger.info('Socket.io Redis pub client closed');
    }
    if (subClient) {
      await subClient.quit();
      subClient = null;
      logger.info('Socket.io Redis sub client closed');
    }

    logger.info('Socket.io server shut down successfully');
  } catch (error) {
    logger.error('Error shutting down Socket.io:', error);
  }
}

export default {
  initializeSocketIO,
  getSocketIO,
  getIO,
  emitToRoom,
  emitToSocket,
  broadcastEvent,
  getConnectedSockets,
  getConnectionCount,
  disconnectSocket,
  disconnectCharacter,
  shutdownSocketIO
};
