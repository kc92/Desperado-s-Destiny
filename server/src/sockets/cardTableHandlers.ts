/**
 * Card Table Socket Event Handlers
 *
 * Handle real-time card table events for tavern/saloon card games.
 * Players join location-based rooms to receive table updates.
 *
 * Events flow:
 * 1. Player enters saloon -> joins location room
 * 2. Player creates/joins table -> all in location room notified
 * 3. Player readies up -> table state broadcast
 * 4. All ready -> game starts, transition to team card game session
 */

import { Socket } from 'socket.io';
import {
  AuthenticatedSocket,
  requireSocketAuth,
} from '../middleware/socketAuth';
import { CardTableService } from '../services/cardTable.service';
import { CardTable, TableStatus } from '../models/CardTable.model';
import { TeamCardGameType } from '@desperados/shared';
import { getSocketIO } from '../config/socket';
import logger from '../utils/logger';

/**
 * Event payload interfaces
 */
interface JoinLocationPayload {
  locationId: string;
}

interface LeaveLocationPayload {
  locationId: string;
}

interface CreateTablePayload {
  locationId: string;
  gameType: TeamCardGameType;
  stakes?: {
    enabled: boolean;
    buyIn: number;
  };
}

interface JoinTablePayload {
  tableId: string;
  seatIndex: number;
}

interface LeaveTablePayload {
  tableId: string;
}

interface ReadyPayload {
  tableId: string;
  isReady: boolean;
}

interface AddNPCPayload {
  tableId: string;
  seatIndex: number;
}

interface KickPayload {
  tableId: string;
  seatIndex: number;
}

interface GetTablesPayload {
  locationId: string;
}

/**
 * Get location room name
 */
function getLocationRoom(locationId: string): string {
  return `cardTable:location:${locationId}`;
}

/**
 * Get table room name (for specific table events)
 */
function getTableRoom(tableId: string): string {
  return `cardTable:table:${tableId}`;
}

/**
 * Broadcast table list update to all players at a location
 */
async function broadcastTablesUpdate(locationId: string): Promise<void> {
  try {
    const io = getSocketIO();
    const tables = await CardTableService.getTablesAtLocation(locationId);
    const clientTables = tables.map(t => (t as any).toClientObject());

    io.to(getLocationRoom(locationId)).emit('cardTable:tables_update', {
      locationId,
      tables: clientTables,
    });

    logger.debug(`[CardTable] Broadcast ${clientTables.length} tables to location ${locationId}`);
  } catch (error) {
    logger.error('[CardTable] Error broadcasting tables update:', error);
  }
}

/**
 * Broadcast table state update to players at the table
 */
async function broadcastTableUpdate(tableId: string): Promise<void> {
  try {
    const io = getSocketIO();
    const table = await CardTableService.getTable(tableId);

    if (table) {
      const clientTable = (table as any).toClientObject();

      // Broadcast to table room
      io.to(getTableRoom(tableId)).emit('cardTable:table_update', {
        table: clientTable,
      });

      // Also broadcast to location room for list updates
      await broadcastTablesUpdate(table.locationId.toString());
    }
  } catch (error) {
    logger.error('[CardTable] Error broadcasting table update:', error);
  }
}

/**
 * Register all card table event handlers on a socket
 */
