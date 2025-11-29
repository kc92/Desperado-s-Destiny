/**
 * Chinese Diaspora NPCs (Final Set)
 *
 * Final NPCs for The Frontera and Dusty Trail
 */

import type { ChineseNPC } from '@desperados/shared';

// ============================================================================
// THE FRONTERA NPCs (2)
// ============================================================================

export const DRAGON_LEE: ChineseNPC = {
  id: 'dragon-lee',
  name: '"Dragon" Lee',
  chineseName: 'Lǐ Lóng',
  chineseCharacters: '李龙',
  coverRole: 'Gambling Den Operator',
  hiddenRole: 'Smuggling Network & Opium Trade',
  location: 'the-frontera',
  description: 'A charismatic man in his forties with a dragon tattoo on his neck and gold teeth that flash when he smiles. He runs high-stakes gambling games in the back of a cantina. What the law doesn\'t know is that his gambling den connects to tunnels used for smuggling.',
  personality: 'Charming and dangerous. Smooth talker with violent streak. Entrepreneurial. Respects cunning and courage.',
  backstory: 'Dragon Lee arrived in 1876 and immediately saw opportunity in the lawless border region. He built a smuggling empire moving opium, weapons, and people across borders. His gambling den is both legitimate business and smuggling hub. He\'s rich, connected, and untouchable - as long as you don\'t cross him.',
  networkRole: 'specialist',

  trustLevels: [
    {
      level: 0,
      name: 'Outsider',
      description: 'Gambler or customer',
      requirements: {},
      unlocks: {
        services: ['gambling'],
      },
    },
    {
      level: 1,
      name: 'Acquaintance',
      description: 'Proven yourself at the tables',
      requirements: {
        goldSpent: 200,
      },
      unlocks: {
        services: ['contraband-purchase'],
        dialogue: ['smuggling-talk'],
      },
    },
    {
      level: 2,
      name: 'Friend',
      description: 'Done business successfully',
      requirements: {
        quests: ['the-border-run'],
      },
      unlocks: {
        services: ['smuggling-routes', 'opium-trade'],
        quests: ['tunnel-network'],
      },
    },
    {
      level: 3,
      name: 'Brother/Sister',
      description: 'Trusted business partner',
      requirements: {
        quests: ['tunnel-network'],
      },
      unlocks: {
        services: ['full-smuggling-access', 'protection-racket'],
        npcs: ['auntie-zhao'],
      },
    },
    {
      level: 4,
      name: 'Family',
      description: 'Partner in the empire',
      requirements: {
        quests: ['the-dragon-throne'],
      },
      unlocks: {
        services: ['empire-access'],
      },
    },
  ],

  defaultTrust: 0,

  services: [
    {
      id: 'gambling',
      name: 'High Stakes Gambling',
      chineseName: '豪赌',
      description: 'Play high-stakes games with big payouts.',
      category: 'goods',
      minTrustLevel: 0,
      cost: { gold: 50 },
    },
    {
      id: 'contraband-purchase',
      name: 'Contraband Goods',
      chineseName: '禁品',
      description: 'Buy illegal or rare items.',
      category: 'smuggling',
      minTrustLevel: 1,
      cost: { gold: 100 },
    },
    {
      id: 'smuggling-routes',
      name: 'Smuggling Routes',
      chineseName: '走私路线',
      description: 'Access to border crossing routes.',
      category: 'smuggling',
      minTrustLevel: 2,
      cost: { gold: 300 },
    },
    {
      id: 'opium-trade',
      name: 'Opium Trade',
      chineseName: '鸦片贸易',
      description: 'Buy and sell opium. Highly illegal, highly profitable.',
      category: 'smuggling',
      minTrustLevel: 2,
      cost: { gold: 500 },
    },
    {
      id: 'full-smuggling-access',
      name: 'Smuggler\'s Network',
      chineseName: '走私网络',
      description: 'Complete access to smuggling tunnels and routes.',
      category: 'tunnels',
      minTrustLevel: 3,
      cost: { gold: 1000 },
    },
    {
      id: 'protection-racket',
      name: 'Dragon\'s Protection',
      chineseName: '龙之庇护',
      description: 'Dragon Lee\'s organization will protect you.',
      category: 'smuggling',
      minTrustLevel: 3,
      cost: { gold: 2000 },
      cooldown: 10080,
    },
    {
      id: 'empire-access',
      name: 'The Dragon\'s Empire',
      chineseName: '龙之帝国',
      description: 'Full access to Dragon Lee\'s criminal empire.',
      category: 'smuggling',
      minTrustLevel: 4,
      cost: { gold: 5000 },
    },
  ],

  quests: [
    {
      id: 'the-border-run',
      name: 'The Border Run',
      description: 'Make a smuggling run across the border for Dragon Lee.',
      backstory: 'A shipment needs to cross the border without being detected. Dragon Lee tests all new partners this way.',
      minTrustLevel: 1,
      objectives: [
        { type: 'retrieve', target: 'contraband-package', location: 'the-frontera' },
        { type: 'deliver', target: 'contraband-package', location: 'border-drop' },
      ],
      rewards: {
        gold: 300,
        xp: 600,
        trustIncrease: 1,
      },
      timeLimit: 8,
      failureConsequences: {
        trustDecrease: 2,
        bannedFrom: ['dragon-lee'],
      },
    },
    {
      id: 'tunnel-network',
      name: 'The Tunnel Network',
      description: 'Help Dragon Lee expand his smuggling tunnels.',
      backstory: 'The tunnel network needs expansion. Dragon Lee needs someone who understands mining and construction.',
      minTrustLevel: 2,
      objectives: [
        { type: 'speak', target: 'old-zhang' },
        { type: 'find', target: 'new-tunnel-route', location: 'the-frontera' },
        { type: 'protect', target: 'tunnel-construction' },
      ],
      rewards: {
        gold: 600,
        xp: 1500,
        trustIncrease: 1,
        items: ['tunnel-key'],
      },
    },
    {
      id: 'the-dragon-throne',
      name: 'The Dragon\'s Throne',
      description: 'Help Dragon Lee eliminate a rival smuggling operation.',
      backstory: 'A Mexican cartel is moving into Dragon Lee\'s territory. He wants them gone.',
      minTrustLevel: 3,
      objectives: [
        { type: 'find', target: 'cartel-hideout', location: 'the-frontera' },
        { type: 'protect', target: 'dragon-lee' },
        { type: 'retrieve', target: 'cartel-ledger', quantity: 1 },
      ],
      rewards: {
        gold: 2000,
        xp: 5000,
        trustIncrease: 2,
        items: ['dragon-empire-seal', 'smuggling-charter'],
      },
    },
  ],

  dialogue: {
    greeting: {
      outsider: [
        '*Flashes gold teeth* Welcome, friend! You like to gamble?',
        'First time here? The Dragon treats all guests well.',
        'Sit, drink, play! Tonight you win big!',
      ],
      acquaintance: [
        'Ah, you back! Good luck last time. Maybe more luck tonight?',
        'You handle yourself well. Dragon respects this.',
        'Come, we talk business. Real business.',
      ],
      friend: [
        'You are good smuggler. Dragon needs people like you.',
        'The border is wide. Many opportunities for smart people.',
        'Come into my office. We discuss... opportunities.',
      ],
      brotherSister: [
        'You are partner now. Dragon\'s partners become rich.',
        'Together we control the border. Everything flows through us.',
        'The empire grows. You grow with it.',
      ],
      family: [
        'You are family now. Dragon protects family.',
        'You will be rich beyond dreams. And powerful.',
        'We are the Dragon. Unstoppable.',
      ],
    },
    coverStory: [
      'Dragon just run gambling. Entertainment! Good times!',
      'You think Dragon smuggle? No, no. Just rumors.',
      'Dragon is legitimate businessman. Ask anyone!',
    ],
    suspicion: [
      '*Smile becomes cold* You ask dangerous questions.',
      'Maybe you should leave. Now.',
      '*Snaps fingers - large men appear*',
    ],
    trust: [
      'Border is gold mine. Not rocks - opportunity.',
      'Law cannot control border. Too big. Too wild. Dragon fills the void.',
      'Opium, weapons, people - all move through Dragon\'s tunnels.',
      'Mexican cartels fear Dragon. Chinese network supports Dragon. Dragon is king here.',
    ],
    farewell: [
      'Go with Dragon\'s blessing.',
      'Come back soon. Dragon always has work.',
      'May fortune smile on you.',
    ],
    questHints: [
      'Dragon needs border run. Are you brave? Are you smart? Prove it.',
      'Tunnels need expansion. You know mining people? Introduce Dragon.',
    ],
    networkReferences: [
      'Old Zhang knows tunnels better than anyone. Dragon respects this.',
      'Auntie Zhao is... mother of community. Even Dragon does not cross her.',
    ],
  },

  discoveryMethod: 'visible',

  networkConnections: {
    trusts: ['old-zhang', 'auntie-zhao'],
    distrusts: ['master-fang'],
    canRefer: ['auntie-zhao'],
    family: [],
  },

  schedule: [
    { hour: 14, available: true, activity: 'Waking, business meetings' },
    { hour: 18, available: true, activity: 'Gambling den opens' },
    { hour: 22, available: true, activity: 'Peak gambling hours' },
    { hour: 3, available: false, activity: 'Smuggling operations' },
    { hour: 7, available: false, activity: 'Sleeping' },
  ],

  culturalNotes: [
    'Chinese involvement in border smuggling was significant',
    'Opium trade was both cultural (legal in China) and economic',
    'Criminal enterprises often protected Chinese communities',
    'Border regions were lawless and opportunity-rich',
  ],
};

