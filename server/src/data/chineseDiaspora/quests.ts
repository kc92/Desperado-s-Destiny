/**
 * Chinese Diaspora Underground Railroad Quests
 *
 * Quest chains centered around helping Chinese immigrants escape persecution,
 * labor camps, and discrimination through underground networks.
 *
 * HISTORICAL CONTEXT:
 * - Chinese Exclusion Act of 1882 severely restricted immigration
 * - Many Chinese workers trapped in exploitative labor conditions
 * - Underground networks helped people escape, find new identities, relocate
 * - Real historical courage and sacrifice
 *
 * DESIGN PHILOSOPHY:
 * - Meaningful choices with real consequences
 * - Respectful treatment of serious subject matter
 * - Multiple paths: stealth, combat, social
 * - Long-term effects on game world
 * - Reputation-based progression
 */

import type { QuestSeedData } from '../../models/Quest.model';

// ============================================================================
// MAIN QUEST CHAIN: "The Iron Road to Freedom"
// A 5-part epic quest chain about freeing Chinese workers from brutal labor camp
// ============================================================================

export const IRON_ROAD_QUEST_CHAIN: QuestSeedData[] = [
  {
    questId: 'whispers-on-the-wind',
    name: 'Whispers on the Wind',
    description: 'Chen Wei speaks in hushed tones of fifty Chinese workers trapped in debt bondage at a railroad labor camp. The Transcontinental Railroad Company treats them worse than animals. Someone needs to investigate.',
    type: 'main',
    levelRequired: 8,
    prerequisites: [],
    objectives: [
      {
        id: 'speak-chen-wei',
        description: 'Listen to Chen Wei\'s concerns about the labor camp',
        type: 'visit',
        target: 'npc:chen-wei',
        required: 1
      },
      {
        id: 'investigate-railroad-company',
        description: 'Scout the Transcontinental Railroad labor camp',
        type: 'visit',
        target: 'location:railroad-labor-camp',
        required: 1
      },
      {
        id: 'count-workers',
        description: 'Count the trapped workers without being detected',
        type: 'skill',
        target: 'skill:stealth',
        required: 1
      },
      {
        id: 'gather-evidence',
        description: 'Find evidence of labor abuses and debt bondage',
        type: 'collect',
        target: 'item:labor-contract',
        required: 3
      },
      {
        id: 'report-findings',
        description: 'Report your findings to Chen Wei',
        type: 'visit',
        target: 'npc:chen-wei',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 100 },
      { type: 'xp', amount: 250 },
      { type: 'reputation', amount: 50, faction: 'chinese-network' }
    ],
    repeatable: false,
    isActive: true
  },

  {
    questId: 'the-inside-man',
    name: 'The Inside Man',
    description: 'Hu Feng reveals there is a contact inside the camp - a brave worker willing to help coordinate an escape. You must smuggle supplies to him and map the guard patrols without being caught.',
    type: 'main',
    levelRequired: 10,
    prerequisites: ['whispers-on-the-wind'],
    objectives: [
      {
        id: 'meet-hu-feng',
        description: 'Meet Hu Feng at the Golden Spur Saloon',
        type: 'visit',
        target: 'npc:hu-feng',
        required: 1
      },
      {
        id: 'smuggle-supplies',
        description: 'Smuggle food, medicine, and tools into the camp',
        type: 'deliver',
        target: 'item:supply-package',
        required: 5
      },
      {
        id: 'map-guard-patrols',
        description: 'Map the guard patrol routes and timing',
        type: 'skill',
        target: 'skill:observation',
        required: 3
      },
      {
        id: 'identify-escape-routes',
        description: 'Identify three possible escape routes',
        type: 'visit',
        target: 'location:escape-route',
        required: 3
      },
      {
        id: 'contact-inside-man',
        description: 'Make contact with the inside man',
        type: 'visit',
        target: 'npc:camp-contact',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 200 },
      { type: 'xp', amount: 500 },
      { type: 'reputation', amount: 75, faction: 'chinese-network' },
      { type: 'item', itemId: 'camp-layout-map' }
    ],
    repeatable: false,
    isActive: true
  },

  {
    questId: 'breaking-chains',
    name: 'Breaking Chains',
    description: 'The time has come to execute the escape plan. You must choose your approach: a stealthy midnight extraction, bribing the guards, or a bold frontal assault. Each path will free different numbers of workers and have different consequences.',
    type: 'main',
    levelRequired: 12,
    prerequisites: ['the-inside-man'],
    objectives: [
      {
        id: 'choose-approach',
        description: 'Decide how to execute the escape: Stealth, Bribery, or Force',
        type: 'skill',
        target: 'choice:stealth-bribery-force',
        required: 1
      },
      {
        id: 'execute-stealth',
        description: '[STEALTH PATH] Lead workers out through secret tunnels',
        type: 'visit',
        target: 'location:secret-tunnel-exit',
        required: 1
      },
      {
        id: 'execute-bribery',
        description: '[BRIBERY PATH] Pay off guards to look the other way',
        type: 'gold',
        target: 'spent',
        required: 500
      },
      {
        id: 'execute-force',
        description: '[FORCE PATH] Fight through guards and liberate the camp',
        type: 'kill',
        target: 'npc:camp-guard',
        required: 12
      },
      {
        id: 'free-workers',
        description: 'Get workers to the first safe house',
        type: 'visit',
        target: 'location:safe-house-alpha',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 400 },
      { type: 'xp', amount: 800 },
      { type: 'reputation', amount: 150, faction: 'chinese-network' },
      { type: 'item', itemId: 'liberators-badge' }
    ],
    repeatable: false,
    isActive: true
  },

  {
    questId: 'the-long-march',
    name: 'The Long March',
    description: 'The escape was only the beginning. Now you must guide the freed workers to safety while Pinkerton agents hunt them. You will face impossible choices about who to save when the group is too large and the pursuers too close.',
    type: 'main',
    levelRequired: 14,
    prerequisites: ['breaking-chains'],
    objectives: [
      {
        id: 'evade-pinkertons',
        description: 'Stay ahead of Pinkerton pursuit teams',
        type: 'skill',
        target: 'skill:evasion',
        required: 5
      },
      {
        id: 'sophie-choice',
        description: 'Make the impossible choice when cornered',
        type: 'skill',
        target: 'choice:save-elderly-save-families-save-all',
        required: 1
      },
      {
        id: 'reach-safe-house-network',
        description: 'Guide survivors through the network of safe houses',
        type: 'visit',
        target: 'location:safe-house',
        required: 5
      },
      {
        id: 'confront-pursuers',
        description: 'Make a final stand against the Pinkerton agents',
        type: 'kill',
        target: 'npc:pinkerton-agent',
        required: 8
      },
      {
        id: 'reach-sanctuary',
        description: 'Bring survivors to the sanctuary city',
        type: 'visit',
        target: 'location:chinatown-sanctuary',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 600 },
      { type: 'xp', amount: 1200 },
      { type: 'reputation', amount: 200, faction: 'chinese-network' },
      { type: 'item', itemId: 'survivors-gratitude' }
    ],
    timeLimit: 480, // 8 hours
    repeatable: false,
    isActive: true
  },

  {
    questId: 'new-lives',
    name: 'New Lives',
    description: 'The workers are free, but freedom means nothing without opportunity. Help them establish new identities, find honest work, and build new lives. You may also choose to confront the railroad boss who enslaved them.',
    type: 'main',
    levelRequired: 16,
    prerequisites: ['the-long-march'],
    objectives: [
      {
        id: 'forge-documents',
        description: 'Work with Master Fang to create new identity papers',
        type: 'deliver',
        target: 'item:identity-papers',
        required: 20
      },
      {
        id: 'find-housing',
        description: 'Secure housing for the freed workers',
        type: 'gold',
        target: 'spent',
        required: 300
      },
      {
        id: 'match-jobs',
        description: 'Match workers\' skills to available jobs in the territory',
        type: 'skill',
        target: 'skill:persuasion',
        required: 10
      },
      {
        id: 'confront-railroad-boss',
        description: '[OPTIONAL] Confront Cornelius Blackwell, the railroad boss',
        type: 'visit',
        target: 'npc:cornelius-blackwell',
        required: 1
      },
      {
        id: 'final-choice',
        description: '[BOSS FIGHT OPTIONAL] Choose: Expose him, Duel him, or Make a deal',
        type: 'skill',
        target: 'choice:expose-duel-deal',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 1000 },
      { type: 'xp', amount: 2000 },
      { type: 'reputation', amount: 300, faction: 'chinese-network' },
      { type: 'item', itemId: 'freedom-fighters-medal' },
      { type: 'item', itemId: 'railroad-testimony' }
    ],
    repeatable: false,
    isActive: true
  }
];