export function registerCardTableHandlers(socket: Socket): void {
  const authSocket = socket as AuthenticatedSocket;

  // Verify socket is authenticated
  try {
    requireSocketAuth(authSocket);
  } catch (error) {
    logger.error(`Socket ${socket.id} is not authenticated, cannot register card table handlers`);
    return;
  }

  // Join location room to receive table updates
  authSocket.on('cardTable:join_location', (payload: JoinLocationPayload) => {
    void handleJoinLocation(authSocket, payload);
  });

  // Leave location room
  authSocket.on('cardTable:leave_location', (payload: LeaveLocationPayload) => {
    void handleLeaveLocation(authSocket, payload);
  });

  // Create a new table
  authSocket.on('cardTable:create', (payload: CreateTablePayload) => {
    void handleCreateTable(authSocket, payload);
  });

  // Join an existing table
  authSocket.on('cardTable:join', (payload: JoinTablePayload) => {
    void handleJoinTable(authSocket, payload);
  });

  // Leave a table
  authSocket.on('cardTable:leave', (payload: LeaveTablePayload) => {
    void handleLeaveTable(authSocket, payload);
  });

  // Toggle ready status
  authSocket.on('cardTable:ready', (payload: ReadyPayload) => {
    void handleReady(authSocket, payload);
  });

  // Add NPC to seat (host only)
  authSocket.on('cardTable:add_npc', (payload: AddNPCPayload) => {
    void handleAddNPC(authSocket, payload);
  });

  // Kick player from table (host only)
  authSocket.on('cardTable:kick', (payload: KickPayload) => {
    void handleKick(authSocket, payload);
  });

  // Get tables at location
  authSocket.on('cardTable:get_tables', (payload: GetTablesPayload) => {
    void handleGetTables(authSocket, payload);
  });

  logger.debug(`Card table handlers registered for socket ${socket.id}`);
}

/**
 * Handle joining a location room for table updates
 */
async function handleJoinLocation(
  socket: AuthenticatedSocket,
  payload: JoinLocationPayload
): Promise<void> {
  try {
    const { locationId } = payload;

    if (!locationId) {
      socket.emit('cardTable:error', { error: 'Location ID required', code: 'INVALID_PAYLOAD' });
      return;
    }

    const roomName = getLocationRoom(locationId);
    await socket.join(roomName);

    // Send current tables to the joining player
    const tables = await CardTableService.getTablesAtLocation(locationId);
    const clientTables = tables.map(t => (t as any).toClientObject());

    socket.emit('cardTable:tables_update', {
      locationId,
      tables: clientTables,
    });

    logger.debug(`[CardTable] Socket ${socket.id} joined location room ${roomName}`);
  } catch (error) {
    logger.error('[CardTable] Error joining location:', error);
    socket.emit('cardTable:error', { error: 'Failed to join location', code: 'JOIN_ERROR' });
  }
}

/**
 * Handle leaving a location room
 */
async function handleLeaveLocation(
  socket: AuthenticatedSocket,
  payload: LeaveLocationPayload
): Promise<void> {
  try {
    const { locationId } = payload;

    if (!locationId) {
      return;
    }

    const roomName = getLocationRoom(locationId);
    await socket.leave(roomName);

    logger.debug(`[CardTable] Socket ${socket.id} left location room ${roomName}`);
  } catch (error) {
    logger.error('[CardTable] Error leaving location:', error);
  }
}

/**
 * Handle creating a new table
 */
async function handleCreateTable(
  socket: AuthenticatedSocket,
  payload: CreateTablePayload
): Promise<void> {
  try {
    const { characterId } = socket.data;
    const { locationId, gameType, stakes } = payload;

    if (!locationId || !gameType) {
      socket.emit('cardTable:error', {
        error: 'Location ID and game type required',
        code: 'INVALID_PAYLOAD',
      });
      return;
    }

    const result = await CardTableService.createTable(
      characterId,
      locationId,
      gameType,
      stakes
    );

    if (!result.success) {
      socket.emit('cardTable:error', {
        error: result.error,
        code: result.code,
      });
      return;
    }

    // Join the table room
    await socket.join(getTableRoom(result.table!.tableId));

    // Send success to creator
    socket.emit('cardTable:created', {
      table: (result.table as any).toClientObject(),
    });

    // Broadcast to location
    await broadcastTablesUpdate(locationId);

    logger.info(`[CardTable] Table ${result.table!.tableId} created by ${socket.data.characterName}`);
  } catch (error) {
    logger.error('[CardTable] Error creating table:', error);
    socket.emit('cardTable:error', { error: 'Failed to create table', code: 'CREATE_ERROR' });
  }
}

/**
 * Handle joining an existing table
 */
