/**
 * Companion Bond Decay Job
 * Runs daily at 3:30 AM to decay bond for neglected companions
 * Companions that haven't been interacted with lose bond over time
 */

import { AnimalCompanion } from '../models/AnimalCompanion.model';
import logger from '../utils/logger';

// Bond decay configuration
const BOND_DECAY_AMOUNT = 3; // Points lost per day of neglect
const NEGLECT_THRESHOLD_HOURS = 48; // Hours without interaction before decay starts
const SEVERE_NEGLECT_HOURS = 96; // Hours for severe decay (4 days)
const SEVERE_DECAY_AMOUNT = 10;

/**
 * Decay bond for neglected companions
 */
export async function processCompanionBondDecay(): Promise<{ processed: number; decayed: number }> {
  logger.info('[CompanionBondDecay] Starting bond decay job');

  const now = new Date();
  const neglectThreshold = new Date(now.getTime() - NEGLECT_THRESHOLD_HOURS * 60 * 60 * 1000);
  const severeThreshold = new Date(now.getTime() - SEVERE_NEGLECT_HOURS * 60 * 60 * 1000);

  let processed = 0;
  let decayed = 0;

  try {
    // Find companions that haven't been interacted with
    const neglectedCompanions = await AnimalCompanion.find({
      lastActive: { $lt: neglectThreshold },
      bondLevel: { $gt: 0 } // Only process companions with bond remaining
    });

    processed = neglectedCompanions.length;

    for (const companion of neglectedCompanions) {
      const lastInteraction = companion.lastActive?.getTime() || 0;

      // Determine decay amount based on severity
      let decayAmount = BOND_DECAY_AMOUNT;
      if (lastInteraction < severeThreshold.getTime()) {
        decayAmount = SEVERE_DECAY_AMOUNT;
        logger.warn(`[CompanionBondDecay] Severe neglect for companion ${companion._id} (${companion.name}) owned by ${companion.ownerId}`);
      }

      // Apply decay
      const previousBond = companion.bondLevel;
      companion.bondLevel = Math.max(0, companion.bondLevel - decayAmount);

      if (companion.bondLevel !== previousBond) {
        await companion.save();
        decayed++;

        logger.debug(`[CompanionBondDecay] Companion ${companion._id} (${companion.name}): bond ${previousBond} -> ${companion.bondLevel}`);
      }
    }

    logger.info(`[CompanionBondDecay] Completed. Processed: ${processed}, Decayed: ${decayed}`);
    return { processed, decayed };

  } catch (error) {
    logger.error('[CompanionBondDecay] Error during bond decay:', error);
    throw error;
  }
}

/**
 * Run bond decay immediately (for testing or manual runs)
 */
export async function runCompanionBondDecayNow(): Promise<void> {
  await processCompanionBondDecay();
}
