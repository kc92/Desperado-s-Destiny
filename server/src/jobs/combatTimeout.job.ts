/**
 * Combat Timeout Job
 *
 * Phase 1 Tech Debt Fix
 *
 * Enforces combat round timeouts by:
 * 1. Finding active encounters with expired timeoutAt
 * 2. Auto-confirming the hold action with current selections
 * 3. Sending socket notifications to affected players
 *
 * Runs every 30 seconds to check for timed-out encounters.
 */

import { CombatEncounter, ICombatEncounter } from '../models/CombatEncounter.model';
import { Character } from '../models/Character.model';
import { CombatStatus, PlayerTurnPhase } from '@desperados/shared';
import { getIO } from '../config/socket';
import logger from '../utils/logger';

interface TimeoutResult {
  encounterId: string;
  characterId: string;
  characterName: string;
  success: boolean;
  error?: string;
}

// Maximum encounters to process per job run (prevents memory/timeout issues)
const MAX_BATCH_SIZE = 100;

/**
 * Process timed-out combat encounters
 */
export async function processTimedOutEncounters(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  results: TimeoutResult[];
  hasMore: boolean;
}> {
  const startTime = Date.now();
  const results: TimeoutResult[] = [];
  let succeeded = 0;
  let failed = 0;

  try {
    const now = new Date();

    // Count total timed-out encounters for reporting
    const totalTimedOut = await CombatEncounter.countDocuments({
      status: CombatStatus.ACTIVE,
      'currentRound.timeoutAt': { $lte: now },
      'currentRound.phase': PlayerTurnPhase.HOLD
    });

    // Find active encounters with expired timeouts (limited batch)
    const timedOutEncounters = await CombatEncounter.find({
      status: CombatStatus.ACTIVE,
      'currentRound.timeoutAt': { $lte: now },
      'currentRound.phase': PlayerTurnPhase.HOLD // Only timeout during hold phase
    })
      .limit(MAX_BATCH_SIZE)
      .populate('characterId', 'name userId');

    if (timedOutEncounters.length === 0) {
      return { processed: 0, succeeded: 0, failed: 0, results: [], hasMore: false };
    }

    const hasMore = totalTimedOut > MAX_BATCH_SIZE;
    logger.info(`Processing ${timedOutEncounters.length} of ${totalTimedOut} timed-out combat encounters`);

    const io = getIO();

    for (const encounter of timedOutEncounters) {
      try {
        const result = await processEncounterTimeout(encounter, io);
        results.push(result);

        if (result.success) {
          succeeded++;
        } else {
          failed++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Error processing timeout for encounter ${encounter._id}:`, error);

        const character = encounter.characterId as any;
        results.push({
          encounterId: encounter._id.toString(),
          characterId: character?._id?.toString() || 'unknown',
          characterName: character?.name || 'Unknown',
          success: false,
          error: errorMessage
        });
        failed++;
      }
    }

    const duration = Date.now() - startTime;
    logger.info(
      `Combat timeout processing complete: ${succeeded} succeeded, ${failed} failed in ${duration}ms${hasMore ? ` (more pending)` : ''}`
    );

    return {
      processed: timedOutEncounters.length,
      succeeded,
      failed,
      results,
      hasMore
    };
  } catch (error) {
    logger.error('Error in combat timeout job:', error);
    throw error;
  }
}

/**
 * Process a single encounter timeout
 */
async function processEncounterTimeout(
  encounter: ICombatEncounter,
  io: ReturnType<typeof getIO> | null
): Promise<TimeoutResult> {
  const character = encounter.characterId as any;
  const characterId = character?._id?.toString();
  const characterName = character?.name || 'Unknown';

  if (!encounter.currentRound) {
    return {
      encounterId: encounter._id.toString(),
      characterId: characterId || 'unknown',
      characterName,
      success: false,
      error: 'No current round state'
    };
  }

  // Log the timeout
  logger.info(`Combat timeout for ${characterName} in encounter ${encounter._id}`);

  // Import combat service dynamically to avoid circular dependencies
  const { CombatService } = await import('../services/combat');

  // Auto-confirm the hold with whatever cards are currently held
  // If no cards are held, this effectively skips all discards
  try {
    const result = await CombatService.processPlayerAction(
      characterId,
      encounter._id.toString(),
      { type: 'confirm_hold' }
    );

    if (result.success) {
      // Send socket notification about timeout
      if (io && character?.userId) {
        const userRoom = `user:${character.userId}`;
        io.to(userRoom).emit('combat:timeout', {
          encounterId: encounter._id.toString(),
          characterId,
          message: 'Your turn timed out. The round was automatically processed.',
          newState: result.roundState || result.encounter
        });
      }

      return {
        encounterId: encounter._id.toString(),
        characterId,
        characterName,
        success: true
      };
    } else {
      return {
        encounterId: encounter._id.toString(),
        characterId,
        characterName,
        success: false,
        error: result.error || 'Failed to auto-confirm hold'
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      encounterId: encounter._id.toString(),
      characterId,
      characterName,
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Send pre-timeout warnings to players who are about to time out
 * Call this more frequently (e.g., every 10 seconds) to warn players
 */
export async function sendTimeoutWarnings(warningThresholdSeconds: number = 30): Promise<{
  warningsSent: number;
}> {
  try {
    const now = new Date();
    const warningThreshold = new Date(now.getTime() + warningThresholdSeconds * 1000);

    // Find encounters that will timeout soon but haven't yet
    const aboutToTimeout = await CombatEncounter.find({
      status: CombatStatus.ACTIVE,
      'currentRound.timeoutAt': {
        $gt: now,
        $lte: warningThreshold
      },
      'currentRound.phase': PlayerTurnPhase.HOLD
    }).populate('characterId', 'userId name');

    if (aboutToTimeout.length === 0) {
      return { warningsSent: 0 };
    }

    const io = getIO();
    if (!io) {
      return { warningsSent: 0 };
    }

    let warningsSent = 0;

    for (const encounter of aboutToTimeout) {
      const character = encounter.characterId as any;
      if (!character?.userId) continue;

      const timeRemaining = Math.max(
        0,
        Math.ceil((encounter.currentRound!.timeoutAt.getTime() - now.getTime()) / 1000)
      );

      const userRoom = `user:${character.userId}`;
      io.to(userRoom).emit('combat:timeout_warning', {
        encounterId: encounter._id.toString(),
        characterId: character._id.toString(),
        secondsRemaining: timeRemaining,
        message: `${timeRemaining} seconds remaining to make your move!`
      });

      warningsSent++;
    }

    return { warningsSent };
  } catch (error) {
    logger.error('Error sending timeout warnings:', error);
    return { warningsSent: 0 };
  }
}

/**
 * Get statistics about active combat encounters
 */
export async function getCombatTimeoutStats(): Promise<{
  activeEncounters: number;
  inHoldPhase: number;
  aboutToTimeout: number;
  timedOut: number;
}> {
  try {
    const now = new Date();
    const warningThreshold = new Date(now.getTime() + 30 * 1000); // 30 seconds

    const [
      activeEncounters,
      inHoldPhase,
      aboutToTimeout,
      timedOut
    ] = await Promise.all([
      CombatEncounter.countDocuments({ status: CombatStatus.ACTIVE }),
      CombatEncounter.countDocuments({
        status: CombatStatus.ACTIVE,
        'currentRound.phase': PlayerTurnPhase.HOLD
      }),
      CombatEncounter.countDocuments({
        status: CombatStatus.ACTIVE,
        'currentRound.phase': PlayerTurnPhase.HOLD,
        'currentRound.timeoutAt': { $gt: now, $lte: warningThreshold }
      }),
      CombatEncounter.countDocuments({
        status: CombatStatus.ACTIVE,
        'currentRound.phase': PlayerTurnPhase.HOLD,
        'currentRound.timeoutAt': { $lte: now }
      })
    ]);

    return {
      activeEncounters,
      inHoldPhase,
      aboutToTimeout,
      timedOut
    };
  } catch (error) {
    logger.error('Error getting combat timeout stats:', error);
    throw error;
  }
}

export default {
  processTimedOutEncounters,
  sendTimeoutWarnings,
  getCombatTimeoutStats
};
