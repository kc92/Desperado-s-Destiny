/**
 * Chinese Diaspora Items
 *
 * Unique weapons, armor, consumables, and tools available through
 * the Chinese Diaspora network. All items are culturally authentic
 * and mechanically unique.
 *
 * Trust Levels:
 * 1 - Outsider: Basic services only
 * 2 - Friend: Common items
 * 3 - Sibling: Rare items and special services
 * 4 - Family: Legendary items
 * 5 - Dragon: Unique items (only one exists)
 */

import type {
  DiasporaWeapon,
  DiasporaArmor,
  DiasporaConsumable,
  DiasporaItem,
  UniqueItem,
  DiasporaItemCatalog
} from '@desperados/shared';

// ============================================================================
// WEAPONS
// ============================================================================

/**
 * Trust Level 2 Weapons (Friend)
 */
export const JIAN_SWORD: DiasporaWeapon = {
  id: 'jian-sword',
  name: 'Jian',
  chineseName: 'Jiàn',
  chineseCharacters: '剑',
  type: 'weapon',
  subtype: 'sword',
  description: 'An elegant Chinese straight sword, prized for its balance and speed. The "gentleman of weapons."',
  culturalNote: 'The jian is one of the oldest Chinese weapons, dating back 2,500 years. It was the weapon of scholars and nobility, emphasizing precision over brute force.',
  trustRequired: 2,
  cost: 150,
  rarity: 'uncommon',
  effects: [
    {
      type: 'combat',
      stat: 'speed',
      value: 10,
      description: '+10% attack speed',
    },
    {
      type: 'combat',
      stat: 'damage',
      value: -5,
      description: '-5% damage (lighter than Western swords)',
    },
  ],
  stats: {
    damage: 25,
    speed: 1.1,
    range: 'melee',
    critChance: 8,
    durability: 100,
    special: ['Parry +5%', 'Elegant strikes'],
  },
  stackable: false,
  equipSlot: 'weapon',
  sourceNPC: 'master-fang',
};

export const THROWING_STARS: DiasporaWeapon = {
  id: 'throwing-stars',
  name: 'Throwing Stars',
  chineseName: 'Shǒu Lǐ Jiàn',
  chineseCharacters: '手里剑',
  type: 'weapon',
  subtype: 'ranged',
  description: 'Sharp steel stars thrown with deadly accuracy. Silent and lethal.',
  culturalNote: 'While often associated with Japanese ninja, Chinese martial artists also used throwing blades (shuriken-style weapons) for distraction and assassination.',
  trustRequired: 2,
  cost: 50,
  rarity: 'uncommon',
  effects: [
    {
      type: 'stealth',
      value: 'silent',
      description: 'Silent kills do not alert nearby enemies',
    },
    {
      type: 'combat',
      stat: 'damage',
      value: 15,
      description: 'Low damage, high utility',
    },
  ],
  stats: {
    damage: 15,
    speed: 1.3,
    range: 'medium',
    critChance: 12,
    durability: 999,
    special: ['Silent', 'Distraction', 'Bleeding DoT'],
  },
  stackable: true,
  maxStack: 20,
  equipSlot: 'weapon',
  stealth: true,
  sourceNPC: 'silent-wu',
};

/**
 * Trust Level 3 Weapons (Sibling)
 */
export const DAO_SABER: DiasporaWeapon = {
  id: 'dao-saber',
  name: 'Dao',
  chineseName: 'Dāo',
  chineseCharacters: '刀',
  type: 'weapon',
  subtype: 'sword',
  description: 'A powerful Chinese saber with a curved blade. The "general of weapons," favored by cavalry.',
  culturalNote: 'The dao was the primary weapon of Chinese cavalry and infantry. Its curved blade delivers devastating slashing attacks.',
  trustRequired: 3,
  cost: 300,
  rarity: 'rare',
  effects: [
    {
      type: 'combat',
      stat: 'damage',
      value: 15,
      description: '+15% damage against unarmored targets',
      condition: 'vs unarmored',
    },
    {
      type: 'combat',
      value: 'cleave',
      description: 'Can hit multiple enemies in arc',
    },
  ],
  stats: {
    damage: 40,
    speed: 0.95,
    range: 'melee',
    critChance: 10,
    durability: 120,
    special: ['Cleave attack', 'Armor break', 'Cavalry weapon'],
  },
  stackable: false,
  equipSlot: 'weapon',
  sourceNPC: 'master-fang',
};