export const AUNTIE_ZHAO: ChineseNPC = {
  id: 'auntie-zhao',
  name: 'Auntie Zhao',
  chineseName: 'Zhào Āyí',
  chineseCharacters: '赵阿姨',
  coverRole: 'Cantina Cook',
  hiddenRole: 'Network Mother & Child Protector',
  location: 'the-frontera',
  description: 'A stout woman in her sixties with arms like iron from years of cooking and working. Her cantina feeds half of The Frontera. But her real work is protecting children - Chinese, Mexican, and white alike. Everyone calls her Auntie.',
  personality: 'Warm and fierce. Maternal to children, ferocious to abusers. Commands respect through love and fear. The heart of the community.',
  backstory: 'Zhao arrived in 1870 with her husband and three children. Her husband died building the railroad. Her children died of disease. Now every child is her child. She feeds the hungry, shelters orphans, and runs an underground adoption network. Even Dragon Lee bows to Auntie Zhao.',
  networkRole: 'protector',

  trustLevels: [
    {
      level: 0,
      name: 'Outsider',
      description: 'Customer at cantina',
      requirements: {},
      unlocks: {
        services: ['meal'],
      },
    },
    {
      level: 1,
      name: 'Acquaintance',
      description: 'Kind to children',
      requirements: {
        goldSpent: 50,
      },
      unlocks: {
        services: ['motherly-advice'],
        dialogue: ['family-talk'],
      },
    },
    {
      level: 2,
      name: 'Friend',
      description: 'Helped a child',
      requirements: {
        quests: ['save-the-orphan'],
      },
      unlocks: {
        services: ['safe-shelter', 'adoption-help'],
        quests: ['the-lost-children'],
      },
    },
    {
      level: 3,
      name: 'Brother/Sister',
      description: 'Proven protector of children',
      requirements: {
        quests: ['the-lost-children'],
      },
      unlocks: {
        services: ['family-connections', 'community-support'],
        npcs: ['dragon-lee', 'all-network'],
      },
    },
    {
      level: 4,
      name: 'Family',
      description: 'Honorary family member',
      requirements: {
        quests: ['aunties-legacy'],
      },
      unlocks: {
        services: ['eternal-blessing'],
      },
    },
  ],

  defaultTrust: 0,

  services: [
    {
      id: 'meal',
      name: 'Hearty Meal',
      chineseName: '家常饭',
      description: 'A delicious, filling meal like mother used to make.',
      category: 'medicine',
      minTrustLevel: 0,
      cost: { gold: 10 },
      effects: {
        health: 50,
        energy: 25,
      },
    },
    {
      id: 'motherly-advice',
      name: 'Auntie\'s Advice',
      chineseName: '阿姨的建议',
      description: 'Wisdom and guidance from Auntie Zhao.',
      category: 'information',
      minTrustLevel: 1,
      cost: { gold: 0 },
    },
    {
      id: 'safe-shelter',
      name: 'Safe Shelter',
      chineseName: '安全庇护',
      description: 'Auntie Zhao provides safe place to stay.',
      category: 'safe_house',
      minTrustLevel: 2,
      cost: { gold: 25 },
    },
    {
      id: 'adoption-help',
      name: 'Adoption Network',
      chineseName: '收养网络',
      description: 'Help finding families for orphans or children for families.',
      category: 'information',
      minTrustLevel: 2,
      cost: { gold: 100 },
    },
    {
      id: 'family-connections',
      name: 'Family Connections',
      chineseName: '家庭联系',
      description: 'Auntie Zhao can connect you with any family in the network.',
      category: 'information',
      minTrustLevel: 3,
      cost: { gold: 200 },
    },
    {
      id: 'community-support',
      name: 'Community Support',
      chineseName: '社区支持',
      description: 'The entire community will help you when needed.',
      category: 'information',
      minTrustLevel: 3,
      cost: { gold: 500 },
      cooldown: 10080,
    },
    {
      id: 'eternal-blessing',
      name: 'Auntie\'s Eternal Blessing',
      chineseName: '永恒祝福',
      description: 'You are family forever. The community protects you always.',
      category: 'medicine',
      minTrustLevel: 4,
      cost: { gold: 0 },
    },
  ],

  quests: [
    {
      id: 'save-the-orphan',
      name: 'Save the Orphan',
      description: 'A child is being abused. Auntie Zhao needs help rescuing them.',
      backstory: 'Auntie Zhao hears everything. A child is suffering. She will not allow this.',
      minTrustLevel: 1,
      objectives: [
        { type: 'find', target: 'abused-child', location: 'the-frontera' },
        { type: 'protect', target: 'child' },
        { type: 'deliver', target: 'child', location: 'aunties-care' },
      ],
      rewards: {
        gold: 0,
        xp: 500,
        trustIncrease: 1,
        items: ['aunties-gratitude'],
      },
    },
    {
      id: 'the-lost-children',
      name: 'The Lost Children',
      description: 'Find and rescue five orphaned children scattered across the territory.',
      backstory: 'War, disease, and violence create orphans. Auntie Zhao finds them all and gives them family.',
      minTrustLevel: 2,
      objectives: [
        { type: 'find', target: 'orphan-children', quantity: 5 },
        { type: 'deliver', target: 'children', location: 'safe-families' },
      ],
      rewards: {
        gold: 500,
        xp: 2000,
        trustIncrease: 2,
        items: ['protector-of-children-medal'],
      },
    },
    {
      id: 'aunties-legacy',
      name: 'Auntie\'s Legacy',
      description: 'Help Auntie Zhao establish a permanent orphanage.',
      backstory: 'Auntie Zhao is old. She wants to create something permanent - a place where children are always safe.',
      minTrustLevel: 3,
      objectives: [
        { type: 'retrieve', target: 'building-deed', quantity: 1 },
        { type: 'deliver', target: 'funds', location: 'orphanage-site' },
        { type: 'protect', target: 'orphanage-construction' },
      ],
      rewards: {
        gold: 0,
        xp: 5000,
        trustIncrease: 2,
        items: ['aunties-legacy-deed', 'eternal-family-status'],
      },
    },
  ],

  dialogue: {
    greeting: {
      outsider: [
        '*Warm smile* You hungry? Sit, sit! Auntie feed you!',
        'Come in! Everyone welcome at Auntie\'s table.',
        'You look thin. Auntie make you strong!',
      ],
      acquaintance: [
        'You have kind face. Kind to children, yes?',
        'Come, eat. Tell Auntie your troubles.',
        'Good to see you again, child.',
      ],
      friend: [
        'You good person. You help children. Auntie very grateful.',
        '*Pats your cheek* Such a good child.',
        'You are family now. Family takes care of family.',
      ],
      brotherSister: [
        'You are protector of children. Most important work.',
        'Auntie is old. You carry on this work.',
        '*Tears in eyes* My own children gone. But you... you are my child now.',
      ],
      family: [
        'You are my greatest pride.',
        'The ancestors bless you. Auntie blesses you.',
        'Come here. *Embraces you* My child. My family.',
      ],
    },
    coverStory: [
      'Auntie just cook. Make good food.',
      'Many children here. All need to eat. Auntie feeds them.',
      'Is simple life. Cook, clean, care for children.',
    ],
    suspicion: [
      '*Eyes become hard* You hurt children?',
      '*Grabs cleaver* Get out. Now.',
      'Auntie knows your type. Leave before Auntie angry.',
    ],
    trust: [
      'Auntie lost three children. Husband too. Everyone Auntie loved.',
      'Now every child is Auntie\'s child. Chinese, Mexican, white - no matter.',
      'Even Dragon Lee respect Auntie. Because Auntie protected Dragon when he was small boy.',
      'You hurt child, whole community come for you. Auntie makes sure.',
    ],
    farewell: [
      'Go safe. Come back hungry!',
      'May the ancestors protect you.',
      'You are always welcome at Auntie\'s table.',
    ],
    questHints: [
      '*Whispers* Child is being hurt. Bad man. Auntie cannot go herself. You help?',
      'So many orphans. Need homes. Need love. You help Auntie find families?',
    ],
    networkReferences: [
      'Dragon Lee is good boy underneath. Just... complicated.',
      'Master Fang is wise elder. He helps Auntie with many things.',
    ],
  },

  discoveryMethod: 'visible',

  networkConnections: {
    trusts: ['dragon-lee', 'master-fang', 'all-children'],
    distrusts: [],
    canRefer: ['dragon-lee', 'master-fang'],
    family: ['all-rescued-children'],
  },

  schedule: [
    { hour: 5, available: true, activity: 'Preparing breakfast for children' },
    { hour: 9, available: true, activity: 'Cantina open' },
    { hour: 12, available: true, activity: 'Lunch service' },
    { hour: 17, available: true, activity: 'Dinner preparation' },
    { hour: 21, available: false, activity: 'Tucking children into bed' },
  ],

  culturalNotes: [
    'Chinese communities often cared for all children, regardless of ethnicity',
    'Orphanages were rare; informal adoption networks filled the gap',
    'Respected elders could command even criminals to behave',
  ],
};

