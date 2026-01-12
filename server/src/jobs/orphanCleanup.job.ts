/**
 * Orphan Cleanup Job
 *
 * Weekly maintenance job to clean up orphaned references in the database.
 * This handles edge cases where cascade delete hooks might have been bypassed
 * (e.g., direct MongoDB operations, bulk updates, or race conditions).
 *
 * Production Readiness Fix - Data Integrity
 */

import mongoose from 'mongoose';
import logger from '../utils/logger';

/**
 * Result interface for cleanup operations
 */
interface CleanupResult {
  gangRefsFixed: number;
  characterRefsFixed: number;
  orphanedGangMembersRemoved: number;
  errors: string[];
}

/**
 * Clean up orphaned gang references on characters
 * Fixes: Characters with gangId pointing to non-existent or deleted gangs
 */
export async function cleanupOrphanedGangReferences(): Promise<{ fixed: number }> {
  const Character = mongoose.model('Character');
  const Gang = mongoose.model('Gang');

  logger.info('[OrphanCleanup] Starting gang reference cleanup...');

  try {
    // Find all characters with a gangId set
    const charactersWithGang = await Character.find({
      gangId: { $ne: null },
      isActive: true,
    }).select('_id gangId name').lean();

    if (charactersWithGang.length === 0) {
      logger.info('[OrphanCleanup] No characters with gang references found');
      return { fixed: 0 };
    }

    // Get all unique gang IDs
    const gangIds = [...new Set(charactersWithGang.map(c => c.gangId?.toString()).filter(Boolean))];

    // Batch check which gangs actually exist and are active
    const existingGangs = await Gang.find({
      _id: { $in: gangIds },
      isActive: true,
    }).select('_id').lean();

    const existingGangIds = new Set(existingGangs.map(g => g._id.toString()));

    // Find characters with orphaned gang references
    const orphanedCharacters = charactersWithGang.filter(
      c => c.gangId && !existingGangIds.has(c.gangId.toString())
    );

    if (orphanedCharacters.length === 0) {
      logger.info('[OrphanCleanup] No orphaned gang references found');
      return { fixed: 0 };
    }

    // Clear orphaned gangId references
    const orphanedIds = orphanedCharacters.map(c => c._id);
    const result = await Character.updateMany(
      { _id: { $in: orphanedIds } },
      { $set: { gangId: null } }
    );

    logger.info(`[OrphanCleanup] Fixed ${result.modifiedCount} orphaned gang references`, {
      characterNames: orphanedCharacters.map(c => c.name),
    });

    return { fixed: result.modifiedCount };
  } catch (error) {
    logger.error('[OrphanCleanup] Error cleaning gang references:', error);
    throw error;
  }
}

/**
 * Clean up orphaned character references in gangs
 * Fixes: Gang.members entries pointing to non-existent or deleted characters
 */
export async function cleanupOrphanedCharacterReferences(): Promise<{ fixed: number }> {
  const Character = mongoose.model('Character');
  const Gang = mongoose.model('Gang');

  logger.info('[OrphanCleanup] Starting character reference cleanup...');

  try {
    // Get all active gangs with members
    const gangs = await Gang.find({
      isActive: true,
      'members.0': { $exists: true }, // Has at least one member
    }).select('_id name members').lean();

    if (gangs.length === 0) {
      logger.info('[OrphanCleanup] No gangs with members found');
      return { fixed: 0 };
    }

    // Collect all member character IDs across all gangs
    const allMemberIds = new Set<string>();
    gangs.forEach(gang => {
      gang.members?.forEach((member: { characterId: mongoose.Types.ObjectId }) => {
        allMemberIds.add(member.characterId.toString());
      });
    });

    // Batch check which characters actually exist and are active
    const existingCharacters = await Character.find({
      _id: { $in: Array.from(allMemberIds).map(id => new mongoose.Types.ObjectId(id)) },
      isActive: true,
    }).select('_id').lean();

    const existingCharacterIds = new Set(existingCharacters.map(c => c._id.toString()));

    // Find and fix orphaned member references
    let totalFixed = 0;
    const updatePromises: Promise<void>[] = [];

    for (const gang of gangs) {
      const orphanedMemberIds = gang.members
        ?.filter((member: { characterId: mongoose.Types.ObjectId }) =>
          !existingCharacterIds.has(member.characterId.toString())
        )
        .map((member: { characterId: mongoose.Types.ObjectId }) => member.characterId) || [];

      if (orphanedMemberIds.length > 0) {
        updatePromises.push(
          Gang.updateOne(
            { _id: gang._id },
            { $pull: { members: { characterId: { $in: orphanedMemberIds } } } }
          ).then(result => {
            if (result.modifiedCount > 0) {
              totalFixed += orphanedMemberIds.length;
              logger.info(`[OrphanCleanup] Removed ${orphanedMemberIds.length} orphaned members from gang ${gang.name}`);
            }
          })
        );
      }
    }

    await Promise.all(updatePromises);

    logger.info(`[OrphanCleanup] Fixed ${totalFixed} orphaned character references in gangs`);
    return { fixed: totalFixed };
  } catch (error) {
    logger.error('[OrphanCleanup] Error cleaning character references:', error);
    throw error;
  }
}