export const STAFF_GUN: DiasporaWeapon = {
  id: 'staff-gun',
  name: 'Gun (Staff)',
  chineseName: 'Gùn',
  chineseCharacters: '棍',
  type: 'weapon',
  subtype: 'staff',
  description: 'A hardwood staff, simple yet deadly in trained hands. Can be disguised as a walking stick.',
  culturalNote: 'The gun (staff) is one of the four major Chinese weapons. It emphasizes reach, speed, and non-lethal takedowns.',
  trustRequired: 3,
  cost: 200,
  rarity: 'rare',
  effects: [
    {
      type: 'combat',
      value: 'non-lethal',
      description: 'Can knock out instead of kill',
    },
    {
      type: 'combat',
      value: 'reach',
      description: 'Extended reach (2 meters)',
    },
    {
      type: 'stealth',
      value: 'concealed',
      description: 'Appears as walking stick',
    },
  ],
  stats: {
    damage: 30,
    speed: 1.15,
    range: 'close',
    critChance: 6,
    durability: 150,
    special: ['Non-lethal option', 'Sweep attacks', 'Disguised'],
  },
  stackable: false,
  equipSlot: 'weapon',
  requiredSkill: 'martial-arts-basic',
  sourceNPC: 'master-fang',
};

export const ROPE_DART: DiasporaWeapon = {
  id: 'rope-dart',
  name: 'Rope Dart',
  chineseName: 'Shéng Biāo',
  chineseCharacters: '绳镖',
  type: 'weapon',
  subtype: 'exotic',
  description: 'A metal dart attached to a long rope. Requires skill to use but offers unique tactical options.',
  culturalNote: 'The rope dart is a flexible weapon allowing for strikes at varying ranges, binding, and disarming. It originated in Chinese martial arts.',
  trustRequired: 3,
  cost: 250,
  rarity: 'rare',
  effects: [
    {
      type: 'combat',
      value: 'pull',
      description: 'Can pull enemies or objects',
    },
    {
      type: 'combat',
      value: 'trip',
      description: 'Can trip horses and running enemies',
    },
    {
      type: 'special',
      value: 'skill-based',
      description: 'Damage scales with martial arts skill',
    },
  ],
  stats: {
    damage: 20,
    speed: 1.0,
    range: 'medium',
    critChance: 15,
    durability: 80,
    special: ['Pull', 'Trip', 'Disarm', 'Variable range'],
  },
  stackable: false,
  equipSlot: 'weapon',
  requiredSkill: 'martial-arts-advanced',
  sourceNPC: 'master-fang',
};

/**
 * Trust Level 4 Weapons (Family)
 */
export const BUTTERFLY_SWORDS: DiasporaWeapon = {
  id: 'butterfly-swords',
  name: 'Butterfly Swords',
  chineseName: 'Hú Dié Shuāng Dāo',
  chineseCharacters: '蝴蝶双刀',
  type: 'weapon',
  subtype: 'paired',
  description: 'A matched pair of short swords designed for dual-wielding. Fast, deadly, and beautiful.',
  culturalNote: 'Associated with Wing Chun and southern Chinese martial arts. The paired blades create a defensive wall while delivering rapid strikes.',
  trustRequired: 4,
  cost: 600,
  rarity: 'legendary',
  effects: [
    {
      type: 'combat',
      value: 'dual-wield',
      description: 'Attacks with both weapons',
    },
    {
      type: 'combat',
      stat: 'speed',
      value: 20,
      description: '+20% attack speed when dual-wielding',
    },
    {
      type: 'combat',
      value: 'parry',
      description: '+20% parry chance',
    },
  ],
  stats: {
    damage: 30,
    speed: 1.25,
    range: 'melee',
    critChance: 12,
    durability: 100,
    special: ['Dual wield', 'Parry master', 'Flurry attacks'],
  },
  stackable: false,
  equipSlot: 'weapon',
  dualWield: true,
  requiredSkill: 'martial-arts-master',
  sourceNPC: 'master-fang',
};