// ============================================================================
// DUSTY TRAIL NPCs (2)
// ============================================================================

export const RAILROAD_CHEN: ChineseNPC = {
  id: 'railroad-chen',
  name: 'Railroad Chen',
  chineseName: 'Tiělù Chén',
  chineseCharacters: '铁路陈',
  coverRole: 'Drifter & Odd Jobs',
  hiddenRole: 'Master of ALL Railroad Tunnels',
  location: 'dusty-trail',
  description: 'A weathered man in his fifties who wanders from town to town doing odd jobs. He seems like just another drifter. But Railroad Chen worked on every major railroad project in the West. He knows every tunnel, every bridge, every secret passage for a thousand miles.',
  personality: 'Quiet wanderer. Speaks little but acts when needed. Haunted by memories. The ultimate underground guide.',
  backstory: 'Chen worked on the transcontinental railroad, the Southern Pacific, the Northern Pacific, and dozens of smaller lines. He\'s been underground more than above. When people started hunting him for his knowledge, he became a drifter. Only the network knows his true value - a living map of every tunnel in the West.',
  networkRole: 'specialist',

  trustLevels: [
    {
      level: 0,
      name: 'Outsider',
      description: 'Wandering worker',
      requirements: {},
      unlocks: {},
    },
    {
      level: 1,
      name: 'Acquaintance',
      description: 'Referred by old railroad friend',
      requirements: {
        referrals: ['old-zhang'],
      },
      unlocks: {
        services: ['local-tunnels'],
        dialogue: ['railroad-memories'],
      },
    },
    {
      level: 2,
      name: 'Friend',
      description: 'Helped with tunnel rescue',
      requirements: {
        quests: ['tunnel-collapse'],
      },
      unlocks: {
        services: ['regional-tunnels', 'escape-routes'],
        quests: ['the-forgotten-line'],
      },
    },
    {
      level: 3,
      name: 'Brother/Sister',
      description: 'Trusted guide',
      requirements: {
        quests: ['the-forgotten-line'],
      },
      unlocks: {
        services: ['complete-tunnel-knowledge', 'underground-network'],
        npcs: ['hu-feng'],
      },
    },
    {
      level: 4,
      name: 'Family',
      description: 'Master of the underground',
      requirements: {
        quests: ['the-final-tunnel'],
      },
      unlocks: {
        services: ['legendary-passages'],
      },
    },
  ],

  defaultTrust: 0,

  services: [
    {
      id: 'local-tunnels',
      name: 'Local Tunnel Guide',
      chineseName: '本地隧道',
      description: 'Knowledge of nearby tunnels and passages.',
      category: 'tunnels',
      minTrustLevel: 1,
      cost: { gold: 75 },
    },
    {
      id: 'regional-tunnels',
      name: 'Regional Tunnel Map',
      chineseName: '区域隧道',
      description: 'Complete knowledge of all tunnels in a region.',
      category: 'tunnels',
      minTrustLevel: 2,
      cost: { gold: 200 },
    },
    {
      id: 'escape-routes',
      name: 'Emergency Escape Routes',
      chineseName: '逃生路线',
      description: 'Secret underground routes for emergency escapes.',
      category: 'tunnels',
      minTrustLevel: 2,
      cost: { gold: 300 },
    },
    {
      id: 'complete-tunnel-knowledge',
      name: 'Complete Tunnel Knowledge',
      chineseName: '完整隧道知识',
      description: 'Every tunnel, every railroad passage in the territory.',
      category: 'tunnels',
      minTrustLevel: 3,
      cost: { gold: 1000 },
    },
    {
      id: 'underground-network',
      name: 'Underground Network',
      chineseName: '地下网络',
      description: 'Access to the complete underground travel network.',
      category: 'tunnels',
      minTrustLevel: 3,
      cost: { gold: 2000 },
    },
    {
      id: 'legendary-passages',
      name: 'The Lost Passages',
      chineseName: '失落的通道',
      description: 'Secret tunnels known only to Railroad Chen - direct routes to anywhere.',
      category: 'tunnels',
      minTrustLevel: 4,
      cost: { gold: 5000 },
    },
  ],

  quests: [
    {
      id: 'tunnel-collapse',
      name: 'Tunnel Collapse',
      description: 'An old railroad tunnel collapsed with people inside. Chen knows a way in.',
      backstory: 'Chen built this tunnel thirty years ago. He knows every weakness, every alternate route.',
      minTrustLevel: 1,
      objectives: [
        { type: 'find', target: 'collapsed-tunnel', location: 'devils-canyon' },
        { type: 'protect', target: 'railroad-chen' },
        { type: 'retrieve', target: 'trapped-miners', quantity: 3 },
      ],
      rewards: {
        gold: 300,
        xp: 750,
        trustIncrease: 1,
      },
      timeLimit: 6,
    },
    {
      id: 'the-forgotten-line',
      name: 'The Forgotten Line',
      description: 'Explore an abandoned railroad line that Chen helped build.',
      backstory: 'A railroad was built but never used. It goes... somewhere important. Chen will show you.',
      minTrustLevel: 2,
      objectives: [
        { type: 'find', target: 'abandoned-railroad', location: 'sangre-mountains' },
        { type: 'retrieve', target: 'railroad-secrets', quantity: 5 },
      ],
      rewards: {
        gold: 600,
        xp: 2000,
        trustIncrease: 1,
        items: ['railroad-map', 'forgotten-line-key'],
      },
    },
    {
      id: 'the-final-tunnel',
      name: 'The Final Tunnel',
      description: 'Chen will reveal his greatest secret - the tunnel that connects everything.',
      backstory: 'Thirty years of work. A secret project. A tunnel network that spans the entire territory, unknown to everyone.',
      minTrustLevel: 3,
      objectives: [
        { type: 'find', target: 'master-tunnel-entrance' },
        { type: 'speak', target: 'railroad-chen' },
        { type: 'protect', target: 'tunnel-secret' },
      ],
      rewards: {
        gold: 2000,
        xp: 5000,
        trustIncrease: 2,
        items: ['master-tunnel-key', 'underground-master-badge'],
      },
    },
  ],

  dialogue: {
    greeting: {
      outsider: [
        '*Nods silently*',
        'You need work done?',
        '...',
      ],
      acquaintance: [
        'Old Zhang spoke of you. Good man, Zhang.',
        'You want to know about tunnels?',
        'I remember. Everything. Every tunnel.',
      ],
      friend: [
        'You understand the underground. Rare.',
        'I will show you things no one else knows.',
        'The earth keeps secrets. I keep them too.',
      ],
      brotherSister: [
        'You are underground brother/sister now.',
        'I have walked ten thousand miles underground. I will teach you.',
        'The tunnels speak. You can hear them now.',
      ],
      family: [
        'You are master now. Like Chen.',
        'The underground is yours. All of it.',
        'When Chen is gone, you will remember. You will guide others.',
      ],
    },
    coverStory: [
      'Chen just worker. Do odd jobs.',
      'Railroad days long gone. Chen old now.',
      'Know nothing special.',
    ],
    suspicion: [
      '*Turns away*',
      'Cannot help you.',
      '...',
    ],
    trust: [
      'Thirty years underground. Building tunnels. Digging through mountains.',
      'Everyone wants to know what Chen knows. Want maps. Want secrets.',
      'But Chen remembers friends. Remembers who helped Chinese workers.',
      'Every tunnel tells story. Every collapse, every breakthrough. Chen was there.',
    ],
    farewell: [
      '*Nods*',
      'Walk safely. Above and below.',
      'Remember. The earth provides passage.',
    ],
    questHints: [
      'Old tunnel collapsed. I know alternate route. Need help though.',
      'Railroad built line that goes nowhere. Or... does it?',
    ],
    networkReferences: [
      'Old Zhang good friend. We worked together on railroad.',
      'Hu Feng needs escape routes. Chen provides.',
    ],
  },

  discoveryMethod: 'trust',
  discoveryCondition: {
    npcReferral: 'old-zhang',
    minReputation: 150,
  },

  networkConnections: {
    trusts: ['old-zhang', 'hu-feng', 'li-jian'],
    distrusts: [],
    canRefer: ['hu-feng'],
    family: [],
  },

  schedule: [
    { hour: 7, available: true, activity: 'Morning odd jobs' },
    { hour: 11, available: false, activity: 'Exploring tunnels' },
    { hour: 15, available: true, activity: 'Back in town' },
    { hour: 19, available: true, activity: 'Evening rest' },
    { hour: 23, available: false, activity: 'Secret tunnel work' },
  ],

  culturalNotes: [
    'Railroad workers developed encyclopedic knowledge of tunnels',
    'Chinese workers kept detailed mental maps as survival strategy',
    'Abandoned railroad tunnels became part of underground networks',
  ],
};

