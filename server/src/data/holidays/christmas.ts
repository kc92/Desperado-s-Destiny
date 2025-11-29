/**
 * Christmas Holiday Event
 * December 25 - 14 Days
 * Theme: Giving, family, winter magic
 */

import {
  HolidayEvent,
  HolidayQuest,
  HolidayShop,
  HolidayNPC,
  HolidayActivity,
  HolidayDailyChallenge,
  Decoration,
  HolidayItem,
  Cosmetic,
  HolidayEncounter,
} from '@desperados/shared';

export const christmasQuests: HolidayQuest[] = [
  {
    id: 'XMAS_SANTA_ARRIVES',
    name: "Santa's Arrival",
    description: 'Welcome Santa Claus to Frontera and learn about the Christmas spirit.',
    lore: 'A mysterious stranger in red has arrived in town with tales of gift-giving and winter magic...',
    requirements: [{ type: 'LEVEL', value: 1 }],
    objectives: [
      {
        id: 'TALK_SANTA',
        description: 'Speak with Santa Claus in Frontera Square',
        type: 'visit',
        target: 'SANTA_CLAUS',
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 100 },
      { type: 'CURRENCY', id: 'CANDY_CANE', amount: 10 },
      { type: 'ITEM', id: 'SANTA_HAT_BASIC', amount: 1 },
    ],
    repeatable: false,
  },
  {
    id: 'XMAS_GIFT_DELIVERY',
    name: 'Special Deliveries',
    description: 'Deliver Christmas presents to citizens across the territory.',
    lore: 'Santa needs help delivering gifts to the good folks of the frontier.',
    requirements: [{ type: 'QUEST_COMPLETED', value: 'XMAS_SANTA_ARRIVES' }],
    objectives: [
      {
        id: 'DELIVER_GIFTS',
        description: 'Deliver presents to 10 NPCs',
        type: 'deliver',
        target: 'CHRISTMAS_PRESENT',
        current: 0,
        required: 10,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 250 },
      { type: 'CURRENCY', id: 'CANDY_CANE', amount: 25 },
      { type: 'XP', id: 'XP', amount: 500 },
    ],
    repeatable: true,
    dailyLimit: 3,
  },
  {
    id: 'XMAS_HUNT_KRAMPUS',
    name: 'The Krampus Menace',
    description: 'A dark creature is terrorizing naughty outlaws. Hunt down Krampus!',
    lore: "Where there's Santa, there's also Krampus - punisher of the wicked.",
    requirements: [
      { type: 'LEVEL', value: 15 },
      { type: 'QUEST_COMPLETED', value: 'XMAS_SANTA_ARRIVES' },
    ],
    objectives: [
      {
        id: 'DEFEAT_KRAMPUS',
        description: 'Defeat Krampus in combat',
        type: 'kill',
        target: 'KRAMPUS',
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 500 },
      { type: 'CURRENCY', id: 'CANDY_CANE', amount: 50 },
      { type: 'ITEM', id: 'KRAMPUS_HORN', amount: 1, rarity: 'LEGENDARY' },
      { type: 'ACHIEVEMENT', id: 'KRAMPUS_SLAYER', amount: 1 },
    ],
    repeatable: true,
    dailyLimit: 1,
  },
  {
    id: 'XMAS_DECORATE_TOWN',
    name: 'Deck the Halls',
    description: 'Help decorate Frontera for the Christmas season.',
    lore: 'The town needs festive decorations to spread holiday cheer.',
    requirements: [{ type: 'LEVEL', value: 5 }],
    objectives: [
      {
        id: 'PLACE_DECORATIONS',
        description: 'Place Christmas decorations around town',
        type: 'deliver',
        target: 'DECORATION',
        current: 0,
        required: 20,
      },
      {
        id: 'LIGHT_TREE',
        description: 'Light the town Christmas tree',
        type: 'visit',
        target: 'CHRISTMAS_TREE',
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 200 },
      { type: 'CURRENCY', id: 'CANDY_CANE', amount: 30 },
      { type: 'COSMETIC', id: 'DECORATOR_TITLE', amount: 1 },
    ],
    repeatable: false,
  },
  {
    id: 'XMAS_SECRET_SANTA',
    name: 'Secret Santa Exchange',
    description: 'Participate in the Secret Santa gift exchange.',
    lore: 'A tradition of anonymous gift-giving brings the community together.',
    requirements: [{ type: 'LEVEL', value: 10 }],
    objectives: [
      {
        id: 'BUY_GIFT',
        description: 'Purchase a gift from the Christmas shop',
        type: 'collect',
        target: 'SECRET_SANTA_GIFT',
        current: 0,
        required: 1,
      },
      {
        id: 'GIVE_GIFT',
        description: 'Give your gift to assigned player',
        type: 'deliver',
        target: 'PLAYER',
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'ITEM', id: 'MYSTERY_GIFT', amount: 1 },
      { type: 'CURRENCY', id: 'CANDY_CANE', amount: 20 },
      { type: 'XP', id: 'XP', amount: 300 },
    ],
    repeatable: false,
  },
  {
    id: 'XMAS_SNOWBALL_FIGHT',
    name: 'Snowball Championship',
    description: 'Win snowball fights against other players.',
    lore: 'A friendly competition of icy projectiles!',
    requirements: [{ type: 'LEVEL', value: 5 }],
    objectives: [
      {
        id: 'WIN_FIGHTS',
        description: 'Win 5 snowball fights',
        type: 'win',
        target: 'SNOWBALL_FIGHT',
        current: 0,
        required: 5,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 150 },
      { type: 'CURRENCY', id: 'CANDY_CANE', amount: 15 },
      { type: 'TITLE', id: 'SNOWBALL_CHAMPION', amount: 1 },
    ],
    repeatable: true,
    dailyLimit: 1,
  },
  {
    id: 'XMAS_CAROL_SINGING',
    name: 'Christmas Caroling',
    description: 'Sing carols at five different locations.',
    lore: 'Spread holiday cheer through song and merriment.',
    requirements: [{ type: 'LEVEL', value: 3 }],
    objectives: [
      {
        id: 'SING_CAROLS',
        description: 'Perform carols at 5 locations',
        type: 'visit',
        target: 'CAROL_LOCATION',
        current: 0,
        required: 5,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 100 },
      { type: 'CURRENCY', id: 'CANDY_CANE', amount: 20 },
      { type: 'COSMETIC', id: 'CAROLER_OUTFIT', amount: 1 },
    ],
    repeatable: true,
    dailyLimit: 1,
  },
];

