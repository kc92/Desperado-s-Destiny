/**
 * Horse Bond Decay Job
 * Runs daily at 3 AM to decay bond for neglected horses
 * Horses that haven't been cared for in 24+ hours lose bond
 */

import { Horse } from '../models/Horse.model';
import logger from '../utils/logger';

// Bond decay configuration
const BOND_DECAY_AMOUNT = 5; // Points lost per day of neglect
const NEGLECT_THRESHOLD_HOURS = 24; // Hours without care before decay starts
const SEVERE_NEGLECT_HOURS = 72; // Hours for severe decay
const SEVERE_DECAY_AMOUNT = 15;

/**
 * Decay bond for neglected horses
 */
export async function processHorseBondDecay(): Promise<{ processed: number; decayed: number }> {
  logger.info('[HorseBondDecay] Starting bond decay job');

  const now = new Date();
  const neglectThreshold = new Date(now.getTime() - NEGLECT_THRESHOLD_HOURS * 60 * 60 * 1000);
  const severeThreshold = new Date(now.getTime() - SEVERE_NEGLECT_HOURS * 60 * 60 * 1000);

  let processed = 0;
  let decayed = 0;

  try {
    // Find horses that haven't been cared for (using lastInteraction)
    const neglectedHorses = await Horse.find({
      'bond.lastInteraction': { $lt: neglectThreshold },
      'bond.level': { $gt: 0 } // Only process horses with bond remaining
    });

    processed = neglectedHorses.length;

    for (const horse of neglectedHorses) {
      const lastCare = horse.bond.lastInteraction.getTime();

      // Determine decay amount based on severity
      let decayAmount = BOND_DECAY_AMOUNT;
      if (lastCare < severeThreshold.getTime()) {
        decayAmount = SEVERE_DECAY_AMOUNT;
        logger.warn(`[HorseBondDecay] Severe neglect for horse ${horse._id} owned by ${horse.ownerId}`);
      }

      // Apply decay
      const previousBond = horse.bond.level;
      horse.bond.level = Math.max(0, horse.bond.level - decayAmount);

      // Also decay trust for severely neglected horses
      if (lastCare < severeThreshold.getTime()) {
        horse.bond.trust = Math.max(0, horse.bond.trust - 10);
      }

      if (horse.bond.level !== previousBond) {
        await horse.save();
        decayed++;

        logger.debug(`[HorseBondDecay] Horse ${horse._id}: bond ${previousBond} -> ${horse.bond.level}`);
      }
    }

    logger.info(`[HorseBondDecay] Completed. Processed: ${processed}, Decayed: ${decayed}`);
    return { processed, decayed };

  } catch (error) {
    logger.error('[HorseBondDecay] Error during bond decay:', error);
    throw error;
  }
}

/**
 * Run horse bond decay immediately (for testing)
 */
export async function runHorseBondDecayNow(): Promise<void> {
  await processHorseBondDecay();
}
