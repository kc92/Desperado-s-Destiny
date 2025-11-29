/**
 * Action Seeds
 *
 * Creates initial actions for the Destiny Deck system
 */

import { Action, ActionType } from '../models/Action.model';
import logger from '../utils/logger';

export async function seedActions(): Promise<void> {
  try {
    // Check if actions already exist
    const existingCount = await Action.countDocuments();
    if (existingCount > 0) {
      logger.info(`Actions already seeded (${existingCount} actions found)`);
      return;
    }

    const actions = [
      // CRIME Actions
      {
        name: 'Pickpocket Tourist',
        description: 'Lift some gold from an unsuspecting traveler in the market.',
        type: ActionType.CRIME,
        difficulty: 10,
        energyCost: 5,
        primarySuit: 'spades',
        rewards: {
          minGold: 5,
          maxGold: 20,
          xpBase: 10
        },
        isActive: true,
        cooldown: 0
      },
      {
        name: 'Break Into Store',
        description: 'Sneak into a closed shop and steal valuable goods.',
        type: ActionType.CRIME,
        difficulty: 25,
        energyCost: 10,
        primarySuit: 'spades',
        rewards: {
          minGold: 20,
          maxGold: 50,
          xpBase: 25
        },
        isActive: true,
        cooldown: 0
      },
      {
        name: 'Rob Stagecoach',
        description: 'Ambush a stagecoach carrying gold and valuables.',
        type: ActionType.CRIME,
        difficulty: 40,
        energyCost: 15,
        primarySuit: 'spades',
        rewards: {
          minGold: 50,
          maxGold: 100,
          xpBase: 40
        },
        isActive: true,
        cooldown: 0
      },

      // COMBAT Actions
      {
        name: 'Bar Brawl',
        description: 'Get into a fight at the local saloon.',
        type: ActionType.COMBAT,
        difficulty: 15,
        energyCost: 8,
        primarySuit: 'clubs',
        rewards: {
          minGold: 5,
          maxGold: 15,
          xpBase: 15
        },
        isActive: true,
        cooldown: 0
      },
      {
        name: 'Duel at Dawn',
        description: 'Face off against a rival in a pistol duel.',
        type: ActionType.COMBAT,
        difficulty: 30,
        energyCost: 12,
        primarySuit: 'clubs',
        rewards: {
          minGold: 15,
          maxGold: 40,
          xpBase: 30
        },
        isActive: true,
        cooldown: 0
      },

      // CRAFT Actions
      {
        name: 'Craft Lockpicks',
        description: 'Create a set of lockpicks for breaking into places.',
        type: ActionType.CRAFT,
        difficulty: 12,
        energyCost: 6,
        primarySuit: 'diamonds',
        rewards: {
          minGold: 10,
          maxGold: 25,
          xpBase: 12
        },
        isActive: true,
        cooldown: 0
      },
      {
        name: 'Forge Documents',
        description: 'Create fake papers and documents.',
        type: ActionType.CRAFT,
        difficulty: 20,
        energyCost: 10,
        primarySuit: 'diamonds',
        rewards: {
          minGold: 20,
          maxGold: 45,
          xpBase: 20
        },
        isActive: true,
        cooldown: 0
      },

      // SOCIAL Actions
      {
        name: 'Gather Information',
        description: 'Talk to locals and gather useful intel.',
        type: ActionType.SOCIAL,
        difficulty: 8,
        energyCost: 5,
        primarySuit: 'hearts',
        rewards: {
          minGold: 5,
          maxGold: 15,
          xpBase: 8
        },
        isActive: true,
        cooldown: 0
      },
      {
        name: 'Charm the Sheriff',
        description: 'Sweet-talk the law to reduce your wanted level.',
        type: ActionType.SOCIAL,
        difficulty: 22,
        energyCost: 10,
        primarySuit: 'hearts',
        rewards: {
          minGold: 10,
          maxGold: 30,
          xpBase: 22
        },
        isActive: true,
        cooldown: 0
      },
      {
        name: 'Recruit Gang Member',
        description: 'Convince a skilled outlaw to join your gang.',
        type: ActionType.SOCIAL,
        difficulty: 35,
        energyCost: 15,
        primarySuit: 'hearts',
        rewards: {
          minGold: 25,
          maxGold: 60,
          xpBase: 35
        },
        isActive: true,
        cooldown: 0
      }
    ];

    const createdActions = await Action.insertMany(actions);
    logger.info(`Seeded ${createdActions.length} actions successfully`);
  } catch (error) {
    logger.error('Error seeding actions:', error);
    throw error;
  }
}
