/**
 * Seed Reputation System Data
 * Example quests, actions, and scenarios that use the reputation system
 */

import mongoose from 'mongoose';
import { QuestDefinition } from '../models/Quest.model';
import { config } from '../config';
import logger from '../utils/logger';

/**
 * Example quests with reputation rewards
 */
const reputationQuests = [
  {
    questId: 'settler_help_1',
    name: 'Help the Sheriff',
    description: 'Assist Sheriff Morgan in maintaining law and order in town.',
    type: 'side',
    levelRequired: 1,
    prerequisites: [],
    objectives: [
      {
        id: 'obj_1',
        description: 'Report wanted criminals to the Sheriff',
        type: 'crime',
        target: 'arrest_player',
        required: 1
      }
    ],
    rewards: [
      {
        type: 'gold',
        amount: 50
      },
      {
        type: 'xp',
        amount: 100
      },
      {
        type: 'reputation',
        faction: 'settlerAlliance',
        amount: 15
      }
    ],
    repeatable: false,
    isActive: true
  },
  {
    questId: 'nahi_sacred_1',
    name: 'Sacred Site Protection',
    description: 'Help the Nahi Coalition protect their sacred sites from desecration.',
    type: 'side',
    levelRequired: 5,
    prerequisites: [],
    objectives: [
      {
        id: 'obj_1',
        description: 'Visit the Sacred Springs',
        type: 'visit',
        target: 'sacred_springs',
        required: 1
      },
      {
        id: 'obj_2',
        description: 'Defeat bandits threatening the site',
        type: 'kill',
        target: 'bandit',
        required: 3
      }
    ],
    rewards: [
      {
        type: 'gold',
        amount: 75
      },
      {
        type: 'xp',
        amount: 150
      },
      {
        type: 'reputation',
        faction: 'nahiCoalition',
        amount: 20
      }
    ],
    repeatable: false,
    isActive: true
  },
  {
    questId: 'frontera_smuggle_1',
    name: 'Border Run',
    description: 'Transport goods across the border for the Frontera network.',
    type: 'side',
    levelRequired: 3,
    prerequisites: [],
    objectives: [
      {
        id: 'obj_1',
        description: 'Successfully commit a smuggling crime',
        type: 'crime',
        target: 'smuggling',
        required: 1
      }
    ],
    rewards: [
      {
        type: 'gold',
        amount: 100
      },
      {
        type: 'xp',
        amount: 120
      },
      {
        type: 'reputation',
        faction: 'frontera',
        amount: 10
      },
      {
        type: 'reputation',
        faction: 'settlerAlliance',
        amount: -10
      }
    ],
    repeatable: true,
    isActive: true
  },
  {
    questId: 'settler_bounty_1',
    name: 'Bounty Hunter License',
    description: 'Prove yourself as a bounty hunter by bringing criminals to justice.',
    type: 'main',
    levelRequired: 8,
    prerequisites: ['settler_help_1'],
    objectives: [
      {
        id: 'obj_1',
        description: 'Arrest 5 wanted criminals',
        type: 'crime',
        target: 'arrest_player',
        required: 5
      }
    ],
    rewards: [
      {
        type: 'gold',
        amount: 200
      },
      {
        type: 'xp',
        amount: 300
      },
      {
        type: 'reputation',
        faction: 'settlerAlliance',
        amount: 25
      },
      {
        type: 'item',
        itemId: 'bounty_hunter_badge'
      }
    ],
    repeatable: false,
    isActive: true
  }
];

/**
 * Seed the database with reputation-based quests
 */
async function seedReputationData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.database.mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing reputation quests
    await QuestDefinition.deleteMany({
      questId: { $in: reputationQuests.map(q => q.questId) }
    });
    console.log('Cleared existing reputation quests');

    // Insert new quests
    await QuestDefinition.insertMany(reputationQuests);
    console.log(`Inserted ${reputationQuests.length} reputation quests`);

    console.log('\nReputation System Seeding Complete!');
    console.log('\nAvailable Quests:');
    reputationQuests.forEach(quest => {
      console.log(`\n- ${quest.name} (${quest.questId})`);
      console.log(`  Level: ${quest.levelRequired}`);
      const repRewards = quest.rewards.filter(r => r.type === 'reputation');
      repRewards.forEach(reward => {
        const sign = (reward.amount || 0) > 0 ? '+' : '';
        console.log(`  ${sign}${reward.amount} reputation with ${reward.faction}`);
      });
    });

    console.log('\nReputation Mechanics:');
    console.log('- Complete quests to gain faction reputation');
    console.log('- Crimes hurt Settler Alliance reputation');
    console.log('- Successful crimes boost Frontera reputation');
    console.log('- Standing levels: Hostile (-100 to -50), Unfriendly (-50 to 0), Neutral (0 to 25), Friendly (25 to 75), Honored (75 to 100)');
    console.log('- Higher standing = better prices at faction shops');

  } catch (error) {
    logger.error('Error seeding reputation data', { error: error instanceof Error ? error.message : error });
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  seedReputationData()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error('Fatal error', { error: error instanceof Error ? error.message : error });
      process.exit(1);
    });
}

export { seedReputationData, reputationQuests };