async function handleJoinTable(
  socket: AuthenticatedSocket,
  payload: JoinTablePayload
): Promise<void> {
  try {
    const { characterId } = socket.data;
    const { tableId, seatIndex } = payload;

    if (!tableId || seatIndex === undefined) {
      socket.emit('cardTable:error', {
        error: 'Table ID and seat index required',
        code: 'INVALID_PAYLOAD',
      });
      return;
    }

    const result = await CardTableService.joinTable(characterId, tableId, seatIndex);

    if (!result.success) {
      socket.emit('cardTable:error', {
        error: result.error,
        code: result.code,
      });
      return;
    }

    // Join the table room
    await socket.join(getTableRoom(tableId));

    // Send success to joiner
    socket.emit('cardTable:joined', {
      table: (result.table as any).toClientObject(),
      seatIndex,
    });

    // Broadcast table update
    await broadcastTableUpdate(tableId);

    logger.info(`[CardTable] ${socket.data.characterName} joined table ${tableId} at seat ${seatIndex}`);
  } catch (error) {
    logger.error('[CardTable] Error joining table:', error);
    socket.emit('cardTable:error', { error: 'Failed to join table', code: 'JOIN_ERROR' });
  }
}

/**
 * Handle leaving a table
 */
async function handleLeaveTable(
  socket: AuthenticatedSocket,
  payload: LeaveTablePayload
): Promise<void> {
  try {
    const { characterId } = socket.data;
    const { tableId } = payload;

    if (!tableId) {
      socket.emit('cardTable:error', {
        error: 'Table ID required',
        code: 'INVALID_PAYLOAD',
      });
      return;
    }

    // Get table first for location ID
    const table = await CardTableService.getTable(tableId);
    const locationId = table?.locationId.toString();

    const result = await CardTableService.leaveTable(characterId, tableId);

    if (!result.success) {
      socket.emit('cardTable:error', {
        error: result.error,
        code: result.code,
      });
      return;
    }

    // Leave the table room
    await socket.leave(getTableRoom(tableId));

    // Send confirmation
    socket.emit('cardTable:left', { tableId });

    // Broadcast table update (or removal if disbanded)
    if (result.table && result.table.status !== TableStatus.FINISHED) {
      await broadcastTableUpdate(tableId);
    } else if (locationId) {
      await broadcastTablesUpdate(locationId);
    }

    logger.info(`[CardTable] ${socket.data.characterName} left table ${tableId}`);
  } catch (error) {
    logger.error('[CardTable] Error leaving table:', error);
    socket.emit('cardTable:error', { error: 'Failed to leave table', code: 'LEAVE_ERROR' });
  }
}

/**
 * Handle ready status toggle
 */
async function handleReady(
  socket: AuthenticatedSocket,
  payload: ReadyPayload
): Promise<void> {
  try {
    const { characterId } = socket.data;
    const { tableId, isReady } = payload;

    if (!tableId || isReady === undefined) {
      socket.emit('cardTable:error', {
        error: 'Table ID and ready status required',
        code: 'INVALID_PAYLOAD',
      });
      return;
    }

    const result = await CardTableService.setReady(characterId, tableId, isReady);

    if (!result.success) {
      socket.emit('cardTable:error', {
        error: result.error,
        code: result.code,
      });
      return;
    }

    // Check if game should start
    if (result.table && (result.table as any).canStartGame()) {
      // Start the game
      const startResult = await CardTableService.startGame(tableId);

      if (startResult.success) {
        const io = getSocketIO();

        // Notify all players at the table that game is starting
        io.to(getTableRoom(tableId)).emit('cardTable:game_starting', {
          tableId,
          table: (startResult.table as any).toClientObject(),
        });

        logger.info(`[CardTable] Game starting on table ${tableId}`);
      }
    } else {
      // Broadcast table update
      await broadcastTableUpdate(tableId);
    }
  } catch (error) {
    logger.error('[CardTable] Error setting ready:', error);
    socket.emit('cardTable:error', { error: 'Failed to set ready status', code: 'READY_ERROR' });
  }
}

