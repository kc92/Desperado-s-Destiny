/**
 * Karma Socket Event Handlers
 *
 * DEITY SYSTEM - Phase 3
 *
 * Handle all Socket.io karma/deity events with full validation and error handling.
 * Provides real-time updates for divine messages, blessings, curses, and karma changes.
 */

import { Socket } from 'socket.io';
import {
  AuthenticatedSocket,
  requireSocketAuth,
} from '../middleware/socketAuth';
import karmaService from '../services/karma.service';
import { DivineManifestation } from '../models/DivineManifestation.model';
import { CharacterKarma } from '../models/CharacterKarma.model';
import logger from '../utils/logger';

/**
 * Karma event payload interfaces
 */
interface AcknowledgeMessagePayload {
  manifestationId: string;
  characterId: string;
  response?: string;
}

interface GetKarmaSummaryPayload {
  characterId: string;
}

interface GetActiveEffectsPayload {
  characterId: string;
}

interface GetManifestationsPayload {
  characterId: string;
  limit?: number;
  offset?: number;
}

/**
 * Response interfaces for socket events
 */
interface KarmaSummaryResponse {
  success: boolean;
  data?: {
    characterId: string;
    dimensions: {
      mercy: number;
      cruelty: number;
      greed: number;
      charity: number;
      justice: number;
      chaos: number;
      honor: number;
      deception: number;
      survival: number;
      loyalty: number;
    };
    deityAffinities: {
      GAMBLER: number;
      OUTLAW_KING: number;
    };
    activeBlessings: number;
    activeCurses: number;
  };
  error?: string;
}

interface ActiveEffectsResponse {
  success: boolean;
  data?: {
    blessings: Array<{
      type: string;
      description: string;
      source: string;
      expiresAt?: Date;
    }>;
    curses: Array<{
      type: string;
      description: string;
      source: string;
      removalCondition?: string;
      expiresAt?: Date;
    }>;
  };
  error?: string;
}

interface ManifestationsResponse {
  success: boolean;
  data?: {
    manifestations: Array<{
      id: string;
      deity: string;
      type: string;
      message: string;
      urgency: number;
      delivered: boolean;
      createdAt: Date;
    }>;
    total: number;
  };
  error?: string;
}

/**
 * Verify that the requested characterId matches the socket's authenticated character
 * Returns the authenticated characterId if valid, null otherwise
 */
function verifyCharacterOwnership(socket: AuthenticatedSocket, requestedCharacterId: string): string | null {
  // Ensure both values exist and are non-empty strings
  const authenticatedCharacterId = socket.data?.characterId;
  if (!authenticatedCharacterId || typeof authenticatedCharacterId !== 'string') {
    return null;
  }
  if (!requestedCharacterId || typeof requestedCharacterId !== 'string') {
    return null;
  }
  // Verify ownership - use the authenticated characterId for queries
  if (authenticatedCharacterId !== requestedCharacterId) {
    return null;
  }
  return authenticatedCharacterId;
}

/**
 * Register all karma event handlers on a socket
 *
 * @param socket - Authenticated socket instance
 */
export function registerKarmaHandlers(socket: Socket): void {
  const authSocket = socket as AuthenticatedSocket;

  // Verify socket is authenticated
  try {
    requireSocketAuth(authSocket);
  } catch (error) {
    logger.error(
      `Socket ${socket.id} is not authenticated, cannot register karma handlers`
    );
    return;
  }

  // Register event handlers
  authSocket.on('karma:acknowledge', (payload: AcknowledgeMessagePayload) => {
    void handleAcknowledgeMessage(authSocket, payload);
  });

  authSocket.on('karma:get_summary', (payload: GetKarmaSummaryPayload) => {
    void handleGetKarmaSummary(authSocket, payload);
  });

  authSocket.on('karma:get_effects', (payload: GetActiveEffectsPayload) => {
    void handleGetActiveEffects(authSocket, payload);
  });

  authSocket.on('karma:get_manifestations', (payload: GetManifestationsPayload) => {
    void handleGetManifestations(authSocket, payload);
  });

  // Join user-specific room for receiving divine messages
  const userRoom = `user:${authSocket.data?.userId}`;
  authSocket.join(userRoom);

  logger.debug(`Karma handlers registered for socket ${socket.id}`);
}

/**
 * Handle acknowledge divine message event
 */
