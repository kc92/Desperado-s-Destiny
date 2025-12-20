/**
 * Divine Message Delivery Job
 *
 * DEITY SYSTEM - Phase 3
 *
 * Polls for undelivered divine manifestations and pushes them to players via socket.
 * Runs every 30 seconds to ensure timely delivery of divine messages.
 */

import { DivineManifestation } from '../models/DivineManifestation.model';
import { Character } from '../models/Character.model';
import { getIO } from '../config/socket';
import logger from '../utils/logger';

/**
 * Process undelivered divine manifestations and send them to online players
 */
export async function processDivineMessages(): Promise<{
  delivered: number;
  skipped: number;
  errors: number;
}> {
  const startTime = Date.now();
  let delivered = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // Find all undelivered manifestations, sorted by urgency and creation time
    const pendingManifestations = await DivineManifestation.find({
      delivered: false,
    })
      .sort({ urgency: -1, createdAt: 1 })
      .limit(100);

    if (pendingManifestations.length === 0) {
      return { delivered: 0, skipped: 0, errors: 0 };
    }

    logger.debug(`Processing ${pendingManifestations.length} pending divine messages`);

    const io = getIO();
    if (!io) {
      logger.warn('Socket.io not initialized, skipping divine message delivery');
      return { delivered: 0, skipped: pendingManifestations.length, errors: 0 };
    }

    for (const manifestation of pendingManifestations) {
      try {
        // Get the character to find their user ID for socket room
        const character = await Character.findById(manifestation.targetCharacterId)
          .select('userId name')
          .lean();

        if (!character) {
          // Character deleted - mark as delivered to clean up
          manifestation.delivered = true;
          manifestation.deliveredAt = new Date();
          await manifestation.save();
          skipped++;
          continue;
        }

        // Check if user is online (has active socket connection)
        const userRoom = `user:${character.userId}`;
        const socketsInRoom = await io.in(userRoom).fetchSockets();

        if (socketsInRoom.length > 0) {
          // User is online - deliver the message
          io.to(userRoom).emit('divine:message', {
            id: manifestation._id,
            deity: manifestation.deityName,
            type: manifestation.type,
            message: manifestation.message,
            urgency: manifestation.urgency,
            characterId: manifestation.targetCharacterId,
            timestamp: manifestation.createdAt,
          });

          // Mark as delivered
          manifestation.delivered = true;
          manifestation.deliveredAt = new Date();
          await manifestation.save();
          delivered++;

          logger.debug(
            `Divine message delivered to ${character.name}: ${manifestation.type} from ${manifestation.deityName}`
          );
        } else {
          // User is offline - skip for now, will retry later
          skipped++;
        }
      } catch (error) {
        logger.error(
          `Error delivering divine message ${manifestation._id}:`,
          error
        );
        errors++;
      }
    }

    const duration = Date.now() - startTime;
    logger.info(
      `Divine message delivery: ${delivered} delivered, ${skipped} skipped, ${errors} errors in ${duration}ms`
    );

    return { delivered, skipped, errors };
  } catch (error) {
    logger.error('Error in divine message delivery job:', error);
    throw error;
  }
}

/**
 * Clean up old delivered manifestations (older than 30 days)
 */
export async function cleanupOldManifestations(): Promise<{ deleted: number }> {
  try {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    const result = await DivineManifestation.deleteMany({
      delivered: true,
      deliveredAt: { $lt: cutoffDate },
    });

    if (result.deletedCount > 0) {
      logger.info(`Cleaned up ${result.deletedCount} old divine manifestations`);
    }

    return { deleted: result.deletedCount };
  } catch (error) {
    logger.error('Error cleaning up old manifestations:', error);
    throw error;
  }
}

/**
 * Get statistics about pending divine messages
 */
export async function getDivineMessageStats(): Promise<{
  pending: number;
  delivered: number;
  byDeity: Record<string, number>;
  byType: Record<string, number>;
}> {
  try {
    const [pendingCount, deliveredCount, byDeityAgg, byTypeAgg] =
      await Promise.all([
        DivineManifestation.countDocuments({ delivered: false }),
        DivineManifestation.countDocuments({ delivered: true }),
        DivineManifestation.aggregate([
          { $match: { delivered: false } },
          { $group: { _id: '$deityId', count: { $sum: 1 } } },
        ]),
        DivineManifestation.aggregate([
          { $match: { delivered: false } },
          { $group: { _id: '$type', count: { $sum: 1 } } },
        ]),
      ]);

    const byDeity: Record<string, number> = {};
    for (const item of byDeityAgg) {
      byDeity[item._id] = item.count;
    }

    const byType: Record<string, number> = {};
    for (const item of byTypeAgg) {
      byType[item._id] = item.count;
    }

    return {
      pending: pendingCount,
      delivered: deliveredCount,
      byDeity,
      byType,
    };
  } catch (error) {
    logger.error('Error getting divine message stats:', error);
    throw error;
  }
}

export default {
  processDivineMessages,
  cleanupOldManifestations,
  getDivineMessageStats,
};
