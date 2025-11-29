/**
 * Chinese Diaspora NPCs (Continued)
 *
 * Remaining NPCs across Fort Ashford, Whiskey Bend, The Frontera, and Dusty Trail
 */

import type { ChineseNPC } from '@desperados/shared';

// ============================================================================
// FORT ASHFORD NPCs (2)
// ============================================================================

export const WONG_SHU: ChineseNPC = {
  id: 'wong-shu',
  name: 'Wong Shu',
  chineseName: 'Wáng Shū',
  chineseCharacters: '王书',
  coverRole: 'Military Laundry Service',
  hiddenRole: 'Military Intelligence Gatherer',
  location: 'fort-ashford',
  description: 'A bespectacled man in his fifties who handles the officer laundry at Fort Ashford. He seems meek and subservient, but nothing escapes his notice - every stain, every letter left in pockets, every whispered conversation near the laundry room.',
  personality: 'Outwardly submissive and quiet. Internally calculating and observant. Master of appearing invisible. Photographic memory.',
  backstory: 'Wong Shu worked as a clerk in China before immigrating in 1878. His education made him dangerous - literate in English and Chinese. The military hired him for laundry because they thought him harmless. They were catastrophically wrong. Every paper, every uniform, every overheard conversation feeds the network.',
  networkRole: 'informant',

  trustLevels: [
    {
      level: 0,
      name: 'Outsider',
      description: 'Military laundry service',
      requirements: {},
      unlocks: {},
    },
    {
      level: 1,
      name: 'Acquaintance',
      description: 'Discreetly referred by the network',
      requirements: {
        referrals: ['chen-wei'],
      },
      unlocks: {
        services: ['basic-information'],
        dialogue: ['military-talk'],
      },
    },
    {
      level: 2,
      name: 'Friend',
      description: 'Proven trustworthy with sensitive information',
      requirements: {
        quests: ['the-lost-papers'],
      },
      unlocks: {
        services: ['patrol-schedules', 'officer-intel'],
        quests: ['the-colonels-secret'],
      },
    },
    {
      level: 3,
      name: 'Brother/Sister',
      description: 'Trusted intelligence partner',
      requirements: {
        quests: ['the-colonels-secret'],
      },
      unlocks: {
        services: ['classified-intel', 'military-movements'],
        npcs: ['hu-feng'],
      },
    },
    {
      level: 4,
      name: 'Family',
      description: 'Master spy',
      requirements: {
        quests: ['operation-silk-road'],
      },
      unlocks: {
        services: ['complete-intelligence'],
      },
    },
  ],

  defaultTrust: 0,

  services: [
    {
      id: 'basic-information',
      name: 'Fort Gossip',
      chineseName: '军营消息',
      description: 'General information about fort activities.',
      category: 'information',
      minTrustLevel: 1,
      cost: { gold: 25 },
    },
    {
      id: 'patrol-schedules',
      name: 'Patrol Routes',
      chineseName: '巡逻路线',
      description: 'Detailed schedules of military patrols.',
      category: 'information',
      minTrustLevel: 2,
      cost: { gold: 100 },
    },
    {
      id: 'officer-intel',
      name: 'Officer Intelligence',
      chineseName: '军官情报',
      description: 'Personal information about specific officers - weaknesses, habits, secrets.',
      category: 'information',
      minTrustLevel: 2,
      cost: { gold: 150 },
    },
    {
      id: 'classified-intel',
      name: 'Classified Intelligence',
      chineseName: '机密情报',
      description: 'High-level military plans and operations.',
      category: 'information',
      minTrustLevel: 3,
      cost: { gold: 300 },
      cooldown: 1440,
    },
    {
      id: 'military-movements',
      name: 'Troop Movements',
      chineseName: '军队调动',
      description: 'Advance warning of military operations.',
      category: 'information',
      minTrustLevel: 3,
      cost: { gold: 500 },
      cooldown: 2880,
    },
    {
      id: 'complete-intelligence',
      name: 'Complete Fort Intelligence',
      chineseName: '完整情报',
      description: 'Everything happening at Fort Ashford - deployments, secrets, weaknesses.',
      category: 'information',
      minTrustLevel: 4,
      cost: { gold: 1000 },
      cooldown: 10080,
    },
  ],

  quests: [
    {
      id: 'the-lost-papers',
      name: 'The Lost Papers',
      description: 'An officer lost important documents. Wong Shu found them. Help him decide what to do.',
      backstory: 'A drunk officer left classified papers in his uniform. Wong Shu copied them. Now he needs someone to deliver the originals back anonymously.',
      minTrustLevel: 1,
      objectives: [
        { type: 'retrieve', target: 'classified-papers', quantity: 1 },
        { type: 'deliver', target: 'officers-quarters', location: 'fort-ashford' },
        { type: 'speak', target: 'wong-shu' },
      ],
      rewards: {
        gold: 100,
        xp: 300,
        trustIncrease: 1,
      },
    },
    {
      id: 'the-colonels-secret',
      name: 'The Colonel\'s Secret',
      description: 'Wong Shu discovered the colonel is embezzling funds. This information is dangerous.',
      backstory: 'The colonel has been skimming money meant for supplies. Wong Shu has proof. But exposing him could bring down military wrath on the Chinese community.',
      minTrustLevel: 2,
      objectives: [
        { type: 'retrieve', target: 'embezzlement-evidence', quantity: 1 },
        { type: 'speak', target: 'master-fang' },
        { type: 'deliver', target: 'anonymous-tip', location: 'federal-marshal' },
      ],
      rewards: {
        gold: 300,
        xp: 750,
        trustIncrease: 1,
        items: ['colonels-ledger'],
      },
    },
    {
      id: 'operation-silk-road',
      name: 'Operation Silk Road',
      description: 'Wong Shu will reveal the full scope of the Chinese intelligence network.',
      backstory: 'For years, Chinese workers across the territory have been gathering intelligence. Wong Shu coordinates it all. He will bring you into the inner circle.',
      minTrustLevel: 3,
      objectives: [
        { type: 'speak', target: 'all-network-contacts' },
        { type: 'deliver', target: 'intelligence-reports', quantity: 10 },
        { type: 'protect', target: 'network-meeting' },
      ],
      rewards: {
        gold: 1000,
        xp: 2500,
        trustIncrease: 1,
        items: ['silk-road-cipher', 'master-spy-badge'],
        networkAccess: ['hidden-network-contacts'],
      },
    },
  ],

  dialogue: {
    greeting: {
      outsider: [
        'Yes sir? You need laundry?',
        '*Keeps eyes down* Wong Shu wash uniform, very clean.',
        '*Bows* How I help you?',
      ],
      acquaintance: [
        '*Glances around* We can talk. But quietly.',
        'The network spoke of you.',
        'What information do you seek?',
      ],
      friend: [
        'I learn many things washing uniforms. Papers in pockets. Blood on sleeves.',
        'The officers think I am invisible. This is my greatest weapon.',
        'Come, we speak in back room.',
      ],
      brotherSister: [
        'You understand the value of what I do.',
        '*Speaks in educated English* The military machine reveals itself in laundry.',
        'We are intelligence officers without commissions.',
      ],
      family: [
        'You are a master spy now. Together we see everything.',
        'The network across the territory reports to me. Now you are part of that.',
        'Knowledge is power. And we have both.',
      ],
    },
    coverStory: [
      'Wong Shu just do laundry. No understand English well.',
      'Officers very important. Wong Shu just servant.',
      'Know nothing. See nothing.',
    ],
    suspicion: [
      '*Becomes suddenly incomprehent* No speak English. Sorry.',
      '*Nervous* Wong Shu busy. Much laundry today.',
      'Cannot talk now. Officers watching.',
    ],
    trust: [
      'They think I cannot read. I read seven languages.',
      'Every stain tells a story. Blood, wine, gunpowder, mud from specific terrain.',
      'I know which officers are brave, which are cowards, which are cruel.',
      'Papers in pockets - maps, orders, love letters. I copy everything.',
    ],
    farewell: [
      'Go quietly.',
      'May you walk unseen.',
      'The shadows protect you.',
    ],
    questHints: [
      'Officer lost important papers. Found in pocket. Very... interesting papers.',
      'Colonel lives well. Too well for his pay. Wong Shu wonder where money comes from.',
    ],
    networkReferences: [
      'Hu Feng works in officers quarters. He hears even more than Wong Shu.',
      'Chen Wei in Red Gulch - he coordinates messages across territory.',
    ],
  },

  discoveryMethod: 'trust',
  discoveryCondition: {
    npcReferral: 'chen-wei',
    minReputation: 75,
  },

  networkConnections: {
    trusts: ['chen-wei', 'hu-feng', 'master-fang'],
    distrusts: [],
    canRefer: ['hu-feng'],
    family: [],
  },

  schedule: [
    { hour: 5, available: false, activity: 'Collecting laundry from barracks' },
    { hour: 8, available: true, activity: 'Washing - reading papers in pockets' },
    { hour: 12, available: true, activity: 'Delivering clean uniforms - listening' },
    { hour: 16, available: true, activity: 'Folding, noting stains and damage' },
    { hour: 20, available: false, activity: 'Writing coded reports' },
  ],

  culturalNotes: [
    'Chinese servants often had access to highly sensitive areas',
    'Being underestimated was a survival strategy that could be weaponized',
    'Literacy was rare and therefore powerful',
  ],
};