// ============================================================================
// SECONDARY QUEST CHAIN: "The Jade Passage"
// Smuggling immigrants safely into the territory
// ============================================================================

export const JADE_PASSAGE_QUEST_CHAIN: QuestSeedData[] = [
  {
    questId: 'crossing-the-wire',
    name: 'Crossing the Wire',
    description: 'A family of five needs to cross the border tonight. Border patrols have been doubled. You must guide them through the wilderness and either bribe or evade the patrol.',
    type: 'side',
    levelRequired: 10,
    prerequisites: [],
    objectives: [
      {
        id: 'meet-family',
        description: 'Meet the Zhang family at the border rendezvous point',
        type: 'visit',
        target: 'location:border-crossing-point',
        required: 1
      },
      {
        id: 'choose-route',
        description: 'Choose: Mountain path (stealth) or River crossing (bribe)',
        type: 'skill',
        target: 'choice:mountain-river',
        required: 1
      },
      {
        id: 'evade-patrols',
        description: 'Evade or bribe border patrol units',
        type: 'skill',
        target: 'skill:stealth-or-persuasion',
        required: 1
      },
      {
        id: 'cross-border',
        description: 'Successfully cross into safe territory',
        type: 'visit',
        target: 'location:safe-territory',
        required: 1
      },
      {
        id: 'deliver-family',
        description: 'Deliver the family to Railroad Chen',
        type: 'visit',
        target: 'npc:railroad-chen',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 250 },
      { type: 'xp', amount: 500 },
      { type: 'reputation', amount: 60, faction: 'chinese-network' }
    ],
    timeLimit: 360, // 6 hours - must be done at night
    repeatable: false,
    isActive: true
  },

  {
    questId: 'paper-sons',
    name: 'Paper Sons',
    description: 'The Chinese Exclusion Act can be circumvented with the right paperwork. Work with Master Fang to create convincing false identity documents claiming the immigrants are children of Chinese-American citizens.',
    type: 'side',
    levelRequired: 12,
    prerequisites: ['crossing-the-wire'],
    objectives: [
      {
        id: 'meet-master-fang',
        description: 'Seek out Master Fang in Whiskey Bend',
        type: 'visit',
        target: 'npc:master-fang',
        required: 1
      },
      {
        id: 'find-forger',
        description: 'Locate a skilled document forger in Red Gulch',
        type: 'visit',
        target: 'npc:jacob-slate',
        required: 1
      },
      {
        id: 'gather-materials',
        description: 'Gather official paper, seals, and ink',
        type: 'collect',
        target: 'item:forgery-materials',
        required: 5
      },
      {
        id: 'create-documents',
        description: 'Work with the forger to create convincing papers',
        type: 'skill',
        target: 'skill:crafting',
        required: 1
      },
      {
        id: 'test-documents',
        description: 'Test the documents with a friendly immigration official',
        type: 'visit',
        target: 'npc:friendly-official',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 400 },
      { type: 'xp', amount: 750 },
      { type: 'reputation', amount: 100, faction: 'chinese-network' },
      { type: 'item', itemId: 'forgery-contacts' }
    ],
    repeatable: false,
    isActive: true
  },

  {
    questId: 'the-new-beginning',
    name: 'The New Beginning',
    description: 'Ten families have successfully made it across. Now you must help them integrate into the territory - finding housing, matching their skills to jobs, and protecting them from discrimination.',
    type: 'side',
    levelRequired: 14,
    prerequisites: ['paper-sons'],
    objectives: [
      {
        id: 'find-housing',
        description: 'Secure housing for ten families',
        type: 'gold',
        target: 'spent',
        required: 500
      },
      {
        id: 'match-carpenter',
        description: 'Find work for the carpenter family',
        type: 'visit',
        target: 'npc:construction-boss',
        required: 1
      },
      {
        id: 'match-cook',
        description: 'Find work for the restaurant workers',
        type: 'visit',
        target: 'npc:restaurant-owner',
        required: 1
      },
      {
        id: 'match-seamstress',
        description: 'Find work for the seamstresses',
        type: 'visit',
        target: 'npc:tailor',
        required: 1
      },
      {
        id: 'protect-from-thugs',
        description: 'Defend the new families from racist thugs',
        type: 'kill',
        target: 'npc:racist-thug',
        required: 5
      },
      {
        id: 'establish-community',
        description: 'Help establish a small Chinese community center',
        type: 'gold',
        target: 'spent',
        required: 300
      }
    ],
    rewards: [
      { type: 'gold', amount: 600 },
      { type: 'xp', amount: 1000 },
      { type: 'reputation', amount: 150, faction: 'chinese-network' },
      { type: 'item', itemId: 'community-gratitude' }
    ],
    repeatable: false,
    isActive: true
  }
];

