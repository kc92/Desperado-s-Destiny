/**
 * Chinese Diaspora NPCs
 *
 * A hidden network of Chinese immigrant NPCs scattered across the territory.
 * They form a trust-based sub-faction offering unique goods, services, and quests.
 *
 * HISTORICAL CONTEXT (1880s):
 * - Chinese Exclusion Act (1882) created severe discrimination
 * - Many worked in railroad construction, mining, laundry, restaurants
 * - Tight-knit communities formed for mutual protection
 * - Underground networks for communication and aid
 * - Rich cultural traditions maintained despite hardship
 *
 * DESIGN PHILOSOPHY:
 * - Respectful representation of historical struggles
 * - Honor their resilience and contributions
 * - Cultural authenticity in goods and services
 * - Trust-based progression system
 * - Hidden network requiring discovery
 */

import type { ChineseNPC } from '@desperados/shared';

// ============================================================================
// RED GULCH NPCs (3)
// ============================================================================

export const CHEN_WEI: ChineseNPC = {
  id: 'chen-wei',
  name: 'Chen Wei',
  chineseName: 'Chén Wěi',
  chineseCharacters: '陈伟',
  coverRole: 'Laundry Owner',
  hiddenRole: 'Information Broker & Message Relay',
  location: 'red-gulch',
  description: 'A middle-aged man with weathered hands from years of washing clothes. Keeps his head down and speaks broken English to customers. But his eyes miss nothing - every uniform, every stain, every pocket tells a story.',
  personality: 'Cautious and observant. Appears simple to outsiders but possesses a sharp mind. Protective of his community. Slow to trust but fiercely loyal once earned.',
  backstory: 'Came to America in 1879 to work on the railroad. When the transcontinental line was finished, he settled in Red Gulch. His laundry serves everyone - miners, lawmen, even outlaws. Each piece of clothing that passes through his hands carries information. He became the unofficial message center for the Chinese community.',
  networkRole: 'contact',

  trustLevels: [
    {
      level: 0,
      name: 'Outsider',
      description: 'Just another laundry customer',
      requirements: {},
      unlocks: {
        services: ['basic-laundry'],
      },
    },
    {
      level: 1,
      name: 'Acquaintance',
      description: 'A regular customer who pays fairly',
      requirements: {
        goldSpent: 50,
        timeKnown: 3,
      },
      unlocks: {
        services: ['message-delivery'],
        dialogue: ['network-hints'],
      },
    },
    {
      level: 2,
      name: 'Friend',
      description: 'Someone who treats him with respect',
      requirements: {
        quests: ['help-chen-debt'],
        goldSpent: 150,
      },
      unlocks: {
        services: ['information-basic', 'safe-house-basic'],
        npcs: ['mei-lin', 'old-zhang'],
        quests: ['secret-messages'],
      },
    },
    {
      level: 3,
      name: 'Brother/Sister',
      description: 'Earned deep trust through actions',
      requirements: {
        quests: ['secret-messages', 'protect-community'],
      },
      unlocks: {
        services: ['information-premium', 'safe-house-full'],
        npcs: ['master-fang'],
        dialogue: ['network-secrets'],
      },
    },
    {
      level: 4,
      name: 'Family',
      description: 'Part of the inner circle',
      requirements: {
        quests: ['the-long-road-home'],
      },
      unlocks: {
        services: ['network-coordination'],
        dialogue: ['personal-stories'],
      },
    },
  ],

  defaultTrust: 0,

  services: [
    {
      id: 'basic-laundry',
      name: 'Laundry Service',
      description: 'Clean and press your clothes. Takes 2 hours.',
      category: 'laundry',
      minTrustLevel: 0,
      cost: { gold: 5 },
      cooldown: 120,
    },
    {
      id: 'message-delivery',
      name: 'Message Delivery',
      description: 'Deliver a message to another location discreetly.',
      category: 'information',
      minTrustLevel: 1,
      cost: { gold: 15 },
      cooldown: 60,
    },
    {
      id: 'information-basic',
      name: 'Local Gossip',
      chineseName: '消息',
      description: 'Chen hears everything from the clothes people wear. Faction movements, wanted levels, local events.',
      category: 'information',
      minTrustLevel: 2,
      cost: { gold: 25 },
      cooldown: 180,
    },
    {
      id: 'safe-house-basic',
      name: 'Back Room Rest',
      description: 'Hide in the back room for a few hours. Reduces wanted level.',
      category: 'safe_house',
      minTrustLevel: 2,
      cost: { gold: 50 },
      cooldown: 360,
    },
    {
      id: 'information-premium',
      name: 'Network Intelligence',
      chineseName: '情报',
      description: 'Access to the Chinese network\'s collective knowledge. Sheriff patrol routes, gang movements, secret locations.',
      category: 'information',
      minTrustLevel: 3,
      cost: { gold: 100 },
      cooldown: 240,
    },
    {
      id: 'safe-house-full',
      name: 'Underground Shelter',
      description: 'Access to underground tunnels beneath the laundry. Complete safety for 24 hours.',
      category: 'safe_house',
      minTrustLevel: 3,
      cost: { gold: 150 },
      cooldown: 1440,
    },
  ],

  quests: [
    {
      id: 'help-chen-debt',
      name: 'The Debt Collector',
      description: 'A gang member is extorting Chen for "protection money." Help him deal with it.',
      backstory: 'Chen refuses to pay bribes, but the gang is getting aggressive. He needs someone to stand up to them without violence if possible.',
      minTrustLevel: 1,
      objectives: [
        { type: 'speak', target: 'gang-enforcer', location: 'red-gulch' },
        { type: 'deliver', target: 'evidence-of-law', quantity: 1 },
      ],
      rewards: {
        gold: 75,
        xp: 200,
        trustIncrease: 1,
      },
    },
    {
      id: 'secret-messages',
      name: 'Secret Messages',
      description: 'Deliver coded messages between Chinese community members across three towns.',
      backstory: 'The network needs to communicate about a family trying to escape persecution. Time is critical.',
      minTrustLevel: 2,
      objectives: [
        { type: 'deliver', target: 'coded-letter-1', location: 'whiskey-bend' },
        { type: 'deliver', target: 'coded-letter-2', location: 'fort-ashford' },
        { type: 'retrieve', target: 'safe-passage-papers', location: 'dusty-trail' },
      ],
      rewards: {
        gold: 150,
        xp: 400,
        trustIncrease: 1,
        networkAccess: ['wong-shu', 'railroad-chen'],
      },
      timeLimit: 12,
    },
  ],

  dialogue: {
    greeting: {
      outsider: [
        'You bring laundry? Two dollar, ready tomorrow.',
        '*nods silently and gestures to the counter*',
        'Clothes clean, cheap price. You want?',
      ],
      acquaintance: [
        'Ah, you back. Good customer.',
        'You need wash? Or... something else?',
        'You treat Chen fair. Chen remember.',
      ],
      friend: [
        'My friend. Come in, come in.',
        'You need help? Maybe Chen can help. Maybe... friends can help.',
        'You help Chen before. Chen not forget. What you need?',
      ],
      brotherSister: [
        'Brother/Sister! Come, sit. Tea?',
        'You are family now. We take care of family.',
        'The network speaks well of you. How can we serve?',
      ],
      family: [
        '*Speaks in fluent English* Welcome back. It is good to see you.',
        'You have earned the trust of our people. That is no small thing.',
        '*Smiles warmly* Come, let us talk as equals.',
      ],
    },
    coverStory: [
      'Chen just do laundry. Work hard, no trouble.',
      'Know nothing about messages or secrets. Just wash clothes.',
      'Many customer here. Chen see no face, only clothes.',
    ],
    suspicion: [
      '*Eyes narrow* You ask many questions. Why?',
      'Chen busy. You need laundry or no?',
      'Some things not for strangers to know.',
    ],
    trust: [
      'The network stretches far. From the mines to the border.',
      'We survive because we help each other. Because we are invisible.',
      'In the old country, we say: A tree with strong roots laughs at storms.',
    ],
    farewell: [
      'You come back soon.',
      'Chen always here. Always listening.',
      'May the wind be at your back.',
    ],
    questHints: [
      '*Quietly* Some men cause trouble. Think Chinese easy target.',
      'Letters need to travel. Railroad too dangerous. Need someone trustworthy.',
    ],
    networkReferences: [
      'Mei Lin at restaurant make good medicine. Better than white doctor.',
      'Old Zhang know these hills better than anyone. Worked on railroad.',
    ],
  },

  discoveryMethod: 'visible',

  networkConnections: {
    trusts: ['mei-lin', 'old-zhang', 'master-fang'],
    distrusts: ['lucky-lou'],
    canRefer: ['mei-lin', 'old-zhang'],
    family: [],
  },

  schedule: [
    { hour: 6, available: true, activity: 'Opening shop, heating water' },
    { hour: 8, available: true, activity: 'Washing clothes in back' },
    { hour: 12, available: true, activity: 'Front counter service' },
    { hour: 18, available: true, activity: 'Delivering cleaned laundry' },
    { hour: 22, available: false, activity: 'Closed - reading messages' },
  ],

  culturalNotes: [
    'Laundries were common Chinese businesses due to low startup costs',
    'Many Chinese immigrants used broken English as protective camouflage',
    'Community networks were essential for survival and mutual aid',
  ],
};