export const HU_FENG: ChineseNPC = {
  id: 'hu-feng',
  name: 'Hu Feng',
  chineseName: 'Hú Fēng',
  chineseCharacters: '胡风',
  coverRole: 'Officers\' Quarters Servant',
  hiddenRole: 'Underground Railroad Contact',
  location: 'fort-ashford',
  description: 'A young man in his late twenties who cleans the officers\' quarters. Quick and efficient, he moves through rooms like a ghost. What few know is that he helps deserters and escaped prisoners vanish.',
  personality: 'Quiet and watchful. Deeply compassionate. Believes everyone deserves freedom. Brave despite appearing timid.',
  backstory: 'Hu Feng escaped from a labor camp in California where conditions were akin to slavery. The network helped him flee. Now he returns the favor, helping soldiers who can\'t bear their service anymore, and prisoners unjustly held. He knows every secret passage in and out of Fort Ashford.',
  networkRole: 'protector',

  trustLevels: [
    {
      level: 0,
      name: 'Outsider',
      description: 'Servant in officers\' quarters',
      requirements: {},
      unlocks: {},
    },
    {
      level: 1,
      name: 'Acquaintance',
      description: 'Referred by Wong Shu',
      requirements: {
        referrals: ['wong-shu'],
      },
      unlocks: {
        services: ['safe-passage-advice'],
        dialogue: ['freedom-talk'],
      },
    },
    {
      level: 2,
      name: 'Friend',
      description: 'Proven sympathetic to escapees',
      requirements: {
        quests: ['the-deserter'],
      },
      unlocks: {
        services: ['escape-planning', 'false-documents'],
        quests: ['underground-railroad'],
      },
    },
    {
      level: 3,
      name: 'Brother/Sister',
      description: 'Active underground railroad conductor',
      requirements: {
        quests: ['underground-railroad'],
      },
      unlocks: {
        services: ['full-escape-service', 'witness-protection'],
        npcs: ['railroad-chen'],
      },
    },
    {
      level: 4,
      name: 'Family',
      description: 'Liberator',
      requirements: {
        quests: ['the-great-escape'],
      },
      unlocks: {
        services: ['mass-evacuation'],
      },
    },
  ],

  defaultTrust: 0,

  services: [
    {
      id: 'safe-passage-advice',
      name: 'Escape Advice',
      chineseName: '逃生建议',
      description: 'General advice on how to escape the fort or territory.',
      category: 'safe_house',
      minTrustLevel: 1,
      cost: { gold: 50 },
    },
    {
      id: 'escape-planning',
      name: 'Escape Plan',
      chineseName: '逃跑计划',
      description: 'Detailed plan for escaping Fort Ashford or evading pursuit.',
      category: 'safe_house',
      minTrustLevel: 2,
      cost: { gold: 150 },
    },
    {
      id: 'false-documents',
      name: 'False Papers',
      chineseName: '假证件',
      description: 'Forged identity documents.',
      category: 'safe_house',
      minTrustLevel: 2,
      cost: { gold: 200 },
      cooldown: 2880,
    },
    {
      id: 'full-escape-service',
      name: 'Underground Railroad',
      chineseName: '地下铁路',
      description: 'Complete escape service - documents, route, safe houses, new identity.',
      category: 'safe_house',
      minTrustLevel: 3,
      cost: { gold: 500 },
      cooldown: 4320,
    },
    {
      id: 'witness-protection',
      name: 'Witness Protection',
      chineseName: '证人保护',
      description: 'Make someone disappear completely. New life, new identity.',
      category: 'safe_house',
      minTrustLevel: 3,
      cost: { gold: 1000 },
      cooldown: 10080,
    },
    {
      id: 'mass-evacuation',
      name: 'Mass Evacuation',
      chineseName: '大规模撤离',
      description: 'Evacuate multiple people simultaneously. Only in emergencies.',
      category: 'safe_house',
      minTrustLevel: 4,
      cost: { gold: 2000 },
      cooldown: 20160,
    },
  ],

  quests: [
    {
      id: 'the-deserter',
      name: 'The Deserter',
      description: 'A soldier wants to desert but has no way out. Help Hu Feng get him to safety.',
      backstory: 'The soldier was ordered to attack a peaceful Nahi village. He refused and now faces court martial. He wants out.',
      minTrustLevel: 1,
      objectives: [
        { type: 'speak', target: 'deserter-soldier', location: 'fort-ashford' },
        { type: 'retrieve', target: 'civilian-clothes', quantity: 1 },
        { type: 'protect', target: 'deserter-escape' },
        { type: 'deliver', target: 'deserter', location: 'safe-house' },
      ],
      rewards: {
        gold: 200,
        xp: 500,
        trustIncrease: 1,
      },
      timeLimit: 12,
      failureConsequences: {
        trustDecrease: 2,
      },
    },
    {
      id: 'underground-railroad',
      name: 'The Underground Railroad',
      description: 'Establish a permanent underground railroad route through the territory.',
      backstory: 'Hu Feng wants to create a reliable system for helping people escape persecution. This requires safe houses, documents, and trustworthy conductors.',
      minTrustLevel: 2,
      objectives: [
        { type: 'find', target: 'safe-house-locations', quantity: 5 },
        { type: 'speak', target: 'potential-conductors', quantity: 3 },
        { type: 'deliver', target: 'supply-caches', quantity: 5 },
      ],
      rewards: {
        gold: 500,
        xp: 1250,
        trustIncrease: 1,
        items: ['railroad-conductor-badge'],
        networkAccess: ['railroad-network'],
      },
    },
    {
      id: 'the-great-escape',
      name: 'The Great Escape',
      description: 'Help Hu Feng evacuate an entire labor camp.',
      backstory: 'A secret labor camp holds forty Chinese workers in slavery. The network has located it. Tonight, they escape - all of them.',
      minTrustLevel: 3,
      objectives: [
        { type: 'find', target: 'labor-camp', location: 'devils-canyon' },
        { type: 'protect', target: 'forty-workers' },
        { type: 'deliver', target: 'workers', location: 'hidden-settlement' },
      ],
      rewards: {
        gold: 1000,
        xp: 3000,
        trustIncrease: 2,
        items: ['liberator-medal', 'eternal-gratitude'],
      },
      timeLimit: 24,
    },
  ],

  dialogue: {
    greeting: {
      outsider: [
        '*Continues sweeping without acknowledging you*',
        '...',
        '*Nods briefly and moves away*',
      ],
      acquaintance: [
        'Wong Shu said you might come.',
        'You want to help someone? Or yourself?',
        'Come. We talk somewhere private.',
      ],
      friend: [
        'Every person deserves freedom.',
        'I was in chains once. Never again. Not for me, not for anyone.',
        'The network saves lives. You are part of that now.',
      ],
      brotherSister: [
        'You are a conductor now. A guide to freedom.',
        'We have saved hundreds. We will save thousands.',
        'You understand what this means. What it costs.',
      ],
      family: [
        'You are a hero of the people.',
        'History will not remember our names. But those we saved will.',
        'We are freedom itself.',
      ],
    },
    coverStory: [
      'Hu Feng clean rooms. That all.',
      'No speak English well. Sorry.',
      '*Pretends not to understand*',
    ],
    suspicion: [
      '*Becomes very busy* Must finish work.',
      'Cannot talk. Busy.',
      '*Eyes show fear* Please leave.',
    ],
    trust: [
      'I was chained in a work camp. Beaten. Starved. The network saved me.',
      'Now I save others. Soldiers who cannot bear the killing. Prisoners wrongly held.',
      'Fort Ashford has many secrets. I know them all. The passages. The schedules. The blind spots.',
      'Every week, someone vanishes. The military thinks desertion. They never suspect the Chinese servant.',
    ],
    farewell: [
      'Walk free.',
      'May you never wear chains.',
      'The path is clear. Go.',
    ],
    questHints: [
      'A soldier wants to leave. Cannot. Faces prison or worse.',
      'We need safe houses. Reliable people. Can you help?',
    ],
    networkReferences: [
      'Railroad Chen knows every tunnel from his railroad days. Important contact.',
      'Wong Shu provides intelligence. I provide escape. We work together.',
    ],
  },

  discoveryMethod: 'trust',
  discoveryCondition: {
    npcReferral: 'wong-shu',
    minReputation: 100,
  },

  networkConnections: {
    trusts: ['wong-shu', 'railroad-chen', 'master-fang'],
    distrusts: [],
    canRefer: ['railroad-chen'],
    family: [],
  },

  schedule: [
    { hour: 6, available: false, activity: 'Cleaning officers quarters - searching' },
    { hour: 10, available: true, activity: 'Break - can be contacted' },
    { hour: 12, available: false, activity: 'Lunch service' },
    { hour: 15, available: true, activity: 'Afternoon break' },
    { hour: 18, available: false, activity: 'Evening duties' },
    { hour: 22, available: true, activity: 'Underground railroad work' },
  ],

  culturalNotes: [
    'Chinese immigrants often helped escaped slaves via Underground Railroad',
    'Labor camps and slavery-like conditions were real for Chinese workers',
    'Desertion rates were high during frontier conflicts',
  ],
};

