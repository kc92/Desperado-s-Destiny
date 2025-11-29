/**
 * Halloween Holiday Event
 * October 31 - 10 Days
 * Theme: Horror, supernatural
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

export const halloweenQuests: HolidayQuest[] = [
  {
    id: 'HWEEN_MYSTERIOUS_STRANGER',
    name: 'The Mysterious Stranger',
    description: 'Investigate reports of a strange figure in black appearing at midnight.',
    lore: 'On All Hallows Eve, the veil between worlds grows thin...',
    requirements: [{ type: 'LEVEL', value: 1 }],
    objectives: [
      {
        id: 'FIND_STRANGER',
        description: 'Find the mysterious stranger in Frontera',
        type: 'visit',
        target: 'HALLOWEEN_MERCHANT',
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 100 },
      { type: 'CURRENCY', id: 'CANDY_CORN', amount: 15 },
      { type: 'ITEM', id: 'PUMPKIN_HEAD', amount: 1 },
    ],
    repeatable: false,
  },
  {
    id: 'HWEEN_PUMPKIN_HUNT',
    name: 'The Great Pumpkin Hunt',
    description: 'Collect magical pumpkins scattered across the frontier.',
    lore: 'Strange glowing pumpkins have appeared throughout the territory. Collect them for rewards!',
    requirements: [{ type: 'LEVEL', value: 5 }],
    objectives: [
      {
        id: 'COLLECT_PUMPKINS',
        description: 'Collect 20 magical pumpkins',
        type: 'collect',
        target: 'MAGIC_PUMPKIN',
        current: 0,
        required: 20,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 200 },
      { type: 'CURRENCY', id: 'CANDY_CORN', amount: 30 },
      { type: 'XP', id: 'XP', amount: 500 },
    ],
    repeatable: true,
    dailyLimit: 3,
  },
  {
    id: 'HWEEN_HAUNTED_MINE',
    name: 'Cleanse the Haunted Mine',
    description: 'The old mine is overrun with undead. Clear them out!',
    lore: 'Miners who died in the cave-in have risen from their graves...',
    requirements: [{ type: 'LEVEL', value: 10 }],
    objectives: [
      {
        id: 'KILL_ZOMBIES',
        description: 'Defeat 25 zombie miners',
        type: 'kill',
        target: 'ZOMBIE_MINER',
        current: 0,
        required: 25,
      },
      {
        id: 'KILL_GHOST',
        description: 'Defeat the Mine Ghost',
        type: 'kill',
        target: 'MINE_GHOST',
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 400 },
      { type: 'CURRENCY', id: 'CANDY_CORN', amount: 50 },
      { type: 'ITEM', id: 'GHOSTLY_PICKAXE', amount: 1, rarity: 'RARE' },
    ],
    repeatable: true,
    dailyLimit: 1,
  },
  {
    id: 'HWEEN_HEADLESS_HORSEMAN',
    name: 'The Headless Horseman Rides',
    description: 'A headless rider has been terrorizing travelers. Stop him!',
    lore: 'Legend speaks of a Confederate soldier who lost his head to a cannonball. Now he rides seeking vengeance.',
    requirements: [
      { type: 'LEVEL', value: 15 },
      { type: 'QUEST_COMPLETED', value: 'HWEEN_MYSTERIOUS_STRANGER' },
    ],
    objectives: [
      {
        id: 'DEFEAT_HORSEMAN',
        description: 'Defeat the Headless Horseman',
        type: 'kill',
        target: 'HEADLESS_HORSEMAN',
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 750 },
      { type: 'CURRENCY', id: 'CANDY_CORN', amount: 100 },
      { type: 'ITEM', id: 'HORSEMAN_SWORD', amount: 1, rarity: 'LEGENDARY' },
      { type: 'TITLE', id: 'HORSEMAN_SLAYER', amount: 1 },
    ],
    repeatable: true,
    dailyLimit: 1,
  },
  {
    id: 'HWEEN_COSTUME_CONTEST',
    name: 'Costume Contest Entry',
    description: 'Enter the Halloween costume contest for amazing prizes.',
    lore: 'Show off your most creative or terrifying costume!',
    requirements: [{ type: 'LEVEL', value: 5 }],
    objectives: [
      {
        id: 'WEAR_COSTUME',
        description: 'Equip a Halloween costume',
        type: 'collect',
        target: 'HALLOWEEN_COSTUME',
        current: 0,
        required: 1,
      },
      {
        id: 'SUBMIT_ENTRY',
        description: 'Submit your costume for judging',
        type: 'visit',
        target: 'CONTEST_JUDGE',
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'CURRENCY', id: 'CANDY_CORN', amount: 25 },
      { type: 'ITEM', id: 'PARTICIPATION_TROPHY', amount: 1 },
    ],
    repeatable: false,
  },
  {
    id: 'HWEEN_VAMPIRE_HUNT',
    name: 'Vampire in the Saloon',
    description: 'A vampire has been preying on drunken patrons. Hunt him down.',
    lore: 'Bloodless bodies have been found near the saloon...',
    requirements: [
      { type: 'LEVEL', value: 12 },
      { type: 'ITEM', value: 'WOODEN_STAKE', amount: 1 },
    ],
    objectives: [
      {
        id: 'TRACK_VAMPIRE',
        description: 'Follow the blood trail',
        type: 'visit',
        target: 'VAMPIRE_LAIR',
        current: 0,
        required: 1,
      },
      {
        id: 'KILL_VAMPIRE',
        description: 'Defeat the vampire with a wooden stake',
        type: 'kill',
        target: 'VAMPIRE',
        current: 0,
        required: 1,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 500 },
      { type: 'CURRENCY', id: 'CANDY_CORN', amount: 60 },
      { type: 'ITEM', id: 'VAMPIRE_FANGS', amount: 1, rarity: 'RARE' },
    ],
    repeatable: true,
    dailyLimit: 1,
  },
  {
    id: 'HWEEN_TRICK_OR_TREAT',
    name: 'Frontier Trick or Treat',
    description: 'Visit NPCs around town for tricks or treats.',
    lore: 'The Halloween tradition has come to the frontier!',
    requirements: [{ type: 'LEVEL', value: 1 }],
    objectives: [
      {
        id: 'VISIT_NPCS',
        description: 'Trick-or-treat at 15 locations',
        type: 'visit',
        target: 'TOT_LOCATION',
        current: 0,
        required: 15,
      },
    ],
    rewards: [
      { type: 'GOLD', id: 'GOLD', amount: 150 },
      { type: 'CURRENCY', id: 'CANDY_CORN', amount: 40 },
      { type: 'ITEM', id: 'CANDY_BAG', amount: 1 },
    ],
    repeatable: true,
    dailyLimit: 1,
  },
];

export const halloweenShop: HolidayShop = {
  id: 'HWEEN_SHOP',
  name: "The Stranger's Emporium",
  npcName: 'The Mysterious Stranger',
  currency: 'CANDY_CORN',
  location: 'FRONTERA_CEMETERY',
  items: [
    {
      itemId: 'VAMPIRE_COSTUME',
      name: 'Vampire Costume',
      description: 'Classic vampire outfit with cape',
      cost: 200,
      requiredLevel: 10,
    },
    {
      itemId: 'SKELETON_COSTUME',
      name: 'Skeleton Costume',
      description: 'Bone-chilling skeleton suit',
      cost: 180,
      requiredLevel: 8,
    },
    {
      itemId: 'WITCH_COSTUME',
      name: 'Witch Outfit',
      description: 'Complete witch attire with pointed hat',
      cost: 200,
      requiredLevel: 10,
    },
    {
      itemId: 'WEREWOLF_COSTUME',
      name: 'Werewolf Costume',
      description: 'Transform into a fearsome beast',
      cost: 250,
      requiredLevel: 12,
    },
    {
      itemId: 'HEADLESS_MOUNT_SKIN',
      name: 'Spectral Horse Skin',
      description: 'Ghostly pale horse with glowing eyes',
      cost: 300,
      stock: 1,
      requiredLevel: 15,
    },
    {
      itemId: 'CURSED_REVOLVER',
      name: 'Cursed Revolver',
      description: 'Fires spectral bullets (+8 Damage, +3 Accuracy)',
      cost: 250,
      requiredLevel: 12,
    },
    {
      itemId: 'BONE_RIFLE',
      name: 'Bone Rifle',
      description: 'Rifle made from cursed bones (+10 Damage)',
      cost: 275,
      requiredLevel: 14,
    },
    {
      itemId: 'WITCH_HAT',
      name: "Witch's Hat",
      description: 'Pointed black hat (+5 Luck)',
      cost: 100,
      requiredLevel: 5,
    },
    {
      itemId: 'JACK_O_LANTERN',
      name: "Jack-O'-Lantern",
      description: 'Glowing pumpkin head accessory',
      cost: 120,
      requiredLevel: 5,
    },
    {
      itemId: 'WOODEN_STAKE',
      name: 'Wooden Stake',
      description: 'Essential for vampire hunting',
      cost: 50,
    },
    {
      itemId: 'HOLY_WATER',
      name: 'Holy Water',
      description: 'Damages undead enemies',
      cost: 30,
      purchaseLimit: 20,
    },
    {
      itemId: 'CANDY_CORN_BAG',
      name: 'Bag of Candy Corn',
      description: '+10 HP, +5% XP for 30 minutes',
      cost: 15,
    },
  ],
};

export const halloweenNPCs: HolidayNPC[] = [
  {
    id: 'MYSTERIOUS_STRANGER',
    name: 'The Mysterious Stranger',
    role: 'Halloween Merchant',
    location: 'FRONTERA_CEMETERY',
    dialogue: [
      {
        id: 'STRANGER_GREETING',
        text: 'Welcome, mortal. On this night, the barrier between life and death is at its weakest. What do you seek?',
        responses: [
          {
            text: 'What are you selling?',
            action: 'OPEN_SHOP',
          },
          {
            text: 'Tell me about Halloween.',
            nextDialogue: 'STRANGER_LORE',
          },
          {
            text: "You're a bit spooky...",
            nextDialogue: 'STRANGER_LAUGH',
          },
        ],
      },
      {
        id: 'STRANGER_LORE',
        text: 'Halloween is when the spirits walk among us. The dead remember the living, and sometimes... they return.',
      },
      {
        id: 'STRANGER_LAUGH',
        text: '*A hollow laugh echoes* Spooky? You have no idea, friend...',
      },
    ],
    quests: ['HWEEN_MYSTERIOUS_STRANGER'],
    shopId: 'HWEEN_SHOP',
  },
  {
    id: 'OLD_WITCH',
    name: 'Granny Blackwood',
    role: 'Town Witch',
    location: 'SWAMP_HUT',
    dialogue: [
      {
        id: 'WITCH_GREETING',
        text: 'Hehehehe... what brings you to my humble abode, dearie?',
      },
    ],
    quests: ['HWEEN_VAMPIRE_HUNT'],
  },
  {
    id: 'GHOST_MINER',
    name: 'Spectral Miner',
    role: 'Haunted Mine Guide',
    location: 'HAUNTED_MINE',
    dialogue: [
      {
        id: 'GHOST_GREETING',
        text: '*Translucent figure* Help us... find peace...',
      },
    ],
    quests: ['HWEEN_HAUNTED_MINE'],
  },
];

export const halloweenActivities: HolidayActivity[] = [
  {
    id: 'COSTUME_CONTEST',
    name: 'Halloween Costume Contest',
    type: 'CONTEST',
    description: 'Show off your best costume for prizes',
    duration: 60,
    rewards: [
      { type: 'CURRENCY', id: 'CANDY_CORN', amount: 100 },
      { type: 'TITLE', id: 'COSTUME_KING', amount: 1 },
    ],
    startTimes: ['19:00'],
  },
  {
    id: 'HAUNTED_MAZE',
    name: 'Haunted Corn Maze',
    type: 'HUNT',
    description: 'Navigate the terrifying corn maze and find the exit',
    duration: 20,
    maxParticipants: 10,
    rewards: [
      { type: 'CURRENCY', id: 'CANDY_CORN', amount: 40 },
    ],
  },
  {
    id: 'MONSTER_HUNT',
    name: 'Midnight Monster Hunt',
    type: 'COMBAT',
    description: 'Hunt down special Halloween monsters',
    duration: 45,
    rewards: [
      { type: 'CURRENCY', id: 'CANDY_CORN', amount: 60 },
      { type: 'ITEM', id: 'MONSTER_TROPHY', amount: 1 },
    ],
    startTimes: ['00:00', '20:00', '22:00'],
    requirements: [{ type: 'LEVEL', value: 10 }],
  },
  {
    id: 'PUMPKIN_CARVING',
    name: 'Pumpkin Carving Contest',
    type: 'CONTEST',
    description: 'Create the best jack-o-lantern',
    duration: 30,
    rewards: [
      { type: 'CURRENCY', id: 'CANDY_CORN', amount: 35 },
    ],
  },
];

export const halloweenChallenges: HolidayDailyChallenge[] = [
  {
    id: 'DAILY_UNDEAD_SLAYER',
    name: 'Undead Slayer',
    description: 'Defeat 10 undead enemies',
    objective: {
      id: 'KILL_UNDEAD',
      description: 'Kill undead creatures',
      type: 'kill',
      target: 'UNDEAD',
      current: 0,
      required: 10,
    },
    reward: { type: 'CURRENCY', id: 'CANDY_CORN', amount: 30 },
    difficulty: 'MEDIUM',
  },
  {
    id: 'DAILY_PUMPKIN_COLLECTOR',
    name: 'Pumpkin Collector',
    description: 'Collect 15 magical pumpkins',
    objective: {
      id: 'COLLECT_PUMPKINS',
      description: 'Gather pumpkins',
      type: 'collect',
      target: 'MAGIC_PUMPKIN',
      current: 0,
      required: 15,
    },
    reward: { type: 'CURRENCY', id: 'CANDY_CORN', amount: 25 },
    difficulty: 'EASY',
  },
  {
    id: 'DAILY_HORSEMAN',
    name: 'Face Your Fear',
    description: 'Defeat the Headless Horseman',
    objective: {
      id: 'KILL_HORSEMAN',
      description: 'Defeat the legendary rider',
      type: 'kill',
      target: 'HEADLESS_HORSEMAN',
      current: 0,
      required: 1,
    },
    reward: { type: 'CURRENCY', id: 'CANDY_CORN', amount: 75 },
    difficulty: 'HARD',
  },
];

export const halloweenDecorations: Decoration[] = [
  {
    id: 'CEMETERY_FOG',
    name: 'Eerie Fog',
    location: 'FRONTERA_CEMETERY',
    type: 'EFFECTS',
    description: 'Thick supernatural fog blankets the graveyard',
  },
  {
    id: 'JACK_O_LANTERNS',
    name: 'Jack-O-Lanterns',
    location: 'ALL_ZONES',
    type: 'LIGHTS',
    description: 'Glowing carved pumpkins line the streets',
  },
  {
    id: 'HANGING_GHOSTS',
    name: 'Ghost Decorations',
    location: 'MAIN_STREET',
    type: 'BANNER',
    description: 'Ghostly figures hanging from buildings',
  },
  {
    id: 'SPIDER_WEBS',
    name: 'Giant Spider Webs',
    location: 'ALL_BUILDINGS',
    type: 'EFFECTS',
    description: 'Massive webs covering doorways and windows',
  },
  {
    id: 'BLOOD_MOON',
    name: 'Blood Moon',
    location: 'SKY',
    type: 'EFFECTS',
    description: 'The moon glows crimson red',
  },
];

export const halloweenItems: HolidayItem[] = [
  {
    id: 'PUMPKIN_HEAD',
    name: 'Pumpkin Head',
    description: 'Carved pumpkin worn as a mask',
    type: 'CLOTHING',
    slot: 'HAT',
    stats: { intimidation: 5 },
    tradeable: true,
    expiresAfterEvent: false,
  },
  {
    id: 'CURSED_REVOLVER',
    name: 'Cursed Revolver',
    description: 'Fires spectral bullets',
    type: 'WEAPON',
    slot: 'SECONDARY',
    stats: { damage: 8, accuracy: 3 },
    effects: [{ type: 'SPECTRAL_DAMAGE', value: 10 }],
    tradeable: false,
    expiresAfterEvent: false,
  },
  {
    id: 'HORSEMAN_SWORD',
    name: "Headless Horseman's Sword",
    description: 'Legendary blade of the fallen rider',
    type: 'WEAPON',
    slot: 'MELEE',
    stats: { damage: 25, speed: 8 },
    effects: [{ type: 'LIFE_STEAL', value: 5 }],
    tradeable: true,
    expiresAfterEvent: false,
  },
  {
    id: 'VAMPIRE_FANGS',
    name: 'Vampire Fangs',
    description: 'Trophy from a slain vampire',
    type: 'ACCESSORY',
    stats: { charisma: 3 },
    effects: [{ type: 'HEALTH_REGEN', value: 2 }],
    tradeable: true,
    expiresAfterEvent: false,
  },
  {
    id: 'CANDY_CORN_BAG',
    name: 'Bag of Candy Corn',
    description: 'Sweet Halloween treat',
    type: 'CONSUMABLE',
    effects: [
      { type: 'HEAL', value: 10 },
      { type: 'XP_BOOST', value: 5, duration: 30 },
    ],
    tradeable: true,
    expiresAfterEvent: true,
  },
];

export const halloweenCosmetics: Cosmetic[] = [
  {
    id: 'VAMPIRE_COSTUME',
    name: 'Vampire Costume',
    description: 'Classic Dracula-style vampire outfit',
    slot: 'OUTFIT',
    rarity: 'EPIC',
    exclusive: true,
  },
  {
    id: 'WEREWOLF_COSTUME',
    name: 'Werewolf Costume',
    description: 'Fearsome beast transformation',
    slot: 'OUTFIT',
    rarity: 'LEGENDARY',
    exclusive: true,
  },
  {
    id: 'WITCH_COSTUME',
    name: 'Witch Costume',
    description: 'Complete witch attire',
    slot: 'OUTFIT',
    rarity: 'RARE',
    exclusive: true,
  },
  {
    id: 'SKELETON_COSTUME',
    name: 'Skeleton Costume',
    description: 'Bone-chilling skeletal appearance',
    slot: 'OUTFIT',
    rarity: 'RARE',
    exclusive: true,
  },
  {
    id: 'SPECTRAL_HORSE',
    name: 'Spectral Horse Skin',
    description: 'Ghostly mount appearance',
    slot: 'MOUNT_SKIN',
    rarity: 'EPIC',
    exclusive: true,
  },
];

export const headlessHorsemanEncounter: HolidayEncounter = {
  id: 'HEADLESS_HORSEMAN',
  holidayId: 'HALLOWEEN',
  name: 'Headless Horseman',
  type: 'BOSS',
  level: 18,
  health: 4000,
  damage: 120,
  abilities: ['CHARGE_ATTACK', 'THROW_HEAD', 'SUMMON_FLAMES', 'TERRIFYING_LAUGH'],
  lootTable: [
    {
      itemId: 'HORSEMAN_SWORD',
      dropChance: 1.0,
      minQuantity: 1,
      maxQuantity: 1,
      guaranteed: true,
    },
    {
      itemId: 'CANDY_CORN',
      dropChance: 1.0,
      minQuantity: 50,
      maxQuantity: 100,
      guaranteed: true,
    },
    {
      itemId: 'HORSEMAN_CAPE',
      dropChance: 0.2,
      minQuantity: 1,
      maxQuantity: 1,
    },
  ],
  spawnLocations: ['MIDNIGHT_ROAD', 'CEMETERY', 'DARK_CROSSROADS'],
  spawnChance: 0.4,
  maxSpawns: 5,
};

export const halloweenEvent: HolidayEvent = {
  id: 'HALLOWEEN_2025',
  type: 'HALLOWEEN',
  name: 'Frontier Fright Night',
  description: 'The supernatural invades the Wild West. Face undead outlaws, hunt vampires, and collect candy corn in this spooky celebration.',
  lore: 'When the veil between worlds grows thin, the frontier becomes a playground for ghosts, ghouls, and things that should stay buried. Brave the darkness and reap spectral rewards.',

  // Timing
  startDate: { month: 10, day: 22 },
  endDate: { month: 10, day: 31 },
  duration: 10,

  // Content
  specialQuests: halloweenQuests,
  limitedShops: [halloweenShop],
  decorations: halloweenDecorations,
  specialNPCs: halloweenNPCs,

  // Activities
  activities: halloweenActivities,
  dailyChallenges: halloweenChallenges,

  // Rewards
  participationRewards: [
    { type: 'ITEM', id: 'PUMPKIN_HEAD', amount: 1 },
    { type: 'CURRENCY', id: 'CANDY_CORN', amount: 25 },
  ],
  completionRewards: [
    { type: 'TITLE', id: 'MONSTER_HUNTER', amount: 1 },
    { type: 'COSMETIC', id: 'WEREWOLF_COSTUME', amount: 1 },
    { type: 'ACHIEVEMENT', id: 'HALLOWEEN_MASTER', amount: 1 },
  ],
  exclusiveItems: halloweenItems,
  limitedCosmetics: halloweenCosmetics,

  // Currency
  currency: 'CANDY_CORN',
  currencyConversionRate: 1.5, // 1 candy corn = 1.5 gold after event

  // Atmosphere
  musicTheme: 'spooky_ambience',
  weatherOverride: 'FOG',
  skyboxOverride: 'blood_moon',
  townDecorationsEnabled: true,
  npcCostumesEnabled: true,
};
