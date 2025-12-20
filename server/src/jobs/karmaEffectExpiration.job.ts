/**
 * Karma Effect Expiration Job
 *
 * DEITY SYSTEM - Phase 3
 *
 * Cleans up expired blessings and curses from character karma records.
 * Runs hourly to ensure effects don't persist beyond their expiration.
 */

import { CharacterKarma } from '../models/CharacterKarma.model';
import { DivineManifestation } from '../models/DivineManifestation.model';
import { Character } from '../models/Character.model';
import { getIO } from '../config/socket';
import logger from '../utils/logger';

interface ExpiredEffect {
  characterId: string;
  characterName: string;
  effectType: 'blessing' | 'curse';
  effectName: string;
  source: string;
}

/**
 * Process expired blessings and curses
 */
export async function processExpiredEffects(): Promise<{
  blessingsExpired: number;
  cursesExpired: number;
  charactersProcessed: number;
  notificationsSent: number;
}> {
  const startTime = Date.now();
  let blessingsExpired = 0;
  let cursesExpired = 0;
  let charactersProcessed = 0;
  let notificationsSent = 0;

  try {
    const now = new Date();

    // Find karma records with expired effects
    const karmaRecords = await CharacterKarma.find({
      $or: [
        { 'blessings.expiresAt': { $lte: now, $ne: null } },
        { 'curses.expiresAt': { $lte: now, $ne: null } },
      ],
    });

    if (karmaRecords.length === 0) {
      return {
        blessingsExpired: 0,
        cursesExpired: 0,
        charactersProcessed: 0,
        notificationsSent: 0,
      };
    }

    logger.debug(`Processing ${karmaRecords.length} karma records for expired effects`);

    const io = getIO();
    const expiredEffects: ExpiredEffect[] = [];

    for (const karma of karmaRecords) {
      try {
        // Get character info for notifications
        const character = await Character.findById(karma.characterId)
          .select('userId name')
          .lean();

        if (!character) {
          // Character deleted - clean up the karma record entirely
          await CharacterKarma.deleteOne({ _id: karma._id });
          continue;
        }

        // Track expired blessings before removal
        const expiredBlessings = karma.blessings.filter(
          (b: any) => b.expiresAt && b.expiresAt <= now
        );

        // Track expired curses before removal
        const expiredCurses = karma.curses.filter(
          (c: any) => c.expiresAt && c.expiresAt <= now
        );

        // Remove expired blessings
        karma.blessings = karma.blessings.filter(
          (b: any) => !b.expiresAt || b.expiresAt > now
        );

        // Remove expired curses
        karma.curses = karma.curses.filter(
          (c: any) => !c.expiresAt || c.expiresAt > now
        );

        // Save if any changes were made
        if (expiredBlessings.length > 0 || expiredCurses.length > 0) {
          await karma.save();
          charactersProcessed++;
          blessingsExpired += expiredBlessings.length;
          cursesExpired += expiredCurses.length;

          // Create expiration notifications
          for (const blessing of expiredBlessings) {
            expiredEffects.push({
              characterId: karma.characterId.toString(),
              characterName: character.name,
              effectType: 'blessing',
              effectName: blessing.type,
              source: blessing.source,
            });
          }

          for (const curse of expiredCurses) {
            expiredEffects.push({
              characterId: karma.characterId.toString(),
              characterName: character.name,
              effectType: 'curse',
              effectName: curse.type,
              source: curse.source,
            });
          }

          // Send socket notifications if user is online
          if (io && character.userId) {
            const userRoom = `user:${character.userId}`;
            const socketsInRoom = await io.in(userRoom).fetchSockets();

            if (socketsInRoom.length > 0) {
              // Notify about expired blessings
              for (const blessing of expiredBlessings) {
                io.to(userRoom).emit('divine:blessing_expired', {
                  characterId: karma.characterId,
                  type: blessing.type,
                  source: blessing.source,
                  message: `The ${blessing.source}'s blessing of ${blessing.type} has faded.`,
                });
                notificationsSent++;
              }

              // Notify about expired curses
              for (const curse of expiredCurses) {
                io.to(userRoom).emit('divine:curse_expired', {
                  characterId: karma.characterId,
                  type: curse.type,
                  source: curse.source,
                  message: `The ${curse.source}'s curse of ${curse.type} has lifted.`,
                });
                notificationsSent++;
              }

              // Send overall karma update
              io.to(userRoom).emit('karma:update', {
                characterId: karma.characterId,
                blessingsRemaining: karma.blessings.length,
                cursesRemaining: karma.curses.length,
              });
            }
          }

          logger.debug(
            `Expired effects for ${character.name}: ${expiredBlessings.length} blessings, ${expiredCurses.length} curses`
          );
        }
      } catch (error) {
        logger.error(`Error processing karma record ${karma._id}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    logger.info(
      `Karma expiration: ${blessingsExpired} blessings, ${cursesExpired} curses expired ` +
        `across ${charactersProcessed} characters in ${duration}ms`
    );

    return {
      blessingsExpired,
      cursesExpired,
      charactersProcessed,
      notificationsSent,
    };
  } catch (error) {
    logger.error('Error in karma effect expiration job:', error);
    throw error;
  }
}

/**
 * Get statistics about active karma effects
 */
export async function getKarmaEffectStats(): Promise<{
  totalBlessings: number;
  totalCurses: number;
  expiringIn24h: {
    blessings: number;
    curses: number;
  };
  byDeity: Record<string, { blessings: number; curses: number }>;
}> {
  try {
    const now = new Date();
    const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const karmaRecords = await CharacterKarma.find({
      $or: [{ 'blessings.0': { $exists: true } }, { 'curses.0': { $exists: true } }],
    });

    let totalBlessings = 0;
    let totalCurses = 0;
    let expiringBlessings = 0;
    let expiringCurses = 0;
    const byDeity: Record<string, { blessings: number; curses: number }> = {};

    for (const karma of karmaRecords) {
      // Count active blessings
      for (const blessing of karma.blessings) {
        if (!blessing.expiresAt || blessing.expiresAt > now) {
          totalBlessings++;

          if (!byDeity[blessing.source]) {
            byDeity[blessing.source] = { blessings: 0, curses: 0 };
          }
          byDeity[blessing.source].blessings++;

          // Check if expiring soon
          if (blessing.expiresAt && blessing.expiresAt <= in24h) {
            expiringBlessings++;
          }
        }
      }

      // Count active curses
      for (const curse of karma.curses) {
        if (!curse.expiresAt || curse.expiresAt > now) {
          totalCurses++;

          if (!byDeity[curse.source]) {
            byDeity[curse.source] = { blessings: 0, curses: 0 };
          }
          byDeity[curse.source].curses++;

          // Check if expiring soon
          if (curse.expiresAt && curse.expiresAt <= in24h) {
            expiringCurses++;
          }
        }
      }
    }

    return {
      totalBlessings,
      totalCurses,
      expiringIn24h: {
        blessings: expiringBlessings,
        curses: expiringCurses,
      },
      byDeity,
    };
  } catch (error) {
    logger.error('Error getting karma effect stats:', error);
    throw error;
  }
}

/**
 * Clean up stale karma records (characters with no effects and no recent activity)
 */
export async function cleanupStaleKarmaRecords(): Promise<{ deleted: number }> {
  try {
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

    // Find karma records with no active effects and no recent updates
    const staleRecords = await CharacterKarma.find({
      'blessings.0': { $exists: false },
      'curses.0': { $exists: false },
      updatedAt: { $lt: cutoffDate },
    }).select('_id');

    if (staleRecords.length === 0) {
      return { deleted: 0 };
    }

    const result = await CharacterKarma.deleteMany({
      _id: { $in: staleRecords.map((r) => r._id) },
    });

    if (result.deletedCount > 0) {
      logger.info(`Cleaned up ${result.deletedCount} stale karma records`);
    }

    return { deleted: result.deletedCount };
  } catch (error) {
    logger.error('Error cleaning up stale karma records:', error);
    throw error;
  }
}

export default {
  processExpiredEffects,
  getKarmaEffectStats,
  cleanupStaleKarmaRecords,
};