export const DRAGONS_BREATH_PISTOL: DiasporaWeapon = {
  id: 'dragons-breath-pistol',
  name: 'Dragon\'s Breath Pistol',
  chineseName: 'Lóng Zhī Xī',
  chineseCharacters: '龙之息',
  type: 'weapon',
  subtype: 'ranged',
  description: 'A modified pistol that fires incendiary rounds. Flames dance from the barrel like a dragon\'s breath.',
  culturalNote: 'Chinese gunpowder expertise dates back to the Tang Dynasty. This weapon combines Western firearm technology with Chinese pyrotechnic knowledge.',
  trustRequired: 4,
  cost: 800,
  rarity: 'legendary',
  effects: [
    {
      type: 'combat',
      value: 'fire-damage',
      description: 'Fire damage over time',
    },
    {
      type: 'special',
      value: 'ignite',
      description: 'Can ignite flammable objects',
    },
    {
      type: 'social',
      stat: 'intimidation',
      value: 15,
      description: '+15% intimidation when equipped',
    },
  ],
  stats: {
    damage: 50,
    speed: 0.8,
    range: 'medium',
    critChance: 8,
    durability: 80,
    special: ['Fire DoT', 'Ignite', 'Intimidating'],
  },
  stackable: false,
  equipSlot: 'weapon',
  sourceNPC: 'silent-wu',
};

/**
 * Trust Level 5 Weapons (Dragon) - UNIQUE
 */
export const CELESTIAL_DRAGON_SWORD: DiasporaWeapon = {
  id: 'celestial-dragon-sword',
  name: 'Sword of the Celestial Dragon',
  chineseName: 'Tiān Lóng Jiàn',
  chineseCharacters: '天龙剑',
  type: 'weapon',
  subtype: 'sword',
  description: 'A legendary blade said to be blessed by the Dragon Emperor himself. It glows with a faint blue light and never dulls. Forged in the Imperial workshops of the Qing Dynasty, this sword was gifted to a master swordsman who later immigrated to America. He entrusted it to Wong Li, leader of the Diaspora network, to protect until a worthy successor emerges.',
  culturalNote: 'In Chinese mythology, the dragon represents power, wisdom, and good fortune. This sword embodies those qualities.',
  trustRequired: 5,
  cost: 0,  // Quest-only, no gold cost
  rarity: 'unique',
  unique: true,
  effects: [
    {
      type: 'combat',
      stat: 'damage',
      value: 25,
      description: '+25% damage',
    },
    {
      type: 'combat',
      stat: 'speed',
      value: 15,
      description: '+15% attack speed',
    },
    {
      type: 'combat',
      value: 'crit',
      description: '+15% critical chance',
    },
    {
      type: 'special',
      value: 'luminous',
      description: 'Glows faintly, providing light',
    },
    {
      type: 'special',
      value: 'unbreakable',
      description: 'Never degrades or breaks',
    },
  ],
  stats: {
    damage: 60,
    speed: 1.15,
    range: 'melee',
    critChance: 20,
    durability: 999999,
    special: ['Luminous', 'Unbreakable', 'Dragon blessing', 'Master weapon'],
  },
  stackable: false,
  equipSlot: 'weapon',
  questRequired: 'dragons-judgment',  // Final quest in the chain
  requiredSkill: 'martial-arts-grandmaster',
  sourceNPC: 'wong-li',
};

// ============================================================================
// ARMOR & CLOTHING
// ============================================================================

/**
 * Trust Level 2 Armor (Friend)
 */
export const SILK_UNDERCLOTHING: DiasporaArmor = {
  id: 'silk-underclothing',
  name: 'Silk Underclothing',
  chineseName: 'Sī Chóu Nèi Yī',
  chineseCharacters: '丝绸内衣',
  type: 'armor',
  subtype: 'silk',
  description: 'Fine silk garments worn under normal clothes. Soft yet surprisingly resilient.',
  culturalNote: 'Silk was discovered in China around 3000 BCE. Its fine fibers can actually resist blade cuts better than expected, a property used historically for protective clothing.',
  trustRequired: 2,
  cost: 100,
  rarity: 'uncommon',
  effects: [
    {
      type: 'combat',
      stat: 'defense',
      value: 5,
      description: '+5 defense',
    },
    {
      type: 'special',
      value: 'blade-resistant',
      description: '+10% resistance to slashing damage',
    },
  ],
  stats: {
    defense: 5,
    mobility: 0,
    stealth: 0,
    durability: 80,
    special: ['Hidden under clothes', 'Blade resistant', 'Comfortable'],
  },
  stackable: false,
  equipSlot: 'body',
  hidden: true,
  sourceNPC: 'mei-lin',
};

