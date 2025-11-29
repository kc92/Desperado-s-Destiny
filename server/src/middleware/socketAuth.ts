/**
 * Socket Authentication Middleware
 *
 * Validates JWT tokens for Socket.io connections
 */

import { Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { User } from '../models/User.model';
import { Character } from '../models/Character.model';
import logger from '../utils/logger';

/**
 * Extended Socket.io Socket interface with authentication data
 */
export interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    characterId: string;
    characterName: string;
    userRole: 'user' | 'admin';
  };
}

/**
 * Socket.io authentication middleware
 * Validates JWT token and attaches user/character data to socket
 *
 * @param socket - Socket.io socket instance
 * @param next - Next middleware function
 */
export async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> {
  try {
    // Extract JWT from handshake auth
    const token = socket.handshake.auth.token as string | undefined;

    if (!token) {
      logger.warn(`Socket ${socket.id} connection attempt without token`);
      return next(new Error('Authentication required'));
    }

    // Verify JWT
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid token';
      logger.warn(`Socket ${socket.id} authentication failed: ${errorMessage}`);
      return next(new Error(errorMessage));
    }

    // Fetch user
    const user = await User.findById(decoded.userId);

    if (!user) {
      logger.warn(`Socket ${socket.id} authentication failed: User ${decoded.userId} not found`);
      return next(new Error('User not found'));
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn(`Socket ${socket.id} authentication failed: User ${decoded.userId} is inactive`);
      return next(new Error('Account is inactive'));
    }

    // Fetch active character (the one marked as selected)
    const character = await Character.findOne({
      userId: user._id,
      isActive: true
    }).sort({ lastActive: -1 }); // Get most recently active character

    if (!character) {
      logger.warn(`Socket ${socket.id} authentication failed: No active character for user ${user._id}`);
      return next(new Error('No active character found'));
    }

    // Attach authentication data to socket
    const authenticatedSocket = socket as AuthenticatedSocket;
    authenticatedSocket.data = {
      userId: user._id.toString(),
      characterId: character._id.toString(),
      characterName: character.name,
      userRole: user.role
    };

    logger.info(
      `Socket ${socket.id} authenticated successfully for character ${character.name} (${character._id})`
    );

    // Continue to next middleware
    next();
  } catch (error) {
    logger.error(`Socket authentication error for ${socket.id}:`, error);

    // Ensure we don't leak error details to client
    next(new Error('Authentication failed'));
  }
}

/**
 * Verify socket is authenticated
 * Utility function to check if socket has authentication data
 *
 * @param socket - Socket.io socket instance
 * @returns True if authenticated, false otherwise
 */
export function isSocketAuthenticated(socket: Socket): socket is AuthenticatedSocket {
  const data = (socket as AuthenticatedSocket).data;

  return (
    data !== undefined &&
    typeof data.userId === 'string' &&
    typeof data.characterId === 'string' &&
    typeof data.characterName === 'string' &&
    (data.userRole === 'user' || data.userRole === 'admin')
  );
}

/**
 * Require socket authentication
 * Throws error if socket is not authenticated
 *
 * @param socket - Socket.io socket instance
 * @throws Error if socket is not authenticated
 */
export function requireSocketAuth(socket: Socket): asserts socket is AuthenticatedSocket {
  if (!isSocketAuthenticated(socket)) {
    throw new Error('Socket is not authenticated');
  }
}

/**
 * Check if socket user is admin
 *
 * @param socket - Socket.io socket instance
 * @returns True if user is admin, false otherwise
 */
export function isSocketAdmin(socket: Socket): boolean {
  if (!isSocketAuthenticated(socket)) {
    return false;
  }

  return socket.data.userRole === 'admin';
}

/**
 * Require admin role for socket
 *
 * @param socket - Socket.io socket instance
 * @throws Error if socket is not admin
 */
export function requireSocketAdmin(socket: Socket): void {
  requireSocketAuth(socket);

  if (!isSocketAdmin(socket)) {
    throw new Error('Admin access required');
  }
}

/**
 * Extract socket authentication data safely
 *
 * @param socket - Socket.io socket instance
 * @returns Authentication data or null if not authenticated
 */
export function getSocketAuth(socket: Socket): {
  userId: string;
  characterId: string;
  characterName: string;
  userRole: 'user' | 'admin';
} | null {
  if (!isSocketAuthenticated(socket)) {
    return null;
  }

  return socket.data;
}

export default {
  socketAuthMiddleware,
  isSocketAuthenticated,
  requireSocketAuth,
  isSocketAdmin,
  requireSocketAdmin,
  getSocketAuth
};