export const DR_HUANG: ChineseNPC = {
  id: 'dr-huang',
  name: 'Dr. Huang',
  chineseName: 'Huáng Yīshēng',
  chineseCharacters: '黄医生',
  coverRole: 'Wandering Helper & Healer',
  hiddenRole: 'Trained Physician & Surgeon',
  location: 'dusty-trail',
  description: 'A scholarly man in his forties who treats injured travelers on Dusty Trail. He appears to be a simple folk healer. In truth, he studied medicine in China and was trained as a surgeon. American law won\'t let him practice officially, so he saves lives in secret.',
  personality: 'Gentle and intellectual. Frustrated by racism that prevents him from using his skills fully. Dedicated to healing anyone who needs help.',
  backstory: 'Dr. Huang studied medicine in Beijing and practiced as a surgeon for five years before immigrating in 1881. He dreamed of bringing modern medicine to America. Instead, he found laws preventing Chinese from becoming licensed physicians. Now he practices in secret, performing surgeries in back rooms, saving lives that "real" doctors refuse to treat.',
  networkRole: 'specialist',

  trustLevels: [
    {
      level: 0,
      name: 'Outsider',
      description: 'Traveling healer',
      requirements: {},
      unlocks: {
        services: ['basic-first-aid'],
      },
    },
    {
      level: 1,
      name: 'Acquaintance',
      description: 'Recognized his skill',
      requirements: {
        referrals: ['mei-lin'],
      },
      unlocks: {
        services: ['advanced-treatment'],
        dialogue: ['medical-talk'],
      },
    },
    {
      level: 2,
      name: 'Friend',
      description: 'Helped him save a life',
      requirements: {
        quests: ['emergency-surgery'],
      },
      unlocks: {
        services: ['surgery', 'disease-cure'],
        quests: ['the-hidden-clinic'],
      },
    },
    {
      level: 3,
      name: 'Brother/Sister',
      description: 'Trusted medical partner',
      requirements: {
        quests: ['the-hidden-clinic'],
      },
      unlocks: {
        services: ['advanced-surgery', 'miracle-medicine'],
        npcs: ['mei-lin', 'chen-tao'],
      },
    },
    {
      level: 4,
      name: 'Family',
      description: 'Fellow healer',
      requirements: {
        quests: ['the-healing-legacy'],
      },
      unlocks: {
        services: ['master-physician'],
      },
    },
  ],

  defaultTrust: 0,

  services: [
    {
      id: 'basic-first-aid',
      name: 'First Aid',
      description: 'Basic wound treatment and bandaging.',
      category: 'healing',
      minTrustLevel: 0,
      cost: { gold: 20 },
      effects: {
        health: 50,
      },
    },
    {
      id: 'advanced-treatment',
      name: 'Medical Treatment',
      chineseName: '医疗',
      description: 'Professional medical care for injuries and illness.',
      category: 'healing',
      minTrustLevel: 1,
      cost: { gold: 75 },
      effects: {
        health: 100,
        removePoison: true,
      },
    },
    {
      id: 'surgery',
      name: 'Surgery',
      chineseName: '手术',
      description: 'Surgical treatment for serious injuries.',
      category: 'healing',
      minTrustLevel: 2,
      cost: { gold: 200 },
      effects: {
        health: 200,
        removePoison: true,
      },
    },
    {
      id: 'disease-cure',
      name: 'Disease Treatment',
      chineseName: '疾病治疗',
      description: 'Treatment for serious diseases and infections.',
      category: 'healing',
      minTrustLevel: 2,
      cost: { gold: 150 },
      effects: {
        health: 150,
        removeCurse: true,
      },
    },
    {
      id: 'advanced-surgery',
      name: 'Advanced Surgery',
      chineseName: '高级手术',
      description: 'Complex surgical procedures that most doctors cannot perform.',
      category: 'healing',
      minTrustLevel: 3,
      cost: { gold: 500 },
      effects: {
        health: 999,
        removePoison: true,
        removeCurse: true,
      },
    },
    {
      id: 'miracle-medicine',
      name: 'Miracle Treatment',
      chineseName: '奇迹医疗',
      description: 'Combination of Western surgery and Eastern medicine.',
      category: 'healing',
      minTrustLevel: 3,
      cost: { gold: 800 },
      effects: {
        health: 999,
        energy: 100,
        removePoison: true,
        removeCurse: true,
        buffDuration: 1440,
        buffEffect: 'perfect-health',
      },
      cooldown: 10080,
    },
    {
      id: 'master-physician',
      name: 'Master Physician Care',
      chineseName: '大师医疗',
      description: 'The best medical care available anywhere.',
      category: 'healing',
      minTrustLevel: 4,
      cost: { gold: 1500 },
    },
  ],

  quests: [
    {
      id: 'emergency-surgery',
      name: 'Emergency Surgery',
      description: 'A man is dying. Only surgery can save him. Help Dr. Huang operate.',
      backstory: 'A gunshot victim. The local doctor refused treatment because he\'s Chinese. Dr. Huang will save him - but he needs an assistant.',
      minTrustLevel: 1,
      objectives: [
        { type: 'retrieve', target: 'surgical-supplies', quantity: 1 },
        { type: 'protect', target: 'dr-huang' },
        { type: 'deliver', target: 'patient', location: 'safe-recovery' },
      ],
      rewards: {
        gold: 200,
        xp: 750,
        trustIncrease: 1,
      },
      timeLimit: 2,
      failureConsequences: {
        trustDecrease: 1,
      },
    },
    {
      id: 'the-hidden-clinic',
      name: 'The Hidden Clinic',
      description: 'Help Dr. Huang establish a secret clinic.',
      backstory: 'Dr. Huang dreams of a real clinic where he can treat everyone who needs help. It must be hidden from authorities.',
      minTrustLevel: 2,
      objectives: [
        { type: 'find', target: 'suitable-location', location: 'dusty-trail' },
        { type: 'retrieve', target: 'medical-equipment', quantity: 10 },
        { type: 'protect', target: 'clinic-establishment' },
      ],
      rewards: {
        gold: 500,
        xp: 2000,
        trustIncrease: 1,
        items: ['hidden-clinic-access'],
      },
    },
    {
      id: 'the-healing-legacy',
      name: 'The Healing Legacy',
      description: 'Dr. Huang will teach you everything he knows about medicine.',
      backstory: 'Dr. Huang wants his knowledge to survive. He will train you in both Western and Eastern medicine.',
      minTrustLevel: 3,
      objectives: [
        { type: 'speak', target: 'dr-huang', quantity: 10 },
        { type: 'retrieve', target: 'medical-texts', quantity: 5 },
        { type: 'protect', target: 'patients', quantity: 20 },
      ],
      rewards: {
        gold: 1000,
        xp: 5000,
        trustIncrease: 2,
        items: ['physician-certificate', 'medical-mastery'],
      },
    },
  ],

  dialogue: {
    greeting: {
      outsider: [
        'You are injured? Let me see.',
        '*Gentle smile* I can help. Please, sit.',
        'All who suffer are welcome here.',
      ],
      acquaintance: [
        'You understand that healing knows no borders.',
        'Thank you for seeing me as a doctor, not just... Chinese.',
        'What brings you here today?',
      ],
      friend: [
        'You helped save that man. You have the heart of a healer.',
        'I wish I could practice openly. But this is enough.',
        'Come, there is much I can teach you.',
      ],
      brotherSister: [
        'You are a healer now. We share this sacred duty.',
        'Western medicine has much to learn from Eastern traditions.',
        'Together we save lives. That is all that matters.',
      ],
      family: [
        'You carry on the healing tradition. I am proud.',
        'You have learned everything I can teach.',
        'The legacy lives on through you.',
      ],
    },
    coverStory: [
      'I help travelers. Simple remedies. Nothing special.',
      'Not real doctor. Just know some herbs.',
      'Basic first aid only.',
    ],
    suspicion: [
      '*Careful* I am not licensed. Cannot provide medical care.',
      'Perhaps you should see American doctor.',
      '*Nervous* I could be arrested for practicing medicine.',
    ],
    trust: [
      'I studied medicine for eight years. Performed hundreds of surgeries.',
      'In China, I was respected physician. Here... I am just Chinese.',
      'American doctors let people die rather than let Chinese doctor help.',
      'So I work in secret. Save lives in back rooms. Break laws to heal.',
      'I took an oath to help all who suffer. That oath does not recognize borders.',
    ],
    farewell: [
      'Go in health.',
      'May you never need my services.',
      'Take care of yourself.',
    ],
    questHints: [
      'Man is dying. I can save him. But need help. And privacy.',
      'I dream of real clinic. Where I can help anyone. But must be hidden.',
    ],
    networkReferences: [
      'Mei Lin taught me much about herbs. She is brilliant herbalist.',
      'Chen Tao understands spiritual healing. Different from my training, but effective.',
    ],
  },

  discoveryMethod: 'trust',
  discoveryCondition: {
    npcReferral: 'mei-lin',
  },

  networkConnections: {
    trusts: ['mei-lin', 'chen-tao', 'master-fang'],
    distrusts: [],
    canRefer: [],
    family: [],
  },

  schedule: [
    { hour: 6, available: true, activity: 'Morning clinic hours' },
    { hour: 10, available: true, activity: 'Treating patients' },
    { hour: 14, available: true, activity: 'House calls' },
    { hour: 18, available: true, activity: 'Evening clinic' },
    { hour: 22, available: false, activity: 'Studying medical texts' },
  ],

  culturalNotes: [
    'Chinese physicians were barred from licensing in many states',
    'Many Chinese doctors had superior training but couldn\'t practice legally',
    'Secret clinics served communities ignored by white physicians',
    'Integration of Eastern and Western medicine was revolutionary',
  ],
};

// Export final NPCs
export const CHINESE_NPCS_FINAL: ChineseNPC[] = [
  // The Frontera (2)
  DRAGON_LEE,
  AUNTIE_ZHAO,
  // Dusty Trail (2)
  RAILROAD_CHEN,
  DR_HUANG,
];

// Complete export of all Chinese NPCs
export const ALL_CHINESE_NPCS = {
  redGulch: ['chen-wei', 'mei-lin', 'old-zhang'],
  goldfingerMine: ['li-jian', 'chen-tao', 'silent-wu'],
  fortAshford: ['wong-shu', 'hu-feng'],
  whiskeyBend: ['master-fang', 'jade-flower', 'chen-bo'],
  frontera: ['dragon-lee', 'auntie-zhao'],
  dustyTrail: ['railroad-chen', 'dr-huang'],
};
