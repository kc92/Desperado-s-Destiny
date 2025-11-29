/**
 * Remaining Holiday Events
 * New Year's, Valentine's Day, Easter, Thanksgiving
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

// ========================================
// NEW YEAR'S EVENT
// ========================================

export const newYearQuests: HolidayQuest[] = [
  {
    id: 'NY_NEW_BEGINNINGS',
    name: 'New Beginnings',
    description: 'Welcome the new year and make your resolutions.',
    lore: 'A fresh start on the frontier - what will you accomplish this year?',
    requirements: [{ type: 'LEVEL', value: 1 }],
    objectives: [
      {
        id: 'MAKE_RESOLUTION',
        description: 'Set your New Year resolution',
        type: 'visit',
        target: 'RESOLUTION_BOARD',
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 100 },
      { type: 'CURRENCY', id: 'CONFETTI', amount: 10 },
      { type: 'ITEM', id: 'PARTY_HAT', amount: 1 },
    ],
    repeatable: false,
  },
  {
    id: 'NY_DRINKING_CONTEST',
    name: "New Year's Drinking Contest",
    description: 'Out-drink your rivals at the saloon.',
    lore: 'Ring in the new year with a legendary drinking competition!',
    requirements: [{ type: 'LEVEL', value: 8 }],
    objectives: [
      {
        id: 'WIN_CONTEST',
        description: 'Win the drinking contest',
        type: 'win',
        target: 'DRINKING_CONTEST',
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 250 },
      { type: 'CURRENCY', id: 'CONFETTI', amount: 30 },
      { type: 'TITLE', id: 'CHAMPION_DRINKER', amount: 1 },
    ],
    repeatable: true,
    dailyLimit: 1,
  },
  {
    id: 'NY_FIREWORKS',
    name: 'Midnight Fireworks',
    description: 'Launch fireworks at midnight to celebrate the new year.',
    lore: 'Light up the sky with spectacular pyrotechnics!',
    requirements: [{ type: 'LEVEL', value: 5 }],
    objectives: [
      {
        id: 'COLLECT_FIREWORKS',
        description: 'Collect firework materials',
        type: 'collect',
        target: 'FIREWORK',
        current: 0,
        required: 10,
      },
      {
        id: 'LAUNCH_FIREWORKS',
        description: 'Launch fireworks at midnight',
        type: 'visit',
        target: 'MIDNIGHT_CELEBRATION',
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 200 },
      { type: 'CURRENCY', id: 'CONFETTI', amount: 25 },
      { type: 'XP', id: 'XP', amount: 400 },
    ],
    repeatable: false,
  },
];

export const newYearShop: HolidayShop = {
  id: 'NY_SHOP',
  name: 'New Year Supplies',
  npcName: 'Party Pete',
  currency: 'CONFETTI',
  location: 'FRONTERA_SALOON',
  items: [
    {
      itemId: 'PARTY_HAT_GOLD',
      name: 'Golden Party Hat',
      description: 'Fancy golden party hat',
      cost: 150,
      requiredLevel: 8,
    },
    {
      itemId: 'CHAMPAGNE_BOTTLE',
      name: 'Champagne Bottle',
      description: '+25 HP, +15% XP for 1 hour',
      cost: 25,
      purchaseLimit: 20,
    },
    {
      itemId: 'STAT_RESET_TOKEN',
      name: 'Stat Reset Token',
      description: 'Reset your character stats (RARE)',
      cost: 500,
      stock: 1,
      requiredLevel: 15,
    },
    {
      itemId: 'NEW_YEAR_OUTFIT',
      name: "New Year's Eve Outfit",
      description: 'Fancy celebration attire',
      cost: 200,
      requiredLevel: 10,
    },
  ],
};

export const newYearEvent: HolidayEvent = {
  id: 'NEW_YEAR_2026',
  type: 'NEW_YEAR',
  name: "Frontier New Year's Eve",
  description: 'Celebrate new beginnings with fireworks, drinking contests, and resolutions!',
  lore: 'As one year ends and another begins, the frontier looks forward with hope and ambition.',
  startDate: { month: 12, day: 30 },
  endDate: { month: 1, day: 2 },
  duration: 3,
  specialQuests: newYearQuests,
  limitedShops: [newYearShop],
  decorations: [
    {
      id: 'NY_DECORATIONS',
      name: 'New Year Banners',
      location: 'ALL_ZONES',
      type: 'BANNER',
      description: 'Happy New Year banners everywhere',
    },
  ],
  specialNPCs: [
    {
      id: 'PARTY_PETE',
      name: 'Party Pete',
      role: 'New Year Coordinator',
      location: 'FRONTERA_SALOON',
      dialogue: [
        {
          id: 'PETE_GREETING',
          text: "Happy New Year, partner! Ready to celebrate?",
        },
      ],
      quests: ['NY_NEW_BEGINNINGS'],
      shopId: 'NY_SHOP',
    },
  ],
  activities: [],
  dailyChallenges: [],
  participationRewards: [
    { type: 'ITEM', id: 'PARTY_HAT', amount: 1 },
    { type: 'CURRENCY', id: 'CONFETTI', amount: 20 },
  ],
  completionRewards: [
    { type: 'TITLE', id: 'NEW_YEAR_CHAMPION', amount: 1 },
    { type: 'ACHIEVEMENT', id: 'NEW_YEAR_COMPLETE', amount: 1 },
  ],
  exclusiveItems: [],
  limitedCosmetics: [],
  currency: 'CONFETTI',
  currencyConversionRate: 2,
  musicTheme: 'party_music',
  weatherOverride: 'FIREWORKS',
  townDecorationsEnabled: true,
  npcCostumesEnabled: true,
};

// ========================================
// VALENTINE'S DAY EVENT
// ========================================

export const valentineQuests: HolidayQuest[] = [
  {
    id: 'VAL_LOVE_LETTER',
    name: 'Secret Admirer',
    description: 'Deliver anonymous love letters for lovestruck townsfolk.',
    lore: 'Cupid has come to the frontier, and love is in the air!',
    requirements: [{ type: 'LEVEL', value: 1 }],
    objectives: [
      {
        id: 'DELIVER_LETTERS',
        description: 'Deliver 5 love letters',
        type: 'deliver',
        target: 'LOVE_LETTER',
        current: 0,
        required: 5,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 150 },
      { type: 'CURRENCY', id: 'LOVE_LETTER', amount: 15 },
      { type: 'XP', id: 'XP', amount: 300 },
    ],
    repeatable: true,
    dailyLimit: 3,
  },
  {
    id: 'VAL_ROMANTIC_GIFT',
    name: 'Perfect Gift',
    description: 'Find the perfect romantic gift for your sweetheart.',
    lore: 'Show your affection with a thoughtful present.',
    requirements: [{ type: 'LEVEL', value: 5 }],
    objectives: [
      {
        id: 'COLLECT_FLOWERS',
        description: 'Collect rare flowers',
        type: 'collect',
        target: 'ROSE',
        current: 0,
        required: 10,
      },
      {
        id: 'BUY_CHOCOLATE',
        description: 'Purchase chocolate box',
        type: 'collect',
        target: 'CHOCOLATE_BOX',
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 200 },
      { type: 'CURRENCY', id: 'LOVE_LETTER', amount: 25 },
      { type: 'ITEM', id: 'CUPID_BOW', amount: 1 },
    ],
    repeatable: false,
  },
  {
    id: 'VAL_JEALOUS_RIVAL',
    name: 'Love Triangle Drama',
    description: 'Deal with a jealous rival in a romantic dispute.',
    lore: 'Not all love stories end happily - some end in duels!',
    requirements: [{ type: 'LEVEL', value: 10 }],
    objectives: [
      {
        id: 'DUEL_RIVAL',
        description: 'Defeat jealous rival in a duel',
        type: 'kill',
        target: 'JEALOUS_RIVAL',
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 300 },
      { type: 'CURRENCY', id: 'LOVE_LETTER', amount: 40 },
      { type: 'TITLE', id: 'HEARTBREAKER', amount: 1 },
    ],
    repeatable: true,
    dailyLimit: 1,
  },
];

export const valentineShop: HolidayShop = {
  id: 'VAL_SHOP',
  name: "Cupid's Corner",
  npcName: 'Cupid',
  currency: 'LOVE_LETTER',
  location: 'FRONTERA_GENERAL_STORE',
  items: [
    {
      itemId: 'SWEETHEART_DRESS',
      name: 'Sweetheart Dress',
      description: 'Beautiful romantic dress',
      cost: 180,
      requiredLevel: 8,
    },
    {
      itemId: 'CUPID_WINGS',
      name: 'Cupid Wings',
      description: 'Decorative angel wings',
      cost: 150,
      requiredLevel: 5,
    },
    {
      itemId: 'HEART_REVOLVER',
      name: 'Heart Revolver',
      description: 'Revolver with heart engravings (+5 Charisma)',
      cost: 200,
      requiredLevel: 10,
    },
    {
      itemId: 'LOVE_POTION',
      name: 'Love Potion',
      description: '+50% Charisma for 2 hours',
      cost: 30,
      purchaseLimit: 10,
    },
  ],
};

export const valentineEvent: HolidayEvent = {
  id: 'VALENTINE_2025',
  type: 'VALENTINE',
  name: "Frontier Valentine's Day",
  description: 'Romance, rivalry, and relationships come to the Wild West!',
  lore: 'Even hardened outlaws have hearts. Celebrate love, friendship, and sometimes jealousy.',
  startDate: { month: 2, day: 12 },
  endDate: { month: 2, day: 16 },
  duration: 5,
  specialQuests: valentineQuests,
  limitedShops: [valentineShop],
  decorations: [
    {
      id: 'VAL_HEARTS',
      name: 'Heart Decorations',
      location: 'ALL_ZONES',
      type: 'BANNER',
      description: 'Pink and red hearts everywhere',
    },
  ],
  specialNPCs: [
    {
      id: 'CUPID_NPC',
      name: 'Cupid',
      role: 'Love Merchant',
      location: 'FRONTERA_GENERAL_STORE',
      dialogue: [
        {
          id: 'CUPID_GREETING',
          text: "Looking for love, or looking to break hearts?",
        },
      ],
      quests: ['VAL_LOVE_LETTER'],
      shopId: 'VAL_SHOP',
    },
  ],
  activities: [],
  dailyChallenges: [],
  participationRewards: [
    { type: 'ITEM', id: 'ROSE_BOUQUET', amount: 1 },
    { type: 'CURRENCY', id: 'LOVE_LETTER', amount: 15 },
  ],
  completionRewards: [
    { type: 'TITLE', id: 'SWEETHEART', amount: 1 },
    { type: 'ACHIEVEMENT', id: 'VALENTINE_COMPLETE', amount: 1 },
  ],
  exclusiveItems: [],
  limitedCosmetics: [],
  currency: 'LOVE_LETTER',
  currencyConversionRate: 2.5,
  musicTheme: 'romantic_music',
  townDecorationsEnabled: true,
  npcCostumesEnabled: false,
};

// ========================================
// EASTER EVENT
// ========================================

export const easterQuests: HolidayQuest[] = [
  {
    id: 'EASTER_EGG_HUNT',
    name: 'The Great Egg Hunt',
    description: 'Search for hidden Easter eggs across the frontier.',
    lore: 'Someone has hidden colorful eggs all over the territory!',
    requirements: [{ type: 'LEVEL', value: 1 }],
    objectives: [
      {
        id: 'FIND_EGGS',
        description: 'Find 25 Easter eggs',
        type: 'collect',
        target: 'EASTER_EGG',
        current: 0,
        required: 25,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 200 },
      { type: 'CURRENCY', id: 'EASTER_EGG', amount: 30 },
      { type: 'XP', id: 'XP', amount: 500 },
    ],
    repeatable: true,
    dailyLimit: 2,
  },
  {
    id: 'EASTER_JACKALOPE',
    name: 'Hunt the Legendary Jackalope',
    description: 'Track down the mythical horned rabbit.',
    lore: 'Legend speaks of a rabbit with antlers - find it for glory!',
    requirements: [{ type: 'LEVEL', value: 12 }],
    objectives: [
      {
        id: 'TRACK_JACKALOPE',
        description: 'Follow the jackalope tracks',
        type: 'visit',
        target: 'JACKALOPE_TRAIL',
        current: 0,
        required: 5,
      },
      {
        id: 'CATCH_JACKALOPE',
        description: 'Capture the jackalope',
        type: 'kill',
        target: 'JACKALOPE',
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 500 },
      { type: 'CURRENCY', id: 'EASTER_EGG', amount: 75 },
      { type: 'ITEM', id: 'JACKALOPE_ANTLER', amount: 1, rarity: 'LEGENDARY' },
      { type: 'TITLE', id: 'JACKALOPE_HUNTER', amount: 1 },
    ],
    repeatable: true,
    dailyLimit: 1,
  },
  {
    id: 'EASTER_BASKET_DELIVERY',
    name: 'Easter Basket Delivery',
    description: 'Deliver Easter baskets to children around the frontier.',
    lore: 'Bring joy to the young ones with festive baskets!',
    requirements: [{ type: 'LEVEL', value: 5 }],
    objectives: [
      {
        id: 'DELIVER_BASKETS',
        description: 'Deliver 10 Easter baskets',
        type: 'deliver',
        target: 'EASTER_BASKET',
        current: 0,
        required: 10,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 180 },
      { type: 'CURRENCY', id: 'EASTER_EGG', amount: 25 },
      { type: 'XP', id: 'XP', amount: 350 },
    ],
    repeatable: true,
    dailyLimit: 1,
  },
];

export const easterShop: HolidayShop = {
  id: 'EASTER_SHOP',
  name: 'Easter Emporium',
  npcName: 'Easter Bunny',
  currency: 'EASTER_EGG',
  location: 'FRONTERA_SQUARE',
  items: [
    {
      itemId: 'BUNNY_EARS',
      name: 'Bunny Ears Headband',
      description: 'Cute bunny ears',
      cost: 100,
      requiredLevel: 5,
    },
    {
      itemId: 'RABBIT_COSTUME',
      name: 'Rabbit Costume',
      description: 'Full bunny outfit',
      cost: 200,
      requiredLevel: 10,
    },
    {
      itemId: 'PASTEL_REVOLVER',
      name: 'Pastel Revolver',
      description: 'Spring-colored weapon (+6 Damage)',
      cost: 180,
      requiredLevel: 9,
    },
    {
      itemId: 'CHOCOLATE_EGG',
      name: 'Chocolate Egg',
      description: '+30 HP, +5% Luck for 1 hour',
      cost: 15,
      purchaseLimit: 30,
    },
  ],
};

export const jackalopeEncounter: HolidayEncounter = {
  id: 'LEGENDARY_JACKALOPE',
  holidayId: 'EASTER',
  name: 'Legendary Jackalope',
  type: 'LEGENDARY',
  level: 15,
  health: 2000,
  damage: 80,
  abilities: ['SPEED_DASH', 'HORN_CHARGE', 'CONFUSE'],
  lootTable: [
    {
      itemId: 'JACKALOPE_ANTLER',
      dropChance: 1.0,
      minQuantity: 1,
      maxQuantity: 1,
      guaranteed: true,
    },
    {
      itemId: 'EASTER_EGG',
      dropChance: 1.0,
      minQuantity: 30,
      maxQuantity: 50,
      guaranteed: true,
    },
    {
      itemId: 'RABBIT_FOOT',
      dropChance: 0.5,
      minQuantity: 1,
      maxQuantity: 1,
    },
  ],
  spawnLocations: ['PRAIRIE', 'MEADOW', 'FOREST_CLEARING'],
  spawnChance: 0.2,
  maxSpawns: 3,
};

export const easterEvent: HolidayEvent = {
  id: 'EASTER_2025',
  type: 'EASTER',
  name: 'Frontier Easter',
  description: 'Hunt eggs, chase the legendary jackalope, and celebrate springtime rebirth!',
  lore: 'Spring has come to the frontier, bringing new life and mysterious egg hunts.',
  startDate: { month: 4, day: 14 },
  endDate: { month: 4, day: 20 },
  duration: 7,
  specialQuests: easterQuests,
  limitedShops: [easterShop],
  decorations: [
    {
      id: 'EASTER_EGGS_DECOR',
      name: 'Giant Decorated Eggs',
      location: 'ALL_ZONES',
      type: 'STATUE',
      description: 'Large colorful Easter eggs',
    },
  ],
  specialNPCs: [
    {
      id: 'EASTER_BUNNY',
      name: 'Easter Bunny',
      role: 'Holiday Guide',
      location: 'FRONTERA_SQUARE',
      dialogue: [
        {
          id: 'BUNNY_GREETING',
          text: "*Friendly hop* Happy Easter, friend! Ready to hunt some eggs?",
        },
      ],
      quests: ['EASTER_EGG_HUNT'],
      shopId: 'EASTER_SHOP',
    },
  ],
  activities: [],
  dailyChallenges: [],
  participationRewards: [
    { type: 'ITEM', id: 'CHOCOLATE_EGG', amount: 5 },
    { type: 'CURRENCY', id: 'EASTER_EGG', amount: 20 },
  ],
  completionRewards: [
    { type: 'TITLE', id: 'EGG_HUNTER', amount: 1 },
    { type: 'ACHIEVEMENT', id: 'EASTER_COMPLETE', amount: 1 },
  ],
  exclusiveItems: [],
  limitedCosmetics: [],
  currency: 'EASTER_EGG',
  currencyConversionRate: 2,
  musicTheme: 'spring_music',
  weatherOverride: 'CLEAR',
  townDecorationsEnabled: true,
  npcCostumesEnabled: true,
};

// ========================================
// THANKSGIVING EVENT
// ========================================

export const thanksgivingQuests: HolidayQuest[] = [
  {
    id: 'THANKS_TURKEY_HUNT',
    name: 'Turkey Hunt',
    description: 'Hunt wild turkeys for the Thanksgiving feast.',
    lore: 'Provide meat for the community feast!',
    requirements: [{ type: 'LEVEL', value: 5 }],
    objectives: [
      {
        id: 'HUNT_TURKEYS',
        description: 'Hunt 15 wild turkeys',
        type: 'kill',
        target: 'WILD_TURKEY',
        current: 0,
        required: 15,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 250 },
      { type: 'CURRENCY', id: 'TURKEY_FEATHER', amount: 30 },
      { type: 'XP', id: 'XP', amount: 450 },
    ],
    repeatable: true,
    dailyLimit: 2,
  },
  {
    id: 'THANKS_COOKING_CONTEST',
    name: 'Thanksgiving Cooking Competition',
    description: 'Prepare the best Thanksgiving dish.',
    lore: "Show off your frontier cooking skills!",
    requirements: [{ type: 'LEVEL', value: 8 }],
    objectives: [
      {
        id: 'GATHER_INGREDIENTS',
        description: 'Collect cooking ingredients',
        type: 'collect',
        target: 'INGREDIENT',
        current: 0,
        required: 20,
      },
      {
        id: 'COOK_FEAST',
        description: 'Prepare Thanksgiving dish',
        type: 'craft',
        target: 'FEAST_DISH',
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 350 },
      { type: 'CURRENCY', id: 'TURKEY_FEATHER', amount: 50 },
      { type: 'TITLE', id: 'MASTER_CHEF', amount: 1 },
    ],
    repeatable: false,
  },
  {
    id: 'THANKS_COMMUNITY_FEAST',
    name: 'Community Feast',
    description: 'Help organize the town-wide Thanksgiving feast.',
    lore: 'Bring the community together in gratitude.',
    requirements: [{ type: 'LEVEL', value: 1 }],
    objectives: [
      {
        id: 'CONTRIBUTE_FOOD',
        description: 'Donate food to the feast',
        type: 'deliver',
        target: 'FOOD',
        current: 0,
        required: 10,
      },
      {
        id: 'ATTEND_FEAST',
        description: 'Attend the community feast',
        type: 'visit',
        target: 'FEAST_HALL',
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 200 },
      { type: 'CURRENCY', id: 'TURKEY_FEATHER', amount: 25 },
      { type: 'ITEM', id: 'FEAST_BUFF', amount: 1 },
    ],
    repeatable: false,
  },
];

export const thanksgivingShop: HolidayShop = {
  id: 'THANKS_SHOP',
  name: 'Harvest Market',
  npcName: 'Farmer Joe',
  currency: 'TURKEY_FEATHER',
  location: 'FRONTERA_MARKET',
  items: [
    {
      itemId: 'PILGRIM_HAT',
      name: 'Pilgrim Hat',
      description: 'Classic Thanksgiving headwear',
      cost: 120,
      requiredLevel: 5,
    },
    {
      itemId: 'PILGRIM_OUTFIT',
      name: 'Pilgrim Outfit',
      description: 'Full colonial costume',
      cost: 200,
      requiredLevel: 10,
    },
    {
      itemId: 'CORNUCOPIA',
      name: 'Cornucopia (Property Decoration)',
      description: 'Horn of plenty decoration',
      cost: 150,
    },
    {
      itemId: 'FEAST_BUFF_PERMANENT',
      name: 'Harvest Blessing',
      description: 'Permanent +5% to all gathering',
      cost: 400,
      stock: 1,
      requiredLevel: 15,
    },
  ],
};

export const thanksgivingEvent: HolidayEvent = {
  id: 'THANKSGIVING_2025',
  type: 'THANKSGIVING',
  name: 'Frontier Thanksgiving',
  description: 'Hunt turkeys, cook feasts, and give thanks with your community!',
  lore: 'In the harsh frontier, taking time to be grateful for survival and community is essential.',
  startDate: { month: 11, day: 23 },
  endDate: { month: 11, day: 27 },
  duration: 5,
  specialQuests: thanksgivingQuests,
  limitedShops: [thanksgivingShop],
  decorations: [
    {
      id: 'THANKS_HARVEST',
      name: 'Harvest Decorations',
      location: 'ALL_ZONES',
      type: 'BANNER',
      description: 'Cornucopias and autumn leaves',
    },
  ],
  specialNPCs: [
    {
      id: 'FARMER_JOE',
      name: 'Farmer Joe',
      role: 'Harvest Coordinator',
      location: 'FRONTERA_MARKET',
      dialogue: [
        {
          id: 'JOE_GREETING',
          text: "Happy Thanksgiving! Time to feast and be grateful!",
        },
      ],
      quests: ['THANKS_TURKEY_HUNT'],
      shopId: 'THANKS_SHOP',
    },
  ],
  activities: [],
  dailyChallenges: [],
  participationRewards: [
    { type: 'ITEM', id: 'TURKEY_DINNER', amount: 1 },
    { type: 'CURRENCY', id: 'TURKEY_FEATHER', amount: 15 },
  ],
  completionRewards: [
    { type: 'TITLE', id: 'GRATEFUL', amount: 1 },
    { type: 'ACHIEVEMENT', id: 'THANKSGIVING_COMPLETE', amount: 1 },
  ],
  exclusiveItems: [],
  limitedCosmetics: [],
  currency: 'TURKEY_FEATHER',
  currencyConversionRate: 2,
  musicTheme: 'harvest_music',
  townDecorationsEnabled: true,
  npcCostumesEnabled: false,
};
