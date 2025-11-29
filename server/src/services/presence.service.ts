/**
 * Presence Service
 *
 * Redis-based online status tracking for characters
 */

import mongoose from 'mongoose';
import { getRedisClient } from '../config/redis';
import { Character } from '../models/Character.model';
import { RoomType } from '../models/Message.model';
import logger from '../utils/logger';

/**
 * Online user information
 */
export interface OnlineUser {
  characterId: string;
  characterName: string;
  lastSeen: Date;
}

/**
 * TTL for online status (2 minutes)
 * Client must send heartbeat every 30 seconds to maintain status
 */
const ONLINE_TTL_SECONDS = 120;

/**
 * Heartbeat interval (30 seconds)
 */
export const HEARTBEAT_INTERVAL_MS = 30000;

/**
 * Presence Service Class
 */
export class PresenceService {
  /**
   * Set character as online
   *
   * @param characterId - Character's ObjectId
   * @param characterName - Character's name
   */
  static async setOnline(
    characterId: string | mongoose.Types.ObjectId,
    characterName: string
  ): Promise<void> {
    try {
      const redis = getRedisClient();
      const charIdStr = characterId.toString();

      // Store online status with TTL
      const onlineData = JSON.stringify({
        characterId: charIdStr,
        characterName,
        lastSeen: new Date().toISOString()
      });

      await redis.setEx(
        `online:${charIdStr}`,
        ONLINE_TTL_SECONDS,
        onlineData
      );

      // Add to sorted set (score = timestamp)
      await redis.zAdd('online:all', {
        score: Date.now(),
        value: charIdStr
      });

      logger.debug(`Character ${characterName} (${charIdStr}) set online`);
    } catch (error) {
      logger.error('Error setting character online:', error);
      throw new Error('Failed to set character online status');
    }
  }