// ============================================================================
// WHISKEY BEND NPCs (3)
// ============================================================================

export const MASTER_FANG: ChineseNPC = {
  id: 'master-fang',
  name: 'Master Fang',
  chineseName: 'Fāng Lǎo Shī',
  chineseCharacters: '方老师',
  coverRole: 'Herbalist Shop Owner (Semi-Open)',
  hiddenRole: 'Network Elder & Community Leader',
  location: 'whiskey-bend',
  description: 'An elderly man with a long white beard and sharp eyes that miss nothing. His herb shop is known throughout the territory - even white settlers come for his medicines. But his true role is as the elder and coordinator of the entire Chinese network.',
  personality: 'Wise and patient. Speaks in proverbs and riddles. Tests people\'s character. Firm but compassionate. The grandfather of the community.',
  backstory: 'Fang came to America in 1850 during the Gold Rush. He has seen everything - the good years, the railroad, the Exclusion Act, the violence. He survived by being smart, invisible, and invaluable. Now in his seventies, he leads the network with quiet authority. Every Chinese person in the territory knows Master Fang. Most outsiders think he\'s just an old herbalist.',
  networkRole: 'elder',

  trustLevels: [
    {
      level: 0,
      name: 'Outsider',
      description: 'Customer at herb shop',
      requirements: {},
      unlocks: {
        services: ['basic-herbs'],
      },
    },
    {
      level: 1,
      name: 'Acquaintance',
      description: 'Recommended customer',
      requirements: {
        referrals: ['mei-lin', 'chen-wei'],
      },
      unlocks: {
        services: ['quality-medicine'],
        dialogue: ['wisdom-talk'],
      },
    },
    {
      level: 2,
      name: 'Friend',
      description: 'Passed Master Fang\'s tests',
      requirements: {
        quests: ['test-of-character'],
      },
      unlocks: {
        services: ['rare-medicines', 'network-introduction'],
        quests: ['the-elders-burden'],
        npcs: ['jade-flower', 'chen-bo'],
      },
    },
    {
      level: 3,
      name: 'Brother/Sister',
      description: 'Recognized as friend of the community',
      requirements: {
        quests: ['the-elders-burden', 'protect-the-people'],
      },
      unlocks: {
        services: ['martial-arts-training', 'network-coordination'],
        dialogue: ['inner-circle-secrets'],
      },
    },
    {
      level: 4,
      name: 'Family',
      description: 'Honorary elder',
      requirements: {
        quests: ['the-golden-legacy'],
      },
      unlocks: {
        services: ['legendary-teaching'],
        items: ['fangs-blessing'],
      },
    },
  ],

  defaultTrust: 0,

  services: [
    {
      id: 'basic-herbs',
      name: 'Herbal Medicine',
      description: 'Common herbs for basic ailments.',
      category: 'medicine',
      minTrustLevel: 0,
      cost: { gold: 15 },
      effects: {
        health: 40,
      },
    },
    {
      id: 'quality-medicine',
      name: 'Quality Traditional Medicine',
      chineseName: '上等药材',
      description: 'High-quality herbal preparations.',
      category: 'medicine',
      minTrustLevel: 1,
      cost: { gold: 50 },
      effects: {
        health: 80,
        energy: 20,
      },
    },
    {
      id: 'rare-medicines',
      name: 'Rare Medicinal Compounds',
      chineseName: '珍贵药方',
      description: 'Rare medicines not available anywhere else.',
      category: 'healing',
      minTrustLevel: 2,
      cost: { gold: 150 },
      effects: {
        health: 150,
        energy: 50,
        buffDuration: 240,
        buffEffect: 'master-healing',
      },
    },
    {
      id: 'network-introduction',
      name: 'Network Introduction',
      chineseName: '引荐',
      description: 'Master Fang introduces you to other network members.',
      category: 'information',
      minTrustLevel: 2,
      cost: { gold: 100 },
    },
    {
      id: 'martial-arts-training',
      name: 'Martial Arts Training',
      chineseName: '武术训练',
      description: 'Master Fang teaches traditional Chinese martial arts.',
      category: 'martial_arts',
      minTrustLevel: 3,
      cost: { gold: 500 },
      cooldown: 10080,
    },
    {
      id: 'network-coordination',
      name: 'Network Coordination',
      chineseName: '网络协调',
      description: 'Master Fang coordinates network resources to help you.',
      category: 'information',
      minTrustLevel: 3,
      cost: { gold: 300 },
      cooldown: 4320,
    },
    {
      id: 'legendary-teaching',
      name: 'Elder\'s Wisdom',
      chineseName: '长者智慧',
      description: 'Master Fang shares lifetime of knowledge and secrets.',
      category: 'martial_arts',
      minTrustLevel: 4,
      cost: { gold: 2000 },
    },
  ],

  quests: [
    {
      id: 'test-of-character',
      name: 'Test of Character',
      description: 'Master Fang gives you three tests to judge your worth.',
      backstory: 'Fang does not trust easily. He will test your honesty, compassion, and wisdom.',
      minTrustLevel: 1,
      objectives: [
        { type: 'deliver', target: 'test-package', location: 'unknown' },
        { type: 'protect', target: 'innocent-person' },
        { type: 'speak', target: 'master-fang' },
      ],
      rewards: {
        gold: 0,
        xp: 500,
        trustIncrease: 1,
      },
    },
    {
      id: 'the-elders-burden',
      name: 'The Elder\'s Burden',
      description: 'Master Fang reveals the weight of leading the network. Help him with a difficult decision.',
      backstory: 'A member of the community betrayed the network. Fang must decide punishment. He asks for your counsel.',
      minTrustLevel: 2,
      objectives: [
        { type: 'speak', target: 'traitor' },
        { type: 'speak', target: 'victims' },
        { type: 'speak', target: 'master-fang' },
      ],
      rewards: {
        gold: 300,
        xp: 1000,
        trustIncrease: 1,
        items: ['elders-token'],
      },
    },
    {
      id: 'protect-the-people',
      name: 'Protect the People',
      description: 'A gang plans to attack the Chinese quarter. Master Fang needs defenders.',
      backstory: 'Violence against Chinese immigrants is rising. Master Fang prepares to protect the community.',
      minTrustLevel: 2,
      objectives: [
        { type: 'protect', target: 'chinese-quarter' },
        { type: 'speak', target: 'gang-leader' },
      ],
      rewards: {
        gold: 500,
        xp: 1500,
        trustIncrease: 2,
        items: ['community-defender-badge'],
      },
    },
    {
      id: 'the-golden-legacy',
      name: 'The Golden Legacy',
      description: 'Master Fang entrusts you with the network\'s greatest secret and responsibility.',
      backstory: 'Fang is old. He needs someone to carry on his work. He will pass the mantle to you.',
      minTrustLevel: 3,
      objectives: [
        { type: 'speak', target: 'all-elders' },
        { type: 'protect', target: 'network-gathering' },
        { type: 'retrieve', target: 'sacred-scroll', quantity: 1 },
      ],
      rewards: {
        gold: 1000,
        xp: 5000,
        trustIncrease: 2,
        items: ['elder-status', 'network-leadership'],
      },
    },
  ],

  dialogue: {
    greeting: {
      outsider: [
        'Welcome to my humble shop. How may I assist you?',
        'You seek medicine? Please, tell me your ailment.',
        '*Nods respectfully* Come, sit. Tell me what troubles you.',
      ],
      acquaintance: [
        'Ah, you return. You were recommended by a friend.',
        'You have good character. I sense this.',
        'Come, let us talk over tea.',
      ],
      friend: [
        'You have passed my tests. You are trustworthy.',
        'The network has need of people like you.',
        'Ask your questions. I will answer truthfully.',
      ],
      brotherSister: [
        'You are family now. The people trust you.',
        'Come, there is much I must teach you.',
        'You honor us with your friendship.',
      ],
      family: [
        'You will carry this forward when I am gone.',
        'I am old. You are the future.',
        'The ancestors smile upon you.',
      ],
    },
    coverStory: [
      'I am simple herbalist. I help people feel better.',
      'Many years I study medicine. This is my gift.',
      'The plants are my teachers.',
    ],
    suspicion: [
      '*Studies you carefully* Why do you ask these questions?',
      'Patience, young one. Some things must be earned.',
      'Trust is like a tree. It grows slowly.',
    ],
    trust: [
      'I came in 1850. So much has changed. So much stays the same.',
      'We survive because we help each other. Because we are invisible when we must be, and strong when we must be.',
      'The network is our family. Our protection. Our revenge.',
      'They can exclude us from their country, but they cannot exclude us from our destiny.',
    ],
    farewell: [
      'Walk in wisdom.',
      'May the ancestors guide you.',
      'Until we meet again.',
    ],
    questHints: [
      'I must test you. Character cannot be judged by words alone.',
      'Leadership is burden. Decisions I make affect many lives.',
    ],
    networkReferences: [
      'Jade Flower knows many secrets. Men talk freely to beautiful women.',
      'Chen Bo at telegraph office - he hears everything before anyone else.',
    ],
  },

  discoveryMethod: 'visible',

  networkConnections: {
    trusts: ['chen-wei', 'mei-lin', 'wong-shu', 'jade-flower', 'chen-bo'],
    distrusts: [],
    canRefer: ['jade-flower', 'chen-bo'],
    family: [],
  },

  schedule: [
    { hour: 7, available: true, activity: 'Morning meditation' },
    { hour: 9, available: true, activity: 'Shop open - preparing medicines' },
    { hour: 13, available: true, activity: 'Consultations' },
    { hour: 17, available: true, activity: 'Evening shop hours' },
    { hour: 20, available: false, activity: 'Network coordination meetings' },
  ],

  culturalNotes: [
    'Elders held positions of great respect in Chinese communities',
    'Chinese medicine shops were often the only healthcare available',
    'Community leadership operated invisibly to avoid persecution',
  ],
};