export const MEI_LIN: ChineseNPC = {
  id: 'mei-lin',
  name: 'Mei Lin',
  chineseName: 'Měi Lín',
  chineseCharacters: '美琳',
  coverRole: 'Restaurant Cook',
  hiddenRole: 'Herbalist & Poison Expert',
  location: 'red-gulch',
  description: 'A sharp-eyed woman in her thirties who runs a small Chinese restaurant. Her hands are stained from herbs and spices. Customers come for her dumplings, but the wise come for her medicines.',
  personality: 'Direct and practical. No patience for fools. Deeply knowledgeable about traditional medicine. Protective of women and children in the community.',
  backstory: 'Mei Lin was studying traditional medicine in Guangdong before her family was forced to emigrate in 1881. She continues her studies in secret, growing herbs behind her restaurant and treating the Chinese community. White doctors refuse to treat Chinese patients, so she became essential.',
  networkRole: 'specialist',

  trustLevels: [
    {
      level: 0,
      name: 'Outsider',
      description: 'Restaurant customer only',
      requirements: {},
      unlocks: {
        services: ['restaurant-meal'],
      },
    },
    {
      level: 1,
      name: 'Acquaintance',
      description: 'Referred by Chen Wei',
      requirements: {
        referrals: ['chen-wei'],
      },
      unlocks: {
        services: ['basic-medicine'],
        dialogue: ['herb-knowledge'],
      },
    },
    {
      level: 2,
      name: 'Friend',
      description: 'Proven trustworthy',
      requirements: {
        quests: ['gather-rare-herbs'],
      },
      unlocks: {
        services: ['advanced-medicine', 'antidote'],
        quests: ['poisoners-art'],
      },
    },
    {
      level: 3,
      name: 'Brother/Sister',
      description: 'Student of the healing arts',
      requirements: {
        quests: ['poisoners-art'],
      },
      unlocks: {
        services: ['poison-crafting', 'curse-treatment'],
        npcs: ['dr-huang'],
      },
    },
    {
      level: 4,
      name: 'Family',
      description: 'Keeper of ancient knowledge',
      requirements: {
        quests: ['the-hidden-garden'],
      },
      unlocks: {
        services: ['miracle-cure'],
      },
    },
  ],

  defaultTrust: 0,

  services: [
    {
      id: 'restaurant-meal',
      name: 'Hearty Meal',
      chineseName: '饱餐',
      description: 'A delicious meal of dumplings and noodles.',
      category: 'medicine',
      minTrustLevel: 0,
      cost: { gold: 8 },
      effects: {
        health: 30,
        energy: 10,
      },
    },
    {
      id: 'basic-medicine',
      name: 'Herbal Poultice',
      chineseName: '草药',
      description: 'Traditional herbal medicine for wounds and illness.',
      category: 'medicine',
      minTrustLevel: 1,
      cost: { gold: 25 },
      effects: {
        health: 50,
      },
    },
    {
      id: 'advanced-medicine',
      name: 'Master Healer\'s Blend',
      chineseName: '灵药',
      description: 'A powerful medicinal tea that heals and energizes. More effective than Western medicine.',
      category: 'healing',
      minTrustLevel: 2,
      cost: { gold: 75 },
      effects: {
        health: 100,
        energy: 25,
        buffDuration: 120,
        buffEffect: 'regeneration',
      },
    },
    {
      id: 'antidote',
      name: 'Universal Antidote',
      chineseName: '解毒剂',
      description: 'Cures all poisons and toxins.',
      category: 'healing',
      minTrustLevel: 2,
      cost: { gold: 100 },
      effects: {
        removePoison: true,
      },
    },
    {
      id: 'poison-crafting',
      name: 'Poison Lessons',
      chineseName: '毒术',
      description: 'Learn to craft poisons for weapons. Use with great caution.',
      category: 'medicine',
      minTrustLevel: 3,
      cost: { gold: 200 },
      items: [
        { itemId: 'paralytic-poison', quantity: 3, chance: 1.0 },
        { itemId: 'deadly-nightshade', quantity: 2, chance: 0.7 },
      ],
    },
    {
      id: 'curse-treatment',
      name: 'Curse Removal',
      chineseName: '驱邪',
      description: 'Ancient ritual to remove supernatural curses and hexes.',
      category: 'healing',
      minTrustLevel: 3,
      cost: { gold: 250 },
      effects: {
        removeCurse: true,
        health: 50,
      },
    },
    {
      id: 'miracle-cure',
      name: 'Phoenix Elixir',
      chineseName: '凤凰灵药',
      description: 'A legendary cure passed down through generations. Heals all wounds and ailments.',
      category: 'healing',
      minTrustLevel: 4,
      cost: {
        gold: 500,
        items: [
          { itemId: 'rare-ginseng', quantity: 1 },
          { itemId: 'dragon-beard', quantity: 1 },
        ],
      },
      effects: {
        health: 999,
        energy: 100,
        removePoison: true,
        removeCurse: true,
        buffDuration: 1440,
        buffEffect: 'immortality',
      },
      cooldown: 10080, // One week
    },
  ],

  quests: [
    {
      id: 'gather-rare-herbs',
      name: 'Gathering Rare Herbs',
      description: 'Mei Lin needs specific herbs that only grow in dangerous areas.',
      backstory: 'A child in the community is sick with fever. Western doctors refuse to help. Mei Lin needs rare herbs to cure her.',
      minTrustLevel: 1,
      objectives: [
        { type: 'find', target: 'golden-root', quantity: 3, location: 'sangre-mountains' },
        { type: 'find', target: 'ghost-orchid', quantity: 1, location: 'devils-canyon' },
      ],
      rewards: {
        gold: 100,
        xp: 250,
        trustIncrease: 1,
        items: ['herbal-medicine-kit'],
      },
    },
    {
      id: 'poisoners-art',
      name: 'The Poisoner\'s Art',
      description: 'Mei Lin will teach you the dangerous art of poison-making, but first you must prove your judgment.',
      backstory: 'Poison knowledge is powerful and dangerous. Mei Lin will only teach those who understand when NOT to use it.',
      minTrustLevel: 2,
      objectives: [
        { type: 'speak', target: 'master-fang' },
        { type: 'deliver', target: 'oath-scroll', quantity: 1 },
        { type: 'protect', target: 'mei-lin', location: 'red-gulch' },
      ],
      rewards: {
        gold: 200,
        xp: 500,
        trustIncrease: 1,
        items: ['poison-crafting-guide'],
      },
    },
    {
      id: 'the-hidden-garden',
      name: 'The Hidden Garden',
      description: 'Mei Lin will reveal the secret location of her medicinal garden - and its guardian.',
      backstory: 'Deep in the mountains, Mei Lin cultivates legendary healing plants. The garden is protected by ancient magic.',
      minTrustLevel: 3,
      objectives: [
        { type: 'find', target: 'hidden-garden', location: 'sangre-mountains' },
        { type: 'protect', target: 'garden-spirit' },
        { type: 'retrieve', target: 'phoenix-herb', quantity: 1 },
      ],
      rewards: {
        gold: 500,
        xp: 1000,
        trustIncrease: 1,
        items: ['phoenix-seed', 'garden-key'],
        networkAccess: ['garden-spirit'],
      },
      timeLimit: 24,
    },
  ],

  dialogue: {
    greeting: {
      outsider: [
        'You eat? Dumplings fresh.',
        '*Stirs pot without looking up*',
        'Sit. I bring food.',
      ],
      acquaintance: [
        'Chen sent you? Good. What you need?',
        'You help our people. Mei Lin help you.',
        'Sit. We talk. You want tea?',
      ],
      friend: [
        'You understand the old ways. Good.',
        'I teach you herbs. But you must respect the knowledge.',
        'You are not like other outsiders. You see us as people.',
      ],
      brotherSister: [
        'The healing arts are sacred. You honor them.',
        'Come, we work together. Much to learn.',
        'You have the gift. The plants speak to you.',
      ],
      family: [
        'You are a true healer now. Use this power wisely.',
        'In the old country, you would be called Shifu - Master.',
        'The ancestors smile on you. This is rare for an outsider.',
      ],
    },
    coverStory: [
      'Just cook. Make food for miners.',
      'Dumplings, noodles, rice. Simple food.',
      'White people no like real Chinese food. I make simple.',
    ],
    suspicion: [
      'You ask too many questions. Buy food or leave.',
      '*Grips her cleaver tighter*',
      'I help my people. You not my people.',
    ],
    trust: [
      'Western doctors know nothing of herbs. They use knives and poison.',
      'Every plant has spirit. You must ask permission before taking.',
      'In old China, my grandmother taught me. Now I teach others.',
    ],
    farewell: [
      'Go in health.',
      'May the spirits protect you.',
      'Come back if you need healing.',
    ],
    questHints: [
      'Child is sick. Need rare herbs from mountains. Too dangerous for Mei Lin.',
      'Poison knowledge is great responsibility. Cannot give to just anyone.',
    ],
    networkReferences: [
      'Master Fang in Whiskey Bend knows many things. Elder of our people.',
      'Dr. Huang truly trained as physician. But white people not let him practice.',
    ],
  },

  discoveryMethod: 'trust',
  discoveryCondition: {
    npcReferral: 'chen-wei',
  },

  networkConnections: {
    trusts: ['chen-wei', 'master-fang', 'dr-huang'],
    distrusts: [],
    canRefer: ['master-fang'],
    family: [],
  },

  schedule: [
    { hour: 5, available: false, activity: 'Gathering herbs at dawn' },
    { hour: 10, available: true, activity: 'Cooking in restaurant' },
    { hour: 14, available: true, activity: 'Preparing medicines in back room' },
    { hour: 19, available: true, activity: 'Evening meal service' },
    { hour: 23, available: false, activity: 'Studying herb texts' },
  ],

  culturalNotes: [
    'Traditional Chinese medicine has 2000+ years of history',
    'Many Chinese immigrants were denied access to Western healthcare',
    'Herbalists filled critical healthcare gaps in Chinese communities',
  ],
};

