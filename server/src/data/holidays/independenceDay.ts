/**
 * Independence Day Holiday Event
 * July 4 - 7 Days
 * Theme: Freedom, patriotism, conflict
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
} from '@desperados/shared';

export const independenceDayQuests: HolidayQuest[] = [
  {
    id: 'JULY4_CELEBRATION',
    name: 'Independence Celebration',
    description: 'Join the Fourth of July festivities in Frontera.',
    lore: 'The frontier celebrates freedom and independence with fireworks, competitions, and patriotic fervor!',
    requirements: [{ type: 'LEVEL', value: 1 }],
    objectives: [
      {
        id: 'ATTEND_CEREMONY',
        description: 'Attend the Independence Day ceremony',
        type: 'visit',
        target: 'TOWN_SQUARE',
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 100 },
      { type: 'CURRENCY', id: 'PATRIOT_TOKEN', amount: 10 },
      { type: 'ITEM', id: 'AMERICAN_FLAG', amount: 1 },
    ],
    repeatable: false,
  },
  {
    id: 'JULY4_FIREWORKS_SHOW',
    name: 'Fireworks Spectacular',
    description: 'Help set up and launch the grand fireworks display.',
    lore: 'The biggest fireworks show the frontier has ever seen!',
    requirements: [{ type: 'QUEST_COMPLETED', value: 'JULY4_CELEBRATION' }],
    objectives: [
      {
        id: 'COLLECT_FIREWORKS',
        description: 'Collect firework supplies',
        type: 'collect',
        target: 'FIREWORK',
        current: 0,
        required: 20,
      },
      {
        id: 'LAUNCH_DISPLAY',
        description: 'Launch the fireworks display',
        type: 'visit',
        target: 'LAUNCH_SITE',
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 250 },
      { type: 'CURRENCY', id: 'PATRIOT_TOKEN', amount: 30 },
      { type: 'ITEM', id: 'FIREWORK_LAUNCHER', amount: 1 },
    ],
    repeatable: true,
    dailyLimit: 2,
  },
  {
    id: 'JULY4_SHOOTING_CONTEST',
    name: 'Marksman Competition',
    description: 'Compete in the Independence Day shooting contest.',
    lore: 'Prove your skill with a rifle in the annual marksmanship tournament!',
    requirements: [{ type: 'LEVEL', value: 10 }],
    objectives: [
      {
        id: 'HIT_TARGETS',
        description: 'Hit 50 targets',
        type: 'collect',
        target: 'TARGET_HIT',
        current: 0,
        required: 50,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 400 },
      { type: 'CURRENCY', id: 'PATRIOT_TOKEN', amount: 50 },
      { type: 'ITEM', id: 'EAGLE_RIFLE', amount: 1, rarity: 'EPIC' },
      { type: 'TITLE', id: 'SHARPSHOOTER', amount: 1 },
    ],
    repeatable: false,
  },
  {
    id: 'JULY4_FACTION_BATTLE',
    name: 'Faction War Games',
    description: 'Represent your faction in the Independence Day war games.',
    lore: 'Settlers, Frontera Coalition, and Nahi tribes compete for glory!',
    requirements: [
      { type: 'LEVEL', value: 15 },
      { type: 'GANG', value: 'ANY' },
    ],
    objectives: [
      {
        id: 'WIN_BATTLES',
        description: 'Win 10 faction battles',
        type: 'win',
        target: 'FACTION_BATTLE',
        current: 0,
        required: 10,
      },
      {
        id: 'CAPTURE_FLAG',
        description: 'Capture 3 enemy flags',
        type: 'collect',
        target: 'ENEMY_FLAG',
        current: 0,
        required: 3,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 600 },
      { type: 'CURRENCY', id: 'PATRIOT_TOKEN', amount: 75 },
      { type: 'ACHIEVEMENT', id: 'WAR_HERO', amount: 1 },
    ],
    repeatable: true,
    dailyLimit: 1,
  },
  {
    id: 'JULY4_RODEO',
    name: 'Independence Rodeo',
    description: 'Compete in bull riding and bronco busting.',
    lore: 'Test your courage in the most dangerous sport on the frontier!',
    requirements: [{ type: 'LEVEL', value: 8 }],
    objectives: [
      {
        id: 'RIDE_BULL',
        description: 'Successfully ride a bull for 8 seconds',
        type: 'win',
        target: 'BULL_RIDE',
        current: 0,
        required: 3,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 300 },
      { type: 'CURRENCY', id: 'PATRIOT_TOKEN', amount: 40 },
      { type: 'TITLE', id: 'RODEO_CHAMPION', amount: 1 },
    ],
    repeatable: true,
    dailyLimit: 1,
  },
  {
    id: 'JULY4_BBQ_COOKOFF',
    name: 'Great American BBQ',
    description: 'Compete in the Independence Day cooking competition.',
    lore: "Show off your frontier cooking skills with America's finest BBQ!",
    requirements: [{ type: 'LEVEL', value: 5 }],
    objectives: [
      {
        id: 'COLLECT_INGREDIENTS',
        description: 'Gather BBQ ingredients',
        type: 'collect',
        target: 'BBQ_INGREDIENT',
        current: 0,
        required: 15,
      },
      {
        id: 'COOK_MEAL',
        description: 'Prepare and submit your BBQ dish',
        type: 'craft',
        target: 'BBQ_DISH',
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 200 },
      { type: 'CURRENCY', id: 'PATRIOT_TOKEN', amount: 35 },
      { type: 'ITEM', id: 'GOLDEN_SPATULA', amount: 1 },
    ],
    repeatable: false,
  },
];

export const independenceDayShop: HolidayShop = {
  id: 'JULY4_SHOP',
  name: 'Patriot Supplies',
  npcName: 'Uncle Sam',
  currency: 'PATRIOT_TOKEN',
  location: 'FRONTERA_SQUARE',
  items: [
    {
      itemId: 'UNCLE_SAM_OUTFIT',
      name: 'Uncle Sam Costume',
      description: 'Red, white, and blue patriotic outfit',
      cost: 200,
      requiredLevel: 10,
    },
    {
      itemId: 'BETSY_ROSS_DRESS',
      name: 'Betsy Ross Dress',
      description: 'Colonial-era patriotic dress',
      cost: 180,
      requiredLevel: 8,
    },
    {
      itemId: 'CONTINENTAL_UNIFORM',
      name: 'Continental Army Uniform',
      description: 'Revolutionary War soldier outfit',
      cost: 220,
      requiredLevel: 12,
    },
    {
      itemId: 'EAGLE_MOUNT_SKIN',
      name: 'Bald Eagle Mount Skin',
      description: 'Make your horse soar like an eagle',
      cost: 300,
      stock: 1,
      requiredLevel: 15,
    },
    {
      itemId: 'LIBERTY_RIFLE',
      name: 'Liberty Rifle',
      description: 'Rifle engraved with "FREEDOM" (+10 Damage, +5 Accuracy)',
      cost: 250,
      requiredLevel: 12,
    },
    {
      itemId: 'FREEDOM_REVOLVER',
      name: 'Freedom Revolver',
      description: 'Star-spangled revolver (+8 Damage)',
      cost: 200,
      requiredLevel: 10,
    },
    {
      itemId: 'PATRIOT_ARMOR',
      name: 'Patriot Armor',
      description: 'Red, white, and blue armor plating (+15 Defense)',
      cost: 220,
      requiredLevel: 11,
    },
    {
      itemId: 'STAR_SPANGLED_HAT',
      name: 'Star-Spangled Hat',
      description: 'American flag top hat (+5 Charisma)',
      cost: 100,
      requiredLevel: 5,
    },
    {
      itemId: 'FIREWORK_PACK',
      name: 'Firework Pack',
      description: 'Launch celebratory fireworks',
      cost: 50,
      purchaseLimit: 20,
    },
    {
      itemId: 'APPLE_PIE',
      name: 'American Apple Pie',
      description: '+50 HP, +10% Gold for 1 hour',
      cost: 20,
    },
    {
      itemId: 'PATRIOT_WHISKEY',
      name: 'Patriot Whiskey',
      description: '+20% Damage for 30 minutes',
      cost: 30,
      purchaseLimit: 10,
    },
  ],
};

export const independenceDayNPCs: HolidayNPC[] = [
  {
    id: 'UNCLE_SAM',
    name: 'Uncle Sam',
    role: 'Patriotic Recruiter',
    location: 'FRONTERA_SQUARE',
    dialogue: [
      {
        id: 'SAM_GREETING',
        text: "I WANT YOU... to celebrate Independence Day! Are you ready to show your patriotic spirit, partner?",
        responses: [
          {
            text: "Let's do this!",
            action: 'GIVE_QUEST',
          },
          {
            text: "What's the celebration about?",
            nextDialogue: 'SAM_LORE',
          },
        ],
      },
      {
        id: 'SAM_LORE',
        text: "On July 4th, 1776, America declared its independence! We celebrate freedom, courage, and the frontier spirit!",
      },
    ],
    quests: ['JULY4_CELEBRATION', 'JULY4_FIREWORKS_SHOW'],
    shopId: 'JULY4_SHOP',
  },
  {
    id: 'GENERAL_WASHINGTON',
    name: 'General Washington (Actor)',
    role: 'War Games Coordinator',
    location: 'MILITARY_CAMP',
    dialogue: [
      {
        id: 'WASH_GREETING',
        text: "Greetings, soldier! Care to test your mettle in the war games?",
      },
    ],
    quests: ['JULY4_FACTION_BATTLE'],
  },
  {
    id: 'RODEO_ANNOUNCER',
    name: 'Buck Bronson',
    role: 'Rodeo Master',
    location: 'RODEO_ARENA',
    dialogue: [
      {
        id: 'BUCK_GREETING',
        text: "Howdy, cowpoke! Think you can handle the meanest bulls in the territory?",
      },
    ],
    quests: ['JULY4_RODEO'],
  },
];

export const independenceDayActivities: HolidayActivity[] = [
  {
    id: 'FIREWORKS_DISPLAY',
    name: 'Grand Fireworks Display',
    type: 'SOCIAL',
    description: 'Watch the spectacular fireworks show',
    duration: 20,
    rewards: [
      { type: 'CURRENCY', id: 'PATRIOT_TOKEN', amount: 20 },
      { type: 'XP', id: 'XP', amount: 200 },
    ],
    startTimes: ['21:00'],
  },
  {
    id: 'SHOOTING_TOURNAMENT',
    name: 'Sharpshooter Tournament',
    type: 'CONTEST',
    description: 'Compete for the best shooting score',
    duration: 30,
    maxParticipants: 20,
    rewards: [
      { type: 'CURRENCY', id: 'PATRIOT_TOKEN', amount: 60 },
      { type: 'TITLE', id: 'MARKSMAN', amount: 1 },
    ],
    startTimes: ['12:00', '18:00'],
  },
  {
    id: 'BULL_RIDING',
    name: 'Bull Riding Competition',
    type: 'CONTEST',
    description: 'See who can stay on the longest',
    duration: 45,
    maxParticipants: 12,
    rewards: [
      { type: 'CURRENCY', id: 'PATRIOT_TOKEN', amount: 50 },
    ],
    startTimes: ['14:00', '19:00'],
    requirements: [{ type: 'LEVEL', value: 8 }],
  },
  {
    id: 'CAPTURE_THE_FLAG',
    name: 'Capture the Flag',
    type: 'COMBAT',
    description: 'Faction-based capture the flag battle',
    duration: 40,
    maxParticipants: 30,
    rewards: [
      { type: 'CURRENCY', id: 'PATRIOT_TOKEN', amount: 70 },
    ],
    startTimes: ['15:00', '20:00'],
    requirements: [
      { type: 'LEVEL', value: 12 },
      { type: 'GANG', value: 'ANY' },
    ],
  },
];

export const independenceDayChallenges: HolidayDailyChallenge[] = [
  {
    id: 'DAILY_MARKSMAN',
    name: 'Daily Marksman',
    description: 'Hit 30 targets',
    objective: {
      id: 'HIT_TARGETS',
      description: 'Shoot targets accurately',
      type: 'collect',
      target: 'TARGET_HIT',
      current: 0,
      required: 30,
    },
    reward: { type: 'CURRENCY', id: 'PATRIOT_TOKEN', amount: 25 },
    difficulty: 'EASY',
  },
  {
    id: 'DAILY_PATRIOT',
    name: 'Patriotic Duty',
    description: 'Participate in 3 faction battles',
    objective: {
      id: 'BATTLE_COUNT',
      description: 'Join battles',
      type: 'win',
      target: 'FACTION_BATTLE',
      current: 0,
      required: 3,
    },
    reward: { type: 'CURRENCY', id: 'PATRIOT_TOKEN', amount: 40 },
    difficulty: 'MEDIUM',
  },
  {
    id: 'DAILY_RODEO_MASTER',
    name: 'Rodeo Master',
    description: 'Successfully ride 5 bulls',
    objective: {
      id: 'RIDE_BULLS',
      description: 'Complete bull rides',
      type: 'win',
      target: 'BULL_RIDE',
      current: 0,
      required: 5,
    },
    reward: { type: 'CURRENCY', id: 'PATRIOT_TOKEN', amount: 50 },
    difficulty: 'HARD',
  },
];

export const independenceDayDecorations: Decoration[] = [
  {
    id: 'AMERICAN_FLAGS',
    name: 'American Flags',
    location: 'ALL_ZONES',
    type: 'BANNER',
    description: 'Stars and stripes flying proudly',
  },
  {
    id: 'BUNTING_DECORATIONS',
    name: 'Patriotic Bunting',
    location: 'ALL_BUILDINGS',
    type: 'BANNER',
    description: 'Red, white, and blue bunting on buildings',
  },
  {
    id: 'FIREWORK_EFFECTS',
    name: 'Fireworks in Sky',
    location: 'SKY',
    type: 'EFFECTS',
    description: 'Periodic fireworks throughout the day',
  },
  {
    id: 'LIBERTY_STATUE',
    name: 'Statue of Liberty Replica',
    location: 'FRONTERA_SQUARE',
    type: 'STATUE',
    description: 'Miniature Lady Liberty statue',
  },
];

export const independenceDayItems: HolidayItem[] = [
  {
    id: 'AMERICAN_FLAG',
    name: 'American Flag',
    description: 'Stars and Stripes banner',
    type: 'DECORATION',
    tradeable: true,
    expiresAfterEvent: false,
  },
  {
    id: 'LIBERTY_RIFLE',
    name: 'Liberty Rifle',
    description: 'Freedom-engraved rifle',
    type: 'WEAPON',
    slot: 'PRIMARY',
    stats: { damage: 10, accuracy: 5 },
    tradeable: false,
    expiresAfterEvent: false,
  },
  {
    id: 'EAGLE_RIFLE',
    name: 'Eagle Rifle',
    description: 'Rifle with eagle engravings',
    type: 'WEAPON',
    slot: 'PRIMARY',
    stats: { damage: 15, accuracy: 8 },
    tradeable: false,
    expiresAfterEvent: false,
  },
  {
    id: 'PATRIOT_ARMOR',
    name: 'Patriot Armor',
    description: 'Red, white, and blue armor',
    type: 'CLOTHING',
    slot: 'CHEST',
    stats: { defense: 15 },
    tradeable: false,
    expiresAfterEvent: false,
  },
  {
    id: 'APPLE_PIE',
    name: 'American Apple Pie',
    description: 'As American as it gets',
    type: 'CONSUMABLE',
    effects: [
      { type: 'HEAL', value: 50 },
      { type: 'GOLD_BOOST', value: 10, duration: 60 },
    ],
    tradeable: true,
    expiresAfterEvent: true,
  },
];

export const independenceDayCosmetics: Cosmetic[] = [
  {
    id: 'UNCLE_SAM_OUTFIT',
    name: 'Uncle Sam Costume',
    description: 'Iconic patriotic outfit',
    slot: 'OUTFIT',
    rarity: 'EPIC',
    exclusive: true,
  },
  {
    id: 'CONTINENTAL_UNIFORM',
    name: 'Continental Army Uniform',
    description: 'Revolutionary War uniform',
    slot: 'OUTFIT',
    rarity: 'RARE',
    exclusive: true,
  },
  {
    id: 'EAGLE_MOUNT',
    name: 'Bald Eagle Mount Skin',
    description: 'Patriotic eagle mount appearance',
    slot: 'MOUNT_SKIN',
    rarity: 'LEGENDARY',
    exclusive: true,
  },
  {
    id: 'BETSY_ROSS_DRESS',
    name: 'Betsy Ross Dress',
    description: 'Colonial-era dress',
    slot: 'OUTFIT',
    rarity: 'RARE',
    exclusive: true,
  },
];

export const independenceDayEvent: HolidayEvent = {
  id: 'JULY4_2025',
  type: 'INDEPENDENCE_DAY',
  name: 'Frontier Independence',
  description: 'Celebrate freedom with shooting contests, rodeos, faction battles, and spectacular fireworks!',
  lore: 'The frontier celebrates the birth of a nation with competitions, courage, and community. Choose your faction and fight for glory!',

  // Timing
  startDate: { month: 7, day: 1 },
  endDate: { month: 7, day: 7 },
  duration: 7,

  // Content
  specialQuests: independenceDayQuests,
  limitedShops: [independenceDayShop],
  decorations: independenceDayDecorations,
  specialNPCs: independenceDayNPCs,

  // Activities
  activities: independenceDayActivities,
  dailyChallenges: independenceDayChallenges,

  // Rewards
  participationRewards: [
    { type: 'ITEM', id: 'AMERICAN_FLAG', amount: 1 },
    { type: 'CURRENCY', id: 'PATRIOT_TOKEN', amount: 20 },
  ],
  completionRewards: [
    { type: 'TITLE', id: 'PATRIOT', amount: 1 },
    { type: 'COSMETIC', id: 'UNCLE_SAM_OUTFIT', amount: 1 },
    { type: 'ACHIEVEMENT', id: 'INDEPENDENCE_HERO', amount: 1 },
  ],
  exclusiveItems: independenceDayItems,
  limitedCosmetics: independenceDayCosmetics,

  // Currency
  currency: 'PATRIOT_TOKEN',
  currencyConversionRate: 3, // 1 token = 3 gold after event

  // Atmosphere
  musicTheme: 'patriotic_march',
  weatherOverride: 'CLEAR',
  skyboxOverride: 'clear_blue',
  townDecorationsEnabled: true,
  npcCostumesEnabled: true,
};