export const JADE_FLOWER: ChineseNPC = {
  id: 'jade-flower',
  name: 'Jade Flower',
  chineseName: 'Sū Měi (Su Mei)',
  chineseCharacters: '苏美',
  coverRole: 'Brothel Entertainer',
  hiddenRole: 'Intelligence Gatherer & Blackmail Specialist',
  location: 'whiskey-bend',
  description: 'A beautiful woman in her late twenties with sharp intelligence hidden behind a practiced smile. She works at the Silver Slipper brothel, where powerful men come to relax. They never suspect that she remembers every word, every secret, every weakness.',
  personality: 'Outwardly charming and flirtatious. Internally calculating and driven. Uses sexuality as a weapon and shield. Deeply protective of other working women.',
  backstory: 'Su Mei was sold to a brothel in San Francisco at age fifteen. She learned to survive by being smarter than her clients. When she saved enough money, she moved to Whiskey Bend and began working for the network. Every secret she learns is catalogued. Every powerful man who visits becomes leverage. She dreams of buying freedom for every Chinese woman in her situation.',
  networkRole: 'informant',

  trustLevels: [
    {
      level: 0,
      name: 'Outsider',
      description: 'Just another customer',
      requirements: {},
      unlocks: {},
    },
    {
      level: 1,
      name: 'Acquaintance',
      description: 'Referred by Master Fang',
      requirements: {
        referrals: ['master-fang'],
      },
      unlocks: {
        services: ['basic-secrets'],
        dialogue: ['intelligence-talk'],
      },
    },
    {
      level: 2,
      name: 'Friend',
      description: 'Proven respectful and trustworthy',
      requirements: {
        quests: ['rescue-the-girl'],
      },
      unlocks: {
        services: ['blackmail-material', 'seduction-training'],
        quests: ['web-of-secrets'],
      },
    },
    {
      level: 3,
      name: 'Brother/Sister',
      description: 'Partner in intelligence work',
      requirements: {
        quests: ['web-of-secrets'],
      },
      unlocks: {
        services: ['complete-dossiers', 'honey-trap'],
        npcs: ['hidden-contacts'],
      },
    },
    {
      level: 4,
      name: 'Family',
      description: 'Master spy',
      requirements: {
        quests: ['the-liberation'],
      },
      unlocks: {
        services: ['ultimate-leverage'],
      },
    },
  ],

  defaultTrust: 0,

  services: [
    {
      id: 'basic-secrets',
      name: 'Pillow Talk',
      chineseName: '枕边话',
      description: 'General secrets and gossip from clients.',
      category: 'information',
      minTrustLevel: 1,
      cost: { gold: 75 },
    },
    {
      id: 'blackmail-material',
      name: 'Blackmail Material',
      chineseName: '把柄',
      description: 'Compromising information about specific individuals.',
      category: 'information',
      minTrustLevel: 2,
      cost: { gold: 200 },
    },
    {
      id: 'seduction-training',
      name: 'Art of Seduction',
      chineseName: '魅惑之术',
      description: 'Jade Flower teaches social manipulation techniques.',
      category: 'information',
      minTrustLevel: 2,
      cost: { gold: 300 },
    },
    {
      id: 'complete-dossiers',
      name: 'Complete Dossier',
      chineseName: '完整档案',
      description: 'Everything about a target - secrets, habits, weaknesses, fears.',
      category: 'information',
      minTrustLevel: 3,
      cost: { gold: 500 },
      cooldown: 2880,
    },
    {
      id: 'honey-trap',
      name: 'Honey Trap Operation',
      chineseName: '美人计',
      description: 'Jade Flower will personally seduce a target for information.',
      category: 'information',
      minTrustLevel: 3,
      cost: { gold: 1000 },
      cooldown: 10080,
    },
    {
      id: 'ultimate-leverage',
      name: 'Ultimate Leverage',
      chineseName: '终极把柄',
      description: 'Complete control over a powerful individual through blackmail.',
      category: 'information',
      minTrustLevel: 4,
      cost: { gold: 2500 },
      cooldown: 20160,
    },
  ],

  quests: [
    {
      id: 'rescue-the-girl',
      name: 'Rescue the Girl',
      description: 'A young Chinese girl was kidnapped and forced into prostitution. Jade Flower needs help freeing her.',
      backstory: 'Jade Flower sees herself in every trapped girl. She will not rest until they are all free.',
      minTrustLevel: 1,
      objectives: [
        { type: 'find', target: 'kidnapped-girl', location: 'whiskey-bend' },
        { type: 'protect', target: 'girl' },
        { type: 'deliver', target: 'girl', location: 'safe-house' },
      ],
      rewards: {
        gold: 200,
        xp: 600,
        trustIncrease: 1,
      },
      timeLimit: 12,
    },
    {
      id: 'web-of-secrets',
      name: 'Web of Secrets',
      description: 'Help Jade Flower build a comprehensive blackmail network.',
      backstory: 'Every powerful man in Whiskey Bend has secrets. Jade Flower collects them all. Knowledge is power.',
      minTrustLevel: 2,
      objectives: [
        { type: 'retrieve', target: 'secret-documents', quantity: 5 },
        { type: 'speak', target: 'informants', quantity: 3 },
        { type: 'deliver', target: 'compiled-secrets', location: 'jade-flower' },
      ],
      rewards: {
        gold: 400,
        xp: 1200,
        trustIncrease: 1,
        items: ['blackmail-ledger'],
      },
    },
    {
      id: 'the-liberation',
      name: 'The Liberation',
      description: 'Free every Chinese woman from forced prostitution in the territory.',
      backstory: 'Jade Flower has dreamed of this for years. Tonight, every woman walks free.',
      minTrustLevel: 3,
      objectives: [
        { type: 'find', target: 'all-brothels', quantity: 5 },
        { type: 'protect', target: 'escaping-women', quantity: 20 },
        { type: 'deliver', target: 'women', location: 'freedom-settlement' },
      ],
      rewards: {
        gold: 1000,
        xp: 5000,
        trustIncrease: 2,
        items: ['liberator-of-women', 'jade-flowers-blessing'],
      },
    },
  ],

  dialogue: {
    greeting: {
      outsider: [
        '*Practiced smile* Looking for company, handsome?',
        'First time here? I can show you a good time.',
        '*Flirtatious* What brings you to the Silver Slipper?',
      ],
      acquaintance: [
        '*Drops the act slightly* Master Fang spoke of you.',
        'You\'re different. You see me as a person.',
        'We can talk business. Real business.',
      ],
      friend: [
        'You helped that girl. You have a good heart.',
        'I know many things. Powerful things. What do you need?',
        '*Speaks in perfect English* Let\'s drop the pretenses.',
      ],
      brotherSister: [
        'We are partners now. Intelligence partners.',
        'Every man who walks through that door gives me power over him.',
        'You understand what I really do here.',
      ],
      family: [
        'You helped free us. I will never forget.',
        'We are all free now. Because of you.',
        'You are a true hero.',
      ],
    },
    coverStory: [
      'I just entertain men. Make them happy.',
      'Is good job. Better than laundry or cleaning.',
      '*Giggles* You want to know my secrets? That costs extra.',
    ],
    suspicion: [
      '*Flirts to deflect* You ask too many questions. Let\'s talk about something else.',
      'I don\'t know anything. I just work here.',
      '*Eyes become hard* Leave. Now.',
    ],
    trust: [
      'They think I\'m stupid. A pretty toy. They talk freely.',
      'I remember everything. Every secret. Every weakness. Every crime.',
      'Some women are forced into this life. I choose it. Because it gives me power.',
      'When I have enough secrets, enough power, I will free everyone like me.',
    ],
    farewell: [
      'Come back anytime. For business or... business.',
      'Stay safe out there.',
      'May you hold the secrets that matter.',
    ],
    questHints: [
      'There\'s a girl... young, scared. She was taken. I need to get her out.',
      'Knowledge is power. And I am building an empire of knowledge.',
    ],
    networkReferences: [
      'Master Fang is like grandfather to me. He gave me purpose.',
      'Chen Bo at telegraph office also collects information. We share sometimes.',
    ],
  },

  discoveryMethod: 'trust',
  discoveryCondition: {
    npcReferral: 'master-fang',
    minReputation: 100,
  },

  networkConnections: {
    trusts: ['master-fang', 'chen-bo'],
    distrusts: [],
    canRefer: ['chen-bo'],
    family: [],
  },

  schedule: [
    { hour: 12, available: true, activity: 'Waking, organizing notes' },
    { hour: 15, available: true, activity: 'Personal time, can meet privately' },
    { hour: 19, available: false, activity: 'Working at brothel' },
    { hour: 3, available: false, activity: 'Writing down secrets learned' },
  ],

  culturalNotes: [
    'Chinese women were often trafficked and forced into prostitution',
    'Some women used their position to gain information and power',
    'Sex workers formed tight bonds and protected each other',
    'Liberation of trafficked women was a major goal of Chinese community leaders',
  ],
};

