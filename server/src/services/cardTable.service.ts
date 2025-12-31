/**
 * CardTable Service
 *
 * Manages card game tables at tavern/saloon locations.
 * Handles table creation, player joining/leaving, and game start coordination.
 *
 * Design considerations:
 * - All operations validate player state and permissions
 * - Stakes are handled atomically with gold transactions
 * - Socket events are emitted for real-time updates
 * - AI players can fill empty seats on host request
 */

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { CardTable, ICardTable, ITableSeat, TableStatus } from '../models/CardTable.model';
import { Character, ICharacter } from '../models/Character.model';
import { Location } from '../models/Location.model';
import { GoldService } from './gold.service';
import { TransactionSource } from '../models/GoldTransaction.model';
import { TeamCardGameType, GAME_TYPE_CONFIGS } from '@desperados/shared';
import logger from '../utils/logger';
import { SecureRNG } from './base/SecureRNG';

/**
 * NPC names for AI players (Western themed)
 */
const NPC_NAMES = [
  'Slim Jackson',
  'One-Eyed Pete',
  'Whiskey Bill',
  'Lucky Lou',
  'Diamond Dan',
  'Poker Face Phil',
  'Dealer Dave',
  'Riverboat Rita',
  'Card Sharp Charlie',
  'Gamblin\' Gus',
  'Four-Finger Frank',
  'Ace McKenzie',
];

/**
 * Result interface for service operations
 */
export interface CardTableResult {
  success: boolean;
  table?: ICardTable;
  error?: string;
  code?: string;
}

/**
 * Stakes configuration for table creation
 */
export interface StakesConfig {
  enabled: boolean;
  buyIn: number;
}

/**
 * Location types that allow card tables
 */
const TAVERN_LOCATION_TYPES = ['saloon', 'tavern', 'cantina', 'gambling_hall'];

/**
 * CardTable Service class
 */