async function handleAcknowledgeMessage(
  socket: AuthenticatedSocket,
  payload: AcknowledgeMessagePayload
): Promise<void> {
  try {
    const { manifestationId, characterId, response } = payload;

    // Validate character ownership and get the authenticated characterId
    const verifiedCharacterId = verifyCharacterOwnership(socket, characterId);
    if (!verifiedCharacterId) {
      socket.emit('karma:acknowledge_result', {
        success: false,
        error: 'Character not owned by user or invalid request',
      });
      return;
    }

    // Validate manifestationId format
    if (!manifestationId || typeof manifestationId !== 'string') {
      socket.emit('karma:acknowledge_result', {
        success: false,
        error: 'Invalid manifestation ID',
      });
      return;
    }

    // Find and mark the manifestation as acknowledged
    // Use verifiedCharacterId (from socket auth) for the query, not the payload value
    // Note: 'acknowledged' is separate from 'delivered' - delivery happens via socket, acknowledgement is user action
    const manifestation = await DivineManifestation.findOneAndUpdate(
      {
        _id: manifestationId,
        targetCharacterId: verifiedCharacterId,
        acknowledged: false, // Only acknowledge if not already acknowledged
      },
      {
        acknowledged: true,
        responseAt: new Date(),
        playerResponse: response,
      },
      { new: true }
    );

    if (!manifestation) {
      socket.emit('karma:acknowledge_result', {
        success: false,
        error: 'Manifestation not found or already acknowledged',
      });
      return;
    }

    socket.emit('karma:acknowledge_result', {
      success: true,
      manifestationId,
    });

    logger.debug(
      `Divine message ${manifestationId} acknowledged by character ${verifiedCharacterId}`
    );
  } catch (error) {
    logger.error('Error acknowledging divine message:', error);
    socket.emit('karma:acknowledge_result', {
      success: false,
      error: 'Failed to acknowledge message',
    });
  }
}

/**
 * Handle get karma summary event
 */
async function handleGetKarmaSummary(
  socket: AuthenticatedSocket,
  payload: GetKarmaSummaryPayload
): Promise<void> {
  try {
    const { characterId } = payload;

    // Validate character ownership and get the authenticated characterId
    const verifiedCharacterId = verifyCharacterOwnership(socket, characterId);
    if (!verifiedCharacterId) {
      socket.emit('karma:summary_result', {
        success: false,
        error: 'Character not owned by user or invalid request',
      } as KarmaSummaryResponse);
      return;
    }

    // Get karma summary using verified characterId
    const summary = await karmaService.getKarmaSummary(verifiedCharacterId);

    socket.emit('karma:summary_result', {
      success: true,
      data: {
        characterId: verifiedCharacterId,
        dimensions: summary.karma.karma,
        deityAffinities: {
          GAMBLER: summary.karma.gamblerAffinity,
          OUTLAW_KING: summary.karma.outlawKingAffinity,
        },
        activeBlessings: summary.activeBlessings.length,
        activeCurses: summary.activeCurses.length,
      },
    } as KarmaSummaryResponse);
  } catch (error) {
    logger.error('Error getting karma summary:', error);
    socket.emit('karma:summary_result', {
      success: false,
      error: 'Failed to get karma summary',
    } as KarmaSummaryResponse);
  }
}

/**
 * Handle get active effects event
 */
async function handleGetActiveEffects(
  socket: AuthenticatedSocket,
  payload: GetActiveEffectsPayload
): Promise<void> {
  try {
    const { characterId } = payload;

    // Validate character ownership and get the authenticated characterId
    const verifiedCharacterId = verifyCharacterOwnership(socket, characterId);
    if (!verifiedCharacterId) {
      socket.emit('karma:effects_result', {
        success: false,
        error: 'Character not owned by user or invalid request',
      } as ActiveEffectsResponse);
      return;
    }

    // Get karma record with effects using verified characterId
    const karma = await CharacterKarma.findOne({ characterId: verifiedCharacterId });

    if (!karma) {
      socket.emit('karma:effects_result', {
        success: true,
        data: {
          blessings: [],
          curses: [],
        },
      } as ActiveEffectsResponse);
      return;
    }

    const now = new Date();

    // Filter to active effects only
    const activeBlessings = karma.blessings
      .filter((b: any) => !b.expiresAt || b.expiresAt > now)
      .map((b: any) => ({
        type: b.type,
        description: b.description,
        source: b.source,
        expiresAt: b.expiresAt,
      }));

    const activeCurses = karma.curses
      .filter((c: any) => !c.expiresAt || c.expiresAt > now)
      .map((c: any) => ({
        type: c.type,
        description: c.description,
        source: c.source,
        removalCondition: c.removalCondition,
        expiresAt: c.expiresAt,
      }));

    socket.emit('karma:effects_result', {
      success: true,
      data: {
        blessings: activeBlessings,
        curses: activeCurses,
      },
    } as ActiveEffectsResponse);
  } catch (error) {
    logger.error('Error getting active effects:', error);
    socket.emit('karma:effects_result', {
      success: false,
      error: 'Failed to get active effects',
    } as ActiveEffectsResponse);
  }
}

