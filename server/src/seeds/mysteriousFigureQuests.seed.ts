/**
 * Mysterious Figure Quest Seed Data
 *
 * Phase 4, Wave 4.2 - Quest definitions for all mysterious figure NPCs
 *
 * Creates quest definitions in the database for integration with
 * the quest system.
 */

import { QuestDefinition, IQuestDefinition } from '../models/Quest.model';
import { MYSTERIOUS_FIGURES } from '../data/mysteriousFigures';

/**
 * Convert mysterious figure quests to quest definitions
 */
export const MYSTERIOUS_FIGURE_QUEST_SEEDS: Partial<IQuestDefinition>[] = [
  // THE STRANGER QUESTS
  {
    questId: 'stranger_crossroads',
    name: 'The Crossroads',
    description: 'The Stranger offers you a choice. Three paths lie before you. One leads to gold, one to blood, one to truth. Choose wisely, for the road taken cannot be untraveled.',
    type: 'side',
    levelRequired: 5,
    prerequisites: [],
    objectives: [
      {
        id: 'choose_path',
        description: 'Choose your path at the crossroads',
        type: 'visit',
        target: 'moral_decision',
        required: 1
      }
    ],
    rewards: [
      { type: 'xp', amount: 400 },
      { type: 'item', itemId: 'stranger_token' }
    ],
    repeatable: false,
    isActive: true
  },
  {
    questId: 'stranger_debt',
    name: 'The Debt',
    description: 'The Stranger claims you owe him for something you haven\'t done yet. He asks for a favor to be repaid in the future. The terms are unclear.',
    type: 'side',
    levelRequired: 5,
    prerequisites: [],
    objectives: [
      {
        id: 'agree_to_terms',
        description: 'Agree to The Stranger\'s bargain',
        type: 'visit',
        target: 'stranger_pact',
        required: 1
      }
    ],
    rewards: [
      { type: 'item', itemId: 'stranger_token' },
      { type: 'xp', amount: 300 }
    ],
    repeatable: false,
    isActive: true
  },

  // OLD COYOTE QUESTS
  {
    questId: 'coyote_riddle',
    name: 'The Trickster\'s Riddle',
    description: 'Old Coyote challenges you to answer his riddle correctly. Get it wrong, and he\'ll play a trick on you. Get it right, and he\'ll share ancient wisdom.',
    type: 'side',
    levelRequired: 3,
    prerequisites: [],
    objectives: [
      {
        id: 'answer_riddle',
        description: 'Solve Old Coyote\'s riddle',
        type: 'visit',
        target: 'coyote_wisdom',
        required: 1
      }
    ],
    rewards: [
      { type: 'xp', amount: 300 },
      { type: 'item', itemId: 'coyote_tooth' }
    ],
    repeatable: false,
    isActive: true
  },
  {
    questId: 'coyote_theft',
    name: 'The Sacred Theft',
    description: 'Old Coyote asks you to steal something sacred from a sacred place. He won\'t say why, but promises it\'s important. Trickster spirits don\'t usually lie... do they?',
    type: 'side',
    levelRequired: 3,
    prerequisites: [],
    objectives: [
      {
        id: 'steal_totem',
        description: 'Steal the sacred totem from Spirit Springs',
        type: 'collect',
        target: 'sacred_totem',
        required: 1
      }
    ],
    rewards: [
      { type: 'reputation', faction: 'NAHI_COALITION', amount: -50 },
      { type: 'item', itemId: 'trickster_blessing' },
      { type: 'xp', amount: 250 }
    ],
    repeatable: false,
    isActive: true
  },

  // MOURNING WIDOW QUESTS
  {
    questId: 'widow_justice',
    name: 'A Mother\'s Vengeance',
    description: 'The Mourning Widow speaks for the first time, her voice like wind through graves. She tells you of the men who murdered her family. They still live. They still kill. She asks for justice.',
    type: 'side',
    levelRequired: 5,
    prerequisites: [],
    objectives: [
      {
        id: 'find_killers',
        description: 'Track down the Delgado family killers',
        type: 'kill',
        target: 'delgado_killers',
        required: 3
      },
      {
        id: 'find_graves',
        description: 'Find the unmarked graves of the Delgado family',
        type: 'visit',
        target: 'delgado_graves',
        required: 1
      }
    ],
    rewards: [
      { type: 'xp', amount: 500 },
      { type: 'item', itemId: 'widow_blessing' }
    ],
    repeatable: false,
    isActive: true
  },
  {
    questId: 'widow_warning',
    name: 'The Widow\'s Warning',
    description: 'The Widow appears before you, pointing frantically toward the canyon. Something terrible is coming. She cannot speak, but her terror is palpable.',
    type: 'side',
    levelRequired: 5,
    prerequisites: [],
    objectives: [
      {
        id: 'investigate_canyon',
        description: 'Investigate Sangre Canyon',
        type: 'visit',
        target: 'sangre_canyon_danger',
        required: 1
      }
    ],
    rewards: [
      { type: 'xp', amount: 200 }
    ],
    repeatable: true,
    isActive: true
  },

  // DOC PROMETHEUS QUESTS
  {
    questId: 'prometheus_materials',
    name: 'Unconventional Components',
    description: 'Doc Prometheus needs materials for his latest invention. The list is... unusual. He needs ghost rock, coyote teeth, and "the fear of a dying man." He assures you it\'s perfectly safe.',
    type: 'side',
    levelRequired: 8,
    prerequisites: [],
    objectives: [
      {
        id: 'ghost_rock',
        description: 'Collect ghost rock from The Scar region',
        type: 'collect',
        target: 'ghost_rock',
        required: 5
      },
      {
        id: 'coyote_teeth',
        description: 'Collect coyote teeth',
        type: 'collect',
        target: 'coyote_tooth',
        required: 3
      },
      {
        id: 'dying_fear',
        description: 'Capture "emotional essence" near death site',
        type: 'collect',
        target: 'fear_essence',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 200 },
      { type: 'item', itemId: 'prometheus_device' },
      { type: 'xp', amount: 400 }
    ],
    repeatable: false,
    isActive: true
  },
  {
    questId: 'prometheus_test',
    name: 'Voluntary Test Subject',
    description: 'Doc needs someone to test his latest invention: a device that supposedly enhances human abilities. He promises it\'s "mostly safe" and "probably won\'t cause permanent damage."',
    type: 'side',
    levelRequired: 8,
    prerequisites: ['prometheus_materials'],
    objectives: [
      {
        id: 'test_device',
        description: 'Use Prometheus Device',
        type: 'collect',
        target: 'prometheus_test_device',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 150 },
      { type: 'xp', amount: 300 }
    ],
    repeatable: false,
    isActive: true
  },

  // THE PROPHET QUESTS
  {
    questId: 'prophet_symbols',
    name: 'The Warning Signs',
    description: 'The Prophet frantically draws symbols in the dirt, screaming that they must be placed around The Scar to "keep it sleeping." He begs you to help place them before it\'s too late.',
    type: 'side',
    levelRequired: 10,
    prerequisites: [],
    objectives: [
      {
        id: 'place_symbols',
        description: 'Place Prophet\'s symbols around The Scar',
        type: 'visit',
        target: 'scar_seal_points',
        required: 5
      }
    ],
    rewards: [
      { type: 'xp', amount: 600 },
      { type: 'item', itemId: 'prophet_charm' }
    ],
    repeatable: false,
    isActive: true
  },
  {
    questId: 'prophet_vision',
    name: 'The Dark Vision',
    description: 'The Prophet grabs your arm with surprising strength. "You need to see," he whispers. "You need to understand." He offers you a strange fungus from The Scar.',
    type: 'side',
    levelRequired: 10,
    prerequisites: [],
    objectives: [
      {
        id: 'consume_fungus',
        description: 'Eat the Scar fungus',
        type: 'collect',
        target: 'scar_fungus',
        required: 1
      }
    ],
    rewards: [
      { type: 'xp', amount: 500 }
    ],
    repeatable: false,
    isActive: true
  },

  // MAMA LAVEAU QUESTS
  {
    questId: 'laveau_spirits',
    name: 'Communion with the Dead',
    description: 'Mama Laveau offers to help you speak with a dead person - for a price. She needs offerings for the Loa, and you must participate in the ritual.',
    type: 'side',
    levelRequired: 7,
    prerequisites: [],
    objectives: [
      {
        id: 'gather_offerings',
        description: 'Collect ritual offerings',
        type: 'collect',
        target: 'ritual_offerings',
        required: 5
      },
      {
        id: 'attend_ritual',
        description: 'Participate in voodoo ritual',
        type: 'visit',
        target: 'ritual_site',
        required: 1
      }
    ],
    rewards: [
      { type: 'xp', amount: 450 }
    ],
    repeatable: false,
    isActive: true
  },
  {
    questId: 'laveau_curse',
    name: 'The Curse',
    description: 'Someone has placed a voodoo curse on you. Mama Laveau can sense it and offers to remove it - but she wants to know who placed it and why.',
    type: 'side',
    levelRequired: 7,
    prerequisites: [],
    objectives: [
      {
        id: 'confession',
        description: 'Confess to Mama Laveau',
        type: 'visit',
        target: 'mama_confession',
        required: 1
      },
      {
        id: 'cleansing_ritual',
        description: 'Undergo cleansing ritual',
        type: 'visit',
        target: 'curse_removal',
        required: 1
      }
    ],
    rewards: [
      { type: 'item', itemId: 'laveau_gris_gris' },
      { type: 'xp', amount: 350 }
    ],
    repeatable: false,
    isActive: true
  },
  {
    questId: 'laveau_zombie',
    name: 'The Walking Dead',
    description: 'Mama Laveau asks for your help dealing with a zombie - a real one, created by a rival practitioner. "I need someone who won\'t panic."',
    type: 'side',
    levelRequired: 7,
    prerequisites: [],
    objectives: [
      {
        id: 'find_zombie',
        description: 'Track down the walking dead',
        type: 'visit',
        target: 'zombie_location',
        required: 1
      },
      {
        id: 'lay_to_rest',
        description: 'Help put the zombie to rest',
        type: 'kill',
        target: 'zombie',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 300 },
      { type: 'item', itemId: 'protection_gris_gris' },
      { type: 'xp', amount: 500 },
      { type: 'reputation', faction: 'FRONTERA', amount: 50 }
    ],
    repeatable: false,
    isActive: true
  },

  // THE COLLECTOR QUESTS
  {
    questId: 'collector_dagger',
    name: 'The Obsidian Dagger',
    description: 'The Collector is seeking an ancient obsidian dagger used in Coalition rituals. He\'s willing to pay handsomely for it.',
    type: 'side',
    levelRequired: 10,
    prerequisites: [],
    objectives: [
      {
        id: 'find_dagger',
        description: 'Find the ancient obsidian dagger',
        type: 'collect',
        target: 'obsidian_dagger',
        required: 1
      },
      {
        id: 'deliver_dagger',
        description: 'Deliver the dagger to The Collector',
        type: 'deliver',
        target: 'collector',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 1000 },
      { type: 'item', itemId: 'collectors_token' },
      { type: 'xp', amount: 500 }
    ],
    repeatable: false,
    isActive: true
  },
  {
    questId: 'collector_trade',
    name: 'The Strange Trade',
    description: 'The Collector has an item you need. But he wants a trade: an item of equal strangeness. "I deal only in the extraordinary."',
    type: 'side',
    levelRequired: 10,
    prerequisites: [],
    objectives: [
      {
        id: 'find_strange_item',
        description: 'Find an artifact strange enough to interest The Collector',
        type: 'collect',
        target: 'strange_artifact',
        required: 1
      }
    ],
    rewards: [
      { type: 'item', itemId: 'collectors_choice' },
      { type: 'xp', amount: 400 }
    ],
    repeatable: false,
    isActive: true
  },

  // BURNED MAN QUESTS
  {
    questId: 'burned_man_vengeance',
    name: 'The List',
    description: 'The Burned Man shows you a charred piece of paper with five names. Four are crossed out. One remains. "Help me," he rasps. "Or stay out of my way."',
    type: 'side',
    levelRequired: 12,
    prerequisites: [],
    objectives: [
      {
        id: 'find_final_killer',
        description: 'Track down the last man who burned Thomas Ashford',
        type: 'visit',
        target: 'final_killer_location',
        required: 1
      },
      {
        id: 'deliver_justice',
        description: 'Deliver justice (or mercy)',
        type: 'visit',
        target: 'burned_man_finale',
        required: 1
      }
    ],
    rewards: [
      { type: 'xp', amount: 700 },
      { type: 'item', itemId: 'burned_mans_token' }
    ],
    repeatable: false,
    isActive: true
  },
  {
    questId: 'burned_man_protection',
    name: 'Burn the Guilty',
    description: 'The Burned Man appears at your camp. He knows you\'re being hunted by men who want you dead for something you didn\'t do. "I know injustice. I will help you."',
    type: 'side',
    levelRequired: 12,
    prerequisites: [],
    objectives: [
      {
        id: 'accept_help',
        description: 'Accept The Burned Man\'s offer',
        type: 'visit',
        target: 'burned_man_alliance',
        required: 1
      }
    ],
    rewards: [
      { type: 'xp', amount: 400 }
    ],
    repeatable: false,
    isActive: true
  },

  // SISTER AGNES QUESTS
  {
    questId: 'agnes_exorcism',
    name: 'The Exorcism',
    description: 'Sister Agnes claims a settler is possessed by a demon. She intends to perform an exorcism. "The devil has many faces," she says, eyes gleaming.',
    type: 'side',
    levelRequired: 10,
    prerequisites: [],
    objectives: [
      {
        id: 'investigate_possession',
        description: 'Investigate the alleged possession',
        type: 'visit',
        target: 'possessed_settler',
        required: 1
      },
      {
        id: 'perform_exorcism',
        description: 'Assist with exorcism or stop it',
        type: 'visit',
        target: 'exorcism_choice',
        required: 1
      }
    ],
    rewards: [
      { type: 'xp', amount: 500 },
      { type: 'item', itemId: 'blessed_cross' }
    ],
    repeatable: false,
    isActive: true
  },
  {
    questId: 'agnes_forbidden',
    name: 'Forbidden Knowledge',
    description: 'Sister Agnes has a book - the Codex Maleficorum, a tome of demon lore. "Would you learn from the darkness to fight the darkness?"',
    type: 'side',
    levelRequired: 10,
    prerequisites: [],
    objectives: [
      {
        id: 'study_codex',
        description: 'Study the Codex Maleficorum',
        type: 'visit',
        target: 'demon_codex',
        required: 1
      }
    ],
    rewards: [
      { type: 'xp', amount: 600 }
    ],
    repeatable: false,
    isActive: true
  },

  // THE CARTOGRAPHER QUESTS
  {
    questId: 'cartographer_thin_places',
    name: 'The Thin Places',
    description: 'The Cartographer hands you a map of locations marked with strange symbols. "These are thin places. Reality is weak there. Don\'t stay long."',
    type: 'side',
    levelRequired: 8,
    prerequisites: [],
    objectives: [
      {
        id: 'visit_thin_places',
        description: 'Visit all five thin places',
        type: 'visit',
        target: 'thin_places',
        required: 5
      }
    ],
    rewards: [
      { type: 'xp', amount: 550 }
    ],
    repeatable: false,
    isActive: true
  },
  {
    questId: 'cartographer_lost_city',
    name: 'The City That Wasn\'t',
    description: 'The Cartographer shows you a detailed map of a city. "It was here last week. Now it\'s not. But it was. Find it. Prove I\'m not mad."',
    type: 'side',
    levelRequired: 8,
    prerequisites: [],
    objectives: [
      {
        id: 'locate_city',
        description: 'Find the location where the city should be',
        type: 'visit',
        target: 'impossible_city_location',
        required: 1
      },
      {
        id: 'prove_existence',
        description: 'Find evidence the city existed',
        type: 'collect',
        target: 'city_artifact',
        required: 1
      }
    ],
    rewards: [
      { type: 'xp', amount: 700 },
      { type: 'item', itemId: 'impossible_map' }
    ],
    repeatable: false,
    isActive: true
  }
];

