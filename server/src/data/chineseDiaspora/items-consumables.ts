/**
 * Chinese Diaspora Consumables & Tools
 *
 * Traditional medicines, teas, tools, and special items
 */

import type { DiasporaConsumable, DiasporaItem, UniqueItem } from '@desperados/shared';

// ============================================================================
// CONSUMABLES - MEDICINE & FOOD
// ============================================================================

/**
 * Trust Level 2 Consumables (Friend)
 */
export const HERBAL_TEA_COLLECTION: DiasporaConsumable = {
  id: 'herbal-tea-collection',
  name: 'Herbal Tea Collection',
  chineseName: 'Cǎo Yào Chá',
  chineseCharacters: '草药茶',
  type: 'consumable',
  description: 'A selection of medicinal teas. Each brew addresses different ailments.',
  culturalNote: 'Traditional Chinese medicine uses thousands of herbal combinations. Tea preparation is both art and science.',
  trustRequired: 2,
  cost: 30,
  rarity: 'common',
  effects: [
    {
      type: 'combat',
      value: 'healing',
      description: '20% more effective than Western medicine',
    },
  ],
  consumableEffects: {
    health: 60,
    energy: 10,
    buffType: 'vitality',
    buffDuration: 60,
  },
  usesPerStack: 5,
  stackable: true,
  maxStack: 20,
  sourceNPC: 'mei-lin',
};

export const GINSENG_ROOT: DiasporaConsumable = {
  id: 'ginseng-root',
  name: 'Ginseng Root',
  chineseName: 'Rén Shēn',
  chineseCharacters: '人参',
  type: 'consumable',
  description: 'Potent root that restores stamina and vitality. Bitter but effective.',
  culturalNote: 'Ginseng has been used in Chinese medicine for over 2,000 years. It\'s considered a "superior herb" that promotes longevity.',
  trustRequired: 2,
  cost: 50,
  rarity: 'uncommon',
  effects: [
    {
      type: 'combat',
      value: 'energy',
      description: 'Major energy restoration',
    },
  ],
  consumableEffects: {
    energy: 50,
    buffType: 'endurance',
    buffDuration: 120,
  },
  usesPerStack: 1,
  stackable: true,
  maxStack: 10,
  sourceNPC: 'mei-lin',
};

export const TIGER_BALM: DiasporaConsumable = {
  id: 'tiger-balm',
  name: 'Tiger Balm',
  chineseName: 'Hǔ Biāo Wàn Jīn Yóu',
  chineseCharacters: '虎标万金油',
  type: 'consumable',
  description: 'A powerful ointment that relieves pain and removes negative effects.',
  culturalNote: 'Created by a Chinese herbalist in the 1870s, Tiger Balm became famous for treating everything from headaches to arthritis.',
  trustRequired: 2,
  cost: 40,
  rarity: 'uncommon',
  effects: [
    {
      type: 'special',
      value: 'cure-debuffs',
      description: 'Removes all debuffs',
    },
  ],
  consumableEffects: {
    health: 30,
    cures: ['debuff'],
    special: 'Removes pain effects',
  },
  usesPerStack: 3,
  stackable: true,
  maxStack: 15,
  sourceNPC: 'chen-tao',
};

/**
 * Trust Level 3 Consumables (Sibling)
 */
export const ACUPUNCTURE_KIT: DiasporaItem = {
  id: 'acupuncture-kit',
  name: 'Acupuncture Kit',
  chineseName: 'Zhēn Jiǔ Tào Zhuāng',
  chineseCharacters: '针灸套装',
  type: 'tool',
  description: 'Fine needles and charts for acupuncture treatment. Can heal yourself or others.',
  culturalNote: 'Acupuncture has been practiced in China for over 3,000 years. It works by balancing the body\'s qi (energy flow).',
  trustRequired: 3,
  cost: 200,
  rarity: 'rare',
  effects: [
    {
      type: 'special',
      value: 'healing-tool',
      description: 'Can heal self or others (requires skill)',
    },
    {
      type: 'combat',
      value: 'major-healing',
      description: 'Restores 100 HP over 10 minutes',
    },
  ],
  stackable: false,
  sourceNPC: 'mei-lin',
};