export const OLD_ZHANG: ChineseNPC = {
  id: 'old-zhang',
  name: 'Old Zhang',
  chineseName: 'Lǎo Zhāng',
  chineseCharacters: '老张',
  coverRole: 'General Worker & Odd Jobs',
  hiddenRole: 'Former Railroad Foreman - Tunnel & Mining Expert',
  location: 'red-gulch',
  description: 'A wiry old man in his sixties with hands like iron and eyes that sparkle with mischief. He seems to do every odd job in town - fixing roofs, moving crates, sweeping floors. But veterans of the railroad know him as the man who could tunnel through solid rock.',
  personality: 'Jovial and storytelling. Loves to share tales of the old days. Sharp as a tack despite his age. Protective of younger workers.',
  backstory: 'Zhang arrived in 1865 to build the transcontinental railroad. He rose to become a foreman despite discrimination, leading crews through the most dangerous tunneling work in the Sierra Nevada. When the railroad was finished, he stayed. He knows every tunnel, cave, and secret passage in the territory because he helped build or discover most of them.',
  networkRole: 'specialist',

  trustLevels: [
    {
      level: 0,
      name: 'Outsider',
      description: 'Odd job man',
      requirements: {},
      unlocks: {
        services: ['simple-repairs'],
      },
    },
    {
      level: 1,
      name: 'Acquaintance',
      description: 'Good listener to his stories',
      requirements: {
        referrals: ['chen-wei'],
        timeKnown: 2,
      },
      unlocks: {
        services: ['mining-tips'],
        dialogue: ['railroad-stories'],
      },
    },
    {
      level: 2,
      name: 'Friend',
      description: 'Respects his knowledge',
      requirements: {
        quests: ['the-lost-tools'],
      },
      unlocks: {
        services: ['tunnel-knowledge', 'secret-routes'],
        quests: ['the-hidden-cache'],
      },
    },
    {
      level: 3,
      name: 'Brother/Sister',
      description: 'Earned veteran\'s respect',
      requirements: {
        quests: ['the-hidden-cache', 'railroad-memorial'],
      },
      unlocks: {
        services: ['master-tunneling'],
        npcs: ['silent-wu', 'li-jian'],
        items: ['zhangs-railroad-map'],
      },
    },
    {
      level: 4,
      name: 'Family',
      description: 'Keeper of railroad secrets',
      requirements: {
        quests: ['the-final-spike'],
      },
      unlocks: {
        services: ['legend-knowledge'],
      },
    },
  ],

  defaultTrust: 0,

  services: [
    {
      id: 'simple-repairs',
      name: 'Odd Jobs',
      description: 'Old Zhang can fix just about anything.',
      category: 'goods',
      minTrustLevel: 0,
      cost: { gold: 10 },
    },
    {
      id: 'mining-tips',
      name: 'Mining Advice',
      chineseName: '采矿知识',
      description: 'Learn where to find better ore and gems.',
      category: 'information',
      minTrustLevel: 1,
      cost: { gold: 30 },
    },
    {
      id: 'tunnel-knowledge',
      name: 'Tunnel Navigation',
      chineseName: '隧道知识',
      description: 'Zhang shows you how to navigate underground safely.',
      category: 'tunnels',
      minTrustLevel: 2,
      cost: { gold: 75 },
    },
    {
      id: 'secret-routes',
      name: 'Secret Passages',
      chineseName: '密道',
      description: 'Zhang reveals hidden tunnels that connect locations.',
      category: 'tunnels',
      minTrustLevel: 2,
      cost: { gold: 150 },
    },
    {
      id: 'master-tunneling',
      name: 'Master Tunneler\'s Wisdom',
      chineseName: '隧道大师',
      description: 'Complete knowledge of all tunnels, mines, and underground passages in the territory.',
      category: 'tunnels',
      minTrustLevel: 3,
      cost: { gold: 300 },
      items: [
        { itemId: 'complete-tunnel-map', quantity: 1, chance: 1.0 },
      ],
    },
    {
      id: 'legend-knowledge',
      name: 'The Golden Spike\'s Secret',
      chineseName: '金钉子的秘密',
      description: 'Zhang reveals the location of the ceremonial golden spike - and what lies beneath it.',
      category: 'information',
      minTrustLevel: 4,
      cost: { gold: 1000 },
    },
  ],

  quests: [
    {
      id: 'the-lost-tools',
      name: 'The Lost Tools',
      description: 'Zhang left his prized tools in an old mine. Help him retrieve them.',
      backstory: 'When the railroad ended, Zhang had to abandon his tools in a collapsed mine. They were gifts from his father. He\'s too old to go back alone.',
      minTrustLevel: 1,
      objectives: [
        { type: 'find', target: 'collapsed-mine', location: 'devils-canyon' },
        { type: 'retrieve', target: 'zhangs-tools', quantity: 1 },
      ],
      rewards: {
        gold: 75,
        xp: 200,
        trustIncrease: 1,
        items: ['quality-pickaxe'],
      },
    },
    {
      id: 'the-hidden-cache',
      name: 'The Hidden Cache',
      description: 'Railroad workers hid gold in the tunnels. Zhang knows where.',
      backstory: 'Chinese workers weren\'t paid fairly. They stole gold and hid it for emergencies. Zhang wants to recover it for the community.',
      minTrustLevel: 2,
      objectives: [
        { type: 'find', target: 'hidden-tunnel-entrance', location: 'goldfinger-mine' },
        { type: 'retrieve', target: 'railroad-gold', quantity: 5 },
        { type: 'deliver', target: 'railroad-gold', location: 'red-gulch' },
      ],
      rewards: {
        gold: 300,
        xp: 500,
        trustIncrease: 1,
        items: ['railroad-medallion'],
      },
    },
    {
      id: 'railroad-memorial',
      name: 'Railroad Memorial',
      description: 'Visit the graves of Chinese workers who died building the railroad.',
      backstory: 'Hundreds of Chinese workers died building the transcontinental railroad. Their graves are unmarked, forgotten. Zhang wants to honor them.',
      minTrustLevel: 2,
      objectives: [
        { type: 'find', target: 'railroad-graveyard', location: 'sangre-mountains' },
        { type: 'deliver', target: 'memorial-offerings', quantity: 10 },
        { type: 'protect', target: 'memorial-site' },
      ],
      rewards: {
        gold: 0,
        xp: 750,
        trustIncrease: 2,
        items: ['ancestor-blessing'],
      },
    },
    {
      id: 'the-final-spike',
      name: 'The Final Spike',
      description: 'Uncover the truth about the Golden Spike ceremony and the Chinese workers written out of history.',
      backstory: 'The famous Golden Spike photograph shows railroad executives. No Chinese workers. But Zhang was there. He knows what really happened.',
      minTrustLevel: 3,
      objectives: [
        { type: 'find', target: 'promontory-point-memorial' },
        { type: 'retrieve', target: 'hidden-photograph', quantity: 1 },
        { type: 'speak', target: 'railroad-historian' },
      ],
      rewards: {
        gold: 500,
        xp: 1500,
        trustIncrease: 1,
        items: ['golden-spike-replica', 'forgotten-history-journal'],
      },
    },
  ],

  dialogue: {
    greeting: {
      outsider: [
        'You need help? Zhang fix anything!',
        '*Wipes hands on dirty cloth* What you need?',
        'Zhang do good work, cheap price.',
      ],
      acquaintance: [
        'Ah! You back! Sit, sit. Zhang tell you story.',
        'You good listener. Most people think old Zhang just... old.',
        'You want hear about railroad? Many stories.',
      ],
      friend: [
        'You understand. Those were hard times, but also... proud times.',
        'Zhang trust you. Come, I show you something.',
        'Railroad days over, but Zhang remember everything. Every tunnel.',
      ],
      brotherSister: [
        'You honor old man and his friends. This means much.',
        'Come, young friend. Zhang teach you what he learned in fifty years.',
        'You remind Zhang of young workers. Strong spirit.',
      ],
      family: [
        'You are keeper of railroad memory now.',
        'Zhang\'s time grows short. Good to know someone remembers.',
        '*Eyes glisten* My friends... they not die for nothing. You prove this.',
      ],
    },
    coverStory: [
      'Zhang just old man. Do simple work.',
      'Been here long time. See everything, know nothing.',
      'Railroad? Long time ago. Zhang forget.',
    ],
    suspicion: [
      '*Becomes suddenly hard of hearing* Eh? Speak up!',
      'Zhang busy. Many jobs today.',
      'You ask strange questions. Why you want know?',
    ],
    trust: [
      'We built railroad through mountains. White men said impossible. We do anyway.',
      'Ten thousand Chinese work on railroad. Maybe... one thousand die. Nobody write their names.',
      'Zhang remember every man. Every face. Every cave-in. Every blast.',
      'They take our photograph? No. They take our wages? Yes. But they cannot take our pride.',
    ],
    farewell: [
      'You come back. Zhang always here.',
      'Go safe. Watch for cave-ins!',
      '*Chuckles* Old joke. Railroad joke.',
    ],
    questHints: [
      'Zhang\'s father give him tools. Lost in old mine near Devil\'s Canyon.',
      'Railroad workers hide gold. Smart workers. Zhang was smart worker.',
    ],
    networkReferences: [
      'Silent Wu still work with powder. Best explosives man on railroad.',
      'Li Jian young, but he learn quick. Good miner.',
    ],
  },

  discoveryMethod: 'trust',
  discoveryCondition: {
    npcReferral: 'chen-wei',
  },

  networkConnections: {
    trusts: ['chen-wei', 'silent-wu', 'li-jian', 'railroad-chen'],
    distrusts: [],
    canRefer: ['silent-wu', 'li-jian'],
    family: [],
  },

  schedule: [
    { hour: 6, available: true, activity: 'Morning exercises, tai chi' },
    { hour: 9, available: true, activity: 'Doing odd jobs around town' },
    { hour: 12, available: true, activity: 'Lunch at Mei Lin\'s restaurant' },
    { hour: 15, available: true, activity: 'Sitting outside, telling stories' },
    { hour: 20, available: false, activity: 'Resting, reading old letters' },
  ],

  culturalNotes: [
    'Chinese workers built the most dangerous sections of the transcontinental railroad',
    'Approximately 1,200 Chinese workers died during construction',
    'No Chinese workers appear in the famous Golden Spike ceremony photograph',
    'Chinese labor was systematically erased from railroad history',
  ],
};

