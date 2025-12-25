/**
 * Greenhorn's Trail Items - Phase 19.2
 * 20 items for L1-15 content pack
 *
 * Categories:
 * - 7 Weapons/Armor (tutorial rewards, survival focus)
 * - 7 Crafting Materials (hunting, mining, gathering)
 * - 6 Consumables (food, buffs, remedies)
 */

import { IItem } from '../../models/Item.model';

// =============================================================================
// WEAPONS & ARMOR (7 items)
// Tutorial rewards and survival-focused equipment
// =============================================================================

export const greenhornWeaponsArmor: Partial<IItem>[] = [
  // Hunting Tutorial Reward (L3)
  {
    itemId: 'rusty-hunting-rifle',
    name: 'Rusty Hunting Rifle',
    description: 'An old hunting rifle, well-worn but still reliable. Perfect for bringing down small game.',
    type: 'weapon',
    rarity: 'common',
    price: 75,
    sellPrice: 35,
    inShop: false, // Quest reward only
    levelRequired: 3,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText: '"Every hunter needs a trusty rifle. This one\'s seen better days, but she still shoots straight."',
    stats: {
      combat: 3,
      cunning: 1
    },
    effects: [
      { type: 'stat', stat: 'combat', value: 3, description: '+3 Combat' },
      { type: 'special', value: 10, description: '+10% Hunting success' }
    ]
  },

  // Mining Tutorial Reward (L4)
  {
    itemId: 'miners-pickaxe',
    name: "Miner's Pickaxe",
    description: 'A sturdy pickaxe for breaking rock. Can also crack skulls in a pinch.',
    type: 'tool',
    rarity: 'common',
    price: 60,
    sellPrice: 30,
    inShop: true,
    levelRequired: 4,
    icon: '⛏️',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText: '"Good for ore, good for self-defense. A prospector\'s best friend."',
    stats: {
      combat: 2,
      craft: 3
    },
    effects: [
      { type: 'stat', stat: 'combat', value: 2, description: '+2 Combat' },
      { type: 'stat', stat: 'craft', value: 3, description: '+3 Craft' },
      { type: 'special', value: 15, description: '+15% Mining yield' }
    ]
  },

  // Cooking Tutorial Reward (L5)
  {
    itemId: 'campfire-skillet',
    name: 'Campfire Skillet',
    description: 'Cast iron skillet for trail cooking. Heavy enough to serve as an improvised weapon.',
    type: 'tool',
    rarity: 'common',
    price: 45,
    sellPrice: 22,
    inShop: true,
    levelRequired: 5,
    icon: '🍳',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText: '"Ma always said the kitchen is the heart of the home. And a good skillet can protect it."',
    stats: {
      combat: 2,
      craft: 2
    },
    effects: [
      { type: 'stat', stat: 'combat', value: 2, description: '+2 Combat' },
      { type: 'stat', stat: 'craft', value: 2, description: '+2 Craft' },
      { type: 'special', value: 20, description: '+20% Cooking quality' }
    ]
  },

  // Blacksmithing Tutorial Reward (L6)
  {
    itemId: 'apprentice-hammer',
    name: 'Apprentice Hammer',
    description: 'A well-balanced smithing hammer. The weight feels right in your hand.',
    type: 'tool',
    rarity: 'uncommon',
    price: 120,
    sellPrice: 60,
    inShop: false, // Quest reward only
    levelRequired: 6,
    icon: '🔨',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText: '"A smith is only as good as their hammer. This one was made by a master for an apprentice with promise."',
    stats: {
      combat: 3,
      craft: 5
    },
    effects: [
      { type: 'stat', stat: 'combat', value: 3, description: '+3 Combat' },
      { type: 'stat', stat: 'craft', value: 5, description: '+5 Craft' },
      { type: 'special', value: 10, description: '+10% Smithing success' }
    ]
  },

  // Herbal Medicine Tutorial Reward (L7)
  {
    itemId: 'herbal-pouch-vest',
    name: 'Herbal Pouch Vest',
    description: 'Leather vest with numerous pouches for storing herbs and remedies. Smells of sage and medicine.',
    type: 'armor',
    rarity: 'uncommon',
    price: 150,
    sellPrice: 75,
    inShop: false, // Quest reward only
    levelRequired: 7,
    icon: '🧥',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText: '"A healer\'s vest, worn by frontier doctors and medicine men alike. Every pouch tells a story."',
    stats: {
      spirit: 4,
      craft: 2
    },
    effects: [
      { type: 'stat', stat: 'spirit', value: 4, description: '+4 Spirit' },
      { type: 'stat', stat: 'craft', value: 2, description: '+2 Craft' },
      { type: 'inventory_slots', value: 5, description: '+5 Herb storage slots' },
      { type: 'special', value: 15, description: '+15% Medicine effectiveness' }
    ]
  },

  // Advanced Survival Tutorial Reward (L8)
  {
    itemId: 'survival-duster',
    name: 'Survival Duster',
    description: 'A long weatherproof coat designed for harsh frontier conditions. Keeps out dust, rain, and cold.',
    type: 'armor',
    rarity: 'uncommon',
    price: 200,
    sellPrice: 100,
    inShop: true,
    levelRequired: 8,
    icon: '🧥',
    equipSlot: 'body',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    tutorialItem: true,
    flavorText: '"The frontier don\'t care about your comfort. This coat does."',
    stats: {
      combat: 2,
      spirit: 3,
      cunning: 2
    },
    effects: [
      { type: 'stat', stat: 'combat', value: 2, description: '+2 Combat' },
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit' },
      { type: 'stat', stat: 'cunning', value: 2, description: '+2 Cunning' },
      { type: 'special', value: 25, description: '+25% Weather resistance' }
    ]
  },

  // Faction War Prologue Reward (L15)
  {
    itemId: 'faction-armband',
    name: 'Faction Armband',
    description: 'A colored armband displaying your faction allegiance. Wearing it openly shows your commitment.',
    type: 'accessory',
    rarity: 'rare',
    price: 0, // Not for sale
    sellPrice: 50,
    inShop: false, // Quest reward only
    levelRequired: 15,
    icon: '🎗️',
    equipSlot: 'accessory',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"In the coming war, everyone will know where you stand. This armband makes sure of it."',
    stats: {
      spirit: 3
    },
    effects: [
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit' },
      { type: 'social_success', value: 10, description: '+10% Faction reputation gains' }
    ]
  }
];