/**
 * Seed mysterious figure quests into database
 */
export async function seedMysteriousFigureQuests(): Promise<void> {
  try {
    console.log('Seeding mysterious figure quests...');

    let created = 0;
    let skipped = 0;

    for (const questData of MYSTERIOUS_FIGURE_QUEST_SEEDS) {
      const existing = await QuestDefinition.findOne({ questId: questData.questId });

      if (!existing) {
        await QuestDefinition.create(questData);
        created++;
        console.log(`  ✓ Created quest: ${questData.name}`);
      } else {
        skipped++;
        console.log(`  - Skipped existing quest: ${questData.name}`);
      }
    }

    console.log(`\nMysterious Figure Quest Seeding Complete:`);
    console.log(`  Created: ${created}`);
    console.log(`  Skipped: ${skipped}`);
    console.log(`  Total: ${MYSTERIOUS_FIGURE_QUEST_SEEDS.length}`);
  } catch (error) {
    console.error('Error seeding mysterious figure quests:', error);
    throw error;
  }
}

/**
 * Remove all mysterious figure quests from database
 */
export async function removeMysteriousFigureQuests(): Promise<void> {
  try {
    const questIds = MYSTERIOUS_FIGURE_QUEST_SEEDS.map(q => q.questId);
    const result = await QuestDefinition.deleteMany({ questId: { $in: questIds } });
    console.log(`Removed ${result.deletedCount} mysterious figure quests`);
  } catch (error) {
    console.error('Error removing mysterious figure quests:', error);
    throw error;
  }
}
