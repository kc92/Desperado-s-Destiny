/**
 * Admin Commands Utility
 *
 * Parse and execute admin commands in chat
 */

import { User } from '../models/User.model';
import { Character } from '../models/Character.model';
import { ChatRateLimiter } from '../middleware/chatRateLimiter';
import { RoomType } from '../models/Message.model';
import logger from './logger';

/**
 * Admin command result
 */
export interface AdminCommandResult {
  success: boolean;
  message: string;
  systemMessage?: string;
}

/**
 * Available admin commands
 */
export enum AdminCommand {
  MUTE = 'mute',
  UNMUTE = 'unmute',
  BAN = 'ban',
  UNBAN = 'unban',
  KICK = 'kick'
}

/**
 * Admin Commands Class
 */
export class AdminCommands {
  /**
   * Check if message is an admin command
   *
   * @param content - Message content
   * @returns True if it's a command, false otherwise
   */
  static isAdminCommand(content: string): boolean {
    return content.trim().startsWith('/');
  }

  /**
   * Parse admin command
   *
   * @param content - Message content
   * @returns Parsed command and arguments
   */
  static parseCommand(content: string): {
    command: string;
    args: string[];
  } | null {
    const trimmed = content.trim();

    if (!trimmed.startsWith('/')) {
      return null;
    }

    const parts = trimmed.slice(1).split(/\s+/);
    const command = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    if (!command) {
      return null;
    }

    return { command, args };
  }

  /**
   * Execute admin command
   *
   * @param userId - Admin user's ID
   * @param content - Command content
   * @param roomType - Current room type
   * @param roomId - Current room ID
   * @returns Command result
   */
  static async executeCommand(
    userId: string,
    content: string,
    roomType: RoomType,
    roomId: string
  ): Promise<AdminCommandResult> {
    try {
      // Check if user is admin
      const user = await User.findById(userId);

      if (!user || user.role !== 'admin') {
        return {
          success: false,
          message: 'Admin access required to use commands'
        };
      }

      // Parse command
      const parsed = this.parseCommand(content);

      if (!parsed) {
        return {
          success: false,
          message: 'Invalid command format'
        };
      }

      const { command, args } = parsed;

      // Execute specific command
      switch (command) {
        case AdminCommand.MUTE:
          return await this.executeMute(args);

        case AdminCommand.UNMUTE:
          return await this.executeUnmute(args);

        case AdminCommand.BAN:
          return await this.executeBan(args);

        case AdminCommand.UNBAN:
          return await this.executeUnban(args);

        case AdminCommand.KICK:
          return await this.executeKick(args);

        default:
          return {
            success: false,
            message: `Unknown command: ${command}`
          };
      }
    } catch (error) {
      logger.error('Error executing admin command:', error);
      return {
        success: false,
        message: 'Command execution failed'
      };
    }
  }

  /**
   * Execute mute command
   * Usage: /mute <username> <duration_minutes>
   *
   * @param args - Command arguments
   * @returns Command result
   */
  private static async executeMute(args: string[]): Promise<AdminCommandResult> {
    if (args.length < 2) {
      return {
        success: false,
        message: 'Usage: /mute <username> <duration_minutes>'
      };
    }

    const [characterName, durationStr] = args;
    const duration = parseInt(durationStr, 10);

    if (isNaN(duration) || duration <= 0) {
      return {
        success: false,
        message: 'Duration must be a positive number'
      };
    }

    if (duration > 1440) { // Max 24 hours
      return {
        success: false,
        message: 'Maximum mute duration is 1440 minutes (24 hours)'
      };
    }

    // Find character
    const character = await Character.findOne({
      name: new RegExp(`^${characterName}$`, 'i'),
      isActive: true
    });

    if (!character) {
      return {
        success: false,
        message: `Character "${characterName}" not found`
      };
    }

    // Mute user
    const durationSeconds = duration * 60;
    await ChatRateLimiter.muteUser(
      character.userId.toString(),
      character._id.toString(),
      durationSeconds
    );

    return {
      success: true,
      message: `Successfully muted ${character.name} for ${duration} minutes`,
      systemMessage: `${character.name} has been muted for ${duration} minutes`
    };
  }