// =============================================================================
// CRAFTING MATERIALS (7 items)
// Survival and crafting focused gathering drops
// =============================================================================

export const greenhornMaterials: Partial<IItem>[] = [
  // Hunting drop - cooking ingredient
  {
    itemId: 'raw-venison',
    name: 'Raw Venison',
    description: 'Fresh deer meat from the hunt. Best cooked soon before it spoils.',
    type: 'material',
    rarity: 'common',
    price: 8,
    sellPrice: 4,
    inShop: false, // Hunting drop only
    levelRequired: 1,
    icon: '🥩',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 50,
    flavorText: '"Nothing beats fresh game meat over an open fire."',
    effects: [
      { type: 'special', value: 0, description: 'Cooking ingredient - makes Venison Stew' }
    ]
  },

  // Mining node drop - smithing material
  {
    itemId: 'copper-ore',
    name: 'Copper Ore',
    description: 'Raw copper ore, greenish-blue and heavy. The foundation of frontier metallurgy.',
    type: 'material',
    rarity: 'common',
    price: 5,
    sellPrice: 2,
    inShop: false, // Mining drop only
    levelRequired: 1,
    icon: '🪨',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    flavorText: '"Copper built this territory\'s first tools. Still valuable for repairs and alloys."',
    effects: [
      { type: 'special', value: 0, description: 'Smithing material - smelts into Copper Ingots' }
    ]
  },

  // Gathering drop - medicine ingredient
  {
    itemId: 'wild-herbs',
    name: 'Wild Herbs',
    description: 'A bundle of assorted wild herbs. Useful for cooking and simple remedies.',
    type: 'material',
    rarity: 'common',
    price: 6,
    sellPrice: 3,
    inShop: false, // Gathering drop only
    levelRequired: 1,
    icon: '🌿',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    flavorText: '"The land provides for those who know where to look."',
    effects: [
      { type: 'special', value: 0, description: 'Medicine/Cooking ingredient' }
    ]
  },

  // Tree gathering - construction material
  {
    itemId: 'timber-wood',
    name: 'Timber Wood',
    description: 'Logs of quality timber, suitable for construction and carpentry.',
    type: 'material',
    rarity: 'common',
    price: 4,
    sellPrice: 2,
    inShop: false, // Woodcutting drop only
    levelRequired: 1,
    icon: '🪵',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    flavorText: '"Good timber is the backbone of civilization on the frontier."',
    effects: [
      { type: 'special', value: 0, description: 'Construction material - builds structures' }
    ]
  },

  // Hunting drop - leatherworking
  {
    itemId: 'animal-hide',
    name: 'Animal Hide',
    description: 'Untanned animal hide. Needs to be processed before it can be used for crafting.',
    type: 'material',
    rarity: 'common',
    price: 7,
    sellPrice: 3,
    inShop: false, // Hunting drop only
    levelRequired: 1,
    icon: '🦌',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 50,
    flavorText: '"Waste not, want not. Every part of the animal has value."',
    effects: [
      { type: 'special', value: 0, description: 'Leatherworking material - tans into leather' }
    ]
  },

  // Mining drop - smithing material (upgraded)
  {
    itemId: 'iron-ore',
    name: 'Iron Ore',
    description: 'Heavy iron ore, rust-colored and solid. The material of choice for serious smithing.',
    type: 'material',
    rarity: 'uncommon',
    price: 12,
    sellPrice: 6,
    inShop: false, // Mining drop only
    levelRequired: 5,
    icon: '🪨',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 99,
    flavorText: '"Iron ore: the difference between a knife and a sword."',
    effects: [
      { type: 'special', value: 0, description: 'Smithing material - smelts into Iron Ingots' }
    ]
  },

  // Gathering drop - valuable medicine ingredient
  {
    itemId: 'rare-sage',
    name: 'Rare Sage',
    description: 'Wild sage with unusual coloring. Highly valued by healers and medicine men.',
    type: 'material',
    rarity: 'uncommon',
    price: 25,
    sellPrice: 12,
    inShop: false, // Gathering drop only
    levelRequired: 5,
    icon: '🌱',
    isEquippable: false,
    isConsumable: false,
    isStackable: true,
    maxStack: 50,
    flavorText: '"Sacred to the Nahi tribes. Handle with respect."',
    effects: [
      { type: 'special', value: 0, description: 'Advanced medicine ingredient - powerful remedies' }
    ]
  }
];