export const POISON_ANTIDOTE_UNIVERSAL: DiasporaConsumable = {
  id: 'poison-antidote-universal',
  name: 'Universal Antidote',
  chineseName: 'Wàn Néng Jiě Dú Jì',
  chineseCharacters: '万能解毒剂',
  type: 'consumable',
  description: 'A rare antidote that cures any poison. Tastes terrible but saves lives.',
  culturalNote: 'Chinese herbalists developed sophisticated understanding of toxins and their antidotes, often using one poison to neutralize another.',
  trustRequired: 3,
  cost: 150,
  rarity: 'rare',
  effects: [
    {
      type: 'special',
      value: 'cure-poison',
      description: 'Cures all poisons instantly',
    },
  ],
  consumableEffects: {
    health: 40,
    cures: ['poison'],
    special: 'Instant poison cure',
  },
  usesPerStack: 1,
  stackable: true,
  maxStack: 5,
  sourceNPC: 'mei-lin',
};

export const FIRE_POWDER: DiasporaConsumable = {
  id: 'fire-powder',
  name: 'Fire Powder',
  chineseName: 'Yān Huǒ',
  chineseCharacters: '烟火',
  type: 'consumable',
  description: 'Chinese fireworks powder. Creates brilliant flash, smoke, and noise.',
  culturalNote: 'China invented gunpowder and used it for fireworks long before weapons. The knowledge came to America with railroad workers.',
  trustRequired: 3,
  cost: 75,
  rarity: 'uncommon',
  effects: [
    {
      type: 'special',
      value: 'distraction',
      description: 'Creates distraction, draws attention',
    },
    {
      type: 'special',
      value: 'signal',
      description: 'Can be used as signal flare',
    },
    {
      type: 'combat',
      value: 'fire-starter',
      description: 'Can ignite flammable materials',
    },
  ],
  consumableEffects: {
    special: 'Distraction, signal, or fire starter',
  },
  usesPerStack: 3,
  stackable: true,
  maxStack: 15,
  sourceNPC: 'silent-wu',
};

/**
 * Trust Level 4 Consumables (Family)
 */
export const PHOENIX_TEARS: DiasporaConsumable = {
  id: 'phoenix-tears',
  name: 'Phoenix Tears',
  chineseName: 'Fèng Huáng Zhī Lèi',
  chineseCharacters: '凤凰之泪',
  type: 'consumable',
  description: 'Legendary healing elixir that cures even supernatural curses.',
  culturalNote: 'The phoenix (fenghuang) in Chinese mythology represents rebirth and healing. Its tears have miraculous properties.',
  trustRequired: 4,
  cost: 300,
  rarity: 'legendary',
  effects: [
    {
      type: 'combat',
      value: 'major-healing',
      description: 'Restores 150 HP instantly',
    },
    {
      type: 'special',
      value: 'curse-removal',
      description: 'Removes all curses and hexes',
    },
  ],
  consumableEffects: {
    health: 150,
    cures: ['curse', 'poison', 'debuff'],
    special: 'Removes supernatural effects',
  },
  usesPerStack: 1,
  stackable: true,
  maxStack: 3,
  sourceNPC: 'wong-li',
};

export const DRAGONS_BREATH_POTION: DiasporaConsumable = {
  id: 'dragons-breath-potion',
  name: 'Dragon\'s Breath Potion',
  chineseName: 'Lóng Xī Yào Shuǐ',
  chineseCharacters: '龙息药水',
  type: 'consumable',
  description: 'Powerful elixir that grants temporary fire resistance and the ability to breathe fire once.',
  culturalNote: 'Dragons in Chinese mythology control the elements. This potion channels a fraction of that power.',
  trustRequired: 4,
  cost: 250,
  rarity: 'legendary',
  effects: [
    {
      type: 'combat',
      value: 'fire-resistance',
      description: '50% fire resistance for 30 minutes',
    },
    {
      type: 'combat',
      value: 'fire-breath',
      description: 'Breathe fire once (high damage, cone AoE)',
    },
  ],
  consumableEffects: {
    buffType: 'fire-resistance',
    buffDuration: 30,
    special: 'One-time fire breath attack (50 damage, 3-meter cone)',
  },
  usesPerStack: 1,
  stackable: true,
  maxStack: 5,
  sourceNPC: 'wong-li',
};

/**
 * Trust Level 5 Consumables (Dragon) - UNIQUE
 */