// ============================================================================
// RESCUE QUESTS (Repeatable)
// Short missions for reputation gains
// ============================================================================

export const RESCUE_QUESTS: QuestSeedData[] = [
  {
    questId: 'escaping-the-mines',
    name: 'Escaping the Mines',
    description: 'A worker at Goldfinger\'s Mine wants to escape his contract. Help him flee before the foreman notices he\'s gone. You have 6 hours.',
    type: 'daily',
    levelRequired: 8,
    prerequisites: [],
    objectives: [
      {
        id: 'meet-worker',
        description: 'Meet the worker at the mine entrance after dark',
        type: 'visit',
        target: 'location:goldfinger-mine-entrance',
        required: 1
      },
      {
        id: 'evade-foreman',
        description: 'Help the worker evade the night foreman',
        type: 'skill',
        target: 'skill:stealth',
        required: 1
      },
      {
        id: 'reach-safe-house',
        description: 'Guide the worker to Chen Wei\'s safe house',
        type: 'visit',
        target: 'location:chen-wei-safehouse',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 75 },
      { type: 'xp', amount: 150 },
      { type: 'reputation', amount: 30, faction: 'chinese-network' }
    ],
    timeLimit: 360, // 6 hours
    repeatable: true,
    isActive: true
  },

  {
    questId: 'safe-haven',
    name: 'Safe Haven',
    description: 'A family fleeing persecution needs escort to the safe house network. Bandits and lawmen both pose threats on the road.',
    type: 'side',
    levelRequired: 10,
    prerequisites: [],
    objectives: [
      {
        id: 'meet-family',
        description: 'Meet the Liu family at the rendezvous point',
        type: 'visit',
        target: 'location:rendezvous-point',
        required: 1
      },
      {
        id: 'defend-from-bandits',
        description: 'Protect the family from bandits',
        type: 'kill',
        target: 'npc:bandit',
        required: 3
      },
      {
        id: 'evade-lawmen',
        description: 'Evade corrupt lawmen looking for "illegal immigrants"',
        type: 'skill',
        target: 'skill:stealth',
        required: 1
      },
      {
        id: 'deliver-family',
        description: 'Deliver the family to a safe house',
        type: 'visit',
        target: 'location:safe-house',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 100 },
      { type: 'xp', amount: 200 },
      { type: 'reputation', amount: 25, faction: 'chinese-network' }
    ],
    repeatable: true,
    isActive: true
  },

  {
    questId: 'midnight-express',
    name: 'Midnight Express',
    description: 'Railroad Chen has secret tunnels beneath the territory. Use them to move a large group of refugees quickly and safely.',
    type: 'side',
    levelRequired: 12,
    prerequisites: [],
    objectives: [
      {
        id: 'meet-railroad-chen',
        description: 'Meet Railroad Chen at the tunnel entrance',
        type: 'visit',
        target: 'npc:railroad-chen',
        required: 1
      },
      {
        id: 'navigate-tunnels',
        description: 'Navigate the dark tunnels safely',
        type: 'visit',
        target: 'location:tunnel-waypoint',
        required: 5
      },
      {
        id: 'avoid-cave-ins',
        description: 'Avoid unstable sections that could collapse',
        type: 'skill',
        target: 'skill:perception',
        required: 3
      },
      {
        id: 'deliver-refugees',
        description: 'Deliver 15 refugees to the tunnel exit',
        type: 'visit',
        target: 'location:tunnel-exit',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 150 },
      { type: 'xp', amount: 300 },
      { type: 'reputation', amount: 40, faction: 'chinese-network' }
    ],
    repeatable: true,
    isActive: true
  }
];

