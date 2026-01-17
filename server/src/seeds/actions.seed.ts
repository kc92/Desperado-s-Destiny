/**
 * Action Seeds
 *
 * Creates initial actions for the Destiny Deck system
 * Uses the comprehensive seedStarterActions method from Action model
 */

import { Action } from '../models/Action.model';
import logger from '../utils/logger';

export async function seedActions(): Promise<void> {
  try {
    logger.info('Seeding actions...');

    // Use the comprehensive seed method from the Action model
    // This contains 50+ properly structured actions across all types
    await Action.seedStarterActions();

    const count = await Action.countDocuments();
    logger.info(`Actions seeded successfully (${count} total)`);
  } catch (error) {
    logger.error('Error seeding actions:', error);
    throw error;
  }
}
