/**
 * Economy Tick Job
 * Phase R2: Economy Foundation
 *
 * Hourly job that:
 * - Updates market state indicators
 * - Expires old economic events
 * - Potentially spawns new economic events
 * - Updates price indexes across categories
 * - Generates economy health alerts
 */

import { runEconomyTick } from '../services/economy.service';
import { EconomyTickResult } from '@desperados/shared';
import logger from '../utils/logger';

/**
 * Process the hourly economy tick
 */
export async function processEconomyTick(): Promise<EconomyTickResult> {
  logger.info('Starting economy tick...');

  try {
    const result = await runEconomyTick();

    logger.info('Economy tick completed', {
      eventsSpawned: result.eventsSpawned,
      eventsExpired: result.eventsExpired,
      priceIndexesUpdated: result.priceIndexesUpdated,
      alerts: result.alerts.length,
    });

    return result;
  } catch (error) {
    logger.error('Economy tick failed:', error);
    throw error;
  }
}

/**
 * Clean up stale economy data (run daily)
 */
export async function cleanupStaleEconomyData(): Promise<{
  alertsCleared: number;
  oldSnapshotsRemoved: number;
}> {
  logger.info('Starting economy data cleanup...');

  try {
    const { MarketState } = await import('../models/MarketState.model');

    const state = await MarketState.getGlobalState();

    // Clear acknowledged alerts older than 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const alertsBefore = state.alerts.length;
    state.alerts = state.alerts.filter(
      (a) => !a.acknowledged || a.timestamp > weekAgo
    );
    const alertsCleared = alertsBefore - state.alerts.length;

    // Keep only last 24 hourly snapshots (already handled in model, but ensure)
    const snapshotsBefore = state.hourlySnapshots.length;
    if (state.hourlySnapshots.length > 24) {
      state.hourlySnapshots = state.hourlySnapshots.slice(-24);
    }
    const oldSnapshotsRemoved = snapshotsBefore - state.hourlySnapshots.length;

    await state.save();

    logger.info('Economy data cleanup completed', {
      alertsCleared,
      oldSnapshotsRemoved,
    });

    return { alertsCleared, oldSnapshotsRemoved };
  } catch (error) {
    logger.error('Economy data cleanup failed:', error);
    throw error;
  }
}

/**
 * Force expire all active economic events (admin function)
 */
export async function forceExpireAllEvents(): Promise<number> {
  logger.info('Force expiring all economic events...');

  try {
    const { EconomicEvent } = await import('../models/EconomicEvent.model');
    const { MarketState } = await import('../models/MarketState.model');

    const result = await EconomicEvent.updateMany(
      { isActive: true },
      { $set: { isActive: false, expiresAt: new Date() } }
    );

    // Clear market state event references
    const state = await MarketState.getGlobalState();
    state.activeEconomicEvents = [];
    await state.save();

    logger.info(`Force expired ${result.modifiedCount} economic events`);

    return result.modifiedCount;
  } catch (error) {
    logger.error('Force expire events failed:', error);
    throw error;
  }
}

export default {
  processEconomyTick,
  cleanupStaleEconomyData,
  forceExpireAllEvents,
};