export const christmasShop: HolidayShop = {
  id: 'XMAS_SHOP',
  name: "Santa's Workshop",
  npcName: 'Santa Claus',
  currency: 'CANDY_CANE',
  location: 'FRONTERA_SQUARE',
  items: [
    {
      itemId: 'SANTA_OUTFIT_FULL',
      name: "Santa's Suit",
      description: 'Complete Santa Claus outfit with red coat and white trim',
      cost: 200,
      requiredLevel: 10,
    },
    {
      itemId: 'MRS_CLAUS_DRESS',
      name: "Mrs. Claus's Dress",
      description: 'Elegant holiday dress with festive colors',
      cost: 200,
      requiredLevel: 10,
    },
    {
      itemId: 'ELF_COSTUME',
      name: "Elf Helper Outfit",
      description: 'Green and red elf costume with pointy hat',
      cost: 150,
      requiredLevel: 5,
    },
    {
      itemId: 'REINDEER_MOUNT_SKIN',
      name: 'Reindeer Mount Skin',
      description: 'Transform your horse into a festive reindeer',
      cost: 300,
      stock: 1,
      requiredLevel: 15,
    },
    {
      itemId: 'CANDY_CANE_RIFLE',
      name: 'Candy Cane Rifle',
      description: 'Festive rifle with candy cane stripes (+5 Accuracy)',
      cost: 250,
      requiredLevel: 12,
    },
    {
      itemId: 'SNOWFLAKE_REVOLVER',
      name: 'Snowflake Revolver',
      description: 'Ice-themed revolver with frost effects (+3 Damage)',
      cost: 200,
      requiredLevel: 10,
    },
    {
      itemId: 'GINGERBREAD_ARMOR',
      name: 'Gingerbread Armor',
      description: 'Sweet but sturdy armor (+10 Defense)',
      cost: 180,
      requiredLevel: 8,
    },
    {
      itemId: 'JINGLE_BELL_SPURS',
      name: 'Jingle Bell Spurs',
      description: 'Musical spurs that jingle as you walk (+5 Charisma)',
      cost: 100,
      requiredLevel: 5,
    },
    {
      itemId: 'CHRISTMAS_TREE_DEED',
      name: 'Christmas Tree (Property Decoration)',
      description: 'Place a decorated tree in your property',
      cost: 150,
      purchaseLimit: 3,
    },
    {
      itemId: 'HOT_COCOA',
      name: 'Hot Cocoa',
      description: 'Restores 50 HP and provides +10% XP for 1 hour',
      cost: 10,
      purchaseLimit: 50,
    },
    {
      itemId: 'FRUITCAKE',
      name: 'Frontier Fruitcake',
      description: 'Dense and long-lasting. +20 HP regen for 30 minutes',
      cost: 15,
    },
    {
      itemId: 'EGGNOG',
      name: 'Festive Eggnog',
      description: '+15% Gold earned for 2 hours',
      cost: 25,
    },
  ],
};