// ============================================================================
// GOLDFINGER\'S MINE NPCs (3)
// ============================================================================

export const LI_JIAN: ChineseNPC = {
  id: 'li-jian',
  name: 'Li Jian',
  chineseName: 'Lǐ Jiàn',
  chineseCharacters: '李坚',
  coverRole: 'Mine Worker',
  hiddenRole: 'Tunnel Expert & Escape Route Specialist',
  location: 'goldfinger-mine',
  description: 'A young man in his twenties with muscular arms and a quiet intensity. He works the deepest shafts where others fear to go. Those who watch closely notice he finds ore where others see only rock.',
  personality: 'Quiet and methodical. Speaks little but notices everything. Loyal to his crew. Driven by ambition to prove himself.',
  backstory: 'Li Jian arrived in 1883, hoping to make fortune in the mines. Instead he found brutal conditions and prejudice. Old Zhang took him under his wing, teaching him the secrets of mining and tunneling. Now Li Jian knows every vein, every fault line, every escape route in Goldfinger\'s Mine.',
  networkRole: 'specialist',

  trustLevels: [
    {
      level: 0,
      name: 'Outsider',
      description: 'Just another miner',
      requirements: {},
      unlocks: {},
    },
    {
      level: 1,
      name: 'Acquaintance',
      description: 'Proven yourself in the mines',
      requirements: {
        referrals: ['old-zhang'],
      },
      unlocks: {
        services: ['mining-lessons'],
        dialogue: ['mine-knowledge'],
      },
    },
    {
      level: 2,
      name: 'Friend',
      description: 'Trusted underground',
      requirements: {
        quests: ['cave-in-rescue'],
      },
      unlocks: {
        services: ['hidden-veins', 'escape-routes'],
        quests: ['the-dark-level'],
      },
    },
    {
      level: 3,
      name: 'Brother/Sister',
      description: 'Part of the mining crew',
      requirements: {
        quests: ['the-dark-level'],
      },
      unlocks: {
        services: ['gold-cache-locations'],
        items: ['lis-mining-map'],
      },
    },
    {
      level: 4,
      name: 'Family',
      description: 'Master of the deep',
      requirements: {
        quests: ['the-deep-treasure'],
      },
      unlocks: {
        services: ['legendary-vein'],
      },
    },
  ],

  defaultTrust: 0,

  services: [
    {
      id: 'mining-lessons',
      name: 'Mining Techniques',
      chineseName: '采矿技巧',
      description: 'Li Jian teaches you where to strike and what to look for.',
      category: 'information',
      minTrustLevel: 1,
      cost: { gold: 50 },
    },
    {
      id: 'hidden-veins',
      name: 'Hidden Gold Veins',
      chineseName: '隐藏金脉',
      description: 'Li Jian shows you gold veins the company doesn\'t know about.',
      category: 'information',
      minTrustLevel: 2,
      cost: { gold: 100 },
    },
    {
      id: 'escape-routes',
      name: 'Mine Escape Routes',
      chineseName: '逃生路线',
      description: 'Critical knowledge of how to escape a cave-in or gas leak.',
      category: 'tunnels',
      minTrustLevel: 2,
      cost: { gold: 150 },
    },
    {
      id: 'gold-cache-locations',
      name: 'Gold Cache Locations',
      chineseName: '金矿位置',
      description: 'Li Jian reveals where miners hide gold to smuggle out.',
      category: 'information',
      minTrustLevel: 3,
      cost: { gold: 250 },
    },
    {
      id: 'legendary-vein',
      name: 'The Mother Lode',
      chineseName: '母矿脉',
      description: 'The legendary vein that spawned all others. So deep, so dangerous, none dare mine it.',
      category: 'information',
      minTrustLevel: 4,
      cost: { gold: 1000 },
    },
  ],

  quests: [
    {
      id: 'cave-in-rescue',
      name: 'Cave-In Rescue',
      description: 'Miners are trapped in a collapsed tunnel. Li Jian needs help digging them out.',
      backstory: 'The company won\'t send rescue crews for Chinese workers. The network must save its own.',
      minTrustLevel: 1,
      objectives: [
        { type: 'find', target: 'collapse-site', location: 'goldfinger-mine' },
        { type: 'retrieve', target: 'mining-equipment', quantity: 3 },
        { type: 'protect', target: 'rescue-operation' },
      ],
      rewards: {
        gold: 150,
        xp: 400,
        trustIncrease: 1,
      },
      timeLimit: 6,
      failureConsequences: {
        trustDecrease: 2,
      },
    },
    {
      id: 'the-dark-level',
      name: 'The Dark Level',
      description: 'Explore the deepest, most dangerous part of the mine. Something valuable is down there.',
      backstory: 'The company closed the deepest level after "accidents." But Li Jian knows the real reason: they found something.',
      minTrustLevel: 2,
      objectives: [
        { type: 'find', target: 'sealed-tunnel', location: 'goldfinger-mine' },
        { type: 'retrieve', target: 'mysterious-ore', quantity: 5 },
        { type: 'protect', target: 'li-jian' },
      ],
      rewards: {
        gold: 300,
        xp: 750,
        trustIncrease: 1,
        items: ['dark-ore', 'sealed-tunnel-key'],
      },
    },
    {
      id: 'the-deep-treasure',
      name: 'The Deep Treasure',
      description: 'Follow Li Jian to the legendary mother lode. The descent will be perilous.',
      backstory: 'Every miner dreams of finding the mother lode. Li Jian believes he\'s found it - three thousand feet down.',
      minTrustLevel: 3,
      objectives: [
        { type: 'find', target: 'abyssal-shaft', location: 'goldfinger-mine' },
        { type: 'retrieve', target: 'pure-gold-sample', quantity: 1 },
      ],
      rewards: {
        gold: 1000,
        xp: 2000,
        trustIncrease: 1,
        items: ['mother-lode-map', 'pure-gold-nugget'],
      },
    },
  ],

  dialogue: {
    greeting: {
      outsider: [
        '*Nods silently*',
        '*Continues working without looking up*',
        '...',
      ],
      acquaintance: [
        'Old Zhang says you can be trusted.',
        'Mining is dangerous. You must be careful.',
        'The mountain does not forgive mistakes.',
      ],
      friend: [
        'You work hard. You respect the mountain. Good.',
        'Come. I show you something.',
        'The company does not care if we die. We must care for each other.',
      ],
      brotherSister: [
        'You have proven yourself underground. That means everything.',
        'We are miners. The deep does not lie.',
        'I trust you with my life. And my secrets.',
      ],
      family: [
        'You understand the mountain as I do.',
        'Few outsiders see what you have seen. And live.',
        'The gold is there. Waiting. Watching. Testing.',
      ],
    },
    coverStory: [
      'I work. Nothing more.',
      '*Ignores you*',
      'Go away.',
    ],
    suspicion: [
      'Why do you ask these questions?',
      'The mine is dangerous for those who do not belong.',
      '*Grips pickaxe tighter*',
    ],
    trust: [
      'The company keeps the good veins for white miners. Give us the scraps.',
      'But I find gold where they see nothing. Old Zhang taught me.',
      'Every tunnel has two paths: the company\'s path, and the true path.',
    ],
    farewell: [
      '*Nods*',
      'Be safe. Underground and above.',
      'Go. I have work.',
    ],
    questHints: [
      'Cave-in in shaft seven. Company will not help. We must.',
      'They closed the deep level. Said it was dangerous. But I think... something else.',
    ],
    networkReferences: [
      'Chen Tao has medicine. Many injuries down here.',
      'Silent Wu knows explosives. But careful - he is... particular.',
    ],
  },

  discoveryMethod: 'trust',
  discoveryCondition: {
    npcReferral: 'old-zhang',
  },

  networkConnections: {
    trusts: ['old-zhang', 'chen-tao', 'silent-wu'],
    distrusts: [],
    canRefer: ['chen-tao', 'silent-wu'],
    family: [],
  },

  schedule: [
    { hour: 6, available: false, activity: 'Deep in the mine' },
    { hour: 12, available: true, activity: 'Surface break' },
    { hour: 13, available: false, activity: 'Back underground' },
    { hour: 19, available: true, activity: 'Evening surface time' },
    { hour: 22, available: false, activity: 'Resting in bunkhouse' },
  ],

  culturalNotes: [
    'Chinese miners often worked the most dangerous shafts',
    'They developed superior techniques for dangerous mining',
    'Companies often paid Chinese workers less for the same work',
  ],
};