// =============================================================================
// CONSUMABLES (6 items)
// Food, buffs, and remedies for survival gameplay
// =============================================================================

export const greenhornConsumables: Partial<IItem>[] = [
  // Basic food (L1)
  {
    itemId: 'travelers-rations',
    name: "Traveler's Rations",
    description: 'Hardtack, dried meat, and a bit of fruit. Not tasty, but keeps you going.',
    type: 'consumable',
    rarity: 'common',
    price: 10,
    sellPrice: 5,
    inShop: true,
    levelRequired: 1,
    icon: '🍖',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 99,
    flavorText: '"Army rations. They\'ll keep you alive, but you won\'t enjoy it."',
    effects: [
      { type: 'health', value: 15, description: 'Restores 15 HP over 30 seconds' },
      { type: 'energy', value: 5, description: 'Restores 5 Energy' }
    ]
  },

  // Tracking buff (L3)
  {
    itemId: 'hunters-instinct-tea',
    name: "Hunter's Instinct Tea",
    description: 'A bitter tea brewed from roots and herbs. Sharpens the senses for tracking prey.',
    type: 'consumable',
    rarity: 'common',
    price: 20,
    sellPrice: 10,
    inShop: true,
    levelRequired: 3,
    icon: '🍵',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    flavorText: '"Old hunter\'s trick. Drink this and you\'ll smell a deer a mile away."',
    effects: [
      { type: 'special', value: 25, description: '+25% Tracking for 1 hour' },
      { type: 'stat', stat: 'cunning', value: 2, description: '+2 Cunning for 1 hour' }
    ]
  },

  // Mining stamina buff (L4)
  {
    itemId: 'miners-tonic',
    name: "Miner's Tonic",
    description: 'A fortifying drink favored by prospectors. Keeps you swinging the pickaxe.',
    type: 'consumable',
    rarity: 'common',
    price: 25,
    sellPrice: 12,
    inShop: true,
    levelRequired: 4,
    icon: '🧴',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 50,
    flavorText: '"Secret recipe from the Colorado mining camps. Tastes like dirt, works like magic."',
    effects: [
      { type: 'energy', value: 20, description: 'Restores 20 Energy' },
      { type: 'special', value: 20, description: '+20% Mining stamina for 1 hour' }
    ]
  },

  // Burn resist (L6)
  {
    itemId: 'forge-fire-salve',
    name: 'Forge Fire Salve',
    description: 'A thick salve that protects skin from burns. Essential for any smith.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 35,
    sellPrice: 17,
    inShop: true,
    levelRequired: 6,
    icon: '🧈',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 30,
    flavorText: '"Apply liberally before working the forge. Your hands will thank you."',
    effects: [
      { type: 'special', value: 50, description: '+50% Burn resistance for 2 hours' },
      { type: 'special', value: 10, description: '+10% Smithing success for 2 hours' }
    ]
  },

  // Cure poison + heal (L7)
  {
    itemId: 'herbal-remedy',
    name: 'Herbal Remedy',
    description: 'A powerful remedy made from wild herbs. Cures poison and heals wounds.',
    type: 'consumable',
    rarity: 'uncommon',
    price: 50,
    sellPrice: 25,
    inShop: true,
    levelRequired: 7,
    icon: '💊',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 30,
    flavorText: '"Old medicine woman recipe. Works on snakebites, food poisoning, and bad whiskey."',
    effects: [
      { type: 'health', value: 50, description: 'Restores 50 HP' },
      { type: 'special', value: 100, description: 'Cures Poison status' }
    ]
  },

  // Multi-buff food (L10) - Cooking reward
  {
    itemId: 'frontier-feast',
    name: 'Frontier Feast',
    description: 'A hearty meal of roasted meat, fresh bread, and seasonal vegetables. Restores body and spirit.',
    type: 'consumable',
    rarity: 'rare',
    price: 100,
    sellPrice: 50,
    inShop: false, // Crafting reward only
    levelRequired: 10,
    icon: '🍽️',
    isEquippable: false,
    isConsumable: true,
    isStackable: true,
    maxStack: 20,
    flavorText: '"Nothing beats a proper meal after days on the trail. This is what civilization tastes like."',
    effects: [
      { type: 'health', value: 100, description: 'Restores 100 HP' },
      { type: 'energy', value: 30, description: 'Restores 30 Energy' },
      { type: 'stat', stat: 'combat', value: 3, description: '+3 Combat for 2 hours' },
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit for 2 hours' }
    ]
  }
];

