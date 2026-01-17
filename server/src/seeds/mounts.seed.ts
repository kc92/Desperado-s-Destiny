/**
 * Mounts Seed
 * Seeds all mounts from the Mount model seed data
 */

import { Mount, MOUNT_SEED_DATA } from '../models/Mount.model';
import logger from '../utils/logger';

export async function seedMounts(): Promise<void> {
  try {
    logger.info('Seeding mounts...');

    let seeded = 0;
    let updated = 0;

    for (const mount of MOUNT_SEED_DATA) {
      const result = await Mount.findOneAndUpdate(
        { name: mount.name },
        mount,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        seeded++;
      } else {
        updated++;
      }
    }

    logger.info(`Mounts seeded: ${seeded} new, ${updated} updated (${MOUNT_SEED_DATA.length} total)`);
  } catch (error) {
    logger.error('Error seeding mounts:', error);
    throw error;
  }
}