export const christmasNPCs: HolidayNPC[] = [
  {
    id: 'SANTA_CLAUS',
    name: 'Santa Claus',
    role: 'Gift Giver',
    location: 'FRONTERA_SQUARE',
    dialogue: [
      {
        id: 'SANTA_GREETING',
        text: 'Ho ho ho! Merry Christmas, partner! Have you been naughty or nice this year?',
        responses: [
          {
            text: 'Nice, of course!',
            action: 'GIVE_REWARD',
          },
          {
            text: "I've had my moments...",
            nextDialogue: 'SANTA_NAUGHTY',
          },
          {
            text: 'What brings you to the frontier?',
            nextDialogue: 'SANTA_LORE',
          },
        ],
      },
      {
        id: 'SANTA_NAUGHTY',
        text: "Well, everyone deserves a second chance at Christmas! Why don't you help me spread some cheer?",
      },
      {
        id: 'SANTA_LORE',
        text: 'Even in the Wild West, the spirit of giving lives on. I travel wherever hearts need warming and communities need bringing together.',
      },
    ],
    quests: ['XMAS_SANTA_ARRIVES', 'XMAS_GIFT_DELIVERY'],
    shopId: 'XMAS_SHOP',
  },
  {
    id: 'ELF_HELPER',
    name: 'Jingles the Elf',
    role: 'Workshop Assistant',
    location: 'FRONTERA_SQUARE',
    dialogue: [
      {
        id: 'ELF_GREETING',
        text: "Hello there! I'm one of Santa's helpers. Need any last-minute crafting done?",
      },
    ],
    quests: ['XMAS_DECORATE_TOWN'],
  },
  {
    id: 'MRS_CLAUS',
    name: 'Mrs. Claus',
    role: 'Cookie Baker',
    location: 'FRONTERA_BAKERY',
    dialogue: [
      {
        id: 'MRS_GREETING',
        text: "Welcome, dear! Would you like some fresh-baked Christmas cookies?",
      },
    ],
    quests: ['XMAS_CAROL_SINGING'],
  },
];

export const christmasActivities: HolidayActivity[] = [
  {
    id: 'SNOWBALL_FIGHT_TOURNAMENT',
    name: 'Snowball Fight Tournament',
    type: 'COMBAT',
    description: 'Compete in organized snowball fights for prizes',
    duration: 30,
    maxParticipants: 16,
    rewards: [
      { type: 'CURRENCY', id: 'CANDY_CANE', amount: 50 },
      { type: 'TITLE', id: 'SNOWBALL_KING', amount: 1 },
    ],
    startTimes: ['12:00', '18:00', '22:00'],
  },
  {
    id: 'GIFT_WRAPPING_RACE',
    name: 'Gift Wrapping Speed Contest',
    type: 'CONTEST',
    description: 'Wrap as many presents as possible in 5 minutes',
    duration: 5,
    rewards: [
      { type: 'CURRENCY', id: 'CANDY_CANE', amount: 30 },
    ],
  },
  {
    id: 'SLEIGH_RACE',
    name: 'Christmas Sleigh Race',
    type: 'CONTEST',
    description: 'Race through snowy terrain on decorated sleighs',
    duration: 15,
    maxParticipants: 8,
    rewards: [
      { type: 'CURRENCY', id: 'CANDY_CANE', amount: 75 },
      { type: 'ITEM', id: 'SLEIGH_TROPHY', amount: 1 },
    ],
    startTimes: ['14:00', '20:00'],
    requirements: [{ type: 'LEVEL', value: 10 }],
  },
];