  /**
   * Execute unmute command
   * Usage: /unmute <username>
   *
   * @param args - Command arguments
   * @returns Command result
   */
  private static async executeUnmute(args: string[]): Promise<AdminCommandResult> {
    if (args.length < 1) {
      return {
        success: false,
        message: 'Usage: /unmute <username>'
      };
    }

    const characterName = args[0];

    // Find character
    const character = await Character.findOne({
      name: new RegExp(`^${characterName}$`, 'i'),
      isActive: true
    });

    if (!character) {
      return {
        success: false,
        message: `Character "${characterName}" not found`
      };
    }

    // Unmute user
    await ChatRateLimiter.unmuteUser(character.userId.toString());

    return {
      success: true,
      message: `Successfully unmuted ${character.name}`,
      systemMessage: `${character.name} has been unmuted`
    };
  }

  /**
   * Execute ban command
   * Usage: /ban <username> [reason]
   *
   * @param args - Command arguments
   * @returns Command result
   */
  private static async executeBan(args: string[]): Promise<AdminCommandResult> {
    if (args.length < 1) {
      return {
        success: false,
        message: 'Usage: /ban <username> [reason]'
      };
    }

    const characterName = args[0];
    const reason = args.slice(1).join(' ') || 'Violation of chat rules';

    // Find character
    const character = await Character.findOne({
      name: new RegExp(`^${characterName}$`, 'i'),
      isActive: true
    });

    if (!character) {
      return {
        success: false,
        message: `Character "${characterName}" not found`
      };
    }

    // Ban user
    await ChatRateLimiter.banUser(character.userId.toString(), reason);

    return {
      success: true,
      message: `Successfully banned ${character.name} from chat`,
      systemMessage: `${character.name} has been banned from chat`
    };
  }

  /**
   * Execute unban command
   * Usage: /unban <username>
   *
   * @param args - Command arguments
   * @returns Command result
   */
  private static async executeUnban(args: string[]): Promise<AdminCommandResult> {
    if (args.length < 1) {
      return {
        success: false,
        message: 'Usage: /unban <username>'
      };
    }

    const characterName = args[0];

    // Find character
    const character = await Character.findOne({
      name: new RegExp(`^${characterName}$`, 'i'),
      isActive: true
    });

    if (!character) {
      return {
        success: false,
        message: `Character "${characterName}" not found`
      };
    }

    // Unban user
    await ChatRateLimiter.unbanUser(character.userId.toString());

    return {
      success: true,
      message: `Successfully unbanned ${character.name} from chat`,
      systemMessage: `${character.name} has been unbanned from chat`
    };
  }

  /**
   * Execute kick command
   * Usage: /kick <username>
   *
   * @param args - Command arguments
   * @returns Command result
   */
  private static async executeKick(args: string[]): Promise<AdminCommandResult> {
    if (args.length < 1) {
      return {
        success: false,
        message: 'Usage: /kick <username>'
      };
    }

    const characterName = args[0];

    // Find character
    const character = await Character.findOne({
      name: new RegExp(`^${characterName}$`, 'i'),
      isActive: true
    });

    if (!character) {
      return {
        success: false,
        message: `Character "${characterName}" not found`
      };
    }

    // Kick is implemented by the socket handler (disconnects the socket)
    return {
      success: true,
      message: `Kicked ${character.name} from chat`,
      systemMessage: `${character.name} has been kicked from chat`,
    };
  }

  /**
   * Get list of available commands
   *
   * @returns Array of command descriptions
   */
  static getCommandList(): Array<{ command: string; description: string; usage: string }> {
    return [
      {
        command: 'mute',
        description: 'Temporarily mute a user from chat',
        usage: '/mute <username> <duration_minutes>'
      },
      {
        command: 'unmute',
        description: 'Unmute a previously muted user',
        usage: '/unmute <username>'
      },
      {
        command: 'ban',
        description: 'Permanently ban a user from chat',
        usage: '/ban <username> [reason]'
      },
      {
        command: 'unban',
        description: 'Unban a previously banned user',
        usage: '/unban <username>'
      },
      {
        command: 'kick',
        description: 'Kick a user from the current chat session',
        usage: '/kick <username>'
      }
    ];
  }
}

export default AdminCommands;