// ============================================================================
// DRAMATIC QUESTS
// Morally complex missions with lasting consequences
// ============================================================================

export const DRAMATIC_QUESTS: QuestSeedData[] = [
  {
    questId: 'sophies-choice-at-the-crossing',
    name: 'Sophie\'s Choice at the Crossing',
    description: 'Two groups of refugees arrive at the crossing point simultaneously. You only have resources and time to guide one group safely. The other will have to wait - but waiting could mean death. Who do you save?',
    type: 'event',
    levelRequired: 12,
    prerequisites: [],
    objectives: [
      {
        id: 'assess-situation',
        description: 'Assess both groups\' situations',
        type: 'visit',
        target: 'location:crossing-point',
        required: 1
      },
      {
        id: 'impossible-choice',
        description: 'Choose which group to save: Elderly/sick or Families with children',
        type: 'skill',
        target: 'choice:elderly-families',
        required: 1
      },
      {
        id: 'guide-chosen',
        description: 'Guide the chosen group to safety',
        type: 'visit',
        target: 'location:safe-house',
        required: 1
      },
      {
        id: 'face-consequences',
        description: 'Face the consequences of your choice',
        type: 'visit',
        target: 'npc:chen-wei',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 300 },
      { type: 'xp', amount: 800 },
      { type: 'reputation', amount: 100, faction: 'chinese-network' },
      { type: 'item', itemId: 'burden-of-choice' }
    ],
    repeatable: false,
    isActive: true
  },

  {
    questId: 'the-informer',
    name: 'The Informer',
    description: 'Someone is betraying the underground railroad to the authorities. Three safe houses have been raided. Chen Wei tasks you with finding the traitor before more lives are lost.',
    type: 'side',
    levelRequired: 14,
    prerequisites: [],
    objectives: [
      {
        id: 'investigate-raids',
        description: 'Investigate the three raided safe houses',
        type: 'visit',
        target: 'location:raided-safehouse',
        required: 3
      },
      {
        id: 'gather-evidence',
        description: 'Gather evidence and testimonies',
        type: 'collect',
        target: 'item:evidence',
        required: 5
      },
      {
        id: 'identify-suspects',
        description: 'Identify three possible informers',
        type: 'skill',
        target: 'skill:investigation',
        required: 1
      },
      {
        id: 'confront-traitor',
        description: 'Confront the real traitor',
        type: 'visit',
        target: 'npc:informer',
        required: 1
      },
      {
        id: 'decide-fate',
        description: 'Decide the traitor\'s fate: Exile, Execution, or Redemption',
        type: 'skill',
        target: 'choice:exile-execute-redeem',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 500 },
      { type: 'xp', amount: 1200 },
      { type: 'reputation', amount: 150, faction: 'chinese-network' },
      { type: 'item', itemId: 'network-security' }
    ],
    repeatable: false,
    isActive: true
  },

  {
    questId: 'the-debt-collector',
    name: 'The Debt Collector',
    description: 'Lao "Lucky Lou" exploits immigrant workers by trapping them in predatory debt. He claims to be helping them, but he\'s destroying families. Expose his crimes, pay off the debts, or eliminate him - your choice.',
    type: 'side',
    levelRequired: 16,
    prerequisites: [],
    objectives: [
      {
        id: 'investigate-lucky-lou',
        description: 'Investigate Lucky Lou\'s loan sharking operation',
        type: 'visit',
        target: 'npc:lucky-lou',
        required: 1
      },
      {
        id: 'interview-victims',
        description: 'Interview three families trapped in debt',
        type: 'visit',
        target: 'npc:debt-victim',
        required: 3
      },
      {
        id: 'gather-evidence',
        description: 'Steal Lucky Lou\'s ledger as evidence',
        type: 'collect',
        target: 'item:debt-ledger',
        required: 1
      },
      {
        id: 'choose-solution',
        description: 'Choose: Pay debts (1000g), Expose crimes, or Kill Lucky Lou',
        type: 'skill',
        target: 'choice:pay-expose-kill',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 800 },
      { type: 'xp', amount: 1500 },
      { type: 'reputation', amount: 200, faction: 'chinese-network' },
      { type: 'item', itemId: 'debt-freedom' }
    ],
    repeatable: false,
    isActive: true
  },

  {
    questId: 'the-testimony',
    name: 'The Testimony',
    description: 'A U.S. Senator is holding hearings on the Chinese Exclusion Act. Master Fang believes this is a chance to tell the truth about the conditions Chinese workers face. But testifying means exposing the underground railroad - and everyone in it.',
    type: 'event',
    levelRequired: 18,
    prerequisites: ['new-lives'],
    objectives: [
      {
        id: 'council-meeting',
        description: 'Attend the emergency council meeting',
        type: 'visit',
        target: 'location:secret-council',
        required: 1
      },
      {
        id: 'debate-choice',
        description: 'Debate the risks and benefits of testimony',
        type: 'skill',
        target: 'skill:persuasion',
        required: 3
      },
      {
        id: 'final-decision',
        description: 'Make the final decision: Testify or Stay Silent',
        type: 'skill',
        target: 'choice:testify-silent',
        required: 1
      },
      {
        id: 'face-consequences',
        description: 'Face the consequences of your decision',
        type: 'visit',
        target: 'location:senate-hearing',
        required: 1
      }
    ],
    rewards: [
      { type: 'gold', amount: 1000 },
      { type: 'xp', amount: 2500 },
      { type: 'reputation', amount: 300, faction: 'chinese-network' },
      { type: 'item', itemId: 'voice-of-the-voiceless' }
    ],
    repeatable: false,
    isActive: true
  }
];

// ============================================================================
// EXPORT ALL QUESTS
// ============================================================================

export const ALL_UNDERGROUND_RAILROAD_QUESTS: QuestSeedData[] = [
  ...IRON_ROAD_QUEST_CHAIN,
  ...JADE_PASSAGE_QUEST_CHAIN,
  ...RESCUE_QUESTS,
  ...DRAMATIC_QUESTS
];

// Quest statistics
export const QUEST_STATS = {
  totalQuests: ALL_UNDERGROUND_RAILROAD_QUESTS.length,
  mainQuestChain: IRON_ROAD_QUEST_CHAIN.length,
  secondaryQuestChain: JADE_PASSAGE_QUEST_CHAIN.length,
  repeatableQuests: RESCUE_QUESTS.length,
  dramaticQuests: DRAMATIC_QUESTS.length,
  totalReputation: 2875, // Max reputation available
  totalGold: 9100, // Max gold available (excluding choices)
  totalXP: 22350 // Max XP available
};