export const CHEN_TAO: ChineseNPC = {
  id: 'chen-tao',
  name: 'Chen Tao',
  chineseName: 'Chén Tāo',
  chineseCharacters: '陈涛',
  coverRole: 'Camp Cook',
  hiddenRole: 'Herb Gatherer & Healer',
  location: 'goldfinger-mine',
  description: 'A middle-aged man with gentle eyes and dirt under his fingernails - not from mining, but from digging up roots and plants. He feeds the workers simple meals, but those who know seek him out for his healing touch.',
  personality: 'Kind and patient. Speaks softly. Deep knowledge of mountain plants. Worries constantly about workers\' health.',
  backstory: 'Chen Tao worked as a cook\'s assistant in San Francisco before coming to the mines in 1880. He discovered the mountains held medicinal plants unknown in China. He studies them obsessively, combining old knowledge with new discoveries. Many workers owe him their lives.',
  networkRole: 'specialist',

  trustLevels: [
    {
      level: 0,
      name: 'Outsider',
      description: 'Camp cook',
      requirements: {},
      unlocks: {
        services: ['camp-meal'],
      },
    },
    {
      level: 1,
      name: 'Acquaintance',
      description: 'Recognized as someone who respects healers',
      requirements: {
        referrals: ['li-jian'],
      },
      unlocks: {
        services: ['basic-healing'],
        dialogue: ['herb-talk'],
      },
    },
    {
      level: 2,
      name: 'Friend',
      description: 'Helped him gather rare herbs',
      requirements: {
        quests: ['mountain-herbs'],
      },
      unlocks: {
        services: ['advanced-healing', 'poison-cure'],
        quests: ['curse-of-the-mountain'],
      },
    },
    {
      level: 3,
      name: 'Brother/Sister',
      description: 'Trusted with curse knowledge',
      requirements: {
        quests: ['curse-of-the-mountain'],
      },
      unlocks: {
        services: ['curse-removal', 'spiritual-cleansing'],
        npcs: ['mountain-spirit'],
      },
    },
    {
      level: 4,
      name: 'Family',
      description: 'Student of mountain mysteries',
      requirements: {
        quests: ['pact-with-the-mountain'],
      },
      unlocks: {
        services: ['mountain-blessing'],
      },
    },
  ],

  defaultTrust: 0,

  services: [
    {
      id: 'camp-meal',
      name: 'Camp Food',
      description: 'Simple but nourishing meal.',
      category: 'medicine',
      minTrustLevel: 0,
      cost: { gold: 5 },
      effects: {
        health: 20,
        energy: 10,
      },
    },
    {
      id: 'basic-healing',
      name: 'Herbal Treatment',
      chineseName: '草药治疗',
      description: 'Treats wounds and illness with mountain herbs.',
      category: 'healing',
      minTrustLevel: 1,
      cost: { gold: 30 },
      effects: {
        health: 60,
      },
    },
    {
      id: 'advanced-healing',
      name: 'Master Healer\'s Touch',
      chineseName: '灵疗',
      description: 'Powerful healing combining herbs and energy work.',
      category: 'healing',
      minTrustLevel: 2,
      cost: { gold: 100 },
      effects: {
        health: 150,
        energy: 30,
        buffDuration: 180,
        buffEffect: 'vitality',
      },
    },
    {
      id: 'poison-cure',
      name: 'Poison Antidote',
      chineseName: '解毒',
      description: 'Cures all common poisons.',
      category: 'healing',
      minTrustLevel: 2,
      cost: { gold: 80 },
      effects: {
        removePoison: true,
        health: 50,
      },
    },
    {
      id: 'curse-removal',
      name: 'Curse Cleansing',
      chineseName: '驱邪术',
      description: 'Removes supernatural curses and hexes.',
      category: 'healing',
      minTrustLevel: 3,
      cost: { gold: 200 },
      effects: {
        removeCurse: true,
        health: 75,
      },
    },
    {
      id: 'spiritual-cleansing',
      name: 'Spiritual Cleansing',
      chineseName: '净化',
      description: 'Cleanses negative spiritual energy.',
      category: 'healing',
      minTrustLevel: 3,
      cost: { gold: 150 },
      effects: {
        removeCurse: true,
        buffDuration: 360,
        buffEffect: 'spiritual-protection',
      },
    },
    {
      id: 'mountain-blessing',
      name: 'Blessing of the Mountain',
      chineseName: '山灵祝福',
      description: 'A rare blessing from the mountain spirit. Provides protection and luck.',
      category: 'healing',
      minTrustLevel: 4,
      cost: {
        gold: 500,
        items: [{ itemId: 'sacred-offering', quantity: 3 }],
      },
      effects: {
        health: 200,
        energy: 100,
        buffDuration: 1440,
        buffEffect: 'mountain-protection',
      },
      cooldown: 10080,
    },
  ],

  quests: [
    {
      id: 'mountain-herbs',
      name: 'Gathering Mountain Herbs',
      description: 'Chen Tao needs rare herbs that grow high in the mountains.',
      backstory: 'A mining accident left three men poisoned by bad air. Chen Tao needs specific mountain herbs to save them.',
      minTrustLevel: 1,
      objectives: [
        { type: 'find', target: 'silver-leaf', quantity: 5, location: 'sangre-mountains' },
        { type: 'find', target: 'mountain-sage', quantity: 3, location: 'sangre-mountains' },
      ],
      rewards: {
        gold: 100,
        xp: 300,
        trustIncrease: 1,
        items: ['herb-gathering-guide'],
      },
      timeLimit: 8,
    },
    {
      id: 'curse-of-the-mountain',
      name: 'Curse of the Mountain',
      description: 'Miners disturbed something in the deep tunnels. Now they sicken and die. Chen Tao knows this is no ordinary disease.',
      backstory: 'The company pushed too deep, broke through to ancient tunnels. Something old and angry dwells there.',
      minTrustLevel: 2,
      objectives: [
        { type: 'find', target: 'cursed-chamber', location: 'goldfinger-mine' },
        { type: 'retrieve', target: 'cursed-artifact', quantity: 1 },
        { type: 'deliver', target: 'cursed-artifact', location: 'mountain-shrine' },
      ],
      rewards: {
        gold: 250,
        xp: 750,
        trustIncrease: 1,
        items: ['protective-amulet'],
      },
    },
    {
      id: 'pact-with-the-mountain',
      name: 'Pact with the Mountain',
      description: 'Chen Tao will introduce you to the mountain spirit. But you must prove worthy.',
      backstory: 'The mountain is alive. Chen Tao learned this years ago. The spirit can bless or curse. You must earn its favor.',
      minTrustLevel: 3,
      objectives: [
        { type: 'find', target: 'sacred-peak', location: 'sangre-mountains' },
        { type: 'deliver', target: 'offerings', quantity: 10 },
        { type: 'speak', target: 'mountain-spirit' },
      ],
      rewards: {
        gold: 500,
        xp: 1500,
        trustIncrease: 1,
        items: ['mountain-pact-token', 'spirit-sight-herb'],
        networkAccess: ['mountain-spirit'],
      },
    },
  ],

  dialogue: {
    greeting: {
      outsider: [
        'You eat? Food simple but good.',
        '*Stirs pot quietly*',
        'Sit. I bring you bowl.',
      ],
      acquaintance: [
        'You are kind to miners. This is good.',
        'Many hurt here. Chen Tao try to help.',
        'You need medicine? Chen Tao has herbs.',
      ],
      friend: [
        'The mountain gives medicine. Also gives poison. Must know difference.',
        'You help Chen Tao help others. Grateful.',
        'The plants... they speak, if you listen.',
      ],
      brotherSister: [
        'The mountain spirit watches. It sees your heart.',
        'You walk between worlds now. Careful.',
        'Few outsiders understand these things. You do.',
      ],
      family: [
        'The mountain has accepted you. Rare honor.',
        'You are protected now. But protection has price.',
        'We are guardians together.',
      ],
    },
    coverStory: [
      'Chen Tao just cook. Make food.',
      'Herbs? Just for flavor. Make food taste good.',
      'Know nothing about medicine. Just cooking.',
    ],
    suspicion: [
      'You ask strange questions. Why?',
      'Chen Tao busy. Many mouths to feed.',
      'Some things not for everyone to know.',
    ],
    trust: [
      'In old country, spirits everywhere. Here too. But different spirits.',
      'Mountain is old. Older than people. It remembers.',
      'Company dig too deep. Wake things that should sleep.',
    ],
    farewell: [
      'Go safe. Mountain watch you.',
      'Come back if you need healing.',
      'May spirits protect you.',
    ],
    questHints: [
      'Need herbs from high peaks. Too dangerous for Chen Tao alone.',
      'Bad things in deep tunnels. Not disease. Something else.',
    ],
    networkReferences: [
      'Li Jian good miner. But stubborn. Not believe in spirits.',
      'Silent Wu... he understand. He respect the mountain.',
    ],
  },

  discoveryMethod: 'trust',
  discoveryCondition: {
    npcReferral: 'li-jian',
  },

  networkConnections: {
    trusts: ['li-jian', 'silent-wu', 'mei-lin'],
    distrusts: [],
    canRefer: ['silent-wu'],
    family: [],
  },

  schedule: [
    { hour: 5, available: false, activity: 'Gathering herbs at dawn' },
    { hour: 7, available: true, activity: 'Preparing breakfast' },
    { hour: 12, available: true, activity: 'Serving lunch' },
    { hour: 15, available: true, activity: 'Treating injured workers' },
    { hour: 19, available: true, activity: 'Evening meal' },
    { hour: 22, available: false, activity: 'Preparing medicines' },
  ],

  culturalNotes: [
    'Chinese immigrants brought traditional medicine knowledge to America',
    'They discovered and catalogued many Western plants with medicinal properties',
    'Spiritual beliefs often blended Buddhism, Taoism, and local folk traditions',
  ],
};

