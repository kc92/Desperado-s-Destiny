/**
 * New NPC Seeder
 */

import { NPC } from '../models/NPC.model';
import logger from '../utils/logger';
import { frontierNPCs } from '../data/npcs/frontier_npcs';
import { nativeLandsNPCs } from '../data/npcs/native_lands_npcs';
import { contestedLandsNPCs } from '../data/npcs/contested_lands_npcs';

const allNewNPCs = [
    ...frontierNPCs,
    ...nativeLandsNPCs,
    ...contestedLandsNPCs,
];

export async function seedNewNPCs(): Promise<void> {
  try {
    const npcCount = await NPC.countDocuments();
    if (npcCount > 20) { // Assume if there are more than the initial starter NPCs, we've already seeded
        logger.info('NPCs already seeded. Skipping new NPCs.');
        return;
    }

    await NPC.insertMany(allNewNPCs, { ordered: false });
    logger.info(`Seeded ${allNewNPCs.length} new NPCs.`);

  } catch (error) {
    if (error.code === 11000) {
        logger.warn('Some new NPCs already existed, skipping duplicate entries.');
    } else {
        logger.error('Error seeding new NPCs:', error);
        throw error;
    }
  }
}