export const WORKERS_DISGUISE: DiasporaArmor = {
  id: 'workers-disguise',
  name: 'Worker\'s Disguise',
  chineseName: 'Gōng Rén Fú Zhuāng',
  chineseCharacters: '工人服装',
  type: 'armor',
  subtype: 'clothing',
  description: 'Simple work clothes that let you blend in at mines, railroads, and labor sites.',
  culturalNote: 'Chinese immigrants often worked dangerous jobs in mines and on the railroad. This clothing mimics that appearance.',
  trustRequired: 2,
  cost: 75,
  rarity: 'common',
  effects: [
    {
      type: 'stealth',
      value: 'disguise',
      description: '-50% suspicion at labor sites',
      condition: 'at mines/railroads',
    },
    {
      type: 'social',
      value: 'blend-in',
      description: 'Guards ignore you in work areas',
    },
  ],
  stats: {
    defense: 2,
    mobility: 0,
    stealth: 15,
    durability: 60,
    special: ['Disguise', 'Access to restricted areas'],
  },
  stackable: false,
  equipSlot: 'body',
  disguise: 'railroad-worker',
  sourceNPC: 'old-zhang',
};

/**
 * Trust Level 3 Armor (Sibling)
 */
export const MARTIAL_ARTISTS_GI: DiasporaArmor = {
  id: 'martial-artists-gi',
  name: 'Martial Artist\'s Gi',
  chineseName: 'Wǔ Shù Fú',
  chineseCharacters: '武术服',
  type: 'armor',
  subtype: 'clothing',
  description: 'Traditional training clothing for martial artists. Light, flexible, and built for movement.',
  culturalNote: 'The martial arts gi allows for full range of motion while providing minimal protection. It\'s required for proper martial arts training.',
  trustRequired: 3,
  cost: 150,
  rarity: 'rare',
  effects: [
    {
      type: 'combat',
      stat: 'speed',
      value: 10,
      description: '+10% dodge chance',
    },
    {
      type: 'special',
      value: 'training-bonus',
      description: '+20% martial arts skill gain',
    },
  ],
  stats: {
    defense: 3,
    mobility: 10,
    stealth: 5,
    durability: 100,
    special: ['High mobility', 'Training bonus', 'Martial arts required'],
  },
  stackable: false,
  equipSlot: 'body',
  sourceNPC: 'master-fang',
};

export const MERCHANTS_ROBES: DiasporaArmor = {
  id: 'merchants-robes',
  name: 'Merchant\'s Robes',
  chineseName: 'Shāng Rén Páo',
  chineseCharacters: '商人袍',
  type: 'armor',
  subtype: 'clothing',
  description: 'Fine silk robes that command respect. Hidden pockets perfect for smuggling.',
  culturalNote: 'Chinese merchants were often wealthy and respected. These robes signal status and prosperity.',
  trustRequired: 3,
  cost: 200,
  rarity: 'rare',
  effects: [
    {
      type: 'social',
      stat: 'persuasion',
      value: 10,
      description: '+10% persuasion',
    },
    {
      type: 'special',
      value: 'hidden-pockets',
      description: 'Can smuggle small items undetected',
    },
  ],
  stats: {
    defense: 4,
    mobility: -2,
    stealth: -5,
    durability: 90,
    special: ['Respectable appearance', 'Hidden pockets', 'Smuggling'],
  },
  stackable: false,
  equipSlot: 'body',
  disguise: 'merchant',
  sourceNPC: 'wong-chen',
};

/**
 * Trust Level 4 Armor (Family)
 */
export const SILK_ARMOR_LEGENDARY: DiasporaArmor = {
  id: 'silk-armor-legendary',
  name: 'Silk Armor',
  chineseName: 'Sī Zhì Kǎi Jiǎ',
  chineseCharacters: '丝制铠甲',
  type: 'armor',
  subtype: 'silk',
  description: 'Full body protection made from multiple layers of silk. Light as cloth, strong as leather.',
  culturalNote: 'Historical silk armor was created by layering silk fabric. The fibers would trap arrows and resist blade cuts. Mongol warriors favored it.',
  trustRequired: 4,
  cost: 700,
  rarity: 'legendary',
  effects: [
    {
      type: 'combat',
      stat: 'defense',
      value: 15,
      description: '+15 defense',
    },
    {
      type: 'special',
      value: 'no-penalty',
      description: 'No mobility penalty',
    },
    {
      type: 'combat',
      value: 'arrow-resistant',
      description: '+25% resistance to ranged attacks',
    },
  ],
  stats: {
    defense: 15,
    mobility: 0,
    stealth: 0,
    durability: 120,
    special: ['Light as cloth', 'Arrow resistant', 'No mobility loss'],
  },
  stackable: false,
  equipSlot: 'body',
  sourceNPC: 'wong-li',
};