/**
 * Handle get manifestations event
 */
async function handleGetManifestations(
  socket: AuthenticatedSocket,
  payload: GetManifestationsPayload
): Promise<void> {
  try {
    const { characterId, limit = 20, offset = 0 } = payload;

    // Validate character ownership and get the authenticated characterId
    const verifiedCharacterId = verifyCharacterOwnership(socket, characterId);
    if (!verifiedCharacterId) {
      socket.emit('karma:manifestations_result', {
        success: false,
        error: 'Character not owned by user or invalid request',
      } as ManifestationsResponse);
      return;
    }

    // Bound pagination parameters to prevent resource exhaustion
    const boundedLimit = Math.min(Math.max(1, limit), 100);
    const boundedOffset = Math.max(0, offset);

    // Get manifestations using verified characterId
    const [manifestations, total] = await Promise.all([
      DivineManifestation.find({ targetCharacterId: verifiedCharacterId })
        .sort({ createdAt: -1 })
        .skip(boundedOffset)
        .limit(boundedLimit)
        .lean(),
      DivineManifestation.countDocuments({ targetCharacterId: verifiedCharacterId }),
    ]);

    socket.emit('karma:manifestations_result', {
      success: true,
      data: {
        manifestations: manifestations.map((m: any) => ({
          id: m._id.toString(),
          deity: m.deityName,
          type: m.type,
          message: m.message,
          urgency: m.urgency,
          delivered: m.delivered,
          createdAt: m.createdAt,
        })),
        total,
      },
    } as ManifestationsResponse);
  } catch (error) {
    logger.error('Error getting manifestations:', error);
    socket.emit('karma:manifestations_result', {
      success: false,
      error: 'Failed to get manifestations',
    } as ManifestationsResponse);
  }
}

/**
 * Emit karma update to a specific user
 * Called from karmaService when karma changes
 */
export async function emitKarmaUpdate(
  io: any,
  userId: string,
  characterId: string,
  dimension: string,
  delta: number,
  newValue: number
): Promise<void> {
  try {
    const userRoom = `user:${userId}`;
    io.to(userRoom).emit('karma:update', {
      characterId,
      dimension,
      delta,
      newValue,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error emitting karma update:', error);
  }
}

/**
 * Emit blessing granted notification to a specific user
 */
export async function emitBlessingGranted(
  io: any,
  userId: string,
  characterId: string,
  blessing: {
    type: string;
    description: string;
    source: string;
    duration?: number;
  }
): Promise<void> {
  try {
    const userRoom = `user:${userId}`;
    io.to(userRoom).emit('divine:blessing', {
      characterId,
      type: blessing.type,
      description: blessing.description,
      source: blessing.source,
      duration: blessing.duration,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error emitting blessing notification:', error);
  }
}

/**
 * Emit curse inflicted notification to a specific user
 */
export async function emitCurseInflicted(
  io: any,
  userId: string,
  characterId: string,
  curse: {
    type: string;
    description: string;
    source: string;
    removalCondition?: string;
  }
): Promise<void> {
  try {
    const userRoom = `user:${userId}`;
    io.to(userRoom).emit('divine:curse', {
      characterId,
      type: curse.type,
      description: curse.description,
      source: curse.source,
      removalCondition: curse.removalCondition,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error emitting curse notification:', error);
  }
}

/**
 * Emit deity affinity change notification
 */
export async function emitAffinityChange(
  io: any,
  userId: string,
  characterId: string,
  deity: string,
  delta: number,
  newValue: number
): Promise<void> {
  try {
    const userRoom = `user:${userId}`;
    io.to(userRoom).emit('karma:affinity_change', {
      characterId,
      deity,
      delta,
      newValue,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Error emitting affinity change:', error);
  }
}

export default {
  registerKarmaHandlers,
  emitKarmaUpdate,
  emitBlessingGranted,
  emitCurseInflicted,
  emitAffinityChange,
};