// =============================================================================
// BOSS LOOT (6 items)
// Drops from the three greenhorn bosses
// =============================================================================

export const greenhornBossLoot: Partial<IItem>[] = [
  // Rattlesnake Pete (L5) drops
  {
    itemId: 'snakeskin-boots',
    name: 'Snakeskin Boots',
    description: 'Boots made from the hide of Rattlesnake Pete\'s prized serpents. Surprisingly comfortable.',
    type: 'armor',
    rarity: 'rare',
    price: 300,
    sellPrice: 150,
    inShop: false,
    levelRequired: 5,
    icon: '👢',
    equipSlot: 'feet',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"Made from the snakes that almost killed you. Poetic justice."',
    stats: {
      cunning: 4,
      spirit: 2
    },
    effects: [
      { type: 'stat', stat: 'cunning', value: 4, description: '+4 Cunning' },
      { type: 'stat', stat: 'spirit', value: 2, description: '+2 Spirit' },
      { type: 'special', value: 30, description: '+30% Poison resistance' }
    ]
  },
  {
    itemId: 'antivenom-recipe',
    name: 'Antivenom Recipe',
    description: 'Pete\'s notes on brewing antivenom. Valuable knowledge for any frontier doctor.',
    type: 'quest',
    rarity: 'uncommon',
    price: 0,
    sellPrice: 75,
    inShop: false,
    levelRequired: 5,
    icon: '📜',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"Turns out the snake handler knew how to cure bites too. Ironic."',
    effects: [
      { type: 'special', value: 0, description: 'Unlocks Antivenom crafting recipe' }
    ]
  },

  // The Debt Collector (L10) drops
  {
    itemId: 'collectors-ledger',
    name: "Collector's Ledger",
    description: 'A leather-bound ledger listing debts, names, and... disturbing notes about collections.',
    type: 'quest',
    rarity: 'rare',
    price: 0,
    sellPrice: 100,
    inShop: false,
    levelRequired: 10,
    icon: '📒',
    isEquippable: false,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"The names in this book... some are crossed out. You don\'t want to know what that means."',
    effects: [
      { type: 'special', value: 0, description: 'Quest item - reveals debtor network' }
    ]
  },
  {
    itemId: 'debt-collectors-hat',
    name: "Debt Collector's Hat",
    description: 'A distinctive black bowler hat that commands respect... and fear.',
    type: 'armor',
    rarity: 'rare',
    price: 400,
    sellPrice: 200,
    inShop: false,
    levelRequired: 10,
    icon: '🎩',
    equipSlot: 'head',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"They say when you see this hat coming, you\'d better have the money ready."',
    stats: {
      cunning: 5,
      spirit: 3
    },
    effects: [
      { type: 'stat', stat: 'cunning', value: 5, description: '+5 Cunning' },
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit' },
      { type: 'social_success', value: 15, description: '+15% Intimidation success' }
    ]
  },

  // The Bandit King (L15) drops
  {
    itemId: 'crown-of-the-bandit-king',
    name: 'Crown of the Bandit King',
    description: 'Not a literal crown, but a distinctive hat worn by the self-proclaimed king of outlaws.',
    type: 'armor',
    rarity: 'epic',
    price: 1000,
    sellPrice: 500,
    inShop: false,
    levelRequired: 15,
    icon: '👑',
    equipSlot: 'head',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"Heavy is the head that wears the crown. Heavier still when it\'s been taken by force."',
    stats: {
      combat: 5,
      cunning: 4,
      spirit: 3
    },
    effects: [
      { type: 'stat', stat: 'combat', value: 5, description: '+5 Combat' },
      { type: 'stat', stat: 'cunning', value: 4, description: '+4 Cunning' },
      { type: 'stat', stat: 'spirit', value: 3, description: '+3 Spirit' },
      { type: 'special', value: 20, description: '+20% Gang member loyalty' }
    ]
  },
  {
    itemId: 'bandit-kings-revolver',
    name: "Bandit King's Revolver",
    description: 'A beautifully engraved revolver with a pearl grip. The weapon of the territory\'s most feared outlaw.',
    type: 'weapon',
    rarity: 'epic',
    price: 1500,
    sellPrice: 750,
    inShop: false,
    levelRequired: 15,
    icon: '🔫',
    equipSlot: 'weapon',
    isEquippable: true,
    isConsumable: false,
    isStackable: false,
    maxStack: 1,
    flavorText: '"Six shots. Six bodies. The Bandit King never missed, and neither will you."',
    stats: {
      combat: 8,
      cunning: 2
    },
    effects: [
      { type: 'stat', stat: 'combat', value: 8, description: '+8 Combat' },
      { type: 'stat', stat: 'cunning', value: 2, description: '+2 Cunning' },
      { type: 'combat_score', value: 15, description: '+15% Critical hit chance' }
    ]
  }
];

// =============================================================================
// COMBINED EXPORT
// =============================================================================

export const greenhornGear: Partial<IItem>[] = [
  ...greenhornWeaponsArmor,
  ...greenhornMaterials,
  ...greenhornConsumables,
  ...greenhornBossLoot
];

// Alias for weapons/armor category
export const greenhornWeapons = greenhornWeaponsArmor;