export const IMMORTALITY_ELIXIR: DiasporaConsumable = {
  id: 'immortality-elixir',
  name: 'Elixir of Immortality',
  chineseName: 'Cháng Shēng Bù Lǎo Yào',
  chineseCharacters: '长生不老药',
  type: 'consumable',
  description: 'The legendary elixir sought by emperors for millennia. Prevents death once. This is not the true elixir of immortality, but a perfected formula that grants a single second chance at life. It was created by Master Alchemist Wu in 1850 and only three doses exist.',
  culturalNote: 'Chinese alchemy focused on creating the elixir of immortality. Many emperors died from mercury poisoning trying to achieve it.',
  trustRequired: 5,
  cost: 0,  // Quest-only, no gold cost
  rarity: 'unique',
  unique: true,
  effects: [
    {
      type: 'special',
      value: 'death-prevention',
      description: 'Prevents death once, restores to 50% HP',
    },
    {
      type: 'special',
      value: 'invulnerable',
      description: '10 seconds of invulnerability after triggering',
    },
  ],
  consumableEffects: {
    special: 'Automatic resurrection at 50% HP when killed, then 10 seconds invulnerability',
  },
  usesPerStack: 1,
  stackable: true,
  maxStack: 1,
  questRequired: 'worthy-of-immortality',  // Final quest in the chain
  sourceNPC: 'wong-li',
};

// ============================================================================
// SPECIAL TOOLS
// ============================================================================

export const PAPER_IDENTITY_KIT: DiasporaItem = {
  id: 'paper-identity-kit',
  name: 'Paper Identity Kit',
  chineseName: 'Shēn Fèn Wén Jiàn',
  chineseCharacters: '身份文件',
  type: 'tool',
  description: 'Forged papers that create a new identity. Name, background, even references.',
  culturalNote: 'Chinese immigrants often had to navigate complex and discriminatory documentation requirements. Some became experts in forgery for survival.',
  trustRequired: 3,
  cost: 500,
  rarity: 'rare',
  effects: [
    {
      type: 'special',
      value: 'new-identity',
      description: 'Creates new identity, clears wanted level',
    },
    {
      type: 'special',
      value: 'one-time-use',
      description: 'Single use only',
    },
  ],
  stackable: true,
  maxStack: 3,
  sourceNPC: 'chen-wei',
};

export const NETWORK_CIPHER: DiasporaItem = {
  id: 'network-cipher',
  name: 'Network Cipher',
  chineseName: 'Mì Mǎ Běn',
  chineseCharacters: '密码本',
  type: 'tool',
  description: 'A codebook for reading encrypted messages sent by the Chinese network.',
  culturalNote: 'The network uses classical Chinese characters and idioms that are impenetrable to outsiders.',
  trustRequired: 3,
  cost: 200,
  rarity: 'uncommon',
  effects: [
    {
      type: 'special',
      value: 'decode-messages',
      description: 'Can read hidden network messages',
    },
    {
      type: 'special',
      value: 'secret-access',
      description: 'Reveals hidden quest locations',
    },
  ],
  stackable: false,
  sourceNPC: 'chen-wei',
};

export const DRAGONS_SEAL: DiasporaItem = {
  id: 'dragons-seal',
  name: 'Dragon\'s Seal',
  chineseName: 'Lóng Zhī Yìn',
  chineseCharacters: '龙之印',
  type: 'accessory',
  description: 'A jade seal that identifies you as a Dragon - highest rank in the network. Only five Dragon Seals exist. Each represents absolute trust and authority within the Diaspora network.',
  culturalNote: 'Imperial seals (印) were symbols of authority in ancient China. This seal carries the authority of Wong Li himself.',
  trustRequired: 5,
  cost: 0,  // Quest-only, no gold cost
  rarity: 'unique',
  unique: true,
  effects: [
    {
      type: 'special',
      value: 'network-authority',
      description: 'Instant recognition by all network members',
    },
    {
      type: 'social',
      value: 'respect',
      description: '+25% to all social interactions with Chinese NPCs',
    },
    {
      type: 'special',
      value: 'quest-access',
      description: 'Unlocks Dragon-tier exclusive quests',
    },
  ],
  stackable: false,
  equipSlot: 'accessory',
  questRequired: 'seal-ceremony',  // Final quest in the chain
  sourceNPC: 'wong-li',
};

// ============================================================================
// EXPLOSIVES (Special Category)
// ============================================================================