export const christmasChallenges: HolidayDailyChallenge[] = [
  {
    id: 'DAILY_GIFT_GIVER',
    name: 'Daily Gift Giver',
    description: 'Give 3 gifts to other players',
    objective: {
      id: 'GIVE_GIFTS',
      description: 'Give gifts to players',
      type: 'deliver',
      target: 'PLAYER',
      current: 0,
      required: 3,
    },
    reward: { type: 'CURRENCY', id: 'CANDY_CANE', amount: 25 },
    difficulty: 'EASY',
  },
  {
    id: 'DAILY_CAROL_MASTER',
    name: 'Carol Master',
    description: 'Sing carols at 3 different locations',
    objective: {
      id: 'SING_CAROLS',
      description: 'Perform at locations',
      type: 'visit',
      target: 'CAROL_LOCATION',
      current: 0,
      required: 3,
    },
    reward: { type: 'CURRENCY', id: 'CANDY_CANE', amount: 20 },
    difficulty: 'EASY',
  },
  {
    id: 'DAILY_KRAMPUS_HUNTER',
    name: 'Krampus Hunter',
    description: 'Defeat Krampus',
    objective: {
      id: 'KILL_KRAMPUS',
      description: 'Defeat the Christmas demon',
      type: 'kill',
      target: 'KRAMPUS',
      current: 0,
      required: 1,
    },
    reward: { type: 'CURRENCY', id: 'CANDY_CANE', amount: 50 },
    difficulty: 'HARD',
  },
];

export const christmasDecorations: Decoration[] = [
  {
    id: 'TOWN_CHRISTMAS_TREE',
    name: 'Giant Christmas Tree',
    location: 'FRONTERA_SQUARE',
    type: 'TREE',
    description: '30-foot decorated pine with hundreds of lights',
  },
  {
    id: 'CANDY_CANE_POLES',
    name: 'Candy Cane Street Poles',
    location: 'MAIN_STREET',
    type: 'BANNER',
    description: 'Red and white striped poles lining the street',
  },
  {
    id: 'SNOW_EFFECTS',
    name: 'Falling Snow',
    location: 'ALL_ZONES',
    type: 'EFFECTS',
    description: 'Gentle snowfall across all territories',
  },
  {
    id: 'WREATH_DECORATIONS',
    name: 'Holiday Wreaths',
    location: 'ALL_BUILDINGS',
    type: 'BANNER',
    description: 'Green wreaths with red bows on all doors',
  },
  {
    id: 'STRING_LIGHTS',
    name: 'String Lights',
    location: 'ALL_ZONES',
    type: 'LIGHTS',
    description: 'Colorful lights strung across buildings',
  },
];

export const christmasItems: HolidayItem[] = [
  {
    id: 'SANTA_HAT_BASIC',
    name: 'Santa Hat',
    description: 'Classic red and white Santa hat',
    type: 'CLOTHING',
    slot: 'HAT',
    stats: { charisma: 2 },
    tradeable: true,
    expiresAfterEvent: false,
  },
  {
    id: 'CANDY_CANE_RIFLE',
    name: 'Candy Cane Rifle',
    description: 'Festive rifle with candy cane design',
    type: 'WEAPON',
    slot: 'PRIMARY',
    stats: { accuracy: 5, damage: 15 },
    tradeable: false,
    expiresAfterEvent: false,
  },
  {
    id: 'KRAMPUS_HORN',
    name: "Krampus's Horn",
    description: 'Trophy from defeating the Christmas demon',
    type: 'ACCESSORY',
    stats: { intimidation: 10 },
    effects: [{ type: 'FEAR_AURA', value: 5 }],
    tradeable: true,
    expiresAfterEvent: false,
  },
  {
    id: 'GINGERBREAD_ARMOR',
    name: 'Gingerbread Armor',
    description: 'Surprisingly sturdy festive armor',
    type: 'CLOTHING',
    slot: 'CHEST',
    stats: { defense: 10, luck: 3 },
    tradeable: false,
    expiresAfterEvent: false,
  },
  {
    id: 'HOT_COCOA',
    name: 'Hot Cocoa',
    description: 'Warming beverage',
    type: 'CONSUMABLE',
    effects: [
      { type: 'HEAL', value: 50 },
      { type: 'XP_BOOST', value: 10, duration: 60 },
    ],
    tradeable: true,
    expiresAfterEvent: true,
  },
];