export const CHEN_BO: ChineseNPC = {
  id: 'chen-bo',
  name: 'Chen Bo',
  chineseName: 'Chén Bó',
  chineseCharacters: '陈博',
  coverRole: 'Telegraph Operator\'s Assistant & Translator',
  hiddenRole: 'Message Interceptor & Intelligence Analyst',
  location: 'whiskey-bend',
  description: 'A bookish young man in his twenties who works as assistant and translator at the telegraph office. Quiet and efficient, he seems to fade into the background. But every message that comes through Whiskey Bend passes through his hands first.',
  personality: 'Intelligent and analytical. Photographic memory. Socially awkward but brilliant with codes and patterns. Obsessive about details.',
  backstory: 'Chen Bo was educated in Hong Kong before immigrating in 1882. His English is flawless, and he can read and write multiple Chinese dialects. The telegraph office hired him for translations. What they don\'t know is that he copies every message, analyzes patterns, and predicts events before they happen. He is the network\'s oracle.',
  networkRole: 'informant',

  trustLevels: [
    {
      level: 0,
      name: 'Outsider',
      description: 'Telegraph office assistant',
      requirements: {},
      unlocks: {},
    },
    {
      level: 1,
      name: 'Acquaintance',
      description: 'Referred by network elder',
      requirements: {
        referrals: ['master-fang'],
      },
      unlocks: {
        services: ['message-reading'],
        dialogue: ['telegraph-talk'],
      },
    },
    {
      level: 2,
      name: 'Friend',
      description: 'Proven intelligent and discreet',
      requirements: {
        quests: ['the-cipher'],
      },
      unlocks: {
        services: ['advance-warning', 'pattern-analysis'],
        quests: ['the-prediction'],
      },
    },
    {
      level: 3,
      name: 'Brother/Sister',
      description: 'Trusted intelligence analyst',
      requirements: {
        quests: ['the-prediction'],
      },
      unlocks: {
        services: ['complete-surveillance', 'message-forgery'],
        npcs: ['secret-contacts'],
      },
    },
    {
      level: 4,
      name: 'Family',
      description: 'Master of information',
      requirements: {
        quests: ['the-network-map'],
      },
      unlocks: {
        services: ['omniscience'],
      },
    },
  ],

  defaultTrust: 0,

  services: [
    {
      id: 'message-reading',
      name: 'Recent Telegrams',
      chineseName: '电报内容',
      description: 'Chen Bo shares interesting recent telegraph messages.',
      category: 'information',
      minTrustLevel: 1,
      cost: { gold: 50 },
    },
    {
      id: 'advance-warning',
      name: 'Advance Warning',
      chineseName: '提前警告',
      description: 'Warns you of incoming law enforcement, military, or gang movements.',
      category: 'information',
      minTrustLevel: 2,
      cost: { gold: 150 },
      cooldown: 1440,
    },
    {
      id: 'pattern-analysis',
      name: 'Pattern Analysis',
      chineseName: '模式分析',
      description: 'Chen Bo analyzes message patterns to predict future events.',
      category: 'information',
      minTrustLevel: 2,
      cost: { gold: 200 },
    },
    {
      id: 'complete-surveillance',
      name: 'Complete Surveillance',
      chineseName: '全面监视',
      description: 'Monitor all communications about a specific person or organization.',
      category: 'information',
      minTrustLevel: 3,
      cost: { gold: 500 },
      cooldown: 2880,
    },
    {
      id: 'message-forgery',
      name: 'Forged Telegraph',
      chineseName: '伪造电报',
      description: 'Chen Bo sends a forged telegraph message in someone\'s name.',
      category: 'information',
      minTrustLevel: 3,
      cost: { gold: 800 },
      cooldown: 4320,
    },
    {
      id: 'omniscience',
      name: 'The All-Seeing Eye',
      chineseName: '全知之眼',
      description: 'Complete knowledge of all telegraph communications in the territory.',
      category: 'information',
      minTrustLevel: 4,
      cost: { gold: 2000 },
      cooldown: 10080,
    },
  ],

  quests: [
    {
      id: 'the-cipher',
      name: 'The Cipher',
      description: 'Chen Bo intercepted a coded message. Help him break the cipher.',
      backstory: 'A criminal organization is using coded telegraphs. Chen Bo needs help cracking their system.',
      minTrustLevel: 1,
      objectives: [
        { type: 'retrieve', target: 'coded-messages', quantity: 5 },
        { type: 'speak', target: 'chen-bo' },
        { type: 'deliver', target: 'cipher-key', quantity: 1 },
      ],
      rewards: {
        gold: 200,
        xp: 500,
        trustIncrease: 1,
        items: ['cryptography-guide'],
      },
    },
    {
      id: 'the-prediction',
      name: 'The Prediction',
      description: 'Chen Bo predicts a major event from message patterns. Investigate to confirm.',
      backstory: 'By analyzing telegraph patterns, Chen Bo predicted a bank robbery. He needs confirmation.',
      minTrustLevel: 2,
      objectives: [
        { type: 'find', target: 'gang-hideout', location: 'devils-canyon' },
        { type: 'retrieve', target: 'robbery-plans', quantity: 1 },
        { type: 'protect', target: 'bank' },
      ],
      rewards: {
        gold: 500,
        xp: 1500,
        trustIncrease: 1,
        items: ['analyst-badge'],
      },
    },
    {
      id: 'the-network-map',
      name: 'The Network Map',
      description: 'Map the entire criminal and political network of the territory through telegraph analysis.',
      backstory: 'Every message reveals connections. Chen Bo will compile a complete map of power in the territory.',
      minTrustLevel: 3,
      objectives: [
        { type: 'retrieve', target: 'telegraph-logs', quantity: 50 },
        { type: 'speak', target: 'all-network-contacts' },
        { type: 'deliver', target: 'complete-analysis', quantity: 1 },
      ],
      rewards: {
        gold: 1500,
        xp: 4000,
        trustIncrease: 2,
        items: ['territory-network-map', 'master-analyst-seal'],
      },
    },
  ],

  dialogue: {
    greeting: {
      outsider: [
        '*Adjusts glasses nervously* Do you need to send a message?',
        '*Doesn\'t look up from paperwork*',
        'Please fill out this form for telegraph service.',
      ],
      acquaintance: [
        'Master Fang suggested we talk.',
        'I see patterns in the messages. Interesting patterns.',
        'What information do you seek?',
      ],
      friend: [
        'You understand patterns. Good.',
        'Every message tells a story. Together, they reveal the future.',
        'I know what will happen before it does.',
      ],
      brotherSister: [
        'We are analysts together now.',
        'The telegraph network is like a nervous system. I feel every pulse.',
        'I will teach you to see the invisible.',
      ],
      family: [
        'You are a master of information now.',
        'Together we see everything. Know everything.',
        'The territory has no secrets from us.',
      ],
    },
    coverStory: [
      'I just translate and file messages. Simple work.',
      'Chen Bo not important. Just assistant.',
      '*Nervous* I cannot share telegraph contents. Is private.',
    ],
    suspicion: [
      '*Pushes glasses up nervously* I... I must get back to work.',
      'Cannot talk about messages. Is confidential.',
      '*Sweating* Please leave. Boss will be angry.',
    ],
    trust: [
      'Every message passes through my hands. I read them all.',
      'Patterns emerge. Law enforcement telegraphs before raids. Gangs coordinate crimes.',
      'I predicted the last three bank robberies. The sheriff thinks I\'m lucky.',
      'Knowledge is power. And I have more knowledge than anyone.',
    ],
    farewell: [
      'May your messages arrive safely.',
      'I will watch for signals.',
      'Go carefully.',
    ],
    questHints: [
      'There are coded messages. I cannot break the cipher alone.',
      'The patterns suggest something big. Soon. I need confirmation.',
    ],
    networkReferences: [
      'Jade Flower also gathers intelligence. Different methods, same goal.',
      'Wong Shu at Fort Ashford - his information complements mine perfectly.',
    ],
  },

  discoveryMethod: 'trust',
  discoveryCondition: {
    npcReferral: 'master-fang',
  },

  networkConnections: {
    trusts: ['master-fang', 'jade-flower', 'wong-shu'],
    distrusts: [],
    canRefer: [],
    family: [],
  },

  schedule: [
    { hour: 7, available: true, activity: 'Opening telegraph office' },
    { hour: 9, available: true, activity: 'Processing messages - copying' },
    { hour: 13, available: true, activity: 'Lunch - analyzing patterns' },
    { hour: 15, available: true, activity: 'Afternoon telegraph work' },
    { hour: 19, available: false, activity: 'Closed - compiling intelligence reports' },
  ],

  culturalNotes: [
    'Telegraph operators had access to enormous amounts of sensitive information',
    'Chinese translators were essential but often underestimated',
    'Pattern analysis and cryptography were rare skills',
  ],
};

// Export continued NPCs
export const CHINESE_NPCS_CONTINUED: ChineseNPC[] = [
  // Fort Ashford (2)
  WONG_SHU,
  HU_FENG,
  // Whiskey Bend (3)
  MASTER_FANG,
  JADE_FLOWER,
  CHEN_BO,
];

// Note: Still need The Frontera (2) and Dusty Trail (2) NPCs
// These should follow the same pattern with:
// - Dragon Lee (gambling den operator / smuggling)
// - Auntie Zhao (cook / network mother)
// - Railroad Chen (former railroad worker / tunnel expert)
// - Dr. Huang (self-trained physician)
