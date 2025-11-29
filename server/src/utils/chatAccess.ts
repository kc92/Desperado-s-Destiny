/**
 * Chat Access Validation Utility
 *
 * Validates user access to different chat rooms
 */

import mongoose from 'mongoose';
import { Character } from '../models/Character.model';
import { RoomType } from '../models/Message.model';
import logger from './logger';

/**
 * Valid faction names
 */
const VALID_FACTIONS = ['SETTLER_ALLIANCE', 'NAHI_COALITION', 'FRONTERA'];

/**
 * Validate if a user can access a specific chat room
 *
 * @param characterId - The character's ObjectId
 * @param roomType - The type of room (GLOBAL, FACTION, GANG, WHISPER)
 * @param roomId - The room identifier
 * @returns True if access granted, false otherwise
 * @throws Error with specific message if validation fails
 */
export async function validateRoomAccess(
  characterId: string | mongoose.Types.ObjectId,
  roomType: RoomType,
  roomId: string
): Promise<boolean> {
  try {
    // Validate inputs
    if (!characterId || !roomType || !roomId) {
      throw new Error('Missing required parameters for room access validation');
    }

    // Convert string to ObjectId if needed
    const charId = typeof characterId === 'string'
      ? new mongoose.Types.ObjectId(characterId)
      : characterId;

    // GLOBAL room - always accessible to authenticated users
    if (roomType === RoomType.GLOBAL) {
      if (roomId !== 'global') {
        throw new Error('Global room ID must be "global"');
      }
      return true;
    }

    // Fetch character for faction and gang checks
    const character = await Character.findById(charId);

    if (!character || !character.isActive) {
      throw new Error('Character not found or inactive');
    }

    // FACTION room - must match character's faction
    if (roomType === RoomType.FACTION) {
      if (!VALID_FACTIONS.includes(roomId)) {
        throw new Error(`Invalid faction room ID: ${roomId}`);
      }

      if (character.faction !== roomId) {
        throw new Error(`Character is not a member of faction ${roomId}`);
      }

      return true;
    }

    // GANG room - character must be a member
    if (roomType === RoomType.GANG) {
      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        throw new Error('Gang room ID must be a valid ObjectId');
      }

      // Import Gang model dynamically to avoid circular dependencies
      const { Gang } = await import('../models/Gang.model');

      const gang = await Gang.findById(roomId);

      if (!gang) {
        throw new Error('Gang not found');
      }

      // Check if character is a member of the gang
      const isMember = gang.members.some(
        (member) => member.characterId.toString() === charId.toString()
      );

      if (!isMember) {
        throw new Error('Character is not a member of this gang');
      }

      return true;
    }

    // WHISPER room - character ID must be part of the whisper room ID
    if (roomType === RoomType.WHISPER) {
      if (!roomId.startsWith('whisper-')) {
        throw new Error('Whisper room ID must start with "whisper-"');
      }

      // Extract user IDs from whisper room ID
      // Format: whisper-{id1}-{id2} where IDs are sorted
      const parts = roomId.split('-');

      if (parts.length !== 3) {
        throw new Error('Invalid whisper room ID format');
      }

      const [, id1, id2] = parts;

      // Validate both IDs are valid ObjectIds
      if (!mongoose.Types.ObjectId.isValid(id1) || !mongoose.Types.ObjectId.isValid(id2)) {
        throw new Error('Whisper room contains invalid character IDs');
      }

      // Check if character ID matches either participant
      const charIdStr = charId.toString();
      if (charIdStr !== id1 && charIdStr !== id2) {
        throw new Error('Character is not a participant in this whisper conversation');
      }

      return true;
    }

    // Unknown room type
    throw new Error(`Unknown room type: ${roomType}`);

  } catch (error) {
    if (error instanceof Error) {
      logger.warn(`Room access validation failed: ${error.message}`);
      throw error;
    }
    logger.error('Unexpected error in room access validation:', error);
    throw new Error('Room access validation failed');
  }
}

/**
 * Generate a whisper room ID from two character IDs
 * IDs are sorted to ensure consistency
 *
 * @param characterId1 - First character's ID
 * @param characterId2 - Second character's ID
 * @returns Whisper room ID in format "whisper-{id1}-{id2}"
 */
export function generateWhisperRoomId(
  characterId1: string | mongoose.Types.ObjectId,
  characterId2: string | mongoose.Types.ObjectId
): string {
  const id1 = characterId1.toString();
  const id2 = characterId2.toString();

  // Sort IDs to ensure consistency regardless of order
  const [sortedId1, sortedId2] = [id1, id2].sort();

  return `whisper-${sortedId1}-${sortedId2}`;
}

/**
 * Extract character IDs from a whisper room ID
 *
 * @param whisperRoomId - The whisper room ID
 * @returns Tuple of [characterId1, characterId2]
 * @throws Error if room ID is invalid
 */
export function extractWhisperParticipants(
  whisperRoomId: string
): [string, string] {
  if (!whisperRoomId.startsWith('whisper-')) {
    throw new Error('Invalid whisper room ID');
  }

  const parts = whisperRoomId.split('-');

  if (parts.length !== 3) {
    throw new Error('Invalid whisper room ID format');
  }

  const [, id1, id2] = parts;

  if (!mongoose.Types.ObjectId.isValid(id1) || !mongoose.Types.ObjectId.isValid(id2)) {
    throw new Error('Whisper room contains invalid character IDs');
  }

  return [id1, id2];
}

/**
 * Validate room type
 *
 * @param roomType - The room type to validate
 * @returns True if valid, false otherwise
 */
export function isValidRoomType(roomType: string): roomType is RoomType {
  return Object.values(RoomType).includes(roomType as RoomType);
}

/**
 * Get room display name for logging/UI
 *
 * @param roomType - The room type
 * @param roomId - The room ID
 * @returns Human-readable room name
 */
export function getRoomDisplayName(roomType: RoomType, roomId: string): string {
  switch (roomType) {
    case RoomType.GLOBAL:
      return 'Global Chat';

    case RoomType.FACTION:
      return `${roomId} Faction Chat`;

    case RoomType.GANG:
      return `Gang Chat (${roomId})`;

    case RoomType.WHISPER:
      return 'Whisper';

    default:
      return 'Unknown Room';
  }
}

export default {
  validateRoomAccess,
  generateWhisperRoomId,
  extractWhisperParticipants,
  isValidRoomType,
  getRoomDisplayName
};