  /**
   * Set character as offline
   *
   * @param characterId - Character's ObjectId
   */
  static async setOffline(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<void> {
    try {
      const redis = getRedisClient();
      const charIdStr = characterId.toString();

      // Remove online status
      await redis.del(`online:${charIdStr}`);

      // Remove from sorted set
      await redis.zRem('online:all', charIdStr);

      logger.debug(`Character ${charIdStr} set offline`);
    } catch (error) {
      logger.error('Error setting character offline:', error);
      throw new Error('Failed to set character offline status');
    }
  }

  /**
   * Update heartbeat (extend TTL)
   *
   * @param characterId - Character's ObjectId
   */
  static async heartbeat(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<void> {
    try {
      const redis = getRedisClient();
      const charIdStr = characterId.toString();

      // Check if key exists
      const exists = await redis.exists(`online:${charIdStr}`);

      if (!exists) {
        throw new Error('Character is not online');
      }

      // Get current data
      const dataStr = await redis.get(`online:${charIdStr}`);

      if (!dataStr) {
        throw new Error('Character online data not found');
      }

      const data = JSON.parse(dataStr);

      // Update last seen timestamp
      data.lastSeen = new Date().toISOString();

      // Update with new TTL
      await redis.setEx(
        `online:${charIdStr}`,
        ONLINE_TTL_SECONDS,
        JSON.stringify(data)
      );

      // Update score in sorted set
      await redis.zAdd('online:all', {
        score: Date.now(),
        value: charIdStr
      });

      logger.debug(`Heartbeat received for character ${charIdStr}`);
    } catch (error) {
      logger.error('Error updating heartbeat:', error);
      throw new Error('Failed to update heartbeat');
    }
  }

  /**
   * Check if character is online
   *
   * @param characterId - Character's ObjectId
   * @returns True if online, false otherwise
   */
  static async isOnline(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<boolean> {
    try {
      const redis = getRedisClient();
      const charIdStr = characterId.toString();

      const exists = await redis.exists(`online:${charIdStr}`);
      return exists === 1;
    } catch (error) {
      logger.error('Error checking online status:', error);
      return false;
    }
  }

  /**
   * Get online user data
   *
   * @param characterId - Character's ObjectId
   * @returns Online user data or null if offline
   */
  static async getOnlineUser(
    characterId: string | mongoose.Types.ObjectId
  ): Promise<OnlineUser | null> {
    try {
      const redis = getRedisClient();
      const charIdStr = characterId.toString();

      const dataStr = await redis.get(`online:${charIdStr}`);

      if (!dataStr) {
        return null;
      }

      const data = JSON.parse(dataStr);

      return {
        characterId: data.characterId,
        characterName: data.characterName,
        lastSeen: new Date(data.lastSeen)
      };
    } catch (error) {
      logger.error('Error getting online user:', error);
      return null;
    }
  }

  /**
   * Get all online users
   *
   * @returns Array of online users
   */
  static async getAllOnlineUsers(): Promise<OnlineUser[]> {
    try {
      const redis = getRedisClient();

      // Get all character IDs from sorted set
      const characterIds = await redis.zRange('online:all', 0, -1);

      if (characterIds.length === 0) {
        return [];
      }

      // Get all online user data
      const users: OnlineUser[] = [];

      for (const charId of characterIds) {
        const user = await this.getOnlineUser(charId);
        if (user) {
          users.push(user);
        }
      }

      // Sort by character name
      users.sort((a, b) => a.characterName.localeCompare(b.characterName));

      return users;
    } catch (error) {
      logger.error('Error getting all online users:', error);
      return [];
    }
  }

  /**
   * Get online users for a specific room
   *
   * @param roomType - The room type
   * @param roomId - The room ID
   * @returns Array of online users in the room
   */
  static async getOnlineUsers(
    roomType: RoomType,
    roomId: string
  ): Promise<OnlineUser[]> {
    try {
      // Get all online users
      const allOnline = await this.getAllOnlineUsers();

      if (allOnline.length === 0) {
        return [];
      }

      // GLOBAL room - return all online users
      if (roomType === RoomType.GLOBAL) {
        return allOnline;
      }

      // For other room types, filter by room membership
      const characterIds = allOnline.map(u => u.characterId);

      // Fetch all characters
      const characters = await Character.find({
        _id: { $in: characterIds.map(id => new mongoose.Types.ObjectId(id)) },
        isActive: true
      });

      const filteredUsers: OnlineUser[] = [];

      for (const char of characters) {
        const onlineUser = allOnline.find(
          u => u.characterId === char._id.toString()
        );

        if (!onlineUser) {
          continue;
        }

        // FACTION room - filter by faction
        if (roomType === RoomType.FACTION) {
          if (char.faction === roomId) {
            filteredUsers.push(onlineUser);
          }
        }

        // GANG room - check gang membership
        else if (roomType === RoomType.GANG) {
          // Import Gang model dynamically
          try {
            const { Gang } = await import('../models/Gang.model');
            const gang = await Gang.findById(roomId);

            if (gang) {
              const isMember = gang.members.some(
                (member) =>
                  member.characterId.toString() === char._id.toString()
              );

              if (isMember) {
                filteredUsers.push(onlineUser);
              }
            }
          } catch (error) {
            // Gang model not available yet
            logger.debug('Gang model not available');
          }
        }

        // WHISPER room - only the two participants
        else if (roomType === RoomType.WHISPER) {
          if (roomId.includes(char._id.toString())) {
            filteredUsers.push(onlineUser);
          }
        }
      }

      // Sort by character name
      filteredUsers.sort((a, b) => a.characterName.localeCompare(b.characterName));

      return filteredUsers;
    } catch (error) {
      logger.error('Error getting online users for room:', error);
      return [];
    }
  }

  /**
   * Get online count for a room
   *
   * @param roomType - The room type
   * @param roomId - The room ID
   * @returns Number of online users
   */
  static async getOnlineCount(
    roomType: RoomType,
    roomId: string
  ): Promise<number> {
    try {
      const users = await this.getOnlineUsers(roomType, roomId);
      return users.length;
    } catch (error) {
      logger.error('Error getting online count:', error);
      return 0;
    }
  }

  /**
   * Cleanup expired online statuses
   * Called periodically by a background job
   */
  static async cleanupExpiredStatuses(): Promise<number> {
    try {
      const redis = getRedisClient();

      // Get all character IDs from sorted set
      const characterIds = await redis.zRange('online:all', 0, -1);

      let cleanedCount = 0;

      for (const charId of characterIds) {
        const exists = await redis.exists(`online:${charId}`);

        if (!exists) {
          // Key expired but still in sorted set - remove it
          await redis.zRem('online:all', charId);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        logger.info(`Cleaned up ${cleanedCount} expired online statuses`);
      }

      return cleanedCount;
    } catch (error) {
      logger.error('Error cleaning up expired statuses:', error);
      return 0;
    }
  }
}

export default PresenceService;