export const DRAGON_MASK: DiasporaArmor = {
  id: 'dragon-mask',
  name: 'Dragon Mask',
  chineseName: 'Lóng Miàn Jù',
  chineseCharacters: '龙面具',
  type: 'armor',
  subtype: 'mask',
  description: 'A ceremonial dragon mask that completely conceals your identity. Intimidating to behold.',
  culturalNote: 'Dragon masks are used in traditional Chinese festivals and ceremonies. They represent power and good fortune.',
  trustRequired: 4,
  cost: 400,
  rarity: 'legendary',
  effects: [
    {
      type: 'stealth',
      value: 'identity-concealment',
      description: 'Completely hides identity',
    },
    {
      type: 'social',
      stat: 'intimidation',
      value: 20,
      description: '+20% intimidation',
    },
    {
      type: 'special',
      value: 'wanted-protection',
      description: 'Wanted level not recognized while worn',
    },
  ],
  stats: {
    defense: 2,
    mobility: -3,
    stealth: 0,
    durability: 150,
    special: ['Full identity concealment', 'Intimidating', 'Ceremonial'],
  },
  stackable: false,
  equipSlot: 'head',
  sourceNPC: 'master-fang',
};

/**
 * Trust Level 5 Armor (Dragon) - UNIQUE
 */
export const EMPERORS_SILK: DiasporaArmor = {
  id: 'emperors-silk',
  name: 'Emperor\'s Silk',
  chineseName: 'Huáng Dì Sī Chóu',
  chineseCharacters: '皇帝丝绸',
  type: 'armor',
  subtype: 'silk',
  description: 'Legendary armor worn by the Emperor\'s personal guard. Woven with gold thread and blessed by monks. This armor was smuggled out of China during the fall of the Qing Dynasty. It represents the last remnants of Imperial glory, preserved by the Diaspora.',
  culturalNote: 'Imperial silk robes were among the most valuable items in ancient China. Only the Emperor and his closest guards could wear such finery.',
  trustRequired: 5,
  cost: 0,  // Quest-only, no gold cost
  rarity: 'unique',
  unique: true,
  effects: [
    {
      type: 'combat',
      stat: 'defense',
      value: 25,
      description: '+25 defense',
    },
    {
      type: 'special',
      value: 'poison-resistant',
      description: 'Immune to all poisons',
    },
    {
      type: 'social',
      value: 'imperial-presence',
      description: '+15% to all social skills',
    },
    {
      type: 'special',
      value: 'regeneration',
      description: 'Slow health regeneration over time',
    },
  ],
  stats: {
    defense: 25,
    mobility: 5,
    stealth: -10,
    durability: 999999,
    special: ['Poison immunity', 'Health regen', 'Imperial status', 'Unbreakable'],
  },
  stackable: false,
  equipSlot: 'body',
  questRequired: 'imperial-honor',  // Final quest in the chain
  sourceNPC: 'wong-li',
};

// ============================================================================
// EXPORTS
// ============================================================================

export const DIASPORA_WEAPONS = [
  // Trust 2
  JIAN_SWORD,
  THROWING_STARS,
  // Trust 3
  DAO_SABER,
  STAFF_GUN,
  ROPE_DART,
  // Trust 4
  BUTTERFLY_SWORDS,
  DRAGONS_BREATH_PISTOL,
  // Trust 5
  CELESTIAL_DRAGON_SWORD,
];

export const DIASPORA_ARMOR = [
  // Trust 2
  SILK_UNDERCLOTHING,
  WORKERS_DISGUISE,
  // Trust 3
  MARTIAL_ARTISTS_GI,
  MERCHANTS_ROBES,
  // Trust 4
  SILK_ARMOR_LEGENDARY,
  DRAGON_MASK,
  // Trust 5
  EMPERORS_SILK,
];

export const DIASPORA_UNIQUE_WEAPONS = [
  CELESTIAL_DRAGON_SWORD,
];

export const DIASPORA_UNIQUE_ARMOR = [
  EMPERORS_SILK,
];