/**
 * Clean up orphaned leader references
 * Fixes: Gangs where leaderId points to non-existent character
 */
async function cleanupOrphanedLeaderReferences(): Promise<{ fixed: number }> {
  const Character = mongoose.model('Character');
  const Gang = mongoose.model('Gang');

  logger.info('[OrphanCleanup] Starting leader reference cleanup...');

  try {
    // Get all active gangs
    const gangs = await Gang.find({ isActive: true })
      .select('_id name leaderId members')
      .lean();

    if (gangs.length === 0) {
      return { fixed: 0 };
    }

    // Get all leader IDs
    const leaderIds = gangs.map(g => g.leaderId);

    // Check which leaders exist
    const existingLeaders = await Character.find({
      _id: { $in: leaderIds },
      isActive: true,
    }).select('_id').lean();

    const existingLeaderIds = new Set(existingLeaders.map(l => l._id.toString()));

    // Find gangs with orphaned leaders
    const gangsWithOrphanedLeaders = gangs.filter(
      g => !existingLeaderIds.has(g.leaderId.toString())
    );

    if (gangsWithOrphanedLeaders.length === 0) {
      logger.info('[OrphanCleanup] No orphaned leader references found');
      return { fixed: 0 };
    }

    let fixed = 0;

    for (const gang of gangsWithOrphanedLeaders) {
      // Try to promote the first available officer or member to leader
      const validMembers = gang.members?.filter(
        (m: { characterId: mongoose.Types.ObjectId; role: string }) =>
          existingLeaderIds.has(m.characterId.toString()) ||
          existingLeaders.some(l => l._id.toString() === m.characterId.toString())
      ) || [];

      if (validMembers.length > 0) {
        // Promote first valid member to leader
        const newLeader = validMembers[0];
        await Gang.updateOne(
          { _id: gang._id },
          {
            $set: {
              leaderId: newLeader.characterId,
              'members.$[elem].role': 'leader',
            },
          },
          { arrayFilters: [{ 'elem.characterId': newLeader.characterId }] }
        );
        logger.warn(`[OrphanCleanup] Gang ${gang.name} had orphaned leader, promoted new leader`);
        fixed++;
      } else {
        // No valid members - mark gang as inactive
        await Gang.updateOne(
          { _id: gang._id },
          { $set: { isActive: false } }
        );
        logger.warn(`[OrphanCleanup] Gang ${gang.name} has no valid members, marked inactive`);
        fixed++;
      }
    }

    return { fixed };
  } catch (error) {
    logger.error('[OrphanCleanup] Error cleaning leader references:', error);
    throw error;
  }
}

/**
 * Run full orphan cleanup job
 * Executes all cleanup operations and returns combined results
 */
export async function runFullOrphanCleanup(): Promise<CleanupResult> {
  logger.info('[OrphanCleanup] Starting full orphan cleanup job...');
  const startTime = Date.now();

  const result: CleanupResult = {
    gangRefsFixed: 0,
    characterRefsFixed: 0,
    orphanedGangMembersRemoved: 0,
    errors: [],
  };

  // Clean up gang references on characters
  try {
    const gangRefResult = await cleanupOrphanedGangReferences();
    result.gangRefsFixed = gangRefResult.fixed;
  } catch (error) {
    result.errors.push(`Gang ref cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Clean up character references in gangs
  try {
    const charRefResult = await cleanupOrphanedCharacterReferences();
    result.characterRefsFixed = charRefResult.fixed;
  } catch (error) {
    result.errors.push(`Character ref cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Clean up orphaned leader references
  try {
    const leaderResult = await cleanupOrphanedLeaderReferences();
    result.orphanedGangMembersRemoved = leaderResult.fixed;
  } catch (error) {
    result.errors.push(`Leader ref cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  const duration = Date.now() - startTime;
  const totalFixed = result.gangRefsFixed + result.characterRefsFixed + result.orphanedGangMembersRemoved;

  logger.info(`[OrphanCleanup] Full cleanup completed in ${duration}ms`, {
    gangRefsFixed: result.gangRefsFixed,
    characterRefsFixed: result.characterRefsFixed,
    orphanedGangMembersRemoved: result.orphanedGangMembersRemoved,
    totalFixed,
    errors: result.errors.length,
  });

  return result;
}

export default {
  runFullOrphanCleanup,
  cleanupOrphanedGangReferences,
  cleanupOrphanedCharacterReferences,
};