export const DYNAMITE_STICK: DiasporaConsumable = {
  id: 'dynamite-stick',
  name: 'Dynamite Stick',
  chineseName: 'Zhà Yào',
  chineseCharacters: '炸药',
  type: 'consumable',
  description: 'Mining-grade dynamite. Handle with care.',
  culturalNote: 'Chinese workers were often assigned the most dangerous explosives work due to discrimination. They became experts out of necessity.',
  trustRequired: 2,
  cost: 50,
  rarity: 'uncommon',
  effects: [
    {
      type: 'combat',
      value: 'explosion',
      description: '75 damage, 3-meter radius',
    },
  ],
  consumableEffects: {
    special: 'Thrown explosive, 75 damage in 3m radius',
  },
  usesPerStack: 1,
  stackable: true,
  maxStack: 10,
  sourceNPC: 'silent-wu',
};

export const CUSTOM_CHARGE: DiasporaConsumable = {
  id: 'custom-charge',
  name: 'Custom Explosive Charge',
  chineseName: 'Dìng Zhì Zhà Yào',
  chineseCharacters: '定制炸药',
  type: 'consumable',
  description: 'Precisely calibrated explosive designed for your specific need.',
  culturalNote: 'Silent Wu\'s expertise allows him to create charges that bring down exactly what you want - nothing more, nothing less.',
  trustRequired: 4,
  cost: 300,
  rarity: 'legendary',
  effects: [
    {
      type: 'combat',
      value: 'precision-explosion',
      description: 'Destroys target with no collateral damage',
    },
    {
      type: 'special',
      value: 'custom',
      description: 'Specify target type when crafted',
    },
  ],
  consumableEffects: {
    special: 'Precision demolition of specified structure/obstacle',
  },
  usesPerStack: 1,
  stackable: true,
  maxStack: 3,
  sourceNPC: 'silent-wu',
};

// ============================================================================
// CRAFTING INGREDIENTS
// ============================================================================

export const RARE_GINSENG: DiasporaItem = {
  id: 'rare-ginseng',
  name: 'Rare Ginseng',
  chineseName: 'Zhēn Guì Rén Shēn',
  chineseCharacters: '珍贵人参',
  type: 'consumable',
  description: 'Wild-grown ginseng, over 50 years old. Extremely valuable.',
  culturalNote: 'The older the ginseng, the more potent its effects. Century-old ginseng is worth more than gold.',
  trustRequired: 4,
  cost: 200,
  rarity: 'rare',
  effects: [
    {
      type: 'special',
      value: 'crafting-ingredient',
      description: 'Used in legendary medicine recipes',
    },
  ],
  stackable: true,
  maxStack: 5,
  sourceNPC: 'mei-lin',
};

export const DRAGON_BEARD: DiasporaItem = {
  id: 'dragon-beard',
  name: 'Dragon Beard Herb',
  chineseName: 'Lóng Xū Cǎo',
  chineseCharacters: '龙须草',
  type: 'consumable',
  description: 'A rare mountain herb said to grow where dragons rest.',
  culturalNote: 'In Chinese herbology, plants with "dragon" names are considered especially powerful.',
  trustRequired: 4,
  cost: 150,
  rarity: 'rare',
  effects: [
    {
      type: 'special',
      value: 'crafting-ingredient',
      description: 'Used in legendary medicine recipes',
    },
  ],
  stackable: true,
  maxStack: 5,
  sourceNPC: 'chen-tao',
};

// Export all consumables
export const DIASPORA_CONSUMABLES: DiasporaConsumable[] = [
  HERBAL_TEA_COLLECTION,
  GINSENG_ROOT,
  TIGER_BALM,
  POISON_ANTIDOTE_UNIVERSAL,
  FIRE_POWDER,
  PHOENIX_TEARS,
  DRAGONS_BREATH_POTION,
  DYNAMITE_STICK,
  CUSTOM_CHARGE,
];

export const DIASPORA_TOOLS: DiasporaItem[] = [
  ACUPUNCTURE_KIT,
  PAPER_IDENTITY_KIT,
  NETWORK_CIPHER,
  RARE_GINSENG,
  DRAGON_BEARD,
];

export const DIASPORA_UNIQUE_CONSUMABLES: DiasporaConsumable[] = [
  IMMORTALITY_ELIXIR,
];
