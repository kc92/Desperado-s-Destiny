/**
 * Skills Seed
 * Seeds all 30 skills from the shared constants
 */

import { Skill } from '../models/Skill.model';
import { SKILLS } from '@desperados/shared';
import logger from '../utils/logger';

export async function seedSkills(): Promise<void> {
  try {
    logger.info('Seeding skills...');

    const skillsArray = Object.values(SKILLS);
    let seeded = 0;
    let updated = 0;

    for (const skill of skillsArray) {
      const result = await Skill.findOneAndUpdate(
        { skillId: skill.id },
        {
          skillId: skill.id,
          name: skill.name,
          description: skill.description,
          category: skill.category,
          suit: skill.suit,
          icon: skill.icon,
          maxLevel: skill.maxLevel,
          baseTrainingTime: skill.baseTrainingTime,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        seeded++;
      } else {
        updated++;
      }
    }

    logger.info(`Skills seeded: ${seeded} new, ${updated} updated (${skillsArray.length} total)`);
  } catch (error) {
    logger.error('Error seeding skills:', error);
    throw error;
  }
}