export const SILENT_WU: ChineseNPC = {
  id: 'silent-wu',
  name: '"Silent" Wu',
  chineseName: 'Wú Jìng',
  chineseCharacters: '吴静',
  coverRole: 'Powder Man (Explosives Handler)',
  hiddenRole: 'Master Demolitions Expert',
  location: 'goldfinger-mine',
  description: 'A scarred man in his forties who rarely speaks. Half his face is burn-scarred from an explosion years ago. His hands are steady as stone when working with dynamite. Miners give him wide berth - fear and respect in equal measure.',
  personality: 'Silent and intense. Perfectionist with explosives. Has no tolerance for carelessness. Protective of his dangerous knowledge.',
  backstory: 'Wu Jing earned his name from his silence and his work. On the railroad, he was the powder man who blasted through solid granite. The explosion that scarred him killed three men - he was the only survivor. He never speaks about that day. Now he handles explosives for the mine, but his real expertise is... discretion.',
  networkRole: 'specialist',

  trustLevels: [
    {
      level: 0,
      name: 'Outsider',
      description: 'Stay away from the powder man',
      requirements: {},
      unlocks: {},
    },
    {
      level: 1,
      name: 'Acquaintance',
      description: 'Referred by a veteran',
      requirements: {
        referrals: ['old-zhang'],
      },
      unlocks: {
        services: ['dynamite-purchase'],
        dialogue: ['explosive-knowledge'],
      },
    },
    {
      level: 2,
      name: 'Friend',
      description: 'Proven competent with explosives',
      requirements: {
        quests: ['controlled-demolition'],
      },
      unlocks: {
        services: ['advanced-explosives', 'demolition-advice'],
        quests: ['the-silent-art'],
      },
    },
    {
      level: 3,
      name: 'Brother/Sister',
      description: 'Trusted with dangerous knowledge',
      requirements: {
        quests: ['the-silent-art'],
      },
      unlocks: {
        services: ['custom-explosives', 'sabotage-knowledge'],
        items: ['wus-explosive-manual'],
      },
    },
    {
      level: 4,
      name: 'Family',
      description: 'Master of controlled chaos',
      requirements: {
        quests: ['the-perfect-blast'],
      },
      unlocks: {
        services: ['impossible-demolitions'],
      },
    },
  ],

  defaultTrust: 0,

  services: [
    {
      id: 'dynamite-purchase',
      name: 'Dynamite',
      description: 'Basic explosives for mining.',
      category: 'explosives',
      minTrustLevel: 1,
      cost: { gold: 50 },
      items: [
        { itemId: 'dynamite-stick', quantity: 3, chance: 1.0 },
      ],
    },
    {
      id: 'advanced-explosives',
      name: 'Advanced Explosives',
      chineseName: '炸药',
      description: 'More powerful and controlled explosives.',
      category: 'explosives',
      minTrustLevel: 2,
      cost: { gold: 150 },
      items: [
        { itemId: 'nitroglycerin', quantity: 2, chance: 1.0 },
        { itemId: 'blasting-cap', quantity: 5, chance: 1.0 },
      ],
    },
    {
      id: 'demolition-advice',
      name: 'Demolition Consultation',
      chineseName: '拆除咨询',
      description: 'Wu advises on how to bring down structures or obstacles.',
      category: 'explosives',
      minTrustLevel: 2,
      cost: { gold: 100 },
    },
    {
      id: 'custom-explosives',
      name: 'Custom Explosive Device',
      chineseName: '定制炸药',
      description: 'Wu crafts a specialized explosive for your specific need.',
      category: 'explosives',
      minTrustLevel: 3,
      cost: { gold: 300 },
      items: [
        { itemId: 'custom-charge', quantity: 1, chance: 1.0 },
      ],
      cooldown: 1440,
    },
    {
      id: 'sabotage-knowledge',
      name: 'Sabotage Techniques',
      chineseName: '破坏技术',
      description: 'Wu teaches you how to disable, delay, or destroy with precision.',
      category: 'explosives',
      minTrustLevel: 3,
      cost: { gold: 500 },
    },
    {
      id: 'impossible-demolitions',
      name: 'The Impossible Shot',
      chineseName: '不可能的爆破',
      description: 'Wu can blow anything, anywhere, anytime. No collateral damage.',
      category: 'explosives',
      minTrustLevel: 4,
      cost: { gold: 1000 },
      cooldown: 10080,
    },
  ],

  quests: [
    {
      id: 'controlled-demolition',
      name: 'Controlled Demolition',
      description: 'Wu needs help with a delicate blast. One mistake = disaster.',
      backstory: 'A tunnel has a dangerous overhang. The company wants it removed but won\'t pay for an expert. Wu will do it - with your help.',
      minTrustLevel: 1,
      objectives: [
        { type: 'find', target: 'unstable-overhang', location: 'goldfinger-mine' },
        { type: 'protect', target: 'silent-wu' },
        { type: 'retrieve', target: 'blasting-equipment', quantity: 1 },
      ],
      rewards: {
        gold: 200,
        xp: 500,
        trustIncrease: 1,
        items: ['blasting-certificate'],
      },
    },
    {
      id: 'the-silent-art',
      name: 'The Silent Art',
      description: 'Wu will teach you the art of explosives. But first, you must understand respect.',
      backstory: 'Explosives are not toys. They are not weapons. They are tools that demand respect. Wu will test if you understand.',
      minTrustLevel: 2,
      objectives: [
        { type: 'find', target: 'abandoned-powder-magazine' },
        { type: 'retrieve', target: 'unstable-dynamite', quantity: 10 },
        { type: 'deliver', target: 'safe-disposal-site' },
      ],
      rewards: {
        gold: 300,
        xp: 750,
        trustIncrease: 1,
        items: ['powder-mans-toolkit'],
      },
    },
    {
      id: 'the-perfect-blast',
      name: 'The Perfect Blast',
      description: 'Wu will attempt the most difficult demolition of his career. He needs a partner he trusts absolutely.',
      backstory: 'The company wants to open a new shaft. But the rock formation is unstable. One wrong charge and the entire mine collapses. Wu knows how. But he cannot do it alone.',
      minTrustLevel: 3,
      objectives: [
        { type: 'find', target: 'critical-formation', location: 'goldfinger-mine' },
        { type: 'deliver', target: 'precise-charges', quantity: 12 },
        { type: 'protect', target: 'silent-wu' },
      ],
      rewards: {
        gold: 1000,
        xp: 2000,
        trustIncrease: 1,
        items: ['master-blasters-badge', 'legendary-dynamite'],
      },
    },
  ],

  dialogue: {
    greeting: {
      outsider: [
        '*Stares without speaking*',
        '...',
        '*Turns away*',
      ],
      acquaintance: [
        '*Nods once*',
        'Old Zhang sent you?',
        'You need powder?',
      ],
      friend: [
        'You respect the powder. Good.',
        'Most people afraid. You... different.',
        'What you need?',
      ],
      brotherSister: [
        'You understand. The powder is not enemy. Carelessness is enemy.',
        'I trust you.',
        '*Rare slight smile*',
      ],
      family: [
        'You are powder man now. Like Wu.',
        'We are few. The ones who walk with fire.',
        'Come. We work.',
      ],
    },
    coverStory: [
      '*Silent*',
      '...',
      'No.',
    ],
    suspicion: [
      '*Hand moves toward knife*',
      'Leave.',
      '*Intense stare*',
    ],
    trust: [
      'Railroad days. Many blasts. Many... mistakes.',
      'Three men die. Wu live. Why? Wu not know.',
      'Now Wu very careful. Perfect or nothing.',
      'Powder not care if you Chinese or white. Powder care if you stupid.',
    ],
    farewell: [
      '*Nods*',
      'Safe travels.',
      'Remember. Respect the powder.',
    ],
    questHints: [
      'Overhang dangerous. Must remove. Company too cheap hire expert.',
      'You want learn? Must prove you not stupid. Stupid people die.',
    ],
    networkReferences: [
      'Old Zhang teach Wu on railroad. Good man.',
      'Li Jian good miner. But impatient. Wu not teach impatient.',
    ],
  },

  discoveryMethod: 'trust',
  discoveryCondition: {
    npcReferral: 'old-zhang',
    minReputation: 50,
  },

  networkConnections: {
    trusts: ['old-zhang', 'li-jian', 'chen-tao'],
    distrusts: [],
    canRefer: [],
    family: [],
  },

  schedule: [
    { hour: 7, available: true, activity: 'Inspecting powder magazine' },
    { hour: 10, available: false, activity: 'Setting charges in mine' },
    { hour: 14, available: true, activity: 'Maintenance of explosives' },
    { hour: 18, available: false, activity: 'Controlled blasts' },
    { hour: 22, available: false, activity: 'Alone - no one visits' },
  ],

  culturalNotes: [
    'Chinese workers handled the most dangerous explosives work on the railroad',
    'They developed techniques still used in modern demolition',
    'Many Chinese powder men died in accidents, often protecting others',
  ],
};