export class CardTableService {
  /**
   * Create a new card table at a location
   */
  static async createTable(
    characterId: string,
    locationId: string,
    gameType: TeamCardGameType,
    stakes?: StakesConfig
  ): Promise<CardTableResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get character
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Character not found', code: 'CHAR_NOT_FOUND' };
      }

      // Get location and verify it's a tavern/saloon
      const location = await Location.findById(locationId).session(session);
      if (!location) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Location not found', code: 'LOC_NOT_FOUND' };
      }

      if (!TAVERN_LOCATION_TYPES.includes(location.type)) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          error: 'Card tables can only be created at saloons and taverns',
          code: 'INVALID_LOCATION_TYPE',
        };
      }

      // Verify character is at this location
      if (character.currentLocation !== locationId &&
          character.currentLocation?.toString() !== locationId) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          error: 'You must be at the saloon to create a table',
          code: 'NOT_AT_LOCATION',
        };
      }

      // Check if player is already at a table
      const existingTable = await CardTable.findActiveTableByPlayer(characterId);
      if (existingTable) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          error: 'You are already seated at a table',
          code: 'ALREADY_AT_TABLE',
        };
      }

      // Validate game type
      if (!GAME_TYPE_CONFIGS[gameType]) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Invalid game type', code: 'INVALID_GAME_TYPE' };
      }

      // Handle stakes buy-in
      if (stakes?.enabled && stakes.buyIn > 0) {
        if (!character.hasDollars(stakes.buyIn)) {
          await session.abortTransaction();
          session.endSession();
          return {
            success: false,
            error: `Not enough gold for buy-in. Need $${stakes.buyIn}`,
            code: 'INSUFFICIENT_GOLD',
          };
        }

        // Deduct buy-in
        await GoldService.deductGold(
          character._id as mongoose.Types.ObjectId,
          stakes.buyIn,
          TransactionSource.GAMBLING_ENTRY_FEE,
          {
            description: `Card table buy-in at ${location.name}`,
            tableId: 'pending', // Will update after table creation
          },
          session
        );
      }

      // Create the table
      const tableId = `table_${uuidv4().slice(0, 8)}`;
      const table = new CardTable({
        tableId,
        locationId: location._id,
        locationName: location.name,
        hostId: character._id,
        hostName: character.name,
        gameType,
        status: TableStatus.WAITING,
        stakes: {
          enabled: stakes?.enabled || false,
          buyIn: stakes?.buyIn || 0,
          potTotal: stakes?.buyIn || 0,
        },
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      });

      // Place host in seat 0
      table.seats[0] = {
        seatIndex: 0,
        characterId: character._id as mongoose.Types.ObjectId,
        characterName: character.name,
        isReady: false,
        isNPC: false,
        joinedAt: new Date(),
      };

      await table.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`[CardTable] Table ${tableId} created by ${character.name} at ${location.name}`);

      return { success: true, table };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('[CardTable] Error creating table:', error);
      return { success: false, error: 'Failed to create table', code: 'CREATE_ERROR' };
    }
  }

  /**
   * Join an existing table at a specific seat
   */
  static async joinTable(
    characterId: string,
    tableId: string,
    seatIndex: number
  ): Promise<CardTableResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get character
      const character = await Character.findById(characterId).session(session);
      if (!character) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Character not found', code: 'CHAR_NOT_FOUND' };
      }

      // Get table
      const table = await CardTable.findOne({ tableId }).session(session);
      if (!table) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Table not found', code: 'TABLE_NOT_FOUND' };
      }

      // Verify table is waiting for players
      if (table.status !== TableStatus.WAITING) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Game has already started', code: 'GAME_STARTED' };
      }

      // Verify character is at the same location
      if (character.currentLocation !== table.locationId.toString() &&
          character.currentLocation?.toString() !== table.locationId.toString()) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          error: 'You must be at the saloon to join this table',
          code: 'NOT_AT_LOCATION',
        };
      }

      // Check if player is already at another table
      const existingTable = await CardTable.findActiveTableByPlayer(characterId);
      if (existingTable && existingTable.tableId !== tableId) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          error: 'You are already seated at another table',
          code: 'ALREADY_AT_TABLE',
        };
      }

      // Validate seat index
      if (seatIndex < 0 || seatIndex > 3) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Invalid seat index', code: 'INVALID_SEAT' };
      }

      // Check if seat is empty
      const seat = table.seats[seatIndex];
      if (seat.characterId !== null || seat.isNPC) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Seat is already taken', code: 'SEAT_TAKEN' };
      }

      // Handle stakes buy-in
      if (table.stakes.enabled && table.stakes.buyIn > 0) {
        if (!character.hasDollars(table.stakes.buyIn)) {
          await session.abortTransaction();
          session.endSession();
          return {
            success: false,
            error: `Not enough gold for buy-in. Need $${table.stakes.buyIn}`,
            code: 'INSUFFICIENT_GOLD',
          };
        }

        // Deduct buy-in
        await GoldService.deductGold(
          character._id as mongoose.Types.ObjectId,
          table.stakes.buyIn,
          TransactionSource.GAMBLING_ENTRY_FEE,
          {
            description: `Card table buy-in at ${table.locationName}`,
            tableId,
          },
          session
        );

        // Add to pot
        table.stakes.potTotal += table.stakes.buyIn;
      }

      // Seat the player
      table.seats[seatIndex] = {
        seatIndex: seatIndex as 0 | 1 | 2 | 3,
        characterId: character._id as mongoose.Types.ObjectId,
        characterName: character.name,
        isReady: false,
        isNPC: false,
        joinedAt: new Date(),
      };

      table.extendExpiry();
      await table.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`[CardTable] ${character.name} joined table ${tableId} at seat ${seatIndex}`);

      return { success: true, table };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('[CardTable] Error joining table:', error);
      return { success: false, error: 'Failed to join table', code: 'JOIN_ERROR' };
    }
  }

  /**
   * Leave a table
   */
  static async leaveTable(
    characterId: string,
    tableId: string
  ): Promise<CardTableResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get table
      const table = await CardTable.findOne({ tableId }).session(session);
      if (!table) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Table not found', code: 'TABLE_NOT_FOUND' };
      }

      // Find player's seat
      const seatIndex = table.getPlayerSeat(characterId);
      if (seatIndex === null) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'You are not at this table', code: 'NOT_AT_TABLE' };
      }

      // Can't leave during a game
      if (table.status === TableStatus.IN_PROGRESS) {
        await session.abortTransaction();
        session.endSession();
        return {
          success: false,
          error: 'Cannot leave during an active game',
          code: 'GAME_IN_PROGRESS',
        };
      }

      // Refund buy-in if stakes are enabled
      if (table.stakes.enabled && table.stakes.buyIn > 0) {
        await GoldService.addGold(
          new mongoose.Types.ObjectId(characterId),
          table.stakes.buyIn,
          TransactionSource.GAMBLING_SESSION_CASHOUT,
          {
            description: `Card table buy-in refund from ${table.locationName}`,
            tableId,
          },
          session
        );

        table.stakes.potTotal -= table.stakes.buyIn;
      }

      const wasHost = table.hostId.toString() === characterId;
      const characterName = table.seats[seatIndex].characterName;

      // Clear the seat
      table.seats[seatIndex] = {
        seatIndex: seatIndex as 0 | 1 | 2 | 3,
        characterId: null,
        characterName: null,
        isReady: false,
        isNPC: false,
        joinedAt: null,
      };

      // If host left, assign new host or disband
      if (wasHost) {
        const remainingPlayers = table.seats.filter(s => s.characterId !== null && !s.isNPC);
        if (remainingPlayers.length > 0) {
          // Assign new host to first remaining player
          const newHost = remainingPlayers[0];
          table.hostId = newHost.characterId!;
          table.hostName = newHost.characterName!;
          logger.info(`[CardTable] New host ${newHost.characterName} for table ${tableId}`);
        } else {
          // No players left, mark table as finished (will be cleaned up)
          table.status = TableStatus.FINISHED;

          // Refund any NPCs' virtual buy-ins back to pot distribution
          // (NPCs don't need refunds, pot goes to remaining players)
        }
      }

      table.extendExpiry();
      await table.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`[CardTable] ${characterName} left table ${tableId}`);

      return { success: true, table };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('[CardTable] Error leaving table:', error);
      return { success: false, error: 'Failed to leave table', code: 'LEAVE_ERROR' };
    }
  }

  /**
   * Set ready status for a player
   */
  static async setReady(
    characterId: string,
    tableId: string,
    isReady: boolean
  ): Promise<CardTableResult> {
    try {
      const table = await CardTable.findOne({ tableId });
      if (!table) {
        return { success: false, error: 'Table not found', code: 'TABLE_NOT_FOUND' };
      }

      if (table.status !== TableStatus.WAITING) {
        return { success: false, error: 'Game has already started', code: 'GAME_STARTED' };
      }

      const seatIndex = table.getPlayerSeat(characterId);
      if (seatIndex === null) {
        return { success: false, error: 'You are not at this table', code: 'NOT_AT_TABLE' };
      }

      table.seats[seatIndex].isReady = isReady;
      table.extendExpiry();
      await table.save();

      logger.info(`[CardTable] Player at seat ${seatIndex} set ready=${isReady} on table ${tableId}`);

      return { success: true, table };
    } catch (error) {
      logger.error('[CardTable] Error setting ready:', error);
      return { success: false, error: 'Failed to set ready status', code: 'READY_ERROR' };
    }
  }

  /**
   * Add an NPC to an empty seat (host only)
   */
  static async addNPC(
    characterId: string,
    tableId: string,
    seatIndex: number
  ): Promise<CardTableResult> {
    try {
      const table = await CardTable.findOne({ tableId });
      if (!table) {
        return { success: false, error: 'Table not found', code: 'TABLE_NOT_FOUND' };
      }

      // Only host can add NPCs
      if (table.hostId.toString() !== characterId) {
        return { success: false, error: 'Only the host can add AI players', code: 'NOT_HOST' };
      }

      if (table.status !== TableStatus.WAITING) {
        return { success: false, error: 'Game has already started', code: 'GAME_STARTED' };
      }

      // Validate seat
      if (seatIndex < 0 || seatIndex > 3) {
        return { success: false, error: 'Invalid seat index', code: 'INVALID_SEAT' };
      }

      const seat = table.seats[seatIndex];
      if (seat.characterId !== null || seat.isNPC) {
        return { success: false, error: 'Seat is already taken', code: 'SEAT_TAKEN' };
      }

      // Generate NPC name
      const usedNames = table.seats
        .filter(s => s.isNPC)
        .map(s => s.characterName);
      const availableNames = NPC_NAMES.filter(n => !usedNames.includes(n));
      const npcName = (availableNames.length > 0 ? SecureRNG.select(availableNames) : null) ||
                      `Dealer #${seatIndex + 1}`;

      // Add NPC to seat (NPCs are automatically ready)
      table.seats[seatIndex] = {
        seatIndex: seatIndex as 0 | 1 | 2 | 3,
        characterId: null,
        characterName: npcName,
        isReady: true,
        isNPC: true,
        joinedAt: new Date(),
      };

      table.extendExpiry();
      await table.save();

      logger.info(`[CardTable] NPC "${npcName}" added to table ${tableId} at seat ${seatIndex}`);

      return { success: true, table };
    } catch (error) {
      logger.error('[CardTable] Error adding NPC:', error);
      return { success: false, error: 'Failed to add AI player', code: 'NPC_ERROR' };
    }
  }

  /**
   * Kick a player from the table (host only)
   */
  static async kickPlayer(
    hostId: string,
    tableId: string,
    targetSeatIndex: number
  ): Promise<CardTableResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const table = await CardTable.findOne({ tableId }).session(session);
      if (!table) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Table not found', code: 'TABLE_NOT_FOUND' };
      }

      // Only host can kick
      if (table.hostId.toString() !== hostId) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Only the host can kick players', code: 'NOT_HOST' };
      }

      if (table.status !== TableStatus.WAITING) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Cannot kick during a game', code: 'GAME_IN_PROGRESS' };
      }

      // Validate seat
      if (targetSeatIndex < 0 || targetSeatIndex > 3) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Invalid seat index', code: 'INVALID_SEAT' };
      }

      const seat = table.seats[targetSeatIndex];

      // Can't kick yourself (use leave instead)
      if (seat.characterId?.toString() === hostId) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Use leave to exit the table', code: 'CANT_KICK_SELF' };
      }

      // Can't kick empty seat
      if (seat.characterId === null && !seat.isNPC) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Seat is already empty', code: 'SEAT_EMPTY' };
      }

      const kickedName = seat.characterName;
      const kickedCharacterId = seat.characterId;

      // Refund buy-in for kicked player (not for NPCs)
      if (!seat.isNPC && kickedCharacterId && table.stakes.enabled && table.stakes.buyIn > 0) {
        await GoldService.addGold(
          kickedCharacterId,
          table.stakes.buyIn,
          TransactionSource.GAMBLING_SESSION_CASHOUT,
          {
            description: `Card table buy-in refund (kicked) from ${table.locationName}`,
            tableId,
          },
          session
        );

        table.stakes.potTotal -= table.stakes.buyIn;
      }

      // Clear the seat
      table.seats[targetSeatIndex] = {
        seatIndex: targetSeatIndex as 0 | 1 | 2 | 3,
        characterId: null,
        characterName: null,
        isReady: false,
        isNPC: false,
        joinedAt: null,
      };

      table.extendExpiry();
      await table.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`[CardTable] ${kickedName} was kicked from table ${tableId}`);

      return { success: true, table };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('[CardTable] Error kicking player:', error);
      return { success: false, error: 'Failed to kick player', code: 'KICK_ERROR' };
    }
  }

  /**
   * Start the game when all seats are filled and ready
   * Returns the table - actual game session creation is handled by TeamCardGameService
   */
  static async startGame(tableId: string): Promise<CardTableResult> {
    try {
      const table = await CardTable.findOne({ tableId });
      if (!table) {
        return { success: false, error: 'Table not found', code: 'TABLE_NOT_FOUND' };
      }

      if (table.status !== TableStatus.WAITING) {
        return { success: false, error: 'Game has already started', code: 'GAME_STARTED' };
      }

      if (!table.canStartGame()) {
        return {
          success: false,
          error: 'All seats must be filled and ready to start',
          code: 'NOT_READY',
        };
      }

      // Mark as in progress
      table.status = TableStatus.IN_PROGRESS;
      table.extendExpiry(60); // Extend to 60 minutes for active games
      await table.save();

      logger.info(`[CardTable] Game starting on table ${tableId}`);

      return { success: true, table };
    } catch (error) {
      logger.error('[CardTable] Error starting game:', error);
      return { success: false, error: 'Failed to start game', code: 'START_ERROR' };
    }
  }

  /**
   * End a game and handle rewards distribution
   */
  static async endGame(
    tableId: string,
    winningTeam: 0 | 1 | null // null for draw/cancelled
  ): Promise<CardTableResult> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const table = await CardTable.findOne({ tableId }).session(session);
      if (!table) {
        await session.abortTransaction();
        session.endSession();
        return { success: false, error: 'Table not found', code: 'TABLE_NOT_FOUND' };
      }

      // Distribute pot if there was a winner and stakes
      if (winningTeam !== null && table.stakes.enabled && table.stakes.potTotal > 0) {
        // Team 0 = seats 0, 2; Team 1 = seats 1, 3
        const winningSeats = winningTeam === 0 ? [0, 2] : [1, 3];
        const humanWinners = winningSeats
          .map(i => table.seats[i])
          .filter(s => s.characterId !== null && !s.isNPC);

        if (humanWinners.length > 0) {
          const winningsPerPlayer = Math.floor(table.stakes.potTotal / humanWinners.length);

          for (const winner of humanWinners) {
            await GoldService.addGold(
              winner.characterId!,
              winningsPerPlayer,
              TransactionSource.GAMBLING_WIN,
              {
                description: `Card game winnings at ${table.locationName}`,
                tableId,
              },
              session
            );
          }

          logger.info(`[CardTable] Distributed ${table.stakes.potTotal} gold to winning team on table ${tableId}`);
        }
      } else if (winningTeam === null && table.stakes.enabled && table.stakes.potTotal > 0) {
        // Draw or cancelled - refund everyone
        for (const seat of table.seats) {
          if (seat.characterId && !seat.isNPC) {
            await GoldService.addGold(
              seat.characterId,
              table.stakes.buyIn,
              TransactionSource.GAMBLING_SESSION_CASHOUT,
              {
                description: `Card game refund (draw/cancelled) at ${table.locationName}`,
                tableId,
              },
              session
            );
          }
        }

        logger.info(`[CardTable] Refunded buy-ins for cancelled game on table ${tableId}`);
      }

      // Mark as finished (TTL will clean up)
      table.status = TableStatus.FINISHED;
      table.expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Cleanup in 5 minutes
      await table.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`[CardTable] Game ended on table ${tableId}, winner: team ${winningTeam}`);

      return { success: true, table };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      logger.error('[CardTable] Error ending game:', error);
      return { success: false, error: 'Failed to end game', code: 'END_ERROR' };
    }
  }

  /**
   * Get all active tables at a location
   */
  static async getTablesAtLocation(locationId: string): Promise<ICardTable[]> {
    try {
      const tables = await CardTable.findTablesAtLocation(locationId);
      return tables;
    } catch (error) {
      logger.error('[CardTable] Error getting tables:', error);
      return [];
    }
  }

  /**
   * Get a player's active table (if any)
   */
  static async getPlayerTable(characterId: string): Promise<ICardTable | null> {
    try {
      return await CardTable.findActiveTableByPlayer(characterId);
    } catch (error) {
      logger.error('[CardTable] Error getting player table:', error);
      return null;
    }
  }

  /**
   * Get a specific table by ID
   */
  static async getTable(tableId: string): Promise<ICardTable | null> {
    try {
      return await CardTable.findOne({ tableId });
    } catch (error) {
      logger.error('[CardTable] Error getting table:', error);
      return null;
    }
  }

  /**
   * Cleanup expired and abandoned tables
   * Should be called periodically by a scheduled job
   */
  static async cleanup(): Promise<number> {
    try {
      const count = await CardTable.cleanupExpiredTables();
      if (count > 0) {
        logger.info(`[CardTable] Cleaned up ${count} expired tables`);
      }
      return count;
    } catch (error) {
      logger.error('[CardTable] Error during cleanup:', error);
      return 0;
    }
  }
}

export default CardTableService;