export const christmasCosmetics: Cosmetic[] = [
  {
    id: 'SANTA_FULL_OUTFIT',
    name: "Santa's Complete Outfit",
    description: 'Full Santa Claus costume',
    slot: 'OUTFIT',
    rarity: 'EPIC',
    exclusive: true,
  },
  {
    id: 'REINDEER_MOUNT',
    name: 'Reindeer Mount Skin',
    description: 'Turn your horse into a reindeer',
    slot: 'MOUNT_SKIN',
    rarity: 'LEGENDARY',
    exclusive: true,
  },
  {
    id: 'ELF_OUTFIT',
    name: 'Elf Helper Costume',
    description: 'Green and red elf attire',
    slot: 'OUTFIT',
    rarity: 'RARE',
    exclusive: true,
  },
  {
    id: 'CAROLER_OUTFIT',
    name: 'Christmas Caroler Outfit',
    description: 'Victorian-style caroling outfit',
    slot: 'OUTFIT',
    rarity: 'RARE',
    exclusive: true,
  },
];

export const krampusEncounter: HolidayEncounter = {
  id: 'KRAMPUS_BOSS',
  holidayId: 'CHRISTMAS',
  name: 'Krampus',
  type: 'BOSS',
  level: 20,
  health: 5000,
  damage: 150,
  abilities: ['CHAIN_WHIP', 'FEAR_ROAR', 'COAL_THROW', 'KIDNAP_ATTEMPT'],
  lootTable: [
    {
      itemId: 'KRAMPUS_HORN',
      dropChance: 1.0,
      minQuantity: 1,
      maxQuantity: 1,
      guaranteed: true,
    },
    {
      itemId: 'CANDY_CANE',
      dropChance: 1.0,
      minQuantity: 25,
      maxQuantity: 50,
      guaranteed: true,
    },
    {
      itemId: 'KRAMPUS_CHAIN',
      dropChance: 0.15,
      minQuantity: 1,
      maxQuantity: 1,
    },
  ],
  spawnLocations: ['DARK_FOREST', 'MOUNTAIN_CAVES', 'HAUNTED_MINE'],
  spawnChance: 0.3,
  maxSpawns: 3,
};

export const christmasEvent: HolidayEvent = {
  id: 'CHRISTMAS_2025',
  type: 'CHRISTMAS',
  name: 'A Frontier Christmas',
  description: 'Celebrate the season of giving in the Wild West with Santa, Krampus, and festive activities.',
  lore: 'Even in the lawless frontier, the magic of Christmas brings hope, joy, and community together. But beware - where Santa brings gifts, Krampus brings punishment for the wicked.',

  // Timing
  startDate: { month: 12, day: 18 },
  endDate: { month: 12, day: 31 },
  duration: 14,

  // Content
  specialQuests: christmasQuests,
  limitedShops: [christmasShop],
  decorations: christmasDecorations,
  specialNPCs: christmasNPCs,

  // Activities
  activities: christmasActivities,
  dailyChallenges: christmasChallenges,

  // Rewards
  participationRewards: [
    { type: 'ITEM', id: 'SANTA_HAT_BASIC', amount: 1 },
    { type: 'CURRENCY', id: 'CANDY_CANE', amount: 50 },
  ],
  completionRewards: [
    { type: 'TITLE', id: 'CHRISTMAS_HERO', amount: 1 },
    { type: 'COSMETIC', id: 'SANTA_FULL_OUTFIT', amount: 1 },
    { type: 'ACHIEVEMENT', id: 'CHRISTMAS_COMPLETE', amount: 1 },
  ],
  exclusiveItems: christmasItems,
  limitedCosmetics: christmasCosmetics,

  // Currency
  currency: 'CANDY_CANE',
  currencyConversionRate: 2, // 1 candy cane = 2 gold after event

  // Atmosphere
  musicTheme: 'christmas_carols',
  weatherOverride: 'SNOW',
  skyboxOverride: 'winter_night',
  townDecorationsEnabled: true,
  npcCostumesEnabled: true,
};