// Re-export NPCs from continued and final files for backwards compatibility
export {
  WONG_SHU,
  HU_FENG,
  MASTER_FANG,
  JADE_FLOWER,
  CHEN_BO,
} from './npcs-continued';

export {
  DRAGON_LEE,
  AUNTIE_ZHAO,
  RAILROAD_CHEN,
  DR_HUANG,
} from './npcs-final';

// Import all NPCs for the combined array
import { CHINESE_NPCS_CONTINUED } from './npcs-continued';
import { CHINESE_NPCS_FINAL } from './npcs-final';

// Export all NPCs (combined)
export const CHINESE_NPCS: ChineseNPC[] = [
  // Red Gulch (3)
  CHEN_WEI,
  MEI_LIN,
  OLD_ZHANG,
  // Goldfinger's Mine (3)
  LI_JIAN,
  CHEN_TAO,
  SILENT_WU,
  // Fort Ashford & Whiskey Bend (5)
  ...CHINESE_NPCS_CONTINUED,
  // The Frontera & Dusty Trail (4)
  ...CHINESE_NPCS_FINAL,
];

// Complete metadata for all 16 NPCs
export const ALL_CHINESE_NPCS = {
  redGulch: ['chen-wei', 'mei-lin', 'old-zhang'],
  goldfingerMine: ['li-jian', 'chen-tao', 'silent-wu'],
  fortAshford: ['wong-shu', 'hu-feng'],
  whiskeyBend: ['master-fang', 'jade-flower', 'chen-bo'],
  frontera: ['dragon-lee', 'auntie-zhao'],
  dustyTrail: ['railroad-chen', 'dr-huang'],
};