/**
 * Handle adding NPC to table
 */
async function handleAddNPC(
  socket: AuthenticatedSocket,
  payload: AddNPCPayload
): Promise<void> {
  try {
    const { characterId } = socket.data;
    const { tableId, seatIndex } = payload;

    if (!tableId || seatIndex === undefined) {
      socket.emit('cardTable:error', {
        error: 'Table ID and seat index required',
        code: 'INVALID_PAYLOAD',
      });
      return;
    }

    const result = await CardTableService.addNPC(characterId, tableId, seatIndex);

    if (!result.success) {
      socket.emit('cardTable:error', {
        error: result.error,
        code: result.code,
      });
      return;
    }

    // Check if game should start after adding NPC
    if (result.table && (result.table as any).canStartGame()) {
      const startResult = await CardTableService.startGame(tableId);

      if (startResult.success) {
        const io = getSocketIO();

        io.to(getTableRoom(tableId)).emit('cardTable:game_starting', {
          tableId,
          table: (startResult.table as any).toClientObject(),
        });

        logger.info(`[CardTable] Game starting on table ${tableId} after NPC added`);
      }
    } else {
      // Broadcast table update
      await broadcastTableUpdate(tableId);
    }
  } catch (error) {
    logger.error('[CardTable] Error adding NPC:', error);
    socket.emit('cardTable:error', { error: 'Failed to add AI player', code: 'NPC_ERROR' });
  }
}

/**
 * Handle kicking player from table
 */
async function handleKick(
  socket: AuthenticatedSocket,
  payload: KickPayload
): Promise<void> {
  try {
    const { characterId } = socket.data;
    const { tableId, seatIndex } = payload;

    if (!tableId || seatIndex === undefined) {
      socket.emit('cardTable:error', {
        error: 'Table ID and seat index required',
        code: 'INVALID_PAYLOAD',
      });
      return;
    }

    // Get the kicked player's ID before kicking
    const table = await CardTableService.getTable(tableId);
    const kickedPlayerId = table?.seats[seatIndex]?.characterId?.toString();

    const result = await CardTableService.kickPlayer(characterId, tableId, seatIndex);

    if (!result.success) {
      socket.emit('cardTable:error', {
        error: result.error,
        code: result.code,
      });
      return;
    }

    // Notify kicked player if they were a real player
    if (kickedPlayerId) {
      const io = getSocketIO();
      const sockets = await io.fetchSockets();

      for (const s of sockets) {
        const authS = s as unknown as AuthenticatedSocket;
        if (authS.data?.characterId === kickedPlayerId) {
          s.emit('cardTable:kicked', { tableId });
          await s.leave(getTableRoom(tableId));
          break;
        }
      }
    }

    // Broadcast table update
    await broadcastTableUpdate(tableId);

    logger.info(`[CardTable] Player at seat ${seatIndex} kicked from table ${tableId}`);
  } catch (error) {
    logger.error('[CardTable] Error kicking player:', error);
    socket.emit('cardTable:error', { error: 'Failed to kick player', code: 'KICK_ERROR' });
  }
}

/**
 * Handle get tables request
 */
async function handleGetTables(
  socket: AuthenticatedSocket,
  payload: GetTablesPayload
): Promise<void> {
  try {
    const { locationId } = payload;

    if (!locationId) {
      socket.emit('cardTable:error', {
        error: 'Location ID required',
        code: 'INVALID_PAYLOAD',
      });
      return;
    }

    const tables = await CardTableService.getTablesAtLocation(locationId);
    const clientTables = tables.map(t => (t as any).toClientObject());

    socket.emit('cardTable:tables_update', {
      locationId,
      tables: clientTables,
    });
  } catch (error) {
    logger.error('[CardTable] Error getting tables:', error);
    socket.emit('cardTable:error', { error: 'Failed to get tables', code: 'GET_ERROR' });
  }
}

export default { registerCardTableHandlers };
